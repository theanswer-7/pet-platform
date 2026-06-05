import axios from 'axios'

// 创建 axios 实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加 token
api.interceptors.request.use(
  config => {
    const token = sessionStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      // token 过期或无效，清除本地存储并跳转到登录页
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 用户相关 API
export const userApi = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
  getProfile: () => api.get('/profile'),
  updateProfile: (userData) => api.put('/profile', userData),
  logout: () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
  }
}

// 宠物相关 API
export const petApi = {
  getAllPets: () => api.get('/pets'),
  getPetById: (id) => api.get(`/pets/${id}`),
  createPet: (petData) => api.post('/pets', petData),
  updatePet: (id, petData) => api.put(`/pets/${id}`, petData),
  deletePet: (id) => api.delete(`/pets/${id}`)
}

// 检查登录状态
export const checkAuth = () => {
  const token = sessionStorage.getItem('token')
  const user = sessionStorage.getItem('user')
  
  if (token && user) {
    try {
      return JSON.parse(user)
    } catch {
      return null
    }
  }
  return null
}

export default api