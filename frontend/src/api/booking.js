import { request } from './index';

// 预约相关 API
export const bookingApi = {
    // 获取用户预约列表
    getUserBookings: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return request(`/api/bookings/user${queryString ? `?${queryString}` : ''}`);
    },
    
    // 获取预约详情
    getBookingById: (id) => request(`/api/bookings/${id}`),
    
    // 创建预约
    createBooking: async (bookingData) => {
        console.log('========== 开始创建预约API请求 ==========');
        console.log('预约数据:', bookingData);
        console.log('当前token:', sessionStorage.getItem('token') ? '***' : null);
        
        const requestOptions = {
            method: 'POST',
            body: JSON.stringify(bookingData),
            disableAutoRedirect: true,  // 禁用自动跳转到登录页面
            // 确保包含必要的headers
            headers: {
                'Content-Type': 'application/json',
                // token会在request函数中自动添加
            }
        };
        
        console.log('请求选项:', requestOptions);
        console.log('请求URL:', '/api/bookings');
        console.log('请求方法:', requestOptions.method);
        console.log('请求体大小:', requestOptions.body ? JSON.stringify(bookingData).length : 0);
        
        try {
            console.log('发送请求到:', `${process.env.VUE_APP_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/bookings`);
            const response = await request('/api/bookings', requestOptions);
            console.log('创建预约API响应:', response);
            console.log('响应状态:', response.status);
            console.log('响应数据:', response.data);
            console.log('========== 创建预约API请求成功 ==========');
            return response;
        } catch (error) {
            console.error('========== 创建预约API请求失败 ==========');
            console.error('错误详情:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                stack: error.stack,
                config: error.config
            });
            console.log('请求配置:', {
                url: '/api/bookings',
                method: 'POST',
                data: bookingData,
                headers: error.config?.headers
            });
            
            // 如果是CORS错误，提供更具体的错误信息
            if (error.message.includes('CORS') || error.message.includes('Cross-Origin')) {
                throw new Error('跨域请求失败，请确保后端服务器正在运行并且已配置CORS');
            }
            
            // 如果是网络错误，提供更具体的错误信息
            if (error.message.includes('Network') || error.message.includes('fetch')) {
                throw new Error('网络连接失败，请检查后端服务器是否正在运行');
            }
            
            throw error;
        }
    },
    
    // 取消预约
    cancelBooking: (id, cancelReason) => request(`/api/bookings/${id}/cancel`, {
        method: 'PUT',
        body: JSON.stringify({ cancelReason })
    }),
    
    // 获取所有预约（管理员）
    getAllBookings: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return request(`/api/bookings/admin/all${queryString ? `?${queryString}` : ''}`);
    },
    
    // 管理员更新预约状态
    updateBookingStatus: (id, status) => request(`/api/bookings/admin/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    })
};

export default bookingApi;