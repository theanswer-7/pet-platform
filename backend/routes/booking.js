const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { auth, adminAuth } = require('../middleware/auth');

// 用户预约相关路由
// 获取用户预约列表
router.get('/', auth, bookingController.getUserBookings);

// 获取预约详情
router.get('/:id', auth, bookingController.getBookingById);

// 创建预约
router.post('/', auth, bookingController.createBooking);

// 取消预约
router.put('/:id/cancel', auth, bookingController.cancelBooking);

// 管理员预约管理路由
// 获取所有预约（管理员）
router.get('/admin/all', auth, adminAuth, bookingController.getAllBookings);

// 更新预约状态（管理员）
router.put('/admin/:id/status', auth, adminAuth, bookingController.updateBookingStatus);

module.exports = router;