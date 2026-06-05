const http = require('http');

console.log('正在初始化商品数据...');

// 初始化商品数据
const initProducts = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/init-products',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('商品数据初始化结果:', response);
          resolve(response);
        } catch (error) {
          console.error('解析响应失败:', error);
          reject(error);
        }
      });
    });

    req.on('error', (err) => {
      console.error('初始化商品数据失败:', err.message);
      reject(err);
    });

    req.on('timeout', () => {
      console.error('初始化商品数据超时');
      req.destroy();
      reject(new Error('请求超时'));
    });

    req.end();
  });
};

// 检查服务器是否运行
const checkServer = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/test-booking',
      method: 'GET',
      timeout: 2000
    };

    const req = http.request(options, (res) => {
      console.log('服务器正在运行');
      resolve();
    });

    req.on('error', (err) => {
      console.error('服务器连接失败:', err.message);
      console.log('请确保后端服务器正在运行');
      console.log('运行命令: cd backend && node server.js');
      reject(err);
    });

    req.on('timeout', () => {
      console.error('服务器响应超时');
      req.destroy();
      reject(new Error('请求超时'));
    });

    req.end();
  });
};

// 执行初始化
async function runInit() {
  try {
    await checkServer();
    await initProducts();
    console.log('数据初始化完成！');
  } catch (error) {
    console.error('初始化失败:', error.message);
    process.exit(1);
  }
}

runInit();