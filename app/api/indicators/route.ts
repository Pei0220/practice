import { NextRequest, NextResponse } from 'next/server'
import { EconomicDataService } from '@/lib/backend/services/economic-data.service'
import { APIResponse } from '@/lib/shared/types'

// GET /api/indicators - 獲取所有指標列表或特定指標數據
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const indicator = searchParams.get('indicator')
    const periods = searchParams.get('periods')
    const includeForecasts = searchParams.get('includeForecasts') === 'true'
    
    if (indicator) {
      // 獲取特定指標的數據
      const query = {
        indicator: indicator as any,
        periods: periods ? parseInt(periods) : 12,
        includeForecasts
      }
      
      const apiResponse = await EconomicDataService.queryData(query)
      return NextResponse.json(apiResponse)
    } else {
      // 獲取所有指標列表
      const indicators = EconomicDataService.getAllIndicators()
      
      const response: APIResponse<typeof indicators> = {
        success: true,
        data: indicators
      }
      
      return NextResponse.json(response)
    }
  } catch (error) {
    console.error('獲取指標數據錯誤:', error)
    
    const response: APIResponse<null> = {
      success: false,
      data: null,
      error: {
        code: 'FETCH_ERROR',
        message: error instanceof Error ? error.message : '獲取數據失敗'
      }
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}
