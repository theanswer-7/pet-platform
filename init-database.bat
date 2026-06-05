@echo off
echo 正在初始化数据库...
cd /d %~dp0\backend

echo 检查后端服务器是否运行...
curl -s http://localhost:3000/api/test-booking > nul
if %errorlevel% neq 0 (
    echo 后端服务器未运行，正在启动...
    start /b node server.js
    timeout /t 3 /nobreak > nul
)

echo 正在初始化商品数据...
curl -s http://localhost:3000/api/init-products

echo 数据库初始化完成！
pause