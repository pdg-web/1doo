// 원두노트 빌드 스크립트
// products.json 을 읽어 dist/ 폴더에 정적 HTML(홈, 전체 목록, 브랜드별, 원두별), sitemap.xml, robots.txt, 404.html 을 만듭니다.
// GitHub Actions 가 products.json 이 바뀔 때마다 자동으로 실행하므로 직접 실행할 필요는 없습니다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'dist');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'products.json'), 'utf8'));

function fail(msg) { console.error('\n[products.json 오류] ' + msg + '\n'); process.exit(1); }

const CSS = String.raw`/* 원두노트 스타일. 어두운 에스프레소 띠 위의 큰 타이포, 로스팅 5색 스펙트럼, 로고가 큰 목록. 포인트색은 호박색 하나. */
:root {
  --bg: #FAF9F7; --surface: #F1EFEB; --fg: #17120F; --muted: #5F5750; --line: #E2DED7;
  --band: #1B130E; --band-fg: #F6EFE6; --band-muted: #BFB3A5; --band-line: #3A2D24;
  --brand-ink: #9A5B17; --accent: #F2A93B; --on-accent: #17120F;
  --r1: #E6BC78; --r2: #C98E41; --r3: #97622F; --r4: #5F3A22; --r5: #2A1A12;
  --on-r1: #17120F; --on-r2: #17120F; --on-r3: #FFFFFF; --on-r4: #FFFFFF; --on-r5: #FFFFFF;
  --font: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", system-ui, sans-serif;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #0F0B09; --surface: #18110D; --fg: #F4EDE4; --muted: #B3A699; --line: #2E241D;
    --band: #1E1510; --brand-ink: #F2A93B;
    --r1: #EBC98A; --r2: #D39C52; --r3: #B07A47; --r4: #7A4E32; --r5: #4A3126;
    color-scheme: dark;
  }
}
:root[data-theme="dark"] {
  --bg: #0F0B09; --surface: #18110D; --fg: #F4EDE4; --muted: #B3A699; --line: #2E241D;
  --band: #1E1510; --brand-ink: #F2A93B;
  --r1: #EBC98A; --r2: #D39C52; --r3: #B07A47; --r4: #7A4E32; --r5: #4A3126;
  color-scheme: dark;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; background: var(--bg); color: var(--fg); font-family: var(--font); font-size: 16px; line-height: 1.65; -webkit-font-smoothing: antialiased; font-variant-numeric: tabular-nums; }
.in { max-width: 1120px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
a { color: inherit; }
button { font: inherit; color: inherit; }
:focus-visible { outline: 3px solid var(--fg); outline-offset: 3px; }
.band :focus-visible { outline-color: var(--accent); }
[hidden] { display: none !important; }
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

/* 띠와 헤더 */
.band { background: var(--band); color: var(--band-fg); }
.top .in { display: flex; justify-content: space-between; align-items: center; gap: 12px 24px; padding-block: 20px; flex-wrap: wrap; }
.brand { font-weight: 900; font-size: 1.2rem; letter-spacing: -0.02em; display: inline-flex; align-items: center; gap: 10px; text-decoration: none; }
.brand i { width: 12px; height: 12px; border-radius: 50%; background: var(--accent); }
.nav { display: flex; gap: 22px; font-size: 0.92rem; color: var(--band-muted); flex-wrap: wrap; }
.nav a { text-decoration: none; }
.nav a:hover { color: var(--band-fg); }

/* 히어로 */
.hero .in { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 40px 56px; align-items: center; padding-block: 36px 72px; }
h1 { font-weight: 900; font-size: clamp(2.6rem, 6.2vw, 5rem); line-height: 1.12; letter-spacing: -0.03em; margin: 0 0 26px; word-break: keep-all; text-wrap: balance; }
.hero .lead { color: var(--band-muted); max-width: 32em; margin: 0 0 32px; font-size: 1.05rem; word-break: keep-all; }
.hero-row { display: flex; align-items: center; gap: 16px 26px; flex-wrap: wrap; }
.cta { display: inline-flex; align-items: center; gap: 10px; padding: 16px 26px; background: var(--accent); color: var(--on-accent); font-weight: 700; border-radius: 6px; text-decoration: none; }
.cta:hover { filter: brightness(1.06); }
.hero-meta { color: var(--band-muted); font-size: 0.85rem; }

/* 오늘의 원두 슬라이드 */
.slider { min-width: 0; }
.viewport { overflow: hidden; }
.track { display: flex; transition: transform .7s cubic-bezier(.65, 0, .25, 1); }
.slide { flex: 0 0 100%; min-width: 0; }
.bsheet { border-top: 2px solid var(--band-fg); font-size: 0.88rem; line-height: 1.5; }
.bsheet .head { display: flex; align-items: center; gap: 14px; padding: 14px 0 12px; border-bottom: 1px solid var(--band-line); }
.bsheet .head small { display: block; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--band-muted); }
.bsheet .head b { color: var(--accent); display: block; font-weight: 800; font-size: 0.95rem; }
.bsheet .head a { display: block; font-weight: 800; font-size: 1.2rem; letter-spacing: -0.02em; text-decoration: none; line-height: 1.3; }
.bsheet .r { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 10px 0; border-bottom: 1px solid var(--band-line); }
.bsheet .r > span:first-child { color: var(--band-muted); flex: none; }
.bsheet .r > span:last-child { text-align: right; min-width: 0; display: inline-flex; align-items: center; gap: 10px; justify-content: flex-end; }
.band .bar i { background: var(--band-line); }
.band .rlabel { color: var(--band-muted); }
.sdots { display: flex; gap: 4px; margin-top: 10px; }
.sdot { width: 32px; height: 22px; padding: 0; border: 0; background: none; cursor: pointer; display: flex; align-items: center; }
.sdot span { display: block; width: 100%; height: 2px; background: var(--band-line); }
.sdot[aria-current="true"] span { background: var(--band-fg); }

/* 로고 */
.logo { display: inline-flex; align-items: center; justify-content: center; flex: none; width: 64px; height: 64px; padding: 8px; border-radius: 10px; background: #FFFFFF; color: #17120F; border: 1px solid var(--line); overflow: hidden; font-weight: 900; font-size: 1.7rem; line-height: 1; }
.logo img { display: block; max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; }
.logo.dk { color: #FFFFFF; border-color: transparent; }
.logo.mono { padding: 0; }
.logo.lg { height: 96px; width: auto; min-width: 96px; max-width: 260px; padding: 14px 20px; border-radius: 14px; font-size: 2.6rem; }
.logo.lg.mono { width: 96px; padding: 0; }
.logo.sm { height: 40px; width: auto; min-width: 40px; max-width: 120px; padding: 5px 9px; border-radius: 8px; font-size: 1.1rem; }
.logo.sm.mono { width: 40px; padding: 0; }
.logo.xs { width: 44px; height: 44px; padding: 6px; border-radius: 8px; font-size: 1.2rem; }

/* 로스팅 스펙트럼 */
.spec .in { padding-block: 44px 20px; }
.sec-top { display: flex; justify-content: space-between; align-items: baseline; gap: 12px 24px; flex-wrap: wrap; margin-bottom: 16px; }
h2 { font-weight: 800; font-size: clamp(1.5rem, 3.4vw, 2.1rem); letter-spacing: -0.025em; line-height: 1.25; margin: 0; word-break: keep-all; }
.reset { border: 0; background: none; padding: 0; font-size: 0.9rem; font-weight: 700; border-bottom: 2px solid var(--fg); cursor: pointer; }
.blocks { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 6px; }
.blk { border-radius: 6px; padding: 16px; min-height: 136px; text-decoration: none; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; background: var(--c); color: var(--on-c); min-width: 0; }
.blk b { display: block; font-size: 1rem; font-weight: 700; line-height: 1.3; word-break: keep-all; }
.blk small { display: block; font-size: 0.78rem; line-height: 1.4; opacity: 0.85; margin-top: 4px; word-break: keep-all; }
.blk .n { font-size: 2rem; font-weight: 900; line-height: 1; letter-spacing: -0.02em; }
.blk .n span { font-size: 0.8rem; font-weight: 500; margin-left: 3px; letter-spacing: 0; }
.blk[data-r="1"] { --c: var(--r1); --on-c: var(--on-r1); }
.blk[data-r="2"] { --c: var(--r2); --on-c: var(--on-r2); }
.blk[data-r="3"] { --c: var(--r3); --on-c: var(--on-r3); }
.blk[data-r="4"] { --c: var(--r4); --on-c: var(--on-r4); }
.blk[data-r="5"] { --c: var(--r5); --on-c: var(--on-r5); box-shadow: inset 0 0 0 1px var(--line); }
.blk[data-r="0"] { --c: transparent; --on-c: var(--fg); box-shadow: inset 0 0 0 1.5px var(--muted); background-image: repeating-linear-gradient(135deg, transparent 0 7px, var(--line) 7px 8px); }
.blk[aria-pressed="true"] { outline: 3px solid var(--fg); outline-offset: 3px; }
.blocks.filtered .blk:not([aria-pressed="true"]) { opacity: 0.5; }

/* 목록 */
.listing .in { padding-block: 40px 64px; }
.count { color: var(--muted); font-size: 0.9rem; }
.note { color: var(--muted); font-size: 0.8rem; margin: 6px 0 22px; }
.rows { list-style: none; margin: 0; padding: 0; border-top: 3px solid var(--fg); }
.rows.fresh { animation: fade .22s ease-out; }
@keyframes fade { from { opacity: 0.2; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.item { border-bottom: 1px solid var(--line); }
.item.late { display: none; }
.row { position: relative; display: grid; grid-template-columns: 56px minmax(0, 2fr) minmax(0, 1.3fr) 140px 92px 150px; grid-template-areas: "no main notes roast rv buy"; gap: 6px 20px; align-items: center; padding: 20px 0; }
.row:hover { background: var(--surface); box-shadow: -12px 0 0 var(--surface), 12px 0 0 var(--surface); }
.rows.nonum .row { grid-template-columns: minmax(0, 2fr) minmax(0, 1.3fr) 140px 92px 150px; grid-template-areas: "main notes roast rv buy"; }
.rows.nonum .no { display: none; }
.no { grid-area: no; font-weight: 900; font-size: 2.4rem; line-height: 1; letter-spacing: -0.03em; color: var(--muted); opacity: 0.55; }
.row.top .no { color: var(--fg); opacity: 1; }
.open { grid-area: main; min-width: 0; display: flex; align-items: center; gap: 16px; text-decoration: none; }
.open::after { content: ""; position: absolute; inset: 0; }
.txt { min-width: 0; display: block; }
.brandname { color: var(--brand-ink); display: block; font-weight: 800; font-size: 1.05rem; letter-spacing: -0.01em; line-height: 1.3; }
.beanname { display: block; font-weight: 700; font-size: 1.25rem; letter-spacing: -0.02em; line-height: 1.3; word-break: keep-all; }
.open:hover .beanname { text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 3px; }
.meta { display: block; font-size: 0.82rem; color: var(--muted); margin-top: 2px; }
.notes { grid-area: notes; margin: 0; word-break: keep-all; }
.roast { grid-area: roast; display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; color: var(--muted); }
.rlabel { font-size: 0.8rem; color: var(--muted); }
.bar { display: flex; gap: 3px; }
.bar i { width: 16px; height: 7px; border-radius: 1px; background: var(--line); }
.bar i.on:nth-child(1) { background: var(--r1); } .bar i.on:nth-child(2) { background: var(--r2); }
.bar i.on:nth-child(3) { background: var(--r3); } .bar i.on:nth-child(4) { background: var(--r4); }
.bar i.on:nth-child(5) { background: var(--r5); box-shadow: inset 0 0 0 1px var(--line); }
.rv { grid-area: rv; font-size: 0.82rem; color: var(--muted); text-align: right; }
.buyc { grid-area: buy; justify-self: end; position: relative; z-index: 1; display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.buy { font-weight: 700; font-size: 0.92rem; text-decoration: none; border-bottom: 2px solid var(--fg); padding-bottom: 1px; white-space: nowrap; }
.buy:hover { border-color: var(--accent); }
.aff { font-size: 0.7rem; color: var(--muted); }
.more-row { display: flex; align-items: center; gap: 14px 24px; flex-wrap: wrap; margin-top: 26px; }
.more { display: inline-block; border: 2px solid var(--fg); background: transparent; padding: 12px 22px; border-radius: 6px; font-weight: 700; cursor: pointer; text-decoration: none; }
.more:hover { background: var(--fg); color: var(--bg); }
.more2 { font-size: 0.9rem; font-weight: 700; text-decoration: none; border-bottom: 2px solid var(--fg); }
.empty { padding: 32px 0; color: var(--muted); }

/* 일반 섹션 */
.sec .in { padding-block: 56px; }
.sec .in::before { content: ""; display: block; height: 1px; background: var(--line); margin-bottom: 56px; }
.desc { color: var(--muted); margin: 0; max-width: 38em; word-break: keep-all; }
.sec-head { display: flex; justify-content: space-between; align-items: end; gap: 16px 40px; margin-bottom: 26px; flex-wrap: wrap; }
.sec-head .desc { flex: 1 1 280px; max-width: 30em; }
.eyebrow { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin: 0 0 10px; }
.chips { display: flex; gap: 8px; flex-wrap: wrap; }
.chip { font: inherit; font-size: 0.9rem; padding: 7px 15px; border-radius: 999px; border: 1px solid var(--line); background: transparent; color: var(--fg); cursor: pointer; line-height: 1.5; text-decoration: none; display: inline-block; }
.chip:hover { border-color: var(--fg); }
.chip[aria-pressed="true"], .chip[aria-current="page"] { background: var(--fg); color: var(--bg); border-color: var(--fg); }

/* 브랜드 카드 */
.brands { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.bcard { display: flex; flex-direction: column; gap: 12px; padding: 18px; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); text-decoration: none; min-width: 0; }
.bcard:hover { border-color: var(--fg); }
.bcard .bh { display: flex; align-items: center; gap: 12px; min-width: 0; }
.bcard b { font-size: 1.1rem; font-weight: 800; letter-spacing: -0.015em; }
.bcard .m { font-size: 0.82rem; color: var(--muted); }
.bcard .bn { font-size: 0.86rem; color: var(--muted); margin: 0; word-break: keep-all; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.sub-h { font-size: 1.1rem; font-weight: 800; margin: 40px 0 14px; }

/* 커피용품 */
.gear { list-style: none; margin: 0; padding: 0; border-top: 3px solid var(--fg); }
.grow { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 2fr) auto; gap: 8px 24px; align-items: center; padding: 18px 0; border-bottom: 1px solid var(--line); }
.grow h3 { margin: 0; font-size: 1.1rem; font-weight: 800; }
.grow p { margin: 0; color: var(--muted); font-size: 0.92rem; word-break: keep-all; }
.grow p b { color: var(--fg); font-weight: 700; }

/* 계산기 */
.calc { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 48px; align-items: start; }
.field { display: grid; gap: 8px; margin-bottom: 22px; }
.field label, .field .lbl { font-size: 0.85rem; color: var(--muted); }
.field input[type="number"] { font: inherit; font-size: 1.4rem; width: 160px; max-width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); color: var(--fg); }
.out { border-top: 3px solid var(--fg); padding-top: 18px; }
.out .big { font-weight: 900; font-size: clamp(2.8rem, 7vw, 4.2rem); letter-spacing: -0.03em; line-height: 1.05; }
.out .big span { font-size: 1.1rem; font-weight: 500; color: var(--muted); margin-left: 6px; letter-spacing: 0; }
.out ul { list-style: none; padding: 0; margin: 20px 0 0; font-size: 0.9rem; }
.out li { display: flex; justify-content: space-between; gap: 16px; padding: 10px 0; border-bottom: 1px solid var(--line); }
.out li span:first-child { color: var(--muted); }

/* 안쪽 페이지 */
.crumbs { display: flex; gap: 8px; flex-wrap: wrap; font-size: 0.82rem; color: var(--muted); padding-top: 24px; }
.crumbs a { text-decoration: none; }
.crumbs a:hover { color: var(--fg); }
.phead { padding-block: 20px 28px; }
.page-title { font-weight: 900; font-size: clamp(1.9rem, 4.6vw, 3rem); line-height: 1.2; letter-spacing: -0.03em; margin: 0 0 14px; word-break: keep-all; text-wrap: balance; }
.lead { color: var(--muted); max-width: 38em; margin: 0 0 24px; word-break: keep-all; }
.bhero { display: flex; align-items: center; gap: 22px; margin-bottom: 18px; flex-wrap: wrap; }
.bhero .page-title { margin: 0; }
.tools { display: flex; gap: 10px; flex-wrap: wrap; margin: 24px 0 14px; }
.tools input, .tools select { font: inherit; font-size: 0.95rem; padding: 10px 14px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); color: var(--fg); min-width: 0; }
.tools input { flex: 1 1 260px; max-width: 460px; }
.fgroup { display: flex; gap: 8px 14px; align-items: baseline; flex-wrap: wrap; margin-bottom: 12px; }
.flabel { font-size: 0.82rem; color: var(--muted); width: 48px; flex: none; }
.toolbar { margin-bottom: 8px; }

.dpage { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 48px; padding-block: 24px 48px; align-items: start; }
.d-id { display: flex; align-items: center; gap: 22px; min-width: 0; margin-bottom: 22px; }
.d-brand { color: var(--brand-ink); display: block; font-weight: 800; font-size: 1.45rem; letter-spacing: -0.02em; line-height: 1.25; text-decoration: none; }
.d-brand:hover { text-decoration: underline; text-underline-offset: 3px; }
.d-name { font-weight: 900; font-size: clamp(1.8rem, 4vw, 2.6rem); letter-spacing: -0.03em; line-height: 1.2; margin: 0; word-break: keep-all; }
.actions { display: flex; gap: 10px; flex-wrap: wrap; }
.cta2 { display: inline-block; padding: 13px 22px; background: var(--accent); color: var(--on-accent); font-weight: 700; border-radius: 6px; text-decoration: none; }
.cta2:hover { filter: brightness(1.06); }
.ghost { display: inline-block; padding: 11px 20px; border: 2px solid var(--fg); border-radius: 6px; font-weight: 700; text-decoration: none; }
.ghost:hover { background: var(--fg); color: var(--bg); }
.sheet { border-top: 3px solid var(--fg); font-size: 0.92rem; }
.sheet .r { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 11px 0; border-bottom: 1px solid var(--line); }
.sheet .r > span:first-child { color: var(--muted); flex: none; }
.sheet .r > span:last-child { text-align: right; min-width: 0; display: inline-flex; align-items: center; gap: 10px; justify-content: flex-end; }
.tight .in { padding-block: 40px; }
.tight h2 { margin-bottom: 20px; }
.prose p { max-width: 38em; margin: 0 0 12px; word-break: keep-all; }

/* 푸터 */
footer .in { padding-block: 0 56px; color: var(--muted); font-size: 0.85rem; }
footer .fin { border-top: 1px solid var(--line); padding-top: 32px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); gap: 24px 48px; }
footer p { margin: 0 0 14px; max-width: 42em; word-break: keep-all; }
footer .flinks { display: flex; flex-wrap: wrap; gap: 6px 16px; }
footer .flinks a { text-decoration: none; }
footer .flinks a:hover { color: var(--fg); }

@media (max-width: 900px) {
  .blocks { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .brands { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .hero .in { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 760px) {
  .hero .in { padding-block: 24px 48px; }
  .blocks { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .blk { min-height: 112px; padding: 14px; }
  .row { grid-template-columns: 40px minmax(0, 1fr) auto; grid-template-areas: "no main buy" "no notes notes" "no roast rv"; gap: 10px 12px; align-items: start; }
  .rows.nonum .row { grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: "main buy" "notes notes" "roast rv"; }
  .no { font-size: 1.7rem; }
  .open { gap: 12px; }
  .logo { width: 52px; height: 52px; font-size: 1.4rem; padding: 6px; }
  .beanname { font-size: 1.1rem; }
  .rv { text-align: right; align-self: center; }
  .roast { align-self: center; }
  .sec .in { padding-block: 44px; }
  .sec .in::before { margin-bottom: 44px; }
  .grow { grid-template-columns: minmax(0, 1fr) auto; }
  .grow p { grid-column: 1 / -1; order: 3; }
  .calc, .dpage, footer .fin { grid-template-columns: minmax(0, 1fr); gap: 28px; }
  .logo.lg { height: 76px; min-width: 76px; padding: 10px 14px; }
  .logo.lg.mono { width: 76px; font-size: 2rem; }
  .nav { gap: 16px; }
}
@media (prefers-reduced-motion: reduce) { .track { transition: none; } .rows.fresh { animation: none; } html { scroll-behavior: auto; } }
@media (prefers-reduced-motion: no-preference) { .blk { transition: transform .15s, opacity .2s; } .blk:hover { transform: translateY(-3px); } .cta, .cta2, .buy, .more, .chip, .bcard, .ghost { transition: filter .15s, border-color .15s, background-color .15s, color .15s; } }
.grow .buyc { grid-area: auto; }
button.blk { border: 0; font: inherit; text-align: left; cursor: pointer; }
.blk > span:first-child { display: block; }

/* 형태 아이콘과 구매 영역 */
.row .buyc { pointer-events: none; z-index: 0; align-items: flex-end; gap: 6px; }
.fis { display: inline-flex; gap: 6px; align-items: center; flex-wrap: wrap; justify-content: flex-end; color: var(--fg); }
.fi { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: 1px solid var(--line); border-radius: 8px; background: var(--bg); }
.fi.dc { width: auto; padding: 0 8px; font-size: 0.72rem; font-weight: 700; color: var(--muted); }
.ic { width: 20px; height: 20px; display: block; flex: none; }
.go { font-size: 0.78rem; color: var(--muted); white-space: nowrap; }
.row:hover .go { color: var(--fg); }
.flegend { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 16px; }
.fl { display: inline-flex; align-items: center; gap: 5px; color: var(--fg); }
.fl .ic { width: 16px; height: 16px; }
.buybox { margin-top: 26px; max-width: 520px; }
.buylist { list-style: none; margin: 0 0 12px; padding: 0; border-top: 3px solid var(--fg); }
.buylist li { display: flex; justify-content: space-between; align-items: center; gap: 12px 16px; padding: 14px 0; border-bottom: 1px solid var(--line); flex-wrap: wrap; }
.bf { display: flex; align-items: center; gap: 12px; min-width: 0; }
.bf .ic { width: 28px; height: 28px; }
.bf b { display: block; font-weight: 800; line-height: 1.3; }
.bf small { display: block; color: var(--muted); font-size: 0.8rem; }
@media (max-width: 760px) { .row .buyc { align-items: flex-end; } .fi { width: 30px; height: 30px; } }`;
const APPJS = String.raw`(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  // 1) 홈 '오늘의 원두' 슬라이드: 5초마다 옆으로 넘어갑니다.
  var sl = document.getElementById('slider');
  if (sl) {
    var track = document.getElementById('track');
    var slides = track.querySelectorAll('.slide');
    var dots = sl.querySelectorAll('.sdot');
    var idx = 0, timer = null, n = slides.length;
    var go = function (i) {
      idx = (i + n) % n;
      track.style.transform = 'translateX(-' + (idx * 100) + '%)';
      each(slides, function (el, k) { if (k === idx) el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', 'true'); });
      each(dots, function (el, k) { el.setAttribute('aria-current', k === idx ? 'true' : 'false'); });
    };
    var start = function () { if (reduce || n < 2 || timer) return; timer = setInterval(function () { go(idx + 1); }, 5000); };
    var stop = function () { clearInterval(timer); timer = null; };
    each(dots, function (el, k) { el.addEventListener('click', function () { go(k); stop(); start(); }); });
    sl.addEventListener('mouseenter', stop);
    sl.addEventListener('mouseleave', start);
    sl.addEventListener('focusin', stop);
    sl.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    start();
  }

  // 2) 전체 목록: 검색, 정렬, 형태와 브랜드 필터 (자바스크립트가 꺼져 있으면 도구는 숨겨지고 전체 목록이 보입니다.)
  var lp = document.getElementById('list-page');
  if (lp) {
    var toolbar = document.getElementById('toolbar');
    var list = document.getElementById('beans');
    var rows = Array.prototype.slice.call(list.children);
    var count = document.getElementById('count');
    var empty = document.getElementById('empty');
    var q = document.getElementById('q');
    var sortSel = document.getElementById('sort');
    var st = { q: '', form: '전체', brand: '전체', roast: '전체', sort: 'pop' };
    var blocksEl = document.getElementById('blocks');
    var resetBtn = document.getElementById('reset');

    var params = new URLSearchParams(location.search);
    if (params.get('q')) st.q = params.get('q');
    if (params.get('form')) st.form = params.get('form');
    if (params.get('brand')) st.brand = params.get('brand');
    if (params.get('sort')) st.sort = params.get('sort');
    if (/^[0-5]$/.test(params.get('roast') || '')) st.roast = params.get('roast');

    var num = function (el, k) { return parseFloat(el.getAttribute(k)); };
    var byPop = function (a, b) { return (num(b, 'data-reviews') - num(a, 'data-reviews')) || (num(a, 'data-i') - num(b, 'data-i')); };
    var roastKey = function (el, dir) { var r = num(el, 'data-roast'); return r > 0 ? r * dir : 99; };
    var sorters = {
      pop: byPop,
      light: function (a, b) { return (roastKey(a, 1) - roastKey(b, 1)) || byPop(a, b); },
      dark: function (a, b) { return (roastKey(a, -1) - roastKey(b, -1)) || byPop(a, b); },
      name: function (a, b) { return a.getAttribute('data-name').localeCompare(b.getAttribute('data-name'), 'ko'); }
    };

    var setPressed = function (groupId, value) {
      var matched = false;
      each(document.querySelectorAll('#' + groupId + ' button'), function (b) {
        var on = b.getAttribute('data-v') === value;
        if (on) matched = true;
        b.setAttribute('aria-pressed', String(on));
      });
      return matched;
    };

    var apply = function () {
      var term = st.q.trim().toLowerCase();
      var shown = [];
      rows.forEach(function (r) {
        var ok = (st.form === '전체' || (' ' + r.getAttribute('data-forms') + ' ').indexOf(' ' + st.form + ' ') > -1) &&
                 (st.brand === '전체' || r.getAttribute('data-brand') === st.brand) &&
                 (st.roast === '전체' || (st.roast === '0' ? !(num(r, 'data-roast') > 0) : num(r, 'data-roast') === parseInt(st.roast, 10))) &&
                 (!term || r.getAttribute('data-search').indexOf(term) > -1);
        r.hidden = !ok;
        if (ok) shown.push(r);
      });
      shown.sort(sorters[st.sort] || sorters.pop).forEach(function (r) { list.appendChild(r); });
      count.textContent = shown.length + '개 상품';
      empty.hidden = shown.length !== 0;
      var plain = st.sort === 'pop' && st.roast === '전체' && st.form === '전체' && st.brand === '전체' && !term;
      list.classList.toggle('nonum', !plain);
      blocksEl.classList.toggle('filtered', st.roast !== '전체');
      each(blocksEl.querySelectorAll('.blk'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === st.roast)); });
      resetBtn.hidden = st.roast === '전체';

      var p = new URLSearchParams();
      if (st.q) p.set('q', st.q);
      if (st.form !== '전체') p.set('form', st.form);
      if (st.brand !== '전체') p.set('brand', st.brand);
      if (st.roast !== '전체') p.set('roast', st.roast);
      if (st.sort !== 'pop') p.set('sort', st.sort);
      var s = p.toString();
      try { history.replaceState(null, '', location.pathname + (s ? '?' + s : '')); } catch (e) {}
    };

    if (!setPressed('chips-form', st.form)) { st.form = '전체'; setPressed('chips-form', '전체'); }
    if (!setPressed('chips-brand', st.brand)) { st.brand = '전체'; setPressed('chips-brand', '전체'); }
    q.value = st.q;
    if (!sorters[st.sort]) st.sort = 'pop';
    sortSel.value = st.sort;

    document.getElementById('chips-form').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      st.form = b.getAttribute('data-v'); setPressed('chips-form', st.form); apply();
    });
    document.getElementById('chips-brand').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      st.brand = b.getAttribute('data-v'); setPressed('chips-brand', st.brand); apply();
    });
    blocksEl.addEventListener('click', function (e) {
      var b = e.target.closest('.blk'); if (!b) return;
      var v = b.getAttribute('data-v');
      st.roast = st.roast === v ? '전체' : v; apply();
    });
    resetBtn.addEventListener('click', function () { st.roast = '전체'; apply(); });
    q.addEventListener('input', function () { st.q = q.value; apply(); });
    sortSel.addEventListener('change', function () { st.sort = sortSel.value; apply(); });

    toolbar.hidden = false;
    apply();
  }

  // 3) 추출 비율 계산기
  var bean = document.getElementById('beanG');
  if (bean) {
    var ratio = 16;
    var calc = function () {
      var g = parseFloat(bean.value);
      if (!(g > 0)) g = 0;
      var w = Math.round(g * ratio);
      document.getElementById('waterOut').textContent = w;
      document.getElementById('ratioOut').textContent = '1 : ' + ratio;
      document.getElementById('cupOut').textContent = '약 ' + Math.max(0, Math.round(w - g * 2)) + ' ml';
    };
    var rc = document.getElementById('ratioChips');
    rc.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      ratio = parseInt(b.getAttribute('data-r'), 10);
      each(rc.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      calc();
    });
    bean.addEventListener('input', calc);
    calc();
  }
})();
`;

// ---------- 설정과 검증 ----------
const site = Object.assign({ name: '원두노트', url: '', affiliate: false }, data.site || {});
site.url = String(site.url || '').replace(/\/+$/, '');
if (!/^https?:\/\//.test(site.url)) fail('site.url 은 https:// 로 시작하는 사이트 주소여야 합니다.');
const BASE = new URL(site.url).pathname.replace(/\/+$/, '');
const UPDATED = data.updated || '';
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const brands = data.brands || [];
const brandByName = new Map();
const brandSlugs = new Set();
brands.forEach((b, i) => {
  if (!b || !b.name) fail('brands[' + i + '] 에 name 이 없습니다.');
  if (!SLUG.test(b.slug || '')) fail('브랜드 "' + b.name + '" 의 slug 는 영문 소문자, 숫자, 하이픈만 쓸 수 있습니다.');
  if (brandByName.has(b.name)) fail('브랜드 이름이 중복되었습니다: ' + b.name);
  if (brandSlugs.has(b.slug)) fail('브랜드 slug 가 중복되었습니다: ' + b.slug);
  brandByName.set(b.name, b);
  brandSlugs.add(b.slug);
  // 로고는 저장소 안의 이미지 파일 경로만 허용합니다. 예: logos/fritz.png (파일이 없으면 글자 배지로 대신 표시)
  // logoBg: 로고 뒤 판의 색. 비우면 흰색, "dark" 는 어두운 색, 직접 지정하려면 #1c1b19 같은 색 코드를 씁니다.
  b.logoBgCss = '';
  if (b.logoBg && b.logoBg !== 'light') {
    if (b.logoBg === 'dark') b.logoBgCss = '#1c1b19';
    else if (/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(b.logoBg)) b.logoBgCss = b.logoBg;
    else fail('브랜드 "' + b.name + '" 의 logoBg 는 비우거나 "dark", 또는 #1c1b19 같은 색 코드여야 합니다: ' + b.logoBg);
  }
  b.logoPath = null;
  if (b.logo) {
    const lp = String(b.logo);
    if (!/^[A-Za-z0-9._\-\/]+$/.test(lp) || lp.includes('..') || lp.startsWith('/')) fail('브랜드 "' + b.name + '" 의 logo 경로가 올바르지 않습니다. 예: logos/fritz.png');
    if (!/\.(png|jpe?g|webp|svg|gif)$/i.test(lp)) fail('브랜드 "' + b.name + '" 의 logo 는 png, jpg, webp, svg, gif 파일이어야 합니다: ' + lp);
    if (fs.existsSync(path.join(ROOT, lp))) b.logoPath = lp;
    else console.warn('[알림] 브랜드 "' + b.name + '" 의 로고 파일을 찾지 못해 글자 배지로 표시합니다: ' + lp);
  }
});

const FORMS = data.forms || [];
if (!FORMS.length) fail('forms 가 비어 있습니다. 예: ["원두", "드립백", "콜드브루", "캡슐"] (아이콘 표시 순서이기도 합니다)');
const itemSlugs = new Set();
const items = (data.items || []).map((it, i) => {
  const label = '상품 ' + (i + 1) + (it && it.name ? ' (' + it.name + ')' : '');
  if (!it || !it.name) fail(label + ': name 이 없습니다.');
  if (!brandByName.has(it.brand)) fail(label + ': brand "' + it.brand + '" 가 brands 목록에 없습니다.');
  if (!SLUG.test(it.slug || '')) fail(label + ': slug 는 영문 소문자, 숫자, 하이픈만 쓸 수 있습니다. 예: fritz-old-dog');
  if (itemSlugs.has(it.slug)) fail(label + ': slug 가 다른 상품과 중복됩니다: ' + it.slug);
  itemSlugs.add(it.slug);
  const o = Object.assign({ notes: '', roast: 0, roastLabel: '', reviews: null, featured: false, description: '', decaf: false }, it, { i });
  // options: 이 상품을 살 수 있는 형태(원두, 드립백, 콜드브루, 캡슐)별 용량과 구매 링크. forms 에 적힌 순서대로 정렬됩니다.
  const opt = it.options;
  if (!opt || typeof opt !== 'object' || !Object.keys(opt).length) fail(label + ': options 가 비어 있습니다. 예: "options": { "원두": { "size": "200g", "url": "" } }');
  Object.keys(opt).forEach(k => {
    if (!FORMS.includes(k)) fail(label + ': options 의 "' + k + '" 는 forms 목록(' + FORMS.join(', ') + ')에 없는 형태입니다.');
    const u = (opt[k] && opt[k].url) || '';
    if (u && !/^https?:\/\//.test(u)) fail(label + ': ' + k + ' 의 url 은 https:// 로 시작해야 합니다.');
  });
  o.opts = FORMS.filter(f => opt[f]).map(f => ({ form: f, size: String(opt[f].size || ''), url: String(opt[f].url || '') }));
  return o;
});
if (!items.length) fail('items 가 비어 있습니다.');

const hasForm = (it, f) => it.opts.some(o => o.form === f);
const forms = FORMS.filter(f => items.some(it => hasForm(it, f)));

// ---------- 공통 도우미 ----------
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const jsonLd = o => '<script type="application/ld+json">' + JSON.stringify(o).replace(/</g, '\\u003c') + '</script>';
const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

// 인기 순위: 후기 수가 많을수록 앞이며, 같은 후기 수는 같은 순위이고 순위는 1, 2, 3 순으로 이어집니다.
const distinctReviews = Array.from(new Set(items.filter(it => it.reviews != null).map(it => it.reviews))).sort((a, b) => b - a);
items.forEach(it => { it.rank = it.reviews == null ? null : distinctReviews.indexOf(it.reviews) + 1; });
const byPopularity = (a, b) => ((b.reviews == null ? -1 : b.reviews) - (a.reviews == null ? -1 : a.reviews)) || (a.i - b.i);
const sorted = items.slice().sort(byPopularity);
const itemsOf = brand => sorted.filter(it => it.brand === brand);
const brandUrl = b => '/brands/' + brandByName.get(b).slug + '/';
const beanUrl = it => '/beans/' + it.slug + '/';

// 로고: 파일이 있으면 이미지, 없으면 브랜드 이름 첫 글자 배지. logoBg 가 있으면 그 색의 판 위에 올립니다.
// size: '' (기본 64px), 'xs', 'sm', 'lg'
function logoHtml(b, P, size, decorative) {
  const cls = 'logo' + (size ? ' ' + size : '') + (b.logoBgCss ? ' dk' : '');
  const st = b.logoBgCss ? ' style="background:' + b.logoBgCss + '"' : '';
  if (b.logoPath) {
    return '<span class="' + cls + '"' + st + '><img src="' + P + esc(b.logoPath) + '" alt="' + (decorative ? '' : esc(b.name) + ' 로고') + '" loading="lazy" decoding="async"></span>';
  }
  return '<span class="' + cls + ' mono"' + st + ' aria-hidden="true">' + esc(Array.from(b.name)[0]) + '</span>';
}
function bars(roast) {
  let d = '';
  for (let k = 1; k <= 5; k++) d += '<i class="' + (k <= roast ? 'on' : '') + '"></i>';
  return '<span class="bar" aria-hidden="true">' + d + '</span>';
}
function roastHtml(it) {
  if (!(it.roast > 0)) return '<span class="rlabel">그 외</span>';
  return bars(it.roast) + '<span class="rlabel">' + esc(it.roastLabel || ROAST_NAMES[it.roast - 1]) + '</span>';
}
function rvText(it) { return it.reviews == null ? '후기 정보 없음' : '후기 ' + fmt(it.reviews) + '건'; }
function sellerOf(o) {
  if (!o.url) return '';
  if (/coupang\.com/.test(o.url)) return '쿠팡';
  if (/kurly\.com/.test(o.url)) return '마켓컬리';
  if (/terarosa\.com/.test(o.url)) return '테라로사 공식몰';
  if (/centercoffee\.co\.kr/.test(o.url)) return '센터커피 공식몰';
  if (/anthracitecoffee\.com/.test(o.url)) return '앤트러사이트 공식몰';
  return '판매처';
}
function buyUrl(it, o) {
  if (o.url) return o.url;
  const q = it.brand + ' ' + it.name + ' ' + (o.form === '원두' ? '원두' : o.form);
  return 'https://search.shopping.naver.com/search/all?query=' + encodeURIComponent(q);
}
const affLabel = () => (site.affiliate ? '<span class="aff">제휴 링크 포함</span>' : '');
const hasCoupang = items.some(it => it.opts.some(o => /coupang\.com/.test(o.url)));
const COUPANG_NOTICE = '이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.';
// 형태 아이콘 (아이콘 순서는 products.json 의 forms 순서입니다)
const ICON = {
  '원두': '<g transform="rotate(35 12 12)"><ellipse cx="12" cy="12" rx="6" ry="9"/><path d="M12 3c-3 3-3 6 0 9s3 6 0 9"/></g>',
  '드립백': '<path d="M8 3h8v8H8z"/><path d="M5.5 5.5H8M16 5.5h2.5"/><path d="M5 13h14l-1.4 7.5h-11.2z"/>',
  '콜드브루': '<path d="M10 2.5h4V6l2 2.5V20a1.8 1.8 0 0 1-1.8 1.8H9.8A1.8 1.8 0 0 1 8 20V8.5L10 6z"/><path d="M8 13h8"/>',
  '캡슐': '<path d="M4.5 8c0-2 3.4-3.2 7.5-3.2s7.500 1.200 7.500 3.200"/><path d="M4.5 8l1.700 11.200a2 2 0 0 0 2 1.800h7.600a2 2 0 0 0 2-1.800L19.500 8"/><path d="M4.500 8c0 2 3.400 3.200 7.500 3.200s7.500-1.200 7.500-3.200"/>'
};
function iconSvg(f) {
  return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICON[f] || '<circle cx="12" cy="12" r="7"/>') + '</svg>';
}
// 구매 가능한 형태를 아이콘으로 나열 (링크가 아닙니다)
function formIcons(it) {
  return '<span class="fis">' + it.opts.map(o => '<span class="fi" title="' + esc(o.form) + '">' + iconSvg(o.form) + '<span class="sr">' + esc(o.form) + '</span></span>').join('') + (it.decaf ? '<span class="fi dc" title="디카페인">디카</span>' : '') + '</span>';
}
function formLegend() {
  return '<p class="note flegend">구매할 수 있는 형태: ' + forms.map(f => '<span class="fl">' + iconSvg(f) + esc(f) + '</span>').join('') + '</p>';
}
const metaText = it => it.opts.map(o => (o.form + ' ' + o.size).trim()).join(' · ') + (it.decaf ? ' · 디카페인' : '');
const formsText = it => it.opts.map(o => o.form).join('·');

const ROAST_TIP = {
  1: '산미와 향이 선명하게 나오는 편입니다. 핸드드립에서는 물 온도를 92~96°C로 비교적 높게 잡는 방법이 흔합니다.',
  2: '산미와 단맛의 균형이 좋아 핸드드립에 무난합니다. 물 온도는 90~94°C 정도가 일반적입니다.',
  3: '단맛과 바디가 균형을 이루는 구간입니다. 물 온도는 90~93°C 정도가 일반적입니다.',
  4: '고소함과 바디감이 두드러집니다. 물 온도는 88~92°C 정도로 조금 낮추면 쓴맛이 덜합니다.',
  5: '쓴맛과 묵직한 바디가 강해 우유를 섞는 음료에도 많이 쓰입니다. 85~90°C로 낮추면 쓴맛이 덜합니다.'
};
const FORM_TEXT = {
  '원두': '분쇄하지 않은 원두입니다. 핸드드립은 중간 굵기, 에스프레소 머신은 곱게 갈아 사용합니다.',
  '드립백': '분쇄된 원두가 든 필터를 컵에 걸고 뜨거운 물을 부어 마시는 형태라 별도 도구가 필요 없습니다.',
  '캡슐': '커피 머신에 넣어 추출하는 형태입니다. 사용하는 머신과 호환되는지 판매처 안내를 확인하세요.',
  '콜드브루': '차갑게 우려낸 커피로 바로 마실 수 있는 형태입니다. 보관 방법과 유통기한은 판매처 안내를 확인하세요.'
};
const ROAST_NAMES = ['라이트', '미디엄 라이트', '미디엄', '미디엄 다크', '다크'];
const ROAST_BLOCKS = [
  { r: 1, name: '라이트', text: '산미와 향이 선명' },
  { r: 2, name: '미디엄 라이트', text: '산미와 단맛의 균형' },
  { r: 3, name: '미디엄', text: '단맛과 바디의 균형' },
  { r: 4, name: '미디엄 다크', text: '고소함과 바디감' },
  { r: 5, name: '다크', text: '쓴맛과 묵직한 바디' },
  { r: 0, name: '그 외', text: '로스팅 정보가 없는 상품' }
];
const roastCount = r => items.filter(it => (r === 0 ? !(it.roast > 0) : it.roast === r)).length;
const NOTE = '인기 순위는 마켓컬리 후기 수 기준이며 맛 평가가 아닙니다.';

// 로스팅 스펙트럼 블록. 홈에서는 링크(a), 전체 목록에서는 버튼(button)입니다.
function blocks(P, asButton) {
  return ROAST_BLOCKS.map(k => {
    const inner = '<span><b>' + k.name + '</b><small>' + k.text + '</small></span><span class="n">' + roastCount(k.r) + '<span>종</span></span>';
    return asButton
      ? '<button type="button" class="blk" data-v="' + k.r + '" aria-pressed="false" data-r="' + k.r + '">' + inner + '</button>'
      : '<a class="blk" data-r="' + k.r + '" href="' + P + 'beans/?roast=' + k.r + '">' + inner + '</a>';
  }).join('');
}

// ---------- 파비콘 (주소창/탭 아이콘) ----------
// 저장소 맨 위에 favicon.svg, favicon.ico, favicon.png, apple-touch-icon.png 중 있는 파일을 자동으로 사용합니다. 하나도 없으면 기본 아이콘을 만듭니다.
const FAV_FILES = [['favicon.svg', 'image/svg+xml', 'icon'], ['favicon.ico', 'image/x-icon', 'icon'], ['favicon.png', 'image/png', 'icon'], ['apple-touch-icon.png', 'image/png', 'apple-touch-icon']]
  .filter(f => fs.existsSync(path.join(ROOT, f[0])));
const DEFAULT_FAV = !FAV_FILES.some(f => f[2] === 'icon');
const DEFAULT_FAV_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#1B130E"/><circle cx="32" cy="32" r="14" fill="#F2A93B"/></svg>';
function faviconTags(P) {
  if (DEFAULT_FAV) return '<link rel="icon" href="' + P + 'favicon.svg" type="image/svg+xml">\n';
  return FAV_FILES.map(f => '<link rel="' + f[2] + '" href="' + P + f[0] + '" type="' + f[1] + '">\n').join('');
}

// ---------- 페이지 뼈대 ----------
function layout({ P, urlPath, title, desc, body, ld, hero }) {
  const root = P || './';
  const canonical = site.url + urlPath;
  return '<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
    '<title>' + esc(title) + '</title>\n' +
    '<meta name="description" content="' + esc(desc) + '">\n' +
    '<link rel="canonical" href="' + esc(canonical) + '">\n' +
    '<meta property="og:type" content="website">\n<meta property="og:site_name" content="' + esc(site.name) + '">\n' +
    '<meta property="og:title" content="' + esc(title) + '">\n<meta property="og:description" content="' + esc(desc) + '">\n' +
    '<meta property="og:url" content="' + esc(canonical) + '">\n<meta property="og:locale" content="ko_KR">\n' +
    '<meta name="twitter:card" content="summary">\n' +
    '<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>\n' +
    '<link rel="stylesheet" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">\n' +
    '<link rel="stylesheet" href="' + P + 'style.css">\n' + faviconTags(P) +
    (ld ? ld + '\n' : '') +
    '</head>\n<body>\n<div class="band">\n' +
    '<header class="top"><div class="in"><a class="brand" href="' + root + '"><i></i>' + esc(site.name) + '</a>' +
    '<nav class="nav" aria-label="주요 메뉴"><a href="' + P + 'beans/">전체 원두</a><a href="' + root + '#brands">브랜드</a><a href="' + root + '#gear">커피용품</a><a href="' + root + '#ratio">추출 비율</a></nav></div></header>\n' +
    (hero || '') + '</div>\n' +
    body + '\n' + footer(P) + '\n<script src="' + P + 'app.js" defer></script>\n</body>\n</html>\n';
}
function footer(P) {
  return '<footer><div class="in"><div class="fin"><div><strong style="color:var(--fg);">' + esc(site.name) + '</strong></div><div>' +
    '<p>' + esc(site.name) + '는 제품을 직접 판매하지 않으며 외부 구매처로 연결하는 정보 서비스입니다. ' +
    (site.affiliate ? '구매처 링크에는 판매 수수료를 받는 제휴 링크가 포함되어 있으며, 해당 링크 옆에 표시합니다. ' : '') +
    (hasCoupang ? COUPANG_NOTICE + ' ' : '') + '가격, 재고, 배송과 교환은 각 구매처의 정책을 따릅니다. 상품 구성과 맛 설명은 판매처 정보를 참고한 것으로 시기에 따라 바뀔 수 있습니다.</p>' +
    '<div class="flinks"><a href="' + P + 'beans/">전체 원두</a>' + brands.map(b => '<a href="' + P + 'brands/' + b.slug + '/">' + esc(b.name) + '</a>').join('') + '</div></div></div></div></footer>';
}
function crumbs(P, parts) {
  const root = P || './';
  return '<div class="in"><nav class="crumbs" aria-label="현재 위치"><a href="' + root + '">홈</a>' +
    parts.map(p => '<span>/</span>' + (p.href ? '<a href="' + p.href + '">' + esc(p.label) + '</a>' : '<span aria-current="page">' + esc(p.label) + '</span>')).join('') + '</nav></div>';
}
function breadcrumbLd(parts) {
  return jsonLd({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: parts.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name, item: site.url + p.path }))
  });
}
// 상품 행: 로고와 브랜드명, 상품명을 크게 보여 주고 행을 누르면 상세 페이지로, 구매처 연결은 별도 링크입니다.
function row(it, P) {
  const b = brandByName.get(it.brand);
  const search = (it.name + ' ' + it.brand + ' ' + formsText(it) + ' ' + (it.decaf ? '디카페인 ' : '') + it.notes).toLowerCase();
  const top = it.rank != null && it.rank <= 3;
  return '<li class="item" data-i="' + it.i + '" data-brand="' + esc(it.brand) + '" data-forms="' + esc(it.opts.map(o => o.form).join(' ')) + '" data-reviews="' + (it.reviews == null ? -1 : it.reviews) + '" data-roast="' + it.roast + '" data-name="' + esc(it.name) + '" data-search="' + esc(search) + '">' +
    '<div class="row' + (top ? ' top' : '') + '"><span class="no" aria-hidden="true">' + (it.rank == null ? '–' : it.rank) + '</span>' +
    '<a class="open" href="' + P + 'beans/' + it.slug + '/">' + logoHtml(b, P, '', true) +
    '<span class="txt"><span class="brandname">' + esc(it.brand) + '</span><span class="beanname">' + esc(it.name) + '</span><span class="meta">' + esc(metaText(it)) + '</span></span></a>' +
    '<p class="notes">' + esc(it.notes) + '</p>' +
    '<div class="roast">' + roastHtml(it) + '</div>' +
    '<span class="rv">' + (it.rank != null ? '<span class="sr">인기 ' + it.rank + '위, </span>' : '') + rvText(it) + '</span>' +
    '<div class="buyc">' + formIcons(it) + '<span class="go" aria-hidden="true">상세 보기 →</span></div></div></li>';
}
function write(rel, content) {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content, 'utf8');
}

// ---------- 홈 ----------
function homePage() {
  const P = '';
  const feat = sorted.filter(it => it.featured);
  const slides = feat.length ? feat : sorted.slice(0, 5);
  const slideHtml = slides.map((b, i) => {
    const br = brandByName.get(b.brand);
    return '<div class="slide" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' / ' + slides.length + '"' + (i ? ' aria-hidden="true"' : '') + '>' +
      '<div class="bsheet"><div class="head">' + logoHtml(br, P, 'xs', true) + '<div><small>Today\'s Bean</small><b>' + esc(b.brand) + '</b><a href="beans/' + b.slug + '/">' + esc(b.name) + '</a></div></div>' +
      '<div class="r"><span>형태</span><span>' + esc(metaText(b)) + '</span></div>' +
      '<div class="r"><span>로스팅</span><span>' + roastHtml(b) + '</span></div>' +
      '<div class="r"><span>컵 노트</span><span>' + esc(b.notes) + '</span></div>' +
      '<div class="r"><span>후기</span><span>' + (b.reviews == null ? '정보 없음' : esc(fmt(b.reviews) + '건 · 마켓컬리')) + '</span></div></div></div>';
  }).join('');
  const dots = slides.map((b, i) => '<button type="button" class="sdot" aria-label="' + (i + 1) + '번째 원두 보기" aria-current="' + (i === 0) + '"><span></span></button>').join('');

  const hero = '<div class="hero"><div class="in"><div>\n' +
    '<h1>원두는 취향대로,<br>구매는 편하게.</h1>\n' +
    '<p class="lead">브랜드별 원두의 컵 노트와 로스팅 단계를 비교하고, 마음에 드는 제품은 구매처로 바로 연결해 드립니다. ' + esc(site.name) + '는 직접 판매하지 않고 고르는 과정만 돕습니다.</p>\n' +
    '<div class="hero-row"><a class="cta" href="beans/">전체 원두 ' + items.length + '종 보기 →</a><span class="hero-meta">' + brands.length + '개 브랜드</span></div></div>\n' +
    '<div class="slider" id="slider" role="region" aria-roledescription="carousel" aria-label="오늘의 원두"><div class="viewport"><div class="track" id="track">' + slideHtml + '</div></div><div class="sdots" id="sdots">' + dots + '</div></div></div></div>';

  const seen = new Set();
  const popular = [];
  for (const it of sorted) {
    if (it.reviews == null) continue;
    const k = it.brand + '|' + it.reviews;
    if (seen.has(k)) continue;
    seen.add(k);
    popular.push(it);
    if (popular.length === 6) break;
  }

  const brandCards = brands.map(b => {
    const list = itemsOf(b.name);
    if (!list.length) return '';
    const fs_ = forms.filter(f => list.some(it => hasForm(it, f))).join('·');
    return '<a class="bcard" href="brands/' + b.slug + '/"><span class="bh">' + logoHtml(b, '', '', true) + '<b>' + esc(b.name) + '</b></span><span class="m">' + list.length + '종 · ' + esc(fs_) + '</span><p class="bn">' + esc(list[0].notes) + '</p></a>';
  }).join('');

  const formLinks = forms.map(f => '<a class="chip" href="beans/?form=' + encodeURIComponent(f) + '">' + esc(f) + ' ' + items.filter(it => hasForm(it, f)).length + '</a>').join('');

  const gear = (data.gear || []).map(g => {
    const href = /^https?:\/\//.test(g.url || '') ? g.url : 'https://search.shopping.naver.com/search/all?query=' + encodeURIComponent(g.query || g.name);
    return '<li class="grow"><h3>' + esc(g.name) + '</h3><p><b>' + esc(g.point || '') + '</b> ' + esc(g.text || '') + '</p>' +
      '<div class="buyc"><a class="buy" href="' + esc(href) + '" target="_blank" rel="noopener noreferrer sponsored">구매처 연결 ↗</a>' + affLabel() + '</div></li>';
  }).join('');

  const body = '<main id="top">\n' +
    '<section class="spec" id="roast"><div class="in"><div class="sec-top"><h2>로스팅으로 찾기</h2></div><div class="blocks">' + blocks(P, false) + '</div></div></section>\n' +
    '<section class="listing" id="popular"><div class="in"><div class="sec-top"><h2>인기 순</h2><a class="more2" href="beans/">전체 보기 →</a></div>' +
    '<p class="note">' + NOTE + '</p>' + formLegend() + '<ul class="rows">' + popular.map(it => row(it, P)).join('\n') + '</ul></div></section>\n' +

    '<section class="sec" id="brands"><div class="in"><div class="sec-head"><div><p class="eyebrow">Brands</p><h2>브랜드로 찾기</h2></div><p class="desc">브랜드를 고르면 그 브랜드의 원두만 모아 볼 수 있습니다.</p></div>\n' +
    '<div class="brands">' + brandCards + '</div>\n' +
    '<h3 class="sub-h">형태로 찾기</h3><div class="chips">' + formLinks + '</div></div></section>\n' +

    '<section class="sec" id="gear"><div class="in"><div class="sec-head"><div><p class="eyebrow">Gear</p><h2>처음 갖출 커피용품</h2></div>' +
    '<p class="desc">집에서 핸드드립을 시작할 때 맛 차이를 만드는 순서대로 정리했습니다.</p></div>\n<ul class="gear">' + gear + '</ul></div></section>\n' +

    '<section class="sec" id="ratio"><div class="in"><div class="sec-head"><div><p class="eyebrow">Brew Ratio</p><h2>추출 비율 계산</h2></div>' +
    '<p class="desc">원두 양과 비율을 정하면 필요한 물의 양이 나옵니다. 1:15는 진하게, 1:17은 가볍게 마시는 쪽입니다.</p></div>\n' +
    '<div class="calc"><div>\n<div class="field"><label for="beanG">원두 (g)</label><input id="beanG" type="number" inputmode="decimal" min="1" max="200" step="0.5" value="20"></div>\n' +
    '<div class="field"><span class="lbl" id="ratioLbl">비율 (원두 : 물)</span><div class="chips" role="group" aria-labelledby="ratioLbl" id="ratioChips">' +
    [15, 16, 17].map(r => '<button type="button" class="chip" data-r="' + r + '" aria-pressed="' + (r === 16) + '">1 : ' + r + '</button>').join('') + '</div></div>\n</div>\n' +
    '<div class="out" aria-live="polite"><div class="big"><b id="waterOut">320</b><span>ml 물</span></div><ul>' +
    '<li><span>비율</span><span id="ratioOut">1 : 16</span></li><li><span>추출 후 예상 양</span><span id="cupOut">약 280 ml</span></li>' +
    '<li><span>목표 추출 시간</span><span>2:30 – 3:30</span></li><li><span>물 온도</span><span>90 – 96 °C</span></li></ul></div></div></div></section>\n</main>';

  const top3 = brands.slice(0, 3).map(b => b.name).join(', ');
  const desc = trunc(top3 + ' 등 ' + brands.length + '개 로스터리의 원두·드립백·콜드브루 ' + items.length + '종을 컵노트와 로스팅 단계로 비교하고, 마음에 드는 제품은 구매처로 바로 연결합니다.', 160);
  return layout({
    P, urlPath: '/', title: site.name + ' | 원두·드립백 브랜드별 컵노트 비교와 구매처 연결', desc, body, hero,
    ld: jsonLd({ '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: site.url + '/', inLanguage: 'ko' })
  });
}

// ---------- 전체 목록 (검색·정렬·필터) ----------
function listPage() {
  const P = '../';
  const chip = (v, label, pressed) => '<button type="button" class="chip" data-v="' + esc(v) + '" aria-pressed="' + pressed + '">' + esc(label) + '</button>';
  const body = '<main>\n' + crumbs(P, [{ label: '전체 원두' }]) +
    '\n<section class="phead"><div class="in"><p class="eyebrow">All Beans</p><h1 class="page-title">전체 원두 ' + items.length + '종</h1>' +
    '<p class="lead">로스팅, 형태, 브랜드를 고르거나 이름과 컵 노트로 검색해 보세요. 기본 순서는 후기가 많은 순입니다.</p></div></section>\n' +
    '<div id="list-page">\n<div class="toolbar" id="toolbar" hidden>\n' +
    '<section class="spec"><div class="in" style="padding-top:8px"><div class="sec-top"><h2>로스팅으로 찾기</h2><button type="button" class="reset" id="reset" hidden>전체 보기</button></div><div class="blocks" id="blocks">' + blocks(P, true) + '</div></div></section>\n' +
    '<div class="in" style="padding-top:28px"><div class="tools"><label class="sr" for="q">검색</label><input id="q" type="search" placeholder="이름, 브랜드, 컵 노트로 검색 (예: 초콜릿)" autocomplete="off">' +
    '<label class="sr" for="sort">정렬</label><select id="sort"><option value="pop">인기순</option><option value="light">로스팅 라이트순</option><option value="dark">로스팅 다크순</option><option value="name">이름순</option></select></div>\n' +
    '<div class="fgroup"><span class="flabel">형태</span><div class="chips" id="chips-form">' + chip('전체', '전체', true) + forms.map(f => chip(f, f, false)).join('') + '</div></div>\n' +
    '<div class="fgroup"><span class="flabel">브랜드</span><div class="chips" id="chips-brand">' + chip('전체', '전체', true) + brands.map(b => chip(b.name, b.name, false)).join('') + '</div></div></div>\n</div>\n' +
    '<section class="listing"><div class="in"><div class="sec-top"><h2>인기 순</h2><span class="count" id="count" aria-live="polite">' + items.length + '개 상품</span></div>\n' +
    '<p class="note">' + NOTE + '</p>' + formLegend() + '\n' +
    '<ul class="rows" id="beans">' + sorted.map(it => row(it, P)).join('\n') + '</ul>\n' +
    '<p class="empty" id="empty" hidden>조건에 맞는 상품이 없습니다. 검색어나 필터를 바꿔 보세요.</p></div></section>\n</div>\n</main>';
  return layout({
    P, urlPath: '/beans/', title: '전체 원두·드립백 ' + items.length + '종 비교 | ' + site.name,
    desc: trunc('브랜드, 형태, 로스팅 단계로 ' + items.length + '종의 원두·드립백·콜드브루를 검색하고 정렬해 비교합니다. 후기가 많은 순으로 보여 드립니다.', 160),
    body, ld: breadcrumbLd([{ name: '홈', path: '/' }, { name: '전체 원두', path: '/beans/' }])
  });
}

// ---------- 브랜드 페이지 ----------
function brandPage(b) {
  const P = '../../';
  const list = itemsOf(b.name);
  const fs_ = forms.filter(f => list.some(it => hasForm(it, f)));
  const formsText = fs_.join('·');
  const top = list.filter(it => it.reviews != null)[0];
  const roasted = list.filter(it => it.roast > 0).length;
  const auto = b.name + '의 ' + formsText + ' ' + list.length + '종의 컵 노트와 로스팅 정보를 모았습니다.' +
    (top ? ' 판매처 후기가 가장 많은 상품은 ' + top.name + '(후기 ' + fmt(top.reviews) + '건)입니다.' : '') +
    (roasted ? ' 로스팅 단계가 표기된 상품은 ' + roasted + '종이며, 나머지는 판매처에 로스팅 정보가 없습니다.' : ' 판매처에 로스팅 단계가 표기된 상품은 없습니다.');
  const intro = (b.intro ? esc(b.intro) + ' ' : '') + esc(auto);
  const others = brands.filter(x => x.name !== b.name);
  const body = '<main>\n' + crumbs(P, [{ label: b.name }]) +
    '\n<section class="phead"><div class="in"><p class="eyebrow">Brand</p><div class="bhero">' + logoHtml(b, P, 'lg', false) + '<h1 class="page-title">' + esc(b.name) + ' ' + esc(formsText) + '</h1></div><p class="lead" style="margin-bottom:0">' + intro + '</p></div></section>\n' +
    '<section class="listing"><div class="in" style="padding-top:8px"><div class="sec-top"><h2>후기가 많은 순</h2><span class="count">' + list.length + '개 상품</span></div><p class="note">' + NOTE + '</p>' + formLegend() +
    '<ul class="rows nonum">' + list.map(it => row(it, P)).join('\n') + '</ul></div></section>\n' +
    '<section class="tight"><div class="in"><p class="eyebrow">Other Brands</p><div class="chips">' + others.map(o => '<a class="chip" href="' + P + 'brands/' + o.slug + '/">' + esc(o.name) + '</a>').join('') + '</div></div></section>\n</main>';
  return layout({
    P, urlPath: brandUrl(b.name), title: b.name + ' ' + formsText + ' 컵노트·로스팅·구매처 | ' + site.name,
    desc: trunc(b.name + ' ' + formsText + ' ' + list.length + '종: ' + list.slice(0, 3).map(it => it.name).join(', ') + ' 등의 컵 노트와 로스팅 단계를 비교하고 구매처로 연결합니다.', 160),
    body, ld: breadcrumbLd([{ name: '홈', path: '/' }, { name: b.name, path: brandUrl(b.name) }])
  });
}

// ---------- 원두 페이지 ----------
// 구매 링크는 이 페이지에서만 나옵니다. 형태별로 하나씩, 링크가 없는 형태는 네이버 쇼핑 검색으로 연결합니다.
function buyBox(it) {
  const anyCoupang = it.opts.some(o => /coupang\.com/.test(o.url));
  const anyFallback = it.opts.some(o => !o.url);
  const li = it.opts.map(o => {
    const sel = sellerOf(o);
    return '<li><span class="bf">' + iconSvg(o.form) + '<span><b>' + esc(o.form) + '</b>' + (o.size ? '<small>' + esc(o.size) + '</small>' : '') + '</span></span>' +
      '<a class="cta2" href="' + esc(buyUrl(it, o)) + '" target="_blank" rel="noopener noreferrer sponsored">' + (sel ? esc(sel) + '에서 보기' : '네이버 쇼핑에서 찾기') + ' ↗</a></li>';
  }).join('');
  return '<div class="buybox"><p class="eyebrow">구매처 연결</p><ul class="buylist">' + li + '</ul>' +
    (anyFallback ? '<p class="note">링크가 아직 등록되지 않은 형태는 네이버 쇼핑 검색 결과로 연결됩니다.</p>' : '') +
    (site.affiliate ? '<p class="note">제휴 링크가 포함되어 있습니다.' + (anyCoupang ? ' ' + COUPANG_NOTICE : '') + '</p>' : '') + '</div>';
}

function beanPage(it) {
  const P = '../../';
  const b = brandByName.get(it.brand);
  const lead = it.description ? esc(it.description) :
    esc(it.brand + ' ' + it.name + '(' + formsText(it) + ')의 컵 노트와 로스팅 정보입니다. 컵 노트는 ' + it.notes + '.');
  const rv = it.reviews == null ? '정보 없음' : fmt(it.reviews) + '건 · 마켓컬리';
  const guide = (it.roast > 0
    ? '<p>로스팅 단계는 ' + esc(it.roastLabel || ROAST_NAMES[it.roast - 1]) + '로 표기되어 있습니다. ' + esc(ROAST_TIP[it.roast]) + ' 물 온도는 일반적인 가이드이며, 로스터의 안내가 있으면 그쪽을 따르세요.</p>'
    : '<p>이 상품은 판매처 페이지에 로스팅 단계가 표기되어 있지 않아 \'그 외\'로 분류했습니다. 구매 전에 판매처의 상품 설명을 확인하세요.</p>') +
    it.opts.map(o => FORM_TEXT[o.form] ? '<p>' + esc(o.form) + ': ' + esc(FORM_TEXT[o.form]) + '</p>' : '').join('') + (it.decaf ? '<p>디카페인: 카페인을 줄인 커피입니다.</p>' : '');
  const sameBrand = itemsOf(it.brand).filter(x => x.slug !== it.slug).slice(0, 4);
  const sameForm = sorted.filter(x => hasForm(x, it.opts[0].form) && x.brand !== it.brand).slice(0, 3);
  const body = '<main>\n' + crumbs(P, [{ label: it.brand, href: P + 'brands/' + b.slug + '/' }, { label: it.name }]) +
    '\n<div class="in"><div class="dpage"><div><div class="d-id">' + logoHtml(b, P, 'lg', false) + '<div style="min-width:0"><a class="d-brand" href="' + P + 'brands/' + b.slug + '/">' + esc(it.brand) + '</a><p class="eyebrow" style="margin:2px 0 0">' + esc(formsText(it)) + (it.decaf ? ' · 디카페인' : '') + '</p></div></div>' +
    '<h1 class="d-name">' + esc(it.name) + '</h1>' +
    '<p class="lead" style="margin-top:16px">' + lead + '</p>' +
    buyBox(it) +
    '<div class="actions" style="margin-top:22px"><a class="ghost" href="' + P + 'brands/' + b.slug + '/">' + esc(it.brand) + ' 전체 보기</a></div></div>\n' +
    '<div class="sheet">' +
    '<div class="r"><span>브랜드</span><span><b>' + esc(it.brand) + '</b></span></div>' +
    '<div class="r"><span>형태</span><span>' + esc(metaText(it)) + '</span></div>' +
    '<div class="r"><span>로스팅</span><span>' + roastHtml(it) + '</span></div>' +
    '<div class="r"><span>컵 노트</span><span>' + esc(it.notes) + '</span></div>' +
    (it.rank != null ? '<div class="r"><span>인기 순위</span><span>' + it.rank + '위</span></div>' : '') +
    '<div class="r"><span>후기</span><span>' + esc(rv) + '</span></div></div></div></div>\n' +
    '<section class="tight"><div class="in"><h2>로스팅과 추출 가이드</h2><div class="prose">' + guide + '</div></div></section>\n' +
    (sameBrand.length ? '<section class="tight"><div class="in"><h2>' + esc(it.brand) + '의 다른 상품</h2><ul class="rows nonum">' + sameBrand.map(x => row(x, P)).join('\n') + '</ul></div></section>\n' : '') +
    (sameForm.length ? '<section class="tight"><div class="in"><h2>다른 브랜드의 ' + esc(it.opts[0].form) + '</h2><ul class="rows nonum">' + sameForm.map(x => row(x, P)).join('\n') + '</ul></div></section>\n' : '') +
    '</main>';
  const descTxt = it.brand + ' ' + it.name + ' ' + formsText(it) + '. 컵 노트: ' + it.notes + '.' + (it.roast > 0 ? ' 로스팅: ' + (it.roastLabel || ROAST_NAMES[it.roast - 1]) + '.' : '') + (it.reviews != null ? ' 판매처 후기 ' + fmt(it.reviews) + '건.' : '');
  return layout({
    P, urlPath: beanUrl(it), title: it.brand + ' ' + it.name + ' ' + formsText(it) + ' 컵노트·로스팅 | ' + site.name,
    desc: trunc(it.description || descTxt, 160), body,
    ld: breadcrumbLd([{ name: '홈', path: '/' }, { name: it.brand, path: brandUrl(it.brand) }, { name: it.name, path: beanUrl(it) }])
  });
}

// ---------- 출력 ----------
fs.rmSync(OUT, { recursive: true, force: true });
write('index.html', homePage());
write('beans/index.html', listPage());
brands.forEach(b => { if (items.some(it => it.brand === b.name)) write('brands/' + b.slug + '/index.html', brandPage(b)); });
items.forEach(it => write('beans/' + it.slug + '/index.html', beanPage(it)));
brands.forEach(b => {
  if (!b.logoPath) return;
  const dest = path.join(OUT, b.logoPath);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(path.join(ROOT, b.logoPath), dest);
});
FAV_FILES.forEach(f => fs.copyFileSync(path.join(ROOT, f[0]), path.join(OUT, f[0])));
if (DEFAULT_FAV) write('favicon.svg', DEFAULT_FAV_SVG);
write('style.css', CSS);
write('app.js', APPJS);

const urls = ['/', '/beans/'].concat(brands.filter(b => items.some(it => it.brand === b.name)).map(b => '/brands/' + b.slug + '/'), items.map(beanUrl));
write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(u => '  <url><loc>' + esc(site.url + u) + '</loc>' + (UPDATED ? '<lastmod>' + esc(UPDATED) + '</lastmod>' : '') + '</url>').join('\n') + '\n</urlset>\n');
write('robots.txt', 'User-agent: *\nAllow: /\n\nSitemap: ' + site.url + '/sitemap.xml\n');
write('404.html', '<!doctype html>\n<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
  '<title>페이지를 찾을 수 없습니다 | ' + esc(site.name) + '</title><meta name="robots" content="noindex">' +
  '<link rel="stylesheet" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">' +
  '<link rel="stylesheet" href="' + BASE + '/style.css">' + faviconTags(BASE + '/') + '</head>' +
  '<body><div class="in"><section class="phead" style="padding-top:64px"><p class="eyebrow">404</p><h1 class="page-title">페이지를 찾을 수 없습니다</h1>' +
  '<p class="lead">주소가 바뀌었거나 없는 페이지입니다.</p><div class="actions"><a class="cta2" href="' + BASE + '/">홈으로</a></div></section></div></body></html>\n');

console.log('빌드 완료: 홈 1, 전체 목록 1, 브랜드 ' + brands.length + ', 원두 ' + items.length + ' 페이지 → dist/');
