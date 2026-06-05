// src/store/modules/cart.js
const state = {
  items: [],
  total: 0,
  itemCount: 0
}

const mutations = {
  SET_CART_ITEMS(state, items) {
    state.items = items
    updateCartStats(state)
  },
  
  ADD_TO_CART(state, product) {
    const existingItem = state.items.find(item => item.id === product.id)
    
    if (existingItem) {
      existingItem.quantity++
    } else {
      state.items.push({
        ...product,
        quantity: 1,
        selected: true
      })
    }
    
    updateCartStats(state)
    saveToLocalStorage(state)
  },
  
  REMOVE_FROM_CART(state, productId) {
    state.items = state.items.filter(item => item.id !== productId)
    updateCartStats(state)
    saveToLocalStorage(state)
  },
  
  UPDATE_QUANTITY(state, { productId, quantity }) {
    const item = state.items.find(item => item.id === productId)
    if (item) {
      item.quantity = quantity
      updateCartStats(state)
      saveToLocalStorage(state)
    }
  },
  
  CLEAR_CART(state) {
    state.items = []
    state.total = 0
    state.itemCount = 0
    localStorage.removeItem('mall_cart')
  }
}

const actions = {
  addToCart({ commit }, product) {
    commit('ADD_TO_CART', product)
  },
  
  removeFromCart({ commit }, productId) {
    commit('REMOVE_FROM_CART', productId)
  },
  
  updateQuantity({ commit }, payload) {
    commit('UPDATE_QUANTITY', payload)
  },
  
  clearCart({ commit }) {
    commit('CLEAR_CART')
  },
  
  loadCartFromStorage({ commit }) {
    const cartData = localStorage.getItem('mall_cart')
    if (cartData) {
      try {
        const items = JSON.parse(cartData)
        commit('SET_CART_ITEMS', items)
      } catch (error) {
        console.error('加载购物车数据失败:', error)
      }
    }
  }
}

// 辅助函数
function updateCartStats(state) {
  state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
  state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
}

function saveToLocalStorage(state) {
  localStorage.setItem('mall_cart', JSON.stringify(state.items))
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}