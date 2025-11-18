'use client'

import { useState } from 'react'
import { useStore } from '@/store/useStore'
import axios from 'axios'

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

interface ReviewAnalysis {
  summary: string
  features: string[]
  hashtags: string[]
}

interface OptimizedRoute {
  optimized_route: RouteStep[]
  total_duration: number
  total_distance: number
  travel_mode: string
}

interface RouteDetailsProps {
  route: OptimizedRoute
}

const getPriceLabel = (level?: number): string => {
  if (!level) return '정보 없음'
  switch (level) {
    case 1:
      return '저렴 (₩)'
    case 2:
      return '보통 (₩₩)'
    case 3:
      return '비쌈 (₩₩₩)'
    case 4:
      return '매우 비쌈 (₩₩₩₩)'
    default:
      return '정보 없음'
  }
}

const estimateCost = (priceLevel?: number): number => {
  if (!priceLevel) return 0
  // 가격대별 평균 예산 (원화 기준)
  switch (priceLevel) {
    case 1:
      return 10000 // 1만원
    case 2:
      return 30000 // 3만원
    case 3:
      return 60000 // 6만원
    case 4:
      return 100000 // 10만원
    default:
      return 0
  }
}

function PlaceReviewAnalysis({ placeId, placeName }: { placeId: string; placeName: string }) {
  const [reviewAnalysis, setReviewAnalysis] = useState<ReviewAnalysis | null>(null)
  const [loadingReview, setLoadingReview] = useState(false)
  const [showReview, setShowReview] = useState(false)

  const handleReviewAnalysis = async () => {
    if (reviewAnalysis) {
      setShowReview(!showReview)
      return
    }

    setLoadingReview(true)
    setShowReview(true)
    
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      const response = await axios.get(`${API_BASE_URL}/api/ai/review-analysis/${placeId}`)
      setReviewAnalysis(response.data)
    } catch (error: any) {
      console.error('Error analyzing reviews:', error)
      setReviewAnalysis({
        summary: 'OpenAI API 키를 설정하시면 AI 리뷰 분석을 사용할 수 있습니다.',
        features: [],
        hashtags: []
      })
    } finally {
      setLoadingReview(false)
    }
  }

  return (
    <div className="text-xs mt-2">
      <button
        onClick={handleReviewAnalysis}
        className="cursor-pointer hover:text-purple-600 transition text-left w-full flex items-center gap-1"
      >
        <span className={`transition-transform inline-block ${showReview ? 'rotate-90' : ''}`}>▶</span>
        <span>🤖 AI 리뷰 분석</span>
      </button>
      
      {showReview && (
        <div className="mt-2 p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          {loadingReview ? (
            <div className="text-center py-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
              <p className="text-xs text-gray-600">AI가 리뷰 분석 중...</p>
            </div>
          ) : reviewAnalysis ? (
            <div className="space-y-2">
              {/* 요약 */}
              <div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {reviewAnalysis.summary}
                </p>
              </div>
              
              {/* 특징 */}
              {reviewAnalysis.features.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-800 mb-1">✨ 특징</p>
                  <ul className="space-y-1">
                    {reviewAnalysis.features.map((feature, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                        <span>•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* 해시태그 */}
              {reviewAnalysis.hashtags.length > 0 && (
                <div>
                  <div className="flex flex-wrap gap-1">
                    {reviewAnalysis.hashtags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default function RouteDetails({ route }: RouteDetailsProps) {
  const { selectedPlaces } = useStore()
  
  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60)
    if (minutes < 60) {
      return `${minutes}분`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}시간 ${remainingMinutes}분`
  }

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${meters}m`
    }
    return `${(meters / 1000).toFixed(1)}km`
  }

  // 도보로 고정
  const travelModeEmoji = '🚶'
  
  // 총 예산 계산
  const totalBudget = selectedPlaces.reduce((sum, place) => {
    return sum + estimateCost(place.price_level)
  }, 0)
  
  // place_id로 선택된 장소 찾기
  const getPlaceInfo = (placeId: string) => {
    return selectedPlaces.find(p => p.place_id === placeId)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">여행 일정</h2>

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">총 거리</p>
            <p className="text-xl font-semibold text-gray-800">
              {formatDistance(route.total_distance)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">예상 시간</p>
            <p className="text-xl font-semibold text-gray-800">
              {formatDuration(route.total_duration)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">예상 예산</p>
            <p className="text-xl font-semibold text-amber-600">
              {totalBudget > 0 ? `₩${totalBudget.toLocaleString()}` : '미정'}
            </p>
          </div>
        </div>
        {totalBudget > 0 && (
          <p className="text-xs text-gray-500 mt-3 text-center">
            💡 예산은 가격대 기준 평균 예상치입니다
          </p>
        )}
      </div>

      {/* Route Steps */}
      <div className="space-y-4">
        {route.optimized_route.map((step, index) => (
          <div key={step.place_id}>
            <div className="flex items-start gap-4">
              {/* Order Badge */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  index === 0
                    ? 'bg-green-500'
                    : index === route.optimized_route.length - 1
                    ? 'bg-red-500'
                    : 'bg-blue-500'
                }`}
              >
                {step.order}
              </div>

              {/* Place Info */}
              <div className="flex-1">
                <a
                  href={`https://www.google.com/maps/place/?q=place_id:${step.place_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-gray-800 hover:text-blue-600 transition group"
                  title="구글맵에서 보기"
                >
                  {step.name} <span className="text-xs opacity-50 group-hover:opacity-100">🔗</span>
                </a>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {index === 0 && <span className="text-xs text-gray-500">🏁 출발지</span>}
                  {index === route.optimized_route.length - 1 && <span className="text-xs text-gray-500">🏁 도착지</span>}
                  {(() => {
                    const placeInfo = getPlaceInfo(step.place_id)
                    if (placeInfo?.price_level) {
                      return (
                        <span className="text-xs text-amber-600 font-medium">
                          {getPriceLabel(placeInfo.price_level)}
                        </span>
                      )
                    }
                    return null
                  })()}
                </div>
                
                {/* 타임라인 */}
                {step.arrival_time && (
                  <div className="mt-2 bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">도착</span>
                        <span className="font-semibold text-blue-600 ml-2">{step.arrival_time}</span>
                      </div>
                      <span className="text-gray-400">→</span>
                      <div>
                        <span className="text-gray-600">출발</span>
                        <span className="font-semibold text-blue-600 ml-2">{step.departure_time}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        (체류 {step.visit_duration}분)
                      </span>
                    </div>
                  </div>
                )}
                
                {/* AI 리뷰 분석 */}
                <PlaceReviewAnalysis placeId={step.place_id} placeName={step.name} />

                {/* Distance & Duration to Next */}
                {step.estimated_duration_to_next && step.estimated_distance_to_next && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                    <span>{travelModeEmoji}</span>
                    <span className="font-medium">
                      {formatDistance(step.estimated_distance_to_next)}
                    </span>
                    <span>·</span>
                    <span>{formatDuration(step.estimated_duration_to_next)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Connector Line */}
            {index < route.optimized_route.length - 1 && (
              <div className="ml-5 h-8 border-l-2 border-dashed border-gray-300"></div>
            )}
          </div>
        ))}
      </div>

      {/* Export Options */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={() => {
            const routeText = route.optimized_route
              .map((step, i) => `${i + 1}. ${step.name}`)
              .join('\n')
            navigator.clipboard.writeText(routeText)
            alert('동선이 클립보드에 복사되었습니다!')
          }}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition"
        >
          📋 동선 복사하기
        </button>
      </div>
    </div>
  )
}

