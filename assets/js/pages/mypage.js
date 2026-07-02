// ── 마이페이지 대시보드 / 프로필 수정 — MyPage(Job/My) 담당, 신규 파일 ──
// 신규 파일: 공식 WORK_ORDER.md 스코프 밖 프로토타입. 프로필 수정 내용을
// 대시보드에 실시간 반영하기 위해 localStorage를 상태 저장소로 쓴다.
// (JSON_GUIDE.md 규칙상 storage.js 신설은 원래 공통 담당자 판단 영역이라
// 정식 반영 전 공통 담당자 리뷰가 필요하다. 로그인 상태/Header UI/로그아웃은
// assets/js/auth.js가 전담한다.)

// 개발/테스트 편의를 위해 로그인 여부와 무관하게 대시보드를 자유롭게 볼 수 있도록
// 강제 리다이렉트/얼럿 가드는 두지 않는다. (이전 버전에 있던 requireAuth()는 제거됨)

const PROFILE_KEY = "sesac.mypage.profile";

// ── 프로필에 표시할 이름 결정: 수정한 이름 > 가입/로그인 사용자 이름 > GUEST ──
// auth.js 내부(localStorage, AUTH_SESSION_KEY)는 절대 직접 건드리지 않고,
// auth.js가 제공하는 Public API(getCurrentUser())만 통해서 접근한다.
function getDisplayName() {
  const override = readProfileOverride();
  if (override.name) return override.name;

  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  if (user && user.name) return user.name;

  return "GUEST";
}

function getDisplayUsername() {
  const override = readProfileOverride();
  if (override.username) return override.username;

  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  if (user && user.email) return user.email.split("@")[0];

  return "guest";
}

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

// ── 대시보드: 가입/로그인 이름 + 수정한 프로필 내역을 화면에 즉시 반영 ──
function applyProfileToDashboard() {
  const nameEl = document.getElementById("profile-name");
  const userEl = document.getElementById("profile-username");
  const avatarEl = document.getElementById("profile-avatar");

  if (nameEl) nameEl.textContent = getDisplayName();
  if (userEl) userEl.textContent = "@" + getDisplayUsername();

  const p = readProfileOverride();
  if (avatarEl && p.avatarUrl) {
    avatarEl.innerHTML = `<img src="${p.avatarUrl}" alt="프로필 사진">`;
  }
}
applyProfileToDashboard();

// ── 프로필 수정: 저장된 값이 있으면 폼 기본값 위에 덮어써서 프리필 ──
function prefillEditForm() {
  const p = readProfileOverride();

  const map = {
    "acc-username": p.username,
    "acc-name": p.name,
    "acc-github": p.githubUsername,
    "acc-language": p.language,
    "email-input": p.email,
  };
  Object.entries(map).forEach(([id, value]) => {
    if (value === undefined) return;
    const el = document.getElementById(id);
    if (el) el.value = value;
  });

  const marketingEl = document.getElementById("acc-marketing");
  if (marketingEl && typeof p.isMarketingAgreed === "boolean") {
    marketingEl.checked = p.isMarketingAgreed;
  }

  const avatarPreview = document.getElementById("avatar-preview");
  if (avatarPreview && p.avatarUrl) {
    avatarPreview.innerHTML = `<img src="${p.avatarUrl}" alt="프로필 사진 미리보기">`;
  }
}
prefillEditForm();

// ── Account Information 저장 ──
const accountForm = document.getElementById("account-form");
if (accountForm) {
  accountForm.addEventListener("submit", (e) => {
    e.preventDefault();
    saveProfileOverride({
      username: document.getElementById("acc-username").value.trim(),
      name: document.getElementById("acc-name").value.trim(),
      githubUsername: document.getElementById("acc-github").value.trim(),
      language: document.getElementById("acc-language").value,
      isMarketingAgreed: document.getElementById("acc-marketing").checked,
    });
    toast("✅ 계정 정보가 저장됐어요!");
  });
}

// ── Email 변경 ──
const emailForm = document.getElementById("email-form");
if (emailForm) {
  emailForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email-input").value.trim();
    if (!email) {
      toast("이메일을 입력해주세요.");
      return;
    }
    saveProfileOverride({ email });
    toast("📧 로그인 이메일이 변경됐어요!");
  });
}

// ── Profile 아바타 업로드 (FileReader로 미리보기 + localStorage 저장) ──
const avatarInput = document.getElementById("avatar-input");
const avatarPreview = document.getElementById("avatar-preview");
let pendingAvatarDataUrl = null;

if (avatarInput) {
  avatarInput.addEventListener("change", () => {
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

const avatarForm = document.getElementById("avatar-form");
if (avatarForm) {
  avatarForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!pendingAvatarDataUrl) {
      toast("업로드할 사진을 먼저 선택해주세요.");
      return;
    }
    saveProfileOverride({ avatarUrl: pendingAvatarDataUrl });
    toast("🖼 프로필 사진이 저장됐어요!");
  });
}

// ── Delete Account: 확인 체크박스를 눌러야만 삭제 버튼이 활성화된다 ──
const deleteConfirmCheckbox = document.getElementById("delete-confirm");
const deleteAccountBtn = document.getElementById("delete-account-btn");

if (deleteConfirmCheckbox && deleteAccountBtn) {
  deleteConfirmCheckbox.addEventListener("change", () => {
    deleteAccountBtn.disabled = !deleteConfirmCheckbox.checked;
  });

  deleteAccountBtn.addEventListener("click", () => {
    if (deleteAccountBtn.disabled) return;
    // 이 팀 소유 데이터(마이페이지 프로필)만 정리한다. 로그인 세션 종료는
    // auth.js 내부(AUTH_SESSION_KEY)를 직접 건드리지 않고, auth.js가 별도로
    // 제공하는 로그아웃 경로(헤더 드롭다운의 "로그아웃")를 그대로 이용해야 한다 —
    // 현재 auth.js Public API 목록에는 세션을 지우는 함수가 없어 여기서는 호출하지 않는다.
    localStorage.removeItem(PROFILE_KEY);
    toast("계정 데이터가 삭제됐어요. (테스트 환경 — 로컬 저장 데이터만 초기화됩니다)");
    setTimeout(() => {
      location.href = "login.html";
    }, 1200);
  });
}

// 날짜 포맷 헬퍼 — CSV/Word 내보내기 파일명에 쓰인다.
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ── Challenges / Activities 탭 전환 (대시보드 우측 패널) ──
document.querySelectorAll(".achievement-tab").forEach((tabBtn) => {
  tabBtn.addEventListener("click", () => {
    const target = tabBtn.dataset.tab;

    document.querySelectorAll(".achievement-tab").forEach((b) => {
      b.classList.remove("achievement-tab--active");
      b.setAttribute("aria-selected", "false");
    });
    tabBtn.classList.add("achievement-tab--active");
    tabBtn.setAttribute("aria-selected", "true");

    document.querySelectorAll(".achievement-tab-content").forEach((panel) => {
      panel.classList.toggle(
        "achievement-tab-content--active",
        panel.dataset.tabPanel === target,
      );
    });
  });
});

// ── 기술 뱃지(Activities 탭) — localStorage 상태 기반 실시간 렌더링 ──
// assets/data/my_handbook.json의 badges 배열과 동일한 구성을 시드 데이터로 쓴다.
const BADGES_KEY = "sesac.mypage.badges";

const BADGE_DEFS = [
  { id: "badge-adx201", label: "ADX 201", icon: "☁️" },
  { id: "badge-html", label: "HTML5", icon: "🧱" },
  { id: "badge-css", label: "CSS3", icon: "🎨" },
  { id: "badge-java", label: "Java", icon: "☕" },
  { id: "badge-sql", label: "SQL", icon: "🗄️" },
  { id: "badge-javascript", label: "JavaScript", icon: "⚡" },
  { id: "badge-git", label: "Git/GitHub", icon: "🌿" },
  { id: "badge-claudecode", label: "CLAUDE CODE", icon: "🤖" },
];

const DEFAULT_BADGE_STATE = {
  "badge-adx201": false,
  "badge-html": true,
  "badge-css": true,
  "badge-java": false,
  "badge-sql": true,
  "badge-javascript": false,
  "badge-git": true,
  "badge-claudecode": true,
};

function readBadgeState() {
  try {
    const stored = JSON.parse(localStorage.getItem(BADGES_KEY));
    if (stored) return stored;
  } catch {
    /* fall through to seed */
  }
  localStorage.setItem(BADGES_KEY, JSON.stringify(DEFAULT_BADGE_STATE));
  return { ...DEFAULT_BADGE_STATE };
}

function renderBadges() {
  const grid = document.getElementById("badge-grid");
  if (!grid) return;
  const state = readBadgeState();

  grid.innerHTML = BADGE_DEFS.map((badge) => {
    const earned = !!state[badge.id];
    const lockIcon = earned ? "" : '<span class="badge-circle__lock" aria-hidden="true">🔒</span>';
    return `
      <div class="badge-circle${earned ? "" : " badge-circle--locked"}">
        <span class="badge-circle__icon" aria-hidden="true">${badge.icon}${lockIcon}</span>
        <span class="badge-circle__label">${badge.label}</span>
      </div>`;
  }).join("");
}
renderBadges();

// 실제 퀴즈 채점 로직(다른 페이지)이 완료 시 호출할 공개 API.
// 이미 획득한 뱃지는 다시 토스트를 띄우지 않는다.
function unlockSkillBadge(badgeId) {
  const state = readBadgeState();
  if (state[badgeId]) return false;

  state[badgeId] = true;
  localStorage.setItem(BADGES_KEY, JSON.stringify(state));
  renderBadges();

  const def = BADGE_DEFS.find((b) => b.id === badgeId);
  if (def) toast(`🎉 "${def.label}" 뱃지를 획득했어요!`);
  return true;
}
window.unlockSkillBadge = unlockSkillBadge;

// ── 저장한 단어 목록(mywords.html) — localStorage 상태 기반 카테고리별 렌더링 ──
const WORDS_KEY = "sesac.mywords.list";

const DEFAULT_WORDS = [];

function readWords() {
  try {
    const stored = JSON.parse(localStorage.getItem(WORDS_KEY));
    if (stored) return stored;
  } catch {
    /* fall through to seed */
  }
  localStorage.setItem(WORDS_KEY, JSON.stringify(DEFAULT_WORDS));
  return [...DEFAULT_WORDS];
}

function writeWords(words) {
  localStorage.setItem(WORDS_KEY, JSON.stringify(words));
}

// 카테고리별 "도감" 카드 아이콘 — 정의되지 않은 카테고리는 기본 📘을 쓴다.
const WORD_CATEGORY_ICONS = {
  "CS/IT": "💻",
  Java: "☕",
  SQL: "🗄️",
  "IT/개발": "🔧",
  JavaScript: "⚡",
  HTML: "🧱",
  CSS: "🎨",
  Git: "🌿",
  비즈니스: "💼",
  기타: "📘",
};

// 단어 추가/수정 모달의 카테고리 선택값 → 태그 색상 매핑(두 흐름에서 공유).
const CATEGORY_TAG_COLOR = { SQL: "green", Java: "orange", "CS/IT": "blue", 비즈니스: "gray", 기타: "gray" };

// ── 검색 / 정렬 / 즐겨찾기만 보기 ──
let wordSearchQuery = "";
let wordSortMode = null; // null(기본 순서) | "term"(영어순) | "definition"(이름순)
let wordFavoritesOnly = false;

function getFilteredSortedWords() {
  let list = readWords();

  if (wordFavoritesOnly) list = list.filter((w) => w.favorite);

  const query = wordSearchQuery.trim().toLowerCase();
  if (query) {
    list = list.filter(
      (w) => w.term.toLowerCase().includes(query) || w.definition.toLowerCase().includes(query)
    );
  }

  if (wordSortMode) {
    list = [...list].sort((a, b) => (a[wordSortMode] || "").localeCompare(b[wordSortMode] || "", "ko"));
  }

  return list;
}

function buildWordRowSection(category, list) {
  return `
    <div class="word-row-group">
      <p class="section-title section-title--sm">${category} <span class="word-row-group__count">${list.length}개</span></p>
      <ul class="word-row-list">
        ${list.map((w) => `
          <li class="word-row" data-word-id="${w.id}">
            <div class="word-row__body">
              <div><span class="word-row__term">${w.term}</span><span class="word-row__pos">${w.pos}</span></div>
              <div class="word-row__def">${w.definition}</div>
              <div class="word-row__example">${w.example}</div>
            </div>
            <span class="tag tag--${w.categoryColor}">${w.category}</span>
            <span class="word-row__date">${w.date}</span>
            <div class="word-row__actions">
              <button type="button" class="favorite-star${w.favorite ? " favorite-star--on" : ""}"
                data-action="toggle-favorite" aria-pressed="${!!w.favorite}" aria-label="즐겨찾기 토글">★</button>
              <button type="button" class="btn btn--outline btn--sm" data-action="edit-word" aria-label="단어 수정">✎</button>
              <button type="button" class="btn btn--danger btn--sm" data-action="delete-word" aria-label="단어 삭제">🗑</button>
            </div>
          </li>`).join("")}
      </ul>
    </div>`;
}

// "단어 도감(Pokédex)" 스타일 — 대시보드 [저장한 단어] 인페이지 패널 전용.
function buildWordCardSection(category, list) {
  const icon = WORD_CATEGORY_ICONS[category] || "📘";
  return `
    <div class="word-row-group">
      <p class="section-title section-title--sm">${category} <span class="word-row-group__count">${list.length}개</span></p>
      <div class="word-card-grid">
        ${list.map((w, i) => `
          <div class="word-card" data-word-id="${w.id}">
            <button type="button" class="favorite-star word-card__favorite${w.favorite ? " favorite-star--on" : ""}"
              data-action="toggle-favorite" aria-pressed="${!!w.favorite}" aria-label="즐겨찾기 토글">★</button>
            <span class="word-card__no">No. ${String(i + 1).padStart(3, "0")}</span>
            <span class="word-card__icon" aria-hidden="true">${icon}</span>
            <p class="word-card__term">${w.term}</p>
            <span class="word-card__pos">${w.pos}</span>
            <span class="tag tag--${w.categoryColor} word-card__category">${w.category}</span>
            <p class="word-card__definition">${w.definition}</p>
            <div class="word-card__footer">
              <span class="word-card__example">${w.example || "&nbsp;"}</span>
              <span class="word-card__date">${w.date}</span>
            </div>
            <div class="word-card__actions">
              <button type="button" class="btn btn--outline btn--sm" data-action="edit-word" aria-label="단어 수정">✎ 수정</button>
              <button type="button" class="btn btn--danger btn--sm" data-action="delete-word" aria-label="단어 삭제">🗑 삭제</button>
            </div>
          </div>`).join("")}
      </div>
    </div>`;
}

// style: "rows"(mywords.html 기본 목록) | "cards"(대시보드 단어 도감)
let currentWordStyle = "rows";
function renderWordGroups(style = currentWordStyle) {
  currentWordStyle = style;
  const allWords = readWords();

  const countEl = document.getElementById("word-total-count");
  if (countEl) countEl.textContent = allWords.length;

  const container = document.getElementById("word-row-groups");
  if (!container) return;

  const words = getFilteredSortedWords();
  if (words.length === 0) {
    container.innerHTML = allWords.length === 0
      ? '<p class="page-subtitle">아직 저장한 단어가 없어요. 단어를 추가해보세요!</p>'
      : '<p class="page-subtitle">조건에 맞는 단어가 없어요.</p>';
    return;
  }

  const groups = {};
  words.forEach((w) => {
    if (!groups[w.category]) groups[w.category] = [];
    groups[w.category].push(w);
  });

  const buildSection = style === "cards" ? buildWordCardSection : buildWordRowSection;
  container.innerHTML = Object.entries(groups)
    .map(([category, list]) => buildSection(category, list))
    .join("");
}
renderWordGroups();

// ── 단어 삭제 ──
function deleteWordById(id) {
  if (!confirm("이 단어를 삭제할까요?")) return;
  writeWords(readWords().filter((w) => w.id !== id));
  renderWordGroups();
  toast("🗑 단어를 삭제했어요.");
}

// ── 단어 수정: "+ 단어 추가" 모달을 그대로 재사용해 선택한 단어 값을 채워 연다 ──
let editingWordId = null;

function resetWordModalChrome() {
  const titleEl = document.getElementById("wmodal-title");
  if (titleEl) titleEl.textContent = "📓 단어장에 추가";
  const saveBtn = document.querySelector('[data-action="save-word"]');
  if (saveBtn) saveBtn.textContent = "단어장에 저장";
}

function openWordEditModal(word) {
  editingWordId = word.id;
  if (typeof openModal === "function") openModal(word.term);
  const meaningEl = document.getElementById("mmeaning");
  if (meaningEl) meaningEl.value = word.definition;
  const categoryEl = document.getElementById("mcategory");
  if (categoryEl) categoryEl.value = word.category;
  const titleEl = document.getElementById("wmodal-title");
  if (titleEl) titleEl.textContent = "✏️ 단어 수정";
  const saveBtn = document.querySelector('[data-action="save-word"]');
  if (saveBtn) saveBtn.textContent = "수정 저장";
}

function toggleWordFavorite(id) {
  const words = readWords();
  const target = words.find((w) => w.id === id);
  if (!target) return;
  target.favorite = !target.favorite;
  writeWords(words);
  renderWordGroups();
}

// 도감(카드)/목록(행) 어느 스타일로 렌더링되든 같은 컨테이너 안에서 새로 그려지므로
// 개별 리스너 대신 위임 방식으로 한 번만 등록한다.
document.addEventListener("click", (e) => {
  const favBtn = e.target.closest('[data-action="toggle-favorite"]');
  if (favBtn) {
    const id = favBtn.closest("[data-word-id]")?.dataset.wordId;
    if (id) toggleWordFavorite(id);
    return;
  }

  const editBtn = e.target.closest('[data-action="edit-word"]');
  if (editBtn) {
    const id = editBtn.closest("[data-word-id]")?.dataset.wordId;
    const word = readWords().find((w) => w.id === id);
    if (word) openWordEditModal(word);
    return;
  }

  const deleteBtn = e.target.closest('[data-action="delete-word"]');
  if (deleteBtn) {
    const id = deleteBtn.closest("[data-word-id]")?.dataset.wordId;
    if (id) deleteWordById(id);
    return;
  }

  const sortBtn = e.target.closest(".sort-pill[data-sort]");
  if (sortBtn) {
    const mode = sortBtn.dataset.sort;
    wordSortMode = wordSortMode === mode ? null : mode;
    (sortBtn.parentElement || document).querySelectorAll(".sort-pill").forEach((btn) => {
      btn.classList.toggle("sort-pill--active", btn.dataset.sort === wordSortMode);
    });
    renderWordGroups();
    return;
  }

  const favOnlyBtn = e.target.closest('[data-action="toggle-favorites-only"]');
  if (favOnlyBtn) {
    wordFavoritesOnly = !wordFavoritesOnly;
    favOnlyBtn.classList.toggle("btn--primary", wordFavoritesOnly);
    favOnlyBtn.classList.toggle("btn--outline", !wordFavoritesOnly);
    favOnlyBtn.setAttribute("aria-pressed", String(wordFavoritesOnly));
    renderWordGroups();
  }
});

document.addEventListener("input", (e) => {
  if (e.target.id !== "word-search") return;
  wordSearchQuery = e.target.value;
  renderWordGroups();
});

// "+ 단어 추가" 버튼으로 모달을 새로 열거나 취소로 닫을 때는 이전 수정 상태가
// 남아있지 않도록 초기화한다(모달 자체는 static 마크업이라 매번 다시 그려지지 않음).
document.querySelectorAll('[data-action="open-modal"]').forEach((btn) => {
  btn.addEventListener("click", () => {
    editingWordId = null;
    resetWordModalChrome();
    const meaningEl = document.getElementById("mmeaning");
    if (meaningEl) meaningEl.value = "";
  });
});

document.querySelectorAll('[data-action="close-modal"]').forEach((btn) => {
  btn.addEventListener("click", () => {
    editingWordId = null;
    resetWordModalChrome();
  });
});

// ── "+ 단어 추가" 모달 저장 → 마이핸드북 단어 데이터에 실제로 반영 ──
// 모달을 열고 닫는 로직 자체는 공통 modal.js 소유라 그대로 두고, 여기서는
// data-action="save-word" 클릭 시 입력값을 sesac.mywords.list에 추가/수정으로 적재해
// 대시보드 [저장한 단어] 영역과 실제로 연동되도록 한다(리스너 추가만, 충돌 없음).
// editingWordId가 있으면 "✎ 수정"으로 열린 상태이므로 새로 추가하지 않고 기존 항목을 갱신한다.
document.querySelectorAll('[data-action="save-word"]').forEach((btn) => {
  btn.addEventListener("click", () => {
    const termEl = document.getElementById("mword");
    const meaningEl = document.getElementById("mmeaning");
    const categoryEl = document.getElementById("mcategory");
    if (!termEl || !meaningEl || !categoryEl) return;

    const term = termEl.value.trim();
    if (!term) return;

    const category = categoryEl.value;
    const words = readWords();

    if (editingWordId) {
      const target = words.find((w) => w.id === editingWordId);
      if (target) {
        target.term = term;
        target.definition = meaningEl.value.trim() || "(뜻 미입력)";
        target.category = category;
        target.categoryColor = CATEGORY_TAG_COLOR[category] || "gray";
      }
      editingWordId = null;
      resetWordModalChrome();
    } else {
      words.push({
        id: `word-${Date.now()}`,
        term,
        pos: "명사",
        definition: meaningEl.value.trim() || "(뜻 미입력)",
        example: "",
        category,
        categoryColor: CATEGORY_TAG_COLOR[category] || "gray",
        date: todayStr().replace(/-/g, "."),
        favorite: false,
      });
    }
    writeWords(words);
    renderWordGroups();
  });
});

// ── 저장한 단어 내보내기 (CSV / Word) ──
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function exportWordsToCSV() {
  const words = readWords();
  const header = ["카테고리", "단어", "뜻", "저장일"];
  const csvEscape = (value) => `"${String(value).replace(/"/g, '""')}"`;

  const rows = words.map((w) => [w.category, w.term, w.definition, w.date].map(csvEscape).join(","));
  const csvBody = [header.map(csvEscape).join(","), ...rows].join("\r\n");

  // UTF-8 BOM(﻿)을 붙여야 엑셀에서 한글이 깨지지 않는다.
  const blob = new Blob(['\uFEFF' + csvBody], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `저장한_단어_${todayStr()}.csv`);
  toast("📄 CSV 파일로 내보냈어요!");
}

function exportWordsToDoc() {
  const words = readWords();
  const groups = {};
  words.forEach((w) => {
    if (!groups[w.category]) groups[w.category] = [];
    groups[w.category].push(w);
  });

  const sections = Object.entries(groups)
    .map(([category, list]) => `
      <h2 style="color:#2D7A3A;">${category}</h2>
      <table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;width:100%;font-family:'Malgun Gothic',sans-serif;">
        <tr style="background:#E8F5E9;"><th>단어</th><th>뜻</th><th>저장일</th></tr>
        ${list.map((w) => `<tr><td>${w.term}</td><td>${w.definition}</td><td>${w.date}</td></tr>`).join("")}
      </table>`)
    .join("<br>");

  // 실제 .docx 바이너리 대신, Word가 열 수 있는 HTML 기반 .doc 포맷으로 내보낸다
  // (별도 라이브러리 없이 브라우저만으로 Word 호환 파일을 만드는 표준적인 방법).
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"><title>저장한 단어</title></head>
    <body>
      <h1 style="color:#1A5C28;">나의 저장한 단어 (${todayStr()})</h1>
      ${sections}
    </body></html>`;

  const blob = new Blob(['\uFEFF' + html], { type: "application/msword;charset=utf-8;" });
  downloadBlob(blob, `저장한_단어_${todayStr()}.doc`);
  toast("📝 Word 파일로 내보냈어요!");
}

document.querySelectorAll('[data-action="export-words-csv"]').forEach((btn) => {
  btn.addEventListener("click", exportWordsToCSV);
});
document.querySelectorAll('[data-action="export-words-doc"]').forEach((btn) => {
  btn.addEventListener("click", exportWordsToDoc);
});

// ── 오늘의 단어 퀴즈(mywords.html) 정답 판정 → 관련 기술 뱃지 잠금 해제 ──
// .word-quiz__option의 선택 스타일 토글은 Exam 담당 소유 quiz.js가 처리하므로,
// 여기서는 그 동작을 건드리지 않고 정답 판정만 추가로 얹는다(리스너 추가만, 충돌 없음).
const CATEGORY_TO_BADGE_ID = {
  SQL: "badge-sql",
  Java: "badge-java",
  "CS/IT": "badge-javascript",
  "IT/개발": "badge-javascript",
  JavaScript: "badge-javascript",
  HTML: "badge-html",
  CSS: "badge-css",
  Git: "badge-git",
  Salesforce: "badge-adx201",
};

// mywords.html 자체 페이지에 있는 "오늘의 단어 퀴즈" 위젯 전용 바인딩이다.
// (대시보드 [저장한 단어] 인페이지 패널에는 이 퀴즈 위젯을 넣지 않기로 해서 제외했다.)
function bindWordQuizOptions(scope = document) {
  const options = scope.querySelectorAll(".word-quiz__option");
  if (options.length === 0) return;

  const CORRECT_OPTION_INDEX = 0; // "① 알고리즘" — words.json todayQuiz.answerIndex와 동일
  const QUIZ_CATEGORY = "CS/IT"; // 오늘의 단어(Algorithm)가 속한 카테고리

  options.forEach((option, index) => {
    option.addEventListener("click", () => {
      if (index !== CORRECT_OPTION_INDEX) {
        toast("아쉬워요! 다시 도전해보세요.");
        return;
      }
      const badgeId = CATEGORY_TO_BADGE_ID[QUIZ_CATEGORY];
      if (badgeId) unlockSkillBadge(badgeId);
    });
  });
}
bindWordQuizOptions();

// ── 퀴즈 도전 과제 → 체크포인트 세분화 ──
// 기존에는 과제 하나당 진행률 바(%) 하나로만 표시했지만, 과제를 더 작은
// 체크포인트 단위로 쪼개 하나씩 완료 체크할 수 있게 한다(job-features.js의
// 스펙 가이드 체크리스트와 같은 UX 패턴을 MyPage 쪽 마크업/CSS로 재구현).
const QUIZ_CHALLENGES = [
  {
    id: "wiki3",
    title: "이번 주 새싹위키 3개 완독하기",
    checkpoints: [
      { id: "wiki3-1", label: "1편 완독하기" },
      { id: "wiki3-2", label: "2편 완독하기" },
      { id: "wiki3-3", label: "3편 완독하기" },
    ],
  },
  {
    id: "exam1",
    title: "모의고사 1회 응시하기",
    checkpoints: [{ id: "exam1-1", label: "모의고사 1회 응시 완료" }],
  },
];

const QUIZ_CHECKPOINTS_KEY = "sesac.mypage.quizCheckpoints";
// 기존 진행률(66%, 100%)과 맞춘 초기값 — 새싹위키 3개 중 2개, 모의고사는 완료 상태로 시작.
const DEFAULT_QUIZ_CHECKPOINTS = { "wiki3-1": true, "wiki3-2": true, "wiki3-3": false, "exam1-1": true };

function readQuizCheckpoints() {
  try {
    const stored = JSON.parse(localStorage.getItem(QUIZ_CHECKPOINTS_KEY));
    if (stored) return stored;
  } catch {
    /* fall through to seed */
  }
  localStorage.setItem(QUIZ_CHECKPOINTS_KEY, JSON.stringify(DEFAULT_QUIZ_CHECKPOINTS));
  return { ...DEFAULT_QUIZ_CHECKPOINTS };
}

function writeQuizCheckpoints(state) {
  localStorage.setItem(QUIZ_CHECKPOINTS_KEY, JSON.stringify(state));
}

function buildChallengeCheckpoints(task, state) {
  const doneCount = task.checkpoints.filter((cp) => state[cp.id]).length;
  return `
    <div class="challenge-row">
      <div class="challenge-row__header">
        <p class="challenge-row__title">${task.title}</p>
        <span class="challenge-row__count">${doneCount}/${task.checkpoints.length}</span>
      </div>
      <ul class="checkpoint-list">
        ${task.checkpoints.map((cp) => `
          <li class="checkpoint-item${state[cp.id] ? " checkpoint-item--done" : ""}">
            <button type="button"
              class="checkpoint-item__check${state[cp.id] ? " checkpoint-item__check--done" : ""}"
              data-action="toggle-checkpoint" data-checkpoint-id="${cp.id}"
              aria-pressed="${!!state[cp.id]}"
              aria-label="${cp.label} ${state[cp.id] ? "완료 취소" : "완료로 표시"}">
              ${state[cp.id] ? "✓" : ""}
            </button>
            <span class="checkpoint-item__label">${cp.label}</span>
          </li>`).join("")}
      </ul>
    </div>`;
}

document.addEventListener("click", (e) => {
  const toggleBtn = e.target.closest('[data-action="toggle-checkpoint"]');
  if (!toggleBtn) return;

  const state = readQuizCheckpoints();
  const id = toggleBtn.dataset.checkpointId;
  state[id] = !state[id];
  writeQuizCheckpoints(state);

  const panel = document.getElementById("category-detail-panel");
  if (panel && panel.querySelector(".checkpoint-list")) {
    panel.innerHTML = CATEGORY_DETAIL_TEMPLATES.quiz();
  }
});

// ── 대시보드 인페이지(In-Page) 카테고리 카드 → 하단 확장 패널 ──
// 좌측 사이드바를 대체한다: 카드를 클릭하면 페이지 이동 없이 대시보드
// 메인 바로 아래 영역에 해당 카테고리 내용이 펼쳐진다(다시 클릭하면 접힘).
const CATEGORY_DETAIL_TEMPLATES = {
  words: () => `
    <div class="category-detail__header">
      <h3 class="category-detail__title">📓 나의 단어 도감</h3>
      <div class="word-export-dropdown" id="word-export-dropdown">
        <button type="button" class="word-export-dropdown__trigger" id="word-export-trigger"
          aria-haspopup="true" aria-expanded="false">내보내기 ▾</button>
        <div class="word-export-dropdown__menu" id="word-export-menu" role="menu">
          <button type="button" class="word-export-dropdown__item" role="menuitem"
            data-action="export-words-csv">📄 .csv 다운로드</button>
          <button type="button" class="word-export-dropdown__item" role="menuitem"
            data-action="export-words-doc">📝 .word 다운로드</button>
        </div>
      </div>
    </div>
    <div class="my-toolbar">
      <label class="sr-only" for="word-search">단어 검색</label>
      <input type="text" id="word-search" class="my-toolbar__input" placeholder="단어를 검색하세요">
      <div class="sort-pills">
        <button type="button" class="sort-pill" data-sort="term">영어순</button>
        <button type="button" class="sort-pill" data-sort="definition">이름순</button>
      </div>
      <button type="button" class="btn btn--outline btn--sm" data-action="toggle-favorites-only" aria-pressed="false">⭐ 즐겨찾기만</button>
    </div>
    <div class="word-stats">
      <div class="word-stats__box">
        <p class="word-stats__value" id="word-total-count">${readWords().length}</p>
        <p class="word-stats__label">전체 단어</p>
      </div>
    </div>
    <div class="word-row-groups" id="word-row-groups"></div>`,

  quiz: () => `
    <div class="category-detail__header">
      <h3 class="category-detail__title">🎯 퀴즈 도전</h3>
      <a href="exam.html" class="btn btn--outline btn--sm">모의고사 풀러가기 ›</a>
    </div>
    <div class="challenge-list">
      ${QUIZ_CHALLENGES.map((task) => buildChallengeCheckpoints(task, readQuizCheckpoints())).join("")}
    </div>
    <p class="page-subtitle category-detail__note">퀴즈에서 만점을 받으면 관련 기술 뱃지가 잠금 해제돼요!</p>`,
};

function openCategoryDetail(category, cardEl) {
  const panel = document.getElementById("category-detail-panel");
  if (!panel) return;

  const wasActive = cardEl.classList.contains("category-card--active");
  document.querySelectorAll(".category-card").forEach((c) => c.classList.remove("category-card--active"));

  if (wasActive) {
    panel.classList.remove("category-detail-panel--open");
    return;
  }

  cardEl.classList.add("category-card--active");
  // 패널을 새로 열 때마다 검색/정렬/즐겨찾기 필터를 기본값으로 되돌려
  // 툴바(입력창·버튼)를 방금 그려진 마크업과 항상 일치하는 상태로 시작한다.
  if (category === "words") {
    wordSearchQuery = "";
    wordSortMode = null;
    wordFavoritesOnly = false;
  }
  const buildTemplate = CATEGORY_DETAIL_TEMPLATES[category];
  panel.innerHTML = buildTemplate ? buildTemplate() : "";
  panel.classList.add("category-detail-panel--open");

  // "저장한 단어" 카드는 실제 데이터를 도감(카드) 스타일로 다시 채워 넣어야 한다
  // (innerHTML 교체로 이전에 그려둔 내용과 리스너가 모두 사라졌기 때문).
  if (category === "words") {
    renderWordGroups("cards");
    bindWordExportTrigger(panel);
  }

  // 내보내기 메뉴 항목도 방금 새로 삽입됐으므로 리스너를 다시 건다.
  panel.querySelectorAll('[data-action="export-words-csv"]').forEach((btn) => {
    btn.addEventListener("click", exportWordsToCSV);
  });
  panel.querySelectorAll('[data-action="export-words-doc"]').forEach((btn) => {
    btn.addEventListener("click", exportWordsToDoc);
  });

  panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

document.querySelectorAll(".category-card").forEach((card) => {
  card.addEventListener("click", () => openCategoryDetail(card.dataset.category, card));
});

// ── 단일 [내보내기] 버튼 → 드롭다운 메뉴 (.csv / .word) ──
// 트리거 클릭 토글은 패널이 새로 그려질 때마다 다시 걸어야 하지만(bindWordExportTrigger),
// 바깥 클릭 시 닫는 로직은 요소를 매번 조회하는 위임 방식이라 한 번만 등록하면 된다.
function bindWordExportTrigger(scope) {
  const trigger = scope.querySelector("#word-export-trigger");
  const menu = scope.querySelector("#word-export-menu");
  if (!trigger || !menu) return;

  trigger.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("word-export-dropdown__menu--open");
    trigger.setAttribute("aria-expanded", String(isOpen));
  });

  menu.querySelectorAll("[data-action]").forEach((item) => {
    item.addEventListener("click", () => {
      menu.classList.remove("word-export-dropdown__menu--open");
      trigger.setAttribute("aria-expanded", "false");
    });
  });
}

document.addEventListener("click", (e) => {
  const trigger = document.getElementById("word-export-trigger");
  const menu = document.getElementById("word-export-menu");
  if (!trigger || !menu) return;
  if (trigger.contains(e.target) || menu.contains(e.target)) return;
  menu.classList.remove("word-export-dropdown__menu--open");
  trigger.setAttribute("aria-expanded", "false");
});
