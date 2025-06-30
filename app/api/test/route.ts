import { NextRequest, NextResponse } from 'next/server'

// GET /api/test - 測試 API 是否正常運作
export async function GET() {
  try {
    const testData = {
      status: 'API 運作正常',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      features: [
        '經濟指標查詢',
        '趨勢預測分析', 
        'AI 智能洞察',
        '互動式問答'
      ]
    }

    return NextResponse.json({
      success: true,
      data: testData,
      message: '測試成功'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '測試失敗',
      message: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 })
  }
}
