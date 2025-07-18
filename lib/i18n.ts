export const translations = {
  'zh-TW': {
    // Navigation
    nav: {
      home: '首頁',
      market: '市場數據',
      stock: '股票查詢',
      macro: '總經分析',
      chat: 'AI 對話',
      globalMarket: '全球市場',
      darkMode: '深色模式',
      lightMode: '淺色模式',
      language: '語言',
    },
    
    // Home page
    home: {
      title: '經濟趨勢通',
      subtitle: '智能總經分析平台',
      description: '專業的總體經濟分析平台，整合經濟數據與AI分析，提供即時市場洞察與投資建議',
      marketData: '市場數據',
      marketDataDesc: '即時股市、匯率、商品價格',
      stockQuery: '股票查詢',
      stockQueryDesc: '查詢個股資訊與技術分析',
      macroAnalysis: '總經分析',
      macroAnalysisDesc: '總體經濟指標與政策分析',
      aiChat: 'AI 對話',
      aiChatDesc: '智能投資建議與市場解析',
      getStarted: '開始使用',
      realtimeInsights: '即時經濟數據洞察',
      aiDescription: '利用 AI 技術，為您提供最新的經濟指標分析、趨勢預測和投資建議',
      mainIndicators: '主要經濟指標',
      aiInsights: 'AI 洞察分析',
      userLevel: '用戶等級',
      selectLevel: '選擇等級',
      refresh: '重新整理',
      beginner: '初級',
      intermediate: '中級',
      advanced: '高級',
      setupUserLevel: '設定您的用戶等級',
      dataLoadFailed: '數據載入失敗',
      reload: '重新載入',
    },

    // Market page
    market: {
      title: '市場數據中心',
      description: '即時全球市場數據與分析',
      overview: '市場概覽',
      sentiment: '市場情緒',
      sectors: '行業表現',
      lastUpdate: '最後更新',
      refreshData: '刷新數據',
      price: '價格',
      change: '漲跌',
      volume: '成交量',
      marketCap: '市值',
      loading: '加載中...',
      error: '數據加載失敗',
      bullish: '看漲',
      bearish: '看跌',
      neutral: '中性',
      fearGreedIndex: '恐懼貪婪指數',
      vixLevel: 'VIX 指數',
      positiveNews: '正面消息',
      negativeNews: '負面消息',
      neutralNews: '中性消息',
      majorIndices: '主要指數',
      hotStocks: '熱門股票',
      cryptoCurrencies: '加密貨幣',
      majorPairs: '主要貨幣對',
      commodityPrices: '大宗商品價格',
    },

    // Stock page
    stock: {
      title: '股票查詢',
      description: '查詢個股即時價格與詳細分析',
      searchPlaceholder: '輸入股票代碼 (例如: AAPL, TSLA)',
      search: '查詢',
      hotStocks: '熱門股票',
      recentSearches: '最近搜尋',
      price: '價格',
      change: '漲跌',
      volume: '成交量',
      marketCap: '市值',
      high: '最高',
      low: '最低',
      open: '開盤',
      close: '收盤',
      peRatio: '本益比',
      dividendYield: '股息殖利率',
      high52Week: '52週最高',
      low52Week: '52週最低',
      loading: '查詢中...',
      error: '查詢失敗',
      notFound: '找不到該股票',
      stockNotFound: '找不到股票代碼',
      fetchFailed: '獲取股票數據失敗，請稍後再試',
      technology: '科技',
      financial: '金融',
      healthcare: '醫療',
      ev: '電動車',
      semiconductor: '半導體',
      consumer: '消費品',
      beverage: '飲料',
      retail: '零售',
      ecommerce: '電商',
    },

    // Macro page
    macro: {
      title: '總經分析',
      description: '總體經濟指標監控與政策分析',
      indicators: '經濟指標',
      policies: '央行政策',
      calendar: '經濟日曆',
      deepAnalysis: '深度分析',
      report: 'AI 報告',
      lastUpdate: '最後更新',
      refreshData: '刷新數據',
      loading: '載入總經數據中...',
      error: '數據加載失敗',
      retry: '重試',
      country: '國家',
      value: '數值',
      change: '變化',
      date: '日期',
      importance: '重要性',
      high: '高',
      medium: '中',
      low: '低',
      highImportance: '高重要性',
      mediumImportance: '中重要性',
      lowImportance: '低重要性',
      indicatorGuide: '指標解讀',
      hideGuide: '隱藏指標解讀',
      showGuide: '顯示指標解讀',
      closeGuide: '關閉指南',
      outlook: '展望',
      overallOutlook: '整體展望',
      riskLevel: '風險等級',
      highRisk: '高風險',
      lowRisk: '低風險',
      mediumRisk: '中等風險',
      recommendation: '建議',
      investmentAdvice: '投資建議',
      generateAiReport: '生成 AI 報告',
      upcomingEvents: '未來一週重要經濟事件',
      nextMeeting: '下次會議',
      unknown: '未知',
      interestRate: '利率',
      lastChange: '上次調整',
      policy: '政策傾向',
      statement: '聲明',
      dovish: '鴿派',
      hawkish: '鷹派',
      neutral: '中性',
      positive: '正面',
      negative: '負面',
      actual: '實際',
      forecast: '預測',
      previous: '前期',
      previousValue: '前值',
      category: '分類',
      generatedAt: '生成',
      optimistic: '樂觀',
      pessimistic: '悲觀',
      growthRate: '成長率',
      inflationRate: '通膨率',
      unemploymentRate: '失業率',
      referenceValues: '數值參考',
      dataBasedOnHistory: '根據歷史數據和經濟理論整理',
      taiwan: '台灣',
      usa: '美國',
      china: '中國',
      japan: '日本',
      europe: '歐洲',
      uk: '英國',
      canada: '加拿大',
      australia: '澳洲',
      unemployment: '失業率',
      gdp: 'GDP增長率',
      cpi: '消費者物價指數',
      ppi: '生產者物價指數',
      exports: '出口',
      imports: '進口',
      tradeBalance: '貿易餘額',
      macroReport: '總經分析報告',
      economicCycleAnalysis: '經濟週期分析',
      economicGrowthMomentum: '經濟成長動力',
      inflationPressure: '通膨壓力',
      laborMarketHealth: '就業市場健康度',
      monetaryPolicyTightness: '貨幣政策緊縮程度',
      regionalEconomicComparison: '地區經濟比較',
      stable: '穩健',
      cautious: '謹慎',
      recovery: '復甦',
      strongEmploymentControlledInflation: '就業市場強勁，通膨受控',
      slowGrowthEnergyPressure: '成長放緩，能源壓力持續',
      policySupportDomesticImprovement: '政策支撐，內需改善',
    },

    // Chat page
    chat: {
      title: 'AI 投資顧問',
      description: '智能分析師為您解答投資疑問',
      placeholder: '請輸入您的問題...',
      send: '發送',
      thinking: 'AI 思考中...',
      error: '回應失敗，請重試',
      aiAnalyst: 'AI 投資顧問',
      smartAnalysis: '智能分析師為您解答投資疑問',
      clearChat: '清除對話',
      sendMessage: '發送訊息',
    },

    // Common
    common: {
      loading: '加載中...',
      error: '發生錯誤',
      retry: '重試',
      close: '關閉',
      cancel: '取消',
      confirm: '確認',
      save: '保存',
      edit: '編輯',
      delete: '刪除',
      back: '返回',
      next: '下一步',
      previous: '上一步',
      today: '今天',
      yesterday: '昨天',
      thisWeek: '本週',
      thisMonth: '本月',
      noData: '暫無數據',
      tryAgain: '請稍後再試',
      up: '上漲',
      down: '下跌',
      stable: '持平',
    }
  },

  'en': {
    // Navigation
    nav: {
      home: 'Home',
      market: 'Market Data',
      stock: 'Stock Search',
      macro: 'Macro Analysis',
      chat: 'AI Chat',
      globalMarket: 'Global Market',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      language: 'Language',
    },
    
    // Home page
    home: {
      title: 'EconoTrends Insight',
      subtitle: 'Intelligent Macro Analysis Platform',
      description: 'Professional macroeconomic analysis platform integrating Yahoo Finance data with AI analysis for real-time market insights and investment advice',
      marketData: 'Market Data',
      marketDataDesc: 'Real-time stocks, FX, commodities',
      stockQuery: 'Stock Search',
      stockQueryDesc: 'Individual stock info & technical analysis',
      macroAnalysis: 'Macro Analysis',
      macroAnalysisDesc: 'Economic indicators & policy analysis',
      aiChat: 'AI Chat',
      aiChatDesc: 'Smart investment advice & market insights',
      getStarted: 'Get Started',
      realtimeInsights: 'Real-time Economic Data Insights',
      aiDescription: 'Leverage AI technology to provide you with the latest economic indicator analysis, trend forecasting and investment advice',
      mainIndicators: 'Key Economic Indicators',
      aiInsights: 'AI Insights Analysis',
      userLevel: 'User Level',
      selectLevel: 'Select Level',
      refresh: 'Refresh',
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      setupUserLevel: 'Set Your User Level',
      dataLoadFailed: 'Data Load Failed',
      reload: 'Reload',
    },

    // Market page
    market: {
      title: 'Market Data Center',
      description: 'Real-time global market data and analysis',
      overview: 'Market Overview',
      sentiment: 'Market Sentiment',
      sectors: 'Sector Performance',
      lastUpdate: 'Last Update',
      refreshData: 'Refresh Data',
      price: 'Price',
      change: 'Change',
      volume: 'Volume',
      marketCap: 'Market Cap',
      loading: 'Loading...',
      error: 'Failed to load data',
      bullish: 'Bullish',
      bearish: 'Bearish',
      neutral: 'Neutral',
      fearGreedIndex: 'Fear & Greed Index',
      vixLevel: 'VIX Level',
      positiveNews: 'Positive News',
      negativeNews: 'Negative News',
      neutralNews: 'Neutral News',
      majorIndices: 'Major Indices',
      hotStocks: 'Hot Stocks',
      cryptoCurrencies: 'Cryptocurrencies',
      majorPairs: 'Major Currency Pairs',
      commodityPrices: 'Commodity Prices',
    },

    // Stock page
    stock: {
      title: 'Stock Search',
      description: 'Search real-time stock prices and detailed analysis',
      searchPlaceholder: 'Enter stock symbol (e.g., AAPL, TSLA)',
      search: 'Search',
      hotStocks: 'Hot Stocks',
      recentSearches: 'Recent Searches',
      price: 'Price',
      change: 'Change',
      volume: 'Volume',
      marketCap: 'Market Cap',
      high: 'High',
      low: 'Low',
      open: 'Open',
      close: 'Close',
      peRatio: 'P/E Ratio',
      dividendYield: 'Dividend Yield',
      high52Week: '52W High',
      low52Week: '52W Low',
      loading: 'Searching...',
      error: 'Search failed',
      notFound: 'Stock not found',
      stockNotFound: 'Stock symbol not found',
      fetchFailed: 'Failed to fetch stock data, please try again later',
      technology: 'Technology',
      financial: 'Financial',
      healthcare: 'Healthcare',
      ev: 'Electric Vehicle',
      semiconductor: 'Semiconductor',
      consumer: 'Consumer Goods',
      beverage: 'Beverage',
      retail: 'Retail',
      ecommerce: 'E-commerce',
    },

    // Macro page
    macro: {
      title: 'Macro Analysis',
      description: 'Economic indicators monitoring and policy analysis',
      indicators: 'Economic Indicators',
      policies: 'Central Bank Policies',
      calendar: 'Economic Calendar',
      deepAnalysis: 'Deep Analysis',
      report: 'AI Report',
      lastUpdate: 'Last Update',
      refreshData: 'Refresh Data',
      loading: 'Loading macro data...',
      error: 'Failed to load data',
      retry: 'Retry',
      country: 'Country',
      value: 'Value',
      change: 'Change',
      date: 'Date',
      importance: 'Importance',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      highImportance: 'High Importance',
      mediumImportance: 'Medium Importance',
      lowImportance: 'Low Importance',
      indicatorGuide: 'Indicator Guide',
      hideGuide: 'Hide Indicator Guide',
      showGuide: 'Show Indicator Guide',
      closeGuide: 'Close Guide',
      outlook: 'Outlook',
      overallOutlook: 'Overall Outlook',
      riskLevel: 'Risk Level',
      highRisk: 'High Risk',
      lowRisk: 'Low Risk',
      mediumRisk: 'Medium Risk',
      recommendation: 'Recommendation',
      investmentAdvice: 'Investment Advice',
      generateAiReport: 'Generate AI Report',
      upcomingEvents: 'Upcoming Important Economic Events',
      nextMeeting: 'Next Meeting',
      unknown: 'Unknown',
      interestRate: 'Interest Rate',
      lastChange: 'Last Change',
      policy: 'Policy Stance',
      statement: 'Statement',
      dovish: 'Dovish',
      hawkish: 'Hawkish',
      neutral: 'Neutral',
      positive: 'Positive',
      negative: 'Negative',
      actual: 'Actual',
      forecast: 'Forecast',
      previous: 'Previous',
      previousValue: 'Previous Value',
      category: 'Category',
      generatedAt: 'Generated',
      optimistic: 'Optimistic',
      pessimistic: 'Pessimistic',
      growthRate: 'Growth Rate',
      inflationRate: 'Inflation Rate',
      unemploymentRate: 'Unemployment Rate',
      referenceValues: 'Reference Values',
      dataBasedOnHistory: 'Based on historical data and economic theory',
      taiwan: 'Taiwan',
      usa: 'United States',
      china: 'China',
      japan: 'Japan',
      europe: 'Europe',
      uk: 'United Kingdom',
      canada: 'Canada',
      australia: 'Australia',
      unemployment: 'Unemployment Rate',
      gdp: 'GDP Growth Rate',
      cpi: 'Consumer Price Index',
      ppi: 'Producer Price Index',
      exports: 'Exports',
      imports: 'Imports',
      tradeBalance: 'Trade Balance',
      macroReport: 'Macro Analysis Report',
      economicCycleAnalysis: 'Economic Cycle Analysis',
      economicGrowthMomentum: 'Economic Growth Momentum',
      inflationPressure: 'Inflation Pressure',
      laborMarketHealth: 'Labor Market Health',
      monetaryPolicyTightness: 'Monetary Policy Tightness',
      regionalEconomicComparison: 'Regional Economic Comparison',
      stable: 'Stable',
      cautious: 'Cautious',
      recovery: 'Recovery',
      strongEmploymentControlledInflation: 'Strong employment, controlled inflation',
      slowGrowthEnergyPressure: 'Slow growth, energy pressure continues',
      policySupportDomesticImprovement: 'Policy support, domestic improvement',
    },

    // Chat page
    chat: {
      title: 'AI Investment Advisor',
      description: 'Smart analyst to answer your investment questions',
      placeholder: 'Enter your question...',
      send: 'Send',
      thinking: 'AI is thinking...',
      error: 'Response failed, please try again',
      aiAnalyst: 'AI Investment Advisor',
      smartAnalysis: 'Smart analyst to answer your investment questions',
      clearChat: 'Clear Chat',
      sendMessage: 'Send Message',
    },

    // Common
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Retry',
      close: 'Close',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      today: 'Today',
      yesterday: 'Yesterday',
      thisWeek: 'This Week',
      thisMonth: 'This Month',
      noData: 'No Data',
      tryAgain: 'Please try again later',
      up: 'Up',
      down: 'Down',
      stable: 'Stable',
    }
  }
};

export type Language = 'zh-TW' | 'en';

export function getTranslation(lang: Language, key: string): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}
