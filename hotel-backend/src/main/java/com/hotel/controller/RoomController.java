package com.hotel.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hotel.common.Result;
import com.hotel.entity.Room;
import com.hotel.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/room")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @GetMapping("/list")
    public Result<?> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String roomNumber,
            @RequestParam(required = false) String status) {
        Page<Room> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Room> wrapper = new LambdaQueryWrapper<>();
        if (roomNumber != null && !roomNumber.isEmpty()) {
            wrapper.like(Room::getRoomNumber, roomNumber);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(Room::getStatus, status);
        }
        wrapper.orderByAsc(Room::getRoomNumber);
        return Result.success(roomService.page(page, wrapper));
    }

    @GetMapping("/{id}")
    public Result<?> getById(@PathVariable Long id) {
        return Result.success(roomService.getById(id));
    }

    @GetMapping("/available")
    public Result<?> getAvailable() {
        LambdaQueryWrapper<Room> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Room::getStatus, "available");
        wrapper.orderByAsc(Room::getRoomNumber);
        return Result.success(roomService.list(wrapper));
    }

    @PostMapping
    public Result<?> save(@RequestBody Room room) {
        if (room.getStatus() == null) {
            room.setStatus("available");
        }
        roomService.save(room);
        return Result.success("添加成功");
    }

    @PutMapping
    public Result<?> update(@RequestBody Room room) {
        roomService.updateById(room);
        return Result.success("更新成功");
    }

    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable Long id) {
        roomService.removeById(id);
        return Result.success("删除成功");
    }
}
