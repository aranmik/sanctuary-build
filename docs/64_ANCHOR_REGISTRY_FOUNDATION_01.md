# 64. 앵커 명부 기반 01 (ANCHOR REGISTRY FOUNDATION 01 — F3)

**작성: 렌 · 2026-07-15 · EP25 · 상태: 구현(등가 치환·화면 변화 0) · 기준 HEAD `2fc1089` · 상위: [59 헌법 §12](./59_STAGE_PRODUCTION_SYSTEM_CONSTITUTION_01.md) · [61 로드맵 F3](./61_STAGE_FOUNDATION_MIGRATION_ROADMAP_01.md) · [63 F2 §14 입력 계약](./63_ACTOR_REGISTRY_POSE_MAP_FOUNDATION_01.md)**

> **핵심 문장 3줄**
> 1. `행동선과 FX는 DOM 구조를 찾지 않고, "누구의 어느 지점인가"만 요청한다.`
> 2. `selector를 옮기되 좌표를 바꾸지 않는다` — 좌표 산식은 sbPt가 단일 소유(resolver가 위임 호출).
> 3. `(0,0)은 fallback이 아니라 버그다` — 유효하지 않은 anchor는 null, null이면 선을 끈다.

---

## 1. 작업 목적

무대 좌표 접근 3계보(fxAnchors/sbPt/SB_BODY)+인라인 selector를 **semantic Anchor Registry**로 수렴 시작. 이번 카드는 실전 대표 사례인 **파쇄자 강타 행동선**의 source/destination 좌표 소유권만 등가 이관한다. 새 연출·좌표 보정·미감 조정은 0.

## 2. 기존 anchor 계보 전수 감사 (HEAD `2fc1089` 실측)

| 계보 | 선언 | 반환/산식 | selector 소유 | fallback | 실사용자(치환 전) |
|---|---|---|---|---|---|
| **fxAnchors**(1936) | `A` 전역 캐시·resize만 무효(1944) | 슬롯/아바타 **중심점** {x,y} | `bossAvatar`·`sa-*` id 직서 | 요소 없으면 null 항목 | renderFx(비-iron fxBossLine)·fxIntLine·fxBeam(사제선)·fxWave |
| **sbPt**(2009) | 매 호출 실측 | `{x:r.left-sr.left+r.width/2, y:r.top-sr.top+(topBias?r.height*0.12:r.height/2)}` · 무효(!w&&!h·stage 무폭)=null | figId+part class 인자 | null | sbSmashFx 4개소(치환 대상) |
| **SB_BODY**(2008) | 정적 맵 war/rog/mage/sham→[figId,bodyPart] | — | 데이터 | 미등재 tg=선 없음 | ①sbSmashFx 좌표 조회(치환 대상) ②접촉 class fig 조회·sbHitClear·animationend(존치) |
| 인라인 selector | sbSmashFx 내 `'sb-ic-hammer'`/`'sb-w-shield'`/`'sb-w-body'` 직서 | — | 소비자가 직접 | — | 치환 대상 |
| 기타 rect | fxAnchors/sbPt 외 stage 좌표용 직접 getBoundingClientRect 없음(UI/마을/버튼 DOM은 본 카드 범위 밖 — 발주 §10) | | | | |

## 3. 실제 F3 치환 범위 / 비치환 범위

- **치환**: sbSmashFx의 좌표 계산 4개소 → `resolveAnchor('boss_iron','weapon')`·`resolveAnchor('war','shield'|'body')`·`resolveAnchor(bc.tg,'body')` 3개 의미 요청. 소비자에서 sbPt 직호출·인라인 selector·SB_BODY 좌표 조회 **0**(체크 a3).
- **비치환(격리 유지·근거)**: ①**fxAnchors 계보** — 모르가스/심연 legacy 선+사제 케어선(fxBeam/fxWave)의 원천. [61] 계획대로 F6/F7에서 해당 보스 무대 카드가 대체(이번 카드가 건드리면 화면 변화 위험) ②**SB_BODY의 비좌표 역할** — 접촉 class fig 조회는 anchor(좌표) 계산이 아니라 presenter 대상 조회(발주 §10 범위 밖) ③UI/마을/스킬 패널 selector 일체.

## 4. Anchor Registry schema (구현)

```js
ANCHOR_REGISTRY = {
 boss_iron:{figId:'sb-boss-fig', stageContext:'shell_iron', anchors:{
   weapon:{part:'sb-ic-hammer', topBias:1, label:'망치 자루 상단(강타선 source)'},
   body:  {part:'sb-ic-body',   label:'철괴 몸통'}}},
 war: {figId:'sb-war-fig', …, anchors:{shield:{part:'sb-w-shield'…}, body:{part:'sb-w-body'…}}},
 rog/mage/sham: {…, anchors:{body:{part:'sb-*-body'…}}}
}
```
- **semantic vocabulary(등록분)**: `weapon`(파쇄자)·`shield`/`body`(전사)·`body`(도적/마법사/주술사/파쇄자). **현행 실사용 최소 범위만** — orb/totem/intake/core/ground 등 미래 anchor 선등록 0(체크 a9·EXTENSION).
- 필드: owner(figId+stageContext)·binding(part class)·지점 계약(topBias — sbPt의 언어 그대로·**normalized x/y 일반화는 후속 anchor 도입 시 EXTENSION**·현행은 x=중심 고정/y=중심 또는 상단 12%가 전부)·debug label. gameplay 수치/타이머/FX/pose **0**(체크 a5·a4).

## 5. Generic resolver (구현)

`resolveAnchor(actorId,anchorName)` → `{actorId,anchorName,point:{x,y},reason:'ok'}` | `null`
1. registry 조회(actor→anchor def) 2. stage/fig/part element 조회 3. **validity**(연결·rect 유한·w>0∧h>0) 4. **좌표는 `sbPt(prof.figId,def.part,def.topBias?1:0)` 위임** 5. 실패는 전부 `sgAnchorFail(reason,…)`→null.
- **Actor/직업/보스 id 분기 0**(체크 a2 — 함수 본문에 id 문자열·switch 부재 기계 봉인). Actor별 DOM 차이는 전부 registry 데이터가 해결.
- shield/body **선택**은 resolver가 아니라 소비자(sbSmashFx=iron 고유 handler)의 gameplay 의미 — legacy 삼항 그대로 보존(체크 d1).

## 6. rect validity 계약 (구현)

element 존재 · `isConnected===false` 거부 · rect 존재 · `isFinite(left/top/width/height)` · `width>0&&height>0` · stage 존재. 사유 코드 7종: actor-unregistered/anchor-unregistered/element-missing/element-disconnected/rect-zero/rect-invalid/stage-missing — DEV 관측 전용(화면 노출 0).
- **legacy 대비 정밀화 근거(보고)**: legacy sbPt는 `!r.width&&!r.height`(둘 다 0)만 거부. 신 계약은 `w>0∧h>0`(발주 §7 필수). 두 조건은 **실도달 상태에서 동치** — 등록 파츠는 고정 CSS 치수라 (w>0,h=0) 퇴화 rect가 발생 불가하고, display:none은 전 성분 0. 차이가 생길 수 있는 가상 상태에서도 방향은 **fail-closed(선 숨김)**로만 작동 — 좌표가 달라질 수는 없음. hidden 판단은 rect-zero로 최소화(computed-style 전수 검사 없음 — layout thrash 회피·발주 §7).

## 7. stage-relative 좌표 계산식 (byte 보존)

`{x: r.left-sr.left+r.width/2, y: r.top-sr.top+(topBias? r.height*0.12 : r.height/2)}` — **sbPt 원문 그대로**(체크 a6이 원문 문자열 봉인). resolver가 sbPt를 호출하므로 유효 anchor의 좌표는 **정의상 legacy와 같은 코드가 계산**한다(등가 보증의 핵). viewport 스크롤/transform/DPR 동작 전부 legacy와 동일 경로.

## 8. null / fail-closed · (0,0) 유령 좌표 금지

- 모든 실패=null. 소비자: `var src=srcA&&srcA.point, dst=dstA&&dstA.point;` → **`var on=!!(src&&dst);` 원문 보존** → off면 attr 미갱신+class 'on' 제거(기존 로직 무변) — 이전 프레임 좌표로 새 선을 그리는 경로 없음(attr은 on일 때만 갱신=legacy 동작 그대로).
- 근거 회귀 사례: 구 fxAnchors가 숨겨진 `#bossAvatar` 0-rect로 **좌상단 유령 행동선**을 그렸던 결함([54 §10★★]→[55] 수정) — 본 registry는 그 봉인을 계약으로 상속(체크 a8: fail=null 7경로·고정 좌표 setAttribute 0·`{x:0,y:0}` 리터럴 0).

## 9. 강타 행동선 legacy ↔ new 대응표

| 요소 | legacy(치환 전) | new(치환 후) | 등가 |
|---|---|---|---|
| source | `sbPt('sb-boss-fig','sb-ic-hammer',1)` | `resolveAnchor('boss_iron','weapon').point` | 좌표 === (pane 실측 §11) |
| dst(전사·보호) | `sbPt('sb-war-fig','sb-w-shield')` | `resolveAnchor('war','shield').point` | === |
| dst(전사·직격) | `sbPt('sb-war-fig','sb-w-body')` | `resolveAnchor('war','body').point` | === |
| dst(비전사) | `sbPt(SB_BODY[tg][0],SB_BODY[tg][1])` | `resolveAnchor(bc.tg,'body').point` | === (rog/mage/sham 등록) |
| shield/body 분기 | `(SB_SM.blk‖SB_SM.sh0)?…` | 동일 삼항(semantic 이름만) | 원문 보존 |
| on/off | `var on=!!(src&&dst);` | 동일 원문 | byte 보존 |
| commit 시점 | `pr>=0.6` | 무접촉 | byte 보존 |
| class/애니/cleanup/resolve 3근거 | — | 전부 무접촉 | byte 보존 |

## 10. lifecycle / cleanup (pane 실측)

- 비-iron 전환: 숨겨진 fig의 anchor **null(rect-zero)** — F2의 data-pose 잔존 WATCH와 분리(포즈 속성은 legacy 관성·**anchor 유효성은 반드시 null** — 실측 boss/war 모두 null·사유 rect-zero) · 전환 직후 선 'on' 부재(잔존 0) · iron 복귀 시 유효 anchor 복원(실좌표 반환).
- battle end: 선 'on' 부재(off) · anchor는 fig가 보이는 한 유효(표시는 cast 유무가 결정=legacy). 재시작=신선 상태.
- observer/listener/timer 잔존 0(F3 블록에 타이머·리스너 0 — 체크 a5) · rect **장기 캐시 0**(매 요청 실측 — 체크 e1·pass-local cache 미도입: 현행 호출 수에서 불필요 §11).

## 11. cache / frame budget 실측 · 좌표 등가 (pane · 390×844)

- **좌표 등가**: 실전투 600 tick × 6 anchor 상시 대조(총 4,387회 resolve 성공) — legacy sbPt 직호출 vs resolver.point **엄격 ===(허용 오차 0) diff 0** · 선 attr(x1/y1) 대조 129 on-프레임 diff 0 · anchorStats fail 0.
- **frame budget**: resolver 1,000회 20.4ms(≈20μs/호출) vs legacy sbPt 11ms(≈11μs) — 유효성 검사 비용 +9μs/호출. 강타 cast 중 프레임당 resolver 2회=+18μs(60fps 예산 16.6ms의 ~0.1%) — regression 아님. 폭증 없음(호출 수 동일: cast 중 2회/프레임).
- F2 WATCH 승계 합산: 스냅샷 1회+resolver 2회/프레임(iron cast 중) — 총합 무시 수준. pass-local cache는 **미도입이 결론**(같은 render pass 내 동일 anchor 중복 요청이 현재 0회).

## 12. debug observation ([59 §23] · F1/F2 API 불변 확장)

`__seedHealer.stage.anchors()`(등록 actor 목록)·`.actorAnchors(id)`(정의 복사본)·`.anchor(actorId,anchorName)`(**실제 resolver와 동일 결과**의 복사본 — 유효=stage-relative CSS px point·무효=null·(0,0) 구분 명확)·`.anchorStats()`({ok,fail,lastFailures[≤8건 {actorId,anchorName,reason}]} 복사본). DOM node 비반출·console 상시 출력 0.

## 13. 화면·좌표 등가 검증 (동결 픽셀 — [62] 표준)

구(HEAD `2fc1089`) vs 신 · 6장면 · `*{animation:none;transition:none}` 동결:
| 장면 | 결과 |
|---|---|
| s1 idle(선 off) | md5 동일(c7f480c5) |
| s2 windup(t=6.2·선 on) | md5 동일(304933a8) |
| s3 committed(t≈7.35·pr≥0.6 굵은 선) | md5 동일(312b40ca) |
| s4 guard destination(3.2s 보호막→cast 중) | md5 동일(239ffade) |
| s5 source 숨김(boss fig display:none→선 off) | md5 동일(da57834d) |
| s6 destination 숨김(war fig display:none→선 off) | md5 동일(7bac5e07 — 2×2 재실행 4장 전부 일치) |
- ★s6 최초 1회 캡처가 상이했으나 **재실행 검증(구2/신2 전부 동일)**으로 캡처 파이프라인의 일시 노이즈로 확정 — 픽셀 diff 분포가 광역 산재 극소량(샘플 277점·특정 요소 없음)=폰트 AA 래스터 타이밍. 판정은 반복 캡처 기준.

## 14. 변경 파일

- `index.html` — F3 블록(강타선 anchor + §16-B closeout facade/신규 anchor/validity 정정)+sbSmashFx 좌표부 치환 + fxAnchors facade화 + renderFx/fxBeam cache 폐기 + resize listener 제거. 재-baseline **174,534 B / 2,444줄 / md5 `2326daeb…`**.
- 신규: `dev/anchor_registry_foundation_01_check.js`(초판 22 → closeout 30체크) · 본 문서(docs/64).
- 포인터: docs/98·99·102. live pin 재-baseline(956248ca→2326daeb·167719→174534·lines 2444).
- **★구계약 승계 5건(보고 — 전부 구 selector "형태" 핀·의미 불변)**: ①`iron_crusher_smash_line_rework_02_check` c3(sbPt 직호출 핀→resolveAnchor+registry 바인딩 검증) ②동 c6(SB_BODY[bc.tg] 좌표 조회 핀→resolveAnchor(bc.tg,'body')·실대상 id 사용 단언은 유지) ③동 c7(방패 selector 직서 핀→semantic 'shield'+registry 바인딩) ④`battle_stage_vertical_command_rebalance_01_check` c18 ⑤`battle_stage_vertical_polish_02_check` c8(④⑤=망치 source 보존 계약을 신 형태로). — closeout에서 추가 승계 0(F3 자체 체크 확장·baseline 핀만).

## 15. 비변경 영역

CORE(6cad2ec2) · gameplay 전부 · F1 SG 블록·drain·S.ev(스키마 확장 0) · F2 registry/resolver/포즈 결과 · `SB_BODY`(비좌표 역할=접촉 class fig 조회 존치) · `sbPt`(파츠 산식 단일 소유자로 존치·호출자=resolver) · `fxLn`/`fxToggle`/`fxWave`(좌표 미사용) · CSS 0줄 · markup 0 · 선 class/타이밍/commit 0.6/resolve 판별.

## 16. 검증 결과

- 신규 `anchor_registry_foundation_01_check` **초판 22/22 → closeout 확장 후 30/30 PASS**.
- F2 31/31 · F1 41/41 · Constitution 40/40 · 기존 전체 PASS · baseline 36/36 · 스모크 3종 동일.
- pane: 강타선 좌표 등가 diff 0(4,387회)·선 attr diff 0·overflow 0·console 0 · 동결 픽셀 6/6 동일(§13).

## 16-B. fxAnchors 계보 최종 이관 (F3 closeout 보완 · 2026-07-15)

초판 F3는 강타선(sbSmashFx)만 이관하고 `fxAnchors`(별도 좌표 소유자)를 남겨 유키PD가 **카드 HOLD**로 판정. 이 절이 남은 활성 계보를 같은 Registry 경계 안으로 닫는다.

### 16-B-1. 이관 방식 = **compatibility facade** (diff 최소)
`fxAnchors`를 **자체 selector/장기 cache/rect fallback 0**의 얇은 facade로 축소 — 내부에서 `resolveAnchor`만 조립:
```js
function fxAnchors(){var pt=r=>r?r.point:null;
 return {boss:pt(resolveAnchor('boss','avatar')),
  war:pt(resolveAnchor('war','slot')),rog:...,mage:...,sham:...,pri:pt(resolveAnchor('pri','origin'))};}
```
consumer(`renderFx`·`fxBeam`)는 `A.boss`/`A[tg]`/`A.pri`를 그대로 쓰되 `if(!A)A=fxAnchors()` → **`A=fxAnchors()`**(매 호출 재조립)로 바꿔 **resize-only 전역 cache 폐기**(listener 제거). `fxWave`는 **좌표 미사용**(figFlash만) — 이관 대상 아님(감사 확인).

### 16-B-2. 신규 semantic anchor (실사용만)
| anchor | binding | 소비 |
|---|---|---|
| `boss.avatar` | elId `bossAvatar`(context-free) | fxBossLine source(비-iron)·fxIntLine dest |
| `war/rog/mage/sham.slot` | elId `sa-*`(def.stageContext=null override) | fxBeam dest·fxIntLine source(rog)·fxBossLine dest(비-iron) |
| `pri.origin` | virtual `stage-bottom-center` | fxBeam source(사제 케어선) |

`elId`(요소 자체)·`virtual`(요소 없이 stage rect 기준) 두 anchor 종류를 resolver에 추가. 좌표 공식은 sbPt center와 **동일**(`x:left-srL+w/2, y:top-srT+h/2`).

### 16-B-3. ★rect validity 정정 (초판 버그 수정)
초판 resolver는 `r.width>0 && r.height>0`로 좁혀 놨는데, **슬롯(`.fig`)은 flex로 width:0·height:56**(피규어 absolute)이라 이 조건이 **정상 anchor를 잘못 null**로 만들었다(pane 실측 발견). legacy 정본(`sbPt`: `!r.width&&!r.height` / `fxAnchors.c`: 무검사)에 맞춰 **both-0(=display:none/미배치 ghost)일 때만 거부**(`!(r.width>0||r.height>0)`)로 정정. sb 파츠(항상 both>0)엔 영향 0(강타선 등가 불변), 슬롯(h>0) 정상 통과, 유령(both 0) 봉인 유지.

### 16-B-4. context guard (§6)
`def.stageContext !== undefined ? def.stageContext : prof.stageContext` · `ctx != null && ctx !== sgBossId()` → `context-inactive` null. sb 파츠 anchor(iron 전용)는 비-iron에서 context-inactive(pane 실측: 모르가스 war.shield=null). 슬롯/아바타/가상은 context-free(null) — rect validity로 fail-closed(iron 아바타 display:none → rect-zero).

### 16-B-5. closeout 등가 (pane 2×2 표준)
- **유령 봉인**: iron `boss.avatar` = **null**(legacy 유령 {x:-8,y:-131} 제거).
- **슬롯 정상**: iron/모르가스 `war.slot` 등 valid(w0·h56) — legacy 중심점과 **strict ===**.
- **소비자 등가**: 모르가스 fxIntLine 16프레임 diff 0 · fxBossLine 28프레임 diff 0 · iron fxBeam(사제 케어선) x1/y1/x2/y2 legacy와 **완전 일치**. onDiff 0 / 1800·1680·900 samples(iron·모르가스·심연).
- **동결 픽셀 5장면**(모르가스 idle/judge선/강타선 + iron idle/케어선) 구/신 **md5 동일**(★iron 케어선 s5: setTimeout(460ms) 레이스로 최초 1회 편차→구/신 각 4회 재캡처 전부 동일=반복 표준으로 노이즈 확정).
- **독립 계보 0 근거**: DOM binding 소유자=ANCHOR_REGISTRY 한 곳 · rect validity=resolveAnchor 한 곳 · 좌표 계산=sbPt(파츠)+resolveAnchor(elId·동일 공식) · facade/consumer에 `bossAvatar`/`sa-*` selector 0 · resize cache listener 제거.

## 17. 남은 WATCH

1. **s5/s6류 캡처 노이즈** — 동결 캡처도 드물게 폰트 AA/타이머 레이스 노이즈 → 픽셀 판정은 **반복 캡처(≥2×2)** 표준(F3에서 확립).
2. normalized x/y 일반화(중심/상단 12% 외 지점)는 미도입 — 새 anchor 요구 시 registry 필드 확장(EXTENSION).
3. 슬롯 좌표는 width:0 요소의 collapse-x에 의존(legacy 동일) — 슬롯 레이아웃이 바뀌면 좌표 이동(legacy도 동일하게 이동·현행 등가).
4. **F6/F7은 새 보스 시각 콘텐츠 카드** — 모르가스/심연 figure·선 문법을 얹되, **기반 anchor refactor는 F3에서 종료**되어 다시 하지 않는다(§16-B로 활성 계보 0). 새 보스가 새 anchor(intake/core 등)를 요구하면 registry에 **등록만** 추가.

## 18. F4(Companion Ensemble Runtime)에 넘기는 입력 계약

- F4는 [51] 승인 포즈를 **ACTOR_REGISTRY 등록(availablePoses+poseRules+CSS 이식)만으로** 연결한다 — 공통 resolver/presenter 수정 필요 시 그 자체가 F2 실패 신호(HOLD).
- 사용 가능 신호: F1 지속 스냅샷(sustained/branded/bombed/selected/alive/shielded — 조건 키는 sgPoseCond에 **키 추가**로 개방·Actor 분기 아님). [54 §16] 금지 입력(도적 smash 차단 등 근거 없는 상태) 승계.
- anchor가 필요한 연출은 F4 범위 아님(포즈만) — 행동선/FX 확장은 F8.
- 390 가독(주연 1 원칙 [53 §16])·Human Gate ⛑ 필수([61 F4]) · CORE/S.ev/drain/스모크 무접촉 승계.

---
*— 렌 (連·鍊·紅蓮), EP25. 좌표의 주소록을 만들었다. 선은 이제 "망치 어디였더라"를 묻지 않고 "파쇄자의 무기"라고 말한다. 산식은 한 글자도 바뀌지 않았고, 4,387번의 대조가 그것을 증언한다. 없는 곳을 가리키면 주소록은 정직하게 "없다"고 답한다 — 그 정직함이 (0,0)의 유령을 영원히 봉인한다.*
