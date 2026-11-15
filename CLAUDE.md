# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Tuvithienluong" — a static web app whose only job is **lập lá số Tử Vi theo phái Việt Nam** (cast a Vietnamese-school Tử Vi birth chart). Interpretation is done by a human thầy afterwards, so do not add reading/luận-giải features, accounts, payments or a backend unless asked.

No build step, no package.json, no npm dependencies. Plain HTML + CSS + classic (non-module) JS. The only runtime third party is html2canvas loaded from cdnjs on `la-so.html`. All user-facing text is Vietnamese.

## Commands

```sh
node tests/engine.test.js      # engine test suite (39 checks, incl. a 2000-chart invariant sweep); exits 1 if any fail
npx serve .                    # serve locally — use this, not just opening index.html, for copy-link/PNG
python -m http.server 8080     # alternative static server
node tools/gen-scene.js        # regenerate assets/img/bg-scene.svg (only when the background art changes)
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
| `TVTLRender` | `assets/js/render.js` | turns a chart object into the 12-cung board DOM; no astrology logic |

`home.js` drives `index.html` (form), `chart-page.js` drives `la-so.html` (hero, toolbar, export).

### Engine conventions

- Cung positions are **1 = Tý … 12 = Hợi**; Can is **1 = Giáp … 10 = Quý**. `_internal.dich(c, n)` walks the địa bàn and wraps 12→1 (never 0). Internal arrays are 1-based with a `null` at index 0 — `lapLaSo` returns `cung.slice(1)`, so the returned array is 0-based while `cung[i].so` stays 1-based.
- `lapLaSo(p)` → `{ info, cung[12], input }`. A cung carries `{so, chi, can, hanh, amDuong, ten, than, daiHan, tieuHanChi, sao[], tuan, triet, dv, ln, thangLuu, trangSinh}`. A star is `{key, ten, hanh, loai, chinh, dacTinh, luu, dv, hoa?}` — `chinh` marks the 14 chính tinh, `luu` marks a lưu tinh of the năm xem, `dv` marks a sao đại vận (placed from the đại vận cung's can/chi), `hoa` marks a base star hit by Tứ Hóa.
- **The same star key can appear three times in one chart** (base, `luu`, `dv`), so anything that locates "the" position of a star must filter `!s.luu && !s.dv`. The test helpers and the cross-check scripts all do this; forgetting it is the most likely way to break them.
- Stars live in the `SAO` registry (`key: [tên, hành, loại]`); `DAC_TINH` holds miếu/vượng/đắc/bình/hãm (exposed as `_internal.DAC_TINH` for tools and tests). Add a star by registering it there, then placing it in `lapLaSo`.
- `DAC_TINH` for the 8 phụ tinh Lộc Tồn, Thiên Mã, Thiên Khốc, Thiên Hư, Thiên Hình, Thiên Riêu, Văn Xương, Văn Khúc was rebuilt from 20 tuvi.vn charts (`tools/xcheck/dac-tinh.js`) and is locked by a test. A `null` cell means **tuvi.vn prints no đắc tính there** — leave it null rather than filling it from lasotuvi or iztro. iztro's brightness table is the Chinese school and must not be merged in (e.g. Kình Dương ở Sửu: TQ miếu vs VN đắc).
- Lunar calendar is Hồ Ngọc Đức's algorithm at GMT+7 (`TVTL.lunar.*`), which is why Vietnamese Tết dates differ from Chinese ones (e.g. 1985).
- Invariant enforced by the tests: every star appears exactly once per chart, and every chart has exactly 14 chính tinh across 1900–2100.

### Page flow — params go in the URL **hash**

`index.html` form → `TVTLCommon.chartUrl(p)` → `la-so.html#n=..&d=..&m=..`. `readParams()` reads the hash first and only falls back to `location.search`.

This is deliberate: `npx serve` (and similar hosts with cleanUrls) 301-redirects `la-so.html?x=1` to `/la-so` and **drops the query string**, which previously made the chart page show the empty state after submitting. Any new link between pages must keep using `#` + `toQuery(p)`.

Query keys are short and stable (`n d m y al nh h mi tz g nx tx ty hc hn kv tg n15`) — non-default school options only. Changing a key breaks saved links and localStorage history.

The form no longer offers a timezone picker: every chart is cast at **GMT+7** (`home.js` sends `tz: 7`). `lapLaSo` and `fromQuery` still honour a `tz` param so old shared links keep working — don't delete that path.

## Vietnamese vs Chinese school — do not "fix" these

The engine was ported from doanguyen/lasotuvi (MIT, VN school) and cross-checked three ways: against **tuvi.vn** (the reference VN site, 16 hand-picked charts, 208/227 categories), **iztro** (Chinese school, 4,000 random charts) and **lasotuvi itself** (2,000 charts). The remaining iztro divergences are **intentional VN-school behaviour**: Thiên Quý counted backward, Giải Thần following Phượng Các, Hỏa/Linh thuận–nghịch by âm dương nam nữ, Khôi/Việt in năm Canh, Thiên Trù in năm Quý, Phi Liêm, and cung names (Tử Tức vs Tử Nữ). Mệnh chủ / Thân chủ are looked up by **year chi**, not Can. lasotuvi's own bugs that this port fixes — Thai ↔ Dưỡng swapped, Phá Toái, Khôi/Việt, Hỏa/Linh, Lưu Hà, miếu-hãm state leaking between charts via module-level `Sao` singletons — are listed in `README.md`; do not "restore" them to match the Python source.

The remaining differences from tuvi.vn are documented in `README.md` with the evidence for each, mostly tuvi.vn's own inconsistencies. Do not change the engine to match tuvi.vn on those without new evidence.

Disputed points are exposed as options in "Tùy chọn an sao nâng cao" and threaded through `lapLaSo` params (`tuHoaCanh`, `tuHoaNham`, `khoiVietCanh`, `thienGiai`, `tySangNgayMoi`, `nhuanTach15`). Every default except `nhuanTach15` is now confirmed against tuvi.vn — see the table at the end of `README.md`. Change a default only with evidence (a cross-check run, or the user saying the thầy confirmed it), and add a test for it. The URL codes in `common.js` only encode the **non-default** value of each option, so flipping a default means changing its code there too (old codes are kept readable for links already shared).

## Gotchas

- **html2canvas does not support `writing-mode`** — the vertical Tuần/Triệt badge uses `transform: rotate(90deg)` so PNG export matches the screen. Keep it that way.
- Hover/tam-hợp highlighting is gated behind `@media (hover: hover)`; click pins focus, Esc clears. `clearFocus(board)` is called before print and PNG export.
- `.chart-page` and `#content` use `grid-template-columns: minmax(0, 1fr)` to stop the board overflowing on mobile; plain `1fr` reintroduces a horizontal scrollbar.
- `CONFIG.lienHeThayUrl` in `common.js` is empty, which hides the CTA band. The user will supply the thầy's Zalo/Messenger link later.
- Deploy target is free static hosting (Cloudflare Pages). `tests/`, `tools/`, the PDFs and the `.jpg` reference screenshots in the root are working material, not part of what gets published.
- `tools/xcheck/cmp-tuvivn.js` posts to a third party's public form. Keep the 1.5s delay, keep the name field as `"A"`, and never send the user's real name or any personal data to it.
