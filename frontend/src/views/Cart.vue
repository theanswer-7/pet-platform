

<template>
  <div class="cart-page">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">
          <i class="fas fa-shopping-cart"></i> 我的购物车
        </h1>
        <router-link to="/mall" class="continue-shopping">
          <i class="fas fa-arrow-left"></i> 继续购物
        </router-link>
      </div>

      <!-- 购物车为空 -->
      <div v-if="cartItems.length === 0" class="empty-cart">
        <div class="empty-icon">
          <i class="fas fa-shopping-basket"></i>
        </div>
        <h3>您的购物车是空的</h3>
        <p>快去商城挑选您喜欢的商品吧！</p>
        <router-link to="/mall" class="btn btn-primary">
          去商城逛逛
        </router-link>
      </div>

      <!-- 购物车有商品 -->
      <div v-else class="cart-content">
        <!-- 购物车头部 -->
        <div class="cart-header">
          <div class="select-all">
            <input 
              type="checkbox" 
              id="select-all" 
              v-model="selectAll"
              @change="toggleSelectAll"
            >
            <label for="select-all">全选</label>
          </div>
          <div class="header-item product-info">商品信息</div>
          <div class="header-item">单价</div>
          <div class="header-item">数量</div>
          <div class="header-item">小计</div>
          <div class="header-item">操作</div>
        </div>

        <!-- 购物车商品列表 -->
        <div class="cart-items">
          <div 
            v-for="item in cartItems" 
            :key="item.id" 
            class="cart-item"
            :class="{ selected: item.selected }"
          >
            <div class="item-select">
              <input 
                type="checkbox" 
                :id="`item-${item.id}`" 
                v-model="item.selected"
                @change="updateSelection"
              >
            </div>
            
            <div class="item-info">
              <div class="item-image">
                <img :src="item.image" :alt="item.name" @error="handleImageError($event, item)">
              </div>
              <div class="item-details">
                <h4 class="item-name">{{ item.name }}</h4>
                <p class="item-desc" v-if="item.description">{{ item.description }}</p>
                <div class="item-specs" v-if="item.specification">
                  规格：{{ item.specification }}
                </div>
              </div>
            </div>
            
            <div class="item-price">¥{{ parseFloat(item.price || 0).toFixed(2) }}</div>
            
            <div class="item-quantity">
              <div class="quantity-control">
                <button 
                  class="quantity-btn" 
                  @click="decreaseQuantity(item)"
                  :disabled="item.quantity <= 1"
                >
                  <i class="fas fa-minus"></i>
                </button>
                <input 
                  type="number" 
                  v-model.number="item.quantity" 
                  min="1" 
                  max="99"
                  @change="validateQuantity(item)"
                >
                <button 
                  class="quantity-btn" 
                  @click="increaseQuantity(item)"
                  :disabled="item.quantity >= item.stock"
                >
                  <i class="fas fa-plus"></i>
                </button>
              </div>
              <div class="stock-info" v-if="item.stock <= 10">
                仅剩 {{ item.stock }} 件
              </div>
            </div>
            
            <div class="item-subtotal">¥{{ (parseFloat(item.price || 0) * parseInt(item.quantity || 0)).toFixed(2) }}</div>
            
            <div class="item-actions">
              <button class="action-btn view-details-btn" @click="viewDetails(item)">
                查看详情
              </button>
              <button class="action-btn" @click="removeItem(item)">
                <i class="fas fa-trash"></i> 删除
              </button>
            </div>
          </div>
        </div>

        <!-- 购物车底部 -->
        <div class="cart-footer">
          <div class="footer-left">
            <div class="select-all-mobile">
              <input 
                type="checkbox" 
                id="select-all-mobile" 
                v-model="selectAll"
                @change="toggleSelectAll"
              >
              <label for="select-all-mobile">全选</label>
            </div>
            <button class="link-btn" @click="clearSelectedItems">
              <i class="fas fa-trash-alt"></i> 删除选中商品
            </button>
            <button class="link-btn" @click="clearCart">
              <i class="fas fa-trash"></i> 清空购物车
            </button>
          </div>
          
          <div class="footer-right">
            <div class="selected-info">
              已选择 <span>{{ selectedCount }}</span> 件商品
            </div>
            <div class="total-info">
              合计：<span class="total-amount">¥{{ (selectedTotal || 0).toFixed(2) }}</span>
            </div>
            <button 
              class="checkout-btn" 
              @click="checkout"
              :disabled="selectedCount === 0"
            >
              结算 ({{ selectedCount }})
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 确认删除弹窗 -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <h3>确认删除</h3>
        <p>确定要删除选中的商品吗？</p>
        <div class="modal-actions">
        <button class="btn btn-outline" @click="showDeleteModal = false">取消</button>
        <button class="btn btn-danger" @click="confirmDelete"><i class="fas fa-check"></i> 确认删除</button>
      </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { cartApi } from '@/api/cart'

export default {
  name: 'CartView',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    
    // 响应式数据
    const cartItems = ref([])
    const loading = ref(false)
    const showDeleteModal = ref(false)
    const deleteType = ref('') // 'single' 或 'selected'
    const itemToDelete = ref(null)
    
    // 计算属性
    const selectAll = computed({
      get() {
        return cartItems.value.length > 0 && cartItems.value.every(item => item.selected)
      },
      set(value) {
        cartItems.value.forEach(item => {
          item.selected = value
        })
      }
    })
    
    const selectedItems = computed(() => {
      return cartItems.value.filter(item => item.selected)
    })
    
    const selectedCount = computed(() => {
      return selectedItems.value.reduce((total, item) => total + item.quantity, 0)
    })
    
    const selectedTotal = computed(() => {
      if (!selectedItems.value || selectedItems.value.length === 0) {
        return 0
      }
      return selectedItems.value.reduce((total, item) => {
        const price = parseFloat(item.price) || 0
        const quantity = parseInt(item.quantity) || 0
        return total + (price * quantity)
      }, 0)
    })
    
    // 方法
    const loadCartData = async () => {
      loading.value = true
      
      try {
        // 初始化用户状态
        userStore.initFromStorage()
        
        if (userStore.isLoggedIn) {
          // 用户已登录，从服务器获取购物车数据
          try {
            const data = await cartApi.getCart()
            if (data.success) {
              cartItems.value = data.data.items.map(item => ({
                ...item,
                id: item.product_id,
                selected: item.selected || false,
                stock: item.stock || 99 // 确保有库存信息
              }))
              
              // 同步到本地存储作为备份
              localStorage.setItem('mall_cart', JSON.stringify(cartItems.value))
            } else {
              console.error('获取购物车数据失败:', data.message)
              // API失败时尝试使用本地缓存
              loadLocalCartData()
            }
          } catch (error) {
            console.error('获取购物车数据失败:', error)
            // API失败时尝试使用本地缓存
            loadLocalCartData()
          }
        } else {
          // 用户未登录，从本地存储获取购物车数据
          loadLocalCartData()
        }
      } catch (error) {
        console.error('加载购物车数据时出错:', error)
        // 如果API调用失败，尝试使用本地存储的数据
        loadLocalCartData()
      } finally {
        loading.value = false
      }
    }
    
    const loadLocalCartData = () => {
      const localCart = localStorage.getItem('mall_cart')
      if (localCart) {
        try {
          const cartData = JSON.parse(localCart)
          cartItems.value = cartData.map(item => ({
            ...item,
            selected: item.selected || false,
            stock: item.stock || 99 // 确保有库存信息
          }))
        } catch (e) {
          console.error('解析本地购物车数据失败:', e)
          cartItems.value = []
        }
      } else {
        cartItems.value = []
      }
    }
    
    const saveCartData = async () => {
      // 保存到本地存储作为备份
      localStorage.setItem('mall_cart', JSON.stringify(cartItems.value))
      
      // 如果用户已登录，同步到服务器
      if (userStore.isLoggedIn) {
        try {
          const items = cartItems.value.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            selected: item.selected
          }))
          
          const data = await cartApi.syncCart(items)
          if (!data.success) {
            console.error('同步购物车数据到服务器失败:', data.message)
          }
        } catch (error) {
          console.error('同步购物车数据到服务器失败:', error)
        }
      }
    }
    
    const toggleSelectAll = () => {
      // 这个方法由 v-model 处理
    }
    
    const updateSelection = () => {
      saveCartData()
    }
    
    const increaseQuantity = async (item) => {
      if (item.quantity < item.stock) {
        item.quantity++
        
        // 如果用户已登录，同步到服务器
        if (userStore.isLoggedIn) {
          try {
            await cartApi.updateCartItem(item.id, item.quantity)
          } catch (error) {
            console.error('更新商品数量失败:', error)
            // 回滚本地更改
            item.quantity--
            return
          }
        }
        
        // 保存到本地存储
        localStorage.setItem('mall_cart', JSON.stringify(cartItems.value))
      }
    }
    
    const decreaseQuantity = async (item) => {
      if (item.quantity > 1) {
        item.quantity--
        
        // 如果用户已登录，同步到服务器
        if (userStore.isLoggedIn) {
          try {
            await cartApi.updateCartItem(item.id, item.quantity)
          } catch (error) {
            console.error('更新商品数量失败:', error)
            // 回滚本地更改
            item.quantity++
            return
          }
        }
        
        // 保存到本地存储
        localStorage.setItem('mall_cart', JSON.stringify(cartItems.value))
      }
    }
    
    const validateQuantity = (item) => {
      if (isNaN(item.quantity) || item.quantity < 1) {
        item.quantity = 1
      } else if (item.quantity > item.stock) {
        item.quantity = item.stock
      }
      saveCartData()
    }
    
    const removeItem = (item) => {
      itemToDelete.value = item
      deleteType.value = 'single'
      showDeleteModal.value = true
    }
    
    const clearSelectedItems = () => {
      if (selectedItems.value.length === 0) {
        return
      }
      deleteType.value = 'selected'
      showDeleteModal.value = true
    }
    
    const clearCart = () => {
      if (cartItems.value.length === 0) {
        return
      }
      deleteType.value = 'all'
      showDeleteModal.value = true
    }
    
    const confirmDelete = async () => {
      if (userStore.isLoggedIn) {
        try {
          if (deleteType.value === 'single' && itemToDelete.value) {
            await cartApi.removeFromCart(itemToDelete.value.id)
            const index = cartItems.value.findIndex(item => item.id === itemToDelete.value.id)
            if (index !== -1) {
              cartItems.value.splice(index, 1)
            }
          } else if (deleteType.value === 'selected') {
            // 逐个删除选中的商品
            for (const item of selectedItems.value) {
              await cartApi.removeFromCart(item.id)
            }
            cartItems.value = cartItems.value.filter(item => !item.selected)
          } else if (deleteType.value === 'all') {
            await cartApi.clearCart()
            cartItems.value = []
          }
        } catch (error) {
          console.error('删除购物车商品失败:', error)
          // 如果API调用失败，仍然更新本地状态
          if (deleteType.value === 'single' && itemToDelete.value) {
            const index = cartItems.value.findIndex(item => item.id === itemToDelete.value.id)
            if (index !== -1) {
              cartItems.value.splice(index, 1)
            }
          } else if (deleteType.value === 'selected') {
            cartItems.value = cartItems.value.filter(item => !item.selected)
          } else if (deleteType.value === 'all') {
            cartItems.value = []
          }
        }
      } else {
        // 用户未登录，只更新本地状态
        if (deleteType.value === 'single' && itemToDelete.value) {
          const index = cartItems.value.findIndex(item => item.id === itemToDelete.value.id)
          if (index !== -1) {
            cartItems.value.splice(index, 1)
          }
        } else if (deleteType.value === 'selected') {
          cartItems.value = cartItems.value.filter(item => !item.selected)
        } else if (deleteType.value === 'all') {
          cartItems.value = []
        }
      }
      
      // 保存更新后的购物车到本地存储
      localStorage.setItem('mall_cart', JSON.stringify(cartItems.value))
      
      showDeleteModal.value = false
      itemToDelete.value = null
    }
    
    const checkout = () => {
      if (selectedCount.value === 0) {
        return
      }
      
      // 检查用户是否登录
      if (!userStore.isLoggedIn) {
        // 未登录，跳转到登录页面
        router.push({
          path: '/login',
          query: { redirect: '/cart' }
        })
        return
      }
      
      // 将选中的商品数据保存到临时存储，用于结算页面
      const checkoutData = selectedItems.value.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        specification: item.specification || ''
      }))
      
      sessionStorage.setItem('checkout_items', JSON.stringify(checkoutData))
      sessionStorage.setItem('checkout_total', selectedTotal.value.toString())
      
      // 跳转到结算页面或直接创建订单
      // 这里我们直接创建订单
      createOrder()
    }
    
    const createOrder = async () => {
      try {
        if (!userStore.isLoggedIn) {
          router.push({
            path: '/login',
            query: { redirect: '/cart' }
          })
          return
        }
        
        // 获取选中的商品
        const items = selectedItems.value.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
        
        // 创建订单的请求体
        const orderData = {
          items: items,
          shippingAddress: {
            name: userStore.user.name || '用户',
            phone: userStore.user.phone || '13800138000',
            province: '广东省',
            city: '深圳市',
            district: '南山区',
            detail: '详细地址'
          },
          paymentMethod: 'alipay',
          note: ''
        }
        
        // 发送创建订单的请求
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userStore.token}`
          },
          body: JSON.stringify(orderData)
        })
        
        const data = await response.json()
        
        if (data.success) {
          // 订单创建成功
          alert('订单创建成功！')
          
          // 从购物车中移除已购买的商品
          cartItems.value = cartItems.value.filter(item => !item.selected)
          
          // 保存更新后的购物车
          saveCartData()
          
          // 跳转到订单页面
          router.push('/orders')
        } else {
          alert('订单创建失败：' + (data.message || '未知错误'))
        }
      } catch (error) {
        console.error('创建订单时出错:', error)
        alert('创建订单时出错，请稍后再试')
      }
    }
    
    const handleImageError = (e, item) => {
      // 找到包含该图片的整个商品项并隐藏
      const cartItem = e.target.closest('.cart-item')
      if (cartItem) {
        cartItem.style.display = 'none'
      }
    }
    
    const viewDetails = (item) => {
      router.push(`/product/${item.id}`)
    }
    
    // 生命周期
    onMounted(() => {
      loadCartData()
    })
    
    return {
      cartItems,
      loading,
      showDeleteModal,
      deleteType,
      itemToDelete,
      selectAll,
      selectedItems,
      selectedCount,
      selectedTotal,
      toggleSelectAll,
      updateSelection,
      increaseQuantity,
      decreaseQuantity,
      validateQuantity,
      removeItem,
      clearSelectedItems,
      clearCart,
      confirmDelete,
      checkout,
      handleImageError,
      viewDetails
    }
  }
}
</script>

<style scoped>
.cart-page {
  padding: 20px 0;
  min-height: calc(100vh - 60px);
  background-color: #f8fafc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 页面标题 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-base);
  border-bottom: 1px solid var(--border-color-light);
}

.page-title {
  font-size: var(--font-size-2xl);
  color: #3b82f6;
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: var(--font-weight-semibold);
}

.continue-shopping {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: var(--transition-base);
}

.continue-shopping:hover {
  color: var(--color-primary-dark);
}

/* 空购物车 */
.empty-cart {
  text-align: center;
  padding: var(--spacing-4xl) 0;
  background: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color-light);
}

.empty-icon {
  font-size: var(--font-size-5xl);
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-lg);
}

.empty-cart h3 {
  font-size: var(--font-size-xl);
  color: #3b82f6;
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-weight-semibold);
}

.empty-cart p {
  color: #3b82f6;
  margin-bottom: var(--spacing-xl);
}

/* 购物车内容 */
.cart-content {
  background: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  border: 1px solid var(--border-color-light);
}

/* 购物车头部 */
.cart-header {
  display: grid;
  grid-template-columns: 50px 2fr 1fr 1fr 1fr 80px;
  align-items: center;
  padding: var(--spacing-base) var(--spacing-lg);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color-light);
  font-weight: var(--font-weight-medium);
  color: #3b82f6;
}

.select-all {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.header-item {
  text-align: center;
}

.product-info {
  text-align: left;
  padding-left: var(--spacing-lg);
}

/* 购物车商品 */
.cart-items {
  max-height: 500px;
  overflow-y: auto;
}

.cart-item {
  display: grid;
  grid-template-columns: 50px 2fr 1fr 1fr 1fr 80px;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color-light);
  transition: var(--transition-base);
}

.cart-item:hover {
  background: var(--bg-secondary);
}

.cart-item.selected {
  background: var(--color-primary-light);
}

.item-select {
  display: flex;
  justify-content: center;
}

.item-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
  padding-left: var(--spacing-lg);
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid var(--border-color-light);
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  line-height: 1.4;
}

.item-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-specs {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.item-price {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: #3b82f6;
  text-align: center;
}

.item-quantity {
  text-align: center;
}

.quantity-control {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
}

.quantity-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--border-color-light);
  background: var(--bg-primary);
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-base);
}

.quantity-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-control input {
  width: 50px;
  height: 28px;
  text-align: center;
  border: 1px solid var(--border-color-light);
  border-left: none;
  border-right: none;
  font-size: var(--font-size-sm);
  background: var(--bg-primary);
}

.stock-info {
  font-size: var(--font-size-xs);
  color: #3b82f6;
}

.item-subtotal {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: #3b82f6;
  text-align: center;
}

.item-actions {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  min-width: 80px;
  height: 36px;
  border: none;
  border-radius: var(--border-radius-sm);
  color: white;
  cursor: pointer;
  transition: var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  padding: 0 10px;
  gap: 5px;
}

.view-details-btn {
  background: #2196F3;
  box-shadow: 0 2px 4px rgba(33, 150, 243, 0.2);
}

.view-details-btn:hover {
  background: #0b7dda;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(33, 150, 243, 0.3);
}

.action-btn:not(.view-details-btn) {
  background: #ff4757;
  box-shadow: 0 2px 4px rgba(255, 71, 87, 0.2);
}

.action-btn:not(.view-details-btn):hover {
  background: #ff3838;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(255, 71, 87, 0.3);
}

/* 购物车底部 */
.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-base) var(--spacing-lg);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color-light);
}

.footer-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.select-all-mobile {
  display: none;
  align-items: center;
  gap: var(--spacing-sm);
}

.link-btn {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #ff4757;
  cursor: pointer;
  font-size: var(--font-size-sm);
  padding: 8px 12px;
  border-radius: 4px;
  transition: var(--transition-base);
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.link-btn:hover {
  background: #ff4757;
  color: white;
  border-color: #ff4757;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(255, 71, 87, 0.2);
}

.footer-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.selected-info {
  font-size: var(--font-size-sm);
  color: #3b82f6;
}

.selected-info span {
  font-weight: var(--font-weight-medium);
  color: #3b82f6;
}

.total-info {
  font-size: var(--font-size-base);
  color: #3b82f6;
}

.total-amount {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: #3b82f6;
}

.checkout-btn {
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--border-radius-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: var(--transition-base);
}

.checkout-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.checkout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 删除确认弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-xl);
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border-color-light);
}

.modal-content h3 {
  margin-bottom: var(--spacing-base);
  color: #3b82f6;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.modal-content p {
  margin-bottom: var(--spacing-xl);
  color: #3b82f6;
  font-size: var(--font-size-sm);
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: center;
}

.btn {
  padding: 10px 20px;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-base);
  border: none;
  min-width: 80px;
}

.btn-outline {
  background: var(--bg-primary);
  color: #6c757d;
  border: 2px solid #6c757d;
}

.btn-outline:hover {
  background: #6c757d;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(108, 117, 125, 0.2);
}

.btn-danger {
  background: #ff4757;
  color: var(--color-white);
  border: 2px solid #ff4757;
}

.btn-danger:hover {
  background: #ff3838;
  border-color: #ff3838;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(255, 71, 87, 0.2);
}

.btn-primary {
  background: #3b82f6;
  border: none;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cart-header {
    display: none;
  }
  
  .cart-item {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
    padding: var(--spacing-base);
  }
  
  .item-select {
    position: absolute;
    top: var(--spacing-base);
    left: var(--spacing-base);
  }
  
  .item-info {
    padding-left: calc(var(--spacing-base) * 2.5);
  }
  
  .item-price,
  .item-quantity,
  .item-subtotal {
    text-align: left;
  }
  
  .item-actions {
    position: absolute;
    top: var(--spacing-base);
    right: var(--spacing-base);
  }
  
  .cart-footer {
    flex-direction: column;
    gap: var(--spacing-base);
  }
  
  .footer-left {
    width: 100%;
    justify-content: space-between;
  }
  
  .select-all-mobile {
    display: flex;
  }
  
  .footer-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .checkout-btn {
    width: 100%;
  }
}
</style>