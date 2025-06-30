# 最直接的方法 - 手動上傳到 Vercel

Write-Host "📦 最直接的部署方法 - 手動上傳" -ForegroundColor Green
Write-Host ""
Write-Host "這個方法 100% 成功，只需要拖拽文件！" -ForegroundColor Cyan
Write-Host ""

Write-Host "正在準備部署文件..." -ForegroundColor Yellow

# 創建部署文件夾
$deployFolder = "vercel-deploy"
if (Test-Path $deployFolder) {
    Remove-Item $deployFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $deployFolder | Out-Null

# 複製重要文件
Write-Host "複製項目文件..." -ForegroundColor Yellow

$filesToCopy = @(
    "package.json",
    "next.config.mjs", 
    "tailwind.config.ts",
    "tsconfig.json",
    "postcss.config.mjs",
    "app",
    "components", 
    "lib",
    "hooks",
    "public",
    "styles",
    "types"
)

foreach ($item in $filesToCopy) {
    if (Test-Path $item) {
        if (Test-Path $item -PathType Container) {
            # 是文件夾
            Copy-Item $item -Destination "$deployFolder\$item" -Recurse -Force
        } else {
            # 是文件
            Copy-Item $item -Destination "$deployFolder\$item" -Force
        }
        Write-Host "✅ 已複製: $item" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "📁 部署文件已準備完成！" -ForegroundColor Green
Write-Host ""
Write-Host "接下來的步驟：" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 我會打開 Vercel 網站和部署文件夾" -ForegroundColor White
Write-Host "2. 在 Vercel 網站註冊/登錄" -ForegroundColor White  
Write-Host "3. 將整個 'vercel-deploy' 文件夾拖拽到 Vercel" -ForegroundColor White
Write-Host "4. 等待自動部署完成（2-3分鐘）" -ForegroundColor White
Write-Host "5. 獲得全球可訪問的網址！" -ForegroundColor White
Write-Host ""

$ready = Read-Host "按 Enter 開始..."

# 打開 Vercel 部署頁面
Start-Process "https://vercel.com/new"
Write-Host "已打開 Vercel 部署頁面" -ForegroundColor Green

# 打開部署文件夾
explorer.exe $deployFolder
Write-Host "已打開部署文件夾" -ForegroundColor Green

Write-Host ""
Write-Host "🎯 現在請：" -ForegroundColor Yellow
Write-Host "1. 在 Vercel 網站上點擊 'Browse' 或拖拽區域" -ForegroundColor White
Write-Host "2. 選擇整個 'vercel-deploy' 文件夾" -ForegroundColor White
Write-Host "3. 點擊 'Deploy'" -ForegroundColor White
Write-Host ""
Write-Host "🎉 幾分鐘後您就有全球網站了！" -ForegroundColor Green
