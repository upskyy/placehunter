'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { optimizeRoute, generateRouteDescription } from '@/lib/api'
import RouteMap from '@/components/RouteMap'
import RouteDetails from '@/components/RouteDetails'

interface RouteStep {
  place_id: string
  name: string
  location: {
    lat: number
    lng: number
  }
  order: number
  estimated_duration_to_next?: number
  estimated_distance_to_next?: number
  arrival_time?: string
  departure_time?: string
  visit_duration?: number
}

interface OptimizedRoute {
  optimized_route: RouteStep[]
  total_duration: number
  total_distance: number
  travel_mode: string
}

export default function RoutePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { selectedPlaces } = useStore()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [route, setRoute] = useState<OptimizedRoute | null>(null)
  const [aiDescription, setAiDescription] = useState<string | null>(null)
  const [loadingAI, setLoadingAI] = useState(false)
  const [startTime, setStartTime] = useState('10:00')
  const [visitDuration, setVisitDuration] = useState(60)

  // URL에서 city와 keyword 가져오기
  const city = searchParams.get('city') || '여행지'
  const keyword = searchParams.get('keyword') || '장소'

  useEffect(() => {
    if (selectedPlaces.length < 2) {
      router.push('/results')
      return
    }

    fetchRoute()
  }, [selectedPlaces, startTime, visitDuration])

  const fetchRoute = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const places = selectedPlaces.map(place => ({
        place_id: place.place_id,
        name: place.name,
        location: place.location
      }))

      const data = await optimizeRoute({
        places,
        travel_mode: 'walking',
        start_time: startTime,
        visit_duration_minutes: visitDuration
      })

      setRoute(data)
    } catch (err: any) {
      console.error('Error optimizing route:', err)
      setError(err.response?.data?.detail || '동선을 생성하는 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateAIDescription = async () => {
    if (!route) return
    
    setLoadingAI(true)
    try {
      const response = await generateRouteDescription({
        route_data: route,
        city,
        keyword
      })
      setAiDescription(response.description)
    } catch (error: any) {
      console.error('Error generating AI description:', error)
      alert(error.response?.data?.detail || 'AI 설명 생성 중 오류가 발생했습니다.')
    } finally {
      setLoadingAI(false)
    }
  }

  const handleBackToResults = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">최적 동선을 생성하는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">오류가 발생했습니다</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleBackToResults}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            돌아가기
          </button>
        </div>
      </div>
    )
  }

  if (!route) {
    return null
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackToResults}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
          >
            ← 장소 목록으로
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🗺️ 최적 여행 동선 (도보)
          </h1>
          <p className="text-gray-600">
            {selectedPlaces.length}개 장소 · {(route.total_distance / 1000).toFixed(1)}km · 약 {Math.round(route.total_duration / 60)}분
          </p>
        </div>

        {/* Time Settings */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">⏰ 시간 설정</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작 시간
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                장소당 체류 시간: {visitDuration}분
              </label>
              <input
                type="range"
                min="30"
                max="180"
                step="15"
                value={visitDuration}
                onChange={(e) => setVisitDuration(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>30분</span>
                <span>3시간</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map */}
          <div className="order-2 lg:order-1">
            <RouteMap route={route.optimized_route} />
          </div>

          {/* Route Details */}
          <div className="order-1 lg:order-2">
            <RouteDetails route={route} />
          </div>
        </div>

        {/* AI Description Section */}
        <div className="mt-8">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span>🤖</span>
                <span>AI 여행 가이드</span>
              </h2>
              {!aiDescription && (
                <button
                  onClick={handleGenerateAIDescription}
                  disabled={loadingAI}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loadingAI ? 'AI가 작성 중...' : 'AI 설명 생성하기'}
                </button>
              )}
            </div>

            {aiDescription ? (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {aiDescription}
                </p>
                <button
                  onClick={handleGenerateAIDescription}
                  disabled={loadingAI}
                  className="mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  🔄 다시 생성하기
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  AI가 이 여행 코스에 대한 상세한 가이드를 작성해드립니다.
                </p>
                <p className="text-sm text-gray-500">
                  💡 추천 방문 시간, 소요 시간, 여행 팁 등을 포함합니다
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

