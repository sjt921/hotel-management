import { Client } from '@stomp/stompjs'

/**
 * WebSocket 连接管理（多会话隔离版）
 *
 * 解决的问题：
 *  1. 原先 stompClient 是模块级单例，管理端与用户端（不同标签页/角色）会互相
 *     顶替连接：新连接建立前 deactivate() 未等待完成，旧连接被强制中断，
 *     导致先弹「连接失败」再弹「连接成功」。
 *  2. 现在按 sessionId 维护独立连接，同一会话复用已有连接，互不干扰。
 */

// sessionId -> { client, connected, subscribed }
const pool = new Map()

// 回调保持全局注册（每个页面挂载时覆盖），与原有用法兼容
let newMessageCallback = null
let notificationCallback = null

// 当前活动会话（供 sendMessage 无参调用时使用）
let activeSessionId = null

const WS_URL = (() => {
  // 跟随当前页面协议与主机，避免 localhost / 局域网 IP 混用导致的跨源抢占
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${window.location.host}/ws`
})()

/**
 * 建立（或复用）指定会话的 WebSocket 连接
 * @param {string} role      'admin' | 'user'
 * @param {string} sessionId 会话标识，如 'admin' 或 'user_1'
 * @param {object} options   { silent: 是否静默（不抛错给调用方） }
 * @returns {Promise<void>}
 */
export function useWebSocket() {
  const connect = (role = 'user', sessionId = 'default', options = {}) => {
    activeSessionId = sessionId

    // 已有可用连接：直接复用，不再重连（消除重复弹窗）
    const existing = pool.get(sessionId)
    if (existing && existing.connected && existing.client.active) {
      return Promise.resolve()
    }

    // 清理同 sessionId 的旧连接（不阻塞新建，后台异步关闭）
    if (existing) {
      try {
        existing.client.deactivate()
      } catch (e) {}
      pool.delete(sessionId)
    }

    return new Promise((resolve, reject) => {
      let settled = false

      const client = new Client({
        brokerURL: WS_URL,
        reconnectDelay: 3000,        // 断线后 3 秒自动重连
        heartbeatIncoming: 10000,    // 放宽心跳，避免弱网误判
        heartbeatOutgoing: 10000,
        connectionTimeout: 10000,
        onConnect: () => {
          const entry = pool.get(sessionId)
          if (entry) entry.connected = true

          // 管理员订阅管理端主题
          if (role === 'admin') {
            client.subscribe('/topic/admin', (msg) => {
              try {
                const body = JSON.parse(msg.body)
                if (newMessageCallback) newMessageCallback(body)
              } catch (e) {}
            })
            client.subscribe('/topic/admin/notification', (msg) => {
              try {
                const body = JSON.parse(msg.body)
                if (notificationCallback) notificationCallback(body)
              } catch (e) {}
            })
          }

          // 所有角色都订阅自己的会话主题
          client.subscribe('/topic/user/' + sessionId, (msg) => {
            try {
              const body = JSON.parse(msg.body)
              if (newMessageCallback) newMessageCallback(body)
            } catch (e) {}
          })

          if (!settled) {
            settled = true
            resolve()
          }
        },
        onDisconnect: () => {
          const entry = pool.get(sessionId)
          if (entry) entry.connected = false
        },
        onStompError: (frame) => {
          console.error('[STOMP] Error:', frame.headers['message'])
          const entry = pool.get(sessionId)
          if (entry) entry.connected = false
          if (!settled) {
            settled = true
            if (options.silent) resolve()
            else reject(new Error(frame.headers['message'] || 'Connection error'))
          }
        },
        onWebSocketClose: () => {
          const entry = pool.get(sessionId)
          if (entry) entry.connected = false
          // 注意：不在此处 reject —— stompjs 会自动重连，
          // 首次连接超时由 connectionTimeout 负责
        }
      })

      pool.set(sessionId, { client, connected: false })

      try {
        client.activate()
      } catch (err) {
        console.error('[STOMP] Activate error:', err)
        pool.delete(sessionId)
        if (!settled) {
          settled = true
          if (options.silent) resolve()
          else reject(err)
        }
      }
    })
  }

  /**
   * 发送消息。未指定 sessionId 时使用当前活动会话
   */
  const sendMessage = (msg, sessionId = null) => {
    const sid = sessionId || activeSessionId
    const entry = sid ? pool.get(sid) : null
    if (entry && entry.connected && entry.client.active) {
      try {
        entry.client.publish({
          destination: '/app/chat.send',
          body: JSON.stringify(msg)
        })
        return true
      } catch (e) {
        console.error('[STOMP] Send error:', e)
        return false
      }
    }
    return false
  }

  /**
   * 断开连接。不传参数时断开当前活动会话；
   * 传 'all' 断开全部（退出登录时使用）
   */
  const disconnect = (sessionId = null) => {
    if (sessionId === 'all') {
      pool.forEach((entry) => {
        try { entry.client.deactivate() } catch (e) {}
      })
      pool.clear()
      activeSessionId = null
      return
    }

    const sid = sessionId || activeSessionId
    if (!sid) return
    const entry = pool.get(sid)
    if (entry) {
      try { entry.client.deactivate() } catch (e) {}
      pool.delete(sid)
    }
    if (sid === activeSessionId) activeSessionId = null
  }

  const isConnected = (sessionId = null) => {
    const sid = sessionId || activeSessionId
    const entry = sid ? pool.get(sid) : null
    return !!(entry && entry.connected)
  }

  const onNewMessage = (callback) => { newMessageCallback = callback }
  const onNotification = (callback) => { notificationCallback = callback }

  return {
    connect,
    sendMessage,
    disconnect,
    onNewMessage,
    onNotification,
    isConnected
  }
}