<template>
  <div class="page">
    <el-card shadow="never">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input v-model="searchName" placeholder="搜索姓名" clearable style="width:180px"
                    @keyup.enter="fetchData" />
          <el-input v-model="searchPhone" placeholder="搜索手机号" clearable style="width:180px;margin-left:10px"
                    @keyup.enter="fetchData" />
        </div>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon> 新增客户
        </el-button>
      </div>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="70" />
        <el-table-column prop="idCard" label="身份证号" width="190" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑客户' : '新增客户'" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="form.idCard" placeholder="请输入身份证号" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
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
import { getCustomerList, addCustomer, updateCustomer, deleteCustomer } from '../../api'

const tableData = ref([])
const loading = ref(false)
const searchName = ref('')
const searchPhone = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const form = reactive({
  id: null,
  name: '',
  gender: '男',
  idCard: '',
  phone: ''
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
}

const resetForm = () => {
  form.id = null
  form.name = ''
  form.gender = '男'
  form.idCard = ''
  form.phone = ''
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getCustomerList({
      name: searchName.value,
      phone: searchPhone.value
    })
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
      await updateCustomer(form)
      ElMessage.success('更新成功')
    } else {
      await addCustomer(form)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (e) {}
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定删除该客户吗？', '提示', { type: 'warning' }).then(async () => {
    await deleteCustomer(row.id)
    ElMessage.success('删除成功')
    fetchData()
  })
}

watch([searchName, searchPhone], () => fetchData())
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

/* ===== 链接按钮 hover 增强 ===== */
:deep(.el-button.is-link:hover) {
  transform: scale(1.12);
}
</style>
