// ══════════════════════════════════════════════
//  Wiki 목록 렌더링 — assets/data/wiki-data.json을 읽어
//  검색/카테고리 필터/정렬/페이지네이션을 처리한다.
// ══════════════════════════════════════════════

const WIKI_PAGE_SIZE = 5;

const WIKI_CATEGORY_ICON = {
  'SQL': '🗄️',
  'Java': '☕',
  'HTML': '🌐',
  'CSS': '🎨',
  'JavaScript': '⚡',
  'Git': '🔀',
  'Salesforce': '☁️',
  'CS 개념': '💡',
  '면접 개념': '🎤',
  '취업 가이드': '💼'
};

const WIKI_CATEGORY_TAG_COLOR = {
  'SQL': 'green',
  'Java': 'orange',
  'HTML': 'blue',
  'CSS': 'blue',
  'JavaScript': 'gold',
  'Git': 'gray',
  'Salesforce': 'purple',
  'CS 개념': 'coral',
  '면접 개념': 'coral',
  '취업 가이드': 'gold'
};

const WIKI_LEVEL_ORDER = { '입문': 0, '기초': 1, '중급': 2 };
const WIKI_RETURN_STATE_KEY = 'wikiReturnState';

let wikiAllItems = [];
let wikiState = {
  category: '전체',
  search: '',
  sort: 'latest',
  page: 1
};

function wikiFilterItems() {
  const query = wikiState.search.trim().toLowerCase();
  return wikiAllItems.filter(item => {
    const matchesCategory = wikiState.category === '전체' || item.category === wikiState.category;
    const matchesSearch = !query ||
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });
}

function wikiSortItems(items) {
  const sorted = [...items];
  if (wikiState.sort === 'popular') {
    sorted.sort((a, b) => b.views - a.views);
  } else if (wikiState.sort === 'level') {
    sorted.sort((a, b) => WIKI_LEVEL_ORDER[a.level] - WIKI_LEVEL_ORDER[b.level]);
  }
  // 'latest'는 wiki-data.json에 등록된 순서를 그대로 사용한다.
  return sorted;
}

function buildWikiFavoriteStar(item) {
  const star = document.createElement('span');
  star.className = 'favorite-star' + (item.bookmarked ? ' favorite-star--on' : '');
  star.setAttribute('role', 'button');
  star.setAttribute('tabindex', '0');
  star.setAttribute('aria-pressed', String(item.bookmarked));
  star.setAttribute('aria-label', '즐겨찾기');
  star.textContent = '★';
  // ui.js는 defer 스크립트 실행 시점에 존재하는 .favorite-star에만 클릭을 바인딩한다.
  // fetch 이후 동적으로 추가되는 이 별은 토글 로직 재구현 없이 공통 함수 ts()만 연결한다.
  star.addEventListener('click', e => {
    // 이 별은 <a class="wiki-row"> 안에 있어서 stopPropagation만으로는
    // 앵커의 기본 이동(href) 동작을 막지 못해 상세 페이지로 이동해버린다.
    e.preventDefault();
    e.stopPropagation();
    ts(star);
    item.bookmarked = star.classList.contains('favorite-star--on');
    renderWikiFavoritesPanel();
  });
  return star;
}

function buildWikiRow(item) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.className = 'wiki-row';
  a.href = `detail.html?id=${encodeURIComponent(item.id)}`;
  // 상세 페이지의 "뒤로가기"가 목록 필터/페이지/스크롤 위치를 그대로 복원할 수 있도록,
  // 상세로 넘어가기 직전 상태를 저장해둔다.
  a.addEventListener('click', () => {
    sessionStorage.setItem(WIKI_RETURN_STATE_KEY, JSON.stringify({
      category: wikiState.category,
      search: wikiState.search,
      sort: wikiState.sort,
      page: wikiState.page,
      scrollY: window.scrollY
    }));
  });

  const icon = document.createElement('span');
  icon.className = 'wiki-row__icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = WIKI_CATEGORY_ICON[item.category] || '📄';

  const title = document.createElement('span');
  title.className = 'wiki-row__title';
  title.textContent = item.title;

  const desc = document.createElement('span');
  desc.className = 'wiki-row__desc';
  desc.textContent = item.description;

  const body = document.createElement('span');
  body.className = 'wiki-row__body';
  body.append(title, desc);

  const tag = document.createElement('span');
  tag.className = `tag tag--${WIKI_CATEGORY_TAG_COLOR[item.category] || 'gray'}`;
  tag.textContent = item.category;

  const level = document.createElement('span');
  level.className = 'wiki-row__level';
  level.textContent = item.level;

  const time = document.createElement('span');
  time.className = 'wiki-row__time';
  time.textContent = item.time;

  const percent = document.createElement('span');
  percent.className = 'wiki-row__percent';
  percent.textContent = `${item.progress}%`;

  const meta = document.createElement('span');
  meta.className = 'wiki-row__meta';
  meta.append(tag, level, time, percent, buildWikiFavoriteStar(item));

  a.append(icon, body, meta);
  li.appendChild(a);
  return li;
}

function renderWikiEmptyState(listEl) {
  const li = document.createElement('li');
  const p = document.createElement('p');
  p.className = 'wiki-empty';
  p.textContent = '조건에 맞는 위키 문서가 없습니다.';
  li.appendChild(p);
  listEl.appendChild(li);
}

function renderWikiPagination(totalItems) {
  const paginationEl = document.getElementById('wikiPagination');
  paginationEl.innerHTML = '';
  const totalPages = Math.max(1, Math.ceil(totalItems / WIKI_PAGE_SIZE));
  if (wikiState.page > totalPages) wikiState.page = totalPages;
  if (totalItems === 0) return;

  const makeBtn = (label, page, opts = {}) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pagination__btn' + (opts.active ? ' pagination__btn--active' : '');
    if (opts.ariaLabel) btn.setAttribute('aria-label', opts.ariaLabel);
    if (opts.active) btn.setAttribute('aria-current', 'page');
    btn.disabled = !!opts.disabled;
    btn.textContent = label;
    btn.addEventListener('click', () => {
      wikiState.page = page;
      renderWikiList();
    });
    return btn;
  };

  paginationEl.appendChild(makeBtn('‹', wikiState.page - 1, { ariaLabel: '이전 페이지', disabled: wikiState.page <= 1 }));
  for (let p = 1; p <= totalPages; p++) {
    paginationEl.appendChild(makeBtn(String(p), p, { active: p === wikiState.page }));
  }
  paginationEl.appendChild(makeBtn('›', wikiState.page + 1, { ariaLabel: '다음 페이지', disabled: wikiState.page >= totalPages }));
}

function renderWikiList() {
  const filtered = wikiFilterItems();
  const sorted = wikiSortItems(filtered);
  const start = (wikiState.page - 1) * WIKI_PAGE_SIZE;
  const pageItems = sorted.slice(start, start + WIKI_PAGE_SIZE);

  const listEl = document.getElementById('wikiRowList');
  listEl.innerHTML = '';
  if (pageItems.length === 0) {
    renderWikiEmptyState(listEl);
  } else {
    pageItems.forEach(item => listEl.appendChild(buildWikiRow(item)));
  }

  renderWikiPagination(sorted.length);
}

const WIKI_FAVORITE_PREVIEW_COUNT = 4;
let wikiFavoritesExpanded = false;

function truncateWikiTitle(title, length) {
  return title.length > length ? title.slice(0, length) + '…' : title;
}

function renderWikiFavoritesPanel() {
  const listEl = document.getElementById('wikiFavoriteList');
  const toggleBtn = document.getElementById('wikiFavoriteToggle');
  if (!listEl || !toggleBtn) return;

  const favorites = wikiAllItems.filter(item => item.bookmarked);
  const hasOverflow = favorites.length > WIKI_FAVORITE_PREVIEW_COUNT;
  const visibleItems = (wikiFavoritesExpanded || !hasOverflow)
    ? favorites
    : favorites.slice(0, WIKI_FAVORITE_PREVIEW_COUNT);

  listEl.innerHTML = '';
  if (favorites.length === 0) {
    const li = document.createElement('li');
    li.className = 'favorite-list__empty';
    li.textContent = '즐겨찾기한 위키가 없어요.';
    listEl.appendChild(li);
  } else {
    visibleItems.forEach(item => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'favorite-list__link';
      a.href = `detail.html?id=${encodeURIComponent(item.id)}`;

      const tag = document.createElement('span');
      tag.className = `tag favorite-list__tag tag--${WIKI_CATEGORY_TAG_COLOR[item.category] || 'gray'}`;
      tag.textContent = item.category;

      const title = document.createElement('span');
      title.className = 'favorite-list__title';
      title.textContent = truncateWikiTitle(item.title, 4);

      a.append(tag, title);
      li.appendChild(a);
      listEl.appendChild(li);
    });
  }

  toggleBtn.hidden = !hasOverflow;
  if (hasOverflow) {
    toggleBtn.textContent = wikiFavoritesExpanded ? '▲ 접기' : '▼ 펼치기';
  }
}

// 상세 페이지 "뒤로가기"로 돌아왔을 때, 떠나기 직전 저장해둔 카테고리/검색/정렬/
// 페이지/스크롤 위치를 복원한다. 1회성이라 읽자마자 sessionStorage에서 지운다.
function restoreWikiReturnState() {
  const raw = sessionStorage.getItem(WIKI_RETURN_STATE_KEY);
  if (!raw) return;
  sessionStorage.removeItem(WIKI_RETURN_STATE_KEY);

  let saved;
  try {
    saved = JSON.parse(raw);
  } catch (e) {
    return;
  }

  wikiState.category = saved.category;
  wikiState.search = saved.search;
  wikiState.sort = saved.sort;
  wikiState.page = saved.page;

  const searchInput = document.getElementById('wiki-search');
  if (searchInput) searchInput.value = wikiState.search;

  document.querySelectorAll('.sidebar__item[data-category]').forEach(btn => {
    btn.classList.toggle('sidebar__item--active', btn.dataset.category === wikiState.category);
  });
  document.querySelectorAll('.sort-pill[data-sort]').forEach(btn => {
    btn.classList.toggle('sort-pill--active', btn.dataset.sort === wikiState.sort);
  });

  renderWikiList();
  requestAnimationFrame(() => window.scrollTo(0, saved.scrollY));
}

function wikiBindControls() {
  document.querySelectorAll('.sidebar__item[data-category]').forEach(btn => {
    btn.addEventListener('click', () => {
      wikiState.category = btn.dataset.category;
      wikiState.page = 1;
      renderWikiList();
    });
  });

  document.querySelectorAll('.sort-pill[data-sort]').forEach(btn => {
    btn.addEventListener('click', () => {
      // ui.js가 클릭마다 무조건 sort-pill--active를 붙이므로(공통 파일, 수정 금지),
      // 이미 선택된 정렬을 다시 누른 경우 여기서 직접 꺼서 "해제" 동작을 구현한다.
      if (wikiState.sort === btn.dataset.sort) {
        wikiState.sort = 'latest';
        btn.classList.remove('sort-pill--active');
      } else {
        wikiState.sort = btn.dataset.sort;
      }
      wikiState.page = 1;
      renderWikiList();
    });
  });

  const searchInput = document.getElementById('wiki-search');
  searchInput.addEventListener('input', () => {
    wikiState.search = searchInput.value;
    wikiState.page = 1;
    renderWikiList();
  });

  const favoriteToggleBtn = document.getElementById('wikiFavoriteToggle');
  favoriteToggleBtn.addEventListener('click', () => {
    wikiFavoritesExpanded = !wikiFavoritesExpanded;
    renderWikiFavoritesPanel();
  });
}

// wiki.html(목록)과 detail.html(상세)이 이 파일 하나를 함께 로드하므로,
// wiki-data.json은 한 번만 fetch해서 두 초기화 함수가 나눠 쓴다.
let wikiDataPromise = null;
function fetchWikiData() {
  if (!wikiDataPromise) {
    wikiDataPromise = fetch('assets/data/wiki-data.json').then(res => res.json());
  }
  return wikiDataPromise;
}

function initWikiListPage() {
  if (!document.getElementById('wikiRowList')) return;
  fetchWikiData()
    .then(data => {
      wikiAllItems = data;
      wikiBindControls();
      renderWikiList();
      renderWikiFavoritesPanel();
      restoreWikiReturnState();
    })
    .catch(() => {
      const listEl = document.getElementById('wikiRowList');
      listEl.innerHTML = '';
      renderWikiEmptyState(listEl);
    });
}

// ══════════════════════════════════════════════
//  Wiki 상세 렌더링 — wiki-data.json의 content 섹션으로
//  본문/목차를 만들고, 목차 클릭 시 스크롤 싱크, 학습 완료 시
//  progress 갱신, 같은 카테고리 관련 문서를 처리한다.
// ══════════════════════════════════════════════

function wikiGetIdFromUrl() {
  return new URLSearchParams(window.location.search).get('id');
}

function updateWikiDetailProgress(item) {
  document.getElementById('wikiDetailPercent').textContent = `👁 학습 진도 ${item.progress}%`;
  const bar = document.getElementById('wikiDetailProgressBar');
  bar.setAttribute('aria-valuenow', String(item.progress));
  const fill = document.getElementById('wikiDetailProgressFill');
  fill.dataset.progress = String(item.progress);
  fill.style.width = `${item.progress}%`;
}

function renderWikiToc(item) {
  const tocEl = document.getElementById('wikiToc');
  tocEl.innerHTML = '<p class="toc__label">목차</p>';
  item.content.forEach((section, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toc__item' + (index === 0 ? ' toc__item--active' : '');
    btn.textContent = section.title;
    btn.addEventListener('click', () => {
      tocEl.querySelectorAll('.toc__item').forEach(el => el.classList.remove('toc__item--active'));
      btn.classList.add('toc__item--active');
      const target = document.getElementById(`wikiSection-${index}`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    tocEl.appendChild(btn);
  });
}

function renderWikiArticleBody(item) {
  const bodyEl = document.getElementById('artbody');
  bodyEl.innerHTML = '';
  item.content.forEach((section, index) => {
    const h2 = document.createElement('h2');
    h2.id = `wikiSection-${index}`;
    h2.textContent = section.title;
    bodyEl.appendChild(h2);

    const p = document.createElement('p');
    p.textContent = section.body;
    bodyEl.appendChild(p);

    if (section.code) {
      const box = document.createElement('div');
      box.className = 'code-box';

      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'code-box__copy-btn';
      copyBtn.textContent = '복사';
      // code-box__copy-btn은 defer 시점 이후 동적으로 생성되므로 app.js의
      // data-action="toast" 위임을 받지 못한다. 토글 로직 재구현이 아니라
      // 공통 toast() 함수만 직접 호출해 동일한 UX를 재사용한다.
      copyBtn.addEventListener('click', () => {
        navigator.clipboard?.writeText(section.code).catch(() => {});
        toast('코드가 복사되었어요!');
      });

      const pre = document.createElement('pre');
      pre.textContent = section.code;

      box.append(copyBtn, pre);
      bodyEl.appendChild(box);
    }
  });
}

function renderWikiRelated(item) {
  const relatedEl = document.getElementById('wikiRelatedList');
  relatedEl.innerHTML = '';
  const related = wikiAllItems
    .filter(other => other.category === item.category && other.id !== item.id)
    .slice(0, 2);

  if (related.length === 0) {
    const p = document.createElement('p');
    p.className = 'wiki-empty';
    p.textContent = '같은 카테고리의 다른 문서가 아직 없어요.';
    relatedEl.appendChild(p);
    return;
  }

  related.forEach(other => {
    const a = document.createElement('a');
    a.className = 'related-item';
    a.href = `detail.html?id=${encodeURIComponent(other.id)}`;

    const icon = document.createElement('span');
    icon.className = 'related-item__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = WIKI_CATEGORY_ICON[other.category] || '📄';

    const title = document.createElement('span');
    title.className = 'related-item__title';
    title.textContent = other.title;

    const desc = document.createElement('span');
    desc.className = 'related-item__desc';
    desc.textContent = other.description;

    const textWrap = document.createElement('span');
    textWrap.append(title, desc);

    const tag = document.createElement('span');
    tag.className = `tag related-item__tag tag--${WIKI_CATEGORY_TAG_COLOR[other.category] || 'gray'}`;
    tag.textContent = other.category;

    a.append(icon, textWrap, tag);
    relatedEl.appendChild(a);
  });
}

function renderWikiDetail(item) {
  document.getElementById('wikiDetailTitle').textContent = item.title;

  const categoryTag = document.getElementById('wikiDetailCategoryTag');
  categoryTag.className = `tag tag--${WIKI_CATEGORY_TAG_COLOR[item.category] || 'gray'}`;
  categoryTag.textContent = item.category;
  document.getElementById('wikiDetailLevelTag').textContent = item.level;

  document.getElementById('wikiDetailTime').textContent = `🕐 ${item.time}`;
  updateWikiDetailProgress(item);

  // favorite-star는 정적 마크업이라 ui.js가 defer 시점에 이미 클릭을 바인딩했다.
  // 여기서는 새 이벤트를 걸지 않고 로드된 데이터에 맞춰 초기 on/off 상태만 반영한다.
  const favBig = document.getElementById('wikiDetailFavorite');
  favBig.classList.toggle('favorite-star--on', item.bookmarked);
  favBig.setAttribute('aria-pressed', String(item.bookmarked));
  document.getElementById('wikiDetailFavoriteMini').classList.toggle('favorite-star--on', item.bookmarked);

  renderWikiToc(item);
  renderWikiArticleBody(item);
  renderWikiRelated(item);
  bindWikiHandbookSaveActions(item);
  if (typeof restoreWikiHighlights === 'function') restoreWikiHighlights(item.id);

  // 학습 완료 버튼은 정적 마크업이라 app.js의 data-action="toast" 토스트는
  // 이미 동작한다. 여기서는 progress 갱신만 추가로 연결한다.
  document.getElementById('wikiCompleteBtn').addEventListener('click', () => {
    item.progress = 100;
    updateWikiDetailProgress(item);
  });
}

// ══════════════════════════════════════════════
//  "내 핸드북에 저장" 박스(aside.wiki-detail__aside) 연동
//  즐겨찾기 → myfav.html, 단어장 → mywords.html/mypage.html이 읽는
//  localStorage 저장소에 실제로 반영한다. modal.js/highlight.js의 기존
//  토스트/토글 로직은 그대로 두고, 여기서는 리스너만 추가한다(충돌 없음).
// ══════════════════════════════════════════════

const WIKI_FAVORITES_KEY = 'sesac.myfavorites.list';

// 위키 카테고리 → 단어장 모달의 카테고리 옵션(SQL/Java/CS·IT/비즈니스/기타) 매핑
const WIKI_TO_WORD_CATEGORY = {
  'SQL': 'SQL',
  'Java': 'Java',
  'HTML/CSS': 'CS/IT',
  'JavaScript': 'CS/IT',
  'Git': 'CS/IT',
  'Salesforce': 'CS/IT',
  'CS 개념': 'CS/IT',
  '면접 개념': '기타',
  '취업 가이드': '기타'
};

function wikiTodayStr() {
  return new Date().toISOString().slice(0, 10).replace(/-/g, '.');
}

function saveWikiFavorite(item) {
  let favorites = [];
  try {
    favorites = JSON.parse(localStorage.getItem(WIKI_FAVORITES_KEY)) || [];
  } catch {
    favorites = [];
  }
  if (favorites.some(f => f.wikiId === item.id)) return;
  favorites.unshift({
    id: `fav-${item.id}`,
    wikiId: item.id,
    title: item.title,
    desc: item.description,
    category: item.category,
    categoryColor: WIKI_CATEGORY_TAG_COLOR[item.category] || 'gray',
    icon: WIKI_CATEGORY_ICON[item.category] || '📄',
    date: wikiTodayStr()
  });
  localStorage.setItem(WIKI_FAVORITES_KEY, JSON.stringify(favorites));
}

function prefillWordModalCategory(item) {
  const categoryEl = document.getElementById('mcategory');
  const mapped = WIKI_TO_WORD_CATEGORY[item.category];
  if (categoryEl && mapped) categoryEl.value = mapped;
}

function bindWikiHandbookSaveActions(item) {
  document.querySelectorAll('.save-box [data-action="quick-favorite"]').forEach(btn => {
    btn.addEventListener('click', () => saveWikiFavorite(item));
  });

  document.querySelectorAll('.save-box [data-action="open-modal"]').forEach(btn => {
    btn.addEventListener('click', () => prefillWordModalCategory(item));
  });
  document.querySelectorAll('[data-action="highlight-to-word"]').forEach(btn => {
    btn.addEventListener('click', () => prefillWordModalCategory(item));
  });
}

function initWikiDetailPage() {
  if (!document.getElementById('artbody') || !document.getElementById('wikiToc')) return;
  fetchWikiData()
    .then(data => {
      wikiAllItems = data;
      const id = wikiGetIdFromUrl();
      const item = wikiAllItems.find(i => i.id === id) || wikiAllItems[0];
      if (item) renderWikiDetail(item);
    })
    .catch(() => {
      document.getElementById('artbody').innerHTML = '<p class="wiki-empty">문서를 불러오지 못했습니다.</p>';
    });
}

initWikiListPage();
initWikiDetailPage();
