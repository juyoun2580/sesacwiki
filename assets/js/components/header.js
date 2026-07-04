// ── Header Component Loader — components/header.html을 #header-mount에 주입한다 ──
function loadHeader() {
  const mount = document.getElementById('header-mount');
  if (!mount) return Promise.resolve();

  return fetch('/components/header.html')
    .then((res) => res.text())
    .then((html) => {
      mount.innerHTML = html;
    });
}
