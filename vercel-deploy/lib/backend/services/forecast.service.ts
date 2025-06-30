import { 
  IndicatorId, 
  EconomicDataPoint, 
  ForecastDataPoint, 
  ForecastRequest, 
  ForecastResponse,
  APIResponse 
} from '../../shared/types'
import { FORECAST_CONFIG } from '../../shared/constants'
import { EconomicDataService } from './economic-data.service'
import { GeminiService } from './gemini.service'
import { OpenAIService } from './openai.service'

/**
 * 預測服務 - 處理經濟指標的趨勢預測
 */
export class ForecastService {

  /**
   * 生成經濟指標預測
   */
  static async generateForecast(request: ForecastRequest): Promise<APIResponse<ForecastResponse>> {
    try {
      const { indicator, periods, confidence = FORECAST_CONFIG.DEFAULT_CONFIDENCE, methodology = 'linear' } = request

      // 驗證請求參數
      this.validateRequest(request)

      // 獲取歷史數據（用於預測的基礎）
      const historicalPeriods = Math.max(periods * 4, 24) // 至少需要 24 期歷史數據
      const historicalData = await EconomicDataService.generateHistoricalData(
        indicator, 
        historicalPeriods
      )

      // 根據方法論生成預測
      const forecasts = await this.generateForecastData(
        historicalData,
        periods,
        confidence,
        methodology
      )

      // 計算預測準確度（模擬）
      const accuracy = this.calculateAccuracy(historicalData, methodology)

      // 生成AI洞察
      const aiInsight = await this.generateAIInsight(
        indicator, 
        historicalData, 
        forecasts, 
        methodology
      )

      const response: ForecastResponse = {
        indicator,
        historicalData: historicalData.slice(-periods), // 只返回最近的數據作為參考
        forecasts,
        methodology,
        accuracy,
        aiInsight, // 添加AI洞察
        metadata: {
          generatedAt: new Date().toISOString(),
          periods,
          confidence,
        },
      }

      return {
        success: true,
        data: response,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0',
        },
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FORECAST_ERROR',
          message: error instanceof Error ? error.message : '預測生成失敗',
          details: error,
        },
      }
    }
  }

  /**
   * 批量生成多個指標的預測
   */
  static async generateBatchForecasts(
    indicators: IndicatorId[],
    periods: number = FORECAST_CONFIG.DEFAULT_PERIODS,
    methodology: string = 'linear'
  ): Promise<APIResponse<Record<IndicatorId, ForecastResponse>>> {
    try {
      const results: Record<string, ForecastResponse> = {}

      for (const indicator of indicators) {
        const request: ForecastRequest = {
          indicator,
          periods,
          methodology: methodology as any,
        }

        const response = await this.generateForecast(request)
        if (response.success && response.data) {
          results[indicator] = response.data
        }
      }

      return {
        success: true,
        data: results as Record<IndicatorId, ForecastResponse>,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0',
        },
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'BATCH_FORECAST_ERROR',
          message: error instanceof Error ? error.message : '批量預測失敗',
        },
      }
    }
  }

  // === 預測演算法實現 ===

  /**
   * 線性回歸預測
   */
  private static linearRegression(data: EconomicDataPoint[], periods: number): number[] {
    const values = data.map(d => d.value)
    const n = values.length
    
    // 計算線性回歸參數
    const slope = this.calculateSlope(values)
    const intercept = this.calculateIntercept(values, slope)
    
    // 生成預測值
    const forecasts = []
    for (let i = 1; i <= periods; i++) {
      const forecast = intercept + slope * (n + i - 1)
      forecasts.push(forecast)
    }
    
    return forecasts
  }

  /**
   * 指數平滑預測
   */
  private static exponentialSmoothing(data: EconomicDataPoint[], periods: number): number[] {
    const values = data.map(d => d.value)
    const alpha = 0.3 // 平滑參數
    
    // 初始化
    let smoothed = values[0]
    
    // 計算平滑值
    for (let i = 1; i < values.length; i++) {
      smoothed = alpha * values[i] + (1 - alpha) * smoothed
    }
    
    // 生成預測（假設趨勢持續）
    const trend = values.length > 1 ? values[values.length - 1] - values[values.length - 2] : 0
    const forecasts = []
    
    for (let i = 1; i <= periods; i++) {
      const forecast = smoothed + trend * i
      forecasts.push(forecast)
    }
    
    return forecasts
  }

  /**
   * ARIMA 模擬預測（簡化版）
   */
  private static arimaForecast(data: EconomicDataPoint[], periods: number): number[] {
    const values = data.map(d => d.value)
    
    // 簡化的 ARIMA(1,1,1) 模型
    // 實際應用中應使用專業的時間序列庫
    const differences = []
    for (let i = 1; i < values.length; i++) {
      differences.push(values[i] - values[i - 1])
    }
    
    // 計算自回歸參數（簡化）
    const phi = this.calculateAutoRegression(differences)
    const lastDiff = differences[differences.length - 1]
    const lastValue = values[values.length - 1]
    
    // 生成預測
    const forecasts = []
    let currentValue = lastValue
    let currentDiff = lastDiff
    
    for (let i = 0; i < periods; i++) {
      currentDiff = phi * currentDiff + (Math.random() - 0.5) * 0.1 // 添加噪音
      currentValue += currentDiff
      forecasts.push(currentValue)
    }
    
    return forecasts
  }

  /**
   * Prophet 模擬預測（簡化版）
   */
  private static prophetForecast(data: EconomicDataPoint[], periods: number): number[] {
    const values = data.map(d => d.value)
    
    // 分解趨勢、季節性和噪音
    const trend = this.extractTrend(values)
    const seasonality = this.extractSeasonality(values, 12) // 假設 12 期季節週期
    
    // 生成預測
    const forecasts = []
    const lastTrend = trend[trend.length - 1]
    const trendSlope = this.calculateSlope(trend.slice(-6)) // 最近的趨勢斜率
    
    for (let i = 1; i <= periods; i++) {
      const futureTrend = lastTrend + trendSlope * i
      const seasonalComponent = seasonality[(values.length + i - 1) % seasonality.length]
      const forecast = futureTrend + seasonalComponent
      forecasts.push(forecast)
    }
    
    return forecasts
  }

  // === 輔助方法 ===

  private static async generateForecastData(
    historicalData: EconomicDataPoint[],
    periods: number,
    confidence: number,
    methodology: string
  ): Promise<ForecastDataPoint[]> {
    let forecastValues: number[] = []

    // 根據方法論選擇預測算法
    switch (methodology) {
      case 'linear':
        forecastValues = this.linearRegression(historicalData, periods)
        break
      case 'exponential':
        forecastValues = this.exponentialSmoothing(historicalData, periods)
        break
      case 'arima':
        forecastValues = this.arimaForecast(historicalData, periods)
        break
      case 'prophet':
        forecastValues = this.prophetForecast(historicalData, periods)
        break
      default:
        forecastValues = this.linearRegression(historicalData, periods)
    }

    // 轉換為 ForecastDataPoint 格式
    const forecasts: ForecastDataPoint[] = []
    const lastDate = new Date(historicalData[historicalData.length - 1].date)
    const indicator = historicalData[0].indicator

    for (let i = 0; i < periods; i++) {
      const forecastDate = new Date(lastDate)
      forecastDate.setMonth(forecastDate.getMonth() + i + 1)

      const value = forecastValues[i]
      const margin = this.calculateConfidenceMargin(value, confidence, i + 1)

      forecasts.push({
        date: this.formatDate(forecastDate),
        value: Math.round(value * 100) / 100,
        indicator,
        confidence: {
          lower: Math.round((value - margin) * 100) / 100,
          upper: Math.round((value + margin) * 100) / 100,
        },
        predicted: true,
        methodology,
      })
    }

    return forecasts
  }

  private static calculateConfidenceMargin(
    value: number, 
    confidence: number, 
    periodAhead: number
  ): number {
    // 信心邊界隨時間和信心水準調整
    const baseMargin = Math.abs(value) * 0.05 // 基礎 5% 邊界
    const timeDecay = 1 + (periodAhead - 1) * 0.1 // 時間越遠，不確定性越大
    const confidenceAdjustment = (2 - confidence) // 信心度越低，邊界越大
    
    return baseMargin * timeDecay * confidenceAdjustment
  }

  private static calculateAccuracy(
    historicalData: EconomicDataPoint[], 
    methodology: string
  ): { mape: number; rmse: number } {
    // 模擬準確度計算（實際應用中需要使用測試集）
    const baseAccuracy = {
      linear: { mape: 8.5, rmse: 0.15 },
      exponential: { mape: 7.2, rmse: 0.12 },
      arima: { mape: 6.8, rmse: 0.11 },
      prophet: { mape: 6.2, rmse: 0.10 },
    }

    const accuracy = baseAccuracy[methodology as keyof typeof baseAccuracy] || baseAccuracy.linear
    
    // 根據數據品質調整準確度
    const dataQuality = this.assessDataQuality(historicalData)
    const adjustmentFactor = 0.8 + (dataQuality * 0.4) // 0.8 到 1.2 的調整範圍

    return {
      mape: Math.round(accuracy.mape * adjustmentFactor * 100) / 100,
      rmse: Math.round(accuracy.rmse * adjustmentFactor * 100) / 100,
    }
  }

  private static assessDataQuality(data: EconomicDataPoint[]): number {
    // 簡單的數據品質評估（0-1 分數）
    const completeness = data.length >= 24 ? 1 : data.length / 24
    const consistency = this.calculateConsistency(data.map(d => d.value))
    
    return (completeness + consistency) / 2
  }

  private static calculateConsistency(values: number[]): number {
    // 計算數據一致性（低變異性 = 高一致性）
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    const cv = Math.sqrt(variance) / Math.abs(mean) // 變異係數
    
    return Math.max(0, 1 - cv) // 變異係數越低，一致性越高
  }

  // === 數學輔助方法 ===

  private static calculateSlope(values: number[]): number {
    const n = values.length
    const sumX = (n * (n - 1)) / 2
    const sumY = values.reduce((sum, val) => sum + val, 0)
    const sumXY = values.reduce((sum, val, i) => sum + val * i, 0)
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  }

  private static calculateIntercept(values: number[], slope: number): number {
    const meanX = (values.length - 1) / 2
    const meanY = values.reduce((sum, val) => sum + val, 0) / values.length
    return meanY - slope * meanX
  }

  private static calculateAutoRegression(values: number[]): number {
    // 簡化的自回歸係數計算
    if (values.length < 2) return 0
    
    let numerator = 0
    let denominator = 0
    
    for (let i = 1; i < values.length; i++) {
      numerator += values[i] * values[i - 1]
      denominator += values[i - 1] * values[i - 1]
    }
    
    return denominator !== 0 ? numerator / denominator : 0
  }

  private static extractTrend(values: number[]): number[] {
    // 使用移動平均提取趨勢
    const windowSize = Math.min(5, values.length)
    const trend = []
    
    for (let i = 0; i < values.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2))
      const end = Math.min(values.length, start + windowSize)
      const window = values.slice(start, end)
      const average = window.reduce((sum, val) => sum + val, 0) / window.length
      trend.push(average)
    }
    
    return trend
  }

  private static extractSeasonality(values: number[], period: number): number[] {
    const seasonality = new Array(period).fill(0)
    const counts = new Array(period).fill(0)
    
    // 計算每個季節位置的平均偏差
    for (let i = 0; i < values.length; i++) {
      const seasonIndex = i % period
      seasonality[seasonIndex] += values[i]
      counts[seasonIndex]++
    }
    
    // 計算平均值並去中心化
    for (let i = 0; i < period; i++) {
      if (counts[i] > 0) {
        seasonality[i] /= counts[i]
      }
    }
    
    const meanSeasonality = seasonality.reduce((sum, val) => sum + val, 0) / period
    return seasonality.map(val => val - meanSeasonality)
  }

  private static validateRequest(request: ForecastRequest): void {
    if (request.periods < 1 || request.periods > FORECAST_CONFIG.MAX_PERIODS) {
      throw new Error(`預測期數必須在 1 到 ${FORECAST_CONFIG.MAX_PERIODS} 之間`)
    }

    if (request.confidence && (request.confidence < 0.1 || request.confidence > 1.0)) {
      throw new Error('信心度必須在 0.1 到 1.0 之間')
    }
  }

  private static formatDate(date: Date): string {
    return date.toISOString().split('T')[0]
  }

  private static generateRequestId(): string {
    return `forecast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 生成AI預測洞察
   */
  private static async generateAIInsight(
    indicator: IndicatorId,
    historicalData: EconomicDataPoint[],
    forecasts: ForecastDataPoint[],
    methodology: string
  ): Promise<{ content: string; confidence: number } | undefined> {
    try {
      const indicatorNames = {
        cpi: '消費者物價指數',
        gdp: '國內生產毛額',
        unemployment: '失業率',
        interest_rate: '聯邦基金利率',
      }

      const latest = historicalData[historicalData.length - 1]
      const firstForecast = forecasts[0]
      const lastForecast = forecasts[forecasts.length - 1]
      
      const prompt = `基於${indicatorNames[indicator]}的歷史數據和${methodology}預測方法，最新數值為${latest.value.toFixed(2)}%，
預測未來${forecasts.length}期的趨勢：從${firstForecast.value.toFixed(2)}%變化至${lastForecast.value.toFixed(2)}%。
請用200字內分析這個預測趨勢的經濟意義、主要影響因素，以及對投資者和政策制定者的建議。`

      let content = ''
      
      // 優先使用 Gemini
      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'test_key_please_replace') {
        content = await GeminiService.generateTrendForecast([indicator], { [indicator]: historicalData })
      }
      // 備援使用 OpenAI
      else if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'test_key_please_replace') {
        content = await OpenAIService.generateCompletion(prompt, {
          maxTokens: 250,
          temperature: 0.6
        })
      }
      // 默認內容
      else {
        content = `${indicatorNames[indicator]}預測顯示未來${forecasts.length}期將呈現${
          lastForecast.value > firstForecast.value ? '上升' : '下降'
        }趨勢，建議關注相關經濟政策變化和市場動態。`
      }

      return {
        content: content || '預測分析暫時無法生成',
        confidence: 0.75
      }
    } catch (error) {
      console.error('生成AI預測洞察錯誤:', error)
      return undefined
    }
  }
}
