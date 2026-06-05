const mysql = require('mysql2/promise');
require('dotenv').config();

// 创建数据库连接
let db;

/**
 * 连接数据库
 * @returns {Promise<mysql.Connection>} 数据库连接实例
 */
async function connectDatabase() {
  try {
    if (db) return db; // 避免重复连接
    
    db = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "123456",
      database: process.env.DB_NAME || "pet_platform",
      port: process.env.DB_PORT || 3306
    });
    console.log("✅ 预约模型数据库连接成功");
    return db;
  } catch (error) {
    console.error("❌ 预约模型数据库连接失败:", error.message);
    throw error;
  }
}

// 初始化连接
connectDatabase().catch(err => console.error('数据库初始化失败:', err));

class Booking {
  /**
   * 创建预约
   * @param {Object} bookingData 预约数据
   * @returns {Promise<Object>} 创建结果
   */
  static async create(bookingData) {
    try {
      // 确保数据库连接
      await connectDatabase();
      
      // 生成预约编号
      const bookingNumber = this.generateBookingNumber();
      
      // 使用标准INSERT语法
      const fields = ['booking_number', 'user_id', 'name', 'phone', 'address', 
                     'pet_type', 'pet_info', 'service_type', 'service_date', 
                     'service_time', 'special_requests', 'status'];
      const placeholders = fields.map(() => '?').join(', ');
      const values = [
        bookingNumber,
        bookingData.userId,
        bookingData.name,
        bookingData.phone,
        bookingData.address,
        bookingData.petType,
        bookingData.petInfo || '',
        bookingData.serviceType,
        bookingData.serviceDate,
        bookingData.serviceTime || 'morning',
        bookingData.specialRequests || '',
        'pending' // 默认状态为待处理
      ];
      
      const sql = `INSERT INTO bookings (${fields.join(', ')}) VALUES (${placeholders})`;
      const [result] = await db.execute(sql, values);
      return result.insertId;
    } catch (error) {
      console.error('创建预约失败:', error);
      throw error;
    }
  }
  
  /**
   * 通过用户ID获取预约列表
   * @param {number|string} userId 用户ID
   * @param {Object} options 查询选项
   * @returns {Promise<Array>} 预约列表
   */
  static async getByUserId(userId, options = {}) {
    try {
      await connectDatabase();
      
      const { page = 1, limit = 10, status } = options;
      
      // 构建查询条件
      let whereClause = 'WHERE user_id = ?';
      let queryParams = [userId];
      
      if (status) {
        whereClause += ' AND status = ?';
        queryParams.push(status);
      }
      
      // 分页参数
      const offset = (page - 1) * limit;
      
      // 获取预约列表
      const sql = `
        SELECT * FROM bookings 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      const [bookings] = await db.execute(sql, [...queryParams, Number(limit), offset]);
      
      // 获取总数
      const countSql = `
        SELECT COUNT(*) as total 
        FROM bookings
        ${whereClause}
      `;
      
      const [countResult] = await db.execute(countSql, queryParams);
      const total = countResult[0].total;
      
      return {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalBookings: total
        }
      };
    } catch (error) {
      console.error('获取用户预约列表失败:', error);
      throw error;
    }
  }
  
  /**
   * 通过ID获取预约详情
   * @param {number|string} id 预约ID
   * @param {number|string} userId 用户ID（可选，用于验证权限）
   * @returns {Promise<Object>} 预约详情
   */
  static async getById(id, userId = null) {
    try {
      await connectDatabase();
      
      // 构建查询条件
      let whereClause = 'WHERE id = ?';
      let queryParams = [id];
      
      if (userId) {
        whereClause += ' AND user_id = ?';
        queryParams.push(userId);
      }
      
      const sql = `SELECT * FROM bookings ${whereClause}`;
      const [bookings] = await db.execute(sql, queryParams);
      
      if (bookings.length === 0) {
        return null;
      }
      
      return bookings[0];
    } catch (error) {
      console.error('获取预约详情失败:', error);
      throw error;
    }
  }
  
  /**
   * 更新预约状态
   * @param {number|string} id 预约ID
   * @param {string} status 新状态
   * @param {number|string} userId 用户ID（可选，用于验证权限）
   * @returns {Promise<Object>} 更新后的预约
   */
  static async updateStatus(id, status, userId = null) {
    try {
      await connectDatabase();
      
      // 构建查询条件
      let whereClause = 'WHERE id = ?';
      let queryParams = [id];
      
      if (userId) {
        whereClause += ' AND user_id = ?';
        queryParams.push(userId);
      }
      
      // 更新状态
      const updateSql = `
        UPDATE bookings 
        SET status = ?, updated_at = CURRENT_TIMESTAMP 
        ${whereClause}
      `;
      await db.execute(updateSql, [status, ...queryParams.slice(1)]);
      
      // 返回更新后的预约
      return await this.getById(id, userId);
    } catch (error) {
      console.error('更新预约状态失败:', error);
      throw error;
    }
  }
  
  /**
   * 取消预约
   * @param {number|string} id 预约ID
   * @param {string} cancelReason 取消原因
   * @param {number|string} userId 用户ID（可选，用于验证权限）
   * @returns {Promise<Object>} 更新后的预约
   */
  static async cancel(id, cancelReason, userId = null) {
    try {
      await connectDatabase();
      
      // 构建查询条件
      let whereClause = 'WHERE id = ?';
      let queryParams = [id];
      
      if (userId) {
        whereClause += ' AND user_id = ?';
        queryParams.push(userId);
      }
      
      // 更新预约状态和取消原因
      const updateSql = `
        UPDATE bookings 
        SET status = ?, cancel_reason = ?, cancelled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        ${whereClause}
      `;
      await db.execute(updateSql, ['cancelled', cancelReason, ...queryParams.slice(1)]);
      
      // 返回更新后的预约
      return await this.getById(id, userId);
    } catch (error) {
      console.error('取消预约失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取所有预约（管理员用）
   * @param {Object} options 查询选项
   * @returns {Promise<Object>} 预约列表和分页信息
   */
  static async getAll(options = {}) {
    try {
      await connectDatabase();
      
      const { page = 1, limit = 10, status } = options;
      
      // 构建查询条件
      let whereClause = '';
      let queryParams = [];
      
      if (status) {
        whereClause = 'WHERE status = ?';
        queryParams.push(status);
      }
      
      // 分页参数
      const offset = (page - 1) * limit;
      
      // 获取预约列表
      const sql = `
        SELECT * FROM bookings 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      const [bookings] = await db.execute(sql, [...queryParams, Number(limit), offset]);
      
      // 获取总数
      const countSql = `
        SELECT COUNT(*) as total 
        FROM bookings
        ${whereClause}
      `;
      
      const [countResult] = await db.execute(countSql, queryParams);
      const total = countResult[0].total;
      
      return {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalBookings: total
        }
      };
    } catch (error) {
      console.error('获取所有预约失败:', error);
      throw error;
    }
  }
  
  /**
   * 生成预约编号
   * @returns {string} 预约编号
   */
  static generateBookingNumber() {
    const date = new Date();
    const prefix = 'BK';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${year}${month}${day}${random}`;
  }
}

module.exports = Booking;