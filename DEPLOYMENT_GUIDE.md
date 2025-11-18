# 🚀 배포 가이드 (Vercel + Railway)

이 가이드는 PlaceHunter 애플리케이션을 프로덕션 환경에 배포하는 방법을 안내합니다.

## 📋 배포 아키텍처

- **프론트엔드**: Vercel (Next.js)
- **백엔드**: Railway (FastAPI)
- **배포 방식**: GitHub 연동 자동 배포

## 사전 준비사항

### 1. GitHub 저장소 준비

```bash
# 로컬 저장소를 GitHub에 푸시
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. API 키 준비

다음 API 키를 미리 준비해주세요:
- **Google Maps API Key** (필수)
  - Places API
  - Geocoding API
  - Directions API
  - Maps JavaScript API
- **OpenAI API Key** (선택사항 - AI 기능용)

---

## 1️⃣ 백엔드 배포 (Railway)

### Step 1: Railway 회원가입 및 프로젝트 생성

1. [Railway](https://railway.app/) 접속
2. GitHub 계정으로 로그인
3. "New Project" 클릭
4. "Deploy from GitHub repo" 선택
5. PlaceHunter 저장소 선택
6. "Deploy Now" 클릭

### Step 2: 서비스 설정

1. Railway 대시보드에서 배포된 서비스 클릭
2. "Settings" 탭으로 이동
3. **Root Directory** 설정:
   - `backend` 입력 (중요!)

### Step 3: 환경 변수 설정

1. "Variables" 탭으로 이동
2. 다음 환경 변수들을 추가:

```bash
# 필수 환경 변수
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
PORT=8000

# 선택 환경 변수 (AI 기능용)
OPENAI_API_KEY=your_openai_api_key_here

# CORS 설정용 (Vercel 배포 후 추가)
FRONTEND_URL=https://your-app.vercel.app
```

**주의**: `FRONTEND_URL`은 Vercel 배포 완료 후 실제 URL로 업데이트해야 합니다.

### Step 4: 도메인 확인

1. "Settings" 탭에서 "Domains" 섹션 찾기
2. Railway가 자동으로 생성한 도메인 확인
   - 예: `your-app.up.railway.app`
3. 이 URL을 복사해두세요 (Vercel 설정에 필요)

### Step 5: 배포 확인

1. Railway 도메인 접속
   - 예: `https://your-app.up.railway.app`
2. 다음과 같은 응답이 나오면 성공:
   ```json
   {
     "message": "PlaceHunter API",
     "version": "1.0.0",
     "docs": "/docs"
   }
   ```
3. API 문서 확인: `https://your-app.up.railway.app/docs`

---

## 2️⃣ 프론트엔드 배포 (Vercel)

### Step 1: Vercel 회원가입 및 프로젝트 생성

1. [Vercel](https://vercel.com/) 접속
2. GitHub 계정으로 로그인
3. "Add New..." → "Project" 클릭
4. PlaceHunter 저장소 선택
5. "Import" 클릭

### Step 2: 프로젝트 설정

1. **Framework Preset**: Next.js (자동 감지됨)
2. **Root Directory**: `frontend` 선택
3. **Build Command**: `npm run build` (기본값)
4. **Output Directory**: `.next` (기본값)
5. **Install Command**: `npm install` (기본값)

### Step 3: 환경 변수 설정

"Environment Variables" 섹션에서 다음 변수들을 추가:

```bash
# 필수 환경 변수
NEXT_PUBLIC_BACKEND_URL=https://your-app.up.railway.app
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**중요**: 
- `NEXT_PUBLIC_BACKEND_URL`에는 Railway에서 복사한 백엔드 URL을 입력
- 프로토콜(`https://`)을 반드시 포함
- URL 끝에 슬래시(`/`)는 제거

### Step 4: 배포 실행

1. "Deploy" 버튼 클릭
2. 빌드 및 배포 진행 상황 확인 (약 2-3분 소요)
3. 배포 완료 후 Vercel이 제공하는 URL 확인
   - 예: `https://your-app.vercel.app`

### Step 5: Railway CORS 설정 업데이트

1. Railway 대시보드로 돌아가기
2. "Variables" 탭에서 `FRONTEND_URL` 업데이트:
   ```bash
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. 저장하면 백엔드가 자동으로 재배포됩니다

---

## 3️⃣ 배포 확인 및 테스트

### 1. 프론트엔드 접속

Vercel URL로 접속하여 메인 페이지가 정상적으로 로드되는지 확인:
- `https://your-app.vercel.app`

### 2. 기능 테스트

#### 기본 검색 테스트
1. 메인 페이지의 "🔍 기본 검색" 탭 선택
2. 도시명: `Tokyo`
3. 키워드: `ramen`
4. "장소 검색" 버튼 클릭
5. 결과가 정상적으로 표시되는지 확인

#### AI 검색 테스트 (OpenAI API 설정한 경우)
1. "🤖 AI 검색" 탭 선택
2. 검색어 입력: `도쿄 라멘 맛집`
3. "🤖 AI 검색" 버튼 클릭
4. AI가 자연어를 파싱하여 검색하는지 확인

#### 동선 생성 테스트
1. 검색 결과에서 3-4개 장소 선택
2. "동선 생성하기" 버튼 클릭
3. 지도에 최적화된 경로가 표시되는지 확인
4. 우측 패널에서 상세 일정 확인

### 3. 개발자 도구 확인

브라우저 개발자 도구(F12)에서:
- **Console 탭**: 에러가 없는지 확인
- **Network 탭**: API 호출이 성공하는지 확인 (200 응답)

### 4. 모바일 테스트

모바일 기기나 브라우저의 반응형 모드로:
- 레이아웃이 올바르게 표시되는지 확인
- 터치 인터랙션이 정상 작동하는지 확인

---

## 4️⃣ 자동 배포 설정

### GitHub 연동 자동 배포

이제 코드를 푸시하면 자동으로 배포됩니다:

```bash
# 코드 수정 후
git add .
git commit -m "Update feature"
git push origin main

# Railway와 Vercel이 자동으로 감지하여 배포 시작
```

### 브랜치별 배포 (Vercel)

Vercel은 각 브랜치마다 프리뷰 배포를 자동 생성:
- `main` 브랜치 → 프로덕션 배포
- 다른 브랜치 → 프리뷰 배포 (테스트용)

---

## 5️⃣ 도메인 연결 (선택사항)

### Vercel 커스텀 도메인

1. Vercel 프로젝트 대시보드
2. "Settings" → "Domains"
3. 도메인 입력 및 DNS 설정 안내 따라하기

### Railway 커스텀 도메인

1. Railway 프로젝트 대시보드
2. "Settings" → "Domains"
3. "Custom Domain" 클릭
4. 도메인 입력 및 DNS 설정

---

## 6️⃣ 모니터링 및 로그

### Railway 로그 확인

1. Railway 대시보드에서 서비스 클릭
2. "Deployments" 탭에서 최신 배포 클릭
3. "View Logs" 버튼으로 실시간 로그 확인

### Vercel 로그 확인

1. Vercel 프로젝트 대시보드
2. "Deployments" 탭
3. 원하는 배포 클릭하여 로그 확인

---

## 🐛 문제 해결

### 1. 백엔드 연결 실패

**증상**: 프론트엔드에서 장소 검색 시 에러 발생

**해결 방법**:
1. Railway 백엔드 URL이 정확한지 확인
2. Vercel 환경 변수 `NEXT_PUBLIC_BACKEND_URL` 확인
3. Railway 환경 변수 `FRONTEND_URL` 확인
4. 브라우저 콘솔에서 CORS 에러 확인

### 2. Google Maps 로드 실패

**증상**: 지도가 표시되지 않거나 회색 화면

**해결 방법**:
1. Google Maps API 키가 올바른지 확인
2. Google Cloud Console에서 다음 API 활성화 확인:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Directions API
3. API 키에 HTTP 리퍼러 제한이 있다면 Vercel 도메인 추가

### 3. AI 기능이 작동하지 않음

**증상**: AI 검색/리뷰 분석 버튼 클릭 시 에러

**해결 방법**:
1. Railway에 `OPENAI_API_KEY` 환경 변수가 설정되어 있는지 확인
2. OpenAI API 키가 유효하고 크레딧이 남아있는지 확인
3. Railway 로그에서 상세 에러 메시지 확인

### 4. 빌드 실패

**Vercel 빌드 실패**:
- 빌드 로그 확인
- `frontend/package.json` 의존성 확인
- Node.js 버전 호환성 확인

**Railway 빌드 실패**:
- 배포 로그 확인
- `backend/requirements.txt` 의존성 확인
- Python 버전 호환성 확인 (3.11+ 권장)

### 5. 환경 변수 업데이트 후 변경사항이 반영되지 않음

**해결 방법**:
- Vercel: 환경 변수 수정 후 프로젝트 재배포 필요
  - "Deployments" → 최신 배포 → "..." → "Redeploy"
- Railway: 환경 변수 저장 시 자동 재배포

---

## 📊 비용 안내

### Vercel
- **Hobby 플랜** (무료)
  - 개인 프로젝트에 충분
  - 월 100GB 대역폭
  - 무제한 배포

### Railway
- **무료 크레딧**: 월 $5 (약 500시간)
- 사용량 초과 시 과금
- 비활성 시간에는 비용 없음

### Google Maps API
- 월 $200 무료 크레딧
- 일반적인 사용에서는 무료 범위 내에서 충분

### OpenAI API
- 사용량 기반 과금
- GPT-4 Turbo mini 사용 시 비용 효율적
- 월 $5-10 정도면 개인 프로젝트에 충분

---

## 🎉 배포 완료!

축하합니다! PlaceHunter가 성공적으로 배포되었습니다.

이제 친구들과 URL을 공유하고 함께 여행 계획을 세워보세요!

**프로덕션 URL**:
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-app.up.railway.app`
- API Docs: `https://your-app.up.railway.app/docs`

---

## 📚 추가 리소스

- [Vercel 문서](https://vercel.com/docs)
- [Railway 문서](https://docs.railway.app)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [FastAPI 배포 가이드](https://fastapi.tiangolo.com/deployment/)

---

## 💡 팁

1. **환경 변수 보안**: API 키는 절대 코드에 하드코딩하지 마세요
2. **정기 모니터링**: Railway/Vercel 대시보드에서 주기적으로 상태 확인
3. **비용 관리**: Railway 사용량 모니터링으로 예상치 못한 과금 방지
4. **백업**: 중요한 설정은 문서화해두기
5. **Git 전략**: 프로덕션 배포 전 develop 브랜치에서 테스트

즐거운 여행 계획 되세요! 🌍✨

