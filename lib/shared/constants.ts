import { IndicatorId, EconomicIndicator, Frequency } from './types'

// === API 配置 ===
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  VERSION: 'v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const

// === 支援的經濟指標 ===
export const ECONOMIC_INDICATORS: Record<IndicatorId, EconomicIndicator> = {
  cpi: {
    id: 'cpi',
    name: '消費者物價指數',
    nameEn: 'Consumer Price Index',
    unit: '年增率 (%)',
    frequency: 'monthly',
    source: 'FRED',
    description: '衡量通膨水準的重要指標，反映消費者購買商品和服務的價格變化',
    category: '通膨指標',
    isActive: true,
  },
  gdp: {
    id: 'gdp',
    name: '國內生產毛額',
    nameEn: 'Gross Domestic Product',
    unit: '年增率 (%)',
    frequency: 'quarterly',
    source: 'FRED',
    description: '衡量經濟成長的關鍵指標，反映國家經濟活動的總體表現',
    category: '經濟成長',
    isActive: true,
  },
  unemployment: {
    id: 'unemployment',
    name: '失業率',
    nameEn: 'Unemployment Rate',
    unit: '百分比 (%)',
    frequency: 'monthly',
    source: 'FRED',
    description: '反映勞動市場狀況，是重要的經濟健康指標',
    category: '就業指標',
    isActive: true,
  },
  interest_rate: {
    id: 'interest_rate',
    name: '聯邦基金利率',
    nameEn: 'Federal Funds Rate',
    unit: '百分比 (%)',
    frequency: 'monthly',
    source: 'FRED',
    description: '央行貨幣政策的重要工具，影響整體經濟活動',
    category: '貨幣政策',
    isActive: true,
  },
} as const

// === 指標分類 ===
export const INDICATOR_CATEGORIES = {
  '通膨指標': ['cpi'],
  '經濟成長': ['gdp'],
  '就業指標': ['unemployment'],
  '貨幣政策': ['interest_rate'],
} as const

// === 更新頻率配置 ===
export const FREQUENCY_CONFIG: Record<Frequency, { 
  label: string
  intervalDays: number
  defaultPeriods: number
}> = {
  daily: { label: '每日', intervalDays: 1, defaultPeriods: 30 },
  weekly: { label: '每週', intervalDays: 7, defaultPeriods: 52 },
  monthly: { label: '每月', intervalDays: 30, defaultPeriods: 24 },
  quarterly: { label: '每季', intervalDays: 90, defaultPeriods: 8 },
  annually: { label: '每年', intervalDays: 365, defaultPeriods: 5 },
} as const

// === 預測配置 ===
export const FORECAST_CONFIG = {
  DEFAULT_PERIODS: 6,
  MAX_PERIODS: 24,
  MIN_CONFIDENCE: 0.5,
  DEFAULT_CONFIDENCE: 0.8,
  METHODOLOGIES: {
    linear: { name: '線性回歸', complexity: 'low' },
    exponential: { name: '指數平滑', complexity: 'medium' },
    arima: { name: 'ARIMA', complexity: 'high' },
    prophet: { name: 'Prophet', complexity: 'high' },
  },
} as const

// === AI 配置 ===
export const AI_CONFIG = {
  OPENAI: {
    MODEL: process.env.OPENAI_MODEL || 'gpt-4',
    MAX_TOKENS: 500,
    TEMPERATURE: 0.7,
  },
  PROMPTS: {
    SUMMARY_MAX_LENGTH: 150,
    PREDICTION_MAX_LENGTH: 200,
    CHAT_MAX_LENGTH: 250,
  },
  CONFIDENCE_THRESHOLDS: {
    HIGH: 0.8,
    MEDIUM: 0.6,
    LOW: 0.4,
  },
} as const

// === 聊天意圖關鍵字 ===
export const INTENT_KEYWORDS = {
  indicator_query: ['怎麼樣', '如何', '目前', '現在', '數值', '數據'],
  trend_analysis: ['趨勢', '變化', '走勢', '發展', '演變'],
  policy_prediction: ['央行', '升息', '降息', '政策', '利率'],
  comparison: ['比較', '差別', '關係', '對比', '相較'],
  explanation: ['為什麼', '原因', '解釋', '說明', '影響'],
  general: ['幫助', '建議', '意見', '看法'],
} as const

// === 錯誤訊息 ===
export const ERROR_MESSAGES = {
  INDICATOR_NOT_FOUND: '找不到指定的經濟指標',
  DATA_NOT_AVAILABLE: '暫無可用數據',
  INVALID_DATE_RANGE: '無效的日期範圍',
  RATE_LIMIT_EXCEEDED: '請求頻率過高，請稍後再試',
  AI_SERVICE_ERROR: 'AI 服務暫時無法使用',
  FORECAST_ERROR: '預測生成失敗',
  NETWORK_ERROR: '網路連線問題',
  INTERNAL_ERROR: '系統內部錯誤',
} as const

// === 預設設定 ===
export const DEFAULT_USER_PREFERENCES = {
  defaultIndicators: ['cpi', 'gdp', 'unemployment'] as IndicatorId[],
  timeRange: {
    default: 24, // months
    max: 60,
  },
  language: 'zh-TW' as const,
  notifications: {
    alerts: true,
    insights: true,
    forecasts: false,
  },
  display: {
    theme: 'system' as const,
    chartType: 'line' as const,
    density: 'comfortable' as const,
  },
} as const

// === 圖表配置 ===
export const CHART_CONFIG = {
  COLORS: {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
    gray: '#6b7280',
  },
  INDICATOR_COLORS: {
    cpi: '#ef4444', // red - 通膨警示
    gdp: '#10b981', // green - 成長
    unemployment: '#3b82f6', // blue - 中性
    interest_rate: '#f59e0b', // orange - 政策
  },
  FORECAST_OPACITY: 0.3,
  CONFIDENCE_OPACITY: 0.1,
} as const

// === 快取配置 ===
export const CACHE_CONFIG = {
  DURATIONS: {
    INDICATORS: 5 * 60 * 1000, // 5 minutes
    HISTORICAL_DATA: 30 * 60 * 1000, // 30 minutes
    FORECASTS: 60 * 60 * 1000, // 1 hour
    INSIGHTS: 15 * 60 * 1000, // 15 minutes
    CHAT_CONTEXT: 5 * 60 * 1000, // 5 minutes
  },
  KEYS: {
    INDICATORS: 'econotrends:indicators',
    DATA: 'econotrends:data',
    FORECASTS: 'econotrends:forecasts',
    INSIGHTS: 'econotrends:insights',
  },
} as const

// === 分頁配置 ===
export const PAGINATION_CONFIG = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_OFFSET: 0,
} as const

// === 驗證規則 ===
export const VALIDATION_RULES = {
  INDICATOR_ID: /^[a-z_]+$/,
  DATE_FORMAT: /^\d{4}-\d{2}-\d{2}$/,
  PERIODS: { min: 1, max: 100 },
  CONFIDENCE: { min: 0.1, max: 1.0 },
  MESSAGE_LENGTH: { min: 1, max: 1000 },
} as const

// === 外部 API 配置 ===
export const EXTERNAL_APIS = {
  FRED: {
    BASE_URL: 'https://api.stlouisfed.org/fred',
    KEY: process.env.FRED_API_KEY,
    ENDPOINTS: {
      series: '/series',
      observations: '/series/observations',
      search: '/series/search',
    },
  },
  OPENAI: {
    API_KEY: process.env.OPENAI_API_KEY,
    BASE_URL: 'https://api.openai.com/v1',
  },
} as const

// === 響應式斷點 ===
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

// === 動畫配置 ===
export const ANIMATION_CONFIG = {
  DURATIONS: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  EASINGS: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },
} as const
