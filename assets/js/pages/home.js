// 대시보드(index.html) "최근 저장한 단어" 미리보기 — mypage.js와 동일한 localStorage 데이터를 읽기 전용으로 사용한다.
const WORDS_KEY = "sesac.mywords.list";
const WORDS_PREVIEW_MAX = 8;

function readWords() {
  try {
    const stored = JSON.parse(localStorage.getItem(WORDS_KEY));
    if (stored) return stored;
  } catch {
    /* fall through */
  }
  return [];
}

function renderMyWordsPreview() {
  const listEl = document.querySelector(".word-chip-list");
  if (!listEl) return;

  const words = readWords().slice(0, WORDS_PREVIEW_MAX);

  if (words.length === 0) {
    listEl.innerHTML = `<li class="word-chip word-chip--empty">아직 저장한 단어가 없습니다.</li>`;
    return;
  }

  listEl.innerHTML = words.map((w) => `<li class="word-chip">${w.term}</li>`).join("");
}

// 대시보드(index.html) "최근 즐겨찾기" 미리보기 — wiki.js(saveWikiFavorite)가 저장하는
// 동일한 localStorage 데이터를 읽기 전용으로 사용한다.
const FAVORITES_KEY = "sesac.myfavorites.list";
const FAVORITES_PREVIEW_MAX = 5;

function readFavorites() {
  try {
    const stored = JSON.parse(localStorage.getItem(FAVORITES_KEY));
    if (stored) return stored;
  } catch {
    /* fall through */
  }
  return [];
}

function renderFavoritePreview() {
  const listEl = document.querySelector(".favorite-list");
  if (!listEl) return;

  const favorites = readFavorites().slice(0, FAVORITES_PREVIEW_MAX);

  if (favorites.length === 0) {
    listEl.innerHTML = `<li class="favorite-list__item favorite-list__item--empty">아직 저장한 즐겨찾기가 없습니다.</li>`;
    return;
  }

  listEl.innerHTML = favorites
    .map(
      (f) => `<li class="favorite-list__item">
                    <a class="favorite-list__link" href="detail.html?id=${encodeURIComponent(f.wikiId)}">
                      <span class="favorite-list__star" aria-hidden="true">★</span><span class="favorite-list__title">${f.title}</span><span class="tag tag--${f.categoryColor || "gray"} tag--sm">${f.category}</span>
                    </a>
                  </li>`
    )
    .join("");
}

// 대시보드(index.html) "최근 본 페이지" 미리보기 — wiki.js(saveRecentPage)가 저장하는
// 동일한 localStorage 데이터를 읽기 전용으로 사용한다. renderFavoritePreview()와 동일한 구조.
const RECENT_PAGES_KEY = "sesac.recentPages.list";

function readRecentPages() {
  try {
    const stored = JSON.parse(localStorage.getItem(RECENT_PAGES_KEY));
    if (stored) return stored;
  } catch {
    /* fall through */
  }
  return [];
}

function formatVisitedAt(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function renderRecentPagesPreview() {
  const listEl = document.querySelector(".recent-list");
  if (!listEl) return;

  const recentPages = readRecentPages();

  if (recentPages.length === 0) {
    listEl.innerHTML = `<li class="recent-list__item recent-list__item--empty">최근 본 페이지가 없습니다.</li>`;
    return;
  }

  listEl.innerHTML = recentPages
    .map(
      (p) => `<li class="recent-list__item">
                    <a class="recent-list__link" href="detail.html?id=${encodeURIComponent(p.wikiId)}">
                      <span class="recent-list__icon" aria-hidden="true">${p.icon}</span><span class="recent-list__title">${p.title}</span><span class="tag tag--${p.categoryColor || "gray"} tag--sm">${p.category}</span><span class="recent-list__time">${formatVisitedAt(p.visitedAt)}</span>
                    </a>
                  </li>`
    )
    .join("");
}

// 대시보드(index.html) "모의고사" 통계 카드 — quiz.js/exam.js가 채점 후 기록하는
// 동일한 localStorage 데이터(sesac-exam-attempts)를 읽기 전용으로 사용한다.
// 기록이 없으면 assets/data/home.json의 stats를 fallback으로 사용한다.
const EXAM_HISTORY_KEY = "sesac-exam-attempts";
const HOME_DATA_URL = "assets/data/home.json";
let homeDataPromise = null;

function readExamHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem(EXAM_HISTORY_KEY));
    if (stored) return stored;
  } catch {
    /* fall through */
  }
  return [];
}

function loadHomeData() {
  if (!homeDataPromise) {
    homeDataPromise = fetch(HOME_DATA_URL).then((res) => res.json());
  }
  return homeDataPromise;
}

function renderExamStatCard() {
  const examCard = Array.from(document.querySelectorAll(".stat-card")).find((card) =>
    card.querySelector(".stat-card__label")?.textContent.includes("모의고사")
  );
  if (!examCard) return;

  const numberEl = examCard.querySelector(".stat-card__number");
  const pillEl = examCard.querySelector(".stat-card__pill");
  if (!numberEl || !pillEl) return;

  const history = readExamHistory();

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
const JOB_DATA_VERSION = 19;
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
  renderMyWordsPreview();
  renderFavoritePreview();
  renderRecentPagesPreview();
  renderExamStatCard();
  renderJobReadinessCard();
  renderStudyProgressCard();
});
