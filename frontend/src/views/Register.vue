<template>
  <div class="register">
    <div class="register-container">
      <h2>📝 用户注册</h2>
      
      <!-- 成功/错误消息 -->
      <div v-if="message" :class="['alert', messageType]">
        {{ message }}
        <span v-if="isSuccess" class="redirect-countdown">
          {{ countdown }}秒后自动跳转...
        </span>
      </div>
      
      <!-- 注册表单 -->
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name">用户名</label>
          <input
            type="text"
            id="name"
            v-model="form.name"
            class="form-control"
            placeholder="请输入用户名"
            required
            :disabled="loading"
          />
        </div>
        
        <div class="form-group">
          <label for="email">邮箱地址</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            class="form-control"
            placeholder="请输入邮箱"
            required
            :disabled="loading"
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            class="form-control"
            placeholder="请输入密码（至少6位）"
            required
            minlength="6"
            :disabled="loading"
          />
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="form.confirmPassword"
            class="form-control"
            placeholder="请再次输入密码"
            required
            minlength="6"
            :disabled="loading"
          />
        </div>
        
        <button 
          type="submit" 
          class="btn btn-primary" 
          :disabled="loading"
        >
          <span v-if="loading">
            <i class="loading-spinner"></i> 注册中...
          </span>
          <span v-else>立即注册</span>
        </button>
      </form>
      
      <div class="register-links">
        <p>
          已有账号？
          <router-link to="/login">立即登录</router-link>
        </p>
        <p class="test-hint">
          注册后即可浏览和领养宠物
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Register',
  data() {
    return {
      form: {
        name: '安东尼',
        email: '993785344@qq.com',
        password: '123456',
        confirmPassword: '123456'
      },
      loading: false,
      message: '',
      messageType: '',
      isSuccess: false,
      countdown: 3,
      countdownTimer: null
    }
  },
  methods: {
    async handleRegister() {
      console.log('=== 开始注册 ===');
      console.log('表单数据:', this.form);
      
      // 客户端验证
      if (!this.form.name || this.form.name.trim() === '') {
        this.showMessage('请输入用户名', 'danger');
        return;
      }
      
      if (!this.form.email || this.form.email.trim() === '') {
        this.showMessage('请输入邮箱地址', 'danger');
        return;
      }
      
      // 简单的邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.form.email)) {
        this.showMessage('邮箱格式不正确', 'danger');
        return;
      }
      
      if (!this.form.password || this.form.password.length < 6) {
        this.showMessage('密码长度至少6位', 'danger');
        return;
      }
      
      if (!this.form.confirmPassword) {
        this.showMessage('请确认密码', 'danger');
        return;
      }
      
      if (this.form.password !== this.form.confirmPassword) {
        this.showMessage('两次输入的密码不一致', 'danger');
        return;
      }
      
      this.loading = true;
      this.message = '';
      this.isSuccess = false;
      
      try {
        // 准备发送的数据
        const requestData = {
          username: this.form.name.trim(),
          email: this.form.email.trim(),
          password: this.form.password
        };
        
        console.log('发送的数据:', requestData);
        
        // 发送注册请求
        const response = await axios.post('/api/register', requestData);
        
        console.log('API响应:', response.data);
        
        if (response.data.success) {
          this.showMessage('🎉 注册成功！正在跳转到首页...', 'success');
          this.isSuccess = true;
          
          // 清空表单
          this.form = {
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
          };
          
          // 开始倒计时
          this.startCountdown();
          
        } else {
          this.showMessage(response.data.message || '注册失败，请稍后重试', 'danger');
        }
        
      } catch (error) {
        console.error('注册错误详情:', error);
        console.log('完整错误对象:', {
          message: error.message,
          response: error.response,
          request: error.request,
          config: error.config
        });
        
        // 错误处理
        let errorMessage = '注册失败，请稍后重试';
        
        if (error.response) {
          // 服务器响应了错误
          const serverMessage = error.response.data?.message;
          if (serverMessage) {
            errorMessage = serverMessage;
          } else if (error.response.status === 400) {
            errorMessage = '请求参数错误';
          } else if (error.response.status === 409) {
            errorMessage = '该邮箱已被注册';
          } else if (error.response.status === 500) {
            errorMessage = '服务器内部错误';
          }
        } else if (error.request) {
          // 请求已发送但没有收到响应
          errorMessage = '无法连接到服务器，请检查：\n1. 后端服务器是否运行\n2. 网络连接是否正常\n3. 检查控制台是否有CORS错误';
          console.error('网络请求失败，请检查后端服务器');
        } else {
          errorMessage = '请求配置错误: ' + error.message;
        }
        
        this.showMessage(errorMessage, 'danger');
        
      } finally {
        this.loading = false;
      }
    },
    
    showMessage(msg, type) {
      this.message = msg;
      this.messageType = type === 'success' ? 'alert-success' : 'alert-danger';
      
      // 3秒后自动清除错误消息（成功消息不自动清除）
      if (type !== 'success') {
        setTimeout(() => {
          if (this.message === msg) {
            this.message = '';
          }
        }, 3000);
      }
    },
    
    startCountdown() {
      this.countdown = 3;
      
      this.countdownTimer = setInterval(() => {
        this.countdown--;
        
        if (this.countdown <= 0) {
          clearInterval(this.countdownTimer);
          this.redirectToHome();
        }
      }, 1000);
    },
    
    redirectToHome() {
      this.$router.push('/');
    }
  },
  beforeDestroy() {
    // 组件销毁前清除定时器
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  }
}
</script>

<style scoped>
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: var(--spacing-lg);
  font-family: var(--font-family-primary);
}

.register-container {
  width: 100%;
  max-width: 400px;
  background: var(--bg-primary);
  padding: var(--spacing-2xl);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color-light);
}

.register h2 {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  color: var(--color-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}

.alert {
  padding: var(--spacing-sm) var(--spacing-base);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-xl);
  font-size: var(--font-size-sm);
  white-space: pre-line; /* 允许换行显示错误信息 */
}

.alert-success {
  background-color: var(--color-success-light);
  border: 1px solid var(--color-success);
  color: var(--color-success);
}

.alert-danger {
  background-color: var(--color-error-light);
  border: 1px solid var(--color-error);
  color: var(--color-error);
}

.redirect-countdown {
  display: block;
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-xs);
  opacity: 0.8;
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.form-control {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-base);
  border: 1px solid var(--border-color-light);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  transition: var(--transition-base);
  box-sizing: border-box;
  background: var(--bg-primary);
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(93, 156, 236, 0.1);
}

.form-control:disabled {
  background-color: var(--bg-secondary);
  cursor: not-allowed;
}

.btn-primary {
  width: 100%;
  padding: var(--spacing-base);
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: var(--transition-base);
  margin-top: var(--spacing-sm);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.register-links {
  margin-top: var(--spacing-xl);
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.register-links a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
}

.register-links a:hover {
  text-decoration: underline;
}

.test-hint {
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  border: 1px solid var(--border-color-light);
}
</style>