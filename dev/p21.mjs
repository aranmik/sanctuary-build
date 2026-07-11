// p21 · Iron Crusher Figure Rework 01 — 전사+파쇄자 sb 미니피규어를 파쇄자 전투 화면에 이식 (docs/44)
// 어댑터/CSS/HTML 전용 — CORE 무접촉 · 전투 수치/판정/타이밍 무변경 · 시각 전용.
// 격리: #stage.sb-boss-iron 스위칭 · shell_iron 전투에서만 · 모르가스/심연 기존 이모지+fig 유지.
// 포즈 연결(기존 상태→class): 파쇄자 windup(강타 시전 중) · 전사 guard(보호막 보유)/brace(강타 대상·보호막 없음).
// 작은 화면(max-height 730)은 기존 이모지 fallback(sb 미표시) — 축소 안전.
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

/* ---------- e1. CSS 블록 (── style 끝 media query 앞) ── #stage 스코프로 기존 전투 CSS와 격리 ---------- */
one(`@media (max-height:730px){
 #stage{height:62px}`,
`/* ===== Iron Crusher Figure Rework 01 (docs/44) — 전장 sb 미니피규어 (시각 전용·CORE 무접촉) ===== */
#stage{--sb-w-main:#6c8fd0;--sb-w-deep:#31497a;--sb-w-edge:#1f2a45;--sb-w-metal:#cdd8ec;--sb-w-gold:#e5b45f;--sb-w-face:#ffd9b8;--sb-ic-main:#5c6374;--sb-ic-deep:#2b303c;--sb-ic-edge:#14161e;--sb-ic-metal:#a7b0c2;--sb-ic-ember:#ffb45e}
#stage .sb-unit{position:absolute;transform-origin:50% 100%}
#stage .sb-react{transform-origin:50% 92%;transition:transform .28s ease}
#stage .sb-fit{transform-origin:50% 100%}
#stage .sb-fig{position:relative;transform-origin:50% 100%}
#stage .sb-flip .sb-fit{transform:scaleX(-1)}
#stage .sb-part{position:absolute;display:block;transition:transform .28s ease}
@keyframes sbBreathe{0%,100%{transform:translateY(0) scaleY(1)}50%{transform:translateY(-1.4px) scaleY(1.01)}}
@keyframes sbBreatheHeavy{0%,100%{transform:translateY(0) scaleY(1)}50%{transform:translateY(-.9px) scaleY(1.005)}}
@keyframes sbCoreP{0%,100%{box-shadow:0 0 0 3px #1c2029,0 0 0 4.5px #3d4350,0 0 12px 1px rgba(255,140,58,.45)}50%{box-shadow:0 0 0 3px #1c2029,0 0 0 4.5px #3d4350,0 0 18px 4px rgba(255,140,58,.7)}}
#stage .sb-warrior .sb-fig{width:104px;height:126px;animation:sbBreathe 3.6s ease-in-out infinite}
#stage .sb-iron-crusher .sb-fig{width:190px;height:212px;animation:sbBreatheHeavy 4.8s ease-in-out infinite}
/* 전사 파츠 */
#stage .sb-warrior .sb-shadow{left:50%;bottom:0;width:62px;height:13px;transform:translateX(-50%);border-radius:50%;background:radial-gradient(50% 50% at 50% 50%,rgba(0,0,0,.5),transparent 72%)}
#stage .sb-warrior .sb-aura{left:50%;bottom:1px;width:74px;height:22px;transform:translateX(-50%);border-radius:50%;background:radial-gradient(50% 50% at 50% 50%,rgba(125,164,255,.3),transparent 70%)}
#stage .sb-warrior .sb-w-sword{left:24px;bottom:44px;width:6px;height:34px;border-radius:3px 3px 2px 2px;background:linear-gradient(90deg,#f0f5ff,var(--sb-w-metal) 55%,#8fa2c4);box-shadow:0 0 0 1.5px var(--sb-w-edge);transform:rotate(-26deg);transform-origin:50% 100%}
#stage .sb-warrior .sb-w-sword::before{content:"";position:absolute;left:-5px;bottom:-3px;width:16px;height:5px;border-radius:3px;background:linear-gradient(180deg,var(--sb-w-gold),#b8863c);box-shadow:0 0 0 1.5px var(--sb-w-edge)}
#stage .sb-warrior .sb-w-sword::after{content:"";position:absolute;left:1px;bottom:-12px;width:4px;height:10px;border-radius:2px;background:#7a5a34;box-shadow:0 0 0 1.5px var(--sb-w-edge)}
#stage .sb-warrior .sb-w-body{left:50%;bottom:13px;width:42px;height:37px;transform:translateX(-50%);border-radius:12px 12px 9px 9px;background:linear-gradient(160deg,#8aa8dd,var(--sb-w-main) 42%,var(--sb-w-deep));box-shadow:0 0 0 2px var(--sb-w-edge),inset 0 3px 0 rgba(255,255,255,.28),inset 0 -7px 0 rgba(10,16,40,.3)}
#stage .sb-warrior .sb-w-body::before{content:"";position:absolute;left:5px;bottom:-11px;width:13px;height:11px;border-radius:5px 5px 4px 4px;background:linear-gradient(180deg,#3d5382,#28395c);box-shadow:0 0 0 2px var(--sb-w-edge),19px 0 0 -0px #33486f,19px 0 0 2px var(--sb-w-edge)}
#stage .sb-warrior .sb-w-body::after{content:"";position:absolute;left:3px;right:3px;bottom:7px;height:6px;border-radius:3px;background-image:radial-gradient(circle at 50% 50%,var(--sb-w-gold) 2.4px,transparent 3px),linear-gradient(180deg,#4a3a26,#2e2417);box-shadow:inset 0 0 0 1px rgba(0,0,0,.4)}
#stage .sb-warrior .sb-w-pauldron{left:22px;bottom:42px;width:17px;height:12px;border-radius:8px 8px 5px 5px;background:linear-gradient(160deg,var(--sb-w-metal),#7e93b8 70%);box-shadow:0 0 0 2px var(--sb-w-edge),inset 0 2px 0 rgba(255,255,255,.4)}
#stage .sb-warrior .sb-w-head{left:50%;bottom:44px;width:38px;height:33px;transform:translateX(-50%);border-radius:48% 48% 44% 44%;transform-origin:50% 90%;background:linear-gradient(165deg,#9db8e6,var(--sb-w-main) 45%,var(--sb-w-deep));box-shadow:0 0 0 2px var(--sb-w-edge),inset 0 3px 1px rgba(255,255,255,.32)}
#stage .sb-warrior .sb-w-head::before{content:"";position:absolute;left:50%;top:-6px;width:10px;height:9px;transform:translateX(-50%);border-radius:5px 5px 2px 2px;background:linear-gradient(180deg,var(--sb-w-gold),#b8863c);box-shadow:0 0 0 2px var(--sb-w-edge)}
#stage .sb-warrior .sb-w-head::after{content:"";position:absolute;left:50%;bottom:3px;width:24px;height:14px;transform:translateX(-50%);border-radius:9px;background:radial-gradient(circle at 32% 42%,#33384a 2.1px,transparent 2.8px),radial-gradient(circle at 68% 42%,#33384a 2.1px,transparent 2.8px),radial-gradient(circle at 17% 74%,rgba(255,138,128,.55) 2.4px,transparent 3.4px),radial-gradient(circle at 83% 74%,rgba(255,138,128,.55) 2.4px,transparent 3.4px),linear-gradient(180deg,#ffe4c8,var(--sb-w-face));box-shadow:inset 0 0 0 1.5px rgba(31,42,69,.55)}
#stage .sb-warrior .sb-w-shield{left:63px;bottom:11px;width:30px;height:38px;transform-origin:50% 60%;border-radius:46% 46% 50% 50% / 34% 34% 62% 62%;background:linear-gradient(160deg,#e6edf8,var(--sb-w-metal) 35%,#8fa2c4 75%,#6c7fa2);box-shadow:0 0 0 2px var(--sb-w-edge),inset 0 0 0 3.5px var(--sb-w-gold),inset 0 -5px 8px rgba(20,30,60,.28);z-index:4}
#stage .sb-warrior .sb-w-shield::before{content:"";position:absolute;left:50%;top:46%;width:11px;height:11px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle at 40% 35%,#9fd6a8,#4e9860 70%);box-shadow:0 0 0 1.5px var(--sb-w-edge)}
#stage .sb-warrior .sb-w-shield::after{content:"";position:absolute;left:9px;top:6px;width:3px;height:3px;border-radius:50%;background:var(--sb-w-gold);box-shadow:9px 0 0 var(--sb-w-gold)}
/* 파쇄자 파츠 */
#stage .sb-iron-crusher .sb-shadow{left:50%;bottom:0;width:138px;height:22px;transform:translateX(-50%);border-radius:50%;background:radial-gradient(50% 50% at 50% 50%,rgba(0,0,0,.62),transparent 74%)}
#stage .sb-iron-crusher .sb-aura{left:50%;bottom:2px;width:170px;height:40px;transform:translateX(-50%);border-radius:50%;background:radial-gradient(50% 50% at 50% 50%,rgba(255,140,58,.16),transparent 68%)}
#stage .sb-iron-crusher .sb-ic-body{left:50%;bottom:18px;width:96px;height:72px;transform:translateX(-50%);border-radius:18px 18px 12px 12px;background:radial-gradient(circle at 12px 12px,var(--sb-ic-metal) 2.6px,transparent 3.4px),radial-gradient(circle at 84px 12px,var(--sb-ic-metal) 2.6px,transparent 3.4px),radial-gradient(circle at 12px 58px,var(--sb-ic-metal) 2.6px,transparent 3.4px),radial-gradient(circle at 84px 58px,var(--sb-ic-metal) 2.6px,transparent 3.4px),linear-gradient(160deg,#7b8296,var(--sb-ic-main) 38%,var(--sb-ic-deep));box-shadow:0 0 0 2.5px var(--sb-ic-edge),inset 0 4px 0 rgba(255,255,255,.16),inset 0 -12px 0 rgba(5,8,16,.35)}
#stage .sb-iron-crusher .sb-ic-body::before{content:"";position:absolute;left:10px;bottom:-15px;width:28px;height:16px;border-radius:7px 7px 5px 5px;background:linear-gradient(180deg,#3a404e,var(--sb-ic-deep));box-shadow:0 0 0 2.5px var(--sb-ic-edge),48px 0 0 0 #353b48,48px 0 0 2.5px var(--sb-ic-edge)}
#stage .sb-iron-crusher .sb-ic-body::after{content:"";position:absolute;left:6px;right:6px;bottom:4px;height:10px;border-radius:5px;background:repeating-linear-gradient(90deg,#3d4350 0 14px,#2b303c 14px 16px);box-shadow:inset 0 1px 0 rgba(255,255,255,.08),inset 0 -2px 0 rgba(0,0,0,.4)}
#stage .sb-iron-crusher .sb-ic-core{left:50%;bottom:56px;width:22px;height:22px;transform:translateX(-50%);border-radius:50%;background:radial-gradient(circle at 42% 36%,#ffe2b0,var(--sb-ic-ember) 34%,#ff7a1a 62%,#7a3410);box-shadow:0 0 0 3px #1c2029,0 0 0 4.5px #3d4350,0 0 14px 2px rgba(255,140,58,.55);animation:sbCoreP 2.8s ease-in-out infinite}
#stage .sb-iron-crusher .sb-ic-pauldrons{left:50%;bottom:77px;width:0;height:0;transform:translateX(-50%)}
#stage .sb-iron-crusher .sb-ic-pauldrons::before{content:"";position:absolute;left:-60px;top:0;width:34px;height:22px;border-radius:12px 12px 7px 7px;background-image:radial-gradient(circle at 50% 40%,var(--sb-ic-metal) 2.2px,transparent 3px),linear-gradient(160deg,#8a92a6,var(--sb-ic-main) 55%,var(--sb-ic-deep));box-shadow:0 0 0 2.5px var(--sb-ic-edge),inset 0 3px 0 rgba(255,255,255,.2),inset 0 -4px 0 rgba(5,8,16,.3)}
#stage .sb-iron-crusher .sb-ic-pauldrons::after{content:"";position:absolute;left:26px;top:0;width:34px;height:22px;border-radius:12px 12px 7px 7px;background-image:radial-gradient(circle at 50% 40%,var(--sb-ic-metal) 2.2px,transparent 3px),linear-gradient(200deg,#8a92a6,var(--sb-ic-main) 55%,var(--sb-ic-deep));box-shadow:0 0 0 2.5px var(--sb-ic-edge),inset 0 3px 0 rgba(255,255,255,.2),inset 0 -4px 0 rgba(5,8,16,.3)}
#stage .sb-iron-crusher .sb-ic-head{left:50%;bottom:86px;width:56px;height:42px;transform:translateX(-50%);transform-origin:50% 100%;border-radius:14px 14px 10px 10px;background:linear-gradient(165deg,#868da0,var(--sb-ic-main) 42%,var(--sb-ic-deep));box-shadow:0 0 0 2.5px var(--sb-ic-edge),inset 0 3px 0 rgba(255,255,255,.2)}
#stage .sb-iron-crusher .sb-ic-head::before{content:"";position:absolute;left:50%;top:-7px;width:14px;height:10px;transform:translateX(-50%);border-radius:6px 6px 2px 2px;background:linear-gradient(180deg,#9aa3b5,#4a505e);box-shadow:0 0 0 2.5px var(--sb-ic-edge)}
#stage .sb-iron-crusher .sb-ic-head::after{content:"";position:absolute;left:50%;bottom:10px;width:38px;height:9px;transform:translateX(-50%);border-radius:5px;background:radial-gradient(circle at 30% 50%,var(--sb-ic-ember) 2.6px,rgba(255,140,58,.5) 3.6px,transparent 5px),radial-gradient(circle at 70% 50%,var(--sb-ic-ember) 2.6px,rgba(255,140,58,.5) 3.6px,transparent 5px),linear-gradient(180deg,#0c0e14,#181c26);box-shadow:inset 0 0 0 1.5px rgba(0,0,0,.6),0 0 8px rgba(255,140,58,.25)}
#stage .sb-iron-crusher .sb-ic-hammer{left:144px;bottom:14px;width:11px;height:96px;border-radius:5px;transform-origin:50% 96%;background:linear-gradient(90deg,#4a3a2c,#6b543c 45%,#33261b);box-shadow:0 0 0 2.5px var(--sb-ic-edge);z-index:4}
#stage .sb-iron-crusher .sb-ic-hammer::before{content:"";position:absolute;left:-24px;top:-12px;width:58px;height:40px;border-radius:10px;background:radial-gradient(circle at 9px 9px,var(--sb-ic-metal) 2.4px,transparent 3.2px),radial-gradient(circle at 49px 9px,var(--sb-ic-metal) 2.4px,transparent 3.2px),radial-gradient(circle at 9px 31px,var(--sb-ic-metal) 2.4px,transparent 3.2px),radial-gradient(circle at 49px 31px,var(--sb-ic-metal) 2.4px,transparent 3.2px),linear-gradient(160deg,#8a92a6,var(--sb-ic-main) 40%,#20242e);box-shadow:0 0 0 2.5px var(--sb-ic-edge),inset 0 3px 0 rgba(255,255,255,.2),inset 0 -6px 0 rgba(5,8,16,.4)}
#stage .sb-iron-crusher .sb-ic-hammer::after{content:"";position:absolute;left:-2px;top:44px;width:15px;height:7px;border-radius:3px;background:linear-gradient(180deg,var(--sb-ic-metal),#5a6172);box-shadow:0 0 0 2px var(--sb-ic-edge)}
/* 전장 배치 + 스위칭 (shell_iron 전투만) */
#sb-boss-fig{left:50%;top:-14px;transform:translateX(-50%) scale(.68);transform-origin:50% 0;display:none;z-index:2}
#sb-war-fig{left:50%;bottom:-2px;transform:translateX(-50%) scale(.46);transform-origin:50% 100%;display:none;z-index:2}
#stage.sb-boss-iron #bossAvatar{display:none}
#stage.sb-boss-iron #sb-boss-fig{display:block}
#stage.sb-boss-iron #sa-war .figAura,#stage.sb-boss-iron #sa-war .figBody{display:none}
#stage.sb-boss-iron #sb-war-fig{display:block}
/* 포즈 어휘 (연결분만: 전사 guard/brace · 파쇄자 windup) */
#stage .sb-warrior[data-pose="guard"] .sb-react{transform:translateX(4px)}
#stage .sb-warrior[data-pose="guard"] .sb-w-shield{transform:translateX(-15px) translateY(-3px) scale(1.22)}
#stage .sb-warrior[data-pose="guard"] .sb-w-head{transform:translateX(calc(-50% + 3px))}
#stage .sb-warrior[data-pose="guard"] .sb-w-sword{transform:rotate(-42deg)}
#stage .sb-warrior[data-pose="brace"] .sb-react{transform:rotate(-5deg) translateY(4px) scale(.98)}
#stage .sb-warrior[data-pose="brace"] .sb-w-shield{transform:translateX(-8px) translateY(-9px) rotate(-14deg) scale(1.06)}
#stage .sb-warrior[data-pose="brace"] .sb-w-head{transform:translateX(calc(-50% - 1px)) translateY(3px) rotate(-4deg)}
#stage .sb-warrior[data-pose="brace"] .sb-w-sword{transform:rotate(-52deg)}
#stage .sb-iron-crusher[data-pose="windup"] .sb-react{transform:rotate(-3deg) translateY(-2px)}
#stage .sb-iron-crusher[data-pose="windup"] .sb-ic-hammer{transform:rotate(-18deg) translate(2px,-18px)}
#stage .sb-iron-crusher[data-pose="windup"] .sb-ic-head{transform:translateX(calc(-50% - 3px)) rotate(-3deg)}
/* 작은 화면(≤730) fallback — sb 미표시, 기존 이모지+fig 유지(축소 안전) */
@media (max-height:730px){
 #stage.sb-boss-iron #bossAvatar{display:block}
 #stage.sb-boss-iron #sb-boss-fig{display:none}
 #stage.sb-boss-iron #sa-war .figAura,#stage.sb-boss-iron #sa-war .figBody{display:block}
 #stage.sb-boss-iron #sb-war-fig{display:none}
}
@media (max-height:730px){
 #stage{height:62px}`,
    'e1 css');

/* ---------- e2. 파쇄자 sb 피규어 HTML (bossAvatar 뒤) ---------- */
one(`  <div id="bossAvatar">☠️</div>`,
`  <div id="bossAvatar">☠️</div>
  <div class="sb-unit sb-iron-crusher" id="sb-boss-fig" data-pose=""><div class="sb-react"><div class="sb-fit"><div class="sb-fig"><span class="sb-part sb-shadow"></span><span class="sb-part sb-aura"></span><span class="sb-part sb-ic-body"></span><span class="sb-part sb-ic-core"></span><span class="sb-part sb-ic-pauldrons"></span><span class="sb-part sb-ic-head"></span><span class="sb-part sb-ic-hammer"></span></div></div></div></div>`,
    'e2 boss html');

/* ---------- e3. 전사 sb 피규어 HTML (sa-war 안 · fxr-war/fxf-war 유지) ---------- */
one(`<span class="figFlash" id="fxf-war"></span></div>`,
`<span class="figFlash" id="fxf-war"></span><div class="sb-unit sb-warrior" id="sb-war-fig" data-pose=""><div class="sb-react"><div class="sb-fit"><div class="sb-fig"><span class="sb-part sb-shadow"></span><span class="sb-part sb-aura"></span><span class="sb-part sb-w-sword"></span><span class="sb-part sb-w-body"></span><span class="sb-part sb-w-pauldron"></span><span class="sb-part sb-w-head"></span><span class="sb-part sb-w-shield"></span></div></div></div></div></div>`,
    'e3 war html');

/* ---------- e4. newGame: shell_iron 판별 → stage 클래스 토글 (CORE 밖) ---------- */
one(` $('endOv').classList.add('hidden');
 render();`,
` $('endOv').classList.add('hidden');
 var _stg=$('stage');if(_stg)sC(_stg,'sb-boss-iron',(typeof CUR_BOSS!=='undefined'&&CUR_BOSS==='shell_iron'));
 render();`,
    'e4 newGame toggle');

/* ---------- e5. render: 포즈 어댑터 호출 + 함수 정의 (renderFx 뒤 · CORE 밖) ---------- */
one(` const mt=G.meleeTgtId();renderFx(S,t,p,mt);`,
` const mt=G.meleeTgtId();renderFx(S,t,p,mt);sbFigPose(S);`,
    'e5 render call');

one(`function renderFx(S,t,p,mt){`,
`/* Iron Crusher Figure Rework 01: 기존 전투 상태 → sb 피규어 포즈 class (시각 전용·판정 무접촉·docs/44) */
function sbFigPose(S){
 if(typeof CUR_BOSS==='undefined'||CUR_BOSS!=='shell_iron')return;
 var bc=S.boss.cast,smashing=!!(bc&&bc.kind==='smash');
 var bf=document.getElementById('sb-boss-fig');
 if(bf){var bp=smashing?'windup':'';if(bf.getAttribute('data-pose')!==bp)bf.setAttribute('data-pose',bp);}
 var war=null;for(var i=0;i<S.al.length;i++){if(S.al[i].id==='war')war=S.al[i];}
 var wp='';
 if(war&&war.alive){ if(war.shield&&war.shield.amt>0)wp='guard'; else if(smashing)wp='brace'; }
 var wf=document.getElementById('sb-war-fig');
 if(wf&&wf.getAttribute('data-pose')!==wp)wf.setAttribute('data-pose',wp);
}
function renderFx(S,t,p,mt){`,
    'e6 sbFigPose fn');

if (edits !== 6) throw new Error(`total edits=${edits} (expected 6)`);
fs.writeFileSync(PATH, src);
console.log(`p21 OK · edits=${edits}`);
