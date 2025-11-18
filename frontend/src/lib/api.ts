import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface SearchPlacesParams {
  city: string
  keyword: string
  min_rating?: number
  min_reviews?: number
  max_results?: number
}

export interface OptimizeRouteParams {
  places: Array<{
    place_id: string
    name: string
    location: {
      lat: number
      lng: number
    }
  }>
  travel_mode?: 'walking' | 'transit' | 'driving'
  start_time?: string
  visit_duration_minutes?: number
}

export const searchPlaces = async (params: SearchPlacesParams) => {
  const response = await api.post('/api/places/search', params)
  return response.data
}

export const optimizeRoute = async (params: OptimizeRouteParams) => {
  const response = await api.post('/api/route/optimize', params)
  return response.data
}

export const getPlaceDetails = async (placeId: string) => {
  const response = await api.get(`/api/places/details/${placeId}`)
  return response.data
}

export const getPhotoUrl = (photoReference: string, maxWidth: number = 400) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${apiKey}`
}

// AI API
export interface ParseQueryParams {
  query: string
}

export interface ParseQueryResponse {
  city: string
  keyword: string
  original_query: string
}

export const parseNaturalLanguageQuery = async (params: ParseQueryParams): Promise<ParseQueryResponse> => {
  const response = await api.post('/api/ai/parse-query', params)
  return response.data
}

export interface RouteDescriptionParams {
  route_data: any
  city: string
  keyword: string
}

export interface RouteDescriptionResponse {
  description: string
}

export const generateRouteDescription = async (params: RouteDescriptionParams): Promise<RouteDescriptionResponse> => {
  const response = await api.post('/api/ai/route-description', params)
  return response.data
}

export default api

