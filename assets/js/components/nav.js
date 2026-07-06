// ── Nav Component Loader — components/nav.html을 #nav-mount에 주입하고 현재 페이지의 active 상태를 적용한다 ──
// 그룹별 경로 목록은 페이지가 pages/ 구조로 이동할 때마다 이 표만 갱신하면 된다.
const NAV_ACTIVE_GROUPS = {
  home: ['/index.html', '/'],
  wiki: ['/pages/wiki/index.html', '/pages/wiki/detail.html'],
  exam: ['/pages/exam/index.html', '/pages/exam/quiz.html'],
  handbook: ['/pages/handbook/index.html', '/pages/handbook/resume.html'],
  my: ['/pages/my/index.html', '/pages/my/docs.html', '/pages/my/favorites.html', '/pages/my/words.html', '/pages/my/edit.html'],
};

function getActiveNavKey() {
  const path = location.pathname;
  return Object.keys(NAV_ACTIVE_GROUPS).find((key) =>
    NAV_ACTIVE_GROUPS[key].includes(path),
  );
}

function loadNav() {
  const mount = document.getElementById('nav-mount');
  if (!mount) return Promise.resolve();

  return fetch('/components/nav.html')
    .then((res) => res.text())
    .then((html) => {
      mount.innerHTML = html;

      const activeKey = getActiveNavKey();
      mount.querySelectorAll('[data-nav]').forEach((item) => {
        const isActive = item.dataset.nav === activeKey;
        item.classList.toggle('nav__item--active', isActive);
        if (isActive) {
          item.setAttribute('aria-current', 'page');
        } else {
          item.removeAttribute('aria-current');
        }
      });
    });
}
