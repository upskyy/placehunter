import os
import googlemaps
from typing import List, Dict, Optional
from datetime import datetime


class GoogleMapsService:
    def __init__(self):
        api_key = os.getenv("GOOGLE_MAPS_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_MAPS_API_KEY environment variable is not set")
        self.client = googlemaps.Client(key=api_key)

    def _get_city_location(self, city: str) -> Optional[Dict]:
        """
        도시명으로 위치 좌표 가져오기 (지역 한정 검색용)

        Args:
            city: 도시명

        Returns:
            {'lat': float, 'lng': float} 또는 None
        """
        try:
            geocode_result = self.client.geocode(city)
            if geocode_result and len(geocode_result) > 0:
                location = geocode_result[0]["geometry"]["location"]
                return {"lat": location["lat"], "lng": location["lng"]}
            return None
        except Exception as e:
            print(f"Error getting city location: {e}")
            return None

    def search_places(
        self,
        city: str,
        keyword: str,
        min_rating: float = 4.3,
        min_reviews: int = 500,
        max_results: int = 20,
    ) -> List[Dict]:
        """
        도시와 키워드로 장소 검색

        Args:
            city: 도시명
            keyword: 검색 키워드
            min_rating: 최소 평점
            min_reviews: 최소 리뷰 개수
            max_results: 최대 결과 개수

        Returns:
            필터링 및 정렬된 장소 목록 (평점 높은 순)
        """
        try:
            # 1. 도시 위치 좌표 가져오기 (지역 한정용)
            city_location = self._get_city_location(city)

            # 2. 검색 쿼리 구성
            query = f"{keyword} in {city}"

            # 3. Places API text search with location bias
            search_params = {"query": query}

            if city_location:
                # 도시 좌표를 중심으로 50km 반경 내 우선 검색
                search_params["location"] = (city_location["lat"], city_location["lng"])
                search_params["radius"] = 50000  # 50km

            places_result = self.client.places(**search_params)

            if not places_result or "results" not in places_result:
                return []

            filtered_places = []

            for place in places_result["results"]:
                # 평점 필터링
                rating = place.get("rating", 0)
                if rating < min_rating:
                    continue

                # 리뷰 수 필터링
                user_ratings_total = place.get("user_ratings_total", 0)
                if user_ratings_total < min_reviews:
                    continue

                # 지역 필터링 강화 (주소에 도시명이 포함되어 있는지 확인)
                address = place.get("formatted_address", "").lower()
                if city_location and city.lower() not in address:
                    # 도시명이 주소에 없으면 거리 체크
                    place_location = place["geometry"]["location"]
                    distance = self._calculate_distance(
                        city_location["lat"],
                        city_location["lng"],
                        place_location["lat"],
                        place_location["lng"],
                    )
                    # 50km 이상 떨어져 있으면 제외
                    if distance > 50:
                        continue

                # 장소 정보 구성
                place_info = {
                    "place_id": place.get("place_id"),
                    "name": place.get("name"),
                    "rating": rating,
                    "user_ratings_total": place.get("user_ratings_total", 0),
                    "address": place.get("formatted_address", ""),
                    "location": {
                        "lat": place["geometry"]["location"]["lat"],
                        "lng": place["geometry"]["location"]["lng"],
                    },
                    "types": place.get("types", []),
                    "price_level": place.get("price_level"),
                }

                # 사진 정보
                if "photos" in place:
                    photos = []
                    for photo in place["photos"][:3]:  # 최대 3개
                        photos.append(
                            {
                                "photo_reference": photo.get("photo_reference"),
                                "width": photo.get("width"),
                                "height": photo.get("height"),
                            }
                        )
                    place_info["photos"] = photos
                else:
                    place_info["photos"] = []

                # 영업시간 상세 정보
                if "opening_hours" in place:
                    opening_hours = place["opening_hours"]
                    place_info["opening_hours"] = {
                        "open_now": opening_hours.get("open_now", False),
                        "weekday_text": opening_hours.get("weekday_text", []),
                    }
                    
                    # 상세 정보가 없으면 place details API 호출
                    if not opening_hours.get("weekday_text"):
                        details = self.get_place_details(place.get("place_id"))
                        if details and "opening_hours" in details:
                            place_info["opening_hours"]["weekday_text"] = details[
                                "opening_hours"
                            ].get("weekday_text", [])
                else:
                    place_info["opening_hours"] = None

                filtered_places.append(place_info)

            # 평점 높은 순으로 정렬 (평점 같으면 리뷰 수 많은 순)
            filtered_places.sort(
                key=lambda x: (x["rating"], x["user_ratings_total"]), reverse=True
            )

            # 최대 결과 개수로 제한
            return filtered_places[:max_results]

        except Exception as e:
            print(f"Error searching places: {e}")
            raise

    def get_place_details(self, place_id: str) -> Optional[Dict]:
        """
        장소 상세 정보 가져오기

        Args:
            place_id: Google Place ID

        Returns:
            장소 상세 정보
        """
        try:
            result = self.client.place(place_id=place_id)
            return result.get("result")
        except Exception as e:
            print(f"Error getting place details: {e}")
            return None
    
    def get_place_reviews(self, place_id: str) -> List[Dict]:
        """
        장소의 리뷰 가져오기
        
        Args:
            place_id: Google Place ID
            
        Returns:
            리뷰 목록
        """
        try:
            details = self.get_place_details(place_id)
            if details and "reviews" in details:
                reviews = []
                for review in details["reviews"][:5]:  # 최대 5개
                    reviews.append({
                        "author": review.get("author_name", ""),
                        "rating": review.get("rating", 0),
                        "text": review.get("text", ""),
                        "time": review.get("relative_time_description", "")
                    })
                return reviews
            return []
        except Exception as e:
            print(f"Error getting reviews: {e}")
            return []

    def calculate_route(self, locations: List[Dict], mode: str = "walking") -> Dict:
        """
        여러 장소 간의 최적 경로 계산

        Args:
            locations: 장소 목록 (각 장소는 lat, lng 포함)
            mode: 이동 수단 (walking, transit, driving)

        Returns:
            경로 정보 (거리, 시간 등)
        """
        if len(locations) < 2:
            return {"routes": [], "total_distance": 0, "total_duration": 0}

        try:
            routes = []
            total_distance = 0
            total_duration = 0

            # 각 구간별 경로 계산
            for i in range(len(locations) - 1):
                origin = (locations[i]["lat"], locations[i]["lng"])
                destination = (locations[i + 1]["lat"], locations[i + 1]["lng"])

                directions = self.client.directions(
                    origin=origin,
                    destination=destination,
                    mode=mode,
                    departure_time=datetime.now(),
                )

                if directions and len(directions) > 0:
                    leg = directions[0]["legs"][0]

                    route_segment = {
                        "from_index": i,
                        "to_index": i + 1,
                        "distance": leg["distance"]["value"],  # meters
                        "duration": leg["duration"]["value"],  # seconds
                        "distance_text": leg["distance"]["text"],
                        "duration_text": leg["duration"]["text"],
                    }

                    routes.append(route_segment)
                    total_distance += leg["distance"]["value"]
                    total_duration += leg["duration"]["value"]

            return {
                "routes": routes,
                "total_distance": total_distance,
                "total_duration": total_duration,
            }

        except Exception as e:
            print(f"Error calculating route: {e}")
            raise

    def optimize_route_order(
        self, places: List[Dict], mode: str = "walking"
    ) -> List[Dict]:
        """
        TSP 알고리즘을 사용하여 최적 방문 순서 결정

        간단한 Nearest Neighbor 알고리즘 사용

        Args:
            places: 장소 목록
            mode: 이동 수단

        Returns:
            최적화된 순서의 장소 목록
        """
        if len(places) <= 2:
            return places

        # 첫 번째 장소를 시작점으로
        optimized = [places[0]]
        remaining = places[1:].copy()

        while remaining:
            current = optimized[-1]

            # 현재 위치에서 가장 가까운 다음 장소 찾기
            min_distance = float("inf")
            nearest_idx = 0

            for idx, place in enumerate(remaining):
                distance = self._calculate_distance(
                    current["location"]["lat"],
                    current["location"]["lng"],
                    place["location"]["lat"],
                    place["location"]["lng"],
                )

                if distance < min_distance:
                    min_distance = distance
                    nearest_idx = idx

            optimized.append(remaining.pop(nearest_idx))

        return optimized

    def _calculate_distance(
        self, lat1: float, lng1: float, lat2: float, lng2: float
    ) -> float:
        """
        두 지점 간의 대략적인 거리 계산 (Haversine formula)

        Returns:
            거리 (km)
        """
        from math import radians, sin, cos, sqrt, atan2

        R = 6371  # 지구 반경 (km)

        lat1, lng1, lat2, lng2 = map(radians, [lat1, lng1, lat2, lng2])
        dlat = lat2 - lat1
        dlng = lng2 - lng1

        a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlng / 2) ** 2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))

        return R * c


# Singleton instance
_google_maps_service = None


def get_google_maps_service() -> GoogleMapsService:
    """GoogleMapsService 싱글톤 인스턴스 반환"""
    global _google_maps_service
    if _google_maps_service is None:
        _google_maps_service = GoogleMapsService()
    return _google_maps_service
