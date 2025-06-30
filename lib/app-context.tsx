'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Language, getTranslation } from '@/lib/i18n';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  theme: string | undefined;
  setTheme: (theme: string) => void;
}

// 簡化版本，不使用 createContext
export function useApp() {
  const [language, setLanguage] = useState<Language>('zh-TW');
  const { theme, setTheme } = useTheme();

  // Load language from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language') as Language;
      if (savedLang && (savedLang === 'zh-TW' || savedLang === 'en')) {
        setLanguage(savedLang);
      }
    }
  }, []);

  // Save language to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);
    }
  }, [language]);

  const t = (key: string) => getTranslation(language, key);

  return { language, setLanguage, t, theme, setTheme };
}
