package com.example.HealthCare.websocket;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.example.HealthCare.dto.response.NotificationResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;
    private final ConcurrentMap<UUID, Integer> userSessionCount = new ConcurrentHashMap<>();

    public void sendNotificationToUser(UUID userId, NotificationResponse notification) {
        try {
            String userDestination = "/topic/notifications/" + userId;
            messagingTemplate.convertAndSend(userDestination, notification);
        } catch (Exception e) {
            log.error("Error sending WebSocket notification to user {}: {}", userId, e.getMessage());
        }
    }

    public void sendUnreadCountToUser(UUID userId, Long unreadCount) {
        try {
            String userDestination = "/topic/notifications/" + userId + "/count";
            messagingTemplate.convertAndSend(userDestination, unreadCount);
        } catch (Exception e) {
            log.error("Error sending unread count to user {}: {}", userId, e.getMessage());
        }
    }

    public void addUserSession(UUID userId) {
        userSessionCount.compute(userId, (key, count) -> count == null ? 1 : count + 1);
    }

    public void removeUserSession(UUID userId) {
        userSessionCount.computeIfPresent(userId, (key, count) -> {
            int newCount = count - 1;
            if (newCount <= 0) {
                return null;
            }
            return newCount;
        });
    }

    public boolean hasActiveSession(UUID userId) {
        return userSessionCount.containsKey(userId) && userSessionCount.get(userId) > 0;
    }
}

