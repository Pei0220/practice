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
        "企業投資狀況",
        "政府支出政策",
        "淨出口表現"
      ]
    },
    unemployment: {
      id: 'unemployment',
      name: "失業率",
      description: "反映勞動市場健康程度的重要指標",
      unit: "%",
      category: "就業指標",
      impact: "低失業率通常伴隨經濟擴張，但也可能推升通膨壓力",
      currentValue: "3.8",
      change: "-0.2",
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
      currentValue: "5.25",
      change: "0.00",
      trend: "stable" as const,
      lastUpdated: "2024-12-01",
      factors: [
        "通膨目標政策",
        "經濟成長預期",
        "國際資金流動",
        "匯率穩定考量"
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

  // 如果有錯誤
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/macro">
            <Button>返回總體經濟頁面</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 如果沒有數據
  if (!indicatorData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">找不到指標數據</p>
          <Link href="/macro">
            <Button>返回總體經濟頁面</Button>
          </Link>
        </div>
      </div>
    );
  }

  const indicator = indicatorData;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/macro">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{indicator.name}</h1>
              <p className="text-gray-600 mt-1">{indicator.description}</p>
            </div>
          </div>
          <Badge className="text-sm px-3 py-1">{indicator.category}</Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">當前數值</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{indicator.currentValue}</span>
                <span className="text-sm text-gray-500">{indicator.unit}</span>
                {indicator.trend === 'up' && <TrendingUp className="h-5 w-5 text-green-500" />}
                {indicator.trend === 'down' && <TrendingDown className="h-5 w-5 text-red-500" />}
              </div>
              {indicator.change && (
                <p className={`text-sm mt-1 ${
                  indicator.change.startsWith('+') ? 'text-green-600' : 
                  indicator.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {indicator.change}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">更新時間</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{indicator.lastUpdated}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">影響程度</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-orange-500" />
                <span className="text-sm">高</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>歷史趨勢</CardTitle>
              <CardDescription>過去 12 個月的數據變化</CardDescription>
            </CardHeader>
            <CardContent>
              <EconomicChart 
                indicatorId={indicator.id}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>未來預測</CardTitle>
              <CardDescription>基於 AI 模型的未來 6 個月預測</CardDescription>
            </CardHeader>
            <CardContent>
              <ForecastChart 
                indicatorId={indicator.id}
              />
            </CardContent>
          </Card>
        </div>

        {/* Impact Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>經濟影響分析</CardTitle>
            <CardDescription>此指標對整體經濟的影響評估</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{indicator.impact}</p>
            
            <h4 className="font-semibold mb-3">主要影響因素</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {indicator.factors?.map((factor: string, index: number) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">{factor}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
