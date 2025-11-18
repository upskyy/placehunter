'use client'

import { useState } from 'react'

interface Theme {
  id: string
  name: string
  icon: string
  description: string
}

interface ThemeFilterProps {
  onApplyTheme: (themeId: string) => void
  isLoading?: boolean
}

const themes: Theme[] = [
  {
    id: 'all',
    name: '전체',
    icon: '🌍',
    description: '모든 장소 보기',
  },
  {
    id: 'romantic',
    name: '로맨틱',
    icon: '💕',
    description: '데이트 코스',
  },
  {
    id: 'foodie',
    name: '맛집 투어',
    icon: '🍕',
    description: '로컬 맛집',
  },
  {
    id: 'instagram',
    name: '인스타',
    icon: '📸',
    description: '감성 카페',
  },
  {
    id: 'culture',
    name: '문화',
    icon: '🏛️',
    description: '역사 탐방',
  },
  {
    id: 'family',
    name: '가족',
    icon: '👨‍👩‍👧‍👦',
    description: '가족 여행',
  },
]

export default function ThemeFilter({ onApplyTheme, isLoading = false }: ThemeFilterProps) {
  const [selectedTheme, setSelectedTheme] = useState('all')

  const handleThemeClick = (themeId: string) => {
    setSelectedTheme(themeId)
    onApplyTheme(themeId)
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <span>🎭</span>
        <span>테마별 필터 (AI 추천)</span>
      </h3>
      <div className="flex flex-wrap gap-2">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeClick(theme.id)}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 ${
              selectedTheme === theme.id
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={theme.description}
          >
            <span className="mr-1">{theme.icon}</span>
            <span>{theme.name}</span>
          </button>
        ))}
      </div>
      {selectedTheme !== 'all' && (
        <p className="text-xs text-purple-600 mt-3">
          ✨ AI가 {themes.find(t => t.id === selectedTheme)?.name} 테마에 맞는 장소를 추천합니다
        </p>
      )}
    </div>
  )
}

