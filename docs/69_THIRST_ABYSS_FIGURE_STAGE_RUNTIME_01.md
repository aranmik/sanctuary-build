# 69. 갈증의 심연 인형 & 무대 런타임 01 (THIRST ABYSS FIGURE & STAGE RUNTIME 01 — F7)

**작성: 렌 · 2026-07-17 · EP26 · 상태: 구현(visible production·나라님 Phone Human Gate 대기·commit/push 0) · 기준 HEAD `e785212` · 상위: [59](./59_STAGE_PRODUCTION_SYSTEM_CONSTITUTION_01.md)·[39 시각 정체성](./39_BATTLE_VISUAL_IDENTITY_CONTRACT.md)·[41 피규어 정장](./41_BATTLE_FIGURE_KIT_IMPORT_CONTRACT.md)·[32 심연 런타임](./32_THIRST_ABYSS_RUNTIME.md)·[67 F5](./67_BOSS_FIGURE_SHELL_FACE_TEMPLATE_01.md)·[68 F6](./68_MORGAS_FIGURE_STAGE_RUNTIME_01.md)**

> **핵심 문장 3줄**
> 1. `갈증의 심연은 공격하기 전에 위협적인 것이 아니라, 존재하는 동안 계속 무언가를 말리고 있다.`
> 2. drain은 **cast 없는 즉발**이 진리다 — 가짜 tell을 만들지 않는다. 개성은 ambient body grammar가 만든다.
> 3. 얼굴도 무기도 시전도 없는 보스가 **F5/F6 기반 무수정**으로 무대에 올랐다.

---

## 1. 작업 목적

F5(계약)·F6(두 번째 보스)에 이어, **인간형 얼굴도 명확한 시전 tell도 없는 비인간형 보스**가 같은 기반으로 무대에 설 수 있는지 실증한다. 동시에 F5가 문서로만 약속했던 경계 — **얼굴 없음 / 무기 없음 / sideL·sideR 비대칭 / optional null** — 을 실제 콘텐츠로 시험한다.

## 2. 작업 전 gameplay truth 감사 (읽기 전용)

| # | 항목 | 실측 |
|---|---|---|
| 1 | bossId | **`shell_thirst`** (BOSS_DEFS 실재 — 문서용 이름이 아님) |
| 2 | display name | `갈증의 심연` / sn `심연` · HP 8400 |
| 3 | Stage context/class | **없음** — `#stage` class는 `pn`뿐(F6 이전 모르가스와 동일 상태) |
| 4 | legacy avatar | `<div id="bossAvatar">☠️</div>` — 심연의 유일한 시각물이었다 |
| 5 | action 종류 | **`drain` · `valor` · `enrage` 3종뿐**(ABYSS_SCRIPT) — smash/judge/brand/bomb 없음 |
| 6 | drain 실행 구조 | `fireScript`의 `case 'drain'` 안에서 **전부 즉시 처리**: 마나 흡수 → `aliveAll().forEach(dmg)` → 사제 피해 → 로그 → `FX('aoe')` |
| 7 | drain cast/예고 | **없음** — `S.boss.cast=`는 소스 전체에서 `smash`(1곳)·`judge`(1곳) **2곳뿐** |
| 8 | 즉발 tick | SCRIPT tick 그 자체 — t=5/11/19/25/31/37/45/51/59/65/71 (**drain 11회**) |
| 9 | drain 대상/결과 | 사제 마나 62(광폭 95) 흡수 + **전원**에게 42(광폭 64) 피해 |
| 10 | 지속 상태 truth | **`enraged`(t=56)** 존재 · `valorActive`(t=16/42) 존재 · **cast 파생 truth는 0** |
| 11 | 기존 FX/행동선 | `FX('aoe')` → `SFX.aoe(); shake(); vign()` — **화면 레벨**(사운드+흔들림+비네트). 보스 anchor 사용 0 |
| 12 | boss anchor consumer | `A.boss` 소비자 **정확히 2곳** — `fxBossLine`(smash 필요)·`fxIntLine`(judge 필요) |
| 13 | 동료 pose(심연 전투) | 실측 1236틱: war `''`×1236 · rog `''`×1236 · **mage `channel`×1235** · sham `sustain`×481 |
| 14 | 기존 시각 계약 | [39 D-3] 액체/심연/안개/**흡수체**·낮고 퍼짐·계속 빨아들이는 느낌 / [41 H-3] 낮은 액체 덩어리·심연 핵·안개/기포·흡수구·번지는 웅덩이·마른 흡수 오라 · main 심청/glow 청록 |
| 15 | Boss Grammar | [33] 심연=**자원·인내형 기준 보스**("마나 관리 못해? 그러면 끝까지 못 버텨") · 어휘 부분집합(drain·valor·enrage만) |
| 16 | `shell_thirst`는 실제 bossId인가 | **예** — `BOSS_DEFS.shell_thirst`·`BOSS_OV.shell_thirst`·`smoke('shell_thirst')` 전부 실재 |
| 17 | smoke/autoplay | `s.smoke('shell_thirst')` → defeat 61.8s / 1236 steps |

**★감사 결론 3건**
1. **심연은 cast를 아예 하지 않는다** → `snap.bossAction`이 전투 내내 **null**. 모르가스식 `bossActionKind` pose/face 규칙은 **불가능하고, 부적절하다**. 발주 §10의 "지속 상태 없으면 default only + ambient"가 정확히 이 경우다.
2. **A.boss를 심연은 쓰지 않는다** — 소비자 2곳이 모두 cast를 요구하므로 심연에선 **영구 OFF**. 따라서 legacy 아바타를 숨겨도 **끊길 FX가 없고**, anchor를 등록할 이유도 없다.
3. **마법사가 전투 내내 channel이다**(1235/1236틱) — 보스가 시전을 안 하니 `bossActing:false`가 항상 참. F4 규칙상 정상이며, F6의 동료 context-free 전환으로 **F7에서 처음 가시화**된다(§18 W2).

## 3. drain 즉발 계약

```
case 'drain': { burn → S.pri.mana 차감 → aliveAll().forEach(dmg) → dmg(S.pri) → L(...) → FX('aoe'); break }
```
**cast 없음 · 예고 없음 · 대응 창 없음.** F7은 이 진리를 왜곡하지 않는다:
- 가짜 cast bar ⛔ · drain 직전 tell/windup ⛔ · 존재하지 않는 대응 시간 암시 ⛔ · visual 때문의 timing 변경 ⛔
- 검증: `S.boss.cast={kind:` 는 소스 전체 **2곳**(smash/judge)이고 `drain`은 없음(check a2) · SCRIPT 원문 보존(a4) · **실 전투에서 bossAction 한 번도 없음**(a6)

## 4. 실제 bossId / actorId / context

bossId **`shell_thirst`** · actorId **`boss_abyss`**(boss_iron/boss_morgas 명명 계보) · stageContext **`shell_thirst`** · contextClass **`sb-boss-thirst`** · figId **`sb-abyss-fig`**.
★F6의 함정 교훈 적용: **두 레지스트리의 actorId 동일 키**를 처음부터 지켰다(ACTOR_REGISTRY.boss_abyss ↔ profile.actorId `boss_abyss`).

## 5. 기존 시각 계약 (승인본 준수)

[39 D-3] + [41 H-3]을 그대로 따랐다.

| 승인 항목 | F7 구현 |
|---|---|
| 낮고 퍼진 액체형 | fig **168×118** (파쇄자 190×212 큰 사각 / 모르가스 120×198 가늘고 높음과 **정반대 축**) · `top:74px`(무대 아래쪽에 웅크림) |
| 낮은 액체 덩어리 | `sb-ab-pool` — 128×56 비정형 blob(`border-radius` 4값 비대칭) |
| 심연 핵 | `sb-ab-core` — 중심이 **비어 있는**(`--sb-ab-void`) 원, 청록 림 |
| 안개/기포 | pool `::before` — 크기·간격이 불규칙한 기포 4개 |
| 흡수구/외곽 | `sb-ab-shardL`/`sb-ab-shardR` — **비대칭** 찢어진 조각 |
| 번지는 웅덩이 | `sb-shadow` 158×20 넓고 흐린 2단 gradient |
| 마른 흡수 오라 | `sb-aura` — **안으로 말려 들어가는** 링(`sbAbDrawIn`) |
| main 심청 / glow 청록 | `--sb-ab-main:#2e5f8a` / `--sb-ab-glow:#4fd6c8` (+deep/edge/void/mist) |

## 6. 선택한 non-humanoid silhouette

**낮고 넓게 퍼진 액체 덩어리 + 비어 있는 중심 핵 + 좌우가 다른 찢어진 조각.** 얼굴 없음·무기 없음·좌우 대칭 없음. 실루엣만으로 세 보스가 구분된다: 파쇄자=크고 각짐 / 모르가스=가늘고 비틀림 / **심연=낮고 퍼짐**([39] "세 보스가 다른 동사로 읽힌다").

## 7. shell 선택 근거

**기존 `sb_unit_v1` 재사용(3번째).** 3층 transform(react/fit/fig)으로 비인간형도 완전히 표현됐다 — 부유=fig, 파츠 배치=fig 내부 absolute. `react` 층은 심연이 반응 pose가 없어 미사용이지만, **미사용이 곧 표현 불가는 아니다**. 새 shell 사유(3층으로 표현 불가 / 본질적으로 다른 owner·layer 필요 / 기존 shell 수정 없이는 불가)가 **하나도 성립하지 않았다**. → `bossShells()`는 여전히 **1종**이 3보스를 수용.

## 8. Profile

```
BOSS_STAGE_PROFILE['shell_thirst'] = {
  bossId:'shell_thirst', actorId:'boss_abyss', shellId:'sb_unit_v1',
  figId:'sb-abyss-fig', hostId:'stage', stageContext:'shell_thirst', contextClass:'sb-boss-thirst',
  parts:{root,ground,aura,body,core,sideL,sideR},     // face/weapon/ornament 미보유 = null
  // faceParts 없음 (얼굴 없는 보스)
  defaultFace:'', allowedFaces:[], candidateFaces:['hurt','groggy','enraged','defeated'],
  faceRules:[], anchors:[] }
```
gameplay mutable state 0 · 등록 순서 의존 0 · unknown fallback 보존.

## 9. part mapping

| slot | class | 역할 |
|---|---|---|
| root | `sb-fig` | 파츠 컨테이너(`sbAbFloat 6.4s` 매우 느린 부유) |
| ground | `sb-shadow` | 번지는 웅덩이(158×20·2단 gradient) |
| aura | `sb-aura` | 마른 흡수 오라 — **안으로 말려 들어감**(`sbAbDrawIn 3.8s`) |
| body | `sb-ab-pool` | 낮은 액체 덩어리(`sbAbPool 5.6s` 수축·팽창) + 기포 `::before` |
| core | `sb-ab-core` | 심연 핵 — **비어 있는 중심**, `sbAbCoreIn 4.4s`로 **안으로 호흡** |
| sideL | `sb-ab-shardL` | 큰 조각(38×26·`5.2s`) |
| sideR | `sb-ab-shardR` | 작은 조각(26×18·`7.1s`) |
| face / weapon / ornament | — | **미보유 = null** |

## 10. sideL / sideR 사용 여부

**실사용 — F5가 어휘로만 두었던 슬롯의 첫 소비자.** 단순 대칭 장식이 아님을 3중으로 보장:
- **크기 다름**: 38×26 vs 26×18 (실측 41.2 vs 29.0)
- **위치 비대칭**: `left:6px;bottom:26px` vs `left:118px;bottom:38px`
- **주기 다름**: `5.2s` vs `7.1s` (서로 다른 리듬으로 어긋나게 움직임) · 각도/변위도 상이
- `transform-origin`도 `100% 50%` vs `0% 50%`(각자 중심 쪽으로 끌림)

## 11. face 없음 계약

발주 §9의 **A안 채택**: `faceParts` 자체를 선언하지 않고 `faceRules:[]`·`allowedFaces:[]`·`defaultFace:''`.
근거: **지속 face truth가 0**이다(cast 없음 → tell 없음). 인간형 눈·입을 억지로 만들지 않는다([41]의 "심연 핵·눈"은 core가 시각적 중심임을 뜻하며, 해부학적 얼굴 상태 기계를 요구하지 않는다). F5 `resolveBossFace`는 규칙이 없으면 `defaultFace`(`''`)를 반환하고 presenter가 `data-face=''`를 유지 → **face state 0·churn 0**.

→ **F5의 "얼굴 없는 보스 허용"이 실제 콘텐츠로 증명됐다.** 심연은 얼굴 표정 없이 **몸의 리듬과 core의 상태**로 살아 있다.

## 12. pose vocabulary

**`default('')` 하나뿐** · `allowedPoses:[]` · `poseRules:[]` · candidatePoses `['crave','recoil','swell']`(미래 vocabulary).

근거: 발주 §10 "실제 지속 상태가 없다면 production pose는 default 하나만 허용". 심연에 cast 파생 truth는 0이다.

**★`enraged`에 대한 판단(보고)**: `enraged`(t=56)는 **실재하는 지속 truth**이고 §10은 "지속 상태가 있다면 pure pose 파생 가능"을 허용한다. 그러나 이를 pose로 연결하려면 **`sgPoseCond`에 `enraged` 조건 키를 추가**해야 하고, 그것은 F2 generic 조건 해석기 수정이다. 발주 §6은 "generic 기반 수정이 필요하면 **먼저 보고하고 HOLD**"를 요구한다 → **이번 카드에서 구현하지 않고 보고만 한다**(§32 F8 입력 계약·§29 W1). 카드의 정체성("존재하는 동안 계속 말리고 있다")은 ambient가 담당하므로 **enraged pose 없이도 목표는 달성된다**.

## 13. face vocabulary

**없음**(§11). candidateFaces 4종은 다른 보스와 동일하게 미래 vocabulary로만 보존.

## 14. ambient idle과 gameplay tell의 구분

| | ambient idle (F7이 만든 것) | gameplay tell (F7이 만들지 않은 것) |
|---|---|---|
| 구동 | **CSS animation infinite** — 상태 입력 0 | 상태(cast) 파생 |
| 의미 | "이 존재는 늘 무언가를 빨아들인다" | "곧 무엇이 온다" |
| 리듬 | 4.4~7.1s 느린 비주기(서로 어긋남) | 짧고 명확 |
| 방향 | **안으로 수렴**(core 수축·오라 말림·조각 끌림) | 밖으로 폭발/치켜듦 |
| 대응 | 대응할 것이 없음(정보 0) | 대응 창 제공 |

**금지 항목 실천**: drain 직전 급격한 windup 0 · 대응 가능 오해 동작 0 · action kind 미연결 attack pose 0 · 임의 visual timer 0(F7 영역 `setTimeout`/`setInterval` **0**) · 매 drain마다 one-shot 0 · 모르가스 아이디어 혼입 0 · F8 reaction 선행 0.

**검증**: 실 전투 1236틱 전 구간 pose `''`·face `''`(check e3) · 심연 스코프 CSS에 tell/cast/windup 선택자 0(a5) · 안으로 수렴 keyframes 확인(e7).

## 15. Stage Signal 입력

**신규 field 0.** 심연은 기존 truth조차 파생할 게 없다(cast 0). `sgSnapshot` 무변경(check j2) · gameplay state/timer/S.ev 추가 0 · drain/ring buffer 소비 변경 0.

## 16. Actor Registry 연결

```
ACTOR_REGISTRY.boss_abyss = {actorId:'boss_abyss', kind:'boss', figId:'sb-abyss-fig',
  stageContext:'shell_thirst', bossStageProfile:'shell_thirst',
  snapshotKey:null, defaultPose:'', allowedPoses:[], candidatePoses:['crave','recoil','swell'], poseRules:[]}
```
빈 `poseRules`에서 F2 `resolveActorPose`는 `byDefault` 경로로 `defaultPose`를 반환한다(안전 fallback 실증). 파쇄자·모르가스 actor profile 무변경.

## 17. generic resolver 무수정 증명

- **F5 generic**(resolveBossStageProfile/FigureShell/Face·presentBossFigure·clearBossFigure·sbBossFigure) + **F6 generic**(resolveActiveBossAnchor·sbStageContext): 심연 literal(`shell_thirst`/`boss_abyss`/`sb-ab-pool`/`crave`) **0**·switch 0 (check j3)
- **F2/F3**(resolveActorPose·sgPoseCond·sbFigPose·resolveAnchor): Actor id literal **0** (j4)
- **`sgPoseCond` 조건 키 무변경** — F7은 새 조건 언어를 추가하지 않았다(j5·`enraged` 키 미추가)
- 심연은 **Profile 데이터 + 고유 DOM/CSS**만으로 등록됐다 → **F5/F6 계약이 비인간형까지 수용함이 입증**

## 18. companion context

F6가 만든 **`.sb-fig-stage` 공통 문맥을 그대로 재사용**했다. Profile에 `contextClass:'sb-boss-thirst'`를 등록하자 아바타 숨김·동료 figure 표시·파티 배치·hit FX·모바일 fallback이 **자동 적용**됐다 — 심연 전용 파티 CSS **복제 0**(check f1).

실측: 파티 좌표가 **3보스 완전 동일**(war 40,271 / rog 124,291 / mage 208,291 / sham 292,277 · allies bottom 20 gap 26) · 보스-파티 **겹침 0**(보스 하단 193 < 파티 상단 271).

## 19. anchor mapping

**등록 0 · `anchors:[]`.**
근거: `A.boss` 소비자 2곳(`fxBossLine`=smash 필요 / `fxIntLine`=judge 필요)이 **심연에선 영구 OFF**다. 즉 심연은 boss origin을 **쓰지 않는다** → 발주 §14 "사용하지 않는 anchor를 선등록하지 않는다"에 따라 등록하지 않았다. `stage.anchors()` 목록도 **불변**.

**legacy avatar 숨김 후 FX 단절 0**: 끊길 FX가 애초에 없다(check g2). `resolveActiveBossAnchor('avatar')`는 null → legacy 폴백 → 숨김 아바타 → null → `A.boss=null` → 두 선 모두 이미 off이므로 **동작 동일**.

F8이 [39] D-3의 "파티 전체에 얇은 갈증선"을 그릴 때 그때 최소 등록한다.

## 20. 기존 FX 연결

**연결할 것이 없었다.** drain 표현은 `FX('aoe')` → `SFX.aoe(); shake(); vign()`으로 **화면 레벨**이며 보스 anchor를 쓰지 않는다. 따라서 figure 도입으로 영향 0 — timing·크기·색·결과 전부 무변경(check g3). 신규 drain FX/갈증선/흡수 flash/cast decal **0**(g4).

## 21. lifecycle

| 경계 | 동작 |
|---|---|
| context inactive | contextClass OFF · figure display:none · `clearBossFigure`가 `data-face=''` |
| battle active / default ambient | pose `''` · face `''` · CSS ambient만 |
| drain 즉발 | figure 무반응(진리 — 예고도 반응도 없다) · 기존 화면 FX만 |
| enrage(t=56) | **figure 무변**(pose 미연결 — §12 보고) · 기존 로그/shake 유지 |
| boss defeat / battle end | truth대로 default 유지 |
| boss switch / newGame | `sbStageContext()` 재동기화 + owner cleanup |

## 22. cleanup

boss switch/battle end/newGame 전부 F5/F6 규약 재사용 — **보스별 cleanup 함수 0**(check h1). 실측: 심연→파쇄자 전환 시 심연 figure display:none·`data-face` ''·staleFaceCount 0·duplicateRoot 0. 반복 render 재생성 0(binder). ambient CSS는 context hidden이면 figure가 `display:none`이라 **시각 영향 0**(h2). 상시 console log 0.

## 23. 기존 두 보스 회귀

**전수 diff 0 (두 보스 모두).** [67] §19와 동일 방법(transition/animation 정지 후 CSS 목표값 계측)으로 F6 릴리즈본 vs F7 비교:
- **파쇄자**: default/windup 2상태 × 10요소 × 8속성 + anchor 2종 + root/part count → **차이 0건**
- **모르가스**: default/judge 2상태 × 10요소 × 8속성 + anchor + root/part count → **차이 0건**

interrupt decal 소멸 경로(`fxToggle('fxAoe',aoe)`·`fxLn('fxIntLine',...)`) 원문 무변경(check i3) — 나라님이 F6에서 승인한 "판정 데칼이 차단 시 팟 하고 사라지는 감각"의 코드 경로 그대로.

## 24. gameplay equivalence (등가성)

F7은 render 하류이며 S/G에 쓰지 않는다(check j1) → **gameplay ON/OFF 등가**. 3보스 스모크 **51.4/1029 · 48.5/971 · 61.8/1236 불변** · CORE byte-identical(466/22,521/`6cad2ec2`) · drain 조건/시간/대상/수치 무변경 · 보스 HP/공격력·RNG 무변경.

## 25. 변경 파일

`index.html`(심연 색변수·figure CSS/ambient keyframes·markup·figure 배치·문맥 게이트 2곳 / ANCHOR 무변경 / ACTOR_REGISTRY `boss_abyss` / BOSS_STAGE_PROFILE `shell_thirst`) · `dev/thirst_abyss_figure_stage_runtime_01_check.js`(신규) · `docs/69`(본 문서) · `docs/98·99·102` · index live-pin 갱신(전 check) · 승계 6건(§26 아래 항목은 §59 보고 참조).

## 26. 비변경 영역

CORE · gameplay 수치/패턴/타이밍/RNG · **drain 조건·시간·대상·결과** · S.ev/drain 소비 · sgSnapshot · **파쇄자 전부** · **모르가스 전부** · 동료 pose rule·CSS · F4A support cue · F5/F6 generic 계약 · `sgPoseCond` 조건 키 · 파티 배치 · UI/HP/카드 · ANCHOR_REGISTRY(심연 미등록).

## 27. 검증 결과

신규 F7 check **54/54**(A Truth 6·B Profile 5·C Shell/Figure 6·D Non-Humanoid 5·E Pose/Face 7·F Companion 4·G Anchor/FX 6·H Cleanup 2·I 기존 보스 회귀 4·J Gameplay 5·K 회귀 4) · F6 51 · F5 48 · F4A 33 · F4 29 · F3 30 · F2 31 · F1 41 · Constitution 40 · **전체 39종 PASS** · baseline 36 · CORE byte-identical · JS syntax OK · git diff --check clean.

**★핵심 검증**: 실 전투 1236틱에서 `bossAction` **한 번도 없음**(즉발 실증) · pose/face 전 구간 default(가짜 tell 0) · 도적 침묵(judge 없음=truth 일치) · 두 보스 회귀 diff 0.

## 28. 390×844 결과

`documentOverflowX 0` · clipping 0 · HP/시전바/카드 가림 0 · **파티 겹침 0**(보스 하단 193 < 파티 상단 271) · 심연 fig 168×118 @ (103,75).

## 29. 캡처

pane 픽셀 스크린샷은 **frozen-tab 이슈로 타임아웃**([66]§19·[67]§24·[68]§26과 동일한 기존 환경 이슈·F7 결함 아님). 대체 = DOM/computed style/bounding rect/animation-duration/data attribute 전수 계측(§23·§28·§30). **시각 최종 사인오프는 나라님 폰**(§31).

## 30. DEV observation (관측)

`window.__seedHealer.stage` 읽기 전용: `bossProfiles()`(3종) · `bossShells()`(1종) · `bossProfile('shell_thirst')` · `resolveBossFace('shell_thirst',snap)` · **`bossFigure()`** → `{bossId, contextActive, actorId, shellId, pose, face, mappedParts, boundParts, missingParts, anchors, rootCount, duplicateRoot, staleFaceCount}` · `resolvePose('mage'|'rog',snap)` · `snapshot()`. production 수정/강제 accessor 0 · 상시 log 0 · debug UI 0.

**DEV 재현(실 truth)**: 심연 전투 진입 → `G.start()` → t=5/11/19/… 에서 로그 `🌊 심연이 마나를 삼킵니다`가 뜨지만 **figure는 예고도 반응도 하지 않는다**(즉발이므로) · `stage.bossFigure()`는 전 구간 `{pose:'', face:''}` · `stage.snapshot().bossAction`은 항상 `null`.

## 31. 나라님 Human Gate 질문

①파쇄자·모르가스와 완전히 다른 보스로 보이나 ②사람/로브형이 아니라 심연 자체처럼 보이나 ③얼굴이 없어도 중심과 성격이 읽히나 ④주변을 안으로 빨아들이는 느낌이 드나 ⑤느린 ambient가 살아 있으면서 과하지 않나 ⑥drain에 가짜 예고가 생긴 것처럼 오해되지 않나 ⑦동료와 보스가 겹치지 않나 ⑧마법사·주술사가 심연보다 주연이 되지 않나 ⑨작은 인형극 안에서 비인간형이 자연스럽나 ⑩다시 싸워보고 싶은 고유한 보스인가.

## 32. 남은 WATCH

- **W1 `enraged` pose 미연결(보고 사항)**: t=56의 `enraged`는 실재 지속 truth이고 §10상 pose 파생이 허용되나, 연결하려면 `sgPoseCond`에 `enraged` 조건 키 추가(=F2 generic 수정)가 필요해 §6에 따라 **HOLD·보고만** 했다. 현재 심연은 광폭화해도 figure가 변하지 않는다. 유키PD가 승인하면 최소 보완(조건 키 1개)으로 열 수 있다. **연쇄 사실**: 파쇄자/모르가스도 F5/F6에서 아바타를 숨긴 뒤 enrage 글로우(`#bossAvatar.enr`)를 잃었다 — enrage의 figure 표현은 **3보스 공통 공백**이며 한 카드로 함께 여는 것이 자연스럽다.
- **W2 마법사 상시 channel**: 심연은 cast가 없어 `bossActing:false`가 항상 참 → 마법사가 전투 내내 `channel`(1235/1236틱). F4 규칙상 **정상 truth**이고 규칙 변경은 금지 범위다. 토글이 없어 "슥슥" 대신 정적 자세로 고정되므로 오히려 조용하나, 나라님 실기에서 "마법사가 심연보다 주연인가"(§31 Q8) 확인 필요.
- **W3 `react` 층 미사용**: 심연은 반응 pose가 없어 shell의 `.sb-react` 층을 쓰지 않는다. 미사용은 표현 불가가 아니므로 새 shell 사유가 아니다(§7). F8에서 drain 반응을 준다면 이 층이 소비처가 된다.
- **W4 core 가독성**: core 34×34 · 중심 void 13×13. 390 실기에서 "얼굴 없어도 중심이 읽히나"(§31 Q3)는 나라님 판정 대상 — 작으면 CSS 상수 조정.
- **W5 sideL/sideR 첫 소비자**: F5가 어휘로만 두었던 슬롯을 처음 실사용했다. 다른 비대칭 보스가 없으므로 계약의 일반성은 아직 1례.

## 33. F7 FINAL PASS 조건

유키PD 기술 검수(F5/F6 무수정·literal 분기 0·drain 즉발 계약 준수·가짜 tell 0·두 보스 회귀 0·W1 판단) + **나라님 Phone Human Gate**(§31 10문항, 특히 ④빨아들이는 느낌·⑥가짜 예고 오해 없음) PASS → 루다 commit/push/release.

## 34. F8 Stage FX / Reaction Grammar 입력 계약

1. **enrage figure 표현**(W1) — 3보스 공통 공백. `sgPoseCond`에 `enraged` 조건 키 1개 추가(generic 최소 보완·보스 분기 0) → 각 보스 profile이 `poseRules`로 선언. 심연 `crave`(더 거세게 빨아들임)·파쇄자/모르가스도 각자.
2. **drain 결과 문법**([39] D-3): 파티 전체에 **얇은 갈증선** · 사제 주변 자원이 마르는 표현 · 절약 운영의 유지선. **★drain은 즉발이므로 결과 표현만 가능하고 예고는 영원히 ⛔.** 이때 심연에 `avatar`/`core` anchor 최소 등록(§19).
3. **낙인선 끊김↔이어짐**([39] D-1·모르가스) · 차단 성공/실패 반응.
4. 피격/그로기/처치 reaction — 순간 표현 참조 패턴은 [66] F4A(generation + animationend + Stage-only 안전망).
5. 원칙 불변: 기존 tell보다 강한 신규 FX ⛔ · gameplay timing 변경 ⛔.

## 35. F9 closeout 입력 계약

F9(PROVISIONAL 0 도달)가 확인할 것:
1. **3보스 전원 production figure 완료**(F5 파쇄자·F6 모르가스·F7 심연) → Boss Stage Profile 계약의 일반성 입증 완료
2. 남은 PROVISIONAL: `enraged` figure 표현(W1) · `react` 층 미사용(W3) · 순간 pose vocabulary(F4 이월: strike/release/dash 등) · sideL/sideR 일반성 1례(W5)
3. shell은 `sb_unit_v1` 1종이 3보스를 수용 — 새 shell이 필요해지는 조건을 문서로 고정
4. 각 카드의 WATCH 총정리 → 잔여 0 또는 명시적 이월 결정
5. [61] 로드맵 F1~F9 종결 선언 · 기준선/검증 계보 최종 색인
