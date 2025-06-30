'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  MessageSquare, 
  BarChart3, 
  TrendingUp, 
  Menu,
  X,
  DollarSign,
  Globe,
  Moon,
  Sun
} from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/lib/app-context';

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, theme, setTheme } = useApp();

  const navigation = [
    { name: t('nav.home'), href: '/', icon: Home },
    { name: t('nav.market'), href: '/market', icon: TrendingUp },
    { name: t('nav.stock'), href: '/stock', icon: DollarSign },
    { name: t('nav.macro'), href: '/macro', icon: BarChart3 },
    { name: t('nav.chat'), href: '/chat', icon: MessageSquare },
  ];

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
                經濟趨勢通
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || 
                  (item.href !== '/' && pathname.startsWith(item.href));
                
                return (
                  <Link
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-2">
            {/* Theme Toggle */}
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 mr-2" />
                  {t('nav.lightMode')}
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 mr-2" />
                  {t('nav.darkMode')}
                </>
              )}
            </Button>
          </div>

          <div className="sm:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href));
              
              return (
                <Link
                  href={item.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ${
                    isActive
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Icon className="w-4 h-4 mr-3" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
            
            {/* Mobile controls */}
            <div className="pt-2 space-y-2 px-3">
              <Button variant="outline" size="sm" onClick={toggleTheme} className="w-full justify-start">
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 mr-2" />
                    {t('nav.lightMode')}
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 mr-2" />
                    {t('nav.darkMode')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
