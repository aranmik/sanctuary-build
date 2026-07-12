'use strict';
// Iron Crusher Figure Rework 03 전용 검증
// 실행: node dev/iron_crusher_figure_rework_03_check.js
// 파티 원호/포위형 배치 + 추가 확대가 CSS 값만 바꾸고, shell_iron 스코프·CORE/판정/다른 보스 무결한지.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const DOC = path.join(ROOT, 'docs', '46_IRON_CRUSHER_FIGURE_REWORK_03.md');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const buf = fs.readFileSync(path.join(ROOT, 'index.html'));

let pass = 0, fail = 0;
function chk(name, cond, detail) {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
}
const hasH = s => html.indexOf(s) >= 0;
const cntH = s => html.split(s).length - 1;

// 1. 문서 존재
chk('c1 docs/46 존재', fs.existsSync(DOC), '');
const doc = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '';

// 2. 강철의 파쇄자 분기 유지
chk('c2 shell_iron 게이트 유지',
  hasH("CUR_BOSS==='shell_iron'") && hasH('#stage.sb-boss-iron #sb-boss-fig{display:block}'), '');

// 3. 전사/파쇄자 sb 피규어 존재
chk('c3 전사/파쇄자 sb 피규어',
  hasH('id="sb-war-fig"') && hasH('id="sb-boss-fig"') && hasH('sb-warrior') && hasH('sb-iron-crusher'), '');

// 4. 확대값 존재 (Rework 03 도입 · 정확 값은 이후 Party Rework 01[docs/49]에서 갱신)
chk('c4 확대 적용(파쇄자/전사 scale 존재)',
  hasH('#sb-boss-fig{left:50%;top:2px;transform:translateX(-50%) scale(') &&
  hasH('#sb-war-fig{left:50%;bottom:-3px;transform:translateX(-50%) scale('), '');

// 5. 원호/포위형 배치 — 4동료 개별 transform (shell_iron 스코프)
chk('c5 원호 배치(4동료 개별 transform · shell_iron 스코프)',
  hasH('#stage.sb-boss-iron #sa-war{transform:translate(') &&
  hasH('#stage.sb-boss-iron #sa-rog{transform:translate(') &&
  hasH('#stage.sb-boss-iron #sa-mage{transform:translate(') &&
  hasH('#stage.sb-boss-iron #sa-sham{transform:translate('), '');

// 6. 파티 줄 위치 조정 (shell_iron 스코프)
chk('c6 파티 줄 위치 조정(#stage.sb-boss-iron #stageAllies bottom)',
  hasH('#stage.sb-boss-iron #stageAllies{bottom:'), '');

// 7. sb- 네임스페이스 유지
chk('c7 sb- 네임스페이스(15회+)', cntH('sb-') >= 15, cntH('sb-') + '회');

// 8. 일반명 신규 클래스 미사용
chk('c8 금지 일반명 신규 클래스 0',
  !hasH('.sb-body{') && !/[^-\w]\.weapon[\s{]/.test(html) && !/[^-\w]\.actor[\s{]/.test(html), '');

// 9. 3층 transform 구조 유지
chk('c9 3층 transform(#stage .sb-unit/.sb-react/.sb-fit/.sb-fig)',
  hasH('#stage .sb-unit{') && hasH('#stage .sb-react{') && hasH('#stage .sb-fit{') && hasH('#stage .sb-fig{'), '');

// 10. 행동선 미구현
chk('c10 행동선/SVG stroke 신규 0(sb 영역)',
  !hasH('sb-line') && !hasH('sb-impulse') && !hasH('sbSmashLine'), '');

// 11. 외부 에셋/네트워크 없음
{
  const forbid = ['Math.random', 'base64', '<img', '.png', '.jpg', '.webp', 'assets', 'url(http', '@import', 'fetch('];
  const found = forbid.filter(p => html.indexOf(p) >= 0);
  chk('c11 외부 에셋/네트워크 0', found.length === 0, found.join(','));
}

// 12. index.html 현행 기준선
chk('c12 index.html 현행 기준선(149,309 B · md5 c9e289d7…)',
  buf.length === 149440 &&
  crypto.createHash('md5').update(buf).digest('hex') === 'bb7fc1476dc5cbcd12642c9e13dad0ca', '');

// 13. CORE byte-identical
{
  const lines = html.split('\n');
  let f = 0, core = [];
  for (const l of lines) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) core.push(l); }
  const bytes = Buffer.byteLength(core.join('\n') + '\n', 'utf8');
  const cmd5 = crypto.createHash('md5').update(core.join('\n') + '\n').digest('hex');
  chk('c13 CORE 466줄/22,521 B byte-identical', core.length === 466 && bytes === 22521 &&
    cmd5 === '6cad2ec271a2a79afbee881c2a2e0856', core.length + '줄/' + bytes + 'B/' + cmd5.slice(0, 8));
}

// 14. 수치/판정/Save 무변경
chk('c14 강타/보호막 수치 원문 보존 + Save 확장 0',
  hasH('smash:320, enSmash:380, smashBlocked:0.5') && cntH('localStorage.setItem') <= 1, '');

// 15. 스모크 3종 불변
try {
  const h = require('./harness.js');
  const s = h.sb.window.__seedHealer;
  const m = s.smoke(), i = s.smoke('shell_iron'), t = s.smoke('shell_thirst');
  chk('c15 스모크 3종 불변(51.4/1029·48.5/971·61.8/1236)',
    m.t === 51.4 && m.steps === 1029 && i.t === 48.5 && i.steps === 971 && t.t === 61.8 && t.steps === 1236,
    m.t + '/' + m.steps + ' · ' + i.t + '/' + i.steps + ' · ' + t.t + '/' + t.steps);
} catch (e) { chk('c15 스모크 3종 불변', false, e.message); }

// 16. 다른 보스 회귀 보호 (원호 배치가 shell_iron 스코프 — 전역 stageAllies 미변경)
chk('c16 배치 shell_iron 스코프(전역 stageAllies bottom:6px 유지)',
  hasH('#stageAllies{position:absolute;bottom:6px') &&
  hasH("sC(_stg,'sb-boss-iron',(typeof CUR_BOSS!=='undefined'&&CUR_BOSS==='shell_iron'))"), '');

// 17. Preview/Pose Pack/Rework 01·02 파일 유지
chk('c17 프리뷰/포즈팩/Rework01·02 문서 유지',
  ['dev/battle_figure_kit_preview_01.html', 'dev/battle_figure_pose_pack_01.html',
   'docs/44_IRON_CRUSHER_FIGURE_REWORK_01.md', 'docs/45_IRON_CRUSHER_FIGURE_REWORK_02.md']
    .every(f => fs.existsSync(path.join(ROOT, f))), '');

// 18. HOLD 산출물 미유입
chk('c18 HOLD 파일 repo 미유입',
  ['docs/40_IRON_CRUSHER_ACTION_LINE_PROTO.md', 'dev/p20.mjs', 'dev/core_new.js']
    .every(f => !fs.existsSync(path.join(ROOT, f))), '');

// 19. docs/46 필수 절
chk('c19 docs/46 필수 절(시도안/버린 안/원호 구도/회귀/리스크)',
  ['Rework 02 대비 핵심 변화', '시도한 배치', '버린 안', '원호', '포위',
   '다른 보스', '남은 리스크', 'Companion Figure Kit Preview 01'].every(s => doc.indexOf(s) >= 0), '');

// 20. div/section 균형
{
  const dO = cntH('<div'), dC = cntH('</div>'), sO = cntH('<section'), sC2 = cntH('</section>');
  chk('c20 div/section 균형(214/214·8/8)', dO === dC && dO === 214 && sO === 8, dO + '/' + dC + ' · ' + sO + '/' + sC2);
}

console.log(`\n${fail === 0 ? '★ IRON CRUSHER FIGURE REWORK 03 CHECK PASS' : '★ IRON CRUSHER FIGURE REWORK 03 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
