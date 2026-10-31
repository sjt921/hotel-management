<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">山间棠酒店</h2>
      <p class="login-subtitle">湘潭雨湖店 · Hotel Management System</p>

      <!-- 登录方式切换导航 -->
      <div class="login-tabs">
        <div
          class="tab-item"
          :class="{ active: loginMode === 'admin' }"
          @click="switchLoginMode('admin')"
        >
          <el-icon :size="16"><Avatar /></el-icon>
          <span>管理员登录</span>
        </div>
        <div
          class="tab-item"
          :class="{ active: loginMode === 'user' }"
          @click="switchLoginMode('user')"
        >
          <el-icon :size="16"><User /></el-icon>
          <span>用户登录</span>
        </div>
        <div class="tab-slider" :class="{ right: loginMode === 'user' }"></div>
      </div>

      <el-form :model="form" :rules="rules" ref="formRef" size="large">
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            :placeholder="loginMode === 'admin' ? '请输入管理员账号' : '请输入用户名'"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            @keyup.enter="handleLogin"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
            :type="loginMode === 'admin' ? 'primary' : 'success'"
            :loading="loading"
            @click="handleLogin"
            style="width:100%"
            size="large"
          >
            {{ loginMode === 'admin' ? '管理员登录' : '用户登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 用户登录模式显示注册入口，管理员模式不显示 -->
      <div class="login-footer">
        <template v-if="loginMode === 'user'">
          <span>还没有账号？</span>
          <el-link type="primary" @click="showRegister = true">立即注册</el-link>
        </template>
        <template v-else>
          <span class="admin-hint">仅限酒店工作人员登录</span>
        </template>
      </div>
    </div>

    <!-- 注册对话框 -->
    <el-dialog v-model="showRegister" title="用户注册" width="420px" :close-on-click-modal="false">
      <el-form :model="regForm" :rules="regRules" ref="regFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="regForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="regForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="regForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="regForm.phone" placeholder="请输入手机号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRegister = false">取消</el-button>
        <el-button type="primary" :loading="regLoading" @click="handleRegister">注册</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login, register } from '../api'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

// 登录模式: admin / user
const loginMode = ref('admin')
const formRef = ref(null)
const loading = ref(false)
const form = reactive({
  username: 'admin',
  password: '123456'
})

const switchLoginMode = (mode) => {
  loginMode.value = mode
  if (mode === 'admin') {
    form.username = 'admin'
    form.password = '123456'
  } else {
    form.username = ''
    form.password = ''
  }
}

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    const res = await login(form)
    userStore.setAuth(res.data.token, res.data.user)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (e) {
    // 错误已在拦截器中处理
  } finally {
    loading.value = false
  }
}

// 注册相关
const showRegister = ref(false)
const regLoading = ref(false)
const regFormRef = ref(null)
const regForm = reactive({
  username: '',
  password: '',
  realName: '',
  phone: '',
  role: 'user'
})

const regRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }]
}

const handleRegister = async () => {
  const valid = await regFormRef.value.validate().catch(() => false)
  if (!valid) return
  regLoading.value = true
  try {
    await register(regForm)
    ElMessage.success('注册成功，请登录')
    showRegister.value = false
  } catch (e) {
    // 错误已在拦截器中处理
  } finally {
    regLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%);
  background-size: 200% 200%;
  animation: gradientShift 8s ease infinite;
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-card {
  width: 420px;
  background: #fff;
  border-radius: 12px;
  padding: 40px 36px 32px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  animation: fadeInUp 0.6s ease both;
}
.login-title {
  text-align: center;
  color: #1e3c72;
  margin-bottom: 4px;
  font-size: 24px;
  animation: fadeInDown 0.5s ease both;
  animation-delay: 0.15s;
}
.login-subtitle {
  text-align: center;
  color: #999;
  font-size: 13px;
  margin-bottom: 28px;
  animation: fadeInDown 0.5s ease both;
  animation-delay: 0.25s;
}

/* ========== 登录方式切换导航 ========== */
.login-tabs {
  display: flex;
  position: relative;
  background: #f0f2f5;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 28px;
  animation: fadeIn 0.5s ease both;
  animation-delay: 0.35s;
}
.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 0;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  border-radius: 6px;
  position: relative;
  z-index: 2;
  transition: color 0.3s, transform 0.25s;
  user-select: none;
}
.tab-item:hover {
  color: #333;
  transform: scale(1.05);
}
.tab-item.active {
  color: #fff;
}
.tab-slider {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: linear-gradient(135deg, #409EFF, #337ECC);
  border-radius: 6px;
  z-index: 1;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.tab-slider.right {
  transform: translateX(100%);
}

/* ===== 输入框 hover/focus 上浮 ===== */
:deep(.el-input__wrapper) {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
:deep(.el-input__wrapper:hover) {
  transform: translateY(-1px);
}
:deep(.el-input__wrapper:focus-within),
:deep(.el-input.is-focus .el-input__wrapper) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
}

.login-footer {
  text-align: center;
  font-size: 14px;
  color: #999;
  margin-top: 4px;
  animation: fadeIn 0.5s ease both;
  animation-delay: 0.45s;
}
.login-footer .el-link {
  transition: all 0.25s;
}
.login-footer .el-link:hover {
  transform: scale(1.08);
}
.admin-hint {
  color: #999;
  font-size: 13px;
}
</style>
