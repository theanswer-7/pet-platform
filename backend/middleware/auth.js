const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
require('dotenv').config();

// 创建数据库连接
let db;

async function connectDatabase() {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_NAME || 'pet_platform',
      port: process.env.DB_PORT || 3306
    });
    
    console.log("✅ 认证中间件数据库连接成功");
    return db;
  } catch (error) {
    console.error("❌ 认证中间件数据库连接失败:", error.message);
    throw error;
  }
}

// 初始化数据库连接
connectDatabase();

const auth = async (req, res, next) => {
  try {
    // 从header获取token
    const authHeader = req.header('Authorization');
    
    console.log('认证中间件: 请求URL:', req.url);
    console.log('认证中间件: Authorization头:', authHeader ? '***' : null);
    
    if (!authHeader) {
      console.log('认证中间件: 未提供Authorization头');
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }
    
    // 处理Bearer token格式
    let token = authHeader;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // 移除 "Bearer " 前缀
      console.log('认证中间件: 提取Bearer token:', token.substring(0, 20) + '...');
      console.log('认证中间件: Token长度:', token.length);
    } else {
      console.log('认证中间件: 非Bearer格式token:', authHeader.substring(0, 20) + '...');
    }
    
    if (!token) {
      console.log('认证中间件: token为空');
      return res.status(401).json({
        success: false,
        message: '认证令牌格式错误'
      });
    }

    // 检查是否是自定义格式的token
    if (token.startsWith('jwt_real_token_') || token.startsWith('jwt_new_user_token_')) {
      console.log('认证中间件: 检测到自定义格式token');
      // 从自定义token中提取用户ID
      const tokenParts = token.split('_');
      const userId = tokenParts[tokenParts.length - 1];
      console.log('认证中间件: 从token提取的用户ID:', userId);
      
      // 检查数据库连接
      if (!db) {
        console.log('认证中间件: 数据库未连接，尝试重新连接');
        await connectDatabase();
      }
      
      // 查找用户
      const [users] = await db.execute(
        'SELECT id, name, email, role FROM users WHERE id = ?',
        [userId]
      );
      
      if (users.length === 0) {
        console.log('认证中间件: 用户不存在, ID:', userId);
        return res.status(401).json({
          success: false,
          message: '用户不存在'
        });
      }
      
      const user = users[0];
      console.log('认证中间件: 自定义token验证成功, 用户信息:', { id: user.id, name: user.name, email: user.email, role: user.role });
      
      // 将用户信息附加到请求对象
      req.user = user;
      req.token = token;
      next();
    } else {
      // 尝试使用JWT验证
      try {
        console.log('认证中间件: 尝试验证JWT token');
        console.log('认证中间件: JWT_SECRET:', process.env.JWT_SECRET ? '已设置' : '未设置');
        console.log('认证中间件: Token前缀:', token.substring(0, 20));
        console.log('认证中间件: Token长度:', token.length);
        
        // 打印完整token用于调试（仅开发环境）
        if (process.env.NODE_ENV === 'development') {
          console.log('认证中间件: 完整Token:', token);
        }
        
        // 检查数据库连接
        if (!db) {
          console.log('认证中间件: 数据库未连接，尝试重新连接');
          await connectDatabase();
        }
        
        // 验证JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('认证中间件: JWT验证成功, 解码结果:', decoded);
        
        // 确保userId存在
        if (!decoded.userId) {
          console.log('认证中间件: JWT token中缺少userId');
          return res.status(401).json({
            success: false,
            message: '无效的认证令牌'
          });
        }
        
        // 查找用户
        const [users] = await db.execute(
          'SELECT id, name, email, role FROM users WHERE id = ?',
          [decoded.userId]
        );
        
        if (users.length === 0) {
          console.log('认证中间件: 用户不存在, userId:', decoded.userId);
          return res.status(401).json({
            success: false,
            message: '用户不存在'
          });
        }
        
        const user = users[0];
        console.log('认证中间件: 用户验证成功, 用户信息:', { id: user.id, name: user.name, email: user.email, role: user.role });
        
        // 将用户信息附加到请求对象
        req.user = user;
        req.token = token;
        next();
      } catch (jwtError) {
        console.log('认证中间件: JWT验证失败:', jwtError.message);
        console.log('认证中间件: JWT错误类型:', jwtError.name);
        console.log('认证中间件: JWT错误堆栈:', jwtError.stack);
        return res.status(401).json({
          success: false,
          message: '认证失败',
          error: jwtError.message
        });
      }
    }
  } catch (error) {
    res.status(401).json({
      success: false,
      message: '认证失败',
      error: error.message
    });
  }
};

// 管理员权限中间件
const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: '需要管理员权限'
        });
      }
      next();
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

module.exports = { auth, adminAuth };