# 🍽️ PLATE & HOME

> 풀스택 쇼핑몰 프로젝트 | FastAPI + MySQL + OpenAI RAG

**🔗 GitHub Pages :** [https://ponyo911.github.io/Plate-Home/](https://ponyo911.github.io/Plate-Home/)

> ※ GitHub Pages는 정적 호스팅 환경으로 화면 구성 확인 용도입니다.
> 로그인 · 장바구니 · 챗봇 등 백엔드 연동 기능은 로컬 실행 환경에서 동작합니다.


---

## 📑 목차

* [🚀 개요](#-개요)
* [🛠️ 기술 스택](#️-기술-스택)
* [📂 폴더 구조](#-폴더-구조)
* [💻 핵심 기능](#-핵심-기능)
* [🎇 주요 기능 실행화면](#-주요-기능-실행화면)
* [🧠 프로젝트 회고](#-프로젝트-회고)
* [👾 프로젝트 설계 PPT](#-프로젝트-설계-ppt)

---

## 🚀 개요

* **목표:** HTML/CSS로 제작한 쇼핑몰 프론트엔드에 FastAPI 백엔드 + MySQL DB + AI 챗봇을 연동한 풀스택 테이블웨어 쇼핑몰 구현
* **기간:** 2026.04
* **형태:** FastAPI + Vanilla JS 기반 풀스택 웹 애플리케이션

---

## 🛠️ 기술 스택

| 구분 | 기술 | 역할 |
|---|---|---|
| **Frontend** | HTML / CSS / JavaScript (ES6+) | 화면 구성 및 사용자 인터페이스 |
| **Backend** | Python / FastAPI / Uvicorn | API 서버, 비즈니스 로직 처리 |
| **Database** | MySQL (pymysql) | 회원, 장바구니, 주문 데이터 저장 |
| **상품 데이터** | JSON 파일 (data.json) | 상품 목록, 배너, 네비게이션 |
| **인증** | bcrypt + localStorage | 비밀번호 암호화, 로그인 상태 유지 |
| **AI 챗봇** | OpenAI GPT-4o-mini + RAG | 문서 기반 상품 추천 및 고객 상담 |
| **환경 변수** | .env + python-dotenv | DB 정보, API 키 보호 |

---

## 📂 폴더 구조

```
PALTE_HOME_FASTAPI/
├── main.py              # FastAPI 서버 (API 엔드포인트)
├── database.py          # DB 연결
├── models.py            # 데이터 구조
├── .env                 # 환경변수 (비공개)
├── css/                 # 스타일시트
├── js/
│   ├── app.js           # 상품 렌더링
│   └── header.js        # 공통 헤더
├── json/
│   └── data.json        # 상품 / 배너 데이터
├── rag_docs/            # AI 챗봇 학습 문서
├── img/                 # 상품 이미지
├── index.html           # 메인 페이지
├── sub.html             # 상품 상세
├── cart.html            # 장바구니
├── order_list.html      # 주문 내역
├── login.html           # 로그인 / 회원가입
├── admin.html           # 관리자 페이지
└── chatbot.html         # AI 챗봇
```

---

## 💻 핵심 기능

### 🔐 로그인 상태 유지 (localStorage)

로그인 성공 시 `userName`, `userId`, `userRole`을 localStorage에 저장하여 페이지 간 상태를 유지합니다.
헤더는 로그인 여부에 따라 동적으로 렌더링되며, 관리자 계정(role=admin)일 경우 [관리자 모드] 버튼이 노출됩니다.

### 🔒 비밀번호 암호화 (bcrypt)

회원가입 시 bcrypt로 비밀번호를 암호화한 뒤 DB에 저장합니다.
로그인 시에는 입력값과 DB의 해시값을 비교하여 인증하며, 평문 비밀번호는 저장되지 않습니다.

### 🛒 장바구니 중복 처리

동일한 상품을 장바구니에 담을 경우 새로 INSERT하지 않고 기존 수량에 합산 처리합니다.
`POST /api/cart` 요청 시 서버에서 중복 여부를 확인 후 UPDATE 또는 INSERT를 결정합니다.

### 🤖 RAG 챗봇 구현

`rag_docs/` 폴더의 정책 · 상품 문서를 읽어 GPT에 컨텍스트로 함께 전달합니다.
단순 GPT 응답이 아닌 쇼핑몰 정보에 기반한 정확한 답변을 제공하며, 추천 상품은 카드 UI로 표시됩니다.

---

## 🎇 주요 기능 실행화면

### 🔐 로그인 / 회원가입

* 탭 전환 방식 (로그인 ↔ 회원가입)
* 이메일 도메인 선택 또는 직접 입력
* bcrypt 암호화 저장, 유효성 검사 (비밀번호 6자↑, 이름 2자↑)
* 관리자 아이디(ADMIN)로 로그인 가능

<img width="1850" height="1040" alt="회원가입" src="https://github.com/user-attachments/assets/8c5385c5-97dd-4445-8615-1cf7d87714ad" />
<br>
<br>
<img width="1850" height="1040" alt="로그인" src="https://github.com/user-attachments/assets/46725a10-d131-4d41-ab09-3255f4ad61ac" />


---

### 🛒 장바구니

* 상품 목록 + 이미지 + 수량 변경 (`PUT /api/cart/{id}`) + 삭제 (`DELETE /api/cart/{id}`)
* 결제하기 클릭 시 주문 생성 후 장바구니 자동 초기화
* 비로그인 접근 시 로그인 페이지로 리다이렉트

<img width="1850" height="1040" alt="장바구니" src="https://github.com/user-attachments/assets/98ca34f8-4d23-45ad-ba5a-5cc8da0bae70" />

---

### 📋 주문 내역

* user_id 기반으로 본인 주문만 조회
* 주문 상태 배지 — 결제완료 / 상품준비중 / 배송중 / 배송완료
* orders + order_items 1:N 구조로 상품 단위 데이터 관리

<img width="1850" height="1040" alt="상품구매" src="https://github.com/user-attachments/assets/64270d09-7826-4737-ae95-7b3ed24cb64f" />



---

### 🔧 관리자 페이지

* **주문 관리** — 전체 주문 조회 + 상태 변경 (결제완료 → 배송완료)
* **상품 관리** — 신규 등록 + 삭제, data.json 실시간 반영
* **회원 관리** — 권한 승격(admin), 관리자 계정 삭제 불가

<img width="1850" height="1040" alt="관리자" src="https://github.com/user-attachments/assets/9f602efc-1f90-4fe4-a4ea-52fde602aa15" />

---

### 🤖 AI 챗봇

* 메인 플로팅 위젯 → 전체화면 전용 페이지 전환
* RAG 기반 답변 — `rag_docs/*.txt` 문서 + 상품 목록을 GPT 컨텍스트로 전달
* 추천 상품 카드 UI — 클릭 시 상품 상세 페이지로 이동
* 빠른 질문 버튼 — 인기 상품 추천 / 머그잔 종류 / 배송 안내 / 교환반품 / 선물 추천

<img width="1850" height="1040" alt="챗봇_1" src="https://github.com/user-attachments/assets/e838a5f7-398a-4dd2-9185-986305c2bd21" />
<br>
<br>
<img width="1850" height="1040" alt="챗봇 전체화면" src="https://github.com/user-attachments/assets/4b484011-e613-40db-9181-3355deccae50" />


---

## 🧠 프로젝트 회고

### ✅ 성과

* FastAPI + MySQL + Vanilla JS 풀스택 구조 완성
* 회원 인증, 장바구니, 주문, 관리자 CRUD 전체 구현
* OpenAI RAG 챗봇 연동으로 실제 서비스 수준의 AI 기능 구현

### 🌟 잘한 점

* **REST API 설계** — HTTP 메서드(GET/POST/PUT/DELETE) 기반 명확한 엔드포인트 구조화
* **bcrypt 암호화** — 회원 비밀번호 보안 처리로 실제 서비스 수준의 인증 구현
* **RAG 챗봇** — 단순 GPT 호출이 아닌 문서 기반 컨텍스트 주입으로 답변 정확도 향상
* **JSON 기반 상품 관리** — DB 없이도 상품 데이터를 유연하게 관리하는 구조 설계

### ⚠️ 개선점

* localStorage 기반 인증의 한계 → JWT 토큰 방식으로 전환 필요
* GitHub Pages 정적 호스팅의 한계 → Railway, Render 등 백엔드 배포 환경 필요
* 상품 이미지 서버 미구현 → S3 등 외부 스토리지 연동 필요
* 테스트 코드 부재 → pytest 기반 API 단위 테스트 도입 필요

### 💬 기술적 이슈 & 해결

* **GitHub Push 차단** — `.env` 파일에 포함된 OpenAI API 키가 GitHub Secret Scanning에 감지되어 푸시 차단 → `git filter-branch`로 커밋 히스토리에서 제거 후 강제 푸시, `.gitignore`에 `.env` 등록
* **venv 폴더 통째로 커밋** — 가상환경 7000여 개 파일이 git에 추가됨 → `.gitignore`에 `venv/` 등록 후 `git rm -r --cached venv/`로 추적 해제
* **GitHub Pages JSON 오류** — 로컬에서는 `/api/data`로 FastAPI 서버에서 데이터를 받아오는 구조였으나, 정적 호스팅 환경에서는 백엔드 미지원 → `./json/data.json` 직접 참조 방식으로 변경

### 🔒 보안

* `.env` + `python-dotenv`로 API 키 및 DB 정보 환경변수 관리
* bcrypt 해시로 사용자 비밀번호 암호화 저장
* API 키 노출 사고 경험 후 `.gitignore` 및 커밋 이력 관리의 중요성 체득

### 🚀 향후 개선 계획

* JWT 기반 인증 방식으로 전환 및 토큰 갱신 처리
* Railway / Render를 활용한 백엔드 배포로 전체 기능 온라인 시연 가능하도록 개선
* 상품 이미지 S3 업로드 연동
* 챗봇 대화 이력 저장 및 맥락 유지 기능 추가

---

## 🚀 로컬 실행 방법

```bash
# 1. 저장소 클론
git clone https://github.com/ponyo911/Plate-Home.git

# 2. 가상환경 생성 및 활성화
python -m venv venv
source venv/Scripts/activate  # Windows

# 3. 패키지 설치
pip install -r requirements.txt

# 4. .env 파일 생성 후 아래 내용 입력
OPENAI_API_KEY=your_api_key_here
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=plate_home_db

# 5. 서버 실행
uvicorn main:app --reload
```

---

## 👾 프로젝트 설계 PPT

<img width="2560" height="1440" alt="슬라이드1" src="https://github.com/user-attachments/assets/d1154a7c-a0ea-48e3-aa11-6b78c840d3d2" />
<br>
<img width="2560" height="1440" alt="슬라이드2" src="https://github.com/user-attachments/assets/a1c60fae-4a1e-418d-94c9-24ee795757c2" />
<br>
<img width="2560" height="1440" alt="슬라이드3" src="https://github.com/user-attachments/assets/8a5b3a23-d13d-4cdc-9eeb-aa44fe186a0e" />
<br>
<img width="2560" height="1440" alt="슬라이드4" src="https://github.com/user-attachments/assets/7adae055-70f1-458e-8a2f-619fbeb85a58" />
<br>
<img width="2560" height="1440" alt="슬라이드5" src="https://github.com/user-attachments/assets/d4d59434-0ecc-494e-8d57-6899d4466282" />
<br>
<img width="2560" height="1440" alt="슬라이드6" src="https://github.com/user-attachments/assets/3c2aadd6-78e3-49a1-8047-4647394d2a73" />
<br>
<img width="2560" height="1440" alt="슬라이드7" src="https://github.com/user-attachments/assets/d7737e26-12ee-49ef-9cb2-69f3c39ce43b" />
<br>
<img width="2560" height="1440" alt="슬라이드8" src="https://github.com/user-attachments/assets/6bb055ed-3208-4e08-8bc8-e454047d9454" />
<br>
<img width="2560" height="1440" alt="슬라이드9" src="https://github.com/user-attachments/assets/2b2631b0-50bd-4e41-9e08-1121c85cc7a8" />
<br>
<img width="2560" height="1440" alt="슬라이드10" src="https://github.com/user-attachments/assets/d4ca519e-4742-4268-a50f-910eaaf3d6fe" />
<br>
<img width="2560" height="1440" alt="슬라이드11" src="https://github.com/user-attachments/assets/bf926f0a-caa3-449a-9030-2e04047a9e78" />
<br>
<img width="2560" height="1440" alt="슬라이드12" src="https://github.com/user-attachments/assets/15d36ffd-9873-486d-ab91-0f8ab1664f61" />
<br>
<img width="2560" height="1440" alt="슬라이드13" src="https://github.com/user-attachments/assets/0c9b56aa-3d13-4272-a3fa-0e28b7971f2c" />
<br>
<img width="2560" height="1440" alt="슬라이드14" src="https://github.com/user-attachments/assets/75a87de5-a189-4f2f-83b2-9738a847d06e" />
<br>
<img width="2560" height="1440" alt="슬라이드15" src="https://github.com/user-attachments/assets/5a32bc2d-7541-4d86-b769-bc3013951b0b" />
<br>
<img width="2560" height="1440" alt="슬라이드16" src="https://github.com/user-attachments/assets/9ef2b226-1ff5-46c6-a7b5-6fa666647572" />
<br>
<img width="2560" height="1440" alt="슬라이드17" src="https://github.com/user-attachments/assets/60f9081a-a081-4eb6-8729-0b7e2ecd7d43" />
<br>
<img width="2560" height="1440" alt="슬라이드18" src="https://github.com/user-attachments/assets/3e91e870-ceb8-4bb3-ae7d-90b6cb445390" />
<br>
<img width="2560" height="1440" alt="슬라이드19" src="https://github.com/user-attachments/assets/8a309258-26e8-426c-81b9-ccf91594a4ae" />
<br>
<img width="2560" height="1440" alt="슬라이드20" src="https://github.com/user-attachments/assets/994ae88a-a15c-49ef-8a8f-8baad145c59c" />
<br>
<img width="2560" height="1440" alt="슬라이드21" src="https://github.com/user-attachments/assets/35128a14-643b-42fb-9591-0aa97bca7adf" />

