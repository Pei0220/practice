import { EconomicIndicator, EconomicDataPoint, ForecastDataPoint } from './types'

// 支援的經濟指標
export const ECONOMIC_INDICATORS: Record<string, EconomicIndicator> = {
  cpi: {
    id: 'cpi',
    name: '消費者物價指數',
    nameEn: 'Consumer Price Index',
    unit: '年增率 (%)',
    frequency: 'monthly',
    source: 'FRED',
    description: '衡量通膨水準的重要指標，反映消費者購買商品和服務的價格變化'
  },
  gdp: {
    id: 'gdp',
    name: '國內生產毛額',
    nameEn: 'Gross Domestic Product',
    unit: '年增率 (%)',
    frequency: 'quarterly',
    source: 'FRED',
    description: '衡量經濟成長的關鍵指標，反映國家經濟活動的總體表現'
  },
  unemployment: {
    id: 'unemployment',
    name: '失業率',
    nameEn: 'Unemployment Rate',
    unit: '百分比 (%)',
    frequency: 'monthly',
    source: 'FRED',
    description: '反映勞動市場狀況，是重要的經濟健康指標'
  },
  interest_rate: {
    id: 'interest_rate',
    name: '聯邦基金利率',
    nameEn: 'Federal Funds Rate',
    unit: '百分比 (%)',
    frequency: 'monthly',
    source: 'FRED',
    description: '央行貨幣政策的重要工具，影響整體經濟活動'
  }
}

// 獲取指標基本資料
export function getIndicatorInfo(indicatorId: string): EconomicIndicator | null {
  return ECONOMIC_INDICATORS[indicatorId] || null
}

// 獲取所有指標
export function getAllIndicators(): EconomicIndicator[] {
  return Object.values(ECONOMIC_INDICATORS)
}

// 生成模擬數據（實際專案中應該從 FRED API 獲取）
export function generateMockData(
  indicatorId: string, 
  periods: number = 24,
  endDate: Date = new Date()
): EconomicDataPoint[] {
  const indicator = ECONOMIC_INDICATORS[indicatorId]
  if (!indicator) return []

  const data: EconomicDataPoint[] = []
  const baseValues = {
    cpi: 3.2,
    gdp: 2.8,
    unemployment: 3.7,
    interest_rate: 5.25
  }

  const baseValue = baseValues[indicatorId as keyof typeof baseValues] || 2.0
  
  for (let i = periods - 1; i >= 0; i--) {
    const date = new Date(endDate)
    
    if (indicator.frequency === 'monthly') {
      date.setMonth(date.getMonth() - i)
    } else if (indicator.frequency === 'quarterly') {
      date.setMonth(date.getMonth() - i * 3)
    } else {
      date.setFullYear(date.getFullYear() - i)
    }

    // 生成帶有趨勢和隨機波動的數據
    const trend = indicatorId === 'cpi' ? 0.02 : 
                  indicatorId === 'gdp' ? 0.01 : 
                  indicatorId === 'unemployment' ? -0.01 : 0.005
    
    const seasonality = Math.sin(i * Math.PI / 6) * 0.1
    const noise = (Math.random() - 0.5) * 0.3
    
    const value = baseValue + (trend * (periods - i)) + seasonality + noise
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value * 100) / 100,
      indicator: indicatorId
    })
  }

  return data
}

// 簡單的時間序列預測（實際專案中應使用 Prophet 或 ARIMA）
export function generateForecast(
  historicalData: EconomicDataPoint[],
  periods: number = 6
): ForecastDataPoint[] {
  if (historicalData.length < 2) return []

  const forecasts: ForecastDataPoint[] = []
  const recentValues = historicalData.slice(-6).map(d => d.value)
  const trend = (recentValues[recentValues.length - 1] - recentValues[0]) / recentValues.length
  const lastValue = recentValues[recentValues.length - 1]
  const lastDate = new Date(historicalData[historicalData.length - 1].date)

  for (let i = 1; i <= periods; i++) {
    const forecastDate = new Date(lastDate)
    forecastDate.setMonth(forecastDate.getMonth() + i)
    
    const forecastValue = lastValue + (trend * i)
    const confidence = Math.max(0.1, 1 - (i * 0.15)) // 信心度隨時間遞減
    const margin = Math.abs(forecastValue) * (0.1 + i * 0.05)

    forecasts.push({
      date: forecastDate.toISOString().split('T')[0],
      value: Math.round(forecastValue * 100) / 100,
      indicator: historicalData[0].indicator,
      confidence: {
        lower: Math.round((forecastValue - margin) * 100) / 100,
        upper: Math.round((forecastValue + margin) * 100) / 100
      },
      predicted: true
    })
  }

  return forecasts
}

// 計算統計指標
export function calculateStatistics(data: EconomicDataPoint[]) {
  if (data.length === 0) return null

  const values = data.map(d => d.value)
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const sortedValues = [...values].sort((a, b) => a - b)
  const median = sortedValues.length % 2 === 0
    ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
    : sortedValues[Math.floor(sortedValues.length / 2)]

  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)

  const latest = data[data.length - 1]
  const previous = data[data.length - 2]
  const change = previous ? latest.value - previous.value : 0
  const changePercent = previous ? (change / previous.value) * 100 : 0

  return {
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    stdDev: Math.round(stdDev * 100) / 100,
    min: Math.min(...values),
    max: Math.max(...values),
    latest: latest.value,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    dataPoints: data.length
  }
}

// 分析趨勢
export function analyzeTrend(data: EconomicDataPoint[]) {
  if (data.length < 3) return { trend: 'insufficient_data', strength: 0 }

  const recentData = data.slice(-6)
  const values = recentData.map(d => d.value)
  
  // 計算線性回歸斜率
  const n = values.length
  const sumX = (n * (n - 1)) / 2
  const sumY = values.reduce((sum, val) => sum + val, 0)
  const sumXY = values.reduce((sum, val, i) => sum + val * i, 0)
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
  let strength = Math.abs(slope)
  
  if (slope > 0.05) trend = 'increasing'
  else if (slope < -0.05) trend = 'decreasing'
  
  return { trend, strength: Math.min(strength, 1) }
}
