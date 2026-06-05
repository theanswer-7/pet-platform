// 修正后的 config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// 创建数据库连接池
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'pet_platform',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 测试连接
pool.getConnection().then(connection => {
    console.log('✅ 数据库连接成功');
    connection.release();
}).catch(err => {
    console.error('❌ 数据库连接失败:', err.message);
    console.log('💡 请检查:');
    console.log('   1. MySQL服务是否运行');
    console.log('   2. 数据库配置是否正确');
    process.exit(1);
});

module.exports = pool;