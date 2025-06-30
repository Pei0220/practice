// 測試 GPT-4 整合的 Next.js API 路由
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function GET() {
  try {
    console.log('測試 OpenAI 連接...')
    
    // 檢查 API Key
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'OPENAI_API_KEY 未設定' 
      })
    }

    console.log('API Key 存在，長度:', apiKey.length)

    // 初始化 OpenAI
    const openai = new OpenAI({
      apiKey: apiKey,
    })

    // 測試 API 呼叫
    console.log('準備測試 OpenAI API...')
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // 使用較便宜的模型進行測試
      messages: [
        { 
          role: 'system', 
          content: '你是一個助手，請用繁體中文簡短回答。' 
        },
        { 
          role: 'user', 
          content: '請說 "測試成功"' 
        }
      ],
      max_tokens: 50,
      temperature: 0.3,
    })

    const aiResponse = response.choices[0]?.message?.content || '無回應'

    return NextResponse.json({
      success: true,
      message: 'GPT-4 整合測試成功！',
      aiResponse: aiResponse,
      model: 'gpt-4o',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('GPT-4 測試錯誤:', error)
    
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
