// 대시보드(index.html) "최근 본 페이지"/"즐겨찾기"/"최근 저장한 단어" 3개 미리보기가 공유하는
// Empty State 컴포넌트 — 구조는 .empty-state > .empty-state__icon/__title/__desc로 통일한다
// (스타일은 assets/css/pages/home.css 참고). modifier(recent/favorite/word)는 아이콘·문구만 다르다.
function emptyStateHTML(modifier, iconClass, title, desc) {
  return `<div class="empty-state empty-state--${modifier}">
    <span class="empty-state__icon" aria-hidden="true"><span class="icon ${iconClass}"></span></span>
    <p class="empty-state__title">${title}</p>
    <p class="empty-state__desc">${desc}</p>
  </div>`;
}

// 대시보드(index.html) "최근 저장한 단어" 미리보기 — api.js(Supabase words 테이블)를 읽기 전용으로 사용한다.
const WORDS_PREVIEW_MAX = 8;

async function renderMyWordsPreview() {
  const listEl = document.querySelector(".word-chip-list");
  if (!listEl) return;

  const allWords = isLoggedIn() ? await api.getWords() : [];
  const words = allWords.slice(0, WORDS_PREVIEW_MAX);

  if (words.length === 0) {
    listEl.innerHTML = `<li class="word-chip word-chip--empty">${emptyStateHTML('word', 'icon--flag', '저장한 단어가 없어요', '단어장에 새 단어를 저장해보세요')}</li>`;
    return;
  }

  listEl.innerHTML = "";
  words.forEach((w) => {
    const li = document.createElement("li");
    li.className = "word-chip";
    li.textContent = w.term;
    listEl.appendChild(li);
  });
}

// wiki.js와 같은 카테고리 → 태그색 매핑(홈 대시보드는 wiki.js를 로드하지 않아 여기서도 필요).
const HOME_WIKI_CATEGORY_TAG_COLOR = {
  SQL: "green", Java: "orange", HTML: "blue", CSS: "blue", JavaScript: "gold",
  Git: "gray", Salesforce: "purple", "CS 개념": "coral", "면접 개념": "coral", "취업 가이드": "gold",
};

const WIKI_DATA_FULL_URL = "assets/data/wiki-data.json";
let wikiDataFullPromise = null;
function loadWikiDataFull() {
  if (!wikiDataFullPromise) {
    wikiDataFullPromise = fetch(WIKI_DATA_FULL_URL).then((res) => res.json());
  }
  return wikiDataFullPromise;
}

// 대시보드(index.html) "최근 즐겨찾기" 미리보기 — api.js(Supabase wiki_bookmarks)를
// wiki-data.json과 조인해서 사용한다(제목/카테고리는 DB에 중복 저장하지 않는다).
const FAVORITES_PREVIEW_MAX = 5;

async function renderFavoritePreview() {
  const listEl = document.querySelector(".favorite-list");
  if (!listEl) return;

  if (!isLoggedIn()) {
    listEl.innerHTML = `<li class="favorite-list__item favorite-list__item--empty">${emptyStateHTML('favorite', 'icon--star', '즐겨찾기가 없어요', '위키 문서를 즐겨찾기에 추가해보세요')}</li>`;
    return;
  }

  const [bookmarkedIds, wikiItems] = await Promise.all([api.getWikiBookmarks(), loadWikiDataFull()]);
  const bookmarkedSet = new Set(bookmarkedIds);
  const favorites = wikiItems.filter((item) => bookmarkedSet.has(item.id)).slice(0, FAVORITES_PREVIEW_MAX);

  if (favorites.length === 0) {
    listEl.innerHTML = `<li class="favorite-list__item favorite-list__item--empty">${emptyStateHTML('favorite', 'icon--star', '즐겨찾기가 없어요', '위키 문서를 즐겨찾기에 추가해보세요')}</li>`;
    return;
  }

  listEl.innerHTML = favorites
    .map((item) => {
      const categoryColor = HOME_WIKI_CATEGORY_TAG_COLOR[item.category] || "gray";
      return `<li class="favorite-list__item">
                    <a class="favorite-list__link" href="/pages/wiki/detail.html?id=${encodeURIComponent(item.id)}">
                      <span class="favorite-star icon icon--star-filled favorite-star--on" aria-hidden="true"></span><span class="favorite-list__title">${item.title}</span><span class="tag tag--${categoryColor} tag--sm">${item.category}</span>
                    </a>
                  </li>`;
    })
    .join("");
}

function formatVisitedAt(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const RECENT_PAGES_PREVIEW_MAX = 5;

async function renderRecentPagesPreview() {
  const listEl = document.querySelector(".recent-list");
  if (!listEl) return;

  if (!isLoggedIn()) {
    listEl.innerHTML = `<li class="recent-list__item recent-list__item--empty">${emptyStateHTML('recent', 'icon--file', '최근 본 페이지가 없어요', '위키 문서를 둘러보면 여기에 기록돼요')}</li>`;
    return;
  }

  const [recentViews, wikiItems] = await Promise.all([api.getRecentWikiViews(), loadWikiDataFull()]);
  const wikiById = new Map(wikiItems.map((item) => [item.id, item]));
  const recentPages = recentViews
    .map((rv) => {
      const item = wikiById.get(rv.wikiId);
      return item ? { item, visitedAt: rv.visitedAt } : null;
    })
    .filter(Boolean)
    .slice(0, RECENT_PAGES_PREVIEW_MAX);

  if (recentPages.length === 0) {
    listEl.innerHTML = `<li class="recent-list__item recent-list__item--empty">${emptyStateHTML('recent', 'icon--file', '최근 본 페이지가 없어요', '위키 문서를 둘러보면 여기에 기록돼요')}</li>`;
    return;
  }

  listEl.innerHTML = recentPages
    .map(({ item, visitedAt }) => {
      return `<li class="recent-list__item recent-list__item--success">
                    <a class="recent-list__link" href="/pages/wiki/detail.html?id=${encodeURIComponent(item.id)}">
                      <span class="recent-list__icon" aria-hidden="true"></span><span class="recent-list__title">${item.title}</span><span class="recent-list__time">${formatVisitedAt(visitedAt)}</span>
                    </a>
                  </li>`;
    })
    .join("");
}

// 대시보드(index.html) "모의고사" 통계 카드 — quiz.js/exam.js가 채점 후 기록하는
// 동일한 api.js(Supabase exam_attempts) 데이터를 읽기 전용으로 사용한다.
// 기록이 없으면 assets/data/home.json의 stats를 fallback으로 사용한다.
const HOME_DATA_URL = "/assets/data/home.json";
let homeDataPromise = null;

function loadHomeData() {
  if (!homeDataPromise) {
    homeDataPromise = fetch(HOME_DATA_URL).then((res) => res.json());
  }
  return homeDataPromise;
}

async function renderExamStatCard() {
  const examCard = Array.from(document.querySelectorAll(".stat-card")).find((card) =>
    card.querySelector(".stat-card__label")?.textContent.includes("모의고사")
  );
  if (!examCard) return;

  const numberEl = examCard.querySelector(".stat-card__number");
  const pillEl = examCard.querySelector(".stat-card__pill");
  if (!numberEl || !pillEl) return;

  const history = isLoggedIn() ? await api.getExamAttempts() : [];

  if (history.length > 0) {
    const avgScore = Math.round(history.reduce((sum, e) => sum + e.score, 0) / history.length);
    numberEl.textContent = `${history.length}회`;
    pillEl.textContent = `평균 점수 ${avgScore}점`;
    return;
  }

  loadHomeData().then((data) => {
    const stats = data.stats || {};
    numberEl.textContent = `${stats.examCount ?? 0}회`;
    pillEl.textContent = `평균 점수 ${stats.examAvgScore ?? 0}점`;
  });
}

// 대시보드(index.html) "취업 준비율" 카드 — job.js가 localStorage(job_data, job_features)로
// 계산하는 progressByCategory와 같은 원본 데이터를 같은 방식으로 다시 계산한다.
// job.js는 job.html에서만 로드되어 함수를 직접 호출할 수 없으므로, 판정 기준 자체는
// app.js의 공용 isJobStepDone()을 재사용해 job.js와 항상 같은 결과를 보장한다.
const JOB_DATA_KEY = "job_data";
const JOB_DATA_VERSION = 20;
const JOB_FEATURES_KEY = "job_features";

function loadJobFeatures() {
  try {
    const stored = JSON.parse(localStorage.getItem(JOB_FEATURES_KEY));
    if (stored) return stored;
  } catch {
    /* fall through */
  }
  return null;
}

function getJobProgressByCategory() {
  try {
    const stored = JSON.parse(localStorage.getItem(JOB_DATA_KEY));
    if (!stored || stored.version !== JOB_DATA_VERSION || !Array.isArray(stored.steps)) return null;
    const features = loadJobFeatures();
    return stored.steps.slice(1).map((step) => ({
      label: step.label,
      stepId: step.id,
      done: isJobStepDone(step.id, features)
    }));
  } catch {
    return null;
  }
}

function renderJobReadinessCard() {
  const jobCard = Array.from(document.querySelectorAll(".stat-card")).find((card) =>
    card.querySelector(".stat-card__label")?.textContent.includes("취업 준비율")
  );
  if (!jobCard) return;

  const numberEl = jobCard.querySelector(".stat-card__number");
  const progressBarEl = jobCard.querySelector(".progress-bar");
  const fillEl = jobCard.querySelector(".progress-bar__fill");
  if (!numberEl || !progressBarEl || !fillEl) return;

  const applyPercent = (percent) => {
    numberEl.textContent = `${percent}%`;
    progressBarEl.setAttribute("aria-valuenow", String(percent));
    fillEl.dataset.progress = String(percent);
    // data-progress → width 반영은 app.js의 initProgressBars()가 이미 담당하므로 재사용한다.
    if (typeof initProgressBars === "function") initProgressBars();
  };

  const progressByCategory = getJobProgressByCategory();

  if (progressByCategory && progressByCategory.length > 0) {
    const doneCount = progressByCategory.filter((item) => item.done).length;
    applyPercent(Math.round((doneCount / progressByCategory.length) * 100));
    return;
  }

  loadHomeData().then((data) => {
    const stats = data.stats || {};
    applyPercent(stats.jobReadinessPercent ?? 0);
  });
}

// 대시보드(index.html) "학습 진도율" 카드 — 위키 문서별 학습 진도를 사용자별로
// 추적하는 저장소가 아직 없어, 다른 통계 카드(모의고사/취업 준비율)와 동일하게
// assets/data/home.json의 stats.progressPercent를 사용한다(신규 유저는 0).
function renderStudyProgressCard() {
  const progressCard = Array.from(document.querySelectorAll(".stat-card")).find((card) =>
    card.querySelector(".stat-card__label")?.textContent.includes("학습 진도율")
  );
  if (!progressCard) return;

  const numberEl = progressCard.querySelector(".stat-card__number");
  const progressBarEl = progressCard.querySelector(".progress-bar");
  const fillEl = progressCard.querySelector(".progress-bar__fill");
  if (!numberEl || !progressBarEl || !fillEl) return;

  const applyPercent = (percent) => {
    numberEl.textContent = `${percent}%`;
    progressBarEl.setAttribute("aria-valuenow", String(percent));
    fillEl.dataset.progress = String(percent);
    // data-progress → width 반영은 app.js의 initProgressBars()가 이미 담당하므로 재사용한다.
    if (typeof initProgressBars === "function") initProgressBars();
  };

  loadHomeData().then((data) => applyPercent((data.stats && data.stats.progressPercent) ?? 0));
}

document.addEventListener("DOMContentLoaded", () => {
  // isLoggedIn()이 정확해야 하는 미리보기들은 authReady 이후로 미룬다.
  window.authReady.then(() => {
    renderMyWordsPreview();
    renderFavoritePreview();
    renderRecentPagesPreview();
    renderExamStatCard();
  });
  renderJobReadinessCard();
  renderStudyProgressCard();
});
