'use strict';
// Stage Production System Constitution 01 전용 검증
// 실행: node dev/stage_production_system_constitution_01_check.js
// 문서 존재만 보는 얕은 검사가 아니라: ①헌법 3문서의 필수 계약 절 ②문서가 인용한 실제 runtime
// 식별자(함수/selector/상태)가 index.html에 실존하는지 교차검증 ③document-only(인덱스/CORE 무변경)
// ④감사 주장 사실(FX 어휘 충돌·미처리 이벤트 무시·이벤트 큐 단일 소비 등)의 실코드 대조.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const d59p = path.join(ROOT, 'docs', '59_STAGE_PRODUCTION_SYSTEM_CONSTITUTION_01.md');
const d60p = path.join(ROOT, 'docs', '60_STAGE_EXTENSION_CYCLE_CONTRACT_01.md');
const d61p = path.join(ROOT, 'docs', '61_STAGE_FOUNDATION_MIGRATION_ROADMAP_01.md');
const d59 = fs.existsSync(d59p) ? fs.readFileSync(d59p, 'utf8') : '';
const d60 = fs.existsSync(d60p) ? fs.readFileSync(d60p, 'utf8') : '';
const d61 = fs.existsSync(d61p) ? fs.readFileSync(d61p, 'utf8') : '';

let pass = 0, fail = 0;
function chk(name, cond, detail) {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
}
const inSrc = s => src.indexOf(s) >= 0;
const in59 = (...ss) => ss.every(s => d59.indexOf(s) >= 0);
const in60 = (...ss) => ss.every(s => d60.indexOf(s) >= 0);
const in61 = (...ss) => ss.every(s => d61.indexOf(s) >= 0);

// 1. 세 문서 존재
chk('c1 세 문서 존재(59/60/61)', d59.length > 5000 && d60.length > 2000 && d61.length > 2000,
  d59.length + '/' + d60.length + '/' + d61.length);

// 2. document-only 선언 (3문서 전부)
chk('c2 document-only 선언', in59('document-only', '구현 0') && in60('document-only', '구현 0') && in61('document-only', '구현 0'), '');

// 3. index/CORE 무변경 (byte-identical 핀)
{
  const buf = fs.readFileSync(path.join(ROOT, 'index.html'));
  const lines = src.split('\n');
  let f = 0, core = [];
  for (const l of lines) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) core.push(l); }
  const cmd5 = crypto.createHash('md5').update(core.join('\n') + '\n').digest('hex');
  chk('c3 index/CORE byte-identical(174,534/2326daeb·CORE 6cad2ec2)',
    buf.length === 174534 &&
    crypto.createHash('md5').update(buf).digest('hex') === '2326daebc987645f32888fa6d74455a4' &&
    core.length === 466 && cmd5 === '6cad2ec271a2a79afbee881c2a2e0856', '');
}

// 4. 검증된 전제 세 가지
chk('c4 검증된 전제 3(전투 재미·재도전·무대 문법 시각 검증)',
  in59('검증된 전제 세 가지', '전투 자체의 재미', '재도전의 재미', '무대 문법의 시각 검증'), '');

// 5. 계층 책임 (10계층 + 책임/입력/출력/소유 금지)
chk('c5 계층 10종+소유권 형식',
  in59('Combat Truth Layer', 'Stage Signal Adapter', 'Stage Director', 'Actor Registry',
       'Pose Vocabulary', 'Anchor Registry', 'Stage Cue', 'DOM Presenter',
       'Cleanup / Reset Boundary', 'Debug / Observation') &&
  in59('소유 금지', '콘텐츠 추가'), '');

// 6. gameplay/stage 경계 원칙 (A~J)
chk('c6 gameplay/stage 경계 총칙',
  in59('gameplay는 visual pose 이름을', '결과 변경', '가짜 gameplay state', 'id별 if 증식', 'MUST NOT'), '');

// 7. Stage Signal 등록부 (지속/순간 2채널 + 근거 필수)
chk('c7 Stage Signal 계약(2채널·근거 필수·번역 정의)',
  in59('지속 신호', '순간 신호', '근거 없는 신호 등록 MUST NOT', '기존 진실의 시각층 번역'), '');

// 8. Stage Phase (구현 lifecycle + 53 계승)
chk('c8 Stage Phase(IDLE→TELL→COMMIT→CONTACT→AFTERGLOW·[53 §12] 계승)',
  in59('TELL', 'COMMIT', 'CONTACT', 'AFTERGLOW', '최소 유효 lifecycle'), '');

// 9~10. Actor Profile + Pose Map
chk('c9 Actor Profile(스키마+실제 4직업 예시 데이터)',
  in59('ACTOR_PROFILES', 'signalToPose', 'availablePoses', 'defaultPose', 'fallbackPose') &&
  in59("'guard'", "'brace'"), '');
chk('c10 Pose 규칙 8종(우선순위·stale·reset·역영향 차단·최소 데이터)',
  in59('매 프레임 상태에서 재계산', 'signalToPose 배열 순서=우선순위', '포즈·class를 gameplay가 읽으면', '새 직업 최소 데이터'), '');

// 11. Anchor Registry (의미 조회·null fallback·pseudo 금지·가상 anchor)
chk('c11 Anchor Registry 8원칙',
  in59('의미 이름으로 조회', 'null 반환', '(0,0)', 'pseudo-element는 anchor가 될 수 없다', '가상 anchor'), '');

// 12. Stage Cue 계약 (필드 + owner + timing 파생)
chk('c12 Stage Cue(필드·owner 필수·타이머 신설 금지)',
  in59('cueId', 'sourceAnchor', 'targetAnchor', 'visualKind', 'cleanupPolicy', 'owner') &&
  in59('cue 자체 타이머 신설 MUST NOT'), '');

// 13. Boss Stage Profile (3분: template/데이터/handler + 3보스 대조 + handler 7계약)
chk('c13 Boss Stage Profile(공통/데이터/고유 handler 3분·3보스 대조·7계약)',
  in59('BOSS_STAGE_PROFILES', 'abilityStageMaps', '공통 template', '고유 handler', '7계약') &&
  in59('모르가스', '파쇄자', '심연'), '');

// 14. lifecycle 상세(사건별) — 짧은 행동/긴 cast/interrupt/shield/cleanse/drain/heavy/사망/종료
chk('c14 사건별 lifecycle(즉발·cast·차단·보호막 분기·drain 즉발·사망·종료)',
  in59('짧은 행동', '차단 준비선', '세 신호 분리', 'drain', 'battle end', 'actor death'), '');

// 15. priority (53 §16 5순위 채용)
chk('c15 priority(5순위·강도 후퇴)', in59('①', '⑤', '강도 후퇴'), '');

// 16. cancellation (3종결 판별)
chk('c16 cancellation(만료 resolve/차단/자발 취소 3종결·오인 금지)',
  in59('만료 resolve', '자발 취소', '서로 오인하면 MUST NOT'), '');

// 17. cleanup (트리거 4종·소유자·전환 격리·1.5s 기준)
chk('c17 cleanup(4트리거·소유자 없는 잔재 금지·검증 기준)',
  in59('정리 트리거 4종', '소유자 없는 잔재 금지', '보스 전환 격리') && in59('stale class'), '');

// 18. fallback 표 (미지 신호 no-op·anchor 숨김·pose 기본·shell 아바타·미등록 생략)
chk('c18 fallback 표(신호/anchor/pose/shell/profile/DOM 6행)',
  in59('조용한 no-op', '표현 숨김', 'defaultPose', '이모지 avatar 폴백', '무대 연출 생략'), '');

// 19~20. 허용/금지 hardcoding (실사례 연결)
chk('c19 허용 hardcoding(데이터·CSS·등록 handler — 실사례 연결)',
  in59('허용되는 하드코딩', '--sb-ic-*', 'sbSmashFx'), '');
chk('c20 금지 hardcoding(id 연쇄·역참조·visual-only state·타이머 산포·selector 중복·(0,0))',
  in59('금지되는 하드코딩', 'bossId 연쇄 분기', 'jobId 연쇄 분기', 'visual-only flag', 'setTimeout 산포', '중복 직서'), '');

// 21~23. 세 확장 사이클 (60)
chk('c21 New Boss Cycle(11단계·수정 경계·gate 질문·완료 정의)',
  in60('New Boss Cycle', '재미 질문', 'Boss Stage Profile', 'showcase', 'Human Gate', 'lock', '수정 경계', '완료 정의'), '');
chk('c22 New Job Cycle(등록만으로 추가·포즈 0 fallback·가독 기준)',
  in60('New Job Cycle', 'ACTOR_PROFILES에 1건 추가', '포즈 부족 fallback', 'party readability'), '');
chk('c23 New Skill Cycle(연출 없는 스킬 허용·공통/고유 cue 기준·새 timer 금지)',
  in60('New Skill Cycle', '연출 없는 스킬 허용 기준', '고유 cue가 필요한 기준', '새 timer 금지 원칙'), '');

// 24. Definition of Done (10항)
chk('c24 DoD 10항(분기 금지·registry 등록·fallback·stale 0·smoke 증명·재현 절차)',
  in59('Definition of Done') &&
  in59('bossId 분기를 추가하지 않는다', 'jobId 분기를 추가하지 않는다', 'visual-only state·timer를 추가하지 않는다',
       'smoke 3종 결과 불변', '재현 가능'), '');

// 25. LOCK/PROVISIONAL/EXTENSION 총괄
chk('c25 LOCK/PROVISIONAL/EXTENSION 3등급 총괄표',
  in59('LOCK / PROVISIONAL / EXTENSION 총괄표') && in59('**LOCK**', '**PROVISIONAL**', '**EXTENSION**'), '');

// 26. 과잉 설계 방지 (비목표 + 2실사례 규칙 + abstraction 근거 형식)
chk('c26 과잉 설계 방지(비목표·2실사례 승격 기준·유지 비용 기록)',
  in59('비목표', 'ECS', '공통화 승격 기준', '2개 이상의 실사례', '유지 비용'), '');

// 27. migration roadmap (F1~F9 + shadow-first + rollback)
chk('c27 이행 로드맵(F1~F9·shadow-first·등가 치환·rollback 경계·gate 위치)',
  in61('F1.', 'F2.', 'F3.', 'F4.', 'F5.', 'F6.', 'F7.', 'F8.', 'F9.') &&
  in61('shadow-first', '등가 치환', 'rollback 경계', 'Human Gate 위치'), '');

// 28. 문서 인용 runtime 식별자 ↔ index.html 실존 교차검증 (핵심 요구)
{
  const ids = ['S.boss.cast', 'S.ev', 'S.st.abs', 'createGame', 'fireScript', 'resolveBossCast',
    'tryInterrupt', 'cancelCast', 'nextPattern', 'drain()', 'seedOnHit', 'doFx',
    'sbSmashFx', 'sbFigPose', 'sbPt', 'SB_BODY', 'SB_SM', 'SB_DIRTY', 'sbHitClear',
    'fxAnchors', 'fxBeam', 'fxWave', 'fxBossLine', 'fxAoeDecal', 'figFlash',
    'bossAvatar', 'sb-boss-iron', 'sb-ic-hammer', 'sb-w-shield', 'data-pose',
    'CUR_BOSS', 'newGame', 'showScreen', 'animationend', '__seedHealer', 'BOSS_DEFS'];
  const missDoc = ids.filter(i => d59.indexOf(i) < 0);
  const missSrc = ids.filter(i => src.indexOf(i.replace('drain()', 'function drain()')) < 0);
  chk('c28 인용 식별자 ' + ids.length + '종 — 문서 인용+실코드 실존 동시 충족',
    missDoc.length === 0 && missSrc.length === 0,
    'docMiss=[' + missDoc.join(',') + '] srcMiss=[' + missSrc.join(',') + ']');
}

// 29. 실제 actor/boss 사례 사용
chk('c29 실제 actor/boss id 사례(war/rog/mage/sham·boss01/shell_iron/shell_thirst)',
  in59('war', 'rog', 'mage', 'sham', 'boss01', 'shell_iron', 'shell_thirst') &&
  inSrc("id:'war'") && inSrc('shell_iron') && inSrc('shell_thirst'), '');

// 30. Iron Crusher 0-rect 유령 좌표 회귀 사례 봉인
// 〔승계 — F3 closeout(docs/64)〕 헌법 문서의 유령 좌표 서술(fxAnchors A.boss=c('bossAvatar')→0-rect 퇴화)은
// 회귀 사례로 유지. 실코드에선 F3가 fxAnchors를 resolveAnchor facade로 이관→bossAvatar도 rect-zero→null로 봉인.
chk('c30 유령 좌표 회귀 사례(0-rect→null→숨김·(0,0) 퇴화 금지·실코드 대조·F3 봉인)',
  in59('유령', '회귀', 'display:none') && in59('on=!!(src&&dst)') &&
  inSrc('var on=!!(src&&dst);') && inSrc("resolveAnchor('boss','avatar')") &&
  src.indexOf("window.addEventListener('resize',function(){A=null;})") < 0, '');

// 31. 보스 전환 격리
chk('c31 보스 전환 격리(전환 프레임 잔재 0·실코드 정리 경로 실존)',
  in59('전환 프레임', 'SB_SM=null') &&
  inSrc('SB_SM=null;SB_DIRTY=false;sbHitClear();'), '');

// 32. stale visual 0 원칙
chk('c32 stale 0 원칙(정리 경로 3종·1.5s 검증 기준)',
  in59('animationend', '자기 소거') && /1\.5s/.test(d59), '');

// 33. 390×844 계약
chk('c33 390×844 계약(overflow 0·console 0 게이트·폴백 유지)',
  in59('390×844', 'overflow 0') && in60('390×844') && in59('≤730'), '');

// 34. CORE gameplay 무변경 (smoke 3종 = 기계 증명)
{
  let ok = false, det = '';
  try {
    const h = require('./harness.js');
    const s = h.sb.window.__seedHealer;
    const m = s.smoke(), i = s.smoke('shell_iron'), t = s.smoke('shell_thirst');
    ok = m.t === 51.4 && m.steps === 1029 && i.t === 48.5 && i.steps === 971 && t.t === 61.8 && t.steps === 1236;
    det = m.t + '/' + m.steps + ' · ' + i.t + '/' + i.steps + ' · ' + t.t + '/' + t.steps;
  } catch (e) { det = e.message; }
  chk('c34 CORE gameplay 무변경(스모크 3종 동일)', ok, det);
}

// 35. 다음 구현 카드 경계 (F1이 read-only shadow·금지 명시)
chk('c35 첫 구현 카드 경계(F1 read-only·화면 diff 0·기존 render 무수정·S.ev 제2 소비자 금지)',
  in61('read-only', '화면 diff 0') && in61('S.ev 제2 소비자'), '');

// 36. 감사 주장 사실 대조 ①: FX 어휘 충돌(drain과 judge가 같은 FX('aoe'))
chk("c36 감사 사실①: FX('aoe') 중의성 — 실코드 2개소 이상 발신",
  in59('충돌') && (src.match(/FX\('aoe'\)/g) || []).length >= 2, '');

// 37. 감사 주장 사실 대조 ②: 미처리 이벤트 조용한 무시 — 주장의 범위는 doFx(시각 디스패처)다.
//     〔승계 — F1(docs/62)〕 F1의 Stage Signal 번역기(sgEv)가 같은 kind를 정당하게 번역(case 보유)하게 되어
//     전역 부재 검사 → doFx 함수 범위 검사로 정밀화(주장 의미 불변·완화 아님).
{
  const dIdx = src.indexOf('function doFx(');
  const dEnd = src.indexOf('\n}', dIdx);
  const dFx = (dIdx >= 0 && dEnd > dIdx) ? src.slice(dIdx, dEnd) : '';
  chk('c37 감사 사실②: 미처리 이벤트 no-op(발신은 있고 doFx에 case는 없음)',
    inSrc("FX('bossCast')") && inSrc("FX('judgeWarn'") && inSrc("FX('valorOff')") &&
    dFx.length > 200 &&
    dFx.indexOf("case 'bossCast'") < 0 && dFx.indexOf("case 'judgeWarn'") < 0 && dFx.indexOf("case 'valorOff'") < 0, '');
}

// 38. 감사 주장 사실 대조 ③: 이벤트 큐 단일 소비+gameplay 어댑터 공존(seedOnHit)
chk('c38 감사 사실③: S.ev 단일 splice 소비+drain 내 seedOnHit 구동',
  (src.match(/\.ev\.splice\(0\)/g) || []).length === 1 && inSrc('seedOnHit(e.tg)'), '');

// 39. 감사 주장 사실 대조 ④: commit 0.6·resolve 3근거·idempotent setter 실존
chk('c39 감사 사실④: commit 0.6·resolve 3근거·idempotent presenter 실존',
  inSrc('pr>=0.6') && inSrc('sm.S===S&&t>=sm.end-0.05&&sm.aliveL') &&
  inSrc('function sT(el,s){if(el.__t!==s)'), '');

// 40. 핵심 문장(포즈/데칼/행동선/임펄스)의 구현 경계 번역
chk('c40 핵심 문장 4역할 구현 경계(포즈=행위·데칼=위험 공간·행동선=관계·임펄스=결과)',
  in59('포즈는 행위', '데칼은 위험 공간', '행동선은 관계', '임펄스는 결과', '문법 위반'), '');

console.log(`\n${fail === 0 ? '★ STAGE PRODUCTION SYSTEM CONSTITUTION 01 CHECK PASS' : '★ STAGE PRODUCTION SYSTEM CONSTITUTION 01 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
