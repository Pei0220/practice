// 檢查環境變數的 API 路由
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    
    return NextResponse.json({
      hasApiKey: !!apiKey,
      keyLength: apiKey ? apiKey.length : 0,
      keyStart: apiKey ? apiKey.substring(0, 10) : 'none',
      nodeEnv: process.env.NODE_ENV,
      allEnvKeys: Object.keys(process.env).filter(key => 
        key.toLowerCase().includes('openai') || 
        key.toLowerCase().includes('api')
      )
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error)
    })
  }
}
