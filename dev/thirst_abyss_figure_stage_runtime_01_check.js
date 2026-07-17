'use strict';
// Thirst Abyss Figure & Stage Runtime 01 (F7) 전용 검증
// 실행: node dev/thirst_abyss_figure_stage_runtime_01_check.js
// A Truth Audit · B Profile · C Shell/Figure · D Non-Humanoid · E Pose/Face · F Companion Context
// · G Anchor/FX · H Cleanup · I 기존 보스 회귀 · J Gameplay Boundary · K 회귀.
// 원칙: drain은 cast 없는 즉발이 진리다. 가짜 tell을 만들지 않는다. 개성은 ambient body grammar로.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const DOC = path.join(ROOT, 'docs', '69_THIRST_ABYSS_FIGURE_STAGE_RUNTIME_01.md');
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
// F5/F6 generic(무수정 확인)
const rpB = strip(fnBody('resolveBossStageProfile'));
const rsB = strip(fnBody('resolveBossFigureShell'));
const rfB = strip(fnBody('resolveBossFace'));
const pbB = strip(fnBody('presentBossFigure'));
const cbB = strip(fnBody('clearBossFigure'));
const drvB = strip(fnBody('sbBossFigure'));
const rabB = strip(fnBody('resolveActiveBossAnchor'));
const ctxB = strip(fnBody('sbStageContext'));
const GENERIC = rpB + rsB + rfB + pbB + cbB + drvB + rabB + ctxB;
// F2/F3 generic
const rvB = strip(fnBody('resolveActorPose'));
const cdB = strip(fnBody('sgPoseCond'));
const prB = strip(fnBody('sbFigPose'));
const raB = strip(fnBody('resolveAnchor'));
const faB = strip(fnBody('fxAnchors'));
const snB = strip(fnBody('sgSnapshot'));
// 심연 마크업 슬라이스
const abyssMarkup = (src.match(/<div class="sb-unit sb-abyss"[\s\S]*?<\/div><\/div><\/div><\/div>/) || [''])[0];
// CSS 규칙 단위(선택자 스코프 검사용)
const cssRules = src.match(/[^{}]+\{[^{}]*\}/g) || [];
const abyssRules = cssRules.filter(r => { const s = r.slice(0, r.indexOf('{')); return s.indexOf('sb-abyss') >= 0 || s.indexOf('sb-boss-thirst') >= 0; });
const coreLines = [];
{ let f = 0; for (const l of src.split('\n')) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) coreLines.push(l); } }
const core = coreLines.join('\n') + '\n';

/* ===== 하네스 ===== */
let h = null, s = null, stage = null;
try { h = require('./harness.js'); s = h.sb.window.__seedHealer; stage = s.stage; } catch (e) { console.log('HARNESS FAIL ' + e.message); }

// 실 전투 구동(합성 신호 0) — 심연 SCRIPT의 drain/valor/enrage를 그대로 만난다
function driveAbyss() {
  h.sb.CUR_BOSS = 'shell_thirst';
  const g = s.createGame('shell_thirst'); g.start();
  let steps = 0, castEver = null, poseSeen = {}, faceSeen = {}, mageSeen = {}, rogSeen = {}, enragedFrom = null;
  while (!g.S.over && steps < 4000) {
    g.step(0.05); steps++;
    const snap = stage.deriveSnapshot(g.S, g);
    if (snap.bossAction) castEver = snap.bossAction.kind;
    if (snap.enraged && enragedFrom === null) enragedFrom = +g.S.t.toFixed(1);
    const p = stage.resolvePose('boss_abyss', snap).pose;
    const f = stage.resolveBossFace('shell_thirst', snap).face;
    poseSeen[p] = (poseSeen[p] || 0) + 1; faceSeen[f] = (faceSeen[f] || 0) + 1;
    const mg = stage.resolvePose('mage', snap).pose; mageSeen[mg] = (mageSeen[mg] || 0) + 1;
    const rg = stage.resolvePose('rog', snap).pose; rogSeen[rg] = (rogSeen[rg] || 0) + 1;
  }
  h.sb.CUR_BOSS = 'boss01';
  return { steps, castEver, poseSeen, faceSeen, mageSeen, rogSeen, enragedFrom, result: g.S.result };
}

/* ===== A. Truth Audit ===== */
chk('a1 실제 bossId=shell_thirst(BOSS_DEFS 실재) · display 갈증의 심연',
  inSrc('shell_thirst:{boss:ABYSS_BOSS,script:ABYSS_SCRIPT}') &&
  inSrc("name:'갈증의 심연', sn:'심연', hp:8400"), '');

chk('a2 drain 즉발 계약(cast 설정 0 — S.boss.cast는 smash/judge 2곳뿐·심연 SCRIPT엔 없음)',
  (src.match(/S\.boss\.cast=\{kind:/g) || []).length === 2 &&
  inSrc("S.boss.cast={kind:'smash'") && inSrc("S.boss.cast={kind:'judge'") &&
  !/S\.boss\.cast=\{kind:'drain'/.test(src), '');

chk('a3 drain 실행 원문 보존(즉발 처리·수치·대상·결과)',
  inSrc("const burn=S.boss.enraged?B.enDrain:B.drain;") &&
  inSrc("S.pri.mana=Math.max(0,S.pri.mana-burn);") &&
  inSrc("aliveAll().slice().forEach(a=>dmg(a,d,'aoe'));") &&
  inSrc('drain:62, enDrain:95, drainDmg:42, enDrainDmg:64'), '');

chk('a4 심연 SCRIPT 원문 보존(drain 11·valor 2·enrage 1·cast 어휘 0)',
  (function () {
    const m = src.match(/const ABYSS_SCRIPT=\[[\s\S]*?\];/);
    if (!m) return false;
    const sc = m[0];
    return (sc.match(/e:'drain'/g) || []).length === 11 && (sc.match(/e:'valor'/g) || []).length === 2 &&
      (sc.match(/e:'enrage'/g) || []).length === 1 &&
      sc.indexOf("e:'smash'") < 0 && sc.indexOf("e:'judge'") < 0 &&
      inSrc("{t:5, e:'drain'}") && inSrc("{t:71,e:'drain'}");
  })(), '');

chk('a5 가짜 cast/tell 추가 0(심연 영역에 cast bar/예고/windup 0)',
  abyssRules.length > 0 &&
  !abyssRules.some(r => /data-pose="(cast|tell|windup|charge)"/.test(r)) &&
  !inSrc('sb-ab-cast') && !inSrc('sb-ab-tell') && !inSrc('sb-ab-windup') &&
  !/\[data-face="tell"\][^{]*sb-ab-/.test(src), '');

try {
  const r = driveAbyss();
  chk('a6 실 전투에서 bossAction 한 번도 없음(즉발만·' + r.steps + ' ticks) · enraged는 실 지속 truth(t=' + r.enragedFrom + ')',
    r.castEver === null && r.enragedFrom === 56, 'cast=' + r.castEver + ' enragedFrom=' + r.enragedFrom);
} catch (e) { chk('a6 실 전투 truth(예외)', false, e.message); }

/* ===== B. Profile ===== */
chk('b1 심연 BOSS_STAGE_PROFILE 등록(bossId/actorId/shellId/figId/context/contextClass)',
  inSrc("shell_thirst:{bossId:'shell_thirst',actorId:'boss_abyss',shellId:'sb_unit_v1'") &&
  inSrc("figId:'sb-abyss-fig',hostId:'stage',stageContext:'shell_thirst',contextClass:'sb-boss-thirst'"), '');

chk('b2 profile 목록 3종 + ACTOR_REGISTRY 연결(actorId 일치·링크·figId 일치)',
  JSON.stringify(stage.bossProfiles()) === JSON.stringify(['shell_iron', 'boss01', 'shell_thirst']) &&
  (function () {
    const p = stage.bossProfile('shell_thirst'), a = stage.actorProfile('boss_abyss');
    return p && a && a.actorId === p.actorId && a.bossStageProfile === 'shell_thirst' &&
      a.figId === p.figId && a.kind === 'boss' && a.stageContext === 'shell_thirst';
  })(), '');

chk('b3 shellId 유효(등록 shell 조회 성공) · parts mapping 유효',
  (function () {
    const p = stage.bossProfile('shell_thirst');
    return p && p.shellId === 'sb_unit_v1' && stage.bossShells().indexOf(p.shellId) >= 0 &&
      p.parts.root === 'sb-fig' && p.parts.ground === 'sb-shadow' && p.parts.aura === 'sb-aura' &&
      p.parts.body === 'sb-ab-pool' && p.parts.core === 'sb-ab-core' &&
      p.parts.sideL === 'sb-ab-shardL' && p.parts.sideR === 'sb-ab-shardR';
  })(), '');

chk('b4 unknown fallback 보존(미등록/프로토타입 키 → null·예외 0)',
  stage.bossProfile('shell_void') === null && stage.bossProfile('toString') === null &&
  stage.bossProfile('') === null && stage.bossProfile(undefined) === null, '');

chk('b5 Profile에 gameplay mutable state 0(순수 표현 데이터)',
  (function () {
    const p = stage.bossProfile('shell_thirst');
    return p && !('hp' in p) && !('drain' in p) && !('mana' in p) && !('cast' in p) && !('atk' in p);
  })(), '');

/* ===== C. Shell / Figure ===== */
chk('c1 기존 sb_unit_v1 재사용(신규 shell 0 — 3보스가 같은 골격)',
  JSON.stringify(stage.bossShells()) === JSON.stringify(['sb_unit_v1']) &&
  inSrc("var BOSS_FIGURE_SHELL={") &&
  (src.match(/shellId:'sb_unit_v1'/g) || []).length === 4, ''); // shell 정의 1 + profile 3

chk('c2 shell 3층 구조 준수 + 파츠 6종(권장 5~9)',
  abyssMarkup.indexOf('<div class="sb-react"><div class="sb-fit"><div class="sb-fig">') >= 0 &&
  (function () { const n = (abyssMarkup.match(/class="sb-part /g) || []).length; return n === 6 && n >= 5 && n <= 9; })(), '');

chk('c3 root 1 · duplicate root 0 · 중복 id 0(파츠는 class)',
  (src.match(/id="sb-abyss-fig"/g) || []).length === 1 && !/id="sb-ab-/.test(src), '');

chk('c4 required parts 실 element bound(pool/core/shardL/shardR)',
  abyssMarkup.indexOf('sb-part sb-ab-pool') >= 0 && abyssMarkup.indexOf('sb-part sb-ab-core') >= 0 &&
  abyssMarkup.indexOf('sb-part sb-ab-shardL') >= 0 && abyssMarkup.indexOf('sb-part sb-ab-shardR') >= 0, '');

chk('c5 context 게이트(자기 문맥만 표시·소화면 fallback 대칭)',
  inSrc('#sb-abyss-fig{left:50%;top:74px;') && inSrc('#stage.sb-boss-thirst #sb-abyss-fig{display:block}') &&
  inSrc(' #stage.sb-boss-thirst #sb-abyss-fig{display:none}'), '');

chk('c6 repeated render 재생성 0(F5 binder=DOM 생성 API 0)',
  GENERIC.indexOf('createElement') < 0 && GENERIC.indexOf('appendChild') < 0 &&
  GENERIC.indexOf('innerHTML') < 0, '');

/* ===== D. Non-Humanoid Contract ===== */
chk('d1 얼굴 없음(faceParts 자체가 없다 — F5 "얼굴 없는 보스" 계약 실증)',
  (function () { const p = stage.bossProfile('shell_thirst'); return p && p.faceParts === undefined; })() &&
  !/sb-ab-(eye|mouth|face|head)/.test(src), '');

chk('d2 인간형 해부학 강제 0(눈/입/머리 파츠 0·모르가스 가면 재사용 0)',
  abyssMarkup.indexOf('sb-mg-') < 0 && abyssMarkup.indexOf('sb-ic-') < 0 &&
  !abyssRules.some(r => r.indexOf('sb-mg-') >= 0 || r.indexOf('sb-ic-') >= 0), '');

chk('d3 weapon/ornament/face null 안전(미보유 optional=null·유령 DOM 0)',
  (function () {
    const p = stage.bossProfile('shell_thirst');
    return p && !p.parts.face && !p.parts.weapon && !p.parts.ornament;
  })(), '');

chk('d4 sideL/sideR 비대칭 실사용(크기·위치·주기가 서로 다름 — 대칭 장식 ⛔)',
  inSrc("sideL:'sb-ab-shardL',sideR:'sb-ab-shardR'") &&
  inSrc('#stage .sb-abyss .sb-ab-shardL{left:6px;bottom:26px;width:38px;height:26px') &&
  inSrc('#stage .sb-abyss .sb-ab-shardR{left:118px;bottom:38px;width:26px;height:18px') &&
  inSrc('animation:sbAbShardL 5.2s ease-in-out infinite') &&
  inSrc('animation:sbAbShardR 7.1s ease-in-out infinite') &&
  inSrc('@keyframes sbAbShardL') && inSrc('@keyframes sbAbShardR'), '');

chk('d5 파쇄자/모르가스 몸체 색변경 재사용 0(고유 네임스페이스·고유 색변수)',
  inSrc('--sb-ab-main:#2e5f8a') && inSrc('--sb-ab-glow:#4fd6c8') && inSrc('--sb-ab-void:#04080f') &&
  !abyssRules.some(r => r.indexOf('--sb-ic-') >= 0 || r.indexOf('--sb-mg-') >= 0), '');

/* ===== E. Pose / Face ===== */
chk('e1 실 truth 없는 pose 0(cast 0 → poseRules []·allowedPoses []·default only)',
  inSrc("boss_abyss:{actorId:'boss_abyss',kind:'boss',figId:'sb-abyss-fig',stageContext:'shell_thirst'") &&
  inSrc("snapshotKey:null,defaultPose:'',allowedPoses:[],candidatePoses:['crave','recoil','swell']") &&
  inSrc('poseRules:[]'), '');

chk('e2 face state 0(faceRules []·allowedFaces []·candidateFaces는 미래 vocabulary 보존)',
  (function () {
    const p = stage.bossProfile('shell_thirst');
    return p && JSON.stringify(p.faceRules) === JSON.stringify([]) &&
      JSON.stringify(p.allowedFaces) === JSON.stringify([]) && p.defaultFace === '' &&
      JSON.stringify(p.candidateFaces) === JSON.stringify(['hurt', 'groggy', 'enraged', 'defeated']);
  })(), '');

try {
  const r = driveAbyss();
  chk('e3 실 전투 전 구간 pose=default only · face 없음(tell 0·가짜 예고 0)',
    Object.keys(r.poseSeen).join(',') === '' && Object.keys(r.faceSeen).join(',') === '' &&
    r.poseSeen[''] === r.steps && r.faceSeen[''] === r.steps,
    'pose=' + JSON.stringify(r.poseSeen) + ' face=' + JSON.stringify(r.faceSeen));
  chk('e4 도적 침묵(judge 없음 → interrupt 0·gameplay truth 일치)',
    !r.rogSeen['interrupt'] && r.rogSeen[''] === r.steps, JSON.stringify(r.rogSeen));
} catch (e) { chk('e3/e4 실 전투 pose/face(예외)', false, e.message); }

chk('e5 gameplay가 pose/face 이름을 모름(CORE에 crave/data-face/registry/심연 파츠 0)',
  !/crave|data-face|BOSS_STAGE_PROFILE|resolveBossFace|sb-ab-|sb-abyss/.test(core), '');

chk('e6 ambient는 CSS animation만 · 임의 visual timer 0(F7 영역 setTimeout/Interval 0)',
  (function () {
    const a = src.indexOf('/* ===== F7: 갈증의 심연');
    const b = src.indexOf('/* Companion Party Rework 01', a);
    const seg = (a >= 0 && b > a) ? src.slice(a, b) : '';
    return seg.length > 500 && seg.indexOf('setTimeout') < 0 && seg.indexOf('setInterval') < 0 &&
      seg.indexOf('Math.random') < 0;
  })(), '');

chk('e7 ambient=안으로 수렴(밖으로 폭발 0·전 화면 flash 0)',
  inSrc('@keyframes sbAbDrawIn{0%{transform:translateX(-50%) scale(1.18);opacity:.5}100%{transform:translateX(-50%) scale(.9);opacity:0}}') &&
  inSrc('@keyframes sbAbCoreIn') && inSrc('animation:sbAbFloat 6.4s ease-in-out infinite') &&
  !abyssRules.some(r => r.indexOf('position:fixed') >= 0) &&
  !inSrc('sbAbFlash') && !inSrc('sbAbBurst'), '');

/* ===== F. Companion Context ===== */
chk('f1 공통 .sb-fig-stage 재사용(심연 전용 파티 CSS 복제 0)',
  inSrc('#stage.sb-fig-stage #stageAllies{bottom:20px;gap:26px}') &&
  !/#stage\.sb-boss-thirst #sa-/.test(src) && !/#stage\.sb-boss-thirst #stageAllies/.test(src) &&
  !/#stage\.sb-boss-thirst #sb-(war|rog|mage|sham)-fig/.test(src) &&
  !abyssRules.some(r => /#sa-(war|rog|mage|sham)/.test(r)), '');

chk('f2 보스 고유 문맥은 자기 figure 표시만 소유(3보스 동형)',
  inSrc('#stage.sb-boss-iron #sb-boss-fig{display:block}') &&
  inSrc('#stage.sb-boss-morgas #sb-morgas-fig{display:block}') &&
  inSrc('#stage.sb-boss-thirst #sb-abyss-fig{display:block}'), '');

chk('f3 문맥 토글=Profile 데이터 기반(보스 분기 0·심연 literal 0)',
  ctxB.indexOf('sC(st,p.contextClass,p===act)') >= 0 &&
  ['shell_thirst', 'boss01', 'shell_iron', 'boss_abyss'].every(id => ctxB.indexOf("'" + id + "'") < 0), '');

chk('f4 F4 동료 pose rule 무변경(전사/도적/마법사/주술사)',
  inSrc("{pose:'guard',when:{actorAlive:true,actorShielded:true}}") &&
  inSrc("{pose:'brace',when:{actorAlive:true,bossActionKind:'smash'}}") &&
  inSrc("{pose:'interrupt',when:{actorAlive:true,bossActionKind:'judge',interruptStance:'ready'}}") &&
  inSrc("{pose:'channel',when:{actorAlive:true,battleActive:true,bossActing:false}}") &&
  inSrc("{pose:'sustain',when:{actorAlive:true,valorActive:true}}"), '');

/* ===== G. Anchor / FX ===== */
chk('g1 실사용 anchor 0 → 미등록(선등록 ⛔) · anchor 목록 불변',
  (function () {
    const p = stage.bossProfile('shell_thirst');
    return p && JSON.stringify(p.anchors) === JSON.stringify([]);
  })() &&
  JSON.stringify(stage.anchors()) === JSON.stringify(['boss_iron', 'war', 'rog', 'mage', 'sham', 'boss_morgas', 'boss', 'pri']) &&
  !inSrc('boss_abyss:{figId:') && !/(mouth|eye|tentacle|ritualNode|wound|weakpoint):\{/.test(src), '');

// A.boss 소비자 수는 실행 코드 기준으로 센다(주석의 설명 언급은 소비자가 아니다)
chk('g2 legacy avatar 숨김 후 FX 단절 0(A.boss 소비자 2곳 모두 cast 필요 → 심연은 영구 OFF)',
  inSrc("var smashTg=(bc&&bc.kind==='smash')?bc.tg:null;") &&
  inSrc("var intOn=!!(bc&&bc.kind==='judge'&&!bc.un&&rog&&rog.alive);") &&
  (strip(src).match(/A\.boss/g) || []).length === 2 &&
  inSrc('<div id="bossAvatar">☠️</div>'), '');

chk('g3 drain 결과 표현 무변경(FX(aoe)=화면 레벨·보스 anchor 미사용)',
  inSrc("FX('aoe');break}") && inSrc("case 'aoe':SFX.aoe();shake();vign();break;") &&
  inSrc("o.intent=(boss==='shell_thirst')?'drain':'judge';break;"), '');

chk('g4 신규 drain FX/행동선 0(갈증선·흡수 flash·cast decal 0)',
  !inSrc('fxDrainLine') && !inSrc('fxThirst') && !inSrc('fxAbyss') &&
  (src.match(/<line id="fx/g) || []).length === 3, '');

chk('g5 기존 boss_iron/boss_morgas anchor 불변',
  inSrc("weapon:{part:'sb-ic-hammer',topBias:1,label:'망치 자루 상단(강타선 source)'}") &&
  inSrc("body:{part:'sb-ic-body',label:'철괴 몸통'}") &&
  inSrc("avatar:{part:'sb-mg-robe'") &&
  (function () {
    return JSON.stringify(stage.bossProfile('shell_iron').anchors) === JSON.stringify(['weapon', 'body']) &&
      JSON.stringify(stage.bossProfile('boss01').anchors) === JSON.stringify(['avatar']);
  })(), '');

chk('g6 invalid/hidden → null · (0,0) fallback 0',
  stage.anchor('boss_abyss', 'avatar') === null && stage.anchor('shell_thirst', 'core') === null &&
  raB.indexOf('r.width>0||r.height>0') >= 0 && !/x:0,y:0/.test(rabB + faB), '');

/* ===== H. Cleanup ===== */
chk('h1 owner cleanup(문맥 밖 보스 figure data-face 제거·F5 규약 재사용·보스별 cleanup 함수 0)',
  drvB.indexOf('p.stageContext&&p.stageContext!==ctx') >= 0 && drvB.indexOf('clearBossFigure(p)') >= 0 &&
  cbB.indexOf("setAttribute('data-face','')") >= 0 &&
  !inSrc('clearAbyssFigure') && !inSrc('clearMorgasFigure'), '');

chk('h2 ambient는 context hidden이면 시각 영향 0(figure display:none·문맥 게이트)',
  inSrc('#sb-abyss-fig{left:50%;top:74px;transform:translateX(-50%) scale(1);transform-origin:50% 0;display:none;z-index:2}'), '');

/* ===== I. 기존 보스 회귀 ===== */
chk('i1 파쇄자 visual constants 불변',
  inSrc('#sb-boss-fig{left:50%;top:-8px;transform:translateX(-50%) scale(1.04);transform-origin:50% 0;display:none;z-index:2}') &&
  inSrc('#stage .sb-iron-crusher .sb-fig{width:190px;height:212px;animation:sbBreatheHeavy 4.8s ease-in-out infinite}') &&
  inSrc('#stage .sb-iron-crusher[data-pose="windup"] .sb-ic-hammer{transform:rotate(-18deg) translate(2px,-18px)}') &&
  inSrc('#stage .sb-iron-crusher[data-face="tell"] .sb-ic-head{transform:translateX(calc(-50% - 3px)) rotate(-3deg)}'), '');

chk('i2 모르가스 불변(실루엣·가면/눈·weave/tell·차단선 anchor)',
  inSrc('#sb-morgas-fig{left:50%;top:6px;transform:translateX(-50%) scale(1);transform-origin:50% 0;display:none;z-index:2}') &&
  inSrc('#stage .sb-morgas .sb-fig{width:120px;height:198px;animation:sbMgDrift 5.2s ease-in-out infinite}') &&
  inSrc("poseRules:[{pose:'weave',when:{bossActionKind:'judge'}}]") &&
  inSrc("faceRules:[{face:'tell',when:{bossActionKind:'judge'}}]") &&
  inSrc('#stage .sb-morgas[data-face="tell"] .sb-mg-eyes') &&
  faB.indexOf("resolveActiveBossAnchor('avatar')||resolveAnchor('boss','avatar')") >= 0, '');

chk('i3 interrupt decal 소멸 경로 무변경(judge 종료→aoe/int off·기존 토글 원문)',
  inSrc("var aoe=!!(bc&&bc.kind==='judge');") &&
  inSrc("fxToggle('fxAoe',aoe); fxToggle('fxAoeDecal',aoe);") &&
  inSrc("fxLn('fxIntLine',A.rog,A.boss,intOn,'fxInt'+(branded?' broken':''));"), '');

chk('i4 F4A support cue 불변',
  inSrc("function sbSupportCue(S){sbSupportCueRun(S,sgSnapshot(S,") &&
  inSrc("resolveAnchor('sham','body')") && inSrc("resolveAnchor(id,'head')") &&
  inSrc('sbFigPose(S);sbBossFigure(S);sbSupportCue(S);'), '');

/* ===== J. Gameplay Boundary ===== */
chk('j1 gameplay 쓰기 0 · S.ev/drain 소비 무변경',
  !/\bS\.\w+\s*=[^=]/.test(GENERIC) && !/\bG\.\w+\s*=[^=]/.test(GENERIC) &&
  (src.match(/\.ev\.splice\(0\)/g) || []).length === 1 &&
  (src.match(/sgObserve\(e,G\.S\);/g) || []).length === 1 && inSrc('seedOnHit(e.tg)'), '');

chk('j2 Stage Signal 신규 field 0(기존 truth만 사용)',
  snB.indexOf('drainActive') < 0 && snB.indexOf('data-face') < 0 && snB.indexOf('sb-ab-') < 0 &&
  inSrc("enraged:S.boss.enraged,valorActive:t<S.valorUntil,interruptStance:iStance"), '');

chk('j3 F5/F6 generic 무수정(심연 분기 0·bossId literal 0)',
  ['shell_thirst', 'boss_abyss', 'boss01', 'shell_iron', 'boss_iron', 'boss_morgas', 'sb-ab-pool', 'crave']
    .every(id => GENERIC.indexOf("'" + id + "'") < 0) &&
  GENERIC.indexOf('switch(') < 0, '');

chk('j4 F2/F3 generic resolver Actor id 분기 0(F7 후에도)',
  ['war', 'boss_iron', 'boss_morgas', 'boss_abyss', 'shell_iron', 'rog', 'mage', 'sham', 'boss01', 'shell_thirst']
    .every(id => rvB.indexOf("'" + id + "'") < 0 && cdB.indexOf("'" + id + "'") < 0 &&
      prB.indexOf("'" + id + "'") < 0 && raB.indexOf("'" + id + "'") < 0), '');

chk('j5 sgPoseCond 조건 키 무변경(F7이 새 조건 언어 추가 0)',
  cdB.indexOf('valorActive') >= 0 && cdB.indexOf('interruptStance') >= 0 &&
  cdB.indexOf('battleActive') >= 0 && cdB.indexOf('bossActing') >= 0 &&
  cdB.indexOf('bossActionKind') >= 0 && cdB.indexOf('enraged') < 0, ''); // enraged 키 미추가 = generic 무수정

/* ===== K. 회귀 ===== */
try {
  const m = s.smoke(), i = s.smoke('shell_iron'), t = s.smoke('shell_thirst');
  chk('k1 스모크 3종 불변(51.4/1029·48.5/971·61.8/1236·F7=render 하류)',
    m.t === 51.4 && m.steps === 1029 && i.t === 48.5 && i.steps === 971 && t.t === 61.8 && t.steps === 1236,
    m.t + '/' + m.steps + ' · ' + i.t + '/' + i.steps + ' · ' + t.t + '/' + t.steps);
} catch (e) { chk('k1 스모크(예외)', false, e.message); }
{
  const buf = fs.readFileSync(path.join(ROOT, 'index.html'));
  const cmd5 = crypto.createHash('md5').update(core).digest('hex');
  chk('k2 CORE byte-identical(466/22,521/6cad2ec2)',
    coreLines.length === 466 && Buffer.byteLength(core, 'utf8') === 22521 &&
    cmd5 === '6cad2ec271a2a79afbee881c2a2e0856', coreLines.length + '/' + cmd5.slice(0, 8));
  chk('k3 index.html 신 기준선(213,295 B · md5 afe3de3a…)',
    buf.length === 213295 &&
    crypto.createHash('md5').update(buf).digest('hex') === 'afe3de3af0ddffc81ba9e0a090e1892e', buf.length + 'B');
}
chk('k4 docs/69 필수 절(감사·즉발·silhouette·shell·Profile·mapping·sideL·face 없음·vocabulary·ambient·anchor·lifecycle·cleanup·무수정·등가·비변경·관측·Human Gate·F8·F9)',
  doc.length > 6000 &&
  ['감사', '즉발', 'silhouette', 'shell', 'Profile', 'mapping', 'sideL', '얼굴 없', 'vocabulary',
   'ambient', 'anchor', 'lifecycle', 'cleanup', '무수정', '등가', '비변경', '관측', 'Human Gate', 'F8', 'F9']
    .every(t => doc.indexOf(t) >= 0), '');

console.log(`\n${fail === 0 ? '★ THIRST ABYSS FIGURE & STAGE RUNTIME 01 CHECK PASS' : '★ THIRST ABYSS FIGURE & STAGE RUNTIME 01 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
