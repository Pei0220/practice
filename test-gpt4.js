// 測試 GPT-4 整合的簡單腳本
const express = require('express')
const OpenAI = require('openai').default

// 測試 OpenAI 連接
async function testOpenAIConnection() {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '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'
    })

    console.log('🔗 正在測試 OpenAI 連接...')
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: '你是經濟趨勢通的 AI 助手，請用繁體中文回答。' 
        },
        { 
          role: 'user', 
          content: '請簡短分析 CPI 指標的重要性' 
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    })

    console.log('✅ OpenAI 連接成功！')
    console.log('🤖 GPT-4 回應:', response.choices[0]?.message?.content)
    
    return true
  } catch (error) {
    console.error('❌ OpenAI 連接失敗:', error.message)
    return false
  }
}

// 執行測試
testOpenAIConnection()
  .then(success => {
    if (success) {
      console.log('\n🎉 GPT-4 整合測試完成！AI 聊天功能現在由真正的 GPT-4 驅動。')
    } else {
      console.log('\n⚠️  GPT-4 整合失敗，請檢查 API 金鑰設定。')
    }
    process.exit(success ? 0 : 1)
  })
