"use client"

import { useEffect, useRef } from "react"
import { useForecast } from "@/lib/frontend/hooks/use-forecast"

interface ForecastChartProps {
  indicatorId: string
}

export function ForecastChart({ indicatorId }: ForecastChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { forecasts, loading, error, generateForecast } = useForecast()

  // Generate forecast when component mounts or indicatorId changes
  useEffect(() => {
    generateForecast({
      indicator: indicatorId as any, // Cast to avoid type error
      periods: 6,
      methodology: 'arima'
    })
  }, [indicatorId, generateForecast])

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
    const height = rect.height
    const padding = 40

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    if (loading) {
      // Show loading state
      ctx.fillStyle = "#9ca3af"
      ctx.font = "16px Inter, system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("正在生成預測...", width / 2, height / 2)
      return
    }

    if (error) {
      // Show error state
      ctx.fillStyle = "#ef4444"
      ctx.font = "14px Inter, system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("預測生成失敗", width / 2, height / 2)
      return
    }

    if (forecasts.length === 0) {
      // Show no data state
      ctx.fillStyle = "#6b7280"
      ctx.font = "14px Inter, system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("暫無預測數據", width / 2, height / 2)
      return
    }

    // Draw background
    ctx.fillStyle = "#fafafa"
    ctx.fillRect(0, 0, width, height)

    // Get values for scaling
    const values = forecasts.map(f => f.value)
    const confidenceValues = forecasts.flatMap(f => f.confidence ? [f.confidence.lower, f.confidence.upper] : [])
    const allValues = [...values, ...confidenceValues]
    const minValue = Math.min(...allValues) * 0.95
    const maxValue = Math.max(...allValues) * 1.05
    const valueRange = maxValue - minValue || 1

    // Draw grid
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = padding + ((height - 2 * padding) * i) / 4
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    const stepX = (width - 2 * padding) / Math.max(forecasts.length - 1, 1)

    // Draw confidence interval if available
    const hasConfidence = forecasts.some(f => f.confidence)
    if (hasConfidence) {
      const getIndicatorColor = (id: string) => {
        switch (id) {
          case 'cpi': return 'rgba(220, 38, 38, 0.1)' // red
          case 'gdp': return 'rgba(22, 163, 74, 0.1)' // green
          case 'unemployment': return 'rgba(37, 99, 235, 0.1)' // blue
          case 'interest_rate': return 'rgba(245, 158, 11, 0.1)' // orange
          default: return 'rgba(59, 130, 246, 0.1)' // default blue
        }
      }

      ctx.fillStyle = getIndicatorColor(indicatorId)
      ctx.beginPath()

      // Upper bound
      forecasts.forEach((forecast, index) => {
        if (forecast.confidence) {
          const x = padding + index * stepX
          const y = height - padding - ((forecast.confidence.upper - minValue) / valueRange) * (height - 2 * padding)
          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
      })

      // Lower bound (reverse order)
      for (let i = forecasts.length - 1; i >= 0; i--) {
        const forecast = forecasts[i]
        if (forecast.confidence) {
          const x = padding + i * stepX
          const y = height - padding - ((forecast.confidence.lower - minValue) / valueRange) * (height - 2 * padding)
          ctx.lineTo(x, y)
        }
      }

      ctx.closePath()
      ctx.fill()
    }

    // Determine chart color based on indicator
    const getIndicatorLineColor = (id: string) => {
      switch (id) {
        case 'cpi': return '#dc2626' // red
        case 'gdp': return '#16a34a' // green
        case 'unemployment': return '#2563eb' // blue
        case 'interest_rate': return '#f59e0b' // orange
        default: return '#3b82f6' // default blue
      }
    }

    const chartColor = getIndicatorLineColor(indicatorId)

    // Draw forecast line
    ctx.strokeStyle = chartColor
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    forecasts.forEach((forecast, index) => {
      const x = padding + index * stepX
      const y = height - padding - ((forecast.value - minValue) / valueRange) * (height - 2 * padding)

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw forecast points
    ctx.setLineDash([])
    ctx.fillStyle = chartColor
    forecasts.forEach((forecast, index) => {
      const x = padding + index * stepX
      const y = height - padding - ((forecast.value - minValue) / valueRange) * (height - 2 * padding)

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fill()
    })

    // Draw labels
    ctx.fillStyle = "#6b7280"
    ctx.font = "12px Inter, system-ui, sans-serif"

    // Y-axis labels
    for (let i = 0; i <= 4; i++) {
      const value = minValue + ((maxValue - minValue) * (4 - i)) / 4
      const y = padding + ((height - 2 * padding) * i) / 4
      ctx.textAlign = "right"
      ctx.fillText(value.toFixed(1) + "%", padding - 10, y + 4)
    }

    // X-axis labels  
    ctx.textAlign = "center"
    forecasts.forEach((forecast, index) => {
      const x = padding + index * stepX
      const date = new Date(forecast.date)
      const label = `${date.getMonth() + 1}/${date.getDate()}`
      ctx.fillText(label, x, height - padding + 20)
    })

    // Legend
    ctx.font = "11px Inter, system-ui, sans-serif"
    ctx.fillStyle = "#374151"
    
    ctx.setLineDash([5, 5])
    ctx.strokeStyle = chartColor
    ctx.beginPath()
    ctx.moveTo(padding, 20)
    ctx.lineTo(padding + 30, 20)
    ctx.stroke()
    ctx.fillText("預測值", padding + 35, 25)
  }, [forecasts, loading, error, indicatorId])

  return (
    <div className="w-full h-80 relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full border border-gray-200 rounded-lg"
        style={{ width: "100%", height: "100%" }}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  )
}
