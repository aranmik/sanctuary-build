'use strict';
// Boss Figure Shell / Face Template 01 (F5) 전용 검증
// 실행: node dev/boss_figure_shell_face_template_01_check.js
// A Profile · B Generic Resolver · C Shell · D Face · E Iron 등가 · F 기반 경계 · G Cleanup · H 회귀.
// 원칙: 골격은 공통, 연기는 고유. 데이터는 보스별·실행은 generic. 파쇄자 시각 결과는 완전 등가.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const DOC = path.join(ROOT, 'docs', '67_BOSS_FIGURE_SHELL_FACE_TEMPLATE_01.md');
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
// F5 generic 함수 본문
const rpB = strip(fnBody('resolveBossStageProfile'));
const rsB = strip(fnBody('resolveBossFigureShell'));
const rPartB = strip(fnBody('resolveBossPart'));
const rPartElB = strip(fnBody('resolveBossPartEl'));
const rAncB = strip(fnBody('resolveBossAnchor'));
const rfB = strip(fnBody('resolveBossFace'));
const pbB = strip(fnBody('presentBossFigure'));
const cbB = strip(fnBody('clearBossFigure'));
const drvB = strip(fnBody('sbBossFigure'));
const GENERIC = rpB + rsB + rPartB + rPartElB + rAncB + rfB + pbB + cbB + drvB;
// 기존 기반 함수(무변경 확인용)
const rvB = strip(fnBody('resolveActorPose'));
const cdB = strip(fnBody('sgPoseCond'));
const prB = strip(fnBody('sbFigPose'));
const raB = strip(fnBody('resolveAnchor'));
// F5 블록 전체
const f5A = src.indexOf('/* ===== F5: Boss Figure Shell / Face Template 01');
const f5B = src.indexOf('/* ===== F4A: Shaman Sustain Support Cue 01');
const f5 = (f5A >= 0 && f5B > f5A) ? src.slice(f5A, f5B) : '';
const f5Code = strip(f5);
const coreLines = [];
{ let f = 0; for (const l of src.split('\n')) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) coreLines.push(l); } }
const core = coreLines.join('\n') + '\n';

/* ===== 하네스 ===== */
let h = null, s = null, stage = null;
try { h = require('./harness.js'); s = h.sb.window.__seedHealer; stage = s.stage; } catch (e) { console.log('HARNESS FAIL ' + e.message); }

/* ===== A. Profile ===== */
chk('a1 BOSS_STAGE_PROFILE 존재 + boss_iron reference profile(bossId/actorId/shellId/figId/context)',
  f5.length > 1000 && inSrc('var BOSS_STAGE_PROFILE=') &&
  inSrc("shell_iron:{bossId:'shell_iron',actorId:'boss_iron',shellId:'sb_unit_v1'") &&
  inSrc("figId:'sb-boss-fig',hostId:'stage',stageContext:'shell_iron'"), f5.length + 'B');

// 〔승계 — F6(docs/68 §10)〕 모르가스 profile(boss01) 등록으로 목록 확장 — F5 계약의 목적(데이터 추가만으로 보스 등록)이 실증된 결과.
// shell은 여전히 1종(sb_unit_v1 재사용=새 shell 불요 증명). F5 generic 로직 무수정.
chk('a2 debug accessor 등록 목록(profiles/shells·F1~F4A API 공존)',
  !!(stage && stage.bossProfiles && stage.bossShells && stage.bossProfile && stage.resolveBossFace && stage.bossFigure) &&
// 〔승계 — F7(docs/69)〕 심연 profile(shell_thirst) 추가로 목록 3종 — F5 계약이 3보스를 수용했고 shell은 여전히 1종(재사용 3회).
  JSON.stringify(stage.bossProfiles()) === JSON.stringify(['shell_iron', 'boss01', 'shell_thirst']) &&
  JSON.stringify(stage.bossShells()) === JSON.stringify(['sb_unit_v1']) &&
  !!(stage.resolvePose && stage.anchor && stage.cueState && stage.deriveSnapshot), '');

// 〔승계 — F6→F7〕 boss01·shell_thirst 모두 등록됨 → 미등록 대표를 실재하지 않는 id로 교체. 의미(미등록/프로토타입 키 → null·예외 0) 불변.
chk('a3 미등록 bossId → null(예외 0) · 프로토타입 키 → null',
  stage.bossProfile('nope') === null && stage.bossProfile('shell_void') === null &&
  stage.bossProfile('toString') === null && stage.bossProfile('') === null &&
  stage.bossProfile(undefined) === null, '');

{ // duplicate profile key 0 (객체 리터럴 중복 키는 조용히 덮임 — 원문 텍스트로 검사)
  const seg = f5.slice(f5.indexOf('var BOSS_STAGE_PROFILE='), f5.indexOf('var SG_FACE_STATS'));
  const keys = (seg.match(/^\s*(\w+):\{bossId:/gm) || []).map(x => x.trim().split(':')[0]);
  chk('a4 duplicate profile key 0', keys.length === new Set(keys).size && keys.length >= 1, keys.join(','));
}

chk('a5 Profile에 gameplay mutable state 0(hp/dmg/타이머/난수 0·순수 데이터)',
  !/\b(hp|atk|dmg|mana|holy|shield)\s*:/.test(f5.slice(f5.indexOf('var BOSS_STAGE_PROFILE='), f5.indexOf('var SG_FACE_STATS'))) &&
  f5Code.indexOf('Math.random') < 0 && f5Code.indexOf('setTimeout') < 0 && f5Code.indexOf('setInterval') < 0, '');

/* ===== B. Generic Resolver ===== */
// bossId/보스 이름 literal 분기 0 — 보스 식별자 문자열 자체가 generic 본문에 없어야 한다.
// (typeof x==='object' 류 타입 검사는 보스 분기가 아니므로 대상 아님)
chk('b1 generic 함수에 bossId/보스 이름 literal 분기 0',
  GENERIC.length > 800 &&
  ['shell_iron', 'boss01', 'shell_thirst', 'boss_iron', 'morgas', 'thirst', 'iron', 'sb-boss-fig', 'sb-ic-head', 'tell', 'neutral']
    .every(id => GENERIC.indexOf("'" + id + "'") < 0) &&
  GENERIC.indexOf('switch(') < 0 &&
  !/bossId\s*===\s*'/.test(GENERIC) && !/shellId\s*===\s*'/.test(GENERIC) &&
  !/actorId\s*===\s*'/.test(GENERIC), '');

chk('b2 등록 순서 의존 0(키 조회만·Object.keys 인덱싱/배열 0번 접근 0)',
  rpB.indexOf('Object.keys') < 0 && rpB.indexOf('[0]') < 0 &&
  rsB.indexOf('Object.keys') < 0 && rsB.indexOf('[0]') < 0 &&
  rpB.indexOf('BOSS_STAGE_PROFILE[bossId]') >= 0 && rsB.indexOf('BOSS_FIGURE_SHELL[profile.shellId]') >= 0, '');

chk('b3 unknown shell 안전 null · self-key 검증(상속 속성 차단)',
  rpB.indexOf('p.bossId===bossId') >= 0 && rsB.indexOf('s.shellId===profile.shellId') >= 0 &&
  rpB.indexOf('return null') >= 0 && rsB.indexOf('return null') >= 0, '');

chk('b4 inactive context 안전 처리(문맥 밖=cleanup·표현 0) · 미등록 shell=cleanup',
  drvB.indexOf('p.stageContext&&p.stageContext!==ctx') >= 0 && drvB.indexOf('clearBossFigure(p)') >= 0 &&
  drvB.indexOf('!resolveBossFigureShell(p)') >= 0, '');

chk('b5 consumer selector 조립 0(part binding은 profile 공급·bossId 문자열 조립 0)',
  rPartElB.indexOf("'.'+c") >= 0 && !/getElementById\(\s*['"]sb-boss/.test(GENERIC) &&
  !/querySelector\(\s*['"]\./.test(GENERIC.replace(/fig\.querySelector\('\.'\+c\)/g, '')), '');

chk('b6 face 조건 해석=F2 sgPoseCond 재사용(신규 조건 언어 0·id 분기 0)',
  rfB.indexOf('sgPoseCond(r.when||{},snap,profile)') >= 0 &&
  cdB.length > 100 && ['war', 'boss_iron', 'shell_iron', 'rog', 'mage', 'sham']
    .every(id => cdB.indexOf("'" + id + "'") < 0), '');

/* ===== C. Shell ===== */
chk('c1 Shell 어휘 등록(layers 3층·partClass·slot 목록·root/body/face 포함)',
  inSrc("sb_unit_v1:{shellId:'sb_unit_v1',layers:['sb-react','sb-fit','sb-fig'],partClass:'sb-part'") &&
  inSrc("slots:['root','ground','aura','body','core','ornament','face','weapon','sideL','sideR']"), '');

chk('c2 boss_iron part mapping(root/body/face/weapon/core/ornament/ground/aura)',
  inSrc("parts:{root:'sb-fig',ground:'sb-shadow',aura:'sb-aura',body:'sb-ic-body',core:'sb-ic-core',") &&
  inSrc("ornament:'sb-ic-pauldrons',face:'sb-ic-head',weapon:'sb-ic-hammer'}"), '');

chk('c3 optional part 미보유=null(sideL/sideR 미매핑·유령 DOM 0·좌우 대칭 강제 0)',
  (function () {
    const p = stage.bossProfile('shell_iron');
    return p && !p.parts.sideL && !p.parts.sideR &&
      // 미보유 slot을 DOM에 만들지 않음: presenter/binder에 생성 API 0
      pbB.indexOf('createElement') < 0 && drvB.indexOf('createElement') < 0 && f5Code.indexOf('appendChild') < 0;
  })(), '');

chk('c4 binder 방식=DOM 생성 0(반복 render duplicate root 0·재생성 0 구조적 보장)',
  f5Code.indexOf('createElement') < 0 && f5Code.indexOf('appendChild') < 0 &&
  f5Code.indexOf('innerHTML') < 0 && f5Code.indexOf('removeChild') < 0 &&
  (src.match(/id="sb-boss-fig"/g) || []).length === 1, '');

chk('c5 face 파츠=단일 파츠 얼굴 허용(faceParts.root만·눈/입 pseudo=파츠 아님)',
  inSrc("faceParts:{root:'sb-ic-head'}") &&
  (function () { const p = stage.bossProfile('shell_iron'); return p && p.faceParts && p.faceParts.root === 'sb-ic-head' && !p.faceParts.eyeL && !p.faceParts.mouth; })(), '');

/* ===== D. Face ===== */
chk('d1 face 어휘(default neutral·allowed neutral/tell·미채택은 candidateFaces 보존)',
  inSrc("defaultFace:'neutral',allowedFaces:['neutral','tell'],candidateFaces:['hurt','groggy','enraged','defeated']") &&
  inSrc("faceRules:[{face:'tell',when:{bossActionKind:'smash'}}]"), '');

chk('d2 data-pose와 data-face 분리(다른 속성·presenter는 face만 소유)',
  pbB.indexOf("setAttribute('data-face'") >= 0 && pbB.indexOf('data-pose') < 0 &&
  prB.indexOf('data-face') < 0 && inSrc("applyActorPose(el,pose)".replace('el,pose', 'el,pose')) === inSrc("applyActorPose(el,pose)"), '');

chk('d3 hurt/groggy/defeated 가짜 신호 0(faceRules는 실 truth 1종만·임의 timer 0)',
  (function () {
    const p = stage.bossProfile('shell_iron');
    return p && p.faceRules.length === 1 && p.faceRules[0].face === 'tell' &&
      !/{face:'(hurt|groggy|defeated|enraged)'/.test(f5) && f5Code.indexOf('setTimeout') < 0;
  })(), '');

try {
  h.sb.CUR_BOSS = 'shell_iron';
  const g = s.createGame('shell_iron'); g.start(); g.step(0.05);
  const idle = stage.resolveBossFace('shell_iron', stage.deriveSnapshot(g.S, g));
  const sav = g.S.boss.cast;
  g.S.boss.cast = { kind: 'smash', name: 'x', tg: 'war', start: g.S.t, end: g.S.t + 1.6 };
  const tell = stage.resolveBossFace('shell_iron', stage.deriveSnapshot(g.S, g));
  g.S.boss.cast = { kind: 'judge', name: 'y', tg: null, start: g.S.t, end: g.S.t + 1 };
  const other = stage.resolveBossFace('shell_iron', stage.deriveSnapshot(g.S, g));
  g.S.boss.cast = sav;
  h.sb.CUR_BOSS = 'boss01';
  chk('d4 default→neutral · smash 예고→tell · 비-smash 시전→neutral',
    idle.face === 'neutral' && idle.reason === 'default' && tell.face === 'tell' && tell.reason === 'rule:0' &&
    other.face === 'neutral', JSON.stringify({ i: idle.face, t: tell.face, o: other.face }));
  chk('d5 미등록 boss face=안전 fallback(예외 0) · bad snapshot=defaultFace',
    stage.resolveBossFace('nope', stage.deriveSnapshot(g.S, g)).face === '' &&
    stage.resolveBossFace('shell_iron', null).face === 'neutral', '');
} catch (e) { chk('d4/d5 face(예외)', false, e.message); }

chk('d6 불허 face → defaultFace fallback(allowedFaces 게이트)',
  rfB.indexOf('profile.allowedFaces.indexOf(r.face)<0') >= 0 && rfB.indexOf("reason:'not-allowed'") < 0 === false, '');

/* ===== E. Iron Crusher 등가 ===== */
chk('e1 기존 pose 규칙/어휘 무변경(windup=smash 예고·allowedPoses)',
  inSrc("{pose:'windup',when:{bossActionKind:'smash'}}") && inSrc("allowedPoses:['windup']") &&
  inSrc("boss_iron:{actorId:'boss_iron'"), '');

chk('e2 몸 CSS는 pose가 계속 소유(react/hammer 무변경)',
  inSrc('#stage .sb-iron-crusher[data-pose="windup"] .sb-react{transform:rotate(-3deg) translateY(-2px)}') &&
  inSrc('#stage .sb-iron-crusher[data-pose="windup"] .sb-ic-hammer{transform:rotate(-18deg) translate(2px,-18px)}'), '');

chk('e3 얼굴 CSS는 face가 소유(선언 이관·값 byte 보존·구 pose-head 규칙 잔존 0)',
  inSrc('#stage .sb-iron-crusher[data-face="tell"] .sb-ic-head{transform:translateX(calc(-50% - 3px)) rotate(-3deg)}') &&
  !inSrc('[data-pose="windup"] .sb-ic-head'), '');

try { // ★핵심 등가: 전 전투 구간에서 face 'tell' ⟺ pose 'windup' (CSS 이관이 모든 상태에서 안전함을 증명)
  h.sb.CUR_BOSS = 'shell_iron';
  const g = s.createGame('shell_iron'); g.start();
  let ticks = 0, mismatch = 0, seenTell = 0, seenNeutral = 0;
  while (!g.S.over && ticks < 4000) {
    g.step(0.05); ticks++;
    const snap = stage.deriveSnapshot(g.S, g);
    const pose = stage.resolvePose('boss_iron', snap).pose;
    const face = stage.resolveBossFace('shell_iron', snap).face;
    if ((pose === 'windup') !== (face === 'tell')) mismatch++;
    if (face === 'tell') seenTell++; else seenNeutral++;
  }
  h.sb.CUR_BOSS = 'boss01';
  chk('e4 전 전투 face tell ⟺ pose windup 등가(' + ticks + ' ticks·mismatch 0·양 상태 커버)',
    mismatch === 0 && seenTell > 0 && seenNeutral > 0, 'mismatch=' + mismatch + ' tell=' + seenTell + ' neutral=' + seenNeutral);
} catch (e) { chk('e4 등가 스윕(예외)', false, e.message); }

chk('e5 기존 anchor weapon/body 정의 무변경(강타선 source/target 계보 보존)',
  inSrc("weapon:{part:'sb-ic-hammer',topBias:1,label:'망치 자루 상단(강타선 source)'}") &&
  inSrc("body:{part:'sb-ic-body',label:'철괴 몸통'}") &&
  inSrc("resolveAnchor('boss_iron','weapon')") && inSrc("resolveAnchor(bc.tg,'body')"), '');

chk('e6 파쇄자 배치/크기 상수 무변경(scale/top/z·fig 규격·breathe)',
  inSrc('#sb-boss-fig{left:50%;top:-8px;transform:translateX(-50%) scale(1.04);transform-origin:50% 0;display:none;z-index:2}') &&
  inSrc('#stage .sb-iron-crusher .sb-fig{width:190px;height:212px;animation:sbBreatheHeavy 4.8s ease-in-out infinite}') &&
  inSrc('#stage.sb-boss-iron #sb-boss-fig{display:block}'), '');

chk('e7 신규 시각 효과 0(F5는 새 CSS 애니메이션/FX/오버레이 0 — 선언 이관 1줄만)',
  f5.indexOf('@keyframes') < 0 && f5.indexOf('animation:') < 0 && f5.indexOf('opacity') < 0 &&
  !/#stage .sb-iron-crusher\[data-face="(neutral|hurt|groggy)"\]/.test(src), '');

chk('e8 markup 무변경(파츠 7종·순서·클래스 그대로)',
  inSrc('<div class="sb-unit sb-iron-crusher" id="sb-boss-fig" data-pose=""><div class="sb-react"><div class="sb-fit"><div class="sb-fig"><span class="sb-part sb-shadow"></span><span class="sb-part sb-aura"></span><span class="sb-part sb-ic-body"></span><span class="sb-part sb-ic-core"></span><span class="sb-part sb-ic-pauldrons"></span><span class="sb-part sb-ic-head"></span><span class="sb-part sb-ic-hammer"></span></div></div></div></div>'), '');

/* ===== F. 기반 경계 ===== */
chk('f1 F2 generic pose resolver 무수정(F5 토큰 0·의미 불변)',
  rvB.indexOf('BOSS_STAGE_PROFILE') < 0 && rvB.indexOf('resolveBossFace') < 0 && rvB.indexOf('data-face') < 0 &&
  rvB.indexOf('shellId') < 0 && rvB.length > 100, '');

chk('f2 F3 generic anchor resolver 무수정(F5 토큰 0·좌표 산식 단일 소유)',
  raB.indexOf('BOSS_STAGE_PROFILE') < 0 && raB.indexOf('data-face') < 0 && raB.indexOf('shellId') < 0 &&
  raB.indexOf('sbPt(prof.figId,def.part,def.topBias?1:0)') >= 0, '');

chk('f3 F5는 자체 rect/캐시/listener 0(좌표는 resolveAnchor 위임만)',
  f5Code.indexOf('getBoundingClientRect') < 0 && f5Code.indexOf('addEventListener') < 0 &&
  f5Code.indexOf('sbPt(') < 0 && rAncB.indexOf('resolveAnchor(profile.actorId,anchorName)') >= 0, '');

chk('f4 gameplay 쓰기 0 · timer 0 · S.ev/drain 무변경',
  !/\bS\.\w+\s*=[^=]/.test(GENERIC) && !/\bG\.\w+\s*=[^=]/.test(GENERIC) &&
  f5Code.indexOf('setTimeout') < 0 && f5Code.indexOf('setInterval') < 0 &&
  (src.match(/\.ev\.splice\(0\)/g) || []).length === 1 &&
  (src.match(/sgObserve\(e,G\.S\);/g) || []).length === 1 && inSrc('seedOnHit(e.tg)'), '');

chk('f5 CORE에 figure/face/shell/registry 참조 0(gameplay가 face 이름을 모름)',
  !/BOSS_STAGE_PROFILE|BOSS_FIGURE_SHELL|resolveBossFace|data-face|shellId|'tell'|'neutral'/.test(core), '');

chk('f6 F4A support cue 무변경(경계/발화 계약 보존)',
  inSrc("function sbSupportCue(S){sbSupportCueRun(S,sgSnapshot(S,") &&
  inSrc("resolveAnchor('sham','body')") && inSrc("resolveAnchor(id,'head')") &&
  inSrc('animation:sbSupWave') && inSrc('animation:sbHeadPing'), '');

chk('f7 F4 동료 pose 무변경(전사/도적/마법사/주술사 규칙)',
  inSrc("{pose:'guard',when:{actorAlive:true,actorShielded:true}}") &&
  inSrc("{pose:'brace',when:{actorAlive:true,bossActionKind:'smash'}}") &&
  inSrc("{pose:'interrupt',when:{actorAlive:true,bossActionKind:'judge',interruptStance:'ready'}}") &&
  inSrc("{pose:'channel',when:{actorAlive:true,battleActive:true,bossActing:false}}") &&
  inSrc("{pose:'sustain',when:{actorAlive:true,valorActive:true}}"), '');

chk('f8 render 순서=pose→face→cue(figure 상태가 cue보다 먼저·주연 순서 보존)',
  inSrc('sbFigPose(S);sbBossFigure(S);sbSupportCue(S);'), '');

chk('f9 Actor Registry 연결(boss_iron→bossStageProfile 참조·pose resolver는 이 키를 읽지 않음)',
  inSrc("bossStageProfile:'shell_iron'") && rvB.indexOf('bossStageProfile') < 0 && cdB.indexOf('bossStageProfile') < 0 &&
  (function () { const p = stage.actorProfile('boss_iron'); return p && p.bossStageProfile === 'shell_iron' && p.actorId === 'boss_iron'; })(), '');

// 〔승계 — F6(docs/68 §14·§16)〕 F5는 "신규 actor 0"이 맞았고, F6는 새 보스를 등록하는 카드다 → 의미를 "F5 기반이 소유한
// 기존 등록(파쇄자·동료 4인·fxAnchors 계보)은 불변, 추가는 모르가스 1종뿐"으로 승계. 동료/파쇄자/boss/pri 항목·순서 그대로.
// 〔승계 — F7(docs/69 §19)〕 심연 actor 추가. ★anchor 목록은 불변 — 심연은 cast를 안 해 A.boss 소비자가 전부 OFF이므로
// 실사용 anchor가 0이고, 따라서 anchor를 등록하지 않았다(미사용 선등록 ⛔). 기존 항목·순서 불변.
chk('f10 Actor/Anchor 등록: 기존 항목 불변 + 보스 actor만 추가(anchor 목록 불변)',
  stage.actors().join(',') === 'boss_iron,boss_morgas,boss_abyss,war,rog,mage,sham' &&
  JSON.stringify(stage.anchors()) === JSON.stringify(['boss_iron', 'war', 'rog', 'mage', 'sham', 'boss_morgas', 'boss', 'pri']), '');

/* ===== G. Cleanup ===== */
chk('g1 owner cleanup 존재(문맥 밖 data-face 제거·F2 presenter와 동일 규약)',
  cbB.indexOf("setAttribute('data-face','')") >= 0 && drvB.indexOf('clearBossFigure(p)') >= 0 &&
  drvB.indexOf('continue') >= 0, '');

chk('g2 presenter idempotent(같은 값 재기록 0·class churn 0)',
  pbB.indexOf("el.getAttribute('data-face')!==f") >= 0 && pbB.indexOf('className') < 0 && pbB.indexOf('classList') < 0, '');

chk('g3 stale 관측 계약(debug에 staleFaceCount/duplicateRoot/rootCount)',
  inSrc('staleFaceCount') && inSrc('duplicateRoot') && inSrc('rootCount'), '');

chk('g4 duplicate part id 0(파츠는 class·id 아님 — markup에 sb-ic-* id 0)',
  !/id="sb-ic-/.test(src) && (src.match(/id="sb-boss-fig"/g) || []).length === 1, '');

/* ===== H. 회귀 ===== */
try {
  const m = s.smoke(), i = s.smoke('shell_iron'), t = s.smoke('shell_thirst');
  chk('h1 스모크 3종 불변(51.4/1029·48.5/971·61.8/1236·F5=render 하류·gameplay 무접촉)',
    m.t === 51.4 && m.steps === 1029 && i.t === 48.5 && i.steps === 971 && t.t === 61.8 && t.steps === 1236,
    m.t + '/' + m.steps + ' · ' + i.t + '/' + i.steps + ' · ' + t.t + '/' + t.steps);
} catch (e) { chk('h1 스모크(예외)', false, e.message); }
{
  const buf = fs.readFileSync(path.join(ROOT, 'index.html'));
  const cmd5 = crypto.createHash('md5').update(core).digest('hex');
  chk('h2 CORE byte-identical(466/22,521/6cad2ec2)',
    coreLines.length === 466 && Buffer.byteLength(core, 'utf8') === 22521 &&
    cmd5 === '6cad2ec271a2a79afbee881c2a2e0856', coreLines.length + '/' + cmd5.slice(0, 8));
  chk('h3 index.html 신 기준선(227,650 B · md5 5d645ffc…)',
    buf.length === 227650 &&
    crypto.createHash('md5').update(buf).digest('hex') === '5d645ffcf1592f1430b73647f4c39ccb', buf.length + 'B');
}
chk('h4 docs/67 필수 절(감사·Profile·Shell·Face·분리·slot·fallback·mapping·anchor·ownership·lifecycle·cleanup·등가·관측·F6·F7·closeout)',
  doc.length > 5000 &&
  ['감사', 'Profile', 'Shell', 'Face', '분리', 'slot', 'fallback', 'mapping', 'anchor',
   'ownership', 'lifecycle', 'cleanup', '등가', '관측', 'F6', 'F7', 'closeout', '비변경']
    .every(t => doc.indexOf(t) >= 0), '');

console.log(`\n${fail === 0 ? '★ BOSS FIGURE SHELL / FACE TEMPLATE 01 CHECK PASS' : '★ BOSS FIGURE SHELL / FACE TEMPLATE 01 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
