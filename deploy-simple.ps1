# 一鍵部署到全球 - 超級簡單版

Write-Host "🚀 一鍵部署 EconoTrends Insight 到全球" -ForegroundColor Green
Write-Host ""

# 安裝 Vercel CLI（如果沒有）
Write-Host "正在檢查並安裝 Vercel..." -ForegroundColor Yellow
try {
    vercel --version | Out-Null
} catch {
    npm install -g vercel
}

Write-Host ""
Write-Host "🌍 正在部署到全球..." -ForegroundColor Green
Write-Host "⚠️  首次使用需要登錄 Vercel（免費）" -ForegroundColor Yellow
Write-Host ""

# 一鍵部署
vercel

Write-Host ""
Write-Host "🎉 完成！您的網站現在全球可訪問！" -ForegroundColor Green
Write-Host "任何人在任何地方都可以使用您的網站！" -ForegroundColor Cyan
