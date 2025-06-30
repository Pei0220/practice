import { useState, useCallback } from 'react'
import { 
  ForecastDataPoint, 
  ForecastRequest,
  ForecastResponse, 
  APIResponse 
} from '../../shared/types'

export interface UseForecastProps {
  autoGenerate?: boolean
}

export interface UseForecastReturn {
  forecasts: ForecastDataPoint[]
  methodology: string | null
  accuracy: { mape: number; rmse: number } | null
  loading: boolean
  error: string | null
  generateForecast: (request: ForecastRequest) => Promise<void>
  clearForecasts: () => void
}

/**
 * 預測功能管理 Hook
 * 處理經濟指標預測的生成和狀態管理
 */
export const useForecast = ({ autoGenerate = false }: UseForecastProps = {}): UseForecastReturn => {
  const [forecasts, setForecasts] = useState<ForecastDataPoint[]>([])
  const [methodology, setMethodology] = useState<string | null>(null)
  const [accuracy, setAccuracy] = useState<{ mape: number; rmse: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateForecast = useCallback(async (request: ForecastRequest) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: APIResponse<ForecastResponse> = await response.json()
      
      if (result.success && result.data) {
        setForecasts(result.data.forecasts)
        setMethodology(result.data.methodology)
        setAccuracy(result.data.accuracy)
      } else {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || '預測生成失敗'
        throw new Error(errorMessage)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知錯誤')
      console.error('Forecast generation error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearForecasts = useCallback(() => {
    setForecasts([])
    setMethodology(null)
    setAccuracy(null)
    setError(null)
  }, [])

  return {
    forecasts,
    methodology,
    accuracy,
    loading,
    error,
    generateForecast,
    clearForecasts,
  }
}

/**
 * 多指標預測比較 Hook
 */
export const useMultiForecast = () => {
  const [predictions, setPredictions] = useState<Record<string, ForecastDataPoint[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateMultipleForecasts = useCallback(async (requests: ForecastRequest[]) => {
    setLoading(true)
    setError(null)
    
    try {
      const promises = requests.map(request =>
        fetch('/api/forecast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        }).then(res => res.json())
      )

      const results = await Promise.all(promises)
      const newPredictions: Record<string, ForecastDataPoint[]> = {}

      results.forEach((result, index) => {
        if (result.success && result.data) {
          const indicator = requests[index].indicator
          newPredictions[indicator] = result.data.forecasts
        }
      })

      setPredictions(newPredictions)
    } catch (err) {
      setError(err instanceof Error ? err.message : '批量預測失敗')
      console.error('Multi-forecast error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearAllPredictions = useCallback(() => {
    setPredictions({})
    setError(null)
  }, [])

  return {
    predictions,
    loading,
    error,
    generateMultipleForecasts,
    clearAllPredictions,
  }
}
