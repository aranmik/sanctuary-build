'use strict';
// Battle Stage Vertical Polish 02 전용 검증
// 실행: node dev/battle_stage_vertical_polish_02_check.js
// 보스 소폭 추가 상향(shell_iron 스코프) + 스킬 버튼 cast progress 제거 + GCD dim/priCastWrap 유지가
// 실제 index.html CSS/JS에 존재하는지 교차검증(문서 문자열만이 아니라 selector/render 코드 직접 검사).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const DOC = path.join(ROOT, 'docs', '57_BATTLE_STAGE_VERTICAL_POLISH_02.md');
const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const doc = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '';

let pass = 0, fail = 0;
function chk(name, cond, detail) {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
}
const inSrc = s => src.indexOf(s) >= 0;
const inDoc = (...ss) => ss.every(s => doc.indexOf(s) >= 0);

// 1. 보스 위치 추가 상향 (top 2→-8 · 10px · shell_iron 전용 요소)
chk('c1 파쇄자 top:-8px 상향',
  inSrc('#sb-boss-fig{left:50%;top:-8px;transform:translateX(-50%) scale(1.04)') &&
  !/#sb-boss-fig\{left:50%;top:2px/.test(src), '');

// 2. 보스 scale 불변 (1.04 · transform-origin 50% 0)
chk('c2 보스 scale 1.04·origin 불변',
  inSrc('scale(1.04);transform-origin:50% 0;display:none;z-index:2'), '');

// 3. 파티 위치 불변 (allies bottom/gap + 원호 translate 4종)
chk('c3 파티 위치 불변(bottom:20·gap:26·원호 4종)',
  /#stage\.sb-boss-iron #stageAllies\{bottom:20px;gap:26px\}/.test(src) &&
  inSrc('#stage.sb-boss-iron #sa-war{transform:translate(-24px,-12px);z-index:4}') &&
  inSrc('#stage.sb-boss-iron #sa-rog{transform:translate(-8px,8px)}') &&
  inSrc('#stage.sb-boss-iron #sa-mage{transform:translate(8px,8px)}') &&
  inSrc('#stage.sb-boss-iron #sa-sham{transform:translate(24px,-6px)}'), '');

// 4. 파티 scale 불변 (.80/.74/.76/.74)
chk('c4 파티 scale 불변',
  inSrc('scale(.80);transform-origin:50% 100%;display:none;z-index:4') &&
  inSrc('#sb-rog-fig{left:50%;bottom:-3px;transform:translateX(-50%) scale(.74)') &&
  inSrc('#sb-mage-fig{left:50%;bottom:-3px;transform:translateX(-50%) scale(.76)') &&
  inSrc('#sb-sham-fig{left:50%;bottom:-3px;transform:translateX(-50%) scale(.74)'), '');

// 5. 무대 높이 추가 변경 없음 (stage flex:1 + Rebalance 01 상하 구획값 그대로)
chk('c5 무대 구획 불변(flex:1·hud 6/6·bossbar mt5·castwrap mt3·warnBar py4)',
  inSrc('#stage{position:relative;flex:1;min-height:104px;overflow:hidden}') &&
  inSrc('#hud{padding:6px 11px 6px') &&
  inSrc('height:20px;margin-top:5px;background:#3a0d16') &&
  inSrc('height:17px;margin-top:3px;background:#221a3c') &&
  inSrc('gap:5px;padding:4px 9px;border-radius:10px'), '');

// 6~7. 클리핑 0 실측 기록 (windup 망치 최소 여유 51.1 · 대기 crown 여유 64.3 — 실측은 pane·기록 검증)
chk('c6 windup 망치 clipping 0 실측 기록(51.1px)', inDoc('51.1', '클리핑 0'), '');
chk('c7 보스 body/crown clipping 0 실측 기록(64.3px)', inDoc('64.3'), '');

// 8. Rework 02 hammer selector 유지
chk('c8 Rework 02 hammer source 유지',
  inSrc("sbPt('sb-boss-fig','sb-ic-hammer',1)"), '');

// 9. 좌상단 fallback 부재
chk('c9 모서리 fallback 부재(on=!!(src&&dst))', inSrc('var on=!!(src&&dst);'), '');

// 10. 스킬 버튼 cast progress CSS 제거
chk('c10 .skill.casting CSS 제거', !inSrc('.skill.casting'), '');

// 11. ::after 진행선 계열 제거 (--cp 변수 사용 포함)
chk('c11 casting::after·var(--cp) 제거',
  !inSrc('.casting::after') && !inSrc('var(--cp'), '');

// 12. cast 버튼 opacity 예외 제거 + render의 casting 토글 제거
chk('c12 cast 버튼 밝음 예외·casting 토글 제거',
  !/\.skill\.casting\{opacity:1\}/.test(src) && !inSrc("sC(b,'casting'"), '');

// 13. .gLock 전체 dim 유지
chk('c13 gLock dim 유지(.66 + transition 자연 복귀)',
  inSrc('.skill.gLock{opacity:.66}') && inSrc('.skill{transition:opacity .18s ease}'), '');

// 14. GCD 실제 사용 차단 predicate — 시각 gLock(t<p.gcd)과 별개로 gameplay 사용 경로가 동일 p.gcd 조건으로 차단.
//     ★DOM disabled 속성 아님(버튼 markup에 disabled 없음). useSkill은 마나·cast·cooldown 발생 전 거부.
//     renew/seed/focus도 동일 predicate. (유키 정합 요청: 시각 dim ≠ 실제 차단 — 실제 predicate 존재를 못박음)
{
  const gIdx = src.indexOf('if(S.t<p.gcd)return false;');       // useSkill 내 GCD 거부
  const payIdx = src.indexOf('payMana(sk.mana);gcd();');        // 첫 부작용(마나 차감+gcd 시작)
  const gcdBeforeSideEffect = gIdx > 0 && payIdx > gIdx;        // 거부가 부작용보다 앞
  const extraGuards = (src.match(/\|\|t<p\.gcd\)return;/g) || []).length; // renewUse/seedUse/focusUse 3경로
  const noDisabledAttr = !/<button class="skill"[^>]*\sdisabled/.test(src); // HTML disabled 속성 미사용
  chk('c14 GCD 실제 차단 predicate(useSkill S.t<p.gcd·부작용 전 + renew/seed/focus 3경로 + 시각 gLock + disabled속성 미사용)',
    gcdBeforeSideEffect && extraGuards >= 3 && noDisabledAttr &&
    inSrc("sC(b,'gLock',t<p.gcd);"), 'guards=' + extraGuards + '·gcdBeforePay=' + gcdBeforeSideEffect);
}

// 15. priCastWrap 유지 (DOM + CSS + 탭 취소)
chk('c15 priCastWrap 유지(DOM·castFill·탭 취소)',
  inSrc('id="priCastWrap"') && inSrc('#priCastWrap .castFill') &&
  inSrc("$('priCastWrap').addEventListener('click',()=>{if(G)G.cancelCast();});"), '');

// 16. 실제 p.cast 진행률 유지 (사제 HUD 한 곳)
chk('c16 priCast 실진행(p.cast.end/dur)+스킬명·남은 초·취소 안내 유지',
  inSrc('100*(1-(p.cast.end-t)/p.cast.dur)') &&
  inSrc("p.cast.name+' '+Math.max(0,p.cast.end-t).toFixed(1)+'초 (탭: 취소)'"), '');

// 17. 독립 gcdBar 숨김 유지 (재노출 없음 · DOM/render 무접촉)
chk('c17 gcdBar display:none 유지+DOM/render 보존',
  /#gcdBar\{[^}]*display:none/.test(src) &&
  inSrc('<div id="gcdBar"><div id="gcdFill"></div></div>') && inSrc("sW($('gcdFill')"), '');

// 18. 개별 cooldown 유지 (dispel/pray/shield veil + 카운트다운)
chk('c18 개별 cooldown veil·초 표시 유지',
  inSrc("if(k==='dispel'&&t<p.cdDispel)") && inSrc("if(k==='pray'&&t<p.cdPray)") &&
  inSrc("if(k==='shield'&&su&&t<su.shieldLock)") &&
  inSrc('.skVeil{position:absolute') && inSrc('.skCdNum{font-size:14px'), '');

// 19. 마나 부족 표현 유지
chk('c19 noMana 유지(빨강 비용 + class 토글)',
  inSrc('.skill.noMana .skCost{color:#ff8a95}') && inSrc("sC(b,'noMana',p.mana<sk.mana);"), '');

// 20. 버튼 크기·gap·배치 유지
chk('c20 버튼 60px·grid 3열 gap7 유지',
  inSrc('.skill{position:relative;height:60px') &&
  inSrc('#skills{display:grid;grid-template-columns:repeat(3,1fr);gap:7px'), '');

// 21~22. 새 gameplay state/timer 없음 (gLock 앵커 인접 신규 코드 영역)
{
  const seg = src.slice(src.indexOf("sC(b,'gLock',t<p.gcd);"), src.indexOf("sC(b,'gLock',t<p.gcd);") + 700);
  chk('c21 새 gameplay state 없음(p./S. 대입 0)',
    seg.length > 50 && !/p\.\w+\s*=[^=]/.test(seg) && !/S\.\w+\s*=[^=]/.test(seg), '');
  chk('c22 새 timer 없음(setTimeout/Interval 0)',
    seg.indexOf('setTimeout(') < 0 && seg.indexOf('setInterval(') < 0, '');
}

// 23. CORE 무변경
{
  const lines = src.split('\n');
  let f = 0, core = [];
  for (const l of lines) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) core.push(l); }
  const bytes = Buffer.byteLength(core.join('\n') + '\n', 'utf8');
  const cmd5 = crypto.createHash('md5').update(core.join('\n') + '\n').digest('hex');
  chk('c23 CORE 466줄/22,521 B byte-identical', core.length === 466 && bytes === 22521 &&
    cmd5 === '6cad2ec271a2a79afbee881c2a2e0856', core.length + '/' + bytes + '/' + cmd5.slice(0, 8));
}

// 24. 다른 보스 회귀 보호 (shell_iron 게이트 + 비-iron 기존 경로 + 전역 allies + 축소 fallback)
chk('c24 타 보스 보호(게이트·기존 fxLn·전역 bottom:6·≤730 fallback)',
  inSrc("var iron=(typeof CUR_BOSS!=='undefined'&&CUR_BOSS==='shell_iron');") &&
  inSrc("if(!sbSmashFx(S,t))fxLn('fxBossLine',A.boss,smashTg?A[smashTg]:null,!!smashTg,'fxBoss');") &&
  inSrc('#stageAllies{position:absolute;bottom:6px') &&
  inSrc('#stage.sb-boss-iron #bossAvatar{display:block}'), '');

// 25~26. 390×844 overflow 0 · console 0 (pane 실측 기록 검증)
chk('c25 390×844 overflow 0 기록', inDoc('overflow 0'), '');
chk('c26 console error/warning 0 기록', inDoc('콘솔 0'), '');

// 27. 3보스 smoke 동일 (gameplay 무변경 실행 증명)
try {
  const h = require('./harness.js');
  const s = h.sb.window.__seedHealer;
  const m = s.smoke(), i = s.smoke('shell_iron'), t = s.smoke('shell_thirst');
  chk('c27 스모크 3종 불변(51.4/1029·48.5/971·61.8/1236)',
    m.t === 51.4 && m.steps === 1029 && i.t === 48.5 && i.steps === 971 && t.t === 61.8 && t.steps === 1236,
    m.t + '/' + m.steps + ' · ' + i.t + '/' + i.steps + ' · ' + t.t + '/' + t.steps);
} catch (e) { chk('c27 스모크 3종 불변', false, e.message); }

// 28. index 현행 기준선 (재-baseline 후 자기 핀)
{
  const buf = fs.readFileSync(path.join(ROOT, 'index.html'));
  chk('c28 index.html 현행 기준선(155,854 B · md5 2f7a1b29…)',
    buf.length === 155854 &&
    crypto.createHash('md5').update(buf).digest('hex') === '2f7a1b29dba5b79950ebdbbeb6e06fb6', '');
}

// 29. docs/57 필수 절
chk('c29 docs/57 필수 절(실측 전/후·제거 감사·유지 계약·승계·비범위)',
  inDoc('보스 위치 실측', '제거 안전성 감사', '구계약 승계', '비범위 선언', 'top:-8px', 'priCastWrap'), '');

console.log(`\n${fail === 0 ? '★ BATTLE STAGE VERTICAL POLISH 02 CHECK PASS' : '★ BATTLE STAGE VERTICAL POLISH 02 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
