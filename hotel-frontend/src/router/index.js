import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'roomType',
        name: 'RoomType',
        component: () => import('../views/room/RoomType.vue'),
        meta: { title: '房型管理', requireAdmin: true }
      },
      {
        path: 'room',
        name: 'Room',
        component: () => import('../views/room/RoomList.vue'),
        meta: { title: '房间管理', requireAdmin: true }
      },
      {
        path: 'booking',
        name: 'Booking',
        component: () => import('../views/booking/BookingList.vue'),
        meta: { title: '预订管理' }
      },
      {
        path: 'customer',
        name: 'Customer',
        component: () => import('../views/customer/CustomerList.vue'),
        meta: { title: '客户管理', requireAdmin: true }
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('../views/user/UserList.vue'),
        meta: { title: '用户管理', requireAdmin: true }
      },
      {
        path: 'hotelLayout',
        name: 'HotelLayout',
        component: () => import('../views/hotel/HotelLayout.vue'),
        meta: { title: '酒店布局' }
      },
      {
        path: 'orderStatus',
        name: 'OrderStatus',
        component: () => import('../views/hotel/OrderStatus.vue'),
        meta: { title: '订单状态管理' }
      },
      {
        path: 'chat',
        name: 'Chat',
        component: () => import('../views/hotel/ChatPage.vue'),
        meta: { title: '消息聊天' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 未登录跳转登录页 + 角色权限校验
const whiteList = ['/login']
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (token) {
    if (to.path === '/login') {
      next('/')
    } else {
      // 检查管理员权限
      if (to.meta.requireAdmin) {
        const userStr = localStorage.getItem('user')
        let user = null
        try {
          user = JSON.parse(userStr)
        } catch (e) {}
        if (!user || user.role !== 'admin') {
          // 非管理员无法访问，跳转控制台
          ElMessage.warning('该功能仅限管理员使用')
          next('/dashboard')
          return
        }
      }
      next()
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router
