const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixCartTable() {
  try {
    // 连接数据库
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pet_platform'
    });

    console.log('✅ 数据库连接成功');

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
      
      console.log('✅ 购物车表创建成功');
      return;
    }
    
    // 表存在，检查字段
    const [columns] = await db.execute("SHOW COLUMNS FROM cart_items");
    const columnNames = columns.map(col => col.Field);
    console.log('购物车表当前字段:', columnNames);
    
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
    
    console.log(modifications.length > 0 ? `✅ 购物车表已修复: ${modifications.join(', ')}` : '✅ 购物车表结构正常');
    
    await db.end();
  } catch (error) {
    console.error('❌ 修复购物车表失败:', error);
  }
}

fixCartTable();const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixCartTable() {
  try {
    // 连接数据库
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pet_platform'
    });

    console.log('✅ 数据库连接成功');

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
      
      console.log('✅ 购物车表创建成功');
      return;
    }
    
    // 表存在，检查字段
    const [columns] = await db.execute("SHOW COLUMNS FROM cart_items");
    const columnNames = columns.map(col => col.Field);
    console.log('购物车表当前字段:', columnNames);
    
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
    
    console.log(modifications.length > 0 ? `✅ 购物车表已修复: ${modifications.join(', ')}` : '✅ 购物车表结构正常');
    
    await db.end();
  } catch (error) {
    console.error('❌ 修复购物车表失败:', error);
  }
}

fixCartTable();