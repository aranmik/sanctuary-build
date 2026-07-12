// p23.mjs — Party Figure Layout Rework 01 (안 B: 과감한 포위 확대)
// 4인 파티 크기 상향 + 좌우 날개 확장 + 원호 포위. shell_iron 스코프 한정.
// CORE 무접촉(어댑터/CSS만) · 신규 조형/포즈/행동선/FX/상태 없음.
import fs from 'fs';
const P='index.html';
let s=fs.readFileSync(P,'utf8');
const before=s.length;
let n=0;
function one(a,b,label){
  const c=s.split(a).length-1;
  if(c!==1){throw new Error(`[${label}] expected 1 match, got ${c}`);}
  s=s.replace(a,b); n++;
}

// 1) 파쇄자 소폭 확대 1.0 → 1.04
one(
  '#sb-boss-fig{left:50%;top:2px;transform:translateX(-50%) scale(1.0);transform-origin:50% 0;display:none;z-index:2}',
  '#sb-boss-fig{left:50%;top:2px;transform:translateX(-50%) scale(1.04);transform-origin:50% 0;display:none;z-index:2}',
  'boss scale');

// 2) 전사 .74 → .80
one(
  '#sb-war-fig{left:50%;bottom:-3px;transform:translateX(-50%) scale(.74);transform-origin:50% 100%;display:none;z-index:4}',
  '#sb-war-fig{left:50%;bottom:-3px;transform:translateX(-50%) scale(.80);transform-origin:50% 100%;display:none;z-index:4}',
  'war scale');

// 3) 도적 .66 → .74
one(
  '#sb-rog-fig{left:50%;bottom:-3px;transform:translateX(-50%) scale(.66);transform-origin:50% 100%;display:none;z-index:3}',
  '#sb-rog-fig{left:50%;bottom:-3px;transform:translateX(-50%) scale(.74);transform-origin:50% 100%;display:none;z-index:3}',
  'rog scale');

// 4) 마법사 .68 → .76
one(
  '#sb-mage-fig{left:50%;bottom:-3px;transform:translateX(-50%) scale(.68);transform-origin:50% 100%;display:none;z-index:3}',
  '#sb-mage-fig{left:50%;bottom:-3px;transform:translateX(-50%) scale(.76);transform-origin:50% 100%;display:none;z-index:3}',
  'mage scale');

// 5) 주술사 .66 → .74
one(
  '#sb-sham-fig{left:50%;bottom:-3px;transform:translateX(-50%) scale(.66);transform-origin:50% 100%;display:none;z-index:3}',
  '#sb-sham-fig{left:50%;bottom:-3px;transform:translateX(-50%) scale(.74);transform-origin:50% 100%;display:none;z-index:3}',
  'sham scale');

// 6) 원호 주석 갱신 + gap 12 → 26
one(
  '/* Rework 03: 원호/포위형 배치 (shell_iron 스코프) — 전사·술사 앞날개, 도적·법사 중앙 뒤 */\n#stage.sb-boss-iron #stageAllies{bottom:26px;gap:12px}',
  '/* Rework 03: 원호/포위형 배치 (shell_iron 스코프) — 전사·술사 앞날개, 도적·법사 중앙 뒤 */\n/* Layout Rework 01(안 B): 4인 확대 + 좌우 날개 확장으로 파쇄자 포위(더 크게·더 벌려·대등 대치) */\n#stage.sb-boss-iron #stageAllies{bottom:26px;gap:26px}',
  'stageAllies gap');

// 7) 전사 좌전방 날개 확장 translate(4,-15) → translate(-24,-12)
one(
  '#stage.sb-boss-iron #sa-war{transform:translate(4px,-15px);z-index:4}',
  '#stage.sb-boss-iron #sa-war{transform:translate(-24px,-12px);z-index:4}',
  'sa-war translate');

// 8) 도적 좌중 분리 translate(7,4) → translate(-8,8)
one(
  '#stage.sb-boss-iron #sa-rog{transform:translate(7px,4px)}',
  '#stage.sb-boss-iron #sa-rog{transform:translate(-8px,8px)}',
  'sa-rog translate');

// 9) 마법사 우중 분리 translate(-2,4) → translate(8,8)
one(
  '#stage.sb-boss-iron #sa-mage{transform:translate(-2px,4px)}',
  '#stage.sb-boss-iron #sa-mage{transform:translate(8px,8px)}',
  'sa-mage translate');

// 10) 주술사 우외곽 날개 확장 translate(-2,-9) → translate(24,-6)
one(
  '#stage.sb-boss-iron #sa-sham{transform:translate(-2px,-9px)}',
  '#stage.sb-boss-iron #sa-sham{transform:translate(24px,-6px)}',
  'sa-sham translate');

if(n!==10){throw new Error('expected 10 edits, got '+n);}
fs.writeFileSync(P,s);
console.log(`p23 applied: ${n} edits · ${before} → ${s.length} bytes`);
