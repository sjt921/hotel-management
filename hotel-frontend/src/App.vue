<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html, body, #app {
  height: 100%;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', Arial, sans-serif;
}

/* ========================================
   全局平滑滚动
   ======================================== */
html {
  scroll-behavior: smooth;
}

/* ========================================
   全局 Keyframes
   ======================================== */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%      { transform: scale(1.05); opacity: 0.85; }
}

/* ========================================
   页面过渡 (Login <-> Layout)
   ======================================== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ========================================
   全局按钮 hover 放大
   ======================================== */
.el-button {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
.el-button:hover {
  transform: scale(1.06);
}
.el-button:active {
  transform: scale(0.96);
}

/* ========================================
   全局卡片 hover 上浮
   ======================================== */
.el-card {
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}
.el-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

/* ========================================
   全局表格行 hover 蓝色高亮
   ======================================== */
.el-table__body-wrapper .el-table__row {
  transition: background-color 0.2s ease;
}
.el-table__body-wrapper .el-table__row:hover > td {
  background-color: #ecf5ff !important;
}

/* ========================================
   全局弹窗弹出动画
   ======================================== */
.el-dialog {
  animation: scaleIn 0.3s ease both;
}

/* ========================================
   全局菜单项 hover
   ======================================== */
.el-menu-item {
  transition: all 0.25s ease;
}
</style>
