<template>
  <div class="stories-page">
    <!-- Hero Banner -->
    <section class="hero-banner">
      <div class="container">
        <div class="hero-content">
          <h2 class="hero-title">
            <span class="hero-title-text">幸福剧场</span>
            <span class="hero-title-emoji">📖</span>
          </h2>
          <p class="hero-description">
            每一个毛孩子都有属于自己的故事，每一份陪伴都值得被记录
          </p>
          <div class="hero-actions">
            <button class="btn btn-primary btn-lg hero-btn" @click="showSubmitForm = true">
              <i class="fas fa-pen"></i> 分享你的故事
              <span class="btn-emoji">✍️</span>
            </button>
          </div>
        </div>
        <div class="hero-image">
          <div class="hero-image-wrapper">
          
            <div class="hero-image-decoration">
              <span class="decoration-1">❤️</span>
              <span class="decoration-2">🐾</span>
              <span class="decoration-3">🌟</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 故事筛选 -->
    <section class="filter-section">
      <div class="container">
        <div class="filter-tabs">
          <button 
            class="filter-tab" 
            :class="{ active: activeFilter === 'all' }" 
            @click="activeFilter = 'all'"
          >
            <i class="fas fa-globe"></i> 全部故事
          </button>
          <button 
            class="filter-tab" 
            :class="{ active: activeFilter === 'dog' }" 
            @click="activeFilter = 'dog'"
          >
            <i class="fas fa-dog"></i> 狗狗故事
          </button>
          <button 
            class="filter-tab" 
            :class="{ active: activeFilter === 'cat' }" 
            @click="activeFilter = 'cat'"
          >
            <i class="fas fa-cat"></i> 猫咪故事
          </button>
          <button 
            class="filter-tab" 
            :class="{ active: activeFilter === 'adopted' }" 
            @click="activeFilter = 'adopted'"
          >
            <i class="fas fa-heart"></i> 领养成功
          </button>
        </div>
      </div>
    </section>

    <!-- 故事列表 -->
    <section class="stories-section">
      <div class="container">
        <div class="stories-grid">
          <div class="story-card" v-for="story in filteredStories" :key="story.id">
            <div class="story-header">
              <div class="story-author">
                <img :src="story.authorAvatar" :alt="story.authorName" class="author-avatar">
                <div class="author-info">
                  <h4>{{ story.authorName }}</h4>
                  <p class="story-date">{{ story.date }}</p>
                </div>
              </div>
              <div class="story-pet-type" :class="story.petType">
                {{ story.petType === 'dog' ? '🐶 狗狗' : '🐱 猫咪' }}
              </div>
            </div>
            
            <div class="story-content">
              <h3>{{ story.title }}</h3>
              <p class="story-excerpt">{{ story.excerpt }}</p>
              
              <div class="story-images" v-if="story.images && story.images.length">
                <img 
                  v-for="(image, index) in story.images.slice(0, 3)" 
                  :key="index" 
                  :src="image" 
                  :alt="`${story.title} 图片${index + 1}`"
                  class="story-image"
                  @click="openImageModal(image)"
                >
                <div v-if="story.images.length > 3" class="more-images">
                  +{{ story.images.length - 3 }}
                </div>
              </div>
              
              <div class="story-pet-info">
                <div class="pet-avatar">
                  <img :src="story.petImage" :alt="story.petName">
                </div>
                <div class="pet-details">
                  <h4>{{ story.petName }}</h4>
                  <p>{{ story.petBreed }} · {{ story.petAge }}</p>
                </div>
              </div>
            </div>
            
            <div class="story-footer">
              <div class="story-stats">
                <button class="stat-btn" @click="likeStory(story.id)">
                  <i class="fas fa-heart" :class="{ liked: story.liked }"></i> 
                  {{ story.likes }}
                </button>
                <button class="stat-btn">
                  <i class="fas fa-comment"></i> 
                  {{ story.comments }}
                </button>
                <button class="stat-btn" @click="shareStory(story.id)">
                  <i class="fas fa-share"></i> 
                  分享
                </button>
              </div>
              <button class="read-more-btn" @click="openStoryDetail(story.id)">
                阅读全文 <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
        
       
      </div>
    </section>

    <!-- 提交故事表单弹窗 -->
    <div class="modal-overlay" v-if="showSubmitForm" @click="showSubmitForm = false">
      <div class="modal-container submit-form" @click.stop>
        <div class="modal-header">
          <h3>分享你的宠物故事</h3>
          <button class="close-btn" @click="showSubmitForm = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitStory">
            <div class="form-group">
              <label for="storyTitle">故事标题</label>
              <input type="text" id="storyTitle" v-model="newStory.title" required>
            </div>
            
            <div class="form-group">
              <label for="petName">宠物名字</label>
              <input type="text" id="petName" v-model="newStory.petName" required>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="petType">宠物类型</label>
                <select id="petType" v-model="newStory.petType" required>
                  <option value="dog">狗狗</option>
                  <option value="cat">猫咪</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="petBreed">品种</label>
                <input type="text" id="petBreed" v-model="newStory.petBreed" required>
              </div>
            </div>
            
            <div class="form-group">
              <label for="storyContent">故事内容</label>
              <textarea id="storyContent" v-model="newStory.content" rows="6" required></textarea>
            </div>
            
            <div class="form-group">
              <label for="storyImages">上传图片</label>
              <div class="image-upload-area">
                <input type="file" id="storyImages" multiple accept="image/*" @change="handleImageUpload">
                <div class="upload-placeholder">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <p>点击或拖拽上传图片</p>
                </div>
                <div class="image-preview" v-if="newStory.imagePreviews.length">
                  <div 
                    v-for="(image, index) in newStory.imagePreviews" 
                    :key="index" 
                    class="preview-item"
                  >
                    <img :src="image" alt="预览">
                    <button type="button" class="remove-image" @click="removeImage(index)">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="showSubmitForm = false">
                取消
              </button>
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-paper-plane"></i> 发布故事
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 图片查看弹窗 -->
    <div class="modal-overlay" v-if="showImageModal" @click="showImageModal = false">
      <div class="image-modal" @click.stop>
        <button class="close-btn" @click="showImageModal = false">
          <i class="fas fa-times"></i>
        </button>
        <img :src="currentImage" alt="查看大图" class="modal-image">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StoriesView',
  data() {
    return {
      activeFilter: 'all',
      showSubmitForm: false,
      showImageModal: false,
      currentImage: '',
      hasMoreStories: true,
      stories: [
        {
          id: 1,
          authorName: '小王',
          authorAvatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=100&h=100&fit=crop&crop=face',
          date: '2023-10-15',
          title: '从流浪到温暖的家：小橘的逆袭之路',
          excerpt: '三个月前，我在小区楼下发现了这只瑟瑟发抖的小橘猫。它瘦得皮包骨头，眼神里满是恐惧。经过三个月的精心照料，它已经变成了一只健康活泼的小胖子...',
          petName: '小橘',
          petType: 'cat',
          petBreed: '橘猫',
          petAge: '1岁',
          petImage: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop&crop=face',
          images: [
            'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop',
          ],
          likes: 128,
          comments: 23,
          liked: false
        },
        {
          id: 2,
          authorName: '李女士',
          authorAvatar: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.yTziUQz7qY_kvy2wIZSjJgAAAA?w=196&h=196&c=7&r=0&o=7&cb=ucfimg2&dpr=1.5&pid=1.7&rm=3&ucfimg=1',
          date: '2023-10-10',
          title: '金毛旺财：我生命中最忠诚的伙伴',
          excerpt: '旺财来到我们家已经五年了，从一只调皮捣蛋的小金毛，成长为一只稳重可靠的成年犬。它不仅是我们的宠物，更是家庭的一员，陪伴我们度过了许多难忘的时刻...',
          petName: '旺财',
          petType: 'dog',
          petBreed: '金毛寻回犬',
          petAge: '5岁',
          petImage: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&h=200&fit=crop&crop=face',
          images: [
            'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop',
          ],
          likes: 256,
          comments: 45,
          liked: true
        },
        {
          id: 3,
          authorName: '张先生',
          authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
          date: '2023-10-05',
          title: '救助流浪狗：一次改变生命的经历',
          excerpt: '那是一个雨夜，我在回家的路上发现了一只被遗弃的泰迪。它浑身湿透，瑟瑟发抖，眼神里充满了绝望。我决定带它回家，这个决定改变了我的一生...',
          petName: '小毛球',
          petType: 'dog',
          petBreed: '泰迪',
          petAge: '3岁',
          petImage: 'data:image/webp;base64,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',
          images: [
            'data:image/webp;base64,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',
            
          ],
          likes: 189,
          comments: 34,
          liked: false
        },
        {
          id: 4,
          authorName: '赵女士',
          authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
          date: '2023-09-28',
          title: '猫咪的治愈力量：陪伴我度过抑郁的日子',
          excerpt: '在我人生最低谷的时候，是这只名叫"奶茶"的英短猫给了我力量。它似乎能感知我的情绪，每当我难过时，它都会静静地趴在我身边，用它的方式安慰我...',
          petName: '奶茶',
          petType: 'cat',
          petBreed: '英国短毛猫',
          petAge: '2岁',
          petImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop&crop=face',
          images: [
            'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
          ],
          likes: 342,
          comments: 67,
          liked: true
        },
        {
          id: 5,
          authorName: '周先生',
          authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          date: '2023-09-20',
          title: '领养代替购买：我家的边牧"闪电"',
          excerpt: '闪电是一只被救助的边境牧羊犬，刚来我们家时非常胆怯，对人类充满了不信任。经过半年的耐心陪伴和训练，它已经变成了一只自信、聪明、充满活力的狗狗...',
          petName: '闪电',
          petType: 'dog',
          petBreed: '边境牧羊犬',
          petAge: '4岁',
          petImage: 'https://cn.bing.com/th?id=OPAC.OHwCPIi%2bvrNFXg474C474&o=5&pid=21.1&w=140&h=140&qlt=100&dpr=1.5&o=2&c=8&pcl=f5f5f5',
          images: [
          'https://cn.bing.com/th?id=OPAC.OHwCPIi%2bvrNFXg474C474&o=5&pid=21.1&w=140&h=140&qlt=100&dpr=1.5&o=2&c=8&pcl=f5f5f'
          ],
          likes: 167,
          comments: 29,
          liked: false
        },
        {
          id: 6,
          authorName: '吴女士',
          authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
          date: '2023-09-15',
          title: '老年猫的尊严：陪伴"老白"走完最后一程',
          excerpt: '老白是一只18岁的老年猫，它陪伴了我整个青春。当它步入老年，身体开始出现各种问题时，我决定用最好的方式陪伴它走完生命的最后一程...',
          petName: '老白',
          petType: 'cat',
          petBreed: '中华田园猫',
          petAge: '18岁',
          petImage: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=200&h=200&fit=crop&crop=face',
          images: [
            'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&h=300&fit=crop',
          ],
          likes: 423,
          comments: 89,
          liked: true
        }
      ],
      newStory: {
        title: '',
        petName: '',
        petType: 'dog',
        petBreed: '',
        content: '',
        images: [],
        imagePreviews: []
      }
    }
  },
  computed: {
    filteredStories() {
      if (this.activeFilter === 'all') {
        return this.stories;
      } else if (this.activeFilter === 'adopted') {
        return this.stories.filter(story => 
          story.title.includes('领养') || story.title.includes('救助') || story.title.includes('流浪')
        );
      } else {
        return this.stories.filter(story => story.petType === this.activeFilter);
      }
    }
  },
  methods: {
    likeStory(storyId) {
      const story = this.stories.find(s => s.id === storyId);
      if (story) {
        story.liked = !story.liked;
        story.likes += story.liked ? 1 : -1;
      }
    },
    shareStory(storyId) {
      // 实现分享功能
      alert('分享功能即将上线！');
    },
    openStoryDetail(storyId) {
      // 实现打开故事详情功能
      alert(`查看故事详情功能即将上线！故事ID: ${storyId}`);
    },
    openImageModal(image) {
      this.currentImage = image;
      this.showImageModal = true;
    },
    loadMoreStories() {
      // 模拟加载更多故事
      setTimeout(() => {
        this.hasMoreStories = false;
      }, 1000);
    },
    handleImageUpload(event) {
      const files = event.target.files;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (e) => {
          this.newStory.imagePreviews.push(e.target.result);
          this.newStory.images.push(file);
        };
        reader.readAsDataURL(file);
      }
    },
    removeImage(index) {
      this.newStory.imagePreviews.splice(index, 1);
      this.newStory.images.splice(index, 1);
    },
    submitStory() {
      // 实现提交故事功能
      alert('故事提交功能即将上线！');
      this.showSubmitForm = false;
      this.resetNewStory();
    },
    resetNewStory() {
      this.newStory = {
        title: '',
        petName: '',
        petType: 'dog',
        petBreed: '',
        content: '',
        images: [],
        imagePreviews: []
      };
    }
  }
}
</script>

<style scoped>
/* CSS变量定义 */
:root {
  --primary-blue: #4A90E2;
  --primary-light: #E6F7FF;
  --primary-dark: #2C5AA0;
  --accent-pink: #FF6B9D;
  --accent-yellow: #FFD166;
  --accent-green: #06D6A0;
  --text-primary: #333333;
  --text-light: #666666;
  --border-radius-sm: 12px;
  --border-radius-md: 20px;
  --border-radius-lg: 30px;
  --shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  --shadow-hover: 0 8px 30px rgba(0, 0, 0, 0.12);
  --transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* 全局样式 */
.stories-page {
  font-family: "Comic Sans MS", "Microsoft YaHei", sans-serif;
  color: var(--text-primary);
  background-color: #F8FBFF;
  min-height: 100vh;
  padding-bottom: 60px;
}

/* Hero Banner */
.hero-banner {
  padding: 60px 0;
  background: linear-gradient(135deg, #E6F7FF 0%, #D0E8FF 100%);
  border-radius: 0 0 40px 40px;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
}

.hero-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="20" cy="20" r="3" fill="%234A90E2" opacity="0.1"/><circle cx="80" cy="40" r="2" fill="%23FF6B9D" opacity="0.1"/><circle cx="40" cy="80" r="4" fill="%23FFD166" opacity="0.1"/></svg>');
  opacity: 0.3;
  z-index: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

.hero-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin-bottom: 40px;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--primary-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.hero-title-emoji {
  font-size: 42px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.hero-description {
  font-size: 20px;
  color: var(--text-light);
  max-width: 600px;
  margin-bottom: 30px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.hero-btn {
  background: linear-gradient(135deg, var(--primary-blue), var(--primary-dark));
  color: white;
  border: none;
  border-radius: 50px;
  padding: 15px 30px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
}

.hero-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
}

.btn-emoji {
  font-size: 20px;
}

.hero-image {
  display: flex;
  justify-content: center;
}

.hero-image-wrapper {
  position: relative;
  width: 100%;
  max-width: 800px;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-hover);
}

.hero-image-wrapper img {
  width: 100%;
  height: auto;
  display: block;
}

.hero-image-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.decoration-1, .decoration-2, .decoration-3 {
  position: absolute;
  font-size: 30px;
  animation: float 3s infinite ease-in-out;
}

.decoration-1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.decoration-2 {
  top: 20%;
  right: 15%;
  animation-delay: 0.5s;
}

.decoration-3 {
  bottom: 15%;
  left: 20%;
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

/* 筛选区域 */
.filter-section {
  margin-bottom: 40px;
}

.filter-tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-tab {
  background: white;
  border: 2px solid var(--primary-light);
  border-radius: 50px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-tab:hover {
  background: var(--primary-light);
}

.filter-tab.active {
  background: var(--primary-blue);
  color: white;
  border-color: var(--primary-blue);
}

/* 故事列表 */
.stories-section {
  margin-bottom: 40px;
}

.stories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
}

.story-card {
  background: white;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: var(--transition);
}

.story-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-hover);
}

.story-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 10px;
}

.story-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--primary-light);
}

.author-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.story-date {
  margin: 0;
  font-size: 14px;
  color: var(--text-light);
}

.story-pet-type {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.story-pet-type.dog {
  background: rgba(74, 144, 226, 0.1);
  color: var(--primary-blue);
}

.story-pet-type.cat {
  background: rgba(255, 107, 157, 0.1);
  color: var(--accent-pink);
}

.story-content {
  padding: 0 20px 20px;
}

.story-content h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
}

.story-excerpt {
  margin: 0 0 15px 0;
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-light);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.story-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 15px;
  position: relative;
}

.story-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: var(--transition);
}

.story-image:hover {
  transform: scale(1.05);
}

.more-images {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: calc(33.333% - 6px);
  height: 100px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  border-radius: var(--border-radius-sm);
}

.story-pet-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: var(--primary-light);
  border-radius: var(--border-radius-sm);
}

.pet-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid white;
}

.pet-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pet-details h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.pet-details p {
  margin: 0;
  font-size: 14px;
  color: var(--text-light);
}

.story-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-top: 1px solid #f0f0f0;
}

.story-stats {
  display: flex;
  gap: 15px;
}

.stat-btn {
  background: none;
  border: none;
  color: var(--text-light);
  font-size: 14px;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 5px;
}

.stat-btn:hover {
  color: var(--primary-blue);
}

.stat-btn i.liked {
  color: var(--accent-pink);
}

.read-more-btn {
  background: none;
  border: none;
  color: var(--primary-blue);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 5px;
}

.read-more-btn:hover {
  color: var(--primary-dark);
}

/* 加载更多 */
.load-more-container {
  text-align: center;
  margin-top: 40px;
}

.load-more-btn {
  background: white;
  color: var(--primary-blue);
  border: 2px solid var(--primary-blue);
  border-radius: 50px;
  padding: 12px 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.load-more-btn:hover {
  background: var(--primary-blue);
  color: white;
}

/* 提交故事表单 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: var(--border-radius-lg);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-hover);
}

.submit-form {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--primary-blue);
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--text-light);
  cursor: pointer;
  transition: var(--transition);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: var(--primary-light);
  color: var(--primary-blue);
}

.modal-body {
  padding: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-primary);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: var(--border-radius-sm);
  font-size: 16px;
  transition: var(--transition);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.image-upload-area {
  border: 2px dashed #e0e0e0;
  border-radius: var(--border-radius-sm);
  padding: 20px;
  text-align: center;
  position: relative;
  transition: var(--transition);
}

.image-upload-area:hover {
  border-color: var(--primary-blue);
}

.image-upload-area input[type="file"] {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  cursor: pointer;
}

.upload-placeholder i {
  font-size: 40px;
  color: var(--primary-light);
  margin-bottom: 10px;
}

.upload-placeholder p {
  margin: 0;
  color: var(--text-light);
}

.image-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.preview-item {
  position: relative;
  padding-top: 100%;
}

.preview-item img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--border-radius-sm);
}

.remove-image {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.btn {
  padding: 12px 24px;
  border-radius: var(--border-radius-sm);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  border: none;
}

.btn-primary {
  background: var(--primary-blue);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
}

.btn-secondary {
  background: #f0f0f0;
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: #e0e0e0;
}

/* 图片查看弹窗 */
.image-modal {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.image-modal .close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  width: 40px;
  height: 40px;
}

.modal-image {
  max-width: 100%;
  max-height: 80vh;
  border-radius: var(--border-radius-sm);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 36px;
  }
  
  .hero-description {
    font-size: 18px;
  }
  
  .hero-actions {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }
  
  .stories-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .story-footer {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
}
</style>