"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, ArrowLeft, Lightbulb, AlertCircle, Users } from "lucide-react"
import Link from "next/link"
import { useChat } from "@/lib/frontend/hooks/use-chat"
import { UserLevelSelector } from "@/components/user/user-level-selector"
import { useUser } from "@/hooks/use-user"

const suggestedQuestions = [
  "目前物價怎麼樣？有升息可能嗎？",
  "失業率變高是好事還是壞事？",
  "GDP 成長率對股市有什麼影響？",
  "通膨對一般民眾生活的影響？",
  "央行升息會如何影響房市？",
  "經濟成長放緩的主要原因是什麼？",
  "如何判斷經濟衰退的信號？",
  "投資人應該關注哪些經濟指標？"
]

export default function ChatPage() {
  const [inputValue, setInputValue] = useState("")
  const [showLevelSelector, setShowLevelSelector] = useState(false)
  const { userLevel, setUserLevel, isLevelSelected } = useUser()
  const { 
    messages, 
    loading, 
    error, 
    sendMessage
  } = useChat({ userLevel })

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || loading) return

    setInputValue("")
    await sendMessage(content)
  }

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question)
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    handleSendMessage(inputValue)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回首頁
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <Bot className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">AI 經濟問答</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowLevelSelector(true)}
                className="flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>{isLevelSelected ? `${userLevel === 'beginner' ? '初級' : userLevel === 'intermediate' ? '中級' : '高級'}用戶` : '選擇等級'}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-800">聊天服務異常：{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Suggested Questions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  建議問題
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start h-auto min-h-[3rem] p-3 text-xs whitespace-normal leading-relaxed"
                    onClick={() => handleSuggestedQuestion(question)}
                    disabled={loading}
                  >
                    <span className="break-words text-left w-full">
                      {question}
                    </span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="h-5 w-5 mr-2 text-blue-600" />
                  經濟數據 AI 助手
                  <Badge className="ml-2 bg-green-50 text-green-700">線上</Badge>
                </CardTitle>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.sender === "ai" && <Bot className="h-4 w-4 mt-0.5 text-blue-600" />}
                        {message.sender === "user" && <User className="h-4 w-4 mt-0.5" />}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-line">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${message.sender === "user" ? "text-blue-100" : "text-gray-500"}`}
                          >
                            {message.timestamp.toLocaleTimeString("zh-TW")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4 text-blue-600" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              {/* Input */}
              <div className="p-4 border-t">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input
                    value={inputValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                    placeholder="請輸入您的問題..."
                    disabled={loading}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={loading || !inputValue.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* User Level Selector Modal */}
      {showLevelSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl mx-4 p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">設定您的用戶等級</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowLevelSelector(false)}
              >
                ✕
              </Button>
            </div>
            <UserLevelSelector 
              selectedLevel={userLevel}
              onLevelChange={(level) => {
                setUserLevel(level)
                setShowLevelSelector(false)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
