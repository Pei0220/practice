import { 
  IndicatorId, 
  EconomicDataPoint, 
  ForecastDataPoint,
  AIInsight, 
  InsightRequest,
  ChatRequest, 
  ChatResponse, 
  ChatIntent,
  ChatMessage,
  APIResponse 
} from '../../shared/types'
import { UserLevel, EnhancedChatRequest } from '../../types/user'
import { AI_CONFIG, INTENT_KEYWORDS } from '../../shared/constants'
import { AI_PROMPT_TEMPLATES, USER_LEVEL_CONFIGS } from '../../constants/user-levels'
import { EconomicDataService } from './economic-data.service'
import { OpenAIService } from './openai.service'
import { GeminiService } from './gemini.service'

/**
 * AI 服務 - 處理智能分析、洞察生成和聊天互動
 */
export class AIService {

  /**
   * 生成經濟指標的 AI 洞察
   */
  static async generateInsight(request: InsightRequest, userLevel: UserLevel = 'intermediate'): Promise<APIResponse<AIInsight>> {
    try {
      const { indicator, type, context } = request

      // 獲取相關數據
      const historicalData = await EconomicDataService.generateHistoricalData(indicator, 12)
      const statistics = EconomicDataService.calculateStatistics(historicalData)
      const trend = EconomicDataService.analyzeTrend(historicalData)

      // 根據類型和用戶等級生成相應的 AI 內容
      const content = await this.generateInsightContent(
        type, 
        indicator, 
        historicalData, 
        statistics, 
        trend,
        userLevel
      )

      const insight: AIInsight = {
        id: this.generateInsightId(),
        title: this.generateInsightTitle(type, indicator),
        content,
        type,
        indicator,
        timestamp: new Date(),
        generatedAt: new Date().toISOString(),
        confidence: this.calculateContentConfidence(type, historicalData.length),
        tags: this.generateInsightTags(type, indicator, trend),
        relevantData: {
          indicators: [indicator],
          dataPoints: historicalData.slice(-3), // 最近3期數據
          timeRange: {
            start: historicalData[0].date,
            end: historicalData[historicalData.length - 1].date,
          },
        },
      }

      return {
        success: true,
        data: insight,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0',
        },
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'AI_INSIGHT_ERROR',
          message: error instanceof Error ? error.message : 'AI 洞察生成失敗',
        },
      }
    }
  }

  /**
   * 處理聊天請求 - 使用 GPT-4 生成智能回應
   */
  static async processChat(request: ChatRequest, userLevel: UserLevel = 'intermediate'): Promise<APIResponse<ChatResponse>> {
    try {
      const { message, sessionId, context } = request

      // 分析用戶意圖
      const intent = await this.analyzeIntent(message)
      
      // 獲取相關經濟數據
      const economicData = await this.getRelevantData(intent)
      
      // 使用 OpenAI GPT-4 生成回應
      let responseContent = ""
      let relatedInsights: AIInsight[] = []

      try {
        // 根據意圖類型決定使用哪種 AI 服務
        if (intent.type === 'trend_analysis' && intent.indicators.length > 0) {
          // 使用趨勢預測功能
          responseContent = await this.generateIntelligentResponse(message, intent, economicData, 'forecast', userLevel)
        } else {
          // 使用一般經濟分析功能
          responseContent = await this.generateIntelligentResponse(message, intent, economicData, 'analysis', userLevel)
        }

        // 嘗試生成相關洞察
        if (intent.indicators.length > 0) {
          const indicator = intent.indicators[0]
          const insightResponse = await this.generateInsight({
            indicator,
            type: 'summary',
            context: {}
          }, userLevel)
          
          if (insightResponse.success && insightResponse.data) {
            relatedInsights = [insightResponse.data]
          }
        }

      } catch (aiError) {
        console.error('所有 AI 服務都失敗，使用備用回應:', aiError)
        // 如果所有 AI 服務都失敗，使用本地備用回應
        responseContent = this.generateFallbackResponse(intent, economicData, userLevel)
      }

      // 建立回應訊息
      const responseMessage: ChatMessage = {
        id: this.generateMessageId(),
        content: responseContent,
        sender: 'ai',
        role: 'assistant',
        timestamp: new Date(),
        metadata: {
          intent,
          confidence: intent.confidence,
          indicators: intent.indicators
        }
      }

      // 建立完整回應
      const chatResponse: ChatResponse = {
        message: responseMessage,
        intent,
        suggestedActions: this.generateSuggestedActions(intent),
        relatedInsights
      }

      return {
        success: true,
        data: chatResponse
      }

    } catch (error) {
      console.error('Chat processing error:', error)
      return {
        success: false,
        error: {
          code: 'CHAT_PROCESSING_ERROR',
          message: error instanceof Error ? error.message : 'Failed to process chat'
        }
      }
    }
  }

  /**
   * 分析用戶意圖
   */
  private static async analyzeIntent(message: string): Promise<ChatIntent> {
    const lowerMessage = message.toLowerCase()
    
    // 檢測指標關鍵字
    const indicators: IndicatorId[] = []
    if (lowerMessage.includes('cpi') || lowerMessage.includes('物價') || lowerMessage.includes('通膨')) {
      indicators.push('cpi')
    }
    if (lowerMessage.includes('gdp') || lowerMessage.includes('經濟成長') || lowerMessage.includes('生產毛額')) {
      indicators.push('gdp')
    }
    if (lowerMessage.includes('失業') || lowerMessage.includes('就業')) {
      indicators.push('unemployment')
    }
    if (lowerMessage.includes('利率') || lowerMessage.includes('貨幣政策')) {
      indicators.push('interest_rate')
    }

    // 檢測意圖類型
    let intentType: ChatIntent['type'] = 'general'
    let confidence = 0.5

    if (indicators.length > 0) {
      intentType = 'indicator_query'
      confidence = 0.8
    } else if (lowerMessage.includes('趨勢') || lowerMessage.includes('分析') || lowerMessage.includes('預測')) {
      intentType = 'trend_analysis'
      confidence = 0.7
    } else if (lowerMessage.includes('比較') || lowerMessage.includes('對比')) {
      intentType = 'comparison'
      confidence = 0.7
    }

    return {
      type: intentType,
      indicators,
      timeframe: lowerMessage.includes('未來') || lowerMessage.includes('預測') ? 'forecast' : 'current',
      confidence,
      parameters: {}
    }
  }



  /**
   * 獲取指標中文名稱
   */
  private static getIndicatorName(indicator: IndicatorId): string {
    const names = {
      'cpi': '消費者物價指數',
      'gdp': 'GDP',
      'unemployment': '失業率',
      'interest_rate': '利率'
    }
    return names[indicator] || indicator
  }

  // === 批量生成洞察相關 ===

  /**
   * 批量生成多個指標的洞察
   */
  static async generateBatchInsights(
    indicators: IndicatorId[], 
    type: 'summary' | 'prediction' | 'analysis' = 'summary'
  ): Promise<APIResponse<AIInsight[]>> {
    try {
      const insights: AIInsight[] = []

      for (const indicator of indicators) {
        const request: InsightRequest = { indicator, type }
        const response = await this.generateInsight(request)
        
        if (response.success && response.data) {
          insights.push(response.data)
        }
      }

      return {
        success: true,
        data: insights,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0',
        },
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'BATCH_INSIGHTS_ERROR',
          message: error instanceof Error ? error.message : '批量洞察生成失敗',
        },
      }
    }
  }

  // === 內容生成 ===

  private static async generateInsightContent(
    type: string,
    indicator: IndicatorId,
    historicalData: EconomicDataPoint[],
    statistics: any,
    trend: any,
    userLevel: UserLevel = 'intermediate'
  ): Promise<string> {
    const indicatorNames = {
      cpi: '消費者物價指數',
      gdp: '國內生產毛額',
      unemployment: '失業率',
      interest_rate: '聯邦基金利率',
    }

    const latest = statistics.latest
    const change = statistics.change
    const trendText = trend.direction === 'increasing' ? '上升' : 
                     trend.direction === 'decreasing' ? '下降' : '平穩'

    // 準備數據給AI
    const dataContext = {
      indicator: indicatorNames[indicator],
      latest: latest.toFixed(2),
      change: change.toFixed(2),
      trend: trendText,
      historicalData: historicalData.slice(-6) // 最近6期數據
    }

    try {
      // 優先使用 Gemini API
      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'test_key_please_replace') {
        return await this.generateContentWithGemini(type, dataContext, userLevel)
      }
      
      // 備援使用 OpenAI API
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'test_key_please_replace') {
        return await this.generateContentWithOpenAI(type, dataContext, userLevel)
      }
      
      // 如果都沒有配置，返回預設內容
      return this.generateSummaryContent(indicatorNames[indicator], latest, change, trendText, userLevel)
      
    } catch (error) {
      console.error('AI 內容生成錯誤:', error)
      // 錯誤時返回預設內容
      return this.generateSummaryContent(indicatorNames[indicator], latest, change, trendText, userLevel)
    }
  }

  // 使用 Gemini 生成內容
  private static async generateContentWithGemini(type: string, dataContext: any, userLevel: UserLevel): Promise<string> {
    const prompt = this.buildPromptForType(type, dataContext, userLevel)
    
    try {
      // 調用 Gemini 服務
      return await GeminiService.generateEconomicAnalysis(
        prompt,
        {
          type: 'explanation',
          indicators: [dataContext.indicator],
          confidence: 0.8
        },
        dataContext
      )
    } catch (error) {
      console.error('Gemini API 錯誤:', error)
      
      // 如果是限制錯誤，拋出特定錯誤以便上層處理
      if (error instanceof Error && error.message.includes('GEMINI_RATE_LIMITED')) {
        throw new Error('GEMINI_RATE_LIMITED')
      }
      
      throw error
    }
  }

  // 使用 OpenAI 生成內容
  private static async generateContentWithOpenAI(type: string, dataContext: any, userLevel: UserLevel): Promise<string> {
    const prompt = this.buildPromptForType(type, dataContext, userLevel)
    
    try {
      // 調用 OpenAI 服務
      return await OpenAIService.generateCompletion(prompt, {
        maxTokens: 300,
        temperature: 0.7
      })
    } catch (error) {
      console.error('OpenAI API 錯誤:', error)
      throw error
    }
  }

  // 建構不同類型的提示詞
  private static buildPromptForType(type: string, dataContext: any, userLevel: UserLevel): string {
    const userConfig = USER_LEVEL_CONFIGS[userLevel]
    const promptTemplate = AI_PROMPT_TEMPLATES[userLevel]
    const baseContext = `分析${dataContext.indicator}，最新數值${dataContext.latest}%，較前期變化${dataContext.change}%，呈現${dataContext.trend}趨勢。`
    
    // 根據類型添加具體要求
    let typeSpecificPrompt = ""
    switch (type) {
      case 'summary':
        typeSpecificPrompt = "請總結當前經濟狀況和主要影響因素。"
        break
      case 'prediction':
        typeSpecificPrompt = "請預測未來3-6個月的走勢並說明原因。"
        break
      case 'analysis':
        typeSpecificPrompt = "請深入分析造成這個趨勢的經濟因素和政策影響。"
        break
      case 'alert':
        typeSpecificPrompt = "請分析是否有需要關注的風險警示，並提供建議。"
        break
      default:
        typeSpecificPrompt = "請提供經濟分析和建議。"
    }
    
    // 組合完整提示詞
    return `${promptTemplate.systemPrompt}\n\n${baseContext}\n\n${typeSpecificPrompt}\n\n回應風格：${promptTemplate.responseStyle}`
  }

  private static generateSummaryContent(
    indicatorName: string,
    latest: number,
    change: number,
    trend: string,
    userLevel: UserLevel = 'intermediate'
  ): string {
    const changeText = change > 0 ? `上升${Math.abs(change).toFixed(2)}` : 
                      change < 0 ? `下降${Math.abs(change).toFixed(2)}` : '持平'
    
    // 根據用戶等級調整回應風格
    const userConfig = USER_LEVEL_CONFIGS[userLevel]
    
    if (userLevel === 'beginner') {
      return `${indicatorName}是衡量經濟狀況的重要指標。目前數值是${latest.toFixed(2)}%，比上期${changeText}了${Math.abs(change).toFixed(2)}個百分點。簡單來說，這個數字${trend}表示經濟正在${change > 0 ? '改善' : change < 0 ? '調整' : '穩定'}。這對我們的日常生活會有一定影響，建議繼續關注。`
    } else if (userLevel === 'advanced') {
      return `${indicatorName}最新數據顯示${latest.toFixed(2)}%，月變動率${change > 0 ? '+' : ''}${change.toFixed(2)}%。基於統計分析，當前${trend}趨勢與宏觀經濟週期一致，建議結合貨幣政策、財政政策及外部經濟環境進行綜合評估。該指標對資產配置策略具有重要指導意義。`
    } else {
      // intermediate level
      return `${indicatorName}最新數值為${latest.toFixed(2)}%，較前期${changeText}個百分點。數據顯示${trend}趨勢，反映當前經濟狀況穩定發展。建議投資者關注相關政策動向和市場反應，適時調整投資策略。`
    }
  }

  private static generatePredictionContent(
    indicatorName: string,
    latest: number,
    change: number,
    trend: string
  ): string {
    const templates = [
      `基於${indicatorName}當前${trend}趨勢，預期未來3-6個月將維持類似走勢。若外部環境無重大變化，數值可能在${(latest * 0.95).toFixed(2)}%至${(latest * 1.05).toFixed(2)}%區間波動。建議關注政策動向。`,
      `${indicatorName}預測分析：考量現行${trend}態勢，估計下季數據將${change > 0 ? '續升' : change < 0 ? '續降' : '持穩'}。央行可能根據此趨勢調整相應政策。投資人宜密切留意。`,
      `根據${indicatorName}歷史模式，當前${trend}趨勢通常會持續2-4個季度。預估未來半年內，該指標將在目前水準附近波動，變動幅度約±${(Math.abs(change) * 2).toFixed(2)}%。`,
    ]
    
    return templates[Math.floor(Math.random() * templates.length)]
  }

  private static generateAnalysisContent(
    indicatorName: string,
    latest: number,
    change: number,
    trend: any
  ): string {
    const strengthText = trend.strength > 0.7 ? '強勁' : trend.strength > 0.4 ? '溫和' : '微弱'
    
    return `${indicatorName}深度分析：當前數值${latest.toFixed(2)}%，變化幅度${change.toFixed(2)}%。${trend.direction === 'increasing' ? '上升' : trend.direction === 'decreasing' ? '下降' : '平穩'}趨勢${strengthText}（強度${(trend.strength * 100).toFixed(1)}%），信心度${(trend.confidence * 100).toFixed(1)}%。此變化可能受多重因素影響，包括季節性調整、政策效應及外部環境變化。建議結合其他經濟指標進行綜合判斷。`
  }

  private static generateAlertContent(
    indicatorName: string,
    latest: number,
    change: number,
    trend: any
  ): string {
    if (Math.abs(change) > 0.5) {
      return `⚠️ ${indicatorName}出現顯著變化！最新數值${latest.toFixed(2)}%，${change > 0 ? '大幅上升' : '大幅下降'}${Math.abs(change).toFixed(2)}個百分點。此變化幅度超過正常波動範圍，建議密切關注後續發展及相關政策回應。`
    }
    
    return `${indicatorName}保持穩定，最新數值${latest.toFixed(2)}%，變化幅度在正常範圍內。當前趨勢${trend.direction === 'stable' ? '平穩' : '溫和'}，無需特別關注。`
  }

  private static async generateChatResponse(
    message: string,
    intent: ChatIntent,
    relevantData: Record<string, any>
  ): Promise<string> {
    const { type, indicators, timeframe } = intent
    
    // 根據意圖類型生成回答
    switch (type) {
      case 'indicator_query':
        return this.generateIndicatorQueryResponse(indicators, relevantData)
      
      case 'trend_analysis':
        return this.generateTrendAnalysisResponse(indicators, relevantData)
      
      case 'policy_prediction':
        return this.generatePolicyPredictionResponse(indicators, relevantData)
      
      case 'comparison':
        return this.generateComparisonResponse(indicators, relevantData)
      
      case 'explanation':
        return this.generateExplanationResponse(message, indicators, relevantData)
      
      default:
        return this.generateGeneralResponse(message, indicators)
    }
  }

  // === 回答生成方法 ===

  private static generateIndicatorQueryResponse(
    indicators: IndicatorId[],
    data: Record<string, any>
  ): string {
    if (indicators.length === 0) {
      return '請指定您想了解的經濟指標，例如：CPI、GDP、失業率或利率。我可以為您提供最新數據和分析。'
    }

    const responses = indicators.map(indicator => {
      const indicatorData = data[indicator]
      if (!indicatorData) return ''
      
      const latest = indicatorData.statistics?.latest || 0
      const change = indicatorData.statistics?.change || 0
      const names = { cpi: 'CPI', gdp: 'GDP', unemployment: '失業率', interest_rate: '利率' }
      
      return `${names[indicator]}最新數值為${latest.toFixed(2)}%，較前期${change > 0 ? '上升' : change < 0 ? '下降' : '持平'}${Math.abs(change).toFixed(2)}個百分點。`
    }).filter(Boolean)

    return responses.join(' ') || '抱歉，暫時無法獲取相關數據，請稍後再試。'
  }

  private static generateTrendAnalysisResponse(
    indicators: IndicatorId[],
    data: Record<string, any>
  ): string {
    const trendTexts = indicators.map(indicator => {
      const trendData = data[indicator]?.trend
      if (!trendData) return ''
      
      const names = { cpi: 'CPI', gdp: 'GDP', unemployment: '失業率', interest_rate: '利率' }
      const direction = trendData.direction === 'increasing' ? '上升' : 
                       trendData.direction === 'decreasing' ? '下降' : '平穩'
      
      return `${names[indicator]}呈現${direction}趨勢，強度為${(trendData.strength * 100).toFixed(1)}%。`
    }).filter(Boolean)

    return trendTexts.length > 0 
      ? `根據數據分析：${trendTexts.join(' ')}這些趨勢反映了當前經濟環境的變化，建議持續關注。`
      : '請指定您想分析趨勢的經濟指標，我將為您提供詳細的趨勢分析。'
  }

  private static generatePolicyPredictionResponse(
    indicators: IndicatorId[],
    data: Record<string, any>
  ): string {
    // 簡化的政策預測邏輯
    const cpiData = data.cpi
    const unemploymentData = data.unemployment
    
    if (cpiData && cpiData.statistics?.latest > 3.0) {
      return '基於當前通膨水準，央行可能考慮升息以控制物價上漲。預期下次貨幣政策會議將成為關鍵，建議關注官方政策聲明。'
    }
    
    if (unemploymentData && unemploymentData.statistics?.latest > 5.0) {
      return '失業率偏高，央行可能傾向於維持寬鬆政策以刺激就業。財政政策也可能配合推出就業相關措施。'
    }
    
    return '根據當前經濟指標，央行政策可能保持現狀，但仍需關注國際經濟情勢變化對政策方向的影響。'
  }

  private static generateComparisonResponse(
    indicators: IndicatorId[],
    data: Record<string, any>
  ): string {
    if (indicators.length < 2) {
      return '請指定至少兩個經濟指標進行比較，例如：「CPI 和 GDP 的關係」或「失業率與利率的比較」。'
    }

    // 簡化的比較分析
    return `${indicators.map(i => ({ cpi: 'CPI', gdp: 'GDP', unemployment: '失業率', interest_rate: '利率' }[i])).join('與')}之間存在重要的經濟關聯。一般而言，這些指標會相互影響，形成複雜的經濟動態。建議綜合觀察多項指標以獲得完整的經濟圖像。`
  }

  private static generateExplanationResponse(
    message: string,
    indicators: IndicatorId[],
    data: Record<string, any>
  ): string {
    // 根據問題關鍵字提供解釋
    if (message.includes('為什麼')) {
      return '經濟指標的變化通常受多重因素影響，包括供需關係、政策調整、國際環境變化、季節性因素等。具體原因需要結合當時的經濟環境進行分析。'
    }
    
    return '經濟現象往往具有複雜性，建議從多個角度進行分析。如果您有特定的疑問，請提供更詳細的描述，我將盡力為您解答。'
  }

  private static generateGeneralResponse(message: string, indicators: IndicatorId[]): string {
    return '感謝您的提問！我是經濟趨勢通的 AI 助手，可以協助您分析經濟數據、解讀趨勢變化、預測政策走向。請告訴我您想了解的具體經濟指標或問題，我將為您提供專業的分析和見解。'
  }

  // === 輔助方法 ===

  private static async getRelevantData(intent: ChatIntent): Promise<Record<string, any>> {
    const data: Record<string, any> = {}
    
    // 如果沒有指定指標，獲取主要指標數據
    const indicators = intent.indicators.length > 0 
      ? intent.indicators 
      : ['cpi', 'gdp', 'unemployment'] as IndicatorId[]

    for (const indicator of indicators) {
      try {
        const historicalData = await EconomicDataService.generateHistoricalData(indicator, 12)
        const statistics = EconomicDataService.calculateStatistics(historicalData)
        const trend = EconomicDataService.analyzeTrend(historicalData)
        
        data[indicator] = {
          historicalData,
          statistics,
          trend,
        }
      } catch (error) {
        // 忽略個別指標的錯誤
        console.error(`獲取 ${indicator} 數據失敗:`, error)
      }
    }

    return data
  }

  private static generateSuggestedActions(intent: ChatIntent): Array<{
    label: string
    action: string
    data?: any
  }> {
    const actions = []

    if (intent.indicators.length > 0) {
      actions.push({
        label: '查看詳細圖表',
        action: 'view_chart',
        data: { indicators: intent.indicators },
      })

      actions.push({
        label: '生成趨勢預測',
        action: 'generate_forecast',
        data: { indicators: intent.indicators },
      })
    }

    if (intent.type === 'policy_prediction') {
      actions.push({
        label: '查看政策分析',
        action: 'view_policy_analysis',
        data: {},
      })
    }

    return actions.slice(0, 3) // 最多返回 3 個建議
  }

  private static async getRelatedInsights(indicators: IndicatorId[]): Promise<AIInsight[]> {
    // 簡化版：返回最近的洞察
    // 實際應用中應該從數據庫查詢
    return []
  }

  private static calculateIntentConfidence(
    keywordMatches: number,
    indicatorCount: number,
    messageLength: number
  ): number {
    const keywordScore = Math.min(keywordMatches / 3, 1) * 0.4
    const indicatorScore = Math.min(indicatorCount / 2, 1) * 0.3
    const lengthScore = Math.min(messageLength / 50, 1) * 0.3
    
    return Math.round((keywordScore + indicatorScore + lengthScore) * 100) / 100
  }

  private static calculateContentConfidence(type: string, dataLength: number): number {
    const baseConfidence = {
      summary: 0.85,
      prediction: 0.70,
      analysis: 0.80,
      alert: 0.90,
    }[type] || 0.75

    const dataQualityFactor = Math.min(dataLength / 24, 1) * 0.1
    return Math.min(baseConfidence + dataQualityFactor, 0.95)
  }

  private static generateInsightTitle(type: string, indicator: IndicatorId): string {
    const indicatorNames = {
      cpi: '消費者物價指數',
      gdp: '國內生產毛額',
      unemployment: '失業率',
      interest_rate: '聯邦基金利率',
    }

    const typeTitles = {
      summary: '摘要分析',
      prediction: '預測分析',
      analysis: '深度分析',
      alert: '重要提醒',
    }

    return `${indicatorNames[indicator]}${typeTitles[type as keyof typeof typeTitles] || '分析'}`
  }

  private static generateInsightTags(
    type: string,
    indicator: IndicatorId,
    trend: any
  ): string[] {
    const tags = [type, indicator]
    
    if (trend.direction !== 'stable') {
      tags.push(trend.direction)
    }
    
    if (trend.strength > 0.7) {
      tags.push('強趨勢')
    }
    
    return tags
  }

  private static generateInsightId(): string {
    return `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private static generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private static generateRequestId(): string {
    return `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 智能 AI 回應生成 - 支援多模型備援
   */
  private static async generateIntelligentResponse(
    message: string,
    intent: ChatIntent,
    economicData: Record<string, any>,
    type: 'analysis' | 'forecast' = 'analysis',
    userLevel: UserLevel = 'intermediate'
  ): Promise<string> {
    const models = ['openai', 'gemini'] // 模型優先順序
    
    for (const model of models) {
      try {
        console.log(`嘗試使用 ${model.toUpperCase()} 模型...`)
        
        if (model === 'openai') {
          // 檢查 OpenAI API 金鑰是否可用
          if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'test_key_please_replace') {
            console.log('OpenAI API 金鑰未配置，跳過...')
            continue
          }
          
          if (type === 'forecast') {
            const historicalData: Record<string, EconomicDataPoint[]> = {}
            for (const indicator of intent.indicators) {
              if (economicData[indicator]?.historicalData) {
                historicalData[indicator] = economicData[indicator].historicalData
              }
            }
            return await OpenAIService.generateTrendForecast(intent.indicators, historicalData)
          } else {
            return await OpenAIService.generateEconomicAnalysis(message, intent, economicData)
          }
        } else if (model === 'gemini') {
          // 檢查 Gemini API 金鑰是否可用
          if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'test_key_please_replace') {
            console.log('Gemini API 金鑰未配置，跳過...')
            continue
          }
          
          if (type === 'forecast') {
            const historicalData: Record<string, EconomicDataPoint[]> = {}
            for (const indicator of intent.indicators) {
              if (economicData[indicator]?.historicalData) {
                historicalData[indicator] = economicData[indicator].historicalData
              }
            }
            return await GeminiService.generateTrendForecast(intent.indicators, historicalData)
          } else {
            return await GeminiService.generateEconomicAnalysis(message, intent, economicData)
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        console.error(`${model.toUpperCase()} 模型失敗:`, errorMsg)
        
        // 特殊處理 Gemini 限制錯誤
        if (model === 'gemini' && errorMsg.includes('GEMINI_RATE_LIMITED')) {
          console.log('Gemini API 達到請求限制，跳過並繼續使用其他模型...')
        }
        
        // 如果這是最後一個模型，拋出錯誤
        if (model === models[models.length - 1]) {
          throw error
        }
        
        // 否則繼續嘗試下一個模型
        console.log(`正在切換到下一個模型...`)
      }
    }
    
    // 如果所有模型都失敗，返回備用回應
    throw new Error('所有 AI 模型都無法回應')
  }

  /**
   * 生成備用回應（當所有 AI 服務失敗時使用）
   */
  private static generateFallbackResponse(intent: ChatIntent, economicData: Record<string, any>, userLevel: UserLevel = 'intermediate'): string {
    const userConfig = USER_LEVEL_CONFIGS[userLevel]
    
    // 根據用戶等級調整回應語調
    const greetingPrefix = userLevel === 'beginner' ? '您好！' : 
                          userLevel === 'advanced' ? '根據您的查詢，' : '關於您的問題，'
    
    // 根據意圖類型生成基本回應
    if (intent.type === 'trend_analysis') {
      const response = this.generateTrendAnalysisResponse(intent.indicators, economicData)
      return `${greetingPrefix}${response}`
    } else if (intent.type === 'policy_prediction') {
      const response = this.generatePolicyPredictionResponse(intent.indicators, economicData)
      return `${greetingPrefix}${response}`
    } else if (intent.type === 'comparison') {
      const response = this.generateComparisonResponse(intent.indicators, economicData)
      return `${greetingPrefix}${response}`
    } else if (intent.type === 'explanation') {
      const response = this.generateExplanationResponse('', intent.indicators, economicData)
      return `${greetingPrefix}${response}`
    } else if (intent.indicators.length > 0) {
      // 生成指標概要回應
      const indicatorNames = intent.indicators.map(id => this.getIndicatorName(id)).join('、')
      
      if (userLevel === 'beginner') {
        return `${greetingPrefix}您想了解 ${indicatorNames} 的相關資訊。這些都是很重要的經濟指標呢！我可以用簡單易懂的方式為您解釋它們的意義，或是告訴您最新的變化趨勢。請告訴我您想先了解哪一個？`
      } else if (userLevel === 'advanced') {
        return `${greetingPrefix}針對 ${indicatorNames} 的分析需求，我可以提供深度的數據解讀、趨勢分析、政策影響評估或跨指標相關性分析。請具體說明您需要哪種類型的專業分析？`
      } else {
        return `${greetingPrefix}您詢問了 ${indicatorNames} 的相關資訊。我可以為您分析這些指標的最新趨勢、歷史變化或提供詳細解釋。請告訴我您具體想了解什麼？`
      }
    } else {
      const generalResponse = this.generateGeneralResponse('', intent.indicators)
      return `${greetingPrefix}${generalResponse}`
    }
  }

  // ...existing code...
}
