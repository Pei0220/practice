"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Activity, RefreshCw, Users } from "lucide-react"
import { UserLevelSelector } from "@/components/user/user-level-selector"
import { useUser } from "@/hooks/use-user"

interface IndicatorData {
  id: string
  name: string
  value: string
  change: string
  trend: string
}

interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export default function APIDemo() {
  const [indicators, setIndicators] = useState<IndicatorData[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndicator, setSelectedIndicator] = useState<string>("")
  const [detailData, setDetailData] = useState<any>(null)
  const [forecast, setForecast] = useState<any>(null)
  const [insight, setInsight] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [showLevelSelector, setShowLevelSelector] = useState(false)
  const { userLevel, setUserLevel, isLevelSelected } = useUser()

  // 載入指標列表
  const loadIndicators = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/indicators')
      const result: APIResponse<IndicatorData[]> = await response.json()
      
      if (result.success && result.data) {
        setIndicators(result.data)
      }
    } catch (error) {
      console.error('載入指標失敗:', error)
      // 使用預設數據
      setIndicators([
        { id: 'cpi', name: '消費者物價指數', value: '3.2%', change: '+0.3%', trend: 'up' },
        { id: 'gdp', name: '國內生產毛額', value: '2.8%', change: '+0.1%', trend: 'up' },
        { id: 'unemployment', name: '失業率', value: '3.7%', change: '-0.2%', trend: 'down' },
      ])
    } finally {
      setLoading(false)
    }
  }

  // 載入指標詳細數據
  const loadIndicatorDetail = async (indicatorId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/indicators/${indicatorId}?periods=12&includeForecasts=true`)
      const result: APIResponse = await response.json()
      
      if (result.success) {
        setDetailData(result.data)
        setSelectedIndicator(indicatorId)
      }
    } catch (error) {
      console.error('載入詳細數據失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  // 生成預測
  const generateForecast = async (indicatorId: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          indicator: indicatorId,
          periods: 6,
          confidence: 0.8,
          userLevel
        })
      })
      
      const result: APIResponse = await response.json()
      
      if (result.success) {
        setForecast(result.data)
        setError(null)
      } else {
        setError(`預測失敗: ${result.error || '未知錯誤'}`)
      }
    } catch (error) {
      console.error('生成預測失敗:', error)
      setError(`網路錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`)
    } finally {
      setLoading(false)
    }
  }

  // 生成 AI 洞察
  const generateInsight = async (indicatorId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/insights?indicator=${indicatorId}&type=analysis&userLevel=${userLevel}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const result: APIResponse = await response.json()
      
      if (result.success) {
        setInsight(result.data)
        setError(null)
      } else {
        setError(`AI分析失敗: ${result.error || '未知錯誤'}`)
      }
    } catch (error) {
      console.error('生成洞察失敗:', error)
      setError(`網路錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`)
    } finally {
      setLoading(false)
    }
  }

  // 載入調試資訊
  const loadDebugInfo = async () => {
    try {
      const response = await fetch('/api/debug?action=env')
      const result = await response.json()
      if (result.success) {
        setDebugInfo(result.data)
      }
    } catch (error) {
      console.error('載入調試資訊失敗:', error)
    }
  }

  useEffect(() => {
    loadIndicators()
    // 載入調試資訊
    loadDebugInfo()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                經濟趨勢通 API 示範
              </h1>
              <p className="text-gray-600">
                展示後端 API 功能：指標查詢、趨勢預測、AI 洞察
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowLevelSelector(true)}
                className="flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>{isLevelSelected ? `${userLevel === 'beginner' ? '初級' : userLevel === 'intermediate' ? '中級' : '高級'}用戶` : '選擇等級'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-semibold mb-2">錯誤訊息</h3>
            <p className="text-red-700 text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => setError(null)}
            >
              關閉
            </Button>
          </div>
        )}

        {/* 調試資訊 */}
        {debugInfo && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-blue-800 font-semibold mb-2">系統狀態</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>Gemini API: {debugInfo.hasGeminiKey ? '✅ 已配置' : '❌ 未配置'}</p>
              <p>OpenAI API: {debugInfo.hasOpenAIKey ? '✅ 已配置' : '❌ 未配置'}</p>
              <p>環境: {debugInfo.nodeEnv}</p>
            </div>
          </div>
        )}

        {/* 指標總覽 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {indicators.map((indicator) => (
            <Card key={indicator.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <Badge className={indicator.trend === "up" ? "bg-red-50 text-red-700 border-red-200" : indicator.trend === "down" ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-700 border-gray-200"}>
                    {indicator.trend === "up" ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : indicator.trend === "down" ? (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    ) : (
                      <Activity className="h-3 w-3 mr-1" />
                    )}
                    {indicator.change}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{indicator.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2 mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    {indicator.value}
                  </span>
                </div>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => loadIndicatorDetail(indicator.id)}
                    disabled={loading}
                  >
                    {loading && selectedIndicator === indicator.id ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    查看詳細數據
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => generateForecast(indicator.id)}
                    disabled={loading}
                  >
                    生成趨勢預測
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => generateInsight(indicator.id)}
                    disabled={loading}
                  >
                    AI 智能分析
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 詳細數據展示 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 歷史數據和統計 */}
          {detailData && (
            <Card>
              <CardHeader>
                <CardTitle>詳細數據分析</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">基本資訊</h4>
                    <p><strong>指標名稱:</strong> {detailData.indicator?.name}</p>
                    <p><strong>數據來源:</strong> {detailData.indicator?.source}</p>
                    <p><strong>更新頻率:</strong> {detailData.indicator?.frequency}</p>
                  </div>
                  
                  {detailData.statistics && (
                    <div>
                      <h4 className="font-semibold mb-2">統計數據</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p>最新數值: {detailData.statistics.latest}%</p>
                        <p>變化: {detailData.statistics.change}%</p>
                        <p>平均值: {detailData.statistics.mean}%</p>
                        <p>標準差: {detailData.statistics.stdDev}%</p>
                        <p>最高值: {detailData.statistics.max}%</p>
                        <p>最低值: {detailData.statistics.min}%</p>
                      </div>
                    </div>
                  )}

                  {detailData.trend && (
                    <div>
                      <h4 className="font-semibold mb-2">趨勢分析</h4>
                      <p>
                        <strong>趨勢:</strong> 
                        {detailData.trend.trend === 'increasing' ? ' 上升' : 
                         detailData.trend.trend === 'decreasing' ? ' 下降' : ' 平穩'}
                      </p>
                      <p><strong>強度:</strong> {(detailData.trend.strength * 100).toFixed(1)}%</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 預測結果 */}
          {forecast && (
            <Card>
              <CardHeader>
                <CardTitle>趨勢預測</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">預測數據</h4>
                    <div className="space-y-2">
                      {forecast.forecasts?.slice(0, 3).map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.date}</span>
                          <span>
                            {item.value}% 
                            <span className="text-gray-500 ml-2">
                              ({item.confidence.lower}% ~ {item.confidence.upper}%)
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {forecast.aiInsight && (
                    <div>
                      <h4 className="font-semibold mb-2">AI 預測分析</h4>
                      <p className="text-sm text-gray-700">
                        {forecast.aiInsight.content}
                      </p>
                      <div className="mt-2 text-xs text-gray-500">
                        信心度: {(forecast.aiInsight.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI 洞察 */}
          {insight && (
            <Card>
              <CardHeader>
                <CardTitle>AI 智能洞察</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">{insight.title}</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {insight.content}
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>類型: {insight.type}</span>
                    <span>信心度: {(insight.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* API 狀態指示器 */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">API 狀態</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm">指標查詢 API</p>
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm">趨勢預測 API</p>
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm">AI 洞察 API</p>
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm">聊天 API</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Level Selector Modal */}
      {showLevelSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl mx-4 p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">設定您的用戶等級</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowLevelSelector(false)}
              >
                ✕
              </Button>
            </div>
            <UserLevelSelector 
              selectedLevel={userLevel}
              onLevelChange={(level) => {
                setUserLevel(level)
                setShowLevelSelector(false)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
