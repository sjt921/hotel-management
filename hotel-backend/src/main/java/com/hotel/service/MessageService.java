package com.hotel.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hotel.entity.Message;
import java.util.List;
import java.util.Map;

public interface MessageService extends IService<Message> {
    /** 获取某个会话的历史消息 */
    List<Message> getChatHistory(String sessionId);
    /** 标记消息为已读 */
    void markAsRead(Long messageId);
    /** 获取未读消息数 */
    Long getUnreadCount(String receiverRole);
    /** 获取所有会话列表（管理端），返回 sessionId + userName */
    List<Map<String, String>> getSessionList();
}
