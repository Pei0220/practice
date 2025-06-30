/**
 * 用戶身份等級類型定義
 */
export type UserLevel = 'beginner' | 'intermediate' | 'advanced'

/**
 * 用戶身份資訊
 */
export interface UserProfile {
  id: string
  level: UserLevel
  name?: string
  preferences?: UserPreferences
  createdAt: Date
  updatedAt: Date
}

/**
 * 用戶偏好設定
 */
export interface UserPreferences {
  language: 'zh-TW' | 'en-US'
  responseStyle: 'detailed' | 'concise'
  preferredTopics: string[]
  notificationEnabled: boolean
}

/**
 * AI回應配置
 */
export interface AIResponseConfig {
  level: UserLevel
  maxTokens: number
  temperature: number
  complexity: 'simple' | 'moderate' | 'complex'
  terminology: 'basic' | 'professional' | 'expert'
  examples: boolean
  charts: boolean
}

/**
 * 用戶身份等級配置
 */
export interface UserLevelConfig {
  name: string
  description: string
  features: string[]
  aiConfig: AIResponseConfig
}

/**
 * 聊天請求（擴展版）
 */
export interface EnhancedChatRequest {
  message: string
  userLevel: UserLevel
  sessionId?: string
  context?: {
    currentPage?: string
    relatedIndicators?: string[]
    timeRange?: {
      start: string
      end: string
    }
  }
}
