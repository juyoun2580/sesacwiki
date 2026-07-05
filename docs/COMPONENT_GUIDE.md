# COMPONENT_GUIDE.md

`components/`(마운트형 컴포넌트)와 `assets/css/components.css`(공통 UI 컴포넌트) 기준으로 다시 작성했다. 페이지 전용 클래스(`assets/css/pages/*.css`)는 포함하지 않는다 — 페이지별 구조는 [ARCHITECTURE.md](ARCHITECTURE.md) 참고.

> 원칙: 새 UI를 만들기 전에 이 문서에서 재사용 가능한 컴포넌트가 있는지 먼저 확인한다.

## 목차

- [0. 마운트형 컴포넌트 (Header / Navigation)](#0-마운트형-컴포넌트-header--navigation)
- [1. 공통 UI 컴포넌트 카탈로그](#1-공통-ui-컴포넌트-카탈로그-componentscss)
- [2. 헤더 전용 컴포넌트](#2-헤더-전용-컴포넌트-공통-담당-headerhtml-소유)
- [3. 주요 컴포넌트 사용 예시](#3-주요-컴포넌트-사용-예시)
- [4. 새 컴포넌트를 추가할 수 있는 조건](#4-새-컴포넌트를-추가할-수-있는-조건)
- [5. 공용 JS 컴포넌트 API (Pagination · Word Modal)](#5-공용-js-컴포넌트-api-pagination--word-modal)

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
| Modal | · | · | · | ✓(Word Modal) | · | · | · | ✓(`#resume-create-modal`) | · | · | ✓(Word Modal) | ✓(Word Modal) | · |
| Toast | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pagination | · | · | ✓(연동) | · | · | · | · | · | ✓(정적) | · | ✓(연동) | · | · |
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

> Modal/Pagination 행의 자세한 HTML 구조·JS API·Callback 계약은 [5. 공용 JS 컴포넌트 API](#5-공용-js-컴포넌트-api-pagination--word-modal) 참고. "연동"은 실제 데이터(검색/필터 결과, Supabase 등)와 함께 동작함을, "정적"은 아직 마크업만 있고 JS가 실제로 페이지를 넘기지는 않음을 뜻한다.

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
같은 `.modal`/`.modal-overlay` 클래스로 서로 다른 두 인스턴스(`#wmodal` Word Modal, `#resume-create-modal` 새 이력서 생성)가 공존한다 — 새 모달이 필요하면 새 `#id`만 만들고 클래스는 그대로 재사용한다. `#wmodal`은 이제 공용 컴포넌트(Word Modal)로 분리되어 있다 — 여는 방법은 마크업을 복제하는 게 아니라 [5장의 `openWordModal()`](#5-공용-js-컴포넌트-api-pagination--word-modal)을 호출하는 것이다.

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

---

## 5. 공용 JS 컴포넌트 API (Pagination · Word Modal)

CSS 클래스만 재사용하는 0~4장의 컴포넌트와 달리, 아래 둘은 실제 동작(렌더링/열기·닫기/이벤트)까지 포함한 **JS API**다. 둘 다 "화면을 어떻게 보여줄지"만 담당하고, "무엇을 보여줄지"(데이터, API 호출)는 호출하는 페이지 JS가 책임진다 — 이 경계를 지켜야 다른 페이지에서도 그대로 재사용할 수 있다.

### Pagination

**1. 컴포넌트 목적**
페이지 번호 버튼 생성, 이전/다음 이동, 클릭 이벤트 처리를 데이터와 완전히 분리된 순수 UI로 재사용한다. 위키 목록·저장한 단어 등 목록이 있는 화면이라면 어디서든 같은 API로 페이지네이션을 붙일 수 있다.

**2. HTML 구조**
`header.html`/`nav.html`과 달리 fetch로 주입되지 않는다. 각 페이지가 빈 컨테이너만 직접 마크업에 둔다.
```html
<nav class="pagination" id="wikiPagination" aria-label="페이지 네비게이션"></nav>
```
참고용 템플릿(문서 전용, fetch 안 됨): `components/pagination.html`

**3. CSS 클래스**
`assets/css/pagination.css`에 정의.
- `.pagination` — 버튼 그룹 컨테이너(`flex`, 가운데 정렬)
- `.pagination__btn` — 페이지 버튼(숫자 / 이전·다음 아이콘 공용)
- `.pagination__btn--active` — 현재 페이지 강조

**4. JS API**
`assets/js/components/pagination.js`, 전역 함수 `renderPagination()`로 노출.
```javascript
renderPagination({ container, totalCount, currentPage, pageSize, onChange })
```
| 인자 | 타입 | 설명 |
|---|---|---|
| `container` | `string \| Element` | 버튼을 그릴 컨테이너 선택자 또는 엘리먼트 |
| `totalCount` | `number` | 필터/검색 적용 후 전체 항목 수 (0이면 페이지네이션 자체를 그리지 않음) |
| `currentPage` | `number` | 현재 페이지 (범위를 벗어나면 자동 보정) |
| `pageSize` | `number` | 페이지당 항목 수 |
| `onChange` | `(page: number) => void` | 페이지 버튼 클릭 시 호출되는 콜백 |

**5. 사용 예제**
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

**6. Callback 설명**
- `onChange(page)` — 사용자가 숫자 버튼이나 이전/다음 버튼을 클릭하면 이동할 목표 페이지 번호 하나만 인자로 넘어온다. `renderPagination()` 자신은 "지금 몇 페이지인지" 상태를 갖지 않으므로, `currentPage` 값을 실제로 갱신하고 목록을 다시 그리는 것은 전부 `onChange` 콜백 안에서 호출부가 처리해야 한다.

**7. 재사용 규칙 (역할 분리)**
- **pagination.js 담당**: 페이지 버튼 DOM 생성, 활성/비활성(`--active`) 표시, 첫/마지막 페이지에서 이전·다음 버튼 비활성화, 클릭 시 `onChange` 호출.
- **호출 페이지(JS) 담당**: 검색/필터 적용 후 `totalCount` 계산, `currentPage` 상태 보관, `onChange`에서 페이지 상태 갱신 + 목록 재렌더링.
- 현재 `wiki.js`(위키 목록), `mypage.js`(저장한 단어, `WORD_PAGE_SIZE`)가 실제 데이터로 연동해서 쓰고 있다. `my/index.html`(내 문서)은 아직 정적 마크업만 표준화된 상태이며, 실제 연동 시 동일 API를 그대로 재사용하면 된다.

### Word Modal

**1. 컴포넌트 목적**
단어 추가/수정/삭제 모달을 `wiki/detail.html`(위키 상세) · `my/words.html`(저장한 단어) · `my/mypage.html`(대시보드 단어 도감 패널) 3곳에서 공유하는 단일 컴포넌트로 분리한다. 모달 자신은 Supabase API·JSON·localStorage를 전혀 모른다 — 순수 UI/이벤트 컴포넌트다.

**2. HTML 구조**
`header.html`/`nav.html`과 동일하게 fetch로 주입된다.
```html
<div id="word-modal-mount"></div>
```
`assets/js/components/modal.js`의 `loadWordModal()`이 `components/word-modal.html`을 이 컨테이너에 fetch해 넣는다.

**3. CSS 클래스**
모달 공용 뼈대(`.modal-overlay`, `.modal`, `.modal__title`, `.modal__field`, `.modal__label`, `.modal__input`, `.modal__actions`)는 기존 `components.css`의 Modal 규칙을 그대로 재사용한다. Word Modal 전용 요소만 `assets/css/modal.css`에 추가로 정의되어 있다.
- `.word-modal__form` — create/edit 모드의 입력 폼 영역
- `.word-modal__confirm` — delete 모드의 확인 문구 영역

**4. JS API**
`assets/js/components/modal.js`, 전역 함수 `openWordModal()`로 노출.
```javascript
openWordModal({ mode, word, onSave, onDelete })
```
| 인자 | 타입 | 설명 |
|---|---|---|
| `mode` | `"create" \| "edit" \| "delete"` | 모달이 어떤 화면으로 열릴지 |
| `word` | `object` | edit/delete: 기존 단어 객체(필수). create: 카테고리 등 일부 프리필값(선택) |
| `onSave` | `(values: {term, definition, category}) => void` | create/edit에서 저장 버튼 클릭 시 호출 |
| `onDelete` | `(word) => void` | delete에서 삭제 버튼 클릭 시 호출 |

**5. 사용 예제**
```javascript
// Create
openWordModal({
  mode: "create",
  onSave(word) {
    api.addWord(word);
  }
});

// Edit
openWordModal({
  mode: "edit",
  word: existingWord,
  onSave(word) {
    api.updateWord(existingWord.id, word);
  }
});

// Delete
openWordModal({
  mode: "delete",
  word: existingWord,
  onDelete(word) {
    api.deleteWord(existingWord.id);
  }
});
```

**6. Callback 설명**
- `onSave(word)` — create/edit 모드에서 "저장" 버튼을 클릭하면, 사용자가 입력한 `{ term, definition, category }`만 인자로 넘어온다. `pos`/`example`/`categoryColor`/`favorite` 같은 부가 필드를 채우는 것과, 실제 저장(`api.addWord`/`api.updateWord`) 호출은 전부 콜백 안에서 호출부가 처리한다.
- `onDelete(word)` — delete 모드에서 "삭제" 버튼을 클릭하면, 모달을 열 때 넘겼던 `word` 객체가 그대로 다시 돌아온다. 실제 삭제(`api.deleteWord`) 호출은 콜백 안에서 처리한다.
- 두 콜백 모두 모달이 닫힌 **직후**에 호출되므로, 콜백 안에서 API가 실패하더라도 모달은 이미 닫혀 있다(기존 동작과 동일 — 토스트로 결과를 안내).

**7. 재사용 규칙 (역할 분리)**
- **modal.js 담당**: 모달 열기/닫기, `mode`별 UI 전환(입력 폼 ↔ 확인 문구, 저장/삭제 버튼 노출), 입력값 읽기·프리필, 저장/삭제 버튼 클릭 이벤트 바인딩, `onSave`/`onDelete` 호출.
- **호출 페이지(JS) 담당**: Supabase API 호출(`api.addWord`/`api.updateWord`/`api.deleteWord`), 카테고리→색상 매핑 등 부가 필드 채우기, 저장/삭제 후 목록 재렌더링, toast 안내.
- 현재 `wiki.js`(위키 상세 "단어장 추가" 버튼, 하이라이트→단어장), `mypage.js`(저장한 단어의 추가/수정/삭제, 대시보드 단어 도감 패널의 수정/삭제)에서 각자 자신의 `onSave`/`onDelete`를 넘겨 사용 중이다 — 두 페이지 JS는 서로의 콜백 내용을 알 필요가 없다.
