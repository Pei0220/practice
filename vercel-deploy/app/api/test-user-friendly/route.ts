// 測試優化後的 AI 回應品質
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

    console.log('測試優化後的 AI 回應品質...')
    
    // 構造測試請求
    const testRequest = {
      message: message,
      sessionId: 'user-friendly-test',
      context: {}
    }

    // 呼叫優化後的 AI 服務
    const response = await AIService.processChat(testRequest)
    
    if (response.success && response.data) {
      return NextResponse.json({
        success: true,
        message: '✅ 優化後的 AI 回應測試',
        userQuestion: message,
        aiResponse: response.data.message.content,
        responseLength: response.data.message.content.length,
        intent: response.data.intent,
        suggestedActions: response.data.suggestedActions,
        timestamp: new Date().toISOString(),
        improvements: [
          '🎯 更簡潔的回答長度',
          '💬 更白話的表達方式',
          '📊 更直觀的數據呈現',
          '🏠 更貼近生活的影響說明'
        ]
      })
    } else {
      return NextResponse.json({
        success: false,
        error: response.error?.message || '未知錯誤'
      })
    }

  } catch (error) {
    console.error('優化測試錯誤:', error)
    
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    })
  }
}

export async function GET() {
  return NextResponse.json({
    message: '測試優化後的使用者友善 AI 回應',
    examples: [
      'CPI 的趨勢如何？',
      'GDP 成長率怎麼樣？',
      '失業率對我們有什麼影響？',
      '利率變化會影響什麼？',
      '比較 CPI 和失業率的關係'
    ],
    improvements: {
      language: '更白話、避免術語',
      length: '控制在 3-5 句話',
      focus: '重點說明對民眾的影響',
      format: '使用表情符號和清晰格式'
    }
  })
}
