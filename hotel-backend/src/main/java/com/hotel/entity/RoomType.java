package com.hotel.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("room_type")
public class RoomType {
    @TableId(type = IdType.AUTO)
    private Long id;
    /** 房型名称: 标准间/大床房/套房等 */
    private String name;
    private String description;
    /** 单价 */
    private BigDecimal price;
    /** 床型: 大床/双床 */
    private String bedType;
    /** 面积(平方米) */
    private Integer area;
    /** 可住人数 */
    private Integer capacity;
    /** 封面图片URL */
    private String image;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
