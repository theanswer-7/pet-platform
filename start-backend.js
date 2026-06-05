const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('正在启动后端服务器...');

// 检查node_modules是否存在
const nodeModulesPath = path.join(__dirname, 'backend', 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('检测到后端依赖未安装，正在安装...');
  const npmInstall = spawn('npm', ['install'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit'
  });
  
  npmInstall.on('close', (code) => {
    if (code !== 0) {
      console.error('依赖安装失败，请手动在backend目录运行 npm install');
      process.exit(1);
    }
    console.log('依赖安装完成，正在启动服务器...');
    startServer();
  });
} else {
  startServer();
}

function startServer() {
  const server = spawn('node', ['server.js'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit'
  });
  
  server.on('close', (code) => {
    console.log(`服务器进程退出，代码: ${code}`);
  });
  
  server.on('error', (err) => {
    console.error('启动服务器失败:', err);
  });
}