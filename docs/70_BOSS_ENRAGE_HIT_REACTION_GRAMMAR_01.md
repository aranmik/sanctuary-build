# 70. 보스 광폭 & 피격 반응 문법 01 (BOSS ENRAGE & HIT REACTION GRAMMAR 01 — F8A)

**작성: 렌 · 2026-07-17 · EP26 · 상태: 구현(visible production·나라님 Phone Human Gate 대기·commit/push 0) · 기준 HEAD `f8786b7` · 상위: [59](./59_STAGE_PRODUCTION_SYSTEM_CONSTITUTION_01.md)·[62 F1](./62_STAGE_SIGNAL_SHADOW_FOUNDATION_01.md)·[63 F2](./63_ACTOR_REGISTRY_POSE_MAP_FOUNDATION_01.md)·[66 F4A](./66_SHAMAN_SUSTAIN_SUPPORT_CUE_01.md)·[67 F5](./67_BOSS_FIGURE_SHELL_FACE_TEMPLATE_01.md)·[68 F6](./68_MORGAS_FIGURE_STAGE_RUNTIME_01.md)·[69 F7](./69_THIRST_ABYSS_FIGURE_STAGE_RUNTIME_01.md)**

> **핵심 문장 3줄**
> 1. `숫자가 피해를 말하고, 몸이 충격을 증명한다.`
> 2. 행동하는 몸 위에 상태와 결과를 받은 몸을 겹친다 — 채널 4종(pose/face/**state**/**reaction**)은 공존하며 서로를 지우지 않는다.
> 3. 같은 generic rail 위에서: **파쇄자는 버티고, 모르가스는 꺾이고, 심연은 삼킨다.**

---

## 1. 작업 목적

무대 배우들이 행동(pose)·의도(face)·존재(ambient)는 갖췄지만, **공격을 받은 몸의 순간 반응**과 **광폭 상태의 지속 변화**가 비어 있었다([69] W1이 보고한 3보스 공통 공백 포함). F8A는 딱 두 문법만 연다: persistent state **`enraged`**(data-state)와 one-shot reaction **`hit`**(data-reaction). groggy/stun/defeat/interrupt·block·drain 결과/동료 반응은 전부 F8B 이월.

## 2. 작업 전 enrage truth 감사 (읽기 전용)

| # | 항목 | 실측 |
|---|---|---|
| 1 | 저장 위치 | `S.boss.enraged` — **쓰기 1곳**(`fireScript case 'enrage'`) |
| 2 | 시작 | SCRIPT 고정: 파쇄자 t=55 · 모르가스 t=60 · 심연 t=56 |
| 3 | 종료 | **없음** — 전투 내 true 유지(false 복귀 경로 0) |
| 4 | 3보스 공통 | **예** — 세 SCRIPT 모두 `e:'enrage'` 1회 |
| 5 | newGame | `createGame`이 `enraged:false`로 신선 생성 |
| 6 | battle end | truth 그대로 유지(over와 독립) |
| 7 | legacy 시각 | `#bossAvatar.enr` glow + `sC(ba,'enr',S.boss.enraged)` — **숨김 아바타에서 공전** |
| 8 | figure 전환 후 | F5~F7에서 아바타를 숨기며 enrage 표현 상실 = [69] W1의 공통 공백 |
| 9 | snapshot | **`enraged:S.boss.enraged` 이미 존재**(F1 pure field) → snapshot 확장 불필요 |
| 10 | sgPoseCond 기존 키 | bossActionKind·actorAlive·actorShielded·valorActive·interruptStance·battleActive·bossActing (7종·enraged 없음) |

## 3. 작업 전 hit truth 감사 (읽기 전용)

| # | 항목 | 실측 |
|---|---|---|
| 1 | HP 감소 경로 | **단일**: `S.boss.hp=Math.max(0,S.boss.hp-a.atk)` (동료 자동공격·CORE 1곳) |
| 2 | heal/재설정 | **없음** — 보스 회복 경로 0·재설정은 createGame뿐 |
| 3 | boss switch HP | newGame→새 S(이벤트 큐도 신선) |
| 4 | 초기화 | createGame `hp:B.hp` |
| 5 | multi-hit | 동일 tick 다수 동료 공격 가능 → 이벤트 다발 |
| 6 | DoT | 없음 |
| 7 | 이벤트 존재 | **HP 감소 직후 `FX('allyAtk',{tg})` 발화** — S.ev 경유 drain()→doFx 소비·SG shadow도 번역(`target:'boss'`) |
| 8 | 기존 hit FX | doFx `case 'allyAtk': bossHit(); pulseStage(d.tg);` — bossHit=legacy 아바타 플래시(350ms 벽시계 스로틀·figure 무대에선 공전) |
| 9 | HP delta 가능성 | 가능(단일 감소 경로·heal 0)이나 **불필요** — §7 우선순위 1(기존 read-only 이벤트)이 충족됨 |
| 10 | defeat 직전 마지막 hit | 이벤트가 큐에 남아 같은 frame drain에서 소비 → 킬 블로우도 반응 |

**채택**: **`FX('allyAtk')` 소비**(doFx case에 `srBossHit()` 1줄 추가·legacy 경로 보존). 초기화/스위치/heal 오인이 **구조적으로 0**(이벤트는 실제 타격에서만 발생) — HP 추측·로그 파싱·S.ev splice 신설 전부 불필요.

## 4. 작업 전 transform ownership 감사

| 계층 | 발주 §2의 이상 | **released 현실** |
|---|---|---|
| `.sb-react` | reaction 전용 | **pose가 `transform` 소유 중**(guard/brace/windup/weave/interrupt/channel/sustain 전부) |
| `.sb-fit` | layout 전용 | 미사용(transform none) |
| `.sb-fig` | ambient/기본 pose | ambient 애니메이션 소유(breathe/drift/float) |

**★충돌 해소(이 카드의 구조 결정)**: 요소를 옮기면 pivot 변화로 회귀가 나므로, **CSS 속성 채널로 소유를 분리**했다 — pose는 `transform` **속성**, reaction은 **개별 transform 속성(`translate`/`rotate`/`scale`)**. 같은 `.sb-react`에서 두 채널이 **네이티브 합성**된다(개별 속성 → transform 순서로 곱해짐). 실측 증명: windup 중 hit에서 `transform: matrix(0.99863,-0.052336,…)` (F5 기준선과 **소수점까지 동일**)가 유지된 채 `animationName: sbReactIron`이 동시 구동 · **sbReact\* keyframes에 `transform:` 직서 0**(check e1로 봉인). F4의 filter-only 선례([49] "방패 파츠는 filter만")를 transform 차원으로 확장한 것.

## 5. reaction/state/pose/face 경계

| 채널 | 질문 | 수명 | 소유 |
|---|---|---|---|
| `data-pose` | 지금 무엇을 하는가 | 지속(truth 파생) | F2 |
| `data-face` | 얼굴이 무엇을 드러내는가 | 지속(truth 파생) | F5 |
| **`data-state`** | 지속적으로 어떤 상태인가 | 지속(truth 파생) | **F8A** |
| **`data-reaction`** | 방금 어떤 결과를 받았는가 | one-shot | **F8A** |

4채널 동시 존재 실측: `windup + tell + enraged + hit` 공존 ✓. 조합 문자열(`enraged-hit`) 생성 0 · hit가 pose/face를 지우지 않음(속성 분리) · reaction 문자열의 gameplay 저장 0.

## 6. Stage Reaction Profile 계약

**기존 `BOSS_STAGE_PROFILE` 확장 채택**(별도 registry보다 경계 명확 — 보스 무대 계약의 단일 정본 유지):
```
defaultState:'', allowedStates:['enraged'], candidateStates:['groggy','defeated'],
stateRules:[{state:'enraged',when:{enraged:true}}],
reactions:{hit:{anim:'sbReactIron'|'sbReactMorgas'|'sbReactAbyss', ms:300|320}}
```
- `anim` = animationend 필터 정본(보스별 main 애니 이름·데이터로 공급→generic에 bossId 0)
- `ms` = Stage-only 안전망 상한(duration+여유)
- gameplay mutable state 0 · DOM node 저장 0 · timer handle 저장 0 · 등록 순서 의존 0 · prototype 키 안전(F5 self-key 검증 상속)

## 7. enrage persistent state

- 입력: **기존 snapshot pure field `enraged`**(확장 0) · `sgPoseCond`에 **`enraged` 조건 키 정확히 1개** 추가(발주 §5 명시 승인·bossId 분기 0·기존 키 7종 의미 무변).
- 평가: **`resolveActorState(profile,snap)`** — resolveBossFace와 동형(stateRules 평가·sgPoseCond 재사용·불허/미등록/bad-snapshot 안전 기본).
- 표현: **`presentActorState`** — data-state만 소유·idempotent. false→`""` / true→`"enraged"`.
- lifecycle: battle active 중 유지 · boss switch/newGame 시 제거(문맥 밖 `clearActorPresence` + battle 가드) · inactive stale 0 · defeat 후 truth와 일치(실측: 심연 t56~61.8 실 광폭 구간 `enraged` 유지).
- 실측: **심연 실 전투** t<56 전 구간 `''`(1000+ ticks) → t>56 `enraged` / 파쇄자·모르가스는 스모크가 enrage 도달 전 종료(48.5<55·51.4<60)라 합성 poke로 규칙 검증([65] d3 선례).

## 8. hit one-shot reaction

`srBossHit()` = doFx `allyAtk` 소비자. 흐름: 활성 boss profile 조회(미등록/미선언/미지 shell=무해 no-op) → coalescing 창 검사 → **접수**(hits++·gen++·lastReaction 기록 — 표현과 분리·DOM 부재에도 창 계약 유지) → figure에 `data-reaction="hit"` → CSS 애니 → animationend cleanup.

## 9. reaction generation

`SR_STAGE.gen` — 매 접수·매 battle 경계마다 증가. 안전망 timeout은 자기 gen과 현재 gen이 같을 때만 정리(늦게 도착한 이전 세대 timeout 무해화·F4A 패턴).

## 10. animationend cleanup

figure root에 **1회만 바인딩**(`SR_STAGE.bound[figId]` 가드 — 중복 listener 0) · 버블된 이벤트 중 **`e.animationName === profile.reactions.hit.anim`(main 애니)만** 정리 트리거(accent 애니 종료로 조기 정리 방지).

## 11. timeout safety

`setTimeout(…, hit.ms)` — **F8A 전체에서 setTimeout은 이 1개뿐**(check d4) · Stage-only(gameplay timer 아님) · gen 가드 · setInterval/Math.random/무한 애니 0.

## 12. microburst coalescing

**게임시간(S.t) 0.12s 창**(벽시계 아님 → frozen-tab 안전·결정론) · 같은 battle 한정. 같은 frame multi-hit는 drain이 이벤트를 연달아 소비해도 창이 1반응으로 병합 → "떨림 기계" 방지. 창 밖 재타격이 애니 진행 중이면 **restart**(attr 제거→reflow→재설정). gameplay 피해 횟수 무변(표현만 병합). 실측: 모르가스 실 전투 8초에 **hits 14 · coalesced 2**.

## 13. transform ownership (§4 해소 구조)

- reaction: `.sb-react`의 개별 속성 + **base 애니 없는 파츠만** accent(파쇄자 hammer·모르가스 head). base 애니 보유 파츠(core/threads/pool/shard/aura)는 **accent 금지**(animation 교체 깜빡임 방지·check e4).
- `.sb-fit` 무접촉 · `.sb-fig` ambient 무변경(enrage는 `animation-duration`만) · pose/face part transform 무변경.
- F8A CSS는 **pose 어휘 섹션보다 앞** 배치 → 속성 충돌 시 pose 우선(예: enraged threads 2.2s를 weave 1.4s가 덮음 — 판정 tell이 항상 이김·check e5).
- 종료 후: 개별 속성 자동 복원(fill 없음) · anchor 실측 (243.68, 102.58) 정확 복귀.

## 14. 3보스 enrage mapping

| 보스 | 감정 | 구현(filter/주기만·형태 무변) |
|---|---|---|
| 파쇄자 | 열이 오른 갑옷·꺼지지 않는 core | core brightness 1.42·body ember drop-shadow·aura 압축광·호흡 4.8→4.1s |
| 모르가스 | 판단이 광기로·눈과 실이 팽팽 | eyes brightness 1.6+보라 glow(**filter=tell의 box-shadow와 속성 분리**)·threads 3.4→2.2s·부유 5.2→4.2s |
| 심연 | 공허가 깊어짐·흡입 가속 | core 어두워짐(.9)+호흡 4.4→3.1s·오라 3.8→2.7s·shard 5.2/7.1→3.9/5.3s·pool .93 |

공통: `광폭화는 새 공격을 예고하는 것이 아니라, 현재 존재 방식이 더 위험해지는 상태다` — one-shot flash 아님·임의 timer 0·attack tell 오인 요소 0(심연 밖으로 폭발 0·brightness 상승 0).

## 15. 3보스 hit mapping

| 보스 | 한 문장 | keyframes(개별 속성만) |
|---|---|---|
| 파쇄자 | **버틴다** | react 후퇴 -3.5px(.18s) + hammer **반 박자 lag**(45%까지 정지 후 -2.5px) |
| 모르가스 | **꺾인다** | react 횡 snap 4px + rotate 1.6deg(.16s) + 가면 recoil 1.5px(실 완전 풀림 0=interrupt 오인 방지) |
| 심연 | **삼킨다** | react scale .958/.93 수축 + 1.6px 하강(.18s·origin 50% 92%=안으로 무너짐·outward 0) |

## 16. action pose 동시성

windup+hit: pose transform matrix **보존**(실측 F5 기준선 동일) + reaction 애니 동시 · weave+tell+enraged+hit 4중 공존 실측 ✓ · hit로 인한 pose 중단 0.

## 17. face 동시성

tell(box-shadow/transform) ↔ enraged eyes(filter) **속성 분리**로 동시 표현 · hit가 face 제거 0(별도 속성 채널).

## 18. anchor/action-line 회귀

anchor registry **확장 0** · 장기 cache/이전 frame 재사용/(0,0) 0 · reaction 중 anchor는 실제 figure를 따라감(프레임 실측) · 종료 후 정확 복원(실측). smash line·interrupt line·**decal pop**(`fxToggle('fxAoe',aoe)`·나라님 F6 승인 감각) 코드 경로 원문 무변경(check g3).

## 19. lifecycle

inactive→`clearActorPresence`(state+reaction 동시 제거) / battle active→state 매 render 순수 동기 / hit→접수·표현·animationend/timeout 정리 / boss switch·newGame→`SG.battle` 가드가 전 등록 보스 reaction 제거+추적 리셋(lastHitT −1·last null 실측) / battle end→state는 truth대로·reaction은 자체 종료.

## 20. cleanup

stale data-state/reaction 0 · stale owner/timer 0(gen 무효화) · duplicate listener 0(bound 가드) · duplicate root 0(DOM 생성 API 0) · 보스별 cleanup 함수 0(check i3) · 상시 log 0.

## 21. gameplay equivalence (등가성)

F8A 함수 S/G 쓰기 0(check j1) · CORE에 F8A 토큰 0(j2) → **gameplay ON/OFF 등가**. 스모크 3종 **51.4/1029·48.5/971·61.8/1236 불변** · CORE byte-identical · enrage/HP/RNG/S.ev/drain 무변경.

## 22. 변경 파일

`index.html`(F8A CSS 블록[state 3보스+reaction keyframes/rules] / sgPoseCond +1키 / 3 profile state·reaction 데이터 / F8A JS 블록[SR_STAGE·resolveActorState·presentActorState·srClearReaction·clearActorPresence·srBossHit·sbBossState·DEV accessor] / render +`sbBossState(S)` / doFx allyAtk +`srBossHit()`) · `dev/boss_enrage_hit_reaction_grammar_01_check.js`(신규) · `docs/70`(본 문서) · `docs/98·99·102` · index live-pin 갱신 · 승계 1건(F7 j5).

## 23. 비변경 영역

CORE · gameplay 수치/타이밍/RNG · enrage truth · S.ev/drain 소비 · sgSnapshot · 3보스 figure 형태/markup/배치(**div 추가 0**) · pose/face CSS 원문 · F4A cue · F5/F6/F7 generic · anchor registry · 파티 · legacy bossHit/enr 경로 · UI.

## 24. 검증 결과

신규 F8A check **54/54**(A6·B6·C7·D4·E5·F4·G4·H4·I5·J5·K4) · F7 54 · F6 51 · F5 48 · F4A 33 · F4 29 · F3 30 · F2 31 · F1 41 · Constitution 40 · **전체 41종 PASS** · baseline 36 · 스모크 불변 · CORE byte-identical · JS syntax OK · git diff --check clean.

## 25. 390×844 결과

overflowX 0 · clipping 0 · 파티/UI 겹침 무변(figure 기하 무변 — enrage=filter/주기·hit=수 px 개별 속성 순간 이동 후 복원).

## 26. DEV observation (관측)

`stage.bossState(id,snap)`(resolveActorState 결과) · `stage.reactionStats()`→`{battle,gen,hits,coalesced,lastHitT}` · `stage.lastReaction()`→`{actorId,reaction,gen,t}` 복사본. 강제 실행/HP 수정/enrage 강제/DOM 반출/상시 UI/log **0**. 실 재현: 아무 전투나 진입→동료가 때릴 때마다 figure가 반응(모르가스 8초 실측 hits 14)·심연 t=56 이후 `data-state="enraged"`.

## 27. Human Gate 질문

①광폭화가 세 보스 모두에게 보이나 ②같은 광폭이지만 보스별 연기가 다른가 ③광폭화가 새 공격 tell처럼 오해되지 않나 ④파쇄자는 맞을 때 무겁게 버티나 ⑤모르가스는 가늘게 꺾이나 ⑥심연은 충격을 안으로 삼키나 ⑦피격 반응이 너무 자주 떨리거나 산만하지 않나 ⑧action pose와 face가 hit 때문에 사라지지 않나 ⑨모르가스 interrupt 장면이 그대로 맛있나 ⑩전투가 "몸으로 주고받는 연극"처럼 보이나.

## 28. 남은 WATCH

- **W1** hit 강도 상수(px·deg·duration)는 폰 실기 튜닝 후보 — 이번엔 기본값 고정(다단히트 체감은 나라님 Q7 판정).
- **W2** enrage 주기 가속 수치(4.1/2.2/3.1s 등)도 실기 판정 대상 — "산만하지 않은가".
- **W3** coalescing 창 0.12s는 동료 공격 cadence(~0.5s 간격) 실측 기반 — 미래 다단히트 스킬 추가 시 재검토.
- **W4** CSS 개별 transform 속성은 모던 브라우저 전제(폰 Chrome/Safari OK) — 구형 브라우저에선 reaction만 조용히 무시(pose는 무손상).
- **W5** damage magnitude 구분 없음(발주 명시) — heavy hit는 F8B.

## 29. F8A FINAL PASS 조건

유키PD 기술 검수(truth 일치·generic 무분기·4채널 공존·기존 보스/decal/cue 회귀 0·transform 합성 구조) + **나라님 Phone Human Gate**(§27 10문항·특히 ②보스별 연기 차이·⑦산만하지 않음) PASS → 루다 commit/push/release.

## 30. F8B 입력 계약

reaction rail이 검증됐으므로 다음 signature 결과 반응을 같은 rail(profile `reactions` 확장+`data-reaction` 어휘 추가)로 연다: 모르가스 interrupt success(실이 풀리며 꺾임 — `intOk` 이벤트 실재) · 심연 drain result(core가 깊게 삼킴 — **결과만·예고 영원히 ⛔**) · 파쇄자 block/brace result(`sbhit-blk` 계보와 통합 검토) · groggy/defeat·heavy(magnitude) ·동료 hit. 각각 실 이벤트 truth 감사 선행.

## 31. F9 closeout 입력 계약

[69] §35에 추가: enrage 공통 공백 **해소됨**(W1 폐기) · 채널 4종 문법 완성 선언 · sgPoseCond 키 계보(7+1) 고정 · reaction rail(one-shot 어휘 등록 절차) 문서 고정 · 남은 PROVISIONAL 재집계(F8B 후보군·react 층 개별 속성 채널 선례).
