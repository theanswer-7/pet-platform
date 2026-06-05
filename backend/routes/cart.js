const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { auth } = require('../middleware/auth');

// 所有购物车路由都需要认证
router.use(auth);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/update', cartController.updateCartItem);
router.delete('/remove', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);
router.post('/sync', cartController.syncCart);

module.exports = router;