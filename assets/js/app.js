// ── 진행률(%) 값은 HTML에 style= 로 하드코딩하지 않고 data-progress 로만 표기,
// 실제 width 값은 여기서 한 번에 적용한다. ──
document.querySelectorAll('[data-progress]').forEach(el => {
  el.style.width = el.dataset.progress + '%';
});

// data-action="toast" data-message="..." 요소는 클릭 시 고정 문구 토스트를 띄운다.
document.querySelectorAll('[data-action="toast"]').forEach(el => {
  el.addEventListener('click', () => toast(el.dataset.message));
});
