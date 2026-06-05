const jwt = require("jsonwebtoken");

// 认证中间件
const authenticate = (req, res, next) => {
  try {
    // 从请求头获取token
    const authHeader = req.headers.authorization;
    
    console.log("认证中间件 - 开始认证流程");
    console.log("认证中间件 - 请求头:", authHeader);
    console.log("认证中间件 - 请求路径:", req.path);
    
    if (!authHeader) {
      console.log("认证中间件 - 未提供认证令牌");
      return res.status(401).json({
        success: false,
        message: "未提供认证令牌"
      });
    }
    
    // 提取token (Bearer token 或直接token)
    const token = authHeader.startsWith("Bearer ") 
      ? authHeader.substring(7) 
      : authHeader;
    
    console.log("认证中间件 - 提取的token:", token.substring(0, 20) + "...");
    console.log("认证中间件 - token长度:", token.length);
    
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log("认证中间件 - 解码后的用户信息:", decoded);
    console.log("认证中间件 - 用户ID类型:", typeof decoded.userId);
    console.log("认证中间件 - 用户ID值:", decoded.userId);
    
    // 将用户信息添加到请求对象
    req.user = {
      id: decoded.userId
    };
    
    // 同时设置req.userId以确保兼容性
    req.userId = decoded.userId;
    
    console.log("认证中间件 - 设置req.user.id:", req.user.id);
    console.log("认证中间件 - 设置req.userId:", req.userId);
    console.log("认证中间件 - 认证成功，继续处理请求");
    
    next();
  } catch (error) {
    console.error("认证中间件 - 认证失败:", error);
    console.error("认证中间件 - 错误详情:", {
      name: error.name,
      message: error.message,
      expiredAt: error.expiredAt
    });
    return res.status(401).json({
      success: false,
      message: "无效的认证令牌"
    });
  }
};

module.exports = { authenticate };