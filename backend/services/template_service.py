from typing import Dict, List
from enum import Enum


class TemplateType(str, Enum):
    HALF_DAY = "half_day"  # 반나절 (3-4시간)
    FULL_DAY = "full_day"  # 하루 (8시간)
    TWO_DAYS = "two_days"  # 이틀


class TemplateService:
    def get_template_config(self, template_type: TemplateType) -> Dict:
        """
        템플릿 타입별 설정 반환
        
        Args:
            template_type: 템플릿 종류
            
        Returns:
            템플릿 설정 (권장 장소 수, 시작 시간, 체류 시간 등)
        """
        configs = {
            TemplateType.HALF_DAY: {
                "name": "오전 반나절 코스",
                "description": "아침부터 점심까지 가볍게 즐기는 코스",
                "recommended_places": 3,
                "start_time": "10:00",
                "visit_duration": 60,  # 60분
                "max_results": 15,
                "schedule": [
                    {"type": "cafe", "time": "10:00", "duration": 60},
                    {"type": "activity", "time": "11:30", "duration": 90},
                    {"type": "lunch", "time": "13:00", "duration": 60},
                ],
            },
            TemplateType.FULL_DAY: {
                "name": "하루 코스",
                "description": "아침부터 저녁까지 알찬 하루 여행",
                "recommended_places": 6,
                "start_time": "10:00",
                "visit_duration": 75,  # 75분
                "max_results": 20,
                "schedule": [
                    {"type": "cafe", "time": "10:00", "duration": 60},
                    {"type": "attraction", "time": "11:30", "duration": 90},
                    {"type": "lunch", "time": "13:30", "duration": 90},
                    {"type": "attraction", "time": "15:30", "duration": 90},
                    {"type": "cafe", "time": "17:30", "duration": 60},
                    {"type": "dinner", "time": "19:00", "duration": 90},
                ],
            },
            TemplateType.TWO_DAYS: {
                "name": "이틀 코스",
                "description": "2일간의 여유로운 여행",
                "recommended_places": 10,
                "start_time": "10:00",
                "visit_duration": 90,  # 90분
                "max_results": 30,
                "schedule": [
                    # Day 1
                    {"type": "cafe", "time": "10:00", "duration": 60, "day": 1},
                    {"type": "attraction", "time": "11:30", "duration": 90, "day": 1},
                    {"type": "lunch", "time": "13:30", "duration": 90, "day": 1},
                    {"type": "attraction", "time": "15:30", "duration": 90, "day": 1},
                    {"type": "dinner", "time": "18:00", "duration": 90, "day": 1},
                    # Day 2
                    {"type": "cafe", "time": "10:00", "duration": 60, "day": 2},
                    {"type": "attraction", "time": "11:30", "duration": 90, "day": 2},
                    {"type": "lunch", "time": "13:30", "duration": 90, "day": 2},
                    {"type": "cafe", "time": "15:30", "duration": 60, "day": 2},
                    {"type": "dinner", "time": "17:30", "duration": 90, "day": 2},
                ],
            },
        }
        
        return configs.get(template_type, configs[TemplateType.HALF_DAY])
    
    def get_all_templates(self) -> List[Dict]:
        """모든 템플릿 정보 반환"""
        return [
            {
                "id": "half_day",
                "name": "오전 반나절 코스",
                "description": "3-4시간 가벼운 여행",
                "duration": "3-4시간",
                "places": 3,
                "icon": "☕",
            },
            {
                "id": "full_day",
                "name": "하루 코스",
                "description": "알찬 하루 일정",
                "duration": "8시간",
                "places": 6,
                "icon": "🌞",
            },
            {
                "id": "two_days",
                "name": "이틀 코스",
                "description": "여유로운 2일 여행",
                "duration": "2일",
                "places": 10,
                "icon": "🏖️",
            },
        ]


# Singleton instance
_template_service = None


def get_template_service() -> TemplateService:
    """TemplateService 싱글톤 인스턴스 반환"""
    global _template_service
    if _template_service is None:
        _template_service = TemplateService()
    return _template_service

