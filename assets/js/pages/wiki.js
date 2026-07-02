// ══════════════════════════════════════════════
//  Wiki 트리 렌더링 — assets/data/wiki-data.json (과목 -> 목차 -> 항목)을
//  좌측 트리 메뉴로 그리고, 선택한 항목의 본문을 중앙에 렌더링한다.
// ══════════════════════════════════════════════

let WIKI_DATA = null;

function findWikiItem(categoryId, chapterId, itemId) {
  const category = WIKI_DATA.categories.find(c => c.id === categoryId);
  const chapter = category && category.chapters.find(ch => ch.id === chapterId);
  const item = chapter && chapter.items.find(it => it.id === itemId);
  return { category, chapter, item };
}

function setActiveTreeButton(btn) {
  document.querySelectorAll('.wiki-tree__link--active').forEach(el => el.classList.remove('wiki-tree__link--active'));
  btn.classList.add('wiki-tree__link--active');
}

function renderWikiEmpty(message) {
  const content = document.getElementById('wikiContent');
  content.innerHTML = '';
  const p = document.createElement('p');
  p.className = 'wiki-empty';
  p.textContent = message;
  content.appendChild(p);
}

function renderWikiItem(categoryId, chapterId, itemId) {
  const { item } = findWikiItem(categoryId, chapterId, itemId);
  if (!item) {
    renderWikiEmpty('준비 중인 콘텐츠입니다.');
    return;
  }

  const content = document.getElementById('wikiContent');
  content.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'article-header';

  const title = document.createElement('h2');
  title.className = 'article-header__title';
  title.textContent = item.title;

  const star = document.createElement('span');
  star.className = 'favorite-star' + (item.isBookmarked ? ' favorite-star--on' : '');
  star.setAttribute('role', 'button');
  star.setAttribute('tabindex', '0');
  star.setAttribute('aria-pressed', String(item.isBookmarked));
  star.setAttribute('aria-label', '즐겨찾기');
  star.textContent = '★';
  // ui.js는 defer 시점에 존재하는 .favorite-star만 바인딩하므로, 트리 클릭 후
  // 새로 그려지는 이 별은 토글 로직 재구현 없이 공통 함수 ts()만 연결해 재사용한다.
  star.addEventListener('click', e => {
    e.stopPropagation();
    ts(star);
    item.isBookmarked = star.classList.contains('favorite-star--on');
  });

  header.append(title, star);

  const body = document.createElement('div');
  body.id = 'wikiBody';
  // JSON_GUIDE.md 규칙 9(HTML 금지)의 예외로, 본문은 원본 HTML 문자열을 그대로 렌더링한다
  // (내부 데이터이며 사용자 입력이 아니므로 innerHTML 사용).
  body.innerHTML = item.body;

  const completeBtn = document.createElement('button');
  completeBtn.type = 'button';
  completeBtn.className = 'complete-btn';
  completeBtn.textContent = item.isCompleted ? '✅ 학습 완료됨' : '✅ 학습 완료';
  completeBtn.addEventListener('click', () => {
    item.isCompleted = true;
    completeBtn.textContent = '✅ 학습 완료됨';
    toast('🎉 학습 완료! +20P 획득했어요!');
  });

  content.append(header, body, completeBtn);
}

function buildWikiTreeItem(categoryId, chapterId, item) {
  const li = document.createElement('li');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'wiki-tree__link wiki-tree__link--item';
  btn.textContent = item.title;
  btn.addEventListener('click', () => {
    setActiveTreeButton(btn);
    renderWikiItem(categoryId, chapterId, item.id);
  });
  li.appendChild(btn);
  return li;
}

function buildWikiTreeChapter(categoryId, chapter) {
  const li = document.createElement('li');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'wiki-tree__link wiki-tree__link--chapter';
  btn.textContent = chapter.title;
  btn.addEventListener('click', () => {
    setActiveTreeButton(btn);
    if (!chapter.items.length) {
      renderWikiEmpty('준비 중인 콘텐츠입니다.');
      return;
    }
    renderWikiItem(categoryId, chapter.id, chapter.items[0].id);
  });
  li.appendChild(btn);

  if (chapter.items.length) {
    const itemList = document.createElement('ul');
    itemList.className = 'wiki-tree__items';
    chapter.items.forEach(item => itemList.appendChild(buildWikiTreeItem(categoryId, chapter.id, item)));
    li.appendChild(itemList);
  }
  return li;
}

function buildWikiTreeCategory(category) {
  const li = document.createElement('li');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'wiki-tree__link wiki-tree__link--category';
  btn.textContent = `${category.icon} ${category.label}`;
  btn.addEventListener('click', () => {
    setActiveTreeButton(btn);
    if (!category.chapters.length) {
      renderWikiEmpty('준비 중인 콘텐츠입니다.');
      return;
    }
    const firstChapter = category.chapters[0];
    if (!firstChapter.items.length) {
      renderWikiEmpty('준비 중인 콘텐츠입니다.');
      return;
    }
    renderWikiItem(category.id, firstChapter.id, firstChapter.items[0].id);
  });
  li.appendChild(btn);

  if (category.chapters.length) {
    const chapterList = document.createElement('ul');
    chapterList.className = 'wiki-tree__chapters';
    category.chapters.forEach(chapter => chapterList.appendChild(buildWikiTreeChapter(category.id, chapter)));
    li.appendChild(chapterList);
  }
  return li;
}

function renderWikiTree(categories) {
  const treeEl = document.getElementById('wikiTree');
  treeEl.innerHTML = '';
  const rootList = document.createElement('ul');
  rootList.className = 'wiki-tree__categories';
  categories.forEach(category => rootList.appendChild(buildWikiTreeCategory(category)));
  treeEl.appendChild(rootList);
}

fetch('assets/data/wiki-data.json')
  .then(res => res.json())
  .then(data => {
    WIKI_DATA = data;
    renderWikiTree(data.categories);
  })
  .catch(() => {
    document.getElementById('wikiTree').innerHTML = '<p class="wiki-empty">목록을 불러오지 못했습니다.</p>';
  });
