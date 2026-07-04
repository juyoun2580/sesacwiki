// ── Supabase 클라이언트 초기화 — 번들러 없이 CDN(UMD) 빌드로 로드해 정적 페이지에서 바로 사용 ──
// publishable key는 RLS(Row Level Security)로 보호되는 공개 키라 브라우저에 노출돼도 안전하다.
// service_role/secret key는 RLS를 우회하므로 이 파일을 포함한 어떤 프론트엔드 코드에도 절대 넣지 않는다.
const SUPABASE_URL = "https://knmyqqldaabcuxdluunz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_EsFSFV9LhiXcS6Hne8wYUQ_tBLSCPHr";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
