package com.neighbourlink.service;

import com.neighbourlink.dto.NotificationItemDto;
import com.neighbourlink.dto.NotificationMarkAllReadResponseDto;
import com.neighbourlink.entity.Notification;
import com.neighbourlink.entity.User;
import com.neighbourlink.repository.NotificationRepository;
import com.neighbourlink.repository.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import javax.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void createNotification(User recipient, String type, String title, String message, Long relatedRideMatchId) {
        if (recipient == null || recipient.getId() == null) {
            return;
        }
        String normalizedType = normalizeRequired(type, "type is required");
        String normalizedTitle = normalizeRequired(title, "title is required");
        String normalizedMessage = normalizeRequired(message, "message is required");

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setType(normalizedType);
        notification.setTitle(normalizedTitle);
        notification.setMessage(normalizedMessage);
        notification.setRelatedRideMatchId(relatedRideMatchId);
        notification.setRead(Boolean.FALSE);
        notificationRepository.save(notification);
    }

    public List<NotificationItemDto> getNotificationsForUser(Long userId, boolean unreadOnly) {
        validateUserId(userId);
        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        List<Notification> notifications = unreadOnly
                ? notificationRepository.findByRecipientIdAndReadOrderByCreatedAtDesc(userId, Boolean.FALSE)
                : notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
        return notifications.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public NotificationItemDto markAsRead(Long userId, Long notificationId) {
        validateUserId(userId);
        if (notificationId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "notificationId is required");
        }
        Notification notification = notificationRepository.findByIdAndRecipientId(notificationId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        notification.setRead(Boolean.TRUE);
        return toDto(notificationRepository.save(notification));
    }

    @Transactional
    public NotificationMarkAllReadResponseDto markAllAsRead(Long userId) {
        validateUserId(userId);
        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        int updated = notificationRepository.markAllReadByRecipientId(userId);
        return new NotificationMarkAllReadResponseDto(updated);
    }

    private NotificationItemDto toDto(Notification notification) {
        return new NotificationItemDto(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getRelatedRideMatchId(),
                notification.getRead(),
                notification.getCreatedAt()
        );
    }

    private void validateUserId(Long userId) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId is required");
        }
    }

    private String normalizeRequired(String value, String message) {
        if (value == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        String trimmed = value.trim();
        if (trimmed.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return trimmed;
    }
}
