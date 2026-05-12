/* page3.js — student search */
(async function () {
  await bootCommon();
  renderTodayStrip();
  bindSearch();
  showInitialHint();
})();

function renderTodayStrip() {
  const el = document.getElementById('todayStrip');
  if (!el) return;
  const d = new Date();
  el.innerHTML = `${formatGregorian(d)} <span class="hijri-sep">/</span> ${formatHijri(d)}`;
}

function showInitialHint() {
  const root = document.getElementById('results');
  if (root) root.innerHTML = `<div class="empty-state">${t('page3.hint')}</div>`;
  const det = document.getElementById('studentDetail');
  if (det) det.innerHTML = '';
}

function bindSearch() {
  const btn = document.getElementById('searchBtn');
  const reset = document.getElementById('resetBtn');
  if (btn) btn.addEventListener('click', doSearch);
  if (reset) reset.addEventListener('click', () => {
    ['qSerial', 'qName'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    showInitialHint();
  });
  ['qSerial', 'qName'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keypress', e => { if (e.key === 'Enter') doSearch(); });
  });
}

function doSearch() {
  const sQ = document.getElementById('qSerial').value.trim().toLowerCase();
  const nQ = document.getElementById('qName').value.trim().toLowerCase();
  if (!sQ && !nQ) {
    document.getElementById('results').innerHTML = `<div class="empty-state">${t('page3.hint.required')}</div>`;
    document.getElementById('studentDetail').innerHTML = '';
    return;
  }
  const list = (Store.data.students || []).filter(s => {
    const okS = !sQ || (s.serial || '').toLowerCase().includes(sQ);
    const okN = !nQ || (s.name || '').toLowerCase().includes(nQ);
    return okS && okN;
  });
  renderResults(list);
  document.getElementById('studentDetail').innerHTML = '';
}

function renderResults(list) {
  const root = document.getElementById('results');
  if (!root) return;
  if (!list.length) { root.innerHTML = `<div class="empty-state">${t('page3.no.results')}</div>`; return; }
  const halaqat = Store.data.halaqat || [];
  root.innerHTML = list.map(s => {
    const h = halaqat.find(x => x.id === s.halaqaId);
    return `<div class="student-card" data-id="${s.id}" data-testid="student-${s.serial}">
      <h3>${escapeHtml(s.name)}</h3>
      <p>${t('page3.serial.lbl')} <b>${escapeHtml(s.serial)}</b></p>
      <p>${t('page3.halaqa.lbl')} ${escapeHtml(h ? h.name : '—')}</p>
      ${s.grade ? `<p>الصف: <b>${escapeHtml(s.grade)}</b></p>` : ''}
      ${h ? `<span class="badge">${escapeHtml(h.level)}</span>` : ''}
    </div>`;
  }).join('');
  root.querySelectorAll('.student-card').forEach(el => {
    el.addEventListener('click', () => showStudent(el.dataset.id));
  });
}

function showStudent(id) {
  const s = (Store.data.students || []).find(x => x.id === id);
  if (!s) return;
  const halaqat = Store.data.halaqat || [];
  const h = halaqat.find(x => x.id === s.halaqaId);
  const detail = document.getElementById('studentDetail');
  const days = weekDays(new Date());
  const att = s.attendance || {};
  const rows = days.map((d, i) => {
    const key = isoDate(d);
    const rec = att[key] || {};
    const presTag = rec.present === true ? `<span class="tag present">${t('tag.present')}</span>` :
                    rec.present === false ? `<span class="tag absent">${t('tag.absent')}</span>` :
                    '<span class="tag none">—</span>';
    const gReview = rec.gradeReview;
    const gHifz = rec.gradeHifz != null ? rec.gradeHifz : rec.grade;
    const revTag = gReview ? `<span class="tag ${gradeClass(gReview)}">${escapeHtml(gReview)}</span>` : '<span class="tag none">—</span>';
    const hifzTag = gHifz ? `<span class="tag ${gradeClass(gHifz)}">${escapeHtml(gHifz)}</span>` : '<span class="tag none">—</span>';
    return `<div class="attendance-row">
      <span class="day-name">${t('day.' + i)}<br><small style="color:var(--muted)">${formatGregorian(d)}<br>${formatHijri(d)}</small></span>
      <span>${presTag}</span>
      <span>${revTag}</span>
      <span>${hifzTag}</span>
    </div>`;
  }).join('');
  detail.innerHTML = `<div class="detail-panel" data-testid="detail-${s.serial}">
    <div class="detail-head">
      <div>
        <h2>${escapeHtml(s.name)}</h2>
        <div class="detail-info">
          <span>${t('page3.serial.lbl')} <b>${escapeHtml(s.serial)}</b></span>
          <span>${t('page3.halaqa.lbl')} <b>${escapeHtml(h ? h.name : '—')}</b></span>
          ${h ? `<span>${t('page3.stage.lbl')} <b>${escapeHtml(h.level)}</b></span>` : ''}
          ${s.grade ? `<span>الصف: <b>${escapeHtml(s.grade)}</b></span>` : ''}
        </div>
      </div>
    </div>
    <div class="attendance-week">
      <h3>${t('page3.week.title')}</h3>
      <div class="attendance-row attendance-head">
        <span>${t('page3.col.day')}</span><span>${t('page3.col.att')}</span><span>${t('page3.col.rev')}</span><span>${t('page3.col.hifz')}</span>
      </div>
      ${rows}
    </div>
  </div>`;
  detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function gradeClass(g) {
  switch (g) {
    case 'ممتاز': return 'g-mumtaz';
    case 'جيد جدا': case 'جيد جداً': return 'g-jvg';
    case 'جيد': return 'g-jyd';
    case 'مقبول': return 'g-maq';
    case 'لم يحفظ': return 'g-no';
    default: return 'none';
  }
}
function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function weekDays(today) {
  const t = new Date(today);
  const day = t.getDay();
  const sun = new Date(t); sun.setDate(t.getDate() - day);
  const out = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(sun); d.setDate(sun.getDate() + i);
    out.push(d);
  }
  return out;
}
