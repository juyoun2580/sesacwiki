// ── 취업핸드북 페이지 ──────────────────────────────────────────────────────────
// 데이터 소스 : localStorage (키: JOB_KEY)
// 최초 접속 시 STEP_CATALOG로 초기화, 이후 localStorage 값 사용
// DATA_VERSION이 바뀌면 구형 데이터는 자동으로 초기화됨
// 기능 패널 렌더러는 job-features.js의 JOB_FEATURES 객체가 처리
// ──────────────────────────────────────────────────────────────────────────────

const JOB_KEY      = 'job_data';
const DATA_VERSION = 4;

// ── 단계 / 태스크 카탈로그 ─────────────────────────────────────────────────────
const STEP_CATALOG = [
  {
    id: 1, label: '직무 탐색', icon: '🔍',
    title: '1. 직무 탐색',
    description: '나에게 맞는 직무를 탐색하고 목표를 설정해보세요.',
    tip: '직무 탐색은 취업 준비의 첫 걸음이에요! 관심 있는 직무의 실제 업무 내용과 필요한 역량을 꼼꼼히 조사해보세요.',
    tasks: [
      { icon: '🔍', title: '관심 직무 조사',     description: '관심 있는 직무의 역할과 요구 역량을 알아보세요.',         actionLabel: '조사하기 ›', variant: 'primary', feature: 'interests' },
      { icon: '📊', title: '직무 적성 체크',     description: '나의 강점과 직무 적합도를 확인해보세요.',                actionLabel: '체크하기 ›', variant: 'outline', feature: 'aptitude' },
      { icon: '🏢', title: '업계 분석',          description: '관심 업계의 트렌드와 주요 기업을 분석해보세요.',          actionLabel: '분석하기 ›', variant: 'outline', feature: 'industry' },
      { icon: '📋', title: '채용 공고 살펴보기', description: '관심 직무의 채용 공고를 확인하고 요구사항을 파악해보세요.', actionLabel: '살펴보기 ›', variant: 'outline', feature: 'postings' }
    ]
  },
  {
    id: 2, label: '이력서 작성', icon: '📄',
    title: '2. 이력서 작성',
    description: '나의 경험과 역량을 담은 이력서를 작성해보세요.',
    tip: '채용 담당자가 10초 안에 파악할 수 있도록 핵심 내용을 간결하게 정리하세요. 최신 경력부터 역순으로 작성하는 것이 기본이에요!',
    tasks: [
      { icon: '📄', title: '이력서 양식 선택',  description: '지원 직무에 맞는 이력서 템플릿을 선택하세요.',       actionLabel: '선택하기 ›',  variant: 'primary', feature: 'resume-template' },
      { icon: '🎓', title: '학력 / 경력 입력',  description: '최신 순으로 학력과 경력 사항을 입력하세요.',         actionLabel: '입력하기 ›',  variant: 'outline', feature: 'resume-history' },
      { icon: '💻', title: '기술 스택 정리',    description: '보유한 기술 스택을 숙련도와 함께 정리하세요.',       actionLabel: '정리하기 ›',  variant: 'outline', feature: 'resume-skills' }
    ]
  },
  {
    id: 3, label: '자기소개서', icon: '✏️',
    title: '3. 자기소개서',
    description: '나만의 스토리를 담은 자기소개서를 완성해보세요.',
    tip: '구체적인 숫자와 사례를 활용하면 설득력이 확 올라가요. "열심히 했다" 보다 "3개월 만에 30% 성과를 냈다"로 써보세요!',
    tasks: [
      { icon: '📋', title: '자기소개서 항목 확인', description: '기업이 원하는 자기소개서 항목을 확인하세요.',            actionLabel: '확인하기 ›', variant: 'primary', feature: 'cover-editor' },
      { icon: '🌱', title: '성장 과정 작성',       description: '나의 성장 스토리를 진솔하게 담아보세요.',               actionLabel: '작성하기 ›', variant: 'outline', feature: 'cover-editor', featureSection: 'growth' },
      { icon: '🎯', title: '지원 동기 작성',       description: '이 기업에 지원하고 싶은 이유를 구체적으로 써보세요.',    actionLabel: '작성하기 ›', variant: 'outline', feature: 'cover-editor', featureSection: 'motivation' }
    ]
  },
  {
    id: 4, label: '포트폴리오', icon: '🖼',
    title: '4. 포트폴리오',
    description: '나의 역량을 보여주는 포트폴리오를 제작해보세요.',
    tip: '포트폴리오는 "내가 무엇을 할 수 있는가"를 증명하는 가장 강력한 도구예요. 결과물과 기여도를 명확히 표현해보세요.',
    tasks: [
      { icon: '📦', title: '프로젝트 목록 정리', description: '참여한 모든 프로젝트를 날짜와 함께 나열하세요.',   actionLabel: '정리하기 ›',  variant: 'primary', feature: 'projects' },
      { icon: '⭐', title: '대표 프로젝트 선택', description: '가장 임팩트 있는 대표 프로젝트를 골라보세요.',     actionLabel: '선택하기 ›',  variant: 'outline', feature: 'projects' },
      { icon: '🖼', title: '포트폴리오 구성',    description: '스크린샷, 설명, 기술 스택을 포함해 구성하세요.',  actionLabel: '구성하기 ›',  variant: 'outline', feature: 'portfolio-view' },
      { icon: '📑', title: 'PDF 내보내기',       description: '완성된 포트폴리오를 PDF 파일로 저장하세요.',       actionLabel: '내보내기 ›', variant: 'outline', feature: 'pdf-export' }
    ]
  },
  {
    id: 5, label: '면접 준비', icon: '🎤',
    title: '5. 면접 준비',
    description: '완벽한 면접을 위해 철저하게 준비해보세요.',
    tip: '면접은 연습이 전부예요! 예상 질문을 소리 내서 답변해보는 것이 가장 효과적이에요. 거울 앞에서 연습하거나 영상으로 촬영해보세요.',
    tasks: [
      { icon: '❓', title: '예상 질문 확인',      description: '직무별 자주 나오는 면접 질문을 확인하세요.',       actionLabel: '확인하기 ›',   variant: 'primary', feature: 'interview-questions' },
      { icon: '📝', title: '답변 스크립트 작성',  description: '핵심 질문에 대한 나만의 답변을 준비하세요.',       actionLabel: '작성하기 ›',   variant: 'outline', feature: 'interview-answers' },
      { icon: '🏢', title: '기업 / 직무 리서치',  description: '지원 기업의 최근 동향과 직무 이해를 높이세요.',    actionLabel: '리서치하기 ›', variant: 'outline', feature: 'research' },
      { icon: '🎬', title: '모의 면접 진행',      description: '실전처럼 모의 면접을 경험해보세요.',               actionLabel: '시작하기 ›',   variant: 'outline', feature: 'mock-interview' }
    ]
  },
  {
    id: 6, label: '지원 관리', icon: '📊',
    title: '6. 지원 관리',
    description: '지원 현황을 체계적으로 관리해보세요.',
    tip: '지원 현황을 한눈에 파악하면 다음 단계를 더 전략적으로 계획할 수 있어요. 거절도 기록해두면 나중에 큰 도움이 돼요!',
    tasks: [
      { icon: '📋', title: '지원 기업 목록 작성', description: '지원할 또는 지원한 기업 목록을 정리하세요.',   actionLabel: '작성하기 ›', variant: 'primary', feature: 'companies' },
      { icon: '📬', title: '서류 전형 결과 확인', description: '서류 합격 / 불합격 결과를 기록하세요.',         actionLabel: '확인하기 ›', variant: 'outline', feature: 'company-status' },
      { icon: '📅', title: '면접 일정 관리',      description: '면접 날짜와 장소를 달력에 등록하세요.',          actionLabel: '관리하기 ›', variant: 'outline', feature: 'interview-schedule' },
      { icon: '💬', title: '피드백 정리',          description: '면접 후기와 개선점을 기록해두세요.',             actionLabel: '정리하기 ›', variant: 'outline', feature: 'feedback' }
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

function getReadinessPercent(data) {
  const total = data.steps.reduce((sum, step) => sum + getStepPercent(step), 0);
  return Math.round(total / data.steps.length);
}

function getProgressByCategory(data) {
  const colors = ['green', 'blue', 'orange', 'coral', 'purple'];
  return data.steps.slice(1).map((step, i) => ({
    label: step.label,
    percent: getStepPercent(step),
    color: colors[i]
  }));
}

function getRecentResults(data) {
  const results = [];
  data.steps.forEach(step => {
    step.tasks.forEach(task => {
      if (task.completed && task.completedAt) {
        results.push({ title: `[${step.label}] ${task.title}`, status: '완료', statusColor: 'green', date: task.completedAt });
      }
    });
  });
  return results.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
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
      { label: '📄 자소서 템플릿',   feature: 'cover-editor' },
      { label: '🏢 기업 분석',       feature: 'research' },
      { label: '🎯 핵심 역량 찾기',  feature: 'aptitude' },
      { label: '❓ 면접 질문 모음',  feature: 'interview-questions' }
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
  fillReadinessCard(getReadinessPercent(data));
  fillStepper(stepsWithMeta);
  fillJobCard(activeStep);
  fillProgressList(getProgressByCategory(data));
  fillResultList(getRecentResults(data));
  fillToolGrid(data.tools);
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

function fillReadinessCard(percent) {
  const val   = document.getElementById('job-readiness-value');
  const delta = document.getElementById('job-readiness-delta');
  const bar   = document.getElementById('job-readiness-bar');
  const fill  = document.getElementById('job-readiness-fill');

  if (val)   val.textContent   = percent + '%';
  if (delta) delta.textContent = percent > 0 ? `전체 진행률 ${percent}% 달성 중` : '아직 시작 전이에요 💪';
  if (bar)   bar.setAttribute('aria-valuenow', percent);
  if (fill)  { fill.dataset.progress = percent; fill.style.width = percent + '%'; }
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
    <li class="job-progress-row">
      <span class="job-progress-row__label">${item.label}</span>
      <div class="progress-bar job-progress-row__bar" role="progressbar"
           aria-valuenow="${item.percent}" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar__fill progress-bar__fill--${item.color}"
             data-progress="${item.percent}" style="width:${item.percent}%"></div>
      </div>
      <span class="job-progress-row__value job-progress-row__value--${item.color}">${item.percent}%</span>
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

function fillToolGrid(tools) {
  const el = document.getElementById('job-tool-grid');
  if (!el) return;
  el.innerHTML = tools.map(tool =>
    `<button type="button" class="job-tool-btn"
             data-action="open-feature" data-feature="${tool.feature}">${tool.label}</button>`
  ).join('');
}

// ── 초기화 ────────────────────────────────────────────────────────────────────
(function initJobPage() {
  if (!document.getElementById('job')) return;

  let data;
  try {
    data = loadData();
    render(data);

    // 준비 지수 카드 버튼 (정적 요소라 직접 바인딩)
    document.querySelector('.job-readiness-card__btn')
      ?.addEventListener('click', () => { if (typeof toast === 'function') toast('준비 지수 상세 분석 화면으로 이동해요!'); });

    // 기능 패널 뒤로가기 버튼
    document.getElementById('job-feature-back')
      ?.addEventListener('click', hideFeature);

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
          // 기능 패널이 열려있으면 닫기
          if (!document.getElementById('job-feature').hidden) hideFeature();
        }
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
