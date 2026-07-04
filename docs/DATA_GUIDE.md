# DATA_GUIDE.md

데이터의 "모양"(`JSON_GUIDE.md`)과 "가져오는 방법"(`API_GUIDE.md`)을 하나로 통합했다. 원본은 [docs/archive/](archive/)에 보관되어 있다. 현재 프로젝트는 **정적 JSON**과 **Supabase(DB)** 두 가지 데이터 소스를 함께 쓰며, 여기에 로그인 전 상태를 위한 **localStorage**가 더해진다.

> 페이지별로 어떤 소스를 쓰는지는 [ARCHITECTURE.md](ARCHITECTURE.md) 5장 표 참고.

---

## 1. 데이터 소스 3분류

| 소스 | 담는 데이터 | 접근 방식 |
|---|---|---|
| **정적 JSON** (`assets/data/*.json`) | 콘텐츠성 데이터(위키 본문, 시험 문제) — 사용자마다 다르지 않은 데이터 | 각 페이지 JS가 `fetch()`로 직접 읽음 |
| **Supabase** (Postgres, `supabase/schema.sql`) | 사용자별 상태(프로필, 저장한 단어, 북마크, 하이라이트, 시험 응시 기록, 취업핸드북 진행) | `assets/js/api.js`의 `window.api.*` 함수 경유 (직접 `supabaseClient` 호출 금지) |
| **localStorage** | 취업핸드북(`job_data`, `job_features`) — 로그인 여부와 무관하게 즉시 저장되는 로컬 캐시 | 페이지 JS가 직접 `localStorage.getItem/setItem`, 로그인 시 Supabase와 동기화 |

---

## 2. 정적 JSON 구조

| 파일 | 내용 | 실제 사용처 |
|---|---|---|
| `assets/data/home.json` | 홈 통계 fallback (`progressPercent`, `examCount`, `examAvgScore`, `jobReadinessPercent`) — **현재 전부 0으로, 실질적으로는 최초 진입 시 기본값**이다. 실제 값은 `wiki.json`/`localStorage`/Supabase에서 계산해 덮어쓴다 | `home.js` |
| `assets/data/wiki.json` | 위키 목록 요약(`list[].percent` 등) — 홈 대시보드의 "학습 진도율 평균" 계산에만 쓰인다 | `home.js` |
| `assets/data/wiki-data.json` | 위키 목록 + 상세 본문 전체(카테고리, TOC, 본문 섹션, 관련 문서 등) — 위키 화면의 실제 콘텐츠 원본 | `wiki.js` (목록/상세 모두), `home.js`(최근 본 글 등 참고) |
| `assets/data/exam.json` | 시험 목차(`categories`, `list`, `combinedQuestions`, `attemptHistory`, `wrongNoteSamples`) — **문제 본문은 포함하지 않음**(가볍게 유지) | `exam.js`, `quiz.js` |
| `assets/data/questions/{examId}.json` | 시험별 실제 문제 배열. 문항마다 `explanation` 객체(`coreConcept`/`whyCorrect`/`whyIncorrect`/`examPoint`/`practicalExample`형 5단 해설 — 과거 [archive/EXAM_PLAN 기획](archive/) 참고, 이미 상당 부분 구현됨) | `exam.js`, `quiz.js` |

`wiki.json`과 `wiki-data.json`이 이름이 비슷해 혼동하기 쉽다 — 전자는 "숫자 요약"(진도율), 후자는 "전체 콘텐츠"다. 새 필드를 추가할 때 어느 파일에 넣어야 할지 애매하면: 홈 대시보드 계산용 요약이면 `wiki.json`, 위키 화면 자체에 표시할 콘텐츠면 `wiki-data.json`.

### JSON 네이밍 규칙

1. **camelCase** — `favoriteCount`, `isFavorite`. snake_case/kebab-case 금지.
2. **id는 문자열** — `"id": "wiki-001"`.
3. **title / description** 필드명 통일. 의미가 명확히 다른 도메인 전용 필드(`definition`, `body`, `explanation`)는 예외.
4. **Boolean은 `is`로 시작** — 단, `questions/*.json`처럼 이미 굳어진 필드(`answerIndex` 등)는 기존 형식을 유지.
5. **날짜는 ISO 8601**.
6. **HTML 태그 금지** — 줄바꿈은 `\n`, 렌더링 시 JS에서 처리.
7. **데이터 중복 금지** — 같은 정보를 JSON과 Supabase 양쪽에 동시에 두지 않는다(예: 즐겨찾기 여부는 이제 `wiki_bookmarks` 테이블이 유일한 소스이며 `wiki-data.json`에는 넣지 않는다).

---

## 3. fetch 규칙 (정적 JSON)

정적 JSON은 각 페이지 담당 JS가 직접 `fetch()`한다. 캐싱은 페이지별로 Promise를 변수에 저장해 중복 요청을 막는 방식을 쓴다.

```js
// assets/js/pages/wiki.js
let wikiDataPromise;
function loadWikiData() {
  if (!wikiDataPromise) {
    wikiDataPromise = fetch('/assets/data/wiki-data.json').then(res => res.json());
  }
  return wikiDataPromise;
}
```

같은 패턴이 `home.js`, `exam.js`, `quiz.js`에도 각각 존재한다(`fetch` 자체를 공용 레이어로 감싸지는 않음 — 6장 "발견된 문제" 아님, 현재 관행으로 인지).

`questions/{examId}.json`처럼 파라미터가 있는 경로는 시험 ID별로 Map에 캐싱한다:

```js
const questionFileCache = new Map();
function loadQuestions(examId) {
  if (!questionFileCache.has(examId)) {
    questionFileCache.set(examId, fetch(`/assets/data/questions/${examId}.json`).then(res => res.json()));
  }
  return questionFileCache.get(examId);
}
```

---

## 4. Supabase 접근 패턴 (`api.js`)

### 함수 네이밍

| 패턴 | 용도 | 예시 |
|---|---|---|
| `get{도메인}()` / `get{도메인}List()` | 조회 | `getProfile()`, `getWords()`, `getExamAttempts()` |
| `save{도메인}()` / `add{도메인}()` | 생성/전체 upsert | `saveProfile()`, `addWord()`, `saveExamAttempt()` |
| `update{도메인}()` | 부분 수정 | `updateWord(id, patch)` |
| `delete{도메인}()` | 삭제 | `deleteWord(id)` |
| `toggle{도메인}()` | on/off 상태 전환 | `toggleWikiBookmark(id)`, `toggleQuizCheckpoint(id)` |

모든 함수는 `window.api` 객체 하나로 export되고, 내부에서 `getCurrentUserId()`로 현재 세션의 `user_id`를 구해 Supabase 쿼리의 `.eq("user_id", userId)` 조건에 사용한다 — **로그인하지 않은 상태로 호출하면 에러를 던진다**(`"로그인이 필요해요."`).

```js
window.api = {
  getProfile, saveProfile, updateEmail,
  getBadges, unlockBadge,
  getQuizCheckpoints, toggleQuizCheckpoint,
  getWords, addWord, updateWord, deleteWord,
  getWikiBookmarks, toggleWikiBookmark,
  getRecentWikiViews, addRecentWikiView,
  getWikiHighlights, saveWikiHighlights,
  getExamAttempts, saveExamAttempt,
  getJobProgress, saveJobProgress,
};
```

### 페이지 JS에서 사용하는 방법

```js
try {
  const words = await api.getWords();
  renderWordGroups(words);
} catch (e) {
  console.error(e);
  toast('데이터를 불러오지 못했어요. 다시 시도해주세요.');
}
```

- Supabase 테이블 컬럼은 snake_case(`github_username`, `category_color`)이고, `api.js`가 이를 camelCase(`githubUsername`, `categoryColor`)로 매핑해 반환한다(`mapWordRow()` 등). 페이지 JS는 항상 camelCase만 다룬다.
- 새 테이블이 필요하면 `supabase/schema.sql`에 DDL을 추가하고, `api.js`에 그 테이블 전용 `get/save/add/update/delete` 함수를 추가한다. 페이지 JS가 `supabaseClient.from(...)`을 직접 호출하지 않는다.

---

## 5. localStorage 규칙

| 키 | 소유 파일 | 용도 |
|---|---|---|
| `job_data` (`JOB_KEY`) | `job.js` | 취업핸드북 단계/태스크 진행 상태. `DATA_VERSION` 상수가 바뀌면 구형 데이터는 자동 초기화 |
| `job_features` (`FEATURES_KEY`) | `job-features.js` (읽기: `job.js`, `home.js`도 직접 참조) | 자격증/이력서/자소서 등 기능 패널 입력값 |

### 로그인 동기화 방향 (`job.js`)

localStorage가 1차 소스이며, 로그인 시점에만 Supabase `job_progress` 테이블과 다음 규칙으로 맞춘다:

1. 로그인 직후 `hydrateFromSupabase()` 실행 — 원격 데이터가 있으면 **원격이 로컬을 덮어쓴다**(기기 간 동기화).
2. 원격 데이터가 없으면(최초 로그인) **현재 로컬 데이터를 그대로 Supabase에 업로드**해 시딩한다.
3. 이후 저장 시점마다(`queueJobProgressSync`) 800ms 디바운스로 백그라운드 upsert만 실행 — 로그인 상태가 아니면 전송하지 않는다.

새로운 localStorage 키가 필요하면 이 문서와 `job_progress` 테이블 스키마를 함께 갱신한다. 임의로 새 키를 추가하고 문서화하지 않으면 로그인 동기화 대상에서 누락된다.

---

## 6. 데이터 흐름 (JSON/Supabase → JS → UI)

```
[정적 콘텐츠]                              [사용자 상태]
assets/data/*.json                        Supabase 테이블
      │ fetch()                                 │ api.js (window.api.*)
      ▼                                          ▼
assets/js/pages/*.js  ←──────────────→  assets/js/api.js
      │ render*() 함수가 직접 DOM 생성
      ▼
 화면 (템플릿 문자열 또는 DOM API로 렌더링)
```

- fetch 실패해도 페이지 전체가 깨지지 않아야 한다. 실패 시 빈 목록/안내 문구를 보여주고, `console.error`로 로그를 남기되 사용자에게는 기존 `toast()`로만 안내한다.
- 로그인이 필요한 페이지(`app.js`의 `AUTH_REQUIRED_PAGES` 목록)는 `requireAuth()`가 비로그인 사용자를 `/pages/auth/login.html`로 보낸다. 이 목록에 새 페이지를 추가하는 것도 데이터 연동 작업의 일부로 취급한다.

---

## 7. 향후 예정 (아직 구현되지 않음)

| 화면 | 현재 상태 | 향후 계획 |
|---|---|---|
| `pages/my/index.html` (내 문서) | 정적 마크업, 어떤 JSON/Supabase 테이블도 연결되어 있지 않음 | `documents` 테이블(가칭) 설계 필요 — 문서 제목/카테고리/날짜/즐겨찾기 여부 등 |
| `pages/my/favorites.html` (즐겨찾기) | 정적 마크업 | 위 `documents` 테이블 + 기존 `wiki_bookmarks`/`words.favorite`를 합쳐 보여주는 뷰로 설계 (과거 `myfav` 뷰 방식과 동일한 원칙 — 별도 테이블에 중복 저장하지 않음) |
| `home.json` 실제 통계 반영 | 파일 자체는 fallback(0)만 있고, 실제 값은 클라이언트에서 여러 소스를 조합해 계산 | 계산 로직을 서버 함수(Supabase Edge Function/RPC)로 옮길지 여부는 미정 |

이 표에 있는 화면은 지금 새 기능을 추가할 때 "어떤 스키마를 따라야 하는지" 참고할 기존 구현이 없다는 뜻이다 — 임의로 새 JSON 파일이나 테이블을 만들기 전에 팀과 스키마를 먼저 확정한다.
