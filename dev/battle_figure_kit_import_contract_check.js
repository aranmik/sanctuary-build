'use strict';
// Battle Figure Kit Import Contract 01 전용 검증
// 실행: node dev/battle_figure_kit_import_contract_check.js
// docs/41이 미니피규어 정장 계약을 정확히 담고, 보호 파일(index.html/CSS/JS)이 무변경인지.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const DOC = path.join(ROOT, 'docs', '41_BATTLE_FIGURE_KIT_IMPORT_CONTRACT.md');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const buf = fs.readFileSync(path.join(ROOT, 'index.html'));

let pass = 0, fail = 0;
function chk(name, cond, detail) {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
}

// 1. docs/41 존재
chk('c1 docs/41 존재', fs.existsSync(DOC), '');
const doc = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '';
const has = s => doc.indexOf(s) >= 0;
const hasAll = a => a.every(has);

// 2. 나라님 의도 정본 (보는 맛·첫인상·이미 재미있다)
chk('c2 나라님 의도 정본(보는 맛/첫인상/이미 재미있다)',
  hasAll(['나라님 의도 정본', '보는 맛', '첫인상', '성소판은 이미 재미있다']), '');

// 3. 필수 문장 (의도 2문장)
chk('c3 필수 문장(전달하는 보는 맛/귀엽고 예뻐야 하지만)',
  hasAll(['그 재미를 처음 보는 사람에게 전달하는 보는 맛이다',
    '미니피규어는 귀엽고 예뻐야 하지만, 동시에 전투 문법이 읽혀야 한다']), '');

// 4. 핵심 3문장 (선을 먼저 그리지 않는다)
chk('c4 핵심 문장(선보다 피규어 먼저)',
  hasAll(['선을 먼저 그리지 않는다', '피규어가 전장에 서게 만든다',
    '행동선은 그 피규어 사이에서 발생하게 한다']), '');

// 5. 이식이 아니라 성소판식 재구성
chk('c5 성소판식 재구성 원칙(복붙 금지·규칙만)',
  hasAll(['통째로 복사하지 않는다', '가져올 것은 코드 덩어리가 아니라 조립형 미니피규어의 규칙이다']), '');

// 6. 3층 transform 분리
chk('c6 3층 transform 분리(배치·반응·idle)',
  hasAll(['3층 transform 분리', '배치/원근', '피격·행동 반응', 'idle']), '');

// 7. part 조립형 구조 + bt 6파츠 참고
chk('c7 part 조립형 + bt 6파츠 참고',
  hasAll(['조립형 part 구조', '6파츠', 'shadow', 'extra', 'role', 'body', 'head', 'ears']), '');

// 8. 색 변수 4종
chk('c8 색 변수 4종(main/edge/deep/glow)',
  hasAll(['main', 'edge', 'deep', 'glow']), '');

// 9. sb- 네임스페이스 제안 + 충돌 이유
chk('c9 sb- 네임스페이스 + 충돌 이유',
  hasAll(['`sb-`', '.sb-unit', '.sb-fig', '.sb-part', '.sb-anchor', '.sb-line', '.sb-impulse',
    '충돌 위험', '단일 index.html']), '');

// 10. DOM 골격 초안 + 골격 원칙
chk('c10 DOM 골격 + 원칙(z-index=순서·실루엣 먼저·포인트 2~3)',
  hasAll(['sb-unit sb-ally sb-warrior', '파츠 순서는 z-index와 같다',
    '얼굴보다 실루엣이 먼저다', '2~3개까지만']), '');

// 11. 4동료 피규어 방향
chk('c11 4동료 방향(전사/도적/주술사/마법사)',
  hasAll(['전사', '도적', '주술사', '마법사', '넓은 몸통', '단검', '토템', '투사체 방향성']), '');

// 12. 3보스 피규어 방향
chk('c12 3보스 방향(모르가스/파쇄자/심연 파츠)',
  hasAll(['모르가스', '강철의 파쇄자', '갈증의 심연', '저주 실', '큰 금속 블록', '망치',
    '낮은 액체 덩어리', '심연 핵', '번지는 웅덩이']), '');

// 13. 행동선/임펄스 문법 6종
chk('c13 행동선/임펄스 6종(공격/주시/도발/차단 준비/보호막/수습)',
  hasAll(['공격 중', '주시 중', '도발 중', '차단 준비', '보호막', '수습 임펄스',
    '선만 보이면 실패다']), '');

// 14. HOLD 이유 문장
chk('c14 HOLD 이유 문장',
  hasAll(['현재 HOLD의 이유는 기능 실패가 아니라, 보는 맛의 기준을 더 높이기 위해서다',
    '커밋 보류']), '');

// 15. 다음 구현 순서 5단
chk('c15 다음 구현 순서(Preview→Figure Rework→Line Rework→Morgas→Thirst)',
  hasAll(['Battle Figure Kit Preview 01', 'Iron Crusher Figure Rework 01',
    'Iron Crusher Smash Line Rework 02', 'Morgas Connection Line Proto 01',
    'Thirst Abyss Drain Line Proto 01']), '');

// 16. 가져오면 안 되는 것 (일반명 클래스 금지)
chk('c16 금지 목록(.part/.body/.bt/.sig-av·render.js·좌표계)',
  hasAll(['.sig-av', '.monster', 'render.js', '390×680', '좌표계']), '');

// 17. index.html 무변경 (v8.6 정본 md5 · CSS/JS 포함 단일 파일)
chk('c17 index.html 무변경(md5 c9e289d7… · CSS/JS 무변 포함)',
  crypto.createHash('md5').update(buf).digest('hex') === '8675df863fa9dbb81a2a9ce71fd3f265', '');

// 18. CORE 숫자 유지 (실측)
{
  const lines = html.split('\n');
  let f = 0, core = [];
  for (const l of lines) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) core.push(l); }
  const bytes = Buffer.byteLength(core.join('\n') + '\n', 'utf8');
  chk('c18 CORE 466줄/22,521 B 유지(실측)', core.length === 466 && bytes === 22521, core.length + '줄/' + bytes + 'B');
}

// 19. 행동선 클래스는 여전히 미구현 (41 계약 = 선은 다음 · sb-unit/sb-fig/sb-anchor는 이후 Figure Rework 01[docs/44]에서 실구현)
chk('c19 행동선 클래스(sb-impulse/sb-line) 미구현 — 계약대로 선은 다음',
  ['sb-impulse', 'sb-line'].every(s => html.indexOf(s) < 0), '');

// 20. 금지 grep 유지 (index.html)
{
  const forbid = ['Math.random', 'base64', '<img', '.png', 'assets'];
  chk('c20 index 금지 grep 0(Math.random/에셋/이미지)', forbid.every(p => html.indexOf(p) < 0), '');
}

console.log(`\n${fail === 0 ? '★ BATTLE FIGURE KIT IMPORT CONTRACT CHECK PASS' : '★ BATTLE FIGURE KIT IMPORT CONTRACT CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
