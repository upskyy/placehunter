'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SearchForm from '@/components/SearchForm'
import AISearchForm from '@/components/AISearchForm'
import TemplateSelector from '@/components/TemplateSelector'
import { parseNaturalLanguageQuery } from '@/lib/api'

type SearchMode = 'basic' | 'ai'

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [searchMode, setSearchMode] = useState<SearchMode>('basic')
  const [showTemplates, setShowTemplates] = useState(false)

  const handleSearch = async (city: string, keyword: string, minRating: number, minReviews: number) => {
    setIsLoading(true)
    // URL 파라미터로 전달하여 results 페이지로 이동
    const params = new URLSearchParams({
      city,
      keyword,
      minRating: minRating.toString(),
      minReviews: minReviews.toString()
    })
    router.push(`/results?${params.toString()}`)
  }

  const handleAISearch = async (query: string, minRating: number, minReviews: number) => {
    setIsLoading(true)

    try {
      // AI로 자연어 파싱
      const parsed = await parseNaturalLanguageQuery({ query })

      // 파싱된 결과로 검색
      const params = new URLSearchParams({
        city: parsed.city,
        keyword: parsed.keyword,
        minRating: minRating.toString(),
        minReviews: minReviews.toString(),
        originalQuery: parsed.original_query
      })
      router.push(`/results?${params.toString()}`)
    } catch (error: any) {
      setIsLoading(false)
      alert(error.response?.data?.detail || 'AI 검색 중 오류가 발생했습니다. OpenAI API 키를 확인해주세요.')
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    // 템플릿 정보에 따라 기본값 설정
    const templateConfig: Record<string, any> = {
      'half_day': { places: 3, minRating: 4.3, minReviews: 500 },
      'full_day': { places: 6, minRating: 4.3, minReviews: 500 },
      'two_days': { places: 10, minRating: 4.2, minReviews: 300 },
    }

    const config = templateConfig[templateId]
    const params = new URLSearchParams({
      template: templateId,
      minRating: config.minRating.toString(),
      minReviews: config.minReviews.toString(),
      maxResults: config.places.toString()
    })
    router.push(`/template?${params.toString()}`)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🌍 PlaceHunter
          </h1>
          <p className="text-xl text-gray-600">
            도시와 키워드만 입력하면 최고의 여행지를 찾아드립니다
          </p>
        </div>

        {/* Template Selector */}
        {showTemplates && (
          <div className="mb-8">
            <TemplateSelector onSelect={handleTemplateSelect} />
            <div className="text-center mt-4">
              <button
                onClick={() => setShowTemplates(false)}
                className="text-sm text-gray-500 hover:text-gray-700 transition"
              >
                직접 검색하기 →
              </button>
            </div>
          </div>
        )}

        {/* Search Form */}
        {!showTemplates && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-xl">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setSearchMode('basic')}
                  className={`flex-1 py-4 px-6 text-center font-semibold transition ${searchMode === 'basic'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  🔍 기본 검색
                </button>
                <button
                  onClick={() => setSearchMode('ai')}
                  className={`flex-1 py-4 px-6 text-center font-semibold transition ${searchMode === 'ai'
                      ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  🤖 AI 검색
                </button>
              </div>

              <div className="p-8">
                {searchMode === 'basic' ? (
                  <SearchForm onSearch={handleSearch} isLoading={isLoading} />
                ) : (
                  <AISearchForm onSearch={handleAISearch} isLoading={isLoading} />
                )}
              </div>
            </div>

            <div className="text-center mt-4">
              <button
                onClick={() => setShowTemplates(true)}
                className="text-sm text-gray-500 hover:text-gray-700 transition"
              >
                ← 템플릿으로 빠르게 시작하기
              </button>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-3xl mb-2">⏰</div>
            <h3 className="font-semibold text-gray-800 text-sm mb-1">시간 기반</h3>
            <p className="text-xs text-gray-600">
              타임라인 자동 생성
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-semibold text-gray-800 text-sm mb-1">예산 관리</h3>
            <p className="text-xs text-gray-600">
              총 예산 자동 계산
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🎭</div>
            <h3 className="font-semibold text-gray-800 text-sm mb-1">테마 추천</h3>
            <p className="text-xs text-gray-600">
              AI 큐레이션
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">📅</div>
            <h3 className="font-semibold text-gray-800 text-sm mb-1">템플릿</h3>
            <p className="text-xs text-gray-600">
              빠른 일정 생성
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🤖</div>
            <h3 className="font-semibold text-gray-800 text-sm mb-1">AI 가이드</h3>
            <p className="text-xs text-gray-600">
              여행 팁 제공
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

