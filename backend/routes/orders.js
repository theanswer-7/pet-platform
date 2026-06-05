const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// 简单的身份验证中间件
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "请先登录"
    });
  }
  
  // 简单验证token格式，匹配后端登录API返回的格式: "jwt_real_token_" + Date.now() + "_" + user.id
  const tokenParts = token.split('_');
  if (tokenParts.length < 4 || tokenParts[0] !== 'jwt' || tokenParts[1] !== 'real' || tokenParts[2] !== 'token') {
    return res.status(401).json({
      success: false,
      message: "无效的令牌"
    });
  }
  
  // 从token中提取用户ID
  const userId = tokenParts[tokenParts.length - 1];
  req.user = { id: userId };
  next();
};

// 获取用户订单列表
router.get('/', authenticate, orderController.getUserOrders);

// 获取订单详情
router.get('/:id', authenticate, orderController.getOrderById);

// 创建订单
router.post('/', authenticate, orderController.createOrder);

// 取消订单
router.put('/:id/cancel', authenticate, orderController.cancelOrder);

// 确认收货
router.put('/:id/confirm', authenticate, orderController.confirmReceipt);

// 支付订单
router.put('/:id/pay', authenticate, orderController.payOrder);

module.exports = router;