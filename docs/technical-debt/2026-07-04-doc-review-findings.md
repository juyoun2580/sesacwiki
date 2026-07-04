# 2026-07-04 — 문서 리팩토링 중 발견된 기술 부채

`docs/ARCHITECTURE.md`, `docs/DATA_GUIDE.md`, `docs/COMPONENT_GUIDE.md`, `docs/DEVELOPMENT_GUIDE.md`를 실제 코드 기준으로 다시 작성하는 과정에서 발견한 문제를 [TEMPLATE.md](TEMPLATE.md) 형식으로 정리한다. 한 세션에서 한꺼번에 발견되어 편의상 파일 하나에 모아두었다 — 개별적으로 상태 변경이 필요해지면 각 항목을 `TD-NNNN-kebab-case-title.md`로 분리해도 된다.

---

## TD-0001: `job_features` localStorage 키를 3개 파일이 각자 직접 접근

- **상태**: Open
- **우선순위**: Medium
- **등록일**: 2026-07-04
- **등록자**: -
- **관련 파일**: `assets/js/pages/job-features.js`, `assets/js/pages/job.js`, `assets/js/pages/home.js`

### 현황 (무엇이 문제인가)

`localStorage`의 `job_features` 키를 소유 파일인 `job-features.js`(`FEATURES_KEY` 상수) 외에 `job.js`(로그인 동기화 시 `'job_features'` 문자열 리터럴)와 `home.js`(홈 대시보드 "취업 준비율" 카드)가 각각 직접 `localStorage.getItem('job_features')`로 읽는다. 접근을 감싸는 공용 함수가 없다.

### 영향도 (Impact)

| 영역 | 영향 |
|---|---|
| 유지보수성 | `job_features`의 데이터 구조(`DEFAULT_FEATURES` 형태)가 바뀌면 3개 파일을 모두 찾아 고쳐야 한다 |
| 확장성 | 새 기능 패널을 추가해 `job_features` 스키마에 필드를 넣을 때, `home.js`가 어떤 필드를 참조하는지 놓치기 쉽다 |
| 버그 발생 가능성 | 한 곳에서 키 이름이나 JSON 구조를 바꾸고 다른 곳을 갱신하지 않으면 `JSON.parse` 결과가 기대와 달라져 조용히 실패할 수 있다 |

### 원인 (왜 이렇게 됐는가)

`job.js`/`job-features.js`가 각자 다른 시점에 작성되면서 `FEATURES_KEY` 상수를 각 파일에 따로 선언했고, `home.js`는 대시보드 카드 하나만 필요해 별도 접근자 없이 직접 읽는 방식으로 추가됐다.

### 해결 방향

- [ ] `job-features.js`에 `getJobFeatures()`/`saveJobFeatures(data)` 접근자를 만들고 `job.js`/`home.js`가 이를 통해서만 읽도록 변경
- [ ] (대안) `api.js`의 `getJobProgress()`가 이미 Supabase에서 `jobFeatures`를 반환하므로, 로그인 상태에서는 localStorage 직접 접근 대신 이 함수 결과를 우선 사용하도록 통일

### 해결하지 않을 경우

_(현재 Open — 해당 없음)_

---

## TD-0002: `wiki.json`과 `wiki-data.json` 파일명 혼동

- **상태**: Open
- **우선순위**: Low
- **등록일**: 2026-07-04
- **등록자**: -
- **관련 파일**: `assets/data/wiki.json`, `assets/data/wiki-data.json`, `assets/js/pages/home.js`, `assets/js/pages/wiki.js`

### 현황 (무엇이 문제인가)

`wiki.json`은 홈 대시보드가 "학습 진도율 평균"을 계산할 때만 쓰는 목록 요약본(`list[].percent`)이고, `wiki-data.json`은 위키 목록·상세 화면이 실제로 렌더링하는 콘텐츠 전체(카테고리/TOC/본문/관련 문서)다. 이름이 유사해 둘의 역할 차이가 파일명만으로는 구분되지 않는다.

### 영향도 (Impact)

| 영역 | 영향 |
|---|---|
| 유지보수성 | 새로 합류한 담당자가 위키 데이터를 수정할 때 어느 파일을 고쳐야 하는지 매번 문서를 확인해야 한다 |
| 확장성 | 새 필드를 추가할 때 두 파일 중 어디에 넣어야 할지 판단 기준이 파일명만으로는 불명확 |
| 버그 발생 가능성 | 두 파일에 같은 위키 항목의 값을 다르게 넣어두면(예: `percent`) 홈과 위키 화면에 다른 진도율이 표시될 수 있다 |

### 원인 (왜 이렇게 됐는가)

정적 JSON 도입 초기에 `wiki.json` 하나로 시작했다가, 위키 상세 콘텐츠(본문/TOC 등)가 무거워지면서 `wiki-data.json`으로 분리했고, 기존 `wiki.json`은 홈 계산용 요약 용도로 남긴 것으로 보인다. 파일명은 분리 당시 갱신되지 않았다.

### 해결 방향

- [ ] `wiki.json`을 `wiki-summary.json` 등 역할이 드러나는 이름으로 리네이밍 (참조하는 `home.js` 경로도 함께 변경)
- [ ] (대안) `wiki.json`을 없애고 `wiki-data.json`의 `list[].percent`만 읽도록 `home.js`를 수정해 파일 자체를 통합

### 해결하지 않을 경우

_(현재 Open — 해당 없음)_

---

## TD-0003: `.rank-badge` 컴포넌트 미사용

- **상태**: Open
- **우선순위**: Low
- **등록일**: 2026-07-04
- **등록자**: -
- **관련 파일**: `assets/css/components.css`

### 현황 (무엇이 문제인가)

`components.css`에 `.rank-badge`/`.rank-badge--muted` 스타일이 정의되어 있지만, 현재 어떤 페이지의 정적 HTML에도, 어떤 JS의 동적 렌더링 코드에도 이 클래스를 사용하는 곳이 없다(전수 grep 확인).

### 영향도 (Impact)

| 영역 | 영향 |
|---|---|
| 유지보수성 | `components.css` 변경 시 실제로는 안 쓰이는 스타일까지 검토 대상에 포함돼 리뷰 비용이 늘어난다 |
| 확장성 | [COMPONENT_GUIDE.md](../COMPONENT_GUIDE.md) 카탈로그에 "사용 중"으로 오인되어 남아있으면 신규 기능에서 잘못 참조될 수 있다 |
| 버그 발생 가능성 | 낮음 — 미사용 CSS라 직접적인 버그로 이어지지는 않음 |

### 원인 (왜 이렇게 됐는가)

과거 위키 목록 side-panel의 "많이 보는 위키" 순위 UI에 쓰였던 것으로 추정되나, 현재 `pages/wiki/index.html` 구조에는 해당 UI가 없다. 화면 개편 과정에서 마크업만 제거되고 CSS는 함께 정리되지 않았다.

### 해결 방향

- [ ] `pages/wiki/index.html`에 "많이 보는 위키" 유형의 순위 UI를 다시 넣을 계획이 있는지 확인
- [ ] 계획이 없다면 `components.css`에서 `.rank-badge` 관련 규칙 삭제, [COMPONENT_GUIDE.md](../COMPONENT_GUIDE.md) 카탈로그에서도 제거

### 해결하지 않을 경우

_(현재 Open — 해당 없음)_

---

## TD-0004: 위키 상세 즐겨찾기 별의 이중 이벤트 바인딩

- **상태**: Open
- **우선순위**: Medium
- **등록일**: 2026-07-04
- **등록자**: -
- **관련 파일**: `assets/js/ui.js`, `assets/js/pages/wiki.js` (`bindWikiDetailFavoriteStars`)

### 현황 (무엇이 문제인가)

위키 상세 페이지의 큰 즐겨찾기 별(`#wikiDetailFavorite`, `#wikiDetailFavoriteMini`)은 정적 마크업이라 `ui.js`가 defer 시점에 `document.querySelectorAll('.favorite-star')`로 전역 cosmetic 토글(`ts()`, `classList.toggle` + toast)을 이미 바인딩한다. 이후 `wiki.js`의 `bindWikiDetailFavoriteStars()`가 같은 두 요소에 실제 저장용 리스너를 추가로 바인딩한다. 클릭 한 번에 리스너 두 개가 실행된다 — 코드 주석에도 "ui.js의 cosmetic ts() 바인딩과 별개로 실제 저장을 담당한다"고 명시되어 있다.

`wiki.js`쪽 핸들러는 `api.toggleWikiBookmark(item.id)` 호출 결과로 클래스를 **명시적으로 재설정**(`classList.toggle(cls, bool)` 2-인자 형태)하므로 정상 흐름에서는 최종 상태가 서버 값과 맞춰진다. 다만 `wiki.js`쪽 핸들러에는 `try/catch`가 없어, `api.toggleWikiBookmark`가 네트워크 오류 등으로 실패하면 이 핸들러는 아무것도 하지 않고 조용히 실패하는 반면, 이미 실행된 `ui.js`의 `ts()`는 클래스와 토스트를 그대로 표시해버린다.

### 영향도 (Impact)

| 영역 | 영향 |
|---|---|
| 유지보수성 | 즐겨찾기 관련 동작을 고치려면 `ui.js`와 `wiki.js` 두 파일을 함께 봐야 한다 |
| 확장성 | 다른 페이지에 정적 마크업으로 즐겨찾기 별을 추가하면 같은 이중 바인딩 패턴이 반복될 소지가 있다 |
| 버그 발생 가능성 | `api.toggleWikiBookmark` 호출이 실패하는 경우(네트워크 오류 등), 화면에는 즐겨찾기가 저장된 것처럼 별이 켜지고 토스트까지 뜨지만 실제 Supabase `wiki_bookmarks`에는 반영되지 않는 상태가 발생할 수 있다(사용자에게 보이지 않는 unhandled promise rejection만 콘솔에 남음) |

### 원인 (왜 이렇게 됐는가)

`ui.js`의 `ts()`는 프로젝트 초기(정적 목업 단계)부터 있던 범용 즐겨찾기 cosmetic 토글이고, 위키 상세에 실제 Supabase 연동이 추가되면서 기존 정적 마크업/전역 바인딩은 그대로 둔 채 실제 저장 로직만 별도 함수로 얹은 것으로 보인다.

### 해결 방향

- [ ] `wiki.js`의 `bindWikiDetailFavoriteStars()`에 `try/catch` 추가 — 실패 시 `ui.js`가 이미 바꾼 클래스를 원래 상태로 되돌리고 에러 토스트 표시
- [ ] (대안, 더 근본적) 정적 마크업에 있는 즐겨찾기 별에는 `ui.js`의 전역 바인딩이 걸리지 않도록 별도 클래스/속성(예: `data-favorite-managed="page"`)으로 구분해, "실제 저장이 필요한 별"과 "단순 cosmetic 별"을 셀렉터 단계에서부터 분리

### 해결하지 않을 경우

_(현재 Open — 해당 없음)_

---

## TD-0005: 단어 저장 모달의 저장 책임이 `modal.js`와 `mypage.js`에 분산됨

- **상태**: Open
- **우선순위**: Medium
- **등록일**: 2026-07-04
- **등록자**: -
- **관련 파일**: `assets/js/modal.js`, `assets/js/pages/mypage.js`, `pages/wiki/detail.html`, `pages/my/words.html`, `pages/my/mypage.html`

### 현황 (무엇이 문제인가)

`data-action="save-word"` 버튼 클릭 시 `modal.js`가 먼저 바인딩한 `saveWord()`(모달 닫기 + 고정 문구 toast만 표시, 실제 저장 없음)와, `mypage.js`가 같은 버튼에 추가로 바인딩한 리스너(`api.addWord`/`api.updateWord` 호출로 실제 Supabase 저장 + 목록 재렌더링)가 함께 실행된다. 모달을 열고 닫는 로직은 공통(`modal.js`) 소유, 실제 저장은 페이지 담당(`mypage.js`) 소유로 나뉜 상태다.

### 영향도 (Impact)

| 영역 | 영향 |
|---|---|
| 유지보수성 | "저장"이라는 하나의 사용자 행동이 두 파일에 걸쳐 구현되어 있어, 저장 관련 버그를 추적할 때 두 파일을 모두 확인해야 한다 |
| 확장성 | 단어 저장 모달과 다른 형태(예: 문서 저장)의 모달을 새로 만들 때, "닫기는 공통, 저장은 페이지별 리스너 추가"라는 비명시적 패턴을 그대로 따라야 하는지 판단 기준이 문서화되어 있지 않다 |
| 버그 발생 가능성 | `mypage.js`가 로드되지 않는 페이지에서 이 모달을 재사용하면(현재는 `wiki/detail.html`, `my/words.html`, `my/mypage.html` 모두 `mypage.js`를 로드해 문제 없음) `modal.js`의 toast만 뜨고 실제 저장은 되지 않는 상태가 재현될 수 있다 |

### 원인 (왜 이렇게 됐는가)

모달 마크업/열고 닫는 인터랙션은 정적 목업 단계부터 있던 공용 컴포넌트(`modal.js`)이고, Supabase 연동이 추가되면서 "실제 저장"만 페이지 담당 파일에 별도 리스너로 얹는 방식으로 확장됐다 — `modal.js` 자체를 Supabase 인지하도록 고치지 않고 우회한 형태.

### 해결 방향

- [ ] `modal.js`의 `saveWord()`를 제거하고, 저장 로직을 항상 페이지 담당 JS(`mypage.js`)의 리스너 하나로 통일
- [ ] (대안) `modal.js`에 "저장 콜백을 등록받는" 인터페이스(예: `registerModalSaveHandler(fn)`)를 만들어 페이지별 저장 로직을 명시적으로 주입받는 구조로 변경

### 해결하지 않을 경우

_(현재 Open — 해당 없음)_

---

## TD-0006: `pages/handbook/resume.html`이 `job.css`가 아니라 `my.css`를 사용

- **상태**: Open
- **우선순위**: Low
- **등록일**: 2026-07-04
- **등록자**: -
- **관련 파일**: `pages/handbook/resume.html`, `assets/css/pages/my.css`, `assets/css/pages/job.css`

### 현황 (무엇이 문제인가)

`resume.html`은 폴더상 취업핸드북 그룹(`pages/handbook/`)에 속하지만, 실제로는 `job.css`를 로드하지 않고 `my.css` + `resume.css`를 로드한다. 폴더 구조와 CSS 소유권이 어긋난다.

### 영향도 (Impact)

| 영역 | 영향 |
|---|---|
| 유지보수성 | [DEVELOPMENT_GUIDE.md](../DEVELOPMENT_GUIDE.md) 기준 `feature/handbook` 담당자가 `resume.html` 스타일을 바꾸려면 자기 소유가 아닌 `my.css`(`feature/my` 소유)를 건드려야 한다 |
| 확장성 | 새로 합류하는 담당자가 폴더명만 보고 CSS 소유권을 잘못 추정하기 쉽다 |
| 버그 발생 가능성 | `feature/my`가 `my.css`를 변경하면 의도치 않게 `resume.html` 렌더링에 영향을 줄 수 있다(교차 영향 인지 없이) |

### 원인 (왜 이렇게 됐는가)

`resume.html`이 "마이핸드북"류 리스트 UI(`doc-row` 등 `my.css`의 컴포넌트)를 재사용하도록 만들어지면서, 새 전용 CSS를 만드는 대신 기존 `my.css`를 그대로 가져다 쓴 것으로 보인다.

### 해결 방향

- [ ] `resume.html`이 실제로 `my.css`의 어떤 클래스를 쓰는지 확인 후, 그 부분만 `job.css` 또는 `resume.css`로 옮겨 `my.css` 의존을 제거
- [ ] (대안) 지금처럼 공유가 의도된 것이라면, [DEVELOPMENT_GUIDE.md](../DEVELOPMENT_GUIDE.md)에 "resume.html은 my.css에 의존하므로 my.css 변경 시 handbook 담당자에게도 리뷰 요청" 규칙을 명시

### 해결하지 않을 경우

_(현재 Open — 해당 없음)_

---

## TD-0007: `exam.js`와 `quiz.js`의 fetch·캐싱 로직 중복

- **상태**: Open
- **우선순위**: Low
- **등록일**: 2026-07-04
- **등록자**: -
- **관련 파일**: `assets/js/pages/exam.js`, `assets/js/pages/quiz.js`

### 현황 (무엇이 문제인가)

두 파일이 `assets/data/exam.json`과 `assets/data/questions/{examId}.json`을 각각 fetch하고 `Map`으로 캐싱하는 거의 동일한 코드를 독립적으로 구현하고 있다.

### 영향도 (Impact)

| 영역 | 영향 |
|---|---|
| 유지보수성 | fetch 에러 처리나 캐싱 방식을 바꾸려면 두 파일을 동일하게 고쳐야 한다 |
| 확장성 | 시험 데이터를 fetch하는 페이지가 하나 더 생기면 같은 코드가 세 번째로 복사될 가능성이 높다 |
| 버그 발생 가능성 | 한쪽만 수정하고 다른 쪽을 놓치면 두 화면의 캐싱/에러 처리 동작이 서로 달라질 수 있다 |

### 원인 (왜 이렇게 됐는가)

`exam.js`(목록)와 `quiz.js`(응시)가 같은 데이터를 쓰지만 서로 다른 시점에 독립적으로 작성되면서 공용 fetch 유틸을 만들지 않고 각자 구현한 것으로 보인다.

### 해결 방향

- [ ] `assets/data/exam.json`, `questions/{examId}.json`을 fetch하는 공용 함수를 별도 모듈(예: `assets/js/pages/exam-data.js`)로 분리하고 `exam.js`/`quiz.js`가 함께 사용

### 해결하지 않을 경우

_(현재 Open — 해당 없음)_

---

## TD-0008: "내 문서"/"즐겨찾기" 화면이 어떤 데이터 소스에도 연결되지 않음

- **상태**: Open
- **우선순위**: Medium
- **등록일**: 2026-07-04
- **등록자**: -
- **관련 파일**: `pages/my/index.html`, `pages/my/favorites.html`

### 현황 (무엇이 문제인가)

두 화면 모두 전용 JS가 없고, JSON 파일도 Supabase 테이블도 연결되어 있지 않다. 문서 목록/즐겨찾기 목록이 정적 마크업 그대로 하드코딩되어 있다.

### 영향도 (Impact)

| 영역 | 영향 |
|---|---|
| 유지보수성 | 해당 없음(아직 로직이 없음) |
| 확장성 | 다른 화면(단어장, 위키 북마크 등)은 이미 Supabase 패턴이 자리잡았는데, 이 두 화면만 스키마가 없어 새로 설계해야 한다 — 나중에 급하게 붙이면 기존 네이밍 규칙과 어긋날 위험 |
| 버그 발생 가능성 | 낮음(기능이 없으므로) — 다만 사용자 입장에서는 "문서를 저장해도 반영되지 않는" 것처럼 보일 수 있어 UX상 혼동 소지 |

### 원인 (왜 이렇게 됐는가)

Supabase 연동이 프로필/단어장/위키 북마크/시험 응시 기록/취업핸드북 순으로 진행되면서, "내 문서" 도메인은 아직 스키마 설계가 이뤄지지 않은 것으로 보인다.

### 해결 방향

- [ ] `documents` 테이블(가칭) 스키마 설계 — 제목/카테고리/날짜/즐겨찾기 여부 등 (`[DATA_GUIDE.md](../DATA_GUIDE.md)` 7장 "향후 예정" 참고)
- [ ] `favorites.html`은 새 테이블 만들지 않고 `documents`/`wiki_bookmarks`/`words.favorite`를 합쳐 보여주는 뷰로 설계(기존 "중복 저장 금지" 원칙 유지)

### 해결하지 않을 경우

_(현재 Open — 해당 없음)_

---

## TD-0009: `exam.json`에 존재하는 `exam-000`/`exam-015`의 문제 파일 누락

- **상태**: Open
- **우선순위**: High
- **등록일**: 2026-07-04
- **등록자**: -
- **관련 파일**: `assets/data/exam.json`, `assets/data/questions/`

### 현황 (무엇이 문제인가)

`assets/data/exam.json`의 `list` 배열에는 `exam-000`, `exam-015`가 포함되어 있지만, `assets/data/questions/` 폴더에는 `exam-000.json`, `exam-015.json`이 존재하지 않는다(001~014, 016~024만 있음). `exam.js`/`quiz.js`는 `fetch('/assets/data/questions/{examId}.json')`로 문제를 불러오므로, 이 두 시험을 클릭하면 404가 발생해 문제 화면이 정상 동작하지 않는다.

이 항목은 사실 "기대와 다르게 동작"하는 사용자 체감 버그에 더 가깝다 — 별도 `bugs/` 폴더가 아직 없어 우선 여기 등록해두고, 해당 폴더가 생기면 옮기는 것을 권장한다.

### 영향도 (Impact)

| 영역 | 영향 |
|---|---|
| 유지보수성 | 시험 목록에 항목을 추가할 때마다 대응하는 문제 파일이 실제로 존재하는지 검증하는 절차가 없다 |
| 확장성 | 향후 시험이 더 늘어나면 같은 종류의 누락이 반복될 수 있다 |
| 버그 발생 가능성 | 확정적 — 사용자가 `exam-000` 또는 `exam-015`를 선택하면 즉시 재현된다 |

### 원인 (왜 이렇게 됐는가)

문제 시딩 작업 중 두 파일 생성이 누락되었거나, 삭제 후 `exam.json`의 목록 갱신을 빠뜨린 것으로 추정된다(원인은 커밋 이력 확인 필요).

### 해결 방향

- [ ] `assets/data/questions/exam-000.json`, `exam-015.json` 생성(다른 시험 파일과 동일한 문제 스키마로) 또는 `exam.json`의 `list`에서 두 항목 제거
- [ ] (재발 방지) `exam.json`의 `list`와 `questions/` 폴더 파일 목록이 일치하는지 확인하는 간단한 스크립트/체크 추가 검토

### 해결하지 않을 경우

_(현재 Open — 해당 없음)_

---

## 문서 관련 메모 (기술 부채는 아니지만 함께 발견됨)

- `docs/9-COMPONENTS.md`, `docs/99-EXAM_PLAN.md`가 이번 문서 리팩토링 지시 범위에 포함되지 않아 archive로 옮기지 않았다. 새 `docs/COMPONENT_GUIDE.md`와 내용이 상당 부분 겹친 채로 `docs/` 루트에 함께 남아있다 — 정리 필요 여부를 팀과 확인할 것.
- 지시에는 "`CHANGELOG.md`는 유지한다"고 되어 있었지만, 실제로 프로젝트 어디에도 `CHANGELOG.md`가 존재하지 않는다.
