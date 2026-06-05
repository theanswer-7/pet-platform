import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref(null)
  const token = ref(sessionStorage.getItem('token') || '')
  const cartCount = ref(0)
  
  // 计算属性
  const isLoggedIn = computed(() => {
    const hasToken = !!token.value;
    const hasUser = !!user.value;
    const hasUserId = user.value ? !!(user.value.userId || user.value.id) : false;
    
    console.log('登录状态检查:', {
      hasToken,
      hasUser,
      hasUserId,
      token: token.value ? '***' : null,
      user: user.value,
      result: hasToken && hasUser && hasUserId
    });
    
    return hasToken && hasUser && hasUserId;
  })
  const userId = computed(() => user.value?.userId || user.value?.id || null)
  
  // 方法
  function setUser(userData) {
    user.value = userData
    if (userData) {
      sessionStorage.setItem('user', JSON.stringify(userData))
      // 如果userData包含token，也要保存token
      if (userData.token) {
        setToken(userData.token)
      }
    } else {
      sessionStorage.removeItem('user')
    }
  }
  
  function setToken(newToken) {
    token.value = newToken
    if (newToken) {
      sessionStorage.setItem('token', newToken)
    } else {
      sessionStorage.removeItem('token')
    }
  }
  
  function logout() {
    user.value = null
    token.value = ''
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('token')
  }
  
  function initFromStorage() {
    const storedUser = sessionStorage.getItem('user')
    const storedToken = sessionStorage.getItem('token')
    
    // 先设置token
    if (storedToken) {
      token.value = storedToken
    } else {
      token.value = ''
    }
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        // 验证用户数据是否完整（更灵活的验证）
        const userId = userData.userId || userData.id
        // 只要有userId/id和token就认为已登录，不强制要求email
        if (userData && userId && storedToken) {
          user.value = userData
          console.log('✅ 用户数据已加载:', userData)
          console.log('登录状态检查:', {
            token: !!token.value,
            user: !!user.value,
            userId: userId,
            isLoggedIn: !!token.value && !!user.value && !!userId
          })
        } else {
          console.log('⚠️ 用户数据不完整，清除无效数据', {
            userData: userData,
            userId: userId,
            hasToken: !!storedToken
          })
          sessionStorage.removeItem('user')
          sessionStorage.removeItem('token')
          token.value = ''
          user.value = null
        }
      } catch (e) {
        console.error('解析用户信息失败:', e)
        sessionStorage.removeItem('user')
        sessionStorage.removeItem('token')
        token.value = ''
        user.value = null
      }
    } else {
      user.value = null
    }
  }
  
  // 购物车相关方法
  function setCartCount(count) {
    cartCount.value = count
  }
  
  function incrementCartCount() {
    cartCount.value++
  }
  
  function decrementCartCount() {
    if (cartCount.value > 0) {
      cartCount.value--
    }
  }
  
  return {
    user,
    token,
    cartCount,
    isLoggedIn,
    userId,
    setUser,
    setToken,
    logout,
    initFromStorage,
    setCartCount,
    incrementCartCount,
    decrementCartCount
  }
})