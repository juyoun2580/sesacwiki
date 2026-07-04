# DEVELOPMENT_GUIDE.md

팀 협업 규칙과 페이지별 작업 범위를 하나로 정리한 문서다. 기존 `TEAM_GUIDE.md`(협업 원칙)와 `WORK_ORDER.md`(파일별 작업 지시서)를 통합했다 — 원본은 [docs/archive/](archive/)에 보관되어 있다.

> 프로젝트 구조 자체는 [ARCHITECTURE.md](ARCHITECTURE.md), 컴포넌트는 [COMPONENT_GUIDE.md](COMPONENT_GUIDE.md), 데이터는 [DATA_GUIDE.md](DATA_GUIDE.md) 참고. 이 문서는 "누가 어디를 어떤 순서로 작업하는가"만 다룬다.

---

## 1. Git Workflow

```
main
  └─ develop
       ├─ feature/home
       ├─ feature/auth
       ├─ feature/wiki
       ├─ feature/exam
       ├─ feature/handbook
       └─ feature/my
```

- `main`: 배포 브랜치. 직접 commit 금지, `develop`에서만 merge된다.
- `develop`: 통합 브랜치. 모든 `feature/*`는 여기서 분기하고 여기로 PR을 보낸다.
- `feature/*`: 담당 영역별 작업 브랜치. 이름은 담당 화면 그룹과 1:1로 맞춘다.

과거 `feature/core`(공통 담당자 전용 브랜치)는 더 이상 사용하지 않는다. 공통 파일은 2장의 "공용 자원" 규칙을 따른다.

### 브랜치 작업 순서

1. `git checkout develop && git pull origin develop`
2. `git checkout -b feature/{담당영역}` (반드시 최신 `develop`에서 분기)
3. 개발
4. 로컬에서 동작 확인 (4장 체크리스트)
5. `git add` → `git commit` → `git push`
6. `develop`을 대상으로 Pull Request 생성
7. 리뷰 후 `develop`에 merge

`main`으로의 반영은 `develop`이 안정화된 시점에 별도로 진행한다(개별 feature 브랜치가 `main`을 직접 대상으로 PR을 열지 않는다).

---

## 2. 담당 영역 (페이지 폴더 기준)

| 브랜치 | 담당 폴더/화면 | 전용 CSS | 전용 JS | 데이터 |
|---|---|---|---|---|
| `feature/home` | `index.html` | `home.css` | `home.js` | `home.json`, (참고) `wiki.json`, `wiki-data.json` |
| `feature/auth` | `pages/auth/` (login, signup) | `auth.css` | `auth.js` | Supabase Auth |
| `feature/wiki` | `pages/wiki/` (index, detail) | `wiki.css` | `wiki.js`, `highlight.js` | `wiki-data.json`, Supabase(`wiki_bookmarks`, `wiki_recent_views`, `wiki_highlights`) |
| `feature/exam` | `pages/exam/` (index, quiz) | `exam.css` | `exam.js`, `quiz.js` | `exam.json`, `questions/*.json`, Supabase(`exam_attempts`) |
| `feature/handbook` | `pages/handbook/` (index, resume) | `job.css`, `resume.css` | `job.js`, `job-features.js`, `resume.js` | localStorage(`job_data`, `job_features`), Supabase(`job_progress`) |
| `feature/my` | `pages/my/` (index, favorites, words, mypage, edit) | `my.css`, `mypage.css` | `mypage.js` | Supabase(`profiles`, `words`, `badges`, `quiz_checkpoints`) |

각 브랜치는 **자신의 페이지 폴더 안 화면과, 위 표에 명시된 CSS/JS/데이터만** 수정한다. 다른 팀의 폴더나 파일은 수정하지 않는다.

### 교차 의존 — 작업 전 반드시 확인

- `assets/js/pages/quiz.js`는 `feature/exam` 소유이지만 `pages/my/words.html`(단어 퀴즈)도 이 파일을 로드한다. 변경 전 `feature/my` 담당자와 영향 범위를 확인한다.
- `assets/js/pages/mypage.js`는 `feature/my` 소유이지만 `pages/wiki/detail.html`도 이 파일을 로드한다(저장한 단어 관련 로직 공유). 변경 전 `feature/wiki` 담당자와 확인한다.
- `pages/handbook/resume.html`은 `job.css`가 아니라 `my.css`를 사용한다. `feature/my`가 `my.css`를 변경하면 `resume.html` 렌더링에도 영향을 줄 수 있다.
- localStorage 키 `job_features`는 `job.js`/`job-features.js`/`home.js` 세 파일이 공유한다. `feature/handbook`이 이 키의 구조를 바꾸면 `feature/home`의 대시보드 카드도 함께 확인해야 한다.

(전체 교차 의존 목록은 [ARCHITECTURE.md](ARCHITECTURE.md) 6장 참고)

---

## 3. 공용 자원 (특정 브랜치 소유가 아님)

다음 파일은 모든 화면에 영향을 주므로 특정 `feature/*` 브랜치가 단독으로 소유하지 않는다. 수정이 필요하면 **별도의 작은 PR로 분리하고, 영향받는 팀에게 리뷰를 요청한 뒤 develop에 먼저 merge**한다.

- `components/header.html`, `components/nav.html`
- `assets/js/components/header.js`, `nav.js`
- `assets/js/app.js`, `ui.js`, `modal.js`, `toast.js`, `api.js`, `auth.js`, `supabase-client.js`
- `assets/css/reset.css`, `variables.css`, `base.css`, `layout.css`, `components.css`
- `supabase/schema.sql` (테이블을 추가/변경하면 관련된 모든 브랜치의 `api.js` 사용부에 영향)

새 공용 컴포넌트/토큰이 필요하면 직접 만들기 전에 [COMPONENT_GUIDE.md](COMPONENT_GUIDE.md)의 "새 컴포넌트 추가 조건"을 먼저 확인한다.

---

## 4. 작업 시작 전 체크리스트

1. `develop` 최신 상태로 `git pull`
2. `feature/{담당영역}` 브랜치 생성 (또는 기존 브랜치로 checkout)
3. [CLAUDE.md](../CLAUDE.md), [ARCHITECTURE.md](ARCHITECTURE.md), [COMPONENT_GUIDE.md](COMPONENT_GUIDE.md) 확인
4. 2장 표에서 자신의 담당 폴더/파일 범위 확인
5. 새 UI가 필요하면 [COMPONENT_GUIDE.md](COMPONENT_GUIDE.md)에서 재사용 가능한 컴포넌트 먼저 확인
6. 새 데이터가 필요하면 [DATA_GUIDE.md](DATA_GUIDE.md)에서 기존 JSON/Supabase 스키마로 표현 가능한지 확인

## 5. Pull Request 전 체크리스트

- [ ] Console Error 0
- [ ] Warning 최소화
- [ ] Responsive 확인 (모바일 폭에서 햄버거 메뉴/사이드바 정상 동작)
- [ ] 기존 기능 정상 동작 (특히 교차 의존 파일을 건드렸다면 영향받는 화면 재확인)
- [ ] 담당 폴더 밖의 HTML/CSS/JS를 건드리지 않았는지 확인
- [ ] 신규 UI를 만들었다면 기존 컴포넌트로 불가능했던 이유를 PR 설명에 기록
- [ ] `develop`을 대상으로 PR 생성 (main 아님)

## 6. 하지 말아야 할 것

- ❌ `main`/`develop`에서 직접 작업
- ❌ 다른 담당 폴더(`pages/*`)의 HTML 수정
- ❌ 3장의 공용 자원을 협의 없이 임의로 수정
- ❌ inline style / inline event
- ❌ 기존 컴포넌트로 표현 가능한 UI를 새로 구현
