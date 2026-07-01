// ── EXAM LIST PAGE 전용 (exam.html) ──
// exam.json을 불러와 side-panel의 "내 모의고사 현황" 통계와 오답노트 아코디언을 실제 데이터로 렌더링하고,
// 사이드바/필터탭 클릭 시 카테고리별로 문제 카드를 실제로 필터링한다.
// NOTE: assets/js/api.js가 아직 없어(docs/API_GUIDE.md 참고) 이 파일에서 직접 fetch한다.
// api.js가 생기면 이 fetch 로직은 공통 담당자와 협의해 그쪽으로 이관한다.

// NOTE: 이 프로젝트엔 storage.js(공통 담당자 소유, 아직 미신설)가 없어 localStorage를 직접 사용한다.
// storage.js가 생기면 이 저장 로직도 그쪽으로 이관한다. quiz.js도 같은 키를 사용한다(파일 간 공유 모듈이 없어 상수를 각자 정의).
const SESAC_EXAM_ATTEMPTS_KEY = 'sesac-exam-attempts';

// 문제/해설 텍스트에는 <div>, <video>, <img alt="..."> 처럼 HTML 태그 예시가 그대로 들어있는 경우가 있다.
// innerHTML로 렌더링하면 이 텍스트가 실제 태그로 해석되어 보기/해설이 깨지므로, 삽입 전 반드시 이스케이프한다.
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getLocalExamAttempts() {
  try {
    const raw = localStorage.getItem(SESAC_EXAM_ATTEMPTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

let examAttemptHistory = []; // "최근 응시한 시험" 전체보기 토글이 재렌더링할 때 다시 fetch하지 않도록 모듈 스코프에 보관
let showAllRecentExams = false;

async function loadExamPageData() {
  if (!document.getElementById('exam')) return;

  try {
    const res = await fetch('assets/data/exam.json');
    if (!res.ok) throw new Error('모의고사 데이터를 불러오지 못했습니다.');
    const data = await res.json();
    examAttemptHistory = [...(data.attemptHistory || []), ...getLocalExamAttempts()];
    renderExamStats(examAttemptHistory);
    renderWrongNoteAccordion(data);
  } catch (e) {
    console.error(e);
    toast('데이터를 불러오지 못했어요. 다시 시도해주세요.');
    const retryHtml = '<p class="wrong-note-empty">⚠️ 불러오지 못했어요. <button type="button" class="section-title__link exam-data-retry-btn">다시 시도 ›</button></p>';
    const recentListEl = document.getElementById('exam-recent-list');
    if (recentListEl) recentListEl.innerHTML = retryHtml;
    const wrongNoteListEl = document.getElementById('exam-wrong-note-list');
    if (wrongNoteListEl) wrongNoteListEl.innerHTML = retryHtml;
    document.querySelectorAll('.exam-data-retry-btn').forEach(btn => {
      btn.addEventListener('click', loadExamPageData);
    });
  }
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
    const reversed = [...history].reverse();
    const recent = showAllRecentExams ? reversed : reversed.slice(0, 3);
    listEl.innerHTML = recent.length ? recent.map(h => `
      <div class="recent-exam"><span class="recent-exam__icon" aria-hidden="true">${h.icon}</span><span class="recent-exam__title">${escapeHtml(h.title)}</span><span class="recent-exam__score${h.score < 70 ? ' recent-exam__score--low' : ''}">${scoreTierEmoji(h.score)} ${h.score}점</span></div>
    `).join('') : '<p class="wrong-note-empty">아직 응시한 시험이 없어요!</p>';
  }

  const toggleBtn = document.getElementById('exam-recent-toggle');
  if (toggleBtn) {
    toggleBtn.hidden = history.length <= 3;
    toggleBtn.textContent = showAllRecentExams ? '접기 ‹' : '전체보기 ›';
  }
}

// 결과 화면(quiz.js의 getScoreTier)과 동일한 점수 구간 기준으로 톤을 맞춘다
function scoreTierEmoji(score) {
  if (score >= 90) return '🎉';
  if (score >= 70) return '👍';
  return '🌱';
}

function renderWrongNoteAccordion(data) {
  const listEl = document.getElementById('exam-wrong-note-list');
  if (!listEl) return;
  const samples = data.wrongNoteSamples || [];

  const items = samples.map(ref => {
    const q = (data.questions[ref.examId] || []).find(item => item.id === ref.questionId);
    if (!q || !q.explanation) return '';
    return `
      <details class="wrong-note-item">
        <summary class="wrong-note-item__summary">
          <span class="tag tag--gray">${escapeHtml(q.category)}</span>
          <span class="wrong-note-item__question">${escapeHtml(q.text)}</span>
        </summary>
        <dl class="wrong-note-item__body">
          <dt>🎯 핵심 개념</dt><dd>${escapeHtml(q.explanation.coreConcept)}</dd>
          <dt>✅ 정답 원리</dt><dd>${escapeHtml(q.explanation.whyCorrect)}</dd>
          <dt>❌ 오답 분석</dt><dd>${escapeHtml(q.explanation.whyIncorrect)}</dd>
          <dt>⚠️ 출제 유의사항</dt><dd>${escapeHtml(q.explanation.examPoint)}</dd>
          <dt>💼 실무 비유</dt><dd>${escapeHtml(q.explanation.practicalExample)}</dd>
        </dl>
      </details>
    `;
  }).join('');

  listEl.innerHTML = items || '<p class="wrong-note-empty">아직 틀린 문제가 없어요!</p>';
}

// ── 사이드바 / 필터탭 카테고리 필터링 ──
// ui.js가 각 그룹(.sidebar, .filter-tabs) 안에서 active 클래스 토글은 이미 처리하지만,
// 실제 카드 표시/숨김과 두 그룹(사이드바 ↔ 필터탭) 간 선택 동기화는 담당하지 않으므로 여기서 처리한다.
function initExamFilters() {
  const examEl = document.getElementById('exam');
  if (!examEl) return;

  const sidebarBtns = examEl.querySelectorAll('.sidebar__item[data-category]');
  const tabBtns = examEl.querySelectorAll('.filter-tab[data-category]');
  const allBtns = [...sidebarBtns, ...tabBtns];
  const rows = examEl.querySelectorAll('.exam-row-list > li[data-category]');

  // 활성 클래스(sidebar__item--active/filter-tab--active) 토글은 ui.js가 이미 공통으로 처리하므로
  // 여기서는 필터링과 접근성 상태(aria-pressed)만 담당한다 (중복 바인딩 방지).
  function applyExamFilter(category) {
    rows.forEach(li => {
      li.classList.toggle('exam-row--hidden', !(category === '전과목' || li.dataset.category === category));
    });
    allBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.category === category)));
  }

  allBtns.forEach(btn => {
    btn.setAttribute('aria-pressed', String(btn.classList.contains('sidebar__item--active') || btn.classList.contains('filter-tab--active')));
    btn.addEventListener('click', () => applyExamFilter(btn.dataset.category));
  });
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

document.getElementById('exam-recent-toggle')?.addEventListener('click', () => {
  showAllRecentExams = !showAllRecentExams;
  renderExamStats(examAttemptHistory);
});

loadExamPageData();
initExamFilters();
