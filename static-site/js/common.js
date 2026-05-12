/* ============================================
   common.js — shared logic (header/footer/data)
   ============================================ */

const STORAGE_KEY = 'alfwzan_site_v1';
const SESSION_KEY = 'alfwzan_session_v1';
const LANG_KEY = 'alfwzan_lang_v1';

// ---- i18n ----
const I18N_DICT = {
  ar: {
    'brand.sub': 'لتحفيظ القرآن الكريم',
    'nav.home': 'الرئيسية',
    'nav.ach': 'الإنجازات',
    'nav.act': 'الأنشطة',
    'nav.search': 'بحث الطلاب',
    'nav.admin': 'تسجيل دخول المشرف',
    'lang.switch': 'EN',
    'hero.cta.register': 'سجّل الآن في الحلقات',
    'hero.cta.about': 'تعرّف علينا',
    'stats.students': 'طالب',
    'stats.teachers': 'معلم',
    'stats.years': 'سنة عمل',
    'about.kicker': 'من نحن',
    'register.kicker': 'انضم إلينا',
    'register.open': 'فتح نموذج التسجيل',
    'register.step1': 'املأ نموذج التسجيل',
    'register.step2': 'تحديد الحلقة المناسبة',
    'register.step3': 'بدء رحلة الحفظ',
    'page1.title': 'إنجازاتنا',
    'page1.lead': 'تكريم الطلاب المثاليين، شهادات، وصور من فعاليات المركز ومسابقاته.',
    'page1.cat.certificates': 'الشهادات',
    'page1.cat.honors': 'التكريمات',
    'page1.cat.programs': 'البرامج',
    'page1.empty': 'لا توجد إنجازات منشورة بعد.',
    'page2.title': 'أنشطة المركز',
    'page2.lead': 'تابع الأنشطة الحالية والقادمة، مع عدّاد تنازلي حتى موعد كل نشاط.',
    'page2.upcoming': 'الأنشطة القادمة',
    'page2.current': 'الأنشطة الحالية',
    'page2.past': 'الأنشطة السابقة',
    'page2.empty.up': 'لا توجد أنشطة قادمة حالياً.',
    'page2.empty.cur': 'لا توجد أنشطة حالية الآن.',
    'page2.empty.past': 'لا توجد أنشطة سابقة.',
    'page2.live': 'جارٍ الآن',
    'page2.starts': 'يبدأ:',
    'page2.started': 'بدأ:',
    'page2.ended': 'انتهى:',
    'page2.cd.day': 'يوم',
    'page2.cd.hour': 'ساعة',
    'page2.cd.min': 'دقيقة',
    'page2.cd.sec': 'ثانية',
    'page3.title': 'بحث الطلاب',
    'page3.lead': 'ابحث عن طالب باسمه أو رقمه التسلسلي لمعرفة الحضور والتقدير.',
    'page3.f.serial': 'الرقم التسلسلي',
    'page3.f.name': 'اسم الطالب',
    'page3.f.halaqa': 'اسم الحلقة',
    'page3.ph.serial': 'مثال: 001',
    'page3.ph.name': 'ادخل جزء من الاسم',
    'page3.ph.halaqa': 'ادخل جزء من اسم الحلقة',
    'page3.btn.search': 'بحث',
    'page3.btn.reset': 'مسح',
    'page3.hint': 'اكتب اسم الطالب أو رقمه التسلسلي ثم اضغط «بحث».',
    'page3.hint.required': 'يرجى إدخال اسم الطالب أو رقمه التسلسلي للبحث.',
    'page3.no.results': 'لا يوجد طلاب مطابقون.',
    'page3.week.title': 'الحضور والتقديرات — الأسبوع الحالي',
    'page3.col.day': 'اليوم',
    'page3.col.att': 'الحضور',
    'page3.col.rev': 'مراجعة',
    'page3.col.hifz': 'حفظ',
    'page3.serial.lbl': 'الرقم:',
    'page3.halaqa.lbl': 'الحلقة:',
    'page3.stage.lbl': 'المرحلة:',
    'tag.present': 'حاضر',
    'tag.absent': 'غائب',
    'day.0': 'الأحد', 'day.1': 'الاثنين', 'day.2': 'الثلاثاء', 'day.3': 'الأربعاء', 'day.4': 'الخميس',
    'footer.about': 'بيت يجمع القلوب على كتاب الله، يرعى الناشئة بالتلاوة والحفظ والتجويد.',
    'footer.links': 'روابط',
    'footer.mgmt': 'الإدارة',
    'footer.copyright': 'جميع الحقوق محفوظة',
    'hijri': 'هـ',
    'gregorian': 'م'
  },
  en: {
    'brand.sub': 'Quran Memorization Center',
    'nav.home': 'Home',
    'nav.ach': 'Achievements',
    'nav.act': 'Activities',
    'nav.search': 'Find a Student',
    'nav.admin': 'Admin Login',
    'lang.switch': 'AR',
    'hero.cta.register': 'Register Now',
    'hero.cta.about': 'About Us',
    'stats.students': 'students',
    'stats.teachers': 'teachers',
    'stats.years': 'years',
    'about.kicker': 'About Us',
    'register.kicker': 'Join Us',
    'register.open': 'Open Registration Form',
    'register.step1': 'Fill out the form',
    'register.step2': 'Pick your halaqa',
    'register.step3': 'Begin the journey',
    'page1.title': 'Our Achievements',
    'page1.lead': 'Honors for outstanding students, certificates, and photos from our programs.',
    'page1.cat.certificates': 'Certificates',
    'page1.cat.honors': 'Honors',
    'page1.cat.programs': 'Programs',
    'page1.empty': 'No achievements published yet.',
    'page2.title': 'Center Activities',
    'page2.lead': 'Follow current and upcoming activities with live countdowns.',
    'page2.upcoming': 'Upcoming Activities',
    'page2.current': 'Current Activities',
    'page2.past': 'Past Activities',
    'page2.empty.up': 'No upcoming activities yet.',
    'page2.empty.cur': 'No current activities now.',
    'page2.empty.past': 'No past activities.',
    'page2.live': 'Live now',
    'page2.starts': 'Starts:',
    'page2.started': 'Started:',
    'page2.ended': 'Ended:',
    'page2.cd.day': 'day',
    'page2.cd.hour': 'hour',
    'page2.cd.min': 'min',
    'page2.cd.sec': 'sec',
    'page3.title': 'Find a Student',
    'page3.lead': 'Search by name, serial number, or halaqa name.',
    'page3.f.serial': 'Serial number',
    'page3.f.name': 'Student name',
    'page3.f.halaqa': 'Halaqa name',
    'page3.ph.serial': 'e.g. 001',
    'page3.ph.name': 'part of the name',
    'page3.ph.halaqa': 'part of the halaqa name',
    'page3.btn.search': 'Search',
    'page3.btn.reset': 'Clear',
    'page3.hint': 'Search by serial, name, or halaqa to view a student.',
    'page3.hint.required': 'Please enter a serial, name, or halaqa to search.',
    'page3.no.results': 'No matching students.',
    'page3.week.title': 'This Week — Attendance & Grades',
    'page3.col.day': 'Day',
    'page3.col.att': 'Attendance',
    'page3.col.rev': 'Review',
    'page3.col.hifz': 'Memorization',
    'page3.serial.lbl': 'Serial:',
    'page3.halaqa.lbl': 'Halaqa:',
    'page3.stage.lbl': 'Stage:',
    'tag.present': 'Present',
    'tag.absent': 'Absent',
    'day.0': 'Sunday', 'day.1': 'Monday', 'day.2': 'Tuesday', 'day.3': 'Wednesday', 'day.4': 'Thursday',
    'footer.about': 'A home that gathers hearts on the Book of Allah, nurturing the young with recitation and memorization.',
    'footer.links': 'Links',
    'footer.mgmt': 'Administration',
    'footer.copyright': 'All rights reserved',
    'hijri': 'AH',
    'gregorian': 'CE'
  }
};
const I18N = {
  get current() {
    return localStorage.getItem(LANG_KEY) || 'ar';
  },
  set(lang) {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  },
  toggle() {
    this.set(this.current === 'ar' ? 'en' : 'ar');
    location.reload();
  },
  t(key) {
    const lang = this.current;
    return (I18N_DICT[lang] && I18N_DICT[lang][key]) || I18N_DICT.ar[key] || key;
  }
};
function t(k) { return I18N.t(k); }
function applyI18n(root) {
  (root || document).querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n'); el.textContent = t(k);
  });
  (root || document).querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
  });
}

// ---- Date helpers (Gregorian + Hijri) ----
function formatGregorian(d, lang) {
  lang = lang || I18N.current;
  const locale = lang === 'ar' ? 'ar' : 'en-GB';
  try {
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(d);
  } catch (e) { return d.toISOString().slice(0, 10); }
}
function formatHijri(d, lang) {
  lang = lang || I18N.current;
  const locale = lang === 'ar' ? 'ar-SA-u-ca-islamic-umalqura' : 'en-u-ca-islamic-umalqura';
  try {
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(d);
  } catch (e) { return ''; }
}
function dualDate(d) {
  const g = formatGregorian(d);
  const h = formatHijri(d);
  return h ? `${g} <small style="color:var(--muted)">/ ${h}</small>` : g;
}

// ---- Default data shape ----
const _BUNDLED = (typeof window !== 'undefined' && window.BUNDLED_DATA) || {};
const DEFAULT_DATA = {
  site: { name: 'مركز الفوزان', logo: '', registerUrl: '#' },
  texts: {
    'hero.title': 'مركز الفوزان لتحفيظ القرآن الكريم',
    'hero.lead': 'بيت يجمع القلوب على كتاب الله، يرعى الناشئة بالتلاوة والحفظ والتجويد.',
    'stats.students': '+250',
    'stats.teachers': '+15',
    'stats.years': '+12',
    'about.title': 'لمحة عنّا',
    'about.paragraph1': 'مركز الفوزان مركز قرآني يُعنى بتحفيظ كتاب الله العزيز.',
    'about.paragraph2': 'نقدم حلقات لمختلف المراحل (ابتدائي، متوسط، ثانوي).',
    'about.feature1': 'حلقات على يد معلمين مجازين',
    'about.feature2': 'متابعة أسبوعية للحضور والحفظ',
    'about.feature3': 'مسابقات وتكريم للطلاب المتميزين',
    'about.feature4': 'بيئة آمنة ومحفزة للتعلم',
    'register.title': 'سجّل في حلقات الفوزان',
    'register.text': 'يسرّنا انضمامك إلى أسرة المركز.'
  },
  aboutMedia: [],
  achievements: [],
  activities: [],
  halaqat: _BUNDLED.halaqat ? JSON.parse(JSON.stringify(_BUNDLED.halaqat)) : [],
  students: _BUNDLED.students ? JSON.parse(JSON.stringify(_BUNDLED.students)) : []
};

// ---- Data store ----
const Store = {
  data: null,
  async load() {
    // 1) Try localStorage (admin edits saved here)
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      try {
        this.data = JSON.parse(local);
        this._merge();
        return this.data;
      } catch (e) { /* fall through */ }
    }
    // 2) Try fetching data/site.json (deployed default)
    try {
      const res = await fetch('data/site.json', { cache: 'no-store' });
      if (res.ok) {
        this.data = await res.json();
        this._merge();
        // Inject bundled halaqat/students if site.json lacks them
        if ((!this.data.halaqat || !this.data.halaqat.length) && _BUNDLED.halaqat) {
          this.data.halaqat = JSON.parse(JSON.stringify(_BUNDLED.halaqat));
        }
        if ((!this.data.students || !this.data.students.length) && _BUNDLED.students) {
          this.data.students = JSON.parse(JSON.stringify(_BUNDLED.students));
        }
        return this.data;
      }
    } catch (e) { /* fall through */ }
    // 3) Default (with bundled halaqat/students embedded)
    this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    return this.data;
  },
  _merge() {
    // Ensure all keys exist
    for (const k of Object.keys(DEFAULT_DATA)) {
      if (this.data[k] === undefined) this.data[k] = JSON.parse(JSON.stringify(DEFAULT_DATA[k]));
    }
    this.data.site = Object.assign({}, DEFAULT_DATA.site, this.data.site || {});
    this.data.texts = Object.assign({}, DEFAULT_DATA.texts, this.data.texts || {});
    // Auto-inject bundled halaqat/students when local arrays are empty (or absent)
    if ((!Array.isArray(this.data.halaqat) || this.data.halaqat.length === 0) && _BUNDLED.halaqat && _BUNDLED.halaqat.length) {
      this.data.halaqat = JSON.parse(JSON.stringify(_BUNDLED.halaqat));
    }
    if ((!Array.isArray(this.data.students) || this.data.students.length === 0) && _BUNDLED.students && _BUNDLED.students.length) {
      this.data.students = JSON.parse(JSON.stringify(_BUNDLED.students));
    }
  },
  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  },
  reset() {
    localStorage.removeItem(STORAGE_KEY);
  }
};

// ---- Session / Auth ----
const Auth = {
  ACCOUNTS: {
    'alfwzan@admin': { password: 'Alfwzan1900', role: 'admin' },
    'alfwzan@msh':   { password: 'Alfwzan1999', role: 'sheikh' }
  },
  login(user, pass) {
    const acc = this.ACCOUNTS[user.trim()];
    if (!acc || acc.password !== pass) return null;
    const session = { user: user.trim(), role: acc.role, ts: Date.now() };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },
  current() {
    const s = sessionStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  },
  logout() { sessionStorage.removeItem(SESSION_KEY); }
};

// ---- Header / Footer ----
function pageName() {
  const p = location.pathname.split('/').pop() || 'index.html';
  return p.toLowerCase();
}

function renderHeader() {
  const slot = document.getElementById('headerSlot');
  if (!slot) return;
  const cur = pageName();
  const name = Store.data?.site?.name || 'مركز الفوزان';
  const logo = Store.data?.site?.logo || '';
  const logoHtml = logo
    ? `<img src="${escapeHtml(logo)}" alt="logo"/>`
    : 'ف';
  slot.innerHTML = `
    <header class="site-header">
      <div class="container header-row">
        <a href="index.html" class="brand" data-testid="brand">
          <span class="brand-logo">${logoHtml}</span>
          <span class="brand-text">
            <span class="brand-title">${escapeHtml(name)}</span>
            <span class="brand-sub" data-i18n="brand.sub">${t('brand.sub')}</span>
          </span>
        </a>
        <button class="menu-toggle" id="menuToggle" aria-label="القائمة">☰</button>
        <nav class="nav" id="mainNav">
          <a href="index.html"  class="${cur==='index.html'||cur===''?'active':''}" data-testid="nav-home" data-i18n="nav.home">${t('nav.home')}</a>
          <a href="page1.html"  class="${cur==='page1.html'?'active':''}" data-testid="nav-ach" data-i18n="nav.ach">${t('nav.ach')}</a>
          <a href="page2.html"  class="${cur==='page2.html'?'active':''}" data-testid="nav-act" data-i18n="nav.act">${t('nav.act')}</a>
          <a href="page3.html"  class="${cur==='page3.html'?'active':''}" data-testid="nav-search" data-i18n="nav.search">${t('nav.search')}</a>
          <a href="admin.html"  class="nav-login ${cur==='admin.html'?'active':''}" data-testid="nav-admin" data-i18n="nav.admin">${t('nav.admin')}</a>
          <button type="button" id="langToggle" class="lang-toggle" data-testid="lang-toggle">${t('lang.switch')}</button>
        </nav>
      </div>
    </header>
  `;
  const tgl = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  if (tgl && nav) tgl.addEventListener('click', () => nav.classList.toggle('open'));
  const lt = document.getElementById('langToggle');
  if (lt) lt.addEventListener('click', () => I18N.toggle());
}

function renderFooter() {
  const slot = document.getElementById('footerSlot');
  if (!slot) return;
  const year = new Date().getFullYear();
  const name = Store.data?.site?.name || 'مركز الفوزان';
  slot.innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <h4>${escapeHtml(name)}</h4>
            <p data-i18n="footer.about">${t('footer.about')}</p>
            <p style="font-family:'Amiri',serif;color:#fff5d8;margin-top:10px">«وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ»</p>
          </div>
          <div>
            <h4 data-i18n="footer.links">${t('footer.links')}</h4>
            <ul>
              <li><a href="index.html" data-i18n="nav.home">${t('nav.home')}</a></li>
              <li><a href="page1.html" data-i18n="nav.ach">${t('nav.ach')}</a></li>
              <li><a href="page2.html" data-i18n="nav.act">${t('nav.act')}</a></li>
              <li><a href="page3.html" data-i18n="nav.search">${t('nav.search')}</a></li>
            </ul>
          </div>
          <div>
            <h4 data-i18n="footer.mgmt">${t('footer.mgmt')}</h4>
            <ul>
              <li><a href="admin.html" data-i18n="nav.admin">${t('nav.admin')}</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">© ${year} ${escapeHtml(name)} — <span data-i18n="footer.copyright">${t('footer.copyright')}</span></div>
      </div>
    </footer>
  `;
}

// ---- Lightbox ----
function openLightbox(item) {
  const lb = document.getElementById('lightbox');
  const inner = document.getElementById('lightboxInner');
  if (!lb || !inner) return;
  let body = '';
  if (item.type === 'video') {
    if (item.src.startsWith('data:')) {
      body = `<video src="${item.src}" controls autoplay></video>`;
    } else if (item.src.includes('youtube.com') || item.src.includes('youtu.be')) {
      const id = ytId(item.src);
      body = `<iframe width="800" height="450" src="https://www.youtube.com/embed/${id}?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    } else {
      body = `<video src="${item.src}" controls autoplay></video>`;
    }
  } else {
    body = `<img src="${item.src}" alt="${escapeHtml(item.caption||'')}"/>`;
  }
  if (item.caption) body += `<div class="lb-caption">${escapeHtml(item.caption)}</div>`;
  inner.innerHTML = body;
  lb.classList.add('open');
}
function closeLightbox() {
  const lb = document.getElementById('lightbox');
  const inner = document.getElementById('lightboxInner');
  if (!lb) return;
  lb.classList.remove('open');
  if (inner) inner.innerHTML = '';
}
function setupLightbox() {
  const lb = document.getElementById('lightbox');
  const closeBtn = document.getElementById('lightboxClose');
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (lb) lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
}

function ytId(url) {
  const m = url.match(/(?:youtube\.com\/.*[?&]v=|youtu\.be\/|youtube\.com\/embed\/)([^?&]+)/);
  return m ? m[1] : '';
}

// ---- Text binding ----
function applyTexts() {
  if (!Store.data) return;
  document.querySelectorAll('[data-edit]').forEach(el => {
    const key = el.getAttribute('data-edit');
    const val = Store.data.texts[key];
    if (val !== undefined && val !== null && val !== '') el.textContent = val;
  });
  const reg = document.getElementById('registerLink');
  if (reg && Store.data.site.registerUrl) reg.href = Store.data.site.registerUrl;
}

// ---- Utilities ----
function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function uid() { return 'id_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }
function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleString('ar', { dateStyle: 'medium', timeStyle: 'short' });
}
function downloadJSON(name, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// Resize image file to dataURL (max width 1400px, JPEG quality 0.82)
function fileToImageDataURL(file, maxW = 1400, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(cv.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// ---- Bootstrap (called from each page) ----
async function bootCommon() {
  I18N.set(I18N.current); // apply dir/lang
  await Store.load();
  renderHeader();
  renderFooter();
  setupLightbox();
  applyI18n();
  applyTexts();
}

window.Store = Store;
window.Auth = Auth;
window.I18N = I18N;
window.t = t;
window.applyI18n = applyI18n;
window.formatGregorian = formatGregorian;
window.formatHijri = formatHijri;
window.dualDate = dualDate;
window.bootCommon = bootCommon;
window.applyTexts = applyTexts;
window.openLightbox = openLightbox;
window.escapeHtml = escapeHtml;
window.uid = uid;
window.formatDateTime = formatDateTime;
window.downloadJSON = downloadJSON;
window.fileToImageDataURL = fileToImageDataURL;
window.fileToDataURL = fileToDataURL;
