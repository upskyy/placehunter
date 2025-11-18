import os
import json
from typing import Dict, List, Optional
from openai import OpenAI


class OpenAIService:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
        self.client = OpenAI(api_key=api_key)

    def parse_natural_language_query(self, query: str) -> Dict[str, str]:
        """
        자연어 검색어를 도시와 키워드로 파싱

        Args:
            query: 자연어 검색어 (예: "로마 피자 맛집", "도쿄 카페 추천")

        Returns:
            {"city": "Rome", "keyword": "pizza restaurant"}
        """
        try:
            prompt = f"""사용자의 자연어 여행 검색어를 분석하여 도시명과 키워드를 추출해주세요.

검색어: "{query}"

다음 규칙을 따라주세요:
1. 도시명은 영어로 변환 (예: 로마 → Rome, 도쿄 → Tokyo, 파리 → Paris)
2. 키워드는 영어로 변환하되 구체적으로 (예: 맛집 → restaurant, 카페 → cafe, 피자 → pizza)
3. 만약 키워드가 특정 음식이면 그 음식 이름을 포함 (예: 피자 맛집 → pizza restaurant)
4. JSON 형식으로만 응답: {{"city": "도시명", "keyword": "키워드"}}

예시:
- "로마 피자 맛집" → {{"city": "Rome", "keyword": "pizza restaurant"}}
- "도쿄 라멘집" → {{"city": "Tokyo", "keyword": "ramen restaurant"}}
- "파리 카페" → {{"city": "Paris", "keyword": "cafe"}}
- "런던 박물관" → {{"city": "London", "keyword": "museum"}}

JSON만 응답하세요."""

            response = self.client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "당신은 여행 검색어를 분석하는 전문가입니다. 항상 JSON 형식으로만 응답합니다.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                max_tokens=100,
            )

            content = response.choices[0].message.content.strip()

            # JSON 파싱
            # 가끔 ```json ``` 같은 마크다운으로 감싸져 올 수 있음
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:].strip()

            result = json.loads(content)

            return {
                "city": result.get("city", ""),
                "keyword": result.get("keyword", ""),
            }

        except Exception as e:
            print(f"Error parsing natural language query: {e}")
            # 실패 시 기본값 반환
            return {"city": "", "keyword": query}

    def generate_route_description(
        self, route_data: Dict, city: str, keyword: str
    ) -> str:
        """
        생성된 동선에 대한 상세 설명 생성

        Args:
            route_data: 동선 정보 (장소 목록, 거리, 시간 등)
            city: 도시명
            keyword: 검색 키워드

        Returns:
            여행 가이드 텍스트
        """
        try:
            places = route_data.get("optimized_route", [])
            total_distance = route_data.get("total_distance", 0)
            total_duration = route_data.get("total_duration", 0)

            # 장소 목록 텍스트 생성
            places_text = "\n".join(
                [f"{i + 1}. {place['name']}" for i, place in enumerate(places)]
            )

            prompt = f"""당신은 친절한 여행 가이드입니다. 다음 여행 동선에 대해 한국어로 상세하고 매력적인 설명을 작성해주세요.

도시: {city}
테마: {keyword}
총 거리: {total_distance / 1000:.1f}km
예상 시간: {total_duration // 60}분

방문 장소 순서:
{places_text}

다음 내용을 포함해서 3-4문단으로 작성해주세요:
1. 이 동선의 전체적인 매력과 특징
2. 추천하는 방문 시간대나 팁
3. 각 장소를 둘러보는 데 추천하는 소요 시간
4. 마무리 추천사

친근하고 열정적인 톤으로 작성해주세요."""

            response = self.client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "당신은 열정적이고 전문적인 여행 가이드입니다. 여행자들에게 유용하고 매력적인 정보를 제공합니다.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_tokens=800,
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            print(f"Error generating route description: {e}")
            return f"이 {city}의 {keyword} 여행 코스는 총 {len(places)}개의 장소를 방문하며, 약 {total_distance / 1000:.1f}km를 이동하는 {total_duration // 60}분 코스입니다."

    def recommend_by_theme(
        self, places: List[Dict], theme: str, max_results: int = 10
    ) -> Dict:
        """
        테마에 맞는 장소 추천 및 설명

        Args:
            places: 검색된 장소 목록
            theme: 테마 (romantic, foodie, instagram, culture, family)
            max_results: 최대 추천 개수

        Returns:
            {"recommended_places": [...], "description": "..."}
        """
        try:
            theme_descriptions = {
                "romantic": "로맨틱한 데이트 코스",
                "foodie": "로컬 맛집 투어",
                "instagram": "인스타 감성 카페 투어",
                "culture": "문화 역사 탐방",
                "family": "가족 여행 코스",
            }

            theme_name = theme_descriptions.get(theme, theme)

            # 장소 목록 텍스트 생성
            places_text = "\n".join(
                [
                    f"{i + 1}. {place['name']} (평점: {place.get('rating', 'N/A')}, 리뷰: {place.get('user_ratings_total', 0)}개)"
                    for i, place in enumerate(places)
                ]
            )

            prompt = f"""다음 장소 목록에서 "{theme_name}"에 가장 적합한 {max_results}개의 장소를 선별해주세요.

장소 목록:
{places_text}

다음 형식의 JSON으로 응답해주세요:
{{
  "recommended_indices": [선택된 장소의 인덱스 배열, 0부터 시작],
  "reason": "선택 이유 간단 설명 (1-2문장)"
}}

테마 "{theme_name}"에 가장 어울리는 장소를 선택해주세요."""

            response = self.client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "당신은 여행 큐레이터 전문가입니다. 테마에 맞는 장소를 선별하는 능력이 뛰어납니다.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.5,
                max_tokens=300,
            )

            content = response.choices[0].message.content.strip()

            # JSON 파싱
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:].strip()

            result = json.loads(content)
            recommended_indices = result.get("recommended_indices", [])

            # 추천된 장소만 필터링
            recommended_places = [
                places[i] for i in recommended_indices if i < len(places)
            ][:max_results]

            return {
                "recommended_places": recommended_places,
                "description": result.get("reason", ""),
                "theme": theme_name,
            }

        except Exception as e:
            print(f"Error recommending by theme: {e}")
            # 실패 시 평점 높은 순으로 반환
            return {
                "recommended_places": places[:max_results],
                "description": f"{theme_name} 테마에 맞는 장소를 추천합니다.",
                "theme": theme_descriptions.get(theme, theme),
            }

    def analyze_reviews(self, place_name: str, reviews: List[Dict]) -> Dict:
        """
        리뷰를 분석하여 요약 및 해시태그 생성

        Args:
            place_name: 장소명
            reviews: 리뷰 목록

        Returns:
            {"summary": "요약", "features": ["특징1", ...], "hashtags": ["#태그1", ...]}
        """
        try:
            if not reviews:
                return {
                    "summary": "리뷰 정보가 없습니다.",
                    "features": [],
                    "hashtags": [],
                }

            # 리뷰 텍스트 합치기 (최대 5개, 더 많은 내용)
            review_texts = "\n\n".join(
                [
                    f"리뷰 {i + 1} (평점: {review.get('rating', 'N/A')}점):\n{review.get('text', '')[:500]}"
                    for i, review in enumerate(reviews[:5])
                    if review.get("text")
                ]
            )

            prompt = f"""다음은 "{place_name}"의 실제 방문자 리뷰입니다. 리뷰를 꼼꼼히 읽고 구체적으로 분석해주세요.

실제 리뷰:
{review_texts}

다음 형식의 JSON으로 응답해주세요:
{{
  "summary": "이 장소만의 독특한 특징 2-3줄 (일반적인 말 X, 리뷰에서 실제로 언급된 내용만)",
  "features": [
    "리뷰에서 자주 언급된 추천 메뉴나 음식 (구체적으로)",
    "가격대나 가성비 정보 (리뷰에 있으면)",
    "방문 팁이나 주의사항 (예약 필요, 웨이팅 등)"
  ],
  "hashtags": ["#구체적키워드1", "#구체적키워드2", "#구체적키워드3", "#구체적키워드4"]
}}

중요:
- "친절한 직원", "좋은 분위기" 같은 뻔한 말 금지
- 리뷰에 나온 구체적인 메뉴명, 가격, 맛 설명 포함
- "파스타가 맛있다", "트러플 리조또 추천", "2만원대" 같은 구체적 정보
- 해시태그도 구체적으로 (예: #파스타맛집, #웨이팅각오, #예약필수)"""

            response = self.client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "당신은 미식가이자 여행 전문가입니다. 리뷰에서 구체적인 메뉴명, 가격, 맛, 팁을 찾아내어 실용적인 정보를 제공합니다. 일반적이고 뻔한 표현은 절대 사용하지 않습니다.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                max_tokens=600,
            )

            content = response.choices[0].message.content.strip()

            # JSON 파싱
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:].strip()

            result = json.loads(content)

            return {
                "summary": result.get("summary", ""),
                "features": result.get("features", []),
                "hashtags": result.get("hashtags", []),
            }

        except Exception as e:
            print(f"Error analyzing reviews: {e}")
            return {
                "summary": f"{place_name}에 대한 리뷰 분석을 진행할 수 없습니다.",
                "features": [],
                "hashtags": [],
            }


# Singleton instance
_openai_service = None


def get_openai_service() -> OpenAIService:
    """OpenAIService 싱글톤 인스턴스 반환"""
    global _openai_service
    if _openai_service is None:
        _openai_service = OpenAIService()
    return _openai_service
