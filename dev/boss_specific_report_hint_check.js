'use strict';
// Boss-Specific Report Hint 01 전용 검증 (docs/33·34)
// 실행: node dev/boss_specific_report_hint_check.js
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
function repOf(bossId) {
  const g = sh.createGame(bossId); g.start(); let n = 0;
  while (!g.S.over && n < 4000) { g.step(0.05); n++; }
  return g.S.ev.filter(e => e.y === 'end')[0].rep;
}
// 합성 r — 특정 분기 유도(승리/스탯)
function synth(over) { return Object.assign({ r: 'defeat', ints: [], deaths: [], abs: 0, ohPct: 0, oomT: 0, disp: 0, bombDef: 0, bombTot: 0 }, over); }
const join = a => a.join(' ');
const CLEANSE = /정화|차단|낙인/;     // 모르가스 어휘
const TANK = /강타|보호막|전사/;       // 파쇄자 어휘
const MANA = /마나|소생|성심 집중|버틴|아꼈|안 쓸/; // 심연 어휘

// 1~3. 보스별 전용 힌트가 선택됨
const mH = sb.bossHintLines('boss01', repOf('boss01'));
const iH = sb.bossHintLines('shell_iron', repOf('shell_iron'));
const tH = sb.bossHintLines('shell_thirst', repOf('shell_thirst'));
chk('c1 모르가스 전용 힌트 선택', mH.length >= 1 && CLEANSE.test(join(mH)), JSON.stringify(mH));
chk('c2 파쇄자 전용 힌트 선택', iH.length >= 1 && TANK.test(join(iH)), JSON.stringify(iH));
chk('c3 심연 전용 힌트 선택', tH.length >= 1 && MANA.test(join(tH)), JSON.stringify(tH));

// 4. 보스별 힌트 최대 2줄
chk('c4 최대 2줄(3보스·승리/패배 케이스)',
  [mH, iH, tH,
    sb.bossHintLines('boss01', synth({ r: 'victory_kill' })),
    sb.bossHintLines('shell_iron', synth({ r: 'victory_survive', abs: 3000 })),
    sb.bossHintLines('shell_thirst', synth({ r: 'victory_survive' }))
  ].every(a => a.length <= 2), '');

// 5. 파쇄자 힌트가 정화/차단 보스처럼 오해시키지 않음 (승리·패배·저보호막 전 케이스)
{
  const cases = [iH,
    sb.bossHintLines('shell_iron', synth({ r: 'victory_kill' })),
    sb.bossHintLines('shell_iron', synth({ abs: 100 })),
    sb.bossHintLines('shell_iron', synth({ deaths: [{ id: 'war', name: '전사' }] }))];
  chk('c5 파쇄자 힌트에 정화/차단/낙인 어휘 없음', cases.every(a => !CLEANSE.test(join(a))), JSON.stringify(cases));
}

// 6. 심연 힌트가 보호막/정화 체크처럼 오해시키지 않음
{
  const cases = [tH,
    sb.bossHintLines('shell_thirst', synth({ r: 'victory_survive' })),
    sb.bossHintLines('shell_thirst', synth({ oomT: 20 })),
    sb.bossHintLines('shell_thirst', synth({ ohPct: 30 }))];
  chk('c6 심연 힌트에 보호막/정화/차단 어휘 없음', cases.every(a => !/보호막|정화|차단/.test(join(a))), JSON.stringify(cases));
}

// 7. 모르가스 힌트가 단순 딜/탱커 체크처럼 오해시키지 않음 (판단 어휘가 있음)
{
  const cases = [mH,
    sb.bossHintLines('boss01', synth({ r: 'victory_kill' })),
    sb.bossHintLines('boss01', synth({ ints: [{ ok: 0, r: '도적이 피의 낙인에 걸려 반응이 늦었습니다' }] }))];
  chk('c7 모르가스 힌트에 판단(정화/차단) 어휘 존재·강타 오해 없음',
    cases.every(a => CLEANSE.test(join(a))) && !TANK.test(join(mH)), JSON.stringify(cases));
}

// 8. 기존 공용 리포트 힌트가 완전히 죽지 않음 (pickReportHint 존치 + 미인식 보스는 폴백)
{
  const common = sb.pickReportHint(repOf('boss01'));
  const unknownFallback = sb.bossHintLines('nonexistent_boss', repOf('boss01'));
  chk('c8 공용 pickReportHint 존치(+미인식 보스 폴백)',
    typeof sb.pickReportHint === 'function' && typeof common === 'string' && common.length > 0 && unknownFallback.length === 0
    && /reportMirror\(r\)/.test(src) && /\[pickReportHint\(r\)\]/.test(src), 'common=' + JSON.stringify(common));
}

// 9. 3보스 no-input smoke 기준선 유지
chk('c9 3보스 스모크 기준선',
  JSON.stringify(sh.smoke()) === '{"over":true,"result":"defeat","t":51.4,"steps":1029}' &&
  JSON.stringify(sh.smoke('shell_iron')) === '{"over":true,"result":"defeat","t":48.5,"steps":971}' &&
  JSON.stringify(sh.smoke('shell_thirst')) === '{"over":true,"result":"defeat","t":61.8,"steps":1236}', '');

// 10. 금지 grep 유지 + 코어 무접촉
{
  const forbid = ['Math.random', 'base64', '<img', '.png', 'assets'];
  const noForbid = forbid.every(p => src.indexOf(p) < 0);
  chk('c10 금지 grep 0 + report()/pickReportHint 슬롯 재사용(신규 UI 0)',
    noForbid && (src.match(/pickReportHint/g) || []).length === 2 && /class="ins gold">💡/.test(src), '');
}

console.log(`\n${fail === 0 ? '★ BOSS-SPECIFIC REPORT HINT CHECK PASS' : '★ BOSS-SPECIFIC REPORT HINT CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
