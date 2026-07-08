// p15 · Iron Crusher Runtime 01 — Boss Core 최소 개방(A안 · docs/30) + 강철의 파쇄자 실전투
// 코어 편집: BOSS_DEFS 색인·createGame(bossId) 인자화(무인자=boss01 폴백)·SCRIPT 참조 2곳 SC화·
//            이름 리터럴 7곳 보간(모르가스 로그 문자열 바이트 동일 유지)·반환 +script:SC
// 어댑터: CUR_BOSS/BOSS_OV·newGame(slot)·enterBattle 전선·길드/출정 이름·threat 재배선·smoke(bossId)·셸 해제
// ※ 세이브 pNN.py 관례의 Node 이식(one()/count==1/총 edits assert 동일).
import fs from 'fs';
const PATH = 'index.html';
let src = fs.readFileSync(PATH, 'utf8');
let edits = 0;
function one(oldStr, newStr, label) {
  const c = src.split(oldStr).length - 1;
  if (c !== 1) throw new Error(`${label}: count=${c} (expected 1)`);
  src = src.replace(oldStr, newStr);
  edits++;
}

/* ---------- CORE (587~982) — A안 최소 분기 ---------- */

// e1. 승리(처치) 메시지 → B.winKill (모르가스 문자열은 BOSS_DEFS 데이터로 보존)
one(`  if(kind==='victory_kill'){L('🏆 핏빛 예언자 모르가스 처치! 파티가 살아서 이겼습니다!','lgold');FX('win');}`,
    `  if(kind==='victory_kill'){L(B.winKill,'lgold');FX('win');}`, 'e1 winKill');

// e2. 승리(생존) 메시지 → B.winSv
one(`  else if(kind==='victory_survive'){L('🏆 75초 생존! 모르가스가 어둠 속으로 물러갑니다!','lgold');FX('win');}`,
    `  else if(kind==='victory_survive'){L(B.winSv,'lgold');FX('win');}`, 'e2 winSv');

// e3. 강타 예고 → B.sn 보간
one(`    L('🔨 모르가스가 강타를 준비합니다 → '+tg.name,'lb');FX('bossCast');break}`,
    `    L('🔨 '+B.sn+'가 강타를 준비합니다 → '+tg.name,'lb');FX('bossCast');break}`, 'e3 smash line');

// e4. 심판(차단 불가) → B.sn
one(`    if(un){L('⚡ 광폭화한 모르가스의 어둠의 심판 — 차단 불가!','lr');`,
    `    if(un){L('⚡ 광폭화한 '+B.sn+'의 어둠의 심판 — 차단 불가!','lr');`, 'e4 judge un');

// e5. 심판(차단 가능) → B.sn
one(`    else{L('⚡ 모르가스가 어둠의 심판을 시전합니다! (차단 가능)','lb');`,
    `    else{L('⚡ '+B.sn+'가 어둠의 심판을 시전합니다! (차단 가능)','lb');`, 'e5 judge');

// e6. 광폭화 → B.sn
one(`    L('🔥 모르가스가 광폭화합니다! 모든 피해가 증가합니다!','lr');`,
    `    L('🔥 '+B.sn+'가 광폭화합니다! 모든 피해가 증가합니다!','lr');`, 'e6 enrage');

// e7. 개전 → B.openLn
one(` function start(){S.started=true;L('전투 개시 — 파티가 핏빛 예언자에게 달려듭니다!','lb');FX('start');}`,
    ` function start(){S.started=true;L(B.openLn,'lb');FX('start');}`, 'e7 openLn');

// e8. SCRIPT 뒤에 보스 정의 색인 삽입 + createGame 인자화(무인자=boss01 폴백)
one(`];
function createGame(){
 const B=CFG.boss, K=CFG.skills;`,
`];
/* === Iron Crusher Runtime 01: 보스 정의 색인 — A안 최소 분기(docs/30). 무인자=boss01(모르가스) 폴백 === */
const IRON_BOSS={
 name:'강철의 파쇄자', sn:'파쇄자', hp:7800,
 melee:62, meleePer:2.0, enMelee:84, enMeleePer:1.6, offTankMul:1.6,
 smash:320, enSmash:380, smashBlocked:0.5, smashCast:1.6,
 winKill:'🏆 강철의 파쇄자 격파! 파티의 버티기가 강철을 이겼습니다!',
 winSv:'🏆 75초 생존! 강철의 파쇄자가 굉음을 내며 멈춰 섭니다!',
 openLn:'전투 개시 — 강철의 파쇄자가 육중한 발걸음으로 다가옵니다!'
};
/* 파쇄자 고정 스크립트 — 강타/버티기 문법. 기존 어휘만 사용(smash/valor/enrage) · brand/bomb/judge 없음 */
const IRON_SCRIPT=[
 {t:6, e:'smash'},
 {t:13,e:'smash',blk:1},
 {t:19,e:'smash'},
 {t:24,e:'valor'},
 {t:27,e:'smash'},
 {t:34,e:'smash',blk:1},
 {t:40,e:'smash'},
 {t:46,e:'smash'},
 {t:52,e:'valor'},
 {t:55,e:'enrage'},
 {t:58,e:'smash'},
 {t:64,e:'smash',blk:1},
 {t:70,e:'smash'}
];
const BOSS_DEFS={
 boss01:{boss:Object.assign({},CFG.boss,{sn:'모르가스',
  winKill:'🏆 핏빛 예언자 모르가스 처치! 파티가 살아서 이겼습니다!',
  winSv:'🏆 75초 생존! 모르가스가 어둠 속으로 물러갑니다!',
  openLn:'전투 개시 — 파티가 핏빛 예언자에게 달려듭니다!'}),script:SCRIPT},
 shell_iron:{boss:IRON_BOSS,script:IRON_SCRIPT}
};
function createGame(bossId){
 const D=BOSS_DEFS[bossId]||BOSS_DEFS.boss01;
 const B=D.boss, SC=D.script, K=CFG.skills;`, 'e8 BOSS_DEFS + createGame arg');

// e9. 스케줄러 SCRIPT → SC
one(` while(S.si<SCRIPT.length&&SCRIPT[S.si].t<=t){fireScript(SCRIPT[S.si]);S.si++;if(S.over)return}`,
    ` while(S.si<SC.length&&SC[S.si].t<=t){fireScript(SC[S.si]);S.si++;if(S.over)return}`, 'e9 scheduler SC');

// e10. nextPattern SCRIPT → SC
one(`  if(S.si<SCRIPT.length){const e=SCRIPT[S.si];return{nm:NM[e.e],eta:e.t-S.t}}`,
    `  if(S.si<SC.length){const e=SC[S.si];return{nm:NM[e.e],eta:e.t-S.t}}`, 'e10 nextPattern SC');

// e11. 반환 객체에 script:SC 추가 (docs/28 §2-④)
one(` return {S,step,useSkill,select,cancelCast,start,nextPattern,report,`,
    ` return {S,step,useSkill,select,cancelCast,start,nextPattern,report,script:SC,`, 'e11 return script');

/* ---------- ADAPTER ---------- */

// e12. CUR_BOSS·BOSS_OV(개전 오버레이 패턴 목록) + newGame(slot) — 재도전은 무인자 재호출로 같은 보스 유지
one(`function newGame(){
 ledgerReset();
 G=createGame();`,
`var CUR_BOSS='boss01';   /* 세션 현재 보스 — 재도전 시 유지 · 저장 안 함 */
var BOSS_OV={
 boss01:{h:'☠️ 핏빛 예언자 모르가스 — 패턴',list:'<li>⚡ <b>어둠의 심판</b> — 2.5초 시전, 전원 피해. 도적이 차단을 시도한다</li><li>🩸 <b>피의 낙인</b> — 8초 출혈 + 받는 피해 증가. <b>정화 가능</b></li><li>💥 <b>불안정한 마력</b> — 3초 뒤 폭발. <b>정화로 무효</b></li><li>🔨 <b>탱커 강타</b> — 전사에게 큰 피해. 시전 바를 보고 미리 대비</li><li>🔥 <b>광폭화</b> — 60초부터. 심판을 차단할 수 없다</li>'},
 shell_iron:{h:'☠️ 강철의 파쇄자 — 패턴',list:'<li>🔨 <b>탱커 강타</b> — 1.6초 시전, 전사에게 큰 피해. <b>보호막을 미리</b></li><li>🛡️ <b>방패 막기</b> — 전사가 일부 강타를 방패로 받아낸다 (피해 절반)</li><li>🌀 <b>전투 의지</b> — 주술사의 외침. 시전 가속·마나 회복의 창</li><li>🔥 <b>광폭화</b> — 55초부터. 강타와 발걸음이 더 무거워진다</li>'}
};
function newGame(slot){
 if(slot!==undefined)CUR_BOSS=BOSS_DEFS[slot]?slot:'boss01';
 ledgerReset();
 G=createGame(CUR_BOSS);
 var _bd=(BOSS_DEFS[CUR_BOSS]||BOSS_DEFS.boss01).boss,_ov=BOSS_OV[CUR_BOSS]||BOSS_OV.boss01;
 var _bn=$('bossName');if(_bn)_bn.textContent='☠️ '+_bd.name;
 var _oh=$('ovBossH');if(_oh)_oh.textContent=_ov.h;
 var _ol=$('ovBossList');if(_ol)_ol.innerHTML=_ov.list;`, 'e12 newGame slot');

// e13. enterBattle 전선 연결 — slot을 newGame으로
one(` ainit();
 newGame();
 showScreen('battle');`,
` ainit();
 newGame(slot);
 showScreen('battle');`, 'e13 enterBattle wire');

// e14. 길드 카드 이름 — 셸 여부 대신 카드 name 우선(boss01은 name 없음 → CFG 폴백)
one(`  const name=b.shell?b.name:CFG.boss.name;`,
    `  const name=b.name||CFG.boss.name;`, 'e14 guild name');

// e15. 출정 화면 보스 이름 — 카드 name 우선
one(`<div class="twBossName"><b>'+CFG.boss.name+'</b><span class="twBossTier">난이도 · '+b.tier+'</span>`,
    `<div class="twBossName"><b>'+(b.name||CFG.boss.name)+'</b><span class="twBossTier">난이도 · '+b.tier+'</span>`, 'e15 sortie name');

// e16. 위협 예보 재배선 — 인스턴스 스크립트 직독(무전투 폴백=전역)
one(`function nextThreatFor(id,S,t,mt){
 for(var i=S.si;i<SCRIPT.length;i++){
  var ev=SCRIPT[i];`,
`function nextThreatFor(id,S,t,mt){
 var sc=(G&&G.script)?G.script:SCRIPT; /* A안: 보스별 스크립트 직독 — docs/30 */
 for(var i=S.si;i<sc.length;i++){
  var ev=sc[i];`, 'e16 threat rewire');

// e17. 디버그 헬퍼 — smoke(bossId) 확장 + BOSS_DEFS 노출(검증용)
one(`window.__seedHealer={CFG:CFG,SCRIPT:SCRIPT,createGame:createGame,SAVE:SAVE,go:showScreen,
 smoke:function(){var g=createGame();`,
`window.__seedHealer={CFG:CFG,SCRIPT:SCRIPT,BOSS_DEFS:BOSS_DEFS,createGame:createGame,SAVE:SAVE,go:showScreen,
 smoke:function(bossId){var g=createGame(bossId);`, 'e17 smoke bossId');

// e18. BOSSES — 파쇄자 셸 해제 + tier/blurb/goal (질문·태그는 15와 1:1 문자 불변 유지)
one(` /* === Guild Board Monster Select 01: 준비 중 셸 — 전투/SCRIPT 미연결 (docs/15 §3) === */
 slot:'shell_iron', shell:1,
 name:'강철의 파쇄자',
 q:'네 마나는 나의 파괴보다 오래 버티는가?',
 tags:['🔨 탱커 폭사','⏳ 마나 압박']`,
` /* === Iron Crusher Runtime 01: 파쇄자 개방(A안 — docs/30·31). 심연은 아래 준비 중 셸 유지(docs/15 §3) === */
 slot:'shell_iron',
 tier:'숙련',
 name:'강철의 파쇄자',
 q:'네 마나는 나의 파괴보다 오래 버티는가?',
 tags:['🔨 탱커 폭사','⏳ 마나 압박'],
 blurb:'강타는 예고된다. 버틸 준비는 네 몫이다.',
 goal:'75초 생존 또는 처치'`, 'e18 BOSSES iron open');

// e19. 개전 오버레이 — 보스별 갱신용 id 부여(초기 정적 내용은 모르가스 그대로 · ovH+ovList 두 줄 결합 앵커=유일)
one(`  <div class="ovH">☠️ 핏빛 예언자 모르가스 — 패턴</div>
  <ul class="ovList">`,
    `  <div class="ovH" id="ovBossH">☠️ 핏빛 예언자 모르가스 — 패턴</div>
  <ul class="ovList" id="ovBossList">`, 'e19 ov ids');

// e20. 출정 경고 주석 현행화 — 파쇄자는 개방·심연만 셸
one(` /* 아래 두 셸 보스는 데이터 후보만 — 출정 렌더가 b.shell에서 즉시 반환하므로 런타임 표시 0 */`,
    ` /* shell_iron은 Runtime 01에서 실전투 개방(경고 런타임 표시) — shell_thirst만 셸 유지(출정 렌더 b.shell 반환·표시 0) */`, 'e20 warn comment');

if (edits !== 20) throw new Error(`total edits=${edits} (expected 20)`);
fs.writeFileSync(PATH, src);
console.log(`p15 OK · edits=${edits}`);
