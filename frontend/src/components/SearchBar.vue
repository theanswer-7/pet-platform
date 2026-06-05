<template>
  <div class="search-bar">
    <div class="search-input-container">
      <input 
        type="text" 
        v-model="searchQuery" 
        @keyup.enter="performSearch" 
        @focus="showSuggestions = true"
        @blur="hideSuggestions"
        placeholder="搜索商品、宠物、服务..." 
        class="search-input"
      >
      <button @click="performSearch" class="search-button">
        <i class="fas fa-search"></i>
      </button>
    </div>
    
    <!-- 搜索建议 -->
    <div v-if="showSuggestions && (suggestions.length > 0 || searchHistory.length > 0)" class="search-suggestions">
      <div v-if="searchHistory.length > 0" class="search-history">
        <div class="suggestion-header">
          <span>搜索历史</span>
          <button @click="clearHistory" class="clear-history">清除</button>
        </div>
        <div 
          v-for="(item, index) in searchHistory" 
          :key="`history-${index}`" 
          @click="selectSuggestion(item)"
          class="suggestion-item history-item"
        >
          <i class="fas fa-history"></i>
          {{ item }}
        </div>
      </div>
      
      <div v-if="suggestions.length > 0" class="suggestions-list">
        <div class="suggestion-header">搜索建议</div>
        <div 
          v-for="(item, index) in suggestions" 
          :key="`suggestion-${index}`" 
          @click="selectSuggestion(item)"
          class="suggestion-item"
        >
          <i class="fas fa-search"></i>
          {{ item }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchBar',
  data() {
    return {
      searchQuery: '',
      showSuggestions: false,
      suggestions: [],
      searchHistory: []
    }
  },
  created() {
    // 从localStorage加载搜索历史
    const history = localStorage.getItem('searchHistory');
    if (history) {
      this.searchHistory = JSON.parse(history);
    }
  },
  methods: {
    performSearch() {
      if (!this.searchQuery.trim()) return;
      
      // 添加到搜索历史
      this.addToHistory(this.searchQuery);
      
      // 跳转到搜索结果页面
      this.$router.push({
        path: '/search',
        query: { q: this.searchQuery }
      });
      
      // 隐藏建议
      this.showSuggestions = false;
    },
    selectSuggestion(query) {
      this.searchQuery = query;
      this.performSearch();
    },
    addToHistory(query) {
      // 如果已存在，先移除
      const index = this.searchHistory.indexOf(query);
      if (index !== -1) {
        this.searchHistory.splice(index, 1);
      }
      
      // 添加到开头
      this.searchHistory.unshift(query);
      
      // 限制历史记录数量
      if (this.searchHistory.length > 10) {
        this.searchHistory = this.searchHistory.slice(0, 10);
      }
      
      // 保存到localStorage
      localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    },
    clearHistory() {
      this.searchHistory = [];
      localStorage.removeItem('searchHistory');
    },
    hideSuggestions() {
      // 延迟隐藏，以便点击建议项
      setTimeout(() => {
        this.showSuggestions = false;
      }, 200);
    }
  },
  watch: {
    searchQuery(newQuery) {
      if (newQuery.trim()) {
        // 模拟搜索建议
        // 在实际应用中，这里应该是一个API调用
        this.suggestions = [
          `${newQuery} 狗粮`,
          `${newQuery} 猫粮`,
          `${newQuery} 玩具`,
          `${newQuery} 宠物医院`,
          `${newQuery} 美容服务`
        ].slice(0, 5);
      } else {
        this.suggestions = [];
      }
    }
  }
}
</script>

<style scoped>
.search-bar {
  position: relative;
  width: 100%;
  max-width: 500px;
}

.search-input-container {
  display: flex;
  border: 1px solid #ddd;
  border-radius: 25px;
  overflow: hidden;
  background-color: white;
}

.search-input {
  flex: 1;
  padding: 10px 15px;
  border: none;
  outline: none;
  font-size: 14px;
}

.search-button {
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 0 15px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-button:hover {
  background-color: #3a7bc8;
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 15px;
  font-size: 12px;
  color: #666;
  background-color: #f5f5f5;
  border-bottom: 1px solid #eee;
}

.clear-history {
  background: none;
  border: none;
  color: #4a90e2;
  cursor: pointer;
  font-size: 12px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background-color: #f5f5f5;
}

.suggestion-item i {
  margin-right: 10px;
  color: #999;
}

.history-item i {
  color: #4a90e2;
}
</style>