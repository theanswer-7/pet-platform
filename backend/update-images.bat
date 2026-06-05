@echo off
echo 正在更新商品图片...
cd /d "%~dp0"
node updateProductImages.js
echo 商品图片更新完成
pause