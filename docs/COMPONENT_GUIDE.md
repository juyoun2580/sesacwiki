# COMPONENT_GUIDE.md

`components/`(마운트형 컴포넌트), `assets/css/components.css`(공통 UI 컴포넌트), `assets/js/components/*.js`(공용 JS 컴포넌트) 기준으로 작성했다. 페이지 전용 클래스(`assets/css/pages/*.css`)는 각 컴포넌트가 어느 페이지에서 재사용되는지 표시하는 용도로만 언급하고, 페이지별 구조 자체는 [ARCHITECTURE.md](ARCHITECTURE.md)를 참고한다.

> 원칙: 새 UI를 만들기 전에 이 문서에서 재사용 가능한 컴포넌트가 있는지 먼저 확인한다.

## 목차

- [0. 마운트형 컴포넌트 (Header / Navigation)](#0-마운트형-컴포넌트-header--navigation)
- [1. 컴포넌트 사용 현황 카탈로그](#1-컴포넌트-사용-현황-카탈로그)
- [2. 헤더 전용 컴포넌트](#2-헤더-전용-컴포넌트-공통-담당-headerhtml-소유)
- [3. Design Token](#3-design-token)
- [4. Icon System](#4-icon-system)
- [5. Button System](#5-button-system)
- [6. Select Component](#6-select-component)
- [7. Check Chip](#7-check-chip)
- [8. Empty State](#8-empty-state)
- [9. Progress Component](#9-progress-component)
- [10. 그 외 정적 CSS 컴포넌트 (Card·Tag·Modal 뼈대·Divider 등)](#10-그-외-정적-css-컴포넌트-cardtagmodal-뼈대divider-등)
- [11. Toolbar (JS 컴포넌트)](#11-toolbar-js-컴포넌트)
- [12. Pagination (JS 컴포넌트)](#12-pagination-js-컴포넌트)
- [13. Word Modal (JS 컴포넌트)](#13-word-modal-js-컴포넌트)
- [14. 새 컴포넌트를 추가할 수 있는 조건](#14-새-컴포넌트를-추가할-수-있는-조건)
- [15. 공통 컴포넌트 사용 규칙](#15-공통-컴포넌트-사용-규칙)

---

## 0. 마운트형 컴포넌트 (Header / Navigation)

`components/` 폴더는 CSS 컴포넌트 카탈로그가 아니라, 모든 페이지에 런타임 `fetch()`로 주입되는 HTML 조각을 담는 폴더다. 로딩 메커니즘(`loadHeader()`/`loadNav()`)은 [ARCHITECTURE.md](ARCHITECTURE.md) 3장 참고.

같은 폴더 안 `components/pagination.html`, `components/toolbar.html`, `components/word-modal.html`는 성격이 다르다 — `word-modal.html`은 실제로 `fetch()`되어 쓰이지만(13장), `pagination.html`/`toolbar.html`은 마크업 구조를 보여주는 **문서 전용 템플릿**이며 런타임에 로드되지 않는다(각 페이지가 컨테이너만 직접 마크업하고 JS가 그 안을 채운다).

### Header (`components/header.html`)

로고, 검색창(Search Box), 알림 버튼, 포인트 배지, 로그인 버튼/유저칩을 포함한다. `assets/js/auth.js`가 `document.body.dataset.auth` 값에 따라 로그인/비로그인 상태를 전환한다.

```html
<button type="button" class="btn btn--outline btn--sm auth-guest-only">로그인</button>
<div class="user-menu auth-user-only">
  <button type="button" class="user-chip" aria-haspopup="true" aria-expanded="false">...</button>
  <div class="user-menu__dropdown" role="menu">...</div>
</div>
```

**재사용 규칙**: `header.html`은 공용 자원 협의 절차([DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) 3장)를 거쳐야만 수정한다. 페이지 팀이 임의로 헤더 마크업을 복사해 자기 페이지에 넣지 않는다.

### Navigation (`components/nav.html`)

홈/새싹위키/모의고사/취업핸드북/마이핸드북 5개 메뉴 고정. `assets/js/components/nav.js`의 `NAV_ACTIVE_GROUPS` 표와 반드시 함께 갱신한다(메뉴만 추가하고 표를 갱신하지 않으면 active 표시가 되지 않는다).

---

## 1. 컴포넌트 사용 현황 카탈로그

`✓`는 실제 페이지(정적 마크업 또는 JS 동적 렌더링 포함)에서 해당 컴포넌트를 사용 중임을 뜻한다. 페이지명은 실제 파일 기준이다 — `pages/my/index.html`은 **마이페이지**(뱃지/현황 대시보드), `pages/my/docs.html`은 **내 문서**다(과거에는 이 둘의 파일명이 서로 반대였다).

| Component | 홈 | 로그인/가입 | 위키 목록 | 위키 상세 | 모의고사 목록 | 퀴즈 응시 | 취업핸드북 | 자소서관리 | 내문서 | 즐겨찾기 | 저장한 단어 | 마이페이지 | 프로필수정 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Button | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Card | ✓ | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | · | · | · | ✓ | ✓ |
| Tag | ✓ | · | · | ✓ | · | ✓ | · | ✓ | ✓ | ✓ | ✓ | · | · |
| Progress Bar | ✓ | · | · | ✓ | · | ✓ | · | ✓ | · | · | ✓(thin) | · | · |
| Score Ring | ✓ | · | · | · | ✓ | ✓ | · | · | · | · | · | · | · |
| Favorite Star | · | · | ✓(동적) | ✓ | · | · | · | · | · | ✓ | ✓(`--btn`, 동적) | · | · |
| Modal | · | · | · | ✓(Word Modal) | · | · | · | ✓(`#resume-create-modal`) | · | · | ✓(Word Modal) | ✓(Word Modal) | · |
| Toast | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Toolbar | · | · | ✓(연동) | · | ✓(연동) | · | · | · | · | · | ✓(정적 구조만) | · | · |
| Select | · | · | · | · | · | · | · | · | · | · | ✓ | · | · |
| Check Chip | · | · | · | · | · | ✓ | · | · | · | · | · | · | · |
| Pagination | · | · | ✓(연동) | · | · | · | · | · | ✓(정적) | · | ✓(연동) | · | · |
| Filter Tab | · | · | · | · | ✓ | · | · | ✓ | ✓ | ✓ | · | · | · |
| Sort Pill | · | · | ✓ | · | · | · | · | · | · | · | ✓ | · | · |
| Empty State | ✓ | · | · | · | ✓ | · | · | · | · | · | · | ✓ | · |
| Section Title | ✓ | · | ✓ | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · |
| Back Link | · | · | · | ✓ | · | ✓ | · | · | · | · | · | · | ✓ |
| Divider | · | · | · | · | · | · | · | · | · | ✓ | · | · | · |
| Streak Card | ✓ | · | · | · | · | · | · | · | · | · | · | · | · |
| Code Box | · | · | · | ✓(동적) | · | · | · | · | · | · | · | · | · |
| Highlight Toolbar / List | · | · | · | ✓ | · | · | · | · | · | · | · | · | · |
| Hamburger Btn (헤더 내장) | 전 페이지 공통(모바일) | | | | | | | | | | | | |
| User Menu / User Chip (헤더 내장) | 전 페이지 공통 | | | | | | | | | | | | |
| Search Box / Avatar / Notification Btn / Point Badge (헤더 내장) | 전 페이지 공통 | | | | | | | | | | | | |

### Deprecated / Unused

| Component | 상태 | 비고 |
|---|---|---|
| **Rank Badge** (`.rank-badge`) | **Unused — 삭제 확정** | `components.css`에 정의만 있고 HTML/JS 어디에서도 인스턴스화되지 않는다. 재사용 계획 없음을 확인함([기술 부채 TD-0003](technical-debt/2026-07-04-doc-review-findings.md#td-0003-rank-badge-컴포넌트-미사용)) — 실제 CSS 삭제는 다음 코드 변경 때 처리 예정 |
| **TOC Item** (`.toc__item`) | 사용 중 (Deprecated 아님) | 정적 HTML에는 없지만 `wiki.js`의 `renderWikiToc()`가 동적으로 생성한다. 카탈로그에는 유지 |

> Toolbar/Pagination/Word Modal 행의 자세한 HTML 구조·JS API는 각 장 참고. "연동"은 실제 데이터(검색/필터 결과, Supabase 등)와 함께 동작함을, "정적"은 아직 마크업만 있고 JS가 실제로 채우지 않음을 뜻한다.

---

## 2. 헤더 전용 컴포넌트 (공통 담당, `header.html` 소유)

| Component | 클래스 |
|---|---|
| Search Box | `.search-box`, `.search-box__input`, `.search-box__icon` |
| Avatar | `.avatar` |
| Notification Button | `.notification-btn`, `.notification-btn__dot` |
| Point Badge | `.point-badge`, `.point-badge__icon` |
| User Chip / User Menu | `.user-chip`, `.user-menu`, `.user-menu__dropdown`, `.user-menu__item`, `.user-menu__item--danger` |
| Hamburger Button | `.hamburger-btn`, `.hamburger-btn__bar` (모바일 사이드바 토글, `app.js`의 `initNavigation()`이 처리) |

이 6종은 `header.html` 안에서만 존재하므로 페이지 팀이 직접 다루지 않는다.

---

## 3. Design Token

**목적**: 색상·spacing·radius·shadow·타이포그래피를 하드코딩하지 않고 하나의 CSS 변수 집합으로 관리해, 디자인이 바뀌어도 토큰 값만 고치면 전체 화면에 반영되게 한다.

**HTML 구조**: 해당 없음 — `:root`에 선언된 CSS Custom Property다.

**사용 예시**
```css
.exam-sidebar-card {
  background: var(--bg-green-tint);
  border-color: var(--green-100);
  padding: var(--space-20);
  border-radius: var(--radius-lg);
}
```

**CSS 클래스(토큰 카테고리)** — 원본은 `assets/css/variables.css` 하나이며, 아래는 그 카테고리 요약이다(전체 목록은 파일이 원본이므로 이 문서에 값 자체를 복제하지 않는다):

| 카테고리 | 예시 토큰 |
|---|---|
| Green 팔레트 | `--green-900` ~ `--green-50`, `--green-tint` |
| 보조 색상 | `--blue-*`, `--gold-*`, `--coral-*`, `--star-gold` |
| Neutral/Ink 스케일 | `--neutral-900` ~ `--neutral-5`, `--neutral-bg`, `--neutral-surface` |
| 시맨틱 상태 색상 | `--success`, `--warning`, `--error`, `--info` |
| 컴포넌트 전용 배경(tint) | `--bg-green-tint`, `--bg-blue-tint`, `--bg-gold-tint`, `--bg-coral-tint` |
| Border Radius | `--radius-xl`(24px) ~ `--radius-xxs`(7px), `--radius-round`(999px) |
| Shadow | `--shadow-sm/md/lg/hero`, `--sh-sm/md/lg/g/g-hover/logo`(구버전 호환용) |
| Focus Ring | `--focus-ring`, `--focus-ring-sm` |
| 폰트 크기 | `--fs-10` ~ `--fs-80` |
| 폰트 굵기 | `--fw-regular`(400) ~ `--fw-extrabold`(800) |
| Line Height / Letter Spacing | `--lh-tight/normal/relaxed`, `--ls-normal/tight/tighter` |
| Spacing Scale | `--space-1` ~ `--space-80`(1px 단위 그대로, 대략 4~8px 간격) |
| Transition | `--transition-fast/normal/slow` |
| 하이라이트(형광펜) 색 | `--highlight-yellow`, `--highlight-yellow-bg` |
| 코드 블록 색 | `--code-bg`, `--code-text`, `--code-keyword`, `--code-string`, `--code-comment` |
| 구버전 호환 토큰 | `--g20`, `--gold-200`, `--coral-200`, `--blue-200`, `--purple`, `--purple-bg`, `--orange`, `--orange-bg`, `--orange-200`, `--hero-grad-1`, `--abox-grad`, `--odbox-grad` — 새 신규 토큰과 1:1 대응이 없어 유지 중, 새 UI에서는 사용하지 않는다 |

**JS 사용법**: 해당 없음(CSS 전용). 단, `width`/`progress` 값처럼 매번 달라지는 수치는 토큰이 아니라 `data-*` 속성 + `app.js`의 `initProgressBars()`로 처리한다(9장 참고).

**주의사항**
- 색상·radius·shadow·spacing 하드코딩 금지. 다만 아이콘 픽셀 크기(14~21px)나 마스코트 이미지 크기 같은, 토큰화 의미가 없는 고정 그래픽 수치는 예외로 허용된 전례가 있다(`exam.css`의 `.quiz-tip__mascot`, `word-row__date`의 고정폭 `82px` 등).
- 새 토큰이 필요하면 기존 팔레트에서 가장 가까운 값을 먼저 검토하고, 정말 없을 때만 `variables.css`에 추가한다(추가는 공용 자원 변경 절차를 따른다).

**사용 페이지**: 전 페이지 공통.

---

## 4. Icon System

**목적**: `<img>` 태그 대신 `mask-image` 기반 아이콘 시스템을 사용해, `color`(currentColor) 하나로 아이콘 색을 자유롭게 제어한다. SVG 자체는 항상 단색으로 두고, 색상은 CSS가 결정한다.

**HTML 구조**
```html
<span class="icon icon--search" aria-hidden="true"></span>
```
아이콘은 대부분 장식용이라 `aria-hidden="true"`를 붙인다. 아이콘 자체가 유일한 라벨인 버튼(예: 삭제 아이콘 버튼)은 버튼 요소에 `aria-label`을 따로 준다.

**사용 예시**
```html
<button type="button" class="btn--icon" data-action="delete-word" aria-label="단어 삭제">
  <span class="icon icon--close" aria-hidden="true"></span>
</button>
```

**CSS 클래스**
- `.icon` — 공통 베이스(`components.css`). `display:inline-block; width/height:18px; background-color:currentColor; mask-size:contain;`
- `.icon--{name}` — 개별 아이콘마다 `mask-image: url("../img/icon/ico-{name}.svg")` 하나만 오버라이드. 현재 45개 이상 정의되어 있으며 신규 아이콘은 `assets/img/icon/ico-*.svg`를 추가하고 같은 패턴으로 클래스를 하나 더 만든다.
- 개별 사용처에서 `width`/`height`만 로컬로 줄이는 경우가 흔하다(예: `.check-chip .icon { width:15px; height:15px; }`, `.word-row__actions .btn--icon .icon`은 기본 18px 그대로 사용).

**JS 사용법**: 별도 JS 없음(순수 CSS). 다만 상태에 따라 클래스를 바꿔 다른 아이콘으로 보이게 하는 "아이콘 토글" 패턴이 여러 곳에서 반복된다.
```js
// wiki.js — 즐겨찾기 별 아이콘 토글
iconEl.classList.toggle('icon--star', !isOn);
iconEl.classList.toggle('icon--star-filled', isOn);
```

**주의사항**
- 새 SVG를 임의로 추가하지 않는다. 요청받은 아이콘이 없으면 형태가 가장 비슷한 기존 아이콘으로 대체하고, 대체했다는 사실을 반드시 알린다(예: `icon--message-square` 요청 시 `icon--message`로 대체한 사례).
- `mask-image`는 배경 이미지가 아니라 도형(alpha) 정보만 사용하므로, SVG 자체의 `fill`/`stroke` 색상은 무시된다 — 색을 바꾸려면 항상 부모/자신의 `color`를 바꾼다.

**사용 페이지**: 전 페이지 공통.

---

## 5. Button System

**목적**: 텍스트/아이콘 버튼의 배경·테두리·크기·상태를 하나의 Base + Modifier 조합으로 통일한다.

**HTML 구조**
```html
<button type="button" class="btn btn--primary">확인</button>
```

**사용 예시**
```html
<button type="button" class="btn btn--primary btn--lg">🌱 오늘 학습 시작하기</button>
<button type="button" class="btn btn--outline btn--sm">상세 분석 보기</button>
<button type="button" class="btn--icon" aria-label="닫기"><span class="icon icon--close"></span></button>
```

**CSS 클래스** (`components.css`, 현재 실제로 정의된 범위)

| 분류 | 클래스 |
|---|---|
| Base | `.btn` (텍스트형), `.btn--icon` (아이콘 전용 정사각형, 40×40) |
| Intent(색상) | `.btn--primary`, `.btn--secondary`, `.btn--outline`, `.btn--outline--secondary`, `.btn--outline-danger`, `.btn--ghost`, `.btn--danger`, `.btn--success`, `.btn--warning`, `.btn--error` |
| Size | `.btn--sm`, `.btn--lg` (기본 `.btn` 자체가 medium — 별도 `--md` 클래스 없음) |
| Group | `.btn-group`(+ `.btn-group .btn.active`) |
| State | `:hover` / `:active` / `:disabled` — 네이티브 pseudo-class만 사용, `.is-disabled` 같은 별도 상태 클래스는 없음 |

**JS 사용법**: 없음(순수 CSS). 클릭 동작은 버튼 자체가 아니라 `data-action` 속성 + 페이지 JS의 이벤트 위임(`e.target.closest('[data-action="..."]')`)이 담당한다.

**주의사항**
- 페이지 CSS가 `.btn--danger:disabled` 같은 공용 규칙을 자기 파일에서 다시 정의해 덮어쓰지 않는다(현재 `pages/mypage.css`가 `components.css`와 다른 `opacity`값으로 `.btn--danger:disabled`를 중복 정의하고 있어 화면마다 다르게 보인다 — 알려진 불일치이며 정리 대상).
- 아이콘만 있는 작은 액션 버튼(즐겨찾기/수정/삭제)은 아직 완전히 통일되어 있지 않다. `.btn--icon`(40×40, 테두리)을 기반으로 페이지마다 `width`/`height`만 로컬로 줄이는 방식(`.word-row__actions .btn--icon { width:34px; height:34px; }`)과, 별도 클래스(`.highlight-list__delete`, `.favorite-star--btn`)로 완전히 따로 만든 방식이 공존한다 — 신규 아이콘 버튼을 만들 때는 먼저 `.btn--icon` 재사용이 가능한지 확인한다.
- 취업핸드북(`job.css`)의 탭/칩/토글 버튼류(`ff-tab`, `ff-cert-chip`, `job-tool-btn` 등)는 이 Button System과 별개로 각자 구현되어 있다 — 현재는 페이지 전용으로 남아있는 상태다.

**사용 페이지**: 전 페이지 공통(가장 널리 쓰이는 컴포넌트).

---

## 6. Select Component

**목적**: 네이티브 `<select>`의 브라우저 기본 드롭다운 화살표 대신, 공용 Icon System(`icon--chevron-down`)으로 화살표를 표시하는 커스텀 셀렉트 스타일.

**HTML 구조**
```html
<div class="select">
  <select class="select__field">
    <option>전체 카테고리</option>
  </select>
  <span class="icon icon--chevron-down select__icon" aria-hidden="true"></span>
</div>
```
네이티브 `<select>`는 자식 요소를 가질 수 없어, 아이콘을 겹치려면 `.select` 래퍼가 반드시 필요하다.

**사용 예시** (`pages/my/words.html`, 카테고리 필터)
```html
<div class="select">
  <select id="word-category" class="select__field">
    <option>전체 카테고리</option>
    <option>CS/IT</option>
    <option>Java</option>
    <option>SQL</option>
  </select>
  <span class="icon icon--chevron-down select__icon" aria-hidden="true"></span>
</div>
```

**CSS 클래스** (`components.css`)
- `.select` — 래퍼, `position: relative; display: inline-flex;`
- `.select__field` — 실제 `<select>`. `appearance:none`으로 브라우저 기본 화살표(배경 이미지)를 제거. 흰 배경, `border`, `radius-sm`, `font-size:13px`, `font-weight:600`(`--fw-semibold`), hover 시 `background: var(--neutral-5)`.
- `.select__icon` — 래퍼 우측에 절대 위치로 겹치는 화살표 아이콘.

**JS 사용법**: 없음(순수 CSS). `<select>`의 `value`를 읽는 것은 호출 페이지 JS의 몫이다 — 예를 들어 `#word-category`는 현재 마크업만 있고 실제 필터링 로직에 연결되어 있지 않다(주의사항 참고).

**주의사항**
- `#word-category`(저장한 단어 화면의 카테고리 셀렉트)는 현재 어떤 JS도 `value`를 읽지 않는다 — 마크업은 존재하지만 실제 필터링 기능은 아직 구현되어 있지 않은 상태다.
- 새 색상/크기가 필요하면 modifier(`.select__field--sm` 등)로 확장하고, `.select__field` 자체의 기본값은 바꾸지 않는다.

**사용 페이지**: `pages/my/words.html`(현재 유일한 사용처).

---

## 7. Check Chip

**목적**: 체크박스를 텍스트 라벨이 아니라 버튼처럼 보이는 토글 칩으로 표시한다. JS 없이 CSS `:has()`만으로 체크 상태에 따른 스타일 전환을 구현해, 기존 checkbox 이벤트/접근성을 그대로 유지하면서 시각적으로만 바꾼 사례다.

**HTML 구조**
```html
<label class="check-chip">
  <input type="checkbox" class="sr-only">
  <span class="icon icon--message" aria-hidden="true"></span>라벨 텍스트
</label>
```
체크박스는 `.sr-only`(클립 기반 접근성 숨김, `display:none` 아님)로 시각적으로만 숨기고 키보드/스크린리더 접근은 유지한다. `<label>`이 `<input>`을 감싸므로 라벨 클릭 시 기본 HTML 동작으로 체크박스가 토글된다.

**사용 예시** (`pages/exam/quiz.html`, "나중에 다시 풀기")
```html
<label class="check-chip">
  <input type="checkbox" id="quiz-flag-checkbox" class="sr-only">
  <span class="icon icon--message" aria-hidden="true"></span>나중에 다시 풀기
</label>
```

**CSS 클래스** (`components.css`)
- `.check-chip` — `inline-flex`, 흰 배경, `border`, `radius-md`, `font-weight:700`
- `.check-chip:has(:checked)` — 체크됐을 때 `border-color`/`background`/`color`를 초록 계열로 전환(`:has()` 관계형 pseudo-class, 별도 JS 토글 클래스 불필요)
- `.check-chip .icon` — 15×15로 축소

**JS 사용법**: 없음. `quiz.js`는 `#quiz-flag-checkbox`를 오직 `id`로만 참조(`change` 이벤트, `.checked` 읽기/쓰기)하고 `.check-chip` 클래스나 구조는 전혀 몰라도 된다 — 마크업을 이 컴포넌트로 바꿔도 기존 JS는 무수정으로 동작한다.

**주의사항**: `:has()`를 지원하지 않는 아주 오래된 브라우저에서는 체크 표시가 시각적으로 반영되지 않는다(체크박스 자체 동작에는 영향 없음). 이 프로젝트에서 `:has()`를 사용한 첫 사례다.

**사용 페이지**: `pages/exam/quiz.html`(현재 유일한 사용처). 이름 자체를 범용으로 지어뒀으므로 마이페이지/위키 등 다른 화면에서 비슷한 토글이 필요하면 그대로 재사용 가능하다.

---

## 8. Empty State

**목적**: 목록이 비어 있을 때 아이콘 + 제목 + 설명 3단 구성을 통일해서 보여준다.

**HTML 구조**
```html
<div class="empty-state">
  <span class="empty-state__icon" aria-hidden="true"><span class="icon icon--{name}"></span></span>
  <p class="empty-state__title">제목</p>
  <p class="empty-state__desc">설명</p>
</div>
```

**사용 예시** (`home.js`)
```js
listEl.innerHTML = `<li class="word-chip word-chip--empty">
  ${emptyStateHTML('word', 'icon--flag', '저장한 단어가 없어요', '단어장에 새 단어를 저장해보세요')}
</li>`;
```

**CSS 클래스**: `.empty-state`, `.empty-state__icon`, `.empty-state__title`, `.empty-state__desc`.

**JS 사용법**: 전역 `components.css` 컴포넌트가 아니라, **`emptyStateHTML()` 헬퍼 함수가 `home.js`/`exam.js`/`mypage.js` 세 파일에 각각 독립적으로 존재**한다. 시그니처가 서로 다르다.
```js
// home.js — modifier 인자 포함
function emptyStateHTML(modifier, iconClass, title, desc) { ... }
// exam.js / mypage.js — modifier 없음
function emptyStateHTML(iconClass, title, desc) { ... }
```

**주의사항**
- `.empty-state` CSS 자체도 `home.css`/`exam.css`/`pages/my.css`(마이페이지·저장한 단어 공용)에 거의 동일하게 중복 정의되어 있고, `auth.css`에는 `.empty-state__icon`만 부분적으로 존재한다. 아직 `components.css`로 승격되지 않은 **공통화 후보**다 — 새 화면에 Empty State가 필요하면 이 셋 중 하나를 그대로 복사하지 말고, 먼저 `components.css`로 옮기는 게 맞는지 검토한다.
- `iconClass` 인자에 넘기는 값의 형태가 파일마다 다르다: `home.js`는 `'icon--flag'`(전체 클래스명), `exam.js`/`mypage.js`는 `'file-text'`(접두사 없이 이름만, 함수 내부에서 `icon--` 접두사를 붙임). 다른 파일의 예제를 그대로 복붙하면 깨진다.

**사용 페이지**: 홈, 모의고사 목록, 마이페이지(저장한 단어 없음 등).

---

## 9. Progress Component

**목적**: 진행률을 인라인 `width` 스타일 없이 `data-*` 속성 하나로 표현한다.

### Progress Bar

**HTML 구조**
```html
<div class="progress-bar" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
  <div class="progress-bar__fill progress-bar__fill--green" data-progress="75"></div>
</div>
```

**CSS 클래스**: `.progress-bar`, `.progress-bar__fill`, 색상 modifier `--green`/`--blue`/`--orange`/`--coral`/`--purple`(`components.css`), 두께 modifier `--thin`(`pages/my.css`, 저장한 단어 카테고리별 통계 전용).

**JS 사용법**: `app.js`의 `initProgressBars()`가 `[data-progress]`를 가진 모든 요소를 찾아 `style.width`를 일괄 적용한다.
```js
function initProgressBars() {
  document.querySelectorAll('[data-progress]').forEach(el => {
    el.style.width = el.dataset.progress + '%';
  });
}
```
`data-progress` 값을 동적으로 바꾼 뒤에는 `initProgressBars()`를 다시 호출해야 반영된다(예: `wiki.js`의 `applyWikiProgress()`가 라벨 갱신 후 이 함수를 재호출).

### Score Ring

퀴즈/모의고사 결과 화면의 원형 점수 게이지. `.score-ring`, `.score-ring__bg`/`__fill`(SVG `<circle>`), `.score-ring__text`/`__value` — `stroke-dasharray`/`stroke-dashoffset`을 점수 비율에 맞춰 JS가 직접 계산해 넣는다(`quiz.js`).

**주의사항**: 퀴즈 응시 중 타이머 링(`.time-ring`, `pages/exam.css`)은 Score Ring과 시각적으로 비슷하지만 별도로 구현된 **페이지 전용** 컴포넌트다 — 카운트다운이라는 별개 도메인이라 공용화하지 않았다.

**사용 페이지**: Progress Bar — 홈, 위키 상세, 퀴즈, 취업핸드북, 저장한 단어(thin). Score Ring — 모의고사 목록, 퀴즈 결과.

---

## 10. 그 외 정적 CSS 컴포넌트 (Card·Tag·Modal 뼈대·Divider 등)

JS 없이 클래스만 붙이면 되는 컴포넌트는 아래처럼 간단히만 정리한다.

### Card
```html
<div class="card"><div class="card__body">...</div></div>
```
홈뿐 아니라 로그인/가입, 취업핸드북, 자소서관리, 모의고사, 마이페이지/프로필수정까지 폭넓게 재사용된다.

### Tag
```html
<span class="tag tag--green">SQL</span>
```
색상 modifier: `--green`, `--green600`, `--blue`, `--gold`, `--coral`, `--gray`, `--purple`, `--orange`, `--recommended`. 배지 하나에 하나의 색상 modifier만 사용한다.

### Modal (공용 뼈대)
```html
<div class="modal-overlay" id="wmodal">
  <div class="modal" role="dialog" aria-modal="true">...</div>
</div>
```
같은 `.modal`/`.modal-overlay` 클래스로 서로 다른 두 인스턴스(`#wmodal` Word Modal, `#resume-create-modal` 새 이력서 생성)가 공존한다. 새 모달이 필요하면 새 `#id`만 만들고 클래스는 재사용한다. `#wmodal`은 마크업을 복제하지 말고 [13장의 `openWordModal()`](#13-word-modal-js-컴포넌트)을 호출해서 연다.

### Divider / Section Title / Back Link / Filter Tab / Sort Pill / Favorite Star

| Component | 클래스 |
|---|---|
| Divider | `.divider` |
| Section Title | `.section-title`, `.section-title--sm`, `.section-title__link` |
| Back Link | `.back-link` |
| Filter Tab | `.filter-tabs`, `.filter-tab`, `.filter-tab--active` |
| Sort Pill | `.sort-pills`, `.sort-pill`, `.sort-pill--active` |
| Favorite Star | `.favorite-star`(글자 크기 별, hover 시 확대), `.favorite-star--on`(채워진 상태), `.favorite-star--btn`(34×34 박스형 — `.btn--icon`류와 나란히 놓일 때, `word-row` 등에서 사용) |

**주의사항**: `pages/my.css`에 `.sort-pills`가 `components.css`와 별도로 다시 정의되어 있다(`flex-wrap:wrap`만 추가된 거의 동일한 버전) — 아직 정리되지 않은 중복이다.

---

## 11. Toolbar (JS 컴포넌트)

**목적**: 검색창(Search Box) + 정렬 Pill(Sort Pill)을 조립하는 순수 UI 컴포넌트. 페이지 데이터를 전혀 모르며, 검색/정렬 "무엇을 할지"는 호출 페이지가 콜백으로 처리한다.

**HTML 구조**
```html
<div class="toolbar" id="wikiToolbar">
  <div class="toolbar__search"></div>
  <div class="toolbar__actions"></div>
</div>
```
참고용 템플릿(문서 전용, fetch 안 됨): `components/toolbar.html`. `.toolbar__search`/`.toolbar__actions` 내부는 `createToolbar()` 호출 시 JS가 채운다.

컨트롤이 검색/정렬 이상으로 많아지는 화면(예: 카테고리 select, 즐겨찾기 토글, 추가 버튼)은 `.toolbar__actions` 안을 한 번 더 묶는다:
```html
<div class="toolbar" id="wordToolbar">
  <div class="toolbar__search">...</div>
  <div class="toolbar__actions">
    <div class="toolbar__filters"><!-- select, sort 등 --></div>
    <div class="toolbar__buttons"><!-- 즐겨찾기만, 단어 추가 등 --></div>
  </div>
</div>
```

**사용 예시** — 검색+정렬만 필요한 화면은 `createToolbar()`로 JS가 내부를 전부 채운다.
```javascript
wikiToolbar = createToolbar({
  container: '#wikiToolbar',
  searchPlaceholder: '위키 검색하기',
  sorts: ['최신순', '인기순', '난이도순'],
  onSearch(keyword) { wikiState.search = keyword; renderWikiList(); },
  onSort(sort) { wikiState.sort = sort; renderWikiList(); }
});
```
검색/정렬 외에 카테고리 select·즐겨찾기 토글·추가 버튼까지 필요한 화면(`pages/my/words.html`)은 `createToolbar()`가 지원하지 않는 범위라, `.toolbar`/`.toolbar__search`/`.toolbar__actions`(+`__filters`/`__buttons`) **CSS 구조만 정적 마크업으로 재사용**하고 `createToolbar()`는 호출하지 않는다 — 검색창 안쪽도 `createToolbar()`가 생성하는 것과 동일한 `.search-box` 마크업을 그대로 손으로 채운다.

**CSS 클래스** (`assets/css/toolbar.css`)
- `.toolbar` — `flex`, 검색창과 액션 영역을 가로 배치
- `.toolbar__search` — `flex:1`
- `.toolbar__actions` — 필터/버튼 그룹을 가로 배치
- `.toolbar__filters`, `.toolbar__buttons` — 액션이 많은 화면에서 액션 영역을 다시 나누는 서브 그룹(없어도 무방)

검색창(`.search-box`)과 정렬 Pill(`.sort-pills`/`.sort-pill`) 자체의 스타일은 `components.css`의 공용 컴포넌트를 그대로 쓴다 — `toolbar.css`는 이 둘을 가로로 배치하는 레이아웃만 정의한다.

**JS API** (`assets/js/components/toolbar.js`, 전역 함수 `createToolbar()`)
```javascript
createToolbar({ container, searchPlaceholder, sorts, onSearch, onSort })
```
| 인자 | 타입 | 설명 |
|---|---|---|
| `container` | `string \| Element` | `.toolbar__search`/`.toolbar__actions`를 담고 있는 컨테이너 |
| `searchPlaceholder` | `string` | 검색 input의 placeholder/aria-label |
| `sorts` | `string[]` | 정렬 Pill 라벨 목록. 첫 번째가 기본 활성 상태 |
| `onSearch` | `(keyword: string) => void` | 검색 input `input` 이벤트마다 호출 |
| `onSort` | `(sortLabel: string) => void` | 정렬 Pill 클릭 시 호출 |

반환값(뒤로가기 등으로 검색어/정렬 상태를 프로그램적으로 복원해야 할 때 사용):
```javascript
{ setSearchValue(value), setActiveSort(label) }
```

**주의사항**
- `createToolbar()`는 호출 시 `.toolbar__search`/`.toolbar__actions`의 `innerHTML`을 통째로 덮어쓴다 — 카테고리 select 같은 추가 컨트롤이 이미 정적으로 들어있는 컨테이너에 호출하면 그 마크업이 사라진다. 검색+정렬 이상이 필요하면 `createToolbar()`를 호출하지 말고 CSS 구조만 재사용한다(위 사용 예시 참고).
- Toolbar 자신은 상태(현재 몇 페이지, 무슨 정렬인지)를 갖지 않는다 — `onSearch`/`onSort` 콜백 안에서 호출 페이지가 상태를 갱신하고 목록을 다시 그려야 한다.

**사용 페이지**: `pages/wiki/index.html`, `pages/exam/index.html`(`createToolbar()` 연동), `pages/my/words.html`(CSS 구조만 정적 재사용, JS 호출 없음).

---

## 12. Pagination (JS 컴포넌트)

**목적**: 페이지 번호 버튼 생성, 이전/다음 이동, 클릭 이벤트 처리를 데이터와 완전히 분리된 순수 UI로 재사용한다.

**HTML 구조**
```html
<nav class="pagination" id="wikiPagination" aria-label="페이지 네비게이션"></nav>
```
참고용 템플릿(문서 전용, fetch 안 됨): `components/pagination.html`

**CSS 클래스** (`assets/css/pagination.css`)
- `.pagination` — 버튼 그룹 컨테이너(`flex`, 가운데 정렬)
- `.pagination__btn` — 페이지 버튼(숫자 / 이전·다음 아이콘 공용)
- `.pagination__btn--active` — 현재 페이지 강조

**JS API** (`assets/js/components/pagination.js`, 전역 함수 `renderPagination()`)
```javascript
renderPagination({ container, totalCount, currentPage, pageSize, onChange })
```
| 인자 | 타입 | 설명 |
|---|---|---|
| `container` | `string \| Element` | 버튼을 그릴 컨테이너 선택자 또는 엘리먼트 |
| `totalCount` | `number` | 필터/검색 적용 후 전체 항목 수 (0이면 아무것도 그리지 않음) |
| `currentPage` | `number` | 현재 페이지 (범위를 벗어나면 자동 보정) |
| `pageSize` | `number` | 페이지당 항목 수 |
| `onChange` | `(page: number) => void` | 페이지 버튼 클릭 시 호출되는 콜백 |

**사용 예시**
```javascript
renderPagination({
  container: "#wikiPagination",
  totalCount: sorted.length,
  currentPage: wikiState.page,
  pageSize: WIKI_PAGE_SIZE,
  onChange(page) {
    wikiState.page = page;
    renderWikiList();
  }
});
```

**주의사항**
- `onChange(page)`는 목표 페이지 번호만 넘겨준다 — `currentPage` 상태 갱신과 목록 재렌더링은 항상 호출부 책임이다.
- pagination.js 담당: 버튼 DOM 생성, `--active` 표시, 첫/마지막 페이지에서 이전·다음 버튼 비활성화, 클릭 시 `onChange` 호출. 호출 페이지 담당: `totalCount` 계산, `currentPage` 상태 보관, 재렌더링.

**사용 페이지**: `pages/wiki/index.html`(연동), `pages/my/words.html`(연동, `mypage.js`의 `WORD_PAGE_SIZE`), `pages/my/docs.html`(컨테이너만 정적으로 존재 — 이 화면 자체가 아직 전용 JS 없이 정적 마크업이라 실제로 연동되어 있지는 않다, [ARCHITECTURE.md](ARCHITECTURE.md) 7장 참고).

---

## 13. Word Modal (JS 컴포넌트)

**목적**: 단어 추가/수정/삭제 모달을 `wiki/detail.html`(위키 상세) · `my/words.html`(저장한 단어) · `my/index.html`(마이페이지 대시보드 단어 도감 패널) 3곳에서 공유하는 단일 컴포넌트로 분리한다. 모달 자신은 Supabase API·JSON·localStorage를 전혀 모른다 — 순수 UI/이벤트 컴포넌트다.

**HTML 구조**
```html
<div id="word-modal-mount"></div>
```
`assets/js/components/modal.js`의 `loadWordModal()`이 `components/word-modal.html`을 이 컨테이너에 fetch해 넣는다.

**CSS 클래스**
모달 공용 뼈대(`.modal-overlay`, `.modal`, `.modal__title`, `.modal__field`, `.modal__label`, `.modal__input`, `.modal__actions`)는 `components.css`의 Modal 규칙을 그대로 재사용한다. Word Modal 전용 요소만 `assets/css/modal.css`에 추가로 정의되어 있다.
- `.word-modal__form` — create/edit 모드의 입력 폼 영역
- `.word-modal__confirm` — delete 모드의 확인 문구 영역

**JS API** (`assets/js/components/modal.js`, 전역 함수 `openWordModal()`)
```javascript
openWordModal({ mode, word, onSave, onDelete })
```
| 인자 | 타입 | 설명 |
|---|---|---|
| `mode` | `"create" \| "edit" \| "delete"` | 모달이 어떤 화면으로 열릴지 |
| `word` | `object` | edit/delete: 기존 단어 객체(필수). create: 카테고리 등 일부 프리필값(선택) |
| `onSave` | `(values: {term, definition, category}) => void` | create/edit에서 저장 버튼 클릭 시 호출 |
| `onDelete` | `(word) => void` | delete에서 삭제 버튼 클릭 시 호출 |

**사용 예시**
```javascript
// Create
openWordModal({
  mode: "create",
  async onSave(values) {
    try {
      await api.addWord({ ...values, pos: '명사', example: '', favorite: false });
      toast(`"${values.term}"를 저장했어요!`);
    } catch (err) {
      toast(err.message || '단어 저장에 실패했어요. 다시 시도해주세요.');
    }
  }
});

// Delete
openWordModal({
  mode: "delete",
  word: existingWord,
  async onDelete(word) {
    await api.deleteWord(word.id);
    await renderWordGroups();
  }
});
```

**주의사항**
- `onSave`/`onDelete` 콜백은 모달이 닫힌 **직후**에 호출된다 — 콜백 안에서 API가 실패해도 모달은 이미 닫혀 있으므로, 실패 시 반드시 `toast()`로 별도 안내해야 한다(콜백에 `try/catch` 없이 `await api.addWord(...)`만 호출하면 실패가 조용히 묻힌다 — 실제로 이런 누락이 있었던 사례가 있어 모든 호출부는 `try/catch` + 실패 toast를 갖춰야 한다).
- modal.js 담당: 모달 열기/닫기, `mode`별 UI 전환, 입력값 읽기/프리필, 저장/삭제 버튼 클릭 이벤트 바인딩, `onSave`/`onDelete` 호출. 호출 페이지 담당: 실제 Supabase 호출, 부가 필드 채우기, 저장/삭제 후 재렌더링, toast 안내.

**사용 페이지**: `pages/wiki/detail.html`(단어장 추가, 하이라이트→단어장), `pages/my/words.html`(추가/수정/삭제), `pages/my/index.html`(마이페이지 대시보드 단어 도감 패널의 수정/삭제).

---

## 14. 새 컴포넌트를 추가할 수 있는 조건

다음을 모두 만족할 때만 `components.css`에 추가한다:

1. 위 카탈로그의 기존 컴포넌트 + modifier 조합으로 해결 불가능함을 확인했다.
2. 2개 이상의 페이지(폴더)에서 재사용될 예정이다.
3. `variables.css`의 기존 토큰만으로 스타일이 가능하다(새 토큰 필요 시 별도 협의).
4. 공용 자원 변경 절차([DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) 3장)를 거쳤다.

1개 페이지에서만 쓰인다면 `components.css`가 아니라 해당 `assets/css/pages/*.css`에 작성한다.

---

## 15. 공통 컴포넌트 사용 규칙

1. **새 UI 작업 전 이 문서부터 확인한다.** 특히 아이콘 버튼류·탭/칩류는 이미 비슷한 게 있을 가능성이 높다(5장 주의사항 참고).
2. **기존 클래스에 modifier를 더하는 것을 우선한다.** 새 BEM 블록을 만들기 전에 `.btn--{intent}`, `.tag--{color}` 같은 기존 modifier 축에 새 값을 추가할 수 있는지 먼저 검토한다.
3. **JS 컴포넌트(Toolbar/Pagination/Word Modal)는 "무엇을 보여줄지" 모른다.** 데이터·API 호출은 항상 호출 페이지 JS 책임이다 — 이 경계를 깨고 컴포넌트 안에 특정 페이지 로직을 넣지 않는다.
4. **아이콘은 새로 만들지 않는다.** 없는 아이콘은 가장 비슷한 기존 아이콘으로 대체하고 그 사실을 알린다(4장 참고).
5. **하드코딩 금지, Design Token 우선.** 색상/spacing/radius/shadow는 항상 `variables.css` 토큰을 쓴다. 정말 토큰화 의미가 없는 고정 그래픽 수치(아이콘 픽셀 크기 등)만 예외로 허용한다.
6. **페이지 전용 스타일은 페이지 CSS에, 2개 이상 화면 공용 스타일만 `components.css`에.** 반대로 두면(1개 화면 전용을 `components.css`에 넣거나, 공용 개념을 페이지마다 재구현하는 것) 유지보수 비용이 커진다 — 현재 Empty State(8장), 탭/칩류(Button System 주의사항)가 후자에 해당하는 정리 대상으로 남아있다.
7. **공용 자원(헤더/네비, `components.css`, 공용 JS)은 임의로 수정하지 않는다.** 변경이 필요하면 별도의 작은 PR로 분리하고 영향받는 담당자에게 리뷰를 요청한다([DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) 3장).
