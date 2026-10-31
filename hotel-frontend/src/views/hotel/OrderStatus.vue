<template>
  <div class="order-status-page">
    <el-row :gutter="20">
      <!-- 左侧：状态统计 -->
      <el-col :span="6">
        <el-card shadow="never">
          <template #header><span style="font-weight:bold">订单状态统计</span></template>
          <div class="stat-list">
            <div class="stat-item" v-for="item in statList" :key="item.status"
                 :class="{ active: filterStatus === item.status }"
                 @click="filterStatus = item.status">
              <span class="stat-label">{{ item.label }}</span>
              <el-tag :type="item.type" size="default">{{ item.count }}</el-tag>
            </div>
            <div class="stat-item" :class="{ active: filterStatus === '' }" @click="filterStatus = ''">
              <span class="stat-label">全部订单</span>
              <el-tag type="info" size="default">{{ bookings.length }}</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：订单列表 -->
      <el-col :span="18">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span style="font-weight:bold">📋 订单列表</span>
              <el-button type="primary" size="small" @click="fetchData">刷新</el-button>
            </div>
          </template>
          <el-table :data="filteredBookings" border stripe v-loading="loading" max-height="600">
            <el-table-column prop="id" label="编号" width="60" />
            <el-table-column prop="customerName" label="客户" width="90" />
            <el-table-column prop="roomNumber" label="房间" width="80" />
            <el-table-column prop="checkInDate" label="入住" width="110" />
            <el-table-column prop="checkOutDate" label="退房" width="110" />
            <el-table-column prop="totalPrice" label="金额" width="90" />
            <el-table-column prop="remark" label="备注" min-width="130" show-overflow-tooltip />
            <el-table-column label="当前状态" width="110">
              <template #default="{ row }">
                <el-tag :type="tagMap[row.status]">{{ textMap[row.status] }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态操作" width="280" fixed="right">
              <template #default="{ row }">
                <template v-if="canOperate(row)">
                  <el-dropdown @command="(cmd) => changeStatus(row, cmd)">
                    <el-button type="primary" size="small">
                      修改状态 <el-icon><ArrowDown /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item
                          v-for="opt in getAvailableActions(row)"
                          :key="opt.value"
                          :command="opt.value"
                          :disabled="opt.disabled"
                        >
                          <el-tooltip
                            :content="opt.disabledReason || ''"
                            placement="right"
                            :disabled="!opt.disabled"
                          >
                            <span>{{ opt.label }}</span>
                          </el-tooltip>
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
                <span v-else class="no-permission">无权操作</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getBookingList, checkIn, checkOut, cancelBooking, updateBooking } from '../../api'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()
const isAdmin = computed(() => userStore.isAdmin())
const currentUserId = computed(() => userStore.user?.id)

const bookings = ref([])
const loading = ref(false)
const filterStatus = ref('')

const textMap = {
  pending: '待确认', confirmed: '已确认',
  checked_in: '已入住', checked_out: '已退房', cancelled: '已取消'
}
const tagMap = {
  pending: 'info', confirmed: 'warning',
  checked_in: 'success', checked_out: '', cancelled: 'danger'
}

// ===== 权限判断 =====

const canOperate = (row) => {
  if (isAdmin.value) return true
  return row.userId === currentUserId.value
}

const hoursUntilCheckIn = (row) => {
  if (!row.checkInDate) return Infinity
  const now = new Date()
  const checkIn = new Date(row.checkInDate + 'T14:00:00')
  return (checkIn - now) / (1000 * 60 * 60)
}

// ===== 统计 =====

const statList = computed(() => {
  const statuses = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled']
  return statuses.map(s => ({
    status: s,
    label: textMap[s],
    count: bookings.value.filter(b => b.status === s).length,
    type: tagMap[s]
  }))
})

const filteredBookings = computed(() => {
  if (!filterStatus.value) return bookings.value
  return bookings.value.filter(b => b.status === filterStatus.value)
})

// ===== 可用操作 =====

const getAvailableActions = (row) => {
  const h = hoursUntilCheckIn(row)
  const nearCheckIn = h <= 10 && !isAdmin.value
  const actions = {
    pending: [
      { label: '确认预订', value: 'confirm' },
      { label: '取消预订', value: 'cancel', disabled: nearCheckIn,
        disabledReason: nearCheckIn ? `距入住仅${Math.floor(h)}h，不足10h不可取消` : '' },
      { label: '直接入住', value: 'checkin' }
    ],
    confirmed: [
      { label: '办理入住', value: 'checkin' },
      { label: '取消预订', value: 'cancel', disabled: nearCheckIn,
        disabledReason: nearCheckIn ? `距入住仅${Math.floor(h)}h，不足10h不可取消` : '' }
    ],
    checked_in: [
      { label: '办理退房', value: 'checkout' }
    ],
    checked_out: [],
    cancelled: [
      { label: '恢复为待确认', value: 'restore' }
    ]
  }
  return actions[row.status] || []
}

// ===== 状态变更 =====

const changeStatus = async (row, action) => {
  try {
    switch (action) {
      case 'confirm':
        row.status = 'confirmed'
        await updateBooking(row)
        break
      case 'checkin':
        await checkIn(row.id)
        row.status = 'checked_in'
        break
      case 'checkout':
        await checkOut(row.id)
        row.status = 'checked_out'
        break
      case 'cancel':
        await cancelBooking(row.id)
        row.status = 'cancelled'
        break
      case 'restore':
        row.status = 'pending'
        await updateBooking(row)
        break
    }
    ElMessage.success('状态已更新')
    fetchData()
  } catch (e) {}
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getBookingList({ pageNum: 1, pageSize: 999 })
    bookings.value = res.data?.records || []
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.stat-list { display: flex; flex-direction: column; gap: 2px; }
.stat-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 12px; cursor: pointer; border-radius: 6px;
  transition: all 0.25s ease;
}
.stat-item:hover {
  background: #ecf5ff;
  transform: scale(1.03);
}
.stat-item.active {
  background: #409EFF; color: #fff;
  transform: scale(1.03);
}
.stat-item.active .stat-label { color: #fff; }
.stat-label { font-size: 14px; }

/* 标签 hover 放大 */
.stat-item .el-tag {
  transition: transform 0.25s ease;
}
.stat-item:hover .el-tag {
  transform: scale(1.1);
}

.card-header { display: flex; justify-content: space-between; align-items: center; }

/* 刷新按钮 hover */
.card-header .el-button {
  transition: all 0.25s;
}
.card-header .el-button:hover {
  transform: scale(1.08);
}

.no-permission { color: #c0c4cc; font-size: 13px; }
</style>
