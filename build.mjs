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

const CSS = String.raw`/* 원두노트 스타일. 바탕은 차분한 중립색, 포인트는 로스팅 단계 5색(--r1~--r5). 붉은색은 쓰지 않는다. */
:root {
  --bg: #F3F2F0;
  --surface: #FBFAF9;
  --fg: #171615;
  --muted: #6A6862;
  --line: #DDDBD6;
  --accent: #8B5A2B;
  --r1: #D8B26A;
  --r2: #B98A44;
  --r3: #8D5E32;
  --r4: #5F3B24;
  --r5: #33201A;
  --font: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", system-ui, sans-serif;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #131211; --surface: #1B1A18; --fg: #EFEDE8; --muted: #9D9A92; --line: #2F2D2A; --accent: #D2A06B;
    --r1: #E8C98A; --r2: #D0A15F; --r3: #B07A47; --r4: #8A5A3A; --r5: #6B4636;
    color-scheme: dark;
  }
}
:root[data-theme="dark"] {
  --bg: #131211; --surface: #1B1A18; --fg: #EFEDE8; --muted: #9D9A92; --line: #2F2D2A; --accent: #D2A06B;
  --r1: #E8C98A; --r2: #D0A15F; --r3: #B07A47; --r4: #8A5A3A; --r5: #6B4636;
  color-scheme: dark;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font);
  font-size: 16px;
  line-height: 1.7;
  font-variant-numeric: tabular-nums;
  padding-left: max(16px, env(safe-area-inset-left, 0px));
  padding-right: max(16px, env(safe-area-inset-right, 0px));
  -webkit-font-smoothing: antialiased;
}
.wrap { max-width: 1080px; margin: 0 auto; }
a { color: inherit; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
[hidden] { display: none !important; }
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

/* 헤더 */
.top { display: flex; justify-content: space-between; align-items: center; gap: 12px 24px; padding-block: 20px; flex-wrap: wrap; }
.brand { font-weight: 800; font-size: 1.2rem; letter-spacing: -0.02em; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; }
.brand i { width: 12px; height: 12px; border-radius: 50%; background: var(--r3); display: inline-block; }
.nav { display: flex; gap: 22px; font-size: 0.92rem; color: var(--muted); flex-wrap: wrap; }
.nav a { text-decoration: none; }
.nav a:hover { color: var(--fg); }

/* 공통 글자 */
.eyebrow { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin: 0 0 10px; }
h1, h2, h3 { text-wrap: balance; word-break: keep-all; }
h1 { font-weight: 700; font-size: clamp(2.1rem, 5.4vw, 3.7rem); line-height: 1.22; letter-spacing: -0.025em; margin: 0 0 22px; }
h2 { font-weight: 700; font-size: clamp(1.45rem, 3.2vw, 2rem); line-height: 1.3; letter-spacing: -0.02em; margin: 0; }
.page-title { font-weight: 700; font-size: clamp(1.9rem, 4.6vw, 2.8rem); line-height: 1.22; letter-spacing: -0.025em; margin: 0 0 14px; }
.lead { color: var(--muted); max-width: 34em; margin: 0 0 28px; word-break: keep-all; }
.desc { color: var(--muted); margin: 0; max-width: 38em; word-break: keep-all; }
.note { font-size: 0.8rem; color: var(--muted); margin: 0 0 14px; }

/* 버튼과 칩 */
.actions { display: flex; gap: 10px; flex-wrap: wrap; }
.btn { font: inherit; font-weight: 600; font-size: 0.95rem; padding: 12px 20px; border-radius: 6px; border: 1px solid var(--fg); background: var(--fg); color: var(--bg); text-decoration: none; cursor: pointer; display: inline-block; line-height: 1.3; }
.btn.ghost { background: transparent; color: var(--fg); }
.btn:hover { opacity: 0.86; }
.chips { display: flex; gap: 8px; flex-wrap: wrap; }
.chip { font: inherit; font-size: 0.88rem; padding: 6px 14px; border-radius: 999px; border: 1px solid var(--line); background: transparent; color: var(--fg); cursor: pointer; line-height: 1.5; text-decoration: none; display: inline-block; }
.chip:hover { border-color: var(--fg); }
.chip[aria-pressed="true"] { background: var(--fg); color: var(--bg); border-color: var(--fg); }
.fgroup { display: flex; gap: 8px 14px; align-items: baseline; flex-wrap: wrap; }
.flabel { font-size: 0.8rem; color: var(--muted); width: 48px; flex: none; }

/* 히어로 */
.hero { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 56px; padding-block: 48px 72px; border-top: 1px solid var(--line); align-items: center; }
.slider { min-width: 0; }
.viewport { overflow: hidden; }
.track { display: flex; transition: transform .7s cubic-bezier(.65, 0, .25, 1); }
.slide { flex: 0 0 100%; min-width: 0; }
.sdots { display: flex; gap: 4px; margin-top: 10px; }
.sdot { width: 32px; height: 22px; padding: 0; border: 0; background: none; cursor: pointer; display: flex; align-items: center; }
.sdot span { display: block; width: 100%; height: 2px; background: var(--line); }
.sdot[aria-current="true"] span { background: var(--fg); }
.sheet { font-size: 0.86rem; line-height: 1.5; border-top: 2px solid var(--fg); }
.sheet .row { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 11px 0; border-bottom: 1px solid var(--line); }
.sheet .row > span:first-child { color: var(--muted); flex: none; }
.sheet .row > span:last-child { text-align: right; min-width: 0; }
.sheet .head { font-weight: 700; font-size: 1.1rem; padding: 14px 0 12px; border-bottom: 1px solid var(--line); letter-spacing: -0.01em; }
.sheet .head small { display: block; font-size: 0.7rem; font-weight: 600; color: var(--muted); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 2px; }
.sheet .head a { text-decoration: none; }
.rr { display: inline-flex; align-items: center; gap: 10px; justify-content: flex-end; }

/* 섹션 */
section { padding-block: 60px; border-top: 1px solid var(--line); scroll-margin-top: 8px; }
.sec-head { display: flex; justify-content: space-between; align-items: end; gap: 16px 40px; margin-bottom: 28px; flex-wrap: wrap; }
.sec-head .desc { flex: 1 1 280px; max-width: 30em; }
.more { font-size: 0.9rem; font-weight: 600; text-decoration: none; border-bottom: 1px solid var(--fg); padding-bottom: 1px; white-space: nowrap; }
.more:hover { color: var(--accent); border-color: var(--accent); }
section.phead { padding-block: 28px 32px; border-top: 0; }
section.tight { padding-block: 40px; }
section.tight h2 { margin-bottom: 20px; }

/* 로스팅 색 */
.sw { display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: var(--r3); flex: none; }
.sw.r1 { background: var(--r1); } .sw.r2 { background: var(--r2); } .sw.r3 { background: var(--r3); }
.sw.r4 { background: var(--r4); } .sw.r5 { background: var(--r5); }
.sw.r0 { background: transparent; border: 1px dashed var(--muted); }
.rbar { display: flex; gap: 3px; }
.rbar i { width: 16px; height: 6px; border-radius: 1px; background: var(--line); display: block; }
.rbar i.on:nth-child(1) { background: var(--r1); } .rbar i.on:nth-child(2) { background: var(--r2); }
.rbar i.on:nth-child(3) { background: var(--r3); } .rbar i.on:nth-child(4) { background: var(--r4); }
.rbar i.on:nth-child(5) { background: var(--r5); }
.rlabel { font-size: 0.78rem; color: var(--muted); }

/* 인기 */
.pop { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; font-size: 0.78rem; color: var(--muted); }
.rank { display: inline-block; font-size: 0.74rem; font-weight: 700; padding: 2px 9px; border-radius: 999px; line-height: 1.5; border: 1px solid var(--fg); }
.rank.top { background: var(--fg); color: var(--bg); }
.rank.mid { color: var(--fg); }

/* 목록 행 */
.list { border-top: 2px solid var(--fg); }
.item { position: relative; display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1.4fr) 130px 112px auto; grid-template-areas: "main notes roast pop act"; gap: 8px 20px; align-items: center; padding: 18px 0; border-bottom: 1px solid var(--line); }
.item:hover { background: var(--surface); box-shadow: -12px 0 0 var(--surface), 12px 0 0 var(--surface); }
.item .main { grid-area: main; min-width: 0; }
.item .notes { grid-area: notes; margin: 0; word-break: keep-all; font-size: 0.95rem; }
.item .roast { grid-area: roast; display: flex; flex-direction: column; gap: 6px; }
.item .pop { grid-area: pop; }
.item .act { grid-area: act; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.item h3 { font-size: 1.05rem; font-weight: 700; letter-spacing: -0.015em; margin: 0; display: flex; align-items: center; gap: 9px; }
.item h3 a { text-decoration: none; }
.item h3 a::after { content: ""; position: absolute; inset: 0; }
.item:hover h3 a { color: var(--accent); }
.item .sub { font-size: 0.8rem; color: var(--muted); margin: 2px 0 0 19px; }
.item .sub a { position: relative; z-index: 1; text-decoration: none; border-bottom: 1px solid var(--line); }
.item .sub a:hover { border-color: var(--fg); color: var(--fg); }
.go { position: relative; z-index: 1; font-size: 0.84rem; font-weight: 600; text-decoration: none; border: 1px solid var(--fg); border-radius: 6px; padding: 7px 12px; white-space: nowrap; background: var(--bg); }
.go:hover { background: var(--fg); color: var(--bg); }
.aff { font-size: 0.7rem; color: var(--muted); position: relative; z-index: 1; }
.gear .item { grid-template-columns: minmax(0, 0.9fr) minmax(0, 2fr) auto; grid-template-areas: "main notes act"; }
.gear .item h3 { margin-left: 0; }
.gear .check { grid-area: notes; margin: 0; font-size: 0.92rem; color: var(--muted); word-break: keep-all; }
.gear .check b { color: var(--fg); font-weight: 600; }
.gear .item:hover { background: transparent; box-shadow: none; }
.count { font-size: 0.82rem; color: var(--muted); margin: 0 0 4px; }
.empty { padding: 28px 0; color: var(--muted); border-bottom: 1px solid var(--line); }

/* 브랜드 로고 */
.logo { display: inline-flex; align-items: center; justify-content: center; background: #fff; border: 1px solid var(--line); border-radius: 10px; overflow: hidden; flex: none; }
.logo img { display: block; max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; }
.logo.lg { height: 88px; min-width: 88px; max-width: 240px; padding: 14px 18px; }
.logo.sm { height: 36px; min-width: 36px; max-width: 110px; padding: 5px 8px; border-radius: 8px; }
.logo.mono { background: var(--surface); color: var(--muted); font-weight: 700; padding: 0; }
.logo.mono.lg { font-size: 2.1rem; }
.logo.mono.sm { font-size: 1rem; }
.bhero { display: flex; align-items: center; gap: 20px; margin-bottom: 18px; flex-wrap: wrap; }
.bhead { display: flex; align-items: center; gap: 10px; min-width: 0; }

/* 브랜드 카드 */
.brands { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.bcard { display: flex; flex-direction: column; gap: 10px; padding: 18px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); text-decoration: none; min-width: 0; }
.bcard:hover { border-color: var(--fg); }
.bcard b { font-size: 1.05rem; font-weight: 700; letter-spacing: -0.015em; }
.bcard .meta { font-size: 0.8rem; color: var(--muted); }
.bcard .sws { display: flex; gap: 5px; flex-wrap: wrap; }
.bcard .bn { font-size: 0.84rem; color: var(--muted); margin: 0; word-break: keep-all; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.legend { display: flex; gap: 6px 14px; flex-wrap: wrap; align-items: center; font-size: 0.78rem; color: var(--muted); margin-top: 16px; }
.legend span { display: inline-flex; align-items: center; gap: 6px; }

/* 목록 페이지 도구 */
.toolbar { display: grid; gap: 14px; margin-bottom: 22px; }
.tools { display: flex; gap: 10px; flex-wrap: wrap; }
.tools input, .tools select { font: inherit; font-size: 0.95rem; padding: 10px 14px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); color: var(--fg); min-width: 0; }
.tools input { flex: 1 1 260px; max-width: 460px; }

/* 상세 */
.crumbs { display: flex; gap: 8px; flex-wrap: wrap; font-size: 0.8rem; color: var(--muted); border-top: 1px solid var(--line); padding-top: 18px; }
.crumbs a { text-decoration: none; }
.crumbs a:hover { color: var(--fg); }
.detail { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 48px; padding-block: 28px 56px; align-items: start; }
.detail .pop { flex-direction: row; align-items: center; justify-content: flex-start; gap: 10px; margin-bottom: 18px; }
.prose p { max-width: 38em; margin: 0 0 12px; word-break: keep-all; }

/* 계산기 */
.calc { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 48px; align-items: start; }
.field { display: grid; gap: 8px; margin-bottom: 22px; }
.field label, .field .lbl { font-size: 0.8rem; color: var(--muted); }
.field input[type="number"] { font: inherit; font-size: 1.4rem; width: 160px; max-width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); color: var(--fg); }
.out { border-top: 2px solid var(--fg); padding-top: 18px; }
.out .big { font-weight: 800; font-size: clamp(2.6rem, 7vw, 4rem); letter-spacing: -0.03em; line-height: 1.05; }
.out .big span { font-size: 1.1rem; font-weight: 500; color: var(--muted); margin-left: 6px; letter-spacing: 0; }
.out ul { list-style: none; padding: 0; margin: 20px 0 0; font-size: 0.88rem; }
.out li { display: flex; justify-content: space-between; gap: 16px; padding: 10px 0; border-bottom: 1px solid var(--line); }
.out li span:first-child { color: var(--muted); }

/* 푸터 */
footer { border-top: 1px solid var(--line); padding-block: 36px 56px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); gap: 32px 48px; color: var(--muted); font-size: 0.85rem; }
footer p { margin: 0 0 14px; max-width: 42em; word-break: keep-all; }
footer .flinks { display: flex; flex-wrap: wrap; gap: 6px 16px; }
footer .flinks a { text-decoration: none; }
footer .flinks a:hover { color: var(--fg); }

@media (max-width: 900px) {
  .brands { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 820px) {
  .hero, .calc, .detail, footer { grid-template-columns: minmax(0, 1fr); gap: 28px; }
  .hero { padding-block: 28px 44px; }
  section { padding-block: 44px; }
  .item { grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: "main pop" "notes notes" "roast act"; gap: 10px 12px; padding: 16px 0; }
  .item .roast { align-self: center; }
  .gear .item { grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: "main act" "notes notes"; }
  .nav { gap: 16px; }
}
@media (prefers-reduced-motion: reduce) { .track { transition: none; } html { scroll-behavior: auto; } }
@media (prefers-reduced-motion: no-preference) { .chip, .btn, .go, .bcard { transition: background-color .15s, color .15s, border-color .15s, opacity .15s; } }`;
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
    var st = { q: '', form: '전체', brand: '전체', sort: 'pop' };

    var params = new URLSearchParams(location.search);
    if (params.get('q')) st.q = params.get('q');
    if (params.get('form')) st.form = params.get('form');
    if (params.get('brand')) st.brand = params.get('brand');
    if (params.get('sort')) st.sort = params.get('sort');

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
        var ok = (st.form === '전체' || r.getAttribute('data-form') === st.form) &&
                 (st.brand === '전체' || r.getAttribute('data-brand') === st.brand) &&
                 (!term || r.getAttribute('data-search').indexOf(term) > -1);
        r.hidden = !ok;
        if (ok) shown.push(r);
      });
      shown.sort(sorters[st.sort] || sorters.pop).forEach(function (r) { list.appendChild(r); });
      count.textContent = shown.length + '개 상품';
      empty.hidden = shown.length !== 0;

      var p = new URLSearchParams();
      if (st.q) p.set('q', st.q);
      if (st.form !== '전체') p.set('form', st.form);
      if (st.brand !== '전체') p.set('brand', st.brand);
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

const itemSlugs = new Set();
const items = (data.items || []).map((it, i) => {
  const label = '상품 ' + (i + 1) + (it && it.name ? ' (' + it.name + ')' : '');
  if (!it || !it.name) fail(label + ': name 이 없습니다.');
  if (!brandByName.has(it.brand)) fail(label + ': brand "' + it.brand + '" 가 brands 목록에 없습니다.');
  if (!SLUG.test(it.slug || '')) fail(label + ': slug 는 영문 소문자, 숫자, 하이픈만 쓸 수 있습니다. 예: fritz-old-dog');
  if (itemSlugs.has(it.slug)) fail(label + ': slug 가 다른 상품과 중복됩니다: ' + it.slug);
  itemSlugs.add(it.slug);
  return Object.assign({ notes: '', roast: 0, roastLabel: '', reviews: null, url: '', featured: false, description: '', size: '', form: '원두' }, it, { i });
});
if (!items.length) fail('items 가 비어 있습니다.');

const forms = (data.forms || []).filter(f => items.some(it => it.form === f));

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

// 로고: 파일이 있으면 이미지, 없으면 브랜드 이름 첫 글자 배지. 다크 모드에서도 보이도록 밝은 판 위에 올립니다.
function logoHtml(b, P, size, decorative) {
  if (b.logoPath) {
    return '<span class="logo ' + size + '"' + (b.logoBgCss ? ' style="background:' + b.logoBgCss + '"' : '') + '><img src="' + P + esc(b.logoPath) + '" alt="' + (decorative ? '' : esc(b.name) + ' 로고') + '" loading="lazy" decoding="async"></span>';
  }
  return '<span class="logo mono ' + size + '" aria-hidden="true">' + esc(Array.from(b.name)[0]) + '</span>';
}
function swatch(it) { return '<span class="sw r' + (it.roast > 0 ? it.roast : 0) + '" aria-hidden="true"></span>'; }
function rbar(roast) {
  let d = '';
  for (let k = 1; k <= 5; k++) d += '<i class="' + (k <= roast ? 'on' : '') + '"></i>';
  return '<div class="rbar" aria-hidden="true">' + d + '</div>';
}
function roastHtml(it) {
  if (!(it.roast > 0)) return '<span class="rlabel">로스팅 미표기</span>';
  return rbar(it.roast) + '<span class="rlabel">' + esc(it.roastLabel) + '</span>';
}
function popHtml(it) {
  if (it.reviews == null) return '<div class="pop"><span>후기 정보 없음</span></div>';
  const cls = it.rank <= 3 ? 'rank top' : (it.rank <= 6 ? 'rank mid' : '');
  return '<div class="pop">' + (cls ? '<span class="' + cls + '">인기 ' + it.rank + '위</span>' : '') + '<span>후기 ' + fmt(it.reviews) + '건</span></div>';
}
function buyUrl(it) {
  if (/^https?:\/\//.test(it.url || '')) return it.url;
  const q = it.brand + ' ' + it.name + (it.form === '원두' ? ' 원두' : ' ' + it.form);
  return 'https://search.shopping.naver.com/search/all?query=' + encodeURIComponent(q);
}
const affLabel = () => (site.affiliate ? '<span class="aff">제휴 링크 포함</span>' : '');

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
  '콜드브루': '차갑게 우려낸 커피로 바로 마실 수 있는 형태입니다. 보관 방법과 유통기한은 판매처 안내를 확인하세요.',
  '디카페인': '카페인을 줄인 커피입니다. 맛 설명과 로스팅 정보는 판매처 상품 페이지를 참고했습니다.'
};
const ROAST_NAMES = ['라이트', '미디엄 라이트', '미디엄', '미디엄 다크', '다크'];

// ---------- 페이지 뼈대 ----------
function layout({ P, urlPath, title, desc, body, ld }) {
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
    '<link rel="stylesheet" href="' + P + 'style.css">\n' +
    (ld ? ld + '\n' : '') +
    '</head>\n<body>\n<div class="wrap">\n' +
    '<header class="top"><a class="brand" href="' + root + '"><i></i>' + esc(site.name) + '</a>' +
    '<nav class="nav" aria-label="주요 메뉴"><a href="' + P + 'beans/">전체 원두</a><a href="' + root + '#brands">브랜드</a><a href="' + root + '#gear">커피용품</a><a href="' + root + '#ratio">추출 비율</a></nav></header>\n' +
    body + '\n' + footer(P) + '\n</div>\n<script src="' + P + 'app.js" defer></script>\n</body>\n</html>\n';
}
function footer(P) {
  return '<footer><div><strong style="color:var(--fg);">' + esc(site.name) + '</strong></div><div>' +
    '<p>' + esc(site.name) + '는 제품을 직접 판매하지 않으며 외부 구매처로 연결하는 정보 서비스입니다. ' +
    (site.affiliate ? '구매처 링크에는 판매 수수료를 받는 제휴 링크가 포함되어 있으며, 해당 링크 옆에 표시합니다. ' : '') +
    '가격, 재고, 배송과 교환은 각 구매처의 정책을 따릅니다. 상품 구성과 맛 설명은 판매처 정보를 참고한 것으로 시기에 따라 바뀔 수 있습니다.</p>' +
    '<div class="flinks"><a href="' + P + 'beans/">전체 원두</a>' + brands.map(b => '<a href="' + P + 'brands/' + b.slug + '/">' + esc(b.name) + '</a>').join('') + '</div></div></footer>';
}
function crumbs(P, parts) {
  const root = P || './';
  return '<nav class="crumbs" aria-label="현재 위치"><a href="' + root + '">홈</a>' +
    parts.map(p => '<span>/</span>' + (p.href ? '<a href="' + p.href + '">' + esc(p.label) + '</a>' : '<span aria-current="page">' + esc(p.label) + '</span>')).join('') + '</nav>';
}
function breadcrumbLd(parts) {
  return jsonLd({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: parts.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name, item: site.url + p.path }))
  });
}
// 상품 행: 행 전체를 누르면 상세 페이지로, 구매처 연결은 별도 버튼입니다.
function row(it, P) {
  const search = (it.name + ' ' + it.brand + ' ' + it.form + ' ' + it.notes).toLowerCase();
  return '<article class="item" data-i="' + it.i + '" data-brand="' + esc(it.brand) + '" data-form="' + esc(it.form) + '" data-reviews="' + (it.reviews == null ? -1 : it.reviews) + '" data-roast="' + it.roast + '" data-name="' + esc(it.name) + '" data-search="' + esc(search) + '">' +
    '<div class="main"><h3>' + swatch(it) + '<a href="' + P + 'beans/' + it.slug + '/">' + esc(it.name) + '</a></h3>' +
    '<div class="sub"><a href="' + P + 'brands/' + brandByName.get(it.brand).slug + '/">' + esc(it.brand) + '</a> · ' + esc(it.form) + ' ' + esc(it.size) + '</div></div>' +
    '<p class="notes">' + esc(it.notes) + '</p>' +
    '<div class="roast">' + roastHtml(it) + '</div>' +
    popHtml(it) +
    '<div class="act"><a class="go" href="' + esc(buyUrl(it)) + '" target="_blank" rel="noopener noreferrer sponsored">구매처 연결 ↗</a>' + affLabel() + '</div></article>';
}
function legend() {
  return '<div class="legend" aria-label="로스팅 색 안내">로스팅 ' + ROAST_NAMES.map((n, k) => '<span><i class="sw r' + (k + 1) + '"></i>' + n + '</span>').join('') + '<span><i class="sw r0"></i>미표기</span></div>';
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
    const rv = b.reviews == null ? '정보 없음' : fmt(b.reviews) + '건 · 마켓컬리';
    return '<div class="slide" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' / ' + slides.length + '"' + (i ? ' aria-hidden="true"' : '') + '>' +
      '<div class="sheet"><div class="head"><small>Today\'s Bean</small><a href="beans/' + b.slug + '/">' + esc(b.name) + '</a></div>' +
      '<div class="row"><span>브랜드</span><span>' + esc(b.brand) + '</span></div>' +
      '<div class="row"><span>형태</span><span>' + esc(b.form) + ' ' + esc(b.size) + '</span></div>' +
      '<div class="row"><span>로스팅</span><span class="rr">' + roastHtml(b) + '</span></div>' +
      '<div class="row"><span>컵 노트</span><span>' + esc(b.notes) + '</span></div>' +
      '<div class="row"><span>후기</span><span>' + esc(rv) + '</span></div></div></div>';
  }).join('');
  const dots = slides.map((b, i) => '<button type="button" class="sdot" aria-label="' + (i + 1) + '번째 원두 보기" aria-current="' + (i === 0) + '"><span></span></button>').join('');

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
    const fs_ = forms.filter(f => list.some(it => it.form === f)).join('·');
    return '<a class="bcard" href="brands/' + b.slug + '/"><span class="bhead">' + logoHtml(b, '', 'sm', true) + '<b>' + esc(b.name) + '</b></span><span class="meta">' + list.length + '종 · ' + esc(fs_) + '</span>' +
      (list.some(it => it.roast > 0) ? '<span class="sws" aria-hidden="true">' + list.filter(it => it.roast > 0).map(swatch).join('') + '</span>' : '<span class="meta">로스팅 미표기</span>') + '<p class="bn">' + esc(list[0].notes) + '</p></a>';
  }).join('');

  const formLinks = forms.map(f => '<a class="chip" href="beans/?form=' + encodeURIComponent(f) + '">' + esc(f) + ' ' + items.filter(it => it.form === f).length + '</a>').join('');

  const gear = (data.gear || []).map(g => {
    const href = /^https?:\/\//.test(g.url || '') ? g.url : 'https://search.shopping.naver.com/search/all?query=' + encodeURIComponent(g.query || g.name);
    return '<article class="item"><div class="main"><h3>' + esc(g.name) + '</h3></div><p class="check"><b>' + esc(g.point || '') + '</b> ' + esc(g.text || '') + '</p>' +
      '<div class="act"><a class="go" href="' + esc(href) + '" target="_blank" rel="noopener noreferrer sponsored">구매처 연결 ↗</a>' + affLabel() + '</div></article>';
  }).join('');

  const body = '<main id="top">\n<div class="hero">\n<div>\n' +
    '<h1>원두는 취향대로,<br>구매는 편하게.</h1>\n' +
    '<p class="lead">브랜드별 원두의 컵 노트와 로스팅 단계를 비교하고, 마음에 드는 제품은 구매처로 바로 연결해 드립니다. ' + esc(site.name) + '는 직접 판매하지 않고 고르는 과정만 돕습니다.</p>\n' +
    '<div class="actions"><a class="btn" href="beans/">전체 원두 ' + items.length + '종 보기</a><a class="btn ghost" href="#ratio">추출 비율 계산</a></div>\n</div>\n' +
    '<div class="slider" id="slider" role="region" aria-roledescription="carousel" aria-label="오늘의 원두"><div class="viewport"><div class="track" id="track">' + slideHtml + '</div></div><div class="sdots" id="sdots">' + dots + '</div></div>\n</div>\n' +

    '<section id="popular">\n<div class="sec-head"><div><p class="eyebrow">Popular</p><h2>지금 인기 있는 원두</h2></div><a class="more" href="beans/">전체 보기 →</a></div>\n' +
    '<p class="note">인기 순위는 마켓컬리 후기 수 기준이며 맛 평가가 아닙니다 · ' + esc(UPDATED) + ' 확인</p>\n' +
    '<div class="list">' + popular.map(it => row(it, P)).join('\n') + '</div>\n' + legend() + '\n</section>\n' +

    '<section id="brands">\n<div class="sec-head"><div><p class="eyebrow">Brands</p><h2>브랜드로 찾기</h2></div><p class="desc">브랜드를 고르면 그 브랜드의 원두만 모아 볼 수 있습니다.</p></div>\n' +
    '<div class="brands">' + brandCards + '</div>\n' +
    '<div class="sec-head" style="margin:36px 0 14px"><div><p class="eyebrow">Types</p><h2 style="font-size:1.2rem">형태로 찾기</h2></div></div>\n<div class="chips">' + formLinks + '</div>\n</section>\n' +

    '<section id="gear">\n<div class="sec-head"><div><p class="eyebrow">Gear</p><h2>처음 갖출 커피용품</h2></div>' +
    '<p class="desc">집에서 핸드드립을 시작할 때 맛 차이를 만드는 순서대로 정리했습니다.</p></div>\n<div class="gear list">' + gear + '</div>\n</section>\n' +

    '<section id="ratio">\n<div class="sec-head"><div><p class="eyebrow">Brew Ratio</p><h2>추출 비율 계산</h2></div>' +
    '<p class="desc">원두 양과 비율을 정하면 필요한 물의 양이 나옵니다. 1:15는 진하게, 1:17은 가볍게 마시는 쪽입니다.</p></div>\n' +
    '<div class="calc"><div>\n<div class="field"><label for="beanG">원두 (g)</label><input id="beanG" type="number" inputmode="decimal" min="1" max="200" step="0.5" value="20"></div>\n' +
    '<div class="field"><span class="lbl" id="ratioLbl">비율 (원두 : 물)</span><div class="chips" role="group" aria-labelledby="ratioLbl" id="ratioChips">' +
    [15, 16, 17].map(r => '<button type="button" class="chip" data-r="' + r + '" aria-pressed="' + (r === 16) + '">1 : ' + r + '</button>').join('') + '</div></div>\n</div>\n' +
    '<div class="out" aria-live="polite"><div class="big"><b id="waterOut">320</b><span>ml 물</span></div><ul>' +
    '<li><span>비율</span><span id="ratioOut">1 : 16</span></li><li><span>추출 후 예상 양</span><span id="cupOut">약 280 ml</span></li>' +
    '<li><span>목표 추출 시간</span><span>2:30 – 3:30</span></li><li><span>물 온도</span><span>90 – 96 °C</span></li></ul></div></div>\n</section>\n</main>';

  const top3 = brands.slice(0, 3).map(b => b.name).join(', ');
  const desc = trunc(top3 + ' 등 ' + brands.length + '개 로스터리의 원두·드립백·콜드브루 ' + items.length + '종을 컵노트와 로스팅 단계로 비교하고, 마음에 드는 제품은 구매처로 바로 연결합니다.', 160);
  return layout({
    P, urlPath: '/', title: site.name + ' | 원두·드립백 브랜드별 컵노트 비교와 구매처 연결', desc, body,
    ld: jsonLd({ '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: site.url + '/', inLanguage: 'ko' })
  });
}

// ---------- 전체 목록 (검색·정렬·필터) ----------
function listPage() {
  const P = '../';
  const chip = (v, label, pressed) => '<button type="button" class="chip" data-v="' + esc(v) + '" aria-pressed="' + pressed + '">' + esc(label) + '</button>';
  const body = '<main>\n' + crumbs(P, [{ label: '전체 원두' }]) +
    '\n<section class="phead"><p class="eyebrow">All Beans</p><h1 class="page-title">전체 원두 ' + items.length + '종</h1>' +
    '<p class="lead">브랜드, 형태를 고르거나 이름과 컵 노트로 검색해 보세요. 기본 순서는 후기가 많은 순입니다.</p></section>\n' +
    '<section class="tight" id="list-page" style="border-top:0;padding-top:8px">\n<div class="toolbar" id="toolbar" hidden>\n' +
    '<div class="tools"><label class="sr" for="q">검색</label><input id="q" type="search" placeholder="이름, 브랜드, 컵 노트로 검색 (예: 초콜릿)" autocomplete="off">' +
    '<label class="sr" for="sort">정렬</label><select id="sort"><option value="pop">인기순</option><option value="light">로스팅 라이트순</option><option value="dark">로스팅 다크순</option><option value="name">이름순</option></select></div>\n' +
    '<div class="fgroup"><span class="flabel">형태</span><div class="chips" id="chips-form">' + chip('전체', '전체', true) + forms.map(f => chip(f, f, false)).join('') + '</div></div>\n' +
    '<div class="fgroup"><span class="flabel">브랜드</span><div class="chips" id="chips-brand">' + chip('전체', '전체', true) + brands.map(b => chip(b.name, b.name, false)).join('') + '</div></div>\n</div>\n' +
    '<p class="count" id="count" aria-live="polite">' + items.length + '개 상품</p>\n' +
    '<p class="note">인기 순위는 마켓컬리 후기 수 기준이며 맛 평가가 아닙니다 · ' + esc(UPDATED) + ' 확인</p>\n' +
    '<div class="list" id="beans">' + sorted.map(it => row(it, P)).join('\n') + '</div>\n' +
    '<p class="empty" id="empty" hidden>조건에 맞는 상품이 없습니다. 검색어나 필터를 바꿔 보세요.</p>\n' + legend() + '\n</section>\n</main>';
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
  const fs_ = forms.filter(f => list.some(it => it.form === f));
  const formsText = fs_.join('·');
  const top = list.filter(it => it.reviews != null)[0];
  const roasted = list.filter(it => it.roast > 0).length;
  const auto = b.name + '의 ' + formsText + ' ' + list.length + '종의 컵 노트와 로스팅 정보를 모았습니다.' +
    (top ? ' 판매처 후기가 가장 많은 상품은 ' + top.name + '(후기 ' + fmt(top.reviews) + '건)입니다.' : '') +
    (roasted ? ' 로스팅 단계가 표기된 상품은 ' + roasted + '종이며, 나머지는 판매처에 로스팅 정보가 없습니다.' : ' 판매처에 로스팅 단계가 표기된 상품은 없습니다.');
  const intro = (b.intro ? esc(b.intro) + ' ' : '') + esc(auto);
  const others = brands.filter(x => x.name !== b.name);
  const body = '<main>\n' + crumbs(P, [{ label: b.name }]) +
    '\n<section class="phead"><p class="eyebrow">Brand</p><div class="bhero">' + logoHtml(b, P, 'lg', false) + '<h1 class="page-title" style="margin:0">' + esc(b.name) + ' ' + esc(formsText) + '</h1></div><p class="lead" style="margin-bottom:0">' + intro + '</p></section>\n' +
    '<section class="tight" style="border-top:0;padding-top:8px"><p class="count">' + list.length + '개 상품 · 후기가 많은 순</p><p class="note">인기 순위는 마켓컬리 후기 수 기준이며 맛 평가가 아닙니다 · ' + esc(UPDATED) + ' 확인</p>' +
    '<div class="list">' + list.map(it => row(it, P)).join('\n') + '</div>' + legend() + '</section>\n' +
    '<section class="tight"><p class="eyebrow">Other Brands</p><div class="chips">' + others.map(o => '<a class="chip" href="' + P + 'brands/' + o.slug + '/">' + esc(o.name) + '</a>').join('') + '</div></section>\n</main>';
  return layout({
    P, urlPath: brandUrl(b.name), title: b.name + ' ' + formsText + ' 컵노트·로스팅·구매처 | ' + site.name,
    desc: trunc(b.name + ' ' + formsText + ' ' + list.length + '종: ' + list.slice(0, 3).map(it => it.name).join(', ') + ' 등의 컵 노트와 로스팅 단계를 비교하고 구매처로 연결합니다.', 160),
    body, ld: breadcrumbLd([{ name: '홈', path: '/' }, { name: b.name, path: brandUrl(b.name) }])
  });
}

// ---------- 원두 페이지 ----------
function beanPage(it) {
  const P = '../../';
  const b = brandByName.get(it.brand);
  const lead = it.description ? esc(it.description) :
    esc(it.brand + ' ' + it.name + ' ' + it.form + '(' + it.size + ')의 컵 노트와 로스팅 정보입니다. 컵 노트는 ' + it.notes + '.');
  const rv = it.reviews == null ? '정보 없음' : fmt(it.reviews) + '건 · 마켓컬리';
  const guide = (it.roast > 0
    ? '<p>로스팅 단계는 ' + esc(it.roastLabel) + '로 표기되어 있습니다. ' + esc(ROAST_TIP[it.roast]) + ' 물 온도는 일반적인 가이드이며, 로스터의 안내가 있으면 그쪽을 따르세요.</p>'
    : '<p>이 상품은 판매처 페이지에 로스팅 단계가 표기되어 있지 않습니다. 구매 전에 판매처의 상품 설명을 확인하세요.</p>') +
    (FORM_TEXT[it.form] ? '<p>' + esc(it.form) + ': ' + esc(FORM_TEXT[it.form]) + '</p>' : '');
  const sameBrand = itemsOf(it.brand).filter(x => x.slug !== it.slug).slice(0, 4);
  const sameForm = sorted.filter(x => x.form === it.form && x.brand !== it.brand).slice(0, 3);
  const body = '<main>\n' + crumbs(P, [{ label: it.brand, href: P + 'brands/' + b.slug + '/' }, { label: it.name }]) +
    '\n<div class="detail"><div><p class="eyebrow">' + esc(it.brand) + ' · ' + esc(it.form) + '</p><h1 class="page-title">' + esc(it.name) + '</h1>' + popHtml(it) +
    '<p class="lead">' + lead + '</p>' +
    '<div class="actions"><a class="btn" href="' + esc(buyUrl(it)) + '" target="_blank" rel="noopener noreferrer sponsored">구매처 연결 ↗</a><a class="btn ghost" href="' + P + 'brands/' + b.slug + '/">' + esc(it.brand) + ' 전체 보기</a></div>' +
    (site.affiliate ? '<p class="note" style="margin-top:10px">제휴 링크 포함</p>' : '') + '</div>\n' +
    '<div class="sheet"><div class="head"><small>Bean Sheet</small>' + esc(it.name) + '</div>' +
    '<div class="row"><span>브랜드</span><span>' + esc(it.brand) + '</span></div>' +
    '<div class="row"><span>형태</span><span>' + esc(it.form) + ' ' + esc(it.size) + '</span></div>' +
    '<div class="row"><span>로스팅</span><span class="rr">' + roastHtml(it) + '</span></div>' +
    '<div class="row"><span>컵 노트</span><span>' + esc(it.notes) + '</span></div>' +
    '<div class="row"><span>후기</span><span>' + esc(rv) + '</span></div></div></div>\n' +
    '<section class="tight"><h2>로스팅과 추출 가이드</h2><div class="prose">' + guide + '</div></section>\n' +
    (sameBrand.length ? '<section class="tight"><h2>' + esc(it.brand) + '의 다른 상품</h2><div class="list">' + sameBrand.map(x => row(x, P)).join('\n') + '</div></section>\n' : '') +
    (sameForm.length ? '<section class="tight"><h2>다른 브랜드의 ' + esc(it.form) + '</h2><div class="list">' + sameForm.map(x => row(x, P)).join('\n') + '</div></section>\n' : '') +
    '</main>';
  const descTxt = it.brand + ' ' + it.name + ' ' + it.form + ' ' + it.size + '. 컵 노트: ' + it.notes + '.' + (it.roast > 0 ? ' 로스팅: ' + it.roastLabel + '.' : '') + (it.reviews != null ? ' 판매처 후기 ' + fmt(it.reviews) + '건.' : '');
  return layout({
    P, urlPath: beanUrl(it), title: it.brand + ' ' + it.name + ' ' + it.form + ' 컵노트·로스팅 | ' + site.name,
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
write('style.css', CSS);
write('app.js', APPJS);

const urls = ['/', '/beans/'].concat(brands.filter(b => items.some(it => it.brand === b.name)).map(b => '/brands/' + b.slug + '/'), items.map(beanUrl));
write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(u => '  <url><loc>' + esc(site.url + u) + '</loc>' + (UPDATED ? '<lastmod>' + esc(UPDATED) + '</lastmod>' : '') + '</url>').join('\n') + '\n</urlset>\n');
write('robots.txt', 'User-agent: *\nAllow: /\n\nSitemap: ' + site.url + '/sitemap.xml\n');
write('404.html', '<!doctype html>\n<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
  '<title>페이지를 찾을 수 없습니다 | ' + esc(site.name) + '</title><meta name="robots" content="noindex">' +
  '<link rel="stylesheet" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">' +
  '<link rel="stylesheet" href="' + BASE + '/style.css"></head>' +
  '<body><div class="wrap"><section class="phead"><p class="eyebrow">404</p><h1 class="page-title">페이지를 찾을 수 없습니다</h1>' +
  '<p class="lead">주소가 바뀌었거나 없는 페이지입니다.</p><div class="actions"><a class="btn" href="' + BASE + '/">홈으로</a></div></section></div></body></html>\n');

console.log('빌드 완료: 홈 1, 전체 목록 1, 브랜드 ' + brands.length + ', 원두 ' + items.length + ' 페이지 → dist/');
