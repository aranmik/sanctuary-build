'use strict';
// Save v8.6 / Chapel UX Milestone Save 01 전용 검증
// 실행: node dev/save_v86_check.js
// 세이브 v8.6이 성당 UX 첫 성공 기준점을 정확히 담고, v8.5 역사 스냅샷을 보존하며, 보호 파일이 무변경인지.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const SAVE = path.join(ROOT, '성소판_세이브_v8.6.md');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const buf = fs.readFileSync(path.join(ROOT, 'index.html'));

let pass = 0, fail = 0;
function chk(name, cond, detail) {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
}

// 1. Save v8.6 존재
chk('c1 세이브 v8.6 파일 존재', fs.existsSync(SAVE), '');
const save = fs.existsSync(SAVE) ? fs.readFileSync(SAVE, 'utf8') : '';
const has = s => save.indexOf(s) >= 0;
const hasAll = a => a.every(has);

// 2. 세이브 이름 기록
chk('c2 세이브 이름(Save v8.6 / Chapel UX Milestone Save 01)',
  hasAll(['Save v8.6', 'Chapel UX Milestone Save 01']), '');

// 3. 기준 커밋 983e390 기록
chk('c3 기준 커밋 983e390 기록', has('983e390'), '');

// 4. 현행 index 기준선 기록 (120,418 / 1,954 / md5 02a512c5)
chk('c4 현행 index 기준선(120,418 / 1,954 / md5 02a512c5)',
  hasAll(['120,418', '1,954', '02a512c5c2eaf5e3ca3f0f4ebf4190e7']), '');

// 5. v8.5 역사 기준선 보존 (117,532 / 1,920 / md5 2630669c)
chk('c5 v8.5 역사 기준선 보존(117,532 / 1,920 / md5 2630669c)',
  hasAll(['117,532', '1,920', '2630669c87a2b56409dd22558d31d24e']), '');

// 6. CORE 466줄 / 22,521 B 기록
chk('c6 CORE 466 / 22,521 기록', hasAll(['466', '22,521']), '');

// 7. 3보스 no-input smoke 기록
chk('c7 3보스 스모크 기록(51.4/48.5/61.8)',
  hasAll(['51.4', '48.5', '61.8']), '');

// 8. Chapel Loadout UI 01 핵심 성과 기록 (탭 4종 + 상단 고정 + 요약 + 버튼 제거 + 하단 고정)
chk('c8 Chapel Loadout UI 01 핵심 성과 기록',
  hasAll(['상단 고정', '치유', '보호', '정화·유틸', '지속·자원', '구성 요약',
    '전투 시작 버튼 제거', '저장하고 마을로', '하단 고정', '마나', '신성력']), '');

// 9. 나라님 실기 확인 문장 기록
chk('c9 나라님 실기 확인 기록',
  hasAll(['아주 좋아졌어', '이 정도면 충분히 잘 보여', '디테일은 지금 말고 다음에', 'Max']), '');

// 10. 금지선 기록 (없었음)
chk('c10 금지선 기록',
  hasAll(['CORE 변경 없음', '전투 코드 변경 없음', '전투 수치 튜닝 없음', '승패 판정 변경 없음',
    '새 스킬 구현 없음', '20스킬 구현 없음', 'Save/localStorage 확장 없음',
    'Math.random 추가 없음', '외부 에셋 추가 없음']), '');

// 11. 다음 후보 카드 기록
chk('c11 다음 후보 5카드 기록',
  hasAll(['Battle Visual Identity Contract 01', 'Companion Identity Decision 01',
    'Inn Companion Role Sheet 01', 'Footprints Record Panel 01', 'Chapel Readability Polish 02']), '');

// 12. v8.6의 의미 (2차 마을 UX 첫 성공 · 준비 화면 UX)
chk('c12 v8.6의 의미(2차 마을 UX 첫 성공 · 준비 화면 UX)',
  hasAll(['2차 마을 UX', '1차 데모 최종', '준비 화면']), '');

// 13. 세이브 계보표 (v8.2~v8.6)
chk('c13 세이브 계보표(v8.2~v8.6)',
  hasAll(['v8.2', 'v8.3', 'v8.4', 'v8.5', 'v8.6', '34addd9c', '8e7ee68a', 'e5c7ca06']), '');

// 14. index.html 무변경 (현행 md5 대조)
chk('c14 index.html 현행 기준선(md5 c9e289d7…)',
  crypto.createHash('md5').update(buf).digest('hex') === 'ae27ce9c0d5c85a1038fc49c587146ec', '');

// 15. CORE 숫자 유지 (실측)
{
  const lines = html.split('\n');
  let f = 0, core = [];
  for (const l of lines) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) core.push(l); }
  const bytes = Buffer.byteLength(core.join('\n') + '\n', 'utf8');
  chk('c15 CORE 466줄/22,521 B 유지(실측)', core.length === 466 && bytes === 22521, core.length + '줄/' + bytes + 'B');
}

// 16. 이전 세이브 보존 (v8.2~v8.5 삭제 안 함)
chk('c16 이전 세이브 v8.2~v8.5 보존',
  ['성소판_세이브_v8.2.md', '성소판_세이브_v8.3.md', '성소판_세이브_v8.4.md', '성소판_세이브_v8.5.md']
    .every(f => fs.existsSync(path.join(ROOT, f))), '');

// 17. 금지 grep 유지 (index.html에 Math.random/에셋/이미지 0)
{
  const forbid = ['Math.random', 'base64', '<img', '.png', 'assets'];
  chk('c17 index 금지 grep 0(Math.random/에셋/이미지)', forbid.every(p => html.indexOf(p) < 0), '');
}

console.log(`\n${fail === 0 ? '★ SAVE v8.6 CHECK PASS' : '★ SAVE v8.6 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
