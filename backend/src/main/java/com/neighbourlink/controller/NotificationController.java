package com.neighbourlink.controller;

import com.neighbourlink.dto.NotificationItemDto;
import com.neighbourlink.dto.NotificationMarkAllReadResponseDto;
import com.neighbourlink.service.NotificationService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/{userId}/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationItemDto> listNotifications(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "false") boolean unreadOnly
    ) {
        return notificationService.getNotificationsForUser(userId, unreadOnly);
    }

    @PatchMapping("/{notificationId}/read")
    public NotificationItemDto markAsRead(@PathVariable Long userId, @PathVariable Long notificationId) {
        return notificationService.markAsRead(userId, notificationId);
    }

    @PatchMapping("/read-all")
    public NotificationMarkAllReadResponseDto markAllAsRead(@PathVariable Long userId) {
        return notificationService.markAllAsRead(userId);
    }
}
