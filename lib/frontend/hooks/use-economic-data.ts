import { useState, useEffect, useCallback } from 'react'
import { 
  EconomicDataPoint, 
  EconomicIndicator, 
  EconomicStatistics, 
  TrendAnalysis,
  APIResponse 
} from '../../shared/types'

export interface UseEconomicDataProps {
  indicator?: string
  periods?: number
  includeForecasts?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export interface UseEconomicDataReturn {
  data: EconomicDataPoint[]
  statistics: EconomicStatistics | null
  trend: TrendAnalysis | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  lastUpdated: Date | null
}

/**
 * 經濟數據管理 Hook
 * 處理經濟指標數據的獲取、快取和狀態管理
 */
export const useEconomicData = ({
  indicator,
  periods = 24,
  includeForecasts = false,
  autoRefresh = false,
  refreshInterval = 300000, // 5 分鐘
}: UseEconomicDataProps = {}): UseEconomicDataReturn => {
  const [data, setData] = useState<EconomicDataPoint[]>([])
  const [statistics, setStatistics] = useState<EconomicStatistics | null>(null)
  const [trend, setTrend] = useState<TrendAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    if (!indicator) return

    setLoading(true)
    setError(null)

    try {
      const url = `/api/indicators/${indicator}?periods=${periods}&includeForecasts=${includeForecasts}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: APIResponse = await response.json()
      
      if (result.success && result.data) {
        setData(result.data.historicalData || [])
        setStatistics(result.data.statistics || null)
        setTrend(result.data.trend || null)
        setLastUpdated(new Date())
      } else {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || '數據獲取失敗'
        throw new Error(errorMessage)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知錯誤')
      console.error('Economic data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [indicator, periods, includeForecasts])

  // 初始載入
  useEffect(() => {
    if (indicator) {
      fetchData()
    }
  }, [fetchData, indicator])

  // 自動刷新
  useEffect(() => {
    if (!autoRefresh || !indicator) return

    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchData, indicator])

  return {
    data,
    statistics,
    trend,
    loading,
    error,
    refresh: fetchData,
    lastUpdated,
  }
}

/**
 * 獲取所有經濟指標概覽的 Hook
 */
export const useEconomicIndicators = () => {
  const [indicators, setIndicators] = useState<EconomicIndicator[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchIndicators = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/indicators')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: APIResponse = await response.json()
      
      if (result.success && result.data) {
        setIndicators(result.data)
      } else {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || '指標獲取失敗'
        throw new Error(errorMessage)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知錯誤')
      console.error('Indicators fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchIndicators()
  }, [fetchIndicators])

  return {
    indicators,
    loading,
    error,
    refresh: fetchIndicators,
  }
}
