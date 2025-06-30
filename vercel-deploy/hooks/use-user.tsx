"use client"

import { useState, useEffect } from 'react'
import { UserLevel, UserProfile } from '@/lib/types/user'

// 簡化版本：只使用 useState 和 localStorage
export function useUser() {
  const [userLevel, setUserLevelState] = useState<UserLevel>('intermediate')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLevelSelected, setIsLevelSelected] = useState(false)

  // 從 localStorage 載入用戶設定
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLevel = localStorage.getItem('userLevel') as UserLevel
      const savedProfile = localStorage.getItem('userProfile')
      
      if (savedLevel && ['beginner', 'intermediate', 'advanced'].includes(savedLevel)) {
        setUserLevelState(savedLevel)
        setIsLevelSelected(true)
      }
      
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile)
          setUserProfile(profile)
        } catch (error) {
          console.error('解析用戶檔案失敗:', error)
        }
      }
    }
  }, [])

  const setUserLevel = (level: UserLevel) => {
    setUserLevelState(level)
    setIsLevelSelected(true)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('userLevel', level)
    }
  }

  const handleSetUserProfile = (profile: UserProfile | null) => {
    setUserProfile(profile)
    
    if (typeof window !== 'undefined') {
      if (profile) {
        localStorage.setItem('userProfile', JSON.stringify(profile))
      } else {
        localStorage.removeItem('userProfile')
      }
    }
  }

  return {
    userLevel,
    setUserLevel,
    userProfile,
    setUserProfile: handleSetUserProfile,
    isLevelSelected
  }
}
