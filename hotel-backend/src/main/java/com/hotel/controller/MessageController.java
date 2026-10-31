package com.hotel.controller;

import com.hotel.common.Result;
import com.hotel.entity.Message;
import com.hotel.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/message")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /** WebSocket: 接收客户端消息并转发 */
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload Message message) {
        message.setIsRead(false);
        message.setCreateTime(LocalDateTime.now());
        messageService.save(message);

        // 推送给接收方（前端/管理端各自订阅自己的队列）
        if ("admin".equals(message.getReceiverRole())) {
            messagingTemplate.convertAndSend("/topic/admin", message);
            // 同时推送给新消息通知
            messagingTemplate.convertAndSend("/topic/admin/notification", message);
        } else {
            // 推送给特定用户会话
            messagingTemplate.convertAndSend("/topic/user/" + message.getSessionId(), message);
        }
    }

    /** 获取历史聊天记录 */
    @GetMapping("/history")
    public Result<?> getHistory(@RequestParam String sessionId) {
        List<Message> list = messageService.getChatHistory(sessionId);
        return Result.success(list);
    }

    /** 获取会话列表（管理端），返回 [{sessionId, userName}] */
    @GetMapping("/sessions")
    public Result<?> getSessions() {
        return Result.success(messageService.getSessionList());
    }

    /** 标记已读 */
    @PutMapping("/read/{id}")
    public Result<?> markRead(@PathVariable Long id) {
        messageService.markAsRead(id);
        return Result.success();
    }

    /** 获取未读消息数 */
    @GetMapping("/unread")
    public Result<?> getUnread(@RequestParam(defaultValue = "admin") String receiverRole) {
        Long count = messageService.getUnreadCount(receiverRole);
        return Result.success(count);
    }
}
