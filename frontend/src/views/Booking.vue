<template>
  <div class="booking-page">
    <!-- 页面头部 -->
    <section class="page-header">
      <div class="container">
        <div class="header-content">
          <h1>预约上门服务</h1>
          <p>专业团队，贴心服务，让您出行无忧，爱宠在家也能享受无微不至的关怀</p>
        </div>
      </div>
    </section>

    <!-- 预约表单 -->
    <section class="booking-form-section">
      <div class="container">
        <!-- 未登录提示 -->
        <div v-if="!isLoggedIn" class="login-required-notice">
          <div class="notice-content">
            <el-icon class="notice-icon"><UserFilled /></el-icon>
            <h3>需要登录才能预约</h3>
            <p>请先登录您的账户，以便我们为您提供更好的服务</p>
            <div class="notice-actions">
              <router-link to="/login" class="btn btn-primary">立即登录</router-link>
              <router-link to="/register" class="btn btn-outline">注册新账户</router-link>
            </div>
          </div>
        </div>
        
        <div v-else class="booking-container">
          <!-- 左侧信息区 -->
          <div class="booking-info">
            <div class="info-card">
              <h2>为什么选择我们</h2>
              
              <div class="booking-features">
                <div class="feature-item">
                  <div class="feature-icon">
                    <el-icon><Lock /></el-icon>
                  </div>
                  <div class="feature-content">
                    <h3>安全保障</h3>
                    <p>所有服务人员都经过严格背景审查和专业培训，确保您的爱宠安全</p>
                  </div>
                </div>
                
                <div class="feature-item">
                  <div class="feature-icon">
                    <el-icon><Calendar /></el-icon>
                  </div>
                  <div class="feature-content">
                    <h3>灵活预约</h3>
                    <p>24小时在线预约，随时满足您的需求，支持临时加急服务</p>
                  </div>
                </div>
                
                <div class="feature-item">
                  <div class="feature-icon">
                    <el-icon><UserFilled /></el-icon>
                  </div>
                  <div class="feature-content">
                    <h3>专业团队</h3>
                    <p>拥有丰富经验的宠物护理专家团队，熟悉各类宠物习性</p>
                  </div>
                </div>
              </div>
              
              <div class="contact-info">
                <h3>需要帮助？</h3>
                <p>如有任何疑问，请随时联系我们的客服团队</p>
                <div class="contact-methods">
                  <div class="contact-item">
                    <el-icon><Phone /></el-icon>
                    <span>400-123-4567</span>
                  </div>
                  <div class="contact-item">
                    <el-icon><Message /></el-icon>
                    <span>contact@chonglehui.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 右侧表单区 -->
          <div class="booking-form">
            <div class="form-card">
              <h2>预约信息</h2>
              <form @submit.prevent="submitBooking">
                <div class="form-row">
                  <div class="form-group" :class="{ 'has-value': bookingForm.name, 'has-error': formErrors.name }">
                    <label for="name">您的姓名 *</label>
                    <input type="text" id="name" v-model="bookingForm.name" required>
                    <span class="form-border"></span>
                    <div v-if="formErrors.name" class="error-message">{{ formErrors.name }}</div>
                  </div>
                  
                  <div class="form-group" :class="{ 'has-value': bookingForm.phone, 'has-error': formErrors.phone }">
                    <label for="phone">联系电话 *</label>
                    <input type="tel" id="phone" v-model="bookingForm.phone" required>
                    <span class="form-border"></span>
                    <div v-if="formErrors.phone" class="error-message">{{ formErrors.phone }}</div>
                  </div>
                </div>
                
                <div class="form-group" :class="{ 'has-value': bookingForm.address, 'has-error': formErrors.address }">
                    <label for="address">服务地址 *</label>
                    <input type="text" id="address" v-model="bookingForm.address" required>
                    <span class="form-border"></span>
                    <div v-if="formErrors.address" class="error-message">{{ formErrors.address }}</div>
                  </div>
                
                <div class="form-row">
                  <div class="form-group" :class="{ 'has-value': bookingForm.petType, 'has-error': formErrors.petType }">
                    <label for="pet-type">宠物类型 *</label>
                    <select id="pet-type" v-model="bookingForm.petType" required>
                      <option value="" disabled selected>请选择宠物类型</option>
                      <option value="dog">狗狗</option>
                      <option value="cat">猫咪</option>
                      <option value="other">其他</option>
                    </select>
                    <span class="form-border"></span>
                    <div v-if="formErrors.petType" class="error-message">{{ formErrors.petType }}</div>
                  </div>
                  
                  <div class="form-group" :class="{ 'has-value': bookingForm.serviceType, 'has-error': formErrors.serviceType }">
                    <label for="service-type">服务类型 *</label>
                    <select id="service-type" v-model="bookingForm.serviceType" required>
                      <option value="" disabled selected>请选择服务类型</option>
                      <option value="care">专业看护师上门照料</option>
                      <option value="walk">专业遛狗服务</option>
                      <option value="custom">个性定制项目</option>
                    </select>
                    <span class="form-border"></span>
                    <div v-if="formErrors.serviceType" class="error-message">{{ formErrors.serviceType }}</div>
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="pet-info">宠物信息（品种、年龄、性格等）</label>
                  <textarea id="pet-info" v-model="bookingForm.petInfo" rows="3"></textarea>
                  <span class="form-border"></span>
                </div>
                
                <div class="form-row">
                  <div class="form-group" :class="{ 'has-value': bookingForm.serviceDate }">
                    <label for="service-date">服务日期 *</label>
                    <input type="date" id="service-date" v-model="bookingForm.serviceDate" required>
                    <span class="form-border"></span>
                  </div>
                  
                  <div class="form-group">
                    <label for="service-time">服务时间</label>
                    <select id="service-time" v-model="bookingForm.serviceTime">
                      <option value="morning">上午 (8:00-12:00)</option>
                      <option value="afternoon">下午 (12:00-18:00)</option>
                      <option value="evening">晚上 (18:00-21:00)</option>
                    </select>
                    <span class="form-border"></span>
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="special-requests">特殊需求</label>
                  <textarea id="special-requests" v-model="bookingForm.specialRequests" rows="3"></textarea>
                  <span class="form-border"></span>
                </div>
                
                <button type="submit" class="submit-btn" :class="{ loading: isSubmitting, success: submitSuccess }" :disabled="isSubmitting || isFormInvalid" @click="handleButtonClick">
                <span v-if="!isSubmitting && !submitSuccess" class="btn-text">提交预约</span>
                <span v-else-if="isSubmitting" class="btn-text">提交中...</span>
                <span v-else-if="submitSuccess" class="btn-text">提交成功!</span>
                <div class="loading-spinner" v-if="isSubmitting"></div>
                <div class="success-checkmark" v-if="submitSuccess">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                    <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                    <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                  </svg>
                </div>
              </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
</div>
    
    <!-- 通知组件 -->
    <div v-if="notification" :class="['notification', notificationType]">
      {{ notification }}
    </div>
 
</template>

<script>
import { Lock, Calendar, UserFilled, Phone, Message, SuccessFilled, CircleCloseFilled } from '@element-plus/icons-vue';
import { bookingApi } from '../api';
import { useUserStore } from '../stores/user';

export default {
  name: 'Booking',
  components: {
    Lock,
    Calendar,
    UserFilled,
    Phone,
    Message,
    SuccessFilled,
    CircleCloseFilled
  },
  data() {
    return {
      bookingForm: {
        name: '',
        phone: '',
        address: '',
        petType: '',
        petInfo: '',
        serviceType: '',
        serviceDate: '',
        serviceTime: 'morning',
        specialRequests: ''
      },
      isSubmitting: false,
      submitSuccess: false,
      formErrors: {
        name: '',
        phone: '',
        address: '',
        petType: '',
        serviceType: '',
        serviceDate: ''
      },
      notification: null,
      notificationType: null,
      bookings: []
    }
  },
  setup() {
    const userStore = useUserStore();
    
    // 初始化用户状态
    console.log('Booking组件setup: 初始化用户状态');
    userStore.initFromStorage();
    
    // 添加调试日志
    console.log('Booking组件setup: 用户状态初始化完成', {
      user: userStore.user,
      token: userStore.token,
      isLoggedIn: userStore.isLoggedIn,
      userId: userStore.userId
    });
    
    return {
      userStore
    };
  },
  computed: {
    isFormInvalid() {
      // 重置错误信息
      this.formErrors = {
        name: '',
        phone: '',
        address: '',
        petType: '',
        serviceType: '',
        serviceDate: ''
      };
      
      let isInvalid = false;
      
      // 验证姓名
      if (!this.bookingForm.name.trim()) {
        this.formErrors.name = '请输入您的姓名';
        isInvalid = true;
      }
      
      // 验证电话
      if (!this.bookingForm.phone.trim()) {
        this.formErrors.phone = '请输入联系电话';
        isInvalid = true;
      } else if (!/^1[3-9]\d{9}$/.test(this.bookingForm.phone.replace(/\s/g, ''))) {
        this.formErrors.phone = '请输入有效的手机号码';
        isInvalid = true;
      }
      
      // 验证地址
      if (!this.bookingForm.address.trim()) {
        this.formErrors.address = '请输入服务地址';
        isInvalid = true;
      }
      
      // 验证宠物类型
      if (!this.bookingForm.petType) {
        this.formErrors.petType = '请选择宠物类型';
        isInvalid = true;
      }
      
      // 验证服务类型
      if (!this.bookingForm.serviceType) {
        this.formErrors.serviceType = '请选择服务类型';
        isInvalid = true;
      }
      
      // 验证服务日期
      if (!this.bookingForm.serviceDate) {
        this.formErrors.serviceDate = '请选择服务日期';
        isInvalid = true;
      } else {
        const selectedDate = new Date(this.bookingForm.serviceDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          this.formErrors.serviceDate = '服务日期不能早于今天';
          isInvalid = true;
        }
      }
      
      // 添加调试日志
      console.log('表单验证状态:', {
        formErrors: this.formErrors,
        isInvalid: isInvalid
      });
      
      return isInvalid;
    },
    isLoggedIn() {
      // 检查用户是否已登录
      const loggedIn = this.userStore ? this.userStore.isLoggedIn : false;
      
      // 添加调试日志
      console.log('登录状态检查:', {
        userStore: !!this.userStore,
        isLoggedIn: loggedIn,
        hasToken: !!sessionStorage.getItem('token'),
        hasUser: !!sessionStorage.getItem('user')
      });
      
      return loggedIn;
    }
  },
  mounted() {
    // 确保用户状态已初始化
    if (this.userStore) {
      this.userStore.initFromStorage();
      
      // 添加调试日志
      console.log('用户状态:', {
        user: this.userStore.user,
        token: this.userStore.token,
        isLoggedIn: this.userStore.isLoggedIn,
        userId: this.userStore.userId
      });
      
      // 检查用户是否已登录
      if (!this.isLoggedIn) {
        console.log('用户未登录');
        // 不显示错误消息，因为模板中已经有未登录提示区域
        // 不自动跳转，让用户自己决定
      } else {
        console.log('用户已登录，预填充用户信息');
        // 如果已登录，预填充用户信息
        this.prefillUserInfo();
      }
    } else {
      console.log('userStore 未初始化');
    }
  },
  methods: {
    // 处理按钮点击事件
    handleButtonClick() {
      console.log('========== 预约按钮被点击 ==========');
      console.log('预约按钮被点击', {
        isSubmitting: this.isSubmitting,
        isFormInvalid: this.isFormInvalid,
        isLoggedIn: this.isLoggedIn,
        formValues: this.bookingForm
      });
      
      console.log('当前表单数据:', {
        name: this.bookingForm.name,
        phone: this.bookingForm.phone,
        address: this.bookingForm.address,
        petType: this.bookingForm.petType,
        petInfo: this.bookingForm.petInfo,
        serviceType: this.bookingForm.serviceType,
        serviceDate: this.bookingForm.serviceDate,
        serviceTime: this.bookingForm.serviceTime,
        specialRequests: this.bookingForm.specialRequests
      });
      
      // 如果表单无效，显示错误信息
      if (this.isFormInvalid) {
        console.log('表单验证失败');
        
        // 收集所有错误信息
        const errorMessages = Object.values(this.formErrors).filter(msg => msg);
        
        if (errorMessages.length > 0) {
          // 显示第一个错误信息
          this.showErrorMessage(errorMessages[0]);
        } else {
          this.showErrorMessage('请填写所有必填字段');
        }
        
        return;
      }
      
      // 如果用户未登录，显示错误信息
      if (!this.isLoggedIn) {
        console.log('用户未登录');
        this.showErrorMessage('请先登录后再进行预约');
        return;
      }
      
      console.log('按钮点击验证通过，开始提交预约');
      this.submitBooking();
    },
    
    // 预填充用户信息
    prefillUserInfo() {
      if (this.userStore && this.userStore.user) {
        const user = this.userStore.user;
        this.bookingForm.name = user.username || '';
        this.bookingForm.phone = user.phone || '';
        this.bookingForm.address = user.address || '';
      }
    },
    
    // 显示需要登录的消息
    showLoginRequiredMessage() {
      this.showErrorMessage('请先登录后再进行预约');
      // 不再自动跳转，让用户自己决定
    },
    
    // 强制刷新用户状态
    refreshUserState() {
      if (this.userStore) {
        console.log('强制刷新用户状态');
        this.userStore.initFromStorage();
        
        // 添加调试日志
        console.log('刷新后的用户状态:', {
          user: this.userStore.user,
          token: this.userStore.token,
          isLoggedIn: this.userStore.isLoggedIn,
          userId: this.userStore.userId
        });
      }
    },
    
    handleButtonClick() {
      console.log('========== 预约按钮被点击 ==========');
      console.log('预约按钮被点击', {
        isSubmitting: this.isSubmitting,
        isFormInvalid: this.isFormInvalid,
        isLoggedIn: this.isLoggedIn,
        formValues: this.bookingForm
      });
      
      console.log('当前表单数据:', {
        name: this.bookingForm.name,
        phone: this.bookingForm.phone,
        address: this.bookingForm.address,
        petType: this.bookingForm.petType,
        petInfo: this.bookingForm.petInfo,
        serviceType: this.bookingForm.serviceType,
        serviceDate: this.bookingForm.serviceDate,
        serviceTime: this.bookingForm.serviceTime,
        specialRequests: this.bookingForm.specialRequests
      });
      
      // 如果表单无效，显示错误信息
      if (this.isFormInvalid) {
        console.log('表单验证失败');
        
        // 收集所有错误信息
        const errorMessages = Object.values(this.formErrors).filter(msg => msg);
        
        if (errorMessages.length > 0) {
          // 显示第一个错误信息
          this.showErrorMessage(errorMessages[0]);
        } else {
          this.showErrorMessage('请填写所有必填字段');
        }
        
        return;
      }
      
      // 如果用户未登录，显示错误信息
      if (!this.isLoggedIn) {
        console.log('用户未登录');
        this.showErrorMessage('请先登录后再进行预约');
        return;
      }
      
      console.log('按钮点击验证通过，开始提交预约');
      this.submitBooking();
    },
    
    async submitBooking() {
      console.log('========== 开始提交预约 ==========');
      console.log('预约表单提交', {
        isSubmitting: this.isSubmitting,
        isFormInvalid: this.isFormInvalid,
        isLoggedIn: this.isLoggedIn,
        formValues: this.bookingForm
      });
      
      // 如果表单无效，显示错误信息
      if (this.isFormInvalid) {
        console.log('表单验证失败');
        this.showErrorMessage('请填写所有必填字段');
        return;
      }
      
      // 如果用户未登录，显示错误信息
      if (!this.isLoggedIn) {
        console.log('用户未登录');
        this.showErrorMessage('请先登录后再进行预约');
        return;
      }
      
      console.log('表单验证通过，开始提交预约');
      
      // 强制刷新用户状态
      this.refreshUserState();
      
      // 直接检查sessionStorage中的用户数据
      const token = sessionStorage.getItem('token');
      const userStr = sessionStorage.getItem('user');
      let user = null;
      let isLoggedInDirectly = false;
      let userIdDirectly = null;
      
      if (token && userStr) {
        try {
          user = JSON.parse(userStr);
          userIdDirectly = user.userId || user.id;
          // 更灵活的登录状态检查：只要有token和userId/id就认为已登录
          isLoggedInDirectly = !!(user && userIdDirectly && token);
          
          console.log('直接检查用户数据:', {
            user: user,
            userIdDirectly: userIdDirectly,
            hasToken: !!token,
            hasEmail: !!user.email,
            isLoggedInDirectly: isLoggedInDirectly
          });
        } catch (e) {
          console.error('解析用户数据失败:', e);
        }
      } else {
        console.log('缺少登录数据:', {
          hasToken: !!token,
          hasUserStr: !!userStr
        });
      }
      
      // 添加调试日志
      console.log('提交预约时的用户状态:', {
        userStore: this.userStore,
        user: this.userStore ? this.userStore.user : null,
        token: this.userStore ? this.userStore.token : null,
        isLoggedIn: this.isLoggedIn,
        userId: this.userStore ? this.userStore.userId : null,
        // 直接检查的数据
        tokenDirect: token,
        userDirect: user,
        isLoggedInDirectly
      });
      
      // 使用直接检查的结果
      if (!isLoggedInDirectly) {
        console.log('用户未登录，显示错误消息');
        this.showErrorMessage('请先登录后再进行预约');
        return;
      }
      
      console.log('用户已登录，继续提交预约');
      
      // 添加表单验证
      if (!this.validateForm()) {
        console.log('表单验证失败');
        return;
      }
      
      console.log('表单验证通过，准备提交');
      
      // 设置提交状态
      this.isSubmitting = true;
      this.submitSuccess = false;
      
      try {
        // 调用实际API请求
        console.log('开始调用API提交预约');
        const bookingResult = await this.submitBookingToApi();
        console.log('API调用成功，返回结果:', bookingResult);
        
        // 设置成功状态
        this.submitSuccess = true;
        
        // 显示成功消息，包含预约编号
        this.showSuccessMessage(bookingResult.bookingNumber);
        
        // 添加庆祝动画效果
        this.celebrateSuccess();
        
        // 3秒后重置表单和状态
        setTimeout(() => {
          this.resetForm();
          this.submitSuccess = false;
        }, 3000);
        
      } catch (error) {
        console.error('预约提交失败:', error);
        // 显示错误消息
        this.showErrorMessage(error.message || '预约提交失败，请稍后再试');
      } finally {
        // 重置提交状态
        this.isSubmitting = false;
        console.log('========== 预约提交流程结束 ==========');
      }
    },
    
    resetForm() {
      // 重置表单数据
      this.bookingForm = {
        name: '',
        phone: '',
        address: '',
        petType: '',
        petInfo: '',
        serviceType: '',
        serviceDate: '',
        serviceTime: 'morning',
        specialRequests: ''
      };
      
      // 如果用户已登录，重新预填充用户信息
      if (this.isLoggedIn) {
        this.prefillUserInfo();
      }
      
      console.log('表单已重置');
    },
    
    celebrateSuccess() {
      // 创建庆祝效果
      const celebration = document.createElement('div');
      celebration.className = 'celebration';
      celebration.innerHTML = `
        <div class="confetti"></div>
        <div class="confetti"></div>
        <div class="confetti"></div>
        <div class="confetti"></div>
        <div class="confetti"></div>
      `;
      
      // 添加到页面
      document.body.appendChild(celebration);
      
      // 3秒后移除
      setTimeout(() => {
        if (document.body.contains(celebration)) {
          document.body.removeChild(celebration);
        }
      }, 3000);
    },
    
    validateForm() {
      // 基本表单验证
      if (!this.bookingForm.name || !this.bookingForm.phone || !this.bookingForm.address) {
        this.showErrorMessage('请填写所有必填字段：姓名、电话和地址');
        return false;
      }
      
      // 验证必填的下拉选择字段
      if (!this.bookingForm.petType) {
        this.showErrorMessage('请选择宠物类型');
        return false;
      }
      
      if (!this.bookingForm.serviceType) {
        this.showErrorMessage('请选择服务类型');
        return false;
      }
      
      if (!this.bookingForm.serviceDate) {
        this.showErrorMessage('请选择服务日期');
        return false;
      }
      
      // 验证手机号格式
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(this.bookingForm.phone)) {
        this.showErrorMessage('请输入有效的手机号码');
        return false;
      }
      
      // 验证服务日期不能是过去的日期
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const serviceDate = new Date(this.bookingForm.serviceDate);
      if (serviceDate < today) {
        this.showErrorMessage('服务日期不能是过去的日期');
        return false;
      }
      
      return true;
    },
    
    async submitBookingToApi() {
      console.log('========== 开始API预约提交 ==========');
      
      // 调用后端API提交预约
      try {
        // 直接从sessionStorage获取用户ID
        const userStr = sessionStorage.getItem('user');
        let userId = null;
        let userData = null;
        
        const token = sessionStorage.getItem('token');
        console.log('检查sessionStorage中的用户数据:', {
          userStr: userStr,
          token: token,
          tokenLength: token ? token.length : 0,
          tokenStart: token ? token.substring(0, 20) + '...' : null
        });
        
        if (userStr) {
          try {
            userData = JSON.parse(userStr);
            userId = userData.userId || userData.id;
            
            console.log('解析用户数据成功:', {
              userData: userData,
              userId: userId,
              hasId: !!(userData.userId || userData.id),
              hasEmail: !!userData.email
            });
          } catch (e) {
            console.error('解析用户数据失败:', e);
          }
        }
        
        if (!userId) {
          console.error('用户ID获取失败:', {
            userData: userData,
            userId: userId
          });
          throw new Error('用户未登录或用户信息不完整');
        }
        
        console.log('提交预约，用户ID:', userId);
        
        // 准备预约数据
        const bookingData = {
          userId,
          name: this.bookingForm.name,
          phone: this.bookingForm.phone,
          address: this.bookingForm.address,
          petType: this.bookingForm.petType,
          petInfo: this.bookingForm.petInfo,
          serviceType: this.bookingForm.serviceType,
          serviceDate: this.bookingForm.serviceDate,
          serviceTime: this.bookingForm.serviceTime,
          specialRequests: this.bookingForm.specialRequests
        };
        
        console.log('准备提交的预约数据:', bookingData);
        
        // 调用API创建预约
        console.log('调用bookingApi.createBooking...');
        const response = await bookingApi.createBooking(bookingData);
        console.log('API调用返回结果:', response);
        
        if (response.success) {
          console.log('API调用成功，返回数据:', response.data);
          return response.data;
        } else {
          console.error('API调用失败，返回错误:', response.message);
          throw new Error(response.message || '预约提交失败');
        }
      } catch (error) {
        console.error('预约提交错误:', error);
        console.error('错误详情:', {
          message: error.message,
          stack: error.stack,
          response: error.response
        });
        
        // 如果是401错误，显示特定的错误消息
        if (error.message.includes('登录已过期') || error.message.includes('401')) {
          throw new Error('请先登录后再进行预约');
        }
        
        throw error;
      } finally {
        console.log('========== API预约提交流程结束 ==========');
      }
    },
    
    showSuccessMessage(bookingNumber) {
      // 创建成功提示元素
      const notification = document.createElement('div');
      notification.className = 'notification success';
      notification.innerHTML = `
        <div class="notification-content">
          <div class="notification-icon">
            <el-icon><SuccessFilled /></el-icon>
          </div>
          <div class="notification-text">
            <h4>预约成功！</h4>
            <p>您的预约编号是：<strong>${bookingNumber || 'BK' + Date.now()}</strong></p>
            <p>我们的工作人员将尽快与您联系确认服务细节。</p>
            <button class="notification-btn" onclick="this.parentElement.parentElement.parentElement.remove()">知道了</button>
          </div>
        </div>
      `;
      
      // 添加到页面
      document.body.appendChild(notification);
      
      // 添加显示动画
      setTimeout(() => {
        notification.classList.add('show');
      }, 10);
      
      // 5秒后自动移除
      const autoRemoveTimer = setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 5000);
      
      // 如果用户点击"知道了"按钮，取消自动移除
      const btn = notification.querySelector('.notification-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          clearTimeout(autoRemoveTimer);
        });
      }
    },
    
    showErrorMessage(message) {
      // 创建错误提示元素
      const notification = document.createElement('div');
      notification.className = 'notification error';
      notification.innerHTML = `
        <div class="notification-content">
          <div class="notification-icon">
            <el-icon><CircleCloseFilled /></el-icon>
          </div>
          <div class="notification-text">
            <h4>操作失败</h4>
            <p>${message}</p>
            <button class="notification-btn" onclick="this.parentElement.parentElement.parentElement.remove()">知道了</button>
          </div>
        </div>
      `;
      
      // 添加到页面
      document.body.appendChild(notification);
      
      // 添加显示动画
      setTimeout(() => {
        notification.classList.add('show');
      }, 10);
      
      // 5秒后自动移除
      const autoRemoveTimer = setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 5000);
      
      // 如果用户点击"知道了"按钮，取消自动移除
      const btn = notification.querySelector('.notification-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          clearTimeout(autoRemoveTimer);
        });
      }
    },

    showNotification(message, type = 'success') {
      this.notification = message;
      this.notificationType = type;
      
      setTimeout(() => {
        this.notification = null;
        this.notificationType = null;
      }, 3000);
    },
    
    saveBooking() {
      // 保存预约记录
      const booking = {
        id: Date.now(),
        ...this.bookingForm,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      // 获取现有预约记录
      const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      
      // 添加新预约
      existingBookings.push(booking);
      
      // 保存到localStorage
      localStorage.setItem('bookings', JSON.stringify(existingBookings));
      
      // 更新本地数据
      this.bookings = existingBookings;
    },

    showNotification(options) {
      const {
        type = 'success',
        title = '',
        message = '',
        description = '',
        duration = 5000
      } = options;

      // 创建通知容器
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      
      // 创建通知内容
      const content = document.createElement('div');
      content.className = 'notification-content';
      
      // 创建图标
      const iconContainer = document.createElement('div');
      iconContainer.className = 'notification-icon';
      const icon = document.createElement('el-icon');
      icon.innerHTML = type === 'success' ? '<SuccessFilled />' : '<CircleCloseFilled />';
      iconContainer.appendChild(icon);
      
      // 创建文本内容
      const textContainer = document.createElement('div');
      textContainer.className = 'notification-text';
      
      if (title) {
        const titleElement = document.createElement('h4');
        titleElement.textContent = title;
        textContainer.appendChild(titleElement);
      }
      
      if (message) {
        const messageElement = document.createElement('p');
        messageElement.innerHTML = message;
        textContainer.appendChild(messageElement);
      }
      
      if (description) {
        const descElement = document.createElement('p');
        descElement.textContent = description;
        textContainer.appendChild(descElement);
      }
      
      // 创建关闭按钮
      const closeBtn = document.createElement('button');
      closeBtn.className = 'notification-btn';
      closeBtn.textContent = '知道了';
      closeBtn.addEventListener('click', () => {
        this.removeNotification(notification);
      });
      textContainer.appendChild(closeBtn);
      
      // 组装通知
      content.appendChild(iconContainer);
      content.appendChild(textContainer);
      notification.appendChild(content);
      
      // 添加到页面
      document.body.appendChild(notification);
      
      // 显示动画
      requestAnimationFrame(() => {
        notification.classList.add('show');
      });
      
      // 自动移除
      if (duration > 0) {
        setTimeout(() => {
          this.removeNotification(notification);
        }, duration);
      }
      
      return notification;
    },

    removeNotification(notification) {
      if (!notification || !document.body.contains(notification)) {
        return;
      }
      
      notification.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    },
    
    resetForm() {
      // 重置表单数据
      this.bookingForm = {
        name: '',
        phone: '',
        address: '',
        petType: '',
        petInfo: '',
        serviceType: '',
        serviceDate: '',
        serviceTime: 'morning',
        specialRequests: ''
      };
      
      // 重置状态
      this.submitSuccess = false;
    },
    
    celebrateSuccess() {
      // 创建庆祝动画元素
      const celebrationContainer = document.createElement('div');
      celebrationContainer.className = 'celebration-container';
      celebrationContainer.innerHTML = `
        <div class="celebration-content">
          <div class="success-animation">
            <div class="checkmark-circle"></div>
            <div class="checkmark"></div>
          </div>
          <div class="confetti-container"></div>
        </div>
      `;
      
      // 添加到页面
      document.body.appendChild(celebrationContainer);
      
      // 创建五彩纸屑效果
      const confettiContainer = celebrationContainer.querySelector('.confetti-container');
      const colors = ['#5D9CEC', '#73D13D', '#FFC107', '#FF5722', '#9C27B0'];
      
      for (let i = 0; i < 60; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.animationDelay = `${Math.random() * 0.5}s`;
        confetti.style.animationDuration = `${1.5 + Math.random() * 2}s`;
        confettiContainer.appendChild(confetti);
      }
      
      // 显示动画
      setTimeout(() => {
        celebrationContainer.classList.add('show');
      }, 10);
      
      // 2.5秒后移除动画
      setTimeout(() => {
        celebrationContainer.classList.remove('show');
        setTimeout(() => {
          if (document.body.contains(celebrationContainer)) {
            document.body.removeChild(celebrationContainer);
          }
        }, 500);
      }, 2500);
    }
  }
}
</script>

<style scoped>
.booking-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 页面头部样式 */
.page-header {
  background: linear-gradient(135deg, #5D9CEC 0%, #73D13D 100%);
  color: white;
  padding: 60px 0 80px;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="%23f8f9fa" fill-opacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,133.3C960,128,1056,96,1152,90.7C1248,85,1344,107,1392,117.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>');
  background-size: cover;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;
}

.header-content h1 {
  font-size: 2.8rem;
  font-weight: 700;
  margin-bottom: 20px;
  letter-spacing: -0.5px;
}

.header-content p {
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
}

/* 预约表单区域 */
.booking-form-section {
  padding: 80px 0 100px;
}

.booking-container {
  display: flex;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 左侧信息区 */
.booking-info {
  flex: 1;
}

.info-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 40px;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.info-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  background: linear-gradient(to bottom, #5D9CEC, #73D13D);
}

.info-card h2 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 30px;
  color: #333;
}

.booking-features {
  margin-bottom: 40px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid #f0f0f0;
}

.feature-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.feature-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(93, 156, 236, 0.1), rgba(115, 209, 61, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(93, 156, 236, 0.15);
  transition: all 0.3s ease;
}

.feature-icon:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(93, 156, 236, 0.25);
}

.feature-icon .el-icon,
.feature-icon svg {
  font-size: 24px;
  width: 24px;
  height: 24px;
  color: #5D9CEC;
  fill: #5D9CEC;
  transition: all 0.3s ease;
}

.feature-item:hover .feature-icon .el-icon,
.feature-item:hover .feature-icon svg {
  transform: scale(1.1);
}

.feature-content h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.feature-content p {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

.contact-info {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 25px;
  margin-top: 30px;
}

.contact-info h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
}

.contact-info > p {
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 20px;
}

.contact-methods {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  font-size: 0.95rem;
  color: #555;
}

.contact-item .el-icon {
  margin-right: 12px;
  color: #5D9CEC;
  font-size: 20px;
}

/* 右侧表单区 */
.booking-form {
  flex: 1.2;
}

.form-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.form-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 6px;
  height: 100%;
  background: linear-gradient(to bottom, #5D9CEC, #73D13D);
}

.form-card h2 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 30px;
  color: #333;
}

/* 表单样式 */
.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
}

.form-group {
  position: relative;
  margin-bottom: 25px;
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  color: #333;
  background-color: #fff;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #5D9CEC;
  outline: none;
  box-shadow: 0 0 0 3px rgba(93, 156, 236, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-border {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(to right, #5D9CEC, #73D13D);
  transition: width 0.3s ease;
}

.form-group input:focus + .form-border,
.form-group select:focus + .form-border,
.form-group textarea:focus + .form-border {
  width: 100%;
}

/* 有值时的样式 */
.form-group.has-value label,
.form-group input:focus ~ label,
.form-group select:focus ~ label,
.form-group textarea:focus ~ label {
  color: #5D9CEC;
  font-size: 0.85rem;
}

/* 必填字段提示 */
.form-group label::after {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  background-color: #ff4d4f;
  border-radius: 50%;
  margin-left: 4px;
  vertical-align: middle;
}

.form-group:not([required]) label::after {
  display: none;
}

/* 表单状态指示器 */
.form-status {
  display: flex;
  align-items: center;
  color: #ff7875;
  font-size: 0.9rem;
  margin-top: 15px;
  padding: 10px 15px;
  background-color: #fff2f0;
  border-radius: 6px;
  border-left: 3px solid #ff4d4f;
}

.form-status .el-icon {
  margin-right: 8px;
}

/* 提交按钮 */
.submit-btn {
  background: linear-gradient(135deg, #5D9CEC, #73D13D);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-top: 15px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-style: preserve-3d;
  perspective: 1000px;
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.submit-btn::after {
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

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(93, 156, 236, 0.3);
}

.submit-btn:hover:not(:disabled)::before {
  left: 100%;
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 4px 15px rgba(93, 156, 236, 0.2);
}

.submit-btn:active:not(:disabled)::after {
  width: 300px;
  height: 300px;
}

.submit-btn:disabled {
  cursor: not-allowed;
  opacity: 0.8;
}

.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 4px;
  color: white;
  font-weight: 500;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.notification.success {
  background-color: #4CAF50;
}

.notification.error {
  background-color: #f44336;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 成功状态样式 */
.submit-btn.success {
  background: linear-gradient(135deg, #73D13D, #52c41a);
  animation: successPulse 0.6s ease;
}

@keyframes successPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* 按钮文本动画 */
.btn-text {
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.submit-btn.loading .btn-text,
.submit-btn.success .btn-text {
  animation: textFade 0.3s ease;
}

@keyframes textFade {
  0% { opacity: 1; transform: translateY(0); }
  50% { opacity: 0; transform: translateY(-10px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* 加载动画 */
.loading-spinner {
  display: none;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-left: 10px;
  position: relative;
  z-index: 2;
}

.submit-btn.loading .loading-spinner {
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 成功勾选标记 */
.success-checkmark {
  display: none;
  width: 24px;
  height: 24px;
  margin-left: 10px;
  position: relative;
  z-index: 2;
}

.submit-btn.success .success-checkmark {
  display: inline-block;
}

.checkmark-circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 2;
  stroke-miterlimit: 10;
  stroke: #fff;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  stroke: #fff;
  stroke-width: 3;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes stroke {
  100% {
    stroke-dashoffset: 0;
  }
}

/* 通知组件样式 */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 0;
  z-index: 1000;
  transform: translateX(120%);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  max-width: 420px;
  overflow: hidden;
}

.notification.show {
  transform: translateX(0);
}

.notification.success {
  border-left: 5px solid #73D13D;
  background: linear-gradient(to right, rgba(115, 209, 61, 0.05), rgba(115, 209, 61, 0.02));
}

.notification.error {
  border-left: 5px solid #f44336;
  background: linear-gradient(to right, rgba(244, 67, 54, 0.05), rgba(244, 67, 54, 0.02));
}

.notification-content {
  display: flex;
  padding: 20px;
}

.notification-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.notification.success .notification-icon {
  background-color: rgba(115, 209, 61, 0.1);
}

.notification.success svg {
  color: #73D13D;
  width: 24px;
  height: 24px;
}

.notification.error .notification-icon {
  background-color: rgba(244, 67, 54, 0.1);
}

.notification.error svg {
  color: #f44336;
  width: 24px;
  height: 24px;
}

.notification-text {
  flex: 1;
}

.notification-text h4 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.notification-text p {
  margin: 0 0 8px 0;
  font-size: 0.9rem;
  color: #555;
  line-height: 1.4;
}

.notification-text p:last-child {
  margin-bottom: 16px;
}

.notification-text strong {
  color: #73D13D;
  font-weight: 600;
}

.notification-btn {
  background: #73D13D;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.notification-btn:hover {
  background: #5cb85c;
  transform: translateY(-1px);
}

.notification.error .notification-btn {
  background: #f44336;
}

.notification.error .notification-btn:hover {
  background: #d32f2f;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .booking-container {
    flex-direction: column;
    gap: 30px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}

@media (max-width: 768px) {
  .header-content h1 {
    font-size: 2.2rem;
  }
  
  .header-content p {
    font-size: 1rem;
  }
  
  .info-card,
  .form-card {
    padding: 30px 20px;
  }
  
  .booking-form-section {
    padding: 60px 0 80px;
  }
}

@media (max-width: 576px) {
  .header-content h1 {
    font-size: 1.8rem;
  }
  
  .info-card h2,
  .form-card h2 {
    font-size: 1.5rem;
  }
}

/* 未登录提示样式 */
.login-required-notice {
  max-width: 600px;
  margin: 0 auto 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #eaeaea;
}

.notice-content {
  padding: 40px;
  text-align: center;
}

.notice-icon {
  width: 3rem;
  height: 3rem;
  color: #5D9CEC;
  margin-bottom: 20px;
}

.notice-content h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 15px;
  font-weight: 600;
}

.notice-content p {
  color: #666;
  margin-bottom: 30px;
  line-height: 1.6;
}

.notice-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  font-size: 0.95rem;
}

.btn-primary {
  background: linear-gradient(135deg, #5D9CEC, #4a8fe7);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(93, 156, 236, 0.3);
}

.btn-outline {
  background: transparent;
  color: #5D9CEC;
  border: 1px solid #5D9CEC;
}

.btn-outline:hover {
  background: #5D9CEC;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(93, 156, 236, 0.2);
}

@media (max-width: 576px) {
  .notice-content {
    padding: 30px 20px;
  }
  
  .notice-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 200px;
  }
}

/* 庆祝动画样式 */
.celebration {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}

.celebration .confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #5D9CEC;
  opacity: 0;
  animation: confettiFall 3s ease-out forwards;
}

.celebration .confetti:nth-child(1) {
  left: 10%;
  background: #5D9CEC;
  animation-delay: 0.1s;
}

.celebration .confetti:nth-child(2) {
  left: 30%;
  background: #73D13D;
  animation-delay: 0.3s;
}

.celebration .confetti:nth-child(3) {
  left: 50%;
  background: #FF7875;
  animation-delay: 0.5s;
}

.celebration .confetti:nth-child(4) {
  left: 70%;
  background: #FFC53D;
  animation-delay: 0.7s;
}

.celebration .confetti:nth-child(5) {
  left: 90%;
  background: #B37FEB;
  animation-delay: 0.9s;
}

@keyframes confettiFall {
  0% {
    opacity: 1;
    transform: translateY(-100vh) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translateY(100vh) rotate(720deg);
  }
}

.celebration-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  opacity: 0;
  transition: opacity 0.5s ease;
  background-color: rgba(0, 0, 0, 0.1);
}

.celebration-container.show {
  opacity: 1;
}

.celebration-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.success-animation {
  position: relative;
  width: 120px;
  height: 120px;
  z-index: 10;
}

.checkmark-circle {
  position: absolute;
  top: 0;
  left: 0;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 5px solid #73D13D;
  opacity: 0;
  transform: scale(0);
  animation: scaleIn 0.4s ease-out forwards;
  box-shadow: 0 0 20px rgba(115, 209, 61, 0.5);
}

.checkmark {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 36px;
  height: 60px;
  margin-left: -18px;
  margin-top: -30px;
  opacity: 0;
  transform: scale(0) rotate(45deg);
  animation: scaleInRotate 0.4s ease-out 0.2s forwards;
}

.checkmark::before,
.checkmark::after {
  content: '';
  position: absolute;
  background-color: #73D13D;
  border-radius: 3px;
  box-shadow: 0 0 10px rgba(115, 209, 61, 0.5);
}

.checkmark::before {
  width: 5px;
  height: 30px;
  left: 16px;
  top: 0;
}

.checkmark::after {
  width: 18px;
  height: 5px;
  left: 0;
  top: 25px;
}

@keyframes scaleIn {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes scaleInRotate {
  0% {
    opacity: 0;
    transform: scale(0) rotate(45deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(45deg);
  }
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.confetti {
  position: absolute;
  width: 12px;
  height: 12px;
  opacity: 0;
  animation: confettiFall 2.5s ease-out forwards;
  border-radius: 2px;
}

@keyframes confettiFall {
  0% {
    opacity: 1;
    transform: translateY(-100vh) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translateY(100vh) rotate(720deg);
  }
}

/* 表单验证错误样式 */
.form-group.has-error input,
.form-group.has-error select,
.form-group.has-error textarea {
  border-color: #ff4d4f;
}

.form-group.has-error .form-border {
  background-color: #ff4d4f;
}

.error-message {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 5px;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>