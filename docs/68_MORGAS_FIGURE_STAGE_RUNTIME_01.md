# 68. 모르가스 인형 & 무대 런타임 01 (MORGAS FIGURE & STAGE RUNTIME 01 — F6)

**작성: 렌 · 2026-07-17 · EP26 · 상태: 구현(visible production·나라님 Phone Human Gate 대기·commit/push 0) · 기준 HEAD `90e029a` · 상위: [59](./59_STAGE_PRODUCTION_SYSTEM_CONSTITUTION_01.md)·[39 시각 정체성](./39_BATTLE_VISUAL_IDENTITY_CONTRACT.md)·[41 피규어 정장](./41_BATTLE_FIGURE_KIT_IMPORT_CONTRACT.md)·[63 F2](./63_ACTOR_REGISTRY_POSE_MAP_FOUNDATION_01.md)·[64 F3](./64_ANCHOR_REGISTRY_FOUNDATION_01.md)·[65 F4](./65_COMPANION_ENSEMBLE_RUNTIME_01.md)·[66 F4A](./66_SHAMAN_SUSTAIN_SUPPORT_CUE_01.md)·[67 F5](./67_BOSS_FIGURE_SHELL_FACE_TEMPLATE_01.md)**

> **핵심 문장 3줄**
> 1. `모르가스가 질문하고, 도적이 대답한다.`
> 2. 보스의 개성은 고유하게, 무대에 세우는 방법은 공통으로 — F5 generic 기반은 **한 줄도 고치지 않았다**.
> 3. 모르가스는 화면에 크게 그린 그림이 아니라, 자기 몸·얼굴·예고를 갖고 도적의 차단을 끌어내는 **작은 보스 배우**다.

---

## 1. 작업 목적

F5가 세운 Boss Figure Profile/Shell/Face Template 계약을 **실제 두 번째 보스**에 적용해, ① 모르가스에게 production 고유 figure를 주고 ② 실제 gameplay truth(`judge`)를 pose와 face로 읽히게 하고 ③ **도적 interrupt를 실전투에서 처음 가시화**한다. F5의 성적표는 "generic 수정 없이 데이터만으로 보스가 올라오는가"이며, 이 카드가 그 답이다.

## 2. 작업 전 모르가스 감사 (읽기 전용)

| # | 항목 | 실측 |
|---|---|---|
| 1 | bossId | **`boss01`** (`CUR_BOSS`/`sgBossId()` 축) |
| 2 | display name | `모르가스` (`BOSS_DEFS.boss01.boss.sn`) · 전체 명 `핏빛 예언자 모르가스` |
| 3 | Stage context/class | **없음** — `sb-boss-iron`만 존재했고 모르가스 전투의 `#stage`는 class `pn`뿐 |
| 4 | boss avatar DOM | `<div id="bossAvatar">☠️</div>` · `top:8px;font-size:50px;z-index:2` · 실측 중심 (207, 26) |
| 5 | boss action 종류 | `judge`(어둠의 심판) · `brand`(피의 낙인) · `bomb`(불안정한 마력) · `smash`(탱커 강타) · `enrage` |
| 6 | `judge` 시작 조건 | `SCRIPT`의 `{t:15,j:1}`·`{t:32,j:2}`·`{t:48,j:3}`·`{t:66,j:4}` → `fireScript`의 `case 'judge'` |
| 7 | `judge` 지속 구간 | `S.boss.cast={kind:'judge',start:S.t,end:S.t+B.judgeCast}` · **judgeCast 2.5초** · 피해 180(광폭화 225·전원) |
| 8 | interruptStance ready 조건 | `sgSnapshot` 순수 파생 — 도적 생존 ∧ 광폭화 아님 ∧ (비-smash면서 `un`) 아님 ∧ `t>=S.intReady` |
| 9 | 도적 interrupt pose 조건(F4) | `{pose:'interrupt',when:{actorAlive:true,bossActionKind:'judge',interruptStance:'ready'}}` |
| 10 | interrupt 실행/FX | cast 시작 **0.8초 뒤** `S.pendJ` 만기 → `tryInterrupt(j)` · FX=`fxIntLine`(도적 슬롯→`A.boss`)·`judgeWarn`·`fxAoe` |
| 11 | boss 위치·크기·UI | 아바타 이모지 상단 중앙 · HP바/시전바/다음 패턴/차단바는 무대 밖(`#stage` 위) — figure와 무관 |
| 12 | 기존 시각 계약 | [39 D-1] **꼬는 자** — 가늘고 비틀린 실루엣·저주/낙인/문양·끊어진 선과 이어지는 선·`연결/차단/정화/복구/꼬임` |
| 13 | Boss Grammar | [33] 모르가스=**판단형 기준 보스**("정화 못해? 차단 연결 못해? 그러면 클리어 못 해") · 기준 보스 수정 ⛔ |
| 14 | 파쇄자와의 DOM/context 차이 | 파쇄자=`#sb-boss-fig` + `sb-boss-iron` 문맥 / 모르가스=figure 없음·이모지 폴백 |
| 15 | 동료 sb figure 표시 | **미표시** — `#stage.sb-boss-iron #sb-*-fig{display:block}` 이라 모르가스 전투에선 이모지 폴백 |

**★감사 결론 3건**
1. **도적은 이미 준비돼 있었다**: 모르가스 judge 중 `interruptStance='ready'`·`bossActionKind='judge'`로 F4 규칙이 **참**인데, 동료 figure가 `shell_iron` 문맥에 묶여 있어 ① 화면에 없고 ② `sbFigPose`의 owner cleanup이 포즈를 `''`로 지웠다. **막고 있던 것은 규칙이 아니라 문맥**이었다.
2. **파티 배치가 보스에 묶여 있었다**: `#stage.sb-boss-iron`이 파티 줄·4인 transform·hit FX·아바타 숨김까지 소유 → 모르가스용으로 복제하면 §11 금지 사항에 정면 위배.
3. **행동선 원점이 이모지였다**: `fxAnchors`의 `boss:resolveAnchor('boss','avatar')`가 차단선/보스선의 원점. figure를 넣고 아바타를 숨기면 **차단선이 끊긴다** → §14대로 figure anchor로 이전 필요.

## 3. 실제 gameplay truth

`bossAction.kind==='judge'` 하나만 사용한다(2.5초 cast 창). `interruptStance`는 F4가 이미 쓰는 순수 파생 필드. **Stage Signal 신규 field 0** — `sgSnapshot` 무변경.

## 4. bossId / actorId / context

- bossId **`boss01`** · actorId **`boss_morgas`**(파쇄자 `boss_iron`과 같은 명명 계보) · stageContext **`boss01`** · contextClass **`sb-boss-morgas`** · figId **`sb-morgas-fig`**
- ★함정 기록: 초안에서 ACTOR_REGISTRY 키를 `morgas`로, ANCHOR_REGISTRY 키를 `boss_morgas`로 다르게 두어 `resolveBossAnchor(profile.actorId=…)`가 **null**을 반환 → 차단선 좌표가 비었다(`x1:null`). **두 레지스트리의 actorId는 반드시 동일 키**(boss_iron이 지키던 계약)여야 한다 → `boss_morgas`로 통일.

## 5. 기존 모르가스 시각 계약 (승인본 준수)

[39 D-1] + [41 H-1]을 그대로 따랐다. 새 캐릭터로 재디자인하지 않았다.

| 승인 항목 | F6 구현 |
|---|---|
| 가늘고 비틀린 실루엣 | 로브 `46×92`·`skewX(-3deg)`·좁은 어깨→퍼지는 밑단 · fig `120×198`(파쇄자 190×212 대비 **가늘고 높음**) |
| 가면·눈 | `sb-mg-head`(뼈빛 세로 가면) + `sb-mg-eyes`(가면 틈의 보라 안광) |
| 낙인 문양 | `sb-mg-sigil` — 가슴의 핏빛 룬 원(대각 2선) |
| 떠 있는 저주 실 | `sb-mg-threads` — 어깨 위 가는 실 2가닥(끊긴 원호) · `sbMgThread` 느린 흔들림 |
| 어두운 꼬임 오라 | `sb-aura` 보라 radial |
| main 핏빛 / glow 보라 | `--sb-mg-main:#b23a5e` / `--sb-mg-glow:#b06cf0` (+deep/edge/cloth/thread/mask) |
| 직접 때리는 자가 아님 | 무기 slot에 **망치가 아니라 저주 실** — 파쇄자의 정반대 축 |

## 6. 선택한 figure silhouette

**꼬는 자**: 좁고 높은 로브 실루엣 + 뼈 가면 + 어깨 위로 떠 있는 끊긴 실 원호. 파쇄자(크고 각진 금속·망치)와 **한눈에 다른 축**. 파츠 7종(권장 5~9 범위)·장식보다 얼굴/실/문양 우선. 무대보다 큰 일러스트화 ⛔(fig 120×198·`scale(1)`·`top:6px`).

## 7. shell 선택 근거

**기존 `sb_unit_v1` 재사용.** 모르가스는 3층 transform 골격(`.sb-react` 반응 / `.sb-fit` / `.sb-fig` idle)으로 **완전히 표현 가능**했다 — 몸 기울임=react, 부유=fig 애니메이션, 파츠=`.sb-part`. 새 shell을 만들 근거(계층 구조가 본질적으로 다름·기존 shell 수정 없이는 불가)가 **없었다**. "CSS 작성이 편해서"는 새 shell 사유가 아니다(§6). → `bossShells()`는 여전히 **1종**.

## 8. Profile

```
BOSS_STAGE_PROFILE['boss01'] = {
  bossId:'boss01', actorId:'boss_morgas', shellId:'sb_unit_v1',
  figId:'sb-morgas-fig', hostId:'stage', stageContext:'boss01', contextClass:'sb-boss-morgas',
  parts:{root,ground,aura,body,core,face,weapon}, faceParts:{root,eyes},
  defaultFace:'neutral', allowedFaces:['neutral','tell'],
  candidateFaces:['hurt','groggy','enraged','defeated'],
  faceRules:[{face:'tell',when:{bossActionKind:'judge'}}], anchors:['avatar'] }
```
gameplay mutable state 0 · 등록 순서 의존 0 · unknown fallback 보존.

## 9. part mapping

| slot | class | 역할 |
|---|---|---|
| root | `sb-fig` | 파츠 컨테이너(`sbMgDrift 5.2s` 부유) |
| ground | `sb-shadow` | 좁은 그림자(74px — 파쇄자 138px 대비 가늘다) |
| aura | `sb-aura` | 어두운 꼬임 오라(보라) |
| body | `sb-mg-robe` | 가늘고 비틀린 로브 · **anchor `avatar`(무대 선 원점)** |
| core | `sb-mg-sigil` | 낙인 문양(pose weave에서 점등) |
| face | `sb-mg-head` | 뼈 가면 |
| weapon | `sb-mg-threads` | 떠 있는 저주 실(모르가스의 action part) |
| ornament / sideL / sideR | — | **미보유 = null**(유령 DOM 0) |

## 10. faceParts

`{root:'sb-mg-head', eyes:'sb-mg-eyes'}` — **다중 파츠 얼굴**로, [67 §25] W4가 예고한 첫 사례다(파쇄자는 단일 파츠 얼굴). 눈이 실 element라 `face` state가 가면과 눈을 **독립적으로** 움직일 수 있다.

## 11. pose vocabulary

`default('')` / **`weave`** · candidatePoses `['brandCast','bombCast','smashCast']`(실 신호는 있으나 이번 카드 범위 밖 — 미래 vocabulary).

**pose 이름 근거**: pose는 *몸이 무엇을 하는가*이므로(guard/brace/windup/channel과 같은 문법) 모르가스의 몸은 심판을 준비하며 **실을 조여 짠다** → `weave`. [39] 정체성 `꼬는 자`와 직결. §8이 허용한 대로 **pose 이름 ≠ face 이름 ≠ action kind**(`weave` / `tell` / `judge`)이며, 셋 다 같은 truth에서 파생된다.

## 12. face vocabulary

`neutral` / **`tell`** · candidateFaces `['hurt','groggy','enraged','defeated']`(실 신호+one-shot lifecycle 준비 후 후속 카드 — 가짜 timer 0).

## 13. judge mapping

| | 규칙 | CSS 소유 |
|---|---|---|
| **pose** `weave` | `when:{bossActionKind:'judge'}` | `.sb-react`(몸 기울임) · `.sb-mg-threads`(실 조임 `scale(1.16) rotate(-6deg)`·흔들림 3.4s→**1.4s 가속**) · `.sb-mg-robe`(skew -3→-6deg) · `.sb-mg-sigil`(낙인 점등) · `.sb-aura`(1.12 확장) |
| **face** `tell` | `when:{bossActionKind:'judge'}` | `.sb-mg-head`(가면 -4deg 기움) · `.sb-mg-eyes`(안광 밝아짐 + 보라 glow) |

몸과 얼굴이 **함께** 읽히되 선언은 분리(§16 "모르가스 tell이 시작되면 얼굴과 몸이 함께 읽힘"). judge가 아닌 구간 tell 표시 **0**(검증 c6). 전 화면 flash·새 텍스트 0.

## 14. rogue interrupt mapping

**F4 규칙을 한 글자도 고치지 않았다.** 막고 있던 문맥만 열었더니 자동 발동한다:
- `bossActionKind:'judge'` ✓ (모르가스의 실제 cast)
- `interruptStance:'ready'` ✓ (기존 순수 파생)
- `actorAlive:true` ✓
- **figure 가시성** ← F6가 연 것(§15)

실측: 실 전투 스윕에서 `rog data-pose="interrupt"`가 judge 창에서만 발동, judge 밖 stale **0**. 모르가스 전용 도적 분기 0 · 가짜 action 0 · judge 조건/interrupt 성공률·타이밍 무변경.

## 15. companion context 확장

**문제**: 파티 배치·동료 figure 표시·hit FX·아바타 숨김이 전부 `#stage.sb-boss-iron`(콘텐츠 문맥) 소유 → 보스가 늘 때마다 복제해야 함(§11 금지).

**해법**: 두 축으로 분리했다.
- **`.sb-fig-stage`(공통)** = "보스 figure 무대가 활성이다" → 아바타 숨김 · 동료 emoji↔sb 전환 · `#stageAllies{bottom:20px;gap:26px}` · 4인 transform · hit FX · ≤730 fallback. **배치 상수는 byte 불변, 선택자만 공통화.**
- **`.sb-boss-*`(보스 고유)** = 자기 figure 표시만.

문맥 토글도 하드코딩에서 데이터로:
```
newGame: sC(_stg,'sb-boss-iron', CUR_BOSS==='shell_iron')   ← 구
newGame: sbStageContext()                                    ← 신(Profile 기반·보스 분기 0)
  → 각 profile의 contextClass를 p===act 일 때만 ON
  → sb-fig-stage 는 활성 profile에 shell이 있을 때만 ON
```
**동료 actor/anchor는 context-free(`stageContext:null`)로 정정**했다. 근거: 동료는 전 보스의 파티원이고, figure 가시성은 무대 CSS가 소유하며, **숨김 figure는 rect-zero로 이미 fail-closed**(심연에서 `war.head`/`sham.body` → null 실측). 포즈는 매 프레임 살아있는 진리에서 재계산되므로 stale이 성립하지 않는다. 보스 actor만 bossId 문맥을 갖는다.

**결과**: 파티 배치가 iron과 morgas에서 **완전 동일**(실측 war(40,271)/rog(124,291)/mage(208,291)/sham(292,277) 일치) · 보스별 파티 CSS 복제 **0** · 심연은 문맥 class 0 → 전역 `bottom:6px` 유지.

## 16. anchor mapping

| actorId | anchor | part | 용도 |
|---|---|---|---|
| `boss_morgas` | `avatar` | `sb-mg-robe` | **무대 선 원점**(이모지 아바타 대체 · 차단선 destination) |

**실사용 1종만.** `face`/`core`/`threads` anchor는 그것을 쓰는 FX가 없어 **미등록**(§13 "쓰지 않는 것을 미래 추측으로 선등록하지 않는다"). 기존 `boss_iron.weapon/body`·동료 anchor는 의미·좌표 무변경.

## 17. existing FX/action line 연결

새 FX를 만들지 않고 **기존 선의 원점만 semantic anchor로 이전**했다:
```
fxAnchors: boss: pt(resolveActiveBossAnchor('avatar') || resolveAnchor('boss','avatar'))
```
- `resolveActiveBossAnchor(name)` = 활성 boss profile이 선언한 anchor만 F5 `resolveBossAnchor`→F3 `resolveAnchor`로 위임. **bossId 분기 0**·자체 rect/캐시/listener 0.
- **모르가스**: profile이 `avatar`를 선언 → figure 몸통 중심. 차단선이 도적 슬롯 → **모르가스 몸**으로 연결(실측 (145,319)→(187,147)).
- **파쇄자**: profile이 `avatar`를 선언하지 **않음** → null → legacy 이모지 아바타로 폴백 → iron에선 숨김 → 기존대로 **null**. **파쇄자 계보 완전 무변경**(이것이 iron 회귀 0의 핵심 장치).
- `fxAnchors`의 `resolveAnchor(` 호출은 여전히 **6회**(얇은 facade 계약 유지) · 새 대형 FX·행동선 문법 0 · 피격/그로기 reaction 0.

## 18. lifecycle

| 경계 | 동작 |
|---|---|
| 모르가스 context inactive | `clearBossFigure` → `data-face=''` · contextClass OFF · figure display:none |
| battle active / default | pose `''` · face `neutral` |
| judge tell | pose `weave` · face `tell` · 도적 `interrupt` · 차단선 ON |
| judge 종료 | 전부 default 복귀 · 선 OFF(실측) |
| interrupt success/failure | **기존 gameplay 경로 그대로** — F6는 결과를 연출하지 않는다(F8 몫) |
| boss defeat / battle end | truth대로 파생(cast 없음 → neutral) |
| boss switch / newGame | `sbStageContext()` 재동기화 + `sbBossFigure` owner cleanup |

render 순서: `sbFigPose(S)` → `sbBossFigure(S)` → `sbSupportCue(S)`.

## 19. cleanup

boss switch(newGame `boss01`→) 실측: `data-face` `''` · contextActive false · **staleFaceCount 0** · duplicateRoot 0 · 반복 render 30회 후 partCount 불변. stale pose/face/context class/optional part/anchor binding/companion pose/one-shot cue 전부 **0**. 상시 console log 0.

## 20. generic resolver 무수정 증명

- **F5 generic 9함수**(resolveBossStageProfile/FigureShell/Part/PartEl/Anchor/Face·presentBossFigure·clearBossFigure·sbBossFigure): 본문에 `boss01`/`morgas`/`boss_morgas`/`weave`/`sb-mg-*` literal **0**·switch 0 (검증 h4).
- **F2 resolveActorPose·sgPoseCond·sbFigPose / F3 resolveAnchor**: Actor id literal **0** (검증 h5).
- 모르가스는 **Profile 데이터 + 고유 DOM/CSS + 실 signal mapping**만으로 등록됐다. → **F5 계약 충분성 입증**.
- F6가 추가한 generic 함수 2개(`resolveActiveBossAnchor`·`sbStageContext`)도 보스 분기 0(Profile 데이터로만 동작).

## 21. gameplay equivalence (등가성)

F6는 render 하류이며 S/G에 쓰지 않는다(검증 h1) → **gameplay ON/OFF 등가**. 3보스 무입력 스모크 **51.4/1029 · 48.5/971 · 61.8/1236 불변** · CORE byte-identical(466/22,521/`6cad2ec2`) · judge 조건/시간·interrupt 성공률·보스 HP/공격력·RNG·S.ev/drain 전부 무변경.

## 22. 변경 파일

`index.html`(모르가스 색 변수·figure CSS·pose/face CSS·markup / 공통 문맥 CSS 전환 / ANCHOR·ACTOR·BOSS_STAGE_PROFILE 등록 / `resolveActiveBossAnchor`·`sbStageContext` / fxAnchors 1줄 / newGame 1줄) · `dev/morgas_figure_stage_runtime_01_check.js`(신규) · `docs/68`(본 문서) · `docs/98·99·102` · index live-pin 갱신(전 check) · 승계 12건(§53).

## 23. 비변경 영역

CORE · gameplay 수치/패턴/타이밍/RNG · S.ev/drain/seedOnHit · **파쇄자 figure/pose/face/anchors/smash line/파티 배치**(실측 diff 0) · **심연 runtime/avatar/패턴/smoke** · 동료 pose rule·CSS · F4A support cue · F5 generic 계약 · UI/HP/카드.

## 24. 검증 결과

신규 F6 check **51/51**(A Profile 6·B Figure 6·C Pose/Face 9·D Rogue 5·E Anchor 6·F Context 5·G Visual 5·H Gameplay 5·I 회귀 4) · F5 48 · F4A 33 · F4 29 · F3 30 · F2 31 · F1 41 · Constitution 40 · **전체 38종 PASS** · baseline 36 · 스모크 3종 불변 · CORE byte-identical · JS syntax OK · git diff --check clean.

**★핵심 스윕**: 실 전투(합성 신호 0)에서 `pose weave ⟺ face tell` **mismatch 0** · judge 밖 tell **0** · judge 밖 도적 interrupt **0**.

## 25. 390×844 결과

`documentOverflowX 0` · clipping 0 · HP/시전바/차단바/카드 가림 0(figure는 `#stage` 안·상단 여백 6px) · 모르가스 fig 실측 120×198 @ (127,7) · 파티와 겹침 0(파티 y≥271, 보스 y≤205).

## 26. 캡처

pane 픽셀 스크린샷은 **frozen-tab 이슈로 타임아웃**(기존 환경 이슈·[66]§19·[67]§24와 동일). 대체 증명 = DOM/computed style/bounding rect/data attribute/anchor 좌표 전수 계측(§19·§25·§27). **파쇄자 회귀는 [67] §19와 동일 방법(transition/animation 정지 후 목표값 계측)으로 F5 릴리즈본과 전수 diff → 차이 0.** 시각 최종 사인오프는 나라님 폰(§28).

## 27. DEV observation (관측)

`window.__seedHealer.stage` 읽기 전용: `bossProfiles()`·`bossShells()`·`bossProfile('boss01')`·`resolveBossFace('boss01',snap)`·`bossFaceStats()`·**`bossFigure()`** → `{bossId, contextActive, actorId, shellId, pose, face, mappedParts, boundParts, missingParts, anchors, rootCount, duplicateRoot, staleFaceCount}` · `resolvePose('rog',snap)` · `snapshot().interruptStance`. production state 수정 accessor 0 · gameplay 강제 accessor 0 · 상시 log 0.

**DEV 재현(실 truth)**: 모르가스 전투 진입 → t=15/32/48/66의 `어둠의 심판` 시전 순간에 `stage.bossFigure()`가 `pose:'weave', face:'tell'`, `stage.resolvePose('rog',stage.snapshot())`이 `interrupt`를 반환하고 차단선이 도적→모르가스로 켜진다.

## 28. 나라님 Human Gate 질문

①파쇄자와 완전히 다른 보스로 보이나 ②작은 피규어지만 얼굴과 성격이 읽히나 ③judge 준비 순간이 한눈에 보이나 ④무언가를 노리고 판단하는 느낌이 드나 ⑤도적이 끊을 준비를 하는 게 보이나 ⑥`모르가스가 질문하고 도적이 답한다`가 읽히나 ⑦다른 동료가 주연을 빼앗지 않나 ⑧귀여운 전투 인형극으로 보이나 ⑨다시 보고 싶은 개성이 있나.

## 29. 남은 WATCH

- **W1** 모르가스 pose는 `weave` 1종. `brand`/`bomb`/`smash` 시전은 candidatePoses로만 보존 — 몸이 default라 "낙인을 찍는 중"은 아직 안 읽힌다. 실 신호는 있으므로 후속 카드에서 vocabulary 확장 가능(이번 카드는 §8 최소 범위 준수).
- **W2** `face`/`core`/`threads` anchor 미등록(쓰는 FX 없음). F8 행동선 문법이 낙인선/차단선을 파츠 단위로 그리게 되면 그때 최소 등록.
- **W3** `sb_unit_v1` shell이 2보스를 수용함이 입증됐다. **비인간형(심연)이 같은 골격으로 충분한지는 F7이 최초 검증** — 부족하면 새 shellId 추가(기존 shell 수정 ⛔).
- **W4** 동료 context-free 전환으로, figure 무대가 아닌 보스(심연)에서 동료 data-pose가 살아있으나 display:none이다. 시각 영향 0·stale 아님(live 값)이나, F7이 심연 figure를 열면 자동으로 가시화되므로 그때 포즈 적정성 재확인 필요.
- **W5** 모르가스 얼굴 가독성(가면 34×44·눈 22×6)은 390 실기에서 나라님 판정 대상. 너무 작으면 눈/가면 크기는 CSS 상수 조정.

## 30. F6 FINAL PASS 조건

유키PD 기술 검수(F5 무수정·literal 분기 0·파쇄자/심연/동료 회귀 0·계약 충실성) + **나라님 Phone Human Gate**(§28 9문항, 특히 ③judge 예고 가시성·⑥질문-대답 관계) PASS → 루다 commit/push/release.

## 31. F7 갈증의 심연 입력 계약

1. `BOSS_STAGE_PROFILE['shell_thirst']` 추가 — **비인간형**(낮고 퍼진 액체) · 얼굴 없음 또는 **core-face**(faceParts 생략 가능·faceRules `[]`로 face 미사용 허용) · 비대칭 optional part(`sideL`/`sideR`의 첫 소비자 후보)
2. 고유 CSS/markup(`sb-ab-*` 등 신규 네임스페이스) + `contextClass:'sb-boss-thirst'` → **파티/무대 규칙은 이미 `.sb-fig-stage`가 공통 소유하므로 복제 0**
3. `ACTOR_REGISTRY` 심연 actor(pose 규칙) + `bossStageProfile` 링크
4. **★`drain`은 cast 없는 즉발이 진실** — Tell 신설=패턴 변경 ⛔([61] 경고). 심연의 pose/face는 기존 진리에서만 파생(cast 없는 보스는 face를 아예 안 쓸 수 있다).
5. 선 원점이 필요하면 profile에 `avatar` anchor 선언(F6가 만든 폴백 경로가 그대로 동작)
6. `sb_unit_v1`로 표현 가능한지 먼저 감사 → 불가 증명 시에만 새 shellId

**generic resolver/presenter를 수정해야 한다면 F5/F6 계약이 부족한 것** → 보고 후 보완.

## 32. F8 reaction/action-line 경계

F6는 **지속 상태**(pose/face)와 **기존 선의 anchor 이전**까지다. 다음은 F8 몫이며 이번 카드에 미혼입: 피격/그로기/처치 reaction · 낙인선의 끊김↔이어짐 문법([39] D-1의 행동선 방향) · 차단 성공/실패의 과장 연출 · 새 damage feedback. 순간 표현이 필요할 때의 참조 패턴은 [66] F4A(generation + animationend + Stage-only 안전망)다.
