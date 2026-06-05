import { defineStore } from 'pinia'
import { cartApi } from '@/api'
import { useUserStore } from './user'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    totalItems: 0,
    totalPrice: 0,
    loading: false
  }),
  
  getters: {
    isLoggedIn() {
      const userStore = useUserStore()
      return userStore.isLoggedIn
    },
    
    isInCart: (state) => (productId) => {
      return state.items.some(item => item.product_id === productId)
    },
    
    getItemQuantity: (state) => (productId) => {
      const item = state.items.find(item => item.product_id === productId)
      return item ? item.quantity : 0
    }
  },
  actions: {
    async loadCart() {
      if (!this.isLoggedIn) {
        // 未登录用户，从本地存储加载购物车
        const localCart = localStorage.getItem('cart')
        if (localCart) {
          try {
            const cartData = JSON.parse(localCart)
            this.items = cartData.items || []
            this.totalItems = cartData.totalItems || 0
            this.totalPrice = cartData.totalPrice || 0
          } catch (error) {
            console.error('加载本地购物车失败:', error)
            this.clearCart()
          }
        }
        return
      }
      
      // 已登录用户，从服务器加载购物车
      try {
        this.loading = true
        const response = await cartApi.getCart()
        
        if (response.success) {
          this.items = response.data.items || []
          this.totalItems = response.data.totalItems || 0
          this.totalPrice = response.data.totalPrice || 0
        } else {
          console.error('获取购物车失败:', response.message)
        }
      } catch (error) {
        console.error('加载购物车失败:', error)
      } finally {
        this.loading = false
      }
    },
    
    async addToCart(productId, quantity = 1) {
      try {
        this.loading = true
        
        if (!this.isLoggedIn) {
          // 未登录用户，添加到本地存储
          const existingItemIndex = this.items.findIndex(item => item.product_id === productId)
          
          if (existingItemIndex !== -1) {
            this.items[existingItemIndex].quantity += quantity
          } else {
            this.items.push({ product_id: productId, quantity })
          }
          
          this.updateCartStats()
          this.saveCartToStorage()
          return { success: true }
        }
        
        // 已登录用户，调用API添加到服务器购物车
        const response = await cartApi.addToCart(productId, quantity)
        
        if (response.success) {
          await this.loadCart() // 重新加载购物车数据
        } else {
          throw new Error(response.message || '添加到购物车失败')
        }
        
        return response
      } catch (error) {
        console.error('添加到购物车失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateCartItem(productId, quantity) {
      try {
        this.loading = true
        
        if (!this.isLoggedIn) {
          // 未登录用户，更新本地存储
          const itemIndex = this.items.findIndex(item => item.product_id === productId)
          
          if (itemIndex !== -1) {
            if (quantity <= 0) {
              this.items.splice(itemIndex, 1)
            } else {
              this.items[itemIndex].quantity = quantity
            }
            
            this.updateCartStats()
            this.saveCartToStorage()
          }
          return { success: true }
        }
        
        // 已登录用户，调用API更新服务器购物车
        const response = await cartApi.updateCartItem(productId, quantity)
        
        if (response.success) {
          await this.loadCart() // 重新加载购物车数据
        } else {
          throw new Error(response.message || '更新购物车失败')
        }
        
        return response
      } catch (error) {
        console.error('更新购物车失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async removeFromCart(productId) {
      try {
        this.loading = true
        
        if (!this.isLoggedIn) {
          // 未登录用户，从本地存储移除
          this.items = this.items.filter(item => item.product_id !== productId)
          this.updateCartStats()
          this.saveCartToStorage()
          return { success: true }
        }
        
        // 已登录用户，调用API从服务器移除
        const response = await cartApi.removeFromCart(productId)
        
        if (response.success) {
          await this.loadCart() // 重新加载购物车数据
        } else {
          throw new Error(response.message || '移除购物车项失败')
        }
        
        return response
      } catch (error) {
        console.error('移除购物车项失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async clearCart() {
      try {
        this.loading = true
        
        if (!this.isLoggedIn) {
          // 未登录用户，清空本地存储
          this.items = []
          this.totalItems = 0
          this.totalPrice = 0
          this.saveCartToStorage()
          return { success: true }
        }
        
        // 已登录用户，调用API清空服务器购物车
        const response = await cartApi.clearCart()
        
        if (response.success) {
          this.items = []
          this.totalItems = 0
          this.totalPrice = 0
        } else {
          throw new Error(response.message || '清空购物车失败')
        }
        
        return response
      } catch (error) {
        console.error('清空购物车失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    updateCartStats() {
      this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0)
      // 注意：这里需要商品价格信息才能计算总价，暂时设为0
      // 实际应用中应该从商品数据中获取价格
      this.totalPrice = 0
    },
    
    saveCartToStorage() {
      if (!this.isLoggedIn) {
        const cartData = {
          items: this.items,
          totalItems: this.totalItems,
          totalPrice: this.totalPrice
        }
        localStorage.setItem('cart', JSON.stringify(cartData))
      }
    },
    
    // 同步本地购物车到服务器（用户登录后调用）
    async syncLocalCartToServer() {
      if (!this.isLoggedIn) return
      
      const localCart = localStorage.getItem('cart')
      if (!localCart) return
      
      try {
        const cartData = JSON.parse(localCart)
        if (cartData.items && cartData.items.length > 0) {
          await cartApi.syncCart(cartData.items)
          localStorage.removeItem('cart') // 同步成功后清除本地购物车
          await this.loadCart() // 重新加载服务器购物车
        }
      } catch (error) {
        console.error('同步本地购物车失败:', error)
      }
    }
  }
})