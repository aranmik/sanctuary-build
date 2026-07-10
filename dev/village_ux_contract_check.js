'use strict';
// Village UX Contract 01 전용 검증 (docs/37)
// 실행: node dev/village_ux_contract_check.js
// 문서-only 카드 — docs/37 내용 완비 + 보호 파일(index.html/CSS/CORE) 무변경 검증.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const doc = fs.readFileSync(path.join(ROOT, 'docs', '37_VILLAGE_UX_CONTRACT.md'), 'utf8');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const buf = fs.readFileSync(path.join(ROOT, 'index.html'));

let pass = 0, fail = 0;
function chk(name, cond, detail) { cond ? pass++ : fail++; console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`); }
const has = s => doc.indexOf(s) >= 0;
const hasAll = a => a.every(has);

// 1. 문서 존재
chk('c1 docs/37 존재', doc.length > 1500, 'len=' + doc.length);

// 2. 네 시설 모두 언급
chk('c2 성당/여관/발자취/토벌 게시판 언급', hasAll(['성당', '여관', '발자취', '토벌 게시판']), '');

// 3. 성당 — 장착 슬롯 상단 고정 원칙
chk('c3 장착 슬롯 상단 고정 원칙', hasAll(['상단 고정', '스크롤']) && (has('장착 스킬 6칸') || has('장착 슬롯')), '');

// 4. 카테고리 탭 + 4후보
chk('c4 카테고리 탭(치유/보호/정화·유틸/지속·자원)', hasAll(['카테고리 탭', '치유', '보호', '정화·유틸', '지속·자원']), '');

// 5. 저장하고 마을로 유지 + 전투 시작 버튼 제거/분리 후보
chk('c5 저장하고 마을로 유지', has('저장하고 마을로'), '');
chk('c6 이 구성으로 전투 시작 제거/분리 후보', has('이 구성으로 전투 시작') && (has('제거') && (has('토벌 게시판') || has('보스 선택'))), '');

// 6. 성당/출격/결과 3단 메시지 분리
chk('c7 메시지 3단 분리(성당 성향/출격 위험/결과 흔들림)',
  has('일반 성향') && has('출격') && has('결과') && (has('전투 전 거울') || has('보스별')) , '');

// 7. 여관 = 동료 역할 정보 창구 + 구현 보류
chk('c8 여관=동료 역할 정보 창구·구현 보류', hasAll(['동료', '역할']) && (has('구현은 보류') || has('구현 보류') || has('구현한다') && has('보류')), '');

// 8. 발자취 기록 창구 분리
chk('c9 발자취 기록 창구 분리(최고기록/원정)', hasAll(['발자취', '최고기록', '원정']) && (has('별도 메뉴') || has('별도 창구') || has('분리')), '');

// 9. 동료 구조 — 7명 확정 우선 / 다중 영웅 장기 후보
chk('c10 7명 확정 동료 우선 / 다중 영웅 장기 후보',
  (has('7명의 확정') || has('7명 확정')) && has('장기 확장 후보') && has('다중 영웅') || (has('7명의 확정 파티원') && has('장기 확장 후보로 남긴다')), '');

// 10. 구현 순서 5카드 명시
chk('c11 구현 순서 5카드',
  hasAll(['Chapel Loadout UI 01', 'Battle Visual Identity Contract 01', 'Companion Identity Decision 01', 'Inn Companion Role Sheet 01', 'Footprints Record Panel 01']), '');

// 11. 마을 핵심 선언(전투 전 준비 공간)
chk('c12 마을 핵심 원칙(전투 전 준비 공간·정답 아님)', has('전투 전 준비 공간') && has('정답'), '');

// 12. index.html 변경 없음 (현행 기준선 md5)
// ※ 라이브 index.html 가드 — Chapel Loadout UI 01(EP23) 재-baseline로 현행 md5 갱신(docs/37은 index.html 미수정 카드였음)
chk('c13 index.html 현행 기준선(md5 172e4660…)',
  crypto.createHash('md5').update(buf).digest('hex') === '02a512c5c2eaf5e3ca3f0f4ebf4190e7', '');

// 13. CORE 숫자 유지
{
  const lines = html.split('\n'); let f = 0, core = [];
  for (const l of lines) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) core.push(l); }
  const bytes = Buffer.byteLength(core.join('\n') + '\n', 'utf8');
  chk('c14 CORE 466줄/22,521 B 유지', core.length === 466 && bytes === 22521, core.length + '줄/' + bytes + 'B');
}

// 14. CSS 무변경 확인 — 신규 클래스 추가 없음(문서-only 카드이므로 index.html 자체가 불변이면 자동 충족)
//     추가로 새 마을 UX 관련 런타임 심볼이 index.html에 심어지지 않았는지(문서에만 존재)
chk('c15 런타임 미구현(카테고리 탭/발자취 심볼 index.html 부재)',
  html.indexOf('카테고리 탭') < 0 && html.indexOf('발자취') < 0, '');

// 15. 금지 grep 유지
chk('c16 금지 grep 0', ['Math.random', 'base64', '<img', '.png', 'assets'].every(p => html.indexOf(p) < 0), '');

console.log(`\n${fail === 0 ? '★ VILLAGE UX CONTRACT CHECK PASS' : '★ VILLAGE UX CONTRACT CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
