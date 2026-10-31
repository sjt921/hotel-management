package com.hotel.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("customer")
public class Customer {
    @TableId(type = IdType.AUTO)
    private Long id;
    /** 姓名 */
    private String name;
    /** 身份证号 */
    private String idCard;
    /** 手机号 */
    private String phone;
    /** 性别: 男/女 */
    private String gender;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
