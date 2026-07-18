'use strict';
// Boss Enrage & Hit Reaction Grammar 01 (F8A) 전용 검증
// 실행: node dev/boss_enrage_hit_reaction_grammar_01_check.js
// A Truth Audit · B State Channel · C Reaction Channel · D Coalescing · E Transform Ownership
// · F 파쇄자 · G 모르가스 · H 심연 · I Cleanup · J Gameplay Boundary · K 회귀.
// 원칙: 숫자가 피해를 말하고, 몸이 충격을 증명한다 — 파쇄자는 버티고, 모르가스는 꺾이고, 심연은 삼킨다.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const DOC = path.join(ROOT, 'docs', '70_BOSS_ENRAGE_HIT_REACTION_GRAMMAR_01.md');
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
const rasB = strip(fnBody('resolveActorState'));
const pasB = strip(fnBody('presentActorState'));
const srcB = strip(fnBody('srClearReaction'));
const capB = strip(fnBody('clearActorPresence'));
const hitB = strip(fnBody('srBossHit'));
const drvB = strip(fnBody('sbBossState'));
const F8A = rasB + pasB + srcB + capB + hitB + drvB;
const cdB = strip(fnBody('sgPoseCond'));
const snB = strip(fnBody('sgSnapshot'));
// sbReact* keyframes 원문(합성 보장 검사용)
const reactKfs = src.match(/@keyframes sbReact\w+\{[^}]*(\{[^}]*\}[^}]*)*\}/g) || [];
const coreLines = [];
{ let f = 0; for (const l of src.split('\n')) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) coreLines.push(l); } }
const core = coreLines.join('\n') + '\n';

/* ===== 하네스 ===== */
let h = null, s = null, stage = null;
try { h = require('./harness.js'); s = h.sb.window.__seedHealer; stage = s.stage; } catch (e) { console.log('HARNESS FAIL ' + e.message); }
function setG(g) { h.sb.__f8aG = g; vm.runInContext('G=__f8aG;', h.sb); }

/* ===== A. Truth Audit ===== */
chk('a1 enrage truth=단일 저장(S.boss.enraged)·3보스 SCRIPT 공통(t55/60/56)·종료 없음',
  inSrc('S.boss.enraged=true;') && (src.match(/S\.boss\.enraged=true/g) || []).length === 1 &&
  inSrc("{t:60,e:'enrage'},") && inSrc("{t:55,e:'enrage'},") && inSrc("{t:56,e:'enrage'},") &&
  inSrc('boss:{hp:B.hp,max:B.hp,cast:null,enraged:false'), '');

chk('a2 snapshot enraged=기존 pure field 재사용(F8A의 snapshot 확장 0)',
  inSrc('enraged:S.boss.enraged,valorActive:t<S.valorUntil') &&
  snB.indexOf('data-state') < 0 && snB.indexOf('reaction') < 0 && snB.indexOf('sbReact') < 0, '');

chk('a3 hit truth=보스 HP 감소 단일 경로 + 직후 기존 read-only 이벤트 FX(allyAtk)',
  (src.match(/S\.boss\.hp=Math\.max\(0,S\.boss\.hp-/g) || []).length === 1 &&
  inSrc("FX('allyAtk',{tg:a.id});"), '');

chk('a4 소비 지점=기존 doFx allyAtk case(legacy bossHit 경로 보존·초기 HP/스위치 오인 구조적 0=이벤트만 소비)',
  inSrc("case 'allyAtk':bossHit();pulseStage(d.tg);srBossHit();break;"), '');

chk('a5 legacy enr 경로 존치(#bossAvatar.enr·sC 토글 무변경)',
  inSrc('#bossAvatar.enr{filter:drop-shadow(0 0 16px rgba(255,60,80,.85))}') &&
  inSrc("sC(ba,'enr',S.boss.enraged);"), '');

chk('a6 gameplay 이벤트 소비 무변경(splice 1곳·tap 1곳·seedOnHit 원위치)',
  (src.match(/\.ev\.splice\(0\)/g) || []).length === 1 &&
  (src.match(/sgObserve\(e,G\.S\);/g) || []).length === 1 && inSrc('seedOnHit(e.tg)'), '');

/* ===== B. State Channel ===== */
chk('b1 sgPoseCond enraged 키=정확히 1개(발주 §5)·순수 읽기·기존 키 5종 무변',
  (cdB.match(/k==='enraged'/g) || []).length === 1 &&
  cdB.indexOf('snap.enraged') >= 0 && !/\bS\.\w+\s*=[^=]/.test(cdB) &&
  cdB.indexOf('valorActive') >= 0 && cdB.indexOf('interruptStance') >= 0 &&
  cdB.indexOf('battleActive') >= 0 && cdB.indexOf('bossActing') >= 0 && cdB.indexOf('bossActionKind') >= 0, '');

chk('b2 3보스 profile state 데이터(allowedStates enraged·stateRules·candidateStates 보존)',
  (src.match(/allowedStates:\['enraged'\]/g) || []).length === 3 &&
  (src.match(/stateRules:\[\{state:'enraged',when:\{enraged:true\}\}\]/g) || []).length === 3 &&
  (src.match(/candidateStates:\['groggy','defeated'\]/g) || []).length === 3, '');

chk('b3 generic resolveActorState=bossId/state 이름 literal 분기 0·sgPoseCond 재사용',
  rasB.indexOf('sgPoseCond(r.when||{},snap,profile)') >= 0 &&
  ['shell_iron', 'boss01', 'shell_thirst', 'boss_iron', 'boss_morgas', 'boss_abyss', 'enraged', 'hit']
    .every(t => rasB.indexOf("'" + t + "'") < 0) && rasB.indexOf('switch(') < 0, '');

try { // 심연 실 truth: t<56 default → t>56 enraged (합성 0)
  h.sb.CUR_BOSS = 'shell_thirst';
  const g = s.createGame('shell_thirst'); g.start(); setG(g);
  let pre = '', post = '', preN = 0, postN = 0;
  while (!g.S.over) {
    g.step(0.05);
    const r = stage.bossState('shell_thirst', stage.deriveSnapshot(g.S, g)).state;
    if (g.S.t < 56) { if (r) pre = r; preN++; } else if (g.S.t > 56.2) { post = r; postN++; }
  }
  h.sb.CUR_BOSS = 'boss01';
  chk('b4 심연 실 전투 enrage(t<56 상시 default·t>56 enraged·' + preN + '/' + postN + ' ticks)',
    pre === '' && post === 'enraged' && preN > 1000 && postN > 50, 'pre=[' + pre + '] post=[' + post + ']');
} catch (e) { chk('b4 심연 실 enrage(예외)', false, e.message); }

try { // 파쇄자/모르가스: 스모크가 enrage 도달 전 종료(48.5<55·51.4<60) → 합성 확인(F4 d3 선례)
  h.sb.CUR_BOSS = 'shell_iron';
  const g = s.createGame('shell_iron'); g.start(); g.step(0.05); setG(g);
  const sav = g.S.boss.enraged; g.S.boss.enraged = true;
  const on = stage.bossState('shell_iron', stage.deriveSnapshot(g.S, g)).state;
  g.S.boss.enraged = sav;
  const off = stage.bossState('shell_iron', stage.deriveSnapshot(g.S, g));
  h.sb.CUR_BOSS = 'boss01';
  chk('b5 파쇄자 enraged true→enraged·false→default(모르가스 동일 규칙 공유)',
    on === 'enraged' && off.state === '' && off.reason === 'default', on + '/' + off.state);
} catch (e) { chk('b5 파쇄자 state(예외)', false, e.message); }

chk('b6 미등록/불허 안전 fallback + presenter는 data-state만(idempotent)',
  (function () {
    const u = stage.bossState('ghost_boss', null);
    return u.state === '' && u.reason === 'unregistered' &&
      pasB.indexOf("getAttribute('data-state')!==s") >= 0 && pasB.indexOf('data-reaction') < 0 &&
      pasB.indexOf('data-pose') < 0 && pasB.indexOf('data-face') < 0 &&
      rasB.indexOf("reason:'not-allowed'") >= 0;
  })(), '');

/* ===== C. Reaction Channel ===== */
chk('c1 3보스 reactions 선언(anim 정본+ms 안전망·조합 문자열 0)',
  inSrc("reactions:{hit:{anim:'sbReactIron',ms:320}}") &&
  inSrc("reactions:{hit:{anim:'sbReactMorgas',ms:300}}") &&
  inSrc("reactions:{hit:{anim:'sbReactAbyss',ms:320}}") &&
  !inSrc('enraged-hit') && !inSrc("reaction:'enragedHit'"), '');

chk('c2 srBossHit=활성 profile만·미등록/미선언/미지 shell=무해 no-op·bossId 분기 0',
  hitB.indexOf('resolveBossStageProfile(sgBossId())') >= 0 &&
  hitB.indexOf('!p||!p.reactions||!p.reactions.hit') >= 0 &&
  hitB.indexOf('resolveBossFigureShell(p)') >= 0 &&
  ['shell_iron', 'boss01', 'shell_thirst', 'sbReactIron', 'sbReactMorgas', 'sbReactAbyss']
    .every(t => hitB.indexOf("'" + t + "'") < 0), '');

try { // 실 카운팅(하네스): 접수/coalescing/미등록 no-op
  h.sb.CUR_BOSS = 'shell_iron';
  const g = s.createGame('shell_iron'); g.start(); g.step(0.05); setG(g);
  s.stage.reset(g.S); h.sb.sbBossState(g.S);
  const s0 = stage.reactionStats();
  h.sb.srBossHit(); h.sb.srBossHit();               // 같은 t → 1 hit + 1 coalesced
  for (let i = 0; i < 4; i++) g.step(0.05);          // +0.2s > 0.12 창
  h.sb.srBossHit();
  const s1 = stage.reactionStats();
  h.sb.CUR_BOSS = 'ghost_boss'; h.sb.srBossHit();
  const s2 = stage.reactionStats();
  h.sb.CUR_BOSS = 'boss01';
  chk('c3 hit 접수 계약(창 밖 2회 접수·창 안 1회 병합)', s1.hits - s0.hits === 2 && s1.coalesced - s0.coalesced === 1,
    'hits+' + (s1.hits - s0.hits) + ' coalesced+' + (s1.coalesced - s0.coalesced));
  chk('c4 미등록 boss=무해 no-op(접수/병합 무변)', s2.hits === s1.hits && s2.coalesced === s1.coalesced, '');
  chk('c5 lastReaction 관측(actorId/gen/t·복사본)', (function () {
    const l = stage.lastReaction();
    return l && l.actorId === 'boss_iron' && l.reaction === 'hit' && typeof l.gen === 'number';
  })(), '');
} catch (e) { chk('c3~c5 reaction 카운팅(예외)', false, e.message); }

chk('c6 lifecycle=F4A 패턴(animationend 1회 바인딩 bound 가드·main anim 이름 필터·gen 안전망 timeout·restart reflow)',
  hitB.indexOf('SR_STAGE.bound[p.figId]') >= 0 && hitB.indexOf("addEventListener('animationend'") >= 0 &&
  hitB.indexOf('e.animationName===pp.reactions.hit.anim') >= 0 &&
  hitB.indexOf('if(gen===SR_STAGE.gen)srClearReaction(p)') >= 0 &&
  hitB.indexOf('void fig.offsetWidth') >= 0, '');

chk('c7 접수와 표현 분리(통계는 DOM 부재에도 창 계약 유지·표현만 무해 생략)',
  hitB.indexOf('SR_STAGE.hits++') < hitB.indexOf('document.getElementById(p.figId)'), '');

/* ===== D. Coalescing ===== */
chk('d1 게임시간 창 0.12s(벽시계 아님=frozen-tab 안전·같은 battle 한정)',
  hitB.indexOf("(t-SR_STAGE.lastHitT)<0.12") >= 0 &&
  hitB.indexOf('SR_STAGE.battle===SG.battle') >= 0 &&
  hitB.indexOf('performance.now') < 0, '');

chk('d2 reaction duration 계약(130~190ms·안전망 ms>duration)',
  inSrc('animation:sbReactIron .18s ease-out') && inSrc('animation:sbReactMorgas .16s ease-out') &&
  inSrc('animation:sbReactAbyss .18s ease-out') &&
  inSrc('ms:320') && inSrc('ms:300'), '');

chk('d3 무한/반복 장치 0(setInterval 0·Math.random 0·infinite reaction 0)',
  F8A.indexOf('setInterval') < 0 && F8A.indexOf('Math.random') < 0 &&
  !/sbReact\w+ [^;}]*infinite/.test(src), '');

chk('d4 setTimeout=srBossHit 안전망 1개뿐(owner+gen 가드)',
  (hitB.match(/setTimeout\(/g) || []).length === 1 &&
  rasB.indexOf('setTimeout') < 0 && drvB.indexOf('setTimeout') < 0 && capB.indexOf('setTimeout') < 0, '');

/* ===== E. Transform Ownership ===== */
chk('e1 ★합성 보장: sbReact* keyframes에 transform: 직서 0(개별 속성 translate/rotate/scale만)',
  reactKfs.length >= 5 && reactKfs.every(k => k.indexOf('transform:') < 0) &&
  reactKfs.some(k => k.indexOf('translate:') >= 0) && reactKfs.some(k => k.indexOf('scale:') >= 0), reactKfs.length + ' kfs');

chk('e2 pose CSS 무변경(windup/weave/guard/brace/channel/sustain 원문)',
  inSrc('#stage .sb-iron-crusher[data-pose="windup"] .sb-react{transform:rotate(-3deg) translateY(-2px)}') &&
  inSrc('#stage .sb-morgas[data-pose="weave"] .sb-react{transform:translateY(-2px) rotate(1.5deg)}') &&
  inSrc('#stage .sb-warrior[data-pose="guard"] .sb-react{transform:translateX(4px)}') &&
  inSrc('#stage .sb-shaman[data-pose="sustain"] .sb-react{transform:scale(1.01)}'), '');

chk('e3 .sb-fit 무변경(F8A가 fit에 규칙 추가 0)·기반 계층 정의 원문',
  !/data-(state|reaction)[^{]*\.sb-fit/.test(src) &&
  inSrc('#stage .sb-react{transform-origin:50% 92%;transition:transform .28s ease}') &&
  inSrc('#stage .sb-fit{transform-origin:50% 100%}'), '');

chk('e4 base 애니 보유 파츠에 hit 애니 추가 0(교체 깜빡임 방지 — core/threads/pool/shard/aura 제외·react+무애니 파츠만)',
  !/data-reaction="hit"[^{]*\.sb-ic-core/.test(src) && !/data-reaction="hit"[^{]*\.sb-mg-threads/.test(src) &&
  !/data-reaction="hit"[^{]*\.sb-ab-(pool|core|shard)/.test(src) && !/data-reaction="hit"[^{]*\.sb-aura/.test(src) &&
  inSrc('#stage .sb-iron-crusher[data-reaction="hit"] .sb-ic-hammer{animation:sbReactIronHammer') &&
  inSrc('#stage .sb-morgas[data-reaction="hit"] .sb-mg-head{animation:sbReactMgHead'), '');

chk('e5 F8A CSS는 pose 어휘보다 앞(속성 충돌 시 pose 우선 — enraged 주기 가속이 weave 1.4s를 덮지 않음)',
  src.indexOf('F8A: Boss Enrage & Hit Reaction Grammar 01 (docs/70)') <
  src.indexOf('/* 포즈 어휘 (연결분만: 전사 guard/brace · 파쇄자 windup) */') &&
  src.indexOf('[data-state="enraged"] .sb-mg-threads') < src.indexOf('[data-pose="weave"] .sb-mg-threads'), '');

/* ===== F. 파쇄자 ===== */
chk('f1 enrage 연기=열이 오른 갑옷(core/body/aura filter·호흡 주기만·크기/형태 무변)',
  inSrc('#stage .sb-iron-crusher[data-state="enraged"] .sb-ic-core{filter:brightness(1.42) saturate(1.3)}') &&
  inSrc('#stage .sb-iron-crusher[data-state="enraged"] .sb-ic-body{filter:drop-shadow(0 0 7px rgba(255,140,58,.38))}') &&
  inSrc('#stage .sb-iron-crusher[data-state="enraged"] .sb-fig{animation-duration:4.1s}') &&
  !/data-state="enraged"[^{]*sb-iron[^{]*\{[^}]*scale/.test(src), '');

chk('f2 hit 연기=무겁게 버팀(후퇴 3.5px·hammer 반 박자 lag 45% 지연 시작)',
  inSrc('@keyframes sbReactIron{0%{translate:0 0}35%{translate:-3.5px .5px}') &&
  inSrc('@keyframes sbReactIronHammer{0%,45%{translate:0 0}'), '');

chk('f3 smash tell/행동선 보존(windup CSS·sbSmashFx 요청·fxSmash 문법 원문)',
  inSrc('#stage .sb-iron-crusher[data-pose="windup"] .sb-ic-hammer{transform:rotate(-18deg) translate(2px,-18px)}') &&
  inSrc("resolveAnchor('boss_iron','weapon')") && inSrc('#fxSvg line.fxSmash{stroke:#7d5a34'), '');

chk('f4 face tell 보존(F5 이관 규칙 원문)',
  inSrc('#stage .sb-iron-crusher[data-face="tell"] .sb-ic-head{transform:translateX(calc(-50% - 3px)) rotate(-3deg)}'), '');

/* ===== G. 모르가스 ===== */
chk('g1 enrage 연기=눈과 실이 팽팽(eyes/threads filter·주기 가속·부유 불안정·tell box-shadow와 속성 분리)',
  inSrc('#stage .sb-morgas[data-state="enraged"] .sb-mg-eyes{filter:brightness(1.6) drop-shadow(0 0 5px rgba(176,108,240,.8))}') &&
  inSrc('#stage .sb-morgas[data-state="enraged"] .sb-mg-threads{filter:brightness(1.25);animation-duration:2.2s}') &&
  inSrc('#stage .sb-morgas[data-state="enraged"] .sb-fig{animation-duration:4.2s}'), '');

chk('g2 hit 연기=가늘게 꺾임(횡 snap+rotate·가면 recoil·실 완전 풀림 0)',
  inSrc('@keyframes sbReactMorgas{0%{translate:0 0;rotate:0deg}35%{translate:4px -1px;rotate:1.6deg}') &&
  inSrc('@keyframes sbReactMgHead{0%{translate:0 0}38%{translate:1.5px .5px}'), '');

chk('g3 interrupt decal pop 경로 무변경(나라님 F6 승인 감각)',
  inSrc("var aoe=!!(bc&&bc.kind==='judge');") &&
  inSrc("fxToggle('fxAoe',aoe); fxToggle('fxAoeDecal',aoe);") &&
  inSrc("fxLn('fxIntLine',A.rog,A.boss,intOn,'fxInt'+(branded?' broken':''));"), '');

chk('g4 weave/tell 규칙·도적 rule 무변경',
  inSrc("poseRules:[{pose:'weave',when:{bossActionKind:'judge'}}]") &&
  inSrc("faceRules:[{face:'tell',when:{bossActionKind:'judge'}}]") &&
  inSrc("poseRules:[{pose:'interrupt',when:{actorAlive:true,bossActionKind:'judge',interruptStance:'ready'}}]"), '');

/* ===== H. 심연 ===== */
chk('h1 enrage 연기=공허가 깊어짐(주기 가속+어두운 filter·밖으로 폭발/flash 0)',
  inSrc('#stage .sb-abyss[data-state="enraged"] .sb-ab-core{filter:brightness(.9) saturate(1.35);animation-duration:3.1s}') &&
  inSrc('#stage .sb-abyss[data-state="enraged"] .sb-ab-shardL{animation-duration:3.9s}') &&
  inSrc('#stage .sb-abyss[data-state="enraged"] .sb-ab-shardR{animation-duration:5.3s}') &&
  !/data-state="enraged"[^{]*sb-ab[^{]*\{[^}]*brightness\(1\.[5-9]/.test(src), '');

chk('h2 hit 연기=충격을 안으로 삼킴(scale 수축+하강·outward burst 0)',
  inSrc('@keyframes sbReactAbyss{0%{scale:1;translate:0 0}40%{scale:.958 .93;translate:0 1.6px}') &&
  !/@keyframes sbReactAbyss\{[^}]*scale:1\.[1-9]/.test(src), '');

chk('h3 drain 가짜 tell 여전히 0(F7 계약 보존·state/reaction이 cast 예고로 오용 0)',
  !inSrc('sb-ab-cast') && !inSrc('sb-ab-tell') && !inSrc('sb-ab-windup') &&
  !/S\.boss\.cast=\{kind:'drain'/.test(src) &&
  inSrc('poseRules:[]') && !/stateRules:\[\{state:'enraged',when:\{bossActionKind/.test(src), '');

chk('h4 얼굴 생성 0(심연 faceParts 부재 유지·face reaction 0)',
  !/sb-ab-(eye|mouth|face|head)/.test(src) &&
  !/data-reaction="hit"[^{]*\.sb-mg-eyes/.test(src), '');

/* ===== I. Cleanup ===== */
chk('i1 battle 경계 hard clear(sbBossState의 SG.battle 가드→전 등록 보스 reaction 제거·추적 리셋)',
  drvB.indexOf('SG.battle!==SR_STAGE.battle') >= 0 &&
  drvB.indexOf('SR_STAGE.lastHitT=-1') >= 0 && drvB.indexOf('srClearReaction(bp)') >= 0, '');

chk('i2 문맥 밖=state/reaction 동시 제거(clearActorPresence·F5 owner 규약)',
  drvB.indexOf('clearActorPresence(p)') >= 0 &&
  capB.indexOf("setAttribute('data-state','')") >= 0 && capB.indexOf("setAttribute('data-reaction','')") >= 0, '');

chk('i3 보스별 cleanup/driver 함수 0(generic 단일 소유)',
  !inSrc('clearIronReaction') && !inSrc('clearMorgasReaction') && !inSrc('clearAbyssReaction') &&
  !inSrc('srIronHit') && !inSrc('srMorgasHit') && !inSrc('srAbyssHit'), '');

chk('i4 render 배선(sbSupportCue 뒤 sbBossState — 기존 사슬 원문 보존)',
  inSrc('sbFigPose(S);sbBossFigure(S);sbSupportCue(S);sbBossState(S);'), '');

try { // battle 경계 실측: reset 후 추적 신선
  h.sb.CUR_BOSS = 'shell_iron';
  const g = s.createGame('shell_iron'); g.start(); setG(g);
  s.stage.reset(g.S); h.sb.sbBossState(g.S);
  h.sb.srBossHit();
  const g2 = s.createGame('shell_iron'); g2.start(); setG(g2);
  s.stage.reset(g2.S); h.sb.sbBossState(g2.S);
  const st2 = stage.reactionStats();
  h.sb.CUR_BOSS = 'boss01';
  chk('i5 newGame/boss switch 경계 후 신선(lastHitT -1·last null)', st2.lastHitT === -1 && stage.lastReaction() === null, '');
} catch (e) { chk('i5 경계 실측(예외)', false, e.message); }

/* ===== J. Gameplay Boundary ===== */
chk('j1 F8A 함수 gameplay 쓰기 0(S/G 대입 0·dmg/heal 0)',
  !/\bS\.\w+\s*=[^=]/.test(F8A) && !/\bG\.\w+\s*=[^=]/.test(F8A) &&
  F8A.indexOf('dmg(') < 0 && F8A.indexOf('heal(') < 0 && F8A.indexOf('.splice') < 0, '');

chk('j2 CORE에 F8A 토큰 0(gameplay가 state/reaction 이름을 모름)',
  !/SR_STAGE|sbBossState|srBossHit|resolveActorState|data-state|data-reaction|sbReact/.test(core), '');

chk('j3 F5/F6/F7 generic 무수정(resolve/present/clear 계보 원문 존치)',
  inSrc('function resolveBossStageProfile(bossId)') && inSrc('function resolveBossFace(profile,snap)') &&
  inSrc('function presentBossFigure(profile,resolved)') && inSrc('function clearBossFigure(profile)') &&
  inSrc('function resolveActiveBossAnchor(anchorName)') && inSrc('function sbStageContext()') &&
  strip(fnBody('resolveBossFace')).indexOf('SR_STAGE') < 0 &&
  strip(fnBody('sbBossFigure')).indexOf('data-state') < 0, '');

chk('j4 F4A cue 무변경(경계/발화/배선 계약)',
  inSrc("function sbSupportCue(S){sbSupportCueRun(S,sgSnapshot(S,") &&
  inSrc("resolveAnchor('sham','body')") && inSrc('animation:sbSupWave .92s'), '');

chk('j5 파티/anchor 등록 무변경(actors +0·anchors +0·이번 카드 anchor 확장 0)',
  stage.actors().join(',') === 'boss_iron,boss_morgas,boss_abyss,war,rog,mage,sham' &&
  JSON.stringify(stage.anchors()) === JSON.stringify(['boss_iron', 'war', 'rog', 'mage', 'sham', 'boss_morgas', 'boss', 'pri']), '');

/* ===== K. 회귀 ===== */
try {
  const m = s.smoke(), i = s.smoke('shell_iron'), t = s.smoke('shell_thirst');
  chk('k1 스모크 3종 불변(51.4/1029·48.5/971·61.8/1236·state/reaction=render 하류)',
    m.t === 51.4 && m.steps === 1029 && i.t === 48.5 && i.steps === 971 && t.t === 61.8 && t.steps === 1236,
    m.t + '/' + m.steps + ' · ' + i.t + '/' + i.steps + ' · ' + t.t + '/' + t.steps);
} catch (e) { chk('k1 스모크(예외)', false, e.message); }
{
  const buf = fs.readFileSync(path.join(ROOT, 'index.html'));
  const cmd5 = crypto.createHash('md5').update(core).digest('hex');
  chk('k2 CORE byte-identical(466/22,521/6cad2ec2)',
    coreLines.length === 466 && Buffer.byteLength(core, 'utf8') === 22521 &&
    cmd5 === '6cad2ec271a2a79afbee881c2a2e0856', coreLines.length + '/' + cmd5.slice(0, 8));
  chk('k3 index.html 신 기준선(223,967 B · md5 1fa9132f…)',
    buf.length === 223967 &&
    crypto.createHash('md5').update(buf).digest('hex') === '1fa9132fb7567a778ce6e3f77ed856df', buf.length + 'B');
}
chk('k4 docs/70 필수 절(truth·transform·Profile·state·reaction·generation·coalescing·mapping·동시성·anchor·lifecycle·cleanup·등가·관측·Human Gate·F8B·F9)',
  doc.length > 6000 &&
  ['truth', 'transform', 'Profile', 'state', 'reaction', 'generation', 'coalescing', 'mapping',
   '동시성', 'anchor', 'lifecycle', 'cleanup', '등가', '관측', 'Human Gate', 'F8B', 'F9', '비변경']
    .every(t => doc.indexOf(t) >= 0), '');

console.log(`\n${fail === 0 ? '★ BOSS ENRAGE & HIT REACTION GRAMMAR 01 CHECK PASS' : '★ BOSS ENRAGE & HIT REACTION GRAMMAR 01 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
