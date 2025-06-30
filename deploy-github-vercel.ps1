# 超簡單部署方法 - GitHub + Vercel 網頁版

Write-Host "🌟 最穩定的部署方法 - 不用命令行登錄" -ForegroundColor Green
Write-Host ""

# 檢查 Git
Write-Host "檢查 Git..." -ForegroundColor Yellow
try {
    git --version | Out-Null
    Write-Host "✅ Git 已安裝" -ForegroundColor Green
} catch {
    Write-Host "❌ 請先安裝 Git: https://git-scm.com/" -ForegroundColor Red
    Start-Process "https://git-scm.com/"
    exit
}

Write-Host ""
Write-Host "🚀 開始 3 步驟部署：" -ForegroundColor Cyan
Write-Host ""
Write-Host "步驟 1: 初始化 Git 倉庫" -ForegroundColor White

# 初始化 Git（如果還沒有）
if (-not (Test-Path ".git")) {
    git init
    Write-Host "✅ Git 倉庫已初始化" -ForegroundColor Green
} else {
    Write-Host "✅ Git 倉庫已存在" -ForegroundColor Green
}

Write-Host ""
Write-Host "步驟 2: 準備文件" -ForegroundColor White

# 添加所有文件
git add .
git commit -m "Deploy EconoTrends Insight" -q
Write-Host "✅ 文件已準備完成" -ForegroundColor Green

Write-Host ""
Write-Host "步驟 3: 上傳到 GitHub 和部署" -ForegroundColor White
Write-Host ""
Write-Host "我將為您打開兩個網頁：" -ForegroundColor Yellow
Write-Host "1. GitHub - 創建新倉庫並上傳代碼" -ForegroundColor Gray
Write-Host "2. Vercel - 連接 GitHub 並自動部署" -ForegroundColor Gray
Write-Host ""

$continue = Read-Host "按 Enter 繼續..."

# 打開 GitHub 新倉庫頁面
Start-Process "https://github.com/new"
Write-Host "已打開 GitHub 新倉庫頁面" -ForegroundColor Green

# 等待一下
Start-Sleep -Seconds 2

# 打開 Vercel 首頁
Start-Process "https://vercel.com"
Write-Host "已打開 Vercel 首頁" -ForegroundColor Green

Write-Host ""
Write-Host "📋 接下來的步驟：" -ForegroundColor Cyan
Write-Host ""
Write-Host "在 GitHub 頁面：" -ForegroundColor White
Write-Host "1. 輸入倉庫名稱：econotrends-insight" -ForegroundColor Gray
Write-Host "2. 點擊 'Create repository'" -ForegroundColor Gray
Write-Host "3. 複製顯示的命令到終端運行" -ForegroundColor Gray
Write-Host ""
Write-Host "在 Vercel 頁面：" -ForegroundColor White
Write-Host "1. 註冊/登錄帳戶" -ForegroundColor Gray
Write-Host "2. 點擊 'Import Project'" -ForegroundColor Gray
Write-Host "3. 選擇您剛創建的 GitHub 倉庫" -ForegroundColor Gray
Write-Host "4. 點擊 'Deploy' - 完成！" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 5 分鐘後您將獲得全球可訪問的網址！" -ForegroundColor Green

# 顯示當前目錄下需要上傳的 Git 命令
Write-Host ""
Write-Host "📝 GitHub 上傳命令（複製到終端運行）：" -ForegroundColor Yellow
Write-Host "git remote add origin [您的倉庫URL]" -ForegroundColor Gray
Write-Host "git branch -M main" -ForegroundColor Gray
Write-Host "git push -u origin main" -ForegroundColor Gray
