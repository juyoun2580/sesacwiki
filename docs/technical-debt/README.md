# technical-debt/ — 기술 부채 목록

## 역할

"당장 고치지는 않지만, 알고 있어야 하는 문제"를 개별 파일로 추적한다. 지금까지는 이런 문제가 리뷰 대화나 커밋 메시지 속에 묻혀 사라졌다 — 이 폴더는 그걸 **검색 가능하고, 우선순위가 매겨지고, 상태가 갱신되는 목록**으로 만든다.

버그([bugs/](../bugs/))와의 차이: 버그는 "기대와 다르게 동작하는 것"이고, 기술 부채는 "지금은 동작하지만 구조적으로 개선이 필요한 것"이다. 애매하면 "사용자가 이 문제를 겪는가?"로 판단한다 — 겪으면 `bugs/`, 안 겪으면(개발자만 불편하면) `technical-debt/`.

## 언제 작성하는가

- 코드 리뷰/리팩토링 중 "지금 고치기엔 범위가 크니 나중에" 판단한 것
- 중복 로직, 책임이 불명확한 파일, 임시방편으로 넣은 우회 코드를 발견했을 때
- 새 기능을 넣으려는데 기존 구조가 막고 있어서 우회했을 때

## 파일명 규칙

```
TD-NNNN-kebab-case-title.md
```

## 작성 규칙 (필수)

> Technical Debt는 코드로 재현 또는 검증된 내용만 기록한다.
> - 추정으로 작성하지 않는다.
> - 기존 문서를 근거로 다시 문서를 작성하지 않는다.
> - 모든 항목은 🔴 Open / 🟡 Planned / 🔵 In Progress / ✅ Resolved / ❌ False Positive / 📅 Post Release 중 하나의 상태를 가진다.
> - 코드 변경 시 상태를 함께 갱신한다.

새 항목을 쓰거나 기존 항목을 다시 다룰 때는 항상 실제 코드/JSON/호출 흐름을 직접 읽고 나서 판단한다. 다른 문서(README, 이전 세션 요약, 커밋 메시지 등)에 적힌 내용을 그대로 옮겨적지 않는다 — 그 문서가 이미 틀렸을 수 있다([TD-0009](2026-07-04-doc-review-findings.md#td-0009-examjson에-존재하는-exam-000exam-015의-문제-파일-누락)가 실제 사례). 코드로 검증하지 못한 내용은 애초에 이 문서에 올리지 않는다 — 검증되고 나서 등록한다.

## 상태(Status) 값

아래 6가지만 사용한다. 하나의 항목은 항상 정확히 하나의 상태만 가진다(예: "Confirmed지만 Post Release" 같은 이중 태그를 쓰지 않는다 — 실제 문제로 확인됐고 발표 이후로 미루기로 했다면 그 자체가 `📅 Post Release` 상태다).

| 상태 | 의미 |
|---|---|
| 🔴 `Open` | 코드로 확인된 실제 문제이지만, 아직 해결하기로 결정하지 않음 |
| 🟡 `Planned` | 해결하기로 결정했지만 아직 작업을 시작하지 않음 |
| 🔵 `In Progress` | 해결 작업이 실제로 진행 중 |
| ✅ `Resolved` | 코드에서 이미 해결되어 더 이상 유효하지 않음(적용된 해결 방법을 기록) |
| ❌ `False Positive` | 코드로 확인한 결과 실제로는 문제가 아님(왜 잘못 판단했는지 원인도 함께 기록) |
| 📅 `Post Release` | 실제 문제로 확인됐지만, 변경 리스크가 사용자 가치보다 커서 배포/발표 이후로 미루기로 결정 |

각 TD 항목은 등록 시점뿐 아니라 **재검증 시점(검증일)**을 함께 기록하고, 코드가 바뀌면 그때마다 상태를 다시 확인해 갱신한다.

## 우선순위 기준

| 우선순위 | 기준 |
|---|---|
| High | 다음 기능 개발을 막거나, 방치 시 버그로 이어질 가능성이 높음 |
| Medium | 유지보수 비용을 늘리지만 당장 기능에 지장 없음 |
| Low | 알아두면 좋은 개선 여지 수준 |

`Resolved`/`False Positive`/`Post Release` 상태의 항목은 우선순위를 `N/A`로 표기한다(해결됐거나, 문제가 아니거나, 지금은 다루지 않기로 했으므로).

## 목록 (상태별)

# Technical Debt

## 🔴 Open
*(아직 해결 안 됨)*

- [TD-0001](2026-07-04-doc-review-findings.md#td-0001-job_features-localstorage-키를-3개-파일이-각자-직접-접근) `job_features` localStorage 키를 3개 파일이 각자 직접 접근 — Medium
- [TD-0007](2026-07-04-doc-review-findings.md#td-0007-examjs와-quizjs의-fetch캐싱공통-유틸-함수-중복) `exam.js`/`quiz.js`의 fetch·캐싱·공통 유틸 함수 중복 — Low
- [TD-0008](2026-07-04-doc-review-findings.md#td-0008-내-문서즐겨찾기-화면이-어떤-데이터-소스에도-연결되지-않음) "내 문서"/"즐겨찾기" 화면 데이터 미연동 — Medium
- [TD-0010](2026-07-04-doc-review-findings.md#td-0010-html-이스케이프-함수가-3곳에-각각-다르게-구현됨) HTML 이스케이프 함수가 3곳에 각각 다르게 구현됨 — Medium
- [TD-0011](2026-07-04-doc-review-findings.md#td-0011-점수-등급90점70점-판정-기준이-두-곳에-하드코딩됨) 점수 등급(90점/70점) 판정 기준이 두 곳에 하드코딩됨 — Low

## 🟡 Planned
*(해결하기로 결정)*

- [TD-0003](2026-07-04-doc-review-findings.md#td-0003-rank-badge-컴포넌트-미사용) `.rank-badge` 컴포넌트 미사용 — Low. 삭제 확정, `COMPONENT_GUIDE.md` 카탈로그 정리 완료. 남은 작업은 `components.css`에서 실제 CSS 규칙 삭제(코드 변경)뿐.

## 🔵 In Progress
*(작업 중)*

- _(현재 없음)_

## ✅ Resolved
*(해결 완료)*

- [TD-0004](2026-07-04-doc-review-findings.md#td-0004-위키-상세-즐겨찾기-별의-이중-이벤트-바인딩) 위키 상세 즐겨찾기 별의 이중 이벤트 바인딩 — `wiki.js`가 이미 clone+replace로 해결, 문서만 갱신 안 됐던 상태
- [TD-0005](2026-07-04-doc-review-findings.md#td-0005-단어-저장-모달의-저장-책임이-modaljs와-mypagejs에-분산됨) 단어 저장 모달의 저장 책임이 `modal.js`/`mypage.js`에 분산 — 이미 `mypage.js` 단일 핸들러로 통일되어 있었음

## ❌ False Positive
*(문서 오류, 실제 문제 아님)*

- [TD-0009](2026-07-04-doc-review-findings.md#td-0009-examjson에-존재하는-exam-000exam-015의-문제-파일-누락) `exam-000`/`exam-015` 문제 파일 누락 — `combinedQuestions` 리다이렉션으로 404가 나지 않음을 코드로 확인

## 📅 Post Release
*(배포 후 진행)*

- [TD-0002](2026-07-04-doc-review-findings.md#td-0002-wikijson과-wiki-datajson-파일명-혼동) `wiki.json`과 `wiki-data.json` 파일명 혼동 — Low
- [TD-0006](2026-07-04-doc-review-findings.md#td-0006-pageshandbookresumehtml이-jobcss가-아니라-mycss를-사용) `resume.html`이 `job.css` 대신 `my.css` 사용 — Low
- (TD 번호 없음) `CHANGELOG.md`가 지시와 달리 실제로 존재하지 않음 — 팀 결정 필요, [문서 관련 메모](2026-07-04-doc-review-findings.md#문서-관련-메모-기술-부채는-아니지만-함께-발견됨) 참고

---

새 항목은 [TEMPLATE.md](TEMPLATE.md)를 복사해서 시작한다. TD-0001~0009는 2026-07-04 문서 리팩토링 작업 중, TD-0010~0011은 같은 날 exam.js/quiz.js 중복 분석(Stage 5) 중 발견되어 편의상 [2026-07-04-doc-review-findings.md](2026-07-04-doc-review-findings.md) 하나에 모아뒀다 — 개별 항목이 상태를 갖고 계속 갱신되면 그때 `TD-NNNN-kebab-case-title.md`로 분리한다. 전체 11건은 2026-07-04 코드 기준으로 재검증했다(상세: [2026-07-04-doc-review-findings.md의 Validation Summary](2026-07-04-doc-review-findings.md#validation-summary)).

우선순위별로 한눈에 보려면 [BY-PRIORITY.md](BY-PRIORITY.md) 참고.
