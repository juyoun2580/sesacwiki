# 5-EXAM_PLAN.md

# 모의고사 기능 확장 기획안

## 1. 개요

새싹트리 모의고사(`exam.html`/`quiz.html`) 기능을 실제 문제은행 기반으로 확장하기 위한 기획안이다. 기존 새싹위키 프로젝트 규칙([CLAUDE.md](../CLAUDE.md), [WORK_ORDER.md](3-WORK_ORDER.md), [PAGES.md](4-PAGES.md))을 그대로 따르며, 외부 참고 자료(Salesforce ADX201 학습 앱 기획서)에서 문제 데이터 구조와 오답노트 아이디어만 선별 차용한다.

> 관련 문서: [WORK_ORDER.md](3-WORK_ORDER.md) · [PAGES.md](4-PAGES.md) · [JSON_GUIDE.md](JSON_GUIDE.md)(예정)

---

## 2. 모의고사 카테고리 구조

**전과목 / 세일즈포스 / Java / SQL / HTML / CSS / JavaScript / 기타** (총 8개)

- 기타 = Git, 바이브코딩 등 잡다한 항목 포함
- 기존 "면접 대비" 카테고리는 삭제
- HTML과 CSS는 별도 섹션으로 분리 운영 (통합하지 않음)

### 변경 이력 (참고용)

1. 8개(기존, 면접대비 포함) → 2. 6개(기타 신설, SQL 누락) → 3. 7개(SQL 복귀) → 4. **8개(HTML/CSS 분리, "전체 모의고사"→"전과목" 명칭 변경, 최종)**

---

## 3. 디자인 방향

새싹위키 고유 톤(새싹 그린 + 아이보리/민트, 글래스모피즘)을 그대로 적용한다. 참고 자료(ADX201)의 다크 코스믹 테마 및 블루/사이언 네온 컬러는 채택하지 않는다.

---

## 4. 기술 방향

React/TypeScript/Tailwind 등 외부 스택은 사용하지 않는다. 새싹위키 프로젝트 규칙([CLAUDE.md](../CLAUDE.md))에 따라 순수 HTML/CSS/JS, MPA 구조, 파일 역할 분리 원칙을 그대로 따른다.

- **HTML**: `exam.html`, `quiz.html` — 페이지 블록(`<section id="exam">`, `<section id="quiz">`)만 수정. 공통 헤더/네비/스크립트 블록은 절대 수정하지 않는다 ([WORK_ORDER.md](3-WORK_ORDER.md) 참고).
- **CSS**: `assets/css/pages/exam.css`
- **JS**: `assets/js/pages/quiz.js` (단, `mywords.html` 단어 퀴즈 선택지 토글과 교차 의존 — 변경 전 MyPage 담당과 확인)
- **JSON**: `assets/data/exam.json`

---

## 5. 문제 데이터 스키마 (초안)

카테고리·난이도 분리, 오답노트 상세 해설 구조를 포함한 스키마다. 실제 필드명은 [JSON_GUIDE.md](JSON_GUIDE.md) 표준 확정 시 맞춰 조정한다.

```
문제 항목
├─ 문제 ID
├─ 카테고리 (전과목/세일즈포스/Java/SQL/HTML/CSS/JavaScript/기타)
├─ 난이도 (기초/중급/고급/심화)
├─ 문제 본문
├─ 보기 (4지선다)
├─ 정답
└─ 오답노트 해설
   ├─ 핵심 개념
   ├─ 정답 원리
   ├─ 오답 분석
   ├─ 출제 유의사항
   └─ 실무 비유
```

**참고 출처**: 위 오답노트 해설 5단 구조는 외부 기획서(Salesforce ADX201 학습 앱)의 `tutor_feedback` 필드 설계(`core_concept`, `why_correct`, `why_incorrect`, `exam_point`, `practical_example`)에서 착안했다. 필드명/구조만 차용했으며 원본 콘텐츠나 디자인은 사용하지 않는다.

---

## 6. 제외 기능 (이번 범위에서 명시적으로 구현하지 않음)

- **사용자용 데이터 Import/Export UI** (백업 파일 업로드/다운로드) — 미구현
- **AI 실시간 문제 생성 파이프라인** — 미구현
- **개발자용 CSV→JSON 변환 스크립트**는 사용자 기능과 무관한 별도 트랙으로, 이번 작업 범위 아님

---

## 7. 문제 시딩 방침

카테고리당 최소 5~10문제로 시작하여 화면·기능 연동을 먼저 검증한 뒤 콘텐츠 양을 늘려간다. 통계 필드(응시자 수, 평균 점수 등)는 초기에는 임의값(더미 데이터)으로 채운다.

---

## 8. 보류 항목 (이번 작업 범위 아님 — 추후 별도 논의)

| 항목 | 현재 상태 |
|---|---|
| 데이터 저장 방식 (서버 개설 여부, 정적 JSON과의 관계) | 보류 — 추후 논의 |
| 다국어(bilingual) 지원 범위 및 방식 (세일즈포스 카테고리 한정 논의 중이었음) | 보류 — 추후 논의 |

---

## 9. 작업 체크리스트 (ON 승인 시 진행)

- [ ] `assets/data/exam.json` 스키마 확정 (5장 기준) 및 카테고리별 문제 시딩 (카테고리당 5~10문제)
- [ ] `exam.html` 사이드바 카테고리 목록을 8개로 갱신 (전과목/세일즈포스/Java/SQL/HTML/CSS/JavaScript/기타)
- [ ] `exam.html` 필터탭(`filter-tab`)을 동일한 8개 카테고리로 갱신
- [ ] `exam.html` 문제 카드(`exam-row`)에 `data-exam-id` 또는 쿼리 파라미터 추가 (현재 4개 카드가 모두 `quiz.html`로 동일 링크되어 문제 구분이 안 되는 문제 해결)
- [ ] `quiz.html`에서 전달받은 문제 ID로 `exam.json`의 해당 문제 세트를 로드하도록 연동
- [ ] 오답노트(`wrong-note-box`)를 5단 해설 구조 기반 아코디언 UI로 구현 (현재는 토스트만 뜨는 목업 상태)
- [ ] side-panel의 "내 모의고사 현황"(score-ring, 평균 점수 등) 통계를 하드코딩에서 실제 데이터 계산 로직으로 전환
- [ ] Exam 담당(feature/exam) 작업 지시서에 반영 ([WORK_ORDER.md](3-WORK_ORDER.md) 기준)

---

## 10. 하지 말아야 할 것 (Claude Code 작업 시 주의)

- 공통 블록(`<head>`, `<header>`, `<nav>`, 파일 최하단 공용 마크업, `<script>` 태그 목록) 수정 금지 — 9개 HTML 파일 전체 동기화가 필요한 영역이므로 공통 담당자 소관
- `assets/css/reset.css`, `variables.css`, `base.css`, `layout.css`, `components.css` 수정 금지
- `assets/js/app.js`, `ui.js`, `modal.js`, `toast.js`, `pages/highlight.js` 수정 금지
- Import/Export UI, 서버 연동, 이중언어(bilingual) 관련 코드 생성 금지 — 6장/8장 참고
- 새로운 공용 컴포넌트 임의 생성 금지 — 기존 컴포넌트 재사용 우선 (CLAUDE.md 원칙)
