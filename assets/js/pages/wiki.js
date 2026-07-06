// ══════════════════════════════════════════════
//  Wiki 목록 렌더링 — assets/data/wiki-data.json을 읽어
//  검색/카테고리 필터/정렬/페이지네이션을 처리한다.
// ══════════════════════════════════════════════

const WIKI_PAGE_SIZE = 5;

const WIKI_CATEGORY_ICON = {
  'SQL': 'database',
  'Java': 'code',
  'HTML': 'monitor',
  'CSS': 'edit',
  'JavaScript': 'play',
  'Git': 'git-branch',
  'Salesforce': 'cloud',
  'CS 개념': 'lightbulb',
  '면접 개념': 'message',
  '취업 가이드': 'bar-chart'
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
const WIKI_LEVEL_TAG_COLOR = { '입문': 'green', '기초': 'gray', '중급': 'gold' };
const WIKI_RETURN_STATE_KEY = 'wikiReturnState';

// ── 공용 Toolbar 컴포넌트(SearchBox + SortPill)가 넘겨주는 정렬 라벨 ↔ 내부 상태값 매핑 ──
// Toolbar는 "인기순"/"popular" 같은 의미를 모르므로, 라벨 문자열을 실제 정렬 기준으로
// 바꾸는 건 여기(wiki.js)의 책임이다.
const WIKI_SORT_OPTIONS = ['최신순', '인기순', '난이도순'];
const WIKI_SORT_LABEL_TO_KEY = { '최신순': 'latest', '인기순': 'popular', '난이도순': 'level' };
const WIKI_SORT_KEY_TO_LABEL = { latest: '최신순', popular: '인기순', level: '난이도순' };

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
  star.className = 'favorite-star icon icon--star-filled' + (item.bookmarked ? ' favorite-star--on' : '');
  star.setAttribute('role', 'button');
  star.setAttribute('tabindex', '0');
  star.setAttribute('aria-pressed', String(item.bookmarked));
  star.setAttribute('aria-label', '즐겨찾기');
  // 실제 저장(Supabase wiki_bookmarks)이 필요해 공통 ts() 대신 여기서 직접 토글+영속화한다.
  star.addEventListener('click', async e => {
    // 이 별은 <a class="wiki-row"> 안에 있어서 stopPropagation만으로는
    // 앵커의 기본 이동(href) 동작을 막지 못해 상세 페이지로 이동해버린다.
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn()) {
      location.href = '/pages/auth/login.html';
      return;
    }
    const nowBookmarked = await api.toggleWikiBookmark(item.id);
    item.bookmarked = nowBookmarked;
    star.classList.toggle('favorite-star--on', nowBookmarked);
    star.setAttribute('aria-pressed', String(nowBookmarked));
    toast(nowBookmarked ? '★ 즐겨찾기에 저장했어요!' : '즐겨찾기를 해제했어요.');
    renderWikiFavoritesPanel();
  });
  return star;
}

function buildWikiRow(item) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.className = 'wiki-row';
  a.href = `/pages/wiki/detail.html?id=${encodeURIComponent(item.id)}`;
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

  const categoryColor = WIKI_CATEGORY_TAG_COLOR[item.category] || 'gray';

  const icon = document.createElement('span');
  icon.className = `icon icon--${WIKI_CATEGORY_ICON[item.category] || 'file'}`;

  const iconBox = document.createElement('span');
  iconBox.className = `wiki-row__icon-box wiki-row__icon-box--${categoryColor}`;
  iconBox.setAttribute('aria-hidden', 'true');
  iconBox.appendChild(icon);

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
  tag.className = `tag tag--${categoryColor}`;
  tag.textContent = item.category;

  const level = document.createElement('span');
  level.className = `tag tag--${WIKI_LEVEL_TAG_COLOR[item.level] || 'gray'}`;
  level.textContent = item.level;

  const percent = document.createElement('span');
  percent.className = 'wiki-row__percent';
  percent.textContent = `${item.progress}%`;

  const meta = document.createElement('span');
  meta.className = 'wiki-row__meta';
  meta.append(tag, level, percent, buildWikiFavoriteStar(item));

  a.append(iconBox, body, meta);
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

function renderWikiList() {
  const filtered = wikiFilterItems();
  const sorted = wikiSortItems(filtered);
  // 필터/정렬 결과가 바뀌어 wikiState.page가 범위를 벗어난 경우, 목록을 자르기 전에
  // 먼저 클램프한다(이전에는 renderWikiPagination이 렌더 이후에 클램프해서, 페이지가
  // 갱신되기 전 상태로 목록이 그려져 결과가 있는데도 빈 상태가 보이는 문제가 있었다).
  const totalPages = Math.max(1, Math.ceil(sorted.length / WIKI_PAGE_SIZE));
  if (wikiState.page > totalPages) wikiState.page = totalPages;
  const start = (wikiState.page - 1) * WIKI_PAGE_SIZE;
  const pageItems = sorted.slice(start, start + WIKI_PAGE_SIZE);

  const listEl = document.getElementById('wikiRowList');
  listEl.innerHTML = '';
  if (pageItems.length === 0) {
    renderWikiEmptyState(listEl);
  } else {
    pageItems.forEach(item => listEl.appendChild(buildWikiRow(item)));
  }

  // 버튼 생성/이전·다음/클릭 이벤트는 공용 컴포넌트(assets/js/components/pagination.js)가 담당한다.
  // wiki.js는 "지금 몇 페이지인지", "페이지가 바뀌면 무엇을 다시 그릴지"만 넘겨준다.
  renderPagination({
    container: '#wikiPagination',
    totalCount: sorted.length,
    currentPage: wikiState.page,
    pageSize: WIKI_PAGE_SIZE,
    onChange(page) {
      wikiState.page = page;
      renderWikiList();
    }
  });
}

const WIKI_FAVORITE_PREVIEW_COUNT = 4;
let wikiFavoritesExpanded = false;

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
    visibleItems.forEach((item, index) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'favorite-list__link';
      a.href = `/pages/wiki/detail.html?id=${encodeURIComponent(item.id)}`;

      const badge = document.createElement('span');
      badge.className = 'favorite-list__index';
      badge.setAttribute('aria-hidden', 'true');
      badge.textContent = String(index + 1);

      const title = document.createElement('span');
      title.className = 'favorite-list__title';
      title.textContent = item.title;

      a.append(badge, title);
      li.appendChild(a);
      listEl.appendChild(li);
    });
  }

  toggleBtn.hidden = !hasOverflow;
  if (hasOverflow) {
    toggleBtn.innerHTML = `
    <span class="icon ${wikiFavoritesExpanded ? 'icon--chevron-up' : 'icon--chevron-down'}" aria-hidden="true"></span>
    ${wikiFavoritesExpanded ? '접기' : '펼치기'}
  `;
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

  if (wikiToolbar) {
    wikiToolbar.setSearchValue(wikiState.search);
    wikiToolbar.setActiveSort(WIKI_SORT_KEY_TO_LABEL[wikiState.sort] || WIKI_SORT_OPTIONS[0]);
  }

  document.querySelectorAll('.sidebar__item[data-category]').forEach(btn => {
    btn.classList.toggle('sidebar__item--active', btn.dataset.category === wikiState.category);
  });

  renderWikiList();
  requestAnimationFrame(() => window.scrollTo(0, saved.scrollY));
}

// createToolbar()가 돌려주는 컨트롤(setSearchValue/setActiveSort)을 restoreWikiReturnState()에서도
// 써야 해서 모듈 스코프에 보관한다.
let wikiToolbar = null;

function wikiBindControls() {
  document.querySelectorAll('.sidebar__item[data-category]').forEach(btn => {
    btn.addEventListener('click', () => {
      wikiState.category = btn.dataset.category;
      wikiState.page = 1;
      renderWikiList();
    });
  });

  wikiToolbar = createToolbar({
    container: '#wikiToolbar',
    searchPlaceholder: '위키 검색하기',
    sorts: WIKI_SORT_OPTIONS,
    onSearch(keyword) {
      wikiState.search = keyword;
      wikiState.page = 1;
      renderWikiList();
    },
    onSort(label) {
      wikiState.sort = WIKI_SORT_LABEL_TO_KEY[label] || 'latest';
      wikiState.page = 1;
      renderWikiList();
    }
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
    wikiDataPromise = fetch('/assets/data/wiki-data.json').then(res => res.json());
  }
  return wikiDataPromise;
}

// 로그인 상태면 wiki_bookmarks 테이블의 실제 즐겨찾기 상태로 item.bookmarked를 덮어쓴다.
// 비로그인(게스트)은 wiki-data.json에 남아있는 bookmarked 시드값과 무관하게 전부 false로 초기화한다.
async function wikiApplyBookmarks(items) {
  if (!isLoggedIn()) {
    items.forEach(item => { item.bookmarked = false; });
    return items;
  }
  const bookmarkedIds = new Set(await api.getWikiBookmarks());
  items.forEach(item => { item.bookmarked = bookmarkedIds.has(item.id); });
  return items;
}

function initWikiListPage() {
  if (!document.getElementById('wikiRowList')) return;
  fetchWikiData()
    .then(data => wikiApplyBookmarks(data))
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
  document.getElementById('wikiDetailPercent').innerHTML =
    `<span class="icon icon--bar-chart" aria-hidden="true"></span> 학습 진도 ${item.progress}%`;
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
    a.href = `/pages/wiki/detail.html?id=${encodeURIComponent(other.id)}`;

    const categoryColor = WIKI_CATEGORY_TAG_COLOR[other.category] || 'gray';
    const icon = document.createElement('span');
    icon.className = `icon icon--${WIKI_CATEGORY_ICON[other.category] || 'file'}`;

    const iconBox = document.createElement('span');
    iconBox.className = `wiki-row__icon-box wiki-row__icon-box--${categoryColor}`;
    iconBox.setAttribute('aria-hidden', 'true');
    iconBox.appendChild(icon);

    const title = document.createElement('span');
    title.className = 'related-item__title';
    title.textContent = other.title;

    const desc = document.createElement('span');
    desc.className = 'related-item__desc';
    desc.textContent = other.description;

    const textWrap = document.createElement('span');
    textWrap.append(title, desc);

    const tag = document.createElement('span');
    tag.className = `tag related-item__tag tag--${categoryColor}`;
    tag.textContent = other.category;

    a.append(iconBox, textWrap, tag);
    relatedEl.appendChild(a);
  });
}

function renderWikiDetail(item) {
  document.getElementById('wikiDetailTitle').textContent = item.title;

  const categoryTag = document.getElementById('wikiDetailCategoryTag');
  categoryTag.className = `tag tag--${WIKI_CATEGORY_TAG_COLOR[item.category] || 'gray'}`;
  categoryTag.textContent = item.category;
  document.getElementById('wikiDetailLevelTag').textContent = item.level;

  updateWikiDetailProgress(item);

  // favorite-star는 정적 마크업이라 ui.js가 defer 시점에 이미 클릭을 바인딩했지만(cosmetic toggle뿐),
  // 여기서는 로드된 데이터에 맞춰 초기 on/off 상태를 반영하고 실제 저장은 별도로 바인딩한다.
  const favBig = document.getElementById('wikiDetailFavorite');
  favBig.classList.toggle('favorite-star--on', item.bookmarked);
  favBig.setAttribute('aria-pressed', String(item.bookmarked));
  document.getElementById('wikiDetailFavoriteMini').classList.toggle('favorite-star--on', item.bookmarked);
  bindWikiDetailFavoriteStars(item);

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

// 상단 큰 별/미니 별 — 실제 저장(Supabase)을 담당하는 유일한 리스너다.
// 이 두 요소는 정적 마크업이라 ui.js가 defer 시점에 .favorite-star 전역 셀렉터로 cosmetic
// 리스너(ts())를 이미 걸어둔다. 그 리스너가 남아있으면 클릭 한 번에 cosmetic 토글과 실제 저장이
// 함께 실행되어(TD-0004) 네트워크 실패 시 화면 상태가 실제 저장 상태와 어긋날 수 있었다.
// 노드를 복제해 교체하면 이전에 바인딩된 리스너(ui.js의 ts() 포함)가 모두 제거되므로,
// 여기서 다는 리스너만 유일하게 남는다 — ui.js 자체나 다른 페이지의 동작은 건드리지 않는다.
function bindWikiDetailFavoriteStars(item) {
  const ids = ['wikiDetailFavorite', 'wikiDetailFavoriteMini'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.replaceWith(el.cloneNode(true));
  });

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', async (e) => {
      // wikiDetailFavoriteMini는 [data-action="quick-favorite"] 버튼 안에 중첩되어 있어,
      // 기존에는 ui.js의 stopPropagation()이 그 버튼의 별도 클릭 동작을 막아주고 있었다.
      // 리스너를 교체했으므로 같은 효과를 여기서 유지한다.
      e.stopPropagation();
      if (!isLoggedIn()) {
        location.href = '/pages/auth/login.html';
        return;
      }
      const nowBookmarked = await api.toggleWikiBookmark(item.id);
      item.bookmarked = nowBookmarked;
      // ui.js의 ts()가 담당하던 안내 토스트를 동일한 문구로 유지한다.
      toast(nowBookmarked ? '★ 즐겨찾기에 저장했어요!' : '즐겨찾기를 해제했어요.');
      ids.forEach(otherId => {
        const otherEl = document.getElementById(otherId);
        if (!otherEl) return;
        otherEl.classList.toggle('favorite-star--on', nowBookmarked);
        otherEl.setAttribute('aria-pressed', String(nowBookmarked));
      });
    });
  });
}

// ══════════════════════════════════════════════
//  "내 핸드북에 저장" 박스(aside.wiki-detail__aside) 연동
//  즐겨찾기/단어장 모두 Supabase(wiki_bookmarks/words)에 실제로 반영한다.
//  modal.js/highlight.js의 기존 토스트/토글 로직은 그대로 두고, 여기서는
//  리스너만 추가한다(충돌 없음).
// ══════════════════════════════════════════════

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

// 단어장 모달의 카테고리 선택값 → 태그 색상 (mypage.js의 CATEGORY_TAG_COLOR와 값은
// 같지만, 페이지 JS는 서로 직접 참조하지 않는 원칙에 따라 wiki.js에도 그대로 둔다.
const WORD_CATEGORY_COLOR = { SQL: 'green', Java: 'orange', 'CS/IT': 'blue', 비즈니스: 'gray', 기타: 'gray' };

// 이미 즐겨찾기된 문서면 그대로 두는(add-only) 원래 동작을 유지한다 — 해제는 별(star) 쪽에서만.
async function saveWikiFavorite(item) {
  if (!isLoggedIn()) {
    location.href = '/pages/auth/login.html';
    return;
  }
  if (item.bookmarked) return;
  item.bookmarked = await api.toggleWikiBookmark(item.id);
}

// ══════════════════════════════════════════════
//  "최근 본 페이지" 기록 — Home(index.html)의 recent-list가 읽는
//  wiki_recent_views 테이블. detail.html에서 문서를 열 때마다 갱신한다.
// ══════════════════════════════════════════════

async function saveRecentPage(item) {
  await api.addRecentWikiView(item.id);
}

// 현재 상세 화면의 위키 아이템 — renderWikiDetail()이 매번 갱신해두면,
// highlight.js가 "단어장" 버튼을 눌렀을 때 item 없이도 openWikiWordModal()을 바로 호출할 수 있다.
let currentWikiDetailItem = null;

// 위키 상세 화면에서 단어장 모달을 열 때 공용 진입점 — highlight.js의
// "단어장" 버튼(하이라이트한 텍스트를 term으로 프리필)도 이 함수를 그대로 쓴다.
// 실제 Supabase 저장(api.addWord)은 여기 onSave 콜백이 전담하고, 모달 자신은 모른다.
function openWikiWordModal(prefillTerm) {
  if (!currentWikiDetailItem) return;
  const item = currentWikiDetailItem;
  openWordModal({
    mode: 'create',
    word: { term: prefillTerm || '', category: WIKI_TO_WORD_CATEGORY[item.category] || '' },
    onSave(values) {
      const category = values.category;
      api.addWord({
        term: values.term,
        pos: '명사',
        definition: values.definition || '(뜻 미입력)',
        example: '',
        category,
        categoryColor: WORD_CATEGORY_COLOR[category] || 'gray',
        favorite: false,
      }).then(() => toast(`📓 "${values.term}"를 단어장에 저장했어요! +20P`));
    },
  });
}

function bindWikiHandbookSaveActions(item) {
  currentWikiDetailItem = item;

  document.querySelectorAll('.save-box [data-action="quick-favorite"]').forEach(btn => {
    btn.addEventListener('click', () => saveWikiFavorite(item));
  });

  document.querySelectorAll('.save-box [data-action="open-modal"]').forEach(btn => {
    btn.addEventListener('click', () => openWikiWordModal(''));
  });
  // [data-action="highlight-to-word"] 버튼은 highlight.js의 hlToWord()가 선택 텍스트를
  // 캡처한 뒤 openWikiWordModal(text)를 직접 호출한다(여기서 별도로 바인딩하지 않는다 —
  // 두 리스너가 같이 걸리면 highlight.js가 선택 영역을 지운 뒤에 실행되어 텍스트를 잃는다).
}

function initWikiDetailPage() {
  if (!document.getElementById('artbody') || !document.getElementById('wikiToc')) return;
  fetchWikiData()
    .then(data => wikiApplyBookmarks(data))
    .then(data => {
      wikiAllItems = data;
      const id = wikiGetIdFromUrl();
      const item = wikiAllItems.find(i => i.id === id) || wikiAllItems[0];
      if (item) {
        renderWikiDetail(item);
        if (isLoggedIn()) saveRecentPage(item);
      }
    })
    .catch(() => {
      document.getElementById('artbody').innerHTML = '<p class="wiki-empty">문서를 불러오지 못했습니다.</p>';
    });
}

// isLoggedIn()이 정확해야 즐겨찾기/최근열람이 올바르게 반영되므로 authReady 이후 실행한다.
window.authReady.then(() => {
  initWikiListPage();
  initWikiDetailPage();
});
