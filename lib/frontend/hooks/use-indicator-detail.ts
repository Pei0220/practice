"use client"

import { useState, useEffect } from 'react'
import { EconomicIndicator, EconomicDataPoint, TrendAnalysis } from '@/lib/shared/types'

interface Statistics {
  average: number
  min: number
  max: number
  volatility: number
}

export interface IndicatorDetailData {
  indicator: EconomicIndicator
  historicalData: EconomicDataPoint[]
  forecasts: EconomicDataPoint[]
  statistics: Statistics
  trend: TrendAnalysis
}

export function useIndicatorDetail(indicatorId: string, periods: number = 24, includeForecasts: boolean = true) {
  const [data, setData] = useState<IndicatorDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchIndicatorDetail() {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({
          periods: periods.toString(),
          includeForecasts: includeForecasts.toString()
        })

        const response = await fetch(`/api/indicators/${indicatorId}?${params}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || '獲取指標詳情失敗')
        }

        if (!result.success) {
          throw new Error(result.error || '獲取指標詳情失敗')
        }

        setData(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '獲取指標詳情時發生未知錯誤')
        console.error('獲取指標詳情失敗:', err)
      } finally {
        setLoading(false)
      }
    }

    if (indicatorId) {
      fetchIndicatorDetail()
    }
  }, [indicatorId, periods, includeForecasts])

  const refetch = () => {
    if (indicatorId) {
      setLoading(true)
      setError(null)
      // Re-trigger the effect
      const params = new URLSearchParams({
        periods: periods.toString(),
        includeForecasts: includeForecasts.toString()
      })

      fetch(`/api/indicators/${indicatorId}?${params}`)
        .then(response => response.json())
        .then(result => {
          if (!result.success) {
            throw new Error(result.error || '獲取指標詳情失敗')
          }
          setData(result.data)
        })
        .catch(err => {
          setError(err instanceof Error ? err.message : '獲取指標詳情時發生未知錯誤')
          console.error('獲取指標詳情失敗:', err)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }

  return {
    data,
    loading,
    error,
    refetch
  }
}
