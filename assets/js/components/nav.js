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

// ── Bottom Navigation (Mobile 전용, @media max-width:767px에서만 표시) ──
// 상단 5개 메뉴 중 취업핸드북을 제외한 4개만 다시 보여준다. data-nav 값은 nav.html과
// 동일하게 맞춰 getActiveNavKey()/NAV_ACTIVE_GROUPS를 그대로 재사용한다 — active 판정
// 로직은 이 파일에 단 한 곳(getActiveNavKey)만 존재한다.
// icon--home은 프로젝트에 없는 아이콘이라, 가장 가까운 기존 아이콘(icon--leaf)으로 대체했다.
const BOTTOM_NAV_ITEMS = [
  { key: 'home', href: '/index.html', label: '홈', icon: 'leaf' },
  { key: 'wiki', href: '/pages/wiki/index.html', label: '새싹위키', icon: 'book' },
  { key: 'exam', href: '/pages/exam/index.html', label: '모의고사', icon: 'check-square' },
  { key: 'my', href: '/pages/my/index.html', label: '마이', icon: 'user' },
];

// .header는 backdrop-filter로 새 containing block을 만들어, 그 안에 두면 position:fixed가
// header 기준으로 계산돼버린다 — 그래서 #nav-mount 밖, document.body에 직접 붙인다.
function renderBottomNav(activeKey) {
  let nav = document.getElementById('bottom-nav-mount');
  if (!nav) {
    nav = document.createElement('nav');
    nav.className = 'bottom-nav';
    nav.id = 'bottom-nav-mount';
    nav.setAttribute('aria-label', '하단 메뉴');
    document.body.appendChild(nav);
  }

  nav.innerHTML = BOTTOM_NAV_ITEMS.map((item) => {
    const isActive = item.key === activeKey;
    return `<a class="bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}" data-nav="${item.key}" href="${item.href}"${isActive ? ' aria-current="page"' : ''}>
      <span class="icon icon--${item.icon} bottom-nav__icon" aria-hidden="true"></span>
      <span class="bottom-nav__label">${item.label}</span>
    </a>`;
  }).join('');
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

      renderBottomNav(activeKey);
    });
}
