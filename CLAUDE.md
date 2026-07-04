# CLAUDE.md

# 🌱 Project Goal

이 프로젝트의 목표는 단순히 HTML을 만드는 것이 아니라,
팀이 함께 개발할 수 있는 유지보수 가능한 구조를 만드는 것이다.

우선순위는 다음과 같다.

1. 구조
2. 재사용성
3. 일관성
4. 기능 구현

새로운 기능보다 기존 구조를 활용하는 것을 우선한다.

> 아래 내용은 요약이다. 자세한 내용은 각 문서를 참고한다.
> - 폴더 구조 / 페이지별 CSS·JS·데이터 의존성 → [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
> - 재사용 컴포넌트 카탈로그 → [docs/COMPONENT_GUIDE.md](docs/COMPONENT_GUIDE.md)
> - JSON / Supabase / localStorage 데이터 규칙 → [docs/DATA_GUIDE.md](docs/DATA_GUIDE.md)
> - Git 브랜치 전략, 담당 영역, PR 체크리스트 → [docs/DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md)

---

# 📁 Project Structure

```
/
├── index.html                  # 홈 (유일하게 pages/ 밖에 있는 화면)
├── components/                 # 헤더/네비 마크업 조각 (런타임에 fetch로 주입)
│   ├── header.html
│   └── nav.html
├── pages/                       # 홈을 제외한 모든 화면 (폴더 = 기능 그룹)
│   ├── auth/        login.html, signup.html
│   ├── wiki/         index.html, detail.html
│   ├── exam/         index.html, quiz.html
│   ├── handbook/     index.html, resume.html
│   └── my/           index.html, favorites.html, words.html, mypage.html, edit.html
├── assets
│   ├── css
│   │   ├── reset.css / variables.css / base.css / layout.css / components.css
│   │   └── pages/           # 화면 전용 CSS (auth.css, wiki.css, exam.css, job.css, my.css …)
│   ├── js
│   │   ├── supabase-client.js / auth.js / api.js   # 데이터·인증 공용 레이어
│   │   ├── app.js / ui.js / modal.js / toast.js     # 공통 UI 동작
│   │   ├── components/       # header.js, nav.js (마운트 로더)
│   │   └── pages/            # 화면 전용 JS (wiki.js, exam.js, quiz.js, job.js, mypage.js …)
│   └── data
│       └── *.json / questions/*.json
├── supabase/
│   └── schema.sql              # Supabase 테이블 정의 (DDL)
└── docs/                        # 프로젝트 문서
```

이 프로젝트는 정적 JSON뿐 아니라 **Supabase(Postgres)**를 사용자별 상태 저장소로 함께 쓴다 (자세한 내용은 [docs/DATA_GUIDE.md](docs/DATA_GUIDE.md)).

---

# 🏗 HTML Rules

- HTML5 Semantic Tag를 사용한다.
- header, nav, main, section, article, aside, footer를 적극 활용한다.
- 의미 없는 div 사용을 최소화한다.
- HTML 안에 CSS를 작성하지 않는다.
- HTML 안에 JavaScript를 작성하지 않는다.
- inline style을 사용하지 않는다.
- inline event(onclick 등)를 사용하지 않는다.
- 새 화면은 반드시 `pages/{기능그룹}/` 아래에 추가한다. 기존 그룹(auth/wiki/exam/handbook/my)에 속하지 않는 완전히 새로운 그룹을 만들기 전에는 그 이유를 먼저 설명한다.
- 헤더/네비게이션은 직접 마크업하지 않고 `components/header.html`, `components/nav.html`을 마운트해 사용한다 (`<header id="header-mount">`, `<nav id="nav-mount">`).

---

# 🎨 CSS Rules

CSS는 역할별로 분리한다.

- reset.css
- variables.css
- base.css
- layout.css
- components.css
- pages/*.css (화면 전용, 페이지 그룹당 1개 이상)

규칙

- BEM 네이밍 사용
- Design Token 사용
- 색상, radius, shadow, spacing은 variables.css를 통해 관리
- 하드코딩 최소화 (특히 `width`, `progress` 값은 인라인 style이 아니라 `data-*` 속성 + JS로 처리)
- 2개 이상의 화면에서 재사용되는 스타일만 `components.css`에 둔다. 1개 화면에서만 쓰이면 해당 `pages/*.css`에 작성한다.

---

# ⚙ JavaScript Rules

역할별로 파일을 분리한다.

- `supabase-client.js` — Supabase 클라이언트 초기화
- `auth.js` — 로그인 상태, 헤더 auth UI 전환
- `api.js` — Supabase 접근 전담 (`window.api.*`). 페이지 JS가 `supabaseClient`를 직접 호출하지 않는다.
- `app.js` — 공통 부트스트랩 (컴포넌트 로딩 순서, 네비게이션, 인증 가드)
- `ui.js` / `modal.js` / `toast.js` — 공통 UI 동작
- `components/*.js` — 헤더/네비 마운트 로더
- `pages/*.js` — 화면 전용 로직

DOM 조작과 비즈니스 로직을 분리한다.

정적 JSON은 각 페이지 JS가 직접 `fetch()`하고, 중복 요청 방지를 위해 Promise를 변수/Map에 캐싱한다. Supabase 접근은 항상 `api.js`의 `window.api.*` 함수를 거친다. 자세한 패턴은 [docs/DATA_GUIDE.md](docs/DATA_GUIDE.md) 참고.

---

# 🧩 Component Rules

UI는 반드시 재사용 가능한 형태로 만든다.

기존 Component를 먼저 확인한다 — 전체 카탈로그는 [docs/COMPONENT_GUIDE.md](docs/COMPONENT_GUIDE.md).

재사용 우선

- Button
- Card
- Tag
- Progress Bar
- Modal
- Toast
- Pagination / Filter Tab / Sort Pill / Section Title / Back Link

동일한 UI를 두 번 구현하지 않는다.

새로운 Component가 필요한 경우, 다음을 모두 만족해야 `components.css`에 추가한다:

1. 기존 컴포넌트 + modifier 조합으로 해결 불가능함을 확인했다.
2. 2개 이상의 화면(폴더)에서 재사용될 예정이다.
3. `variables.css`의 기존 토큰만으로 스타일이 가능하다.

`components/header.html`, `components/nav.html`은 모든 화면이 공유하는 공용 자원이므로 임의로 수정하지 않는다 ([docs/DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md) 3장 절차를 따른다).

---

# 📦 Data Rules

화면 데이터는 가능한 JSON 또는 Supabase로 관리한다. 하드코딩을 최소화한다.

- **정적 콘텐츠**(위키 본문, 시험 문제 등 사용자마다 다르지 않은 데이터) → `assets/data/*.json`
- **사용자별 상태**(프로필, 즐겨찾기, 북마크, 응시 기록 등) → Supabase (`supabase/schema.sql`), 접근은 `api.js`의 `window.api.*` 함수로만
- **로그인 전 로컬 캐시**(취업핸드북 진행 상태 등) → localStorage, 로그인 시 Supabase와 동기화
- 같은 정보를 JSON과 Supabase 양쪽에 동시에 두지 않는다.
- JSON 필드는 camelCase, id는 문자열, 날짜는 ISO 8601을 사용한다.

자세한 스키마와 네이밍 규칙은 [docs/DATA_GUIDE.md](docs/DATA_GUIDE.md) 참고.

---

# 🤖 Claude Workflow

새로운 기능을 구현하기 전에 반드시 다음 순서를 따른다.

1. 프로젝트 구조 분석 ([docs/ARCHITECTURE.md](docs/ARCHITECTURE.md))
2. 기존 Component 확인 ([docs/COMPONENT_GUIDE.md](docs/COMPONENT_GUIDE.md))
3. 기존 CSS 재사용 여부 확인
4. 기존 JavaScript 재사용 여부 확인
5. 기존 JSON/Supabase 스키마로 표현 가능한지 확인 ([docs/DATA_GUIDE.md](docs/DATA_GUIDE.md))
6. 새로운 파일이 정말 필요한지 검토
7. 필요한 경우에만 새로운 Component/화면 생성

기존 구조를 수정하는 것이 새로운 구조를 만드는 것보다 우선이다.

교차 의존 파일(예: `quiz.js`, `mypage.js`, `job_features` localStorage 키 등)을 건드릴 때는 영향받는 다른 화면을 먼저 확인한다 ([docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) 6장).

---

# 🌿 Git Rules

- `main`/`develop` 브랜치에 직접 commit하지 않는다.
- 담당 영역별로 `feature/{영역}` 브랜치를 생성해 작업한다 (`feature/home`, `feature/auth`, `feature/wiki`, `feature/exam`, `feature/handbook`, `feature/my`).
- `feature/*`는 `develop`에서 분기하고, `develop`을 대상으로 Pull Request를 생성한다.
- `main`으로의 반영은 `develop`이 안정화된 시점에 별도로 진행한다.
- 자신의 담당 폴더 밖의 HTML/CSS/JS는 수정하지 않는다. 공용 자원(헤더/네비, 공통 CSS·JS, `supabase/schema.sql`)은 별도의 작은 PR로 분리해 영향받는 담당자에게 리뷰를 요청한다.

자세한 브랜치 전략과 담당 영역 표는 [docs/DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md) 참고.

---

# ✅ Before Pull Request

PR 전에 반드시 확인한다.

- Console Error 0
- Warning 최소화
- HTML Validation
- CSS Validation
- Responsive 확인 (모바일 폭에서 햄버거 메뉴/사이드바 정상 동작)
- 기존 기능 정상 동작 확인 (교차 의존 파일을 건드렸다면 영향받는 화면도 재확인)
- 담당 폴더 밖의 파일을 건드리지 않았는지 확인
- 신규 UI를 만들었다면 기존 컴포넌트로 불가능했던 이유를 PR 설명에 기록

---

# AI Development Principle

Claude는 새로운 코드를 작성하는 것보다
기존 구조를 이해하고 재사용하는 것을 우선한다.

새로운 파일이나 Component를 만들기 전에
항상 기존 구현을 먼저 검토한다.

구현보다 설계를 우선하며,
프로젝트의 일관성과 유지보수성을 최우선으로 고려한다.
