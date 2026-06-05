<template>
  <div class="login-page">
    <!-- 背景装饰元素 -->
    <div class="bg-decorations">
      <div class="deco-cloud-1">☁️</div>
      <div class="deco-cloud-2">☁️</div>
      <div class="deco-paw-1">🐾</div>
      <div class="deco-paw-2">🐾</div>
      <div class="deco-heart">❤️</div>
      <div class="deco-bone">🦴</div>
      <div class="deco-cat">🐱</div>
      <div class="deco-dog">🐶</div>
    </div>
    
    <!-- 登录主容器 - 一人一半布局 -->
    <div class="login-container">
      <!-- 左侧：登录表单 -->
      <div class="login-left">
        <div class="login-card">
          <!-- 返回按钮 -->
          <router-link to="/" class="back-home-btn">
            <i class="fas fa-arrow-left"></i> 返回首页
          </router-link>
          
          <!-- 登录头部 -->
          <div class="login-header">
            <div class="login-icon">
              <i class="fas fa-user-circle"></i>
            </div>
            <h1 class="login-title">
              <span class="title-text">欢迎登录宠乐汇</span>
              <span class="title-emoji">🐾</span>
            </h1>
            <p class="login-subtitle">开启你的加密核心爱心之旅 🔐</p>
          </div>
          
          <!-- 登录表单 -->
          <form @submit.prevent="handleLogin" class="login-form">
            <!-- 邮箱输入 -->
            <div class="form-group">
              <label for="email" class="form-label">
                <i class="fas fa-envelope"></i> 邮箱地址
              </label>
              <div class="input-wrapper">
                <input
                  type="email"
                  id="email"
                  v-model="form.email"
                  placeholder="1353918544@qq.com"
                  required
                  class="form-input"
                  :disabled="loading"
                />
                <span class="input-icon">
                  <i class="fas fa-at"></i>
                </span>
              </div>
            </div>
            
            <!-- 密码输入 -->
            <div class="form-group">
              <label for="password" class="form-label">
                <i class="fas fa-lock"></i> 密码
              </label>
              <div class="input-wrapper">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  v-model="form.password"
                  placeholder="输入你的秘密密码..."
                  required
                  class="form-input"
                  :disabled="loading"
                />
                <span class="input-icon">
                  <i class="fas fa-key"></i>
                </span>
                <button
                  type="button"
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                  tabindex="-1"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>
            
            <!-- 记住我 & 忘记密码 -->
            <div class="form-options">
              <label class="remember-me">
                <input type="checkbox" v-model="rememberMe" />
                <span class="custom-checkbox">
                  <i class="fas fa-check"></i>
                </span>
                记住我
              </label>
              <a href="#" class="forgot-password" @click.prevent="showForgotPassword">
                <i class="fas fa-question-circle"></i> 忘记密码？
              </a>
            </div>
            
            <!-- 登录按钮 -->
            <button type="submit" class="login-btn" :disabled="loading">
              <span v-if="!loading">
                <i class="fas fa-sign-in-alt"></i> 立即登录
              </span>
              <span v-else>
                <i class="fas fa-spinner fa-spin"></i> 登录中...
              </span>
            </button>
            
            <!-- 注册提示 -->
            <div class="register-prompt">
              还没有宠乐汇账号？
              <router-link to="/register" class="register-link">
                立即注册 <i class="fas fa-arrow-right"></i>
              </router-link>
            </div>
            
            <!-- 演示账号部分 -->
            
              
            
          </form>
          
          <!-- 登录成功提示 -->
          <transition name="slide-down">
            <div v-if="showSuccess" class="login-success">
              <div class="success-icon">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="success-content">
                <h3>登录成功！🎉</h3>
                <p>正在为您跳转到首页...</p>
              </div>
            </div>
          </transition>
        </div>
      </div>
      
      <!-- 右侧：社区介绍 -->
      <div class="login-right">
        <div class="community-card">
          <!-- 社区头部 -->
          <div class="community-header">
            <div class="community-logo">
              <span class="logo-emoji">🐾</span>
              <h2>加入宠乐汇社区</h2>
            </div>
            <div class="community-stats">
              <i class="fas fa-heartbeat"></i>
              已将超过 <span class="highlight">10,000</span> 只宠物找到了温暖的家
            </div>
          </div>
          
          <!-- 社区特色 -->
          <div class="community-features">
            <div class="feature-item">
              <div class="feature-icon">
                <i class="fas fa-heart"></i>
              </div>
              <div class="feature-content">
                <h3>免费领养宠物</h3>
                <p>爱心领养，让每一只流浪动物都有温暖的家</p>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">
                <i class="fas fa-shopping-bag"></i>
              </div>
              <div class="feature-content">
                <h3>正品宠物商城</h3>
                <p>精选优质宠物用品，保障毛孩子健康</p>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">
                <i class="fas fa-users"></i>
              </div>
              <div class="feature-content">
                <h3>爱心社区互动</h3>
                <p>与全国宠物爱好者分享快乐时光</p>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">
                <i class="fas fa-hands-helping"></i>
              </div>
              <div class="feature-content">
                <h3>志愿服务</h3>
                <p>参与流浪动物救助，让爱传递更远</p>
              </div>
            </div>
          </div>
          
          <!-- 统计数据 -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">10,000+</div>
              <div class="stat-label">成功领养</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">5,000+</div>
              <div class="stat-label">爱心家庭</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">3,000+</div>
              <div class="stat-label">社区伙伴</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">99%</div>
              <div class="stat-label">满意率</div>
            </div>
          </div>
          
          <!-- 社区宣言 -->
          <div class="community-manifesto">
            <div class="manifesto-content">
              <i class="fas fa-quote-left"></i>
              <p>我们相信，每一只宠物都值得被爱，每一个家庭都能找到最合适的伴侣。</p>
              <div class="manifesto-author">— 宠乐汇团队</div>
            </div>
          </div>
          
          <!-- 行动按钮 -->
          <div class="action-buttons">
            <router-link to="/register" class="action-btn join-btn">
              <i class="fas fa-user-plus"></i> 立即加入
            </router-link>
            <router-link to="/pets" class="action-btn browse-btn">
              <i class="fas fa-paw"></i> 浏览宠物
            </router-link>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 消息提示 -->
    <transition name="slide-up">
      <div v-if="showMessage" :class="['message-toast', messageType]">
        <i :class="messageIcon"></i>
        <span>{{ messageText }}</span>
      </div>
    </transition>
  </div>
</template>

<script>
import { useUserStore } from '@/stores/user'
import { authApi } from '@/api'

export default {
  name: 'LoginPage',
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      loading: false,
      showPassword: false,
      rememberMe: true,
      showSuccess: false,
      showMessage: false,
      messageText: '',
      messageType: 'info'
    }
  },
  computed: {
    messageIcon() {
      switch(this.messageType) {
        case 'success': return 'fas fa-check-circle'
        case 'error': return 'fas fa-exclamation-circle'
        case 'info': return 'fas fa-info-circle'
        default: return 'fas fa-info-circle'
      }
    }
  },
  mounted() {
    console.log('🚀 登录页面加载完成')
    
    // 检查是否已登录（更严格的验证）
    const userData = sessionStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        // 验证用户数据是否完整且有效
        if (user && user.id && user.email && user.token) {
          console.log('⚠️ 已登录，跳转到首页')
          this.$router.push('/')
          return
        } else {
          // 用户数据不完整，清除无效数据
          console.log('⚠️ 用户数据不完整，清除无效登录信息')
          sessionStorage.removeItem('user')
          sessionStorage.removeItem('token')
        }
      } catch (e) {
        // 用户数据格式错误，清除无效数据
        console.log('⚠️ 用户数据格式错误，清除无效登录信息')
        sessionStorage.removeItem('user')
        sessionStorage.removeItem('token')
      }
    }
    
    // 加载记住的邮箱
    const remembered = sessionStorage.getItem('rememberedLogin')
    if (remembered) {
      try {
        const data = JSON.parse(remembered)
        this.form.email = data.email || ''
      } catch (e) {
        console.error('解析记住的登录信息失败:', e)
      }
    }
  },
  methods: {
    async handleLogin() {
      console.log('🔐 开始登录...')
      
      // 表单验证
      if (!this.form.email || !this.form.password) {
        this.showToast('请输入邮箱和密码', 'error')
        return
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.form.email)) {
        this.showToast('请输入有效的邮箱地址', 'error')
        return
      }
      
      this.loading = true
      
      try {
        // 调用后端API进行登录验证
        const data = await authApi.login({
          email: this.form.email,
          password: this.form.password
        })
        
        // 验证用户数据完整性
        if (!data || !data.data || !data.data.userId || !data.data.email) {
          throw new Error('登录数据异常，请重新登录')
        }
        
        // 登录成功，保存用户信息
        const userData = {
          id: data.data.userId,
          userId: data.data.userId, // 同时保存userId字段
          username: data.data.username || data.data.email.split('@')[0],
          email: data.data.email,
          role: data.data.role || 'user',
          avatar: data.data.avatar || null,
          createdAt: data.data.created_at || new Date().toISOString(),
          token: data.data.token,
          isLogin: true
        }
        
        // 保存到sessionStorage
        sessionStorage.setItem('user', JSON.stringify(userData))
        sessionStorage.setItem('token', data.data.token)
        
        // 更新Pinia store中的用户状态
        const userStore = useUserStore()
        userStore.setUser(userData)
        userStore.setToken(data.data.token)
        
        console.log('💾 已保存用户数据:', userData)
        
        // 记住我功能
        if (this.rememberMe) {
          localStorage.setItem('rememberedLogin', JSON.stringify({
            email: this.form.email,
            timestamp: Date.now()
          }))
        } else {
          localStorage.removeItem('rememberedLogin')
        }
        
        // 触发全局登录事件
        window.dispatchEvent(new CustomEvent('user-login', {
          detail: userData
        }))
        
        this.showSuccess = true
        this.showToast(`欢迎回来，${userData.username}！🎉`, 'success')
        
        // 2秒后跳转到首页
        setTimeout(() => {
          console.log('🏠 跳转到首页...')
          this.$router.push('/')
        }, 2000)
        
      } catch (error) {
        console.error('❌ 登录失败:', error)
        this.showToast(error.message || '登录失败，请稍后重试', 'error')
      } finally {
        this.loading = false
      }
    },
    
    useDemoAccount(type) {
      if (type === 'demo1') {
        this.form.email = 'demo@chonglehui.com'
        this.form.password = '123456'
        this.showToast('已填入演示账号，点击登录按钮即可体验', 'info')
      }
    },
    
    showForgotPassword() {
      this.showToast('忘记密码功能开发中，请联系客服邮箱：support@chonglehui.com', 'info')
    },
    
    showToast(text, type = 'info') {
      this.messageText = text
      this.messageType = type
      this.showMessage = true
      
      setTimeout(() => {
        this.showMessage = false
      }, 3000)
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%);
  position: relative;
  overflow: hidden;
  font-family: var(--font-family-primary);
}

/* 背景装饰 */
.bg-decorations {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.bg-decorations div {
  position: absolute;
  font-size: 32px;
  opacity: 0.15;
  animation: float 20s infinite ease-in-out;
}

.deco-cloud-1 { top: 10%; left: 5%; animation-delay: 0s; }
.deco-cloud-2 { top: 20%; right: 10%; animation-delay: 2s; }
.deco-paw-1 { top: 40%; left: 8%; animation-delay: 1s; }
.deco-paw-2 { bottom: 30%; right: 8%; animation-delay: 3s; }
.deco-heart { top: 15%; right: 15%; animation-delay: 4s; }
.deco-bone { bottom: 20%; left: 12%; animation-delay: 5s; }
.deco-cat { top: 60%; left: 20%; animation-delay: 6s; }
.deco-dog { bottom: 40%; right: 20%; animation-delay: 7s; }

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0); }
  33% { transform: translateY(-20px) rotate(5deg); }
  66% { transform: translateY(10px) rotate(-5deg); }
}

/* 登录容器 - 一人一半布局 */
.login-container {
  flex: 1;
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 20px;
  position: relative;
  z-index: 1;
}

.login-left,
.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 40px);
}

/* 左侧登录表单 */
.login-card {
  background: var(--bg-primary);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-2xl);
  width: 100%;
  max-width: 500px;
  box-shadow: var(--shadow-xl);
  position: relative;
  overflow: hidden;
  border: 3px solid var(--border-color-light);
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary), var(--color-accent));
}

/* 返回按钮 */
.back-home-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6B7280;
  text-decoration: none;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(93, 156, 236, 0.1);
  transition: all 0.3s;
}

.back-home-btn:hover {
  background: rgba(93, 156, 236, 0.2);
  color: #5D9CEC;
  transform: translateX(-5px);
}

/* 登录头部 */
.login-header {
  text-align: center;
  margin: 30px 0 40px;
}

.login-icon {
  font-size: 60px;
  color: #5D9CEC;
  margin-bottom: 20px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.login-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  font-size: 32px;
  color: #2C3E50;
  margin-bottom: 10px;
  font-family: "Comic Sans MS", "微软雅黑", sans-serif;
}

.title-emoji {
  font-size: 40px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.login-subtitle {
  color: #7F8C8D;
  font-size: 16px;
  margin-bottom: 0;
}

/* 表单样式 */
.login-form {
  margin-top: var(--spacing-2xl);
}

.form-group {
  margin-bottom: var(--spacing-xl);
}

.form-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: var(--spacing-base) 50px var(--spacing-base) 50px;
  border: 2px solid var(--border-color-light);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-base);
  transition: var(--transition-base);
  background: var(--bg-secondary);
  font-family: var(--font-family-primary);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(93, 156, 236, 0.2);
  background: var(--bg-primary);
}

.form-input::placeholder {
  color: var(--text-secondary);
}

.input-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #5D9CEC;
  font-size: 18px;
}

.password-toggle {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94A3B8;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.3s;
}

.password-toggle:hover {
  background: rgba(93, 156, 236, 0.1);
  color: #5D9CEC;
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: #64748B;
  font-size: 14px;
  user-select: none;
}

.remember-me input {
  display: none;
}

.custom-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #CBD5E1;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.custom-checkbox i {
  opacity: 0;
  color: white;
  font-size: 12px;
  transition: all 0.3s;
}

.remember-me input:checked + .custom-checkbox {
  background: #5D9CEC;
  border-color: #5D9CEC;
}

.remember-me input:checked + .custom-checkbox i {
  opacity: 1;
}

.forgot-password {
  color: #5D9CEC;
  text-decoration: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}

.forgot-password:hover {
  color: #FF6B9D;
  transform: translateX(3px);
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  padding: var(--spacing-lg);
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  position: relative;
  overflow: hidden;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.login-btn:not(:disabled):active::after {
  width: 200px;
  height: 200px;
}

/* 注册提示 */
.register-prompt {
  text-align: center;
  margin: 25px 0;
  color: #64748B;
  font-size: 14px;
}

.register-link {
  color: #FF6B9D;
  text-decoration: none;
  font-weight: 600;
  margin-left: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}

.register-link:hover {
  color: #FF3D7F;
  transform: translateX(5px);
}

/* 演示账号部分 */
.demo-section {
  margin-top: 30px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(93, 156, 236, 0.1) 0%, rgba(255, 107, 157, 0.05) 100%);
  border-radius: 15px;
  border: 2px dashed rgba(93, 156, 236, 0.3);
}

.demo-header {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #5D9CEC;
  font-weight: 600;
  margin-bottom: 15px;
  font-size: 16px;
}

.demo-account {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.demo-account:hover {
  transform: translateY(-3px);
  border-color: #5D9CEC;
  box-shadow: 0 5px 15px rgba(93, 156, 236, 0.2);
}

.demo-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #5D9CEC, #4A7BC1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.demo-info {
  flex: 1;
}

.demo-email {
  font-weight: 600;
  color: #2C3E50;
  margin-bottom: 4px;
  font-family: monospace;
}

.demo-password {
  color: #64748B;
  font-size: 13px;
}

.demo-use-btn {
  padding: 8px 16px;
  background: rgba(93, 156, 236, 0.1);
  color: #5D9CEC;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}

.demo-account:hover .demo-use-btn {
  background: #5D9CEC;
  color: white;
}

/* 登录成功提示 */
.login-success {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  text-align: center;
  min-width: 300px;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translate(-50%, -60%);
}

.success-icon {
  font-size: 60px;
  color: #7EE081;
  margin-bottom: 20px;
  animation: bounce 2s infinite;
}

.success-content h3 {
  color: #2C3E50;
  margin-bottom: 10px;
}

.success-content p {
  color: #7F8C8D;
  font-size: 14px;
}

/* 右侧社区介绍 */
.community-card {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-2xl);
  width: 100%;
  max-width: 500px;
  border: 3px solid var(--border-color-light);
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-xl);
}

.community-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.community-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-base);
  margin-bottom: var(--spacing-lg);
}

.logo-emoji {
  font-size: var(--font-size-4xl);
}

.community-logo h2 {
  font-size: var(--font-size-3xl);
  color: var(--text-primary);
  font-family: var(--font-family-primary);
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.community-stats {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.community-stats .highlight {
  color: var(--color-secondary);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-2xl);
}

/* 社区特色 */
.community-features {
  margin-bottom: 40px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: white;
  border-radius: 15px;
  margin-bottom: 15px;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.feature-item:hover {
  transform: translateX(10px);
  border-color: #5D9CEC;
  box-shadow: 0 5px 20px rgba(93, 156, 236, 0.2);
}

.feature-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #5D9CEC, #4A7BC1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  flex-shrink: 0;
}

.feature-content h3 {
  color: #2C3E50;
  margin-bottom: 5px;
  font-size: 18px;
}

.feature-content p {
  color: #64748B;
  font-size: 14px;
  line-height: 1.5;
}

/* 统计数据 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.stat-card:hover {
  transform: translateY(-5px);
  border-color: #FF6B9D;
  box-shadow: 0 10px 25px rgba(255, 107, 157, 0.2);
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #5D9CEC;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 13px;
  color: #64748B;
}

/* 社区宣言 */
.community-manifesto {
  background: linear-gradient(135deg, #5D9CEC, #FF6B9D);
  border-radius: 20px;
  padding: 30px;
  color: white;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
}

.community-manifesto::before {
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

.manifesto-content {
  position: relative;
  z-index: 1;
}

.manifesto-content i:first-child {
  font-size: 32px;
  margin-bottom: 20px;
  display: block;
  opacity: 0.7;
}

.manifesto-content p {
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 20px;
  font-style: italic;
}

.manifesto-author {
  text-align: right;
  font-size: 14px;
  opacity: 0.9;
}

/* 行动按钮 */
.action-buttons {
  display: flex;
  gap: 15px;
}

.action-btn {
  flex: 1;
  padding: 16px;
  border-radius: 15px;
  text-decoration: none;
  text-align: center;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.join-btn {
  background: linear-gradient(135deg, #FF6B9D 0%, #FF3D7F 100%);
  color: white;
}

.join-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(255, 107, 157, 0.4);
}

.browse-btn {
  background: white;
  color: #5D9CEC;
  border: 2px solid #5D9CEC;
}

.browse-btn:hover {
  background: #5D9CEC;
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(93, 156, 236, 0.4);
}

/* 消息提示 */
.message-toast {
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
  min-width: 300px;
  border-left: 5px solid #5D9CEC;
}

.message-toast.success {
  border-left-color: #7EE081;
}

.message-toast.error {
  border-left-color: #FF6B6B;
}

.message-toast.info {
  border-left-color: #5D9CEC;
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
@media (max-width: 1024px) {
  .login-container {
    flex-direction: column;
    gap: 40px;
  }
  
  .login-left,
  .login-right {
    min-height: auto;
  }
  
  .login-card,
  .community-card {
    max-width: 600px;
  }
}

@media (max-width: 768px) {
  .login-container {
    padding: 10px;
  }
  
  .login-card,
  .community-card {
    padding: 30px 20px;
  }
  
  .login-title {
    font-size: 28px;
    flex-direction: column;
    gap: 10px;
  }
  
  .community-logo h2 {
    font-size: 28px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .bg-decorations div {
    font-size: 24px;
  }
}
</style>