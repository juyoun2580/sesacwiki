// ── Supabase 데이터 접근 공용 모듈 ──
// mypage.js/wiki.js/highlight.js/exam.js/quiz.js/home.js가 각자 같은 쿼리를
// 중복 구현하지 않도록 테이블별 CRUD를 여기 한 곳에 모은다.
// auth.js가 인증 쪽 단일 창구인 것과 같은 역할을 데이터 쪽에서 담당한다.

async function getCurrentUserId() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) throw new Error("로그인이 필요해요.");
  return session.user.id;
}

// ── profiles ──
async function getProfile() {
  const userId = await getCurrentUserId();
  const { data: { session } } = await supabaseClient.auth.getSession();

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;

  return {
    name: data?.name ?? "",
    username: data?.username ?? "",
    githubUsername: data?.github_username ?? "",
    language: data?.language ?? "",
    avatarUrl: data?.avatar_url ?? "",
    isMarketingAgreed: data?.marketing_opt_in ?? false,
    email: session.user.email ?? "",
  };
}

async function saveProfile(patch) {
  const userId = await getCurrentUserId();
  const row = { id: userId, updated_at: new Date().toISOString() };
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.username !== undefined) row.username = patch.username;
  if (patch.githubUsername !== undefined) row.github_username = patch.githubUsername;
  if (patch.language !== undefined) row.language = patch.language;
  if (patch.avatarUrl !== undefined) row.avatar_url = patch.avatarUrl;
  if (patch.isMarketingAgreed !== undefined) row.marketing_opt_in = patch.isMarketingAgreed;

  const { error } = await supabaseClient.from("profiles").upsert(row);
  if (error) throw error;
  return getProfile();
}

// 로그인 이메일 변경은 profiles가 아니라 Supabase Auth 계정 자체를 바꿔야 한다
// (재확인 메일이 발송된다).
async function updateEmail(email) {
  const { error } = await supabaseClient.auth.updateUser({ email });
  if (error) throw error;
}

// 비밀번호 변경도 updateEmail과 동일하게 Supabase Auth 계정 자체를 바꾼다(profiles 테이블과 무관).
async function updatePassword(password) {
  const { error } = await supabaseClient.auth.updateUser({ password });
  if (error) throw error;
}

// ── badges ──
async function getBadges() {
  const userId = await getCurrentUserId();
  const { data, error } = await supabaseClient
    .from("badges")
    .select("badge_id, unlocked")
    .eq("user_id", userId);
  if (error) throw error;

  const state = {};
  (data || []).forEach((row) => { state[row.badge_id] = row.unlocked; });
  return state;
}

async function unlockBadge(badgeId) {
  const userId = await getCurrentUserId();
  const current = await getBadges();
  if (current[badgeId]) return false;

  const { error } = await supabaseClient
    .from("badges")
    .upsert({ user_id: userId, badge_id: badgeId, unlocked: true, unlocked_at: new Date().toISOString() });
  if (error) throw error;
  return true;
}

// ── quiz_checkpoints ──
async function getQuizCheckpoints() {
  const userId = await getCurrentUserId();
  const { data, error } = await supabaseClient
    .from("quiz_checkpoints")
    .select("checkpoint_id, done")
    .eq("user_id", userId);
  if (error) throw error;

  const state = {};
  (data || []).forEach((row) => { state[row.checkpoint_id] = row.done; });
  return state;
}

async function toggleQuizCheckpoint(checkpointId) {
  const userId = await getCurrentUserId();
  const current = await getQuizCheckpoints();
  const next = !current[checkpointId];

  const { error } = await supabaseClient
    .from("quiz_checkpoints")
    .upsert({ user_id: userId, checkpoint_id: checkpointId, done: next, updated_at: new Date().toISOString() });
  if (error) throw error;
  return next;
}

// ── words (저장한 단어) ──
function mapWordRow(row) {
  return {
    id: row.id,
    term: row.term,
    pos: row.pos,
    definition: row.definition,
    example: row.example,
    category: row.category,
    categoryColor: row.category_color,
    favorite: row.favorite,
    date: row.created_at.slice(0, 10).replace(/-/g, "."),
  };
}

async function getWords() {
  const userId = await getCurrentUserId();
  const { data, error } = await supabaseClient
    .from("words")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapWordRow);
}

async function addWord(word) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabaseClient
    .from("words")
    .insert({
      user_id: userId,
      term: word.term,
      pos: word.pos,
      definition: word.definition,
      example: word.example,
      category: word.category,
      category_color: word.categoryColor,
      favorite: !!word.favorite,
    })
    .select()
    .single();
  if (error) throw error;
  return mapWordRow(data);
}

async function updateWord(id, patch) {
  const userId = await getCurrentUserId();
  const row = {};
  if (patch.term !== undefined) row.term = patch.term;
  if (patch.pos !== undefined) row.pos = patch.pos;
  if (patch.definition !== undefined) row.definition = patch.definition;
  if (patch.example !== undefined) row.example = patch.example;
  if (patch.category !== undefined) row.category = patch.category;
  if (patch.categoryColor !== undefined) row.category_color = patch.categoryColor;
  if (patch.favorite !== undefined) row.favorite = patch.favorite;

  const { data, error } = await supabaseClient
    .from("words")
    .update(row)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return mapWordRow(data);
}

async function deleteWord(id) {
  const userId = await getCurrentUserId();
  const { error } = await supabaseClient
    .from("words")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

// ── wiki_bookmarks ──
async function getWikiBookmarks() {
  const userId = await getCurrentUserId();
  const { data, error } = await supabaseClient
    .from("wiki_bookmarks")
    .select("wiki_id")
    .eq("user_id", userId);
  if (error) throw error;
  return (data || []).map((row) => row.wiki_id);
}

async function toggleWikiBookmark(wikiId) {
  const userId = await getCurrentUserId();
  const { data: existing, error: selectError } = await supabaseClient
    .from("wiki_bookmarks")
    .select("wiki_id")
    .eq("user_id", userId)
    .eq("wiki_id", wikiId)
    .maybeSingle();
  if (selectError) throw selectError;

  if (existing) {
    const { error } = await supabaseClient
      .from("wiki_bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("wiki_id", wikiId);
    if (error) throw error;
    return false;
  }

  const { error } = await supabaseClient
    .from("wiki_bookmarks")
    .insert({ user_id: userId, wiki_id: wikiId });
  if (error) throw error;
  return true;
}

// ── wiki_recent_views ──
async function getRecentWikiViews() {
  const userId = await getCurrentUserId();
  const { data, error } = await supabaseClient
    .from("wiki_recent_views")
    .select("wiki_id, visited_at")
    .eq("user_id", userId)
    .order("visited_at", { ascending: false })
    .limit(10);
  if (error) throw error;
  return (data || []).map((row) => ({ wikiId: row.wiki_id, visitedAt: row.visited_at }));
}

async function addRecentWikiView(wikiId) {
  const userId = await getCurrentUserId();
  const { error } = await supabaseClient
    .from("wiki_recent_views")
    .upsert({ user_id: userId, wiki_id: wikiId, visited_at: new Date().toISOString() });
  if (error) throw error;
}

// ── wiki_highlights ──
async function getWikiHighlights(wikiId) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabaseClient
    .from("wiki_highlights")
    .select("highlights")
    .eq("user_id", userId)
    .eq("wiki_id", wikiId)
    .maybeSingle();
  if (error) throw error;
  return data?.highlights ?? [];
}

async function saveWikiHighlights(wikiId, highlights) {
  const userId = await getCurrentUserId();
  const { error } = await supabaseClient
    .from("wiki_highlights")
    .upsert({ user_id: userId, wiki_id: wikiId, highlights, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// ── exam_attempts ──
async function getExamAttempts() {
  const userId = await getCurrentUserId();
  const { data, error } = await supabaseClient
    .from("exam_attempts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;

  return (data || []).map((row) => ({
    examId: row.exam_id,
    title: row.title,
    icon: row.icon,
    score: row.score,
    pointsEarned: row.points_earned,
    date: row.created_at.slice(0, 10),
    wrongQuestionIds: row.wrong_question_ids || [],
  }));
}

async function saveExamAttempt(attempt) {
  const userId = await getCurrentUserId();
  const { error } = await supabaseClient.from("exam_attempts").insert({
    user_id: userId,
    exam_id: attempt.examId,
    title: attempt.title,
    icon: attempt.icon,
    score: attempt.score,
    points_earned: attempt.pointsEarned,
    wrong_question_ids: attempt.wrongQuestionIds || [],
  });
  if (error) throw error;
}

// ── job_progress (job.js: job_data / job-features.js: job_features) ──
async function getJobProgress() {
  const userId = await getCurrentUserId();
  const { data, error } = await supabaseClient
    .from("job_progress")
    .select("job_data, job_features")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return { jobData: data?.job_data ?? null, jobFeatures: data?.job_features ?? null };
}

async function saveJobProgress(patch) {
  const userId = await getCurrentUserId();
  const row = { user_id: userId, updated_at: new Date().toISOString() };
  if (patch.jobData !== undefined) row.job_data = patch.jobData;
  if (patch.jobFeatures !== undefined) row.job_features = patch.jobFeatures;

  const { error } = await supabaseClient.from("job_progress").upsert(row);
  if (error) throw error;
}

// ── Public API ──
window.api = {
  getProfile,
  saveProfile,
  updateEmail,
  updatePassword,
  getBadges,
  unlockBadge,
  getQuizCheckpoints,
  toggleQuizCheckpoint,
  getWords,
  addWord,
  updateWord,
  deleteWord,
  getWikiBookmarks,
  toggleWikiBookmark,
  getRecentWikiViews,
  addRecentWikiView,
  getWikiHighlights,
  saveWikiHighlights,
  getExamAttempts,
  saveExamAttempt,
  getJobProgress,
  saveJobProgress,
};
