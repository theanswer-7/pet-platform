<template>
  <div class="service-page">
    <!-- 页面头部 -->
    <section class="service-hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">上门喂养陪护服务</h1>
          <p class="hero-subtitle">填写信息，我们的专业团队将尽快与您联系，确认服务细节</p>
          <div class="hero-stats">
            <div class="stat-item">
              <div class="stat-number">安全保障</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">灵活预约</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">专业团队</div>
            </div>
          </div>
          <router-link to="/booking" class="btn btn-primary btn-lg booking-cta-btn">
            <i class="fas fa-calendar-check"></i> 立即预约服务
          </router-link>
        </div>
        <div class="hero-image">
          <img src="http://www.lodapet.com/images/mgk6v1t9-zjeo3mu.png" alt="宠物上门服务">
        </div>
      </div>
    </section>

    <!-- 服务详情 -->
    <section class="service-details">
      <div class="container">
        <h2 class="section-title">我们的服务项目</h2>
        
        <div class="service-tabs">
          <div class="tab-nav">
            <button 
              v-for="(tab, index) in serviceTabs" 
              :key="index" 
              class="tab-btn"
              :class="{ active: activeTab === index }"
              @click="activeTab = index">
              {{ tab.title }}
            </button>
          </div>
          
          <div class="tab-content">
            <div v-for="(tab, index) in serviceTabs" :key="index" class="tab-pane" :class="{ active: activeTab === index }">
              <div class="service-detail">
                <div class="service-detail-image">
                  <img :src="tab.image" :alt="tab.title" @error="handleImageError">
                </div>
                <div class="service-detail-content">
                  <h3>{{ tab.title }}</h3>
                  <p>{{ tab.description }}</p>
                  
                  <div class="service-features">
                    <h4>服务内容</h4>
                    <ul>
                      <li v-for="(feature, idx) in tab.features" :key="idx">
                        <i class="fas fa-check-circle"></i>
                        <span>{{ feature }}</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div class="service-pricing">
                    <h4>价格方案</h4>
                    <div class="pricing-options">
                      <div v-for="(price, idx) in tab.pricing" :key="idx" class="price-option">
                        <div class="price-name">{{ price.name }}</div>
                        <div class="price-value">¥{{ price.value }}</div>
                        <div class="price-desc">{{ price.desc }}</div>
                      </div>
                    </div>
                    <div class="service-booking">
                      <router-link to="/booking" class="service-booking-btn">
                        <i class="fas fa-calendar-check"></i> 立即预约此服务
                      </router-link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 服务流程 -->
    <section class="service-process">
      <div class="container">
        <h2 class="section-title">服务流程</h2>
        
        <div class="process-steps">
          <div v-for="(step, index) in processSteps" :key="index" class="process-step">
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-icon">
              <img :src="step.icon" :alt="step.title">
            </div>
            <h4>{{ step.title }}</h4>
            <p>{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 预约服务CTA区域 -->
    <section class="booking-cta-section">
      <div class="container">
        <div class="booking-cta-content">
          <h2>上门喂养陪护服务</h2>
          <p>专业团队，贴心服务，让您出行无忧，爱宠在家也能享受无微不至的关怀</p>
          <div class="booking-features">
            <div class="feature-item">
              <div class="stat-number">1000+</div>
              <div class="stat-label">满意客户</div>
            </div>
            <div class="feature-item">
              <div class="stat-number">50+</div>
              <div class="stat-label">专业看护师</div>
            </div>
            <div class="feature-item">
              <div class="stat-number">99%</div>
              <div class="stat-label">好评率</div>
            </div>
          </div>
        

        
        </div>
      </div>
    </section>


  </div>
</template>

<script>
export default {
  name: 'ServicePage',
  data() {
    return {
      activeTab: 0,
      serviceTabs: [
        {
          title: '专业看护师上门照料',
          image: '/images/pet8.png',
          description: '当您外出时，我们的专业看护师将上门照料您的爱宠，提供喂食，陪伴，玩耍及基本清洁。让您的爱宠在熟悉的环境中享受贴心照顾。',
          features: [
            '定时喂食和换水',
            '陪伴玩耍互动',
            '清理猫砂盆或宠物区域',
            '观察宠物健康状况',
            '发送宠物状态照片和视频',
            '紧急情况及时联系主人'
          ],
          pricing: [
            { name: '单次服务', value: '80', desc: '2小时上门服务' },
            { name: '半天服务', value: '150', desc: '4小时上门服务' },
            { name: '全天服务', value: '280', desc: '8小时上门服务' }
          ]
        },
        {
          title: '专业遛狗服务',
          image: 'http://www.lodapet.com/images/mgk6v1t9-gkggjl9.png',
          description: '经验丰富的遛狗师将根据您的宠物需求，提供安全，愉快的户外活动，确保它们每日的运动量。让您的爱宠保持健康活力。',
          features: [
            '安全遛狗装备',
            '根据宠物需求定制路线',
            '户外活动安全保障',
            '清理宠物排泄物',
            '记录遛狗过程和宠物状态',
            '提供遛狗报告'
          ],
          pricing: [
            { name: '单次遛狗', value: '50', desc: '30分钟遛狗服务' },
            { name: '标准遛狗', value: '70', desc: '60分钟遛狗服务' },
            { name: '长时遛狗', value: '100', desc: '90分钟遛狗服务' }
          ]
        },
        {
          title: '个性定制项目',
          image: 'http://www.lodapet.com/images/mgk6v1t9-sgznhxr.png',
          description: '根据您的特殊需求，提供个性化的宠物方案，满足您的独特期望，确保无微不至的关怀。我们为每只宠物量身定制专属服务。',
          features: [
            '一对一专属服务方案',
            '特殊需求定制',
            '长期照顾计划',
            '宠物训练指导',
            '医疗协助服务',
            '24小时紧急联系'
          ],
          pricing: [
            { name: '基础定制', value: '200', desc: '单次个性化服务' },
            { name: '周套餐', value: '800', desc: '一周定制服务' },
            { name: '月套餐', value: '2800', desc: '一个月定制服务' }
          ]
        }
      ],
      processSteps: [
        {
          title: '在线预约',
          description: '填写预约表单，选择服务类型和时间',
          icon: 'https://cdn-icons-png.flaticon.com/512/3239/3239945.png'
        },
        {
          title: '确认订单',
          description: '我们的客服将在24小时内与您联系，确认服务细节',
          icon: 'https://tse2-mm.cn.bing.net/th/id/OIP-C.0aGDfNxyepn3KrR8UhDRIAHaH_?w=196&h=212&c=7&r=0&o=7&cb=ucfimg2&dpr=1.5&pid=1.7&rm=3&ucfimg=1'
        },
        {
          title: '专业服务',
          description: '专业看护师按时上门，提供贴心服务',
          icon: 'https://tse2-mm.cn.bing.net/th/id/OIP-C.wbgNpwEyPqY2bqBzwOSoDAAAAA?w=171&h=180&c=7&r=0&o=7&cb=ucfimg2&dpr=1.5&pid=1.7&rm=3&ucfimg=1'
        },
        {
          title: '服务反馈',
          description: '服务完成后，您将收到详细的服务报告和照片',
          icon: 'https://tse1-mm.cn.bing.net/th/id/OIP-C.i6CLCewSg16yqeyNOuoPLgHaHa?w=188&h=188&c=7&r=0&o=7&cb=ucfimg2&dpr=1.5&pid=1.7&rm=3&ucfimg=1'
        }
      ],


    }
  },
  methods: {
    handleImageError(event) {
      // 当图片加载失败时，隐藏整个服务选项卡
      const serviceTab = event.target.closest('.service-tab');
      if (serviceTab) {
        serviceTab.style.display = 'none';
      }
    }
  }
}
</script>

<style scoped>
.service-page {
  padding-top: 0; /* 为导航栏留出空间 */
}

/* 页面头部样式 */
.service-hero {
  background: linear-gradient(135deg, #5D9CEC 0%, #73D13D 100%);
  color: white;
  padding: 30px 0 30px 0;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
}

.service-hero .container {
  display: flex;
  align-items: center;
  gap: 50px;
}

.hero-content {
  flex: 1;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 20px;
  margin-bottom: 40px;
  opacity: 0.9;
  line-height: 1.6;
}

.hero-stats {
  display: flex;
  gap: 40px;
}

.stat-item {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 15px;
  backdrop-filter: blur(5px);
  transition: transform 0.3s ease;
  min-width: 120px;
  flex: 1;
}

.stat-item:hover {
  transform: translateY(-5px);
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 5px;
  white-space: nowrap;
}

.stat-label {
  font-size: 16px;
  opacity: 0.8;
}

.hero-image {
  flex: 1;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 服务详情样式 */
.service-details {
  padding: 50px 0;
}

.section-title {
  font-size: 36px;
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #5D9CEC, #73D13D);
  border-radius: 2px;
}

.service-tabs {
  max-width: 1000px;
  margin: 0 auto;
}

.tab-nav {
  display: flex;
  justify-content: center;
  margin-bottom: 25px;
  border-bottom: 1px solid #eee;
}

.tab-btn {
  background: none;
  border: none;
  padding: 15px 30px;
  font-size: 18px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  border-radius: 10px 10px 0 0;
}

.tab-btn.active {
  color: #5D9CEC;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 3px;
  background: #5D9CEC;
}

.tab-content {
  margin-top: 25px;
}

.tab-pane {
  display: none;
}

.tab-pane.active {
  display: block;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.service-detail {
  display: flex;
  gap: 40px;
  margin-bottom: 25px;
}

.service-detail-image {
  flex: 1;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.service-detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.service-detail-content {
  flex: 1;
}

.service-detail-content h3 {
  font-size: 28px;
  margin-bottom: 15px;
  color: #333;
}

.service-detail-content p {
  font-size: 16px;
  line-height: 1.6;
  color: #666;
  margin-bottom: 25px;
}

.service-features h4,
.service-pricing h4 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #333;
}

.service-features ul {
  list-style: none;
  padding: 0;
  margin-bottom: 30px;
}

.service-features li {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 16px;
  color: #555;
}

.service-features i {
  color: #73D13D;
  margin-right: 10px;
}

.pricing-options {
  display: flex;
  gap: 20px;
}

.price-option {
  flex: 1;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 15px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.price-option:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.price-name {
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
}

.price-value {
  font-size: 28px;
  font-weight: 700;
  color: #5D9CEC;
  margin-bottom: 5px;
}

.price-desc {
  font-size: 14px;
  color: #888;
}

.service-booking {
  margin-top: 30px;
  text-align: center;
}

.service-booking-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size:24px;
  font-weight: 600;
  padding: 16px 40px;
  background: linear-gradient(135deg, #5D9CEC 0%, #73D13D 100%);
  color: white;
  border-radius: 50px;
  box-shadow: 0 5px 15px rgba(93, 156, 236, 0.3);
  transition: all 0.3s ease;
  text-decoration: none;
}

.service-booking-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(93, 156, 236, 0.4);
}

/* 服务流程样式 */
.service-process {
  padding: 50px 0;
  background: #f8f9fa;
}

.process-steps {
  display: flex;
  justify-content: space-between;
  gap: 30px;
  max-width: 1000px;
  margin: 0 auto;
}

.process-step {
  flex: 1;
  text-align: center;
  position: relative;
}

.step-number {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 30px;
  background: linear-gradient(90deg, #5D9CEC, #73D13D);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  z-index: 1;
}

.step-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 3px solid #f0f0f0;
}

.step-icon img {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.process-step:hover .step-icon {
  transform: scale(1.1);
}

.process-step h4 {
  font-size: 20px;
  margin-bottom: 10px;
  color: #333;
}

.process-step p {
  font-size: 15px;
  color: #666;
  line-height: 1.5;
}

/* 预约CTA区域样式 */
.booking-cta-section {
  padding: 50px 0;
  background: linear-gradient(135deg, #5D9CEC 0%, #73D13D 100%);
  color: white;
  text-align: center;
  border-radius: 30px;
  margin: 0 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.booking-cta-content {
  max-width: 800px;
  margin: 0 auto;
}

.booking-cta-content h2 {
  font-size: 36px;
  margin-bottom: 20px;
}

.booking-cta-content p {
  font-size: 18px;
  margin-bottom: 40px;
  opacity: 0.9;
}

.booking-features {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 40px;
  background: rgba(255, 255, 255, 0.15);
  padding: 25px 30px;
  border-radius: 20px;
  backdrop-filter: blur(5px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.booking-features:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.feature-item i {
  font-size: 32px;
  opacity: 0.9;
}

.feature-item span {
  font-weight: 500;
}

.booking-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  padding: 15px 40px;
  background-color: white;
  color: #5D9CEC;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  text-decoration: none;
  margin-top: 30px;
}

.booking-cta-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}



/* 响应式设计 */
@media (max-width: 992px) {
  .service-hero .container {
    flex-direction: column;
    text-align: center;
  }
  
  .hero-stats {
    justify-content: center;
  }
  
  .service-detail {
    flex-direction: column;
  }
  
  .pricing-options {
    flex-direction: column;
  }
  
  .process-steps {
    flex-wrap: wrap;
  }
  
  .process-step {
    flex: 0 0 calc(50% - 15px);
  }
  
  .booking-container {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 36px;
  }
  
  .hero-subtitle {
    font-size: 18px;
  }
  
  .section-title {
    font-size: 28px;
  }
  
  .tab-nav {
    flex-direction: column;
    align-items: center;
  }
  
  .tab-btn {
    width: 100%;
    max-width: 300px;
  }
  
  .process-step {
    flex: 0 0 100%;
  }
  
  .booking-form {
    padding: 30px 20px;
  }
}
</style>