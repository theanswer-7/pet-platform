<template>
  <div class="orders-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">我的订单</h2>
      <div class="order-statistics">
        <span>共 {{ totalOrders }} 个订单</span>
        <span>待付款：{{ pendingCount }}</span>
        <span>待发货：{{ toShipCount }}</span>
      </div>
    </div>

    <!-- 订单筛选 -->
    <div class="order-filter">
      <div class="filter-tabs">
        <button 
          v-for="tab in filterTabs" 
          :key="tab.value"
          class="filter-tab"
          :class="{ active: activeFilter === tab.value }"
          @click="activeFilter = tab.value"
        >
          {{ tab.label }}
          <span v-if="tab.count" class="count-badge">{{ tab.count }}</span>
        </button>
      </div>
      
      <div class="search-filter">
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="搜索订单号或商品名称"
          class="search-input"
        >
        <button class="search-btn" @click="searchOrders">
          <i class="icon-search"></i>
        </button>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="orders-list" v-if="filteredOrders.length > 0">
      <div class="order-card" v-for="order in paginatedOrders" :key="order.id">
        <!-- 订单头部 -->
        <div class="order-header">
          <div class="order-info">
            <span class="order-time">{{ formatDate(order.created_at) }}</span>
            <span class="order-number">订单号：{{ order.order_number }}</span>
          </div>
          <div class="order-status">
            <span class="status-badge" :class="getStatusClass(order.status)">
              {{ getStatusText(order.status) }}
            </span>
          </div>
        </div>

        <!-- 订单商品 -->
        <div class="order-products">
          <div class="product-item" v-for="item in order.items" :key="item.id">
            <div class="product-image">
              <img :src="item.product_image" :alt="item.product_name" @error="handleImageError">
            </div>
            <div class="product-details">
              <h4 class="product-name">{{ item.product_name }}</h4>
              <p class="product-spec" v-if="item.specification">规格：{{ item.specification }}</p>
              <div class="product-price-quantity">
                <span class="product-price">¥{{ item.price }}</span>
                <span class="product-quantity">×{{ item.quantity }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 订单底部 -->
        <div class="order-footer">
          <div class="order-summary">
            <span>共 {{ getTotalQuantity(order) }} 件商品</span>
            <span class="total-amount">
              合计：<strong>¥{{ order.total_amount }}</strong>
            </span>
          </div>
          <div class="order-actions">
            <button 
              v-if="order.status === 'pending'" 
              class="btn btn-primary btn-sm"
              @click="payOrder(order.id)"
            >
              立即付款
            </button>
            <button 
              v-if="order.status === 'pending'" 
              class="btn btn-outline btn-sm"
              @click="cancelOrder(order.id)"
            >
              取消订单
            </button>
            <button 
              v-if="order.status === 'shipped'" 
              class="btn btn-primary btn-sm"
              @click="confirmReceipt(order.id)"
            >
              确认收货
            </button>
            <button 
              v-if="order.status === 'delivered'" 
              class="btn btn-outline btn-sm"
              @click="viewLogistics(order.id)"
            >
              查看物流
            </button>
            <button 
              class="btn btn-outline btn-sm"
              @click="viewOrderDetail(order.id)"
            >
              订单详情
            </button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          class="page-btn" 
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          上一页
        </button>
        <span class="page-info">
          第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
        </span>
        <button 
          class="page-btn" 
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <div class="empty-icon">
        <i class="icon-order"></i>
      </div>
      <p class="empty-text">暂无订单记录</p>
      <router-link to="/shop" class="btn btn-primary">
        去商城逛逛
      </router-link>
    </div>

    <!-- 订单详情弹窗 -->
    <OrderDetailModal 
      v-if="showDetailModal"
      :order-id="selectedOrderId"
      @close="showDetailModal = false"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { format } from 'date-fns'
import OrderDetailModal from '@/components/OrderDetailModal.vue'
import { ORDER_STATUS, ORDER_STATUS_TEXT, ORDER_STATUS_COLOR } from '@/utils/constants'

export default {
  name: 'Orders',
  components: {
    OrderDetailModal
  },
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    
    // 响应式数据
    const orders = ref([])
    const loading = ref(false)
    const activeFilter = ref('all')
    const searchKeyword = ref('')
    const currentPage = ref(1)
    const pageSize = ref(5)
    const showDetailModal = ref(false)
    const selectedOrderId = ref(null)

    // 筛选标签
    const filterTabs = computed(() => [
      { label: '全部', value: 'all', count: orders.value.length },
      { label: '待付款', value: 'pending', count: pendingCount.value },
      { label: '待发货', value: 'paid', count: toShipCount.value },
      { label: '待收货', value: 'shipped', count: shippedCount.value },
      { label: '已完成', value: 'delivered', count: deliveredCount.value }
    ])

    // 计算属性
    const totalOrders = computed(() => orders.value.length)
    const pendingCount = computed(() => orders.value.filter(o => o.status === ORDER_STATUS.PENDING).length)
    const toShipCount = computed(() => orders.value.filter(o => o.status === ORDER_STATUS.PAID).length)
    const shippedCount = computed(() => orders.value.filter(o => o.status === ORDER_STATUS.SHIPPED).length)
    const deliveredCount = computed(() => orders.value.filter(o => o.status === ORDER_STATUS.DELIVERED).length)

    // 筛选后的订单
    const filteredOrders = computed(() => {
      let filtered = orders.value

      // 状态筛选
      if (activeFilter.value !== 'all') {
        filtered = filtered.filter(order => order.status === activeFilter.value)
      }

      // 关键词搜索
      if (searchKeyword.value.trim()) {
        const keyword = searchKeyword.value.toLowerCase()
        filtered = filtered.filter(order => 
          order.order_number.toLowerCase().includes(keyword) ||
          order.items.some(item => 
            item.product_name.toLowerCase().includes(keyword)
          )
        )
      }

      // 按时间倒序排序
      return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    })

    // 分页后的订单
    const paginatedOrders = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredOrders.value.slice(start, end)
    })

    const totalPages = computed(() => 
      Math.ceil(filteredOrders.value.length / pageSize.value)
    )

    // 方法
    const fetchOrders = async () => {
      loading.value = true
      try {
        // 使用Pinia store获取用户ID
        const userId = userStore.userId
        
        if (!userId) {
          console.error('未找到用户ID，请先登录')
          // 可以跳转到登录页面
          router.push('/login')
          return
        }
        
        // 调用API获取订单数据
        // 实际开发中这里应该是真实的API调用
        const response = await fetch('/api/orders', {
          headers: {
            'Authorization': `Bearer ${userStore.token}`
          }
        })
        const data = await response.json()
        
        if (data.success) {
          // 根据后端返回的数据结构获取订单
          orders.value = data.data.orders || data.data || []
        } else {
          console.error('获取订单失败:', data.message)
        }
      } catch (error) {
        console.error('获取订单时出错:', error)
        // 开发模式下使用模拟数据
        if (process.env.NODE_ENV === 'development') {
          orders.value = getMockOrders()
        }
      } finally {
        loading.value = false
      }
    }

    // 模拟数据（开发用）
    const getMockOrders = () => {
      return [
        {
          id: 1,
          user_id: 13,
          order_number: 'DD202401010001',
          items: [
            {
              id: 1,
              product_id: 101,
              product_name: '优质宠物粮',
              product_image: 'https://example.com/pet-food.jpg',
              price: 158.00,
              quantity: 2,
              specification: '5kg装'
            },
            {
              id: 2,
              product_id: 102,
              product_name: '宠物玩具球',
              product_image: 'https://example.com/toy-ball.jpg',
              price: 35.00,
              quantity: 1
            }
          ],
          total_amount: 351.00,
          status: 'pending',
          created_at: '2024-01-01 10:30:00'
        },
        // ... 更多模拟订单
      ]
    }

    const formatDate = (dateString) => {
      try {
        return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss')
      } catch {
        return dateString
      }
    }

    const getStatusText = (status) => {
      return ORDER_STATUS_TEXT[status] || status
    }

    const getStatusClass = (status) => {
      return `status-${ORDER_STATUS_COLOR[status] || 'default'}`
    }

    const getTotalQuantity = (order) => {
      return order.items.reduce((sum, item) => sum + item.quantity, 0)
    }

    const payOrder = async (orderId) => {
      try {
        // 调用支付API
        const response = await fetch(`/api/orders/${orderId}/pay`, {
          method: 'POST'
        })
        const data = await response.json()
        
        if (data.success) {
          // 更新订单状态
          await fetchOrders()
          alert('支付成功！')
        } else {
          alert('支付失败：' + data.message)
        }
      } catch (error) {
        console.error('支付时出错:', error)
      }
    }

    const cancelOrder = async (orderId) => {
      if (!confirm('确定要取消订单吗？')) return

      try {
        const response = await fetch(`/api/orders/${orderId}/cancel`, {
          method: 'POST'
        })
        const data = await response.json()
        
        if (data.success) {
          await fetchOrders()
          alert('订单已取消')
        }
      } catch (error) {
        console.error('取消订单时出错:', error)
      }
    }

    const confirmReceipt = async (orderId) => {
      if (!confirm('确认收到商品吗？')) return

      try {
        const response = await fetch(`/api/orders/${orderId}/confirm`, {
          method: 'POST'
        })
        const data = await response.json()
        
        if (data.success) {
          await fetchOrders()
          alert('收货确认成功')
        }
      } catch (error) {
        console.error('确认收货时出错:', error)
      }
    }

    const viewLogistics = (orderId) => {
      router.push(`/orders/${orderId}/logistics`)
    }

    const viewOrderDetail = (orderId) => {
      selectedOrderId.value = orderId
      showDetailModal.value = true
    }

    const searchOrders = () => {
      currentPage.value = 1 // 搜索时重置到第一页
    }

    const handleImageError = (e) => {
      // 当图片加载失败时，隐藏整个订单项
      const orderItem = e.target.closest('.product-item')
      if (orderItem) {
        orderItem.style.display = 'none'
      }
    }

    // 生命周期
    onMounted(() => {
      // 初始化用户状态
      userStore.initFromStorage()
      // 获取订单数据
      fetchOrders()
    })

    // 监听筛选变化，重置页码
    watch([activeFilter, searchKeyword], () => {
      currentPage.value = 1
    })

    return {
      orders,
      loading,
      activeFilter,
      searchKeyword,
      currentPage,
      showDetailModal,
      selectedOrderId,
      filterTabs,
      totalOrders,
      pendingCount,
      toShipCount,
      shippedCount,
      deliveredCount,
      filteredOrders,
      paginatedOrders,
      totalPages,
      formatDate,
      getStatusText,
      getStatusClass,
      getTotalQuantity,
      payOrder,
      cancelOrder,
      confirmReceipt,
      viewLogistics,
      viewOrderDetail,
      searchOrders,
      handleImageError
    }
  }
}
</script>

<style scoped>
.orders-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.page-title {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.order-statistics {
  color: #666;
  font-size: 14px;
}

.order-statistics span {
  margin-left: 16px;
}

.order-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 8px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.filter-tab:hover {
  border-color: #409eff;
  color: #409eff;
}

.filter-tab.active {
  border-color: #409eff;
  background: #409eff;
  color: white;
}

.count-badge {
  margin-left: 4px;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  font-size: 12px;
}

.search-filter {
  display: flex;
  align-items: center;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-right: none;
  border-radius: 4px 0 0 4px;
  width: 200px;
}

.search-btn {
  padding: 8px 16px;
  border: 1px solid #dcdfe6;
  border-left: none;
  background: white;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fafafa;
  border-bottom: 1px solid #e8e8e8;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-time {
  color: #999;
  font-size: 12px;
}

.order-number {
  color: #666;
  font-size: 14px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-warning { background: #fff7e6; color: #fa8c16; }
.status-success { background: #f6ffed; color: #52c41a; }
.status-info { background: #e6f7ff; color: #1890ff; }
.status-primary { background: #f0f5ff; color: #2f54eb; }
.status-danger { background: #fff1f0; color: #f5222d; }

.order-products {
  padding: 16px;
}

.product-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.product-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-details {
  flex: 1;
}

.product-name {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #333;
}

.product-spec {
  margin: 0 0 8px 0;
  color: #999;
  font-size: 12px;
}

.product-price-quantity {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  color: #f56c6c;
  font-size: 16px;
  font-weight: bold;
}

.product-quantity {
  color: #666;
}

.order-footer {
  padding: 16px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.total-amount {
  font-size: 16px;
}

.total-amount strong {
  color: #f56c6c;
  font-size: 20px;
}

.order-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-primary {
  background: #409eff;
  color: white;
}

.btn-primary:hover {
  background: #66b1ff;
}

.btn-outline {
  background: white;
  border: 1px solid #dcdfe6;
  color: #606266;
}

.btn-outline:hover {
  border-color: #409eff;
  color: #409eff;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding: 16px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #dcdfe6;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 80px;
  color: #dcdfe6;
  margin-bottom: 20px;
}

.empty-text {
  color: #999;
  margin-bottom: 24px;
  font-size: 16px;
}

@media (max-width: 768px) {
  .orders-container {
    padding: 12px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .order-filter {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-tabs {
    overflow-x: auto;
    padding-bottom: 8px;
  }

  .search-input {
    width: 100%;
  }

  .order-footer {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .order-actions {
    justify-content: center;
  }
}
</style>