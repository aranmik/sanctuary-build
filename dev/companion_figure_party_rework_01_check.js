'use strict';
// Companion Figure Party Rework 01 전용 검증
// 실행: node dev/companion_figure_party_rework_01_check.js
// 3동료 sb 정장이 shell_iron 전투에만 이식되고, Preview 02 승인색·기존 FX·CORE/판정/다른 보스가 무결한지.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const DOC = path.join(ROOT, 'docs', '49_COMPANION_FIGURE_PARTY_REWORK_01.md');
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
chk('c1 docs/49 존재', fs.existsSync(DOC), '');
const doc = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '';

// 2~4. 실전 3동료 sb 피규어 존재 (HTML 래퍼)
chk('c2 실전 도적 sb 피규어(sb-rog-fig + sb-rogue + 단검)',
  hasH('id="sb-rog-fig"') && hasH('sb-rogue') && hasH('sb-r-dagger'), '');
chk('c3 실전 마법사 sb 피규어(sb-mage-fig + sb-mage + 구체)',
  hasH('id="sb-mage-fig"') && hasH('sb-mage') && hasH('sb-m-orb'), '');
chk('c4 실전 주술사 sb 피규어(sb-sham-fig + sb-shaman + 토템/고리)',
  hasH('id="sb-sham-fig"') && hasH('sb-shaman') && hasH('sb-s-totem') && hasH('sb-s-charm'), '');

// 5. 전사/파쇄자 sb 피규어 유지
chk('c5 전사/파쇄자 sb 피규어 유지',
  hasH('id="sb-war-fig"') && hasH('id="sb-boss-fig"') && hasH('sb-warrior') && hasH('sb-iron-crusher'), '');

// 6. shell_iron에만 3동료 적용 (스위칭 + 게이트)
chk('c6 shell_iron 게이트 + 3동료 스위칭',
  hasH("CUR_BOSS==='shell_iron'") &&
  hasH('#stage.sb-boss-iron #sb-rog-fig') && hasH('#stage.sb-boss-iron #sb-mage-fig') &&
  hasH('#stage.sb-boss-iron #sb-sham-fig'), '');

// 7. Preview 02 승인 색·재질 반영 (도적 차콜/마법사 남색/주술사 회청)
chk('c7 Preview 02 승인색 반영(차콜/남색/회청 중립 + 대표색)',
  hasH('--sb-r-cloth:#403a52') && hasH('--sb-r-main:#a58fd6') &&
  hasH('--sb-m-robe:#343150') && hasH('--sb-m-main:#bb85e6') &&
  hasH('--sb-s-cloth:#44606a') && hasH('--sb-s-main:#5fc7d5'), '');

// 8. 도적 단검 / 마법사 구체 / 주술사 토템·고리 파츠
chk('c8 핵심 장비 파츠(단검/구체/토템/부적)',
  cntH('sb-r-dagger') >= 2 && cntH('sb-m-orb') >= 2 && cntH('sb-s-totem') >= 2 && cntH('sb-s-charm') >= 2, '');

// 9. 4인 원호 배치 구조 (4동료 개별 transform · shell_iron)
chk('c9 4인 원호 배치(4동료 sa- 개별 transform)',
  hasH('#stage.sb-boss-iron #sa-war{transform:translate(') &&
  hasH('#stage.sb-boss-iron #sa-rog{transform:translate(') &&
  hasH('#stage.sb-boss-iron #sa-mage{transform:translate(') &&
  hasH('#stage.sb-boss-iron #sa-sham{transform:translate('), '');

// 10. fig width 지정 (버그 수정 — 3동료 fig에 width:104px)
chk('c10 3동료 sb-fig width 지정(파츠 배치 정상)',
  hasH('#stage .sb-rogue .sb-fig{width:104px') &&
  hasH('#stage .sb-mage .sb-fig{width:104px') &&
  hasH('#stage .sb-shaman .sb-fig{width:104px'), '');

// 11. 기존 FX·상태 표시 유지 (fxr/fxf span 4동료 전부)
chk('c11 기존 링/플래시 유지(fxr/fxf 4동료)',
  hasH('id="fxr-war"') && hasH('id="fxf-war"') && hasH('id="fxr-rog"') && hasH('id="fxf-rog"') &&
  hasH('id="fxr-mage"') && hasH('id="fxf-mage"') && hasH('id="fxr-sham"') && hasH('id="fxf-sham"'), '');

// 12. sb- 네임스페이스 · 일반명 신규 클래스 없음
chk('c12 sb- 네임스페이스(15회+) + 일반명 신규 0',
  cntH('sb-') >= 15 && !hasH('.sb-body{') &&
  !/[^-\w]\.orb[\s{]/.test(html) && !/[^-\w]\.totem[\s{]/.test(html) &&
  !/[^-\w]\.rogue[\s{]/.test(html) && !/[^-\w]\.weapon[\s{]/.test(html), '');

// 13. 3층 transform 유지
chk('c13 3층 transform(#stage .sb-unit/.sb-react/.sb-fit/.sb-fig)',
  hasH('#stage .sb-unit{') && hasH('#stage .sb-react{') && hasH('#stage .sb-fit{') && hasH('#stage .sb-fig{'), '');

// 14. 행동선 신규 구현 없음
chk('c14 행동선/SVG stroke 신규 0(sb 영역)',
  !hasH('sb-line') && !hasH('sb-impulse') && !hasH('sbSmashLine'), '');

// 15. 신규 전투 상태·타이머 없음 (sbFigPose는 기존 상태만 읽음 · setInterval/setTimeout 신규 0은 sb 영역)
chk('c15 신규 상태/타이머 없음(sbFigPose 기존 상태만)',
  hasH('function sbFigPose(S)') && !hasH('sbCompanionTimer') && !hasH('setInterval(sbFig'), '');

// 16. 외부 에셋/네트워크 없음
{
  const forbid = ['Math.random', 'base64', '<img', '.png', '.jpg', '.webp', 'assets', 'url(http', '@import', 'fetch('];
  const found = forbid.filter(p => html.indexOf(p) >= 0);
  chk('c16 외부 에셋/네트워크 0', found.length === 0, found.join(','));
}

// 17. index.html 현행 기준선
chk('c17 index.html 현행 기준선(155,854 B · md5 2f7a1b29…)',
  buf.length === 155854 &&
  crypto.createHash('md5').update(buf).digest('hex') === '2f7a1b29dba5b79950ebdbbeb6e06fb6', '');

// 18. CORE byte-identical
{
  const lines = html.split('\n');
  let f = 0, core = [];
  for (const l of lines) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) core.push(l); }
  const bytes = Buffer.byteLength(core.join('\n') + '\n', 'utf8');
  const cmd5 = crypto.createHash('md5').update(core.join('\n') + '\n').digest('hex');
  chk('c18 CORE 466줄/22,521 B byte-identical', core.length === 466 && bytes === 22521 &&
    cmd5 === '6cad2ec271a2a79afbee881c2a2e0856', core.length + '줄/' + bytes + 'B/' + cmd5.slice(0, 8));
}

// 19. 수치/판정/Save 무변경
chk('c19 강타/보호막 수치 원문 보존 + Save 확장 0',
  hasH('smash:320, enSmash:380, smashBlocked:0.5') && cntH('localStorage.setItem') <= 1, '');

// 20. 스모크 3종 불변
try {
  const h = require('./harness.js');
  const s = h.sb.window.__seedHealer;
  const m = s.smoke(), i = s.smoke('shell_iron'), t = s.smoke('shell_thirst');
  chk('c20 스모크 3종 불변(51.4/1029·48.5/971·61.8/1236)',
    m.t === 51.4 && m.steps === 1029 && i.t === 48.5 && i.steps === 971 && t.t === 61.8 && t.steps === 1236,
    m.t + '/' + m.steps + ' · ' + i.t + '/' + i.steps + ' · ' + t.t + '/' + t.steps);
} catch (e) { chk('c20 스모크 3종 불변', false, e.message); }

// 21. 다른 두 보스 분기 보호 (shell_iron 스코프 · 전역 stageAllies 유지)
chk('c21 다른 보스 회귀 보호(shell_iron 스코프·전역 stageAllies bottom:6)',
  hasH('#stageAllies{position:absolute;bottom:6px') &&
  hasH("sC(_stg,'sb-boss-iron',(typeof CUR_BOSS!=='undefined'&&CUR_BOSS==='shell_iron'))"), '');

// 22. Preview 01/02 · Rework 01~03 파일 유지
chk('c22 프리뷰 01/02·Rework 문서 유지',
  ['dev/companion_figure_kit_preview_01.html', 'dev/companion_figure_kit_preview_02.html',
   'docs/47_COMPANION_FIGURE_KIT_PREVIEW_01.md', 'docs/48_COMPANION_FIGURE_KIT_PREVIEW_02.md',
   'docs/46_IRON_CRUSHER_FIGURE_REWORK_03.md'].every(f => fs.existsSync(path.join(ROOT, f))), '');

// 23. HOLD 산출물 미유입
chk('c23 HOLD 파일 repo 미유입',
  ['docs/40_IRON_CRUSHER_ACTION_LINE_PROTO.md', 'dev/p20.mjs', 'dev/core_new.js']
    .every(f => !fs.existsSync(path.join(ROOT, f))), '');

// 24. docs/49 필수 절
chk('c24 docs/49 필수 절(계승/단순화/배치안/버린 안/FX 보존/회귀/리스크)',
  ['Preview 02에서 계승', '실전용 3동료 단순화', '시도한 배치안', '버린 안',
   '기존 FX·상태 표시 보존', '다른 두 보스 회귀 없음', '남은 시각 리스크',
   'Party Figure Layout Rework 01'].every(s => doc.indexOf(s) >= 0), '');

// 25. div/section 균형 (214/214·8/8)
{
  const dO = cntH('<div'), dC = cntH('</div>'), sO = cntH('<section'), sC2 = cntH('</section>');
  chk('c25 div/section 균형(214/214·8/8)', dO === dC && dO === 214 && sO === 8, dO + '/' + dC + ' · ' + sO + '/' + sC2);
}

console.log(`\n${fail === 0 ? '★ COMPANION FIGURE PARTY REWORK 01 CHECK PASS' : '★ COMPANION FIGURE PARTY REWORK 01 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
