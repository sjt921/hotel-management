<template>
  <div class="dashboard">
    <!-- ===== 管理员统计卡片 ===== -->
    <el-row v-if="userStore.isAdmin()" :gutter="20">
      <el-col :span="6">
        <div class="stat-card" style="background: linear-gradient(135deg, #409EFF, #337ECC)">
          <div class="stat-icon"><el-icon :size="36"><House /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalRooms }}</div>
            <div class="stat-label">房间总数</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" style="background: linear-gradient(135deg, #67C23A, #529B2E)">
          <div class="stat-icon"><el-icon :size="36"><Check /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.availableRooms }}</div>
            <div class="stat-label">空闲房间</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" style="background: linear-gradient(135deg, #E6A23C, #CF8B2E)">
          <div class="stat-icon"><el-icon :size="36"><Tickets /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalBookings }}</div>
            <div class="stat-label">预订总数</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card" style="background: linear-gradient(135deg, #F56C6C, #DA4F4F)">
          <div class="stat-icon"><el-icon :size="36"><UserFilled /></el-icon></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalCustomers }}</div>
            <div class="stat-label">客户总数</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- ===== 封面首页大图 ===== -->
    <div class="hero-section">
      <el-image
        :src="coverImage"
        fit="cover"
        class="hero-image"
        :preview-src-list="[coverImage]"
        preview-teleported
      >
        <template #error>
          <div class="hero-placeholder">
            <el-icon :size="64"><PictureFilled /></el-icon>
            <p>🏨 欢迎来到酒店管理系统</p>
            <span>Hotel Management System</span>
          </div>
        </template>
      </el-image>
      <div class="hero-overlay">
        <h1 class="hero-title">Welcome to Our Hotel</h1>
        <p class="hero-subtitle">享受精致住宿体验 · 品质服务每一天</p>
      </div>
    </div>

    <!-- ===== 酒店房型图片展示 ===== -->
    <el-card class="gallery-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="gallery-title">🏨 酒店客房展示</span>
        </div>
      </template>
      <div class="image-gallery">
        <div
          v-for="(img, index) in roomImages"
          :key="index"
          class="gallery-item"
        >
          <el-image
            :src="img.src"
            fit="cover"
            class="gallery-image"
            :preview-src-list="roomImages.map(i => i.src)"
            :initial-index="index"
            preview-teleported
            lazy
          >
            <template #error>
              <div class="image-error">
                <el-icon :size="40"><PictureFilled /></el-icon>
              </div>
            </template>
          </el-image>
          <div class="gallery-caption">
            <span class="room-label">{{ img.label }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- ===== 最新预订（管理员） ===== -->
    <el-card v-if="userStore.isAdmin()" class="section-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>最新预订</span>
          <el-button type="primary" size="small" @click="$router.push('/booking')">查看全部</el-button>
        </div>
      </template>
      <el-table :data="recentBookings" stripe style="width: 100%">
        <el-table-column prop="id" label="预订编号" width="80" />
        <el-table-column prop="customerId" label="客户" width="100" />
        <el-table-column prop="roomId" label="房间号" width="100" />
        <el-table-column prop="checkInDate" label="入住日期" width="120" />
        <el-table-column prop="checkOutDate" label="退房日期" width="120" />
        <el-table-column prop="totalPrice" label="金额" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagMap[row.status]">
              {{ statusMap[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getRoomList, getCustomerList, getBookingList } from '../api'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

// 封面首页图路径
const coverImage = computed(() => '/images/封面首页.png')

// 房间图片列表
const roomImages = computed(() => {
  const images = [
    { src: '/images/101.png', label: '房间 101 - 单人房' },
    { src: '/images/102.png', label: '房间 102 - 单人房' },
    { src: '/images/103.png', label: '房间 103 - 单人房' },
    { src: '/images/201.png', label: '房间 201 - 双床房' },
    { src: '/images/202.png', label: '房间 202 - 双床房' },
    { src: '/images/203.png', label: '房间 203 - 双床房' },
    { src: '/images/301.png', label: '房间 301 - 大床房' },
    { src: '/images/302.png', label: '房间 302 - 大床房' },
    { src: '/images/303.png', label: '房间 303 - 大床房' }
  ]
  return images
})

const stats = reactive({
  totalRooms: 0,
  availableRooms: 0,
  totalBookings: 0,
  totalCustomers: 0
})

const recentBookings = ref([])

const statusMap = {
  pending: '待确认',
  confirmed: '已确认',
  checked_in: '已入住',
  checked_out: '已退房',
  cancelled: '已取消'
}

const statusTagMap = {
  pending: 'info',
  confirmed: 'warning',
  checked_in: 'success',
  checked_out: '',
  cancelled: 'danger'
}

const fetchData = async () => {
  if (!userStore.isAdmin()) return
  try {
    const [roomRes, customerRes, bookingRes] = await Promise.all([
      getRoomList({ pageNum: 1, pageSize: 999 }),
      getCustomerList(),
      getBookingList({ pageNum: 1, pageSize: 5 })
    ])
    if (roomRes.data) {
      stats.totalRooms = roomRes.data.total || roomRes.data.records?.length || 0
      stats.availableRooms = roomRes.data.records?.filter(r => r.status === 'available').length || 0
    }
    if (customerRes.data) {
      stats.totalCustomers = customerRes.data.length || 0
    }
    if (bookingRes.data) {
      stats.totalBookings = bookingRes.data.total || bookingRes.data.records?.length || 0
      recentBookings.value = bookingRes.data.records || []
    }
  } catch (e) {
    // silently fail
  }
}

onMounted(fetchData)
</script>

<style scoped>
/* ===== Hero 封面区 ===== */
.hero-section {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
  max-height: 420px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  animation: fadeIn 0.7s ease both;
  animation-delay: 0.4s;
}
.hero-image {
  width: 100%;
  height: 420px;
  display: block;
}
.hero-image :deep(img) {
  transition: transform 0.8s ease;
}
.hero-section:hover .hero-image :deep(img) {
  transform: scale(1.05);
}
.hero-placeholder {
  width: 100%;
  height: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  background-size: 200% 200%;
  animation: gradientShift 6s ease infinite;
  color: #fff;
  gap: 8px;
}
.hero-placeholder p {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  animation: fadeInDown 0.6s ease both;
  animation-delay: 0.2s;
}
.hero-placeholder span {
  font-size: 14px;
  opacity: 0.7;
  animation: fadeInUp 0.6s ease both;
  animation-delay: 0.4s;
}
.hero-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40px 30px 24px;
  background: linear-gradient(transparent, rgba(0,0,0,0.65));
  color: #fff;
}
.hero-title {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 6px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.hero-subtitle {
  font-size: 15px;
  margin: 0;
  opacity: 0.9;
  text-shadow: 0 1px 4px rgba(0,0,0,0.3);
}

/* ===== 图片展示画廊 ===== */
.gallery-card {
  margin-bottom: 24px;
  animation: fadeInUp 0.6s ease both;
  animation-delay: 0.5s;
}
.gallery-title {
  font-size: 17px;
  font-weight: bold;
}
.image-gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.gallery-item {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.35s ease;
  cursor: pointer;
  background: #fff;
}
.gallery-item:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 12px 32px rgba(0,0,0,0.16);
}
.gallery-image {
  width: 100%;
  height: 220px;
  display: block;
}
.gallery-item :deep(img) {
  transition: transform 0.5s ease;
}
.gallery-item:hover :deep(img) {
  transform: scale(1.1);
}
.image-error {
  width: 100%;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
}
.gallery-caption {
  padding: 12px 14px;
  text-align: center;
}
.room-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* ===== 统计卡片 ===== */
.stat-card {
  border-radius: 8px;
  padding: 24px 20px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: fadeInUp 0.5s ease both;
}
.stat-card:hover {
  transform: scale(1.06) translateY(-4px);
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.22);
}
.el-row:first-of-type .el-col:nth-child(1) .stat-card { animation-delay: 0.05s; }
.el-row:first-of-type .el-col:nth-child(2) .stat-card { animation-delay: 0.15s; }
.el-row:first-of-type .el-col:nth-child(3) .stat-card { animation-delay: 0.25s; }
.el-row:first-of-type .el-col:nth-child(4) .stat-card { animation-delay: 0.35s; }
.stat-icon {
  opacity: 0.8;
  transition: transform 0.3s ease;
}
.stat-card:hover .stat-icon {
  transform: scale(1.15);
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
}
.stat-label {
  font-size: 14px;
  opacity: 0.85;
  margin-top: 4px;
}

/* ===== 预订列表 ===== */
.section-card {
  margin-top: 10px;
  animation: fadeInUp 0.6s ease both;
  animation-delay: 0.6s;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-header .el-button {
  transition: all 0.25s;
}
.card-header .el-button:hover {
  transform: scale(1.08);
}
</style>
