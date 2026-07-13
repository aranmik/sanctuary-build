'use strict';
// Iron Crusher Stage Input Audit 01 전용 검증 (읽기 전용 감사 · 구현 0)
// 실행: node dev/iron_crusher_stage_input_audit_01_check.js
// 문서 문자열 매칭 + ★감사 주장을 실제 index.html 코드와 교차 검증(상태·selector 실존 확인).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const DOC = path.join(ROOT, 'docs', '54_IRON_CRUSHER_STAGE_INPUT_AUDIT_01.md');

let pass = 0, fail = 0;
function chk(name, cond, detail) {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
}
const doc = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '';
const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const inDoc = (...ss) => ss.every(s => doc.indexOf(s) >= 0);
const inSrc = s => src.indexOf(s) >= 0;

// 1. 감사 문서 존재
chk('c1 docs/54 존재', fs.existsSync(DOC), '');

// 2. 비구현 선언
chk('c2 비구현 선언(읽기 전용 감사·구현 0)', inDoc('비구현 선언', '읽기 전용 감사'), '');

// 3~4. index/runtime 무변경 선언
chk('c3 index.html 무변경 선언', inDoc('byte-identical'), '');
chk('c4 runtime 무변경 선언', inDoc('runtime JS/CSS 수정 0'), '');

// 5. 새 상태/타이머 금지 명시
chk('c5 새 상태/타이머 금지', inDoc('새 전투 상태/타이머 0') && inDoc('새 타이머 불필요'), '');

// 6. 강타 cast 조사 — 문서 주장이 실코드와 일치하는지 교차 검증
chk('c6 강타 cast 조사 + 실코드 일치',
  inDoc('강타 cast 상태 흐름', "kind:'smash'") &&
  inSrc("S.boss.cast={kind:'smash',name:'탱커 강타',start:S.t,end:S.t+B.smashCast,tg:tg.id,blk:ev.blk||0}"), '');

// 7. target id 조사 + 실코드 일치
chk('c7 target id 조사 + 실코드 일치',
  inDoc('target id 흐름', "bc.tg==='war'") && inSrc('resolveBossCast') && inSrc('허공을 갈랐습니다'), '');

// 8. shield/block/absorb 조사 + 실코드 일치 (별개 개념·지역변수 use·S.st.abs)
chk('c8 shield/block/absorb 조사 + 실코드 일치',
  inDoc('shield / block / absorb 흐름', 'S.st.abs', '별개 개념') &&
  inSrc('u.shield.amt-=use;a-=use;S.st.abs+=use;') && inSrc('smashBlocked'), '');

// 9. 전사 pose 조사 + 실코드 일치 (guard=보호막 조건)
chk('c9 전사 pose 조사 + 실코드 일치',
  inDoc('전사 pose 입력', 'guard') &&
  inSrc("if(war&&war.alive){ if(war.shield&&war.shield.amt>0)wp='guard'; else if(smashing)wp='brace'; }"), '');

// 10. 파쇄자 windup 조사 + 실코드 일치
chk('c10 파쇄자 windup 조사 + 실코드 일치',
  inDoc('windup pose 입력', 'sb-ic-hammer') &&
  inSrc("var bp=smashing?'windup':''") && inSrc('sb-ic-hammer'), '');

// 11. 도적 interrupt 존재 여부 — "사용 금지" 명시 + 실코드 근거(judge 전용)
chk('c11 도적 interrupt 조사 + 사용 금지 명시',
  inDoc('현재 runtime 입력 없음 — Iron Crusher Smash Line Rework 02 범위에서 사용 금지') &&
  inSrc("if(S.boss.cast&&S.boss.cast.kind==='judge')tryInterrupt(j);"), '');

// 12. DOM anchor 표 + 핵심 selector 실존
chk('c12 DOM anchor 표 + selector 실존',
  inDoc('DOM anchor 후보 표', 'sb-w-shield', 'sb-w-body', 'sb-shadow') &&
  inSrc('sb-w-shield') && inSrc('sb-w-body') && inSrc('sb-ic-body'), '');

// 13. #fxSvg 조사 + 실존(viewBox 없음 주장 검증)
chk('c13 #fxSvg 조사 + 실코드 일치',
  inDoc('#fxSvg', 'viewBox 없음') &&
  inSrc('<svg id="fxSvg"') && !/id="fxSvg"[^>]*viewBox/.test(src), '');

// 14. renderFx 조사 + 실존
chk('c14 renderFx 조사 + 실코드 일치',
  inDoc('renderFx') && inSrc('function renderFx(S,t,p,mt)') && inSrc('fxBossLine'), '');

// 15. 레이어 대응표 (계약 7층)
chk('c15 계약 레이어 7층 대응표',
  inDoc('계약 레이어 7층', 'Protection Layer', 'Relation/Action', 'Result/Readability') &&
  inDoc('후속 신설 필요'), '');

// 16. visual-only class 수명 조사
chk('c16 visual-only class 수명 조사',
  inDoc('visual-only class 적용·해제 가능 지점', 'animationend', '통째 교체'), '');

// 17. [A]/[B]/[C] 분류표
chk('c17 3분류표([A]/[B]/[C])',
  inDoc('[A] 바로 사용 가능') && inDoc('[B] 조건부 사용 가능') && inDoc('[C] 사용 금지'), '');

// 18. 다음 구현 허용 입력 계약 + ★세 방어 신호 분리(bc.blk / unit.shield / body 직격)
chk('c18 Rework 02 허용 입력 계약 + 세 방어 신호 분리',
  inDoc('허용 입력 계약', '도적 차단은 목표에서 제외') &&
  inDoc('병존 가능') &&                                  // blk·shield 상호 배타 아님
  inDoc('blk 감소가 먼저, shield 흡수가 나중') &&          // 실제 계산 순서 기록
  inDoc('resolve 후 현재 shield 값만 보고 판정 금지') &&   // null 오판 방지
  inDoc('모두 확인되지 않은 경우에만') &&                  // body 직격 조건
  // 실코드 교차: blk 감소(resolve) → shield 흡수(dmg) 순서가 실제로 그러한지
  inSrc('if(c.blk){d=Math.round(d*B.smashBlocked)') &&
  inSrc('u.shield.amt-=use;a-=use;S.st.abs+=use;'), '');

// 19. HOLD 미승계 선언
chk('c19 HOLD 미승계 선언', inDoc('미열람·미복구·미승계'), '');

// 20. 수치 추측 금지 (문서에 강타/보호막 구체 수치 하드코딩 없음 — 320/250/380 등 비출현)
{
  const body = doc.replace(/`[^`]*`/g, ''); // 코드 인용 밖 본문 기준
  const numAssert = /(강타|보호막|흡수)[^\n]{0,10}(320|250|300|380)/.test(body) || body.includes('smash320');
  chk('c20 수치 단정 없음(강타·보호막·흡수 수치 하드코딩 0)', !numAssert && inDoc('수치 비단정'), '');
}

// 21. ★감사 핵심 발견 기록 — fxAnchors bossAvatar 퇴화 (실코드 교차: display:none + c('bossAvatar'))
chk('c21 핵심 발견(fxAnchors 유령 좌표) + 실코드 근거',
  inDoc('유령 좌표', 'Rework 02의 1순위 수정 지점') &&
  inSrc("boss:c('bossAvatar')") && inSrc('#stage.sb-boss-iron #bossAvatar{display:none}'), '');

// 22. 프리뷰↔runtime 포즈 대응표
chk('c22 프리뷰↔runtime 1:1 대응표', inDoc('1:1 대응표', '프리뷰 전용'), '');

// 23. index.html md5 기준선 유지 (무변경)
{
  const buf = fs.readFileSync(path.join(ROOT, 'index.html'));
  chk('c23 index.html 무변경(155,854 B · md5 2f7a1b29…)',
    buf.length === 155854 &&
    crypto.createHash('md5').update(buf).digest('hex') === '2f7a1b29dba5b79950ebdbbeb6e06fb6', '');
}

// 24. CORE 기준선 유지
{
  const lines = src.split('\n');
  let f = 0, core = [];
  for (const l of lines) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) core.push(l); }
  const bytes = Buffer.byteLength(core.join('\n') + '\n', 'utf8');
  const cmd5 = crypto.createHash('md5').update(core.join('\n') + '\n').digest('hex');
  chk('c24 CORE 466줄/22,521 B byte-identical', core.length === 466 && bytes === 22521 &&
    cmd5 === '6cad2ec271a2a79afbee881c2a2e0856', core.length + '줄/' + bytes + 'B/' + cmd5.slice(0, 8));
}

// 25. HOLD 산출물 미유입
chk('c25 HOLD 파일 repo 미유입',
  ['docs/40_IRON_CRUSHER_ACTION_LINE_PROTO.md', 'dev/iron_crusher_action_line_proto_check.js', 'dev/p20.mjs', 'dev/core_new.js']
    .every(f => !fs.existsSync(path.join(ROOT, f))), '');

// 26. 문서-only (신규 프리뷰 html·p파일 0)
chk('c26 문서-only(신규 html·p파일 0)',
  !fs.existsSync(path.join(ROOT, 'dev', 'iron_crusher_stage_input_audit_01.html')) &&
  !fs.existsSync(path.join(ROOT, 'dev', 'p24.mjs')), '');

// 27. 포인터 문서 반영(≥2)
{
  const refs = ['docs/98_NEXT_IMPLEMENTATION_CARDS.md', 'docs/99_HANDOFF_NEXT_REN.md', 'docs/102_FINAL_HANDOFF_INDEX.md']
    .filter(f => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8').indexOf('Iron Crusher Stage Input Audit 01') >= 0; } catch (e) { return false; } });
  chk('c27 포인터 문서에 54 반영(≥2)', refs.length >= 2, refs.join(','));
}

console.log(`\n${fail === 0 ? '★ IRON CRUSHER STAGE INPUT AUDIT 01 CHECK PASS' : '★ IRON CRUSHER STAGE INPUT AUDIT 01 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
