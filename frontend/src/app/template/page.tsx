'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useStore } from '@/store/useStore'
import axios from 'axios'

export default function TemplatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clearSelectedPlaces } = useStore()
  const [templateInfo, setTemplateInfo] = useState<any>(null)
  const [city, setCity] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const template = searchParams.get('template')
  const minRating = searchParams.get('minRating') || '4.3'
  const minReviews = searchParams.get('minReviews') || '500'

  const popularCities = [
    { name: 'Tokyo', label: '도쿄', flag: '🇯🇵' },
    { name: 'Paris', label: '파리', flag: '🇫🇷' },
    { name: 'Rome', label: '로마', flag: '🇮🇹' },
    { name: 'London', label: '런던', flag: '🇬🇧' },
    { name: 'New York', label: '뉴욕', flag: '🇺🇸' },
    { name: 'Barcelona', label: '바르셀로나', flag: '🇪🇸' },
  ]

  useEffect(() => {
    // 템플릿 정보 설정
    const templates: Record<string, any> = {
      'half_day': {
        name: '오전 반나절 코스',
        icon: '☕',
        description: '3-4시간 가벼운 여행',
        duration: '3-4시간',
        places: 3,
        schedule: '카페 → 활동 → 점심',
      },
      'full_day': {
        name: '하루 코스',
        icon: '🌞',
        description: '알찬 하루 일정',
        duration: '8시간',
        places: 6,
        schedule: '카페 → 명소 → 점심 → 명소 → 카페 → 저녁',
      },
      'two_days': {
        name: '이틀 코스',
        icon: '🏖️',
        description: '여유로운 2일 여행',
        duration: '2일',
        places: 10,
        schedule: '2일간 카페, 명소, 레스토랑 균형있게 배치',
      },
    }

    if (template) {
      setTemplateInfo(templates[template])
    }
  }, [template])

  const handleGenerateRoute = async () => {
    if (!city) {
      alert('도시를 선택해주세요')
      return
    }

    setIsGenerating(true)

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      
      // 자동 일정 생성 API 호출
      const response = await axios.post(`${API_BASE_URL}/api/template/generate`, {
        city,
        template_type: template,
        min_rating: parseFloat(minRating),
        min_reviews: parseInt(minReviews)
      })

      const { places } = response.data

      // 선택된 장소 초기화 후 추가
      clearSelectedPlaces()
      
      // Store에 장소 저장
      const { addPlace } = useStore.getState()
      places.forEach((place: any) => {
        addPlace(place)
      })

      // 동선 페이지로 이동
      const params = new URLSearchParams({
        city,
        keyword: templateInfo.name
      })
      router.push(`/route?${params.toString()}`)

    } catch (error: any) {
      console.error('Error generating template:', error)
      alert(error.response?.data?.detail || '자동 일정 생성 중 오류가 발생했습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (!templateInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">템플릿을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            ✨ AI가 최적의 일정을 만들고 있습니다
          </h2>
          <p className="text-gray-600">
            {city}의 최고 장소들을 선별하는 중...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
          >
            ← 홈으로
          </button>
          
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{templateInfo.icon}</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {templateInfo.name}
            </h1>
            <p className="text-gray-600 mb-4">
              {templateInfo.description}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <span>⏰ {templateInfo.duration}</span>
              <span>•</span>
              <span>📍 약 {templateInfo.places}곳</span>
            </div>
          </div>
        </div>

        {/* City Selection */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            🌍 어디로 여행 가시나요?
          </h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {popularCities.map((cityInfo) => (
                <button
                  key={cityInfo.name}
                  onClick={() => setCity(cityInfo.name)}
                  className={`p-4 rounded-lg border-2 transition ${
                    city === cityInfo.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{cityInfo.flag}</div>
                  <div className="font-medium text-gray-800">{cityInfo.label}</div>
                  <div className="text-xs text-gray-500">{cityInfo.name}</div>
                </button>
              ))}
            </div>
            
            <div>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="또는 직접 입력 (예: Seoul, Bangkok)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <button
              onClick={handleGenerateRoute}
              disabled={!city || isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition text-lg"
            >
              {isGenerating ? '✨ 생성 중...' : '🚀 자동 일정 생성하기'}
            </button>
          </div>
        </div>

        {/* Template Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
          <h3 className="font-semibold text-gray-800 mb-4">
            📋 이 템플릿은 어떻게 만들어지나요?
          </h3>
          
          <div className="bg-white rounded-lg p-6 mb-4">
            <p className="text-gray-700 mb-4">
              <strong className="text-purple-600">AI가 자동으로</strong> 다음 순서로 최고의 장소를 선별합니다:
            </p>
            <div className="text-center py-4">
              <p className="text-lg text-gray-800 font-medium">
                {templateInfo.schedule}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⭐</span>
              <div>
                <p className="font-medium text-gray-800">평점 기반 선별</p>
                <p className="text-sm text-gray-600">각 카테고리에서 평점 {minRating}점 이상, 리뷰 {minReviews}개 이상만 선택</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🗺️</span>
              <div>
                <p className="font-medium text-gray-800">최적 동선</p>
                <p className="text-sm text-gray-600">장소 간 이동 거리를 고려한 효율적인 순서</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏰</span>
              <div>
                <p className="font-medium text-gray-800">시간 계산</p>
                <p className="text-sm text-gray-600">각 장소의 도착/출발 시간 자동 계산</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-blue-200 text-center">
            <p className="text-sm text-gray-600">
              💡 <strong>클릭 한 번</strong>으로 완벽한 {templateInfo.name}이 완성됩니다!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

