-- =============================================
-- 酒店管理系统 数据库初始化脚本（安全版 - 可重复执行不丢数据）
-- =============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS hotel_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE hotel_db;

-- =============================================
-- 1. 用户表
-- =============================================
CREATE TABLE IF NOT EXISTS `user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(100) NOT NULL COMMENT '密码(MD5加密)',
  `real_name` VARCHAR(50) DEFAULT NULL COMMENT '真实姓名',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `role` VARCHAR(20) NOT NULL DEFAULT 'user' COMMENT '角色: admin-管理员, user-用户',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 默认管理员账号: admin / 123456 (MD5: e10adc3949ba59abbe56e057f20f883e)
INSERT IGNORE INTO `user` (`username`, `password`, `real_name`, `phone`, `email`, `role`) VALUES
('admin', 'e10adc3949ba59abbe56e057f20f883e', '系统管理员', '13800000000', 'admin@hotel.com', 'admin'),
('user01', 'e10adc3949ba59abbe56e057f20f883e', '张三', '13800000001', 'zhangsan@hotel.com', 'user'),
('user02', 'e10adc3949ba59abbe56e057f20f883e', '李四', '13800000002', 'lisi@hotel.com', 'user');

-- =============================================
-- 2. 房型表
-- =============================================
CREATE TABLE IF NOT EXISTS `room_type` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` VARCHAR(50) NOT NULL COMMENT '房型名称',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '描述',
  `price` DECIMAL(10,2) NOT NULL COMMENT '单价',
  `bed_type` VARCHAR(20) DEFAULT NULL COMMENT '床型: 大床/双床/单人床',
  `area` INT DEFAULT NULL COMMENT '面积(m²)',
  `capacity` INT DEFAULT 2 COMMENT '可住人数',
  `image` VARCHAR(255) DEFAULT NULL COMMENT '封面图片URL',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='房型表';

INSERT IGNORE INTO `room_type` (`id`, `name`, `description`, `price`, `bed_type`, `area`, `capacity`) VALUES
(1, '单人房', '简约舒适单人房，配1.5米床，1楼', 188.00, '单人床', 18, 1),
(2, '双床房', '标准双床房，配两张1.2米床，2楼', 288.00, '双床', 28, 2),
(3, '大床房', '豪华大床房，配1.8米大床，3楼', 388.00, '大床', 35, 2);

-- =============================================
-- 3. 房间表
-- =============================================
CREATE TABLE IF NOT EXISTS `room` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `room_number` VARCHAR(20) NOT NULL COMMENT '房间号',
  `room_type_id` BIGINT NOT NULL COMMENT '房型ID',
  `floor` INT DEFAULT 1 COMMENT '楼层',
  `status` VARCHAR(20) NOT NULL DEFAULT 'available' COMMENT '状态: available-空闲, occupied-已入住, reserved-已预订, cleaning-打扫中',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '描述',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_room_number` (`room_number`),
  KEY `idx_room_type_id` (`room_type_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='房间表';

INSERT IGNORE INTO `room` (`id`, `room_number`, `room_type_id`, `floor`, `status`, `description`) VALUES
(1, '101', 1, 1, 'available', '一楼单人房，靠近电梯'),
(2, '102', 1, 1, 'available', '一楼单人房，朝南安静'),
(3, '103', 1, 1, 'available', '一楼单人房，花园景观'),
(4, '201', 2, 2, 'available', '二楼双床房，城市景观'),
(5, '202', 2, 2, 'available', '二楼双床房，朝南明亮'),
(6, '203', 2, 2, 'available', '二楼双床房，安静舒适'),
(7, '301', 3, 3, 'available', '三楼大床房，全景落地窗'),
(8, '302', 3, 3, 'available', '三楼大床房，独立客厅'),
(9, '303', 3, 3, 'available', '三楼大床房，阳光露台');

-- =============================================
-- 4. 客户表
-- =============================================
CREATE TABLE IF NOT EXISTS `customer` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` VARCHAR(50) NOT NULL COMMENT '姓名',
  `id_card` VARCHAR(20) DEFAULT NULL COMMENT '身份证号',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `gender` VARCHAR(10) DEFAULT '男' COMMENT '性别',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`),
  KEY `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户表';

INSERT IGNORE INTO `customer` (`id`, `name`, `id_card`, `phone`, `gender`) VALUES
(1, '王小明', '320102199001011234', '13900001111', '男'),
(2, '赵丽',   '320103199205202345', '13900002222', '女'),
(3, '陈强',   '320104198812103456', '13900003333', '男'),
(4, '刘芳',   '320105199508204567', '13900004444', '女'),
(5, '周杰',   '320106199310305678', '13900005555', '男');

-- =============================================
-- 5. 预订表
-- =============================================
CREATE TABLE IF NOT EXISTS `booking` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `customer_id` BIGINT NOT NULL COMMENT '客户ID',
  `room_id` BIGINT NOT NULL COMMENT '房间ID',
  `user_id` BIGINT DEFAULT NULL COMMENT '创建预订的用户ID',
  `check_in_date` DATE NOT NULL COMMENT '入住日期',
  `check_out_date` DATE NOT NULL COMMENT '退房日期',
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '状态: pending-待确认, confirmed-已确认, checked_in-已入住, checked_out-已退房, cancelled-已取消',
  `total_price` DECIMAL(10,2) DEFAULT NULL COMMENT '总价',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_room_id` (`room_id`),
  KEY `idx_status` (`status`),
  KEY `idx_check_in_date` (`check_in_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预订表';

INSERT IGNORE INTO `booking` (`id`, `customer_id`, `room_id`, `user_id`, `check_in_date`, `check_out_date`, `status`, `total_price`, `remark`) VALUES
(1, 1, 3, 1, '2024-06-20', '2024-06-22', 'checked_in', 716.00, '已入住'),
(2, 3, 6, 1, '2024-06-22', '2024-06-25', 'confirmed',  1074.00, '已确认，等待入住'),
(3, 5, 1, 2, '2024-06-25', '2024-06-27', 'pending',    576.00, '待确认预订');

-- =============================================
-- 6. 消息表
-- =============================================
CREATE TABLE IF NOT EXISTS `message` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `sender_role` VARCHAR(20) NOT NULL COMMENT '发送者角色: user-客户, admin-管理员',
  `sender_name` VARCHAR(50) DEFAULT NULL COMMENT '发送者名称',
  `receiver_role` VARCHAR(20) NOT NULL COMMENT '接收者角色',
  `content` TEXT NOT NULL COMMENT '消息内容',
  `is_read` TINYINT(1) DEFAULT 0 COMMENT '是否已读',
  `session_id` VARCHAR(100) DEFAULT NULL COMMENT '会话ID',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_receiver_role` (`receiver_role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息表';
