// assets/js/pages/job.js
// job.html <section id="job"> 전체를 job.json 데이터로 렌더링한다.
// NOTE: api.js(공통 담당자 소유)가 생성되면 fetch 부분을 api.js 함수로 교체한다.

(async function initJobPage() {
  if (!document.getElementById('job')) return;

  try {
    const res = await fetch('assets/data/job.json');
    if (!res.ok) throw new Error('job.json 로드 실패');
    const data = await res.json();

    renderSidebar(data.steps, data.activeStep.id, data.readiness);
    renderStepper(data.steps);
    renderJobCard(data.activeStep);
    renderSidePanel(data.progressByCategory, data.recentResults, data.tools);
    applyProgressBars();
    bindJobEvents();
  } catch (e) {
    console.error(e);
    if (typeof toast === 'function') toast('데이터를 불러오지 못했어요. 다시 시도해주세요.');
  }
})();

// app.js의 data-progress 처리는 페이지 로드 시 1회만 실행되므로
// 동적 렌더링 이후에 직접 적용한다.
function applyProgressBars() {
  document.querySelectorAll('#job [data-progress]').forEach(el => {
    el.style.width = el.dataset.progress + '%';
  });
}

// ui.js의 querySelectorAll 초기화는 동적 요소를 잡지 못하므로
// job 섹션 내 토스트·사이드바 클릭을 이벤트 위임으로 처리한다.
function bindJobEvents() {
  const jobEl = document.getElementById('job');
  if (!jobEl) return;

  jobEl.addEventListener('click', function (e) {
    const toastBtn = e.target.closest('[data-action="toast"]');
    if (toastBtn && typeof toast === 'function') {
      toast(toastBtn.dataset.message);
    }

    const sidebarBtn = e.target.closest('#job-sidebar .sidebar__item');
    if (sidebarBtn) {
      document.querySelectorAll('#job-sidebar .sidebar__item')
        .forEach(x => x.classList.remove('sidebar__item--active'));
      sidebarBtn.classList.add('sidebar__item--active');
    }
  });
}

function renderSidebar(steps, activeId, readiness) {
  const sidebar = document.getElementById('job-sidebar');
  if (!sidebar) return;

  const menuItems = steps.map(step => `
    <button type="button" class="sidebar__item${step.id === activeId ? ' sidebar__item--active' : ''}">
      <span class="sidebar__item-icon" aria-hidden="true">${step.icon}</span>${step.label}
    </button>`).join('');

  sidebar.innerHTML = `
    <p class="sidebar__label">취업핸드북</p>
    ${menuItems}
    <div class="job-readiness-card">
      <p class="job-readiness-card__title">나의 취업 준비 지수</p>
      <p class="job-readiness-card__value">${readiness.percent}%</p>
      <p class="job-readiness-card__delta">지난주 대비 +${readiness.deltaFromLastWeek}% ↑</p>
      <div class="progress-bar" role="progressbar"
           aria-valuenow="${readiness.percent}" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar__fill progress-bar__fill--green"
             data-progress="${readiness.percent}"></div>
      </div>
      <button type="button" class="btn btn--outline btn--sm job-readiness-card__btn">상세 분석 보기</button>
      <p class="job-readiness-card__decor" aria-hidden="true">🌿</p>
    </div>`;
}

function renderStepper(steps) {
  const stepper = document.getElementById('job-stepper');
  if (!stepper) return;

  stepper.innerHTML = steps.map((step, i) => {
    const circleMod = step.status === 'done' ? ' job-stepper__circle--done'
      : step.status === 'active' ? ' job-stepper__circle--active' : '';
    const label = step.status === 'active'
      ? `<span class="job-stepper__label job-stepper__label--active">${step.label}</span>`
      : `<span class="job-stepper__label">${step.label}</span>`;
    const connector = i < steps.length - 1
      ? `<span class="job-stepper__connector${step.status === 'done' ? ' job-stepper__connector--done' : ''}" aria-hidden="true"></span>`
      : '';

    return `
      <div class="job-stepper__step">
        <div class="job-stepper__node">
          <span class="job-stepper__circle${circleMod}" aria-hidden="true">
            ${step.status === 'done' ? '✓' : step.id}
          </span>
          ${label}
        </div>
        ${connector}
      </div>`;
  }).join('');
}

function renderJobCard(activeStep) {
  const card = document.getElementById('job-card');
  if (!card) return;

  const tasks = activeStep.tasks.map(task => {
    const btnClass = task.variant === 'feedback'
      ? 'btn btn--sm job-task__btn job-task__btn--feedback'
      : task.variant === 'outline'
      ? 'btn btn--outline btn--sm job-task__btn'
      : 'btn btn--primary btn--sm job-task__btn';

    return `
      <li>
        <div class="job-task">
          <span class="job-task__icon" aria-hidden="true">${task.icon}</span>
          <div class="job-task__body">
            <p class="job-task__title">${task.title}</p>
            <p class="job-task__desc">${task.description}</p>
          </div>
          <span class="job-task__meta">${task.meta}</span>
          <button type="button" class="${btnClass}"
                  data-action="toast" data-message="${task.toastMessage}">
            ${task.actionLabel}
          </button>
        </div>
      </li>`;
  }).join('');

  card.innerHTML = `
    <div class="job-card__head">
      <span class="job-card__head-icon" aria-hidden="true">${activeStep.icon || '✏️'}</span>
      <div class="job-card__head-body">
        <p class="job-card__title">${activeStep.title}</p>
        <p class="job-card__desc">${activeStep.description}</p>
        <div class="progress-bar job-card__progress" role="progressbar"
             aria-valuenow="${activeStep.percent}" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-bar__fill progress-bar__fill--blue"
               data-progress="${activeStep.percent}"></div>
        </div>
      </div>
      <p class="job-card__percent">진행률 ${activeStep.percent}%</p>
    </div>
    <ul class="job-task-list">${tasks}</ul>
    <div class="job-tip">
      <span class="job-tip__icon" aria-hidden="true">💡</span>
      <p class="job-tip__text"><strong>오늘의 취업 팁</strong><br>${activeStep.tip}</p>
      <span class="job-tip__decor" aria-hidden="true">🌿</span>
    </div>`;
}

function renderSidePanel(progressByCategory, recentResults, tools) {
  const panel = document.getElementById('job-side-panel');
  if (!panel) return;

  const progressRows = progressByCategory.map(item => `
    <li class="job-progress-row">
      <span class="job-progress-row__label">${item.label}</span>
      <div class="progress-bar job-progress-row__bar" role="progressbar"
           aria-valuenow="${item.percent}" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar__fill progress-bar__fill--${item.color}"
             data-progress="${item.percent}"></div>
      </div>
      <span class="job-progress-row__value job-progress-row__value--${item.color}">${item.percent}%</span>
    </li>`).join('');

  const resultItems = recentResults.map(item => `
    <li class="job-result-item">
      <p class="job-result-item__title">${item.title}</p>
      <span class="tag tag--${item.statusColor}">${item.status}</span>
      <span class="job-result-item__date">${item.date.replace(/-/g, '.')}</span>
    </li>`).join('');

  const toolBtns = tools.map(tool =>
    `<button type="button" class="job-tool-btn">${tool}</button>`).join('');

  panel.innerHTML = `
    <div class="section-title">나의 취업 준비 현황
      <button type="button" class="section-title__link">전체보기 ›</button>
    </div>
    <ul class="job-progress-list">${progressRows}</ul>
    <div class="section-title">최근 작성한 자기소개서
      <button type="button" class="section-title__link">전체보기 ›</button>
    </div>
    <ul class="job-result-list">${resultItems}</ul>
    <p class="section-title section-title--sm">자주 사용하는 도구</p>
    <div class="job-tool-grid">${toolBtns}</div>`;
}
