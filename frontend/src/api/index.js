// API 基础配置
const API_BASE_URL = process.env.VUE_APP_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:3000';

// 通用请求函数
export const request = async (url, options = {}) => {
    // 如果没有提供headers，初始化一个空对象
    if (!options.headers) {
        options.headers = {};
    }
    
    // 如果没有提供Content-Type，默认设置为application/json
    if (!options.headers['Content-Type']) {
        options.headers['Content-Type'] = 'application/json';
    }
    
    // 添加认证令牌（如果存在）
    const token = sessionStorage.getItem('token');
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
        console.log('API请求添加token:', token.substring(0, 20) + '...');
        console.log('请求URL:', url);
        console.log('请求方法:', options.method || 'GET');
    } else {
        console.log('API请求未添加token: token不存在');
        console.log('请求URL:', url);
        console.log('请求方法:', options.method || 'GET');
    }
    
    // 确保包含credentials以支持跨域cookie
    options.credentials = 'include';
    
    const response = await fetch(`${API_BASE_URL}${url}`, options);
    
    // 处理未授权响应
    if (response.status === 401) {
        // 检查是否禁用自动跳转（用于预约提交等场景）
        const disableAutoRedirect = options.disableAutoRedirect;
        
        // 清除本地存储的认证信息
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        
        // 清除Pinia store中的用户状态（如果可用）
        try {
            const { useUserStore } = await import('../stores/user');
            const userStore = useUserStore();
            if (userStore) {
                userStore.logout();
            }
        } catch (error) {
            console.error('清除用户状态失败:', error);
        }
        
        // 如果没有禁用自动跳转且不是登录页面，跳转到登录页面
        if (!disableAutoRedirect && window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
        
        throw new Error('登录已过期，请重新登录');
    }
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
};

// 用户相关 API
export const userApi = {
    getProfile: () => request('/api/profile')
};

// 认证相关 API
export const authApi = {
    login: (credentials) => request('/api/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    }),
    register: (userData) => request('/api/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    })
};

// 宠物相关 API
export const petApi = {
    getAllPets: () => request('/api/pets'),
    getPetById: (id) => request(`/api/pets/${id}`),
    createPet: (petData) => request('/api/pets', {
        method: 'POST',
        body: JSON.stringify(petData)
    })
};

// 商品相关 API
export const productApi = {
    getAllProducts: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return request(`/api/products${queryString ? `?${queryString}` : ''}`);
    },
    getProductById: (id) => request(`/api/products/${id}`),
    searchProducts: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return request(`/api/products/search${queryString ? `?${queryString}` : ''}`);
    },
    getFlashSaleProducts: () => request('/api/products/flash-sale'),
    getHotProducts: () => request('/api/products/hot')
};

// 导入购物车API
import { cartApi } from './cart';

// 导入预约API
import { bookingApi } from './booking';

// 导出购物车API和预约API
export { cartApi, bookingApi };

export default {
    request,
    userApi,
    authApi,
    petApi,
    productApi,
    cartApi,
    bookingApi
};