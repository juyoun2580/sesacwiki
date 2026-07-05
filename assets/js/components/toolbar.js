// ── 공용 Toolbar 컴포넌트 (SearchBox + SortPill 조립) ──
// 데이터를 전혀 모르는 순수 UI 컴포넌트다. 검색 input 이벤트 바인딩, 정렬 pill의
// 활성 상태 토글, 클릭/입력 시 onSearch(keyword)/onSort(sort) 호출까지만 담당한다.
// "무엇을 검색/정렬할지"(실제 필터링·재렌더링)는 호출하는 페이지(wiki.js, exam.js 등)가
// 콜백 안에서 처리한다 — 이 파일은 절대 페이지 데이터나 API를 참조하지 않는다.
//
// SearchBox(.search-box/.search-box__icon/.search-box__input)와
// SortPill(.sort-pills/.sort-pill)은 이미 assets/css/components.css의 공용 컴포넌트라
// 여기서는 그 둘을 조립하는 마크업만 만든다.
//
// 사용 예:
//   createToolbar({
//     container: '#wikiToolbar',
//     searchPlaceholder: '위키 검색하기',
//     sorts: ['최신순', '인기순', '난이도순'],
//     onSearch(keyword) { ... },
//     onSort(sort) { ... }
//   });
function createToolbar({ container, searchPlaceholder = '', sorts = [], onSearch, onSort } = {}) {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el) return null;

  const searchEl = el.querySelector('.toolbar__search');
  const actionsEl = el.querySelector('.toolbar__actions');

  let searchInput = null;
  if (searchEl) {
    searchEl.innerHTML = `
      <div class="search-box">
        <span class="icon icon--search search-box__icon" aria-hidden="true"></span>
        <input type="text" class="search-box__input" placeholder="${searchPlaceholder}" aria-label="${searchPlaceholder}">
      </div>`;
    searchInput = searchEl.querySelector('.search-box__input');
    searchInput.addEventListener('input', () => {
      if (typeof onSearch === 'function') onSearch(searchInput.value);
    });
  }

  let pillButtons = [];
  if (actionsEl && sorts.length) {
    actionsEl.innerHTML = `
      <div class="sort-pills">
        ${sorts.map((label, i) => `<button type="button" class="sort-pill${i === 0 ? ' sort-pill--active' : ''}" data-sort="${label}">${label}</button>`).join('')}
      </div>`;
    pillButtons = [...actionsEl.querySelectorAll('.sort-pill')];
    pillButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        pillButtons.forEach(b => b.classList.remove('sort-pill--active'));
        btn.classList.add('sort-pill--active');
        if (typeof onSort === 'function') onSort(btn.dataset.sort);
      });
    });
  }

  // "뒤로가기 시 이전 검색어/정렬 복원"처럼, 사용자 클릭 없이도 화면 상태를 프로그램적으로
  // 맞춰야 하는 페이지(wiki.js)를 위한 최소한의 컨트롤. 검색/정렬 "로직"이 아니라 표시값만
  // 다루므로 "Toolbar는 UI만 담당한다"는 원칙에서 벗어나지 않는다.
  return {
    setSearchValue(value) {
      if (searchInput) searchInput.value = value;
    },
    setActiveSort(label) {
      pillButtons.forEach(b => b.classList.toggle('sort-pill--active', b.dataset.sort === label));
    }
  };
}

// 모듈 번들러가 없는 프로젝트 관례대로 전역 함수로 노출한다(renderPagination()과 동일 패턴).
window.createToolbar = createToolbar;
