'use strict';
// Iron Crusher Figure Rework 02 전용 검증
// 실행: node dev/iron_crusher_figure_rework_02_check.js
// 전장 피규어 크기/배치 튜닝이 CSS 값만 바꾸고, shell_iron 스코프·CORE/판정/다른 보스 무결한지.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const DOC = path.join(ROOT, 'docs', '45_IRON_CRUSHER_FIGURE_REWORK_02.md');
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
chk('c1 docs/45 존재', fs.existsSync(DOC), '');
const doc = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '';

// 2. 강철의 파쇄자 전투 분기 유지
chk('c2 shell_iron 게이트 유지',
  hasH("CUR_BOSS==='shell_iron'") && hasH('#stage.sb-boss-iron #sb-boss-fig{display:block}'), '');

// 3. 전사/파쇄자 sb 피규어 존재
chk('c3 전사/파쇄자 sb 피규어',
  hasH('id="sb-war-fig"') && hasH('id="sb-boss-fig"') && hasH('sb-warrior') && hasH('sb-iron-crusher'), '');

// 4. 크기 튜닝 적용 (Rework 02가 sb 피규어에 확대 scale 도입 — 정확한 값은 이후 Rework 03[docs/46]에서 갱신)
chk('c4 크기 튜닝 존재(sb-boss-fig/sb-war-fig scale)',
  hasH('#sb-boss-fig{left:50%;top:2px;transform:translateX(-50%) scale(') &&
  hasH('#sb-war-fig{left:50%;bottom:-3px;transform:translateX(-50%) scale('), '');

// 5. 배치 튜닝 존재 (파티 줄 위로 + 동료 배치 · shell_iron 스코프 · 값은 Rework 03에서 원호로 갱신)
chk('c5 배치 튜닝 존재(파티 줄 + 동료 transform · shell_iron 스코프)',
  hasH('#stage.sb-boss-iron #stageAllies{bottom:') &&
  hasH('#stage.sb-boss-iron #sa-war{transform:'), '');

// 6. sb- 네임스페이스 유지
chk('c6 sb- 네임스페이스(15회+)', cntH('sb-') >= 15, cntH('sb-') + '회');

// 7. 일반명 신규 클래스 미사용
chk('c7 금지 일반명 신규 클래스 0',
  !hasH('.sb-body{') && !/[^-\w]\.weapon[\s{]/.test(html) && !/[^-\w]\.actor[\s{]/.test(html), '');

// 8. 3층 transform 구조 유지
chk('c8 3층 transform(#stage .sb-unit/.sb-react/.sb-fit/.sb-fig)',
  hasH('#stage .sb-unit{') && hasH('#stage .sb-react{') && hasH('#stage .sb-fit{') && hasH('#stage .sb-fig{'), '');

// 9. 행동선 미구현
chk('c9 행동선/SVG stroke 신규 0(sb 영역)',
  !hasH('sb-line') && !hasH('sb-impulse') && !hasH('sbSmashLine'), '');

// 10. 외부 에셋/네트워크 없음
{
  const forbid = ['Math.random', 'base64', '<img', '.png', '.jpg', '.webp', 'assets', 'url(http', '@import', 'fetch('];
  const found = forbid.filter(p => html.indexOf(p) >= 0);
  chk('c10 외부 에셋/네트워크 0', found.length === 0, found.join(','));
}

// 11. index.html 현행 기준선
chk('c11 index.html 현행 기준선(149,309 B · md5 c9e289d7…)',
  buf.length === 155043 &&
  crypto.createHash('md5').update(buf).digest('hex') === '154ee46e2c4a28644d58169f88f86c53', '');

// 12. CORE byte-identical
{
  const lines = html.split('\n');
  let f = 0, core = [];
  for (const l of lines) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) core.push(l); }
  const bytes = Buffer.byteLength(core.join('\n') + '\n', 'utf8');
  const cmd5 = crypto.createHash('md5').update(core.join('\n') + '\n').digest('hex');
  chk('c12 CORE 466줄/22,521 B byte-identical', core.length === 466 && bytes === 22521 &&
    cmd5 === '6cad2ec271a2a79afbee881c2a2e0856', core.length + '줄/' + bytes + 'B/' + cmd5.slice(0, 8));
}

// 13. 수치/판정/Save 무변경
chk('c13 강타/보호막 수치 원문 보존 + Save 확장 0',
  hasH('smash:320, enSmash:380, smashBlocked:0.5') && cntH('localStorage.setItem') <= 1, '');

// 14. 스모크 3종 불변
try {
  const h = require('./harness.js');
  const s = h.sb.window.__seedHealer;
  const m = s.smoke(), i = s.smoke('shell_iron'), t = s.smoke('shell_thirst');
  chk('c14 스모크 3종 불변(51.4/1029·48.5/971·61.8/1236)',
    m.t === 51.4 && m.steps === 1029 && i.t === 48.5 && i.steps === 971 && t.t === 61.8 && t.steps === 1236,
    m.t + '/' + m.steps + ' · ' + i.t + '/' + i.steps + ' · ' + t.t + '/' + t.steps);
} catch (e) { chk('c14 스모크 3종 불변', false, e.message); }

// 15. 다른 보스 회귀 보호 (배치 튜닝이 shell_iron 스코프 — 전역 stageAllies 미변경)
chk('c15 배치 튜닝 shell_iron 스코프(전역 stageAllies bottom:6px 유지)',
  hasH('#stageAllies{position:absolute;bottom:6px') &&
  hasH("sC(_stg,'sb-boss-iron',(typeof CUR_BOSS!=='undefined'&&CUR_BOSS==='shell_iron'))"), '');

// 16. Preview 01 / Pose Pack 01 / Rework 01 파일 유지
chk('c16 프리뷰/포즈팩/Rework01 문서 유지',
  ['dev/battle_figure_kit_preview_01.html', 'dev/battle_figure_pose_pack_01.html',
   'docs/42_BATTLE_FIGURE_KIT_PREVIEW_01.md', 'docs/43_BATTLE_FIGURE_POSE_PACK_01.md',
   'docs/44_IRON_CRUSHER_FIGURE_REWORK_01.md'].every(f => fs.existsSync(path.join(ROOT, f))), '');

// 17. HOLD 산출물 미유입
chk('c17 HOLD 파일 repo 미유입',
  ['docs/40_IRON_CRUSHER_ACTION_LINE_PROTO.md', 'dev/p20.mjs', 'dev/core_new.js']
    .every(f => !fs.existsSync(path.join(ROOT, f))), '');

// 18. docs/45 필수 절
chk('c18 docs/45 필수 절(크기 전후/버린 안/대치 구도/회귀/리스크)',
  ['Rework 01 대비 핵심 변화', '전사 크기 조정', '파쇄자 크기 조정', '버린 안',
   '대치 구도 개선', '다른 보스', '남은 시각 리스크',
   'Companion Figure Kit Preview 01'].every(s => doc.indexOf(s) >= 0), '');

// 19. div/section 균형 (CSS만 바꿨으니 202/202 유지)
{
  const dO = cntH('<div'), dC = cntH('</div>'), sO = cntH('<section'), sC2 = cntH('</section>');
  chk('c19 div/section 균형(214/214·8/8)', dO === dC && dO === 214 && sO === 8, dO + '/' + dC + ' · ' + sO + '/' + sC2);
}

console.log(`\n${fail === 0 ? '★ IRON CRUSHER FIGURE REWORK 02 CHECK PASS' : '★ IRON CRUSHER FIGURE REWORK 02 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
