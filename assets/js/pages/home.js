// 대시보드(index.html) "최근 저장한 단어" 미리보기 — api.js(Supabase words 테이블)를 읽기 전용으로 사용한다.
const WORDS_PREVIEW_MAX = 8;

async function renderMyWordsPreview() {
  const listEl = document.querySelector(".word-chip-list");
  if (!listEl) return;

  const allWords = isLoggedIn() ? await api.getWords() : [];
  const words = allWords.slice(0, WORDS_PREVIEW_MAX);

  if (words.length === 0) {
    listEl.innerHTML = `<li class="word-chip word-chip--empty">아직 저장한 단어가 없습니다.</li>`;
    return;
  }

  listEl.innerHTML = words.map((w) => `<li class="word-chip">${w.term}</li>`).join("");
}

// wiki.js와 같은 카테고리 → 아이콘/태그색 매핑(홈 대시보드는 wiki.js를 로드하지 않아 여기서도 필요).
const HOME_WIKI_CATEGORY_ICON = {
  SQL: "🗄️", Java: "☕", HTML: "🌐", CSS: "🎨", JavaScript: "⚡",
  Git: "🔀", Salesforce: "☁️", "CS 개념": "💡", "면접 개념": "🎤", "취업 가이드": "💼",
};
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
    listEl.innerHTML = `<li class="favorite-list__item favorite-list__item--empty">아직 저장한 즐겨찾기가 없습니다.</li>`;
    return;
  }

  const [bookmarkedIds, wikiItems] = await Promise.all([api.getWikiBookmarks(), loadWikiDataFull()]);
  const bookmarkedSet = new Set(bookmarkedIds);
  const favorites = wikiItems.filter((item) => bookmarkedSet.has(item.id)).slice(0, FAVORITES_PREVIEW_MAX);

  if (favorites.length === 0) {
    listEl.innerHTML = `<li class="favorite-list__item favorite-list__item--empty">아직 저장한 즐겨찾기가 없습니다.</li>`;
    return;
  }

  listEl.innerHTML = favorites
    .map((item) => {
      const categoryColor = HOME_WIKI_CATEGORY_TAG_COLOR[item.category] || "gray";
      return `<li class="favorite-list__item">
                    <a class="favorite-list__link" href="detail.html?id=${encodeURIComponent(item.id)}">
                      <span class="favorite-list__star" aria-hidden="true">★</span><span class="favorite-list__title">${item.title}</span><span class="tag tag--${categoryColor} tag--sm">${item.category}</span>
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

async function renderRecentPagesPreview() {
  const listEl = document.querySelector(".recent-list");
  if (!listEl) return;

  if (!isLoggedIn()) {
    listEl.innerHTML = `<li class="recent-list__item recent-list__item--empty">최근 본 페이지가 없습니다.</li>`;
    return;
  }

  const [recentViews, wikiItems] = await Promise.all([api.getRecentWikiViews(), loadWikiDataFull()]);
  const wikiById = new Map(wikiItems.map((item) => [item.id, item]));
  const recentPages = recentViews
    .map((rv) => {
      const item = wikiById.get(rv.wikiId);
      return item ? { item, visitedAt: rv.visitedAt } : null;
    })
    .filter(Boolean);

  if (recentPages.length === 0) {
    listEl.innerHTML = `<li class="recent-list__item recent-list__item--empty">최근 본 페이지가 없습니다.</li>`;
    return;
  }

  listEl.innerHTML = recentPages
    .map(({ item, visitedAt }) => {
      const icon = HOME_WIKI_CATEGORY_ICON[item.category] || "📄";
      const categoryColor = HOME_WIKI_CATEGORY_TAG_COLOR[item.category] || "gray";
      return `<li class="recent-list__item">
                    <a class="recent-list__link" href="detail.html?id=${encodeURIComponent(item.id)}">
                      <span class="recent-list__icon" aria-hidden="true">${icon}</span><span class="recent-list__title">${item.title}</span><span class="tag tag--${categoryColor} tag--sm">${item.category}</span><span class="recent-list__time">${formatVisitedAt(visitedAt)}</span>
                    </a>
                  </li>`;
    })
    .join("");
}

// 대시보드(index.html) "모의고사" 통계 카드 — quiz.js/exam.js가 채점 후 기록하는
// 동일한 api.js(Supabase exam_attempts) 데이터를 읽기 전용으로 사용한다.
// 기록이 없으면 assets/data/home.json의 stats를 fallback으로 사용한다.
const HOME_DATA_URL = "assets/data/home.json";
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
// job.js는 job.html에서만 로드되어 함수를 직접 호출할 수 없으므로, job.js의
// getProgressByCategory()/isStepDone() 판정 로직을 이 파일에서도 동일하게 유지한다.
// (job.js의 로직이 바뀌면 이 부분도 함께 맞춰줘야 한다.)
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

function isJobStepDone(stepId, f) {
  if (!f) return false;
  switch (stepId) {
    case 2:
      return f.resume && (f.resume.education?.length > 0 || f.resume.experience?.length > 0 || f.resume.skills?.length > 0);
    case 3:
      return f.coverLetter && Object.values(f.coverLetter).every((v) => typeof v === "string" && v.trim());
    case 4:
      return f.projects && f.projects.length > 0;
    case 5:
      return (
        (f.interviewAnswers && Object.values(f.interviewAnswers).some((v) => typeof v === "string" && v.trim())) ||
        (f.mockAnswers && Object.values(f.mockAnswers).some((v) => Array.isArray(v) && v.length > 0))
      );
    case 6:
      return (f.companies && f.companies.length > 0) || (f.interviews && f.interviews.length > 0);
    default:
      return false;
  }
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

// 대시보드(index.html) "학습 진도율" 카드 — assets/data/wiki.json의 list[].percent 평균을 사용한다.
// loadHomeData()와 동일한 "1회 fetch 후 Promise 캐싱" 패턴을 wiki.json에도 그대로 적용한다.
const WIKI_DATA_URL = "assets/data/wiki.json";
let wikiDataPromise = null;

function loadWikiData() {
  if (!wikiDataPromise) {
    wikiDataPromise = fetch(WIKI_DATA_URL).then((res) => res.json());
  }
  return wikiDataPromise;
}

function getWikiAverageProgress(data) {
  const list = data && data.list;
  if (!Array.isArray(list) || list.length === 0) return null;

  const percents = list.map((item) => item.percent).filter((percent) => typeof percent === "number");
  if (percents.length === 0) return null;

  const total = percents.reduce((sum, percent) => sum + percent, 0);
  return Math.round(total / percents.length);
}

function renderStudyProgressCard() {
  const progressCard = Array.from(document.querySelectorAll(".stat-card")).find((card) =>
    card.querySelector(".stat-card__label")?.textContent.includes("학습 진도율")
  );
  if (!progressCard) return;

  const valueEl = progressCard.querySelector(".score-ring__value");
  const fillEl = progressCard.querySelector(".score-ring__fill");
  const svgEl = progressCard.querySelector("svg");
  if (!valueEl || !fillEl) return;

  const applyPercent = (percent) => {
    valueEl.textContent = `${percent}%`;
    // dashoffset은 SVG에 이미 있는 stroke-dasharray(원 둘레)를 그대로 읽어서 계산한다 — 반지름을 새로 하드코딩하지 않는다.
    const circumference = parseFloat(fillEl.getAttribute("stroke-dasharray")) || 0;
    fillEl.setAttribute("stroke-dashoffset", String(Math.round(circumference * (1 - percent / 100))));
    if (svgEl) svgEl.setAttribute("aria-label", `학습 진도율 ${percent}%`);
  };

  const useFallback = () => loadHomeData().then((data) => applyPercent((data.stats && data.stats.progressPercent) ?? 0));

  loadWikiData()
    .then((data) => {
      const avg = getWikiAverageProgress(data);
      if (avg === null) return useFallback();
      applyPercent(avg);
    })
    .catch(useFallback);
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
