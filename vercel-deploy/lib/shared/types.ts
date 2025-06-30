// 共用型別定義 - 前後端都會使用

// === 基礎型別 ===
export type IndicatorId = 'cpi' | 'gdp' | 'unemployment' | 'interest_rate'

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually'

export type TrendDirection = 'increasing' | 'decreasing' | 'stable'

export type InsightType = 'summary' | 'prediction' | 'analysis' | 'alert'

// === 經濟指標相關 ===
export interface EconomicIndicator {
  id: IndicatorId
  name: string
  nameEn: string
  unit: string
  frequency: Frequency
  source: string
  description: string
  category: string
  isActive: boolean
  lastUpdated?: string
}

export interface EconomicDataPoint {
  date: string
  value: number
  indicator: IndicatorId
  source?: string
  revision?: boolean
}

export interface EconomicStatistics {
  mean: number
  median: number
  stdDev: number
  min: number
  max: number
  latest: number
  change: number
  changePercent: number
  dataPoints: number
  period: {
    start: string
    end: string
  }
}

export interface TrendAnalysis {
  direction: TrendDirection
  strength: number // 0-1
  confidence: number // 0-1
  description: string
  significantChanges: Array<{
    date: string
    value: number
    change: number
    reason?: string
  }>
}

// === 預測相關 ===
export interface ForecastDataPoint extends EconomicDataPoint {
  confidence: {
    lower: number
    upper: number
  }
  predicted: true
  methodology: string
}

export interface ForecastRequest {
  indicator: IndicatorId
  periods: number
  confidence?: number
  methodology?: 'arima' | 'prophet' | 'linear' | 'exponential'
}

export interface ForecastResponse {
  indicator: IndicatorId
  historicalData: EconomicDataPoint[]
  forecasts: ForecastDataPoint[]
  methodology: string
  accuracy: {
    mape: number // Mean Absolute Percentage Error
    rmse: number // Root Mean Square Error
  }
  aiInsight?: {
    content: string
    confidence: number
  }
  metadata: {
    generatedAt: string
    periods: number
    confidence: number
  }
}

// === AI 洞察相關 ===
export interface AIInsight {
  id: string
  title: string
  content: string
  type: InsightType
  indicator?: IndicatorId
  timestamp: Date
  generatedAt: string
  confidence: number
  tags: string[]
  metadata?: {
    relevantIndicators?: string[]
    dataPoints?: EconomicDataPoint[]
    timeRange?: {
      start: string
      end: string
    }
  }
  relevantData?: {
    indicators: IndicatorId[]
    dataPoints: EconomicDataPoint[]
    timeRange: {
      start: string
      end: string
    }
  }
}

export interface InsightRequest {
  indicator: IndicatorId
  type: InsightType
  context?: {
    timeRange?: {
      start: string
      end: string
    }
    compareWith?: IndicatorId[]
    focus?: string[]
  }
}

// === 聊天系統相關 ===
export interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'ai'
  role: 'user' | 'assistant'
  timestamp: Date
  metadata?: {
    intent?: ChatIntent
    indicators?: IndicatorId[]
    confidence?: number
    sources?: string[]
  }
}

export interface ChatIntent {
  type: 'indicator_query' | 'trend_analysis' | 'policy_prediction' | 'comparison' | 'explanation' | 'general'
  indicators: IndicatorId[]
  timeframe?: 'current' | 'historical' | 'forecast'
  confidence: number
  parameters?: Record<string, any>
}

export interface ChatRequest {
  message: string
  sessionId: string
  context?: {
    previousMessages?: ChatMessage[]
    userPreferences?: UserPreferences
  }
}

export interface ChatResponse {
  message: ChatMessage
  intent: ChatIntent
  suggestedActions?: Array<{
    label: string
    action: string
    data?: any
  }>
  relatedInsights?: AIInsight[]
}

// === 使用者相關 ===
export interface UserPreferences {
  defaultIndicators: IndicatorId[]
  timeRange: {
    default: number // months
    max: number
  }
  language: 'zh-TW' | 'en-US'
  notifications: {
    alerts: boolean
    insights: boolean
    forecasts: boolean
  }
  display: {
    theme: 'light' | 'dark' | 'system'
    chartType: 'line' | 'area' | 'candlestick'
    density: 'compact' | 'comfortable' | 'spacious'
  }
}

// === API 回應格式 ===
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  metadata?: {
    timestamp: string
    requestId: string
    version: string
    cached?: boolean
    rateLimit?: {
      remaining: number
      reset: number
    }
  }
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// === 查詢參數 ===
export interface IndicatorQuery {
  indicator?: IndicatorId | IndicatorId[]
  startDate?: string
  endDate?: string
  frequency?: Frequency
  limit?: number
  offset?: number
  includeStatistics?: boolean
  includeTrend?: boolean
  includeForecasts?: boolean
}

export interface InsightQuery {
  type?: InsightType | InsightType[]
  indicator?: IndicatorId | IndicatorId[]
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
  tags?: string[]
}

// === 錯誤處理 ===
export interface AppError extends Error {
  code: string
  statusCode: number
  details?: any
  timestamp: Date
}

export type ErrorCode = 
  | 'INVALID_REQUEST'
  | 'INDICATOR_NOT_FOUND'
  | 'DATA_NOT_AVAILABLE'
  | 'RATE_LIMIT_EXCEEDED'
  | 'AI_SERVICE_ERROR'
  | 'FORECAST_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'INTERNAL_ERROR'

// === 組件 Props 型別 ===
export interface ChartProps {
  data: EconomicDataPoint[]
  indicator: EconomicIndicator
  height?: number
  showTooltip?: boolean
  showGrid?: boolean
  interactive?: boolean
  forecasts?: ForecastDataPoint[]
}

export interface IndicatorCardProps {
  indicator: EconomicIndicator
  latestData: EconomicDataPoint
  statistics: EconomicStatistics
  trend: TrendAnalysis
  onClick?: () => void
  compact?: boolean
}

export interface InsightCardProps {
  insight: AIInsight
  onClick?: () => void
  showActions?: boolean
}

// === 狀態管理型別 ===
export interface AppState {
  indicators: {
    list: EconomicIndicator[]
    data: Record<IndicatorId, EconomicDataPoint[]>
    statistics: Record<IndicatorId, EconomicStatistics>
    trends: Record<IndicatorId, TrendAnalysis>
    loading: boolean
    error: string | null
  }
  forecasts: {
    data: Record<IndicatorId, ForecastResponse>
    loading: boolean
    error: string | null
  }
  insights: {
    list: AIInsight[]
    loading: boolean
    error: string | null
  }
  chat: {
    messages: ChatMessage[]
    loading: boolean
    error: string | null
    sessionId: string
  }
  user: {
    preferences: UserPreferences
    authenticated: boolean
  }
}
