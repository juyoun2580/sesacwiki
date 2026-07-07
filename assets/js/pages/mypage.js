// ── 마이페이지 대시보드 / 프로필 수정 — MyPage(Job/My) 담당 ──
// 프로필/뱃지/단어/퀴즈 체크포인트는 assets/js/api.js를 통해 Supabase에 저장한다.
// 로그인 상태/Header UI/로그아웃은 assets/js/auth.js가 전담한다.

// 개발/테스트 편의를 위해 로그인 여부와 무관하게 대시보드를 자유롭게 볼 수 있도록
// 강제 리다이렉트/얼럿 가드는 두지 않는다. 비로그인 상태에서는 GUEST/빈 상태로 보여준다.

// words.html/mypage.html은 로컬 UI 테스트를 위해 auth.js의 <script> 태그 자체를 주석
// 처리해두는 경우가 있다(이 파일들의 HTML 참고) — 그 상태에서는 isLoggedIn()/window.authReady가
// 아예 정의되지 않아 이 파일 전체가 예외로 멈추고 아무것도 렌더링되지 않았다(#word-row-groups가
// 항상 비어 보이는 원인). auth.js가 실제로 로드된 화면에서는 원래 isLoggedIn()과 완전히
// 동일하게 동작하고, 없는 화면에서만 "비로그인"으로 안전하게 처리한다.
function safeIsLoggedIn() {
  return typeof isLoggedIn === "function" && isLoggedIn();
}

// ── 프로필에 표시할 이름 결정: 수정한 이름 > 가입/로그인 사용자 이름 > GUEST ──
// loadProfile()(assets/js/components/profile.js)로 가져오면 같은 페이지 안에서
// 여러 번 호출해도 api.getProfile()을 중복 요청하지 않는다.
async function getDisplayName() {
  const profile = await loadProfile();
  if (profile && profile.name) return profile.name;

  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  if (user && user.name) return user.name;

  return "GUEST";
}

async function getDisplayUsername() {
  const profile = await loadProfile();
  if (profile && profile.username) return profile.username;

  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  if (user && user.email) return user.email.split("@")[0];

  return "guest";
}

// ── 대시보드: 가입/로그인 이름 + 수정한 프로필 내역을 화면에 즉시 반영 ──
// 아바타(#profile-avatar)는 app.js의 authReady 부트스트랩이 refreshProfileUI()로
// 이미 처리한다(Header/MyPage/Edit 공용) — 여기서 따로 다루지 않는다.
async function applyProfileToDashboard() {
  const nameEl = document.getElementById("profile-name");
  const userEl = document.getElementById("profile-username");

  if (nameEl) nameEl.textContent = await getDisplayName();
  if (userEl) userEl.textContent = "@" + (await getDisplayUsername());
}

// ── 프로필 수정: 저장된 값이 있으면 폼 기본값 위에 덮어써서 프리필 ──
// 아바타 미리보기(#avatar-preview)는 refreshProfileUI()가 처리하므로 여기서는
// 이름/이메일 같은 텍스트 필드만 채운다.
async function prefillEditForm() {
  const p = await loadProfile();
  if (!p) return;

  const map = {
    "acc-name": p.name,
    "email-input": p.email,
  };
  Object.entries(map).forEach(([id, value]) => {
    if (!value) return;
    const el = document.getElementById(id);
    if (el) el.value = value;
  });
}

// ── 계정 정보 저장 — 닉네임(profiles), 이메일·비밀번호(Supabase Auth 계정)를 한 폼에서 함께 처리한다 ──
// 이메일 변경은 실제 로그인 이메일 자체를 바꾸는 것이라 재확인 메일이 발송되고,
// 비밀번호는 입력했을 때만(선택 입력) 변경한다.
const accountForm = document.getElementById("account-form");
if (accountForm) {
  accountForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("acc-name").value.trim();
    const email = document.getElementById("email-input").value.trim();
    const passwordEl = document.getElementById("password-input");
    const password = passwordEl.value;

    if (!email) {
      toast("이메일을 입력해주세요");
      return;
    }
    if (password && password.length < 6) {
      toast("비밀번호는 6자 이상이어야 해요");
      return;
    }

    try {
      const before = await api.getProfile();
      await api.saveProfile({ name });

      let emailChanged = false;
      if (email !== before.email) {
        await api.updateEmail(email);
        emailChanged = true;
      }

      if (password) {
        await api.updatePassword(password);
        passwordEl.value = "";
      }

      toast(emailChanged
        ? "확인 메일을 보냈어요! 새 이메일의 링크를 클릭하면 변경이 완료돼요"
        : "계정 정보가 저장됐어요!");
    } catch (err) {
      toast(err.message || "저장에 실패했어요. 다시 시도해주세요");
    }
  });
}

// ── Profile 아바타 업로드 ──
// 파일 선택 시에는 아직 저장 전이라 setProfileAvatar()로 #avatar-preview만 미리 보여주고,
// 실제 저장(FileReader → Supabase → Header/MyPage/Edit 전체 갱신)은 updateProfileAvatar()
// (assets/js/components/profile.js)가 폼 제출 시점에 한 번에 처리한다.
const avatarInput = document.getElementById("avatar-input");
const avatarPreview = document.getElementById("avatar-preview");

if (avatarInput) {
  avatarInput.addEventListener("change", () => {
    const file = avatarInput.files && avatarInput.files[0];
    if (!file || !avatarPreview) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfileAvatar(avatarPreview, { avatarUrl: reader.result });
    };
    reader.readAsDataURL(file);
  });
}

const avatarForm = document.getElementById("avatar-form");
if (avatarForm) {
  avatarForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const file = avatarInput?.files?.[0];
    if (!file) {
      toast("업로드할 사진을 먼저 선택해주세요");
      return;
    }
    try {
      await updateProfileAvatar(file);
      toast("프로필 사진이 저장됐어요!");
    } catch (err) {
      toast(err.message || "저장에 실패했어요. 다시 시도해주세요");
    }
  });
}

// ── Delete Account: 확인 체크박스를 눌러야만 삭제 버튼이 활성화된다 ──
const deleteConfirmCheckbox = document.getElementById("delete-confirm");
const deleteAccountBtn = document.getElementById("delete-account-btn");

if (deleteConfirmCheckbox && deleteAccountBtn) {
  deleteConfirmCheckbox.addEventListener("change", () => {
    deleteAccountBtn.disabled = !deleteConfirmCheckbox.checked;
  });

  deleteAccountBtn.addEventListener("click", async () => {
    if (deleteAccountBtn.disabled) return;
    // 이 팀 소유 데이터(마이페이지 프로필)만 정리한다. 실제 계정 삭제(auth.users)는
    // service_role 권한이 필요해 클라이언트에서 할 수 없다 — 로그인 세션 종료는
    // auth.js가 제공하는 로그아웃 경로(헤더 드롭다운의 "로그아웃")를 그대로 이용한다.
    try {
      await api.saveProfile({
        name: "", username: "", githubUsername: "", language: "", avatarUrl: "", isMarketingAgreed: false,
      });
      await refreshProfileUI({ force: true });
      toast("계정 데이터가 삭제됐어요. (프로필 정보만 초기화됩니다)");
      setTimeout(() => {
        location.href = "/pages/auth/login.html";
      }, 1200);
    } catch (err) {
      toast(err.message || "삭제에 실패했어요. 다시 시도해주세요");
    }
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

// ── 기술 뱃지(Activities 탭) — Supabase 상태 기반 실시간 렌더링 ──
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

async function readBadgeState() {
  if (!safeIsLoggedIn()) return {};
  return api.getBadges();
}

async function renderBadges() {
  const grid = document.getElementById("badge-grid");
  if (!grid) return;
  const state = await readBadgeState();

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

// 실제 퀴즈 채점 로직(다른 페이지)이 완료 시 호출할 공개 API.
// 이미 획득한 뱃지는 다시 토스트를 띄우지 않는다.
async function unlockSkillBadge(badgeId) {
  if (!safeIsLoggedIn()) return false;
  const unlocked = await api.unlockBadge(badgeId);
  if (!unlocked) return false;

  await renderBadges();
  const def = BADGE_DEFS.find((b) => b.id === badgeId);
  if (def) toast(`"${def.label}" 뱃지를 획득했어요!`);
  return true;
}
window.unlockSkillBadge = unlockSkillBadge;

// ── 저장한 단어 목록(mywords.html) — Supabase 상태 기반 카테고리별 렌더링 ──
async function readWords() {
  if (!safeIsLoggedIn()) return [];
  return api.getWords();
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

// ── 검색 / 정렬 / 즐겨찾기만 보기 / 카테고리 필터 ──
let wordSearchQuery = "";
let wordSortMode = null; // null(기본 순서) | "term"(영어순) | "definition"(이름순)
let wordFavoritesOnly = false;
// 카테고리 필터(#word-category)는 검색/정렬/즐겨찾기와 달리 데이터를 다시 불러오지
// 않는다 — 이미 renderWordGroups()가 그려둔 .word-row-group을 category 값으로
// show/hide만 한다(applyCategoryFilter 참고). "전체 카테고리"는 select의 기본 옵션 텍스트다.
let wordCategoryFilter = "전체 카테고리";

// mywords.html(style: "rows")에서만 페이지네이션을 적용한다 — 대시보드 인페이지
// "단어 도감" 패널(style: "cards")은 페이지 컨테이너(#wordsPagination) 자체가
// 없어서 원래대로 전체 목록을 그대로 보여준다(기존 동작 유지).
const WORD_PAGE_SIZE = 10;
let wordPage = 1;

async function getFilteredSortedWords() {
  let list = await readWords();

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
      <div class="word-row-group__header">
        <div class="word-row-group__title-wrap">
          <span class="word-row-group__dot" aria-hidden="true"></span>
          <span class="word-row-group__title">${category}</span>
        </div>
        <span class="word-row-group__count">${list.length}개</span>
      </div>
      <ul class="word-row-list">
        ${list.map((w) => `
          <li class="word-row" data-word-id="${w.id}">
            <div class="word-row__body">
              <span class="word-row__term">${escapeHtml(w.term)}</span>
              <div class="word-row__def">${escapeHtml(w.definition)}</div>
              ${w.example ? `<div class="word-row__example">${escapeHtml(w.example)}</div>` : ""}
            </div>
            <span class="tag tag--${w.categoryColor}">${w.category}</span>
            <div class="word-row__footer">
              <span class="word-row__date">${w.date}</span>
              <div class="word-row__actions">
                <button type="button" class="favorite-star favorite-star--btn${w.favorite ? " favorite-star--on" : ""}"
                  data-action="toggle-favorite" aria-pressed="${!!w.favorite}" aria-label="즐겨찾기 토글"><span class="icon ${w.favorite ? "icon--star-filled" : "icon--star"}" aria-hidden="true"></span></button>
                <button type="button" class="btn--icon word-row__action--edit" data-action="edit-word" aria-label="단어 수정"><span class="icon icon--edit" aria-hidden="true"></span></button>
                <button type="button" class="btn--icon word-row__action--delete" data-action="delete-word" aria-label="단어 삭제"><span class="icon icon--close" aria-hidden="true"></span></button>
              </div>
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
            <p class="word-card__term">${escapeHtml(w.term)}</p>
            <span class="word-card__pos">${escapeHtml(w.pos)}</span>
            <span class="tag tag--${w.categoryColor} word-card__category">${escapeHtml(w.category)}</span>
            <p class="word-card__definition">${escapeHtml(w.definition)}</p>
            <div class="word-card__footer">
              <span class="word-card__example">${w.example ? escapeHtml(w.example) : "&nbsp;"}</span>
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

// home.js/exam.js의 emptyStateHTML()과 동일한 구조(.empty-state > __icon/__title/__desc) —
// 페이지 CSS가 서로 공유되지 않는 구조라 my.css에도 동일하게 다시 선언해뒀다.
function emptyStateHTML(iconClass, title, desc) {
  return `<div class="empty-state">
    <span class="empty-state__icon" aria-hidden="true"><span class="icon icon--${iconClass}"></span></span>
    <p class="empty-state__title">${title}</p>
    <p class="empty-state__desc">${desc}</p>
  </div>`;
}

// ── 카테고리 필터(#word-category, mywords.html 전용) ──
// 검색/정렬/즐겨찾기는 data 단계에서 필터링되어 renderWordGroups()가 매번 DOM을 다시
// 그리지만, 카테고리 선택은 그럴 필요가 없다 — 이미 그려진 .word-row-group을
// .word-row-group__title 텍스트와 비교해 보이기/숨기기만 하면 된다. renderWordGroups()가
// 새로 그릴 때마다(검색/정렬/즐겨찾기/페이지 변경) 이 함수를 다시 호출해 필터 상태를 유지한다.
function applyCategoryFilter() {
  const container = document.getElementById("word-row-groups");
  if (!container) return;

  const groups = container.querySelectorAll(".word-row-group");
  // 그룹이 하나도 없다면 renderWordGroups()가 이미 Empty State를 그려둔 상태이므로 손대지 않는다.
  if (groups.length === 0) return;

  let visibleCount = 0;
  groups.forEach((group) => {
    const titleEl = group.querySelector(".word-row-group__title");
    const title = titleEl ? titleEl.textContent.trim() : "";
    const matches = wordCategoryFilter === "전체 카테고리" || title === wordCategoryFilter;
    group.hidden = !matches;
    if (matches) visibleCount += 1;
  });

  // 선택한 카테고리에 해당하는 그룹이 하나도 없을 때만 기존 Empty State를 재사용해 덧붙인다.
  let emptyEl = container.querySelector(".empty-state--category-filter");
  if (visibleCount === 0) {
    if (!emptyEl) {
      const html = emptyStateHTML("search", "조건에 맞는 단어가 없어요", "다른 검색어나 필터를 사용해보세요")
        .replace('class="empty-state"', 'class="empty-state empty-state--category-filter"');
      container.insertAdjacentHTML("beforeend", html);
    }
  } else if (emptyEl) {
    emptyEl.remove();
  }
}

const wordCategorySelect = document.getElementById("word-category");
if (wordCategorySelect) {
  wordCategorySelect.addEventListener("change", () => {
    wordCategoryFilter = wordCategorySelect.value;
    applyCategoryFilter();
  });
}

// style: "rows"(mywords.html 기본 목록) | "cards"(대시보드 단어 도감)
let currentWordStyle = "rows";
async function renderWordGroups(style = currentWordStyle) {
  currentWordStyle = style;
  const allWords = await readWords();

  const countEl = document.getElementById("word-total-count");
  if (countEl) countEl.textContent = allWords.length;

  const container = document.getElementById("word-row-groups");
  if (!container) return;

  const words = await getFilteredSortedWords();
  if (words.length === 0) {
    container.innerHTML = allWords.length === 0
      ? emptyStateHTML('book', '아직 저장한 단어가 없습니다', '위키에서 모르는 단어를 드래그해 저장해보세요')
      : emptyStateHTML('search', '조건에 맞는 단어가 없어요', '다른 검색어나 필터를 사용해보세요');
    if (style === "rows") {
      renderPagination({ container: '#wordsPagination', totalCount: 0, currentPage: 1, pageSize: WORD_PAGE_SIZE, onChange() {} });
    }
    return;
  }

  // "rows"(mywords.html)만 실제로 페이지를 나눠 보여준다. "cards"(대시보드 패널)는
  // 컨테이너(#wordsPagination)가 없어 renderPagination이 그냥 아무 일도 하지 않는다.
  let pageWords = words;
  if (style === "rows") {
    const totalPages = Math.max(1, Math.ceil(words.length / WORD_PAGE_SIZE));
    if (wordPage > totalPages) wordPage = totalPages;
    const start = (wordPage - 1) * WORD_PAGE_SIZE;
    pageWords = words.slice(start, start + WORD_PAGE_SIZE);
  }

  const groups = {};
  pageWords.forEach((w) => {
    if (!groups[w.category]) groups[w.category] = [];
    groups[w.category].push(w);
  });

  const buildSection = style === "cards" ? buildWordCardSection : buildWordRowSection;
  container.innerHTML = Object.entries(groups)
    .map(([category, list]) => buildSection(category, list))
    .join("");

  // 검색/정렬/즐겨찾기/페이지 변경으로 그룹이 새로 그려질 때마다 카테고리 필터
  // (show/hide 상태)를 다시 적용해준다 — "cards" 스타일은 #word-category 자체가
  // 없는 화면이라 wordCategoryFilter가 기본값("전체 카테고리")이면 아무 영향도 없다.
  applyCategoryFilter();

  if (style === "rows") {
    renderPagination({
      container: '#wordsPagination',
      totalCount: words.length,
      currentPage: wordPage,
      pageSize: WORD_PAGE_SIZE,
      onChange(page) {
        wordPage = page;
        renderWordGroups();
      }
    });
  }
}

// ── 단어 수정/삭제: 공통 WordModal(components/word-modal.html)의
// openWordModal({mode, word, onSave/onDelete})을 통해 열고, 실제 Supabase
// 반영은 여기(콜백) 안에서만 한다 — 모달 자신은 API를 모른다.
async function saveWordFromModal(word, values) {
  const category = values.category;
  toast(`"${values.term}"를 단어장에 저장했어요! +20P`);
  const payload = {
    term: values.term,
    definition: values.definition || "(뜻 미입력)",
    category,
    categoryColor: CATEGORY_TAG_COLOR[category] || "gray",
  };

  try {
    if (word) {
      await api.updateWord(word.id, payload);
    } else {
      await api.addWord({ ...payload, pos: "명사", example: "", favorite: false });
    }
  } catch (err) {
    // 위에서 이미 "저장했어요" 토스트를 낙관적으로 띄웠으므로(TD-0005 타이밍 유지),
    // 실제 저장이 실패하면 반드시 정정 안내를 띄워야 한다 — 안 그러면 사용자는
    // 저장된 줄 알지만 실제로는 유실된다.
    console.error(err);
    toast("단어 저장에 실패했어요. 다시 시도해주세요");
    return;
  }
  await renderWordGroups();
}

async function toggleWordFavorite(id) {
  const words = await readWords();
  const target = words.find((w) => w.id === id);
  if (!target) return;
  await api.updateWord(id, { favorite: !target.favorite });
  await renderWordGroups();
}

// 도감(카드)/목록(행) 어느 스타일로 렌더링되든 같은 컨테이너 안에서 새로 그려지므로
// 개별 리스너 대신 위임 방식으로 한 번만 등록한다.
document.addEventListener("click", async (e) => {
  const favBtn = e.target.closest('[data-action="toggle-favorite"]');
  if (favBtn) {
    const id = favBtn.closest("[data-word-id]")?.dataset.wordId;
    if (id) await toggleWordFavorite(id);
    return;
  }

  const editBtn = e.target.closest('[data-action="edit-word"]');
  if (editBtn) {
    const id = editBtn.closest("[data-word-id]")?.dataset.wordId;
    const words = await readWords();
    const word = words.find((w) => w.id === id);
    if (word) {
      openWordModal({
        mode: "edit",
        word,
        onSave(values) {
          saveWordFromModal(word, values);
        },
      });
    }
    return;
  }

  const deleteBtn = e.target.closest('[data-action="delete-word"]');
  if (deleteBtn) {
    const id = deleteBtn.closest("[data-word-id]")?.dataset.wordId;
    const words = await readWords();
    const word = words.find((w) => w.id === id);
    if (word) {
      openWordModal({
        mode: "delete",
        word,
        async onDelete(w) {
          await api.deleteWord(w.id);
          await renderWordGroups();
          toast("단어를 삭제했어요");
        },
      });
    }
    return;
  }

  const sortBtn = e.target.closest(".sort-pill[data-sort]");
  if (sortBtn) {
    const mode = sortBtn.dataset.sort;
    wordSortMode = wordSortMode === mode ? null : mode;
    (sortBtn.parentElement || document).querySelectorAll(".sort-pill").forEach((btn) => {
      btn.classList.toggle("sort-pill--active", btn.dataset.sort === wordSortMode);
    });
    await renderWordGroups();
    return;
  }

  const favOnlyBtn = e.target.closest('[data-action="toggle-favorites-only"]');
  if (favOnlyBtn) {
    wordFavoritesOnly = !wordFavoritesOnly;
    favOnlyBtn.classList.toggle("btn--primary", wordFavoritesOnly);
    favOnlyBtn.classList.toggle("btn--outline", !wordFavoritesOnly);
    favOnlyBtn.setAttribute("aria-pressed", String(wordFavoritesOnly));
    await renderWordGroups();
  }
});

document.addEventListener("input", async (e) => {
  if (e.target.id !== "word-search") return;
  wordSearchQuery = e.target.value;
  await renderWordGroups();
});

// ── "+ 단어 추가" (mywords.html 툴바 전용) → WordModal을 create 모드로 연다 ──
// wiki/detail.html의 "단어장 추가" 버튼도 같은 data-action="open-modal"을 쓰지만
// .save-box 안에 있고(wiki.js가 그쪽만 별도로 바인딩), 여기는 #wordToolbar로
// 범위를 좁혀서 두 페이지의 리스너가 같은 버튼에 겹쳐 걸리지 않게 한다.
document.querySelectorAll('#wordToolbar [data-action="open-modal"]').forEach((btn) => {
  btn.addEventListener("click", () => {
    openWordModal({
      mode: "create",
      onSave(values) {
        saveWordFromModal(null, values);
      },
    });
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

async function exportWordsToCSV() {
  const words = await readWords();
  const header = ["카테고리", "단어", "뜻", "저장일"];
  const csvEscape = (value) => `"${String(value).replace(/"/g, '""')}"`;

  const rows = words.map((w) => [w.category, w.term, w.definition, w.date].map(csvEscape).join(","));
  const csvBody = [header.map(csvEscape).join(","), ...rows].join("\r\n");

  // UTF-8 BOM(﻿)을 붙여야 엑셀에서 한글이 깨지지 않는다.
  const blob = new Blob(['\uFEFF' + csvBody], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `저장한_단어_${todayStr()}.csv`);
  toast("📄 CSV 파일로 내보냈어요!");
}

async function exportWordsToDoc() {
  const words = await readWords();
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

  const CORRECT_OPTION_INDEX = 0; // "① 알고리즘"
  const QUIZ_CATEGORY = "CS/IT"; // 오늘의 단어(Algorithm)가 속한 카테고리

  options.forEach((option, index) => {
    option.addEventListener("click", async () => {
      if (index !== CORRECT_OPTION_INDEX) {
        toast("아쉬워요! 다시 도전해보세요.");
        return;
      }
      const badgeId = CATEGORY_TO_BADGE_ID[QUIZ_CATEGORY];
      if (badgeId) await unlockSkillBadge(badgeId);
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

async function readQuizCheckpoints() {
  if (!safeIsLoggedIn()) return {};
  return api.getQuizCheckpoints();
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

document.addEventListener("click", async (e) => {
  const toggleBtn = e.target.closest('[data-action="toggle-checkpoint"]');
  if (!toggleBtn) return;

  // 마이페이지(index.html)는 로그인 없이도 볼 수 있는 페이지라, 게스트가 체크포인트를 누르면
  // api.toggleQuizCheckpoint()가 "로그인이 필요해요" 에러를 던지고 아무 반응도 없이
  // 조용히 실패했다.
  if (!safeIsLoggedIn()) {
    toast("로그인 후 이용할 수 있어요.");
    return;
  }

  const id = toggleBtn.dataset.checkpointId;
  try {
    await api.toggleQuizCheckpoint(id);
  } catch (err) {
    console.error(err);
    toast("저장에 실패했어요. 다시 시도해주세요.");
    return;
  }

  const panel = document.getElementById("category-detail-panel");
  if (panel && panel.querySelector(".checkpoint-list")) {
    panel.innerHTML = await CATEGORY_DETAIL_TEMPLATES.quiz();
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
        <p class="word-stats__value" id="word-total-count">0</p>
        <p class="word-stats__label">전체 단어</p>
      </div>
    </div>
    <div class="word-row-groups" id="word-row-groups"></div>`,

  quiz: async () => {
    const checkpoints = await readQuizCheckpoints();
    return `
    <div class="category-detail__header">
      <h3 class="category-detail__title">🎯 퀴즈 도전</h3>
      <a href="/pages/exam/index.html" class="btn btn--outline btn--sm">모의고사 풀러가기 ›</a>
    </div>
    <div class="challenge-list">
      ${QUIZ_CHALLENGES.map((task) => buildChallengeCheckpoints(task, checkpoints)).join("")}
    </div>
    <p class="page-subtitle category-detail__note">퀴즈에서 만점을 받으면 관련 기술 뱃지가 잠금 해제돼요!</p>`;
  },
};

async function openCategoryDetail(category, cardEl) {
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
    wordCategoryFilter = "전체 카테고리";
  }
  const buildTemplate = CATEGORY_DETAIL_TEMPLATES[category];
  panel.innerHTML = buildTemplate ? await buildTemplate() : "";
  panel.classList.add("category-detail-panel--open");

  // "저장한 단어" 카드는 실제 데이터를 도감(카드) 스타일로 다시 채워 넣어야 한다
  // (innerHTML 교체로 이전에 그려둔 내용과 리스너가 모두 사라졌기 때문).
  if (category === "words") {
    await renderWordGroups("cards");
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

// ── 초기 렌더링 — isLoggedIn()이 정확해야 하므로 authReady 이후에 실행한다.
// auth.js가 로드되지 않은 화면(로컬 테스트용으로 주석 처리된 경우)에서는 window.authReady
// 자체가 없어 여기서 즉시 멈추고 아래 4개 함수(단어 목록 렌더링 포함)가 전혀 실행되지
// 않았다 — Promise.resolve()로 폴백해 그런 화면에서도 "비로그인 상태"로 정상 렌더링한다. ──
(window.authReady || Promise.resolve()).then(() => {
  applyProfileToDashboard();
  prefillEditForm();
  renderBadges();
  renderWordGroups();
});
