import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Pets from '../views/Pets.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/pets',
    name: 'Pets',
    component: Pets
  },
  {
    path: '/mall',
    name: 'Mall',
    component: () => import('../views/Mall.vue')
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('../views/ProductDetail.vue')
  },
  {
    path: '/search',
    name: 'SearchResults',
    component: () => import('../views/SearchResults.vue')
  },
  {
    path: '/compare',
    name: 'Compare',
    component: () => import('../views/Compare.vue')
  },

  {
    path: '/post',
    name: 'Post',
    component: () => import('@/views/Post.vue') // 发布送养页面
  },
  {
    path: '/stories',
    name: 'Stories',
    component: () => import('@/views/Stories.vue') // 幸福剧场页面
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('../views/Cart.vue')
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('../views/Checkout.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'), // 个人中心
    meta: { requiresAuth: true } // 需要登录
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/Orders.vue'), // 我的订单
    meta: { requiresAuth: true }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/views/Favorites.vue'), // 我的收藏
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue') // 关于我们
  },
  {
    path: '/service',
    name: 'Service',
    component: () => import('@/views/Service.vue') // 上门服务
  },
  {
    path: '/booking',
    name: 'Booking',
    component: () => import('@/views/Booking.vue') // 预约服务
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router