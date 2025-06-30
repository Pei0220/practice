import { NextRequest, NextResponse } from 'next/server'

// GET /api/debug - 調試API功能
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'status'
    
    switch (action) {
      case 'env':
        return NextResponse.json({
          success: true,
          data: {
            hasGeminiKey: !!process.env.GEMINI_API_KEY,
            hasOpenAIKey: !!process.env.OPENAI_API_KEY,
            nodeEnv: process.env.NODE_ENV,
            geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
            openaiKeyLength: process.env.OPENAI_API_KEY?.length || 0
          }
        })
        
      case 'apis':
        return NextResponse.json({
          success: true,
          data: {
            availableApis: [
              '/api/indicators',
              '/api/indicators/[id]',
              '/api/forecast',
              '/api/insights',
              '/api/chat'
            ]
          }
        })
        
      default:
        return NextResponse.json({
          success: true,
          data: {
            message: '調試API正常運行',
            timestamp: new Date().toISOString(),
            actions: ['env', 'apis']
          }
        })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '調試失敗'
    }, { status: 500 })
  }
}
