// ── Profile Avatar 공용 컴포넌트 ──
// Header(.user-chip__avatar), 마이페이지 대시보드(#profile-avatar), 프로필 수정
// 미리보기(#avatar-preview)가 각자 avatarUrl을 따로 읽고 그리던 것을 이 파일 하나로
// 합친다. Source of Truth는 Supabase profiles.avatar_url(api.getProfile()) 하나뿐이다.
// 아직 별도 Storage 버킷은 없어 avatarUrl 자체에 FileReader dataURL을 그대로 저장한다
// (기존 방식 그대로 — api.saveProfile()의 avatarUrl 컬럼 매핑을 그대로 재사용).

const PROFILE_AVATAR_FALLBACK = '/assets/img/profile-sample.png';

// avatar_url이 null/""/undefined인 모든 경우에 기본 이미지로 떨어진다.
function getProfileAvatarUrl(profile) {
  return (profile && profile.avatarUrl) ? profile.avatarUrl : PROFILE_AVATAR_FALLBACK;
}

// container 자신이 <img>이거나, container 안에 <img>가 있으면 그 src만 바꾼다.
// innerHTML을 통째로 다시 쓰지 않아 다른 속성(class 등)을 건드리지 않는다.
function setProfileAvatar(container, profile) {
  if (!container) return;
  const img = container.tagName === 'IMG' ? container : container.querySelector('img');
  if (!img) return;
  img.src = getProfileAvatarUrl(profile);
}

// api.getProfile() 결과를 페이지 안에서 캐싱해 여러 곳에서 호출해도 중복 요청하지 않는다.
// force:true면 캐시를 무시하고 다시 가져온다(저장 직후 등).
let profilePromiseCache = null;
async function loadProfile({ force = false } = {}) {
  if (typeof isLoggedIn !== 'function' || !isLoggedIn()) return null;
  if (force || !profilePromiseCache) {
    profilePromiseCache = api.getProfile();
  }
  try {
    return await profilePromiseCache;
  } catch (err) {
    profilePromiseCache = null;
    throw err;
  }
}

// Header / 마이페이지 대시보드 / 프로필 수정 미리보기 중 현재 페이지에 실제로 있는
// 요소만 골라 전부 같은 값으로 갱신한다. 없는 페이지의 요소는 조용히 건너뛴다.
async function refreshProfileUI({ force = false } = {}) {
  const profile = await loadProfile({ force });
  setProfileAvatar(document.querySelector('.user-chip__avatar'), profile);
  setProfileAvatar(document.getElementById('profile-avatar'), profile);
  setProfileAvatar(document.getElementById('avatar-preview'), profile);
}

// 파일 선택 → Supabase 저장 → Header/MyPage/Edit 갱신까지 한 번에 처리한다.
// 실패하면 그대로 던지므로 호출부에서 toast로 안내한다.
async function updateProfileAvatar(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('이미지를 읽지 못했어요.'));
    reader.readAsDataURL(file);
  });

  await api.saveProfile({ avatarUrl: dataUrl });
  await refreshProfileUI({ force: true });
}
