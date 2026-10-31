# 酒店管理预订系统

基于 Spring Boot + Vue 3 的酒店管理预订系统。

## 技术栈

### 后端
- Spring Boot 2.7.18
- MyBatis-Plus 3.5.3.1
- MySQL 8.0
- JWT 认证
- Hutool 工具库
- Lombok

### 前端
- Vue 3 (组合式 API)
- Element Plus UI 组件库
- Vue Router 4
- Pinia 状态管理
- Axios HTTP 客户端
- Vite 构建工具

## 功能模块

| 模块 | 功能说明 |
|------|---------|
| 控制台 | 系统概览，统计数据展示 |
| 房型管理 | 房型的增删改查 |
| 房间管理 | 房间的增删改查，状态管理 |
| 预订管理 | 预订的增删改查，入住/退房/取消 |
| 客户管理 | 客户信息的增删改查 |
| 用户管理 | 系统用户的增删改查(管理员) |

## 快速开始

### 1. 数据库初始化

使用 MySQL 客户端执行以下 SQL 文件：

```
hotel-backend/src/main/resources/sql/init.sql
```

数据库配置：
- 数据库名：`hotel_db`
- 用户名：`root`
- 密码：`123456`

### 2. 启动后端

用 IDEA 打开 `hotel-backend` 目录，运行 `HotelApplication.java` 主类。

后端运行在 `http://localhost:8088`

### 3. 启动前端

```bash
cd hotel-frontend
npm install
npm run dev
```

前端运行在 `http://localhost:3000`

### 4. 访问系统

打开浏览器访问 `http://localhost:3000`

默认管理员账号：
- 用户名：`admin`
- 密码：`123456`

## 项目结构

```
hotel-management/
├── hotel-backend/                    # Spring Boot 后端
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/hotel/
│       │   ├── HotelApplication.java # 启动类
│       │   ├── common/Result.java    # 统一响应
│       │   ├── config/               # 配置类
│       │   ├── controller/           # REST 控制器
│       │   ├── entity/               # 实体类
│       │   ├── interceptor/          # JWT 拦截器
│       │   ├── mapper/               # MyBatis Mapper
│       │   └── service/              # 业务服务
│       └── resources/
│           ├── application.yml       # 应用配置
│           └── sql/init.sql          # 数据库初始化
│
├── hotel-frontend/                   # Vue 3 前端
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.js                   # 入口
│       ├── App.vue                   # 根组件
│       ├── api/                      # API 接口
│       ├── router/                   # 路由配置
│       ├── stores/                   # Pinia 状态
│       ├── utils/request.js          # Axios 封装
│       └── views/                    # 页面视图
│           ├── Login.vue
│           ├── Layout.vue
│           ├── Dashboard.vue
│           ├── room/
│           ├── booking/
│           ├── customer/
│           └── user/
│
└── README.md
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/user/login | 用户登录 |
| POST | /api/user/register | 用户注册 |
| GET | /api/user/list | 用户列表 |
| GET | /api/roomType/list | 房型列表 |
| POST | /api/roomType | 新增房型 |
| GET | /api/room/list | 房间列表(分页) |
| GET | /api/room/available | 空闲房间 |
| POST | /api/room | 新增房间 |
| GET | /api/customer/list | 客户列表 |
| POST | /api/customer | 新增客户 |
| GET | /api/booking/list | 预订列表(分页) |
| POST | /api/booking | 新增预订 |
| PUT | /api/booking/checkIn/{id} | 办理入住 |
| PUT | /api/booking/checkOut/{id} | 办理退房 |
| PUT | /api/booking/cancel/{id} | 取消预订 |

## 数据库表

| 表名 | 说明 |
|------|------|
| user | 系统用户 |
| room_type | 房型信息 |
| room | 房间信息 |
| customer | 客户信息 |
| booking | 预订记录 |
