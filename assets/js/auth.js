// ── 공통 인증 모듈 — Supabase Auth(매직링크) 세션 관리 + Header 인증 상태 ──
// 비밀번호 없이 이메일로 매직링크를 보내 인증하는 방식(supabase.auth.signInWithOtp)을 쓴다.
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

  // 매직링크를 클릭하고 돌아온 경우, 로그인/가입 화면에 있다면 마이페이지로 이동한다.
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

// ── 회원가입 폼: 매직링크 메일 발송(계정이 없으면 새로 만든다) ──
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const agreeRequired = document.getElementById("signup-agree-required").checked;
    const agreeMarketing = document.getElementById("signup-agree-marketing").checked;

    if (!name || !email) {
      toast("이름과 이메일을 모두 입력해주세요.");
      return;
    }
    if (!agreeRequired) {
      toast("개인정보 수집 및 이용약관에 동의해야 가입할 수 있어요.");
      return;
    }

    const { error } = await supabaseClient.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: { name, marketing_opt_in: agreeMarketing },
        emailRedirectTo: `${location.origin}/pages/auth/login.html`,
      },
    });

    if (error) {
      toast(error.message);
      return;
    }

    toast(`🌱 ${name}님, 가입이 완료됐어요! 로그인해주세요.`);
    setTimeout(() => {
      location.href = "/pages/auth/login.html";
    }, 1200);
  });
}

// ── 로그인 폼: 이메일 제출 시 실제 매직링크 메일을 발송한다 ──
const loginForm = document.getElementById("login-form");
const pendingPanel = document.getElementById("auth-pending");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();

    if (!email) {
      toast("이메일을 입력해주세요.");
      return;
    }

    const { error } = await supabaseClient.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${location.origin}/pages/auth/login.html`,
      },
    });

    if (error) {
      toast("가입되지 않은 이메일이에요. 먼저 가입해주세요.");
      return;
    }

    document.getElementById("auth-pending-email").textContent = email;
    loginForm.hidden = true;
    pendingPanel.hidden = false;
    toast("📩 인증 메일을 보냈어요! 메일함을 확인해주세요.");
  });
}

// data-action="resend-verification": 인증 메일(매직링크) 재발송
document.querySelectorAll('[data-action="resend-verification"]').forEach((btn) => {
  btn.addEventListener("click", async () => {
    const email = document.getElementById("auth-pending-email")?.textContent;
    if (!email) return;

    const { error } = await supabaseClient.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${location.origin}/pages/auth/login.html`,
      },
    });

    toast(error ? error.message : "📩 인증 메일을 다시 보냈어요!");
  });
});

// ── Public API (다른 페이지 스크립트에서 사용 가능) ──
// - initAuth()          : Header 인증 상태 초기화(UserChip/Dropdown/로그아웃 바인딩)
// - isLoggedIn()         : 현재 로그인 여부(boolean)
// - getCurrentUser()     : 로그인한 사용자 정보({ name, email, loggedInAt }) 또는 null
// - requireAuth()        : 비로그인 시 login.html로 이동 후 false, 로그인 상태면 true
// - redirectIfLoggedIn() : login.html에서 이미 로그인된 경우 mypage.html로 이동
// - window.authReady     : 최초 세션 조회가 끝나면 resolve되는 Promise(app.js가 가드 실행 전 대기)
