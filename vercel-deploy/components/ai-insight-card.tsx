"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, TrendingUp, AlertCircle, Loader2 } from "lucide-react"
import { AIInsight } from "@/lib/shared/types"

interface AIInsightCardProps {
  indicatorId?: string
  type?: "summary" | "prediction" | "alert"
  title?: string
  content?: string
}

export function AIInsightCard({ 
  indicatorId, 
  type = "summary", 
  title, 
  content 
}: AIInsightCardProps) {
  const [insight, setInsight] = useState<AIInsight | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!indicatorId) return

    const fetchInsight = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/insights?indicator=${indicatorId}&type=${type}`)
        if (!response.ok) {
          throw new Error('獲取洞察失敗')
        }
        
        const data = await response.json()
        if (data.success) {
          setInsight(data.data)
        } else {
          setError(data.error || '獲取洞察失敗')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知錯誤')
      } finally {
        setLoading(false)
      }
    }

    fetchInsight()
  }, [indicatorId, type])

  const getIcon = (insightType: string) => {
    switch (insightType) {
      case "summary":
        return <Activity className="h-5 w-5 text-blue-600" />
      case "prediction":
        return <TrendingUp className="h-5 w-5 text-green-600" />
      case "alert":
        return <AlertCircle className="h-5 w-5 text-orange-600" />
      default:
        return <Activity className="h-5 w-5 text-blue-600" />
    }
  }

  const getBadgeColor = (insightType: string) => {
    switch (insightType) {
      case "summary":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "prediction":
        return "bg-green-50 text-green-700 border-green-200"
      case "alert":
        return "bg-orange-50 text-orange-700 border-orange-200"
      default:
        return "bg-blue-50 text-blue-700 border-blue-200"
    }
  }

  const displayTitle = insight?.title || title || "AI 洞察"
  const displayContent = insight?.content || content || ""
  const displayType = insight?.type || type
  const confidence = insight?.confidence

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            ) : (
              getIcon(displayType)
            )}
            <CardTitle className="text-lg">{displayTitle}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getBadgeColor(displayType)}>AI 解讀</Badge>
            {confidence && (
              <Badge className="text-xs border-gray-200 bg-gray-50">
                信心度: {Math.round(confidence * 100)}%
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">正在生成洞察...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="h-6 w-6 mx-auto mb-2 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : displayContent ? (
          <>
            <p className="text-gray-700 leading-relaxed">{displayContent}</p>
            {insight?.metadata?.relevantIndicators && insight.metadata.relevantIndicators.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">相關指標：</p>
                <div className="flex flex-wrap gap-1">
                  {insight.metadata.relevantIndicators.map((indicator: string, index: number) => (
                    <Badge key={index} className="text-xs border-gray-200 bg-gray-50">
                      {indicator}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 text-xs text-gray-500">
              最後更新：{insight?.generatedAt ? new Date(insight.generatedAt).toLocaleString("zh-TW") : new Date().toLocaleString("zh-TW")}
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center py-4">暫無洞察內容</p>
        )}
      </CardContent>
    </Card>
  )
}
