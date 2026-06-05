const db = require('../config/database');

class Order {
  // 生成订单号
  static generateOrderNumber() {
    const date = new Date();
    const prefix = 'DD';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${year}${month}${day}${random}`;
  }
  
  // 创建订单
  static async create(orderData) {
    const {
      userId,
      items,
      totalAmount,
      shippingFee = 0,
      finalAmount,
      shippingAddress,
      paymentMethod = 'alipay',
      note
    } = orderData;
    
    const orderNumber = this.generateOrderNumber();
    
    // 开始事务
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
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
      for (const item of items) {
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
      
      // 提交事务
      await connection.commit();
      
      // 返回订单ID
      return orderId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  
  // 获取订单列表
  static async getByUserId(userId, options = {}) {
    const { page = 1, limit = 10, status } = options;
    
    // 构建查询条件
    let whereClause = 'WHERE o.user_id = ?';
    let queryParams = [userId];
    
    if (status) {
      whereClause += ' AND o.order_status = ?';
      queryParams.push(status);
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
    
    // 获取每个订单的商品
    for (const order of orders) {
      const [items] = await db.query(
        'SELECT * FROM order_items WHERE order_id = ?',
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
    
    return {
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total
      }
    };
  }
  
  // 获取订单详情
  static async getById(orderId, userId = null) {
    // 构建查询条件
    let whereClause = 'WHERE o.id = ?';
    let queryParams = [orderId];
    
    if (userId) {
      whereClause += ' AND o.user_id = ?';
      queryParams.push(userId);
    }
    
    // 获取订单基本信息
    const [orders] = await db.query(
      `SELECT 
        o.*,
        u.name as user_name,
        u.email as user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ${whereClause}`,
      queryParams
    );
    
    if (orders.length === 0) {
      return null;
    }
    
    const order = orders[0];
    
    // 获取订单商品
    const [items] = await db.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [orderId]
    );
    
    order.items = items;
    
    return order;
  }
  
  // 更新订单状态
  static async updateStatus(orderId, status, userId = null) {
    let whereClause = 'WHERE id = ?';
    let queryParams = [orderId];
    
    if (userId) {
      whereClause += ' AND user_id = ?';
      queryParams.push(userId);
    }
    
    await db.query(
      `UPDATE orders SET order_status = ? ${whereClause}`,
      [status, ...queryParams.slice(1)]
    );
    
    return await this.getById(orderId, userId);
  }
  
  // 取消订单
  static async cancel(orderId, cancelReason, userId = null) {
    // 开始事务
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // 构建查询条件
      let whereClause = 'WHERE id = ?';
      let queryParams = [orderId];
      
      if (userId) {
        whereClause += ' AND user_id = ?';
        queryParams.push(userId);
      }
      
      // 获取订单信息
      const [orders] = await connection.query(
        `SELECT * FROM orders ${whereClause}`,
        queryParams
      );
      
      if (orders.length === 0) {
        await connection.rollback();
        return null;
      }
      
      const order = orders[0];
      
      if (order.order_status !== 'pending') {
        await connection.rollback();
        throw new Error('只有待付款的订单才能取消');
      }
      
      // 更新订单状态
      await connection.query(
        `UPDATE orders SET order_status = ?, cancel_reason = ?, cancelled_at = NOW() ${whereClause}`,
        ['cancelled', cancelReason, ...queryParams.slice(1)]
      );
      
      // 获取订单商品并恢复库存
      const [items] = await connection.query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [orderId]
      );
      
      for (const item of items) {
        await connection.query(
          'UPDATE products SET stock = stock + ?, sales = sales - ? WHERE id = ?',
          [item.quantity, item.quantity, item.product_id]
        );
      }
      
      // 提交事务
      await connection.commit();
      
      return await this.getById(orderId, userId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  
  // 确认收货
  static async confirmDelivery(orderId, userId = null) {
    // 构建查询条件
    let whereClause = 'WHERE id = ?';
    let queryParams = [orderId];
    
    if (userId) {
      whereClause += ' AND user_id = ?';
      queryParams.push(userId);
    }
    
    // 获取订单信息
    const [orders] = await db.query(
      `SELECT * FROM orders ${whereClause}`,
      queryParams
    );
    
    if (orders.length === 0) {
      return null;
    }
    
    const order = orders[0];
    
    if (order.order_status !== 'shipped') {
      throw new Error('只有已发货的订单才能确认收货');
    }
    
    // 更新订单状态
    await db.query(
      `UPDATE orders SET order_status = ?, actual_delivery = NOW() ${whereClause}`,
      ['delivered', ...queryParams.slice(1)]
    );
    
    return await this.getById(orderId, userId);
  }
}

module.exports = Order;