const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require("dotenv").config();

// 引入路由
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ========== 数据库连接 ==========
let db;

async function connectDatabase() {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "123456",
      database: process.env.DB_NAME || "pet_platform",
      port: process.env.DB_PORT || 3306
    });
    
    console.log("✅ 数据库连接成功");
    
    // 确保用户表存在
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 确保订单表存在
    await db.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(50) NOT NULL UNIQUE,
        user_id INT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        shipping_fee DECIMAL(10, 2) DEFAULT 0,
        final_amount DECIMAL(10, 2) NOT NULL,
        shipping_address_name VARCHAR(100),
        shipping_address_phone VARCHAR(20),
        shipping_address_province VARCHAR(50),
        shipping_address_city VARCHAR(50),
        shipping_address_district VARCHAR(50),
        shipping_address_detail TEXT,
        payment_method VARCHAR(20) DEFAULT 'alipay',
        payment_status VARCHAR(20) DEFAULT 'pending',
        order_status VARCHAR(20) DEFAULT 'pending',
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        cancelled_at TIMESTAMP NULL,
        delivered_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    // 确保订单项表存在
    await db.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        product_image VARCHAR(500),
        price DECIMAL(10, 2) NOT NULL,
        quantity INT NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id)
      )
    `);
    
    // 确保购物车表存在
    await db.execute(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        selected BOOLEAN DEFAULT 1,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE KEY unique_user_product (user_id, product_id)
      )
    `);
    
    // 确保商品表存在
    await db.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        original_price DECIMAL(10, 2),
        image_url VARCHAR(500),
        images TEXT,
        category VARCHAR(50) DEFAULT 'food',
        stock INT DEFAULT 0,
        sales_count INT DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        is_new BOOLEAN DEFAULT 0,
        is_hot BOOLEAN DEFAULT 0,
        is_flash_sale BOOLEAN DEFAULT 0,
        flash_sale_start TIMESTAMP NULL,
        flash_sale_end TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // 确保服务类型表存在
    await db.execute(`
      CREATE TABLE IF NOT EXISTS service_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        duration INT NOT NULL COMMENT '服务时长(分钟)',
        price DECIMAL(10, 2) NOT NULL,
        image VARCHAR(500),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // 确保服务人员表存在
    await db.execute(`
      CREATE TABLE IF NOT EXISTS service_providers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(100),
        specialty VARCHAR(100) COMMENT '专业领域',
        experience_years INT DEFAULT 0,
        rating DECIMAL(2, 1) DEFAULT 5.0,
        introduction TEXT,
        avatar VARCHAR(500),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // 确保评价表存在
    await db.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        target_id INT NOT NULL COMMENT '评价对象ID(商品ID或服务ID)',
        type ENUM('product', 'service', 'provider') NOT NULL COMMENT '评价类型',
        rating INT NOT NULL COMMENT '评分1-5',
        content TEXT,
        images TEXT COMMENT '评价图片，JSON格式',
        is_anonymous BOOLEAN DEFAULT 0,
        status VARCHAR(20) DEFAULT 'published',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    // 确保收藏表存在
    await db.execute(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        target_id INT NOT NULL COMMENT '收藏对象ID(商品ID或宠物ID)',
        type ENUM('product', 'pet') NOT NULL COMMENT '收藏类型',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE KEY unique_user_target (user_id, target_id, type)
      )
    `);
    
    // 确保预约表存在
    await db.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_number VARCHAR(20) NOT NULL UNIQUE,
        user_id INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        address VARCHAR(255) NOT NULL,
        pet_type VARCHAR(20) NOT NULL,
        pet_info TEXT,
        service_type VARCHAR(50) NOT NULL,
        service_date DATE NOT NULL,
        service_time VARCHAR(20) DEFAULT 'morning',
        special_requests TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        cancel_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        cancelled_at TIMESTAMP NULL,
        confirmed_at TIMESTAMP NULL,
        completed_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    console.log("✅ 用户表、订单表、购物车表、商品表、预约表和服务相关表检查完成");
    return db;
  } catch (error) {
    console.error("❌ 数据库连接失败:", error.message);
    console.log("💡 请检查：");
    console.log("   1. MySQL服务是否运行 (net start mysql)");
    console.log("   2. 数据库密码是否正确");
    console.log("   3. 数据库 'pet_platform' 是否存在");
    process.exit(1);
  }
}

// ========== 中间件 ==========
// 🔥 修复：使用更完整的CORS配置
const corsOptions = {
  origin: function (origin, callback) {
    // 允许的源列表
    const allowedOrigins = [
      'http://localhost:8080',
      'http://10.181.74.86:8080',
      'http://127.0.0.1:8080',
      undefined // 允许没有origin的请求（如移动应用）
    ];
    
    // 在开发环境中允许所有源
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // 检查源是否在允许列表中
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('不被CORS策略允许'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

// 应用CORS中间件
app.use(cors(corsOptions));

// 手动添加CORS头（确保所有请求都有正确的CORS头）
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // 设置允许的源
  if (process.env.NODE_ENV === 'development' || 
      ['http://localhost:8080', 'http://10.181.74.86:8080', 'http://127.0.0.1:8080'].includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || 'http://localhost:8080');
  }
  
  // 设置其他CORS头
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Max-Age', '86400'); // 24小时
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 添加静态文件服务中间件
app.use(express.static(__dirname + '/..'));

// 请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  console.log(`🌐 请求来源: ${req.headers.origin || '无'}`);
  if (req.method === 'POST' && req.body) {
    console.log('📦 请求体:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// ========== API 路由 ==========

// 使用路由
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/products', productRoutes);
app.use('/api', authRoutes);
app.use('/api/bookings', bookingRoutes);

// 1. 首页
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🐾 宠物领养平台后端API",
    version: "1.0.0",
    database: "已连接",
    endpoints: {
      home: "GET /",
      pets: "GET /api/pets",
      products: "GET /api/products",
      login: "POST /api/login",
      register: "POST /api/register",
      profile: "GET /api/profile",
      users: "GET /api/users",
      bookings: "GET /api/bookings (获取用户预约列表)",
      createBooking: "POST /api/bookings (创建预约)",
      bookingDetails: "GET /api/bookings/:id (获取预约详情)",
      cancelBooking: "PUT /api/bookings/:id/cancel (取消预约)",
      adminBookings: "GET /api/bookings/admin/all (管理员获取所有预约)",
      updateBookingStatus: "PUT /api/bookings/admin/:id/status (管理员更新预约状态)",
      serviceTypes: "GET /api/service-types (获取服务类型列表)",
      serviceProviders: "GET /api/service-providers (获取服务人员列表)",
      reviews: "GET /api/reviews (获取评价列表)",
      createReview: "POST /api/reviews (创建评价)",
      favorites: "GET /api/favorites (获取用户收藏列表)",
      addToFavorites: "POST /api/favorites (添加到收藏)",
      removeFromFavorites: "DELETE /api/favorites/:targetId/:type (从收藏中移除)",
      initPets: "GET /api/init-pets (清空并重新创建宠物数据)",
      init30Pets: "GET /api/init-30-pets (初始化30条宠物数据)",
      initProducts: "GET /api/init-products (初始化商品数据)",
      initServiceTypes: "GET /api/init-service-types (初始化服务类型数据)",
      initServiceProviders: "GET /api/init-service-providers (初始化服务人员数据)",
      updateCatImages: "GET /api/update-cat-images (更新猫咪图片URL)",
      updateAllPetImages: "GET /api/update-all-pet-images (更新所有宠物图片URL)"
    }
  });
});

// 2. 宠物列表
app.get("/api/pets", async (req, res) => {
  console.log('\n========== 获取宠物列表请求 ==========');
  
  try {
    // 首先创建pets表（如果不存在）
    await db.execute(`
      CREATE TABLE IF NOT EXISTS pets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        species VARCHAR(20) NOT NULL,
        breed VARCHAR(50),
        age INT,
        gender VARCHAR(10),
        color VARCHAR(20),
        size VARCHAR(20),
        location VARCHAR(50),
        story TEXT,
        vaccinated BOOLEAN DEFAULT true,
        sterilized BOOLEAN DEFAULT true,
        status VARCHAR(20) DEFAULT 'available',
        image VARCHAR(500),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 检查是否有数据
    const [existingPets] = await db.execute('SELECT COUNT(*) as count FROM pets');
    console.log(`数据库中现有宠物数量: ${existingPets[0].count}`);
    
    // 如果没有数据，插入模拟数据
    if (existingPets[0].count === 0) {
      console.log('📝 插入模拟宠物数据...');
      const mockPets = getMockPetsData();
      
      for (const pet of mockPets) {
        await db.execute(
          `INSERT INTO pets (name, species, breed, age, gender, color, size, location, story, vaccinated, sterilized, status, image) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [pet.name, pet.species, pet.breed, pet.age, pet.gender, pet.color, 
           pet.size, pet.location, pet.story, pet.vaccinated, pet.sterilized, 
           pet.status, pet.image]
        );
      }
      console.log(`✅ 已插入 ${mockPets.length} 条宠物数据`);
    }
    
    // 从数据库获取宠物数据
    const [pets] = await db.execute('SELECT * FROM pets ORDER BY id');
    console.log(`从数据库获取到 ${pets.length} 只宠物`);
    
    // 转换数据格式，确保与前端匹配
    const formattedPets = pets.map(pet => ({
      id: pet.id,
      name: pet.name,
      species: pet.species, // 应该是 'dog' 或 'cat'
      breed: pet.breed || '未知品种',
      color: pet.color || '未知颜色',
      age: pet.age, // 数字
      gender: pet.gender, // 'male' 或 'female'
      size: pet.size, // 'small'/'medium'/'large'
      location: pet.location || '未知地区',
      story: pet.story || '暂无故事',
      vaccinated: Boolean(pet.vaccinated),
      sterilized: Boolean(pet.sterilized),
      status: pet.status || 'available',
      image: pet.image || getDefaultImage(pet.species)
    }));
    
    console.log('✅ 返回格式化后的宠物数据');
    console.log(`🐕 狗狗数量: ${formattedPets.filter(p => p.species === 'dog').length}`);
    console.log(`🐈 猫咪数量: ${formattedPets.filter(p => p.species === 'cat').length}`);
    
    res.json({
      success: true,
      count: formattedPets.length,
      data: formattedPets
    });
    
  } catch (error) {
    console.error('❌ 获取宠物列表错误:', error);
    
    // 如果数据库出错，返回模拟数据
    const mockPets = getMockPetsData();
    console.log(`🔥 数据库错误，返回模拟数据: ${mockPets.length} 只宠物`);
    
    res.json({
      success: true,
      count: mockPets.length,
      data: mockPets
    });
  }
});

// 3. 初始化30条宠物数据
app.get("/api/init-30-pets", async (req, res) => {
  console.log('\n========== 初始化30条宠物数据 ==========');
  
  try {
    // 删除旧表
    await db.execute('DROP TABLE IF EXISTS pets');
    console.log('✅ 已删除旧的pets表');
    
    // 创建新表
    await db.execute(`
      CREATE TABLE pets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        species VARCHAR(20) NOT NULL,
        breed VARCHAR(50),
        age INT,
        gender VARCHAR(10),
        color VARCHAR(20),
        size VARCHAR(20),
        location VARCHAR(50),
        story TEXT,
        vaccinated BOOLEAN DEFAULT true,
        sterilized BOOLEAN DEFAULT true,
        status VARCHAR(20) DEFAULT 'available',
        image VARCHAR(500),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ 创建新的pets表');
    
    // 30条完整宠物数据
    const petsData = [
      // 狗狗 (1-15)
      ['旺财', 'dog', '金毛寻回犬', '金色', 12, 'male', 'large', '北京', '旺财是一只在小区里发现的流浪狗，性格温顺，喜欢和人玩耍，特别聪明。', true, true, 'available', 'https://ts1.tc.mm.bing.net/th/id/R-C.5adc2c07c8f7ea4ee0ede0092605063b?rik=PEh6Ga14EDVzXw&riu=http%3a%2f%2fpic.qianye88.com%2f4kcc0a2398a80-0c93-326f-96f7-fc5edf577eea.jpg&ehk=ZNrqb%2b1fI%2bFKV3GeQGV5jCmE7hhjwaKbTJt%2bizWmKV8%3d&risl=&pid=ImgRaw&r=0'],
      ['大黄', 'dog', '中华田园犬', '黄色', 18, 'male', 'medium', '上海', '大黄是只忠诚的看门狗，对主人非常忠诚，需要一个有院子的家。', true, true, 'available', 'https://images.unsplash.com/photo-1552053831-71594b276e1a?auto=format&fit=crop&w=400&h=300&q=80'],
      ['小白', 'dog', '萨摩耶', '白色', 6, 'female', 'medium', '广州', '小白是被人遗弃在路边的，现在非常亲人，喜欢和人玩耍。', true, true, 'available', 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?auto=format&fit=crop&w=400&h=300&q=80'],
      ['小黑', 'dog', '拉布拉多', '黑色', 8, 'male', 'large', '成都', '小黑性格活泼，喜欢游泳和接飞盘，是家庭的好伴侣。', true, true, 'available', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&h=300&q=80'],
      ['豆豆', 'dog', '柯基', '黄白色', 4, 'male', 'small', '重庆', '豆豆是一只活泼的柯基，喜欢追逐球类，需要足够运动空间。', true, true, 'available', 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=400&h=300&q=80'],
      ['球球', 'dog', '博美', '棕色', 3, 'female', 'small', '西安', '球球体型小巧，适合公寓饲养，性格活泼可爱。', true, true, 'available', 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&h=300&q=80'],
      ['乐乐', 'dog', '哈士奇', '灰白色', 10, 'male', 'large', '贵州', '乐乐精力充沛，需要大量运动，喜欢寒冷的天气。', true, true, 'available', 'https://images.unsplash.com/photo-1517423568366-8b81723034cb?auto=format&fit=crop&w=400&h=300&q=80'],
      ['欢欢', 'dog', '泰迪', '咖啡色', 5, 'female', 'small', '浙江', '欢欢聪明伶俐，已经学会了很多小技能，不掉毛适合过敏人群。', true, true, 'available', 'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=400&h=300&q=80'],
      ['壮壮', 'dog', '阿拉斯加', '黑白', 14, 'male', 'large', '黑龙江', '壮壮体型巨大但性格温和，喜欢雪地和户外活动。', true, true, 'available', 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&w=400&h=300&q=80'],
      ['小黄', 'dog', '柴犬', '黄色', 7, 'female', 'medium', '山东', '小黄表情丰富，性格独立，有时会有点固执。', true, true, 'available', 'https://images.unsplash.com/photo-1568572933382-74d440642117?auto=format&fit=crop&w=400&h=300&q=80'],
      ['点点', 'dog', '斑点狗', '白底黑点', 9, 'male', 'large', '福建', '点点性格活泼，需要大量运动，对小孩非常友善。', true, true, 'available', 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=400&h=300&q=80'],
      ['毛毛', 'dog', '松狮', '棕色', 11, 'female', 'medium', '云南', '毛毛性格独立，有时候像猫一样高傲，但很忠诚。', true, true, 'available', 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&h=300&q=80'],
      ['多多', 'dog', '比熊', '白色', 2, 'male', 'small', '北京', '多多还是个宝宝，活泼可爱，喜欢黏人。', true, false, 'available', 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=400&h=300&q=80'],
      ['花花', 'dog', '边牧', '黑白', 13, 'female', 'medium', '上海', '花花非常聪明，学习能力强，适合有经验的养犬人。', true, true, 'available', 'https://images.unsplash.com/photo-1552053831-71594b276e1a?auto=format&fit=crop&w=400&h=300&q=80'],
      ['旺旺', 'dog', '德牧', '黑背', 16, 'male', 'large', '广州', '旺旺曾经是警犬训练犬，服从性强，需要严格的训练。', true, true, 'available', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=400&h=300&q=80'],
      
      // 猫咪 (16-30)
      ['咪咪', 'cat', '中华田园猫', '橘色', 8, 'female', 'small', '成都', '咪咪是在公园救助的小猫，现在很健康，等待一个有爱的家。', true, true, 'available', 'https://images.unsplash.com/photo-1514888287012-5171f4c2e6d5?auto=format&fit=crop&w=400&h=300&q=80'],
      ['小黑', 'cat', '英短', '黑色', 10, 'male', 'medium', '重庆', '小黑是一只优雅的英短，性格安静，适合室内饲养。', true, true, 'available', 'https://images.unsplash.com/photo-1513360371663-058f8cc5cf56?auto=format&fit=crop&w=400&h=300&q=80'],
      ['小白', 'cat', '波斯猫', '白色', 4, 'female', 'small', '西安', '小白性格温和，喜欢安静的环境，需要定期梳理毛发。', true, true, 'available', 'https://images.unsplash.com/photo-1513360371663-058f8cc5cf56?auto=format&fit=crop&w=400&h=300&q=80'],
      ['花花', 'cat', '三花猫', '三色', 12, 'female', 'medium', '贵州', '花花性格独立，喜欢晒太阳，对主人很忠诚。', true, true, 'available', 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=400&h=300&q=80'],
      
      ['奶茶', 'cat', '布偶猫', '海豹色', 3, 'female', 'large', '黑龙江', '奶茶性格温顺如狗，喜欢跟随主人，是典型的"小狗猫"。', true, true, 'available', 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=400&h=300&q=80'],
      ['煤球', 'cat', '孟买猫', '纯黑', 7, 'male', 'medium', '山东', '煤球全身乌黑发亮，性格活泼好动，像个黑色的小精灵。', true, true, 'available', 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=400&h=300&q=80'],
      ['点点', 'cat', '美短', '银虎斑', 6, 'female', 'medium', '福建', '点点花纹美丽，性格友善，能和小孩友好相处。', true, true, 'available', 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=400&h=300&q=80'],
      ['豆豆', 'cat', '暹罗猫', '重点色', 4, 'male', 'small', '云南', '豆豆叫声特别，性格外向，喜欢和主人"对话"。', true, true, 'available', 'https://images.unsplash.com/photo-1513360371663-058f8cc5cf56?auto=format&fit=crop&w=400&h=300&q=80'],
      ['布丁', 'cat', '金渐层', '金色', 2, 'female', 'small', '北京', '布丁还是个活泼的小猫，喜欢追逐玩具，好奇心强。', true, false, 'available', 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=400&h=300&q=80'],
      ['团子', 'cat', '苏格兰折耳', '灰色', 9, 'male', 'medium', '上海', '团子耳朵折叠，表情可爱，性格安静温和。', true, true, 'available', 'https://images.unsplash.com/photo-1514888287012-5171f4c2e6d5?auto=format&fit=crop&w=400&h=300&q=80'],
      ['米粒', 'cat', '加菲猫', '乳色', 11, 'female', 'medium', '广州', '米粒脸型扁平，性格慵懒，喜欢安静的环境。', true, true, 'available', 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=400&h=300&q=80'],
      ['汤圆', 'cat', '挪威森林猫', '白色', 13, 'male', 'large', '成都', '汤圆毛发浓密，适应寒冷气候，性格沉稳。', true, true, 'available', 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=400&h=300&q=80'],
      ['奶酪', 'cat', '阿比西尼亚', '红褐色', 5, 'female', 'small', '重庆', '奶酪身材修长，动作优雅，喜欢在高处观察环境。', true, true, 'available', 'https://images.unsplash.com/photo-1513360371663-058f8cc5cf56?auto=format&fit=crop&w=400&h=300&q=80'],
      ['皮蛋', 'cat', '德文卷毛猫', '白色', 3, 'male', 'small', '西安', '皮蛋毛发卷曲，性格像狗一样亲人，喜欢玩耍。', true, true, 'available', 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=400&h=300&q=80']
    ];
    
    for (const pet of petsData) {
      await db.execute(
        `INSERT INTO pets (name, species, breed, color, age, gender, size, location, story, vaccinated, sterilized, status, image) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        pet
      );
    }
    
    console.log(`✅ 成功插入 ${petsData.length} 条宠物数据`);
    
    res.json({
      success: true,
      message: `成功初始化 ${petsData.length} 条宠物数据`,
      data: {
        dogs: 15,
        cats: 15,
        total: 30
      }
    });
    
  } catch (error) {
    console.error('❌ 初始化宠物数据失败:', error);
    res.status(500).json({
      success: false,
      message: "初始化失败",
      error: error.message
    });
  }
});

// 4. 清空并重新创建宠物表（保持原来的10条数据）
app.get("/api/init-pets", async (req, res) => {
  console.log('\n========== 手动初始化宠物数据 ==========');
  
  try {
    // 删除旧表
    await db.execute('DROP TABLE IF EXISTS pets');
    console.log('✅ 已删除旧的pets表');
    
    // 创建新表
    await db.execute(`
      CREATE TABLE pets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        species VARCHAR(20) NOT NULL,
        breed VARCHAR(50),
        age INT,
        gender VARCHAR(10),
        color VARCHAR(20),
        size VARCHAR(20),
        location VARCHAR(50),
        story TEXT,
        vaccinated BOOLEAN DEFAULT true,
        sterilized BOOLEAN DEFAULT true,
        status VARCHAR(20) DEFAULT 'available',
        image VARCHAR(500),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ 创建新的pets表');
    
    res.json({
      success: true,
      message: "已清空并重新创建pets表，访问 /api/pets 将自动插入10条数据"
    });
    
  } catch (error) {
    console.error('❌ 初始化宠物数据失败:', error);
    res.status(500).json({
      success: false,
      message: "初始化失败",
      error: error.message
    });
  }
});

// 5. 更新猫咪图片URL
app.get("/api/update-cat-images", async (req, res) => {
  console.log('\n========== 更新猫咪图片URL ==========');
  
  try {
    // 获取所有猫咪数据
    const [cats] = await db.execute('SELECT id, name, species FROM pets WHERE species = "cat"');
    console.log(`找到 ${cats.length} 只猫咪`);
    
    let updatedCount = 0;
    
    for (const cat of cats) {
      // 为每只猫咪生成新的图片URL
      const newImageUrl = `https://picsum.photos/seed/cat${cat.id}/400/300.jpg`;
      
      // 更新数据库中的图片URL
      await db.execute(
        'UPDATE pets SET image = ? WHERE id = ?',
        [newImageUrl, cat.id]
      );
      
      console.log(`✅ 已更新猫咪 ${cat.name}(ID: ${cat.id}) 的图片URL为: ${newImageUrl}`);
      updatedCount++;
    }
    
    res.json({
      success: true,
      message: `成功更新 ${updatedCount} 只猫咪的图片URL`,
      count: updatedCount
    });
    
  } catch (error) {
    console.error('❌ 更新猫咪图片URL失败:', error);
    res.status(500).json({
      success: false,
      message: "更新失败",
      error: error.message
    });
  }
});

// 6. 更新所有宠物图片URL
app.get("/api/update-all-pet-images", async (req, res) => {
  console.log('\n========== 更新所有宠物图片URL ==========');
  
  try {
    // 获取所有宠物数据
    const [pets] = await db.execute('SELECT id, name, species FROM pets');
    console.log(`找到 ${pets.length} 只宠物`);
    
    let updatedCount = 0;
    
    for (const pet of pets) {
      // 为每只宠物生成新的图片URL
      let newImageUrl;
      if (pet.species === 'dog') {
        newImageUrl = `https://placedog.net/400/300?id=${pet.id + 100}`;
      } else if (pet.species === 'cat') {
        newImageUrl = `https://picsum.photos/seed/cat${pet.id}/400/300.jpg`;
      }
      
      // 更新数据库中的图片URL
      await db.execute(
        'UPDATE pets SET image = ? WHERE id = ?',
        [newImageUrl, pet.id]
      );
      
      console.log(`✅ 已更新${pet.species === 'dog' ? '狗狗' : '猫咪'} ${pet.name}(ID: ${pet.id}) 的图片URL为: ${newImageUrl}`);
      updatedCount++;
    }
    
    res.json({
      success: true,
      message: `成功更新 ${updatedCount} 只宠物的图片URL`,
      count: updatedCount
    });
    
  } catch (error) {
    console.error('❌ 更新宠物图片URL失败:', error);
    res.status(500).json({
      success: false,
      message: "更新失败",
      error: error.message
    });
  }
});

// 辅助函数：获取默认图片
function getDefaultImage(species) {
  const dogImages = [
    'https://placedog.net/400/300?id=101',
    'https://placedog.net/400/300?id=102',
    'https://placedog.net/400/300?id=103'
  ];
  
  const catImages = [
    'https://picsum.photos/seed/cat1/400/300.jpg',
    'https://picsum.photos/seed/cat2/400/300.jpg',
    'https://picsum.photos/seed/cat3/400/300.jpg'
  ];
  
  if (species === 'dog') {
    return dogImages[Math.floor(Math.random() * dogImages.length)];
  } else {
    return catImages[Math.floor(Math.random() * catImages.length)];
  }
}

// 辅助函数：生成模拟宠物数据（保持原来的10条数据）
function getMockPetsData() {
  return [
    // 狗狗 (5只完整数据)
    {
      id: 1,
      name: '旺财',
      species: 'dog',
      breed: '金毛寻回犬',
      color: '金色',
      age: 12,
      gender: 'male',
      size: 'large',
      location: '北京',
      story: '旺财是一只在小区里发现的流浪狗，性格温顺，喜欢和人玩耍，特别聪明。',
      vaccinated: true,
      sterilized: true,
      status: 'available',
      image: 'https://ts1.tc.mm.bing.net/th/id/R-C.5adc2c07c8f7ea4ee0ede0092605063b?rik=PEh6Ga14EDVzXw&riu=http%3a%2f%2fpic.qianye88.com%2f4kcc0a2398a80-0c93-326f-96f7-fc5edf577eea.jpg&ehk=ZNrqb%2b1fI%2bFKV3GeQGV5jCmE7hhjwaKbTJt%2bizWmKV8%3d&risl=&pid=ImgRaw&r=0'
    },
    {
      id: 2,
      name: '大黄',
      species: 'dog',
      breed: '中华田园犬',
      color: '黄色',
      age: 18,
      gender: 'male',
      size: 'medium',
      location: '上海',
      story: '大黄是只忠诚的看门狗，对主人非常忠诚，需要一个有院子的家。',
      vaccinated: true,
      sterilized: true,
      status: 'available',
      image: 'https://images.unsplash.com/photo-1552053831-71594b276e1a?auto=format&fit=crop&w=400&h=300&q=80'
    },
    {
      id: 3,
      name: '小白',
      species: 'dog',
      breed: '萨摩耶',
      color: '白色',
      age: 6,
      gender: 'female',
      size: 'medium',
      location: '广州',
      story: '小白是被人遗弃在路边的，现在非常亲人，喜欢和人玩耍。',
      vaccinated: true,
      sterilized: true,
      status: 'available',
      image: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?auto=format&fit=crop&w=400&h=300&q=80'
    },
    {
      id: 4,
      name: '小黑',
      species: 'dog',
      breed: '拉布拉多',
      color: '黑色',
      age: 8,
      gender: 'male',
      size: 'large',
      location: '成都',
      story: '小黑性格活泼，喜欢游泳和接飞盘，是家庭的好伴侣。',
      vaccinated: true,
      sterilized: true,
      status: 'available',
      image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&h=300&q=80'
    },
    {
      id: 5,
      name: '豆豆',
      species: 'dog',
      breed: '柯基',
      color: '黄白色',
      age: 4,
      gender: 'male',
      size: 'small',
      location: '重庆',
      story: '豆豆是一只活泼的柯基，喜欢追逐球类，需要足够运动空间。',
      vaccinated: true,
      sterilized: true,
      status: 'available',
      image: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=400&h=300&q=80'
    },
    
    // 猫咪 (5只完整数据)
    {
      id: 6,
      name: '咪咪',
      species: 'cat',
      breed: '中华田园猫',
      color: '橘色',
      age: 8,
      gender: 'female',
      size: 'small',
      location: '西安',
      story: '咪咪是在公园救助的小猫，现在很健康，等待一个有爱的家。',
      vaccinated: true,
      sterilized: true,
      status: 'available',
      image: 'https://images.unsplash.com/photo-1514888287012-5171f4c2e6d5?auto=format&fit=crop&w=400&h=300&q=80'
    },
    {
      id: 7,
      name: '小黑',
      species: 'cat',
      breed: '英短',
      color: '黑色',
      age: 10,
      gender: 'male',
      size: 'medium',
      location: '贵州',
      story: '小黑是一只优雅的英短，性格安静，适合室内饲养。',
      vaccinated: true,
      sterilized: true,
      status: 'available',
      image: 'https://images.unsplash.com/photo-1513360371663-058f8cc5cf56?auto=format&fit=crop&w=400&h=300&q=80'
    },
    {
      id: 8,
      name: '小白',
      species: 'cat',
      breed: '波斯猫',
      color: '白色',
      age: 4,
      gender: 'female',
      size: 'small',
      location: '浙江',
      story: '小白性格温和，喜欢安静的环境，需要定期梳理毛发。',
      vaccinated: true,
      sterilized: true,
      status: 'available',
      image: 'https://images.unsplash.com/photo-1513360371663-058f8cc5cf56?auto=format&fit=crop&w=400&h=300&q=80'
    },
    {
      id: 9,
      name: '花花',
      species: 'cat',
      breed: '三花猫',
      color: '三色',
      age: 12,
      gender: 'female',
      size: 'medium',
      location: '黑龙江',
      story: '花花性格独立，喜欢晒太阳，对主人很忠诚。',
      vaccinated: true,
      sterilized: true,
      status: 'available',
      image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=400&h=300&q=80'
    },
   
  ];
}
  

// 3. 用户注册
app.post("/api/register", async (req, res) => {
  console.log('\n========== 注册请求开始 ==========');
  
  try {
    const { username, email, password } = req.body;
    
    console.log('收到数据:', { username, email, password: password ? '***' : '空' });
    
    // 验证字段
    if (!username || !email || !password) {
      console.log('❌ 缺少必填字段');
      return res.status(400).json({
        success: false,
        message: "请提供邮箱、密码和用户名"
      });
    }
    
    // 检查邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ 邮箱格式无效:', email);
      return res.status(400).json({
        success: false,
        message: "邮箱格式不正确"
      });
    }
    
    // 检查邮箱是否已存在
    console.log('🔍 检查邮箱是否已存在...');
    try {
      const [existingUsers] = await db.execute(
        'SELECT id, name, email FROM users WHERE email = ?',
        [email]
      );
      
      if (existingUsers.length > 0) {
        console.log('❌ 邮箱已存在:', existingUsers[0]);
        return res.status(409).json({
          success: false,
          message: "该邮箱已被注册"
        });
      }
      console.log('✅ 邮箱可用');
    } catch (dbError) {
      console.error('❌ 查询数据库失败:', dbError.message);
      return res.status(500).json({
        success: false,
        message: "数据库查询失败"
      });
    }
    
    // 创建用户
    console.log('🔄 创建用户到数据库...');
    try {
      const [result] = await db.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, password, 'user']
      );
      
      const userId = result.insertId;
      console.log('✅ 用户创建成功，ID:', userId);
      
      // 查询刚创建的用户确认
      const [newUserRows] = await db.execute(
        'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
        [userId]
      );
      
      const newUser = newUserRows[0];
      console.log('✅ 用户数据确认:', newUser);
      
      console.log('========== 注册成功 ==========\n');
      
      res.status(201).json({
        success: true,
        message: "注册成功",
        data: {
          userId: newUser.id,
          email: newUser.email,
          username: newUser.name,
          role: newUser.role,
          created_at: newUser.created_at,
          token: "jwt_new_user_token_" + Date.now()
        }
      });
      
    } catch (insertError) {
      console.error('❌ 插入数据库失败:', insertError.message);
      console.error('SQL错误代码:', insertError.code);
      return res.status(500).json({
        success: false,
        message: "创建用户失败",
        error: process.env.NODE_ENV === 'development' ? insertError.message : undefined
      });
    }
    
  } catch (error) {
    console.error('🔥 注册过程未知错误:', error);
    return res.status(500).json({
      success: false,
      message: "服务器内部错误"
    });
  }
});

// 4. 用户登录
app.post("/api/login", async (req, res) => {
  console.log('\n========== 登录请求开始 ==========');
  
  try {
    const { email, password } = req.body;
    
    console.log('登录尝试:', email);
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "请提供邮箱和密码"
      });
    }
    
    // 查询用户
    console.log('🔍 查询用户...');
    const [users] = await db.execute(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      console.log('❌ 用户不存在:', email);
      return res.status(401).json({
        success: false,
        message: "邮箱或密码错误"
      });
    }
    
    const user = users[0];
    console.log('✅ 找到用户:', user.name, '(ID:', user.id, ')');
    
    // 简单密码比较
    if (password !== user.password) {
      console.log('❌ 密码错误');
      return res.status(401).json({
        success: false,
        message: "邮箱或密码错误"
      });
    }
    
    console.log('✅ 登录成功');
    console.log('========== 登录成功 ==========\n');
    
    // 生成JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'default_secret_key',
      { expiresIn: "7d" }
    );
    console.log('✅ 生成JWT token');
    
    res.json({
      success: true,
      message: "登录成功",
      data: {
        userId: user.id,
        email: user.email,
        username: user.name,
        role: user.role,
        token: token
      }
    });
    
  } catch (error) {
    console.error('🔥 登录过程错误:', error);
    return res.status(500).json({
      success: false,
      message: "服务器内部错误"
    });
  }
});

// 5. 用户信息
app.get("/api/profile", async (req, res) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "请先登录"
    });
  }
  
  try {
    const tokenParts = token.split('_');
    const userId = tokenParts[tokenParts.length - 1];
    
    const [users] = await db.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "用户不存在"
      });
    }
    
    const user = users[0];
    
    res.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        username: user.name,
        role: user.role,
        joinedAt: user.created_at
      }
    });
    
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return res.status(500).json({
      success: false,
      message: "获取用户信息失败"
    });
  }
});

// 6. 查看所有用户（调试用）
app.get("/api/users", async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, role, created_at FROM users ORDER BY id DESC'
    );
    
    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('查询用户列表错误:', error);
    res.status(500).json({
      success: false,
      message: "查询用户失败"
    });
  }
});

 // 6.5. 添加original_price字段
app.get("/api/add-original-price-field", async (req, res) => {
  try {
    console.log('正在添加original_price字段到products表...');
    
    await db.execute(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2) AFTER price
    `);
    
    console.log('✅ original_price字段添加成功');
    
    // 检查表结构
    const [tableDesc] = await db.execute('DESCRIBE products');
    const hasOriginalPrice = tableDesc.some(col => col.Field === 'original_price');
    
    res.json({
      success: true,
      message: 'original_price字段添加成功',
      hasOriginalPrice: hasOriginalPrice,
      tableStructure: tableDesc.map(col => `${col.Field}(${col.Type})`)
    });
  } catch (error) {
    console.error('添加original_price字段失败:', error);
    res.status(500).json({
      success: false,
      message: '添加original_price字段失败',
      error: error.message
    });
  }
});

// 7. 初始化商品数据
app.get("/api/init-products", async (req, res) => {
  try {
    console.log('\n========== 初始化商品数据 ==========');
    
    // 检查并添加original_price字段（如果不存在）
    try {
      await db.execute(`
        ALTER TABLE products 
        ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2) AFTER price
      `);
      console.log('✅ 已检查并添加original_price字段');
    } catch (error) {
      console.log('⚠️ 添加original_price字段失败或已存在:', error.message);
    }
    
    // 先清空相关的子表，避免外键约束问题
    // 注意：注释掉这些行，避免清空现有数据
    // await db.execute('DELETE FROM cart_items');
    // console.log('✅ 清空购物车商品数据');
    
    // await db.execute('DELETE FROM order_items');
    // console.log('✅ 清空订单商品数据');
    
    // await db.execute('DELETE FROM favorites');
    // console.log('✅ 清空收藏数据');
    
    // 不清空商品数据，只检查并添加缺失的商品
    // await db.execute('DELETE FROM products');
    // console.log('✅ 清空商品数据');
    
    // 检查表结构
    const [tableDesc] = await db.execute('DESCRIBE products');
    console.log('商品表结构:', tableDesc.map(col => `${col.Field}(${col.Type})`).join(', '));
    
    // 插入示例商品数据
    const products = [
      // 狗粮类
      {
        name: '皇家狗粮 成犬粮',
        description: '专为成犬设计的营养均衡狗粮，含有优质蛋白质和维生素，促进狗狗健康成长。',
        price: 89.90,
        original_price: 108.00,
        image: 'https://picsum.photos/seed/dogfood1/300/300.jpg',
        category: 'food',
        stock: 50,
        sales: 120,
        is_new: 0,
        is_hot: 1,
        is_flash_sale: 0
      },
      {
        name: '冠能幼犬粮 奶牛配方',
        description: '适合3-12个月幼犬的高营养狗粮，含有DHA促进大脑发育，增强免疫力。',
        price: 128.00,
        original_price: 158.00,
        image: 'https://picsum.photos/seed/dogfood2/300/300.jpg',
        category: 'food',
        stock: 30,
        sales: 85,
        is_new: 1,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        name: '渴望狗粮 六种鱼配方',
        description: '天然无谷狗粮，采用六种深海鱼类制作，富含Omega-3和Omega-6脂肪酸。',
        price: 238.00,
        original_price: 268.00,
        image: 'https://picsum.photos/seed/dogfood3/300/300.jpg',
        category: 'food',
        stock: 20,
        sales: 65,
        is_new: 0,
        is_hot: 1,
        is_flash_sale: 1,
        flash_sale_start: new Date(),
        flash_sale_end_time: new Date(Date.now() + 7*24*60*60*1000) // 7天后
      },
      
      // 猫粮类
      {
        name: '皇家猫粮 成猫粮',
        description: '专为成猫设计的营养均衡猫粮，含有优质蛋白质和维生素，促进猫咪健康成长。',
        price: 79.90,
        original_price: 98.00,
        image: 'https://picsum.photos/seed/catfood1/300/300.jpg',
        category: 'food',
        stock: 45,
        sales: 150,
        is_new: 0,
        is_hot: 1,
        is_flash_sale: 0
      },
      {
        name: '希尔斯处方猫粮 泌尿健康',
        description: '专为泌尿系统健康设计的处方猫粮，有助于预防尿结石和泌尿道疾病。',
        price: 168.00,
        original_price: 198.00,
        image: 'https://picsum.photos/seed/catfood2/300/300.jpg',
        category: 'food',
        stock: 25,
        sales: 95,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 1,
        flash_sale_start: new Date(),
        flash_sale_end_time: new Date(Date.now() + 5*24*60*60*1000) // 5天后
      },
      {
        name: '渴望猫粮 六种鱼配方',
        description: '天然无谷猫粮，采用六种深海鱼类制作，富含Omega-3和Omega-6脂肪酸。',
        price: 218.00,
        original_price: 248.00,
        image: 'https://picsum.photos/seed/catfood3/300/300.jpg',
        category: 'food',
        stock: 30,
        sales: 110,
        is_new: 1,
        is_hot: 1,
        is_flash_sale: 0
      },
      
      // 玩具类
      {
        name: '宠物互动玩具 智能球',
        description: '智能感应球，可自动滚动，吸引宠物注意力，增加运动量，适合狗狗和猫咪。',
        price: 58.00,
        original_price: 78.00,
        image: 'https://picsum.photos/seed/toy1/300/300.jpg',
        category: 'toy',
        stock: 40,
        sales: 88,
        is_new: 1,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        name: '猫抓板 瓦楞纸材质',
        description: '天然瓦楞纸猫抓板，满足猫咪磨爪天性，保护家具不受损坏。',
        price: 28.00,
        original_price: 38.00,
        image: 'https://picsum.photos/seed/toy2/300/300.jpg',
        category: 'toy',
        stock: 60,
        sales: 200,
        is_new: 0,
        is_hot: 1,
        is_flash_sale: 0
      },
      {
        name: '狗狗磨牙绳结玩具',
        description: '天然棉绳制作，帮助狗狗清洁牙齿，缓解磨牙期不适，增强咬合力。',
        price: 35.00,
        original_price: 45.00,
        image: 'https://picsum.photos/seed/toy3/300/300.jpg',
        category: 'toy',
        stock: 50,
        sales: 120,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 1,
        flash_sale_start: new Date(),
        flash_sale_end_time: new Date(Date.now() + 3*24*60*60*1000) // 3天后
      },
      
      // 用品类
      {
        name: '宠物自动饮水机',
        description: '循环过滤饮水机，保持水质新鲜，吸引宠物多喝水，促进健康。',
        price: 128.00,
        original_price: 168.00,
        image: 'https://picsum.photos/seed/supply1/300/300.jpg',
        category: 'supply',
        stock: 35,
        sales: 95,
        is_new: 1,
        is_hot: 1,
        is_flash_sale: 0
      },
      {
        name: '宠物智能喂食器',
        description: '定时定量喂食器，可通过手机APP远程控制，适合上班族和旅行时使用。',
        price: 198.00,
        original_price: 258.00,
        image: 'https://picsum.photos/seed/supply2/300/300.jpg',
        category: 'supply',
        stock: 25,
        sales: 75,
        is_new: 1,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        name: '宠物便携背包 透气款',
        description: '户外出行必备，透气网眼设计，舒适承重，适合小型犬和猫咪。',
        price: 88.00,
        original_price: 118.00,
        image: 'https://picsum.photos/seed/supply3/300/300.jpg',
        category: 'supply',
        stock: 30,
        sales: 60,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 1,
        flash_sale_start: new Date(),
        flash_sale_end_time: new Date(Date.now() + 6*24*60*60*1000) // 6天后
      },
      
      // 清洁类
      {
        name: '宠物湿巾 除菌除臭',
        description: '温和无刺激配方，有效除菌除臭，适合宠物日常清洁使用。',
        price: 19.90,
        original_price: 29.90,
        image: 'https://picsum.photos/seed/clean1/300/300.jpg',
        category: 'clean',
        stock: 80,
        sales: 180,
        is_new: 0,
        is_hot: 1,
        is_flash_sale: 0
      },
      {
        name: '宠物香波 柔顺护毛',
        description: '温和清洁配方，含天然植物精华，使宠物毛发柔顺有光泽。',
        price: 38.00,
        original_price: 48.00,
        image: 'https://picsum.photos/seed/clean2/300/300.jpg',
        category: 'clean',
        stock: 45,
        sales: 130,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        name: '宠物除臭喷雾 室内专用',
        description: '长效除臭配方，快速分解异味分子，适合室内宠物环境使用。',
        price: 25.00,
        original_price: 35.00,
        image: 'https://picsum.photos/seed/clean3/300/300.jpg',
        category: 'clean',
        stock: 55,
        sales: 90,
        is_new: 1,
        is_hot: 0,
        is_flash_sale: 1,
        flash_sale_start: new Date(),
        flash_sale_end: new Date(Date.now() + 4*24*60*60*1000) // 4天后
      },
      
      // 前端硬编码但后端缺失的商品
      {
        name: '皇家小型犬成犬粮',
        description: '营养均衡，促进消化健康',
        price: 258.00,
        original_price: 298.00,
        image: 'https://img.alicdn.com/i3/1657012585/O1CN01o6L2Kx1UxyMAfqn7Z_!!1657012585.jpg',
        category: 'food',
        stock: 45,
        sales: 1234,
        is_new: 1,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        name: '冠能大型犬成犬粮',
        description: '专为大型犬设计，强健骨骼',
        price: 328.00,
        original_price: 368.00,
        image: 'https://gw.alicdn.com/imgextra/O1CN01dIWkCS1H4TwHqhTKe_!!3017450704-0-yinheaigc.jpg',
        category: 'food',
        stock: 42,
        sales: 1456,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        name: '冻干鸡肉粒宠物零食',
        description: '纯天然无添加，高蛋白低脂',
        price: 68.00,
        original_price: 88.00,
        image: 'http://img.alicdn.com/img/i1/9734303905/O1CN01TYZTnH1eiXkNnvpTV_!!4611686018427383969-0-saturn_solar.jpg',
        category: 'food',
        stock: 56,
        sales: 2234,
        is_new: 1,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        name: '猫咪电动逗猫棒',
        description: '智能感应，激发捕猎天性',
        price: 68.00,
        original_price: 88.00,
        image: 'https://ts1.tc.mm.bing.net/th/id/OIP-C.1obNYDNUrUt-raCFQ5S1TQAAAA?w=213&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.5&pid=3.1&rm=2',
        category: 'toy',
        stock: 78,
        sales: 2103,
        is_new: 1,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        name: '耐咬橡胶磨牙玩具',
        description: '食品级材质，清洁牙齿',
        price: 38.00,
        original_price: 48.00,
        image: 'http://img.alicdn.com/img/i4/28852095/O1CN01wDTL8H1RLYe4NlDrW_!!0-saturn_solar.jpg',
        category: 'toy',
        stock: 78,
        sales: 1567,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        name: '狗狗益智漏食玩具',
        description: '延缓进食，训练智力',
        price: 58.00,
        original_price: 68.00,
        image: 'https://gw.alicdn.com/imgextra/O1CN01dwvafY1FfSgXSe4qs_!!2214975900514-0-yinheaigc.jpg',
        category: 'toy',
        stock: 62,
        sales: 1123,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      }
    ];
    
    // 插入商品数据
    console.log(`准备插入 ${products.length} 条商品数据`);
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`处理商品 ${i+1}/${products.length}: ${product.name}`);
      
      try {
        // 检查商品是否已存在
        const [existing] = await db.execute('SELECT id FROM products WHERE name = ?', [product.name]);
        
        if (existing.length > 0) {
          console.log(`⚠️ 商品 "${product.name}" 已存在，跳过`);
          skipCount++;
          continue;
        }
        
        const [result] = await db.execute(`
          INSERT INTO products (
            name, description, price, original_price, image_url, category, 
            stock, sales_count, status, is_new, is_hot, is_flash_sale, 
            flash_sale_end_time
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          product.name, product.description, product.price, 
          product.original_price || null, product.image, product.category, 
          product.stock, product.sales, 'active',
          product.is_new, product.is_hot, product.is_flash_sale,
          product.flash_sale_end_time || null
        ]);
        
        console.log(`✅ 商品 "${product.name}" 插入成功，ID: ${result.insertId}`);
        successCount++;
      } catch (error) {
        console.error(`❌ 插入商品 "${product.name}" 失败:`, error.message);
        errorCount++;
      }
    }
    
    // 添加前端硬编码但后端缺失的商品
    console.log('添加前端硬编码但后端缺失的商品...');
    const missingProducts = [
      {
        id: 1,
        name: '皇家小型犬成犬粮',
        description: '营养均衡，促进消化健康',
        price: 258.00,
        original_price: 298.00,
        image: 'https://img.alicdn.com/i3/1657012585/O1CN01o6L2Kx1UxyMAfqn7Z_!!1657012585.jpg',
        category: '狗粮',
        stock: 45,
        sales: 1234,
        is_new: 1,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 2,
        name: '宠物自动饮水机',
        description: '静音循环，保持水质新鲜',
        price: 189.00,
        original_price: 229.00,
        image: 'https://ts4.tc.mm.bing.net/th/id/OIP-C.3FTvHf8dzEXx7Lm7kt_McAHaLB?rs=1&pid=ImgDetMain&o=7&rm=3',
        category: 'other',
        stock: 32,
        sales: 856,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 8,
        name: '宠物雨衣四脚款',
        description: '防水透气，活动自如',
        price: 45.00,
        original_price: null,
        image: 'https://ts1.tc.mm.bing.net/th/id/OIP-C.KDh2Zxf9eB2eq1W81vtGMQAAAA?w=214&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.5&pid=3.1&rm=2',
        category: 'wear',
        stock: 34,
        sales: 567,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 12,
        name: '冻干鸡肉粒宠物零食',
        description: '纯天然无添加，高蛋白低脂',
        price: 68.00,
        original_price: 88.00,
        image: 'http://img.alicdn.com/img/i1/9734303905/O1CN01TYZTnH1eiXkNnvpTV_!!4611686018427383969-0-saturn_solar.jpg',
        category: '零食',
        stock: 56,
        sales: 2234,
        is_new: 1,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 14,
        name: '耐咬橡胶磨牙玩具',
        description: '食品级材质，清洁牙齿',
        price: 38.00,
        original_price: 48.00,
        image: 'http://img.alicdn.com/img/i4/28852095/O1CN01wDTL8H1RLYe4NlDrW_!!0-saturn_solar.jpg',
        category: 'toy',
        stock: 78,
        sales: 1567,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 15,
        name: '狗狗益智漏食玩具',
        description: '延缓进食，训练智力',
        price: 58.00,
        original_price: 68.00,
        image: 'https://gw.alicdn.com/imgextra/O1CN01dwvafY1FfSgXSe4qs_!!2214975900514-0-yinheaigc.jpg',
        category: 'toy',
        stock: 62,
        sales: 1123,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 17,
        name: '宠物关节保健片',
        description: '缓解关节疼痛，增强活动力',
        price: 158.00,
        original_price: 188.00,
        image: 'http://img.alicdn.com/img/i2/7924477624/O1CN01WLsRG926BqiM1Szuw_!!4611686018427383480-0-saturn_solar.jpg',
        category: 'health',
        stock: 35,
        sales: 987,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 22,
        name: '宠物柔软毛毯',
        description: '亲肤材质，可机洗',
        price: 68.00,
        original_price: 88.00,
        image: 'http://img.alicdn.com/img/i2/1464730048/O1CN01nPh1zN1CE20aMRRC0_!!0-saturn_solar.jpg',
        category: 'bed',
        stock: 72,
        sales: 1456,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 23,
        name: '宠物半封闭式窝',
        description: '安全感设计，保暖透气',
        price: 158.00,
        original_price: 198.00,
        image: 'https://img.alicdn.com/imgextra/i3/2217224742649/O1CN01A7xbv11VRIGcQxEy3_!!2217224742649-0-alimamacc.jpg',
        category: 'bed',
        stock: 29,
        sales: 890,
        is_new: 1,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 25,
        name: '宠物圣诞服装',
        description: '节日氛围，拍照神器',
        price: 88.00,
        original_price: 108.00,
        image: 'http://img.alicdn.com/img/i1/6444622440/O1CN01wDNL4y1TtZVKYJqR3_!!4611686018427380328-2-saturn_solar.png',
        category: 'wear',
        stock: 45,
        sales: 678,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      }
    ];
    
    for (const product of missingProducts) {
      try {
        // 检查商品是否已存在
        const [existing] = await db.execute('SELECT id FROM products WHERE id = ?', [product.id]);
        
        if (existing.length === 0) {
          await db.execute(`
            INSERT INTO products (
              id, name, description, price, original_price, image_url, category, 
              stock, sales_count, status, is_new, is_hot, is_flash_sale
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            product.id, product.name, product.description, product.price, 
            product.original_price || null, product.image, product.category, 
            product.stock, product.sales, 'active',
            product.is_new, product.is_hot, product.is_flash_sale
          ]);
          
          console.log(`✅ 添加缺失商品 "${product.name}" 成功，ID: ${product.id}`);
        } else {
          console.log(`⚠️ 商品ID ${product.id} 已存在，跳过`);
        }
      } catch (error) {
        console.error(`❌ 添加缺失商品 "${product.name}" 失败:`, error.message);
      }
    }
    
    // 验证商品数据是否正确插入
    const [verifyProducts] = await db.execute('SELECT id, name, category, status FROM products ORDER BY id');
    console.log(`✅ 验证: 数据库中共有 ${verifyProducts.length} 条商品记录`);
    
    // 打印前5个商品的信息
    if (verifyProducts.length > 0) {
      console.log('前5个商品信息:');
      verifyProducts.slice(0, 5).forEach(p => {
        console.log(`  ID: ${p.id}, 名称: ${p.name}, 类别: ${p.category}, 状态: ${p.status}`);
      });
    }
    
    console.log(`✅ 成功插入 ${products.length} 条商品数据`);
    console.log('========== 初始化完成 ==========\n');
    
    res.json({
      success: true,
      message: `成功初始化 ${products.length} 条商品数据`,
      count: products.length
    });
    
  } catch (error) {
    console.error('初始化商品数据失败:', error);
    res.status(500).json({
      success: false,
      message: '初始化商品数据失败',
      error: error.message
    });
  }
});

// 添加所有缺失的商品数据
app.get('/api/add-all-products', async (req, res) => {
  try {
    console.log('========== 开始添加所有缺失的商品数据 ==========');
    
    // 检查original_price字段是否存在
    try {
      await db.execute(`
        ALTER TABLE products 
        ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2) AFTER price
      `);
      console.log('✅ 已检查并添加original_price字段');
    } catch (error) {
      console.log('⚠️ 添加original_price字段失败或已存在:', error.message);
    }
    
    // 检查表结构
    const [tableDesc] = await db.execute('DESCRIBE products');
    console.log('商品表结构:', tableDesc.map(col => `${col.Field}(${col.Type})`).join(', '));
    
    // 插入示例商品数据
    const products = [
      // 狗粮类
      {
        name: '皇家狗粮 成犬粮',
        description: '专为成犬设计的营养均衡狗粮，含有优质蛋白质和维生素，促进狗狗健康成长。',
        price: 89.90,
        original_price: 108.00,
        image: 'https://picsum.photos/seed/dogfood1/300/300.jpg',
        category: 'food',
        stock: 50,
        sales: 120,
        is_new: 0,
        is_hot: 1,
        is_flash_sale: 0
      },
      {
        name: '冠能幼犬粮 奶牛配方',
        description: '适合3-12个月幼犬的高营养狗粮，含有DHA促进大脑发育，增强免疫力。',
        price: 128.00,
        original_price: 158.00,
        image: 'https://picsum.photos/seed/dogfood2/300/300.jpg',
        category: 'food',
        stock: 30,
        sales: 85,
        is_new: 1,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        name: '渴望狗粮 六种鱼配方',
        description: '天然无谷狗粮，采用六种深海鱼类制作，富含Omega-3和Omega-6脂肪酸。',
        price: 238.00,
        original_price: 268.00,
        image: 'https://picsum.photos/seed/dogfood3/300/300.jpg',
        category: 'food',
        stock: 20,
        sales: 65,
        is_new: 0,
        is_hot: 1,
        is_flash_sale: 1,
        flash_sale_start: new Date(),
        flash_sale_end_time: new Date(Date.now() + 7*24*60*60*1000) // 7天后
      },
      
      // 猫粮类
      {
        name: '皇家猫粮 成猫粮',
        description: '专为成猫设计的营养均衡猫粮，含有优质蛋白质和维生素，促进猫咪健康成长。',
        price: 79.90,
        original_price: 98.00,
        image: 'https://picsum.photos/seed/catfood1/300/300.jpg',
        category: 'food',
        stock: 45,
        sales: 150,
        is_new: 0,
        is_hot: 1,
        is_flash_sale: 0
      },
      {
        name: '希尔斯处方猫粮 泌尿健康',
        description: '专为泌尿系统健康设计的处方猫粮，有助于预防尿结石和泌尿道疾病。',
        price: 168.00,
        original_price: 198.00,
        image: 'https://picsum.photos/seed/catfood2/300/300.jpg',
        category: 'food',
        stock: 25,
        sales: 95,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 1,
        flash_sale_start: new Date(),
        flash_sale_end_time: new Date(Date.now() + 5*24*60*60*1000) // 5天后
      },
      {
        name: '渴望猫粮 六种鱼配方',
        description: '天然无谷猫粮，采用六种深海鱼类制作，富含Omega-3和Omega-6脂肪酸。',
        price: 218.00,
        original_price: 248.00,
        image: 'https://picsum.photos/seed/catfood3/300/300.jpg',
        category: 'food',
        stock: 30,
        sales: 110,
        is_new: 1,
        is_hot: 1,
        is_flash_sale: 0
      },
      
      // 玩具类
      {
        name: '宠物互动玩具 智能球',
        description: '智能感应球，可自动滚动，吸引宠物注意力，增加运动量，适合狗狗和猫咪。',
        price: 58.00,
        original_price: 78.00,
        image: 'https://picsum.photos/seed/toy1/300/300.jpg',
        category: 'toy',
        stock: 40,
        sales: 88,
        is_new: 1,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        name: '猫抓板 瓦楞纸材质',
        description: '天然瓦楞纸猫抓板，满足猫咪磨爪天性，保护家具不受损坏。',
        price: 28.00,
        original_price: 38.00,
        image: 'https://picsum.photos/seed/toy2/300/300.jpg',
        category: 'toy',
        stock: 60,
        sales: 200,
        is_new: 0,
        is_hot: 1,
        is_flash_sale: 0
      },
      {
        name: '狗狗磨牙绳结玩具',
        description: '天然棉绳制作，帮助狗狗清洁牙齿，缓解磨牙期不适，增强咬合力。',
        price: 35.00,
        original_price: 45.00,
        image: 'https://picsum.photos/seed/toy3/300/300.jpg',
        category: 'toy',
        stock: 50,
        sales: 120,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 1,
        flash_sale_start: new Date(),
        flash_sale_end_time: new Date(Date.now() + 3*24*60*60*1000) // 3天后
      },
      
      // 用品类
      {
        name: '宠物自动饮水机',
        description: '循环过滤饮水机，保持水质新鲜，吸引宠物多喝水，促进健康。',
        price: 128.00,
        original_price: 168.00,
        image: 'https://picsum.photos/seed/supply1/300/300.jpg',
        category: 'supply',
        stock: 35,
        sales: 95,
        is_new: 1,
        is_hot: 1,
        is_flash_sale: 0
      },
      {
        name: '宠物智能喂食器',
        description: '定时定量喂食器，可通过手机APP远程控制，适合上班族和旅行时使用。',
        price: 198.00,
        original_price: 258.00,
        image: 'https://picsum.photos/seed/supply2/300/300.jpg',
        category: 'supply',
        stock: 25,
        sales: 75,
        is_new: 1,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        name: '宠物便携背包 透气款',
        description: '户外出行必备，透气网眼设计，舒适承重，适合小型犬和猫咪。',
        price: 88.00,
        original_price: 118.00,
        image: 'https://picsum.photos/seed/supply3/300/300.jpg',
        category: 'supply',
        stock: 30,
        sales: 60,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 1,
        flash_sale_start: new Date(),
        flash_sale_end_time: new Date(Date.now() + 6*24*60*60*1000) // 6天后
      },
      
      // 清洁类
      {
        name: '宠物湿巾 除菌除臭',
        description: '温和无刺激配方，有效除菌除臭，适合宠物日常清洁使用。',
        price: 19.90,
        original_price: 29.90,
        image: 'https://picsum.photos/seed/clean1/300/300.jpg',
        category: 'clean',
        stock: 80,
        sales: 180,
        is_new: 0,
        is_hot: 1,
        is_flash_sale: 0
      },
      {
        name: '宠物香波 柔顺护毛',
        description: '温和清洁配方，含天然植物精华，使宠物毛发柔顺有光泽。',
        price: 38.00,
        original_price: 48.00,
        image: 'https://picsum.photos/seed/clean2/300/300.jpg',
        category: 'clean',
        stock: 45,
        sales: 130,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        name: '宠物除臭喷雾 室内专用',
        description: '长效除臭配方，快速分解异味分子，适合室内宠物环境使用。',
        price: 25.00,
        original_price: 35.00,
        image: 'https://picsum.photos/seed/clean3/300/300.jpg',
        category: 'clean',
        stock: 55,
        sales: 90,
        is_new: 1,
        is_hot: 0,
        is_flash_sale: 1,
        flash_sale_start: new Date(),
        flash_sale_end_time: new Date(Date.now() + 4*24*60*60*1000) // 4天后
      }
    ];
    
    // 插入商品数据
    console.log(`准备插入 ${products.length} 条商品数据`);
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`处理商品 ${i+1}/${products.length}: ${product.name}`);
      
      try {
        // 检查商品是否已存在
        const [existing] = await db.execute('SELECT id FROM products WHERE name = ?', [product.name]);
        
        if (existing.length > 0) {
          console.log(`⚠️ 商品 "${product.name}" 已存在，跳过`);
          skipCount++;
          continue;
        }
        
        const [result] = await db.execute(`
          INSERT INTO products (
            name, description, price, original_price, image_url, category, 
            stock, sales_count, status, is_new, is_hot, is_flash_sale, 
            flash_sale_end_time
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          product.name, product.description, product.price, 
          product.original_price || null, product.image, product.category, 
          product.stock, product.sales, 'active',
          product.is_new, product.is_hot, product.is_flash_sale,
          product.flash_sale_end_time || null
        ]);
        
        console.log(`✅ 商品 "${product.name}" 插入成功，ID: ${result.insertId}`);
        successCount++;
      } catch (error) {
        console.error(`❌ 插入商品 "${product.name}" 失败:`, error.message);
        errorCount++;
      }
    }
    
    // 验证商品数据是否正确插入
    const [verifyProducts] = await db.execute('SELECT id, name, category, status FROM products ORDER BY id');
    console.log(`✅ 验证: 数据库中共有 ${verifyProducts.length} 条商品记录`);
    
    console.log(`✅ 成功插入 ${successCount} 条商品数据，跳过 ${skipCount} 条已存在商品，${errorCount} 条插入失败`);
    console.log('========== 添加完成 ==========\n');
    
    res.json({
      success: true,
      message: `成功添加 ${successCount} 条商品数据，跳过 ${skipCount} 条已存在商品`,
      total: products.length,
      successCount,
      skipCount,
      errorCount,
      currentTotal: verifyProducts.length
    });
    
  } catch (error) {
    console.error('添加商品数据失败:', error);
    res.status(500).json({
      success: false,
      message: '添加商品数据失败',
      error: error.message
    });
  }
});

// 获取购物车
app.get("/api/cart", async (req, res) => {
  try {
    // 直接使用默认用户ID，不需要认证
    const userId = 1;
    
    const [items] = await db.execute(`
      SELECT 
        ci.id as cart_item_id,
        ci.quantity,
        ci.selected,
        ci.added_at,
        p.id as product_id,
        p.name,
        p.price,
        p.original_price,
        p.image_url as image,
        p.stock,
        p.status,
        p.is_flash_sale,
        p.flash_sale_end_time
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ? AND p.status = 'active'
      ORDER BY ci.added_at DESC
    `, [userId]);
    
    // 计算总数量和总金额
    let totalItems = 0;
    let totalAmount = 0;
    
    items.forEach(item => {
      totalItems += item.quantity;
      if (item.selected) {
        totalAmount += item.price * item.quantity;
      }
    });
    
    res.json({
      success: true,
      data: {
        items,
        totalItems,
        totalAmount
      }
    });
  } catch (error) {
    console.error('获取购物车失败:', error);
    res.status(500).json({
      success: false,
      message: '获取购物车失败',
      error: error.message
    });
  }
});

// 添加商品到购物车
app.post("/api/cart/add", async (req, res) => {
  try {
    // 直接使用默认用户ID，不需要认证
    const userId = 1;
    const { productId, quantity = 1 } = req.body;
    
    console.log(`添加商品到购物车 - 用户ID: ${userId}, 商品ID: ${productId}, 数量: ${quantity}`);
    
    // 检查商品是否存在且有库存
    const [products] = await db.execute(
      'SELECT * FROM products WHERE id = ? AND status = ?', 
      [productId, 'active']
    );
    
    console.log(`查询商品结果: 找到 ${products.length} 条记录`);
    
    if (products.length === 0) {
      // 检查商品是否存在但状态不是active
      const [allProducts] = await db.execute(
        'SELECT id, name, status FROM products WHERE id = ?', 
        [productId]
      );
      
      if (allProducts.length === 0) {
        console.log(`商品ID ${productId} 完全不存在`);
        return res.status(404).json({
          success: false,
          message: `商品ID ${productId} 不存在`,
          debug: {
            productId,
            userId,
            existsInDb: false
          }
        });
      } else {
        console.log(`商品ID ${productId} 存在但状态为: ${allProducts[0].status}`);
        return res.status(404).json({
          success: false,
          message: `商品ID ${productId} 已下架`,
          debug: {
            productId,
            userId,
            productName: allProducts[0].name,
            status: allProducts[0].status
          }
        });
      }
    }
    
    const product = products[0];
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: '库存不足'
      });
    }
    
    // 检查商品是否已在购物车中
    const [existingItems] = await db.execute(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    
    if (existingItems.length > 0) {
      // 更新数量
      const newQuantity = existingItems[0].quantity + quantity;
      await db.execute(
        'UPDATE cart_items SET quantity = ?, selected = 1 WHERE id = ?',
        [newQuantity, existingItems[0].id]
      );
    } else {
      // 添加新商品
      await db.execute(
        'INSERT INTO cart_items (user_id, product_id, quantity, selected) VALUES (?, ?, ?, 1)',
        [userId, productId, quantity]
      );
    }
    
    // 获取更新后的购物车
    const [updatedItems] = await db.execute(`
      SELECT 
        ci.id as cart_item_id,
        ci.quantity,
        ci.selected,
        ci.added_at,
        p.id as product_id,
        p.name,
        p.price,
        p.original_price,
        p.image_url as image,
        p.stock,
        p.status,
        p.is_flash_sale,
        p.flash_sale_end_time
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ? AND p.status = 'active'
      ORDER BY ci.added_at DESC
    `, [userId]);
    
    // 计算总数量和总金额
    let totalItems = 0;
    let totalAmount = 0;
    
    updatedItems.forEach(item => {
      totalItems += item.quantity;
      if (item.selected) {
        totalAmount += item.price * item.quantity;
      }
    });
    
    res.json({
      success: true,
      message: '商品已添加到购物车',
      data: {
        items: updatedItems,
        totalItems,
        totalAmount
      }
    });
  } catch (error) {
    console.error('添加到购物车失败:', error);
    res.status(500).json({
      success: false,
      message: '添加到购物车失败',
      error: error.message
    });
  }
});

// 更新购物车商品数量
app.put("/api/cart/update", async (req, res) => {
  try {
    // 直接使用默认用户ID，不需要认证
    const userId = 1;
    const { productId, quantity } = req.body;
    
    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: '商品数量必须大于0'
      });
    }
    
    // 检查购物车项是否存在
    const [cartItems] = await db.execute(
      'SELECT ci.*, p.stock FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.product_id = ? AND ci.user_id = ?',
      [productId, userId]
    );
    
    if (cartItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: '购物车商品不存在'
      });
    }
    
    const cartItem = cartItems[0];
    
    if (cartItem.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: '库存不足'
      });
    }
    
    // 更新数量
    await db.execute(
      'UPDATE cart_items SET quantity = ? WHERE id = ?',
      [quantity, cartItem.id]
    );
    
    // 获取更新后的购物车
    const [updatedItems] = await db.execute(`
      SELECT 
        ci.id as cart_item_id,
        ci.quantity,
        ci.selected,
        ci.added_at,
        p.id as product_id,
        p.name,
        p.price,
        p.original_price,
        p.image_url as image,
        p.stock,
        p.status,
        p.is_flash_sale,
        p.flash_sale_end_time
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ? AND p.status = 'active'
      ORDER BY ci.added_at DESC
    `, [userId]);
    
    // 计算总数量和总金额
    let totalItems = 0;
    let totalAmount = 0;
    
    updatedItems.forEach(item => {
      totalItems += item.quantity;
      if (item.selected) {
        totalAmount += item.price * item.quantity;
      }
    });
    
    res.json({
      success: true,
      message: '购物车已更新',
      data: {
        items: updatedItems,
        totalItems,
        totalAmount
      }
    });
  } catch (error) {
    console.error('更新购物车失败:', error);
    res.status(500).json({
      success: false,
      message: '更新购物车失败',
      error: error.message
    });
  }
});

// 删除购物车商品
app.delete("/api/cart/remove", async (req, res) => {
  try {
    // 直接使用默认用户ID，不需要认证
    const userId = 1;
    const { productId } = req.body;
    
    // 检查购物车项是否存在
    const [cartItems] = await db.execute(
      'SELECT * FROM cart_items WHERE product_id = ? AND user_id = ?',
      [productId, userId]
    );
    
    if (cartItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: '购物车商品不存在'
      });
    }
    
    // 删除购物车项
    await db.execute('DELETE FROM cart_items WHERE product_id = ? AND user_id = ?', [productId, userId]);
    
    // 获取更新后的购物车
    const [updatedItems] = await db.execute(`
      SELECT 
        ci.id as cart_item_id,
        ci.quantity,
        ci.selected,
        ci.added_at,
        p.id as product_id,
        p.name,
        p.price,
        p.original_price,
        p.image_url as image,
        p.stock,
        p.status,
        p.is_flash_sale,
        p.flash_sale_end_time
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ? AND p.status = 'active'
      ORDER BY ci.added_at DESC
    `, [userId]);
    
    // 计算总数量和总金额
    let totalItems = 0;
    let totalAmount = 0;
    
    updatedItems.forEach(item => {
      totalItems += item.quantity;
      if (item.selected) {
        totalAmount += item.price * item.quantity;
      }
    });
    
    res.json({
      success: true,
      message: '商品已从购物车移除',
      data: {
        items: updatedItems,
        totalItems,
        totalAmount
      }
    });
  } catch (error) {
    console.error('删除购物车商品失败:', error);
    res.status(500).json({
      success: false,
      message: '删除购物车商品失败',
      error: error.message
    });
  }
});

// 清空购物车
app.delete("/api/cart/clear", async (req, res) => {
  try {
    // 直接使用默认用户ID，不需要认证
    const userId = 1;
    
    await db.execute('DELETE FROM cart_items WHERE user_id = ?', [userId]);
    
    res.json({
      success: true,
      message: '购物车已清空',
      data: {
        items: [],
        totalItems: 0,
        totalAmount: 0
      }
    });
  } catch (error) {
    console.error('清空购物车失败:', error);
    res.status(500).json({
      success: false,
      message: '清空购物车失败',
      error: error.message
    });
  }
});

// 同步购物车到服务器
app.post("/api/cart/sync", async (req, res) => {
  try {
    // 直接使用默认用户ID，不需要认证
    const userId = 1;
    const { items } = req.body;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: '无效的购物车数据'
      });
    }
    
    // 遍历每个商品，更新选择状态
    for (const item of items) {
      const { product_id, quantity, selected } = item;
      
      // 检查购物车项是否存在
      const [cartItems] = await db.execute(
        'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
        [userId, product_id]
      );
      
      if (cartItems.length > 0) {
        // 更新选择状态和数量
        await db.execute(
          'UPDATE cart_items SET selected = ?, quantity = ? WHERE user_id = ? AND product_id = ?',
          [selected ? 1 : 0, quantity, userId, product_id]
        );
      }
    }
    
    // 获取更新后的购物车
    const [updatedItems] = await db.execute(`
      SELECT 
        ci.id as cart_item_id,
        ci.quantity,
        ci.selected,
        ci.added_at,
        p.id as product_id,
        p.name,
        p.price,
        p.original_price,
        p.image_url as image,
        p.stock,
        p.status,
        p.is_flash_sale,
        p.flash_sale_end_time
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ? AND p.status = 'active'
      ORDER BY ci.added_at DESC
    `, [userId]);
    
    // 计算总数量和总金额
    let totalItems = 0;
    let totalAmount = 0;
    
    updatedItems.forEach(item => {
      totalItems += item.quantity;
      if (item.selected) {
        totalAmount += item.price * item.quantity;
      }
    });
    
    res.json({
      success: true,
      message: '购物车已同步',
      data: {
        items: updatedItems,
        totalItems,
        totalAmount
      }
    });
  } catch (error) {
    console.error('同步购物车失败:', error);
    res.status(500).json({
      success: false,
      message: '同步购物车失败',
      error: error.message
    });
  }
});

// 批量设置多个商品为限时促销
app.get('/api/batch-flash-sale', async (req, res) => {
  try {
    console.log('========== 批量设置商品为限时促销 ==========');
    
    // 选择一些商品ID设置为限时促销
    const productIds = [2, 3, 5, 8, 12]; // 选择一些商品ID
    
    let successCount = 0;
    let updatedProducts = [];
    
    for (const id of productIds) {
      try {
        // 检查商品是否存在
        const [productCheck] = await db.execute('SELECT id, name FROM products WHERE id = ?', [id]);
        
        if (productCheck.length === 0) {
          console.log(`⚠️ ID为 ${id} 的商品不存在，跳过`);
          continue;
        }
        
        // 更新商品为限时促销
        const [updateResult] = await db.execute(
          'UPDATE products SET is_flash_sale = 1, flash_sale_end_time = DATE_ADD(NOW(), INTERVAL 7 DAY) WHERE id = ?',
          [id]
        );
        
        if (updateResult.affectedRows > 0) {
          successCount++;
          
          // 获取更新后的商品信息
          const [updatedProduct] = await db.execute(
            'SELECT id, name, category, is_flash_sale, flash_sale_end_time FROM products WHERE id = ?',
            [id]
          );
          
          updatedProducts.push(updatedProduct[0]);
          console.log(`✅ 成功设置商品 "${productCheck[0].name}" (ID: ${id}) 为限时促销`);
        }
      } catch (error) {
        console.error(`❌ 设置商品 ID ${id} 为限时促销失败:`, error.message);
      }
    }
    
    // 获取所有限时促销商品
    const [allFlashSaleProducts] = await db.execute(
      'SELECT id, name, category, is_flash_sale, flash_sale_end_time FROM products WHERE is_flash_sale = 1 ORDER BY id'
    );
    
    console.log(`✅ 成功设置 ${successCount} 个商品为限时促销`);
    console.log(`✅ 总限时促销商品数: ${allFlashSaleProducts.length}`);
    console.log('========== 批量设置完成 ==========\n');
    
    res.json({
      success: true,
      message: `成功设置 ${successCount} 个商品为限时促销`,
      totalFlashSaleProducts: allFlashSaleProducts.length,
      updatedProducts: updatedProducts,
      allFlashSaleProducts: allFlashSaleProducts
    });
    
  } catch (error) {
    console.error('批量设置限时促销失败:', error);
    res.status(500).json({
      success: false,
      message: '批量设置限时促销失败',
      error: error.message
    });
  }
});

// 查看所有商品名称
app.get('/api/list-products', async (req, res) => {
  try {
    console.log('========== 获取所有商品名称 ==========');
    
    const [products] = await db.execute('SELECT id, name, category FROM products ORDER BY id');
    
    console.log(`✅ 总共找到 ${products.length} 条商品`);
    
    res.json({
      success: true,
      count: products.length,
      products: products
    });
    
  } catch (error) {
    console.error('获取商品列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取商品列表失败',
      error: error.message
    });
  }
});

// 直接更新指定ID的商品为限时促销
app.get('/api/set-flash-sale/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    console.log(`========== 设置商品 ${productId} 为限时促销 ==========`);
    
    // 检查商品是否存在
    const [productCheck] = await db.execute('SELECT id, name FROM products WHERE id = ?', [productId]);
    
    if (productCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: `ID为 ${productId} 的商品不存在`
      });
    }
    
    // 更新商品为限时促销
    const [updateResult] = await db.execute(
      'UPDATE products SET is_flash_sale = 1, flash_sale_end_time = DATE_ADD(NOW(), INTERVAL 7 DAY) WHERE id = ?',
      [productId]
    );
    
    // 获取更新后的商品信息
    const [updatedProduct] = await db.execute(
      'SELECT id, name, category, is_flash_sale, flash_sale_end_time FROM products WHERE id = ?',
      [productId]
    );
    
    console.log(`✅ 成功设置商品 "${productCheck[0].name}" 为限时促销`);
    
    res.json({
      success: true,
      message: `成功设置商品 "${productCheck[0].name}" 为限时促销`,
      product: updatedProduct[0]
    });
    
  } catch (error) {
    console.error('设置限时促销失败:', error);
    res.status(500).json({
      success: false,
      message: '设置限时促销失败',
      error: error.message
    });
  }
});

// 简单添加限时促销商品
app.get('/api/simple-flash-sale', async (req, res) => {
  try {
    console.log('========== 开始简单添加限时促销商品 ==========');
    
    // 直接使用SQL语句添加限时促销商品
    const sqlStatements = [
      // 添加限时促销商品1
      `UPDATE products SET is_flash_sale = 1, flash_sale_end_time = DATE_ADD(NOW(), INTERVAL 7 DAY) WHERE name LIKE '%渴望狗粮%' LIMIT 1`,
      // 添加限时促销商品2
      `UPDATE products SET is_flash_sale = 1, flash_sale_end_time = DATE_ADD(NOW(), INTERVAL 5 DAY) WHERE name LIKE '%希尔斯%' LIMIT 1`,
      // 添加限时促销商品3
      `UPDATE products SET is_flash_sale = 1, flash_sale_end_time = DATE_ADD(NOW(), INTERVAL 3 DAY) WHERE name LIKE '%磨牙绳结%' LIMIT 1`,
      // 添加限时促销商品4
      `UPDATE products SET is_flash_sale = 1, flash_sale_end_time = DATE_ADD(NOW(), INTERVAL 6 DAY) WHERE name LIKE '%便携背包%' LIMIT 1`,
      // 添加限时促销商品5
      `UPDATE products SET is_flash_sale = 1, flash_sale_end_time = DATE_ADD(NOW(), INTERVAL 4 DAY) WHERE name LIKE '%除臭喷雾%' LIMIT 1`
    ];
    
    let successCount = 0;
    
    for (const sql of sqlStatements) {
      try {
        const [result] = await db.execute(sql);
        successCount += result.affectedRows;
        console.log(`✅ 执行成功，影响行数: ${result.affectedRows}`);
      } catch (error) {
        console.error(`❌ 执行失败:`, error.message);
      }
    }
    
    // 验证结果
    const [flashSaleResult] = await db.execute('SELECT id, name, flash_sale_end_time FROM products WHERE is_flash_sale = 1');
    console.log(`✅ 限时促销商品总数: ${flashSaleResult.length}`);
    
    console.log(`✅ 成功更新 ${successCount} 条商品为限时促销`);
    console.log('========== 添加完成 ==========\n');
    
    res.json({
      success: true,
      message: `成功更新 ${successCount} 条商品为限时促销`,
      totalFlashSaleProducts: flashSaleResult.length,
      flashSaleProducts: flashSaleResult
    });
    
  } catch (error) {
    console.error('添加限时促销商品失败:', error);
    res.status(500).json({
      success: false,
      message: '添加限时促销商品失败',
      error: error.message
    });
  }
});

// 添加限时促销商品
app.get('/api/add-flash-sale-products', async (req, res) => {
  try {
    console.log('========== 开始添加限时促销商品 ==========');
    
    // 检查flash_sale_end_time字段是否存在
    try {
      await db.execute(`
        ALTER TABLE products 
        ADD COLUMN IF NOT EXISTS flash_sale_end_time TIMESTAMP NULL AFTER flash_sale_start
      `);
      console.log('✅ 已检查并添加flash_sale_end_time字段');
    } catch (error) {
      console.log('⚠️ 添加flash_sale_end_time字段失败或已存在:', error.message);
    }
    
    // 添加限时促销商品
    const flashSaleProducts = [
      {
        name: '渴望狗粮 六种鱼配方',
        description: '天然无谷狗粮，采用六种深海鱼类制作，富含Omega-3和Omega-6脂肪酸。',
        price: 238.00,
        original_price: 268.00,
        image_url: 'https://picsum.photos/seed/dogfood3/300/300.jpg',
        category: 'food',
        stock: 20,
        sales_count: 65,
        status: 'active',
        is_new: 0,
        is_hot: 1,
        is_flash_sale: 1,
        flash_sale_start: new Date(),
        flash_sale_end_time: new Date(Date.now() + 7*24*60*60*1000) // 7天后
      },
      {
        name: '希尔斯处方猫粮 泌尿健康',
        description: '专为泌尿系统健康设计的处方猫粮，有助于预防尿结石和泌尿道疾病。',
        price: 168.00,
        original_price: 198.00,
        image_url: 'https://picsum.photos/seed/catfood2/300/300.jpg',
        category: 'food',
        stock: 25,
        sales_count: 95,
        status: 'active',
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 1,
        flash_sale_start: new Date(),
        flash_sale_end_time: new Date(Date.now() + 5*24*60*60*1000) // 5天后
      },
      {
        name: '狗狗磨牙绳结玩具',
        description: '天然棉绳制作，帮助狗狗清洁牙齿，缓解磨牙期不适，增强咬合力。',
        price: 35.00,
        original_price: 45.00,
        image_url: 'https://picsum.photos/seed/toy3/300/300.jpg',
        category: 'toy',
        stock: 50,
        sales_count: 120,
        status: 'active',
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 1,
        flash_sale_start: new Date(),
        flash_sale_end_time: new Date(Date.now() + 3*24*60*60*1000) // 3天后
      },
      {
        name: '宠物便携背包 透气款',
        description: '户外出行必备，透气网眼设计，舒适承重，适合小型犬和猫咪。',
        price: 88.00,
        original_price: 118.00,
        image_url: 'https://picsum.photos/seed/supply3/300/300.jpg',
        category: 'supply',
        stock: 30,
        sales_count: 60,
        status: 'active',
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 1,
        flash_sale_start: new Date(),
        flash_sale_end_time: new Date(Date.now() + 6*24*60*60*1000) // 6天后
      },
      {
        name: '宠物除臭喷雾 室内专用',
        description: '长效除臭配方，快速分解异味分子，适合室内宠物环境使用。',
        price: 25.00,
        original_price: 35.00,
        image_url: 'https://picsum.photos/seed/clean3/300/300.jpg',
        category: 'clean',
        stock: 55,
        sales_count: 90,
        status: 'active',
        is_new: 1,
        is_hot: 0,
        is_flash_sale: 1,
        flash_sale_start: new Date(),
        flash_sale_end_time: new Date(Date.now() + 4*24*60*60*1000) // 4天后
      }
    ];
    
    let successCount = 0;
    let updateCount = 0;
    let errorCount = 0;
    
    for (const product of flashSaleProducts) {
      try {
        // 检查商品是否已存在
        const [existing] = await db.execute('SELECT id FROM products WHERE name = ?', [product.name]);
        
        if (existing.length > 0) {
          // 商品已存在，更新为限时促销商品
          const [updateResult] = await db.execute(`
            UPDATE products 
            SET is_flash_sale = 1, flash_sale_start = ?, flash_sale_end_time = ?
            WHERE name = ?
          `, [product.flash_sale_start, product.flash_sale_end_time, product.name]);
          
          if (updateResult.affectedRows > 0) {
            console.log(`✅ 已将商品 "${product.name}" 更新为限时促销商品`);
            updateCount++;
          }
        } else {
          // 商品不存在，插入新商品
          const [insertResult] = await db.execute(`
            INSERT INTO products (
              name, description, price, original_price, image_url, category, 
              stock, sales_count, status, is_new, is_hot, is_flash_sale, 
              flash_sale_start, flash_sale_end_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            product.name, product.description, product.price, 
            product.original_price, product.image_url, product.category, 
            product.stock, product.sales_count, product.status,
            product.is_new, product.is_hot, product.is_flash_sale,
            product.flash_sale_start, product.flash_sale_end_time
          ]);
          
          console.log(`✅ 已插入限时促销商品 "${product.name}"，ID: ${insertResult.insertId}`);
          successCount++;
        }
      } catch (error) {
        console.error(`❌ 处理商品 "${product.name}" 失败:`, error.message);
        errorCount++;
      }
    }
    
    // 验证结果
    const [flashSaleResult] = await db.execute('SELECT id, name, flash_sale_end_time FROM products WHERE is_flash_sale = 1');
    console.log(`✅ 限时促销商品总数: ${flashSaleResult.length}`);
    
    console.log(`✅ 成功插入 ${successCount} 条限时促销商品，更新 ${updateCount} 条为限时促销，${errorCount} 条处理失败`);
    console.log('========== 添加完成 ==========\n');
    
    res.json({
      success: true,
      message: `成功处理 ${successCount + updateCount} 条限时促销商品`,
      successCount,
      updateCount,
      errorCount,
      totalFlashSaleProducts: flashSaleResult.length,
      flashSaleProducts: flashSaleResult
    });
    
  } catch (error) {
    console.error('添加限时促销商品失败:', error);
    res.status(500).json({
      success: false,
      message: '添加限时促销商品失败',
      error: error.message
    });
  }
});

// 直接插入所有缺失的商品数据
app.get('/api/insert-missing-products', async (req, res) => {
  try {
    console.log('========== 开始直接插入所有缺失的商品数据 ==========');
    
    // 检查original_price字段是否存在
    try {
      await db.execute(`
        ALTER TABLE products 
        ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2) AFTER price
      `);
      console.log('✅ 已检查并添加original_price字段');
    } catch (error) {
      console.log('⚠️ 添加original_price字段失败或已存在:', error.message);
    }
    
    // 检查flash_sale_end_time字段是否存在
    try {
      await db.execute(`
        ALTER TABLE products 
        ADD COLUMN IF NOT EXISTS flash_sale_end_time TIMESTAMP NULL AFTER flash_sale_start
      `);
      console.log('✅ 已检查并添加flash_sale_end_time字段');
    } catch (error) {
      console.log('⚠️ 添加flash_sale_end_time字段失败或已存在:', error.message);
    }
    
    // 检查表结构
    const [tableDesc] = await db.execute('DESCRIBE products');
    console.log('商品表结构:', tableDesc.map(col => `${col.Field}(${col.Type})`).join(', '));
    
    // 获取当前商品数量
    const [currentCount] = await db.execute('SELECT COUNT(*) as count FROM products');
    console.log(`当前商品数量: ${currentCount[0].count}`);
    
    // 直接插入缺失的商品数据
    const insertStatements = [
      // 狗粮类
      `INSERT IGNORE INTO products (name, description, price, original_price, image_url, category, stock, sales_count, status, is_new, is_hot, is_flash_sale) VALUES ('皇家狗粮 成犬粮', '专为成犬设计的营养均衡狗粮，含有优质蛋白质和维生素，促进狗狗健康成长。', 89.90, 108.00, 'https://picsum.photos/seed/dogfood1/300/300.jpg', 'food', 50, 120, 'active', 0, 1, 0)`,
      `INSERT IGNORE INTO products (name, description, price, original_price, image_url, category, stock, sales_count, status, is_new, is_hot, is_flash_sale) VALUES ('冠能幼犬粮 奶牛配方', '适合3-12个月幼犬的高营养狗粮，含有DHA促进大脑发育，增强免疫力。', 128.00, 158.00, 'https://picsum.photos/seed/dogfood2/300/300.jpg', 'food', 30, 85, 'active', 1, 0, 0)`,
      `INSERT IGNORE INTO products (name, description, price, original_price, image_url, category, stock, sales_count, status, is_new, is_hot, is_flash_sale, flash_sale_start, flash_sale_end_time) VALUES ('渴望狗粮 六种鱼配方', '天然无谷狗粮，采用六种深海鱼类制作，富含Omega-3和Omega-6脂肪酸。', 238.00, 268.00, 'https://picsum.photos/seed/dogfood3/300/300.jpg', 'food', 20, 65, 'active', 0, 1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY))`,
      
      // 猫粮类
      `INSERT IGNORE INTO products (name, description, price, original_price, image_url, category, stock, sales_count, status, is_new, is_hot, is_flash_sale) VALUES ('皇家猫粮 成猫粮', '专为成猫设计的营养均衡猫粮，含有优质蛋白质和维生素，促进猫咪健康成长。', 79.90, 98.00, 'https://picsum.photos/seed/catfood1/300/300.jpg', 'food', 45, 150, 'active', 0, 1, 0)`,
      `INSERT IGNORE INTO products (name, description, price, original_price, image_url, category, stock, sales_count, status, is_new, is_hot, is_flash_sale, flash_sale_start, flash_sale_end_time) VALUES ('希尔斯处方猫粮 泌尿健康', '专为泌尿系统健康设计的处方猫粮，有助于预防尿结石和泌尿道疾病。', 168.00, 198.00, 'https://picsum.photos/seed/catfood2/300/300.jpg', 'food', 25, 95, 'active', 0, 0, 1, NOW(), DATE_ADD(NOW(), INTERVAL 5 DAY))`,
      `INSERT IGNORE INTO products (name, description, price, original_price, image_url, category, stock, sales_count, status, is_new, is_hot, is_flash_sale) VALUES ('渴望猫粮 六种鱼配方', '天然无谷猫粮，采用六种深海鱼类制作，富含Omega-3和Omega-6脂肪酸。', 218.00, 248.00, 'https://picsum.photos/seed/catfood3/300/300.jpg', 'food', 30, 110, 'active', 1, 1, 0)`,
      
      // 玩具类
      `INSERT IGNORE INTO products (name, description, price, original_price, image_url, category, stock, sales_count, status, is_new, is_hot, is_flash_sale) VALUES ('宠物互动玩具 智能球', '智能感应球，可自动滚动，吸引宠物注意力，增加运动量，适合狗狗和猫咪。', 58.00, 78.00, 'https://picsum.photos/seed/toy1/300/300.jpg', 'toy', 40, 88, 'active', 1, 0, 0)`,
      `INSERT IGNORE INTO products (name, description, price, original_price, image_url, category, stock, sales_count, status, is_new, is_hot, is_flash_sale) VALUES ('猫抓板 瓦楞纸材质', '天然瓦楞纸猫抓板，满足猫咪磨爪天性，保护家具不受损坏。', 28.00, 38.00, 'https://picsum.photos/seed/toy2/300/300.jpg', 'toy', 60, 200, 'active', 0, 1, 0)`,
      `INSERT IGNORE INTO products (name, description, price, original_price, image_url, category, stock, sales_count, status, is_new, is_hot, is_flash_sale, flash_sale_start, flash_sale_end_time) VALUES ('狗狗磨牙绳结玩具', '天然棉绳制作，帮助狗狗清洁牙齿，缓解磨牙期不适，增强咬合力。', 35.00, 45.00, 'https://picsum.photos/seed/toy3/300/300.jpg', 'toy', 50, 120, 'active', 0, 0, 1, NOW(), DATE_ADD(NOW(), INTERVAL 3 DAY))`,
      
      // 用品类
      `INSERT IGNORE INTO products (name, description, price, original_price, image_url, category, stock, sales_count, status, is_new, is_hot, is_flash_sale) VALUES ('宠物自动饮水机', '循环过滤饮水机，保持水质新鲜，吸引宠物多喝水，促进健康。', 128.00, 168.00, 'https://picsum.photos/seed/supply1/300/300.jpg', 'supply', 35, 95, 'active', 1, 1, 0)`,
      `INSERT IGNORE INTO products (name, description, price, original_price, image_url, category, stock, sales_count, status, is_new, is_hot, is_flash_sale) VALUES ('宠物智能喂食器', '定时定量喂食器，可通过手机APP远程控制，适合上班族和旅行时使用。', 198.00, 258.00, 'https://picsum.photos/seed/supply2/300/300.jpg', 'supply', 25, 75, 'active', 1, 0, 0)`,
      `INSERT IGNORE INTO products (name, description, price, original_price, image_url, category, stock, sales_count, status, is_new, is_hot, is_flash_sale, flash_sale_start, flash_sale_end_time) VALUES ('宠物便携背包 透气款', '户外出行必备，透气网眼设计，舒适承重，适合小型犬和猫咪。', 88.00, 118.00, 'https://picsum.photos/seed/supply3/300/300.jpg', 'supply', 30, 60, 'active', 0, 0, 1, NOW(), DATE_ADD(NOW(), INTERVAL 6 DAY))`,
      
      // 清洁类
      `INSERT IGNORE INTO products (name, description, price, original_price, image_url, category, stock, sales_count, status, is_new, is_hot, is_flash_sale) VALUES ('宠物湿巾 除菌除臭', '温和无刺激配方，有效除菌除臭，适合宠物日常清洁使用。', 19.90, 29.90, 'https://picsum.photos/seed/clean1/300/300.jpg', 'clean', 80, 180, 'active', 0, 1, 0)`,
      `INSERT IGNORE INTO products (name, description, price, original_price, image_url, category, stock, sales_count, status, is_new, is_hot, is_flash_sale) VALUES ('宠物香波 柔顺护毛', '温和清洁配方，含天然植物精华，使宠物毛发柔顺有光泽。', 38.00, 48.00, 'https://picsum.photos/seed/clean2/300/300.jpg', 'clean', 45, 130, 'active', 0, 0, 0)`,
      `INSERT IGNORE INTO products (name, description, price, original_price, image_url, category, stock, sales_count, status, is_new, is_hot, is_flash_sale, flash_sale_start, flash_sale_end_time) VALUES ('宠物除臭喷雾 室内专用', '长效除臭配方，快速分解异味分子，适合室内宠物环境使用。', 25.00, 35.00, 'https://picsum.photos/seed/clean3/300/300.jpg', 'clean', 55, 90, 'active', 1, 0, 1, NOW(), DATE_ADD(NOW(), INTERVAL 4 DAY))`
    ];
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of insertStatements) {
      try {
        const [result] = await db.execute(statement);
        successCount += result.affectedRows;
        console.log(`✅ 插入成功，影响行数: ${result.affectedRows}`);
      } catch (error) {
        console.error(`❌ 插入失败:`, error.message);
        errorCount++;
      }
    }
    
    // 验证结果
    const [newCount] = await db.execute('SELECT COUNT(*) as count FROM products');
    console.log(`插入后商品数量: ${newCount[0].count}`);
    
    // 检查限时促销商品
    const [flashSaleResult] = await db.execute('SELECT id, name, flash_sale_end_time FROM products WHERE is_flash_sale = 1');
    console.log(`限时促销商品数量: ${flashSaleResult.length}`);
    
    console.log(`✅ 成功插入 ${successCount} 条商品数据，${errorCount} 条插入失败`);
    console.log('========== 插入完成 ==========\n');
    
    res.json({
      success: true,
      message: `成功插入 ${successCount} 条商品数据`,
      beforeCount: currentCount[0].count,
      afterCount: newCount[0].count,
      flashSaleCount: flashSaleResult.length,
      successCount,
      errorCount
    });
    
  } catch (error) {
    console.error('插入商品数据失败:', error);
    res.status(500).json({
      success: false,
      message: '插入商品数据失败',
      error: error.message
    });
  }
});

// 检查商品表结构和数据
app.get('/api/check-products', async (req, res) => {
  try {
    console.log('========== 检查商品表结构和数据 ==========');
    
    // 检查表结构
    const [tableDesc] = await db.execute('DESCRIBE products');
    console.log('商品表结构:', tableDesc.map(col => `${col.Field}(${col.Type})`).join(', '));
    
    // 检查数据总数
    const [countResult] = await db.execute('SELECT COUNT(*) as total FROM products');
    console.log(`商品总数: ${countResult[0].total}`);
    
    // 检查分类分布
    const [categoryResult] = await db.execute('SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC');
    console.log('商品分类分布:');
    categoryResult.forEach(cat => {
      console.log(`  ${cat.category}: ${cat.count} 件`);
    });
    
    // 检查限时促销商品
    const [flashSaleResult] = await db.execute('SELECT id, name, is_flash_sale, flash_sale_end_time FROM products WHERE is_flash_sale = 1');
    console.log(`限时促销商品: ${flashSaleResult.length} 件`);
    flashSaleResult.forEach(product => {
      console.log(`  ${product.name}: ${product.flash_sale_end_time}`);
    });
    
    // 检查original_price字段
    const hasOriginalPrice = tableDesc.some(col => col.Field === 'original_price');
    console.log(`original_price字段: ${hasOriginalPrice ? '存在' : '不存在'}`);
    
    // 检查flash_sale_end_time字段
    const hasFlashSaleEndTime = tableDesc.some(col => col.Field === 'flash_sale_end_time');
    console.log(`flash_sale_end_time字段: ${hasFlashSaleEndTime ? '存在' : '不存在'}`);
    
    // 检查flash_sale_end字段（应该不存在）
    const hasFlashSaleEnd = tableDesc.some(col => col.Field === 'flash_sale_end');
    console.log(`flash_sale_end字段: ${hasFlashSaleEnd ? '存在（应该不存在）' : '不存在（正确）'}`);
    
    res.json({
      success: true,
      message: '商品表检查完成',
      tableStructure: tableDesc.map(col => `${col.Field}(${col.Type})`),
      totalProducts: countResult[0].total,
      categoryDistribution: categoryResult,
      flashSaleProducts: flashSaleResult,
      hasOriginalPrice,
      hasFlashSaleEndTime,
      hasFlashSaleEnd
    });
    
    console.log('========== 检查完成 ==========\n');
    
  } catch (error) {
    console.error('检查商品表失败:', error);
    res.status(500).json({
      success: false,
      message: '检查商品表失败',
      error: error.message
    });
  }
});

// 检查特定商品是否存在
app.get("/api/check-product/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    console.log(`检查商品ID: ${productId}`);
    
    const [products] = await db.execute(
      'SELECT id, name, status FROM products WHERE id = ?',
      [productId]
    );
    
    if (products.length === 0) {
      console.log(`商品ID ${productId} 不存在`);
      return res.status(404).json({
        success: false,
        message: '商品不存在',
        productId: productId
      });
    }
    
    const product = products[0];
    if (product.status !== 'active') {
      console.log(`商品ID ${productId} 存在但状态为: ${product.status}`);
      return res.status(404).json({
        success: false,
        message: '商品已下架',
        productId: productId,
        status: product.status
      });
    }
    
    console.log(`商品ID ${productId} 存在且状态为 active`);
    res.json({
      success: true,
      message: '商品存在且可购买',
      product: {
        id: product.id,
        name: product.name,
        status: product.status
      }
    });
  } catch (error) {
    console.error('检查商品失败:', error);
    res.status(500).json({
      success: false,
      message: '检查商品失败',
      error: error.message
    });
  }
});

// 检查并添加缺失的商品
app.get("/api/ensure-product/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    console.log(`确保商品ID: ${productId} 存在`);
    
    // 检查并添加original_price和flash_sale_end_time字段
    try {
      // 检查original_price列是否存在
      const [originalPriceColumn] = await db.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'products' 
        AND COLUMN_NAME = 'original_price'
      `);
      
      if (originalPriceColumn.length === 0) {
        await db.query(`
          ALTER TABLE products 
          ADD COLUMN original_price DECIMAL(10,2) DEFAULT 0
        `);
        console.log('✅ 添加original_price列成功');
      }
      
      // 检查flash_sale_end_time列是否存在
      const [flashSaleColumn] = await db.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'products' 
        AND COLUMN_NAME = 'flash_sale_end_time'
      `);
      
      if (flashSaleColumn.length === 0) {
        await db.query(`
          ALTER TABLE products 
          ADD COLUMN flash_sale_end_time DATETIME NULL
        `);
        console.log('✅ 添加flash_sale_end_time列成功');
      }
    } catch (error) {
      console.error('检查并添加列失败:', error);
      // 继续执行，可能列已存在
    }
    
    // 检查商品是否存在
    const [products] = await db.execute(
      'SELECT id, name, status FROM products WHERE id = ?',
      [productId]
    );
    
    if (products.length > 0) {
      console.log(`商品ID ${productId} 已存在`);
      return res.json({
        success: true,
        message: '商品已存在',
        product: products[0]
      });
    }
    
    // 定义所有可能的商品
    const missingProducts = [
      {
        id: 1,
        name: '皇家小型犬成犬粮',
        description: '营养均衡，促进消化健康',
        price: 258.00,
        original_price: 298.00,
        image: 'https://img.alicdn.com/i3/1657012585/O1CN01o6L2Kx1UxyMAfqn7Z_!!1657012585.jpg',
        category: '狗粮',
        stock: 45,
        sales: 1234,
        is_new: 1,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 2,
        name: '宠物自动饮水机',
        description: '静音循环，保持水质新鲜',
        price: 189.00,
        original_price: 229.00,
        image: 'https://ts4.tc.mm.bing.net/th/id/OIP-C.3FTvHf8dzEXx7Lm7kt_McAHaLB?rs=1&pid=ImgDetMain&o=7&rm=3',
        category: 'other',
        stock: 32,
        sales: 856,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 3,
        name: '猫用智能猫砂盆',
        description: '自动清理，除臭抗菌',
        price: 1280.00,
        original_price: 1580.00,
        image: 'https://img.alicdn.com/imgextra/i4/2206682938687/O1CN01YrJQaM1Cf8zJQj5Yw_!!2206682938687.jpg',
        category: '猫砂盆',
        stock: 15,
        sales: 432,
        is_new: 1,
        is_hot: 1,
        is_flash_sale: 0
      },
      {
        id: 4,
        name: '宠物智能定位器',
        description: 'GPS定位，实时追踪',
        price: 268.00,
        original_price: 328.00,
        image: 'https://img.alicdn.com/imgextra/i2/2206682938687/O1CN01q7VvX81Cf8zK8n5rH_!!2206682938687.jpg',
        category: 'other',
        stock: 28,
        sales: 678,
        is_new: 0,
        is_hot: 1,
        is_flash_sale: 0
      },
      {
        id: 5,
        name: '宠物除臭喷雾',
        description: '天然植物提取，安全无害',
        price: 58.00,
        original_price: 78.00,
        image: 'https://img.alicdn.com/imgextra/i3/2206682938687/O1CN01Z9Xq5d1Cf8zJQj5Yx_!!2206682938687.jpg',
        category: '清洁',
        stock: 86,
        sales: 1234,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 1
      },
      {
        id: 6,
        name: '宠物指甲剪',
        description: '安全设计，静音修剪',
        price: 38.00,
        original_price: 48.00,
        image: 'https://img.alicdn.com/imgextra/i4/2206682938687/O1CN01q7VvX81Cf8zK8n5rH_!!2206682938687.jpg',
        category: '美容',
        stock: 120,
        sales: 890,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 7,
        name: '宠物磨牙棒',
        description: '天然材质，清洁牙齿',
        price: 28.00,
        original_price: 38.00,
        image: 'https://img.alicdn.com/imgextra/i2/2206682938687/O1CN01q7VvX81Cf8zK8n5rH_!!2206682938687.jpg',
        category: '零食',
        stock: 200,
        sales: 1567,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 1
      },
      {
        id: 8,
        name: '宠物雨衣四脚款',
        description: '防水透气，活动自如',
        price: 45.00,
        original_price: null,
        image: 'https://ts1.tc.mm.bing.net/th/id/OIP-C.KDh2Zxf9eB2eq1W81vtGMQAAAA?w=214&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.5&pid=3.1&rm=2',
        category: 'wear',
        stock: 34,
        sales: 567,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 10,
        name: '宠物洗护套装',
        description: '温和配方，深层清洁',
        price: 128.00,
        original_price: 168.00,
        image: 'https://img.alicdn.com/imgextra/i4/2206682938687/O1CN01q7VvX81Cf8zK8n5rH_!!2206682938687.jpg',
        category: '洗护',
        stock: 45,
        sales: 678,
        is_new: 1,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 12,
        name: '冻干鸡肉粒宠物零食',
        description: '纯天然无添加，高蛋白低脂',
        price: 68.00,
        original_price: 88.00,
        image: 'http://img.alicdn.com/img/i1/9734303905/O1CN01TYZTnH1eiXkNnvpTV_!!4611686018427383969-0-saturn_solar.jpg',
        category: '零食',
        stock: 56,
        sales: 2234,
        is_new: 1,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 14,
        name: '耐咬橡胶磨牙玩具',
        description: '食品级材质，清洁牙齿',
        price: 38.00,
        original_price: 48.00,
        image: 'http://img.alicdn.com/img/i4/28852095/O1CN01wDTL8H1RLYe4NlDrW_!!0-saturn_solar.jpg',
        category: 'toy',
        stock: 78,
        sales: 1567,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 15,
        name: '狗狗益智漏食玩具',
        description: '延缓进食，训练智力',
        price: 58.00,
        original_price: 68.00,
        image: 'https://gw.alicdn.com/imgextra/O1CN01dwvafY1FfSgXSe4qs_!!2214975900514-0-yinheaigc.jpg',
        category: 'toy',
        stock: 62,
        sales: 1123,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 17,
        name: '宠物关节保健片',
        description: '缓解关节疼痛，增强活动力',
        price: 158.00,
        original_price: 188.00,
        image: 'http://img.alicdn.com/img/i2/7924477624/O1CN01WLsRG926BqiM1Szuw_!!4611686018427383480-0-saturn_solar.jpg',
        category: 'health',
        stock: 35,
        sales: 987,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 22,
        name: '宠物柔软毛毯',
        description: '亲肤材质，可机洗',
        price: 68.00,
        original_price: 88.00,
        image: 'http://img.alicdn.com/img/i2/1464730048/O1CN01nPh1zN1CE20aMRRC0_!!0-saturn_solar.jpg',
        category: 'bed',
        stock: 72,
        sales: 1456,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 23,
        name: '宠物半封闭式窝',
        description: '安全感设计，保暖透气',
        price: 158.00,
        original_price: 198.00,
        image: 'https://img.alicdn.com/imgextra/i3/2217224742649/O1CN01A7xbv11VRIGcQxEy3_!!2217224742649-0-alimamacc.jpg',
        category: 'bed',
        stock: 29,
        sales: 890,
        is_new: 1,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 25,
        name: '宠物圣诞服装',
        description: '节日氛围，拍照神器',
        price: 88.00,
        original_price: 108.00,
        image: 'http://img.alicdn.com/img/i1/6444622440/O1CN01wDNL4y1TtZVKYJqR3_!!4611686018427380328-2-saturn_solar.png',
        category: 'wear',
        stock: 45,
        sales: 678,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      }
    ];
    
    // 查找请求的商品ID
    const productToAdd = missingProducts.find(p => p.id == productId);
    
    if (productToAdd) {
      console.log(`商品ID ${productId} 不存在，正在添加...`);
      
      await db.execute(`
        INSERT INTO products (
          id, name, description, price, original_price, image_url, category, 
          stock, sales_count, status, is_new, is_hot, is_flash_sale
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        productToAdd.id, productToAdd.name, productToAdd.description, productToAdd.price, 
        productToAdd.original_price || null, productToAdd.image, productToAdd.category, 
        productToAdd.stock, productToAdd.sales, 'active',
        productToAdd.is_new, productToAdd.is_hot, productToAdd.is_flash_sale
      ]);
      
      console.log(`✅ 成功添加商品ID ${productId}: ${productToAdd.name}`);
      
      return res.json({
        success: true,
        message: '商品已添加',
        product: {
          id: productToAdd.id,
          name: productToAdd.name,
          status: 'active'
        }
      });
    }
    
    // 其他ID的商品不存在
    console.log(`商品ID ${productId} 不存在于预定义列表中`);
    return res.status(404).json({
      success: false,
      message: '商品不存在',
      productId: productId
    });
    
  } catch (error) {
    console.error('确保商品存在失败:', error);
    res.status(500).json({
      success: false,
      message: '确保商品存在失败',
      error: error.message
    });
  }
});

// 添加所有缺失的商品
app.get("/api/add-all-missing-products", async (req, res) => {
  try {
    console.log('========== 开始添加所有缺失的商品 ==========');
    
    // 检查并添加original_price和flash_sale_end_time字段
    try {
      // 检查original_price列是否存在
      const [originalPriceColumn] = await db.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'products' 
        AND COLUMN_NAME = 'original_price'
      `);
      
      if (originalPriceColumn.length === 0) {
        await db.query(`
          ALTER TABLE products 
          ADD COLUMN original_price DECIMAL(10,2) DEFAULT 0
        `);
        console.log('✅ 添加original_price列成功');
      }
      
      // 检查flash_sale_end_time列是否存在
      const [flashSaleColumn] = await db.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'products' 
        AND COLUMN_NAME = 'flash_sale_end_time'
      `);
      
      if (flashSaleColumn.length === 0) {
        await db.query(`
          ALTER TABLE products 
          ADD COLUMN flash_sale_end_time DATETIME NULL
        `);
        console.log('✅ 添加flash_sale_end_time列成功');
      }
    } catch (error) {
      console.error('检查并添加列失败:', error);
      // 继续执行，可能列已存在
    }
    
    // 定义所有可能的商品
    const allProducts = [
      {
        id: 1,
        name: '皇家小型犬成犬粮',
        description: '营养均衡，促进消化健康',
        price: 258.00,
        original_price: 298.00,
        image: 'https://img.alicdn.com/i3/1657012585/O1CN01o6L2Kx1UxyMAfqn7Z_!!1657012585.jpg',
        category: '狗粮',
        stock: 45,
        sales: 1234,
        is_new: 1,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 2,
        name: '宠物自动饮水机',
        description: '静音循环，保持水质新鲜',
        price: 189.00,
        original_price: 229.00,
        image: 'https://ts4.tc.mm.bing.net/th/id/OIP-C.3FTvHf8dzEXx7Lm7kt_McAHaLB?rs=1&pid=ImgDetMain&o=7&rm=3',
        category: 'other',
        stock: 32,
        sales: 856,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 3,
        name: '猫用智能猫砂盆',
        description: '自动清理，除臭抗菌',
        price: 1280.00,
        original_price: 1580.00,
        image: 'https://img.alicdn.com/imgextra/i4/2206682938687/O1CN01YrJQaM1Cf8zJQj5Yw_!!2206682938687.jpg',
        category: '猫砂盆',
        stock: 15,
        sales: 432,
        is_new: 1,
        is_hot: 1,
        is_flash_sale: 0
      },
      {
        id: 4,
        name: '宠物智能定位器',
        description: 'GPS定位，实时追踪',
        price: 268.00,
        original_price: 328.00,
        image: 'https://img.alicdn.com/imgextra/i2/2206682938687/O1CN01q7VvX81Cf8zK8n5rH_!!2206682938687.jpg',
        category: 'other',
        stock: 28,
        sales: 678,
        is_new: 0,
        is_hot: 1,
        is_flash_sale: 0
      },
      {
        id: 5,
        name: '宠物除臭喷雾',
        description: '天然植物提取，安全无害',
        price: 58.00,
        original_price: 78.00,
        image: 'https://img.alicdn.com/imgextra/i3/2206682938687/O1CN01Z9Xq5d1Cf8zJQj5Yx_!!2206682938687.jpg',
        category: '清洁',
        stock: 86,
        sales: 1234,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 1
      },
      {
        id: 6,
        name: '宠物指甲剪',
        description: '安全设计，静音修剪',
        price: 38.00,
        original_price: 48.00,
        image: 'https://img.alicdn.com/imgextra/i4/2206682938687/O1CN01q7VvX81Cf8zK8n5rH_!!2206682938687.jpg',
        category: '美容',
        stock: 120,
        sales: 890,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 7,
        name: '宠物磨牙棒',
        description: '天然材质，清洁牙齿',
        price: 28.00,
        original_price: 38.00,
        image: 'https://img.alicdn.com/imgextra/i2/2206682938687/O1CN01q7VvX81Cf8zK8n5rH_!!2206682938687.jpg',
        category: '零食',
        stock: 200,
        sales: 1567,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 1
      },
      {
        id: 8,
        name: '宠物雨衣四脚款',
        description: '防水透气，活动自如',
        price: 45.00,
        original_price: null,
        image: 'https://ts1.tc.mm.bing.net/th/id/OIP-C.KDh2Zxf9eB2eq1W81vtGMQAAAA?w=214&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.5&pid=3.1&rm=2',
        category: 'wear',
        stock: 34,
        sales: 567,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 10,
        name: '宠物洗护套装',
        description: '温和配方，深层清洁',
        price: 128.00,
        original_price: 168.00,
        image: 'https://img.alicdn.com/imgextra/i4/2206682938687/O1CN01q7VvX81Cf8zK8n5rH_!!2206682938687.jpg',
        category: '洗护',
        stock: 45,
        sales: 678,
        is_new: 1,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 12,
        name: '冻干鸡肉粒宠物零食',
        description: '纯天然无添加，高蛋白低脂',
        price: 68.00,
        original_price: 88.00,
        image: 'http://img.alicdn.com/img/i1/9734303905/O1CN01TYZTnH1eiXkNnvpTV_!!4611686018427383969-0-saturn_solar.jpg',
        category: '零食',
        stock: 56,
        sales: 2234,
        is_new: 1,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 14,
        name: '耐咬橡胶磨牙玩具',
        description: '食品级材质，清洁牙齿',
        price: 38.00,
        original_price: 48.00,
        image: 'http://img.alicdn.com/img/i4/28852095/O1CN01wDTL8H1RLYe4NlDrW_!!0-saturn_solar.jpg',
        category: 'toy',
        stock: 78,
        sales: 1567,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 15,
        name: '狗狗益智漏食玩具',
        description: '延缓进食，训练智力',
        price: 58.00,
        original_price: 68.00,
        image: 'https://gw.alicdn.com/imgextra/O1CN01dwvafY1FfSgXSe4qs_!!2214975900514-0-yinheaigc.jpg',
        category: 'toy',
        stock: 62,
        sales: 1123,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 17,
        name: '宠物关节保健片',
        description: '缓解关节疼痛，增强活动力',
        price: 158.00,
        original_price: 188.00,
        image: 'http://img.alicdn.com/img/i2/7924477624/O1CN01WLsRG926BqiM1Szuw_!!4611686018427383480-0-saturn_solar.jpg',
        category: 'health',
        stock: 35,
        sales: 987,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 22,
        name: '宠物柔软毛毯',
        description: '亲肤材质，可机洗',
        price: 68.00,
        original_price: 88.00,
        image: 'http://img.alicdn.com/img/i2/1464730048/O1CN01nPh1zN1CE20aMRRC0_!!0-saturn_solar.jpg',
        category: 'bed',
        stock: 72,
        sales: 1456,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 23,
        name: '宠物半封闭式窝',
        description: '安全感设计，保暖透气',
        price: 158.00,
        original_price: 198.00,
        image: 'https://img.alicdn.com/imgextra/i3/2217224742649/O1CN01A7xbv11VRIGcQxEy3_!!2217224742649-0-alimamacc.jpg',
        category: 'bed',
        stock: 29,
        sales: 890,
        is_new: 1,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 25,
        name: '宠物圣诞服装',
        description: '节日氛围，拍照神器',
        price: 88.00,
        original_price: 108.00,
        image: 'http://img.alicdn.com/img/i1/6444622440/O1CN01wDNL4y1TtZVKYJqR3_!!4611686018427380328-2-saturn_solar.png',
        category: 'wear',
        stock: 45,
        sales: 678,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      }
    ];
    
    let successCount = 0;
    let failCount = 0;
    const results = [];
    
    // 检查并添加每个商品
    for (const product of allProducts) {
      try {
        // 检查商品是否已存在
        const [existing] = await db.query('SELECT id FROM products WHERE id = ?', [product.id]);
        
        if (existing.length === 0) {
          // 商品不存在，添加它
          await db.query(`
            INSERT INTO products (
              id, name, description, price, original_price, image, category, 
              stock, sales, is_new, is_hot, is_flash_sale, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
          `, [
            product.id, product.name, product.description, product.price, 
            product.original_price, product.image, product.category, 
            product.stock, product.sales, product.is_new, product.is_hot, product.is_flash_sale
          ]);
          
          successCount++;
          results.push(`成功添加商品 ID ${product.id}: ${product.name}`);
          console.log(`✅ 成功添加商品 ID ${product.id}: ${product.name}`);
        } else {
          results.push(`商品 ID ${product.id} 已存在`);
        }
      } catch (err) {
        console.error(`添加商品 ID ${product.id} 失败:`, err);
        failCount++;
        results.push(`添加商品 ID ${product.id} 失败: ${err.message}`);
      }
    }
    
    // 获取商品总数
    const [countResult] = await db.query('SELECT COUNT(*) as total FROM products');
    const totalProducts = countResult[0].total;
    
    res.json({
      message: '添加所有缺失商品完成',
      successCount,
      failCount,
      totalProducts,
      results
    });
  } catch (error) {
    console.error('添加所有缺失商品失败:', error);
    res.status(500).json({ message: '添加所有缺失商品失败', error: error.message });
  }
});

// 创建购物车表并修复外键问题
app.get("/api/fix-carts-table", async (req, res) => {
  try {
    console.log('========== 开始修复购物车相关表 ==========');
    
    // 创建carts表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS carts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ carts表创建成功');
    
    // 检查cart_items表结构
    const [columns] = await db.execute("SHOW COLUMNS FROM cart_items");
    const columnNames = columns.map(col => col.Field);
    
    // 如果cart_items表没有cart_id字段，则添加它
    if (!columnNames.includes('cart_id')) {
      await db.execute("ALTER TABLE cart_items ADD COLUMN cart_id INT");
      console.log('✅ 添加cart_id字段到cart_items表');
    }
    
    // 检查外键约束
    try {
      // 删除可能存在的外键约束
      await db.execute("ALTER TABLE cart_items DROP FOREIGN KEY IF EXISTS cart_items_ibfk_1");
      console.log('✅ 删除旧的外键约束');
    } catch (error) {
      console.log('⚠️ 删除外键约束失败:', error.message);
    }
    
    // 添加新的外键约束
    try {
      await db.execute("ALTER TABLE cart_items ADD CONSTRAINT cart_items_ibfk_1 FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE");
      console.log('✅ 添加新的外键约束');
    } catch (error) {
      console.log('⚠️ 添加外键约束失败:', error.message);
    }
    
    // 为所有用户创建购物车
    const [users] = await db.execute("SELECT id FROM users");
    for (const user of users) {
      // 检查用户是否已有购物车
      const [existingCarts] = await db.execute("SELECT id FROM carts WHERE user_id = ?", [user.id]);
      
      if (existingCarts.length === 0) {
        // 创建购物车
        const [result] = await db.execute("INSERT INTO carts (user_id) VALUES (?)", [user.id]);
        const cartId = result.insertId;
        
        // 更新该用户的所有购物车项，设置cart_id
        await db.execute("UPDATE cart_items SET cart_id = ? WHERE user_id = ?", [cartId, user.id]);
        
        console.log(`✅ 为用户ID ${user.id} 创建购物车，ID: ${cartId}`);
      }
    }
    
    console.log('========== 购物车相关表修复完成 ==========\n');
    
    res.json({
      success: true,
      message: '购物车相关表修复完成'
    });
    
  } catch (error) {
    console.error('修复购物车表失败:', error);
    res.status(500).json({
      success: false,
      message: '修复购物车表失败',
      error: error.message
    });
  }
});

// 初始化所有缺失的商品
app.get("/api/init-all-missing-products", async (req, res) => {
  try {
    console.log('========== 开始初始化所有缺失的商品 ==========');
    
    // 检查并添加original_price和flash_sale_end_time字段
    try {
      // 检查original_price列是否存在
      const [originalPriceColumn] = await db.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'products' 
        AND COLUMN_NAME = 'original_price'
      `);
      
      if (originalPriceColumn.length === 0) {
        await db.query(`
          ALTER TABLE products 
          ADD COLUMN original_price DECIMAL(10,2) DEFAULT 0
        `);
        console.log('✅ 添加original_price列成功');
      }
      
      // 检查flash_sale_end_time列是否存在
      const [flashSaleColumn] = await db.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'products' 
        AND COLUMN_NAME = 'flash_sale_end_time'
      `);
      
      if (flashSaleColumn.length === 0) {
        await db.query(`
          ALTER TABLE products 
          ADD COLUMN flash_sale_end_time DATETIME NULL
        `);
        console.log('✅ 添加flash_sale_end_time列成功');
      }
    } catch (error) {
      console.error('检查并添加列失败:', error);
      // 继续执行，可能列已存在
    }
    
    // 定义所有可能的商品
    const allProducts = [
      {
        id: 1,
        name: '皇家小型犬成犬粮',
        description: '营养均衡，促进消化健康',
        price: 258.00,
        original_price: 298.00,
        image: 'https://img.alicdn.com/i3/1657012585/O1CN01o6L2Kx1UxyMAfqn7Z_!!1657012585.jpg',
        category: '狗粮',
        stock: 45,
        sales: 1234,
        is_new: 1,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 2,
        name: '宠物自动饮水机',
        description: '静音循环，保持水质新鲜',
        price: 189.00,
        original_price: 229.00,
        image: 'https://ts4.tc.mm.bing.net/th/id/OIP-C.3FTvHf8dzEXx7Lm7kt_McAHaLB?rs=1&pid=ImgDetMain&o=7&rm=3',
        category: 'other',
        stock: 32,
        sales: 856,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 3,
        name: '猫用智能猫砂盆',
        description: '自动清理，除臭抗菌',
        price: 1280.00,
        original_price: 1580.00,
        image: 'https://img.alicdn.com/imgextra/i4/2206682938687/O1CN01YrJQaM1Cf8zJQj5Yw_!!2206682938687.jpg',
        category: '猫砂盆',
        stock: 15,
        sales: 432,
        is_new: 1,
        is_hot: 1,
        is_flash_sale: 0
      },
      {
        id: 4,
        name: '宠物智能定位器',
        description: 'GPS定位，实时追踪',
        price: 268.00,
        original_price: 328.00,
        image: 'https://img.alicdn.com/imgextra/i2/2206682938687/O1CN01q7VvX81Cf8zK8n5rH_!!2206682938687.jpg',
        category: 'other',
        stock: 28,
        sales: 678,
        is_new: 0,
        is_hot: 1,
        is_flash_sale: 0
      },
      {
        id: 5,
        name: '宠物除臭喷雾',
        description: '天然植物提取，安全无害',
        price: 58.00,
        original_price: 78.00,
        image: 'https://img.alicdn.com/imgextra/i3/2206682938687/O1CN01Z9Xq5d1Cf8zJQj5Yx_!!2206682938687.jpg',
        category: '清洁',
        stock: 86,
        sales: 1234,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 1
      },
      {
        id: 6,
        name: '宠物指甲剪',
        description: '安全设计，静音修剪',
        price: 38.00,
        original_price: 48.00,
        image: 'https://img.alicdn.com/imgextra/i4/2206682938687/O1CN01q7VvX81Cf8zK8n5rH_!!2206682938687.jpg',
        category: '美容',
        stock: 120,
        sales: 890,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 7,
        name: '宠物磨牙棒',
        description: '天然材质，清洁牙齿',
        price: 28.00,
        original_price: 38.00,
        image: 'https://img.alicdn.com/imgextra/i2/2206682938687/O1CN01q7VvX81Cf8zK8n5rH_!!2206682938687.jpg',
        category: '零食',
        stock: 200,
        sales: 1567,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 1
      },
      {
        id: 8,
        name: '宠物雨衣四脚款',
        description: '防水透气，活动自如',
        price: 45.00,
        original_price: null,
        image: 'https://ts1.tc.mm.bing.net/th/id/OIP-C.KDh2Zxf9eB2eq1W81vtGMQAAAA?w=214&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.5&pid=3.1&rm=2',
        category: 'wear',
        stock: 34,
        sales: 567,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 9,
        name: '宠物牵引绳',
        description: '反光设计，安全夜间出行',
        price: 68.00,
        original_price: 88.00,
        image: 'https://img.alicdn.com/imgextra/i3/2206682938687/O1CN01YrJQaM1Cf8zJQj5Yw_!!2206682938687.jpg',
        category: '牵引',
        stock: 76,
        sales: 945,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 10,
        name: '宠物洗护套装',
        description: '温和配方，深层清洁',
        price: 128.00,
        original_price: 168.00,
        image: 'https://img.alicdn.com/imgextra/i4/2206682938687/O1CN01q7VvX81Cf8zK8n5rH_!!2206682938687.jpg',
        category: '洗护',
        stock: 45,
        sales: 678,
        is_new: 1,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 11,
        name: '宠物智能喂食器',
        description: '定时定量，远程控制',
        price: 458.00,
        original_price: 558.00,
        image: 'https://img.alicdn.com/imgextra/i2/2206682938687/O1CN01q7VvX81Cf8zK8n5rH_!!2206682938687.jpg',
        category: '喂食器',
        stock: 22,
        sales: 345,
        is_new: 1,
        is_hot: 1,
        is_flash_sale: 0
      },
      {
        id: 12,
        name: '冻干鸡肉粒宠物零食',
        description: '纯天然无添加，高蛋白低脂',
        price: 68.00,
        original_price: 88.00,
        image: 'http://img.alicdn.com/img/i1/9734303905/O1CN01TYZTnH1eiXkNnvpTV_!!4611686018427383969-0-saturn_solar.jpg',
        category: '零食',
        stock: 56,
        sales: 2234,
        is_new: 1,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 13,
        name: '宠物玩具球',
        description: '耐咬材质，互动乐趣',
        price: 28.00,
        original_price: 38.00,
        image: 'https://img.alicdn.com/imgextra/i3/2206682938687/O1CN01YrJQaM1Cf8zJQj5Yw_!!2206682938687.jpg',
        category: '玩具',
        stock: 150,
        sales: 1890,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 1
      },
      {
        id: 14,
        name: '耐咬橡胶磨牙玩具',
        description: '食品级材质，清洁牙齿',
        price: 38.00,
        original_price: 48.00,
        image: 'http://img.alicdn.com/img/i4/28852095/O1CN01wDTL8H1RLYe4NlDrW_!!0-saturn_solar.jpg',
        category: 'toy',
        stock: 78,
        sales: 1567,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 15,
        name: '狗狗益智漏食玩具',
        description: '延缓进食，训练智力',
        price: 58.00,
        original_price: 68.00,
        image: 'https://gw.alicdn.com/imgextra/O1CN01dwvafY1FfSgXSe4qs_!!2214975900514-0-yinheaigc.jpg',
        category: 'toy',
        stock: 62,
        sales: 1123,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 16,
        name: '宠物智能摄像头',
        description: '双向语音，实时监控',
        price: 368.00,
        original_price: 468.00,
        image: 'https://img.alicdn.com/imgextra/i4/2206682938687/O1CN01q7VvX81Cf8zK8n5rH_!!2206682938687.jpg',
        category: '监控',
        stock: 18,
        sales: 234,
        is_new: 1,
        is_hot: 1,
        is_flash_sale: 0
      },
      {
        id: 17,
        name: '宠物关节保健片',
        description: '缓解关节疼痛，增强活动力',
        price: 158.00,
        original_price: 188.00,
        image: 'http://img.alicdn.com/img/i2/7924477624/O1CN01WLsRG926BqiM1Szuw_!!4611686018427383480-0-saturn_solar.jpg',
        category: 'health',
        stock: 35,
        sales: 987,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 18,
        name: '宠物猫抓板',
        description: '天然材质，满足抓挠天性',
        price: 88.00,
        original_price: 108.00,
        image: 'https://img.alicdn.com/imgextra/i2/2206682938687/O1CN01q7VvX81Cf8zK8n5rH_!!2206682938687.jpg',
        category: '猫抓板',
        stock: 94,
        sales: 1234,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 19,
        name: '宠物猫爬架',
        description: '多层设计，满足攀爬需求',
        price: 568.00,
        original_price: 688.00,
        image: 'https://img.alicdn.com/imgextra/i3/2206682938687/O1CN01YrJQaM1Cf8zJQj5Yw_!!2206682938687.jpg',
        category: '猫爬架',
        stock: 12,
        sales: 189,
        is_new: 1,
        is_hot: 1,
        is_flash_sale: 0
      },
      {
        id: 20,
        name: '宠物猫砂',
        description: '结团快速，除臭效果好',
        price: 68.00,
        original_price: 88.00,
        image: 'https://img.alicdn.com/imgextra/i4/2206682938687/O1CN01q7VvX81Cf8zK8n5rH_!!2206682938687.jpg',
        category: '猫砂',
        stock: 200,
        sales: 2345,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 1
      },
      {
        id: 21,
        name: '宠物猫粮',
        description: '营养均衡，适合成猫',
        price: 188.00,
        original_price: 228.00,
        image: 'https://img.alicdn.com/imgextra/i2/2206682938687/O1CN01q7VvX81Cf8zK8n5rH_!!2206682938687.jpg',
        category: '猫粮',
        stock: 88,
        sales: 1567,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 22,
        name: '宠物柔软毛毯',
        description: '亲肤材质，可机洗',
        price: 68.00,
        original_price: 88.00,
        image: 'http://img.alicdn.com/img/i2/1464730048/O1CN01nPh1zN1CE20aMRRC0_!!0-saturn_solar.jpg',
        category: 'bed',
        stock: 72,
        sales: 1456,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 23,
        name: '宠物半封闭式窝',
        description: '安全感设计，保暖透气',
        price: 158.00,
        original_price: 198.00,
        image: 'https://img.alicdn.com/imgextra/i3/2217224742649/O1CN01A7xbv11VRIGcQxEy3_!!2217224742649-0-alimamacc.jpg',
        category: 'bed',
        stock: 29,
        sales: 890,
        is_new: 1,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 24,
        name: '宠物航空箱',
        description: '透气设计，安全出行',
        price: 268.00,
        original_price: 328.00,
        image: 'https://img.alicdn.com/imgextra/i4/2206682938687/O1CN01q7VvX81Cf8zK8n5rH_!!2206682938687.jpg',
        category: '出行',
        stock: 34,
        sales: 567,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 25,
        name: '宠物圣诞服装',
        description: '节日氛围，拍照神器',
        price: 88.00,
        original_price: 108.00,
        image: 'http://img.alicdn.com/img/i1/6444622440/O1CN01wDNL4y1TtZVKYJqR3_!!4611686018427380328-2-saturn_solar.png',
        category: 'wear',
        stock: 45,
        sales: 678,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      }
    ];
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const product of allProducts) {
      try {
        // 检查商品是否已存在
        const [existing] = await db.execute('SELECT id FROM products WHERE id = ?', [product.id]);
        
        if (existing.length === 0) {
          await db.execute(`
            INSERT INTO products (
              id, name, description, price, original_price, image_url, category, 
              stock, sales_count, status, is_new, is_hot, is_flash_sale
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            product.id, product.name, product.description, product.price, 
            product.original_price || null, product.image, product.category, 
            product.stock, product.sales, 'active',
            product.is_new, product.is_hot, product.is_flash_sale
          ]);
          
          console.log(`✅ 添加商品 "${product.name}" 成功，ID: ${product.id}`);
          addedCount++;
        } else {
          console.log(`⚠️ 商品ID ${product.id} 已存在，跳过`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`❌ 添加商品 "${product.name}" 失败:`, error.message);
      }
    }
    
    console.log(`========== 初始化完成，添加了 ${addedCount} 个商品，跳过了 ${skippedCount} 个已存在的商品 ==========\n`);
    
    res.json({
      success: true,
      message: `初始化完成，添加了 ${addedCount} 个商品，跳过了 ${skippedCount} 个已存在的商品`,
      addedCount: addedCount,
      skippedCount: skippedCount
    });
    
  } catch (error) {
    console.error('初始化所有商品失败:', error);
    res.status(500).json({
      success: false,
      message: '初始化所有商品失败',
      error: error.message
    });
  }
});

// 8. 初始化服务类型数据
app.get("/api/init-service-types", async (req, res) => {
  try {
    console.log('========== 开始初始化服务类型数据 ==========');
    
    // 清空现有数据
    await db.execute('DELETE FROM service_types');
    console.log('✅ 已清空现有服务类型数据');
    
    // 插入服务类型数据
    const serviceTypes = [
      {
        name: '基础体检',
        description: '包括常规体检、疫苗接种建议、驱虫建议等基础健康检查服务',
        duration: 30,
        price: 80.00,
        image: 'https://picsum.photos/seed/service1/300/300.jpg'
      },
      {
        name: '深度体检',
        description: '包括血常规、生化检查、X光检查等全面健康评估',
        duration: 60,
        price: 200.00,
        image: 'https://picsum.photos/seed/service2/300/300.jpg'
      },
      {
        name: '美容护理',
        description: '包括洗澡、吹干、修剪毛发、清洁耳朵、剪指甲等全套美容服务',
        duration: 90,
        price: 120.00,
        image: 'https://picsum.photos/seed/service3/300/300.jpg'
      },
      {
        name: '行为训练',
        description: '针对宠物行为问题的专业训练课程，包括基础服从训练和行为矫正',
        duration: 45,
        price: 150.00,
        image: 'https://picsum.photos/seed/service4/300/300.jpg'
      },
      {
        name: '寄养服务',
        description: '提供安全舒适的寄养环境，包括日常喂养、遛弯、陪伴等服务',
        duration: 1440, // 24小时
        price: 80.00,
        image: 'https://picsum.photos/seed/service5/300/300.jpg'
      },
      {
        name: '宠物摄影',
        description: '专业宠物摄影服务，记录您与爱宠的美好时光',
        duration: 60,
        price: 180.00,
        image: 'https://picsum.photos/seed/service6/300/300.jpg'
      }
    ];
    
    for (const serviceType of serviceTypes) {
      await db.execute(`
        INSERT INTO service_types (name, description, duration, price, image)
        VALUES (?, ?, ?, ?, ?)
      `, [serviceType.name, serviceType.description, serviceType.duration, serviceType.price, serviceType.image]);
    }
    
    console.log(`✅ 成功插入 ${serviceTypes.length} 条服务类型数据`);
    console.log('========== 初始化完成 ==========\n');
    
    res.json({
      success: true,
      message: `成功初始化 ${serviceTypes.length} 条服务类型数据`,
      count: serviceTypes.length
    });
    
  } catch (error) {
    console.error('初始化服务类型数据失败:', error);
    res.status(500).json({
      success: false,
      message: '初始化服务类型数据失败',
      error: error.message
    });
  }
});

// 14. 初始化服务人员数据
app.get("/api/init-service-providers", async (req, res) => {
  try {
    console.log('========== 开始初始化服务人员数据 ==========');
    
    // 清空现有数据
    await db.execute('DELETE FROM service_providers');
    console.log('✅ 已清空现有服务人员数据');
    
    // 插入服务人员数据
    const serviceProviders = [
      {
        name: '李医生',
        phone: '13800138001',
        email: 'doctor.li@example.com',
        specialty: '宠物内科',
        experience_years: 8,
        rating: 4.8,
        introduction: '拥有8年宠物临床经验，擅长宠物内科疾病诊断与治疗',
        avatar: 'https://picsum.photos/seed/provider1/200/200.jpg'
      },
      {
        name: '王美容师',
        phone: '13800138002',
        email: 'groomer.wang@example.com',
        specialty: '宠物美容',
        experience_years: 5,
        rating: 4.9,
        introduction: '专业宠物美容师，精通各种犬猫美容造型，让您的爱宠焕然一新',
        avatar: 'https://picsum.photos/seed/provider2/200/200.jpg'
      },
      {
        name: '张训练师',
        phone: '13800138003',
        email: 'trainer.zhang@example.com',
        specialty: '宠物行为训练',
        experience_years: 6,
        rating: 4.7,
        introduction: '认证宠物行为训练师，擅长解决各种宠物行为问题',
        avatar: 'https://picsum.photos/seed/provider3/200/200.jpg'
      },
      {
        name: '陈护士',
        phone: '13800138004',
        email: 'nurse.chen@example.com',
        specialty: '宠物护理',
        experience_years: 4,
        rating: 4.6,
        introduction: '专业宠物护士，提供专业的宠物护理和健康咨询服务',
        avatar: 'https://picsum.photos/seed/provider4/200/200.jpg'
      },
      {
        name: '刘摄影',
        phone: '13800138005',
        email: 'photo.liu@example.com',
        specialty: '宠物摄影',
        experience_years: 3,
        rating: 4.9,
        introduction: '专业宠物摄影师，擅长捕捉宠物最自然可爱的一面',
        avatar: 'https://picsum.photos/seed/provider5/200/200.jpg'
      }
    ];
    
    for (const provider of serviceProviders) {
      await db.execute(`
        INSERT INTO service_providers (name, phone, email, specialty, experience_years, rating, introduction, avatar)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [provider.name, provider.phone, provider.email, provider.specialty, provider.experience_years, provider.rating, provider.introduction, provider.avatar]);
    }
    
    console.log(`✅ 成功插入 ${serviceProviders.length} 条服务人员数据`);
    console.log('========== 初始化完成 ==========\n');
    
    res.json({
      success: true,
      message: `成功初始化 ${serviceProviders.length} 条服务人员数据`,
      count: serviceProviders.length
    });
    
  } catch (error) {
    console.error('初始化服务人员数据失败:', error);
    res.status(500).json({
      success: false,
      message: '初始化服务人员数据失败',
      error: error.message
    });
  }
});

// 8. 健康检查
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "服务器运行正常",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 9. 服务类型相关API
app.get("/api/service-types", async (req, res) => {
  try {
    const [serviceTypes] = await db.execute(`
      SELECT * FROM service_types WHERE status = 'active' ORDER BY id
    `);
    
    res.json({
      success: true,
      data: serviceTypes
    });
  } catch (error) {
    console.error('获取服务类型失败:', error);
    res.status(500).json({
      success: false,
      message: '获取服务类型失败',
      error: error.message
    });
  }
});

// 10. 服务人员相关API
app.get("/api/service-providers", async (req, res) => {
  try {
    const [providers] = await db.execute(`
      SELECT * FROM service_providers WHERE status = 'active' ORDER BY rating DESC
    `);
    
    res.json({
      success: true,
      data: providers
    });
  } catch (error) {
    console.error('获取服务人员失败:', error);
    res.status(500).json({
      success: false,
      message: '获取服务人员失败',
      error: error.message
    });
  }
});

// 11. 评价相关API
app.get("/api/reviews", async (req, res) => {
  try {
    const { targetId, type, page = 1, limit = 10 } = req.query;
    let query = `
      SELECT r.*, u.name as user_name 
      FROM reviews r 
      JOIN users u ON r.user_id = u.id 
      WHERE r.status = 'published'
    `;
    const params = [];
    
    if (targetId) {
      query += ' AND r.target_id = ?';
      params.push(targetId);
    }
    
    if (type) {
      query += ' AND r.type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    
    const [reviews] = await db.execute(query, params);
    
    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM reviews WHERE status = "published"';
    const countParams = [];
    
    if (targetId) {
      countQuery += ' AND target_id = ?';
      countParams.push(targetId);
    }
    
    if (type) {
      countQuery += ' AND type = ?';
      countParams.push(type);
    }
    
    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('获取评价失败:', error);
    res.status(500).json({
      success: false,
      message: '获取评价失败',
      error: error.message
    });
  }
});

app.post("/api/reviews", async (req, res) => {
  try {
    const { targetId, type, rating, content, images, isAnonymous } = req.body;
    
    // 验证用户是否已登录（简化版，实际应使用JWT验证）
    const userId = req.headers['x-user-id'] || 1; // 默认用户ID为1，实际应从token获取
    
    if (!targetId || !type || !rating) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }
    
    // 检查是否已经评价过
    const [existingReview] = await db.execute(
      'SELECT id FROM reviews WHERE user_id = ? AND target_id = ? AND type = ?',
      [userId, targetId, type]
    );
    
    if (existingReview.length > 0) {
      return res.status(400).json({
        success: false,
        message: '您已经评价过了'
      });
    }
    
    // 插入评价
    const [result] = await db.execute(`
      INSERT INTO reviews (user_id, target_id, type, rating, content, images, is_anonymous)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [userId, targetId, type, rating, content, images ? JSON.stringify(images) : null, isAnonymous || 0]);
    
    res.status(201).json({
      success: true,
      message: '评价成功',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('创建评价失败:', error);
    res.status(500).json({
      success: false,
      message: '创建评价失败',
      error: error.message
    });
  }
});

// 12. 收藏相关API
app.get("/api/favorites", async (req, res) => {
  try {
    // 验证用户是否已登录（简化版，实际应使用JWT验证）
    const userId = req.headers['x-user-id'] || 1; // 默认用户ID为1，实际应从token获取
    const { type } = req.query;
    
    let query = `
      SELECT f.*, 
        CASE 
          WHEN f.type = 'product' THEN p.name
          WHEN f.type = 'pet' THEN pt.name
        END as item_name,
        CASE 
          WHEN f.type = 'product' THEN p.image
          WHEN f.type = 'pet' THEN pt.image
        END as item_image,
        CASE 
          WHEN f.type = 'product' THEN p.price
          WHEN f.type = 'pet' THEN NULL
        END as item_price
      FROM favorites f
      LEFT JOIN products p ON f.type = 'product' AND f.target_id = p.id
      LEFT JOIN pets pt ON f.type = 'pet' AND f.target_id = pt.id
      WHERE f.user_id = ?
    `;
    const params = [userId];
    
    if (type) {
      query += ' AND f.type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY f.created_at DESC';
    
    const [favorites] = await db.execute(query, params);
    
    res.json({
      success: true,
      data: favorites
    });
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取收藏列表失败',
      error: error.message
    });
  }
});

app.post("/api/favorites", async (req, res) => {
  try {
    const { targetId, type } = req.body;
    
    // 验证用户是否已登录（简化版，实际应使用JWT验证）
    const userId = req.headers['x-user-id'] || 1; // 默认用户ID为1，实际应从token获取
    
    if (!targetId || !type) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }
    
    // 检查是否已经收藏过
    const [existingFavorite] = await db.execute(
      'SELECT id FROM favorites WHERE user_id = ? AND target_id = ? AND type = ?',
      [userId, targetId, type]
    );
    
    if (existingFavorite.length > 0) {
      return res.status(400).json({
        success: false,
        message: '已经收藏过了'
      });
    }
    
    // 插入收藏
    const [result] = await db.execute(
      'INSERT INTO favorites (user_id, target_id, type) VALUES (?, ?, ?)',
      [userId, targetId, type]
    );
    
    res.status(201).json({
      success: true,
      message: '收藏成功',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('添加收藏失败:', error);
    res.status(500).json({
      success: false,
      message: '添加收藏失败',
      error: error.message
    });
  }
});

app.delete("/api/favorites/:targetId/:type", async (req, res) => {
  try {
    const { targetId, type } = req.params;
    
    // 验证用户是否已登录（简化版，实际应使用JWT验证）
    const userId = req.headers['x-user-id'] || 1; // 默认用户ID为1，实际应从token获取
    
    const [result] = await db.execute(
      'DELETE FROM favorites WHERE user_id = ? AND target_id = ? AND type = ?',
      [userId, targetId, type]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '收藏不存在'
      });
    }
    
    res.json({
      success: true,
      message: '取消收藏成功'
    });
  } catch (error) {
    console.error('取消收藏失败:', error);
    res.status(500).json({
      success: false,
      message: '取消收藏失败',
      error: error.message
    });
  }
});

// 获取所有商品
app.get("/api/products", async (req, res) => {
  try {
    const { category, limit, offset } = req.query;
    
    let query = 'SELECT * FROM products WHERE status = "active"';
    const params = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC';
    
    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
      
      if (offset) {
        query += ' OFFSET ?';
        params.push(parseInt(offset));
      }
    }
    
    const [products] = await db.execute(query, params);
    
    // 转换字段名以匹配前端期望
    const formattedProducts = products.map(product => {
      return {
        ...product,
        image: product.image_url || product.image,
        sales: product.sales_count || product.sales
      };
    });
    
    res.json({
      success: true,
      data: formattedProducts,
      count: formattedProducts.length
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取商品列表失败',
      error: error.message
    });
  }
});

// 根据ID获取单个商品
app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const [products] = await db.execute(
      'SELECT * FROM products WHERE id = ? AND status = "active"',
      [id]
    );
    
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }
    
    res.json({
      success: true,
      data: products[0]
    });
  } catch (error) {
    console.error('获取商品详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取商品详情失败',
      error: error.message
    });
  }
});

// 检查并添加特定ID的商品
app.get('/api/ensure-specific-products', async (req, res) => {
  try {
    const targetIds = [3, 4, 5, 6, 7, 10];
    let successCount = 0;
    let failCount = 0;
    const results = [];
    
    // 检查并添加original_price和flash_sale_end_time字段
    await db.execute(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS flash_sale_end_time DATETIME NULL
    `);
    
    // 定义这些特定ID的商品
    const specificProducts = [
      {
        id: 3,
        name: '猫用智能猫砂盆',
        description: '自动清理，除臭抗菌',
        price: 1280.00,
        original_price: 1580.00,
        image: 'https://img.alicdn.com/imgextra/i4/2206682938687/O1CN01YrJQaM1Cf8zJQj5Yw_!!2206682938687.jpg',
        category: '猫砂盆',
        stock: 15,
        sales: 432,
        is_new: 1,
        is_hot: 1,
        is_flash_sale: 0
      },
      {
        id: 4,
        name: '宠物智能定位器',
        description: 'GPS定位，实时追踪',
        price: 268.00,
        original_price: 328.00,
        image: 'https://img.alicdn.com/imgextra/i2/2206682938687/O1CN01q7VvX81Cf8zK8n5rH_!!2206682938687.jpg',
        category: 'other',
        stock: 28,
        sales: 678,
        is_new: 0,
        is_hot: 1,
        is_flash_sale: 0
      },
      {
        id: 5,
        name: '宠物除臭喷雾',
        description: '天然植物提取，安全无害',
        price: 58.00,
        original_price: 78.00,
        image: 'https://img.alicdn.com/imgextra/i3/2206682938687/O1CN01Z9Xq5d1Cf8zJQj5Yx_!!2206682938687.jpg',
        category: '清洁',
        stock: 86,
        sales: 1234,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 1
      },
      {
        id: 6,
        name: '宠物指甲剪',
        description: '安全设计，静音修剪',
        price: 38.00,
        original_price: 48.00,
        image: 'https://img.alicdn.com/imgextra/i4/2206682938687/O1CN01q7VvX81Cf8zK8n5rH_!!2206682938687.jpg',
        category: '美容',
        stock: 120,
        sales: 890,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 0
      },
      {
        id: 7,
        name: '宠物磨牙棒',
        description: '天然材质，清洁牙齿',
        price: 28.00,
        original_price: 38.00,
        image: 'https://img.alicdn.com/imgextra/i2/2206682938687/O1CN01q7VvX81Cf8zK8n5rH_!!2206682938687.jpg',
        category: '零食',
        stock: 200,
        sales: 1567,
        is_new: 0,
        is_hot: 0,
        is_flash_sale: 1
      },
      {
        id: 10,
        name: '宠物洗护套装',
        description: '温和配方，深层清洁',
        price: 128.00,
        original_price: 168.00,
        image: 'https://img.alicdn.com/imgextra/i4/2206682938687/O1CN01q7VvX81Cf8zK8n5rH_!!2206682938687.jpg',
        category: '洗护',
        stock: 45,
        sales: 678,
        is_new: 1,
        is_hot: 0,
        is_flash_sale: 0
      }
    ];
    
    // 检查每个目标ID的商品是否存在
    for (const id of targetIds) {
      const [existing] = await db.execute('SELECT id FROM products WHERE id = ?', [id]);
      
      if (existing.length === 0) {
        // 商品不存在，添加它
        const product = specificProducts.find(p => p.id === id);
        if (product) {
          try {
            await db.execute(`
              INSERT INTO products (
                id, name, description, price, original_price, image_url, category, 
                stock, sales_count, status, is_new, is_hot, is_flash_sale
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              product.id, product.name, product.description, product.price, 
              product.original_price, product.image, product.category, 
              product.stock, product.sales, 'active',
              product.is_new, product.is_hot, product.is_flash_sale
            ]);
            
            successCount++;
            results.push(`成功添加商品 ID ${id}: ${product.name}`);
          } catch (err) {
            console.error(`添加商品 ID ${id} 失败:`, err);
            failCount++;
            results.push(`添加商品 ID ${id} 失败: ${err.message}`);
          }
        } else {
          failCount++;
          results.push(`未找到商品 ID ${id} 的定义`);
        }
      } else {
        results.push(`商品 ID ${id} 已存在`);
      }
    }
    
    res.json({
      success: true,
      message: '检查特定商品完成',
      successCount,
      failCount,
      results
    });
  } catch (error) {
    console.error('检查特定商品失败:', error);
    res.status(500).json({ 
      success: false,
      message: '检查特定商品失败', 
      error: error.message 
    });
  }
});

// ========== 启动服务器 ==========
async function startServer() {
  try {
    // 先连接数据库
    await connectDatabase();
    
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log("\n" + "=".repeat(60));
      console.log("🚀 宠物平台服务器启动成功！");
      console.log(`📡 后端端口：http://localhost:${PORT}`);
      console.log(`🔗 可访问地址：http://10.181.74.86:${PORT}`);
      console.log(`🌐 前端地址1：http://localhost:8080`);
      console.log(`🌐 前端地址2：http://10.181.74.86:8080`);
      console.log(`📊 数据库：${process.env.DB_NAME || 'pet_platform'}@${process.env.DB_HOST || 'localhost'}`);
      console.log("=".repeat(60) + "\n");
      
      console.log("📋 可用API：");
      console.log("  GET  /                           - 首页");
      console.log("  GET  /api/pets                   - 获取宠物列表");
      console.log("  GET  /api/init-pets              - 清空并重新创建宠物表");
      console.log("  GET  /api/init-30-pets           - 初始化30条宠物数据");
      console.log("  GET  /api/products               - 获取商品列表");
      console.log("  GET  /api/init-products          - 初始化商品数据");
      console.log("  GET  /api/service-types          - 获取服务类型列表");
      console.log("  GET  /api/init-service-types     - 初始化服务类型数据");
      console.log("  GET  /api/service-providers      - 获取服务人员列表");
      console.log("  GET  /api/init-service-providers - 初始化服务人员数据");
      console.log("  GET  /api/reviews                - 获取评价列表");
      console.log("  POST /api/reviews                - 创建评价");
      console.log("  GET  /api/favorites              - 获取用户收藏列表");
      console.log("  POST /api/favorites              - 添加到收藏");
      console.log("  DELETE /api/favorites/:targetId/:type - 从收藏中移除");
      console.log("  POST /api/login                  - 用户登录");
      console.log("  POST /api/register               - 用户注册");
      console.log("  GET  /api/profile                - 用户信息");
      console.log("  GET  /api/users                  - 查看所有用户");
      console.log("  GET  /health                     - 健康检查\n");
      
      console.log("🐾 使用方法：");
      console.log("  1. 访问 http://localhost:3000/api/pets 查看现有宠物");
      console.log("  2. 访问 http://localhost:3000/api/init-30-pets 初始化30条宠物数据");
      console.log("  3. 访问 http://localhost:3000/api/products 查看商品列表");
      console.log("  4. 访问 http://localhost:3000/api/init-products 初始化商品数据");
      console.log("  5. 访问 http://localhost:3000/api/service-types 查看服务类型");
      console.log("  6. 访问 http://localhost:3000/api/init-service-types 初始化服务类型数据");
      console.log("  7. 访问 http://localhost:3000/api/service-providers 查看服务人员");
      console.log("  8. 访问 http://localhost:3000/api/init-service-providers 初始化服务人员数据");
      console.log("  9. 访问 http://localhost:3000/api/reviews 查看评价列表");
      console.log(" 10. 访问 http://localhost:3000/api/favorites 查看收藏列表\n");
      
      console.log("🛠️  等待请求中...\n");
    });
    
    // 错误处理
    server.on("error", (err) => {
      console.error("❌ 服务器启动失败：", err.message);
      if (err.code === "EADDRINUSE") {
        console.log(`⚠️  端口 ${PORT} 已被占用，请尝试：`);
        console.log(`   1. 修改 .env 文件中的 PORT`);
        console.log(`   2. 停止占用端口的进程`);
      }
    });
    
  } catch (error) {
    console.error("❌ 服务器启动失败:", error.message);
    process.exit(1);
  }
}

process.on("uncaughtException", (err) => {
  console.error("❌ 未捕获的异常：", err);
});

// 添加一个简单的测试端点，用于验证预约API是否正常工作
app.get('/api/test-booking', (req, res) => {
  console.log('测试预约API端点被访问');
  res.json({
    success: true,
    message: '预约API测试成功',
    timestamp: new Date().toISOString(),
    server: 'pet-platform-backend'
  });
});

// 检查和修复购物车表结构
app.get('/api/fix-cart-table', async (req, res) => {
  try {
    // 检查表是否存在
    const [tables] = await db.execute("SHOW TABLES LIKE 'cart_items'");
    
    if (tables.length === 0) {
      // 表不存在，创建表
      await db.execute(`
        CREATE TABLE cart_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          product_id INT NOT NULL,
          quantity INT NOT NULL DEFAULT 1,
          selected BOOLEAN DEFAULT 1,
          added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          UNIQUE KEY unique_user_product (user_id, product_id)
        )
      `);
      
      return res.json({
        success: true,
        message: '购物车表创建成功'
      });
    }
    
    // 表存在，检查字段
    const [columns] = await db.execute("SHOW COLUMNS FROM cart_items");
    const columnNames = columns.map(col => col.Field);
    console.log('购物车表当前字段:', columnNames);
    
    // 获取当前数据
    const [currentData] = await db.execute("SELECT COUNT(*) as count FROM cart_items");
    const dataCount = currentData[0].count;
    
    let modifications = [];
    
    // 检查user_id字段
    if (!columnNames.includes('user_id')) {
      await db.execute("ALTER TABLE cart_items ADD COLUMN user_id INT NOT NULL DEFAULT 1");
      modifications.push('添加user_id字段');
    }
    
    // 检查selected字段
    if (!columnNames.includes('selected')) {
      await db.execute("ALTER TABLE cart_items ADD COLUMN selected BOOLEAN DEFAULT 1");
      modifications.push('添加selected字段');
    }
    
    // 检查added_at字段
    if (!columnNames.includes('added_at')) {
      await db.execute("ALTER TABLE cart_items ADD COLUMN added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
      modifications.push('添加added_at字段');
    }
    
    // 检查外键约束
    try {
      const [constraints] = await db.execute(`
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = 'cart_items' 
        AND CONSTRAINT_NAME != 'PRIMARY'
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `);
      
      if (constraints.length === 0) {
        await db.execute("ALTER TABLE cart_items ADD FOREIGN KEY (user_id) REFERENCES users(id)");
        modifications.push('添加外键约束');
      }
    } catch (error) {
      console.log('检查外键约束失败:', error.message);
    }
    
    res.json({
      success: true,
      message: modifications.length > 0 ? `购物车表已修复: ${modifications.join(', ')}` : '购物车表结构正常',
      modifications,
      currentColumns: columnNames,
      dataCount: dataCount
    });
  } catch (error) {
    console.error('修复购物车表失败:', error);
    res.status(500).json({
      success: false,
      message: '修复购物车表失败',
      error: error.message
    });
  }
});

// 检查数据库状态
app.get('/api/check-db-status', async (req, res) => {
  try {
    const tables = ['products', 'cart_items', 'users', 'orders', 'favorites'];
    const results = {};
    
    for (const table of tables) {
      try {
        const [count] = await db.execute(`SELECT COUNT(*) as count FROM ${table}`);
        results[table] = count[0].count;
      } catch (error) {
        results[table] = `错误: ${error.message}`;
      }
    }
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('检查数据库状态失败:', error);
    res.status(500).json({
      success: false,
      message: '检查数据库状态失败',
      error: error.message
    });
  }
});

// 修复购物车表结构
app.get('/api/fix-cart-table', async (req, res) => {
  try {
    // 检查表是否存在
    const [tables] = await db.execute("SHOW TABLES LIKE 'cart_items'");
    
    if (tables.length === 0) {
      // 表不存在，创建表
      await db.execute(`
        CREATE TABLE cart_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          product_id INT NOT NULL,
          quantity INT NOT NULL DEFAULT 1,
          selected BOOLEAN DEFAULT 1,
          added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          UNIQUE KEY unique_user_product (user_id, product_id)
        )
      `);
      
      return res.json({
        success: true,
        message: '购物车表创建成功'
      });
    }
    
    // 表存在，检查字段
    const [columns] = await db.execute("SHOW COLUMNS FROM cart_items");
    const columnNames = columns.map(col => col.Field);
    
    // 获取当前数据
    const [currentData] = await db.execute("SELECT COUNT(*) as count FROM cart_items");
    const dataCount = currentData[0].count;
    
    let modifications = [];
    
    // 检查user_id字段
    if (!columnNames.includes('user_id')) {
      await db.execute("ALTER TABLE cart_items ADD COLUMN user_id INT NOT NULL DEFAULT 1");
      modifications.push('添加user_id字段');
    }
    
    // 检查selected字段
    if (!columnNames.includes('selected')) {
      await db.execute("ALTER TABLE cart_items ADD COLUMN selected BOOLEAN DEFAULT 1");
      modifications.push('添加selected字段');
    }
    
    // 检查added_at字段
    if (!columnNames.includes('added_at')) {
      await db.execute("ALTER TABLE cart_items ADD COLUMN added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
      modifications.push('添加added_at字段');
    }
    
    // 检查外键约束
    try {
      const [constraints] = await db.execute(`
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = 'cart_items' 
        AND CONSTRAINT_NAME != 'PRIMARY'
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `);
      
      if (constraints.length === 0) {
        await db.execute("ALTER TABLE cart_items ADD FOREIGN KEY (user_id) REFERENCES users(id)");
        modifications.push('添加外键约束');
      }
    } catch (error) {
      console.log('检查外键约束失败:', error.message);
    }
    
    res.json({
      success: true,
      message: modifications.length > 0 ? `购物车表已修复: ${modifications.join(', ')}` : '购物车表结构正常',
      modifications,
      currentColumns: columnNames,
      dataCount: dataCount
    });
  } catch (error) {
    console.error('修复购物车表失败:', error);
    res.status(500).json({
      success: false,
      message: '修复购物车表失败',
      error: error.message
    });
  }
});

// 检查和修复购物车表结构
app.get('/api/fix-cart-table', async (req, res) => {
  try {
    // 检查表是否存在
    const [tables] = await db.execute("SHOW TABLES LIKE 'cart_items'");
    
    if (tables.length === 0) {
      // 表不存在，创建表
      await db.execute(`
        CREATE TABLE cart_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          product_id INT NOT NULL,
          quantity INT NOT NULL DEFAULT 1,
          selected BOOLEAN DEFAULT 1,
          added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          UNIQUE KEY unique_user_product (user_id, product_id)
        )
      `);
      
      return res.json({
        success: true,
        message: '购物车表创建成功'
      });
    }
    
    // 表存在，检查字段
    const [columns] = await db.execute("SHOW COLUMNS FROM cart_items");
    const columnNames = columns.map(col => col.Field);
    
    let modifications = [];
    
    // 检查user_id字段
    if (!columnNames.includes('user_id')) {
      await db.execute("ALTER TABLE cart_items ADD COLUMN user_id INT NOT NULL");
      modifications.push('添加user_id字段');
    }
    
    // 检查selected字段
    if (!columnNames.includes('selected')) {
      await db.execute("ALTER TABLE cart_items ADD COLUMN selected BOOLEAN DEFAULT 1");
      modifications.push('添加selected字段');
    }
    
    // 检查added_at字段
    if (!columnNames.includes('added_at')) {
      await db.execute("ALTER TABLE cart_items ADD COLUMN added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
      modifications.push('添加added_at字段');
    }
    
    // 检查外键约束
    try {
      const [constraints] = await db.execute(`
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = 'cart_items' 
        AND CONSTRAINT_NAME = 'cart_items_ibfk_1'
      `);
      
      if (constraints.length === 0) {
        await db.execute("ALTER TABLE cart_items ADD FOREIGN KEY (user_id) REFERENCES users(id)");
        modifications.push('添加外键约束');
      }
    } catch (error) {
      console.log('检查外键约束失败:', error.message);
    }
    
    res.json({
      success: true,
      message: modifications.length > 0 ? `购物车表已修复: ${modifications.join(', ')}` : '购物车表结构正常',
      modifications,
      currentColumns: columnNames
    });
  } catch (error) {
    console.error('修复购物车表失败:', error);
    res.status(500).json({
      success: false,
      message: '修复购物车表失败',
      error: error.message
    });
  }
});

// 重建购物车表
app.get('/api/rebuild-cart-table', async (req, res) => {
  try {
    // 删除现有表
    await db.execute("DROP TABLE IF EXISTS cart_items");
    
    // 创建新表
    await db.execute(`
      CREATE TABLE cart_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        selected BOOLEAN DEFAULT 1,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE KEY unique_user_product (user_id, product_id)
      )
    `);
    
    res.json({
      success: true,
      message: '购物车表重建成功'
    });
  } catch (error) {
    console.error('重建购物车表失败:', error);
    res.status(500).json({
      success: false,
      message: '重建购物车表失败',
      error: error.message
    });
  }
});

// 修复购物车表中的cart_id字段问题
app.get('/api/fix-cart-id-field', async (req, res) => {
  try {
    // 检查表是否存在
    const [tables] = await db.execute("SHOW TABLES LIKE 'cart_items'");
    
    if (tables.length === 0) {
      return res.status(404).json({
        success: false,
        message: '购物车表不存在'
      });
    }
    
    // 检查字段
    const [columns] = await db.execute("SHOW COLUMNS FROM cart_items");
    const columnNames = columns.map(col => col.Field);
    
    let modifications = [];
    
    // 如果存在cart_id字段，则删除它
    if (columnNames.includes('cart_id')) {
      await db.execute("ALTER TABLE cart_items DROP COLUMN cart_id");
      modifications.push('删除cart_id字段');
    }
    
    // 确保必要的字段存在
    if (!columnNames.includes('user_id')) {
      await db.execute("ALTER TABLE cart_items ADD COLUMN user_id INT NOT NULL DEFAULT 1");
      modifications.push('添加user_id字段');
    }
    
    if (!columnNames.includes('product_id')) {
      await db.execute("ALTER TABLE cart_items ADD COLUMN product_id INT NOT NULL DEFAULT 1");
      modifications.push('添加product_id字段');
    }
    
    if (!columnNames.includes('quantity')) {
      await db.execute("ALTER TABLE cart_items ADD COLUMN quantity INT NOT NULL DEFAULT 1");
      modifications.push('添加quantity字段');
    }
    
    if (!columnNames.includes('selected')) {
      await db.execute("ALTER TABLE cart_items ADD COLUMN selected BOOLEAN DEFAULT 1");
      modifications.push('添加selected字段');
    }
    
    if (!columnNames.includes('added_at')) {
      await db.execute("ALTER TABLE cart_items ADD COLUMN added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
      modifications.push('添加added_at字段');
    }
    
    res.json({
      success: true,
      message: modifications.length > 0 ? `购物车表已修复: ${modifications.join(', ')}` : '购物车表结构正常',
      modifications,
      currentColumns: columnNames
    });
  } catch (error) {
    console.error('修复购物车表cart_id字段失败:', error);
    res.status(500).json({
      success: false,
      message: '修复购物车表cart_id字段失败',
      error: error.message
    });
  }
});

// 检查购物车表结构
app.get('/api/check-cart-table', async (req, res) => {
  try {
    // 检查表是否存在
    const [tables] = await db.execute("SHOW TABLES LIKE 'cart_items'");
    
    if (tables.length === 0) {
      return res.json({
        success: true,
        message: '购物车表不存在',
        exists: false
      });
    }
    
    // 获取表结构
    const [columns] = await db.execute("SHOW COLUMNS FROM cart_items");
    const columnNames = columns.map(col => col.Field);
    
    res.json({
      success: true,
      message: '购物车表存在',
      exists: true,
      columns: columns,
      columnNames: columnNames
    });
  } catch (error) {
    console.error('检查购物车表结构失败:', error);
    res.status(500).json({
      success: false,
      message: '检查购物车表结构失败',
      error: error.message
    });
  }
});

// 重建购物车表
app.get('/api/rebuild-cart-table', async (req, res) => {
  try {
    // 删除现有表
    await db.execute("DROP TABLE IF EXISTS cart_items");
    
    // 创建新表
    await db.execute(`
      CREATE TABLE cart_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        selected BOOLEAN DEFAULT 1,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE KEY unique_user_product (user_id, product_id)
      )
    `);
    
    res.json({
      success: true,
      message: '购物车表重建成功'
    });
  } catch (error) {
    console.error('重建购物车表失败:', error);
    res.status(500).json({
      success: false,
      message: '重建购物车表失败',
      error: error.message
    });
  }
});

// 修复购物车表中的cart_id字段问题
app.get('/api/fix-cart-id-field', async (req, res) => {
  try {
    // 检查表是否存在
    const [tables] = await db.execute("SHOW TABLES LIKE 'cart_items'");
    
    if (tables.length === 0) {
      return res.status(404).json({
        success: false,
        message: '购物车表不存在'
      });
    }
    
    // 检查字段
    const [columns] = await db.execute("SHOW COLUMNS FROM cart_items");
    const columnNames = columns.map(col => col.Field);
    
    let modifications = [];
    
    // 如果存在cart_id字段，则删除它
    if (columnNames.includes('cart_id')) {
      await db.execute("ALTER TABLE cart_items DROP COLUMN cart_id");
      modifications.push('删除cart_id字段');
    }
    
    // 确保必要的字段存在
    if (!columnNames.includes('user_id')) {
      await db.execute("ALTER TABLE cart_items ADD COLUMN user_id INT NOT NULL DEFAULT 1");
      modifications.push('添加user_id字段');
    }
    
    if (!columnNames.includes('product_id')) {
      await db.execute("ALTER TABLE cart_items ADD COLUMN product_id INT NOT NULL DEFAULT 1");
      modifications.push('添加product_id字段');
    }
    
    if (!columnNames.includes('quantity')) {
      await db.execute("ALTER TABLE cart_items ADD COLUMN quantity INT NOT NULL DEFAULT 1");
      modifications.push('添加quantity字段');
    }
    
    if (!columnNames.includes('selected')) {
      await db.execute("ALTER TABLE cart_items ADD COLUMN selected BOOLEAN DEFAULT 1");
      modifications.push('添加selected字段');
    }
    
    if (!columnNames.includes('added_at')) {
      await db.execute("ALTER TABLE cart_items ADD COLUMN added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
      modifications.push('添加added_at字段');
    }
    
    res.json({
      success: true,
      message: modifications.length > 0 ? `购物车表已修复: ${modifications.join(', ')}` : '购物车表结构正常',
      modifications,
      currentColumns: columnNames
    });
  } catch (error) {
    console.error('修复购物车表cart_id字段失败:', error);
    res.status(500).json({
      success: false,
      message: '修复购物车表cart_id字段失败',
      error: error.message
    });
  }
});

// 检查购物车表结构
app.get('/api/check-cart-table', async (req, res) => {
  try {
    // 检查表是否存在
    const [tables] = await db.execute("SHOW TABLES LIKE 'cart_items'");
    
    if (tables.length === 0) {
      return res.json({
        success: true,
        message: '购物车表不存在',
        exists: false
      });
    }
    
    // 获取表结构
    const [columns] = await db.execute("SHOW COLUMNS FROM cart_items");
    const columnNames = columns.map(col => col.Field);
    
    res.json({
      success: true,
      message: '购物车表存在',
      exists: true,
      columns: columns,
      columnNames: columnNames
    });
  } catch (error) {
    console.error('检查购物车表结构失败:', error);
    res.status(500).json({
      success: false,
      message: '检查购物车表结构失败',
      error: error.message
    });
  }
});

// 更新商品图片
app.get('/api/update-product-images', async (req, res) => {
  try {
    console.log('开始更新商品图片...');
    
    // 商品图片映射
    const productImageMap = {
      '皇家狗粮 成犬粮': 'https://img.alicdn.com/imgextra/i1/2206682938687/O1CN01QqZ8v81Cf8zK8n5rF_!!2206682938687.jpg',
      '皇家猫粮 成猫粮': 'https://img.alicdn.com/imgextra/i3/2206682938687/O1CN01YrJQaM1Cf8zJQj5Yw_!!2206682938687.jpg',
      '宠物互动玩具 智能球': 'https://img.alicdn.com/imgextra/i2/2206682938687/O1CN01q7VvX81Cf8zK8n5rH_!!2206682938687.jpg',
      '宠物关节保健片': 'https://img.alicdn.com/imgextra/i4/2206682938687/O1CN01q7VvX81Cf8zK8n5rH_!!2206682938687.jpg',
      '宠物半封闭式窝': 'https://img.alicdn.com/imgextra/i1/2206682938687/O1CN01QqZ8v81Cf8zK8n5rF_!!2206682938687.jpg',
      '宠物香波 柔顺护毛': 'https://img.alicdn.com/imgextra/i3/2206682938687/O1CN01Z9Xq5d1Cf8zJQj5Yx_!!2206682938687.jpg'
    };
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const [productName, imageUrl] of Object.entries(productImageMap)) {
      console.log(`更新商品: ${productName}`);
      
      // 检查商品是否存在
      const [products] = await db.query(
        'SELECT id, name, image_url FROM products WHERE name = ?',
        [productName]
      );
      
      if (products.length === 0) {
        console.log(`商品 ${productName} 不存在，跳过`);
        skippedCount++;
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
        updatedCount++;
      } else {
        console.log(`❌ 更新商品 ${productName} 的图片URL失败`);
      }
      
      console.log('---');
    }
    
    console.log(`商品图片更新完成，成功更新 ${updatedCount} 个商品，跳过 ${skippedCount} 个商品`);
    
    // 验证更新结果
    console.log('\n验证更新结果:');
    const verificationResults = [];
    
    for (const productName of Object.keys(productImageMap)) {
      const [products] = await db.query(
        'SELECT name, image_url FROM products WHERE name = ?',
        [productName]
      );
      
      if (products.length > 0) {
        const product = products[0];
        console.log(`${product.name}: ${product.image_url}`);
        verificationResults.push({
          name: product.name,
          imageUrl: product.image_url
        });
      }
    }
    
    res.json({
      success: true,
      message: `商品图片更新完成，成功更新 ${updatedCount} 个商品，跳过 ${skippedCount} 个商品`,
      updatedCount,
      skippedCount,
      verificationResults
    });
    
  } catch (error) {
    console.error('更新商品图片失败:', error);
    res.status(500).json({
      success: false,
      message: '更新商品图片失败',
      error: error.message
    });
  }
});

// 启动服务器
startServer();