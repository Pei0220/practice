// 測試多模型 AI 切換的 API 路由
import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/backend/services/ai.service'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    if (!message) {
      return NextResponse.json({
        success: false,
        error: '請提供測試訊息'
      })
    }

    console.log('測試多模型 AI 服務...')
    
    // 構造測試請求
    const testRequest = {
      message: message, // 直接使用字串
      sessionId: 'test-session',
      context: {}
    }

    // 呼叫 AI 服務
    const response = await AIService.processChat(testRequest)
    
    if (response.success && response.data) {
      return NextResponse.json({
        success: true,
        message: '多模型 AI 服務測試成功！',
        aiResponse: response.data.message.content,
        intent: response.data.intent,
        suggestedActions: response.data.suggestedActions,
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        success: false,
        error: response.error?.message || '未知錯誤'
      })
    }

  } catch (error) {
    console.error('多模型測試錯誤:', error)
    
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorType = error instanceof Error ? error.constructor.name : 'Unknown'
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      type: errorType,
      timestamp: new Date().toISOString()
    })
  }
}

export async function GET() {
  return NextResponse.json({
    message: '使用 POST 方法測試多模型 AI 服務',
    example: {
      method: 'POST',
      body: {
        message: 'CPI 的趨勢如何？'
      }
    }
  })
}
