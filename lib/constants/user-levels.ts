import { UserLevelConfig, UserLevel } from '../types/user'

/**
 * 用戶身份等級配置
 */
export const USER_LEVEL_CONFIGS: Record<UserLevel, UserLevelConfig> = {
  beginner: {
    name: '初級用戶',
    description: '對經濟學有基本興趣，希望學習基礎概念',
    features: [
      '簡單易懂的解釋',
      '豐富的生活化例子',
      '基礎概念教學',
      '圖表輔助說明'
    ],
    aiConfig: {
      level: 'beginner',
      maxTokens: 800,
      temperature: 0.7,
      complexity: 'simple',
      terminology: 'basic',
      examples: true,
      charts: true
    }
  },
  intermediate: {
    name: '中級用戶',
    description: '具備一定經濟學基礎，希望深入了解經濟趨勢',
    features: [
      '適度專業的分析',
      '趨勢解讀',
      '政策影響分析',
      '投資建議'
    ],
    aiConfig: {
      level: 'intermediate',
      maxTokens: 1000,
      temperature: 0.6,
      complexity: 'moderate',
      terminology: 'professional',
      examples: true,
      charts: true
    }
  },
  advanced: {
    name: '高級用戶',
    description: '經濟學專業人士或資深投資者',
    features: [
      '深度經濟分析',
      '複雜模型解釋',
      '預測方法論',
      '專業術語使用'
    ],
    aiConfig: {
      level: 'advanced',
      maxTokens: 1200,
      temperature: 0.5,
      complexity: 'complex',
      terminology: 'expert',
      examples: false,
      charts: true
    }
  }
}

/**
 * AI提示詞模板
 */
export const AI_PROMPT_TEMPLATES = {
  beginner: {
    systemPrompt: `你是一位親切的經濟學老師，專門為初學者解釋經濟概念。請：
- 使用簡單易懂的語言
- 提供生活化的例子和比喻
- 避免複雜的專業術語
- 保持友善和鼓勵的語調
- 回答控制在150-200字內`,
    
    responseStyle: '就像在跟朋友聊天一樣，用最簡單的方式解釋'
  },
  
  intermediate: {
    systemPrompt: `你是一位經驗豐富的經濟分析師，為有一定基礎的用戶提供分析。請：
- 使用適度的專業術語
- 提供趨勢分析和預測
- 結合實際案例說明
- 給出實用的投資建議
- 回答控制在200-300字內`,
    
    responseStyle: '專業但易懂，結合理論與實務'
  },
  
  advanced: {
    systemPrompt: `你是一位頂級經濟學家，為專業人士提供深度分析。請：
- 使用精確的專業術語
- 提供深入的理論分析
- 討論複雜的經濟模型
- 引用相關研究和數據
- 回答控制在300-400字內`,
    
    responseStyle: '高度專業，深度分析，專家水準'
  }
}

/**
 * 用戶等級選項
 */
export const USER_LEVEL_OPTIONS = [
  {
    value: 'beginner' as UserLevel,
    label: '初級用戶',
    icon: '🌱',
    description: '經濟學新手，希望學習基礎知識'
  },
  {
    value: 'intermediate' as UserLevel,
    label: '中級用戶', 
    icon: '📈',
    description: '有一定基礎，希望深入了解'
  },
  {
    value: 'advanced' as UserLevel,
    label: '高級用戶',
    icon: '🎓',
    description: '專業人士或資深投資者'
  }
]
