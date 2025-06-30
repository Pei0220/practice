import { NextRequest, NextResponse } from 'next/server';
import { YahooFinanceService, EconomicAnalysisService } from '@/lib/backend/services/yahoo-finance.service';

const yahooService = new YahooFinanceService();
const analysisService = new EconomicAnalysisService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';

    switch (type) {
      case 'overview':
        const overview = await analysisService.getMarketOverview();
        return NextResponse.json({
          success: true,
          data: overview
        });

      case 'sentiment':
        const sentiment = await analysisService.analyzeMarketSentiment();
        return NextResponse.json({
          success: true,
          data: sentiment
        });

      case 'sectors':
        const sectors = await analysisService.getSectorAnalysis();
        return NextResponse.json({
          success: true,
          data: sectors
        });

      case 'trending':
        const trending = await yahooService.getTrendingStocks();
        return NextResponse.json({
          success: true,
          data: trending
        });

      case 'crypto':
        const crypto = await yahooService.getCryptoData();
        return NextResponse.json({
          success: true,
          data: crypto
        });

      case 'forex':
        const forex = await yahooService.getForexData();
        return NextResponse.json({
          success: true,
          data: forex
        });

      case 'commodities':
        const commodities = await yahooService.getCommoditiesData();
        return NextResponse.json({
          success: true,
          data: commodities
        });

      case 'stock':
        const symbol = searchParams.get('symbol');
        if (!symbol) {
          return NextResponse.json({
            success: false,
            error: '請提供股票代碼'
          }, { status: 400 });
        }
        
        const stockData = await yahooService.getStockData([symbol]);
        if (stockData.length === 0) {
          return NextResponse.json({
            success: false,
            error: `找不到股票代碼：${symbol}`
          }, { status: 404 });
        }
        
        return NextResponse.json({
          success: true,
          data: stockData[0]
        });

      default:
        return NextResponse.json({
          success: false,
          error: '不支援的數據類型'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Market data API error:', error);
    return NextResponse.json({
      success: false,
      error: '獲取市場數據失敗'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbols, period } = body;

    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json({
        success: false,
        error: '請提供有效的股票代碼陣列'
      }, { status: 400 });
    }

    const stockData = await yahooService.getStockData(symbols);
    
    // 如果需要歷史數據
    if (period) {
      const historicalPromises = symbols.map(symbol => 
        yahooService.getHistoricalData(symbol, period)
      );
      const historicalData = await Promise.all(historicalPromises);
      
      return NextResponse.json({
        success: true,
        data: {
          current: stockData,
          historical: historicalData.reduce((acc, data, index) => {
            acc[symbols[index]] = data;
            return acc;
          }, {} as any)
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: stockData
    });
  } catch (error) {
    console.error('Market data POST API error:', error);
    return NextResponse.json({
      success: false,
      error: '處理股票數據請求失敗'
    }, { status: 500 });
  }
}
