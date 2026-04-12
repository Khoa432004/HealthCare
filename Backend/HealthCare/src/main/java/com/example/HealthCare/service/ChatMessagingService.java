package com.example.HealthCare.service;

import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.HealthCare.dto.request.GetChatMessagesRequest;
import com.example.HealthCare.dto.request.SendChatMessageRequest;
import com.example.HealthCare.dto.response.ChatMessageGroupDto;
import com.example.HealthCare.dto.response.ChatMessageItemDto;
import com.example.HealthCare.dto.response.ChatPeerDto;
import com.example.HealthCare.dto.response.ChatUserBriefDto;
import com.example.HealthCare.enums.AccountStatus;
import com.example.HealthCare.enums.ChatMessageType;
import com.example.HealthCare.enums.UserRole;
import com.example.HealthCare.model.ChatMessage;
import com.example.HealthCare.model.ChatThread;
import com.example.HealthCare.model.UserAccount;
import com.example.HealthCare.repository.AppointmentRepository;
import com.example.HealthCare.repository.ChatMessageRepository;
import com.example.HealthCare.repository.ChatThreadRepository;
import com.example.HealthCare.repository.UserAccountRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatMessagingService {

	private static final DateTimeFormatter DATE_KEY = DateTimeFormatter.ISO_LOCAL_DATE;

	private final ChatThreadRepository chatThreadRepository;
	private final ChatMessageRepository chatMessageRepository;
	private final UserAccountRepository userAccountRepository;
	private final AppointmentRepository appointmentRepository;
	private final ChatRealtimeService chatRealtimeService;

	@Transactional
	public UUID sendMessage(UUID currentUserId, SendChatMessageRequest request) {
		UUID receiverId = UUID.fromString(request.getReceiverId().trim());
		if (receiverId.equals(currentUserId)) {
			throw new IllegalArgumentException("Cannot message yourself");
		}
		UserAccount receiver = userAccountRepository.findByIdAndIsDeletedFalse(receiverId)
				.orElseThrow(() -> new IllegalArgumentException("Receiver not found"));

		if (receiver.getStatus() != AccountStatus.ACTIVE) {
			throw new IllegalArgumentException("Receiver account is not active");
		}

		ChatThread thread = chatThreadRepository.findBetweenUsers(currentUserId, receiverId)
				.orElseGet(() -> chatThreadRepository.save(ChatThread.builder()
						.firstUserId(currentUserId)
						.secondUserId(receiverId)
						.build()));

		ChatMessageType type = ChatMessageType.fromClient(request.getType());
		ChatMessage message = ChatMessage.builder()
				.chatId(thread.getId())
				.content(request.getContent())
				.type(type)
				.creatorId(currentUserId)
				.build();
		message = chatMessageRepository.save(message);

		thread.setLastMessageId(message.getId());
		chatThreadRepository.save(thread);

		chatRealtimeService.broadcastChatMessage(
				currentUserId,
				receiverId,
				message.getId(),
				message.getContent(),
				type.toJsonValue());

		return message.getId();
	}

	@Transactional(readOnly = true)
	public List<ChatMessageGroupDto> getMessagesGroupedByDate(UUID currentUserId, GetChatMessagesRequest request) {
		UUID receiverId = UUID.fromString(request.getReceiverId().trim());
		Optional<ChatThread> threadOpt = chatThreadRepository.findBetweenUsers(currentUserId, receiverId);
		if (threadOpt.isEmpty()) {
			return List.of();
		}

		List<ChatMessage> messages = chatMessageRepository.findByChatIdOrderByCreatedAtAsc(threadOpt.get().getId());
		if (messages.isEmpty()) {
			return List.of();
		}

		List<UUID> creatorIds = messages.stream().map(ChatMessage::getCreatorId).distinct().toList();
		Map<UUID, UserAccount> creators = userAccountRepository.findAllById(creatorIds).stream()
				.filter(u -> !Boolean.TRUE.equals(u.getIsDeleted()))
				.collect(Collectors.toMap(UserAccount::getId, u -> u));

		Map<String, List<ChatMessageItemDto>> byDate = new LinkedHashMap<>();
		for (ChatMessage m : messages) {
			LocalDate day = m.getCreatedAt().toLocalDate();
			String key = DATE_KEY.format(day);
			UserAccount creator = creators.get(m.getCreatorId());
			ChatUserBriefDto creatorDto = ChatUserBriefDto.builder()
					.id(m.getCreatorId())
					.fullName(creator != null ? creator.getFullName() : "Unknown")
					.gender(creator != null && creator.getGender() != null ? creator.getGender().getValue() : "")
					.build();
			ChatMessageItemDto item = ChatMessageItemDto.builder()
					.id(m.getId())
					.content(m.getContent())
					.type(m.getType().toJsonValue())
					.creator(creatorDto)
					.createdAt(m.getCreatedAt())
					.build();
			byDate.computeIfAbsent(key, k -> new ArrayList<>()).add(item);
		}

		return byDate.entrySet().stream()
				.sorted(Comparator.comparing(Map.Entry::getKey))
				.map(e -> ChatMessageGroupDto.builder().date(e.getKey()).messages(e.getValue()).build())
				.toList();
	}

	@Transactional(readOnly = true)
	public List<ChatPeerDto> listPeers(UUID currentUserId) {
		UserAccount me = userAccountRepository.findByIdAndIsDeletedFalse(currentUserId)
				.orElseThrow(() -> new IllegalArgumentException("User not found"));
		UserRole role = me.getRole();
		if (role == UserRole.DOCTOR) {
			return peersForDoctor(currentUserId);
		}
		return peersDoctorsForPatientOrAdmin();
	}

	private List<ChatPeerDto> peersDoctorsForPatientOrAdmin() {
		return userAccountRepository.findAllByRoleAndStatusAndIsDeletedFalse(UserRole.DOCTOR, AccountStatus.ACTIVE)
				.stream()
				.map(this::toPeerDto)
				.filter(Objects::nonNull)
				.sorted(Comparator.comparing(ChatPeerDto::getFullName, String.CASE_INSENSITIVE_ORDER))
				.toList();
	}

	private List<ChatPeerDto> peersForDoctor(UUID doctorId) {
		List<ChatPeerDto> admins = userAccountRepository.findAllByRoleAndStatusAndIsDeletedFalse(UserRole.ADMIN, AccountStatus.ACTIVE)
				.stream()
				.map(this::toPeerDto)
				.filter(Objects::nonNull)
				.sorted(Comparator.comparing(ChatPeerDto::getFullName, String.CASE_INSENSITIVE_ORDER))
				.toList();

		List<UUID> patientIds = appointmentRepository.findDistinctPatientIdsByDoctorId(doctorId);
		List<ChatPeerDto> patients = List.of();
		if (!patientIds.isEmpty()) {
			Map<UUID, UserAccount> map = userAccountRepository.findAllById(patientIds).stream()
					.filter(u -> !Boolean.TRUE.equals(u.getIsDeleted()))
					.collect(Collectors.toMap(UserAccount::getId, u -> u));
			patients = patientIds.stream()
					.map(map::get)
					.filter(Objects::nonNull)
					.map(this::toPeerDto)
					.filter(Objects::nonNull)
					.sorted(Comparator.comparing(ChatPeerDto::getFullName, String.CASE_INSENSITIVE_ORDER))
					.toList();
		}
		List<ChatPeerDto> out = new ArrayList<>(admins.size() + patients.size());
		out.addAll(admins);
		out.addAll(patients);
		return out;
	}

	private ChatPeerDto toPeerDto(UserAccount u) {
		if (u == null) {
			return null;
		}
		return ChatPeerDto.builder()
				.id(u.getId())
				.fullName(u.getFullName())
				.gender(u.getGender() != null ? u.getGender().getValue() : "")
				.age(u.getDateOfBirth() != null ? Period.between(u.getDateOfBirth(), LocalDate.now()).getYears() : null)
				.avatarUrl(null)
				.build();
	}
}
