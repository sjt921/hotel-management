<template>
  <div class="layout">
    <!-- 侧边栏 -->
    <div class="sidebar" :class="{ collapsed: isCollapse }">
      <div class="logo">
        <span v-if="!isCollapse">🏨 山间棠酒店-湘潭雨湖店</span>
        <span v-else>🏨</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        router
        background-color="#1e3c72"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>首页</span>
        </el-menu-item>

        <!-- 管理员专属：房间管理 -->
        <el-sub-menu index="room-sub" v-if="userStore.isAdmin()">
          <template #title>
            <el-icon><House /></el-icon>
            <span>房间管理</span>
          </template>
          <el-menu-item index="/roomType">房型管理</el-menu-item>
          <el-menu-item index="/room">房间列表</el-menu-item>
        </el-sub-menu>

        <!-- 管理员专属：客户管理 -->
        <el-menu-item v-if="userStore.isAdmin()" index="/customer">
          <el-icon><UserFilled /></el-icon>
          <span>客户管理</span>
        </el-menu-item>

        <!-- 管理员专属：用户管理 -->
        <el-menu-item v-if="userStore.isAdmin()" index="/user">
          <el-icon><Avatar /></el-icon>
          <span>用户管理</span>
        </el-menu-item>

        <!-- 所有用户可见 -->
        <el-menu-item index="/booking">
          <el-icon><Tickets /></el-icon>
          <span>预订管理</span>
        </el-menu-item>
        <el-menu-item index="/orderStatus">
          <el-icon><List /></el-icon>
          <span>订单状态</span>
        </el-menu-item>
        <el-menu-item index="/hotelLayout">
          <el-icon><Grid /></el-icon>
          <span>酒店布局</span>
        </el-menu-item>
        <el-menu-item index="/chat">
          <el-icon><ChatDotRound /></el-icon>
          <span>消息聊天</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 主体区域 -->
    <div class="main" :class="{ expanded: isCollapse }">
      <!-- 顶部栏 -->
      <div class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapse = !isCollapse" :size="22">
            <Fold v-if="!isCollapse" /><Expand v-else />
          </el-icon>
          <span class="page-title">{{ $route.meta.title }}</span>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" icon="UserFilled" />
              <span class="username">{{ userStore.user?.realName || userStore.user?.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapse = ref(false)
const activeMenu = computed(() => route.path)

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.logout()
      router.push('/login')
    })
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
.sidebar {
  width: 220px;
  background: #1e3c72;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
}
.sidebar.collapsed {
  width: 64px;
}
.logo {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  white-space: nowrap;
  overflow: hidden;
}
.el-menu {
  border-right: none;
  flex: 1;
  overflow-y: auto;
}
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s;
  background: #f0f2f5;
}
.header {
  height: 56px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  z-index: 10;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.collapse-btn {
  cursor: pointer;
}
.collapse-btn:hover {
  color: #409EFF;
}
.page-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}
.header-right {
  display: flex;
  align-items: center;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.username {
  font-size: 14px;
  color: #333;
}
.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* ===== 菜单项 hover 右滑 ===== */
.el-menu-item {
  transition: all 0.25s ease;
}
.el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.08) !important;
  transform: translateX(4px);
}

/* ===== 子菜单标题 hover ===== */
:deep(.el-sub-menu__title) {
  transition: all 0.25s ease;
}
:deep(.el-sub-menu__title:hover) {
  background-color: rgba(255, 255, 255, 0.08) !important;
  transform: translateX(4px);
}

/* ===== Logo hover ===== */
.logo {
  transition: opacity 0.3s, letter-spacing 0.4s;
  cursor: pointer;
}
.logo:hover {
  opacity: 0.85;
  letter-spacing: 1px;
}

/* ===== 折叠按钮 hover 放大旋转 ===== */
.collapse-btn {
  transition: transform 0.3s ease, color 0.3s;
}
.collapse-btn:hover {
  transform: scale(1.25) rotate(180deg);
  color: #409EFF;
}

/* ===== 用户信息 hover ===== */
.user-info {
  transition: opacity 0.3s, transform 0.25s;
}
.user-info:hover {
  opacity: 0.8;
  transform: scale(1.05);
}

/* ===== Header 阴影过渡 ===== */
.header {
  transition: box-shadow 0.3s;
}
</style>
