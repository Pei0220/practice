/**
 * AI 服務配置
 */
export const AI_SERVICE_CONFIG = {
  // 服務優先級（根據環境變數或預設值）
  priority: (process.env.AI_SERVICE_PRIORITY || 'openai,gemini').split(','),
  
  // 是否啟用備用回應
  fallbackEnabled: process.env.AI_FALLBACK_ENABLED !== 'false',
  
  // 重試次數
  retryAttempts: parseInt(process.env.AI_RETRY_ATTEMPTS || '2'),
  
  // OpenAI 配置
  openai: {
    enabled: !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'test_key_please_replace'),
    model: process.env.OPENAI_MODEL || 'gpt-4',
    maxTokens: 1000,
    temperature: 0.7
  },
  
  // Gemini 配置
  gemini: {
    enabled: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'test_key_please_replace'),
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    maxTokens: 1024,
    temperature: 0.7
  },
  
  // 錯誤處理
  errors: {
    rateLimitBackoff: 5000, // 5秒後重試
    maxBackoffTime: 30000,  // 最大等待時間 30秒
    retryableErrors: ['RATE_LIMITED', 'TIMEOUT', 'NETWORK_ERROR']
  }
}

/**
 * 錯誤類型定義
 */
export enum AIServiceError {
  RATE_LIMITED = 'RATE_LIMITED',
  API_KEY_INVALID = 'API_KEY_INVALID',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}

/**
 * 檢查錯誤是否可重試
 */
export function isRetryableError(error: Error): boolean {
  const errorMessage = error.message.toLowerCase()
  
  // 檢查各種可重試的錯誤類型
  if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
    return true
  }
  
  if (errorMessage.includes('timeout') || errorMessage.includes('econnreset')) {
    return true
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('enotfound')) {
    return true
  }
  
  return false
}

/**
 * 獲取錯誤的等待時間
 */
export function getBackoffTime(attempt: number, baseDelay: number = 1000): number {
  // 指數退避算法
  return Math.min(baseDelay * Math.pow(2, attempt), AI_SERVICE_CONFIG.errors.maxBackoffTime)
}

/**
 * 延遲函數
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
