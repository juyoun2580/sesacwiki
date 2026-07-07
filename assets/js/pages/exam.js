// ── EXAM LIST PAGE 전용 (exam.html) ──
// exam.json을 불러와 side-panel의 "내 모의고사 현황" 통계와 오답노트 아코디언을 실제 데이터로 렌더링하고,
// 사이드바/필터탭 클릭 시 카테고리별로 문제 카드를 실제로 필터링한다.
// 응시 기록(exam_attempts)은 assets/js/api.js를 통해 Supabase에서 읽는다. quiz.js도 같은 함수를 쓴다.

// wiki.js의 WIKI_CATEGORY_ICON/WIKI_CATEGORY_TAG_COLOR와 동일한 패턴 — exam.json의 list[].icon(이모지)은
// 더 이상 화면에 쓰지 않고, 카테고리를 기준으로 공용 icon 시스템(components.css의 .icon--*)에서 매핑해 그린다.
// exam.json 자체의 icon 필드는 스키마 변경 없이 그대로 둔다(다른 소비자가 있을 수 있어 보존).
const EXAM_CATEGORY_ICON = {
  '전과목': 'book',
  '세일즈포스': 'cloud',
  'Java': 'code',
  'SQL': 'database',
  'HTML': 'monitor',
  'CSS': 'edit',
  'JavaScript': 'play',
  '기타': 'flag'
};

const EXAM_CATEGORY_COLOR = {
  '전과목': 'green',
  '세일즈포스': 'purple',
  'Java': 'gold',
  'SQL': 'green',
  'HTML': 'blue',
  'CSS': 'blue',
  'JavaScript': 'gold',
  '기타': 'gray'
};

// home.js의 emptyStateHTML()과 동일한 구조(.empty-state > __icon/__title/__desc) —
// 페이지 CSS가 서로 공유되지 않는 구조라 exam.css에도 동일하게 다시 선언해뒀다.
function emptyStateHTML(iconClass, title, desc) {
  return `<div class="empty-state">
    <span class="empty-state__icon" aria-hidden="true"><span class="icon icon--${iconClass}"></span></span>
    <p class="empty-state__title">${title}</p>
    <p class="empty-state__desc">${desc}</p>
  </div>`;
}

// 문제/해설 텍스트에는 <div>, <video>, <img alt="..."> 처럼 HTML 태그 예시가 그대로 들어있는 경우가 있다.
// innerHTML로 렌더링하면 이 텍스트가 실제 태그로 해석되어 보기/해설이 깨지므로, 삽입 전 반드시 이스케이프한다.
// escapeHtml()은 app.js가 정의하는 공용 함수를 재사용한다(quiz.js/mypage.js와 동일).

async function getLocalExamAttempts() {
  if (!isLoggedIn()) return [];
  try {
    return await api.getExamAttempts();
  } catch (e) {
    console.error(e);
    return [];
  }
}

let examAttemptHistory = []; // "최근 응시한 시험" 전체보기 토글이 재렌더링할 때 다시 fetch하지 않도록 모듈 스코프에 보관
let showAllRecentExams = false;
// exam_attempts에는 category가 저장되지 않으므로(examId만 기록), "최근 응시한 시험" 아이콘도
// exam-row와 같은 카테고리 아이콘으로 보이도록 exam.json의 list에서 examId→category를 미리 만들어둔다.
let examCategoryById = {};

// ── 목록 검색/정렬(공용 Toolbar 컴포넌트가 UI만 담당, 실제 계산은 여기서) ──
// wiki.js의 wikiState/wikiFilterItems/wikiSortItems와 동일한 패턴.
let examAllList = [];
let examState = { search: '', sort: 'latest' };

const EXAM_SORT_OPTIONS = ['최신순', '응시순', '난이도순'];
const EXAM_SORT_LABEL_TO_KEY = { '최신순': 'latest', '응시순': 'attempts', '난이도순': 'level' };
const EXAM_SORT_KEY_TO_LABEL = { latest: '최신순', attempts: '응시순', level: '난이도순' };
// exam.json의 level 값이 위키(입문/기초/중급 3단계)보다 다양해서(기초~중급, 중급~고급, 종합 포함)
// 별도 순서표를 둔다. 알 수 없는 값은 목록 맨 뒤로 보낸다.
const EXAM_LEVEL_ORDER = { '입문': 0, '기초': 1, '기초~중급': 2, '중급': 3, '중급~고급': 4, '종합': 5 };

function examFilterList() {
  const query = examState.search.trim().toLowerCase();
  if (!query) return examAllList;
  return examAllList.filter(exam =>
    exam.title.toLowerCase().includes(query) || exam.description.toLowerCase().includes(query)
  );
}

function examSortList(list) {
  const sorted = [...list];
  if (examState.sort === 'attempts') {
    sorted.sort((a, b) => b.attemptCount - a.attemptCount);
  } else if (examState.sort === 'level') {
    sorted.sort((a, b) => (EXAM_LEVEL_ORDER[a.level] ?? 99) - (EXAM_LEVEL_ORDER[b.level] ?? 99));
  }
  // 'latest'는 exam.json에 등록된 순서를 그대로 사용한다.
  return sorted;
}

// 검색/정렬로 목록을 다시 그린 뒤에는 initExamFilters()가 붙여둔 카테고리 필터(클래스 토글)도
// 새로 그려진 <li>들에 다시 적용해야 한다 — 그렇지 않으면 검색 한 번에 카테고리 필터가 풀린다.
function renderExamListWithState() {
  renderExamList(examSortList(examFilterList()));
  applyExamCategoryFilter();
}

// exam.js는 wiki.js의 restoreWikiReturnState() 같은 뒤로가기 복원 기능이 없어서,
// createToolbar()가 돌려주는 컨트롤(setSearchValue/setActiveSort)은 필요하지 않다.
function initExamToolbar() {
  createToolbar({
    container: '#examToolbar',
    searchPlaceholder: '시험 검색하기',
    sorts: EXAM_SORT_OPTIONS,
    onSearch(keyword) {
      examState.search = keyword;
      renderExamListWithState();
    },
    onSort(label) {
      examState.sort = EXAM_SORT_LABEL_TO_KEY[label] || 'latest';
      renderExamListWithState();
    }
  });
}

async function loadExamPageData() {
  if (!document.getElementById('exam')) return;

  try {
    const res = await fetch('/assets/data/exam.json');
    if (!res.ok) throw new Error('모의고사 데이터를 불러오지 못했습니다.');
    const data = await res.json();
    examCategoryById = Object.fromEntries(data.list.map(exam => [exam.id, exam.category]));
    // 응시 기록이 없으면 exam.json의 attemptHistory(빈 배열)로 폴백한다.
    const localHistory = await getLocalExamAttempts();
    examAttemptHistory = localHistory.length ? localHistory : (data.attemptHistory || []);
    examAllList = data.list;
    initExamToolbar();
    renderExamListWithState();
    renderExamStats(examAttemptHistory);
    initExamFilters(); // 카드가 렌더링된 뒤에 실행해야 필터가 실제 <li>를 찾을 수 있다
  } catch (e) {
    console.error(e);
    toast('데이터를 불러오지 못했어요. 다시 시도해주세요');
    const retryHtml = '<p class="wrong-note-empty">불러오지 못했어요. <button type="button" class="section-title__link exam-data-retry-btn">다시 시도</button></p>';
    const recentListEl = document.getElementById('exam-recent-list');
    if (recentListEl) recentListEl.innerHTML = retryHtml;
    document.querySelectorAll('.exam-data-retry-btn').forEach(btn => {
      btn.addEventListener('click', loadExamPageData);
    });
  }
}

// exam.json의 list를 그대로 카드로 그린다 (더 이상 exam.html에 하드코딩하지 않음 — 새 시험 추가는 JSON만 수정하면 됨).
function renderExamList(list) {
  const listEl = document.getElementById('exam-row-list');
  if (!listEl) return;
  listEl.innerHTML = list.map(exam => {
    const badges = [
      exam.isRecommended ? '<span class="tag tag--recommended">추천</span>' : '',
      exam.isAdvanced ? '<span class="tag tag--orange">심화</span>' : ''
    ].join(' ');
    const categoryColor = EXAM_CATEGORY_COLOR[exam.category] || 'gray';
    const categoryIcon = EXAM_CATEGORY_ICON[exam.category] || 'file';
    return `
      <li data-category="${escapeHtml(exam.category)}"><a class="exam-row" href="/pages/exam/quiz.html?id=${escapeHtml(exam.id)}">
          <span class="exam-row__icon-box exam-row__icon-box--${categoryColor}" aria-hidden="true"><span class="icon icon--${categoryIcon}"></span></span>
          <span class="exam-row__body">
            <span class="exam-row__title-wrap">
              <span class="exam-row__title">${escapeHtml(exam.title)}</span>
              ${badges}
            </span>
            <span class="exam-row__desc">${escapeHtml(exam.description)}</span>
            <span class="exam-row__meta"><span>${escapeHtml(exam.level)}</span><span>·</span><span>${exam.questionCount}문제</span><span>·</span><span>예상 ${exam.estimatedMinutes}분</span><span>·</span><span>평균 ${exam.avgScore}점</span></span>
          </span>
          <span class="exam-row__aside">
            <span class="exam-row__count"><span class="icon icon--users" aria-hidden="true"></span>${exam.attemptCount}명 응시</span>
            <span class="btn btn--primary btn--sm">시작하기</span>
          </span>
        </a></li>
    `;
  }).join('');
}

function renderExamStats(history) {
  const attemptCount = history.length;
  const scores = history.map(h => h.score);
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const bestScore = scores.length ? Math.max(...scores) : 0;
  const earnedPoints = history.reduce((sum, h) => sum + (h.pointsEarned || 0), 0);

  setText('exam-score-ring-value', avgScore + '%');
  const fillEl = document.getElementById('exam-score-ring-fill');
  if (fillEl) {
    const r = Number(fillEl.getAttribute('r')) || 30;
    const circumference = 2 * Math.PI * r;
    const offset = circumference * (1 - avgScore / 100);
    fillEl.setAttribute('stroke-dasharray', circumference.toFixed(1));
    fillEl.setAttribute('stroke-dashoffset', offset.toFixed(1));
  }
  const svgEl = document.getElementById('exam-score-ring-svg');
  if (svgEl) svgEl.setAttribute('aria-label', `전체 평균 ${avgScore}%`);

  setText('exam-stat-attempt-count', attemptCount + '회');
  setText('exam-stat-avg-score', avgScore + '점');
  setText('exam-stat-best-score', bestScore + '점');
  setText('exam-stat-earned-points', earnedPoints + 'P');

  const listEl = document.getElementById('exam-recent-list');
  if (listEl) {
    // history는 api.getExamAttempts()가 이미 created_at 내림차순(최신 먼저)으로 정렬해서 준다.
    const recent = showAllRecentExams ? history : history.slice(0, 3);
    listEl.innerHTML = recent.length ? recent.map(h => {
      const category = examCategoryById[h.examId];
      const categoryColor = EXAM_CATEGORY_COLOR[category] || 'gray';
      const categoryIcon = EXAM_CATEGORY_ICON[category] || 'file';
      const tier = scoreTierIcon(h.score);
      return `
      <div class="recent-exam">
        <span class="recent-exam__icon-box recent-exam__icon-box--${categoryColor}" aria-hidden="true"><span class="icon icon--${categoryIcon}"></span></span>
        <span class="recent-exam__body">
          <span class="recent-exam__title">${escapeHtml(h.title)}</span>
          <span class="recent-exam__date">${escapeHtml(h.date || '')}</span>
        </span>
        <span class="recent-exam__score${h.score < 70 ? ' recent-exam__score--low' : ''}">${h.score}점</span>
      </div>
    `;
    }).join('') : emptyStateHTML('file-text', '아직 응시한 시험이 없어요', '모의고사를 응시하면 여기에 기록돼요');
  }

  const toggleBtn = document.getElementById('exam-recent-toggle');
  if (toggleBtn) {
    toggleBtn.hidden = history.length <= 3;
    toggleBtn.textContent = showAllRecentExams ? '접기' : '전체보기';
  }
}

// 결과 화면(quiz.js의 getScoreTier)과 동일한 점수 구간 기준으로 톤을 맞춘다.
// 과거에는 🎉/👍/🌱 이모지로 표시했으나, 기존 icon 시스템의 아이콘으로 대체한다.
function scoreTierIcon(score) {
  if (score >= 90) return 'star-filled';
  if (score >= 70) return 'check';
  return 'leaf';
}

// ── 사이드바 / 필터탭 카테고리 필터링 ──
// ui.js가 각 그룹(.sidebar, .filter-tabs) 안에서 active 클래스 토글은 이미 처리하지만,
// 실제 카드 표시/숨김과 두 그룹(사이드바 ↔ 필터탭) 간 선택 동기화는 담당하지 않으므로 여기서 처리한다.
// rows를 initExamFilters() 호출 시점에 한 번만 캐싱하지 않고 매번 다시 querySelectorAll하는 이유:
// 검색/정렬(renderExamListWithState)이 목록을 통째로 다시 그리면 옛 <li> 참조가 끊기기 때문.
let examCurrentCategory = '전과목';

function applyExamCategoryFilter() {
  const examEl = document.getElementById('exam');
  if (!examEl) return;
  const rows = examEl.querySelectorAll('.exam-row-list > li[data-category]');
  rows.forEach(li => {
    li.classList.toggle('exam-row--hidden', !(examCurrentCategory === '전과목' || li.dataset.category === examCurrentCategory));
  });
}

function initExamFilters() {
  const examEl = document.getElementById('exam');
  if (!examEl) return;

  const sidebarBtns = examEl.querySelectorAll('.sidebar__item[data-category]');
  const tabBtns = examEl.querySelectorAll('.filter-tab[data-category]');
  const allBtns = [...sidebarBtns, ...tabBtns];

  // 활성 클래스(sidebar__item--active/filter-tab--active) 토글은 ui.js가 이미 공통으로 처리하므로
  // 여기서는 필터링과 접근성 상태(aria-pressed)만 담당한다 (중복 바인딩 방지).
  allBtns.forEach(btn => {
    btn.setAttribute('aria-pressed', String(btn.classList.contains('sidebar__item--active') || btn.classList.contains('filter-tab--active')));
    btn.addEventListener('click', () => {
      examCurrentCategory = btn.dataset.category;
      allBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.category === examCurrentCategory)));
      applyExamCategoryFilter();
    });
  });

  applyExamCategoryFilter();
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

document.getElementById('exam-recent-toggle')?.addEventListener('click', () => {
  showAllRecentExams = !showAllRecentExams;
  renderExamStats(examAttemptHistory);
});

// isLoggedIn()이 정확해야 실제 응시 기록을 읽어올 수 있으므로 authReady 이후 실행한다.
window.authReady.then(loadExamPageData);
