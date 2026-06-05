# 宠乐汇 - 宠物领养与用品商城平台

一个集宠物领养、用品商城、上门服务于一体的综合宠物服务平台。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Vue 3 + Vite |
| UI 组件库 | Element Plus |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| HTTP 客户端 | Axios |
| 后端框架 | Express |
| 数据库 | MySQL |
| 认证 | JWT + bcryptjs |

## 项目结构

```
├── frontend/                # Vue 3 前端
│   └── src/
│       ├── views/           # 页面组件（20+）
│       ├── router/          # 路由配置
│       ├── stores/          # Pinia 状态管理
│       ├── api/             # API 请求封装
│       └── components/      # 公共组件
├── backend/                 # Express 后端
│   ├── routes/              # API 路由
│   ├── controllers/         # 控制器
│   ├── models/              # 数据模型
│   ├── middleware/          # 中间件（认证、验证）
│   └── config/              # 数据库配置
└── *.sql                    # 数据库初始化脚本
```

## 功能模块

### 宠物领养
- 宠物目录浏览（猫/狗分类筛选）
- 宠物详情查看
- 在线领养申请
- 发布送养信息

### 用品商城
- 8 大商品分类：食品、玩具、保健、窝垫、服饰、清洁、出行、其他
- 限时抢购（倒计时）
- 商品搜索与筛选
- 商品收藏与对比
- 购物车管理
- 订单结算与支付

### 上门服务
- 宠物看护、遛狗、个性化定制
- 多种服务套餐选择
- 在线预约与取消

### 用户中心
- 注册 / 登录（JWT 认证）
- 个人资料管理
- 订单历史
- 收藏管理

## 快速开始

### 环境要求

- Node.js >= 16
- MySQL >= 5.7
- npm >= 8

### 1. 创建数据库

在 MySQL 中创建数据库：

```sql
CREATE DATABASE pet_platform DEFAULT CHARACTER SET utf8mb4;
```

### 2. 配置环境变量

编辑 `backend/.env`：

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=你的数据库密码
DB_NAME=pet_platform
JWT_SECRET=你的JWT密钥
```

### 3. 启动后端

```bash
cd backend
npm install
node server.js
```

后端运行在 http://localhost:3000

### 4. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端运行在 http://localhost:8080

### 5. 初始化数据

浏览器访问以下地址初始化示例数据：
- `http://localhost:3000/api/init-30-pets` — 初始化 30 只宠物
- `http://localhost:3000/api/init-products` — 初始化商城商品

## API 概览

| 模块 | 端点 | 说明 |
|------|------|------|
| 认证 | `POST /api/register` | 用户注册 |
| 认证 | `POST /api/login` | 用户登录 |
| 宠物 | `GET /api/pets` | 获取宠物列表 |
| 商品 | `GET /api/products` | 获取商品列表 |
| 商品 | `GET /api/products/search` | 搜索商品 |
| 商品 | `GET /api/products/flash-sale` | 限时抢购商品 |
| 购物车 | `GET/POST /api/cart` | 购物车管理 |
| 订单 | `GET/POST /api/orders` | 订单管理 |
| 预约 | `POST /api/bookings` | 创建服务预约 |

## 特性

- JWT 认证与角色管理（用户 / 管理员）
- 响应式设计，适配移动端、平板、桌面端
- 离线数据回退（后端不可用时使用本地数据）
- 购物车支持登录/未登录状态同步
- 商品评价与收藏系统
