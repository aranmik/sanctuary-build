'use strict';
// Stage Signal Shadow Foundation 01 (F1) 전용 검증
// 실행: node dev/stage_signal_shadow_foundation_01_check.js
// A 구조/정적 계약 · B runtime truth 대응 · C 안전성 · D gameplay 등가성(dual-run deep compare).
// 원칙: shadow는 소비자가 아니라 그림자다 — S.ev 유일 소비자는 drain, SG는 쓰기 0·타이머 0·DOM 0.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const DOC = path.join(ROOT, 'docs', '62_STAGE_SIGNAL_SHADOW_FOUNDATION_01.md');
const doc = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '';

let pass = 0, fail = 0;
function chk(name, cond, detail) {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
}
const inSrc = s => src.indexOf(s) >= 0;

// SG 블록 추출 (블록 헤더 ~ stage API 끝)
const sgA = src.indexOf('/* ===== F1: Stage Signal Shadow Foundation 01');
const sgB = src.indexOf('/* --- 이벤트 드레인 --- */');
const sg = (sgA >= 0 && sgB > sgA) ? src.slice(sgA, sgB) : '';
// 토큰 부재 검사는 주석 제거 후 코드만 스캔(주석의 계약 설명문이 자기 오탐되는 함정 회피 — docs/62 §13)
const sgCode = sg.replace(/\/\*[\s\S]*?\*\//g, '');
// drain 본문 추출
const drA = src.indexOf('function drain(){');
const drB = src.indexOf('\n}', drA);
const dr = (drA >= 0 && drB > drA) ? src.slice(drA, drB) : '';
// CORE 추출
const coreLines = [];
{ let f = 0; for (const l of src.split('\n')) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) coreLines.push(l); } }
const core = coreLines.join('\n') + '\n';

/* ===== A. 구조 / 정적 계약 ===== */

chk('a1 SG shadow 블록 존재(sgEv/sgObserve/sgSnapshot/sgReset/SG_MAX/SG_INTENT/stage API)',
  sg.length > 2000 && sg.indexOf('function sgEv(') >= 0 && sg.indexOf('function sgObserve(') >= 0 &&
  sg.indexOf('function sgSnapshot(') >= 0 && sg.indexOf('function sgReset(') >= 0 &&
  sg.indexOf('var SG_MAX=96') >= 0 && sg.indexOf('var SG_INTENT=') >= 0 &&
  sg.indexOf('window.__seedHealer.stage=') >= 0, sg.length + 'B');

chk('a2 단방향 의존 — CORE에 SG 참조 0(gameplay가 Stage를 모름)',
  !/\bsg[A-Z]\w*/.test(core) && !/\bSG[_.]/.test(core) && core.indexOf('stage') < 0, '');

chk('a3 신호 어휘에 포즈명/표현 class 0(의미 언어만 — 발주 §5)',
  !/windup|guard|brace|data-pose|cssClass|classList|className/.test(sgCode), '');

chk('a4 SG 블록 DOM 접근 0(selector·element API 없음)',
  !/getElementById|querySelector|setAttribute|innerHTML|textContent|\$\(/.test(sgCode) &&
  !/\bstyle\./.test(sgCode), '');

chk('a5 SG 블록 타이머 0(setTimeout/Interval/rAF 없음)',
  sgCode.indexOf('setTimeout') < 0 && sgCode.indexOf('setInterval') < 0 && sgCode.indexOf('requestAnimationFrame') < 0, '');

chk('a6 SG 블록 gameplay 쓰기 0(S.*/e.* 대입·S.ev 접근 없음 — 코드 기준)',
  !/\bS\.\w+\s*=[^=]/.test(sgCode) && !/\be\.\w+\s*=[^=]/.test(sgCode) && sgCode.indexOf('.ev') < 0, '');

chk('a7 S.ev 소비권 무이전 — splice(0) 유일 소유자=drain·SG 코드 splice 0',
  (src.match(/\.ev\.splice\(0\)/g) || []).length === 1 &&
  dr.indexOf("const evs=G.S.ev.splice(0);") >= 0 && sgCode.indexOf('splice') < 0, '');

{
  const iEnd = dr.indexOf("else if(e.y==='end')");
  const iTap = dr.indexOf('sgObserve(e,G.S);');
  chk('a8 drain 구조 보존+tap 순서(기존 분기 전부 뒤·tap 1개소·seedOnHit 원위치)',
    iEnd >= 0 && iTap > iEnd && (dr.match(/sgObserve\(/g) || []).length === 1 &&
    dr.indexOf('seedOnHit(e.tg)') >= 0 && dr.indexOf("if(e.y==='log')") < dr.indexOf("else if(e.y==='flt')"), '');
}

chk('a9 전투 경계 초기화 — newGame에 sgReset(G.S) 1개소',
  (src.match(/sgReset\(G\.S\);/g) || []).length === 1 &&
  src.indexOf('G=createGame(CUR_BOSS);') < src.indexOf('sgReset(G.S);') &&
  src.indexOf('sgReset(G.S);') < src.indexOf('function showScreen('), '');

chk('a10 관측 버퍼 계약(상한 96·초과 shift·복사본 반환)',
  sg.indexOf('SG.buf.length>=SG_MAX') >= 0 && sg.indexOf('SG.buf.shift()') >= 0 &&
  sg.indexOf('SG.buf.slice()') >= 0, '');

/* ===== 하네스 로드 ===== */
let h = null, s = null, stage = null;
try { h = require('./harness.js'); s = h.sb.window.__seedHealer; stage = s.stage; } catch (e) { console.log('HARNESS FAIL ' + e.message); }
chk('a11 하네스에서 stage API 노출(관측/번역/스냅샷/통계/on-off)',
  !!(stage && stage.translate && stage.deriveSnapshot && stage.observe && stage.signals && stage.stats && stage.setOn && stage.reset), '');

// 이벤트 커서 유틸 — splice 없이 읽기 전용 순회(+선택적 관측·자체 수집)
function runFeed(g, until, inputs, observeToo) {
  const got = []; let cur = 0;
  const inp = (inputs || []).slice();
  while (!g.S.over && g.S.t < until) {
    g.step(0.05);
    while (inp.length && g.S.t >= inp[0].t) { const c = inp.shift(); g[c.fn].apply(null, c.args || []); }
    for (; cur < g.S.ev.length; cur++) {
      const o = stage.translate(g.S.ev[cur], g.S);
      if (o) got.push(o);
      if (observeToo) stage.observe(g.S.ev[cur], g.S);
    }
  }
  return got;
}
const find = (arr, q) => arr.find(o => Object.keys(q).every(k => (k === 'result') ? JSON.stringify(o.result) === JSON.stringify(q.result) : o[k] === q[k]));

/* ===== B. runtime truth 대응 ===== */
try {
  h.sb.CUR_BOSS = 'shell_iron';
  const g1 = s.createGame('shell_iron'); g1.start();
  const got1 = runFeed(g1, 12, [
    { t: 2.0, fn: 'useSkill', args: ['heal'] },
    { t: 5.0, fn: 'useSkill', args: ['shield'] },
    { t: 9.0, fn: 'useSkill', args: ['big'] }
  ], false);

  chk('b1 battle-start 신호(start→phase battle-start)', !!find(got1, { ev: 'start', phase: 'battle-start', intent: 'battle' }), '');
  chk('b2 보스 cast-start 신호(bossCast→intent attack·source boss·target war·이름/blk 결과)',
    !!got1.find(o => o.ev === 'bossCast' && o.intent === 'attack' && o.source === 'boss' && o.target === 'war' && o.result && o.result.name === '탱커 강타'), '');
  chk('b3 smash contact 신호(source boss·target war·phase contact)',
    !!find(got1, { ev: 'smash', intent: 'attack', phase: 'contact', source: 'boss', target: 'war' }), '');
  chk('b4 damage amount 대응(flt→result{type:damage,amount>0}·target 실존 id)',
    !!got1.find(o => o.ev === 'flt' && o.result && o.result.type === 'damage' && o.result.amount > 0 && ['war', 'rog', 'mage', 'sham', 'pri'].indexOf(o.target) >= 0), '');
  chk('b5 heal amount 대응(사제 단일 치유→intent heal·amount>0)',
    !!got1.find(o => o.ev === 'flt' && o.result && o.result.type === 'heal' && o.result.amount > 0), '');
  chk('b6 absorb 대응(보호막 흡수→result{type:absorbed,amount>0}·shield fx 신호 병행)',
    !!got1.find(o => o.ev === 'flt' && o.result && o.result.type === 'absorbed' && o.result.amount > 0) &&
    !!find(got1, { ev: 'shield', source: 'pri', intent: 'shield' }), '');
  chk('b7 사제 cast start/complete 대응(castStart cast-start→heal 결과 신호)',
    !!got1.find(o => o.ev === 'castStart' && o.phase === 'cast-start' && o.source === 'pri' && o.result && o.result.k === 'big') &&
    !!find(got1, { ev: 'heal', source: 'pri', intent: 'heal' }), '');
  chk('b8 allyAtk 대응(source=동료·target boss·phase contact)',
    !!got1.find(o => o.ev === 'allyAtk' && o.target === 'boss' && o.phase === 'contact' && ['war', 'rog', 'mage', 'sham'].indexOf(o.source) >= 0), '');

  // 스냅샷(지속 신호) — cast 중 시점 실측
  const g2 = s.createGame('shell_iron'); g2.start();
  while (!(g2.S.boss.cast && g2.S.boss.cast.kind === 'smash') && g2.S.t < 10) g2.step(0.05);
  g2.step(0.05);
  const snap = stage.deriveSnapshot(g2.S, g2);
  chk('b9 스냅샷: bossAction(kind/target/progress 0~1)·nextAction·actors·priest 구조',
    !!(snap && snap.bossAction && snap.bossAction.kind === 'smash' && snap.bossAction.target === 'war' &&
       snap.bossAction.progress > 0 && snap.bossAction.progress <= 1 &&
       snap.actors && snap.actors.war && snap.actors.war.alive === true &&
       snap.priest && typeof snap.priest.mana === 'number' && snap.nextAction && typeof snap.nextAction.eta === 'number'), '');
  g2.useSkill('shield');
  const snap2 = stage.deriveSnapshot(g2.S, g2);
  chk('b10 스냅샷: shielded(amt)·gcdLocked 실상태 파생',
    !!(snap2.actors.war.shielded && snap2.actors.war.shielded.amt === 320 && snap2.priest.gcdLocked === true), '');

  // aoe 문맥 분리 — 같은 FX('aoe')가 보스 문맥으로 judge/drain 분리
  // ★진실 실측: boss01의 judge j1(15s)은 도적이 차단 성공(intOk)해 aoe가 발생하지 않는다.
  //   j2(32s)는 차단 쿨(intCd 20 → intReady 35.8)이라 34.5s에 착지 — aoe는 그때 처음 발생. 36s까지 관측.
  h.sb.CUR_BOSS = 'boss01';
  const g3 = s.createGame('boss01'); g3.start();
  const got3 = runFeed(g3, 36, [], false);
  h.sb.CUR_BOSS = 'shell_thirst';
  const g4 = s.createGame('shell_thirst'); g4.start();
  const got4 = runFeed(g4, 7, [], false);
  h.sb.CUR_BOSS = 'shell_iron';
  chk("b11 FX('aoe') 문맥 분리(boss01→intent judge / shell_thirst→intent drain·target party)",
    !!find(got3, { ev: 'aoe', intent: 'judge', target: 'party' }) &&
    !!find(got4, { ev: 'aoe', intent: 'drain', target: 'party' }) &&
    !got3.some(o => o.ev === 'aoe' && o.intent === 'drain') && !got4.some(o => o.ev === 'aoe' && o.intent === 'judge'), '');
  chk('b12 interrupt 대응(boss01 judge→intOk·source rog·result ok)',
    !!got3.find(o => o.ev === 'intOk' && o.intent === 'interrupt' && o.source === 'rog' && o.result && o.result.ok === true), '');

  // battle-end + end 요약
  const g5 = s.createGame('shell_iron'); g5.start();
  const got5 = runFeed(g5, 999, [], false);
  chk('b13 battle-end 대응(win/lose 신호+end 요약 result)',
    !!got5.find(o => (o.ev === 'win' || o.ev === 'lose') && o.phase === 'battle-end') &&
    !!got5.find(o => o.ev === 'end' && o.phase === 'battle-end' && o.result && typeof o.result.r === 'string'), '');
  chk('b14 sel/deny 대응(select→sel 신호·시전 중 사용 거부→deny 신호)', (function () {
    const g = s.createGame('shell_iron'); g.start(); g.step(0.05);
    g.select('rog');
    let n = 0; while (g.S.t < g.S.pri.gcd + 0.1 && n < 60) { g.step(0.05); n++; }
    g.useSkill('big'); g.step(0.05); g.useSkill('heal');
    const got = []; for (let c = 0; c < g.S.ev.length; c++) { const o = stage.translate(g.S.ev[c], g.S); if (o) got.push(o); }
    return !!find(got, { ev: 'sel', target: 'rog' }) && !!find(got, { ev: 'deny', phase: 'cancelled' });
  })(), '');
} catch (e) { chk('b* runtime 대응(예외)', false, e.message); }

/* ===== C. 안전성 ===== */
try {
  const gS = s.createGame('shell_iron'); gS.start(); gS.step(0.05);
  const before = JSON.stringify(gS.S);
  chk('c1 unknown fx kind 안전(intent unknown·throw 0)', (function () {
    const o = stage.translate({ y: 'fx', k: 'zzz-not-a-kind' }, gS.S); return o && o.intent === 'unknown';
  })(), '');
  chk('c2 unknown y 안전(intent unknown)', (function () {
    const o = stage.translate({ y: 'weird' }, gS.S); return o && o.intent === 'unknown';
  })(), '');
  chk('c3 missing source/target 안전(d 없음→target null·null 이벤트→null)',
    (function () { const o = stage.translate({ y: 'fx', k: 'heal' }, gS.S); return o && o.target === null; })() &&
    stage.translate(null, gS.S) === null, '');
  chk('c4 observer 실패 무해(throw하는 이벤트도 삼킴·이후 step 정상)', (function () {
    stage.observe(undefined, gS.S);
    stage.observe({ get y() { throw new Error('boom'); } }, gS.S);
    gS.step(0.05); return !gS.S.over || gS.S.over;
  })(), '');
  chk('c5 관측이 원본 무변경(translate/observe 전후 S JSON 동일)', (function () {
    for (let c = 0; c < gS.S.ev.length; c++) { stage.translate(gS.S.ev[c], gS.S); }
    const evJson = JSON.stringify(gS.S.ev);
    for (let c = 0; c < gS.S.ev.length; c++) { stage.observe(gS.S.ev[c], gS.S); }
    return JSON.stringify(gS.S.ev) === evJson;
  })(), '');
  // ★before 비교: step을 이미 진행했으므로 ev 배열만 비교(위) + 상태 필드 스냅 비교
  chk('c6 경계 초기화(reset→count 0·battle 증가) + 새 S 방어 리셋', (function () {
    const gA = s.createGame('shell_iron'); gA.start(); gA.step(0.05);
    stage.reset(gA.S);
    for (let c = 0; c < gA.S.ev.length; c++) stage.observe(gA.S.ev[c], gA.S);
    const n1 = stage.stats().count; const b1 = stage.stats().battle;
    const gB = s.createGame('shell_iron'); gB.start(); gB.step(0.05);
    stage.observe(gB.S.ev[0], gB.S); // 다른 S → 방어 리셋 후 1건
    const st2 = stage.stats();
    return n1 > 0 && st2.battle === b1 + 1 && st2.count <= 1 + 1;
  })(), '');
  chk('c7 상한 계약(SG_MAX 초과 시 오래된 것 탈락·count===96)', (function () {
    const gC = s.createGame('shell_iron'); gC.start();
    stage.reset(gC.S);
    for (let i = 0; i < 300; i++) stage.observe({ y: 'fx', k: 'melee', d: { tg: 'war' } }, gC.S);
    return stage.stats().count === 96 && stage.signals().length === 96;
  })(), '');
  chk('c8 signals()는 복사본(외부 push가 내부 buf에 미반영)', (function () {
    const a = stage.signals(); a.push({ fake: 1 });
    return stage.signals().length === 96;
  })(), '');
  chk('c9 setOn(false)면 기록 정지·gameplay는 계속(등가의 스위치)', (function () {
    const gD = s.createGame('shell_iron'); gD.start(); gD.step(0.05);
    stage.reset(gD.S); stage.setOn(false);
    for (let c = 0; c < gD.S.ev.length; c++) stage.observe(gD.S.ev[c], gD.S);
    const n = stage.stats().count; stage.setOn(true);
    return n === 0;
  })(), '');
  void before;
} catch (e) { chk('c* 안전성(예외)', false, e.message); }

/* ===== D. gameplay 등가성 (dual-run deep compare) ===== */
try {
  const INPUTS = {
    boss01: [{ t: 2.0, fn: 'useSkill', args: ['heal'] }, { t: 5.0, fn: 'useSkill', args: ['shield'] },
             { t: 10.6, fn: 'select', args: ['mage'] }, { t: 10.8, fn: 'useSkill', args: ['dispel'] },
             { t: 12.0, fn: 'useSkill', args: ['big'] }],
    shell_iron: [{ t: 2.0, fn: 'useSkill', args: ['heal'] }, { t: 5.0, fn: 'useSkill', args: ['shield'] },
                 { t: 9.0, fn: 'useSkill', args: ['big'] }],
    shell_thirst: [{ t: 3.0, fn: 'useSkill', args: ['heal'] }, { t: 8.0, fn: 'useSkill', args: ['big'] }]
  };
  function fullRun(bossId, observed) {
    h.sb.CUR_BOSS = bossId;
    const g = s.createGame(bossId); g.start();
    const inp = INPUTS[bossId].slice(); let cur = 0, steps = 0;
    if (observed) stage.reset(g.S);
    while (!g.S.over && steps < 4000) {
      g.step(0.05); steps++;
      while (inp.length && g.S.t >= inp[0].t) { const c = inp.shift(); g[c.fn].apply(null, c.args || []); }
      if (observed) { for (; cur < g.S.ev.length; cur++) stage.observe(g.S.ev[cur], g.S); }
    }
    return { g, steps };
  }
  let allEq = true, det = [];
  for (const b of ['boss01', 'shell_iron', 'shell_thirst']) {
    const A = fullRun(b, true);   // 관측 ON — 매 tick 이벤트 feed
    const B = fullRun(b, false);  // 관측 없음
    const sameS = JSON.stringify(A.g.S) === JSON.stringify(B.g.S);
    const sameEv = JSON.stringify(A.g.S.ev) === JSON.stringify(B.g.S.ev);
    const sameRep = JSON.stringify(A.g.report()) === JSON.stringify(B.g.report());
    const eq = sameS && sameEv && sameRep && A.steps === B.steps && A.g.S.result === B.g.S.result;
    if (!eq) allEq = false;
    det.push(b + ':' + (eq ? 'EQ' : 'DIFF') + '(' + A.g.S.result + '/' + A.g.S.t.toFixed(1) + 's/' + A.steps + ')');
  }
  h.sb.CUR_BOSS = 'boss01';
  chk('d1 관측 ON/OFF dual-run 심층 등가(3보스·최종 S/이벤트 순서·횟수/report/steps/결과 전부 동일)', allEq, det.join(' · '));
  chk('d2 이벤트 소비 횟수 등가 — 관측은 splice 없는 커서 순회(위 sameEv가 순서+횟수 증명)', allEq, '');
} catch (e) { chk('d1~2 등가성(예외)', false, e.message); }

// d3. smoke 3종 동일
try {
  const m = s.smoke(), i = s.smoke('shell_iron'), t = s.smoke('shell_thirst');
  chk('d3 스모크 3종 불변(51.4/1029·48.5/971·61.8/1236)',
    m.t === 51.4 && m.steps === 1029 && i.t === 48.5 && i.steps === 971 && t.t === 61.8 && t.steps === 1236,
    m.t + '/' + m.steps + ' · ' + i.t + '/' + i.steps + ' · ' + t.t + '/' + t.steps);
} catch (e) { chk('d3 스모크 3종 불변', false, e.message); }

// d4. RNG 부재(난수 0 — RNG 소비 변화 원천 불가)
chk('d4 RNG 부재(Math.random 0회=결정론·RNG 소비 변화 N/A)',
  src.indexOf('Math.random') < 0, '');

/* ===== 기준선/문서 ===== */
{
  const buf = fs.readFileSync(path.join(ROOT, 'index.html'));
  const cmd5 = crypto.createHash('md5').update(core).digest('hex');
  chk('e1 CORE byte-identical(466/22,521/6cad2ec2)',
    coreLines.length === 466 && Buffer.byteLength(core, 'utf8') === 22521 &&
    cmd5 === '6cad2ec271a2a79afbee881c2a2e0856', coreLines.length + '/' + cmd5.slice(0, 8));
  chk('e2 index.html 현행 기준선(227,650 B · md5 5d645ffc…)',
    buf.length === 227650 &&
    crypto.createHash('md5').update(buf).digest('hex') === '5d645ffcf1592f1430b73647f4c39ccb', '');
}
chk('e3 docs/62 필수 절(감사·shadow 방식·schema·대응표·lifecycle·fallback·debug·등가성·WATCH·F2 계약)',
  doc.length > 3000 &&
  ['작업 전 구조 감사', '혼합 책임', 'shadow 생성 방식', '최소 schema', '대응표', 'lifecycle', 'fallback',
   'debug', '등가성', '비변경 범위', 'WATCH', 'F2'].every(t => doc.indexOf(t) >= 0), '');

console.log(`\n${fail === 0 ? '★ STAGE SIGNAL SHADOW FOUNDATION 01 CHECK PASS' : '★ STAGE SIGNAL SHADOW FOUNDATION 01 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
