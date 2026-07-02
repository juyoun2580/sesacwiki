// ── 새 이력서 모달 열기/닫기 ──
const createModal = document.getElementById('resume-create-modal');

document.querySelectorAll('[data-open="resume-create-modal"]').forEach(btn => {
  btn.addEventListener('click', () => {
    createModal.classList.add('modal-overlay--visible');
  });
});

document.getElementById('resume-create-cancel').addEventListener('click', () => {
  createModal.classList.remove('modal-overlay--visible');
});

createModal.addEventListener('click', e => {
  if (e.target === createModal) createModal.classList.remove('modal-overlay--visible');
});

document.getElementById('resume-create-confirm').addEventListener('click', () => {
  const title = document.getElementById('resume-title').value.trim();
  if (!title) {
    document.getElementById('resume-title').focus();
    return;
  }
  createModal.classList.remove('modal-overlay--visible');
  toast('새 이력서가 생성됐어요! 이제 작성을 시작해보세요 ✏️');
});

// ── 필터 탭 → 이력서 목록 필터링 ──
const resumeList = document.getElementById('resume-list');

document.querySelectorAll('[data-filter]').forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    resumeList.querySelectorAll('[data-status]').forEach(item => {
      const match = filter === 'all' || item.dataset.status === filter;
      item.hidden = !match;
    });
  });
});
