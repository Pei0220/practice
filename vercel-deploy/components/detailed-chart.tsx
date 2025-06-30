"use client"

import React from "react"
import { useIndicatorDetail } from "@/lib/frontend/hooks/use-indicator-detail"

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

  if (!data || !data.historicalData || data.historicalData.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <p className="text-gray-500">無可用數據</p>
      </div>
    )
  }

  // 這裡我們直接使用 canvas 繪圖，因為這是一個詳細的圖表組件
  // 如果您希望使用統一的 EconomicChart 組件，可以修改為：
  // return <EconomicChart indicatorId={indicatorId} height={320} />
  
  return <DetailedChartCanvas data={data.historicalData} indicatorId={indicatorId} />
}

// 詳細圖表的 Canvas 實現
function DetailedChartCanvas({ data, indicatorId }: { data: any[], indicatorId: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data || data.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)

    const width = canvas.offsetWidth
    const height = canvas.offsetHeight
    const padding = 40

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw background
    ctx.fillStyle = "#fafafa"
    ctx.fillRect(0, 0, width, height)

    // Extract values from data
    const values = data.map(d => d.value)
    
    // Calculate chart dimensions
    const minValue = Math.min(...values) * 0.95
    const maxValue = Math.max(...values) * 1.05
    const valueRange = maxValue - minValue
    const stepX = (width - 2 * padding) / (values.length - 1)

    // Draw grid
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + ((height - 2 * padding) * i) / 5
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Vertical grid lines
    for (let i = 0; i <= 6; i++) {
      const x = padding + ((width - 2 * padding) * i) / 6
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
      ctx.stroke()
    }

    // Draw area under curve
    ctx.fillStyle =
      indicatorId === "cpi"
        ? "rgba(220, 38, 38, 0.1)"
        : indicatorId === "gdp"
          ? "rgba(22, 163, 74, 0.1)"
          : "rgba(37, 99, 235, 0.1)"
    ctx.beginPath()
    ctx.moveTo(padding, height - padding)

    values.forEach((value, index) => {
      const x = padding + index * stepX
      const y = height - padding - ((value - minValue) / valueRange) * (height - 2 * padding)
      if (index === 0) {
        ctx.lineTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.lineTo(width - padding, height - padding)
    ctx.closePath()
    ctx.fill()

    // Draw main line
    ctx.strokeStyle = indicatorId === "cpi" ? "#dc2626" : indicatorId === "gdp" ? "#16a34a" : "#2563eb"
    ctx.lineWidth = 3
    ctx.beginPath()

    values.forEach((value, index) => {
      const x = padding + index * stepX
      const y = height - padding - ((value - minValue) / valueRange) * (height - 2 * padding)

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw data points
    ctx.fillStyle = indicatorId === "cpi" ? "#dc2626" : indicatorId === "gdp" ? "#16a34a" : "#2563eb"

    values.forEach((value, index) => {
      if (index % 4 === 0) {
        const x = padding + index * stepX
        const y = height - padding - ((value - minValue) / valueRange) * (height - 2 * padding)

        ctx.beginPath()
        ctx.arc(x, y, 4, 0, 2 * Math.PI)
        ctx.fill()
      }
    })

    // Draw labels
    ctx.fillStyle = "#6b7280"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "center"

    // Y-axis labels
    for (let i = 0; i <= 5; i++) {
      const value = minValue + ((maxValue - minValue) * (5 - i)) / 5
      const y = padding + ((height - 2 * padding) * i) / 5
      ctx.textAlign = "right"
      ctx.fillText(value.toFixed(1) + "%", padding - 10, y + 4)
    }

    // X-axis labels (simplified)
    const months = ["前", "", "", "", "", "", "現在"]
    for (let i = 0; i < months.length; i++) {
      const x = padding + ((width - 2 * padding) * i) / 6
      ctx.textAlign = "center"
      ctx.fillText(months[i], x, height - padding + 20)
    }
  }, [data, indicatorId])

  return (
    <div className="w-full h-80 relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full border border-gray-200 rounded-lg"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  )
}
