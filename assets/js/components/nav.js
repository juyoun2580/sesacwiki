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
// 상단 메뉴 중 취업핸드북을 제외한 3개(홈/위키/모의고사)만 고정 항목으로 다시 보여준다.
// 마지막 "마이" 자리는 로그인 상태에 따라 renderBottomNavAuthSlot()이 별도로 채운다
// (로그인 전: 로그인 링크 / 로그인 후: 프로필 아바타 링크 — Header의 user-menu-dropdown은
// Desktop 전용으로 그대로 두고, Mobile에서는 열지 않고 /pages/my/index.html로 바로 이동한다).
// data-nav 값은 nav.html과 동일하게 맞춰 getActiveNavKey()/NAV_ACTIVE_GROUPS를 그대로
// 재사용한다 — active 판정 로직은 이 파일에 단 한 곳(getActiveNavKey)만 존재한다.
// icon--home은 프로젝트에 없는 아이콘이라, 가장 가까운 기존 아이콘(icon--leaf)으로 대체했다.
const BOTTOM_NAV_ITEMS = [
  { key: 'home', href: '/index.html', label: '홈', icon: 'leaf' },
  { key: 'wiki', href: '/pages/wiki/index.html', label: '새싹위키', icon: 'book' },
  { key: 'exam', href: '/pages/exam/index.html', label: '모의고사', icon: 'check-square' },
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

  const staticItems = BOTTOM_NAV_ITEMS.map((item) => {
    const isActive = item.key === activeKey;
    return `<a class="bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}" data-nav="${item.key}" href="${item.href}"${isActive ? ' aria-current="page"' : ''}>
      <span class="icon icon--${item.icon} bottom-nav__icon" aria-hidden="true"></span>
      <span class="bottom-nav__label">${item.label}</span>
    </a>`;
  }).join('');

  // "마이" 자리는 고정 링크 대신 auth 상태에 맞춰 채워지는 빈 슬롯만 남겨둔다
  // (.bottom-nav는 4열 grid라 칸 자체는 항상 존재해야 한다).
  nav.innerHTML = `${staticItems}<div class="bottom-nav__auth-slot" id="bottom-nav-auth-slot"></div>`;

  renderBottomNavAuthSlot();
}

// ── Bottom Navigation의 마지막 칸: 로그인 전/후 상태에 따라 다시 그리지 않고 이 슬롯만 갱신한다 ──
// - 로그인 전: 아이콘+"로그인" 링크(다른 항목과 동일한 마크업 패턴)
// - 로그인 후: 프로필 아바타만 있는 링크(.user-chip__avatar 재사용) — 클릭하면 Dropdown을 열지
//   않고 /pages/my/index.html로 바로 이동한다. Header의 .user-menu(.user-chip+dropdown)는
//   옮기지 않고 Desktop 전용으로 그대로 둔다(assets/css/layout.css가 Mobile에서 숨긴다).
// 두 종류 모두 이미 그려져 있으면(auth 상태가 그대로인 채 다시 호출된 경우) innerHTML을
// 다시 쓰지 않는다 — 아바타 <img> src는 profile.js(refreshProfileUI)가 비동기로 채우는데,
// 매번 다시 그리면 그 값을 잃고 기본 이미지로 되돌아가 버리기 때문이다.
function renderBottomNavAuthSlot() {
  const slot = document.getElementById('bottom-nav-auth-slot');
  if (!slot) return;

  const loggedIn = typeof isLoggedIn === 'function' && isLoggedIn();
  const isActive = getActiveNavKey() === 'my';
  const kind = loggedIn ? 'avatar' : 'login';

  if (slot.dataset.kind === kind) {
    slot.querySelector('.bottom-nav__item')?.classList.toggle('bottom-nav__item--active', isActive);
    return;
  }
  slot.dataset.kind = kind;

  slot.innerHTML = loggedIn
    ? `<a class="bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}" data-nav="my" href="/pages/my/index.html"${isActive ? ' aria-current="page"' : ''}>
        <span class="user-chip__avatar" aria-hidden="true"><img src="/assets/img/profile-sample.png" alt=""></span>
      </a>`
    : `<a class="bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}" data-nav="my" href="/pages/auth/login.html"${isActive ? ' aria-current="page"' : ''}>
        <span class="icon icon--user bottom-nav__icon" aria-hidden="true"></span>
        <span class="bottom-nav__label">로그인</span>
      </a>`;
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
