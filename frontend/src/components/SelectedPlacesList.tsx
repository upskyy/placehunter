'use client'

import { useStore } from '@/store/useStore'

interface SelectedPlacesListProps {
  onCreateRoute: () => void
}

export default function SelectedPlacesList({ onCreateRoute }: SelectedPlacesListProps) {
  const { selectedPlaces, removePlace, clearSelectedPlaces } = useStore()

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          선택한 장소 ({selectedPlaces.length}/10)
        </h2>
        {selectedPlaces.length > 0 && (
          <button
            onClick={clearSelectedPlaces}
            className="text-sm text-red-500 hover:text-red-700"
          >
            전체 삭제
          </button>
        )}
      </div>

      {selectedPlaces.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">📍</div>
          <p className="text-gray-500 text-sm">
            장소를 선택하면<br />여기에 표시됩니다
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
            {selectedPlaces.map((place, index) => (
              <div
                key={place.place_id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 text-sm truncate">
                    {place.name}
                  </h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <span>⭐</span>
                    <span>{place.rating?.toFixed(1) || 'N/A'}</span>
                  </p>
                </div>
                <button
                  onClick={() => removePlace(place.place_id)}
                  className="flex-shrink-0 text-gray-400 hover:text-red-500 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={onCreateRoute}
            disabled={selectedPlaces.length < 2}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            {selectedPlaces.length < 2
              ? '최소 2개 이상 선택해주세요'
              : '동선 생성하기 🗺️'}
          </button>

          {selectedPlaces.length >= 2 && (
            <p className="text-xs text-gray-500 text-center mt-2">
              선택한 장소들의 최적 동선을 만들어드립니다
            </p>
          )}
        </>
      )}
    </div>
  )
}

