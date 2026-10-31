package com.hotel.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("room")
public class Room {
    @TableId(type = IdType.AUTO)
    private Long id;
    /** 房间号 */
    private String roomNumber;
    /** 房型ID */
    private Long roomTypeId;
    /** 楼层 */
    private Integer floor;
    /** 状态: available-空闲, occupied-已入住, reserved-已预订, cleaning-打扫中 */
    private String status;
    private String description;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
