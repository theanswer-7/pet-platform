<template>
  <div class="product-detail-container">
    <div class="breadcrumb">
      <router-link to="/mall">商城</router-link> > 商品详情
    </div>
    
    <div v-if="product" class="product-detail">
      <div class="product-image-section">
        <img :src="product.image" :alt="product.name" class="main-image" @error="handleImageError">
      </div>
      
      <div class="product-info-section">
        <h1 class="product-title">{{ product.name }}</h1>
        <div class="product-price">
          <span class="current-price">¥{{ product.price.toFixed(2) }}</span>
          <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice.toFixed(2) }}</span>
        </div>
        
        <div class="product-rating">
          <div class="stars">
            <i v-for="i in 5" :key="i" :class="['fas', i <= product.rating ? 'fa-star' : 'fa-star-alt']"></i>
          </div>
          <span class="rating-text">({{ product.reviews }}条评价)</span>
        </div>
        
        <div class="product-description">
          <h3>商品描述</h3>
          <p>{{ product.description }}</p>
        </div>
        
        <div class="product-specs">
          <h3>商品规格</h3>
          <ul>
            <li v-for="(spec, index) in product.specifications" :key="index">
              <span class="spec-name">{{ spec.name }}:</span>
              <span class="spec-value">{{ spec.value }}</span>
            </li>
          </ul>
        </div>
        
        <div class="purchase-section">
          <div class="quantity-selector">
            <button @click="decreaseQuantity" :disabled="quantity <= 1">-</button>
            <input type="number" v-model.number="quantity" min="1">
            <button @click="increaseQuantity">+</button>
          </div>
          
          <div class="action-buttons">
            <button class="add-to-cart-btn" @click="addToCart">
              <i class="fas fa-shopping-cart"></i> 加入购物车
            </button>
            <button class="buy-now-btn" @click="buyNow">
              立即购买
            </button>
            <button class="view-cart-btn" @click="goToCart">
              <i class="fas fa-shopping-basket"></i> 购物车
            </button>
            <button class="favorite-btn" @click="toggleFavorite">
              <i :class="['fas', isFavorite ? 'fa-heart' : 'fa-heart']"></i> 
              {{ isFavorite ? '已收藏' : '收藏' }}
            </button>
          </div>
        </div>
        
        <div class="product-features">
          <div class="feature-item">
            <i class="fas fa-shipping-fast"></i>
            <span>极速配送</span>
          </div>
          <div class="feature-item">
            <i class="fas fa-shield-alt"></i>
            <span>正品保证</span>
          </div>
          <div class="feature-item">
            <i class="fas fa-undo"></i>
            <span>7天无理由退换</span>
          </div>
        </div>
      </div>
      
      <!-- 用户评价组件 -->
      <div class="reviews-section" v-if="product">
        <div class="reviews-header">
          <h3>用户评价</h3>
          <div class="reviews-summary">
            <div class="average-rating">
              <span class="rating-score">{{ product.rating }}</span>
              <div class="rating-stars">
                <i v-for="n in 5" :key="n" :class="['fas', n <= product.rating ? 'fa-star' : 'fa-star-alt']"></i>
              </div>
              <span class="rating-count">({{ product.reviews }}条评价)</span>
            </div>
            <button class="write-review-btn" @click="showReviewForm = !showReviewForm">
              <i class="fas fa-pen"></i> 写评价
            </button>
          </div>
        </div>
        
        <!-- 评价表单 -->
        <div v-if="showReviewForm" class="review-form">
          <h4>撰写评价</h4>
          <div class="form-group">
            <label>评分</label>
            <div class="rating-input">
              <i v-for="n in 5" :key="n" 
                 :class="['fas', 'fa-star', n <= newReview.rating ? 'active' : '']"
                 @click="newReview.rating = n"></i>
            </div>
          </div>
          <div class="form-group">
            <label>评价内容</label>
            <textarea v-model="newReview.content" placeholder="请分享您的使用体验..."></textarea>
          </div>
          <div class="form-actions">
            <button class="btn-primary" @click="submitReview">提交评价</button>
            <button class="btn-outline" @click="cancelReview">取消</button>
          </div>
        </div>
        
        <!-- 评价列表 -->
        <div class="reviews-list">
          <div v-if="reviews.length === 0" class="no-reviews">
            <i class="fas fa-comment-slash"></i>
            <p>暂无评价，成为第一个评价者吧！</p>
          </div>
          <div v-for="review in paginatedReviews" :key="review.id" class="review-item">
            <div class="review-header">
              <div class="reviewer-info">
                <div class="reviewer-avatar">
                  <i class="fas fa-user-circle"></i>
                </div>
                <div class="reviewer-details">
                  <div class="reviewer-name">{{ review.username }}</div>
                  <div class="review-date">{{ formatDate(review.date) }}</div>
                </div>
              </div>
              <div class="review-rating">
                <i v-for="n in 5" :key="n" :class="['fas', 'fa-star', n <= review.rating ? 'active' : '']"></i>
              </div>
            </div>
            <div class="review-content">{{ review.content }}</div>
            <div class="review-actions">
              <button class="helpful-btn" @click="markHelpful(review.id)">
                <i class="fas fa-thumbs-up"></i> 有用 ({{ review.helpful }})
              </button>
            </div>
          </div>
        </div>
        
        <!-- 分页 -->
        <div v-if="totalReviewPages > 1" class="reviews-pagination">
          <button 
            v-for="page in totalReviewPages" 
            :key="page"
            :class="['page-btn', { active: currentPage === page }]"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </div>
    
    <div v-else class="loading">
      <div class="spinner"></div>
      <p>加载商品信息中...</p>
    </div>
    
    <div v-if="notification" class="notification">
      {{ notification }}
    </div>
  </div>
</template>

<script>
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'

export default {
  name: 'ProductDetail',
  data() {
    return {
      product: null,
      quantity: 1,
      isFavorite: false,
      notification: null,
      productTabs: [
        { title: '商品详情' },
        { title: '规格参数' },
        { title: '配送信息' },
        { title: '用户评价' }
      ],
      reviews: [],
      showReviewForm: false,
      newReview: {
        rating: 5,
        content: ''
      },
      currentPage: 1,
      reviewsPerPage: 5
    }
  },
  setup() {
    const cartStore = useCartStore()
    const userStore = useUserStore()
    
    return {
      cartStore,
      userStore
    }
  },
  created() {
    this.loadProduct();
    this.loadReviews();
    this.checkFavoriteStatus();
  },
  computed: {
    averageRating() {
      if (this.reviews.length === 0) return 0;
      const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
      return (sum / this.reviews.length).toFixed(1);
    },
    totalReviewPages() {
      return Math.ceil(this.reviews.length / this.reviewsPerPage);
    },
    paginatedReviews() {
      const start = (this.currentPage - 1) * this.reviewsPerPage;
      const end = start + this.reviewsPerPage;
      return this.reviews.slice(start, end);
    }
  },
  methods: {
    loadProduct() {
      // 从路由参数获取商品ID
      const productId = parseInt(this.$route.params.id);
      
      // 从Mall.vue中获取商品数据
      // 这里我们使用与Mall.vue相同的商品数据
      const products = [
        {
          id: 1,
          name: '皇家小型犬成犬粮',
          description: '营养均衡，促进消化健康',
          category: 'food',
          categoryName: '宠物食品',
          price: 258.00,
          originalPrice: 298.00,
          discount: 8.7,
          image: 'https://img.alicdn.com/i3/1657012585/O1CN01o6L2Kx1UxyMAfqn7Z_!!1657012585.jpg',
          stock: 45,
          sales: 1234,
          rating: 4.8,
          isNew: true,
          specifications: [
            { name: '品牌', value: '皇家' },
            { name: '规格', value: '2kg' },
            { name: '适用犬种', value: '小型犬' },
            { name: '保质期', value: '18个月' },
            { name: '产地', value: '法国' }
          ]
        },
        {
          id: 2,
          name: '宠物自动饮水机',
          description: '静音循环，保持水质新鲜',
          category: 'other',
          categoryName: '其他用品',
          price: 189.00,
          image: 'https://ts4.tc.mm.bing.net/th/id/OIP-C.3FTvHf8dzEXx7Lm7kt_McAHaLB?rs=1&pid=ImgDetMain&o=7&rm=3',
          stock: 32,
          sales: 856,
          rating: 4.6,
          isNew: false,
          specifications: [
            { name: '品牌', value: '小佩' },
            { name: '容量', value: '2L' },
            { name: '材质', value: '食品级ABS' },
            { name: '功率', value: '2W' },
            { name: '产地', value: '中国' }
          ]
        },
        {
          id: 3,
          name: '猫咪电动逗猫棒',
          description: '智能感应，激发捕猎天性',
          category: 'toy',
          categoryName: '宠物玩具',
          price: 68.00,
          originalPrice: 88.00,
          discount: 7.7,
          image: 'https://ts1.tc.mm.bing.net/th/id/OIP-C.1obNYDNUrUt-raCFQ5S1TQAAAA?w=213&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.5&pid=3.1&rm=2',
          stock: 78,
          sales: 2103,
          rating: 4.9,
          isNew: true,
          specifications: [
            { name: '品牌', value: '猫太郎' },
            { name: '材质', value: '羽毛+塑料' },
            { name: '尺寸', value: '50cm' },
            { name: '电池', value: '2节AA电池' },
            { name: '产地', value: '中国' }
          ]
        },
        {
          id: 4,
          name: '宠物卵磷脂美毛膏',
          description: '改善毛发质量，增强皮肤健康',
          category: 'health',
          categoryName: '保健药品',
          price: 128.00,
          image: 'https://img.alicdn.com/bao/uploaded/i1/291341349/O1CN01tim5dV1Lpt8a7CJta_!!291341349-0-picasso.jpg',
          stock: 56,
          sales: 987,
          rating: 4.7,
          isNew: false,
          specifications: [
            { name: '品牌', value: '麦德氏' },
            { name: '规格', value: '120g' },
            { name: '适用宠物', value: '犬猫通用' },
            { name: '保质期', value: '3年' },
            { name: '产地', value: '美国' }
          ]
        },
        {
          id: 5,
          name: '宠物四季通用窝',
          description: '可拆洗设计，舒适保暖',
          category: 'bed',
          categoryName: '窝垫睡床',
          price: 189.00,
          originalPrice: 229.00,
          discount: 8.3,
          image: 'https://ts1.tc.mm.bing.net/th/id/OIP-C.Rcp-qVGP4o_sXbKRjlniPgAAAA?w=202&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.5&pid=3.1&rm=2',
          stock: 23,
          sales: 1456,
          rating: 4.8,
          isNew: false,
          specifications: [
            { name: '品牌', value: '多格漫' },
            { name: '尺寸', value: '50×40×30cm' },
            { name: '材质', value: '珊瑚绒' },
            { name: '适用宠物', value: '中小型犬/猫' },
            { name: '产地', value: '中国' }
          ]
        },
        {
          id: 6,
          name: '宠物牵引绳套装',
          description: '防爆冲设计，安全舒适',
          category: 'travel',
          categoryName: '出行装备',
          price: 89.00,
          image: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.R4-vG81cm-z1jOibH0wqGQHaE_?w=304&h=205&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3',
          stock: 67,
          sales: 2345,
          rating: 4.9,
          isNew: false,
          specifications: [
            { name: '品牌', value: '福莱希' },
            { name: '长度', value: '5m' },
            { name: '材质', value: '尼龙+反光条' },
            { name: '适用宠物', value: '中大型犬' },
            { name: '产地', value: '德国' }
          ]
        },
        {
          id: 7,
          name: '宠物香波沐浴露',
          description: '温和配方，留香持久',
          category: 'clean',
          categoryName: '清洁用品',
          price: 58.00,
          originalPrice: 78.00,
          discount: 7.4,
          image: 'http://img.alicdn.com/img/i4/2215875342225/O1CN01I50sgk1SJ6LtqWl8Q_!!2215875342225-2-alimamacc.png',
          stock: 89,
          sales: 1789,
          rating: 4.6,
          isNew: true,
          specifications: [
            { name: '品牌', value: '艾宠' },
            { name: '规格', value: '500ml' },
            { name: '香型', value: '薰衣草香' },
            { name: '适用宠物', value: '犬猫通用' },
            { name: '产地', value: '中国' }
          ]
        },
        {
          id: 8,
          name: '宠物雨衣四脚款',
          description: '防水透气，活动自如',
          category: 'wear',
          categoryName: '服饰配饰',
          price: 45.00,
          image: 'https://ts1.tc.mm.bing.net/th/id/OIP-C.KDh2Zxf9eB2eq1W81vtGMQAAAA?w=214&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.5&pid=3.1&rm=2',
          stock: 34,
          sales: 567,
          rating: 4.5,
          isNew: false,
          specifications: [
            { name: '品牌', value: '嬉皮狗' },
            { name: '尺寸', value: 'S/M/L' },
            { name: '材质', value: 'PVC' },
            { name: '适用宠物', value: '小型犬' },
            { name: '产地', value: '中国' }
          ]
        }
      ];
      
      // 根据ID查找对应的商品
      const product = products.find(p => p.id === productId);
      
      if (product) {
        // 添加reviews属性，用于评价数量
        this.product = {
          ...product,
          reviews: Math.floor(Math.random() * 500) + 50 // 随机生成评价数量
        };
      } else {
        // 如果找不到商品，显示错误信息
        this.product = null;
        this.showNotification('找不到该商品');
      }
    },
    increaseQuantity() {
      this.quantity++;
    },
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },
    async addToCart() {
      try {
        // 添加到购物车
        await this.cartStore.addToCart(this.product.id, this.quantity);
        this.showNotification('已添加到购物车');
      } catch (error) {
        console.error('添加到购物车失败:', error);
        this.showNotification('添加到购物车失败，请稍后再试');
      }
    },
    async buyNow() {
      if (!this.userStore.isLoggedIn) {
        this.$router.push('/login')
        return
      }
      
      try {
        // 立即购买
        await this.cartStore.addToCart(this.product.id, this.quantity);
        this.$router.push('/checkout');
      } catch (error) {
        console.error('添加到购物车失败:', error);
        this.showNotification('添加到购物车失败，请稍后再试');
      }
    },
    
    goToCart() {
      this.$router.push('/cart');
    },
    
    toggleFavorite() {
      if (!this.userStore.isLoggedIn) {
        this.$router.push('/login')
        return
      }
      
      // 获取用户收藏列表
      let favorites = JSON.parse(localStorage.getItem('userFavorites') || '[]')
      
      if (this.isFavorite) {
        // 取消收藏
        favorites = favorites.filter(id => id !== this.product.id)
        this.showNotification('已取消收藏')
      } else {
        // 添加收藏
        favorites.push(this.product.id)
        this.showNotification('收藏成功')
      }
      
      // 保存到localStorage
      localStorage.setItem('userFavorites', JSON.stringify(favorites))
      
      // 更新状态
      this.isFavorite = !this.isFavorite
    },
    
    checkFavoriteStatus() {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      this.isFavorite = favorites.includes(this.product?.id)
    },
    
    toggleFavorite() {
      this.isFavorite = !this.isFavorite
      const message = this.isFavorite ? '已添加到收藏' : '已取消收藏'
      this.showNotification(message)
      
      // 保存收藏状态到localStorage
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      if (this.isFavorite) {
        if (!favorites.includes(this.product.id)) {
          favorites.push(this.product.id)
        }
      } else {
        const index = favorites.indexOf(this.product.id)
        if (index > -1) {
          favorites.splice(index, 1)
        }
      }
      localStorage.setItem('favorites', JSON.stringify(favorites))
    },
    
    showNotification(message) {
      this.notification = message;
      setTimeout(() => {
        this.notification = null;
      }, 3000);
    },
    handleImageError(event) {
      // 当图片加载失败时，隐藏整个商品详情
      const productDetail = event.target.closest('.product-detail');
      if (productDetail) {
        productDetail.style.display = 'none';
        this.showNotification('商品图片加载失败');
      }
    },
    submitReview() {
      if (!this.userStore.isLoggedIn) {
        this.$router.push('/login')
        return
      }
      
      if (!this.newReview.content.trim()) {
        this.showNotification('请填写评价内容')
        return
      }
      
      const review = {
        id: Date.now(),
        productId: this.product.id,
        userId: this.userStore.user.id,
        username: this.userStore.user.name || '用户',
        avatar: this.userStore.user.avatar || '',
        rating: this.newReview.rating,
        content: this.newReview.content,
        date: new Date().toISOString(),
        helpful: 0
      }
      
      // 保存到localStorage
      const reviews = JSON.parse(localStorage.getItem('productReviews') || '[]')
      reviews.push(review)
      localStorage.setItem('productReviews', JSON.stringify(reviews))
      
      // 更新本地数据
      this.reviews.push(review)
      
      // 重置表单
      this.resetReviewForm()
      this.showNotification('评价提交成功')
    },
    
    cancelReview() {
      this.resetReviewForm()
    },
    
    resetReviewForm() {
      this.showReviewForm = false
      this.newReview = {
        rating: 5,
        content: ''
      }
    },
    
    markHelpful(reviewId) {
      const reviewIndex = this.reviews.findIndex(r => r.id === reviewId)
      if (reviewIndex !== -1) {
        this.reviews[reviewIndex].helpful++
        
        // 更新localStorage
        const reviews = JSON.parse(localStorage.getItem('productReviews') || '[]')
        const savedReviewIndex = reviews.findIndex(r => r.id === reviewId)
        if (savedReviewIndex !== -1) {
          reviews[savedReviewIndex].helpful++
          localStorage.setItem('productReviews', JSON.stringify(reviews))
        }
      }
    },
    
    loadReviews() {
      const reviews = JSON.parse(localStorage.getItem('productReviews') || '[]')
      this.reviews = reviews.filter(r => r.productId === this.product?.id)
    },
    
    checkFavoriteStatus() {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      this.isFavorite = favorites.includes(this.product?.id)
    },
    
    toggleFavorite() {
      this.isFavorite = !this.isFavorite
      const message = this.isFavorite ? '已添加到收藏' : '已取消收藏'
      this.showNotification(message)
      
      // 保存收藏状态到localStorage
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      if (this.isFavorite) {
        if (!favorites.includes(this.product.id)) {
          favorites.push(this.product.id)
        }
      } else {
        const index = favorites.indexOf(this.product.id)
        if (index > -1) {
          favorites.splice(index, 1)
        }
      }
      localStorage.setItem('favorites', JSON.stringify(favorites))
    }
  }
}
</script>

<style scoped>
.product-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

.breadcrumb {
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
}

.breadcrumb a {
  color: #4a90e2;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.product-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
}

.product-image-section {
  flex: 1;
  min-width: 300px;
}

.main-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-info-section {
  flex: 1;
  min-width: 300px;
}

.product-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.product-price {
  margin-bottom: 15px;
}

.current-price {
  font-size: 28px;
  font-weight: bold;
  color: #e74c3c;
}

.original-price {
  font-size: 18px;
  color: #999;
  text-decoration: line-through;
  margin-left: 10px;
}

.product-rating {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.stars {
  color: #f39c12;
  margin-right: 10px;
}

.rating-text {
  color: #666;
  font-size: 14px;
}

.product-description, .product-specs {
  margin-bottom: 20px;
}

.product-description h3, .product-specs h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #333;
}

.product-specs ul {
  list-style: none;
  padding: 0;
}

.product-specs li {
  display: flex;
  margin-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}

.spec-name {
  font-weight: bold;
  width: 100px;
  color: #666;
}

.spec-value {
  flex: 1;
}

.purchase-section {
  margin-bottom: 20px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  width: 150px;
}

.quantity-selector button {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
}

.quantity-selector button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-selector input {
  width: 50px;
  height: 36px;
  text-align: center;
  border: 1px solid #ddd;
  border-left: none;
  border-right: none;
}

.action-buttons {
  display: flex;
  gap: 15px;
}

.add-to-cart-btn, .buy-now-btn, .view-cart-btn, .favorite-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

.add-to-cart-btn {
  background-color: #f39c12;
  color: white;
}

.buy-now-btn {
  background-color: #e74c3c;
  color: white;
}

.view-cart-btn {
  background-color: #3498db;
  color: white;
}

.favorite-btn {
  background-color: #fff;
  color: #e74c3c;
  border: 1px solid #e74c3c;
}

.favorite-btn:hover {
  background-color: #e74c3c;
  color: white;
}

.add-to-cart-btn:hover, .buy-now-btn:hover, .view-cart-btn:hover {
  opacity: 0.9;
}

.favorite-btn {
  background: white;
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
}

.favorite-btn:hover {
  background: #ff6b6b;
  color: white;
}

.favorite-btn .fa-heart {
  color: #ff6b6b;
}

.favorite-btn:hover .fa-heart {
  color: white;
}

.product-features {
  display: flex;
  gap: 20px;
  margin-top: 30px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100px;
}

.feature-item i {
  font-size: 24px;
  color: #4a90e2;
  margin-bottom: 8px;
}

.feature-item span {
  font-size: 14px;
  color: #666;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #4CAF50;
  color: white;
  padding: 15px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

/* 评价组件样式 */
.reviews-section {
  margin-top: 40px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.reviews-header h3 {
  font-size: 20px;
  color: #333;
  margin: 0;
}

.reviews-summary {
  display: flex;
  align-items: center;
  gap: 20px;
}

.average-rating {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rating-score {
  font-size: 24px;
  font-weight: bold;
  color: #f39c12;
}

.rating-stars {
  color: #f39c12;
}

.rating-count {
  color: #666;
  font-size: 14px;
}

.write-review-btn {
  padding: 8px 16px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.write-review-btn:hover {
  background: #357abd;
}

.review-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
}

.review-form h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.rating-input {
  display: flex;
  gap: 5px;
}

.rating-input i {
  font-size: 20px;
  color: #ddd;
  cursor: pointer;
  transition: color 0.3s;
}

.rating-input i.active {
  color: #f39c12;
}

.rating-input i:hover {
  color: #f39c12;
}

.form-group textarea {
  width: 100%;
  min-height: 100px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.btn-primary, .btn-outline {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-primary {
  background: #4a90e2;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #357abd;
}

.btn-outline {
  background: white;
  color: #666;
  border: 1px solid #ddd;
}

.btn-outline:hover {
  background: #f5f5f5;
}

.reviews-list {
  margin-bottom: 20px;
}

.no-reviews {
  text-align: center;
  padding: 40px;
  color: #999;
}

.no-reviews i {
  font-size: 48px;
  margin-bottom: 15px;
}

.review-item {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  border: 1px solid #e0e0e0;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.reviewer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reviewer-avatar i {
  font-size: 24px;
  color: #999;
}

.reviewer-name {
  font-weight: bold;
  color: #333;
}

.review-date {
  font-size: 12px;
  color: #999;
}

.review-rating {
  color: #f39c12;
}

.review-content {
  margin-bottom: 10px;
  line-height: 1.5;
  color: #333;
}

.review-actions {
  display: flex;
  gap: 10px;
}

.helpful-btn {
  background: none;
  border: 1px solid #ddd;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: #666;
  transition: all 0.3s;
}

.helpful-btn:hover {
  background: #f5f5f5;
  border-color: #4a90e2;
  color: #4a90e2;
}

.reviews-pagination {
  display: flex;
  justify-content: center;
  gap: 5px;
}

.page-btn {
  padding: 5px 10px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
}

.page-btn:hover {
  background: #f5f5f5;
}

.page-btn.active {
  background: #4a90e2;
  color: white;
  border-color: #4a90e2;
}

/* 评价样式 */
.reviews-section {
  margin-top: 20px;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.reviews-summary {
  display: flex;
  align-items: center;
  gap: 20px;
}

.average-rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-score {
  font-size: 24px;
  font-weight: bold;
  color: #ff6b6b;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.rating-stars .fa-star {
  color: #ddd;
  font-size: 16px;
}

.rating-stars .fa-star.active {
  color: #ff6b6b;
}

.rating-count {
  color: #666;
  font-size: 14px;
}

.write-review-btn {
  padding: 8px 15px;
  font-size: 14px;
}

.review-form {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.review-form h4 {
  margin-bottom: 15px;
  color: #333;
}

.rating-input {
  display: flex;
  gap: 5px;
  margin-bottom: 15px;
}

.rating-input .fa-star {
  font-size: 24px;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s;
}

.rating-input .fa-star:hover,
.rating-input .fa-star.active {
  color: #ff6b6b;
}

.review-form textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.reviews-list {
  margin-top: 20px;
}

.no-reviews {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.no-reviews i {
  font-size: 48px;
  margin-bottom: 15px;
  display: block;
}

.review-item {
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reviewer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reviewer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reviewer-avatar i {
  font-size: 24px;
  color: #ccc;
}

.reviewer-name {
  font-weight: 500;
  color: #333;
}

.review-date {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.review-rating {
  display: flex;
  gap: 2px;
}

.review-rating .fa-star {
  color: #ddd;
  font-size: 14px;
}

.review-rating .fa-star.active {
  color: #ff6b6b;
}

.review-content {
  margin-bottom: 10px;
  line-height: 1.6;
  color: #555;
}

.review-actions {
  display: flex;
  gap: 15px;
}

.review-action {
  background: none;
  border: none;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: color 0.2s;
}

.review-action:hover {
  color: #ff6b6b;
}

.reviews-pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 5px;
}

.page-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.page-btn.active {
  background: #ff6b6b;
  color: white;
  border-color: #ff6b6b;
}

@media (max-width: 768px) {
  .product-detail {
    flex-direction: column;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .product-features {
    justify-content: space-between;
  }
}
</style>