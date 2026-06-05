Write-Host "🚀 启动宠物平台服务器..." -ForegroundColor Cyan

# 检查是否已运行
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "⚠️  检测到Node.js进程正在运行，先停止..." -ForegroundColor Yellow
    $nodeProcesses | Stop-Process -Force
    Start-Sleep -Seconds 2
}

# 启动服务器
Write-Host "正在启动服务器..." -ForegroundColor Green
try {
    # 在新的窗口启动服务器
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; node server.js" -WindowStyle Normal
    
    Write-Host "✅ 服务器启动命令已发送" -ForegroundColor Green
    Write-Host "等待5秒让服务器启动..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # 测试连接
    Write-Host "测试连接..." -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -TimeoutSec 5
        Write-Host "🎉 服务器启动成功！" -ForegroundColor Green
        Write-Host "状态码: $($response.StatusCode)" -ForegroundColor Gray
        Write-Host "响应: $($response.Content)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ 连接测试失败: $_" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ 启动失败: $_" -ForegroundColor Red
}

Write-Host "`n📋 下一步：" -ForegroundColor Cyan
Write-Host "1. 查看新打开的PowerShell窗口中的服务器日志" -ForegroundColor Yellow
Write-Host "2. 保持服务器窗口打开" -ForegroundColor Yellow
Write-Host "3. 在这个窗口继续测试API" -ForegroundColor Yellow
