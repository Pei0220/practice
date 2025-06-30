# 🚀 如何運行部署腳本 - 詳細步驟指南

## 📍 重要：在正確的位置運行

腳本必須在項目根目錄中運行：
```
c:\Users\chen2\Desktop\test_bot\econotrends-insight
```

## 方法一：PowerShell（最簡單）

### 步驟 1：打開 PowerShell
- 按 `Win + R`
- 輸入 `powershell`
- 按 Enter

### 步驟 2：進入項目目錄
```powershell
cd "c:\Users\chen2\Desktop\test_bot\econotrends-insight"
```

### 步驟 3：運行部署腳本
```powershell
.\deploy-simple.ps1
```

---

## 方法二：文件管理器（快速）

### 步驟 1：打開項目文件夾
- 在文件管理器中導航到：
  `c:\Users\chen2\Desktop\test_bot\econotrends-insight`

### 步驟 2：快速打開 PowerShell
- 在文件夾的地址欄中輸入：`powershell`
- 按 Enter

### 步驟 3：運行腳本
```powershell
.\deploy-simple.ps1
```

---

## 方法三：VS Code（推薦給開發者）

### 步驟 1：在 VS Code 中打開項目
- 打開 VS Code
- File > Open Folder
- 選擇 `econotrends-insight` 文件夾

### 步驟 2：打開終端
- 按 `Ctrl + `` (反引號)
- 或從菜單：Terminal > New Terminal

### 步驟 3：運行腳本
```powershell
.\deploy-simple.ps1
```

---

## 🔍 確認您在正確的位置

運行腳本前，確保您在正確的目錄。您應該看到：

```
PS c:\Users\chen2\Desktop\test_bot\econotrends-insight>
```

如果看到這個路徑，就可以運行：
```powershell
.\deploy-simple.ps1
```

---

## 🚨 常見錯誤及解決方案

### 錯誤：「無法找到路徑」
**原因**：不在項目目錄中
**解決**：
```powershell
cd "c:\Users\chen2\Desktop\test_bot\econotrends-insight"
```

### 錯誤：「執行原則」
**原因**：PowerShell 執行原則限制
**解決**：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 錯誤：「找不到 deploy-simple.ps1」
**原因**：文件不存在或路徑錯誤
**解決**：確保在正確目錄，並檢查文件是否存在

---

## 🎯 快速檢查清單

運行前請確認：
- [ ] 在正確的項目目錄
- [ ] 可以看到 `package.json` 文件
- [ ] 可以看到 `deploy-simple.ps1` 文件
- [ ] PowerShell 已打開

---

## 📞 需要幫助？

如果仍有問題：
1. 確保 Node.js 已安裝
2. 確保網絡連接正常
3. 檢查項目目錄是否完整

運行這個命令檢查環境：
```powershell
node --version
npm --version
```

都顯示版本號就表示環境正常！
