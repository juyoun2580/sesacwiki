// ═══════════════════════════════════════════════════════════════════════════
// assets/js/pages/job-features.js
// 취업핸드북 기능 패널 렌더러 및 데이터 관리
// 데이터: localStorage (FEATURES_KEY)
// 전역 JOB_FEATURES 객체를 job.js가 참조한다
// ═══════════════════════════════════════════════════════════════════════════

const FEATURES_KEY = 'job_features';

const DEFAULT_FEATURES = {
  interests:       [],
  aptitude:        { answers: [] },
  industryNotes:   { it: '', finance: '', manufacture: '', service: '', other: '' },
  postings:        [],
  resume:          { template: '', education: [], experience: [], skills: [] },
  coverLetter:     { growth: '', motivation: '', personality: '', vision: '' },
  projects:        [],
  interviewAnswers:{},
  customIQs:       [],
  researchNotes:   {},
  companies:       [],
  interviews:      [],
  feedbackNotes:   {}
};

const DEFAULT_IQS = [
  { id: 'q1', q: '1분 자기소개를 해주세요.', category: '기본' },
  { id: 'q2', q: '지원 동기가 무엇인가요?', category: '기본' },
  { id: 'q3', q: '본인의 장점과 단점을 말씀해주세요.', category: '기본' },
  { id: 'q4', q: '가장 도전적이었던 경험과 극복 방법을 말씀해주세요.', category: '경험' },
  { id: 'q5', q: '팀 프로젝트에서 갈등 상황을 어떻게 해결했나요?', category: '경험' },
  { id: 'q6', q: '5년 후 어떤 모습이 되고 싶나요?', category: '비전' },
  { id: 'q7', q: '왜 다른 지원자가 아닌 본인을 선택해야 하나요?', category: '직무' },
  { id: 'q8', q: '마지막으로 하고 싶은 말이 있나요?', category: '기본' },
];

const APTITUDE_QS = [
  '문제를 분석하고 해결책을 찾는 것이 즐겁다',
  '새로운 기술이나 도구를 배우는 것이 재미있다',
  '세부적인 작업에 오래 집중할 수 있다',
  '팀원과 협업하며 의견을 조율하는 것이 편하다',
  '변화하는 상황에서도 유연하게 대응할 수 있다',
  '사용자 입장에서 생각하고 배려하는 것이 자연스럽다',
  '완성도를 위해 마감 직전에도 수정할 수 있다',
  '데이터나 코드를 보면 흥미가 생긴다',
];

const COMPANY_STATUSES = ['지원예정', '서류전형', '면접', '최종합격', '불합격'];
const STATUS_COLORS    = { '지원예정': 'gray', '서류전형': 'blue', '면접': 'orange', '최종합격': 'green', '불합격': 'coral' };
const SKILL_LEVELS     = ['', '입문', '초급', '중급', '고급', '전문가'];
const INTERVIEW_TYPES  = ['1차 면접', '2차 면접', '임원 면접', '최종 면접', '인성 면접', '기술 면접'];

// ── 스토리지 ───────────────────────────────────────────────────────────────
function loadFeatures() {
  try {
    const raw = localStorage.getItem(FEATURES_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return {
        ...DEFAULT_FEATURES, ...p,
        resume:        { ...DEFAULT_FEATURES.resume,        ...(p.resume        || {}) },
        coverLetter:   { ...DEFAULT_FEATURES.coverLetter,   ...(p.coverLetter   || {}) },
        industryNotes: { ...DEFAULT_FEATURES.industryNotes, ...(p.industryNotes || {}) },
        aptitude:      { ...DEFAULT_FEATURES.aptitude,      ...(p.aptitude      || {}) },
      };
    }
  } catch {}
  return JSON.parse(JSON.stringify(DEFAULT_FEATURES));
}

function saveFeatures(f) {
  try { localStorage.setItem(FEATURES_KEY, JSON.stringify(f)); } catch {}
}

// ── 유틸 ───────────────────────────────────────────────────────────────────
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function esc(s)  { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function today() { return new Date().toISOString().slice(0, 10); }
function T(msg)  { if (typeof toast === 'function') toast(msg); }
function fmtDate(d) { return d ? d.replace(/-/g, '.') : ''; }

function resizeImage(file, maxW, cb) {
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      cb(canvas.toDataURL('image/jpeg', 0.75));
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function projectCardHTML(x) {
  const imgs = (x.images || []).map(img =>
    `<img src="${img.dataUrl}" alt="${esc(img.name)}" class="ff-project-thumb">`
  ).join('');
  return `
    <div class="ff-project-card${x.isFeatured ? ' ff-project-card--featured' : ''}">
      ${x.isFeatured ? '<span class="tag tag--green">⭐ 대표</span>' : ''}
      ${imgs ? `<div class="ff-project-card__images">${imgs}</div>` : ''}
      <p class="ff-project-card__title">${esc(x.title)}</p>
      ${x.period ? `<p class="ff-project-card__meta">${esc(x.period)} · ${esc(x.role)}</p>` : ''}
      ${x.tech.length ? `<p class="ff-project-card__tech">${x.tech.map(t => `<span class="tag tag--blue">${esc(t)}</span>`).join('')}</p>` : ''}
      ${x.desc ? `<p class="ff-project-card__desc">${esc(x.desc)}</p>` : ''}
      ${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener" class="ff-link">링크 →</a>` : ''}
      <div class="ff-project-card__actions">
        <button type="button" class="btn btn--outline btn--sm ff-pj-edit" data-id="${x.id}">✏️ 편집</button>
        <button type="button" class="btn btn--outline btn--sm ff-pj-feature" data-id="${x.id}">${x.isFeatured ? '대표 해제' : '대표로 설정'}</button>
        <button type="button" class="btn btn--ghost btn--sm ff-pj-del" data-id="${x.id}">삭제</button>
      </div>
    </div>`;
}

// ── 1. 관심 직무 조사 ─────────────────────────────────────────────────────
function renderInterests(c) {
  const f = loadFeatures();
  c.innerHTML = `
    <div class="ff-form">
      <input id="fi-title" class="ff-input" placeholder="직무명 (예: 백엔드 개발자)">
      <input id="fi-type"  class="ff-input ff-input--sm" placeholder="업종 (예: IT, 금융)">
      <input id="fi-memo"  class="ff-input ff-input--sm" placeholder="메모 (필요 역량 등)">
      <button type="button" class="btn btn--primary btn--sm" id="fi-add">+ 추가</button>
    </div>
    <ul class="ff-list">
      ${f.interests.length ? f.interests.map(x => `
        <li class="ff-item">
          <div class="ff-item__body">
            <p class="ff-item__title">${esc(x.title)}</p>
            ${x.type ? `<span class="tag tag--blue">${esc(x.type)}</span>` : ''}
            ${x.memo ? `<p class="ff-item__desc">${esc(x.memo)}</p>` : ''}
          </div>
          <button type="button" class="btn btn--ghost btn--sm ff-del" data-id="${x.id}">삭제</button>
        </li>`).join('') : '<li class="ff-empty">관심 직무를 추가해보세요!</li>'}
    </ul>`;
  c.querySelector('#fi-add').onclick = () => {
    const title = c.querySelector('#fi-title').value.trim();
    if (!title) return T('직무명을 입력하세요.');
    f.interests.push({ id: genId(), title, type: c.querySelector('#fi-type').value.trim(), memo: c.querySelector('#fi-memo').value.trim() });
    saveFeatures(f); renderInterests(c);
  };
  c.querySelectorAll('.ff-del').forEach(b => b.onclick = () => {
    f.interests = f.interests.filter(x => x.id !== b.dataset.id);
    saveFeatures(f); renderInterests(c);
  });
}

// ── 2. 직무 적성 체크 ─────────────────────────────────────────────────────
function renderAptitude(c) {
  const f = loadFeatures();
  const done = f.aptitude.answers.length === APTITUDE_QS.length;

  if (done) {
    const score = f.aptitude.answers.filter(Boolean).length;
    const grade = score >= 7 ? '이 직무에 매우 잘 맞아요! 🎯' : score >= 5 ? '충분한 잠재력이 있어요! 🌱' : '더 다양한 직무를 탐색해봐도 좋아요 🔍';
    c.innerHTML = `
      <div class="ff-result-card">
        <p class="ff-result-card__score">${score} / 8</p>
        <p class="ff-result-card__grade">${grade}</p>
        <div class="progress-bar" role="progressbar" aria-valuenow="${score * 12.5}" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-bar__fill progress-bar__fill--green" style="width:${score * 12.5}%"></div>
        </div>
        <ul class="ff-apt-result">
          ${APTITUDE_QS.map((q, i) => `
            <li class="ff-apt-result__item">
              <span class="ff-apt-result__icon">${f.aptitude.answers[i] ? '✅' : '☐'}</span>
              <span class="ff-apt-result__text">${esc(q)}</span>
            </li>`).join('')}
        </ul>
        <button type="button" class="btn btn--outline btn--sm" id="apt-reset">다시 하기</button>
      </div>`;
    c.querySelector('#apt-reset').onclick = () => {
      f.aptitude.answers = [];
      saveFeatures(f); renderAptitude(c);
    };
    return;
  }

  const idx = f.aptitude.answers.length;
  c.innerHTML = `
    <div class="ff-aptitude">
      <p class="ff-aptitude__progress">Q ${idx + 1} / ${APTITUDE_QS.length}</p>
      <div class="progress-bar ff-aptitude__bar" role="progressbar" aria-valuenow="${idx}" aria-valuemin="0" aria-valuemax="${APTITUDE_QS.length}">
        <div class="progress-bar__fill progress-bar__fill--blue" style="width:${(idx / APTITUDE_QS.length) * 100}%"></div>
      </div>
      <p class="ff-aptitude__question">${esc(APTITUDE_QS[idx])}</p>
      <div class="ff-aptitude__btns">
        <button type="button" class="btn btn--primary" id="apt-yes">그렇다 👍</button>
        <button type="button" class="btn btn--outline" id="apt-no">아니다 🤔</button>
      </div>
    </div>`;
  c.querySelector('#apt-yes').onclick = () => {
    f.aptitude.answers.push(true);  saveFeatures(f); renderAptitude(c);
  };
  c.querySelector('#apt-no').onclick = () => {
    f.aptitude.answers.push(false); saveFeatures(f); renderAptitude(c);
  };
}

// ── 3. 업계 분석 ──────────────────────────────────────────────────────────
const INDUSTRIES = [
  { key: 'it',           label: 'IT/SW' },
  { key: 'finance',      label: '금융' },
  { key: 'manufacture',  label: '제조업' },
  { key: 'service',      label: '서비스업' },
  { key: 'other',        label: '기타' },
];

function renderIndustry(c, activeKey) {
  const f   = loadFeatures();
  const key = (typeof activeKey === 'string' && activeKey) ? activeKey : 'it';
  c.innerHTML = `
    <div class="ff-tabs">
      ${INDUSTRIES.map(ind => `
        <button type="button" class="ff-tab${ind.key === key ? ' ff-tab--active' : ''}" data-ind="${ind.key}">${ind.label}</button>
      `).join('')}
    </div>
    <div class="ff-section">
      <label class="sr-only" for="ind-note">${INDUSTRIES.find(x => x.key === key).label} 분석 노트</label>
      <textarea id="ind-note" class="ff-textarea" rows="10" placeholder="${INDUSTRIES.find(x => x.key === key).label} 업계 트렌드, 주요 기업, 필요 역량 등을 자유롭게 기록해보세요.">${esc(f.industryNotes[key])}</textarea>
      <p class="ff-char-count">${(f.industryNotes[key] || '').length}자</p>
    </div>`;
  c.querySelectorAll('.ff-tab').forEach(btn => btn.onclick = () => {
    const cur = c.querySelector('#ind-note');
    f.industryNotes[key] = cur.value;
    saveFeatures(f);
    renderIndustry(c, btn.dataset.ind);
  });
  const ta = c.querySelector('#ind-note');
  ta.oninput = () => {
    f.industryNotes[key] = ta.value;
    saveFeatures(f);
    c.querySelector('.ff-char-count').textContent = ta.value.length + '자';
  };
}

// ── 4. 채용 공고 목록 ─────────────────────────────────────────────────────
function renderPostings(c) {
  const f = loadFeatures();
  c.innerHTML = `
    <div class="ff-form">
      <input id="fp-company"  class="ff-input" placeholder="기업명">
      <input id="fp-position" class="ff-input ff-input--sm" placeholder="직무">
      <input id="fp-deadline" class="ff-input ff-input--sm" type="date" aria-label="마감일">
      <input id="fp-url"      class="ff-input" placeholder="공고 URL">
      <button type="button" class="btn btn--primary btn--sm" id="fp-add">+ 추가</button>
    </div>
    <ul class="ff-list">
      ${f.postings.length ? f.postings.map(x => `
        <li class="ff-item">
          <div class="ff-item__body">
            <p class="ff-item__title">${esc(x.company)} — ${esc(x.position)}</p>
            ${x.deadline ? `<span class="tag tag--gray">마감 ${fmtDate(x.deadline)}</span>` : ''}
            ${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener" class="ff-link">공고 보기 →</a>` : ''}
          </div>
          <button type="button" class="btn btn--ghost btn--sm ff-del" data-id="${x.id}">삭제</button>
        </li>`).join('') : '<li class="ff-empty">채용 공고를 추가해보세요!</li>'}
    </ul>`;
  c.querySelector('#fp-add').onclick = () => {
    const company = c.querySelector('#fp-company').value.trim();
    if (!company) return T('기업명을 입력하세요.');
    f.postings.push({ id: genId(), company, position: c.querySelector('#fp-position').value.trim(), deadline: c.querySelector('#fp-deadline').value, url: c.querySelector('#fp-url').value.trim() });
    saveFeatures(f); renderPostings(c);
  };
  c.querySelectorAll('.ff-del').forEach(b => b.onclick = () => {
    f.postings = f.postings.filter(x => x.id !== b.dataset.id);
    saveFeatures(f); renderPostings(c);
  });
}

// ── 5. 이력서 양식 선택 ───────────────────────────────────────────────────
const RESUME_TEMPLATES = [
  { key: 'A', label: '깔끔형',    desc: '심플하고 가독성 좋은 레이아웃. 공공기관·대기업 추천.' },
  { key: 'B', label: '역량중심형', desc: '기술 스택과 핵심 역량을 상단에 강조. IT 직군 추천.' },
  { key: 'C', label: '창의형',    desc: '포인트 컬러와 세련된 레이아웃. 스타트업·디자인 직군 추천.' },
];

function renderResumeTemplate(c) {
  const f = loadFeatures();
  c.innerHTML = `
    <div class="ff-template-grid">
      ${RESUME_TEMPLATES.map(t => `
        <button type="button" class="ff-template-card${f.resume.template === t.key ? ' ff-template-card--selected' : ''}" data-tpl="${t.key}">
          <span class="ff-template-card__label">${t.key}</span>
          <p class="ff-template-card__name">${t.label}</p>
          <p class="ff-template-card__desc">${t.desc}</p>
          ${f.resume.template === t.key ? '<p class="ff-template-card__badge">✓ 선택됨</p>' : ''}
        </button>`).join('')}
    </div>`;
  c.querySelectorAll('.ff-template-card').forEach(btn => btn.onclick = () => {
    f.resume.template = btn.dataset.tpl;
    saveFeatures(f);
    T(`${RESUME_TEMPLATES.find(t => t.key === btn.dataset.tpl)?.label} 양식을 선택했어요!`);
    renderResumeTemplate(c);
  });
}

// ── 6. 학력 / 경력 입력 ───────────────────────────────────────────────────
function renderResumeHistory(c) {
  const f = loadFeatures();
  c.innerHTML = `
    <div class="ff-section">
      <p class="ff-section__title">🎓 학력</p>
      <div class="ff-form">
        <input id="rh-school" class="ff-input" placeholder="학교명">
        <input id="rh-major"  class="ff-input ff-input--sm" placeholder="전공">
        <input id="rh-degree" class="ff-input ff-input--sm" placeholder="학위 (예: 학사)">
        <input id="rh-period" class="ff-input ff-input--sm" placeholder="재학 기간 (예: 2020.03 ~ 2024.02)">
        <button type="button" class="btn btn--primary btn--sm" id="rh-edu-add">+ 추가</button>
      </div>
      <ul class="ff-list">
        ${f.resume.education.length ? f.resume.education.map(x => `
          <li class="ff-item">
            <div class="ff-item__body">
              <p class="ff-item__title">${esc(x.school)} ${x.major ? `— ${esc(x.major)}` : ''}</p>
              ${x.degree ? `<span class="tag tag--blue">${esc(x.degree)}</span>` : ''}
              ${x.period ? `<span class="tag tag--gray">${esc(x.period)}</span>` : ''}
            </div>
            <button type="button" class="btn btn--ghost btn--sm ff-del-edu" data-id="${x.id}">삭제</button>
          </li>`).join('') : '<li class="ff-empty">학력 사항을 추가해보세요!</li>'}
      </ul>
    </div>
    <div class="ff-section">
      <p class="ff-section__title">💼 경력</p>
      <div class="ff-form">
        <input id="rh-co"     class="ff-input" placeholder="회사명">
        <input id="rh-role"   class="ff-input ff-input--sm" placeholder="직무/직책">
        <input id="rh-period2" class="ff-input ff-input--sm" placeholder="재직 기간 (예: 2024.03 ~ 현재)">
        <input id="rh-desc"   class="ff-input" placeholder="주요 업무 및 성과">
        <button type="button" class="btn btn--primary btn--sm" id="rh-exp-add">+ 추가</button>
      </div>
      <ul class="ff-list">
        ${f.resume.experience.length ? f.resume.experience.map(x => `
          <li class="ff-item">
            <div class="ff-item__body">
              <p class="ff-item__title">${esc(x.company)} — ${esc(x.role)}</p>
              ${x.period ? `<span class="tag tag--gray">${esc(x.period)}</span>` : ''}
              ${x.desc   ? `<p class="ff-item__desc">${esc(x.desc)}</p>` : ''}
            </div>
            <button type="button" class="btn btn--ghost btn--sm ff-del-exp" data-id="${x.id}">삭제</button>
          </li>`).join('') : '<li class="ff-empty">경력 사항을 추가해보세요!</li>'}
      </ul>
    </div>`;
  c.querySelector('#rh-edu-add').onclick = () => {
    const school = c.querySelector('#rh-school').value.trim();
    if (!school) return T('학교명을 입력하세요.');
    f.resume.education.push({ id: genId(), school, major: c.querySelector('#rh-major').value.trim(), degree: c.querySelector('#rh-degree').value.trim(), period: c.querySelector('#rh-period').value.trim() });
    saveFeatures(f); renderResumeHistory(c);
  };
  c.querySelector('#rh-exp-add').onclick = () => {
    const company = c.querySelector('#rh-co').value.trim();
    if (!company) return T('회사명을 입력하세요.');
    f.resume.experience.push({ id: genId(), company, role: c.querySelector('#rh-role').value.trim(), period: c.querySelector('#rh-period2').value.trim(), desc: c.querySelector('#rh-desc').value.trim() });
    saveFeatures(f); renderResumeHistory(c);
  };
  c.querySelectorAll('.ff-del-edu').forEach(b => b.onclick = () => {
    f.resume.education = f.resume.education.filter(x => x.id !== b.dataset.id);
    saveFeatures(f); renderResumeHistory(c);
  });
  c.querySelectorAll('.ff-del-exp').forEach(b => b.onclick = () => {
    f.resume.experience = f.resume.experience.filter(x => x.id !== b.dataset.id);
    saveFeatures(f); renderResumeHistory(c);
  });
}

// ── 7. 기술 스택 정리 ─────────────────────────────────────────────────────
function renderResumeSkills(c) {
  const f = loadFeatures();
  c.innerHTML = `
    <div class="ff-form">
      <input id="rs-name" class="ff-input" placeholder="기술명 (예: React, Python)">
      <select id="rs-level" class="ff-select">
        ${SKILL_LEVELS.slice(1).map((l, i) => `<option value="${i + 1}">${l}</option>`).join('')}
      </select>
      <input id="rs-cat" class="ff-input ff-input--sm" placeholder="분류 (예: 프론트엔드)">
      <button type="button" class="btn btn--primary btn--sm" id="rs-add">+ 추가</button>
    </div>
    <div class="ff-skills-wrap">
      ${f.resume.skills.length ? f.resume.skills.map(x => `
        <span class="ff-skill-tag">
          ${esc(x.name)}
          <span class="ff-skill-level">${SKILL_LEVELS[x.level] || ''}</span>
          <button type="button" class="ff-skill-del" data-id="${x.id}" aria-label="${esc(x.name)} 삭제">×</button>
        </span>`).join('') : '<p class="ff-empty">기술 스택을 추가해보세요!</p>'}
    </div>
    ${f.resume.skills.length ? `
    <div class="ff-skills-legend">
      ${[...new Set(f.resume.skills.map(x => x.category).filter(Boolean))].map(cat => `
        <p class="ff-skills-cat"><strong>${esc(cat)}</strong>: ${f.resume.skills.filter(x => x.category === cat).map(x => esc(x.name)).join(', ')}</p>`).join('')}
    </div>` : ''}`;
  c.querySelector('#rs-add').onclick = () => {
    const name = c.querySelector('#rs-name').value.trim();
    if (!name) return T('기술명을 입력하세요.');
    f.resume.skills.push({ id: genId(), name, level: parseInt(c.querySelector('#rs-level').value, 10), category: c.querySelector('#rs-cat').value.trim() });
    saveFeatures(f); renderResumeSkills(c);
  };
  c.querySelectorAll('.ff-skill-del').forEach(b => b.onclick = () => {
    f.resume.skills = f.resume.skills.filter(x => x.id !== b.dataset.id);
    saveFeatures(f); renderResumeSkills(c);
  });
}


// ── 9. 자기소개서 작성 (통합 에디터) ─────────────────────────────────────
const CL_SECTIONS = [
  { key: 'growth',      label: '성장 과정',    limit: 1500, placeholder: '어떤 경험이 지금의 나를 만들었나요? 가치관, 도전, 성과를 구체적으로 서술해보세요.' },
  { key: 'motivation',  label: '지원 동기',    limit: 1500, placeholder: '왜 이 기업인가요? 왜 이 직무인가요? 나만의 이유를 설득력 있게 담아보세요.' },
  { key: 'personality', label: '성격 / 장단점', limit: 1000, placeholder: '장점은 직무 연계성 있게, 단점은 개선 노력과 함께 서술해보세요.' },
  { key: 'vision',      label: '입사 후 포부',  limit: 1000, placeholder: '입사 후 어떤 기여를 하고 싶은지, 어떻게 성장하고 싶은지 구체적으로 써보세요.' },
];

function renderCoverEditor(c, opts) {
  const f = loadFeatures();
  const targetSection = opts && opts.section;
  c.innerHTML = `
    <div class="ff-coverletter">
      ${CL_SECTIONS.map(sec => `
        <div class="ff-cl-section" id="cl-sec-${sec.key}">
          <div class="ff-cl-section__header">
            <p class="ff-section__title">${sec.label}</p>
            <span class="ff-char-count" id="cl-count-${sec.key}">${(f.coverLetter[sec.key] || '').length} / ${sec.limit}자</span>
          </div>
          <textarea class="ff-textarea" id="cl-ta-${sec.key}" rows="7"
                    maxlength="${sec.limit}"
                    placeholder="${sec.placeholder}">${esc(f.coverLetter[sec.key])}</textarea>
        </div>`).join('')}
    </div>`;

  CL_SECTIONS.forEach(sec => {
    const ta = c.querySelector(`#cl-ta-${sec.key}`);
    const counter = c.querySelector(`#cl-count-${sec.key}`);
    ta.oninput = () => {
      f.coverLetter[sec.key] = ta.value;
      saveFeatures(f);
      counter.textContent = `${ta.value.length} / ${sec.limit}자`;
      counter.classList.toggle('ff-char-count--warn', ta.value.length > sec.limit * 0.9);
    };
  });

  if (targetSection) {
    const target = c.querySelector(`#cl-sec-${targetSection}`);
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target.querySelector('textarea')?.focus();
      }, 50);
    }
  }
}

// ── 10. 프로젝트 목록 ─────────────────────────────────────────────────────
function renderProjects(c, opts) {
  const editId  = opts && opts.editId ? opts.editId : null;
  const f       = loadFeatures();
  const editing = editId ? f.projects.find(x => x.id === editId) : null;

  let _pendingImgs = editing ? [...(editing.images || [])] : [];

  function thumbsHTML(imgs) {
    return imgs.map((img, i) => `
      <div class="ff-upload-thumb-wrap">
        <img src="${img.dataUrl}" alt="${esc(img.name)}" class="ff-upload-thumb">
        <button type="button" class="ff-upload-thumb-del" data-idx="${i}" aria-label="이미지 삭제">×</button>
      </div>`).join('');
  }

  c.innerHTML = `
    <div class="ff-form ff-form--col">
      ${editing ? `<p class="ff-section__title" style="color:var(--g700)">✏️ "${esc(editing.title)}" 수정 중</p>` : ''}
      <div class="ff-form ff-form--row">
        <input id="pj-title"  class="ff-input" placeholder="프로젝트명" value="${editing ? esc(editing.title) : ''}">
        <input id="pj-period" class="ff-input ff-input--sm" placeholder="기간 (예: 2024.03 ~ 2024.06)" value="${editing ? esc(editing.period || '') : ''}">
        <input id="pj-role"   class="ff-input ff-input--sm" placeholder="역할 (예: 프론트엔드 개발)" value="${editing ? esc(editing.role || '') : ''}">
      </div>
      <div class="ff-form ff-form--row">
        <input id="pj-tech" class="ff-input" placeholder="기술 스택 (쉼표로 구분: React, Node.js)" value="${editing ? esc((editing.tech || []).join(', ')) : ''}">
        <input id="pj-url"  class="ff-input ff-input--sm" placeholder="URL (GitHub 등)" value="${editing ? esc(editing.url || '') : ''}">
      </div>
      <textarea id="pj-desc" class="ff-textarea" rows="3" placeholder="프로젝트 설명 및 주요 성과">${editing ? esc(editing.desc || '') : ''}</textarea>
      <div class="ff-upload-zone" id="pj-upload-zone">
        <input type="file" id="pj-images" accept="image/*" multiple class="ff-upload-input" aria-label="이미지 첨부">
        <label for="pj-images" class="ff-upload-label">
          <span>🖼 이미지 첨부</span>
          <span class="ff-upload-label__hint">클릭하거나 드래그 · PNG, JPG 지원</span>
        </label>
        <div class="ff-upload-preview" id="pj-img-preview">${thumbsHTML(_pendingImgs)}</div>
      </div>
      <div class="ff-form ff-form--row" style="justify-content:flex-end;margin-bottom:0">
        ${editing ? `<button type="button" class="btn btn--ghost btn--sm" id="pj-cancel">취소</button>` : ''}
        <button type="button" class="btn btn--primary btn--sm" id="pj-submit">
          ${editing ? '✓ 수정 저장' : '+ 프로젝트 추가'}
        </button>
      </div>
    </div>
    <div class="ff-project-grid" id="pj-grid">
      ${f.projects.length ? f.projects.map(x => projectCardHTML(x)).join('') : '<p class="ff-empty">프로젝트를 추가해보세요!</p>'}
    </div>`;

  function refreshPreview() {
    const preview = c.querySelector('#pj-img-preview');
    preview.innerHTML = thumbsHTML(_pendingImgs);
    preview.querySelectorAll('.ff-upload-thumb-del').forEach(b => b.onclick = () => {
      _pendingImgs.splice(parseInt(b.dataset.idx, 10), 1);
      refreshPreview();
    });
  }
  refreshPreview();

  const fileInput = c.querySelector('#pj-images');
  fileInput.onchange = function () {
    Array.from(this.files).forEach(file => {
      resizeImage(file, 640, dataUrl => {
        _pendingImgs.push({ name: file.name, dataUrl });
        refreshPreview();
      });
    });
    this.value = '';
  };

  const zone = c.querySelector('#pj-upload-zone');
  zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('ff-upload-zone--drag'); });
  zone.addEventListener('dragleave', ()  => zone.classList.remove('ff-upload-zone--drag'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('ff-upload-zone--drag');
    Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')).forEach(file => {
      resizeImage(file, 640, dataUrl => {
        _pendingImgs.push({ name: file.name, dataUrl });
        refreshPreview();
      });
    });
  });

  c.querySelector('#pj-submit').onclick = () => {
    const title = c.querySelector('#pj-title').value.trim();
    if (!title) return T('프로젝트명을 입력하세요.');
    const tech = c.querySelector('#pj-tech').value.split(',').map(t => t.trim()).filter(Boolean);
    const patch = {
      title,
      period: c.querySelector('#pj-period').value.trim(),
      role:   c.querySelector('#pj-role').value.trim(),
      tech,
      desc:   c.querySelector('#pj-desc').value.trim(),
      url:    c.querySelector('#pj-url').value.trim(),
      images: _pendingImgs,
    };
    if (editing) {
      const idx = f.projects.findIndex(x => x.id === editId);
      if (idx !== -1) f.projects[idx] = { ...f.projects[idx], ...patch };
      T('프로젝트를 수정했어요!');
    } else {
      f.projects.push({ id: genId(), isFeatured: false, ...patch });
    }
    saveFeatures(f);
    renderProjects(c);
  };

  c.querySelector('#pj-cancel')?.addEventListener('click', () => renderProjects(c));

  c.querySelectorAll('.ff-pj-edit').forEach(b => b.onclick = () => renderProjects(c, { editId: b.dataset.id }));

  c.querySelectorAll('.ff-pj-feature').forEach(b => b.onclick = () => {
    f.projects.forEach(x => { x.isFeatured = (x.id === b.dataset.id) ? !x.isFeatured : false; });
    saveFeatures(f);
    renderProjects(c, editId ? { editId } : null);
  });

  c.querySelectorAll('.ff-pj-del').forEach(b => b.onclick = () => {
    if (!confirm(`"${f.projects.find(x => x.id === b.dataset.id)?.title}" 프로젝트를 삭제할까요?`)) return;
    f.projects = f.projects.filter(x => x.id !== b.dataset.id);
    saveFeatures(f);
    renderProjects(c, editId === b.dataset.id ? null : (editId ? { editId } : null));
  });
}

// ── 11. 포트폴리오 미리보기 ───────────────────────────────────────────────
function renderPortfolioView(c) {
  const f = loadFeatures();
  const featured = f.projects.find(x => x.isFeatured);
  if (!featured) {
    c.innerHTML = `<div class="ff-ai-stub"><p class="ff-ai-stub__icon">🖼</p><p class="ff-ai-stub__title">대표 프로젝트를 선택해주세요</p><p class="ff-ai-stub__desc">프로젝트 목록에서 대표 프로젝트를 선택하면 여기서 포트폴리오 구성을 미리볼 수 있어요.</p></div>`;
    return;
  }
  const imgs = featured.images || [];
  c.innerHTML = `
    <div class="ff-portfolio">
      <div class="ff-portfolio__hero">
        <span class="ff-portfolio__icon" aria-hidden="true">🖼</span>
        <div>
          <p class="ff-portfolio__title">${esc(featured.title)}</p>
          ${featured.period ? `<p class="ff-portfolio__meta">${esc(featured.period)} · ${esc(featured.role)}</p>` : ''}
        </div>
      </div>
      ${imgs.length ? `
        <div class="ff-portfolio__gallery" role="list" aria-label="프로젝트 이미지">
          ${imgs.map(img => `
            <div class="ff-portfolio__gallery-item" role="listitem">
              <img src="${img.dataUrl}" alt="${esc(img.name)}" class="ff-portfolio__gallery-img">
            </div>`).join('')}
        </div>` : ''}
      ${featured.tech.length ? `<div class="ff-portfolio__tech">${featured.tech.map(t => `<span class="tag tag--blue">${esc(t)}</span>`).join('')}</div>` : ''}
      ${featured.desc ? `<p class="ff-portfolio__desc">${esc(featured.desc)}</p>` : ''}
      ${featured.url ? `<a href="${esc(featured.url)}" target="_blank" rel="noopener" class="btn btn--outline btn--sm">🔗 프로젝트 링크 열기</a>` : ''}
      <hr class="ff-divider">
      <p class="ff-section__title">기술 스택 역량</p>
      <div class="ff-portfolio__skills">
        ${f.resume.skills.filter(s => featured.tech.some(t => t.toLowerCase().includes(s.name.toLowerCase()))).map(s => `
          <div class="ff-portfolio__skill-row">
            <span class="ff-portfolio__skill-name">${esc(s.name)}</span>
            <div class="progress-bar ff-portfolio__skill-bar" role="progressbar" aria-valuenow="${s.level * 20}" aria-valuemin="0" aria-valuemax="100">
              <div class="progress-bar__fill progress-bar__fill--green" style="width:${s.level * 20}%"></div>
            </div>
            <span class="ff-portfolio__skill-level">${SKILL_LEVELS[s.level] || ''}</span>
          </div>`).join('')}
      </div>
    </div>`;

  // 이미지 클릭 시 확대 (lightbox)
  c.querySelectorAll('.ff-portfolio__gallery-img').forEach(img => {
    img.addEventListener('click', () => {
      const overlay = document.createElement('div');
      overlay.className = 'ff-lightbox';
      overlay.innerHTML = `<img src="${img.src}" alt="${img.alt}" class="ff-lightbox__img"><button class="ff-lightbox__close" aria-label="닫기">×</button>`;
      document.body.appendChild(overlay);
      overlay.addEventListener('click', () => overlay.remove());
    });
  });
}

// ── 12. PDF 내보내기 ───────────────────────────────────────────────────────
function renderPdfExport(c) {
  const f = loadFeatures();
  c.innerHTML = `
    <div class="ff-print-preview" id="print-area">
      <div class="ff-print-section">
        <p class="ff-print-section__title">📄 이력서 요약</p>
        <p class="ff-print-section__meta">양식: ${f.resume.template ? RESUME_TEMPLATES.find(t => t.key === f.resume.template)?.label : '미선택'}</p>
        ${f.resume.education.map(e => `<p>🎓 ${esc(e.school)} ${esc(e.major)} (${esc(e.period)})</p>`).join('')}
        ${f.resume.experience.map(e => `<p>💼 ${esc(e.company)} — ${esc(e.role)} (${esc(e.period)})</p>`).join('')}
        ${f.resume.skills.length ? `<p>💻 ${f.resume.skills.map(s => esc(s.name)).join(' · ')}</p>` : ''}
      </div>
      ${CL_SECTIONS.filter(sec => f.coverLetter[sec.key]).map(sec => `
        <div class="ff-print-section">
          <p class="ff-print-section__title">✏️ ${sec.label}</p>
          <p class="ff-print-section__body">${esc(f.coverLetter[sec.key])}</p>
        </div>`).join('')}
      ${f.projects.length ? `
        <div class="ff-print-section">
          <p class="ff-print-section__title">🖼 포트폴리오</p>
          ${f.projects.map(p => `<p>${p.isFeatured ? '⭐ ' : ''}${esc(p.title)} — ${p.tech.map(t => esc(t)).join(', ')}</p>`).join('')}
        </div>` : ''}
    </div>
    <div class="ff-print-actions">
      <p class="ff-print-hint">인쇄하면 헤더·네비게이션이 자동으로 숨겨지고 이 내용만 출력돼요.</p>
      <button type="button" class="btn btn--primary" id="pdf-print">🖨️ 인쇄 / PDF 저장</button>
    </div>`;
  c.querySelector('#pdf-print').onclick = () => window.print();
}

// ── 13. 예상 면접 질문 ────────────────────────────────────────────────────
function renderInterviewQuestions(c) {
  const f    = loadFeatures();
  const allQ = [...DEFAULT_IQS, ...f.customIQs];
  const catColors = { '기본': 'gray', '경험': 'blue', '비전': 'green', '직무': 'orange' };
  c.innerHTML = `
    <div class="ff-form">
      <input id="iq-q"   class="ff-input" placeholder="커스텀 질문 추가 (예: OO 기술을 활용한 경험이 있나요?)">
      <input id="iq-cat" class="ff-input ff-input--sm" placeholder="카테고리 (예: 직무)">
      <button type="button" class="btn btn--primary btn--sm" id="iq-add">+ 추가</button>
    </div>
    <ul class="ff-list ff-iq-list">
      ${allQ.map((q, i) => `
        <li class="ff-iq-item">
          <div class="ff-iq-item__top">
            <span class="tag tag--${catColors[q.category] || 'gray'}">${esc(q.category)}</span>
            <p class="ff-iq-item__q">Q${i + 1}. ${esc(q.q)}</p>
            ${f.customIQs.some(x => x.id === q.id) ? `<button type="button" class="btn btn--ghost btn--sm ff-del-iq" data-id="${q.id}">삭제</button>` : ''}
          </div>
          <p class="ff-iq-item__ans">${esc(f.interviewAnswers[q.id] || '아직 답변이 없어요. 답변 스크립트 작성에서 준비해보세요!')}</p>
        </li>`).join('')}
    </ul>`;
  c.querySelector('#iq-add').onclick = () => {
    const q = c.querySelector('#iq-q').value.trim();
    if (!q) return T('질문 내용을 입력하세요.');
    f.customIQs.push({ id: genId(), q, category: c.querySelector('#iq-cat').value.trim() || '직무' });
    saveFeatures(f); renderInterviewQuestions(c);
  };
  c.querySelectorAll('.ff-del-iq').forEach(b => b.onclick = () => {
    f.customIQs = f.customIQs.filter(x => x.id !== b.dataset.id);
    saveFeatures(f); renderInterviewQuestions(c);
  });
}

// ── 14. 답변 스크립트 작성 ────────────────────────────────────────────────
function renderInterviewAnswers(c) {
  const f    = loadFeatures();
  const allQ = [...DEFAULT_IQS, ...f.customIQs];
  c.innerHTML = `
    <p class="ff-section__title">질문별 답변을 작성하고 저장하세요 (자동 저장)</p>
    <div class="ff-ia-list">
      ${allQ.map((q, i) => `
        <div class="ff-ia-item">
          <p class="ff-ia-item__q">Q${i + 1}. ${esc(q.q)}</p>
          <textarea class="ff-textarea" rows="4"
                    placeholder="답변을 자유롭게 작성해보세요..."
                    data-qid="${q.id}">${esc(f.interviewAnswers[q.id] || '')}</textarea>
          <p class="ff-char-count ff-ia-item__count">${(f.interviewAnswers[q.id] || '').length}자</p>
        </div>`).join('')}
    </div>`;
  c.querySelectorAll('textarea[data-qid]').forEach(ta => {
    ta.oninput = () => {
      f.interviewAnswers[ta.dataset.qid] = ta.value;
      saveFeatures(f);
      ta.nextElementSibling.textContent = ta.value.length + '자';
    };
  });
}

// ── 15. 기업 / 직무 리서치 ───────────────────────────────────────────────
function renderResearch(c, activeCompany) {
  if (typeof activeCompany !== 'string') activeCompany = '';
  const f        = loadFeatures();
  const companies = Object.keys(f.researchNotes);
  const current  = activeCompany || companies[0] || '';
  c.innerHTML = `
    <div class="ff-form">
      <input id="rn-company" class="ff-input" placeholder="기업명 (예: 삼성전자)">
      <button type="button" class="btn btn--primary btn--sm" id="rn-add">리서치 시작</button>
    </div>
    ${companies.length ? `
      <div class="ff-tabs ff-tabs--sm">
        ${companies.map(co => `
          <button type="button" class="ff-tab${co === current ? ' ff-tab--active' : ''}" data-co="${esc(co)}">${esc(co)}</button>`).join('')}
      </div>` : ''}
    ${current ? `
      <div class="ff-section">
        <label class="sr-only" for="rn-note">${esc(current)} 리서치 노트</label>
        <textarea id="rn-note" class="ff-textarea" rows="10"
                  placeholder="${esc(current)}의 사업 분야, 최근 뉴스, 기업 문화, 채용 공고 키워드 등을 정리해보세요.">${esc(f.researchNotes[current] || '')}</textarea>
        <p class="ff-char-count">${(f.researchNotes[current] || '').length}자</p>
        <button type="button" class="btn btn--ghost btn--sm" id="rn-del">이 기업 삭제</button>
      </div>` : '<p class="ff-empty">위에서 기업명을 입력하고 리서치를 시작해보세요!</p>'}`;
  c.querySelector('#rn-add').onclick = () => {
    const co = c.querySelector('#rn-company').value.trim();
    if (!co) return T('기업명을 입력하세요.');
    if (!f.researchNotes[co]) f.researchNotes[co] = '';
    saveFeatures(f); renderResearch(c, co);
  };
  c.querySelectorAll('.ff-tab').forEach(btn => btn.onclick = () => {
    if (current) f.researchNotes[current] = (c.querySelector('#rn-note') || {}).value || f.researchNotes[current];
    saveFeatures(f); renderResearch(c, btn.dataset.co);
  });
  const noteEl = c.querySelector('#rn-note');
  if (noteEl) {
    noteEl.oninput = () => {
      f.researchNotes[current] = noteEl.value;
      saveFeatures(f);
      noteEl.nextElementSibling.textContent = noteEl.value.length + '자';
    };
  }
  const delBtn = c.querySelector('#rn-del');
  if (delBtn) delBtn.onclick = () => {
    delete f.researchNotes[current];
    saveFeatures(f); renderResearch(c, '');
  };
}

// ── 16. 모의 면접 ─────────────────────────────────────────────────────────
let _mockIdx = 0;
let _mockRecognition = null;

function renderMockInterview(c) {
  if (_mockRecognition) { try { _mockRecognition.abort(); } catch {} _mockRecognition = null; }

  const f    = loadFeatures();
  const allQ = [...DEFAULT_IQS, ...f.customIQs];
  if (!allQ.length) {
    c.innerHTML = '<div class="ff-ai-stub"><p class="ff-ai-stub__icon">🎤</p><p class="ff-ai-stub__title">질문이 없어요</p><p class="ff-ai-stub__desc">예상 질문 목록에서 질문을 추가해보세요!</p></div>';
    return;
  }
  if (_mockIdx >= allQ.length) _mockIdx = 0;
  const q         = allQ[_mockIdx];
  const answer    = f.interviewAnswers[q.id] || '';
  const catColors = { '기본': 'gray', '경험': 'blue', '비전': 'green', '직무': 'orange' };
  const SR        = window.SpeechRecognition || window.webkitSpeechRecognition;

  c.innerHTML = `
    <div class="ff-mock">
      <div class="ff-mock__progress">
        <div class="progress-bar" role="progressbar" aria-valuenow="${_mockIdx + 1}" aria-valuemin="0" aria-valuemax="${allQ.length}">
          <div class="progress-bar__fill progress-bar__fill--green" style="width:${((_mockIdx + 1) / allQ.length) * 100}%"></div>
        </div>
        <span>Q ${_mockIdx + 1} / ${allQ.length}</span>
      </div>
      <div class="ff-mock__card">
        <span class="tag tag--${catColors[q.category] || 'gray'}">${esc(q.category)}</span>
        <p class="ff-mock__question">${esc(q.q)}</p>

        ${SR ? `
        <div class="ff-mock__rec-zone">
          <button type="button" class="btn btn--primary btn--sm ff-mock__rec-btn" id="mock-rec-btn">
            <span class="ff-mock__rec-dot" aria-hidden="true"></span>🎤 녹음 시작
          </button>
          <div class="ff-mock__transcript" id="mock-transcript" hidden aria-live="polite" aria-label="음성 인식 결과">
            <p class="ff-mock__transcript-label">실시간 텍스트</p>
            <p class="ff-mock__transcript-text" id="mock-transcript-text"></p>
          </div>
          <button type="button" class="btn btn--outline btn--sm" id="mock-save-btn" hidden>💾 답변으로 저장</button>
        </div>` : `
        <p class="ff-mock__rec-unsupported">⚠️ 이 브라우저는 음성 인식을 지원하지 않아요. Chrome 또는 Edge를 사용해주세요.</p>`}

        <button type="button" class="btn btn--ghost btn--sm" id="mock-toggle">내 준비 답변 보기</button>
        <div class="ff-mock__answer" id="mock-ans" hidden>
          ${answer
            ? `<p class="ff-mock__answer-text">${esc(answer)}</p>`
            : '<p class="ff-empty">아직 작성한 답변이 없어요.<br>답변 스크립트 작성에서 준비해보세요!</p>'}
        </div>
      </div>
      <div class="ff-mock__nav">
        <button type="button" class="btn btn--ghost btn--sm" id="mock-prev" ${_mockIdx === 0 ? 'disabled' : ''}>← 이전</button>
        <button type="button" class="btn btn--ghost btn--sm" id="mock-next" ${_mockIdx === allQ.length - 1 ? 'disabled' : ''}>다음 →</button>
      </div>
    </div>`;

  c.querySelector('#mock-toggle').onclick = () => {
    const ans = c.querySelector('#mock-ans');
    const btn = c.querySelector('#mock-toggle');
    ans.hidden = !ans.hidden;
    btn.textContent = ans.hidden ? '내 준비 답변 보기' : '답변 숨기기';
  };
  c.querySelector('#mock-prev').onclick = () => { _mockIdx--; renderMockInterview(c); };
  c.querySelector('#mock-next').onclick = () => { _mockIdx++; renderMockInterview(c); };

  if (!SR) return;

  let finalText   = '';
  let wantsRecord = false;
  let hasError    = false;

  const recBtn        = c.querySelector('#mock-rec-btn');
  const transcriptBox = c.querySelector('#mock-transcript');
  const transcriptTxt = c.querySelector('#mock-transcript-text');
  const saveBtn       = c.querySelector('#mock-save-btn');

  function updateTranscript(interim) {
    transcriptTxt.innerHTML =
      (finalText ? `<span class="ff-mock__transcript-final">${esc(finalText)}</span>` : '') +
      (interim   ? `<span class="ff-mock__transcript-interim">${esc(interim)}</span>` : '');
  }

  function startRec() {
    hasError = false;
    updateTranscript('');
    saveBtn.hidden = true;

    const rec = new SR();
    _mockRecognition = rec;
    rec.lang           = 'ko-KR';
    rec.continuous     = true;
    rec.interimResults = true;

    rec.onstart = () => {
      recBtn.innerHTML = '<span class="ff-mock__rec-dot ff-mock__rec-dot--active" aria-hidden="true"></span>⏹ 녹음 중지';
      recBtn.classList.add('ff-mock__rec-btn--active');
      transcriptBox.hidden = false;
      if (!finalText) transcriptTxt.textContent = '🎙 말씀해주세요...';
    };

    rec.onresult = e => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += (finalText ? ' ' : '') + text.trim();
        else interim += text;
      }
      updateTranscript(interim);
    };

    rec.onend = () => {
      _mockRecognition = null;
      if (wantsRecord && !hasError) {
        // Chrome이 세션을 자동 종료한 경우 → 자동 재시작
        startRec();
        return;
      }
      wantsRecord = false;
      recBtn.innerHTML = '<span class="ff-mock__rec-dot" aria-hidden="true"></span>🎤 다시 녹음';
      recBtn.classList.remove('ff-mock__rec-btn--active');
      if (!hasError) updateTranscript('');
      if (finalText.trim()) saveBtn.hidden = false;
    };

    rec.onerror = e => {
      _mockRecognition = null;
      transcriptBox.hidden = false;
      if (e.error === 'not-allowed') {
        hasError    = true;
        wantsRecord = false;
        recBtn.innerHTML = '<span class="ff-mock__rec-dot" aria-hidden="true"></span>🎤 녹음 시작';
        recBtn.classList.remove('ff-mock__rec-btn--active');
        T('마이크 권한을 허용해주세요.');
        transcriptTxt.textContent = '⚠️ 마이크 권한이 차단되어 있어요. 주소창 왼쪽 자물쇠 아이콘 → 마이크 → 허용으로 변경해주세요.';
      } else if (e.error === 'network') {
        hasError    = true;
        wantsRecord = false;
        recBtn.innerHTML = '<span class="ff-mock__rec-dot" aria-hidden="true"></span>🎤 녹음 시작';
        recBtn.classList.remove('ff-mock__rec-btn--active');
        T('네트워크 오류가 발생했어요.');
        transcriptTxt.textContent = '⚠️ 네트워크 오류가 발생했어요. 인터넷 연결을 확인해주세요.';
      } else if (e.error === 'no-speech' || e.error === 'aborted') {
        // 묵음·중단은 onend 자동 재시작에 맡김
      } else {
        hasError    = true;
        wantsRecord = false;
        recBtn.innerHTML = '<span class="ff-mock__rec-dot" aria-hidden="true"></span>🎤 녹음 시작';
        recBtn.classList.remove('ff-mock__rec-btn--active');
        T(`음성 인식 오류: ${e.error}`);
        transcriptTxt.textContent = `⚠️ 오류가 발생했어요: ${e.error}`;
      }
    };

    try {
      rec.start();
    } catch (err) {
      wantsRecord = false;
      _mockRecognition = null;
      recBtn.innerHTML = '<span class="ff-mock__rec-dot" aria-hidden="true"></span>🎤 녹음 시작';
      recBtn.classList.remove('ff-mock__rec-btn--active');
      T('녹음을 시작할 수 없어요.');
      console.error('[SpeechRecognition] start failed:', err);
    }
  }

  recBtn.onclick = () => {
    if (wantsRecord) {
      wantsRecord = false;
      if (_mockRecognition) { try { _mockRecognition.stop(); } catch {} }
      return;
    }
    wantsRecord = true;
    finalText   = '';
    startRec();
  };

  saveBtn.onclick = () => {
    const text = finalText.trim();
    if (!text) return;
    const f2 = loadFeatures();
    f2.interviewAnswers[q.id] = text;
    saveFeatures(f2);
    T('답변을 저장했어요! ✅');
    saveBtn.hidden = true;
    const ansEl = c.querySelector('#mock-ans');
    ansEl.innerHTML = `<p class="ff-mock__answer-text">${esc(text)}</p>`;
    c.querySelector('#mock-toggle').textContent = '내 준비 답변 보기';
    ansEl.hidden = true;
  };
}

// ── 17. 지원 기업 목록 ────────────────────────────────────────────────────
function renderCompanies(c) {
  const f = loadFeatures();
  c.innerHTML = `
    <div class="ff-form">
      <input id="co-name"     class="ff-input" placeholder="기업명">
      <input id="co-position" class="ff-input ff-input--sm" placeholder="지원 직무">
      <input id="co-date"     class="ff-input ff-input--sm" type="date" aria-label="지원일">
      <select id="co-status"  class="ff-select">
        ${COMPANY_STATUSES.map(s => `<option>${s}</option>`).join('')}
      </select>
      <button type="button" class="btn btn--primary btn--sm" id="co-add">+ 추가</button>
    </div>
    ${f.companies.length ? `
      <div class="ff-company-table-wrap">
        <table class="ff-company-table">
          <thead>
            <tr>
              <th>기업명</th><th>직무</th><th>지원일</th><th>상태</th><th>관리</th>
            </tr>
          </thead>
          <tbody>
            ${f.companies.map(x => `
              <tr class="ff-company-row">
                <td class="ff-company-row__name">${esc(x.company)}</td>
                <td>${esc(x.position)}</td>
                <td>${fmtDate(x.appliedDate)}</td>
                <td>
                  <select class="ff-select ff-status-sel" data-id="${x.id}">
                    ${COMPANY_STATUSES.map(s => `<option${s === x.status ? ' selected' : ''}>${s}</option>`).join('')}
                  </select>
                </td>
                <td><button type="button" class="btn btn--ghost btn--sm ff-del" data-id="${x.id}">삭제</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>` : '<p class="ff-empty">지원할 기업을 추가해보세요!</p>'}`;
  c.querySelector('#co-add').onclick = () => {
    const company = c.querySelector('#co-name').value.trim();
    if (!company) return T('기업명을 입력하세요.');
    f.companies.push({ id: genId(), company, position: c.querySelector('#co-position').value.trim(), appliedDate: c.querySelector('#co-date').value, status: c.querySelector('#co-status').value });
    saveFeatures(f); renderCompanies(c);
  };
  c.querySelectorAll('.ff-status-sel').forEach(sel => sel.onchange = () => {
    const co = f.companies.find(x => x.id === sel.dataset.id);
    if (co) { co.status = sel.value; saveFeatures(f); }
  });
  c.querySelectorAll('.ff-del').forEach(b => b.onclick = () => {
    f.companies = f.companies.filter(x => x.id !== b.dataset.id);
    saveFeatures(f); renderCompanies(c);
  });
}

// ── 18. 서류 전형 결과 확인 ───────────────────────────────────────────────
function renderCompanyStatus(c) {
  const f   = loadFeatures();
  const cos = f.companies.filter(x => x.status !== '지원예정');
  c.innerHTML = cos.length ? `
    <p class="ff-section__title">지원 상태를 업데이트하세요</p>
    <ul class="ff-list">
      ${f.companies.map(x => `
        <li class="ff-item ff-item--status">
          <div class="ff-item__body">
            <p class="ff-item__title">${esc(x.company)}</p>
            <span class="tag tag--${STATUS_COLORS[x.status] || 'gray'}">${esc(x.status)}</span>
            <span class="ff-item__meta">${esc(x.position)} ${x.appliedDate ? '· ' + fmtDate(x.appliedDate) : ''}</span>
          </div>
          <select class="ff-select ff-status-sel" data-id="${x.id}">
            ${COMPANY_STATUSES.map(s => `<option${s === x.status ? ' selected' : ''}>${s}</option>`).join('')}
          </select>
        </li>`).join('')}
    </ul>` : `<div class="ff-ai-stub"><p class="ff-ai-stub__icon">📬</p><p class="ff-ai-stub__title">지원 기업이 없어요</p><p class="ff-ai-stub__desc">지원 기업 목록에서 기업을 먼저 추가해보세요!</p></div>`;
  c.querySelectorAll('.ff-status-sel').forEach(sel => sel.onchange = () => {
    const co = f.companies.find(x => x.id === sel.dataset.id);
    if (co) { co.status = sel.value; saveFeatures(f); T(`${co.company} 상태를 "${sel.value}"(으)로 변경했어요!`); renderCompanyStatus(c); }
  });
}

// ── 19. 면접 일정 관리 ────────────────────────────────────────────────────
function renderInterviewSchedule(c) {
  const f      = loadFeatures();
  const sorted = [...f.interviews].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  c.innerHTML = `
    <div class="ff-form">
      <input id="is-company"  class="ff-input" placeholder="기업명">
      <select id="is-type"    class="ff-select">
        ${INTERVIEW_TYPES.map(t => `<option>${t}</option>`).join('')}
      </select>
      <input id="is-date"     class="ff-input ff-input--sm" type="date" aria-label="면접일">
      <input id="is-time"     class="ff-input ff-input--sm" type="time" aria-label="면접 시간">
      <input id="is-location" class="ff-input ff-input--sm" placeholder="장소 (예: 서울 강남구)">
      <button type="button" class="btn btn--primary btn--sm" id="is-add">+ 추가</button>
    </div>
    <ul class="ff-list">
      ${sorted.length ? sorted.map(x => {
        const isPast = x.date && x.date < today();
        return `
          <li class="ff-item${isPast ? ' ff-item--past' : ''}">
            <div class="ff-item__body">
              <p class="ff-item__title">${esc(x.company)} <span class="tag tag--orange">${esc(x.type)}</span></p>
              ${x.date ? `<p class="ff-item__meta">📅 ${fmtDate(x.date)} ${x.time ? x.time : ''} ${isPast ? '<span class="tag tag--gray">종료</span>' : ''}</p>` : ''}
              ${x.location ? `<p class="ff-item__meta">📍 ${esc(x.location)}</p>` : ''}
            </div>
            <button type="button" class="btn btn--ghost btn--sm ff-del" data-id="${x.id}">삭제</button>
          </li>`;}).join('') : '<li class="ff-empty">면접 일정을 추가해보세요!</li>'}
    </ul>`;
  c.querySelector('#is-add').onclick = () => {
    const company = c.querySelector('#is-company').value.trim();
    if (!company) return T('기업명을 입력하세요.');
    f.interviews.push({ id: genId(), company, type: c.querySelector('#is-type').value, date: c.querySelector('#is-date').value, time: c.querySelector('#is-time').value, location: c.querySelector('#is-location').value.trim() });
    saveFeatures(f); renderInterviewSchedule(c);
  };
  c.querySelectorAll('.ff-del').forEach(b => b.onclick = () => {
    f.interviews = f.interviews.filter(x => x.id !== b.dataset.id);
    saveFeatures(f); renderInterviewSchedule(c);
  });
}

// ── 20. 면접 피드백 정리 ──────────────────────────────────────────────────
function renderFeedback(c, activeId) {
  if (typeof activeId !== 'string') activeId = '';
  const f   = loadFeatures();
  const cos = f.companies;
  if (!cos.length) {
    c.innerHTML = `<div class="ff-ai-stub"><p class="ff-ai-stub__icon">💬</p><p class="ff-ai-stub__title">지원 기업이 없어요</p><p class="ff-ai-stub__desc">지원 기업 목록에서 기업을 먼저 추가해보세요!</p></div>`;
    return;
  }
  const current = activeId || cos[0].id;
  const co = cos.find(x => x.id === current);
  c.innerHTML = `
    <div class="ff-tabs ff-tabs--sm">
      ${cos.map(x => `<button type="button" class="ff-tab${x.id === current ? ' ff-tab--active' : ''}" data-coid="${x.id}">${esc(x.company)}</button>`).join('')}
    </div>
    ${co ? `
      <div class="ff-section">
        <p class="ff-section__title">${esc(co.company)} — ${esc(co.position)}</p>
        <label class="sr-only" for="fb-note">피드백 노트</label>
        <textarea id="fb-note" class="ff-textarea" rows="8"
                  placeholder="면접 분위기, 질문 내용, 잘했던 점, 개선할 점을 자유롭게 기록해보세요.">${esc(f.feedbackNotes[current] || '')}</textarea>
        <p class="ff-char-count">${(f.feedbackNotes[current] || '').length}자</p>
      </div>` : ''}`;
  c.querySelectorAll('.ff-tab').forEach(btn => btn.onclick = () => {
    f.feedbackNotes[current] = (c.querySelector('#fb-note') || {}).value || '';
    saveFeatures(f); renderFeedback(c, btn.dataset.coid);
  });
  const ta = c.querySelector('#fb-note');
  if (ta) ta.oninput = () => {
    f.feedbackNotes[current] = ta.value;
    saveFeatures(f);
    ta.nextElementSibling.textContent = ta.value.length + '자';
  };
}

// ── JOB_FEATURES 레지스트리 (job.js가 참조) ──────────────────────────────
const JOB_FEATURES = {
  'interests':           { title: '관심 직무 조사',    render: renderInterests },
  'aptitude':            { title: '직무 적성 체크',    render: renderAptitude },
  'industry':            { title: '업계 분석',         render: renderIndustry },
  'postings':            { title: '채용 공고 목록',    render: renderPostings },
  'resume-template':     { title: '이력서 양식 선택',  render: renderResumeTemplate },
  'resume-history':      { title: '학력 / 경력 입력',  render: renderResumeHistory },
  'resume-skills':       { title: '기술 스택 정리',    render: renderResumeSkills },
  'cover-editor':        { title: '자기소개서 작성',   render: (c, opts) => renderCoverEditor(c, opts) },
  'projects':            { title: '프로젝트 목록',     render: (c, opts) => renderProjects(c, opts) },
  'portfolio-view':      { title: '포트폴리오 구성',   render: renderPortfolioView },
  'pdf-export':          { title: 'PDF / 인쇄',        render: renderPdfExport },
  'interview-questions': { title: '예상 면접 질문',    render: renderInterviewQuestions },
  'interview-answers':   { title: '답변 스크립트 작성', render: renderInterviewAnswers },
  'research':            { title: '기업 / 직무 리서치', render: renderResearch },
  'mock-interview':      { title: '모의 면접 연습',    render: renderMockInterview },
  'companies':           { title: '지원 기업 목록',    render: renderCompanies },
  'company-status':      { title: '서류 전형 결과',    render: renderCompanyStatus },
  'interview-schedule':  { title: '면접 일정 관리',    render: renderInterviewSchedule },
  'feedback':            { title: '면접 피드백 정리',  render: renderFeedback },
};
