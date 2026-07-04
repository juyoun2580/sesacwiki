# PAGES.md

이 프로젝트는 MPA(Multi-Page App) 구조다. 9개의 화면이 각각 독립된 HTML 파일로 분리되어 있으며, SPA 시절의 `gp(id)` 페이지 전환 함수는 제거되었다 — 페이지 이동은 전부 일반 `<a href="파일명.html">` 링크로 처리한다. 이 문서는 **파일별로 실제 연결된 CSS/JS/JSON 의존성**을 정리한다.

> 파일 소유 규칙 및 담당자 배정은 [WORK_ORDER.md](WORK_ORDER.md)를 참고한다.
> 컴포넌트 상세 정의(공통/페이지 전용 분류 포함)는 [COMPONENTS.md](COMPONENTS.md)를 참고한다.
> 데이터 스키마는 [JSON_GUIDE.md](JSON_GUIDE.md)를 참고한다.

---

## 한눈에 보기 (CSS / JS / JSON 의존성 표)

모든 페이지는 예외 없이 공통 CSS 5종(`reset.css`, `variables.css`, `base.css`, `layout.css`, `components.css`)과 공통 헤더/네비게이션(`<header class="header">` + `<nav class="nav">`)을 공유한다. 아래 표는 **그 위에 추가로 연결되는 페이지 전용 리소스**만 정리한 것이다.

| HTML 파일 | 페이지 전용 CSS | 로드하는 JS (공통+전용) | 사용 JSON |
|---|---|---|---|
| `index.html` | `pages/home.css` | `app.js` | `data/home.json` |
| `wiki.html` | `pages/wiki.css` | `toast.js`, `ui.js` | `data/wiki.json` |
| `detail.html` | `pages/wiki.css` | `toast.js`, `app.js`, `ui.js`, `modal.js`, `pages/highlight.js` | `data/wiki.json` |
| `exam.html` | `pages/exam.css` | `toast.js`, `app.js`, `ui.js` | `data/exam.json` |
| `quiz.html` | `pages/exam.css` | `toast.js`, `app.js`, `pages/quiz.js` | `data/exam.json` |
| `job.html` | `pages/job.css` | `toast.js`, `app.js`, `ui.js` | `data/job.json` |
| `my.html` | `pages/my.css` | `toast.js`, `app.js`, `ui.js` | `data/my_docs.json` |
| `mywords.html` | `pages/my.css` | `toast.js`, `app.js`, `ui.js`, `modal.js`, `pages/quiz.js` | `data/words.json` |
| `myfav.html` | `pages/my.css` | `toast.js`, `app.js`, `ui.js` | 없음 (`wiki.json`/`my_docs.json`/`words.json`의 `isFavorite` 항목을 모아 표시하는 뷰) |

**JS 로드 규칙**: 각 HTML은 실제로 그 페이지에서 쓰는 JS만 연결한다(CLAUDE.md "각 HTML에는 자신이 사용하는 CSS와 JS만 연결한다"). 예를 들어 `wiki.html`은 진행률 표시나 토스트 트리거 버튼이 없어 `app.js`를 아예 로드하지 않는다. `mywords.html`이 `pages/quiz.js`를 로드하는 이유는 단어 퀴즈 선택지 토글 로직이 Exam 담당 소유 파일에 들어있기 때문이다(교차 의존, 아래 WORK_ORDER.md 참고).

---

## home — 홈 대시보드

- **파일**: `index.html`
- **담당 CSS**: `assets/css/pages/home.css`
- **담당 JS**: 전용 JS 없음. `[data-progress]` 폭 적용과 `data-action="toast"` 위임은 공통 `assets/js/app.js`가 처리.
- **담당 JSON**: `assets/data/home.json` — 성장현황 통계, 추천 로드맵 5종, 최근 본 페이지, 즐겨찾기 요약, 최근 저장 단어, 연속 학습 기록, 오늘의 한마디
- **사용 Component**: Button, Card, Tag, Progress Bar, Score Ring, Section Title, Streak Card
- **사용 Layout**: `.shell` → `.page__content`(사이드바 없음) + `.side-panel`
- **페이지 전용 요소** (home.css 소유): `.hero`, `.stat-card`, `.roadmap-card`, `.quote-box`, `.shortcut-btn`, `.recent-list`, `.favorite-list`, `.word-chip-list`

---

## wiki — 새싹위키 목록

- **파일**: `wiki.html`
- **담당 CSS**: `assets/css/pages/wiki.css` (detail과 공유)
- **담당 JS**: 전용 JS 없음. 정렬(sort-pill)·즐겨찾기(favorite-star)·사이드바 토글은 공통 `assets/js/ui.js`가 처리.
- **담당 JSON**: `assets/data/wiki.json`의 `categories`/`list`
- **사용 Component**: Favorite Star, Tag, Sort Pill, Pagination, Rank Badge, Section Title (Button/Card/Progress Bar/Modal 등은 사용하지 않음 — [COMPONENTS.md](COMPONENTS.md) 재분류 표 참고)
- **사용 Layout**: `.shell` → `.sidebar`(카테고리) + `.page__content` + `.side-panel`(인기글/팁)
- **페이지 전용 요소**: `.wiki-toolbar`, `.wiki-row-list`, `.wiki-row`, `.top-list`, `.tip-box`

---

## detail — 위키 상세

- **파일**: `detail.html`
- **담당 CSS**: `assets/css/pages/wiki.css` (wiki 목록과 같은 파일에 포함)
- **담당 JS**: `assets/js/pages/highlight.js` (텍스트 드래그 하이라이트 전담). 단어장 모달 열기(`data-action="open-modal"`)는 공통 `assets/js/modal.js`가 처리.
- **담당 JSON**: `assets/data/wiki.json`의 `detail["wiki-001"]` (본문/TOC/관련 문서)
- **사용 Component**: Back Link, Button, Code Box, Favorite Star, Highlight Toolbar, Modal, Progress Bar, TOC Item, Tag, Toast
- **사용 Layout**: `.shell` → `.page__content`만 사용 (사이드바/side-panel 없음). 내부에 자체 3단 구조(`detail-layout`: TOC + article + aside)
- **페이지 전용 요소**: `.detail-layout`, `.article-header`, `.article`, `.highlight-banner`, `.save-box`, `.highlight-list`, `.related-item`

---

## exam — 모의고사 목록

- **파일**: `exam.html`
- **담당 CSS**: `assets/css/pages/exam.css` (quiz와 공유)
- **담당 JS**: 전용 JS 없음. 필터탭(filter-tab)·사이드바 토글은 공통 `assets/js/ui.js`가 처리. `app.js`는 우측 오답노트 토스트 버튼 때문에 로드.
- **담당 JSON**: `assets/data/exam.json`의 `categories`/`list`/`myStats`
- **사용 Component**: Button, Filter Tab, Score Ring, Section Title, Tag, Toast
- **사용 Layout**: `.shell` → `.sidebar`(과목별) + `.page__content` + `.side-panel`(내 응시 현황)
- **페이지 전용 요소**: `.exam-sidebar-card`, `.exam-row-list`, `.exam-row`, `.exam-status-ring-wrap`, `.exam-stat`, `.recent-exam`, `.wrong-note-box`

---

## quiz — 모의고사 응시

- **파일**: `quiz.html`
- **담당 CSS**: `assets/css/pages/exam.css` (exam 목록과 같은 파일에 포함)
- **담당 JS**: `assets/js/pages/quiz.js` (객관식 선택, 타이머). 이 파일은 `mywords.html`의 단어 퀴즈 선택지 토글도 함께 담당한다(교차 의존).
- **담당 JSON**: `assets/data/exam.json`의 `questions["exam-001"]`
- **사용 Component**: Back Link, Button, Progress Bar, Section Title, Tag, Toast
- **사용 Layout**: `.shell` → `.page__content`만 사용. 내부에 자체 3단 구조(`quiz-layout`: 좌 정보 + 중 문제 + 우 문제목록/타이머/메모)
- **페이지 전용 요소**: `.quiz-header`, `.quiz-info-card`, `.quiz-tip`, `.quiz-progress`, `.quiz-question`, `.choice`, `.question-grid`, `.time-ring`, `.memo-panel`

---

## job — 취업핸드북

- **파일**: `job.html`
- **담당 CSS**: `assets/css/pages/job.css`
- **담당 JS**: 전용 JS 없음(현재). 사이드바 활성 토글은 공통 `assets/js/ui.js`가 처리. 신규 인터랙션(단계 이동, 도구 실행 등) 필요 시 `assets/js/pages/job.js` 신설.
- **담당 JSON**: `assets/data/job.json` — 단계(stepper) 6종, 현재 단계 태스크 목록, 취업 준비 현황 5종, 최근 작성한 자기소개서, 자주 쓰는 도구
- **사용 Component**: Button, Progress Bar, Section Title, Tag, Toast
- **사용 Layout**: `.shell` → `.sidebar`(핸드북 메뉴) + `.page__content` + `.side-panel`(준비 현황/도구)
- **페이지 전용 요소**: `.job-readiness-card`, `.job-stepper`, `.job-card`, `.job-task-list`, `.job-tip`, `.job-progress-list`, `.job-result-list`, `.job-tool-grid`, `.job-tool-btn`

---

## my — 내 문서

- **파일**: `my.html`
- **담당 CSS**: `assets/css/pages/my.css` (mywords/myfav와 공유)
- **담당 JS**: 전용 JS 없음(현재). 필터탭·사이드바 토글은 공통 `ui.js`. 신규 인터랙션(검색/정렬 select 등) 필요 시 `assets/js/pages/mypage.js` 신설.
- **담당 JSON**: `assets/data/my_docs.json` — 문서 목록, 문서 통계(stat-grid), 카테고리별 문서 수(legend)
- **사용 Component**: Button, Filter Tab, Pagination, Section Title, Tag, Toast
- **사용 Layout**: `.shell` → `.sidebar`(마이핸드북 메뉴) + `.page__content` + `.side-panel`(문서 통계)
- **페이지 전용 요소**: `.my-toolbar`, `.doc-row-list`, `.doc-row`, `.stat-grid`, `.stat-box`, `.legend-row`

---

## mywords — 저장한 단어

- **파일**: `mywords.html`
- **담당 CSS**: `assets/css/pages/my.css` (my/myfav와 같은 파일에 포함)
- **담당 JS**: 없음(현재). 단어 추가 모달은 공통 `assets/js/modal.js`, 단어 퀴즈 선택지 토글은 `assets/js/pages/quiz.js`(Exam 담당 소유 — 변경 필요 시 Exam 담당과 협의).
- **담당 JSON**: `assets/data/words.json` — 단어 목록, 통계(전체/오늘 학습/마스터), 오늘의 단어 퀴즈, 카테고리별 단어 수
- **사용 Component**: Button, Favorite Star, Modal, Pagination, Progress Bar, Score Ring, Section Title, Tag, Toast
- **사용 Layout**: `.shell` → `.sidebar` + `.page__content` + `.side-panel`(단어 퀴즈/카테고리 통계)
- **페이지 전용 요소**: `.word-stats`, `.word-row-list`, `.word-row`, `.word-quiz`, `.category-stat-row`

---

## myfav — 즐겨찾기

- **파일**: `myfav.html`
- **담당 CSS**: `assets/css/pages/my.css` (my/mywords와 같은 파일에 포함)
- **담당 JS**: 없음. 즐겨찾기 토글/필터탭은 공통 `assets/js/ui.js`가 처리.
- **담당 JSON**: 별도 파일 없음 — `wiki.json`/`my_docs.json`/`words.json`에서 `isFavorite: true`인 항목을 모아 보여주는 **뷰**로 취급한다(데이터 이중 저장 금지, [JSON_GUIDE.md](JSON_GUIDE.md) 참고).
- **사용 Component**: Button, Divider, Favorite Star, Filter Tab, Section Title, Tag, Toast
- **사용 Layout**: `.shell` → `.sidebar` + `.page__content` + `.side-panel`(즐겨찾기 요약)
- **페이지 전용 요소**: `.fav-row-list`, `.fav-row`, `.fav-complete`, `.fav-summary`, `.fav-summary-list`, `.fav-recent-list`
