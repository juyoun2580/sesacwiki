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
    const text = span.textContent.slice(0, 55) + (span.textContent.length > 55 ? '…' : '');
    addHlPanel(text);
    toast('✏️ 하이라이트로 저장했어요!');
  } catch (e) {
    toast('텍스트를 다시 드래그해보세요.');
  }
  hlbar.classList.remove('highlight-toolbar--visible');
  window.getSelection()?.removeAllRanges();
  savedRange = null;
}

function addHlPanel(text) {
  const panel = document.querySelector('.highlight-list');
  if (!panel) return;
  const id = 'hl-' + Date.now();
  const div = document.createElement('div');
  div.className = 'highlight-list__item';
  div.id = id;

  const del = document.createElement('button');
  del.className = 'highlight-list__delete';
  del.type = 'button';
  del.textContent = '✕';
  del.setAttribute('aria-label', '하이라이트 삭제');
  del.addEventListener('click', () => delHl(id));

  div.appendChild(del);
  div.appendChild(document.createTextNode(text));
  panel.appendChild(div);
  updateHlCount();
}

function delHl(id) {
  document.getElementById(id)?.remove();
  updateHlCount();
  toast('하이라이트를 삭제했어요.');
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
