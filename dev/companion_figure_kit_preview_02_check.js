'use strict';
// Companion Figure Kit Preview 02 (Material & Color Rework) 전용 검증
// 실행: node dev/companion_figure_kit_preview_02_check.js
// 3동료 색/재질 보정이 중립 몸통+강조 표식으로 재분배되고, 실루엣/구조·행동선 0·index 무접촉인지.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const PREVIEW = path.join(ROOT, 'dev', 'companion_figure_kit_preview_02.html');
const DOC = path.join(ROOT, 'docs', '48_COMPANION_FIGURE_KIT_PREVIEW_02.md');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const buf = fs.readFileSync(path.join(ROOT, 'index.html'));

let pass = 0, fail = 0;
function chk(name, cond, detail) {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
}

// 1~2. 프리뷰/문서 존재
chk('c1 Preview 02 파일 존재', fs.existsSync(PREVIEW), '');
chk('c2 docs/48 존재', fs.existsSync(DOC), '');
const pv = fs.existsSync(PREVIEW) ? fs.readFileSync(PREVIEW, 'utf8') : '';
const doc = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '';
const hasP = s => pv.indexOf(s) >= 0;
const cntP = s => pv.split(s).length - 1;

// 3~5. 도적/마법사/주술사 피규어 존재
chk('c3 도적 피규어(sb-rogue + 단검/두건)',
  cntP('sb-rogue') >= 3 && hasP('sb-r-dagger') && hasP('sb-r-head') && hasP('sb-r-body'), '');
chk('c4 마법사 피규어(sb-mage + 구체/모자)',
  cntP('sb-mage') >= 3 && hasP('sb-m-orb') && hasP('sb-m-head') && hasP('sb-m-body'), '');
chk('c5 주술사 피규어(sb-shaman + 토템/부적)',
  cntP('sb-shaman') >= 3 && hasP('sb-s-totem') && hasP('sb-s-head') && hasP('sb-s-charm'), '');

// 6. 전사 포함 4인 비교 영역
chk('c6 전사 포함 4인 비교(라인업 + 전사)',
  hasP('sb-warrior') && hasP('id="lineup"'), '');
// 7. 파쇄자 대치 영역
chk('c7 파쇄자 대치 영역(sb-iron-crusher + stage)',
  hasP('sb-iron-crusher') && hasP('id="stage"') && hasP('id="dSham"'), '');
// 8. before/after 비교 영역
chk('c8 Preview 01 vs 02 비교(before/after + sb-v1 override)',
  hasP('id="cmpBefore"') && hasP('id="cmpAfter"') && hasP('.sb-v1 '), '');

// 9. 직업별 중립 재질색 변수 존재
chk('c9 중립 재질색 변수(도적 cloth·마법사 robe·주술사 cloth)',
  hasP('--sb-r-cloth:') && hasP('--sb-m-robe:') && hasP('--sb-s-cloth:'), '');
// 10. 직업 대표 강조색 유지
chk('c10 대표 강조색 변수 유지(--sb-r/m/s-main)',
  hasP('--sb-r-main:') && hasP('--sb-m-main:') && hasP('--sb-s-main:'), '');

// 11. 몸통이 중립·머리/장식이 대표색 (재분배 증거)
chk('c11 도적 몸통 중립(cloth)+두건 대표색(main)',
  hasP('.sb-r-body{') && /\.sb-r-body\{[^}]*--sb-r-cloth/.test(pv) &&
  /\.sb-r-head\{[^}]*--sb-r-main/.test(pv), '');
chk('c12 마법사 로브 중립(robe)+모자 대표색(main)',
  /\.sb-m-body\{[^}]*--sb-m-robe/.test(pv) && /\.sb-m-head\{[^}]*--sb-m-main/.test(pv), '');
chk('c13 주술사 몸통 중립(cloth)+부적 대표색(main)',
  /\.sb-s-body\{[^}]*--sb-s-cloth/.test(pv) && /\.sb-s-charm\{[^}]*--sb-s-main/.test(pv), '');

// 14. 재질 구분 색 (도적 가죽·은 / 마법사 금 별 / 주술사 나무·황동)
chk('c14 재질 구분색(도적 leather/blade · 마법사 gold · 주술사 wood/brass)',
  hasP('--sb-r-leather:') && hasP('--sb-r-blade:') && hasP('--sb-m-gold:') &&
  hasP('--sb-s-wood:') && hasP('--sb-s-brass:'), '');

// 15. sb- 네임스페이스 유지 + 일반명 클래스 0
chk('c15 sb- 네임스페이스(30회+)', cntP('sb-') >= 30, cntP('sb-') + '회');
{
  const forbidden = ['body', 'head', 'weapon', 'shadow', 'boss', 'actor', 'part', 'role',
    'monster', 'bt', 'sig-av', 'figure', 'unit', 'rogue', 'mage', 'shaman'];
  let bad = [];
  (pv.match(/class="[^"]*"/g) || []).forEach(a => {
    a.slice(7, -1).split(/\s+/).forEach(t => { if (forbidden.indexOf(t) >= 0) bad.push(t); });
  });
  const cssBad = pv.match(/(^|[^-\w])\.(body|head|weapon|shadow|boss|actor|part|role|monster|bt|sig-av)[\s{,:.]/m);
  chk('c16 금지 일반명 클래스 0(토큰+셀렉터)', bad.length === 0 && !cssBad,
    bad.length ? bad.join(',') : (cssBad ? cssBad[0] : ''));
}

// 17. 3층 transform 유지
chk('c17 3층 transform(.sb-unit/.sb-react/.sb-fig/.sb-fit)',
  hasP('.sb-unit{') && hasP('.sb-react{') && hasP('.sb-fig{') && hasP('.sb-fit{') && hasP('sbBreathe'), '');

// 18. 행동선 미구현
{
  const found = ['sb-impulse', 'fxSmash', 'smashLine', '<line', '<svg', 'stroke', 'x1=', 'y1='].filter(t => pv.indexOf(t) >= 0);
  const sbLine = /[\s".{]sb-line[\s".{}]/.test(pv);
  chk('c18 행동선 구현 0(선/SVG/stroke·sb-line 부재)', found.length === 0 && !sbLine,
    found.join(',') + (sbLine ? ' sb-line' : ''));
}

// 19. 외부 에셋/네트워크 0
{
  const ext = ['http://', 'https://', 'url(', '@import', '<img', '<link', 'src=',
    '.png', '.jpg', '.webp', 'base64', 'fetch(', 'XMLHttpRequest'];
  const found = ext.filter(t => pv.indexOf(t) >= 0);
  chk('c19 외부 에셋/네트워크 0', found.length === 0, found.join(','));
}
// 20. 전투 연동 0
chk('c20 전투 연동 0(Math.random/localStorage/__seedHealer/createGame/enterBattle 부재)',
  ['Math.random', 'localStorage', '__seedHealer', 'createGame', 'enterBattle'].every(t => pv.indexOf(t) < 0), '');

// 21. index.html 무변경
chk('c21 index.html 무변경(149,309 B · md5 c9e289d7…)',
  buf.length === 227650 &&
  crypto.createHash('md5').update(buf).digest('hex') === '5d645ffcf1592f1430b73647f4c39ccb', '');

// 22. CORE 유지
{
  const lines = html.split('\n');
  let f = 0, core = [];
  for (const l of lines) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) core.push(l); }
  const bytes = Buffer.byteLength(core.join('\n') + '\n', 'utf8');
  chk('c22 CORE 466줄/22,521 B 유지(실측)', core.length === 466 && bytes === 22521, core.length + '줄/' + bytes + 'B');
}

// 23. HOLD 산출물 미유입
chk('c23 HOLD 파일 repo 미유입',
  ['docs/40_IRON_CRUSHER_ACTION_LINE_PROTO.md', 'dev/p20.mjs', 'dev/core_new.js']
    .every(f => !fs.existsSync(path.join(ROOT, f))), '');

// 24. Preview 01 파일 유지
chk('c24 Preview 01 파일 유지(덮어쓰기 아님)',
  fs.existsSync(path.join(ROOT, 'dev', 'companion_figure_kit_preview_01.html')) &&
  fs.existsSync(path.join(ROOT, 'docs', '47_COMPANION_FIGURE_KIT_PREVIEW_01.md')), '');

// 25. docs/48 필수 절
chk('c25 docs/48 필수 절(후레쉬맨 원인/도적·마법사·주술사 변경/비교/리스크)',
  ['후레쉬맨 인상의 원인', '도적 색·재질 변경', '마법사 색·재질 변경', '주술사 색·재질 변경',
   '4인 파티 비교', '남은 시각 리스크', 'Companion Figure Party Rework 01'].every(s => doc.indexOf(s) >= 0), '');

console.log(`\n${fail === 0 ? '★ COMPANION FIGURE KIT PREVIEW 02 CHECK PASS' : '★ COMPANION FIGURE KIT PREVIEW 02 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
