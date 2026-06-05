<template>
  <div class="search-results-container">
    <div class="search-header">
      <div class="search-info">
        <h1>搜索结果</h1>
        <p v-if="searchQuery">关键词: "{{ searchQuery }}"</p>
        <p v-if="totalResults > 0">共找到 {{ totalResults }} 个结果</p>
        <p v-else-if="!loading">没有找到相关结果</p>
      </div>
      
      <div class="search-filters">
        <div class="filter-group">
          <label>类型:</label>
          <select v-model="activeFilter" @change="filterResults">
            <option value="all">全部</option>
            <option value="products">商品</option>
            <option value="pets">宠物</option>
            <option value="services">服务</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>排序:</label>
          <select v-model="sortBy" @change="sortResults">
            <option value="relevance">相关度</option>
            <option value="price-asc">价格从低到高</option>
            <option value="price-desc">价格从高到低</option>
            <option value="name">名称</option>
          </select>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>搜索中...</p>
    </div>
    
    <div v-else-if="filteredResults.length > 0" class="results-container">
      <div class="result-item" v-for="item in paginatedResults" :key="`${item.type}-${item.id}`">
        <div class="result-image">
          <img :src="item.image" :alt="item.name" @error="handleImageError">
        </div>
        
        <div class="result-content">
          <div class="result-type">
            <span :class="`type-badge ${item.type}`">{{ getTypeLabel(item.type) }}</span>
          </div>
          
          <h3 class="result-title">{{ item.name }}</h3>
          <p class="result-description">{{ item.description }}</p>
          
          <div class="result-meta">
            <span v-if="item.type === 'products' && item.price" class="price">¥{{ item.price.toFixed(2) }}</span>
            <span v-if="item.type === 'pets' && item.location" class="location">
              <i class="fas fa-map-marker-alt"></i> {{ item.location }}
            </span>
            <span v-if="item.type === 'services' && item.duration" class="duration">
              <i class="fas fa-clock"></i> {{ item.duration }}
            </span>
          </div>
          
          <div class="result-actions">
            <button 
              v-if="item.type === 'products'" 
              class="btn-primary" 
              @click="viewProduct(item.id)"
            >
              查看详情
            </button>
            
            <button 
              v-if="item.type === 'pets'" 
              class="btn-primary" 
              @click="viewPet(item.id)"
            >
              查看详情
            </button>
            
            <button 
              v-if="item.type === 'services'" 
              class="btn-primary" 
              @click="bookService(item.id)"
            >
              预约服务
            </button>
          </div>
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          @click="currentPage = 1" 
          :disabled="currentPage === 1"
          class="page-btn"
        >
          首页
        </button>
        
        <button 
          @click="currentPage = Math.max(1, currentPage - 1)" 
          :disabled="currentPage === 1"
          class="page-btn"
        >
          上一页
        </button>
        
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        
        <button 
          @click="currentPage = Math.min(totalPages, currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          下一页
        </button>
        
        <button 
          @click="currentPage = totalPages" 
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          末页
        </button>
      </div>
    </div>
    
    <div v-else class="no-results">
      <i class="fas fa-search"></i>
      <h3>没有找到相关结果</h3>
      <p>请尝试使用其他关键词或调整筛选条件</p>
      <button @click="$router.push('/')" class="btn-primary">返回首页</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchResults',
  data() {
    return {
      searchQuery: '',
      results: [],
      filteredResults: [],
      loading: true,
      activeFilter: 'all',
      sortBy: 'relevance',
      currentPage: 1,
      itemsPerPage: 10
    }
  },
  computed: {
    totalResults() {
      return this.filteredResults.length;
    },
    totalPages() {
      return Math.ceil(this.totalResults / this.itemsPerPage);
    },
    paginatedResults() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredResults.slice(start, end);
    }
  },
  created() {
    this.searchQuery = this.$route.query.q || '';
    this.performSearch();
  },
  watch: {
    '$route.query.q'(newQuery) {
      this.searchQuery = newQuery || '';
      this.performSearch();
    }
  },
  methods: {
    performSearch() {
      this.loading = true;
      
      // 模拟API调用
      setTimeout(() => {
        // 模拟搜索结果
        this.results = this.generateMockResults();
        this.filterResults();
        this.loading = false;
      }, 800);
    },
    generateMockResults() {
      const mockResults = [];
      
      // 商品结果
      for (let i = 1; i <= 10; i++) {
        mockResults.push({
          id: `product-${i}`,
          type: 'products',
          name: `优质宠物食品 ${i}`,
          description: '这是一款优质的宠物食品，富含营养，适合各种宠物食用。',
          image: `https://picsum.photos/seed/product${i}/200/200.jpg`,
          price: Math.floor(Math.random() * 200) + 50
        });
      }
      
      // 宠物结果
      for (let i = 1; i <= 8; i++) {
        mockResults.push({
          id: `pet-${i}`,
          type: 'pets',
          name: `可爱的宠物 ${i}`,
          description: '这是一只非常可爱的宠物，性格温顺，适合家庭饲养。',
          image: `https://picsum.photos/seed/pet${i}/200/200.jpg`,
          location: ['北京', '上海', '广州', '深圳'][Math.floor(Math.random() * 4)]
        });
      }
      
      // 服务结果
      for (let i = 1; i <= 5; i++) {
        mockResults.push({
          id: `service-${i}`,
          type: 'services',
          name: `专业宠物服务 ${i}`,
          description: '提供专业的宠物护理服务，让您的宠物得到最好的照顾。',
          image: `https://picsum.photos/seed/service${i}/200/200.jpg`,
          duration: ['30分钟', '1小时', '2小时'][Math.floor(Math.random() * 3)]
        });
      }
      
      return mockResults;
    },
    filterResults() {
      if (this.activeFilter === 'all') {
        this.filteredResults = [...this.results];
      } else {
        this.filteredResults = this.results.filter(item => item.type === this.activeFilter);
      }
      
      this.sortResults();
      this.currentPage = 1;
    },
    sortResults() {
      switch (this.sortBy) {
        case 'price-asc':
          this.filteredResults.sort((a, b) => (a.price || 0) - (b.price || 0));
          break;
        case 'price-desc':
          this.filteredResults.sort((a, b) => (b.price || 0) - (a.price || 0));
          break;
        case 'name':
          this.filteredResults.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'relevance':
        default:
          // 默认按相关度排序，这里只是模拟
          break;
      }
    },
    getTypeLabel(type) {
      const labels = {
        'products': '商品',
        'pets': '宠物',
        'services': '服务'
      };
      return labels[type] || type;
    },
    viewProduct(id) {
      this.$router.push(`/product/${id.replace('product-', '')}`);
    },
    viewPet(id) {
      this.$router.push(`/pets`);
      // 在实际应用中，可能需要滚动到特定宠物或打开详情
    },
    bookService(id) {
      this.$router.push('/booking');
    },
    handleImageError(event) {
      // 当图片加载失败时，隐藏整个结果项
      const resultItem = event.target.closest('.result-item');
      if (resultItem) {
        resultItem.style.display = 'none';
      }
    }
  }
}
</script>

<style scoped>
.search-results-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.search-info h1 {
  margin: 0 0 10px 0;
  color: #333;
}

.search-info p {
  margin: 5px 0;
  color: #666;
}

.search-filters {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-weight: bold;
  color: #555;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
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

.results-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.result-item {
  display: flex;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.result-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.result-image {
  width: 200px;
  height: 200px;
  flex-shrink: 0;
}

.result-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.result-type {
  margin-bottom: 10px;
}

.type-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.type-badge.products {
  background-color: #4CAF50;
}

.type-badge.pets {
  background-color: #FF9800;
}

.type-badge.services {
  background-color: #2196F3;
}

.result-title {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}

.result-description {
  margin: 0 0 15px 0;
  color: #666;
  flex: 1;
}

.result-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.price {
  font-weight: bold;
  color: #e74c3c;
  font-size: 16px;
}

.location, .duration {
  color: #666;
  font-size: 14px;
}

.result-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #3a7bc8;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 30px;
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background-color: white;
  cursor: pointer;
  border-radius: 4px;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  padding: 0 10px;
  color: #666;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
  text-align: center;
}

.no-results i {
  font-size: 48px;
  color: #ccc;
  margin-bottom: 20px;
}

.no-results h3 {
  margin: 0 0 10px 0;
  color: #666;
}

.no-results p {
  margin: 0 0 20px 0;
  color: #999;
}

@media (max-width: 768px) {
  .search-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .result-item {
    flex-direction: column;
  }
  
  .result-image {
    width: 100%;
    height: 200px;
  }
}
</style>