<template>
  <div class="page">
    <el-card shadow="never">
      <div class="toolbar">
        <el-input v-model="searchName" placeholder="搜索房型名称" clearable style="width:220px"
                  @keyup.enter="fetchData" />
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon> 新增房型
        </el-button>
      </div>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="房型名称" width="140" />
        <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip />
        <el-table-column prop="price" label="单价(元)" width="100" />
        <el-table-column prop="bedType" label="床型" width="100" />
        <el-table-column prop="area" label="面积(㎡)" width="100" />
        <el-table-column prop="capacity" label="可住人数" width="100" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑房型' : '新增房型'" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
        <el-form-item label="房型名称" prop="name">
          <el-input v-model="form.name" placeholder="如：标准间、大床房" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="房型描述" />
        </el-form-item>
        <el-form-item label="单价(元)" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" style="width:100%" />
        </el-form-item>
        <el-form-item label="床型" prop="bedType">
          <el-select v-model="form.bedType" style="width:100%">
            <el-option label="大床" value="大床" />
            <el-option label="双床" value="双床" />
            <el-option label="单人床" value="单人床" />
          </el-select>
        </el-form-item>
        <el-form-item label="面积(㎡)" prop="area">
          <el-input-number v-model="form.area" :min="1" :max="500" style="width:100%" />
        </el-form-item>
        <el-form-item label="可住人数" prop="capacity">
          <el-input-number v-model="form.capacity" :min="1" :max="10" style="width:100%" />
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
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRoomTypeList, addRoomType, updateRoomType, deleteRoomType } from '../../api'

const tableData = ref([])
const loading = ref(false)
const searchName = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const form = reactive({
  id: null,
  name: '',
  description: '',
  price: 200,
  bedType: '大床',
  area: 30,
  capacity: 2
})

const rules = {
  name: [{ required: true, message: '请输入房型名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入单价', trigger: 'blur' }]
}

const resetForm = () => {
  form.id = null
  form.name = ''
  form.description = ''
  form.price = 200
  form.bedType = '大床'
  form.area = 30
  form.capacity = 2
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getRoomTypeList({ name: searchName.value })
    tableData.value = res.data || []
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
      await updateRoomType(form)
      ElMessage.success('更新成功')
    } else {
      await addRoomType(form)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (e) {}
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定删除该房型吗？', '提示', { type: 'warning' }).then(async () => {
    await deleteRoomType(row.id)
    ElMessage.success('删除成功')
    fetchData()
  })
}

watch(searchName, () => fetchData())
onMounted(fetchData)
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  animation: fadeIn 0.4s ease both;
}

/* ===== 链接按钮 hover 增强 ===== */
:deep(.el-button.is-link:hover) {
  transform: scale(1.12);
}
</style>
