'use strict';
// Battle Visual Identity Contract 01 전용 검증
// 실행: node dev/battle_visual_identity_contract_check.js
// docs/39가 전투 시각 문법 계약을 정확히 담고, 보호 파일(index.html)이 무변경인지.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const DOC = path.join(ROOT, 'docs', '39_BATTLE_VISUAL_IDENTITY_CONTRACT.md');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const buf = fs.readFileSync(path.join(ROOT, 'index.html'));

let pass = 0, fail = 0;
function chk(name, cond, detail) {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
}

// 1. docs/39 존재
chk('c1 docs/39 존재', fs.existsSync(DOC), '');
const doc = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '';
const has = s => doc.indexOf(s) >= 0;
const hasAll = a => a.every(has);

// 2. 핵심 3문장 (텍스트/행동선/피규어)
chk('c2 핵심 문장(텍스트=확정 정보·행동선=전장 문법·피규어=정체성)',
  hasAll(['텍스트는 확정 정보다', '행동선은 전장 문법이다', '피규어는 객체의 정체성이다']), '');

// 3. 테트리스 문장 (텍스트 예고 유지 원칙)
chk('c3 테트리스 다음 블록 문장 + 보조 힌트',
  hasAll(['테트리스의 다음 블록처럼 유지', '보조 힌트']), '');

// 4. 텍스트 예고와 행동선 관계 (대체 금지·정답 금지·흔들림 표시)
chk('c4 텍스트 예고↔행동선 관계 원칙',
  hasAll(['행동선은 텍스트를 대체하지 않는다', '정답 버튼을 가리키지 않는다',
    '어디가 흔들릴 수 있는지']), '');

// 5. 튜토리얼 3보스 친절도 원칙
chk('c5 튜토리얼 3보스 친절도 원칙',
  hasAll(['튜토리얼에 가깝다', '친절해도 된다', '기본 문법을 가르치는 보스',
    '불친절은 허용하지만 억까는 금지']), '');

// 6. 3단 문장 (답을 가르친다/질문을 던진다/흔들리는 순간)
chk('c6 튜토리얼→이후→변주 3단 문장',
  hasAll(['튜토리얼 보스는 답을 가르친다', '이후 보스는 질문을 던진다',
    '배운 답이 흔들리는 순간']), '');

// 7. 모르가스 시각 정체성
chk('c7 모르가스 시각 정체성(꼬임·낙인선·차단선 복구)',
  hasAll(['모르가스', '가늘고 비틀린', '낙인선', '연결 / 차단 / 정화 / 복구 / 꼬임']), '');

// 8. 파쇄자 시각 정체성
chk('c8 파쇄자 시각 정체성(사각형·강타선·방패층)',
  hasAll(['강철의 파쇄자', '큰 사각형', '강타선', '방패층에 걸림',
    '압박 / 충돌 / 강타 / 전선 / 버티기']), '');

// 9. 심연 시각 정체성
chk('c9 심연 시각 정체성(흡수체·갈증선·유지선)',
  hasAll(['갈증의 심연', '빨아들이는 느낌', '갈증선', '유지선',
    '소모 / 누수 / 마나 / 유지 / 버티기']), '');

// 10. 동료 미니 피규어 문법
chk('c10 동료 미니 피규어 문법(실루엣 우선·부품·역할)',
  hasAll(['실루엣이 먼저다', '손 오브젝트', '행동선 앵커', '귀여움보다 읽기 우선',
    '직접 공격자가 아님']), '');

// 11. 조립형 CSS / 브릭 토이 원칙
chk('c11 조립형/브릭 토이 원칙(부품 조합·변주 재사용·읽기 포인트 제한)',
  hasAll(['브릭 토이', 'CSS 부품 조합', '같은 몸체 + 다른 장식', '2~3개로 제한']), '');

// 12. 행동선 5종 분류
chk('c12 행동선 5종(압박/연결/누수/보호/수습)',
  hasAll(['압박선', '연결선', '누수선', '보호선', '수습선']), '');

// 13. 정보 과잉 방지 원칙
chk('c13 정보 과잉 방지(강조 제한·390px·우선순위)',
  hasAll(['읽히는 것이 먼저다', '세 번 과하게 외치지 않는다', '390px', '다음 보스 행동']), '');

// 14. 첫 구현 후보 + 후속 후보
chk('c14 첫 구현 후보(Iron Crusher Action Line Proto 01 + 후속 2종)',
  hasAll(['Iron Crusher Action Line Proto 01', 'Morgas Connection Line Proto 01',
    'Thirst Abyss Drain Line Proto 01', '이번 문서에서는 어느 것도 구현하지 않는다']), '');

// 15. 기존 문서 연결 (33/34/35/37/38)
chk('c15 기존 문서 연결(33/34/35/37/38)',
  hasAll(['33_BOSS_GRAMMAR.md', '34_BOSS_SPECIFIC_REPORT_HINT.md',
    '35_SORTIE_WARNING_COPY_POLISH.md', '37_VILLAGE_UX_CONTRACT.md',
    '38_CHAPEL_LOADOUT_UI.md', '사고 이후 3초']), '');

// 16. 금지선 기록
chk('c16 금지선(대공사/정답 강조/텍스트 예고 제거/수치/에셋)',
  hasAll(['전투 화면 대공사', '행동선으로 정답 버튼 강조', '텍스트 예고 제거',
    '전투 수치/판정 변경', '외부 이미지/에셋 추가']), '');

// 17. index.html 무변경 (현행 md5 대조)
chk('c17 index.html 현행 기준선(md5 c9e289d7…)',
  crypto.createHash('md5').update(buf).digest('hex') === 'ae27ce9c0d5c85a1038fc49c587146ec', '');

// 18. CORE 숫자 유지 (실측)
{
  const lines = html.split('\n');
  let f = 0, core = [];
  for (const l of lines) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) core.push(l); }
  const bytes = Buffer.byteLength(core.join('\n') + '\n', 'utf8');
  chk('c18 CORE 466줄/22,521 B 유지(실측)', core.length === 466 && bytes === 22521, core.length + '줄/' + bytes + 'B');
}

// 19. 금지 grep 유지 (index.html)
{
  const forbid = ['Math.random', 'base64', '<img', '.png', 'assets'];
  chk('c19 index 금지 grep 0(Math.random/에셋/이미지)', forbid.every(p => html.indexOf(p) < 0), '');
}

console.log(`\n${fail === 0 ? '★ BATTLE VISUAL IDENTITY CONTRACT CHECK PASS' : '★ BATTLE VISUAL IDENTITY CONTRACT CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
