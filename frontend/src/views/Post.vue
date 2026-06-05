<template>
  <div class="post-page">
    <!-- 背景装饰 -->
    <div class="bg-decorations">
      <div class="deco-paw-1">🐾</div>
      <div class="deco-paw-2">🐾</div>
      <div class="deco-heart">❤️</div>
      <div class="deco-cat">🐱</div>
      <div class="deco-dog">🐶</div>
    </div>

    <div class="container">
      <!-- 页面头部 -->
      <div class="page-header">
        <router-link to="/" class="back-btn">
          <i class="fas fa-arrow-left"></i> 返回首页
        </router-link>
        <h1 class="page-title">
          <span class="title-icon">❤️</span>
          发布送养信息
          <span class="title-emoji">🏠</span>
        </h1>
        <p class="page-subtitle">为毛孩子寻找新的温暖家庭</p>
      </div>

      <!-- 表单区域 -->
      <div class="post-form-container">
        <!-- 步骤指示器 -->
        <div class="form-steps">
          <div :class="['step-item', { active: currentStep === 1, completed: currentStep > 1 }]">
            <div class="step-number">1</div>
            <div class="step-text">基本信息</div>
          </div>
          <div :class="['step-item', { active: currentStep === 2, completed: currentStep > 2 }]">
            <div class="step-number">2</div>
            <div class="step-text">详细描述</div>
          </div>
          <div :class="['step-item', { active: currentStep === 3 }]">
            <div class="step-number">3</div>
            <div class="step-text">确认发布</div>
          </div>
        </div>

        <!-- 表单内容 -->
        <form @submit.prevent="handleSubmit" class="post-form">
          <!-- 步骤1: 基本信息 -->
          <div v-show="currentStep === 1" class="form-step">
            <h3 class="step-title">🐾 宠物基本信息</h3>
            
            <div class="form-group">
              <label class="form-label required">
                <i class="fas fa-paw"></i> 宠物类型
              </label>
              <div class="pet-type-selector">
                <button
                  type="button"
                  :class="['pet-type-btn', { active: formData.petType === 'dog' }]"
                  @click="formData.petType = 'dog'"
                >
                  <span class="pet-icon">🐶</span>
                  <span>狗狗</span>
                </button>
                <button
                  type="button"
                  :class="['pet-type-btn', { active: formData.petType === 'cat' }]"
                  @click="formData.petType = 'cat'"
                >
                  <span class="pet-icon">🐱</span>
                  <span>猫咪</span>
                </button>
                <button
                  type="button"
                  :class="['pet-type-btn', { active: formData.petType === 'other' }]"
                  @click="formData.petType = 'other'"
                >
                  <span class="pet-icon">🐰</span>
                  <span>其他</span>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label required">
                <i class="fas fa-font"></i> 宠物名字
              </label>
              <input
                type="text"
                v-model="formData.name"
                placeholder="给毛孩子起个好听的名字"
                class="form-input"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">
                  <i class="fas fa-birthday-cake"></i> 年龄
                </label>
                <div class="age-selector">
                  <input
                    type="number"
                    v-model="formData.age"
                    min="0"
                    max="30"
                    class="form-input"
                    placeholder="0"
                    required
                  />
                  <select v-model="formData.ageUnit" class="age-unit">
                    <option value="month">个月</option>
                    <option value="year">岁</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label required">
                  <i class="fas fa-venus-mars"></i> 性别
                </label>
                <div class="gender-selector">
                  <button
                    type="button"
                    :class="['gender-btn', { active: formData.gender === 'male' }]"
                    @click="formData.gender = 'male'"
                  >
                    <i class="fas fa-mars"></i> 男孩
                  </button>
                  <button
                    type="button"
                    :class="['gender-btn', { active: formData.gender === 'female' }]"
                    @click="formData.gender = 'female'"
                  >
                    <i class="fas fa-venus"></i> 女孩
                  </button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-dna"></i> 品种
              </label>
              <select v-model="formData.breed" class="form-input">
                <option value="">请选择品种</option>
                <optgroup label="狗狗品种" v-if="formData.petType === 'dog'">
                  <option value="golden">金毛寻回犬</option>
                  <option value="poodle">贵宾犬</option>
                  <option value="husky">哈士奇</option>
                  <option value="chihuahua">吉娃娃</option>
                  <option value="shiba">柴犬</option>
                  <option value="mixed">混血狗狗</option>
                  <option value="other_dog">其他品种</option>
                </optgroup>
                <optgroup label="猫咪品种" v-if="formData.petType === 'cat'">
                  <option value="british">英国短毛猫</option>
                  <option value="american">美国短毛猫</option>
                  <option value="persian">波斯猫</option>
                  <option value="ragdoll">布偶猫</option>
                  <option value="siamese">暹罗猫</option>
                  <option value="mixed">混血猫咪</option>
                  <option value="other_cat">其他品种</option>
                </optgroup>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label required">
                <i class="fas fa-map-marker-alt"></i> 所在城市
              </label>
              <select v-model="formData.city" class="form-input" required>
                <option value="">请选择城市</option>
                <option value="beijing">北京市</option>
                <option value="shanghai">上海市</option>
                <option value="guangzhou">广州市</option>
                <option value="shenzhen">深圳市</option>
                <option value="chongqing">重庆市</option>
                <option value="chengdu">成都市</option>
                <option value="hangzhou">杭州市</option>
                <option value="wuhan">武汉市</option>
                <option value="nanjing">南京市</option>
                <option value="xian">西安市</option>
              </select>
            </div>
          </div>

          <!-- 步骤2: 详细描述 -->
          <div v-show="currentStep === 2" class="form-step">
            <h3 class="step-title">📝 详细描述</h3>
            
            <div class="form-group">
              <label class="form-label required">
                <i class="fas fa-camera"></i> 上传照片
              </label>
              <div class="image-upload">
                <div class="image-preview" v-if="formData.images.length > 0">
                  <div
                    v-for="(image, index) in formData.images"
                    :key="index"
                    class="preview-item"
                  >
                    <img :src="image" :alt="`宠物照片${index + 1}`" />
                    <button
                      type="button"
                      class="remove-image"
                      @click="removeImage(index)"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
                <div class="upload-area" @click="triggerFileInput">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <p>点击上传照片（最多5张）</p>
                  <input
                    type="file"
                    ref="fileInput"
                    @change="handleImageUpload"
                    multiple
                    accept="image/*"
                    class="file-input"
                  />
                </div>
                <div class="upload-tips">
                  <i class="fas fa-lightbulb"></i>
                  建议上传清晰、多角度的照片，有助于更快找到领养家庭
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label required">
                <i class="fas fa-align-left"></i> 宠物描述
              </label>
              <textarea
                v-model="formData.description"
                rows="5"
                placeholder="请详细描述宠物的性格、习惯、健康状况等..."
                class="form-textarea"
                required
              ></textarea>
              <div class="char-count">
                {{ formData.description.length }}/500
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-tags"></i> 标签特征
              </label>
              <div class="tags-selector">
                <button
                  type="button"
                  v-for="tag in availableTags"
                  :key="tag"
                  :class="['tag-btn', { active: formData.tags.includes(tag) }]"
                  @click="toggleTag(tag)"
                >
                  {{ tag }}
                </button>
              </div>
              <div class="selected-tags">
                <span
                  v-for="tag in formData.tags"
                  :key="tag"
                  class="selected-tag"
                >
                  {{ tag }}
                  <button @click="removeTag(tag)" type="button">
                    <i class="fas fa-times"></i>
                  </button>
                </span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-heartbeat"></i> 健康状况
              </label>
              <div class="health-checkboxes">
                <label class="checkbox-item">
                  <input type="checkbox" v-model="formData.health.vaccinated" />
                  <span class="checkbox-custom">
                    <i class="fas fa-check"></i>
                  </span>
                  已接种疫苗
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" v-model="formData.health.dewormed" />
                  <span class="checkbox-custom">
                    <i class="fas fa-check"></i>
                  </span>
                  已驱虫
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" v-model="formData.health.neutered" />
                  <span class="checkbox-custom">
                    <i class="fas fa-check"></i>
                  </span>
                  已绝育
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" v-model="formData.health.healthy" />
                  <span class="checkbox-custom">
                    <i class="fas fa-check"></i>
                  </span>
                  身体健康
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label required">
                <i class="fas fa-phone-alt"></i> 联系方式
              </label>
              <input
                type="tel"
                v-model="formData.contact.phone"
                placeholder="请输入您的手机号码"
                class="form-input"
                required
              />
              <input
                type="email"
                v-model="formData.contact.email"
                placeholder="请输入您的邮箱"
                class="form-input mt-10"
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-comment-dots"></i> 对领养人的期望
              </label>
              <textarea
                v-model="formData.expectations"
                rows="3"
                placeholder="请描述您对领养人的期望和要求..."
                class="form-textarea"
              ></textarea>
            </div>
          </div>

          <!-- 步骤3: 确认发布 -->
          <div v-show="currentStep === 3" class="form-step">
            <h3 class="step-title">✅ 确认发布信息</h3>
            
            <div class="preview-card">
              <div class="preview-header">
                <div class="preview-pet-type">
                  <span v-if="formData.petType === 'dog'">🐶</span>
                  <span v-else-if="formData.petType === 'cat'">🐱</span>
                  <span v-else>🐰</span>
                  {{ formData.petType === 'dog' ? '狗狗' : formData.petType === 'cat' ? '猫咪' : '其他宠物' }}
                </div>
                <h4>{{ formData.name }}</h4>
                <div class="preview-details">
                  <span>{{ formData.age }}{{ formData.ageUnit === 'month' ? '个月' : '岁' }}</span>
                  <span>·</span>
                  <span>{{ formData.gender === 'male' ? '男孩' : '女孩' }}</span>
                  <span>·</span>
                  <span>{{ getCityName(formData.city) }}</span>
                </div>
              </div>

              <div class="preview-images">
                <div
                  v-for="(image, index) in formData.images"
                  :key="index"
                  class="preview-image"
                >
                  <img :src="image" :alt="`预览图${index + 1}`" />
                </div>
              </div>

              <div class="preview-content">
                <div class="preview-section">
                  <h5><i class="fas fa-align-left"></i> 描述</h5>
                  <p>{{ formData.description || '无描述' }}</p>
                </div>

                <div class="preview-section">
                  <h5><i class="fas fa-tags"></i> 特征</h5>
                  <div class="preview-tags">
                    <span v-for="tag in formData.tags" :key="tag" class="tag-badge">
                      {{ tag }}
                    </span>
                  </div>
                </div>

                <div class="preview-section">
                  <h5><i class="fas fa-heartbeat"></i> 健康状态</h5>
                  <div class="health-status">
                    <span v-if="formData.health.vaccinated" class="health-item">
                      <i class="fas fa-check-circle"></i> 已接种疫苗
                    </span>
                    <span v-if="formData.health.dewormed" class="health-item">
                      <i class="fas fa-check-circle"></i> 已驱虫
                    </span>
                    <span v-if="formData.health.neutered" class="health-item">
                      <i class="fas fa-check-circle"></i> 已绝育
                    </span>
                    <span v-if="formData.health.healthy" class="health-item">
                      <i class="fas fa-check-circle"></i> 身体健康
                    </span>
                  </div>
                </div>

                <div class="preview-section">
                  <h5><i class="fas fa-comment-dots"></i> 领养期望</h5>
                  <p>{{ formData.expectations || '无特殊要求' }}</p>
                </div>

                <div class="preview-section">
                  <h5><i class="fas fa-user"></i> 联系人信息</h5>
                  <div class="contact-info">
                    <p><i class="fas fa-phone"></i> {{ formData.contact.phone }}</p>
                    <p v-if="formData.contact.email">
                      <i class="fas fa-envelope"></i> {{ formData.contact.email }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="agreement">
              <label class="agreement-checkbox">
                <input type="checkbox" v-model="agreeTerms" required />
                <span class="checkbox-custom">
                  <i class="fas fa-check"></i>
                </span>
                我已阅读并同意
                <router-link to="/terms" class="agreement-link">《宠乐汇送养协议》</router-link>
              </label>
            </div>
          </div>

          <!-- 表单操作按钮 -->
          <div class="form-actions">
            <button
              v-if="currentStep > 1"
              type="button"
              class="btn btn-outline"
              @click="prevStep"
              :disabled="submitting"
            >
              <i class="fas fa-arrow-left"></i> 上一步
            </button>
            
            <button
              v-if="currentStep < 3"
              type="button"
              class="btn btn-primary"
              @click="nextStep"
              :disabled="submitting"
            >
              下一步 <i class="fas fa-arrow-right"></i>
            </button>
            
            <button
              v-if="currentStep === 3"
              type="submit"
              class="btn btn-success"
              :disabled="!agreeTerms || submitting"
            >
              <i v-if="!submitting" class="fas fa-paper-plane"></i>
              <i v-else class="fas fa-spinner fa-spin"></i>
              {{ submitting ? '发布中...' : '确认发布' }}
            </button>
          </div>
        </form>
      </div>

      <!-- 成功提示 -->
      <transition name="slide-up">
        <div v-if="showSuccess" class="success-message">
          <div class="success-content">
            <div class="success-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <h3>发布成功！🎉</h3>
            <p>您的送养信息已提交审核，审核通过后将会展示在领养专区。</p>
            <div class="success-actions">
              <router-link to="/pets" class="btn btn-primary">
                查看领养专区
              </router-link>
              <button class="btn btn-outline" @click="resetForm">
                继续发布
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- 消息提示 -->
    <transition name="slide-up">
      <div v-if="message.text" :class="['message-toast', message.type]">
        <i :class="messageIcon"></i>
        <span>{{ message.text }}</span>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'PostPage',
  data() {
    return {
      currentStep: 1,
      submitting: false,
      showSuccess: false,
      agreeTerms: false,
      message: {
        text: '',
        type: ''
      },
      formData: {
        petType: 'dog',
        name: '',
        age: 1,
        ageUnit: 'year',
        gender: 'male',
        breed: '',
        city: '',
        images: [],
        description: '',
        tags: [],
        health: {
          vaccinated: true,
          dewormed: true,
          neutered: false,
          healthy: true
        },
        contact: {
          phone: '',
          email: ''
        },
        expectations: ''
      },
      availableTags: [
        '温顺亲人', '活泼好动', '安静乖巧', '聪明伶俐',
        '粘人可爱', '独立自主', '胆小害羞', '喜欢玩耍',
        '已训练', '适合家庭', '适合新手', '需要耐心'
      ]
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
    }
  },
  methods: {
    getCityName(cityCode) {
      const cities = {
        'beijing': '北京市',
        'shanghai': '上海市',
        'guangzhou': '广州市',
        'shenzhen': '深圳市',
        'chongqing': '重庆市',
        'chengdu': '成都市',
        'hangzhou': '杭州市',
        'wuhan': '武汉市',
        'nanjing': '南京市',
        'xian': '西安市'
      }
      return cities[cityCode] || cityCode
    },
    
    nextStep() {
      if (this.validateStep(this.currentStep)) {
        this.currentStep++
        window.scrollTo(0, 0)
      }
    },
    
    prevStep() {
      this.currentStep--
      window.scrollTo(0, 0)
    },
    
    validateStep(step) {
      switch(step) {
        case 1:
          if (!this.formData.name.trim()) {
            this.showMessage('请输入宠物名字', 'error')
            return false
          }
          if (!this.formData.city) {
            this.showMessage('请选择所在城市', 'error')
            return false
          }
          return true
          
        case 2:
          if (this.formData.images.length === 0) {
            this.showMessage('请至少上传一张照片', 'error')
            return false
          }
          if (!this.formData.description.trim()) {
            this.showMessage('请输入宠物描述', 'error')
            return false
          }
          if (this.formData.description.length > 500) {
            this.showMessage('描述不能超过500字', 'error')
            return false
          }
          if (!this.formData.contact.phone.trim()) {
            this.showMessage('请输入联系方式', 'error')
            return false
          }
          return true
          
        default:
          return true
      }
    },
    
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    
    handleImageUpload(event) {
      const files = event.target.files
      if (this.formData.images.length + files.length > 5) {
        this.showMessage('最多只能上传5张照片', 'error')
        return
      }
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.size > 5 * 1024 * 1024) { // 5MB限制
          this.showMessage(`${file.name} 文件大小超过5MB`, 'error')
          continue
        }
        
        const reader = new FileReader()
        reader.onload = (e) => {
          this.formData.images.push(e.target.result)
        }
        reader.readAsDataURL(file)
      }
      
      event.target.value = null // 清除input
    },
    
    removeImage(index) {
      this.formData.images.splice(index, 1)
    },
    
    toggleTag(tag) {
      const index = this.formData.tags.indexOf(tag)
      if (index > -1) {
        this.formData.tags.splice(index, 1)
      } else {
        if (this.formData.tags.length >= 6) {
          this.showMessage('最多选择6个标签', 'info')
          return
        }
        this.formData.tags.push(tag)
      }
    },
    
    removeTag(tag) {
      const index = this.formData.tags.indexOf(tag)
      if (index > -1) {
        this.formData.tags.splice(index, 1)
      }
    },
    
    async handleSubmit() {
      if (!this.agreeTerms) {
        this.showMessage('请同意送养协议', 'error')
        return
      }
      
      this.submitting = true
      
      try {
        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // 保存数据到localStorage（演示用）
        const posts = JSON.parse(localStorage.getItem('pet_posts') || '[]')
        const newPost = {
          id: Date.now(),
          ...this.formData,
          status: 'pending', // 审核中
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        posts.unshift(newPost)
        localStorage.setItem('pet_posts', JSON.stringify(posts))
        
        this.showSuccess = true
        this.showMessage('送养信息提交成功！正在等待审核', 'success')
        
      } catch (error) {
        console.error('发布失败:', error)
        this.showMessage('发布失败，请稍后重试', 'error')
      } finally {
        this.submitting = false
      }
    },
    
    resetForm() {
      this.currentStep = 1
      this.showSuccess = false
      this.agreeTerms = false
      this.formData = {
        petType: 'dog',
        name: '',
        age: 1,
        ageUnit: 'year',
        gender: 'male',
        breed: '',
        city: '',
        images: [],
        description: '',
        tags: [],
        health: {
          vaccinated: true,
          dewormed: true,
          neutered: false,
          healthy: true
        },
        contact: {
          phone: '',
          email: ''
        },
        expectations: ''
      }
    },
    
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

<style scoped>
.post-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f2ff 100%);
  padding: 40px 20px;
  position: relative;
}

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
  opacity: 0.1;
  animation: float 20s infinite ease-in-out;
}

.deco-paw-1 { top: 10%; left: 5%; animation-delay: 0s; }
.deco-paw-2 { bottom: 20%; right: 8%; animation-delay: 2s; }
.deco-heart { top: 15%; right: 15%; animation-delay: 4s; }
.deco-cat { top: 60%; left: 20%; animation-delay: 6s; }
.deco-dog { bottom: 40%; right: 20%; animation-delay: 7s; }

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0); }
  33% { transform: translateY(-20px) rotate(5deg); }
  66% { transform: translateY(10px) rotate(-5deg); }
}

.container {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--primary-blue);
  text-decoration: none;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(93, 156, 236, 0.1);
  transition: all 0.3s;
}

.back-btn:hover {
  background: rgba(93, 156, 236, 0.2);
  transform: translateY(-50%) translateX(-5px);
}

.page-title {
  font-size: 36px;
  color: var(--text-dark);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  font-family: "Comic Sans MS", cursive;
}

.title-icon, .title-emoji {
  font-size: 32px;
}

.title-emoji {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.page-subtitle {
  font-size: 18px;
  color: var(--text-light);
}

/* 表单容器 */
.post-form-container {
  background: white;
  border-radius: 30px;
  padding: 40px;
  box-shadow: var(--shadow);
  border: 3px solid rgba(93, 156, 236, 0.1);
}

/* 步骤指示器 */
.form-steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
  position: relative;
}

.form-steps::before {
  content: '';
  position: absolute;
  top: 25px;
  left: 10%;
  right: 10%;
  height: 3px;
  background: #E5E7EB;
  z-index: 0;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.step-number {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: white;
  border: 3px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: #9CA3AF;
  margin-bottom: 10px;
  transition: all 0.3s;
}

.step-item.active .step-number {
  border-color: var(--primary-blue);
  background: var(--primary-blue);
  color: white;
  transform: scale(1.1);
}

.step-item.completed .step-number {
  border-color: var(--success-green);
  background: var(--success-green);
  color: white;
}

.step-text {
  font-size: 14px;
  color: #9CA3AF;
  font-weight: 500;
}

.step-item.active .step-text {
  color: var(--primary-blue);
  font-weight: 600;
}

/* 表单步骤 */
.form-step {
  margin-bottom: 30px;
}

.step-title {
  font-size: 24px;
  color: var(--text-dark);
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: "Comic Sans MS", cursive;
}

/* 表单组 */
.form-group {
  margin-bottom: 25px;
}

.form-label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: var(--text-dark);
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-label.required::after {
  content: '*';
  color: #EF4444;
  margin-left: 4px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* 输入框样式 */
.form-input, .form-textarea {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #E5E7EB;
  border-radius: 15px;
  font-size: 15px;
  font-family: "Comic Sans MS", sans-serif;
  transition: all 0.3s;
  background: #F8FAFC;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 4px rgba(93, 156, 236, 0.2);
  background: white;
}

.form-input::placeholder, .form-textarea::placeholder {
  color: #A0AEC0;
}

.mt-10 {
  margin-top: 10px;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 5px;
}

/* 宠物类型选择器 */
.pet-type-selector {
  display: flex;
  gap: 15px;
}

.pet-type-btn {
  flex: 1;
  padding: 20px;
  border: 2px solid #E5E7EB;
  border-radius: 15px;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 16px;
  font-weight: 500;
}

.pet-type-btn:hover {
  border-color: var(--primary-blue);
  transform: translateY(-3px);
}

.pet-type-btn.active {
  border-color: var(--primary-blue);
  background: var(--primary-light);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(93, 156, 236, 0.2);
}

.pet-icon {
  font-size: 32px;
}

/* 年龄选择器 */
.age-selector {
  display: flex;
  gap: 10px;
}

.age-unit {
  min-width: 100px;
  padding: 14px;
  border: 2px solid #E5E7EB;
  border-radius: 15px;
  background: #F8FAFC;
  font-size: 15px;
  cursor: pointer;
}

/* 性别选择器 */
.gender-selector {
  display: flex;
  gap: 10px;
}

.gender-btn {
  flex: 1;
  padding: 14px;
  border: 2px solid #E5E7EB;
  border-radius: 15px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 15px;
}

.gender-btn:hover {
  border-color: var(--primary-blue);
}

.gender-btn.active {
  border-color: var(--primary-blue);
  background: var(--primary-light);
}

/* 图片上传 */
.image-upload {
  border: 2px dashed #CBD5E1;
  border-radius: 15px;
  padding: 20px;
}

.image-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 28px;
  height: 28px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.remove-image:hover {
  background: #EF4444;
  transform: scale(1.1);
}

.upload-area {
  position: relative;
  padding: 40px;
  border: 2px dashed #CBD5E1;
  border-radius: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #F8FAFC;
}

.upload-area:hover {
  border-color: var(--primary-blue);
  background: #EFF6FF;
}

.upload-area i {
  font-size: 48px;
  color: var(--primary-blue);
  margin-bottom: 15px;
}

.upload-area p {
  color: var(--text-light);
  margin: 0;
}

.file-input {
  display: none;
}

.upload-tips {
  margin-top: 15px;
  padding: 12px;
  background: #FEF3C7;
  border-radius: 10px;
  color: #92400E;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 标签选择器 */
.tags-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.tag-btn {
  padding: 8px 16px;
  border: 2px solid #E5E7EB;
  border-radius: 20px;
  background: white;
  color: var(--text-dark);
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.tag-btn:hover {
  border-color: var(--primary-blue);
}

.tag-btn.active {
  background: var(--primary-blue);
  color: white;
  border-color: var(--primary-blue);
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.selected-tag {
  padding: 6px 12px;
  background: var(--primary-light);
  color: var(--primary-blue);
  border-radius: 15px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.selected-tag button {
  background: none;
  border: none;
  color: var(--primary-blue);
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
}

.selected-tag button:hover {
  background: rgba(93, 156, 236, 0.2);
}

/* 健康状态复选框 */
.health-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
}

.checkbox-item input {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #CBD5E1;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.checkbox-custom i {
  opacity: 0;
  color: white;
  font-size: 12px;
  transition: all 0.3s;
}

.checkbox-item input:checked + .checkbox-custom {
  background: var(--primary-blue);
  border-color: var(--primary-blue);
}

.checkbox-item input:checked + .checkbox-custom i {
  opacity: 1;
}

/* 预览卡片 */
.preview-card {
  border: 2px solid var(--primary-light);
  border-radius: 20px;
  overflow: hidden;
  background: white;
}

.preview-header {
  padding: 25px;
  background: linear-gradient(135deg, var(--primary-light) 0%, #E1F0FF 100%);
  text-align: center;
}

.preview-pet-type {
  font-size: 18px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.preview-header h4 {
  font-size: 28px;
  margin-bottom: 10px;
  color: var(--text-dark);
}

.preview-details {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  color: var(--text-light);
  font-size: 16px;
}

.preview-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  padding: 20px;
}

.preview-image {
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
}

.preview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-content {
  padding: 20px;
}

.preview-section {
  margin-bottom: 25px;
}

.preview-section h5 {
  font-size: 18px;
  color: var(--text-dark);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-section p {
  color: var(--text-light);
  line-height: 1.6;
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-badge {
  padding: 6px 12px;
  background: var(--primary-light);
  color: var(--primary-blue);
  border-radius: 15px;
  font-size: 14px;
}

.health-status {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.health-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--success-green);
}

.contact-info p {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

/* 协议 */
.agreement {
  margin: 30px 0;
  padding: 20px;
  background: #F8FAFC;
  border-radius: 15px;
}

.agreement-checkbox {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 14px;
}

.agreement-checkbox input {
  display: none;
}

.agreement-link {
  color: var(--primary-blue);
  text-decoration: none;
}

.agreement-link:hover {
  text-decoration: underline;
}

/* 表单操作按钮 */
.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 2px solid #F3F4F6;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 50px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
}

.btn-outline {
  background: white;
  color: var(--primary-blue);
  border: 2px solid var(--primary-blue);
}

.btn-outline:hover:not(:disabled) {
  background: var(--primary-light);
  transform: translateX(-5px);
}

.btn-primary {
  background: var(--primary-blue);
  color: white;
  border: 2px solid var(--primary-blue);
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateX(5px);
}

.btn-success {
  background: var(--success-green);
  color: white;
  border: 2px solid var(--success-green);
}

.btn-success:hover:not(:disabled) {
  background: #6AD571;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(126, 224, 129, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* 成功消息 */
.success-message {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.success-content {
  background: white;
  border-radius: 30px;
  padding: 50px;
  text-align: center;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.success-icon {
  font-size: 80px;
  color: var(--success-green);
  margin-bottom: 20px;
  animation: bounce 2s infinite;
}

.success-content h3 {
  font-size: 28px;
  color: var(--text-dark);
  margin-bottom: 15px;
}

.success-content p {
  color: var(--text-light);
  margin-bottom: 30px;
  line-height: 1.6;
}

.success-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
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
  border-left: 5px solid var(--primary-blue);
}

.message-toast.success {
  border-left-color: var(--success-green);
}

.message-toast.error {
  border-left-color: #EF4444;
}

.message-toast.info {
  border-left-color: var(--primary-blue);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
  
  .post-form-container {
    padding: 25px;
  }
  
  .page-title {
    font-size: 28px;
    flex-direction: column;
    gap: 10px;
  }
  
  .back-btn {
    position: relative;
    margin-bottom: 20px;
    display: inline-flex;
    transform: none;
  }
  
  .form-steps::before {
    left: 15%;
    right: 15%;
  }
  
  .step-number {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  
  .step-text {
    font-size: 12px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .pet-type-selector {
    flex-direction: column;
  }
  
  .health-checkboxes {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 15px;
  }
  
  .success-content {
    padding: 30px 20px;
  }
  
  .success-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .post-page {
    padding: 20px 10px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .step-title {
    font-size: 20px;
  }
  
  .preview-images {
    grid-template-columns: 1fr 1fr;
  }
  
  .message-toast {
    left: 20px;
    right: 20px;
    transform: none;
    min-width: auto;
  }
}
</style>