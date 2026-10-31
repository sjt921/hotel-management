package com.hotel.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("booking")
public class Booking {
    @TableId(type = IdType.AUTO)
    private Long id;
    /** 客户ID */
    private Long customerId;
    /** 房间ID */
    private Long roomId;
    /** 创建该预订的用户ID */
    private Long userId;
    /** 入住日期 */
    private LocalDate checkInDate;
    /** 退房日期 */
    private LocalDate checkOutDate;
    /**
     * 状态: pending-待确认, confirmed-已确认,
     *       checked_in-已入住, checked_out-已退房, cancelled-已取消
     */
    private String status;
    /** 总价 */
    private BigDecimal totalPrice;
    /** 备注 */
    private String remark;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    // ===== 以下为展示字段，不映射数据库 =====
    @TableField(exist = false)
    private String customerName;
    @TableField(exist = false)
    private String customerPhone;
    @TableField(exist = false)
    private String roomNumber;
    @TableField(exist = false)
    private String roomTypeName;
}
