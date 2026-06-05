const db = require('../config/database');

class Cart {
  // 获取用户购物车
  static async getByUserId(userId) {
    const query = `
      SELECT 
        ci.id as cart_item_id,
        ci.quantity,
        ci.selected,
        ci.added_at,
        p.id as product_id,
        p.name,
        p.price,
        p.image,
        p.stock,
        p.status
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ? AND p.status = 'active'
      ORDER BY ci.added_at DESC
    `;
    
    const [items] = await db.query(query, [userId]);
    
    // 计算总数量和总金额
    let totalItems = 0;
    let totalAmount = 0;
    
    items.forEach(item => {
      totalItems += item.quantity;
      if (item.selected) {
        totalAmount += item.price * item.quantity;
      }
    });
    
    return {
      items,
      totalItems,
      totalAmount
    };
  }
  
  // 添加商品到购物车
  static async addItem(userId, productId, quantity = 1) {
    // 检查商品是否已在购物车中
    const [existingItems] = await db.query(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    
    if (existingItems.length > 0) {
      // 更新数量
      const newQuantity = existingItems[0].quantity + quantity;
      await db.query(
        'UPDATE cart_items SET quantity = ?, selected = 1 WHERE id = ?',
        [newQuantity, existingItems[0].id]
      );
    } else {
      // 添加新商品
      await db.query(
        'INSERT INTO cart_items (user_id, product_id, quantity, selected) VALUES (?, ?, ?, 1)',
        [userId, productId, quantity]
      );
    }
    
    return await this.getByUserId(userId);
  }
  
  // 更新购物车商品数量
  static async updateItem(userId, itemId, quantity) {
    await db.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, itemId, userId]
    );
    
    return await this.getByUserId(userId);
  }
  
  // 删除购物车商品
  static async removeItem(userId, itemId) {
    await db.query(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [itemId, userId]
    );
    
    return await this.getByUserId(userId);
  }
  
  // 清空购物车
  static async clear(userId) {
    await db.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
  }
  
  // 选择/取消选择商品
  static async toggleItemSelection(userId, itemId, selected) {
    await db.query(
      'UPDATE cart_items SET selected = ? WHERE id = ? AND user_id = ?',
      [selected, itemId, userId]
    );
    
    return await this.getByUserId(userId);
  }
  
  // 选择所有商品
  static async selectAllItems(userId) {
    await db.query(
      'UPDATE cart_items SET selected = 1 WHERE user_id = ?',
      [userId]
    );
    
    return await this.getByUserId(userId);
  }
  
  // 取消选择所有商品
  static async deselectAllItems(userId) {
    await db.query(
      'UPDATE cart_items SET selected = 0 WHERE user_id = ?',
      [userId]
    );
    
    return await this.getByUserId(userId);
  }
}

module.exports = Cart;