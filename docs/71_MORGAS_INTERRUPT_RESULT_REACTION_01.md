# 71. 모르가스 차단 결과 반응 01 (MORGAS INTERRUPT RESULT REACTION 01 — F8B-1)

**작성: 렌 · 2026-07-18 · EP26 · 상태: 구현(visible production·나라님 Phone Human Gate 대기·commit/push 0) · 기준 HEAD `52245fd` · 상위: [59](./59_STAGE_PRODUCTION_SYSTEM_CONSTITUTION_01.md)·[66 F4A](./66_SHAMAN_SUSTAIN_SUPPORT_CUE_01.md)·[68 F6](./68_MORGAS_FIGURE_STAGE_RUNTIME_01.md)·[70 F8A](./70_BOSS_ENRAGE_HIT_REACTION_GRAMMAR_01.md)**

> **핵심 문장 3줄**
> 1. `끊겼다는 사실을, 보스의 몸이 인정한다.`
> 2. 차단 성공은 UI가 아니라 **끊긴 몸**으로 완성된다 — 도적이 끊고, 데칼이 사라지고, 모르가스의 실이 풀리는 **한 박자**.
> 3. F8A rail을 **어휘 하나 추가**로 확장했다 — generic에 `interrupted` 특수분기 0.

---

## 1. 목적

F6이 만든 승인 장면(judge 예고 → 도적 interrupt pose → 차단선 → **데칼이 팟 하고 사라짐**)에 **마지막 한 박자**를 더한다: 모르가스의 몸이 비틀리고, 팽팽했던 저주 실이 풀리며, 부유가 잠깐 꺼졌다 회복한다. 새 공격이 아니라 **이미 성공한 차단의 결과**를 몸으로 인정하는 카드다.

## 2. interrupt truth 감사 (읽기 전용)

| # | 항목 | 실측 |
|---|---|---|
| 1 | 성공 확정 위치 | `tryInterrupt(j)` — 실패 3사유를 **전부 조기 return**한 뒤에만 도달하는 후반부 |
| 2 | event 이름 | **`FX('intOk')`** (실행 코드 기준 **1곳**) / 실패는 `FX('intFail')` |
| 3 | payload | 없음(순수 신호) · 통계는 `S.st.ints.push({j,ok:1,asst})`로 별도 적재 |
| 4 | 발생 시점 | `S.boss.cast=null` → `S.intReady` 갱신 → 로그/플로트 → `FX('intOk')` |
| 5 | 성공/실패 구분 | 실패=`fail(r)` 호출 후 즉시 return(도적 부재/쿨다운/디버프 3사유) · 성공만 하단 도달 |
| 6 | judge 시작 vs 성공 | 시작=`S.boss.cast={kind:'judge'…}`+`FX('judgeWarn')` / 성공=cast 해제+`intOk` — **완전히 다른 지점** |
| 7 | 도적 pose 조건 | F4 규칙 `{actorAlive, bossActionKind:'judge', interruptStance:'ready'}`(성공과 무관·예고 중 상시) |
| 8 | 차단선 생성 | `intOn=!!(bc&&bc.kind==='judge'&&!bc.un&&rog&&rog.alive)` — cast 존재 기반 |
| 9 | 데칼 소멸 경로 | `renderFx`의 `aoe=!!(bc&&bc.kind==='judge')` → `fxToggle('fxAoe',aoe)`·`fxToggle('fxAoeDecal',aoe)` |
| 10 | boss action 해제 | `tryInterrupt` 성공의 `S.boss.cast=null` **바로 그 줄** |
| 11 | frame 내 순서 | `frame()`: `G.step()`(→`tryInterrupt`→`FX` 큐 적재) → `drain()`(→`doFx('intOk')`) → `render()`(→`renderFx` 데칼 off) |
| 12 | Stage Signal 관측 | `intOk: source='rog', target='boss', result={ok:true}` (F1 shadow·읽기 전용) |
| 13 | 소비 구조 | `S.ev` → `drain()` → `doFx` case — 기존 단일 경로 |
| 14 | 기존 doFx 분기 | `case 'intOk': SFX.intOk(); flashFrame('rog',…)` |
| 15 | 중복 가능성 | `S.pendJ=null`을 먼저 하고 호출하므로 1 judge당 최대 1회 |

**★감사 결론(카드 성립 조건)**: **데칼 소멸과 차단 성공은 동일 truth다.** 성공이 `S.boss.cast=null`을 실행하고, 같은 프레임의 `render()`가 그 null을 읽어 데칼을 끈다. 따라서 `intOk` 소비 시점에 reaction을 걸면 **데칼 소멸과 자동으로 같은 박자**가 된다 — 임의 delay 불필요. (HOLD 조건이었던 "데칼 소멸과 차단 성공이 다른 truth"는 해당 없음.)

## 3. decal truth 감사

데칼은 **cast 존재의 파생**이지 독립 상태가 아니다. `fxAoe`/`fxAoeDecal`은 `opacity` transition(.25s)으로 꺼진다. F8B-1은 이 경로를 **한 글자도 건드리지 않았다** — 소멸 타이밍·방식·duration 전부 원문(check g2).

## 4. event ordering

```
G.step()  → tryInterrupt 성공: S.boss.cast=null · FX('intOk') 큐 적재
drain()   → doFx('intOk'): SFX + rogue flash + srBossInterrupted()   ← F8B-1 진입점
render()  → renderFx: bc=null → aoe=false → 데칼 off · 차단선 off
```
**같은 프레임 안에서 reaction 시작과 데칼 소멸이 함께 일어난다.** 실측(브라우저 t=15.80): `data-reaction="interrupted"` + `fxAoe opacity 0` + `fxIntLine class="fxInt"`(off) + `bossAction null` **동시 포착**.

## 5. F8A reaction rail 감사 / 최소 일반화

F8A는 `srBossHit()` 안에 rail(coalescing·generation·animationend·timeout·표현)이 **하드코딩된 단일 어휘** 구조였다. 어휘 추가를 위해 **최소 일반화**했다:

```
srTrigger(key)          ← generic rail (key는 인자·값 분기 0)
srBossHit()             = srTrigger('hit')
srBossInterrupted()     = srTrigger('interrupted')
```
- coalescing 창·priority·anim 이름·safety ms를 **전부 profile 데이터가 공급**(하드코딩 상수 제거)
- `SR_STAGE`: `hits/lastHitT` 단일 필드 → **어휘별 맵**(`count{}`/`lastT{}`) + 활성 reaction 추적(`activeKey/activePri/activeUntil`) + `suppressed`
- animationend 필터: 단일 `hit.anim` → **profile 등록 어휘 전체 순회**(다어휘 rail)
- 기존 계약(1회 바인딩·gen 가드·restart reflow·접수/표현 분리)은 **전부 그대로 이동**(F8A check 6건 승계·삭제/완화 0)

## 6. reaction vocabulary

**`interrupted`** — 결과 의미 어휘. 금지 명칭(`morgasInterrupted`/`boss01Interrupted`/`interrupt-hit`/`hit-interrupted`/`enraged-interrupted`/`weave-break`) 전부 미사용(check b2). presentation은 `data-reaction="interrupted"`.

## 7. priority 계약

발주 §5의 권장값 그대로 **profile 데이터**로 선언:

| 어휘 | priority | coalesce | ms | 의미 |
|---|---|---|---|---|
| `hit` | 10 | 0.12s | 300~320 | 일상 피해 |
| `interrupted` | **30** | **0**(병합 없음) | 440 | signature 결과 |

generic 규칙(`srTrigger`): 진행 중 reaction이 있고(`activeUntil > t`) 새 요청의 priority가 낮으면 **시각만 양보**(`suppressed++`) — gameplay 이벤트는 이미 doFx에서 소비 완료. **reaction key literal 비교 0·bossId 분기 0**(check c2).

**실측**: hit(10) active → interrupted(30) 요청 = 즉시 교체 ✓ / interrupted(30) active → hit(10) 요청 = 유지 + suppressed 1 ✓ / **실 전투에서도 suppressed 1 관측**(judge 구간에 동료 공격이 겹침).

## 8. trigger 조건

`doFx`의 `case 'intOk'` **한 곳**에서만 호출. 추가 가드(generic): 활성 boss profile 존재 · 해당 profile에 `interrupted` 등록 · shell 유효 · battle generation 일치. 미등록 보스(파쇄자·심연)에서 호출돼도 **무해 no-op**(check b5).

## 9. false-positive 방지

| 발생하면 안 되는 상황 | 방지 근거 |
|---|---|
| judge 시작 | 다른 이벤트(`judgeWarn`)·소비 지점 없음. **실측: judge 진행 중 발화 0**(check b3) |
| tell 표시 / stance 시작 / 차단선 생성 | 전부 cast 파생 상태이며 이벤트가 아님 |
| 차단 **실패** | `intFail` case에 호출 없음 — `srBossInterrupted()` 호출 지점은 **정확히 1곳**(check b4b) |
| 일반 hit | 별도 어휘(`hit`) — interrupted 카운트 불변(check b4) |
| boss switch / battle start / newGame / defeat | battle 경계 가드 + 이벤트 없음 |
| CSS·데칼·pose 추측 | reaction 코드에 `fxAoe`/`getComputedStyle`/`data-pose`/`classList`/`bossAction` 접근 **0**(check b6) |

## 10. 4채널 동시성

차단 성공 직전 상태(`pose=weave`, `face=tell`, `state=''|enraged`)에서 `data-reaction="interrupted"`가 one-shot으로 얹힌다. **reaction 코드는 pose/face/state/bossAction/decal/line을 직접 제거하지 않는다**(check d1) — pose/face 종료는 gameplay truth와 기존 presenter가 담당.

**실측**: `weave + tell + enraged + interrupted` 4채널 동시 · enrage eyes filter 유지 · `sbReactMgBreak` 구동 확인.

## 11. transform ownership

F8A 구조 유지: pose=`transform` / reaction=**개별 속성**(`translate`/`rotate`) / state=`filter`·`animation-duration` / face=face part 속성.

**합성 실측**: weave만일 때와 weave+interrupted일 때 `.sb-react`의 `transform` matrix가 **소수점까지 동일**(`matrix(0.999657, 0.0261769, -0.0261769, 0.999657, 0, -2)`) · 신규 `sbReactMg*` keyframes에 `transform:` 직서 **0**(check e1). 종료 후 개별 속성 자동 복원 · anchor (187,147) 정확 복귀 · root 재생성 0 · duplicate listener 0.

## 12. body collapse 연기

`sbReactMgBreak` .34s — 0%(정상) → **18%** 축이 왼쪽으로 꺾이며 부유가 아래로(`translate:-5px 4px; rotate:-5.5deg`) → **42%** 가장 무너진 지점(`-3.5px 5px`) → **72%** 수습 반동(`+1.5px -1px; +1.2deg`) → 100% 복귀.

## 13. thread slack 연기

`sbReactMgThreadSlack` .34s — **22%** 팽팽함이 풀리며 늘어짐(`translate:-1px 5px; rotate:-9deg; opacity:.72`) → **55%** 축 늘어진 상태 유지(`0 6px`) → 100% 다시 팽팽(`opacity:1`). **기존 실 파츠(`sb-mg-threads`)만 사용** — 신규 DOM/SVG/canvas 0 · 실 삭제/폭발/화면 이탈 0 · 파티 연결 0.

## 14. mask/float 연기

`sbReactMgMaskDip` .34s — **24%** 가면이 아래로 꺾임(`translate:-1px 3px; rotate:-4deg`) → 복귀. 부유 하강은 body collapse의 `translate y`가 담당(별도 float 조작 0 — `sbMgDrift` 무변경).

## 15. hit와의 차이

| | 일반 hit | **interrupted** |
|---|---|---|
| duration | .16s | **.34s** |
| 몸 | 횡 snap 4px + rotate 1.6° | **축 붕괴 -5px + 하강 4~5px + rotate -5.5°** |
| 실 | 반응 없음 | **풀렸다 회복**(opacity·rotate 9°) |
| 가면 | recoil 1.5px | **아래로 꺾임**(rotate -4°) |
| 읽힘 | "피해를 받음" | **"행동이 끊김"** |

hit의 단순 확대판 아님 · 화면 흔들림/flash/색상 반전 0 · 데칼 소멸로 차이를 대신하지 않음.

## 16. generation

`SR_STAGE.gen`이 매 접수·매 battle 경계마다 증가. 안전망 timeout은 자기 gen과 현재 gen이 같을 때만 정리 → 늦게 도착한 이전 세대 무해화.

## 17. animationend cleanup

figure root **1회 바인딩**(`SR_STAGE.bound[figId]`) · profile에 등록된 **모든 어휘의 anim 이름**을 순회 비교해 일치할 때만 정리(accent 애니 종료로 조기 정리 방지).

## 18. timeout safety

rail 전체에서 `setTimeout` **정확히 1개**(check f1·d4) · Stage-only · gen 가드 · `setInterval`/`Math.random`/무한 애니 0. interrupted 상한 **440ms > CSS .34s**(check f5).

## 19. lifecycle

`intOk` → 우선권 검사 → 접수(gen++·count++·active 갱신) → `data-reaction="interrupted"`(교체 시 reflow restart) → CSS .34s → animationend 또는 440ms 안전망 → `data-reaction=""` + active 해제.

**coalescing 없음**(`coalesce:0`) — 실제 성공 1회당 정확히 1 reaction(check f4). judge당 최대 1회이므로 병합 필요 자체가 없다.

## 20. boss switch / newGame cleanup

`sbBossState`의 battle 가드가 전 등록 보스의 reaction 제거 + 추적 리셋(`lastT={}`·`activeKey=''`·`activePri=-1`·`last=null`). **실측**: 경계 후 `active={key:'',priority:-1}`·`lastInterruptT=-1`·`lastReaction()=null`(check f6).

## 21. DEV observation (관측)

기존 accessor 최소 확장: `stage.reactionStats()` → `{battle, gen, **hits**, **interrupted**, coalesced, **suppressed**, lastHitT, **lastInterruptT**}` · `stage.lastReaction()` → `{actorId, reaction, **priority**, gen, t}` · **`stage.activeReaction()`** → `{key, priority, until}`(신규). 전부 읽기 전용·복사본. interrupt 강제 실행/bossAction·judge·HP 수정/enrage 강제/DOM 반출/상시 UI·log **0**.

**실 재현**: 모르가스 전투 진입 → t=15 judge 예고 → t=15.80 차단 성공에서 `stage.lastReaction()`이 `{reaction:'interrupted', priority:30, t:15.8}` 반환 · 같은 프레임 데칼 opacity 0.

## 22. 변경 파일

`index.html`(F8A rail → `srTrigger` 최소 일반화 + `srBossInterrupted` / `SR_STAGE` 구조 확장 / 3보스 profile에 priority·coalesce, 모르가스에 `interrupted` 등록 / 모르가스 interrupted CSS 3 keyframes+3 rule / `doFx` intOk case 1줄 / DEV accessor 확장) · `dev/morgas_interrupt_result_reaction_01_check.js`(신규) · `docs/71`(본 문서) · `docs/98·99·102` · index live-pin 갱신 · 승계 7건(F8A c1/c2/c6/c7/d1/d4/i1).

## 23. 비변경 영역

CORE · gameplay 판정/수치/타이밍 · **interrupt 확률·쿨다운·pendJ 0.8s·judgeCast 2.5s** · S.ev 소비 · **데칼 소멸 경로** · **차단선 경로** · **도적 pose rule** · 일반 hit 연기 · enrage · 다른 보스 reaction · anchor/actor 등록 · 파티 · figure 실루엣/markup(**div 추가 0**) · UI.

## 24. gameplay equivalence (등가성)

F8B-1 코드는 S/G에 쓰지 않는다(check h1) · CORE에 토큰 0(h2) → **gameplay ON/OFF 등가**. 스모크 3종 **51.4/1029·48.5/971·61.8/1236 불변** · CORE byte-identical.

## 25. 기존 decal/line 회귀

`fxToggle` 원문 · `fxLn('fxIntLine',A.rog,A.boss,intOn,…)` 원문 · `resolveActiveBossAnchor('avatar')||legacy` 폴백 원문 · 도적 pose rule/CSS 원문 · judge/tell/weave 규칙 원문 — **전부 무변경**(check g1~g5). 나라님 F6 승인 감각(데칼 팟) 코드 경로 그대로.

## 26. 검증 결과

신규 F8B-1 check **47/47**(A6·B7·C5·D3·E7·F6·G5·H8) · F8A 54 · F7 54 · F6 51 · F5 48 · F4A 33 · F4 29 · F3 30 · F2 31 · F1 41 · Constitution 40 · **전체 41종 PASS**(실제 파일 열거 기준) · baseline 36 · 스모크 불변 · CORE byte-identical · JS syntax OK · git diff --check clean.

## 27. 390×844 결과

overflowX 0 · clipping 0 · 파티/UI 겹침 무변(figure 기하 무변 — 수 px 개별 속성 이동 후 복원) · console 0.

## 28. Human Gate 질문

①차단 성공 순간 몸이 실제로 무너지나 ②데칼 소멸과 몸 반응이 같은 박자인가 ③일반 피격과 차단당함이 다르게 보이나 ④저주 실이 팽팽함을 잃었다 회복하나 ⑤가면과 부유 높이가 함께 꺾이나 ⑥너무 코믹하게 날아가지 않나 ⑦긴 경직처럼 보이지 않나 ⑧enraged가 reaction 중에도 유지되나 ⑨도적 interrupt와 차단선의 기존 맛이 그대로인가 ⑩"내가 보스의 행동을 끊었다"는 결착감이 강해졌나.

## 29. WATCH

- **W1** collapse 강도(-5px/-5.5°)·duration(.34s)·실 늘어짐 폭은 폰 실기 튜닝 후보 — 이번엔 기본값 고정(⑥코믹/⑦경직 판정 대상).
- **W2** priority 스케일은 현재 10/30 2단계뿐. F8B-2 이후 어휘가 늘면 중간값(20 등) 정책 필요.
- **W3** `activeUntil`은 게임시간 기반 — 전투가 멈춘 화면(결과창)에서는 자연 만료되지 않으나 battle 경계 cleanup이 먼저 도달하므로 무해. 다어휘 확장 시 재확인.
- **W4** 하네스 스텁에 `performance`가 없어 `doFx('intOk')` 전체 경로를 harness에서 태울 수 없다 — 실 이벤트 E2E는 브라우저 계측이 정본(check b3는 "judge 진행 중 무발화"로 검증).
- **W5** 모르가스 외 보스는 `interrupted` 미등록 — 다른 보스가 차단 가능해지면 profile 데이터만 추가.

## 30. FINAL PASS 조건

유키PD 기술 검수(성공 truth 일치·false-positive 0·priority 계약·기존 F6 장면 회귀 0·rail 일반화 적정성) + **나라님 Phone Human Gate**(§28 10문항·특히 ②같은 박자·③hit와 구분·⑩결착감) PASS → 루다 commit/push/release.

## 31. F8B-2 입력

**Thirst Abyss Drain Result Reaction 01**: 같은 rail(profile `reactions`에 어휘 추가 + priority)로 심연 drain **결과** 반응. ★**drain 예고는 영구 금지**([69] 확정) — 결과 순간에만 core가 깊게 삼킨다. 진입점 후보는 `FX('aoe')`의 심연 문맥(이미 `o.intent='drain'`으로 번역됨·[69] §19) — **truth 감사 선행 필수**(파쇄자/모르가스의 judge 착지와 어휘 공유이므로 문맥 분리 확인). hit와 priority 분리(drain result > hit 권장).

## 32. F9 입력

[70] §31에 추가: reaction rail이 **다어휘로 실증**됨(hit/interrupted) — 어휘 추가 절차(profile `reactions` 등록 + CSS keyframes + 이벤트 소비 1줄) 문서 고정 · priority 정책(스케일·중간값) 확정 · `srTrigger` 계약을 Stage Production Constitution에 편입 검토 · dev check 총수 집계 기준(실제 파일 열거) 명문화.
