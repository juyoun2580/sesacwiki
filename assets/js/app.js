// 사용자 입력값을 innerHTML 템플릿에 그대로 꽂아 넣지 않도록 이스케이프한다.
// exam.js/quiz.js/mypage.js 등 여러 페이지 스크립트가 공통으로 재사용한다.
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 취업핸드북 단계별 완료 여부 판정 — job.js(핸드북 페이지 진행률)와 home.js(대시보드
// 취업 준비율 카드)가 동일한 기준으로 계산해야 해서 여기 한 곳에만 정의하고 공유한다.
// (예전엔 두 파일에 완전히 같은 함수가 각각 있었고, 한쪽만 고치면 어긋난다는 주석으로만
// 동기화를 유지했다.)
function isJobStepDone(stepId, f) {
  if (!f) return false;
  switch (stepId) {
    case 2: return f.resume && (f.resume.education?.length > 0 || f.resume.experience?.length > 0 || f.resume.skills?.length > 0);
    case 3: return f.coverLetter && Object.values(f.coverLetter).every(v => typeof v === 'string' && v.trim());
    case 4: return f.projects && f.projects.length > 0;
    case 5: return (f.interviewAnswers && Object.values(f.interviewAnswers).some(v => typeof v === 'string' && v.trim())) ||
                   (f.mockAnswers && Object.values(f.mockAnswers).some(v => Array.isArray(v) && v.length > 0));
    case 6: return (f.companies && f.companies.length > 0) || (f.interviews && f.interviews.length > 0);
    default: return false;
  }
}

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

// ── 로그인이 필요한 개인화 페이지 목록(경로 기준) — 페이지 이동 시 이 배열만 갱신하면 된다 ──
const AUTH_REQUIRED_PAGES = ['/pages/handbook/index.html', '/pages/my/docs.html', '/pages/my/words.html', '/pages/my/favorites.html'];

// ── 개인화 페이지로 이동하는 링크: 비로그인 시 login.html로 보낸다(이벤트 위임) ──
function initAuthGuardLinks() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    if (!AUTH_REQUIRED_PAGES.includes(link.getAttribute('href'))) return;
    if (isLoggedIn()) return;

    e.preventDefault();
    location.href = '/pages/auth/login.html';
  });
}

// ── 개인화 페이지 자체에서의 접근 제어: 현재 페이지가 로그인 필수 페이지면 requireAuth() 실행 ──
function initPageAuthGuard() {
  if (!AUTH_REQUIRED_PAGES.includes(location.pathname)) return;

  requireAuth();
}

// ── 공통 초기화 진입점 — auth.js가 먼저 로드되어 initAuth()를 제공해야 한다 ──
// nav-mount는 이제 header.html 내부에 포함되므로, loadHeader()로 header 마크업이 주입된
// 뒤에 loadNav()를 실행해야 한다. header/nav에 의존하는 초기화(initNavigation/initAuth)도
// 마찬가지로 그 이후에 실행한다.
initProgressBars();
initToastTriggers();

loadHeader()
  .then(() => loadNav())
  .then(() => {
    initNavigation();
    initAuth();
  })
  .catch((err) => console.error("header/nav 로드 실패:", err));

// isLoggedIn()이 정확한 값을 돌려주려면 auth.js의 최초 세션 조회가 끝나야 하므로,
// 로그인 여부에 따라 분기하는 가드는 authReady 이후로 미룬다.
window.authReady.then(() => {
  initAuthGuardLinks();
  initPageAuthGuard();
});
