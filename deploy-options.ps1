# EconoTrends Insight - 多種部署方法選擇器

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "    EconoTrends Insight 部署選擇器" -ForegroundColor Green  
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "選擇部署方法：" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Netlify Drop (最簡單 - 拖拽上傳)" -ForegroundColor White
Write-Host "2. GitHub Pages" -ForegroundColor White  
Write-Host "3. Railway 部署" -ForegroundColor White
Write-Host "4. Surge.sh 部署" -ForegroundColor White
Write-Host "5. Firebase Hosting" -ForegroundColor White
Write-Host "6. 手動 Vercel (網頁版)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "請選擇 (1-6)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🏗️  正在構建項目..." -ForegroundColor Green
        
        # 構建項目
        npm run build
        
        Write-Host ""
        Write-Host "📦 構建完成！" -ForegroundColor Green
        Write-Host ""
        Write-Host "Netlify Drop 部署步驟：" -ForegroundColor Cyan
        Write-Host "1. 打開瀏覽器訪問：https://app.netlify.com/drop" -ForegroundColor White
        Write-Host "2. 將整個 '.next' 文件夾拖拽到網頁上" -ForegroundColor White  
        Write-Host "3. 等待上傳完成" -ForegroundColor White
        Write-Host "4. 獲得免費的 .netlify.app 網址" -ForegroundColor White
        Write-Host ""
        Write-Host "💡 您的 .next 文件夾位置：" -ForegroundColor Yellow
        Write-Host "   $(Get-Location)\.next" -ForegroundColor Gray
        
        # 打開文件管理器到 .next 文件夾
        if (Test-Path ".next") {
            explorer.exe ".next"
            Write-Host "已為您打開 .next 文件夾！" -ForegroundColor Green
        }
        
        # 打開 Netlify Drop 頁面
        Start-Process "https://app.netlify.com/drop"
        Write-Host "已為您打開 Netlify Drop 頁面！" -ForegroundColor Green
    }
    
    "2" {
        Write-Host ""
        Write-Host "📱 GitHub Pages 部署..." -ForegroundColor Green
        
        # 檢查是否已有 git
        try {
            git --version | Out-Null
            Write-Host "✅ Git 已安裝" -ForegroundColor Green
        } catch {
            Write-Host "❌ 請先安裝 Git: https://git-scm.com/" -ForegroundColor Red
            return
        }
        
        Write-Host ""
        Write-Host "GitHub Pages 部署步驟：" -ForegroundColor Cyan
        Write-Host "1. 在 GitHub 創建新倉庫" -ForegroundColor White
        Write-Host "2. 運行以下命令：" -ForegroundColor White
        Write-Host ""
        Write-Host "git init" -ForegroundColor Gray
        Write-Host "git add ." -ForegroundColor Gray  
        Write-Host "git commit -m 'Initial commit'" -ForegroundColor Gray
        Write-Host "git branch -M main" -ForegroundColor Gray
        Write-Host "git remote add origin [您的倉庫URL]" -ForegroundColor Gray
        Write-Host "git push -u origin main" -ForegroundColor Gray
        Write-Host ""
        Write-Host "3. 在 GitHub 倉庫設置中啟用 Pages" -ForegroundColor White
        
        # 打開 GitHub
        Start-Process "https://github.com/new"
        Write-Host "已為您打開 GitHub 新倉庫頁面！" -ForegroundColor Green
    }
    
    "3" {
        Write-Host ""
        Write-Host "🚂 Railway 部署..." -ForegroundColor Green
        
        # 檢查是否安裝 Railway CLI
        try {
            railway --version | Out-Null
            Write-Host "✅ Railway CLI 已安裝" -ForegroundColor Green
        } catch {
            Write-Host "正在安裝 Railway CLI..." -ForegroundColor Yellow
            npm install -g @railway/cli
        }
        
        Write-Host ""
        Write-Host "Railway 部署步驟：" -ForegroundColor Cyan
        Write-Host "1. 登錄 Railway：railway login" -ForegroundColor White
        Write-Host "2. 初始化項目：railway init" -ForegroundColor White
        Write-Host "3. 部署：railway up" -ForegroundColor White
        Write-Host ""
        
        $deployRailway = Read-Host "是否現在開始部署？(y/N)"
        if ($deployRailway -eq "y" -or $deployRailway -eq "Y") {
            railway login
            railway init
            railway up
        }
    }
    
    "4" {
        Write-Host ""
        Write-Host "⚡ Surge.sh 部署..." -ForegroundColor Green
        
        # 檢查是否安裝 Surge
        try {
            surge --version | Out-Null
            Write-Host "✅ Surge 已安裝" -ForegroundColor Green
        } catch {
            Write-Host "正在安裝 Surge..." -ForegroundColor Yellow
            npm install -g surge
        }
        
        Write-Host "正在構建項目..." -ForegroundColor Yellow
        npm run build
        
        Write-Host ""
        Write-Host "正在部署到 Surge.sh..." -ForegroundColor Green
        Write-Host "首次使用需要註冊 Surge 帳戶" -ForegroundColor Yellow
        
        # 進入 .next 目錄並部署
        cd .next
        surge
        cd ..
    }
    
    "5" {
        Write-Host ""
        Write-Host "🔥 Firebase Hosting 部署..." -ForegroundColor Green
        
        # 檢查是否安裝 Firebase CLI
        try {
            firebase --version | Out-Null
            Write-Host "✅ Firebase CLI 已安裝" -ForegroundColor Green
        } catch {
            Write-Host "正在安裝 Firebase CLI..." -ForegroundColor Yellow
            npm install -g firebase-tools
        }
        
        Write-Host ""
        Write-Host "Firebase 部署步驟：" -ForegroundColor Cyan
        Write-Host "1. 登錄：firebase login" -ForegroundColor White
        Write-Host "2. 初始化：firebase init hosting" -ForegroundColor White
        Write-Host "3. 構建項目：npm run build" -ForegroundColor White
        Write-Host "4. 部署：firebase deploy" -ForegroundColor White
        Write-Host ""
        
        $deployFirebase = Read-Host "是否現在開始部署？(y/N)"
        if ($deployFirebase -eq "y" -or $deployFirebase -eq "Y") {
            firebase login
            firebase init hosting
            npm run build
            firebase deploy
        }
    }
    
    "6" {
        Write-Host ""
        Write-Host "🌐 手動 Vercel 部署..." -ForegroundColor Green
        
        Write-Host "正在構建項目..." -ForegroundColor Yellow
        npm run build
        
        Write-Host ""
        Write-Host "手動 Vercel 部署步驟：" -ForegroundColor Cyan
        Write-Host "1. 訪問 https://vercel.com" -ForegroundColor White
        Write-Host "2. 註冊/登錄帳戶" -ForegroundColor White
        Write-Host "3. 點擊 'New Project'" -ForegroundColor White
        Write-Host "4. 上傳項目文件夾或連接 GitHub" -ForegroundColor White
        Write-Host "5. 等待自動部署完成" -ForegroundColor White
        Write-Host ""
        
        # 打開 Vercel 網站
        Start-Process "https://vercel.com"
        Write-Host "已為您打開 Vercel 網站！" -ForegroundColor Green
        
        # 打開項目文件夾
        explorer.exe "."
        Write-Host "已為您打開項目文件夾！" -ForegroundColor Green
    }
    
    default {
        Write-Host "無效選擇，退出..." -ForegroundColor Red
        return
    }
}

Write-Host ""
Write-Host "🌟 部署提示：" -ForegroundColor Yellow
Write-Host "- 所有方法都會給您一個全球可訪問的網址" -ForegroundColor White
Write-Host "- 部署後任何人都可以通過網址訪問您的網站" -ForegroundColor White
Write-Host "- 大多數平台都提供免費方案" -ForegroundColor White
Write-Host ""
Write-Host "需要幫助？查看 GLOBAL_DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
