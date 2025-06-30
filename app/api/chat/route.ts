import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/backend/services/ai.service'
import { APIResponse, ChatMessage } from '@/lib/shared/types'
import { UserLevel } from '@/lib/types/user'

// POST /api/chat - AI 問答服務
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId, history = [], userLevel = 'intermediate' } = body

    if (!message || typeof message !== 'string') {
      const response: APIResponse<null> = {
        success: false,
        data: null,
        error: {
          code: 'INVALID_MESSAGE',
          message: '請提供有效的問題'
        }
      }
      return NextResponse.json(response, { status: 400 })
    }

    // 處理聊天訊息
    const chatResponse = await AIService.processChat({
      message,
      sessionId: sessionId || 'default',
      context: {
        previousMessages: history as ChatMessage[]
      }
    }, userLevel as UserLevel)
    
    return NextResponse.json(chatResponse)
  } catch (error) {
    console.error('聊天處理錯誤:', error)
    
    const response: APIResponse<null> = {
      success: false,
      data: null,
      error: {
        code: 'CHAT_ERROR',
        message: error instanceof Error ? error.message : '聊天處理失敗'
      }
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}
