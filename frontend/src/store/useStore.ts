import { create } from 'zustand'

export interface Place {
  place_id: string
  name: string
  rating?: number
  user_ratings_total?: number
  address: string
  location: {
    lat: number
    lng: number
  }
  opening_hours?: {
    open_now: boolean
    weekday_text?: string[]
  }
  photos: Array<{
    photo_reference: string
    width: number
    height: number
  }>
  price_level?: number
  types: string[]
}

interface StoreState {
  selectedPlaces: Place[]
  searchResults: Place[]
  addPlace: (place: Place) => void
  removePlace: (placeId: string) => void
  clearSelectedPlaces: () => void
  setSearchResults: (places: Place[]) => void
  isPlaceSelected: (placeId: string) => boolean
}

export const useStore = create<StoreState>((set, get) => ({
  selectedPlaces: [],
  searchResults: [],
  
  addPlace: (place) =>
    set((state) => {
      // 최대 10개까지만 선택 가능
      if (state.selectedPlaces.length >= 10) {
        alert('최대 10개까지만 선택할 수 있습니다')
        return state
      }
      
      // 이미 선택된 장소인지 확인
      if (state.selectedPlaces.some((p) => p.place_id === place.place_id)) {
        return state
      }
      
      return {
        selectedPlaces: [...state.selectedPlaces, place]
      }
    }),
  
  removePlace: (placeId) =>
    set((state) => ({
      selectedPlaces: state.selectedPlaces.filter((p) => p.place_id !== placeId)
    })),
  
  clearSelectedPlaces: () =>
    set({ selectedPlaces: [] }),
  
  setSearchResults: (places) =>
    set({ searchResults: places }),
  
  isPlaceSelected: (placeId) =>
    get().selectedPlaces.some((p) => p.place_id === placeId)
}))

