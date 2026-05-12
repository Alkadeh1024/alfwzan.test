# مركز الفوزان — موقع تحفيظ القرآن الكريم

## Problem Statement (Summary)
Static, GitHub-Pages-deployable Arabic Quran-memorization website (Markaz Al-Fawzan) with:
- Home (about + register), Achievements (categorized media gallery), Activities (with live countdown), Student Search.
- Two roles: main admin (`alfwzan@admin` / `Alfwzan1900`) and sheikh (`alfwzan@msh` / `Alfwzan1999`).
- Arabic Ruq'ah background pattern, logo top-right, Bismillah ribbon centered at top.
- Hardcoded halaqat & students (Thanawi → Mutawasit → Ibtidai), serial from 001.
- Sheikh: attendance + review/memorization grade per student per day; auto-save (no publish needed).
- Admin: edit any text, add/remove media, halaqat, students; can publish changes to GitHub via PAT.
- Visitor search: by student name OR serial only (no halaqa/listing exposed).
- Mobile responsive.

## Architecture
- 100% static HTML/CSS/JS — deployable directly to GitHub Pages (no server).
- Data: `data/site.json` (default site data) + browser `localStorage` (admin/sheikh edits).
- Bundled `js/data.js` hardcodes halaqat & students so they never disappear.
- Admin publishes localStorage → GitHub `data/site.json` via PAT (Contents: Read & Write).
- Sheikh changes auto-save locally and (if admin set up auto-publish) sync silently.

## Files
```
/app/static-site/
  ├── index.html           # Home (about, register)
  ├── page1.html           # Achievements (categorized gallery)
  ├── page2.html           # Activities + countdown
  ├── page3.html           # Public student search (name or serial)
  ├── admin.html           # Admin + Sheikh dashboards
  ├── css/style.css
  ├── js/{common,data,index,page1,page2,page3,admin}.js
  ├── data/site.json
  ├── assets/favicon.svg
  ├── .nojekyll            # Required for GitHub Pages
  └── README.md            # Deployment instructions
```
Mirror symlink for local preview: `/app/frontend/public/site` → `/app/static-site/`.

## Implemented
- 2026-02-12: Imported user's existing design (static-site) intact (no design changes).
- 2026-02-12: Added Bismillah ribbon (centered green band) on top of every page.
- 2026-02-12: Restricted public student search to name + serial only (removed halaqa field).
- 2026-02-12: Sheikh dashboard — removed Publish/Export buttons, added "auto-save active" pill + "✓ تم الحفظ" toast on every action.
- 2026-02-12: Mobile responsiveness pass (hero, header, stats, sheikh rows, attendance, toast).
- 2026-02-12: Added `.nojekyll` for GitHub Pages.

## Credentials
- Main admin: `alfwzan@admin` / `Alfwzan1900`
- Sheikh:     `alfwzan@msh`   / `Alfwzan1999`

## Deployment (GitHub Pages)
1. Create a new GitHub repo.
2. Upload the **entire contents of `/app/static-site/`** (including `.nojekyll`) to the repo root.
3. Repo Settings → Pages → Branch: `main`, Folder: `/ (root)`. Save.
4. Site goes live at `https://<user>.github.io/<repo>/`.

## Backlog / Next
- P1: Bismillah font tweaking on very small screens (<360px).
- P1: Optional offline-first service worker for cached browsing.
- P2: Multi-week attendance history view for parents on `page3.html`.
- P2: Export attendance as PDF/Excel for sheikh.
