// 원두노트 빌드 스크립트
// products.json 을 읽어 dist/ 폴더에 정적 HTML(홈, 브랜드별, 원두별), sitemap.xml, robots.txt, 404.html 을 만듭니다.
// GitHub Actions 가 products.json 이 바뀔 때마다 자동으로 실행하므로 직접 실행할 필요는 없습니다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'dist');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'products.json'), 'utf8'));

function fail(msg) { console.error('\n[products.json 오류] ' + msg + '\n'); process.exit(1); }

const CSS = String.raw`/* Layout: 좌측 정렬 에디토리얼 그리드. 헤어라인으로 구획하고 카드는 쓰지 않는다. */
:root {
  --bg: #F2F2EF;
  --surface: #FAFAF8;
  --fg: #161616;
  --muted: #66665F;
  --line: #D8D8D1;
  --accent: #A8322D;
  --on-accent: #FFFFFF;
  --font-display: "Manrope", "Noto Sans KR", system-ui, sans-serif;
  --font-body: "Noto Sans KR", system-ui, -apple-system, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, monospace;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #121211; --surface: #1A1A18; --fg: #EDEDE8; --muted: #9B9B93;
    --line: #2F2F2B; --accent: #E2675F; --on-accent: #161616;
    color-scheme: dark;
  }
}
:root[data-theme="dark"] {
  --bg: #121211; --surface: #1A1A18; --fg: #EDEDE8; --muted: #9B9B93;
  --line: #2F2F2B; --accent: #E2675F; --on-accent: #161616;
  color-scheme: dark;
}
* { box-sizing: border-box; }
body {
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.7;
  padding-block: 0;
  padding-left: max(16px, env(safe-area-inset-left, 0px));
  padding-right: max(16px, env(safe-area-inset-right, 0px));
  -webkit-font-smoothing: antialiased;
}
.wrap { max-width: 1080px; margin: 0 auto; }
a { color: inherit; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }

/* header */
.top { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding-block: 22px; flex-wrap: wrap; }
.brand { font-family: var(--font-display); font-weight: 800; font-size: 1.15rem; letter-spacing: -0.02em; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; }
.brand i { width: 12px; height: 12px; border-radius: 50%; background: var(--accent); display: inline-block; }
.nav { display: flex; gap: 22px; font-size: 0.9rem; color: var(--muted); }
.nav a { text-decoration: none; }
.nav a:hover { color: var(--fg); }

/* hero */
.hero { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr); gap: 48px; padding-block: 56px 72px; border-top: 1px solid var(--line); align-items: end; }
h1 { font-family: var(--font-display); font-weight: 800; font-size: clamp(2.3rem, 6.4vw, 4.4rem); line-height: 1.12; letter-spacing: -0.035em; margin: 0 0 24px; text-wrap: balance; word-break: keep-all; }
.lead { color: var(--muted); max-width: 34em; margin: 0 0 32px; word-break: keep-all; }
.actions { display: flex; gap: 12px; flex-wrap: wrap; }
.btn { font: inherit; font-weight: 500; font-size: 0.95rem; padding: 12px 20px; border-radius: 4px; border: 1px solid var(--fg); background: var(--fg); color: var(--bg); text-decoration: none; cursor: pointer; display: inline-block; line-height: 1.3; }
.btn.ghost { background: transparent; color: var(--fg); }
.btn:hover { opacity: 0.86; }

.sheet { font-family: var(--font-mono); font-size: 0.8rem; line-height: 1.5; border-top: 2px solid var(--fg); }
.sheet .row { display: flex; justify-content: space-between; gap: 16px; padding: 11px 0; border-bottom: 1px solid var(--line); }
.sheet .row span:first-child { color: var(--muted); }
.sheet .row span:last-child { text-align: right; min-width: 0; }
.sheet .head { font-family: var(--font-display); font-weight: 700; font-size: 1.05rem; padding: 14px 0 12px; border-bottom: 1px solid var(--line); }
.sheet .head small { display: block; font-family: var(--font-mono); font-weight: 400; font-size: 0.72rem; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; }

/* sections */
section { padding-block: 64px; border-top: 1px solid var(--line); scroll-margin-top: 8px; }
.sec-head { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); gap: 48px; margin-bottom: 36px; }
.eyebrow { font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); margin: 0 0 10px; }
h2 { font-family: var(--font-display); font-weight: 800; font-size: clamp(1.6rem, 3.6vw, 2.2rem); line-height: 1.25; letter-spacing: -0.03em; margin: 0; text-wrap: balance; word-break: keep-all; }
.sec-head p.desc { color: var(--muted); margin: 0; max-width: 38em; word-break: keep-all; align-self: end; }

/* finder */
.filters { display: grid; gap: 14px; margin-bottom: 28px; }
.fgroup { display: flex; gap: 8px 14px; align-items: center; flex-wrap: wrap; }
.flabel { font-family: var(--font-body); font-size: 0.8rem; color: var(--muted); width: 52px; flex: none; }
.chips { display: flex; gap: 8px; flex-wrap: wrap; }
.chip { font: inherit; font-size: 0.88rem; padding: 6px 14px; border-radius: 999px; border: 1px solid var(--line); background: transparent; color: var(--fg); cursor: pointer; line-height: 1.5; }
.chip:hover { border-color: var(--fg); }
.chip[aria-pressed="true"] { background: var(--fg); color: var(--bg); border-color: var(--fg); }

.list { border-top: 2px solid var(--fg); }
.item { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.6fr) 150px auto; gap: 20px; align-items: center; padding: 20px 0; border-bottom: 1px solid var(--line); }
.item h3 { font-family: var(--font-display); font-size: 1.08rem; font-weight: 700; letter-spacing: -0.02em; margin: 0; word-break: keep-all; }
.item .sub { font-family: var(--font-mono); font-size: 0.72rem; color: var(--muted); letter-spacing: 0.04em; margin-top: 2px; }
.item .notes { margin: 0; word-break: keep-all; }
.item .notes small { display: block; color: var(--muted); font-size: 0.82rem; margin-top: 2px; }
.roast { display: flex; flex-direction: column; gap: 6px; font-family: var(--font-mono); font-size: 0.72rem; color: var(--muted); }
.dots { display: flex; gap: 4px; }
.dots b { width: 14px; height: 6px; border-radius: 1px; background: var(--line); display: block; }
.dots b.on { background: var(--accent); }
.go { font-size: 0.88rem; font-weight: 500; text-decoration: none; border-bottom: 1px solid var(--fg); padding-bottom: 1px; white-space: nowrap; }
.go:hover { color: var(--accent); border-color: var(--accent); }
.rating { display: flex; align-items: center; gap: 8px; margin-top: 8px; font-family: var(--font-mono); font-size: 0.72rem; color: var(--muted); flex-wrap: wrap; }
.stars { display: inline-flex; letter-spacing: 1px; font-size: 0.82rem; line-height: 1; }
.stars .on { color: var(--accent); }
.stars .off { color: var(--line); }
.slider { min-width: 0; }
.viewport { overflow: hidden; }
.track { display: flex; transition: transform .7s cubic-bezier(.65, 0, .25, 1); }
.slide { flex: 0 0 100%; min-width: 0; }
.sdots { display: flex; gap: 4px; margin-top: 10px; }
.sdot { width: 32px; height: 22px; padding: 0; border: 0; background: none; cursor: pointer; display: flex; align-items: center; }
.sdot span { display: block; width: 100%; height: 2px; background: var(--line); }
.sdot[aria-current="true"] span { background: var(--fg); }
.note { font-size: 0.78rem; color: var(--muted); margin: 0 0 12px; }
.sec-head.single { grid-template-columns: minmax(0, 1fr); margin-bottom: 28px; }
@media (prefers-reduced-motion: reduce) { .track { transition: none; } }
.empty { padding: 28px 0; color: var(--muted); border-bottom: 1px solid var(--line); }
.count { font-family: var(--font-mono); font-size: 0.78rem; color: var(--muted); margin: 0 0 10px; }

/* gear */
.gear { border-top: 2px solid var(--fg); }
.gear .item { grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.8fr) auto; }
.gear .check { font-size: 0.9rem; color: var(--muted); margin: 0; word-break: keep-all; }
.gear .check b { color: var(--fg); font-weight: 500; }

/* ratio */
.calc { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 48px; align-items: start; }
.field { display: grid; gap: 8px; margin-bottom: 22px; }
.field label, .field .lbl { font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 0.08em; color: var(--muted); }
.field input[type="number"] { font: inherit; font-family: var(--font-mono); font-size: 1.4rem; width: 160px; max-width: 100%; padding: 8px 12px; border: 1px solid var(--line); border-radius: 4px; background: var(--surface); color: var(--fg); }
.out { border-top: 2px solid var(--fg); padding-top: 18px; }
.out .big { font-family: var(--font-display); font-weight: 800; font-size: clamp(2.6rem, 7vw, 4rem); letter-spacing: -0.04em; line-height: 1.05; font-variant-numeric: tabular-nums; }
.out .big span { font-size: 1.2rem; font-weight: 500; color: var(--muted); margin-left: 6px; letter-spacing: 0; }
.out ul { list-style: none; padding: 0; margin: 20px 0 0; font-family: var(--font-mono); font-size: 0.82rem; }
.out li { display: flex; justify-content: space-between; gap: 16px; padding: 10px 0; border-bottom: 1px solid var(--line); }
.out li span:first-child { color: var(--muted); }

/* footer */
footer { border-top: 1px solid var(--line); padding-block: 36px 56px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); gap: 48px; color: var(--muted); font-size: 0.85rem; }
footer p { margin: 0; max-width: 42em; word-break: keep-all; }

@media (max-width: 820px) {
  .hero, .sec-head, .calc, footer { grid-template-columns: minmax(0, 1fr); gap: 28px; }
  .hero { padding-block: 36px 48px; }
  section { padding-block: 48px; }
  .item { grid-template-columns: minmax(0, 1fr) auto; gap: 8px 16px; }
  .item .notes { grid-column: 1 / -1; order: 3; }
  .item .roast { grid-column: 1 / 2; order: 4; }
  .item .go { grid-column: 2 / 3; grid-row: 1; align-self: start; }
  .gear .item { grid-template-columns: minmax(0, 1fr) auto; }
  .gear .item .check { grid-column: 1 / -1; order: 3; }
  .nav { gap: 16px; }
}
@media (prefers-reduced-motion: no-preference) {
  .chip, .btn, .go { transition: background-color .15s, color .15s, border-color .15s, opacity .15s; }
}

/* ---- 서브 페이지 ---- */
body { margin: 0; }
[hidden] { display: none !important; }
a.chip { display: inline-block; text-decoration: none; }
a.chip[aria-current="page"] { background: var(--fg); color: var(--bg); border-color: var(--fg); }
.item h3 a { text-decoration: none; }
.item h3 a:hover { color: var(--accent); }
.sub a { text-decoration: none; border-bottom: 1px solid var(--line); }
.sub a:hover { border-color: var(--fg); }
.sheet .head a { text-decoration: none; }
.crumbs { display: flex; gap: 8px; flex-wrap: wrap; font-family: var(--font-mono); font-size: 0.78rem; color: var(--muted); border-top: 1px solid var(--line); padding-top: 18px; }
.crumbs a { text-decoration: none; }
.crumbs a:hover { color: var(--fg); }
section.phead { padding-block: 28px 36px; border-top: 0; }
.page-title { font-family: var(--font-display); font-weight: 800; font-size: clamp(1.9rem, 5vw, 3rem); line-height: 1.15; letter-spacing: -0.035em; margin: 0 0 16px; text-wrap: balance; word-break: keep-all; }
section.tight { padding-block: 40px; }
section.tight h2 { margin-bottom: 20px; }
.detail { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 48px; padding-block: 28px 56px; align-items: start; }
.prose p { max-width: 38em; margin: 0 0 12px; word-break: keep-all; }
@media (max-width: 820px) { .detail { grid-template-columns: minmax(0, 1fr); gap: 28px; } }
`;
const APPJS = String.raw`(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  // 1) 홈 샘플 슬라이드: 5초마다 옆으로 넘어갑니다.
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

  // 2) 홈 형태 필터 (자바스크립트가 꺼져 있으면 이 줄은 숨겨지고 전체 목록이 보입니다.)
  var ff = document.getElementById('form-filter');
  if (ff) {
    ff.hidden = false;
    var rows = document.querySelectorAll('#beans .item');
    var count = document.getElementById('count');
    var empty = document.getElementById('empty');
    ff.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      var v = b.getAttribute('data-v');
      each(ff.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      var c = 0;
      each(rows, function (r) {
        var show = v === '전체' || r.getAttribute('data-form') === v;
        r.hidden = !show;
        if (show) c++;
      });
      count.textContent = c + '개 상품 · 후기가 많은 순';
      empty.hidden = c !== 0;
    });
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
const site = Object.assign({ name: '원두노트', url: '' }, data.site || {});
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
});

const itemSlugs = new Set();
const items = (data.items || []).map((it, i) => {
  const label = '상품 ' + (i + 1) + (it && it.name ? ' (' + it.name + ')' : '');
  if (!it || !it.name) fail(label + ': name 이 없습니다.');
  if (!brandByName.has(it.brand)) fail(label + ': brand "' + it.brand + '" 가 brands 목록에 없습니다.');
  if (!SLUG.test(it.slug || '')) fail(label + ': slug 는 영문 소문자, 숫자, 하이픈만 쓸 수 있습니다. 예: fritz-old-dog');
  if (itemSlugs.has(it.slug)) fail(label + ': slug 가 다른 상품과 중복됩니다: ' + it.slug);
  itemSlugs.add(it.slug);
  return Object.assign({ notes: '', roast: 0, roastLabel: '', reviews: null, stars: null, url: '', featured: false, description: '', size: '', form: '원두' }, it, { i });
});
if (!items.length) fail('items 가 비어 있습니다.');

const forms = (data.forms || []).filter(f => items.some(it => it.form === f));

// ---------- 공통 도우미 ----------
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const jsonLd = o => '<script type="application/ld+json">' + JSON.stringify(o).replace(/</g, '\\u003c') + '</script>';

function starsOf(it) {
  if (it.stars >= 1 && it.stars <= 5) return Math.round(it.stars);
  const rv = it.reviews;
  if (rv == null) return 0;
  return rv >= 5000 ? 5 : rv >= 2000 ? 4 : rv >= 1000 ? 3 : rv >= 400 ? 2 : 1;
}
function starsHtml(it) {
  const n = starsOf(it);
  let st = '';
  for (let k = 1; k <= 5; k++) st += '<span class="' + (k <= n ? 'on' : 'off') + '">★</span>';
  const rv = it.reviews == null ? '후기 정보 없음' : '후기 ' + fmt(it.reviews) + '건';
  return '<div class="rating"><span class="stars" role="img" aria-label="' + (n ? '추천 ' + n + '개 (5개 만점)' : '추천 별 없음') + '">' + st + '</span><span class="rv">' + rv + '</span></div>';
}
function roastHtml(it) {
  if (!(it.roast > 0)) return '<span>로스팅 미표기</span>';
  let d = '';
  for (let k = 1; k <= 5; k++) d += '<b class="' + (k <= it.roast ? 'on' : '') + '"></b>';
  return '<div class="dots" aria-hidden="true">' + d + '</div><span>' + esc(it.roastLabel) + '</span>';
}
function buyUrl(it) {
  if (/^https?:\/\//.test(it.url || '')) return it.url;
  const q = it.brand + ' ' + it.name + (it.form === '원두' ? ' 원두' : ' ' + it.form);
  return 'https://search.shopping.naver.com/search/all?query=' + encodeURIComponent(q);
}
const byPopularity = (a, b) => ((b.reviews == null ? -1 : b.reviews) - (a.reviews == null ? -1 : a.reviews)) || (a.i - b.i);
const sorted = items.slice().sort(byPopularity);
const itemsOf = brand => sorted.filter(it => it.brand === brand);
const brandUrl = b => '/brands/' + brandByName.get(b).slug + '/';
const beanUrl = it => '/beans/' + it.slug + '/';
const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

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
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Noto+Sans+KR:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap">\n' +
    '<link rel="stylesheet" href="' + P + 'style.css">\n' +
    (ld ? ld + '\n' : '') +
    '</head>\n<body>\n<div class="wrap">\n' +
    '<header class="top"><a class="brand" href="' + root + '"><i></i>' + esc(site.name) + '</a>' +
    '<nav class="nav" aria-label="섹션 이동"><a href="' + root + '#finder">브랜드별 원두</a><a href="' + root + '#gear">커피용품</a><a href="' + root + '#ratio">추출 비율</a></nav></header>\n' +
    body + '\n' + footer() + '\n</div>\n<script src="' + P + 'app.js" defer></script>\n</body>\n</html>\n';
}
function footer() {
  return '<footer><strong style="color:var(--fg);font-family:var(--font-display);">' + esc(site.name) + '</strong>' +
    '<p>' + esc(site.name) + '는 제품을 직접 판매하지 않으며 외부 구매처로 연결하는 정보 서비스입니다. 구매처 링크에는 판매 수수료를 받는 제휴 링크가 포함될 수 있습니다. ' +
    '가격, 재고, 배송과 교환은 각 구매처의 정책을 따릅니다. 상품 구성과 맛 설명은 판매처 정보를 참고한 것으로 시기에 따라 바뀔 수 있습니다.</p></footer>';
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
function row(it, P) {
  return '<article class="item" data-form="' + esc(it.form) + '">' +
    '<div><h3><a href="' + P.slice(0) + beanUrl(it).slice(1) + '">' + esc(it.name) + '</a></h3>' +
    '<div class="sub"><a href="' + P + brandUrl(it.brand).slice(1) + '">' + esc(it.brand) + '</a> · ' + esc(it.form) + ' ' + esc(it.size) + '</div>' + starsHtml(it) + '</div>' +
    '<p class="notes">' + esc(it.notes) + '</p>' +
    '<div class="roast">' + roastHtml(it) + '</div>' +
    '<a class="go" href="' + esc(buyUrl(it)) + '" target="_blank" rel="noopener noreferrer sponsored">구매처 연결 ↗</a></article>';
}
function brandChips(P, currentBrand) {
  const root = P || './';
  const all = '<a class="chip"' + (currentBrand ? '' : ' aria-current="page"') + ' href="' + root + '#finder">전체 ' + items.length + '</a>';
  return all + brands.map(b => {
    const n = items.filter(it => it.brand === b.name).length;
    return '<a class="chip"' + (currentBrand === b.name ? ' aria-current="page"' : '') + ' href="' + P + 'brands/' + b.slug + '/">' + esc(b.name) + ' ' + n + '</a>';
  }).join('');
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
  const slides = (feat.length ? feat : sorted.slice(0, 5));
  const slideHtml = slides.map((b, i) => {
    const rv = b.reviews == null ? '정보 없음' : '마켓컬리 후기 ' + fmt(b.reviews) + '건';
    return '<div class="slide" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' / ' + slides.length + '"' + (i ? ' aria-hidden="true"' : '') + '>' +
      '<div class="sheet"><div class="head"><small>Sample Sheet</small><a href="' + beanUrl(b).slice(1) + '">' + esc(b.name) + '</a></div>' +
      '<div class="row"><span>브랜드</span><span>' + esc(b.brand) + '</span></div>' +
      '<div class="row"><span>형태</span><span>' + esc(b.form) + ' ' + esc(b.size) + '</span></div>' +
      '<div class="row"><span>로스팅</span><span>' + (b.roast > 0 ? esc(b.roastLabel) : '미표기') + '</span></div>' +
      '<div class="row"><span>컵 노트</span><span>' + esc(b.notes) + '</span></div>' +
      '<div class="row"><span>후기</span><span>' + esc(rv) + '</span></div></div></div>';
  }).join('');
  const dots = slides.map((b, i) => '<button type="button" class="sdot" aria-label="' + (i + 1) + '번째 샘플 보기" aria-current="' + (i === 0) + '"><span></span></button>').join('');

  const formChips = ['전체'].concat(forms).map((f, i) => '<button type="button" class="chip" data-v="' + esc(f) + '" aria-pressed="' + (i === 0) + '">' + esc(f) + '</button>').join('');
  const gear = (data.gear || []).map(g => {
    const href = /^https?:\/\//.test(g.url || '') ? g.url : 'https://search.shopping.naver.com/search/all?query=' + encodeURIComponent(g.query || g.name);
    return '<article class="item"><div><h3>' + esc(g.name) + '</h3></div><p class="check"><b>' + esc(g.point || '') + '</b> ' + esc(g.text || '') + '</p>' +
      '<a class="go" href="' + esc(href) + '" target="_blank" rel="noopener noreferrer sponsored">구매처 연결 ↗</a></article>';
  }).join('');

  const body = '<main id="top">\n<div class="hero">\n<div>\n' +
    '<h1>원두는 취향대로,<br>구매는 가장 쉬운 길로.</h1>\n' +
    '<p class="lead">원산지와 로스팅, 추출 방식까지 비교해 보고, 마음에 드는 원두와 커피용품은 구매처로 바로 연결해 드립니다. ' + esc(site.name) + '는 직접 판매하지 않고 고르는 과정만 돕습니다.</p>\n' +
    '<div class="actions"><a class="btn" href="#finder">브랜드별 원두 보기</a><a class="btn ghost" href="#ratio">추출 비율 계산</a></div>\n</div>\n' +
    '<div class="slider" id="slider" role="region" aria-roledescription="carousel" aria-label="원두 정보 샘플"><div class="viewport"><div class="track" id="track">' + slideHtml + '</div></div><div class="sdots" id="sdots">' + dots + '</div></div>\n</div>\n' +

    '<section id="finder">\n<div class="sec-head single"><div><p class="eyebrow">Beans by Brand</p><h2>브랜드별 원두</h2></div></div>\n' +
    '<div class="filters">\n<div class="fgroup"><span class="flabel">브랜드</span><div class="chips" id="chips-brand">' + brandChips(P, null) + '</div></div>\n' +
    '<div class="fgroup" id="form-filter" hidden><span class="flabel">형태</span><div class="chips">' + formChips + '</div></div>\n</div>\n' +
    '<p class="count" id="count" aria-live="polite">' + items.length + '개 상품 · 후기가 많은 순</p>\n' +
    '<p class="note">별은 마켓컬리 후기 수 기준의 인기 지표이며 맛 평가가 아닙니다 · ' + esc(UPDATED) + ' 확인</p>\n' +
    '<div class="list" id="beans">' + sorted.map(it => row(it, P)).join('\n') + '</div>\n' +
    '<p class="empty" id="empty" hidden>선택한 형태의 상품이 없습니다. 형태를 ‘전체’로 바꿔 보세요.</p>\n</section>\n' +

    '<section id="gear">\n<div class="sec-head"><div><p class="eyebrow">Gear</p><h2>처음 갖출 커피용품</h2></div>' +
    '<p class="desc">집에서 핸드드립을 시작할 때 맛 차이를 만드는 순서대로 정리했습니다. 구매 전에 확인할 점만 짚었습니다.</p></div>\n<div class="gear list">' + gear + '</div>\n</section>\n' +

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
  const parts = [{ label: b.name, name: b.name, path: brandUrl(b.name) }];
  const others = brands.filter(x => x.name !== b.name);
  const body = '<main>\n' + crumbs(P, [{ label: b.name }]) +
    '\n<section class="phead"><p class="eyebrow">Brand</p><h1 class="page-title">' + esc(b.name) + ' ' + esc(formsText) + '</h1><p class="lead">' + intro + '</p></section>\n' +
    '<section class="tight"><p class="count">' + list.length + '개 상품 · 후기가 많은 순</p><p class="note">별은 마켓컬리 후기 수 기준의 인기 지표이며 맛 평가가 아닙니다 · ' + esc(UPDATED) + ' 확인</p>' +
    '<div class="list">' + list.map(it => row(it, P)).join('\n') + '</div></section>\n' +
    '<section class="tight"><p class="eyebrow">Other Brands</p><div class="chips">' + others.map(o => '<a class="chip" href="' + P + 'brands/' + o.slug + '/">' + esc(o.name) + '</a>').join('') + '</div></section>\n</main>';
  return layout({
    P, urlPath: brandUrl(b.name), title: b.name + ' ' + formsText + ' 컵노트·로스팅·구매처 | ' + site.name,
    desc: trunc(b.name + ' ' + formsText + ' ' + list.length + '종: ' + list.slice(0, 3).map(it => it.name).join(', ') + ' 등의 컵 노트와 로스팅 단계를 비교하고 구매처로 연결합니다.', 160),
    body, ld: breadcrumbLd([{ name: '홈', path: '/' }].concat(parts))
  });
}

// ---------- 원두 페이지 ----------
function beanPage(it) {
  const P = '../../';
  const b = brandByName.get(it.brand);
  const lead = it.description ? esc(it.description) :
    esc(it.brand + ' ' + it.name + ' ' + it.form + '(' + it.size + ')의 컵 노트와 로스팅 정보입니다. 컵 노트는 ' + it.notes + '.');
  const rv = it.reviews == null ? '정보 없음' : '마켓컬리 후기 ' + fmt(it.reviews) + '건';
  const guide = (it.roast > 0
    ? '<p>로스팅 단계는 ' + esc(it.roastLabel) + '로 표기되어 있습니다. ' + esc(ROAST_TIP[it.roast]) + ' 아래 물 온도는 일반적인 가이드이며, 로스터의 안내가 있으면 그쪽을 따르세요.</p>'
    : '<p>이 상품은 판매처 페이지에 로스팅 단계가 표기되어 있지 않습니다. 구매 전에 판매처의 상품 설명을 확인하세요.</p>') +
    (FORM_TEXT[it.form] ? '<p>' + esc(it.form) + ': ' + esc(FORM_TEXT[it.form]) + '</p>' : '');
  const sameBrand = itemsOf(it.brand).filter(x => x.slug !== it.slug).slice(0, 4);
  const sameForm = sorted.filter(x => x.form === it.form && x.brand !== it.brand).slice(0, 3);
  const body = '<main>\n' + crumbs(P, [{ label: it.brand, href: P + 'brands/' + b.slug + '/' }, { label: it.name }]) +
    '\n<div class="detail"><div><p class="eyebrow">' + esc(it.brand) + ' · ' + esc(it.form) + '</p><h1 class="page-title">' + esc(it.name) + '</h1>' + starsHtml(it) +
    '<p class="lead" style="margin-top:20px">' + lead + '</p>' +
    '<div class="actions"><a class="btn" href="' + esc(buyUrl(it)) + '" target="_blank" rel="noopener noreferrer sponsored">구매처 연결 ↗</a><a class="btn ghost" href="' + P + 'brands/' + b.slug + '/">' + esc(it.brand) + ' 전체 보기</a></div></div>\n' +
    '<div class="sheet"><div class="head"><small>Bean Sheet</small>' + esc(it.name) + '</div>' +
    '<div class="row"><span>브랜드</span><span>' + esc(it.brand) + '</span></div>' +
    '<div class="row"><span>형태</span><span>' + esc(it.form) + ' ' + esc(it.size) + '</span></div>' +
    '<div class="row"><span>로스팅</span><span>' + (it.roast > 0 ? esc(it.roastLabel) : '미표기') + '</span></div>' +
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
brands.forEach(b => { if (items.some(it => it.brand === b.name)) write('brands/' + b.slug + '/index.html', brandPage(b)); });
items.forEach(it => write('beans/' + it.slug + '/index.html', beanPage(it)));
write('style.css', CSS);
write('app.js', APPJS);

const urls = ['/'].concat(brands.filter(b => items.some(it => it.brand === b.name)).map(b => '/brands/' + b.slug + '/'), items.map(beanUrl));
write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(u => '  <url><loc>' + esc(site.url + u) + '</loc>' + (UPDATED ? '<lastmod>' + esc(UPDATED) + '</lastmod>' : '') + '</url>').join('\n') + '\n</urlset>\n');
write('robots.txt', 'User-agent: *\nAllow: /\n\nSitemap: ' + site.url + '/sitemap.xml\n');
write('404.html', '<!doctype html>\n<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
  '<title>페이지를 찾을 수 없습니다 | ' + esc(site.name) + '</title><meta name="robots" content="noindex"><link rel="stylesheet" href="' + BASE + '/style.css"></head>' +
  '<body><div class="wrap"><section class="phead"><p class="eyebrow">404</p><h1 class="page-title">페이지를 찾을 수 없습니다</h1>' +
  '<p class="lead">주소가 바뀌었거나 없는 페이지입니다.</p><div class="actions"><a class="btn" href="' + BASE + '/">홈으로</a></div></section></div></body></html>\n');

console.log('빌드 완료: 홈 1, 브랜드 ' + brands.length + ', 원두 ' + items.length + ' 페이지 → dist/');
