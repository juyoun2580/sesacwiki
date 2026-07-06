// ── 공통 인증 모듈 — Supabase Auth(이메일+비밀번호) 세션 관리 + Header 인증 상태 ──
// 세션은 supabase-js가 내부적으로 영속화하지만, 이 파일의 다른 곳(app.js, mypage.js 등)이
// isLoggedIn()/getCurrentUser()를 동기 함수로 호출하므로 currentSession 캐시를 두고
// onAuthStateChange로 계속 최신 상태를 반영한다.

let currentSession = null;
let resolveAuthReady;
window.authReady = new Promise((resolve) => { resolveAuthReady = resolve; });

supabaseClient.auth.onAuthStateChange((event, session) => {
  currentSession = session;
  updateHeader();

  if (event === "INITIAL_SESSION") {
    resolveAuthReady();
    // 이미 로그인된 세션이 남아있는 상태로 login/signup 페이지에 직접 들어온 경우
    // (뒤로가기, 즐겨찾기 등) 마이페이지로 보낸다. SIGNED_IN 이벤트는 신규 로그인
    // 순간에만 발생하므로 이 분기가 없으면 이 경우를 놓친다.
    if (/(?:login|signup)\.html$/.test(location.pathname)) redirectIfLoggedIn();
  }

  // 로그인/가입 화면에서 세션이 생성되면(비밀번호 로그인, 이메일 확인 불필요한 가입 등) 마이페이지로 이동한다.
  if (event === "SIGNED_IN" && /(?:login|signup)\.html$/.test(location.pathname)) {
    location.href = "/pages/my/mypage.html";
  }
});

// ── 로그인 여부 확인 ──
function isLoggedIn() {
  return !!currentSession;
}

// ── 현재 로그인한 사용자 정보 반환(비로그인 시 null) ──
function getCurrentUser() {
  if (!currentSession) return null;
  const user = currentSession.user;

  return {
    name: user.user_metadata?.name || user.email.split("@")[0],
    email: user.email,
    loggedInAt: user.last_sign_in_at,
  };
}

// ── 로그인 필수 페이지에서 호출: 비로그인 시 login.html로 이동 ──
function requireAuth() {
  if (isLoggedIn()) return true;

  location.href = '/pages/auth/login.html';
  return false;
}

// ── login.html 전용: 이미 로그인된 경우 mypage.html로 이동 ──
function redirectIfLoggedIn() {
  if (!isLoggedIn()) return;

  location.href = '/pages/my/mypage.html';
}

// ── Header 인증 상태: data-auth 값만 갱신하면 components.css가 UserChip ↔ 로그인 버튼을 전환한다 ──
function updateHeader() {
  document.body.dataset.auth = currentSession ? "user" : "guest";

  const user = getCurrentUser();
  if (user) {
    const nameEl = document.querySelector(".user-chip__name");
    if (nameEl) nameEl.textContent = user.name;
  }
}

// ── Guest 상태에서 노출되는 로그인 버튼: login.html로 이동만 담당(세션 생성은 하지 않는다) ──
function bindLoginButton() {
  const loginBtn = document.querySelector(".auth-guest-only");
  if (!loginBtn) return;

  loginBtn.addEventListener("click", () => {
    location.href = "/pages/auth/login.html";
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

// ── Dropdown의 로그아웃 버튼: Supabase 세션 종료 후 로그인 페이지로 이동 ──
function bindLogout() {
  const logoutBtn = document.querySelector(".user-menu button.user-menu__item");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    location.href = "/pages/auth/login.html";
  });
}

function initAuth() {
  updateHeader();
  bindLoginButton();
  bindDropdown();
  bindLogout();
}

// ── 회원가입 폼: 이메일+비밀번호로 계정을 생성한다 ──
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const passwordConfirm = document.getElementById("signup-password-confirm").value;
    const agreeRequired = document.getElementById("signup-agree-required").checked;
    const agreeMarketing = document.getElementById("signup-agree-marketing").checked;

    if (!name || !email || !password || !passwordConfirm) {
      toast("이름, 이메일, 비밀번호를 모두 입력해주세요.");
      return;
    }
    if (password.length < 6) {
      toast("비밀번호는 6자 이상이어야 해요.");
      return;
    }
    if (password !== passwordConfirm) {
      toast("비밀번호가 일치하지 않아요.");
      return;
    }
    if (!agreeRequired) {
      toast("개인정보 수집 및 이용약관에 동의해야 가입할 수 있어요");
      return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { name, marketing_opt_in: agreeMarketing },
        emailRedirectTo: `${location.origin}/pages/auth/login.html`,
      },
    });

    if (error) {
      toast(error.message);
      return;
    }

    // 프로젝트에서 이메일 확인(Confirm email)이 꺼져 있으면 signUp만으로 세션이 바로 생기고,
    // onAuthStateChange의 SIGNED_IN 분기가 마이페이지로 이동시킨다. 켜져 있으면 세션이 없으므로
    // 이메일 인증부터 안내한다.
    if (data.session) {
      toast(`🌱 ${name}님, 가입이 완료됐어요!`);
    } else {
      toast(`🌱 ${name}님, 가입이 완료됐어요! 이메일 인증 후 로그인해주세요.`);
      setTimeout(() => {
        location.href = "/pages/auth/login.html";
      }, 1200);
    }
  });
}

// ── 로그인 폼: 이메일+비밀번호로 로그인한다 ──
const loginForm = document.getElementById("login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    if (!email || !password) {
      toast("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
      toast(error.message === "Invalid login credentials" ? "이메일 또는 비밀번호가 올바르지 않아요." : error.message);
      return;
    }
  });
}

// ── Public API (다른 페이지 스크립트에서 사용 가능) ──
// - initAuth()          : Header 인증 상태 초기화(UserChip/Dropdown/로그아웃 바인딩)
// - isLoggedIn()         : 현재 로그인 여부(boolean)
// - getCurrentUser()     : 로그인한 사용자 정보({ name, email, loggedInAt }) 또는 null
// - requireAuth()        : 비로그인 시 login.html로 이동 후 false, 로그인 상태면 true
// - redirectIfLoggedIn() : login.html에서 이미 로그인된 경우 mypage.html로 이동
// - window.authReady     : 최초 세션 조회가 끝나면 resolve되는 Promise(app.js가 가드 실행 전 대기)
