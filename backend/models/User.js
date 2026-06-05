const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
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
    console.log("✅ User模型数据库连接成功");
    return db;
  } catch (error) {
    console.error("❌ User模型数据库连接失败:", error.message);
    throw error;
  }
}

// 初始化连接
connectDatabase().catch(err => console.error('数据库初始化失败:', err));

class User {
  /**
   * 创建用户（带密码加密）
   * @param {Object} userData 用户数据
   * @returns {Promise<Object>} 创建结果
   */
  static async create(userData) {
    try {
      // 确保数据库连接
      await connectDatabase();
      
      // 加密密码
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(userData.password, salt);
      
      // 使用加密后的密码
      const userDataWithHash = {
        ...userData,
        password: hash
      };
      
      // 使用标准INSERT语法
      const fields = Object.keys(userDataWithHash).join(', ');
      const placeholders = Object.keys(userDataWithHash).map(() => '?').join(', ');
      const values = Object.values(userDataWithHash);
      
      const sql = `INSERT INTO users (${fields}) VALUES (${placeholders})`;
      const [result] = await db.execute(sql, values);
      return result;
    } catch (error) {
      console.error('创建用户失败:', error);
      throw error;
    }
  }
  
  /**
   * 通过邮箱查找用户
   * @param {string} email 邮箱
   * @returns {Promise<Array>} 用户数据
   */
  static async findByEmail(email) {
    try {
      await connectDatabase();
      
      const sql = 'SELECT * FROM users WHERE email = ?';
      const [results] = await db.execute(sql, [email]);
      return results;
    } catch (error) {
      console.error('通过邮箱查找用户失败:', error);
      throw error;
    }
  }
  
  /**
   * 通过ID查找用户
   * @param {number|string} id 用户ID
   * @returns {Promise<Array>} 用户数据（不含密码）
   */
  static async findById(id) {
    try {
      await connectDatabase();
      
      const sql = 'SELECT id, name, email, role, created_at FROM users WHERE id = ?';
      const [results] = await db.execute(sql, [id]);
      return results;
    } catch (error) {
      console.error('通过ID查找用户失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取所有用户
   * @returns {Promise<Array>} 用户列表（不含密码）
   */
  static async getAll() {
    try {
      await connectDatabase();
      
      const sql = 'SELECT id, name, email, role, created_at FROM users ORDER BY id DESC';
      const [results] = await db.execute(sql);
      return results;
    } catch (error) {
      console.error('获取所有用户失败:', error);
      throw error;
    }
  }
  
  /**
   * 验证密码（回调版本）
   * @param {string} inputPassword 输入的密码
   * @param {string} storedPassword 存储的密码（明文或加密）
   * @param {Function} callback 回调函数
   */
  static comparePassword(inputPassword, storedPassword, callback) {
    bcrypt.compare(inputPassword, storedPassword, callback);
  }
  
  /**
   * 兼容旧密码的验证方法（回调版）
   * @param {string} inputPassword 输入的密码
   * @param {string} storedPassword 存储的密码
   * @param {Function} callback 回调函数
   */
  static verifyPasswordCallback(inputPassword, storedPassword, callback) {
    // 检查是否为bcrypt加密的密码（支持$2a$、$2b$、$2y$）
    if (storedPassword.startsWith('$2a$') || 
        storedPassword.startsWith('$2b$') || 
        storedPassword.startsWith('$2y$')) {
      bcrypt.compare(inputPassword, storedPassword, callback);
    } else {
      // 旧密码（明文）直接比较
      callback(null, inputPassword === storedPassword);
    }
  }
  
  /**
   * 更新用户信息（不含密码）
   * @param {number|string} id 用户ID
   * @param {Object} userData 用户数据
   * @returns {Promise<Object>} 更新结果
   */
  static async update(id, userData) {
    try {
      console.log(`更新用户信息 - ID: ${id}, 数据:`, userData);
      
      // 确保数据库连接
      await connectDatabase();
      
      // 移除password字段，避免意外更新密码
      const { password, ...safeUserData } = userData;
      
      console.log(`安全数据:`, safeUserData);
      
      // 使用SET语法而不是对象语法，确保兼容性
      const fields = Object.keys(safeUserData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(safeUserData);
      
      const sql = `UPDATE users SET ${fields} WHERE id = ?`;
      console.log(`SQL: ${sql}`);
      console.log(`参数:`, [...values, id]);
      
      const [result] = await db.execute(sql, [...values, id]);
      console.log(`更新结果:`, result);
      
      return result;
    } catch (error) {
      console.error('更新用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 仅更新密码
   * @param {number|string} id 用户ID
   * @param {string} newPassword 新密码
   * @returns {Promise<Object>} 更新结果
   */
  static async updatePassword(id, newPassword) {
    try {
      await connectDatabase();
      
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newPassword, salt);
      
      const sql = 'UPDATE users SET password = ? WHERE id = ?';
      const [result] = await db.execute(sql, [hash, id]);
      return result;
    } catch (error) {
      console.error('更新密码失败:', error);
      throw error;
    }
  }

  /**
   * 改进的密码验证方法（异步版）
   * @param {string} inputPassword 输入的密码
   * @param {string} storedPassword 存储的密码
   * @returns {Promise<boolean>} 验证结果
   */
  static async verifyPassword(inputPassword, storedPassword) {
    // 检查是否为bcrypt加密的密码
    const isBcryptHash = storedPassword.startsWith('$2a$') || 
                         storedPassword.startsWith('$2b$') || 
                         storedPassword.startsWith('$2y$');
    
    if (isBcryptHash) {
      return await bcrypt.compare(inputPassword, storedPassword);
    } else {
      // 旧密码（明文）直接比较
      return inputPassword === storedPassword;
    }
  }
}

module.exports = User;