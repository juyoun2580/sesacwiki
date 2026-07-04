# TD-NNNN: {기술 부채 제목}

- **상태**: 🔴 Open | 🟡 Planned | 🔵 In Progress | ✅ Resolved | ❌ False Positive | 📅 Post Release
- **우선순위**: High | Medium | Low | N/A(Resolved/False Positive/Post Release인 경우)
- **등록일**: YYYY-MM-DD
- **검증일**: YYYY-MM-DD (실제 코드를 마지막으로 대조 확인한 날짜)
- **등록자**:
- **관련 파일**:

> **작성 전 필수 확인**: 아래 "현황"은 실제 코드/JSON/호출 흐름을 직접 읽고 확인한 뒤에만 작성한다. 다른 문서나 이전 기록을 근거로 옮겨 적지 않는다 — 코드로 검증하지 못한 내용은 애초에 이 문서에 올리지 않는다(검증되면 그때 등록).

## 현황 (무엇이 문제인가)

지금 코드가 어떻게 되어 있는지, 왜 문제로 판단했는지 서술한다. 재현 가능한 버그가 아니라 "구조적으로 이렇게 되어 있다"는 사실 서술 위주.

## 검증 근거 (실제로 무엇을 확인했는가)

어떤 파일의 몇 번째 줄, 어떤 함수, 어떤 JSON 필드를 직접 읽었는지, 어떤 호출 흐름을 따라갔는지 구체적으로 남긴다. "~일 것이다", "~로 보인다"는 추정 표현은 이 절에는 쓰지 않는다 — 확인된 사실만 적는다.

## 영향도 (Impact)

| 영역 | 영향 |
|---|---|
| 유지보수성 | 이 부채 때문에 수정 시 어디까지 함께 봐야 하는지 |
| 확장성 | 새 기능 추가 시 어떤 제약이 생기는지 |
| 버그 발생 가능성 | 방치 시 실제 버그로 이어질 수 있는 시나리오 |

## 원인 (왜 이렇게 됐는가)

의도적 트레이드오프였는지, 시간 압박으로 인한 임시방편이었는지, 여러 사람이 각자 작업하다 생긴 중복인지 등 배경을 남긴다.

## 해결 방향

- [ ] 제안하는 해결 방법 1
- [ ] 제안하는 해결 방법 2 (대안이 있다면)

## 해결하지 않을 경우

`📅 Post Release`로 미뤘다면 그 이유(리스크가 사용자 가치보다 큰 근거)와 재검토 시점을 남긴다. `❌ False Positive`라면 왜 그렇게 잘못 판단했었는지 원인도 함께 남긴다.

---

## 작성 예시 (참고용)

# TD-0001: job_features localStorage 키를 3개 파일이 각자 직접 접근

- **상태**: 🔴 Open
- **우선순위**: Medium
- **등록일**: 2025-06-10
- **검증일**: 2025-06-10
- **등록자**: 공통 담당
- **관련 파일**: `assets/js/pages/job-features.js`, `assets/js/pages/job.js`, `assets/js/pages/home.js`

### 현황 (무엇이 문제인가)

`localStorage`의 `job_features` 키를 소유 파일인 `job-features.js` 외에 `job.js`(로그인 동기화 시), `home.js`(홈 대시보드 "취업 준비율" 카드)가 각각 `localStorage.getItem('job_features')`로 직접 읽는다. 접근을 감싸는 공용 함수가 없다.

### 검증 근거 (실제로 무엇을 확인했는가)

`job-features.js`의 `FEATURES_KEY` 상수 선언부, `job.js`의 `'job_features'` 문자열 리터럴 사용처(몇 번째 줄인지), `home.js`의 `JOB_FEATURES_KEY` 상수 선언부를 각각 직접 읽고 세 곳 모두 독립적으로 키에 접근함을 확인 — 이런 식으로 파일명·줄 번호·실제로 읽은 코드를 구체적으로 남긴다.

### 영향도 (Impact)

| 영역 | 영향 |
|---|---|
| 유지보수성 | `job_features`의 데이터 구조(`DEFAULT_FEATURES` 형태)가 바뀌면 3개 파일을 모두 찾아 고쳐야 한다 |
| 확장성 | 새 기능 패널을 추가해 `job_features` 스키마에 필드를 넣을 때, `home.js`가 어떤 필드를 참조하는지 놓치기 쉽다 |
| 버그 발생 가능성 | 한 곳에서 키 이름이나 JSON 구조를 바꾸고 다른 곳을 갱신하지 않으면 `JSON.parse` 결과가 `undefined`가 되어 조용히 실패할 수 있다 |

### 원인 (왜 이렇게 됐는가)

`job.js`/`job-features.js`가 각자 다른 시점에 작성되면서 `FEATURES_KEY` 상수를 각 파일에 따로 선언했고(`job-features.js`의 `FEATURES_KEY`, `job.js`의 문자열 리터럴 `'job_features'`), `home.js`는 대시보드 카드 하나만 필요해 별도 접근자 없이 직접 읽는 방식으로 추가됐다.

### 해결 방향

- [ ] `assets/js/pages/job-features.js`에 `getJobFeatures()`/`saveJobFeatures(data)` 접근자를 만들고, `job.js`/`home.js`가 이를 통해서만 읽도록 변경
- [ ] (대안) `api.js`의 `getJobProgress()`가 이미 Supabase에서 `jobFeatures`를 반환하므로, 로그인 상태에서는 localStorage 직접 접근 대신 이 함수 결과를 우선 사용하도록 통일

### 해결하지 않을 경우

_(현재 Open 상태 — 해당 없음)_
