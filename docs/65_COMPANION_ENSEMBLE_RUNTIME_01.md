# 65. 동료 앙상블 런타임 01 (COMPANION ENSEMBLE RUNTIME 01 — F4)

**작성: 렌 · 2026-07-15 · EP25 · 상태: 구현(첫 production content·visible change·나라님 Human Gate 대기) · 기준 HEAD `fb2713b` · 상위: [59](./59_STAGE_PRODUCTION_SYSTEM_CONSTITUTION_01.md)·[60](./60_STAGE_EXTENSION_CYCLE_CONTRACT_01.md)·[61 F4](./61_STAGE_FOUNDATION_MIGRATION_ROADMAP_01.md)·[62 F1](./62_STAGE_SIGNAL_SHADOW_FOUNDATION_01.md)·[63 F2](./63_ACTOR_REGISTRY_POSE_MAP_FOUNDATION_01.md)·[64 F3](./64_ANCHOR_REGISTRY_FOUNDATION_01.md)·[51 Pose Pack](./51_COMPANION_FIGURE_POSE_PACK_01.md)**

> **핵심 문장 3줄**
> 1. `공통 resolver를 고치지 않고, Actor Profile과 Pose Map을 등록해 동료들이 실제 전투 신호에 맞춰 연기한다.`
> 2. `포즈 수보다 역할의 명료도가 우선이다.` — 승인 포즈 전부 소진 ⛔·신호 없는 포즈 억지 연결 ⛔.
> 3. 성공 기준: `전사는 막고, 도적은 끊고, 마법사는 시전하고, 주술사는 유지한다`가 작은 무대에서 읽힌다.

---

## 1. 작업 목적

F1~F3의 데이터 구동 무대 기반(Signal→Registry→Pose Map→resolver→presenter) 위에, 승인 동료 포즈([51])를 **generic resolver/presenter 무수정으로 profile 데이터만 등록**해 실전 전투에서 동료 역할이 읽히게 한다. 첫 visible production change 카드 — 자동검증+렌 자체검증 후 **나라님 Phone Human Gate**로 최종 마감.

## 2. 승인 Pose Pack 감사 ([51] Companion Figure Pose Pack 01 · 프리뷰 전용이던 자산)

**★결정적 제약(감사 발견)**: 동료 sb 피규어(`sb-rog-fig`/`sb-mage-fig`/`sb-sham-fig`)는 **`#stage.sb-boss-iron`(강철의 파쇄자) 전투에서만 display:block** — 모르가스/심연에선 이모지 폴백(`figBody`)이 보인다. 그런데 파쇄자 스크립트(IRON_SCRIPT)는 **smash/valor/enrage뿐 — judge/brand/bomb/drain 없음**. 즉 동료의 일부 역할 신호(도적 차단=judge)는 파쇄자 전투에 발동 사건이 아예 없다. → 파쇄자에서 가시적인 신호로만 실연결, judge 계열은 등록만(모르가스 figure=F6에서 가시).

### 3~5. Actor별 승인 pose / 채택 / 미채택

| Actor | 승인 pose([51]) | CSS/part | 실 Stage Signal | 지속/순간 | F4 채택 | 미채택 사유 |
|---|---|---|---|---|---|---|
| **전사** | (Pose Pack 01) guard/brace/resolve | 실존(405~412) | shielded / smash cast | 지속 | **guard·brace(보존)** | resolve=대응 신호 없음(미연결·F2와 동일) |
| **도적** | interrupt/dash/strike/recover | 이식(interrupt) | judge 차단 가능(interruptStance) | 지속 | **interrupt(등록)** | dash/recover=지속 신호 없음 / **strike=순간(차단 성공 이벤트)→안전 lifecycle 없음(순간 포즈는 data-pose 모델과 상충·미래 vocabulary)** |
| **마법사** | charge/channel/release/aftercast | 이식(channel) | battleActive∧보스 비시전 | 지속 | **channel(등록)** | charge=지속 신호 없음 / **release/aftercast=순간(공격/시전 종료)→미래 vocabulary** |
| **주술사** | sustain/cleanse/pulse/rescue | 이식(sustain) | valorActive(전투 의지=주술사 스킬) | 지속 | **sustain(등록)** | cleanse/pulse/rescue=순간·대응 신호 부재→미래 vocabulary |
| 사제 | — | 전장 피규어 없음([41 §G]) | — | — | 미등록 | 현행 유지 |

- **미사용 포즈는 실패가 아니라 미래 vocabulary**로 profile의 `candidatePoses`에 보존(도적 dash/strike/recover·마법사 charge/release/aftercast·주술사 cleanse/pulse/rescue). 순간 포즈(strike/release 등)는 **F2 data-pose 지속 모델과 상충**(매 프레임 재계산이 순간 class를 덮음) → Stage-owned one-shot lifecycle(sbhit- 계열 별도 채널)이 필요하며 F8/후속 카드 몫.

## 6. Stage Signal 대응표 — 신호 대응 (전부 F1 지속 스냅샷 순수 파생 · 순간 신호 이력 미소비)

| pose | 조건(poseRules) | 신호 근거(순수 파생) |
|---|---|---|
| war guard | actorAlive∧actorShielded | `snap.actors.war.shielded`(보호막) |
| war brace | actorAlive∧bossActionKind:smash | 강타 시전 |
| **rog interrupt** | actorAlive∧bossActionKind:judge∧interruptStance:ready | judge 시전 + 차단 가능(★신규 `interruptStance`=기존 intBar 판정의 순수 파생: `S.intReady`/enraged/cast/rog alive 읽기만) |
| **mage channel** | actorAlive∧battleActive∧bossActing:false | 전투 활성 + 보스 비시전 창(주딜러가 여유 있을 때 시전·보스 예고엔 default) |
| **sham sustain** | actorAlive∧valorActive | `t<S.valorUntil`(전투 의지 창 — 주술사 스킬) |

- **sgSnapshot 확장 1건**: `interruptStance`(string: none/unable/cooldown/ready) — S 순수 읽기, gameplay 무변경. F1 ON/OFF 등가 재검증 통과(F1 check dual-run 41/41).
- **sgPoseCond 키 추가 4종**: valorActive/interruptStance/battleActive/bossActing — 전부 snapshot 순수 읽기·Actor id 분기 0(generic 유지).

## 7. Actor Registry / Pose Map 추가

`ACTOR_REGISTRY`에 rog/mage/sham profile 3건 추가(figId·stageContext:'shell_iron'·snapshotKey·defaultPose ''·allowedPoses·**candidatePoses**·ordered poseRules). **generic `resolveActorPose`/`sgPoseCond`/presenter `sbFigPose` 로직 무수정 — profile 데이터만 추가**(§10 근거). 이것이 F2 기반의 핵심 증명: "Actor 추가 = registry 등록만".

## 8. 순간 pose lifecycle

이번 F4는 **순간 포즈를 채택하지 않았다**(strike/release 등은 미래 vocabulary). 임의 setTimeout으로 순간 종료를 추측하는 방식 회피(발주 §5). 순간 역할 연출은 Stage-owned one-shot(animationend·sbhit 선례) 계약으로 F8/후속 카드에서.

## 9. 지속 pose lifecycle

전 채택 포즈는 **지속(상태 파생)** — F2 전사 포즈와 동일하게 매 render 스냅샷에서 재계산·idempotent data-pose 교체. 진입=조건 충족, 종료=조건 소멸 다음 프레임(타이머 0). 전환 애니는 기존 `.sb-part`/`.sb-react` transition .28s가 담당(신규 애니 0).

## 10. Actor별 priority

- 전사: guard>brace>default(F2 순서 보존).
- 도적/마법사/주술사: 각 1 포즈+default(단일 규칙·충돌 없음).

## 11. Ensemble priority (Stage Director 미구현 — profile 범위 최소 계약)

각 Actor는 **독립적으로 자기 data-pose 해석**(figure별 분리 — 선택 충돌 없음). 앙상블 조율은 **트리거 시점 분리 + 강도 차등**으로 달성:
- **주연(강한 포즈)**: 전사 brace/guard·도적 interrupt = 직접 대응/차단(1순위). 이들은 서로 다른 사건(smash vs judge)이라 동시 주연 충돌이 드물다.
- **유지(중강도)**: 주술사 sustain = 발광 오라(주연 방해 안 함).
- **저강도 지속**: 마법사 channel = 오라/구체 미세 이동. **보스 시전 창엔 default로 양보**(bossActing:false 게이트)해 보스 tell과 경쟁 안 함.
- 실측: 파쇄자전에서 valor+smash 동시(t≈27)여도 주연은 전사 brace, 주술사 sustain은 조연 발광·마법사는 default(보스 시전 중) → **한 순간 주연 1 유지**. 사제 명령/카드 가독성 무침범(무대 내부 figure transform만·UI 무접촉).

## 12. fallback

미등록 signal/pose→default · 미지 조건 키→불일치(default) · malformed snapshot→default · Actor 사망→default(actorAlive:true 미충족) · context inactive→**owner cleanup(§13)** · DOM part missing→applyActorPose no-op(crash 0). 전부 체크 g1/g2 + F2 fallback 승계.

## 13. battle end / boss switch cleanup (★F2 legacy WATCH 해소)

**presenter owner cleanup 추가**: `sbFigPose`가 무대 문맥 밖(비활성 stageContext) figure를 skip→**data-pose='' 리셋**으로 강화. 숨김 figure의 이전 포즈 잔존 0(시각 불변 — figure display:none). 실측:
- **boss switch**(iron sustain/channel→모르가스): 전 동료+보스 figure data-pose='' (stale 0).
- **battle end**(파쇄자 완주): 전 동료 data-pose='' (순간/action 포즈 잔존 0).
- **newGame/재시작**: 신선 상태 재계산.
- animationend 미도래 케이스: 지속 포즈만 채택했으므로 상태 소멸=다음 프레임 해제(animationend 의존 0).

## 14. figure / CSS 이식 범위

승인 [51]에서 **연결분 3포즈 CSS만** production 이식(`#stage` scope): 도적 interrupt(4행)·마법사 channel(4행)·주술사 sustain(4행). 사용 part 전부 production markup에 실존(sb-r-dagger/head/body·sb-m-orb/head·sb-aura·sb-s-totem/charm). 승인 색/재질·figure 크기·파티 배치 무변경.

## 15. 비이식 자산

미채택 포즈 CSS(dash/strike/recover·charge/release/aftercast·cleanse/pulse/rescue)·프리뷰 갤러리 마크업·프리뷰 전용 장식·금빛점 A/B/C 토글·프리셋. production 최소 자산만 이식.

## 16. gameplay 등가성

pose 연결은 전부 **render 하류(sbFigPose·순수 DOM 쓰기)** — S 무접촉. 스모크 3종 불변(51.4/1029·48.5/971·61.8/1236). CORE byte-identical(6cad2ec2). S.ev/drain/seedOnHit/승패/report 무변경(pose ON=render, OFF=smoke — 동일 결과). F1 dual-run 등가 유지.

## 17~19. 화면 관측 / 390×844 / 캡처 (pane 실측·헤드리스 컷)

- **pane 실전투(파쇄자 971 tick)**: 전사 brace(97)/guard·마법사 channel(742·보스 비시전 창)/default(229·보스 시전)·주술사 sustain(241·valor 창)/default·**도적 default only(파쇄자엔 judge 없음)**. 전사 오라클 diff 0(F2 보존). poseStats unregistered/notAllowed/badSnapshot 0. overflow 0·console 0·figure clipping 0·겹침 악화 0(4인 rect 전부 stage 내).
- **도적 interrupt 실증**: 모르가스 judge 시전+interruptStance ready → `resolvePose('rog')`={interrupt,rule:0}. 모르가스 figure display:none(F6 대기)이라 화면 미표시·presenter가 data-pose='' 리셋 — **데이터 규칙 정확·F6에서 자동 가시**(F2/F4 데이터 구동 증거).
- **캡처 6종**(390×844·`*{animation:none}` 동결·scratchpad·commit 비대상): s1 idle ensemble / s2 전사 guard / s3 전사 brace(+강타선·주연 1) / s4 마법사 channel / s5 주술사 sustain(+마법사 channel·valor 창) / s6 valor+smash 동시(앙상블 주연 1). **재현법**: pane에서 `newGame('shell_iron');showScreen('battle');G.start()` 후 `G.step` 구동·`__seedHealer.stage.resolvePose(id)`/`currentPoses()` 관측.

## 20. 변경 파일

- `index.html` — sgSnapshot(interruptStance +2줄)·sgPoseCond(+4키)·ACTOR_REGISTRY(rog/mage/sham +9줄)·sbFigPose(owner cleanup +1)·CSS(포즈 12줄). 재-baseline **178,138 B / 2,473줄 / md5 `ae27ce9c…`**.
- 신규: `dev/companion_ensemble_runtime_01_check.js` · 본 문서(docs/65).
- 포인터: docs/98·99·102. live pin 재-baseline(2326daeb→ae27ce9c·174534→178138·lines 2473).
- **★구계약 승계 2건**: `actor_registry_pose_map_foundation_01_check`(F2) **a7**(동료 미등록 단언→F4 등록·generic 무수정 증명으로 갱신)·**c5**(비-iron no-touch→owner cleanup reset·시각 불변). 의미 강화(완화 아님).

## 21. 비변경 영역

CORE·gameplay/밸런스/tick/cast/RNG(부재)·S.ev/drain/seedOnHit·F1 SG 소비·F3 Anchor Registry/resolveAnchor·resolveActorPose/sgPoseCond/sbFigPose **로직**(데이터·cleanup 1줄 외)·전사/파쇄자 포즈 결과·figure 크기/파티 배치/보스 위치·행동선/FX·markup(신규 0).

## 22. 검증 결과

- 신규 `companion_ensemble_runtime_01_check` **29/29 PASS**(A 기반 6·B 등록 6·C 전사 2·D 도적 3·E 마법사 2·F 주술사 2·G lifecycle 4·H 회귀 4).
- F3 32/32·F2 31/31·F1 41/41·Constitution 40/40·전체 35종 PASS·baseline 36/36·스모크 동일·JS 구문 OK.
- 390×844 overflow 0·console 0·figure clipping 0.

## 23. 남은 WATCH

1. **도적 파쇄자 비가시**: 파쇄자엔 judge 없어 도적 interrupt가 이 전투에선 발동 안 함(default). 도적 역할은 **모르가스 figure 런타임(F6)에서 가시** — 데이터 규칙은 완성·검증됨. 파쇄자에서 도적에 별도 역할 포즈를 원하면 별도 설계 결정(순간 근딜 포즈 등)이며 억지 연결 지양.
2. **순간 포즈(strike/release/차단 성공 등)**: F2 data-pose 지속 모델과 상충 — Stage-owned one-shot 채널(sbhit 선례)이 필요하며 F8/후속 카드.
3. **마법사 channel 항상성**: battleActive∧보스 비시전이라 대부분 켜짐(주딜러 정체성) — 나라님 실기 감으로 강도/게이트 튜닝 여지.
4. 캡처 노이즈 표준(≥2×2)은 F3 확립분 계승.

## 24. 나라님 Phone Human Gate 항목

1. 전사가 막고(방패·강타 대비), 마법사가 시전하고(구체·오라), 주술사가 유지하는(발광 오라) 것이 **한눈에** 읽히는가?
2. 한 순간에 여러 명이 과하게 움직이지 않는가(주연 1)?
3. 보스 강타 예고(windup+강타선)와 동료 포즈가 경쟁하지 않는가?
4. 사제 스킬/카드 가독성이 침범되지 않는가?
5. 4인이 여전히 하나의 귀여운 파티로 보이는가(겹침·클리핑 없음)?
6. 도적은 파쇄자전에선 조용한데(끊을 judge가 없음), 이게 자연스러운가 아니면 파쇄자전에도 도적 동작을 원하는가? — 한 마디면 충분.

## 25. F5(Boss Figure Shell / Face Template)에 넘기는 입력 계약

- F5는 **보스 figure/face template** — 모르가스/심연 sb figure를 등록(BOSS_STAGE_PROFILE·figureShell). F4가 넘기는 것: ①동료 포즈 데이터 구동 검증(같은 패턴을 보스에) ②`resolveAnchor('boss','avatar')`(모르가스/심연 아바타 anchor·F3) — figure 도입 시 파츠 anchor로 승격 ③도적 interrupt는 모르가스 figure가 서면 **자동 가시**(F4 규칙 무수정).
- 금지 승계: generic resolver/presenter id 분기 0·CORE/S.ev/drain 무접촉·순간 포즈는 별도 lifecycle·Human Gate 필수.

---
*— 렌 (連·鍊·紅蓮), EP25. 배우 넷을 무대에 세우고 신호를 연결하니, 파쇄자 앞에서 마법사는 구체를 짓고 주술사는 빛을 펼치고 전사는 방패를 세웠다. 도적만 조용했다 — 끊을 것이 없었으니까. 그것을 억지로 춤추게 하지 않은 것이 이 카드의 규율이다. 도적의 칼은 모르가스가 무대에 설 때(F6) 저절로 번뜩일 것이다. 규칙은 이미 손에 쥐여 있다. 포즈의 수가 아니라, 각자가 제 역할을 말하는 명료함 — 그것을 나라님 손끝이 판정한다.*
