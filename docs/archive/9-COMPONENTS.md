# COMPONENTS.md

이 문서는 `assets/css/components.css`에 정의된 **공통 재사용 컴포넌트**의 목록과 사용 규칙을 정리한다.
페이지 전용 클래스(`assets/css/pages/*.css`에 정의된 것)는 포함하지 않는다. 페이지 전용 요소는 [PAGES.md](PAGES.md)를 참고한다.

> 원칙: 새 UI를 만들기 전에 이 문서에서 재사용 가능한 컴포넌트가 있는지 먼저 확인한다. (CLAUDE.md 원칙 1: 구조 > 기능 구현)

---

## 0. 공통 vs 페이지 전용 재분류 (9개 페이지 실사용 기준)

MPA 전환 이후 실제 마크업을 기준으로 어떤 컴포넌트가 정말 여러 페이지에서 재사용되는지 다시 확인했다. `✓`는 해당 페이지가 그 컴포넌트를 실제로 사용한다는 뜻이다.

| Component | index(Home) | wiki | detail | exam | quiz | job | my | mywords | myfav |
|---|---|---|---|---|---|---|---|---|---|
| Button | ✓ | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Card | ✓ | · | · | · | · | · | · | · | · |
| Tag / Badge | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Progress Bar | ✓ | · | ✓ | · | ✓ | ✓ | · | ✓ | · |
| Score Ring | ✓ | · | · | ✓ | · | · | · | ✓ | · |
| Favorite Star | · | ✓ | ✓ | · | · | · | · | ✓ | ✓ |
| Modal | · | · | ✓ | · | · | · | · | ✓ | · |
| Toast | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pagination | · | ✓ | · | · | · | · | ✓ | ✓ | · |
| Filter Tab | · | · | · | ✓ | · | · | ✓ | · | ✓ |
| Sort Pill | · | ✓ | · | · | · | · | · | · | · |
| Section Title | ✓ | ✓ | · | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Search Box | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Avatar | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Notification Button | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Point Badge | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| User Chip | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Back Link | · | · | ✓ | · | ✓ | · | · | · | · |
| Divider | · | · | · | · | · | · | · | · | ✓ |
| Streak Card | ✓ | · | · | · | · | · | · | · | · |
| TOC Item | · | · | ✓ | · | · | · | · | · | · |
| Code Box | · | · | ✓ | · | · | · | · | · | · |
| Highlight Toolbar | · | · | ✓ | · | · | · | · | · | · |
| Rank Badge | · | ✓ | · | · | · | · | · | · | · |

### 분류 결과

**A. 진짜 공통(2개 이상 페이지에서 재사용) — 그대로 `components.css` 유지**
Button, Tag/Badge, Progress Bar, Score Ring, Favorite Star, Modal, Toast, Pagination, Filter Tab, Section Title, Back Link, 그리고 헤더 전용 5종(Search Box, Avatar, Notification Button, Point Badge, User Chip — 모든 페이지의 공통 헤더에 항상 포함).

**B. 사실상 1개 페이지 전용 — `components.css`에 있지만 재사용 조건(24번째 줄 "새로운 Component를 만들 수 있는 조건" 2번: 2개 이상 페이지 재사용)을 충족하지 못함**

| Component | 실사용 페이지 | 비고 |
|---|---|---|
| Card | index(Home)만 | Home의 3분할 카드에만 사용. `stat-card`/`roadmap-card`(home.css)는 애초에 `.card`를 안 쓰고 자체 구현 중이라 실질적 사용처는 더 적다 |
| Sort Pill | wiki만 | |
| Rank Badge | wiki만 | |
| Streak Card | index(Home)만 | |
| TOC Item | detail만 | |
| Code Box | detail만 | |
| Highlight Toolbar | detail만 | |
| Divider | myfav만 | |

> 이 8개는 지금 당장 옮기지는 않는다(디자인/기능 변경 없음 원칙). 다만 앞으로 새로 이런 컴포넌트가 필요하면 "공통 후보"가 아니라 **해당 페이지의 `pages/*.css`에 만드는 것**이 원칙에 더 맞다는 점을 팀 전체가 인지하고 있어야 한다. 두 번째 사용처가 실제로 생기는 시점에 공통 담당자가 이전 여부를 판단한다.

**C. 페이지 전용 Component (각 `pages/*.css` 소유, `components.css`에는 없음)**

| 소유 CSS | 페이지 전용 Component |
|---|---|
| `home.css` | `.hero`, `.stat-card`, `.roadmap-card`, `.quote-box`, `.shortcut-btn`, `.recent-list`, `.favorite-list`, `.word-chip-list` |
| `wiki.css` (wiki 목록) | `.wiki-toolbar`, `.wiki-row`, `.top-list`, `.tip-box` |
| `wiki.css` (detail) | `.detail-layout`, `.article-header`, `.article`, `.highlight-banner`, `.save-box`, `.highlight-list`, `.related-item`, `.complete-btn` |
| `exam.css` (exam 목록) | `.exam-sidebar-card`, `.exam-row`, `.exam-status-ring-wrap`, `.exam-stat`, `.recent-exam`, `.wrong-note-box` |
| `exam.css` (quiz) | `.quiz-header`, `.quiz-info-card`, `.quiz-tip`, `.quiz-progress`, `.quiz-question`, `.choice`, `.question-grid`, `.time-ring`, `.memo-panel` |
| `job.css` | `.job-readiness-card`, `.job-stepper`, `.job-card`, `.job-task`, `.job-tip`, `.job-progress-list`, `.job-result-list`, `.job-tool-btn` |
| `my.css` (my) | `.my-toolbar`, `.doc-row`, `.stat-grid`/`.stat-box`, `.legend-row` |
| `my.css` (mywords) | `.word-stats`, `.word-row`, `.word-quiz`, `.category-stat-row` |
| `my.css` (myfav) | `.fav-row`, `.fav-complete`, `.fav-summary`, `.fav-summary-list`, `.fav-recent-list` |

이 표에서 이름이 비슷해 보이는 `stat-card`(home)/`job-card`(job)/`wiki-row`(wiki)/`exam-row`(exam)/`doc-row`,`fav-row`(my)는 전부 "surface+radius+shadow 카드" 패턴을 각자 다시 구현한 것들이다(24번 재사용 규칙에 이미 위반 사례로 기록되어 있음). 신규 카드형 요소를 또 추가하고 싶다면 여기에 하나를 더 보태지 말고 `.card` + modifier로 합치는 방향을 먼저 검토한다.

---

## 목차

1. Button
2. Card
3. Tag / Badge
4. Progress Bar
5. Score Ring
6. Favorite Star
7. Modal
8. Toast
9. Pagination
10. Filter Tab
11. Sort Pill
12. Section Title
13. Search Box
14. Avatar
15. Notification Button
16. Point Badge
17. User Chip
18. Back Link
19. Divider
20. Streak Card
21. TOC Item
22. Code Box
23. Highlight Toolbar
24. Rank Badge

---

## 1. Button

**사용 위치**: 전 페이지 공통 (CTA, 폼 액션, 리스트 액션 버튼 등)

**HTML 구조**
```html
<button type="button" class="btn btn--primary">🌱 오늘 학습 시작하기</button>
<button type="button" class="btn btn--outline btn--sm">상세 분석 보기</button>
<button type="button" class="btn btn--danger">시험 종료하기</button>
```

**CSS 클래스**: `.btn`

**Modifier**
| Modifier | 용도 |
|---|---|
| `.btn--primary` | 주요 액션 (초록 그라데이션) |
| `.btn--outline` | 보조 액션 (흰 배경 + 초록 테두리) |
| `.btn--danger` | 위험/종료 액션 (코랄) |
| `.btn--sm` | 작은 크기 (리스트 안, 카드 안 등) |

**사용 예시**: 홈 히어로 CTA, 모의고사 "시작하기", 문서 "+ 새 문서 작성", 모달 "취소/저장"

**재사용 규칙**
- `.btn`을 상속하지 않고 새로운 버튼 클래스를 만들지 않는다. 색상/크기 변형은 반드시 modifier로 추가한다.
- 현재 `shortcut-btn`(home), `job-tool-btn`(job)은 `.btn`을 쓰지 않고 자체 스타일을 재구현하고 있다 — 신규로 유사한 버튼이 필요하면 **자체 클래스를 새로 만들지 말고** `.btn`에 새 modifier(`.btn--tile` 등)를 추가할지 공통 담당자와 상의한다.

---

## 2. Card

**사용 위치**: 전 페이지 공통 (콘텐츠를 감싸는 흰색 표면 카드)

**HTML 구조**
```html
<div class="card">
  <div class="card__body">
    <div class="section-title">최근 본 페이지 <button class="section-title__link">전체보기 ›</button></div>
    <!-- 콘텐츠 -->
  </div>
</div>
```

**CSS 클래스**: `.card`, `.card__body`

**Modifier**: 현재 없음

**사용 예시**: 홈의 "최근 본 페이지 / 즐겨찾기 / 최근 저장한 단어" 3분할 카드

**재사용 규칙**
- `background: var(--surface); border-radius: var(--r-lg); border: 1px solid var(--border); box-shadow: var(--sh-sm);` 조합이 필요하면 새 클래스를 만들지 말고 `.card`를 사용하거나 `.card`에 modifier를 추가한다.
- **현재 위반 사례**: `stat-card`, `roadmap-card`(home.css), `job-card`(job.css), `wiki-row`(wiki.css), `exam-row`(exam.css), `doc-row`, `fav-row`(my.css)가 위 조합을 각자 파일에서 중복 구현하고 있다. 신규 카드형 요소를 추가할 때는 이 목록에 하나를 더 추가하지 말고, 가능하면 `.card` + modifier로 통합하는 방향을 우선 검토한다.

---

## 3. Tag / Badge

**사용 위치**: 전 페이지 공통 (카테고리/상태 라벨)

**HTML 구조**
```html
<span class="tag tag--green">SQL</span>
<span class="tag tag--recommended">추천</span>
```

**CSS 클래스**: `.tag`

**Modifier**
| Modifier | 색상 | 예시 용도 |
|---|---|---|
| `.tag--green` | 초록 | SQL, 새싹위키 |
| `.tag--blue` | 파랑 | Salesforce, IT/개발, 모의고사 |
| `.tag--gold` | 금색 | 취업핸드북, 임시저장 |
| `.tag--coral` | 코랄 | 경고성 상태 |
| `.tag--gray` | 회색 | Git, 노트, 기타 |
| `.tag--purple` | 보라 | 포트폴리오 |
| `.tag--orange` | 주황 | Java |
| `.tag--recommended` | 연초록 아웃라인 | "추천" 강조 라벨 |

**사용 예시**: 위키 카테고리, 모의고사 난이도, 문서 유형, 단어 카테고리

**재사용 규칙**
- 새 카테고리(색상)가 필요하면 임의로 인라인 색상을 넣지 말고, 먼저 기존 7색 중 의미가 맞는 것을 고른다. 정말 새 색상이 필요하면 `variables.css`에 토큰 추가 + `.tag--새색상` 추가를 공통 담당자에게 요청한다.

---

## 4. Progress Bar

**사용 위치**: 전 페이지 공통 (진도율, 준비율, 시험 진행률 등)

**HTML 구조**
```html
<div class="progress-bar" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100">
  <div class="progress-bar__fill progress-bar__fill--orange" data-progress="45"></div>
</div>
```

**CSS 클래스**: `.progress-bar`, `.progress-bar__fill`

**Modifier**
| Modifier | 용도 |
|---|---|
| `.progress-bar__fill--green/blue/orange/coral/purple` | 색상 |
| `.progress-bar--thin` | 얇은 버전 (mywords 카테고리별 통계) |

**사용 예시**: 홈 성장현황, 로드맵 카드, 위키 문서 진도, job 단계별 진행률, 퀴즈 진행률

**재사용 규칙**
- `width`(퍼센트)는 절대 인라인 `style`로 넣지 않는다. `data-progress` 속성만 넣으면 `assets/js/app.js`가 일괄 적용한다.
- 새 색상 modifier가 필요하면 `.tag`와 동일하게 `variables.css` 토큰을 먼저 추가한다.

---

## 5. Score Ring

**사용 위치**: 홈(학습 진도율), 모의고사(전체 평균), 저장한 단어(마스터율)

**HTML 구조**
```html
<div class="score-ring">
  <svg viewBox="0 0 68 68" width="68" height="68" role="img" aria-label="학습 진도율 62%">
    <circle class="score-ring__bg" cx="34" cy="34" r="28" stroke-width="6" />
    <circle class="score-ring__fill" cx="34" cy="34" r="28" stroke="var(--g700)" stroke-width="6"
      stroke-dasharray="176" stroke-dashoffset="67" transform="rotate(-90 34 34)" />
  </svg>
  <div class="score-ring__text"><span class="score-ring__value">62%</span></div>
</div>
```

**CSS 클래스**: `.score-ring`, `.score-ring__bg`, `.score-ring__fill`, `.score-ring__text`, `.score-ring__value`

**Modifier**: 크기는 modifier가 아니라 `viewBox`/`width`/`height`/`r` 값 조정으로 처리 (44~80px 범위 사용 중)

**재사용 규칙**
- `stroke-dashoffset` 계산(퍼센트 → 오프셋 변환)은 현재 정적 값으로 하드코딩되어 있다. 동적으로 계산하는 로직이 필요하면 새 페이지 JS에 중복 구현하지 말고 공통 담당자에게 유틸 함수 추가를 요청한다.

---

## 6. Favorite Star

**사용 위치**: 위키 목록/상세, 저장한 단어, 즐겨찾기 페이지

**HTML 구조**
```html
<span class="favorite-star favorite-star--on" role="button" tabindex="0" aria-pressed="true" aria-label="즐겨찾기">★</span>
```

**CSS 클래스**: `.favorite-star`

**Modifier**: `.favorite-star--on` (활성 상태)

**동작(JS)**: `assets/js/ui.js`의 `ts()` 함수가 전역으로 클릭을 바인딩한다. 신규로 즐겨찾기 별을 추가하면 별도 JS 작성 없이 자동으로 동작한다. 항상 같은 문구의 토스트를 띄우고 싶다면 `data-toast-override="문구"` 속성을 추가한다.

**재사용 규칙**
- 토글 로직은 `ui.js`(공통)가 전담한다. 페이지 담당자가 임의로 즐겨찾기 클릭 이벤트를 새로 바인딩하지 않는다.

---

## 7. Modal

**사용 위치**: 위키 상세(단어장 추가), 저장한 단어(+ 단어 추가) — 현재 "단어 저장 모달" 1종

**HTML 구조**
```html
<button type="button" class="btn btn--primary btn--sm" data-action="open-modal" data-word="">+ 단어 추가</button>

<div class="modal-overlay" id="wmodal">
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="wmodal-title">
    <p class="modal__title" id="wmodal-title">📓 단어장에 추가</p>
    <div class="modal__field">
      <label class="modal__label" for="mword">단어</label>
      <input class="modal__input" id="mword">
    </div>
    <div class="modal__actions">
      <button type="button" class="btn btn--outline btn--sm" data-action="close-modal">취소</button>
      <button type="button" class="btn btn--primary btn--sm" data-action="save-word">단어장에 저장</button>
    </div>
  </div>
</div>
```

**CSS 클래스**: `.modal-overlay`, `.modal`, `.modal__title`, `.modal__label`, `.modal__field`, `.modal__input`, `.modal__actions`

**Modifier**: `.modal-overlay--visible` (열림 상태)

**재사용 규칙**
- 모달 마크업/열고 닫는 로직(`assets/js/modal.js`)은 페이지에 상관없이 단 하나의 인스턴스(`#wmodal`)를 공유한다. 새 종류의 모달(예: 문서 저장 모달)이 필요하면 새 `#id`의 모달을 만들되 **`.modal`/`.modal-overlay` 클래스와 열고 닫는 패턴은 그대로 재사용**하고, 여는/닫는 JS는 공통 담당자와 함께 `assets/js/modal.js`에 추가한다.

---

## 8. Toast

**사용 위치**: 전 페이지 공통 (액션 피드백)

**HTML 구조**
```html
<button type="button" data-action="toast" data-message="코드가 복사되었어요!">복사</button>
<!-- body 최하단에 1개만 존재 -->
<div class="toast" id="toast" role="status" aria-live="polite"></div>
```

**CSS 클래스**: `.toast`

**Modifier**: `.toast--visible`

**동작(JS)**: `assets/js/toast.js`의 `toast(msg)` 전역 함수. `data-action="toast" data-message="..."` 속성만 추가하면 별도 JS 없이 동작한다.

**재사용 규칙**: 새로운 토스트 UI(색상, 위치 등)가 필요해도 새 클래스를 만들지 않는다. 문구만 바꿔서 재사용한다.

---

## 9. Pagination

**사용 위치**: 위키 목록, 내 문서, 저장한 단어

**HTML 구조**
```html
<nav class="pagination" aria-label="페이지 네비게이션">
  <button type="button" class="pagination__btn" aria-label="이전 페이지">‹</button>
  <button type="button" class="pagination__btn pagination__btn--active" aria-current="page">1</button>
  <button type="button" class="pagination__btn">2</button>
  <button type="button" class="pagination__btn" aria-label="다음 페이지">›</button>
</nav>
```

**CSS 클래스**: `.pagination`, `.pagination__btn`

**Modifier**: `.pagination__btn--active`

**재사용 규칙**: 리스트형 페이지(목록)에 페이지네이션이 필요하면 항상 이 컴포넌트를 사용한다. 현재 클릭 시 페이지 전환 JS는 연결되어 있지 않음(정적 마크업) — 실제 페이징 로직을 추가할 때는 공통 담당자와 협의한다(여러 페이지가 동일 패턴을 쓰므로).

---

## 10. Filter Tab

**사용 위치**: 모의고사, 내 문서, 즐겨찾기

**HTML 구조**
```html
<div class="filter-tabs">
  <button type="button" class="filter-tab filter-tab--active">전체</button>
  <button type="button" class="filter-tab">SQL</button>
</div>
```

**CSS 클래스**: `.filter-tabs`(그룹 wrapper), `.filter-tab`(개별 버튼)

**Modifier**: `.filter-tab--active`

**동작(JS)**: `assets/js/ui.js`가 같은 `.filter-tabs` 그룹 내에서 단일 선택 토글을 전역 처리한다.

---

## 11. Sort Pill

**사용 위치**: 위키 목록

**HTML 구조**
```html
<div class="sort-pills">
  <button type="button" class="sort-pill sort-pill--active">최신순</button>
  <button type="button" class="sort-pill">인기순</button>
</div>
```

**CSS 클래스**: `.sort-pills`(wrapper), `.sort-pill`

**Modifier**: `.sort-pill--active`

**참고**: `filter-tab`과 시각적으로 유사한 pill 토글이다. 신규로 유사한 정렬/필터 UI가 필요하면 새 클래스를 만들지 말고 `sort-pill` 또는 `filter-tab` 중 의미가 맞는 것을 재사용한다.

---

## 12. Section Title

**사용 위치**: 전 페이지 공통 (카드/패널 내부 소제목)

**HTML 구조**
```html
<div class="section-title">최근 본 페이지 <button type="button" class="section-title__link" data-goto="wiki">전체보기 ›</button></div>
```

**CSS 클래스**: `.section-title`, `.section-title__link`

**Modifier**: `.section-title--sm`(작은 크기), `.section-title--spaced`(위 여백 추가)

---

## 13. Search Box

**사용 위치**: 헤더(전역 검색) — 공통 레이아웃의 일부

**HTML 구조**
```html
<div class="search-box">
  <span class="search-box__icon" aria-hidden="true">🔍</span>
  <input type="text" class="search-box__input" placeholder="궁금한 내용을 검색해보세요!">
</div>
```

**CSS 클래스**: `.search-box`, `.search-box__input`, `.search-box__icon`

**재사용 규칙**: 헤더 전용이며 공통 담당자만 수정한다. 페이지별 검색창(`wiki-toolbar__input`, `my-toolbar__input` 등)은 각 `pages/*.css`에 별도로 존재하며 시각적으로만 유사할 뿐 다른 컴포넌트다.

---

## 14. Avatar

**사용 위치**: 헤더 유저칩 내부

```html
<span class="avatar" aria-hidden="true">🌿</span>
```

**CSS 클래스**: `.avatar` / **재사용 규칙**: 헤더 전용, 공통 담당자 소유.

---

## 15. Notification Button

**사용 위치**: 헤더

```html
<button type="button" class="notification-btn" aria-label="알림">🔔<span class="notification-btn__dot"></span></button>
```

**CSS 클래스**: `.notification-btn`, `.notification-btn__dot` / 공통 담당자 소유.

---

## 16. Point Badge

**사용 위치**: 헤더 (보유 포인트 표시)

```html
<p class="point-badge"><span class="point-badge__icon" aria-hidden="true">🪙</span>1,240P</p>
```

**CSS 클래스**: `.point-badge`, `.point-badge__icon` / 공통 담당자 소유.

---

## 17. User Chip

**사용 위치**: 헤더 (유저 정보 드롭다운 트리거)

```html
<button type="button" class="user-chip">
  <span class="avatar" aria-hidden="true">🌿</span>
  <span><span class="user-chip__name">김새싹</span><span class="user-chip__level">Lv.3 잎새</span></span>
  <span class="user-chip__caret" aria-hidden="true">▾</span>
</button>
```

**CSS 클래스**: `.user-chip`, `.user-chip__name`, `.user-chip__level`, `.user-chip__caret` / 공통 담당자 소유.

---

## 18. Back Link

**사용 위치**: 위키 상세, 퀴즈 응시

```html
<button type="button" class="back-link" data-goto="wiki">‹ 새싹위키 목록으로</button>
```

**CSS 클래스**: `.back-link` — 상세/응시처럼 "목록으로 돌아가기"가 필요한 모든 하위 페이지에서 재사용한다.

---

## 19. Divider

**사용 위치**: 즐겨찾기 페이지 side-panel

```html
<div class="divider"></div>
```

**CSS 클래스**: `.divider` — 단순 구분선. 카드/패널 내부 섹션을 나눌 때 재사용한다.

---

## 20. Streak Card

**사용 위치**: 홈 side-panel (연속 학습 기록)

```html
<div class="streak-card">
  <p class="streak-card__label">연속 학습 기록</p>
  <div class="streak-card__value-row">
    <span class="streak-card__number">7</span><span class="streak-card__unit">일</span>
    <span class="streak-card__note">최고 기록 12일</span>
  </div>
  <p class="streak-card__icon" aria-hidden="true">📅</p>
</div>
```

**CSS 클래스**: `.streak-card` — `components.css`에 정의되어 있어 형식상 공용 컴포넌트다. 현재는 홈에서만 쓰이지만, 다른 페이지에서 "연속 기록형" UI가 필요하면 새로 만들지 말고 이것을 재사용한다.

---

## 21. TOC Item

**사용 위치**: 위키 상세 목차

```html
<button type="button" class="toc__item toc__item--active">1. SELECT 기본 문법</button>
```

**CSS 클래스**: `.toc__item` / **Modifier**: `.toc__item--active`

---

## 22. Code Box

**사용 위치**: 위키 상세 본문 (코드 예제)

```html
<div class="code-box">
  <button type="button" class="code-box__copy-btn" data-action="toast" data-message="코드가 복사되었어요!">복사</button>
  <pre><span class="code-box__keyword">SELECT</span> 컬럼명
<span class="code-box__keyword">FROM</span> 테이블명</pre>
</div>
```

**CSS 클래스**: `.code-box`, `.code-box__copy-btn`, `.code-box__keyword`, `.code-box__string`, `.code-box__comment`

---

## 23. Highlight Toolbar

**사용 위치**: 위키 상세 (텍스트 드래그 시 플로팅 툴바), body 최하단에 단 1개 인스턴스

```html
<div class="highlight-toolbar" id="hlbar" role="toolbar">
  <button type="button" class="highlight-toolbar__btn highlight-toolbar__btn--yellow" data-action="apply-highlight" data-color="y">🟡 노란색</button>
</div>
```

**CSS 클래스**: `.highlight-toolbar`, `.highlight-toolbar__btn` / **Modifier**: `--yellow`, `--green`, `--word`, `--visible`

**재사용 규칙**: 마크업과 노출 로직(`assets/js/pages/highlight.js`)은 wiki 담당 소유이지만, 컴포넌트 정의 자체는 `components.css`에 있으므로 CSS 스타일 변경 시 공통 담당자와 협의한다.

---

## 24. Rank Badge

**사용 위치**: 위키 목록 side-panel (많이 보는 위키 순위)

```html
<span class="rank-badge">1</span>
<span class="rank-badge rank-badge--muted">4</span>
```

**CSS 클래스**: `.rank-badge` / **Modifier**: `.rank-badge--muted`(4위 이하)

---

## 재사용 규칙 (공통)

1. 새 UI를 만들기 전 이 문서에서 유사 컴포넌트를 먼저 검색한다.
2. 색상/spacing/radius/shadow 값은 항상 `variables.css` 토큰을 사용한다. 하드코딩 금지.
3. 클래스명은 BEM(`block__element--modifier`)을 따른다.
4. 동일한 시각적 패턴(예: surface+radius+shadow 카드 패턴)이 이미 존재하면 새 클래스를 만들지 않고 기존 클래스 + modifier로 확장한다.
5. 컴포넌트의 상호작용(JS)이 필요하면 `data-action="..."` 속성 기반 위임 패턴을 따른다(`ui.js`/`toast.js`/`modal.js` 참고). 페이지마다 새 이벤트 리스너를 중복 작성하지 않는다.

## 새로운 Component를 만들 수 있는 조건

다음 조건을 **모두** 만족할 때만 `assets/css/components.css`에 새 컴포넌트를 추가한다 (새 CSS 파일을 만들지 않는다):

1. 이 문서(COMPONENTS.md)에 있는 기존 24개 컴포넌트 중 modifier 추가로 해결할 수 없음을 확인했다.
2. 최소 2개 이상의 서로 다른 페이지에서 재사용될 예정이다. (1개 페이지에서만 쓰이면 → 해당 `pages/*.css`에 작성)
3. `variables.css`의 기존 토큰만으로 스타일이 가능하다. (새 토큰이 필요하면 토큰 추가도 함께 공통 담당자에게 요청)
4. 공통 담당자의 리뷰/승인을 받았다. (작업 분배 규칙은 [WORK_ORDER.md](WORK_ORDER.md) 참고)

위 조건을 만족하지 못하면 → 신규 컴포넌트가 아니라 **페이지 전용 요소**로 분류하고 `assets/css/pages/*.css`에 작성한다. 판단이 애매하면 [DECISION_TREE.md](DECISION_TREE.md)를 따른다.
