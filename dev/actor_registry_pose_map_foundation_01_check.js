'use strict';
// Actor Registry & Pose Map Foundation 01 (F2) 전용 검증
// 실행: node dev/actor_registry_pose_map_foundation_01_check.js
// A Registry 구조 · B Stage Signal 계약 · C/D legacy↔new 등가성(oracle 전수 스윕+경계값) ·
// E fallback · F lifecycle · G 회귀(기준선·스모크·CORE).
// 원칙: 공통 resolver는 해석 방법만 알고, 각 Actor의 연기는 Profile이 안다.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const DOC = path.join(ROOT, 'docs', '63_ACTOR_REGISTRY_POSE_MAP_FOUNDATION_01.md');
const doc = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '';

let pass = 0, fail = 0;
function chk(name, cond, detail) {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
}
const inSrc = s => src.indexOf(s) >= 0;

// F2 블록 추출: 블록 헤더 ~ renderFx 직전 · 주석 제거본으로 토큰 검사(자기 오탐 회피 — docs/62 §13 요령)
const f2A = src.indexOf('/* ===== F2: Actor Registry & Pose Map Foundation 01');
const f2B = src.indexOf('function renderFx(');
const f2 = (f2A >= 0 && f2B > f2A) ? src.slice(f2A, f2B) : '';
const f2Code = f2.replace(/\/\*[\s\S]*?\*\//g, '');
// generic resolver+조건 해석기 본문만 (Actor id 분기 금지 검사 대상)
function fnBody(name) {
  const i = src.indexOf('function ' + name + '(');
  if (i < 0) return '';
  const j = src.indexOf('\n}', i);
  return (j > i) ? src.slice(i, j) : '';
}
const rvB = fnBody('resolveActorPose').replace(/\/\*[\s\S]*?\*\//g, '');
const cdB = fnBody('sgPoseCond').replace(/\/\*[\s\S]*?\*\//g, '');
const prB = fnBody('sbFigPose').replace(/\/\*[\s\S]*?\*\//g, '');
const apB = fnBody('applyActorPose').replace(/\/\*[\s\S]*?\*\//g, '');
// CORE 추출
const coreLines = [];
{ let f = 0; for (const l of src.split('\n')) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) coreLines.push(l); } }
const core = coreLines.join('\n') + '\n';

/* ===== A. Registry 구조 ===== */

chk('a1 Actor Registry 존재(전사+파쇄자 등록·default/allowed/poseRules·figId 바인딩)',
  f2.length > 1500 && inSrc('var ACTOR_REGISTRY=') &&
  f2.indexOf("boss_iron:{actorId:'boss_iron'") >= 0 && f2.indexOf("war:{actorId:'war'") >= 0 &&
  (f2.match(/defaultPose:''/g) || []).length >= 2 && (f2.match(/allowedPoses:\[/g) || []).length >= 2 &&
  (f2.match(/poseRules:\[/g) || []).length >= 2 &&
  f2.indexOf("figId:'sb-boss-fig'") >= 0 && f2.indexOf("figId:'sb-war-fig'") >= 0, f2.length + 'B');

chk('a2 generic resolver/조건 해석기에 Actor id·직업·보스 분기 0',
  rvB.length > 100 && cdB.length > 100 && prB.length > 50 &&
  ['war', 'boss_iron', 'shell_iron', 'rog', 'mage', 'sham', 'boss01', 'shell_thirst']
    .every(id => rvB.indexOf("'" + id + "'") < 0 && cdB.indexOf("'" + id + "'") < 0 && prB.indexOf("'" + id + "'") < 0) &&
  rvB.indexOf('switch(') < 0 && cdB.indexOf('switch(') < 0 && prB.indexOf('switch(') < 0, '');

chk('a3 Registry에 gameplay 수치/판정/타이머/좌표/FX 없음',
  f2Code.indexOf('setTimeout') < 0 && f2Code.indexOf('setInterval') < 0 &&
  f2Code.indexOf('getBoundingClientRect') < 0 && f2Code.indexOf('fxLn') < 0 &&
  f2Code.indexOf('Math.random') < 0 && !/\bhp\s*:/.test(f2Code) && !/\batk\b/.test(f2Code) &&
  f2Code.indexOf('dmg(') < 0 && f2Code.indexOf('heal(') < 0, '');

chk('a4 presenter 경계 — DOM 접촉은 presenter/디버그만·resolver/조건 해석기 DOM 0',
  rvB.indexOf('getElementById') < 0 && cdB.indexOf('getElementById') < 0 &&
  rvB.indexOf('setAttribute') < 0 && cdB.indexOf('setAttribute') < 0 &&
  apB.indexOf('setAttribute') >= 0 && prB.indexOf('applyActorPose(') >= 0, '');

chk('a5 F2 블록 gameplay 쓰기 0(S.*/G.* 대입 없음·S.ev 접근 없음)',
  !/\bS\.\w+\s*=[^=]/.test(f2Code) && !/\bG\.\w+\s*=[^=]/.test(f2Code) && f2Code.indexOf('.ev') < 0 &&
  f2Code.indexOf('splice') < 0, '');

chk('a6 함수 시그니처 보존(function sbFigPose(S) — 기존 체크 계약 유지)',
  inSrc('function sbFigPose(S)') && inSrc('function resolveActorPose(') && inSrc('function applyActorPose('), '');

chk('a7 동료/사제 미등록(이번 카드 비연결 — 새 포즈 0)',
  f2.indexOf("rog:{") < 0 && f2.indexOf("mage:{") < 0 && f2.indexOf("sham:{") < 0 && f2.indexOf("pri:{") < 0 &&
  !inSrc("data-pose=\"interrupt\"") && !inSrc("'charge'") && !inSrc("'sustain'"), '');

chk('a8 입력=sgSnapshot(presenter가 스냅샷 파생·gameplay 구조 직독 0)',
  prB.indexOf('sgSnapshot(') >= 0 && prB.indexOf('S.boss') < 0 && prB.indexOf('S.al') < 0 &&
  rvB.indexOf('S.boss') < 0 && cdB.indexOf('S.boss') < 0 && cdB.indexOf('S.al') < 0, '');

/* ===== B. Stage Signal 계약 (F1 무결성 승계) ===== */

{
  const sgA = src.indexOf('/* ===== F1: Stage Signal Shadow Foundation 01');
  const sgB2 = src.indexOf('/* --- 이벤트 드레인 --- */');
  const sg = (sgA >= 0 && sgB2 > sgA) ? src.slice(sgA, sgB2) : '';
  const sgCode = sg.replace(/\/\*[\s\S]*?\*\//g, '');
  chk('b1 F1 SG 블록에 pose 어휘 추가 없음(신호는 pose 이름을 모름)',
    sg.length > 2000 && !/windup|guard|brace|data-pose/.test(sgCode), '');
  chk('b2 CORE에 pose/registry 참조 0(gameplay가 pose 이름을 모름)',
    !/windup|guard|brace|data-pose|ACTOR_REGISTRY|resolveActorPose/.test(core), '');
  chk('b3 SG ring history를 pose 입력으로 미사용(F2 블록에 signals()/SG.buf 참조 0)',
    f2Code.indexOf('signals(') < 0 && f2Code.indexOf('SG.buf') < 0 && f2Code.indexOf('sgEv(') < 0, '');
  chk('b4 S.ev/drain 무변경(splice 1곳·tap 1곳·seedOnHit 원위치)',
    (src.match(/\.ev\.splice\(0\)/g) || []).length === 1 &&
    (src.match(/sgObserve\(e,G\.S\);/g) || []).length === 1 && inSrc('seedOnHit(e.tg)'), '');
}

/* ===== 하네스 ===== */
let h = null, s = null, stage = null;
try { h = require('./harness.js'); s = h.sb.window.__seedHealer; stage = s.stage; } catch (e) { console.log('HARNESS FAIL ' + e.message); }
chk('b5 debug accessor(actors/actorProfile/resolvePose/currentPoses/poseStats·F1 API 공존)',
  !!(stage && stage.actors && stage.actorProfile && stage.resolvePose && stage.currentPoses && stage.poseStats &&
     stage.translate && stage.deriveSnapshot && stage.signals && stage.stats), '');

// legacy oracle — Rework 01(docs/44) sbFigPose 결정 로직의 순수 재현
function oracle(S, curBoss) {
  if (curBoss !== 'shell_iron') return null; /* 비-iron: DOM 무접촉(no-touch) */
  const bc = S.boss.cast, smashing = !!(bc && bc.kind === 'smash');
  let war = null; for (const a of S.al) if (a.id === 'war') war = a;
  let wp = '';
  if (war && war.alive) { if (war.shield && war.shield.amt > 0) wp = 'guard'; else if (smashing) wp = 'brace'; }
  return { boss: smashing ? 'windup' : '', war: wp };
}
function newPoses(S, g) {
  const snap = stage.deriveSnapshot(S, g);
  return { boss: stage.resolvePose('boss_iron', snap).pose, war: stage.resolvePose('war', snap).pose };
}

/* ===== C/D. legacy ↔ new 등가성 ===== */
try {
  h.sb.CUR_BOSS = 'shell_iron';
  // c1: 실전투 전수 스윕(매 tick) — 사제 입력 포함(guard 상태 유발)
  const g = s.createGame('shell_iron'); g.start();
  const inputs = [{ t: 2.0, fn: 'useSkill', a: ['heal'] }, { t: 3.2, fn: 'useSkill', a: ['shield'] },
                  { t: 9.0, fn: 'useSkill', a: ['big'] }, { t: 20.0, fn: 'useSkill', a: ['shield'] }];
  let diff = 0, ticks = 0; const seen = {};
  while (!g.S.over && ticks < 4000) {
    g.step(0.05); ticks++;
    while (inputs.length && g.S.t >= inputs[0].t) { const c = inputs.shift(); g[c.fn].apply(null, c.a); }
    const o = oracle(g.S, 'shell_iron'), n = newPoses(g.S, g);
    if (o.boss !== n.boss || o.war !== n.war) diff++;
    seen[n.boss + '|' + n.war] = 1;
  }
  const states = Object.keys(seen);
  chk('c1 파쇄자전 전수 스윕 등가(매 tick legacy===new·' + ticks + ' ticks)', diff === 0, 'diff=' + diff);
  chk('c2 포즈 상태 커버리지(idle·windup·guard·brace·전사 사망 후 기본)',
    states.indexOf('|') >= 0 && states.indexOf('windup|brace') >= 0 &&
    states.some(k => k.indexOf('|guard') >= 0) && states.some(k => k.indexOf('windup|') === 0), states.join(' '));

  // c3: cast 경계값 — 시작 직전/직후·committed 0.6 전후·종료 직전/직후 (windup은 cast 존재에만 의존=현행 진실)
  const g2 = s.createGame('shell_iron'); g2.start();
  while (!(g2.S.boss.cast && g2.S.boss.cast.kind === 'smash') && g2.S.t < 10) {
    const before = oracle(g2.S, 'shell_iron'), nb = newPoses(g2.S, g2);
    if (before.boss !== nb.boss) { chk('c3 경계 등가', false, 'pre-cast diff'); break; }
    g2.step(0.05);
  }
  {
    const bc = g2.S.boss.cast; let ok = true, det = [];
    const probes = [];
    while (g2.S.boss.cast && g2.S.boss.cast.start === bc.start) {
      const o = oracle(g2.S, 'shell_iron'), n = newPoses(g2.S, g2);
      const pr = (g2.S.t - bc.start) / (bc.end - bc.start);
      probes.push(pr.toFixed(2));
      if (o.boss !== n.boss || o.war !== n.war) { ok = false; det.push('pr=' + pr.toFixed(2)); }
      g2.step(0.05);
    }
    // cast 종료 직후(해제 등가)
    const o2 = oracle(g2.S, 'shell_iron'), n2 = newPoses(g2.S, g2);
    if (o2.boss !== n2.boss) { ok = false; det.push('post-end'); }
    chk('c3 cast 경계 등가(시작~진행(0.6 전후 포함)~종료 직후 전 구간·windup은 cast 존재에만 의존)',
      ok && probes.length >= 3, ok ? ('probes=' + probes.length) : det.join(','));
  }

  // c4: 합성 상태 — 전사 사망/보호막+강타 동시(guard 우선)/S.over에 cast 잔존(legacy 유지 등가)
  {
    const g3 = s.createGame('shell_iron'); g3.start();
    while (!(g3.S.boss.cast && g3.S.boss.cast.kind === 'smash') && g3.S.t < 10) g3.step(0.05);
    g3.useSkill('shield'); // 전사 보호막(대상 sel=war)
    const A1 = oracle(g3.S, 'shell_iron'), B1 = newPoses(g3.S, g3); // guard 우선(강타 중에도)
    let war = g3.S.al.find(a => a.id === 'war');
    const savedAlive = war.alive; war.alive = false; // 테스트 전용 합성(체크 내부·runtime 아님)
    const A2 = oracle(g3.S, 'shell_iron'), B2 = newPoses(g3.S, g3);
    war.alive = savedAlive;
    const savedOver = g3.S.over; g3.S.over = true; // battle over + cast 잔존
    const A3 = oracle(g3.S, 'shell_iron'), B3 = newPoses(g3.S, g3);
    g3.S.over = savedOver;
    chk('c4 합성 상태 등가(guard>brace 우선·전사 사망=기본·over+cast 잔존=legacy 동일 유지)',
      A1.war === 'guard' && B1.war === A1.war && A1.boss === B1.boss &&
      A2.war === '' && B2.war === '' && A3.boss === B3.boss && A3.war === B3.war, '');
  }

  // c5: 비-iron 무대 문맥 — legacy no-touch === presenter skip(레지스트리 stageContext)
  chk('c5 비-iron 문맥 등가(legacy 게이트=stageContext 데이터·presenter는 해당 문맥 외 DOM 무접촉)',
    oracle(s.createGame('boss01').S, 'boss01') === null &&
    f2.indexOf("stageContext:'shell_iron'") >= 0 && prB.indexOf('stageContext') >= 0 &&
    prB.indexOf('continue') >= 0, '');

  // c6: 보호막 조건 등가 증명(shield 비null ⟺ amt>0 — dmg()가 amt<=0.5에서 null화)
  chk('c6 shielded 조건 등가 근거(비null shield ⟹ amt>0.5 — CORE 파괴/만료 규칙 실존)',
    core.indexOf('if(u.shield.amt<=0.5){u.shield=null;') >= 0 &&
    core.indexOf('if(u.shield&&t>=u.shield.end){u.shield=null;') >= 0, '');
} catch (e) { chk('c* 등가성(예외)', false, e.message); }

/* ===== E. fallback ===== */
try {
  const gS = s.createGame('shell_iron'); gS.start(); gS.step(0.05);
  const snapOK = stage.deriveSnapshot(gS.S, gS);
  chk('e1 미등록 Actor → 무해 기본(pose ""·reason unregistered)',
    JSON.stringify(stage.resolvePose('nope', snapOK)) === JSON.stringify({ pose: '', reason: 'unregistered' }), '');
  chk('e2 malformed snapshot → default pose(crash 0)',
    stage.resolvePose('war', null).pose === '' && stage.resolvePose('war', 7).pose === '' &&
    stage.resolvePose('war', null).reason === 'bad-snapshot', '');
  {
    // 테스트 전용 임시 profile(샌드박스 전역 — runtime 코드 아님): 허용 외 pose·빈 rules
    h.sb.ACTOR_REGISTRY.__t1 = { actorId: '__t1', defaultPose: '', allowedPoses: [], poseRules: [{ pose: 'zzz', when: {} }] };
    h.sb.ACTOR_REGISTRY.__t2 = { actorId: '__t2', defaultPose: '', allowedPoses: ['x'] };
    h.sb.ACTOR_REGISTRY.__t3 = { actorId: '__t3', defaultPose: '', allowedPoses: ['a'], poseRules: [{ pose: 'a', when: { unknownKey: true } }] };
    const r1 = stage.resolvePose('__t1', snapOK), r2 = stage.resolvePose('__t2', snapOK), r3 = stage.resolvePose('__t3', snapOK);
    delete h.sb.ACTOR_REGISTRY.__t1; delete h.sb.ACTOR_REGISTRY.__t2; delete h.sb.ACTOR_REGISTRY.__t3;
    chk('e3 허용 외 pose → default(not-allowed) · pose map 없음 → default · 미지 조건 키 → 불일치(안전)',
      r1.pose === '' && r1.reason === 'not-allowed' && r2.pose === '' && r2.reason === 'default' &&
      r3.pose === '' && r3.reason === 'default', JSON.stringify([r1.reason, r2.reason, r3.reason]));
  }
  chk('e4 DOM 부재/스텁 무해(applyActorPose null 가드·harness에서 presenter 실행 crash 0)',
    apB.indexOf("typeof el.getAttribute!=='function'") >= 0 &&
    (function () { try { h.sb.sbFigPose(gS.S); return true; } catch (e) { return false; } })(), '');
  chk('e5 actorProfile/poseStats 복사본 반환(외부 수정 미반영)',
    (function () {
      const p = stage.actorProfile('war'); p.defaultPose = 'HACK';
      return stage.actorProfile('war').defaultPose === '' && typeof stage.poseStats().unregistered === 'number';
    })(), '');
} catch (e) { chk('e* fallback(예외)', false, e.message); }

/* ===== F. lifecycle ===== */
try {
  // f1: 새 전투 시작=신선한 S에서 재계산(cast null → 기본) — resolver 수준
  const gF = s.createGame('shell_iron');
  const n0 = newPoses(gF.S, gF);
  chk('f1 새 전투 시작 상태=기본 자세(stale 규칙 상태 0 — 매 호출 상태 파생)',
    n0.boss === '' && n0.war === '', '');
  // f2: 반복 resolve에도 결과 불변(누적 없음·순수)
  const gG = s.createGame('shell_iron'); gG.start();
  while (!(gG.S.boss.cast) && gG.S.t < 10) gG.step(0.05);
  const r1 = newPoses(gG.S, gG), r2 = newPoses(gG.S, gG), r3 = newPoses(gG.S, gG);
  chk('f2 반복 resolve 결과 불변(순수 함수·data-pose는 단일 속성 교체라 누적 불가)',
    JSON.stringify(r1) === JSON.stringify(r2) && JSON.stringify(r2) === JSON.stringify(r3) &&
    apB.indexOf("el.getAttribute('data-pose')!==pose") >= 0, '');
  // f3: 문맥 전환 시 presenter가 타 문맥 Actor를 건드리지 않음(구조) + 복귀 시 재계산(f1과 동일 원리)
  chk('f3 문맥 전환 격리(비활성 문맥 DOM 무접촉=legacy 등가·복귀 첫 render 재계산)',
    prB.indexOf('p.stageContext&&p.stageContext!==ctx') >= 0, '');
} catch (e) { chk('f* lifecycle(예외)', false, e.message); }

/* ===== G. 회귀 ===== */
try {
  const m = s.smoke(), i = s.smoke('shell_iron'), t = s.smoke('shell_thirst');
  chk('g1 스모크 3종 불변(51.4/1029·48.5/971·61.8/1236)',
    m.t === 51.4 && m.steps === 1029 && i.t === 48.5 && i.steps === 971 && t.t === 61.8 && t.steps === 1236,
    m.t + '/' + m.steps + ' · ' + i.t + '/' + i.steps + ' · ' + t.t + '/' + t.steps);
} catch (e) { chk('g1 스모크(예외)', false, e.message); }
{
  const buf = fs.readFileSync(path.join(ROOT, 'index.html'));
  const cmd5 = crypto.createHash('md5').update(core).digest('hex');
  chk('g2 CORE byte-identical(466/22,521/6cad2ec2)',
    coreLines.length === 466 && Buffer.byteLength(core, 'utf8') === 22521 &&
    cmd5 === '6cad2ec271a2a79afbee881c2a2e0856', coreLines.length + '/' + cmd5.slice(0, 8));
  chk('g3 index.html 현행 기준선(167,719 B · md5 956248ca…)',
    buf.length === 167719 &&
    crypto.createHash('md5').update(buf).digest('hex') === '956248cac4053a7c738074173ffd2904', '');
}
chk('g4 docs/63 필수 절(감사·vocabulary·priority·schema·resolver·입력 계약·fallback·lifecycle·등가성·픽셀·WATCH·F3 계약)',
  doc.length > 3000 &&
  ['sbFigPose 감사', 'pose vocabulary', 'priority', 'Registry schema', 'Pose Map', 'resolver',
   '입력 계약', 'fallback', 'lifecycle', '등가성', '픽셀', 'WATCH', 'F3'].every(t => doc.indexOf(t) >= 0), '');

console.log(`\n${fail === 0 ? '★ ACTOR REGISTRY POSE MAP FOUNDATION 01 CHECK PASS' : '★ ACTOR REGISTRY POSE MAP FOUNDATION 01 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
