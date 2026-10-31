<template>
  <div class="page">
    <el-card shadow="never">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-select v-model="searchStatus" placeholder="预订状态" clearable style="width:140px"
                     @change="fetchData">
            <el-option label="待确认" value="pending" />
            <el-option label="已确认" value="confirmed" />
            <el-option label="已入住" value="checked_in" />
            <el-option label="已退房" value="checked_out" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </div>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon> 新增预订
        </el-button>
      </div>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="id" label="预订编号" width="80" />
        <el-table-column prop="customerName" label="客户" width="90" />
        <el-table-column prop="roomNumber" label="房间号" width="90" />
        <el-table-column prop="checkInDate" label="入住日期" width="120" />
        <el-table-column prop="checkOutDate" label="退房日期" width="120" />
        <el-table-column prop="totalPrice" label="金额(元)" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagMap[row.status]">{{ statusMap[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="140" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <!-- 入住 -->
            <el-tooltip
              v-if="row.status === 'confirmed' && canOperate(row)"
              content="确认客户入住"
              placement="top"
            >
              <el-button type="success" size="small" link @click="handleCheckIn(row)">入住</el-button>
            </el-tooltip>

            <!-- 退房 -->
            <el-tooltip
              v-if="row.status === 'checked_in'"
              content="办理退房"
              placement="top"
            >
              <el-button type="primary" size="small" link @click="handleCheckOut(row)">退房</el-button>
            </el-tooltip>

            <!-- 取消（10小时限制） -->
            <el-tooltip
              v-if="canShowCancel(row)"
              :content="cancelDisabledReason(row)"
              placement="top"
              :disabled="!isCancelDisabled(row)"
            >
              <span style="display:inline-block">
                <el-button
                  type="warning" size="small" link
                  :disabled="isCancelDisabled(row)"
                  @click="handleCancel(row)"
                >取消</el-button>
              </span>
            </el-tooltip>

            <!-- 删除（10小时限制，管理员始终可删） -->
            <el-tooltip
              v-if="canShowDelete(row)"
              :content="deleteDisabledReason(row)"
              placement="top"
              :disabled="!isDeleteDisabled(row)"
            >
              <span style="display:inline-block">
                <el-button
                  type="danger" size="small" link
                  :disabled="isDeleteDisabled(row)"
                  @click="handleDelete(row)"
                >删除</el-button>
              </span>
            </el-tooltip>

            <span v-if="!canOperate(row) && !isAdmin" class="no-permission">--</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @change="fetchData"
        />
      </div>
    </el-card>

    <!-- 新增预订对话框 -->
    <el-dialog v-model="dialogVisible" title="新增预订" width="520px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
        <el-form-item label="客户ID" prop="customerId">
          <el-input-number v-model="form.customerId" :min="1" style="width:100%" />
        </el-form-item>
        <el-form-item label="房型选择" prop="roomTypeId">
          <el-select v-model="form.roomTypeId" placeholder="请选择房型" style="width:100%">
            <el-option
              v-for="rt in roomTypes"
              :key="rt.id"
              :label="rt.name + '（¥' + rt.price + '/晚）'"
              :value="rt.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="入住日期" prop="checkInDate">
          <el-date-picker v-model="form.checkInDate" type="date" placeholder="选择入住日期"
                          value-format="YYYY-MM-DD" style="width:100%" />
        </el-form-item>
        <el-form-item label="退房日期" prop="checkOutDate">
          <el-date-picker v-model="form.checkOutDate" type="date" placeholder="选择退房日期"
                          value-format="YYYY-MM-DD" style="width:100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBookingList, addBooking, deleteBooking, checkIn, checkOut, cancelBooking } from '../../api'
import { getRoomTypeList } from '../../api'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()
const isAdmin = computed(() => userStore.isAdmin())
const currentUserId = computed(() => userStore.user?.id)

const tableData = ref([])
const loading = ref(false)
const searchStatus = ref('')
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const formRef = ref(null)

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

const roomTypes = ref([])

const form = reactive({
  customerId: 1,
  roomTypeId: null,
  checkInDate: '',
  checkOutDate: '',
  remark: ''
})

const rules = {
  customerId: [{ required: true, message: '请选择客户', trigger: 'blur' }],
  roomTypeId: [{ required: true, message: '请选择房型', trigger: 'blur' }],
  checkInDate: [{ required: true, message: '请选择入住日期', trigger: 'blur' }],
  checkOutDate: [{ required: true, message: '请选择退房日期', trigger: 'blur' }]
}

// ===== 权限判断 =====

/** 非管理员只能操作自己的预订 */
const canOperate = (row) => {
  if (isAdmin.value) return true
  return row.userId === currentUserId.value
}

/** 计算距离入住还有多少小时 */
const hoursUntilCheckIn = (row) => {
  if (!row.checkInDate) return Infinity
  const now = new Date()
  const checkIn = new Date(row.checkInDate + 'T14:00:00')
  return (checkIn - now) / (1000 * 60 * 60)
}

/** 是否显示取消按钮 */
const canShowCancel = (row) => {
  if (!['pending', 'confirmed'].includes(row.status)) return false
  if (!canOperate(row)) return false
  return true
}

/** 是否显示删除按钮 */
const canShowDelete = (row) => {
  if (!canOperate(row)) return false
  return true
}

/** 取消是否被禁用 */
const isCancelDisabled = (row) => {
  if (isAdmin.value) return false
  return hoursUntilCheckIn(row) <= 10
}

/** 删除是否被禁用 */
const isDeleteDisabled = (row) => {
  if (isAdmin.value) return false
  return hoursUntilCheckIn(row) <= 10
}

/** 取消禁用原因 */
const cancelDisabledReason = (row) => {
  if (isAdmin.value) return ''
  const h = hoursUntilCheckIn(row)
  if (h <= 10) return `距离入住仅剩 ${Math.floor(h)} 小时，不足10小时不可取消`
  return ''
}

/** 删除禁用原因 */
const deleteDisabledReason = (row) => {
  if (isAdmin.value) return ''
  const h = hoursUntilCheckIn(row)
  if (h <= 10) return `距离入住仅剩 ${Math.floor(h)} 小时，不足10小时不可删除`
  return ''
}

// ===== 数据操作 =====

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getBookingList({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      status: searchStatus.value
    })
    tableData.value = res.data?.records || []
    total.value = res.data?.total || 0
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  form.customerId = 1
  form.roomTypeId = null
  form.checkInDate = ''
  form.checkOutDate = ''
  form.remark = ''
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    // 将 roomTypeId 通过 roomId 字段传给后端（后端据此分配房间）
    await addBooking({
      customerId: form.customerId,
      roomId: form.roomTypeId,
      checkInDate: form.checkInDate,
      checkOutDate: form.checkOutDate,
      remark: form.remark
    })
    ElMessage.success('下单成功，等待管理员确认')
    dialogVisible.value = false
    fetchData()
  } catch (e) {}
}

const handleCheckIn = async (row) => {
  ElMessageBox.confirm('确认客户入住？', '提示', { type: 'info' }).then(async () => {
    await checkIn(row.id)
    ElMessage.success('入住成功')
    fetchData()
  })
}

const handleCheckOut = async (row) => {
  ElMessageBox.confirm('确认客户退房？', '提示', { type: 'info' }).then(async () => {
    await checkOut(row.id)
    ElMessage.success('退房成功')
    fetchData()
  })
}

const handleCancel = async (row) => {
  ElMessageBox.confirm('确定取消该预订吗？', '提示', { type: 'warning' }).then(async () => {
    await cancelBooking(row.id)
    ElMessage.success('取消成功')
    fetchData()
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定删除该预订记录吗？', '提示', { type: 'warning' }).then(async () => {
    await deleteBooking(row.id)
    ElMessage.success('删除成功')
    fetchData()
  })
}

const fetchRoomTypes = async () => {
  try {
    const res = await getRoomTypeList()
    roomTypes.value = res.data || []
  } catch (e) {}
}

onMounted(() => {
  fetchData()
  fetchRoomTypes()
})
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  animation: fadeIn 0.4s ease both;
}
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
.no-permission {
  color: #c0c4cc;
  font-size: 13px;
}

/* ===== 链接按钮 hover 增强 ===== */
:deep(.el-button.is-link:hover) {
  transform: scale(1.12);
}
</style>
