// ── 즐겨찾기 토글 (원본 ts() 로직 그대로) ──
// 원본의 일부 즐겨찾기 별은 onclick="ts(this);toast('고정 문구')" 처럼 토글 상태와
// 무관하게 항상 같은 문구를 보여줬다(myfav 목록 등). data-toast-override 속성으로 재현한다.
function ts(el) {
  const isOn = el.classList.toggle('favorite-star--on');
  el.setAttribute('aria-pressed', String(isOn));
  const message = el.dataset.toastOverride || (isOn ? '★ 즐겨찾기에 저장했어요!' : '즐겨찾기를 해제했어요.');
  toast(message);
}

document.querySelectorAll('.favorite-star').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    ts(btn);
  });
});

// ── 필터 탭 (원본 로직 그대로) ──
document.querySelectorAll('.filter-tabs').forEach(g => {
  g.querySelectorAll('.filter-tab').forEach(b => b.addEventListener('click', () => {
    g.querySelectorAll('.filter-tab').forEach(x => x.classList.remove('filter-tab--active'));
    b.classList.add('filter-tab--active');
  }));
});

// ── 정렬 필 (원본 로직 그대로, closest('div') 대신 명시적 그룹 클래스 사용) ──
document.querySelectorAll('.sort-pill').forEach(b => b.addEventListener('click', () => {
  b.closest('.sort-pills').querySelectorAll('.sort-pill').forEach(x => x.classList.remove('sort-pill--active'));
  b.classList.add('sort-pill--active');
}));

// ── 사이드바 (다른 페이지로 이동하는 항목(<a> 링크)은 활성 토글 대상에서 제외) ──
document.querySelectorAll('.sidebar__item').forEach(b => {
  if (b.tagName === 'A') return;
  b.addEventListener('click', function () {
    this.closest('.sidebar').querySelectorAll('.sidebar__item').forEach(x => x.classList.remove('sidebar__item--active'));
    this.classList.add('sidebar__item--active');
  });
});

// ── TOC ──
document.querySelectorAll('.toc__item').forEach(el => {
  el.addEventListener('click', () => {
    document.querySelectorAll('.toc__item').forEach(x => x.classList.remove('toc__item--active'));
    el.classList.add('toc__item--active');
  });
});
