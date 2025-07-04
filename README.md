<<<<<<< HEAD
# 육아 기록 사진 다이어리 앱

부부가 공동으로 관리할 수 있는 육아 기록용 사진/동영상 다이어리 웹 애플리케이션입니다.

## 기술 스택

### 프론트엔드
- React.js + TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

### 백엔드
- Node.js + Express.js + TypeScript
- Prisma ORM
- PostgreSQL
- JWT + bcrypt
- Cloudinary (이미지/동영상 업로드)

## 프로젝트 구조

```
├── frontend/              # React 프론트엔드
│   ├── src/
│   │   ├── components/    # 재사용 가능한 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── context/       # React Context
│   │   ├── services/      # API 서비스
│   │   ├── types/         # TypeScript 타입 정의
│   │   ├── hooks/         # 커스텀 훅
│   │   └── utils/         # 유틸리티 함수
│   └── package.json
├── backend/               # Node.js 백엔드
│   ├── src/
│   │   ├── routes/        # API 라우터
│   │   ├── controllers/   # 컨트롤러
│   │   ├── middleware/    # 미들웨어
│   │   ├── config/        # 설정 파일
│   │   └── utils/         # 유틸리티 함수
│   ├── prisma/
│   │   └── schema.prisma  # 데이터베이스 스키마
│   └── package.json
└── README.md
```

## 개발 환경 설정

### 1. 환경 변수 설정

#### 백엔드 (.env)
```bash
cp backend/.env.example backend/.env
```

#### 프론트엔드 (.env)
```bash
cp frontend/.env.example frontend/.env
```

### 2. 백엔드 설정

```bash
cd backend
npm install
npm run db:generate
npm run db:push
npm run dev
```

### 3. 프론트엔드 설정

```bash
cd frontend
npm install
npm run dev
```

## 핵심 기능

### 1. 사용자 인증 시스템
- [x] 회원가입/로그인/로그아웃
- [ ] 이메일 인증
- [ ] 비밀번호 재설정
- [ ] 부부 계정 연결 기능

### 2. 미디어 관리
- [ ] 사진/동영상 업로드
- [ ] 파일 크기 제한 및 압축
- [ ] 썸네일 자동 생성
- [ ] 메타데이터 추출

### 3. 게시물 관리
- [ ] 게시물 작성
- [ ] 날짜별 자동 정렬
- [ ] 태그 기능
- [ ] 좋아요/댓글 기능
- [ ] 게시물 수정/삭제

### 4. 피드 화면
- [ ] 타임라인 형태의 피드
- [ ] 무한 스크롤
- [ ] 필터링 (날짜, 태그별)
- [ ] 검색 기능

## 개발 명령어

### 백엔드
```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 실행
npm run db:generate  # Prisma 클라이언트 생성
npm run db:push      # 데이터베이스 스키마 푸시
npm run db:migrate   # 데이터베이스 마이그레이션
npm run db:studio    # Prisma Studio 실행
```

### 프론트엔드
```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run preview      # 빌드된 앱 미리보기
```

## 현재 구현 상태

- [x] 프로젝트 초기 설정
- [x] 기본 폴더 구조 생성
- [x] 타입 정의 및 기본 컴포넌트 생성
- [x] 인증 시스템 기본 구조
- [x] 데이터베이스 스키마 설계
- [x] 개발 환경 설정 완료

## 다음 단계

1. 데이터베이스 연결 및 Prisma 설정
2. 사용자 인증 API 구현
3. 기본 UI 컴포넌트 개발
4. 미디어 업로드 기능 구현
5. 게시물 CRUD 기능 구현
=======
# baby_diary_for_family
>>>>>>> 13b25952cf52c6f46d479b018731df8c518f8e4a
