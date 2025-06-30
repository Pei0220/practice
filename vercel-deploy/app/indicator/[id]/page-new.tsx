import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Target, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { EconomicChart } from "@/components/economic-chart"
import { ForecastChart } from "@/components/forecast-chart"

interface IndicatorPageProps {
  params: {
    id: string
  }
}

// 暫時的指標資料，之後會從 API 獲取
const getIndicatorInfo = (id: string) => {
  const indicators: Record<string, any> = {
    cpi: {
      name: "消費者物價指數 (CPI)",
      description: "衡量一般消費者購買商品和服務價格變化的指標",
      unit: "%",
      category: "通膨指標",
      impact: "高通膨可能促使央行升息，影響借貸成本和投資決策"
    },
    gdp: {
      name: "國內生產毛額 (GDP)",
      description: "衡量國家經濟總產出的重要指標",
      unit: "%",
      category: "成長指標",
      impact: "穩定的 GDP 成長有利於就業市場和企業獲利"
    },
    unemployment: {
      name: "失業率",
      description: "反映勞動市場健康狀況的關鍵指標",
      unit: "%",
      category: "就業指標",
      impact: "低失業率可能推升薪資成長，進而影響通膨預期"
    }
  }
  
  return indicators[id] || null
}

export default function IndicatorPage({ params }: IndicatorPageProps) {
  const indicator = getIndicatorInfo(params.id)

  if (!indicator) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Link href="/">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回首頁
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">指標不存在</h1>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-red-600 mb-4">
                <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
                <h2 className="text-lg font-semibold">找不到指定的指標</h2>
              </div>
              <p className="text-gray-600 mb-4">指標 ID "{params.id}" 不存在</p>
              <Link href="/">
                <Button>返回首頁</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回首頁
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">{indicator.name}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Value Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{indicator.name}</CardTitle>
                <CardDescription className="mt-2">{indicator.description}</CardDescription>
              </div>
              <Badge className="bg-gray-50 text-gray-700 border-gray-200 text-lg px-4 py-2">
                {indicator.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900 mb-4">
              載入中...
            </div>
            <p className="text-gray-600">指標數據由 API 動態載入中</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Historical Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                歷史趨勢 (過去 24 個月)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <EconomicChart 
                  indicatorId={params.id} 
                  height={320} 
                  showForecast={false}
                />
              </div>
            </CardContent>
          </Card>

          {/* Forecast Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                未來預測 (未來 6 個月)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ForecastChart indicatorId={params.id} />
              </div>
              <p className="text-sm text-gray-600 mt-4">
                預測基於歷史數據趨勢分析，實際結果可能有所不同
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Key Features */}
          <Card>
            <CardHeader>
              <CardTitle>指標特點</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">數據來源：官方統計機構</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">更新頻率：每月發布</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">季節性調整：已調整</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">國際可比較性：高</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Economic Impact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                經濟影響分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-4">
                {indicator.impact}
              </p>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">AI 建議</h4>
                <p className="text-blue-800 text-sm">
                  基於當前數據趨勢，建議持續關注相關政策動向和市場反應。
                  如需更詳細的分析，可使用 AI 問答功能進行深入討論。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/chat">
            <Button>詢問 AI 更多問題</Button>
          </Link>
          <Button variant="outline">下載數據報告</Button>
          <Button variant="outline">設定提醒通知</Button>
        </div>
      </main>
    </div>
  )
}
