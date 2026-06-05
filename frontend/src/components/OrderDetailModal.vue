<!-- src/components/OrderDetailModal.vue -->
<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>订单详情</h3>
        <button class="close-btn" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body" v-if="loading">
        <div class="loading">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
      
      <div class="modal-body" v-else-if="orderDetail">
        <!-- 订单基本信息 -->
        <div class="order-info-section">
          <h4>订单信息</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">订单号：</span>
              <span class="value">{{ orderDetail.order_number }}</span>
            </div>
            <div class="info-item">
              <span class="label">下单时间：</span>
              <span class="value">{{ formatDate(orderDetail.created_at) }}</span>
            </div>
            <div class="info-item">
              <span class="label">订单状态：</span>
              <span class="value status" :class="getStatusClass(orderDetail.order_status)">
                {{ getStatusText(orderDetail.order_status) }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">支付方式：</span>
              <span class="value">{{ getPaymentMethodText(orderDetail.payment_method) }}</span>
            </div>
            <div class="info-item">
              <span class="label">支付状态：</span>
              <span class="value payment-status" :class="getPaymentStatusClass(orderDetail.payment_status)">
                {{ getPaymentStatusText(orderDetail.payment_status) }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- 收货信息 -->
        <div class="shipping-info-section">
          <h4>收货信息</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">收货人：</span>
              <span class="value">{{ orderDetail.shipping_address_name }}</span>
            </div>
            <div class="info-item">
              <span class="label">联系电话：</span>
              <span class="value">{{ orderDetail.shipping_address_phone }}</span>
            </div>
            <div class="info-item full-width">
              <span class="label">收货地址：</span>
              <span class="value">
                {{ orderDetail.shipping_address_province }} 
                {{ orderDetail.shipping_address_city }} 
                {{ orderDetail.shipping_address_district }} 
                {{ orderDetail.shipping_address_detail }}
              </span>
            </div>
            <div class="info-item full-width" v-if="orderDetail.note">
              <span class="label">订单备注：</span>
              <span class="value">{{ orderDetail.note }}</span>
            </div>
          </div>
        </div>
        
        <!-- 商品列表 -->
        <div class="order-items-section">
          <h4>商品列表</h4>
          <div class="order-items">
            <div class="order-item" v-for="item in orderDetail.items" :key="item.id">
              <div class="item-image">
                <img :src="item.product_image" :alt="item.product_name" @error="handleImageError">
              </div>
              <div class="item-details">
                <h4 class="item-name">{{ item.product_name }}</h4>
                <div class="item-price-quantity">
                  <span class="item-price">¥{{ item.price }}</span>
                  <span class="item-quantity">×{{ item.quantity }}</span>
                </div>
              </div>
              <div class="item-subtotal">
                ¥{{ (item.price * item.quantity).toFixed(2) }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- 费用明细 -->
        <div class="cost-section">
          <h4>费用明细</h4>
          <div class="cost-details">
            <div class="cost-item">
              <span>商品总价：</span>
              <span>¥{{ orderDetail.total_amount }}</span>
            </div>
            <div class="cost-item">
              <span>运费：</span>
              <span>{{ orderDetail.shipping_fee > 0 ? `¥${orderDetail.shipping_fee}` : '免运费' }}</span>
            </div>
            <div class="cost-total">
              <span>订单总额：</span>
              <span class="total-amount">¥{{ orderDetail.final_amount }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-body" v-else>
        <div class="error-message">
          <p>加载订单详情失败</p>
        </div>
      </div>
      
      <div class="modal-footer" v-if="orderDetail">
        <button class="btn btn-outline" @click="$emit('close')">关闭</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { format } from 'date-fns'
import { ORDER_STATUS, ORDER_STATUS_TEXT, ORDER_STATUS_COLOR } from '@/utils/constants'

export default {
  name: 'OrderDetailModal',
  props: {
    orderId: {
      type: [String, Number],
      required: true
    }
  },
  emits: ['close'],
  setup(props) {
    const userStore = useUserStore()
    const loading = ref(false)
    const orderDetail = ref(null)
    
    // 获取订单详情
    const fetchOrderDetail = async () => {
      if (!props.orderId) return
      
      loading.value = true
      
      try {
        const response = await fetch(`/api/orders/${props.orderId}`, {
          headers: {
            'Authorization': `Bearer ${userStore.token}`
          }
        })
        
        const data = await response.json()
        
        if (data.success) {
          orderDetail.value = data.data
        } else {
          console.error('获取订单详情失败:', data.message)
          orderDetail.value = null
        }
      } catch (error) {
        console.error('获取订单详情时出错:', error)
        orderDetail.value = null
      } finally {
        loading.value = false
      }
    }
    
    // 格式化日期
    const formatDate = (dateString) => {
      try {
        return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss')
      } catch {
        return dateString
      }
    }
    
    // 获取状态文本
    const getStatusText = (status) => {
      return ORDER_STATUS_TEXT[status] || status
    }
    
    // 获取状态样式类
    const getStatusClass = (status) => {
      return `status-${ORDER_STATUS_COLOR[status] || 'default'}`
    }
    
    // 获取支付方式文本
    const getPaymentMethodText = (method) => {
      const methods = {
        'alipay': '支付宝',
        'wechat': '微信支付',
        'cod': '货到付款'
      }
      return methods[method] || method
    }
    
    // 获取支付状态文本
    const getPaymentStatusText = (status) => {
      const statuses = {
        'pending': '待支付',
        'paid': '已支付',
        'refunded': '已退款'
      }
      return statuses[status] || status
    }
    
    // 获取支付状态样式类
    const getPaymentStatusClass = (status) => {
      return `payment-status-${status}`
    }
    
    // 处理图片加载错误
    const handleImageError = (e) => {
      e.target.src = '/images/default-product.png'
    }
    
    // 监听orderId变化
    watch(() => props.orderId, () => {
      fetchOrderDetail()
    })
    
    // 组件挂载时获取订单详情
    onMounted(() => {
      fetchOrderDetail()
    })
    
    return {
      loading,
      orderDetail,
      formatDate,
      getStatusText,
      getStatusClass,
      getPaymentMethodText,
      getPaymentStatusText,
      getPaymentStatusClass,
      handleImageError
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #666;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3B82F6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  text-align: center;
  padding: 40px;
  color: #666;
}

.order-info-section,
.shipping-info-section,
.order-items-section,
.cost-section {
  margin-bottom: 24px;
}

.order-info-section h4,
.shipping-info-section h4,
.order-items-section h4,
.cost-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  display: flex;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.label {
  color: #666;
  min-width: 80px;
}

.value {
  color: #333;
  font-weight: 500;
}

.status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-pending {
  background-color: #fff7e6;
  color: #fa8c16;
}

.status-paid {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-shipped {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-delivered {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-cancelled {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.payment-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.payment-status-pending {
  background-color: #fff7e6;
  color: #fa8c16;
}

.payment-status-paid {
  background-color: #f6ffed;
  color: #52c41a;
}

.payment-status-refunded {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.order-items {
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
}

.order-item {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 60px;
  margin-right: 12px;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.item-details {
  flex: 1;
}

.item-name {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #333;
}

.item-price-quantity {
  display: flex;
  justify-content: space-between;
}

.item-price {
  color: #ff4d4f;
  font-weight: 500;
}

.item-quantity {
  color: #666;
}

.item-subtotal {
  margin-left: 12px;
  color: #333;
  font-weight: 500;
  width: 80px;
  text-align: right;
}

.cost-details {
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
}

.cost-item:last-child {
  border-bottom: none;
}

.cost-total {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background-color: #fafafa;
  font-weight: 500;
}

.total-amount {
  color: #ff4d4f;
  font-weight: 600;
  font-size: 16px;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: none;
}

.btn-outline {
  background-color: white;
  color: #333;
  border: 1px solid #d9d9d9;
}

.btn-outline:hover {
  color: #40a9ff;
  border-color: #40a9ff;
}
</style>