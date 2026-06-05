const mysql = require('mysql2/promise');
require('dotenv').config();

// 创建数据库连接
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'pet_platform',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 获取所有商品
exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      sortBy = 'created_at',
      sortOrder = 'desc',
      minPrice,
      maxPrice,
      search,
      isNew,
      isHot,
      isFlashSale
    } = req.query;

    // 构建WHERE条件
    let whereConditions = ['status = ?'];
    let queryParams = ['active'];
    
    if (category) {
      whereConditions.push('category = ?');
      queryParams.push(category);
    }
    
    if (minPrice) {
      whereConditions.push('price >= ?');
      queryParams.push(Number(minPrice));
    }
    
    if (maxPrice) {
      whereConditions.push('price <= ?');
      queryParams.push(Number(maxPrice));
    }
    
    if (isNew === 'true') {
      whereConditions.push('is_new = ?');
      queryParams.push(1);
    }
    
    if (isHot === 'true') {
      whereConditions.push('is_hot = ?');
      queryParams.push(1);
    }
    
    if (isFlashSale === 'true') {
      whereConditions.push('is_flash_sale = ? AND flash_sale_end > NOW()');
      queryParams.push(1);
    }
    
    // 搜索
    if (search) {
      whereConditions.push('(name LIKE ? OR description LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm);
    }

    // 构建ORDER BY
    const orderDirection = sortOrder === 'desc' ? 'DESC' : 'ASC';
    const orderByClause = `ORDER BY ${sortBy} ${orderDirection}`;

    // 计算偏移量
    const offset = (page - 1) * limit;

    // 执行查询
    const whereClause = whereConditions.join(' AND ');
    const query = `SELECT *, image_url as image, sales_count as sales FROM products WHERE ${whereClause} ${orderByClause} LIMIT ? OFFSET ?`;
    queryParams.push(Number(limit), offset);
    
    const [products] = await db.query(query, queryParams);
    
    // 确保价格是数字类型
    products.forEach(product => {
      if (product.price) {
        product.price = Number(product.price);
      }
      if (product.original_price) {
        product.original_price = Number(product.original_price);
      }
    });

    // 获取总数
    const countQuery = `SELECT COUNT(*) as total FROM products WHERE ${whereClause}`;
    const countParams = queryParams.slice(0, -2); // 移除limit和offset参数
    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalProducts: total
        }
      }
    });
  } catch (error) {
    console.error('获取商品失败:', error);
    res.status(500).json({
      success: false,
      message: '获取商品失败',
      error: error.message
    });
  }
};

// 获取单个商品
exports.getProductById = async (req, res) => {
  try {
    const [products] = await db.query('SELECT *, image_url as image, sales_count as sales FROM products WHERE id = ? AND status = ?', [req.params.id, 'active']);
    
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }

    const product = products[0];
    // 确保价格是数字类型
    if (product.price) {
      product.price = Number(product.price);
    }
    if (product.original_price) {
      product.original_price = Number(product.original_price);
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('获取商品详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取商品详情失败',
      error: error.message
    });
  }
};

// 获取限时抢购商品
exports.getFlashSaleProducts = async (req, res) => {
  try {
    const query = `
      SELECT *, image_url as image, sales_count as sales FROM products 
      WHERE is_flash_sale = 1 
        AND flash_sale_start <= NOW() 
        AND flash_sale_end >= NOW() 
        AND status = 'active'
      ORDER BY flash_sale_end ASC 
      LIMIT 10
    `;
    
    const [products] = await db.query(query);
    
    // 确保价格是数字类型
    products.forEach(product => {
      if (product.price) {
        product.price = Number(product.price);
      }
      if (product.original_price) {
        product.original_price = Number(product.original_price);
      }
    });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('获取限时抢购商品失败:', error);
    res.status(500).json({
      success: false,
      message: '获取限时抢购商品失败'
    });
  }
};

// 获取热门商品
exports.getHotProducts = async (req, res) => {
  try {
    const query = `
      SELECT *, image_url as image, sales_count as sales FROM products 
      WHERE is_hot = 1 
        AND status = 'active'
      ORDER BY sales DESC 
      LIMIT 10
    `;
    
    const [products] = await db.query(query);
    
    // 确保价格是数字类型
    products.forEach(product => {
      if (product.price) {
        product.price = Number(product.price);
      }
      if (product.original_price) {
        product.original_price = Number(product.original_price);
      }
    });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('获取热门商品失败:', error);
    res.status(500).json({
      success: false,
      message: '获取热门商品失败'
    });
  }
};

// 搜索商品
exports.searchProducts = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.json({
        success: true,
        data: []
      });
    }

    const searchTerm = `%${q}%`;
    const query = `
      SELECT *, 
        (CASE 
          WHEN name LIKE ? THEN 3
          WHEN description LIKE ? THEN 2
          WHEN category LIKE ? THEN 1
          ELSE 0
        END) as relevance_score
      FROM products 
      WHERE (name LIKE ? OR description LIKE ? OR category LIKE ?)
        AND status = 'active'
      ORDER BY relevance_score DESC, sales DESC
      LIMIT ?
    `;
    
    const [products] = await db.query(query, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, Number(limit)]);
    
    // 确保价格是数字类型
    products.forEach(product => {
      if (product.price) {
        product.price = Number(product.price);
      }
      if (product.original_price) {
        product.original_price = Number(product.original_price);
      }
    });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('搜索商品失败:', error);
    res.status(500).json({
      success: false,
      message: '搜索商品失败'
    });
  }
};