'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { searchPlaces } from '@/lib/api'
import { useStore } from '@/store/useStore'
import PlaceCard from '@/components/PlaceCard'
import SelectedPlacesList from '@/components/SelectedPlacesList'

export default function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { searchResults, setSearchResults, selectedPlaces } = useStore()
  
  const city = searchParams.get('city')
  const keyword = searchParams.get('keyword')
  const minRating = parseFloat(searchParams.get('minRating') || '4.3')
  const minReviews = parseInt(searchParams.get('minReviews') || '500')

  useEffect(() => {
    if (!city || !keyword) {
      router.push('/')
      return
    }

    const fetchPlaces = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const data = await searchPlaces({
          city,
          keyword,
          min_rating: minRating,
          min_reviews: minReviews,
          max_results: 20
        })
        
        setSearchResults(data.places)
      } catch (err: any) {
        console.error('Error fetching places:', err)
        setError(err.response?.data?.detail || '장소를 검색하는 중 오류가 발생했습니다')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlaces()
  }, [city, keyword, minRating, minReviews])

  const handleCreateRoute = () => {
    if (selectedPlaces.length < 2) {
      alert('최소 2개 이상의 장소를 선택해주세요')
      return
    }
    // city와 keyword를 파라미터로 전달
    const params = new URLSearchParams({
      city: city || '',
      keyword: keyword || ''
    })
    router.push(`/route?${params.toString()}`)
  }

  const handleBackToSearch = () => {
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">장소를 검색하는 중...</p>
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
            onClick={handleBackToSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackToSearch}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
          >
            ← 새로운 검색
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {city}의 {keyword}
          </h1>
          <p className="text-gray-600">
            평점 {minRating}점 이상 · 리뷰 {minReviews.toLocaleString()}개 이상 · 총 {searchResults.length}개 장소
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Results */}
          <div className="lg:col-span-2">
            {searchResults.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-gray-400 text-5xl mb-4">🔍</div>
                <p className="text-gray-600">검색 결과가 없습니다</p>
                <p className="text-sm text-gray-500 mt-2">
                  다른 키워드나 도시로 검색해보세요
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((place) => (
                  <PlaceCard key={place.place_id} place={place} />
                ))}
              </div>
            )}
          </div>

          {/* Selected Places Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <SelectedPlacesList onCreateRoute={handleCreateRoute} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

