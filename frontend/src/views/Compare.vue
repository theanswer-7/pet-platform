<template>
  <div class="compare-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">商品对比</h1>
        <router-link to="/mall" class="back-to-mall">
          <i class="fas fa-arrow-left"></i> 返回商城
        </router-link>
      </div>
      
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p>正在加载商品数据...</p>
        </div>
      </div>
      
      <div v-else-if="compareProducts.length < 2" class="empty-compare">
        <i class="fas fa-balance-scale"></i>
        <h3>对比商品不足</h3>
        <p>请至少选择2个商品进行对比</p>
        <router-link to="/mall" class="btn btn-primary">
          去商城选择商品
        </router-link>
      </div>
      
      <div v-else class="compare-container">
        <div class="compare-table-wrapper">
          <table class="compare-table">
            <tbody>
              <!-- 商品基本信息行 -->
              <tr class="product-row">
              <th class="attribute-col">商品</th>
              <td v-for="product in compareProducts" :key="product.id" class="product-col">
                <div class="product-card">
                  <div class="product-image">
                    <img :src="product.image" :alt="product.name">
                  </div>
                  <h4 class="product-name">{{ product.name }}</h4>
                  <div class="product-price">¥{{ product.price }}</div>
                  <div class="product-actions">
                    <button class="btn btn-primary" @click="addToCart(product)">
                      加入购物车
                    </button>
                    <button class="btn btn-outline" @click="removeFromCompare(product.id)">
                      移除对比
                    </button>
                  </div>
                </div>
              </td>
            </tr>
            
            <!-- 价格行 -->
            <tr class="price-row">
              <th>价格</th>
              <td v-for="product in compareProducts" :key="'price-' + product.id">
                <div class="price-info">
                  <span class="current-price">¥{{ product.price }}</span>
                  <span v-if="product.originalPrice" class="original-price">
                    ¥{{ product.originalPrice }}
                  </span>
                </div>
              </td>
            </tr>
            
            <!-- 分类行 -->
            <tr>
              <th>分类</th>
              <td v-for="product in compareProducts" :key="'category-' + product.id">
                {{ product.categoryName }}
              </td>
            </tr>
            
            <!-- 品牌行 -->
            <tr>
              <th>品牌</th>
              <td v-for="product in compareProducts" :key="'brand-' + product.id">
                {{ product.brand || '未知' }}
              </td>
            </tr>
            
            <!-- 评分行 -->
            <tr>
              <th>用户评分</th>
              <td v-for="product in compareProducts" :key="'rating-' + product.id">
                <div class="rating-info">
                  <div class="rating-stars">
                    <i v-for="n in 5" :key="n" :class="['fas', 'fa-star', n <= product.rating ? 'active' : '']"></i>
                  </div>
                  <span>{{ product.rating }}分</span>
                </div>
              </td>
            </tr>
            
            <!-- 销量行 -->
            <tr>
              <th>月销量</th>
              <td v-for="product in compareProducts" :key="'sales-' + product.id">
                {{ product.sales }}件
              </td>
            </tr>
            
            <!-- 库存行 -->
            <tr>
              <th>库存状态</th>
              <td v-for="product in compareProducts" :key="'stock-' + product.id">
                <span :class="['stock-status', { 'low-stock': product.stock <= 10, 'out-of-stock': product.stock === 0 }]">
                  {{ product.stock === 0 ? '缺货' : (product.stock <= 10 ? `仅剩${product.stock}件` : '有货') }}
                </span>
              </td>
            </tr>
            
            <!-- 描述行 -->
            <tr class="description-row">
              <th>商品描述</th>
              <td v-for="product in compareProducts" :key="'desc-' + product.id">
                <p>{{ product.description }}</p>
              </td>
            </tr>
            
            <!-- 特性行 -->
            <tr>
              <th>商品特性</th>
              <td v-for="product in compareProducts" :key="'features-' + product.id">
                <div class="product-features">
                  <span v-if="product.isNew" class="feature-tag new-tag">新品</span>
                  <span v-if="product.discount" class="feature-tag discount-tag">{{ product.discount }}折</span>
                  <span v-if="product.isHot" class="feature-tag hot-tag">热销</span>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
        
        <div class="compare-actions">
          <button class="btn btn-outline" @click="clearAllCompare">
            <i class="fas fa-trash"></i> 清空对比
          </button>
          <router-link to="/mall" class="btn btn-primary">
            <i class="fas fa-plus"></i> 添加更多商品
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Compare',
  data() {
    return {
      compareProducts: [],
      loading: true
    }
  },
  computed: {
    ...mapGetters(['currentUser'])
  },
  created() {
    this.loadCompareProducts()
  },
  methods: {
    async loadCompareProducts() {
      try {
        // 从URL参数获取商品ID
        const productIds = this.$route.query.products
          ? this.$route.query.products.split(',').map(id => parseInt(id))
          : JSON.parse(localStorage.getItem('compareList') || '[]')
        
        if (productIds.length < 2) {
          this.loading = false
          return
        }
        
        // 模拟从API获取商品数据
        const response = await fetch('/api/products')
        const allProducts = await response.json()
        
        this.compareProducts = allProducts.filter(product => 
          productIds.includes(product.id)
        )
        
        this.loading = false
      } catch (error) {
        console.error('加载对比商品失败:', error)
        this.loading = false
      }
    },
    
    addToCart(product) {
      if (!this.currentUser) {
        this.$router.push('/login')
        return
      }
      
      // 添加到购物车逻辑
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const existingItem = cart.find(item => item.id === product.id)
      
      if (existingItem) {
        existingItem.quantity += 1
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1
        })
      }
      
      localStorage.setItem('cart', JSON.stringify(cart))
      this.$store.dispatch('updateCartCount', cart.length)
      
      // 显示成功消息
      this.$store.dispatch('showMessage', {
        text: `${product.name} 已加入购物车`,
        type: 'success'
      })
    },
    
    removeFromCompare(productId) {
      this.compareProducts = this.compareProducts.filter(p => p.id !== productId)
      
      // 更新localStorage
      const productIds = this.compareProducts.map(p => p.id)
      localStorage.setItem('compareList', JSON.stringify(productIds))
      
      // 如果商品少于2个，跳转回商城
      if (this.compareProducts.length < 2) {
        this.$router.push('/mall')
      }
    },
    
    clearAllCompare() {
      this.compareProducts = []
      localStorage.setItem('compareList', JSON.stringify([]))
      this.$router.push('/mall')
    }
  }
}
</script>

<style scoped>
.compare-page {
  padding: 20px 0 40px;
  min-height: calc(100vh - 200px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.page-title {
  margin: 0;
  font-size: 28px;
  color: #333;
}

.back-to-mall {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--primary-blue);
  text-decoration: none;
  font-weight: 500;
}

.back-to-mall:hover {
  color: var(--primary-dark);
}

.loading-container,
.empty-compare {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #999;
}

.loading-spinner i,
.empty-compare i {
  font-size: 48px;
  margin-bottom: 15px;
  color: #ddd;
}

.empty-compare h3 {
  margin: 0 0 10px;
  font-size: 20px;
  color: #666;
}

.empty-compare p {
  margin: 0 0 20px;
}

.compare-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.compare-table-wrapper {
  overflow-x: auto;
}

.compare-table {
  width: 100%;
  border-collapse: collapse;
}

.compare-table th,
.compare-table td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.compare-table th {
  background: #f9f9f9;
  font-weight: 500;
  color: #333;
  width: 150px;
}

.compare-table td {
  vertical-align: top;
}

.product-row th {
  vertical-align: top;
  padding-top: 20px;
}

.product-col {
  width: 250px;
  padding: 20px 15px;
}

.product-card {
  text-align: center;
}

.product-image {
  width: 180px;
  height: 180px;
  margin: 0 auto 15px;
  border-radius: 8px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-name {
  margin: 0 0 10px;
  font-size: 16px;
  height: 40px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-price {
  font-size: 18px;
  font-weight: bold;
  color: var(--primary-blue);
  margin-bottom: 15px;
}

.product-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.price-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-price {
  font-size: 18px;
  font-weight: bold;
  color: var(--primary-blue);
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.rating-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.rating-stars .fa-star {
  color: #ddd;
  font-size: 14px;
}

.rating-stars .fa-star.active {
  color: #ffcc00;
}

.stock-status {
  font-weight: 500;
}

.low-stock {
  color: #ff9800;
}

.out-of-stock {
  color: #f44336;
}

.description-row td {
  max-width: 250px;
}

.description-row p {
  margin: 0;
  line-height: 1.5;
  height: 60px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.product-features {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.feature-tag {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.new-tag {
  background: #e3f2fd;
  color: #1976d2;
}

.discount-tag {
  background: #fff8e1;
  color: #ff8f00;
}

.hot-tag {
  background: #ffebee;
  color: #d32f2f;
}

.compare-actions {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  border-top: 1px solid #eee;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .compare-table th,
  .compare-table td {
    padding: 10px;
  }
  
  .product-col {
    width: 200px;
  }
  
  .product-image {
    width: 140px;
    height: 140px;
  }
  
  .compare-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .compare-actions .btn {
    width: 100%;
  }
}
</style>