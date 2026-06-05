<template>
  <div id="app">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="container">
        <div class="logo-section">
          <h1 class="logo">
            <span class="logo-icon">🐾</span>
            <span class="logo-text">宠乐汇</span>
          </h1>
          <p class="logo-slogan">领养治愈时光，好物陪伴成长</p>
        </div>
        
        <nav class="main-nav">
          <router-link to="/" class="nav-link" exact>
            <i class="fas fa-home"></i> 首页
          </router-link>
          <router-link to="/pets" class="nav-link">
            <i class="fas fa-paw"></i> 领养专区
          </router-link>
          <router-link to="/mall" class="nav-link">
            <i class="fas fa-shopping-cart"></i> 用品商城
          </router-link>
            <router-link to="/service" class="nav-link">
            <i class="fas fa-home"></i> 上门服务
          </router-link>
          <router-link to="/stories" class="nav-link">
            <i class="fas fa-book"></i> 幸福剧场
          </router-link>
        </nav>
        

        
        <div class="user-section">
          <div class="user-menu" v-if="currentUser">
            <div class="user-info" @click="toggleDropdown">
              <div class="user-avatar" @click.stop="goToProfile">
                <img v-if="currentUser.avatar" :src="currentUser.avatar" alt="用户头像" class="avatar-img">
                <i v-else class="fas fa-user-circle"></i>
              </div>
              <span class="username">{{ currentUser.username }}</span>
              <i class="fas fa-chevron-down dropdown-arrow"></i>
            </div>
            <div class="dropdown" v-show="showDropdown">
            
              
              <!-- 个人中心 -->
              <router-link to="/profile" class="dropdown-item" @click="closeDropdown">
                <i class="fas fa-user"></i> 个人中心
              </router-link>
              
                <!-- 购物车 -->
              <router-link to="/cart" class="dropdown-item" @click="closeDropdown">
                <i class="fas fa-shopping-bag"></i> 购物车
                <span class="cart-count" v-if="cartCount > 0">{{ cartCount }}</span>
              </router-link>

              <!-- 我的订单 -->
              <router-link to="/orders" class="dropdown-item" @click="closeDropdown">
                <i class="fas fa-clipboard-list"></i> 我的订单
              </router-link>
              
              <!-- 我的收藏 -->
              <router-link to="/favorites" class="dropdown-item" @click="closeDropdown">
                <i class="fas fa-heart"></i> 我的收藏
              </router-link>
              
              <div class="dropdown-divider"></div>
              
              <!-- 退出登录 -->
              <a href="#" @click.prevent="logout" class="dropdown-item logout" @click="closeDropdown">
                <i class="fas fa-sign-out-alt"></i> 退出登录
              </a>
            </div>
          </div>
          
          <div v-else class="auth-buttons">
            <router-link to="/login" class="btn btn-outline">
              <i class="fas fa-sign-in-alt"></i> 登录
            </router-link>
            <router-link to="/register" class="btn btn-primary">
              <i class="fas fa-user-plus"></i> 注册
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- 消息提示 -->
    <div v-if="message.text" :class="['message', message.type]" class="global-message">
      <div class="message-content">
        <i :class="messageIcon"></i>
        <span>{{ message.text }}</span>
      </div>
    </div>

    <!-- 主要内容 -->
    <main class="main-content">
      <router-view></router-view>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h4 class="footer-title">
              <span class="footer-logo">🐾 宠乐汇</span>
            </h4>
            <p class="footer-description">
              一站式宠物领养与用品电商平台，致力于为流浪动物寻找温暖的家，为宠物主人提供优质商品和服务。
            </p>
            <div class="footer-slogan">
              <i class="fas fa-heart"></i> 领养代替购买，给爱一个家
            </div>
          </div>
          
          <div class="footer-section">
            <h4 class="footer-title">🐕 快速链接</h4>
            <ul class="footer-links">
              <li><router-link to="/"><i class="fas fa-home"></i> 首页</router-link></li>
              <li><router-link to="/pets"><i class="fas fa-paw"></i> 领养专区</router-link></li>
              <li><router-link to="/mall"><i class="fas fa-shopping-cart"></i> 用品商城</router-link></li>
              <li><router-link to="/about"><i class="fas fa-info-circle"></i> 关于我们</router-link></li>
            </ul>
          </div>
          
          <div class="footer-section">
            <h4 class="footer-title">📞 联系我们</h4>
            <ul class="footer-contact">
              <li><i class="fas fa-phone"></i> 400-123-4567</li>
              <li><i class="fas fa-envelope"></i> contact@chonglehui.com</li>
              <li><i class="fas fa-map-marker-alt"></i> 重庆市两江新区宠物爱心大厦</li>
            </ul>
          </div>
          
          <div class="footer-section">
            <h4 class="footer-title">🌟 关注我们</h4>
            <div class="social-icons">
              <a href="#" class="social-icon wechat">
                <i class="fab fa-weixin"></i>
              </a>
              <a href="#" class="social-icon weibo">
                <i class="fab fa-weibo"></i>
              </a>
              <a href="#" class="social-icon douyin">
                <i class="fab fa-tiktok"></i>
              </a>
              <a href="#" class="social-icon qq">
                <i class="fab fa-qq"></i>
              </a>
            </div>
            <div class="newsletter">
              <p>订阅我们的爱心资讯</p>
              <div class="newsletter-input">
                <input type="email" placeholder="输入你的邮箱">
                <button class="btn-subscribe">
                  <i class="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>© 2025 宠乐汇 - 给流浪动物一个温暖的家 | 京ICP备12345678号</p>
          <div class="footer-extra">
            <span>❤️ 每份领养都是一份承诺</span>
            <span>🐾 选择领养，选择有爱</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'

export default {
  name: 'App',
  components: {
  },
  data() {
    return {
      currentUser: null,
      message: {
        text: '',
        type: ''
      },
      showDropdown: false
    }
  },
  computed: {
    messageIcon() {
      switch(this.message.type) {
        case 'success': return 'fas fa-check-circle'
        case 'error': return 'fas fa-exclamation-circle'
        case 'info': return 'fas fa-info-circle'
        default: return 'fas fa-info-circle'
      }
    },
    cartCount() {
      return this.cartStore.totalItems
    }
  },
  created() {
    console.log('🚀 App.vue 已创建')
    this.userStore = useUserStore()
    this.cartStore = useCartStore()
    this.checkLoginStatus()
    this.cartStore.loadCart()
    
    // 监听登录事件
    window.addEventListener('user-login', (event) => {
      console.log('🌍 收到全局登录事件:', event.detail)
      this.handleLoginSuccess(event.detail)
    })
    
    // 监听用户资料更新事件
    window.addEventListener('user-profile-updated', this.handleProfileUpdate)
    
    // 监听头像更新事件
    window.addEventListener('avatar-updated', this.handleAvatarUpdate)
    
    // 点击其他地方关闭下拉菜单
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeDestroy() {
    window.removeEventListener('user-login', this.handleLoginSuccess)
    window.removeEventListener('user-profile-updated', this.handleProfileUpdate)
    window.removeEventListener('avatar-updated', this.handleAvatarUpdate)
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    // 检查登录状态
    checkLoginStatus() {
      // 先从sessionStorage初始化用户状态
      this.userStore.initFromStorage()
      
      // 验证登录状态的完整性
      if (this.userStore.token && this.userStore.user) {
        // 验证用户数据是否完整
        if (this.userStore.user.id && this.userStore.user.email) {
          this.currentUser = this.userStore.user
          
          // 检查并加载用户专属的头像数据
          if (this.currentUser.id) {
            const userAvatarKey = `user_avatar_${this.currentUser.id}`
            const savedAvatar = localStorage.getItem(userAvatarKey)
            
            if (savedAvatar) {
              // 更新用户头像（无论当前是否有头像都更新）
              this.currentUser.avatar = savedAvatar
              console.log('✅ 页面加载时已加载用户专属头像数据:', savedAvatar)
              
              // 更新sessionStorage中的用户信息
              const sessionUser = JSON.parse(sessionStorage.getItem('user') || '{}')
              sessionUser.avatar = savedAvatar
              sessionStorage.setItem('user', JSON.stringify(sessionUser))
              
              // 更新Pinia store中的用户信息
              this.userStore.setUser(this.currentUser)
            } else {
              console.log('ℹ️ 页面加载时未找到用户专属头像数据')
            }
          }
          
          console.log('✅ 已登录用户:', this.currentUser.username)
        } else {
          // 用户数据不完整，清除无效数据
          console.log('⚠️ 用户数据不完整，清除无效登录信息')
          this.userStore.logout()
          this.currentUser = null
        }
      } else {
        // 如果Pinia store中没有用户信息，尝试从sessionStorage恢复
        const sessionUser = sessionStorage.getItem('user')
        if (sessionUser) {
          const userData = JSON.parse(sessionUser)
          if (userData.token) {
            this.currentUser = userData
            
            // 加载用户专属头像数据
            if (userData.id) {
              const userAvatarKey = `user_avatar_${userData.id}`
              const savedAvatar = localStorage.getItem(userAvatarKey)
              
              if (savedAvatar) {
                // 更新用户头像
                this.currentUser.avatar = savedAvatar
                userData.avatar = savedAvatar
                
                // 更新sessionStorage中的用户信息
                sessionStorage.setItem('user', JSON.stringify(userData))
                
                // 更新Pinia store中的用户信息
                this.userStore.setUser(userData)
                
                console.log('✅ 从sessionStorage恢复时已加载用户专属头像数据:', savedAvatar)
              } else {
                console.log('ℹ️ 从sessionStorage恢复时未找到用户专属头像数据')
              }
            }
            
            console.log('✅ 已登录用户:', this.currentUser.username)
          }
        } else {
          // 没有token或用户数据，视为未登录
          console.log('ℹ️ 未登录状态')
          this.currentUser = null
        }
      }
    },
    

    
    // 登录成功处理
    handleLoginSuccess(userData) {
      console.log('🎉 登录成功!', userData)
      
      // 处理用户名
      if (!userData.username && userData.email) {
        userData.username = userData.email.split('@')[0]
      }
      
      // 加载用户专属头像数据
      if (userData && userData.id) {
        const userAvatarKey = `user_avatar_${userData.id}`
        const savedAvatar = localStorage.getItem(userAvatarKey)
        
        if (savedAvatar) {
          // 更新用户头像
          userData.avatar = savedAvatar
          
          console.log('✅ 已加载用户专属头像数据:', savedAvatar)
        } else {
          console.log('ℹ️ 未找到用户专属头像数据')
        }
      }
      
      // 更新Pinia store中的用户状态
      const userStore = useUserStore()
      userStore.setUser(userData)
      userStore.setToken(userData.token)
      
      // 设置当前用户
      this.currentUser = userData
      sessionStorage.setItem('user', JSON.stringify(userData))
      
      // 加载购物车数据
      this.cartStore.loadCart()
      
      this.showMessage(`欢迎回来，${userData.username}！🎉`, 'success')
      this.closeDropdown()
    },
    

    
    // 点击外部关闭下拉菜单
    handleClickOutside(event) {
      const userMenu = this.$el.querySelector('.user-menu')
      if (userMenu && !userMenu.contains(event.target)) {
        this.showDropdown = false
      }
    },
    
    // 切换下拉菜单
    toggleDropdown() {
      this.showDropdown = !this.showDropdown
    },
    
    // 关闭下拉菜单
    closeDropdown() {
      this.showDropdown = false
    },
    
    // 跳转到个人中心
    goToProfile() {
      this.$router.push('/profile')
    },
    
    // 退出登录
    logout() {
      if (confirm('确定要退出登录吗？😢')) {
        // 更新Pinia store中的用户状态
        const userStore = useUserStore()
        userStore.logout()
        
        this.clearLoginData()
        this.currentUser = null
        this.showMessage('已退出登录，期待再次相遇！💙', 'info')
        this.closeDropdown()
        
        // 跳转到首页
        if (this.$route.path !== '/') {
          this.$router.push('/')
        }
      }
    },
    
    // 清除登录数据
    clearLoginData() {
      // 使用Pinia store清除登录数据
      this.userStore.logout()
      console.log('🧹 已清除登录数据')
    },
    
    // 处理用户资料更新
    handleProfileUpdate(event) {
      console.log('👤 收到用户资料更新事件:', event.detail)
      
      // 更新当前用户信息
      if (this.currentUser && event.detail.username) {
        console.log('更新前用户名:', this.currentUser.username)
        this.currentUser.username = event.detail.username
        console.log('更新后用户名:', this.currentUser.username)
        
        // 更新sessionStorage中的用户信息
        const updatedUser = { ...this.currentUser, username: event.detail.username }
        sessionStorage.setItem('user', JSON.stringify(updatedUser))
        
        // 更新Pinia store中的用户信息
        this.userStore.setUser(updatedUser)
        
        this.showMessage('用户名已更新！', 'success')
      }
    },
    
    // 处理头像更新
    handleAvatarUpdate(event) {
      console.log('🖼️ 收到头像更新事件:', event.detail)
      
      // 更新当前用户头像
      if (this.currentUser && event.detail.avatar) {
        console.log('更新前头像:', this.currentUser.avatar)
        this.currentUser.avatar = event.detail.avatar
        console.log('更新后头像:', this.currentUser.avatar)
        
        // 更新sessionStorage中的用户信息
        const updatedUser = { ...this.currentUser, avatar: event.detail.avatar }
        sessionStorage.setItem('user', JSON.stringify(updatedUser))
        
        // 更新Pinia store中的用户信息
        this.userStore.setUser(updatedUser)
        
        this.showMessage('头像已更新！', 'success')
      }
    },
    
    // 显示消息
    showMessage(text, type = 'info') {
      this.message.text = text
      this.message.type = type
      
      setTimeout(() => {
        this.message.text = ''
        this.message.type = ''
      }, 3000)
    }
  }
}
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-blue: #5D9CEC;
  --primary-light: #E6F2FF;
  --primary-dark: #4A7BC1;
  --accent-pink: #FF6B9D;
  --accent-yellow: #FFD166;
  --success-green: #7EE081;
  --text-dark: #2C3E50;
  --text-light: #7F8C8D;
  --bg-light: #F8FAFF;
  --white: #FFFFFF;
  --shadow: 0 8px 25px rgba(93, 156, 236, 0.15);
  --shadow-hover: 0 15px 35px rgba(93, 156, 236, 0.25);
  --border-radius-lg: 24px;
  --border-radius-md: 18px;
  --border-radius-sm: 12px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

body {
  font-family: "Comic Sans MS", "微软雅黑", "PingFang SC", sans-serif;
  color: var(--text-dark);
  line-height: 1.6;
  background: var(--bg-light);
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 50px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  text-decoration: none;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

.btn::after {
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

.btn:hover::after {
  width: 300px;
  height: 300px;
}

.header .btn-primary {
  background: transparent;
  color: white;
  border: 2px solid white;
  box-shadow: none;
}

.header .btn-primary:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 10px 25px rgba(255, 255, 255, 0.2);
}

.header .btn-outline {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.header .btn-outline:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.btn-lg {
  padding: 15px 32px;
  font-size: 18px;
}

/* 头部导航栏 */
.header {
  background: linear-gradient(135deg, var(--primary-blue) 0%, #6AAEFF 100%);
  color: white;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(93, 156, 236, 0.3);
  padding: 15px 0;
  border-radius: 0 0 20px 20px;
}

.header .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 36px;
  font-weight: bold;
}

.logo-icon {
  font-size: 32px;
  animation: wiggle 3s infinite;
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}

.logo-text {
  font-family: "Comic Sans MS", cursive;
  color: #FFD166;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.logo-slogan {
  font-size: 13px;
  opacity: 0.9;
  color: var(--primary-light);
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 10px;
  border-radius: 20px;
  display: inline-block;
}

.main-nav {
  display: flex;
  gap: 15px;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: var(--transition);
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid transparent;
}

.nav-link:hover,
.nav-link.router-link-exact-active {
  background: rgba(255, 255, 255, 0.2);
  border-color: white;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 255, 255, 0.2);
}

.search-section {
  flex: 1;
  max-width: 500px;
  margin: 0 20px;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.cart-btn {
  position: relative;
  color: white;
  font-size: 20px;
  text-decoration: none;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transition: var(--transition);
}

.cart-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.cart-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background: var(--accent-pink);
  color: white;
  font-size: 12px;
  min-width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.user-menu {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  cursor: pointer;
  transition: var(--transition);
  border: 2px solid transparent;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: white;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: var(--transition);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.user-avatar:hover {
  transform: scale(1.05);
  border-color: white;
}

.user-avatar i {
  font-size: 24px;
  color: white;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.username {
  font-weight: 500;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  font-size: 12px;
  transition: var(--transition);
}

.user-info:hover .dropdown-arrow,
.user-menu.show-dropdown .dropdown-arrow {
  transform: rotate(180deg);
}

/* 下拉菜单 */
.dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 200px;
  background: white;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow);
  padding: 15px 0;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: var(--transition);
  z-index: 1001;
}

.user-menu.show-dropdown .dropdown,
.user-menu:hover .dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: var(--text-dark);
  text-decoration: none;
  transition: var(--transition);
  font-size: 14px;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  position: relative;
}

.dropdown-item .cart-count {
  position: absolute;
  right: 20px;
  background: var(--accent-pink);
  color: white;
  font-size: 12px;
  min-width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.dropdown-item:hover {
  background: var(--primary-light);
  color: var(--primary-blue);
  padding-left: 25px;
}

.dropdown-item.logout {
  color: #FF6B6B;
}

.dropdown-item.logout:hover {
  background: #FFE5E5;
}

.dropdown-divider {
  height: 1px;
  background: #E5E7EB;
  margin: 8px 20px;
}

.auth-buttons {
  display: flex;
  gap: 12px;
}

/* 消息提示 */
.global-message {
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 3000;
  animation: slideInRight 0.3s, fadeOut 0.3s 2.7s forwards;
  max-width: 400px;
}

.message-content {
  background: white;
  padding: 20px 25px;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  gap: 15px;
  border-left: 5px solid var(--primary-blue);
  position: relative;
  overflow: hidden;
}

.message-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-blue), var(--accent-pink));
}

.message.success .message-content {
  border-left-color: var(--success-green);
}

.message.error .message-content {
  border-left-color: #FF6B6B;
}

.message.info .message-content {
  border-left-color: var(--primary-blue);
}

.message-content i {
  font-size: 24px;
}

.message.success .message-content i {
  color: var(--success-green);
}

.message.error .message-content i {
  color: #FF6B6B;
}

.message.info .message-content i {
  color: var(--primary-blue);
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeOut {
  to {
    opacity: 0;
    visibility: hidden;
  }
}

/* 主要内容 */
.main-content {
  flex: 1;
  padding: 20px 0;
}

/* 页脚 */
.footer {
  background: linear-gradient(135deg, var(--text-dark) 0%, #1A2B3C 100%);
  color: white;
  padding: 60px 0 20px;
  margin-top: auto;
  border-radius: 40px 40px 0 0;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.footer-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
  font-family: "Comic Sans MS", cursive;
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-logo {
  font-size: 24px;
}

.footer-description {
  font-size: 14px;
  color: #B0BEC5;
  line-height: 1.6;
}

.footer-slogan {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--accent-pink);
  font-weight: 600;
  margin-top: 10px;
}

.footer-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-links a {
  color: #B0BEC5;
  text-decoration: none;
  transition: var(--transition);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-links a:hover {
  color: white;
  padding-left: 10px;
}

.footer-contact {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-contact li {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #B0BEC5;
  font-size: 14px;
}

.social-icons {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.social-icon {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-decoration: none;
  transition: var(--transition);
  font-size: 18px;
}

.social-icon:hover {
  transform: translateY(-5px) scale(1.1);
}

.social-icon.wechat:hover {
  background: #07C160;
}

.social-icon.weibo:hover {
  background: #E6162D;
}

.social-icon.douyin:hover {
  background: #000000;
}

.social-icon.qq:hover {
  background: #12B7F5;
}

.newsletter {
  margin-top: 20px;
}

.newsletter p {
  font-size: 14px;
  color: #B0BEC5;
  margin-bottom: 10px;
}

.newsletter-input {
  display: flex;
  gap: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  overflow: hidden;
}

.newsletter-input input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 12px 20px;
  color: white;
  font-size: 14px;
}

.newsletter-input input::placeholder {
  color: #90A4AE;
}

.btn-subscribe {
  background: var(--primary-blue);
  color: white;
  border: none;
  padding: 0 25px;
  cursor: pointer;
  transition: var(--transition);
}

.btn-subscribe:hover {
  background: var(--primary-dark);
  transform: scale(1.1);
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #90A4AE;
  font-size: 14px;
}

.footer-extra {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 10px;
  font-size: 13px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header .container {
    flex-direction: column;
    gap: 20px;
  }
  
  .main-nav {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .user-section {
    flex-direction: column;
    gap: 15px;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .social-icons {
    justify-content: center;
  }
  
  .footer-extra {
    flex-direction: column;
    gap: 10px;
  }
  
  .global-message {
    top: 80px;
    left: 20px;
    right: 20px;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .logo {
    font-size: 24px;
  }
  
  .logo-slogan {
    font-size: 11px;
  }
  
  .nav-link {
    padding: 8px 12px;
    font-size: 14px;
  }
}
</style>