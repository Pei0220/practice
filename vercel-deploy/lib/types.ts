// 經濟指標類型定義
export interface EconomicIndicator {
  id: string
  name: string
  nameEn: string
  unit: string
  frequency: 'monthly' | 'quarterly' | 'annually'
  source: string
  description: string
}

// 經濟數據點
export interface EconomicDataPoint {
  date: string
  value: number
  indicator: string
}

// 預測數據點
export interface ForecastDataPoint extends EconomicDataPoint {
  confidence: {
    lower: number
    upper: number
  }
  predicted: true
}

// AI 洞察
export interface AIInsight {
  id: string
  title: string
  content: string
  type: 'summary' | 'prediction' | 'analysis' | 'alert'
  indicator?: string
  timestamp: Date
  confidence: number
}

// 聊天訊息
export interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
  context?: {
    indicators?: string[]
    dataPoints?: EconomicDataPoint[]
  }
}

// API 回應格式
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 經濟指標查詢參數
export interface IndicatorQuery {
  indicator: string
  startDate?: string
  endDate?: string
  frequency?: string
  includeForecasts?: boolean
}

// 預測請求參數
export interface ForecastRequest {
  indicator: string
  periods: number
  confidence?: number
}
