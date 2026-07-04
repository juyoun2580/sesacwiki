# JSON_GUIDE.md

현재 프로젝트는 모든 데이터(위키 문서, 시험 문제, 취업핸드북 단계, 단어, 문서 목록 등)가 `index.html`에 하드코딩되어 있다. CLAUDE.md의 "데이터는 가능한 JSON으로 관리, 하드코딩 최소화" 원칙에 따라, `assets/data/`에 JSON 파일을 도입할 때 따라야 할 **구조·네이밍 표준**을 정의한다.

> 이 문서는 **설계 문서**다. 아직 `assets/data/`에 실제 JSON 파일이 생성되지 않았다. 담당 팀이 필요 시점에 이 스키마를 기준으로 생성한다.
> JSON을 JS에서 어떻게 불러와 쓰는지는 [API_GUIDE.md](API_GUIDE.md), 파일 소유자는 [WORK_ORDER.md](WORK_ORDER.md), 어떤 페이지가 어떤 JSON을 쓰는지는 [PAGES.md](PAGES.md)를 참고한다.

---

## JSON Rule (네이밍·포맷 표준)

모든 JSON 파일은 다음 10가지 규칙을 따른다.

1. **camelCase 사용** — `favoriteCount`, `isFavorite`처럼 모든 키는 camelCase로 작성한다. snake_case, kebab-case 금지.
2. **id는 문자열** — 숫자로 표현 가능해도 `"id": "wiki-001"`처럼 문자열로 작성한다.
3. **title 사용** — 항목의 이름/제목 필드는 항상 `title`로 통일한다. (예: 위키 문서 제목, 문서 제목, 단어 표제어 모두 `title`)
4. **description 사용** — 항목의 요약 설명 필드는 항상 `description`으로 통일한다. `desc` 같은 축약형을 파일마다 다르게 쓰지 않는다. 단 `definition`(단어 뜻), `body`(본문 텍스트)처럼 의미가 명확히 다른 도메인 전용 필드는 예외로 허용한다.
5. **category 사용** — 분류 필드는 `category`로 통일한다.
6. **tags는 배열** — 다중 라벨이 필요한 항목은 `tags: [{ "label": "...", "color": "..." }]` 형태의 배열로 작성한다.
7. **Boolean은 is로 시작** — `isFavorite`, `isRecommended`처럼 boolean 필드는 반드시 `is` 접두사를 붙인다.
8. **날짜는 ISO 8601** — `"2025-05-20"` 형식만 사용한다. `2025.05.20` 같은 표기 금지.
9. **HTML 작성 금지** — JSON 값에 `<b>`, `<br>` 등 HTML 태그를 넣지 않는다. 줄바꿈이 필요하면 `\n`을 사용하고 렌더링 시 JS에서 처리한다.
10. **데이터 중복 금지** — 같은 정보를 여러 JSON에 복사해 넣지 않는다. (아래 "중복 방지" 참고)

### 추가 구조 규칙

11. JSON 파일은 **페이지 그룹 단위**로 소유한다. 여러 팀이 같은 JSON 파일을 동시에 수정하지 않는다 ([WORK_ORDER.md](WORK_ORDER.md) 참고).
12. id는 각 파일 내에서 유일해야 하며 `{도메인}-{일련번호}` 형식을 권장한다 (예: `wiki-001`, `exam-002`, `word-014`).
13. 색상/카테고리 색상 값은 [COMPONENTS.md](COMPONENTS.md)의 Tag modifier(`green`/`blue`/`gold`/`coral`/`gray`/`purple`/`orange`)와 1:1로 매핑되는 문자열만 사용한다 — 임의 색상 문자열 금지.
14. 화면에 반복적으로 나열되는 리스트/카드 데이터만 JSON으로 뺀다. 버튼 라벨, 고정 문구 등 1회성 텍스트는 그대로 HTML에 둔다.

### 중복 방지 (규칙 10)

`myfav`(즐겨찾기 페이지)는 별도 JSON을 만들지 않는다. `wiki.json` / `my_docs.json` / `words.json` 각 항목에 있는 `isFavorite: true` 필드를 모아서 보여주는 **뷰**로 취급한다.

---

## 파일 목록

| 파일 | 소유 팀 | 사용 페이지 |
|---|---|---|
| `assets/data/home.json` | Home | home |
| `assets/data/wiki.json` | Wiki | wiki, detail |
| `assets/data/exam.json` | Exam | exam, quiz |
| `assets/data/job.json` | MyPage(Job/My) | job |
| `assets/data/my_docs.json` | MyPage(Job/My) | my |
| `assets/data/words.json` | MyPage(Job/My) | mywords |

---

## `assets/data/home.json`

```json
{
  "stats": {
    "progressPercent": 62,
    "examCount": 3,
    "examAvgScore": 72,
    "jobReadinessPercent": 45,
    "totalPoints": 1240,
    "weeklyPointDelta": 120
  },
  "roadmap": [
    { "id": "rm-001", "icon": "🗄️", "title": "SQL 기초 복습", "description": "SELECT, WHERE, JOIN", "percent": 70, "color": "green", "goto": "detail" }
  ],
  "recentPages": [
    { "id": "rp-001", "icon": "🗄️", "title": "SQL SELECT 문법", "source": "새싹위키", "sourceColor": "green", "time": "5분 전", "goto": "detail" }
  ],
  "favorites": [
    { "id": "fv-001", "title": "SQL JOIN 완벽 정리", "source": "새싹위키", "sourceColor": "green" }
  ],
  "recentWords": ["JOIN", "Primary Key", "Apex", "Flow", "Callback"],
  "streak": { "days": 7, "best": 12 },
  "quote": "꾸준함이 실력이고,\n실력이 자신감이 됩니다!"
}
```

---

## `assets/data/wiki.json`

```json
{
  "categories": ["전체", "SQL", "Java", "HTML/CSS", "JavaScript", "Git", "Salesforce", "CS 개념", "면접 개념", "취업 가이드"],
  "list": [
    {
      "id": "wiki-001",
      "icon": "🗄️",
      "title": "SQL SELECT 문법",
      "description": "데이터베이스를 다루는 가장 기본적인 SQL 문법을 알아봅니다.",
      "category": "SQL",
      "categoryColor": "green",
      "level": "입문",
      "percent": 78,
      "isFavorite": true,
      "updatedAt": "5분 전"
    }
  ],
  "detail": {
    "wiki-001": {
      "title": "SQL SELECT 문법",
      "tags": [{ "label": "SQL", "color": "green" }, { "label": "입문", "color": "gray" }],
      "estimatedMinutes": 15,
      "completionPercent": 78,
      "toc": ["1. SELECT 기본 문법", "2. WHERE 조건절", "3. ORDER BY 정렬", "4. GROUP BY 집계"],
      "sections": [
        {
          "heading": "1. SELECT 기본 문법",
          "body": "SELECT는 데이터베이스에서 데이터를 조회할 때 사용하는 가장 기본적인 SQL 명령어입니다.",
          "highlightedTerms": [],
          "code": "SELECT 컬럼명1, 컬럼명2\nFROM 테이블명\nWHERE 조건;"
        }
      ],
      "related": [{ "id": "wiki-002", "title": "SQL JOIN 완벽 정리", "description": "다양한 JOIN의 종류와 사용법" }],
      "savedHighlights": [{ "id": "hl-init", "text": "SELECT는 데이터베이스에서 데이터를 조회할 때 사용하는 가장 기본적인 SQL 명령어입니다." }]
    }
  },
  "topList": [{ "id": "wiki-001", "title": "SQL SELECT 문법" }]
}
```

`topList`는 side-panel의 "많이 보는 위키" 순위 목록이다. `savedHighlights`는 사용자가 저장한 하이라이트 목록으로, 하이라이트는 본문 렌더링 시점의 서식이 아니라 사용자 상태 데이터이므로 `sections[].body`에는 일반 텍스트만 담고 하이라이트 표시 여부는 이 필드로 분리한다(규칙 9: JSON에 HTML/서식 태그를 넣지 않는다).

---

## `assets/data/exam.json`

```json
{
  "categories": ["전체", "SQL", "Java", "HTML/CSS", "JavaScript", "Git", "Salesforce", "면접 대비"],
  "list": [
    {
      "id": "exam-001",
      "icon": "🗄️",
      "title": "SQL 기초 10문제",
      "description": "SQL 기본 문법을 확인할 수 있는 입문 모의고사",
      "category": "SQL",
      "level": "입문",
      "questionCount": 10,
      "estimatedMinutes": 10,
      "avgScore": 72,
      "attemptCount": 256,
      "isRecommended": true
    }
  ],
  "questions": {
    "exam-001": [
      {
        "id": "q-001",
        "num": 3,
        "type": "객관식",
        "point": 1,
        "text": "WHERE 절의 역할로 가장 알맞은 것은?",
        "choices": ["데이터를 추가한다", "조건에 맞는 데이터를 조회한다", "테이블을 삭제한다", "컬럼 이름을 변경한다"],
        "answerIndex": 1
      }
    ]
  },
  "myStats": { "attemptCount": 4, "avgScore": 72, "bestScore": 88, "earnedPoints": 560 },
  "recentAttempts": [{ "examId": "exam-001", "title": "SQL 기초 10문제", "score": 80 }]
}
```

---

## `assets/data/job.json`

```json
{
  "steps": [
    { "id": 1, "label": "직무 탐색", "status": "done" },
    { "id": 2, "label": "이력서 작성", "status": "done" },
    { "id": 3, "label": "자기소개서", "status": "active" },
    { "id": 4, "label": "포트폴리오", "status": "todo" }
  ],
  "activeStep": {
    "id": 3,
    "title": "3. 자기소개서",
    "description": "나만의 경험과 강점을 잘 표현하는 자기소개서를 작성해보세요.",
    "percent": 40,
    "tasks": [
      { "icon": "📄", "title": "항목별 작성", "description": "기업별 자기소개서 항목을 작성하고 관리해보세요.", "meta": "2 / 5 항목 작성", "actionLabel": "작성하기 ›" }
    ],
    "tip": "자기소개서는 '나'의 이야기를 '기업이 원하는 방식'으로 전달하는 것이 중요해요!"
  },
  "readiness": { "percent": 45, "deltaFromLastWeek": 8 },
  "progressByCategory": [
    { "label": "이력서 작성", "percent": 70, "color": "green" },
    { "label": "자기소개서", "percent": 40, "color": "blue" }
  ],
  "recentResults": [
    { "id": "jr-001", "title": "신한은행 IT직무 자기소개서", "status": "임시저장", "statusColor": "gold", "date": "2025-05-20" }
  ],
  "tools": ["📄 자소서 템플릿", "🏢 기업 분석", "🎯 핵심 역량 찾기", "❓ 면접 질문 모음"]
}
```

---

## `assets/data/my_docs.json`

```json
{
  "categories": ["전체", "문서", "노트", "이력서", "포트폴리오", "기타"],
  "list": [
    {
      "id": "doc-001",
      "icon": "📄",
      "title": "신한은행 IT직무 자기소개서",
      "tags": [{ "label": "이력서", "color": "green" }, { "label": "IT/개발", "color": "blue" }],
      "date": "2025-05-20",
      "isFavorite": true
    }
  ],
  "stats": { "total": 32, "favoriteCount": 12, "recentCount": 5, "storageUsed": "128MB" },
  "categoryCounts": [
    { "label": "이력서", "color": "green", "count": 8 },
    { "label": "노트", "color": "gold", "count": 9 },
    { "label": "문서", "color": "blue", "count": 7 },
    { "label": "포트폴리오", "color": "purple", "count": 4 }
  ]
}
```

---

## `assets/data/words.json`

```json
{
  "list": [
    {
      "id": "word-001",
      "title": "Algorithm",
      "pos": "명사",
      "definition": "문제를 해결하기 위한 절차나 방법",
      "example": "Algorithm is the core of programming.",
      "category": "CS/IT",
      "categoryColor": "blue",
      "date": "2025-05-20",
      "isFavorite": true
    }
  ],
  "stats": { "total": 127, "learnedToday": 15, "mastered": 32, "masteredPercent": 25 },
  "todayQuiz": {
    "wordId": "word-001",
    "question": "Algorithm 의 의미로 가장 적절한 것은?",
    "options": ["알고리즘", "데이터베이스", "사용자 인터페이스", "운영체제"],
    "answerIndex": 0
  },
  "categoryCounts": [
    { "label": "CS/IT", "percent": 75, "color": "green", "count": 45 },
    { "label": "Java", "percent": 55, "color": "blue", "count": 28 }
  ]
}
```

---

## 향후 연계 계획

이 JSON을 실제로 fetch해서 화면에 렌더링하는 방법은 [API_GUIDE.md](API_GUIDE.md)에서 다룬다. `assets/js/api.js`, `assets/js/storage.js` 신설 여부는 공통 담당자(`feature/core`)가 판단한다. 페이지 팀은 임의로 fetch/localStorage 코드를 페이지 JS에 직접 작성하지 않는다 (중복 구현 방지, [DECISION_TREE.md](DECISION_TREE.md) 참고).
