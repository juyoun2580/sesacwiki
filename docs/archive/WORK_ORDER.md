# WORK_ORDER.md

5명이 오늘부터 동시에 작업할 수 있도록 **파일 단위**로 작업을 분할한 지시서다. MPA(Multi-Page App) 전환 이후 각 화면은 독립된 HTML 파일이므로, SPA 시절과 달리 "한 `index.html`을 여러 팀이 나눠 쓰는" 방식이 아니라 **각 팀이 자신의 HTML 파일을 통째로 받는다.**

관련 문서: [COMPONENTS.md](COMPONENTS.md) · [PAGES.md](PAGES.md) · [JSON_GUIDE.md](JSON_GUIDE.md) · [DECISION_TREE.md](DECISION_TREE.md)

---

## ⚠️ MPA 구조에서 반드시 알아야 할 것

각 HTML 파일은 다음 두 종류의 블록이 함께 들어있다.

1. **공통 블록** — `<head>`, `<header class="header">`, `<nav class="nav">`, 파일 최하단의 `.toast`/`.modal-overlay`/`.highlight-toolbar` 공용 마크업, `<script>` 태그 목록. 파일 안에 `COMMON HEADER`, `COMMON NAVIGATION`, `COMMON SHARED MARKUP`, `COMMON SCRIPTS` 주석으로 표시되어 있다. **공통 담당자만 수정한다.**
2. **페이지 블록** — `<main id="main-content">` 안의 `<section id="...">...</section>` 하나. 파일 안에 `HOME START`~`HOME END` 같은 주석으로 표시되어 있다. **해당 페이지 담당 팀만 수정한다.**

**중요한 제약**: 공통 블록(헤더/네비)은 9개 HTML 파일에 각각 복사되어 있다(서버 템플릿/include가 없는 정적 사이트이기 때문). 그래서 공통 담당자가 네비게이션 메뉴를 하나 추가하는 등 공통 블록을 바꾸면, **9개 파일 전부에 동일하게 반영해야 한다.** 페이지 팀은 절대 이 블록을 임의로 고치지 않는다 — 다음 공통 배포 때 덮어써지며 충돌의 원인이 된다.

---

## 팀 구성

| # | 팀 | 담당 HTML 파일 |
|---|---|---|
| 0 | 공통 담당자 | 없음 (9개 파일의 공통 블록 + 공용 CSS/JS) |
| 1 | Home 담당 | `index.html` |
| 2 | Wiki 담당 | `wiki.html`, `detail.html` |
| 3 | Exam 담당 | `exam.html`, `quiz.html` |
| 4 | MyPage(Job/My) 담당 | `job.html`, `my.html`, `mywords.html`, `myfav.html` |

## 공통 규칙 (전원 필독)

1. 자신에게 배정된 HTML 파일의 **페이지 블록**(`<section id="...">...</section>`)만 수정한다. 같은 파일 안의 공통 블록(`<head>`/`<header>`/`<nav>`/최하단 공용 마크업/`<script>` 목록)은 절대 손대지 않는다.
2. 작업 시작 전 항상 `git pull origin main`(또는 `git fetch && git rebase origin/main`)으로 최신 상태를 받는다.
3. 새로운 공용 컴포넌트, 디자인 토큰, 공용 JS 동작이 필요하면 직접 만들지 말고 **공통 담당자에게 요청**한다. 판단 기준은 [DECISION_TREE.md](DECISION_TREE.md) 참고.
4. PR 전 CLAUDE.md의 "Before Pull Request" 체크리스트(Console Error 0, HTML/CSS Validation, Responsive 확인, 기존 기능 정상 동작)를 반드시 확인한다.
5. 브랜치는 `main`에서 분기하고, `main`에 직접 commit하지 않는다.

---

## 0. 공통 담당자

**역할**: 프로젝트 뼈대, 디자인 토큰, 공용 컴포넌트, 공용 JS 유지보수, 문서(COMPONENTS/PAGES/JSON_GUIDE/WORK_ORDER) 관리, 신규 공용 요소 승인, 병합 순서 조율.

**받아야 하는 파일**: 저장소 전체 (통합 검토를 위해 모든 팀의 결과물을 봐야 한다)

**수정 가능한 파일**
- 9개 HTML 파일(`index.html`, `wiki.html`, `detail.html`, `exam.html`, `quiz.html`, `job.html`, `my.html`, `mywords.html`, `myfav.html`) 각각의 — 단, `<head>`, `<header class="header">`, `<nav class="nav">`, 파일 최하단 `.toast`/`.highlight-toolbar`/`.modal-overlay` 마크업, `<script>` 태그 목록만
- `assets/css/reset.css`, `variables.css`, `base.css`, `layout.css`, `components.css`
- `assets/js/app.js`, `assets/js/ui.js`, `assets/js/toast.js`, `assets/js/modal.js`
- `COMPONENTS.md`, `PAGES.md`, `JSON_GUIDE.md`, `DECISION_TREE.md`, `WORK_ORDER.md`

**수정하면 안 되는 파일**
- 9개 HTML 파일 내 각 `<section id="...">` 페이지 블록 (변경이 필요하면 담당 팀에 요청)
- `assets/css/pages/*.css` 전체 (각 페이지 팀 소유)
- `assets/js/pages/highlight.js`, `assets/js/pages/quiz.js` (페이지 전용 로직)
- `assets/data/*.json` (각 팀 소유, 공통은 스키마 리뷰만)

**생성 가능한 파일**
- `assets/js/storage.js` (상태 영속화가 필요해질 때)
- `assets/js/api.js` (JSON fetch 공용 레이어가 필요해질 때 — [JSON_GUIDE.md](JSON_GUIDE.md) 향후 연계 계획 참고)
- `assets/data/README.md` 등 데이터 규칙 보조 문서

**Git Branch 이름**: `feature/core`

**Pull Request 순서**: **1번 — 가장 먼저 병합.** 다른 4개 팀이 작업할 공용 컴포넌트/토큰이 확정되어야 하므로, 스프린트 시작 시점에 필요한 공용 변경을 먼저 병합한다. 이후 각 페이지 팀은 병합된 `main`에서 브랜치를 딴다.

---

## 1. Home 담당

**받아야 하는 파일**
- `index.html`
- (참고용, 수정 금지) 공통 CSS 5종, `assets/js/app.js`
- `assets/css/pages/home.css`
- `assets/data/home.json` (스키마는 [JSON_GUIDE.md](JSON_GUIDE.md) 참고, 이미 더미 데이터로 생성되어 있음)

**수정 가능한 파일**
- `index.html` 내 `<section id="home">...</section>` 블록
- `assets/css/pages/home.css`
- `assets/data/home.json`

**수정하면 안 되는 파일**
- `index.html` 내 `<head>`/`<header>`/`<nav>`/`<script>` 태그 목록
- `wiki.html`, `detail.html`, `exam.html`, `quiz.html`, `job.html`, `my.html`, `mywords.html`, `myfav.html` (전체)
- `assets/css/pages/wiki.css`, `exam.css`, `job.css`, `my.css`
- `assets/css/reset.css`, `variables.css`, `base.css`, `layout.css`, `components.css`
- `assets/js/app.js`, `ui.js`, `modal.js`, `toast.js`, `pages/highlight.js`, `pages/quiz.js`

**생성 가능한 파일**
- `assets/js/pages/home.js` — 로드맵 필터링 등 신규 동작이 실제로 필요할 때만 생성. 생성 시 `index.html` `<script>` 태그 추가는 공통 담당자에게 요청.

**담당 Component**: 신규 공용 컴포넌트 생성 권한 없음(재사용만). 홈 전용 요소(`stat-card`, `roadmap-card`, `quote-box`, `shortcut-btn`, `recent-list`, `favorite-list`, `word-chip-list`)는 `home.css` 소유.

**Git Branch 이름**: `feature/home`

**Pull Request 순서**: 2번

---

## 2. Wiki 담당

**받아야 하는 파일**
- `wiki.html`, `detail.html`
- (참고용, 수정 금지) 공통 CSS 5종, `assets/js/toast.js`, `app.js`, `ui.js`, `modal.js`
- `assets/css/pages/wiki.css`
- `assets/js/pages/highlight.js`
- `assets/data/wiki.json`

**수정 가능한 파일**
- `wiki.html`, `detail.html` 내 각각의 `<section id="wiki">`/`<section id="detail">` 블록
- `assets/css/pages/wiki.css`
- `assets/js/pages/highlight.js`
- `assets/data/wiki.json`

**수정하면 안 되는 파일**
- `wiki.html`/`detail.html`의 `<head>`/`<header>`/`<nav>`/최하단 공용 마크업(단어 저장 모달 포함)/`<script>` 태그 목록
- `index.html`, `exam.html`, `quiz.html`, `job.html`, `my.html`, `mywords.html`, `myfav.html` (전체)
- `assets/css/pages/home.css`, `exam.css`, `job.css`, `my.css`
- `assets/css/reset.css`, `variables.css`, `base.css`, `layout.css`, `components.css`
- `assets/js/app.js`, `ui.js`, `modal.js`, `toast.js`, `pages/quiz.js`

**생성 가능한 파일**
- `assets/js/pages/wiki.js` — 하이라이트 외 신규 로직(예: 목차 스크롤 싱크)이 필요할 때만 생성.

**담당 Component**: 신규 공용 컴포넌트 생성 권한 없음. 위키 전용 요소(`wiki-row`, `article`, `detail-layout`, `related-item`, `save-box`, `highlight-list`)는 `wiki.css` 소유. 즐겨찾기 토글(`favorite-star`)과 단어장 모달은 공통 소유이므로 동작 변경이 필요하면 공통 담당자에게 요청한다.

**Git Branch 이름**: `feature/wiki`

**Pull Request 순서**: 3번

---

## 3. Exam 담당

**받아야 하는 파일**
- `exam.html`, `quiz.html`
- (참고용, 수정 금지) 공통 CSS 5종, `assets/js/toast.js`, `app.js`, `ui.js`
- `assets/css/pages/exam.css`
- `assets/js/pages/quiz.js`
- `assets/data/exam.json`

**수정 가능한 파일**
- `exam.html`, `quiz.html` 내 각각의 `<section id="exam">`/`<section id="quiz">` 블록
- `assets/css/pages/exam.css`
- `assets/js/pages/quiz.js`
- `assets/data/exam.json`

**⚠️ 교차 의존 주의**: `assets/js/pages/quiz.js`는 `mywords.html`(MyPage 담당 소유)의 단어 퀴즈 선택지 토글도 함께 처리한다. 이 파일을 변경하기 전에 MyPage 담당과 영향 범위를 확인한다.

**수정하면 안 되는 파일**
- `exam.html`/`quiz.html`의 `<head>`/`<header>`/`<nav>`/`<script>` 태그 목록
- `index.html`, `wiki.html`, `detail.html`, `job.html`, `my.html`, `mywords.html`, `myfav.html` (전체)
- `assets/css/pages/home.css`, `wiki.css`, `job.css`, `my.css`
- `assets/css/reset.css`, `variables.css`, `base.css`, `layout.css`, `components.css`
- `assets/js/app.js`, `ui.js`, `modal.js`, `toast.js`, `pages/highlight.js`

**생성 가능한 파일**
- `assets/js/pages/exam.js` — `quiz.js`로 표현이 안 되는 신규 로직(예: 오답노트 필터)이 필요할 때만 생성.

**담당 Component**: 신규 공용 컴포넌트 생성 권한 없음. 시험 전용 요소(`exam-row`, `choice`, `question-grid`, `time-ring`, `memo-panel`, `quiz-question`)는 `exam.css` 소유.

**Git Branch 이름**: `feature/exam`

**Pull Request 순서**: 4번

---

## 4. MyPage(Job/My) 담당

**받아야 하는 파일**
- `job.html`, `my.html`, `mywords.html`, `myfav.html`
- (참고용, 수정 금지) 공통 CSS 5종, `assets/js/toast.js`, `app.js`, `ui.js`, `modal.js`, `pages/quiz.js`(단어 퀴즈 선택지 부분, Exam 담당 소유)
- `assets/css/pages/job.css`, `assets/css/pages/my.css`
- `assets/data/job.json`, `assets/data/my_docs.json`, `assets/data/words.json`

**수정 가능한 파일**
- `job.html`, `my.html`, `mywords.html`, `myfav.html` 내 각각의 `<section id="...">` 블록
- `assets/css/pages/job.css`
- `assets/css/pages/my.css`
- `assets/data/job.json`, `assets/data/my_docs.json`, `assets/data/words.json`

**⚠️ 교차 의존 주의**: `mywords.html`의 "+ 단어 추가" 버튼이 여는 모달은 공통 `modal.js` 소유이고, 단어 퀴즈 선택지 토글은 Exam 담당 `pages/quiz.js` 소유다. 두 파일 다 직접 수정하지 않고 필요한 변경을 각 소유 팀에 요청한다.

**수정하면 안 되는 파일**
- 4개 파일의 `<head>`/`<header>`/`<nav>`/최하단 공용 마크업/`<script>` 태그 목록
- `index.html`, `wiki.html`, `detail.html`, `exam.html`, `quiz.html` (전체)
- `assets/css/pages/home.css`, `wiki.css`, `exam.css`
- `assets/css/reset.css`, `variables.css`, `base.css`, `layout.css`, `components.css`
- `assets/js/app.js`, `ui.js`, `modal.js`, `toast.js`, `pages/highlight.js`, `pages/quiz.js`

**생성 가능한 파일**
- `assets/js/pages/mypage.js` — job/my/mywords/myfav 공통으로 쓸 페이지 전용 신규 로직이 필요할 때만 생성.

**담당 Component**: 신규 공용 컴포넌트 생성 권한 없음. `job-card`, `job-stepper`, `job-task`, `job-tool-btn`, `doc-row`, `fav-row`, `word-row`, `stat-box`, `word-quiz` 등은 각각 `job.css`/`my.css` 소유. 4개 파일을 한 팀이 담당하는 이유는 `job.css`/`my.css` 두 파일과 "마이핸드북" 사이드바 메뉴가 job/my/mywords/myfav 간에 밀접하게 연결되어 있기 때문이다.

**Git Branch 이름**: `feature/job`

**Pull Request 순서**: 5번

---

## Pull Request 순서 요약 및 이유

```
1. feature/core   (공통 담당자)  ← 최우선 병합. 이후 팀들의 작업 기준선.
2. feature/home           (Home 담당)
3. feature/wiki           (Wiki 담당)
4. feature/exam           (Exam 담당)
5. feature/job         (MyPage 담당)
```

- 2~5번 팀은 서로 다른 HTML 파일(`index.html`/`wiki.html`+`detail.html`/`exam.html`+`quiz.html`/`job.html`+`my.html`+`mywords.html`+`myfav.html`), 서로 다른 `assets/css/pages/*.css`, 서로 다른 `assets/data/*.json`만 건드리므로 **동시에 개발해도 무방**하다. 단 Exam 담당의 `quiz.js`와 MyPage 담당의 `mywords.html`은 서로 의존하므로 이 두 팀은 병합 전에 한 번 서로 확인한다.
- 2~5번 팀은 반드시 **1번(feature/core)이 병합된 이후의 `main`**에서 브랜치를 따야 한다.
- 스프린트 도중 공통 담당자에게 새 컴포넌트/토큰 요청이 발생하면, 공통 담당자는 별도 소규모 PR(`feature/core-*`)로 먼저 병합하고 각 팀은 다시 `main`을 pull한 뒤 이어간다. 이때 헤더/네비 변경은 9개 파일 전체에 동일하게 반영되므로, 다른 팀은 자신의 페이지 블록 외 영역에서 diff가 발생해도 임의로 되돌리지 않는다.
