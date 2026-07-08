// p14 · Matrix -> Sortie Warning 01 (docs/29 계약)
// 출정 경고 v0 확장: 정화 단일축 1줄 -> 보스x로드아웃x동료 3축 최대 2줄.
// CORE(587~982) 무접촉 · CFG.allies/LOADOUT 읽기만 · 셸은 데이터 후보(런타임 미표시).
// ※ 이 노트북엔 Python 미설치(Store 스텁)라 세이브 pNN.py 관례를 Node로 이식.
//   one()/count==1 assert/총 edits assert 디스텁린은 동일 유지.
import fs from 'fs';
const PATH = 'index.html';
let src = fs.readFileSync(PATH, 'utf8');
let edits = 0;
function one(re, rep, label) {
  const m = src.match(re);
  const c = m ? (re.global ? m.length : 1) : 0;
  if (c !== 1) throw new Error(`${label}: match count=${c} (expected 1)`);
  src = src.replace(re, rep);
  edits++;
}

// --- edit 1: 경고 모듈을 renderSortie 정의 앞에 삽입 ---
const MODULE =
`/* ===== 29: Matrix -> Sortie Warning 01 — 출정 경고 v0 (docs/29 계약) =====
   경고는 안내일 뿐 · 출정 차단 없음 · 코어 무접촉(CFG/LOADOUT 읽기) · 셸은 데이터 후보(런타임 미표시) */
var SORTIE_WARN_LV={info:1,caution:2,danger:3};
var SORTIE_WARN_LABEL={info:'💫 안내',caution:'⚠️ 주의',danger:'🔴 위험'};
var SORTIE_WARN_ROWS={
 boss01:[
  {lv:'danger', when:function(L,A){return L.indexOf('dispel')<0;},               msg:'정화가 없어 낙인 대응이 어렵습니다.'},
  {lv:'caution',when:function(L,A){return A.indexOf('rog')<0;},                  msg:'도적이 없어 차단 기회가 약합니다.'},
  {lv:'info',   when:function(L,A){return L.indexOf('dispel')>=0&&A.indexOf('rog')>=0;}, msg:'낙인을 정화하면 차단 기회가 열립니다.'},
  {lv:'info',   when:function(L,A){return L.indexOf('focus')>=0;},               msg:'성심 집중으로 정화·보호막·소생·기도씨앗을 아껴 쓸 수 있습니다.'}
 ],
 /* 아래 두 셸 보스는 데이터 후보만 — 출정 렌더가 b.shell에서 즉시 반환하므로 런타임 표시 0 */
 shell_iron:[
  {lv:'danger', when:function(L,A){return L.indexOf('shield')<0;},               msg:'보호막이 없어 큰 피해 대응이 약합니다.'},
  {lv:'caution',when:function(L,A){return A.indexOf('war')<0;},                  msg:'전사가 없어 전열 기준점이 약합니다.'},
  {lv:'info',   when:function(L,A){return A.indexOf('sham')>=0;},                msg:'주술사의 지원으로 버티는 창이 넓어집니다.'}
 ],
 shell_thirst:[
  {lv:'caution',when:function(L,A){return L.indexOf('focus')<0;},               msg:'성심 집중이 없어 장기전 마나 절약 수단이 약합니다.'},
  {lv:'caution',when:function(L,A){return L.indexOf('renew')<0&&L.indexOf('seed')<0;}, msg:'소생·기도씨앗이 없어 지속 회복이 약합니다.'},
  {lv:'info',   when:function(L,A){return A.indexOf('sham')>=0;},                msg:'주술사의 지원으로 파티 안정 시간이 늘어납니다.'},
  {lv:'info',   when:function(L,A){return L.indexOf('focus')>=0&&(L.indexOf('renew')>=0||L.indexOf('seed')>=0);}, msg:'장기전 절약 운영이 가능합니다.'}
 ]
};
function sortieWarnings(slot,L,A){
 var rows=SORTIE_WARN_ROWS[slot]||[],out=[],i;
 for(i=0;i<rows.length;i++){if(rows[i].when(L,A))out.push(rows[i]);}
 out.sort(function(x,y){return SORTIE_WARN_LV[y.lv]-SORTIE_WARN_LV[x.lv];});
 return out.slice(0,2);   /* v0 최대 2줄 */
}
function sortieWarnHtml(slot,L,A){
 var w=sortieWarnings(slot,L,A);
 if(!w.length)return '💫 안내 — 준비가 균형 잡혀 있습니다.';
 return w.map(function(r){return SORTIE_WARN_LABEL[r.lv]+' — '+r.msg;}).join('<br>');
}
function renderSortie(){`;
one(/function renderSortie\(\)\{/, () => MODULE, "renderSortie anchor");

// --- edit 2: 기존 정화 단일축 warn 계산을 새 3축 계산으로 교체 (.twGoal 슬롯은 그대로 재사용) ---
one(
  / var hasD=LOADOUT\.indexOf\('dispel'\)>=0;\n var warn=hasD\?[\s\S]*?;\n/,
  " var allyIds=CFG.allies.map(function(a){return a.id;});\n var warn=sortieWarnHtml(SELECTED_BOSS,LOADOUT,allyIds);\n",
  "warn block"
);

if (edits !== 2) throw new Error(`total edits=${edits} (expected 2)`);
fs.writeFileSync(PATH, src);
console.log(`p14 OK · edits=${edits}`);
