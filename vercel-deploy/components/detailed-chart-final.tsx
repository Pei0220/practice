"use client"

import { EconomicChart } from "./economic-chart"

interface DetailedChartProps {
  indicatorId: string
}

export function DetailedChart({ indicatorId }: DetailedChartProps) {
  return (
    <EconomicChart 
      indicatorId={indicatorId} 
      height={320} 
      showForecast={false}
    />
  )
}
