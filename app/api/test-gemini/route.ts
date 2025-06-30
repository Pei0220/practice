// 測試 Gemini API 的路由
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // 簡單的 Gemini 測試，不依賴 SDK
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'GEMINI_API_KEY 未設定' 
      })
    }

    console.log('Gemini API Key 存在，長度:', apiKey.length)

    // 使用 fetch 直接呼叫 Gemini REST API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: '請用繁體中文說 "Gemini 測試成功"'
          }]
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        success: false,
        error: `Gemini API 錯誤: ${response.status} - ${errorText}`,
        status: response.status
      })
    }

    const data = await response.json()
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '無回應'

    return NextResponse.json({
      success: true,
      message: 'Gemini 整合測試成功！',
      aiResponse: aiResponse,
      model: 'gemini-1.5-flash',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Gemini 測試錯誤:', error)
    
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
