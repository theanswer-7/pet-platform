<template>
  <div class="pets-page">
    <!-- 页面标题和筛选 -->
    <div class="page-header">
      <h1>🐾 可领养宠物</h1>
      <p class="subtitle">为这些可爱的毛孩子找一个温暖的家</p>
      
      <!-- 发布送养按钮 - 放在右上角 -->
      <div class="adoption-post-btn">
        <router-link to="/post" class="btn-post-adoption">
          <i class="fas fa-plus-circle"></i> 发布送养信息
        </router-link>
      </div>
    </div>
      
      <!-- 筛选区域 -->
      <div class="filters">
        <div class="filter-group">
          <label for="species">宠物类型：</label>
          <select id="species" v-model="filters.species" @change="filterPets">
            <option value="all">全部类型</option>
            <option value="dog">狗狗 🐕</option>
            <option value="cat">猫咪 🐈</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="location">所在地区：</label>
          <select id="location" v-model="filters.location" @change="filterPets">
            <option value="all">全部地区</option>
            <option value="北京">北京</option>
            <option value="上海">上海</option>
            <option value="广州">广州</option>
            <option value="成都">成都</option>
            <option value="重庆">重庆</option>
            <option value="西安">西安</option>
            <option value="贵州">贵州</option>
            <option value="浙江">浙江</option>
            <option value="黑龙江">黑龙江</option>
            <option value="山东">山东</option>
            <option value="福建">福建</option>
            <option value="云南">云南</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="size">体型：</label>
          <select id="size" v-model="filters.size" @change="filterPets">
            <option value="all">全部体型</option>
            <option value="small">小型</option>
            <option value="medium">中型</option>
            <option value="large">大型</option>
          </select>
        </div>
        
        <button class="btn-reset" @click="resetFilters">重置筛选</button>
      </div>
    </div>
    
    <!-- 统计信息 -->
    <div class="stats">
      <span class="stat-item">共 <strong>{{ filteredPets.length }}</strong> 只宠物可领养</span>
      <span class="stat-item">🐕 狗狗：{{ speciesCount.dog }}</span>
      <span class="stat-item">🐈 猫咪：{{ speciesCount.cat }}</span>
    </div>
    
    <!-- 宠物列表 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>正在加载宠物信息...</p>
    </div>
    
    <div v-else-if="filteredPets.length === 0" class="empty-state">
      <div class="empty-icon">😿</div>
      <h3>暂时没有符合条件的宠物</h3>
      <p>试试调整筛选条件或稍后再来</p>
      <button @click="resetFilters" class="btn-primary">查看所有宠物</button>
    </div>
    
    <div v-else class="pets-grid">
      <div 
        v-for="pet in filteredPets" 
        :key="pet.id" 
        class="pet-card"
      >
        <!-- 宠物图片 -->
        <div class="pet-image-container">
          <img 
            :src="pet.image" 
            :alt="pet.name" 
            class="pet-image"
            @error="handleImageError"
            :data-pet-id="pet.id"
            :key="pet.id"
          >
          <div class="pet-status" :class="`status-${pet.status}`">
            {{ getStatusText(pet.status) }}
          </div>
        </div>
        
        <!-- 宠物基本信息 -->
        <div class="pet-info">
          <h3 class="pet-name">{{ pet.name }}</h3>
          
          <div class="pet-meta">
            <span class="meta-item">
              <i class="fas fa-paw"></i>
              {{ getSpeciesText(pet.species) }}
            </span>
            <span class="meta-item">
              <i class="fas fa-birthday-cake"></i>
              {{ pet.age }}个月
            </span>
            <span class="meta-item">
              <i class="fas fa-venus-mars"></i>
              {{ pet.gender === 'male' ? '公' : '母' }}
            </span>
          </div>
          
          <!-- 品种、颜色、体型 -->
          <div class="pet-details">
            <div class="detail-item">
              <span class="detail-label">品种：</span>
              <span class="detail-value">{{ pet.breed }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">颜色：</span>
              <span class="detail-value">{{ pet.color }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">体型：</span>
              <span class="detail-value">{{ getSizeText(pet.size) }}</span>
            </div>
          </div>
          
          <!-- 健康标签 -->
          <div class="pet-tags">
            <span v-if="pet.vaccinated" class="tag tag-vaccinated">💉 已疫苗</span>
            <span v-if="pet.sterilized" class="tag tag-sterilized">已绝育</span>
          </div>
          
          <!-- 位置信息 -->
          <div class="pet-location">
            <i class="fas fa-map-marker-alt"></i>
            {{ pet.location }}
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="pet-actions">
          <button class="btn-adopt" @click="applyAdopt(pet)">
            🏠 申请领养
          </button>
          <button class="btn-detail" @click="showPetDetail(pet)">
            👀 查看详情
          </button>
        </div>
      </div>
    </div>
    
    <!-- 宠物详情模态框 -->
    <div v-if="selectedPet" class="modal-overlay" @click="closeDetail">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeDetail">&times;</button>
        
        <div class="pet-detail">
          <div class="detail-header">
            <img 
              :src="selectedPet.image" 
              :alt="selectedPet.name" 
              class="detail-image"
              @error="handleDetailImageError"
            >
            <div class="detail-title">
              <h2>{{ selectedPet.name }}</h2>
              <div class="detail-subtitle">
                <span class="badge" :class="`badge-${selectedPet.species}`">
                  {{ getSpeciesText(selectedPet.species) }}
                </span>
                <span>{{ selectedPet.age }}个月 · {{ selectedPet.gender === 'male' ? '公' : '母' }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-sections">
            <div class="detail-section">
              <h3>📋 基本信息</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="item-label">品种：</span>
                  <span class="item-value">{{ selectedPet.breed }}</span>
                </div>
                <div class="detail-item">
                  <span class="item-label">颜色：</span>
                  <span class="item-value">{{ selectedPet.color }}</span>
                </div>
                <div class="detail-item">
                  <span class="item-label">体型：</span>
                  <span class="item-value">{{ getSizeText(selectedPet.size) }}</span>
                </div>
                <div class="detail-item">
                  <span class="item-label">年龄：</span>
                  <span class="item-value">{{ selectedPet.age }}个月</span>
                </div>
                <div class="detail-item">
                  <span class="item-label">性别：</span>
                  <span class="item-value">{{ selectedPet.gender === 'male' ? '公' : '母' }}</span>
                </div>
                <div class="detail-item">
                  <span class="item-label">所在地：</span>
                  <span class="item-value">{{ selectedPet.location }}</span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h3>💝 它的故事</h3>
              <p class="pet-story">{{ selectedPet.story }}</p>
            </div>
            
            <div class="detail-section">
              <h3>🏥 健康情况</h3>
              <div class="health-tags">
                <span v-if="selectedPet.vaccinated" class="health-tag vaccinated">✅ 已接种疫苗</span>
                <span v-if="selectedPet.sterilized" class="health-tag sterilized">✅ 已绝育</span>
              </div>
            </div>
          </div>
          
          <div class="detail-actions">
            <button class="btn-primary" @click="applyAdopt(selectedPet)">
              🏠 申请领养 {{ selectedPet.name }}
            </button>
            <button class="btn-secondary" @click="closeDetail">
              返回列表
            </button>
          </div>
        </div>
      </div>
    
    <!-- 通知组件 -->
    <div v-if="notification" :class="['notification', notificationType]">
      {{ notification }}
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Pets',
  data() {
    return {
      allPets: [],
      filteredPets: [],
      loading: false,
      filters: {
        species: 'all',
        location: 'all',
        size: 'all'
      },
      selectedPet: null,
      showPetDetails: false,
      showAdoptionForm: false,
      adoptionForm: {
        name: '',
        phone: '',
        email: '',
        address: '',
        experience: '',
        livingEnvironment: '',
        hasOtherPets: '',
        reason: ''
      },
      notification: null,
      notificationType: 'success'
    }
  },
  computed: {
    speciesCount() {
      return {
        dog: this.filteredPets.filter(pet => pet.species === 'dog').length,
        cat: this.filteredPets.filter(pet => pet.species === 'cat').length
      }
    }
  },
  created() {
    this.loadPets()
  },
  methods: {
    async loadPets() {
      try {
        this.loading = true
        const response = await axios.get('http://localhost:3000/api/pets')
        
        if (response.data.success) {
          this.allPets = response.data.data || []
          this.filteredPets = [...this.allPets]
          console.log(`成功加载 ${this.allPets.length} 只宠物`)
        } else {
          throw new Error(response.data.message || '加载失败')
        }
      } catch (error) {
        console.error('加载宠物失败:', error)
        // 使用模拟数据
        this.allPets = this.getMockPets()
        this.filteredPets = [...this.allPets]
      } finally {
        this.loading = false
      }
    },
    
    filterPets() {
      let filtered = [...this.allPets]
      
      if (this.filters.species !== 'all') {
        filtered = filtered.filter(pet => pet.species === this.filters.species)
      }
      
      if (this.filters.location !== 'all') {
        filtered = filtered.filter(pet => pet.location.includes(this.filters.location))
      }
      
      if (this.filters.size !== 'all') {
        filtered = filtered.filter(pet => pet.size === this.filters.size)
      }
      
      this.filteredPets = filtered
    },
    
    resetFilters() {
      this.filters = {
        species: 'all',
        location: 'all',
        size: 'all'
      }
      this.filteredPets = [...this.allPets]
    },
    
    showPetDetail(pet) {
      this.selectedPet = pet
      document.body.style.overflow = 'hidden'
    },
    
    closeDetail() {
      this.selectedPet = null
      document.body.style.overflow = 'auto'
    },
    
    async applyAdopt(pet) {
      if (!sessionStorage.getItem('token')) {
        alert('请先登录后再申请领养')
        this.$router.push('/login')
        return
      }
      
      const message = prompt(`请输入您想对${pet.name}的送养人说的话：\n（例如：您的养宠经验、家庭环境等）`)
      if (message) {
        alert(`✅ 已提交对 ${pet.name} 的领养申请！\n我们会尽快联系您。`)
        this.closeDetail()
      }
    },
    submitAdoption() {
      // 验证表单
      if (!this.adoptionForm.name || !this.adoptionForm.phone || !this.adoptionForm.email || 
          !this.adoptionForm.address || !this.adoptionForm.experience || 
          !this.adoptionForm.livingEnvironment || !this.adoptionForm.hasOtherPets || 
          !this.adoptionForm.reason) {
        this.showNotification('请填写完整的领养申请信息', 'error');
        return;
      }
      
      // 创建领养申请记录
      const adoption = {
        id: Date.now(),
        petId: this.selectedPet.id,
        petName: this.selectedPet.name,
        ...this.adoptionForm,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      // 保存到localStorage
      const existingAdoptions = JSON.parse(localStorage.getItem('adoptions') || '[]');
      existingAdoptions.push(adoption);
      localStorage.setItem('adoptions', JSON.stringify(existingAdoptions));
      
      // 显示成功消息
      this.showNotification(`您已成功申请领养${this.selectedPet.name}！我们会尽快与您联系。`, 'success');
      
      // 重置表单并关闭
      this.resetAdoptionForm();
      this.showAdoptionForm = false;
      this.closeDetail();
    },
    cancelAdoption() {
      this.showAdoptionForm = false;
      this.resetAdoptionForm();
      document.body.style.overflow = 'auto';
    },
    resetAdoptionForm() {
      this.adoptionForm = {
        name: '',
        phone: '',
        email: '',
        address: '',
        experience: '',
        livingEnvironment: '',
        hasOtherPets: '',
        reason: ''
      };
    },
    showNotification(message, type = 'success') {
      this.notification = message;
      this.notificationType = type;
      
      setTimeout(() => {
        this.notification = null;
      }, 3000);
    },
    
    // 辅助方法
    getSpeciesText(species) {
      const map = { dog: '狗狗', cat: '猫咪' }
      return map[species] || '宠物'
    },
    
    getSizeText(size) {
      const map = { small: '小型', medium: '中型', large: '大型' }
      return map[size] || '未知'
    },
    
    getStatusText(status) {
      const map = { available: '可领养', pending: '审核中', adopted: '已领养' }
      return map[status] || '待审核'
    },
    
    handleImageError(event) {
      // 当图片加载失败时，隐藏整个宠物卡片
      const petCard = event.target.closest('.pet-card');
      if (petCard) {
        petCard.style.display = 'none';
      }
    },
    
    handleDetailImageError(event) {
      // 当详情图片加载失败时，隐藏整个详情模态框
      const modal = event.target.closest('.modal-overlay');
      if (modal) {
        modal.style.display = 'none';
      }
    },
    
    // 30个模拟宠物数据（15只狗 + 15只猫）
    getMockPets() {
      return [
        // 狗狗 (1-15)
        {
          id: 1,
          name: '旺财',
          species: 'dog',
          breed: '金毛寻回犬',
          color: '金色',
          age: 12,
          gender: 'male',
          size: 'large',
          location: '北京',
          story: '旺财是一只在小区里发现的流浪狗，性格温顺，喜欢和人玩耍，特别聪明。',
          vaccinated: true,
          sterilized: true,
          status: 'available',
          image: 'https://placedog.net/400/300?id=golden-retriever-1'
        },
        {
          id: 2,
          name: '大黄',
          species: 'dog',
          breed: '中华田园犬',
          color: '黄色',
          age: 18,
          gender: 'male',
          size: 'medium',
          location: '上海',
          story: '大黄是只忠诚的看门狗，对主人非常忠诚，需要一个有院子的家。',
          vaccinated: true,
          sterilized: true,
          status: 'available',
          image: 'https://placedog.net/400/300?id=chinese-rural-dog-2'
        },
        {
          id: 3,
          name: '小白',
          species: 'dog',
          breed: '萨摩耶',
          color: '白色',
          age: 6,
          gender: 'female',
          size: 'medium',
          location: '广州',
          story: '小白是被人遗弃在路边的，现在非常亲人，喜欢和人玩耍。',
          vaccinated: true,
          sterilized: true,
          status: 'available',
          image: 'https://tse1-mm.cn.bing.net/th/id/OIP-C.BLmbGRdu2T9okzVqWJh1sQHaFf?w=252&h=187&c=7&r=0&o=7&cb=ucfimg2&dpr=1.5&pid=1.7&rm=3&ucfimg=1'
        },
        {
          id: 4,
          name: '小黑',
          species: 'dog',
          breed: '拉布拉多',
          color: '黑色',
          age: 8,
          gender: 'male',
          size: 'large',
          location: '成都',
          story: '小黑性格活泼，喜欢游泳和接飞盘，是家庭的好伴侣。',
          vaccinated: true,
          sterilized: true,
          status: 'available',
          image: 'https://placedog.net/400/300?id=labrador-4'
        },
        {
          id: 5,
          name: '豆豆',
          species: 'dog',
          breed: '柯基',
          color: '黄白色',
          age: 4,
          gender: 'male',
          size: 'small',
          location: '重庆',
          story: '豆豆是一只活泼的柯基，喜欢追逐球类，需要足够运动空间。',
          vaccinated: true,
          sterilized: true,
          status: 'available',
          image: 'https://placedog.net/400/300?id=corgi-5'
        },
        {
          id: 6,
          name: '球球',
          species: 'dog',
          breed: '博美',
          color: '棕色',
          age: 3,
          gender: 'female',
          size: 'small',
          location: '西安',
          story: '球球体型小巧，适合公寓饲养，性格活泼可爱。',
          vaccinated: true,
          sterilized: true,
          status: 'available',
          image: 'https://placedog.net/400/300?id=pomeranian-6'
        },
        {
          id: 7,
          name: '乐乐',
          species: 'dog',
          breed: '哈士奇',
          color: '灰白色',
          age: 10,
          gender: 'male',
          size: 'large',
          location: '贵州',
          story: '乐乐精力充沛，需要大量运动，喜欢寒冷的天气。',
          vaccinated: true,
          sterilized: true,
          status: 'available',
          image: 'https://placedog.net/400/300?id=husky-7'
        },
        {
          id: 8,
          name: '欢欢',
          species: 'dog',
          breed: '泰迪',
          color: '咖啡色',
          age: 5,
          gender: 'female',
          size: 'small',
          location: '浙江',
          story: '欢欢聪明伶俐，已经学会了很多小技能，不掉毛适合过敏人群。',
          vaccinated: true,
          sterilized: true,
          status: 'available',
          image: 'https://placedog.net/400/300?id=poodle-8'
        },
        {
          id: 9,
          name: '壮壮',
          species: 'dog',
          breed: '阿拉斯加',
          color: '黑白',
          age: 14,
          gender: 'male',
          size: 'large',
          location: '黑龙江',
          story: '壮壮体型巨大但性格温和，喜欢雪地和户外活动。',
          vaccinated: true,
          sterilized: true,
          status: 'available',
          image: 'https://placedog.net/400/300?id=alaskan-malamute-9'
        },
        {
          id: 10,
          name: '小黄',
          species: 'dog',
          breed: '柴犬',
          color: '黄色',
          age: 7,
          gender: 'female',
          size: 'medium',
          location: '山东',
          story: '小黄表情丰富，性格独立，有时会有点固执。',
          vaccinated: true,
          sterilized: true,
          status: 'available',
          image: 'https://placedog.net/400/300?id=shiba-inu-10'
        },
        {
          id: 11,
          name: '点点',
          species: 'dog',
          breed: '斑点狗',
          color: '白底黑点',
          age: 9,
          gender: 'male',
          size: 'large',
          location: '福建',
          story: '点点性格活泼，需要大量运动，对小孩非常友善。',
          vaccinated: true,
          sterilized: true,
          status: 'available',
          image: 'https://placedog.net/400/300?id=dalmatian-11'
        },
        {
          id: 12,
          name: '毛毛',
          species: 'dog',
          breed: '松狮',
          color: '棕色',
          age: 11,
          gender: 'female',
          size: 'medium',
          location: '云南',
          story: '毛毛性格独立，有时候像猫一样高傲，但很忠诚。',
          vaccinated: true,
          sterilized: true,
          status: 'available',
          image: 'https://placedog.net/400/300?id=chow-chow-12'
        },
        {
          id: 13,
          name: '多多',
          species: 'dog',
          breed: '比熊',
          color: '白色',
          age: 2,
          gender: 'male',
          size: 'small',
          location: '北京',
          story: '多多还是个宝宝，活泼可爱，喜欢黏人。',
          vaccinated: true,
          sterilized: false,
          status: 'available',
          image: 'https://placedog.net/400/300?id=bichon-frise-13'
        },
        {
          id: 14,
          name: '花花',
          species: 'dog',
          breed: '边牧',
          color: '黑白',
          age: 13,
          gender: 'female',
          size: 'medium',
          location: '上海',
          story: '花花非常聪明，学习能力强，适合有经验的养犬人。',
          vaccinated: true,
          sterilized: true,
          status: 'available',
          image: 'https://placedog.net/400/300?id=border-collie-14'
        },
        {
          id: 15,
          name: '旺旺',
          species: 'dog',
          breed: '德牧',
          color: '黑背',
          age: 16,
          gender: 'male',
          size: 'large',
          location: '广州',
          story: '旺旺曾经是警犬训练犬，服从性强，需要严格的训练。',
          vaccinated: true,
          sterilized: true,
          status: 'available',
          image: 'https://placedog.net/400/300?id=german-shepherd-15'
        },
        
        // 猫咪 (16-30)
        {
          id: 16,
          name: '咪咪',
          species: 'cat',
          breed: '中华田园猫',
          color: '橘色',
          age: 8,
          gender: 'female',
          size: 'small',
          location: '成都',
          story: '咪咪是在公园救助的小猫，现在很健康，等待一个有爱的家。',
          vaccinated: true,
          sterilized: true,
          status: 'available',
          image: 'https://picsum.photos/seed/cat16/400/300.jpg'
        },
        {
          id: 17,
          name: '小黑',
          species: 'cat',
          breed: '英短',
          color: '黑色',
          age: 10,
          gender: 'male',
          size: 'medium',
          location: '重庆',
          story: '小黑是一只优雅的英短，性格安静，适合室内饲养。',
          vaccinated: true,
          sterilized: true,
          status: 'available',
          image: 'https://picsum.photos/seed/cat17/400/300.jpg'
        },
        {
          id: 18,
          name: '小白',
          species: 'cat',
          breed: '波斯猫',
          color: '白色',
          age: 4,
          gender: 'female',
          size: 'small',
          location: '西安',
          story: '小白性格温和，喜欢安静的环境，需要定期梳理毛发。',
          vaccinated: true,
          sterilized: true,
          status: 'available',
          image: 'https://tse1-mm.cn.bing.net/th/id/OIP-C.BLmbGRdu2T9okzVqWJh1sQHaFf?w=252&h=187&c=7&r=0&o=7&cb=ucfimg2&dpr=1.5&pid=1.7&rm=3&ucfimg=1'
        },
        {
          id: 19,
          name: '花花',
          species: 'cat',
          breed: '三花猫',
          color: '三色',
          age: 12,
          gender: 'female',
          size: 'medium',
          location: '贵州',
          story: '花花性格独立，喜欢晒太阳，对主人很忠诚。',
          vaccinated: true,
          sterilized: true,
          status: 'available',
          image: 'https://picsum.photos/seed/cat19/400/300.jpg'
        },
       
        {
          id: 21,
          name: '奶茶',
          species: 'cat',
          breed: '布偶猫',
          color: '海豹色',
          age: 3,
          gender: 'female',
          size: 'large',
          location: '黑龙江',
          story: '奶茶性格温顺如狗，喜欢跟随主人，是典型的"小狗猫"。',
          vaccinated: true,
          sterilized: true,
          status: 'available',
          image: 'https://picsum.photos/seed/cat21/400/300.jpg'
        },
        {
          id: 22,
          name: '煤球',
          species: 'cat',
          breed: '孟买猫',
          color: '纯黑',
          age: 7,
          gender: 'male',
          size: 'medium',
          location: '山东',
          story: '煤球全身乌黑发亮，性格活泼好动，像个黑色的小精灵。',
          vaccinated: true,
          sterilized: true,
          status: 'available',
          image: 'https://picsum.photos/seed/cat22/400/300.jpg'
        },
        {
          id: 23,
          name: '点点',
          species: 'cat',
          breed: '美短',
          color: '银虎斑',
          age: 6,
          gender: 'female',
          size: 'medium',
          location: '福建',
          story: '点点花纹美丽，性格友善，能和小孩友好相处。',
          vaccinated: true,
          sterilized: true,
          status: 'available',
          image: 'https://picsum.photos/seed/cat23/400/300.jpg'
        },
        {
          id: 24,
          name: '豆豆',
          species: 'cat',
          breed: '暹罗猫',
          color: '重点色',
          age: 4,
          gender: 'male',
          size: 'small',
          location: '云南',
          story: '豆豆叫声特别，性格外向，喜欢和主人"对话"。',
          vaccinated: true,
          sterilized: true,
          status: 'available',
          image: 'https://picsum.photos/seed/cat24/400/300.jpg'
        },
        {
          id: 25,
          name: '布丁',
          species: 'cat',
          breed: '金渐层',
          color: '金色',
          age: 2,
          gender: 'female',
          size: 'small',
          location: '北京',
          story: '布丁还是个活泼的小猫，喜欢追逐玩具，好奇心强。',
          vaccinated: true,
          sterilized: false,
          status: 'available',
          image: 'https://picsum.photos/seed/cat25/400/300.jpg'
        },
        {
          id: 26,
          name: '团子',
          species: 'cat',
          breed: '苏格兰折耳',
          color: '灰色',
          age: 9,
          gender: 'male',
          size: 'medium',
          location: '上海',
          story: '团子耳朵折叠，表情可爱，性格安静温和。',
          vaccinated: true,
          sterilized: true,
          status: 'available',
          image: 'https://ts1.tc.mm.bing.net/th/id/OIP-C.43mMOjez_TcDUuhyDqeeAAHaE8?w=180&h=128&c=8&rs=1&qlt=90&o=6&cb=ucfimg1&dpr=1.5&pid=3.1&rm=2&ucfimg=1'
        },
        {
          id: 27,
          name: '米粒',
          species: 'cat',
          breed: '加菲猫',
          color: '乳色',
          age: 11,
          gender: 'female',
          size: 'medium',
          location: '广州',
          story: '米粒脸型扁平，性格慵懒，喜欢安静的环境。',
          vaccinated: true,
          sterilized: true,
          status: 'available',
          image: 'https://picsum.photos/seed/cat27/400/300.jpg'
        },
        {
          id: 28,
          name: '汤圆',
          species: 'cat',
          breed: '挪威森林猫',
          color: '白色',
          age: 13,
          gender: 'male',
          size: 'large',
          location: '成都',
          story: '汤圆毛发浓密，适应寒冷气候，性格沉稳。',
          vaccinated: true,
          sterilized: true,
          status: 'available',
          image: 'https://picsum.photos/seed/cat28/400/300.jpg'
        },
        {
          id: 29,
          name: '奶酪',
          species: 'cat',
          breed: '阿比西尼亚',
          color: '红褐色',
          age: 5,
          gender: 'female',
          size: 'small',
          location: '重庆',
          story: '奶酪身材修长，动作优雅，喜欢在高处观察环境。',
          vaccinated: true,
          sterilized: true,
          status: 'available',
          image: 'https://picsum.photos/seed/cat29/400/300.jpg'
        },
        {
          id: 30,
          name: '皮蛋',
          species: 'cat',
          breed: '德文卷毛猫',
          color: '白色',
          age: 3,
          gender: 'male',
          size: 'small',
          location: '西安',
          story: '皮蛋毛发卷曲，性格像狗一样亲人，喜欢玩耍。',
          vaccinated: true,
          sterilized: true,
          status: 'available',
          image: 'https://picsum.photos/seed/cat30/400/300.jpg'
        }
      ]
    }
  }
}
</script>

<style scoped>
/* 使用设计系统变量 */
.pets-page {
  padding: var(--spacing-2xl);
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  position: relative;
}

.page-header h1 {
  color: var(--text-primary);
  font-size: var(--font-size-4xl);
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-weight-bold);
}

.subtitle {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-xl);
}

/* 发布送养按钮 - 右上角浮动样式 */
.adoption-post-btn {
  position: absolute;
  top: 0;
  right: 0;
}

.btn-post-adoption {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: linear-gradient(135deg, #FF6B9D, #FF8E53);
  color: var(--color-white);
  border: none;
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: var(--transition-base);
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(255, 107, 157, 0.3);
  transform: translateY(0);
}

.btn-post-adoption:hover {
  background: linear-gradient(135deg, #FF5A8F, #FF7A3D);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 157, 0.4);
}

.btn-post-adoption i {
  font-size: var(--font-size-base);
}

/* 筛选区域 */
.filters {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
  background: var(--bg-secondary);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-lg);
  border: 1px solid var(--border-color-light);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.filter-group label {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.filter-group select {
  padding: var(--spacing-sm) var(--spacing-base);
  border: 1px solid var(--border-color-light);
  border-radius: var(--border-radius-md);
  background: var(--bg-primary);
  min-width: 120px;
  font-size: var(--font-size-sm);
}

.btn-reset {
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--color-gray);
  color: var(--color-white);
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: var(--transition-base);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.btn-reset:hover {
  background: var(--color-gray-dark);
}

/* 统计信息 */
.stats {
  display: flex;
  justify-content: center;
  gap: var(--spacing-2xl);
  margin-bottom: var(--spacing-2xl);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  background: var(--bg-secondary);
  padding: var(--spacing-base);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color-light);
}

.stat-item strong {
  color: var(--color-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
}

/* 宠物网格 */
.pets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-xl);
  padding: var(--spacing-sm) 0;
}

/* 宠物卡片 */
.pet-card {
  background: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: var(--transition-base);
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--border-color-light);
}

.pet-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

/* 宠物图片 */
.pet-image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.pet-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition-slow);
}

.pet-card:hover .pet-image {
  transform: scale(1.05);
}

/* 状态标签 */
.pet-status {
  position: absolute;
  top: var(--spacing-base);
  right: var(--spacing-base);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  background: var(--color-success);
  color: var(--color-white);
  z-index: 1;
}

/* 宠物信息 */
.pet-info {
  padding: var(--spacing-lg);
  flex: 1;
}

.pet-name {
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  text-align: center;
  font-weight: var(--font-weight-semibold);
}

.pet-meta {
  display: flex;
  justify-content: center;
  gap: var(--spacing-base);
  margin-bottom: var(--spacing-base);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

/* 宠物详细信息 */
.pet-details {
  background: var(--bg-secondary);
  padding: var(--spacing-base);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-base);
  border: 1px solid var(--border-color-light);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.detail-label {
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.detail-value {
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

/* 宠物标签 */
.pet-tags {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  margin-bottom: var(--spacing-base);
}

.tag {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.tag-vaccinated {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.tag-sterilized {
  background: var(--color-secondary-light);
  color: var(--color-secondary);
}

/* 位置信息 */
.pet-location {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
}

/* 操作按钮 */
.pet-actions {
  display: flex;
  gap: var(--spacing-sm);
  padding: 0 var(--spacing-lg) var(--spacing-lg);
  margin-top: auto;
}

.btn-adopt, .btn-detail {
  flex: 1;
  padding: var(--spacing-sm);
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  transition: var(--transition-base);
  font-size: var(--font-size-sm);
}

.btn-adopt {
  background: var(--color-primary);
  color: var(--color-white);
}

.btn-adopt:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
}

.btn-detail {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color-light);
}

.btn-detail:hover {
  background: var(--bg-tertiary);
  transform: translateY(-2px);
}

/* 加载状态 */
.loading {
  text-align: center;
  padding: 60px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: #666;
  margin-bottom: 10px;
}

.empty-state p {
  color: #999;
  margin-bottom: 20px;
}

.btn-primary {
  padding: 12px 30px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-index-modal);
  padding: var(--spacing-lg);
}

.adoption-form {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.adoption-form h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  height: 80px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 4px;
  color: white;
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

.modal-content {
  background: var(--bg-primary);
  border-radius: var(--border-radius-xl);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: modalSlideIn 0.3s;
  border: 1px solid var(--border-color-light);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-close {
  position: absolute;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  background: none;
  border: none;
  font-size: var(--font-size-2xl);
  color: var(--text-secondary);
  cursor: pointer;
  z-index: 10;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-full);
}

.modal-close:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.pet-detail {
  padding: var(--spacing-2xl);
}

.detail-header {
  margin-bottom: var(--spacing-2xl);
}

.detail-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-lg);
  border: 1px solid var(--border-color-light);
}

.detail-title {
  text-align: center;
}

.detail-title h2 {
  font-size: var(--font-size-3xl);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-weight-semibold);
}

.detail-subtitle {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-base);
  color: var(--text-secondary);
  font-size: var(--font-size-base);
}

.badge {
  padding: var(--spacing-xs) var(--spacing-base);
  border-radius: var(--border-radius-full);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
}

.badge-dog {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.badge-cat {
  background: var(--color-secondary-light);
  color: var(--color-secondary);
}

.detail-sections {
  margin-bottom: var(--spacing-2xl);
}

.detail-section {
  margin-bottom: var(--spacing-xl);
}

.detail-section h3 {
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  margin-bottom: var(--spacing-base);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--border-color-light);
  font-weight: var(--font-weight-semibold);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-base);
}

.item-label {
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
}

.item-value {
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-base);
}

.pet-story {
  line-height: var(--line-height-relaxed);
  color: var(--text-secondary);
  padding: var(--spacing-base);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color-light);
}

.health-tags {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.health-tag {
  padding: var(--spacing-xs) var(--spacing-base);
  border-radius: var(--border-radius-full);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
}

.vaccinated {
  background: var(--color-success-light);
  color: var(--color-success);
}

.sterilized {
  background: var(--color-secondary-light);
  color: var(--color-secondary);
}

.detail-actions {
  display: flex;
  gap: var(--spacing-base);
  justify-content: center;
}

.btn-secondary {
  padding: var(--spacing-base) var(--spacing-2xl);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color-light);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-base);
}

.btn-secondary:hover {
  background: var(--bg-secondary);
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pets-grid {
    grid-template-columns: 1fr;
  }
  
  .filters {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .stats {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
  
  .modal-content {
    max-height: 95vh;
    margin: 10px;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-actions {
    flex-direction: column;
  }
}
</style>