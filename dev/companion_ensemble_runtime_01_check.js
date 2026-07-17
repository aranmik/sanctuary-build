'use strict';
// Companion Ensemble Runtime 01 (F4) 전용 검증
// 실행: node dev/companion_ensemble_runtime_01_check.js
// A 기반 경계 · B Actor 등록 · C 전사 회귀 · D~F 동료 신호 연결 · G lifecycle · H 회귀.
// 원칙: 공통 resolver 무수정. 승인 포즈를 실제 지속 신호에 연결. 신호 없는 포즈는 억지로 쓰지 않는다.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const DOC = path.join(ROOT, 'docs', '65_COMPANION_ENSEMBLE_RUNTIME_01.md');
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
const rvB = fnBody('resolveActorPose').replace(/\/\*[\s\S]*?\*\//g, '');
const cdB = fnBody('sgPoseCond').replace(/\/\*[\s\S]*?\*\//g, '');
const prB = fnBody('sbFigPose').replace(/\/\*[\s\S]*?\*\//g, '');
const snB = fnBody('sgSnapshot').replace(/\/\*[\s\S]*?\*\//g, '');
const f2A = src.indexOf('/* ===== F2: Actor Registry & Pose Map Foundation 01');
const f2B = src.indexOf('function renderFx(');
const f2 = (f2A >= 0 && f2B > f2A) ? src.slice(f2A, f2B) : '';
const coreLines = [];
{ let f = 0; for (const l of src.split('\n')) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) coreLines.push(l); } }
const core = coreLines.join('\n') + '\n';

/* ===== A. 기반 경계 ===== */

chk('a1 generic resolver/조건 해석기/presenter에 Actor/직업/보스 id 분기 0(F4 후에도)',
  rvB.length > 100 && cdB.length > 100 && prB.length > 50 &&
  ['war', 'boss_iron', 'shell_iron', 'rog', 'mage', 'sham', 'boss01', 'shell_thirst']
    .every(id => rvB.indexOf("'" + id + "'") < 0 && cdB.indexOf("'" + id + "'") < 0 && prB.indexOf("'" + id + "'") < 0) &&
  rvB.indexOf('switch(') < 0 && cdB.indexOf('switch(') < 0 && prB.indexOf('switch(') < 0, '');

chk('a2 CORE에 pose 이름/registry 참조 0(gameplay가 pose 이름을 모름)',
  !/interrupt|channel|sustain|windup|guard|brace|data-pose|ACTOR_REGISTRY|resolveActorPose/.test(core), '');

chk('a3 sgPoseCond 신규 키=snapshot 순수 읽기(gameplay 쓰기·DOM 0)',
  cdB.indexOf('valorActive') >= 0 && cdB.indexOf('interruptStance') >= 0 &&
  cdB.indexOf('battleActive') >= 0 && cdB.indexOf('bossActing') >= 0 &&
  !/\bS\.\w+\s*=[^=]/.test(cdB) && cdB.indexOf('getElementById') < 0, '');

chk('a4 S.ev/drain 무변경(splice 1곳·tap 1곳·seedOnHit 원위치)',
  (src.match(/\.ev\.splice\(0\)/g) || []).length === 1 &&
  (src.match(/sgObserve\(e,G\.S\);/g) || []).length === 1 && inSrc('seedOnHit(e.tg)'), '');

chk('a5 F3 Anchor Registry 무변경(강타선 anchor 요청·validity 계약 그대로)',
  inSrc("resolveAnchor('boss_iron','weapon')") && inSrc("weapon:{part:'sb-ic-hammer',topBias:1") &&
  inSrc('r.width>0||r.height>0'), '');

chk('a6 interruptStance=순수 파생(sgSnapshot에서 S.intReady 읽기만·gameplay 무변)',
  snB.indexOf('interruptStance') >= 0 && snB.indexOf('S.intReady') >= 0 &&
  !/\bS\.\w+\s*=[^=]/.test(snB), '');

/* ===== B. Actor 등록 ===== */

chk('b1 전사 profile 유지(guard/brace·순서)',
  f2.indexOf("war:{actorId:'war'") >= 0 && f2.indexOf("allowedPoses:['guard','brace']") >= 0 &&
  f2.indexOf("{pose:'guard'") < f2.indexOf("{pose:'brace'"), '');

chk('b2 동료 3인 등록(rog/mage/sham·figId·snapshotKey)',
  f2.indexOf("rog:{actorId:'rog',kind:'companion',figId:'sb-rog-fig'") >= 0 &&
  f2.indexOf("mage:{actorId:'mage',kind:'companion',figId:'sb-mage-fig'") >= 0 &&
  f2.indexOf("sham:{actorId:'sham',kind:'companion',figId:'sb-sham-fig'") >= 0 &&
  (f2.match(/snapshotKey:'(rog|mage|sham)'/g) || []).length === 3, '');

chk('b3 승인 포즈만 채택(interrupt/channel/sustain)+미채택은 candidatePoses 보존',
  inSrc("allowedPoses:['interrupt']") && inSrc("allowedPoses:['channel']") && inSrc("allowedPoses:['sustain']") &&
  inSrc("candidatePoses:['dash','strike','recover']") && inSrc("candidatePoses:['charge','release','aftercast']") &&
  inSrc("candidatePoses:['cleanse','pulse','rescue']"), '');

chk('b4 poseRules=승인 포즈+실제 신호 매핑',
  inSrc("{pose:'interrupt',when:{actorAlive:true,bossActionKind:'judge',interruptStance:'ready'}}") &&
  inSrc("{pose:'channel',when:{actorAlive:true,battleActive:true,bossActing:false}}") &&
  inSrc("{pose:'sustain',when:{actorAlive:true,valorActive:true}}"), '');

chk('b5 포즈 CSS 이식(승인 [51]·#stage scope·연결분만)',
  inSrc('#stage .sb-rogue[data-pose="interrupt"] .sb-r-dagger') &&
  inSrc('#stage .sb-mage[data-pose="channel"] .sb-m-orb') &&
  inSrc('#stage .sb-shaman[data-pose="sustain"] .sb-aura') &&
  !inSrc('data-pose="strike"') && !inSrc('data-pose="release"') && !inSrc('data-pose="cleanse"'), '');

/* ===== 하네스 ===== */
let h = null, s = null, stage = null;
try { h = require('./harness.js'); s = h.sb.window.__seedHealer; stage = s.stage; } catch (e) { console.log('HARNESS FAIL ' + e.message); }
// 〔승계 — F6(docs/68 §14)〕 모르가스 boss actor 등록으로 목록 확장 — 동료 4인 등록·순서·의미 불변
chk('b6 debug accessor(resolvePose/actors/poseStats·F1~F3 API 공존)',
  !!(stage && stage.resolvePose && stage.actors && stage.poseStats && stage.anchor && stage.deriveSnapshot) &&
  stage.actors().join(',') === 'boss_iron,boss_morgas,boss_abyss,war,rog,mage,sham', '');

function run(bossId, until, inputs, watch) {
  h.sb.CUR_BOSS = bossId;
  const g = s.createGame(bossId); g.start();
  const inp = (inputs || []).slice(); const rec = {};
  let steps = 0;
  while (!g.S.over && g.S.t < until && steps < 4000) {
    g.step(0.05); steps++;
    while (inp.length && g.S.t >= inp[0].t) { const c = inp.shift(); g[c.fn].apply(null, c.args || []); }
    const snap = stage.deriveSnapshot(g.S, g);
    for (const id of watch) { const p = stage.resolvePose(id, snap).pose; rec[id] = rec[id] || {}; rec[id][p] = (rec[id][p] || 0) + 1; }
  }
  h.sb.CUR_BOSS = 'boss01';
  return { rec, steps, result: g.S.result };
}

/* ===== C. 전사 회귀 (F2 오라클 등가) ===== */
try {
  const g = s.createGame('shell_iron'); g.start();
  function warOracle(S) { const bc = S.boss.cast, sm = !!(bc && bc.kind === 'smash'); let w = null; for (const a of S.al) if (a.id === 'war') w = a; let wp = ''; if (w && w.alive) { if (w.shield && w.shield.amt > 0) wp = 'guard'; else if (sm) wp = 'brace'; } return wp; }
  const inputs = [{ t: 2, fn: 'useSkill', a: ['heal'] }, { t: 3, fn: 'useSkill', a: ['shield'] }, { t: 9, fn: 'useSkill', a: ['big'] }, { t: 20, fn: 'useSkill', a: ['shield'] }];
  h.sb.CUR_BOSS = 'shell_iron';
  let diff = 0, ticks = 0; const wseen = {};
  const inp = inputs.slice();
  while (!g.S.over && ticks < 4000) {
    g.step(0.05); ticks++;
    while (inp.length && g.S.t >= inp[0].t) { const c = inp.shift(); g[c.fn].apply(null, c.a); }
    const snap = stage.deriveSnapshot(g.S, g);
    const nw = stage.resolvePose('war', snap).pose, ow = warOracle(g.S);
    if (nw !== ow) diff++;
    wseen[nw] = 1;
  }
  h.sb.CUR_BOSS = 'boss01';
  chk('c1 전사 F2 오라클 등가(매 tick·' + ticks + ' ticks·diff 0)', diff === 0, 'diff=' + diff);
  chk('c2 전사 포즈 커버리지(guard·brace·default)', wseen['guard'] && wseen['brace'] && wseen[''], Object.keys(wseen).join(','));
} catch (e) { chk('c* 전사 회귀(예외)', false, e.message); }

/* ===== D. 도적 (judge interrupt — 실 신호) ===== */
try {
  const iron = run('shell_iron', 999, [], ['rog']);
  chk('d1 도적 파쇄자에선 default only(judge 없음 — 억지 포즈 0)',
    Object.keys(iron.rec.rog).join(',') === '', JSON.stringify(iron.rec.rog));
  const mor = run('boss01', 20, [], ['rog']);
  chk('d2 도적 모르가스 judge 차단 창에서 interrupt 발동(실 신호)',
    !!mor.rec.rog['interrupt'] && !!mor.rec.rog[''], JSON.stringify(mor.rec.rog));
  const g = s.createGame('boss01'); g.start(); h.sb.CUR_BOSS = 'boss01';
  let seenReady = false;
  while (!g.S.over && g.S.t < 40) { g.step(0.05); const sn = stage.deriveSnapshot(g.S, g); if (sn.interruptStance === 'ready') seenReady = true; }
  // 광폭화 stance는 test-only 합성으로 확인(무입력 boss01은 51초 전멸로 enrage[60s] 미도달)
  const ge = s.createGame('boss01'); ge.start(); ge.step(0.05);
  const savE = ge.S.boss.enraged; ge.S.boss.enraged = true;
  const enrStance = stage.deriveSnapshot(ge.S, ge).interruptStance;
  ge.S.boss.enraged = savE;
  h.sb.CUR_BOSS = 'boss01';
  chk('d3 interruptStance 정밀(ready 창 존재·광폭화 시 unable)', seenReady && enrStance === 'unable', 'ready=' + seenReady + ' enrStance=' + enrStance);
} catch (e) { chk('d* 도적(예외)', false, e.message); }

/* ===== E. 마법사 (channel) ===== */
try {
  const iron = run('shell_iron', 999, [{ t: 2, fn: 'useSkill', args: ['heal'] }, { t: 8, fn: 'useSkill', args: ['heal'] }, { t: 14, fn: 'useSkill', args: ['heal'] }], ['mage']);
  chk('e1 마법사 channel 발동(보스 비시전 창)+보스 시전 시 default(브레이스 비트)',
    !!iron.rec.mage['channel'] && !!iron.rec.mage[''], JSON.stringify(iron.rec.mage));
  const g = s.createGame('shell_iron'); g.start(); h.sb.CUR_BOSS = 'shell_iron';
  let e2 = 0; while (!g.S.over && e2 < 2000) { g.step(0.05); e2++; }
  const snapEnd = stage.deriveSnapshot(g.S, g);
  h.sb.CUR_BOSS = 'boss01';
  chk('e2 전투 종료 후 마법사 default(channel 미유지·battleActive false)',
    stage.resolvePose('mage', snapEnd).pose === '', JSON.stringify(stage.resolvePose('mage', snapEnd)));
} catch (e) { chk('e* 마법사(예외)', false, e.message); }

/* ===== F. 주술사 (sustain) ===== */
try {
  const iron = run('shell_iron', 999, [{ t: 2, fn: 'useSkill', args: ['heal'] }, { t: 8, fn: 'useSkill', args: ['heal'] }, { t: 14, fn: 'useSkill', args: ['heal'] }, { t: 20, fn: 'useSkill', args: ['heal'] }, { t: 26, fn: 'useSkill', args: ['heal'] }], ['sham']);
  chk('f1 주술사 sustain 발동(전투 의지 창)+창 밖 default',
    !!iron.rec.sham['sustain'] && !!iron.rec.sham[''], JSON.stringify(iron.rec.sham));
  const g = s.createGame('shell_iron'); g.start(); h.sb.CUR_BOSS = 'shell_iron';
  while (!g.S.over && g.S.t < 24) g.step(0.05);
  const inValor = stage.resolvePose('sham', stage.deriveSnapshot(g.S, g)).pose;
  while (!g.S.over && g.S.t < 40) g.step(0.05);
  const afterValor = stage.resolvePose('sham', stage.deriveSnapshot(g.S, g)).pose;
  h.sb.CUR_BOSS = 'boss01';
  chk('f2 주술사 valor 창 sustain→만료 후 default 복귀', inValor === 'sustain' && afterValor === '', 'in=' + inValor + ' after=' + afterValor);
} catch (e) { chk('f* 주술사(예외)', false, e.message); }

/* ===== G. lifecycle / fallback ===== */
try {
  h.sb.ACTOR_REGISTRY.__t = { actorId: '__t', figId: 'x', stageContext: null, snapshotKey: null, defaultPose: '', allowedPoses: ['z'], poseRules: [{ pose: 'z', when: { zzzKey: true } }] };
  const gr = s.createGame('shell_iron'); gr.start(); gr.step(0.05);
  const rz = stage.resolvePose('__t', stage.deriveSnapshot(gr.S, gr));
  delete h.sb.ACTOR_REGISTRY.__t;
  chk('g1 미지 조건 키 → 불일치(default·crash 0)', rz.pose === '' && rz.reason === 'default', JSON.stringify(rz));
  const gd = s.createGame('shell_iron'); gd.start(); gd.step(0.05);
  const rog = gd.S.al.find(a => a.id === 'rog'); const sav = rog.alive; rog.alive = false;
  const dead = stage.resolvePose('rog', stage.deriveSnapshot(gd.S, gd)).pose; rog.alive = sav;
  chk('g2 사망 actor → default(actorAlive:true 미충족)', dead === '', dead);
  chk('g3 presenter owner cleanup(문맥 밖 figure reset·stale 0)',
    prB.indexOf("applyActorPose(document.getElementById(p.figId),'')") >= 0 && prB.indexOf('continue') >= 0, '');
  const gp = s.createGame('shell_iron'); gp.start(); for (let i = 0; i < 40; i++) gp.step(0.05);
  const snp = stage.deriveSnapshot(gp.S, gp);
  chk('g4 반복 resolve 순수(같은 snapshot 동일 결과)',
    JSON.stringify(stage.resolvePose('mage', snp)) === JSON.stringify(stage.resolvePose('mage', snp)) &&
    JSON.stringify(stage.resolvePose('sham', snp)) === JSON.stringify(stage.resolvePose('sham', snp)), '');
} catch (e) { chk('g* lifecycle(예외)', false, e.message); }

/* ===== H. 회귀 ===== */
try {
  const m = s.smoke(), i = s.smoke('shell_iron'), t = s.smoke('shell_thirst');
  chk('h1 스모크 3종 불변(51.4/1029·48.5/971·61.8/1236·pose ON/OFF 등가=render 무접촉)',
    m.t === 51.4 && m.steps === 1029 && i.t === 48.5 && i.steps === 971 && t.t === 61.8 && t.steps === 1236,
    m.t + '/' + m.steps + ' · ' + i.t + '/' + i.steps + ' · ' + t.t + '/' + t.steps);
} catch (e) { chk('h1 스모크(예외)', false, e.message); }
{
  const buf = fs.readFileSync(path.join(ROOT, 'index.html'));
  const cmd5 = crypto.createHash('md5').update(core).digest('hex');
  chk('h2 CORE byte-identical(466/22,521/6cad2ec2)',
    coreLines.length === 466 && Buffer.byteLength(core, 'utf8') === 22521 &&
    cmd5 === '6cad2ec271a2a79afbee881c2a2e0856', coreLines.length + '/' + cmd5.slice(0, 8));
  chk('h3 index.html 현행 기준선(213,295 B · md5 afe3de3a…)',
    buf.length === 213295 &&
    crypto.createHash('md5').update(buf).digest('hex') === 'afe3de3af0ddffc81ba9e0a090e1892e', '');
}
chk('h4 docs/65 필수 절(감사·채택/미채택·신호 대응표·priority·Ensemble·lifecycle·cleanup·이식·등가·관측·Human Gate·F5 계약)',
  doc.length > 4000 &&
  ['Pose Pack 감사', '채택', '미채택', '신호 대응', 'priority', 'Ensemble', 'lifecycle', 'cleanup',
   '이식', '등가', '관측', 'Human Gate', 'F5'].every(t => doc.indexOf(t) >= 0), '');

console.log(`\n${fail === 0 ? '★ COMPANION ENSEMBLE RUNTIME 01 CHECK PASS' : '★ COMPANION ENSEMBLE RUNTIME 01 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
