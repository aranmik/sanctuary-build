# 66. 주술사 유지 지원 큐 01 (SHAMAN SUSTAIN SUPPORT CUE 01 — F4A)

**작성: 렌 · 2026-07-16 · EP26 · 상태: 구현(visible change·나라님 Human Gate 대기·commit/push 0) · 기준 HEAD `a4ed493`(F4 RC) · 상위: [59](./59_STAGE_PRODUCTION_SYSTEM_CONSTITUTION_01.md)·[62 F1](./62_STAGE_SIGNAL_SHADOW_FOUNDATION_01.md)·[63 F2](./63_ACTOR_REGISTRY_POSE_MAP_FOUNDATION_01.md)·[64 F3](./64_ANCHOR_REGISTRY_FOUNDATION_01.md)·[65 F4](./65_COMPANION_ENSEMBLE_RUNTIME_01.md)**

> **핵심 문장 3줄**
> 1. `주술사가 빛을 내는 게 아니라, 파티 전체에 힘을 퍼뜨린다는 사실이 한눈에 읽히게 한다.`
> 2. 연출 리듬: `주술사에서 밝은 파동 한 번` → `각 영웅 머리 위 작은 푱!` → `이후 은은한 sustain`.
> 3. `시작은 명확하게, 유지는 조용하게.` — 전사 brace·보스 tell의 주연을 빼앗지 않는다.

---

## 1. 작업 목적

F4에서 주술사 `sustain` 포즈는 **기술적으로 발동하지만**(valorActive 창 동안 지속) 시각적으로 "파티 지원자"라는 역할이 읽히지 않았다(나라님 관찰: "움직임이 없다"). 이번 F4A는 **주술사 포즈를 더 키우는 게 아니라**, valor(전투 의지=주술사 스킬) 창이 **시작되는 순간** 파티 전체로 힘이 퍼지는 인상을 작은 무대에서 읽히게 하는 첫 Stage-owned one-shot cue 사례다. gameplay는 완전히 동일하고 표현층만 추가한다.

## 2. 나라님 Human Gate 피드백 (F4 실기)

- **마법사(channel)**: `오브를 양쪽으로 슥슥 하는 것이 귀엽다` → **PASS·현행 유지**(이번 카드 무접촉).
- **도적(interrupt)**: 파쇄자전에 judge 사건이 없어 미발동 = gameplay truth와 일치 → **가짜 행동 추가 금지·F6 모르가스 figure에서 확인**(이번 카드 무접촉).
- **주술사(sustain)**: 발동하나 역할이 안 읽힘 → 나라님 제안: `능력을 발휘할 때 밝은 빛의 파동이 발생하고, 각 영웅 머리 위에 푱! 하고 작은 빛 반응`. 유키PD 방향: 파티 전체에 좋은 기운을 퍼뜨리는 역할·마법사와 차별화·시작은 명확·유지는 은은·머리 위 반응 반복 spam 금지.

## 3. 기존 sustain 가독성 문제

`data-pose="sustain"`는 **지속 상태**라 매 프레임 동일하게 유지된다 → "시작"이라는 사건이 시각적으로 없다. 아우라 scale·부적 scale만으로는 "지금 무슨 일이 일어났다"가 안 읽힘. 필요한 것은 **경계(시작)의 one-shot 사건 표현** + **유지 구간의 은은한 차별화 리듬**.

## 4. support cue 설계 (3단 리듬)

- **A. Sustain Start (파동)**: valorActive false→true 경계에서 주술사 중심(`sham`/`body` anchor)에 **부드러운 지원 파동 1회**. 공격 shockwave가 아니라 support aura — 연한 청록(`--sb-s-glow`)+따뜻한 백색, 부드러운 외곽, 짧게 팽창 후 소멸. 화면 전체 flash ⛔.
- **B. Party Head Ping**: 전사/도적/마법사/주술사 **머리 위**(`head` anchor)에 작고 귀여운 반짝 `푱!` 1회씩. 매우 짧은 순차 간격(60ms)만·반복 spam ⛔.
- **C. Sustain Hold**: 파동·ping 종료 후 **주술사 부적만** 은은한 유지 맥동(2.6s 느린 pulse). 전사 brace보다 약하고, 마법사 orb channel과 리듬이 구분된다.

## 5. Stage Signal 입력

진리는 오직 **`valorActive`**(= `t < S.valorUntil`, sgSnapshot 파생). F4 sustain 포즈와 **동일한 truth**를 쓴다. cue는 이 신호의 소비자가 아니라 shadow — gameplay에 visual-only state·timer·S.ev 이벤트를 추가하지 않는다.

## 6. false→true edge 계약

| 전이 | 동작 |
|---|---|
| **false → true** | sustain-start one-shot 1회 발화(`scFireSupport`) |
| **true 유지** | 추가 발화 0(재발화 금지) |
| **true → false** | 유지 종료(`scClearHold`·holding=false)·wave/ping은 이미 self-clean |
| **newGame / boss switch** | `SG.battle` 변화 감지 → `scHardReset`(잔존 cue 제거·prev 리셋·발화 없음) |
| **battle end(S.over)** | active=false로 전이 → cleanup·live 0 |

- valor 창은 한 전투에서 **여러 번** 열릴 수 있다(주술사가 valor를 반복 시전). 계약은 "전투당 1회"가 아니라 **"시작 경계마다 정확히 1회, 유지 중 재발화 0"**(검증: `edges === windows`, `reFire === 0`).

## 7. wave lifecycle

`scSpawn('wave', point, 0, gen)` → `#sbCueLayer` 자식 div 1개 생성 → CSS `sbSupWave .92s forwards` 실행 → `animationend`에서 제거(`removed` 가드로 중복 제거 0) → `setTimeout` 안전망(1.1s·**Stage-only·gameplay timer 아님**·animationend 누락 시에도 정리). source anchor invalid/hidden이면 파동 생략(`waveEligible` 판별과 별개로 `wave=false`).

## 8. party ping lifecycle

각 파티 Actor(`SC_PARTY=['war','rog','mage','sham']`)에 대해: 생존(`snap.actors[id].alive`)이면 `eligible`에 넣고 → `resolveAnchor(id,'head')` 유효 시 `scSpawn('ping', point, 60*idx, gen)`(순차 60ms) → `sbHeadPing .6s forwards` → animationend/setTimeout(0.9s) cleanup. 사망·hidden·0-rect Actor는 skip(eligible엔 없거나, anchor null이면 ping만 생략). 각 Actor 최대 1회·동일 gen 중복 0.

## 9. sustain hold

Hold는 **별도 cue 요소가 아니라** `#stage .sb-shaman[data-pose="sustain"] .sb-s-charm` CSS animation(`sbSustainHold 2.6s infinite`)이다. 즉 valorActive가 유지되어 sbFigPose가 sustain 포즈를 유지하는 동안에만 존재하고, 만료되면 포즈 리셋으로 **자동 종료**된다(별도 cleanup 불필요). 부적 하나만 완만히 맥동 → 상시 강발광·전 화면 flash 없음.

## 10. semantic anchor 대응표

| 용도 | actorId | anchorName | part | 유효성 |
|---|---|---|---|---|
| 파동 source | `sham` | `body` | `sb-s-body` | 기존 등록(라벨만 보완) |
| 머리 ping | `war` | `head` | `sb-w-head`(topBias) | **신규 최소 등록** |
| 머리 ping | `rog` | `head` | `sb-r-head`(topBias) | **신규 최소 등록** |
| 머리 ping | `mage` | `head` | `sb-m-head`(topBias) | **신규 최소 등록** |
| 머리 ping | `sham` | `head` | `sb-s-head`(topBias) | **신규 최소 등록** |

- consumer는 DOM ID/querySelector 직접 참조 0 — 전부 `resolveAnchor(actorId, anchorName)` 경유. `head`는 실제 사용하는 anchor만 등록(미래 직업 head 선등록 ⛔). 좌표 산식은 F3 `sbPt` 단일 소유(무수정).

## 11. invalid/hidden fallback

anchor가 invalid(부재/절단/0-rect/context-inactive)면 `resolveAnchor`는 **null**을 반환하고, cue는 해당 요소를 **생략**한다. **(0,0) 유령 좌표 fallback 없음**. 하네스(rect 0)에서는 모든 anchor가 null → wave/ping 미생성이지만 `waveEligible`/`eligible`은 진리대로 채워져 "판정은 맞고 렌더만 생략" 됨이 검증된다.

## 12. Ensemble priority

동시 발생(valor start + smash windup + brace + mage channel) 시 주연 순서: ① 보스 강타 tell / 전사 brace ② sustain start 짧은 지원 인지 ③ 머리 위 작은 ping ④ sustain hold ⑤ 마법사 은은한 channel. 구현상 render는 **`sbFigPose(S)` 먼저(전사·보스 포즈 확정) → `sbSupportCue(S)` 나중** 순서 — figure 포즈가 cue보다 우선한다. cue는 pointer-events none·무대 안(#sbCueLayer)·화면 전체 flash 없음 → 전사 강타 대응을 가리지 않는다.

## 13. warrior/mage/rogue 비변경

- **전사**: guard/brace 규칙·CSS·우선순위·timing 완전 보존(픽셀·판정 diff 0).
- **마법사**: channel 규칙·orb 슥슥 CSS·속도·진폭 무변경(나라님 PASS 보존).
- **도적**: interrupt 규칙 무변경·파쇄자전 가짜 action 추가 0(F6 이월).

## 14. gameplay 등가성

cue는 render 표현층에서만 동작하고 S/G에 쓰지 않는다 → 3보스 무입력 스모크 **51.4/1029 · 48.5/971 · 61.8/1236** 불변(cue ON/OFF 등가). CORE byte-identical(466/22,521/`6cad2ec2`). valor 발생·지속·RNG·tick·drain·seedOnHit·damage/heal/shield·승패 전부 무변경.

## 15. cleanup

- one-shot: `animationend`(주경로) + `setTimeout` 안전망(Stage-only) + `removed` 가드(이중 제거 0) + `SC_CUE.els` 추적/splice.
- 경계: `scHardReset`이 남은 els 전부 removeChild·prev/holding/lastFire 초기화(boss switch/newGame/battle end stale 0).
- hold: sustain 포즈 만료로 자동 종료.

## 16. 변경 파일

- `index.html`: (CSS) #sbCueLayer·.sbCue-wave/.sbCue-ping keyframes·sustain hold pulse / (data) ANCHOR_REGISTRY head anchor 4종 / (JS) F4A 블록(SC_CUE·scCueLayer·scSpawn·scFireSupport·scHardReset·scClearHold·sbSupportCueRun·sbSupportCue·debug accessor) / render()에 `sbSupportCue(S)` 1줄 배선.
- `dev/shaman_sustain_support_cue_01_check.js`(신규), `docs/66`(본 문서), 포인터 `docs/98·99·102`, index live-pin 갱신(전 check 파일).

## 17. 비변경 영역

CORE·gameplay 수치·valor 규칙·보스 패턴·S.ev/drain·F1 shadow 계약·F2 generic pose resolver·F3 generic anchor resolver(Actor id 분기 0)·F4 Actor Profile/Pose Map·전사 guard/brace·마법사 channel·도적 interrupt·파티 위치/크기.

## 18. 검증 결과

- 신규 F4A check: **PASS**(A 신호 경계·B 기반 경계·C 파동·D Party Ping·E Ensemble·F 회귀).
- 회귀: F4/F3/F2/F1/Constitution/전체 dev check/baseline **전부 PASS**·3보스 스모크 불변·CORE byte-identical·JS syntax OK·git diff --check clean.

## 19. 캡처 및 재현법

DEV 관측: `window.__seedHealer.stage.cueState()`(prev/gen/holding/live/lastFire) / `.cueDrive(S,snap)`(1 tick 구동) / `.cueReset()`. 실기 재현: 파쇄자 전투 진입 → 주술사 valor(전투 의지) 시전 순간 파동+머리 ping → 이후 부적 은은한 맥동. 390×844 10장면(파동 시작·ping·hold·+channel·+smash·+brace·종료·battle end·boss switch).

## 20. 나라님 Phone Human Gate 항목

1. 주술사가 파티에 힘을 퍼뜨린다는 것이 한눈에 읽히는가 2. 파동이 공격이 아니라 지원으로 보이는가 3. 각 영웅 머리 위 푱!이 귀엽고 명확한가 4. ping이 너무 크거나 반복적이지 않은가 5. 유지 중에는 충분히 조용한가 6. 전사 brace·보스 tell이 여전히 주연인가 7. 마법사 오브 channel 귀여움이 유지됐는가 8. 전체가 하나의 귀여운 모험 파티로 보이는가.

## 21. 남은 WATCH

- **W1**: 파동 크기(scale 4)·색 강도·ping 크기/간격은 나라님 폰 실기 튜닝 후보(session 슬라이더 아님·CSS 상수). 디테일 귀신 방지 — 이번엔 기본값 고정.
- **W2**: head anchor는 파쇄자(shell_iron) figure 문맥에서만 유효(다른 보스=이모지 폴백). 모르가스/심연 figure는 F5/F6 이후.

## 22. F4 FINAL PASS closeout 조건

F4A 나라님 Human Gate PASS + F4 RC(a4ed493)의 마법사 PASS·도적 F6 이월 확인이 함께 서면, F4(Companion Ensemble) FINAL PASS로 마감. F4A는 F4의 주술사 가독성 보강분으로 같은 closeout에 포함.

## 23. F5 입력 계약

다음은 **F5 — Boss Figure Shell / Face Template**(docs/65 §25). 보스 figure를 generic figure 문맥으로 세워 모르가스/심연 무대에서 동료 figure(그리고 도적 interrupt 실가시)를 여는 기반. F4A one-shot lifecycle(generation+animationend+Stage-only 안전망)은 **F5 이후 순간 포즈(strike/release 등) vocabulary의 참조 패턴**이 된다. F5 구현은 이번 카드에 섞지 않는다.
