from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class TravelMode(str, Enum):
    WALKING = "walking"
    TRANSIT = "transit"
    DRIVING = "driving"


class PlaceSearchRequest(BaseModel):
    city: str = Field(..., description="도시명 (예: Rome, Tokyo)")
    keyword: str = Field(..., description="검색 키워드 (예: 카페, 맛집, 박물관)")
    min_rating: float = Field(default=4.3, ge=0, le=5, description="최소 평점")
    min_reviews: int = Field(default=500, ge=0, description="최소 리뷰 개수")
    max_results: int = Field(default=20, ge=1, le=60, description="최대 결과 개수")


class PlacePhoto(BaseModel):
    photo_reference: str
    width: int
    height: int


class PlaceInfo(BaseModel):
    place_id: str
    name: str
    rating: Optional[float] = None
    user_ratings_total: Optional[int] = None
    address: str
    location: dict  # {"lat": float, "lng": float}
    opening_hours: Optional[dict] = None
    photos: List[PlacePhoto] = []
    price_level: Optional[int] = None
    types: List[str] = []


class PlaceSearchResponse(BaseModel):
    places: List[PlaceInfo]
    total_count: int


class RouteOptimizationRequest(BaseModel):
    places: List[dict] = Field(..., description="장소 목록 (최대 10개)")
    travel_mode: TravelMode = Field(default=TravelMode.WALKING, description="이동 수단")
    start_time: Optional[str] = Field(None, description="시작 시간 (HH:MM format)")
    visit_duration_minutes: int = Field(default=60, description="각 장소 체류 시간 (분)")


class RouteStep(BaseModel):
    place_id: str
    name: str
    location: dict
    order: int
    estimated_duration_to_next: Optional[int] = None  # seconds
    estimated_distance_to_next: Optional[int] = None  # meters
    arrival_time: Optional[str] = None  # ISO format time
    departure_time: Optional[str] = None  # ISO format time
    visit_duration: Optional[int] = None  # minutes


class RouteOptimizationResponse(BaseModel):
    optimized_route: List[RouteStep]
    total_duration: int  # seconds
    total_distance: int  # meters
    travel_mode: str


class NaturalLanguageQueryRequest(BaseModel):
    query: str = Field(..., description="자연어 검색어 (예: 로마 피자 맛집)")


class NaturalLanguageQueryResponse(BaseModel):
    city: str
    keyword: str
    original_query: str


class RouteDescriptionRequest(BaseModel):
    route_data: dict = Field(..., description="동선 정보")
    city: str = Field(..., description="도시명")
    keyword: str = Field(..., description="검색 키워드")


class RouteDescriptionResponse(BaseModel):
    description: str
