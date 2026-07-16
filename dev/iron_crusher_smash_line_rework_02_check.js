'use strict';
// Iron Crusher Smash Line Rework 02 전용 검증
// 실행: node dev/iron_crusher_smash_line_rework_02_check.js
// 유령 좌표 제거·망치 source·실대상 target·세 방어 신호 분리·게이트·cleanup이
// 실제 index.html 코드에 존재하는지 교차검증(문자열 존재+구조 슬라이스 검사).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const DOC = path.join(ROOT, 'docs', '55_IRON_CRUSHER_SMASH_LINE_REWORK_02.md');
const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const doc = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '';

let pass = 0, fail = 0;
function chk(name, cond, detail) {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
}
const inSrc = s => src.indexOf(s) >= 0;
const inDoc = (...ss) => ss.every(s => doc.indexOf(s) >= 0);
// sbSmashFx 함수 본문 슬라이스(구조 검사용)
const fnStart = src.indexOf('function sbSmashFx(S,t){');
const fnEnd = src.indexOf('(function(){ /* 접촉 class 수명', fnStart);
const FN = (fnStart >= 0 && fnEnd > fnStart) ? src.slice(fnStart, fnEnd) : '';

// 0. 문서·함수 존재
chk('c0 docs/55 존재 + sbSmashFx 함수 존재', fs.existsSync(DOC) && FN.length > 100, '');

// 1. shell_iron 전용 게이트
chk('c1 shell_iron 전용 게이트',
  FN.indexOf("CUR_BOSS!=='undefined'&&CUR_BOSS==='shell_iron'") >= 0, '');

// 2. smash kind 단독 게이트 금지 — kind 검사가 iron 게이트 뒤에만
{
  const ironIdx = FN.indexOf("CUR_BOSS==='shell_iron'");
  const kindIdx = FN.indexOf("bc.kind==='smash'");
  chk('c2 kind 단독 게이트 금지(iron 판정이 kind 판정보다 선행)',
    ironIdx >= 0 && kindIdx > ironIdx && FN.indexOf('if(!iron){') > ironIdx && FN.indexOf('if(!iron){') < kindIdx, '');
}

// 3. 망치 실제 element selector 사용
/* 〔승계 — F3(docs/64)〕 sbPt 직호출이 의미 anchor 요청으로 치환 — 망치 element rect가 source라는 의미 불변
   (registry가 weapon→sb-ic-hammer+topBias 바인딩 소유·좌표 산식은 sbPt 위임으로 byte 보존) */
chk('c3 망치 source(.sb-ic-hammer element rect)',
  FN.indexOf("resolveAnchor('boss_iron','weapon')") >= 0 &&
  inSrc("weapon:{part:'sb-ic-hammer',topBias:1") && inSrc('getBoundingClientRect'), '');

// 4. shell_iron source에서 bossAvatar 미사용 (새 경로 함수 본문에 부재)
chk('c4 새 경로에 bossAvatar 미사용', FN.indexOf('bossAvatar') < 0, '');

// 5. (0,0)/모서리 fallback 금지 — src&&dst 둘 다 있어야 on, 고정 좌표 없음
chk('c5 모서리/고정좌표 fallback 금지(on=!!(src&&dst))',
  FN.indexOf('var on=!!(src&&dst);') >= 0 &&
  !/setAttribute\('x1',\s*0\)/.test(FN) && !/setAttribute\('x1',\s*-/.test(FN), '');

// 6. actual target id 사용
// 〔승계 — F3(docs/64)〕 SB_BODY 좌표 조회가 의미 anchor(bc.tg의 body)로 치환 — 실대상 id 사용 의미 불변
chk('c6 actual target id(bc.tg) 사용',
  FN.indexOf('S.al[i].id===bc.tg') >= 0 && FN.indexOf("resolveAnchor(bc.tg,'body')") >= 0, '');

// 7~8. 전사 방패/몸통 selector
// 〔승계 — F3(docs/64)〕 방패 selector 직서가 의미 'shield' 요청으로 치환 — registry가 sb-w-shield 바인딩 소유
chk('c7 전사 방패 selector(.sb-w-shield)',
  FN.indexOf("'shield'") >= 0 && inSrc("shield:{part:'sb-w-shield'"), '');
chk('c8 전사 body selector(.sb-w-body)', inSrc("war:['sb-war-fig','sb-w-body']"), '');

// 9. 관계선(casting 분기)과 contact(resolve 분기) 분리
chk('c9 관계선/contact 분기 분리',
  FN.indexOf('if(casting){') >= 0 && FN.indexOf('if(SB_SM){') > FN.indexOf('if(casting){'), '');

// 10. bc.blk 분기 존재 (스냅샷 blk + 분류 사용)
chk('c10 bc.blk 분기(스냅샷+분류)',
  FN.indexOf('blk:!!bc.blk') >= 0 && FN.indexOf('sm.blk?') >= 0, '');

// 11. S.st.abs delta 기반 absorb 확인
chk('c11 S.st.abs delta absorb',
  FN.indexOf('var abs=(S.st.abs-sm.absL)>0;') >= 0, '');

// 12. resolve 후 현재 shield만으로 흡수 판정하지 않음 — resolve 분기에 shield 참조 부재
{
  const resolveSlice = FN.slice(FN.indexOf('if(SB_SM){'));
  chk('c12 resolve 분기에 현재 shield 참조 없음(스냅샷·delta만)',
    resolveSlice.indexOf('.shield') < 0, '');
}

// 13. block+absorb 병존 처리 (sbhit-blkabs 단일 사건)
chk('c13 blk+abs 병존(sbhit-blkabs) 처리',
  FN.indexOf("(abs?'sbhit-blkabs':'sbhit-blk')") >= 0 && inSrc('sbHitShieldAbs'), '');

// 14. 둘 다 없을 때만 body contact
chk('c14 둘 다 없을 때만 body(sbhit-body)',
  FN.indexOf(":(abs?'sbhit-abs':'sbhit-body')") >= 0, '');

// 15. 실제 resolve 확인 없이 contact 금지 (S 동일+만료 도달+생존 교차)
chk('c15 실제 resolve 교차 확인(sm.S===S && t>=end && aliveL)',
  FN.indexOf('sm.S===S&&t>=sm.end-0.05&&sm.aliveL') >= 0, '');

// 16. 도적 smash interrupt 미구현 (새 코드 영역에 관련 토큰 0)
{
  const newBlock = src.slice(src.indexOf('/* Smash Line Rework 02: shell_iron 강타 관계선+접촉 분리'), src.indexOf('/* ===== F2: Actor Registry') /* 〔승계 — F2(docs/63)〕 구간 종료 앵커: Rework01 주석이 F2 블록으로 치환됨(검사 의미 불변) */);
  chk('c16 도적 smash 차단 미구현(신규 영역에 관련 토큰 0)',
    newBlock.indexOf('intOk') < 0 && newBlock.indexOf('intReady') < 0 &&
    newBlock.indexOf('tryInterrupt') < 0 && newBlock.indexOf('dash') < 0, '');
}

// 17. 새 gameplay state 없음 — 신규 영역에 S.xxx= 대입 0 (읽기만)
{
  const newBlock = src.slice(src.indexOf('/* Smash Line Rework 02: shell_iron 강타 관계선+접촉 분리'), src.indexOf('/* ===== F2: Actor Registry') /* 〔승계 — F2(docs/63)〕 구간 종료 앵커: Rework01 주석이 F2 블록으로 치환됨(검사 의미 불변) */);
  chk('c17 새 gameplay state 0(신규 영역에 S 대입 없음)',
    !/[^.\w]S\.\w+\s*=[^=]/.test(newBlock) && newBlock.indexOf('var SB_SM=null') >= 0, '');
}

// 18. 새 gameplay timer 없음 (신규 영역 setTimeout/setInterval 0 · animationend 사용)
{
  const newBlock = src.slice(src.indexOf('/* Smash Line Rework 02: shell_iron 강타 관계선+접촉 분리'), src.indexOf('/* ===== F2: Actor Registry') /* 〔승계 — F2(docs/63)〕 구간 종료 앵커: Rework01 주석이 F2 블록으로 치환됨(검사 의미 불변) */);
  chk('c18 새 타이머 0 + animationend cleanup',
    newBlock.indexOf('setTimeout(') < 0 && newBlock.indexOf('setInterval(') < 0 &&
    newBlock.indexOf("addEventListener('animationend'") >= 0, '');
}

// 19. CORE 무변경
{
  const lines = src.split('\n');
  let f = 0, core = [];
  for (const l of lines) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) core.push(l); }
  const bytes = Buffer.byteLength(core.join('\n') + '\n', 'utf8');
  const cmd5 = crypto.createHash('md5').update(core.join('\n') + '\n').digest('hex');
  chk('c19 CORE 466줄/22,521 B byte-identical', core.length === 466 && bytes === 22521 &&
    cmd5 === '6cad2ec271a2a79afbee881c2a2e0856', core.length + '/' + bytes + '/' + cmd5.slice(0, 8));
}

// 20. 다른 보스 게이트 보호 — 기존 fxLn 호출 원문 보존 + iron시 우회
chk('c20 비-iron 기존 경로 보존',
  inSrc("if(!sbSmashFx(S,t))fxLn('fxBossLine',A.boss,smashTg?A[smashTg]:null,!!smashTg,'fxBoss');") &&
  inSrc('.fxBoss{stroke:#ff4d5e'), '');

// 21. stale class cleanup (sbHitClear + SB_DIRTY + 비-iron 정리)
chk('c21 stale cleanup(sbHitClear/SB_DIRTY/비-iron 정리)',
  inSrc('function sbHitClear()') && inSrc('var SB_DIRTY=false;') &&
  FN.indexOf('if(SB_SM||SB_DIRTY){SB_SM=null;SB_DIRTY=false;sbHitClear();}') >= 0, '');

// 22. 신규 데칼 없음 (새 데칼 id/class 미도입 · 기존 fxAoeDecal 수 불변=CSS1+DOM1)
chk('c22 신규 바닥 데칼 0',
  !inSrc('smashDecal') && !inSrc('sb-decal') && (src.split('fxAoeDecal').length - 1) >= 2 &&
  !inSrc('pressureDecal'), '');

// 23. 미연결 포즈·색 이식 없음 (동료 포즈 CSS·pol- 색안 미유입)
chk('c23 미연결 포즈/색 폴리시 이식 0',
  !inSrc('data-pose="strike"') && !inSrc('data-pose="charge"') && !inSrc('data-pose="rescue"') &&
  !inSrc('pol-rC') && !inSrc('pol-mC'), '');

// 24. HOLD 코드·파일 미사용
chk('c24 HOLD 파일 repo 미유입',
  ['docs/40_IRON_CRUSHER_ACTION_LINE_PROTO.md', 'dev/iron_crusher_action_line_proto_check.js', 'dev/p20.mjs', 'dev/core_new.js']
    .every(f => !fs.existsSync(path.join(ROOT, f))), '');

// 25. 390px overflow 보호 — 신규 CSS에 고정 대형 폭 없음 + fxSvg는 stage 내 클리핑 구조 유지
chk('c25 overflow 보호(신규 CSS 고정폭 0·#fxSvg inset 유지)',
  inSrc('#fxSvg{position:absolute;inset:0;width:100%;height:100%') &&
  !/fxSmash[^}]*width:\d{3,}px/.test(src), '');

// 26. index.html 현행 기준선(재-baseline 후 자기 핀)
{
  const buf = fs.readFileSync(path.join(ROOT, 'index.html'));
  chk('c26 index.html 기준선(205,777 B·md5 dd4e0405…)',
    buf.length === 205777 &&
    crypto.createHash('md5').update(buf).digest('hex') === 'dd4e04052d3cf4f271f35a45a6a8dc9d', '');
}

// 27. 스모크 3종 불변 (gameplay 무변경 실행 증명)
try {
  const h = require('./harness.js');
  const s = h.sb.window.__seedHealer;
  const m = s.smoke(), i = s.smoke('shell_iron'), t = s.smoke('shell_thirst');
  chk('c27 스모크 3종 불변(51.4/1029·48.5/971·61.8/1236)',
    m.t === 51.4 && m.steps === 1029 && i.t === 48.5 && i.steps === 971 && t.t === 61.8 && t.steps === 1236,
    m.t + '/' + m.steps + ' · ' + i.t + '/' + i.steps + ' · ' + t.t + '/' + t.steps);
} catch (e) { chk('c27 스모크 3종 불변', false, e.message); }

// 28. docs/55 필수 절
chk('c28 docs/55 필수 절',
  inDoc('유령 좌표 원인', '보스 게이트', 'source anchor', 'resolve 확인 방식',
        'snapshot 구조', 'cleanup', '다른 보스 보호', 'gameplay 무변경 선언',
        'HOLD 코드 미사용 선언', '알려진 한계', '비범위 선언'), '');

console.log(`\n${fail === 0 ? '★ IRON CRUSHER SMASH LINE REWORK 02 CHECK PASS' : '★ IRON CRUSHER SMASH LINE REWORK 02 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
