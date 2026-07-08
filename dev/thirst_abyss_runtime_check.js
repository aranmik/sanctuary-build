'use strict';
// Thirst Abyss Runtime 01 전용 검증 (docs/30 A안 · docs/32)
// 박제: 모르가스 51.4/1029(+로그지문 88925e4d…) · 파쇄자 48.5/971 · 심연 defeat/61.8/1236 · 사망열 war@37.0→rog@46.6→sham@57.9→mage@61.8
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');
const h = require('./harness.js');
const sb = h.sb;
const sh = sb.window.__seedHealer;
const src = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
function setG(g) { sb.__tmpG = g; vm.runInContext('G=__tmpG;', sb); }

let pass = 0, fail = 0;
function chk(name, cond, detail) {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
}
function runNoInput(bossId) {
  const g = sh.createGame(bossId); g.start(); let n = 0;
  while (!g.S.over && n < 4000) { g.step(0.05); n++; }
  return g;
}

// 1~3. 기존 3보스 스모크 회귀 없음
const s0 = sh.smoke();
chk('c1 무인자 = 모르가스 51.4', s0.result === 'defeat' && s0.t === 51.4 && s0.steps === 1029, JSON.stringify(s0));
const s1 = sh.smoke('boss01');
chk('c2 boss01 = 모르가스 51.4', s1.result === 'defeat' && s1.t === 51.4 && s1.steps === 1029, JSON.stringify(s1));
const si = sh.smoke('shell_iron');
chk('c3 shell_iron = 파쇄자 48.5', si.result === 'defeat' && si.t === 48.5 && si.steps === 971, JSON.stringify(si));

// 3-B. 모르가스 로그 지문(손맛 무회귀)
{
  const g = runNoInput(undefined);
  const logs = g.S.ev.filter(e => e.y === 'log').map(e => e.m + '|' + (e.c || ''));
  const hash = crypto.createHash('md5').update(logs.join('\n')).digest('hex');
  chk('c4 모르가스 로그 지문 동일', hash === '88925e4d45455f02f824bfc7b3fd350e' && logs.length === 25, hash);
}

// 4. 심연 인스턴스 + 분기 구분
{
  const gt = sh.createGame('shell_thirst');
  chk('c5 심연 인스턴스(HP 8400·스크립트 14·모르가스/파쇄자와 구분)',
    gt.S.boss.max === 8400 && gt.script.length === 14 && gt.script !== sh.SCRIPT && gt.script !== sh.BOSS_DEFS.shell_iron.script,
    'hp=' + gt.S.boss.max + ' len=' + gt.script.length);
}

// 5. 심연 무입력 스모크 박제
const st = sh.smoke('shell_thirst');
chk('c6 심연 무입력 스모크 defeat/61.8/1236', st.over === true && st.result === 'defeat' && st.t === 61.8 && st.steps === 1236, JSON.stringify(st));

// 6. 심연 사망열 박제
{
  const gt = runNoInput('shell_thirst');
  const dl = gt.S.st.deaths.map(d => d.id + '@' + d.t.toFixed(1)).join(',');
  chk('c7 심연 사망열', dl === 'war@37.0,rog@46.6,sham@57.9,mage@61.8', dl);
}

// 7. 심연 = 마나 압박 질문 — drain 어휘 위주 · 정화/차단 어휘(brand/bomb/judge) 없음
{
  const evs = sh.BOSS_DEFS.shell_thirst.script.map(e => e.e);
  const noCleanse = !evs.includes('brand') && !evs.includes('bomb') && !evs.includes('judge') && !evs.includes('smash');
  const drainN = evs.filter(e => e === 'drain').length;
  chk('c8 심연 어휘 = drain 위주(정화·차단·강타 없음)', noCleanse && drainN === 11 && evs.includes('valor') && evs.includes('enrage'), evs.join(','));
}

// 8. drain이 사제 마나를 실제로 압박한다(무입력에도 마나가 흔들리되 음수·억울 없음)
{
  const gt = runNoInput('shell_thirst');
  chk('c9 drain 마나 압박(manaMin<start & >=0 — 억울 클램프)', gt.S.st.manaMin < 520 && gt.S.st.manaMin >= 0, 'manaMin=' + Math.round(gt.S.st.manaMin));
}

// 9. 성심 집중 양성 증거 — 통제 실험: 같은 heal, focus 무장 시 마나 환급 vs 미무장 시 지불
{
  // 게임 A: focus 무장 → 1초 후(gcd 경과) heal → 환급
  const gA = sh.createGame('shell_thirst'); setG(gA); gA.start();
  for (let i = 0; i < 170; i++) gA.step(0.05); // t≈8.5, 첫 drain들로 파티 피해
  sb.focusUse();
  for (let i = 0; i < 22; i++) gA.step(0.05); // gcd 경과, armed 유지
  const armed = sb.focusIsArmed(gA.S);
  const tgtA = gA.S.al.find(a => a.alive && a.hp / a.max < 0.98) || gA.S.al[0];
  gA.select(tgtA.id);
  const aBefore = gA.S.pri.mana;
  sb.focusWrapUse('heal');
  const aAfter = gA.S.pri.mana;
  const deltaA = aBefore - aAfter;
  // 게임 B: 무장 없이 동일 heal → 지불
  const gB = sh.createGame('shell_thirst'); setG(gB); gB.start();
  for (let i = 0; i < 192; i++) gB.step(0.05); // A와 동일 시점(170+22)
  const tgtB = gB.S.al.find(a => a.alive && a.hp / a.max < 0.98) || gB.S.al[0];
  gB.select(tgtB.id);
  const bBefore = gB.S.pri.mana;
  const okB = gB.useSkill('heal');
  const bAfter = gB.S.pri.mana;
  const deltaB = bBefore - bAfter;
  chk('c10 성심 집중 armed(심연 전투 중 가용)', armed === true, 'armed=' + armed);
  chk('c11 성심 집중 양성 증거: focus heal 환급(무장 delta≪미무장 delta)',
    okB === true && deltaB >= 35 && deltaA <= 5 && (deltaB - deltaA) >= 30,
    'focusΔ=' + Math.round(deltaA) + ' 지불Δ=' + Math.round(deltaB));
}

// 10. 길드/출정 — 심연 개방(선택 가능·잠금 아님)
{
  sb.renderGuild();
  const gl = h._els['guild-list'].innerHTML;
  chk('c12 길드: 심연 개방 카드(출정 준비·잠금 없음)',
    gl.indexOf('갈증의 심연') >= 0 && gl.indexOf('data-boss="shell_thirst"') >= 0 && gl.indexOf('data-shell="shell_thirst"') < 0, '');
  chk('c13 셸 잔여 0(모든 보스 개방)', gl.indexOf('data-shell=') < 0, '');
}

// 11. 출정 화면 — 심연 이름/질문/난이도/경고/버튼
{
  const sortieBody = sb.document.getElementById('sortie-body');
  sb.SELECTED_BOSS = 'shell_thirst';
  sb.renderSortie();
  const body = sortieBody.innerHTML;
  chk('c14 출정: 심연 이름+질문+난이도', body.indexOf('갈증의 심연') >= 0 && body.indexOf('무엇을 안 쓸 것인가?') >= 0 && body.indexOf('난이도 · 심연') >= 0, '');
  chk('c15 출정 버튼 존재·비활성 아님', body.indexOf('id="sortie-go"') >= 0 && !/sortie-go[^>]*disabled/.test(body), '');
  sb.SELECTED_BOSS = 'boss01';
}

// 12. 출정 경고 — 성심 집중 없음 → 주의 · 최대 2줄 · 차단 없음
{
  const w = sb.sortieWarnings('shell_thirst', ['heal', 'big', 'shield', 'dispel', 'pray', 'save'], ['war', 'rog', 'mage', 'sham']); // focus·renew·seed 없음
  chk('c16 성심 집중 없음 → 주의', w.some(r => r.lv === 'caution') && w.length <= 2, JSON.stringify(w.map(r => r.lv)));
  const eb = src.match(/function enterBattle\(slot\)\{[\s\S]*?\n\}/);
  chk('c17 enterBattle 경고 게이트 없음(출정 차단 없음)', eb && !/sortieWarn/.test(eb[0]) && /LOADOUT\.length!==6/.test(eb[0]), '');
}

// 13. 금지선 — 미래 7동료 없음 · 대정화 없음
{
  const allies = sh.CFG.allies;
  chk('c18 동료 4종 고정(미래 7종 없음)', allies.length === 4 && allies.map(a => a.id).join(',') === 'war,rog,mage,sham', allies.map(a => a.id).join(','));
  // 대정화 = 카탈로그 dormant 정의(impl:'defined')로 유지 — 이 카드가 구현으로 승격 안 함(구현 함수/로직 0)
  const dormant = /display:'대정화',[\s\S]*?impl:'defined'/.test(src);
  const noImpl = !/function\s+massCleanse|function\s+greatCleanse|greatCleanseUse|massCleanseUse/.test(src);
  chk('c19 대정화 미구현(카탈로그 dormant 유지)', dormant && noImpl, 'dormant=' + dormant + ' noImpl=' + noImpl);
}

// 14. 재도전 보스 유지 배선(심연도 CUR_BOSS로 유지)
chk('c20 재도전 보스 유지(CUR_BOSS)', /var CUR_BOSS='boss01';/.test(src) && /if\(slot!==undefined\)CUR_BOSS=BOSS_DEFS\[slot\]\?slot:'boss01';/.test(src), '');

console.log(`\n${fail === 0 ? '★ THIRST ABYSS RUNTIME CHECK PASS' : '★ THIRST ABYSS RUNTIME CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
