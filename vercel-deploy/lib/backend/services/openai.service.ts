import OpenAI from 'openai'
import { 
  IndicatorId, 
  EconomicDataPoint, 
  ChatMessage, 
  ChatIntent 
} from '../../shared/types'

/**
 * OpenAI GPT-4 整合服務
 */
export class OpenAIService {
  private static openai: OpenAI | null = null

  /**
   * 初始化 OpenAI 客戶端
   */
  private static getOpenAI(): OpenAI {
    if (!this.openai) {
      const apiKey = process.env.OPENAI_API_KEY
      console.log('OpenAI 初始化檢查:', {
        hasApiKey: !!apiKey,
        keyLength: apiKey ? apiKey.length : 0,
        keyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'none'
      })
      
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY 環境變數未設定')
      }
      
      this.openai = new OpenAI({
        apiKey: apiKey,
        timeout: 30000, // 30 秒超時
        maxRetries: 2,   // 最多重試 2 次
      })
      
      console.log('OpenAI 客戶端初始化完成')
    }
    return this.openai
  }

  /**
   * 生成經濟分析回應
   */
  static async generateEconomicAnalysis(
    message: string,
    intent: ChatIntent,
    economicData: Record<string, any>
  ): Promise<string> {
    console.log('開始生成經濟分析:', {
      message: message.substring(0, 100),
      intentType: intent.type,
      indicators: intent.indicators,
      hasEconomicData: Object.keys(economicData).length > 0
    })

    const openai = this.getOpenAI()

    // 構建系統提示
    const systemPrompt = this.buildSystemPrompt()
    
    // 構建用戶提示
    const userPrompt = this.buildUserPrompt(message, intent, economicData)

    console.log('準備呼叫 OpenAI API:', {
      systemPromptLength: systemPrompt.length,
      userPromptLength: userPrompt.length,
      model: 'gpt-4o'
    })

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // 使用較穩定且成本較低的模型
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      })

      const result = response.choices[0]?.message?.content || '抱歉，我現在無法生成回應。'
      console.log('OpenAI API 呼叫成功:', {
        responseLength: result.length,
        usage: response.usage
      })
      
      return result
    } catch (error) {
      console.error('OpenAI API 詳細錯誤:', {
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      
      // 提供更詳細的錯誤信息
      if (error instanceof Error) {
        throw new Error(`OpenAI API 錯誤: ${error.message}`)
      } else {
        throw new Error('生成 AI 回應時發生未知錯誤')
      }
    }
  }

  /**
   * 生成趨勢預測
   */
  static async generateTrendForecast(
    indicators: IndicatorId[],
    historicalData: Record<string, EconomicDataPoint[]>
  ): Promise<string> {
    const openai = this.getOpenAI()

    const systemPrompt = `你是一位專業的經濟分析師，專精於趨勢分析和預測。請基於提供的歷史經濟數據，進行專業的趨勢分析和未來預測。

分析要點：
1. 數據趨勢分析（上升、下降、橫盤）
2. 季節性模式識別
3. 影響因素分析
4. 短期預測（3-6個月）
5. 風險因素評估

請用繁體中文回答，語調專業但易懂。`

    const dataDescription = this.formatHistoricalDataForAnalysis(indicators, historicalData)

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // 使用較穩定且成本較低的模型
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `請分析以下經濟指標的趨勢並提供預測：\n\n${dataDescription}` }
        ],
        max_tokens: 1200,
        temperature: 0.6,
      })

      return response.choices[0]?.message?.content || '無法生成趨勢預測。'
    } catch (error) {
      console.error('趨勢預測生成詳細錯誤:', {
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      
      if (error instanceof Error) {
        throw new Error(`趨勢預測錯誤: ${error.message}`)
      } else {
        throw new Error('生成趨勢預測時發生未知錯誤')
      }
    }
  }

  /**
   * 生成文本完成（用於AI洞察）
   */
  static async generateCompletion(
    prompt: string, 
    options: { maxTokens?: number; temperature?: number } = {}
  ): Promise<string> {
    const openai = this.getOpenAI()
    
    try {
      const { maxTokens = 300, temperature = 0.7 } = options
      
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '你是一個專業的經濟分析師，請用繁體中文提供簡潔專業的分析。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: temperature,
        top_p: 0.9,
      })

      const result = response.choices[0]?.message?.content || '無法生成分析內容。'
      console.log('OpenAI Completion 成功:', {
        responseLength: result.length,
        usage: response.usage
      })
      
      return result
    } catch (error) {
      console.error('OpenAI Completion 錯誤:', error)
      
      if (error instanceof Error) {
        throw new Error(`OpenAI Completion 錯誤: ${error.message}`)
      } else {
        throw new Error('生成文本完成時發生未知錯誤')
      }
    }
  }

  /**
   * 建構系統提示
   */
  private static buildSystemPrompt(): string {
    return `你是「經濟趨勢通」的 AI 助手，專門用簡單易懂的方式解釋經濟資訊。

回答特點：
- 使用繁體中文和白話文，避免過多專業術語
- 回答長度控制在 3-5 句話，重點明確
- 重點說明對一般民眾生活的實際影響
- 用比較和例子來說明複雜概念
- 保持客觀但親切的語調

回答結構：
1. 簡單說明當前狀況
2. 解釋主要原因
3. 說明對民眾的影響
4. (如果適合) 提供簡單的未來展望

避免：
- 複雜的經濟學理論
- 過長的技術分析
- 具體的投資建議
- 過於學術的語言`
  }

  /**
   * 建構用戶提示
   */
  private static buildUserPrompt(
    message: string,
    intent: ChatIntent,
    economicData: Record<string, any>
  ): string {
    let prompt = `用戶問題：${message}\n\n`

    // 添加相關經濟數據（用更友善的方式）
    if (intent.indicators.length > 0 && Object.keys(economicData).length > 0) {
      prompt += '📊 最新經濟狀況：\n'
      
      intent.indicators.forEach(indicator => {
        const data = economicData[indicator]
        if (data) {
          const indicatorName = this.getIndicatorDisplayName(indicator)
          const latest = data.statistics?.latest
          const change = data.statistics?.change

          prompt += `• ${indicatorName}：${latest?.toFixed(1)}%`
          
          if (change > 0.1) {
            prompt += ` (比之前上升 ${change.toFixed(1)}%)`
          } else if (change < -0.1) {
            prompt += ` (比之前下降 ${Math.abs(change).toFixed(1)}%)`
          } else {
            prompt += ` (與之前相近)`
          }
          prompt += '\n'
        }
      })
      prompt += '\n'
    }

    // 根據意圖類型添加簡化指導
    switch (intent.type) {
      case 'trend_analysis':
        prompt += '請簡單說明：最近的變化趨勢、主要原因、對民眾的影響'
        break
      case 'policy_prediction':
        prompt += '請簡單說明：政府可能的政策方向、對一般人的影響'
        break
      case 'explanation':
        prompt += '請用簡單的方式解釋這個經濟概念，以及為什麼重要'
        break
      case 'comparison':
        prompt += '請簡單比較這些指標的關係和相互影響'
        break
      default:
        prompt += '請用簡單易懂的方式回答，重點說明對日常生活的影響'
    }

    return prompt
  }

  /**
   * 格式化歷史數據供分析使用
   */
  private static formatHistoricalDataForAnalysis(
    indicators: IndicatorId[],
    historicalData: Record<string, EconomicDataPoint[]>
  ): string {
    let description = ''

    indicators.forEach(indicator => {
      const data = historicalData[indicator]
      if (data && data.length > 0) {
        const indicatorName = this.getIndicatorDisplayName(indicator)
        description += `${indicatorName} (過去12個月)：\n`
        
        // 取最近6個數據點作為範例
        const recentData = data.slice(-6)
        recentData.forEach(point => {
          const date = new Date(point.date).toLocaleDateString('zh-TW')
          description += `${date}: ${point.value.toFixed(2)}%\n`
        })
        
        description += '\n'
      }
    })

    return description
  }

  /**
   * 獲取指標的顯示名稱
   */
  private static getIndicatorDisplayName(indicator: IndicatorId): string {
    const names = {
      cpi: '物價指數',
      gdp: '經濟成長',
      unemployment: '失業率',
      interest_rate: '利率'
    }
    return names[indicator] || indicator
  }
}
