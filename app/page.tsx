"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Activity, DollarSign, Users, BarChart3, MessageSquare, AlertCircle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { EconomicChart } from "@/components/economic-chart"
import { AIInsightCard } from "@/components/ai-insight-card"
import { QuickStats } from "@/components/quick-stats"
import { UserLevelSelector } from "@/components/user/user-level-selector"
import { useUser } from "@/hooks/use-user"
import { useApp } from "@/lib/app-context"
import { APIResponse, EconomicIndicator } from "@/lib/shared/types"

interface IndicatorCardData extends EconomicIndicator {
  value?: string
  change?: string
  trend?: "up" | "down" | "stable"
  color?: string
  bgColor?: string
  icon?: any
}

export default function HomePage() {
  const [indicators, setIndicators] = useState<IndicatorCardData[]>([])
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showLevelSelector, setShowLevelSelector] = useState(false)
  const { userLevel, setUserLevel, isLevelSelected } = useUser()
  const { t, language } = useApp()

  useEffect(() => {
    fetchHomePageData()
  }, [userLevel])

  useEffect(() => {
    // 如果用戶還沒選擇等級，顯示選擇器
    if (!isLevelSelected) {
      setShowLevelSelector(true)
    }
  }, [isLevelSelected])

  const fetchHomePageData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 獲取指標列表
      const indicatorsResponse = await fetch('/api/indicators')
      const indicatorsResult: APIResponse<EconomicIndicator[]> = await indicatorsResponse.json()

      if (!indicatorsResult.success || !indicatorsResult.data) {
        throw new Error('獲取指標數據失敗')
      }

      // 為主要指標添加額外的顯示屬性
      const enhancedIndicators = indicatorsResult.data.slice(0, 3).map((indicator) => ({
        ...indicator,
        value: getDefaultValue(indicator.id),
        change: getDefaultChange(indicator.id),
        trend: getDefaultTrend(indicator.id),
        color: getIndicatorColor(indicator.id),
        bgColor: getIndicatorBgColor(indicator.id),
        icon: getIndicatorIcon(indicator.id)
      }))

      setIndicators(enhancedIndicators)

      // 獲取 AI 洞察 (模擬多個洞察)
      const insightPromises = enhancedIndicators.map(async (indicator) => {
        try {
          const response = await fetch(`/api/insights?indicator=${indicator.id}&type=summary&userLevel=${userLevel}`)
          const result = await response.json()
          return result.success ? result.data : getDefaultInsight(indicator.id)
        } catch {
          return getDefaultInsight(indicator.id)
        }
      })

      const resolvedInsights = await Promise.all(insightPromises)
      setInsights(resolvedInsights)

    } catch (err) {
      console.error('首頁數據載入失敗:', err)
      setError(err instanceof Error ? err.message : '數據載入失敗')
      // 設置預設數據
      setIndicators(getDefaultIndicators())
      setInsights(getDefaultInsights())
    } finally {
      setLoading(false)
    }
  }

  const getDefaultValue = (id: string) => {
    const values: Record<string, string> = {
      cpi: "3.2%",
      gdp: "2.8%",
      unemployment: "3.7%",
      interest_rate: "5.25%"
    }
    return values[id] || "N/A"
  }

  const getDefaultChange = (id: string) => {
    const changes: Record<string, string> = {
      cpi: "+0.3%",
      gdp: "+0.1%",
      unemployment: "-0.2%",
      interest_rate: "0.0%"
    }
    return changes[id] || "0.0%"
  }

  const getDefaultTrend = (id: string): "up" | "down" | "stable" => {
    const trends: Record<string, "up" | "down" | "stable"> = {
      cpi: "up",
      gdp: "up",
      unemployment: "down",
      interest_rate: "stable"
    }
    return trends[id] || "stable"
  }

  const getIndicatorColor = (id: string) => {
    const colors: Record<string, string> = {
      cpi: "text-red-600",
      gdp: "text-green-600",
      unemployment: "text-blue-600",
      interest_rate: "text-orange-600"
    }
    return colors[id] || "text-gray-600"
  }

  const getIndicatorBgColor = (id: string) => {
    const bgColors: Record<string, string> = {
      cpi: "bg-red-50",
      gdp: "bg-green-50",
      unemployment: "bg-blue-50",
      interest_rate: "bg-orange-50"
    }
    return bgColors[id] || "bg-gray-50"
  }

  const getIndicatorIcon = (id: string) => {
    const icons: Record<string, any> = {
      cpi: DollarSign,
      gdp: BarChart3,
      unemployment: Users,
      interest_rate: Activity
    }
    return icons[id] || Activity
  }

  const getDefaultInsight = (indicatorId: string) => {
    const insights: Record<string, any> = {
      cpi: {
        title: "通膨壓力持續",
        content: "消費者物價指數持續上升，主要受能源與食品價格推動。央行可能考慮進一步緊縮政策。",
        type: "alert"
      },
      gdp: {
        title: "經濟成長穩健",
        content: "GDP 成長率維持在健康水準，消費和投資動能良好，經濟基本面穩固。",
        type: "summary"
      },
      unemployment: {
        title: "就業市場改善",
        content: "失業率下降顯示勞動市場持續復甦，新增就業機會增加，薪資成長壓力上升。",
        type: "prediction"
      }
    }
    return insights[indicatorId] || {
      title: "數據分析",
      content: "正在分析最新的經濟數據變化...",
      type: "summary"
    }
  }

  const getDefaultIndicators = (): IndicatorCardData[] => [
    {
      id: "cpi" as any,
      name: "消費者物價指數 (CPI)",
      nameEn: "Consumer Price Index",
      unit: "%",
      frequency: "monthly" as any,
      source: "行政院主計總處",
      description: "年增率",
      category: "通膨指標",
      isActive: true,
      value: "3.2%",
      change: "+0.3%",
      trend: "up",
      color: "text-red-600",
      bgColor: "bg-red-50",
      icon: DollarSign,
    },
    {
      id: "gdp" as any,
      name: "國內生產毛額 (GDP)",
      nameEn: "Gross Domestic Product",
      unit: "%",
      frequency: "quarterly" as any,
      source: "行政院主計總處",
      description: "年增率",
      category: "成長指標",
      isActive: true,
      value: "2.8%",
      change: "+0.1%",
      trend: "up",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: BarChart3,
    },
    {
      id: "unemployment" as any,
      name: "失業率",
      nameEn: "Unemployment Rate",
      unit: "%",
      frequency: "monthly" as any,
      source: "行政院主計總處",
      description: "季調後",
      category: "就業指標",
      isActive: true,
      value: "3.7%",
      change: "-0.2%",
      trend: "down",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: Users,
    }
  ]

  const getDefaultInsights = () => [
    {
      title: "本月經濟摘要",
      content: "本月 CPI 年增率上升至 3.2%，主要受能源與食品價格上漲影響。GDP 成長率維持在 2.8%，顯示經濟基本面穩健。失業率下降至 3.7%，勞動市場持續改善。",
      type: "summary"
    },
    {
      title: "央行政策預測",
      content: "基於當前通膨壓力與經濟成長動能，預期央行可能在下次會議考慮升息 0.25 個百分點。建議密切關注下週公布的核心 CPI 數據。",
      type: "prediction"
    },
    {
      title: "市場風險提醒",
      content: "國際油價波動加劇，可能影響國內通膨預期。建議投資人留意能源板塊投資風險，並關注央行貨幣政策動向。",
      type: "alert"
    }
  ]
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Activity className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">經濟趨勢通</h1>
                  <p className="text-sm text-gray-500">EconoTrends Insight</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-lg text-gray-600">載入經濟數據中...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Activity className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">經濟趨勢通</h1>
                  <p className="text-sm text-gray-500">EconoTrends Insight</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900">數據載入失敗</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                  <Button 
                    onClick={fetchHomePageData} 
                    className="mt-3 bg-red-600 hover:bg-red-700"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    重新載入
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-foreground">{t('home.title')}</h1>
                <p className="text-sm text-muted-foreground">{language === 'zh-TW' ? 'EconoTrends Insight' : '經濟趨勢通'}</p>
              </div>
            </div>
            <nav className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowLevelSelector(true)}
                className="flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>{isLevelSelected ? `${userLevel === 'beginner' ? '初級' : userLevel === 'intermediate' ? '中級' : '高級'}用戶` : '選擇等級'}</span>
              </Button>
              <Button 
                onClick={fetchHomePageData} 
                variant="outline" 
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                重新整理
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {language === 'zh-TW' ? '即時經濟數據洞察' : 'Real-time Economic Data Insights'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('home.description')}
          </p>
        </section>

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

        {/* Quick Stats */}
        <QuickStats />

        {/* Economic Indicators */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-foreground">{t('home.mainIndicators')}</h3>
            <Badge className="text-green-700 bg-green-50 border-green-200">
              即時更新
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {indicators.map((indicator, index) => {
              const IconComponent = indicator.icon || Activity
              return (
                <Card key={indicator.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg ${indicator.bgColor}`}>
                        <IconComponent className={`h-6 w-6 ${indicator.color}`} />
                      </div>
                      <div className="flex items-center space-x-1">
                        {indicator.trend === "up" && <TrendingUp className={`h-4 w-4 ${indicator.color}`} />}
                        {indicator.trend === "down" && <TrendingDown className={`h-4 w-4 ${indicator.color}`} />}
                        {indicator.trend === "stable" && <Activity className={`h-4 w-4 ${indicator.color}`} />}
                        <span className={`text-sm font-medium ${indicator.color}`}>
                          {indicator.change}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{indicator.name}</CardTitle>
                    <CardDescription>{indicator.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className={`text-3xl font-bold ${indicator.color}`}>
                          {indicator.value}
                        </div>
                      </div>
                      
                      {/* Economic Chart */}
                      <div className="h-24">
                        <EconomicChart 
                          indicatorId={indicator.id} 
                          height={96}
                          showForecast={false}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-sm text-gray-500">
                          來源：{indicator.source}
                        </span>
                        <Link href={`/indicator/${indicator.id}`}>
                          <Button variant="outline" size="sm">
                            查看詳細分析
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* AI Insights */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">AI 經濟洞察</h3>
            <Badge className="text-blue-700 bg-blue-50 border-blue-200">
              AI 生成
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {insights.slice(0, 3).map((insight, index) => (
              <AIInsightCard
                key={`insight-${index}`}
                title={insight.title}
                content={insight.content}
                type={insight.type as "summary" | "prediction" | "alert"}
              />
            ))}
          </div>
        </section>

        {/* Trend Forecast Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">經濟趨勢預測</h3>
            <Badge className="text-green-700 bg-green-50 border-green-200">
              智能預測
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {indicators.slice(0, 2).map((indicator) => (
              <Card key={`forecast-${indicator.id}`} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{indicator.name} 預測</span>
                    <Badge className="text-green-700 bg-green-50 border-green-200">6個月預測</Badge>
                  </CardTitle>
                  <CardDescription>
                    基於歷史數據的趨勢預測分析
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 mb-4">
                    <EconomicChart 
                      indicatorId={indicator.id} 
                      height={256}
                      showForecast={true}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      預測方法：ARIMA 模型
                    </div>
                    <Link href={`/indicator/${indicator.id}`}>
                      <Button variant="outline" size="sm">
                        查看完整預測
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Action Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-900">
                <TrendingUp className="h-5 w-5" />
                <span>市場數據</span>
              </CardTitle>
              <CardDescription className="text-blue-700">
                查看市場總覽、情緒分析和行業表現
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/market">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  市場總覽
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-900">
                <DollarSign className="h-5 w-5" />
                <span>股票查詢</span>
              </CardTitle>
              <CardDescription className="text-purple-700">
                搜尋全球股票即時價格與詳細資訊
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/stock">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  查詢股票
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-900">
                <BarChart3 className="h-5 w-5" />
                <span>總經分析</span>
              </CardTitle>
              <CardDescription className="text-green-700">
                經濟指標詳情與未來趨勢預測
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/macro">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  查看分析
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-900">
                <MessageSquare className="h-5 w-5" />
                <span>AI 智能問答</span>
              </CardTitle>
              <CardDescription className="text-orange-700">
                向 AI 助手詢問任何經濟相關問題
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/chat">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  開始對話
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
