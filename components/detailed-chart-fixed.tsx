"use client"

import { EconomicChart } from "@/components/economic-chart"

interface DetailedChartProps {
  indicatorId: string
}

export function DetailedChart({ indicatorId }: DetailedChartProps) {
  return (
    <div className="w-full h-80">
      <EconomicChart 
        indicatorId={indicatorId} 
        height={320} 
        showForecast={false}
      />
    </div>
  )
}
