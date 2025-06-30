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

    try {
      const fullPrompt = this.buildFullPrompt(message, intent, economicData)
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Gemini API 錯誤響應:', response.status, errorText)
        
        // 如果是 429 錯誤（請求過多），直接拋出特定錯誤
        if (response.status === 429) {
          throw new Error('GEMINI_RATE_LIMITED')
        }
        
        throw new Error(`Gemini API 錯誤: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const generatedText = data.candidates[0].content.parts[0].text
        console.log('Gemini 回應生成成功，長度:', generatedText.length)
        return generatedText
      } else {
        console.error('Gemini 回應格式異常:', data)
        throw new Error('Gemini 回應格式不正確')
      }
    } catch (error) {
      console.error('Gemini 經濟分析錯誤:', error)
      
      // 如果是限制錯誤，使用更友好的錯誤訊息
      if (error instanceof Error && error.message === 'GEMINI_RATE_LIMITED') {
        throw new Error('GEMINI_RATE_LIMITED')
      }
      
      throw new Error(`Gemini 分析錯誤: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 生成趨勢預測分析
   */
  static async generateTrendForecast(
    indicators: IndicatorId[],
    historicalData: Record<string, EconomicDataPoint[]>
  ): Promise<string> {
    console.log('Gemini 開始生成趨勢預測:', {
      indicatorCount: indicators.length,
      indicators,
      hasHistoricalData: Object.keys(historicalData).length > 0
    })

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY 環境變數未設定')
    }

    try {
      const fullPrompt = this.buildForecastPrompt(indicators, historicalData)
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.6,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 1024,
          }
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Gemini 趨勢預測 API 錯誤:', errorText)
        throw new Error(`Gemini 趨勢預測 API 錯誤: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const generatedText = data.candidates[0].content.parts[0].text
        console.log('Gemini 趨勢預測生成成功')
        return generatedText
      } else {
        throw new Error('Gemini 趨勢預測回應格式不正確')
      }
    } catch (error) {
      console.error('Gemini 趨勢預測錯誤:', error)
      throw new Error(`Gemini 趨勢預測錯誤: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 建構完整的對話提示
   */
  private static buildFullPrompt(
    message: string,
    intent: ChatIntent,
    economicData: Record<string, any>
  ): string {
    const basePrompt = `你是一個專業的經濟分析師，專門用簡單易懂的方式解釋經濟概念。

**回答原則：**
1. 使用日常生活的比喻和例子
2. 避免過於技術性的術語
3. 回答要簡潔（150-200字）
4. 提供實用的投資或理財建議
5. 語氣要親切、專業但不失幽默

**意圖分析：**
- 類型：${intent.type}
- 相關指標：${intent.indicators.join(', ')}
- 信心度：${intent.confidence}

**最新經濟數據：**
${this.formatEconomicData(economicData)}

**用戶問題：**
${message}

請用白話文回答，就像在跟朋友聊天一樣：`

    return basePrompt
  }

  /**
   * 建構趨勢預測提示
   */
  private static buildForecastPrompt(
    indicators: IndicatorId[],
    historicalData: Record<string, EconomicDataPoint[]>
  ): string {
    const dataStr = Object.entries(historicalData)
      .map(([id, data]) => {
        const latest = data[data.length - 1]
        const previous = data[data.length - 2]
        const change = previous ? ((latest.value - previous.value) / previous.value * 100).toFixed(2) : '0'
        return `${id}: 最新值 ${latest.value}，較上期${change > '0' ? '增加' : '減少'} ${Math.abs(parseFloat(change))}%`
      })
      .join('\n')

    return `請分析以下經濟指標的趨勢，並用簡單易懂的語言預測未來 3-6 個月的走向：

**指標數據：**
${dataStr}

**請提供：**
1. 各指標未來走勢預測（用生活化的比喻）
2. 對一般民眾的影響（如物價、就業、投資）
3. 簡單的理財建議

回答要簡潔，約 200-250 字，語氣輕鬆但專業：`
  }

  /**
   * 格式化經濟數據
   */
  private static formatEconomicData(economicData: Record<string, any>): string {
    if (!economicData || Object.keys(economicData).length === 0) {
      return '暫無相關經濟數據'
    }

    return Object.entries(economicData)
      .map(([key, value]) => {
        if (typeof value === 'object' && value.latest) {
          return `${key}: ${value.latest}% (${value.change > 0 ? '+' : ''}${value.change}%)`
        }
        return `${key}: ${value}`
      })
      .join('\n')
  }
}
