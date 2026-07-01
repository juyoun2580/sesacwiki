# 👥 TEAM_GUIDE.md

# 🌱 프로젝트 목적

이 프로젝트는 단순히 기능을 구현하는 것이 아니라,

5명이 동시에 작업하더라도 충돌 없이 개발할 수 있는 구조를 만드는 것을 목표로 한다.

모든 작업은 CLAUDE.md를 기준으로 진행한다.

---

# 🌿 Git Branch

절대 main에서 작업하지 않는다.

브랜치 규칙

feature/core

feature/home

feature/wiki

feature/exam

feature/job

---

# 📌 작업 순서

모든 팀원은 아래 순서를 따른다.

1.
git pull

↓

2.
feature 브랜치 생성

↓

3.
개발

↓

4.
동작 확인

↓

5.
Commit

↓

6.
Push

↓

7.
Pull Request

↓

8.
Merge

---

# 📦 페이지 담당 규칙

각 팀원은

자신의 페이지만 수정한다.

예)

Home 담당

수정 가능

- home.css
- home.js
- home.json

수정 금지

- wiki.css
- exam.css
- my.css

공통 수정이 필요한 경우

팀원들과 먼저 협의한다.

---

# 🧩 Component Rule

새로운 UI를 만들기 전에

COMPONENTS.md를 먼저 확인한다.

새로운 Button

새로운 Card

새로운 Tag

새로운 Modal

새로운 Progress

를 만들지 않는다.

기존 Component를 재사용한다.

---

# 🎨 CSS Rule

공통 스타일

components.css

layout.css

base.css

variables.css

↓

페이지 스타일

pages/home.css

pages/wiki.css

pages/exam.css

pages/job.css

pages/my.css

새로운 CSS는

반드시

자신의 페이지 CSS에 작성한다.

공통 CSS 수정은 Sara와 협의한다.

---

# ⚙ JavaScript Rule

공통 기능

app.js

ui.js

↓

페이지 기능

pages/home.js

pages/wiki.js

pages/exam.js

pages/job.js

pages/my.js

공통 JS 수정은 Sara 또는 Team Lead와 협의한다.

---

# 📄 JSON Rule

데이터는 HTML에 작성하지 않는다.

반드시

data/

안에서 관리한다.

예)

home.json

wiki.json

exam.json

job.json

---

# 🤖 Claude Code Rule

작업 시작 전

반드시

CLAUDE.md

TEAM_GUIDE.md

COMPONENTS.md

를 먼저 읽는다.

기존 구조를 먼저 분석한다.

기존 Component를 먼저 사용한다.

새로운 파일은 꼭 필요한 경우에만 생성한다.

---

# 🚫 하지 말아야 할 것

❌ 다른 사람 페이지 수정

❌ 공통 CSS 임의 수정

❌ 공통 JS 임의 수정

❌ main 브랜치에서 작업

❌ inline style

❌ inline event

❌ 동일한 UI를 새로 구현

---

# ✅ 작업 완료 체크리스트

개발 완료 후

반드시 확인한다.

- Console Error 없음
- Warning 최소화
- Responsive 확인
- 기존 기능 정상 동작
- CLAUDE.md 규칙 준수
- Component 재사용 확인
- JSON 하드코딩 여부 확인

그 후 Pull Request를 생성한다.

---

# 🚀 개발 시작 체크리스트

작업을 시작하기 전에 아래 순서를 반드시 따른다.

1. main 브랜치 최신 내용 pull
2. feature 브랜치 생성
3. CLAUDE.md 읽기
4. TEAM_GUIDE.md 읽기
5. COMPONENTS.md 확인
6. 자신의 페이지 Prompt를 Claude Code에 전달
7. 담당 HTML/CSS/JS/JSON만 수정
8. 테스트 후 Commit → PR 생성