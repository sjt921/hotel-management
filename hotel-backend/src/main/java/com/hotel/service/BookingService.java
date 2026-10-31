package com.hotel.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hotel.entity.Booking;

public interface BookingService extends IService<Booking> {
    boolean checkIn(Long bookingId);
    boolean checkOut(Long bookingId);
    boolean cancel(Long bookingId);
}
