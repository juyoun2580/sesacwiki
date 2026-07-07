// ── Global Search Dropdown — Header의 #global-search 입력창 + 그 아래 드롭다운을 연결한다 ──
// "무엇을 검색할지"(Wiki/Exam/Word 데이터 접근)는 SEARCH_PROVIDERS 배열 하나에만 몰아뒀다.
// 나중에 정적 JSON 대신 Supabase 검색(예: RPC/full-text search)으로 바꾸려면 해당 provider의
// search() 함수 본문만 교체하면 되고, 디바운스/렌더링/키보드 처리는 전혀 손댈 필요가 없다.
// 페이지 데이터를 직접 모르는 순수 UI 컴포넌트라는 점에서 createToolbar()/renderPagination()과
// 같은 설계 원칙을 따른다.

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_RESULT_LIMIT = 3;

function searchTextMatches(text, query) {
  return typeof text === 'string' && text.toLowerCase().includes(query);
}

// 정적 JSON은 wiki.js/exam.js와 동일한 "Promise 캐싱" 패턴을 그대로 따른다(DATA_GUIDE.md 3장).
let wikiSearchIndexPromise = null;
function loadWikiSearchIndex() {
  if (!wikiSearchIndexPromise) {
    wikiSearchIndexPromise = fetch('/assets/data/wiki-data.json').then((res) => res.json());
  }
  return wikiSearchIndexPromise;
}

let examSearchIndexPromise = null;
function loadExamSearchIndex() {
  if (!examSearchIndexPromise) {
    examSearchIndexPromise = fetch('/assets/data/exam.json')
      .then((res) => res.json())
      .then((data) => data.list || []);
  }
  return examSearchIndexPromise;
}

// key: 렌더링 시 구분용 식별자. label: 섹션 제목. icon: 공용 Icon System 접미사(icon--{icon}).
// search(query): 이미 소문자로 변환된 query를 받아 { title, href } 배열(최대 SEARCH_RESULT_LIMIT개)을 돌려준다.
// Word처럼 로그인 여부에 따라 결과가 달라지는 provider는 함수 내부에서 직접 처리한다.
const SEARCH_PROVIDERS = [
  {
    key: 'wiki',
    label: 'Wiki',
    icon: 'book',
    async search(query) {
      const list = await loadWikiSearchIndex();
      return list
        .filter((item) => searchTextMatches(item.title, query) || searchTextMatches(item.description, query))
        .slice(0, SEARCH_RESULT_LIMIT)
        .map((item) => ({ title: item.title, href: `/pages/wiki/detail.html?id=${encodeURIComponent(item.id)}` }));
    },
  },
  {
    key: 'exam',
    label: 'Exam',
    icon: 'check-square',
    async search(query) {
      const list = await loadExamSearchIndex();
      return list
        .filter((exam) => searchTextMatches(exam.title, query) || searchTextMatches(exam.description, query))
        .slice(0, SEARCH_RESULT_LIMIT)
        .map((exam) => ({ title: exam.title, href: `/pages/exam/quiz.html?id=${encodeURIComponent(exam.id)}` }));
    },
  },
  {
    key: 'word',
    label: 'Word',
    icon: 'flag',
    async search(query) {
      // 비로그인 상태면 저장한 단어 자체가 없으므로 조용히 빈 배열을 돌려준다
      // (getLocalExamAttempts 등 이 코드베이스의 다른 로그인 필요 기능과 동일한 관례).
      if (typeof isLoggedIn !== 'function' || !isLoggedIn()) return [];
      try {
        const words = await api.getWords();
        return words
          .filter((w) => searchTextMatches(w.term, query) || searchTextMatches(w.definition, query))
          .slice(0, SEARCH_RESULT_LIMIT)
          .map((w) => ({ title: w.term, href: '/pages/my/words.html' }));
      } catch (err) {
        console.error(err);
        return [];
      }
    },
  },
];

function renderSearchSection(provider, results) {
  if (!results.length) return '';
  const items = results
    .map((r) => `<a class="related-item" href="${r.href}"><span class="related-item__title">${escapeHtml(r.title)}</span></a>`)
    .join('');
  return `
    <div class="search-dropdown__section">
      <p class="search-dropdown__section-title"><span class="icon icon--${provider.icon}" aria-hidden="true"></span>${provider.label}</p>
      <div class="search-dropdown__list">${items}</div>
    </div>`;
}

// 검색어 없음 / 결과 없음 / 결과 있음 3가지 상태를 전부 이 함수 하나에서 그린다.
function renderSearchDropdown(resultsEl, query, resultsByProvider) {
  if (!query) {
    resultsEl.innerHTML = '<p class="search-dropdown__hint">검색어를 입력하세요</p>';
    return;
  }

  const sections = SEARCH_PROVIDERS
    .map((provider, i) => renderSearchSection(provider, resultsByProvider[i] || []))
    .filter(Boolean);

  if (!sections.length) {
    resultsEl.innerHTML = '<p class="search-dropdown__empty">검색 결과가 없습니다.</p>';
    return;
  }

  resultsEl.innerHTML = sections.join('<div class="divider"></div>')
    // + `<div class="search-dropdown__footer">
    //      <button type="button" class="section-title__link" data-action="toast" data-message="검색 결과 페이지는 아직 준비 중이에요!">전체 결과 보기 →</button>
    //    </div>`;
}

function initGlobalSearch({
  inputId = 'global-search',
  dropdownId = 'global-search-dropdown',
  resultsId = 'global-search-results',
} = {}) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);
  const resultsEl = document.getElementById(resultsId);
  if (!input || !dropdown || !resultsEl) return;

  let debounceTimer = null;
  let searchRequestId = 0;
  let latestResults = []; // 화면에 실제로 그려진, 표시 순서 그대로의 결과 — Enter 이동에 사용

  const openDropdown = () => { dropdown.hidden = false; };
  const closeDropdown = () => { dropdown.hidden = true; };

  async function runSearch(rawQuery) {
    const requestId = ++searchRequestId;
    const query = rawQuery.trim().toLowerCase();

    if (!query) {
      latestResults = [];
      renderSearchDropdown(resultsEl, '', []);
      return;
    }

    const resultsByProvider = await Promise.all(SEARCH_PROVIDERS.map((p) => p.search(query).catch(() => [])));
    if (requestId !== searchRequestId) return; // 이후 입력으로 이미 새 검색이 시작됐으면 이 결과는 버린다

    latestResults = resultsByProvider.flat();
    renderSearchDropdown(resultsEl, query, resultsByProvider);
  }

  input.addEventListener('focus', () => {
    openDropdown();
    if (!input.value.trim()) renderSearchDropdown(resultsEl, '', []);
  });

  input.addEventListener('input', () => {
    openDropdown();
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => runSearch(input.value), SEARCH_DEBOUNCE_MS);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDropdown();
      input.blur();
    } else if (e.key === 'Enter' && latestResults.length) {
      e.preventDefault();
      location.href = latestResults[0].href;
    }
  });

  document.addEventListener('click', (e) => {
    if (dropdown.hidden) return;
    if (input.contains(e.target) || dropdown.contains(e.target)) return;
    closeDropdown();
  });
}

// 모듈 번들러가 없는 프로젝트 관례대로 전역 함수로 노출한다(createToolbar()와 동일 패턴).
window.initGlobalSearch = initGlobalSearch;
