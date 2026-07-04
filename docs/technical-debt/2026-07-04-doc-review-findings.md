# 2026-07-04 — 문서 리팩토링 중 발견된 기술 부채

`docs/ARCHITECTURE.md`, `docs/DATA_GUIDE.md`, `docs/COMPONENT_GUIDE.md`, `docs/DEVELOPMENT_GUIDE.md`를 실제 코드 기준으로 다시 작성하는 과정에서 발견한 문제를 [TEMPLATE.md](TEMPLATE.md) 형식으로 정리한다. 한 세션에서 한꺼번에 발견되어 편의상 파일 하나에 모아두었다 — 개별적으로 상태 변경이 필요해지면 각 항목을 `TD-NNNN-kebab-case-title.md`로 분리해도 된다.

**2026-07-04 재검증**: TD-0009가 실제로는 코드로 확인되지 않은 채(추정으로) 기록되어 있었던 것이 드러나, 문서 전체를 `develop`(정확히는 `feature/home`이 `origin/develop`과 동일함을 `git diff`로 먼저 확인한 뒤 그 기준) 코드와 하나씩 직접 대조해 재검증했다. 모든 항목에 `검증 근거` 절을 추가했다. 상태 값은 처음에 `Confirmed`/`False Positive`/`Resolved`/`Needs Investigation` 4종으로 도입했다가, 같은 날 다시 🔴 Open / 🟡 Planned / 🔵 In Progress / ✅ Resolved / ❌ False Positive / 📅 Post Release 6종 체계로 개편했다(상세: [Validation Summary](#validation-summary)). 규칙은 [README.md](README.md)/[TEMPLATE.md](TEMPLATE.md) 참고.

---

## TD-0001: `job_features` localStorage 키를 3개 파일이 각자 직접 접근

- **상태**: 🔴 Open
- **우선순위**: Medium
- **등록일**: 2026-07-04
- **검증일**: 2026-07-04
- **관련 파일**: `assets/js/pages/job-features.js`, `assets/js/pages/job.js`, `assets/js/pages/home.js`

### 현황 (무엇이 문제인가)

`localStorage`의 `job_features` 키를 소유 파일인 `job-features.js`(`FEATURES_KEY` 상수) 외에 `job.js`(로그인 동기화 시 `'job_features'` 문자열 리터럴)와 `home.js`(홈 대시보드 "취업 준비율" 카드, `JOB_FEATURES_KEY` 상수)가 각각 직접 `localStorage.getItem('job_features')`로 읽는다. 접근을 감싸는 공용 함수가 없다.

### 검증 근거 (2026-07-04 재검증)

세 파일을 직접 읽고 대조했다.

- `job-features.js:8` `const FEATURES_KEY = 'job_features'`, `loadFeatures()`/`saveFeatures()`(465~505줄)에서 기본값 병합·마이그레이션까지 담당.
- `job.js:101` `loadFeaturesData()`가 같은 키를 단순 `JSON.parse`로 별도 구현, `job.js:197,200` `hydrateFromSupabase()`에서도 `'job_features'` 문자열 리터럴로 직접 get/set.
- `home.js:161` `JOB_FEATURES_KEY` 상수를 별도 선언, `loadJobFeatures()`(163~171줄)로 또 별도 구현.
- `job.js`의 `isStepDone()`과 `home.js`의 `isJobStepDone()`(switch문 case 2~6)을 라인 단위로 비교 — 완전히 동일한 로직임을 확인.

### 영향도 (Impact)

| 영역 | 영향 |
|---|---|
| 유지보수성 | `job_features`의 데이터 구조(`DEFAULT_FEATURES` 형태)가 바뀌면 3개 파일을 모두 찾아 고쳐야 한다 |
| 확장성 | 새 기능 패널을 추가해 `job_features` 스키마에 필드를 넣을 때, `home.js`가 어떤 필드를 참조하는지 놓치기 쉽다 |
| 버그 발생 가능성 | 한 곳에서 키 이름이나 JSON 구조를 바꾸고 다른 곳을 갱신하지 않으면 `JSON.parse` 결과가 기대와 달라져 조용히 실패할 수 있다 |

### 원인 (왜 이렇게 됐는가)

`job.js`/`job-features.js`가 각자 다른 시점에 작성되면서 `FEATURES_KEY` 상수를 각 파일에 따로 선언했고, `home.js`는 대시보드 카드 하나만 필요해 별도 접근자 없이 직접 읽는 방식으로 추가됐다.

### 완화 조치 (2026-07-04)

`job.js`의 `isStepDone()`과 `home.js`의 `isJobStepDone()` 위에 "반드시 동일해야 하며 수정 시 두 파일을 함께 수정하라"는 상호 참조 주석을 추가했다. 근본 해결(공용 접근자로 통합)은 아니며, 발표/시연을 앞두고 리팩토링 대신 우선 적용한 임시 안전장치다.

### 해결 방향

- [ ] `job-features.js`에 `getJobFeatures()`/`saveJobFeatures(data)` 접근자를 만들고 `job.js`/`home.js`가 이를 통해서만 읽도록 변경
- [ ] (대안) `api.js`의 `getJobProgress()`가 이미 Supabase에서 `jobFeatures`를 반환하므로, 로그인 상태에서는 localStorage 직접 접근 대신 이 함수 결과를 우선 사용하도록 통일

### 해결하지 않을 경우

_(현재 Open — 완화 조치로 임시 방어 중)_

---

## TD-0002: `wiki.json`과 `wiki-data.json` 파일명 혼동

- **상태**: 📅 Post Release
- **우선순위**: Low
- **등록일**: 2026-07-04
- **검증일**: 2026-07-04
- **관련 파일**: `assets/data/wiki.json`, `assets/data/wiki-data.json`, `assets/js/pages/home.js`, `assets/js/pages/wiki.js`

### 현황 (무엇이 문제인가)

`wiki.json`은 홈 대시보드가 "학습 진도율 평균"을 계산할 때만 쓰는 목록 요약본(`list[].percent`)이고, `wiki-data.json`은 위키 목록·상세 화면이 실제로 렌더링하는 콘텐츠 전체(카테고리/TOC/본문/관련 문서)다. 이름이 유사해 둘의 역할 차이가 파일명만으로는 구분되지 않는다.

### 검증 근거 (2026-07-04 재검증)

두 JSON을 직접 파싱해 대조했다. **원래 기록보다 문제가 더 크다는 것이 확인됐다**: 단순히 이름이 헷갈리는 수준이 아니라, `wiki.json`의 `list`는 `wiki-001`~`wiki-005`라는 구식 ID 5개뿐이고, `wiki-data.json`은 `sql-select`, `sql-join` 등 slug형 ID 17개로 구성되어 **두 파일 사이에 겹치는 ID가 단 하나도 없다.** `home.js:245-252`(`WIKI_DATA_URL = "/assets/data/wiki.json"`, `getWikiAverageProgress()`)가 이 5개짜리 구식 데이터의 `percent` 평균을 홈 화면 "학습 진도율" 카드에 그대로 표시하고, `wiki.js:336`은 완전히 다른 `wiki-data.json`(17개)만 사용한다는 것도 코드로 확인했다.

### 영향도 (Impact)

| 영역 | 영향 |
|---|---|
| 유지보수성 | 새로 합류한 담당자가 위키 데이터를 수정할 때 어느 파일을 고쳐야 하는지 매번 문서를 확인해야 한다 |
| 확장성 | 새 필드를 추가할 때 두 파일 중 어디에 넣어야 할지 판단 기준이 파일명만으로는 불명확 |
| 버그 발생 가능성 | 홈 대시보드 "학습 진도율" 카드가 실제 위키 17개 문서와는 무관한, ID조차 겹치지 않는 5개짜리 구식 데이터의 평균을 보여주고 있다 — 사용자가 실제로 위키를 열람해도 이 수치는 전혀 갱신되지 않는다 |

### 원인 (왜 이렇게 됐는가)

정적 JSON 도입 초기에 `wiki.json` 하나(`wiki-001`~`005`)로 시작했다가, 위키 상세 콘텐츠가 무거워지면서 새 ID 체계(`sql-select` 등)로 `wiki-data.json`을 다시 만들었고, 기존 `wiki.json`은 정리되지 않은 채 홈 화면 계산용으로만 남은 것으로 보인다(커밋 이력 확인 전까지는 추정).

### 해결 방향

- [ ] `home.js`의 "학습 진도율" 계산을 `wiki.json` 대신 `wiki-data.json`의 `progress` 필드 평균으로 변경(파일 자체는 정리 대상으로 남겨둠)
- [ ] `wiki.json`을 완전히 제거하거나, 역할이 드러나는 이름(`wiki-summary.json` 등)으로 리네이밍

### Post Release로 분류한 이유 (2026-07-04)

수정하려면 홈 대시보드가 실시간으로 쓰는 `home.js`의 진도율 계산 로직을 바꿔야 한다. 지금은 화면에 에러 없이 숫자만 표시되는 상태라 사용자 체감 가치는 낮은데, 발표/시연 직전에 홈 화면 핵심 로직을 건드리는 리스크가 그 가치보다 크다고 판단해 발표 이후로 미룬다.

### 해결하지 않을 경우

_(Post Release로 보류 — 발표 이후 재검토)_

---

## TD-0003: `.rank-badge` 컴포넌트 미사용

- **상태**: 🟡 Planned
- **우선순위**: Low
- **등록일**: 2026-07-04
- **검증일**: 2026-07-04
- **관련 파일**: `assets/css/components.css`

### 현황 (무엇이 문제인가)

`components.css`에 `.rank-badge`/`.rank-badge--muted` 스타일이 정의되어 있지만, 현재 어떤 페이지의 정적 HTML에도, 어떤 JS의 동적 렌더링 코드에도 이 클래스를 사용하는 곳이 없다.

### 검증 근거 (2026-07-04 재검증)

`grep -rn "rank-badge"`를 프로젝트 전체(`.html`/`.js`/`.css`)에 실행해 확인했다. 유일한 사용처는 `legacy/index.html`(413~421줄, 옛 정적 목업)뿐이고, 실제 서비스 화면(`pages/`, `index.html`)이나 어떤 `pages/*.js`의 동적 렌더링에서도 참조되지 않는다.

### 영향도 (Impact)

| 영역 | 영향 |
|---|---|
| 유지보수성 | `components.css` 변경 시 실제로는 안 쓰이는 스타일까지 검토 대상에 포함돼 리뷰 비용이 늘어난다 |
| 확장성 | [COMPONENT_GUIDE.md](../COMPONENT_GUIDE.md) 카탈로그에 "사용 중"으로 오인되어 남아있으면 신규 기능에서 잘못 참조될 수 있다 |
| 버그 발생 가능성 | 낮음 — 미사용 CSS라 직접적인 버그로 이어지지는 않음 |

### 원인 (왜 이렇게 됐는가)

과거 위키 목록 side-panel의 "많이 보는 위키" 순위 UI에 쓰였던 것으로 추정되나, 현재 `pages/wiki/index.html` 구조에는 해당 UI가 없다. 화면 개편 과정에서 마크업만 제거되고 CSS는 함께 정리되지 않았다.

### 결정 (2026-07-04)

`pages/wiki/index.html`에 "많이 보는 위키" 순위 UI를 다시 넣을 계획이 없음을 확인했다. [COMPONENT_GUIDE.md](../COMPONENT_GUIDE.md)의 Deprecated/Unused 카탈로그 항목을 "Unused — 삭제 확정"으로 갱신해 이 결정을 문서에 반영했다(문서 변경만, 코드 변경 아님).

### 해결 방향

- [x] `pages/wiki/index.html`에 "많이 보는 위키" 유형의 순위 UI를 다시 넣을 계획이 있는지 확인 → 없음, 삭제 확정
- [x] [COMPONENT_GUIDE.md](../COMPONENT_GUIDE.md) 카탈로그 상태를 "삭제 확정"으로 갱신
- [ ] `components.css`에서 `.rank-badge`/`.rank-badge--muted` 규칙 실제 삭제 — **코드 변경이라 이번 문서 정리 범위에서는 제외, 다음 코드 작업 때 함께 처리**

### 해결하지 않을 경우

_(현재 Open — 카탈로그 정리는 완료, 실제 CSS 삭제만 남음)_

---

## TD-0004: 위키 상세 즐겨찾기 별의 이중 이벤트 바인딩

- **상태**: ✅ Resolved
- **우선순위**: N/A (해결됨)
- **등록일**: 2026-07-04
- **검증일**: 2026-07-04
- **관련 파일**: `assets/js/ui.js`, `assets/js/pages/wiki.js` (`bindWikiDetailFavoriteStars`)

### 현황 (무엇이 문제인가, 과거 기준)

위키 상세 페이지의 큰 즐겨찾기 별(`#wikiDetailFavorite`, `#wikiDetailFavoriteMini`)은 정적 마크업이라 `ui.js`가 defer 시점에 `.favorite-star` 전역 셀렉터로 cosmetic 토글(`ts()`)을 이미 바인딩한다. 과거에는 `wiki.js`의 `bindWikiDetailFavoriteStars()`가 같은 두 요소에 실제 저장용 리스너를 **추가로** 바인딩해, 클릭 한 번에 두 리스너가 함께 실행되는 문제가 있었다.

### 검증 근거 (2026-07-04 재검증)

`assets/js/pages/wiki.js:521-559`를 직접 읽었다. 코드에 다음 주석이 그대로 남아있다:

> "이 두 요소는 정적 마크업이라 ui.js가 defer 시점에 .favorite-star 전역 셀렉터로 cosmetic 리스너(ts())를 이미 걸어둔다. 그 리스너가 남아있으면 클릭 한 번에 cosmetic 토글과 실제 저장이 함께 실행되어(TD-0004) 네트워크 실패 시 화면 상태가 실제 저장 상태와 어긋날 수 있었다. 노드를 복제해 교체하면 이전에 바인딩된 리스너(ui.js의 ts() 포함)가 모두 제거되므로, 여기서 다는 리스너만 유일하게 남는다"

실제 구현(`bindWikiDetailFavoriteStars()` 527~559줄)도 `el.replaceWith(el.cloneNode(true))`로 대상 엘리먼트를 복제·교체해 `ui.js`가 걸어둔 기존 리스너를 전부 제거한 뒤, 저장 로직이 담긴 리스너 하나만 새로 붙인다. 즉 **이 TD 항목 자체가 이미 코드 주석으로 "TD-0004"를 참조하며 해결된 상태임을 스스로 기록하고 있다** — 과거에 실제로 존재했던 문제이고, 이후 clone+replace 방식으로 수정된 뒤 문서(TD-0009처럼) 갱신이 누락된 사례.

다만 재검증 중 새로 확인한 잔여 리스크 하나: `bindWikiDetailFavoriteStars()`가 호출되기 전(=위키 데이터 fetch가 끝나기 전) 사용자가 별을 클릭하면 `ui.js`의 `ts()`만 실행되어 cosmetic 토글은 되지만 실제 저장은 되지 않는 좁은 race window가 이론상 남아있다. 이는 원래 TD-0004가 설명하던 "매 클릭마다 이중 실행"과는 다른, 훨씬 좁은 범위의 별개 이슈이므로 새 항목으로 다루지 않고 여기 참고로만 남긴다.

### 영향도 (Impact, 과거 기준)

| 영역 | 영향 |
|---|---|
| 버그 발생 가능성 | (해결 전) `api.toggleWikiBookmark` 실패 시에도 `ui.js`의 `ts()`가 별과 토스트를 표시해버려 실제로는 저장되지 않았는데 성공한 것처럼 보일 수 있었다 |

### 적용된 해결 방법

`bindWikiDetailFavoriteStars()`에서 대상 엘리먼트를 `cloneNode(true)` 후 `replaceWith()`로 교체 — 이전에 바인딩된 모든 리스너(ui.js의 `ts()` 포함)를 제거하고 저장 로직 리스너 하나만 남긴다.

### 해결하지 않을 경우

_(해당 없음 — Resolved)_

---

## TD-0005: 단어 저장 모달의 저장 책임이 `modal.js`와 `mypage.js`에 분산됨

- **상태**: ✅ Resolved
- **우선순위**: N/A (해결됨)
- **등록일**: 2026-07-04
- **검증일**: 2026-07-04
- **관련 파일**: `assets/js/modal.js`, `assets/js/pages/mypage.js`, `pages/wiki/detail.html`, `pages/my/words.html`, `pages/my/mypage.html`

### 현황 (무엇이 문제인가, 과거 기준)

`data-action="save-word"` 버튼 클릭 시 `modal.js`가 바인딩한 `saveWord()`(모달 닫기 + 고정 문구 toast만 표시, 실제 저장 없음)와, `mypage.js`가 같은 버튼에 추가로 바인딩한 리스너(`api.addWord`/`api.updateWord` 호출로 실제 저장)가 함께 실행되어 저장 책임이 두 파일에 분산되어 있었다.

### 검증 근거 (2026-07-04 재검증)

`assets/js/modal.js` 1~14줄을 직접 읽었다. `saveWord()` 함수 자체가 **더 이상 존재하지 않고**, 대신 다음 주석만 남아있다:

> "modal.js는 UI(열기/닫기)만 담당한다. 실제 저장(Supabase api.addWord/updateWord)은 assets/js/pages/mypage.js의 data-action="save-word" 리스너가 전담한다(TD-0005). 과거에는 이 파일에도 saveWord()(닫기+고정 toast만, 실제 저장 없음)가 같은 버튼에 별도로 바인딩되어 있었는데, mypage.js가 closeModal()/toast() 호출까지 넘겨받으며 제거했다."

`mypage.js:490` 주석도 "data-action="save-word" 클릭의 유일한 핸들러로서 닫기/안내 toast/실제 저장을 모두 담당한다"고 명시하고, 495줄부터의 리스너가 실제로 `closeModal()` 호출과 `api.addWord`/`api.updateWord`를 함께 수행하는 것을 확인했다. `modal.js`에는 `save-word` 관련 리스너가 전혀 남아있지 않다(grep으로 재확인).

### 영향도 (Impact, 과거 기준)

| 영역 | 영향 |
|---|---|
| 버그 발생 가능성 | (해결 전) "저장"이라는 하나의 사용자 행동이 두 파일에 걸쳐 구현되어 저장 관련 버그 추적 시 두 파일을 모두 봐야 했다 |

### 적용된 해결 방법

`modal.js`의 `saveWord()`(가짜 저장, 닫기+toast만)를 제거하고, `mypage.js`의 `data-action="save-word"` 리스너 하나가 닫기·안내·실제 저장을 모두 전담하도록 통일. 코드 내 주석에 TD-0005를 직접 참조하며 이 사실을 기록해뒀다.

### 해결하지 않을 경우

_(해당 없음 — Resolved)_

---

## TD-0006: `pages/handbook/resume.html`이 `job.css`가 아니라 `my.css`를 사용

- **상태**: 📅 Post Release
- **우선순위**: Low
- **등록일**: 2026-07-04
- **검증일**: 2026-07-04
- **관련 파일**: `pages/handbook/resume.html`, `assets/css/pages/my.css`, `assets/css/pages/job.css`

### 현황 (무엇이 문제인가)

`resume.html`은 폴더상 취업핸드북 그룹(`pages/handbook/`)에 속하지만, 실제로는 `job.css`를 로드하지 않고 `my.css` + `resume.css`를 로드한다. 폴더 구조와 CSS 소유권이 어긋난다.

### 검증 근거 (2026-07-04 재검증)

`pages/handbook/resume.html`의 `<link>` 태그를 직접 확인했다. `reset.css`, `variables.css`, `base.css`, `layout.css`, `components.css`, **`pages/my.css`**, `pages/resume.css`만 로드하고, `pages/job.css`는 로드하지 않는다.

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

### Post Release로 분류한 이유 (2026-07-04)

해결하려면 `resume.html`이 실제로 쓰는 `my.css` 클래스를 전수 확인한 뒤 CSS를 이관해야 한다 — 시연에서 보이는 화면의 스타일 파일을 직접 건드리는 작업이라 시각적 회귀 위험이 있다. 지금 당장 깨지는 곳은 없고 담당 경계만 불명확한 수준이라, 사용자 가치 대비 변경 리스크가 커서 발표 이후로 미룬다.

### 해결하지 않을 경우

_(Post Release로 보류 — 발표 이후 재검토)_

---

## TD-0007: `exam.js`와 `quiz.js`의 fetch·캐싱·공통 유틸 함수 중복

- **상태**: 🔴 Open
- **우선순위**: Low
- **등록일**: 2026-07-04
- **검증일**: 2026-07-04
- **관련 파일**: `assets/js/pages/exam.js`, `assets/js/pages/quiz.js`

### 현황 (무엇이 문제인가)

두 파일이 다음을 각자 독립적으로 구현하고 있다(모두 코드가 사실상 동일):

- `assets/data/exam.json`, `assets/data/questions/{examId}.json`을 fetch하고 `Map`으로 캐싱하는 `fetchQuestionsFile()`/`questionFileCache`
- 로그인 상태 확인 후 `api.getExamAttempts()`를 호출하는 `getLocalExamAttempts()`
- `el.textContent`를 설정하는 `setText(id, text)`

### 검증 근거 (2026-07-04 재검증)

`exam.js`와 `quiz.js` 전체를 라인 단위로 읽고 대조했다. `escapeHtml()`(exam.js 8~15줄 / quiz.js 22~29줄), `getLocalExamAttempts()`(exam.js 17~25줄 / quiz.js 53~61줄), `fetchQuestionsFile()`+`questionFileCache`(exam.js 32~41줄 / quiz.js 66~75줄), `setText()`(exam.js 231~234줄 / quiz.js 461~464줄) 네 함수 모두 두 파일에서 문자 단위로 동일함을 확인했다(단, `escapeHtml`은 TD-0010으로 별도 분리 — job-features.js의 `esc()`와 비교가 필요해서다).

### 영향도 (Impact)

| 영역 | 영향 |
|---|---|
| 유지보수성 | fetch 에러 처리·캐싱 방식·로그인 체크 로직을 바꾸려면 두 파일을 동일하게 고쳐야 한다 |
| 확장성 | 시험 데이터를 fetch하는 페이지가 하나 더 생기면 같은 코드가 세 번째로 복사될 가능성이 높다 |
| 버그 발생 가능성 | 한쪽만 수정하고 다른 쪽을 놓치면 두 화면의 캐싱/에러 처리 동작이 서로 달라질 수 있다. 다만 두 파일이 같은 담당 영역(`feature/exam`) 소유라 교차 팀 조율 없이 고칠 수 있어 실제 위험도는 낮다 |

### 원인 (왜 이렇게 됐는가)

`exam.js`(목록)와 `quiz.js`(응시)가 같은 데이터를 쓰지만 서로 다른 시점에 독립적으로 작성되면서 공용 fetch/유틸 모듈을 만들지 않고 각자 구현한 것으로 보인다.

### 해결 방향

- [ ] `fetchQuestionsFile()`/`questionFileCache`, `getLocalExamAttempts()`, `setText()`를 별도 모듈(예: `assets/js/pages/exam-shared.js`)로 분리하고 `exam.js`/`quiz.js`가 함께 사용
- [ ] 같은 담당 영역(`feature/exam`) 내부 리팩토링이라 교차 팀 리뷰 없이 진행 가능 — 다만 발표/시연 일정 중에는 우선순위 낮게 유지

### 해결하지 않을 경우

_(현재 Open — 해당 없음)_

---

## TD-0008: "내 문서"/"즐겨찾기" 화면이 어떤 데이터 소스에도 연결되지 않음

- **상태**: 🔴 Open
- **우선순위**: Medium
- **등록일**: 2026-07-04
- **검증일**: 2026-07-04
- **관련 파일**: `pages/my/index.html`, `pages/my/favorites.html`

### 현황 (무엇이 문제인가)

두 화면 모두 전용 JS가 없고, JSON 파일도 Supabase 테이블도 연결되어 있지 않다. 문서 목록/즐겨찾기 목록이 정적 마크업 그대로 하드코딩되어 있다.

### 검증 근거 (2026-07-04 재검증)

`pages/my/index.html`, `pages/my/favorites.html`의 `<script>` 태그를 확인했다. 두 파일 모두 `toast.js`/`supabase-client.js`/`auth.js`/`api.js`/`components/header.js`/`components/nav.js`/`app.js`/`ui.js`만 로드하고, `pages/*.js` 전용 스크립트(예: `mypage.js`, `favorites.js` 등)가 전혀 없다. 즉 이 두 화면을 위한 페이지 전용 렌더링 로직 자체가 코드베이스에 존재하지 않는다.

### 영향도 (Impact)

| 영역 | 영향 |
|---|---|
| 유지보수성 | 해당 없음(아직 로직이 없음) |
| 확장성 | 다른 화면(단어장, 위키 북마크 등)은 이미 Supabase 패턴이 자리잡았는데, 이 두 화면만 스키마가 없어 새로 설계해야 한다 |
| 버그 발생 가능성 | 낮음(기능이 없으므로) — 다만 사용자 입장에서는 "문서를 저장해도 반영되지 않는" 것처럼 보일 수 있어 UX상 혼동 소지 |

### 원인 (왜 이렇게 됐는가)

Supabase 연동이 프로필/단어장/위키 북마크/시험 응시 기록/취업핸드북 순으로 진행되면서, "내 문서" 도메인은 아직 스키마 설계가 이뤄지지 않은 것으로 보인다.

### 해결 방향

- [ ] `documents` 테이블(가칭) 스키마 설계 — 제목/카테고리/날짜/즐겨찾기 여부 등
- [ ] `favorites.html`은 새 테이블 만들지 않고 `documents`/`wiki_bookmarks`/`words.favorite`를 합쳐 보여주는 뷰로 설계(기존 "중복 저장 금지" 원칙 유지)

### 해결하지 않을 경우

_(현재 Open — 해당 없음)_

---

## TD-0009: `exam.json`에 존재하는 `exam-000`/`exam-015`의 문제 파일 누락

- **상태**: ❌ False Positive
- **우선순위**: N/A (False Positive)
- **등록일**: 2026-07-04
- **검증일**: 2026-07-04
- **관련 파일**: `assets/data/exam.json`, `assets/data/questions/`, `assets/js/pages/exam.js`, `assets/js/pages/quiz.js`

### 원래 기록 (무엇을 문제로 판단했었는가)

`assets/data/exam.json`의 `list` 배열에는 `exam-000`, `exam-015`가 포함되어 있지만, `assets/data/questions/` 폴더에는 `exam-000.json`, `exam-015.json`이 존재하지 않아, `exam.js`/`quiz.js`가 `fetch('/assets/data/questions/{examId}.json')`로 문제를 불러올 때 404가 발생해 문제 화면이 정상 동작하지 않을 것이라고 기록했었다.

### 검증 근거 (2026-07-04 재검증) — False Positive로 판정한 근거

다음을 실제로 확인했다.

1. **파일 존재 확인**: `assets/data/questions/` 디렉터리를 `ls`로 확인 — `exam-000.json`, `exam-015.json`은 실제로 없다(001~014, 016~024만 존재). 여기까지는 원 기록과 동일.
2. **`exam.json`의 `combinedQuestions` 확인**: `assets/data/exam.json`을 직접 파싱 — `combinedQuestions` 키에 `exam-000`(7문항, `exam-001`~`exam-002` 등을 참조), `exam-015`(121문항, `exam-016`~`exam-024`를 참조)가 이미 정의되어 있다.
3. **실제 호출 흐름 확인**: `quiz.js:118-129` `resolveQuizQuestions(data, examId)`를 읽었다 — `data.combinedQuestions[examId]`가 존재하면 그 매핑이 가리키는 **실제 파일들**(`exam-001.json` 등, 전부 존재함)을 `fetchQuestionsFile()`로 가져오고, `exam-000.json` 자체는 fetch하지 않는다. `exam.js:163-168` `resolveRealExamId()`도 오답노트 흐름에서 동일한 방식으로 combined ID를 실제 파일 ID로 치환한 뒤 fetch한다.
4. **직접 fetch 호출부 전수 확인**: `grep -rn "questions/" assets/js/ pages/`로 `questions/{examId}.json`을 조립하는 코드가 `exam.js`/`quiz.js`의 `fetchQuestionsFile()` 두 곳뿐임을 확인 — 그리고 두 곳 모두 위 2번 리다이렉션을 거친 뒤에만 호출된다.
5. **코드 주석 확인**: `exam.js:160-162`에 "exam-000/exam-015처럼 combinedQuestions로 구성된 통합 시험은 questions/{examId}.json 파일이 따로 없다"고 이미 명시되어 있다.

즉 `exam-000.json`/`exam-015.json`이 없는 것은 버그가 아니라 **설계된 상태**다 — 이 두 ID는 여러 시험의 문제를 조합한 "통합 모의고사"이며, 전용 문제 파일이 필요 없도록 `combinedQuestions` 매핑으로 처리되게 만들어져 있다. 실제 사용자 흐름(응시 화면, 오답노트) 어디에서도 이 두 파일을 직접 요청하는 경로가 없어 404는 재현되지 않는다.

### 왜 잘못 판단되었는가 (원인 분석)

이전 기록 시점에 `assets/data/questions/` 폴더에 파일이 없다는 사실만 확인하고, `exam.json`의 `combinedQuestions` 매핑과 `resolveQuizQuestions()`/`resolveRealExamId()`의 리다이렉션 로직까지는 확인하지 않은 채 "파일이 없으면 fetch가 실패할 것"이라고 추정으로 기록한 것으로 보인다. 이후 이 대화에서도 원 문서 내용을 코드로 재검증하지 않고 그대로 전달해 같은 오류가 한 번 더 반복됐다 — 이번 재검증에서 `combinedQuestions`/`resolveQuizQuestions`/`resolveRealExamId`를 실제로 추적한 뒤에야 바로잡았다.

### 해결 방향

_(해당 없음 — 실제 문제가 아니므로 조치 불필요)_

### 해결하지 않을 경우

_(해당 없음 — False Positive)_

---

## TD-0010: HTML 이스케이프 함수가 3곳에 각각 다르게 구현됨

- **상태**: 🔴 Open
- **우선순위**: Medium
- **등록일**: 2026-07-04
- **검증일**: 2026-07-04
- **관련 파일**: `assets/js/pages/exam.js`(`escapeHtml`), `assets/js/pages/quiz.js`(`escapeHtml`), `assets/js/pages/job-features.js`(`esc`)

### 현황 (무엇이 문제인가)

동적으로 만든 HTML 문자열에 사용자 데이터를 넣기 전 이스케이프하는 함수가 세 파일에 각각 독립적으로 존재한다. `exam.js`/`quiz.js`의 `escapeHtml()`은 `& < > " '` 5개 문자를 이스케이프하지만, `job-features.js`의 `esc()`는 `& < > "` 4개만 이스케이프하고 작은따옴표(`'`)는 처리하지 않는다.

### 검증 근거 (2026-07-04 재검증)

세 함수의 실제 구현을 나란히 읽고 비교했다.

- `exam.js:8-15`, `quiz.js:22-29`: `.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')` — 5문자 모두 처리, 두 파일 완전히 동일.
- `job-features.js:509`: `.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')` — 작은따옴표 `replace`가 없음을 직접 확인.

### 영향도 (Impact)

| 영역 | 영향 |
|---|---|
| 유지보수성 | 이스케이프 규칙을 바꾸려면(예: 새 특수문자 추가) 세 곳을 모두 찾아 고쳐야 하고, 지금도 이미 서로 다르다는 사실을 모르고 지나치기 쉽다 |
| 확장성 | 새 화면에서 `innerHTML`로 사용자 입력을 렌더링할 때 어느 구현을 참고해야 하는지 기준이 없다 |
| 버그 발생 가능성 | `job-features.js`가 다루는 자기소개서/프로젝트 설명 등 사용자 입력값에 작은따옴표가 포함되고, 그 값이 홑따옴표로 감싼 HTML 속성에 삽입되는 경우가 생기면 속성 값이 깨지거나 예기치 않은 마크업이 만들어질 수 있다(현재 코드베이스에서 홑따옴표 속성 사용처는 확인되지 않았으나, 잠재적 표면으로 남아있다) |

### 원인 (왜 이렇게 됐는가)

`exam.js`/`quiz.js`(시험 도메인)와 `job-features.js`(취업핸드북 도메인)가 서로 다른 시점에, 서로 다른 담당자가 작성하면서 공용 이스케이프 유틸이 없어 각자 구현한 것으로 보인다.

### 해결 방향

- [ ] `job-features.js`의 `esc()`에 작은따옴표 이스케이프를 우선 추가해 최소한 동작을 통일 (가장 작은 변경)
- [ ] (근본 해결) 하나의 `escapeHtml()`을 공용 유틸로 추출하고 세 파일이 함께 사용 — 다만 이 경우 `job-features.js`(handbook)와 `exam.js`/`quiz.js`(exam) 두 담당 영역에 걸치므로 [DEVELOPMENT_GUIDE.md](../DEVELOPMENT_GUIDE.md) 3장 기준 별도 PR + 교차 리뷰 필요

### 해결하지 않을 경우

_(현재 Open — 해당 없음)_

---

## TD-0011: 점수 등급(90점/70점) 판정 기준이 두 곳에 하드코딩됨

- **상태**: 🔴 Open
- **우선순위**: Low
- **등록일**: 2026-07-04
- **검증일**: 2026-07-04
- **관련 파일**: `assets/js/pages/exam.js`(`scoreTierEmoji`), `assets/js/pages/quiz.js`(`getScoreTier`)

### 현황 (무엇이 문제인가)

"90점 이상 / 70점 이상 / 그 미만"이라는 3단계 점수 등급 기준이 `exam.js`의 `scoreTierEmoji()`와 `quiz.js`의 `getScoreTier()`에 각각 숫자 리터럴(`90`, `70`)로 중복 작성되어 있다. 반환 형태는 다르다 — `scoreTierEmoji`는 이모지 문자열만, `getScoreTier`는 이모지+타이틀+컨페티 여부 객체를 반환한다.

### 검증 근거 (2026-07-04 재검증)

`exam.js:137-142` `scoreTierEmoji(score)`와 `quiz.js:313-317` `getScoreTier(score)`를 직접 읽고 비교했다. 두 함수 모두 `score >= 90`, `score >= 70` 분기를 그대로 갖고 있고, `exam.js:137` 바로 위 주석에 "결과 화면(quiz.js의 getScoreTier)과 동일한 점수 구간 기준으로 톤을 맞춘다"고 이미 명시되어 있어 의도적으로 기준을 맞춘 상태임을 확인했다.

### 영향도 (Impact)

| 영역 | 영향 |
|---|---|
| 유지보수성 | 등급 기준 숫자를 바꾸려면(예: 90→95) 두 파일을 모두 찾아 고쳐야 한다 |
| 확장성 | 등급 구간을 4단계로 늘리는 등 로직이 복잡해지면 두 구현이 더 벌어질 위험이 있다 |
| 버그 발생 가능성 | 낮음 — 반환 형태가 달라 함수 자체를 합치기보다 기준 숫자만 상수화하면 되는 수준 |

### 원인 (왜 이렇게 됐는가)

`exam.js`(목록 통계 표시)와 `quiz.js`(응시 결과 화면)가 같은 채점 기준을 각자 다른 용도로 필요로 하면서, 상수를 공유하지 않고 그대로 복사한 것으로 보인다.

### 해결 방향

- [ ] `SCORE_TIER_GREAT = 90`, `SCORE_TIER_GOOD = 70` 같은 상수만 공용 파일(TD-0007 해결 시 만들 `exam-shared.js`)로 옮기고, 각 파일의 함수 본체(반환 형태)는 그대로 유지

### 해결하지 않을 경우

_(현재 Open — 해당 없음)_

---

## Validation Summary

2026-07-04 재검증 + 2026-07-04 상태 체계 개편 기준, 총 11건. 상태 값을 🔴 Open / 🟡 Planned / 🔵 In Progress / ✅ Resolved / ❌ False Positive / 📅 Post Release 6종으로 통일했다(정의는 [README.md](README.md) 참고).

| 상태 | 건수 | 항목 |
|---|---|---|
| 🔴 Open | 5 | TD-0001, TD-0007, TD-0008, TD-0010, TD-0011 |
| 🟡 Planned | 1 | TD-0003 |
| 🔵 In Progress | 0 | - |
| ✅ Resolved | 2 | TD-0004, TD-0005 |
| ❌ False Positive | 1 | TD-0009 |
| 📅 Post Release | 2 | TD-0002, TD-0006 (+ TD 번호 없는 CHANGELOG.md 메모) |

- **🔴 Open(5)**: 실제 코드/JSON/호출 흐름으로 문제를 확인했지만, 아직 해결 방향을 확정하지 않은 항목.
- **🟡 Planned(1)**: TD-0003 — 삭제하기로 결정하고 `COMPONENT_GUIDE.md` 카탈로그 정리까지 마쳤으나, 실제 `components.css` 코드 삭제만 남음.
- **🔵 In Progress(0)**: 현재 실제로 작업 중인 항목 없음.
- **✅ Resolved(2)**: TD-0004, TD-0005 — 코드 내 주석이 해당 TD 번호를 직접 참조하며 이미 적용된 수정 내용을 스스로 기록하고 있음을 확인함. 문서 갱신만 누락되어 있었음.
- **❌ False Positive(1)**: TD-0009 — `combinedQuestions` 리다이렉션 로직 확인 결과 404가 재현되지 않음(코드로 확인, 원인 분석 포함).
- **📅 Post Release(2)**: TD-0002, TD-0006 — 실제로 존재하는 문제이지만, 해결하려면 시연에 노출되는 화면의 코드(홈 진도율 계산, CSS)를 건드려야 해 발표 이후로 미루기로 결정.

이전에 쓰던 `Confirmed`/`Needs Investigation` 값은 이번 개편으로 제거됐다 — `Confirmed`는 상태가 아니라 "검증을 거쳤다"는 전제 자체이므로 6개 상태 중 하나(Open/Planned/In Progress/Resolved/Post Release)로 흡수되고, `Needs Investigation`은 "코드로 검증 후에만 기록한다"는 규칙상 검증 전 항목은 애초에 이 문서에 올리지 않으므로 사실상 불필요해 별도 값을 두지 않았다.

---

## 문서 관련 메모 (기술 부채는 아니지만 함께 발견됨)

- ~~`docs/9-COMPONENTS.md`, `docs/99-EXAM_PLAN.md`가 `docs/` 루트에 남아있어 `COMPONENT_GUIDE.md`와 내용이 겹친다~~ — **2026-07-04 재확인 결과 이미 해결됨**: `git log --all -- docs/9-COMPONENTS.md docs/99-EXAM_PLAN.md`로 확인한 결과 두 파일은 `960cf9c 복잡한 docs md 정리` 커밋에서 이미 `docs/archive/`로 옮겨져 있었다. `docs/` 루트에는 더 이상 없음(`ls docs/` 확인). 이 메모는 작성 당시 실제로 확인하지 않고 추정으로 남겼던 것으로 보인다 — 지금은 조치 불필요.
- **[Post Release]** 지시에는 "`CHANGELOG.md`는 유지한다"고 되어 있었지만, 실제로 프로젝트 어디에도 `CHANGELOG.md`가 존재하지 않는다(`find` 재확인, 2026-07-04). 새로 만들지, 지시 문구 자체를 정정할지는 제품/팀 결정이 필요해 발표 이후로 미룬다.
