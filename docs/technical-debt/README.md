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

## 상태(Status) 값

| 상태 | 의미 |
|---|---|
| `Open` | 확인됨, 아직 계획 없음 |
| `Planned` | 해결 방향은 정했고 일정만 안 잡힘 |
| `In Progress` | 해결 작업 진행 중 |
| `Resolved` | 해결 완료 |
| `Won't Fix` / `Accepted Risk` | 의도적으로 감수하기로 결정 (이유를 반드시 남긴다) |

## 우선순위 기준

| 우선순위 | 기준 |
|---|---|
| High | 다음 기능 개발을 막거나, 방치 시 버그로 이어질 가능성이 높음 |
| Medium | 유지보수 비용을 늘리지만 당장 기능에 지장 없음 |
| Low | 알아두면 좋은 개선 여지 수준 |

## 목록

| 번호 | 제목 | 우선순위 | 상태 |
|---|---|---|---|
| [TD-0001](2026-07-04-doc-review-findings.md#td-0001-job_features-localstorage-키를-3개-파일이-각자-직접-접근) | `job_features` localStorage 키를 3개 파일이 각자 직접 접근 | Medium | Open |
| [TD-0002](2026-07-04-doc-review-findings.md#td-0002-wikijson과-wiki-datajson-파일명-혼동) | `wiki.json`과 `wiki-data.json` 파일명 혼동 | Low | Open |
| [TD-0003](2026-07-04-doc-review-findings.md#td-0003-rank-badge-컴포넌트-미사용) | `.rank-badge` 컴포넌트 미사용 | Low | Open |
| [TD-0004](2026-07-04-doc-review-findings.md#td-0004-위키-상세-즐겨찾기-별의-이중-이벤트-바인딩) | 위키 상세 즐겨찾기 별의 이중 이벤트 바인딩 | Medium | Open |
| [TD-0005](2026-07-04-doc-review-findings.md#td-0005-단어-저장-모달의-저장-책임이-modaljs와-mypagejs에-분산됨) | 단어 저장 모달의 저장 책임이 `modal.js`/`mypage.js`에 분산 | Medium | Open |
| [TD-0006](2026-07-04-doc-review-findings.md#td-0006-pageshandbookresumehtml이-jobcss가-아니라-mycss를-사용) | `resume.html`이 `job.css` 대신 `my.css` 사용 | Low | Open |
| [TD-0007](2026-07-04-doc-review-findings.md#td-0007-examjs와-quizjs의-fetch캐싱-로직-중복) | `exam.js`/`quiz.js`의 fetch·캐싱 로직 중복 | Low | Open |
| [TD-0008](2026-07-04-doc-review-findings.md#td-0008-내-문서즐겨찾기-화면이-어떤-데이터-소스에도-연결되지-않음) | "내 문서"/"즐겨찾기" 화면 데이터 미연동 | Medium | Open |
| [TD-0009](2026-07-04-doc-review-findings.md#td-0009-examjson에-존재하는-exam-000exam-015의-문제-파일-누락) | `exam-000`/`exam-015` 문제 파일 누락(사실상 버그) | High | Open |

새 항목은 [TEMPLATE.md](TEMPLATE.md)를 복사해서 시작한다. 위 9건은 2026-07-04 문서 리팩토링 작업 중 한꺼번에 발견되어 편의상 [2026-07-04-doc-review-findings.md](2026-07-04-doc-review-findings.md) 하나에 모아뒀다 — 개별 항목이 진행 상태를 갖게 되면 그때 `TD-NNNN-kebab-case-title.md`로 분리한다.
