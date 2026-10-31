package com.hotel.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.hotel.common.Result;
import com.hotel.entity.Customer;
import com.hotel.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @GetMapping("/list")
    public Result<?> list(@RequestParam(required = false) String name,
                          @RequestParam(required = false) String phone) {
        LambdaQueryWrapper<Customer> wrapper = new LambdaQueryWrapper<>();
        if (name != null && !name.isEmpty()) {
            wrapper.like(Customer::getName, name);
        }
        if (phone != null && !phone.isEmpty()) {
            wrapper.like(Customer::getPhone, phone);
        }
        wrapper.orderByDesc(Customer::getCreateTime);
        List<Customer> list = customerService.list(wrapper);
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<?> getById(@PathVariable Long id) {
        return Result.success(customerService.getById(id));
    }

    @PostMapping
    public Result<?> save(@RequestBody Customer customer) {
        customerService.save(customer);
        return Result.success("添加成功");
    }

    @PutMapping
    public Result<?> update(@RequestBody Customer customer) {
        customerService.updateById(customer);
        return Result.success("更新成功");
    }

    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable Long id) {
        customerService.removeById(id);
        return Result.success("删除成功");
    }
}
