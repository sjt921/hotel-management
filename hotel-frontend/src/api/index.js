import request from '../utils/request'

// ============ 用户相关 ============
export const login = (data) => request.post('/user/login', data)
export const register = (data) => request.post('/user/register', data)
export const getUserList = () => request.get('/user/list')
export const getUserById = (id) => request.get(`/user/${id}`)
export const addUser = (data) => request.post('/user', data)
export const updateUser = (data) => request.put('/user', data)
export const deleteUser = (id) => request.delete(`/user/${id}`)

// ============ 房型相关 ============
export const getRoomTypeList = (params) => request.get('/roomType/list', { params })
export const getRoomTypeById = (id) => request.get(`/roomType/${id}`)
export const addRoomType = (data) => request.post('/roomType', data)
export const updateRoomType = (data) => request.put('/roomType', data)
export const deleteRoomType = (id) => request.delete(`/roomType/${id}`)

// ============ 房间相关 ============
export const getRoomList = (params) => request.get('/room/list', { params })
export const getRoomById = (id) => request.get(`/room/${id}`)
export const getAvailableRooms = () => request.get('/room/available')
export const addRoom = (data) => request.post('/room', data)
export const updateRoom = (data) => request.put('/room', data)
export const deleteRoom = (id) => request.delete(`/room/${id}`)

// ============ 客户相关 ============
export const getCustomerList = (params) => request.get('/customer/list', { params })
export const getCustomerById = (id) => request.get(`/customer/${id}`)
export const addCustomer = (data) => request.post('/customer', data)
export const updateCustomer = (data) => request.put('/customer', data)
export const deleteCustomer = (id) => request.delete(`/customer/${id}`)

// ============ 预订相关 ============
export const getBookingList = (params) => request.get('/booking/list', { params })
export const getBookingById = (id) => request.get(`/booking/${id}`)
export const addBooking = (data) => request.post('/booking', data)
export const updateBooking = (data) => request.put('/booking', data)
export const deleteBooking = (id) => request.delete(`/booking/${id}`)
export const checkIn = (id) => request.put(`/booking/checkIn/${id}`)
export const checkOut = (id) => request.put(`/booking/checkOut/${id}`)
export const cancelBooking = (id) => request.put(`/booking/cancel/${id}`)
