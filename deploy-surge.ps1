# Surge.sh 快速部署 - 通常最穩定

Write-Host "⚡ Surge.sh 快速部署到全球" -ForegroundColor Green
Write-Host ""

# 檢查並安裝 Surge
Write-Host "檢查 Surge.sh..." -ForegroundColor Yellow
try {
    surge --version | Out-Null
    Write-Host "✅ Surge 已安裝" -ForegroundColor Green
} catch {
    Write-Host "正在安裝 Surge..." -ForegroundColor Yellow
    npm install -g surge
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Surge 安裝成功" -ForegroundColor Green
    } else {
        Write-Host "❌ Surge 安裝失敗" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "正在構建網站..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 構建成功" -ForegroundColor Green
    Write-Host ""
    Write-Host "正在部署到全球..." -ForegroundColor Green
    Write-Host "⚠️  首次使用需要註冊 Surge 帳戶（免費）" -ForegroundColor Yellow
    Write-Host ""
    
    # 進入構建目錄並部署
    Push-Location ".next"
    surge --domain "econotrends-insight-$(Get-Random).surge.sh"
    Pop-Location
    
    Write-Host ""
    Write-Host "🎉 部署完成！" -ForegroundColor Green
    Write-Host "您的網站現在全球可訪問！" -ForegroundColor Cyan
} else {
    Write-Host "❌ 構建失敗" -ForegroundColor Red
}
