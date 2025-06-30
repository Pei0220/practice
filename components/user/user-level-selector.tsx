"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, User, TrendingUp, Star } from 'lucide-react'
import { UserLevel } from '@/lib/types/user'
import { USER_LEVEL_OPTIONS, USER_LEVEL_CONFIGS } from '@/lib/constants/user-levels'

interface UserLevelSelectorProps {
  selectedLevel?: UserLevel
  onLevelChange: (level: UserLevel) => void
  className?: string
}

export function UserLevelSelector({ 
  selectedLevel, 
  onLevelChange, 
  className = "" 
}: UserLevelSelectorProps) {
  const [hoveredLevel, setHoveredLevel] = useState<UserLevel | null>(null)

  const getIcon = (level: UserLevel) => {
    switch (level) {
      case 'beginner':
        return <User className="h-8 w-8" />
      case 'intermediate':
        return <TrendingUp className="h-8 w-8" />
      case 'advanced':
        return <Star className="h-8 w-8" />
    }
  }

  const getColor = (level: UserLevel) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-50 border-green-200 hover:bg-green-100'
      case 'intermediate':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100'
      case 'advanced':
        return 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    }
  }

  const getSelectedColor = (level: UserLevel) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 border-green-300 ring-2 ring-green-200'
      case 'intermediate':
        return 'bg-blue-100 border-blue-300 ring-2 ring-blue-200'
      case 'advanced':
        return 'bg-purple-100 border-purple-300 ring-2 ring-purple-200'
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          選擇您的經濟學程度
        </h3>
        <p className="text-sm text-gray-600">
          我們會根據您的程度提供最適合的AI回應風格
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {USER_LEVEL_OPTIONS.map((option) => {
          const config = USER_LEVEL_CONFIGS[option.value]
          const isSelected = selectedLevel === option.value
          const isHovered = hoveredLevel === option.value

          return (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? getSelectedColor(option.value)
                  : getColor(option.value)
              }`}
              onMouseEnter={() => setHoveredLevel(option.value)}
              onMouseLeave={() => setHoveredLevel(null)}
              onClick={() => onLevelChange(option.value)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      isSelected || isHovered 
                        ? 'bg-white shadow-sm' 
                        : 'bg-gray-50'
                    }`}>
                      {getIcon(option.value)}
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="text-2xl">{option.icon}</span>
                        {option.label}
                      </CardTitle>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="p-1 bg-green-500 rounded-full">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-3">
                  {option.description}
                </p>
                
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-600">
                    AI回應特色：
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {config.features.slice(0, 2).map((feature, index) => (
                      <Badge 
                        key={index}
                        className="text-xs px-2 py-1 bg-white/50"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selectedLevel && (
        <Card className="bg-gray-50">
          <CardContent className="pt-4">
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-2">
                已選擇：{USER_LEVEL_CONFIGS[selectedLevel].name}
              </p>
              <p>{USER_LEVEL_CONFIGS[selectedLevel].description}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
