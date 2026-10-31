import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000
})

// ===== 网络层失败自动重试配置 =====
const MAX_RETRY = 2          // 最多重试 2 次（共请求 3 次）
const RETRY_DELAY = 1200     // 首次重试间隔 1.2 秒，之后翻倍

/**
 * 判断是否值得重试
 * 仅针对「网络层失败」重试：后端未就绪、连接被拒、超时、5xx
 * 业务错误（4xx / code != 200）不重试，避免重复提交
 */
const shouldRetry = (error) => {
  const cfg = error.config || {}
  if (cfg.__retryCount >= MAX_RETRY) return false

  // 无响应 = 网络层失败（ECONNREFUSED / 超时 / 代理转发失败）
  if (!error.response) return true

  // 服务端错误可重试
  const status = error.response.status
  return status >= 500
}

// 请求拦截器 - 添加 token
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = token
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器 - 统一处理错误
request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code === 200) {
      return res
    } else if (res.code === 401) {
      ElMessage.error(res.message || '登录已过期，请重新登录')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(new Error(res.message))
    } else {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message))
    }
  },
  async error => {
    const config = error.config || {}

    // ===== 网络层失败：静默重试 =====
    if (shouldRetry(error)) {
      config.__retryCount = (config.__retryCount || 0) + 1
      const delay = RETRY_DELAY * Math.pow(2, config.__retryCount - 1)
      console.warn(
        `[请求重试 ${config.__retryCount}/${MAX_RETRY}] ${config.url} ` +
        `${delay}ms 后重试`
      )
      await new Promise(r => setTimeout(r, delay))
      return request(config)
    }

    // ===== 重试耗尽：区分错误类型给出准确提示 =====
    if (!error.response) {
      // 网络层彻底失败
      const isTimeout = error.code === 'ECONNABORTED'
      ElMessage.error(
        isTimeout
          ? '请求超时，请检查后端服务是否正常'
          : '无法连接服务器，请确认后端已启动'
      )
    } else {
      const status = error.response.status
      if (status >= 500) {
        ElMessage.error('服务暂时不可用，请稍后重试')
      } else if (status === 404) {
        ElMessage.error('请求的接口不存在')
      } else {
        ElMessage.error('网络错误，请稍后重试')
      }
    }
    return Promise.reject(error)
  }
)

export default request