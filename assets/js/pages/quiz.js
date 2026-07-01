// ── 객관식 선택 (원본 selCho() 로직 그대로) ──
function selCho(el) {
  el.closest('.quiz-question').querySelectorAll('.choice').forEach(c => c.classList.remove('choice--selected'));
  el.classList.add('choice--selected');
}

document.querySelectorAll('.choice').forEach(el => {
  el.addEventListener('click', () => selCho(el));
});

// ── 모의고사 타이머 (원본 로직 그대로) ──
// MPA 전환: quiz.js는 quiz.html뿐 아니라 mywords.html(단어 퀴즈 선택지 토글)에서도 로드되므로
// #quiz 요소가 없는 페이지에서 에러 없이 동작하도록 옵셔널 체이닝을 사용한다.
let timerSec = 444;
setInterval(() => {
  if (document.getElementById('quiz')?.classList.contains('page--active')) {
    timerSec = Math.max(0, timerSec - 1);
    const el = document.getElementById('timer');
    if (el) el.textContent =
      String(Math.floor(timerSec / 60)).padStart(2, '0') + ':' +
      String(timerSec % 60).padStart(2, '0');
  }
}, 1000);

// ── 단어 퀴즈 옵션 선택 (원본은 인라인 style로 토글 → 동일한 시각 결과를 내는 클래스 토글로 교체) ──
document.querySelectorAll('.word-quiz__option').forEach(opt => {
  opt.addEventListener('click', function () {
    document.querySelectorAll('.word-quiz__option').forEach(o => o.classList.remove('word-quiz__option--selected'));
    this.classList.add('word-quiz__option--selected');
  });
});
