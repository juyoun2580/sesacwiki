// ── 공용 Pagination 컴포넌트 ──
// 데이터를 전혀 모르는 순수 UI 컴포넌트다. 페이지 버튼 생성 / 이전·이전 버튼 /
// 클릭 시 onChange(page) 호출까지만 담당한다. "지금 몇 페이지인지", "전체 개수를
// 어떻게 구하는지", "페이지가 바뀌면 무엇을 다시 그릴지"는 전부 호출하는 쪽
// (wiki.js, mypage.js 등)이 계산해서 넘겨준다 — 이 파일은 그 계산 결과만 그린다.
//
// 사용 예:
//   renderPagination({
//     container: '#wikiPagination',
//     totalCount: sorted.length,
//     currentPage: wikiState.page,
//     pageSize: WIKI_PAGE_SIZE,
//     onChange(page) {
//       wikiState.page = page;
//       renderWikiList();
//     }
//   });
function renderPagination({ container, totalCount, currentPage, pageSize, onChange }) {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (!el) return;

  el.innerHTML = '';
  // 전체 개수가 0이면(검색 결과 없음 등) 페이지네이션 자체를 표시하지 않는다
  // (기존 wiki.js/renderWikiPagination의 동작과 동일).
  if (!totalCount) return;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const page = Math.min(Math.max(1, currentPage || 1), totalPages);

  const makeBtn = (targetPage, opts = {}) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pagination__btn' + (opts.active ? ' pagination__btn--active' : '');
    if (opts.ariaLabel) btn.setAttribute('aria-label', opts.ariaLabel);
    if (opts.active) btn.setAttribute('aria-current', 'page');
    btn.disabled = !!opts.disabled;
    if (opts.icon) {
      btn.innerHTML = `<span class="icon icon--${opts.icon}" aria-hidden="true"></span>`;
    } else {
      btn.textContent = String(opts.label);
    }
    btn.addEventListener('click', () => {
      if (typeof onChange === 'function') onChange(targetPage);
    });
    return btn;
  };

  el.appendChild(makeBtn(page - 1, { icon: 'chevron-left', ariaLabel: '이전 페이지', disabled: page <= 1 }));
  for (let p = 1; p <= totalPages; p++) {
    el.appendChild(makeBtn(p, { label: p, active: p === page }));
  }
  el.appendChild(makeBtn(page + 1, { icon: 'chevron-right', ariaLabel: '다음 페이지', disabled: page >= totalPages }));
}

// 모듈 번들러가 없는 프로젝트 관례대로 전역 함수로 노출한다(toast()/api.* 등과 동일 패턴).
window.renderPagination = renderPagination;
