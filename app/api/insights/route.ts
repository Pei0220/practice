import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/backend/services/ai.service'
import { APIResponse, IndicatorId, InsightType } from '@/lib/shared/types'
import { UserLevel } from '@/lib/types/user'

// GET /api/insights - 獲取 AI 經濟洞察
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const indicator = searchParams.get('indicator') as IndicatorId
    const type = searchParams.get('type') as InsightType || 'summary'
    const userLevel = searchParams.get('userLevel') as UserLevel || 'intermediate'

    if (!indicator) {
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

    // 生成 AI 洞察
    const insight = await AIService.generateInsight({
      indicator,
      type,
      context: {
        timeRange: {
          start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 一年前
          end: new Date().toISOString()
        }
      }
    }, userLevel)
    
    return NextResponse.json(insight)
  } catch (error) {
    console.error('生成洞察錯誤:', error)
    
    const response: APIResponse<null> = {
      success: false,
      data: null,
      error: {
        code: 'INSIGHT_ERROR',
        message: error instanceof Error ? error.message : '生成洞察失敗'
      }
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

// POST /api/insights - 根據請求體生成 AI 經濟洞察
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { indicator, type = 'summary' } = body

    if (!indicator) {
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

    // 生成 AI 洞察
    const insight = await AIService.generateInsight({
      indicator: indicator as IndicatorId,
      type: type as InsightType,
      context: {
        timeRange: {
          start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        }
      }
    })
    
    const response: APIResponse<typeof insight.data> = {
      success: true,
      data: insight.data
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('POST 生成洞察錯誤:', error)
    
    const response: APIResponse<null> = {
      success: false,
      data: null,
      error: {
        code: 'INSIGHT_ERROR',
        message: error instanceof Error ? error.message : '生成洞察失敗'
      }
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}
