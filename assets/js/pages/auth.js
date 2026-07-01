// ── 인증(로그인/회원가입) 프로토타입 — MyPage(Job/My) 담당, 마이페이지 진입 전 단계 ──
// 신규 파일: 공식 WORK_ORDER.md 스코프 밖의 프로토타입이며, localStorage 상태
// 저장 로직은 JSON_GUIDE.md 규칙상 원래 공통 담당자(feature/core)의 storage.js
// 신설 판단 영역이다. 정식 반영 전 공통 담당자 리뷰가 필요하다.
// 실제 이메일 발송/서버 인증이 없는 정적 프론트엔드라, 이메일 인증은
// "인증 대기 패널 + 확인 버튼"으로 모킹한다.
const AUTH_USERS_KEY = 'sesac.auth.users';
const AUTH_SESSION_KEY = 'sesac.auth.session';
const AUTH_PENDING_KEY = 'sesac.auth.pendingEmail';

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
  return readUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}

function setSession(user) {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({
    name: user.name,
    email: user.email,
    loggedInAt: new Date().toISOString()
  }));
}

// ── 회원가입 폼 ──
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const agreeRequired = document.getElementById('signup-agree-required').checked;
    const agreeMarketing = document.getElementById('signup-agree-marketing').checked;

    if (!name || !email) {
      toast('이름과 이메일을 모두 입력해주세요.');
      return;
    }
    if (!agreeRequired) {
      toast('개인정보 수집 및 이용약관에 동의해야 가입할 수 있어요.');
      return;
    }
    if (findUserByEmail(email)) {
      toast('이미 가입된 이메일이에요. 로그인해주세요.');
      return;
    }

    const users = readUsers();
    users.push({
      name,
      email,
      marketingOptIn: agreeMarketing,
      createdAt: new Date().toISOString()
    });
    writeUsers(users);

    toast(`🌱 ${name}님, 가입이 완료됐어요! 로그인해주세요.`);
    setTimeout(() => { location.href = 'login.html'; }, 1200);
  });
}

// ── 로그인 폼: 이메일 제출 시 인증 메일 발송을 모킹한다 ──
const loginForm = document.getElementById('login-form');
const pendingPanel = document.getElementById('auth-pending');

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();

    if (!email) {
      toast('이메일을 입력해주세요.');
      return;
    }
    if (!findUserByEmail(email)) {
      toast('가입되지 않은 이메일이에요. 먼저 가입해주세요.');
      return;
    }

    localStorage.setItem(AUTH_PENDING_KEY, email);
    document.getElementById('auth-pending-email').textContent = email;
    loginForm.hidden = true;
    pendingPanel.hidden = false;
    toast('📩 인증 메일을 보냈어요! (모킹)');
  });
}

// data-action="mock-verify": 이메일 속 인증 링크 클릭을 흉내내는 테스트 버튼
document.querySelectorAll('[data-action="mock-verify"]').forEach(btn => {
  btn.addEventListener('click', () => {
    const email = localStorage.getItem(AUTH_PENDING_KEY);
    const user = email && findUserByEmail(email);
    if (!user) {
      toast('인증할 이메일 정보가 없어요. 다시 로그인해주세요.');
      return;
    }
    setSession(user);
    localStorage.removeItem(AUTH_PENDING_KEY);
    toast(`✅ 인증 완료! ${user.name}님 환영합니다.`);
    setTimeout(() => { location.href = 'mypage.html'; }, 1000);
  });
});

// data-action="mock-resend": 인증 메일 재발송 모킹
document.querySelectorAll('[data-action="mock-resend"]').forEach(btn => {
  btn.addEventListener('click', () => toast('📩 인증 메일을 다시 보냈어요! (모킹)'));
});
