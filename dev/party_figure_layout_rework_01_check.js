'use strict';
// Party Figure Layout Rework 01 전용 검증 (안 B: 과감한 포위 확대)
// 실행: node dev/party_figure_layout_rework_01_check.js
// 4인 파티가 shell_iron 전투에서만 더 크게·더 벌어져·파쇄자를 포위하도록 재배치됐고,
// CORE/판정/Save/다른 보스/FX/네임스페이스가 무결한지.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const DOC = path.join(ROOT, 'docs', '50_PARTY_FIGURE_LAYOUT_REWORK_01.md');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const buf = fs.readFileSync(path.join(ROOT, 'index.html'));

let pass = 0, fail = 0;
function chk(name, cond, detail) {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
}
const hasH = s => html.indexOf(s) >= 0;
const cntH = s => html.split(s).length - 1;
// #sb-*-fig scale 추출
function figScale(id) {
  const re = new RegExp('#' + id + '\\{[^}]*scale\\(([0-9.]+)\\)');
  const m = html.match(re); return m ? parseFloat(m[1]) : null;
}
// #stage.sb-boss-iron #sa-* translate(x,y) 추출
function saT(id) {
  const re = new RegExp('#stage\\.sb-boss-iron #' + id + '\\{transform:translate\\((-?[0-9.]+)px,(-?[0-9.]+)px\\)');
  const m = html.match(re); return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : null;
}

// 1. 문서 존재
chk('c1 docs/50 존재', fs.existsSync(DOC), '');
const doc = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '';

// 2. 신규 체크 존재 (self)
chk('c2 신규 체크 파일 존재', fs.existsSync(path.join(ROOT, 'dev', 'party_figure_layout_rework_01_check.js')), '');

// 3. 5 sb 피규어 존재
chk('c3 전사/도적/마법사/주술사/파쇄자 sb 피규어 존재',
  hasH('id="sb-war-fig"') && hasH('id="sb-rog-fig"') && hasH('id="sb-mage-fig"') &&
  hasH('id="sb-sham-fig"') && hasH('id="sb-boss-fig"'), '');

// 4. 4인 배치가 shell_iron 스코프에만
chk('c4 4인 배치 shell_iron 스코프 한정',
  hasH('#stage.sb-boss-iron #sa-war{transform:translate(') &&
  hasH('#stage.sb-boss-iron #sa-rog{transform:translate(') &&
  hasH('#stage.sb-boss-iron #sa-mage{transform:translate(') &&
  hasH('#stage.sb-boss-iron #sa-sham{transform:translate(') &&
  hasH("CUR_BOSS==='shell_iron'"), '');

// 5. 4인 각자 개별 transform 구조
const tw = saT('sa-war'), tr = saT('sa-rog'), tm = saT('sa-mage'), ts = saT('sa-sham');
chk('c5 4인 개별 transform 파싱',
  tw && tr && tm && ts,
  tw ? `war(${tw.x},${tw.y}) rog(${tr.x},${tr.y}) mage(${tm.x},${tm.y}) sham(${ts.x},${ts.y})` : 'parse fail');

// 6. Party Rework 01 대비 레이아웃 값이 실제로 조정됨 (gap 26 ≠ 12)
//    ★bottom 상수 승계: 26px(본 카드) → 20px(Rebalance 01·docs/56 §9 승인 — 확장 무대 하단 사용).
//    본 단언의 취지(gap 26 상향+shell_iron 스코프)는 그대로 검증한다.
chk('c6 stageAllies gap 상향 조정(26, 이전 12 대비 증가)',
  /#stage\.sb-boss-iron #stageAllies\{bottom:20px;gap:26px\}/.test(html), '');

// 7. 크기 상향 — 전사/도적/마법사/주술사/파쇄자 scale
const sw = figScale('sb-war-fig'), sr = figScale('sb-rog-fig'), sm = figScale('sb-mage-fig'),
      ss = figScale('sb-sham-fig'), sb = figScale('sb-boss-fig');
chk('c7 4인 크기 상향(전사.80/도적.74/마법사.76/주술사.74) + 파쇄자 1.04',
  sw === 0.80 && sr === 0.74 && sm === 0.76 && ss === 0.74 && sb === 1.04,
  `war ${sw} rog ${sr} mage ${sm} sham ${ss} boss ${sb}`);

// 8. 도적/마법사/주술사 scale이 Party Rework 01(.66/.68/.66) 이상
chk('c8 도적/마법사/주술사 scale 유지 또는 증가(≥ .66/.68/.66)',
  sr >= 0.66 && sm >= 0.68 && ss >= 0.66 && sr > 0.66 && sm > 0.68 && ss > 0.66,
  `rog ${sr}≥.66 · mage ${sm}≥.68 · sham ${ss}≥.66`);

// 9. 좌우 분산 폭 존재 (전사 좌(-) · 주술사 우(+))
chk('c9 좌우 분산 폭 존재(전사 x<0, 주술사 x>0)',
  tw && ts && tw.x < 0 && ts.x > 0, tw && ts ? `war.x ${tw.x} < 0 < sham.x ${ts.x}` : '');

// 10. 전사 좌측 치우침 증가 (이전 +4 → 이번 음수)
chk('c10 전사 좌측 치우침 증가(이전 +4px → 이번 x<0)',
  tw && tw.x < 4, tw ? `war.x ${tw.x} (< 4)` : '');

// 11. 주술사 우측 치우침 증가 (이전 -2 → 이번 양수)
chk('c11 주술사 우측 치우침 증가(이전 -2px → 이번 x>0)',
  ts && ts.x > -2, ts ? `sham.x ${ts.x} (> -2)` : '');

// 12. 실제 스팬 확대 (전사 최좌 ~ 주술사 최우 x-오프셋 스팬이 이전 대비 확대)
// 이전 Party Rework 01: war+4, sham-2 → 오프셋 스팬 (sham.x - war.x) = -6
// 이번: sham.x - war.x 가 충분히 큰 양수여야 (날개가 반대로 벌어짐)
chk('c12 날개 오프셋 스팬 확대(sham.x - war.x ≥ 40)',
  tw && ts && (ts.x - tw.x) >= 40, tw && ts ? `span ${ts.x - tw.x}` : '');

// 13. sb- 네임스페이스 유지 · 일반명 신규 0
chk('c13 sb- 네임스페이스 유지 + 일반명 신규 0',
  cntH('sb-') >= 15 && !hasH('.sb-body{') &&
  !/[^-\w]\.orb[\s{]/.test(html) && !/[^-\w]\.totem[\s{]/.test(html), '');

// 14. 3층 transform 유지
chk('c14 3층 transform(#stage .sb-unit/.sb-react/.sb-fit/.sb-fig)',
  hasH('#stage .sb-unit{') && hasH('#stage .sb-react{') && hasH('#stage .sb-fit{') && hasH('#stage .sb-fig{'), '');

// 15. fig width 유지 (Party Rework 01 버그 수정 계승)
chk('c15 3동료 sb-fig width:104px 유지(버그수정 계승)',
  hasH('#stage .sb-rogue .sb-fig{width:104px') &&
  hasH('#stage .sb-mage .sb-fig{width:104px') &&
  hasH('#stage .sb-shaman .sb-fig{width:104px'), '');

// 16. 행동선/강타선 신규 없음 (sb 영역 · 기존 UI svg 아이콘과 무관)
chk('c16 행동선/강타선 신규 0(sb 영역)',
  !hasH('sb-line') && !hasH('sb-impulse') && !hasH('sbSmashLine') && !hasH('sb-svg'), '');

// 17. 신규 상태/타이머 없음
chk('c17 신규 상태/타이머 없음(sbFigPose 기존 상태만)',
  hasH('function sbFigPose(S)') && !hasH('sbCompanionTimer') && !hasH('sbLayoutTimer'), '');

// 18. renderFx 관련 요소 유지 (fxr/fxf 4동료)
chk('c18 링/플래시(fxr/fxf) 4동료 유지',
  hasH('id="fxr-war"') && hasH('id="fxf-war"') && hasH('id="fxr-rog"') && hasH('id="fxf-rog"') &&
  hasH('id="fxr-mage"') && hasH('id="fxf-mage"') && hasH('id="fxr-sham"') && hasH('id="fxf-sham"'), '');

// 19. 외부 에셋/네트워크 없음
{
  const forbid = ['Math.random', 'base64', '<img', '.png', '.jpg', '.webp', 'assets', 'url(http', '@import', 'fetch('];
  const found = forbid.filter(p => html.indexOf(p) >= 0);
  chk('c19 외부 에셋/네트워크 0', found.length === 0, found.join(','));
}

// 20. index.html 현행 기준선 (Layout Rework 01 재-baseline)
chk('c20 index.html 현행 기준선(155,854 B · md5 2f7a1b29…)',
  buf.length === 155854 &&
  crypto.createHash('md5').update(buf).digest('hex') === '2f7a1b29dba5b79950ebdbbeb6e06fb6', '');

// 21. CORE byte-identical
{
  const lines = html.split('\n');
  let f = 0, core = [];
  for (const l of lines) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) core.push(l); }
  const bytes = Buffer.byteLength(core.join('\n') + '\n', 'utf8');
  const cmd5 = crypto.createHash('md5').update(core.join('\n') + '\n').digest('hex');
  chk('c21 CORE 466줄/22,521 B byte-identical', core.length === 466 && bytes === 22521 &&
    cmd5 === '6cad2ec271a2a79afbee881c2a2e0856', core.length + '줄/' + bytes + 'B/' + cmd5.slice(0, 8));
}

// 22. 수치/판정/Save 무변경
chk('c22 강타/보호막 수치 원문 보존 + Save 확장 0',
  hasH('smash:320, enSmash:380, smashBlocked:0.5') && cntH('localStorage.setItem') <= 1, '');

// 23. 스모크 3종 불변
try {
  const h = require('./harness.js');
  const s = h.sb.window.__seedHealer;
  const m = s.smoke(), i = s.smoke('shell_iron'), t = s.smoke('shell_thirst');
  chk('c23 스모크 3종 불변(51.4/1029·48.5/971·61.8/1236)',
    m.t === 51.4 && m.steps === 1029 && i.t === 48.5 && i.steps === 971 && t.t === 61.8 && t.steps === 1236,
    m.t + '/' + m.steps + ' · ' + i.t + '/' + i.steps + ' · ' + t.t + '/' + t.steps);
} catch (e) { chk('c23 스모크 3종 불변', false, e.message); }

// 24. 다른 두 보스 회귀 없음 (shell_iron 스코프 · 전역 stageAllies bottom:6 유지)
chk('c24 다른 보스 회귀 보호(shell_iron 스코프·전역 stageAllies bottom:6)',
  hasH('#stageAllies{position:absolute;bottom:6px') &&
  hasH("sC(_stg,'sb-boss-iron',(typeof CUR_BOSS!=='undefined'&&CUR_BOSS==='shell_iron'))"), '');

// 25. HOLD 산출물 미유입
chk('c25 HOLD 파일 repo 미유입',
  ['docs/40_IRON_CRUSHER_ACTION_LINE_PROTO.md', 'dev/p20.mjs', 'dev/core_new.js']
    .every(f => !fs.existsSync(path.join(ROOT, f))), '');

// 26. docs/50 필수 절
chk('c26 docs/50 필수 절(피드백/배치안/버린 안/최종/포위감/회귀/리스크)',
  ['나라님 피드백', '시도한 배치안', '버린 안', '최종 선택안',
   '포위', '다른 두 보스 회귀 없음', '남은 시각 리스크'].every(s => doc.indexOf(s) >= 0), '');

// 27. div/section 균형 (214/214·8/8)
{
  const dO = cntH('<div'), dC = cntH('</div>'), sO = cntH('<section');
  chk('c27 div/section 균형(214/214·8/8)', dO === dC && dO === 214 && sO === 8, dO + '/' + dC + ' · sec ' + sO);
}

console.log(`\n${fail === 0 ? '★ PARTY FIGURE LAYOUT REWORK 01 CHECK PASS' : '★ PARTY FIGURE LAYOUT REWORK 01 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
