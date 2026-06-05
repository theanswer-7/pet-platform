/**
 * 订单状态常量
 */
export const ORDER_STATUS = {
  PENDING: 'pending',     // 待付款
  PAID: 'paid',           // 已付款
  SHIPPED: 'shipped',     // 已发货
  DELIVERED: 'delivered', // 已送达
  CANCELLED: 'cancelled', // 已取消
  REFUNDING: 'refunding', // 退款中
  REFUNDED: 'refunded'    // 已退款
}

/**
 * 订单状态对应的中文显示
 */
export const ORDER_STATUS_TEXT = {
  [ORDER_STATUS.PENDING]: '待付款',
  [ORDER_STATUS.PAID]: '已付款',
  [ORDER_STATUS.SHIPPED]: '已发货',
  [ORDER_STATUS.DELIVERED]: '已送达',
  [ORDER_STATUS.CANCELLED]: '已取消',
  [ORDER_STATUS.REFUNDING]: '退款中',
  [ORDER_STATUS.REFUNDED]: '已退款'
}

/**
 * 订单状态对应的颜色类名
 */
export const ORDER_STATUS_COLOR = {
  [ORDER_STATUS.PENDING]: 'warning',
  [ORDER_STATUS.PAID]: 'success',
  [ORDER_STATUS.SHIPPED]: 'info',
  [ORDER_STATUS.DELIVERED]: 'primary',
  [ORDER_STATUS.CANCELLED]: 'danger',
  [ORDER_STATUS.REFUNDING]: 'warning',
  [ORDER_STATUS.REFUNDED]: 'info'
}

/**
 * 商品分类常量
 */
export const PRODUCT_CATEGORY = {
  FOOD: 'food',           // 宠物食品
  TOY: 'toy',             // 宠物玩具
  HEALTH: 'health',       // 宠物健康
  LIVING: 'living',       // 宠物生活用品
  OTHER: 'other'          // 其他
}

export const PRODUCT_CATEGORY_TEXT = {
  [PRODUCT_CATEGORY.FOOD]: '宠物食品',
  [PRODUCT_CATEGORY.TOY]: '宠物玩具',
  [PRODUCT_CATEGORY.HEALTH]: '宠物健康',
  [PRODUCT_CATEGORY.LIVING]: '生活用品',
  [PRODUCT_CATEGORY.OTHER]: '其他'
}

/**
 * 支付方式常量
 */
export const PAYMENT_METHOD = {
  WECHAT: 'wechat',
  ALIPAY: 'alipay',
  BANK: 'bank',
  BALANCE: 'balance'
}

export const PAYMENT_METHOD_TEXT = {
  [PAYMENT_METHOD.WECHAT]: '微信支付',
  [PAYMENT_METHOD.ALIPAY]: '支付宝',
  [PAYMENT_METHOD.BANK]: '银行卡',
  [PAYMENT_METHOD.BALANCE]: '余额支付'
}

/**
 * 发货方式常量
 */
export const SHIPPING_METHOD = {
  EXPRESS: 'express',     // 快递
  SELF_PICKUP: 'self_pickup' // 自提
}

export const SHIPPING_METHOD_TEXT = {
  [SHIPPING_METHOD.EXPRESS]: '快递配送',
  [SHIPPING_METHOD.SELF_PICKUP]: '到店自提'
}

/**
 * 用户角色常量
 */
export const USER_ROLE = {
  ADMIN: 'admin',
  USER: 'user',
  VET: 'vet',       // 兽医
  SHELTER: 'shelter' // 救助站
}

export const USER_ROLE_TEXT = {
  [USER_ROLE.ADMIN]: '管理员',
  [USER_ROLE.USER]: '普通用户',
  [USER_ROLE.VET]: '兽医',
  [USER_ROLE.SHELTER]: '救助站'
}

/**
 * 送养类型常量
 */
export const ADOPTION_TYPE = {
  ADOPT: 'adopt',      // 领养
  FOSTER: 'foster',    // 寄养
  TEMP_CARE: 'temp_care' // 临时照料
}

export const ADOPTION_TYPE_TEXT = {
  [ADOPTION_TYPE.ADOPT]: '领养',
  [ADOPTION_TYPE.FOSTER]: '寄养',
  [ADOPTION_TYPE.TEMP_CARE]: '临时照料'
}

/**
 * 宠物类型常量
 */
export const PET_TYPE = {
  DOG: 'dog',
  CAT: 'cat',
  BIRD: 'bird',
  RABBIT: 'rabbit',
  OTHER: 'other'
}

export const PET_TYPE_TEXT = {
  [PET_TYPE.DOG]: '狗狗',
  [PET_TYPE.CAT]: '猫咪',
  [PET_TYPE.BIRD]: '鸟类',
  [PET_TYPE.RABBIT]: '兔兔',
  [PET_TYPE.OTHER]: '其他'
}

/**
 * 性别常量
 */
export const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  UNKNOWN: 'unknown'
}

export const GENDER_TEXT = {
  [GENDER.MALE]: '男/雄',
  [GENDER.FEMALE]: '女/雌',
  [GENDER.UNKNOWN]: '未知'
}

/**
 * 页面路由常量
 */
export const ROUTE_PATH = {
  HOME: '/',
  MALL: '/mall',
  ORDERS: '/orders',
  CART: '/cart',
  USER: '/user',
  ADOPTION: '/adoption',
  FORUM: '/forum',
  LOGIN: '/login',
  REGISTER: '/register'
}

/**
 * API 接口地址常量
 */
export const API_URL = {
  // 用户相关
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  USER_INFO: '/api/user/info',
  
  // 商品相关
  PRODUCT_LIST: '/api/products',
  PRODUCT_DETAIL: '/api/products/:id',
  
  // 订单相关
  ORDER_CREATE: '/api/orders/create',
  ORDER_LIST: '/api/orders',
  ORDER_DETAIL: '/api/orders/:id',
  ORDER_CANCEL: '/api/orders/:id/cancel',
  ORDER_PAY: '/api/orders/:id/pay',
  
  // 购物车相关
  CART_ADD: '/api/cart/add',
  CART_REMOVE: '/api/cart/remove',
  CART_LIST: '/api/cart',
  
  // 送养相关
  ADOPTION_LIST: '/api/adoptions',
  ADOPTION_CREATE: '/api/adoptions/create',
  ADOPTION_DETAIL: '/api/adoptions/:id'
}

/**
 * 本地存储键名
 */
export const STORAGE_KEY = {
  TOKEN: 'auth_token',
  USER_INFO: 'user_info',
  CART_ITEMS: 'cart_items',
  SEARCH_HISTORY: 'search_history'
}

/**
 * 错误码常量
 */
export const ERROR_CODE = {
  SUCCESS: 0,
  PARAM_ERROR: 1001,
  AUTH_ERROR: 1002,
  PERMISSION_DENIED: 1003,
  RESOURCE_NOT_FOUND: 1004,
  SERVER_ERROR: 5000
}

/**
 * 分页常量
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [5, 10, 20, 50]
}

export default {
  ORDER_STATUS,
  ORDER_STATUS_TEXT,
  ORDER_STATUS_COLOR,
  PRODUCT_CATEGORY,
  PRODUCT_CATEGORY_TEXT,
  PAYMENT_METHOD,
  PAYMENT_METHOD_TEXT,
  SHIPPING_METHOD,
  SHIPPING_METHOD_TEXT,
  USER_ROLE,
  USER_ROLE_TEXT,
  ADOPTION_TYPE,
  ADOPTION_TYPE_TEXT,
  PET_TYPE,
  PET_TYPE_TEXT,
  GENDER,
  GENDER_TEXT,
  ROUTE_PATH,
  API_URL,
  STORAGE_KEY,
  ERROR_CODE,
  PAGINATION
}