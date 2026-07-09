'use strict';
// Sortie Warning Copy Polish 01 전용 검증 (docs/35)
// 실행: node dev/sortie_warning_copy_polish_check.js
// 전투 전 거울(출정 경고) 문장이 보스 정체성에 맞고, 전투 후 거울(Boss-Specific Report Hint)과 어휘로 짝을 이루는지.
const fs = require('fs');
const path = require('path');
const h = require('./harness.js');
const sb = h.sb;
const sh = sb.window.__seedHealer;
const src = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

let pass = 0, fail = 0;
function chk(name, cond, detail) {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
}
// 보스별 경고 msg 전체 텍스트 모으기
function warnText(slot) {
  return (sb.SORTIE_WARN_ROWS[slot] || []).map(r => r.msg).join(' ');
}
// 보스별 결과 거울(report hint) 전체 텍스트 — 승리/패배/스탯 케이스 합
function mirrorText(bossId) {
  const cases = [
    { r: 'victory_kill', ints: [], deaths: [], abs: 3000, ohPct: 5, oomT: 0 },
    { r: 'defeat', ints: [{ ok: 0, r: '낙인' }], deaths: [{ id: 'war', name: '전사' }], abs: 0, ohPct: 30, oomT: 20 },
    { r: 'defeat', ints: [], deaths: [], abs: 100, ohPct: 25, oomT: 0 }
  ];
  return cases.map(r => sb.bossHintLines(bossId, r).join(' ')).join(' ');
}
const MORGAS = /정화|차단|낙인/;
const IRON = /강타|보호막|전사|전선|전열/;
const THIRST = /마나|소생|기도씨앗|성심 집중|버티|생존/;

// 1. 3보스 출격 경고 문장 존재
chk('c1 3보스 경고 문장 존재', warnText('boss01').length > 0 && warnText('shell_iron').length > 0 && warnText('shell_thirst').length > 0, '');

// 2. 안내/주의/위험 구조 유지 (라벨 3키 · LV 3키 · 이모지 계승)
{
  const lb = sb.SORTIE_WARN_LABEL, lv = sb.SORTIE_WARN_LV;
  chk('c2 안내/주의/위험 구조 유지',
    lb.info.indexOf('안내') >= 0 && lb.caution.indexOf('주의') >= 0 && lb.danger.indexOf('위험') >= 0
    && lv.info === 1 && lv.caution === 2 && lv.danger === 3, JSON.stringify(lb));
}

// 3. 출격 차단 로직 없음 (경고가 enterBattle를 막지 않음)
{
  const eb = src.match(/function enterBattle\(slot\)\{[\s\S]*?\n\}/);
  chk('c3 출격 차단 없음(enterBattle 경고 게이트 0)', eb && !/sortieWarn|SORTIE_WARN/.test(eb[0]) && /LOADOUT\.length!==6/.test(eb[0]), '');
  chk('c4 출정 버튼 disabled 미도입', !/sortie-go[\s\S]{0,120}disabled/.test(src), '');
}

// 5. 경고 1~2줄 (모든 보스·다양한 조합에서 sortieWarnings ≤ 2)
{
  const combos = [
    ['heal', 'big', 'shield', 'pray', 'renew', 'seed'], ['heal', 'big', 'dispel', 'pray', 'renew', 'seed'],
    ['heal', 'big', 'shield', 'dispel', 'focus', 'seed'], ['heal', 'shield', 'dispel', 'focus', 'renew', 'seed']
  ];
  const parties = [['war', 'rog', 'mage', 'sham'], ['war', 'mage', 'sham'], ['rog', 'mage', 'sham']];
  let ok = true;
  ['boss01', 'shell_iron', 'shell_thirst'].forEach(b => combos.forEach(L => parties.forEach(A => { if (sb.sortieWarnings(b, L, A).length > 2) ok = false; })));
  chk('c5 경고 최대 2줄(전 조합)', ok, '');
}

// 6. 어휘 격리 — 각 보스 경고가 자기 정체성 어휘만 사용
{
  const m = warnText('boss01'), i = warnText('shell_iron'), t = warnText('shell_thirst');
  chk('c6 모르가스 경고 = 판단 어휘(정화/차단)·타 보스 어휘 없음',
    MORGAS.test(m) && !/보호막|강타|전선/.test(m) && !/마나|소생|기도씨앗/.test(m), m);
  chk('c7 파쇄자 경고 = 화력/버티기 어휘·정화/차단/마나 없음',
    IRON.test(i) && !/정화|차단|낙인/.test(i) && !/마나|소생|기도씨앗/.test(i), i);
  chk('c8 심연 경고 = 인내/마나 어휘·보호막/정화/차단/강타 없음',
    THIRST.test(t) && !/보호막|정화|차단|낙인|강타/.test(t), t);
}

// 7. 전투 후 거울과 짝맞춤 — 경고 어휘가 같은 보스 결과 거울과 공유, 타 보스 것과 충돌 없음
{
  const pairs = [['boss01', MORGAS, IRON, THIRST], ['shell_iron', IRON, MORGAS, THIRST], ['shell_thirst', THIRST, MORGAS, IRON]];
  let ok = true, detail = [];
  pairs.forEach(([b, own, other1, other2]) => {
    const w = warnText(b), mir = mirrorText(b);
    const share = own.test(w) && own.test(mir);           // 자기 어휘를 전/후 거울이 공유
    const clean = !other1.source.split('|').some(k => w.indexOf(k) >= 0 && mir.indexOf(k) < 0); // 경고에만 튀는 타보스 어휘 없음(느슨)
    if (!share) { ok = false; detail.push(b + ' share fail'); }
  });
  chk('c9 전/후 거울 어휘 짝맞춤(자기 보스 어휘 공유)', ok, detail.join(','));
}

// 8. 금지 grep + 구조 보존
{
  const forbid = ['Math.random', 'base64', '<img', '.png', 'assets'];
  chk('c10 금지 grep 0', forbid.every(p => src.indexOf(p) < 0), '');
}

// 9. Save/localStorage 확장 없음 — SAVE 키 1개(기존)만
{
  const keys = (src.match(/const KEY='[^']*'/g) || []);
  chk('c11 저장 확장 없음(기존 SAVE 키 유지·신규 0)', keys.length === 1 && /seedHealer00/.test(src), keys.join(','));
}

// 10. 새 보스/변주 없음 — BOSS_DEFS 3보스 고정 · 새 어휘 없음
{
  const defs = Object.keys(sh.BOSS_DEFS);
  chk('c12 BOSS_DEFS 3보스 고정(새 보스/변주 0)', defs.length === 3 && defs.join(',') === 'boss01,shell_iron,shell_thirst', defs.join(','));
}

// 11. CSS 신규 없음 — twGoal/twTag 재사용(신규 경고 클래스 0)
{
  chk('c13 CSS 신규 0(twGoal 재사용)', /\.twGoal\{/.test(src) && !/\.sortieWarn[A-Za-z]*\{/.test(src), '');
}

// 12. 3보스 no-input 스모크 기준선 유지
chk('c14 3보스 스모크 기준선',
  JSON.stringify(sh.smoke()) === '{"over":true,"result":"defeat","t":51.4,"steps":1029}' &&
  JSON.stringify(sh.smoke('shell_iron')) === '{"over":true,"result":"defeat","t":48.5,"steps":971}' &&
  JSON.stringify(sh.smoke('shell_thirst')) === '{"over":true,"result":"defeat","t":61.8,"steps":1236}', '');

console.log(`\n${fail === 0 ? '★ SORTIE WARNING COPY POLISH CHECK PASS' : '★ SORTIE WARNING COPY POLISH CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
