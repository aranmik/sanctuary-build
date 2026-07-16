# 67. 보스 인형 골격 / 얼굴 템플릿 01 (BOSS FIGURE SHELL / FACE TEMPLATE 01 — F5)

**작성: 렌 · 2026-07-16 · EP26 · 상태: 구현(infrastructure·visual equivalence·유키PD 기술 검수 대기·commit/push 0) · 기준 HEAD `08728af` · 상위: [59](./59_STAGE_PRODUCTION_SYSTEM_CONSTITUTION_01.md)·[61 F5](./61_STAGE_FOUNDATION_MIGRATION_ROADMAP_01.md)·[62 F1](./62_STAGE_SIGNAL_SHADOW_FOUNDATION_01.md)·[63 F2](./63_ACTOR_REGISTRY_POSE_MAP_FOUNDATION_01.md)·[64 F3](./64_ANCHOR_REGISTRY_FOUNDATION_01.md)·[65 F4](./65_COMPANION_ENSEMBLE_RUNTIME_01.md)·[66 F4A](./66_SHAMAN_SUSTAIN_SUPPORT_CUE_01.md)**

> **핵심 문장 3줄**
> 1. `골격은 공통, 연기는 고유.` — 보스마다 다른 인형을 만들되, 인형을 무대에 세우는 방법은 하나로 만든다.
> 2. F5는 새 보스를 꾸미는 카드가 아니다 — 파쇄자는 **첫 reference implementation**일 뿐이고, 외형은 손대지 않는다.
> 3. 성공 기준: F6/F7이 **generic resolver/presenter를 고치지 않고** Profile 데이터+고유 CSS만으로 들어올 수 있다.

---

## 1. 작업 목적

F1~F4A로 신호/Actor/좌표/포즈/one-shot cue 기반이 섰다. 그러나 **보스 figure**는 파쇄자 하나가 production에 존재할 뿐, 후속 보스를 같은 방식으로 연결할 공통 계약이 없었다. F5는 Boss Figure Profile·Shell·Face Template·Part slot·Pose/Face 분리·Anchor 연결·Presenter ownership·Context cleanup·Debug 계약을 production-ready로 세우고, **파쇄자를 시각 등가로 그 계약에 연결**한다.

## 2. 현재 boss figure 감사

| 항목 | 실측 |
|---|---|
| root | `#sb-boss-fig` (`.sb-unit.sb-iron-crusher`, `data-pose=""`) · `#stage` 자식 |
| 골격 | `.sb-react`(반응) → `.sb-fit` → `.sb-fig`(idle `sbBreatheHeavy 4.8s`) — **3층 transform 분리**([41] 규격) |
| 파츠 7 | `sb-shadow`·`sb-aura`·`sb-ic-body`·`sb-ic-core`·`sb-ic-pauldrons`·`sb-ic-head`·`sb-ic-hammer` (전부 `.sb-part`) |
| 가시 게이트 | `#stage.sb-boss-iron #sb-boss-fig{display:block}` — 파쇄자 문맥에서만 |
| 배치 상수 | `#sb-boss-fig{left:50%;top:-8px;transform:translateX(-50%) scale(1.04);z-index:2}` |
| pose | F2 `ACTOR_REGISTRY.boss_iron` → `windup`(=`bossActionKind:'smash'`) |
| pose CSS | `[data-pose="windup"]` → `.sb-react`(몸 기울임) · `.sb-ic-hammer`(망치 치켜듦) · `.sb-ic-head`(머리 기울임) |
| anchor | F3 `boss_iron.weapon`(sb-ic-hammer·topBias) · `boss_iron.body`(sb-ic-body) |
| 얼굴 | **`sb-ic-head` 단일 파츠** — 눈(주황 T바이저)·볏은 `::before`/`::after` **의사요소**(=파츠·anchor 불가·docs/59 Anchor 8원칙) |

**★감사 결론 2건**
1. 파쇄자 얼굴은 **단일 파츠 얼굴**이다(눈/입 개별 파츠 없음). Face Template은 이를 해부학적으로 강제하면 안 된다(§6이 명시적으로 허용하는 형태).
2. windup CSS 3줄 중 **`.sb-ic-head` 1줄만이 얼굴 표현**이고 나머지 2줄은 몸/무기다 — pose와 face가 이미 사실상 섞여 있었다(§4의 하드코딩 위험).

## 3. 기존 파쇄자 구조 (보존 대상)

markup 7파츠·순서·클래스, 배치 상수(`top:-8px`/`scale(1.04)`/`z-index:2`), fig 규격(190×212)·`sbBreatheHeavy`, `sbCoreP` 코어 맥동, 가시 게이트, pose 어휘(`windup`), anchor(weapon/body) — **전부 무변경**. F5는 이 자산을 **서술(binder)**할 뿐 재생성하지 않는다.

## 4. 해결하려는 하드코딩 위험

F5가 없으면 F6/F7에서 이런 코드가 자란다:
- `if(bossId==='morgas'){...}` — generic presenter의 보스 분기
- 보스마다 별도 cleanup 함수 발명
- 보스마다 `document.querySelector('#sb-'+bossId+'-fig .face')` — bossId 조립 selector
- 보스마다 별도 얼굴 상태 처리기
- 새 보스 추가 때 **기존 파쇄자 코드 수정**

F5의 반대 명제: **새 보스 = Profile 데이터 1개 + 고유 CSS. 실행 코드 수정 0.**

## 5. Boss Figure Profile 계약

`BOSS_STAGE_PROFILE[bossId]` — 데이터는 보스별, 실행은 generic.

```
shell_iron: {bossId, actorId, shellId, figId, hostId, stageContext,
             parts{slot→class}, faceParts{slot→class},
             defaultFace, allowedFaces, candidateFaces, faceRules[], anchors[]}
```
- **키=bossId**(`CUR_BOSS`/`sgBossId()`와 같은 축) → F6는 `BOSS_STAGE_PROFILE['boss01']` 추가만.
- 등록 순서·object key 순서 **의존 0**(키 조회만·`Object.keys` 인덱싱 0).
- 미등록 bossId/shellId → **null**(예외 0). 상속 속성(`toString` 등)은 **self-key 검증**(`p.bossId===bossId`)으로 차단.
- Profile에 gameplay mutable state **0**(hp/atk/mana/타이머/난수 0) — 순수 표현 데이터.
- unknown future key 파괴 0(resolver는 아는 필드만 읽음).

## 6. Figure Shell 계약

`BOSS_FIGURE_SHELL[shellId]` — 무대 골격 어휘. 현행 sb- 자산 존중.

```
sb_unit_v1: {shellId, layers:['sb-react','sb-fit','sb-fig'], partClass:'sb-part',
             slots:['root','ground','aura','body','core','ornament','face','weapon','sideL','sideR']}
```
- **binder 방식 채택**(§8 접근 A) — shell은 DOM을 **생성하지 않고 서술**한다.
- slot은 **어휘**일 뿐 강제가 아니다: 미보유 slot은 **null**, 빈 DOM 남발 0, 좌우 대칭 강제 0, 인간형 가정 0, 얼굴 없는 보스·무기 없는 보스 허용.

## 7. Face Template 계약

- 최소 어휘: **`neutral` / `tell`**. 실제 연결은 **gameplay truth가 있는 것만** — 파쇄자: `default/idle → neutral`, `smash windup → tell`.
- `hurt`/`groggy`/`enraged`/`defeated`는 **`candidateFaces`에 보존**(미래 vocabulary) — 실 신호+one-shot lifecycle 준비 후 후속 카드. **가짜 timer 재생 0**.
- 얼굴 형태를 강제하지 않는다: 파쇄자는 `faceParts:{root:'sb-ic-head'}` **단일 파츠 얼굴**(눈/입 slot 없음).
- 미지/불허 face → `defaultFace` 안전 fallback. 미등록 boss → `''`.

## 8. Pose와 Face 분리

| | 질문 | 소유 |
|---|---|---|
| `data-pose` | 몸 전체가 **무엇을 하고 있는가** | F2 `resolveActorPose` → `sbFigPose` |
| `data-face` | 얼굴이 **무엇을 드러내는가** | F5 `resolveBossFace` → `presentBossFigure` |

- 두 상태는 **별도 DOM 속성**이며 억지로 한 문자열에 합치지 않는다 → 미래 `pose=idle + face=enraged` 가능.
- gameplay state는 face 이름을 **모른다**(CORE에 `data-face`/`tell`/`neutral`/registry 참조 0).
- 조건 해석은 **F2 `sgPoseCond` 재사용** — 조건 어휘를 하나로 유지(신규 조건 언어 0·id 분기 0).

**★이관 1줄**: `.sb-ic-head`의 windup 규칙을 `[data-pose="windup"]` → `[data-face="tell"]`로 옮겼다(값 byte 보존). 몸/무기(`.sb-react`/`.sb-ic-hammer`)는 pose가 계속 소유. **등가 근거**: 파쇄자에서 `face==='tell'` ⟺ `pose==='windup'`(둘 다 `bossActionKind:'smash'` 파생·같은 render 패스에서 갱신) — 전 전투 971틱 스윕 **mismatch 0**(tell 228 / neutral 743)으로 기계 증명.

## 9. Part slot 목록 (boss_iron reference mapping)

| slot | class | 비고 |
|---|---|---|
| root | `sb-fig` | 파츠 컨테이너(idle 애니메이션 소유) |
| ground | `sb-shadow` | 그림자 |
| aura | `sb-aura` | 화로 glow |
| body | `sb-ic-body` | 철괴 몸통 · **F3 anchor `body`** |
| core | `sb-ic-core` | 용광로 코어(`sbCoreP` 맥동) |
| ornament | `sb-ic-pauldrons` | 어깨 장식 |
| face | `sb-ic-head` | **단일 파츠 얼굴** · face state 소유 |
| weapon | `sb-ic-hammer` | 대형 망치 · **F3 anchor `weapon`**(강타선 source) |
| sideL / sideR | — | **미매핑 = null**(비대칭 보스는 F7에서 등록) |

## 10. Optional part fallback

`resolveBossPart(profile,slot)` → 미보유 slot은 **null**. `resolveBossPartEl` → null slot은 조회조차 하지 않음(유령 DOM 0). presenter/binder에 `createElement`/`appendChild`/`innerHTML`/`removeChild` **0** → 반복 render duplicate root **구조적으로 0**.

## 11. boss_iron reference mapping

`ACTOR_REGISTRY.boss_iron`에 **`bossStageProfile:'shell_iron'`** 링크 키 추가(§13). Actor Registry는 정체성·pose만 소유하고, shell 세부는 BOSS_STAGE_PROFILE이 소유한다. **generic pose resolver는 이 키를 읽지 않는다**(F2 무수정 증명).

## 12. Stage Signal 입력

face는 `sgSnapshot`의 `bossAction.kind`만 읽는다(F1 지속 신호). SG ring buffer를 queue처럼 소비하지 않고, gameplay에 visual-only state·timer·S.ev 이벤트를 추가하지 않는다.

## 13. Actor Registry 연결 (F2 경계)

F5는 F2를 대체하지 않는다. 경계: **Actor Registry**=Actor 정체성과 pose / **Boss Figure Profile**=figure shell·face·part·anchor / **Presenter**=DOM 반영 / **Anchor Registry**=좌표 / **Stage Signal**=gameplay truth 번역. generic pose resolver에 shell 세부사항 **0**.

## 14. Anchor Registry 연결 (F3 경계)

- 기존 `boss_iron.weapon`/`boss_iron.body` **정의 무변경**(강타선 source/target 계보 보존).
- Profile의 `anchors:['weapon','body']`는 **연결 선언**이고, 정본 등록은 ANCHOR_REGISTRY.
- `resolveBossAnchor(profile,name)` → 선언된 anchor만 **F3 `resolveAnchor`로 위임**. F5는 자체 `getBoundingClientRect`·좌표 캐시·resize listener **0**, (0,0) fallback **0**.
- **신규 anchor 등록 0** — F5는 얼굴/코어에 아무것도 그리지 않으므로 `face`/`core` anchor를 만들지 않는다(§11 "이번 F5에서 사용하지 않는 것을 선등록하지 않는다"). F6/F7이 실제로 필요할 때 최소 등록.

## 15. Presenter ownership

`presentBossFigure(profile,resolved)` — `data-face`만 소유·**idempotent**(같은 값 재기록 0·class churn 0·className/classList 접촉 0). `clearBossFigure(profile)` — 문맥 밖/미지 shell 보스의 stale `data-face` 제거. 드라이버 `sbBossFigure(S)`는 F2 `sbFigPose`와 **동일한 owner 규약**(등록 전체 순회 → 문맥 밖은 cleanup → 활성만 표현).

## 16. context lifecycle

| 경계 | 동작 |
|---|---|
| inactive(다른 보스 문맥) | `clearBossFigure` → `data-face=''` |
| active boss context | `resolveBossFace` → `presentBossFigure` |
| pose/face update | 매 render·순수 파생·재생성 0 |
| boss switch / newGame | 새 `CUR_BOSS` → 이전 profile은 문맥 밖 → cleanup |
| battle end | 문맥 유지 시 face는 진리대로(cast 없음→neutral) |

render 순서: **`sbFigPose(S)` → `sbBossFigure(S)` → `sbSupportCue(S)`**(몸 포즈 → 얼굴 → cue·주연 순서 보존).

## 17. cleanup

stale `data-face` 0 / stale shell class 0(shell class 미조작) / duplicate root 0(생성 0) / duplicate part id 0(파츠는 class·id 없음) / 이전 profile 잔존 0 / 이전 anchor binding 잔존 0(매 요청 재조회).

## 18. unknown boss/shell fallback

미등록 bossId → profile null → 표현 0(예외 0) · 미등록 shellId → shell null → **cleanup 후 표현 0** · 프로토타입 키 → null · bad snapshot → `defaultFace` · 불허 face → `defaultFace`.

## 19. visual equivalence

**측정법**: 파쇄자 전투에서 transition/animation을 정지시켜(`*{transition:none!important;animation:none!important}`) CSS 규칙의 **목표값**을 결정론적으로 계측(frozen-tab 무관). default/windup 2상태 × 10요소(3 layer + 7 part) × `transform`/`opacity`/`display`/`z-index`/`width`/`height`/`x`/`y` + anchor 2종 + rootCount + partCount + class.

**결과**: F5 전/후 전체 스냅샷 **차이 2건뿐 — `default.face: null→"neutral"`, `windup.face: null→"tell"`**. 즉 **새 `data-face` 속성 외 모든 기하/시각 속성이 소수점 3자리까지 동일**(§13이 허용한 "DOM data attribute 추가"). 머리의 windup 회전 `matrix(0.99863,-0.052336,0.052336,0.99863,-31,0)`도 동일 → CSS 선언 이관이 등가임을 실측 확인. anchor weapon/body 두 상태 모두 좌표 동일. **픽셀 변화 0 → 나라님 Human Gate 불요**(§22).

## 20. 변경 파일

- `index.html`: (CSS) `.sb-ic-head` windup 규칙을 `[data-face="tell"]`로 이관 1줄 / (data) `BOSS_FIGURE_SHELL`+`BOSS_STAGE_PROFILE`, `ACTOR_REGISTRY.boss_iron`에 `bossStageProfile` 링크 키 / (JS) F5 블록(resolveBossStageProfile·resolveBossFigureShell·resolveBossPart·resolveBossPartEl·resolveBossAnchor·resolveBossFace·presentBossFigure·clearBossFigure·sbBossFigure·debug accessor) / render에 `sbBossFigure(S)` 1줄
- `dev/boss_figure_shell_face_template_01_check.js`(신규) · `docs/67`(본 문서) · 포인터 `docs/98·99·102` · index live-pin 갱신(전 check)

## 21. 비변경 영역

CORE(466/22,521/`6cad2ec2` byte-identical) · gameplay 수치/보스 패턴/타이밍/RNG · S.ev/drain/seedOnHit · 파쇄자 markup·배치·크기·실루엣·색·idle/코어 애니메이션 · pose 어휘/규칙 · anchor 정의 · F1 shadow 계약 · F2 generic pose resolver · F3 generic anchor resolver · F4 동료 pose · F4A support cue · 파티 위치/크기 · UI.

## 22. 검증 결과

신규 F5 check **48/48**(A Profile 5·B Resolver 6·C Shell 5·D Face 6·E 등가 8·F 경계 10·G Cleanup 4·H 회귀 4) · F4A 33 · F4 29 · F3 30 · F2 31 · F1 41 · Constitution 40 · **전체 37종 PASS** · baseline 36 · 3보스 스모크 51.4/1029·48.5/971·61.8/1236 불변 · CORE byte-identical · JS syntax OK · git diff --check clean.

**★핵심 등가 검사(e4)**: 전 전투 971틱에서 `face==='tell'` ⟺ `pose==='windup'` **mismatch 0**(tell 228·neutral 743틱) — 얼굴 CSS 이관이 모든 게임 상태에서 안전.

## 23. DEV observation (관측 계약)

`window.__seedHealer.stage` 아래 **읽기 전용 관측**: `bossProfiles()` · `bossShells()` · `bossProfile(id)`(복사본) · `resolveBossFace(id,snap)` · `bossFaceStats()` · **`bossFigure()`** → `{bossId, contextActive, actorId, shellId, pose, face, mappedParts, boundParts, missingParts, anchors, rootCount, duplicateRoot, staleFaceCount}`. production state 수정 accessor 0 · 상시 console log 0 · 디버그 UI 0.

## 24. 캡처 비교

pane 픽셀 스크린샷은 **frozen-tab 이슈로 타임아웃**(기존 환경 이슈·F5 결함 아님·[66] §19와 동일). 대체 증명 = §19의 computed style + bounding rect + class/data attribute + anchor 좌표 + root/part count **전수 diff**(차이 2건=data-face뿐). **visual equivalence를 자동검사만으로 과장하지 않는다**: 이 증명은 "CSS 규칙 해석 결과와 기하가 동일함"을 보이며, 폰트 AA·합성 타이밍 같은 렌더러 잔차는 다루지 않는다. 다만 F5는 새 시각 요소를 0개 추가했고 기하가 전부 동일하므로 픽셀 변화가 발생할 경로가 없다.

## 25. 남은 WATCH

- **W1** face 어휘는 현재 `neutral`/`tell` 2종뿐. `hurt`/`groggy`/`defeated`/`enraged`는 실 gameplay truth(피격 이벤트·처치 등)와 one-shot lifecycle([66] 패턴)이 준비된 후 후속 카드에서 연결 — 지금 신호 없이 만들지 않는다.
- **W2** `sideL`/`sideR` slot은 어휘만 존재하고 실 사용처 0(F7 비대칭 보스의 첫 소비자 예정). F7에서 실제로 불필요하다고 판명되면 어휘에서 제거한다.
- **W3** shell은 현재 `sb_unit_v1` 1종. 비인간형(심연)이 같은 3층 골격으로 충분한지는 **F7에서 최초 검증** — 부족하면 새 shellId 추가(기존 shell 수정 ⛔).
- **W4** 파쇄자 얼굴이 단일 파츠라, 다중 파츠 얼굴(눈/입 분리)의 face state 적용은 F6 모르가스가 첫 사례가 된다.

## 26. F6 모르가스 입력 계약

F6는 다음만으로 production에 들어갈 수 있어야 한다:
1. `BOSS_STAGE_PROFILE['boss01']` 추가(actorId·shellId `sb_unit_v1` 또는 새 shellId·parts·faceParts·faceRules·anchors·stageContext)
2. 모르가스 고유 body/face/part **CSS**(`sb-mg-*` 등 신규 네임스페이스)와 markup 추가 + 가시 게이트(`#stage.sb-boss-morgas` 류)
3. `ACTOR_REGISTRY`에 모르가스 actor profile(pose 규칙) + `bossStageProfile` 링크
4. 실 gameplay truth 연결: `judge` 예고 → face `tell`(또는 고유 pose)
5. `ANCHOR_REGISTRY`에 모르가스 semantic anchor(실사용 최소)
6. **도적 interrupt pose 실가시 검증**([65] 이월분 — 모르가스엔 judge가 있어 F4 규칙이 자동 발동)

**generic resolver/presenter를 수정해야 한다면 F5 계약이 부족한 것이다** → 그 사실을 보고하고 F5를 보완한다.

## 27. F7 갈증의 심연 입력 계약

비인간형 body·얼굴 없음 또는 core-face·비대칭 optional part(`sideL`/`sideR`)·고유 tell/pose·실사용 anchor를 **Profile 데이터 + 고유 CSS**로 추가. `drain`은 cast 없는 즉발이 진실이므로 **Tell 신설=패턴 변경 ⛔**([61] 경고) — 심연의 face는 기존 진리에서만 파생한다. 얼굴이 없다면 `faceParts` 생략·`faceRules` 빈 배열로 face 자체를 쓰지 않을 수 있다(shell이 얼굴을 강제하지 않음).

## 28. Human Gate 필요 여부

**불요**(§22 정책). 근거: 파쇄자 화면 완전 동일(§19 전수 diff 차이 2건=data attribute) · 새 production visual 0 · DOM/class 내부 구조와 registry만 변경 · 자동검사 48/48+전체 37종 PASS. 억지 visual demo를 production에 추가하지 않았다. **실제 새 보스의 즐거운 Human Gate는 F6 모르가스에서 진행**한다. → **유키PD 기술 검수로 closeout 가능.**

## 29. closeout 조건

유키PD 기술 검수 PASS(계약 충실성·bossId 분기 0·시각 등가·경계 무변경) → 루다 commit/push → F5 closeout. 이후 **F6 Morgas Figure**(§26 계약)로 진행하며, F6부터는 공통 기반을 다시 고치는 것이 아니라 **각 보스의 고유한 얼굴과 몸과 연기를 꽂는 작업**이 된다. F8 Action Line/Reaction Grammar는 이번 카드에 미혼입(one-shot 순간 표현은 [66] F4A 패턴이 참조 기반).
