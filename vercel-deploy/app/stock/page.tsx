'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, TrendingUp, TrendingDown, Star, RefreshCw, DollarSign } from 'lucide-react';
import { useApp } from '@/lib/app-context';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  peRatio?: number;
  dividendYield?: number;
  high52Week?: number;
  low52Week?: number;
}

interface PopularStock {
  symbol: string;
  name: string;
  category: string;
}

const POPULAR_STOCKS: PopularStock[] = [
  // 美國科技股
  { symbol: 'AAPL', name: 'Apple Inc.', category: '科技' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', category: '科技' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', category: '科技' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', category: '科技' },
  { symbol: 'TSLA', name: 'Tesla Inc.', category: '電動車' },
  { symbol: 'META', name: 'Meta Platforms Inc.', category: '科技' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', category: '半導體' },
  
  // 金融股
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', category: '金融' },
  { symbol: 'BAC', name: 'Bank of America Corp.', category: '金融' },
  { symbol: 'WFC', name: 'Wells Fargo & Co.', category: '金融' },
  
  // 消費股
  { symbol: 'PG', name: 'Procter & Gamble Co.', category: '消費品' },
  { symbol: 'KO', name: 'The Coca-Cola Co.', category: '飲料' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', category: '飲料' },
  { symbol: 'WMT', name: 'Walmart Inc.', category: '零售' },
  
  // 醫療股
  { symbol: 'JNJ', name: 'Johnson & Johnson', category: '醫療' },
  { symbol: 'PFE', name: 'Pfizer Inc.', category: '醫療' },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', category: '醫療' },
  
  // 台灣股票 (ADR)
  { symbol: 'TSM', name: '台積電 ADR', category: '半導體' },
  { symbol: 'UMC', name: '聯電 ADR', category: '半導體' },
  
  // 中國股票 (ADR)
  { symbol: 'BABA', name: '阿里巴巴 ADR', category: '電商' },
  { symbol: 'JD', name: '京東 ADR', category: '電商' },
  { symbol: 'BIDU', name: '百度 ADR', category: '科技' },
];

export default function StockSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { t, language } = useApp();

  // 載入最近搜尋記錄
  useEffect(() => {
    const saved = localStorage.getItem('recent_stock_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // 搜尋股票
  const searchStock = async (symbol: string) => {
    if (!symbol.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/market-data?type=stock&symbol=${symbol.toUpperCase()}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setStockData(result.data);
        
        // 更新最近搜尋記錄
        const newSearches = [symbol.toUpperCase(), ...recentSearches.filter(s => s !== symbol.toUpperCase())].slice(0, 10);
        setRecentSearches(newSearches);
        localStorage.setItem('recent_stock_searches', JSON.stringify(newSearches));
        
        // 自動滾動到結果區域
        setTimeout(() => {
          const resultElement = document.getElementById('stock-result');
          if (resultElement) {
            resultElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        }, 100);
      } else {
        setError(`找不到股票代碼：${symbol.toUpperCase()}`);
        setStockData(null);
      }
    } catch (err) {
      setError('獲取股票數據失敗，請稍後再試');
      setStockData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    searchStock(searchQuery);
  };

  const handleQuickSearch = (symbol: string) => {
    setSearchQuery(symbol);
    searchStock(symbol);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (change: number, changePercent: number) => {
    const isPositive = change >= 0;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    const icon = isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
    
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        {icon}
        <span>{isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)</span>
      </div>
    );
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    }
    return `$${marketCap.toLocaleString()}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `${(volume / 1e6).toFixed(2)}M`;
    } else if (volume >= 1e3) {
      return `${(volume / 1e3).toFixed(2)}K`;
    }
    return volume.toLocaleString();
  };

  // 依類別分組
  const stocksByCategory = POPULAR_STOCKS.reduce((acc, stock) => {
    if (!acc[stock.category]) {
      acc[stock.category] = [];
    }
    acc[stock.category].push(stock);
    return acc;
  }, {} as Record<string, PopularStock[]>);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('stock.title')}</h1>
          <p className="text-muted-foreground">{t('stock.description')}</p>
        </div>

        {/* 搜尋框 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              {language === 'zh-TW' ? '股票搜尋' : 'Stock Search'}
            </CardTitle>
            <CardDescription>
              {t('stock.searchPlaceholder')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <Input
                type="text"
                placeholder={t('stock.searchPlaceholder')}
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {loading ? t('stock.loading') : t('stock.search')}
              </Button>
            </form>

            {/* 最近搜尋 */}
            {recentSearches.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">{t('stock.recentSearches')}：</p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((symbol) => (
                    <Button
                      key={symbol}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickSearch(symbol)}
                    >
                      {symbol}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 錯誤訊息 */}
        {error && (
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 股票詳情 */}
        {stockData && (
          <Card id="stock-result" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{stockData.name}</h2>
                  <p className="text-gray-600">{stockData.symbol}</p>
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {formatPrice(stockData.price)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 價格變動 */}
                <div className="text-center p-4 bg-card rounded-lg border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">{language === 'zh-TW' ? '今日變動' : 'Today\'s Change'}</h3>
                  {formatChange(stockData.change, stockData.changePercent)}
                </div>

                {/* 成交量 */}
                <div className="text-center p-4 bg-card rounded-lg border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">{t('stock.volume')}</h3>
                  <p className="text-lg font-semibold">{formatVolume(stockData.volume)}</p>
                </div>

                {/* 市值 */}
                {stockData.marketCap && (
                  <div className="text-center p-4 bg-card rounded-lg border">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">{t('stock.marketCap')}</h3>
                    <p className="text-lg font-semibold">{formatMarketCap(stockData.marketCap)}</p>
                  </div>
                )}

                {/* 本益比 */}
                {stockData.peRatio && (
                  <div className="text-center p-4 bg-card rounded-lg border">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">{t('stock.peRatio')}</h3>
                    <p className="text-lg font-semibold">{stockData.peRatio.toFixed(2)}</p>
                  </div>
                )}
              </div>

              {/* 52週高低點 */}
              {(stockData.high52Week || stockData.low52Week) && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">52週區間</h3>
                  <div className="flex items-center justify-between">
                    {stockData.low52Week && (
                      <div>
                        <span className="text-sm text-blue-700">最低：</span>
                        <span className="font-semibold ml-1">{formatPrice(stockData.low52Week)}</span>
                      </div>
                    )}
                    {stockData.high52Week && (
                      <div>
                        <span className="text-sm text-blue-700">最高：</span>
                        <span className="font-semibold ml-1">{formatPrice(stockData.high52Week)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 熱門股票推薦 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              {t('stock.hotStocks')}
            </CardTitle>
            <CardDescription>
              {language === 'zh-TW' ? '點擊快速查詢股票資訊' : 'Click to quickly search stock information'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(stocksByCategory).map(([category, stocks]) => (
                <div key={category}>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {category}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {stocks.map((stock) => (
                      <Button
                        key={stock.symbol}
                        variant="outline"
                        className="h-auto p-3 flex flex-col items-start"
                        onClick={() => handleQuickSearch(stock.symbol)}
                      >
                        <span className="font-semibold">{stock.symbol}</span>
                        <span className="text-xs text-gray-600 text-left">{stock.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
