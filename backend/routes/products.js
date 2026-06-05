const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// 公开路由
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/flash-sale', productController.getFlashSaleProducts);
router.get('/hot', productController.getHotProducts);
router.get('/:id', productController.getProductById);

module.exports = router;