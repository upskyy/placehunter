from fastapi import APIRouter, HTTPException
from typing import List
from models.schemas import (
    NaturalLanguageQueryRequest,
    NaturalLanguageQueryResponse,
    RouteDescriptionRequest,
    RouteDescriptionResponse,
)
from services.openai_service import get_openai_service
from pydantic import BaseModel, Field

router = APIRouter()


class ThemeRecommendationRequest(BaseModel):
    places: List[dict] = Field(..., description="검색된 장소 목록")
    theme: str = Field(..., description="테마 (romantic, foodie, instagram, culture, family)")
    max_results: int = Field(default=10, description="최대 추천 개수")


class ThemeRecommendationResponse(BaseModel):
    recommended_places: List[dict]
    description: str
    theme: str


@router.post("/parse-query", response_model=NaturalLanguageQueryResponse)
async def parse_natural_language_query(request: NaturalLanguageQueryRequest):
    """
    자연어 검색어를 도시와 키워드로 파싱
    
    - **query**: 자연어 검색어 (예: "로마 피자 맛집", "도쿄 카페 추천")
    
    Returns:
        - city: 파싱된 도시명 (영어)
        - keyword: 파싱된 키워드 (영어)
        - original_query: 원본 검색어
    """
    try:
        openai_service = get_openai_service()
        
        result = openai_service.parse_natural_language_query(request.query)
        
        if not result["city"] or not result["keyword"]:
            raise HTTPException(
                status_code=400,
                detail="검색어를 파싱할 수 없습니다. 도시명과 키워드를 명확히 입력해주세요."
            )
        
        return NaturalLanguageQueryResponse(
            city=result["city"],
            keyword=result["keyword"],
            original_query=request.query
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"서버 오류: {str(e)}")


@router.post("/route-description", response_model=RouteDescriptionResponse)
async def generate_route_description(request: RouteDescriptionRequest):
    """
    생성된 동선에 대한 AI 여행 가이드 생성
    
    - **route_data**: 동선 정보 (optimized_route, total_distance, total_duration)
    - **city**: 도시명
    - **keyword**: 검색 키워드
    
    Returns:
        - description: AI가 생성한 여행 가이드 텍스트
    """
    try:
        openai_service = get_openai_service()
        
        description = openai_service.generate_route_description(
            route_data=request.route_data,
            city=request.city,
            keyword=request.keyword
        )
        
        return RouteDescriptionResponse(description=description)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"서버 오류: {str(e)}")


@router.post("/recommend-by-theme", response_model=ThemeRecommendationResponse)
async def recommend_by_theme(request: ThemeRecommendationRequest):
    """
    테마에 맞는 장소 AI 추천
    
    - **places**: 검색된 장소 목록
    - **theme**: 테마 종류 (romantic, foodie, instagram, culture, family)
    - **max_results**: 최대 추천 개수
    
    Returns:
        - recommended_places: 테마에 맞는 추천 장소
        - description: 선택 이유
        - theme: 테마 이름
    """
    try:
        openai_service = get_openai_service()
        
        result = openai_service.recommend_by_theme(
            places=request.places,
            theme=request.theme,
            max_results=request.max_results
        )
        
        return ThemeRecommendationResponse(**result)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"서버 오류: {str(e)}")


@router.get("/review-analysis/{place_id}")
async def analyze_place_reviews(place_id: str):
    """
    특정 장소의 리뷰를 AI로 분석
    
    - **place_id**: Google Place ID
    
    Returns:
        - summary: 리뷰 요약
        - features: 주요 특징 목록
        - hashtags: 해시태그 목록
    """
    try:
        from services.google_api import get_google_maps_service
        
        google_service = get_google_maps_service()
        
        # 장소 정보 가져오기
        details = google_service.get_place_details(place_id)
        if not details:
            raise HTTPException(status_code=404, detail="장소를 찾을 수 없습니다")
        
        place_name = details.get("name", "Unknown Place")
        
        # 리뷰 가져오기
        reviews = google_service.get_place_reviews(place_id)
        
        # 리뷰가 없는 경우 기본 응답
        if not reviews or len(reviews) == 0:
            return {
                "summary": f"{place_name}은(는) 아직 리뷰가 충분하지 않습니다. 첫 방문자가 되어보세요!",
                "features": ["리뷰 준비 중"],
                "hashtags": ["#숨은명소", "#첫방문"]
            }
        
        # AI로 리뷰 분석 (OpenAI API 키 필요)
        try:
            openai_service = get_openai_service()
            analysis = openai_service.analyze_reviews(place_name, reviews)
            return analysis
        except ValueError:
            # OpenAI API 키가 없는 경우
            return {
                "summary": f"{place_name}의 리뷰 분석 기능을 사용하려면 OpenAI API 키가 필요합니다.",
                "features": ["리뷰 수: " + str(len(reviews)) + "개"],
                "hashtags": ["#API키필요"]
            }
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error in review analysis endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"서버 오류: {str(e)}")

