"use client"

import { useIndicatorDetail } from "@/lib/frontend/hooks/use-indicator-detail"
import { EconomicChart } from "./economic-chart"

interface DetailedChartProps {
  indicatorId: string
}

export function DetailedChart({ indicatorId }: DetailedChartProps) {
  const { data, loading, error } = useIndicatorDetail(indicatorId, 24, false)

  if (loading) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="text-red-600 text-center">
          <p className="text-sm">載入圖表數據時發生錯誤</p>
          <p className="text-xs text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <p className="text-gray-500">無可用數據</p>
      </div>
    )
  }

  return (
    <EconomicChart 
      data={data.historicalData}
      indicatorId={indicatorId}
      showTitle={false}
    />
  )
}
