// 导入API基础配置
import { request } from './index';

// 购物车相关API
export const cartApi = {
  // 获取购物车内容
  getCart: () => {
    return request('/api/cart');
  },
  
  // 添加商品到购物车
  addToCart: (productId, quantity = 1) => {
    return request('/api/cart/add', {
      method: 'POST',
      body: JSON.stringify({
        productId,
        quantity
      })
    });
  },
  
  // 更新购物车商品数量
  updateCartItem: (productId, quantity) => {
    return request('/api/cart/update', {
      method: 'PUT',
      body: JSON.stringify({
        productId,
        quantity
      })
    });
  },
  
  // 从购物车移除商品
  removeFromCart: (productId) => {
    return request('/api/cart/remove', {
      method: 'DELETE',
      body: JSON.stringify({
        productId
      })
    });
  },
  
  // 清空购物车
  clearCart: () => {
    return request('/api/cart/clear', {
      method: 'DELETE'
    });
  },
  
  // 同步本地购物车到服务器
  syncCart: (localCartItems) => {
    return request('/api/cart/sync', {
      method: 'POST',
      body: JSON.stringify({
        items: localCartItems
      })
    });
  }
};

export default cartApi;