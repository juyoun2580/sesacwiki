// ── QUIZ PAGE 전용 (quiz.html) — 응시 설정 → 문항 탐색 → 결과 3단계 흐름 ──
// URL의 ?id=examId로 exam.json에서 문제 풀을 불러온 뒤, 난이도/문항 수를 고르는 설정 화면 →
// 실제 응시 화면 → 채점 결과(오답 확인) 화면 순서로 진행한다.
// NOTE: assets/js/api.js가 아직 없어(docs/API_GUIDE.md 참고) 이 파일에서 직접 fetch한다.
// api.js가 생기면 이 fetch 로직은 공통 담당자와 협의해 그쪽으로 이관한다.

// NOTE: 이 프로젝트엔 storage.js(공통 담당자 소유, 아직 미신설)가 없어 localStorage를 직접 사용한다.
// storage.js가 생기면 이 저장 로직도 그쪽으로 이관한다. exam.js도 같은 키를 사용한다(파일 간 공유 모듈이 없어 상수를 각자 정의).
const SESAC_EXAM_ATTEMPTS_KEY = 'sesac-exam-attempts';
const MAX_STORED_ATTEMPTS = 100; // localStorage 무한 누적 방지 — 최근 100건만 보관
const DIFFICULTY_ORDER = ['기초', '중급', '고급', '심화'];
const DIFFICULTY_TAG_CLASS = { '기초': 'tag--green', '중급': 'tag--blue', '고급': 'tag--gold', '심화': 'tag--coral' };
const MAX_QUIZ_QUESTION_COUNT = 50; // 문항 수 슬라이더 상한 (풀 크기가 더 작으면 풀 크기가 상한이 된다)
const TIMER_WARNING_SEC = 60; // 이 초 이하로 남으면 타이머 링이 경고색으로 바뀐다
const TIMER_CRITICAL_SEC = 10; // 이 초 이하로 남으면 경고색 + 깜빡임
const MAX_TIMER_EXTENDS = 2; // 응시 1회당 시간 연장 가능 횟수 (무제한 연장 방지)
let timerExtendsUsed = 0;

let quizState = null; // { exam, questions, currentIndex, answers: Map<index, choiceIndex>, flagged: Set<index>, memos: Map<index, string> }
let quizPool = null;  // { exam, allQuestions, seedHistory } — 설정 화면/포인트 계산이 참조하는 전체 문제 풀 · 시드 응시 기록
let lastWrongQuestions = []; // 방금 채점한 시험의 오답 문제 목록 — "오답만 다시 풀기"에서 사용
// 타이머 초기값은 startQuizFromSetup()이 선택된 문항 수에 맞춰 갱신한다 (선언은 호출보다 먼저 와야 한다).
let timerSec = 444;

// 문제/보기/해설 텍스트에는 <div>, <video>, <img alt="..."> 처럼 HTML 태그 예시가 그대로 들어있는 경우가 있다.
// innerHTML로 렌더링하면 이 텍스트가 실제 태그로 해석되어 보기가 빈 칸으로 보이는 등 깨지므로, 삽입 전 반드시 이스케이프한다.
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function resetTimerRingVisual() {
  document.querySelector('.time-ring')?.classList.remove('time-ring--warning', 'time-ring--critical');
}

function resetTimerExtend() {
  timerExtendsUsed = 0;
  const btn = document.getElementById('quiz-extend-btn');
  if (btn) {
    btn.disabled = false;
    btn.textContent = `⟳ 시간 연장하기 (${MAX_TIMER_EXTENDS}회 남음)`;
  }
}

function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
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

// 문제 데이터는 시험별로 assets/data/questions/{examId}.json에 분리 저장돼 있다 (exam.json은 목차만 가벼운 상태로 유지).
// 응시할 시험 하나만 받아오도록 하기 위함 — 문제은행이 커져도 quiz.html 로딩 용량은 그대로다.
// 같은 examId를 여러 번 요청할 수 있어(예: 전과목 통합 시험의 combinedQuestions) fetch 결과를 캐싱한다.
const questionFileCache = new Map();
function fetchQuestionsFile(examId) {
  if (!questionFileCache.has(examId)) {
    questionFileCache.set(examId, fetch(`assets/data/questions/${examId}.json`).then(res => {
      if (!res.ok) throw new Error(`${examId} 문제 파일을 불러오지 못했습니다.`);
      return res.json();
    }));
  }
  return questionFileCache.get(examId);
}

async function initQuizPage() {
  if (!document.getElementById('quiz')) return; // mywords.html 등 quiz.js를 공유하는 다른 페이지에서는 종료

  const requestedId = new URLSearchParams(location.search).get('id');
  const examId = requestedId || 'exam-001';

  try {
    const res = await fetch('assets/data/exam.json');
    if (!res.ok) throw new Error('문제 데이터를 불러오지 못했습니다.');
    const data = await res.json();

    const exam = data.list.find(item => item.id === examId);
    const allQuestions = await resolveQuizQuestions(data, examId);
    if (!exam || !allQuestions.length) {
      if (requestedId) {
        toast('요청한 모의고사를 찾을 수 없어 목록으로 돌아가요.');
        setTimeout(() => { location.href = 'exam.html'; }, 1500);
        return;
      }
      throw new Error('해당 모의고사를 찾을 수 없습니다.');
    }
    if (!requestedId) toast(`시험을 지정하지 않아 "${exam.title}"을(를) 보여드려요.`);

    quizPool = { exam, allQuestions, seedHistory: data.attemptHistory || [] };

    document.title = `${exam.title} 응시 — 새싹트리`;
    setText('quiz-title-text', exam.title);
    setText('quiz-level-tag', exam.level);
    setText('quiz-meta', `${exam.description} · ⏱ ${exam.estimatedMinutes}분 · 📝 ${allQuestions.length}문제 · 👥 ${exam.attemptCount}명 응시`);

    renderQuizSetup();
    showQuizPhase('setup');
  } catch (e) {
    console.error(e);
    toast('문제를 불러오지 못했어요. 목록으로 돌아가 다시 시도해주세요.');
    setText('quiz-meta', '⚠️ 문제를 불러오지 못했어요. 새로고침하거나 목록으로 돌아가 다시 시도해주세요.');
    const startBtn = document.getElementById('quiz-setup-start-btn');
    if (startBtn) startBtn.disabled = true;
  }
}

async function resolveQuizQuestions(data, examId) {
  const combined = data.combinedQuestions && data.combinedQuestions[examId];
  if (combined) {
    const neededExamIds = [...new Set(combined.map(ref => ref.examId))];
    const files = await Promise.all(neededExamIds.map(fetchQuestionsFile));
    const byExamId = Object.fromEntries(neededExamIds.map((id, i) => [id, files[i]]));
    return combined
      .map(ref => (byExamId[ref.examId] || []).find(q => q.id === ref.questionId))
      .filter(Boolean);
  }
  return fetchQuestionsFile(examId);
}

function showQuizPhase(phase) {
  const setupEl = document.getElementById('quiz-setup');
  const playEl = document.getElementById('quiz-play');
  const resultEl = document.getElementById('quiz-result');
  const endBtn = document.getElementById('quiz-end-btn');
  if (setupEl) setupEl.hidden = phase !== 'setup';
  if (playEl) playEl.hidden = phase !== 'play';
  if (resultEl) resultEl.hidden = phase !== 'result';
  if (endBtn) endBtn.hidden = phase !== 'play'; // 설정/결과 화면에서는 헤더의 중단 버튼을 숨긴다 (결과 화면 버튼과 중복 방지)
}

// ── 1단계: 응시 설정 (난이도 · 문항 수) ──
function renderQuizSetup() {
  const { allQuestions } = quizPool;
  const difficulties = DIFFICULTY_ORDER.filter(d => allQuestions.some(q => q.difficulty === d));

  const diffContainer = document.getElementById('quiz-setup-difficulty');
  if (diffContainer) {
    diffContainer.innerHTML = difficulties.map(d => {
      const count = allQuestions.filter(q => q.difficulty === d).length;
      return `
      <label class="quiz-setup__checkbox">
        <input type="checkbox" value="${d}" checked> ${d} <span class="quiz-setup__diff-count">${count}문제</span>
      </label>
    `;
    }).join('');
    diffContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', updateQuizSetupCountOptions);
    });
  }

  updateQuizSetupCountOptions();
}

function getCheckedSetupDifficulties() {
  return [...document.querySelectorAll('#quiz-setup-difficulty input:checked')].map(cb => cb.value);
}

function updateQuizSetupCountOptions() {
  const { allQuestions } = quizPool;
  const checked = getCheckedSetupDifficulties();
  const filtered = checked.length
    ? allQuestions.filter(q => checked.includes(q.difficulty))
    : allQuestions;

  const countSlider = document.getElementById('quiz-setup-count');
  const hintEl = document.getElementById('quiz-setup-hint');
  const startBtn = document.getElementById('quiz-setup-start-btn');

  if (!filtered.length) {
    if (countSlider) countSlider.disabled = true;
    setText('quiz-setup-count-value', '-');
    if (hintEl) hintEl.textContent = '선택한 난이도에 해당하는 문제가 없어요. 난이도를 다시 선택해주세요.';
    if (startBtn) startBtn.disabled = true;
    return;
  }

  const max = Math.min(MAX_QUIZ_QUESTION_COUNT, filtered.length);
  if (countSlider) {
    countSlider.disabled = false;
    countSlider.min = '1';
    countSlider.max = String(max);
    countSlider.value = String(max); // 기본값: 선택 가능한 최대 문항 수(=전체, 최대 50)
  }
  setText('quiz-setup-count-value', String(max));
  if (hintEl) hintEl.textContent = `선택한 난이도에서 총 ${filtered.length}문제 중 원하는 문항 수를 슬라이더로 골라주세요 (최대 ${max}문제).`;
  if (startBtn) startBtn.disabled = false;
}

function startQuizFromSetup() {
  if (!quizPool) return; // 문제 데이터 로드 실패 시 방어 (initQuizPage 에러 처리 참고)
  const { exam, allQuestions } = quizPool;
  const checked = getCheckedSetupDifficulties();
  const filtered = checked.length
    ? allQuestions.filter(q => checked.includes(q.difficulty))
    : allQuestions;
  if (!filtered.length) return;

  const countSlider = document.getElementById('quiz-setup-count');
  const count = Math.min(Number(countSlider?.value) || filtered.length, filtered.length);
  const questions = shuffleArray(filtered).slice(0, count); // 매 응시마다 문제 구성/순서를 무작위화

  quizState = { exam, questions, currentIndex: 0, answers: new Map(), flagged: new Set(), memos: new Map(), isWrongRetry: false };
  timerSec = Math.max(60, Math.round(exam.estimatedMinutes * 60 * (count / allQuestions.length)));
  resetTimerRingVisual();
  resetTimerExtend();

  setText('quiz-info-point', `${questions.length}점 (문제당 1점)`);
  setText('quiz-info-time', `${Math.round(timerSec / 60)}분`);
  setQuizInfoType(questions);

  renderQuizQuestion();
  showQuizPhase('play');
}

function setQuizInfoType(questions) {
  const types = [...new Set(questions.map(q => q.type))];
  setText('quiz-info-type', types.join(', '));
}

// ── 2단계: 응시 (문항 탐색) ──
function renderQuizQuestion() {
  const { questions, currentIndex, answers, flagged, memos } = quizState;
  const total = questions.length;
  const q = questions[currentIndex];

  setText('quiz-question-num', `Q${currentIndex + 1}.`);
  const diffTagEl = document.getElementById('quiz-question-difficulty-tag');
  if (diffTagEl) {
    diffTagEl.textContent = q.difficulty;
    diffTagEl.className = `tag ${DIFFICULTY_TAG_CLASS[q.difficulty] || 'tag--gray'}`;
  }
  setText('quiz-question-category-tag', q.category);
  setText('quiz-question-meta-tag', `${q.type} (${q.point}점)`);
  setText('quiz-question-text', q.text);

  const choicesEl = document.getElementById('quiz-choices');
  if (choicesEl) {
    const selected = answers.get(currentIndex);
    choicesEl.innerHTML = q.choices.map((choiceText, i) => `
      <button type="button" class="choice${selected === i ? ' choice--selected' : ''}" data-choice-index="${i}">
        <span class="choice__circle" aria-hidden="true"></span><span class="choice__text">${escapeHtml(choiceText)}</span>
      </button>
    `).join('');
  }

  const memoEl = document.getElementById('quiz-memo');
  if (memoEl) memoEl.value = memos.get(currentIndex) || '';
  const flagEl = document.getElementById('quiz-flag-checkbox');
  if (flagEl) flagEl.checked = flagged.has(currentIndex);

  const percent = Math.round(((currentIndex + 1) / total) * 100);
  setText('quiz-progress-text', `${currentIndex + 1} / ${total} 문제`);
  setText('quiz-progress-percent', `${percent}%`);
  const fillEl = document.getElementById('quiz-progress-fill');
  if (fillEl) {
    fillEl.dataset.progress = String(percent);
    fillEl.style.width = percent + '%'; // app.js는 최초 로드 시 1회만 적용하므로 재렌더링 시 직접 반영한다
  }
  const progressBarEl = document.querySelector('.quiz-progress .progress-bar');
  if (progressBarEl) progressBarEl.setAttribute('aria-valuenow', String(percent));

  const prevBtn = document.getElementById('quiz-prev-btn');
  const nextBtn = document.getElementById('quiz-next-btn');
  if (prevBtn) prevBtn.disabled = currentIndex === 0;
  if (nextBtn) nextBtn.textContent = currentIndex === total - 1 ? '제출하기' : '다음 문제 ›';

  renderQuizQuestionGrid();
}

function renderQuizQuestionGrid() {
  const grid = document.getElementById('quiz-question-grid');
  if (!grid) return;
  const { questions, currentIndex, answers, flagged } = quizState;
  grid.innerHTML = questions.map((_, i) => {
    const classes = ['question-grid__num'];
    if (i === currentIndex) classes.push('question-grid__num--curr');
    else if (answers.has(i)) classes.push('question-grid__num--done');
    if (flagged.has(i)) classes.push('question-grid__num--flagged');
    return `<button type="button" class="${classes.join(' ')}" data-q-index="${i}">${i + 1}</button>`;
  }).join('');
  grid.querySelectorAll('[data-q-index]').forEach(btn => {
    btn.addEventListener('click', () => goToQuizQuestion(Number(btn.dataset.qIndex)));
  });
}

function goToQuizQuestion(index) {
  if (!quizState || index < 0 || index >= quizState.questions.length) return;
  quizState.currentIndex = index;
  renderQuizQuestion();
}

// ── 3단계: 결과 (채점 · 포인트 적립 · 오답 확인) ──
// 포인트 공식: 정답 1문제당 10P + 만점 보너스 50P. 같은 시험 재응시는 "이전 최고 포인트 대비 개선분"만 적립되어
// 파밍을 방지하면서도 자기 갱신(더 높은 점수로 재도전)은 계속 보상한다.
function computeEarnedPoints(examId, correctCount, total, isPerfect) {
  const rawPoints = correctCount * 10 + (isPerfect ? 50 : 0);
  const history = [...(quizPool.seedHistory || []), ...getLocalExamAttempts()].filter(h => h.examId === examId);
  const priorBest = history.length ? Math.max(...history.map(h => h.pointsEarned || 0)) : 0;
  return Math.max(0, rawPoints - priorBest);
}

function getScoreTier(score) {
  if (score >= 90) return { emoji: '🎉', title: '완벽해요!', confetti: true };
  if (score >= 70) return { emoji: '👍', title: '잘했어요!', confetti: false };
  return { emoji: '🌱', title: '다음엔 더 잘할 수 있어요!', confetti: false };
}

function launchConfetti() {
  const colors = ['#4CAF50', '#8BC34A', '#FFC107', '#FF7043', '#42A5F5'];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = (Math.random() * 0.4) + 's';
    piece.style.animationDuration = (2 + Math.random() * 1.5) + 's';
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 4000);
  }
}

function finishQuiz() {
  if (!quizState) return;
  const { exam, questions, answers, isWrongRetry } = quizState;
  const total = questions.length;
  const correctCount = questions.filter((q, i) => answers.get(i) === q.answerIndex).length;
  const score = Math.round((correctCount / total) * 100);
  const isPerfect = correctCount === total;

  lastWrongQuestions = questions.filter((q, i) => answers.get(i) !== q.answerIndex);

  const tier = getScoreTier(score);
  setText('quiz-result-emoji', tier.emoji);
  setText('quiz-result-title', tier.title);
  setText('quiz-result-desc', `${exam.title} · ${correctCount} / ${total}문제를 맞혔어요.`);

  const resultCardEl = document.querySelector('.quiz-result__card');
  if (resultCardEl) {
    resultCardEl.classList.remove('quiz-result__card--great', 'quiz-result__card--low');
    if (score >= 90) resultCardEl.classList.add('quiz-result__card--great');
    else if (score < 70) resultCardEl.classList.add('quiz-result__card--low');
  }

  const retryWrongBtn = document.getElementById('quiz-result-retry-wrong-btn');
  if (retryWrongBtn) retryWrongBtn.hidden = lastWrongQuestions.length === 0;

  const breakdownEl = document.getElementById('quiz-result-breakdown');
  if (breakdownEl) breakdownEl.hidden = true; // "점수 보기"를 눌러야 펼쳐지도록 초기화

  renderQuizResultRing(score);
  renderQuizResultCategoryBreakdown(questions, answers);
  renderQuizResultQuestionList(questions, answers);

  // "오답만 다시 풀기"는 이미 채점된 시험을 부분 재응시하는 연습이므로, 정식 응시 기록/통계/포인트에는 반영하지 않는다
  // (그렇지 않으면 쉬운 소규모 재시도로 평균·최고 점수가 인위적으로 올라간다).
  if (!isWrongRetry) {
    const pointsEarned = computeEarnedPoints(exam.id, correctCount, total, isPerfect);
    saveExamAttempt(exam, score, pointsEarned, lastWrongQuestions.map(q => q.id));
  }

  showQuizPhase('result');
  if (tier.confetti) launchConfetti();
}

function renderQuizResultRing(score) {
  setText('quiz-result-score-value', score + '%');
  const fillEl = document.getElementById('quiz-result-ring-fill');
  if (fillEl) {
    const r = Number(fillEl.getAttribute('r')) || 30;
    const circumference = 2 * Math.PI * r;
    const offset = circumference * (1 - score / 100);
    fillEl.setAttribute('stroke-dasharray', circumference.toFixed(1));
    fillEl.setAttribute('stroke-dashoffset', offset.toFixed(1));
  }
  const svgEl = document.getElementById('quiz-result-ring-svg');
  if (svgEl) svgEl.setAttribute('aria-label', `이번 응시 점수 ${score}%`);
}

function renderQuizResultCategoryBreakdown(questions, answers) {
  const el = document.getElementById('quiz-result-category-breakdown');
  if (!el) return;
  const categories = [...new Set(questions.map(q => q.category))];

  if (categories.length < 2) {
    el.hidden = true;
    el.innerHTML = '';
    return;
  }

  el.hidden = false;
  el.innerHTML = categories.map(cat => {
    const inCategory = questions.map((q, i) => ({ q, i })).filter(({ q }) => q.category === cat);
    const correct = inCategory.filter(({ q, i }) => answers.get(i) === q.answerIndex).length;
    return `<div class="exam-stat"><span class="exam-stat__label">${escapeHtml(cat)}</span><span class="exam-stat__value">${correct} / ${inCategory.length}</span></div>`;
  }).join('');
}

function renderQuizResultQuestionList(questions, answers) {
  const listEl = document.getElementById('quiz-result-question-list');
  if (!listEl) return;

  listEl.innerHTML = questions.map((q, i) => {
    const userIndex = answers.get(i);
    const isCorrect = userIndex === q.answerIndex;
    if (isCorrect) {
      return `
        <div class="quiz-result__row quiz-result__row--correct">
          <span class="tag tag--green">Q${i + 1} 정답</span>
          <span class="quiz-result__row-text">${escapeHtml(q.text)}</span>
        </div>
      `;
    }
    const userAnswerText = userIndex === undefined ? '응답하지 않음' : q.choices[userIndex];
    return `
      <details class="wrong-note-item">
        <summary class="wrong-note-item__summary">
          <span class="tag tag--coral">Q${i + 1} 오답</span>
          <span class="wrong-note-item__question">${escapeHtml(q.text)}</span>
        </summary>
        <dl class="wrong-note-item__body">
          <dt>내가 고른 답</dt><dd>${escapeHtml(userAnswerText)}</dd>
          <dt>정답</dt><dd>${escapeHtml(q.choices[q.answerIndex])}</dd>
          <dt>🎯 핵심 개념</dt><dd>${escapeHtml(q.explanation.coreConcept)}</dd>
          <dt>✅ 정답 원리</dt><dd>${escapeHtml(q.explanation.whyCorrect)}</dd>
          <dt>❌ 오답 분석</dt><dd>${escapeHtml(q.explanation.whyIncorrect)}</dd>
          <dt>⚠️ 출제 유의사항</dt><dd>${escapeHtml(q.explanation.examPoint)}</dd>
          <dt>💼 실무 비유</dt><dd>${escapeHtml(q.explanation.practicalExample)}</dd>
        </dl>
      </details>
    `;
  }).join('');
}

function saveExamAttempt(exam, score, pointsEarned, wrongQuestionIds) {
  try {
    const list = getLocalExamAttempts();
    list.push({
      examId: exam.id,
      title: exam.title,
      icon: exam.icon,
      score,
      pointsEarned,
      date: new Date().toISOString().slice(0, 10),
      wrongQuestionIds: wrongQuestionIds || [] // exam.js 사이드패널 "오답노트" 개인화에 사용
    });
    const trimmed = list.length > MAX_STORED_ATTEMPTS ? list.slice(-MAX_STORED_ATTEMPTS) : list;
    localStorage.setItem(SESAC_EXAM_ATTEMPTS_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error(e);
  }
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// 문항 선택은 매번 새로 렌더링되는 .choice 버튼에 붙어야 하므로, 정적 바인딩 대신 컨테이너에 위임한다.
document.getElementById('quiz-choices')?.addEventListener('click', e => {
  const btn = e.target.closest('[data-choice-index]');
  if (!btn || !quizState) return;
  quizState.answers.set(quizState.currentIndex, Number(btn.dataset.choiceIndex));
  renderQuizQuestion();
});

document.getElementById('quiz-memo')?.addEventListener('input', e => {
  if (!quizState) return;
  quizState.memos.set(quizState.currentIndex, e.target.value);
});

document.getElementById('quiz-flag-checkbox')?.addEventListener('change', e => {
  if (!quizState) return;
  if (e.target.checked) quizState.flagged.add(quizState.currentIndex);
  else quizState.flagged.delete(quizState.currentIndex);
  renderQuizQuestionGrid();
});

document.getElementById('quiz-prev-btn')?.addEventListener('click', () => {
  if (quizState) goToQuizQuestion(quizState.currentIndex - 1);
});

document.getElementById('quiz-next-btn')?.addEventListener('click', () => {
  if (!quizState) return;
  if (quizState.currentIndex < quizState.questions.length - 1) {
    goToQuizQuestion(quizState.currentIndex + 1);
  } else {
    finishQuiz();
  }
});

document.getElementById('quiz-setup-start-btn')?.addEventListener('click', startQuizFromSetup);

document.getElementById('quiz-end-btn')?.addEventListener('click', () => {
  if (!quizState) return;
  // 오클릭으로 응시가 즉시 종료/채점되는 것을 막기 위한 최소한의 확인 (공용 확인 모달이 없어 네이티브 confirm 사용)
  if (confirm('정말 응시를 중단할까요? 지금까지 답한 내용으로 바로 채점돼요.')) finishQuiz();
});

document.getElementById('quiz-extend-btn')?.addEventListener('click', e => {
  if (timerExtendsUsed >= MAX_TIMER_EXTENDS) return;
  timerSec += 120;
  timerExtendsUsed++;
  const remaining = MAX_TIMER_EXTENDS - timerExtendsUsed;
  const btn = e.currentTarget;
  if (remaining <= 0) {
    btn.disabled = true;
    btn.textContent = '⟳ 시간 연장 다 썼어요';
  } else {
    btn.textContent = `⟳ 시간 연장하기 (${remaining}회 남음)`;
  }
  toast('⟳ 시간을 2분 연장했어요!');
});

document.getElementById('quiz-result-score-btn')?.addEventListener('click', () => {
  const breakdownEl = document.getElementById('quiz-result-breakdown');
  if (breakdownEl) breakdownEl.hidden = !breakdownEl.hidden;
});

document.getElementById('quiz-result-retry-btn')?.addEventListener('click', () => {
  if (!quizPool) return;
  renderQuizSetup();
  showQuizPhase('setup');
});

document.getElementById('quiz-result-retry-wrong-btn')?.addEventListener('click', () => {
  if (!quizPool || !lastWrongQuestions.length) return;
  quizState = {
    exam: quizPool.exam,
    questions: [...lastWrongQuestions],
    currentIndex: 0,
    answers: new Map(),
    flagged: new Set(),
    memos: new Map(),
    isWrongRetry: true
  };
  timerSec = Math.max(60, Math.round(quizPool.exam.estimatedMinutes * 60 * (lastWrongQuestions.length / quizPool.allQuestions.length)));
  resetTimerRingVisual();
  resetTimerExtend();
  setText('quiz-info-point', `${quizState.questions.length}점 (문제당 1점)`);
  setText('quiz-info-time', `${Math.round(timerSec / 60)}분`);
  setQuizInfoType(quizState.questions);
  renderQuizQuestion();
  showQuizPhase('play');
});

initQuizPage();

// ── 모의고사 타이머 (남은 시간 0 도달 시 자동 제출 추가) ──
// MPA 전환: quiz.js는 quiz.html뿐 아니라 mywords.html(단어 퀴즈 선택지 토글)에서도 로드되므로
// #quiz 요소가 없는 페이지에서 에러 없이 동작하도록 옵셔널 체이닝을 사용한다.
setInterval(() => {
  const playEl = document.getElementById('quiz-play');
  if (!playEl || playEl.hidden || timerSec <= 0) return;
  timerSec = Math.max(0, timerSec - 1);
  const el = document.getElementById('timer');
  if (el) el.textContent =
    String(Math.floor(timerSec / 60)).padStart(2, '0') + ':' +
    String(timerSec % 60).padStart(2, '0');
  const ringEl = document.querySelector('.time-ring');
  if (ringEl) {
    ringEl.classList.toggle('time-ring--warning', timerSec <= TIMER_WARNING_SEC);
    ringEl.classList.toggle('time-ring--critical', timerSec <= TIMER_CRITICAL_SEC);
  }
  if (timerSec === 0) {
    toast('⏰ 시간이 종료되어 자동 제출되었어요.');
    finishQuiz();
  }
}, 1000);

// ── 단어 퀴즈 옵션 선택 (원본은 인라인 style로 토글 → 동일한 시각 결과를 내는 클래스 토글로 교체) ──
document.querySelectorAll('.word-quiz__option').forEach(opt => {
  opt.addEventListener('click', function () {
    document.querySelectorAll('.word-quiz__option').forEach(o => o.classList.remove('word-quiz__option--selected'));
    this.classList.add('word-quiz__option--selected');
  });
});
