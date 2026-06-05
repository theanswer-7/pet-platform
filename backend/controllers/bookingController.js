const mysql = require('mysql2/promise');
require('dotenv').config();
const Booking = require('../models/Booking');

// 创建数据库连接
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
    
    console.log("✅ 预约控制器数据库连接成功");
    return db;
  } catch (error) {
    console.error("❌ 预约控制器数据库连接失败:", error.message);
    throw error;
  }
}

// 初始化数据库连接
connectDatabase();

// 创建预约表（如果不存在）
async function createBookingTable() {
  try {
    await connectDatabase();
    
    const createTableQuery = `
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
    `;
    
    await db.execute(createTableQuery);
    console.log("✅ 预约表创建或已存在");
  } catch (error) {
    console.error("❌ 创建预约表失败:", error.message);
    throw error;
  }
}

// 初始化表
createBookingTable();

// 创建预约
exports.createBooking = async (req, res) => {
  try {
    console.log('\n========== 创建预约请求 ==========');
    console.log('请求URL:', req.url);
    console.log('请求方法:', req.method);
    console.log('请求头:', req.headers);
    console.log('用户ID:', req.user?.id);
    console.log('用户信息:', req.user);
    console.log('预约数据:', req.body);
    
    // 确保用户ID存在
    if (!req.user || !req.user.id) {
      console.log('❌ 用户ID不存在');
      return res.status(401).json({
        success: false,
        message: '用户认证失败'
      });
    }
    
    const userId = req.user.id;
    const { 
      name, 
      phone, 
      address, 
      petType, 
      petInfo, 
      serviceType, 
      serviceDate, 
      serviceTime = 'morning', 
      specialRequests 
    } = req.body;
    
    console.log('解析的预约数据:', {
      userId,
      name,
      phone,
      address,
      petType,
      petInfo,
      serviceType,
      serviceDate,
      serviceTime,
      specialRequests
    });
    
    // 验证必填字段
    if (!name || !phone || !address || !petType || !serviceType || !serviceDate) {
      console.log('❌ 必填字段验证失败:', { name, phone, address, petType, serviceType, serviceDate });
      return res.status(400).json({
        success: false,
        message: '请填写所有必填字段'
      });
    }
    
    // 验证服务日期不能是过去的日期
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(serviceDate);
    
    if (selectedDate < today) {
      console.log('❌ 服务日期验证失败:', { selectedDate, today });
      return res.status(400).json({
        success: false,
        message: '服务日期不能是过去的日期'
      });
    }
    
    console.log('开始创建预约...');
    
    // 创建预约
    const bookingId = await Booking.create({
      userId,
      name,
      phone,
      address,
      petType,
      petInfo,
      serviceType,
      serviceDate,
      serviceTime,
      specialRequests
    });
    
    console.log('预约创建完成，ID:', bookingId);
    
    // 获取创建的预约详情
    const booking = await Booking.getById(bookingId);
    
    console.log('✅ 预约创建成功，ID:', bookingId);
    console.log('预约详情:', booking);
    console.log('========== 预约创建完成 ==========\n');
    
    res.status(201).json({
      success: true,
      message: '预约创建成功',
      data: booking
    });
  } catch (error) {
    console.error('❌ 创建预约失败:', error);
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      sql: error.sql,
      sqlMessage: error.sqlMessage
    });
    
    // 如果是数据库错误，返回更具体的错误信息
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        success: false,
        message: '用户不存在，请重新登录'
      });
    }
    
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 获取用户预约列表
exports.getUserBookings = async (req, res) => {
  try {
    console.log('\n========== 获取用户预约列表 ==========');
    
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    
    console.log('用户ID:', userId);
    console.log('查询参数:', { page, limit, status });
    
    const result = await Booking.getByUserId(userId, { 
      page: parseInt(page), 
      limit: parseInt(limit), 
      status 
    });
    
    console.log(`✅ 找到 ${result.bookings.length} 条预约记录`);
    console.log('========== 获取预约列表完成 ==========\n');
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ 获取用户预约列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 获取预约详情
exports.getBookingById = async (req, res) => {
  try {
    console.log('\n========== 获取预约详情 ==========');
    
    const userId = req.user.id;
    const { id } = req.params;
    
    console.log('用户ID:', userId);
    console.log('预约ID:', id);
    
    const booking = await Booking.getById(id, userId);
    
    if (!booking) {
      console.log('❌ 预约不存在或无权限访问');
      return res.status(404).json({
        success: false,
        message: '预约不存在或无权限访问'
      });
    }
    
    console.log('✅ 获取预约详情成功');
    console.log('========== 获取预约详情完成 ==========\n');
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('❌ 获取预约详情失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 取消预约
exports.cancelBooking = async (req, res) => {
  try {
    console.log('\n========== 取消预约 ==========');
    
    const userId = req.user.id;
    const { id } = req.params;
    const { cancelReason } = req.body;
    
    console.log('用户ID:', userId);
    console.log('预约ID:', id);
    console.log('取消原因:', cancelReason);
    
    // 检查预约是否存在
    const booking = await Booking.getById(id, userId);
    
    if (!booking) {
      console.log('❌ 预约不存在或无权限访问');
      return res.status(404).json({
        success: false,
        message: '预约不存在或无权限访问'
      });
    }
    
    // 检查预约状态是否可以取消
    if (booking.status !== 'pending') {
      console.log('❌ 预约状态不允许取消:', booking.status);
      return res.status(400).json({
        success: false,
        message: '只有待处理的预约才能取消'
      });
    }
    
    // 取消预约
    const updatedBooking = await Booking.cancel(id, cancelReason || '用户取消', userId);
    
    console.log('✅ 预约取消成功');
    console.log('========== 取消预约完成 ==========\n');
    
    res.json({
      success: true,
      message: '预约已取消',
      data: updatedBooking
    });
  } catch (error) {
    console.error('❌ 取消预约失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 管理员获取所有预约
exports.getAllBookings = async (req, res) => {
  try {
    console.log('\n========== 管理员获取所有预约 ==========');
    
    const { page = 1, limit = 10, status } = req.query;
    
    console.log('查询参数:', { page, limit, status });
    
    const result = await Booking.getAll({ 
      page: parseInt(page), 
      limit: parseInt(limit), 
      status 
    });
    
    console.log(`✅ 找到 ${result.bookings.length} 条预约记录`);
    console.log('========== 获取所有预约完成 ==========\n');
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ 获取所有预约失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 管理员更新预约状态
exports.updateBookingStatus = async (req, res) => {
  try {
    console.log('\n========== 管理员更新预约状态 ==========');
    
    const { id } = req.params;
    const { status } = req.body;
    
    console.log('预约ID:', id);
    console.log('新状态:', status);
    
    // 验证状态值
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      console.log('❌ 无效的状态值:', status);
      return res.status(400).json({
        success: false,
        message: '无效的状态值'
      });
    }
    
    // 检查预约是否存在
    const booking = await Booking.getById(id);
    
    if (!booking) {
      console.log('❌ 预约不存在');
      return res.status(404).json({
        success: false,
        message: '预约不存在'
      });
    }
    
    // 更新预约状态
    const updatedBooking = await Booking.updateStatus(id, status);
    
    console.log('✅ 预约状态更新成功');
    console.log('========== 更新预约状态完成 ==========\n');
    
    res.json({
      success: true,
      message: '预约状态已更新',
      data: updatedBooking
    });
  } catch (error) {
    console.error('❌ 更新预约状态失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};