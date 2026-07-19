'use strict';
// First Demo Closure Handoff 01 전용 검증 (docs/36)
// 실행: node dev/first_demo_closure_handoff_check.js
// 문서-only 카드 — docs/36 내용 + 보호 파일(index.html/CORE) 무변경 검증.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const doc = fs.readFileSync(path.join(ROOT, 'docs', '36_FIRST_DEMO_CLOSURE_HANDOFF.md'), 'utf8');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const buf = fs.readFileSync(path.join(ROOT, 'index.html'));

let pass = 0, fail = 0;
function chk(name, cond, detail) {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
}
const has = (s) => doc.indexOf(s) >= 0;
const hasAll = (arr) => arr.every(has);

// 1. 문서 존재 + 비어있지 않음
chk('c1 docs/36 존재', doc.length > 1000, 'len=' + doc.length);

// 2. 최신 커밋 a7b1e58 언급
chk('c2 최신 커밋 a7b1e58 언급', has('a7b1e58'), '');

// 3. 직전 핵심 커밋 언급
chk('c3 직전 핵심 커밋(f115168·cf0dcad) 언급', hasAll(['f115168', 'cf0dcad']), '');

// 4. 3보스 이름 + 핵심 역할
chk('c4 3보스 이름', hasAll(['모르가스', '강철의 파쇄자', '갈증의 심연']), '');
chk('c5 3보스 핵심 역할(판단/화력/인내 계열)', hasAll(['정화', '차단', '보호막', '전사', '마나', '소생']), '');

// 5. 출격 전 거울 / 전투 후 거울 언급 + 두 카드 연결
chk('c6 전투 전/후 거울 언급', hasAll(['출격 전', '전투 후', '거울']), '');
chk('c7 두 거울 카드 연결', hasAll(['Sortie Warning', 'Boss-Specific Report Hint']), '');

// 6. 성소판 핵심 정의 + 선언문
chk('c8 핵심 정의(리베로·사제는 공격하지 않는다)', hasAll(['리베로', '사제는', '공격하지 않는다']), '');
chk('c9 핵심 선언문', hasAll(['계획은 무너진다', '동료는 실수한다', '전장은 흔들린다', '파티를 다시 세운다']), '');

// 7. 기준선 숫자 기록
chk('c10 기준선 숫자(117,532 / 466 / md5)', hasAll(['117,532', '1,920', '2630669c87a2b56409dd22558d31d24e', '466', '22,521']), '');
chk('c11 3보스 스모크 숫자', hasAll(['51.4', '1029', '48.5', '971', '61.8', '1236']), '');

// 8. 금지 항목 기록
chk('c12 금지 항목 기록', hasAll(['새 보스', '변주 보스', '대정화', '성심 집중 확장', '수치 튜닝']), '');

// 9. 다음 후보 카드 기록
chk('c13 다음 후보 카드', hasAll(['Phone Check', 'Tell Polish', 'Variant Boss Decision', 'Party Layer', 'Skill Loadout Expansion']), '');

// 10. 완료 카드 목록
chk('c14 완료 카드 목록(11종 핵심)', hasAll(['Repo Foundation 01', 'Iron Crusher Runtime 01', 'Thirst Abyss Runtime 01', 'Boss Grammar 01', 'Sortie Warning Copy Polish 01']), '');

// 11. index.html 변경 없음 (현행 기준선 md5와 동일)
// ※ 라이브 index.html 가드 — Chapel Loadout UI 01(EP23) 재-baseline로 현행 md5 갱신(docs/36 §E 기록 숫자는 1차 데모 스냅샷으로 유지)
chk('c15 index.html 현행 기준선(md5 172e4660…)',
  crypto.createHash('md5').update(buf).digest('hex') === '5d645ffcf1592f1430b73647f4c39ccb', '');

// 12. CORE 숫자 유지
{
  const lines = html.split('\n');
  let f = 0, core = [];
  for (const l of lines) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) core.push(l); }
  const bytes = Buffer.byteLength(core.join('\n') + '\n', 'utf8');
  chk('c16 CORE 466줄/22,521 B 유지', core.length === 466 && bytes === 22521, core.length + '줄/' + bytes + 'B');
}

// 13. 금지 grep 유지
{
  const forbid = ['Math.random', 'base64', '<img', '.png', 'assets'];
  chk('c17 금지 grep 0', forbid.every(p => html.indexOf(p) < 0), '');
}

console.log(`\n${fail === 0 ? '★ FIRST DEMO CLOSURE HANDOFF CHECK PASS' : '★ FIRST DEMO CLOSURE HANDOFF CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
