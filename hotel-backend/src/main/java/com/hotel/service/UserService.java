package com.hotel.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hotel.entity.User;

public interface UserService extends IService<User> {
    User login(String username, String password);
    boolean register(User user);
}
