'use strict';
// Battle Stage Language Contract 01 전용 검증 (문서·계약 카드 · 구현 0 · index.html 무접촉)
// 실행: node dev/battle_stage_language_contract_01_check.js
// 무대 언어(포즈/데칼/행동선/오라/임펄스/잔광) 의미, anchor·layer 문법, 보스별 형태,
// runtime 입력·검토필요, 구현 순서·금지선이 docs/53에 잠겼고, index/CORE/구현이 무결한지.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const DOC = path.join(ROOT, 'docs', '53_BATTLE_STAGE_LANGUAGE_CONTRACT_01.md');

let pass = 0, fail = 0;
function chk(name, cond, detail) {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
}
const doc = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '';
const inDoc = (...ss) => ss.every(s => doc.indexOf(s) >= 0);

// 1. 문서 존재
chk('c1 docs/53 존재', fs.existsSync(DOC), '');

// 2. 나라님 의도 정본
chk('c2 나라님 의도 정본', inDoc('나라님 의도 정본', '정답 버튼을 알려주는 UI가 아니라'), '');

// 3~8. 여섯 구성요소 정의
chk('c3 Actor Pose 정의', inDoc('Actor Pose', '배우의 몸짓', '관계선을 **대신하지 않는다**'), '');
chk('c4 Tell Decal 정의', inDoc('Tell Decal', '예고 데칼', '위험의 공간'), '');
chk('c5 Action Line 정의', inDoc('Action Line', '행동선', 'anchor에서 출발'), '');
chk('c6 Aura / Field 정의', inDoc('Aura / Field', '지속 상태'), '');
chk('c7 Contact / Impulse 정의', inDoc('Contact / Impulse', '충돌', '게임 계산 결과와 타이밍이 일치'), '');
chk('c8 Afterglow 정의', inDoc('Afterglow', '잔광', '빠르게 사라진다'), '');

// 9. 사건 6단계
chk('c9 사건 6단계(Intent~Resolve)',
  inDoc('Intent', 'Tell', 'Commit', 'Travel', 'Contact', 'Resolve') &&
  inDoc('계산의 실제 타이밍을 왜곡하면 안'), '');

// 10. Anchor 문법 + 핵심 anchor 개념
chk('c10 Anchor 문법', inDoc('Anchor 문법', '행동이 실제로 발생하는', '중심점을 연결하지 않는다'), '');
chk('c11 shield/body/cast/weapon/orb/totem/ground anchor 개념',
  inDoc('sb-anchor-shield', 'sb-anchor-body', 'sb-anchor-cast', 'sb-anchor-weapon',
        'sb-anchor-orb', 'sb-anchor-totem', 'sb-anchor-ground'), '');

// 12. Layer 문법
chk('c12 Layer 문법(7층)',
  inDoc('Layer 문법', 'Protection Layer', 'Relation / Action Layer', 'Contact / Impact Layer') &&
  inDoc('방패가 막았다면 선이 몸까지 관통하지 않는다'), '');

// 13. UI와 무대 역할 분리
chk('c13 UI와 무대 역할 분리',
  inDoc('UI는 정확성을 말하고, 무대는 상황과 관계를 말한다'), '');

// 14. 강철의 파쇄자 첫 구현 문법
chk('c14 강철의 파쇄자 첫 구현 문법',
  inDoc('강철의 파쇄자 — 첫 구현 문법', '망치 anchor', '화면 모서리→전사 직선 금지'), '');

// 15. 보호막 보유/미보유 분기
chk('c15 보호막 보유/미보유 분기',
  inDoc('보호막 보유/미보유 분기') && inDoc('관통하지 않음') && inDoc('body anchor까지 접촉'), '');

// 16~19. 동료 직업 문법
chk('c16 도적 차단 문법(시전 anchor)', inDoc('도적 문법', '시전 anchor'), '');
chk('c17 마법사 충전·방출 문법', inDoc('마법사 문법', '응축→방출→여운', '단순 레이저 직업으로 만들지 않는다'), '');
chk('c18 주술사 유지·정화 문법', inDoc('주술사 문법', '유지·정화·수습', '항상 선을 연결하지 않는다'), '');

// 19~20. 보스 후속 문법
chk('c19 모르가스 연결 문법', inDoc('모르가스 후속 문법', '꼬인 연결', '거미줄'), '');
chk('c20 심연 흡수 문법', inDoc('갈증의 심연 후속 문법', 'drain ribbon', '말려 들어가는 곡선'), '');

// 21. 동시 연출 혼잡 방지
chk('c21 동시 연출 혼잡 방지', inDoc('동시 연출 혼잡 방지', '주연 사건은 하나'), '');

// 22. runtime 입력 후보 + 검토 필요 표시
chk('c22 runtime 입력 후보 + 실제 코드 확인 필요 표시',
  inDoc('runtime 입력 후보', '실제 코드 확인 필요') &&
  inDoc('단정하지 않는다') && inDoc('sbFigPose'), '');

// 23. 행동선·데칼 runtime 미구현 명시
chk('c23 행동선·데칼·runtime 미구현 명시',
  inDoc('구현은 0', '문서로 잠근다') || inDoc('구현 0'), '');

// 24. index.html md5 유지 (무변경)
{
  const buf = fs.readFileSync(path.join(ROOT, 'index.html'));
  chk('c24 index.html 무변경(185,737 B · md5 8d72d049…)',
    buf.length === 185737 &&
    crypto.createHash('md5').update(buf).digest('hex') === '8d72d049b3090904abfd26488c7d4270', '');
}

// 25. CORE 기준선 유지
{
  const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const lines = src.split('\n');
  let f = 0, core = [];
  for (const l of lines) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) core.push(l); }
  const bytes = Buffer.byteLength(core.join('\n') + '\n', 'utf8');
  const cmd5 = crypto.createHash('md5').update(core.join('\n') + '\n').digest('hex');
  chk('c25 CORE 466줄/22,521 B byte-identical', core.length === 466 && bytes === 22521 &&
    cmd5 === '6cad2ec271a2a79afbee881c2a2e0856', core.length + '줄/' + bytes + 'B/' + cmd5.slice(0, 8));
}

// 26. HOLD 산출물 미유입
chk('c26 HOLD 파일 repo 미유입',
  ['docs/40_IRON_CRUSHER_ACTION_LINE_PROTO.md', 'dev/p20.mjs', 'dev/core_new.js']
    .every(f => !fs.existsSync(path.join(ROOT, f))), '');

// 27. 다음 구현 순서
chk('c27 다음 구현 순서(Smash Line/Pose Runtime/Morgas/Thirst)',
  inDoc('다음 구현 순서', 'Iron Crusher Smash Line Rework 02', 'Companion Figure Pose Runtime 01',
        'Morgas Connection Line Proto 01', 'Thirst Abyss Drain Line Proto 01'), '');

// 28. 금지선 · 실패 사례
chk('c28 금지선 + 실패 사례',
  inDoc('금지선', '실패 사례', '전술 도식판') &&
  inDoc('버튼을 가리키는 튜토리얼 선'), '');

// 29. 이번 카드에서 실제 구현 파일이 없는가 (문서 only — 신규 html/mjs 0)
chk('c29 문서-only(신규 프리뷰 html·p파일 0)',
  !fs.existsSync(path.join(ROOT, 'dev', 'battle_stage_language_contract_01.html')) &&
  !fs.existsSync(path.join(ROOT, 'dev', 'p24.mjs')), '');

// 30. 포인터 문서 정합성(53 참조가 최소 1곳 이상에 반영)
{
  const refs = ['docs/98_NEXT_IMPLEMENTATION_CARDS.md', 'docs/99_HANDOFF_NEXT_REN.md', 'docs/102_FINAL_HANDOFF_INDEX.md']
    .filter(f => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8').indexOf('53_BATTLE_STAGE_LANGUAGE_CONTRACT') >= 0 || fs.readFileSync(path.join(ROOT, f), 'utf8').indexOf('Battle Stage Language Contract 01') >= 0; } catch (e) { return false; } });
  chk('c30 포인터 문서에 53 반영(≥2)', refs.length >= 2, refs.join(','));
}

console.log(`\n${fail === 0 ? '★ BATTLE STAGE LANGUAGE CONTRACT 01 CHECK PASS' : '★ BATTLE STAGE LANGUAGE CONTRACT 01 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
