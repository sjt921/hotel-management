import request from '../utils/request'

// ============ 消息相关 ============

/** 获取聊天历史（按会话ID） */
export const getChatHistory = (sessionId) =>
  request.get('/message/history', { params: { sessionId } })

/** 获取所有会话列表（管理端） */
export const getSessions = () =>
  request.get('/message/sessions')

/** 标记消息为已读 */
export const markMessageRead = (id) =>
  request.put(`/message/read/${id}`)

/** 获取未读消息数 */
export const getUnreadCount = (receiverRole = 'admin') =>
  request.get('/message/unread', { params: { receiverRole } })
