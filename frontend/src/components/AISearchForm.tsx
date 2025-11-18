'use client'

import { useState } from 'react'

interface AISearchFormProps {
  onSearch: (query: string, minRating: number, minReviews: number) => void
  isLoading?: boolean
}

export default function AISearchForm({ onSearch, isLoading = false }: AISearchFormProps) {
  const [query, setQuery] = useState('')
  const [minRating, setMinRating] = useState(4.3)
  const [minReviews, setMinReviews] = useState(500)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!query.trim()) {
      alert('검색어를 입력해주세요')
      return
    }
    
    onSearch(query.trim(), minRating, minReviews)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="ai-query" className="block text-sm font-medium text-gray-700 mb-2">
          자연어 검색 🤖
        </label>
        <input
          type="text"
          id="ai-query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="예: 로마 피자 맛집, 도쿄 라멘집, 파리 카페"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500 mt-1">
          💡 한국어로 자유롭게 입력하세요. AI가 자동으로 분석합니다!
        </p>
      </div>

      <div>
        <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
          최소 평점: {minRating.toFixed(1)}
        </label>
        <input
          type="range"
          id="rating"
          min="0"
          max="5"
          step="0.1"
          value={minRating}
          onChange={(e) => setMinRating(parseFloat(e.target.value))}
          className="w-full"
          disabled={isLoading}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0.0</span>
          <span>5.0</span>
        </div>
      </div>

      <div>
        <label htmlFor="reviews" className="block text-sm font-medium text-gray-700 mb-2">
          최소 리뷰 개수: {minReviews.toLocaleString()}개
        </label>
        <input
          type="range"
          id="reviews"
          min="0"
          max="2000"
          step="50"
          value={minReviews}
          onChange={(e) => setMinReviews(parseInt(e.target.value))}
          className="w-full"
          disabled={isLoading}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>2000+</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? 'AI가 분석 중...' : '🤖 AI 검색'}
      </button>
    </form>
  )
}

