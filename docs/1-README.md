# docs/

이 프로젝트의 팀 협업 문서 모음이다. 새로운 작업을 시작하기 전에 아래 순서로 읽는다.

| 문서 | 설명 |
|---|---|
| [../CLAUDE.md](../CLAUDE.md) | AI 개발 규칙. **프로젝트 루트에 위치**한다 — Claude Code가 세션 시작 시 자동으로 읽어 규칙을 적용하는 파일이라 `docs/`로 옮기지 않았다. |
| [TEAM_GUIDE.md](TEAM_GUIDE.md) | 팀 작업 규칙 (Git 브랜치, 작업 순서, 하지 말아야 할 것, 완료 체크리스트) |
| [COMPONENTS.md](COMPONENTS.md) | 컴포넌트 표준 (재사용 가능한 UI 24종의 구조/클래스/modifier/재사용 규칙) |
| [PAGES.md](PAGES.md) | 페이지 담당 (9개 페이지별 담당 CSS/JS/JSON/Component/Layout) |
| [WORK_ORDER.md](WORK_ORDER.md) | 작업 분담 (5인 역할별 수정 가능/금지 파일, Git 브랜치, PR 순서) |
| [JSON_GUIDE.md](JSON_GUIDE.md) | JSON 구조 및 네이밍 표준 (필드명 규칙, 파일별 스키마) |
| [API_GUIDE.md](API_GUIDE.md) | JSON을 JS에서 사용하는 방법 (fetch 위치, 함수 네이밍, 렌더링 패턴) |
| [DECISION_TREE.md](DECISION_TREE.md) | 새 기능 추가 시 "어디를 수정해야 하는가" 의사결정 흐름도 |

## 처음 시작하는 팀원이라면

1. [../CLAUDE.md](../CLAUDE.md)와 [TEAM_GUIDE.md](TEAM_GUIDE.md)로 전체 규칙을 파악한다.
2. [WORK_ORDER.md](WORK_ORDER.md)에서 자신이 맡은 팀의 "수정 가능한 파일" 범위를 확인한다.
3. [PAGES.md](PAGES.md)에서 자신이 담당한 페이지의 CSS/JS/JSON을 확인한다.
4. 새 UI가 필요하면 작업 전에 [COMPONENTS.md](COMPONENTS.md)를 먼저 확인한다.
5. "이거 어디에 써야 하지?" 싶을 때는 [DECISION_TREE.md](DECISION_TREE.md)를 따라간다.

## 프로젝트 구조 요약

```
/
├── index.html              — 9개 page(section)를 담은 단일 SPA 엔트리
├── assets/
│   ├── css/                — reset / variables / base / layout / components + pages/*.css
│   ├── js/                 — app / ui / toast / modal (공통) + pages/*.js (페이지 전용)
│   └── data/                — *.json (아직 생성 전, JSON_GUIDE.md 참고)
├── docs/                    — 이 폴더
└── CLAUDE.md                — 프로젝트 루트 (AI 개발 규칙, 자동 로드됨)
```
