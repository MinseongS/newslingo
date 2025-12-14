# Newslingo 📰

영어 뉴스를 한국어로 번역하여 제공하는 무료 영어 학습 플랫폼입니다. 매일 최신 영어 뉴스를 수집하고, AI를 활용해 번역 및 분류하여 사용자에게 제공합니다.

## 🌟 주요 기능

- **실시간 뉴스 수집**: Arirang News API를 통한 최신 영어 뉴스 자동 수집
- **AI 번역**: Google Gemini API를 활용한 고품질 영어-한국어 번역
- **뉴스 분류**: FastText 모델을 사용한 뉴스 카테고리 자동 분류
- **TTS 지원**: Google Cloud Text-to-Speech를 활용한 오디오 제공
- **사용자 인증**: Google OAuth를 통한 소셜 로그인
- **게시판 기능**: 뉴스에 대한 댓글 및 커뮤니티 게시판
- **반응형 디자인**: 모바일 및 데스크톱 최적화

## 🏗️ 기술 스택

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS
- **Authentication**: NextAuth.js (Google OAuth)
- **Database ORM**: Prisma
- **State Management**: Zustand
- **Deployment**: Kubernetes, Nginx

### Backend
- **Task Queue**: Celery
- **Message Broker**: RabbitMQ
- **Cache**: Redis
- **Database**: PostgreSQL
- **AI/ML**: 
  - Google Gemini API (번역)
  - FastText (언어 감지 및 분류)
  - Google Cloud TTS (음성 합성)

**Note**: Frontend는 Next.js를 사용하여 서버 사이드 렌더링 및 API 라우트를 제공합니다.

### Infrastructure
- **Container**: Docker
- **Orchestration**: Kubernetes
- **CI/CD**: Skaffold
- **Certificate**: cert-manager (Let's Encrypt)

## 📁 프로젝트 구조

```
newslingo/
├── frontend/          # Next.js 프론트엔드 및 백엔드 (서버 사이드 렌더링 + API)
│   ├── app/           # Next.js App Router 페이지 및 API 라우트
│   ├── components/    # React 컴포넌트
│   ├── lib/           # 유틸리티 및 설정
│   └── prisma/        # Prisma 스키마
├── collector/         # Celery 워커 및 스케줄러 (데이터 수집 및 처리)
│   └── celery_app/
│       ├── services/  # 뉴스 수집, 번역, 분류 서비스
│       ├── models/    # 데이터베이스 모델
│       └── pipeline/  # 데이터 처리 파이프라인
└── helm/              # Kubernetes Helm 차트
```

## 🚀 시작하기

### 사전 요구사항

- Node.js 18+ 
- Python 3.9+
- Docker & Docker Compose
- Kubernetes 클러스터 (선택사항)
- PostgreSQL
- RabbitMQ
- Redis

### 환경 변수 설정

각 서비스별로 환경 변수 파일을 생성해야 합니다.

#### Frontend (.env.local)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/newslingo"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

#### Collector (.env.local)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/newslingo"
ARIRANG_URL="https://api.arirang.com"
SERVICE_KEY="your-arirang-service-key"
GEMINI_KEY="your-google-gemini-api-key"
NEWS_NUMBER="10"
TTS_OUTPUT_DIR="/app/tts_output"
RABBITMQ_SERVER_HOST="localhost"
RABBITMQ_PORT="5672"
RABBITMQ_USER="guest"
RABBITMQ_DEFAULT_PASS="guest"
```

### 로컬 개발 환경 실행

#### 1. 데이터베이스 설정
```bash
# PostgreSQL 실행
docker-compose up -d postgres

# Prisma 마이그레이션
cd frontend
npx prisma migrate dev
npx prisma generate
```

#### 2. Frontend 실행
```bash
cd frontend
npm install
npm run dev
```

#### 3. Celery Worker 실행
```bash
cd collector
pip install -r requirements.txt
celery -A scheduler worker --loglevel=info
```

#### 4. Celery Scheduler 실행
```bash
cd collector
celery -A scheduler beat --loglevel=info
```

### Kubernetes 배포

Helm 차트를 사용하여 Kubernetes 클러스터에 배포할 수 있습니다.

```bash
# Collector 배포
cd collector/helm
helm install newslingo-collector . -f values.yaml

# Frontend 배포
cd frontend/helm
helm install newslingo-frontend . -f values.yaml
```

## 🔄 시스템 아키텍처

![시스템 아키텍처](./docs/images/architecture.png)

이 프로젝트는 **Next.js 기반의 풀스택 애플리케이션**과 **Celery 기반의 데이터 수집 파이프라인**으로 구성됩니다.

- **Frontend (Next.js)**: 서버 사이드 렌더링, API 라우트, 사용자 인터페이스 제공
- **Collector (Celery)**: 뉴스 수집, 번역, 분류, TTS 변환 등의 백그라운드 작업 처리
- **Database (PostgreSQL)**: 뉴스 데이터, 사용자 정보, 댓글 등 저장
- **Message Queue (RabbitMQ)**: Celery 작업 큐 관리
- **Cache (Redis)**: Celery 결과 백엔드

## 📝 주요 기능 설명

### 뉴스 수집 파이프라인
1. **수집**: Arirang News API에서 최신 뉴스 수집
2. **분류**: FastText 모델을 사용한 카테고리 자동 분류
3. **번역**: Google Gemini API를 활용한 영어-한국어 번역
4. **TTS 변환**: Google Cloud TTS를 사용한 오디오 생성
5. **저장**: PostgreSQL 데이터베이스에 저장

### 사용자 기능
- 뉴스 목록 조회 및 검색
- 뉴스 상세 보기 (영어/한국어 분할 보기 지원)
- 뉴스 오디오 재생
- 댓글 작성 및 수정
- 커뮤니티 게시판

## 🛠️ 개발

### 데이터베이스 마이그레이션
```bash
# Frontend (Prisma)
cd frontend
npx prisma migrate dev

# Collector (Alembic)
cd collector
alembic upgrade head
```

### 테스트
```bash
# Collector 테스트
cd collector
pytest
```

## 📄 라이선스

이 프로젝트는 개인 포트폴리오 프로젝트입니다.

## 👤 작성자

개인 포트폴리오 프로젝트로 개발되었습니다.

---

**Note**: 이 프로젝트는 학습 및 포트폴리오 목적으로 제작되었습니다. 프로덕션 환경에서 사용하기 전에 보안 설정 및 환경 변수를 적절히 구성해주세요.

