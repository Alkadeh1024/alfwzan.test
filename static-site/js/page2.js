/* page2.js — activities (upcoming / current / past) with live countdown */
(async function () {
  await bootCommon();
  renderActivities();
  setInterval(updateCountdowns, 1000);
})();

function activityEnd(a) {
  if (a.end) return new Date(a.end).getTime();
  // default: 24 hours after start
  return new Date(a.start).getTime() + 24 * 3600 * 1000;
}

function renderActivities() {
  const items = (Store.data.activities || []).slice().sort((a, b) => new Date(a.start) - new Date(b.start));
  const now = Date.now();
  const upcoming = items.filter(a => new Date(a.start).getTime() > now);
  const current  = items.filter(a => new Date(a.start).getTime() <= now && activityEnd(a) > now);
  const past     = items.filter(a => activityEnd(a) <= now).reverse();
  fill('upcomingGrid', 'upEmpty', upcoming.map(renderUpcomingCard).join(''));
  fill('currentGrid',  'curEmpty', current.map(renderCurrentCard).join(''));
  fill('pastGrid',     'pastEmpty', past.map(renderPastCard).join(''));
}
function fill(gridId, emptyId, html) {
  const g = document.getElementById(gridId), e = document.getElementById(emptyId);
  if (!g) return;
  g.innerHTML = html;
  if (e) e.style.display = html ? 'none' : 'block';
}

function renderUpcomingCard(a) {
  return `<article class="activity-card upcoming" data-testid="act-upcoming-${a.id}">
    <h3>${escapeHtml(a.title)}</h3>
    <div class="meta"><span>${t('page2.starts')} ${formatDateTime(a.start)}</span></div>
    ${a.description ? `<p class="desc">${escapeHtml(a.description)}</p>` : ''}
    <div class="countdown" data-target="${a.start}" data-testid="countdown-${a.id}">
      <div class="unit"><span class="num" data-d>0</span><span class="label">${t('page2.cd.day')}</span></div>
      <div class="unit"><span class="num" data-h>0</span><span class="label">${t('page2.cd.hour')}</span></div>
      <div class="unit"><span class="num" data-m>0</span><span class="label">${t('page2.cd.min')}</span></div>
      <div class="unit"><span class="num" data-s>0</span><span class="label">${t('page2.cd.sec')}</span></div>
    </div>
  </article>`;
}
function renderCurrentCard(a) {
  return `<article class="activity-card" data-testid="act-current-${a.id}">
    <span class="live-badge">${t('page2.live')}</span>
    <h3 style="margin-top:10px">${escapeHtml(a.title)}</h3>
    <div class="meta"><span>${t('page2.started')} ${formatDateTime(a.start)}</span></div>
    ${a.description ? `<p class="desc">${escapeHtml(a.description)}</p>` : ''}
  </article>`;
}
function renderPastCard(a) {
  return `<article class="activity-card past" data-testid="act-past-${a.id}">
    <h3>${escapeHtml(a.title)}</h3>
    <div class="meta"><span>${t('page2.ended')} ${formatDateTime(activityEnd(a))}</span></div>
    ${a.description ? `<p class="desc">${escapeHtml(a.description)}</p>` : ''}
  </article>`;
}

function updateCountdowns() {
  let recalc = false;
  document.querySelectorAll('.countdown[data-target]').forEach(c => {
    const t = new Date(c.dataset.target).getTime();
    let diff = Math.max(0, t - Date.now());
    const d = Math.floor(diff / 86400000); diff -= d * 86400000;
    const h = Math.floor(diff / 3600000);  diff -= h * 3600000;
    const m = Math.floor(diff / 60000);    diff -= m * 60000;
    const s = Math.floor(diff / 1000);
    c.querySelector('[data-d]').textContent = d;
    c.querySelector('[data-h]').textContent = String(h).padStart(2, '0');
    c.querySelector('[data-m]').textContent = String(m).padStart(2, '0');
    c.querySelector('[data-s]').textContent = String(s).padStart(2, '0');
    if (t - Date.now() <= 0) recalc = true;
  });
  if (recalc) renderActivities();
}
