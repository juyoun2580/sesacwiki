// ── Word Modal 컴포넌트 로더 + openWordModal() API ──
// components/header.html/nav.html과 동일한 방식으로 components/word-modal.html을
// #word-modal-mount에 fetch로 주입한다.
//
// 이 파일은 UI(열기/닫기/모드별 화면 전환/입력값 읽기/버튼 클릭)만 담당하고,
// Word를 실제로 어떻게 저장·수정·삭제하는지(API 호출, JSON/Supabase 구조)는 전혀
// 모른다 — 그 책임은 openWordModal()을 호출하는 쪽(assets/js/pages/wiki.js,
// assets/js/pages/mypage.js)의 onSave/onDelete 콜백이 담당한다.
//
// 사용법:
//   openWordModal({
//     mode: 'create' | 'edit' | 'delete',
//     word,              // edit/delete: 기존 단어 객체. create: 카테고리 등 일부 프리필값(선택)
//     onSave(formValues), // create/edit에서 "저장" 클릭 시 { term, definition, category }로 호출
//     onDelete(word),      // delete에서 "삭제" 클릭 시 호출(연 시점의 word를 그대로 돌려받음)
//   });

function loadWordModal() {
  const mount = document.getElementById('word-modal-mount');
  if (!mount) return Promise.resolve();
  return fetch('/components/word-modal.html')
    .then((res) => res.text())
    .then((html) => {
      mount.innerHTML = html;
      bindWordModalEvents();
    })
    .catch((err) => {
      // 이 fetch가 실패하면 #wmodal 자체가 DOM에 없어 openWordModal()이 계속 조용히
      // no-op 처리된다("단어장 추가" 버튼을 눌러도 아무 반응 없음) — 콘솔에라도 원인이
      // 남도록 최소한의 로깅만 추가한다.
      console.error('word-modal.html 로드 실패:', err);
    });
}

let currentWordModalContext = null;

function setWordModalMode(mode, word) {
  const titleTextEl = document.getElementById('wmodal-title-text');
  const formEl = document.getElementById('wmodal-form');
  const confirmEl = document.getElementById('wmodal-confirm');
  const saveBtn = document.getElementById('wmodal-save-btn');
  const deleteBtn = document.getElementById('wmodal-delete-btn');

  if (mode === 'delete') {
    if (titleTextEl) titleTextEl.textContent = '단어 삭제';
    if (formEl) formEl.hidden = true;
    if (confirmEl) {
      confirmEl.hidden = false;
      confirmEl.textContent = `"${word && word.term ? word.term : ''}" 단어를 삭제할까요?`;
    }
    if (saveBtn) saveBtn.hidden = true;
    if (deleteBtn) deleteBtn.hidden = false;
    return;
  }

  if (formEl) formEl.hidden = false;
  if (confirmEl) confirmEl.hidden = true;
  if (saveBtn) {
    saveBtn.hidden = false;
    saveBtn.textContent = mode === 'edit' ? '수정 저장' : '단어장에 저장';
  }
  if (deleteBtn) deleteBtn.hidden = true;
  if (titleTextEl) titleTextEl.textContent = mode === 'edit' ? '단어 수정' : '단어장에 추가';

  const termEl = document.getElementById('mword');
  const meaningEl = document.getElementById('mmeaning');
  const categoryEl = document.getElementById('mcategory');
  if (termEl) termEl.value = (word && word.term) || '';
  if (meaningEl) meaningEl.value = (word && word.definition) || '';
  if (categoryEl && word && word.category) categoryEl.value = word.category;
}

function openWordModal(options) {
  const { mode = 'create', word, onSave, onDelete } = options || {};
  const modal = document.getElementById('wmodal');
  if (!modal) return;

  currentWordModalContext = { mode, word, onSave, onDelete };
  setWordModalMode(mode, word);

  modal.classList.add('modal-overlay--visible');
  const termEl = document.getElementById('mword');
  if (mode !== 'delete' && termEl) termEl.focus();
}

function closeWordModal() {
  document.getElementById('wmodal')?.classList.remove('modal-overlay--visible');
  currentWordModalContext = null;
}

function bindWordModalEvents() {
  document.querySelectorAll('[data-action="close-modal"]').forEach((el) => {
    el.addEventListener('click', () => closeWordModal());
  });

  document.getElementById('wmodal')?.addEventListener('click', (e) => {
    if (e.target.id === 'wmodal') closeWordModal();
  });

  document.querySelectorAll('[data-action="save-word"]').forEach((el) => {
    el.addEventListener('click', () => {
      if (!currentWordModalContext || currentWordModalContext.mode === 'delete') return;
      const termEl = document.getElementById('mword');
      const term = termEl ? termEl.value.trim() : '';
      if (!term) return;
      const definition = document.getElementById('mmeaning')?.value.trim() || '';
      const category = document.getElementById('mcategory')?.value || '';
      const { onSave } = currentWordModalContext;
      closeWordModal();
      if (typeof onSave === 'function') onSave({ term, definition, category });
    });
  });

  document.querySelectorAll('[data-action="delete-word-confirm"]').forEach((el) => {
    el.addEventListener('click', () => {
      if (!currentWordModalContext || currentWordModalContext.mode !== 'delete') return;
      const { word, onDelete } = currentWordModalContext;
      closeWordModal();
      if (typeof onDelete === 'function') onDelete(word);
    });
  });
}

// 모듈 번들러가 없는 프로젝트 관례대로 전역 함수로 노출한다(toast()/renderPagination()과 동일 패턴).
window.openWordModal = openWordModal;

loadWordModal();
