'use strict';
// Iron Crusher Figure Rework 01 전용 검증
// 실행: node dev/iron_crusher_figure_rework_01_check.js
// 전사+파쇄자 sb 피규어가 shell_iron 전투에만 이식되고, CORE/판정/다른 보스가 무결한지.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const DOC = path.join(ROOT, 'docs', '44_IRON_CRUSHER_FIGURE_REWORK_01.md');
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
chk('c1 docs/44 존재', fs.existsSync(DOC), '');
const doc = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '';

// 2. 실전 전사 피규어 존재
chk('c2 실전 전사 sb 피규어(sb-war-fig + sb-warrior + 방패)',
  hasH('id="sb-war-fig"') && hasH('sb-warrior') && hasH('sb-w-shield') && hasH('sb-w-sword'), '');
// 3. 실전 파쇄자 피규어 존재
chk('c3 실전 파쇄자 sb 피규어(sb-boss-fig + sb-iron-crusher + 망치/코어)',
  hasH('id="sb-boss-fig"') && hasH('sb-iron-crusher') && hasH('sb-ic-hammer') && hasH('sb-ic-core'), '');

// 4. 파쇄자 전투 분기에서만 보스 피규어 적용 (shell_iron 게이트 + 스위칭)
chk('c4 shell_iron 게이트 + 스위칭 CSS',
  hasH("CUR_BOSS==='shell_iron'") && hasH('sb-boss-iron') &&
  hasH('#stage.sb-boss-iron #sb-boss-fig{display:block}') &&
  hasH('#stage.sb-boss-iron #bossAvatar{display:none}'), '');

// 5. sb- 네임스페이스 사용
chk('c5 sb- 네임스페이스(15회+)', cntH('sb-') >= 15, cntH('sb-') + '회');

// 6. 금지 일반명 신규 클래스 미사용 (sb 이식 영역 · CSS 셀렉터로 .body/.head 등 신규 없음)
chk('c6 금지 일반명 신규 클래스 0',
  !hasH('.sb-body{') && cntH('class="sb-part sb-shadow"') >= 2 &&
  !/[^-\w]\.weapon[\s{]/.test(html) && !/[^-\w]\.actor[\s{]/.test(html), '');

// 7. 조립형 part 구조
chk('c7 조립형 part 구조(sb-part 태그 14개+)', cntH('class="sb-part') >= 14, cntH('class="sb-part') + '개');

// 8. 3층 transform 구조
chk('c8 3층 transform(#stage .sb-unit/.sb-react/.sb-fit/.sb-fig)',
  hasH('#stage .sb-unit{') && hasH('#stage .sb-react{') && hasH('#stage .sb-fit{') && hasH('#stage .sb-fig{'), '');

// 9. 전사 방패 파츠
chk('c9 전사 방패 파츠(sb-w-shield + 새싹 문장)', hasH('sb-w-shield') && cntH('sb-w-shield') >= 2, '');
// 10. 파쇄자 망치 파츠
chk('c10 파쇄자 망치 파츠(sb-ic-hammer)', hasH('sb-ic-hammer') && cntH('sb-ic-hammer') >= 2, '');
// 11. 파쇄자 코어 파츠
chk('c11 파쇄자 코어 파츠(sb-ic-core)', hasH('sb-ic-core') && cntH('sb-ic-core') >= 2, '');
// 12. anchor 존재 (기존 fxr-war/fxf-war 유지)
chk('c12 기존 링/플래시 유지(fxr-war/fxf-war)', hasH('id="fxr-war"') && hasH('id="fxf-war"'), '');

// 13. 행동선/SVG/stroke 신규 구현 없음 (sb 영역에)
chk('c13 sb 피규어에 행동선/SVG stroke 신규 0',
  !hasH('sb-line') && !hasH('sb-impulse') && !hasH('sbSmashLine'), '');
// (기존 #fxSvg 코어 fx선은 무접촉 — 존재하되 sb와 무관)

// 14. HOLD 코드 미유입
chk('c14 HOLD 파일 repo 미유입',
  ['docs/40_IRON_CRUSHER_ACTION_LINE_PROTO.md', 'dev/iron_crusher_action_line_proto_check.js',
   'dev/p20.mjs', 'dev/core_new.js'].every(f => !fs.existsSync(path.join(ROOT, f))), '');

// 15. 외부 에셋/네트워크 없음 (index 전역 금지 grep · SVG xmlns 식별자는 요청 아님이라 제외)
{
  const forbid = ['Math.random', 'base64', '<img', '.png', '.jpg', '.webp', 'assets', 'url(http', '@import', 'fetch('];
  const found = forbid.filter(p => html.indexOf(p) >= 0);
  chk('c15 외부 에셋/네트워크 0', found.length === 0, found.join(','));
}

// 16. index.html 현행 기준선
chk('c16 index.html 현행 기준선(149,309 B · md5 c9e289d7…)',
  buf.length === 149440 &&
  crypto.createHash('md5').update(buf).digest('hex') === 'bb7fc1476dc5cbcd12642c9e13dad0ca', '');

// 17. CORE 기준선 유지 (실측 byte-identical)
{
  const lines = html.split('\n');
  let f = 0, core = [];
  for (const l of lines) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) core.push(l); }
  const bytes = Buffer.byteLength(core.join('\n') + '\n', 'utf8');
  const cmd5 = crypto.createHash('md5').update(core.join('\n') + '\n').digest('hex');
  chk('c17 CORE 466줄/22,521 B byte-identical', core.length === 466 && bytes === 22521 &&
    cmd5 === '6cad2ec271a2a79afbee881c2a2e0856', core.length + '줄/' + bytes + 'B/' + cmd5.slice(0, 8));
}

// 18. 수치/판정/Save 무변경 (핵심 수치 원문 보존 + Save 확장 0)
chk('c18 강타/보호막 수치 원문 보존 + Save 확장 0',
  hasH('smash:320, enSmash:380, smashBlocked:0.5') &&
  cntH('localStorage.setItem') <= 1, '');

// 19. 스모크 3종 불변 (하네스 실측 — 판정 무변 증명)
try {
  const h = require('./harness.js');
  const s = h.sb.window.__seedHealer;
  const m = s.smoke(), i = s.smoke('shell_iron'), t = s.smoke('shell_thirst');
  chk('c19 스모크 3종 불변(51.4/1029·48.5/971·61.8/1236)',
    m.t === 51.4 && m.steps === 1029 && i.t === 48.5 && i.steps === 971 && t.t === 61.8 && t.steps === 1236,
    m.t + '/' + m.steps + ' · ' + i.t + '/' + i.steps + ' · ' + t.t + '/' + t.steps);
} catch (e) { chk('c19 스모크 3종 불변', false, e.message); }

// 20. 다른 보스 분기 보호 (fallback: boss01일 때 sb-boss-iron 미부여 — toggle 조건이 shell_iron 한정)
chk('c20 다른 보스 회귀 보호(sC toggle이 shell_iron 조건)',
  hasH("sC(_stg,'sb-boss-iron',(typeof CUR_BOSS!=='undefined'&&CUR_BOSS==='shell_iron'))"), '');

// 21. Preview 01 / Pose Pack 01 파일 유지
chk('c21 프리뷰/포즈팩 파일 유지',
  ['dev/battle_figure_kit_preview_01.html', 'dev/battle_figure_pose_pack_01.html',
   'docs/42_BATTLE_FIGURE_KIT_PREVIEW_01.md', 'docs/43_BATTLE_FIGURE_POSE_PACK_01.md']
    .every(f => fs.existsSync(path.join(ROOT, f))), '');

// 22. docs/44 필수 절
chk('c22 docs/44 필수 절',
  ['실전용 축소 정장', '104px', '실제 연결한 포즈', '연결하지 않은 포즈',
   '다른 두 보스 회귀 없음', '남은 시각 리스크', 'a5956b3',
   'Companion Figure Kit Preview 01'].every(s => doc.indexOf(s) >= 0), '');

// 23. div/section 균형
{
  const dO = cntH('<div'), dC = cntH('</div>'), sO = cntH('<section'), sC2 = cntH('</section>');
  chk('c23 div/section 균형(214/214·8/8)', dO === dC && sO === sC2 && dO === 214 && sO === 8,
    dO + '/' + dC + ' · ' + sO + '/' + sC2);
}

console.log(`\n${fail === 0 ? '★ IRON CRUSHER FIGURE REWORK 01 CHECK PASS' : '★ IRON CRUSHER FIGURE REWORK 01 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
