# 經濟趨勢通 (EconoTrends Insight) - 後端 API 說明

## 🚀 已實現的功能

### 1. 經濟指標 API (`/api/indicators`)

#### 獲取所有指標

```
GET /api/indicators
```

回傳所有經濟指標的清單和當前數值。

#### 獲取特定指標詳細數據

```
GET /api/indicators/{id}?periods=24&includeForecasts=true
```

- `id`: 指標 ID（cpi, gdp, unemployment, interest_rate）
- `periods`: 歷史資料期數（預設 24）
- `includeForecasts`: 是否包含預測（預設 false）

### 2. 趨勢預測 API (`/api/forecast`)

```
POST /api/forecast
{
  "indicator": "cpi",
  "periods": 6,
  "confidence": 0.8
}
```

生成指定指標的未來趨勢預測，包含信心區間。

### 3. AI 洞察 API (`/api/insights`)

#### 生成 AI 摘要

```
POST /api/insights
{
  "indicator": "cpi",
  "type": "summary"
}
```

#### 獲取最新洞察

```
GET /api/insights
```

### 4. AI 問答 API (`/api/chat`)

#### 發送問題

```
POST /api/chat
{
  "message": "目前物價怎麼樣？有升息可能嗎？",
  "sessionId": "user_123"
}
```

#### 獲取建議問題

```
GET /api/chat/suggestions
```

## 📊 資料結構

### 經濟指標數據點

```typescript
interface EconomicDataPoint {
  date: string; // YYYY-MM-DD 格式
  value: number; // 指標數值
  indicator: string; // 指標 ID
}
```

### 預測數據點

```typescript
interface ForecastDataPoint extends EconomicDataPoint {
  confidence: {
    lower: number; // 下限
    upper: number; // 上限
  };
  predicted: true;
}
```

### AI 洞察

```typescript
interface AIInsight {
  id: string;
  title: string;
  content: string;
  type: "summary" | "prediction" | "analysis" | "alert";
  indicator?: string;
  timestamp: Date;
  confidence: number;
}
```

## 🛠️ 技術架構

### 後端框架

- **Next.js App Router**: 提供 API 路由
- **TypeScript**: 型別安全
- **模擬數據服務**: 取代 FRED API（示範用）

### 資料處理

- **時間序列分析**: 趨勢計算和統計
- **簡單預測模型**: 取代 Prophet/ARIMA（示範用）
- **模擬 AI 服務**: 取代 OpenAI API（示範用）

### 前端整合

- **React Hooks**: 管理狀態和 API 呼叫
- **Canvas 圖表**: 即時數據視覺化
- **響應式設計**: 適配各種裝置

## 🔧 安裝與設置

1. 安裝依賴項：

```bash
npm install
# 或
pnpm install
```

2. 啟動開發伺服器：

```bash
npm run dev
# 或
pnpm dev
```

3. 開啟瀏覽器訪問：

```
http://localhost:3000
```

## 📝 使用範例

### 前端組件中使用 API

```typescript
// 獲取指標數據
const fetchIndicatorData = async (indicatorId: string) => {
  const response = await fetch(`/api/indicators/${indicatorId}?periods=12`);
  const result = await response.json();

  if (result.success) {
    setData(result.data.historicalData);
    setStatistics(result.data.statistics);
  }
};

// 生成預測
const generateForecast = async (indicatorId: string) => {
  const response = await fetch("/api/forecast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      indicator: indicatorId,
      periods: 6,
    }),
  });

  const result = await response.json();
  if (result.success) {
    setForecasts(result.data.forecasts);
    setAiInsight(result.data.aiInsight);
  }
};

// AI 問答
const askQuestion = async (question: string) => {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: question }),
  });

  const result = await response.json();
  if (result.success) {
    return result.data.message.content;
  }
};
```

## 🔮 後續擴展

### 真實 API 整合

1. **FRED API**: 替換模擬經濟數據
2. **OpenAI API**: 實現真實的 AI 分析
3. **Prophet/ARIMA**: 更精確的預測模型

### 功能增強

1. **使用者認證**: JWT 或 OAuth
2. **資料庫儲存**: PostgreSQL 或 MongoDB
3. **快取機制**: Redis 提升效能
4. **即時通知**: WebSocket 推送更新

### 部署建議

1. **Vercel**: 簡單的 Next.js 部署
2. **Docker**: 容器化部署
3. **CDN**: 靜態資源加速
4. **監控**: 錯誤追蹤和效能監控

## 📞 API 錯誤處理

所有 API 都遵循統一的回應格式：

```typescript
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

### 常見錯誤碼

- `400`: 請求參數錯誤
- `404`: 資源不存在
- `500`: 伺服器內部錯誤

這個後端 API 框架為經濟趨勢通提供了完整的功能基礎，可以根據實際需求進行擴展和優化。
