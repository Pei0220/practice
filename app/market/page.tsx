'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, Minus, RefreshCw, Globe, DollarSign, Star } from 'lucide-react';
import { useApp } from '@/lib/app-context';

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
}

interface SectorData {
  sector: string;
  performance: number;
  topStocks: MarketData[];
  marketCap: number;
  volume: number;
}

interface MarketSentiment {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  fearGreedIndex: number;
  indices: {
    positive: number;
    negative: number;
    neutral: number;
  };
  vixLevel: number;
  analysis: string;
}

export default function MarketDataPage() {
  const { t, language } = useApp();
  const [marketOverview, setMarketOverview] = useState<any>(null);
  const [sentiment, setSentiment] = useState<MarketSentiment | null>(null);
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchAllData();
    // 每5分鐘自動更新
    const interval = setInterval(fetchAllData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewRes, sentimentRes, sectorsRes] = await Promise.all([
        fetch('/api/market-data?type=overview'),
        fetch('/api/market-data?type=sentiment'),
        fetch('/api/market-data?type=sectors')
      ]);

      if (!overviewRes.ok || !sentimentRes.ok || !sectorsRes.ok) {
        throw new Error('獲取數據失敗');
      }

      const [overviewData, sentimentData, sectorsData] = await Promise.all([
        overviewRes.json(),
        sentimentRes.json(),
        sectorsRes.json()
      ]);

      setMarketOverview(overviewData.data);
      setSentiment(sentimentData.data);
      setSectors(sectorsData.data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : '獲取數據失敗');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, symbol?: string) => {
    if (symbol?.includes('USD')) {
      return `$${price.toFixed(2)}`;
    }
    return price.toLocaleString('zh-TW', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatChange = (change: number, changePercent: number) => {
    const isPositive = change >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';

    return (
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <Icon size={16} />
        <span>{change >= 0 ? '+' : ''}{change.toFixed(2)}</span>
        <span>({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)</span>
      </div>
    );
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'bg-green-100 text-green-800';
      case 'bearish': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getFearGreedColor = (level: number) => {
    if (level > 70) return 'bg-red-100 text-red-800';
    if (level < 30) return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <RefreshCw className="animate-spin h-8 w-8" />
        <span className="ml-2">{t('market.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertDescription>
          {error}
          <Button onClick={fetchAllData} className="ml-4" variant="outline" size="sm">
            {t('common.retry')}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('market.title')}</h1>
          <p className="text-gray-600">
            {t('market.lastUpdate')}: {lastUpdate.toLocaleTimeString(language === 'zh-TW' ? 'zh-TW' : 'en-US')}
          </p>
        </div>
        
        <Button onClick={fetchAllData} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          {t('market.refreshData')}
        </Button>
      </div>

      {/* 市場情緒指標 */}
      {sentiment && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('market.sentiment')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <Badge className={getSentimentColor(sentiment.sentiment)}>
                  {sentiment.sentiment === 'bullish' ? t('market.bullish') : 
                   sentiment.sentiment === 'bearish' ? t('market.bearish') : t('market.neutral')}
                </Badge>
                <p className="text-sm text-gray-600 mt-2">{t('market.sentiment')}</p>
              </div>
              <div className="text-center">
                <Badge className={getFearGreedColor(sentiment.fearGreedIndex)}>
                  {t('market.fearGreedIndex')}: {sentiment.fearGreedIndex}
                </Badge>
                <p className="text-sm text-gray-600 mt-2">
                  {t('market.vixLevel')}: {sentiment.vixLevel.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <div className="text-sm">
                  <span className="text-green-600">{t('market.positiveNews')}: {sentiment.indices.positive}</span>
                  <span className="text-red-600 ml-2">{t('market.negativeNews')}: {sentiment.indices.negative}</span>
                  <span className="text-gray-600 ml-2">{t('market.neutralNews')}: {sentiment.indices.neutral}</span>
                </div>
              </div>
            </div>
            <Alert className="mt-4">
              <AlertDescription>{sentiment.analysis}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{t('market.overview')}</TabsTrigger>
          <TabsTrigger value="sectors">{t('market.sectors')}</TabsTrigger>
          <TabsTrigger value="crypto">{t('market.crypto')}</TabsTrigger>
          <TabsTrigger value="forex">{t('market.forex')}</TabsTrigger>
          <TabsTrigger value="commodities">{t('market.commodities')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 主要指數 */}
            {marketOverview?.indices && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    {t('market.majorIndices')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {marketOverview.indices.map((index: MarketData) => (
                      <div key={index.symbol} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{index.name}</p>
                          <p className="text-sm text-gray-600">{index.symbol}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPrice(index.price)}</p>
                          {formatChange(index.change, index.changePercent)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 熱門股票 */}
            {marketOverview?.trending && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    {t('market.hotStocks')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {marketOverview.trending.slice(0, 5).map((stock: MarketData) => (
                      <div key={stock.symbol} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{stock.symbol}</p>
                          <p className="text-sm text-gray-600 truncate">{stock.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${stock.price.toFixed(2)}</p>
                          {formatChange(stock.change, stock.changePercent)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sectors">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sectors.map((sector) => (
              <Card key={sector.sector}>
                <CardHeader>
                  <CardTitle className="text-lg">{sector.sector}</CardTitle>
                  <CardDescription>
                    {formatChange(0, sector.performance)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sector.topStocks.map((stock) => (
                      <div key={stock.symbol} className="flex justify-between items-center text-sm">
                        <span>{stock.symbol}</span>
                        <span className={stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {stock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t text-xs text-gray-600">
                    總市值: ${(sector.marketCap / 1e12).toFixed(2)}T
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="crypto">
          {marketOverview?.crypto && (
            <Card>
              <CardHeader>
                <CardTitle>加密貨幣</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {marketOverview.crypto.map((crypto: MarketData) => (
                    <div key={crypto.symbol} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{crypto.symbol}</h3>
                        {formatChange(crypto.change, crypto.changePercent)}
                      </div>
                      <p className="text-2xl font-bold">{formatPrice(crypto.price, crypto.symbol)}</p>
                      <p className="text-sm text-gray-600">
                        成交量: {crypto.volume.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="forex">
          {marketOverview?.forex && (
            <Card>
              <CardHeader>
                <CardTitle>外匯市場</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {marketOverview.forex.map((forex: MarketData) => (
                    <div key={forex.symbol} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{forex.symbol}</h3>
                        {formatChange(forex.change, forex.changePercent)}
                      </div>
                      <p className="text-2xl font-bold">{formatPrice(forex.price)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="commodities">
          {marketOverview?.commodities && (
            <Card>
              <CardHeader>
                <CardTitle>大宗商品</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {marketOverview.commodities.map((commodity: MarketData) => (
                    <div key={commodity.symbol} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{commodity.name}</h3>
                        {formatChange(commodity.change, commodity.changePercent)}
                      </div>
                      <p className="text-2xl font-bold">${formatPrice(commodity.price)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
