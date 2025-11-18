'use client'

import { useState } from 'react'

interface SearchFormProps {
  onSearch: (city: string, keyword: string, minRating: number, minReviews: number) => void
  isLoading?: boolean
}

export default function SearchForm({ onSearch, isLoading = false }: SearchFormProps) {
  const [city, setCity] = useState('')
  const [keyword, setKeyword] = useState('')
  const [minRating, setMinRating] = useState(4.3)
  const [minReviews, setMinReviews] = useState(500)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!city.trim() || !keyword.trim()) {
      alert('도시명과 키워드를 모두 입력해주세요')
      return
    }
    
    onSearch(city.trim(), keyword.trim(), minRating, minReviews)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
          도시명
        </label>
        <input
          type="text"
          id="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="예: Rome, Tokyo, Paris"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-2">
          키워드
        </label>
        <input
          type="text"
          id="keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="예: 카페, 맛집, 박물관, 레스토랑"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          disabled={isLoading}
        />
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
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? '검색 중...' : '장소 검색'}
      </button>
    </form>
  )
}

