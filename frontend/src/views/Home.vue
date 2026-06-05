<template>
  <div class="home-page">
    <!-- Hero Banner - 更卡通风格 -->
    <section class="hero-banner">
      <div class="container">
        <div class="hero-content">
          <h2 class="hero-title">
            <span class="hero-title-text">给毛孩子一个暖暖的家</span>
            <span class="hero-title-emoji">🏠</span>
          </h2>
          <p class="hero-description">
            在这里，遇见你命中注定的"它"，开启一段满是爪印与欢笑的旅程！
          </p>
          <div class="hero-actions">
            <router-link to="/pets" class="btn btn-primary btn-lg hero-btn">
              <i class="fas fa-paw"></i> 立即领养
              <span class="btn-emoji">🐶</span>
            </router-link>
            <router-link to="/mall" class="btn btn-secondary btn-lg hero-btn">
              <i class="fas fa-shopping-cart"></i> 逛逛商城
              <span class="btn-emoji">🛒</span>
            </router-link>
          </div>
        </div>
        <div class="hero-carousel">
          <div class="carousel-container">
            <div class="carousel-slide" v-for="(slide, index) in carouselSlides" :key="index" :class="{ active: currentSlide === index }">
              <img :src="slide.image" :alt="slide.alt" @error="handleSlideImageError">
            </div>
            <div class="carousel-indicators">
              <span v-for="(slide, index) in carouselSlides" :key="index" 
                    class="indicator" 
                    :class="{ active: currentSlide === index }"
                    @click="goToSlide(index)"></span>
            </div>
            <button class="carousel-control prev" @click="prevSlide">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="carousel-control next" @click="nextSlide">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 上门服务区域 -->
    <section class="service-section">
      <div class="container">
        <div class="section-header">
          <h3 class="section-title">
            <span class="title-icon">🏠</span>
            上门喂养陪护服务
          </h3>
          <p class="section-subtitle">专业团队，贴心服务，让您出行无忧</p>
        </div>
        
        <div class="service-grid">
          <!-- 专业看护师上门照料 -->
          <div class="service-card">
            <div class="service-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#5D9CEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 22V12H15V22" stroke="#5D9CEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h4 class="service-title">看护服务</h4>
            <p class="service-description">当您外出时，我们的专业看护师将上门照料您的爱宠，提供喂食，陪伴，玩耍及基本清洁。</p>
            <ul class="service-features">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#73D13D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                专业喂食服务
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#73D13D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                陪伴玩耍互动
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#73D13D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                基本清洁护理
              </li>
            </ul>
            <router-link to="/service" class="service-btn">了解详情</router-link>
          </div>
          
          <!-- 专业遛狗服务 -->
          <div class="service-card">
            <div class="service-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- 人的轮廓 -->
                <circle cx="6" cy="6" r="2" stroke="#5D9CEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 8V14M6 14L4 18M6 14L8 18" stroke="#5D9CEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <!-- 牵引绳 -->
                <path d="M8 10L16 10" stroke="#5D9CEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <!-- 狗的轮廓 -->
                <circle cx="18" cy="6" r="2" stroke="#5D9CEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18 8V12M18 12L16 16M18 12L20 16" stroke="#5D9CEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 6H20" stroke="#5D9CEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <!-- 狗的尾巴 -->
                <path d="M20 8C21 8 22 9 22 10" stroke="#5D9CEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h4 class="service-title">遛狗服务</h4>
            <p class="service-description">经验丰富的遛狗师将根据您的宠物需求，提供安全，愉快的户外活动，确保它们每日的运动量。</p>
            <ul class="service-features">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#73D13D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                定时遛狗服务
              </li>
              <li>
                
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#73D13D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                户外安全保障
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#73D13D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                运动量科学规划
              </li>
            </ul>
            <router-link to="/service" class="service-btn">了解详情</router-link>
          </div>
          
          <!-- 个性定制项目 -->
          <div class="service-card">
            <div class="service-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#5D9CEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h4 class="service-title">定制服务</h4>
            <p class="service-description">根据您的特殊需求，提供个性化的宠物方案，满足您的独特期望，确保无微不至的关怀。</p>
            <ul class="service-features">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#73D13D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                个性化服务方案
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#73D13D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                特殊需求定制
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#73D13D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                一对一专属服务
              </li>
            </ul>
            <router-link to="/service" class="service-btn">了解详情</router-link>
          </div>
        </div>
        
        <div class="service-cta">
          <router-link to="/booking" class="btn btn-primary btn-lg">
            <i class="fas fa-calendar-check"></i> 立即预约服务
          </router-link>
        </div>
      </div>
    </section>

    <!-- 精选区域 - 添加更多卡通元素 -->
    <section class="featured-section">
      <div class="container">
        <div class="section-header">
          <h3 class="section-title">
            <span class="title-icon">❤️</span>
            快来Pick你心动的TA！
          </h3>
          <router-link to="/pets" class="view-all">
            查看更多毛孩子 <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>
        <div class="featured-grid">
          <div class="pet-card" v-for="pet in featuredPets" :key="pet.id">
            <div class="pet-image-wrapper">
              <img :src="pet.image" :alt="pet.name" class="pet-image" @error="handlePetImageError">
              <div class="pet-badge" :class="pet.type">
                {{ pet.type === 'dog' ? '🐶 狗狗' : '🐱 猫咪' }}
              </div>
              <div class="pet-heart">
                <i class="fas fa-heart"></i>
              </div>
            </div>
            <div class="pet-info">
              <h4>{{ pet.name }}</h4>
              <p class="pet-details">
                <span class="pet-age">{{ pet.age }}</span>
                <span class="pet-gender">
                  {{ pet.gender === 'male' ? '👦 小哥哥' : '👧 小姐姐' }}
                </span>
              </p>
              <div class="pet-tags">
                <span class="tag" v-for="tag in pet.tags" :key="tag">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="#73D13D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg> {{ tag }}
                </span>
              </div>
              <router-link to="/pets" class="pet-view-btn">
                认识{{ pet.name }} 
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#5D9CEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 保障区域 - 更卡通化 -->
    <section class="guarantee-section">
      <div class="container">
        <h3 class="section-title">
          <span class="title-icon">💙</span>
          我们的承诺
        </h3>
        <p class="section-subtitle">用心连接每一个需要家的它，和每一个充满爱的你</p>
        <div class="guarantee-grid">
          <div class="guarantee-item">
            <div class="guarantee-icon guarantee-icon-1">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" stroke="#5D9CEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 12L11 14L15 10" stroke="#5D9CEC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h4>正品保障</h4>
            <p>所有商品100%正品，假一赔十</p>
          </div>
          
          <div class="guarantee-item">
            <div class="guarantee-icon guarantee-icon-2">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="#FFA940" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M11.9955 13.7H12.0045M8.2945 13.7H8.3035M15.6965 13.7H15.7055" stroke="#FFA940" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h4>7天无忧</h4>
            <p>商品质量问题，7天无忧退换</p>
          </div>
          
          <div class="guarantee-item">
            <div class="guarantee-icon guarantee-icon-3">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" stroke="#73D13D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 14L11 17L16 10" stroke="#73D13D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h4>爱心捐赠</h4>
            <p>每笔消费部分金额用于流浪动物救助</p>
          </div>
          
          <div class="guarantee-item">
            <div class="guarantee-icon guarantee-icon-4">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 9V11C20 12.1 19.1 13 18 13H16C14.9 13 14 12.1 14 11V9C14 7.9 14.9 7 16 7H18C19.1 7 20 7.9 20 9Z" stroke="#FF6B9D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10 9V11C10 12.1 9.1 13 8 13H6C4.9 13 4 12.1 4 11V9C4 7.9 4.9 7 6 7H8C9.1 7 10 7.9 10 9Z" stroke="#FF6B9D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M20 16V18C20 19.1 19.1 20 18 20H16C14.9 20 14 19.1 14 18V16C14 14.9 14.9 14 16 14H18C19.1 14 20 14.9 20 16Z" stroke="#FF6B9D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10 16V18C10 19.1 9.1 20 8 20H6C4.9 20 4 19.1 4 18V16C4 14.9 4.9 14 6 14H8C9.1 14 10 14.9 10 16Z" stroke="#FF6B9D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M7 7V20" stroke="#FF6B9D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M17 7V13" stroke="#FF6B9D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h4>安全领养</h4>
            <p>完善的审核机制，确保毛孩子找到合适的家</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      currentSlide: 0,
      carouselInterval: null,
      carouselSlides: [
       
          {
          image: '/images/pet1.jpg',
          alt: '宠物领养'
        },
        {
          image: '/images/pet2.jpg',
          alt: '宠物领养'
        },
        {
          image: '/images/pet3.jpg',
          alt: '宠物领养'
        },
         {
          image: '/images/pet2.jpg',
          alt: '宠物领养'
        },
      ],
      featuredPets: [
        {
          id: 1,
          name: '旺财',
          type: 'dog',
          age: '2岁',
          gender: 'male',
          tags: ['温顺', '已驱虫', '已疫苗'],
          image: 'https://tse1-mm.cn.bing.net/th/id/OIP-C.WtwsB8j36k7g7eAJJgUGOwHaFj?w=284&h=213&c=7&r=0&o=7&cb=ucfimg2&dpr=1.5&pid=1.7&rm=3&ucfimg=1'
        },
        {
          id: 2,
          name: '咪咪',
          type: 'cat',
          age: '1岁',
          gender: 'female',
          tags: ['粘人', '已绝育', '健康'],
          image: 'https://tse1-mm.cn.bing.net/th/id/OIP-C.1gaQfdrXEPoBciEguVgY5QHaE3?w=278&h=183&c=7&r=0&o=7&cb=ucfimg2&dpr=1.5&pid=1.7&rm=3&ucfimg=1'
        },
        {
          id: 3,
          name: '小白',
          type: 'cat',
          age: '8个月',
          gender: 'female',
          tags: ['活泼', '爱玩', '健康'],
          image: 'https://tse1-mm.cn.bing.net/th/id/OIP-C.BLmbGRdu2T9okzVqWJh1sQHaFf?w=252&h=187&c=7&r=0&o=7&cb=ucfimg2&dpr=1.5&pid=1.7&rm=3&ucfimg=1'
        }
      ]
    }
  },
  mounted() {
    this.startCarousel();
  },
  beforeDestroy() {
    this.stopCarousel();
  },
  methods: {
    startCarousel() {
      this.carouselInterval = setInterval(() => {
        this.nextSlide();
      }, 5000);
    },
    stopCarousel() {
      if (this.carouselInterval) {
        clearInterval(this.carouselInterval);
      }
    },
    nextSlide() {
      this.currentSlide = (this.currentSlide + 1) % this.carouselSlides.length;
    },
    prevSlide() {
      this.currentSlide = (this.currentSlide - 1 + this.carouselSlides.length) % this.carouselSlides.length;
    },
    goToSlide(index) {
      this.currentSlide = index;
    },
    handleSlideImageError(event) {
      // 当轮播图片加载失败时，隐藏整个轮播项
      const slideItem = event.target.closest('.slide');
      if (slideItem) {
        slideItem.style.display = 'none';
      }
    },
    handlePetImageError(event) {
      // 当宠物图片加载失败时，使用默认图片
      event.target.src = 'https://via.placeholder.com/300x220?text=No+Image';
      event.target.onerror = null; // 防止无限循环
    }
  }
}
</script>

<style scoped>
.home-page {
  /* 首页容器 */
}

/* Hero Banner */
.hero-banner {
  background: linear-gradient(135deg, var(--primary-light) 0%, #E1F0FF 100%);
  padding: 80px 0;
  position: relative;
  overflow: hidden;
}

.hero-banner::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 30px 30px;
  opacity: 0.3;
}

.hero-banner .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 60px;
  position: relative;
  z-index: 1;
}

.hero-content {
  flex: 1;
}

.hero-title {
  font-size: 52px;
  margin-bottom: 20px;
  line-height: 1.2;
  display: flex;
  align-items: center;
  gap: 15px;
}

.hero-title-text {
  font-family: "Comic Sans MS", cursive;
  background: linear-gradient(135deg, var(--primary-blue), #FF6B9D);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-title-emoji {
  font-size: 48px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.hero-description {
  font-size: 20px;
  color: var(--text-light);
  margin-bottom: 40px;
  line-height: 1.8;
  max-width: 600px;
}

.hero-actions {
  display: flex;
  gap: 20px;
}

.hero-image {
  flex: 2.5;
}

.hero-image-wrapper {
  position: relative;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow);
  transform: perspective(1000px) rotateY(-5deg) rotateX(5deg);
  transition: var(--transition);
  min-height: 600px;
  max-height: 700px;
}

.hero-image-wrapper:hover {
  transform: perspective(1000px) rotateY(0) rotateX(0);
  box-shadow: var(--shadow-hover);
}

.hero-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: var(--border-radius-lg);
}

.hero-image-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.hero-image-decoration span {
  position: absolute;
  font-size: 24px;
  animation: float 3s ease-in-out infinite;
}

.decoration-1 {
  top: 20px;
  left: 20px;
  animation-delay: 0s;
}

.decoration-2 {
  top: 20px;
  right: 20px;
  animation-delay: 0.5s;
}

.decoration-3 {
  bottom: 20px;
  right: 40px;
  animation-delay: 1s;
}

/* 功能区域 */
.features-section {
  padding: 80px 0;
}

.section-title {
  font-size: 36px;
  text-align: center;
  margin-bottom: 50px;
  font-family: "Comic Sans MS", cursive;
  color: var(--text-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.title-icon {
  font-size: 32px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.feature-card {
  background: white;
  border-radius: var(--border-radius-md);
  padding: 30px;
  text-align: center;
  text-decoration: none;
  color: var(--text-dark);
  transition: var(--transition);
  border: 2px solid var(--primary-light);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-blue), var(--accent-pink));
}

.feature-card:hover {
  transform: translateY(-10px) scale(1.02);
  border-color: var(--primary-blue);
  box-shadow: var(--shadow-hover);
}

.feature-icon {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 36px;
  transition: var(--transition);
}

.feature-icon-1 {
  background: linear-gradient(135deg, #E6F7FF, #BAE7FF);
  color: var(--primary-blue);
}

.feature-icon-2 {
  background: linear-gradient(135deg, #FFF7E6, #FFE7BA);
  color: #FFA940;
}

.feature-icon-3 {
  background: linear-gradient(135deg, #F6FFED, #D9F7BE);
  color: #73D13D;
}

.feature-icon-4 {
  background: linear-gradient(135deg, #FFF0F6, #FFD6E7);
  color: #FF85C0;
}

.feature-card h4 {
  font-size: 22px;
  margin-bottom: 10px;
  font-family: "Comic Sans MS", cursive;
}

.feature-card p {
  color: var(--text-light);
  line-height: 1.6;
  margin-bottom: 20px;
}

.feature-arrow {
  opacity: 0;
  transform: translateX(-10px);
  transition: var(--transition);
  color: var(--primary-blue);
}

.feature-card:hover .feature-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* 精选区域 */
.featured-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #F0F7FF 0%, #E6F2FF 100%);
  border-radius: 40px;
  margin: 40px 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.view-all {
  color: var(--primary-blue);
  text-decoration: none;
  font-weight: 600;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 10px 20px;
  border-radius: 50px;
  border: 2px solid var(--primary-light);
}

.view-all:hover {
  color: var(--primary-dark);
  background: var(--primary-light);
  transform: translateX(5px);
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.pet-card {
  background: white;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: var(--transition);
  cursor: pointer;
  position: relative;
}

.pet-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--shadow-hover);
}

.pet-image-wrapper {
  position: relative;
  height: 220px;
  overflow: hidden;
}

.pet-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition);
}

.pet-card:hover .pet-image {
  transform: scale(1.1);
}

.pet-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  padding: 6px 15px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.pet-badge.dog {
  background: rgba(93, 156, 236, 0.9);
  color: white;
}

.pet-badge.cat {
  background: rgba(255, 107, 157, 0.9);
  color: white;
}

.pet-heart {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FF6B9D;
  cursor: pointer;
  transition: var(--transition);
}

.pet-heart:hover {
  background: white;
  transform: scale(1.2);
}

.pet-info {
  padding: 20px;
}

.pet-info h4 {
  font-size: 20px;
  margin-bottom: 10px;
  font-family: "Comic Sans MS", cursive;
}

.pet-details {
  color: var(--text-light);
  font-size: 14px;
  margin-bottom: 15px;
  display: flex;
  gap: 15px;
}

.pet-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.tag {
  background: var(--primary-light);
  color: var(--primary-blue);
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.tag svg {
  width: 14px;
  height: 14px;
}

.pet-view-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--primary-blue);
  text-decoration: none;
  font-weight: 600;
  padding: 8px 20px;
  border: 2px solid var(--primary-blue);
  border-radius: 20px;
  transition: var(--transition);
  font-size: 14px;
}

.pet-view-btn svg {
  width: 14px;
  height: 14px;
  transition: transform 0.3s ease;
}

.pet-view-btn:hover svg {
  transform: translateX(2px);
}

.pet-view-btn:hover {
  background: var(--primary-blue);
  color: white;
  transform: translateX(5px);
}

/* 保障区域 */
.guarantee-section {
  padding: 80px 0;
}

.section-subtitle {
  text-align: center;
  color: var(--text-light);
  font-size: 18px;
  margin-bottom: 50px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.guarantee-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.guarantee-item {
  text-align: center;
  padding: 40px 30px;
  border-radius: var(--border-radius-md);
  background: white;
  box-shadow: var(--shadow);
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.guarantee-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent, rgba(93, 156, 236, 0.1));
  opacity: 0;
  transition: var(--transition);
}

.guarantee-item:hover::before {
  opacity: 1;
}

.guarantee-item:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-hover);
}

.guarantee-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 25px;
  font-size: 32px;
  position: relative;
  z-index: 1;
}

.guarantee-icon-1 {
  background: linear-gradient(135deg, #E6F7FF, #BAE7FF);
  color: var(--primary-blue);
  box-shadow: 0 8px 20px rgba(93, 156, 236, 0.3);
}

.guarantee-icon-2 {
  background: linear-gradient(135deg, #FFF7E6, #FFE7BA);
  color: #FFA940;
  box-shadow: 0 8px 20px rgba(255, 169, 64, 0.3);
}

.guarantee-icon-3 {
  background: linear-gradient(135deg, #F6FFED, #D9F7BE);
  color: #73D13D;
  box-shadow: 0 8px 20px rgba(115, 209, 61, 0.3);
}

.guarantee-icon-4 {
  background: linear-gradient(135deg, #FFF0F6, #FFD6E7);
  color: #FF85C0;
  box-shadow: 0 8px 20px rgba(255, 133, 192, 0.3);
}

.guarantee-item h4 {
  font-size: 20px;
  margin-bottom: 12px;
  font-family: "Comic Sans MS", cursive;
  position: relative;
  z-index: 1;
}

.guarantee-item p {
  color: var(--text-light);
  font-size: 15px;
  line-height: 1.6;
  position: relative;
  z-index: 1;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .hero-banner .container {
    flex-direction: column;
    text-align: center;
  }
  
  .hero-title {
    flex-direction: column;
    gap: 10px;
  }
  
  .hero-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 36px;
  }
  
  .hero-description {
    font-size: 18px;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-btn {
    width: 100%;
    max-width: 300px;
    margin: 10px 0;
  }
  
  .features-grid,
  .featured-grid,
  .guarantee-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 30px;
  }
  
  .section-title {
    font-size: 28px;
  }
  
  .feature-card,
  .guarantee-item {
    padding: 25px 20px;
  }
}


/* 轮播图样式 */
.hero-carousel {
  flex: 2.5;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  position: relative;
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 1s ease-in-out;
}

.carousel-slide.active {
  opacity: 1;
}

.carousel-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 15px;
  z-index: 10;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  border-radius: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.indicator {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.indicator::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 6px;
  height: 6px;
  background-color: var(--primary-blue);
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.indicator.active {
  background-color: white;
  transform: scale(1.2);
  box-shadow: 0 0 10px rgba(93, 156, 236, 0.7);
}

.indicator.active::before {
  transform: translate(-50%, -50%) scale(1);
}

.indicator:hover {
  background-color: rgba(255, 255, 255, 0.7);
  transform: scale(1.1);
}

.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  color: var(--primary-blue);
  border: none;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  z-index: 10;
}

.carousel-control:hover {
  background: linear-gradient(135deg, rgba(93, 156, 236, 0.9), rgba(93, 156, 236, 0.7));
  color: white;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 6px 20px rgba(93, 156, 236, 0.4);
}

.carousel-control.prev {
  left: 20px;
}

.carousel-control.next {
  right: 20px;
}

.carousel-control i {
  transition: transform 0.3s ease;
}

.carousel-control:hover i {
  transform: scale(1.2);
}

/* 上门服务区域样式 */
.service-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9f5ff 100%);
  position: relative;
  overflow: hidden;
}

.service-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235d9cec' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.5;
}

.service-section .container {
  position: relative;
  z-index: 1;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-bottom: 50px;
}

.service-card {
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.service-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 8px;
  background: linear-gradient(90deg, #5D9CEC, #73D13D);
}

.service-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

.service-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 25px;
  background: linear-gradient(135deg, rgba(93, 156, 236, 0.1), rgba(115, 209, 61, 0.1));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.service-card:hover .service-icon {
  transform: scale(1.1);
  background: linear-gradient(135deg, rgba(93, 156, 236, 0.2), rgba(115, 209, 61, 0.2));
}

.service-icon svg {
  width: 40px;
  height: 40px;
  transition: all 0.3s ease;
}

.service-icon svg path {
  transition: all 0.3s ease;
}

.service-card:hover .service-icon svg path {
  stroke: #73D13D;
}

.service-card:hover .service-icon i {
  color: #73D13D;
}

.service-img {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.service-title {
  font-size: 22px;
  font-weight: 700;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
  transition: color 0.3s ease;
}

.service-card:hover .service-title {
  color: var(--primary-blue);
}

.service-description {
  font-size: 16px;
  line-height: 1.6;
  color: #666;
  margin-bottom: 20px;
  text-align: center;
  flex-grow: 1;
}

.service-features {
  list-style: none;
  padding: 0;
  margin: 0 0 25px;
}

.service-features li {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 15px;
  color: #555;
}

.service-features svg {
  color: #73D13D;
  margin-right: 10px;
  font-size: 14px;
  vertical-align: middle;
}

.service-btn {
  display: inline-block;
  background: linear-gradient(90deg, var(--primary-blue), #73D13D);
  color: white;
  padding: 12px 25px;
  border-radius: 30px;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s ease;
  text-decoration: none;
  margin: 0 auto;
  width: fit-content;
}

.service-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(93, 156, 236, 0.3);
  color: white;
}

.service-cta {
  text-align: center;
  margin-top: 20px;
}

.service-cta .btn {
  background: linear-gradient(90deg, var(--primary-blue), #73D13D);
  border: none;
  padding: 15px 40px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 50px;
  box-shadow: 0 10px 25px rgba(93, 156, 236, 0.25);
  transition: all 0.3s ease;
}

.service-cta .btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(93, 156, 236, 0.35);
}

/* 响应式调整 */
@media (max-width: 992px) {
  .service-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 25px;
  }
}

@media (max-width: 768px) {
  .service-section {
    padding: 60px 0;
  }
  
  .service-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .service-card {
    padding: 30px 25px;
  }
  
  .service-icon {
    width: 70px;
    height: 70px;
  }
  
  .service-img {
    width: 40px;
    height: 40px;
  }
  
  .service-title {
    font-size: 20px;
  }
  
  .service-description {
    font-size: 15px;
  }
}
</style>