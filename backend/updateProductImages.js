const mysql = require('mysql2/promise');
require('dotenv').config();

// 创建数据库连接
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'pet_platform',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 商品图片映射
const productImageMap = {
  '皇家狗粮 成犬粮': 'https://img.alicdn.com/imgextra/i1/2206682938687/O1CN01QqZ8v81Cf8zK8n5rF_!!2206682938687.jpg',
  '皇家猫粮 成猫粮': 'https://img.alicdn.com/imgextra/i3/2206682938687/O1CN01YrJQaM1Cf8zJQj5Yw_!!2206682938687.jpg',
  '宠物互动玩具 智能球': 'https://img.alicdn.com/imgextra/i2/2206682938687/O1CN01q7VvX81Cf8zK8n5rH_!!2206682938687.jpg',
  '宠物关节保健片': 'https://img.alicdn.com/imgextra/i4/2206682938687/O1CN01q7VvX81Cf8zK8n5rH_!!2206682938687.jpg',
  '宠物半封闭式窝': 'https://img.alicdn.com/imgextra/i1/2206682938687/O1CN01QqZ8v81Cf8zK8n5rF_!!2206682938687.jpg',
  '宠物香波 柔顺护毛': 'https://img.alicdn.com/imgextra/i3/2206682938687/O1CN01Z9Xq5d1Cf8zJQj5Yx_!!2206682938687.jpg'
};

// 更新商品图片
async function updateProductImages() {
  try {
    console.log('开始更新商品图片...');
    
    for (const [productName, imageUrl] of Object.entries(productImageMap)) {
      console.log(`更新商品: ${productName}`);
      
      // 检查商品是否存在
      const [products] = await db.query(
        'SELECT id, name, image_url FROM products WHERE name = ?',
        [productName]
      );
      
      if (products.length === 0) {
        console.log(`商品 ${productName} 不存在，跳过`);
        continue;
      }
      
      const product = products[0];
      console.log(`找到商品: ${product.name} (ID: ${product.id})`);
      console.log(`当前图片URL: ${product.image_url}`);
      console.log(`新图片URL: ${imageUrl}`);
      
      // 更新图片URL
      const [result] = await db.query(
        'UPDATE products SET image_url = ? WHERE name = ?',
        [imageUrl, productName]
      );
      
      if (result.affectedRows > 0) {
        console.log(`✅ 成功更新商品 ${productName} 的图片URL`);
      } else {
        console.log(`❌ 更新商品 ${productName} 的图片URL失败`);
      }
      
      console.log('---');
    }
    
    console.log('商品图片更新完成');
    
    // 验证更新结果
    console.log('\n验证更新结果:');
    for (const productName of Object.keys(productImageMap)) {
      const [products] = await db.query(
        'SELECT name, image_url FROM products WHERE name = ?',
        [productName]
      );
      
      if (products.length > 0) {
        const product = products[0];
        console.log(`${product.name}: ${product.image_url}`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('更新商品图片失败:', error);
    process.exit(1);
  }
}

// 执行更新
updateProductImages();