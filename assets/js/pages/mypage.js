// ── 마이페이지 대시보드 / 프로필 수정 — MyPage(Job/My) 담당, 신규 파일 ──
// 신규 파일: 공식 WORK_ORDER.md 스코프 밖 프로토타입. 프로필 수정 내용을
// 대시보드에 실시간 반영하기 위해 localStorage를 상태 저장소로 쓴다.
// (JSON_GUIDE.md 규칙상 storage.js 신설은 원래 공통 담당자 판단 영역이라
// 정식 반영 전 공통 담당자 리뷰가 필요하다 — assets/js/pages/auth.js와 동일한 결정.)
const PROFILE_KEY = 'sesac.mypage.profile';

function readProfileOverride() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveProfileOverride(patch) {
  const merged = { ...readProfileOverride(), ...patch };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
  return merged;
}

// ── 대시보드: localStorage에 저장된 수정 내역을 화면에 즉시 반영 ──
function applyProfileToDashboard() {
  const p = readProfileOverride();
  if (Object.keys(p).length === 0) return;

  const nameEl = document.getElementById('profile-name');
  const userEl = document.getElementById('profile-username');
  const avatarEl = document.getElementById('profile-avatar');

  if (nameEl && p.name) nameEl.textContent = p.name;
  if (userEl && p.username) userEl.textContent = '@' + p.username;
  if (avatarEl && p.avatarUrl) {
    avatarEl.innerHTML = `<img src="${p.avatarUrl}" alt="프로필 사진">`;
  }
}
applyProfileToDashboard();

// ── 프로필 수정: 저장된 값이 있으면 폼 기본값 위에 덮어써서 프리필 ──
function prefillEditForm() {
  const p = readProfileOverride();

  const map = {
    'acc-username': p.username,
    'acc-name': p.name,
    'acc-github': p.githubUsername,
    'acc-language': p.language,
    'email-input': p.email
  };
  Object.entries(map).forEach(([id, value]) => {
    if (value === undefined) return;
    const el = document.getElementById(id);
    if (el) el.value = value;
  });

  const marketingEl = document.getElementById('acc-marketing');
  if (marketingEl && typeof p.isMarketingAgreed === 'boolean') {
    marketingEl.checked = p.isMarketingAgreed;
  }

  const avatarPreview = document.getElementById('avatar-preview');
  if (avatarPreview && p.avatarUrl) {
    avatarPreview.innerHTML = `<img src="${p.avatarUrl}" alt="프로필 사진 미리보기">`;
  }
}
prefillEditForm();

// ── Account Information 저장 ──
const accountForm = document.getElementById('account-form');
if (accountForm) {
  accountForm.addEventListener('submit', e => {
    e.preventDefault();
    saveProfileOverride({
      username: document.getElementById('acc-username').value.trim(),
      name: document.getElementById('acc-name').value.trim(),
      githubUsername: document.getElementById('acc-github').value.trim(),
      language: document.getElementById('acc-language').value,
      isMarketingAgreed: document.getElementById('acc-marketing').checked
    });
    toast('✅ 계정 정보가 저장됐어요!');
  });
}

// ── Email 변경 ──
const emailForm = document.getElementById('email-form');
if (emailForm) {
  emailForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email-input').value.trim();
    if (!email) {
      toast('이메일을 입력해주세요.');
      return;
    }
    saveProfileOverride({ email });
    toast('📧 로그인 이메일이 변경됐어요!');
  });
}

// ── Profile 아바타 업로드 (FileReader로 미리보기 + localStorage 저장) ──
const avatarInput = document.getElementById('avatar-input');
const avatarPreview = document.getElementById('avatar-preview');
let pendingAvatarDataUrl = null;

if (avatarInput) {
  avatarInput.addEventListener('change', () => {
    const file = avatarInput.files && avatarInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      pendingAvatarDataUrl = reader.result;
      if (avatarPreview) {
        avatarPreview.innerHTML = `<img src="${pendingAvatarDataUrl}" alt="프로필 사진 미리보기">`;
      }
    };
    reader.readAsDataURL(file);
  });
}

const avatarForm = document.getElementById('avatar-form');
if (avatarForm) {
  avatarForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!pendingAvatarDataUrl) {
      toast('업로드할 사진을 먼저 선택해주세요.');
      return;
    }
    saveProfileOverride({ avatarUrl: pendingAvatarDataUrl });
    toast('🖼 프로필 사진이 저장됐어요!');
  });
}

// ── Delete Account: 확인 체크박스를 눌러야만 삭제 버튼이 활성화된다 ──
const deleteConfirmCheckbox = document.getElementById('delete-confirm');
const deleteAccountBtn = document.getElementById('delete-account-btn');

if (deleteConfirmCheckbox && deleteAccountBtn) {
  deleteConfirmCheckbox.addEventListener('change', () => {
    deleteAccountBtn.disabled = !deleteConfirmCheckbox.checked;
  });

  deleteAccountBtn.addEventListener('click', () => {
    if (deleteAccountBtn.disabled) return;
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem('sesac.auth.session');
    toast('계정이 삭제됐어요. (테스트 환경 — 로컬 저장 데이터만 초기화됩니다)');
    setTimeout(() => { location.href = 'login.html'; }, 1200);
  });
}

// ── 연속 학습 기록(Streak) 위젯 — localStorage 기반 뼈대 로직 ──
// 최초 방문 시 연속 7일/최고 12일로 초기화하고, 이후 접속할 때마다
// 마지막 방문일과 오늘 날짜를 비교해 연속 기록을 계산한다.
const STREAK_KEY = 'sesac.mypage.streak';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(fromStr, toStr) {
  const ms = new Date(toStr) - new Date(fromStr);
  return Math.round(ms / 86400000);
}

function updateStreak() {
  let data;
  try {
    data = JSON.parse(localStorage.getItem(STREAK_KEY));
  } catch {
    data = null;
  }

  const today = todayStr();

  if (!data) {
    data = { currentStreak: 7, bestStreak: 12, lastVisitDate: today };
  } else if (data.lastVisitDate !== today) {
    const gap = daysBetween(data.lastVisitDate, today);
    if (gap === 1) {
      data.currentStreak += 1;
    } else if (gap > 1) {
      data.currentStreak = 1;
    }
    data.lastVisitDate = today;
    data.bestStreak = Math.max(data.bestStreak, data.currentStreak);
  }

  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  return data;
}

(function renderStreak() {
  const streak = updateStreak();
  const currentEl = document.getElementById('streak-current');
  const bestEl = document.getElementById('streak-best');
  if (currentEl) currentEl.textContent = streak.currentStreak;
  if (bestEl) bestEl.textContent = `최고 기록 ${streak.bestStreak}일`;
})();

// ── Challenges / Activities 탭 전환 (대시보드 우측 패널) ──
document.querySelectorAll('.achievement-tab').forEach(tabBtn => {
  tabBtn.addEventListener('click', () => {
    const target = tabBtn.dataset.tab;

    document.querySelectorAll('.achievement-tab').forEach(b => {
      b.classList.remove('achievement-tab--active');
      b.setAttribute('aria-selected', 'false');
    });
    tabBtn.classList.add('achievement-tab--active');
    tabBtn.setAttribute('aria-selected', 'true');

    document.querySelectorAll('.achievement-tab-content').forEach(panel => {
      panel.classList.toggle('achievement-tab-content--active', panel.dataset.tabPanel === target);
    });
  });
});

// ── 헤더 로그인 상태 표시 제어 ──
// 주의: 이 로직은 이 파일을 <script>로 불러오는 페이지(현재 mypage.html,
// mypage-edit.html)에서만 동작한다. index.html/wiki.html 등 다른 8개 파일은
// <script> 태그 목록이 공통 담당자 소유라 이 팀이 직접 추가할 수 없다.
// 로그인 버튼 ↔ 사용자 이름 전환을 사이트 전체에 적용하려면, 공통 담당자가
// 각 파일에 <script src="assets/js/pages/mypage.js" defer></script> 한 줄을
// 추가하는 승인/작업이 필요하다.
(function renderHeaderAuthState() {
  const userChip = document.querySelector('.user-chip');
  if (!userChip) return;

  let session = null;
  try {
    session = JSON.parse(localStorage.getItem('sesac.auth.session'));
  } catch {
    session = null;
  }

  if (session && session.name) {
    const nameEl = userChip.querySelector('.user-chip__name');
    if (nameEl) nameEl.textContent = session.name;
    userChip.addEventListener('click', () => { location.href = 'mypage.html'; });
    return;
  }

  // 세션이 없으면(로그인 전 상태) user-chip 대신 로그인 버튼을 노출한다.
  // (.user-chip은 components.css에 display:flex가 명시돼 있어 hidden 속성만으로는
  // 가려지지 않는다 — 프로젝트 관례대로 클래스 토글로 처리한다.)
  userChip.classList.add('is-hidden');
  const loginBtn = document.createElement('button');
  loginBtn.type = 'button';
  loginBtn.className = 'btn btn--primary btn--sm';
  loginBtn.textContent = '로그인';
  loginBtn.addEventListener('click', () => { location.href = 'login.html'; });
  userChip.insertAdjacentElement('afterend', loginBtn);
})();

// ── 나머지 8개 페이지가 공유하는 공통 GNB에서 "마이핸드북"을 완전히 없애려면
// <nav> 마크업 자체를 편집해야 하며, 이는 공통 담당자 소유 영역이다. 이 팀의
// 스코프 안(mypage.html/mypage-edit.html)에서는 JS로 숨김 처리만 데모한다.
document.querySelectorAll('.nav__item[href="my.html"], .nav__item[href="job.html"]').forEach(item => {
  item.classList.add('is-hidden');
});
