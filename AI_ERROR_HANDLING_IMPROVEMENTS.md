# AI 服務錯誤處理改進報告

## 問題描述

在使用系統時遇到 Gemini API 的 429 Too Many Requests 錯誤，導致聊天功能異常。錯誤訊息顯示：

```
GEMINI 模型失敗: Gemini 分析錯誤: Gemini API 錯誤: 429 Too Many Requests
```

## 已實施的解決方案

### 1. 改進的錯誤處理

#### Gemini 服務 (`lib/backend/services/gemini.service.ts`)

- ✅ 添加了 429 錯誤的特殊處理
- ✅ 使用 `GEMINI_RATE_LIMITED` 錯誤標識
- ✅ 更詳細的錯誤日誌記錄

#### AI 服務 (`lib/backend/services/ai.service.ts`)

- ✅ 優先檢查 API 金鑰可用性
- ✅ 改進的模型切換邏輯
- ✅ 特殊處理 Gemini 限制錯誤
- ✅ 根據用戶等級的備用回應

### 2. 配置改進

#### 環境變數 (`.env.local`)

```bash
# AI 服務設置
AI_SERVICE_PRIORITY=openai,gemini
AI_FALLBACK_ENABLED=true
AI_RETRY_ATTEMPTS=2
```

#### AI 服務配置 (`lib/backend/config/ai-service.config.ts`)

- ✅ 統一的服務配置管理
- ✅ 錯誤類型定義
- ✅ 重試機制配置
- ✅ 指數退避算法

### 3. 用戶體驗改進

#### 錯誤處理策略

1. **優先使用 OpenAI**: 將 OpenAI 設為首選服務
2. **智能降級**: Gemini 限制時自動切換到 OpenAI
3. **友好的備用回應**: 根據用戶等級提供適當的備用內容
4. **詳細日誌**: 便於問題追蹤和調試

#### 備用回應示例

- **初級用戶**: "您好！您想了解 CPI 的相關資訊。這些都是很重要的經濟指標呢！"
- **中級用戶**: "關於您的問題，您詢問了 CPI 的相關資訊。我可以為您分析..."
- **高級用戶**: "根據您的查詢，針對 CPI 的分析需求，我可以提供深度的數據解讀..."

## 錯誤處理流程

```
用戶請求
    ↓
檢查 OpenAI 可用性
    ↓
OpenAI 成功 → 返回結果
    ↓
OpenAI 失敗 → 嘗試 Gemini
    ↓
Gemini 成功 → 返回結果
    ↓
Gemini 失敗 → 檢查錯誤類型
    ↓
429 錯誤 → 跳過重試，使用備用回應
    ↓
其他錯誤 → 使用備用回應
    ↓
根據用戶等級生成適當的備用內容
```

## 預防措施

### 1. API 用量監控

- 建議監控 Gemini API 的使用量
- 設置合理的請求頻率限制
- 考慮升級 Gemini API 計劃以獲得更高配額

### 2. 負載均衡

- 優先使用 OpenAI (通常有更高的配額)
- Gemini 作為備用服務
- 可考慮添加更多 AI 服務作為備選

### 3. 緩存機制

- 對相同或相似的查詢進行緩存
- 減少 API 調用頻率
- 提高響應速度

### 4. 用戶提示

- 在高峰時段提醒用戶可能的延遲
- 提供系統狀態頁面
- 允許用戶選擇偏好的 AI 服務

## 監控建議

### 1. 錯誤追蹤

```javascript
// 添加錯誤統計
const errorStats = {
  openai_failures: 0,
  gemini_rate_limits: 0,
  fallback_uses: 0,
};
```

### 2. 性能監控

- API 回應時間
- 成功率統計
- 用戶滿意度

### 3. 告警設置

- API 配額接近限制時告警
- 連續錯誤超過閾值時告警
- 備用回應使用率過高時告警

## 後續優化

1. **實施請求排隊**: 避免突發請求造成限制
2. **添加重試機制**: 對暫時性錯誤進行智能重試
3. **用戶偏好設置**: 允許用戶選擇偏好的 AI 服務
4. **本地化處理**: 對於簡單查詢使用本地算法，減少 API 依賴

這些改進確保了即使在 API 限制的情況下，系統仍能提供有意義的回應，並根據用戶的經濟學程度調整內容的複雜度。
