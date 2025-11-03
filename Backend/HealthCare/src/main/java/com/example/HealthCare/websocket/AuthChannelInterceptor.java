package com.example.HealthCare.websocket;

import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import com.example.HealthCare.model.UserAccount;
import com.example.HealthCare.repository.UserAccountRepository;
import com.example.HealthCare.security.JwtUtil;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class AuthChannelInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;
    private final UserAccountRepository userAccountRepository;
    private final NotificationWebSocketService notificationWebSocketService;

    public AuthChannelInterceptor(JwtUtil jwtUtil, UserAccountRepository userAccountRepository, 
                                   @Lazy NotificationWebSocketService notificationWebSocketService) {
        this.jwtUtil = jwtUtil;
        this.userAccountRepository = userAccountRepository;
        this.notificationWebSocketService = notificationWebSocketService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor != null) {
            if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                String token = accessor.getFirstNativeHeader("token");
                if (token == null) {
                    Object sessionToken = accessor.getSessionAttributes().get("token");
                    if (sessionToken != null) {
                        token = sessionToken.toString();
                    }
                }
                
                if (token != null && !token.isEmpty()) {
                    try {
                        String email = jwtUtil.extractEmail(token);
                        if (email != null) {
                            UserAccount user = userAccountRepository.findByEmailAndIsDeletedFalse(email).orElse(null);
                            if (user != null && jwtUtil.isTokenValid(token, user)) {
                                UUID userId = user.getId();
                                
                                accessor.getSessionAttributes().put("userId", userId);
                                accessor.getSessionAttributes().put("email", email);
                                notificationWebSocketService.addUserSession(userId);
                            }
                        }
                    } catch (Exception e) {
                        log.error("Error during WebSocket authentication: {}", e.getMessage());
                    }
                }
            } else if (StompCommand.DISCONNECT.equals(accessor.getCommand())) {
                Object userIdObj = accessor.getSessionAttributes().get("userId");
                if (userIdObj instanceof UUID) {
                    UUID userId = (UUID) userIdObj;
                    notificationWebSocketService.removeUserSession(userId);
                }
            }
        }
        
        return message;
    }

    @Override
    public void postSend(Message<?> message, MessageChannel channel, boolean sent) {
    }

    @Override
    public void afterSendCompletion(Message<?> message, MessageChannel channel, boolean sent, Exception ex) {
    }

    @Override
    public boolean preReceive(MessageChannel channel) {
        return true;
    }

    @Override
    public Message<?> postReceive(Message<?> message, MessageChannel channel) {
        return message;
    }

    @Override
    public void afterReceiveCompletion(Message<?> message, MessageChannel channel, Exception ex) {
    }
}

