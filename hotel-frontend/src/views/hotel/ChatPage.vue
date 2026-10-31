<template>
  <div class="chat-container">
    <!-- ===== 左侧：会话列表（管理端） ===== -->
    <div class="chat-sidebar" v-if="isAdmin">
      <div class="sidebar-header">
        <span>💬 会话列表</span>
        <el-badge :value="totalUnread" :hidden="totalUnread === 0" :max="99" />
      </div>
      <div class="sidebar-body">
        <div
          v-for="s in sessions"
          :key="s.sessionId"
          class="session-item"
          :class="{ active: currentSession === s.sessionId }"
          @click="switchSession(s.sessionId)"
        >
          <el-avatar :size="36" icon="UserFilled" />
          <div class="session-info">
            <span class="session-name">{{ s.userName }}</span>
            <span class="session-preview">{{ sessionPreviews[s.sessionId] || '暂无消息' }}</span>
          </div>
          <el-badge
            v-if="sessionUnread[s.sessionId]"
            :value="sessionUnread[s.sessionId]"
            :max="99"
            class="session-badge"
          />
        </div>
        <div v-if="sessions.length === 0" class="no-session">
          <el-icon :size="40"><ChatDotRound /></el-icon>
          <p>暂无用户会话</p>
          <span>用户发送消息后将自动创建会话</span>
        </div>
      </div>
    </div>

    <!-- ===== 右侧：聊天区域 ===== -->
    <div class="chat-main" :class="{ expanded: !isAdmin }">
      <!-- 聊天头部 -->
      <div class="chat-header">
        <div class="chat-header-left">
          <el-avatar :size="36" :icon="isAdmin ? 'UserFilled' : 'Avatar'" />
          <div class="header-info">
            <span class="header-name">
              {{ isAdmin ? (currentSessionName || '选择一个会话') : '酒店前台客服' }}
            </span>
            <span class="header-status" v-if="isAdmin && currentSession">在线</span>
          </div>
        </div>
        <div class="chat-header-right">
          <el-tag v-if="!connected" type="danger" size="small">连接断开</el-tag>
          <el-tag v-else type="success" size="small">已连接</el-tag>
          <el-button v-if="!connected" size="small" type="primary" @click="reconnect" :loading="reconnecting">
            重连
          </el-button>
        </div>
      </div>

      <!-- 消息列表 -->
      <TransitionGroup name="message" tag="div" class="chat-messages" ref="msgContainer">
        <div v-if="messages.length === 0 && currentSession" key="empty-curr" class="empty-chat">
          <el-icon :size="48"><ChatLineSquare /></el-icon>
          <p>暂无消息</p>
          <span>发送第一条消息开始对话</span>
        </div>
        <div v-if="!currentSession && isAdmin" key="empty-select" class="empty-chat">
          <el-icon :size="48"><ChatDotRound /></el-icon>
          <p>请选择一个会话</p>
          <span>从左侧列表选择一个用户开始聊天</span>
        </div>

        <div
          v-for="msg in messages"
          :key="msg.id"
          class="message-item"
          :class="{ 'message-mine': isMyMessage(msg) }"
        >
          <el-avatar
            :size="32"
            :icon="msg.senderRole === 'admin' ? 'Avatar' : 'UserFilled'"
            class="message-avatar"
          />
          <div class="message-body">
            <div class="message-sender">{{ msg.senderName || (msg.senderRole === 'admin' ? '前台' : '用户') }}</div>
            <div class="message-bubble">{{ msg.content }}</div>
            <div class="message-time">{{ formatTime(msg.createTime) }}</div>
          </div>
        </div>
      </TransitionGroup>

      <!-- 输入区域 -->
      <div class="chat-input-area" v-if="currentSession || !isAdmin">
        <div class="input-wrapper">
          <el-input
            v-model="inputText"
            placeholder="输入消息，按 Enter 发送..."
            type="textarea"
            :rows="2"
            :disabled="!connected"
            @keyup.enter.exact="sendMsg"
            resize="none"
          />
        </div>
        <el-button
          type="primary"
          :disabled="!inputText.trim() || !connected"
          @click="sendMsg"
          class="send-btn"
        >发 送</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useWebSocket } from '../../utils/websocket'
import { getChatHistory, getSessions } from '../../api/message'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()
const isAdmin = computed(() => userStore.isAdmin())
const currentUserId = computed(() => userStore.user?.id || 0)
const currentUserName = computed(() => userStore.user?.realName || userStore.user?.username || '用户')

const { connect, sendMessage, disconnect, onNewMessage, onNotification, isConnected } = useWebSocket()

const messages = ref([])
const sessions = ref([])
const currentSession = ref('')
const currentSessionName = ref('')
const inputText = ref('')
const connected = ref(false)
const reconnecting = ref(false)
const msgContainer = ref(null)
const sessionPreviews = ref({})
const sessionUnread = ref({})
const totalUnread = ref(0)

// ===== 判断消息归属 =====
const isMyMessage = (msg) => {
  if (isAdmin.value) return msg.senderRole === 'admin'
  return msg.senderRole === 'user'
}

const formatTime = (t) => {
  if (!t) return ''
  const str = typeof t === 'string' ? t : ''
  return str.substring(0, 16).replace('T', ' ')
}

// ===== 滚动到底部 =====
const scrollToBottom = async () => {
  await nextTick()
  if (msgContainer.value) {
    msgContainer.value.scrollTop = msgContainer.value.scrollHeight
  }
}

// ===== 切换会话 =====
const switchSession = async (sessionId) => {
  currentSession.value = sessionId
  // 查找对应的用户名
  const sessionObj = sessions.value.find(s => s.sessionId === sessionId)
  currentSessionName.value = sessionObj ? sessionObj.userName : sessionId
  // 清除该会话的未读计数
  sessionUnread.value[sessionId] = 0
  updateTotalUnread()
  try {
    const res = await getChatHistory(sessionId)
    messages.value = res.data || []
    await scrollToBottom()
  } catch (e) {
    messages.value = []
  }
}

// ===== 发送消息 =====
const sendMsg = () => {
  const text = inputText.value.trim()
  if (!text) return

  const sessionId = isAdmin.value ? currentSession.value : 'user_' + currentUserId.value

  if (!sessionId) {
    ElMessage.warning('请先选择一个会话')
    return
  }

  const msg = {
    senderRole: isAdmin.value ? 'admin' : 'user',
    senderName: currentUserName.value,
    receiverRole: isAdmin.value ? 'user' : 'admin',
    content: text,
    sessionId: sessionId,
    isRead: false
  }

  const sent = sendMessage(msg, isAdmin.value ? 'admin' : 'user_' + currentUserId.value)
  if (sent) {
    // 本地立即显示
    const localMsg = { ...msg, id: Date.now(), createTime: new Date().toISOString() }
    messages.value.push(localMsg)
    inputText.value = ''
    scrollToBottom()

    // 更新会话预览
    if (isAdmin.value) {
      sessionPreviews.value[sessionId] = text.length > 30 ? text.substring(0, 30) + '...' : text
    }
  } else {
    ElMessage.error('消息发送失败，请检查连接状态')
  }
}

// ===== 获取会话列表（管理端） =====
const fetchSessions = async (retry = 0) => {
  if (!isAdmin.value) return
  try {
    const res = await getSessions()
    const list = (res.data || []).filter(s => s && s.sessionId)
    sessions.value = list
    // 为每个会话生成预览
    for (const s of list) {
      const sid = s.sessionId
      try {
        const histRes = await getChatHistory(sid)
        const msgs = histRes.data || []
        if (msgs.length > 0) {
          const last = msgs[msgs.length - 1]
          sessionPreviews.value[sid] = last.content
            ? (last.content.length > 30 ? last.content.substring(0, 30) + '...' : last.content)
            : ''
        }
        sessionUnread.value[sid] = msgs.filter(m => !m.isRead && m.senderRole === 'user').length
      } catch (e) {}
    }
    updateTotalUnread()
    // 自动选择第一个会话
    if (list.length > 0 && !currentSession.value) {
      switchSession(list[0].sessionId)
    }
  } catch (e) {
    console.error('获取会话列表失败', e)
    // 后端可能尚未就绪，延迟重试最多 2 次
    if (retry < 2) {
      setTimeout(() => fetchSessions(retry + 1), 2000 * (retry + 1))
    }
  }
}

const updateTotalUnread = () => {
  totalUnread.value = Object.values(sessionUnread.value).reduce((a, b) => a + (b || 0), 0)
}

// ===== WebSocket 连接 =====
const mySessionId = computed(() =>
  isAdmin.value ? 'admin' : 'user_' + currentUserId.value
)

// 连接状态巡检定时器
let healthTimer = null

const doConnect = async () => {
  // 已经连上就不重复建连，避免出现「先断开再连接」的闪断提示
  if (isConnected(mySessionId.value)) {
    connected.value = true
    return
  }
  try {
    const role = isAdmin.value ? 'admin' : 'user'
    await connect(role, mySessionId.value)
    connected.value = true
    ElMessage.success('消息服务已连接')
  } catch (e) {
    connected.value = false
    console.error('WebSocket 连接失败:', e.message)
    // 延迟判断：stompjs 会自动重连，若此时已重连成功则不再提示失败
    setTimeout(() => {
      if (isConnected(mySessionId.value)) {
        connected.value = true
      } else {
        ElMessage.warning('消息服务连接中，将自动重试...')
      }
    }, 3500)
  }
}

const reconnect = async () => {
  reconnecting.value = true
  try {
    disconnect(mySessionId.value)
    await doConnect()
  } finally {
    reconnecting.value = false
  }
}

// ===== 初始化 =====
onMounted(async () => {
  await doConnect()

  // 注册新消息回调
  onNewMessage((msg) => {
    const sessionId = msg.sessionId
    // 只显示当前会话的消息
    if (sessionId === currentSession.value ||
        (isAdmin.value && sessionId === currentSession.value) ||
        (!isAdmin.value && msg.senderRole === 'admin')) {
      messages.value.push(msg)
      scrollToBottom()
      // 标记已读
      if (isMyMessage(msg) === false) {
        // 对方发的消息
      }
    }

    // 管理端：更新未读计数和预览
    if (isAdmin.value && msg.senderRole === 'user') {
      if (sessionId !== currentSession.value) {
        sessionUnread.value[sessionId] = (sessionUnread.value[sessionId] || 0) + 1
        updateTotalUnread()
      }
      sessionPreviews.value[sessionId] = msg.content
        ? (msg.content.length > 30 ? msg.content.substring(0, 30) + '...' : msg.content)
        : ''
      // 新会话加入列表
      if (!sessions.value.find(s => s.sessionId === sessionId)) {
        sessions.value.push({ sessionId, userName: msg.senderName || sessionId })
      }
    }

    // 用户端：收到管理员消息
    if (!isAdmin.value && msg.senderRole === 'admin') {
      messages.value.push(msg)
      scrollToBottom()
    }
  })

  // 注册通知回调（管理端弹窗）
  onNotification((msg) => {
    if (isAdmin.value && msg.senderRole === 'user') {
      ElMessage({
        message: `新消息 | ${msg.senderName}: ${(msg.content || '').substring(0, 30)}...`,
        type: 'warning',
        duration: 4000,
        showClose: true
      })
    }
  })

  // 获取会话列表
  await fetchSessions()

  // 状态巡检：每 3 秒同步一次真实连接状态，断线后自动尝试重连
  healthTimer = setInterval(() => {
    const ok = isConnected(mySessionId.value)
    connected.value = ok
    if (!ok) {
      // 静默重连，不弹提示
      connect(isAdmin.value ? 'admin' : 'user', mySessionId.value,
              { silent: true }).catch(() => {})
    }
  }, 3000)
})

// 销毁时断开连接
onUnmounted(() => {
  if (healthTimer) {
    clearInterval(healthTimer)
    healthTimer = null
  }
  disconnect(mySessionId.value)
})
</script>

<style scoped>
/* ===== 整体布局 ===== */
.chat-container {
  display: flex;
  height: calc(100vh - 140px);
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

/* ===== 左侧会话列表（管理端） ===== */
.chat-sidebar {
  width: 240px;
  min-width: 240px;
  border-right: 1px solid #ebeef5;
  background: #fafbfc;
  display: flex;
  flex-direction: column;
}
.sidebar-header {
  padding: 16px;
  font-weight: bold;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}
.sidebar-body {
  flex: 1;
  overflow-y: auto;
}
.session-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}
.session-item:hover { background: #ecf5ff; }
.session-item.active { background: #d9ecff; }
.session-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.session-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}
.session-preview {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.session-badge {
  flex-shrink: 0;
}
.no-session {
  padding: 40px 20px;
  text-align: center;
  color: #999;
}
.no-session .el-icon { color: #c0c4cc; }
.no-session p { margin: 10px 0 4px; font-size: 14px; }
.no-session span { font-size: 12px; color: #ccc; }

/* ===== 右侧聊天区域 ===== */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* ===== 聊天头部 ===== */
.chat-header {
  padding: 10px 16px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
}
.chat-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.header-info {
  display: flex;
  flex-direction: column;
}
.header-name { font-size: 15px; font-weight: 500; color: #333; }
.header-status { font-size: 12px; color: #67C23A; }
.chat-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ===== 消息列表 ===== */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.empty-chat {
  text-align: center;
  color: #c0c4cc;
  padding: 60px 0;
  margin: auto;
}
.empty-chat .el-icon { margin-bottom: 8px; }
.empty-chat p { font-size: 15px; margin: 4px 0; color: #999; }
.empty-chat span { font-size: 13px; }

/* ===== 单条消息 ===== */
.message-item {
  display: flex;
  gap: 10px;
  max-width: 75%;
}
.message-mine {
  flex-direction: row-reverse;
  align-self: flex-end;
}
.message-avatar {
  flex-shrink: 0;
}
.message-body {
  display: flex;
  flex-direction: column;
}
.message-sender {
  font-size: 12px;
  color: #999;
  margin-bottom: 3px;
  padding: 0 6px;
}
.message-mine .message-sender {
  text-align: right;
}
.message-bubble {
  background: #fff;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.message-mine .message-bubble {
  background: #409EFF;
  color: #fff;
}
.message-time {
  font-size: 11px;
  color: #c0c4cc;
  margin-top: 4px;
  padding: 0 6px;
}
.message-mine .message-time {
  text-align: right;
}

/* ===== 输入区域 ===== */
.chat-input-area {
  padding: 12px 16px;
  border-top: 1px solid #ebeef5;
  background: #fff;
  display: flex;
  gap: 12px;
  align-items: flex-end;
}
.input-wrapper {
  flex: 1;
}
.send-btn {
  height: 40px;
  min-width: 70px;
  transition: all 0.2s ease;
}
.send-btn:active {
  transform: scale(0.94);
}

/* ===== 消息入场动画 ===== */
.message-enter-active {
  transition: all 0.35s ease-out;
}
.message-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.92);
}
.message-move {
  transition: transform 0.3s ease;
}

/* ===== 会话项 hover 增强 ===== */
.session-item {
  transition: all 0.25s ease;
}
.session-item:hover {
  transform: scale(1.02);
  background: #ecf5ff;
}
.session-item.active {
  transform: scale(1.01);
}

/* ===== 连接状态标签呼吸 ===== */
.el-tag--success {
  animation: pulse 2s ease infinite;
}

/* ===== 输入框 focus ===== */
:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #409EFF;
  transition: box-shadow 0.25s;
}
</style>
