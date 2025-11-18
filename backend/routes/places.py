from fastapi import APIRouter, HTTPException
from models.schemas import PlaceSearchRequest, PlaceSearchResponse, PlaceInfo
from services.google_api import get_google_maps_service

router = APIRouter()


@router.post("/search", response_model=PlaceSearchResponse)
async def search_places(request: PlaceSearchRequest):
    """
    도시와 키워드로 장소 검색
    
    - **city**: 도시명 (예: Rome, Tokyo)
    - **keyword**: 검색 키워드 (예: 카페, 맛집, 박물관)
    - **min_rating**: 최소 평점 (기본 4.3)
    - **min_reviews**: 최소 리뷰 개수 (기본 500)
    - **max_results**: 최대 결과 개수 (기본 20)
    """
    try:
        google_service = get_google_maps_service()
        
        places = google_service.search_places(
            city=request.city,
            keyword=request.keyword,
            min_rating=request.min_rating,
            min_reviews=request.min_reviews,
            max_results=request.max_results
        )
        
        # Convert to PlaceInfo objects
        place_infos = []
        for place in places:
            place_info = PlaceInfo(**place)
            place_infos.append(place_info)
        
        return PlaceSearchResponse(
            places=place_infos,
            total_count=len(place_infos)
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"서버 오류: {str(e)}")


@router.get("/details/{place_id}")
async def get_place_details(place_id: str):
    """
    특정 장소의 상세 정보 조회
    
    - **place_id**: Google Place ID
    """
    try:
        google_service = get_google_maps_service()
        details = google_service.get_place_details(place_id)
        
        if not details:
            raise HTTPException(status_code=404, detail="장소를 찾을 수 없습니다")
        
        return {"details": details}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"서버 오류: {str(e)}")

