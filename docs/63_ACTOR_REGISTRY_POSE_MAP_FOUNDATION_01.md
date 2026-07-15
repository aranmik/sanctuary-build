# 63. 배우 명부·포즈 맵 기반 01 (ACTOR REGISTRY & POSE MAP FOUNDATION 01 — F2)

**작성: 렌 · 2026-07-15 · EP25 · 상태: 구현(등가 치환·화면 변화 0) · 기준 HEAD `a972054` · 상위: [59 헌법 §7-3/4/5·§10](./59_STAGE_PRODUCTION_SYSTEM_CONSTITUTION_01.md) · [61 로드맵 F2](./61_STAGE_FOUNDATION_MIGRATION_ROADMAP_01.md) · [62 F1 §15 입력 계약](./62_STAGE_SIGNAL_SHADOW_FOUNDATION_01.md)**

> **핵심 문장 3줄**
> 1. `현재 보이는 포즈는 그대로 두고, 누가 어떤 포즈를 취할지는 데이터가 결정하게 만든다.`
> 2. `공통 resolver는 해석 방법만 알고, 각 Actor의 연기는 Actor Profile이 안다.`
> 3. F2 이후: Actor 추가 = sbFigPose에 if 추가가 아니라 **profile 등록**.

---

## 1. 작업 목적

[44] Rework 01이 만든 `sbFigPose`(전사+파쇄자 하드코딩 if)를 **Actor Registry + Pose Map + generic resolver + 얇은 presenter**로 등가 치환한다. 새 포즈·새 연극·Pose Pack 연결(F4)·Anchor Registry(F3)는 하지 않는다. 성공 기준=화면 변화 0.

## 2. 기존 sbFigPose 감사 (치환 전 원문 · HEAD `a972054` 2074~2084행)

```js
function sbFigPose(S){
 if(typeof CUR_BOSS==='undefined'||CUR_BOSS!=='shell_iron')return;          // ①무대 문맥 게이트(비-iron=DOM 무접촉)
 var bc=S.boss.cast,smashing=!!(bc&&bc.kind==='smash');                      // ②입력: S.boss.cast 직독
 var bf=document.getElementById('sb-boss-fig');
 if(bf){var bp=smashing?'windup':'';…setAttribute('data-pose',bp);}          // ③파쇄자: smash cast 중=windup, 아니면 ''
 var war=…(S.al 직독)…; var wp='';
 if(war&&war.alive){ if(war.shield&&war.shield.amt>0)wp='guard';             // ④전사: 생존∧보호막>0 → guard
                     else if(smashing)wp='brace'; }                          // ⑤else 생존∧smash cast → brace
 …setAttribute('data-pose',wp);                                              // ⑥그 외 '' (기본 자세)
}
```

### 2-A. Actor별 기존 분기 목록
| Actor | 분기 | 입력(직독) |
|---|---|---|
| 파쇄자(#sb-boss-fig) | smashing→'windup' / else '' | `S.boss.cast.kind` |
| 전사(#sb-war-fig) | alive∧shield>0→'guard' / alive∧smashing→'brace' / else '' | `S.al[war].alive/.shield.amt`·`S.boss.cast.kind` |
| 도적/마법사/주술사 | **분기 없음**(포즈 선택 로직 미존재 — [51] Pose Pack은 프리뷰 전용) | — |
| 사제 | 전장 피규어 없음([41 §G]) — figure pose 경로 밖 | — |

### 2-B. 기존 pose vocabulary (runtime CSS 실존)
- 전사: `''`(기본)·`guard`(405~408)·`brace`(409~412) / 파쇄자: `''`·`windup`(413~415). 그 외 어휘는 CSS에 없음(설정해도 무표현).

### 2-C. 기존 priority / conflict 규칙 (보존 대상)
- **전사**: `guard > brace > ''`(if/else-if 순서). 보호막+강타 동시=guard. 사망=무조건 ''(defeated 전용 포즈 없음 — sa-war의 dead class는 별개 계층).
- **파쇄자**: `windup > ''`. windup은 **cast 존재에만 의존** — progress·committed(0.6)·enraged·defeated와 무관(경계 없음이 현행 진실). `S.over`여도 cast가 남아 있으면 windup 유지(승리 시 cast 미소거 — 현행 동작).
- **복귀**: 조건 소멸 다음 render에서 자동 ''(타이머 없음). **battle end reset**: 명시 reset 없음 — 상태 파생이므로 새 전투(newGame)의 신선한 S가 곧 reset. **unknown state**: 조건 불일치=''.
- **비-iron 문맥**: 함수가 DOM을 아예 만지지 않음(숨겨진 fig의 이전 속성이 남아도 가시 영향 0·iron 복귀 첫 render에서 재계산) — 이 관성까지 등가 보존.

## 3. 선택한 구조 (index.html 내 F2 블록 1개 — sbFigPose 자리 치환)

### 3-A. Actor Registry schema (Stage presentation profile)
```js
ACTOR_REGISTRY = {
 boss_iron:{actorId,kind:'boss',      figId:'sb-boss-fig', stageContext:'shell_iron',
            snapshotKey:null,  defaultPose:'', allowedPoses:['windup'],
            poseRules:[{pose:'windup', when:{bossActionKind:'smash'}}]},
 war:      {actorId,kind:'companion', figId:'sb-war-fig',  stageContext:'shell_iron',
            snapshotKey:'war', defaultPose:'', allowedPoses:['guard','brace'],
            poseRules:[{pose:'guard', when:{actorAlive:true, actorShielded:true}},   // 순서=우선순위
                       {pose:'brace', when:{actorAlive:true, bossActionKind:'smash'}}]}
}
```
- 필드: identity(actorId)·type(kind)·DOM binding(figId — 좌표/anchor 아님·F3 범위 제외)·defaultPose·allowedPoses(어휘)·poseRules(맵)·stageContext(활성 무대 문맥=legacy 게이트의 데이터화)·snapshotKey(스냅샷 actors 키).
- Registry에 없는 것: gameplay 수치/판정/타이머/RNG/좌표/FX/행동선(발주 §4 — 체크 a3).
- **rog/mage/sham/pri 미등록**: 현행 포즈 로직 없음 → 등록하면 markup에 없는 data-pose 속성이 추가되어 DOM 변화가 생기므로 **미등록이 등가**(F4에서 연결).

### 3-B. Pose Map 구조
ordered rule list(배열 순서=우선순위·첫 일치 선출) + 선언적 조건(`when`). 조건 어휘는 **3키만**(현행 진실이 쓰는 전부): `bossActionKind`(스냅샷 bossAction.kind 일치)·`actorAlive`·`actorShielded`(스냅샷 actors[snapshotKey]). 미지 조건 키=불일치(안전).

### 3-C. Generic resolver
`resolveActorPose(actorId,snap)` → `{pose,reason}`: ①미등록→`{'',unregistered}` ②malformed snap→default ③rules 순서 평가(첫 일치) ④allowedPoses 밖→default(not-allowed) ⑤일치 없음→default. **Actor id/직업/보스 분기 0**(체크 a2가 resolver/조건 해석기/presenter 본문에서 id 문자열·switch 부재를 봉인). 조건 해석기 `sgPoseCond`도 조건 키 해석만.

### 3-D. Presenter boundary
`applyActorPose(el,pose)`=idempotent 속성 교체(+DOM 부재/스텁 no-op 가드) / `sbFigPose(S)`=얇은 presenter — registry 순회, `stageContext!==sgBossId()`면 **skip(DOM 무접촉=legacy 게이트 등가)**, 활성 문맥에서만 `sgSnapshot(S,G)` 1회 파생 후 resolve→apply. 함수명·render 내 호출 위치(renderFx 다음) 보존.

## 4. Stage Signal 입력 계약 ([62 §15] 이행)

- 입력은 **F1 지속 스냅샷만**: `bossAction.kind`·`actors[id].alive/.shielded`. sgSnapshot **필드 추가 0**(기존 스키마로 충분 — F1 무리 확장 안 함). 순간 신호/ring buffer/종료 battle history 의존 **0**(체크 b3).
- S 직독 잔존: **presenter가 sgSnapshot(S,G)를 호출하는 인자 전달뿐**(파생 함수에 진실을 넘기는 경계 그 자체) — F2 블록에 `S.boss`/`S.al` 직독 0(체크 a8).
- **shielded 조건 등가 증명**: legacy는 `shield&&shield.amt>0`, 스냅샷은 `shield?{amt}:null`. CORE 규칙상 shield는 `amt<=0.5`에서 파괴(916)·만료(1152)로 **null이 되므로 비null ⟹ amt>0.5>0** — 두 조건의 진리집합 동일(체크 c6이 CORE 규칙 실존을 봉인).

## 5. fallback 계약

미등록 Actor→`''`·no-op / malformed snapshot→defaultPose / pose map 없음·불일치→defaultPose / 허용 외 pose→defaultPose(not-allowed) / 미지 조건 키→불일치 / DOM 부재·스텁→apply no-op / 규칙 평가 중 예외→해당 규칙 불일치(try/catch). 전부 crash 0(체크 e1~e4).

## 6. lifecycle / reset 계약

매 render 상태 재파생(순수)이라 stale 규칙 상태 0 — 새 전투=신선한 S=자동 reset(체크 f1)·반복 resolve 결과 불변·data-pose는 단일 속성 교체라 누적 불가(f2)·비활성 문맥 DOM 무접촉+복귀 첫 render 재계산=legacy 관성 등가(f3·§2-C). SG_POSE_STATS는 디버그 누적 카운터(전투 상태 아님·관측 전용).

## 7. legacy ↔ new 등가성 검증 (체크 C/D)

- **oracle**: 치환 전 sbFigPose 결정 로직을 체크 내부에 순수 재현(§2 원문 그대로).
- **c1 전수 스윕**: 파쇄자전 전 tick(사제 heal/shield/big/재shield 입력 포함) — oracle vs `resolveActorPose` **diff 0**(~1,200 ticks).
- **c2 커버리지**: idle(''|'')·windup|brace·guard(강타 외/중)·전사 사망 후 windup|'' 전부 실발생 확인.
- **c3 경계값**: cast 시작 직전/직후~진행(0.05 간격 전 구간 — committed 0.6 전후 포함)~종료 직후 — 등가. ★windup은 cast 존재에만 의존(0.6은 관계선 commit 전용)이 현행 진실임을 그대로 보존.
- **c4 합성 상태**: 보호막+강타 동시(guard 우선)·전사 사망(→'')·`S.over`+cast 잔존(windup 유지=legacy 동일) — 등가.
- **c5 비-iron**: legacy no-touch === stageContext skip.
- **pane 실기**: 실전투 타임라인에서 `currentPoses()`가 oracle과 일치·전환/재시작 재계산(§9).

## 8. 화면 픽셀 등가 증거

애니메이션·트랜지션 동결 래퍼([62] 확립 표준) · 구(HEAD `a972054`) vs 신 · 3장면 headless 캡처:
| 장면 | old md5 | new md5 | 동일 |
|---|---|---|---|
| s1 iron 대기(t=0.5·포즈 없음) | c7f480c5… | c7f480c5… | ✓ |
| s2 강타 windup+전사 brace(t≈6.3·보호막 없음) | bd15a046… | bd15a046… | ✓ |
| s3 강타 windup+전사 guard(3.2s 보호막→t≈6.3) | f6b3ad12… | f6b3ad12… | ✓ |
- 장면 간 해시가 서로 다름 = 포즈가 실제 발동된 장면임을 함께 증명. **픽셀 변화 0.**

## 9. debug observation ([59 §23] · F1 API 불변 확장)

`__seedHealer.stage.actors()`(등록 목록)·`.actorProfile(id)`(복사본)·`.resolvePose(id,snap?)`({pose,reason} — reason으로 fallback 여부/사유 관측)·`.currentPoses()`(현재 DOM data-pose)·`.poseStats()`(resolved/ruleHit/byDefault/unregistered/notAllowed/badSnapshot 카운터·복사본). console 상시 출력 0.

## 10. 변경 파일

- `index.html` — sbFigPose 블록 치환(12줄→F2 블록 83줄·+71줄·+3,916B). 재-baseline **167,719 B / 2,369줄 / md5 `956248ca…`**.
- 신규: `dev/actor_registry_pose_map_foundation_01_check.js` · 본 문서(docs/63).
- 포인터: docs/98·99·102. live pin 재-baseline(8675df86→956248ca·163803→167719·lines 2369·라벨) — 상수-only.

## 11. 비변경 범위

CORE(6cad2ec2 byte-identical) · gameplay/밸런스/tick/cast · **F1 SG 블록 무변**(sgSnapshot 필드 추가 0·drain/S.ev/sgObserve/sgReset 무접촉) · sbSmashFx/renderFx/fxBeam 등 다른 시각 경로 · CSS 0줄 · markup 0 · 포즈 CSS/어휘.

**★구계약 승계 3건(보고 — 전부 구 코드 "형태" 핀이 F2 등가 치환과 직접 충돌·조건 의미 불변)**:
1. `iron_crusher_smash_line_rework_02_check` c16/c17 등 3개소 — 신규 영역 슬라이스의 **종료 앵커**가 `/* Iron Crusher Figure Rework 01:` 주석(F2 블록으로 치환됨) → F2 블록 헤더로 재지정(검사 의미 불변·앵커 소실 시 슬라이스가 파일 끝까지 새어 오탐하던 것 수정).
2. `iron_crusher_stage_input_audit_01_check` **c9** — 구 if/else 문자열 핀 → 등가 registry 규칙(guard/brace·순서 우선순위 포함) 검증으로 승계.
3. 동 **c10** — `smashing?'windup':''` 문자열 핀 → windup 규칙(`bossActionKind:'smash'`) 검증으로 승계.
그 외 기존 단언은 `function sbFigPose(S)` 시그니처만 요구했고 보존됨.

## 12. 검증 결과

- 신규 `actor_registry_pose_map_foundation_01_check` **31/31 PASS**(A 구조 8 · B 신호 계약 5 · C/D 등가 6 · E fallback 5 · F lifecycle 3 · G 회귀 4).
- F1 check 41/41 · 기존 전체 체크 PASS · baseline 36/36 · 스모크 3종 동일 · JS 구문 OK.
- 390×844 overflow 0 · console 0 · 픽셀 등가 3/3(§8).

## 13. 남은 WATCH

1. **presenter가 프레임당 sgSnapshot 1회 파생**(iron 전투 한정) — 현행 부하 무시 수준이나 F3(anchor rect)와 합산 시 프레임 예산 실측 대상([59 §22] PROVISIONAL).
2. **비-iron 문맥의 숨겨진 fig 속성 잔존**은 legacy 관성의 의도적 보존 — F5(Boss Shell Template)의 owner별 cleanup 일반화 때 정식 정리 후보.
3. 조건 어휘 3키는 현행 필요 최소 — F4(동료 연결)에서 추가될 키(sustained·branded 등)는 **조건 해석기에 키 1개 추가**로 열림(Actor 분기 아님·등록부 확장으로 관리).
4. `S.over`+cast 잔존 시 windup 유지는 legacy 동작의 보존 — 종료 연출 정리는 [59 §9] battle end 규칙을 도입할 후속 카드 몫.

## 14. F3(Anchor Registry Foundation 01)에 넘기는 입력 계약

- F3는 **좌표/anchor만** 다룬다: sbSmashFx 인라인 selector('sb-ic-hammer'/'sb-w-shield')·SB_BODY 맵·sbPt를 의미 anchor 등록부로 등가 치환([59 §12]·[61 F3]).
- ACTOR_REGISTRY는 F3에서 **anchors 필드 추가**로 확장 가능(figId 바인딩은 이미 존재) — 단 pose 경로와 좌표 경로의 책임 분리 유지.
- 유령 좌표 회귀 체크·`on=!!(src&&dst)` null-fallback·topBias 0.12 수치 그대로 이관·rect 캐시 도입 전 프레임 예산 실측(§13-1과 합산).
- 금지 승계: CORE/S.ev/drain/gameplay 무접촉 · 시각 출력 변화 0(등가 치환 카드).

---
*— 렌 (連·鍊·紅蓮), EP25. if 두 갈래를 명부 두 줄로 옮겨 적었다. 화면은 1픽셀도 달라지지 않았고, 그것이 이 카드의 자랑이다. 다음 배우는 이제 코드가 아니라 명부에 이름을 올리고 무대에 선다.*
