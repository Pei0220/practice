'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Calendar, Home, BarChart3, RefreshCw, AlertTriangle, Check, Info, X } from 'lucide-react';
import { useApp } from '@/lib/app-context';

interface MacroIndicator {
  indicator: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  unit: string;
  date: Date;
  importance: 'high' | 'medium' | 'low';
  country: string;
  category: string;
}

interface CentralBankPolicy {
  bank: string;
  country: string;
  interestRate: number;
  lastChange: Date;
  nextMeetingDate?: Date;
  policy: 'dovish' | 'hawkish' | 'neutral';
  statement: string;
}

interface EconomicEvent {
  date: Date;
  event: string;
  country: string;
  importance: 'high' | 'medium' | 'low';
  actual?: number;
  forecast?: number;
  previous?: number;
  impact: 'positive' | 'negative' | 'neutral';
}

interface MacroReport {
  summary: {
    outlook: string;
    riskLevel: string;
    recommendation: string;
    avgGrowth: number;
    avgInflation: number;
    avgUnemployment: number;
  };
  indicators: MacroIndicator[];
  policies: CentralBankPolicy[];
  upcomingEvents: EconomicEvent[];
  generatedAt: Date;
}

interface IndicatorRange {
  range: string;
  description: string;
  color: 'green' | 'yellow' | 'orange' | 'red';
}

interface IndicatorGuide {
  [key: string]: {
    title: string;
    unit: string;
    ranges: IndicatorRange[];
  };
}

export default function MacroEconomicPage() {
  const { t, language } = useApp();
  const [indicators, setIndicators] = useState<MacroIndicator[]>([]);
  const [policies, setPolicies] = useState<CentralBankPolicy[]>([]);
  const [calendar, setCalendar] = useState<EconomicEvent[]>([]);
  const [report, setReport] = useState<MacroReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showIndicatorGuide, setShowIndicatorGuide] = useState<string | null>(null);

  // 經濟指標解讀指南
  const indicatorGuides: IndicatorGuide = {
    '失業率': {
      title: '失業率',
      unit: '%',
      ranges: [
        { range: '3-4%', description: '充分就業，勞動市場吃緊，可能伴隨通膨壓力', color: 'green' },
        { range: '4-5%', description: '健康的勞動力市場，經濟穩定增長', color: 'green' },
        { range: '5-7%', description: '經濟放緩或適度衰退，失業人數增加', color: 'yellow' },
        { range: '7%以上', description: '嚴重衰退或危機，大量裁員', color: 'red' }
      ]
    },
    'GDP增長率': {
      title: 'GDP增長率',
      unit: '%',
      ranges: [
        { range: '3%以上', description: '強勁經濟增長，企業盈利能力佳', color: 'green' },
        { range: '2-3%', description: '穩健經濟增長，市場表現良好', color: 'green' },
        { range: '1-2%', description: '經濟溫和增長，需關注後續發展', color: 'yellow' },
        { range: '0-1%', description: '經濟增長乏力，接近停滯', color: 'orange' },
        { range: '負增長', description: '經濟衰退，市場風險增加', color: 'red' }
      ]
    },
    '通膨率': {
      title: '通膨率',
      unit: '%',
      ranges: [
        { range: '2%左右', description: '健康通膨水準，經濟穩定發展', color: 'green' },
        { range: '2-4%', description: '適度通膨，需密切關注', color: 'yellow' },
        { range: '4-6%', description: '通膨升溫，購買力下降', color: 'orange' },
        { range: '6%以上', description: '高通膨，央行可能積極升息', color: 'red' }
      ]
    },
    '利率': {
      title: '基準利率',
      unit: '%',
      ranges: [
        { range: '0-2%', description: '寬鬆貨幣政策，刺激經濟增長', color: 'green' },
        { range: '2-4%', description: '中性利率水準，經濟平衡發展', color: 'yellow' },
        { range: '4-6%', description: '緊縮貨幣政策，抑制通膨', color: 'orange' },
        { range: '6%以上', description: '高利率環境，經濟降溫明顯', color: 'red' }
      ]
    },
    'CPI': {
      title: '消費者物價指數',
      unit: '%',
      ranges: [
        { range: '2%左右', description: '健康通膨水準，物價穩定', color: 'green' },
        { range: '2-4%', description: '適度通膨，消費者負擔增加', color: 'yellow' },
        { range: '4-6%', description: '通膨壓力明顯，生活成本上升', color: 'orange' },
        { range: '6%以上', description: '高通膨，嚴重影響購買力', color: 'red' }
      ]
    },
    'PMI': {
      title: '採購經理人指數',
      unit: '點',
      ranges: [
        { range: '50以上', description: '製造業擴張，經濟活動增強', color: 'green' },
        { range: '45-50', description: '製造業輕微收縮，需關注趨勢', color: 'yellow' },
        { range: '40-45', description: '製造業明顯收縮，經濟放緩', color: 'orange' },
        { range: '40以下', description: '製造業嚴重萎縮，衰退信號', color: 'red' }
      ]
    },
    '零售銷售': {
      title: '零售銷售',
      unit: '%',
      ranges: [
        { range: '3%以上', description: '消費強勁，內需市場健康', color: 'green' },
        { range: '1-3%', description: '消費溫和增長，市場穩定', color: 'green' },
        { range: '0-1%', description: '消費增長疲軟，需關注', color: 'yellow' },
        { range: '負增長', description: '消費萎縮，經濟收縮信號', color: 'red' }
      ]
    },
    '工業生產': {
      title: '工業生產指數',
      unit: '%',
      ranges: [
        { range: '4%以上', description: '工業活動旺盛，經濟強勁', color: 'green' },
        { range: '2-4%', description: '工業穩定增長，經濟健康', color: 'green' },
        { range: '0-2%', description: '工業增長放緩，需密切關注', color: 'yellow' },
        { range: '負增長', description: '工業萎縮，經濟衰退跡象', color: 'red' }
      ]
    }
  };

  useEffect(() => {
    fetchAllData();
    // 每30分鐘自動更新
    const interval = setInterval(fetchAllData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [indicatorsRes, policiesRes, calendarRes, reportRes] = await Promise.all([
        fetch('/api/macro-economic?type=indicators'),
        fetch('/api/macro-economic?type=policies'),
        fetch('/api/macro-economic?type=calendar'),
        fetch('/api/macro-economic?type=report')
      ]);

      if (!indicatorsRes.ok || !policiesRes.ok || !calendarRes.ok || !reportRes.ok) {
        throw new Error(t('macro.error'));
      }

      const [indicatorsData, policiesData, calendarData, reportData] = await Promise.all([
        indicatorsRes.json(),
        policiesRes.json(),
        calendarRes.json(),
        reportRes.json()
      ]);

      setIndicators(indicatorsData.data);
      setPolicies(policiesData.data);
      setCalendar(calendarData.data);
      setReport(reportData.data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRangeColor = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-50 border-green-200 text-green-800';
      case 'yellow': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'orange': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'red': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const handleToggleIndicatorGuide = (indicator: MacroIndicator) => {
    const key = `${indicator.indicator}-${indicator.country}`;
    setShowIndicatorGuide(showIndicatorGuide === key ? null : key);
  };

  const getIndicatorGuide = (indicatorName: string) => {
    // 嘗試精確匹配
    if (indicatorGuides[indicatorName]) {
      return indicatorGuides[indicatorName];
    }
    
    // 嘗試模糊匹配
    const normalizedName = indicatorName.toLowerCase().replace(/\s+/g, '');
    
    for (const [key, guide] of Object.entries(indicatorGuides)) {
      const normalizedKey = key.toLowerCase().replace(/\s+/g, '');
      
      // 檢查是否包含關鍵字
      if (normalizedName.includes(normalizedKey) || 
          normalizedKey.includes(normalizedName) ||
          normalizedName.includes('失業') && key === '失業率' ||
          normalizedName.includes('gdp') && key === 'GDP增長率' ||
          normalizedName.includes('通膨') && key === '通膨率' ||
          normalizedName.includes('通脹') && key === '通膨率' ||
          normalizedName.includes('利率') && key === '利率' ||
          normalizedName.includes('cpi') && key === 'CPI' ||
          normalizedName.includes('pmi') && key === 'PMI' ||
          normalizedName.includes('零售') && key === '零售銷售' ||
          normalizedName.includes('工業') && key === '工業生產') {
        return guide;
      }
    }
    
    // 如果沒有匹配，返回 null
    return null;
  };

  const formatChange = (change: number, changePercent: number) => {
    const isPositive = change >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';

    return (
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <Icon size={16} />
        <span>{change >= 0 ? '+' : ''}{change.toFixed(2)}</span>
        <span>({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%)</span>
      </div>
    );
  };

  const getPolicyColor = (policy: string) => {
    switch (policy) {
      case 'hawkish': return 'bg-red-100 text-red-800';
      case 'dovish': return 'bg-green-100 text-green-800';
      case 'neutral': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOutlookColor = (outlook: string) => {
    switch (outlook) {
      case '樂觀': return 'text-green-600';
      case '悲觀': return 'text-red-600';
      case '中性': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <RefreshCw className="animate-spin h-8 w-8" />
        <span className="ml-2">{t('macro.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button onClick={fetchAllData} className="ml-4" variant="outline" size="sm">
            {t('macro.retry')}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('macro.title')}</h1>
          <p className="text-muted-foreground">
            {t('macro.lastUpdate')}: {lastUpdate.toLocaleTimeString(language === 'zh-TW' ? 'zh-TW' : 'en-US')}
          </p>
        </div>
        <Button onClick={fetchAllData} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          {t('macro.refreshData')}
        </Button>
      </div>

      {/* 總經分析報告摘要 */}
      {report && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t('macro.macroReport')}
            </CardTitle>
            <CardDescription>
              {new Date(report.generatedAt).toLocaleString(language === 'zh-TW' ? 'zh-TW' : 'en-US')} {t('macro.generatedAt')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getOutlookColor(report.summary.outlook)}`}>
                  {report.summary.outlook === '樂觀' ? t('macro.optimistic') :
                   report.summary.outlook === '悲觀' ? t('macro.pessimistic') :
                   t('macro.neutral')}
                </div>
                <p className="text-sm text-gray-600 mt-1">{t('macro.overallOutlook')}</p>
              </div>
              <div className="text-center">
                <Badge className={report.summary.riskLevel === 'high' ? 'bg-red-100 text-red-800' : 
                                report.summary.riskLevel === 'low' ? 'bg-green-100 text-green-800' : 
                                'bg-yellow-100 text-yellow-800'}>
                  {report.summary.riskLevel === 'high' ? t('macro.highRisk') : 
                   report.summary.riskLevel === 'low' ? t('macro.lowRisk') : t('macro.mediumRisk')}
                </Badge>
                <p className="text-sm text-gray-600 mt-2">{t('macro.riskLevel')}</p>
              </div>
              <div className="text-center">
                <div className="space-y-1 text-sm">
                  <div>{t('macro.growthRate')}: {report.summary.avgGrowth.toFixed(1)}%</div>
                  <div>{t('macro.inflationRate')}: {report.summary.avgInflation.toFixed(1)}%</div>
                  <div>{t('macro.unemploymentRate')}: {report.summary.avgUnemployment.toFixed(1)}%</div>
                </div>
              </div>
            </div>
            <Alert className="mt-4">
              <Check className="h-4 w-4" />
              <AlertDescription>
                <strong>{t('macro.investmentAdvice')}：</strong>{report.summary.recommendation}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="indicators" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="indicators">{t('macro.indicators')}</TabsTrigger>
          <TabsTrigger value="policies">{t('macro.policies')}</TabsTrigger>
          <TabsTrigger value="calendar">{t('macro.calendar')}</TabsTrigger>
          <TabsTrigger value="analysis">{t('macro.deepAnalysis')}</TabsTrigger>
        </TabsList>

        <TabsContent value="indicators">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {indicators.map((indicator, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{indicator.indicator}</CardTitle>
                      <CardDescription>{indicator.country}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getImportanceColor(indicator.importance)}>
                        {indicator.importance === 'high' ? t('macro.highImportance') : 
                         indicator.importance === 'medium' ? t('macro.mediumImportance') : t('macro.lowImportance')}
                      </Badge>
                      {getIndicatorGuide(indicator.indicator) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleIndicatorGuide(indicator)}
                          className={`h-8 w-8 p-0 transition-all duration-200 ${
                            showIndicatorGuide === `${indicator.indicator}-${indicator.country}`
                              ? 'bg-blue-100 border-blue-300 hover:bg-blue-200' 
                              : 'hover:bg-blue-50 hover:border-blue-300'
                          }`}
                          title={showIndicatorGuide === `${indicator.indicator}-${indicator.country}` ? t('macro.hideGuide') : t('macro.showGuide')}
                        >
                          {showIndicatorGuide === `${indicator.indicator}-${indicator.country}` ? (
                            <X className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Info className="h-4 w-4 text-blue-600" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">
                        {indicator.value}{indicator.unit}
                      </span>
                      {formatChange(indicator.change, indicator.changePercent)}
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>{t('macro.previousValue')}: {indicator.previousValue}{indicator.unit}</div>
                      <div>{t('macro.date')}: {new Date(indicator.date).toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : 'en-US')}</div>
                      <div>{t('macro.category')}: {indicator.category}</div>
                    </div>
                    
                    {/* 指標解讀區域 */}
                    {showIndicatorGuide === `${indicator.indicator}-${indicator.country}` && 
                     getIndicatorGuide(indicator.indicator) && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Info className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                              <span>{getIndicatorGuide(indicator.indicator)?.title}{language === 'zh-TW' ? '解讀' : ' Guide'}</span>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                {t('macro.referenceValues')}
                              </span>
                            </h4>
                            <div className="space-y-2">
                              {getIndicatorGuide(indicator.indicator)?.ranges.map((range, rangeIndex) => (
                                <div 
                                  key={rangeIndex}
                                  className={`p-3 rounded-lg border ${getRangeColor(range.color)}`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="font-medium text-sm min-w-0 flex-shrink-0">
                                      {range.range}
                                    </div>
                                    <div className="text-sm flex-1">
                                      {range.description}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="text-xs text-blue-600 opacity-75 flex items-center gap-1 mt-3">
                              <span>📊</span>
                              <span>{t('macro.dataBasedOnHistory')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="policies">
          <div className="space-y-6">
            {policies.map((policy, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Home className="h-5 w-5" />
                        {policy.bank}
                      </CardTitle>
                      <CardDescription>{policy.country}</CardDescription>
                    </div>
                    <Badge className={getPolicyColor(policy.policy)}>
                      {policy.policy === 'hawkish' ? t('macro.hawkish') : 
                       policy.policy === 'dovish' ? t('macro.dovish') : t('macro.neutral')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">{t('macro.interestRate')}</p>
                      <p className="text-2xl font-bold">{policy.interestRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('macro.lastChange')}</p>
                      <p className="font-medium">
                        {new Date(policy.lastChange).toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : 'en-US')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('macro.nextMeeting')}</p>
                      <p className="font-medium">
                        {policy.nextMeetingDate ? 
                         new Date(policy.nextMeetingDate).toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : 'en-US') : 
                         t('macro.unknown')}
                      </p>
                    </div>
                  </div>
                  <Alert>
                    <AlertDescription>{policy.statement}</AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t('macro.upcomingEvents')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {calendar.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getImportanceColor(event.importance)}>
                          {event.importance === 'high' ? t('macro.high') : 
                           event.importance === 'medium' ? t('macro.medium') : t('macro.low')}
                        </Badge>
                        <span className="text-sm text-gray-600">{event.country}</span>
                      </div>
                      <h3 className="font-medium">{event.event}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(event.date).toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : 'en-US')}
                      </p>
                    </div>
                    <div className="text-right">
                      {event.forecast && (
                        <div className="text-sm">
                          <span className="text-gray-600">{t('macro.forecast')}: </span>
                          <span className="font-medium">{event.forecast}</span>
                        </div>
                      )}
                      {event.previous && (
                        <div className="text-sm">
                          <span className="text-gray-600">{t('macro.previous')}: </span>
                          <span>{event.previous}</span>
                        </div>
                      )}
                      {event.actual && (
                        <div className="text-sm">
                          <span className="text-gray-600">{t('macro.actual')}: </span>
                          <span className="font-medium">{event.actual}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('macro.economicCycleAnalysis')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span>{t('macro.economicGrowthMomentum')}</span>
                      <span className="text-green-600">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span>{t('macro.inflationPressure')}</span>
                      <span className="text-yellow-600">60%</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span>{t('macro.laborMarketHealth')}</span>
                      <span className="text-green-600">80%</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span>{t('macro.monetaryPolicyTightness')}</span>
                      <span className="text-red-600">70%</span>
                    </div>
                    <Progress value={70} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('macro.regionalEconomicComparison')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">{t('macro.usa')}</h3>
                    <div className="text-2xl font-bold text-green-600">{t('macro.stable')}</div>
                    <p className="text-sm text-gray-600 mt-1">
                      {t('macro.strongEmploymentControlledInflation')}
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">{t('macro.europe')}</h3>
                    <div className="text-2xl font-bold text-yellow-600">{t('macro.cautious')}</div>
                    <p className="text-sm text-gray-600 mt-1">
                      {t('macro.slowGrowthEnergyPressure')}
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">{t('macro.china')}</h3>
                    <div className="text-2xl font-bold text-yellow-600">{t('macro.recovery')}</div>
                    <p className="text-sm text-gray-600 mt-1">
                      {t('macro.policySupportDomesticImprovement')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
