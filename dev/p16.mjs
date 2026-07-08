// p16 · Thirst Abyss Runtime 01 — 갈증의 심연 실전투(A안 · docs/30·32)
// 코어: ABYSS_BOSS/ABYSS_SCRIPT + BOSS_DEFS.shell_thirst · fireScript에 새 어휘 'drain' 1개 · nextPattern NM에 drain
// 어댑터: BOSS_OV.shell_thirst · BOSSES 심연 셸 해제 · 경고 주석 현행화
// 새 어휘 'drain' 사유: 마나 압박("무엇을 안 쓸 것인가")을 정직하게 만들려면 사제 마나를 직접 흡수하는 이벤트가 필요.
//   효과=사제 마나 흡수(Math.max(0) 클램프 — 억울 방지) + 약한 파티 광역(힐 유혹→반응 시 마나 이중 손해=딜레마).
//   기존 마나 구조 무접촉(mana 필드 읽고 깎기만·payMana/regen 무변경). 모르가스/파쇄자 SCRIPT엔 drain 없음→기존 회귀 0.
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

/* ---------- CORE ---------- */

// e1. BOSS_DEFS 앞에 심연 정의 삽입 + createGame 진입은 그대로(bossId 룩업)
one(`const BOSS_DEFS={`,
`/* === Thirst Abyss Runtime 01: 갈증의 심연 — 마나 압박/절약 문법(docs/32). 새 어휘 drain 1개 === */
const ABYSS_BOSS={
 name:'갈증의 심연', sn:'심연', hp:8400,
 melee:50, meleePer:2.2, enMelee:66, enMeleePer:1.9, offTankMul:1.4,
 drain:62, enDrain:95, drainDmg:42, enDrainDmg:64,
 winKill:'🏆 갈증의 심연을 메웠습니다! 마르지 않는 손이 심연을 이겼습니다!',
 winSv:'🏆 75초 생존! 갈증의 심연이 잠잠해집니다!',
 openLn:'전투 개시 — 갈증의 심연이 마나를 탐하며 입을 벌립니다!'
};
/* 심연 고정 스크립트 — drain(마나 흡수+약광역) 위주 · 큰 피해 아님 · valor 2회=마나 숨통 · enrage 후반 압박 강화 */
const ABYSS_SCRIPT=[
 {t:5, e:'drain'},
 {t:11,e:'drain'},
 {t:16,e:'valor'},
 {t:19,e:'drain'},
 {t:25,e:'drain'},
 {t:31,e:'drain'},
 {t:37,e:'drain'},
 {t:42,e:'valor'},
 {t:45,e:'drain'},
 {t:51,e:'drain'},
 {t:56,e:'enrage'},
 {t:59,e:'drain'},
 {t:65,e:'drain'},
 {t:71,e:'drain'}
];
const BOSS_DEFS={`, 'e1 ABYSS defs');

// e2. BOSS_DEFS에 shell_thirst 등록
one(` shell_iron:{boss:IRON_BOSS,script:IRON_SCRIPT}
};`,
` shell_iron:{boss:IRON_BOSS,script:IRON_SCRIPT},
 shell_thirst:{boss:ABYSS_BOSS,script:ABYSS_SCRIPT}
};`, 'e2 BOSS_DEFS thirst');

// e3. fireScript에 새 어휘 drain 추가(enrage 케이스 뒤 · switch 닫기 앞)
one(`    L('🔥 '+B.sn+'가 광폭화합니다! 모든 피해가 증가합니다!','lr');
    FX('enrage');break;
  }
 }`,
`    L('🔥 '+B.sn+'가 광폭화합니다! 모든 피해가 증가합니다!','lr');
    FX('enrage');break;
   case 'drain':{
    const burn=S.boss.enraged?B.enDrain:B.drain;
    const d=S.boss.enraged?B.enDrainDmg:B.drainDmg;
    const before=S.pri.mana;
    S.pri.mana=Math.max(0,S.pri.mana-burn);
    if(S.pri.mana<S.st.manaMin)S.st.manaMin=S.pri.mana;
    if(!S.st.oomT&&S.pri.mana<40)S.st.oomT=S.t;
    aliveAll().slice().forEach(a=>dmg(a,d,'aoe'));
    if(!S.over)dmg(S.pri,d,'aoe');
    if(!S.over)S.st.aoes.push({t:S.t,tot:d*5,h0:S.st.heal,done:false});
    L('🌊 '+B.sn+'이 마나를 삼킵니다 — 마나 '+Math.round(before-S.pri.mana)+' 소실 · 파티 '+d+' 피해','lb');
    FX('aoe');break}
  }
 }`, 'e3 drain case');

// e4. nextPattern NM에 drain 표시명
one(`  const NM={smash:'🔨 탱커 강타',judge:'⚡ 어둠의 심판',brand:'🩸 피의 낙인',bomb:'💥 불안정한 마력',valor:'🌀 전투 의지',enrage:'🔥 광폭화'};`,
    `  const NM={smash:'🔨 탱커 강타',judge:'⚡ 어둠의 심판',brand:'🩸 피의 낙인',bomb:'💥 불안정한 마력',valor:'🌀 전투 의지',enrage:'🔥 광폭화',drain:'🌊 마나 갈증'};`, 'e4 NM drain');

/* ---------- ADAPTER ---------- */

// e5. BOSS_OV에 심연 개전 오버레이 패턴 목록
one(` shell_iron:{h:'☠️ 강철의 파쇄자 — 패턴',list:'<li>🔨 <b>탱커 강타</b> — 1.6초 시전, 전사에게 큰 피해. <b>보호막을 미리</b></li><li>🛡️ <b>방패 막기</b> — 전사가 일부 강타를 방패로 받아낸다 (피해 절반)</li><li>🌀 <b>전투 의지</b> — 주술사의 외침. 시전 가속·마나 회복의 창</li><li>🔥 <b>광폭화</b> — 55초부터. 강타와 발걸음이 더 무거워진다</li>'}
};`,
` shell_iron:{h:'☠️ 강철의 파쇄자 — 패턴',list:'<li>🔨 <b>탱커 강타</b> — 1.6초 시전, 전사에게 큰 피해. <b>보호막을 미리</b></li><li>🛡️ <b>방패 막기</b> — 전사가 일부 강타를 방패로 받아낸다 (피해 절반)</li><li>🌀 <b>전투 의지</b> — 주술사의 외침. 시전 가속·마나 회복의 창</li><li>🔥 <b>광폭화</b> — 55초부터. 강타와 발걸음이 더 무거워진다</li>'},
 shell_thirst:{h:'☠️ 갈증의 심연 — 패턴',list:'<li>🌊 <b>마나 갈증</b> — 사제의 마나를 삼키고 파티에 약한 피해. 큰 힐로 과잉 반응하면 마나 손해</li><li>🌀 <b>전투 의지</b> — 주술사의 외침. 마나 회복의 숨통</li><li>🔆 <b>성심 집중</b> — 다음 마나 기술을 아껴 쓰는 창(있으면). 언제 켤지가 관건</li><li>🔥 <b>광폭화</b> — 56초부터. 마나 갈증이 더 거세진다</li>'}
};`, 'e5 BOSS_OV thirst');

// e6. BOSSES — 심연 셸 해제(질문·태그는 15와 1:1 문자 불변)
one(` slot:'shell_thirst', shell:1,
 name:'갈증의 심연',
 q:'무엇을 안 쓸 것인가?',
 tags:['⏳ 마나 압박','🌊 광역 피해','🕯️ 지속 피해']`,
` /* === Thirst Abyss Runtime 01: 심연 개방(A안 — docs/30·32) === */
 slot:'shell_thirst',
 tier:'심연',
 name:'갈증의 심연',
 q:'무엇을 안 쓸 것인가?',
 tags:['⏳ 마나 압박','🌊 광역 피해','🕯️ 지속 피해'],
 blurb:'심연은 서두르지 않는다. 네 마나가 먼저 마른다.',
 goal:'75초 생존 또는 처치'`, 'e6 BOSSES thirst open');

// e7. 출정 경고 주석 현행화 — 세 보스 전부 개방(셸 0)
one(` /* shell_iron은 Runtime 01에서 실전투 개방(경고 런타임 표시) — shell_thirst만 셸 유지(출정 렌더 b.shell 반환·표시 0) */`,
    ` /* 세 보스 전부 실전투 개방(Runtime 01·02) — 경고 런타임 표시. 셸 잔여 0 */`, 'e7 warn comment');

if (edits !== 7) throw new Error(`total edits=${edits} (expected 7)`);
fs.writeFileSync(PATH, src);
console.log(`p16 OK · edits=${edits}`);
