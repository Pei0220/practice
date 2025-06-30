'use client';

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Target, AlertTriangle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { EconomicChart } from "@/components/economic-chart"
import { ForecastChart } from "@/components/forecast-chart"

interface IndicatorPageProps {
  params: {
    id: string
  }
}

// 指標基本資訊
const getIndicatorInfo = (id: string) => {
  const indicators: Record<string, any> = {
    cpi: {
      id: 'cpi',
      name: "消費者物價指數 (CPI)",
      description: "衡量一般消費者購買商品和服務價格變化的指標",
      unit: "%",
      category: "通膨指標",
      impact: "高通膨可能促使央行升息，影響借貸成本和投資決策",
      currentValue: "3.2",
      change: "+0.1",
      trend: "up" as const,
      lastUpdated: "2024-12-01",
      factors: [
        "能源價格波動影響",
        "食品價格季節性變化", 
        "住房成本持續上升",
        "交通運輸費用變動"
      ]
    },
    gdp: {
      id: 'gdp',
      name: "國內生產毛額 (GDP)",
      description: "衡量國家經濟總產出的重要指標",
      unit: "%",
      category: "成長指標",
      impact: "穩定的 GDP 成長有利於就業市場和企業獲利",
      currentValue: "2.8",
      change: "+0.3",
      trend: "up" as const,
      lastUpdated: "2024-12-01",
      factors: [
        "消費支出變化",
        "政府投資政策",
        "出口貿易表現",
        "企業投資意願"
      ]
    },
    unemployment: {
      id: 'unemployment',
      name: "失業率",
      description: "勞動市場健康狀況的重要指標",
      unit: "%",
      category: "就業指標",
      impact: "失業率變化直接影響消費能力和社會穩定",
      currentValue: "3.7",
      change: "-0.1",
      trend: "down" as const,
      lastUpdated: "2024-12-01",
      factors: [
        "產業結構轉型",
        "季節性就業變化",
        "經濟景氣循環",
        "政府就業政策"
      ]
    },
    interest_rate: {
      id: 'interest_rate',
      name: "利率",
      description: "中央銀行貨幣政策的重要工具",
      unit: "%",
      category: "貨幣政策",
      impact: "利率變動直接影響借貸成本、投資決策和經濟活動",
      currentValue: "1.75",
      change: "+0.25",
      trend: "up" as const,
      lastUpdated: "2024-12-01",
      factors: [
        "通膨壓力變化",
        "經濟成長速度",
        "國際資金流動",
        "金融穩定考量"
      ]
    }
  }

  return indicators[id] || indicators.cpi // 預設返回 CPI
}

export default function IndicatorPage({ params }: IndicatorPageProps) {
  const [indicatorData, setIndicatorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIndicatorData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 嘗試從 API 獲取指標詳情
        try {
          const response = await fetch(`/api/indicators/${params.id}`);
          const result = await response.json();
          
          if (result.success && result.data) {
            setIndicatorData(result.data);
          } else {
            throw new Error('API 數據不可用');
          }
        } catch (apiError) {
          // 如果 API 失敗，使用預設數據
          const defaultData = getIndicatorInfo(params.id);
          if (defaultData) {
            setIndicatorData(defaultData);
          } else {
            throw new Error('指標不存在');
          }
        }
      } catch (err) {
        console.error('載入指標詳情失敗:', err);
        setError(err instanceof Error ? err.message : '載入失敗');
      } finally {
        setLoading(false);
      }
    };

    fetchIndicatorData();
  }, [params.id]);

  // 如果載入中
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-4" />
          <p>載入指標詳情中...</p>
        </div>
      </div>
    );
  }

  // 如果有錯誤且沒有數據
  if (error && !indicatorData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">找不到指標</h1>
          <p className="text-gray-600 mb-4">指標 ID "{params.id}" 不存在</p>
          <Link href="/">
            <Button>返回首頁</Button>
          </Link>
        </div>
      </div>
    );
  }

  const indicator = indicatorData;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Target className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

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
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{indicator.name}</h1>
              <p className="text-sm text-gray-500">{indicator.description}</p>
            </div>
            <Badge className="bg-blue-100 text-blue-800">{indicator.category}</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">⚠️ API 數據暫時不可用，顯示預設數據</p>
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Value */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">當前數值</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {indicator.currentValue}{indicator.unit}
                  </div>
                  <div className={`flex items-center mt-1 px-2 py-1 rounded-full text-sm ${getTrendColor(indicator.trend)}`}>
                    {getTrendIcon(indicator.trend)}
                    <span className="ml-1">{indicator.change}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Last Updated */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                最後更新
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-700">
                {new Date(indicator.lastUpdated).toLocaleDateString('zh-TW')}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                數據來源：政府統計部門
              </p>
            </CardContent>
          </Card>

          {/* Importance */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Target className="h-5 w-5 mr-2" />
                重要程度
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">高</div>
              <p className="text-sm text-gray-500 mt-1">
                市場高度關注的核心指標
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Historical Chart */}
          <Card>
            <CardHeader>
              <CardTitle>歷史趨勢</CardTitle>
              <CardDescription>過去12個月的數據變化</CardDescription>
            </CardHeader>
            <CardContent>
              <EconomicChart 
                indicatorId={indicator.id}
              />
            </CardContent>
          </Card>

          {/* Forecast Chart */}
          <Card>
            <CardHeader>
              <CardTitle>預測分析</CardTitle>
              <CardDescription>未來3個月預測趨勢</CardDescription>
            </CardHeader>
            <CardContent>
              <ForecastChart 
                indicatorId={indicator.id}
              />
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ 預測結果僅供參考，實際數值可能因多種因素而有所不同
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Key Factors */}
          <Card>
            <CardHeader>
              <CardTitle>主要影響因素</CardTitle>
              <CardDescription>影響此指標變動的關鍵因素</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {indicator.factors.map((factor: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{factor}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Economic Impact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                經濟影響評估
              </CardTitle>
              <CardDescription>此指標對整體經濟的影響分析</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-4">
                {indicator.impact}
              </p>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">💡 專家建議</h4>
                <p className="text-blue-800 text-sm">
                  建議持續關注此指標的變化趨勢，結合其他經濟指標進行綜合分析。
                  如需深入討論，可使用 AI 問答功能獲取更多洞察。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <Link href="/chat">
            <Button size="lg">
              💬 詢問 AI 更多問題
            </Button>
          </Link>
          <Button variant="outline" size="lg">
            📊 下載數據報告
          </Button>
          <Button variant="outline" size="lg">
            🔔 設定提醒通知
          </Button>
          <Link href="/">
            <Button variant="secondary" size="lg">
              🏠 返回首頁
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
