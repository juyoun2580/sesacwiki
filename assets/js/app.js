// ── 진행률(%) 값은 HTML에 style= 로 하드코딩하지 않고 data-progress 로만 표기,
// 실제 width 값은 여기서 한 번에 적용한다. ──
function initProgressBars() {
  document.querySelectorAll('[data-progress]').forEach(el => {
    el.style.width = el.dataset.progress + '%';
  });
}

// data-action="toast" data-message="..." 요소는 클릭 시 고정 문구 토스트를 띄운다.
function initToastTriggers() {
  document.querySelectorAll('[data-action="toast"]').forEach(el => {
    el.addEventListener('click', () => toast(el.dataset.message));
  });
}

// ── Mobile Hamburger Menu — 공통 Header의 .hamburger-btn이 .side-panel을 드로어로 토글 ──
// side-panel이 없는 페이지(detail, quiz 등)에서는 버튼을 숨긴다.
function initNavigation() {
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  const sidePanel = document.querySelector('.side-panel');

  if (hamburgerBtn && sidePanel) {
    const closeSidePanel = () => {
      sidePanel.classList.remove('side-panel--open');
      document.body.classList.remove('side-panel-open');
      hamburgerBtn.classList.remove('hamburger-btn--active');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    };

    hamburgerBtn.addEventListener('click', () => {
      const isOpen = sidePanel.classList.toggle('side-panel--open');
      document.body.classList.toggle('side-panel-open', isOpen);
      hamburgerBtn.classList.toggle('hamburger-btn--active', isOpen);
      hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (e) => {
      if (!sidePanel.classList.contains('side-panel--open')) return;
      if (sidePanel.contains(e.target) || hamburgerBtn.contains(e.target)) return;
      closeSidePanel();
    });
  } else if (hamburgerBtn) {
    hamburgerBtn.hidden = true;
  }
}

// ── 공통 초기화 진입점 — auth.js가 먼저 로드되어 initAuth()를 제공해야 한다 ──
initProgressBars();
initToastTriggers();
initNavigation();
initAuth();
