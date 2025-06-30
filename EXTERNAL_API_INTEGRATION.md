# 外部 API 整合準備

## 🌐 FRED API 整合

### 1. 環境變數設定

```bash
# .env.local
FRED_API_KEY=your_fred_api_key_here
FRED_BASE_URL=https://api.stlouisfed.org/fred
```

### 2. FRED API 服務層

```typescript
// lib/backend/services/fred-api.service.ts
import { EconomicDataPoint, IndicatorId } from "@/lib/shared/types";

export class FredApiService {
  private static readonly BASE_URL =
    process.env.FRED_BASE_URL || "https://api.stlouisfed.org/fred";
  private static readonly API_KEY = process.env.FRED_API_KEY;

  // FRED 系列 ID 映射
  private static readonly SERIES_MAP: Record<IndicatorId, string> = {
    cpi: "CPIAUCSL", // 消費者物價指數
    gdp: "GDP", // 國內生產毛額
    unemployment: "UNRATE", // 失業率
    interest_rate: "FEDFUNDS", // 聯邦資金利率
    exchange_rate: "DEXUSEU", // 美元歐元匯率
  };

  static async getHistoricalData(
    indicatorId: IndicatorId,
    periods: number = 24
  ): Promise<EconomicDataPoint[]> {
    if (!this.API_KEY) {
      console.warn("FRED API key not configured, using mock data");
      return this.getMockData(indicatorId, periods);
    }

    try {
      const seriesId = this.SERIES_MAP[indicatorId];
      if (!seriesId) {
        throw new Error(`No FRED series mapping for indicator: ${indicatorId}`);
      }

      // 計算開始日期（往前推算期數）
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - periods);

      const url = `${this.BASE_URL}/series/observations`;
      const params = new URLSearchParams({
        series_id: seriesId,
        api_key: this.API_KEY,
        file_type: "json",
        observation_start: startDate.toISOString().split("T")[0],
        observation_end: endDate.toISOString().split("T")[0],
        sort_order: "desc",
        limit: periods.toString(),
      });

      const response = await fetch(`${url}?${params}`);
      if (!response.ok) {
        throw new Error(`FRED API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformFredData(data.observations, indicatorId);
    } catch (error) {
      console.error("FRED API error:", error);
      // 降級到模擬數據
      return this.getMockData(indicatorId, periods);
    }
  }

  private static transformFredData(
    observations: any[],
    indicatorId: IndicatorId
  ): EconomicDataPoint[] {
    return observations
      .filter((obs) => obs.value !== ".") // 過濾無效數據
      .map((obs) => ({
        date: obs.date,
        value: parseFloat(obs.value),
        indicator: indicatorId,
      }))
      .reverse(); // FRED 回傳的是降序，需要反轉
  }

  private static getMockData(
    indicatorId: IndicatorId,
    periods: number
  ): EconomicDataPoint[] {
    // 降級到現有的模擬數據生成
    const { EconomicDataService } = require("./economic-data.service");
    return EconomicDataService.generateHistoricalData(indicatorId, periods);
  }
}
```

## 🤖 OpenAI API 整合

### 1. 環境變數設定

```bash
# .env.local
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4
```

### 2. OpenAI 服務層擴展

```typescript
// lib/backend/services/openai.service.ts
import OpenAI from "openai";
import { ChatMessage, AIInsight } from "@/lib/shared/types";

export class OpenAIService {
  private static openai: OpenAI | null = null;

  private static getClient(): OpenAI {
    if (!this.openai) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OpenAI API key not configured");
      }
      this.openai = new OpenAI({ apiKey });
    }
    return this.openai;
  }

  static async generateEconomicInsight(data: any): Promise<AIInsight> {
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OpenAI API key not configured, using mock response");
      return this.getMockInsight();
    }

    try {
      const client = this.getClient();

      const prompt = `
        作為經濟分析專家，請分析以下經濟數據：
        ${JSON.stringify(data, null, 2)}
        
        請提供：
        1. 簡潔的趨勢摘要（2-3句話）
        2. 關鍵洞察（bullet points）
        3. 未來展望
        4. 政策建議
        
        請用繁體中文回應，語調專業但易懂。
      `;

      const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "你是一位專業的經濟分析師，擅長將複雜的經濟數據轉化為易懂的洞察分析。",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content || "";
      return this.parseInsightResponse(content);
    } catch (error) {
      console.error("OpenAI API error:", error);
      return this.getMockInsight();
    }
  }

  static async handleChatMessage(
    message: string,
    context?: any
  ): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      return this.getMockChatResponse(message);
    }

    try {
      const client = this.getClient();

      const systemPrompt = `
        你是經濟趨勢通的 AI 助手，專門回答經濟相關問題。
        
        能力範圍：
        - 經濟指標解釋
        - 趨勢分析
        - 政策影響評估
        - 投資建議（謹慎且客觀）
        
        回應風格：
        - 專業但平易近人
        - 提供具體數據支持
        - 承認不確定性
        - 建議進一步研究
      `;

      const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 800,
        temperature: 0.7,
      });

      return (
        completion.choices[0]?.message?.content ||
        "抱歉，我現在無法回應這個問題。"
      );
    } catch (error) {
      console.error("OpenAI Chat API error:", error);
      return this.getMockChatResponse(message);
    }
  }

  private static parseInsightResponse(content: string): AIInsight {
    // 解析 GPT 回應並結構化
    const lines = content.split("\n").filter((line) => line.trim());

    return {
      summary: lines[0] || "經濟數據分析摘要",
      keyPoints: lines.slice(1, 4),
      outlook: lines[4] || "展望未來經濟走向",
      recommendation: lines[5] || "建議持續關注相關指標變化",
      confidence: 0.8,
      timestamp: new Date().toISOString(),
    };
  }

  private static getMockInsight(): AIInsight {
    // 現有的模擬回應邏輯
    return {
      summary: "當前經濟指標顯示穩定發展趨勢",
      keyPoints: ["通膨壓力溫和", "就業市場穩健", "政策空間充足"],
      outlook: "未來 6 個月預期維持穩定",
      recommendation: "建議密切關注政策動向",
      confidence: 0.7,
      timestamp: new Date().toISOString(),
    };
  }

  private static getMockChatResponse(message: string): string {
    // 簡單的關鍵字匹配模擬回應
    if (message.includes("通膨") || message.includes("CPI")) {
      return "根據最新數據，CPI 年增率維持在目標區間內，通膨壓力相對溫和。建議關注能源和食品價格變化。";
    }

    return "感謝您的問題！我正在分析相關經濟數據，建議您參考最新的指標趨勢進行判斷。";
  }
}
```

## 📊 整合實施計劃

### 階段 1: 基礎整合

1. ✅ 設定環境變數
2. ✅ 修改 service 層支援真實 API
3. ✅ 實施降級機制（API 不可用時使用模擬數據）

### 階段 2: 數據增強

1. 🔄 擴展支援更多 FRED 指標
2. 🔄 實施數據快取機制
3. 🔄 添加數據質量檢查

### 階段 3: AI 增強

1. 🔄 個人化問答體驗
2. 🔄 上下文記憶功能
3. 🔄 多輪對話支援

### 部署注意事項

- 確保 API 金鑰安全性
- 實施請求速率限制
- 監控 API 使用量和成本
- 建立錯誤監控和告警
