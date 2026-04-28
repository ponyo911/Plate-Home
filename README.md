# 🍽️ PLATE & HOME

> 감각적인 테이블웨어 쇼핑몰 | FastAPI + Vanilla JS 기반 풀스택 프로젝트

<br>

## 🔗 배포 링크

**GitHub Pages** : [https://ponyo911.github.io/Plate-Home/](https://ponyo911.github.io/Plate-Home/)

> ※ GitHub Pages는 정적 호스팅으로, 화면 구성 확인 용도입니다. 로그인·장바구니·챗봇 등 백엔드 연동 기능은 로컬 실행 환경에서 동작합니다.

<br>

## 📌 프로젝트 개요

PLATE & HOME은 도자기·세라믹 테이블웨어를 판매하는 쇼핑몰 웹 애플리케이션입니다.  
FastAPI 백엔드와 Vanilla JS 프론트엔드로 구성되며, OpenAI API를 활용한 AI 챗봇 기능을 포함합니다.

<br>

## 🛠️ 기술 스택

**Frontend**
- HTML5 / CSS3 / JavaScript (ES6+)

**Backend**
- Python / FastAPI / Uvicorn

**Database**
- SQLite (SQLAlchemy ORM)

**AI**
- OpenAI API (챗봇 기능)

**Infra**
- GitHub / GitHub Pages

<br>

## 📁 프로젝트 구조

```
PALTE_HOME FASTAPI/
├── css/               # 스타일시트
├── img/               # 이미지 리소스
├── js/                # 프론트엔드 스크립트
│   ├── app.js
│   └── header.js
├── json/
│   └── data.json      # 상품 데이터
├── rag_docs/          # RAG 문서 (챗봇 학습용)
├── admin.html         # 관리자 페이지
├── cart.html          # 장바구니
├── chatbot.html       # AI 챗봇
├── index.html         # 메인 페이지
├── login.html         # 로그인 / 회원가입
├── order_list.html    # 주문 내역
├── sub.html           # 상품 상세 페이지
├── main.py            # FastAPI 서버
├── database.py        # DB 설정
├── models.py          # DB 모델
└── .env               # 환경변수 (비공개)
```

<br>

## ✨ 주요 기능

### 🏠 메인 페이지
- 히어로 슬라이드 배너 (자동 슬라이드 + 수동 제어)
- 카테고리별 상품 섹션 (featured / new / collection / mug / plate / tableware)
- 와이드 배너 구성

<!-- GIF 삽입 위치 -->

---

### 🛍️ 상품 상세 페이지
- 썸네일 이미지 전환
- 수량 선택 및 총 금액 자동 계산
- 장바구니 담기
- 연관 상품 추천

<!-- GIF 삽입 위치 -->

---

### 🔐 로그인 / 회원가입
- 이메일 기반 회원가입 및 로그인
- 로그인 상태에 따른 장바구니 접근 제한

<!-- GIF 삽입 위치 -->

---

### 🛒 장바구니
- 상품 추가 / 수량 변경 / 삭제
- 총 결제 금액 계산

<!-- GIF 삽입 위치 -->

---

### 🤖 AI 챗봇
- OpenAI API 기반 상품 추천 및 고객 응대
- RAG(Retrieval-Augmented Generation) 방식으로 쇼핑몰 정책 문서 학습

<!-- GIF 삽입 위치 -->

---

### 🔧 관리자 페이지
- 회원 목록 조회
- 주문 내역 관리

<!-- GIF 삽입 위치 -->

<br>

## ⚙️ 로컬 실행 방법

```bash
# 1. 저장소 클론
git clone https://github.com/ponyo911/Plate-Home.git

# 2. 가상환경 생성 및 활성화
python -m venv venv
source venv/Scripts/activate  # Windows

# 3. 패키지 설치
pip install -r requirements.txt

# 4. 환경변수 설정
# .env 파일 생성 후 OpenAI API 키 입력
OPENAI_API_KEY=your_api_key_here

# 5. 서버 실행
uvicorn main:app --reload
```

<br>

## 📝 느낀 점 / 개선 방향

- GitHub Pages 정적 호스팅의 한계를 경험하며 백엔드 배포(Railway, Render 등)의 필요성을 인식
- OpenAI API 키 보안 관리의 중요성 체감 (.env, .gitignore 설정)
- 추후 JWT 기반 인증 방식으로 개선 예정
