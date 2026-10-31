package com.hotel.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.hotel.common.Result;
import com.hotel.entity.RoomType;
import com.hotel.service.RoomTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roomType")
public class RoomTypeController {

    @Autowired
    private RoomTypeService roomTypeService;

    @GetMapping("/list")
    public Result<?> list(@RequestParam(required = false) String name) {
        LambdaQueryWrapper<RoomType> wrapper = new LambdaQueryWrapper<>();
        if (name != null && !name.isEmpty()) {
            wrapper.like(RoomType::getName, name);
        }
        wrapper.orderByDesc(RoomType::getCreateTime);
        List<RoomType> list = roomTypeService.list(wrapper);
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<?> getById(@PathVariable Long id) {
        return Result.success(roomTypeService.getById(id));
    }

    @PostMapping
    public Result<?> save(@RequestBody RoomType roomType) {
        roomTypeService.save(roomType);
        return Result.success("添加成功");
    }

    @PutMapping
    public Result<?> update(@RequestBody RoomType roomType) {
        roomTypeService.updateById(roomType);
        return Result.success("更新成功");
    }

    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable Long id) {
        roomTypeService.removeById(id);
        return Result.success("删除成功");
    }
}
