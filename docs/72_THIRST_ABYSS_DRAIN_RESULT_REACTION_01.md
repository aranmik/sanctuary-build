# 72. 갈증의 심연 흡수 결과 반응 01 (THIRST ABYSS DRAIN RESULT REACTION 01 — F8B-2)

**작성: 렌 · 2026-07-18 · EP26 · 상태: 구현(visible production·나라님 Phone Human Gate 대기·commit/push 0) · 기준 HEAD `8493454` · 상위: [59](./59_STAGE_PRODUCTION_SYSTEM_CONSTITUTION_01.md)·[69 F7](./69_THIRST_ABYSS_FIGURE_STAGE_RUNTIME_01.md)·[70 F8A](./70_BOSS_ENRAGE_HIT_REACTION_GRAMMAR_01.md)·[71 F8B-1](./71_MORGAS_INTERRUPT_RESULT_REACTION_01.md)**

> **핵심 문장 3줄**
> 1. `빼앗긴 순간, 공허가 한 번 더 깊어진다.`
> 2. **예고는 없고, 빼앗긴 순간에만 삼킨다** — drain은 끝까지 즉발이다([69] 확정 계약 불변).
> 3. `FX('aoe')`가 심연 drain과 모르가스 judge 착지에 **공유**되고 둘 다 CORE 안이라, 구분 metadata를 **profile(표현 계층)이 소유**하게 했다.

---

## 1. 목적

[69]가 만든 심연의 ambient(안으로 말리는 호흡)와 [70]의 hit(충격을 삼킴) 위에, **실제 drain 결과가 적용된 순간**에만 core가 깊게 닫히는 signature result reaction을 더한다. 새 공격도, 새 예고도 아니다 — 이미 빼앗긴 것을 몸이 삼켰다고 증명하는 카드다.

## 2. drain gameplay truth 감사 (읽기 전용)

| # | 항목 | 실측 |
|---|---|---|
| 1 | 실행 위치 | `fireScript`의 `case 'drain'`(CORE 내부) |
| 2 | SCRIPT 시점 | t=5·11·19·25·31·37·45·51·59·65·71 (**11회**) |
| 3 | MP 흡수 | `S.pri.mana=Math.max(0,S.pri.mana-burn)` (burn=62 / 광폭 95) |
| 4 | HP 피해 | `aliveAll().forEach(a=>dmg(a,d,'aoe'))` + `dmg(S.pri,d,'aoe')` (d=42 / 광폭 64) |
| 5 | 광폭 전후 | `enDrain 95`·`enDrainDmg 64` — **무변경** |
| 6 | 대상 범위 | 파티 전원 + 사제 |
| 7 | 적용 순서 | 마나 차감 → 통계(manaMin·oomT) → 전원 피해 → 사제 피해 → aoes 적재 → 로그 → **`FX('aoe')`** |
| 8 | defeat 가능 | 가능(`if(!S.over)` 가드가 사제 피해/적재를 보호) |
| 9 | 발행 이벤트 | **`FX('aoe')` 1회** (결과 적용이 전부 끝난 뒤) |
| 10 | 횟수 | drain 1회당 정확히 1 이벤트(case 안에 `FX(` 호출 1개) |
| 11 | 동일 frame | HP·MP가 같은 `case` 안에서 함께 처리 → 이벤트도 그 뒤 1회 |
| 12 | bossAction | **전투 내내 null**([69] 실측 1236틱) |
| 13 | cast/tell/windup | **경로 자체가 없음** — `S.boss.cast=` 는 소스 전체 smash/judge 2곳뿐 |
| 14 | 초기화 | createGame이 새 S 생성 · battle 경계는 `SG.battle` 가드 |
| 15 | 소비 순서 | `step()`(결과+FX 적재) → `drain()`(doFx) → `render()` |

## 3. HP/MP 적용 순서

**마나가 먼저, 피해가 나중, 이벤트는 맨 끝.** 따라서 `FX('aoe')` 소비 시점엔 **HP·MP가 이미 모두 빠져 있다** → 발주 §7의 "결과 적용 뒤 같은 frame" 요구가 구조적으로 충족된다(사전 반응 불가능).

## 4. event truth 감사

| 항목 | 실측 |
|---|---|
| 이벤트 이름 | `aoe` |
| raw payload | **없음** — `FX('aoe')`는 인자 `d` 없이 호출(`FX=(k,d)=>E({y:'fx',k,d:d||{}})` → `d={}`) |
| raw `intent` | **없음** |
| Stage Signal `intent` | **있음** — `sgEv`가 `o.intent=(boss==='shell_thirst')?'drain':'judge'`로 파생([59] §5-A) |
| 어휘 공유 | **예** — 같은 `aoe`를 **모르가스 judge 착지**도 발행(`resolveBossCast`) |
| doFx 진입 | `case 'aoe': SFX.aoe(); shake(); vign();` |
| 중복 소비 | 없음 — `S.ev.splice(0)` 단일 경로, 이벤트당 doFx 1회 |

## 5. intent 구분 — 왜 §4의 "최소 보완"을 쓰지 않았나

발주 §4는 "raw FX payload에 read-only `intent:'drain'` 추가"를 조건부로 허용했다. **그러나 불가능했다**:

```
CORE 경계: 898 ~ 1365
drain의 FX('aoe')  : line 1205  → CORE 내부
judge의 FX('aoe')  : line 1243  → CORE 내부
```
payload 보강은 **CORE 수정**이 되고, 이는 §20 금지·§21 HOLD·정본 "byte-identical 유지 필수"에 정면 위배다. (check a6가 이 사실을 박제한다.)

**대안도 막혀 있다**: Stage Signal의 `intent`는 신뢰할 수 있지만 그 파생 근거가 `boss==='shell_thirst'`, 즉 **bossId**다. 이를 trigger 판정에 쓰면 §21의 "bossId로 drain 추측"에 해당한다.

**채택한 해법 — presentation metadata를 profile이 소유한다.**
CORE의 이벤트 payload를 건드리는 대신, **"이 표현 이벤트가 나에게 무슨 결과인가"를 boss profile이 선언**한다:
```
shell_thirst: reactionEvents:{aoe:'drain'}
boss01      : (미선언)
shell_iron  : (미선언)
```
generic `srEventReaction(evKey)`는 활성 profile에게 매핑을 **조회만** 한다 — bossId 분기 0·이벤트 의미 추측 0·SCRIPT 시간 감시 0·CSS/DOM 읽기 0(check b1).

**결과**: 모르가스 judge 착지 aoe → 모르가스 profile에 `reactionEvents` 없음 → **무해 no-op**(check b3 실측). 심연 aoe만 drain 발화(b5). 구분은 **추측이 아니라 선언**이다.

## 6. 다른 aoe와의 차이 (event distinction)

**distinction 근거는 추측이 아니라 profile 선언 1곳이다.**

| | 심연 drain | 모르가스 judge 착지 |
|---|---|---|
| 이벤트 | `aoe` | `aoe`(동일) |
| 발생 지점 | `case 'drain'` | `resolveBossCast` |
| 활성 profile | shell_thirst | boss01 |
| `reactionEvents.aoe` | `'drain'` | **미선언** |
| reaction | drain 발화 | **0** |

## 7. trigger source

**기존 표현 이벤트 `aoe`**(신규 이벤트 생성 0) + **profile 매핑**. 발주 §4 우선순위 1(raw intent)은 부재, 2(Stage Signal intent)는 bossId 파생이라 회피, 보완(payload)은 CORE라 불가 → **profile 소유 매핑**이 세 제약을 모두 만족하는 유일한 경로였다.

## 8. trigger timing

`case 'aoe': SFX.aoe(); shake(); vign(); srEventReaction('aoe');` — **기존 screen FX 뒤, 같은 frame**(check c1이 순서까지 검증). 임의 delay 0·타이머 0·다음 frame 지연 0.

**실측**: 실 전투 t=5.05에서 마나 **62** 감소·파티 HP **168** 감소와 **같은 프레임**에 `data-reaction="drain"` + `sbReactAbDrain` 구동 + `bossAction null` 동시 포착.

## 9. false-positive 방지

| 금지 상황 | 방지 근거 |
|---|---|
| judge aoe | profile 미선언 → no-op (**실측 0**) |
| 파쇄자/미지 이벤트 키 | 미선언 → no-op (check b4) |
| drain 이전 | 이벤트가 결과 적용 **뒤에만** 발행 → 사전 발화 구조적 불가 |
| bossId·SCRIPT 시간 추측 | `srEventReaction` 본문에 bossId·`S.t`·SCRIPT 참조 **0** |
| CSS/DOM 상태 추측 | `getComputedStyle`·`classList` **0** |
| 이중 소비 | `S.ev.splice(0)` 단일 경로·이벤트당 doFx 1회·`coalesce:0`이지만 drain 간격(≥6s)상 중복 원천 없음 |

## 10. reaction vocabulary

**`drain`** — 사건 의미 어휘. 금지 명칭(`abyssDrain`/`thirstDrain`/`boss_abyss_drain`/`drain-hit`/`enraged-drain`/`consume-drain`) 전부 미사용(check e3). presentation은 `data-reaction="drain"`.

## 11. priority

| 어휘 | priority | coalesce | ms |
|---|---|---|---|
| `hit` | 10 | 0.12s | 320 |
| **`drain`** | **30** | **0**(병합 없음) | 460 |

generic은 숫자 비교만 — `reaction==='drain'` 특수분기 0·bossId 분기 0(check d2). **실측**: hit active 중 drain 요청 → 즉시 교체 ✓ / drain active 중 hit → 유지 + `suppressed` 1 ✓ (gameplay 피해는 doFx에서 이미 소비 완료 = 손실 0).

`interrupted`(모르가스 30)와 `drain`(심연 30)은 **서로 다른 profile**에 있어 충돌하지 않는다.

## 12. 4채널 동시성

drain 순간에도 `data-pose=""` / `data-face=""`(심연은 pose·face 어휘 자체가 없음·[69] 계약 유지) / `data-state`는 `enraged`면 유지 / `data-reaction`만 one-shot. reaction 코드가 pose·face·state·gameplay를 직접 수정하지 않는다(check e2).

## 13. core swallow 연기

`sbReactAbVoid` .34s — **`.sb-ab-core::before`(중심 공허) 전용**:
0% 정상 → **30%** 공허가 `scale 1.62`로 넓고 깊어지며 테두리 glow가 조여듦(`inset 0 0 3px 1px`) → 62% 완화 → 100% 복귀.

★이 파츠를 고른 이유: `.sb-ab-core` 본체는 base 애니(`sbAbCoreIn`)를 갖지만 **`::before`는 갖지 않는다** → animation 교체 점프 없이 core를 주연으로 세울 수 있는 유일한 지점.

## 14. aura/pool inward 연기

`.sb-aura`(base `sbAbDrawIn`)·`.sb-ab-pool`(base `sbAbPool`)은 **animation을 얹지 않고** transition 기반 개별 속성으로 당긴다:
```
transition: transform .28s ease, scale .2s ease-out   (base .sb-part 계약 보존 + 확장)
[data-reaction="drain"] → .sb-aura{scale:.9}  .sb-ab-pool{scale:.94 .96}
```
개별 `scale`은 base의 `transform`과 **네이티브 합성**되고, 해제 시 천천히 풀린다(반동 없음·§10 요구).

## 15. sideL/sideR 비대칭 연기

```
shardL: translate 7px 2px   (left:6   → 중심 +x)  · transition .15s
shardR: translate -6px 1px  (left:118 → 중심 -x)  · transition .23s
```
**부호가 반대 = 둘 다 중심으로**, 거리(7 vs 6)와 속도(.15s vs .23s)가 달라 비대칭이 유지된다(check f3·f4). base 애니(`sbAbShardL/R`, 5.2s/7.1s)는 계속 돌아 복합 리듬이 살아 있다.

## 16. hit와의 차이

| | hit | **drain** |
|---|---|---|
| duration | .18s | **.34s** |
| 주연 | `.sb-react` 전체 압축(`scale .958/.93`) | **중심 공허**(`::before` 1.62배) |
| root recoil | 깊음 | **얕음**(`.972/.968` — check g3가 부등식으로 검증) |
| 동반 파츠 | 없음 | **aura·pool·shardL·shardR·shadow** 전부 중심으로 |
| 읽힘 | 충격을 삼킴 | **생명력을 삼킴** |

## 17. ambient 공존 (이 카드의 최대 제약)

**전략**: base 애니를 가진 파츠에는 `animation`을 **얹지 않는다**(교체 시 시작/종료 2회 점프 = §21 HOLD "ambient 복귀 jump").
- base **없는** 파츠 → keyframes: `.sb-react`(sbReactAbDrain) · `.sb-ab-core::before`(sbReactAbVoid) · `.sb-shadow`(sbReactAbGround)
- base **있는** 파츠 → transition 개별 속성: `.sb-aura` · `.sb-ab-pool` · `.sb-ab-shardL` · `.sb-ab-shardR`

**실측 증명**(transition 0s 고정 계측): base 애니 이름이 before / during / after **전 구간 동일**(`sbAbCoreIn`·`sbAbDrawIn`·`sbAbPool`·`sbAbShardL`·`sbAbShardR`·`sbAbFloat`) · during에만 개별 속성 적용(aura .9 / pool .94 .96 / shardL +7px / shardR −6px) · after에 전부 `none` 복원 → **transform drift 0·duration stale 0·root 재생성 0**.

## 18. enraged 공존

enraged는 `animation-duration`을 덮어쓰지만(core 3.1s·aura 2.7s·shardL 3.9s), reaction은 **다른 속성**(개별 transform·`::before` 전용 애니)을 쓰므로 충돌하지 않는다.

**실측**: 광폭 중 drain에서 core base duration **3.1s 유지** + reaction `sbReactAbDrain` **0.34s 그대로** + aura scale .9 적용 + state `enraged` 유지 → 해제 후 4.4s 복원.

## 19. generation

`SR_STAGE.gen` 재사용 — 매 접수·매 battle 경계 증가. 안전망 timeout은 자기 gen == 현재 gen일 때만 정리.

## 20. animationend cleanup

figure root **1회 바인딩**(`SR_STAGE.bound[figId]`) · profile 등록 어휘 **전체 순회**로 anim 이름 비교 → `sbReactAbDrain` 종료 시 정리(`::before`/shadow의 accent 애니로는 조기 정리되지 않음).

## 21. timeout safety

rail 전체 `setTimeout` **정확히 1개**(check i1) · `srEventReaction`에 자체 timer/listener **0** · Stage-only · gen 가드 · setInterval·Math.random 0. drain 상한 **460ms > .34s**.

## 22. lifecycle

`aoe` 소비 → profile 매핑 조회 → 우선권 검사 → 접수(gen++·count.drain++·active 갱신) → `data-reaction="drain"`(교체 시 reflow restart) → CSS .34s + transition → animationend 또는 460ms → `data-reaction=""`. battle 경계/문맥 밖은 `sbBossState` 가드와 `clearActorPresence`가 정리(**실측** 경계 후 active 초기화·`lastDrainT=-1`·`lastReaction()=null`).

## 23. 기존 screen FX 경계

`SFX.aoe(); shake(); vign()` **원문·순서·강도 무변경** · `#fxAoe`/`#fxAoeDecal` 정의 무변경 · 마나 로그·`S.st.aoes` 적재 무변경 · 신규 full-screen layer **0**(check j1~j3). 이번 카드는 화면 효과를 더하지 않고 **보스 몸만** 연기한다.

## 24. 변경 파일

`index.html`(generic `srEventReaction` 1함수 / 심연 profile에 `drain` reaction + `reactionEvents` / 심연 drain CSS 3 keyframes + 3 animation rule + 4 transition rule + 4 target rule / `doFx` aoe case 1줄 / `reactionStats`에 drain·lastDrainT) · `dev/thirst_abyss_drain_result_reaction_01_check.js`(신규) · `docs/72`(본 문서) · `docs/98·99·102` · index live-pin 갱신 · 승계 1건(F7 g3).

## 25. 비변경 영역

**CORE(byte-identical)** · drain SCRIPT/수치/타이밍 · HP·MP 결과 · gameplay 이벤트(신규 생성 0) · bossAction(여전히 null) · cast/tell/windup(여전히 없음) · S.ev 소비 · **기존 screen FX 전부** · anchor/actor 등록 · 다른 보스 reaction · hit/interrupted 어휘 · enrage 규칙 · figure 실루엣/markup(**div 추가 0**) · 파티 · UI.

## 26. gameplay equivalence (등가성)

F8B-2 코드는 S/G에 쓰지 않고(check e2) CORE에 토큰 0(k1) → **gameplay ON/OFF 등가**. 스모크 3종 **51.4/1029·48.5/971·61.8/1236 불변** · CORE byte-identical.

## 27. 검증 결과

신규 F8B-2 check **51/51**(A6·B5·C3·D4·E4·F7·G3·H5·I5·J4·K5) · F8B-1 47 · F8A 54 · F7 54 · F6 51 · F5 48 · F4A 33 · F4 29 · F3 30 · F2 31 · F1 41 · Constitution 40 · **전체 42종 PASS**(실제 파일 열거) · baseline 36 · JS syntax OK · git diff --check clean.

## 28. 390×844 결과

overflowX 0 · clipping 0 · 파티/UI 겹침 무변(figure 기하 무변 — 수 px 개별 속성 이동 후 복원) · console 0.

## 29. DEV observation (관측)

`stage.reactionStats()` → `{battle, gen, hits, interrupted, **drain**, coalesced, suppressed, lastHitT, lastInterruptT, **lastDrainT**}` · `stage.lastReaction()` → `{actorId, reaction, priority, gen, t}` · `stage.activeReaction()` → `{key, priority, until}`. 전부 읽기 전용·복사본. drain 강제 실행/HP·MP 수정/bossAction 생성/enrage 강제/SCRIPT 시간 이동/DOM 반출/상시 UI·log **0**.

**실 재현**: 심연 전투 진입 → t=5·11·19… 에서 마나·HP가 빠지는 순간 `stage.lastReaction()`이 `{reaction:'drain', priority:30}` 반환 · `stage.reactionStats().drain` 증가 · `bossAction`은 계속 null.

## 30. Human Gate 질문

①drain 전에 가짜 예고가 전혀 없나 ②HP/MP가 빠지는 순간 core가 실제로 삼키나 ③기존 화면 drain FX와 몸 반응이 같은 사건으로 느껴지나 ④일반 피격과 drain이 다르게 보이나 ⑤core가 주연으로 읽히나 ⑥양옆 조각이 안으로 끌려가나 ⑦밖으로 터지거나 발사하는 것처럼 보이지 않나 ⑧광폭 상태에서도 과도한 tell처럼 보이지 않나 ⑨반복 drain이 산만하거나 피곤하지 않나 ⑩"내 생명력과 마나를 저 심연이 삼켰다"는 감각이 강해졌나.

## 31. WATCH

- **W1** 삼킴 강도(void 1.62·aura .9·shard 7/6px)·duration(.34s)은 폰 실기 튜닝 후보 — 특히 **11회 반복**이라 ⑨산만함 판정이 중요.
- **W2** transition 기반 파츠는 해제 후 되돌아오는 데 .15~.23s가 더 걸린다(총 체감 ~.5s) — 의도된 "천천히 풀림"이나 실기에서 늘어진다고 느껴지면 단축.
- **W3** `reactionEvents`는 현재 심연 1종·`aoe` 1키. F8B-3에서 파쇄자가 `blocked` 등을 쓰면 같은 구조로 확장(어휘 추가 절차 [71] §32 참조).
- **W4** [69] W2(마법사 상시 channel)는 여전히 유효 — drain reaction이 추가돼도 마법사 연기는 무변경.
- **W5** drain은 `coalesce:0`이지만 간격이 ≥6s라 병합 필요 자체가 없다. 미래에 drain 간격이 짧아지면 재검토.

## 32. FINAL PASS 조건

유키PD 기술 검수(drain truth 일치·**judge aoe 구분 실증**·CORE 무접촉·ambient 무손상·priority 계약·기존 screen FX 회귀 0) + **나라님 Phone Human Gate**(§30 10문항·특히 ①가짜 예고 0·③같은 사건·⑨산만하지 않음) PASS → 루다 commit/push/release.

## 33. F8B-3 입력

**Iron Crusher Block Impact Closure 01**: 실제 block/brace success truth 감사 선행(`sbhit-blk`/`sbhit-blkabs`/`sbhit-abs` 계보와 `SB_SM.blk` 판정 존재 — [55]·[57] 참조). 보스 몸과 **전사 몸** 양쪽에 결착이 필요하다면 rail의 **다중 Actor 확장** 필요성부터 감사(현재 rail은 활성 boss profile 단일 대상). 기존 smash line·guard/brace pose 재사용 · 신규 판정/수치 0 · full-screen FX보다 몸의 충돌 우선.

## 34. F9 입력

[71] §32에 추가:
- reaction rail이 **3어휘로 실증**됨(hit / interrupted / drain) — 어휘 추가 절차 문서 고정
- **`reactionEvents`(이벤트→어휘 매핑) 계약을 Constitution에 편입 검토** — CORE를 건드리지 않고 표현 이벤트를 구분하는 정본 패턴
- priority 정책: 현재 10(ordinary) / 30(signature) 2단계 — 어휘가 늘면 중간값 정책 확정
- **CORE 내부 이벤트의 payload 보강은 영구 불가**임을 명문화(F8B-2가 확인) → 모든 표현 metadata는 profile 계층이 소유
- dev check 총수 집계 기준(실제 파일 열거) 명문화
