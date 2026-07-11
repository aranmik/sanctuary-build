'use strict';
// Companion Figure Kit Preview 01 전용 검증
// 실행: node dev/companion_figure_kit_preview_01_check.js
// 3동료(도적/마법사/주술사) 정장이 sb- 규격을 지키고, 4인 파티 확인·행동선 0·index 무접촉인지.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const PREVIEW = path.join(ROOT, 'dev', 'companion_figure_kit_preview_01.html');
const DOC = path.join(ROOT, 'docs', '47_COMPANION_FIGURE_KIT_PREVIEW_01.md');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const buf = fs.readFileSync(path.join(ROOT, 'index.html'));

let pass = 0, fail = 0;
function chk(name, cond, detail) {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
}

// 1~2. 프리뷰/문서 존재
chk('c1 프리뷰 파일 존재', fs.existsSync(PREVIEW), '');
chk('c2 docs/47 존재', fs.existsSync(DOC), '');
const pv = fs.existsSync(PREVIEW) ? fs.readFileSync(PREVIEW, 'utf8') : '';
const doc = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '';
const hasP = s => pv.indexOf(s) >= 0;
const cntP = s => pv.split(s).length - 1;

// 3. 도적 피규어 (sb-rogue + 단검/두건/얇은 몸)
chk('c3 도적 피규어(sb-rogue + 단검/두건)',
  cntP('sb-rogue') >= 3 && hasP('sb-r-dagger') && hasP('sb-r-head') && hasP('sb-r-body'), '');
// 4. 마법사 피규어 (sb-mage + 구체/모자)
chk('c4 마법사 피규어(sb-mage + 구체/모자)',
  cntP('sb-mage') >= 3 && hasP('sb-m-orb') && hasP('sb-m-head') && hasP('sb-m-body'), '');
// 5. 주술사 피규어 (sb-shaman + 토템/오라)
chk('c5 주술사 피규어(sb-shaman + 토템/부적)',
  cntP('sb-shaman') >= 3 && hasP('sb-s-totem') && hasP('sb-s-head') && hasP('sb-s-charm'), '');

// 6. 전사와 함께 4인 파티 확인 구역 (전사 포함 라인업)
chk('c6 4인 파티 확인 구역(전사 포함 라인업 + 원호 구도)',
  hasP('sb-warrior') && hasP('id="lineup"') && hasP('id="stage"') && hasP('4인 파티'), '');

// 7. 얼굴(점눈+볼터치) 4직업 적용 — 귀여움 핵심
chk('c7 얼굴창 4직업(head::after 점눈 배경)',
  cntP('circle at 32% 42%,#33384a') >= 4, cntP('circle at 32% 42%,#33384a') + '개'); // 전사+도적+마법사+주술사

// 8. sb- 네임스페이스 유지
chk('c8 sb- 클래스 네임스페이스(30회+)', cntP('sb-') >= 30, cntP('sb-') + '회');
chk('c9 --sb- 색 변수(직업별 20개+)', (pv.match(/--sb-[a-z0-9-]+\s*:/g) || []).length >= 20,
  (pv.match(/--sb-[a-z0-9-]+\s*:/g) || []).length + '개');

// 10. 금지 일반명 클래스 미사용
{
  const forbidden = ['body', 'head', 'weapon', 'shadow', 'boss', 'actor', 'part', 'role',
    'monster', 'bt', 'sig-av', 'figure', 'unit', 'rogue', 'mage', 'shaman'];
  let bad = [];
  (pv.match(/class="[^"]*"/g) || []).forEach(a => {
    a.slice(7, -1).split(/\s+/).forEach(t => { if (forbidden.indexOf(t) >= 0) bad.push(t); });
  });
  const cssBad = pv.match(/(^|[^-\w])\.(body|head|weapon|shadow|boss|actor|part|role|monster|bt|sig-av)[\s{,:.]/m);
  chk('c10 금지 일반명 클래스 0(토큰+셀렉터)', bad.length === 0 && !cssBad,
    bad.length ? bad.join(',') : (cssBad ? cssBad[0] : ''));
}

// 11. 3층 transform 구조
chk('c11 3층 transform(.sb-unit/.sb-react/.sb-fig/.sb-fit)',
  hasP('.sb-unit{') && hasP('.sb-react{') && hasP('.sb-fig{') && hasP('.sb-fit{') && hasP('sbBreathe'), '');

// 12. 행동선 미구현 (sb-line은 sb-lineup 부분문자열 제외 위해 경계 검사)
{
  const found = ['sb-impulse', 'fxSmash', 'smashLine', '<line', '<svg', 'stroke', 'x1=', 'y1='].filter(t => pv.indexOf(t) >= 0);
  const sbLine = /[\s".{]sb-line[\s".{}]/.test(pv); // sb-lineup(라인업 UI)는 제외
  chk('c12 행동선 구현 0(선/SVG/stroke·sb-line 부재)', found.length === 0 && !sbLine,
    found.join(',') + (sbLine ? ' sb-line' : ''));
}

// 13. 외부 에셋/네트워크 의존 0
{
  const ext = ['http://', 'https://', 'url(', '@import', '<img', '<link', 'src=',
    '.png', '.jpg', '.webp', 'base64', 'fetch(', 'XMLHttpRequest'];
  const found = ext.filter(t => pv.indexOf(t) >= 0);
  chk('c13 외부 에셋/네트워크 의존 0', found.length === 0, found.join(','));
}

// 14. 전투 연동/난수/저장 없음
chk('c14 전투 연동 0(Math.random/localStorage/__seedHealer/createGame/enterBattle 부재)',
  ['Math.random', 'localStorage', '__seedHealer', 'createGame', 'enterBattle']
    .every(t => pv.indexOf(t) < 0), '');

// 15. index.html 무변경 (runtime 무접촉)
chk('c15 index.html 무변경(135,458 B · md5 b1366130…)',
  buf.length === 135458 &&
  crypto.createHash('md5').update(buf).digest('hex') === 'b13661305ce1c563a328d4e3b6c95f0b', '');

// 16. CORE 유지 (실측)
{
  const lines = html.split('\n');
  let f = 0, core = [];
  for (const l of lines) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) core.push(l); }
  const bytes = Buffer.byteLength(core.join('\n') + '\n', 'utf8');
  chk('c16 CORE 466줄/22,521 B 유지(실측)', core.length === 466 && bytes === 22521, core.length + '줄/' + bytes + 'B');
}

// 17. Preview/Pose Pack/Rework 파일 유지
chk('c17 프리뷰/포즈팩/Rework 문서 유지',
  ['dev/battle_figure_kit_preview_01.html', 'dev/battle_figure_pose_pack_01.html',
   'docs/44_IRON_CRUSHER_FIGURE_REWORK_01.md', 'docs/45_IRON_CRUSHER_FIGURE_REWORK_02.md',
   'docs/46_IRON_CRUSHER_FIGURE_REWORK_03.md'].every(f => fs.existsSync(path.join(ROOT, f))), '');

// 18. HOLD 산출물 미유입
chk('c18 HOLD 파일 repo 미유입',
  ['docs/40_IRON_CRUSHER_ACTION_LINE_PROTO.md', 'dev/p20.mjs', 'dev/core_new.js']
    .every(f => !fs.existsSync(path.join(ROOT, f))), '');

// 19. docs/47 필수 절
chk('c19 docs/47 필수 절(도적/마법사/주술사 조형·4인 파티·리스크·후보)',
  ['도적 조형', '마법사 조형', '주술사 조형', '4인 파티', '남은 시각 리스크',
   'Companion Figure Pose Pack 01', 'a5956b3'].every(s => doc.indexOf(s) >= 0), '');

console.log(`\n${fail === 0 ? '★ COMPANION FIGURE KIT PREVIEW 01 CHECK PASS' : '★ COMPANION FIGURE KIT PREVIEW 01 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
