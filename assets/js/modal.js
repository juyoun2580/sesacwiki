// ── 단어 저장 모달 (원본 openModal/closeModal/saveWord 로직 그대로) ──
function openModal(word) {
  const inp = document.getElementById('mword');
  if (inp) inp.value = word || '';
  const modal = document.getElementById('wmodal');
  if (modal) {
    modal.classList.add('modal-overlay--visible');
    inp && inp.focus();
  }
}

function closeModal() {
  document.getElementById('wmodal')?.classList.remove('modal-overlay--visible');
}

function saveWord() {
  const w = document.getElementById('mword')?.value.trim();
  closeModal();
  toast('📓 ' + (w ? `"${w}"를 ` : '') + '단어장에 저장했어요! +20P');
}

// data-action="open-modal" data-word="..." 요소는 클릭 시 단어를 프리필해 모달을 연다.
document.querySelectorAll('[data-action="open-modal"]').forEach(el => {
  el.addEventListener('click', () => openModal(el.dataset.word || ''));
});

// data-action="quick-favorite" 요소는 내부 즐겨찾기 별을 토글하고 안내 토스트를 띄운다.
document.querySelectorAll('[data-action="quick-favorite"]').forEach(el => {
  el.addEventListener('click', () => {
    const star = el.querySelector('.favorite-star');
    if (star) ts(star);
    toast('★ 즐겨찾기에 저장했어요!');
  });
});

document.querySelectorAll('[data-action="close-modal"]').forEach(el => {
  el.addEventListener('click', () => closeModal());
});

document.querySelectorAll('[data-action="save-word"]').forEach(el => {
  el.addEventListener('click', () => saveWord());
});

document.getElementById('wmodal')?.addEventListener('click', e => {
  if (e.target === document.getElementById('wmodal')) closeModal();
});
