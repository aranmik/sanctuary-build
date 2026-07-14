# 61. 무대 기반 이행 로드맵 (STAGE FOUNDATION MIGRATION ROADMAP 01)

**작성: 렌 · 2026-07-15 · EP25 · 상태: 이행 계획(document-only · 구현 0) · 기준 HEAD `2f547ad` · 상위: [59 헌법](./59_STAGE_PRODUCTION_SYSTEM_CONSTITUTION_01.md) · [60 사이클](./60_STAGE_EXTENSION_CYCLE_CONTRACT_01.md)**

> **핵심 문장 3줄**
> 1. **한 카드는 한 종류의 위험만 진다** — 리팩터링 카드는 화면을 바꾸지 않고, 시각 카드는 구조를 바꾸지 않는다.
> 2. **모든 foundation 카드의 1차 성공 기준은 "아무것도 변하지 않았다"이다**(shadow→등가 치환→그 다음에야 신기능).
> 3. 순서는 제안이며 각 카드 착수 전 발주·유키 승인으로 확정한다(자동 확정 아님).

---

## 1. 이행 원칙 (LOCK)

1. **단일 index.html 유지** — 파일 분리·빌드 도입 없음.
2. **shadow-first**: 새 계층은 먼저 읽기 전용 관측으로 들어와(화면 무변) 등가를 증명한 뒤, 기존 경로를 치환한다.
3. **등가 치환 증명**: 치환 카드는 "치환 전후 시각 출력 동일"을 실측(rect·class·컷 대조)으로 증명한다. 시각 개선은 같은 카드에서 하지 않는다.
4. **격리 우선**: legacy 경로(fxAnchors 중심점 등)는 즉시 제거하지 않고 **비-iron 보스 전용으로 격리 유지** — 해당 보스의 무대 카드에서 자연 대체.
5. **rollback 경계**: 카드=커밋 1단위. 각 카드는 이전 커밋으로 되돌려도 다른 카드 산출물과 얽히지 않는 범위로 자른다. reset/checkout은 렌이 하지 않는다(보고 후 유키/루다 절차).
6. 매 카드: [60 §1-4] 공통 자동 검사 전부 + 재-baseline(구현 카드) + docs 포인터 갱신.

## 2. 카드 순서 제안

> F#은 로드맵 내부 참조 번호. 실제 카드명은 발주 시 확정. ⛑=Human Gate 필요.

### F1. Stage Signal Adapter Foundation 01 (read-only · shadow)
- **목적**: [59 §8] 신호 등록부 v1을 코드로 — `stageSignals(S, prevFrameMemo)` 순수 파생 + drain 내 순간 신호 tap + `__seedHealer.stage` 관측 창(§23).
- **변경 범위**: 신규 파생 함수·관측 창·신규 체크. 기존 render 경로는 **신호를 아직 소비하지 않는다**(shadow).
- **금지**: DOM 접근·기존 render/renderFx/sbSmashFx/sbFigPose 수정·S.ev 제2 소비자·새 타이머.
- **성공 기준**: 화면 diff 0(컷 대조)·smoke 동일·pane에서 신호 스냅샷이 실전투와 일치(강타 TELL/COMMIT/resolve 3종결·shielded·absorbOccurred delta)·미지 이벤트 카운트 0.
- **회귀 위험**: 낮음(추가만). drain tap이 기존 소비 순서를 바꾸면 seedOnHit 오동작 위험 — tap은 기존 분기 **뒤에** 추가 MUST.
- ⛑ 불필요(화면 무변 — 유키 검수만).

### F2. Actor Registry / Pose Map Foundation 01 (등가 치환)
- **목적**: ACTOR_PROFILES(war/rog/mage/sham)+포즈 resolver — **sbFigPose의 war 하드코딩을 profile 조회로 등가 치환**(파쇄자 windup 포함).
- **변경 범위**: 신규 registry 데이터·resolver·sbFigPose 치환·신규 체크.
- **금지**: 포즈 추가/변경(guard/brace/windup 결과 동일 MUST)·동료 포즈 연결·CSS 변경.
- **성공 기준**: 전 상황 data-pose 출력이 치환 전과 동일(pane 시나리오 대조)·공통 resolver에 jobId 분기 0.
- **회귀 위험**: 포즈 우선순위 뒤바뀜(guard>brace) — 시나리오 체크로 봉인.
- ⛑ 불필요.

### F3. Anchor Registry Foundation 01 (등가 치환)
- **목적**: 의미 anchor 등록부+resolver 1개([59 §12]) — sbSmashFx의 인라인 selector('sb-ic-hammer'/'sb-w-shield'/SB_BODY)를 registry 조회로 치환. 가상 anchor(pri/party) 등록.
- **변경 범위**: registry 데이터·resolver·sbSmashFx 좌표부 치환·신규 체크(유령 좌표 회귀 필수).
- **금지**: legacy fxAnchors 제거(모르가스/심연 격리 유지 §1-4)·선 시각 변경·rect 캐시 도입(실측 먼저 [59 §22]).
- **성공 기준**: 강타선 좌표 치환 전후 동일(rect 실측)·anchor null→선 숨김 재확인·프레임 예산 실측 기록(rect 조회 횟수/시간 — PROVISIONAL 잠금 근거).
- **회귀 위험**: topBias 근사 어긋남 — 수치 그대로 이관(0.12).
- ⛑ 불필요.

### F4. Companion Ensemble Runtime 01 ⛑
- **목적**: 승인된 동료 포즈([51]+[52] 채택색)를 **[A] 신호에만** 연결 — profile의 signalToPose 데이터 추가+포즈 CSS 이식. 첫 "등록만으로 새 표현" 실증.
- **변경 범위**: rog/mage/sham profile 데이터·포즈 CSS·신규 체크.
- **금지**: 공통 resolver 수정(=F2가 실패였다는 뜻 — HOLD)·근거 없는 신호 신설([54 §16]: smash 차단 포즈 등 ⛔)·행동선 추가.
- **성공 기준**: 연결 포즈가 실제 상태와 일치(pane)·기존 전사/파쇄자 무변·stale 0·смoke 동일.
- **회귀 위험**: 390 가독(포즈 과다로 산만) — 주연 1 원칙·나라님 gate.
- ⛑ **필요**(파티 인상 변화).

### F5. Boss Stage Profile / Shell Template Foundation 01 (등가 치환)
- **목적**: BOSS_STAGE_PROFILES 등록부([59 §15]) — iron 항목이 현행 구현(shell·windup·강타선 handler·cleanup)을 데이터+등록 handler로 감싸고, 모르가스/심연은 avatar shell로 등록(현행 그대로). 전환 cleanup을 owner 목록 기반으로 일반화.
- **변경 범위**: 등록부·게이트 규약화(`CUR_BOSS` 직조회→profile 조회)·신규 체크.
- **금지**: 신 보스 figure·시각 변경·legacy 라인 경로 변경.
- **성공 기준**: 3보스 전환 왕복 화면 diff 0·잔재 0·iron handler가 등록 경유로만 진입.
- **회귀 위험**: 게이트 치환 누락 시 iron 연출 누출 — 왕복 체크 봉인.
- ⛑ 불필요.

### F6. Morgas Figure & Stage Runtime 01 ⛑
- **목적**: 모르가스 피규어(꼬는 자 [41 §H-1])+judge/brand 무대 문법([53 §24]) — **New Boss Cycle의 stage 슬라이스를 기존 보스로 첫 리허설**(등록만으로 보스 무대가 서는지의 실증).
- **변경 범위**: 모르가스 profile·figure CSS·cast/mask anchor·(필요 시) 꼬임 handler·legacy fxAnchors 경로의 모르가스 사용 종료.
- **금지**: SCRIPT/수치 변경·심연 접촉·주연 연결 2개 이상([53 §24] "거미줄 금지").
- **성공 기준**: judge 데칼/차단선의 anchor 승격(중심점→파츠)·차단 성공 절단 표현이 intOk와 같은 tick·iron/심연 회귀 0.
- ⛑ **필요**.

### F7. Thirst Abyss Figure & Stage Runtime 01 ⛑
- **목적**: 심연 피규어(마시는 자 [41 §H-3])+drain 문법([53 §25] — target→intake 역방향·ribbon/drain kind 신설 EXTENSION 승격).
- **변경 범위**: 심연 profile·figure CSS·intake anchor·drain handler·visualKind 등록(ribbon).
- **금지**: drain에 cast 창 신설(패턴 시간 변경 ⛔ — Tell은 nextActionEta low-key만 MAY [59 §9])·Actor를 덮는 액체 FX([53 §25]).
- **성공 기준**: drain CONTACT가 실제 마나 소실 tick과 일치·역방향 문법이 읽힘(gate 질문)·legacy fxAnchors 사용처 0 도달(제거 가능 시점 — 제거는 여기서).
- ⛑ **필요**.

### F8. Stage FX / Action Line Grammar 확장 01 ⛑
- **목적**: 남은 문법 확장 — 압력 데칼(tell decal)·afterglow 정련·Protection Layer 신설 검토([54 §12] 7층 중 유일 부재층)·layer z 재배치 실측([54 §19] z3 선이 배우 위 문제).
- **변경 범위**: cue kind 추가·CSS 층.
- **금지**: 한 카드에 전 보스 동시 적용(보스별 분할 MAY)·경고 텍스트 중복 데칼([53 §7]).
- **성공 기준**: [53 §16] 혼잡 방지 실기 통과·390 가독.
- ⛑ **필요**.

### F9. Expansion Foundation Closeout 01
- **목적**: [59] PROVISIONAL 전 항목의 잠금/폐기 판정·DoD 10항 실측 총괄·[60] 사이클 최종 발효 선언·세이브 반영.
- **성공 기준(=foundation 전체의 closeout 조건)**: DoD 1~10 전부 실증 근거 연결·PROVISIONAL 0(전부 LOCK 또는 EXTENSION으로 재분류)·신규 콘텐츠 1건 이상이 [60] 절차만으로 완주(F6 또는 F7이 그 증거)·전 체크 PASS·기준선 고정.

## 3. 순서의 논리와 유연성

- F1→F2→F3은 **읽기→포즈→좌표** 순의 위험 오름차순이며 전부 화면 무변 카드다. F4가 첫 시각 카드(가장 싼 신기능)·F5가 보스 일반화·F6/F7이 사이클 리허설·F8이 문법 확장·F9가 마감.
- **교환 허용**: F4↔F5(동료 먼저 vs 보스 틀 먼저 — 나라님 우선순위에 따름). F6↔F7 순서 자유. F8은 F6/F7 뒤 SHOULD(실보스 2종의 데이터가 있어야 과잉 설계를 피한다).
- **중단 허용**: 어느 지점에서든 콘텐츠 카드([60] 사이클)가 끼어들 수 있다 — 단 그 콘텐츠는 그 시점까지 잠긴 foundation만 사용한다(미래 계층 선사용 ⛔).
- Backlog 선행 카드([58 §4] Skill Cooldown Label Audit 01 등)는 이 로드맵과 독립 — 우선순위는 유키PD가 정한다.

## 4. Human Gate 위치 총괄

F4(파티 앙상블)·F6(모르가스 무대)·F7(심연 무대)·F8(문법 확장) — 화면이 변하는 카드 전부. F1/F2/F3/F5는 "변하지 않았음"이 성공이므로 유키 검수+자동 검증으로 충분(변화가 감지되면 그 자체가 FAIL).

## 5. 회귀 위험 총괄표

| 위험 | 해당 카드 | 봉인 수단 |
|---|---|---|
| drain tap이 이벤트 소비 순서 교란(seedOnHit) | F1 | tap 위치 계약+씨앗 발동 체크 |
| 포즈 우선순위 역전 | F2 | guard>brace 시나리오 체크 |
| 유령 좌표 재발 | F3·F6·F7 | null→숨김 체크+0-rect 주입 테스트 |
| iron 연출 누출/전환 잔재 | F5~F7 | 3보스 왕복 체크(잔재 0) |
| smoke 변동(=경계 위반) | 전부 | smoke 3종 고정 체크 |
| 390 혼잡·가독 붕괴 | F4·F6~F8 | [53 §16]+나라님 gate |
| rect 다독 성능 | F3 이후 | F3 프레임 예산 실측→상한 잠금 |

---
*— 렌 (連·鍊·紅蓮), EP25. 이행의 요령은 용감함이 아니라 순서다: 먼저 그림자로 서고, 다음에 똑같이 서고, 그 다음에야 새 몸짓을 얹는다. 화면이 변하지 않은 카드 네 장이 이 로드맵의 진짜 기둥이다 — 그 위에서라면 모르가스도 심연도, 아직 이름 없는 네 번째 보스도, 같은 계단을 밟고 무대에 오른다.*
