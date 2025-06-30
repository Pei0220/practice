# EconoTrends Insight - 全球部署腳本
# 一鍵部署到全球可訪問的網址

Write-Host ""
Write-Host "🌍 EconoTrends Insight - 全球部署器" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 檢查 Node.js
Write-Host "檢查環境..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 請先安裝 Node.js" -ForegroundColor Red
    exit 1
}

# 檢查 npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm 版本: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm 未找到" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "選擇部署方式：" -ForegroundColor Cyan
Write-Host "1. Vercel (推薦 - 最簡單)" -ForegroundColor White
Write-Host "2. Netlify" -ForegroundColor White
Write-Host "3. 僅構建項目" -ForegroundColor White
Write-Host ""

$choice = Read-Host "請選擇 (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🚀 開始 Vercel 部署..." -ForegroundColor Green
        
        # 檢查是否安裝了 Vercel CLI
        try {
            vercel --version | Out-Null
            Write-Host "✅ Vercel CLI 已安裝" -ForegroundColor Green
        } catch {
            Write-Host "正在安裝 Vercel CLI..." -ForegroundColor Yellow
            npm install -g vercel
        }
        
        Write-Host ""
        Write-Host "正在部署到 Vercel..." -ForegroundColor Yellow
        Write-Host "⚠️  首次部署需要登錄 Vercel 帳戶" -ForegroundColor Yellow
        Write-Host ""
        
        # 執行 Vercel 部署
        vercel --prod
        
        Write-Host ""
        Write-Host "🎉 部署完成！" -ForegroundColor Green
        Write-Host "您的網站現在全球可訪問！" -ForegroundColor Cyan
    }
    
    "2" {
        Write-Host ""
        Write-Host "🏗️  構建項目..." -ForegroundColor Green
        
        # 構建項目
        npm run build
        
        Write-Host ""
        Write-Host "📦 構建完成！" -ForegroundColor Green
        Write-Host ""
        Write-Host "Netlify 部署步驟：" -ForegroundColor Cyan
        Write-Host "1. 訪問 https://netlify.com" -ForegroundColor White
        Write-Host "2. 拖拽 '.next' 文件夾到網站" -ForegroundColor White
        Write-Host "3. 獲取您的全球訪問網址" -ForegroundColor White
        Write-Host ""
        Write-Host "或者使用 Netlify CLI：" -ForegroundColor Yellow
        Write-Host "npm install -g netlify-cli" -ForegroundColor Gray
        Write-Host "netlify deploy --prod --dir=.next" -ForegroundColor Gray
    }
    
    "3" {
        Write-Host ""
        Write-Host "🏗️  構建項目..." -ForegroundColor Green
        
        # 構建項目
        npm run build
        
        Write-Host ""
        Write-Host "📦 構建完成！" -ForegroundColor Green
        Write-Host "構建文件位於 '.next' 文件夾" -ForegroundColor White
    }
    
    default {
        Write-Host "無效選擇，退出..." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🌟 提示：" -ForegroundColor Yellow
Write-Host "- 部署後的網址全世界任何人都可以訪問" -ForegroundColor White
Write-Host "- 支持 HTTPS 安全連接" -ForegroundColor White
Write-Host "- 享受全球 CDN 加速" -ForegroundColor White
Write-Host ""
Write-Host "需要幫助？查看 GLOBAL_DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "按任意鍵退出..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
