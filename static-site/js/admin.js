/* admin.js — admin & sheikh dashboards */
(async function () {
  await bootCommon();

  // If already logged in, jump straight to the right dashboard
  const cur = Auth.current();
  if (cur) {
    showDashboard(cur.role);
  }

  bindLogin();
  bindAdminDashboard();
  bindSheikhDashboard();
})();

// ============ LOGIN ============
function bindLogin() {
  const btn = document.getElementById('loginBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const u = document.getElementById('user').value;
    const p = document.getElementById('pass').value;
    const err = document.getElementById('loginErr');
    const sess = Auth.login(u, p);
    if (!sess) {
      err.style.display = 'block';
      return;
    }
    err.style.display = 'none';
    showDashboard(sess.role);
  });
  ['user', 'pass'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keypress', e => { if (e.key === 'Enter') btn.click(); });
  });
}

function showDashboard(role) {
  document.getElementById('loginView').style.display = 'none';
  if (role === 'admin') {
    document.getElementById('dashView').style.display = 'block';
    document.getElementById('sheikhView').style.display = 'none';
    initAdminDashboard();
  } else if (role === 'sheikh') {
    document.getElementById('sheikhView').style.display = 'block';
    document.getElementById('dashView').style.display = 'none';
    initSheikhDashboard();
  }
}

function commitAndRefresh() {
  Store.save();
  // re-render header (for site name/logo updates) only if needed; safe call
  applyTexts();
  GH.markDirty();
}

// ============ TOAST (auto-save feedback) ============
function showToast(msg, kind) {
  let host = document.getElementById('toastHost');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toastHost';
    host.className = 'toast-host';
    document.body.appendChild(host);
  }
  const el = document.createElement('div');
  el.className = 'toast toast-' + (kind || 'ok');
  el.setAttribute('data-testid', 'toast');
  el.textContent = msg;
  host.appendChild(el);
  // animate out
  setTimeout(() => { el.classList.add('out'); }, 1400);
  setTimeout(() => { el.remove(); }, 1900);
}
window.showToast = showToast;

// ============ GITHUB PUBLISH ============
const GH_KEY = 'alfwzan_gh_v1';
const GH = {
  _dirty: false,
  _publishing: false,
  _lastPublishedAt: 0,
  _t: null,
  cfg() {
    try { return JSON.parse(localStorage.getItem(GH_KEY) || 'null'); } catch (e) { return null; }
  },
  save(c) { localStorage.setItem(GH_KEY, JSON.stringify(c)); },
  isConfigured() {
    const c = this.cfg();
    return !!(c && c.user && c.repo && c.pat);
  },
  markDirty() {
    this._dirty = true;
    this.renderStatus();
    const c = this.cfg();
    if (c && c.auto && this.isConfigured()) {
      clearTimeout(this._t);
      this._t = setTimeout(() => this.publish(true).catch(() => {}), 1500);
    }
  },
  renderStatus() {
    const els = [document.getElementById('publishStatus'), document.getElementById('sheikhPublishStatus')].filter(Boolean);
    if (!els.length) return;
    let html = '';
    if (!this.isConfigured()) {
      html = '<span class="pill pill-warn">⚠️ لم تُضبط بيانات النشر على GitHub بعد — اذهب إلى «الإعدادات» وأكملها لتُحفظ التعديلات بشكل دائم.</span>';
    } else if (this._publishing) {
      html = '<span class="pill pill-info">⏳ جارٍ النشر إلى GitHub...</span>';
    } else if (this._dirty) {
      html = '<span class="pill pill-warn">● هناك تعديلات لم تُنشر بعد. اضغط «نشر التغييرات إلى GitHub».</span>';
    } else if (this._lastPublishedAt) {
      html = `<span class="pill pill-ok">✓ تم النشر بنجاح في ${new Date(this._lastPublishedAt).toLocaleString('ar')}</span>`;
    } else {
      html = '<span class="pill pill-info">✓ متصل بـ GitHub. التغييرات ستُحفظ عند الضغط على «نشر التغييرات».</span>';
    }
    els.forEach(el => el.innerHTML = html);
  },
  async _ghReq(method, path, body) {
    const c = this.cfg();
    if (!c) throw new Error('بيانات GitHub غير مضبوطة');
    const url = `https://api.github.com/repos/${encodeURIComponent(c.user)}/${encodeURIComponent(c.repo)}/${path}`;
    const headers = {
      'Authorization': `Bearer ${c.pat}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
    if (body) headers['Content-Type'] = 'application/json';
    return fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  },
  async _getSha() {
    const c = this.cfg();
    const r = await this._ghReq('GET', `contents/data/site.json?ref=${encodeURIComponent(c.branch || 'main')}`);
    if (r.status === 404) return null;
    if (!r.ok) {
      const txt = await r.text();
      throw new Error(`فشل قراءة الملف (${r.status}): ${txt}`);
    }
    const j = await r.json();
    return j.sha;
  },
  _b64Utf8(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    bytes.forEach(b => bin += String.fromCharCode(b));
    return btoa(bin);
  },
  async publish(silent) {
    if (!this.isConfigured()) {
      if (!silent) alert('أكمل بيانات النشر في «الإعدادات» أولاً (اسم المستخدم، المستودع، الرمز).');
      return;
    }
    this._publishing = true; this.renderStatus();
    try {
      const c = this.cfg();
      const sha = await this._getSha();
      const json = JSON.stringify(Store.data, null, 2);
      const body = {
        message: `admin: update site.json (${new Date().toISOString()})`,
        content: this._b64Utf8(json),
        branch: c.branch || 'main'
      };
      if (sha) body.sha = sha;
      const r = await this._ghReq('PUT', 'contents/data/site.json', body);
      if (!r.ok) {
        const txt = await r.text();
        throw new Error(`فشل النشر (${r.status}): ${txt}`);
      }
      this._lastPublishedAt = Date.now();
      this._dirty = false;
      this._publishing = false;
      this.renderStatus();
      if (!silent) alert('✓ تم النشر بنجاح. ستظهر التغييرات على الموقع المنشور خلال دقيقة.');
    } catch (e) {
      this._publishing = false;
      this.renderStatus();
      if (!silent) alert('فشل النشر: ' + e.message);
      else console.warn('Auto-publish failed:', e);
    }
  },
  async test() {
    if (!this.isConfigured()) { alert('أكمل البيانات أولاً (اسم المستخدم، المستودع، الرمز).'); return; }
    try {
      const c = this.cfg();
      const r = await this._ghReq('GET', `branches/${encodeURIComponent(c.branch || 'main')}`);
      if (r.ok) {
        alert('✓ الاتصال ناجح. المستودع «' + c.user + '/' + c.repo + '» والفرع «' + (c.branch || 'main') + '» موجودان.');
      } else {
        const txt = await r.text();
        alert('فشل الاتصال (' + r.status + '): تحقق من اسم المستخدم/المستودع/الفرع/الرمز.\n\n' + txt);
      }
    } catch (e) { alert('خطأ في الاتصال: ' + e.message); }
  }
};

// ============ ADMIN DASHBOARD ============
function bindAdminDashboard() {
  // Tabs
  document.querySelectorAll('.dash-side a[data-tab]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = a.dataset.tab;
      document.querySelectorAll('.dash-side a').forEach(x => x.classList.remove('active'));
      a.classList.add('active');
      document.querySelectorAll('.dash-main .tab').forEach(t => t.classList.remove('active'));
      const el = document.getElementById('tab-' + tab);
      if (el) el.classList.add('active');
    });
  });

  // Logout
  const lo = document.getElementById('logoutBtn');
  if (lo) lo.addEventListener('click', () => { Auth.logout(); location.reload(); });

  // Export / Import
  const exp = document.getElementById('exportBtn');
  if (exp) exp.addEventListener('click', () => downloadJSON('site.json', Store.data));
  const impBtn = document.getElementById('importBtn');
  const impFile = document.getElementById('importFile');
  if (impBtn && impFile) {
    impBtn.addEventListener('click', () => impFile.click());
    impFile.addEventListener('change', async () => {
      const f = impFile.files[0]; if (!f) return;
      const text = await f.text();
      try {
        Store.data = JSON.parse(text);
        Store._merge();
        commitAndRefresh();
        initAdminDashboard();
        alert('تم استيراد البيانات بنجاح');
      } catch (e) { alert('ملف غير صالح'); }
    });
  }

  // About media
  document.getElementById('aboutAdd')?.addEventListener('click', addAboutMedia);
  // Achievements
  document.getElementById('achAdd')?.addEventListener('click', addAchievement);
  // Activities
  document.getElementById('actAdd')?.addEventListener('click', addActivity);
  // Halaqat
  document.getElementById('halaqaAdd')?.addEventListener('click', addHalaqa);
  // Students
  document.getElementById('stuAdd')?.addEventListener('click', addStudent);
  document.getElementById('stuSearchAdmin')?.addEventListener('input', () => renderStudentsAdmin());
  // Texts
  document.getElementById('textsSave')?.addEventListener('click', saveTexts);
  // Settings
  document.getElementById('settingsSave')?.addEventListener('click', saveSettings);
  document.getElementById('logoFile')?.addEventListener('change', uploadLogo);
  // GitHub
  document.getElementById('publishBtn')?.addEventListener('click', () => GH.publish(false));
  document.getElementById('ghSave')?.addEventListener('click', saveGhConfig);
  document.getElementById('ghTest')?.addEventListener('click', () => GH.test());
  // Reports
  document.getElementById('reportDownloadAdmin')?.addEventListener('click', downloadAdminMonthReport);
  document.getElementById('reportPreviewAdmin')?.addEventListener('click', renderAdminReportSummary);
  document.getElementById('reportMonthAdmin')?.addEventListener('change', renderAdminReportSummary);
  document.getElementById('reportHalaqaAdmin')?.addEventListener('change', renderAdminReportSummary);
  // Reset from server
  document.getElementById('resetFromServerBtn')?.addEventListener('click', resetFromServer);
}

async function resetFromServer() {
  if (!confirm('سيتم استبدال كل البيانات المحلية (الحلقات، الطلاب، الإنجازات، الأنشطة، النصوص...) بما في ملف السيرفر. هل أنت متأكد؟')) return;
  try {
    const r = await fetch('data/site.json?t=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) throw new Error('فشل تحميل الملف');
    const data = await r.json();
    Store.data = data;
    Store._merge();
    Store.save();
    alert('✓ تم تحميل البيانات بنجاح. سيُعاد تحميل الصفحة.');
    location.reload();
  } catch (e) {
    alert('فشل التحميل: ' + e.message);
  }
}

// ---- Texts ----
function initAdminDashboard() {
  renderTextsForm();
  renderAboutListAdmin();
  renderAchListAdmin();
  renderActListAdmin();
  renderHalaqatAdmin();
  renderStudentsAdmin();
  renderSettings();
  renderGhSettings();
  initAdminReportsTab();
  GH._dirty = false;
  GH.renderStatus();
}

// ---- Admin: Reports ----
function initAdminReportsTab() {
  const monthEl = document.getElementById('reportMonthAdmin');
  if (!monthEl) return;
  const now = new Date();
  monthEl.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const hSel = document.getElementById('reportHalaqaAdmin');
  if (hSel) {
    hSel.innerHTML = '<option value="">— كل الحلقات —</option>' +
      (Store.data.halaqat || []).map(h => `<option value="${h.id}">${escapeHtml(h.name)}</option>`).join('');
  }
}

function _adminReportSelection() {
  const monthEl = document.getElementById('reportMonthAdmin');
  if (!monthEl || !monthEl.value) return null;
  const [y, m] = monthEl.value.split('-').map(n => parseInt(n, 10));
  const hid = document.getElementById('reportHalaqaAdmin').value;
  const halaqat = Store.data.halaqat || [];
  let students = (Store.data.students || []).slice();
  if (hid) students = students.filter(s => s.halaqaId === hid);
  return { y, m, hid, halaqat, students };
}

function buildAdminMonthCSV(y, m, students, halaqat) {
  const lines = [];
  lines.push(csvRow(['مركز الفوزان لتحفيظ القرآن الكريم - تقرير شهري مُجمَّع']));
  lines.push(csvRow(['الشهر', `${MONTH_NAMES_AR[m - 1]} ${y}`]));
  lines.push(csvRow(['عدد الطلاب', students.length]));
  lines.push('');
  lines.push(csvRow([
    'الرقم', 'الاسم', 'الحلقة', 'المرحلة',
    'أيام تم تسجيلها', 'حضور', 'غياب', 'نسبة الحضور %',
    'ممتاز', 'جيد جدا', 'جيد', 'مقبول', 'لم يحفظ'
  ]));
  const totals = { marked: 0, present: 0, absent: 0, mumtaz: 0, jvg: 0, jyd: 0, maq: 0, no: 0 };
  students.forEach(s => {
    const h = halaqat.find(x => x.id === s.halaqaId);
    const st = studentMonthStats(s, y, m);
    totals.marked += st.marked; totals.present += st.present; totals.absent += st.absent;
    totals.mumtaz += st.gradeCounts['ممتاز']; totals.jvg += st.gradeCounts['جيد جدا'];
    totals.jyd += st.gradeCounts['جيد']; totals.maq += st.gradeCounts['مقبول']; totals.no += st.gradeCounts['لم يحفظ'];
    lines.push(csvRow([
      s.serial, s.name, h ? h.name : '—', h ? h.level : '—',
      st.marked, st.present, st.absent, st.pct,
      st.gradeCounts['ممتاز'], st.gradeCounts['جيد جدا'],
      st.gradeCounts['جيد'], st.gradeCounts['مقبول'], st.gradeCounts['لم يحفظ']
    ]));
  });
  lines.push('');
  const overallPct = totals.marked > 0 ? Math.round((totals.present / totals.marked) * 100) : 0;
  const totalGrades = totals.mumtaz + totals.jvg + totals.jyd + totals.maq + totals.no;
  const pctOf = (n) => totalGrades > 0 ? Math.round((n / totalGrades) * 100) + '%' : '—';
  lines.push(csvRow(['الملخص العام', '']));
  lines.push(csvRow(['إجمالي أيام التحضير', totals.marked]));
  lines.push(csvRow(['إجمالي الحضور', totals.present]));
  lines.push(csvRow(['إجمالي الغياب', totals.absent]));
  lines.push(csvRow(['نسبة الحضور العامة', overallPct + '%']));
  lines.push('');
  lines.push(csvRow(['توزيع التقديرات', 'العدد', 'النسبة']));
  lines.push(csvRow(['ممتاز', totals.mumtaz, pctOf(totals.mumtaz)]));
  lines.push(csvRow(['جيد جدا', totals.jvg, pctOf(totals.jvg)]));
  lines.push(csvRow(['جيد', totals.jyd, pctOf(totals.jyd)]));
  lines.push(csvRow(['مقبول', totals.maq, pctOf(totals.maq)]));
  lines.push(csvRow(['لم يحفظ', totals.no, pctOf(totals.no)]));
  return { csv: lines.join('\n'), totals, totalGrades, overallPct };
}

function downloadAdminMonthReport() {
  const sel = _adminReportSelection();
  if (!sel) { alert('اختر الشهر أولاً'); return; }
  const { y, m, hid, halaqat, students } = sel;
  if (!students.length) { alert('لا يوجد طلاب لهذا الفلتر'); return; }
  const { csv } = buildAdminMonthCSV(y, m, students, halaqat);
  const h = halaqat.find(x => x.id === hid);
  const suffix = h ? `_${h.name.replace(/\s+/g, '_')}` : '_كل_الحلقات';
  const fname = `admin_report_${y}-${String(m).padStart(2, '0')}${suffix}.csv`;
  downloadCSV(fname, csv);
}

function renderAdminReportSummary() {
  const root = document.getElementById('reportSummaryAdmin');
  if (!root) return;
  const sel = _adminReportSelection();
  if (!sel) { root.innerHTML = ''; return; }
  const { y, m, halaqat, students } = sel;
  if (!students.length) { root.innerHTML = '<div class="empty-state">لا يوجد طلاب لهذا الفلتر.</div>'; return; }
  const { totals, totalGrades, overallPct } = buildAdminMonthCSV(y, m, students, halaqat);
  const pctOf = (n) => totalGrades > 0 ? Math.round((n / totalGrades) * 100) : 0;
  root.innerHTML = `
    <div class="summary-grid" style="margin-top:6px">
      <div class="sg-item"><span class="sg-num">${students.length}</span><span class="sg-lbl">عدد الطلاب</span></div>
      <div class="sg-item"><span class="sg-num">${totals.present}</span><span class="sg-lbl">حضور</span></div>
      <div class="sg-item"><span class="sg-num">${totals.absent}</span><span class="sg-lbl">غياب</span></div>
      <div class="sg-item sg-pct"><span class="sg-num">${overallPct}%</span><span class="sg-lbl">نسبة الحضور</span></div>
    </div>
    <h3 style="margin-top:22px;color:var(--primary)">توزيع تقديرات الحفظ</h3>
    <div class="grade-bars">
      ${[
        { label: 'ممتاز', n: totals.mumtaz, cls: 'g-mumtaz' },
        { label: 'جيد جدا', n: totals.jvg, cls: 'g-jvg' },
        { label: 'جيد', n: totals.jyd, cls: 'g-jyd' },
        { label: 'مقبول', n: totals.maq, cls: 'g-maq' },
        { label: 'لم يحفظ', n: totals.no, cls: 'g-no' }
      ].map(g => `
        <div class="grade-bar">
          <span class="gb-lbl">${g.label}</span>
          <div class="gb-track"><div class="gb-fill tag ${g.cls}" style="width:${pctOf(g.n)}%"></div></div>
          <span class="gb-val">${g.n} (${pctOf(g.n)}%)</span>
        </div>
      `).join('')}
    </div>
  `;
}

// ---- Texts ----
const TEXT_FIELDS = [
  { key: 'hero.title', label: 'العنوان الرئيسي', type: 'input' },
  { key: 'hero.lead', label: 'الوصف تحت العنوان', type: 'textarea' },
  { key: 'stats.students', label: 'إحصائية: عدد الطلاب', type: 'input' },
  { key: 'stats.teachers', label: 'إحصائية: عدد المعلمين', type: 'input' },
  { key: 'stats.years', label: 'إحصائية: سنوات العمل', type: 'input' },
  { key: 'about.title', label: 'عنوان «لمحة عنا»', type: 'input' },
  { key: 'about.paragraph1', label: 'فقرة لمحة عنا 1', type: 'textarea' },
  { key: 'about.paragraph2', label: 'فقرة لمحة عنا 2', type: 'textarea' },
  { key: 'about.feature1', label: 'ميزة 1', type: 'input' },
  { key: 'about.feature2', label: 'ميزة 2', type: 'input' },
  { key: 'about.feature3', label: 'ميزة 3', type: 'input' },
  { key: 'about.feature4', label: 'ميزة 4', type: 'input' },
  { key: 'register.title', label: 'عنوان قسم التسجيل', type: 'input' },
  { key: 'register.text', label: 'نص قسم التسجيل', type: 'textarea' }
];
function renderTextsForm() {
  const root = document.getElementById('textsForm');
  if (!root) return;
  root.innerHTML = TEXT_FIELDS.map(f => {
    const v = escapeHtml(Store.data.texts[f.key] || '');
    return `<div class="text-row">
      <label>${f.label} <small style="color:var(--muted)">(${f.key})</small></label>
      ${f.type === 'textarea'
        ? `<textarea rows="3" data-k="${f.key}">${v}</textarea>`
        : `<input type="text" data-k="${f.key}" value="${v}"/>`}
    </div>`;
  }).join('');
}
function saveTexts() {
  document.querySelectorAll('#textsForm [data-k]').forEach(el => {
    Store.data.texts[el.dataset.k] = el.value;
  });
  commitAndRefresh();
  alert('تم حفظ النصوص');
}

// ---- About media ----
async function addAboutMedia() {
  const file = document.getElementById('aboutFile').files[0];
  const url = document.getElementById('aboutVideoUrl').value.trim();
  const cap = document.getElementById('aboutCaption').value.trim();
  if (!file && !url) { alert('اختر ملفاً أو ادخل رابط فيديو'); return; }
  let item;
  if (url) {
    item = { id: uid(), type: 'video', src: url, caption: cap };
  } else if (file.type.startsWith('video/')) {
    const src = await fileToDataURL(file);
    item = { id: uid(), type: 'video', src, caption: cap };
  } else {
    const src = await fileToImageDataURL(file);
    item = { id: uid(), type: 'image', src, caption: cap };
  }
  Store.data.aboutMedia.unshift(item);
  commitAndRefresh();
  document.getElementById('aboutFile').value = '';
  document.getElementById('aboutVideoUrl').value = '';
  document.getElementById('aboutCaption').value = '';
  renderAboutListAdmin();
}
function renderAboutListAdmin() {
  const root = document.getElementById('aboutList');
  if (!root) return;
  const items = Store.data.aboutMedia || [];
  if (!items.length) { root.innerHTML = `<div class="empty-state">لم تُضف صور أو فيديوهات بعد.</div>`; return; }
  root.innerHTML = items.map(it => mediaCardAdmin(it, 'about')).join('');
  bindMediaDelete(root, 'about');
}

// ---- Achievements ----
async function addAchievement() {
  const file = document.getElementById('achFile').files[0];
  const url = document.getElementById('achVideoUrl').value.trim();
  const title = document.getElementById('achTitle').value.trim();
  const desc = document.getElementById('achDesc').value.trim();
  const category = document.getElementById('achCategory').value || 'certificates';
  if (!file && !url) { alert('اختر ملفاً أو ادخل رابط فيديو'); return; }
  let item;
  if (url) {
    item = { id: uid(), type: 'video', src: url, title, description: desc, category };
  } else if (file.type.startsWith('video/')) {
    const src = await fileToDataURL(file);
    item = { id: uid(), type: 'video', src, title, description: desc, category };
  } else {
    const src = await fileToImageDataURL(file);
    item = { id: uid(), type: 'image', src, title, description: desc, category };
  }
  Store.data.achievements.unshift(item);
  commitAndRefresh();
  document.getElementById('achFile').value = '';
  document.getElementById('achVideoUrl').value = '';
  document.getElementById('achTitle').value = '';
  document.getElementById('achDesc').value = '';
  renderAchListAdmin();
}
function renderAchListAdmin() {
  const root = document.getElementById('achList');
  if (!root) return;
  const items = Store.data.achievements || [];
  if (!items.length) { root.innerHTML = `<div class="empty-state">لم تُضف إنجازات بعد.</div>`; return; }
  root.innerHTML = items.map(it => {
    const cat = it.category || 'certificates';
    return mediaCardAdmin(it, 'ach', `<span class="cat-badge cat-${cat}">${CAT_LABELS[cat] || cat}</span>`);
  }).join('');
  bindMediaDelete(root, 'ach');
}

function mediaCardAdmin(it, kind, extraBadge) {
  const isVid = it.type === 'video';
  const isYT = isVid && (it.src.includes('youtube.com') || it.src.includes('youtu.be'));
  let thumb;
  if (isVid) {
    if (isYT) {
      const m = it.src.match(/(?:youtube\.com\/.*[?&]v=|youtu\.be\/|youtube\.com\/embed\/)([^?&]+)/);
      thumb = `<img src="https://img.youtube.com/vi/${m?m[1]:''}/hqdefault.jpg"/>`;
    } else {
      thumb = `<video src="${escapeHtml(it.src)}" muted></video>`;
    }
  } else {
    thumb = `<img src="${escapeHtml(it.src)}"/>`;
  }
  return `<div class="admin-card" data-id="${it.id}">
    <div class="thumb">${thumb}</div>
    <div class="info">
      ${extraBadge || ''}
      ${it.title ? `<b>${escapeHtml(it.title)}</b>` : ''}
      ${it.caption ? escapeHtml(it.caption) : ''}
      ${it.description ? escapeHtml(it.description) : ''}
    </div>
    <div class="actions">
      <button class="btn btn-danger btn-sm" data-del="${kind}" data-id="${it.id}">حذف</button>
    </div>
  </div>`;
}

function bindMediaDelete(root, kind) {
  root.querySelectorAll('button[data-del]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('حذف هذا العنصر؟')) return;
      const id = btn.dataset.id;
      const list = kind === 'about' ? Store.data.aboutMedia : Store.data.achievements;
      const idx = list.findIndex(x => x.id === id);
      if (idx >= 0) list.splice(idx, 1);
      commitAndRefresh();
      kind === 'about' ? renderAboutListAdmin() : renderAchListAdmin();
    });
  });
}

// ---- Activities ----
const CAT_LABELS = { certificates: 'الشهادات', honors: 'التكريمات', programs: 'البرامج' };
function addActivity() {
  const title = document.getElementById('actTitle').value.trim();
  const start = document.getElementById('actStart').value;
  const end = document.getElementById('actEnd').value;
  const desc = document.getElementById('actDesc').value.trim();
  if (!title || !start) { alert('أدخل العنوان ووقت البداية'); return; }
  const item = { id: uid(), title, start: new Date(start).toISOString(), description: desc };
  if (end) item.end = new Date(end).toISOString();
  Store.data.activities.unshift(item);
  commitAndRefresh();
  document.getElementById('actTitle').value = '';
  document.getElementById('actStart').value = '';
  document.getElementById('actEnd').value = '';
  document.getElementById('actDesc').value = '';
  renderActListAdmin();
}
function renderActListAdmin() {
  const root = document.getElementById('actList');
  if (!root) return;
  const items = (Store.data.activities || []).slice().sort((a, b) => new Date(a.start) - new Date(b.start));
  if (!items.length) { root.innerHTML = `<div class="empty-state">لم تُضف أنشطة.</div>`; return; }
  const now = Date.now();
  root.innerHTML = items.map(a => {
    const endTs = a.end ? new Date(a.end).getTime() : new Date(a.start).getTime() + 86400000;
    let status, color;
    if (new Date(a.start).getTime() > now) { status = 'قادم'; color = 'var(--primary)'; }
    else if (endTs > now) { status = 'جارٍ الآن'; color = '#d97706'; }
    else { status = 'منتهٍ'; color = 'var(--muted)'; }
    return `<div class="admin-list-row">
      <div>
        <b>${escapeHtml(a.title)}</b>
        <div class="meta">${formatDateTime(a.start)}${a.end ? ' ← ' + formatDateTime(a.end) : ''} • <span style="color:${color}">${status}</span></div>
      </div>
      <div class="actions">
        <button class="btn btn-ghost btn-sm" data-edit-act="${a.id}">تعديل</button>
        <button class="btn btn-danger btn-sm" data-del-act="${a.id}">حذف</button>
      </div>
    </div>`;
  }).join('');
  root.querySelectorAll('button[data-del-act]').forEach(b => b.addEventListener('click', () => {
    if (!confirm('حذف النشاط؟')) return;
    const i = Store.data.activities.findIndex(x => x.id === b.dataset.delAct);
    if (i >= 0) Store.data.activities.splice(i, 1);
    commitAndRefresh(); renderActListAdmin();
  }));
  root.querySelectorAll('button[data-edit-act]').forEach(b => b.addEventListener('click', () => {
    const a = Store.data.activities.find(x => x.id === b.dataset.editAct);
    const nt = prompt('العنوان:', a.title);  if (nt === null) return;
    const nd = prompt('وقت البداية (YYYY-MM-DDTHH:MM):', a.start.slice(0,16)); if (nd === null) return;
    const ne = prompt('وقت النهاية (اختياري، YYYY-MM-DDTHH:MM):', a.end ? a.end.slice(0,16) : ''); if (ne === null) return;
    a.title = nt;
    try { a.start = new Date(nd).toISOString(); } catch (e) {}
    if (ne) { try { a.end = new Date(ne).toISOString(); } catch (e) {} } else { delete a.end; }
    commitAndRefresh(); renderActListAdmin();
  }));
}

// ---- Halaqat ----
function addHalaqa() {
  const name = document.getElementById('halaqaName').value.trim();
  const level = document.getElementById('halaqaLevel').value;
  const targetGrade = document.getElementById('halaqaTargetGrade')?.value || '';
  const sheikh = document.getElementById('halaqaSheikh').value.trim();
  if (!name) { alert('أدخل اسم الحلقة'); return; }
  Store.data.halaqat.push({ id: uid(), name, level, targetGrade, sheikh });
  commitAndRefresh();
  document.getElementById('halaqaName').value = '';
  document.getElementById('halaqaSheikh').value = '';
  if (document.getElementById('halaqaTargetGrade')) document.getElementById('halaqaTargetGrade').value = '';
  renderHalaqatAdmin();
  refreshStudentHalaqaSelect();
}
function renderHalaqatAdmin() {
  const root = document.getElementById('halaqaList');
  if (!root) return;
  const items = Store.data.halaqat || [];
  if (!items.length) { root.innerHTML = `<div class="empty-state">لا توجد حلقات.</div>`; return; }
  root.innerHTML = items.map(h => `<div class="admin-list-row">
    <div>
      <b>${escapeHtml(h.name)}</b>
      <div class="meta">المرحلة: ${escapeHtml(h.level)}${h.targetGrade ? ' • الصف المستهدف: ' + escapeHtml(h.targetGrade) : ''}${h.sheikh ? ' • الشيخ: ' + escapeHtml(h.sheikh) : ''}</div>
    </div>
    <div class="actions">
      <button class="btn btn-ghost btn-sm" data-edit-h="${h.id}">تعديل</button>
      <button class="btn btn-danger btn-sm" data-del-h="${h.id}">حذف</button>
    </div>
  </div>`).join('');
  root.querySelectorAll('button[data-del-h]').forEach(b => b.addEventListener('click', () => {
    if (!confirm('حذف الحلقة؟ سيبقى الطلاب لكن بدون حلقة.')) return;
    const id = b.dataset.delH;
    const i = Store.data.halaqat.findIndex(x => x.id === id);
    if (i >= 0) Store.data.halaqat.splice(i, 1);
    (Store.data.students||[]).forEach(s => { if (s.halaqaId === id) s.halaqaId = ''; });
    commitAndRefresh(); renderHalaqatAdmin(); renderStudentsAdmin(); refreshStudentHalaqaSelect();
  }));
  root.querySelectorAll('button[data-edit-h]').forEach(b => b.addEventListener('click', () => {
    const h = Store.data.halaqat.find(x => x.id === b.dataset.editH);
    const n = prompt('اسم الحلقة:', h.name); if (n === null) return;
    const l = prompt('المرحلة (ابتدائي/متوسط/ثانوي):', h.level); if (l === null) return;
    const tg = prompt('الصف المستهدف (مثل: السادس الابتدائي):', h.targetGrade || ''); if (tg === null) return;
    const s = prompt('اسم الشيخ:', h.sheikh || ''); if (s === null) return;
    h.name = n; h.level = l; h.targetGrade = tg; h.sheikh = s;
    commitAndRefresh(); renderHalaqatAdmin();
  }));
}

function refreshStudentHalaqaSelect() {
  const sel = document.getElementById('stuHalaqa');
  if (!sel) return;
  sel.innerHTML = '<option value="">— بدون —</option>' +
    (Store.data.halaqat || []).map(h => `<option value="${h.id}">${escapeHtml(h.name)} (${escapeHtml(h.targetGrade || h.level)})</option>`).join('');
}

// ---- Students ----
function addStudent() {
  const name = document.getElementById('stuName').value.trim();
  const serial = document.getElementById('stuSerial').value.trim();
  const halaqaId = document.getElementById('stuHalaqa').value;
  const grade = document.getElementById('stuGrade').value;
  if (!name || !serial) { alert('أدخل الاسم والرقم'); return; }
  if ((Store.data.students||[]).some(s => s.serial === serial)) { alert('الرقم التسلسلي مستخدم بالفعل'); return; }
  Store.data.students.push({ id: uid(), name, serial, halaqaId, grade, attendance: {} });
  commitAndRefresh();
  document.getElementById('stuName').value = '';
  document.getElementById('stuSerial').value = '';
  document.getElementById('stuGrade').value = '';
  renderStudentsAdmin();
}
function renderStudentsAdmin() {
  refreshStudentHalaqaSelect();
  const root = document.getElementById('stuList');
  if (!root) return;
  const q = (document.getElementById('stuSearchAdmin')?.value || '').trim().toLowerCase();
  const items = (Store.data.students || []).filter(s => !q ||
    s.name.toLowerCase().includes(q) || s.serial.toLowerCase().includes(q));
  if (!items.length) { root.innerHTML = `<div class="empty-state">لا يوجد طلاب.</div>`; return; }
  const halaqat = Store.data.halaqat || [];
  root.innerHTML = items.map(s => {
    const h = halaqat.find(x => x.id === s.halaqaId);
    return `<div class="admin-list-row">
      <div>
        <b>${escapeHtml(s.name)}</b>
        <div class="meta">الرقم: ${escapeHtml(s.serial)} • الحلقة: ${escapeHtml(h ? h.name : 'بدون')}${s.grade ? ' • الصف: ' + escapeHtml(s.grade) : ''}</div>
      </div>
      <div class="actions">
        <button class="btn btn-ghost btn-sm" data-edit-s="${s.id}">تعديل</button>
        <button class="btn btn-danger btn-sm" data-del-s="${s.id}">حذف</button>
      </div>
    </div>`;
  }).join('');
  root.querySelectorAll('button[data-del-s]').forEach(b => b.addEventListener('click', () => {
    if (!confirm('حذف الطالب؟')) return;
    const i = Store.data.students.findIndex(x => x.id === b.dataset.delS);
    if (i >= 0) Store.data.students.splice(i, 1);
    commitAndRefresh(); renderStudentsAdmin();
  }));
  root.querySelectorAll('button[data-edit-s]').forEach(b => b.addEventListener('click', () => {
    const s = Store.data.students.find(x => x.id === b.dataset.editS);
    const n = prompt('اسم الطالب:', s.name); if (n === null) return;
    const sr = prompt('الرقم التسلسلي:', s.serial); if (sr === null) return;
    const g = prompt('الصف الدراسي (مثال: الثالث الابتدائي):', s.grade || ''); if (g === null) return;
    s.name = n; s.serial = sr; s.grade = g;
    commitAndRefresh(); renderStudentsAdmin();
  }));
}

// ---- Settings & logo ----
function renderSettings() {
  document.getElementById('setName').value = Store.data.site.name || '';
  document.getElementById('setRegisterUrl').value = Store.data.site.registerUrl || '';
  const preview = document.getElementById('logoPreview');
  if (preview) {
    preview.innerHTML = Store.data.site.logo
      ? `<img src="${escapeHtml(Store.data.site.logo)}" alt="logo"/>`
      : 'ف';
  }
}
function saveSettings() {
  Store.data.site.name = document.getElementById('setName').value.trim() || 'مركز الفوزان';
  Store.data.site.registerUrl = document.getElementById('setRegisterUrl').value.trim() || '#';
  commitAndRefresh();
  renderHeader(); renderFooter();
  alert('تم حفظ الإعدادات');
}
async function uploadLogo() {
  const f = document.getElementById('logoFile').files[0];
  if (!f) return;
  const url = await fileToImageDataURL(f, 400, 0.9);
  Store.data.site.logo = url;
  commitAndRefresh();
  renderHeader(); renderSettings();
}

function renderGhSettings() {
  const c = GH.cfg() || {};
  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
  setVal('ghUser', c.user);
  setVal('ghRepo', c.repo);
  setVal('ghBranch', c.branch || 'main');
  setVal('ghPat', c.pat);
  const auto = document.getElementById('ghAuto');
  if (auto) auto.checked = !!c.auto;
}
function saveGhConfig() {
  const c = {
    user: document.getElementById('ghUser').value.trim(),
    repo: document.getElementById('ghRepo').value.trim(),
    branch: document.getElementById('ghBranch').value.trim() || 'main',
    pat: document.getElementById('ghPat').value.trim(),
    auto: document.getElementById('ghAuto').checked
  };
  GH.save(c);
  GH.renderStatus();
  alert('تم حفظ بيانات النشر.');
}

// ============ SHEIKH DASHBOARD ============
function bindSheikhDashboard() {
  const lo = document.getElementById('sheikhLogoutBtn');
  if (lo) lo.addEventListener('click', () => { Auth.logout(); location.reload(); });
  document.getElementById('sheikhHalaqa')?.addEventListener('change', renderSheikhStudents);
  document.getElementById('sheikhStudentSearch')?.addEventListener('input', renderSheikhStudents);
  document.getElementById('sheikhDate')?.addEventListener('change', renderSheikhStudents);
}
function initSheikhDashboard() {
  const halSel = document.getElementById('sheikhHalaqa');
  const halaqat = Store.data.halaqat || [];
  halSel.innerHTML = `<option value="">— اختر الحلقة —</option>` +
    halaqat.map(h => `<option value="${h.id}">${escapeHtml(h.name)} (${escapeHtml(h.targetGrade || h.level)})</option>`).join('');
  // default date = today (device date)
  const today = new Date().toISOString().slice(0, 10);
  const dateInput = document.getElementById('sheikhDate');
  dateInput.value = today;
  updateSheikhDateLabel();
  dateInput.addEventListener('change', updateSheikhDateLabel);
  document.getElementById('sheikhStudents').innerHTML = `<div class="empty-state">اختر حلقة لعرض طلابها.</div>`;
  GH._dirty = false;
  GH.renderStatus();
}
function updateSheikhDateLabel() {
  const v = document.getElementById('sheikhDate').value;
  const el = document.getElementById('sheikhDateLabel');
  if (!el || !v) return;
  const d = new Date(v + 'T00:00:00');
  el.innerHTML = `<span class="cal-greg">${formatGregorian(d)}</span> <span class="hijri-sep">/</span> <span class="cal-hijri">${formatHijri(d)}</span>`;
}

function renderSheikhStudents() {
  const hid = document.getElementById('sheikhHalaqa').value;
  const q = (document.getElementById('sheikhStudentSearch').value || '').trim().toLowerCase();
  const date = document.getElementById('sheikhDate').value || new Date().toISOString().slice(0, 10);
  const root = document.getElementById('sheikhStudents');
  if (!hid) { root.innerHTML = `<div class="empty-state">اختر حلقة لعرض طلابها.</div>`; return; }
  const students = (Store.data.students || []).filter(s => s.halaqaId === hid &&
    (!q || s.name.toLowerCase().includes(q) || s.serial.toLowerCase().includes(q)));
  if (!students.length) { root.innerHTML = `<div class="empty-state">لا يوجد طلاب في هذه الحلقة.</div>`; return; }

  const GRADES = ['ممتاز','جيد جدا','جيد','مقبول','لم يحفظ'];

  root.innerHTML = students.map(s => {
    const rec = (s.attendance && s.attendance[date]) || {};
    const present = rec.present;
    // Backward compat: old 'grade' field → gradeHifz
    const gReview = rec.gradeReview || '';
    const gHifz   = rec.gradeHifz != null ? rec.gradeHifz : (rec.grade || '');
    const gradesDisabled = present === false;
    const dimClass = gradesDisabled ? ' grades-locked' : '';
    return `<div class="sheikh-row${dimClass}" data-id="${s.id}">
      <div class="sheikh-row-head">
        <div>
          <div class="stu-name">${escapeHtml(s.name)}</div>
          <div class="stu-serial">الرقم: ${escapeHtml(s.serial)} • التاريخ: ${date}</div>
        </div>
        <div class="sheikh-status-btns" data-kind="present">
          <button class="${present===true?'active':''}" data-v="1" data-testid="att-present-${s.serial}">حاضر</button>
          <button class="absent ${present===false?'active':''}" data-v="0" data-testid="att-absent-${s.serial}">غائب</button>
        </div>
      </div>
      <div class="sheikh-grade-block">
        <div class="grade-label"><span class="grade-tag-label tag-review">مراجعة</span></div>
        <div class="sheikh-status-btns" data-kind="gradeReview">
          ${GRADES.map(g => `<button class="${gReview===g?'active':''}" data-v="${escapeHtml(g)}" ${gradesDisabled?'disabled':''} data-testid="rev-${s.serial}-${escapeHtml(g)}">${escapeHtml(g)}</button>`).join('')}
        </div>
      </div>
      <div class="sheikh-grade-block">
        <div class="grade-label"><span class="grade-tag-label tag-hifz">حفظ</span></div>
        <div class="sheikh-status-btns" data-kind="gradeHifz">
          ${GRADES.map(g => `<button class="${gHifz===g?'active':''}" data-v="${escapeHtml(g)}" ${gradesDisabled?'disabled':''} data-testid="hifz-${s.serial}-${escapeHtml(g)}">${escapeHtml(g)}</button>`).join('')}
        </div>
      </div>
      ${gradesDisabled ? '<div class="grades-locked-msg">الطالب غائب — لا يمكن تسجيل تقدير الحفظ أو المراجعة.</div>' : ''}
    </div>`;
  }).join('');

  root.querySelectorAll('.sheikh-row').forEach(row => {
    const id = row.dataset.id;
    const stu = Store.data.students.find(x => x.id === id);
    if (!stu.attendance) stu.attendance = {};
    if (!stu.attendance[date]) stu.attendance[date] = {};
    row.querySelectorAll('[data-kind="present"] button').forEach(b => b.addEventListener('click', () => {
      const isPresent = b.dataset.v === '1';
      stu.attendance[date].present = isPresent;
      // If marked absent → clear any previously recorded grades (cannot grade an absent student)
      if (!isPresent) {
        delete stu.attendance[date].gradeReview;
        delete stu.attendance[date].gradeHifz;
        delete stu.attendance[date].grade;
      }
      sheikhSave(); renderSheikhStudents();
    }));
    row.querySelectorAll('[data-kind="gradeReview"] button').forEach(b => b.addEventListener('click', () => {
      if (b.disabled) return;
      stu.attendance[date].gradeReview = b.dataset.v;
      sheikhSave(); renderSheikhStudents();
    }));
    row.querySelectorAll('[data-kind="gradeHifz"] button').forEach(b => b.addEventListener('click', () => {
      if (b.disabled) return;
      stu.attendance[date].gradeHifz = b.dataset.v;
      // Cleanup legacy field
      delete stu.attendance[date].grade;
      sheikhSave(); renderSheikhStudents();
    }));
  });
}

// Sheikh auto-save: saves locally instantly + silently tries GitHub publish if configured
function sheikhSave() {
  Store.save();
  showToast('✓ تم الحفظ');
  // If GitHub is configured (set up once by admin), publish silently in the background
  if (GH.isConfigured()) {
    clearTimeout(GH._t);
    GH._t = setTimeout(() => GH.publish(true).catch(() => {}), 800);
  }
}
