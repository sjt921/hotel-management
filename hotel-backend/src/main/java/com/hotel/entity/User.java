package com.hotel.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("user")
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String username;
    private String password;
    private String realName;
    private String phone;
    private String email;
    /** 角色: admin-管理员, user-用户 */
    private String role;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
