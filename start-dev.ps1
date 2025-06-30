# EconoTrends Insight 開發伺服器啟動腳本
# 設置 Node.js 路徑並啟動開發伺服器

Write-Host "正在設置 Node.js 環境..." -ForegroundColor Yellow

# 添加 Node.js 到 PATH
$env:PATH = $env:PATH + ";C:\Program Files\nodejs"

# 檢查 Node.js 是否可用
try {
    $nodeVersion = & node --version
    Write-Host "Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "錯誤: 找不到 Node.js" -ForegroundColor Red
    Write-Host "請確認 Node.js 已正確安裝在 C:\Program Files\nodejs\" -ForegroundColor Red
    exit 1
}

# 檢查 npm 是否可用
try {
    $npmVersion = & npm --version
    Write-Host "npm 版本: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "錯誤: 找不到 npm" -ForegroundColor Red
    exit 1
}

# 啟動開發伺服器
Write-Host "正在啟動 EconoTrends Insight 開發伺服器..." -ForegroundColor Yellow
Write-Host "如果成功啟動，請在瀏覽器中開啟 http://localhost:3000" -ForegroundColor Cyan

try {
    & npm run dev
} catch {
    Write-Host "錯誤: 無法啟動開發伺服器" -ForegroundColor Red
    Write-Host "請檢查專案依賴是否已正確安裝" -ForegroundColor Red
}
