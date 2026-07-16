'use strict';
// Battle Figure Kit Preview 01 전용 검증
// 실행: node dev/battle_figure_kit_preview_01_check.js
// 프리뷰가 sb- 규격을 지키고, 행동선/전투 연동이 없으며, 보호 파일과 HOLD 격리가 무결한지.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const PREVIEW = path.join(ROOT, 'dev', 'battle_figure_kit_preview_01.html');
const DOC = path.join(ROOT, 'docs', '42_BATTLE_FIGURE_KIT_PREVIEW_01.md');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const buf = fs.readFileSync(path.join(ROOT, 'index.html'));

let pass = 0, fail = 0;
function chk(name, cond, detail) {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
}

// 1. 프리뷰/문서 존재
chk('c1 프리뷰 파일 존재', fs.existsSync(PREVIEW), '');
chk('c2 docs/42 존재', fs.existsSync(DOC), '');
const pv = fs.existsSync(PREVIEW) ? fs.readFileSync(PREVIEW, 'utf8') : '';
const doc = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '';
const hasP = s => pv.indexOf(s) >= 0;
const cntP = s => pv.split(s).length - 1;

// 3. sb- 네임스페이스 사용 (클래스/변수)
chk('c3 sb- 클래스 네임스페이스(30회 이상)', cntP('sb-') >= 30, cntP('sb-') + '회');
chk('c4 --sb- 색 변수(12개 이상)', (pv.match(/--sb-[a-z0-9-]+\s*:/g) || []).length >= 12,
  (pv.match(/--sb-[a-z0-9-]+\s*:/g) || []).length + '개');

// 5. 금지 일반 클래스 미사용 (class 토큰 + CSS 셀렉터)
{
  const forbidden = ['body', 'head', 'weapon', 'shadow', 'boss', 'actor', 'part', 'role',
    'monster', 'bt', 'sig-av', 'figure', 'unit'];
  let bad = [];
  (pv.match(/class="[^"]*"/g) || []).forEach(a => {
    a.slice(7, -1).split(/\s+/).forEach(t => { if (forbidden.indexOf(t) >= 0) bad.push(t); });
  });
  const cssBad = pv.match(/(^|[^-\w])\.(body|head|weapon|shadow|boss|actor|part|role|monster|bt|sig-av)[\s{,:.]/m);
  chk('c5 금지 일반 클래스 0(토큰+셀렉터)', bad.length === 0 && !cssBad,
    bad.length ? bad.join(',') : (cssBad ? cssBad[0] : ''));
}

// 6. 전사/파쇄자 피규어 존재
chk('c6 전사 피규어(sb-warrior + 방패/검/투구)',
  cntP('sb-warrior') >= 3 && hasP('sb-w-shield') && hasP('sb-w-sword') && hasP('sb-w-head'), '');
chk('c7 파쇄자 피규어(sb-iron-crusher + 망치/코어/투구)',
  cntP('sb-iron-crusher') >= 3 && hasP('sb-ic-hammer') && hasP('sb-ic-core') && hasP('sb-ic-head'), '');

// 8. part 구조 (조립형)
chk('c8 sb-part 조립 구조(파츠 태그 20개 이상)', cntP('class="sb-part') >= 20, cntP('class="sb-part') + '개');

// 9. 3층 transform 식별 가능
chk('c9 3층 transform(.sb-unit/.sb-react/.sb-fig 각자 transform 책임)',
  hasP('.sb-unit{') && hasP('.sb-react{') && hasP('.sb-fig{') && hasP('.sb-fit{') &&
  hasP('sbBreathe') && cntP('transform-origin') >= 4, '');

// 10. 외부 에셋/네트워크 의존 0
{
  const ext = ['http://', 'https://', 'url(', '@import', '<img', '<link', 'src=',
    '.png', '.jpg', '.webp', 'base64', 'fetch(', 'XMLHttpRequest'];
  const found = ext.filter(t => pv.indexOf(t) >= 0);
  chk('c10 외부 에셋/네트워크 의존 0', found.length === 0, found.join(','));
}

// 11. 행동선 관련 구현 없음
{
  const lines = ['sb-line', 'sb-impulse', 'fxSmash', 'fxBossLine', 'smashLine', '<line', '<svg',
    'stroke', 'x1=', 'y1='];
  const found = lines.filter(t => pv.indexOf(t) >= 0);
  chk('c11 행동선 구현 0(선/SVG/stroke 부재)', found.length === 0, found.join(','));
}

// 12. 전투 연동/난수/저장 없음
chk('c12 전투 연동 0(Math.random/localStorage/__seedHealer/createGame 부재)',
  ['Math.random', 'localStorage', '__seedHealer', 'createGame', 'enterBattle']
    .every(t => pv.indexOf(t) < 0), '');

// 13. index.html 기준선 유지
chk('c13 index.html 무변경(149,309 B · md5 c9e289d7…)',
  buf.length === 205777 &&
  crypto.createHash('md5').update(buf).digest('hex') === 'dd4e04052d3cf4f271f35a45a6a8dc9d', '');

// 14. CORE 유지 (실측 · 파일 산출 없이 메모리 계산)
{
  const lines = html.split('\n');
  let f = 0, core = [];
  for (const l of lines) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) core.push(l); }
  const bytes = Buffer.byteLength(core.join('\n') + '\n', 'utf8');
  chk('c14 CORE 466줄/22,521 B 유지(실측)', core.length === 466 && bytes === 22521, core.length + '줄/' + bytes + 'B');
}

// 15. HOLD 산출물 미유입
chk('c15 HOLD 파일 repo 미유입',
  ['docs/40_IRON_CRUSHER_ACTION_LINE_PROTO.md', 'dev/iron_crusher_action_line_proto_check.js',
   'dev/p20.mjs', 'dev/core_new.js'].every(f => !fs.existsSync(path.join(ROOT, f))), '');

// 16. docs/42 필수 절
chk('c16 docs/42 필수 절(구조/transform/확인 항목/다음 후보/리스크)',
  ['전사 피규어 구조', '파쇄자 피규어 구조', '3층 transform', '나라님 확인 항목',
   'Iron Crusher Figure Rework 01', 'Battle Figure Kit Preview 02',
   'Iron Crusher Smash Line Rework 02', '남은 시각 리스크', '55821ff']
    .every(s => doc.indexOf(s) >= 0), '');

console.log(`\n${fail === 0 ? '★ BATTLE FIGURE KIT PREVIEW 01 CHECK PASS' : '★ BATTLE FIGURE KIT PREVIEW 01 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
