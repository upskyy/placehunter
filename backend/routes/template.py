from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List
from services.template_service import get_template_service, TemplateType
from services.google_api import get_google_maps_service

router = APIRouter()


class TemplateGenerateRequest(BaseModel):
    city: str = Field(..., description="도시명")
    template_type: str = Field(..., description="템플릿 타입 (half_day, full_day, two_days)")
    min_rating: float = Field(default=4.3, description="최소 평점")
    min_reviews: int = Field(default=500, description="최소 리뷰 개수")


class TemplateGenerateResponse(BaseModel):
    places: List[dict]
    template_info: dict
    message: str


@router.get("/list")
async def get_templates():
    """
    사용 가능한 템플릿 목록 조회
    
    Returns:
        템플릿 목록 (반나절, 하루, 이틀)
    """
    template_service = get_template_service()
    return {"templates": template_service.get_all_templates()}


@router.get("/{template_type}")
async def get_template_config(template_type: str):
    """
    특정 템플릿의 상세 설정 조회
    
    - **template_type**: half_day, full_day, two_days
    """
    try:
        template_enum = TemplateType(template_type)
        template_service = get_template_service()
        config = template_service.get_template_config(template_enum)
        return config
    except ValueError:
        return {"error": "Invalid template type"}


@router.post("/generate", response_model=TemplateGenerateResponse)
async def generate_template_route(request: TemplateGenerateRequest):
    """
    템플릿에 맞는 자동 일정 생성
    
    - **city**: 도시명
    - **template_type**: 템플릿 종류
    - **min_rating**: 최소 평점
    - **min_reviews**: 최소 리뷰 개수
    
    Returns:
        자동 선별된 장소 목록
    """
    try:
        template_enum = TemplateType(request.template_type)
        template_service = get_template_service()
        google_service = get_google_maps_service()
        
        # 템플릿 설정 가져오기
        config = template_service.get_template_config(template_enum)
        
        # 각 스케줄 항목별로 장소 검색
        selected_places = []
        
        for schedule_item in config["schedule"]:
            keyword_map = {
                "cafe": "cafe",
                "lunch": "restaurant",
                "dinner": "restaurant",
                "attraction": "tourist attraction",
                "activity": "activity",
            }
            
            keyword = keyword_map.get(schedule_item["type"], schedule_item["type"])
            
            # 해당 키워드로 장소 검색
            places = google_service.search_places(
                city=request.city,
                keyword=keyword,
                min_rating=request.min_rating,
                min_reviews=request.min_reviews,
                max_results=3  # 각 카테고리당 3개만
            )
            
            # 가장 평점 높은 1개 선택
            if places:
                selected_places.append(places[0])
        
        return TemplateGenerateResponse(
            places=selected_places,
            template_info=config,
            message=f"{request.city}의 {config['name']} 자동 생성 완료!"
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"서버 오류: {str(e)}")

