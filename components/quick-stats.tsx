"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react"
import { APIResponse, EconomicIndicator } from "@/lib/shared/types"

interface QuickStat {
  label: string
  value: string
  trend: "up" | "down" | "stable"
  color: string
  change?: string
}

export function QuickStats() {
  const [stats, setStats] = useState<QuickStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        setLoading(true)
        setError(null)

        // 獲取主要經濟指標數據
        const response = await fetch('/api/indicators')
        const result: APIResponse<EconomicIndicator[]> = await response.json()

        if (!result.success || !result.data) {
          throw new Error('獲取數據失敗')
        }

        // 為每個指標獲取最新數據點
        const statsPromises = result.data.slice(0, 4).map(async (indicator) => {
          try {
            const dataResponse = await fetch(`/api/indicators?indicator=${indicator.id}&periods=2`)
            const dataResult: APIResponse<any> = await dataResponse.json()
            
            if (dataResult.success && dataResult.data?.length > 0) {
              const latest = dataResult.data[dataResult.data.length - 1]
              const previous = dataResult.data[dataResult.data.length - 2]
              
              const change = previous ? ((latest.value - previous.value) / previous.value * 100) : 0
              const trend: "up" | "down" | "stable" = change > 0.1 ? 'up' : change < -0.1 ? 'down' : 'stable'
              
              return {
                label: indicator.name,
                value: `${latest.value.toFixed(1)}${indicator.unit}`,
                trend,
                color: getTrendColor(indicator.id, trend),
                change: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`
              }
            }
            
            // 回退到預設值
            return getDefaultStat(indicator)
          } catch {
            return getDefaultStat(indicator)
          }
        })

        const resolvedStats = await Promise.all(statsPromises)
        setStats(resolvedStats)
      } catch (err) {
        console.error('獲取快速統計數據失敗:', err)
        setError(err instanceof Error ? err.message : '獲取數據失敗')
        // 設置預設統計數據
        setStats(getDefaultStats())
      } finally {
        setLoading(false)
      }
    }

    fetchQuickStats()
  }, [])

  const getTrendColor = (indicatorId: string, trend: string) => {
    const colorMap: Record<string, Record<string, string>> = {
      cpi: { up: 'text-red-600', down: 'text-green-600', stable: 'text-orange-600' },
      gdp: { up: 'text-green-600', down: 'text-red-600', stable: 'text-blue-600' },
      unemployment: { up: 'text-red-600', down: 'text-green-600', stable: 'text-orange-600' },
      interest_rate: { up: 'text-orange-600', down: 'text-blue-600', stable: 'text-gray-600' }
    }
    return colorMap[indicatorId]?.[trend] || 'text-gray-600'
  }

  const getDefaultStat = (indicator: EconomicIndicator): QuickStat => {
    const defaults: Record<string, QuickStat> = {
      cpi: { label: '通膨率', value: '3.2%', trend: 'up', color: 'text-red-600', change: '+0.3%' },
      gdp: { label: '經濟成長', value: '2.8%', trend: 'up', color: 'text-green-600', change: '+0.1%' },
      unemployment: { label: '失業率', value: '3.7%', trend: 'down', color: 'text-green-600', change: '-0.2%' },
      interest_rate: { label: '基準利率', value: '5.25%', trend: 'stable', color: 'text-gray-600', change: '0.0%' }
    }
    return defaults[indicator.id] || { 
      label: indicator.name, 
      value: 'N/A', 
      trend: 'stable', 
      color: 'text-gray-600',
      change: '0.0%'
    }
  }

  const getDefaultStats = (): QuickStat[] => [
    { label: "通膨壓力", value: "中等", trend: "up", color: "text-orange-600", change: "+0.2%" },
    { label: "經濟成長", value: "穩健", trend: "stable", color: "text-green-600", change: "0.0%" },
    { label: "就業市場", value: "改善", trend: "up", color: "text-blue-600", change: "+0.3%" },
    { label: "升息機率", value: "65%", trend: "up", color: "text-red-600", change: "+5%" }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="bg-white">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="col-span-2 lg:col-span-4 bg-red-50 border-red-200">
          <CardContent className="p-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">快速統計載入失敗：{error}</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className={`text-lg font-semibold ${stat.color}`}>{stat.value}</p>
                {stat.change && (
                  <p className={`text-xs ${stat.color} mt-1`}>{stat.change}</p>
                )}
              </div>
              <div className={`p-2 rounded-full bg-gray-50 ${stat.color}`}>
                {stat.trend === "up" && <TrendingUp className="h-4 w-4" />}
                {stat.trend === "down" && <TrendingDown className="h-4 w-4" />}
                {stat.trend === "stable" && <Minus className="h-4 w-4" />}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
