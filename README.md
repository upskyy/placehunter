# 🌍 PlaceHunter - 여행 장소 추천 서비스

도시명과 키워드만 입력하면 구글 평점 기반으로 필터링된 장소를 추천하고, 최적의 여행 동선을 자동으로 만들어주는 웹 서비스입니다.

## ✨ 주요 기능

### 검색 & 필터링
- 🔍 **간편한 장소 검색**: 도시명과 키워드(카페, 맛집, 박물관 등)만으로 빠른 검색
- 🤖 **AI 자연어 검색**: "로마 피자 맛집" 같은 자연어로 검색 (OpenAI 활용)
- ⭐ **평점 기반 필터링**: 구글 평점 기준으로 원하는 수준 이상의 장소만 추천
- 📊 **리뷰 수 필터링**: 최소 리뷰 개수 설정으로 검증된 장소만 선택
- 💬 **AI 리뷰 분석**: 실제 방문자 리뷰를 AI가 분석하여 요약, 특징, 해시태그 제공

### 일정 관리
- ⏰ **시간 기반 최적화**: 시작 시간 설정 시 각 장소의 도착/출발 시간 자동 계산
- 📅 **일정 템플릿**: 반나절/하루/이틀 코스 템플릿으로 빠른 시작
- 🕐 **영업시간 표시**: 상세 영업시간 및 영업 중 상태 확인
- 💰 **예산 계산**: 각 장소의 가격대 및 총 예산 자동 계산

### 동선 & 가이드
- 🗺️ **최적 동선 생성**: TSP 알고리즘으로 효율적인 방문 순서 자동 생성
- 🚶 **도보 중심 동선**: 걷기 기반의 최적화된 여행 코스
- 🎯 **AI 여행 가이드**: 생성된 동선에 대한 상세한 AI 설명 제공
- 🔗 **구글맵 연동**: 장소 이름 클릭 시 구글맵으로 바로 이동

### 기타
- 📱 **반응형 디자인**: 모바일과 데스크톱 모두 지원
- 📋 **동선 복사**: 일정을 텍스트로 복사하여 공유

### DevOps
- Docker & Docker Compose

## 📋 사전 요구사항

1. **Docker & Docker Compose** 설치

2. **Google Maps API 키** 발급 (필수)
   - [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
   - 다음 API 활성화:
     - Places API
     - Geocoding API
     - Directions API
     - Maps JavaScript API
   - API 키 생성 및 복사
   - 자세한 가이드: `SETUP_GUIDE.md` 참조

3. **OpenAI API 키** 발급 (선택사항 - AI 기능용)
   - [OpenAI Platform](https://platform.openai.com/api-keys)에서 키 생성
   - AI 자연어 검색 및 여행 가이드 기능에 사용
   - 없어도 기본 검색 기능은 정상 작동
   - 자세한 가이드: `ENV_SETUP.md` 참조

## 🚀 설치 및 실행


### 1. 저장소 클론

```bash
git clone https://github.com/upskyy/placehunter.git
cd placehunter
```

### 2. 환경 변수 설정

루트 디렉토리에 `.env` 파일 생성:

```bash
touch .env
```

`.env` 파일에 API 키 입력:

```env
# Google Maps API (필수)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here
```

**참고**: OpenAI API 키가 없어도 기본 검색 기능은 정상 작동합니다.

### 3. Docker Compose로 실행

```bash
docker-compose up --build
```

처음 실행 시 이미지 빌드와 의존성 설치로 시간이 소요될 수 있습니다.

### 4. 서비스 접속

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API 문서**: http://localhost:8000/docs
