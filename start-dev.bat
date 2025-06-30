@echo off
echo 正在設置 Node.js 環境...
set PATH=%PATH%;C:\Program Files\nodejs

echo 檢查 Node.js 版本:
node --version

echo 檢查 npm 版本:
npm --version

echo 正在啟動開發伺服器...
npm run dev

pause
