// ══════════════════════════════════════════════
//  하이라이트 시스템 (원본 로직 그대로, 클래스명만 BEM으로 교체)
// ══════════════════════════════════════════════
const hlbar = document.getElementById('hlbar');
let savedRange = null;

document.addEventListener('mouseup', e => {
  if (hlbar && hlbar.contains(e.target)) return;
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || !sel.toString().trim()) {
    hlbar && hlbar.classList.remove('highlight-toolbar--visible');
    return;
  }
  const body = document.getElementById('artbody');
  if (!body) return;
  const range = sel.getRangeAt(0);
  if (!body.contains(range.commonAncestorContainer)) {
    hlbar && hlbar.classList.remove('highlight-toolbar--visible');
    return;
  }
  savedRange = range.cloneRange();
  const rect = range.getBoundingClientRect();
  hlbar.style.left = Math.max(4, rect.left + rect.width / 2 - 115) + 'px';
  hlbar.style.top = (rect.top + window.scrollY - 52) + 'px';
  hlbar.classList.add('highlight-toolbar--visible');
});

document.addEventListener('mousedown', e => {
  if (hlbar && !hlbar.contains(e.target)) hlbar.classList.remove('highlight-toolbar--visible');
});

function applyHL(color) {
  if (!savedRange) return;
  const span = document.createElement('span');
  span.className = color === 'y' ? 'highlight--yellow' : 'highlight--green';
  try {
    savedRange.surroundContents(span);
    const fullText = span.textContent;
    const text = fullText.slice(0, 55) + (fullText.length > 55 ? '…' : '');
    const id = addHlPanel(text);
    saveHighlightEntry({ id, text: fullText, color, date: new Date().toISOString().slice(0, 10).replace(/-/g, '.') });
    toast('✏️ 하이라이트로 저장했어요!');
  } catch (e) {
    toast('텍스트를 다시 드래그해보세요.');
  }
  hlbar.classList.remove('highlight-toolbar--visible');
  window.getSelection()?.removeAllRanges();
  savedRange = null;
}

function addHlPanel(text, id) {
  const panel = document.querySelector('.highlight-list');
  if (!panel) return null;
  const hlId = id || ('hl-' + Date.now());
  const div = document.createElement('div');
  div.className = 'highlight-list__item';
  div.id = hlId;

  const del = document.createElement('button');
  del.className = 'highlight-list__delete';
  del.type = 'button';
  del.textContent = '✕';
  del.setAttribute('aria-label', '하이라이트 삭제');
  del.addEventListener('click', () => delHl(hlId));

  div.appendChild(del);
  div.appendChild(document.createTextNode(text));
  panel.appendChild(div);
  updateHlCount();
  return hlId;
}

function delHl(id) {
  document.getElementById(id)?.remove();
  updateHlCount();
  removeHighlightEntry(id);
  toast('하이라이트를 삭제했어요.');
}

// ══════════════════════════════════════════════
//  하이라이트 저장소 — 위키 글(id)별로 저장해 다시 방문해도 유지되게 한다.
//  wiki.js의 wikiGetIdFromUrl()과 같은 페이지에서만 로드되므로 그대로 사용한다.
// ══════════════════════════════════════════════
const HIGHLIGHT_STORE_KEY = 'sesac.wiki.highlights';

function readHighlightStore() {
  try {
    return JSON.parse(localStorage.getItem(HIGHLIGHT_STORE_KEY)) || {};
  } catch {
    return {};
  }
}

function writeHighlightStore(store) {
  localStorage.setItem(HIGHLIGHT_STORE_KEY, JSON.stringify(store));
}

function saveHighlightEntry(entry) {
  const wikiId = typeof wikiGetIdFromUrl === 'function' ? wikiGetIdFromUrl() : null;
  if (!wikiId) return;
  const store = readHighlightStore();
  if (!store[wikiId]) store[wikiId] = [];
  store[wikiId].push(entry);
  writeHighlightStore(store);
}

function removeHighlightEntry(entryId) {
  const wikiId = typeof wikiGetIdFromUrl === 'function' ? wikiGetIdFromUrl() : null;
  if (!wikiId) return;
  const store = readHighlightStore();
  if (!store[wikiId]) return;
  store[wikiId] = store[wikiId].filter(h => h.id !== entryId);
  writeHighlightStore(store);
}

// 저장된 텍스트를 본문(#artbody)의 텍스트 노드에서 찾아 다시 하이라이트 span으로 감싼다.
function applyStoredHighlightToBody(root, entry) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let node;
  while ((node = walker.nextNode())) {
    const idx = node.nodeValue.indexOf(entry.text);
    if (idx === -1) continue;
    const range = document.createRange();
    range.setStart(node, idx);
    range.setEnd(node, idx + entry.text.length);
    const span = document.createElement('span');
    span.className = entry.color === 'y' ? 'highlight--yellow' : 'highlight--green';
    try {
      range.surroundContents(span);
    } catch {
      /* 텍스트가 이미 다른 태그에 걸쳐 있으면 시각적 복원만 건너뛴다 */
    }
    return;
  }
}

// wiki.js의 renderWikiDetail(item)이 본문을 다 그린 뒤 호출한다.
function restoreWikiHighlights(wikiId) {
  if (!wikiId) return;
  const store = readHighlightStore();
  const entries = store[wikiId] || [];
  const body = document.getElementById('artbody');
  entries.forEach(entry => {
    if (body) applyStoredHighlightToBody(body, entry);
    const text = entry.text.length > 55 ? entry.text.slice(0, 55) + '…' : entry.text;
    addHlPanel(text, entry.id);
  });
}

function updateHlCount() {
  const panel = document.querySelector('.highlight-list');
  const ct = document.getElementById('hlcount');
  if (!panel || !ct) return;
  ct.textContent = '✏️ 저장한 하이라이트 (' + panel.querySelectorAll('.highlight-list__item').length + ')';
}

function hlToWord() {
  const text = window.getSelection()?.toString().trim() || '';
  hlbar.classList.remove('highlight-toolbar--visible');
  window.getSelection()?.removeAllRanges();
  savedRange = null;
  openModal(text);
}

document.querySelectorAll('[data-action="apply-highlight"]').forEach(el => {
  el.addEventListener('click', () => applyHL(el.dataset.color));
});

document.querySelectorAll('[data-action="highlight-to-word"]').forEach(el => {
  el.addEventListener('click', () => hlToWord());
});

document.querySelectorAll('[data-action="delete-highlight"]').forEach(el => {
  el.addEventListener('click', () => delHl(el.closest('.highlight-list__item').id));
});
