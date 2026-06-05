const User = require("../models/User");
const jwt = require("jsonwebtoken");// 导入JWT库，用于生成和验证令牌

class AuthController {
    // 生成JWT token
    generateToken(userId) {
        return jwt.sign(
            { userId: userId },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
    }
    
    // 用户注册
    async register(req, res) {
        try {
            console.log("\n========== 注册请求开始 ==========");
            console.log("时间:", new Date().toLocaleTimeString());
            console.log("收到数据:", req.body);
            
            const { username, email, password } = req.body;
            
            // 验证字段
            if (!username || !email || !password) {
                console.log("❌ 缺少必填字段");
                return res.status(400).json({
                    success: false,
                    message: "请提供邮箱、密码和用户名"
                });
            }
            
            // 检查邮箱格式
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                console.log("❌ 邮箱格式无效:", email);
                return res.status(400).json({
                    success: false,
                    message: "邮箱格式不正确"
                });
            }
            
            // 检查密码长度
            if (password.length < 6) {
                console.log("❌ 密码太短");
                return res.status(400).json({
                    success: false,
                    message: "密码长度至少6位"
                });
            }
            
            // 1. 先检查邮箱是否已存在
            const results = await User.findByEmail(email);
            
            if (results.length > 0) {
                console.log("❌ 邮箱已存在");
                return res.status(409).json({
                    success: false,
                    message: "该邮箱已被注册"
                });
            }
            
            console.log("✅ 邮箱可用");
            
            // 2. 创建用户
            const userData = {
                name: username,
                email: email,
                password: password,
                role: "user"
            };
            
            const result = await User.create(userData);
            console.log("✅ 用户创建成功，ID:", result.insertId);
            
            // 3. 获取刚创建的用户信息
            const userResults = await User.findById(result.insertId);
            
            if (userResults.length === 0) {
                console.error("❌ 获取用户信息失败");
                return res.status(201).json({
                    success: true,
                    message: "注册成功",
                    data: {
                        userId: result.insertId,
                        email: email,
                        username: username
                    }
                });
            }
            
            const user = userResults[0];
            console.log("✅ 用户数据确认:", user);
            
            // 生成JWT token
            const token = this.generateToken(user.id);
            console.log("✅ 生成JWT token");
            
            console.log("========== 注册成功 ==========\n");
            
            res.status(201).json({
                success: true,
                message: "注册成功",
                data: {
                    userId: user.id,
                    email: user.email,
                    username: user.name,
                    role: user.role,
                    created_at: user.created_at,
                    token: token
                }
            });
        } catch (error) {
            console.error("❌ 注册过程出错:", error);
            res.status(500).json({
                success: false,
                message: "服务器内部错误"
            });
        }
    }
    
    // 用户登录
    async login(req, res) {
        try {
            console.log("\n========== 登录请求开始 ==========");
            console.log("登录尝试:", req.body.email);
            
            const { email, password } = req.body;
            
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: "请提供邮箱和密码"
                });
            }
            
            // 1. 查找用户
            const results = await User.findByEmail(email);
            
            if (results.length === 0) {
                console.log("❌ 用户不存在:", email);
                return res.status(401).json({
                    success: false,
                    message: "邮箱或密码错误"
                });
            }
            
            const user = results[0];
            console.log("✅ 找到用户:", user.name, "(ID:", user.id, ")");
            
            // 2. 验证密码（兼容旧密码）
            const isMatch = await User.verifyPassword(password, user.password);
            
            if (!isMatch) {
                console.log("❌ 密码错误");
                return res.status(401).json({
                    success: false,
                    message: "邮箱或密码错误"
                });
            }
            
            console.log("✅ 密码验证通过");
            
            // 如果密码是明文的，建议用户修改密码
            const shouldUpdatePassword = !user.password.startsWith("$2a$");
            if (shouldUpdatePassword) {
                console.log("⚠️  用户使用明文密码，建议更新");
            }
            
            // 生成JWT token
            const token = this.generateToken(user.id);
            console.log("✅ 生成JWT token");
            console.log("✅ 登录成功");
            console.log("========== 登录成功 ==========\n");
            
            res.json({
                success: true,
                message: "登录成功",
                data: {
                    userId: user.id,
                    email: user.email,
                    username: user.name,
                    role: user.role,
                    created_at: user.created_at,
                    token: token,
                    shouldUpdatePassword: shouldUpdatePassword
                }
            });
        } catch (error) {
            console.error("❌ 登录过程出错:", error);
            res.status(500).json({
                success: false,
                message: "服务器内部错误"
            });
        }
    }
    
    // 获取用户资料
    async getProfile(req, res) {
        try {
            // 确保从req.user或req.userId中获取用户ID
            const userId = req.user ? req.user.id : req.userId;
            
            console.log(`获取用户资料 - ID: ${userId}`);
            
            const results = await User.findById(userId);
            
            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "用户不存在"
                });
            }
            
            const user = results[0];
            res.json({
                success: true,
                data: {
                    userId: user.id,
                    email: user.email,
                    username: user.name,
                    role: user.role,
                    created_at: user.created_at
                }
            });
        } catch (error) {
            console.error("❌ 获取用户资料失败:", error);
            res.status(500).json({
                success: false,
                message: "获取用户资料失败"
            });
        }
    }
    
    // 更新用户资料
    async updateProfile(req, res) {
        try {
            // 确保从req.user或req.userId中获取用户ID
            const userId = req.user ? req.user.id : req.userId;
            const { username } = req.body;
            
            if (!username) {
                return res.status(400).json({
                    success: false,
                    message: "用户名不能为空"
                });
            }
            
            console.log(`更新用户资料 - ID: ${userId}, 新用户名: ${username}`);
            
            // 更新用户名
            await User.update(userId, { name: username });
            
            console.log("✅ 用户资料更新成功");
            
            // 获取更新后的用户信息
            const results = await User.findById(userId);
            
            if (results.length === 0) {
                return res.status(500).json({
                    success: false,
                    message: "获取更新后的用户信息失败"
                });
            }
            
            const user = results[0];
            res.json({
                success: true,
                message: "用户资料更新成功",
                data: {
                    userId: user.id,
                    email: user.email,
                    username: user.name,
                    role: user.role,
                    created_at: user.created_at
                }
            });
        } catch (error) {
            console.error("❌ 更新用户资料失败:", error);
            res.status(500).json({
                success: false,
                message: "更新用户资料失败"
            });
        }
    }
    
    // 获取所有用户
    getAllUsers(req, res) {
        User.getAll((err, results) => {
            if (err) {
                console.error("❌ 获取用户列表失败:", err);
                return res.status(500).json({
                    success: false,
                    message: "获取用户列表失败"
                });
            }
            
            res.json({
                success: true,
                count: results.length,
                data: results
            });
        });
    }
}

module.exports = new AuthController();