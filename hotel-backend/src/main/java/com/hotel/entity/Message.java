package com.hotel.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("message")
public class Message {
    @TableId(type = IdType.AUTO)
    private Long id;
    /** 发送者: user-客户, admin-管理员(前台) */
    private String senderRole;
    /** 发送者名称 */
    private String senderName;
    /** 接收者角色 */
    private String receiverRole;
    /** 消息内容 */
    private String content;
    /** 是否已读 */
    private Boolean isRead;
    /** 会话ID，用于区分不同用户 */
    private String sessionId;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
