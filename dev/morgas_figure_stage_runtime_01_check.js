'use strict';
// Morgas Figure & Stage Runtime 01 (F6) 전용 검증
// 실행: node dev/morgas_figure_stage_runtime_01_check.js
// A Profile · B Figure · C Pose/Face · D Rogue Interrupt · E Anchor · F Context/Cleanup · G Visual Boundary · H Gameplay Boundary · I 회귀.
// 원칙: 보스의 개성은 고유하게, 무대에 세우는 방법은 공통으로. F5 generic 기반 무수정 + Profile/DOM/CSS/signal mapping만으로 등록.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const DOC = path.join(ROOT, 'docs', '68_MORGAS_FIGURE_STAGE_RUNTIME_01.md');
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
// F5 generic(무수정 확인) + F2/F3 generic
const rpB = strip(fnBody('resolveBossStageProfile'));
const rsB = strip(fnBody('resolveBossFigureShell'));
const rfB = strip(fnBody('resolveBossFace'));
const pbB = strip(fnBody('presentBossFigure'));
const cbB = strip(fnBody('clearBossFigure'));
const drvB = strip(fnBody('sbBossFigure'));
const rvB = strip(fnBody('resolveActorPose'));
const cdB = strip(fnBody('sgPoseCond'));
const prB = strip(fnBody('sbFigPose'));
const raB = strip(fnBody('resolveAnchor'));
const faB = strip(fnBody('fxAnchors'));
const rabB = strip(fnBody('resolveActiveBossAnchor'));
const ctxB = strip(fnBody('sbStageContext'));
const GENERIC5 = rpB + rsB + rfB + pbB + cbB + drvB;
const coreLines = [];
{ let f = 0; for (const l of src.split('\n')) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) coreLines.push(l); } }
const core = coreLines.join('\n') + '\n';

/* ===== 하네스 ===== */
let h = null, s = null, stage = null;
try { h = require('./harness.js'); s = h.sb.window.__seedHealer; stage = s.stage; } catch (e) { console.log('HARNESS FAIL ' + e.message); }

// 실제 judge truth로 전투를 구동하며 pose/face/rogue를 계측(합성 신호 아님 — SCRIPT의 judge 이벤트가 진리)
function driveMorgas(until) {
  h.sb.CUR_BOSS = 'boss01';
  const g = s.createGame('boss01'); g.start();
  let steps = 0, judgeTicks = 0, idleTicks = 0, mismatch = 0, rogInterrupt = 0, rogStale = 0, tellOutsideJudge = 0;
  const seen = { pose: {}, face: {}, rog: {} };
  while (!g.S.over && g.S.t < until && steps < 4000) {
    g.step(0.05); steps++;
    const snap = stage.deriveSnapshot(g.S, g);
    const isJudge = !!(snap.bossAction && snap.bossAction.kind === 'judge');
    const pose = stage.resolvePose('boss_morgas', snap).pose;
    const face = stage.resolveBossFace('boss01', snap).face;
    const rog = stage.resolvePose('rog', snap).pose;
    seen.pose[pose] = (seen.pose[pose] || 0) + 1;
    seen.face[face] = (seen.face[face] || 0) + 1;
    seen.rog[rog] = (seen.rog[rog] || 0) + 1;
    if ((pose === 'weave') !== (face === 'tell')) mismatch++;
    if (isJudge) judgeTicks++; else { idleTicks++; if (face === 'tell') tellOutsideJudge++; if (rog === 'interrupt') rogStale++; }
    if (rog === 'interrupt') rogInterrupt++;
  }
  h.sb.CUR_BOSS = 'boss01';
  return { steps, judgeTicks, idleTicks, mismatch, rogInterrupt, rogStale, tellOutsideJudge, seen, g };
}

/* ===== A. Profile ===== */
chk('a1 모르가스 BOSS_STAGE_PROFILE 등록(bossId/actorId/shellId/figId/context/contextClass)',
  inSrc("boss01:{bossId:'boss01',actorId:'boss_morgas',shellId:'sb_unit_v1'") &&
  inSrc("figId:'sb-morgas-fig',hostId:'stage',stageContext:'boss01',contextClass:'sb-boss-morgas'"), '');

// 〔승계 — F7(docs/69)〕 심연(shell_thirst) 추가로 목록 3종. 의미 불변: boss01이 등록돼 있고 shell은 여전히 1종(재사용 증명).
chk('a2 profile 목록에 boss01 추가 + shell은 기존 1종 재사용(새 shell 불요 증명)',
  stage.bossProfiles().indexOf('boss01') >= 0 &&
  JSON.stringify(stage.bossProfiles()) === JSON.stringify(['shell_iron', 'boss01', 'shell_thirst']) &&
  JSON.stringify(stage.bossShells()) === JSON.stringify(['sb_unit_v1']), '');

chk('a3 ACTOR_REGISTRY 연결(actorId 일치·bossStageProfile 링크·figId 일치)',
  (function () {
    const p = stage.bossProfile('boss01'), a = stage.actorProfile('boss_morgas');
    return p && a && a.actorId === p.actorId && a.bossStageProfile === 'boss01' && a.figId === p.figId &&
      a.kind === 'boss' && a.stageContext === 'boss01';
  })(), '');

chk('a4 shellId 유효(등록 shell 조회 성공) · part mapping 유효(실사용 slot만)',
  (function () {
    const p = stage.bossProfile('boss01');
    return p && p.shellId === 'sb_unit_v1' &&
      p.parts.root === 'sb-fig' && p.parts.body === 'sb-mg-robe' && p.parts.face === 'sb-mg-head' &&
      p.parts.core === 'sb-mg-sigil' && p.parts.weapon === 'sb-mg-threads' &&
      p.parts.ground === 'sb-shadow' && p.parts.aura === 'sb-aura' &&
      !p.parts.ornament && !p.parts.sideL && !p.parts.sideR; // 미보유 optional=null
  })(), '');

// 〔승계 — F7〕 shell_thirst가 등록됨 → 미등록 대표를 실재하지 않는 id로 교체. 의미(미등록/프로토타입 키 → null·예외 0) 불변.
chk('a5 unknown boss fallback 보존(미등록/프로토타입 키 → null·예외 0)',
  stage.bossProfile('nope') === null && stage.bossProfile('shell_void') === null &&
  stage.bossProfile('toString') === null && stage.bossProfile(undefined) === null, '');

chk('a6 Profile에 gameplay mutable state 0(순수 표현 데이터)',
  (function () {
    const p = stage.bossProfile('boss01');
    return p && !('hp' in p) && !('atk' in p) && !('dmg' in p) && !('cast' in p) && !('judge' in p);
  })(), '');

/* ===== B. Figure ===== */
chk('b1 markup 1개소·duplicate root 0·duplicate part id 0(파츠는 class)',
  (src.match(/id="sb-morgas-fig"/g) || []).length === 1 &&
  (src.match(/id="sb-boss-fig"/g) || []).length === 1 &&
  !/id="sb-mg-/.test(src), '');

chk('b2 shell 3층 구조 준수(sb-react/sb-fit/sb-fig)+파츠 7종(5~9 권장 범위)',
  inSrc('<div class="sb-unit sb-morgas" id="sb-morgas-fig" data-pose=""><div class="sb-react"><div class="sb-fit"><div class="sb-fig">') &&
  (function () {
    const m = src.match(/id="sb-morgas-fig"[\s\S]*?<\/div><\/div><\/div><\/div>/);
    const n = m ? (m[0].match(/class="sb-part /g) || []).length : 0;
    return n === 7 && n >= 5 && n <= 9;
  })(), '');

chk('b3 required parts 전부 실 element(anchor/face state 대상은 pseudo 아님)',
  inSrc('sb-part sb-mg-robe') && inSrc('sb-part sb-mg-head') && inSrc('sb-part sb-mg-eyes') &&
  inSrc('sb-part sb-mg-sigil') && inSrc('sb-part sb-mg-threads'), '');

chk('b4 context 게이트(자기 문맥에서만 표시·소화면 fallback 대칭)',
  inSrc('#sb-morgas-fig{left:50%;top:6px;') && inSrc('#stage.sb-boss-morgas #sb-morgas-fig{display:block}') &&
  inSrc(' #stage.sb-boss-morgas #sb-morgas-fig{display:none}'), '');

chk('b5 파쇄자 몸체 재사용 0(고유 파츠 네임스페이스·색 변수 분리)',
  !/sb-morgas[^{]*\.sb-ic-/.test(src) && inSrc('--sb-mg-main:#b23a5e') && inSrc('--sb-mg-glow:#b06cf0') &&
  src.indexOf('sb-mg-robe') !== src.indexOf('sb-ic-body'), '');

chk('b6 render 반복 재생성 0(F5 binder=DOM 생성 API 0)',
  pbB.indexOf('createElement') < 0 && drvB.indexOf('createElement') < 0 &&
  (GENERIC5 + ctxB).indexOf('appendChild') < 0 && (GENERIC5 + ctxB).indexOf('innerHTML') < 0, '');

/* ===== C. Pose / Face ===== */
chk('c1 pose 어휘(default 빈값·weave=judge 예고·미채택은 candidatePoses)',
  inSrc("allowedPoses:['weave'],candidatePoses:['brandCast','bombCast','smashCast']") &&
  inSrc("poseRules:[{pose:'weave',when:{bossActionKind:'judge'}}]"), '');

chk('c2 face 어휘(default neutral·allowed neutral/tell·미채택 candidateFaces)',
  (function () {
    const p = stage.bossProfile('boss01');
    return p && p.defaultFace === 'neutral' &&
      JSON.stringify(p.allowedFaces) === JSON.stringify(['neutral', 'tell']) &&
      JSON.stringify(p.candidateFaces) === JSON.stringify(['hurt', 'groggy', 'enraged', 'defeated']) &&
      p.faceRules.length === 1 && p.faceRules[0].face === 'tell' && p.faceRules[0].when.bossActionKind === 'judge';
  })(), '');

chk('c3 faceParts=다중 파츠 얼굴(가면 root + 눈) — F5 W4 첫 사례',
  inSrc("faceParts:{root:'sb-mg-head',eyes:'sb-mg-eyes'}") &&
  (function () { const p = stage.bossProfile('boss01'); return p.faceParts.root === 'sb-mg-head' && p.faceParts.eyes === 'sb-mg-eyes'; })(), '');

chk('c4 pose(몸)와 face(얼굴) CSS 소유 분리 — 몸/실/문양=pose · 가면/눈=face',
  inSrc('#stage .sb-morgas[data-pose="weave"] .sb-react') &&
  inSrc('#stage .sb-morgas[data-pose="weave"] .sb-mg-threads') &&
  inSrc('#stage .sb-morgas[data-pose="weave"] .sb-mg-robe') &&
  inSrc('#stage .sb-morgas[data-pose="weave"] .sb-mg-sigil') &&
  inSrc('#stage .sb-morgas[data-face="tell"] .sb-mg-head') &&
  inSrc('#stage .sb-morgas[data-face="tell"] .sb-mg-eyes') &&
  !/\[data-pose="weave"\] \.sb-mg-(head|eyes)/.test(src) &&
  !/\[data-face="tell"\] \.sb-mg-(robe|threads|sigil)/.test(src), '');

try { // 실 전투 truth 스윕 — 합성 신호 0
  const r = driveMorgas(999);
  chk('c5 실 judge truth에서 pose weave + face tell(' + r.steps + ' ticks·judge ' + r.judgeTicks + ')',
    r.judgeTicks > 0 && !!r.seen.pose['weave'] && !!r.seen.face['tell'], JSON.stringify({ pose: r.seen.pose, face: r.seen.face }));
  chk('c6 default 복귀(judge 밖=pose 빈값·face neutral) · judge 아닌 구간 tell 표시 0',
    !!r.seen.pose[''] && !!r.seen.face['neutral'] && r.tellOutsideJudge === 0, 'tellOutsideJudge=' + r.tellOutsideJudge);
  chk('c7 pose/face mismatch 0(weave ⟺ tell·전 구간)', r.mismatch === 0, 'mismatch=' + r.mismatch);
} catch (e) { chk('c5~c7 실 전투 스윕(예외)', false, e.message); }

chk('c8 gameplay가 pose/face 이름을 모름(CORE에 weave/tell/neutral/registry 0)',
  !/weave|data-face|BOSS_STAGE_PROFILE|resolveBossFace|'tell'|'neutral'|sb-mg-/.test(core), '');

chk('c9 임의 timer 0(F6 신규 영역에 setTimeout/setInterval 0)',
  ctxB.indexOf('setTimeout') < 0 && ctxB.indexOf('setInterval') < 0 &&
  rabB.indexOf('setTimeout') < 0 && GENERIC5.indexOf('setTimeout') < 0, '');

/* ===== D. Rogue Interrupt ===== */
try {
  const r = driveMorgas(999);
  chk('d1 실 judge truth에서 도적 interrupt 발동(F4 generic rule 재사용·' + r.rogInterrupt + ' ticks)',
    r.rogInterrupt > 0 && !!r.seen.rog['interrupt'] && !!r.seen.rog[''], JSON.stringify(r.seen.rog));
  chk('d2 judge 종료 후 stale interrupt 0(judge 밖 interrupt 0)', r.rogStale === 0, 'rogStale=' + r.rogStale);
} catch (e) { chk('d1/d2 도적(예외)', false, e.message); }

chk('d3 F4 도적 rule 무수정(규칙 문자열 원문 보존)',
  inSrc("poseRules:[{pose:'interrupt',when:{actorAlive:true,bossActionKind:'judge',interruptStance:'ready'}}]") &&
  inSrc("allowedPoses:['interrupt'],candidatePoses:['dash','strike','recover']"), '');

chk('d4 모르가스 전용 도적 분기 0 · 가짜 action 0',
  !/rog[^}]*boss01/.test(src.slice(src.indexOf('var ACTOR_REGISTRY='), src.indexOf('var SG_POSE_STATS'))) &&
  !inSrc('data-pose="strike"') && !inSrc('data-pose="dash"') && !inSrc('data-pose="recover"') &&
  prB.indexOf("'boss01'") < 0 && rvB.indexOf("'boss01'") < 0 && cdB.indexOf("'boss01'") < 0, '');

chk('d5 judge 조건/interrupt 규칙 gameplay 무변경(cast 2.5s·pendJ 0.8s·tryInterrupt 원위치)',
  inSrc('judge:180, enJudge:225, judgeCast:2.5') &&
  inSrc("S.boss.cast={kind:'judge',name:'어둠의 심판',start:S.t,end:S.t+B.judgeCast,j:ev.j,un}") &&
  inSrc('S.pendJ={t:S.t+0.8,j:ev.j}') &&
  inSrc("if(S.pendJ&&t>=S.pendJ.t){const j=S.pendJ.j;S.pendJ=null;if(S.boss.cast&&S.boss.cast.kind==='judge')tryInterrupt(j);}"), '');

/* ===== E. Anchor ===== */
chk('e1 모르가스 anchor=실사용 1종만(무대 선 원점) · 미사용 추측 선등록 0',
  inSrc("boss_morgas:{figId:'sb-morgas-fig',stageContext:'boss01',anchors:{") &&
  inSrc("avatar:{part:'sb-mg-robe'") &&
  (function () {
    const p = stage.actorAnchors('boss_morgas');
    return p && Object.keys(p.anchors).join(',') === 'avatar';
  })() &&
  !/(wing|tail|ritualNode|eyeLeft|eyeRight):\{/.test(src), '');

chk('e2 Profile anchor 선언 = 등록 anchor와 일치',
  (function () {
    const p = stage.bossProfile('boss01'), a = stage.actorAnchors('boss_morgas');
    return p && a && JSON.stringify(p.anchors) === JSON.stringify(['avatar']) && !!a.anchors.avatar;
  })(), '');

chk('e3 consumer는 resolveAnchor 경유(F6 신규 경로에 DOM 탐색/rect 0)',
  rabB.indexOf('resolveBossAnchor(resolveBossStageProfile(sgBossId()),anchorName)') >= 0 &&
  rabB.indexOf('getElementById') < 0 && rabB.indexOf('querySelector') < 0 &&
  rabB.indexOf('getBoundingClientRect') < 0 &&
  faB.indexOf('getBoundingClientRect') < 0 && faB.indexOf('getElementById') < 0, '');

chk('e4 fxAnchors 계보 보존(resolveAnchor 6회·legacy 아바타 폴백 존치·자체 selector 0)',
  (faB.match(/resolveAnchor\(/g) || []).length === 6 &&
  faB.indexOf("resolveActiveBossAnchor('avatar')||resolveAnchor('boss','avatar')") >= 0 &&
  faB.indexOf("'bossAvatar'") < 0 && faB.indexOf("'sa-war'") < 0, '');

chk('e5 기존 boss_iron anchors 불변(정의·라벨 원문)',
  inSrc("weapon:{part:'sb-ic-hammer',topBias:1,label:'망치 자루 상단(강타선 source)'}") &&
  inSrc("body:{part:'sb-ic-body',label:'철괴 몸통'}") &&
  (function () {
    const p = stage.bossProfile('shell_iron');
    return JSON.stringify(p.anchors) === JSON.stringify(['weapon', 'body']);
  })(), '');

chk('e6 invalid/hidden → null · (0,0) fallback 0',
  raB.indexOf('r.width>0||r.height>0') >= 0 && raB.indexOf('context-inactive') >= 0 &&
  stage.anchor('boss_morgas', 'nope') === null && stage.anchor('ghostboss', 'avatar') === null &&
  !/x:0,y:0/.test(strip(fnBody('resolveActiveBossAnchor')) + faB), '');

/* ===== F. Context / Cleanup ===== */
chk('f1 무대 문맥=Profile 데이터 기반(보스 분기 0·활성 보스만 자기 class)',
  ctxB.indexOf('sC(st,p.contextClass,p===act)') >= 0 &&
  ctxB.indexOf("sC(st,'sb-fig-stage',!!(act&&resolveBossFigureShell(act)))") >= 0 &&
  ['boss01', 'shell_iron', 'shell_thirst', 'morgas', 'iron'].every(id => ctxB.indexOf("'" + id + "'") < 0) &&
  inSrc('sbStageContext();') && !inSrc("sC(_stg,'sb-boss-iron',(typeof CUR_BOSS!=='undefined'&&CUR_BOSS==='shell_iron'))"), '');

chk('f2 파티/무대 규칙은 공통 문맥 소유(보스별 파티 배치 복제 0)',
  inSrc('#stage.sb-fig-stage #stageAllies{bottom:20px;gap:26px}') &&
  inSrc('#stage.sb-fig-stage #sa-war{transform:translate(-24px,-12px);z-index:4}') &&
  !/#stage\.sb-boss-morgas #sa-/.test(src) && !/#stage\.sb-boss-iron #sa-/.test(src) &&
  !/#stage\.sb-boss-morgas #stageAllies/.test(src), '');

chk('f3 보스 고유 문맥은 자기 figure 표시만 소유',
  inSrc('#stage.sb-boss-iron #sb-boss-fig{display:block}') &&
  inSrc('#stage.sb-boss-morgas #sb-morgas-fig{display:block}') &&
  !/#stage\.sb-boss-morgas #sb-(war|rog|mage|sham)-fig/.test(src), '');

chk('f4 owner cleanup(문맥 밖 보스 figure data-face 제거·F5 규약 재사용)',
  drvB.indexOf('p.stageContext&&p.stageContext!==ctx') >= 0 && drvB.indexOf('clearBossFigure(p)') >= 0 &&
  cbB.indexOf("setAttribute('data-face','')") >= 0, '');

chk('f5 동료 actor/anchor=context-free(가시성은 무대 CSS·숨김은 rect-zero fail-close)',
  (function () {
    const f2seg = src.slice(src.indexOf('var ACTOR_REGISTRY='), src.indexOf('var SG_POSE_STATS'));
    const f3seg = src.slice(src.indexOf('var ANCHOR_REGISTRY='), src.indexOf('var SG_ANCHOR_STATS'));
    // 동료 4인은 context-free, 보스 2인만 bossId 문맥
    return (f2seg.match(/stageContext:null/g) || []).length === 4 &&
      (f2seg.match(/stageContext:'shell_iron'/g) || []).length === 1 &&
      (f2seg.match(/stageContext:'boss01'/g) || []).length === 1 &&
      (f3seg.match(/stageContext:'shell_iron'/g) || []).length === 1 &&
      (f3seg.match(/stageContext:'boss01'/g) || []).length === 1;
  })(), '');

/* ===== G. Visual Boundary ===== */
chk('g1 파쇄자 visual constants 불변(배치·규격·pose/face CSS·markup)',
  inSrc('#sb-boss-fig{left:50%;top:-8px;transform:translateX(-50%) scale(1.04);transform-origin:50% 0;display:none;z-index:2}') &&
  inSrc('#stage .sb-iron-crusher .sb-fig{width:190px;height:212px;animation:sbBreatheHeavy 4.8s ease-in-out infinite}') &&
  inSrc('#stage .sb-iron-crusher[data-pose="windup"] .sb-react{transform:rotate(-3deg) translateY(-2px)}') &&
  inSrc('#stage .sb-iron-crusher[data-pose="windup"] .sb-ic-hammer{transform:rotate(-18deg) translate(2px,-18px)}') &&
  inSrc('#stage .sb-iron-crusher[data-face="tell"] .sb-ic-head{transform:translateX(calc(-50% - 3px)) rotate(-3deg)}') &&
  inSrc('<div class="sb-unit sb-iron-crusher" id="sb-boss-fig" data-pose=""><div class="sb-react"><div class="sb-fit"><div class="sb-fig"><span class="sb-part sb-shadow"></span><span class="sb-part sb-aura"></span><span class="sb-part sb-ic-body"></span><span class="sb-part sb-ic-core"></span><span class="sb-part sb-ic-pauldrons"></span><span class="sb-part sb-ic-head"></span><span class="sb-part sb-ic-hammer"></span></div></div></div></div>'), '');

chk('g2 F4A support cue 불변(계약·CSS·anchor 경로)',
  inSrc("function sbSupportCue(S){sbSupportCueRun(S,sgSnapshot(S,") &&
  inSrc("resolveAnchor('sham','body')") && inSrc("resolveAnchor(id,'head')") &&
  inSrc('animation:sbSupWave .92s') && inSrc('animation:sbHeadPing .6s') &&
  inSrc('sbFigPose(S);sbBossFigure(S);sbSupportCue(S);'), '');

chk('g3 동료 pose rule/CSS 불변(전사·마법사·주술사·도적)',
  inSrc("{pose:'guard',when:{actorAlive:true,actorShielded:true}}") &&
  inSrc("{pose:'brace',when:{actorAlive:true,bossActionKind:'smash'}}") &&
  inSrc("{pose:'channel',when:{actorAlive:true,battleActive:true,bossActing:false}}") &&
  inSrc("{pose:'sustain',when:{actorAlive:true,valorActive:true}}") &&
  inSrc('#stage .sb-mage[data-pose="channel"] .sb-m-orb{transform:translate(-22px,8px) scale(1.14)}'), '');

// 〔승계 — F7(docs/69)〕 심연 figure는 F7이 추가했다(F6 시점엔 없었음). 이 단언의 취지=「모르가스 카드가 심연에 누수되지 않는다」를
// 유지: 모르가스 자산(sb-mg-*)이 심연 문맥/figure에 등장하지 않고, legacy 아바타 요소(폴백 경로)는 그대로 존치한다.
chk('g4 모르가스↔심연 분리(모르가스 자산 누수 0·legacy avatar 요소 존치)',
  (function () {
    const m = src.match(/<div class="sb-unit sb-abyss"[\s\S]*?<\/div><\/div><\/div><\/div>/);
    const abyssMarkup = m ? m[0] : '';
    const noMgInMarkup = abyssMarkup.length > 50 && abyssMarkup.indexOf('sb-mg-') < 0;
    // 심연으로 스코프된 CSS 규칙에 모르가스 파츠 0 (선택자 단위 검사)
    const rules = src.match(/[^{}]+\{[^{}]*\}/g) || [];
    const noMgInAbyssRules = !rules.some(function (r) {
      const sel = r.slice(0, r.indexOf('{'));
      return (sel.indexOf('sb-abyss') >= 0 || sel.indexOf('sb-boss-thirst') >= 0) && r.indexOf('sb-mg-') >= 0;
    });
    return noMgInMarkup && noMgInAbyssRules && inSrc('<div id="bossAvatar">☠️</div>');
  })(), '');

chk('g5 신규 대형 FX 0(F6는 figure/pose/face만·행동선 문법 신설 0)',
  !inSrc('fxJudgeLine') && !inSrc('fxMorgas') &&
  (src.match(/<line id="fx/g) || []).length === 3 &&
  !/sbhit-(groggy|stun)/.test(src), '');

/* ===== H. Gameplay Boundary ===== */
chk('h1 gameplay 쓰기 0 · S.ev/drain 무변경',
  !/\bS\.\w+\s*=[^=]/.test(GENERIC5 + ctxB + rabB) && !/\bG\.\w+\s*=[^=]/.test(GENERIC5 + ctxB + rabB) &&
  (src.match(/\.ev\.splice\(0\)/g) || []).length === 1 &&
  (src.match(/sgObserve\(e,G\.S\);/g) || []).length === 1 && inSrc('seedOnHit(e.tg)'), '');

chk('h2 보스 pattern/timing 무변경(모르가스 SCRIPT judge 4회·수치)',
  inSrc("{t:15,e:'judge',j:1}") && inSrc("{t:32,e:'judge',j:2}") &&
  inSrc("{t:48,e:'judge',j:3}") && inSrc("{t:66,e:'judge',j:4}") &&
  inSrc('judge:180, enJudge:225, judgeCast:2.5'), '');

chk('h3 Stage Signal 신규 field 0(F6는 기존 truth만 사용)',
  strip(fnBody('sgSnapshot')).indexOf('judgeActive') < 0 &&
  strip(fnBody('sgSnapshot')).indexOf('data-face') < 0 &&
  inSrc("valorActive:t<S.valorUntil,interruptStance:iStance"), '');

chk('h4 F5 generic resolver/presenter 무수정(모르가스 분기 0)',
  ['boss01', 'morgas', 'shell_iron', 'boss_iron', 'boss_morgas', 'sb-mg-robe', 'weave']
    .every(id => GENERIC5.indexOf("'" + id + "'") < 0) &&
  GENERIC5.indexOf('switch(') < 0 &&
  rvB.indexOf('BOSS_STAGE_PROFILE') < 0 && raB.indexOf('BOSS_STAGE_PROFILE') < 0, '');

chk('h5 F2/F3 generic resolver Actor id 분기 0(F6 후에도)',
  ['war', 'boss_iron', 'boss_morgas', 'shell_iron', 'rog', 'mage', 'sham', 'boss01', 'shell_thirst']
    .every(id => rvB.indexOf("'" + id + "'") < 0 && cdB.indexOf("'" + id + "'") < 0 &&
      prB.indexOf("'" + id + "'") < 0 && raB.indexOf("'" + id + "'") < 0), '');

/* ===== I. 회귀 ===== */
try {
  const m = s.smoke(), i = s.smoke('shell_iron'), t = s.smoke('shell_thirst');
  chk('i1 스모크 3종 불변(51.4/1029·48.5/971·61.8/1236·F6=render 하류)',
    m.t === 51.4 && m.steps === 1029 && i.t === 48.5 && i.steps === 971 && t.t === 61.8 && t.steps === 1236,
    m.t + '/' + m.steps + ' · ' + i.t + '/' + i.steps + ' · ' + t.t + '/' + t.steps);
} catch (e) { chk('i1 스모크(예외)', false, e.message); }
{
  const buf = fs.readFileSync(path.join(ROOT, 'index.html'));
  const cmd5 = crypto.createHash('md5').update(core).digest('hex');
  chk('i2 CORE byte-identical(466/22,521/6cad2ec2)',
    coreLines.length === 466 && Buffer.byteLength(core, 'utf8') === 22521 &&
    cmd5 === '6cad2ec271a2a79afbee881c2a2e0856', coreLines.length + '/' + cmd5.slice(0, 8));
  chk('i3 index.html 신 기준선(213,295 B · md5 afe3de3a…)',
    buf.length === 213295 &&
    crypto.createHash('md5').update(buf).digest('hex') === 'afe3de3af0ddffc81ba9e0a090e1892e', buf.length + 'B');
}
chk('i4 docs/68 필수 절(감사·truth·silhouette·shell·Profile·mapping·faceParts·vocabulary·judge·interrupt·context·anchor·lifecycle·cleanup·무수정·등가·비변경·관측·Human Gate·F7·F8)',
  doc.length > 6000 &&
  ['감사', 'truth', 'silhouette', 'shell', 'Profile', 'mapping', 'faceParts', 'vocabulary', 'judge',
   'interrupt', 'context', 'anchor', 'lifecycle', 'cleanup', '무수정', '등가', '비변경', '관측',
   'Human Gate', 'F7', 'F8'].every(t => doc.indexOf(t) >= 0), '');

console.log(`\n${fail === 0 ? '★ MORGAS FIGURE & STAGE RUNTIME 01 CHECK PASS' : '★ MORGAS FIGURE & STAGE RUNTIME 01 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
