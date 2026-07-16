'use strict';
// Battle Stage Vertical & Command Rebalance 01 전용 검증
// 실행: node dev/battle_stage_vertical_command_rebalance_01_check.js
// 상하 여백 회수→무대 환원, gcdBar 회수→버튼 gLock/casting 표현, 터치·세이프에어리어·
// Rework 02·타 보스 보호가 실제 index.html CSS/JS에 존재하는지 교차검증.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const DOC = path.join(ROOT, 'docs', '56_BATTLE_STAGE_VERTICAL_COMMAND_REBALANCE_01.md');
const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const doc = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '';

let pass = 0, fail = 0;
function chk(name, cond, detail) {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
}
const inSrc = s => src.indexOf(s) >= 0;
const inDoc = (...ss) => ss.every(s => doc.indexOf(s) >= 0);

// 1. 상단 시스템 구획 압축 (hud 패딩 6/6 · bossbar mt5 · castwrap mt3 · warnBar py4)
chk('c1 상단 압축(hud 6/6·bossbar mt5·castwrap mt3·warnBar py4)',
  inSrc('#hud{padding:6px 11px 6px') &&
  inSrc('height:20px;margin-top:5px;background:#3a0d16') &&
  inSrc('height:17px;margin-top:3px;background:#221a3c') &&
  inSrc('gap:5px;padding:4px 9px;border-radius:10px'), '');

// 2. 무대 flex:1 환원 구조 유지 (회수분 자동 무대 귀속)
chk('c2 무대 flex:1 환원 구조', inSrc('#stage{position:relative;flex:1;min-height:104px;overflow:hidden}'), '');

// 3. 스킬 버튼 크기 축소 없음 (height:60px 유지 · grid gap 7 유지)
chk('c3 스킬 버튼 60px·grid gap 7 유지',
  inSrc('.skill{position:relative;height:60px') &&
  inSrc('#skills{display:grid;grid-template-columns:repeat(3,1fr);gap:7px'), '');

// 4. 하단 safe area 보호 (app padding-bottom env 유지)
chk('c4 safe area padding 유지',
  inSrc('padding:6px 8px calc(6px + env(safe-area-inset-bottom))'), '');

// 5. gcdBar 높이 회수 (display:none · DOM/render 무접촉 = sW null 가드 불필요)
chk('c5 gcdBar 회수(display:none·DOM 유지)',
  inSrc('#gcdBar{height:3px') && /#gcdBar\{[^}]*display:none/.test(src) &&
  inSrc('<div id="gcdBar"><div id="gcdFill"></div></div>') && inSrc("sW($('gcdFill')"), '');

// 6. 보스 상향 — top-anchor 유지(무대 확장 시 자동 상향) · top 정확값은 Polish 02 승인 이동으로 2→-8 승계(docs/57)
chk('c6 파쇄자 top-anchor 유지(top:-8px 〔승계 — Polish 02〕·scale 1.04 불변)',
  inSrc('#sb-boss-fig{left:50%;top:-8px;transform:translateX(-50%) scale(1.04)'), '');

// 7. 파티 scale 무변경 (.80/.74/.76/.74)
chk('c7 파티 scale 무변경',
  inSrc('scale(.80);transform-origin:50% 100%;display:none;z-index:4') &&
  inSrc('#sb-rog-fig{left:50%;bottom:-3px;transform:translateX(-50%) scale(.74)') &&
  inSrc('#sb-mage-fig{left:50%;bottom:-3px;transform:translateX(-50%) scale(.76)') &&
  inSrc('#sb-sham-fig{left:50%;bottom:-3px;transform:translateX(-50%) scale(.74)'), '');

// 8. 파티 가로 배치 무변경 (원호 translate 4종 + gap 26)
chk('c8 파티 가로 배치(원호 translate·gap 26) 무변경',
  inSrc('#stage.sb-boss-iron #sa-war{transform:translate(-24px,-12px);z-index:4}') &&
  inSrc('#stage.sb-boss-iron #sa-rog{transform:translate(-8px,8px)}') &&
  inSrc('#stage.sb-boss-iron #sa-mage{transform:translate(8px,8px)}') &&
  inSrc('#stage.sb-boss-iron #sa-sham{transform:translate(24px,-6px)}') &&
  /#stage\.sb-boss-iron #stageAllies\{bottom:20px;gap:26px\}/.test(src), '');

// 9. 바 의미 감사 문서 존재
chk('c9 바 의미 감사 문서(docs/56 §7)', inDoc('하단 바의 실제 의미', 'gcdBar', 'priCastWrap'), '');

// 10. 글로벌 잠금 실제 state 사용 (gLock ⇔ t<p.gcd — 기존 토글 유지)
chk('c10 gLock=실제 p.gcd 상태',
  inSrc("sC(b,'gLock',t<p.gcd);") && inSrc(".skill.gLock{opacity:.66}"), '');

// 11. disabled 판정과 dim 정합 (dis class ⇔ dis 변수 — 기존 로직 무변경)
chk('c11 dis 판정·시각 정합(기존 로직)',
  inSrc("sC(b,'dis',dis);") && inSrc('let dis=!S.started||S.over||!!p.cast;') &&
  inSrc('.skill.dis{opacity:.62}'), '');

// 12. 〔승계 — Polish 02(docs/57)〕 버튼 cast progress 제거 — 정확 진행은 priCastWrap 한 곳(원계약 "실제 state만 사용"은 priCast 쪽에서 유지)
chk('c12 버튼 cast progress 제거 승계(진행은 priCastWrap 실 p.cast만)',
  !inSrc("sC(b,'casting'") &&
  !inSrc('.skill.casting') && !inSrc('var(--cp') &&
  inSrc('100*(1-(p.cast.end-t)/p.cast.dur)'), '');

// 13~14. 새 gameplay timer/state 없음 (신규 코드 영역 검사)
{
  const seg1 = src.slice(src.indexOf("sC(b,'gLock',t<p.gcd);"), src.indexOf("sC(b,'gLock',t<p.gcd);") + 700);
  chk('c13 새 타이머 없음(gLock 인접 코드에 setTimeout/Interval 0)',
    seg1.indexOf('setTimeout(') < 0 && seg1.indexOf('setInterval(') < 0, '');
  /* 〔승계 — Polish 02〕 앵커 '/* Rebalance 01' 주석이 casting 코드와 함께 제거됨 → gLock 앵커 구간 전체로 동일 단언 유지 */
  chk('c14 새 gameplay state 없음(gLock 인접 코드에 p./S. 대입 0)',
    seg1.length > 50 &&
    !/p\.\w+\s*=[^=]/.test(seg1) && !/S\.\w+\s*=[^=]/.test(seg1), '');
}

// 15. 글로벌 잠금·마나 부족 구분 유지 · casting 밝음 예외는 Polish 02 승인 제거 승계(docs/57 — 시전 중엔 전체 dim 공통 언어)
chk('c15 gLock/noMana 구분 CSS + casting 밝음 예외 제거 승계',
  inSrc('.skill.gLock{opacity:.66}') && inSrc('.skill.noMana .skCost{color:#ff8a95}') &&
  !inSrc('.skill.casting{opacity:1}'), '');

// 16. 독립 바 제거 + 시전 정확 진행은 사제 HUD(priCastWrap) 유지 = §11 허용 위치
chk('c16 독립 gcdBar 회수 + priCastWrap(HUD 내) 유지',
  /#gcdBar\{[^}]*display:none/.test(src) &&
  inSrc('id="priCastWrap"') && inSrc('#priCastWrap .castFill'), '');

// 17. 텍스트·마나·시전 정보 보존 (skCost·castTxt·bossCastTxt 구조 유지)
chk('c17 정보 보존(skCost/castTxt/bossCastTxt)',
  inSrc('skCost') && inSrc('castTxt') && inSrc('bossCastTxt') && inSrc('priCastTxt'), '');

// 18. Rework 02 hammer anchor 보존
// 〔승계 — F3(docs/64)〕 sbPt 직호출→의미 anchor 요청. 망치 source 의미·산식(sbPt 위임·topBias) 불변
chk('c18 Rework 02 hammer source 보존',
  inSrc("resolveAnchor('boss_iron','weapon')") && inSrc("weapon:{part:'sb-ic-hammer',topBias:1"), '');

// 19. shell_iron 게이트 보존
chk('c19 shell_iron 게이트 보존',
  inSrc("var iron=(typeof CUR_BOSS!=='undefined'&&CUR_BOSS==='shell_iron');"), '');

// 20. 좌상단 fallback 부재 (on=!!(src&&dst) 유지)
chk('c20 모서리 fallback 부재', inSrc('var on=!!(src&&dst);'), '');

// 21. 다른 보스 회귀 보호 (비-iron 기존 경로 + 전역 allies bottom:6 유지)
chk('c21 타 보스 보호(기존 fxLn 경로·전역 stageAllies bottom:6)',
  inSrc("if(!sbSmashFx(S,t))fxLn('fxBossLine',A.boss,smashTg?A[smashTg]:null,!!smashTg,'fxBoss');") &&
  inSrc('#stageAllies{position:absolute;bottom:6px'), '');

// 22. 신규 데칼 없음
chk('c22 신규 데칼 0', !inSrc('smashDecal') && !inSrc('pressureDecal') && !inSrc('sb-decal'), '');

// 23. Actor scale 변경 없음 (파쇄자 1.04 — c6·c7에서 검증 + fig 크기 불변)
chk('c23 Actor fig 크기 불변(104/126·190/212)',
  inSrc('width:104px;height:126px') && inSrc('width:190px;height:212px'), '');

// 24. CORE 무변경
{
  const lines = src.split('\n');
  let f = 0, core = [];
  for (const l of lines) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) core.push(l); }
  const bytes = Buffer.byteLength(core.join('\n') + '\n', 'utf8');
  const cmd5 = crypto.createHash('md5').update(core.join('\n') + '\n').digest('hex');
  chk('c24 CORE 466줄/22,521 B byte-identical', core.length === 466 && bytes === 22521 &&
    cmd5 === '6cad2ec271a2a79afbee881c2a2e0856', core.length + '/' + bytes + '/' + cmd5.slice(0, 8));
}

// 25. 스모크 3종 불변 (gameplay 무변경 실행 증명 — GCD/시전/판정 무접촉)
try {
  const h = require('./harness.js');
  const s = h.sb.window.__seedHealer;
  const m = s.smoke(), i = s.smoke('shell_iron'), t = s.smoke('shell_thirst');
  chk('c25 스모크 3종 불변(51.4/1029·48.5/971·61.8/1236)',
    m.t === 51.4 && m.steps === 1029 && i.t === 48.5 && i.steps === 971 && t.t === 61.8 && t.steps === 1236,
    m.t + '/' + m.steps + ' · ' + i.t + '/' + i.steps + ' · ' + t.t + '/' + t.steps);
} catch (e) { chk('c25 스모크 3종 불변', false, e.message); }

// 26. index 현행 기준선 (재-baseline 후 자기 핀)
{
  const buf = fs.readFileSync(path.join(ROOT, 'index.html'));
  chk('c26 index.html 현행 기준선(185,737 B · md5 8d72d049…)',
    buf.length === 185737 &&
    crypto.createHash('md5').update(buf).digest('hex') === '8d72d049b3090904abfd26488c7d4270', '');
}

// 27. docs/56 필수 절
chk('c27 docs/56 필수 절(실측 전/후·회수/환원·바 의미·잠금/시전 표현·회귀·비범위)',
  inDoc('작업 전 세로 구획', '작업 후 세로 구획', '하단 바의 실제 의미',
        '글로벌 잠금', 'cast progress', 'Rework 02', 'safe area', '비범위 선언'), '');

console.log(`\n${fail === 0 ? '★ BATTLE STAGE VERTICAL COMMAND REBALANCE 01 CHECK PASS' : '★ BATTLE STAGE VERTICAL COMMAND REBALANCE 01 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
