// ── QUIZ PAGE 전용 (quiz.html) — 응시 설정 → 문항 탐색 → 결과 3단계 흐름 ──
// URL의 ?id=examId로 exam.json에서 문제 풀을 불러온 뒤, 난이도/문항 수를 고르는 설정 화면 →
// 실제 응시 화면 → 채점 결과(오답 확인) 화면 순서로 진행한다.
// NOTE: assets/js/api.js가 아직 없어(docs/API_GUIDE.md 참고) 이 파일에서 직접 fetch한다.
// api.js가 생기면 이 fetch 로직은 공통 담당자와 협의해 그쪽으로 이관한다.

// NOTE: 이 프로젝트엔 storage.js(공통 담당자 소유, 아직 미신설)가 없어 localStorage를 직접 사용한다.
// storage.js가 생기면 이 저장 로직도 그쪽으로 이관한다. exam.js도 같은 키를 사용한다(파일 간 공유 모듈이 없어 상수를 각자 정의).
const SESAC_EXAM_ATTEMPTS_KEY = 'sesac-exam-attempts';
const DIFFICULTY_ORDER = ['기초', '중급', '고급', '심화'];
const MAX_QUIZ_QUESTION_COUNT = 50; // 문항 수 슬라이더 상한 (풀 크기가 더 작으면 풀 크기가 상한이 된다)

let quizState = null; // { exam, questions, currentIndex, answers: Map<index, choiceIndex> }
let quizPool = null;  // { exam, allQuestions } — 설정 화면에서 참조하는 전체 문제 풀
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

async function initQuizPage() {
  if (!document.getElementById('quiz')) return; // mywords.html 등 quiz.js를 공유하는 다른 페이지에서는 종료

  const examId = new URLSearchParams(location.search).get('id') || 'exam-001';

  try {
    const res = await fetch('assets/data/exam.json');
    if (!res.ok) throw new Error('문제 데이터를 불러오지 못했습니다.');
    const data = await res.json();

    const exam = data.list.find(item => item.id === examId);
    const allQuestions = resolveQuizQuestions(data, examId);
    if (!exam || !allQuestions.length) throw new Error('해당 모의고사를 찾을 수 없습니다.');

    quizPool = { exam, allQuestions };

    document.title = `${exam.title} 응시 — 새싹트리`;
    setText('quiz-title-text', exam.title);
    setText('quiz-level-tag', exam.level);
    setText('quiz-meta', `${exam.description} · ⏱ ${exam.estimatedMinutes}분 · 📝 ${allQuestions.length}문제 · 👥 ${exam.attemptCount}명 응시`);

    renderQuizSetup();
    showQuizPhase('setup');
  } catch (e) {
    console.error(e);
    toast('문제를 불러오지 못했어요. 목록으로 돌아가 다시 시도해주세요.');
  }
}

function resolveQuizQuestions(data, examId) {
  const combined = data.combinedQuestions && data.combinedQuestions[examId];
  if (combined) {
    return combined
      .map(ref => (data.questions[ref.examId] || []).find(q => q.id === ref.questionId))
      .filter(Boolean);
  }
  return data.questions[examId] || [];
}

function showQuizPhase(phase) {
  const setupEl = document.getElementById('quiz-setup');
  const playEl = document.getElementById('quiz-play');
  const resultEl = document.getElementById('quiz-result');
  const endBtn = document.getElementById('quiz-end-btn');
  if (setupEl) setupEl.hidden = phase !== 'setup';
  if (playEl) playEl.hidden = phase !== 'play';
  if (resultEl) resultEl.hidden = phase !== 'result';
  if (endBtn) endBtn.hidden = phase !== 'play'; // 설정/결과 화면에서는 헤더의 종료 버튼을 숨긴다 (중복 방지)
}

// ── 1단계: 응시 설정 (난이도 · 문항 수) ──
function renderQuizSetup() {
  const { allQuestions } = quizPool;
  const difficulties = DIFFICULTY_ORDER.filter(d => allQuestions.some(q => q.difficulty === d));

  const diffContainer = document.getElementById('quiz-setup-difficulty');
  if (diffContainer) {
    diffContainer.innerHTML = difficulties.map(d => `
      <label class="quiz-setup__checkbox">
        <input type="checkbox" value="${d}" checked> ${d}
      </label>
    `).join('');
    diffContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', updateQuizSetupCountOptions);
    });
  }

  document.getElementById('quiz-setup-count')?.addEventListener('input', e => {
    setText('quiz-setup-count-value', e.target.value);
  });

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
  const { exam, allQuestions } = quizPool;
  const checked = getCheckedSetupDifficulties();
  const filtered = checked.length
    ? allQuestions.filter(q => checked.includes(q.difficulty))
    : allQuestions;
  if (!filtered.length) return;

  const countSlider = document.getElementById('quiz-setup-count');
  const count = Math.min(Number(countSlider?.value) || filtered.length, filtered.length);
  const questions = filtered.slice(0, count);

  quizState = { exam, questions, currentIndex: 0, answers: new Map() };
  timerSec = Math.max(60, Math.round(exam.estimatedMinutes * 60 * (count / allQuestions.length)));

  setText('quiz-info-point', `${questions.length}점 (문제당 1점)`);
  setText('quiz-info-time', `${Math.round(timerSec / 60)}분`);

  renderQuizQuestion();
  showQuizPhase('play');
}

// ── 2단계: 응시 (문항 탐색) ──
function renderQuizQuestion() {
  const { questions, currentIndex, answers } = quizState;
  const total = questions.length;
  const q = questions[currentIndex];

  setText('quiz-question-num', `Q${currentIndex + 1}.`);
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

  const percent = Math.round(((currentIndex + 1) / total) * 100);
  setText('quiz-progress-text', `${currentIndex + 1} / ${total} 문제`);
  setText('quiz-progress-percent', `${percent}%`);
  const fillEl = document.getElementById('quiz-progress-fill');
  if (fillEl) {
    fillEl.dataset.progress = String(percent);
    fillEl.style.width = percent + '%'; // app.js는 최초 로드 시 1회만 적용하므로 재렌더링 시 직접 반영한다
  }

  const prevBtn = document.getElementById('quiz-prev-btn');
  const nextBtn = document.getElementById('quiz-next-btn');
  if (prevBtn) prevBtn.disabled = currentIndex === 0;
  if (nextBtn) nextBtn.textContent = currentIndex === total - 1 ? '제출하기' : '다음 문제 ›';

  renderQuizQuestionGrid();
}

function renderQuizQuestionGrid() {
  const grid = document.getElementById('quiz-question-grid');
  if (!grid) return;
  const { questions, currentIndex, answers } = quizState;
  grid.innerHTML = questions.map((_, i) => {
    const classes = ['question-grid__num'];
    if (i === currentIndex) classes.push('question-grid__num--curr');
    else if (answers.has(i)) classes.push('question-grid__num--done');
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

// ── 3단계: 결과 (채점 · 오답 확인) ──
function finishQuiz() {
  if (!quizState) return;
  const { exam, questions, answers } = quizState;
  const total = questions.length;
  const correctCount = questions.filter((q, i) => answers.get(i) === q.answerIndex).length;
  const score = Math.round((correctCount / total) * 100);

  setText('quiz-result-desc', `${exam.title} · ${correctCount} / ${total}문제를 맞혔어요.`);

  const breakdownEl = document.getElementById('quiz-result-breakdown');
  if (breakdownEl) breakdownEl.hidden = true; // "점수 보기"를 눌러야 펼쳐지도록 초기화

  renderQuizResultRing(score);
  renderQuizResultQuestionList(questions, answers);
  saveExamAttempt(exam, score);

  showQuizPhase('result');
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
          <dt>핵심 개념</dt><dd>${escapeHtml(q.explanation.coreConcept)}</dd>
          <dt>정답 원리</dt><dd>${escapeHtml(q.explanation.whyCorrect)}</dd>
          <dt>오답 분석</dt><dd>${escapeHtml(q.explanation.whyIncorrect)}</dd>
          <dt>출제 유의사항</dt><dd>${escapeHtml(q.explanation.examPoint)}</dd>
          <dt>실무 비유</dt><dd>${escapeHtml(q.explanation.practicalExample)}</dd>
        </dl>
      </details>
    `;
  }).join('');
}

function saveExamAttempt(exam, score) {
  try {
    const raw = localStorage.getItem(SESAC_EXAM_ATTEMPTS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.push({
      examId: exam.id,
      title: exam.title,
      icon: exam.icon,
      score,
      pointsEarned: score + 20,
      date: new Date().toISOString().slice(0, 10)
    });
    localStorage.setItem(SESAC_EXAM_ATTEMPTS_KEY, JSON.stringify(list));
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
  if (quizState) finishQuiz(); // 응시 중 조기 종료 — 지금까지 답한 것만으로 채점
});

document.getElementById('quiz-result-score-btn')?.addEventListener('click', () => {
  const breakdownEl = document.getElementById('quiz-result-breakdown');
  if (breakdownEl) breakdownEl.hidden = !breakdownEl.hidden;
});

initQuizPage();

// ── 모의고사 타이머 (원본 로직 그대로) ──
// MPA 전환: quiz.js는 quiz.html뿐 아니라 mywords.html(단어 퀴즈 선택지 토글)에서도 로드되므로
// #quiz 요소가 없는 페이지에서 에러 없이 동작하도록 옵셔널 체이닝을 사용한다.
setInterval(() => {
  if (document.getElementById('quiz-play') && !document.getElementById('quiz-play').hidden) {
    timerSec = Math.max(0, timerSec - 1);
    const el = document.getElementById('timer');
    if (el) el.textContent =
      String(Math.floor(timerSec / 60)).padStart(2, '0') + ':' +
      String(timerSec % 60).padStart(2, '0');
  }
}, 1000);

// ── 단어 퀴즈 옵션 선택 (원본은 인라인 style로 토글 → 동일한 시각 결과를 내는 클래스 토글로 교체) ──
document.querySelectorAll('.word-quiz__option').forEach(opt => {
  opt.addEventListener('click', function () {
    document.querySelectorAll('.word-quiz__option').forEach(o => o.classList.remove('word-quiz__option--selected'));
    this.classList.add('word-quiz__option--selected');
  });
});
