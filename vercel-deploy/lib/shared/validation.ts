import { z } from 'zod'
import { 
  IndicatorId, 
  Frequency, 
  InsightType, 
  IndicatorQuery, 
  ForecastRequest, 
  InsightRequest, 
  ChatRequest 
} from './types'
import { VALIDATION_RULES } from './constants'

// === 基礎驗證 Schema ===
export const IndicatorIdSchema = z.enum(['cpi', 'gdp', 'unemployment', 'interest_rate'])

export const FrequencySchema = z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'annually'])

export const InsightTypeSchema = z.enum(['summary', 'prediction', 'analysis', 'alert'])

export const DateSchema = z.string().regex(
  VALIDATION_RULES.DATE_FORMAT,
  '日期格式必須為 YYYY-MM-DD'
)

export const PositiveIntegerSchema = z.number().int().positive('必須為正整數')

export const ConfidenceSchema = z.number()
  .min(VALIDATION_RULES.CONFIDENCE.min, `信心度不得低於 ${VALIDATION_RULES.CONFIDENCE.min}`)
  .max(VALIDATION_RULES.CONFIDENCE.max, `信心度不得高於 ${VALIDATION_RULES.CONFIDENCE.max}`)

// === 經濟數據驗證 ===
export const EconomicDataPointSchema = z.object({
  date: DateSchema,
  value: z.number(),
  indicator: IndicatorIdSchema,
  source: z.string().optional(),
  revision: z.boolean().optional(),
})

export const EconomicIndicatorSchema = z.object({
  id: IndicatorIdSchema,
  name: z.string().min(1, '指標名稱不能為空'),
  nameEn: z.string().min(1, '英文名稱不能為空'),
  unit: z.string().min(1, '單位不能為空'),
  frequency: FrequencySchema,
  source: z.string().min(1, '數據來源不能為空'),
  description: z.string().min(1, '描述不能為空'),
  category: z.string().min(1, '類別不能為空'),
  isActive: z.boolean(),
  lastUpdated: z.string().optional(),
})

// === API 請求驗證 ===
export const IndicatorQuerySchema = z.object({
  indicator: z.union([
    IndicatorIdSchema,
    z.array(IndicatorIdSchema)
  ]).optional(),
  startDate: DateSchema.optional(),
  endDate: DateSchema.optional(),
  frequency: FrequencySchema.optional(),
  limit: z.number().int().min(1).max(1000).optional(),
  offset: z.number().int().min(0).optional(),
  includeStatistics: z.boolean().optional(),
  includeTrend: z.boolean().optional(),
  includeForecasts: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate)
    }
    return true
  },
  {
    message: '開始日期不能晚於結束日期',
    path: ['startDate']
  }
)

export const ForecastRequestSchema = z.object({
  indicator: IndicatorIdSchema,
  periods: z.number()
    .int()
    .min(VALIDATION_RULES.PERIODS.min, `預測期數不得少於 ${VALIDATION_RULES.PERIODS.min}`)
    .max(VALIDATION_RULES.PERIODS.max, `預測期數不得超過 ${VALIDATION_RULES.PERIODS.max}`),
  confidence: ConfidenceSchema.optional(),
  methodology: z.enum(['arima', 'prophet', 'linear', 'exponential']).optional(),
})

export const InsightRequestSchema = z.object({
  indicator: IndicatorIdSchema,
  type: InsightTypeSchema,
  context: z.object({
    timeRange: z.object({
      start: DateSchema,
      end: DateSchema,
    }).optional(),
    compareWith: z.array(IndicatorIdSchema).optional(),
    focus: z.array(z.string()).optional(),
  }).optional(),
})

export const ChatRequestSchema = z.object({
  message: z.string()
    .min(VALIDATION_RULES.MESSAGE_LENGTH.min, '訊息不能為空')
    .max(VALIDATION_RULES.MESSAGE_LENGTH.max, `訊息長度不得超過 ${VALIDATION_RULES.MESSAGE_LENGTH.max} 字元`),
  sessionId: z.string().min(1, '會話 ID 不能為空'),
  context: z.object({
    previousMessages: z.array(z.any()).optional(),
    userPreferences: z.any().optional(),
  }).optional(),
})

// === 使用者偏好驗證 ===
export const UserPreferencesSchema = z.object({
  defaultIndicators: z.array(IndicatorIdSchema),
  timeRange: z.object({
    default: PositiveIntegerSchema,
    max: PositiveIntegerSchema,
  }),
  language: z.enum(['zh-TW', 'en-US']),
  notifications: z.object({
    alerts: z.boolean(),
    insights: z.boolean(),
    forecasts: z.boolean(),
  }),
  display: z.object({
    theme: z.enum(['light', 'dark', 'system']),
    chartType: z.enum(['line', 'area', 'candlestick']),
    density: z.enum(['compact', 'comfortable', 'spacious']),
  }),
})

// === 分頁驗證 ===
export const PaginationSchema = z.object({
  page: z.number().int().min(1, '頁數必須大於 0'),
  limit: z.number().int().min(1).max(100, '每頁項目數不得超過 100'),
})

// === 搜尋驗證 ===
export const SearchQuerySchema = z.object({
  q: z.string().min(1, '搜尋關鍵字不能為空').max(100, '搜尋關鍵字不得超過 100 字元'),
  type: z.enum(['indicators', 'insights', 'all']).optional(),
  category: z.string().optional(),
  limit: z.number().int().min(1).max(50).optional(),
})

// === 驗證函數 ===
export function validateIndicatorQuery(data: unknown): IndicatorQuery {
  return IndicatorQuerySchema.parse(data)
}

export function validateForecastRequest(data: unknown): ForecastRequest {
  return ForecastRequestSchema.parse(data)
}

export function validateInsightRequest(data: unknown): InsightRequest {
  return InsightRequestSchema.parse(data)
}

export function validateChatRequest(data: unknown): ChatRequest {
  return ChatRequestSchema.parse(data)
}

// === 部分驗證函數（用於更新操作）===
export function validatePartialUserPreferences(data: unknown) {
  return UserPreferencesSchema.partial().parse(data)
}

// === 自訂驗證器 ===
export function isValidIndicatorId(id: string): id is IndicatorId {
  return ['cpi', 'gdp', 'unemployment', 'interest_rate'].includes(id)
}

export function isValidDateRange(start: string, end: string): boolean {
  const startDate = new Date(start)
  const endDate = new Date(end)
  return startDate <= endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())
}

export function isValidTimeframe(timeframe: string): boolean {
  const validTimeframes = ['1M', '3M', '6M', '1Y', '2Y', '5Y', 'ALL']
  return validTimeframes.includes(timeframe)
}

// === 清理和標準化函數 ===
export function sanitizeMessage(message: string): string {
  return message
    .trim()
    .replace(/\s+/g, ' ') // 多個空格替換為單個空格
    .slice(0, VALIDATION_RULES.MESSAGE_LENGTH.max) // 截斷過長訊息
}

export function normalizeIndicatorId(id: string): string {
  return id.toLowerCase().replace(/[^a-z_]/g, '')
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

// === 錯誤格式化 ===
export function formatValidationError(error: z.ZodError): string {
  return error.errors
    .map(err => `${err.path.join('.')}: ${err.message}`)
    .join('; ')
}

// === 運行時驗證輔助工具 ===
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function createValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): T => {
    try {
      return schema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(formatValidationError(error))
      }
      throw error
    }
  }
}

// === 預定義驗證器 ===
export const validateEconomicDataPoint = createValidator(EconomicDataPointSchema)
export const validateEconomicIndicator = createValidator(EconomicIndicatorSchema)
export const validateUserPreferences = createValidator(UserPreferencesSchema)
export const validatePagination = createValidator(PaginationSchema)
export const validateSearchQuery = createValidator(SearchQuerySchema)
