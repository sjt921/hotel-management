package com.hotel.controller;

import cn.hutool.core.util.StrUtil;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.hotel.common.Result;
import com.hotel.entity.User;
import com.hotel.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    @PostMapping("/login")
    public Result<?> login(@RequestBody User loginUser) {
        if (StrUtil.isBlank(loginUser.getUsername()) || StrUtil.isBlank(loginUser.getPassword())) {
            return Result.error("用户名和密码不能为空");
        }
        User user = userService.login(loginUser.getUsername(), loginUser.getPassword());
        if (user == null) {
            return Result.error("用户名或密码错误");
        }
        // 生成 JWT
        Algorithm algorithm = Algorithm.HMAC256(secret);
        String token = JWT.create()
                .withClaim("userId", user.getId())
                .withClaim("username", user.getUsername())
                .withClaim("role", user.getRole())
                .withExpiresAt(new Date(System.currentTimeMillis() + expiration))
                .sign(algorithm);

        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("user", user);
        return Result.success(data);
    }

    @PostMapping("/register")
    public Result<?> register(@RequestBody User user) {
        if (StrUtil.isBlank(user.getUsername()) || StrUtil.isBlank(user.getPassword())) {
            return Result.error("用户名和密码不能为空");
        }
        boolean success = userService.register(user);
        if (!success) {
            return Result.error("用户名已存在");
        }
        return Result.success("注册成功");
    }

    @GetMapping("/list")
    public Result<?> list() {
        List<User> list = userService.list();
        // 不返回密码
        list.forEach(u -> u.setPassword(null));
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<?> getById(@PathVariable Long id) {
        User user = userService.getById(id);
        if (user != null) {
            user.setPassword(null);
        }
        return Result.success(user);
    }

    @PostMapping
    public Result<?> save(@RequestBody User user) {
        userService.register(user);
        return Result.success("添加成功");
    }

    @PutMapping
    public Result<?> update(@RequestBody User user) {
        if (StrUtil.isNotBlank(user.getPassword())) {
            userService.updateById(user);
        } else {
            // 不修改密码
            user.setPassword(null);
            userService.updateById(user);
        }
        return Result.success("更新成功");
    }

    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable Long id) {
        userService.removeById(id);
        return Result.success("删除成功");
    }
}
