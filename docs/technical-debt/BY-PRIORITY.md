# 기술 부채 우선순위별 요약

`docs/technical-debt/`에 개별 `TD-NNNN`으로 기록된 항목을 우선순위(High/Medium/Low) 기준으로 다시 묶은 요약 뷰다. 각 항목의 전체 내용(현황·영향도·원인·해결 방향)은 [2026-07-04-doc-review-findings.md](2026-07-04-doc-review-findings.md)에 있고, 여기서는 문제/영향 범위/권장 해결 방법/예상 작업량만 간추렸다.

**이번 사이클(발표·시연 준비 기간) 기준**: 아래 항목 전부 **미구현 상태로 유지**하며, 리팩토링보다 안정성을 우선한다. 예상 작업량은 실제 착수 시 재확인이 필요한 대략치다(S = 1시간 이내, M = 반나절 내외, L = 1일 이상).

**2026-07-04 재검증 반영**: 전체 11건을 코드로 다시 대조한 결과 TD-0004, TD-0005는 이미 코드에서 해결된 상태였고(문서 갱신만 누락), TD-0009는 애초에 실제 문제가 아니었던 False Positive로 확인됐다. 세 항목은 아래 우선순위 섹션에서 빼고 별도 "✅ Resolved / ❌ False Positive" 섹션으로 옮겼다. 이후 상태 체계를 🔴 Open / 🟡 Planned / 🔵 In Progress / ✅ Resolved / ❌ False Positive / 📅 Post Release 6종으로 통일했다(정의: [README.md](README.md)). 상세 검증 근거는 [2026-07-04-doc-review-findings.md](2026-07-04-doc-review-findings.md) 참고.

---

## High

_(2026-07-04 재검증 결과, 현재 High로 남는 항목 없음 — 기존에 여기 있던 TD-0009는 False Positive로 판정되어 아래 "✅ Resolved / ❌ False Positive" 섹션으로 이동함.)_

---

## Medium

### [TD-0001] `job_features` localStorage 키를 3개 파일이 각자 직접 접근

- **문제**: `job-features.js`(소유), `job.js`(로그인 동기화), `home.js`(대시보드 카드)가 `job_features` 키를 공용 접근자 없이 각자 읽는다. `isStepDone`/`isJobStepDone` 판정 로직도 두 파일에 그대로 중복.
- **영향 범위**: `assets/js/pages/job-features.js`, `job.js`, `home.js` — 취업핸드북 화면과 홈 대시보드 "취업 준비율" 카드.
- **권장 해결 방법**: `job-features.js`에 `getJobFeatures()`/`saveJobFeatures()` 접근자를 만들어 세 파일이 이를 통해서만 읽고 쓰도록 통일.
- **예상 작업량**: M — 접근자 함수 작성 + 3개 파일 호출부 교체 + 회귀 확인(홈 카드, 핸드북 진행률 둘 다).
- **우선순위**: Medium. **완화 조치 적용됨**: `isStepDone()`/`isJobStepDone()` 위에 "두 파일을 함께 수정하라"는 상호 참조 주석을 추가해 실수로 한쪽만 고치는 위험을 낮춰둔 상태.

### [TD-0008] "내 문서"/"즐겨찾기" 화면이 어떤 데이터 소스에도 연결되지 않음

- **문제**: `pages/my/index.html`, `pages/my/favorites.html`에 전용 JS도, JSON도, Supabase 연동도 없어 목록이 정적 마크업 그대로 하드코딩됨.
- **영향 범위**: `pages/my/index.html`, `pages/my/favorites.html`.
- **권장 해결 방법**: `documents` 테이블 스키마 설계 후 연동, `favorites.html`은 새 테이블 없이 기존 `wiki_bookmarks`/`words` 등을 합쳐 보여주는 뷰로 구성.
- **예상 작업량**: L — 스키마 설계부터 화면 연동까지 새 기능 개발 범위.
- **우선순위**: Medium — 사용자가 "저장해도 반영 안 되는" 것처럼 느낄 수 있는 UX 이슈지만, 에러가 나거나 깨지는 건 아님.

### [TD-0010] HTML 이스케이프 함수가 3곳에 각각 다르게 구현됨 *(Stage 5 신규)*

- **문제**: `exam.js`/`quiz.js`의 `escapeHtml()`(5문자 이스케이프)과 `job-features.js`의 `esc()`(4문자, 작은따옴표 누락)가 서로 다르게 구현됨.
- **영향 범위**: `assets/js/pages/exam.js`, `quiz.js`, `job-features.js` — 시험/취업핸드북 화면에서 사용자 입력을 `innerHTML`로 렌더링하는 모든 지점.
- **권장 해결 방법**: 우선 `job-features.js`의 `esc()`에 작은따옴표 이스케이프만 추가(최소 변경). 근본 해결(하나로 통합)은 exam/handbook 두 담당 영역에 걸쳐 별도 PR 필요.
- **예상 작업량**: 최소 변경 S / 통합 M.
- **우선순위**: Medium — 현재 확인된 실제 공격 표면은 없지만, 이스케이프 로직이 파일마다 다르다는 사실 자체가 잠재 위험.

---

## Low

### [TD-0003] `.rank-badge` 컴포넌트 미사용 — **🟡 Planned**

- **문제**: `components.css`에 정의된 `.rank-badge` 스타일을 실제로 쓰는 화면이 없음.
- **영향 범위**: `assets/css/components.css`, `docs/COMPONENT_GUIDE.md`.
- **권장 해결 방법**: 재사용 계획 없음을 확인 완료 — `COMPONENT_GUIDE.md` 카탈로그는 "삭제 확정"으로 갱신함(2026-07-04, 문서 변경만). **남은 작업**: `components.css`의 `.rank-badge`/`.rank-badge--muted` 규칙 실제 삭제(코드 변경) — 다음 코드 작업 때 함께 처리.
- **예상 작업량**: S(카탈로그 문서 정리는 완료, CSS 삭제만 남음).
- **우선순위**: Low — 미사용 CSS라 직접적 버그 없음. 실제 삭제도 라이브 화면에 영향 없어 리스크 낮음.

### [TD-0007] `exam.js`와 `quiz.js`의 fetch·캐싱·공통 유틸 함수 중복

- **문제**: `fetchQuestionsFile`/`questionFileCache`, `getLocalExamAttempts`, `setText` 세 함수가 두 파일에 완전히 동일하게 중복 구현됨.
- **영향 범위**: `assets/js/pages/exam.js`, `quiz.js` — 둘 다 `feature/exam` 단일 담당 영역.
- **권장 해결 방법**: `exam-shared.js`(가칭)로 추출해 두 파일이 공유.
- **예상 작업량**: M.
- **우선순위**: Low — 코드가 이미 완전히 동일해 divergence 위험이 없고, 같은 담당자 소유라 교차 리뷰 부담도 없음.

### [TD-0011] 점수 등급(90점/70점) 판정 기준이 두 곳에 하드코딩됨 *(Stage 5 신규)*

- **문제**: `exam.js`의 `scoreTierEmoji()`와 `quiz.js`의 `getScoreTier()`가 90/70 기준 숫자를 각자 리터럴로 갖고 있음(반환 형태는 다름).
- **영향 범위**: `assets/js/pages/exam.js`, `quiz.js`.
- **권장 해결 방법**: 숫자만 상수(`SCORE_TIER_GREAT`, `SCORE_TIER_GOOD`)로 뽑아 공유. 함수 자체는 반환 형태가 달라 합치지 않음.
- **예상 작업량**: S.
- **우선순위**: Low — 기준이 바뀔 계획이 없는 한 실질 위험 거의 없음.

---

## 📅 Post Release (발표 이후로 보류, 2026-07-04 결정)

우선순위는 Low지만, 해결하려면 시연에서 실제로 보이는 화면의 코드(홈 대시보드 계산 로직, CSS)를 직접 건드려야 해서 리스크가 사용자 가치보다 크다고 판단해 발표 이후로 미룬 항목.

### [TD-0002] `wiki.json`과 `wiki-data.json` 파일명 혼동

- **문제**: `wiki.json`(진도율 요약, `wiki-001`~`005`)과 `wiki-data.json`(본문 전체, `sql-select` 등)의 ID가 하나도 겹치지 않아, 홈 대시보드 "학습 진도율" 카드가 실제 위키 콘텐츠와 무관한 값을 보여준다.
- **영향 범위**: `assets/data/wiki.json`, `wiki-data.json`, `home.js`, `wiki.js`.
- **권장 해결 방법**: `home.js`의 진도율 계산을 `wiki-data.json` 기반으로 변경 후 `wiki.json` 정리.
- **예상 작업량**: S.
- **보류 이유**: 수정하려면 홈 화면이 실시간으로 쓰는 계산 로직을 바꿔야 함 — 지금은 에러 없이 숫자만 부정확한 수준이라 발표 전 리스크를 감수할 이유가 없음.

### [TD-0006] `pages/handbook/resume.html`이 `job.css`가 아니라 `my.css` 사용

- **문제**: 폴더상 handbook 소속인데 실제 로드하는 CSS는 my 도메인 소유.
- **영향 범위**: `pages/handbook/resume.html`, `assets/css/pages/my.css`, `job.css`.
- **권장 해결 방법**: 실제 사용 중인 클래스 확인 후 `job.css`/`resume.css`로 이관.
- **예상 작업량**: M.
- **보류 이유**: 시연에 보이는 화면의 스타일 파일을 직접 이관하는 작업이라 시각적 회귀 위험이 있음 — 지금 당장 깨지는 곳은 없어 발표 이후로 미룸.

### `CHANGELOG.md` 없음 (지시-실제 불일치)

- **문제**: 과거 지시에는 "`CHANGELOG.md`는 유지한다"고 되어 있었지만, 실제로 프로젝트 어디에도 존재하지 않음(2026-07-04 재확인).
- **권장 해결 방법**: 새로 만들지, 지시 문구를 정정할지 결정 필요.
- **보류 이유**: 코드/문서 리스크는 없으나 제품/팀 차원의 결정이 필요해 발표 이후로 미룸.

---

## ✅ Resolved / ❌ False Positive (조치 불필요, 2026-07-04 재검증)

### [TD-0004] 위키 상세 즐겨찾기 별의 이중 이벤트 바인딩 — **✅ Resolved**

`wiki.js`의 `bindWikiDetailFavoriteStars()`가 대상 엘리먼트를 `cloneNode(true)`+`replaceWith()`로 교체해 `ui.js`의 기존 리스너를 제거한 뒤 저장 리스너 하나만 남기는 방식으로 이미 수정되어 있었다. 코드 주석이 "TD-0004"를 직접 언급하며 이 사실을 기록하고 있다. 문서(상태 Open) 갱신만 누락됐던 것.

### [TD-0005] 단어 저장 모달의 저장 책임이 `modal.js`/`mypage.js`에 분산 — **✅ Resolved**

`modal.js`의 가짜 `saveWord()`는 이미 제거되었고, `mypage.js`의 `data-action="save-word"` 리스너 하나가 닫기·토스트·실제 저장을 모두 전담하도록 통일되어 있었다. `modal.js` 주석이 "TD-0005"를 직접 언급하며 이 사실을 기록하고 있다.

### [TD-0009] `exam-000`/`exam-015` 문제 파일 누락 — **❌ False Positive**

`questions/exam-000.json`, `exam-015.json` 파일이 없는 건 사실이지만, `exam.json`의 `combinedQuestions` 매핑과 `quiz.js`의 `resolveQuizQuestions()`/`exam.js`의 `resolveRealExamId()`가 이 두 ID를 다른 실제 파일들로 리다이렉트하도록 이미 설계되어 있어 404가 재현되지 않는다. 상세 검증 근거는 [findings 문서의 TD-0009 항목](2026-07-04-doc-review-findings.md#td-0009-examjson에-존재하는-exam-000exam-015의-문제-파일-누락) 참고.

---

## 참고

- 전체 목록·상태 추적은 [README.md](README.md)의 상태별(🔴/🟡/🔵/✅/❌/📅) 목록 참고.
- 새로 발견되는 항목은 [TEMPLATE.md](TEMPLATE.md)로 작성한 뒤, 이 문서에도 해당 우선순위 섹션에 요약을 추가한다.
