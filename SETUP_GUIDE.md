# Google Maps API 설정 가이드

PlaceHunter를 사용하기 위해서는 **Google Maps Platform**의 API 키가 필요합니다. 이 가이드를 따라 단계별로 API 키를 발급받으세요.

## 📍 Google Maps Platform이란?

**웹사이트**: https://console.cloud.google.com

Google Maps Platform은 구글이 제공하는 지도 및 위치 기반 서비스 API입니다. PlaceHunter는 다음 4가지 API를 사용합니다:

- **Places API**: 장소 검색 및 정보 조회 (카페, 레스토랑 등)
- **Geocoding API**: 도시명을 좌표로 변환 (정확한 지역 한정 검색)
- **Directions API**: 두 지점 간의 경로, 거리, 소요 시간 계산
- **Maps JavaScript API**: 웹 브라우저에서 인터랙티브 지도 표시

## 🚀 전체 설정 과정 요약

1. Google Cloud Console 접속 및 프로젝트 생성
2. 결제 계정 등록 (매월 $200 무료 크레딧 제공)
3. 필요한 4개 API 활성화
4. API 키 생성 및 보안 설정
5. PlaceHunter에 API 키 설정

---

## 1단계: Google Cloud Console 접속

### 1.1 사이트 접속

1. 웹 브라우저에서 **[Google Cloud Console](https://console.cloud.google.com/)** 접속
2. 구글 계정으로 로그인
   - Gmail 계정이 있다면 해당 계정으로 로그인
   - 없다면 새로 구글 계정 생성 필요

### 1.2 첫 접속 시

- Google Cloud Platform 약관 동의 필요
- "동의 및 계속" 버튼 클릭

---

## 2단계: 새 프로젝트 생성

Google Cloud에서는 **프로젝트** 단위로 API를 관리합니다.

### 2.1 프로젝트 생성하기

1. **상단 네비게이션 바**에서 프로젝트 선택 드롭다운 클릭
   - "프로젝트 선택" 또는 "My First Project" 등으로 표시됨
2. 팝업 창에서 **"새 프로젝트"** 버튼 클릭
3. 프로젝트 정보 입력:
   - **프로젝트 이름**: `PlaceHunter` (또는 원하는 이름)
   - **위치**: 조직 없음 (개인 프로젝트는 기본값 사용)
4. **"만들기"** 버튼 클릭
5. 프로젝트 생성 완료까지 10-20초 대기

### 2.2 생성된 프로젝트 선택

- 상단 드롭다운에서 방금 만든 프로젝트(`PlaceHunter`)가 선택되었는지 확인

---

## 3단계: 결제 계정 설정

### 3.1 왜 결제 계정이 필요한가?

- Google Maps Platform은 **유료 서비스**이지만 **매월 $200 무료 크레딧** 제공
- 대부분의 개인 프로젝트는 무료 크레딧 범위 내에서 사용 가능
- 크레딧 초과 시에만 과금 (한도 설정 가능)

### 3.2 결제 계정 등록하기

1. 좌측 메뉴 **☰ (햄버거 메뉴)** 클릭
2. **"결제"** 메뉴 선택
3. **"결제 계정 추가"** 또는 **"결제 사용 설정"** 클릭
4. 결제 정보 입력:
   - 국가 선택: **대한민국**
   - 체크박스 체크 및 계속
5. 신용카드 또는 직불카드 정보 입력
   - 카드번호, 만료일, CVC, 우편번호
   - **1,000원 정도의 인증 결제** 진행 (환불됨)
6. **"무료 체험 시작"** 또는 **"결제 프로필 만들기"** 완료

### 3.3 무료 크레딧 확인

- 결제 계정 페이지에서 매월 $200 크레딧 확인 가능
- 90일간 $300 추가 크레딧 제공 (신규 가입 시)

---

## 4단계: 필요한 4개 API 활성화

PlaceHunter는 총 **4개의 API**를 사용합니다. 각각 활성화가 필요합니다.

### 4.1 API 라이브러리 접속

1. 좌측 메뉴에서 **"API 및 서비스"** 클릭
2. **"라이브러리"** 선택

---

### API #1: Places API (장소 검색)

**용도**: 도시와 키워드로 카페, 레스토랑 등의 장소 검색

**활성화 방법**:
1. 검색창에 **"Places API"** 입력
2. 검색 결과에서 **"Places API"** 클릭
   - ⚠️ 주의: "Places API (New)" 가 아닌 일반 "Places API" 선택
3. **"사용 설정"** 버튼 클릭
4. API가 활성화될 때까지 10초 정도 대기

---

### API #2: Geocoding API (도시 위치 검색)

**용도**: 도시명을 좌표로 변환하여 정확한 지역 한정 검색

**활성화 방법**:
1. 다시 "API 라이브러리"로 돌아가기
   - 상단의 "← API 라이브러리" 링크 클릭
2. 검색창에 **"Geocoding API"** 입력
3. **"Geocoding API"** 클릭
4. **"사용 설정"** 버튼 클릭

---

### API #3: Directions API (경로 계산)

**용도**: 선택한 장소들 간의 이동 거리와 소요 시간 계산

**활성화 방법**:
1. 다시 "API 라이브러리"로 돌아가기
2. 검색창에 **"Directions API"** 입력
3. **"Directions API"** 클릭
4. **"사용 설정"** 버튼 클릭

---

### API #4: Maps JavaScript API (지도 표시)

**용도**: 웹 페이지에서 인터랙티브 구글 지도 표시

**활성화 방법**:
1. 다시 "API 라이브러리"로 돌아가기
2. 검색창에 **"Maps JavaScript API"** 입력
3. **"Maps JavaScript API"** 클릭
4. **"사용 설정"** 버튼 클릭

### 4.5 활성화 확인

1. 좌측 메뉴에서 **"API 및 서비스"** > **"대시보드"** 선택
2. 다음 4개 API가 목록에 표시되는지 확인:
   - ✅ Places API
   - ✅ Geocoding API
   - ✅ Directions API
   - ✅ Maps JavaScript API

---

## 5단계: API 키 생성

API 키는 PlaceHunter가 Google Maps API를 사용하기 위한 **인증 비밀번호**입니다.

### 5.1 API 키 만들기

1. 좌측 메뉴에서 **"API 및 서비스"** 클릭
2. **"사용자 인증 정보"** 선택
3. 상단의 **"+ 사용자 인증 정보 만들기"** 버튼 클릭
4. 드롭다운 메뉴에서 **"API 키"** 선택
5. API 키가 생성되고 팝업 창에 표시됨
   - 형식: `AIzaSyD...` (약 39자)
6. **"키 복사"** 버튼 클릭하여 클립보드에 복사
7. 안전한 곳에 임시 저장 (메모장 등)

⚠️ **중요**: API 키는 재발급 불가하므로 분실 시 새로 생성해야 합니다.

### 5.2 API 키 이름 변경 (선택사항)

1. 생성된 키 목록에서 방금 만든 키 클릭
2. 상단에서 이름을 `PlaceHunter API Key`로 변경
3. 나중에 여러 키가 있을 때 구분하기 쉬움

---

## 6단계: API 키 보안 설정 (필수)

API 키가 노출되면 다른 사람이 무단 사용할 수 있습니다. 보안 설정이 필수입니다.

### 6.1 API 키 편집 화면 접속

1. **"사용자 인증 정보"** 페이지에서 방금 만든 API 키 클릭
2. 또는 API 키 옆의 **연필 아이콘(✏️)** 클릭

### 6.2 애플리케이션 제한 설정

**개발 단계 (로컬 테스트)**:
1. **"애플리케이션 제한사항"** 섹션에서 **"없음"** 선택
2. 이렇게 하면 localhost에서도 API 사용 가능

**프로덕션 배포 시**:
1. **"HTTP 리퍼러(웹사이트)"** 선택
2. **"항목 추가"** 클릭
3. 허용할 도메인 입력 예시:
   - `http://localhost:3000/*` (개발 환경)
   - `https://yourdomain.com/*` (실제 배포 도메인)
   - `http://localhost:8000/*` (백엔드)

### 6.3 API 제한 설정 (중요)

이 설정을 통해 이 키로 사용할 수 있는 API를 제한합니다.

1. **"API 제한사항"** 섹션에서 **"키 제한"** 선택
2. 드롭다운에서 다음 4개 API **만** 체크:
   - ✅ **Places API**
   - ✅ **Geocoding API**
   - ✅ **Directions API**
   - ✅ **Maps JavaScript API**
3. 다른 API는 모두 체크 해제
4. 하단의 **"저장"** 버튼 클릭

⚠️ **저장 시 1-2분 정도 소요**될 수 있습니다.

---

## 7단계: PlaceHunter에 API 키 설정

### 7.1 프로젝트 디렉토리에서 환경 변수 파일 생성

터미널 또는 파일 탐색기에서:

```bash
cd ~/placehunter
```

### 7.2 .env 파일 생성

```bash
# .env.example 파일을 복사
cp .env.example .env
```

또는 직접 `.env` 파일 생성

### 7.3 API 키 입력

`.env` 파일을 텍스트 에디터로 열고:

```env
GOOGLE_MAPS_API_KEY=AIzaSyD_your_actual_api_key_here
```

- `your_actual_api_key_here` 부분을 **복사한 실제 API 키로 교체**
- 공백이나 따옴표 없이 입력
- 예시: `GOOGLE_MAPS_API_KEY=AIzaSyDAbC123XyZ789...`

### 7.4 저장 및 확인

1. 파일 저장 
2. `.env` 파일이 프로젝트 루트에 있는지 확인

---

## 8단계: 서비스 실행 및 테스트

### 8.1 Docker로 PlaceHunter 실행

```bash
docker-compose up --build
```

### 8.2 API 키 작동 확인

1. 브라우저에서 http://localhost:3000 접속
2. 도시명 (예: **Tokyo**)과 키워드 (예: **cafe**) 입력
3. 검색 버튼 클릭
4. 결과가 정상적으로 표시되면 성공! ✅

### 8.3 API 키 오류 시

오류가 발생하면 다음을 확인:
- `.env` 파일에 API 키가 올바르게 입력되었는지
- API 키에 공백이나 따옴표가 없는지
- 3개 API가 모두 활성화되었는지
- API 키 제한 설정이 올바른지

---



### 공식 문서
- [Google Maps Platform 시작 가이드](https://developers.google.com/maps/get-started)
- [Places API 문서](https://developers.google.com/maps/documentation/places/web-service)
- [Directions API 문서](https://developers.google.com/maps/documentation/directions)
- [Maps JavaScript API 문서](https://developers.google.com/maps/documentation/javascript)

### 가격 및 할당량
- [Google Maps Platform 가격표](https://mapsplatform.google.com/pricing/)
- [할당량 한도 확인](https://console.cloud.google.com/apis/api/maps-backend.googleapis.com/quotas)

### 커뮤니티 지원
- [Stack Overflow - Google Maps](https://stackoverflow.com/questions/tagged/google-maps)
- [Google Maps Platform 지원 포럼](https://support.google.com/maps)

