<template>
  <div class="checkout-page">
    <div class="container">
      <div class="page-header">
        <h1>订单结算</h1>
      </div>
      
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      
      <div v-else-if="!userStore.isLoggedIn" class="login-required">
        <div class="login-icon">🔐</div>
        <h2>请先登录</h2>
        <p>您需要登录后才能创建订单</p>
        <button @click="goToLogin" class="login-btn">去登录</button>
      </div>
      
      <div v-else-if="checkoutItems.length === 0" class="empty-checkout">
        <div class="empty-icon">🛒</div>
        <h2>没有选中的商品</h2>
        <p>请返回购物车选择要结算的商品</p>
        <button @click="goToCart" class="go-to-cart-btn">返回购物车</button>
      </div>
      
      <div v-else class="checkout-content">
        <div class="checkout-form">
          <div class="section">
            <h3>收货信息</h3>
            <div class="form-group">
              <label for="name">收货人</label>
              <input 
                type="text" 
                id="name" 
                v-model="orderForm.name" 
                placeholder="请输入收货人姓名"
                required
              >
            </div>
            
            <div class="form-group">
              <label for="phone">手机号码</label>
              <input 
                type="tel" 
                id="phone" 
                v-model="orderForm.phone" 
                placeholder="请输入手机号码"
                required
              >
            </div>
            
            <div class="form-group">
              <label for="address">收货地址</label>
              <textarea 
                id="address" 
                v-model="orderForm.address" 
                placeholder="请输入详细收货地址"
                rows="3"
                required
              ></textarea>
            </div>
            
            <div class="form-group">
              <label for="remark">订单备注</label>
              <textarea 
                id="remark" 
                v-model="orderForm.remark" 
                placeholder="选填，请输入订单备注信息"
                rows="2"
              ></textarea>
            </div>
          </div>
          
          <div class="section">
            <h3>支付方式</h3>
            <div class="payment-methods">
              <div 
                class="payment-method" 
                :class="{ active: orderForm.paymentMethod === method.value }"
                v-for="method in paymentMethods" 
                :key="method.value"
                @click="orderForm.paymentMethod = method.value"
              >
                <div class="method-icon">{{ method.icon }}</div>
                <div class="method-info">
                  <div class="method-name">{{ method.name }}</div>
                  <div class="method-desc">{{ method.description }}</div>
                </div>
                <div class="method-radio">
                  <input 
                    type="radio" 
                    :value="method.value" 
                    v-model="orderForm.paymentMethod"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="order-summary">
          <div class="section">
            <h3>订单商品</h3>
            <div class="order-items">
              <div class="order-item" v-for="item in checkoutItems" :key="item.id">
                <div class="item-image">
                  <img :src="item.image || '/images/product-placeholder.jpg'" :alt="item.name" @error="handleImageError">
                </div>
                <div class="item-info">
                  <h4>{{ item.name }}</h4>
                  <p class="item-description">{{ item.description || '暂无描述' }}</p>
                  <div class="item-price-quantity">
                    <span class="item-price">¥{{ item.price.toFixed(2) }}</span>
                    <span class="item-quantity">x {{ item.quantity }}</span>
                  </div>
                </div>
                <div class="item-subtotal">
                  ¥{{ (item.price * item.quantity).toFixed(2) }}
                </div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h3>费用明细</h3>
            <div class="cost-details">
              <div class="cost-item">
                <span>商品总价：</span>
                <span>¥{{ totalPrice.toFixed(2) }}</span>
              </div>
              <div class="cost-item">
                <span>运费：</span>
                <span>{{ shippingFee > 0 ? `¥${shippingFee.toFixed(2)}` : '免运费' }}</span>
              </div>
              <div class="cost-item discount" v-if="discountAmount > 0">
                <span>优惠金额：</span>
                <span>-¥{{ discountAmount.toFixed(2) }}</span>
              </div>
              <div class="cost-total">
                <span>应付金额：</span>
                <span class="total-amount">¥{{ finalAmount.toFixed(2) }}</span>
              </div>
            </div>
            
            <button 
              @click="submitOrder" 
              class="submit-order-btn"
              :disabled="submitting"
            >
              {{ submitting ? '提交中...' : '提交订单' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

export default {
  name: 'Checkout',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const checkoutItems = ref([])
    const loading = ref(false)
    const submitting = ref(false)
    
    // 订单表单
    const orderForm = ref({
      name: '',
      phone: '',
      address: '',
      remark: '',
      paymentMethod: 'alipay'
    })
    
    // 支付方式
    const paymentMethods = ref([
      {
        value: 'alipay',
        name: '支付宝',
        description: '使用支付宝安全支付',
        icon: '💰'
      },
      {
        value: 'wechat',
        name: '微信支付',
        description: '使用微信安全支付',
        icon: '💚'
      },
      {
        value: 'cod',
        name: '货到付款',
        description: '收到商品后再付款',
        icon: '📦'
      }
    ])
    
    // 计算属性
    const totalPrice = computed(() => {
      return checkoutItems.value.reduce((total, item) => total + (item.price * item.quantity), 0)
    })
    
    const shippingFee = computed(() => {
      // 满99元免运费
      return totalPrice.value >= 99 ? 0 : 10
    })
    
    const discountAmount = computed(() => {
      // 满200元减20元
      return totalPrice.value >= 200 ? 20 : 0
    })
    
    const finalAmount = computed(() => {
      return totalPrice.value + shippingFee.value - discountAmount.value
    })
    
    // 方法
    const loadCheckoutItems = () => {
      loading.value = true
      
      try {
        const savedItems = localStorage.getItem('checkoutItems')
        if (savedItems) {
          checkoutItems.value = JSON.parse(savedItems)
        } else {
          checkoutItems.value = []
        }
      } catch (error) {
        console.error('加载结算商品失败:', error)
        checkoutItems.value = []
      } finally {
        loading.value = false
      }
    }
    
    const validateForm = () => {
      if (!orderForm.value.name.trim()) {
        alert('请输入收货人姓名')
        return false
      }
      
      if (!orderForm.value.phone.trim()) {
        alert('请输入手机号码')
        return false
      }
      
      if (!/^1[3-9]\d{9}$/.test(orderForm.value.phone)) {
        alert('请输入正确的手机号码')
        return false
      }
      
      if (!orderForm.value.address.trim()) {
        alert('请输入收货地址')
        return false
      }
      
      return true
    }
    
    const submitOrder = async () => {
      if (!validateForm()) {
        return
      }
      
      submitting.value = true
      
      try {
        // 准备订单数据
        const orderData = {
          items: checkoutItems.value.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          shippingAddress: {
            name: orderForm.value.name,
            phone: orderForm.value.phone,
            address: orderForm.value.address
          },
          remark: orderForm.value.remark,
          paymentMethod: orderForm.value.paymentMethod,
          totalPrice: totalPrice.value,
          shippingFee: shippingFee.value,
          discountAmount: discountAmount.value,
          finalAmount: finalAmount.value
        }
        
        // 调用API创建订单
        const token = userStore.token
        
        const response = await fetch('/api/orders/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(orderData)
        })
        
        const data = await response.json()
        
        if (data.success) {
          // 清空结算商品
          localStorage.removeItem('checkoutItems')
          
          // 显示成功消息
          alert('订单创建成功！')
          
          // 跳转到订单详情页面
          router.push(`/orders/${data.data.id}`)
        } else {
          alert('订单创建失败: ' + (data.message || '未知错误'))
        }
      } catch (error) {
        console.error('提交订单失败:', error)
        alert('提交订单失败: ' + error.message)
      } finally {
        submitting.value = false
      }
    }
    
    const goToLogin = () => {
      router.push('/login')
    }
    
    const goToCart = () => {
      router.push('/cart')
    }
    
    const handleImageError = (event) => {
      // 当图片加载失败时，隐藏整个商品项
      const checkoutItem = event.target.closest('.order-item')
      if (checkoutItem) {
        checkoutItem.style.display = 'none'
      }
    }
    
    // 生命周期
    onMounted(() => {
      loadCheckoutItems()
    })
    
    return {
      userStore,
      checkoutItems,
      loading,
      submitting,
      orderForm,
      paymentMethods,
      totalPrice,
      shippingFee,
      discountAmount,
      finalAmount,
      submitOrder,
      goToLogin,
      goToCart,
      handleImageError
    }
  }
}
</script>

<style scoped>
.checkout-page {
  padding: 20px 0;
  min-height: calc(100vh - 60px);
  background-color: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.page-header {
  margin-bottom: 20px;
  text-align: center;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3B82F6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.login-required, .empty-checkout {
  text-align: center;
  padding: 60px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.login-icon, .empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.login-required h2, .empty-checkout h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.login-required p, .empty-checkout p {
  color: #666;
  margin-bottom: 20px;
}

.login-btn, .go-to-cart-btn {
  background-color: #3B82F6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.login-btn:hover, .go-to-cart-btn:hover {
  background-color: #2563EB;
}

.checkout-content {
  display: flex;
  gap: 20px;
}

.checkout-form {
  flex: 2;
}

.order-summary {
  flex: 1;
}

.section {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 20px;
}

.section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3B82F6;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.payment-method {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.payment-method:hover {
  border-color: #3B82F6;
}

.payment-method.active {
  border-color: #3B82F6;
  background-color: #f0f7ff;
}

.method-icon {
  font-size: 24px;
  margin-right: 15px;
}

.method-info {
  flex: 1;
}

.method-name {
  font-weight: 500;
  color: #333;
}

.method-desc {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.method-radio input {
  margin: 0;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-item {
  display: flex;
  gap: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.order-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
  color: #333;
}

.item-description {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-price-quantity {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.item-price {
  color: #3B82F6;
  font-weight: 500;
}

.item-quantity {
  color: #666;
}

.item-subtotal {
  font-weight: 500;
  color: #333;
  align-self: center;
}

.cost-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.cost-item.discount {
  color: #F56C6C;
}

.cost-total {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 600;
  padding-top: 10px;
  border-top: 1px solid #eee;
  margin-top: 10px;
}

.total-amount {
  color: #3B82F6;
  font-size: 18px;
}

.submit-order-btn {
  width: 100%;
  background-color: #3B82F6;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.3s;
  margin-top: 15px;
}

.submit-order-btn:hover {
  background-color: #2563EB;
}

.submit-order-btn:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

@media (max-width: 992px) {
  .checkout-content {
    flex-direction: column;
  }
}

@media (max-width: 576px) {
  .section {
    padding: 15px;
  }
  
  .payment-method {
    padding: 10px;
  }
  
  .method-icon {
    font-size: 20px;
    margin-right: 10px;
  }
  
  .order-item {
    gap: 10px;
  }
  
  .item-image {
    width: 50px;
    height: 50px;
  }
}
</style>