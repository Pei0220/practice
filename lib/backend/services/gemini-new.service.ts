import { 
  IndicatorId, 
  EconomicDataPoint, 
  ChatIntent 
} from '../../shared/types'

/**
 * Google Gemini AI 整合服務（使用 REST API）
 */
export class GeminiService {

  /**
   * 生成經濟分析回應
   */
  static async generateEconomicAnalysis(
    message: string,
    intent: ChatIntent,
    economicData: Record<string, any>
  ): Promise<string> {
    console.log('Gemini 開始生成經濟分析:', {
      message: message.substring(0, 100),
      intentType: intent.type,
      indicators: intent.indicators,
      hasEconomicData: Object.keys(economicData).length > 0
    })

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY 環境變數未設定')
    }

    // 構建完整提示
    const fullPrompt = this.buildFullPrompt(message, intent, economicData)

    console.log('準備呼叫 Gemini API:', {
      promptLength: fullPrompt.length,
      model: 'gemini-1.5-flash'
    })

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7,
          }
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Gemini API 錯誤: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '抱歉，我現在無法生成回應。'

      console.log('Gemini API 呼叫成功:', {
        responseLength: text.length
      })
      
      return text
    } catch (error) {
      console.error('Gemini API 詳細錯誤:', error)
      throw new Error(`Gemini 服務錯誤: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 生成趨勢預測
   */
  static async generateTrendForecast(
    indicators: IndicatorId[],
    historicalData: Record<string, EconomicDataPoint[]>
  ): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY 環境變數未設定')
    }

    const fullPrompt = this.buildForecastPrompt(indicators, historicalData)

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            maxOutputTokens: 1200,
            temperature: 0.6,
          }
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Gemini API 錯誤: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '無法生成趨勢預測。'

      return text
    } catch (error) {
      console.error('Gemini 趨勢預測錯誤:', error)
      throw new Error(`Gemini 趨勢預測錯誤: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 建構完整提示
   */
  private static buildFullPrompt(
    message: string,
    intent: ChatIntent,
    economicData: Record<string, any>
  ): string {
    let prompt = `你是「經濟趨勢通」的 AI 助手，請用簡單易懂的繁體中文回答經濟問題。

回答要求：
- 用白話文，避免複雜的經濟學術語
- 重點放在實用資訊，不要太學術
- 回答長度控制在 3-5 句話內
- 如果有數據，用簡單的比較來說明（比如：比上個月高/低）
- 提供具體的影響說明（比如：對民眾生活的影響）

用戶問題：${message}\n\n`

    // 添加相關經濟數據（用更友善的方式）
    if (intent.indicators.length > 0 && Object.keys(economicData).length > 0) {
      prompt += '最新經濟狀況：\n'
      
      intent.indicators.forEach(indicator => {
        const data = economicData[indicator]
        if (data) {
          const indicatorName = this.getSimpleIndicatorName(indicator)
          const latest = data.statistics?.latest
          const change = data.statistics?.change
          const trend = data.trend?.direction

          prompt += `📊 ${indicatorName}：${latest?.toFixed(1)}%`
          
          if (change > 0.1) {
            prompt += ` (比之前上升 ${change.toFixed(1)}%)`
          } else if (change < -0.1) {
            prompt += ` (比之前下降 ${Math.abs(change).toFixed(1)}%)`
          } else {
            prompt += ` (與之前差不多)`
          }
          prompt += '\n'
        }
      })
      prompt += '\n'
    }

    // 根據問題類型給予簡化指導
    switch (intent.type) {
      case 'trend_analysis':
        prompt += '請簡單說明：1) 最近的變化 2) 可能的原因 3) 對一般人的影響'
        break
      case 'policy_prediction':
        prompt += '請簡單說明：1) 政府可能會怎麼做 2) 對民眾有什麼影響'
        break
      case 'explanation':
        prompt += '請用簡單的方式解釋這個經濟指標，以及為什麼重要'
        break
      case 'comparison':
        prompt += '請簡單比較這些指標，說明它們之間的關係'
        break
      default:
        prompt += '請用簡單易懂的方式回答，重點說明對日常生活的影響'
    }

    return prompt
  }

  /**
   * 建構預測提示
   */
  private static buildForecastPrompt(
    indicators: IndicatorId[],
    historicalData: Record<string, EconomicDataPoint[]>
  ): string {
    let prompt = `你是經濟趨勢專家，請用簡單的中文分析經濟走向。

回答要求：
- 用一般人能懂的話語
- 不要用太多專業術語
- 重點說明：最近的變化、可能原因、未來3-6個月的預測
- 最後說明對一般民眾生活的影響
- 整個回答控制在 5-7 句話內

最近的經濟數據：\n`

    indicators.forEach(indicator => {
      const data = historicalData[indicator]
      if (data && data.length > 0) {
        const indicatorName = this.getSimpleIndicatorName(indicator)
        prompt += `📈 ${indicatorName}趨勢：\n`
        
        // 取最近6個數據點，用更簡單的方式呈現
        const recentData = data.slice(-6)
        const firstValue = recentData[0]?.value
        const lastValue = recentData[recentData.length - 1]?.value
        
        if (firstValue && lastValue) {
          const change = lastValue - firstValue
          if (change > 0.1) {
            prompt += `半年來從 ${firstValue.toFixed(1)}% 上升到 ${lastValue.toFixed(1)}% (上升趨勢)\n`
          } else if (change < -0.1) {
            prompt += `半年來從 ${firstValue.toFixed(1)}% 下降到 ${lastValue.toFixed(1)}% (下降趨勢)\n`
          } else {
            prompt += `半年來維持在 ${lastValue.toFixed(1)}% 左右 (穩定)\n`
          }
        }
        prompt += '\n'
      }
    })

    prompt += `請簡單分析：
1. 這些數據顯示什麼趨勢？
2. 為什麼會有這樣的變化？
3. 未來3-6個月可能怎麼發展？
4. 對一般人的生活有什麼影響？`

    return prompt
  }

  /**
   * 獲取指標的簡單名稱（更親民）
   */
  private static getSimpleIndicatorName(indicator: IndicatorId): string {
    const names = {
      cpi: '物價指數',
      gdp: '經濟成長',
      unemployment: '失業率',
      interest_rate: '利率'
    }
    return names[indicator] || indicator
  }

  /**
   * 獲取指標的顯示名稱
   */
  private static getIndicatorDisplayName(indicator: IndicatorId): string {
    const names = {
      cpi: 'CPI 消費者物價指數',
      gdp: 'GDP 國內生產總值',
      unemployment: '失業率',
      interest_rate: '基準利率'
    }
    return names[indicator] || indicator
  }
}
