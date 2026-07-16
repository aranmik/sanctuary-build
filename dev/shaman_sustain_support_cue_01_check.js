'use strict';
// Shaman Sustain Support Cue 01 (F4A) 전용 검증
// 실행: node dev/shaman_sustain_support_cue_01_check.js
// A 신호 경계 · B 기반 경계 · C 파동 · D Party Ping · E Ensemble · F 회귀.
// 원칙: 진리(valorActive) false→true 1회 · Stage 전용 표현 · gameplay/valor/S.ev/drain/공통 resolver 무접촉.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const DOC = path.join(ROOT, 'docs', '66_SHAMAN_SUSTAIN_SUPPORT_CUE_01.md');
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
const runB = fnBody('sbSupportCueRun').replace(/\/\*[\s\S]*?\*\//g, '');
const fireB = fnBody('scFireSupport').replace(/\/\*[\s\S]*?\*\//g, '');
const spawnB = fnBody('scSpawn').replace(/\/\*[\s\S]*?\*\//g, '');
const hardB = fnBody('scHardReset').replace(/\/\*[\s\S]*?\*\//g, '');
// 공통 resolver 본문(무수정 확인용)
const rvB = fnBody('resolveActorPose').replace(/\/\*[\s\S]*?\*\//g, '');
const cdB = fnBody('sgPoseCond').replace(/\/\*[\s\S]*?\*\//g, '');
const prB = fnBody('sbFigPose').replace(/\/\*[\s\S]*?\*\//g, '');
const raB = fnBody('resolveAnchor').replace(/\/\*[\s\S]*?\*\//g, '');
// F4A 블록 전체(주석 제거) — setTimeout/setInterval 범위 확인용
const f4aA = src.indexOf('/* ===== F4A: Shaman Sustain Support Cue 01');
const f4aB = src.indexOf('function render(');
const f4a = (f4aA >= 0 && f4aB > f4aA) ? src.slice(f4aA, f4aB) : '';
const f4aCode = f4a.replace(/\/\*[\s\S]*?\*\//g, '');
const coreLines = [];
{ let f = 0; for (const l of src.split('\n')) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) coreLines.push(l); } }
const core = coreLines.join('\n') + '\n';

/* ===== 하네스 ===== */
let h = null, s = null, stage = null;
try { h = require('./harness.js'); s = h.sb.window.__seedHealer; stage = s.stage; } catch (e) { console.log('HARNESS FAIL ' + e.message); }

// 한 전투를 구동하며 cue edge를 계측 — cueDrive는 render의 sbSupportCue와 동일한 sbSupportCueRun 경로.
function driveBattle(bossId, until, inputs, kills) {
  h.sb.CUR_BOSS = bossId;
  const g = s.createGame(bossId); g.start();
  stage.cueReset();
  const inp = (inputs || []).slice(); const kl = (kills || []).slice();
  let edges = 0, reFire = 0, drops = 0, windows = 0, prevActive = false, firstFire = null, steps = 0, lastState = null, maxLive = 0;
  while (!g.S.over && g.S.t < until && steps < 4000) {
    g.step(0.05); steps++;
    while (inp.length && g.S.t >= inp[0].t) { const c = inp.shift(); g[c.fn].apply(null, c.args || []); }
    for (let i = kl.length - 1; i >= 0; i--) { if (g.S.t >= kl[i].t) { const a = g.S.al.find(x => x.id === kl[i].id); if (a) a.alive = false; kl.splice(i, 1); } }
    const snap = stage.deriveSnapshot(g.S, g);
    const before = stage.cueState().gen;
    const stt = stage.cueDrive(g.S, snap);
    const active = !!snap.valorActive;
    if (active && !prevActive) windows++;             // valor 창 시작 경계(진리)
    if (stt.gen > before) { edges++; if (!(active && !prevActive)) reFire++; if (!firstFire) firstFire = stt.lastFire; }
    if (!active && prevActive) drops++;
    if (stt.live > maxLive) maxLive = stt.live;
    prevActive = active; lastState = stt;
  }
  h.sb.CUR_BOSS = 'boss01';
  return { edges, reFire, drops, windows, firstFire, lastState, result: g.S.result, steps, g };
}

/* ===== A. 신호 경계 ===== */
try {
  const r = driveBattle('shell_iron', 999, [{ t: 2, fn: 'useSkill', args: ['heal'] }, { t: 8, fn: 'useSkill', args: ['heal'] }, { t: 14, fn: 'useSkill', args: ['heal'] }]);
  chk('a1 valorActive false→true 시작 경계마다 정확히 1회 발화(edges=windows≥1)', r.edges === r.windows && r.windows >= 1 && !!r.firstFire, 'edges=' + r.edges + ' windows=' + r.windows);
  chk('a2 true 유지 중 재발생 0(edge 아닌 gen 증가 0)', r.reFire === 0, 'reFire=' + r.reFire);
  chk('a3 true→false cleanup(유지 종료·holding false·전투 종료 후 live 0)', r.drops >= 1 && r.lastState.holding === false && r.lastState.live === 0, 'drops=' + r.drops + ' hold=' + r.lastState.holding + ' live=' + r.lastState.live);
  // battle 경계=fresh: cueReset(=newGame sgReset 경계 등가)로 상태 초기화 후 재-발화
  const st0 = stage.cueReset();
  const fresh = st0.prev === false && st0.live === 0 && st0.gen === 0 && st0.lastFire === null;
  const r2 = driveBattle('shell_iron', 999, [{ t: 2, fn: 'useSkill', args: ['heal'] }, { t: 8, fn: 'useSkill', args: ['heal'] }, { t: 14, fn: 'useSkill', args: ['heal'] }]);
  chk('a4 newGame/battle 경계 후 신선(stale 0)·재-발화(edges=windows≥1)', fresh && r2.edges === r2.windows && r2.windows >= 1, 'fresh=' + fresh + ' edges2=' + r2.edges + '/win=' + r2.windows);
  chk('a5 battle 경계 guard 존재(SG.battle 변화→scHardReset·prev 리셋·발화 없음)',
    runB.indexOf('SC_CUE.battle!==SG.battle') >= 0 && runB.indexOf('scHardReset()') >= 0 &&
    hardB.indexOf('SC_CUE.prev=false') >= 0 && hardB.indexOf('SC_CUE.els.length=0') >= 0, '');
  // 〔승계 — F5(docs/67)〕 render 배선에 sbBossFigure(얼굴 presenter)가 pose와 cue 사이로 들어옴 — 형태 핀만 갱신·의미(figure 상태가 cue보다 먼저) 불변
  chk('a6 render 진입점=cueDrive와 동일 경로(sbSupportCue→sbSupportCueRun(snap))',
    inSrc('function sbSupportCue(S){sbSupportCueRun(S,sgSnapshot(S,') && inSrc('sbFigPose(S);sbBossFigure(S);sbSupportCue(S);'), '');
} catch (e) { chk('a* 신호 경계(예외)', false, e.message); }

/* ===== B. 기반 경계 ===== */
chk('b1 gameplay state/판정 쓰기 0(SC_CUE는 시각 필드만·dmg/heal/hp 0)',
  !/\bS\.\w+\s*=[^=]/.test(runB + fireB + spawnB) && !/\bG\.\w+\s*=[^=]/.test(runB + fireB + spawnB) &&
  (fireB + runB + spawnB).indexOf('dmg(') < 0 && (fireB + runB + spawnB).indexOf('heal(') < 0 &&
  !/\bhp\s*[:=]/.test(fireB + runB), '');

chk('b2 gameplay timer 추가 0(경계/발화 경로에 timer 0·setTimeout은 scSpawn 안전망 1종뿐·setInterval 0)',
  runB.indexOf('setTimeout') < 0 && fireB.indexOf('setTimeout') < 0 &&
  f4aCode.indexOf('setInterval') < 0 &&
  (spawnB.match(/setTimeout\(/g) || []).length === 1, '');

chk('b3 S.ev/drain 무변경(splice 1곳·tap 1곳·seedOnHit 원위치)',
  (src.match(/\.ev\.splice\(0\)/g) || []).length === 1 &&
  (src.match(/sgObserve\(e,G\.S\);/g) || []).length === 1 && inSrc('seedOnHit(e.tg)'), '');

chk('b4 generic pose resolver 무수정(F4A 토큰/타이머/좌표 0)',
  rvB.indexOf('SC_CUE') < 0 && rvB.indexOf('sbSupportCue') < 0 && rvB.indexOf('scSpawn') < 0 &&
  rvB.indexOf('resolveAnchor') < 0 && rvB.indexOf('getBoundingClientRect') < 0, '');

chk('b5 generic anchor resolver 무수정(F4A 토큰 0·좌표 산식 단일 소유 보존)',
  raB.indexOf('SC_CUE') < 0 && raB.indexOf('sbSupportCue') < 0 && raB.indexOf('sbCue') < 0 &&
  raB.indexOf('sbPt(prof.figId,def.part,def.topBias?1:0)') >= 0, '');

chk('b6 공통 resolver/presenter Actor id 분기 0(F4A 후에도)',
  rvB.length > 100 && cdB.length > 100 && prB.length > 50 && raB.length > 300 &&
  ['war', 'boss_iron', 'shell_iron', 'rog', 'mage', 'sham', 'boss01', 'shell_thirst']
    .every(id => rvB.indexOf("'" + id + "'") < 0 && cdB.indexOf("'" + id + "'") < 0 && prB.indexOf("'" + id + "'") < 0 && raB.indexOf("'" + id + "'") < 0) &&
  rvB.indexOf('switch(') < 0 && raB.indexOf('switch(') < 0, '');

chk('b7 소비자 DOM ID/selector 직접 참조 0(scFireSupport=resolveAnchor 경유만)',
  fireB.indexOf('getElementById') < 0 && fireB.indexOf('querySelector') < 0 &&
  fireB.indexOf("'sb-") < 0 && (fireB.match(/resolveAnchor\(/g) || []).length === 2, '');

chk('b8 CORE에 cue/pose/registry 참조 0(gameplay가 cue를 모름)',
  !/SC_CUE|sbSupportCue|scFireSupport|sbCue|data-cue|ACTOR_REGISTRY|resolveActorPose/.test(core), '');

/* ===== C. 파동 ===== */
try {
  const r = driveBattle('shell_iron', 999, [{ t: 2, fn: 'useSkill', args: ['heal'] }, { t: 8, fn: 'useSkill', args: ['heal'] }, { t: 14, fn: 'useSkill', args: ['heal'] }]);
  chk('c1 파동 source=주술사 anchor 경유(resolveAnchor sham·body)',
    fireB.indexOf("resolveAnchor('sham','body')") >= 0, '');
  chk('c2 invalid source면 파동 생략(waveEligible 판별∧anchor null→wave false·(0,0) fallback 0)',
    r.firstFire.waveEligible === true && r.firstFire.wave === false &&
    fireB.indexOf('x:0,y:0') < 0 && fireB.indexOf('||{x:0') < 0, JSON.stringify({ we: r.firstFire.waveEligible, w: r.firstFire.wave }));
  chk('c3 1회 animation + cleanup(animationend·removed 가드·els splice·CSS forwards)',
    spawnB.indexOf('animationend') >= 0 && spawnB.indexOf('removed') >= 0 && spawnB.indexOf('SC_CUE.els.splice') >= 0 &&
    inSrc('animation:sbSupWave') && inSrc('forwards}'), '');
  chk('c4 반복 render 중 중복 spawn 0(창당 edge 정확히 1·재발화 0)', r.edges === r.windows && r.reFire === 0, 'edges=' + r.edges + '/win=' + r.windows);
} catch (e) { chk('c* 파동(예외)', false, e.message); }

/* ===== D. Party Ping ===== */
try {
  chk('d1 head anchor 등록(4 companion·part sb-*-head·topBias·미래 선등록 0)',
    inSrc("head:{part:'sb-w-head',topBias:1") && inSrc("head:{part:'sb-r-head',topBias:1") &&
    inSrc("head:{part:'sb-m-head',topBias:1") && inSrc("head:{part:'sb-s-head',topBias:1"), '');
  chk('d2 semantic anchor 경유(resolveAnchor id·head)+ (0,0) fallback 0',
    fireB.indexOf("resolveAnchor(id,'head')") >= 0 && fireB.indexOf('x:0,y:0') < 0, '');
  // 생존 Actor만 대상 — 죽은 마법사는 eligible 제외
  const dead = driveBattle('shell_iron', 999,
    [{ t: 2, fn: 'useSkill', args: ['heal'] }, { t: 8, fn: 'useSkill', args: ['heal'] }, { t: 14, fn: 'useSkill', args: ['heal'] }],
    [{ t: 20, id: 'mage' }]);
  chk('d3 생존 Actor만 ping 대상(사망 mage 제외)',
    dead.firstFire && dead.firstFire.eligible.indexOf('mage') < 0 && dead.firstFire.eligible.indexOf('sham') >= 0,
    JSON.stringify(dead.firstFire && dead.firstFire.eligible));
  // hidden/무효 anchor skip — 하네스 rect 0 → 유효 anchor 없음 → pings 빈 배열(eligible는 채워짐)
  const r = driveBattle('shell_iron', 999, [{ t: 2, fn: 'useSkill', args: ['heal'] }, { t: 8, fn: 'useSkill', args: ['heal'] }, { t: 14, fn: 'useSkill', args: ['heal'] }]);
  chk('d4 invalid/hidden Actor skip(anchor null→해당 ping 생략·eligible≠pings)',
    r.firstFire.eligible.length === 4 && r.firstFire.pings.length === 0, JSON.stringify({ e: r.firstFire.eligible, p: r.firstFire.pings }));
  chk('d5 각 Actor 최대 1회(동일 gen 중복 0·짧은 순차 간격만)',
    fireB.indexOf('60*fire.pings.length') >= 0 && fireB.indexOf('fire.pings.push(id)') >= 0 &&
    inSrc('animation:sbHeadPing'), '');
} catch (e) { chk('d* Party Ping(예외)', false, e.message); }

/* ===== E. Ensemble / 비변경 ===== */
chk('e1 전사 guard/brace 규칙 무변(우선순위 보존)',
  inSrc("{pose:'guard',when:{actorAlive:true,actorShielded:true}}") &&
  inSrc("{pose:'brace',when:{actorAlive:true,bossActionKind:'smash'}}") &&
  src.indexOf("{pose:'guard'") < src.indexOf("{pose:'brace'"), '');
chk('e2 마법사 channel 규칙/CSS 무변(orb 슥슥 보존)',
  inSrc("{pose:'channel',when:{actorAlive:true,battleActive:true,bossActing:false}}") &&
  inSrc('#stage .sb-mage[data-pose="channel"] .sb-m-orb{transform:translate(-22px,8px) scale(1.14)}'), '');
chk('e3 도적 interrupt 규칙 무변(가짜 action 0)',
  inSrc("{pose:'interrupt',when:{actorAlive:true,bossActionKind:'judge',interruptStance:'ready'}}") &&
  !inSrc('data-pose="strike"') && !inSrc('data-pose="dash"'), '');
// 〔승계 — F5(docs/67)〕 sbBossFigure(보스 얼굴)가 pose 뒤·cue 앞에 삽입 — 형태 핀만 갱신·의미(figure 상태가 cue보다 우선) 불변
chk('e4 주연 순서=figure 포즈/얼굴 먼저(sbFigPose→sbBossFigure)→cue(sbSupportCue)',
  inSrc('sbFigPose(S);sbBossFigure(S);sbSupportCue(S);'), '');
chk('e5 sustain hold=주술사 부적만 은은한 맥동(전 화면 flash 0·body/aura 강발광 0·마법사와 다른 느린 리듬)',
  inSrc('#stage .sb-shaman[data-pose="sustain"] .sb-s-charm{animation:sbSustainHold 2.6s ease-in-out infinite}') &&
  inSrc('@keyframes sbSustainHold'), '');
chk('e6 head/hold cue는 무대 안(#sbCueLayer #stage 자식·pointer-events none·전 화면 flash 0)',
  inSrc('#sbCueLayer{position:absolute;inset:0;pointer-events:none') &&
  inSrc("l.id='sbCueLayer'") && f4a.indexOf('document.body') < 0 && f4a.indexOf('position:fixed') < 0, '');

/* ===== F. 회귀 ===== */
try {
  const m = s.smoke(), i = s.smoke('shell_iron'), t = s.smoke('shell_thirst');
  chk('f1 스모크 3종 불변(51.4/1029·48.5/971·61.8/1236·cue ON/OFF 등가=gameplay 무접촉)',
    m.t === 51.4 && m.steps === 1029 && i.t === 48.5 && i.steps === 971 && t.t === 61.8 && t.steps === 1236,
    m.t + '/' + m.steps + ' · ' + i.t + '/' + i.steps + ' · ' + t.t + '/' + t.steps);
} catch (e) { chk('f1 스모크(예외)', false, e.message); }
{
  const buf = fs.readFileSync(path.join(ROOT, 'index.html'));
  const cmd5 = crypto.createHash('md5').update(core).digest('hex');
  chk('f2 CORE byte-identical(466/22,521/6cad2ec2)',
    coreLines.length === 466 && Buffer.byteLength(core, 'utf8') === 22521 &&
    cmd5 === '6cad2ec271a2a79afbee881c2a2e0856', coreLines.length + '/' + cmd5.slice(0, 8));
  chk('f3 index.html 신 기준선(194,919 B · md5 33d20ae3…)',
    buf.length === 194919 &&
    crypto.createHash('md5').update(buf).digest('hex') === '33d20ae34951a736cad2e236fdd2057a', buf.length + 'B');
}
chk('f4 docs/66 필수 절(피드백·가독성·설계·edge 계약·lifecycle·anchor 대응표·fallback·Ensemble·비변경·등가·cleanup·관측·Human Gate·F5)',
  doc.length > 4000 &&
  ['Human Gate', '가독성', 'false→true', 'lifecycle', 'anchor', 'fallback', 'Ensemble', '등가', 'cleanup', '관측', 'F5', '비변경']
    .every(t => doc.indexOf(t) >= 0), '');

console.log(`\n${fail === 0 ? '★ SHAMAN SUSTAIN SUPPORT CUE 01 CHECK PASS' : '★ SHAMAN SUSTAIN SUPPORT CUE 01 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
