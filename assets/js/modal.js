// ── 단어 저장 모달 — modal.js는 UI(열기/닫기)만 담당한다. ──
// 실제 저장(Supabase api.addWord/updateWord)은 assets/js/pages/mypage.js의
// data-action="save-word" 리스너가 전담한다(TD-0005). 과거에는 이 파일에도
// saveWord()(닫기+고정 toast만, 실제 저장 없음)가 같은 버튼에 별도로 바인딩되어
// 있었는데, mypage.js가 closeModal()/toast() 호출까지 넘겨받으며 제거했다.
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

// data-action="open-modal" data-word="..." 요소는 클릭 시 단어를 프리필해 모달을 연다.
document.querySelectorAll('[data-action="open-modal"]').forEach(el => {
  el.addEventListener('click', () => openModal(el.dataset.word || ''));
});

// data-action="quick-favorite" 버튼의 실제 저장/토스트는 wiki.js가 전담한다(TD-0004).
// 과거 이 파일에도 cosmetic ts() 토글 + 고정 토스트가 별도로 바인딩되어 있었는데,
// wiki.js의 진짜 저장 리스너와 같은 버튼에서 동시에 실행되며 화면 상태가 실제 저장
// 상태와 어긋나는 문제가 있어(별이 아닌 버튼 텍스트 클릭 시 특히) 제거했다.

document.querySelectorAll('[data-action="close-modal"]').forEach(el => {
  el.addEventListener('click', () => closeModal());
});

document.getElementById('wmodal')?.addEventListener('click', e => {
  if (e.target === document.getElementById('wmodal')) closeModal();
});
