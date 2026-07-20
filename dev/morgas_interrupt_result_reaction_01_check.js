'use strict';
// Morgas Interrupt Result Reaction 01 (F8B-1) 전용 검증
// 실행: node dev/morgas_interrupt_result_reaction_01_check.js
// A Truth · B Trigger · C Priority · D Four channels · E Visual contract · F Lifecycle · G 기존 F6 장면 · H 회귀.
// 원칙: 끊겼다는 사실을, 보스의 몸이 인정한다 — 차단 성공은 UI가 아니라 끊긴 몸으로 완성된다.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const DOC = path.join(ROOT, 'docs', '71_MORGAS_INTERRUPT_RESULT_REACTION_01.md');
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
const hitB = strip(fnBody('srBossHit'));
const intB = strip(fnBody('srBossInterrupted'));
const drvB = strip(fnBody('sbBossState'));
const capB = strip(fnBody('clearActorPresence'));
const clrB = strip(fnBody('srClearReaction'));
const tiB = strip(fnBody('tryInterrupt'));
const rfxB = strip(fnBody('renderFx'));
const GEN = railB + hitB + intB + drvB + capB + clrB;
// 모르가스 interrupted keyframes(합성 보장 검사)
const mgKfs = src.match(/@keyframes sbReactMg\w+\{[^}]*(\{[^}]*\}[^}]*)*\}/g) || [];
const coreLines = [];
{ let f = 0; for (const l of src.split('\n')) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) coreLines.push(l); } }
const core = coreLines.join('\n') + '\n';

/* ===== 하네스 ===== */
let h = null, s = null, stage = null;
try { h = require('./harness.js'); s = h.sb.window.__seedHealer; stage = s.stage; } catch (e) { console.log('HARNESS FAIL ' + e.message); }
function setG(g) { h.sb.__g = g; vm.runInContext('G=__g;', h.sb); }
function freshMorgas() { // 실 전투 준비(합성 0) — battle guard 확립
  h.sb.CUR_BOSS = 'boss01';
  const g = s.createGame('boss01'); g.start(); g.step(0.05); setG(g);
  s.stage.reset(g.S); h.sb.sbBossState(g.S);
  return g;
}

/* ===== A. Truth ===== */
// 실행 코드 기준으로 센다(주석의 설명 언급은 발화 지점이 아니다 — F8A g2와 같은 계보)
chk('a1 차단 성공 확정=tryInterrupt 성공 경로만 FX(intOk)(실패는 조기 return+intFail)',
  tiB.indexOf("S.st.ints.push({j,ok:1,asst});FX('intOk');") >= 0 &&
  tiB.indexOf("S.st.ints.push({j,ok:0,r});FX('intFail');") >= 0 &&
  (strip(src).match(/FX\('intOk'\)/g) || []).length === 1, '');

chk('a2 성공/실패 구분 truth(실패 3사유 전부 조기 return·성공만 cast=null 도달)',
  tiB.indexOf("if(!rog||!rog.alive){fail(") >= 0 &&
  tiB.indexOf('if(S.t<S.intReady){fail(') >= 0 &&
  tiB.indexOf('if(d){fail(') >= 0 &&
  tiB.indexOf('S.boss.cast=null;') > tiB.indexOf('if(d){fail('), '');

chk('a3 judge 시작≠성공(judge는 cast 설정+judgeWarn·성공은 cast 해제+intOk)',
  inSrc("S.boss.cast={kind:'judge',name:'어둠의 심판'") && inSrc("FX('judgeWarn')") &&
  inSrc('S.pendJ={t:S.t+0.8,j:ev.j}') &&
  inSrc("if(S.pendJ&&t>=S.pendJ.t){const j=S.pendJ.j;S.pendJ=null;if(S.boss.cast&&S.boss.cast.kind==='judge')tryInterrupt(j);}"), '');

chk('a4 ★데칼 소멸과 차단 성공은 동일 truth(성공이 cast=null → renderFx aoe false → 데칼/차단선 off)',
  rfxB.indexOf("var aoe=!!(bc&&bc.kind==='judge');") >= 0 &&
  rfxB.indexOf("fxToggle('fxAoe',aoe); fxToggle('fxAoeDecal',aoe);") >= 0 &&
  rfxB.indexOf("var intOn=!!(bc&&bc.kind==='judge'&&!bc.un&&rog&&rog.alive);") >= 0, '');

chk('a5 소비 지점=기존 doFx intOk case(SFX/flash 경로 보존·이벤트 소비 의미 무변경)',
  inSrc("case 'intOk':SFX.intOk();flashFrame('rog','rgba(255,215,106,.85)');srBossInterrupted();break;") &&
  (src.match(/\.ev\.splice\(0\)/g) || []).length === 1 &&
  (src.match(/sgObserve\(e,G\.S\);/g) || []).length === 1, '');

chk('a6 Stage Signal intOk 번역 무변경(source rog·target boss·result ok)',
  inSrc("case 'intOk': o.source='rog';o.target='boss';o.result={ok:true};break;") &&
  inSrc("case 'intFail': o.source='rog';o.target='boss';o.result={ok:false};break;"), '');

/* ===== B. Trigger ===== */
chk('b1 interrupted 어휘 등록=모르가스만(파쇄자/심연 미등록=무해 no-op)',
  inSrc("interrupted:{anim:'sbReactMgBreak',ms:440,priority:30,coalesce:0}") &&
  (function () {
    const m = stage.bossProfile('boss01'), i = stage.bossProfile('shell_iron'), a = stage.bossProfile('shell_thirst');
    return m.reactions.interrupted && !i.reactions.interrupted && !a.reactions.interrupted;
  })(), '');

chk('b2 reaction key=결과 의미 어휘(bossId/조합 문자열 0)',
  !inSrc('morgasInterrupted') && !inSrc('boss01Interrupted') && !inSrc("'interrupt-hit'") &&
  !inSrc('hit-interrupted') && !inSrc('enraged-interrupted') && !inSrc('weave-break') &&
  intB.indexOf("srTrigger('interrupted')") >= 0, '');

try { // 실 전투 진행 중 judge 창에서는 발화 0 — 성공 이벤트가 오기 전엔 몸이 반응하지 않는다.
  // (하네스 스텁엔 performance가 없어 doFx→legacy bossHit 경로를 태울 수 없다. 실 이벤트 E2E는 브라우저에서 수행:
  //  실 SCRIPT judge t=15 → pendJ 0.8s → tryInterrupt 성공 t=15.80에 interrupted 1회·데칼 동시 소멸 실측.)
  const g = freshMorgas();
  const b = stage.reactionStats();
  let judgeTicks = 0, firedDuringJudge = 0, steps = 0;
  while (!g.S.over && steps < 700) {
    g.step(0.05); steps++;
    const snap = stage.deriveSnapshot(g.S, g);
    if (snap.bossAction && snap.bossAction.kind === 'judge') {
      judgeTicks++;
      if (stage.reactionStats().interrupted > b.interrupted) firedDuringJudge++;
    }
  }
  h.sb.CUR_BOSS = 'boss01';
  chk('b3 judge 진행만으로는 발화 0(성공 이벤트 없이 tell/stance/line만으론 몸이 반응 안 함·judge ' + judgeTicks + ' ticks)',
    judgeTicks > 0 && firedDuringJudge === 0 && stage.reactionStats().interrupted === b.interrupted,
    'judgeTicks=' + judgeTicks + ' fired=' + firedDuringJudge);
} catch (e) { chk('b3 judge 무발화(예외)', false, e.message); }

try { // 일반 hit → interrupted 0 (어휘 분리·false-positive 0)
  const g = freshMorgas();
  const b = stage.reactionStats();
  h.sb.srBossHit();
  const afterHit = stage.reactionStats();
  h.sb.CUR_BOSS = 'boss01';
  chk('b4 일반 hit로 interrupted 발화 0(어휘 분리·false-positive 0)',
    afterHit.interrupted === b.interrupted && afterHit.hits > b.hits,
    'interrupted+' + (afterHit.interrupted - b.interrupted) + ' hits+' + (afterHit.hits - b.hits));
  // 실패(intFail)는 소비 지점 자체가 없다 — 코드에 srBossInterrupted 호출은 intOk case 1곳뿐.
  chk('b4b intFail 소비 지점 0(성공 case에서만 호출·호출 지점 정확히 1곳)',
    (strip(src).match(/srBossInterrupted\(\)/g) || []).length === 2 && // 정의 1 + intOk case 1
    !/case 'intFail'[^;]*srBossInterrupted/.test(src) &&
    inSrc("case 'intFail':SFX.intFail();vign();break;"), '');
} catch (e) { chk('b4 false-positive(예외)', false, e.message); }

try { // 미등록 보스(파쇄자)에서 intOk 소비 → 무해 no-op
  h.sb.CUR_BOSS = 'shell_iron';
  const g = s.createGame('shell_iron'); g.start(); g.step(0.05); setG(g);
  s.stage.reset(g.S); h.sb.sbBossState(g.S);
  const b = stage.reactionStats();
  h.sb.srBossInterrupted();
  const a2 = stage.reactionStats();
  h.sb.CUR_BOSS = 'boss01';
  chk('b5 interrupted 미등록 보스=무해 no-op(발화 0·예외 0)', a2.interrupted === b.interrupted, '');
} catch (e) { chk('b5 미등록 보스(예외)', false, e.message); }

chk('b6 CSS/데칼/pose 추측 경로 0(성공 판정은 이벤트만)',
  GEN.indexOf('fxAoe') < 0 && GEN.indexOf('getComputedStyle') < 0 &&
  GEN.indexOf('data-pose') < 0 && GEN.indexOf('classList') < 0 &&
  GEN.indexOf('bossAction') < 0 && GEN.indexOf('.indexOf(') <= GEN.length, '');

/* ===== C. Priority ===== */
chk('c1 priority=profile 데이터(interrupted 30 > hit 10)·generic은 숫자 비교만',
  inSrc('priority:30') && (src.match(/priority:10/g) || []).length === 3 &&
  railB.indexOf('pri<SR_STAGE.activePri') >= 0 &&
  railB.indexOf("==='interrupted'") < 0 && railB.indexOf("==='hit'") < 0, '');

chk('c2 generic reaction 코드에 reaction key literal 특수분기 0·bossId 분기 0',
  ['interrupted', 'hit', 'boss01', 'shell_iron', 'shell_thirst', 'boss_morgas', 'sbReactMgBreak']
    .every(t => railB.indexOf("'" + t + "'") < 0) &&
  railB.indexOf('switch(') < 0, '');

try {
  const g = freshMorgas();
  const b = stage.reactionStats();
  h.sb.srBossHit();
  const a1 = stage.activeReaction();
  h.sb.srBossInterrupted();          // hit active 중 interrupted → 우선권 획득
  const a2 = stage.activeReaction();
  for (let i = 0; i < 4; i++) g.step(0.05); // hit coalesce 창(0.12s) 밖으로 이동 — 병합이 아니라 '우선권'을 시험
  h.sb.srBossHit();                  // interrupted active 중 hit → 덮지 않음
  const a3 = stage.activeReaction();
  const st = stage.reactionStats();
  h.sb.CUR_BOSS = 'boss01';
  chk('c3 hit active 중 interrupted 우선권 획득(key/priority 교체)',
    a1.key === 'hit' && a1.priority === 10 && a2.key === 'interrupted' && a2.priority === 30, JSON.stringify(a2));
  chk('c4 interrupted active 중 hit가 덮지 않음(suppressed 계상)',
    a3.key === 'interrupted' && a3.priority === 30 && (st.suppressed - b.suppressed) === 1,
    'active=' + a3.key + ' suppressed+' + (st.suppressed - b.suppressed));
  // 하위 우선순위 hit는 '시각'만 양보하고 통계 접수는 별개다(gameplay 이벤트는 이미 doFx에서 소비 완료).
  // 접수 카운트는 창 밖 1회(첫 hit)만 증가하고, 억제된 2번째는 suppressed로 계상된다.
  chk('c5 gameplay hit 이벤트 손실 0(억제분은 suppressed로 계상·소실 0)',
    (st.hits - b.hits) === 1 && (st.suppressed - b.suppressed) === 1,
    'hits+' + (st.hits - b.hits) + ' suppressed+' + (st.suppressed - b.suppressed));
} catch (e) { chk('c3~c5 priority(예외)', false, e.message); }

/* ===== D. Four channels ===== */
chk('d1 reaction 코드가 pose/face/state/bossAction/decal/line을 직접 제거 0',
  GEN.indexOf("setAttribute('data-pose'") < 0 && GEN.indexOf("setAttribute('data-face'") < 0 &&
  GEN.indexOf('S.boss.cast') < 0 && GEN.indexOf('fxToggle') < 0 && GEN.indexOf('fxLn') < 0 &&
  clrB.indexOf("setAttribute('data-reaction','')") >= 0 && clrB.indexOf('data-state') < 0, '');

chk('d2 조합 문자열 0(reaction 값은 단일 어휘)',
  !/data-reaction="[a-z]+-[a-z]+"/.test(src) &&
  inSrc('[data-reaction="interrupted"]') && inSrc('[data-reaction="hit"]'), '');

chk('d3 state는 별도 채널 유지(enraged 규칙·presenter 무변경)',
  (src.match(/stateRules:\[\{state:'enraged',when:\{enraged:true\}\}\]/g) || []).length === 3 &&
  strip(fnBody('presentActorState')).indexOf('data-reaction') < 0, '');

/* ===== E. Visual contract ===== */
chk('e1 ★합성 보장: 모르가스 interrupted keyframes에 transform: 직서 0(개별 속성만)',
  mgKfs.length >= 3 && mgKfs.every(k => k.indexOf('transform:') < 0) &&
  mgKfs.some(k => k.indexOf('translate:') >= 0) && mgKfs.some(k => k.indexOf('rotate:') >= 0), mgKfs.length + ' kfs');

chk('e2 body axis collapse + float drop(횡 이동+회전+아래로)',
  inSrc('@keyframes sbReactMgBreak{0%{translate:0 0;rotate:0deg}') &&
  inSrc('18%{translate:-5px 4px;rotate:-5.5deg}') &&
  inSrc('42%{translate:-3.5px 5px;rotate:-4deg}'), '');

chk('e3 thread slack(실이 늘어졌다 회복·opacity 감소·몸보다 늦게)',
  inSrc('@keyframes sbReactMgThreadSlack') &&
  inSrc('22%{translate:-1px 5px;rotate:-9deg;opacity:.72}') &&
  inSrc('100%{translate:0 0;rotate:0deg;opacity:1}}'), '');

chk('e4 mask dip(가면이 아래로 꺾임)',
  inSrc('@keyframes sbReactMgMaskDip') && inSrc('24%{translate:-1px 3px;rotate:-4deg}'), '');

chk('e5 일반 hit와 구분(더 길고·더 깊고·실/가면 동반)',
  inSrc('animation:sbReactMgBreak .34s') && inSrc('animation:sbReactMorgas .16s') &&
  inSrc('#stage .sb-morgas[data-reaction="interrupted"] .sb-mg-threads{animation:sbReactMgThreadSlack') &&
  inSrc('#stage .sb-morgas[data-reaction="interrupted"] .sb-mg-head{animation:sbReactMgMaskDip') &&
  !/data-reaction="hit"\] \.sb-mg-threads/.test(src), '');

chk('e6 신규 DOM/particle/action line/full-screen FX 0',
  (src.match(/id="sb-morgas-fig"/g) || []).length === 1 &&
  (src.match(/<line id="fx/g) || []).length === 3 &&
  !inSrc('sb-mg-burst') && !inSrc('fxInterrupt') && !inSrc('sbMgParticle') &&
  !/\[data-reaction="interrupted"\][^{]*position:fixed/.test(src), '');

chk('e7 무한 애니/난수 0·기존 float 이어짐(fig 애니 무변경)',
  !/sbReactMg\w+ [^;}]*infinite/.test(src) && GEN.indexOf('Math.random') < 0 &&
  inSrc('#stage .sb-morgas .sb-fig{width:120px;height:198px;animation:sbMgDrift 5.2s ease-in-out infinite}'), '');

/* ===== F. Lifecycle ===== */
chk('f1 기존 owner 재사용(신규 timeout owner 0·rail의 setTimeout 1개·setInterval 0)',
  (railB.match(/setTimeout\(/g) || []).length === 1 &&
  intB.indexOf('setTimeout') < 0 && intB.indexOf('addEventListener') < 0 &&
  GEN.indexOf('setInterval') < 0, '');

chk('f2 generation + animationend(등록 어휘 전체 필터) + 안전망 gen 가드',
  railB.indexOf('SR_STAGE.gen++') >= 0 &&
  railB.indexOf('pp.reactions[k].anim===e.animationName') >= 0 &&
  railB.indexOf('if(gen===SR_STAGE.gen)') >= 0, '');

chk('f3 duplicate listener 0(figId 1회 바인딩 가드)',
  railB.indexOf('SR_STAGE.bound[p.figId]') >= 0 && railB.indexOf('SR_STAGE.bound[p.figId]=true') >= 0, '');

chk('f4 interrupted 병합 없음(1 success=1 reaction·coalesce 0)',
  inSrc('interrupted:{anim:\'sbReactMgBreak\',ms:440,priority:30,coalesce:0}') &&
  railB.indexOf('win>0&&sameBattle') >= 0, '');

chk('f5 safety timeout > CSS duration(0.34s 애니 < 440ms 상한)',
  inSrc('animation:sbReactMgBreak .34s') && inSrc('ms:440'), '');

try { // battle 경계 cleanup
  const g = freshMorgas();
  h.sb.srBossInterrupted();
  const g2 = s.createGame('boss01'); g2.start(); setG(g2);
  s.stage.reset(g2.S); h.sb.sbBossState(g2.S);
  const a = stage.activeReaction(), st = stage.reactionStats();
  h.sb.CUR_BOSS = 'boss01';
  chk('f6 battle switch/newGame 경계 후 신선(active 초기화·추적 리셋)',
    a.key === '' && a.priority === -1 && st.lastInterruptT === -1 && stage.lastReaction() === null, JSON.stringify(a));
} catch (e) { chk('f6 경계 cleanup(예외)', false, e.message); }

/* ===== G. 기존 F6 장면 회귀 ===== */
chk('g1 rogue interrupt pose rule 무변경',
  inSrc("poseRules:[{pose:'interrupt',when:{actorAlive:true,bossActionKind:'judge',interruptStance:'ready'}}]") &&
  inSrc('#stage .sb-rogue[data-pose="interrupt"] .sb-r-dagger'), '');

chk('g2 decal pop disappearance 경로 무변경(fxToggle 원문·별도 delay 0)',
  inSrc("fxToggle('fxAoe',aoe); fxToggle('fxAoeDecal',aoe);") &&
  intB.indexOf('setTimeout') < 0, '');

chk('g3 interrupt line 무변경(fxLn 원문·anchor 경유)',
  inSrc("fxLn('fxIntLine',A.rog,A.boss,intOn,'fxInt'+(branded?' broken':''));") &&
  inSrc("resolveActiveBossAnchor('avatar')||resolveAnchor('boss','avatar')"), '');

chk('g4 judge/tell/weave 로직 무변경',
  inSrc("poseRules:[{pose:'weave',when:{bossActionKind:'judge'}}]") &&
  inSrc("faceRules:[{face:'tell',when:{bossActionKind:'judge'}}]") &&
  inSrc('#stage .sb-morgas[data-pose="weave"] .sb-react{transform:translateY(-2px) rotate(1.5deg)}') &&
  inSrc('#stage .sb-morgas[data-face="tell"] .sb-mg-eyes'), '');

chk('g5 interrupt 판정/타이밍 gameplay 무변경(intCd·pendJ 0.8·judgeCast 2.5)',
  inSrc('S.intReady=S.t+CFG.intCd;') && inSrc('S.pendJ={t:S.t+0.8,j:ev.j}') &&
  inSrc('judge:180, enJudge:225, judgeCast:2.5'), '');

/* ===== H. Gameplay Boundary / 회귀 ===== */
chk('h1 F8B-1 코드 gameplay 쓰기 0(S/G 대입 0·splice 0)',
  !/\bS\.\w+\s*=[^=]/.test(GEN) && !/\bG\.\w+\s*=[^=]/.test(GEN) && GEN.indexOf('.splice') < 0, '');

chk('h2 CORE에 F8B-1 토큰 0',
  !/srTrigger|srBossInterrupted|sbReactMg|interrupted/.test(core), '');

chk('h3 F8A 채널/rail 계약 보존(4채널·state·hit 어휘)',
  inSrc('sbFigPose(S);sbBossFigure(S);sbSupportCue(S);sbBossState(S);') &&
  inSrc("case 'allyAtk':bossHit();pulseStage(d.tg);srBossHit();break;") &&
  hitB.indexOf("srTrigger('hit')") >= 0, '');

chk('h4 anchor/actor 등록 무변경(F8B-1 확장 0)',
  stage.actors().join(',') === 'boss_iron,boss_morgas,boss_abyss,war,rog,mage,sham' &&
  JSON.stringify(stage.anchors()) === JSON.stringify(['boss_iron', 'war', 'rog', 'mage', 'sham', 'boss_morgas', 'boss', 'pri']), '');

try {
  const m = s.smoke(), i = s.smoke('shell_iron'), t = s.smoke('shell_thirst');
  chk('h5 스모크 3종 불변(51.4/1029·48.5/971·61.8/1236)',
    m.t === 51.4 && m.steps === 1029 && i.t === 48.5 && i.steps === 971 && t.t === 61.8 && t.steps === 1236,
    m.t + '/' + m.steps + ' · ' + i.t + '/' + i.steps + ' · ' + t.t + '/' + t.steps);
} catch (e) { chk('h5 스모크(예외)', false, e.message); }
{
  const buf = fs.readFileSync(path.join(ROOT, 'index.html'));
  const cmd5 = crypto.createHash('md5').update(core).digest('hex');
  chk('h6 CORE byte-identical(466/22,521/6cad2ec2)',
    coreLines.length === 466 && Buffer.byteLength(core, 'utf8') === 22521 &&
    cmd5 === '6cad2ec271a2a79afbee881c2a2e0856', coreLines.length + '/' + cmd5.slice(0, 8));
  chk('h7 index.html 신 기준선(231,444 B · md5 34281b01…)',
    buf.length === 231444 &&
    crypto.createHash('md5').update(buf).digest('hex') === '34281b013d013542e18d9ea5429ab95d', buf.length + 'B');
}
chk('h8 docs/71 필수 절(truth·decal·ordering·rail·vocabulary·priority·trigger·false-positive·동시성·transform·collapse·slack·generation·cleanup·등가·관측·Human Gate·F8B-2·F9)',
  doc.length > 6000 &&
  ['truth', 'decal', 'ordering', 'rail', 'vocabulary', 'priority', 'trigger', 'false-positive',
   '동시성', 'transform', 'collapse', 'slack', 'generation', 'cleanup', '등가', '관측',
   'Human Gate', 'F8B-2', 'F9', '비변경'].every(t => doc.indexOf(t) >= 0), '');

console.log(`\n${fail === 0 ? '★ MORGAS INTERRUPT RESULT REACTION 01 CHECK PASS' : '★ MORGAS INTERRUPT RESULT REACTION 01 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
