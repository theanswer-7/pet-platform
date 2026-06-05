const mysql = require('mysql2/promise');
require('dotenv').config();

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
    
    console.log("✅ 订单控制器数据库连接成功");
    return db;
  } catch (error) {
    console.error("❌ 订单控制器数据库连接失败:", error.message);
    throw error;
  }
}

// 初始化数据库连接
connectDatabase();

// 创建订单
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      items, 
      shippingAddress, 
      paymentMethod = 'alipay',
      note = ''
    } = req.body;
    
    // 开始事务
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // 验证购物车商品
      let cartItems = [];
      
      if (!items) {
        // 如果没有提供商品列表，则使用购物车中的商品
        const [cartData] = await connection.query(
          `SELECT 
            ci.id as cart_item_id,
            ci.quantity,
            p.id as product_id,
            p.name,
            p.price,
            p.stock,
            p.image
          FROM cart_items ci
          JOIN products p ON ci.product_id = p.id
          WHERE ci.user_id = ? AND ci.selected = 1 AND p.status = 'active'`,
          [userId]
        );
        
        if (cartData.length === 0) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            message: '购物车为空或未选择商品，请先添加商品'
          });
        }
        
        cartItems = cartData;
      } else {
        // 使用提供的商品列表
        for (const item of items) {
          const [products] = await connection.query(
            'SELECT * FROM products WHERE id = ? AND status = ?',
            [item.productId, 'active']
          );
          
          if (products.length === 0) {
            await connection.rollback();
            return res.status(400).json({
              success: false,
              message: `商品ID ${item.productId} 不存在或已下架`
            });
          }
          
          const product = products[0];
          cartItems.push({
            cart_item_id: null,
            quantity: item.quantity,
            product_id: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            image: product.image
          });
        }
      }
      
      // 验证商品库存和计算总金额
      let totalAmount = 0;
      const orderItems = [];
      
      for (const cartItem of cartItems) {
        if (cartItem.stock < cartItem.quantity) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            message: `商品 ${cartItem.name} 库存不足，当前库存: ${cartItem.stock}`
          });
        }
        
        const itemTotal = cartItem.price * cartItem.quantity;
        totalAmount += itemTotal;
        
        orderItems.push({
          product_id: cartItem.product_id,
          product_name: cartItem.name,
          product_image: cartItem.image,
          price: cartItem.price,
          quantity: cartItem.quantity,
          total_price: itemTotal
        });
      }
      
      // 计算运费和最终金额
      const shippingFee = totalAmount >= 99 ? 0 : 10;
      const finalAmount = totalAmount + shippingFee;
      
      // 生成订单号
      const date = new Date();
      const prefix = 'DD';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const orderNumber = `${prefix}${year}${month}${day}${random}`;
      
      // 创建订单
      const [orderResult] = await connection.query(
        `INSERT INTO orders (
          order_number, user_id, total_amount, shipping_fee, final_amount,
          shipping_address_name, shipping_address_phone, shipping_address_province,
          shipping_address_city, shipping_address_district, shipping_address_detail,
          payment_method, payment_status, order_status, note
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderNumber, userId, totalAmount, shippingFee, finalAmount,
          shippingAddress.name, shippingAddress.phone, shippingAddress.province,
          shippingAddress.city, shippingAddress.district, shippingAddress.detail,
          paymentMethod, 'pending', 'pending', note
        ]
      );
      
      const orderId = orderResult.insertId;
      
      // 添加订单项
      for (const item of orderItems) {
        await connection.query(
          `INSERT INTO order_items (
            order_id, product_id, product_name, product_image, price, quantity, total_price
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [orderId, item.product_id, item.product_name, item.product_image, 
           item.price, item.quantity, item.total_price]
        );
        
        // 更新商品库存和销量
        await connection.query(
          'UPDATE products SET stock = stock - ?, sales = sales + ? WHERE id = ?',
          [item.quantity, item.quantity, item.product_id]
        );
      }
      
      // 如果是从购物车创建的订单，删除购物车中的已购买商品
      if (!items) {
        const cartItemIds = cartItems
          .filter(item => item.cart_item_id)
          .map(item => item.cart_item_id);
          
        if (cartItemIds.length > 0) {
          await connection.query(
            `DELETE FROM cart_items WHERE id IN (${cartItemIds.map(() => '?').join(',')})`,
            cartItemIds
          );
        }
      }
      
      // 提交事务
      await connection.commit();
      
      // 获取完整订单信息
      const [orderData] = await db.query(
        `SELECT o.*, u.name as user_name, u.email as user_email
         FROM orders o
         JOIN users u ON o.user_id = u.id
         WHERE o.id = ?`,
        [orderId]
      );
      
      const [orderItemsData] = await db.query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [orderId]
      );
      
      const order = {
        ...orderData[0],
        items: orderItemsData
      };
      
      res.status(201).json({
        success: true,
        message: '订单创建成功',
        data: order
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('创建订单失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '创建订单失败'
    });
  }
};

// 获取用户订单列表
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate
    } = req.query;
    
    // 构建查询条件
    let whereClause = 'WHERE o.user_id = ?';
    let queryParams = [userId];
    
    if (status) {
      whereClause += ' AND o.order_status = ?';
      queryParams.push(status);
    }
    
    if (startDate || endDate) {
      if (startDate) {
        whereClause += ' AND o.created_at >= ?';
        queryParams.push(new Date(startDate));
      }
      if (endDate) {
        whereClause += ' AND o.created_at <= ?';
        queryParams.push(new Date(endDate));
      }
    }
    
    // 分页参数
    const offset = (page - 1) * limit;
    
    // 获取订单列表
    const ordersQuery = `
      SELECT 
        o.*,
        u.name as user_name,
        u.email as user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [orders] = await db.query(ordersQuery, [...queryParams, Number(limit), offset]);
    
    // 获取每个订单的商品，包含商品详细信息
    for (const order of orders) {
      const [items] = await db.query(
        `SELECT 
          oi.*,
          p.name as product_name,
          p.image as product_image,
          p.description as product_description,
          p.category as product_category
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }
    
    // 获取总数
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM orders o
      ${whereClause}
    `;
    
    const [countResult] = await db.query(countQuery, queryParams);
    const total = countResult[0].total;
    
    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalOrders: total
        }
      }
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取订单列表失败'
    });
  }
};

// 获取订单详情
exports.getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    // 获取订单基本信息
    const [orders] = await db.query(
      `SELECT 
        o.*,
        u.name as user_name,
        u.email as user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ? AND (o.user_id = ? OR ? = 'admin')`,
      [id, userId, req.user.role]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }
    
    const order = orders[0];
    
    // 获取订单商品，包含商品详细信息
    const [items] = await db.query(
      `SELECT 
        oi.*,
        p.name as product_name,
        p.image as product_image,
        p.description as product_description,
        p.category as product_category
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?`,
      [id]
    );
    
    order.items = items;
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取订单详情失败'
    });
  }
};

// 取消订单
exports.cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { cancelReason } = req.body;
    
    // 开始事务
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // 获取订单信息
      const [orders] = await connection.query(
        'SELECT * FROM orders WHERE id = ? AND (user_id = ? OR ? = "admin")',
        [id, userId, req.user.role]
      );
      
      if (orders.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: '订单不存在'
        });
      }
      
      const order = orders[0];
      
      if (!['pending', 'confirmed'].includes(order.order_status)) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: '当前订单状态不可取消'
        });
      }
      
      // 更新订单状态
      await connection.query(
        'UPDATE orders SET order_status = ?, cancel_reason = ?, cancelled_at = NOW() WHERE id = ?',
        ['cancelled', cancelReason || '用户取消', id]
      );
      
      // 获取订单商品并恢复库存
      const [items] = await connection.query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [id]
      );
      
      for (const item of items) {
        await connection.query(
          'UPDATE products SET stock = stock + ?, sales = sales - ? WHERE id = ?',
          [item.quantity, item.quantity, item.product_id]
        );
      }
      
      // 提交事务
      await connection.commit();
      
      // 获取更新后的订单信息
      const [updatedOrders] = await db.query(
        'SELECT * FROM orders WHERE id = ?',
        [id]
      );
      
      const [updatedItems] = await db.query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [id]
      );
      
      const updatedOrder = {
        ...updatedOrders[0],
        items: updatedItems
      };
      
      res.json({
        success: true,
        message: '订单已取消',
        data: updatedOrder
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('取消订单失败:', error);
    res.status(500).json({
      success: false,
      message: '取消订单失败'
    });
  }
};

// 支付订单
exports.payOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    // 获取订单信息
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }
    
    const order = orders[0];
    
    // 检查订单状态是否可以支付
    if (order.order_status !== 'pending' || order.payment_status === 'paid') {
      return res.status(400).json({
        success: false,
        message: '订单已支付或不可支付'
      });
    }

    // 这里应该调用真实的支付接口
    // 模拟支付成功
    await db.query(
      'UPDATE orders SET payment_status = ?, paid_at = NOW(), order_status = ? WHERE id = ?',
      ['paid', 'confirmed', id]
    );
    
    // 获取更新后的订单信息
    const [updatedOrders] = await db.query(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );
    
    const [updatedItems] = await db.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [id]
    );
    
    const updatedOrder = {
      ...updatedOrders[0],
      items: updatedItems
    };

    res.json({
      success: true,
      message: '支付成功',
      data: updatedOrder
    });
  } catch (error) {
    console.error('支付失败:', error);
    res.status(500).json({
      success: false,
      message: '支付失败'
    });
  }
};

// 确认收货
exports.confirmReceipt = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    // 获取订单信息
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }
    
    const order = orders[0];
    
    if (order.order_status !== 'shipped') {
      return res.status(400).json({
        success: false,
        message: '订单未发货或已收货'
      });
    }
    
    // 更新订单状态
    await db.query(
      'UPDATE orders SET order_status = ?, delivered_at = NOW() WHERE id = ?',
      ['delivered', id]
    );
    
    // 获取更新后的订单信息
    const [updatedOrders] = await db.query(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );
    
    const [updatedItems] = await db.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [id]
    );
    
    const updatedOrder = {
      ...updatedOrders[0],
      items: updatedItems
    };
    
    res.json({
      success: true,
      message: '确认收货成功',
      data: updatedOrder
    });
  } catch (error) {
    console.error('确认收货失败:', error);
    res.status(500).json({
      success: false,
      message: '确认收货失败'
    });
  }
};