// ═══════════════════════════════════════════════════════════════════════════
// assets/js/pages/job-features.js
// 취업핸드북 기능 패널 렌더러 및 데이터 관리
// 데이터: localStorage (FEATURES_KEY)
// 전역 JOB_FEATURES 객체를 job.js가 참조한다
// ═══════════════════════════════════════════════════════════════════════════

const FEATURES_KEY = 'job_features';

const DEFAULT_FEATURES = {
  certs:           { selected: [], graded: {}, custom: [] },
  interests:       [],
  aptitude:        { answers: [] },
  industryNotes:   { it: '', finance: '', manufacture: '', service: '', other: '' },
  specGuide:       { jobId: '', checked: {} },
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

// ── 직군 카탈로그 ─────────────────────────────────────────────────────────────
const JOB_CATALOG = [
  { id:'fe-dev',      cat:'it',        name:'프론트엔드 개발자',     desc:'UI/UX를 코드로 구현하는 웹 개발자',                   skills:['HTML/CSS','JavaScript','React','TypeScript'] },
  { id:'be-dev',      cat:'it',        name:'백엔드 개발자',         desc:'서버·DB·API를 설계하고 구현하는 개발자',               skills:['Java','Python','Node.js','SQL','REST API'] },
  { id:'fullstack',   cat:'it',        name:'풀스택 개발자',         desc:'프론트·백엔드 전반을 담당하는 개발자',                 skills:['React','Node.js','DB 설계','DevOps 기초'] },
  { id:'mobile-dev',  cat:'it',        name:'모바일 개발자',         desc:'iOS·Android 앱을 개발하는 전문가',                    skills:['Swift','Kotlin','Flutter','React Native'] },
  { id:'devops',      cat:'it',        name:'DevOps 엔지니어',       desc:'배포·인프라·CI/CD를 관리하는 엔지니어',               skills:['Docker','Kubernetes','AWS','Linux'] },
  { id:'data-analyst',cat:'data',      name:'데이터 분석가',         desc:'데이터에서 비즈니스 인사이트를 발굴',                  skills:['SQL','Python','Excel','통계','Tableau'] },
  { id:'data-eng',    cat:'data',      name:'데이터 엔지니어',       desc:'데이터 파이프라인과 인프라를 구축',                    skills:['Python','Spark','Kafka','Hadoop','SQL'] },
  { id:'ml-eng',      cat:'data',      name:'ML 엔지니어',           desc:'머신러닝 모델을 개발하고 서비스에 적용',               skills:['Python','TensorFlow','PyTorch','수학/통계'] },
  { id:'bi-analyst',  cat:'data',      name:'BI 분석가',             desc:'비즈니스 지표를 시각화하고 의사결정 지원',             skills:['SQL','Tableau','Power BI','Excel'] },
  { id:'ux-designer', cat:'design',    name:'UX 디자이너',           desc:'사용자 경험을 연구하고 서비스 구조를 설계',            skills:['Figma','사용자 리서치','IA','프로토타이핑'] },
  { id:'ui-designer', cat:'design',    name:'UI 디자이너',           desc:'앱·웹의 시각적 화면과 디자인 시스템 담당',            skills:['Figma','Adobe XD','디자인 시스템','CSS 기초'] },
  { id:'graphic-des', cat:'design',    name:'그래픽 디자이너',       desc:'브랜드 자산·인쇄물·광고물 제작',                      skills:['Photoshop','Illustrator','InDesign','타이포'] },
  { id:'pm',          cat:'planning',  name:'PM / 프로덕트 매니저',  desc:'제품 방향을 정의하고 개발팀과 협업',                  skills:['요구사항 정의','JIRA','PRD 작성','데이터 분석'] },
  { id:'svc-planner', cat:'planning',  name:'서비스 기획자',         desc:'웹·앱 서비스의 기획서 및 화면 설계',                  skills:['기획서 작성','Figma','SQL 기초','사용자 분석'] },
  { id:'content',     cat:'planning',  name:'콘텐츠 기획자',         desc:'브랜드 스토리와 콘텐츠 전략을 기획',                  skills:['카피라이팅','콘텐츠 전략','SNS 운영','트렌드 감각'] },
  { id:'digital-mkt', cat:'marketing', name:'디지털 마케터',         desc:'온라인 광고·SEO·CRM을 통한 퍼포먼스 마케팅',          skills:['구글 애즈','메타 광고','GA4','CRM','SQL 기초'] },
  { id:'brand-mkt',   cat:'marketing', name:'브랜드 마케터',         desc:'브랜드 아이덴티티와 캠페인 전략 기획',                skills:['브랜드 전략','카피라이팅','광고 기획','소비자 이해'] },
  { id:'growth-mkt',  cat:'marketing', name:'그로스 마케터',         desc:'데이터 기반으로 성장 지표를 개선하는 마케터',          skills:['A/B 테스트','SQL','GA4','CRM','퍼널 분석'] },
  { id:'b2b-sales',   cat:'sales',     name:'B2B 영업',              desc:'기업 고객에게 솔루션·서비스를 판매',                  skills:['제안서 작성','협상','CRM','비즈니스 이해'] },
  { id:'b2c-sales',   cat:'sales',     name:'B2C 영업',              desc:'개인 고객에게 제품·서비스를 판매',                    skills:['커뮤니케이션','고객 관리','판매 기법','제품 지식'] },
  { id:'key-account', cat:'sales',     name:'키 어카운트 매니저',    desc:'핵심 기업 고객을 장기적으로 관리·성장',               skills:['관계 관리','협상','전략적 사고','보고서 작성'] },
  { id:'hr-recruit',  cat:'hr',        name:'채용 담당자',           desc:'인재 발굴과 채용 프로세스를 기획·운영',               skills:['채용 기획','면접 설계','HR 시스템','커뮤니케이션'] },
  { id:'hr-manager',  cat:'hr',        name:'HR 매니저',             desc:'조직 문화·교육·성과 관리를 담당',                     skills:['인사 제도','조직 개발','교육 기획','노무 기초'] },
  { id:'admin',       cat:'hr',        name:'총무 담당자',           desc:'사무 환경·복리후생·회사 자산을 관리',                 skills:['Excel','계약서 검토','공문 작성','예산 관리'] },
  { id:'accountant',  cat:'finance',   name:'회계 담당자',           desc:'재무제표 작성 및 세무 처리를 담당',                   skills:['회계 원리','ERP','Excel','세무 신고'] },
  { id:'fin-analyst', cat:'finance',   name:'재무 분석가',           desc:'재무 데이터를 분석하고 경영 의사결정 지원',            skills:['재무 모델링','Excel','SQL','회계 지식'] },
  { id:'tax',         cat:'finance',   name:'세무 전문가',           desc:'세금 신고·절세 전략·세무 조사 대응',                  skills:['세법','회계','세무사 자격증','ERP'] },
  { id:'cs-manager',  cat:'cs',        name:'CS 매니저',             desc:'고객 문의·불만을 해결하고 서비스 품질을 관리',         skills:['고객 응대','문제 해결','CRM','소통 능력'] },
  { id:'cust-success',cat:'cs',        name:'고객 성공 담당자',      desc:'고객이 제품을 성공적으로 활용하도록 지원',             skills:['온보딩','고객 분석','문서화','솔루션 이해'] },
  { id:'svc-ops',     cat:'cs',        name:'서비스 운영자',         desc:'서비스 정책·QA·운영 프로세스를 관리',                 skills:['운영 기획','QA','데이터 분석 기초','커뮤니케이션'] },
];

const CATALOG_CATS = [
  { key:'all',       label:'전체' },
  { key:'it',        label:'IT 개발' },
  { key:'data',      label:'데이터/AI' },
  { key:'design',    label:'디자인' },
  { key:'planning',  label:'기획/PM' },
  { key:'marketing', label:'마케팅' },
  { key:'sales',     label:'영업' },
  { key:'hr',        label:'인사/총무' },
  { key:'finance',   label:'재무/회계' },
  { key:'cs',        label:'서비스/CS' },
];

// ── 자격증 카탈로그 (136종 + 어학 등급제 7종) ─────────────────────────────────────
const CERT_CATALOG = [
  // ─── IT 개발 (19) ───
  { id:'c-001', name:'정보처리기사',              cat:'it',      weight:3, jobs:['fe-dev','be-dev','fullstack','mobile-dev','devops'] },
  { id:'c-002', name:'정보처리산업기사',          cat:'it',      weight:2, jobs:['fe-dev','be-dev','fullstack'] },
  { id:'c-003', name:'리눅스마스터 2급',          cat:'it',      weight:2, jobs:['devops','be-dev'] },
  { id:'c-004', name:'리눅스마스터 1급',          cat:'it',      weight:3, jobs:['devops','be-dev'] },
  { id:'c-005', name:'정보보안기사',              cat:'it',      weight:3, jobs:['be-dev','devops'] },
  { id:'c-006', name:'정보보안산업기사',          cat:'it',      weight:2, jobs:['be-dev','devops'] },
  { id:'c-007', name:'AWS CLF',                  cat:'it',      weight:2, jobs:['devops','be-dev','data-eng'] },
  { id:'c-008', name:'AWS SAA',                  cat:'it',      weight:3, jobs:['devops','be-dev','data-eng'] },
  { id:'c-009', name:'Azure AZ-900',             cat:'it',      weight:2, jobs:['devops','be-dev'] },
  { id:'c-010', name:'Azure AZ-104',             cat:'it',      weight:3, jobs:['devops'] },
  { id:'c-011', name:'네트워크관리사 2급',        cat:'it',      weight:2, jobs:['devops','be-dev'] },
  { id:'c-012', name:'CCNA',                     cat:'it',      weight:3, jobs:['devops','be-dev'] },
  { id:'c-013', name:'정보통신기사',              cat:'it',      weight:2, jobs:['devops','be-dev','fullstack'] },
  { id:'c-014', name:'전자계산기조직응용기사',    cat:'it',      weight:2, jobs:['fe-dev','be-dev','fullstack'] },
  { id:'c-015', name:'OCP Oracle Database',      cat:'it',      weight:2, jobs:['be-dev','data-eng'] },
  { id:'c-103', name:'GCP ACE',                  cat:'it',      weight:3, jobs:['devops','be-dev','data-eng'] },
  { id:'c-104', name:'CKA (Kubernetes)',         cat:'it',      weight:3, jobs:['devops'] },
  { id:'c-105', name:'AWS DVA (Developer)',      cat:'it',      weight:3, jobs:['fe-dev','be-dev','devops'] },
  { id:'c-106', name:'Terraform Associate',      cat:'it',      weight:2, jobs:['devops'] },
  { id:'c-130', name:'CompTIA Security+',        cat:'it',      weight:2, jobs:['devops','be-dev'] },
  { id:'c-131', name:'CISSP',                    cat:'it',      weight:3, jobs:['devops','be-dev'] },
  { id:'c-132', name:'CEH (공인윤리해커)',        cat:'it',      weight:3, jobs:['devops','be-dev'] },
  { id:'c-133', name:'AWS SysOps Associate',     cat:'it',      weight:3, jobs:['devops'] },
  { id:'c-134', name:'GCP Professional Architect', cat:'it',    weight:3, jobs:['devops','be-dev','data-eng'] },
  { id:'c-155', name:'Salesforce Platform Developer I',  cat:'it', weight:3, jobs:['be-dev','fullstack'] },
  { id:'c-156', name:'Salesforce Platform Developer II', cat:'it', weight:3, jobs:['be-dev','fullstack'] },
  // ─── 데이터/AI (17) ───
  { id:'c-020', name:'SQLD',                     cat:'data',    weight:3, jobs:['data-analyst','be-dev','bi-analyst','data-eng'] },
  { id:'c-021', name:'SQLP',                     cat:'data',    weight:3, jobs:['data-eng','be-dev','data-analyst'] },
  { id:'c-022', name:'ADsP',                     cat:'data',    weight:3, jobs:['data-analyst','bi-analyst','data-eng'] },
  { id:'c-023', name:'ADP',                      cat:'data',    weight:3, jobs:['data-analyst','ml-eng','data-eng'] },
  { id:'c-024', name:'빅데이터분석기사',          cat:'data',    weight:3, jobs:['data-analyst','data-eng','ml-eng'] },
  { id:'c-025', name:'Tableau Desktop Specialist', cat:'data',  weight:2, jobs:['bi-analyst','data-analyst'] },
  { id:'c-026', name:'Power BI 데이터 분석가',   cat:'data',    weight:2, jobs:['bi-analyst','data-analyst'] },
  { id:'c-027', name:'SAS Base Programmer',      cat:'data',    weight:2, jobs:['data-analyst','ml-eng'] },
  { id:'c-028', name:'Google 데이터 애널리틱스', cat:'data',    weight:2, jobs:['data-analyst','bi-analyst'] },
  { id:'c-029', name:'Databricks Lakehouse',     cat:'data',    weight:2, jobs:['data-eng','ml-eng'] },
  { id:'c-110', name:'TensorFlow Developer',     cat:'data',    weight:3, jobs:['ml-eng','data-eng'] },
  { id:'c-111', name:'Azure AI Fundamentals',    cat:'data',    weight:2, jobs:['ml-eng','data-analyst'] },
  { id:'c-112', name:'GCP Professional DE',      cat:'data',    weight:3, jobs:['data-eng','ml-eng'] },
  { id:'c-113', name:'Snowflake SnowPro Core',   cat:'data',    weight:2, jobs:['data-eng','data-analyst'] },
  { id:'c-135', name:'Azure Data Scientist DP-100', cat:'data', weight:3, jobs:['ml-eng','data-analyst'] },
  { id:'c-136', name:'AWS ML Specialty',         cat:'data',    weight:3, jobs:['ml-eng','data-eng'] },
  { id:'c-137', name:'GCP Professional ML Engineer', cat:'data', weight:3, jobs:['ml-eng','data-eng'] },
  // ─── 디자인 (14) ───
  { id:'c-030', name:'GTQ 1급',                  cat:'design',  weight:3, jobs:['graphic-des','ui-designer','content'] },
  { id:'c-031', name:'GTQ 2급',                  cat:'design',  weight:1, jobs:['graphic-des','content'] },
  { id:'c-032', name:'GTQ 일러스트 1급',         cat:'design',  weight:3, jobs:['graphic-des','content','ui-designer'] },
  { id:'c-033', name:'컴퓨터그래픽스운용기능사', cat:'design',  weight:3, jobs:['graphic-des','ui-designer'] },
  { id:'c-034', name:'웹디자인기능사',            cat:'design',  weight:2, jobs:['ui-designer','fe-dev'] },
  { id:'c-035', name:'시각디자인산업기사',        cat:'design',  weight:2, jobs:['graphic-des','ui-designer'] },
  { id:'c-036', name:'시각디자인기사',            cat:'design',  weight:3, jobs:['graphic-des','ui-designer'] },
  { id:'c-037', name:'컬러리스트산업기사',        cat:'design',  weight:2, jobs:['graphic-des','ui-designer','brand-mkt'] },
  { id:'c-038', name:'제품디자인기사',            cat:'design',  weight:2, jobs:['graphic-des'] },
  { id:'c-114', name:'컬러리스트기사',            cat:'design',  weight:3, jobs:['graphic-des','brand-mkt'] },
  { id:'c-115', name:'영상편집기능사',            cat:'design',  weight:2, jobs:['content','graphic-des'] },
  { id:'c-138', name:'산업디자인기사',            cat:'design',  weight:3, jobs:['graphic-des'] },
  { id:'c-139', name:'패션디자인산업기사',        cat:'design',  weight:2, jobs:['graphic-des','brand-mkt'] },
  { id:'c-140', name:'실내건축산업기사',          cat:'design',  weight:2, jobs:['graphic-des'] },
  // ─── 재무/회계 (19) ───
  { id:'c-040', name:'전산세무회계 1급',          cat:'finance', weight:3, jobs:['accountant','tax','fin-analyst'] },
  { id:'c-041', name:'전산세무회계 2급',          cat:'finance', weight:2, jobs:['accountant','admin'] },
  { id:'c-042', name:'FAT 1급',                  cat:'finance', weight:2, jobs:['accountant','admin'] },
  { id:'c-043', name:'TAT 2급',                  cat:'finance', weight:2, jobs:['accountant','tax'] },
  { id:'c-044', name:'ERP 정보관리사 회계',       cat:'finance', weight:2, jobs:['accountant','fin-analyst'] },
  { id:'c-045', name:'세무사',                   cat:'finance', weight:3, jobs:['tax'] },
  { id:'c-046', name:'공인회계사 (CPA)',          cat:'finance', weight:3, jobs:['accountant','tax','fin-analyst'] },
  { id:'c-047', name:'재경관리사',               cat:'finance', weight:3, jobs:['accountant','fin-analyst'] },
  { id:'c-048', name:'회계관리 1급',             cat:'finance', weight:2, jobs:['accountant','admin'] },
  { id:'c-049', name:'AFPK 재무설계사',          cat:'finance', weight:2, jobs:['fin-analyst'] },
  { id:'c-050', name:'투자자산운용사',            cat:'finance', weight:3, jobs:['fin-analyst'] },
  { id:'c-051', name:'금융투자분석사',            cat:'finance', weight:3, jobs:['fin-analyst'] },
  { id:'c-116', name:'ERP 정보관리사 생산',       cat:'finance', weight:2, jobs:['admin'] },
  { id:'c-117', name:'ERP 정보관리사 인사',       cat:'finance', weight:2, jobs:['hr-manager','admin'] },
  { id:'c-118', name:'증권투자권유자문인력',      cat:'finance', weight:2, jobs:['fin-analyst','b2b-sales'] },
  { id:'c-141', name:'CFA Level 1',              cat:'finance', weight:3, jobs:['fin-analyst'] },
  { id:'c-142', name:'FRM (금융위험관리사)',      cat:'finance', weight:3, jobs:['fin-analyst'] },
  { id:'c-143', name:'CMA (공인관리회계사)',      cat:'finance', weight:3, jobs:['accountant','fin-analyst'] },
  { id:'c-144', name:'신용분석사',               cat:'finance', weight:2, jobs:['fin-analyst','b2b-sales'] },
  { id:'c-162', name:'전산회계 1급',             cat:'finance', weight:2, jobs:['accountant','admin','tax'] },
  { id:'c-163', name:'전산회계 2급',             cat:'finance', weight:1, jobs:['accountant','admin'] },
  { id:'c-164', name:'전산세무 1급',             cat:'finance', weight:3, jobs:['tax','accountant'] },
  { id:'c-165', name:'전산세무 2급',             cat:'finance', weight:2, jobs:['tax','accountant','admin'] },
  // ─── 인사 (11) ───
  { id:'c-060', name:'인사관리사',               cat:'hr',      weight:3, jobs:['hr-recruit','hr-manager'] },
  { id:'c-061', name:'직업상담사 1급',            cat:'hr',      weight:3, jobs:['hr-recruit','hr-manager'] },
  { id:'c-062', name:'직업상담사 2급',            cat:'hr',      weight:2, jobs:['hr-recruit'] },
  { id:'c-063', name:'사회조사분석사 2급',        cat:'hr',      weight:2, jobs:['hr-manager','data-analyst'] },
  { id:'c-064', name:'공인노무사',               cat:'hr',      weight:3, jobs:['hr-manager','hr-recruit'] },
  { id:'c-065', name:'경영지도사 (인사)',         cat:'hr',      weight:2, jobs:['hr-manager'] },
  { id:'c-119', name:'사회조사분석사 1급',        cat:'hr',      weight:3, jobs:['hr-manager','data-analyst','svc-planner'] },
  { id:'c-120', name:'평생교육사 2급',            cat:'hr',      weight:2, jobs:['hr-manager','content'] },
  { id:'c-145', name:'PHR (전문인적자원관리사)', cat:'hr',      weight:3, jobs:['hr-recruit','hr-manager'] },
  { id:'c-146', name:'기업교육훈련평가사',        cat:'hr',      weight:2, jobs:['hr-manager','content'] },
  { id:'c-147', name:'직업훈련교사 3급',          cat:'hr',      weight:2, jobs:['hr-manager','hr-recruit'] },
  // ─── 마케팅 (14) ───
  { id:'c-070', name:'구글 애즈 인증',           cat:'marketing', weight:3, jobs:['digital-mkt','growth-mkt'] },
  { id:'c-071', name:'GA4 자격증',               cat:'marketing', weight:3, jobs:['digital-mkt','growth-mkt','bi-analyst'] },
  { id:'c-072', name:'메타 블루프린트',           cat:'marketing', weight:2, jobs:['digital-mkt','brand-mkt'] },
  { id:'c-073', name:'HubSpot Content Marketing', cat:'marketing', weight:2, jobs:['content','brand-mkt'] },
  { id:'c-074', name:'HubSpot Inbound Marketing', cat:'marketing', weight:2, jobs:['digital-mkt','growth-mkt'] },
  { id:'c-075', name:'유통관리사 2급',            cat:'marketing', weight:2, jobs:['b2b-sales','b2c-sales','brand-mkt'] },
  { id:'c-076', name:'유통관리사 1급',            cat:'marketing', weight:3, jobs:['b2b-sales','key-account','brand-mkt'] },
  { id:'c-077', name:'경영지도사 (마케팅)',       cat:'marketing', weight:2, jobs:['brand-mkt','digital-mkt'] },
  { id:'c-078', name:'SEO 자격증 (SEMrush)',     cat:'marketing', weight:2, jobs:['digital-mkt','growth-mkt','content'] },
  { id:'c-121', name:'HubSpot Email Marketing',  cat:'marketing', weight:2, jobs:['digital-mkt','brand-mkt','growth-mkt'] },
  { id:'c-122', name:'HubSpot Social Media',     cat:'marketing', weight:2, jobs:['brand-mkt','content','digital-mkt'] },
  { id:'c-123', name:'Hootsuite Social Marketing', cat:'marketing', weight:2, jobs:['brand-mkt','digital-mkt','content'] },
  { id:'c-148', name:'Google 디지털 마케팅',     cat:'marketing', weight:2, jobs:['digital-mkt','growth-mkt','brand-mkt'] },
  { id:'c-149', name:'TikTok Business Creative', cat:'marketing', weight:2, jobs:['brand-mkt','content','digital-mkt'] },
  { id:'c-157', name:'Salesforce Marketing Cloud Email', cat:'marketing', weight:3, jobs:['digital-mkt','brand-mkt','growth-mkt'] },
  // ─── CS (10) ───
  { id:'c-080', name:'CS Leaders 관리사',        cat:'cs',      weight:3, jobs:['cs-manager','cust-success'] },
  { id:'c-081', name:'소비자전문상담사 2급',      cat:'cs',      weight:2, jobs:['cs-manager','svc-ops'] },
  { id:'c-082', name:'서비스경영능력 1급',        cat:'cs',      weight:2, jobs:['cs-manager','svc-ops','cust-success'] },
  { id:'c-083', name:'고객서비스관리사',          cat:'cs',      weight:2, jobs:['cs-manager','cust-success'] },
  { id:'c-084', name:'품질경영기사',              cat:'cs',      weight:2, jobs:['svc-ops','admin'] },
  { id:'c-085', name:'서비스운영관리사',          cat:'cs',      weight:2, jobs:['svc-ops','cs-manager'] },
  { id:'c-124', name:'소비자전문상담사 1급',      cat:'cs',      weight:3, jobs:['cs-manager','cust-success','svc-ops'] },
  { id:'c-125', name:'ITIL 4 Foundation',        cat:'cs',      weight:2, jobs:['devops','svc-ops','cs-manager'] },
  { id:'c-150', name:'품질경영산업기사',          cat:'cs',      weight:2, jobs:['svc-ops','admin','cs-manager'] },
  { id:'c-151', name:'서비스운영마스터',          cat:'cs',      weight:2, jobs:['svc-ops','cs-manager'] },
  { id:'c-158', name:'Salesforce Service Cloud Consultant', cat:'cs', weight:3, jobs:['cs-manager','cust-success','svc-ops'] },
  // ─── 공통/기획 (13) ───
  { id:'c-090', name:'컴퓨터활용능력 1급',       cat:'general', weight:2, jobs:['accountant','admin','hr-manager','fin-analyst'] },
  { id:'c-091', name:'컴퓨터활용능력 2급',       cat:'general', weight:1, jobs:['admin','cs-manager','svc-ops'] },
  { id:'c-092', name:'워드프로세서 1급',         cat:'general', weight:1, jobs:['admin','cs-manager'] },
  { id:'c-093', name:'MOS Master',               cat:'general', weight:2, jobs:['admin','accountant','hr-manager'] },
  { id:'c-099', name:'무역영어 1급',             cat:'general', weight:2, jobs:['b2b-sales','key-account'] },
  { id:'c-100', name:'PMP',                      cat:'general', weight:3, jobs:['pm'] },
  { id:'c-101', name:'PMI-ACP',                  cat:'general', weight:2, jobs:['pm','svc-planner'] },
  { id:'c-126', name:'MOS Expert',               cat:'general', weight:2, jobs:['admin','hr-manager','accountant'] },
  { id:'c-127', name:'무역영어 2급',             cat:'general', weight:1, jobs:['b2b-sales'] },
  { id:'c-128', name:'경영지도사 (전략)',         cat:'general', weight:2, jobs:['pm','svc-planner'] },
  { id:'c-152', name:'ITQ OA Master',            cat:'general', weight:2, jobs:['admin','hr-manager','accountant'] },
  { id:'c-153', name:'비서 1급',                 cat:'general', weight:3, jobs:['admin'] },
  { id:'c-154', name:'비서 2급',                 cat:'general', weight:2, jobs:['admin'] },
  { id:'c-159', name:'Salesforce Administrator',          cat:'general', weight:3, jobs:['b2b-sales','cs-manager','svc-ops'] },
  { id:'c-160', name:'Salesforce Advanced Administrator', cat:'general', weight:3, jobs:['b2b-sales','svc-ops'] },
  { id:'c-161', name:'Salesforce Sales Cloud Consultant', cat:'general', weight:3, jobs:['b2b-sales','key-account'] },
  // ─── 어학 / 점수·등급 선택형 ────────────────────────────────────────────────
  { id:'cg-001', name:'TOEIC',           cat:'language', jobs:['b2b-sales','key-account','brand-mkt','hr-recruit','admin'],
    grades:[
      { value:'945+', label:'945~990점', weight:3 },
      { value:'900+', label:'900~944점', weight:3 },
      { value:'850+', label:'850~899점', weight:2 },
      { value:'800+', label:'800~849점', weight:2 },
      { value:'750+', label:'750~799점', weight:2 },
      { value:'700+', label:'700~749점', weight:1 },
      { value:'650+', label:'650~699점', weight:1 },
    ]},
  { id:'cg-002', name:'TOEIC Speaking', cat:'language', jobs:['b2b-sales','key-account','brand-mkt'],
    grades:[
      { value:'lv8', label:'Level 8 (200점)',     weight:3 },
      { value:'lv7', label:'Level 7 (190~199점)', weight:3 },
      { value:'lv6', label:'Level 6 (160~189점)', weight:2 },
      { value:'lv5', label:'Level 5 (130~159점)', weight:2 },
      { value:'lv4', label:'Level 4 (110~129점)', weight:1 },
    ]},
  { id:'cg-003', name:'OPIc',           cat:'language', jobs:['b2b-sales','key-account','brand-mkt'],
    grades:[
      { value:'AL',  label:'AL (Advanced Low)',     weight:3 },
      { value:'IH',  label:'IH (Intermediate High)',weight:3 },
      { value:'IM3', label:'IM3',                   weight:2 },
      { value:'IM2', label:'IM2',                   weight:2 },
      { value:'IM1', label:'IM1',                   weight:1 },
      { value:'IL',  label:'IL (Intermediate Low)', weight:1 },
    ]},
  { id:'cg-004', name:'JLPT (일본어)',  cat:'language', jobs:['b2b-sales','key-account','content'],
    grades:[
      { value:'N1', label:'N1 — 최상급', weight:3 },
      { value:'N2', label:'N2 — 상급',   weight:2 },
      { value:'N3', label:'N3 — 중급',   weight:1 },
      { value:'N4', label:'N4 — 초중급', weight:1 },
      { value:'N5', label:'N5 — 초급',   weight:1 },
    ]},
  { id:'cg-005', name:'HSK (중국어)',   cat:'language', jobs:['b2b-sales','key-account','content'],
    grades:[
      { value:'6', label:'6급 — 최상급', weight:3 },
      { value:'5', label:'5급 — 고급',   weight:2 },
      { value:'4', label:'4급 — 중급',   weight:2 },
      { value:'3', label:'3급 — 초중급', weight:1 },
    ]},
  { id:'cg-006', name:'TEPS (텝스)',    cat:'language', jobs:['b2b-sales','key-account','brand-mkt'],
    grades:[
      { value:'1g', label:'1등급 (526점+)',    weight:3 },
      { value:'2g', label:'2등급 (453~525점)', weight:2 },
      { value:'3g', label:'3등급 (386~452점)', weight:2 },
      { value:'4g', label:'4등급 (327~385점)', weight:1 },
    ]},
  { id:'cg-007', name:'한국사능력검정', cat:'language', jobs:['admin','hr-manager'],
    grades:[
      { value:'1', label:'1급 (심화)', weight:2 },
      { value:'2', label:'2급 (심화)', weight:2 },
      { value:'3', label:'3급 (기본)', weight:1 },
      { value:'4', label:'4급 (기본)', weight:1 },
      { value:'5', label:'5급 (기본)', weight:1 },
      { value:'6', label:'6급 (기본)', weight:1 },
    ]},
];

const CERT_CATS = [
  { key:'all',       label:'전체' },
  { key:'it',        label:'IT 개발' },
  { key:'data',      label:'데이터/AI' },
  { key:'design',    label:'디자인' },
  { key:'finance',   label:'재무/회계' },
  { key:'hr',        label:'인사' },
  { key:'marketing', label:'마케팅' },
  { key:'cs',        label:'CS' },
  { key:'general',   label:'공통/기획' },
  { key:'language',  label:'어학/외국어' },
];

// ── 적성 체크 16문항 ───────────────────────────────────────────────────────────
// 각 옵션의 score 키: it, data, design, planning, marketing, sales, hr, finance, cs
const APTITUDE_QS = [
  { area:'업무성향', q:'복잡한 문제를 해결할 때 나는', options:[
    { label:'논리적으로 분해하고 알고리즘을 찾는다',     score:{it:3,data:2} },
    { label:'데이터를 수집하고 패턴을 분석한다',         score:{data:3,finance:2} },
    { label:'시각적으로 표현하거나 사용자 입장에서 생각한다', score:{design:3,planning:2} },
    { label:'사람들과 소통하며 함께 해결책을 찾는다',    score:{hr:3,sales:2,cs:2} },
  ]},
  { area:'업무성향', q:'가장 즐겁게 할 수 있는 작업은', options:[
    { label:'코드를 작성하거나 시스템을 구축하는 것',    score:{it:3} },
    { label:'숫자나 통계를 분석하는 것',                 score:{data:3,finance:2} },
    { label:'디자인하거나 콘텐츠를 만드는 것',           score:{design:3,marketing:2} },
    { label:'전략을 기획하거나 문서를 작성하는 것',      score:{planning:3,hr:2} },
  ]},
  { area:'업무성향', q:'나의 가장 큰 강점은', options:[
    { label:'기술적 문제 해결 능력',                     score:{it:3,data:2} },
    { label:'꼼꼼한 분석과 수치 정확성',                 score:{finance:3,data:2} },
    { label:'창의성과 심미적 감각',                      score:{design:3,marketing:2} },
    { label:'설득력과 커뮤니케이션 능력',                score:{sales:3,hr:2,cs:2} },
  ]},
  { area:'업무성향', q:'새로운 도구나 기술을 배울 때 나는', options:[
    { label:'직접 코딩하거나 실습하며 익힌다',           score:{it:3} },
    { label:'원리를 이해하고 수치로 검증한다',           score:{data:2,finance:2} },
    { label:'시각적 자료와 레퍼런스로 먼저 이해한다',    score:{design:3,marketing:1} },
    { label:'다른 사람에게 설명하면서 익힌다',           score:{hr:2,cs:2,planning:1} },
  ]},
  { area:'협업스타일', q:'팀 프로젝트에서 내가 맡고 싶은 역할은', options:[
    { label:'기술 개발과 구현 담당',                     score:{it:3,data:2} },
    { label:'전체 방향과 일정 조율',                     score:{planning:3,hr:2} },
    { label:'UI/UX 또는 시각 자료 제작',                 score:{design:3} },
    { label:'고객 소통이나 발표·세일즈',                 score:{sales:3,cs:2,marketing:1} },
  ]},
  { area:'협업스타일', q:'협업할 때 내가 가장 중시하는 것은', options:[
    { label:'명확한 스펙과 기술적 완성도',               score:{it:2,planning:2} },
    { label:'팀원의 감정과 분위기',                      score:{hr:3,cs:2} },
    { label:'결과물의 품질과 완성도',                    score:{finance:2,data:2,design:2} },
    { label:'새로운 아이디어와 도전',                    score:{marketing:3,planning:2} },
  ]},
  { area:'협업스타일', q:'동료와 의견이 다를 때 나는', options:[
    { label:'데이터나 논리로 설득한다',                  score:{it:2,data:2,finance:2} },
    { label:'양쪽 입장을 들어보고 중재한다',             score:{hr:3,planning:2} },
    { label:'빠르게 실험하고 결과로 보여준다',           score:{it:2,marketing:2} },
    { label:'고객·사용자 관점으로 판단한다',             score:{design:2,cs:2,planning:2} },
  ]},
  { area:'협업스타일', q:'어떤 동료와 일하고 싶나요', options:[
    { label:'실력 있고 논리적인 동료',                   score:{it:2,data:2,finance:2} },
    { label:'따뜻하고 배려심 있는 동료',                 score:{hr:3,cs:2} },
    { label:'창의적이고 트렌디한 동료',                  score:{design:2,marketing:2} },
    { label:'목표 지향적이고 행동력 있는 동료',          score:{sales:3,planning:2} },
  ]},
  { area:'관심분야', q:'평소 관심이 가는 분야는', options:[
    { label:'프로그래밍, 인공지능, 클라우드',            score:{it:3,data:2} },
    { label:'경제, 금융, 회계',                          score:{finance:3,sales:1} },
    { label:'브랜드, 광고, SNS 마케팅',                  score:{marketing:3,design:1} },
    { label:'사람, 조직, 채용, 교육',                    score:{hr:3} },
  ]},
  { area:'관심분야', q:'여가 시간에 주로 하는 것은', options:[
    { label:'개인 프로젝트 개발 또는 알고리즘 공부',     score:{it:3} },
    { label:'시장 동향·경제 뉴스 분석',                  score:{finance:2,marketing:2} },
    { label:'사진, 영상, 그래픽 작업',                   score:{design:3,marketing:1} },
    { label:'사람들과 네트워킹하거나 봉사활동',          score:{sales:3,hr:2,cs:1} },
  ]},
  { area:'관심분야', q:'미래에 하고 싶은 일은', options:[
    { label:'기술로 세상을 바꾸는 제품을 만든다',        score:{it:3,planning:2} },
    { label:'데이터로 중요한 의사결정을 돕는다',         score:{data:3,finance:1} },
    { label:'사람들의 마음을 움직이는 콘텐츠·디자인',    score:{design:2,marketing:3} },
    { label:'조직을 성장시키고 사람을 돕는다',           score:{hr:3,cs:2} },
  ]},
  { area:'관심분야', q:'보람을 느끼는 순간은', options:[
    { label:'만든 기능이 완벽하게 작동할 때',            score:{it:3,data:2} },
    { label:'분석 결과가 중요한 결정에 활용될 때',       score:{data:3,finance:2} },
    { label:'내 디자인·콘텐츠가 많은 사람에게 닿을 때', score:{design:2,marketing:3} },
    { label:'고객이나 동료가 진심으로 감사할 때',        score:{cs:3,hr:2,sales:2} },
  ]},
  { area:'업무환경', q:'선호하는 업무 환경은', options:[
    { label:'논리와 코드로 결과가 명확하게 나오는 환경', score:{it:3,data:2} },
    { label:'숫자와 문서로 정확하게 관리되는 환경',      score:{finance:3,hr:2} },
    { label:'자유롭게 창작하고 표현하는 환경',           score:{design:3,marketing:2} },
    { label:'활발한 소통과 외부 활동이 많은 환경',       score:{sales:3,cs:2} },
  ]},
  { area:'업무환경', q:'일하고 싶은 회사 유형은', options:[
    { label:'빠르게 성장하는 IT 스타트업',               score:{it:3,data:2} },
    { label:'안정적인 대기업·공공기관',                  score:{finance:2,hr:2} },
    { label:'브랜드 있는 소비재·패션·뷰티 기업',         score:{marketing:3,design:2} },
    { label:'고객과 직접 만나는 서비스 기업',            score:{sales:3,cs:2} },
  ]},
  { area:'업무환경', q:'나의 커리어 목표는', options:[
    { label:'기술 전문가 또는 아키텍트',                 score:{it:3,data:2} },
    { label:'재무·전략 전문가',                          score:{finance:3,planning:2} },
    { label:'크리에이티브 디렉터 또는 브랜드 리더',      score:{design:2,marketing:3} },
    { label:'조직 리더 또는 HR 파트너',                  score:{hr:3,planning:1} },
  ]},
  { area:'업무환경', q:'나의 업무 페이스는', options:[
    { label:'체계적으로 깊이 파고들며 꼼꼼하게',         score:{data:3,finance:2,it:2} },
    { label:'빠르게 실험하고 반복 개선한다',             score:{it:2,marketing:2,planning:2} },
    { label:'감각과 직관으로 빠르게 판단한다',           score:{design:3,marketing:1} },
    { label:'사람 중심으로 유연하게 대응한다',           score:{hr:3,cs:3,sales:2} },
  ]},
];

const APTITUDE_JOB_TYPES = {
  it:       { name:'개발자형 💻', color:'blue',   desc:'논리적 사고와 기술 구현에 강점이 있어요. IT 개발·시스템 구축 직군이 잘 맞아요.', jobs:['프론트엔드 개발자','백엔드 개발자','풀스택 개발자'] },
  data:     { name:'분석가형 🔬', color:'purple', desc:'데이터에서 인사이트를 찾고 문제를 논리적으로 해결하는 것을 즐겨요.', jobs:['데이터 분석가','BI 분석가','ML 엔지니어'] },
  design:   { name:'크리에이터형 🎨', color:'orange', desc:'시각적 감각과 사용자 중심 사고가 뛰어나요. 디자인·UX 직군이 잘 맞아요.', jobs:['UX 디자이너','UI 디자이너','그래픽 디자이너'] },
  planning: { name:'기획자형 🗂', color:'green',  desc:'전체 그림을 보고 전략을 세우는 능력이 있어요. 서비스 기획·PM 직군이 잘 맞아요.', jobs:['서비스 기획자','PM','콘텐츠 기획자'] },
  marketing:{ name:'마케터형 📣', color:'coral',  desc:'트렌드에 민감하고 창의적인 아이디어로 사람들의 관심을 끄는 것을 즐겨요.', jobs:['디지털 마케터','브랜드 마케터','그로스 마케터'] },
  sales:    { name:'세일즈형 🤝', color:'gold',   desc:'사람과의 소통에서 에너지를 얻고, 목표 달성에 강한 동기를 받아요.', jobs:['B2B 영업','B2C 영업','키 어카운트 매니저'] },
  hr:       { name:'조직관리형 👥', color:'green', desc:'사람과 조직에 관심이 많고, 팀원들의 성장을 돕는 것에 보람을 느껴요.', jobs:['채용 담당자','HR 매니저','총무 담당자'] },
  finance:  { name:'재무/분석형 📊', color:'blue', desc:'꼼꼼한 수치 분석과 정확성을 중시해요. 재무·회계·금융 직군이 잘 맞아요.', jobs:['재무 분석가','회계 담당자','세무 전문가'] },
  cs:       { name:'고객서비스형 🌟', color:'orange', desc:'고객의 문제를 해결하고 만족을 이끌어내는 것에 강점이 있어요.', jobs:['CS 매니저','고객 성공 담당자','서비스 운영자'] },
};

// ── 업계 정적 데이터 ───────────────────────────────────────────────────────────
const INDUSTRY_DATA = {
  it: {
    companies: ['삼성SDS','네이버','카카오','라인','쿠팡','토스','당근','배달의민족','SK C&C','LG CNS'],
    trends: ['생성형 AI','클라우드 네이티브','MLOps','DevSecOps','SaaS','플랫폼 비즈니스','초개인화'],
    jobs: ['프론트엔드 개발자','백엔드 개발자','DevOps 엔지니어','ML 엔지니어','데이터 분석가','QA 엔지니어'],
  },
  finance: {
    companies: ['삼성증권','KB국민은행','신한금융','카카오페이','토스','하나금융','NH농협','미래에셋','삼성화재','롯데카드'],
    trends: ['디지털 전환','마이데이터','BNPL','오픈뱅킹','AI 심사','ESG 투자','핀테크 규제'],
    jobs: ['재무 분석가','리스크 매니저','디지털 뱅킹 기획','데이터 분석가','회계 담당자','펀드 매니저'],
  },
  manufacture: {
    companies: ['삼성전자','현대자동차','LG전자','SK하이닉스','포스코','롯데케미칼','현대제철','한화에어로스페이스','두산에너빌리티','LS일렉트릭'],
    trends: ['스마트팩토리','자동화·로봇','탄소중립','전기차 전환','공급망 다변화','온디바이스 AI','수소 에너지'],
    jobs: ['생산 관리','품질 관리(QC/QA)','공정 엔지니어','R&D 연구원','구매·SCM 담당자','MES 개발'],
  },
  service: {
    companies: ['롯데','신세계','CJ올리브영','무신사','마켓컬리','에이블씨엔씨','GS리테일','현대백화점','SSG닷컴','오늘의집'],
    trends: ['O2O 연계','라이브 커머스','D2C 전략','구독 경제','초개인화 추천','ESG 경영','리테일 테크'],
    jobs: ['MD(상품기획자)','마케터','서비스 기획자','CS 담당자','데이터 분석가','영업 담당자'],
  },
  other: {
    companies: ['삼일PwC','딜로이트','맥킨지','보스턴컨설팅','에듀테크 스타트업','헬스케어 기업','공공기관','NGO·비영리'],
    trends: ['컨설팅 수요 증가','헬스케어 디지털화','교육 플랫폼 성장','공공 데이터 개방','스타트업 생태계'],
    jobs: ['경영 컨설턴트','강사/교육 기획자','의료 기기 영업','공공기관 기획','연구원','사회적 기업 운영'],
  },
};

// ── 직무별 스펙 가이드 ────────────────────────────────────────────────────────
const SPEC_GUIDE = {
  'fe-dev':      { name:'프론트엔드 개발자', certs:[{id:'fe-c1',label:'정보처리기사',priority:'high'},{id:'fe-c2',label:'AWS CLF (선택)',priority:'mid'}], portfolio:[{id:'fe-p1',label:'GitHub 프로젝트 2개 이상 (README 포함)',priority:'high'},{id:'fe-p2',label:'React/Vue 등 프레임워크 활용 프로젝트',priority:'high'},{id:'fe-p3',label:'반응형 웹 구현 경험',priority:'mid'}], etc:[{id:'fe-e1',label:'JavaScript/TypeScript 기초 확립',priority:'high'},{id:'fe-e2',label:'Git/GitHub 협업 경험 (PR·코드리뷰)',priority:'high'},{id:'fe-e3',label:'영어 기술 문서 독해 수준',priority:'mid'}] },
  'be-dev':      { name:'백엔드 개발자',     certs:[{id:'be-c1',label:'정보처리기사',priority:'high'},{id:'be-c2',label:'리눅스 마스터 2급 (선택)',priority:'mid'}], portfolio:[{id:'be-p1',label:'REST API 서버 구현 프로젝트 (GitHub)',priority:'high'},{id:'be-p2',label:'DB 설계 및 최적화 경험',priority:'high'},{id:'be-p3',label:'Docker 컨테이너화 경험',priority:'mid'}], etc:[{id:'be-e1',label:'Java 또는 Python 중 1개 심화',priority:'high'},{id:'be-e2',label:'SQL 쿼리 작성 능숙',priority:'high'},{id:'be-e3',label:'알고리즘/코딩테스트 준비',priority:'high'}] },
  'data-analyst':{ name:'데이터 분석가',     certs:[{id:'da-c1',label:'ADsP (데이터 분석 준전문가)',priority:'high'},{id:'da-c2',label:'SQLD (SQL 개발자)',priority:'high'},{id:'da-c3',label:'구글 애널리틱스 자격증 (선택)',priority:'mid'}], portfolio:[{id:'da-p1',label:'분석 프로젝트 보고서 또는 대시보드',priority:'high'},{id:'da-p2',label:'Kaggle 참여 또는 공모전 수상',priority:'mid'},{id:'da-p3',label:'Python/R 기반 분석 코드 공유 (GitHub)',priority:'mid'}], etc:[{id:'da-e1',label:'SQL 능숙 (JOIN·서브쿼리·집계)',priority:'high'},{id:'da-e2',label:'Python Pandas·Matplotlib 사용 경험',priority:'high'},{id:'da-e3',label:'Excel 피벗·VLOOKUP 숙련',priority:'mid'}] },
  'ux-designer': { name:'UX/UI 디자이너',    certs:[{id:'ux-c1',label:'컴퓨터그래픽스운용기능사',priority:'mid'},{id:'ux-c2',label:'GTQ (그래픽기술자격) 1급',priority:'mid'}], portfolio:[{id:'ux-p1',label:'Figma 포트폴리오 (케이스 스터디 3건 이상)',priority:'high'},{id:'ux-p2',label:'사용자 인터뷰·리서치 포함 UX 프로젝트',priority:'high'},{id:'ux-p3',label:'프로토타이핑 및 사용성 테스트 경험',priority:'mid'}], etc:[{id:'ux-e1',label:'Figma 능숙 (컴포넌트·오토레이아웃)',priority:'high'},{id:'ux-e2',label:'HTML/CSS 기초 (개발자 협업용)',priority:'mid'},{id:'ux-e3',label:'UX 관련 서적 또는 강의 이수',priority:'mid'}] },
  'pm':          { name:'서비스 기획자/PM',  certs:[{id:'pm-c1',label:'PMP (선택·고급)',priority:'mid'},{id:'pm-c2',label:'정보처리기사 (IT 기업 선호)',priority:'mid'}], portfolio:[{id:'pm-p1',label:'서비스 기획서 또는 PRD 샘플',priority:'high'},{id:'pm-p2',label:'와이어프레임·플로우차트 포함 기획 문서',priority:'high'},{id:'pm-p3',label:'프로젝트 리드 경험 (동아리·인턴 등)',priority:'mid'}], etc:[{id:'pm-e1',label:'Figma 또는 Notion 협업 도구 활용',priority:'high'},{id:'pm-e2',label:'SQL 기초 (데이터 기반 의사결정)',priority:'mid'},{id:'pm-e3',label:'JIRA/Confluence 협업 경험',priority:'mid'}] },
  'digital-mkt': { name:'디지털 마케터',     certs:[{id:'dm-c1',label:'Google Ads 인증',priority:'high'},{id:'dm-c2',label:'GA4 자격증 (구글 애널리틱스)',priority:'high'},{id:'dm-c3',label:'메타 블루프린트 자격증',priority:'mid'}], portfolio:[{id:'dm-p1',label:'광고 집행 성과 보고서 (CTR·CPA·ROAS 포함)',priority:'high'},{id:'dm-p2',label:'SNS 채널 운영 및 콘텐츠 제작 사례',priority:'mid'},{id:'dm-p3',label:'A/B 테스트 또는 퍼널 분석 경험',priority:'mid'}], etc:[{id:'dm-e1',label:'구글·메타 광고 플랫폼 실무 경험',priority:'high'},{id:'dm-e2',label:'SQL 기초 (데이터 분석용)',priority:'mid'},{id:'dm-e3',label:'카피라이팅 또는 콘텐츠 감각',priority:'mid'}] },
  'b2b-sales':   { name:'B2B 영업',          certs:[{id:'bs-c1',label:'세일즈포스 자격증 (선택)',priority:'mid'},{id:'bs-c2',label:'무역 관련 자격 (수출입 영업 시)',priority:'mid'}], portfolio:[{id:'bs-p1',label:'영업·협상 경험 서술 (인턴·아르바이트 포함)',priority:'high'},{id:'bs-p2',label:'제안서 또는 발표 자료 샘플',priority:'mid'}], etc:[{id:'bs-e1',label:'비즈니스 커뮤니케이션 훈련',priority:'high'},{id:'bs-e2',label:'영어 회화 또는 비즈니스 영어 (토익 750+)',priority:'mid'},{id:'bs-e3',label:'CRM 도구 사용 경험',priority:'mid'}] },
  'hr-recruit':  { name:'인사/채용 담당자',  certs:[{id:'hr-c1',label:'인사관리사',priority:'high'},{id:'hr-c2',label:'노무사 (선택·전문직)',priority:'mid'},{id:'hr-c3',label:'직업상담사 2급',priority:'mid'}], portfolio:[{id:'hr-p1',label:'채용 기획 또는 면접 프로세스 설계 경험',priority:'high'},{id:'hr-p2',label:'HR 프로젝트 또는 인턴 경험 서술',priority:'mid'}], etc:[{id:'hr-e1',label:'Excel/HR 시스템 활용 능숙',priority:'high'},{id:'hr-e2',label:'노동법 기초 이해',priority:'mid'},{id:'hr-e3',label:'조직심리 또는 HRD 관련 교육',priority:'mid'}] },
  'accountant':  { name:'재무/회계 담당자',  certs:[{id:'ac-c1',label:'전산세무회계 1급',priority:'high'},{id:'ac-c2',label:'세무사 또는 회계사 (전문직)',priority:'mid'},{id:'ac-c3',label:'FAT/TAT 자격증',priority:'high'}], portfolio:[{id:'ac-p1',label:'재무제표 작성 실습 경험',priority:'high'},{id:'ac-p2',label:'세무 신고 또는 결산 보조 경험',priority:'mid'}], etc:[{id:'ac-e1',label:'ERP 시스템 사용 경험 (더존·SAP)',priority:'high'},{id:'ac-e2',label:'Excel 고급 (VLOOKUP·피벗·매크로)',priority:'high'},{id:'ac-e3',label:'IFRS 기초 또는 관련 교육',priority:'mid'}] },
  'cs-manager':  { name:'CS 담당자',         certs:[{id:'cs-c1',label:'CS Leaders 관리사',priority:'mid'},{id:'cs-c2',label:'소비자전문상담사 2급',priority:'mid'}], portfolio:[{id:'cs-p1',label:'고객 응대 또는 서비스 운영 경험 서술',priority:'high'},{id:'cs-p2',label:'VOC 분석 및 개선 제안 사례',priority:'mid'}], etc:[{id:'cs-e1',label:'CRM 도구 사용 경험 (Zendesk·Freshdesk)',priority:'high'},{id:'cs-e2',label:'문서 작성 능력 (매뉴얼·FAQ)',priority:'mid'},{id:'cs-e3',label:'Excel 데이터 정리 능숙',priority:'mid'}] },
};

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
        certs: {
          selected: (p.certs && Array.isArray(p.certs.selected))
            ? p.certs.selected.filter(id => CERT_CATALOG.some(x => x.id === id && !x.grades))
            : [],
          graded: (p.certs && typeof p.certs.graded === 'object' && !Array.isArray(p.certs.graded))
            ? Object.fromEntries(Object.entries(p.certs.graded).filter(([id]) => CERT_CATALOG.some(x => x.id === id && x.grades)))
            : {},
          custom: (p.certs && Array.isArray(p.certs.custom)) ? p.certs.custom : [],
        },
        resume:        { ...DEFAULT_FEATURES.resume,        ...(p.resume        || {}) },
        coverLetter:   { ...DEFAULT_FEATURES.coverLetter,   ...(p.coverLetter   || {}) },
        industryNotes: { ...DEFAULT_FEATURES.industryNotes, ...(p.industryNotes || {}) },
        aptitude:      { ...DEFAULT_FEATURES.aptitude,      ...(p.aptitude      || {}) },
        specGuide:     { ...DEFAULT_FEATURES.specGuide,     ...(p.specGuide     || {}) },
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
function renderInterests(c, activeCat) {
  const f   = loadFeatures();
  const cat = (typeof activeCat === 'string' && activeCat) ? activeCat : 'all';
  const filtered = cat === 'all' ? JOB_CATALOG : JOB_CATALOG.filter(j => j.cat === cat);
  const savedIds = new Set(f.interests.map(x => x.jobId));

  c.innerHTML = `
    <div class="ff-interests-layout">
      <div class="ff-interests-catalog">
        <p class="ff-section__title">직군 카탈로그</p>
        <div class="ff-tabs ff-tabs--wrap">
          ${CATALOG_CATS.map(ct => `
            <button type="button" class="ff-tab${ct.key === cat ? ' ff-tab--active' : ''}" data-cat="${ct.key}">${ct.label}</button>
          `).join('')}
        </div>
        <div class="ff-catalog-grid">
          ${filtered.map(job => {
            const added = savedIds.has(job.id);
            return `
              <div class="ff-catalog-card${added ? ' ff-catalog-card--added' : ''}">
                <div class="ff-catalog-card__body">
                  <p class="ff-catalog-card__name">${esc(job.name)}</p>
                  <p class="ff-catalog-card__desc">${esc(job.desc)}</p>
                  <div class="ff-catalog-card__skills">
                    ${job.skills.map(s => `<span class="tag tag--blue">${esc(s)}</span>`).join('')}
                  </div>
                </div>
                <button type="button"
                        class="btn btn--sm ${added ? 'btn--ghost ff-catalog-remove' : 'btn--primary ff-catalog-add'}"
                        data-job-id="${job.id}"
                        ${added ? 'aria-pressed="true"' : ''}>
                  ${added ? '추가됨 ✓' : '+ 관심 직무 추가'}
                </button>
              </div>`;
          }).join('')}
        </div>
      </div>

      <div class="ff-interests-saved">
        <p class="ff-section__title">내 관심 직무 <span class="ff-saved-count">${f.interests.length}개</span></p>
        <ul class="ff-list">
          ${f.interests.length ? f.interests.map(x => `
            <li class="ff-item">
              <div class="ff-item__body">
                <p class="ff-item__title">${esc(x.title)}</p>
                ${x.memo ? `<p class="ff-item__desc">${esc(x.memo)}</p>` : ''}
              </div>
              <button type="button" class="btn btn--ghost btn--sm ff-del" data-id="${x.id}">삭제</button>
            </li>`).join('')
            : '<li class="ff-empty">카탈로그에서 관심 직무를 추가해보세요! 🔍</li>'}
        </ul>
        <div class="ff-form" style="margin-top:var(--space-14)">
          <input id="fi-custom" class="ff-input" placeholder="직접 입력 (예: 게임 기획자)">
          <button type="button" class="btn btn--outline btn--sm" id="fi-add-custom">직접 추가</button>
        </div>
      </div>
    </div>`;

  c.querySelectorAll('.ff-tab[data-cat]').forEach(btn => btn.onclick = () => renderInterests(c, btn.dataset.cat));

  c.querySelectorAll('.ff-catalog-add').forEach(btn => btn.onclick = () => {
    const job = JOB_CATALOG.find(j => j.id === btn.dataset.jobId);
    if (!job || savedIds.has(job.id)) return;
    f.interests.push({ id: genId(), jobId: job.id, title: job.name, memo: job.desc });
    saveFeatures(f);
    T(`${job.name}을(를) 관심 직무에 추가했어요!`);
    renderInterests(c, cat);
  });

  c.querySelectorAll('.ff-catalog-remove').forEach(btn => btn.onclick = () => {
    const job = JOB_CATALOG.find(j => j.id === btn.dataset.jobId);
    f.interests = f.interests.filter(x => x.jobId !== btn.dataset.jobId);
    saveFeatures(f);
    if (job) T(`${job.name}을(를) 관심 직무에서 제거했어요.`);
    renderInterests(c, cat);
  });

  c.querySelectorAll('.ff-del').forEach(b => b.onclick = () => {
    f.interests = f.interests.filter(x => x.id !== b.dataset.id);
    saveFeatures(f);
    renderInterests(c, cat);
  });

  c.querySelector('#fi-add-custom').onclick = () => {
    const title = c.querySelector('#fi-custom').value.trim();
    if (!title) return T('직무명을 입력하세요.');
    f.interests.push({ id: genId(), jobId: null, title, memo: '' });
    saveFeatures(f);
    T(`${title}을(를) 관심 직무에 추가했어요!`);
    renderInterests(c, cat);
  };
}

// ── 2. 직무 적성 체크 ─────────────────────────────────────────────────────
function calcAptitudeResult(answers) {
  const totals = {};
  answers.forEach((optIdx, qIdx) => {
    const q = APTITUDE_QS[qIdx];
    if (!q || optIdx == null) return;
    const scoreMap = q.options[optIdx]?.score || {};
    Object.entries(scoreMap).forEach(([key, val]) => {
      totals[key] = (totals[key] || 0) + val;
    });
  });
  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([key, score]) => ({ key, score, ...APTITUDE_JOB_TYPES[key] }));
}

function renderAptitude(c) {
  const f    = loadFeatures();
  const done = f.aptitude.answers.length === APTITUDE_QS.length;

  if (done) {
    const ranked = calcAptitudeResult(f.aptitude.answers);
    const top    = ranked.slice(0, 3);
    const max    = ranked[0]?.score || 1;
    c.innerHTML = `
      <div class="ff-apt-result-wrap">
        <p class="ff-apt-result-wrap__title">🎉 적성 체크 완료!</p>
        <p class="ff-apt-result-wrap__sub">나에게 잘 맞는 직군 TOP 3</p>
        ${top.map((t, i) => `
          <div class="ff-apt-type-card ff-apt-type-card--rank${i + 1}">
            <div class="ff-apt-type-card__header">
              <span class="ff-apt-type-card__rank">${['1위','2위','3위'][i]}</span>
              <span class="ff-apt-type-card__name">${esc(t.name)}</span>
            </div>
            <div class="progress-bar ff-apt-type-card__bar" role="progressbar"
                 aria-valuenow="${Math.round(t.score / max * 100)}" aria-valuemin="0" aria-valuemax="100">
              <div class="progress-bar__fill progress-bar__fill--${t.color || 'green'}"
                   style="width:${Math.round(t.score / max * 100)}%"></div>
            </div>
            <p class="ff-apt-type-card__match">${Math.round(t.score / max * 100)}% 매칭</p>
            <p class="ff-apt-type-card__desc">${esc(t.desc)}</p>
            <div class="ff-apt-type-card__jobs">
              ${(t.jobs || []).map(j => `<span class="tag tag--${t.color || 'green'}">${esc(j)}</span>`).join('')}
            </div>
          </div>`).join('')}
        <button type="button" class="btn btn--outline btn--sm" id="apt-reset" style="margin-top:var(--space-20)">다시 하기</button>
      </div>`;
    c.querySelector('#apt-reset').onclick = () => {
      f.aptitude.answers = [];
      saveFeatures(f);
      renderAptitude(c);
    };
    return;
  }

  const idx = f.aptitude.answers.length;
  const q   = APTITUDE_QS[idx];
  c.innerHTML = `
    <div class="ff-aptitude">
      <div class="ff-aptitude__meta">
        <span class="tag tag--gray">${esc(q.area)}</span>
        <p class="ff-aptitude__progress">Q ${idx + 1} / ${APTITUDE_QS.length}</p>
      </div>
      <div class="progress-bar ff-aptitude__bar" role="progressbar"
           aria-valuenow="${idx}" aria-valuemin="0" aria-valuemax="${APTITUDE_QS.length}">
        <div class="progress-bar__fill progress-bar__fill--blue" style="width:${(idx / APTITUDE_QS.length) * 100}%"></div>
      </div>
      <p class="ff-aptitude__question">${esc(q.q)}</p>
      <div class="ff-aptitude__options">
        ${q.options.map((opt, i) => `
          <button type="button" class="ff-apt-option" data-opt="${i}">${esc(opt.label)}</button>
        `).join('')}
      </div>
      ${idx > 0 ? `<button type="button" class="btn btn--ghost btn--sm ff-aptitude__back" id="apt-back">← 이전으로</button>` : ''}
    </div>`;

  c.querySelectorAll('.ff-apt-option').forEach(btn => btn.onclick = () => {
    f.aptitude.answers.push(parseInt(btn.dataset.opt, 10));
    saveFeatures(f);
    renderAptitude(c);
  });

  c.querySelector('#apt-back')?.addEventListener('click', () => {
    f.aptitude.answers.pop();
    saveFeatures(f);
    renderAptitude(c);
  });
}

// ── 3. 업계 분석 ──────────────────────────────────────────────────────────
const INDUSTRIES = [
  { key: 'it',          label: 'IT/SW' },
  { key: 'finance',     label: '금융' },
  { key: 'manufacture', label: '제조업' },
  { key: 'service',     label: '서비스업' },
  { key: 'other',       label: '기타' },
];

function renderIndustry(c, activeKey) {
  const f   = loadFeatures();
  const key = (typeof activeKey === 'string' && activeKey) ? activeKey : 'it';
  const ind = INDUSTRIES.find(x => x.key === key);
  const dat = INDUSTRY_DATA[key] || {};

  c.innerHTML = `
    <div class="ff-tabs">
      ${INDUSTRIES.map(i => `
        <button type="button" class="ff-tab${i.key === key ? ' ff-tab--active' : ''}" data-ind="${i.key}">${i.label}</button>
      `).join('')}
    </div>

    <div class="ff-industry-snapshot">
      <div class="ff-industry-block">
        <p class="ff-industry-block__title">🏢 주요 기업</p>
        <div class="ff-industry-block__tags">
          ${(dat.companies || []).map(co => `<span class="tag tag--gray">${esc(co)}</span>`).join('')}
        </div>
      </div>
      <div class="ff-industry-block">
        <p class="ff-industry-block__title">📈 2025 트렌드 키워드</p>
        <div class="ff-industry-block__tags">
          ${(dat.trends || []).map(t => `<span class="tag tag--blue">${esc(t)}</span>`).join('')}
        </div>
      </div>
      <div class="ff-industry-block">
        <p class="ff-industry-block__title">💼 주요 직무</p>
        <div class="ff-industry-block__tags">
          ${(dat.jobs || []).map(j => `<span class="tag tag--green">${esc(j)}</span>`).join('')}
        </div>
      </div>
    </div>

    <div class="ff-section">
      <p class="ff-section__title">📝 나의 분석 노트</p>
      <label class="sr-only" for="ind-note">${ind.label} 분석 노트</label>
      <textarea id="ind-note" class="ff-textarea" rows="7"
                placeholder="${ind.label} 업계에 대해 조사한 내용, 지원 동기, 관심 기업 등을 자유롭게 기록해보세요.">${esc(f.industryNotes[key])}</textarea>
      <p class="ff-char-count">${(f.industryNotes[key] || '').length}자</p>
    </div>`;

  c.querySelectorAll('.ff-tab').forEach(btn => btn.onclick = () => {
    f.industryNotes[key] = (c.querySelector('#ind-note') || {}).value || f.industryNotes[key];
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

// ── 4. 직무별 스펙 가이드 ─────────────────────────────────────────────────
function renderSpecGuide(c) {
  const f      = loadFeatures();
  const jobId  = f.specGuide.jobId || '';
  const guide  = SPEC_GUIDE[jobId] || null;
  const checked = f.specGuide.checked || {};

  const calcProgress = (items) => {
    if (!items || !items.length) return 0;
    return Math.round(items.filter(it => checked[it.id]).length / items.length * 100);
  };

  const allItems = guide ? [...(guide.certs || []), ...(guide.portfolio || []), ...(guide.etc || [])] : [];
  const totalPct = guide ? Math.round(allItems.filter(it => checked[it.id]).length / (allItems.length || 1) * 100) : 0;

  c.innerHTML = `
    <div class="ff-spec-header">
      <div class="ff-form">
        <select id="sg-select" class="ff-select">
          <option value="">-- 직무를 선택하세요 --</option>
          ${Object.entries(SPEC_GUIDE).map(([id, g]) =>
            `<option value="${id}"${id === jobId ? ' selected' : ''}>${esc(g.name)}</option>`
          ).join('')}
        </select>
      </div>
      ${guide ? `
        <div class="ff-spec-total">
          <span class="ff-spec-total__label">전체 준비율</span>
          <div class="progress-bar ff-spec-total__bar" role="progressbar"
               aria-valuenow="${totalPct}" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-bar__fill progress-bar__fill--green" style="width:${totalPct}%"></div>
          </div>
          <span class="ff-spec-total__pct">${totalPct}%</span>
        </div>` : ''}
    </div>

    ${!guide ? `
      <div class="ff-ai-stub">
        <p class="ff-ai-stub__icon">📋</p>
        <p class="ff-ai-stub__title">직무를 선택하면 스펙 가이드가 나타나요</p>
        <p class="ff-ai-stub__desc">목표 직무의 자격증, 포트폴리오, 기타 준비사항을<br>체크리스트로 확인하고 하나씩 완성해보세요!</p>
      </div>` : `
      <div class="ff-spec-body">
        ${[
          { title: '🏅 자격증 / 스펙', items: guide.certs },
          { title: '🖼 포트폴리오 / 프로젝트', items: guide.portfolio },
          { title: '📌 기타 준비사항', items: guide.etc },
        ].map(sec => `
          <div class="ff-spec-section">
            <div class="ff-spec-section__header">
              <p class="ff-spec-section__title">${sec.title}</p>
              <span class="ff-spec-section__pct">${calcProgress(sec.items)}%</span>
            </div>
            <ul class="ff-spec-list">
              ${(sec.items || []).map(it => `
                <li class="ff-spec-item${checked[it.id] ? ' ff-spec-item--done' : ''}">
                  <button type="button"
                          class="ff-spec-item__check${checked[it.id] ? ' ff-spec-item__check--done' : ''}"
                          data-item-id="${it.id}"
                          aria-pressed="${!!checked[it.id]}"
                          aria-label="${esc(it.label)} ${checked[it.id] ? '완료 취소' : '완료로 표시'}">
                    ${checked[it.id] ? '✓' : ''}
                  </button>
                  <span class="ff-spec-item__label">${esc(it.label)}</span>
                  <span class="tag tag--${it.priority === 'high' ? 'coral' : 'gray'} ff-spec-item__priority">
                    ${it.priority === 'high' ? '필수' : '권장'}
                  </span>
                </li>`).join('')}
            </ul>
          </div>`).join('')}
      </div>`}`;

  c.querySelector('#sg-select').onchange = (e) => {
    f.specGuide.jobId = e.target.value;
    saveFeatures(f);
    renderSpecGuide(c);
  };

  c.querySelectorAll('.ff-spec-item__check').forEach(btn => btn.onclick = () => {
    const id = btn.dataset.itemId;
    checked[id] = !checked[id];
    f.specGuide.checked = checked;
    saveFeatures(f);
    T(checked[id] ? '✅ 완료 처리했어요!' : '↩️ 완료를 취소했어요.');
    renderSpecGuide(c);
  });
}

// ── 5. 이력서 작성 (통합) ────────────────────────────────────────────────
function renderResumeBuilder(c) {
  const f = loadFeatures();
  if (!f.resume) f.resume = { template: '', education: [], experience: [], skills: [] };
  const r = f.resume;

  if (_resumeTab === 'template') _resumeTab = 'history';

  const tabs = [
    { key: 'history', label: '🎓 학력/경력' },
    { key: 'skills',  label: '💻 기술 스택' },
  ];

  let leftHTML = '';
  if (_resumeTab === 'history') {
    leftHTML = `
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
          ${r.education.length ? r.education.map(x => `
            <li class="ff-item">
              <div class="ff-item__body">
                <p class="ff-item__title">${esc(x.school)}${x.major ? ` — ${esc(x.major)}` : ''}</p>
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
          ${r.experience.length ? r.experience.map(x => `
            <li class="ff-item">
              <div class="ff-item__body">
                <p class="ff-item__title">${esc(x.company)} — ${esc(x.role)}</p>
                ${x.period ? `<span class="tag tag--gray">${esc(x.period)}</span>` : ''}
                ${x.desc ? `<p class="ff-item__desc">${esc(x.desc)}</p>` : ''}
              </div>
              <button type="button" class="btn btn--ghost btn--sm ff-del-exp" data-id="${x.id}">삭제</button>
            </li>`).join('') : '<li class="ff-empty">경력이 있다면 추가해보세요!</li>'}
        </ul>
      </div>`;
  } else if (_resumeTab === 'skills') {
    leftHTML = `
      <div class="ff-form">
        <input id="rs-name" class="ff-input" placeholder="기술명 (예: React, Python)">
        <select id="rs-level" class="ff-select">
          ${SKILL_LEVELS.slice(1).map((l, i) => `<option value="${i + 1}">${l}</option>`).join('')}
        </select>
        <input id="rs-cat" class="ff-input ff-input--sm" placeholder="분류 (예: 프론트엔드)">
        <button type="button" class="btn btn--primary btn--sm" id="rs-add">+ 추가</button>
      </div>
      <div class="ff-skills-wrap" style="margin-top:var(--space-12)">
        ${r.skills.length ? r.skills.map(x => `
          <span class="ff-skill-tag">
            ${esc(x.name)}<span class="ff-skill-level">${SKILL_LEVELS[x.level] || ''}</span>
            <button type="button" class="ff-skill-del" data-id="${x.id}" aria-label="${esc(x.name)} 삭제">×</button>
          </span>`).join('') : '<p class="ff-empty" style="margin:0">기술 스택을 추가해보세요!</p>'}
      </div>`;
  }

  c.innerHTML = `
    <div class="ff-resume-layout">
      <div class="ff-resume-left">
        <div class="ff-tabs ff-tabs--sm">
          ${tabs.map(t => `
            <button type="button" class="ff-tab${_resumeTab === t.key ? ' ff-tab--active' : ''}" data-rtab="${t.key}">${t.label}</button>`).join('')}
        </div>
        <div class="ff-resume-form-body">${leftHTML}</div>
      </div>
      <div class="ff-resume-right">
        <p class="ff-section__title">📄 이력서 미리보기</p>
        <div class="ff-preview-section">
          <p class="ff-preview-label">학력</p>
          ${r.education.length ? r.education.map(x => `
            <p class="ff-preview-item">🎓 <strong>${esc(x.school)}</strong>${x.major ? ` · ${esc(x.major)}` : ''}${x.degree ? ` · ${esc(x.degree)}` : ''}${x.period ? `<br><span class="ff-preview-meta">${esc(x.period)}</span>` : ''}</p>
          `).join('') : '<p class="ff-preview-empty">학력/경력 탭에서 추가하세요</p>'}
        </div>
        <div class="ff-preview-section">
          <p class="ff-preview-label">경력</p>
          ${r.experience.length ? r.experience.map(x => `
            <p class="ff-preview-item">💼 <strong>${esc(x.company)}</strong> · ${esc(x.role)}${x.period ? `<br><span class="ff-preview-meta">${esc(x.period)}</span>` : ''}${x.desc ? `<br><span class="ff-preview-desc">${esc(x.desc)}</span>` : ''}</p>
          `).join('') : '<p class="ff-preview-empty">경력이 있다면 추가하세요</p>'}
        </div>
        <div class="ff-preview-section">
          <p class="ff-preview-label">기술 스택</p>
          ${r.skills.length
            ? `<div class="ff-preview-tags">${r.skills.map(x => `<span class="tag tag--blue">${esc(x.name)}</span>`).join('')}</div>`
            : '<p class="ff-preview-empty">기술 스택 탭에서 추가하세요</p>'}
        </div>
      </div>
    </div>`;

  c.querySelectorAll('.ff-tab[data-rtab]').forEach(btn => {
    btn.onclick = () => { _resumeTab = btn.dataset.rtab; renderResumeBuilder(c); };
  });

  c.querySelector('#rh-edu-add')?.addEventListener('click', () => {
    const school = c.querySelector('#rh-school').value.trim();
    if (!school) return T('학교명을 입력하세요.');
    const f2 = loadFeatures();
    f2.resume.education.push({ id: genId(), school, major: c.querySelector('#rh-major').value.trim(), degree: c.querySelector('#rh-degree').value.trim(), period: c.querySelector('#rh-period').value.trim() });
    saveFeatures(f2); renderResumeBuilder(c);
  });
  c.querySelectorAll('.ff-del-edu').forEach(b => b.onclick = () => {
    const f2 = loadFeatures(); f2.resume.education = f2.resume.education.filter(x => x.id !== b.dataset.id); saveFeatures(f2); renderResumeBuilder(c);
  });
  c.querySelector('#rh-exp-add')?.addEventListener('click', () => {
    const company = c.querySelector('#rh-co').value.trim();
    if (!company) return T('회사명을 입력하세요.');
    const f2 = loadFeatures();
    f2.resume.experience.push({ id: genId(), company, role: c.querySelector('#rh-role').value.trim(), period: c.querySelector('#rh-period2').value.trim(), desc: c.querySelector('#rh-desc').value.trim() });
    saveFeatures(f2); renderResumeBuilder(c);
  });
  c.querySelectorAll('.ff-del-exp').forEach(b => b.onclick = () => {
    const f2 = loadFeatures(); f2.resume.experience = f2.resume.experience.filter(x => x.id !== b.dataset.id); saveFeatures(f2); renderResumeBuilder(c);
  });

  c.querySelector('#rs-add')?.addEventListener('click', () => {
    const name = c.querySelector('#rs-name').value.trim();
    if (!name) return T('기술명을 입력하세요.');
    const f2 = loadFeatures();
    f2.resume.skills.push({ id: genId(), name, level: parseInt(c.querySelector('#rs-level').value, 10), category: c.querySelector('#rs-cat').value.trim() });
    saveFeatures(f2); renderResumeBuilder(c);
  });
  c.querySelectorAll('.ff-skill-del').forEach(b => b.onclick = () => {
    const f2 = loadFeatures(); f2.resume.skills = f2.resume.skills.filter(x => x.id !== b.dataset.id); saveFeatures(f2); renderResumeBuilder(c);
  });
}

// ── 5-old. 이력서 양식 선택 (단독) ──────────────────────────────────────
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
// ── 10. 포트폴리오 (통합) ──────────────────────────────────────────────────
function renderPortfolioBuilder(c) {
  const f = loadFeatures();

  const tabs = [
    { key: 'projects', label: '🗂 프로젝트' },
    { key: 'preview',  label: '🖼 미리보기' },
  ];

  let bodyHTML = '';
  if (_portfolioTab === 'projects') {
    bodyHTML = `
      <div class="ff-form ff-form--col" style="margin-bottom:var(--space-20)">
        <div class="ff-form ff-form--row">
          <input id="pj-title"  class="ff-input" placeholder="프로젝트명">
          <input id="pj-period" class="ff-input ff-input--sm" placeholder="기간 (예: 2024.03 ~ 2024.06)">
          <input id="pj-role"   class="ff-input ff-input--sm" placeholder="역할 (예: 프론트엔드 개발)">
        </div>
        <div class="ff-form ff-form--row">
          <input id="pj-tech" class="ff-input" placeholder="기술 스택 (쉼표로 구분: React, Node.js)">
          <input id="pj-url"  class="ff-input ff-input--sm" placeholder="GitHub / 배포 URL">
        </div>
        <textarea id="pj-desc" class="ff-textarea" rows="3" placeholder="프로젝트 설명 및 주요 성과를 입력하세요"></textarea>
        <button type="button" class="btn btn--primary btn--sm" id="pj-add">+ 프로젝트 추가</button>
      </div>
      <div class="ff-project-grid">
        ${f.projects.length ? f.projects.map(x => `
          <div class="ff-project-card${x.isFeatured ? ' ff-project-card--featured' : ''}">
            ${x.isFeatured ? '<span class="tag tag--green">⭐ 대표</span>' : ''}
            <p class="ff-project-card__title">${esc(x.title)}</p>
            ${x.period ? `<p class="ff-project-card__meta">${esc(x.period)}${x.role ? ` · ${esc(x.role)}` : ''}</p>` : ''}
            ${x.tech.length ? `<p class="ff-project-card__tech">${x.tech.map(t => `<span class="tag tag--blue">${esc(t)}</span>`).join('')}</p>` : ''}
            ${x.desc ? `<p class="ff-project-card__desc">${esc(x.desc)}</p>` : ''}
            ${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener" class="ff-link">링크 →</a>` : ''}
            <div class="ff-project-card__actions">
              <button type="button" class="btn btn--outline btn--sm ff-pj-feature" data-id="${x.id}">${x.isFeatured ? '대표 해제' : '⭐ 대표로 설정'}</button>
              <button type="button" class="btn btn--ghost btn--sm ff-pj-del" data-id="${x.id}">삭제</button>
            </div>
          </div>`).join('') : '<p class="ff-empty">프로젝트를 추가해보세요!</p>'}
      </div>`;
  } else {
    const featured = f.projects.find(x => x.isFeatured);
    if (!featured) {
      bodyHTML = `<div class="ff-ai-stub">
        <p class="ff-ai-stub__icon">🖼</p>
        <p class="ff-ai-stub__title">대표 프로젝트를 먼저 선택해주세요</p>
        <p class="ff-ai-stub__desc">프로젝트 탭에서 대표로 설정한 프로젝트가 여기에 표시돼요.</p>
      </div>`;
    } else {
      bodyHTML = `
        <div class="ff-portfolio">
          <div class="ff-portfolio__hero">
            <span class="ff-portfolio__icon" aria-hidden="true">🖼</span>
            <div>
              <p class="ff-portfolio__title">${esc(featured.title)}</p>
              ${featured.period ? `<p class="ff-portfolio__meta">${esc(featured.period)}${featured.role ? ` · ${esc(featured.role)}` : ''}</p>` : ''}
            </div>
          </div>
          ${featured.tech.length ? `<div class="ff-portfolio__tech">${featured.tech.map(t => `<span class="tag tag--blue">${esc(t)}</span>`).join('')}</div>` : ''}
          ${featured.desc ? `<p class="ff-portfolio__desc">${esc(featured.desc)}</p>` : ''}
          ${featured.url ? `<a href="${esc(featured.url)}" target="_blank" rel="noopener" class="btn btn--outline btn--sm">🔗 링크 열기</a>` : ''}
          ${f.resume.skills.filter(s => featured.tech.some(t => t.toLowerCase().includes(s.name.toLowerCase()))).length ? `
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
            </div>` : ''}
        </div>`;
    }
  }

  c.innerHTML = `
    <div class="ff-tabs ff-tabs--sm">
      ${tabs.map(t => `
        <button type="button" class="ff-tab${_portfolioTab === t.key ? ' ff-tab--active' : ''}" data-ptab="${t.key}">${t.label}</button>`).join('')}
    </div>
    <div style="padding-top:var(--space-20)">${bodyHTML}</div>`;

  c.querySelectorAll('.ff-tab[data-ptab]').forEach(btn => {
    btn.onclick = () => { _portfolioTab = btn.dataset.ptab; renderPortfolioBuilder(c); };
  });

  if (_portfolioTab === 'projects') {
    c.querySelector('#pj-add').onclick = () => {
      const title = c.querySelector('#pj-title').value.trim();
      if (!title) return T('프로젝트명을 입력하세요.');
      const tech = c.querySelector('#pj-tech').value.split(',').map(t => t.trim()).filter(Boolean);
      const f2 = loadFeatures();
      f2.projects.push({ id: genId(), title, period: c.querySelector('#pj-period').value.trim(), role: c.querySelector('#pj-role').value.trim(), tech, desc: c.querySelector('#pj-desc').value.trim(), url: c.querySelector('#pj-url').value.trim(), isFeatured: false });
      saveFeatures(f2); renderPortfolioBuilder(c);
    };
    c.querySelectorAll('.ff-pj-feature').forEach(b => b.onclick = () => {
      const f2 = loadFeatures();
      f2.projects.forEach(x => { x.isFeatured = (x.id === b.dataset.id) ? !x.isFeatured : false; });
      saveFeatures(f2); renderPortfolioBuilder(c);
    });
    c.querySelectorAll('.ff-pj-del').forEach(b => b.onclick = () => {
      const f2 = loadFeatures();
      f2.projects = f2.projects.filter(x => x.id !== b.dataset.id);
      saveFeatures(f2); renderPortfolioBuilder(c);
    });
  }
}

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

  c.querySelector('#pj-images').onchange = function () {
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
  const q = allQ[_mockIdx];
  const catColors = { '기본': 'gray', '경험': 'blue', '비전': 'green', '직무': 'orange' };
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

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
      </div>
      ${SR ? `
        <div class="ff-mock__record-area">
          <div class="ff-mock__rec-row">
            <button type="button" class="btn btn--primary" id="mock-rec-btn">🎤 녹음 시작</button>
            <span class="ff-mock__rec-status" id="mock-rec-status"></span>
          </div>
          <div class="ff-mock__transcript" id="mock-transcript">
            <p class="ff-mock__transcript-placeholder">녹음 버튼을 누르고 답변을 말해보세요.</p>
          </div>
          <div class="ff-mock__rec-actions" id="mock-rec-actions" hidden>
            <button type="button" class="btn btn--outline btn--sm" id="mock-download">⬇️ 텍스트 파일로 저장</button>
            <button type="button" class="btn btn--ghost btn--sm" id="mock-clear">↺ 다시 녹음</button>
          </div>
        </div>` : `
        <p class="ff-empty" style="margin-top:var(--space-16)">이 브라우저는 음성 인식을 지원하지 않아요.<br>Chrome 또는 Edge를 사용해주세요.</p>`}
      <div class="ff-mock__nav">
        <button type="button" class="btn btn--ghost btn--sm" id="mock-prev" ${_mockIdx === 0 ? 'disabled' : ''}>← 이전</button>
        <button type="button" class="btn btn--ghost btn--sm" id="mock-next" ${_mockIdx === allQ.length - 1 ? 'disabled' : ''}>다음 →</button>
      </div>
    </div>`;

  if (SR) {
    let finalText   = '';
    let wantsRecord = false;
    let hasError    = false;

    const recBtn     = c.querySelector('#mock-rec-btn');
    const recStatus  = c.querySelector('#mock-rec-status');
    const transcript = c.querySelector('#mock-transcript');
    const recActions = c.querySelector('#mock-rec-actions');

    function setRecStopped(label) {
      recBtn.textContent = label;
      recBtn.classList.remove('ff-mock__rec-btn--active');
      recStatus.innerHTML = '';
    }

    function startRec() {
      hasError = false;

      const recognition = new SR();
      _mockRecognition  = recognition;
      recognition.lang           = 'ko-KR';
      recognition.continuous     = false; // false가 Chrome에서 onresult를 더 안정적으로 발화
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        recBtn.textContent  = '⏹ 중지';
        recBtn.classList.add('ff-mock__rec-btn--active');
        recStatus.innerHTML = '<span class="ff-mock__rec-dot"></span> 녹음 중...';
        if (!finalText) transcript.innerHTML = '<p class="ff-mock__transcript-placeholder">🎙 말씀해주세요...</p>';
      };

      recognition.onresult = (e) => {
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
          else interim += e.results[i][0].transcript;
        }
        transcript.innerHTML = `<p class="ff-mock__transcript-text">${esc(finalText)}<span class="ff-mock__interim">${esc(interim)}</span></p>`;
      };

      recognition.onend = () => {
        _mockRecognition = null;
        if (wantsRecord && !hasError) {
          // 한 발화 처리 후 자동 재시작 (200ms 딜레이로 Chrome 안정화)
          setTimeout(startRec, 200);
          return;
        }
        wantsRecord = false;
        setRecStopped('🎤 다시 녹음');
        if (finalText.trim()) recActions.hidden = false;
      };

      recognition.onerror = (e) => {
        _mockRecognition = null;
        if (e.error === 'not-allowed') {
          hasError    = true;
          wantsRecord = false;
          setRecStopped('🎤 녹음 시작');
          recStatus.textContent = '⚠️ 마이크 권한을 허용해주세요.';
        } else if (e.error === 'network') {
          hasError    = true;
          wantsRecord = false;
          setRecStopped('🎤 녹음 시작');
          recStatus.textContent = '⚠️ 네트워크 오류. 인터넷 연결을 확인해주세요.';
        } else if (e.error === 'no-speech' || e.error === 'aborted') {
          // onend에서 재시작 처리
        } else {
          hasError    = true;
          wantsRecord = false;
          setRecStopped('🎤 녹음 시작');
          recStatus.textContent = `⚠️ 오류: ${e.error}`;
        }
      };

      try {
        recognition.start();
      } catch (err) {
        _mockRecognition = null;
        wantsRecord = false;
        setRecStopped('🎤 녹음 시작');
        recStatus.textContent = '⚠️ 녹음을 시작할 수 없어요.';
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
      recActions.hidden = true;
      transcript.innerHTML = '<p class="ff-mock__transcript-placeholder">🎙 말씀해주세요...</p>';
      startRec();
    };

    c.querySelector('#mock-download').onclick = () => {
      const content = `[면접 질문]\n${q.q}\n\n[내 답변]\n${finalText.trim()}\n\n생성: ${new Date().toLocaleString('ko-KR')}`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement('a'), { href: url, download: `면접답변_Q${_mockIdx + 1}_${new Date().toISOString().slice(0, 10)}.txt` });
      a.click();
      URL.revokeObjectURL(url);
    };

    c.querySelector('#mock-clear').onclick = () => {
      finalText = '';
      transcript.innerHTML = '<p class="ff-mock__transcript-placeholder">녹음 버튼을 누르고 답변을 말해보세요.</p>';
      recActions.hidden = true;
      recBtn.textContent = '🎤 녹음 시작';
    };
  }

  c.querySelector('#mock-prev').onclick = () => { _mockIdx--; renderMockInterview(c); };
  c.querySelector('#mock-next').onclick = () => { _mockIdx++; renderMockInterview(c); };
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

// ── 자격증 선택 ───────────────────────────────────────────────────────────────
let _certSearchText = '';
let _gradingCertId  = '';
let _resumeTab      = 'history';
let _portfolioTab   = 'projects';

function refreshCertGrid(c, cat) {
  const search = _certSearchText.trim().toLowerCase();
  const f = loadFeatures();
  const selIds = new Set(f.certs.selected || []);
  const gradedSel = f.certs.graded || {};
  const list = CERT_CATALOG.filter(x => (cat === 'all' || x.cat === cat) && (!search || x.name.toLowerCase().includes(search)));

  const infoEl = c.querySelector('#cert-search-info');
  if (infoEl) infoEl.textContent = search ? `${list.length}개 검색됨` : `총 ${CERT_CATALOG.length}종`;

  c.querySelectorAll('.ff-tab[data-ccat]').forEach(tabBtn => {
    const key = tabBtn.dataset.ccat;
    const ct = CERT_CATS.find(x => x.key === key);
    if (!ct) return;
    const cnt = CERT_CATALOG.filter(x => (key === 'all' || x.cat === key) && (!search || x.name.toLowerCase().includes(search))).length;
    tabBtn.textContent = ct.label;
    if (search && key !== 'all') {
      const badge = document.createElement('span');
      badge.className = 'ff-cert-tab-count';
      badge.textContent = cnt;
      tabBtn.appendChild(badge);
    }
  });

  const gridEl = c.querySelector('#cert-grid');
  if (!gridEl) return;
  gridEl.innerHTML = list.length
    ? list.map(cert => {
        const isGraded = !!cert.grades;
        const isSel = isGraded ? !!gradedSel[cert.id] : selIds.has(cert.id);
        const gradeLabel = isGraded && gradedSel[cert.id]
          ? (cert.grades.find(g => g.value === gradedSel[cert.id])?.label || '') : '';
        return `<button type="button"
                        class="ff-cert-chip${isSel ? ' ff-cert-chip--sel' : ''}${isGraded ? ' ff-cert-chip--graded' : ''}"
                        data-cert-id="${cert.id}">
          ${isSel ? '✓ ' : ''}${esc(cert.name)}${gradeLabel ? `<span class="ff-cert-chip-grade-badge"> ${esc(gradeLabel)}</span>` : ''}${isGraded ? '<span class="ff-cert-chip-arrow"> ▾</span>' : ''}
        </button>`;
      }).join('')
    : `<p class="ff-empty" style="padding:var(--space-24);font-size:var(--fs-12)">${search ? `"${esc(_certSearchText)}"에 해당하는 자격증이 없어요.` : '자격증이 없어요.'}</p>`;

  gridEl.querySelectorAll('.ff-cert-chip[data-cert-id]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.certId;
      const cert = CERT_CATALOG.find(x => x.id === id);
      if (!cert) return;
      if (cert.grades) { _gradingCertId = id; renderCertSelect(c, cat); return; }
      const f2 = loadFeatures();
      if (!f2.certs) f2.certs = { selected: [], graded: {}, custom: [] };
      const sel = new Set(f2.certs.selected || []);
      if (sel.has(id)) sel.delete(id); else sel.add(id);
      f2.certs.selected = [...sel];
      saveFeatures(f2);
      renderCertSelect(c, cat);
    };
  });
}

function renderCertSelect(c, activeCat) {
  const f = loadFeatures();
  if (!f.certs) f.certs = { selected: [], graded: {}, custom: [] };
  if (!f.certs.graded) f.certs.graded = {};

  const cat       = activeCat || 'all';
  const selIds    = new Set(f.certs.selected || []);
  const gradedSel = f.certs.graded;
  const total     = selIds.size + Object.keys(gradedSel).length + (f.certs.custom || []).length;

  // ── 왼쪽: 등급 선택 모드 or 카탈로그 모드
  let leftHTML;
  if (_gradingCertId) {
    const cert = CERT_CATALOG.find(x => x.id === _gradingCertId);
    const cur  = gradedSel[_gradingCertId] || '';
    leftHTML = `
      <button type="button" class="btn btn--ghost btn--sm" id="cert-grade-back">← 목록으로</button>
      <p class="ff-section__title" style="margin:var(--space-14) 0 var(--space-8)">${esc(cert.name)}</p>
      <p style="font-size:var(--fs-12);color:var(--ink3);margin-bottom:var(--space-14)">보유한 등급 또는 점수를 선택하세요</p>
      <div class="ff-cert-grade-list">
        ${(cert.grades || []).map(g => `
          <button type="button" class="ff-cert-grade-btn${cur === g.value ? ' ff-cert-grade-btn--sel' : ''}" data-grade-val="${g.value}">
            ${esc(g.label)}
          </button>`).join('')}
      </div>
      ${cur ? `<button type="button" class="btn btn--ghost btn--sm" id="cert-grade-clear" style="margin-top:var(--space-12)">선택 해제</button>` : ''}`;
  } else {
    const search = _certSearchText.trim().toLowerCase();
    const list   = CERT_CATALOG.filter(x => (cat === 'all' || x.cat === cat) && (!search || x.name.toLowerCase().includes(search)));
    leftHTML = `
      <p class="ff-section__title">자격증 카탈로그</p>
      <div class="ff-cert-search-wrap">
        <input type="text" id="cert-search-input" class="ff-input ff-cert-search-input"
               placeholder="🔍 자격증 이름 검색..."
               value="${esc(_certSearchText)}" autocomplete="off">
        <span class="ff-cert-search-info" id="cert-search-info">${search ? `${list.length}개 검색됨` : `총 ${CERT_CATALOG.length}종`}</span>
      </div>
      <div class="ff-tabs ff-tabs--wrap">
        ${CERT_CATS.map(ct => {
          const cnt = CERT_CATALOG.filter(x => (ct.key === 'all' || x.cat === ct.key) && (!search || x.name.toLowerCase().includes(search))).length;
          return `<button type="button" class="ff-tab${ct.key === cat ? ' ff-tab--active' : ''}" data-ccat="${ct.key}">${ct.label}${search && ct.key !== 'all' ? ` <span class="ff-cert-tab-count">${cnt}</span>` : ''}</button>`;
        }).join('')}
      </div>
      <div class="ff-cert-grid" id="cert-grid">
        ${list.length ? list.map(cert => {
          const isGraded   = !!cert.grades;
          const isSel      = isGraded ? !!gradedSel[cert.id] : selIds.has(cert.id);
          const gradeLabel = isGraded && gradedSel[cert.id]
            ? (cert.grades.find(g => g.value === gradedSel[cert.id])?.label || '')
            : '';
          return `<button type="button"
                          class="ff-cert-chip${isSel ? ' ff-cert-chip--sel' : ''}${isGraded ? ' ff-cert-chip--graded' : ''}"
                          data-cert-id="${cert.id}">
            ${isSel ? '✓ ' : ''}${esc(cert.name)}${gradeLabel ? `<span class="ff-cert-chip-grade-badge"> ${esc(gradeLabel)}</span>` : ''}${isGraded ? '<span class="ff-cert-chip-arrow"> ▾</span>' : ''}
          </button>`;
        }).join('') : `<p class="ff-empty" style="padding:var(--space-24);font-size:var(--fs-12)">${search ? `"${esc(_certSearchText)}"에 해당하는 자격증이 없어요.` : '자격증이 없어요.'}</p>`}
      </div>`;
  }

  // ── 오른쪽: 내 자격증 패널
  const myGraded  = CERT_CATALOG.filter(x => x.grades && gradedSel[x.id]);
  const myRegular = CERT_CATALOG.filter(x => !x.grades && selIds.has(x.id));

  c.innerHTML = `
    <div class="ff-cert-layout">
      <div class="ff-cert-catalog">${leftHTML}</div>
      <div class="ff-cert-my">
        <p class="ff-section__title">내 자격증 <span class="ff-saved-count">${total}개</span></p>
        <div class="ff-cert-my-chips">
          ${[
            ...myGraded.map(x => {
              const g = x.grades.find(gr => gr.value === gradedSel[x.id]);
              return `<span class="ff-cert-chip ff-cert-chip--sel">
                ${esc(x.name)}<span class="ff-cert-chip-grade-badge"> ${esc(g ? g.label : gradedSel[x.id])}</span>
                <button type="button" class="ff-cert-chip__del" data-graded-del="${x.id}" aria-label="삭제">×</button>
              </span>`;
            }),
            ...(f.certs.custom || []).map(x => `
              <span class="ff-cert-chip ff-cert-chip--sel">
                ${esc(x.name)}<button type="button" class="ff-cert-chip__del" data-custom-del="${x.id}" aria-label="삭제">×</button>
              </span>`),
            ...myRegular.map(x => `
              <span class="ff-cert-chip ff-cert-chip--sel">
                ${esc(x.name)}<button type="button" class="ff-cert-chip__del" data-cat-del="${x.id}" aria-label="삭제">×</button>
              </span>`)
          ].join('') || '<p class="ff-empty" style="padding:var(--space-14) 0;font-size:var(--fs-12)">카탈로그에서 자격증을 선택해보세요!</p>'}
        </div>
        <div class="ff-form" style="margin-top:var(--space-14)">
          <input id="cert-custom-input" class="ff-input ff-input--sm" placeholder="직접 입력 (예: TOEFL 110)">
          <button type="button" class="btn btn--outline btn--sm" id="cert-custom-add">추가</button>
        </div>
        ${total > 0 ? `
          <button type="button"
                  class="btn btn--primary btn--sm"
                  style="margin-top:var(--space-14);width:100%;justify-content:center;"
                  data-action="open-feature" data-feature="cert-recommend">
            🔍 직업 추천 받기 →
          </button>` : ''}
      </div>
    </div>`;

  // ── 이벤트: 등급 선택 모드
  if (_gradingCertId) {
    c.querySelector('#cert-grade-back').onclick = () => { _gradingCertId = ''; renderCertSelect(c, cat); };
    c.querySelectorAll('.ff-cert-grade-btn[data-grade-val]').forEach(btn => btn.onclick = () => {
      const f2 = loadFeatures();
      if (!f2.certs.graded) f2.certs.graded = {};
      const prev = f2.certs.graded[_gradingCertId];
      if (prev === btn.dataset.gradeVal) {
        delete f2.certs.graded[_gradingCertId];
      } else {
        f2.certs.graded[_gradingCertId] = btn.dataset.gradeVal;
      }
      saveFeatures(f2);
      const cert = CERT_CATALOG.find(x => x.id === _gradingCertId);
      T(f2.certs.graded[_gradingCertId] ? `✅ ${cert.name} (${btn.dataset.gradeVal}) 선택!` : `↩️ ${cert.name} 선택 해제`);
      _gradingCertId = '';
      renderCertSelect(c, cat);
    });
    const clearBtn = c.querySelector('#cert-grade-clear');
    if (clearBtn) clearBtn.onclick = () => {
      const f2 = loadFeatures();
      if (f2.certs.graded) delete f2.certs.graded[_gradingCertId];
      saveFeatures(f2);
      _gradingCertId = '';
      renderCertSelect(c, cat);
    };
    return;
  }

  // ── 이벤트: 카탈로그 모드
  const searchEl = c.querySelector('#cert-search-input');
  if (searchEl) {
    searchEl.addEventListener('input', (e) => {
      if (e.isComposing) return;
      _certSearchText = searchEl.value;
      refreshCertGrid(c, cat);
    });
    searchEl.addEventListener('compositionend', () => {
      _certSearchText = searchEl.value;
      refreshCertGrid(c, cat);
    });
    searchEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { _certSearchText = ''; searchEl.value = ''; refreshCertGrid(c, cat); }
    });
  }

  c.querySelectorAll('.ff-tab[data-ccat]').forEach(btn => btn.onclick = () => renderCertSelect(c, btn.dataset.ccat));

  c.querySelectorAll('.ff-cert-chip[data-cert-id]').forEach(btn => btn.onclick = () => {
    const id   = btn.dataset.certId;
    const cert = CERT_CATALOG.find(x => x.id === id);
    if (!cert) return;
    if (cert.grades) { _gradingCertId = id; renderCertSelect(c, cat); return; }
    const f2  = loadFeatures();
    if (!f2.certs) f2.certs = { selected: [], graded: {}, custom: [] };
    const sel = new Set(f2.certs.selected || []);
    if (sel.has(id)) sel.delete(id); else sel.add(id);
    f2.certs.selected = [...sel];
    saveFeatures(f2);
    renderCertSelect(c, cat);
  });

  c.querySelectorAll('[data-graded-del]').forEach(btn => btn.onclick = (e) => {
    e.stopPropagation();
    const f2 = loadFeatures();
    if (f2.certs && f2.certs.graded) delete f2.certs.graded[btn.dataset.gradedDel];
    saveFeatures(f2);
    renderCertSelect(c, cat);
  });

  c.querySelectorAll('[data-cat-del]').forEach(btn => btn.onclick = (e) => {
    e.stopPropagation();
    const f2 = loadFeatures();
    f2.certs.selected = (f2.certs.selected || []).filter(x => x !== btn.dataset.catDel);
    saveFeatures(f2);
    renderCertSelect(c, cat);
  });

  c.querySelectorAll('[data-custom-del]').forEach(btn => btn.onclick = (e) => {
    e.stopPropagation();
    const f2 = loadFeatures();
    f2.certs.custom = (f2.certs.custom || []).filter(x => x.id !== btn.dataset.customDel);
    saveFeatures(f2);
    renderCertSelect(c, cat);
  });

  c.querySelector('#cert-custom-add').onclick = () => {
    const input = c.querySelector('#cert-custom-input');
    const name  = input.value.trim();
    if (!name) return T('자격증명을 입력하세요.');
    const f2 = loadFeatures();
    if (!f2.certs) f2.certs = { selected: [], graded: {}, custom: [] };
    if (!f2.certs.custom) f2.certs.custom = [];
    f2.certs.custom.push({ id: genId(), name });
    saveFeatures(f2);
    T(`${name}을(를) 추가했어요!`);
    input.value = '';
    renderCertSelect(c, cat);
  };
}

// ── 자격증 기반 직업 추천 ──────────────────────────────────────────────────────
function calcCertJobRanking(selectedIds, gradedSel) {
  const scores = {};
  (selectedIds || []).forEach(certId => {
    const cert = CERT_CATALOG.find(x => x.id === certId && !x.grades);
    if (!cert) return;
    (cert.jobs || []).forEach(jobId => { scores[jobId] = (scores[jobId] || 0) + (cert.weight || 1); });
  });
  Object.entries(gradedSel || {}).forEach(([certId, gradeVal]) => {
    const cert = CERT_CATALOG.find(x => x.id === certId && x.grades);
    if (!cert) return;
    const grade = (cert.grades || []).find(g => g.value === gradeVal);
    if (!grade) return;
    (cert.jobs || []).forEach(jobId => { scores[jobId] = (scores[jobId] || 0) + (grade.weight || 1); });
  });
  const maxScore = Math.max(1, ...Object.values(scores));
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([jobId, score]) => {
      const job = JOB_CATALOG.find(j => j.id === jobId);
      const matchRegular = CERT_CATALOG.filter(cx => !cx.grades && (selectedIds || []).includes(cx.id) && cx.jobs.includes(jobId));
      const matchGraded  = CERT_CATALOG
        .filter(cx => cx.grades && (gradedSel || {})[cx.id] && cx.jobs.includes(jobId))
        .map(cx => ({ ...cx, name: `${cx.name} ${cx.grades.find(g => g.value === gradedSel[cx.id])?.label || ''}` }));
      return { job, score, matchCerts: [...matchRegular, ...matchGraded], pct: Math.round(score / maxScore * 100) };
    })
    .filter(x => x.job);
}

function renderCertRecommend(c) {
  const f = loadFeatures();
  if (!f.certs) f.certs = { selected: [], graded: {}, custom: [] };
  const selectedIds = f.certs.selected || [];
  const gradedSel   = f.certs.graded   || {};
  const customCerts = f.certs.custom   || [];
  const total = selectedIds.length + Object.keys(gradedSel).length + customCerts.length;

  if (!total) {
    c.innerHTML = `
      <div class="ff-ai-stub">
        <p class="ff-ai-stub__icon">🏅</p>
        <p class="ff-ai-stub__title">자격증을 먼저 선택해주세요</p>
        <p class="ff-ai-stub__desc">보유한 자격증을 입력하면<br>나에게 맞는 직업을 추천해드려요!</p>
        <button type="button" class="btn btn--primary" data-action="open-feature" data-feature="cert-select">자격증 선택하러 가기 →</button>
      </div>`;
    return;
  }

  const ranked = calcCertJobRanking(selectedIds, gradedSel);
  const myCertNames = [
    ...CERT_CATALOG.filter(x => x.grades && gradedSel[x.id]).map(x => {
      const g = x.grades.find(gr => gr.value === gradedSel[x.id]);
      return `${x.name} (${g ? g.label : ''})`;
    }),
    ...CERT_CATALOG.filter(x => !x.grades && selectedIds.includes(x.id)).map(x => x.name),
    ...customCerts.map(x => x.name),
  ];
  const rankEmoji = ['🥇','🥈','🥉','4위','5위'];

  c.innerHTML = `
    <div class="ff-cert-recommend">
      <div class="ff-cert-rec-header">
        <p class="ff-section__title">내 자격증 (${total}개)</p>
        <div class="ff-cert-my-chips">
          ${myCertNames.map(n => `<span class="ff-cert-chip ff-cert-chip--sel">${esc(n)}</span>`).join('')}
        </div>
        <button type="button" class="btn btn--ghost btn--sm" style="margin-top:var(--space-10)"
                data-action="open-feature" data-feature="cert-select">← 자격증 수정</button>
      </div>

      ${ranked.length ? `
        <p class="ff-section__title" style="margin-top:var(--space-24)">추천 직업 TOP ${ranked.length}</p>
        ${ranked.map((r, i) => `
          <div class="ff-cert-rec-card${i === 0 ? ' ff-cert-rec-card--rank1' : i === 1 ? ' ff-cert-rec-card--rank2' : ''}">
            <div class="ff-cert-rec-card__header">
              <span class="ff-cert-rec-card__rank">${rankEmoji[i]}</span>
              <div class="ff-cert-rec-card__info">
                <p class="ff-cert-rec-card__name">${esc(r.job.name)}</p>
                <p class="ff-cert-rec-card__desc">${esc(r.job.desc)}</p>
              </div>
              <span class="ff-cert-rec-card__pct">${r.pct}%</span>
            </div>
            <div class="progress-bar ff-cert-rec-card__bar" role="progressbar"
                 aria-valuenow="${r.pct}" aria-valuemin="0" aria-valuemax="100">
              <div class="progress-bar__fill progress-bar__fill--green" style="width:${r.pct}%"></div>
            </div>
            ${r.matchCerts.length ? `
              <div class="ff-cert-rec-card__certs">
                <span class="ff-cert-rec-card__certs-label">매칭 자격증</span>
                ${r.matchCerts.map(mc => `<span class="tag tag--green">${esc(mc.name)}</span>`).join('')}
              </div>` : ''}
          </div>`).join('')}` : `
        <div class="ff-ai-stub" style="margin-top:var(--space-20)">
          <p class="ff-ai-stub__icon">🤔</p>
          <p class="ff-ai-stub__title">매칭되는 직업이 없어요</p>
          <p class="ff-ai-stub__desc">현재 자격증만으로는 직업을 추천하기 어려워요.<br>더 다양한 자격증을 추가해보세요!</p>
        </div>`}
    </div>`;
}

// ── JOB_FEATURES 레지스트리 (job.js가 참조) ──────────────────────────────
const JOB_FEATURES = {
  'cert-select':         { title: '자격증 선택',       render: renderCertSelect },
  'cert-recommend':      { title: '직업 추천',         render: renderCertRecommend },
  'interests':           { title: '관심 직무 조사',    render: renderInterests },
  'aptitude':            { title: '직무 적성 체크',    render: renderAptitude },
  'industry':            { title: '업계 분석',         render: renderIndustry },
  'spec-guide':          { title: '직무별 스펙 가이드', render: renderSpecGuide },
  'resume-builder':      { title: '이력서 작성',       render: renderResumeBuilder },
  'portfolio-builder':   { title: '포트폴리오',        render: renderPortfolioBuilder },
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
