# 效能優化與測試覆蓋

## ⚡ 效能優化策略

### 1. 前端效能優化

#### **組件層級優化**

```typescript
// lib/frontend/hooks/use-optimized-data.ts
import { useMemo, useCallback } from "react";
import { useEconomicData } from "./use-economic-data";

export function useOptimizedEconomicData(indicatorId: string) {
  const { data, loading, error, refetch } = useEconomicData();

  // 記憶化計算統計數據
  const statistics = useMemo(() => {
    if (!data) return null;
    return calculateStatistics(data);
  }, [data]);

  // 記憶化計算趨勢分析
  const trendAnalysis = useMemo(() => {
    if (!data) return null;
    return analyzeTrend(data);
  }, [data]);

  // 記憶化的重新獲取函數
  const optimizedRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    data,
    statistics,
    trendAnalysis,
    loading,
    error,
    refetch: optimizedRefetch,
  };
}
```

#### **圖表渲染優化**

```typescript
// components/optimized-chart.tsx
import { memo, useRef, useEffect } from "react";
import { debounce } from "lodash";

const OptimizedChart = memo(({ data, width, height }: ChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 防抖的重繪函數
  const debouncedRedraw = useMemo(
    () =>
      debounce((canvas, data) => {
        drawChart(canvas, data);
      }, 100),
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && data) {
      debouncedRedraw(canvas, data);
    }
  }, [data, debouncedRedraw]);

  return <canvas ref={canvasRef} width={width} height={height} />;
});
```

### 2. 後端效能優化

#### **API 快取策略**

```typescript
// lib/backend/services/cache.service.ts
interface CacheConfig {
  ttl: number; // 生存時間（秒）
  maxSize: number; // 最大快取大小
}

export class CacheService {
  private static cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();
  private static config: CacheConfig = {
    ttl: 300, // 5 分鐘
    maxSize: 1000,
  };

  static async get<T>(key: string): Promise<T | null> {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  static set(key: string, data: any, ttl?: number): void {
    // 清理過期項目
    this.cleanup();

    // 如果快取已滿，移除最舊的項目
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl,
    });
  }

  private static cleanup(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl * 1000) {
        this.cache.delete(key);
      }
    }
  }
}
```

#### **資料庫查詢優化**

```typescript
// lib/backend/services/optimized-data.service.ts
export class OptimizedDataService {
  static async getIndicatorData(indicatorId: string, periods: number) {
    const cacheKey = \`indicator_\${indicatorId}_\${periods}\`

    // 檢查快取
    let data = await CacheService.get(cacheKey)
    if (data) {
      return data
    }

    // 並行獲取數據
    const [historicalData, statistics, trend] = await Promise.all([
      this.getHistoricalData(indicatorId, periods),
      this.getStatistics(indicatorId),
      this.getTrendAnalysis(indicatorId)
    ])

    data = { historicalData, statistics, trend }

    // 快取結果
    CacheService.set(cacheKey, data, 300) // 5 分鐘快取

    return data
  }
}
```

## 🧪 測試覆蓋策略

### 1. 單元測試

#### **Hook 測試**

```typescript
// __tests__/hooks/use-economic-data.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { useEconomicData } from "@/lib/frontend/hooks/use-economic-data";

describe("useEconomicData", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("should fetch economic data successfully", async () => {
    const mockData = {
      success: true,
      data: [{ date: "2024-01", value: 3.2, indicator: "cpi" }],
    };

    fetchMock.mockResponseOnce(JSON.stringify(mockData));

    const { result } = renderHook(() => useEconomicData());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockData.data);
      expect(result.current.error).toBeNull();
    });
  });

  it("should handle API errors gracefully", async () => {
    fetchMock.mockRejectOnce(new Error("API Error"));

    const { result } = renderHook(() => useEconomicData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("獲取經濟數據時發生未知錯誤");
    });
  });
});
```

#### **API 路由測試**

```typescript
// __tests__/api/indicators.test.ts
import { GET } from "@/app/api/indicators/route";
import { NextRequest } from "next/server";

describe("/api/indicators", () => {
  it("should return indicators data", async () => {
    const request = new NextRequest("http://localhost:3000/api/indicators");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  it("should handle invalid parameters", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/indicators?periods=invalid"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});
```

### 2. 整合測試

#### **端到端工作流測試**

```typescript
// __tests__/integration/indicator-workflow.test.ts
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomePage from "@/app/page";

describe("Indicator Workflow", () => {
  it("should complete full indicator analysis workflow", async () => {
    render(<HomePage />);

    // 1. 等待數據載入
    await waitFor(() => {
      expect(screen.getByText("經濟指標總覽")).toBeInTheDocument();
    });

    // 2. 點擊 CPI 指標
    const cpiCard = screen.getByTestId("indicator-cpi");
    await userEvent.click(cpiCard);

    // 3. 驗證導航到詳情頁
    await waitFor(() => {
      expect(screen.getByText("消費者物價指數 (CPI)")).toBeInTheDocument();
    });

    // 4. 驗證圖表載入
    await waitFor(() => {
      expect(screen.getByTestId("economic-chart")).toBeInTheDocument();
    });

    // 5. 測試 AI 問答功能
    const chatButton = screen.getByText("詢問 AI 更多問題");
    await userEvent.click(chatButton);

    await waitFor(() => {
      expect(screen.getByText("AI 經濟助手")).toBeInTheDocument();
    });
  });
});
```

### 3. 效能測試

#### **負載測試配置**

```typescript
// __tests__/performance/load.test.ts
import { performance } from "perf_hooks";

describe("Performance Tests", () => {
  it("should load indicators data within acceptable time", async () => {
    const start = performance.now();

    const response = await fetch("/api/indicators");
    const data = await response.json();

    const end = performance.now();
    const duration = end - start;

    expect(duration).toBeLessThan(1000); // 1 秒內
    expect(data.success).toBe(true);
  });

  it("should handle concurrent requests efficiently", async () => {
    const concurrentRequests = 10;
    const promises = Array(concurrentRequests)
      .fill(0)
      .map(() => fetch("/api/indicators/cpi"));

    const start = performance.now();
    const responses = await Promise.all(promises);
    const end = performance.now();

    // 所有請求都應該成功
    responses.forEach((response) => {
      expect(response.ok).toBe(true);
    });

    // 並發處理時間應該合理
    expect(end - start).toBeLessThan(3000); // 3 秒內
  });
});
```

## 📊 效能監控

### 1. 關鍵指標監控

```typescript
// lib/utils/performance-monitor.ts
export class PerformanceMonitor {
  static measureAPIResponse(apiPath: string) {
    return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
      const method = descriptor.value

      descriptor.value = async function (...args: any[]) {
        const start = performance.now()

        try {
          const result = await method.apply(this, args)
          const duration = performance.now() - start

          // 記錄效能指標
          console.log(\`API \${apiPath} took \${duration.toFixed(2)}ms\`)

          return result
        } catch (error) {
          const duration = performance.now() - start
          console.error(\`API \${apiPath} failed after \${duration.toFixed(2)}ms\`, error)
          throw error
        }
      }
    }
  }
}
```

### 2. 錯誤監控

```typescript
// lib/utils/error-monitor.ts
export class ErrorMonitor {
  static captureError(error: Error, context?: any) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : "server",
      url: typeof window !== "undefined" ? window.location.href : "server",
    };

    // 發送到監控服務（如 Sentry, LogRocket 等）
    console.error("Application Error:", errorInfo);

    // 在生產環境中，這裡應該發送到錯誤追蹤服務
    if (process.env.NODE_ENV === "production") {
      // sendToErrorTracking(errorInfo)
    }
  }
}
```

## 🚀 部署優化

### 1. 建置優化

```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 壓縮靜態資源
  compress: true,

  // 優化圖片
  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
  },

  // 實驗性功能
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["recharts", "lucide-react"],
  },

  // Webpack 優化
  webpack: (config, { isServer }) => {
    // 代碼分割優化
    config.optimization.splitChunks = {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\\\/]node_modules[\\\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    };

    return config;
  },
};

export default nextConfig;
```

### 2. 快取策略

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // API 快取頭設定
  if (request.nextUrl.pathname.startsWith("/api/")) {
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=60"
    );
  }

  // 靜態資源快取
  if (request.nextUrl.pathname.match(/\\.(jpg|jpeg|png|gif|ico|svg|css|js)$/)) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/static/:path*",
    "/((?!_next/static|favicon.ico).*)",
  ],
};
```

## 📋 測試執行計劃

### 階段 1: 基礎測試設置 ✅

- [x] 安裝測試框架 (Jest, Testing Library)
- [x] 設定測試配置
- [x] 建立測試工具函數

### 階段 2: 單元測試覆蓋 🔄

- [ ] Hook 函數測試
- [ ] Service 層測試
- [ ] Utility 函數測試
- [ ] 組件單元測試

### 階段 3: 整合測試 🔄

- [ ] API 路由測試
- [ ] 端到端工作流測試
- [ ] 錯誤處理測試

### 階段 4: 效能優化 🔄

- [ ] 快取機制實施
- [ ] 代碼分割優化
- [ ] 圖片載入優化
- [ ] API 回應時間優化

**目標**: 達到 80% 以上的測試覆蓋率，API 回應時間 < 1 秒，首屏載入時間 < 2 秒
