from fastapi import APIRouter, HTTPException
from models.schemas import RouteOptimizationRequest, RouteOptimizationResponse, RouteStep
from services.google_api import get_google_maps_service
from datetime import datetime, timedelta

router = APIRouter()


@router.post("/optimize", response_model=RouteOptimizationResponse)
async def optimize_route(request: RouteOptimizationRequest):
    """
    선택된 장소들의 최적 동선 생성
    
    - **places**: 방문할 장소 목록 (최대 10개)
    - **travel_mode**: 이동 수단 (walking, transit, driving)
    - **start_time**: 시작 시간 (선택사항)
    """
    try:
        if len(request.places) < 2:
            raise HTTPException(
                status_code=400,
                detail="최소 2개 이상의 장소를 선택해주세요"
            )
        
        if len(request.places) > 10:
            raise HTTPException(
                status_code=400,
                detail="최대 10개까지 장소를 선택할 수 있습니다"
            )
        
        google_service = get_google_maps_service()
        
        # 최적 순서 결정
        optimized_places = google_service.optimize_route_order(
            places=request.places,
            mode=request.travel_mode.value
        )
        
        # 경로 정보 계산
        route_info = google_service.calculate_route(
            locations=[p['location'] for p in optimized_places],
            mode=request.travel_mode.value
        )
        
        # RouteStep 객체 생성 (시간 계산 포함)
        route_steps = []
        current_time = None
        
        # 시작 시간 파싱
        if request.start_time:
            try:
                # HH:MM 형식을 오늘 날짜의 datetime으로 변환
                today = datetime.now().date()
                time_parts = request.start_time.split(':')
                current_time = datetime.combine(
                    today,
                    datetime.min.time().replace(
                        hour=int(time_parts[0]),
                        minute=int(time_parts[1])
                    )
                )
            except:
                current_time = None
        
        for idx, place in enumerate(optimized_places):
            # 다음 장소까지의 거리와 시간
            duration_to_next = None
            distance_to_next = None
            
            if idx < len(optimized_places) - 1:
                for route_segment in route_info['routes']:
                    if route_segment['from_index'] == idx:
                        duration_to_next = route_segment['duration']
                        distance_to_next = route_segment['distance']
                        break
            
            # 시간 계산
            arrival_time_str = None
            departure_time_str = None
            
            if current_time:
                arrival_time_str = current_time.strftime('%H:%M')
                # 방문 시간 추가
                current_time += timedelta(minutes=request.visit_duration_minutes)
                departure_time_str = current_time.strftime('%H:%M')
                # 다음 장소로 이동 시간 추가
                if duration_to_next:
                    current_time += timedelta(seconds=duration_to_next)
            
            route_step = RouteStep(
                place_id=place['place_id'],
                name=place['name'],
                location=place['location'],
                order=idx + 1,
                estimated_duration_to_next=duration_to_next,
                estimated_distance_to_next=distance_to_next,
                arrival_time=arrival_time_str,
                departure_time=departure_time_str,
                visit_duration=request.visit_duration_minutes
            )
            route_steps.append(route_step)
        
        return RouteOptimizationResponse(
            optimized_route=route_steps,
            total_duration=route_info['total_duration'],
            total_distance=route_info['total_distance'],
            travel_mode=request.travel_mode.value
        )
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"서버 오류: {str(e)}")

