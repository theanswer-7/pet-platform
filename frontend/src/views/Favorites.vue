<template>
  <div class="favorites-page">
    <div class="page-header">
      <h1>我的收藏</h1>
      <div class="header-actions">
        <div class="filter-sort">
          <select v-model="sortBy" class="sort-select">
            <option value="default">默认排序</option>
            <option value="priceAsc">价格从低到高</option>
            <option value="priceDesc">价格从高到低</option>
            <option value="nameAsc">名称A-Z</option>
            <option value="newest">最新收藏</option>
          </select>
          <select v-model="filterCategory" class="filter-select">
            <option value="all">所有分类</option>
            <option value="dog">狗狗用品</option>
            <option value="cat">猫咪用品</option>
            <option value="bird">鸟类用品</option>
            <option value="fish">水族用品</option>
            <option value="other">其他宠物</option>
          </select>
        </div>
        <button @click="refreshFavorites" class="refresh-btn" :disabled="loading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
          刷新
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading && favorites.length === 0" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载收藏列表...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="filteredFavorites.length === 0 && !loading" class="empty-state">
      <div class="empty-icon">
        <i class="far fa-heart"></i>
      </div>
      <h2>您还没有收藏任何商品</h2>
      <p>浏览商城，点击商品上的爱心图标即可收藏喜欢的商品</p>
      <router-link to="/mall" class="browse-btn">去商城逛逛</router-link>
    </div>

    <!-- 收藏列表 -->
    <div v-else class="favorites-container">
      <div class="favorites-grid">
        <div
          v-for="item in paginatedFavorites"
          :key="item.id"
          class="favorite-card"
        >
          <div class="card-image">
            <img :src="item.image || '/placeholder-pet.jpg'" :alt="item.name" @error="handleImageError">
            <div class="card-actions">
              <button
                @click="toggleFavorite(item)"
                class="favorite-btn active"
                title="取消收藏"
              >
                <i class="fas fa-heart"></i>
              </button>
            </div>
          </div>
          <div class="card-content">
            <div class="card-category">{{ getCategoryName(item.category) }}</div>
            <h3 class="card-title">{{ item.name }}</h3>
            <div class="card-price">¥{{ item.price.toFixed(2) }}</div>
            <div class="card-description">{{ item.description }}</div>
            <div class="card-footer">
              <button
                @click="addToCart(item)"
                class="add-to-cart-btn"
                :disabled="item.addingToCart"
              >
                <i class="fas fa-shopping-cart"></i>
                {{ item.addingToCart ? '添加中...' : '加入购物车' }}
              </button>
              <router-link :to="`/product/${item.id}`" class="view-details-btn">
                查看详情
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          @click="currentPage = 1"
          :disabled="currentPage === 1"
          class="page-btn"
        >
          <i class="fas fa-angle-double-left"></i>
        </button>
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="page-btn"
        >
          <i class="fas fa-angle-left"></i>
        </button>
        
        <span
          v-for="page in visiblePages"
          :key="page"
          @click="currentPage = page"
          :class="['page-number', { active: page === currentPage }]"
        >
          {{ page }}
        </span>
        
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          <i class="fas fa-angle-right"></i>
        </button>
        <button
          @click="currentPage = totalPages"
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          <i class="fas fa-angle-double-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { cartApi } from '@/api/cart'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const favorites = ref([])
const sortBy = ref('default')
const filterCategory = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(12)

// 计算属性
const filteredFavorites = computed(() => {
  let result = [...favorites.value]
  
  // 分类筛选
  if (filterCategory.value !== 'all') {
    result = result.filter(item => item.category === filterCategory.value)
  }
  
  // 排序
  switch (sortBy.value) {
    case 'priceAsc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'priceDesc':
      result.sort((a, b) => b.price - a.price)
      break
    case 'nameAsc':
      result.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'newest':
      result.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate))
      break
    default:
      // 默认排序，不做处理
      break
  }
  
  return result
})

const totalPages = computed(() => {
  return Math.ceil(filteredFavorites.value.length / itemsPerPage.value)
})

const paginatedFavorites = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredFavorites.value.slice(start, end)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const delta = 2 // 当前页前后显示的页数
  
  const range = []
  const rangeWithDots = []
  let l

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i)
    }
  }

  range.forEach((i) => {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  })

  return rangeWithDots
})

// 监听器
watch(sortBy, () => {
  currentPage.value = 1 // 重置到第一页
})

watch(filterCategory, () => {
  currentPage.value = 1 // 重置到第一页
})

// 生命周期钩子
onMounted(() => {
  loadFavorites()
})

// 方法
const loadFavorites = async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  
  loading.value = true
  try {
    // 这里应该调用API获取收藏列表
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 模拟数据，实际应该从API获取
    favorites.value = getMockFavorites()
  } catch (error) {
    console.error('加载收藏列表失败:', error)
    ElMessage.error('加载收藏列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const getMockFavorites = () => {
  // 模拟数据，实际应该从API获取
  return [
    {
      id: 1,
      name: '高级狗粮 - 成犬专用',
      price: 128.00,
      category: 'dog',
      description: '营养均衡，适合成犬日常食用，富含蛋白质和维生素',
      image: 'https://gw.alicdn.com/bao/uploaded/i2/4256204489/O1CN01Mh6TTQ1j20vZx4kWK_!!4256204489.jpg_.webp',
      addedDate: new Date('2023-11-15')
    },
    {
      id: 2,
      name: '猫咪自动饮水机',
      price: 89.90,
      category: 'cat',
      description: '循环过滤水流，鼓励猫咪多喝水，保持健康',
      image: 'http://img.alicdn.com/img/i2/10587445/O1CN01maKWAD24rrooZ2tsM_!!4611686018427383093-0-saturn_solar.jpg',
      addedDate: new Date('2023-11-20')
    },

   
    {
      id: 3,
      name: '宠物智能摄像头',
      price: 399.00,
      category: 'other',
      description: '远程监控，双向语音，随时与宠物互动',
      image: 'http://img.alicdn.com/img/i4/6243592877/O1CN01Rfh97e1X7iaP9Tcxd_!!4611686018427382445-0-saturn_solar.jpg',
      addedDate: new Date('2023-11-18')
    }
  ]
}

const toggleFavorite = async (item) => {
  try {
    // 这里应该调用API取消收藏
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 从收藏列表中移除
    const index = favorites.value.findIndex(fav => fav.id === item.id)
    if (index !== -1) {
      favorites.value.splice(index, 1)
    }
    
    ElMessage.success(`已取消收藏 "${item.name}"`)
  } catch (error) {
    console.error('取消收藏失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  }
}

const addToCart = async (item) => {
  // 检查用户是否已登录
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再添加商品到购物车')
    // 跳转到登录页面
    setTimeout(() => {
      router.push('/login')
    }, 1500)
    return
  }
  
  // 设置添加到购物车状态
  item.addingToCart = true
  
  try {
    // 使用cartApi添加商品到购物车
    const response = await cartApi.addToCart(item.id, 1)
    
    if (response.success) {
      ElMessage.success(`"${item.name}" 已添加到购物车`)
      
      // 添加成功后跳转到购物车页面
      setTimeout(() => {
        router.push('/cart')
      }, 1000) // 延迟1秒让用户看到成功提示
    } else {
      ElMessage.error('添加到购物车失败: ' + (response.message || '未知错误'))
    }
  } catch (error) {
    console.error('添加到购物车失败:', error)
    ElMessage.error('添加失败，请稍后重试')
  } finally {
    item.addingToCart = false
  }
}

const refreshFavorites = () => {
  loadFavorites()
}

const getCategoryName = (category) => {
  const categoryMap = {
    dog: '狗狗用品',
    cat: '猫咪用品',
    bird: '鸟类用品',
    fish: '水族用品',
    other: '其他宠物'
  }
  return categoryMap[category] || '其他'
}

const handleImageError = (event) => {
  // 当图片加载失败时，隐藏整个收藏项
  const favoriteItem = event.target.closest('.favorite-card')
  if (favoriteItem) {
    favoriteItem.style.display = 'none'
  }
}
</script>

<style scoped>
/* 使用设计系统变量 */
.favorites-page {
  padding: var(--spacing-2xl);
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2xl);
  flex-wrap: wrap;
  gap: var(--spacing-base);
}

.page-header h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
}

.filter-sort {
  display: flex;
  gap: var(--spacing-sm);
}

.sort-select, .filter-select {
  padding: var(--spacing-sm) var(--spacing-base);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--bg-primary);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-base);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition-base);
  color: var(--text-primary);
}

.refresh-btn:hover:not(:disabled) {
  background-color: var(--bg-tertiary);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl) 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color-light);
  border-top: 4px solid var(--color-primary);
  border-radius: var(--border-radius-full);
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-base);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: var(--spacing-3xl) var(--spacing-lg);
}

.empty-icon {
  font-size: var(--font-size-5xl);
  color: var(--color-primary-light);
  margin-bottom: var(--spacing-lg);
}

.empty-state h2 {
  margin: 0 0 var(--spacing-base);
  color: var(--text-secondary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
}

.empty-state p {
  margin: 0 0 var(--spacing-xl);
  color: var(--text-tertiary);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
}

.browse-btn {
  display: inline-block;
  padding: var(--spacing-base) var(--spacing-xl);
  background-color: var(--color-primary);
  color: var(--color-white);
  text-decoration: none;
  border-radius: var(--border-radius);
  transition: var(--transition-base);
  font-weight: var(--font-weight-medium);
}

.browse-btn:hover {
  background-color: var(--color-primary-dark);
}

.favorites-container {
  margin-top: var(--spacing-lg);
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-xl);
}

.favorite-card {
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: var(--transition-base);
  border: 1px solid var(--border-color-light);
}

.favorite-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition-base);
}

.favorite-card:hover .card-image img {
  transform: scale(1.05);
}

.card-actions {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  display: flex;
  gap: var(--spacing-xs);
}

.favorite-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--border-radius-full);
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-base);
}

.favorite-btn:hover {
  background-color: var(--color-white);
  transform: scale(1.1);
}

.favorite-btn.active {
  color: var(--color-secondary);
}

.card-content {
  padding: var(--spacing-lg);
}

.card-category {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-full);
  display: inline-block;
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-weight-medium);
}

.card-title {
  margin: 0 0 var(--spacing-sm);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-price {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-secondary);
  margin-bottom: var(--spacing-sm);
}

.card-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-base);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: var(--line-height-normal);
}

.card-footer {
  display: flex;
  gap: var(--spacing-sm);
}

.add-to-cart-btn {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-base);
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  transition: var(--transition-base);
  font-weight: var(--font-weight-medium);
}

.add-to-cart-btn:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.add-to-cart-btn:disabled {
  background-color: var(--color-disabled);
  cursor: not-allowed;
}

.view-details-btn {
  padding: var(--spacing-sm) var(--spacing-base);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  text-decoration: none;
  border-radius: var(--border-radius);
  text-align: center;
  font-size: var(--font-size-sm);
  transition: var(--transition-base);
  font-weight: var(--font-weight-medium);
}

.view-details-btn:hover {
  background-color: var(--bg-tertiary);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: var(--spacing-2xl);
  gap: var(--spacing-xs);
}

.page-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition-base);
  color: var(--text-primary);
}

.page-btn:hover:not(:disabled) {
  background-color: var(--bg-secondary);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-number {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition-base);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

.page-number:hover {
  background-color: var(--bg-secondary);
}

.page-number.active {
  background-color: var(--color-primary);
  color: var(--color-white);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .favorites-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: var(--spacing-base);
  }
}

@media (max-width: 480px) {
  .favorites-page {
    padding: var(--spacing-lg);
  }
  
  .favorites-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-sort {
    flex-direction: column;
    width: 100%;
  }
  
  .sort-select, .filter-select {
    width: 100%;
  }
}
</style>