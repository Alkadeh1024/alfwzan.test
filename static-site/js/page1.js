/* page1.js — achievements categorized */
(async function () {
  await bootCommon();
  renderAchievements();
})();

const CATS = [
  { key: 'certificates', container: 'achCert', empty: 'achCertEmpty' },
  { key: 'honors',       container: 'achHonor', empty: 'achHonorEmpty' },
  { key: 'programs',     container: 'achProgram', empty: 'achProgramEmpty' }
];

function renderAchievements() {
  const all = Store.data.achievements || [];
  CATS.forEach(c => {
    const items = all.filter(a => (a.category || 'certificates') === c.key);
    const grid = document.getElementById(c.container);
    const empty = document.getElementById(c.empty);
    if (!grid) return;
    if (!items.length) { grid.innerHTML = ''; if (empty) empty.style.display = 'block'; return; }
    if (empty) empty.style.display = 'none';
    grid.innerHTML = items.map((it, i) => renderCard(it, i, c.key)).join('');
    grid.querySelectorAll('.gallery-media').forEach(el => {
      el.addEventListener('click', () => {
        const it = items[+el.dataset.i];
        openLightbox({ type: it.type, src: it.src, caption: it.title || it.description });
      });
    });
  });
}

function renderCard(it, i, cat) {
  const isVideo = it.type === 'video';
  const isYT = isVideo && (it.src.includes('youtube.com') || it.src.includes('youtu.be'));
  let media;
  if (isVideo) {
    if (isYT) {
      media = `<img src="https://img.youtube.com/vi/${ytGet(it.src)}/hqdefault.jpg" alt=""/><div class="play-overlay">▶</div>`;
    } else {
      media = `<video src="${escapeHtml(it.src)}" muted></video><div class="play-overlay">▶</div>`;
    }
  } else {
    media = `<img src="${escapeHtml(it.src)}" alt="${escapeHtml(it.title||'')}"/>`;
  }
  return `<article class="gallery-card" data-testid="ach-${cat}-${i}">
    <div class="gallery-media" data-i="${i}">${media}</div>
    <div class="gallery-body">
      <h3>${escapeHtml(it.title || '—')}</h3>
      ${it.description ? `<p>${escapeHtml(it.description)}</p>` : ''}
    </div>
  </article>`;
}
function ytGet(url) {
  const m = url.match(/(?:youtube\.com\/.*[?&]v=|youtu\.be\/|youtube\.com\/embed\/)([^?&]+)/);
  return m ? m[1] : '';
}
