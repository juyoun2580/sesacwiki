// assets/js/pages/job.js
// HTML 구조는 job.html에 유지, 이 파일은 job.json 데이터만 주입한다.
// NOTE: api.js(공통 담당자 소유)가 생성되면 fetch 부분을 api.js 함수로 교체한다.

(async function initJobPage() {
  if (!document.getElementById('job')) return;

  try {
    const res = await fetch('assets/data/job.json');
    if (!res.ok) throw new Error('job.json 로드 실패');
    const data = await res.json();

    fillSidebarMenu(data.steps, data.activeStep.id);
    fillReadinessCard(data.readiness);
    fillStepper(data.steps);
    fillJobCard(data.activeStep);
    fillProgressList(data.progressByCategory);
    fillResultList(data.recentResults);
    fillToolGrid(data.tools);

    // app.js의 data-progress는 로드 시 1회만 실행되므로 동적 요소에 재적용
    document.querySelectorAll('#job [data-progress]').forEach(el => {
      el.style.width = el.dataset.progress + '%';
    });

    // ui.js의 querySelectorAll이 동적 요소를 잡지 못하므로
    // job 섹션 내 토스트·사이드바 클릭을 이벤트 위임으로 처리
    document.getElementById('job').addEventListener('click', function (e) {
      const toastBtn = e.target.closest('[data-action="toast"]');
      if (toastBtn && typeof toast === 'function') toast(toastBtn.dataset.message);

      const sidebarBtn = e.target.closest('#job-sidebar-menu .sidebar__item');
      if (sidebarBtn) {
        document.querySelectorAll('#job-sidebar-menu .sidebar__item')
          .forEach(x => x.classList.remove('sidebar__item--active'));
        sidebarBtn.classList.add('sidebar__item--active');
      }
    });

  } catch (e) {
    console.error(e);
    if (typeof toast === 'function') toast('데이터를 불러오지 못했어요. 다시 시도해주세요.');
  }
})();

function fillSidebarMenu(steps, activeId) {
  const el = document.getElementById('job-sidebar-menu');
  if (!el) return;
  el.innerHTML = steps.map(step => `
    <button type="button" class="sidebar__item${step.id === activeId ? ' sidebar__item--active' : ''}">
      <span class="sidebar__item-icon" aria-hidden="true">${step.icon}</span>${step.label}
    </button>`).join('');
}

function fillReadinessCard(readiness) {
  const val = document.getElementById('job-readiness-value');
  const delta = document.getElementById('job-readiness-delta');
  const bar = document.getElementById('job-readiness-bar');
  const fill = document.getElementById('job-readiness-fill');
  if (val) val.textContent = readiness.percent + '%';
  if (delta) delta.textContent = `지난주 대비 +${readiness.deltaFromLastWeek}% ↑`;
  if (bar) bar.setAttribute('aria-valuenow', readiness.percent);
  if (fill) fill.dataset.progress = readiness.percent;
}

function fillStepper(steps) {
  const el = document.getElementById('job-stepper');
  if (!el) return;
  el.innerHTML = steps.map((step, i) => {
    const circleMod = step.status === 'done' ? ' job-stepper__circle--done'
      : step.status === 'active' ? ' job-stepper__circle--active' : '';
    const labelMod = step.status === 'active' ? ' job-stepper__label--active' : '';
    const connector = i < steps.length - 1
      ? `<span class="job-stepper__connector${step.status === 'done' ? ' job-stepper__connector--done' : ''}" aria-hidden="true"></span>`
      : '';
    return `
      <div class="job-stepper__step">
        <div class="job-stepper__node">
          <span class="job-stepper__circle${circleMod}" aria-hidden="true">${step.status === 'done' ? '✓' : step.id}</span>
          <span class="job-stepper__label${labelMod}">${step.label}</span>
        </div>
        ${connector}
      </div>`;
  }).join('');
}

function fillJobCard(activeStep) {
  const icon = document.getElementById('job-card-icon');
  const title = document.getElementById('job-card-title');
  const desc = document.getElementById('job-card-desc');
  const bar = document.getElementById('job-card-bar');
  const fill = document.getElementById('job-card-fill');
  const percent = document.getElementById('job-card-percent');
  const tip = document.getElementById('job-tip-text');

  if (icon) icon.textContent = activeStep.icon || '✏️';
  if (title) title.textContent = activeStep.title;
  if (desc) desc.textContent = activeStep.description;
  if (bar) bar.setAttribute('aria-valuenow', activeStep.percent);
  if (fill) fill.dataset.progress = activeStep.percent;
  if (percent) percent.textContent = `진행률 ${activeStep.percent}%`;
  if (tip) tip.innerHTML = `<strong>오늘의 취업 팁</strong><br>${activeStep.tip}`;

  const taskList = document.getElementById('job-task-list');
  if (taskList) {
    taskList.innerHTML = activeStep.tasks.map(task => {
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
            <button type="button" class="${btnClass}" data-action="toast" data-message="${task.toastMessage}">
              ${task.actionLabel}
            </button>
          </div>
        </li>`;
    }).join('');
  }
}

function fillProgressList(progressByCategory) {
  const el = document.getElementById('job-progress-list');
  if (!el) return;
  el.innerHTML = progressByCategory.map(item => `
    <li class="job-progress-row">
      <span class="job-progress-row__label">${item.label}</span>
      <div class="progress-bar job-progress-row__bar" role="progressbar"
           aria-valuenow="${item.percent}" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar__fill progress-bar__fill--${item.color}" data-progress="${item.percent}"></div>
      </div>
      <span class="job-progress-row__value job-progress-row__value--${item.color}">${item.percent}%</span>
    </li>`).join('');
}

function fillResultList(recentResults) {
  const el = document.getElementById('job-result-list');
  if (!el) return;
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
    `<button type="button" class="job-tool-btn">${tool}</button>`).join('');
}
