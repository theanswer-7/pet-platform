# verify-setup.ps1
Write-Host "?? 验证项目设置..." -ForegroundColor Cyan
Write-Host "=" * 50

# 1. 检查 .env 文件
Write-Host "?? .env 文件:" -ForegroundColor Yellow
if (Test-Path .env) {
    $envSize = (Get-Item .env).Length
    if ($envSize -gt 0) {
        Write-Host "   ? 文件存在，大小: $envSize 字节" -ForegroundColor Green
        Write-Host "   内容预览:" -ForegroundColor Gray
        Get-Content .env | ForEach-Object { Write-Host "     $_" -ForegroundColor Gray }
    } else {
        Write-Host "   ??  文件存在但为空" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ? 文件不存在" -ForegroundColor Red
}

Write-Host "`n?? 目录结构:" -ForegroundColor Yellow
$folders = "config", "controllers", "models", "routes", "middleware"
foreach ($folder in $folders) {
    if (Test-Path $folder) {
        $itemCount = (Get-ChildItem $folder -File | Measure-Object).Count
        Write-Host "   ?? $folder ($itemCount 个文件)" -ForegroundColor Green
    } else {
        Write-Host "   ? $folder (缺失)" -ForegroundColor Red
    }
}

Write-Host "`n?? 依赖包:" -ForegroundColor Yellow
if (Test-Path "node_modules") {
    $moduleCount = (Get-ChildItem "node_modules" -Directory | Measure-Object).Count
    Write-Host "   ? node_modules ($moduleCount 个包)" -ForegroundColor Green
} else {
    Write-Host "   ? node_modules 缺失" -ForegroundColor Red
}

Write-Host "`n" + "=" * 50
Write-Host "?? 验证完成！" -ForegroundColor Green
