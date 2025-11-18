'use client'

import { useState } from 'react'
import { useStore, Place } from '@/store/useStore'
import { getPhotoUrl } from '@/lib/api'

interface PlaceCardProps {
  place: Place
}

const getPriceLabel = (level: number): string => {
  switch (level) {
    case 1:
      return '저렴'
    case 2:
      return '보통'
    case 3:
      return '비쌈'
    case 4:
      return '매우 비쌌'
    default:
      return '정보 없음'
  }
}

function OpeningHoursDetails({ weekdayText }: { weekdayText: string[] }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="text-xs text-gray-600">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer hover:text-blue-600 transition flex items-center gap-1 w-full text-left"
      >
        <span className={`transition-transform inline-block ${isOpen ? 'rotate-90' : ''}`}>▶</span>
        <span>📅 영업시간 보기</span>
      </button>
      {isOpen && (
        <div className="mt-2 space-y-1 pl-2 border-l-2 border-gray-200">
          {weekdayText.map((day, idx) => (
            <div key={idx} className="text-xs">
              {day}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PlaceCard({ place }: PlaceCardProps) {
  const { addPlace, removePlace, isPlaceSelected } = useStore()
  const selected = isPlaceSelected(place.place_id)
  const [imageError, setImageError] = useState(false)

  const handleToggle = () => {
    if (selected) {
      removePlace(place.place_id)
    } else {
      addPlace(place)
    }
  }

  return (
    <div
      className={`bg-white rounded-lg shadow hover:shadow-lg transition duration-200 overflow-hidden border-2 ${
        selected ? 'border-blue-500' : 'border-transparent'
      }`}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {place.photos && place.photos.length > 0 && !imageError ? (
          <img
            src={getPhotoUrl(place.photos[0].photo_reference, 400)}
            alt={place.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-5xl">📍</span>
          </div>
        )}
        
        {/* Selection Badge */}
        {selected && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            선택됨 ✓
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <a
          href={`https://www.google.com/maps/place/?q=place_id:${place.place_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-lg text-gray-800 hover:text-blue-600 mb-2 block transition group"
          title="구글맵에서 보기"
        >
          <span className="line-clamp-1">{place.name} <span className="text-sm opacity-50 group-hover:opacity-100">🔗</span></span>
        </a>
        
        {/* Rating */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-yellow-500">⭐</span>
          <span className="font-semibold">{place.rating?.toFixed(1) || 'N/A'}</span>
          {place.user_ratings_total && (
            <span className="text-sm text-gray-500">
              ({place.user_ratings_total.toLocaleString()})
            </span>
          )}
        </div>

        {/* Address */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {place.address}
        </p>

        {/* Status & Price */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            {place.opening_hours && (
              <span className={`text-xs px-2 py-1 rounded font-medium ${
                place.opening_hours.open_now
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {place.opening_hours.open_now ? '영업 중' : '영업 종료'}
              </span>
            )}
            
            {place.price_level && (
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-amber-600">
                  {'$'.repeat(place.price_level)}
                </span>
                <span className="text-xs text-gray-500">
                  ({getPriceLabel(place.price_level)})
                </span>
              </div>
            )}
          </div>
          
          {/* 영업시간 상세 */}
          {place.opening_hours?.weekday_text && place.opening_hours.weekday_text.length > 0 && (
            <div className="mb-4">
              <OpeningHoursDetails weekdayText={place.opening_hours.weekday_text} />
            </div>
          )}
        </div>

        {/* Select Button */}
        <button
          onClick={handleToggle}
          className={`w-full py-2 px-4 rounded-lg font-medium transition ${
            selected
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {selected ? '선택 취소' : '선택하기'}
        </button>
      </div>
    </div>
  )
}

