import { EconomicDataPoint, ForecastDataPoint, AIInsight } from './types'
import { getIndicatorInfo, calculateStatistics, analyzeTrend } from './economic-data'

// AI 提示模板
const ANALYSIS_PROMPTS = {
  summary: `請根據以下經濟數據生成一段簡潔的中文摘要分析：

指標: {indicator}
最新數值: {latest}
變化: {change}
趨勢: {trend}
時間範圍: {timeRange}

請用平易近人的語言解釋這個數據的意義，包括：
1. 當前狀況
2. 變化原因的可能解釋
3. 對一般民眾的影響
4. 未來可能的發展

限制在150字以內。`,

  prediction: `基於以下經濟數據和預測，生成政策預測分析：

指標: {indicator}
歷史趨勢: {trend}
預測數值: {forecast}
統計數據: {statistics}

請分析：
1. 央行可能的政策反應
2. 對其他經濟指標的影響
3. 投資建議
4. 風險提醒

用專業但易懂的語言，限制在200字以內。`,

  question: `使用者問題: {question}

相關經濟數據:
{data}

請根據實際數據回答使用者的問題，要求：
1. 直接回答問題
2. 用數據支持論點
3. 解釋相關經濟概念
4. 提供實用建議

用友善、專業的語調回答，限制在250字以內。`
}

// 模擬 OpenAI API 回應（實際專案中需要真實的 API 密鑰）
async function callOpenAI(prompt: string): Promise<string> {
  // 這裡是模擬回應，實際專案中應該呼叫真實的 OpenAI API
  
  // 根據提示內容生成對應的模擬回應
  if (prompt.includes('CPI') || prompt.includes('消費者物價指數')) {
    return "本月 CPI 年增率上升至 3.2%，主要受能源與食品價格上漲影響。這反映了通膨壓力持續存在，可能影響消費者購買力。若此趨勢持續，央行可能考慮調整貨幣政策以抑制通膨。建議民眾留意日常支出變化，並考慮適當的理財規劃。"
  } else if (prompt.includes('GDP') || prompt.includes('國內生產毛額')) {
    return "GDP 成長率維持在 2.8%，顯示經濟基本面穩健。這個成長速度反映了內需消費和投資活動的平衡發展。預期未來幾季將維持類似成長軌道，但需關注全球經濟變化對出口的影響。對投資人而言，穩定的成長環境有利於長期投資策略。"
  } else if (prompt.includes('失業率') || prompt.includes('unemployment')) {
    return "失業率下降至 3.7%，顯示勞動市場持續改善。這反映了企業用人需求增加，經濟活動趨於活絡。低失業率通常伴隨薪資上漲壓力，可能推升消費支出。建議求職者把握當前就業環境良好的機會，提升技能競爭力。"
  } else if (prompt.includes('目前物價') || prompt.includes('升息')) {
    return "目前物價呈現溫和上漲趨勢，CPI 年增率為 3.2%，略高於央行目標。考慮到通膨壓力和經濟成長狀況，央行確實有升息可能性。升息將提高借貸成本，可能抑制消費和投資，但有助於控制通膨。建議關注央行政策會議訊息。"
  } else {
    return "根據當前經濟數據分析，各項指標顯示經濟運行總體平穩。建議持續關注主要經濟指標變化，並根據個人情況調整財務規劃。如需更具體的分析，請提供更詳細的問題描述。"
  }
}

// 生成 AI 摘要
export async function generateSummary(
  data: EconomicDataPoint[],
  indicatorId: string
): Promise<AIInsight> {
  const indicator = getIndicatorInfo(indicatorId)
  const stats = calculateStatistics(data)
  const trend = analyzeTrend(data)

  if (!indicator || !stats) {
    throw new Error('無法生成摘要：數據不足')
  }

  const prompt = ANALYSIS_PROMPTS.summary
    .replace('{indicator}', indicator.name)
    .replace('{latest}', `${stats.latest}${indicator.unit}`)
    .replace('{change}', `${stats.change > 0 ? '+' : ''}${stats.change}`)
    .replace('{trend}', trend.trend === 'increasing' ? '上升' : trend.trend === 'decreasing' ? '下降' : '平穩')
    .replace('{timeRange}', `過去${data.length}期數據`)

  const content = await callOpenAI(prompt)

  return {
    id: `summary_${indicatorId}_${Date.now()}`,
    title: `${indicator.name}摘要分析`,
    content,
    type: 'summary',
    indicator: indicatorId,
    timestamp: new Date(),
    confidence: 0.85
  }
}

// 生成預測分析
export async function generatePrediction(
  historicalData: EconomicDataPoint[],
  forecasts: ForecastDataPoint[],
  indicatorId: string
): Promise<AIInsight> {
  const indicator = getIndicatorInfo(indicatorId)
  const stats = calculateStatistics(historicalData)
  const trend = analyzeTrend(historicalData)

  if (!indicator || !stats || forecasts.length === 0) {
    throw new Error('無法生成預測：數據不足')
  }

  const forecastSummary = forecasts.map(f => 
    `${f.date}: ${f.value}% (${f.confidence.lower}%-${f.confidence.upper}%)`
  ).join(', ')

  const prompt = ANALYSIS_PROMPTS.prediction
    .replace('{indicator}', indicator.name)
    .replace('{trend}', trend.trend === 'increasing' ? '上升趨勢' : trend.trend === 'decreasing' ? '下降趨勢' : '平穩趨勢')
    .replace('{forecast}', forecastSummary)
    .replace('{statistics}', `平均值: ${stats.mean}, 標準差: ${stats.stdDev}`)

  const content = await callOpenAI(prompt)

  return {
    id: `prediction_${indicatorId}_${Date.now()}`,
    title: `${indicator.name}政策預測`,
    content,
    type: 'prediction',
    indicator: indicatorId,
    timestamp: new Date(),
    confidence: 0.75
  }
}

// 回答使用者問題
export async function answerQuestion(
  question: string,
  relevantData?: { [key: string]: EconomicDataPoint[] }
): Promise<string> {
  let dataContext = ''
  
  if (relevantData) {
    dataContext = Object.entries(relevantData)
      .map(([indicator, data]) => {
        const info = getIndicatorInfo(indicator)
        const latest = data[data.length - 1]
        return `${info?.name}: ${latest?.value}${info?.unit}`
      })
      .join('\n')
  }

  const prompt = ANALYSIS_PROMPTS.question
    .replace('{question}', question)
    .replace('{data}', dataContext || '暫無相關數據')

  return await callOpenAI(prompt)
}

// 意圖識別
export function identifyIntent(question: string): {
  intent: 'indicator_query' | 'trend_analysis' | 'policy_prediction' | 'general_explanation' | 'comparison'
  indicators: string[]
  confidence: number
} {
  const lowercaseQ = question.toLowerCase()
  const indicators: string[] = []
  
  // 檢測提到的指標
  if (lowercaseQ.includes('物價') || lowercaseQ.includes('cpi') || lowercaseQ.includes('通膨')) {
    indicators.push('cpi')
  }
  if (lowercaseQ.includes('gdp') || lowercaseQ.includes('經濟成長') || lowercaseQ.includes('生產毛額')) {
    indicators.push('gdp')
  }
  if (lowercaseQ.includes('失業') || lowercaseQ.includes('就業')) {
    indicators.push('unemployment')
  }
  if (lowercaseQ.includes('利率') || lowercaseQ.includes('升息') || lowercaseQ.includes('降息')) {
    indicators.push('interest_rate')
  }

  // 識別意圖
  let intent: 'indicator_query' | 'trend_analysis' | 'policy_prediction' | 'general_explanation' | 'comparison' = 'general_explanation'
  let confidence = 0.6

  if (lowercaseQ.includes('怎麼樣') || lowercaseQ.includes('如何') || lowercaseQ.includes('目前')) {
    intent = 'indicator_query'
    confidence = 0.8
  } else if (lowercaseQ.includes('趨勢') || lowercaseQ.includes('變化') || lowercaseQ.includes('走勢')) {
    intent = 'trend_analysis'
    confidence = 0.8
  } else if (lowercaseQ.includes('央行') || lowercaseQ.includes('升息') || lowercaseQ.includes('政策')) {
    intent = 'policy_prediction'
    confidence = 0.9
  } else if (lowercaseQ.includes('比較') || lowercaseQ.includes('差別') || lowercaseQ.includes('關係')) {
    intent = 'comparison'
    confidence = 0.7
  }

  return { intent, indicators, confidence }
}
