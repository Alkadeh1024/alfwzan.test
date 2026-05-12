/* index.js — home page */
(async function () {
  await bootCommon();
  renderAboutGallery();
})();

function renderAboutGallery() {
  const grid = document.getElementById('aboutGallery');
  if (!grid) return;
  const items = Store.data.aboutMedia || [];
  if (!items.length) {
    grid.innerHTML = `<div class="gallery-empty">يضيف المشرف هنا صور وفيديوهات تعريفية بالمركز.</div>`;
    return;
  }
  grid.innerHTML = items.map((m, i) => {
    const isVideo = m.type === 'video';
    const isYT = isVideo && (m.src.includes('youtube.com') || m.src.includes('youtu.be'));
    let media;
    if (isVideo) {
      if (isYT) {
        media = `<img src="https://img.youtube.com/vi/${ytGet(m.src)}/hqdefault.jpg" alt=""/><div class="play-overlay">▶</div>`;
      } else {
        media = `<video src="${escapeHtml(m.src)}" muted></video><div class="play-overlay">▶</div>`;
      }
    } else {
      media = `<img src="${escapeHtml(m.src)}" alt="${escapeHtml(m.caption||'')}"/>`;
    }
    return `<div class="media-item" data-testid="about-media-${i}" data-i="${i}">
      ${media}
      ${m.caption ? `<div class="caption">${escapeHtml(m.caption)}</div>` : ''}
    </div>`;
  }).join('');
  grid.querySelectorAll('.media-item').forEach(el => {
    el.addEventListener('click', () => {
      const i = +el.dataset.i;
      openLightbox(items[i]);
    });
  });
}

function ytGet(url) {
  const m = url.match(/(?:youtube\.com\/.*[?&]v=|youtu\.be\/|youtube\.com\/embed\/)([^?&]+)/);
  return m ? m[1] : '';
}
