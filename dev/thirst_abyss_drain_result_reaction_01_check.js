'use strict';
// Thirst Abyss Drain Result Reaction 01 (F8B-2) 전용 검증
// 실행: node dev/thirst_abyss_drain_result_reaction_01_check.js
// A Drain truth · B Event distinction · C Trigger timing · D Priority · E Four channels
// · F Visual contract · G Hit distinction · H Ambient coexistence · I Lifecycle · J 기존 FX 회귀 · K 회귀.
// 원칙: 예고는 없고, 빼앗긴 순간에만 심연이 삼킨다 — 빼앗긴 순간, 공허가 한 번 더 깊어진다.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const DOC = path.join(ROOT, 'docs', '72_THIRST_ABYSS_DRAIN_RESULT_REACTION_01.md');
const doc = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '';

let pass = 0, fail = 0;
function chk(name, cond, detail) {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
}
const inSrc = s => src.indexOf(s) >= 0;
function fnBody(name) {
  const i = src.indexOf('function ' + name + '(');
  if (i < 0) return '';
  const j = src.indexOf('\n}', i);
  return (j > i) ? src.slice(i, j) : '';
}
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '');
const railB = strip(fnBody('srTrigger'));
const evB = strip(fnBody('srEventReaction'));
const drvB = strip(fnBody('sbBossState'));
const clrB = strip(fnBody('srClearReaction'));
const capB = strip(fnBody('clearActorPresence'));
const GEN = railB + evB + drvB + clrB + capB;
// 심연 CSS 규칙(선택자 스코프)
const cssRules = src.match(/[^{}]+\{[^{}]*\}/g) || [];
const abyssRules = cssRules.filter(r => { const s = r.slice(0, r.indexOf('{')); return s.indexOf('sb-abyss') >= 0 || s.indexOf('sb-boss-thirst') >= 0; });
const drainRules = abyssRules.filter(r => r.slice(0, r.indexOf('{')).indexOf('data-reaction="drain"') >= 0);
const abKfs = src.match(/@keyframes sbReactAb\w+\{[^}]*(\{[^}]*\}[^}]*)*\}/g) || [];
// CORE
const coreLines = [];
{ let f = 0, ln = 0; for (const l of src.split('\n')) { ln++; if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) coreLines.push(l); } }
const core = coreLines.join('\n') + '\n';

/* ===== 하네스 ===== */
let h = null, s = null, stage = null;
try { h = require('./harness.js'); s = h.sb.window.__seedHealer; stage = s.stage; } catch (e) { console.log('HARNESS FAIL ' + e.message); }
function setG(g) { h.sb.__g = g; vm.runInContext('G=__g;', h.sb); }
function fresh(bossId) {
  h.sb.CUR_BOSS = bossId;
  const g = s.createGame(bossId); g.start(); g.step(0.05); setG(g);
  s.stage.reset(g.S); h.sb.sbBossState(g.S);
  return g;
}

/* ===== A. Drain truth ===== */
chk('a1 drain 실행 원문 보존(마나 흡수→전원 피해→사제 피해→로그→FX)',
  inSrc('const burn=S.boss.enraged?B.enDrain:B.drain;') &&
  inSrc('S.pri.mana=Math.max(0,S.pri.mana-burn);') &&
  inSrc("aliveAll().slice().forEach(a=>dmg(a,d,'aoe'));") &&
  inSrc("if(!S.over)dmg(S.pri,d,'aoe');") &&
  inSrc("FX('aoe');break}"), '');

chk('a2 광폭 전후 수치 무변경(drain 62/95·dmg 42/64)',
  inSrc('drain:62, enDrain:95, drainDmg:42, enDrainDmg:64') &&
  inSrc('const d=S.boss.enraged?B.enDrainDmg:B.drainDmg;'), '');

chk('a3 drain SCRIPT 원문 보존(11회·t5~t71)',
  (function () {
    const m = src.match(/const ABYSS_SCRIPT=\[[\s\S]*?\];/);
    return m && (m[0].match(/e:'drain'/g) || []).length === 11 &&
      inSrc("{t:5, e:'drain'}") && inSrc("{t:71,e:'drain'}");
  })(), '');

chk('a4 cast/tell/windup 경로 여전히 0(bossAction null·심연 SCRIPT에 cast 어휘 0)',
  (src.match(/S\.boss\.cast=\{kind:/g) || []).length === 2 &&
  !/S\.boss\.cast=\{kind:'drain'/.test(src) &&
  inSrc('poseRules:[]') &&
  (function () { const p = stage.bossProfile('shell_thirst'); return JSON.stringify(p.faceRules) === JSON.stringify([]) && JSON.stringify(p.allowedPoses || []) === JSON.stringify([]); })(), '');

chk('a5 drain event=1회(case당 FX(aoe) 정확히 1회 발화)',
  (function () {
    const m = src.match(/case 'drain':\{[\s\S]*?FX\('aoe'\);break\}/);
    return !!m && (m[0].match(/FX\(/g) || []).length === 1;
  })(), '');

chk('a6 ★CORE 무접촉 증명(drain·judge 두 aoe 발화 지점 모두 CORE 내부 → payload 보강 불가·정본 유지)',
  (function () {
    const L = src.split('\n'); let cs = 0, ce = 0;
    L.forEach((l, i) => { if (l.includes('//__CORE_START__')) cs = i + 1; if (l.includes('//__CORE_END__')) ce = i + 1; });
    const dl = L.findIndex(l => l.includes("FX('aoe');break}")) + 1;
    const jl = L.findIndex(l => l.includes('어둠의 심판이 파티를 덮칩니다')) + 1;
    return cs > 0 && ce > cs && dl > cs && dl < ce && jl > cs && jl < ce &&
      coreLines.length === 466 &&
      crypto.createHash('md5').update(core).digest('hex') === '6cad2ec271a2a79afbee881c2a2e0856';
  })(), '');

/* ===== B. Event distinction ===== */
chk('b1 ★구분 근거=profile 소유 이벤트 매핑(reactionEvents) — bossId/SCRIPT 시간/CSS 추측 0',
  inSrc("reactionEvents:{aoe:'drain'}") &&
  evB.indexOf('p.reactionEvents[evKey]') >= 0 &&
  ['shell_thirst', 'boss01', 'shell_iron', 'boss_abyss', 'drain', 'aoe']
    .every(t => evB.indexOf("'" + t + "'") < 0) &&
  evB.indexOf('S.t') < 0 && evB.indexOf('getComputedStyle') < 0 && evB.indexOf('classList') < 0, '');

chk('b2 reactionEvents 선언=심연만(모르가스/파쇄자 미선언)',
  (function () {
    const a = stage.bossProfile('shell_thirst'), m = stage.bossProfile('boss01'), i = stage.bossProfile('shell_iron');
    return a.reactionEvents && a.reactionEvents.aoe === 'drain' &&
      m.reactionEvents === undefined && i.reactionEvents === undefined;
  })(), '');

try { // 모르가스 judge 착지 aoe → drain 0 (핵심 구분 검증)
  const g = fresh('boss01');
  const b = stage.reactionStats();
  h.sb.srEventReaction('aoe');
  const a = stage.reactionStats();
  h.sb.CUR_BOSS = 'boss01';
  chk('b3 ★모르가스 judge 착지 aoe에서 drain 발화 0(어휘 공유하지만 profile 미선언=무해 no-op)',
    a.drain === b.drain, 'drain+' + (a.drain - b.drain));
} catch (e) { chk('b3 judge aoe 구분(예외)', false, e.message); }

try { // 파쇄자(aoe 자체가 없는 보스) → 0
  const g = fresh('shell_iron');
  const b = stage.reactionStats();
  h.sb.srEventReaction('aoe');
  h.sb.srEventReaction('nope');
  const a = stage.reactionStats();
  h.sb.CUR_BOSS = 'boss01';
  chk('b4 미선언 보스/미지 이벤트 키=무해 no-op(발화 0·예외 0)', a.drain === b.drain, '');
} catch (e) { chk('b4 미선언(예외)', false, e.message); }

try { // 심연에서만 발화 · event 1회 → trigger 1회
  const g = fresh('shell_thirst');
  const b = stage.reactionStats();
  h.sb.srEventReaction('aoe');
  const a = stage.reactionStats();
  h.sb.CUR_BOSS = 'boss01';
  chk('b5 심연 aoe → drain 정확히 1회(event 1 → trigger 1)',
    (a.drain - b.drain) === 1, 'drain+' + (a.drain - b.drain));
} catch (e) { chk('b5 심연 발화(예외)', false, e.message); }

/* ===== C. Trigger timing ===== */
chk('c1 소비 지점=기존 doFx aoe case(기존 screen FX 뒤·같은 frame)',
  inSrc("case 'aoe':SFX.aoe();shake();vign();srEventReaction('aoe');") &&
  src.indexOf("SFX.aoe();shake();vign()") < src.indexOf("srEventReaction('aoe');break;"), '');

chk('c2 사전 trigger 0·임의 delay 0(rail 밖 timer 0·SCRIPT 시간 감시 0)',
  evB.indexOf('setTimeout') < 0 && evB.indexOf('setInterval') < 0 &&
  evB.indexOf('S.t') < 0 && evB.indexOf('ABYSS_SCRIPT') < 0, '');

chk('c3 gameplay 이벤트 소비 무변경(splice 1곳·tap 1곳·seedOnHit 원위치)',
  (src.match(/\.ev\.splice\(0\)/g) || []).length === 1 &&
  (src.match(/sgObserve\(e,G\.S\);/g) || []).length === 1 && inSrc('seedOnHit(e.tg)'), '');

/* ===== D. Priority ===== */
chk('d1 drain=profile priority 30·coalesce 0(1 결과=1 반응)',
  inSrc("drain:{anim:'sbReactAbDrain',ms:460,priority:30,coalesce:0}"), '');

chk('d2 generic에 reaction key 특수분기 0·bossId 분기 0',
  ['drain', 'hit', 'interrupted', 'shell_thirst', 'boss01', 'shell_iron', 'boss_abyss', 'sbReactAbDrain']
    .every(t => railB.indexOf("'" + t + "'") < 0) &&
  railB.indexOf('switch(') < 0 && railB.indexOf('pri<SR_STAGE.activePri') >= 0, '');

try {
  const g = fresh('shell_thirst');
  const b = stage.reactionStats();
  h.sb.srBossHit();                 // hit active
  const a1 = stage.activeReaction();
  h.sb.srEventReaction('aoe');      // drain이 우선권 획득
  const a2 = stage.activeReaction();
  for (let i = 0; i < 4; i++) g.step(0.05); // hit coalesce 창 밖 → 병합이 아니라 우선권을 시험
  h.sb.srBossHit();                 // drain active 중 hit → 덮지 않음
  const a3 = stage.activeReaction();
  const st = stage.reactionStats();
  h.sb.CUR_BOSS = 'boss01';
  chk('d3 hit active 중 drain 우선권 획득', a1.key === 'hit' && a2.key === 'drain' && a2.priority === 30, JSON.stringify(a2));
  chk('d4 drain active 중 hit가 덮지 않음(suppressed 계상·gameplay 손실 0)',
    a3.key === 'drain' && (st.suppressed - b.suppressed) === 1,
    'active=' + a3.key + ' suppressed+' + (st.suppressed - b.suppressed));
} catch (e) { chk('d3/d4 priority(예외)', false, e.message); }

/* ===== E. Four channels ===== */
chk('e1 심연 pose/face 여전히 빈 어휘(drain pose·tell face 생성 0)',
  (function () {
    const p = stage.bossProfile('shell_thirst');
    return JSON.stringify(p.faceRules) === JSON.stringify([]) && p.faceParts === undefined &&
      !/data-pose="drain"/.test(src) && !/\.sb-abyss\[data-face=/.test(src);
  })(), '');

chk('e2 reaction 코드가 pose/face/state/gameplay를 직접 제거 0',
  GEN.indexOf("setAttribute('data-pose'") < 0 && GEN.indexOf("setAttribute('data-face'") < 0 &&
  !/\bS\.\w+\s*=[^=]/.test(GEN) && !/\bG\.\w+\s*=[^=]/.test(GEN) &&
  clrB.indexOf("setAttribute('data-reaction','')") >= 0 && clrB.indexOf('data-state') < 0, '');

chk('e3 조합 문자열 0(어휘 단일)',
  !inSrc('abyssDrain') && !inSrc('thirstDrain') && !inSrc('boss_abyss_drain') &&
  !inSrc('drain-hit') && !inSrc('enraged-drain') && !inSrc('consume-drain') &&
  !/data-reaction="[a-z]+-[a-z]+"/.test(src), '');

chk('e4 enraged state 규칙 무변경(3보스 stateRules 원문)',
  (src.match(/stateRules:\[\{state:'enraged',when:\{enraged:true\}\}\]/g) || []).length === 3, '');

/* ===== F. Visual contract (inward only) ===== */
chk('f1 core swallow=중심 공허가 깊어짐(core::before 전용 keyframes)',
  inSrc('@keyframes sbReactAbVoid') &&
  inSrc('#stage .sb-abyss[data-reaction="drain"] .sb-ab-core::before{animation:sbReactAbVoid .34s'), '');

chk('f2 aura/pool inward(scale 축소·1 미만)',
  inSrc('#stage .sb-abyss[data-reaction="drain"] .sb-aura{scale:.9}') &&
  inSrc('#stage .sb-abyss[data-reaction="drain"] .sb-ab-pool{scale:.94 .96}'), '');

chk('f3 sideL/sideR가 서로 반대 방향=중심으로(부호 반대·비대칭 거리)',
  inSrc('#stage .sb-abyss[data-reaction="drain"] .sb-ab-shardL{translate:7px 2px}') &&
  inSrc('#stage .sb-abyss[data-reaction="drain"] .sb-ab-shardR{translate:-6px 1px}'), '');

chk('f4 비대칭 timing(좌우 transition 속도 다름)',
  inSrc('#stage .sb-abyss .sb-ab-shardL{transition:transform .28s ease,translate .15s ease-out}') &&
  inSrc('#stage .sb-abyss .sb-ab-shardR{transition:transform .28s ease,translate .23s ease-out}'), '');

chk('f5 ★outward 0(drain 규칙/keyframes에 scale>1 overshoot·burst·flash 0)',
  abKfs.length >= 3 &&
  !/@keyframes sbReactAbDrain\{[^@]*scale:1\.[1-9]/.test(src) &&
  !drainRules.some(r => /scale:\s*1\.[1-9]/.test(r)) &&
  !inSrc('sbAbBurst') && !inSrc('sbAbFlash') && !inSrc('sbDrainRing') &&
  !drainRules.some(r => r.indexOf('position:fixed') >= 0), '');

chk('f6 신규 DOM/particle/line/anchor 0',
  (src.match(/id="sb-abyss-fig"/g) || []).length === 1 &&
  (src.match(/<line id="fx/g) || []).length === 3 &&
  (function () { const p = stage.bossProfile('shell_thirst'); return JSON.stringify(p.anchors) === JSON.stringify([]); })() &&
  JSON.stringify(stage.anchors()) === JSON.stringify(['boss_iron', 'war', 'rog', 'mage', 'sham', 'boss_morgas', 'boss', 'pri']), '');

chk('f7 keyframes에 transform: 직서 0(개별 속성만=base와 합성)',
  abKfs.every(k => k.indexOf('transform:') < 0) &&
  abKfs.some(k => k.indexOf('scale:') >= 0), abKfs.length + ' kfs');

/* ===== G. Hit distinction ===== */
chk('g1 duration 차이(hit .18s < drain .34s)',
  inSrc('animation:sbReactAbyss .18s ease-out') &&
  inSrc('#stage .sb-abyss[data-reaction="drain"] .sb-react{animation:sbReactAbDrain .34s'), '');

chk('g2 주연 part 차이(hit=react 압축 / drain=void·주변 파츠 동반)',
  inSrc('@keyframes sbReactAbyss{0%{scale:1;translate:0 0}40%{scale:.958 .93;translate:0 1.6px}') &&
  inSrc('@keyframes sbReactAbDrain') &&
  !/data-reaction="hit"\] \.sb-ab-core::before/.test(src) &&
  !/data-reaction="hit"\] \.sb-aura/.test(src), '');

chk('g3 root recoil 차이(drain의 react 수축이 hit보다 얕음)',
  (function () {
    const hm = src.match(/@keyframes sbReactAbyss\{[\s\S]*?\}\}/);
    const dm = src.match(/@keyframes sbReactAbDrain\{[\s\S]*?\}\}/);
    if (!hm || !dm) return false;
    const hMin = Math.min.apply(null, (hm[0].match(/scale:\.(\d+)/g) || []).map(x => parseFloat('0.' + x.split('.')[1])));
    const dMin = Math.min.apply(null, (dm[0].match(/scale:\.(\d+)/g) || []).map(x => parseFloat('0.' + x.split('.')[1])));
    return hMin < dMin; // hit가 더 깊게 찌그러진다 = drain은 root recoil 거의 없음
  })(), '');

/* ===== H. Ambient coexistence ===== */
chk('h1 ★base 애니 보유 파츠에 reaction animation 0(교체 점프 0 — transition 개별 속성만)',
  !drainRules.some(r => {
    const sel = r.slice(0, r.indexOf('{'));
    return /\.(sb-aura|sb-ab-pool|sb-ab-shardL|sb-ab-shardR)\s*$/.test(sel.trim()) && r.indexOf('animation:') >= 0;
  }) &&
  !/data-reaction="drain"\][^{]*\.sb-ab-core\{[^}]*animation:/.test(src), '');

chk('h2 reaction animation은 base 없는 파츠에만(.sb-react·core::before·.sb-shadow)',
  inSrc('[data-reaction="drain"] .sb-react{animation:sbReactAbDrain') &&
  inSrc('[data-reaction="drain"] .sb-ab-core::before{animation:sbReactAbVoid') &&
  inSrc('[data-reaction="drain"] .sb-shadow{animation:sbReactAbGround'), '');

chk('h3 base ambient 선언 원문 보존(5종)',
  inSrc('#stage .sb-abyss .sb-fig{width:168px;height:118px;animation:sbAbFloat 6.4s ease-in-out infinite}') &&
  inSrc('animation:sbAbDrawIn 3.8s ease-in infinite') &&
  inSrc('animation:sbAbPool 5.6s ease-in-out infinite') &&
  inSrc('animation:sbAbShardL 5.2s ease-in-out infinite') &&
  inSrc('animation:sbAbShardR 7.1s ease-in-out infinite') &&
  inSrc('animation:sbAbCoreIn 4.4s ease-in-out infinite'), '');

chk('h4 enraged duration override 원문 보존(reaction과 무충돌 — 별도 속성)',
  inSrc('#stage .sb-abyss[data-state="enraged"] .sb-ab-core{filter:brightness(.9) saturate(1.35);animation-duration:3.1s}') &&
  inSrc('#stage .sb-abyss[data-state="enraged"] .sb-aura{animation-duration:2.7s}') &&
  inSrc('#stage .sb-abyss[data-state="enraged"] .sb-ab-shardL{animation-duration:3.9s}'), '');

chk('h5 transition 선언이 .sb-part 기본(transform .28s)을 보존한 채 확장',
  inSrc('#stage .sb-abyss .sb-aura{transition:transform .28s ease,scale .2s ease-out}') &&
  inSrc('#stage .sb-abyss .sb-ab-pool{transition:transform .28s ease,scale .2s ease-out}') &&
  inSrc('#stage .sb-part{position:absolute;display:block;transition:transform .28s ease}'), '');

/* ===== I. Lifecycle ===== */
chk('i1 기존 rail 재사용(drain 전용 timeout/listener 0·rail setTimeout 1개)',
  (railB.match(/setTimeout\(/g) || []).length === 1 &&
  evB.indexOf('setTimeout') < 0 && evB.indexOf('addEventListener') < 0 &&
  GEN.indexOf('setInterval') < 0 && GEN.indexOf('Math.random') < 0, '');

chk('i2 animationend 필터가 등록 어휘 전체 순회(drain anim 포함)',
  railB.indexOf('pp.reactions[k].anim===e.animationName') >= 0 &&
  railB.indexOf('SR_STAGE.bound[p.figId]') >= 0, '');

chk('i3 safety timeout > duration(.34s < 460ms)', inSrc('ms:460') && inSrc('.34s cubic-bezier(.25,.7,.35,1)'), '');

try {
  const g = fresh('shell_thirst');
  h.sb.srEventReaction('aoe');
  const g2 = s.createGame('shell_thirst'); g2.start(); setG(g2);
  s.stage.reset(g2.S); h.sb.sbBossState(g2.S);
  const a = stage.activeReaction(), st = stage.reactionStats();
  h.sb.CUR_BOSS = 'boss01';
  chk('i4 battle switch/newGame 경계 후 신선(active 초기화·추적 리셋)',
    a.key === '' && a.priority === -1 && st.lastDrainT === -1 && stage.lastReaction() === null, JSON.stringify(a));
} catch (e) { chk('i4 경계 cleanup(예외)', false, e.message); }

chk('i5 문맥 밖 cleanup(state+reaction 동시·보스별 cleanup 함수 0)',
  drvB.indexOf('clearActorPresence(p)') >= 0 &&
  capB.indexOf("setAttribute('data-reaction','')") >= 0 &&
  !inSrc('clearAbyssReaction') && !inSrc('srAbyssDrain'), '');

/* ===== J. 기존 screen FX 회귀 ===== */
chk('j1 기존 drain screen FX 원문(SFX/shake/vign 순서·강도 무변경)',
  inSrc("case 'aoe':SFX.aoe();shake();vign();") &&
  inSrc('#fxAoe{position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 55%,rgba(190,30,45,.26)'), '');

chk('j2 HP/MP presentation 원문(마나 로그·aoes 적재)',
  inSrc("L('🌊 '+B.sn+'이 마나를 삼킵니다 — 마나 '+Math.round(before-S.pri.mana)+' 소실 · 파티 '+d+' 피해','lb');") &&
  inSrc('S.st.aoes.push({t:S.t,tot:d*5,h0:S.st.heal,done:false});'), '');

chk('j3 신규 full-screen layer 0(fxAoe/fxAoeDecal 외 신규 0)',
  (src.match(/id="fxAoe"/g) || []).length === 1 && (src.match(/id="fxAoeDecal"/g) || []).length === 1 &&
  !inSrc('fxDrainVeil') && !inSrc('fxAbyssPull'), '');

chk('j4 F8A/F8B-1 계약 보존(hit·interrupted 어휘·배선)',
  inSrc("case 'allyAtk':bossHit();pulseStage(d.tg);srBossHit();break;") &&
  inSrc("case 'intOk':SFX.intOk();flashFrame('rog','rgba(255,215,106,.85)');srBossInterrupted();break;") &&
  inSrc("interrupted:{anim:'sbReactMgBreak',ms:440,priority:30,coalesce:0}") &&
  inSrc('sbFigPose(S);sbBossFigure(S);sbSupportCue(S);sbBossState(S);'), '');

/* ===== K. 회귀 ===== */
chk('k1 CORE에 F8B-2 토큰 0',
  !/srEventReaction|reactionEvents|sbReactAb(Drain|Void|Ground)/.test(core), '');

try {
  const m = s.smoke(), i = s.smoke('shell_iron'), t = s.smoke('shell_thirst');
  chk('k2 스모크 3종 불변(51.4/1029·48.5/971·61.8/1236)',
    m.t === 51.4 && m.steps === 1029 && i.t === 48.5 && i.steps === 971 && t.t === 61.8 && t.steps === 1236,
    m.t + '/' + m.steps + ' · ' + i.t + '/' + i.steps + ' · ' + t.t + '/' + t.steps);
} catch (e) { chk('k2 스모크(예외)', false, e.message); }
{
  const buf = fs.readFileSync(path.join(ROOT, 'index.html'));
  const cmd5 = crypto.createHash('md5').update(core).digest('hex');
  chk('k3 CORE byte-identical(466/22,521/6cad2ec2)',
    coreLines.length === 466 && Buffer.byteLength(core, 'utf8') === 22521 &&
    cmd5 === '6cad2ec271a2a79afbee881c2a2e0856', coreLines.length + '/' + cmd5.slice(0, 8));
  chk('k4 index.html 신 기준선(231,444 B · md5 34281b01…)',
    buf.length === 231444 &&
    crypto.createHash('md5').update(buf).digest('hex') === '34281b013d013542e18d9ea5429ab95d', buf.length + 'B');
}
chk('k5 docs/72 필수 절(truth·intent·distinction·trigger·false-positive·vocabulary·priority·동시성·swallow·inward·비대칭·ambient·enraged·generation·cleanup·등가·관측·Human Gate·F8B-3·F9)',
  doc.length > 6000 &&
  ['truth', 'intent', 'distinction', 'trigger', 'false-positive', 'vocabulary', 'priority',
   '동시성', 'swallow', 'inward', '비대칭', 'ambient', 'enraged', 'generation', 'cleanup',
   '등가', '관측', 'Human Gate', 'F8B-3', 'F9', '비변경'].every(t => doc.indexOf(t) >= 0), '');

console.log(`\n${fail === 0 ? '★ THIRST ABYSS DRAIN RESULT REACTION 01 CHECK PASS' : '★ THIRST ABYSS DRAIN RESULT REACTION 01 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
