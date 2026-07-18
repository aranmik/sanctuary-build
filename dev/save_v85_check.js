'use strict';
// Save v8.5 / First Demo Final Save 01 전용 검증
// 실행: node dev/save_v85_check.js
// 세이브 v8.5가 현행 1차 데모 최종 기준선을 정확히 담고, 보호 파일이 무변경인지.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const SAVE = path.join(ROOT, '성소판_세이브_v8.5.md');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const buf = fs.readFileSync(path.join(ROOT, 'index.html'));

let pass = 0, fail = 0;
function chk(name, cond, detail) {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
}

// 1. Save v8.5 존재
chk('c1 세이브 v8.5 파일 존재', fs.existsSync(SAVE), '');
const save = fs.existsSync(SAVE) ? fs.readFileSync(SAVE, 'utf8') : '';
const has = s => save.indexOf(s) >= 0;
const hasAll = a => a.every(has);

// 2. index 기준선 기록 (117,532 / 1,920 / md5)
chk('c2 index 기준선 기록(117,532 / 1,920 / md5)',
  hasAll(['117,532', '1,920', '2630669c87a2b56409dd22558d31d24e']), '');

// 3. CORE 466줄 / 22,521 B 기록
chk('c3 CORE 466줄 / 22,521 B 기록', hasAll(['466', '22,521']), '');

// 4. 3보스 no-input smoke 기록
chk('c4 3보스 스모크 기록(51.4/48.5/61.8 · steps)',
  hasAll(['51.4', '1,029', '48.5', '971', '61.8', '1,236']), '');

// 5. 6종+ 검증 기록
chk('c5 검증 체크 기록(baseline 36 등)',
  hasAll(['baseline_check', '36', 'matrix_sortie_warning_check', 'iron_crusher_runtime_check',
    'thirst_abyss_runtime_check', 'boss_specific_report_hint_check', 'sortie_warning_copy_polish_check']), '');

// 6. v8.4와 현행 기준선 차이 명시 (세이브 계보 표 + v8.4→v8.5 diff)
chk('c6 v8.4와의 차이 명시',
  hasAll(['v8.4', '114,688', 'e5c7ca06', 'v8.5', '2,844', 'CORE 466/22,521 불변']), '');

// 7. 두 거울(전투 전/후) + 3보스 + 종료 반영
chk('c7 두 거울·3보스·종료 반영',
  hasAll(['전투 전 거울', '전투 후 거울', '모르가스', '강철의 파쇄자', '갈증의 심연', '1차 데모', 'docs/36']), '');

// 8. index.html 무변경 (현행 md5)
// ※ 라이브 index.html 가드 — Chapel Loadout UI 01(EP23) 재-baseline로 현행 md5 갱신(세이브 v8.5 기록 숫자 2630669c는 발행 시점 스냅샷으로 유지 · c2)
chk('c8 index.html 현행 기준선(md5 172e4660…)',
  crypto.createHash('md5').update(buf).digest('hex') === '1fa9132fb7567a778ce6e3f77ed856df', '');

// 9. CORE 숫자 유지 (실측)
{
  const lines = html.split('\n');
  let f = 0, core = [];
  for (const l of lines) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) core.push(l); }
  const bytes = Buffer.byteLength(core.join('\n') + '\n', 'utf8');
  chk('c9 CORE 466줄/22,521 B 유지(실측)', core.length === 466 && bytes === 22521, core.length + '줄/' + bytes + 'B');
}

// 10. 이전 세이브 보존 (v8.2~v8.4 삭제 안 함)
chk('c10 이전 세이브 v8.2~v8.4 보존',
  ['성소판_세이브_v8.2.md', '성소판_세이브_v8.3.md', '성소판_세이브_v8.4.md'].every(f => fs.existsSync(path.join(ROOT, f))), '');

// 11. 금지 grep 유지
{
  const forbid = ['Math.random', 'base64', '<img', '.png', 'assets'];
  chk('c11 금지 grep 0', forbid.every(p => html.indexOf(p) < 0), '');
}

console.log(`\n${fail === 0 ? '★ SAVE v8.5 CHECK PASS' : '★ SAVE v8.5 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
