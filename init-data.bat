@echo off
echo 正在初始化商品数据...
cd /d %~dp0
node init-data.js
pause