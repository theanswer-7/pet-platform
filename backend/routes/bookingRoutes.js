const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { auth, adminAuth } = require('../middleware/auth');

// 创建预约 - 需要用户认证
router.post('/', auth, bookingController.createBooking);

// 获取用户预约列表 - 需要用户认证
router.get('/user', auth, bookingController.getUserBookings);

// 获取预约详情 - 需要用户认证
router.get('/:id', auth, bookingController.getBookingById);

// 取消预约 - 需要用户认证
router.put('/:id/cancel', auth, bookingController.cancelBooking);

// 管理员获取所有预约 - 需要管理员权限
router.get('/admin/all', auth, bookingController.getAllBookings);

// 管理员更新预约状态 - 需要管理员权限
router.put('/admin/:id/status', auth, adminAuth, bookingController.updateBookingStatus);

module.exports = router;