# START_PROMPTS.md

5개 팀(Home / Wiki / Exam / Job / My)이 오늘부터 각자 Claude Code에 그대로 붙여넣고 시작할 수 있는 작업 시작 프롬프트다. 프롬프트 안에 담당 파일 범위, 참고 문서, 지켜야 할 규칙이 모두 포함되어 있으므로 별도 설명 없이 붙여넣기만 하면 된다.

> 공통 담당자(`feature/core`)는 이 문서의 대상이 아니다 — 공통 담당자의 작업 범위는 [WORK_ORDER.md](WORK_ORDER.md) 0번 항목을 참고한다.

---

## 🏠 Home 담당

```
나는 새싹트리 프로젝트의 Home 페이지(index.html) 담당자다.
작업 시작 전에 CLAUDE.md, docs/TEAM_GUIDE.md, docs/COMPONENTS.md, docs/PAGES.md,
docs/WORK_ORDER.md, docs/DECISION_TREE.md, docs/JSON_GUIDE.md를 먼저 읽고
현재 프로젝트 구조와 규칙을 파악해줘.

내 담당 범위는 다음과 같다 (docs/WORK_ORDER.md "1. Home 담당" 기준).
- 수정 가능: index.html 내 <section id="home">...</section> 블록,
  assets/css/pages/home.css, assets/data/home.json
- 수정 금지: index.html의 <head>/<header>/<nav>/<script> 태그 목록,
  다른 모든 HTML 파일, 공통 CSS(reset/variables/base/layout/components.css),
  공통 JS(app.js/ui.js/modal.js/toast.js), 다른 페이지의 pages/*.css
- 필요 시에만 생성: assets/js/pages/home.js (신규 인터랙션이 실제로 필요할 때만.
  생성하면 <script> 태그 추가는 공통 담당자에게 요청)

git 브랜치는 feature/home 이다. main에서 새로 분기해서 작업하고,
main에는 절대 직접 커밋하지 않는다.

assets/data/home.json은 이미 더미 데이터로 생성되어 있으니 그 스키마를
그대로 따라서 화면과 데이터를 연결하거나 확장해줘. 새로운 필드가 필요하면
JSON_GUIDE.md 규칙(camelCase, id는 문자열, boolean은 is- 접두사, 날짜는
ISO 8601 등)을 지켜서 추가하고, 어떤 필드를 왜 추가했는지 알려줘.

새로운 UI가 필요하면 먼저 docs/COMPONENTS.md에 재사용 가능한 컴포넌트가
있는지 확인하고, 없으면 왜 기존 컴포넌트로 안 되는지 설명한 다음에
home.css에 페이지 전용 스타일로 추가해줘. 기존 컴포넌트를 복제해서
새로 만들지 마.

지금 첫 작업으로 할 일: [여기에 오늘 처리할 구체적인 작업을 적어줘.
예: "성장 현황 카드 4종을 home.json 데이터로 렌더링하도록 연결해줘" 등]
```

---

## 📖 Wiki 담당

```
나는 새싹트리 프로젝트의 Wiki 담당자다 (wiki.html 목록 페이지 + detail.html
상세 페이지 두 파일을 함께 담당한다).
작업 시작 전에 CLAUDE.md, docs/TEAM_GUIDE.md, docs/COMPONENTS.md, docs/PAGES.md,
docs/WORK_ORDER.md, docs/DECISION_TREE.md, docs/JSON_GUIDE.md를 먼저 읽고
현재 프로젝트 구조와 규칙을 파악해줘.

내 담당 범위는 다음과 같다 (docs/WORK_ORDER.md "2. Wiki 담당" 기준).
- 수정 가능: wiki.html의 <section id="wiki">, detail.html의 <section id="detail">
  블록, assets/css/pages/wiki.css (두 파일이 이 CSS를 공유한다),
  assets/js/pages/highlight.js, assets/data/wiki.json
- 수정 금지: 두 파일의 <head>/<header>/<nav>/최하단 공용 마크업(단어 저장
  모달 포함)/<script> 태그 목록, 다른 모든 HTML 파일, 공통 CSS 5종,
  공통 JS(app.js/ui.js/modal.js/toast.js), 다른 페이지 pages/*.css

주의: 즐겨찾기 별 토글(favorite-star)과 단어장 모달은 공통 소유이므로
동작을 바꿔야 하면 직접 고치지 말고 공통 담당자에게 요청해줘.

git 브랜치는 feature/wiki 이다. main에서 새로 분기해서 작업하고,
main에는 절대 직접 커밋하지 않는다.

assets/data/wiki.json은 이미 더미 데이터로 생성되어 있다(목록 5개 +
wiki-001의 상세 본문/TOC/관련문서/저장된 하이라이트/인기글 목록 포함).
이 스키마를 그대로 따라서 화면과 연결하거나 확장해줘. 새로운 필드는
JSON_GUIDE.md 규칙을 지켜서 추가하고 어떤 필드를 왜 추가했는지 알려줘.

새로운 UI가 필요하면 먼저 docs/COMPONENTS.md를 확인하고, 없으면 왜
기존 컴포넌트로 안 되는지 설명한 다음 wiki.css에 페이지 전용 스타일로
추가해줘.

지금 첫 작업으로 할 일: [여기에 오늘 처리할 구체적인 작업을 적어줘.
예: "wiki.json list 배열을 기반으로 wiki-row를 동적으로 렌더링해줘" 등]
```

---

## 📝 Exam 담당

```
나는 새싹트리 프로젝트의 Exam 담당자다 (exam.html 목록 페이지 + quiz.html
응시 페이지 두 파일을 함께 담당한다).
작업 시작 전에 CLAUDE.md, docs/TEAM_GUIDE.md, docs/COMPONENTS.md, docs/PAGES.md,
docs/WORK_ORDER.md, docs/DECISION_TREE.md, docs/JSON_GUIDE.md를 먼저 읽고
현재 프로젝트 구조와 규칙을 파악해줘.

내 담당 범위는 다음과 같다 (docs/WORK_ORDER.md "3. Exam 담당" 기준).
- 수정 가능: exam.html의 <section id="exam">, quiz.html의 <section id="quiz">
  블록, assets/css/pages/exam.css (두 파일이 이 CSS를 공유한다),
  assets/js/pages/quiz.js, assets/data/exam.json
- 수정 금지: 두 파일의 <head>/<header>/<nav>/<script> 태그 목록,
  다른 모든 HTML 파일, 공통 CSS 5종, 공통 JS(app.js/ui.js/modal.js/toast.js),
  다른 페이지 pages/*.css

⚠️ 교차 의존 주의: assets/js/pages/quiz.js는 mywords.html(My 담당 소유
페이지)의 단어 퀴즈 선택지 토글도 함께 처리하고 있다. 이 파일을 변경하기
전에 반드시 mywords.html에 있는 .word-quiz__option 관련 동작에 영향이
없는지 확인하고, 영향이 있으면 My 담당과 조율해줘.

git 브랜치는 feature/exam 이다. main에서 새로 분기해서 작업하고,
main에는 절대 직접 커밋하지 않는다.

assets/data/exam.json은 이미 더미 데이터로 생성되어 있다(목록 4개,
exam-001의 대표 문제 1개, 내 응시 통계, 최근 응시 3건 포함). 이 스키마를
그대로 따라서 화면과 연결하거나 확장해줘. 새로운 필드는 JSON_GUIDE.md
규칙을 지켜서 추가하고 어떤 필드를 왜 추가했는지 알려줘.

새로운 UI가 필요하면 먼저 docs/COMPONENTS.md를 확인하고, 없으면 왜
기존 컴포넌트로 안 되는지 설명한 다음 exam.css에 페이지 전용 스타일로
추가해줘.

지금 첫 작업으로 할 일: [여기에 오늘 처리할 구체적인 작업을 적어줘.
예: "exam.json questions 배열을 기반으로 퀴즈 문제를 순차 렌더링하도록
연결해줘" 등]
```

---

## 💼 Job 담당

```
나는 새싹트리 프로젝트의 취업핸드북(job.html) 담당자다.
작업 시작 전에 CLAUDE.md, docs/TEAM_GUIDE.md, docs/COMPONENTS.md, docs/PAGES.md,
docs/WORK_ORDER.md, docs/DECISION_TREE.md, docs/JSON_GUIDE.md를 먼저 읽고
현재 프로젝트 구조와 규칙을 파악해줘.

job.html은 docs/WORK_ORDER.md에서 my.html/mywords.html/myfav.html과 함께
"4. MyPage(Job/My) 담당" 팀 소속으로 묶여 있고 branch도 feature/job으로
공유한다. 나는 그중 job.html만 맡는다.

내 담당 범위는 다음과 같다.
- 수정 가능: job.html 내 <section id="job">...</section> 블록,
  assets/css/pages/job.css, assets/data/job.json
- 수정 금지: job.html의 <head>/<header>/<nav>/<script> 태그 목록,
  my.html/mywords.html/myfav.html을 포함한 다른 모든 HTML 파일,
  공통 CSS 5종, 공통 JS(app.js/ui.js/modal.js/toast.js),
  assets/css/pages/my.css를 포함한 다른 페이지 CSS
- 필요 시에만 생성: assets/js/pages/job.js (또는 My 담당과 함께 쓸
  assets/js/pages/mypage.js — My 담당과 상의 후 결정)

git 브랜치는 feature/job 이다. My 담당과 같은 브랜치를 쓴다면 작업 전에
서로 커밋 범위(job.html vs my/mywords/myfav.html)가 겹치지 않는지 확인해줘.
main에는 절대 직접 커밋하지 않는다.

assets/data/job.json은 이미 더미 데이터로 생성되어 있다(6단계 stepper,
현재 단계(자기소개서)의 태스크 4종, 준비 지수, 카테고리별 진행률 5종,
최근 작성 결과, 자주 쓰는 도구 4종 포함). 이 스키마를 그대로 따라서
화면과 연결하거나 확장해줘. 새로운 필드는 JSON_GUIDE.md 규칙을 지켜서
추가하고 어떤 필드를 왜 추가했는지 알려줘.

새로운 UI가 필요하면 먼저 docs/COMPONENTS.md를 확인하고, 없으면 왜
기존 컴포넌트로 안 되는지 설명한 다음 job.css에 페이지 전용 스타일로
추가해줘.

지금 첫 작업으로 할 일: [여기에 오늘 처리할 구체적인 작업을 적어줘.
예: "job.json steps 배열로 job-stepper를 동적으로 렌더링해줘" 등]
```

---

## 📚 My 담당

```
나는 새싹트리 프로젝트의 마이핸드북 담당자다 (my.html 내 문서 + mywords.html
저장한 단어 + myfav.html 즐겨찾기, 세 파일을 함께 담당한다).
작업 시작 전에 CLAUDE.md, docs/TEAM_GUIDE.md, docs/COMPONENTS.md, docs/PAGES.md,
docs/WORK_ORDER.md, docs/DECISION_TREE.md, docs/JSON_GUIDE.md를 먼저 읽고
현재 프로젝트 구조와 규칙을 파악해줘.

세 파일은 docs/WORK_ORDER.md에서 job.html과 함께 "4. MyPage(Job/My) 담당"
팀 소속으로 묶여 있고 branch도 feature/job으로 공유한다. 나는 그중
my.html/mywords.html/myfav.html을 맡는다.

내 담당 범위는 다음과 같다.
- 수정 가능: my.html/mywords.html/myfav.html 각각의 <section id="...">
  블록, assets/css/pages/my.css (세 파일이 공유), assets/data/my_docs.json,
  assets/data/words.json
- 수정 금지: 세 파일의 <head>/<header>/<nav>/최하단 공용 마크업/<script>
  태그 목록, job.html을 포함한 다른 모든 HTML 파일, 공통 CSS 5종,
  공통 JS(app.js/ui.js/modal.js/toast.js), assets/css/pages/job.css를
  포함한 다른 페이지 CSS

⚠️ 교차 의존 주의: mywords.html의 "+ 단어 추가" 모달은 공통 modal.js
소유이고, 단어 퀴즈 선택지 토글은 Exam 담당 assets/js/pages/quiz.js
소유다. 두 파일 다 직접 고치지 말고 필요한 변경을 각 소유 팀에 요청해줘.
myfav.html은 별도 JSON이 없다 — wiki.json/my_docs.json/words.json의
isFavorite: true 항목을 모아 보여주는 뷰로 취급하고, 데이터를 myfav
전용으로 새로 만들지 마.

git 브랜치는 feature/job 이다(Job 담당과 공유). main에는 절대 직접
커밋하지 않는다.

assets/data/my_docs.json(문서 5개, 통계, 카테고리별 개수)과
assets/data/words.json(단어 4개, 통계, 오늘의 퀴즈, 카테고리별 개수)은
이미 더미 데이터로 생성되어 있다. 이 스키마를 그대로 따라서 화면과
연결하거나 확장해줘. 새로운 필드는 JSON_GUIDE.md 규칙을 지켜서 추가하고
어떤 필드를 왜 추가했는지 알려줘.

새로운 UI가 필요하면 먼저 docs/COMPONENTS.md를 확인하고, 없으면 왜
기존 컴포넌트로 안 되는지 설명한 다음 my.css에 페이지 전용 스타일로
추가해줘.

지금 첫 작업으로 할 일: [여기에 오늘 처리할 구체적인 작업을 적어줘.
예: "my_docs.json list 배열로 doc-row를 동적으로 렌더링해줘" 등]
```
