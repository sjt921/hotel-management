<template>
  <div class="hotel-layout">
    <el-card shadow="never">
      <template #header>
        <div class="page-header">
          <span class="title">🏨 酒店整体布局</span>
          <div class="legend">
            <span class="legend-item"><span class="dot available"></span> 空闲</span>
            <span class="legend-item"><span class="dot occupied"></span> 已入住</span>
            <span class="legend-item"><span class="dot reserved"></span> 已预订</span>
            <span class="legend-item"><span class="dot cleaning"></span> 打扫中</span>
          </div>
        </div>
      </template>

      <div v-for="floor in floors" :key="floor" class="floor-section">
        <!-- 楼层标签 -->
        <div class="floor-label">
          <span class="floor-number">{{ floor }}F</span>
          <span class="floor-text">第 {{ floor }} 层</span>
        </div>

        <!-- 走廊上方房间 -->
        <div class="room-row">
          <div
            v-for="room in getFloorRooms(floor, 'upper')"
            :key="room.id"
            class="room-card"
            :class="room.status"
            @click="showRoomDetail(room)"
          >
            <div class="room-img-box">
              <img
                :src="getRoomImage(room.roomNumber)"
                class="room-thumb"
                @error="handleImgError"
              />
            </div>
            <div class="room-info">
              <div class="room-number">{{ room.roomNumber }}</div>
              <div class="room-type-name">{{ getRoomTypeName(room.roomTypeId) }}</div>
              <el-tag :type="statusTag[room.status]" size="small" class="status-tag">
                {{ statusText[room.status] }}
              </el-tag>
            </div>
          </div>
          <div v-if="getFloorRooms(floor, 'upper').length === 0" class="empty-row">暂无房间</div>
        </div>

        <!-- 走廊（宽版） -->
        <div class="corridor-wrapper">
          <div class="corridor">
            <!-- 左侧电梯/楼梯区域 -->
            <div class="corridor-facility left">
              <el-icon :size="20"><CaretTop /></el-icon>
              <span>电梯</span>
            </div>
            <!-- 走廊主体 -->
            <div class="corridor-body">
              <div class="corridor-pattern"></div>
              <span class="corridor-text">走　廊</span>
              <div class="corridor-pattern"></div>
            </div>
            <!-- 右侧电梯/楼梯区域 -->
            <div class="corridor-facility right">
              <el-icon :size="20"><CaretBottom /></el-icon>
              <span>楼梯</span>
            </div>
          </div>
        </div>

        <!-- 走廊下方房间 -->
        <div class="room-row">
          <div
            v-for="room in getFloorRooms(floor, 'lower')"
            :key="room.id"
            class="room-card"
            :class="room.status"
            @click="showRoomDetail(room)"
          >
            <div class="room-img-box">
              <img
                :src="getRoomImage(room.roomNumber)"
                class="room-thumb"
                @error="handleImgError"
              />
            </div>
            <div class="room-info">
              <div class="room-number">{{ room.roomNumber }}</div>
              <div class="room-type-name">{{ getRoomTypeName(room.roomTypeId) }}</div>
              <el-tag :type="statusTag[room.status]" size="small" class="status-tag">
                {{ statusText[room.status] }}
              </el-tag>
            </div>
          </div>
          <div v-if="getFloorRooms(floor, 'lower').length === 0" class="empty-row">暂无房间</div>
        </div>
      </div>
    </el-card>

    <!-- 房间详情对话框 -->
    <el-dialog v-model="detailVisible" title="房间详情" width="520px">
      <div class="room-detail" v-if="currentRoom">
        <div class="detail-img-box">
          <img
            :src="getRoomImage(currentRoom.roomNumber)"
            class="detail-thumb"
            @error="handleImgError"
          />
        </div>

        <!-- 房间基本信息 -->
        <el-descriptions :column="2" border size="small" class="detail-desc">
          <el-descriptions-item label="房间号">{{ currentRoom.roomNumber }}</el-descriptions-item>
          <el-descriptions-item label="房型">{{ getRoomTypeName(currentRoom.roomTypeId) }}</el-descriptions-item>
          <el-descriptions-item label="楼层">{{ currentRoom.floor }}F</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTag[currentRoom.status]" size="small">
              {{ statusText[currentRoom.status] }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ currentRoom.description || '暂无' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 入住信息 -->
        <div v-if="roomBookingMap[currentRoom.id]" class="booking-info">
          <el-divider content-position="left">
            <span style="font-weight:bold;font-size:14px">入住信息</span>
          </el-divider>
          <el-descriptions :column="2" border size="small" class="detail-desc">
            <el-descriptions-item label="客户姓名">
              <span style="font-weight:bold">{{ roomBookingMap[currentRoom.id].customerName || '--' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="手机号">
              {{ roomBookingMap[currentRoom.id].customerPhone || '--' }}
            </el-descriptions-item>
            <el-descriptions-item label="入住日期">
              {{ roomBookingMap[currentRoom.id].checkInDate || '--' }}
            </el-descriptions-item>
            <el-descriptions-item label="退房日期">
              {{ roomBookingMap[currentRoom.id].checkOutDate || '--' }}
            </el-descriptions-item>
            <el-descriptions-item label="订单状态">
              <el-tag :type="bookingStatusTag(roomBookingMap[currentRoom.id].status)" size="small">
                {{ bookingStatusText(roomBookingMap[currentRoom.id].status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="金额">
              <span style="color:#E6A23C;font-weight:bold">
                &yen;{{ roomBookingMap[currentRoom.id].totalPrice }}
              </span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 空闲提示 -->
        <div v-if="currentRoom.status === 'available'" class="available-hint">
          <el-icon :size="18"><CircleCheckFilled /></el-icon>
          <span>此房间当前空闲，可预订入住</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getRoomList, getRoomTypeList, getBookingList } from '../../api'

const rooms = ref([])
const roomTypes = ref([])
const bookings = ref([])
const detailVisible = ref(false)
const currentRoom = ref(null)
const roomBookingMap = reactive({})

// 图片加载失败用占位图
const failedImages = ref(new Set())

const statusText = { available: '空闲', occupied: '已入住', reserved: '已预订', cleaning: '打扫中' }
const statusTag = { available: 'success', occupied: 'danger', reserved: 'warning', cleaning: 'info' }

const bookingStatusText = (s) => {
  const m = { pending: '待确认', confirmed: '已确认', checked_in: '已入住', checked_out: '已退房', cancelled: '已取消' }
  return m[s] || s
}
const bookingStatusTag = (s) => {
  const m = { pending: 'info', confirmed: 'warning', checked_in: 'success', checked_out: '', cancelled: 'danger' }
  return m[s] || ''
}

const floors = [1, 2, 3]

// 根据房间号获取对应图片路径
const getRoomImage = (roomNumber) => {
  if (failedImages.value.has(roomNumber)) return ''
  return `/images/${roomNumber}.png`
}

const handleImgError = (e) => {
  // 从 src 中提取房间号
  const src = e.target.src || e.target.getAttribute('src') || ''
  const match = src.match(/(\d+)\.png/)
  if (match) {
    failedImages.value.add(match[1])
  }
  e.target.style.display = 'none'
}

const getRoomTypeName = (id) => {
  const rt = roomTypes.value.find(t => t.id === id)
  return rt ? rt.name : '未知'
}

// upper = 房间号前一半, lower = 后一半
const getFloorRooms = (floor, position) => {
  let filtered = rooms.value.filter(r => r.floor === floor)
  filtered.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber))
  const mid = Math.ceil(filtered.length / 2)
  return position === 'upper' ? filtered.slice(0, mid) : filtered.slice(mid)
}

const showRoomDetail = (room) => {
  currentRoom.value = room
  detailVisible.value = true
}

const fetchData = async () => {
  try {
    const [roomRes, typeRes, bookingRes] = await Promise.all([
      getRoomList({ pageNum: 1, pageSize: 999 }),
      getRoomTypeList(),
      getBookingList({ pageNum: 1, pageSize: 999 })
    ])
    rooms.value = roomRes.data?.records || []
    roomTypes.value = typeRes.data || []

    const activeBookings = (bookingRes.data?.records || []).filter(
      b => ['confirmed', 'checked_in'].includes(b.status)
    )
    activeBookings.forEach(b => {
      roomBookingMap[b.roomId] = b
    })
  } catch (e) {}
}

onMounted(fetchData)
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.title { font-size: 18px; font-weight: bold; }
.legend { display: flex; gap: 16px; font-size: 13px; flex-wrap: wrap; }
.legend-item { display: flex; align-items: center; gap: 4px; }
.dot { width: 12px; height: 12px; border-radius: 3px; display: inline-block; }
.dot.available { background: #67C23A; }
.dot.occupied { background: #F56C6C; }
.dot.reserved { background: #E6A23C; }
.dot.cleaning { background: #909399; }

/* ===== 楼层区域 ===== */
.floor-section {
  margin-bottom: 20px;
  background: #fafbfc;
  border-radius: 12px;
  padding: 16px 20px 20px;
  border: 1px solid #ebeef5;
}
.floor-label {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 14px;
  padding-left: 4px;
}
.floor-number {
  background: linear-gradient(135deg, #409EFF, #2a6cb6);
  color: #fff;
  padding: 4px 14px;
  border-radius: 16px;
  font-weight: bold;
  font-size: 15px;
}
.floor-text {
  font-size: 13px;
  color: #999;
}

/* ===== 房间行 ===== */
.room-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: center;
  padding: 6px 0;
}
.empty-row { color: #ccc; padding: 30px; text-align: center; width: 100%; font-size: 14px; }

/* ===== 房间卡片 ===== */
.room-card {
  width: 190px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #fff;
}
.room-card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 12px 28px rgba(0,0,0,0.14); }
.room-card.available { border-color: #b3e19d; }
.room-card.occupied { border-color: #fab6b6; }
.room-card.reserved { border-color: #f0c78e; }
.room-card.cleaning { border-color: #c0c4cc; }

/* 图片容器 */
.room-img-box {
  width: 100%;
  height: 130px;
  overflow: hidden;
  background: #f5f7fa;
  position: relative;
}
.room-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
/* 没有图片时的占位风格 */
.room-thumb[src=""],
.room-thumb[style*="display: none"] {
  display: none;
}
.room-img-box::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.03));
  pointer-events: none;
  z-index: 1;
}

.room-card.available .room-img-box { border-bottom: 3px solid #67C23A; }
.room-card.occupied .room-img-box { border-bottom: 3px solid #F56C6C; }
.room-card.reserved .room-img-box { border-bottom: 3px solid #E6A23C; }
.room-card.cleaning .room-img-box { border-bottom: 3px solid #909399; }

.room-info {
  padding: 10px 12px;
  text-align: center;
}
.room-number {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}
.room-type-name {
  font-size: 12px;
  color: #999;
  margin: 4px 0 6px;
}
.status-tag { margin-top: 2px; }

/* ===== 走廊 ===== */
.corridor-wrapper {
  padding: 6px 0;
}
.corridor {
  display: flex;
  align-items: center;
  gap: 0;
  min-height: 56px;
  background: linear-gradient(180deg, #e8ecf1 0%, #dfe3e8 50%, #e8ecf1 100%);
  border-radius: 8px;
  padding: 4px 12px;
  box-shadow: inset 0 2px 6px rgba(0,0,0,0.06);
}

/* 走廊两侧设施（电梯/楼梯） */
.corridor-facility {
  width: 60px;
  min-width: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 11px;
  color: #909399;
  padding: 4px;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.corridor-facility.left { margin-right: 16px; }
.corridor-facility.right { margin-left: 16px; }

/* 走廊主体 */
.corridor-body {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
}
.corridor-pattern {
  flex: 1;
  height: 2px;
  background: repeating-linear-gradient(
    90deg,
    #c0c4cc 0px,
    #c0c4cc 12px,
    transparent 12px,
    transparent 18px
  );
}
.corridor-text {
  color: #909399;
  font-size: 13px;
  letter-spacing: 8px;
  white-space: nowrap;
  font-weight: 500;
}

/* ===== 房间详情弹窗 ===== */
.room-detail { text-align: center; }
.detail-img-box {
  width: 100%;
  max-height: 240px;
  overflow: hidden;
  border-radius: 10px;
  margin-bottom: 16px;
  background: #f5f7fa;
}
.detail-thumb {
  width: 100%;
  object-fit: cover;
  display: block;
}
.detail-desc {
  margin-top: 4px;
}
.booking-info {
  margin-top: 16px;
}
.available-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: #67C23A;
  font-size: 14px;
  background: #f0f9eb;
  border-radius: 8px;
  margin-top: 12px;
}

/* ===== 动画增强 ===== */

/* 房间卡片图片 hover 放大 */
.room-img-box :deep(img) {
  transition: transform 0.5s ease;
}
.room-card:hover .room-img-box :deep(img) {
  transform: scale(1.08);
}

/* 楼层标签 hover */
.floor-number {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.floor-section:hover .floor-number {
  transform: scale(1.08);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

/* 空闲状态点呼吸动画 */
.dot.available {
  animation: pulse 3s ease infinite;
}

/* 走廊设施 hover */
.corridor-facility {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.corridor-facility:hover {
  transform: scale(1.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}
</style>
