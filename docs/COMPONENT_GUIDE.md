# COMPONENT_GUIDE.md

`components/`(마운트형 컴포넌트)와 `assets/css/components.css`(공통 UI 컴포넌트) 기준으로 다시 작성했다. 페이지 전용 클래스(`assets/css/pages/*.css`)는 포함하지 않는다 — 페이지별 구조는 [ARCHITECTURE.md](ARCHITECTURE.md) 참고.

> 원칙: 새 UI를 만들기 전에 이 문서에서 재사용 가능한 컴포넌트가 있는지 먼저 확인한다.

---

## 0. 마운트형 컴포넌트 (Header / Navigation)

`components/` 폴더의 두 파일은 CSS 컴포넌트가 아니라, 모든 페이지에 fetch로 주입되는 HTML 조각이다. 로딩 메커니즘(`loadHeader()`/`loadNav()`)은 [ARCHITECTURE.md](ARCHITECTURE.md) 3장 참고.

### Header (`components/header.html`)

로고, 검색창(Search Box), 알림 버튼, 포인트 배지, 로그인 버튼/유저칩을 포함한다. `assets/js/auth.js`가 `document.body.dataset.auth`값에 따라 로그인/비로그인 상태를 전환한다.

```html
<button type="button" class="btn btn--outline btn--sm auth-guest-only">로그인</button>
<div class="user-menu auth-user-only">
  <button type="button" class="user-chip" aria-haspopup="true" aria-expanded="false">...</button>
  <div class="user-menu__dropdown" role="menu">...</div>
</div>
```

**재사용 규칙**: `header.html`은 `feature/auth` 또는 공용 자원 협의 절차([DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) 3장)를 거쳐야만 수정한다. 페이지 팀이 임의로 헤더 마크업을 복사해 자기 페이지에 넣지 않는다.

### Navigation (`components/nav.html`)

홈/새싹위키/모의고사/취업핸드북/마이핸드북 5개 메뉴 고정. `assets/js/components/nav.js`의 `NAV_ACTIVE_GROUPS` 표와 반드시 함께 갱신한다(메뉴만 추가하고 표를 갱신하지 않으면 active 표시가 되지 않는다).

---

## 1. 공통 UI 컴포넌트 카탈로그 (`components.css`)

`✓`는 실제 페이지(정적 마크업 또는 JS 동적 렌더링 포함)에서 해당 컴포넌트를 사용 중임을 뜻한다.

| Component | 홈 | 로그인/가입 | 위키 목록 | 위키 상세 | 모의고사 목록 | 퀴즈 응시 | 취업핸드북 | 자소서관리 | 내문서 | 즐겨찾기 | 저장한 단어 | 마이페이지 | 프로필수정 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Button | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Card | ✓ | ✓ | · | · | ✓ | ✓ | ✓ | ✓ | · | · | · | ✓ | ✓ |
| Tag | ✓ | · | · | ✓ | · | ✓ | · | ✓ | ✓ | ✓ | · | · | · |
| Progress Bar | ✓ | · | · | ✓ | · | ✓ | · | ✓ | · | · | ✓(thin) | · | · |
| Score Ring | ✓ | · | · | · | ✓ | ✓ | · | · | · | · | · | · | · |
| Favorite Star | · | · | ✓(동적) | ✓ | · | · | · | · | · | ✓ | ✓(동적) | · | · |
| Modal | · | · | · | ✓(`#wmodal`) | · | · | · | ✓(`#resume-create-modal`) | · | · | ✓(`#wmodal`) | ✓(`#wmodal`) | · |
| Toast | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pagination | · | · | ✓ | · | · | · | · | · | ✓ | · | ✓ | · | · |
| Filter Tab | · | · | · | · | ✓ | · | · | ✓ | ✓ | ✓ | · | · | · |
| Sort Pill | · | · | ✓ | · | · | · | · | · | · | · | ✓ | · | · |
| Section Title | ✓ | · | ✓ | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | · |
| Back Link | · | · | · | ✓ | · | ✓ | · | · | · | · | · | · | ✓ |
| Divider | · | · | · | · | · | · | · | · | · | ✓ | · | · | · |
| Streak Card | ✓ | · | · | · | · | · | · | · | · | · | · | · | · |
| Code Box | · | · | · | ✓(동적) | · | · | · | · | · | · | · | · | · |
| Highlight Toolbar | · | · | · | ✓ | · | · | · | · | · | · | · | · | · |
| Hamburger Btn (헤더 내장) | 전 페이지 공통(모바일) | | | | | | | | | | | | |
| User Menu / User Chip (헤더 내장) | 전 페이지 공통 | | | | | | | | | | | | |
| Search Box / Avatar / Notification Btn / Point Badge (헤더 내장) | 전 페이지 공통 | | | | | | | | | | | | |

### Deprecated / Unused

| Component | 상태 | 비고 |
|---|---|---|
| **Rank Badge** (`.rank-badge`) | **Unused — 삭제 확정** | `components.css`에 정의만 있고 HTML/JS 어디에서도 인스턴스화되지 않는다(과거 위키 목록 side-panel "많이 보는 위키" 순위용이었으나 현재 위키 목록에는 해당 UI 없음). 재사용 계획 없음을 확인(2026-07-04, [TD-0003](technical-debt/2026-07-04-doc-review-findings.md#td-0003-rank-badge-컴포넌트-미사용)) — 다음 코드 변경 시 `components.css`에서 규칙 삭제 예정 |
| **TOC Item** (`.toc__item`) | 사용 중 (Deprecated 아님) | 정적 HTML에는 없지만 `wiki.js`의 `renderWikiToc()`가 동적으로 생성한다. 카탈로그에는 유지 |

새 컴포넌트를 만들 때는 위 Deprecated 목록에 다시 추가하지 말고, `.rank-badge`처럼 쓰이지 않게 될 경우 이 문서에서 상태를 갱신한다.

---

## 2. 헤더 전용 컴포넌트 (공통 담당, `header.html` 소유)

| Component | 클래스 |
|---|---|
| Search Box | `.search-box`, `.search-box__input` |
| Avatar | `.avatar` |
| Notification Button | `.notification-btn`, `.notification-btn__dot` |
| Point Badge | `.point-badge`, `.point-badge__icon` |
| User Chip / User Menu | `.user-chip`, `.user-menu`, `.user-menu__dropdown`, `.user-menu__item` |
| Hamburger Button | `.hamburger-btn`, `.hamburger-btn__bar` (모바일 사이드바 토글, `app.js`의 `initNavigation()`이 처리) |

이 6종은 `header.html` 안에서만 존재하므로 페이지 팀이 직접 다루지 않는다.

---

## 3. 주요 컴포넌트 사용 예시

### Button
```html
<button type="button" class="btn btn--primary">🌱 오늘 학습 시작하기</button>
<button type="button" class="btn btn--outline btn--sm">상세 분석 보기</button>
```
Modifier: `--primary`, `--outline`, `--danger`, `--sm`

### Card
```html
<div class="card"><div class="card__body">...</div></div>
```
현재 홈뿐 아니라 로그인/가입, 취업핸드북, 자소서관리, 모의고사, 마이페이지/프로필수정까지 폭넓게 재사용되고 있다(과거 문서 대비 실질적 공통 컴포넌트로 자리잡음).

### Modal
```html
<div class="modal-overlay" id="wmodal">
  <div class="modal" role="dialog" aria-modal="true">...</div>
</div>
```
같은 `.modal`/`.modal-overlay` 클래스로 서로 다른 두 인스턴스(`#wmodal` 단어 저장, `#resume-create-modal` 새 이력서 생성)가 공존한다 — 새 모달이 필요하면 새 `#id`만 만들고 클래스는 그대로 재사용한다.

### Progress Bar
```html
<div class="progress-bar progress-bar--thin" role="progressbar" aria-valuenow="75">
  <div class="progress-bar__fill progress-bar__fill--green" data-progress="75"></div>
</div>
```
`width`는 인라인 style이 아니라 `data-progress` 속성만 넣으면 `app.js`의 `initProgressBars()`가 일괄 적용한다. `--thin` modifier는 저장한 단어 페이지의 카테고리별 통계에 사용.

---

## 4. 새 컴포넌트를 추가할 수 있는 조건

다음을 모두 만족할 때만 `components.css`에 추가한다:

1. 위 카탈로그의 기존 컴포넌트 + modifier 조합으로 해결 불가능함을 확인했다.
2. 2개 이상의 페이지(폴더)에서 재사용될 예정이다.
3. `variables.css`의 기존 토큰만으로 스타일이 가능하다(새 토큰 필요 시 별도 협의).
4. 공용 자원 변경 절차([DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) 3장)를 거쳤다.

1개 페이지에서만 쓰인다면 `components.css`가 아니라 해당 `assets/css/pages/*.css`에 작성한다.
