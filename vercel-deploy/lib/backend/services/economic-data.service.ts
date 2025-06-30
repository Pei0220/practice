import { 
  IndicatorId, 
  EconomicDataPoint, 
  EconomicIndicator, 
  EconomicStatistics, 
  TrendAnalysis,
  IndicatorQuery,
  APIResponse 
} from '../../shared/types'
import { ECONOMIC_INDICATORS, FREQUENCY_CONFIG } from '../../shared/constants'

/**
 * 經濟數據服務 - 處理經濟指標的獲取、分析和統計
 */
export class EconomicDataService {
  
  /**
   * 獲取所有支援的經濟指標
   */
  static getAllIndicators(): EconomicIndicator[] {
    return Object.values(ECONOMIC_INDICATORS).filter(indicator => indicator.isActive)
  }

  /**
   * 根據 ID 獲取特定指標資訊
   */
  static getIndicatorById(id: IndicatorId): EconomicIndicator | null {
    return ECONOMIC_INDICATORS[id] || null
  }

  /**
   * 生成模擬歷史數據
   * TODO: 替換為真實的 FRED API 呼叫
   */
  static async generateHistoricalData(
    indicatorId: IndicatorId,
    periods: number = 24,
    endDate: Date = new Date()
  ): Promise<EconomicDataPoint[]> {
    const indicator = this.getIndicatorById(indicatorId)
    if (!indicator) {
      throw new Error(`指標不存在: ${indicatorId}`)
    }

    const data: EconomicDataPoint[] = []
    const baseValues = this.getBaseValues()
    const baseValue = baseValues[indicatorId]
    
    // 根據頻率調整間隔
    const intervalDays = FREQUENCY_CONFIG[indicator.frequency].intervalDays

    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date(endDate)
      date.setDate(date.getDate() - (i * intervalDays))

      // 生成具有趨勢和季節性的數據
      const value = this.generateDataPoint(indicatorId, baseValue, i, periods)
      
      data.push({
        date: this.formatDate(date),
        value: Math.round(value * 100) / 100,
        indicator: indicatorId,
        source: indicator.source,
      })
    }

    return data
  }

  /**
   * 計算經濟數據的統計指標
   */
  static calculateStatistics(data: EconomicDataPoint[]): EconomicStatistics {
    if (data.length === 0) {
      throw new Error('無法計算統計：數據為空')
    }

    const values = data.map(d => d.value)
    const sortedValues = [...values].sort((a, b) => a - b)
    
    // 基本統計
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const median = this.calculateMedian(sortedValues)
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)

    // 變化計算
    const latest = data[data.length - 1]
    const previous = data.length > 1 ? data[data.length - 2] : null
    const change = previous ? latest.value - previous.value : 0
    const changePercent = previous && previous.value !== 0 ? (change / previous.value) * 100 : 0

    return {
      mean: Math.round(mean * 100) / 100,
      median: Math.round(median * 100) / 100,
      stdDev: Math.round(stdDev * 100) / 100,
      min: Math.min(...values),
      max: Math.max(...values),
      latest: latest.value,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      dataPoints: data.length,
      period: {
        start: data[0].date,
        end: latest.date,
      },
    }
  }

  /**
   * 分析數據趨勢
   */
  static analyzeTrend(data: EconomicDataPoint[]): TrendAnalysis {
    if (data.length < 3) {
      return {
        direction: 'stable',
        strength: 0,
        confidence: 0,
        description: '數據不足以進行趨勢分析',
        significantChanges: [],
      }
    }

    // 取最近的數據進行趨勢分析
    const recentData = data.slice(-Math.min(12, data.length))
    const values = recentData.map(d => d.value)
    
    // 計算線性回歸斜率
    const slope = this.calculateSlope(values)
    const rSquared = this.calculateRSquared(values, slope)
    
    // 判斷趨勢方向
    let direction: 'increasing' | 'decreasing' | 'stable' = 'stable'
    const threshold = 0.05 // 5% 的變化門檻
    
    if (slope > threshold) {
      direction = 'increasing'
    } else if (slope < -threshold) {
      direction = 'decreasing'
    }

    // 計算趨勢強度（基於斜率絕對值和 R²）
    const strength = Math.min(Math.abs(slope) * rSquared, 1)
    
    // 尋找顯著變化點
    const significantChanges = this.findSignificantChanges(recentData)

    return {
      direction,
      strength: Math.round(strength * 100) / 100,
      confidence: Math.round(rSquared * 100) / 100,
      description: this.generateTrendDescription(direction, strength, rSquared),
      significantChanges,
    }
  }

  /**
   * 查詢經濟數據（支援複雜查詢條件）
   */
  static async queryData(query: IndicatorQuery): Promise<APIResponse> {
    try {
      const indicators = Array.isArray(query.indicator) 
        ? query.indicator 
        : query.indicator 
          ? [query.indicator] 
          : Object.keys(ECONOMIC_INDICATORS) as IndicatorId[]

      const results = []

      for (const indicatorId of indicators) {
        // 生成歷史數據
        const periods = query.limit || FREQUENCY_CONFIG[
          this.getIndicatorById(indicatorId)?.frequency || 'monthly'
        ].defaultPeriods

        const historicalData = await this.generateHistoricalData(indicatorId, periods)
        
        // 根據日期範圍過濾
        let filteredData = historicalData
        if (query.startDate || query.endDate) {
          filteredData = this.filterByDateRange(
            historicalData, 
            query.startDate, 
            query.endDate
          )
        }

        const result: any = {
          indicator: this.getIndicatorById(indicatorId),
          data: filteredData,
        }

        // 可選的統計資訊
        if (query.includeStatistics) {
          result.statistics = this.calculateStatistics(filteredData)
        }

        // 可選的趨勢分析
        if (query.includeTrend) {
          result.trend = this.analyzeTrend(filteredData)
        }

        results.push(result)
      }

      return {
        success: true,
        data: results.length === 1 ? results[0] : results,
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
          code: 'QUERY_ERROR',
          message: error instanceof Error ? error.message : '查詢失敗',
        },
      }
    }
  }

  // === 私有輔助方法 ===

  private static getBaseValues(): Record<IndicatorId, number> {
    return {
      cpi: 3.2,
      gdp: 2.8,
      unemployment: 3.7,
      interest_rate: 5.25,
    }
  }

  private static generateDataPoint(
    indicatorId: IndicatorId,
    baseValue: number,
    index: number,
    totalPeriods: number
  ): number {
    // 趨勢成分
    const trendFactors = {
      cpi: 0.02,        // CPI 緩慢上升
      gdp: 0.01,        // GDP 穩定成長
      unemployment: -0.01, // 失業率緩慢下降
      interest_rate: 0.005, // 利率略為上升
    }
    
    const trend = trendFactors[indicatorId] * (totalPeriods - index)
    
    // 季節性成分（模擬季節波動）
    const seasonality = Math.sin((index * 2 * Math.PI) / 12) * 0.1
    
    // 隨機噪音
    const noise = (Math.random() - 0.5) * 0.3
    
    // 週期性波動（模擬經濟週期）
    const cyclical = Math.sin((index * 2 * Math.PI) / 48) * 0.2
    
    return baseValue + trend + seasonality + noise + cyclical
  }

  private static calculateMedian(sortedValues: number[]): number {
    const length = sortedValues.length
    if (length % 2 === 0) {
      return (sortedValues[length / 2 - 1] + sortedValues[length / 2]) / 2
    }
    return sortedValues[Math.floor(length / 2)]
  }

  private static calculateSlope(values: number[]): number {
    const n = values.length
    const sumX = (n * (n - 1)) / 2
    const sumY = values.reduce((sum, val) => sum + val, 0)
    const sumXY = values.reduce((sum, val, i) => sum + val * i, 0)
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  }

  private static calculateRSquared(values: number[], slope: number): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const totalSumSquares = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0)
    
    const predictedValues = values.map((_, i) => mean + slope * (i - values.length / 2))
    const residualSumSquares = values.reduce(
      (sum, val, i) => sum + Math.pow(val - predictedValues[i], 2), 0
    )
    
    return Math.max(0, 1 - (residualSumSquares / totalSumSquares))
  }

  private static findSignificantChanges(data: EconomicDataPoint[]): Array<{
    date: string
    value: number
    change: number
    reason?: string
  }> {
    const changes = []
    const threshold = 0.5 // 變化門檻

    for (let i = 1; i < data.length; i++) {
      const change = Math.abs(data[i].value - data[i - 1].value)
      if (change > threshold) {
        changes.push({
          date: data[i].date,
          value: data[i].value,
          change: data[i].value - data[i - 1].value,
          reason: change > 1 ? '顯著變化' : '中等變化',
        })
      }
    }

    return changes.slice(-5) // 只返回最近 5 個顯著變化
  }

  private static generateTrendDescription(
    direction: 'increasing' | 'decreasing' | 'stable',
    strength: number,
    confidence: number
  ): string {
    const directionText = {
      increasing: '上升',
      decreasing: '下降',
      stable: '平穩',
    }

    const strengthText = strength > 0.7 ? '強烈' : strength > 0.4 ? '中等' : '微弱'
    const confidenceText = confidence > 0.8 ? '高' : confidence > 0.6 ? '中' : '低'

    return `${directionText[direction]}趨勢，強度${strengthText}（信心度：${confidenceText}）`
  }

  private static filterByDateRange(
    data: EconomicDataPoint[],
    startDate?: string,
    endDate?: string
  ): EconomicDataPoint[] {
    return data.filter(point => {
      const pointDate = new Date(point.date)
      if (startDate && pointDate < new Date(startDate)) return false
      if (endDate && pointDate > new Date(endDate)) return false
      return true
    })
  }

  private static formatDate(date: Date): string {
    return date.toISOString().split('T')[0]
  }

  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
