# API_GUIDE.md

`assets/data/*.json`에 정의된 데이터를 JS에서 어떻게 불러와 화면에 그릴지에 대한 표준이다. [JSON_GUIDE.md](JSON_GUIDE.md)가 데이터의 "모양"을 정의한다면, 이 문서는 그 데이터를 "어떻게 가져와서 어떻게 쓰는지"를 정의한다.

> 이 문서는 **설계 문서**다. `assets/js/api.js`는 아직 생성되지 않았다. 실제로 fetch 기반 렌더링이 필요해지는 시점에 공통 담당자(`feature/core`)가 이 규칙에 따라 `assets/js/api.js`를 만든다. 그 전까지는 지금처럼 `index.html`에 정적 마크업으로 데이터를 유지해도 된다.

---

## 왜 필요한가

지금은 모든 페이지 데이터가 `index.html`에 하드코딩되어 있다. 데이터가 JSON으로 분리되기 시작하면, "누가 fetch하고 누가 렌더링하는가"를 페이지마다 다르게 구현하면 코드 중복과 충돌이 생긴다. `api.js`는 fetch를 **한 곳**에서만 담당하는 공용 레이어다.

---

## 소유 규칙

- `assets/js/api.js`는 공통 담당자(`feature/core`) 소유다. 페이지 팀은 이 파일을 직접 수정하지 않는다.
- 새 JSON 파일을 추가했다면, 그 파일을 읽어오는 함수(아래 네이밍 규칙 참고)를 `api.js`에 추가해달라고 공통 담당자에게 요청한다.
- 실제로 데이터를 DOM에 그리는 렌더링 함수는 각 페이지 담당 JS(`assets/js/pages/*.js`)에 작성한다. `api.js`는 데이터를 "가져오기"만 하고, "그리기"는 하지 않는다.

---

## 함수 네이밍 규칙

| 패턴 | 용도 | 예시 |
|---|---|---|
| `get{도메인}List()` | 목록 데이터 조회 | `getWikiList()`, `getExamList()` |
| `get{도메인}ById(id)` | 단일 항목 조회 | `getWikiById('wiki-001')` |
| `get{도메인}Stats()` | 통계/요약 데이터 조회 | `getHomeStats()`, `getExamMyStats()` |

모든 함수는 `assets/js/api.js`에 정의하고, `window` 전역이 아니라 페이지 JS에서 직접 호출하는 일반 함수로 선언한다 (기존 `toast()`, `ts()`처럼 전역 함수 패턴을 그대로 따른다 — 프로젝트에 모듈 번들러가 없으므로 `<script>` 로드 순서에 의존한다).

---

## 반환 형식

모든 `get*` 함수는 **Promise**를 반환한다 (내부적으로 `fetch` 사용). 실패 시에도 페이지가 깨지지 않도록 최소한의 에러 처리를 포함한다.

```js
// assets/js/api.js (예시 — 아직 실제로 존재하지 않음)

async function getWikiList() {
  const res = await fetch('assets/data/wiki.json');
  if (!res.ok) throw new Error('위키 데이터를 불러오지 못했습니다.');
  const data = await res.json();
  return data.list;
}

async function getWikiById(id) {
  const res = await fetch('assets/data/wiki.json');
  const data = await res.json();
  return data.detail[id] ?? null;
}
```

---

## 페이지 JS에서 사용하는 방법

페이지 담당 JS(`assets/js/pages/*.js`)는 `api.js`의 함수를 호출해 데이터를 받고, 직접 DOM을 그린다. `api.js`를 거치지 않고 페이지 JS에서 직접 `fetch()`를 호출하지 않는다 (중복 구현 방지).

```js
// assets/js/pages/wiki.js (예시)

async function renderWikiList() {
  const list = await getWikiList();
  const ul = document.querySelector('.wiki-row-list');
  ul.innerHTML = list.map(item => `
    <li>
      <button type="button" class="wiki-row" data-goto="detail" data-id="${item.id}">
        <span class="wiki-row__icon" aria-hidden="true">${item.icon}</span>
        <span class="wiki-row__body">
          <span class="wiki-row__title">${item.title}</span>
          <span class="wiki-row__desc">${item.description}</span>
        </span>
      </button>
    </li>
  `).join('');
}
```

- 렌더링 함수 이름은 `render{페이지}{영역}()` 패턴을 권장한다 (`renderWikiList`, `renderHomeStats` 등).
- HTML 문자열을 직접 조립할 때도 [JSON_GUIDE.md](JSON_GUIDE.md) 규칙 9(HTML 작성 금지)는 JSON 값 자체에 적용되는 것이며, 렌더링 코드에서 템플릿 문자열을 쓰는 것은 허용된다.
- `data-toast-override`, `data-action` 같은 기존 위임 패턴([COMPONENTS.md](COMPONENTS.md) 참고)은 동적으로 그려진 요소에도 동일하게 적용되므로, 렌더링 후 별도 이벤트 바인딩 없이도 `assets/js/ui.js` / `assets/js/modal.js` / `assets/js/toast.js`가 정상 동작한다. 단, 이 파일들의 `querySelectorAll(...).forEach(...)` 초기화 코드는 **페이지 로드 시점 1회만 DOM을 스캔**하므로, fetch 이후 동적으로 추가된 요소에는 이벤트가 자동으로 붙지 않는다. 이 문제가 실제로 발생하면 임의로 페이지 JS에 이벤트 위임 코드를 새로 작성하지 말고 공통 담당자와 함께 `ui.js`의 초기화 방식(예: 이벤트 위임을 `document` 레벨로 변경)을 개선한다.

---

## 상태 저장이 필요한 경우

즐겨찾기 토글, 하이라이트, 단어장 등 **사용자가 변경한 상태**는 `api.js`가 아니라 `assets/js/storage.js`(신설 예정, 공통 담당자 소유)가 담당한다. `localStorage`에 저장하고, 새로고침 후에도 유지하는 역할이다. 페이지 팀은 상태 저장 로직을 임의로 페이지 JS에 작성하지 않는다.

```js
// assets/js/storage.js (예시 — 아직 실제로 존재하지 않음)
function isFavorited(id) { /* localStorage 조회 */ }
function toggleFavorite(id) { /* localStorage 갱신 */ }
```

---

## 에러 처리 원칙

- JSON fetch가 실패해도 페이지 전체가 깨지지 않아야 한다. 실패 시 빈 목록 또는 안내 문구를 보여준다.
- 콘솔에는 에러를 남기되(`console.error`), 사용자에게는 기존 `toast()` 컴포넌트로 짧은 안내만 띄운다. 새로운 에러 UI를 만들지 않는다.

```js
try {
  const list = await getWikiList();
  renderWikiList(list);
} catch (e) {
  console.error(e);
  toast('데이터를 불러오지 못했어요. 다시 시도해주세요.');
}
```

---

## 요약

1. fetch는 `assets/js/api.js`에서만 한다 (공통 담당자 소유).
2. 렌더링은 각 페이지의 `assets/js/pages/*.js`에서 한다 (페이지 담당자 소유).
3. 사용자 상태 저장은 `assets/js/storage.js`에서만 한다 (공통 담당자 소유).
4. 함수 네이밍은 `get{도메인}List/ById/Stats()`, `render{페이지}{영역}()` 패턴을 따른다.
5. 이 셋 중 어디에도 속하지 않는 새로운 데이터 흐름이 필요하면 [DECISION_TREE.md](DECISION_TREE.md) 3번(JS 인터랙션)·4번(데이터) 흐름을 따라 판단한다.
