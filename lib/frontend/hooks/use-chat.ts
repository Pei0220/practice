import { useState, useCallback, useRef } from 'react'
import { 
  ChatMessage, 
  ChatRequest,
  ChatResponse, 
  AIInsight,
  APIResponse 
} from '../../shared/types'
import { UserLevel } from '../../types/user'

export interface UseChatProps {
  sessionId?: string
  maxMessages?: number
  userLevel?: UserLevel
}

export interface UseChatReturn {
  messages: ChatMessage[]
  loading: boolean
  error: string | null
  sessionId: string
  sendMessage: (message: string) => Promise<void>
  clearChat: () => void
  regenerateLastResponse: () => Promise<void>
}

/**
 * AI 聊天功能管理 Hook
 * 處理與 AI 的對話、意圖識別和回應管理
 */
export const useChat = ({ 
  sessionId: initialSessionId, 
  maxMessages = 50,
  userLevel = 'intermediate'
}: UseChatProps = {}): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sessionIdRef = useRef(initialSessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || loading) return

    setLoading(true)
    setError(null)

    // 添加用戶消息
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      content,
      sender: 'user',
      role: 'user',
      timestamp: new Date(),
    }

    setMessages((prev: ChatMessage[]) => [...prev, userMessage])

    try {
      const request: ChatRequest = {
        message: content,
        sessionId: sessionIdRef.current,
        context: {
          previousMessages: messages.slice(-10) // 最近10條消息作為上下文
        }
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          userLevel
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: APIResponse<ChatResponse> = await response.json()
      
      if (result.success && result.data) {
        const assistantMessage: ChatMessage = {
          id: `msg_${Date.now()}_assistant`,
          content: result.data.message.content,
          sender: 'ai',
          role: 'assistant',
          timestamp: new Date(),
          metadata: result.data.message.metadata,
        }

        setMessages((prev: ChatMessage[]) => {
          const newMessages = [...prev, assistantMessage]
          // 限制消息數量
          return newMessages.length > maxMessages 
            ? newMessages.slice(-maxMessages) 
            : newMessages
        })
      } else {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || '聊天回應失敗'
        throw new Error(errorMessage)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知錯誤')
      console.error('Chat error:', err)
      
      // 添加錯誤消息
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        content: '抱歉，我現在無法回應。請稍後再試。',
        sender: 'ai',
        role: 'assistant',
        timestamp: new Date(),
        metadata: { sources: ['error'] },
      }
      setMessages((prev: ChatMessage[]) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }, [loading, maxMessages])

  const regenerateLastResponse = useCallback(async () => {
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user')
    if (lastUserMessage) {
      // 移除最後的助手回應
      setMessages(prev => {
        const lastAssistantIndex = prev.map(m => m.role).lastIndexOf('assistant')
        if (lastAssistantIndex !== -1) {
          return prev.slice(0, lastAssistantIndex)
        }
        return prev
      })
      
      await sendMessage(lastUserMessage.content)
    }
  }, [messages, sendMessage])

  const clearChat = useCallback(() => {
    setMessages([])
    setError(null)
    sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

  return {
    messages,
    loading,
    error,
    sessionId: sessionIdRef.current,
    sendMessage,
    clearChat,
    regenerateLastResponse,
  }
}

/**
 * AI 洞察管理 Hook
 */
export const useAIInsights = () => {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateInsight = useCallback(async (indicator: string, type: string = 'summary') => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ indicator, type }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: APIResponse<AIInsight> = await response.json()
      
      if (result.success && result.data) {
        setInsights(prev => [result.data!, ...prev.slice(0, 9)]) // 保留最近 10 個洞察
      } else {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || 'AI 洞察生成失敗'
        throw new Error(errorMessage)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知錯誤')
      console.error('AI insight error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const getLatestInsights = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/insights')
      const result: APIResponse<AIInsight[]> = await response.json()
      
      if (result.success && result.data) {
        setInsights(result.data)
      } else {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || '洞察獲取失敗'
        throw new Error(errorMessage)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知錯誤')
      console.error('Get insights error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearInsights = useCallback(() => {
    setInsights([])
    setError(null)
  }, [])

  return {
    insights,
    loading,
    error,
    generateInsight,
    getLatestInsights,
    clearInsights,
  }
}
