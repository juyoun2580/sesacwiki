// ══════════════════════════════════════════════
//  하이라이트 시스템 (원본 로직 그대로, 클래스명만 BEM으로 교체)
// ══════════════════════════════════════════════
const hlbar = document.getElementById('hlbar');
let savedRange = null;

// 저장된 color 값(y/g)을 highlight-list__item modifier 이름으로 매핑한다.
// 새 하이라이트 색상을 추가할 때는 이 매핑에 한 줄만 추가하면 되고, addHlPanel 자체는 손댈 필요 없다.
const HIGHLIGHT_COLOR_CLASS = { y: 'yellow', g: 'green' };

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

async function applyHL(color) {
  if (!savedRange) return;
  const id = 'hl-' + Date.now();
  const span = document.createElement('span');
  span.className = color === 'y' ? 'highlight--yellow' : 'highlight--green';
  span.dataset.highlightId = id; // #artbody의 span과 목록 항목·저장 데이터를 같은 id로 연결한다
  try {
    savedRange.surroundContents(span);
    const fullText = span.textContent;
    const text = fullText.slice(0, 55) + (fullText.length > 55 ? '…' : '');
    addHlPanel(text, id, color);
    await saveHighlightEntry({ id, text: fullText, color, date: new Date().toISOString().slice(0, 10).replace(/-/g, '.') });
    toast('하이라이트로 저장했어요!');
  } catch (e) {
    toast('텍스트를 다시 드래그해보세요');
  }
  hlbar.classList.remove('highlight-toolbar--visible');
  window.getSelection()?.removeAllRanges();
  savedRange = null;
}

function addHlPanel(text, id, color) {
  const panel = document.querySelector('.highlight-list');
  if (!panel) return null;
  const hlId = id || ('hl-' + Date.now());
  const div = document.createElement('div');
  div.className = `highlight-list__item highlight-list__item--${HIGHLIGHT_COLOR_CLASS[color] || 'yellow'}`;
  div.id = hlId;

  const bar = document.createElement('span');
  bar.className = 'highlight-list__bar';
  bar.setAttribute('aria-hidden', 'true');

  const body = document.createElement('div');
  body.className = 'highlight-list__body';
  const textEl = document.createElement('p');
  textEl.className = 'highlight-list__text';
  textEl.textContent = text;
  body.appendChild(textEl);

  const del = document.createElement('button');
  del.className = 'highlight-list__delete';
  del.type = 'button';
  del.innerHTML = '<span class="icon icon--close" aria-hidden="true"></span>';
  del.setAttribute('aria-label', '하이라이트 삭제');
  del.addEventListener('click', () => delHl(hlId));

  div.appendChild(bar);
  div.appendChild(body);
  div.appendChild(del);
  panel.appendChild(div);
  updateHlCount();
  return hlId;
}

async function delHl(id) {
  document.getElementById(id)?.remove();
  unwrapBodyHighlight(id);
  updateHlCount();
  await removeHighlightEntry(id);
  toast('하이라이트를 삭제했어요');
}

// #artbody에 적용된 하이라이트 span을 벗겨내고(unwrap) 원래 텍스트만 남긴다 —
// surroundContents()의 반대 동작. 텍스트 자체는 지우지 않고 하이라이트 표시만 제거한다.
function unwrapBodyHighlight(id) {
  const span = document.querySelector(`#artbody [data-highlight-id="${id}"]`);
  if (!span) return;
  const parent = span.parentNode;
  while (span.firstChild) parent.insertBefore(span.firstChild, span);
  parent.removeChild(span);
  parent.normalize();
}

// ══════════════════════════════════════════════
//  하이라이트 저장소 — 위키 글(id)별로 Supabase wiki_highlights 테이블에 저장한다.
//  wiki.js의 wikiGetIdFromUrl()과 같은 페이지에서만 로드되므로 그대로 사용한다.
// ══════════════════════════════════════════════

async function saveHighlightEntry(entry) {
  const wikiId = typeof wikiGetIdFromUrl === 'function' ? wikiGetIdFromUrl() : null;
  if (!wikiId || !isLoggedIn()) return;
  const highlights = await api.getWikiHighlights(wikiId);
  highlights.push(entry);
  await api.saveWikiHighlights(wikiId, highlights);
}

async function removeHighlightEntry(entryId) {
  const wikiId = typeof wikiGetIdFromUrl === 'function' ? wikiGetIdFromUrl() : null;
  if (!wikiId || !isLoggedIn()) return;
  const highlights = await api.getWikiHighlights(wikiId);
  await api.saveWikiHighlights(wikiId, highlights.filter(h => h.id !== entryId));
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
    span.dataset.highlightId = entry.id;
    try {
      range.surroundContents(span);
    } catch {
      /* 텍스트가 이미 다른 태그에 걸쳐 있으면 시각적 복원만 건너뛴다 */
    }
    return;
  }
}

// wiki.js의 renderWikiDetail(item)이 본문을 다 그린 뒤 호출한다.
async function restoreWikiHighlights(wikiId) {
  if (!wikiId || !isLoggedIn()) return;
  const entries = await api.getWikiHighlights(wikiId);
  const body = document.getElementById('artbody');
  entries.forEach(entry => {
    if (body) applyStoredHighlightToBody(body, entry);
    const text = entry.text.length > 55 ? entry.text.slice(0, 55) + '…' : entry.text;
    addHlPanel(text, entry.id, entry.color);
  });
  updateHlCount();
}

function updateHlCount() {
  const panel = document.querySelector('.highlight-list');
  const ct = document.getElementById('hlcount');
  if (!panel || !ct) return;
  const count = panel.querySelectorAll('.highlight-list__item').length;
  ct.textContent = count;
  panel.hidden = count === 0;
}

function hlToWord() {
  const text = window.getSelection()?.toString().trim() || '';
  hlbar.classList.remove('highlight-toolbar--visible');
  window.getSelection()?.removeAllRanges();
  savedRange = null;
  openWikiWordModal(text);
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

updateHlCount(); // 로그인 전 등 restoreWikiHighlights가 채워주기 전에도 0개 상태를 즉시 반영
