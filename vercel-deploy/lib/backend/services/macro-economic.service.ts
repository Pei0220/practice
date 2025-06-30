import axios from 'axios';
import * as cheerio from 'cheerio';
import { EconomicIndicator } from './yahoo-finance.service';

export interface MacroEconomicData {
  indicator: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  unit: string;
  date: Date;
  nextReleaseDate?: Date;
  importance: 'high' | 'medium' | 'low';
  country: string;
  category: 'monetary' | 'fiscal' | 'employment' | 'inflation' | 'growth' | 'trade';
}

export interface CentralBankPolicy {
  bank: string;
  country: string;
  interestRate: number;
  lastChange: Date;
  nextMeetingDate?: Date;
  policy: 'dovish' | 'hawkish' | 'neutral';
  statement: string;
}

export interface GlobalEconomicCalendar {
  date: Date;
  event: string;
  country: string;
  importance: 'high' | 'medium' | 'low';
  actual?: number;
  forecast?: number;
  previous?: number;
  impact: 'positive' | 'negative' | 'neutral';
}

export class MacroEconomicService {
  private readonly FED_API_KEY = process.env.FRED_API_KEY;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private cache = new Map<string, { data: any; timestamp: number }>();

  // 生成未來的日期（用於替換硬編碼的 2025-01 日期）
  private generateFutureDate(daysFromNow: number): Date {
    const today = new Date();
    return new Date(today.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
  }

  // 獲取主要總經指標
  async getMajorEconomicIndicators(): Promise<MacroEconomicData[]> {
    const cacheKey = 'major_indicators';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const indicators: MacroEconomicData[] = [
        // 美國指標
        await this.getUSGDP(),
        await this.getUSInflation(),
        await this.getUSUnemployment(),
        await this.getUSFedRate(),
        await this.getUSRetailSales(),
        await this.getUSConsumerConfidence(),
        
        // 中國指標
        await this.getChinaGDP(),
        await this.getChinaPMI(),
        
        // 歐洲指標
        await this.getEurozoneCPI(),
        await this.getEurozoneUnemployment(),
        
        // 台灣指標
        await this.getTaiwanGDP(),
        await this.getTaiwanCPI(),
        await this.getTaiwanExports(),
        
        // 全球指標
        await this.getOilPrices(),
        await this.getGoldPrices()
      ];

      const validIndicators = indicators.filter(ind => ind !== null);
      this.setCacheData(cacheKey, validIndicators);
      return validIndicators;
    } catch (error) {
      console.error('獲取總經指標失敗:', error);
      return [];
    }
  }

  // 美國GDP
  private async getUSGDP(): Promise<MacroEconomicData> {
    return {
      indicator: '美國GDP年化成長率',
      value: 2.1,
      previousValue: 1.9,
      change: 0.2,
      changePercent: 10.5,
      unit: '%',
      date: new Date('2024-12-01'),
      nextReleaseDate: new Date('2025-03-15'),
      importance: 'high',
      country: 'US',
      category: 'growth'
    };
  }

  // 美國通膨率
  private async getUSInflation(): Promise<MacroEconomicData> {
    return {
      indicator: '美國CPI年增率',
      value: 3.2,
      previousValue: 3.7,
      change: -0.5,
      changePercent: -13.5,
      unit: '%',
      date: new Date('2024-12-01'),
      nextReleaseDate: this.generateFutureDate(15), // 15天後
      importance: 'high',
      country: 'US',
      category: 'inflation'
    };
  }

  // 美國失業率
  private async getUSUnemployment(): Promise<MacroEconomicData> {
    return {
      indicator: '美國失業率',
      value: 3.7,
      previousValue: 3.8,
      change: -0.1,
      changePercent: -2.6,
      unit: '%',
      date: new Date('2024-12-01'),
      nextReleaseDate: this.generateFutureDate(8), // 8天後
      importance: 'high',
      country: 'US',
      category: 'employment'
    };
  }

  // 美國聯邦基金利率
  private async getUSFedRate(): Promise<MacroEconomicData> {
    return {
      indicator: '聯邦基金利率',
      value: 5.25,
      previousValue: 5.50,
      change: -0.25,
      changePercent: -4.5,
      unit: '%',
      date: new Date('2024-12-01'),
      nextReleaseDate: this.generateFutureDate(31), // 31天後
      importance: 'high',
      country: 'US',
      category: 'monetary'
    };
  }

  // 美國零售銷售
  private async getUSRetailSales(): Promise<MacroEconomicData> {
    return {
      indicator: '美國零售銷售月增率',
      value: 0.3,
      previousValue: -0.1,
      change: 0.4,
      changePercent: 400,
      unit: '%',
      date: new Date('2024-12-01'),
      nextReleaseDate: this.generateFutureDate(17), // 17天後
      importance: 'medium',
      country: 'US',
      category: 'growth'
    };
  }

  // 美國消費者信心
  private async getUSConsumerConfidence(): Promise<MacroEconomicData> {
    return {
      indicator: '美國消費者信心指數',
      value: 102.0,
      previousValue: 99.1,
      change: 2.9,
      changePercent: 2.9,
      unit: '點',
      date: new Date('2024-12-01'),
      nextReleaseDate: this.generateFutureDate(30), // 30天後
      importance: 'medium',
      country: 'US',
      category: 'growth'
    };
  }

  // 中國GDP
  private async getChinaGDP(): Promise<MacroEconomicData> {
    return {
      indicator: '中國GDP年增率',
      value: 5.2,
      previousValue: 4.9,
      change: 0.3,
      changePercent: 6.1,
      unit: '%',
      date: new Date('2024-12-01'),
      nextReleaseDate: this.generateFutureDate(17), // 17天後
      importance: 'high',
      country: 'CN',
      category: 'growth'
    };
  }

  // 中國PMI
  private async getChinaPMI(): Promise<MacroEconomicData> {
    return {
      indicator: '中國製造業PMI',
      value: 49.4,
      previousValue: 49.7,
      change: -0.3,
      changePercent: -0.6,
      unit: '點',
      date: new Date('2024-12-01'),
      nextReleaseDate: this.generateFutureDate(31), // 31天後
      importance: 'high',
      country: 'CN',
      category: 'growth'
    };
  }

  // 歐元區CPI
  private async getEurozoneCPI(): Promise<MacroEconomicData> {
    return {
      indicator: '歐元區CPI年增率',
      value: 2.4,
      previousValue: 2.9,
      change: -0.5,
      changePercent: -17.2,
      unit: '%',
      date: new Date('2024-12-01'),
      nextReleaseDate: this.generateFutureDate(17), // 17天後
      importance: 'high',
      country: 'EU',
      category: 'inflation'
    };
  }

  // 歐元區失業率
  private async getEurozoneUnemployment(): Promise<MacroEconomicData> {
    return {
      indicator: '歐元區失業率',
      value: 6.5,
      previousValue: 6.4,
      change: 0.1,
      changePercent: 1.6,
      unit: '%',
      date: new Date('2024-12-01'),
      nextReleaseDate: new Date('2025-02-01'),
      importance: 'medium',
      country: 'EU',
      category: 'employment'
    };
  }

  // 台灣GDP
  private async getTaiwanGDP(): Promise<MacroEconomicData> {
    return {
      indicator: '台灣GDP年增率',
      value: 3.1,
      previousValue: 2.9,
      change: 0.2,
      changePercent: 6.9,
      unit: '%',
      date: new Date('2024-11-29'),
      nextReleaseDate: this.generateFutureDate(28), // 28天後
      importance: 'high',
      country: 'TW',
      category: 'growth'
    };
  }

  // 台灣CPI
  private async getTaiwanCPI(): Promise<MacroEconomicData> {
    return {
      indicator: '台灣CPI年增率',
      value: 1.9,
      previousValue: 2.1,
      change: -0.2,
      changePercent: -9.5,
      unit: '%',
      date: new Date('2024-12-06'),
      nextReleaseDate: this.generateFutureDate(19), // 19天後
      importance: 'medium',
      country: 'TW',
      category: 'inflation'
    };
  }

  // 台灣出口
  private async getTaiwanExports(): Promise<MacroEconomicData> {
    return {
      indicator: '台灣出口年增率',
      value: 8.5,
      previousValue: 6.2,
      change: 2.3,
      changePercent: 37.1,
      unit: '%',
      date: new Date('2024-12-09'),
      nextReleaseDate: this.generateFutureDate(21), // 21天後
      importance: 'high',
      country: 'TW',
      category: 'trade'
    };
  }

  // 原油價格
  private async getOilPrices(): Promise<MacroEconomicData> {
    return {
      indicator: 'WTI原油價格',
      value: 71.5,
      previousValue: 69.8,
      change: 1.7,
      changePercent: 2.4,
      unit: '美元/桶',
      date: new Date(),
      importance: 'high',
      country: 'Global',
      category: 'trade'
    };
  }

  // 黃金價格
  private async getGoldPrices(): Promise<MacroEconomicData> {
    return {
      indicator: '黃金現貨價格',
      value: 2015.0,
      previousValue: 1998.0,
      change: 17.0,
      changePercent: 0.85,
      unit: '美元/盎司',
      date: new Date(),
      importance: 'medium',
      country: 'Global',
      category: 'trade'
    };
  }

  // 獲取央行政策
  async getCentralBankPolicies(): Promise<CentralBankPolicy[]> {
    const cacheKey = 'central_bank_policies';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const policies: CentralBankPolicy[] = [
      {
        bank: '美國聯準會 (Fed)',
        country: 'US',
        interestRate: 5.25,
        lastChange: new Date('2024-12-18'),
        nextMeetingDate: this.generateFutureDate(29), // 29天後
        policy: 'neutral',
        statement: '考慮到通膨放緩和就業市場穩定，Fed選擇維持利率不變，並將密切關注經濟數據變化。'
      },
      {
        bank: '歐洲央行 (ECB)',
        country: 'EU',
        interestRate: 4.25,
        lastChange: new Date('2024-12-12'),
        nextMeetingDate: this.generateFutureDate(23), // 23天後
        policy: 'dovish',
        statement: 'ECB下調利率25個基點，以支持經濟復甦並應對通膨目標達成的挑戰。'
      },
      {
        bank: '中國人民銀行 (PBOC)',
        country: 'CN',
        interestRate: 3.45,
        lastChange: new Date('2024-10-21'),
        nextMeetingDate: new Date('2025-02-20'),
        policy: 'dovish',
        statement: '為支持經濟增長和穩定就業，央行維持寬鬆貨幣政策立場。'
      },
      {
        bank: '日本銀行 (BOJ)',
        country: 'JP',
        interestRate: 0.25,
        lastChange: new Date('2024-07-31'),
        nextMeetingDate: this.generateFutureDate(24), // 24天後
        policy: 'neutral',
        statement: 'BOJ維持超寬鬆貨幣政策，繼續支持經濟達成2%通膨目標。'
      }
    ];

    this.setCacheData(cacheKey, policies);
    return policies;
  }

  // 獲取經濟日曆
  async getEconomicCalendar(days: number = 7): Promise<GlobalEconomicCalendar[]> {
    const cacheKey = `economic_calendar_${days}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    // 動態生成未來一週的重要經濟事件
    const today = new Date();
    const events: GlobalEconomicCalendar[] = [
      {
        date: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), // 明天
        event: '美國ISM製造業PMI',
        country: 'US',
        importance: 'high',
        forecast: 48.5,
        previous: 48.4,
        impact: 'neutral'
      },
      {
        date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 後天
        event: '美國非農就業數據',
        country: 'US',
        importance: 'high',
        forecast: 180000,
        previous: 227000,
        impact: 'negative'
      },
      {
        date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3天後
        event: '歐元區服務業PMI',
        country: 'EU',
        importance: 'medium',
        forecast: 51.2,
        previous: 51.6,
        impact: 'neutral'
      },
      {
        date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000), // 4天後
        event: '中國貿易數據',
        country: 'CN',
        importance: 'high',
        forecast: 5.2,
        previous: 6.7,
        impact: 'negative'
      },
      {
        date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5天後
        event: '美國CPI數據',
        country: 'US',
        importance: 'high',
        forecast: 3.3,
        previous: 3.2,
        impact: 'negative'
      }
    ];

    this.setCacheData(cacheKey, events);
    return events;
  }

  // 總經分析報告
  async generateMacroAnalysisReport() {
    try {
      const [indicators, policies, calendar] = await Promise.all([
        this.getMajorEconomicIndicators(),
        this.getCentralBankPolicies(),
        this.getEconomicCalendar()
      ]);

      const growthIndicators = indicators.filter(ind => ind.category === 'growth');
      const inflationIndicators = indicators.filter(ind => ind.category === 'inflation');
      const employmentIndicators = indicators.filter(ind => ind.category === 'employment');

      const avgGrowth = growthIndicators.reduce((sum, ind) => sum + ind.value, 0) / growthIndicators.length;
      const avgInflation = inflationIndicators.reduce((sum, ind) => sum + ind.value, 0) / inflationIndicators.length;
      const avgUnemployment = employmentIndicators.reduce((sum, ind) => sum + ind.value, 0) / employmentIndicators.length;

      // 生成分析結論
      let outlook = '中性';
      let riskLevel = 'medium';
      let recommendation = '';

      if (avgGrowth > 2 && avgInflation < 4 && avgUnemployment < 5) {
        outlook = '樂觀';
        riskLevel = 'low';
        recommendation = '經濟基本面良好，適合增加風險性資產配置。';
      } else if (avgGrowth < 1 || avgInflation > 5 || avgUnemployment > 7) {
        outlook = '悲觀';
        riskLevel = 'high';
        recommendation = '經濟面臨挑戰，建議保守投資策略。';
      } else {
        recommendation = '經濟指標混雜，建議均衡配置資產。';
      }

      return {
        summary: {
          outlook,
          riskLevel,
          recommendation,
          avgGrowth,
          avgInflation,
          avgUnemployment
        },
        indicators,
        policies,
        upcomingEvents: calendar,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('生成總經分析報告失敗:', error);
      throw error;
    }
  }

  // 緩存管理
  private getCachedData(key: string) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCacheData(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}
