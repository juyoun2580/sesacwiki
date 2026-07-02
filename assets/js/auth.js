// ── 공통 인증 모듈 — 세션 관리 + Header 인증 상태(UserChip/Dropdown/로그아웃) ──
// 실제 이메일 발송/서버 인증이 없는 정적 프론트엔드라, 이메일 인증은
// "인증 대기 패널 + 확인 버튼"으로 모킹한다.
const AUTH_USERS_KEY = "sesac.auth.users";
const AUTH_SESSION_KEY = "sesac.auth.session";
const AUTH_PENDING_KEY = "sesac.auth.pendingEmail";

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function writeUsers(users) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}

function findUserByEmail(email) {
  return readUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_SESSION_KEY));
  } catch {
    return null;
  }
}

function setSession(user) {
  localStorage.setItem(
    AUTH_SESSION_KEY,
    JSON.stringify({
      name: user.name,
      email: user.email,
      loggedInAt: new Date().toISOString(),
    }),
  );
}

function removeSession() {
  localStorage.removeItem(AUTH_SESSION_KEY);
}

// ── 로그인 여부 확인 ──
function isLoggedIn() {
  return !!getSession();
}

// ── 현재 로그인한 사용자 정보 반환(비로그인 시 null) ──
function getCurrentUser() {
  const session = getSession();
  if (!session) return null;

  return {
    name: session.name,
    email: session.email,
    loggedInAt: session.loggedInAt
  };
}

// ── 로그인 필수 페이지에서 호출: 비로그인 시 login.html로 이동 ──
function requireAuth() {
  if (isLoggedIn()) return true;

  location.href = 'login.html';
  return false;
}

// ── login.html 전용: 이미 로그인된 경우 mypage.html로 이동 ──
function redirectIfLoggedIn() {
  if (!isLoggedIn()) return;

  location.href = 'mypage.html';
}

// ── Header 인증 상태: data-auth 값만 갱신하면 components.css가 UserChip ↔ 로그인 버튼을 전환한다 ──
function updateHeader() {
  const session = getSession();
  document.body.dataset.auth = session ? "user" : "guest";

  if (session && session.name) {
    const nameEl = document.querySelector(".user-chip__name");
    if (nameEl) nameEl.textContent = session.name;
  }
}

// ── Guest 상태에서 노출되는 로그인 버튼: login.html로 이동만 담당(세션 생성은 하지 않는다) ──
function bindLoginButton() {
  const loginBtn = document.querySelector(".auth-guest-only");
  if (!loginBtn) return;

  loginBtn.addEventListener("click", () => {
    location.href = "login.html";
  });
}

// ── UserChip 클릭 시 Dropdown(마이페이지/로그아웃)만 열고 닫는다 ──
function bindDropdown() {
  const userMenu = document.querySelector(".user-menu");
  const userChip = userMenu?.querySelector(".user-chip");
  if (!userMenu || !userChip) return;

  const closeUserMenu = () => {
    userMenu.classList.remove("user-menu--open");
    userChip.setAttribute("aria-expanded", "false");
  };

  userChip.addEventListener("click", () => {
    const isOpen = userMenu.classList.toggle("user-menu--open");
    userChip.setAttribute("aria-expanded", String(isOpen));
  });

  userMenu.querySelectorAll(".user-menu__item").forEach((item) => {
    item.addEventListener("click", closeUserMenu);
  });

  document.addEventListener("click", (e) => {
    if (!userMenu.classList.contains("user-menu--open")) return;
    if (userMenu.contains(e.target)) return;
    closeUserMenu();
  });
}

// ── Dropdown의 로그아웃 버튼: 세션 삭제 후 로그인 페이지로 이동 ──
function bindLogout() {
  const logoutBtn = document.querySelector(".user-menu button.user-menu__item");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    removeSession();
    location.href = "login.html";
  });
}

function initAuth() {
  updateHeader();
  bindLoginButton();
  bindDropdown();
  bindLogout();
}

// ── 회원가입 폼 ──
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const agreeRequired = document.getElementById(
      "signup-agree-required",
    ).checked;
    const agreeMarketing = document.getElementById(
      "signup-agree-marketing",
    ).checked;

    if (!name || !email) {
      toast("이름과 이메일을 모두 입력해주세요.");
      return;
    }
    if (!agreeRequired) {
      toast("개인정보 수집 및 이용약관에 동의해야 가입할 수 있어요.");
      return;
    }
    if (findUserByEmail(email)) {
      toast("이미 가입된 이메일이에요. 로그인해주세요.");
      return;
    }

    const users = readUsers();
    users.push({
      name,
      email,
      marketingOptIn: agreeMarketing,
      createdAt: new Date().toISOString(),
    });
    writeUsers(users);

    toast(`🌱 ${name}님, 가입이 완료됐어요! 로그인해주세요.`);
    setTimeout(() => {
      location.href = "login.html";
    }, 1200);
  });
}

// ── 로그인 폼: 이메일 제출 시 인증 메일 발송을 모킹한다 ──
const loginForm = document.getElementById("login-form");
const pendingPanel = document.getElementById("auth-pending");

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();

    if (!email) {
      toast("이메일을 입력해주세요.");
      return;
    }
    if (!findUserByEmail(email)) {
      toast("가입되지 않은 이메일이에요. 먼저 가입해주세요.");
      return;
    }

    localStorage.setItem(AUTH_PENDING_KEY, email);
    document.getElementById("auth-pending-email").textContent = email;
    loginForm.hidden = true;
    pendingPanel.hidden = false;
    toast("📩 인증 메일을 보냈어요! (모킹)");
  });
}

// data-action="mock-verify": 이메일 속 인증 링크 클릭을 흉내내는 테스트 버튼
document.querySelectorAll('[data-action="mock-verify"]').forEach((btn) => {
  btn.addEventListener("click", () => {
    const email = localStorage.getItem(AUTH_PENDING_KEY);
    const user = email && findUserByEmail(email);
    if (!user) {
      toast("인증할 이메일 정보가 없어요. 다시 로그인해주세요.");
      return;
    }
    setSession(user);
    localStorage.removeItem(AUTH_PENDING_KEY);
    toast(`✅ 인증 완료! ${user.name}님 환영합니다.`);
    setTimeout(() => {
      location.href = "mypage.html";
    }, 1000);
  });
});

// data-action="mock-resend": 인증 메일 재발송 모킹
document.querySelectorAll('[data-action="mock-resend"]').forEach((btn) => {
  btn.addEventListener("click", () =>
    toast("📩 인증 메일을 다시 보냈어요! (모킹)"),
  );
});

// ── Public API (다른 페이지 스크립트에서 사용 가능) ──
// - initAuth()          : Header 인증 상태 초기화(UserChip/Dropdown/로그아웃 바인딩)
// - isLoggedIn()         : 현재 로그인 여부(boolean)
// - getCurrentUser()     : 로그인한 사용자 정보({ name, email, loggedInAt }) 또는 null
// - requireAuth()        : 비로그인 시 login.html로 이동 후 false, 로그인 상태면 true
// - redirectIfLoggedIn() : login.html에서 이미 로그인된 경우 mypage.html로 이동
