<template>
  <div class="mall-page">
    <!-- 简洁顶部导航 -->
    <div class="mall-header">
      <div class="container">
        <div class="header-content">
          <div class="mall-logo">
            <router-link to="/">
              <span class="logo-icon">🛒</span>
              <span class="logo-text">宠乐汇商城</span>
            </router-link>
          </div>
          
          <div class="header-actions">
            <router-link to="/cart" class="cart-button">
              <i class="fas fa-shopping-cart"></i>
              购物车
              <span v-if="cartStore.totalItems > 0" class="cart-badge">{{ cartStore.totalItems }}</span>
            </router-link>
            <router-link to="/" class="home-btn">
              <i class="fas fa-home"></i> 返回首页
            </router-link>
          </div>
        </div>
        
        <!-- 分类导航 -->
        <div class="category-nav">
          <div class="category-list">
            <button
              v-for="category in categories"
              :key="category.id"
              :class="['category-btn', { active: activeCategory === category.id }]"
              @click="filterByCategory(category.id)"
            >
              <span class="category-icon">{{ category.icon }}</span>
              {{ category.name }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 现代化轮播图 -->
    <div class="hero-section">
      <div class="container">
        <div class="hero-slider">
          <div class="hero-slide" :style="{ backgroundImage: `url(${currentBanner.image})` }">
            <div class="hero-overlay"></div>
            <div class="hero-content">
              <h1 class="hero-title">{{ currentBanner.title }}</h1>
              <p class="hero-description">{{ currentBanner.description }}</p>
              <router-link :to="currentBanner.link" class="hero-btn">
                立即选购 <i class="fas fa-arrow-right"></i>
              </router-link>
            </div>
          </div>
          <div class="hero-indicators">
            <button
              v-for="(banner, index) in banners"
              :key="index"
              :class="['hero-indicator', { active: currentBannerIndex === index }]"
              @click="currentBannerIndex = index"
            ></button>
          </div>
        </div>
      </div>
    </div>

    <!-- 商品列表 -->
    <div class="products-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">精选商品</h2>
          <div class="section-subtitle">为您的爱宠精选高品质产品</div>
          <div class="section-actions">
            <div class="section-sort">
              <label for="sort-select">排序方式：</label>
              <select id="sort-select" v-model="sortBy" @change="handleSort">
                <option value="default">默认排序</option>
                <option value="price_asc">价格从低到高</option>
                <option value="price_desc">价格从高到低</option>
                <option value="sales">按销量排序</option>
              </select>
            </div>
            <button class="filter-toggle-btn" @click="showFilters = !showFilters">
              <i class="fas fa-filter"></i> 筛选
            </button>
          </div>
        </div>

        <div class="products-layout">
          <!-- 筛选侧边栏 -->
          <div class="filters-sidebar" :class="{ active: showFilters }">
            <div class="filter-header">
              <h4>商品筛选</h4>
              <button class="close-filters" @click="showFilters = false">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <!-- 分类筛选 -->
            <div class="filter-section">
              <h5>商品分类</h5>
              <div class="filter-options">
                <label v-for="category in categories" :key="category.id" class="filter-option">
                  <input 
                    type="checkbox" 
                    :value="category.id" 
                    v-model="selectedCategories"
                    @change="applyFilters"
                  >
                  <span class="checkmark"></span>
                  {{ category.name }}
                </label>
              </div>
            </div>
            
            <!-- 价格区间筛选 -->
            <div class="filter-section">
              <h5>价格区间</h5>
              <div class="price-filter">
                <div class="price-inputs">
                  <input 
                    type="number" 
                    v-model="priceMin" 
                    placeholder="最低价"
                    @input="applyFilters"
                  >
                  <span>-</span>
                  <input 
                    type="number" 
                    v-model="priceMax" 
                    placeholder="最高价"
                    @input="applyFilters"
                  >
                </div>
                <div class="price-presets">
                  <button 
                    v-for="preset in pricePresets" 
                    :key="preset.label"
                    class="price-preset-btn"
                    @click="setPriceRange(preset.min, preset.max)"
                  >
                    {{ preset.label }}
                  </button>
                </div>
              </div>
            </div>
            
            <!-- 品牌筛选 -->
            <div class="filter-section">
              <h5>品牌</h5>
              <div class="filter-options">
                <label v-for="brand in brands" :key="brand" class="filter-option">
                  <input 
                    type="checkbox" 
                    :value="brand" 
                    v-model="selectedBrands"
                    @change="applyFilters"
                  >
                  <span class="checkmark"></span>
                  {{ brand }}
                </label>
              </div>
            </div>
            
            <!-- 评分筛选 -->
            <div class="filter-section">
              <h5>用户评分</h5>
              <div class="rating-filter">
                <label v-for="rating in ratingOptions" :key="rating.value" class="rating-option">
                  <input 
                    type="radio" 
                    :value="rating.value" 
                    v-model="selectedRating"
                    @change="applyFilters"
                  >
                  <div class="rating-stars">
                    <i v-for="n in 5" :key="n" :class="['fas', 'fa-star', n <= rating.value ? 'active' : '']"></i>
                  </div>
                  <span>{{ rating.label }}</span>
                </label>
              </div>
            </div>
            
            <!-- 重置筛选 -->
            <div class="filter-actions">
              <button class="btn btn-outline reset-filters-btn" @click="resetFilters">
                重置筛选
              </button>
            </div>
          </div>

          <!-- 商品网格 -->
          <div class="products-grid">
          <!-- 加载状态 -->
          <div v-if="loading" class="loading-container">
            <div class="loading-spinner">
              <i class="fas fa-spinner fa-spin"></i>
              <p>正在加载商品数据...</p>
            </div>
          </div>
          
          <!-- 商品列表 -->
          <template v-else>
            <div
              v-for="product in filteredProducts"
              :key="product.id"
              class="product-card"
            >
              <div class="product-image-wrapper">
                <img :src="product.image" :alt="product.name" class="product-image" @error="handleImageError($event, product)">
                <div v-if="product.stock <= 10" class="stock-badge">仅剩{{ product.stock }}件</div>
                <div v-if="product.isNew" class="new-badge">新品</div>
                <button
                  class="wishlist-btn"
                  :class="{ active: isInWishlist(product.id) }"
                  @click="toggleWishlist(product)"
                >
                  <i class="fas fa-heart"></i>
                </button>
              </div>
              
              <div class="product-info">
                <div class="product-category">{{ product.categoryName }}</div>
                <h4 class="product-title">{{ product.name }}</h4>
                <p class="product-desc">{{ product.description }}</p>
                
                <div class="product-price">
                  <span class="current-price">¥{{ product.price }}</span>
                  <span v-if="product.originalPrice" class="original-price">
                    ¥{{ product.originalPrice }}
                  </span>
                  <span v-if="product.discount" class="discount-tag">
                    {{ product.discount }}折
                  </span>
                </div>
                
                <div class="product-meta">
                  <span class="sales">
                    <i class="fas fa-chart-line"></i> 月销{{ product.sales }}件
                  </span>
                  <span class="rating">
                    <i class="fas fa-star"></i> {{ product.rating }}
                  </span>
                </div>
                
                <div class="product-actions">
                  <button
                    class="add-to-cart-btn"
                    :disabled="product.stock === 0 || isInCart(product.id)"
                    @click="addToCart(product)"
                  >
                    <i class="fas" :class="isInCart(product.id) ? 'fa-check' : 'fa-cart-plus'"></i>
                    {{ isInCart(product.id) ? '已加入' : (product.stock === 0 ? '缺货中' : '加入购物车') }}
                  </button>
                  <router-link :to="`/product/${product.id}`" class="view-detail-btn">
                    查看详情
                  </router-link>
                </div>
              </div>
            </div>
          </template>
          </div>
        </div>

        <!-- 加载更多 -->
        <div v-if="showLoadMore && filteredProducts.length >= displayCount" class="load-more">
          <button @click="loadMoreProducts" :disabled="loadingMore">
            <i v-if="loadingMore" class="fas fa-spinner fa-spin"></i>
            {{ loadingMore ? '加载中...' : '加载更多商品' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 特色分类 -->
    <div class="featured-categories">
      <div class="container">
        <h3 class="section-title">🏷️ 精选分类</h3>
        <div class="categories-grid">
          <div
            v-for="featuredCategory in featuredCategories"
            :key="featuredCategory.id"
            class="featured-category"
            @click="filterByCategory(featuredCategory.id)"
          >
            <div class="category-icon-wrapper">
              <span class="category-icon-large">{{ featuredCategory.icon }}</span>
            </div>
            <h4>{{ featuredCategory.name }}</h4>
            <p>{{ featuredCategory.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 限时抢购 -->
    <div class="flash-sale">
      <div class="container">
        <div class="section-header">
          <h3 class="section-title">
            <i class="fas fa-bolt"></i> 限时抢购
            <span class="sale-timer">
              <i class="fas fa-clock"></i> {{ formatTime(saleTimeLeft) }}
            </span>
          </h3>
          <router-link to="/flash-sale" class="view-all-link">
            查看全部 <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>
        
        <div class="flash-products">
          <div
            v-for="flashProduct in flashSaleProducts"
            :key="flashProduct.id"
            class="flash-product-card"
          >
            <div class="flash-product-image">
              <img :src="flashProduct.image" :alt="flashProduct.name">
              <div class="discount-badge">-{{ flashProduct.discount }}%</div>
            </div>
            <div class="flash-product-info">
              <h4>{{ flashProduct.name }}</h4>
              <div class="flash-price">
                <span class="flash-current">¥{{ flashProduct.salePrice }}</span>
                <span class="flash-original">¥{{ flashProduct.originalPrice }}</span>
              </div>
              <div class="progress-bar">
                <div class="progress" :style="{ width: flashProduct.soldPercent + '%' }"></div>
                <span>已抢{{ flashProduct.soldPercent }}%</span>
              </div>
              <button
                class="flash-buy-btn"
                :disabled="flashProduct.stock === 0"
                @click="cartStore.addToCart(flashProduct.id, 1)"
              >
                立即抢购
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 服务保障 -->
    <div class="service-guarantee">
      <div class="container">
        <div class="guarantee-grid">
          <div class="guarantee-item">
            <div class="guarantee-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 12L11 14L15 10" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h4>正品保障</h4>
            <p>100%正品授权，假一赔十</p>
          </div>
          <div class="guarantee-item">
            <div class="guarantee-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 8L21 16C21 19 19.5 21 16 21L8 21C4.5 21 3 19 3 16L3 8C3 5 4.5 3 8 3L16 3C19.5 3 21 5 21 8Z" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8.5 12L10.5 14L15.5 9" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M3 8L21 8" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h4>快速发货</h4>
            <p>24小时内发货，全国包邮</p>
          </div>
          <div class="guarantee-item">
            <div class="guarantee-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M7 12L9 14L12 11L17 16" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h4>无忧退换</h4>
            <p>7天无理由退换货</p>
          </div>
          <div class="guarantee-item">
            <div class="guarantee-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 2V6M20 4L16 8M8 8L4 4" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h4>专业客服</h4>
            <p>宠物专家在线解答</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加成功提示 -->
    <transition name="slide-up">
      <div v-if="showAddSuccess" class="add-success-toast">
        <i class="fas fa-check-circle"></i>
        已成功添加到购物车！
      </div>
    </transition>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { productApi, cartApi } from '@/api'

export default {
  name: 'MallPage',
  components: {},
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const cartStore = useCartStore()
    
    // 响应式数据
    const searchKeyword = ref('')
    const activeCategory = ref(null)
    const sortBy = ref('default')
    const currentBannerIndex = ref(0)
    const showAddSuccess = ref(false)
    const loadingMore = ref(false)
    const showLoadMore = ref(true)
    const saleTimeLeft = ref(7200)
    const wishlist = ref([])
    const showFilters = ref(false)
    const selectedCategories = ref([])
    const selectedBrands = ref([])
    const selectedRating = ref(0)
    const priceRange = ref({
      min: '',
      max: ''
    })
    // 加载更多功能相关变量
    const displayCount = ref(4) // 初始显示商品数量
    
    // 数据定义
    const categories = ref([
      { id: 'food', name: '宠物食品', icon: '🍖' },
      { id: 'toy', name: '宠物玩具', icon: '🎾' },
      { id: 'health', name: '保健药品', icon: '💊' },
      { id: 'bed', name: '窝垫睡床', icon: '🛏️' },
      { id: 'wear', name: '服饰配饰', icon: '👔' },
      { id: 'clean', name: '清洁用品', icon: '🛁' },
      { id: 'travel', name: '出行装备', icon: '🚗' },
      { id: 'other', name: '其他用品', icon: '📦' }
    ])
    
    const loading = ref(false)
    const banners = ref([
      {
        image: '/images/pet1.jpg',
        title: '夏季清凉大促',
        description: '宠物凉垫、降温背心，让爱宠清凉一夏',
        link: '/category/bed'
      },
      {
        image: 'https://cdn.pixabay.com/photo/2016/07/15/15/55/dachshund-1519374_1280.jpg',
        title: '新品上市 · 宠物营养餐',
        description: '专为爱宠研发的科学配方，营养更均衡',
        link: '/category/food'
      },
      {
        image: 'https://cdn.pixabay.com/photo/2019/08/19/07/45/dog-4415649_1280.jpg',
        title: '智能宠物玩具',
        description: '远程互动，解决分离焦虑',
        link: '/category/toy'
      }
    ])
    
    const products = ref([
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
        isNew: true
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
        isNew: false
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
        isNew: true
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
        isNew: false
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
        isNew: false
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
        isNew: false
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
        isNew: true
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
        isNew: false
      },
      // 新增商品 - 宠物食品
      {
        id: 10,
        name: '冠能大型犬成犬粮',
        description: '专为大型犬设计，强健骨骼',
        category: 'food',
        categoryName: '宠物食品',
        price: 328.00,
        originalPrice: 368.00,
        discount: 8.9,
        image: 'https://gw.alicdn.com/imgextra/O1CN01dIWkCS1H4TwHqhTKe_!!3017450704-0-yinheaigc.jpg',
        stock: 42,
        sales: 1456,
        rating: 4.7,
        isNew: false
      },
      {
        id: 12,
        name: '冻干鸡肉粒宠物零食',
        description: '纯天然无添加，高蛋白低脂',
        category: 'food',
        categoryName: '宠物食品',
        price: 68.00,
        originalPrice: 88.00,
        discount: 7.7,
        image: 'http://img.alicdn.com/img/i1/9734303905/O1CN01TYZTnH1eiXkNnvpTV_!!4611686018427383969-0-saturn_solar.jpg',
        stock: 56,
        sales: 2234,
        rating: 4.9,
        isNew: true
      },
      // 新增商品 - 宠物玩具

      {
        id: 14,
        name: '耐咬橡胶磨牙玩具',
        description: '食品级材质，清洁牙齿',
        category: 'toy',
        categoryName: '宠物玩具',
        price: 38.00,
        image: 'http://img.alicdn.com/img/i4/28852095/O1CN01wDTL8H1RLYe4NlDrW_!!0-saturn_solar.jpg',
        stock: 78,
        sales: 1567,
        rating: 4.7,
        isNew: false
      },

      {
        id: 15,
        name: '狗狗益智漏食玩具',
        description: '延缓进食，训练智力',
        category: 'toy',
        categoryName: '宠物玩具',
        price: 58.00,
        image: 'https://gw.alicdn.com/imgextra/O1CN01dwvafY1FfSgXSe4qs_!!2214975900514-0-yinheaigc.jpg',
        stock: 62,
        sales: 1123,
        rating: 4.5,
        isNew: false
      },
      // 新增商品 - 保健药品
   
      {
        id: 17,
        name: '宠物关节保健片',
        description: '缓解关节疼痛，增强活动力',
        category: 'health',
        categoryName: '保健药品',
        price: 158.00,
        image: 'http://img.alicdn.com/img/i2/7924477624/O1CN01WLsRG926BqiM1Szuw_!!4611686018427383480-0-saturn_solar.jpg',
        stock: 35,
        sales: 987,
        rating: 4.8,
        isNew: false
      },
     
      {
        id: 22,
        name: '宠物柔软毛毯',
        description: '亲肤材质，可机洗',
        category: 'bed',
        categoryName: '窝垫睡床',
        price: 68.00,
        image: 'http://img.alicdn.com/img/i2/1464730048/O1CN01nPh1zN1CE20aMRRC0_!!0-saturn_solar.jpg',
        stock: 72,
        sales: 1456,
        rating: 4.6,
        isNew: false
      },
      {
        id: 23,
        name: '宠物半封闭式窝',
        description: '安全感设计，保暖透气',
        category: 'bed',
        categoryName: '窝垫睡床',
        price: 158.00,
        originalPrice: 198.00,
        discount: 8.0,
        image: 'https://img.alicdn.com/imgextra/i3/2217224742649/O1CN01A7xbv11VRIGcQxEy3_!!2217224742649-0-alimamacc.jpg',
        stock: 29,
        sales: 890,
        rating: 4.7,
        isNew: true
      },
      // 新增商品 - 服饰配饰
     
      {
        id: 25,
        name: '宠物圣诞服装',
        description: '节日氛围，拍照神器',
        category: 'wear',
        categoryName: '服饰配饰',
        price: 88.00,
        image: 'http://img.alicdn.com/img/i1/6444622440/O1CN01wDNL4y1TtZVKYJqR3_!!4611686018427380328-2-saturn_solar.png',
        stock: 45,
        sales: 678,
        rating: 4.7,
        isNew: false
      },
   
      // 新增商品 - 清洁用品
      {
        id: 28,
        name: '宠物除臭喷雾',
        description: '植物配方，快速除臭',
        category: 'clean',
        categoryName: '清洁用品',
        price: 48.00,
        originalPrice: 68.00,
        discount: 7.1,
        image: 'https://img.alicdn.com/imgextra/i4/2208976692426/O1CN0118UIwG1Tn9x8LAkif_!!2208976692426-0-alimamacc.jpg',
        stock: 67,
        sales: 1789,
        rating: 4.7,
        isNew: true
      },
      {
        id: 29,
        name: '宠物湿巾',
        description: '温和无刺激，清洁方便',
        category: 'clean',
        categoryName: '清洁用品',
        price: 28.00,
        image: 'http://img.alicdn.com/img/i3/27417068/O1CN01TxcX2Z225CVDpRlZp_!!4611686018427386348-0-saturn_solar.jpg',
        stock: 89,
        sales: 2234,
        rating: 4.6,
        isNew: false
      },
     
     
      // 新增商品 - 出行装备
      
 
      {
        id: 35,
        name: '宠物背包',
        description: '人体工学设计，舒适透气',
        category: 'travel',
        categoryName: '出行装备',
        price: 158.00,
        originalPrice: 198.00,
        discount: 8.0,
        image: 'http://img.alicdn.com/img/i3/773370050/O1CN01dvDcIW1CEwpyY8Vr3_!!4611686018427384002-0-saturn_solar.jpg',
        stock: 38,
        sales: 789,
        rating: 4.6,
        isNew: true
      },
      {
        id: 36,
        name: '宠物车载饮水杯',
        description: '一键出水，便携设计',
        category: 'travel',
        categoryName: '出行装备',
        price: 48.00,
        image: 'https://gw.alicdn.com/imgextra/O1CN01wuDTv21uPnNMiLx3p_!!2219862306030-0-yinheaigc.jpg',
        stock: 67,
        sales: 1234,
        rating: 4.7,
        isNew: false
      },
      // 新增商品 - 其他用品
      
      {
        id: 38,
        name: '宠物智能喂食器',
        description: '定时定量，远程控制',
        category: 'other',
        categoryName: '其他用品',
        price: 358.00,
        image: 'http://img.alicdn.com/img/i4/6243592877/O1CN01Rfh97e1X7iaP9Tcxd_!!4611686018427382445-0-saturn_solar.jpg',
        stock: 32,
        sales: 890,
        rating: 4.7,
        isNew: false
      },
     
      {
        id: 40,
        name: '宠物电热毯',
        description: '恒温设计，安全节能',
        category: 'other',
        categoryName: '其他用品',
        price: 168.00,
        image: 'http://img.alicdn.com/img/i4/3194097819/O1CN01ARZXiY27d9nDdnEAj_!!2-saturn_solar.png',
        stock: 42,
        sales: 678,
        rating: 4.6,
        isNew: false
      }
    ])
    
    // 筛选数据
    const brands = ref(['皇家', '希尔斯', '冠能', '伟嘉', '麦富迪',])
    const pricePresets = ref([
      { label: '0-50元', min: 0, max: 50 },
      { label: '50-100元', min: 50, max: 100 },
      { label: '100-200元', min: 100, max: 200 },
      { label: '200-500元', min: 200, max: 500 },
      { label: '500元以上', min: 500, max: '' }
    ])
    const ratingOptions = ref([
      { value: 4, label: '4星及以上' },
      { value: 3, label: '3星及以上' },
      { value: 2, label: '2星及以上' },
      { value: 1, label: '1星及以上' }
    ])
    
    const featuredCategories = ref([
      { id: 'food', name: '宠物食品', icon: '🍖', description: '营养均衡的各类宠粮' },
      { id: 'toy', name: '益智玩具', icon: '🧩', description: '激发宠物智力的玩具' },
      { id: 'health', name: '健康护理', icon: '❤️', description: '保健品和护理用品' },
      { id: 'bed', name: '舒适家居', icon: '🏠', description: '窝垫和家居用品' }
    ])
    
    const flashSaleProducts = ref([
      {
        id: 101,
        name: '宠物冻干零食大礼包',
        image: 'https://ts1.tc.mm.bing.net/th/id/OIP-C.wishqM1UvD1kar4R5zyAUgHaHa?w=200&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.5&pid=3.1&rm=2',
        salePrice: 99.00,
        originalPrice: 158.00,
        discount: 37,
        stock: 50,
        soldPercent: 65
      },
      {
        id: 102,
        name: '宠物智能喂食器',
        image: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.6OC5BIPRvFU60yBhassToAHaFj?w=245&h=184&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3',
        salePrice: 299.00,
        originalPrice: 459.00,
        discount: 35,
        stock: 30,
        soldPercent: 80
      },
      {
        id: 103,
        name: '宠物车载安全座椅',
        image: 'https://ts1.tc.mm.bing.net/th/id/OIP-C.c_WF2YUeFAS2dkQPYKed_QHaHa?w=187&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.5&pid=3.1&rm=2',
        salePrice: 189.00,
        originalPrice: 269.00,
        discount: 30,
        stock: 25,
        soldPercent: 45
      }
    ])
    
    // 计算属性
    const currentBanner = computed(() => banners.value[currentBannerIndex.value])
    
    const filteredProducts = computed(() => {
      // 确保products.value是一个数组
      let filtered = Array.isArray(products.value) ? [...products.value] : []
      
      // 如果products.value为null或undefined，使用空数组
      if (!products.value) {
        filtered = []
      } else if (!Array.isArray(products.value)) {
        filtered = []
      }
      
      if (activeCategory.value) {
        filtered = filtered.filter(p => p && p.category === activeCategory.value)
      }
      
      // 按多选分类筛选
      if (selectedCategories.value && selectedCategories.value.length > 0) {
        filtered = filtered.filter(product => selectedCategories.value.includes(product.category))
      }
      
      // 按品牌筛选
      if (selectedBrands.value && selectedBrands.value.length > 0) {
        filtered = filtered.filter(product => selectedBrands.value.includes(product.brand))
      }
      
      // 按价格区间筛选
      if (priceRange.value && (priceRange.value.min !== '' || priceRange.value.max !== '')) {
        filtered = filtered.filter(product => {
          const price = product.price
          const min = priceRange.value.min === '' ? 0 : parseFloat(priceRange.value.min)
          const max = priceRange.value.max === '' ? Infinity : parseFloat(priceRange.value.max)
          return price >= min && price <= max
        })
      }
      
      // 按评分筛选
      if (selectedRating.value && selectedRating.value > 0) {
        filtered = filtered.filter(product => product.rating >= selectedRating.value)
      }
      
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase()
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(keyword) ||
          p.description.toLowerCase().includes(keyword) ||
          p.categoryName.toLowerCase().includes(keyword)
        )
      }
      
      switch (sortBy.value) {
        case 'price_asc':
          filtered.sort((a, b) => a.price - b.price)
          break
        case 'price_desc':
          filtered.sort((a, b) => b.price - a.price)
          break
        case 'sales':
          filtered.sort((a, b) => b.sales - a.sales)
          break
      }
      
      // 只返回前displayCount个商品
      return filtered.slice(0, displayCount.value)
    })
    
    // 价格区间计算属性
    const priceMin = computed({
      get: () => priceRange.value ? priceRange.value.min : '',
      set: (value) => {
        if (!priceRange.value) {
          priceRange.value = {}
        }
        priceRange.value.min = value
        applyFilters()
      }
    })
    
    const priceMax = computed({
      get: () => priceRange.value ? priceRange.value.max : '',
      set: (value) => {
        if (!priceRange.value) {
          priceRange.value = {}
        }
        priceRange.value.max = value
        applyFilters()
      }
    })
    
    // 方法
    const viewDetails = (product) => {
      router.push(`/product/${product.id}`)
    }
    
    // 保存原始硬编码商品数据作为后备
    // 保存原始硬编码商品数据
    const originalProducts = [...products.value]
    
    const loadProductsFromServer = async () => {
      try {
        loading.value = true
        const response = await productApi.getAllProducts()
        
        if (response && response.success) {
          // 确保返回的数据是数组
          const responseData = response.data.items || response.data
          if (Array.isArray(responseData) && responseData.length > 0) {
            products.value = responseData
            console.log('成功从服务器加载商品数据:', products.value.length)
          } else {
            // 服务器返回空数据，使用硬编码数据
            console.log('服务器返回空商品数据，使用硬编码数据')
            products.value = [...(originalProducts || [])]
          }
        } else {
          console.error('加载商品数据失败:', response ? response.message : '未知错误')
          // 如果API失败，使用硬编码数据作为后备
          console.log('使用硬编码商品数据作为后备')
          products.value = [...(originalProducts || [])]
        }
      } catch (error) {
        console.error('加载商品数据失败:', error)
        // 如果API失败，使用硬编码数据作为后备
        console.log('使用硬编码商品数据作为后备')
        products.value = [...(originalProducts || [])]
      } finally {
        loading.value = false
      }
    }
    
    const loadCartData = async () => {
      // 使用Pinia store的loadCart方法
      await cartStore.loadCart()
    }
    
    const loadWishlist = () => {
      try {
        const wishlistData = localStorage.getItem('mall_wishlist')
        if (wishlistData) {
          const parsed = JSON.parse(wishlistData)
          wishlist.value = Array.isArray(parsed) ? parsed : []
        } else {
          wishlist.value = []
        }
      } catch (e) {
        console.error('加载心愿单失败:', e)
        wishlist.value = []
      }
    }
    
    const saveWishlist = () => {
      if (!wishlist.value || !Array.isArray(wishlist.value)) {
        localStorage.setItem('mall_wishlist', JSON.stringify([]))
        return
      }
      localStorage.setItem('mall_wishlist', JSON.stringify(wishlist.value))
    }
    
    const handleSearch = () => {
      console.log('搜索关键词:', searchKeyword.value)
    }
    
    const filterByCategory = (categoryId) => {
      activeCategory.value = activeCategory.value === categoryId ? null : categoryId
    }
    
    const handleSort = () => {
      console.log('排序方式:', sortBy.value)
    }
    
    const applyFilters = () => {
      // 筛选逻辑已在computed中处理
    }
    
    const setPriceRange = (min, max) => {
      if (!priceRange.value) {
        priceRange.value = {}
      }
      priceRange.value.min = min
      // 确保max为空字符串时保持为空字符串，而不是转换为其他值
      priceRange.value.max = max === '' ? '' : max
      applyFilters()
    }
    
    const resetFilters = () => {
      selectedCategories.value = []
      selectedBrands.value = []
      selectedRating.value = 0
      if (!priceRange.value) {
        priceRange.value = {}
      }
      priceRange.value.min = ''
      priceRange.value.max = ''
      applyFilters()
    }
    
    let bannerTimer = null
    let saleTimer = null
    
    const startBannerRotation = () => {
      bannerTimer = setInterval(() => {
        currentBannerIndex.value = (currentBannerIndex.value + 1) % banners.value.length
      }, 5000)
    }
    
    const startSaleTimer = () => {
      saleTimer = setInterval(() => {
        if (saleTimeLeft.value > 0) {
          saleTimeLeft.value--
        } else {
          clearInterval(saleTimer)
        }
      }, 1000)
    }
    
    const formatTime = (seconds) => {
      const h = Math.floor(seconds / 3600)
      const m = Math.floor((seconds % 3600) / 60)
      const s = seconds % 60
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    
    const isInCart = (productId) => {
      if (!cartStore || !cartStore.isInCart) {
        return false
      }
      return cartStore.isInCart(productId)
    }
    
    const isInWishlist = (productId) => {
      if (!wishlist.value || !Array.isArray(wishlist.value)) {
        return false
      }
      return wishlist.value.some(item => item && item.id === productId)
    }
    
    const addToCart = async (product) => {
  try {
    // 检查用户是否登录
    if (!userStore.isLoggedIn) {
      // 未登录，显示提示信息并跳转到登录页面
      if (confirm('请先登录后再添加商品到购物车，是否前往登录页面？')) {
        router.push({
          path: '/login',
          query: { redirect: '/mall' }
        });
      }
      return;
    }
    
    // 检查product对象是否存在
    if (!product) {
      console.error('商品信息不存在');
      alert('商品信息不存在');
      return;
    }
    
    // 检查商品库存
    if (product.stock <= 0) {
      alert('商品库存不足');
      return;
    }
    
    // 检查购物车是否存在
    if (!cartStore || !cartStore.items) {
      console.error('购物车信息不存在');
      alert('购物车信息不存在');
      return;
    }
    
    // 用户已登录，使用购物车API添加商品
    console.log('正在添加商品到购物车:', product.name, 'ID:', product.id);
    
    // 首先检查商品是否存在
    try {
      const checkResponse = await fetch(`http://localhost:3000/api/check-product/${product.id}`);
      const checkData = await checkResponse.json();
      
      if (!checkData.success) {
        console.log(`商品ID ${product.id} 不存在或已下架: ${checkData.message}`);
        alert('商品不存在，正在初始化商品数据...');
        
        // 初始化商品数据
        const initResponse = await fetch('http://localhost:3000/api/init-products');
        const initData = await initResponse.json();
        
        if (!initData.success) {
          throw new Error('初始化商品数据失败: ' + (initData.message || '未知错误'));
        }
        
        console.log('商品数据初始化成功');
        
        // 重新检查商品是否存在
        const recheckResponse = await fetch(`http://localhost:3000/api/check-product/${product.id}`);
        const recheckData = await recheckResponse.json();
        
        if (!recheckData.success) {
          alert(`商品ID ${product.id} 仍然不存在，请刷新页面重试`);
          return;
        }
        
        console.log('商品验证通过，继续添加到购物车');
      }
    } catch (checkError) {
      console.error('检查商品失败:', checkError);
      alert('检查商品信息失败，请稍后重试');
      return;
    }
    
    // 使用Pinia store的addToCart方法
    await cartStore.addToCart(product.id, 1);
    showAddSuccessMessage();
    console.log('已添加到购物车:', product.name);
    
  } catch (error) {
    console.error('添加到购物车失败:', error);
    alert('添加到购物车失败: ' + error.message);
  }
}
    
    const toggleWishlist = (product) => {
      if (!product || !product.id) {
        console.error('商品信息不存在')
        alert('商品信息不存在')
        return
      }
      
      if (!wishlist.value || !Array.isArray(wishlist.value)) {
        wishlist.value = []
      }
      
      const index = wishlist.value.findIndex(item => item.id === product.id)
      
      if (index > -1) {
        wishlist.value.splice(index, 1)
      } else {
        wishlist.value.push(product)
      }
      
      saveWishlist()
    }
    
    const showAddSuccessMessage = () => {
      showAddSuccess.value = true
      setTimeout(() => {
        showAddSuccess.value = false
      }, 2000)
    }
    
    const handleImageError = (e, product) => {
      // 找到包含该图片的整个商品卡片并隐藏
      const productCard = e.target.closest('.product-card')
      if (productCard) {
        productCard.style.display = 'none'
      }
    }
    
    const loadMoreProducts = () => {
      loadingMore.value = true
      
      setTimeout(() => {
        // 每次点击"加载更多"增加4个商品
        displayCount.value += 4
        console.log('加载更多商品，当前显示数量:', displayCount.value)
        
        // 检查是否还有更多商品可以显示
        const allProducts = Array.isArray(products.value) ? [...products.value] : []
        let filtered = allProducts
        
        // 应用相同的筛选逻辑
        if (activeCategory.value) {
          filtered = filtered.filter(p => p && p.category === activeCategory.value)
        }
        
        if (selectedCategories.value && selectedCategories.value.length > 0) {
          filtered = filtered.filter(product => selectedCategories.value.includes(product.category))
        }
        
        if (selectedBrands.value && selectedBrands.value.length > 0) {
          filtered = filtered.filter(product => selectedBrands.value.includes(product.brand))
        }
        
        if (priceRange.value && (priceRange.value.min !== '' || priceRange.value.max !== '')) {
          filtered = filtered.filter(product => {
            const price = product.price
            const min = priceRange.value.min === '' ? 0 : parseFloat(priceRange.value.min)
            const max = priceRange.value.max === '' ? Infinity : parseFloat(priceRange.value.max)
            return price >= min && price <= max
          })
        }
        
        if (selectedRating.value && selectedRating.value > 0) {
          filtered = filtered.filter(product => product.rating >= selectedRating.value)
        }
        
        if (searchKeyword.value) {
          const keyword = searchKeyword.value.toLowerCase()
          filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(keyword) ||
            p.description.toLowerCase().includes(keyword) ||
            p.categoryName.toLowerCase().includes(keyword)
          )
        }
        
        // 如果已显示所有商品，隐藏"加载更多"按钮
        if (displayCount.value >= filtered.length) {
          showLoadMore.value = false
        }
        
        loadingMore.value = false
      }, 1000)
    }
    
    // 生命周期
    onMounted(() => {
  console.log('🛍️ 商城页面加载完成')
  
  // 检查商品数据是否已初始化
  const checkAndInitProducts = async () => {
    try {
      // 检查是否有商品数据
      const response = await productApi.getAllProducts();
      
      if (!response.success || !response.data || (response.data.items && response.data.items.length === 0)) {
        console.log('商品数据未初始化，正在初始化...');
        
        const initResponse = await fetch('http://localhost:3000/api/init-products');
        const initData = await initResponse.json();
        
        if (initData.success) {
          console.log('商品数据初始化成功');
          await loadProductsFromServer() // 重新加载商品数据
        } else {
          console.error('商品数据初始化失败:', initData.message);
        }
      } else {
        await loadProductsFromServer()
      }
    } catch (error) {
      console.error('检查商品数据失败:', error);
      await loadProductsFromServer()
    }
  };
  
  // 执行检查和初始化
  checkAndInitProducts();
  
  // 加载购物车数据
  loadCartData()
  loadWishlist()
  startBannerRotation()
  startSaleTimer()
    })
    
    onBeforeUnmount(() => {
      if (bannerTimer) clearInterval(bannerTimer)
      if (saleTimer) clearInterval(saleTimer)
    })
    
    return {
      // 响应式数据
      searchKeyword,
      activeCategory,
      sortBy,
      currentBannerIndex,
      showAddSuccess,
      loadingMore,
      showLoadMore,
      saleTimeLeft,
      loading,
      categories,
      banners,
      products,
      brands,
      pricePresets,
      ratingOptions,
      featuredCategories,
      flashSaleProducts,
      wishlist,
      displayCount,
      
      // 计算属性
      currentBanner,
      filteredProducts,
      priceMin,
      priceMax,
      
      // 方法
      handleSearch,
      filterByCategory,
      handleSort,
      formatTime,
      isInCart,
      isInWishlist,
      addToCart,
      viewDetails,
      toggleWishlist,
      loadMoreProducts,
      loadProductsFromServer,
      loadCartData,
      loadWishlist,
      saveWishlist,
      showAddSuccessMessage,
      handleImageError,
      startBannerRotation,
      startSaleTimer,
      
      // Store
      cartStore
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

.mall-page {
  min-height: 100vh;
  background: #f8f9fa;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 顶部导航栏 */
.mall-header {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
}

.mall-logo a {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  font-weight: 700;
  font-size: 24px;
  color: #1a1a1a;
}

.logo-icon {
  font-size: 30px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cart-button {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background:#f8f9fa;
  color: #039af1;
  border-radius: 12px;
  font-weight: 500;
  font-size: 15px;
  transition: all 0.2s ease;
  text-decoration: none;
}

.cart-button:hover {
  background: #0479ed;
}

.cart-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ff6b6b;
  color: white;
  font-size: 11px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.home-btn {
  padding: 12px 20px;
  background: #f8f9fa;
  color: #1a1a1a;
  border-radius: 12px;
  text-decoration: none;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.home-btn:hover {
  background: #e9ecef;
}

/* 分类导航 */
.category-nav {
  padding: 20px 0;
  border-top: 1px solid #e9ecef;
}

.category-list {
  display: flex;
  overflow-x: auto;
  gap: 12px;
  padding: 5px 0;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  font-weight: 500;
  color: #495057;
}

.category-btn:hover {
  background: #e9ecef;
}

.category-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.category-icon {
  font-size: 18px;
}

/* 现代化轮播图 */
.hero-section {
  padding: 40px 0;
}

.hero-slider {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
}

.hero-slide {
  height: 450px;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 100%);
}

.hero-content {
  padding: 0 60px;
  max-width: 600px;
  color: white;
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.hero-description {
  font-size: 18px;
  margin-bottom: 30px;
  line-height: 1.6;
  opacity: 0.9;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: white;
  color: #1a1a1a;
  padding: 14px 28px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.2s ease;
}

.hero-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.hero-indicators {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 2;
}

.hero-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.hero-indicator.active {
  background: white;
  width: 24px;
  border-radius: 4px;
}

/* 商品列表 */
.products-section {
  padding: 60px 0;
}

.section-header {
  margin-bottom: 40px;
  text-align: center;
}

.section-title {
  font-size: 36px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 12px 0;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}

.section-subtitle {
  font-size: 18px;
  color: #6c757d;
  margin-bottom: 30px;
  font-weight: 400;
}

.section-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.section-sort {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-sort label {
  font-size: 15px;
  color: #495057;
  font-weight: 500;
}

.section-sort select {
  padding: 10px 16px;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  background: white;
  font-size: 15px;
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.section-sort select:focus {
  border-color: #4dabf7;
  box-shadow: 0 0 0 3px rgba(77, 171, 247, 0.1);
}

.filter-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 15px;
  color: #495057;
  font-weight: 500;
  transition: all 0.2s ease;
}

.filter-toggle-btn:hover {
  background: #e9ecef;
}

.products-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 40px;
}

.filters-sidebar {
  width: 320px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  padding: 24px;
  height: fit-content;
  position: sticky;
  top: 100px;
  transform: translateX(0);
  transition: transform 0.3s ease;
}

@media (max-width: 992px) {
  .filters-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000;
    overflow-y: auto;
    transform: translateX(-100%);
  }
  
  .filters-sidebar.active {
    transform: translateX(0);
  }
  
  .products-layout {
    grid-template-columns: 1fr;
  }
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #E5E7EB;
}

.filter-header h4 {
  margin: 0;
  font-size: 18px;
  color: #1F2937;
}

.close-filters {
  display: none;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #6B7280;
}

@media (max-width: 992px) {
  .close-filters {
    display: block;
  }
}

.filter-section {
  margin-bottom: 28px;
}

.filter-section h5 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: -0.01em;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 15px;
  color: #495057;
  transition: color 0.2s ease;
}

.filter-option:hover {
  color: #1a1a1a;
}

.filter-option input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #E5E7EB;
  border-radius: 4px;
  margin-right: 10px;
  position: relative;
  transition: all 0.2s;
}

.filter-option input[type="checkbox"]:checked + .checkmark {
  background: #3B82F6;
  border-color: #3B82F6;
}

.filter-option input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
}

.price-filter {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-inputs input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s ease;
}

.price-inputs input:focus {
  outline: none;
  border-color: #4dabf7;
  box-shadow: 0 0 0 3px rgba(77, 171, 247, 0.1);
}

.price-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
}

.price-preset-btn {
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #495057;
  font-weight: 500;
  flex: 1;
  min-width: 80px;
  text-align: center;
  white-space: nowrap;
}

.price-preset-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.rating-filter {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rating-option {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 15px;
  color: #495057;
  transition: color 0.2s ease;
}

.rating-option:hover {
  color: #1a1a1a;
}

.rating-option input[type="radio"] {
  display: none;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.rating-stars .fa-star {
  color: #dee2e6;
  font-size: 15px;
}

.rating-stars .fa-star.active {
  color: #ffd43b;
}

.filter-actions {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.reset-filters-btn {
  width: 100%;
  padding: 12px;
  background: white;
  color: #3b82f6;
  border: 1px solid #3b82f6;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-filters-btn:hover {
  background: #e7f5ff;
  transform: translateY(-1px);
}

@media (max-width: 992px) {
  .products-layout {
    flex-direction: column;
  }
  
  .filters-sidebar {
    width: 100%;
    max-width: 380px;
  }
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.product-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
}

.product-image-wrapper {
  position: relative;
  height: 220px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.stock-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #EF4444;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.new-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #10B981;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.wishlist-btn {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #868e96;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.wishlist-btn:hover,
.wishlist-btn.active {
  color: #ff6b6b;
  background: white;
  transform: scale(1.1);
}

.product-info {
  padding: 20px;
}

.product-category {
  font-size: 13px;
  color: #868e96;
  margin-bottom: 6px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.product-title {
  font-size: 18px;
  color: #1a1a1a;
  margin-bottom: 12px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.01em;
}

.product-desc {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 15px;
  line-height: 1.5;
  height: 42px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.current-price {
  font-size: 22px;
  font-weight: 700;
  color: #ff6b6b;
}

.original-price {
  font-size: 16px;
  color: #adb5bd;
  text-decoration: line-through;
}

.discount-tag {
  background: #FEE2E2;
  color: #EF4444;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-size: 12px;
  color: #9CA3AF;
}

.product-meta i {
  margin-right: 4px;
}

.product-actions {
  display: flex;
  gap: 10px;
}

.view-detail-btn {
  padding: 12px 18px;
  background: white;
  color: #3b82f6;
  border: 1px solid #3b82f6;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-detail-btn:hover {
  background: #e7f5ff;
  transform: translateY(-1px);
}

.compare-btn {
  padding: 8px 12px;
  background: white;
  color: #6c757d;
  border: 1px solid #6c757d;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.compare-btn:hover {
  background: #6c757d;
  color: white;
}

.compare-btn.active {
  background: #6c757d;
  color: white;
}

/* 商品对比浮动按钮 */
.compare-float-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  background: #3B82F6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  z-index: 100;
  transition: all 0.3s;
}

.compare-float-btn:hover {
  transform: scale(1.1);
  background: #2563EB;
}

.compare-float-btn i {
  font-size: 24px;
}

.compare-count {
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background: #EF4444;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

/* 商品对比面板 */
.compare-panel-overlay {
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

.compare-panel {
  width: 90%;
  max-width: 800px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.compare-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.compare-header h3 {
  margin: 0;
  font-size: 20px;
}

.close-panel {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
}

.compare-empty {
  padding: 40px;
  text-align: center;
  color: #999;
}

.compare-empty i {
  font-size: 48px;
  margin-bottom: 15px;
  display: block;
}

.compare-content {
  padding: 20px;
}

.compare-products {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.compare-product {
  flex: 0 0 180px;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.compare-product-image {
  position: relative;
  height: 120px;
  overflow: hidden;
}

.compare-product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-compare {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.compare-product-info {
  padding: 10px;
}

.compare-product-info h4 {
  margin: 0 0 5px;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.compare-price {
  font-weight: bold;
  color: #3B82F6;
}

.add-compare-slot {
  flex: 0 0 180px;
  border: 1px dashed #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-compare-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 100%;
  height: 100%;
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
}

.add-compare-btn i {
  font-size: 24px;
}

.add-compare-btn p {
  margin: 0;
  font-size: 14px;
}

.compare-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

@media (max-width: 768px) {
  .compare-panel {
    width: 95%;
  }
  
  .compare-products {
    flex-direction: column;
  }
  
  .compare-product,
  .add-compare-slot {
    flex: 0 0 auto;
    width: 100%;
  }
}

.add-to-cart-btn {
  flex: 1;
  padding: 12px 18px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.add-to-cart-btn:hover:not(:disabled) {
  background: #339af0;
  transform: translateY(-1px);
}

.add-to-cart-btn:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
}

.view-detail-btn {
  padding: 10px 15px;
  background: white;
  color: #3B82F6;
  border: 2px solid #3B82F6;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-detail-btn:hover {
  background: #EFF6FF;
}

/* 加载更多 */
.load-more {
  text-align: center;
  margin-top: 40px;
}

.load-more button {
  padding: 12px 40px;
  background: white;
  color: #2563EB;
  border: 2px solid #2563EB;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.load-more button:hover:not(:disabled) {
  background: #EFF6FF;
  transform: translateY(-2px);
}

.load-more button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 特色分类 */
.featured-categories {
  padding: 60px 0;
  background: #F0F9FF;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.featured-category {
  background: white;
  border-radius: 15px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.featured-category:hover {
  transform: translateY(-5px);
  border-color: #3B82F6;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.1);
}

.category-icon-wrapper {
  width: 80px;
  height: 80px;
  background: #EFF6FF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.category-icon-large {
  font-size: 36px;
}

.featured-category h4 {
  font-size: 20px;
  color: #1F2937;
  margin-bottom: 10px;
}

.featured-category p {
  font-size: 14px;
  color: #6B7280;
  line-height: 1.6;
}

/* 限时抢购 */
.flash-sale {
  padding: 60px 0;
  background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%);
}

.sale-timer {
  margin-left: 15px;
  padding: 4px 12px;
  background: #EF4444;
  color: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.view-all-link {
  color: #3B82F6;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}

.view-all-link:hover {
  color: #2563EB;
  transform: translateX(5px);
}

.flash-products {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 30px;
}

.flash-product-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  transition: all 0.3s;
}

.flash-product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.flash-product-image {
  position: relative;
  width: 150px;
  flex-shrink: 0;
}

.flash-product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.discount-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #EF4444;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
}

.flash-product-info {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.flash-product-info h4 {
  font-size: 18px;
  color: #1F2937;
  margin-bottom: 10px;
}

.flash-price {
  margin-bottom: 15px;
}

.flash-current {
  font-size: 24px;
  font-weight: bold;
  color: #EF4444;
  margin-right: 10px;
}

.flash-original {
  font-size: 16px;
  color: #9CA3AF;
  text-decoration: line-through;
}

.progress-bar {
  margin-bottom: 15px;
}

.progress {
  height: 8px;
  background: linear-gradient(90deg, #EF4444, #FB923C);
  border-radius: 4px;
  margin-bottom: 5px;
  transition: width 0.3s;
}

.progress-bar span {
  font-size: 12px;
  color: #6B7280;
}

.flash-buy-btn {
  margin-top: auto;
  padding: 10px;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.flash-buy-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(59, 130, 246, 0.3);
}

.flash-buy-btn:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
}

/* 服务保障 */
.service-guarantee {
  padding: 60px 0;
  background: white;
}

.guarantee-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.guarantee-item {
  text-align: center;
  padding: 30px;
  border-radius: 15px;
  background: #F8FAFC;
  transition: all 0.3s;
}

.guarantee-item:hover {
  background: #EFF6FF;
  transform: translateY(-5px);
}

.guarantee-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: #3B82F6;
  font-size: 24px;
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.15);
  transition: all 0.3s ease;
}

.guarantee-item:hover .guarantee-icon {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.25);
  background: linear-gradient(135deg, #DBEAFE, #BFDBFE);
}

.guarantee-item h4 {
  font-size: 18px;
  color: #1F2937;
  margin-bottom: 10px;
}

.guarantee-item p {
  font-size: 14px;
  color: #6B7280;
  line-height: 1.6;
}

/* 底部 */
.mall-footer {
  background: #1F2937;
  color: white;
  padding: 60px 0 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
}

.footer-section h4 {
  font-size: 18px;
  margin-bottom: 20px;
  color: white;
}

.footer-section p {
  color: #D1D5DB;
  line-height: 1.6;
  font-size: 14px;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section ul li {
  margin-bottom: 12px;
}

.footer-section ul li a {
  color: #D1D5DB;
  text-decoration: none;
  transition: all 0.3s;
}

.footer-section ul li a:hover {
  color: white;
  padding-left: 5px;
}

.footer-section ul li i {
  margin-right: 10px;
  color: #9CA3AF;
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #374151;
  color: #9CA3AF;
  font-size: 14px;
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  grid-column: 1 / -1;
}

.loading-spinner {
  text-align: center;
  color: #6B7280;
}

.loading-spinner i {
  font-size: 32px;
  color: #3B82F6;
  margin-bottom: 15px;
}

.loading-spinner p {
  font-size: 16px;
  margin: 0;
}

/* 添加成功提示 */
.add-success-toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 15px 25px;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1000;
  border-left: 5px solid #10B981;
}

.add-success-toast i {
  color: #10B981;
  font-size: 20px;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 100%);
}

/* 响应式设计 */
@media (max-width: 992px) {
  .products-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
    padding: 16px 0;
  }
  
  .category-list {
    gap: 8px;
  }
  
  .category-btn {
    padding: 10px 16px;
    font-size: 13px;
  }
  
  .hero-slide {
    height: 350px;
  }
  
  .hero-content {
    padding: 0 30px;
  }
  
  .hero-title {
    font-size: 36px;
  }
  
  .hero-description {
    font-size: 16px;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }
  
  .section-title {
    font-size: 30px;
  }
  
  .section-subtitle {
    font-size: 16px;
  }
}

@media (max-width: 576px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-title {
    font-size: 28px;
  }
  
  .hero-description {
    font-size: 15px;
  }
  
  .section-title {
    font-size: 26px;
  }
  
  .section-subtitle {
    font-size: 15px;
  }
  
  .section-actions {
    flex-direction: column;
    gap: 12px;
  }
}
</style>