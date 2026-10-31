package com.hotel.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hotel.common.Result;
import com.hotel.entity.Booking;
import com.hotel.entity.Room;
import com.hotel.entity.RoomType;
import com.hotel.service.BookingService;
import com.hotel.service.RoomService;
import com.hotel.service.RoomTypeService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@RestController
@RequestMapping("/api/booking")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private RoomService roomService;

    @Autowired
    private RoomTypeService roomTypeService;

    @Autowired
    private com.hotel.service.CustomerService customerService;

    @Autowired
    private HttpServletRequest request;

    private Long getCurrentUserId() {
        return (Long) request.getAttribute("userId");
    }

    private boolean isAdmin() {
        return "admin".equals(request.getAttribute("role"));
    }

    @GetMapping("/list")
    public Result<?> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String status) {
        Page<Booking> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Booking> wrapper = new LambdaQueryWrapper<>();
        if (status != null && !status.isEmpty()) {
            wrapper.eq(Booking::getStatus, status);
        }
        if (!isAdmin()) {
            wrapper.eq(Booking::getUserId, getCurrentUserId());
        }
        wrapper.orderByDesc(Booking::getCreateTime);
        Page<Booking> result = bookingService.page(page, wrapper);
        // 填充客户名和房间信息
        for (Booking b : result.getRecords()) {
            enrichBooking(b);
        }
        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<?> getById(@PathVariable Long id) {
        Booking booking = bookingService.getById(id);
        if (booking == null) return Result.error("预订不存在");
        if (!isAdmin() && !booking.getUserId().equals(getCurrentUserId())) {
            return Result.error(403, "无权查看该预订");
        }
        enrichBooking(booking);
        return Result.success(booking);
    }

    /** 用户下单：选房型，自动分配空闲房间 */
    @PostMapping
    @Transactional
    public Result<?> save(@RequestBody Booking booking) {
        // roomTypeId 由前端传入，后端自动找空闲房间
        Long roomTypeId = booking.getRoomId(); // 前端复用 roomId 字段传 roomTypeId
        // 查找该房型下的空闲房间
        LambdaQueryWrapper<Room> roomWrapper = new LambdaQueryWrapper<>();
        roomWrapper.eq(Room::getRoomTypeId, roomTypeId)
                   .eq(Room::getStatus, "available")
                   .orderByAsc(Room::getRoomNumber)
                   .last("LIMIT 1");
        Room room = roomService.getOne(roomWrapper);
        if (room == null) {
            return Result.error("该房型暂无空闲房间");
        }
        long days = ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());
        if (days <= 0) {
            return Result.error("退房日期必须晚于入住日期");
        }
        // 用房型价格计算总价
        RoomType roomType = roomTypeService.getById(roomTypeId);
        BigDecimal price = roomType != null ? roomType.getPrice() : BigDecimal.valueOf(200);
        booking.setTotalPrice(price.multiply(BigDecimal.valueOf(days)));
        // 设置实际房间ID
        booking.setRoomId(room.getId());
        booking.setStatus("pending");
        booking.setUserId(getCurrentUserId());
        bookingService.save(booking);

        // 房间改为已预订
        room.setStatus("reserved");
        roomService.updateById(room);

        return Result.success("下单成功，等待管理员确认");
    }

    @PutMapping
    @Transactional
    public Result<?> update(@RequestBody Booking booking) {
        Booking exist = bookingService.getById(booking.getId());
        if (exist == null) return Result.error("预订不存在");
        if (!isAdmin() && !exist.getUserId().equals(getCurrentUserId())) {
            return Result.error(403, "无权修改该预订");
        }

        // 如果状态改为 confirmed，房间变为已入住
        if ("confirmed".equals(booking.getStatus()) && !"confirmed".equals(exist.getStatus())) {
            Room room = roomService.getById(exist.getRoomId());
            if (room != null) {
                room.setStatus("occupied");
                roomService.updateById(room);
            }
        }

        bookingService.updateById(booking);
        return Result.success("更新成功");
    }

    @PutMapping("/checkIn/{id}")
    @Transactional
    public Result<?> checkIn(@PathVariable Long id) {
        Booking booking = bookingService.getById(id);
        if (booking == null) return Result.error("预订不存在");

        booking.setStatus("checked_in");
        bookingService.updateById(booking);

        Room room = roomService.getById(booking.getRoomId());
        if (room != null) {
            room.setStatus("occupied");
            roomService.updateById(room);
        }
        return Result.success("入住成功");
    }

    @PutMapping("/checkOut/{id}")
    @Transactional
    public Result<?> checkOut(@PathVariable Long id) {
        Booking booking = bookingService.getById(id);
        if (booking == null) return Result.error("预订不存在");
        if (!"checked_in".equals(booking.getStatus())) {
            return Result.error("当前状态无法退房");
        }
        booking.setStatus("checked_out");
        bookingService.updateById(booking);

        Room room = roomService.getById(booking.getRoomId());
        if (room != null) {
            room.setStatus("available");
            roomService.updateById(room);
        }
        return Result.success("退房成功");
    }

    @PutMapping("/cancel/{id}")
    @Transactional
    public Result<?> cancel(@PathVariable Long id) {
        Booking booking = bookingService.getById(id);
        if (booking == null) return Result.error("预订不存在");
        if (!isAdmin() && !booking.getUserId().equals(getCurrentUserId())) {
            return Result.error(403, "无权取消该预订");
        }
        if (!isAdmin() && !canCancelOrDelete(booking)) {
            return Result.error("距离入住时间不足10小时，不可取消预订");
        }
        booking.setStatus("cancelled");
        bookingService.updateById(booking);

        // 释放房间
        Room room = roomService.getById(booking.getRoomId());
        if (room != null && "reserved".equals(room.getStatus())) {
            room.setStatus("available");
            roomService.updateById(room);
        }
        return Result.success("取消成功");
    }

    @DeleteMapping("/{id}")
    @Transactional
    public Result<?> delete(@PathVariable Long id) {
        Booking booking = bookingService.getById(id);
        if (booking == null) return Result.error("预订不存在");
        if (!isAdmin() && !booking.getUserId().equals(getCurrentUserId())) {
            return Result.error(403, "无权删除该预订");
        }
        if (!isAdmin() && !canCancelOrDelete(booking)) {
            return Result.error("距离入住时间不足10小时，不可删除预订");
        }
        // 释放房间
        Room room = roomService.getById(booking.getRoomId());
        if (room != null && "reserved".equals(room.getStatus())) {
            room.setStatus("available");
            roomService.updateById(room);
        }
        bookingService.removeById(id);
        return Result.success("删除成功");
    }

    private boolean canCancelOrDelete(Booking booking) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime checkInTime = booking.getCheckInDate().atTime(14, 0);
        long hoursUntilCheckIn = Duration.between(now, checkInTime).toHours();
        return hoursUntilCheckIn > 10;
    }

    /** 填充预订的客户名、房间号、房型名等展示信息 */
    private void enrichBooking(Booking b) {
        if (b.getCustomerId() != null) {
            var customer = customerService.getById(b.getCustomerId());
            if (customer != null) {
                b.setCustomerName(customer.getName());
                b.setCustomerPhone(customer.getPhone());
            }
        }
        if (b.getRoomId() != null) {
            Room room = roomService.getById(b.getRoomId());
            if (room != null) {
                b.setRoomNumber(room.getRoomNumber());
                if (room.getRoomTypeId() != null) {
                    RoomType rt = roomTypeService.getById(room.getRoomTypeId());
                    if (rt != null) {
                        b.setRoomTypeName(rt.getName());
                    }
                }
            }
        }
    }
}
