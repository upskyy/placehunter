'use client'

import { useEffect, useState } from 'react'
import { GoogleMap, useLoadScript, Marker, Polyline } from '@react-google-maps/api'

interface RouteStep {
  place_id: string
  name: string
  location: {
    lat: number
    lng: number
  }
  order: number
}

interface RouteMapProps {
  route: RouteStep[]
}

const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '0.5rem'
}

export default function RouteMap({ route }: RouteMapProps) {
  const [center, setCenter] = useState({ lat: 0, lng: 0 })
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  // useLoadScript로 변경 (재렌더링 시 중복 로딩 방지)
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
  })

  useEffect(() => {
    if (route.length > 0) {
      // 첫 번째 장소를 중심으로 설정
      setCenter(route[0].location)
    }
  }, [route])

  if (!apiKey) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-red-500">Google Maps API 키가 설정되지 않았습니다</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-red-500">지도를 로드하는 중 오류가 발생했습니다</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">지도를 불러오는 중...</p>
      </div>
    )
  }

  // 경로 선을 위한 좌표 배열
  const pathCoordinates = route.map(step => step.location)

  // 마커 아이콘 - 숫자만 표시 (SVG 사용)
  const getMarkerIcon = (index: number, total: number) => {
    let color = '#3B82F6' // 파란색 (중간 지점)
    if (index === 0) color = '#10B981' // 초록색 (시작)
    if (index === total - 1) color = '#EF4444' // 빨간색 (끝)

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="${color}" stroke="white" stroke-width="3"/>
        <text x="20" y="27" text-anchor="middle" font-size="16" font-weight="bold" fill="white">${index + 1}</text>
      </svg>
    `)}`
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={13}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        {/* 마커 표시 */}
        {route.map((step, index) => (
          <Marker
            key={step.place_id}
            position={step.location}
            title={step.name}
            icon={{
              url: getMarkerIcon(index, route.length),
              scaledSize: { width: 40, height: 40 } as any,
              anchor: { x: 20, y: 20 } as any,
            }}
          />
        ))}

        {/* 경로 선 표시 */}
        {pathCoordinates.length > 1 && (
          <Polyline
            path={pathCoordinates}
            options={{
              strokeColor: '#3B82F6',
              strokeOpacity: 0.8,
              strokeWeight: 4,
            }}
          />
        )}
      </GoogleMap>
    </div>
  )
}

