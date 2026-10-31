package com.hotel.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hotel.entity.Booking;
import com.hotel.entity.Room;
import com.hotel.mapper.BookingMapper;
import com.hotel.service.BookingService;
import com.hotel.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingServiceImpl extends ServiceImpl<BookingMapper, Booking> implements BookingService {

    @Autowired
    private RoomService roomService;

    @Override
    @Transactional
    public boolean checkIn(Long bookingId) {
        Booking booking = this.getById(bookingId);
        if (booking == null || !"confirmed".equals(booking.getStatus())) {
            return false;
        }
        booking.setStatus("checked_in");
        this.updateById(booking);

        // 更新房间状态为已入住
        Room room = roomService.getById(booking.getRoomId());
        if (room != null) {
            room.setStatus("occupied");
            roomService.updateById(room);
        }
        return true;
    }

    @Override
    @Transactional
    public boolean checkOut(Long bookingId) {
        Booking booking = this.getById(bookingId);
        if (booking == null || !"checked_in".equals(booking.getStatus())) {
            return false;
        }
        booking.setStatus("checked_out");
        this.updateById(booking);

        // 更新房间状态为空闲
        Room room = roomService.getById(booking.getRoomId());
        if (room != null) {
            room.setStatus("available");
            roomService.updateById(room);
        }
        return true;
    }

    @Override
    @Transactional
    public boolean cancel(Long bookingId) {
        Booking booking = this.getById(bookingId);
        if (booking == null) {
            return false;
        }
        booking.setStatus("cancelled");
        this.updateById(booking);

        // 如果房间是已预订状态，恢复为空闲
        Room room = roomService.getById(booking.getRoomId());
        if (room != null && "reserved".equals(room.getStatus())) {
            room.setStatus("available");
            roomService.updateById(room);
        }
        return true;
    }
}
