// ── 토스트 알림 (원본 toast() 로직 그대로) ──
let _toastTimer;

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('toast--visible');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('toast--visible'), 2200);
}
