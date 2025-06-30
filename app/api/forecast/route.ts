import { NextRequest, NextResponse } from 'next/server'
import { ForecastService } from '@/lib/backend/services/forecast.service'
import { APIResponse, ForecastRequest } from '@/lib/shared/types'

// POST /api/forecast - 生成趨勢預測
export async function POST(request: NextRequest) {
  try {
    const body: ForecastRequest = await request.json()
    
    if (!body.indicator) {
      const response: APIResponse<null> = {
        success: false,
        data: null,
        error: {
          code: 'MISSING_PARAMETER',
          message: '請提供指標 ID'
        }
      }
      return NextResponse.json(response, { status: 400 })
    }

    // 生成預測
    const forecastResponse = await ForecastService.generateForecast(body)
    
    return NextResponse.json(forecastResponse)
  } catch (error) {
    console.error('預測生成錯誤:', error)
    
    const response: APIResponse<null> = {
      success: false,
      data: null,
      error: {
        code: 'FORECAST_ERROR',
        message: error instanceof Error ? error.message : '預測生成失敗'
      }
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}
