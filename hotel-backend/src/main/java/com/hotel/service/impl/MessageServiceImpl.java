package com.hotel.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hotel.entity.Message;
import com.hotel.entity.User;
import com.hotel.mapper.MessageMapper;
import com.hotel.mapper.UserMapper;
import com.hotel.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class MessageServiceImpl extends ServiceImpl<MessageMapper, Message> implements MessageService {

    @Autowired
    private UserMapper userMapper;

    @Override
    public List<Message> getChatHistory(String sessionId) {
        LambdaQueryWrapper<Message> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Message::getSessionId, sessionId)
               .orderByAsc(Message::getCreateTime);
        return this.list(wrapper);
    }

    @Override
    public void markAsRead(Long messageId) {
        Message msg = this.getById(messageId);
        if (msg != null && !msg.getIsRead()) {
            msg.setIsRead(true);
            this.updateById(msg);
        }
    }

    @Override
    public Long getUnreadCount(String receiverRole) {
        LambdaQueryWrapper<Message> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Message::getReceiverRole, receiverRole)
               .eq(Message::getIsRead, false);
        return this.count(wrapper);
    }

    @Override
    public List<Map<String, String>> getSessionList() {
        // 按会话分组，并取每个会话的最后消息时间用于排序
        // 注意：必须用聚合函数 MAX(create_time)，否则在 MySQL 8.0 的
        // only_full_group_by 模式下会报 "not in GROUP BY clause" 错误
        QueryWrapper<Message> wrapper = new QueryWrapper<>();
        wrapper.select("session_id AS sessionId", "MAX(create_time) AS lastTime")
               .isNotNull("session_id")
               .ne("session_id", "")
               .groupBy("session_id")
               .orderByDesc("lastTime");
        List<Map<String, Object>> rows = this.listMaps(wrapper);

        List<Map<String, String>> result = new ArrayList<>();
        for (Map<String, Object> row : rows) {
            Object sidObj = row.get("sessionId");
            if (sidObj == null) continue;
            String sessionId = sidObj.toString();
            if (sessionId.isEmpty()) continue;
            Map<String, String> info = new HashMap<>();
            info.put("sessionId", sessionId);
            info.put("userName", resolveUserName(sessionId));
            result.add(info);
        }
        return result;
    }

    /** 根据 sessionId 解析显示用的用户名 */
    private String resolveUserName(String sessionId) {
        if (sessionId == null) return "未知用户";
        // sessionId 格式: user_{userId}
        if (sessionId.startsWith("user_")) {
            try {
                Long userId = Long.parseLong(sessionId.substring(5));
                User user = userMapper.selectById(userId);
                if (user != null && user.getRealName() != null && !user.getRealName().isEmpty()) {
                    return user.getRealName();
                }
                if (user != null) {
                    return user.getUsername();
                }
            } catch (NumberFormatException e) {
                // 不是数字ID，可能直接是用户名
            }
        }
        // 回退：尝试用 sessionId 本身作为名字
        return sessionId;
    }
}
