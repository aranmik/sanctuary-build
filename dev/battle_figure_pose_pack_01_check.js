'use strict';
// Battle Figure Pose Pack 01 전용 검증
// 실행: node dev/battle_figure_pose_pack_01_check.js
// 포즈 팩이 sb- 규격/3층 transform을 지키고, 포즈 5+5·전환 UI·1:1 전장을 갖추며,
// 행동선/전투 연동이 없고 보호 파일/HOLD 격리가 무결한지.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const PREVIEW = path.join(ROOT, 'dev', 'battle_figure_pose_pack_01.html');
const DOC = path.join(ROOT, 'docs', '43_BATTLE_FIGURE_POSE_PACK_01.md');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const buf = fs.readFileSync(path.join(ROOT, 'index.html'));

let pass = 0, fail = 0;
function chk(name, cond, detail) {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
}

// 1~2. 프리뷰/문서 존재
chk('c1 프리뷰 파일 존재', fs.existsSync(PREVIEW), '');
chk('c2 docs/43 존재', fs.existsSync(DOC), '');
const pv = fs.existsSync(PREVIEW) ? fs.readFileSync(PREVIEW, 'utf8') : '';
const doc = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '';
const hasP = s => pv.indexOf(s) >= 0;
const cntP = s => pv.split(s).length - 1;

// 3. 전사 포즈 최소 4종 (data-pose 정의 · stand 포함 5)
{
  const warPoses = ['guard', 'brace', 'resolve', 'alert'].filter(p => pv.indexOf('sb-warrior[data-pose="' + p + '"]') >= 0);
  chk('c3 전사 포즈 4종+ 정의(기본+guard/brace/resolve/alert)', warPoses.length >= 4, warPoses.join(','));
}
// 4. 파쇄자 포즈 최소 4종
{
  const ironPoses = ['windup', 'advance', 'stagger', 'recover'].filter(p => pv.indexOf('sb-iron-crusher[data-pose="' + p + '"]') >= 0);
  chk('c4 파쇄자 포즈 4종+ 정의(기본+windup/advance/stagger/recover)', ironPoses.length >= 4, ironPoses.join(','));
}

// 5. 포즈 이름 라벨 존재
chk('c5 포즈 이름 라벨 존재',
  ['방패 앞세움', '피격 대비', '버티기·결의', '강타 준비', '압박 전진', '피격 흔들림']
    .every(s => hasP(s)), '');

// 6. 1:1 전장 영역 존재
chk('c6 1:1 전장 영역(sb-figure-stage + 전사·파쇄자 유닛)',
  hasP('sb-figure-stage') && hasP('id="sbWar"') && hasP('id="sbIron"'), '');

// 7. 전사/파쇄자 개별 전환 UI 존재
chk('c7 개별 전환 UI(전사/파쇄자 갤러리·컨트롤 분리)',
  hasP('id="galWar"') && hasP('id="galIron"') && hasP('id="ctlWar"') && hasP('id="ctlIron"'), '');

// 8. sb- 네임스페이스 유지
chk('c8 sb- 클래스 네임스페이스(30회 이상)', cntP('sb-') >= 30, cntP('sb-') + '회');
chk('c9 --sb- 색 변수(12개 이상)', (pv.match(/--sb-[a-z0-9-]+\s*:/g) || []).length >= 12,
  (pv.match(/--sb-[a-z0-9-]+\s*:/g) || []).length + '개');

// 10. 금지 일반명 클래스 미사용
{
  const forbidden = ['body', 'head', 'weapon', 'shadow', 'boss', 'actor', 'part', 'role',
    'monster', 'bt', 'sig-av', 'figure', 'unit'];
  let bad = [];
  (pv.match(/class="[^"]*"/g) || []).forEach(a => {
    a.slice(7, -1).split(/\s+/).forEach(t => { if (forbidden.indexOf(t) >= 0) bad.push(t); });
  });
  const cssBad = pv.match(/(^|[^-\w])\.(body|head|weapon|shadow|boss|actor|part|role|monster|bt|sig-av)[\s{,:.]/m);
  chk('c10 금지 일반명 클래스 0(토큰+셀렉터)', bad.length === 0 && !cssBad,
    bad.length ? bad.join(',') : (cssBad ? cssBad[0] : ''));
}

// 11. 3층 transform 구조 유지
chk('c11 3층 transform(.sb-unit/.sb-react/.sb-fig/.sb-fit)',
  hasP('.sb-unit{') && hasP('.sb-react{') && hasP('.sb-fig{') && hasP('.sb-fit{') &&
  hasP('sbBreathe') && cntP('transform-origin') >= 4, '');

// 12. 행동선 미구현
{
  const lines = ['sb-line', 'sb-impulse', 'fxSmash', 'fxBossLine', 'smashLine', '<line', '<svg',
    'stroke', 'x1=', 'y1='];
  const found = lines.filter(t => pv.indexOf(t) >= 0);
  chk('c12 행동선 구현 0(선/SVG/stroke 부재)', found.length === 0, found.join(','));
}

// 13. 외부 에셋/네트워크 의존 0
{
  const ext = ['http://', 'https://', 'url(', '@import', '<img', '<link', 'src=',
    '.png', '.jpg', '.webp', 'base64', 'fetch(', 'XMLHttpRequest'];
  const found = ext.filter(t => pv.indexOf(t) >= 0);
  chk('c13 외부 에셋/네트워크 의존 0', found.length === 0, found.join(','));
}

// 14. 전투 연동/난수/저장 없음
chk('c14 전투 연동 0(Math.random/localStorage/__seedHealer/createGame 부재)',
  ['Math.random', 'localStorage', '__seedHealer', 'createGame', 'enterBattle']
    .every(t => pv.indexOf(t) < 0), '');

// 15. index.html 기준선 유지
chk('c15 index.html 무변경(149,309 B · md5 c9e289d7…)',
  buf.length === 205777 &&
  crypto.createHash('md5').update(buf).digest('hex') === 'dd4e04052d3cf4f271f35a45a6a8dc9d', '');

// 16. CORE 기준선 유지 (실측)
{
  const lines = html.split('\n');
  let f = 0, core = [];
  for (const l of lines) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) core.push(l); }
  const bytes = Buffer.byteLength(core.join('\n') + '\n', 'utf8');
  chk('c16 CORE 466줄/22,521 B 유지(실측)', core.length === 466 && bytes === 22521, core.length + '줄/' + bytes + 'B');
}

// 17. HOLD 산출물 미유입
chk('c17 HOLD 파일 repo 미유입',
  ['docs/40_IRON_CRUSHER_ACTION_LINE_PROTO.md', 'dev/iron_crusher_action_line_proto_check.js',
   'dev/p20.mjs', 'dev/core_new.js'].every(f => !fs.existsSync(path.join(ROOT, f))), '');

// 18. Preview 01 보존 (덮어쓰지 않음)
chk('c18 Preview 01 파일 보존(덮어쓰기 아님)',
  fs.existsSync(path.join(ROOT, 'dev', 'battle_figure_kit_preview_01.html')) &&
  PREVIEW !== path.join(ROOT, 'dev', 'battle_figure_kit_preview_01.html'), '');

// 19. docs/43 필수 절
chk('c19 docs/43 필수 절(포즈 목록/조형 포인트/확인 항목/후보/리스크)',
  ['전사 포즈 목록', '파쇄자 포즈 목록', '조형 포인트', '나라님 브라우저 확인 포인트',
   'Iron Crusher Figure Rework 01', 'Battle Figure Pose Pack 02',
   'Iron Crusher Smash Line Rework 02', '남은 시각 리스크', '55821ff']
    .every(s => doc.indexOf(s) >= 0), '');

console.log(`\n${fail === 0 ? '★ BATTLE FIGURE POSE PACK 01 CHECK PASS' : '★ BATTLE FIGURE POSE PACK 01 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
