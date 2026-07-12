// p22 · Companion Figure Party Rework 01 — 도적/마법사/주술사 sb 정장 실전 이식 + 4인 원호 재설계 (docs/49)
// 어댑터/CSS/HTML 전용 — CORE 무접촉 · 전투 수치/판정 무변경 · 시각 전용 · shell_iron 전투만.
// Preview 02(docs/48) 승인 색·재질·파츠 계승 → #stage 스코프 이식. 기존 figAura/figBody 숨김·fxr/fxf(링/플래시) 유지.
// 4인 원호: 전사 좌전방 최전열 / 도적 안쪽 / 마법사 중앙 / 주술사 우측 날개 / 파쇄자 위 중앙. 전체 확대.
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

/* ---------- e1. 색 변수 추가 (Preview 02 승인색) ---------- */
one(`--sb-ic-metal:#a7b0c2;--sb-ic-ember:#ffb45e}`,
`--sb-ic-metal:#a7b0c2;--sb-ic-ember:#ffb45e;--sb-r-main:#a58fd6;--sb-r-cloth:#403a52;--sb-r-clothD:#2a2640;--sb-r-leather:#6a5238;--sb-r-blade:#dee6f2;--sb-r-edge:#201b34;--sb-r-face:#ffd9b8;--sb-m-main:#bb85e6;--sb-m-robe:#343150;--sb-m-robeD:#201e38;--sb-m-cream:#d9cdec;--sb-m-gold:#e5c05f;--sb-m-orb:#ffdf9a;--sb-m-edge:#241640;--sb-m-face:#ffe0c4;--sb-s-main:#5fc7d5;--sb-s-cloth:#44606a;--sb-s-clothD:#2c454e;--sb-s-wood:#a5824e;--sb-s-brass:#cba860;--sb-s-glow:#8fe8d8;--sb-s-edge:#123038;--sb-s-face:#ffd9b8}`,
    'e1 vars');

/* ---------- e2. 3동료 파츠 CSS + keyframes (전장 배치 블록 앞에 삽입 · #stage 스코프) ---------- */
one(`/* 전장 배치 + 스위칭 (shell_iron 전투만) — Rework 02: 크기↑·대치 구도 압축 */`,
`/* Companion Party Rework 01 (docs/49) — 3동료 sb 정장 (Preview 02 승인색 계승) */
@keyframes sbOrb{0%,100%{box-shadow:0 0 8px 1px rgba(255,200,90,.45),0 0 0 1.5px var(--sb-m-edge)}50%{box-shadow:0 0 13px 3px rgba(255,200,90,.68),0 0 0 1.5px var(--sb-m-edge)}}
@keyframes sbShAura{0%,100%{opacity:.7}50%{opacity:1}}
#stage .sb-rogue .sb-fig{width:104px;height:126px;animation:sbBreathe 3.0s ease-in-out infinite}
#stage .sb-mage .sb-fig{width:104px;height:126px;animation:sbBreathe 3.4s ease-in-out infinite}
#stage .sb-shaman .sb-fig{width:104px;height:126px;animation:sbBreathe 3.8s ease-in-out infinite}
#stage .sb-still .sb-ic-core,#stage .sb-still .sb-m-orb,#stage .sb-still .sb-shaman .sb-aura{animation:none}
/* 도적 */
#stage .sb-rogue .sb-shadow{left:50%;bottom:0;width:48px;height:11px;transform:translateX(-50%);border-radius:50%;background:radial-gradient(50% 50% at 50% 50%,rgba(0,0,0,.46),transparent 72%)}
#stage .sb-rogue .sb-aura{left:50%;bottom:1px;width:56px;height:17px;transform:translateX(-50%);border-radius:50%;background:radial-gradient(50% 50% at 50% 50%,rgba(165,143,214,.22),transparent 70%)}
#stage .sb-rogue .sb-r-dagger2{left:24px;bottom:40px;width:4px;height:22px;border-radius:2px;background:linear-gradient(90deg,#eef2fa,var(--sb-r-blade));box-shadow:0 0 0 1.4px var(--sb-r-edge);transform:rotate(-38deg);transform-origin:50% 100%}
#stage .sb-rogue .sb-r-dagger2::before{content:"";position:absolute;left:-3px;bottom:-2px;width:10px;height:4px;border-radius:2px;background:var(--sb-r-leather);box-shadow:0 0 0 1.4px var(--sb-r-edge)}
#stage .sb-rogue .sb-r-body{left:50%;bottom:13px;width:30px;height:38px;transform:translateX(-50%);border-radius:11px 11px 8px 8px;background:linear-gradient(160deg,#4f4862,var(--sb-r-cloth) 44%,var(--sb-r-clothD));box-shadow:0 0 0 2px var(--sb-r-edge),inset 0 3px 0 rgba(255,255,255,.14),inset 0 -6px 0 rgba(10,8,20,.34)}
#stage .sb-rogue .sb-r-body::before{content:"";position:absolute;left:4px;bottom:-10px;width:10px;height:10px;border-radius:4px 4px 3px 3px;background:linear-gradient(180deg,#332c46,#221d34);box-shadow:0 0 0 2px var(--sb-r-edge),13px 0 0 0 #2c263c,13px 0 0 2px var(--sb-r-edge)}
#stage .sb-rogue .sb-r-body::after{content:"";position:absolute;left:2px;right:2px;bottom:8px;height:5px;border-radius:3px;background:linear-gradient(180deg,var(--sb-r-leather),#4a3925);box-shadow:inset 0 0 0 1px rgba(0,0,0,.4)}
#stage .sb-rogue .sb-r-scarf{left:50%;bottom:44px;width:20px;height:8px;transform:translateX(-50%);border-radius:4px 8px 4px 4px;background:linear-gradient(120deg,var(--sb-r-main),#7d68b0);box-shadow:0 0 0 1.6px var(--sb-r-edge)}
#stage .sb-rogue .sb-r-scarf::after{content:"";position:absolute;right:-6px;top:1px;width:10px;height:5px;border-radius:2px 5px 2px 2px;background:var(--sb-r-main);box-shadow:0 0 0 1.5px var(--sb-r-edge);transform:rotate(14deg)}
#stage .sb-rogue .sb-r-head{left:50%;bottom:44px;width:34px;height:31px;transform:translateX(-50%);border-radius:52% 52% 44% 44%;background:linear-gradient(165deg,#b9a6e0,var(--sb-r-main) 46%,#7c68ac);box-shadow:0 0 0 2px var(--sb-r-edge),inset 0 3px 1px rgba(255,255,255,.3)}
#stage .sb-rogue .sb-r-head::before{content:"";position:absolute;left:50%;top:-7px;width:14px;height:12px;transform:translateX(-50%) rotate(6deg);border-radius:60% 40% 50% 50%;background:linear-gradient(160deg,var(--sb-r-main),#6d5aa0);box-shadow:0 0 0 2px var(--sb-r-edge)}
#stage .sb-rogue .sb-r-head::after{content:"";position:absolute;left:50%;bottom:3px;width:22px;height:12px;transform:translateX(-50%);border-radius:8px;background:radial-gradient(circle at 32% 42%,#33384a 2px,transparent 2.7px),radial-gradient(circle at 68% 42%,#33384a 2px,transparent 2.7px),radial-gradient(circle at 17% 74%,rgba(255,138,128,.5) 2.2px,transparent 3.2px),radial-gradient(circle at 83% 74%,rgba(255,138,128,.5) 2.2px,transparent 3.2px),linear-gradient(180deg,#ffe4c8,var(--sb-r-face));box-shadow:inset 0 0 0 1.5px rgba(31,26,50,.5)}
#stage .sb-rogue .sb-r-dagger{left:60px;bottom:20px;width:5px;height:24px;border-radius:2px 2px 3px 3px;background:linear-gradient(90deg,#f4f7ff,var(--sb-r-blade) 55%,#b7c2d6);box-shadow:0 0 0 1.6px var(--sb-r-edge);transform:rotate(24deg);transform-origin:50% 100%;z-index:4}
#stage .sb-rogue .sb-r-dagger::before{content:"";position:absolute;left:-4px;bottom:-1px;width:13px;height:5px;border-radius:2px;background:linear-gradient(180deg,var(--sb-r-leather),#3f3021);box-shadow:0 0 0 1.6px var(--sb-r-edge)}
#stage .sb-rogue .sb-r-dagger::after{content:"";position:absolute;left:1px;bottom:-9px;width:3px;height:8px;border-radius:2px;background:#3a2e1f;box-shadow:0 0 0 1.5px var(--sb-r-edge)}
/* 마법사 */
#stage .sb-mage .sb-shadow{left:50%;bottom:0;width:56px;height:12px;transform:translateX(-50%);border-radius:50%;background:radial-gradient(50% 50% at 50% 50%,rgba(0,0,0,.48),transparent 72%)}
#stage .sb-mage .sb-aura{left:50%;bottom:1px;width:64px;height:19px;transform:translateX(-50%);border-radius:50%;background:radial-gradient(50% 50% at 50% 50%,rgba(187,133,230,.24),transparent 70%)}
#stage .sb-mage .sb-m-body{left:50%;bottom:11px;width:30px;height:40px;transform:translateX(-50%);border-radius:11px 11px 16px 16px;background:linear-gradient(165deg,#413d60,var(--sb-m-robe) 44%,var(--sb-m-robeD));box-shadow:0 0 0 2px var(--sb-m-edge),inset 0 3px 0 rgba(255,255,255,.16),inset 0 -8px 0 rgba(15,12,36,.34)}
#stage .sb-mage .sb-m-body::before{content:"";position:absolute;left:-4px;bottom:0;width:38px;height:14px;border-radius:8px 8px 12px 12px;background:linear-gradient(180deg,var(--sb-m-main),#7a4db0);box-shadow:0 0 0 2px var(--sb-m-edge)}
#stage .sb-mage .sb-m-body::after{content:"";position:absolute;left:3px;right:3px;bottom:17px;height:4px;border-radius:3px;background:linear-gradient(180deg,var(--sb-m-cream),#b9addd);opacity:.85}
#stage .sb-mage .sb-m-star{left:50%;bottom:15px;width:8px;height:8px;transform:translateX(-50%);border-radius:50%;background:radial-gradient(circle,#fff4d0,var(--sb-m-gold) 60%);box-shadow:0 0 5px rgba(229,192,95,.7),0 0 0 1px var(--sb-m-edge)}
#stage .sb-mage .sb-m-head{left:50%;bottom:46px;width:34px;height:30px;transform:translateX(-50%);border-radius:50% 50% 44% 44%;background:linear-gradient(165deg,#c69af0,var(--sb-m-main) 46%,#7a4db0);box-shadow:0 0 0 2px var(--sb-m-edge),inset 0 3px 1px rgba(255,255,255,.3)}
#stage .sb-mage .sb-m-head::before{content:"";position:absolute;left:50%;top:-16px;width:0;height:0;transform:translateX(-50%);border-left:11px solid transparent;border-right:11px solid transparent;border-bottom:20px solid var(--sb-m-main);filter:drop-shadow(0 -1px 0 var(--sb-m-edge))}
#stage .sb-mage .sb-m-head::after{content:"";position:absolute;left:50%;bottom:3px;width:22px;height:12px;transform:translateX(-50%);border-radius:8px;background:radial-gradient(circle at 32% 42%,#33384a 2px,transparent 2.7px),radial-gradient(circle at 68% 42%,#33384a 2px,transparent 2.7px),radial-gradient(circle at 17% 74%,rgba(255,138,128,.5) 2.2px,transparent 3.2px),radial-gradient(circle at 83% 74%,rgba(255,138,128,.5) 2.2px,transparent 3.2px),linear-gradient(180deg,#ffe4c8,var(--sb-m-face));box-shadow:inset 0 0 0 1.5px rgba(40,22,64,.5)}
#stage .sb-mage .sb-m-tip{left:50%;top:-1px;width:7px;height:7px;transform:translateX(-50%);border-radius:50%;background:radial-gradient(circle,#fff4d0,var(--sb-m-gold) 55%);box-shadow:0 0 7px rgba(229,192,95,.85)}
#stage .sb-mage .sb-m-orb{left:62px;bottom:30px;width:17px;height:17px;border-radius:50%;background:radial-gradient(circle at 40% 34%,#fff5d8,var(--sb-m-orb) 42%,#ff9a3a 74%,#7a3a10);box-shadow:0 0 10px 1px rgba(255,200,90,.55),0 0 0 1.5px var(--sb-m-edge);z-index:4;animation:sbOrb 2.6s ease-in-out infinite}
/* 주술사 */
#stage .sb-shaman .sb-shadow{left:50%;bottom:0;width:56px;height:12px;transform:translateX(-50%);border-radius:50%;background:radial-gradient(50% 50% at 50% 50%,rgba(0,0,0,.48),transparent 72%)}
#stage .sb-shaman .sb-aura{left:50%;bottom:0;width:78px;height:27px;transform:translateX(-50%);border-radius:50%;background:radial-gradient(50% 50% at 50% 50%,rgba(143,232,216,.38),transparent 68%);animation:sbShAura 3.2s ease-in-out infinite}
#stage .sb-shaman .sb-s-body{left:50%;bottom:12px;width:32px;height:39px;transform:translateX(-50%);border-radius:12px 12px 13px 13px;background:linear-gradient(165deg,#556d76,var(--sb-s-cloth) 44%,var(--sb-s-clothD));box-shadow:0 0 0 2px var(--sb-s-edge),inset 0 3px 0 rgba(255,255,255,.16),inset 0 -7px 0 rgba(8,24,28,.32)}
#stage .sb-shaman .sb-s-body::before{content:"";position:absolute;left:4px;bottom:-10px;width:11px;height:10px;border-radius:4px 4px 3px 3px;background:linear-gradient(180deg,#334d55,#22383f);box-shadow:0 0 0 2px var(--sb-s-edge),14px 0 0 0 #2e444c,14px 0 0 2px var(--sb-s-edge)}
#stage .sb-shaman .sb-s-body::after{content:"";position:absolute;left:3px;right:3px;bottom:8px;height:5px;border-radius:3px;background:linear-gradient(180deg,var(--sb-s-brass),#9a7c3e);box-shadow:inset 0 0 0 1px rgba(0,0,0,.35)}
#stage .sb-shaman .sb-s-charm{left:50%;bottom:26px;width:12px;height:12px;transform:translateX(-50%);border-radius:50%;border:2.5px solid var(--sb-s-main);background:radial-gradient(circle,rgba(143,232,216,.55),transparent 65%);box-shadow:0 0 0 1.4px var(--sb-s-edge),0 0 8px rgba(143,232,216,.6)}
#stage .sb-shaman .sb-s-head{left:50%;bottom:44px;width:35px;height:31px;transform:translateX(-50%);border-radius:50% 50% 44% 44%;background:linear-gradient(165deg,#6f8890,var(--sb-s-cloth) 48%,var(--sb-s-clothD));box-shadow:0 0 0 2px var(--sb-s-edge),inset 0 3px 1px rgba(255,255,255,.28)}
#stage .sb-shaman .sb-s-head::before{content:"";position:absolute;left:50%;top:-5px;width:26px;height:12px;transform:translateX(-50%);border-radius:50% 50% 40% 40%;background:linear-gradient(180deg,var(--sb-s-clothD),#1e363d);box-shadow:0 0 0 2px var(--sb-s-edge)}
#stage .sb-shaman .sb-s-head::after{content:"";position:absolute;left:50%;bottom:3px;width:22px;height:12px;transform:translateX(-50%);border-radius:8px;background:radial-gradient(circle at 32% 42%,#33384a 2px,transparent 2.7px),radial-gradient(circle at 68% 42%,#33384a 2px,transparent 2.7px),radial-gradient(circle at 17% 74%,rgba(255,138,128,.5) 2.2px,transparent 3.2px),radial-gradient(circle at 83% 74%,rgba(255,138,128,.5) 2.2px,transparent 3.2px),linear-gradient(180deg,#ffe4c8,var(--sb-s-face));box-shadow:inset 0 0 0 1.5px rgba(18,48,56,.5)}
#stage .sb-shaman .sb-s-totem{left:64px;bottom:8px;width:5px;height:58px;border-radius:3px;background:linear-gradient(90deg,#7a5f35,var(--sb-s-wood) 45%,#5e4a2a);box-shadow:0 0 0 1.6px var(--sb-s-edge);z-index:4}
#stage .sb-shaman .sb-s-totem::before{content:"";position:absolute;left:50%;top:-13px;width:16px;height:16px;transform:translateX(-50%);border-radius:50%;border:3px solid var(--sb-s-main);background:radial-gradient(circle,rgba(143,232,216,.55),transparent 62%);box-shadow:0 0 0 1.5px var(--sb-s-edge),0 0 9px rgba(143,232,216,.6)}
#stage .sb-shaman .sb-s-totem::after{content:"";position:absolute;left:50%;top:2px;width:6px;height:6px;transform:translateX(-50%);border-radius:50%;background:var(--sb-s-glow);box-shadow:0 0 6px var(--sb-s-glow)}
/* 전장 배치 + 스위칭 (shell_iron 전투만) — Rework 02: 크기↑·대치 구도 압축 */`,
    'e2 companion parts');

/* ---------- e3~e5. 3동료 HTML sb 래퍼 (fxr/fxf 유지) ---------- */
one(`<span class="figFlash" id="fxf-rog"></span></div>`,
`<span class="figFlash" id="fxf-rog"></span><div class="sb-unit sb-rogue" id="sb-rog-fig"><div class="sb-react"><div class="sb-fit"><div class="sb-fig"><span class="sb-part sb-shadow"></span><span class="sb-part sb-aura"></span><span class="sb-part sb-r-dagger2"></span><span class="sb-part sb-r-body"></span><span class="sb-part sb-r-scarf"></span><span class="sb-part sb-r-head"></span><span class="sb-part sb-r-dagger"></span></div></div></div></div></div>`,
    'e3 rog html');
one(`<span class="figFlash" id="fxf-mage"></span></div>`,
`<span class="figFlash" id="fxf-mage"></span><div class="sb-unit sb-mage" id="sb-mage-fig"><div class="sb-react"><div class="sb-fit"><div class="sb-fig"><span class="sb-part sb-shadow"></span><span class="sb-part sb-aura"></span><span class="sb-part sb-m-body"></span><span class="sb-part sb-m-star"></span><span class="sb-part sb-m-head"></span><span class="sb-part sb-m-tip"></span><span class="sb-part sb-m-orb"></span></div></div></div></div></div>`,
    'e4 mage html');
one(`<span class="figFlash" id="fxf-sham"></span></div>`,
`<span class="figFlash" id="fxf-sham"></span><div class="sb-unit sb-shaman" id="sb-sham-fig"><div class="sb-react"><div class="sb-fit"><div class="sb-fig"><span class="sb-part sb-shadow"></span><span class="sb-part sb-aura"></span><span class="sb-part sb-s-body"></span><span class="sb-part sb-s-charm"></span><span class="sb-part sb-s-head"></span><span class="sb-part sb-s-totem"></span></div></div></div></div></div>`,
    'e5 sham html');

/* ---------- e6. sb-*-fig 배치 + 스위칭 확장 ---------- */
one(`#sb-war-fig{left:50%;bottom:-3px;transform:translateX(-50%) scale(.68);transform-origin:50% 100%;display:none;z-index:3}
#stage.sb-boss-iron #bossAvatar{display:none}
#stage.sb-boss-iron #sb-boss-fig{display:block}
#stage.sb-boss-iron #sa-war .figAura,#stage.sb-boss-iron #sa-war .figBody{display:none}
#stage.sb-boss-iron #sb-war-fig{display:block}`,
`#sb-war-fig{left:50%;bottom:-3px;transform:translateX(-50%) scale(.74);transform-origin:50% 100%;display:none;z-index:4}
#sb-rog-fig{left:50%;bottom:-3px;transform:translateX(-50%) scale(.66);transform-origin:50% 100%;display:none;z-index:3}
#sb-mage-fig{left:50%;bottom:-3px;transform:translateX(-50%) scale(.68);transform-origin:50% 100%;display:none;z-index:3}
#sb-sham-fig{left:50%;bottom:-3px;transform:translateX(-50%) scale(.66);transform-origin:50% 100%;display:none;z-index:3}
#stage.sb-boss-iron #bossAvatar{display:none}
#stage.sb-boss-iron #sb-boss-fig{display:block}
#stage.sb-boss-iron #sa-war .figAura,#stage.sb-boss-iron #sa-war .figBody,#stage.sb-boss-iron #sa-rog .figAura,#stage.sb-boss-iron #sa-rog .figBody,#stage.sb-boss-iron #sa-mage .figAura,#stage.sb-boss-iron #sa-mage .figBody,#stage.sb-boss-iron #sa-sham .figAura,#stage.sb-boss-iron #sa-sham .figBody{display:none}
#stage.sb-boss-iron #sb-war-fig,#stage.sb-boss-iron #sb-rog-fig,#stage.sb-boss-iron #sb-mage-fig,#stage.sb-boss-iron #sb-sham-fig{display:block}`,
    'e6 place+switch');

/* ---------- e7. 4인 원호 배치 재설계 (다 커진 sb에 맞춰) ---------- */
one(`#stage.sb-boss-iron #stageAllies{bottom:29px}
#stage.sb-boss-iron #sa-war{transform:translate(8px,-13px)}
#stage.sb-boss-iron #sa-rog{transform:translate(6px,5px)}
#stage.sb-boss-iron #sa-mage{transform:translate(-4px,5px)}
#stage.sb-boss-iron #sa-sham{transform:translate(-3px,-6px)}`,
`#stage.sb-boss-iron #stageAllies{bottom:26px;gap:12px}
#stage.sb-boss-iron #sa-war{transform:translate(4px,-15px);z-index:4}
#stage.sb-boss-iron #sa-rog{transform:translate(7px,4px)}
#stage.sb-boss-iron #sa-mage{transform:translate(-2px,4px)}
#stage.sb-boss-iron #sa-sham{transform:translate(-2px,-9px)}`,
    'e7 arc layout');

/* ---------- e8. 작은 화면 fallback 확장 (3동료 sb 미표시·이모지+원형 유지) ---------- */
one(` #stage.sb-boss-iron #sa-war .figAura,#stage.sb-boss-iron #sa-war .figBody{display:block}
 #stage.sb-boss-iron #sb-war-fig{display:none}`,
` #stage.sb-boss-iron #sa-war .figAura,#stage.sb-boss-iron #sa-war .figBody,#stage.sb-boss-iron #sa-rog .figAura,#stage.sb-boss-iron #sa-rog .figBody,#stage.sb-boss-iron #sa-mage .figAura,#stage.sb-boss-iron #sa-mage .figBody,#stage.sb-boss-iron #sa-sham .figAura,#stage.sb-boss-iron #sa-sham .figBody{display:block}
 #stage.sb-boss-iron #sb-war-fig,#stage.sb-boss-iron #sb-rog-fig,#stage.sb-boss-iron #sb-mage-fig,#stage.sb-boss-iron #sb-sham-fig{display:none}`,
    'e8 fallback');

if (edits !== 8) throw new Error(`total edits=${edits} (expected 8)`);
fs.writeFileSync(PATH, src);
console.log(`p22 OK · edits=${edits}`);
