# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Tuvithienluong" — a static web app whose only job is **lập lá số Tử Vi theo phái Việt Nam** (cast a Vietnamese-school Tử Vi birth chart). Interpretation is done by a human thầy afterwards, so do not add reading/luận-giải features, accounts, payments or a backend unless asked.

No build step, no package.json, no npm dependencies. Plain HTML + CSS + classic (non-module) JS. The only runtime third party is html2canvas loaded from cdnjs on `la-so.html`. All user-facing text is Vietnamese.

## Commands

```sh
node tests/engine.test.js      # engine test suite (39 checks, incl. a 2000-chart invariant sweep); exits 1 if any fail
node tests/ui.test.js          # UI/brand regression suite (36 checks) — locks TL-01…TL-11 plus the signed-off design system
npx serve .                    # serve locally — use this, not just opening index.html, for copy-link/PNG
python -m http.server 8080     # alternative static server
SITE_URL=https://… node tools/build.js   # build dist/ for deploy; refuses to run without SITE_URL
python tools/gen-logo.py       # rebuild the purple logo set from tools/logo-src/logo-chan-dung-goc.png
python tools/gen-og.py         # regenerate assets/img/og-image.png (run AFTER gen-logo.py — it pastes that logo)
node tools/gen-scene.js        # regenerate assets/img/bg-scene.svg (no longer referenced by any page)
node tools/xcheck/cmp-tuvivn.js    # accuracy cross-check vs tuvi.vn (network; 16 charts, 1.5s apart)
node tools/xcheck/cmp-offline.js   # re-check the saved tuvi.vn HTML, optionally with other option values
node tools/xcheck/dac-tinh.js      # miếu/vượng/đắc/bình/hãm table: tuvi.vn vs iztro vs engine
node tools/xcheck/gen-cover.js     # which extra charts to fetch to cover every (star, cung) cell
node tools/xcheck/fetch-extra.js   # fetch those charts (network)
```

`tools/xcheck/README.md` explains the three cross-checks (tuvi.vn, iztro, lasotuvi) and how to use `cmp-offline.js` to decide between two school options. Run all three after touching the engine and update the verification table in `README.md`.

The test file is a hand-rolled runner (`t(name, fn)` + `assert`) with **no name filtering**. To check one thing in isolation, call the engine directly instead of editing the suite:

```sh
node -e "const T=require('./assets/js/tuvi-core.js');const ls=T.lapLaSo({ngay:20,thang:2,nam:1999,gio:5,phut:30,gioiTinh:1,namXem:2026});console.log(ls.cung.map(c=>c.chi+': '+c.sao.map(s=>s.ten).join(', ')).join('\n'))"
```

## Architecture

**Three globals, loaded as classic scripts in a fixed order** (`tuvi-core` → `common` → `render` → page script). Keep that order when editing the HTML.

| Global | File | Role |
|---|---|---|
| `TVTL` | `assets/js/tuvi-core.js` | the whole engine; UMD — `module.exports` under Node, `self.TVTL` in the browser. **No DOM access.** |
| `TVTLCommon` | `assets/js/common.js` | URL params, history (localStorage), toast, `CONFIG` |
| `TVTLRender` | `assets/js/render.js` | turns a chart object into the 12-cung board DOM; no astrology logic. Also `renderInfoCard` (the mobile-only copy of the centre table) and the tap-to-open `<dialog>` cung sheet |
| `TVTLPosts` | `assets/js/posts.js` | the article corpus plus its renderers; `posts-page.js` drives `bai-viet.html`, `booking.js` drives `dat-lich.html` |

`home.js` drives `index.html` (form), `chart-page.js` drives `la-so.html` (hero, toolbar, export).

### Engine conventions

- Cung positions are **1 = Tý … 12 = Hợi**; Can is **1 = Giáp … 10 = Quý**. `_internal.dich(c, n)` walks the địa bàn and wraps 12→1 (never 0). Internal arrays are 1-based with a `null` at index 0 — `lapLaSo` returns `cung.slice(1)`, so the returned array is 0-based while `cung[i].so` stays 1-based.
- `lapLaSo(p)` → `{ info, cung[12], input }`. A cung carries `{so, chi, can, hanh, amDuong, ten, than, daiHan, tieuHanChi, sao[], tuan, triet, dv, ln, thangLuu, trangSinh}`. A star is `{key, ten, hanh, loai, chinh, dacTinh, luu, dv, hoa?}` — `chinh` marks the 14 chính tinh, `luu` marks a lưu tinh of the năm xem, `dv` marks a sao đại vận (placed from the đại vận cung's can/chi), `hoa` marks a base star hit by Tứ Hóa.
- **The same star key can appear three times in one chart** (base, `luu`, `dv`), so anything that locates "the" position of a star must filter `!s.luu && !s.dv`. The test helpers and the cross-check scripts all do this; forgetting it is the most likely way to break them.
- Stars live in the `SAO` registry (`key: [tên, hành, loại]`); `DAC_TINH` holds miếu/vượng/đắc/bình/hãm (exposed as `_internal.DAC_TINH` for tools and tests). Add a star by registering it there, then placing it in `lapLaSo`.
- `DAC_TINH` for the 8 phụ tinh Lộc Tồn, Thiên Mã, Thiên Khốc, Thiên Hư, Thiên Hình, Thiên Riêu, Văn Xương, Văn Khúc was rebuilt from 20 tuvi.vn charts (`tools/xcheck/dac-tinh.js`) and is locked by a test. A `null` cell means **tuvi.vn prints no đắc tính there** — leave it null rather than filling it from lasotuvi or iztro. iztro's brightness table is the Chinese school and must not be merged in (e.g. Kình Dương ở Sửu: TQ miếu vs VN đắc).
- Lunar calendar is Hồ Ngọc Đức's algorithm at GMT+7 (`TVTL.lunar.*`), which is why Vietnamese Tết dates differ from Chinese ones (e.g. 1985).
- Invariant enforced by the tests: every star appears exactly once per chart, and every chart has exactly 14 chính tinh across 1900–2100.

### Five pages, one design system

`index.html` (cast a chart) · `la-so.html` (the chart) · `chuyen-gia.html` · `bai-viet.html` · `dat-lich.html`.
They share `assets/css/style.css` and the same header/footer markup, copied by hand — there is no
templating step, so a header change means editing five files, and `tests/ui.test.js` checks all five
stay in sync (brand name, nav items, favicons, fonts, footer wording).

**Two designs on purpose.** The client asked to keep the homepage as it was before the mockup.
So `index.html` uses the *old* design, with all of its CSS scoped under `body.page-home` in
`style.css` (own token block, Noto Serif, `.wrap` 1200px). The other four pages use the mockup design.
Don't "unify" them or drop the `.page-home` prefix; a test checks the scoping.

**`CONFIG.trangMoi` in `assets/js/common.js` is the one switch** for Chuyên gia · Bài viết · Đặt lịch
(currently `false` = hidden until the client says to show them). When false, `common.js` hides every
`a[href^=<page>]` (or its `.consult-bar` / `.sticky-cta` container; hidden, not removed, because
`chart-page.js` still references `#consult-link`), and `tools/build.js` reads the same line by regex
and leaves the three pages plus `posts.js`, `posts-page.js`, `booking.js` out of `dist/`. Don't add a
second flag anywhere.

The design comes from a mockup the client signed off (a 4-view single-file demo). Two things were
**deliberately not** carried over from it:

- **Hash routing.** The mockup routes views through `location.hash` (`#la-so`, `#chuyen-gia`…). This
  project cannot: the chart's parameters already live in the hash (see below). So each view is its own
  file instead. Only `bai-viet.html` uses the hash, for `#bai-<slug>`, which is safe because no chart
  is involved there.
- **The ivory chart grid.** The mockup only draws a placeholder for it and says to reuse the existing
  code. The whole "LÁ SỐ 12 CUNG" block in the CSS, and all of `render.js`, are the originals with the
  TL-02/03/06 fixes kept.

Colour tokens are the brief's verbatim values (`--tl-purple-950: #1c0e30` … `--tl-gold-300: #e8cf9f`,
`--tl-ivory: #fbf7ef`); a test pins each one. Older token names (`--tl-paper`, `--tl-lav-*`, `--font-serif`)
survive as aliases in `:root` purely so the chart CSS did not have to be rewritten — don't add new uses.

Type is **Cormorant Garamond** for display and **Be Vietnam Pro** for body. Cormorant defaults to
old-style figures, which drop "1" and "8" below the baseline, so anything numeric gets
`font-variant-numeric: lining-nums tabular-nums`.

### Page flow — params go in the URL **hash**

`index.html` form → `TVTLCommon.chartUrl(p)` → `la-so.html#n=..&d=..&m=..`. `readParams()` reads the hash first and only falls back to `location.search`.

This is deliberate: `npx serve` (and similar hosts with cleanUrls) 301-redirects `la-so.html?x=1` to `/la-so` and **drops the query string**, which previously made the chart page show the empty state after submitting. Any new link between pages must keep using `#` + `toQuery(p)`.

Query keys are short and stable (`n d m y al nh h mi tz g nx tx ty hc hn kv tg n15`) — non-default school options only. Changing a key breaks saved links and localStorage history.

The form no longer offers a timezone picker: every chart is cast at **GMT+7** (`home.js` sends `tz: 7`). `lapLaSo` and `fromQuery` still honour a `tz` param so old shared links keep working — don't delete that path.

## Vietnamese vs Chinese school — do not "fix" these

The engine was ported from doanguyen/lasotuvi (MIT, VN school) and cross-checked three ways: against **tuvi.vn** (the reference VN site, 16 hand-picked charts, 208/227 categories), **iztro** (Chinese school, 4,000 random charts) and **lasotuvi itself** (2,000 charts). The remaining iztro divergences are **intentional VN-school behaviour**: Thiên Quý counted backward, Giải Thần following Phượng Các, Hỏa/Linh thuận–nghịch by âm dương nam nữ, Khôi/Việt in năm Canh, Thiên Trù in năm Quý, Phi Liêm, and cung names (Tử Tức vs Tử Nữ). Mệnh chủ / Thân chủ are looked up by **year chi**, not Can. lasotuvi's own bugs that this port fixes — Thai ↔ Dưỡng swapped, Phá Toái, Khôi/Việt, Hỏa/Linh, Lưu Hà, miếu-hãm state leaking between charts via module-level `Sao` singletons — are listed in `README.md`; do not "restore" them to match the Python source.

The remaining differences from tuvi.vn are documented in `README.md` with the evidence for each, mostly tuvi.vn's own inconsistencies. Do not change the engine to match tuvi.vn on those without new evidence.

Disputed points are exposed as options in "Tùy chọn an sao nâng cao" and threaded through `lapLaSo` params (`tuHoaCanh`, `tuHoaNham`, `khoiVietCanh`, `thienGiai`, `tySangNgayMoi`, `nhuanTach15`). Every default except `nhuanTach15` is now confirmed against tuvi.vn — see the table at the end of `README.md`. Change a default only with evidence (a cross-check run, or the user saying the thầy confirmed it), and add a test for it. The URL codes in `common.js` only encode the **non-default** value of each option, so flipping a default means changing its code there too (old codes are kept readable for links already shared).

## Branding and the mobile board — do not undo these

The client signed off a bug list (codes TL-01…TL-11); `tests/ui.test.js` locks every fix. Read its
failure messages before "simplifying" any of the rules below.

- **One brand name only**: `TỬ VI THIÊN LƯƠNG` in caps (logo, header), `Tử Vi Thiên Lương` in prose and
  `<title>`. `tuvithienluong` survives *only* in the domain and in file names (`logo-tuvithienluong-tim-*.png`,
  the downloaded PNG's name). A test fails if it reappears as visible text.
- **The name field must not be reassembled.** `#ten` carries `autocomplete="off"` on purpose: with
  `autocomplete="name"` Chrome refills a saved Vietnamese name in Western order ("Nguyễn Ngọc Kiên" →
  "Ngọc Kiên Nguyễn"). Nothing in the code splits or joins the string and nothing should start to.
- **Under 640px the board must fit the viewport — no horizontal scroll.** The compact layout lives in
  `@media (max-width: 639px)` and **every board-internal rule there is scoped `.board:not(.exporting)`**.
  `.board.exporting` forces 1100px for the html2canvas download, so an unscoped rule would ship the
  cramped phone layout inside the PNG people save. The suite greps for this.
- Mobile rows are `repeat(4, minmax(0, 1fr))`, i.e. **equal heights**, because the Tuần/Triệt badges are
  positioned at 25 / 50 / 75 % of the board's height. Switch them to `auto` and the badges drift into the
  middle of a cung instead of sitting on the shared edge.
- Phụ tinh collapse to 3 per column on mobile (`li:nth-child(n+4)`), with a `+N sao` chip whose count
  `render.js` computes — if you change either number, change both; a test compares them.
- Grid tracks are `minmax(0, 1fr)`, never bare `1fr`. A bare `1fr` takes the item's min-content as its
  floor, so one long label (the history list's "Họ tên · ngày sinh") widened the whole page and brought
  back the horizontal scrollbar. A test rejects bare `1fr`.
- `.tc-panel` is an **opaque** box above `.tam-hop` (z-index 2 vs 0) so the tam-phương lines no longer run
  through the centre text. It must stay inside the trung cung in print too — the print block shrinks its
  padding and font for exactly that reason, otherwise it covers the tiểu hạn labels on the four edges.
- On mobile the centre shows `.tc-crest` (logo + name) and the full table moves to `#chart-info` below the
  board. Both tables come from `TVTLRender.infoRows`, so they can't drift apart.

## Gotchas

- **html2canvas does not support `writing-mode`** — the vertical Tuần/Triệt badge uses `transform: rotate(90deg)` so PNG export matches the screen. Keep it that way.
- Hover/tam-hợp highlighting is gated behind `@media (hover: hover)`; click pins focus, Esc clears. `clearFocus(board)` is called before print and PNG export.
- `.chart-page` and `#content` use `grid-template-columns: minmax(0, 1fr)` to stop the board overflowing on mobile; plain `1fr` reintroduces a horizontal scrollbar.
- `dat-lich.html` has **no backend** — the form never posts anywhere. On submit it builds the request as
  text and offers a "Sao chép nội dung yêu cầu" button so the client pastes it into Zalo. The confirmation
  panel says so in as many words. Wire a real endpoint by replacing `guiYeuCau()` in `booking.js`; don't
  quietly make the form look like it sends.
- The chart page passes the chart to the booking form through the hash (`dat-lich.html#` + `toQuery(params)`),
  which is why `dat-lich.html` loads `tuvi-core.js`. With no hash it falls back to the newest chart in
  localStorage history.
- `CONFIG.lienHeThayUrl` in `common.js` is still empty and now unused by the pages; contact details live
  in `dat-lich.html` as markup. They came from the client's demo and are marked as provisional there.
- `design-1/2/3.html` are the **superseded** theme demos. They still `<link>` `style.css`, so the redesign
  broke their layout. They are excluded from `dist/` and safe to delete once the client confirms.
- Deploy target is free static hosting (Cloudflare Pages), and **never the repo root** — `tools/build.js` assembles `dist/` from an explicit list so the two PDFs, the three `design-*.html` demos, `CLAUDE.md` and `README.md` stay unpublished. Its last step re-scans the built HTML **and JS and CSS** for `assets/...` paths and fails the build on any that was not copied; that check exists because `render.js` injects `assets/img/logo.svg` from JS, where an HTML-only scan misses it. Add a new asset → it is copied automatically; add a demo-only asset → add it to `EXCLUDE`.
- `assets/img/og-image.png` is committed, not built on deploy: Cloudflare's build container has Node but no Pillow. Regenerate it locally with `tools/gen-og.py`, which **aborts if a font lacks a glyph** — Georgia, Bookman and Sylfaen have no `Ư`/`Ơ` and no two-diacritic letters, and a missing glyph renders as an empty box while the script still reports success. Comparing bounding boxes does not detect this (the `.notdef` box has one); the script compares each glyph's bitmap against a code point known to be absent. `✦` is in no Windows font and is drawn as a polygon.
- Chart pages carry the client's name and birth time, so `la-so.html` is built with `noindex` and disallowed in `robots.txt`.
- Assets are cached for 1 day, not a year: filenames carry no content hash, so `immutable` would pin a stale `style.css` on every visitor. Change this only together with hashed filenames.
- `tools/xcheck/cmp-tuvivn.js` posts to a third party's public form. Keep the 1.5s delay, keep the name field as `"A"`, and never send the user's real name or any personal data to it.
