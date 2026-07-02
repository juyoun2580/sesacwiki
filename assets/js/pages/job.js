// ── 취업핸드북 페이지 ──────────────────────────────────────────────────────────
// 데이터 소스 : localStorage (키: JOB_KEY)
// 최초 접속 시 STEP_CATALOG로 초기화, 이후 localStorage 값 사용
// DATA_VERSION이 바뀌면 구형 데이터는 자동으로 초기화됨
// 기능 패널 렌더러는 job-features.js의 JOB_FEATURES 객체가 처리
// ──────────────────────────────────────────────────────────────────────────────

const JOB_KEY      = 'job_data';
const DATA_VERSION = 18;
let _showAllResults = false;

// ── 단계 / 태스크 카탈로그 ─────────────────────────────────────────────────────
const STEP_CATALOG = [
  {
    id: 1, label: '자격증', icon: '🏅',
    title: '1. 자격증',
    description: '보유한 자격증을 등록하고 나에게 맞는 직업을 추천받아보세요.',
    tip: '자격증 조합이 취업 방향을 결정해요! 보유한 자격증을 모두 입력하면 나에게 딱 맞는 직업을 추천해드려요.',
    tasks: [
      { icon: '🏅', title: '자격증 등록', description: '보유한 자격증을 등록하고 관심 직무를 설정하세요.', actionLabel: '등록하기 ›', variant: 'primary', feature: 'cert-select' },
      { icon: '🎯', title: '직무 추천 확인', description: '자격증 기반으로 추천받은 직무를 확인하세요.', actionLabel: '확인하기 ›', variant: 'outline', feature: 'cert-select' }
    ]
  },
  {
    id: 2, label: '이력서 작성', icon: '📄',
    title: '2. 이력서 작성',
    description: '나의 경험과 역량을 담은 이력서를 작성해보세요.',
    tip: '채용 담당자가 10초 안에 파악할 수 있도록 핵심 내용을 간결하게 정리하세요. 최신 경력부터 역순으로 작성하는 것이 기본이에요!',
    tasks: [
      { icon: '📄', title: '이력서 템플릿 선택', description: '지원 직무에 맞는 이력서 템플릿을 선택하세요.', actionLabel: '선택하기 ›', variant: 'primary', feature: 'resume-builder' },
      { icon: '🎓', title: '학력 / 경력 입력', description: '최신 순으로 학력과 경력 사항을 입력하세요.', actionLabel: '입력하기 ›', variant: 'outline', feature: 'resume-builder' },
      { icon: '💻', title: '기술 스택 정리', description: '보유한 기술 스택을 숙련도와 함께 정리하세요.', actionLabel: '정리하기 ›', variant: 'outline', feature: 'resume-builder' },
      { icon: '🤖', title: 'AI 첨삭 받기', description: 'AI가 이력서 내용과 문체를 점검해드려요.', actionLabel: '첨삭받기 ›', variant: 'outline', feature: 'resume-builder' }
    ]
  },
  {
    id: 3, label: '자기소개서', icon: '✏️',
    title: '3. 자기소개서',
    description: '나만의 스토리를 담은 자기소개서를 완성해보세요.',
    tip: '구체적인 숫자와 사례를 활용하면 설득력이 확 올라가요. "열심히 했다" 보다 "3개월 만에 30% 성과를 냈다"로 써보세요!',
    tasks: [
      { icon: '📋', title: '자기소개서 항목 확인', description: '기업이 원하는 자기소개서 항목을 확인하세요.', actionLabel: '확인하기 ›', variant: 'primary', feature: 'cover-editor' },
      { icon: '🌱', title: '성장 과정 작성', description: '나의 성장 스토리를 진솔하게 담아보세요.', actionLabel: '작성하기 ›', variant: 'outline', feature: 'cover-editor' },
      { icon: '🎯', title: '지원 동기 작성', description: '이 기업에 지원하고 싶은 이유를 구체적으로 써보세요.', actionLabel: '작성하기 ›', variant: 'outline', feature: 'cover-editor' },
      { icon: '🔎', title: 'AI 맞춤법 검사', description: 'AI가 오탈자와 문체를 꼼꼼히 점검해드려요.', actionLabel: '검사하기 ›', variant: 'outline', feature: 'cover-editor' }
    ]
  },
  {
    id: 4, label: '포트폴리오', icon: '🖼',
    title: '4. 포트폴리오',
    description: '나의 역량을 보여주는 포트폴리오를 제작해보세요.',
    tip: '포트폴리오는 "내가 무엇을 할 수 있는가"를 증명하는 가장 강력한 도구예요. 결과물과 기여도를 명확히 표현해보세요.',
    tasks: [
      { icon: '📦', title: '프로젝트 목록 정리', description: '참여한 모든 프로젝트를 날짜와 함께 나열하세요.', actionLabel: '정리하기 ›', variant: 'primary', feature: 'portfolio-builder' },
      { icon: '⭐', title: '대표 프로젝트 선택', description: '가장 임팩트 있는 대표 프로젝트를 골라보세요.', actionLabel: '선택하기 ›', variant: 'outline', feature: 'portfolio-builder' },
      { icon: '🖼', title: '포트폴리오 구성', description: '스크린샷, 설명, 기술 스택을 포함해 구성하세요.', actionLabel: '구성하기 ›', variant: 'outline', feature: 'portfolio-builder' },
      { icon: '📑', title: 'PDF 내보내기', description: '완성된 포트폴리오를 PDF 파일로 저장하세요.', actionLabel: '내보내기 ›', variant: 'outline', feature: 'portfolio-builder' }
    ]
  },
  {
    id: 5, label: '면접 준비', icon: '🎤',
    title: '5. 면접 준비',
    description: '완벽한 면접을 위해 철저하게 준비해보세요.',
    tip: '면접은 연습이 전부예요! 예상 질문을 소리 내서 답변해보는 것이 가장 효과적이에요. 거울 앞에서 연습하거나 영상으로 촬영해보세요.',
    tasks: [
      { icon: '❓', title: '예상 질문 확인', description: '직무별 자주 나오는 면접 질문을 확인하세요.', actionLabel: '확인하기 ›', variant: 'primary', feature: 'interview-manager' },
      { icon: '📝', title: '답변 스크립트 작성', description: '핵심 질문에 대한 나만의 답변을 준비하세요.', actionLabel: '작성하기 ›', variant: 'outline', feature: 'interview-manager' },
      { icon: '🎬', title: '모의 면접 진행', description: '실전처럼 모의 면접을 경험해보세요.', actionLabel: '시작하기 ›', variant: 'outline', feature: 'interview-manager' },
      { icon: '🏢', title: '기업 리서치', description: '지원 기업의 최근 동향과 직무 이해를 높이세요.', actionLabel: '리서치하기 ›', variant: 'outline', feature: 'interview-manager' }
    ]
  },
  {
    id: 6, label: '지원 관리', icon: '📊',
    title: '6. 지원 관리',
    description: '지원 현황을 체계적으로 관리해보세요.',
    tip: '지원 현황을 한눈에 파악하면 다음 단계를 더 전략적으로 계획할 수 있어요. 거절도 기록해두면 나중에 큰 도움이 돼요!',
    tasks: [
      { icon: '📋', title: '지원 기업 목록 작성', description: '지원할 또는 지원한 기업 목록을 정리하세요.', actionLabel: '작성하기 ›', variant: 'primary', feature: 'application-manager' },
      { icon: '📬', title: '서류 전형 결과 확인', description: '서류 합격 / 불합격 결과를 기록하세요.', actionLabel: '확인하기 ›', variant: 'outline', feature: 'application-manager' },
      { icon: '📅', title: '면접 일정 관리', description: '면접 날짜와 장소를 달력에 등록하세요.', actionLabel: '관리하기 ›', variant: 'outline', feature: 'application-manager' },
      { icon: '💬', title: '피드백 정리', description: '면접 후기와 개선점을 기록해두세요.', actionLabel: '정리하기 ›', variant: 'outline', feature: 'application-manager' }
    ]
  }
];

// ── 더미 데이터 (최초 접속 시 현실감 있는 사용자 데이터 시드) ────────────────────────────
const DEMO_JOB_FEATURES = {
  certs: {
    selected: ['c-001', 'c-007', 'c-008'],
    graded: {},
    custom: []
  },
  interests: [
    { id: 'int1', jobId: 'fe-dev',    title: '프론트엔드 개발자', memo: 'UI/UX를 코드로 구현하는 웹 개발자' },
    { id: 'int2', jobId: 'fullstack', title: '풀스택 개발자',     memo: '프론트·백엔드 전반을 담당하는 개발자' }
  ],
  aptitude: { answers: [] },
  industryNotes: {
    it: 'IT 업계는 프론트엔드 수요가 꾸준히 증가 중. React/TypeScript 기반 포지션이 많고, 신입도 사이드 프로젝트 경험을 중시함.',
    finance: '', manufacture: '', service: '', other: ''
  },
  specGuide: { jobId: 'fe-dev', checked: {} },
  resume: {
    template: 'modern',
    education: [
      { id: 'edu1', school: '한국대학교', major: '컴퓨터공학과', degree: '학사', period: '2020.03 ~ 2024.02' }
    ],
    experience: [
      { id: 'exp1', company: '(주)그린테크', role: '프론트엔드 개발 인턴', period: '2023.07 ~ 2023.12', desc: 'React 기반 관리자 대시보드 개발 및 UI/UX 개선. 사용자 이탈률 15% 감소에 기여.' }
    ],
    skills: [
      { id: 'sk1', name: 'JavaScript', level: 4, category: '개발' },
      { id: 'sk2', name: 'React', level: 3, category: '개발' },
      { id: 'sk3', name: 'HTML / CSS', level: 5, category: '개발' },
      { id: 'sk4', name: 'TypeScript', level: 2, category: '개발' },
      { id: 'sk5', name: 'Git', level: 3, category: '도구' }
    ]
  },
  coverLetter: {
    growth: '저는 어릴 때부터 컴퓨터와 인터넷을 통해 새로운 세계를 경험하며 자랐습니다. 중학교 시절 직접 홈페이지를 만들면서 코딩의 매력을 처음 느꼈고, 이것이 컴퓨터공학과 진학으로 이어졌습니다. 대학에서 다양한 프로젝트를 경험하며 사용자가 불편함 없이 서비스를 이용할 수 있도록 만드는 프론트엔드 개발에 깊이 빠져들었습니다. 졸업 후 인턴을 통해 실무 감각을 키웠고, 지금은 더 큰 규모의 서비스에서 역량을 펼치고 싶다는 목표를 갖고 있습니다.',
    motivation: '귀사는 사용자 경험을 최우선으로 생각하는 서비스 철학이 저의 개발 방향과 정확히 일치합니다. 특히 최근 출시하신 모바일 앱이 단기간에 10만 다운로드를 달성한 것을 보며 귀사의 기술력과 팀워크에 깊은 인상을 받았습니다. 저의 프론트엔드 역량을 귀사의 성장에 보탬이 되고자 지원하게 되었습니다.',
    personality: '저는 꼼꼼함과 책임감을 가장 중요한 가치로 여깁니다. 코드 리뷰와 테스트 작성을 습관화하여 팀의 코드 품질을 높이는 데 기여했으며, 인턴 기간 동안 맡은 기능을 한 번의 버그 없이 완료하여 팀장님께 칭찬을 받았습니다. 또한 새로운 기술 습득에 적극적이어서 React를 독학으로 3개월 만에 실무에 적용한 경험도 있습니다.',
    vision: '입사 후 3년 내에 귀사의 핵심 프론트엔드 개발자로 성장하고 싶습니다. 사용자 인터랙션 성능 최적화와 접근성 개선을 주도하여 서비스 품질을 높이는 데 기여하겠습니다. 장기적으로는 프론트엔드 리드 포지션에서 주니어 개발자를 멘토링하며 팀 전체의 기술 수준을 높이는 역할을 하고 싶습니다.'
  },
  projects: [
    {
      id: 'pj1',
      title: '새싹트리 취업 핸드북',
      period: '2024.03 ~ 2024.06',
      role: '프론트엔드 개발 (팀 프로젝트 · 4인)',
      tech: ['HTML', 'CSS', 'JavaScript'],
      desc: 'HTML/CSS/JS만으로 구현한 취업 준비 통합 플랫폼. 자격증 추천, 이력서 작성, 모의 면접 기능 제공. 4개월 만에 MVP 완성, Vercel 배포.',
      url: 'https://sesacwiki.vercel.app',
      isFeatured: true
    },
    {
      id: 'pj2',
      title: '개인 포트폴리오 웹사이트',
      period: '2024.01 ~ 2024.02',
      role: '개인 프로젝트',
      tech: ['React', 'Tailwind CSS'],
      desc: 'React로 제작한 개인 포트폴리오. 반응형 디자인 적용, Vercel 배포. Google PageSpeed Insights 94점 달성.',
      url: '',
      isFeatured: false
    }
  ],
  interviewAnswers: {
    q1: '안녕하세요. 저는 사용자 경험을 최우선으로 생각하는 프론트엔드 개발자 지망생 김새싹입니다. 한국대학교 컴퓨터공학과를 졸업하였으며, 그린테크에서 6개월간 프론트엔드 인턴을 하며 실무 경험을 쌓았습니다. React와 JavaScript를 주력으로 사용하며, 성능 최적화와 접근성 개선에 관심이 많습니다.',
    q2: '귀사의 사용자 중심 철학과 빠른 성장 속도에 매료되어 지원하게 되었습니다. 특히 최근 서비스 개편에서 사용자 이탈률을 30% 줄인 사례를 보며, 제가 배울 수 있는 최적의 환경이라고 확신했습니다.',
    q3: '가장 큰 장점은 꼼꼼한 코드 작성과 빠른 학습 능력입니다. 인턴 시절 처음 접한 TypeScript를 2주 만에 실무에 적용하여 팀장님께 인정받은 경험이 있습니다. 단점은 완벽주의 성향으로 인해 가끔 일정보다 시간이 더 걸리는 경우가 있습니다. 이를 개선하기 위해 작업 전 타임박스를 설정하는 습관을 들이고 있습니다.',
    q4: '', q5: '', q6: '', q7: '', q8: ''
  },
  mockAnswers: {
    q1: [
      {
        id: 'ma1',
        text: '안녕하세요. 저는 프론트엔드 개발자를 목표로 하는 김새싹입니다. 컴퓨터공학을 전공하였고, 인턴 경험을 통해 React 기반 서비스 개발 역량을 키웠습니다. 사용자가 더 편리하게 서비스를 이용할 수 있도록 UI/UX 개선에 열정을 갖고 있습니다.',
        savedAt: '2025-06-25T09:30:00.000Z'
      }
    ],
    q2: [
      {
        id: 'ma2',
        text: '귀사의 사용자 친화적 서비스와 기술적 도전을 즐기는 문화가 저의 성장 방향과 일치하여 지원하게 되었습니다. 특히 오픈소스 기여를 장려하는 문화가 인상적이었습니다.',
        savedAt: '2025-06-26T14:20:00.000Z'
      }
    ],
    q3: [], q4: [], q5: [], q6: [], q7: [], q8: []
  },
  customIQs: [],
  researchNotes: {
    '(주)그린테크솔루션': '2025년 하반기 채용 공고 확인. 프론트엔드 포지션 TO 3명. React + TypeScript 필수. 복지 패키지 우수. 유연 근무 가능.',
    '스타트업 ABC': '스타트업 특유의 빠른 의사결정 문화. 주 1회 전체 미팅. 스톡옵션 제공. 성장 가능성 높음.'
  },
  companies: [
    { id: 'co1', company: '(주)그린테크솔루션', position: '프론트엔드 개발자', appliedDate: '2025-06-10', status: '1차 면접' },
    { id: 'co2', company: '스타트업 ABC', position: 'UI 개발자', appliedDate: '2025-06-18', status: '서류 검토 중' },
    { id: 'co3', company: '카카오엔터프라이즈', position: '프론트엔드 개발자', appliedDate: '2025-06-20', status: '지원 완료' }
  ],
  interviews: [
    { id: 'iv1', company: '(주)그린테크솔루션', type: '1차 면접', date: '2025-07-05', time: '14:00', location: '서울 강남구 테헤란로 123 그린테크 본사 3층' }
  ],
  feedbackNotes: {
    co1: '면접관 3명 예정. 포트폴리오 발표 10분 + QA 20분. React 최적화 및 협업 경험 관련 심화 질문 예상. 복장 비즈니스 캐주얼.'
  }
};

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
    activeStepId: 4,
    steps: JSON.parse(JSON.stringify(STEP_CATALOG)),
    tools: [
      { label: '🏅 자격증',       stepId: 1 },
      { label: '📄 이력서 작성',  stepId: 2 },
      { label: '✏️ 자기소개서',   stepId: 3 },
      { label: '🎤 면접 준비',    stepId: 5 }
    ]
  };

  // 더미: 실사용자처럼 보이도록 일부 태스크를 완료 처리
  const completions = {
    1: { indices: [0, 1],       dates: ['2025-06-05', '2025-06-06'] },
    2: { indices: [0, 1, 2, 3], dates: ['2025-06-10', '2025-06-11', '2025-06-12', '2025-06-13'] },
    3: { indices: [0, 1, 2, 3], dates: ['2025-06-15', '2025-06-16', '2025-06-17', '2025-06-17'] },
    4: { indices: [0, 1],       dates: ['2025-06-20', '2025-06-21'] },
    5: { indices: [0, 1],       dates: ['2025-06-24', '2025-06-25'] },
    6: { indices: [0, 1, 2],    dates: ['2025-06-27', '2025-06-28', '2025-06-29'] }
  };
  data.steps.forEach(step => {
    const c = completions[step.id];
    if (!c) return;
    c.indices.forEach((idx, i) => {
      if (step.tasks[idx]) {
        step.tasks[idx].completed   = true;
        step.tasks[idx].completedAt = c.dates[i];
      }
    });
  });

  saveData(data);

  if (!localStorage.getItem('job_features')) {
    try {
      localStorage.setItem('job_features', JSON.stringify(DEMO_JOB_FEATURES));
    } catch { /* ignore */ }
  }

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
