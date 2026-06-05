<!-- src/views/Profile.vue -->
<template>
  <div class="profile-page">
    <!-- 页面头部 -->
    <div class="profile-header">
      <div class="container">
        <h1 class="page-title">个人中心</h1>
        <p class="page-subtitle">管理您的账户信息和偏好设置</p>
      </div>
    </div>

    <div class="container profile-container">
      <div class="profile-layout">
        <!-- 左侧菜单 -->
        <div class="profile-sidebar">
          <div class="user-card">
            <div class="user-avatar" @click="changeAvatar">
              <img :src="userInfo.avatar" alt="用户头像" class="avatar" @error="handleImageError">
                <div class="avatar-upload">
                  <label for="avatar-upload" class="upload-btn">
                    <i class="fas fa-camera"></i>
                  </label>
                  <input type="file" id="avatar-upload" @change="handleAvatarChange" accept="image/*" style="display: none;">
                </div>
              <div class="avatar-overlay">
                <i class="fas fa-camera"></i>
                
              </div>
            </div>
            <div class="user-info">
              <h3 class="user-name">{{ userInfo.username }}</h3>
              <p class="user-id">ID: {{ userInfo.userId }}</p>
              <div class="user-level">
                <span class="level-badge" :class="userInfo.level">
                  {{ userInfo.levelText }}
                </span>
              </div>
            </div>
          </div>

          <nav class="profile-menu">
            <router-link 
              to="/profile" 
              class="menu-item active"
              @click="activeMenu = 'info'"
            >
              <i class="fas fa-user-circle"></i>
              账户信息
            </router-link>
            <router-link 
              to="/cart" 
              class="menu-item"
            >
              <i class="fas fa-clipboard-list"></i>
              我的订单
            </router-link>
            <router-link 
              to="/favorites" 
              class="menu-item"
            >
              <i class="fas fa-heart"></i>
              我的收藏
            </router-link>
            <router-link 
              to="/profile/address" 
              class="menu-item"
              @click="activeMenu = 'address'"
            >
              <i class="fas fa-map-marker-alt"></i>
              收货地址
            </router-link>
            <router-link 
              to="/profile/security" 
              class="menu-item"
              @click="activeMenu = 'security'"
            >
              <i class="fas fa-shield-alt"></i>
              安全设置
            </router-link>
            <button class="menu-item logout-btn" @click="logout">
              <i class="fas fa-sign-out-alt"></i>
              退出登录
            </button>
          </nav>
        </div>

        <!-- 右侧内容区域 -->
        <div class="profile-content">
          <!-- 账户信息 -->
          <div v-if="activeMenu === 'info'" class="content-section">
            <div class="section-header">
              <h2>账户信息</h2>
              <button class="edit-btn" @click="editMode = !editMode">
                {{ editMode ? '取消编辑' : '编辑信息' }}
              </button>
            </div>

            <form class="profile-form" @submit.prevent="saveProfile">
              <div class="form-group">
                <label>用户名</label>
                <input 
                  type="text" 
                  v-model="userInfo.username"
                  :readonly="!editMode"
                  :class="{ 'readonly': !editMode }"
                >
              </div>

              <div class="form-group">
                <label>邮箱</label>
                <input 
                  type="email" 
                  v-model="userInfo.email"
                  readonly
                  class="readonly"
                >
                <span class="verified-badge">
                  <i class="fas fa-check-circle"></i> 登录邮箱
                </span>
              </div>

              <div class="form-group">
                <label>手机号码</label>
                <input 
                  type="tel" 
                  v-model="userInfo.phone"
                  :readonly="!editMode"
                  :class="{ 'readonly': !editMode }"
                >
                <span v-if="userInfo.phoneVerified" class="verified-badge">
                  <i class="fas fa-check-circle"></i> 已认证
                </span>
                <button v-else type="button" class="verify-btn">
                  验证手机
                </button>
              </div>

              <div class="form-group">
                <label>性别</label>
                <div class="gender-options">
                  <label class="radio-label">
                    <input 
                      type="radio" 
                      value="male" 
                      v-model="userInfo.gender"
                      :disabled="!editMode"
                    >
                    <span>男</span>
                  </label>
                  <label class="radio-label">
                    <input 
                      type="radio" 
                      value="female" 
                      v-model="userInfo.gender"
                      :disabled="!editMode"
                    >
                    <span>女</span>
                  </label>
                  <label class="radio-label">
                    <input 
                      type="radio" 
                      value="secret" 
                      v-model="userInfo.gender"
                      :disabled="!editMode"
                    >
                    <span>保密</span>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label>生日</label>
                <input 
                  type="date" 
                  v-model="userInfo.birthday"
                  :readonly="!editMode"
                  :class="{ 'readonly': !editMode }"
                >
              </div>

              <div class="form-group">
                <label>个性签名</label>
                <textarea 
                  v-model="userInfo.bio"
                  :readonly="!editMode"
                  :class="{ 'readonly': !editMode }"
                  rows="3"
                  placeholder="介绍一下自己吧..."
                ></textarea>
              </div>

              <div v-if="editMode" class="form-actions">
                <button type="submit" class="btn btn-primary" :disabled="savingProfile">
                  {{ savingProfile ? '保存中...' : '保存更改' }}
                </button>
                <button type="button" class="btn btn-outline" @click="editMode = false">
                  取消
                </button>
              </div>
            </form>
          </div>

          <!-- 我的订单 -->
          <div v-else-if="activeMenu === 'orders'" class="content-section">
            <div class="section-header">
              <h2>我的订单</h2>
              <router-link to="/orders" class="view-all-link">
                查看全部订单 <i class="fas fa-arrow-right"></i>
              </router-link>
            </div>
            
            <div class="order-overview">
              <div class="order-stats">
                <div class="stat-item">
                  <div class="stat-value">{{ orderStats.pending }}</div>
                  <div class="stat-label">待付款</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ orderStats.paid }}</div>
                  <div class="stat-label">待发货</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ orderStats.shipped }}</div>
                  <div class="stat-label">待收货</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ orderStats.completed }}</div>
                  <div class="stat-label">已完成</div>
                </div>
              </div>
            </div>

            <div class="recent-orders">
              <h3>最近订单</h3>
              <div v-if="recentOrders.length > 0">
                <div v-for="order in recentOrders" :key="order.id" class="order-item">
                  <div class="order-info">
                    <span class="order-number">{{ order.orderNumber }}</span>
                    <span class="order-time">{{ order.createdAt }}</span>
                    <span class="order-status" :class="order.status">
                      {{ getStatusText(order.status) }}
                    </span>
                  </div>
                  <div class="order-amount">¥{{ order.amount }}</div>
                  <button class="btn btn-sm btn-outline" @click="viewOrder(order.id)">
                    查看详情
                  </button>
                </div>
              </div>
              <div v-else class="empty-state">
                <p>暂无订单记录</p>
                <router-link to="/mall" class="btn btn-primary">
                  去商城逛逛
                </router-link>
              </div>
            </div>
          </div>

          <!-- 我的收藏 -->
          <div v-else-if="activeMenu === 'favorites'" class="content-section">
            <div class="section-header">
              <h2>我的收藏</h2>
              <button class="btn btn-outline" @click="clearFavorites">
                清空收藏
              </button>
            </div>

            <div v-if="favorites.length > 0" class="favorites-grid">
              <div v-for="item in favorites" :key="item.id" class="favorite-item">
                <img :src="item.image" :alt="item.name" class="item-image">
                <div class="item-info">
                  <h4>{{ item.name }}</h4>
                  <p class="item-price">¥{{ item.price }}</p>
                  <div class="item-actions">
                    <button class="btn btn-sm" @click="removeFavorite(item.id)">
                      取消收藏
                    </button>
                    <router-link :to="`/product/${item.id}`" class="btn btn-sm btn-primary">
                      查看商品
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <i class="fas fa-heart"></i>
              <p>您还没有收藏任何商品</p>
              <router-link to="/mall" class="btn btn-primary">
                去发现好物
              </router-link>
            </div>
          </div>

          <!-- 收货地址 -->
          <div v-else-if="activeMenu === 'address'" class="content-section">
            <div class="section-header">
              <h2>收货地址</h2>
              <button class="btn btn-primary" @click="showAddAddress = true">
                <i class="fas fa-plus"></i> 添加新地址
              </button>
            </div>

            <div v-if="addresses.length > 0" class="address-list">
              <div 
                v-for="address in addresses" 
                :key="address.id" 
                class="address-card"
                :class="{ 'default': address.isDefault }"
              >
                <div class="address-header">
                  <span class="address-name">{{ address.name }}</span>
                  <span class="address-phone">{{ address.phone }}</span>
                  <span v-if="address.isDefault" class="default-badge">默认</span>
                </div>
                <div class="address-content">
                  <p>{{ address.province }}{{ address.city }}{{ address.district }}{{ address.detail }}</p>
                </div>
                <div class="address-actions">
                  <button @click="editAddress(address.id)">编辑</button>
                  <button 
                    v-if="!address.isDefault" 
                    @click="setDefaultAddress(address.id)"
                  >
                    设为默认
                  </button>
                  <button 
                    @click="deleteAddress(address.id)"
                    class="delete-btn"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <i class="fas fa-map-marker-alt"></i>
              <p>您还没有添加收货地址</p>
              <button class="btn btn-primary" @click="showAddAddress = true">
                添加第一个地址
              </button>
            </div>
          </div>

          <!-- 安全设置 -->
          <div v-else-if="activeMenu === 'security'" class="content-section">
            <div class="section-header">
              <h2>安全设置</h2>
            </div>

            <div class="security-settings">
              <div class="setting-item">
                <div class="setting-info">
                  <h4>登录密码</h4>
                  <p>定期更改密码可以让账户更安全</p>
                </div>
                <button class="btn btn-outline" @click="changePassword">
                  修改密码
                </button>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h4>登录设备管理</h4>
                  <p>管理您的登录设备，移除不信任的设备</p>
                </div>
                <button class="btn btn-outline" @click="manageDevices">
                  查看设备
                </button>
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h4>账户保护</h4>
                  <p>开启二次验证，增加账户安全性</p>
                </div>
                <div class="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="twoFactor" 
                    v-model="securitySettings.twoFactor"
                  >
                  <label for="twoFactor"></label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改头像弹窗 -->
    <div v-if="showAvatarModal" class="modal-overlay" @click.self="showAvatarModal = false">
      <div class="modal-content">
        <h3>修改头像</h3>
        <!-- 头像上传组件 -->
        <div class="avatar-upload-area">
          <div class="upload-preview">
            <img v-if="avatarPreview" :src="avatarPreview" alt="预览">
            <i v-else class="fas fa-user"></i>
          </div>
          <input type="file" ref="avatarInput" @change="handleAvatarUpload" accept="image/*">
          <button class="btn" @click="$refs.avatarInput.click()">
            选择图片
          </button>
          <p class="upload-tip">支持JPG、PNG格式，文件大小不超过5MB</p>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="uploadAvatar" :disabled="uploadingAvatar || !avatarPreview">
            {{ uploadingAvatar ? '上传中...' : '确认' }}
          </button>
          <button class="btn btn-outline" @click="showAvatarModal = false">取消</button>
        </div>
      </div>
    </div>

    <!-- 添加地址弹窗 -->
    <div v-if="showAddAddress" class="modal-overlay" @click.self="showAddAddress = false">
      <div class="modal-content">
        <h3>{{ editingAddress ? '编辑地址' : '添加新地址' }}</h3>
        <form class="address-form" @submit.prevent="saveAddress">
          <div class="form-group">
            <input type="text" v-model="newAddress.name" placeholder="收货人姓名" required>
          </div>
          <div class="form-group">
            <input type="tel" v-model="newAddress.phone" placeholder="手机号码" required>
          </div>
          <div class="form-group">
            <input type="text" v-model="newAddress.province" placeholder="省份" required>
          </div>
          <div class="form-group">
            <input type="text" v-model="newAddress.city" placeholder="城市" required>
          </div>
          <div class="form-group">
            <input type="text" v-model="newAddress.district" placeholder="区县" required>
          </div>
          <div class="form-group">
            <input type="text" v-model="newAddress.detail" placeholder="详细地址" required>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="newAddress.isDefault">
              设为默认地址
            </label>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">保存</button>
            <button type="button" class="btn btn-outline" @click="showAddAddress = false">
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { userApi } from '@/services/api'
import { useUserStore } from '@/stores/user'

export default {
  name: 'Profile',
  data() {
    return {
      activeMenu: 'info',
      editMode: false,
      savingProfile: false,
      showAvatarModal: false,
      showAddAddress: false,
      editingAddress: null,
      avatarPreview: null,
      uploadingAvatar: false,

      
      // 用户信息
      userInfo: {
        username: '爱心用户二B',
        userId: '20240001',
        avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
        email: 'user@example.com',
        emailVerified: true,
        phone: '13800138000',
        phoneVerified: true,
        gender: 'secret',
        birthday: '1990-01-01',
        bio: '我是宠物爱好者，喜欢猫猫狗狗～',
        level: 'gold',
        levelText: '黄金会员',
        points: 1280,
        registerDate: '2024-01-01'
      },
      
      // 订单统计
      orderStats: {
        pending: 2,
        paid: 1,
        shipped: 3,
        completed: 12,
        cancelled: 0
      },
      
      // 最近订单
      recentOrders: [
        {
          id: 1,
          orderNumber: 'DD202312150001',
          createdAt: '2023-12-15 10:30:25',
          status: 'pending',
          amount: 256.00
        },
        {
          id: 2,
          orderNumber: 'DD202312120023',
          createdAt: '2023-12-12 14:20:10',
          status: 'shipped',
          amount: 189.00
        },
        {
          id: 3,
          orderNumber: 'DD202312080045',
          createdAt: '2023-12-08 09:15:33',
          status: 'completed',
          amount: 356.00
        }
      ],
      
      // 收藏列表
      favorites: [
        {
          id: 1,
          name: '皇家小型犬成犬粮',
          price: 158.00,
          image: 'https://cdn.pixabay.com/photo/2018/08/12/15/10/dog-3601110_1280.jpg'
        },
        {
          id: 2,
          name: '宠物自动饮水机',
          price: 98.00,
          image: 'https://cdn.pixabay.com/photo/2019/05/23/14/31/dog-4224417_1280.jpg'
        },
        {
          id: 3,
          name: '宠物四季通用窝',
          price: 189.00,
          image: 'https://cdn.pixabay.com/photo/2016/11/29/01/28/animal-1866437_1280.jpg'
        }
      ],
      
      // 收货地址
      addresses: [
        {
          id: 1,
          name: '张三',
          phone: '13800138000',
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          detail: '建国门外大街1号',
          isDefault: true
        },
        {
          id: 2,
          name: '李四',
          phone: '13900139000',
          province: '上海市',
          city: '上海市',
          district: '浦东新区',
          detail: '陆家嘴环路100号',
          isDefault: false
        }
      ],
      
      // 安全设置
      securitySettings: {
        twoFactor: false
      },
      
      // 新地址表单
      newAddress: {
        name: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        detail: '',
        isDefault: false
      }
    }
  },
  created() {
    // 从localStorage加载用户信息
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      this.userInfo = JSON.parse(savedProfile);
    }
  },
  mounted() {
    // 从 localStorage 加载用户数据
    this.loadUserData()
    
    // 监听路由变化，更新激活的菜单
    this.updateActiveMenu()
    
    // 监听用户登录事件
    window.addEventListener('user-login', this.handleUserLogin)
    
    // 监听头像更新事件
    window.addEventListener('avatar-updated', this.handleAvatarUpdate)
  },
  beforeDestroy() {
    // 移除事件监听
    window.removeEventListener('user-login', this.handleUserLogin)
    window.removeEventListener('avatar-updated', this.handleAvatarUpdate)
  },
  methods: {
    showNotification(message, type = 'success') {
      if (type === 'success') {
        this.$message.success(message);
      } else if (type === 'error') {
        this.$message.error(message);
      } else if (type === 'warning') {
        this.$message.warning(message);
      } else {
        this.$message.info(message);
      }
    },
    // 处理用户登录事件
    handleUserLogin(event) {
      console.log('🔔 Profile页面收到登录事件:', event.detail)
      
      // 获取登录用户信息
      const userData = event.detail
      if (userData && userData.id) {
        // 加载用户专属头像数据
        const userAvatarKey = `user_avatar_${userData.id}`
        const savedAvatar = localStorage.getItem(userAvatarKey)
        
        if (savedAvatar) {
          userData.avatar = savedAvatar
          console.log('✅ Profile页面登录时已加载用户专属头像数据:', savedAvatar)
        } else {
          console.log('ℹ️ Profile页面登录时未找到用户专属头像数据')
        }
        
        // 更新用户信息
        this.userInfo.email = userData.email || this.userInfo.email
        this.userInfo.username = userData.username || this.userInfo.username
        this.userInfo.avatar = userData.avatar || this.userInfo.avatar
        
        // 保存到sessionStorage
        sessionStorage.setItem('user', JSON.stringify(userData))
      }
    },
    
    // 处理头像更新事件
    handleAvatarUpdate(event) {
      console.log('🖼️ Profile页面收到头像更新事件:', event.detail)
      
      // 更新本地头像
      if (event.detail && event.detail.avatar) {
        this.userInfo.avatar = event.detail.avatar
        
        // 保存到个人资料
        const savedProfile = JSON.parse(sessionStorage.getItem('user_profile') || '{}')
        savedProfile.avatar = event.detail.avatar
        sessionStorage.setItem('user_profile', JSON.stringify(savedProfile))
      }
    },
    
    // 加载用户数据
    loadUserData() {
      // 获取当前登录用户信息
      const loginUser = sessionStorage.getItem('user')
      if (!loginUser) {
        console.log('用户未登录，不加载个人资料')
        return
      }
      
      try {
        const userData = JSON.parse(loginUser)
        console.log('加载用户数据:', userData)
        
        // 从登录信息中获取用户基本信息
        if (userData.email) {
          this.userInfo.email = userData.email
        }
        if (userData.username) {
          this.userInfo.username = userData.username
        }
        if (userData.id) {
          this.userInfo.id = userData.id
        }
        
        // 优先从用户专属的localStorage中加载头像数据
        if (userData.id) {
          const userAvatarKey = `user_avatar_${userData.id}`
          const savedAvatar = localStorage.getItem(userAvatarKey)
          
          if (savedAvatar) {
            this.userInfo.avatar = savedAvatar
            console.log('✅ Profile页面已加载用户专属头像数据:', savedAvatar)
          } else {
            console.log('ℹ️ Profile页面未找到用户专属头像数据，使用默认头像')
            // 如果没有专属头像，使用登录信息中的头像或默认头像
            this.userInfo.avatar = userData.avatar || this.userInfo.avatar
          }
        } else if (userData.avatar) {
          // 如果没有用户ID但有头像，则使用登录信息中的头像
          this.userInfo.avatar = userData.avatar
          console.log('使用登录信息中的头像:', userData.avatar)
        }
        
        // 加载收藏
        const savedFavorites = sessionStorage.getItem('user_favorites')
        if (savedFavorites) {
          this.favorites = JSON.parse(savedFavorites)
        }
        
        // 加载地址
        const savedAddresses = sessionStorage.getItem('user_addresses')
        if (savedAddresses) {
          this.addresses = JSON.parse(savedAddresses)
        }
        
        console.log('📋 已加载用户数据:', this.userInfo)
      } catch (e) {
        console.error('解析登录用户信息失败:', e)
      }
    },
    
    // 更新激活菜单
    updateActiveMenu() {
      const path = this.$route.path
      if (path.includes('orders')) this.activeMenu = 'orders'
      else if (path.includes('favorites')) this.activeMenu = 'favorites'
      else if (path.includes('address')) this.activeMenu = 'address'
      else if (path.includes('security')) this.activeMenu = 'security'
      else this.activeMenu = 'info'
    },
    
    updateProfile() {
      // 保存用户信息
      this.saveProfile();
      this.showNotification('个人信息已更新', 'success');
    },
    
    // 保存个人资料
    async saveProfile() {
      try {
        // 显示加载状态
        this.savingProfile = true
        
        console.log('准备保存用户名:', this.userInfo.username)
        console.log('当前token:', sessionStorage.getItem('token'))
        console.log('请求URL:', '/api/profile')
        console.log('请求方法:', 'PUT')
        console.log('请求头:', {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        })
        console.log('请求体:', {
          username: this.userInfo.username
        })
        
        // 调用API更新数据库中的用户名
        const response = await userApi.updateProfile({
          username: this.userInfo.username
        })
        
        console.log('API响应:', response)
        console.log('响应状态:', response.status)
        console.log('响应数据:', response)
        
        if (response && response.success) {
          // 保存到 localStorage
          localStorage.setItem('user_profile', JSON.stringify(this.userInfo))
          
          // 更新sessionStorage中的用户信息
          const loginUser = JSON.parse(sessionStorage.getItem('user') || '{}')
          loginUser.username = this.userInfo.username
          sessionStorage.setItem('user', JSON.stringify(loginUser))
          
          // 使用Pinia store更新用户信息
          const userStore = useUserStore()
          if (userStore.user) {
            userStore.setUser({
              ...userStore.user,
              username: this.userInfo.username
            })
          }
          
          // 触发全局事件，通知App.vue更新用户名
          console.log('触发用户资料更新事件:', this.userInfo.username)
          window.dispatchEvent(new CustomEvent('user-profile-updated', { 
            detail: { username: this.userInfo.username } 
          }))
          
          this.editMode = false
          this.$message.success('个人资料已保存！')
        } else {
          console.error('保存失败:', response.data?.message)
          this.$message.error(response?.message || '保存失败')
        }
      } catch (error) {
        console.error('保存个人资料失败:', error)
        console.error('错误详情:', error.response)
        console.error('错误状态码:', error.response?.status)
        console.error('错误消息:', error.response?.data?.message)
        
        // 根据错误类型显示不同的错误消息
        let errorMessage = '保存失败: 请稍后重试'
        
        if (error.response) {
          // 服务器返回了错误响应
          if (error.response.data && error.response.data.message) {
            errorMessage = `保存失败: ${error.response.data.message}`
          } else if (error.response.status === 401) {
            errorMessage = '保存失败: 登录已过期，请重新登录'
          } else if (error.response.status === 400) {
            errorMessage = '保存失败: 请求参数错误'
          } else if (error.response.status === 500) {
            errorMessage = '保存失败: 服务器内部错误'
          }
        } else if (error.request) {
          // 请求已发出但没有收到响应
          errorMessage = '保存失败: 网络连接错误，请检查网络'
        } else {
          // 其他错误
          errorMessage = `保存失败: ${error.message}`
        }
        
        this.$message.error(errorMessage)
      } finally {
        this.savingProfile = false
      }
    },
    
    // 修改头像
    changeAvatar() {
      this.showAvatarModal = true
      this.avatarPreview = this.userInfo.avatar
    },
    
    handleAvatarChange(event) {
      const file = event.target.files[0]
      if (file) {
        // 验证文件类型
        if (!file.type.match('image.*')) {
          this.$message.error('请选择图片文件！')
          return
        }
        
        // 验证文件大小（限制为5MB）
        if (file.size > 5 * 1024 * 1024) {
          this.$message.error('图片大小不能超过5MB！')
          return
        }
        
        const reader = new FileReader()
        reader.onload = (e) => {
          this.avatarPreview = e.target.result
          this.showAvatarModal = true
        }
        reader.readAsDataURL(file)
      }
    },
    
    handleAvatarUpload(event) {
      const file = event.target.files[0]
      if (file) {
        // 验证文件类型
        if (!file.type.match('image.*')) {
          this.$message.error('请选择图片文件！')
          return
        }
        
        // 验证文件大小（限制为5MB）
        if (file.size > 5 * 1024 * 1024) {
          this.$message.error('图片大小不能超过5MB！')
          return
        }
        
        const reader = new FileReader()
        reader.onload = (e) => {
          this.avatarPreview = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },
    
    async uploadAvatar() {
      if (this.avatarPreview) {
        try {
          // 显示上传中状态
          this.uploadingAvatar = true
          
          // 完成Base64转换和保存逻辑
          const avatarUrl = this.avatarPreview
          
          // 获取当前登录用户信息
          const loginUser = JSON.parse(sessionStorage.getItem('user') || '{}')
          
          // 验证用户ID是否存在
          if (!loginUser.id) {
            throw new Error('用户ID不存在，无法保存头像')
          }
          
          // 更新用户头像
          this.userInfo.avatar = avatarUrl
          
          // 使用用户专属的localStorage键保存头像
          const userAvatarKey = `user_avatar_${loginUser.id}`
          localStorage.setItem(userAvatarKey, avatarUrl)
          console.log('头像已保存到用户专属localStorage:', userAvatarKey)
          
          // 更新登录信息中的头像
          loginUser.avatar = avatarUrl
          sessionStorage.setItem('user', JSON.stringify(loginUser))
          
          // 更新Pinia store中的用户信息
          const userStore = useUserStore()
          if (userStore.user) {
            userStore.setUser({
              ...userStore.user,
              avatar: avatarUrl
            })
          }
          
          // 触发全局事件，通知App.vue更新头像
          window.dispatchEvent(new CustomEvent('avatar-updated', { 
            detail: { avatar: avatarUrl } 
          }))
          
          this.showAvatarModal = false
          this.avatarPreview = null
          this.$message.success('头像更新成功！')
        } catch (error) {
          console.error('上传头像失败:', error)
          this.$message.error(error.message || '头像上传失败，请重试！')
        } finally {
          this.uploadingAvatar = false
        }
      }
    },
    
    // 订单状态文本
    getStatusText(status) {
      const statusMap = {
        pending: '待付款',
        paid: '待发货',
        shipped: '待收货',
        completed: '已完成',
        cancelled: '已取消'
      }
      return statusMap[status] || status
    },
    
    // 查看订单详情
    viewOrder(orderId) {
      this.$router.push(`/order/${orderId}`)
    },
    
    // 收藏相关
    removeFavorite(itemId) {
      this.favorites = this.favorites.filter(item => item.id !== itemId)
      localStorage.setItem('user_favorites', JSON.stringify(this.favorites))
    },
    
    clearFavorites() {
      if (confirm('确定要清空所有收藏吗？')) {
        this.favorites = []
        localStorage.setItem('user_favorites', JSON.stringify([]))
      }
    },
    
    // 地址相关
    addAddress() {
      this.newAddress = {
        name: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        detail: '',
        isDefault: this.addresses.length === 0 // 如果是第一个地址，设为默认
      }
      this.editingAddress = null
      this.showAddAddress = true
    },
    
    editAddress(addressId) {
      const address = this.addresses.find(addr => addr.id === addressId)
      if (address) {
        this.newAddress = { ...address }
        this.editingAddress = addressId
        this.showAddAddress = true
      }
    },
    
    saveAddress() {
      if (this.editingAddress) {
        // 更新地址
        const index = this.addresses.findIndex(addr => addr.id === this.editingAddress)
        if (index !== -1) {
          this.addresses[index] = { ...this.newAddress, id: this.editingAddress }
        }
      } else {
        // 新增地址
        const newId = this.addresses.length > 0 
          ? Math.max(...this.addresses.map(addr => addr.id)) + 1 
          : 1
        
        this.addresses.push({
          ...this.newAddress,
          id: newId
        })
      }
      
      // 如果设为默认地址，取消其他地址的默认状态
      if (this.newAddress.isDefault) {
        this.addresses.forEach(addr => {
          if (addr.id !== (this.editingAddress || newId)) {
            addr.isDefault = false
          }
        })
      }
      
      localStorage.setItem('user_addresses', JSON.stringify(this.addresses))
      this.showAddAddress = false
      this.newAddress = {
        name: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        detail: '',
        isDefault: false
      }
      this.editingAddress = null
    },
    
    setDefaultAddress(addressId) {
      this.addresses.forEach(addr => {
        addr.isDefault = addr.id === addressId
      })
      localStorage.setItem('user_addresses', JSON.stringify(this.addresses))
    },
    
    deleteAddress(addressId) {
      if (confirm('确定要删除这个地址吗？')) {
        this.addresses = this.addresses.filter(addr => addr.id !== addressId)
        localStorage.setItem('user_addresses', JSON.stringify(this.addresses))
      }
    },
    
    // 安全设置
    changePassword() {
      const newPassword = prompt('请输入新密码：')
      if (newPassword && newPassword.length >= 6) {
        alert('密码修改成功！')
      } else {
        alert('密码长度不能少于6位')
      }
    },
    
    manageDevices() {
      alert('设备管理功能开发中...')
    },
    
    // 处理图片加载错误
    handleImageError(event) {
      // 隐藏错误的图片，显示默认图标
      event.target.style.display = 'none'
      const parent = event.target.parentElement
      if (parent && !parent.querySelector('.default-avatar-icon')) {
        const icon = document.createElement('i')
        icon.className = 'fas fa-user default-avatar-icon'
        icon.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 48px; color: #ccc;'
        parent.appendChild(icon)
      }
    },
    handleAvatarChange(event) {
      const file = event.target.files[0];
      if (file) {
        // 检查文件大小（限制为5MB）
        if (file.size > 5 * 1024 * 1024) {
          this.$message.error('图片大小不能超过5MB');
          return;
        }
        
        // 创建文件读取器
        const reader = new FileReader();
        reader.onload = (e) => {
          // 更新头像
          this.userInfo.avatar = e.target.result;
          // 保存到localStorage
          this.saveProfile();
          this.$message.success('头像更新成功');
        };
        reader.readAsDataURL(file);
      }
    },
    
    // 退出登录
    logout() {
      if (confirm('确定要退出登录吗？')) {
        // 清除用户数据
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_profile')
        
        // 跳转到登录页
        this.$router.push('/login')
      }
    }
  },
  watch: {
    '$route.path': {
      handler() {
        this.updateActiveMenu()
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

/* 页面头部 */
.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 0;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 16px;
  opacity: 0.9;
}

/* 布局 */
.profile-container {
  padding: 30px 0;
}

.profile-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 30px;
}

@media (max-width: 768px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }
}

/* 左侧菜单 */
.profile-sidebar {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.user-card {
  padding: 30px 20px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.user-avatar {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.default-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #f0f0f0;
  font-size: 40px;
  color: #8e8e8e;
}

.default-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #f0f0f0;
  font-size: 40px;
  color: #8e8e8e;
}

.avatar-upload {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 32px;
  height: 32px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
}

.user-id {
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
}

.level-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #ffd700;
  color: #333;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.level-badge.gold {
  background: linear-gradient(135deg, #ffd700, #ffa500);
}

.level-badge.silver {
  background: linear-gradient(135deg, #c0c0c0, #a0a0a0);
}

.level-badge.bronze {
  background: linear-gradient(135deg, #cd7f32, #a0522d);
}

/* 菜单 */
.profile-menu {
  padding: 20px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 20px;
  color: #333;
  text-decoration: none;
  border-left: 4px solid transparent;
  transition: all 0.3s;
}

.menu-item:hover {
  background: #f5f7fa;
  color: #409eff;
  border-left-color: #409eff;
}

.menu-item.active {
  background: #e6f7ff;
  color: #409eff;
  border-left-color: #409eff;
}

.menu-item i {
  width: 20px;
  text-align: center;
}

.logout-btn {
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-size: 14px;
}

/* 右侧内容 */
.profile-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.content-section {
  padding: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.edit-btn {
  padding: 8px 16px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

/* 表单样式 */
.profile-form {
  max-width: 600px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input.readonly,
.form-group textarea.readonly {
  background: #f5f7fa;
  color: #666;
  cursor: not-allowed;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #409eff;
}

.verified-badge {
  display: inline-block;
  margin-left: 10px;
  padding: 4px 8px;
  background: #f0f9ff;
  color: #409eff;
  border-radius: 4px;
  font-size: 12px;
}

.verify-btn {
  margin-left: 10px;
  padding: 4px 12px;
  background: white;
  border: 1px solid #409eff;
  color: #409eff;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.gender-options {
  display: flex;
  gap: 20px;
  margin-top: 8px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #409eff;
  color: white;
}

.btn-primary:hover {
  background: #66b1ff;
}

.btn-outline {
  background: white;
  border: 1px solid #dcdfe6;
  color: #606266;
}

.btn-outline:hover {
  border-color: #409eff;
  color: #409eff;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

/* 订单概览 */
.order-overview {
  margin-bottom: 30px;
}

.order-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.recent-orders {
  margin-top: 30px;
}

.recent-orders h3 {
  font-size: 18px;
  margin-bottom: 20px;
}

.order-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
  border-bottom: none;
}

.order-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.order-number {
  font-weight: 500;
  color: #333;
}

.order-time {
  font-size: 12px;
  color: #999;
}

.order-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}

.order-status.pending {
  background: #fff2e8;
  color: #fa541c;
}

.order-status.shipped {
  background: #f6ffed;
  color: #52c41a;
}

.order-status.completed {
  background: #fafafa;
  color: #8c8c8c;
}

.order-amount {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
  margin: 0 20px;
}

.view-all-link {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #409eff;
  text-decoration: none;
  font-size: 14px;
}

/* 收藏列表 */
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.favorite-item {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.item-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.item-info {
  padding: 15px;
}

.item-info h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  line-height: 1.4;
}

.item-price {
  color: #f56c6c;
  font-weight: bold;
  margin-bottom: 10px;
}

.item-actions {
  display: flex;
  gap: 10px;
}

/* 地址列表 */
.address-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.address-card {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 20px;
}

.address-card.default {
  border-color: #409eff;
  background: #f0f9ff;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.address-name {
  font-weight: 500;
}

.address-phone {
  color: #666;
}

.default-badge {
  background: #409eff;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.address-content p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.address-actions {
  margin-top: 15px;
  display: flex;
  gap: 15px;
}

.address-actions button {
  background: none;
  border: none;
  color: #409eff;
  cursor: pointer;
  font-size: 14px;
}

.delete-btn {
  color: #f56c6c !important;
}

/* 安全设置 */
.security-settings {
  max-width: 600px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
}

.setting-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.toggle-switch {
  position: relative;
}

.toggle-switch input {
  display: none;
}

.toggle-switch label {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
  background: #ccc;
  border-radius: 13px;
  cursor: pointer;
  transition: background 0.3s;
}

.toggle-switch label:after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

.toggle-switch input:checked + label {
  background: #409eff;
}

.toggle-switch input:checked + label:after {
  transform: translateX(24px);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-state i {
  font-size: 48px;
  color: #dcdfe6;
  margin-bottom: 20px;
}

.empty-state p {
  color: #999;
  margin-bottom: 20px;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
}

.avatar-upload-area {
  text-align: center;
  margin: 20px 0;
}

.upload-tip {
  font-size: 12px;
  color: #666;
  margin-top: -5px;
}

.upload-preview {
  width: 150px;
  height: 150px;
  margin: 0 auto 20px;
  border: 2px dashed #dcdfe6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.upload-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-preview i {
  font-size: 48px;
  color: #dcdfe6;
}

.avatar-upload-area input[type="file"] {
  display: none;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.address-form .form-group {
  margin-bottom: 15px;
}

.address-form input[type="text"],
.address-form input[type="tel"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.address-form label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

/* 通知样式 */
.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 4px;
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.notification.success {
  background-color: #4CAF50;
}

.notification.error {
  background-color: #f44336;
}

/* 头像上传按钮样式增强 */
.avatar-upload {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: #4a90e2;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  cursor: pointer;
}

.upload-btn {
  color: white;
  font-size: 16px;
  cursor: pointer;
}

/* 头像遮罩层样式 */
.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  cursor: pointer;
}

.user-avatar:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay i {
  color: white;
  font-size: 24px;
}
</style>