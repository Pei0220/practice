import { NextRequest, NextResponse } from 'next/server'
import { APIResponse, IndicatorId } from '@/lib/shared/types'
import { EconomicDataService } from '@/lib/backend/services/economic-data.service'
import { ForecastService } from '@/lib/backend/services/forecast.service'

// GET /api/indicators/{id} - 獲取特定指標的詳細數據
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const searchParams = request.nextUrl.searchParams
    
    const periods = parseInt(searchParams.get('periods') || '24')
    const includeForecasts = searchParams.get('includeForecasts') === 'true'
    
    // 驗證指標 ID
    if (!['cpi', 'gdp', 'unemployment', 'interest_rate', 'exchange_rate'].includes(id)) {
      const response: APIResponse = {
        success: false,
        error: {
          code: 'INDICATOR_NOT_FOUND',
          message: `找不到指標: ${id}`
        }
      }
      return NextResponse.json(response, { status: 404 })
    }

    // 獲取指標基本資訊
    const indicator = EconomicDataService.getIndicatorById(id as IndicatorId)
    if (!indicator) {
      const response: APIResponse = {
        success: false,
        error: {
          code: 'INDICATOR_NOT_FOUND',
          message: `找不到指標: ${id}`
        }
      }
      return NextResponse.json(response, { status: 404 })
    }

    // 獲取歷史數據
    const historicalData = await EconomicDataService.generateHistoricalData(id as IndicatorId, periods)
    const statistics = EconomicDataService.calculateStatistics(historicalData)
    const trend = EconomicDataService.analyzeTrend(historicalData)

    let forecasts: any[] = []
    if (includeForecasts) {
      // 獲取預測數據
      const forecastRequest = {
        indicator: id as IndicatorId,
        periods: 6
      }
      const forecastResult = await ForecastService.generateForecast(forecastRequest)
      if (forecastResult.success && forecastResult.data) {
        forecasts = forecastResult.data.forecasts
      }
    }

    const response: APIResponse = {
      success: true,
      data: {
        indicator,
        historicalData,
        forecasts,
        statistics,
        trend
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    const response: APIResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : '未知錯誤'
      }
    }

    return NextResponse.json(response, { status: 500 })
  }
}
