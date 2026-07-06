# ARCHITECTURE.md

현재 코드베이스를 기준으로 작성한 구조 문서다. 과거 MPA 초기 버전(9개 HTML이 루트에 평면적으로 존재하던 구조)은 다루지 않는다 — 지금 구조만 서술한다.

> 작업 규칙(브랜치/PR/체크리스트)은 [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md), 컴포넌트 카탈로그는 [COMPONENT_GUIDE.md](COMPONENT_GUIDE.md), 데이터/Supabase 구조는 [DATA_GUIDE.md](DATA_GUIDE.md) 참고.

---

## 1. 프로젝트 폴더 구조

```
/
├── index.html                  # 홈 (루트에 단독 존재, 유일하게 pages/ 밖에 있는 화면)
├── components/                 # 마운트용 HTML 조각 (fetch로 주입, 아래 3장 참고)
│   ├── header.html
│   └── nav.html
├── pages/                      # 홈을 제외한 모든 화면. 폴더 = 기능 그룹
│   ├── auth/        login.html, signup.html
│   ├── wiki/         index.html, detail.html
│   ├── exam/         index.html, quiz.html
│   ├── handbook/     index.html, resume.html
│   └── my/           index.html, docs.html, favorites.html, words.html, edit.html
├── assets/
│   ├── css/
│   │   ├── reset.css / variables.css / base.css / layout.css / components.css   # 공통 5종
│   │   ├── toolbar.css / pagination.css / modal.css                            # 공용 JS 컴포넌트 스타일
│   │   └── pages/    auth.css, wiki.css, exam.css, job.css, my.css, mypage.css, resume.css, home.css
│   ├── js/
│   │   ├── supabase-client.js / auth.js / api.js       # 데이터·인증 공용 레이어
│   │   ├── app.js / ui.js / toast.js                    # 공통 UI 동작
│   │   ├── components/  header.js, nav.js, modal.js, pagination.js, toolbar.js  # 컴포넌트 로더/공용 JS 컴포넌트
│   │   └── pages/        wiki.js, highlight.js, exam.js, quiz.js, job.js,
│   │                      job-features.js, resume.js, mypage.js, home.js
│   ├── data/          home.json, wiki.json, wiki-data.json, exam.json, questions/*.json
│   └── img/
├── supabase/
│   └── schema.sql              # Supabase 테이블 정의 (DDL) — 실제 DB 스키마 원본
├── docs/                        # 이 문서들
├── old/                          # 과거 시안 보관용, 현재 빌드/배포와 무관 (참고 금지)
├── README.md / CLAUDE.md
```

**폴더 이름과 화면 이름이 다른 경우가 있다** (과거 문서와 대조 시 주의):

| 폴더/파일 | 실제 화면 |
|---|---|
| `pages/handbook/index.html` | 취업핸드북 |
| `pages/handbook/resume.html` | 자기소개서/이력서 관리 |
| `pages/my/index.html` | 마이페이지(뱃지/현황 대시보드) |
| `pages/my/docs.html` | 내 문서 |
| `pages/my/favorites.html` | 즐겨찾기 |
| `pages/my/words.html` | 저장한 단어 |
| `pages/my/edit.html` | 프로필 수정 |

`pages/my/index.html`과 `pages/my/docs.html`은 과거 파일명이 지금과 반대였다(이전에는 `index.html`이 "내 문서", `mypage.html`이 마이페이지였다) — 다른 문서나 커밋 이력을 참고할 때 혼동하지 않는다.

---

## 2. components 구조 (마운트형 컴포넌트)

`components/` 폴더는 **CSS 컴포넌트 카탈로그가 아니라**, 모든 페이지가 공유하는 헤더/네비게이션 마크업 조각을 담는 폴더다. 정적 사이트라 서버 include가 없으므로, 빌드 타임이 아니라 **런타임에 JS `fetch()`로 주입**하는 방식을 쓴다.

```
components/header.html   ← 로고, 검색창, 알림, 포인트, 로그인 버튼/유저칩
components/nav.html      ← 홈/위키/모의고사/취업핸드북/마이핸드북 5개 메뉴 링크
```

이 파일들은 완전한 HTML 문서가 아니라 **마운트 대상 안에 삽입될 조각**(fragment)이다.

---

## 3. loadComponent() 동작 방식

실제로는 `loadComponent()`라는 단일 함수가 아니라, 컴포넌트별로 분리된 로더 함수 두 개가 같은 패턴을 따른다 (`assets/js/components/header.js`, `assets/js/components/nav.js`).

```js
function loadHeader() {
  const mount = document.getElementById('header-mount');
  if (!mount) return Promise.resolve();
  return fetch('/components/header.html')
    .then(res => res.text())
    .then(html => { mount.innerHTML = html; });
}
```

동작 순서:

1. 페이지 HTML에는 빈 마운트 지점만 존재한다: `<header class="header" id="header-mount"></header>`, `<nav class="nav" id="nav-mount"></nav>`.
2. `app.js`가 로드되면서 `loadNav()`와 `loadHeader()`를 호출해 두 조각을 fetch로 가져와 `innerHTML`에 주입한다.
3. `loadNav()`는 주입 직후 `NAV_ACTIVE_GROUPS` 표에서 현재 `location.pathname`이 속한 그룹을 찾아 해당 `nav__item`에 `nav__item--active`를 부여한다. **새 페이지가 추가되면 이 표만 갱신하면 된다** (`assets/js/components/nav.js` 상단 주석 참고).
4. `loadHeader()` 완료 후에만 `initNavigation()`(햄버거 메뉴)과 `initAuth()`(로그인 상태 표시)를 실행한다 — 헤더 DOM이 아직 없는 시점에 이벤트를 바인딩하면 아무 요소도 찾지 못하기 때문에 `.then()` 체이닝으로 순서를 강제한다 (`app.js` 하단 참고).

```js
loadNav();
loadHeader().then(() => {
  initNavigation();
  initAuth();
});
```

**주의**: `auth/login.html`, `auth/signup.html`은 `header-mount`/`nav-mount`가 없는 독립 레이아웃이라 이 로더들이 아예 동작하지 않는다(의도된 설계 — 로그인 화면은 헤더/네비 없이 단독 표시).

---

## 4. Header / Navigation Component 구조

### Header (`components/header.html` + `assets/js/auth.js`)

| 요소 | 로그아웃 상태 | 로그인 상태 |
|---|---|---|
| `.auth-guest-only` (로그인 버튼) | 표시 | 숨김 |
| `.user-menu.auth-user-only` (유저칩+드롭다운) | 숨김 | 표시 |

전환은 CSS가 아니라 `auth.js`의 `updateHeader()`가 `document.body.dataset.auth = "user" | "guest"`를 설정하면 `components.css`가 그 값에 따라 `.auth-guest-only`/`.auth-user-only`의 표시 여부를 처리하는 방식이다. 유저칩 드롭다운 열기/닫기, 로그아웃 처리도 `auth.js`가 전담한다(`bindDropdown()`, `bindLogout()`).

### Navigation (`components/nav.html` + `assets/js/components/nav.js`)

메뉴 5개(홈/위키/모의고사/취업핸드북/마이핸드북) 고정. `data-nav` 속성 값과 `NAV_ACTIVE_GROUPS` 매핑으로 현재 페이지를 하이라이트한다. 메뉴 자체를 늘리려면 `nav.html`에 `<a data-nav="...">`를 추가하고 `nav.js`의 `NAV_ACTIVE_GROUPS`에 경로를 등록해야 한다(둘 다 안 하면 링크는 보이지만 active 표시가 되지 않는다).

---

## 5. 페이지별 CSS / JS / JSON 의존성

모든 페이지는 공통 CSS 5종(`reset`, `variables`, `base`, `layout`, `components`)을 공유한다. 아래는 **그 위에 추가되는 페이지 전용 리소스**다.

| 페이지 | 경로 | 전용 CSS | 전용/연동 JS (공통 제외) | 데이터 소스 |
|---|---|---|---|---|
| 홈 | `index.html` | `home.css` | `home.js` | `home.json`(fallback stats) + `wiki.json`(진도율 평균) + `wiki-data.json` + localStorage(`job_data`, `job_features`) |
| 로그인 | `pages/auth/login.html` | `auth.css` | (없음, `auth.js`가 폼 처리) | Supabase Auth |
| 회원가입 | `pages/auth/signup.html` | `auth.css` | (없음, `auth.js`가 폼 처리) | Supabase Auth |
| 위키 목록 | `pages/wiki/index.html` | `wiki.css` | `wiki.js` | `wiki-data.json` |
| 위키 상세 | `pages/wiki/detail.html` | `wiki.css` | `wiki.js`, `highlight.js`, `mypage.js` | `wiki-data.json` + Supabase(`wiki_bookmarks`, `wiki_recent_views`, `wiki_highlights`) |
| 모의고사 목록 | `pages/exam/index.html` | `exam.css` | `exam.js` | `exam.json`(목차) + `questions/{examId}.json` + Supabase(`exam_attempts`) |
| 모의고사 응시 | `pages/exam/quiz.html` | `exam.css` | `quiz.js` | `exam.json` + `questions/{examId}.json` + Supabase(`exam_attempts`) |
| 취업핸드북 | `pages/handbook/index.html` | `job.css` | `job.js`, `job-features.js` | localStorage(`job_data`, `job_features`) + Supabase(`job_progress`, 로그인 시 동기화) |
| 자소서 관리 | `pages/handbook/resume.html` | `my.css` + `resume.css` | `resume.js` | 정적 마크업 (연동 데이터 없음) |
| 내 문서 | `pages/my/docs.html` | `my.css` | (전용 JS 없음) | 정적 마크업 (연동 데이터 없음 — 6장 참고) |
| 즐겨찾기 | `pages/my/favorites.html` | `my.css` | (전용 JS 없음) | 정적 마크업 (연동 데이터 없음 — 6장 참고) |
| 저장한 단어 | `pages/my/words.html` | `my.css` | `quiz.js`, `mypage.js` | Supabase(`words`) |
| 마이페이지 | `pages/my/index.html` | `my.css` + `mypage.css` | `mypage.js` | Supabase(`profiles`, `words`, `badges`, `quiz_checkpoints`) |
| 프로필 수정 | `pages/my/edit.html` | `mypage.css` | `mypage.js` | Supabase(`profiles`) |

모든 페이지(로그인/회원가입 제외)는 다음 공용 JS를 공통으로 로드한다: `supabase-client.js` → `auth.js` → `api.js` → `components/header.js` → `components/nav.js` → `app.js` (+ 필요 시 `ui.js`, `components/modal.js`, `toast.js`).

위 표의 "전용 CSS"는 페이지가 소유하는 CSS만 나타낸다. 여기에 더해 [COMPONENT_GUIDE.md](COMPONENT_GUIDE.md) 11~13장의 공용 JS 컴포넌트를 쓰는 화면은 그 컴포넌트의 CSS도 함께 로드한다:

| 공용 컴포넌트 CSS | 로드하는 화면 |
|---|---|
| `toolbar.css` | 위키 목록, 모의고사 목록, 저장한 단어(CSS 구조만 재사용, JS 미호출) |
| `pagination.css` | 위키 목록, 저장한 단어, 내 문서(컨테이너만 정적) |
| `modal.css` | 위키 상세, 저장한 단어, 마이페이지(Word Modal) |

---

## 6. 교차 의존성이 있는 파일

| 파일/데이터 | 소유 페이지 | 함께 쓰는 페이지 | 내용 |
|---|---|---|---|
| `assets/js/pages/quiz.js` | `pages/exam/quiz.html` | `pages/my/words.html` | 객관식 선택지 토글 로직을 단어 퀴즈에도 그대로 재사용. 이 파일을 고치면 두 화면 모두 영향받는다 |
| `assets/js/pages/mypage.js` | `pages/my/index.html`(마이페이지), `pages/my/edit.html` | `pages/my/words.html`, `pages/wiki/detail.html` | 프로필 표시, 뱃지 렌더링 외에 "저장한 단어" 목록 렌더링·모달 저장 로직(`data-action="save-word"` 리스너)을 담당해 위키 상세와 단어장 화면에 걸쳐 있음 |
| `assets/js/components/modal.js` (Word Modal, `#word-modal-mount`) | 공통 | `pages/wiki/detail.html`, `pages/my/words.html`, `pages/my/index.html` | 모달 열기/닫기·`mode`별 UI 전환은 이 파일이 전담하고, 실제 저장/삭제(`api.addWord` 등)는 `mypage.js`의 `onSave`/`onDelete` 콜백이 담당한다 — 과거에는 두 파일이 같은 버튼에 각각 리스너를 붙여 저장 책임이 분산되어 있었으나 정리됨 |
| `assets/css/pages/my.css` | `pages/my/*` | `pages/handbook/resume.html` | `resume.html`이 `job.css`가 아니라 `my.css`를 불러온다 — 취업핸드북 그룹 안에 있지만 마이핸드북 CSS에 의존 |
| localStorage 키 `job_features` | `job-features.js` | `job.js`, `home.js` | 세 파일이 같은 키를 직접 읽고 쓴다. `job.js`는 로그인 시 Supabase `job_progress.job_features`로 이 키를 덮어쓰기도 한다 |
| Supabase `job_progress` 테이블 | — | `job.js`(`job_data` 컬럼), `job-features.js`(`job_features` 컬럼, `job.js` 경유 동기화) | 두 로컬스토리지 키를 한 행에 합쳐 저장 |

---

## 7. 아직 실제 데이터에 연동되지 않은 화면

`pages/my/docs.html`(내 문서), `pages/my/favorites.html`(즐겨찾기)은 전용 JS도 없고 어떤 JSON/Supabase 테이블도 연결되어 있지 않다 — 화면의 문서 목록/즐겨찾기 목록은 정적 마크업이다. 자세한 내용과 향후 계획은 [DATA_GUIDE.md](DATA_GUIDE.md) 6장 참고.
