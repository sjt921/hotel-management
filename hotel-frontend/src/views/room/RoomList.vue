<template>
  <div class="page">
    <el-card shadow="never">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input v-model="searchRoomNumber" placeholder="搜索房间号" clearable style="width:180px"
                    @keyup.enter="fetchData" />
          <el-select v-model="searchStatus" placeholder="房间状态" clearable style="width:140px;margin-left:10px"
                     @change="fetchData">
            <el-option label="空闲" value="available" />
            <el-option label="已入住" value="occupied" />
            <el-option label="已预订" value="reserved" />
            <el-option label="打扫中" value="cleaning" />
          </el-select>
        </div>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon> 新增房间
        </el-button>
      </div>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="roomNumber" label="房间号" width="120" />
        <el-table-column prop="roomTypeId" label="房型ID" width="80" />
        <el-table-column prop="floor" label="楼层" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagMap[row.status]">{{ statusMap[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="160" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">删除</el-button>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑房间' : '新增房间'" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
        <el-form-item label="房间号" prop="roomNumber">
          <el-input v-model="form.roomNumber" placeholder="如：301" />
        </el-form-item>
        <el-form-item label="房型ID" prop="roomTypeId">
          <el-input-number v-model="form.roomTypeId" :min="1" style="width:100%" />
        </el-form-item>
        <el-form-item label="楼层" prop="floor">
          <el-input-number v-model="form.floor" :min="1" :max="50" style="width:100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" style="width:100%">
            <el-option label="空闲" value="available" />
            <el-option label="已入住" value="occupied" />
            <el-option label="已预订" value="reserved" />
            <el-option label="打扫中" value="cleaning" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRoomList, addRoom, updateRoom, deleteRoom } from '../../api'

const tableData = ref([])
const loading = ref(false)
const searchRoomNumber = ref('')
const searchStatus = ref('')
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const statusMap = { available: '空闲', occupied: '已入住', reserved: '已预订', cleaning: '打扫中' }
const statusTagMap = { available: 'success', occupied: 'danger', reserved: 'warning', cleaning: 'info' }

const form = reactive({
  id: null,
  roomNumber: '',
  roomTypeId: 1,
  floor: 1,
  status: 'available',
  description: ''
})

const rules = {
  roomNumber: [{ required: true, message: '请输入房间号', trigger: 'blur' }],
  roomTypeId: [{ required: true, message: '请选择房型', trigger: 'blur' }],
  floor: [{ required: true, message: '请输入楼层', trigger: 'blur' }]
}

const resetForm = () => {
  form.id = null
  form.roomNumber = ''
  form.roomTypeId = 1
  form.floor = 1
  form.status = 'available'
  form.description = ''
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getRoomList({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      roomNumber: searchRoomNumber.value,
      status: searchStatus.value
    })
    tableData.value = res.data?.records || []
    total.value = res.data?.total || 0
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    if (isEdit.value) {
      await updateRoom(form)
      ElMessage.success('更新成功')
    } else {
      await addRoom(form)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (e) {}
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定删除该房间吗？', '提示', { type: 'warning' }).then(async () => {
    await deleteRoom(row.id)
    ElMessage.success('删除成功')
    fetchData()
  })
}

onMounted(fetchData)
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
}
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* ===== 链接按钮 hover 增强 ===== */
:deep(.el-button.is-link:hover) {
  transform: scale(1.12);
}
</style>
