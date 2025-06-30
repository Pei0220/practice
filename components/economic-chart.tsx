"use client"

import { useEffect, useRef } from "react"
import { useEconomicData } from "@/lib/frontend/hooks/use-economic-data"
import { EconomicDataPoint } from "@/lib/shared/types"

interface EconomicChartProps {
  indicatorId: string
  height?: number
  showForecast?: boolean
  data?: EconomicDataPoint[]
  showTitle?: boolean
}

export function EconomicChart({ 
  indicatorId, 
  height = 96, 
  showForecast = false,
  data: externalData,
  showTitle = true
}: EconomicChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { data: hookData, loading, error } = useEconomicData({
    indicator: indicatorId,
    periods: 12,
    includeForecasts: showForecast,
  })

  // Use external data if provided, otherwise use hook data
  const data = externalData || hookData

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size for high DPI displays
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = rect.width
    const canvasHeight = rect.height
    const padding = 20

    // Clear canvas
    ctx.clearRect(0, 0, width, canvasHeight)

    if (loading) {
      // Show loading state
      ctx.fillStyle = "#9ca3af"
      ctx.font = "14px Inter, system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("載入中...", width / 2, canvasHeight / 2)
      return
    }

    if (error) {
      // Show error state
      ctx.fillStyle = "#ef4444"
      ctx.font = "12px Inter, system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("數據載入失敗", width / 2, canvasHeight / 2)
      return
    }

    if (data.length === 0) {
      // Show no data state
      ctx.fillStyle = "#6b7280"
      ctx.font = "12px Inter, system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("暫無數據", width / 2, canvasHeight / 2)
      return
    }

    const values = data.map(d => d.value)
    const minValue = Math.min(...values) * 0.95
    const maxValue = Math.max(...values) * 1.05
    const valueRange = maxValue - minValue || 1

    // Draw grid
    ctx.strokeStyle = "#f3f4f6"
    ctx.lineWidth = 1
    for (let i = 1; i < 4; i++) {
      const y = padding + ((canvasHeight - 2 * padding) * i) / 4
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Determine chart color based on indicator
    const getIndicatorColor = (id: string) => {
      switch (id) {
        case 'cpi': return '#dc2626' // red
        case 'gdp': return '#16a34a' // green
        case 'unemployment': return '#2563eb' // blue
        case 'interest_rate': return '#f59e0b' // orange
        default: return '#3b82f6' // default blue
      }
    }

    const chartColor = getIndicatorColor(indicatorId)

    // Draw line chart
    ctx.strokeStyle = chartColor
    ctx.lineWidth = 2
    ctx.beginPath()

    data.forEach((point, index) => {
      const x = padding + ((width - 2 * padding) * index) / (data.length - 1)
      const y = canvasHeight - padding - ((point.value - minValue) / valueRange) * (canvasHeight - 2 * padding)

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw data points
    ctx.fillStyle = chartColor
    data.forEach((point, index) => {
      const x = padding + ((width - 2 * padding) * index) / (data.length - 1)
      const y = canvasHeight - padding - ((point.value - minValue) / valueRange) * (canvasHeight - 2 * padding)
      
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, 2 * Math.PI)
      ctx.fill()
    })

    // Draw latest value
    if (data.length > 0) {
      const latestValue = data[data.length - 1].value
      ctx.fillStyle = "#1f2937"
      ctx.font = "11px Inter, system-ui, sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(`${latestValue.toFixed(2)}%`, width - padding - 5, padding + 15)
    }

    // Draw trend line if forecast is shown
    if (showForecast && data.length >= 3) {
      const recentPoints = data.slice(-3)
      const trend = (recentPoints[2].value - recentPoints[0].value) / 2
      
      ctx.strokeStyle = trend > 0 ? '#16a34a' : trend < 0 ? '#dc2626' : '#6b7280'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      
      const startX = padding + ((width - 2 * padding) * (data.length - 3)) / (data.length - 1)
      const endX = width - padding
      const startY = canvasHeight - padding - ((recentPoints[0].value - minValue) / valueRange) * (canvasHeight - 2 * padding)
      const endY = canvasHeight - padding - ((recentPoints[2].value + trend - minValue) / valueRange) * (canvasHeight - 2 * padding)
      
      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(endX, endY)
      ctx.stroke()
      
      ctx.setLineDash([]) // Reset line dash
    }
  }, [data, loading, error, indicatorId, showForecast])

  return (
    <div className="relative w-full" style={{ height: `${height}px` }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: "100%", height: "100%" }}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  )
}
