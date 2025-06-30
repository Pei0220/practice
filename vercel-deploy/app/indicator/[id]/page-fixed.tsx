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
        "能源價格波動",
        "食品成本變化",
        "服務價格調整",
        "住房相關費用"
      ]
    },
    gdp: {
      id: 'gdp',
      name: "國內生產毛額 (GDP)",
      description: "衡量一國經濟活動總量的綜合指標",
      unit: "%",
      category: "經濟增長",
      impact: "GDP 成長率直接反映經濟健康狀況，影響投資信心",
      currentValue: "2.8",
      change: "-0.2",
      trend: "down" as const,
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
        // 獲取指標基本資訊
        const info = getIndicatorInfo(params.id);
        setIndicatorData(info);
      } catch (err) {
        setError('獲取指標資料失敗');
      } finally {
        setLoading(false);
      }
    };

    fetchIndicatorData();
  }, [params.id]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">載入指標資料中...</span>
      </div>
    );
  }

  if (error || !indicatorData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">載入失敗</h2>
            <p className="text-gray-600 mb-4">{error || '找不到指標資料'}</p>
            <Link href="/indicator">
              <Button>返回指標列表</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const indicator = indicatorData;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* 返回按鈕 */}
      <div className="mb-6">
        <Link href="/indicator">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回指標列表
          </Button>
        </Link>
      </div>

      {/* 指標標題與概況 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{indicator.name}</CardTitle>
                <CardDescription className="text-base">
                  {indicator.description}
                </CardDescription>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                {indicator.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-bold mb-1">
                  {indicator.currentValue}{indicator.unit}
                </div>
                <div className={`flex items-center gap-1 ${getTrendColor(indicator.trend)}`}>
                  {getTrendIcon(indicator.trend)}
                  <span className="font-medium">{indicator.change}</span>
                  <span className="text-sm text-gray-500">vs 上期</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>最後更新: {indicator.lastUpdated}</span>
                </div>
                <div className="text-sm text-gray-700">
                  <strong>影響層面:</strong> {indicator.impact}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 影響因子 */}
        <Card>
          <CardHeader>
            <CardTitle>主要影響因子</CardTitle>
            <CardDescription>
              影響 {indicator.name} 變化的關鍵因素
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {indicator.factors.map((factor: string, index: number) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">{factor}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 圖表區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 歷史趨勢圖 */}
        <Card>
          <CardHeader>
            <CardTitle>歷史趨勢</CardTitle>
            <CardDescription>
              過去12個月的 {indicator.name} 變化
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EconomicChart 
              indicatorId={indicator.id}
            />
          </CardContent>
        </Card>

        {/* 預測圖 */}
        <Card>
          <CardHeader>
            <CardTitle>未來預測</CardTitle>
            <CardDescription>
              基於經濟模型的 {indicator.name} 預測
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ForecastChart 
              indicatorId={indicator.id}
            />
          </CardContent>
        </Card>
      </div>

      {/* 詳細分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>技術分析</CardTitle>
            <CardDescription>
              基於歷史數據的統計分析
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded">
                  <div className="text-sm text-gray-600">12個月平均</div>
                  <div className="text-lg font-semibold">2.8{indicator.unit}</div>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <div className="text-sm text-gray-600">歷史最高</div>
                  <div className="text-lg font-semibold">4.2{indicator.unit}</div>
                </div>
                <div className="p-3 bg-orange-50 rounded">
                  <div className="text-sm text-gray-600">歷史最低</div>
                  <div className="text-lg font-semibold">1.1{indicator.unit}</div>
                </div>
                <div className="p-3 bg-purple-50 rounded">
                  <div className="text-sm text-gray-600">波動率</div>
                  <div className="text-lg font-semibold">0.8{indicator.unit}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>市場影響</CardTitle>
            <CardDescription>
              {indicator.name} 對各市場的影響程度
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>股票市場</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                  <span className="text-sm font-medium">高</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>債券市場</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: '70%'}}></div>
                  </div>
                  <span className="text-sm font-medium">中高</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>外匯市場</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{width: '60%'}}></div>
                  </div>
                  <span className="text-sm font-medium">中等</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>商品市場</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '40%'}}></div>
                  </div>
                  <span className="text-sm font-medium">低</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
