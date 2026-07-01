# CLAUDE.md

# 🌱 Project Goal

이 프로젝트의 목표는 단순히 HTML을 만드는 것이 아니라,
팀이 함께 개발할 수 있는 유지보수 가능한 구조를 만드는 것이다.

우선순위는 다음과 같다.

1. 구조
2. 재사용성
3. 일관성
4. 기능 구현

새로운 기능보다 기존 구조를 활용하는 것을 우선한다.

---

# 📁 Project Structure

```
/
├── index.html
├── assets
│   ├── css
│   │   ├── reset.css
│   │   ├── variables.css
│   │   ├── base.css
│   │   ├── layout.css
│   │   ├── components.css
│   │   └── pages/
│   ├── js
│   │   ├── app.js
│   │   ├── api.js
│   │   ├── storage.js
│   │   ├── ui.js
│   │   └── pages/
│   └── data
│       └── *.json
```

---

# 🏗 HTML Rules

- HTML5 Semantic Tag를 사용한다.
- header, nav, main, section, article, aside, footer를 적극 활용한다.
- 의미 없는 div 사용을 최소화한다.
- HTML 안에 CSS를 작성하지 않는다.
- HTML 안에 JavaScript를 작성하지 않는다.
- inline style을 사용하지 않는다.
- inline event(onclick 등)를 사용하지 않는다.

---

# 🎨 CSS Rules

CSS는 역할별로 분리한다.

- reset.css
- variables.css
- base.css
- layout.css
- components.css
- pages/

규칙

- BEM 네이밍 사용
- Design Token 사용
- 색상, radius, shadow, spacing은 variables.css를 통해 관리
- 하드코딩 최소화

---

# ⚙ JavaScript Rules

역할별로 파일을 분리한다.

예시

- app.js
- api.js
- storage.js
- ui.js
- pages/*.js

DOM 조작과 비즈니스 로직을 분리한다.

---

# 🧩 Component Rules

UI는 반드시 재사용 가능한 형태로 만든다.

기존 Component를 먼저 확인한다.

재사용 우선

- Button
- Card
- Badge
- Tag
- Progress
- Modal
- Toast

동일한 UI를 두 번 구현하지 않는다.

새로운 Component가 필요한 경우
기존 Component를 사용할 수 없는 이유를 먼저 설명한다.

---

# 📦 Data Rules

화면 데이터는 가능한 JSON으로 관리한다.

하드코딩을 최소화한다.

---

# 🤖 Claude Workflow

새로운 기능을 구현하기 전에 반드시 다음 순서를 따른다.

1. 프로젝트 구조 분석
2. 기존 Component 확인
3. 기존 CSS 재사용 여부 확인
4. 기존 JavaScript 재사용 여부 확인
5. 새로운 파일이 정말 필요한지 검토
6. 필요한 경우에만 새로운 Component 생성

기존 구조를 수정하는 것이
새로운 구조를 만드는 것보다 우선이다.

---

# 🌿 Git Rules

- main 브랜치에 직접 commit하지 않는다.
- 작업마다 feature 브랜치를 생성한다.
- Pull Request 후 merge한다.

---

# ✅ Before Pull Request

PR 전에 반드시 확인한다.

- Console Error 0
- Warning 최소화
- HTML Validation
- CSS Validation
- Responsive 확인
- 기존 기능 정상 동작 확

---

# 🚀 Deploy Rule

모든 작업(코드 수정, 파일 변경 등)이 끝난 후 **반드시** 프로덕션 배포를 실행한다.

```bash
vercel deploy --prod --yes
```

- 작업 완료 후 확인 없이 즉시 실행한다.
- 배포 후 https://sesacwiki.vercel.app 에서 반영 여부를 확인한다.

---

# AI Development Principle

Claude는 새로운 코드를 작성하는 것보다
기존 구조를 이해하고 재사용하는 것을 우선한다.

새로운 파일이나 Component를 만들기 전에
항상 기존 구현을 먼저 검토한다.

구현보다 설계를 우선하며,
프로젝트의 일관성과 유지보수성을 최우선으로 고려한다.