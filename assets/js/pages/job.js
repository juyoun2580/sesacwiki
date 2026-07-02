// ── 취업핸드북 페이지 ──────────────────────────────────────────────────────────
// 데이터 소스 : localStorage (키: JOB_KEY)
// 최초 접속 시 STEP_CATALOG로 초기화, 이후 localStorage 값 사용
// DATA_VERSION이 바뀌면 구형 데이터는 자동으로 초기화됨
// 기능 패널 렌더러는 job-features.js의 JOB_FEATURES 객체가 처리
// ──────────────────────────────────────────────────────────────────────────────

const JOB_KEY      = 'job_data';
const DATA_VERSION = 17;
let _showAllResults = false;

// ── 단계 / 태스크 카탈로그 ─────────────────────────────────────────────────────
const STEP_CATALOG = [
  {
    id: 1, label: '자격증', icon: '🏅',
    title: '1. 자격증',
    description: '보유한 자격증을 등록하고 나에게 맞는 직업을 추천받아보세요.',
    tip: '자격증 조합이 취업 방향을 결정해요! 보유한 자격증을 모두 입력하면 나에게 딱 맞는 직업을 추천해드려요.',
    tasks: []
  },
  {
    id: 2, label: '이력서 작성', icon: '📄',
    title: '2. 이력서 작성',
    description: '나의 경험과 역량을 담은 이력서를 작성해보세요.',
    tip: '채용 담당자가 10초 안에 파악할 수 있도록 핵심 내용을 간결하게 정리하세요. 최신 경력부터 역순으로 작성하는 것이 기본이에요!',
    tasks: []
  },
  {
    id: 3, label: '자기소개서', icon: '✏️',
    title: '3. 자기소개서',
    description: '나만의 스토리를 담은 자기소개서를 완성해보세요.',
    tip: '구체적인 숫자와 사례를 활용하면 설득력이 확 올라가요. "열심히 했다" 보다 "3개월 만에 30% 성과를 냈다"로 써보세요!',
    tasks: []
  },
  {
    id: 4, label: '포트폴리오', icon: '🖼',
    title: '4. 포트폴리오',
    description: '나의 역량을 보여주는 포트폴리오를 제작해보세요.',
    tip: '포트폴리오는 "내가 무엇을 할 수 있는가"를 증명하는 가장 강력한 도구예요. 결과물과 기여도를 명확히 표현해보세요.',
    tasks: []
  },
  {
    id: 5, label: '면접 준비', icon: '🎤',
    title: '5. 면접 준비',
    description: '완벽한 면접을 위해 철저하게 준비해보세요.',
    tip: '면접은 연습이 전부예요! 예상 질문을 소리 내서 답변해보는 것이 가장 효과적이에요. 거울 앞에서 연습하거나 영상으로 촬영해보세요.',
    tasks: [
      { icon: '🎤', title: '면접 준비', description: '예상 질문 · 답변 스크립트 · 모의 면접을 한 곳에서 준비하세요.', actionLabel: '준비하기 ›', variant: 'primary', feature: 'interview-manager' }
    ]
  },
  {
    id: 6, label: '지원 관리', icon: '📊',
    title: '6. 지원 관리',
    description: '지원 현황을 체계적으로 관리해보세요.',
    tip: '지원 현황을 한눈에 파악하면 다음 단계를 더 전략적으로 계획할 수 있어요. 거절도 기록해두면 나중에 큰 도움이 돼요!',
    tasks: [
      { icon: '📊', title: '지원 관리', description: '기업 목록 · 면접 일정 · 피드백을 한 곳에서 관리하세요.', actionLabel: '관리하기 ›', variant: 'primary', feature: 'application-manager' }
    ]
  }
];

// ── 계산 헬퍼 ─────────────────────────────────────────────────────────────────
function getStepPercent(step) {
  if (!step.tasks.length) return 0;
  return Math.round(step.tasks.filter(t => t.completed).length / step.tasks.length * 100);
}

function getStepStatus(step, activeStepId) {
  if (getStepPercent(step) === 100) return 'done';
  if (step.id === activeStepId) return 'active';
  return 'todo';
}


function loadFeaturesData() {
  try {
    const stored = localStorage.getItem('job_features');
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return null;
}

function isStepDone(stepId, f) {
  if (!f) return false;
  switch (stepId) {
    case 2: return f.resume && (f.resume.education?.length > 0 || f.resume.experience?.length > 0 || f.resume.skills?.length > 0);
    case 3: return f.coverLetter && Object.values(f.coverLetter).every(v => typeof v === 'string' && v.trim());
    case 4: return f.projects && f.projects.length > 0;
    case 5: return (f.interviewAnswers && Object.values(f.interviewAnswers).some(v => typeof v === 'string' && v.trim())) ||
                   (f.mockAnswers && Object.values(f.mockAnswers).some(v => Array.isArray(v) && v.length > 0));
    case 6: return (f.companies && f.companies.length > 0) || (f.interviews && f.interviews.length > 0);
    default: return false;
  }
}

function getProgressByCategory(data) {
  const features = loadFeaturesData();
  return data.steps.slice(1).map(step => ({
    label: step.label,
    stepId: step.id,
    done: isStepDone(step.id, features)
  }));
}

function getRecentResults(data, limit = 3) {
  const results = [];
  data.steps.forEach(step => {
    step.tasks.forEach(task => {
      if (task.completed && task.completedAt) {
        results.push({ title: `[${step.label}] ${task.title}`, status: '완료', statusColor: 'green', date: task.completedAt });
      }
    });
  });
  const sorted = results.sort((a, b) => b.date.localeCompare(a.date));
  return limit === Infinity ? sorted : sorted.slice(0, limit);
}

// ── 스토리지 ──────────────────────────────────────────────────────────────────
function loadData() {
  try {
    const stored = localStorage.getItem(JOB_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.version === DATA_VERSION) return parsed;
    }
  } catch { /* ignore */ }
  return freshData();
}

function freshData() {
  const data = {
    version: DATA_VERSION,
    activeStepId: 1,
    steps: JSON.parse(JSON.stringify(STEP_CATALOG)),
    tools: [
      { label: '🏅 자격증',        stepId: 1 },
      { label: '📄 이력서 작성',   stepId: 2 },
      { label: '✏️ 자기소개서',    stepId: 3 },
      { label: '🎤 면접 준비',     stepId: 5 }
    ]
  };
  saveData(data);
  return data;
}

function saveData(data) {
  try { localStorage.setItem(JOB_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

// ── 기능 패널 ─────────────────────────────────────────────────────────────────
function showFeature(key, section) {
  const def = (typeof JOB_FEATURES !== 'undefined') && JOB_FEATURES[key];
  if (!def) return;
  document.getElementById('job-card').hidden    = true;
  document.getElementById('job-feature').hidden = false;
  document.getElementById('job-feature-title').textContent = def.title;
  const body = document.getElementById('job-feature-body');
  body.innerHTML = '';
  def.render(body, { section: section || null });
}

function hideFeature() {
  document.getElementById('job-feature').hidden = true;
  document.getElementById('job-card').hidden    = false;
}

// ── 렌더 ──────────────────────────────────────────────────────────────────────
function render(data) {
  const activeStep = data.steps.find(s => s.id === data.activeStepId);
  if (!activeStep) return;

  const stepsWithMeta = data.steps.map(step => ({
    ...step,
    status: getStepStatus(step, data.activeStepId),
    percent: getStepPercent(step)
  }));

  fillSidebarMenu(stepsWithMeta, data.activeStepId);
  fillStepper(stepsWithMeta);
  fillJobCard(activeStep);
  fillProgressList(getProgressByCategory(data));
  fillResultList(getRecentResults(data, _showAllResults ? Infinity : 3));
  fillToolGrid(data.tools, data.activeStepId);

  const featureEl = document.getElementById('job-feature');
  if (activeStep.id === 1)      showFeature('cert-select');
  else if (activeStep.id === 2) showFeature('resume-builder');
  else if (activeStep.id === 3) showFeature('cover-editor');
  else if (activeStep.id === 4) showFeature('portfolio-builder');
  else if (activeStep.id === 5) showFeature('interview-manager');
  else if (activeStep.id === 6) showFeature('application-manager');
  else if (featureEl && !featureEl.hidden) hideFeature();
}

// ── 채움 함수 ─────────────────────────────────────────────────────────────────
function fillSidebarMenu(steps, activeId) {
  const el = document.getElementById('job-sidebar-menu');
  if (!el) return;
  el.innerHTML = steps.map(step => `
    <button type="button"
            class="sidebar__item${step.id === activeId ? ' sidebar__item--active' : ''}"
            data-action="switch-step" data-step-id="${step.id}">
      <span class="sidebar__item-icon" aria-hidden="true">${step.icon}</span>${step.label}
    </button>`).join('');
}


function fillStepper(steps) {
  const el = document.getElementById('job-stepper');
  if (!el) return;
  el.innerHTML = steps.map((step, i) => {
    const circleMod = step.status === 'done'   ? ' job-stepper__circle--done'
                    : step.status === 'active' ? ' job-stepper__circle--active' : '';
    const labelMod  = step.status === 'active' ? ' job-stepper__label--active' : '';
    const connector = i < steps.length - 1
      ? `<span class="job-stepper__connector${step.status === 'done' ? ' job-stepper__connector--done' : ''}" aria-hidden="true"></span>`
      : '';
    return `
      <div class="job-stepper__step">
        <button type="button" class="job-stepper__node"
                data-action="switch-step" data-step-id="${step.id}"
                aria-label="${step.label} 단계">
          <span class="job-stepper__circle${circleMod}" aria-hidden="true">${step.status === 'done' ? '✓' : step.id}</span>
          <span class="job-stepper__label${labelMod}">${step.label}</span>
        </button>
        ${connector}
      </div>`;
  }).join('');
}

function fillJobCard(activeStep) {
  const percent = getStepPercent(activeStep);

  const icon  = document.getElementById('job-card-icon');
  const title = document.getElementById('job-card-title');
  const desc  = document.getElementById('job-card-desc');
  const bar   = document.getElementById('job-card-bar');
  const fill  = document.getElementById('job-card-fill');
  const pct   = document.getElementById('job-card-percent');
  const tip   = document.getElementById('job-tip-text');

  if (icon)  icon.textContent  = activeStep.icon || '';
  if (title) title.textContent = activeStep.title;
  if (desc)  desc.textContent  = activeStep.description;
  if (bar)   bar.setAttribute('aria-valuenow', percent);
  if (fill)  { fill.dataset.progress = percent; fill.style.width = percent + '%'; }
  if (pct)   pct.textContent  = `진행률 ${percent}%`;
  if (tip)   tip.innerHTML    = `<strong>오늘의 취업 팁</strong><br>${activeStep.tip}`;

  const taskList = document.getElementById('job-task-list');
  if (!taskList) return;

  taskList.innerHTML = activeStep.tasks.map((task, idx) => {
    const isDone = task.completed;
    const btnClass = 'btn btn--outline btn--sm job-task__btn';
    return `
      <li>
        <div class="job-task${isDone ? ' job-task--done' : ''}">
          <button type="button"
                  class="job-task__check${isDone ? ' job-task__check--done' : ''}"
                  data-action="toggle-task"
                  data-step-id="${activeStep.id}"
                  data-task-idx="${idx}"
                  aria-pressed="${isDone}"
                  aria-label="${task.title} ${isDone ? '완료 취소' : '완료로 표시'}">
            ${isDone ? '✓' : ''}
          </button>
          <span class="job-task__icon" aria-hidden="true">${task.icon}</span>
          <div class="job-task__body">
            <p class="job-task__title">${task.title}</p>
            <p class="job-task__desc">${task.description}</p>
          </div>
          <button type="button" class="${btnClass}"
                  data-action="open-feature"
                  data-feature="${task.feature}"
                  ${task.featureSection ? `data-feature-section="${task.featureSection}"` : ''}>
            ${task.actionLabel}
          </button>
        </div>
      </li>`;
  }).join('');
}

function fillProgressList(progressByCategory) {
  const el = document.getElementById('job-progress-list');
  if (!el) return;
  el.innerHTML = progressByCategory.map(item => `
    <li class="job-progress-row job-progress-row--link"
        data-action="switch-step" data-step-id="${item.stepId}">
      <span class="job-progress-row__label">${item.label}</span>
      <span class="tag tag--${item.done ? 'green' : 'gray'}">${item.done ? '작성완료' : '미작성'}</span>
    </li>`).join('');
}

function fillResultList(recentResults) {
  const el = document.getElementById('job-result-list');
  if (!el) return;
  if (!recentResults.length) {
    el.innerHTML = '<li class="job-result-list__empty">완료한 항목이 없어요.<br>첫 번째 단계를 시작해보세요! 🌱</li>';
    return;
  }
  el.innerHTML = recentResults.map(item => `
    <li class="job-result-item">
      <p class="job-result-item__title">${item.title}</p>
      <span class="tag tag--${item.statusColor}">${item.status}</span>
      <span class="job-result-item__date">${item.date.replace(/-/g, '.')}</span>
    </li>`).join('');
}

function fillToolGrid(tools, activeStepId) {
  const el = document.getElementById('job-tool-grid');
  if (!el) return;
  el.innerHTML = tools.map(tool =>
    `<button type="button"
             class="job-tool-btn${tool.stepId === activeStepId ? ' job-tool-btn--active' : ''}"
             data-action="switch-step" data-step-id="${tool.stepId}">${tool.label}</button>`
  ).join('');
}

// ── 초기화 ────────────────────────────────────────────────────────────────────
(function initJobPage() {
  if (!document.getElementById('job')) return;

  let data;
  try {
    data = loadData();
    render(data);

    // 이벤트 위임 — #job 안의 모든 상호작용 처리
    document.getElementById('job').addEventListener('click', function (e) {

      // 기능 패널 열기 (태스크 액션 버튼 / 도구 버튼)
      const featureBtn = e.target.closest('[data-action="open-feature"]');
      if (featureBtn) {
        showFeature(featureBtn.dataset.feature, featureBtn.dataset.featureSection);
        return;
      }

      // 단계 전환 (스테퍼 + 사이드바)
      const switchBtn = e.target.closest('[data-action="switch-step"]');
      if (switchBtn) {
        const stepId = parseInt(switchBtn.dataset.stepId, 10);
        if (stepId && stepId !== data.activeStepId) {
          data.activeStepId = stepId;
          saveData(data);
          render(data);
        }
        return;
      }

      // 최근 완료 항목 전체보기 토글
      const resultsToggle = e.target.closest('[data-action="toggle-all-results"]');
      if (resultsToggle) {
        _showAllResults = !_showAllResults;
        resultsToggle.textContent = _showAllResults ? '접기 ›' : '전체보기 ›';
        fillResultList(getRecentResults(data, _showAllResults ? Infinity : 3));
        return;
      }

      // 태스크 완료 토글
      const toggleBtn = e.target.closest('[data-action="toggle-task"]');
      if (toggleBtn) {
        const stepId  = parseInt(toggleBtn.dataset.stepId,  10);
        const taskIdx = parseInt(toggleBtn.dataset.taskIdx, 10);
        const step = data.steps.find(s => s.id === stepId);
        if (step && step.tasks[taskIdx]) {
          const task = step.tasks[taskIdx];
          task.completed   = !task.completed;
          task.completedAt = task.completed ? new Date().toISOString().slice(0, 10) : undefined;
          saveData(data);
          render(data);
          if (typeof toast === 'function') {
            toast(task.completed ? '✅ 완료 처리했어요!' : '↩️ 완료를 취소했어요.');
          }
        }
      }
    });

  } catch (e) {
    console.error(e);
    if (typeof toast === 'function') toast('데이터를 불러오지 못했어요. 다시 시도해주세요.');
  }
})();
