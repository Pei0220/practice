# 最簡單的部署方法 - Netlify Drop

Write-Host "🎯 最簡單的全球部署方法" -ForegroundColor Green
Write-Host ""

Write-Host "正在構建您的網站..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ 構建成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "📦 部署步驟（超級簡單）：" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. 我會為您打開兩個窗口：" -ForegroundColor White
    Write-Host "   - Netlify Drop 網站" -ForegroundColor Gray
    Write-Host "   - 包含網站文件的文件夾" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. 將整個 '.next' 文件夾拖拽到網站上" -ForegroundColor White
    Write-Host ""
    Write-Host "3. 等待上傳完成（1-2分鐘）" -ForegroundColor White
    Write-Host ""
    Write-Host "4. 獲得您的全球網址！" -ForegroundColor White
    Write-Host ""
    
    Write-Host "按 Enter 鍵開始..." -ForegroundColor Yellow
    Read-Host
    
    # 打開 Netlify Drop 頁面
    Start-Process "https://app.netlify.com/drop"
    
    # 等待一下讓瀏覽器啟動
    Start-Sleep -Seconds 2
    
    # 打開 .next 文件夾
    if (Test-Path ".next") {
        explorer.exe ".next"
        Write-Host ""
        Write-Host "🎉 窗口已打開！" -ForegroundColor Green
        Write-Host ""
        Write-Host "請將 '.next' 文件夾拖拽到 Netlify 網站上" -ForegroundColor Cyan
        Write-Host "上傳完成後，您將獲得一個全球可訪問的網址！" -ForegroundColor Green
    } else {
        Write-Host "❌ 找不到 .next 文件夾，請檢查構建是否成功" -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "❌ 構建失敗，請檢查錯誤信息" -ForegroundColor Red
}
