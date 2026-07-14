# 60. 무대 확장 사이클 계약 (STAGE EXTENSION CYCLE CONTRACT 01)

**작성: 렌 · 2026-07-15 · EP25 · 상태: 운영 계약(document-only · 구현 0) · 기준 HEAD `2f547ad` · 상위: [59 헌법](./59_STAGE_PRODUCTION_SYSTEM_CONSTITUTION_01.md) · [33 보스 문법](./33_BOSS_GRAMMAR.md) · [22 동료 매트릭스](./22_COMPANION_ROSTER_GROWTH_BLUEPRINT.md) · [03/09 스킬 풀]**

> **핵심 문장**
> `보스 추가 → 재미검증 → 승격 / 직업 추가 → 재미검증 → 승격 / 스킬 추가 → 재미검증 → 승격 — 이 세 사이클을 같은 절차로, 출시 스펙까지 왕성하게 반복한다.`

> 공통 전제: 모든 사이클은 [59]의 계층·신호·수명·fallback·정리 계약 아래에서 돈다. gameplay 재미가 먼저, 무대 연출은 그 다음이다(성소판 검증 순서의 정본 — 파쇄자가 그렇게 만들어졌다: 재미 카드 [31] → 무대 카드 [44]~[57]).

---

## 1. 공통 운영 규칙 (LOCK)

### 1-1. 사이클 공통 골격

모든 확장은 **설계(문서·심사) → gameplay 슬라이스(재미검증) → stage 슬라이스(무대검증) → Human Gate → lock(커밋·세이브 반영)** 순서를 따른다. 한 카드에서 대형 리팩터링과 시각 기능을 동시에 하지 않는다([61 §1]).

### 1-2. 공통 코드 변경 허용 기준 (LOCK — [59 §16])

- 콘텐츠 카드가 수정 **가능**: 자기 profile·자기 고유 handler·자기 CSS(파츠·4색·포즈)·자기 cue 정의·SCRIPT/BOSS_DEFS 데이터(보스 gameplay 카드에 한함·A안 최소 분기 [30]).
- 콘텐츠 카드가 수정 **금지**: CORE(byte-identical) · 공통 adapter/director/resolver/presenter · 다른 콘텐츠의 profile/handler · 기존 체크의 assertion 삭제·완화. 공통 규칙 개정이 필요하면 **콘텐츠 카드를 중단하고 별도 foundation 카드로 분리**한다(HOLD 보고).

### 1-3. 고유 handler 허용 기준 (LOCK — [59 §15-C])

데이터(profile·cue 맵)로 표현이 안 되는 **조합 판정·고유 렌더링**만 handler로 만든다(예: 파쇄자 blk×absorb 접촉 분기). handler는 7계약(등록·lifecycle·anchor registry 경유·cleanup 목록·fallback·보스/직업 게이트·gameplay 무접촉)을 지켜야 하며, 어기면 그 카드가 HOLD다.

### 1-4. 필수 자동 검사(전 사이클 공통 · LOCK)

신규 카드 체크 + 기존 전체 체크 + baseline + **3보스 smoke 동일**(신 보스는 자기 smoke 추가) + 390×844 overflow 0 + console 0 + CORE byte-identical + **전환 격리**(신 콘텐츠↔기존 3보스 왕복 시 잔재 0 · [59 §19-5]) + **유령 좌표 회귀 체크**(anchor 신설 시 · [59 §12-1-4]).

### 1-5. Human Gate 공통 규칙 (LOCK)

- 판정자: 나라님 폰 실기(390 기준 실기기). 유키PD가 검수 후 gate를 연다. 렌 자체 PASS는 gate가 아니다.
- gameplay gate 질문과 stage gate 질문을 **분리**해서 묻는다(한 번에 물으면 판정이 섞인다 — [31]/[56] 선례).
- gate 결과는 FINAL PASS / 조건부(폴리시 카드 분리) / HOLD 중 하나로 기록하고 closeout 문서([58] 형식)로 고정한다.

### 1-6. 실패·HOLD 기준 (LOCK)

즉시 HOLD: 공통 코드에 id 분기가 필요해짐 · 새 gameplay state/timer가 필요해짐 · smoke 변동 · 전환 격리 실패 · anchor (0,0) 퇴화 · Human Gate 미달("보는 맛 기준 상향" HOLD는 실패가 아니라 기준 조정 — [41 §L] 선례 형식으로 지식 승계 기록).

### 1-7. 출시 스펙까지의 운영 (LOCK)

- 사이클은 **한 번에 하나**(병렬 콘텐츠 카드 금지 — 단일 index.html·단일 기준선).
- 매 lock마다: 커밋(RC→push는 유키/루다 절차) · 재-baseline·live pin · docs/98/99/102 갱신 · 필요 시 세이브 발행.
- 콘텐츠 수가 늘어 체크 실행이 무거워지면 체크 러너 통합은 별도 dev 카드로(콘텐츠 카드에서 하지 않는다).
- 재미검증에 실패한 콘텐츠는 무대 슬라이스에 진입하지 않는다(비용 방어 — 무대는 재미의 번역이지 구조가 아니다).

---

## 2. A. New Boss Cycle

### 2-1. 입력

보스 1문장 정체성(예: "부수는 자") · [33] 심사 통과(기준/변주/복합 분류·사고≠억까 3기준·리베로 원칙) · 재미 질문 1개(보스는 사제에게 던지는 질문이다 — [15][24]).

### 2-2. 단계 (LOCK — 번호는 카드 분할 단위가 아니라 절차 단위)

| # | 단계 | 산출 | 검증 |
|---|---|---|---|
| 1 | 재미 질문 확정 | [33] 심사 문서 | 유키 승인 |
| 2 | gameplay 패턴 | BOSS_DEFS+SCRIPT 데이터(신 어휘 필요 시 fireScript case — **CORE 개정이면 [30] 게이트 경유**) | smoke 신설+기존 3보스 smoke 불변·no-input 결과 기록 |
| 3 | Boss Stage Profile 설계 | [59 §15-A] 스키마 기입(문서) | 헌법 체크리스트 대조 |
| 4 | figure/face/core | sb-<boss> 파츠 CSS+4색(독립 프리뷰 먼저 — [42] 선례 SHOULD) | 프리뷰 실기(귀여운가·실루엣 읽히는가) |
| 5 | pose/anchor 등록 | profile 데이터 | anchor rect 실측·유령 좌표 체크 |
| 6 | ability→Stage Cue 매핑 | abilityStageMaps(SCRIPT e: 어휘와 1:1) | 신호 등록부 대조(근거 없는 신호 0) |
| 7 | tell/contact/resolve 구현 | (필요 시) 고유 handler | pane 실엔진 G.step: 3종결 판별·contact 분기·stale 0 |
| 8 | showcase | 헤드리스 컷+실기 시나리오(대표 장면 A/B/C…) | 유키 검수 |
| 9 | smoke | 신 보스 no-input smoke 값을 baseline에 등재 | 결정론 재현 |
| 10 | Human Gate | 나라님 폰 — gameplay gate와 stage gate 분리 | §1-5 |
| 11 | lock | closeout 문서·커밋·재-baseline·98/99/102 | §1-7 |

### 2-3. 수정 경계 (LOCK)

- **수정하는 데이터**: BOSS_DEFS/SCRIPT(신 항목)·BOSS_STAGE_PROFILES(신 항목)·신 보스 CSS·(선택)고유 handler·게시판 등록([29] 경로).
- **수정 가능한 공통**: 없음이 목표. 신 SCRIPT 어휘가 신호 등록부에 없으면 **등록부에 항목 추가**(파생 함수 분기 증식 아님 — [59 §7-2]).
- **수정 금지**: 기존 보스 profile/handler·공통 renderer·CORE(어휘 추가가 CORE 개정을 요구하면 별도 게이트).

### 2-4. Human Gate 질문(보스 · LOCK)

①이 보스의 질문이 손에 잡히는가(재미) ②예고→대응→결과가 읽히는가 ③무대가 이 보스의 정체성을 말하는가(포즈·관계선·결과) ④기존 3보스로 돌아가도 아무것도 새지 않는가 ⑤귀여움/보는 맛 유지.

### 2-5. 완료 정의 (LOCK)

[59 §26] DoD 1·5·6·7·8·9 충족 + smoke 등재 + closeout 고정 + **다음 보스가 이 절차를 그대로 복사할 수 있음**(절차 재현성).

---

## 3. B. New Job Cycle

### 3-1. 입력

직업의 재미 질문(이 직업이 무대/전투에 더하는 관전 포인트 1개) · gameplay 역할([22] 로스터·준게이트 범위 표 필수) · 파티 가독성 검토(4인 원호 어디에 서는가).

### 3-2. 단계 (LOCK)

| # | 단계 | 산출 | 검증 |
|---|---|---|---|
| 1 | 재미 질문 | 문서 | 유키 승인 |
| 2 | gameplay 역할 | CFG.allies 항목 또는 [22] 준게이트 어댑터(범위 표) | smoke 영향 검토(파티 구성 변경은 smoke 재-baseline 사유 — 명시 보고) |
| 3 | Actor Profile | [59 §10-1] 등록 1건 | 공통 resolver 무수정 확인 |
| 4 | pose vocabulary | 독립 프리뷰(포즈 팩 — [51] 선례) | 프리뷰 실기 |
| 5 | signal-to-pose map | profile 데이터([A] 신호만 — 근거 없는 신호 매핑 ⛔) | [54] 방식 입력 감사 |
| 6 | anchors 등록 | profile anchors | rect 실측 |
| 7 | 스킬 stage mapping | 해당 직업 스킬의 cue 정의 | C 사이클과 공유 |
| 8 | party readability | 배치·scale·색 정체성([50][52] 선례) | 390 실측·겹침 0 |
| 9 | runtime validation | pane 실엔진: 포즈 전이·stale 0·타 직업 무영향 | §1-4 |
| 10 | Human Gate | ①역할이 무대에서 읽히는가 ②포즈가 행위를 말하는가 ③파티가 여전히 귀엽고 정돈돼 있는가 | §1-5 |
| 11 | lock | closeout·커밋·재-baseline | §1-7 |

### 3-3. 규칙 (LOCK)

- **기존 직업 분기 추가 없이 등록**: ACTOR_PROFILES에 1건 추가가 전부여야 한다. sbFigPose류 공통 함수에 jobId if가 필요해지면 §1-6 HOLD.
- **포즈 부족 fallback**: availablePoses가 비어도 성립한다(도적/마법사/주술사가 현재 그 상태로 FINAL PASS — 포즈 0=기본 자세·[59 §20]).
- **역할 가독 기준**: 실루엣+손 오브젝트+강조색으로 3초 안에 역할이 읽힌다([41 §G] 읽기 포인트 ≤3).

### 3-4. 완료 정의 (LOCK)

[59 §26] DoD 2·4·5·6·7·8 충족 + 파티 전 구성 재실측(overflow·겹침 0) + 절차 재현성.

---

## 4. C. New Skill Cycle

### 4-1. 입력

gameplay effect(수치·대상·비용 — [03/09] 스킬 풀·[23] 준게이트 계약 경로) · source/target(사제→누구) · 성당 로드아웃 카테고리([38]).

### 4-2. 단계 (LOCK)

| # | 단계 | 산출 | 검증 |
|---|---|---|---|
| 1 | gameplay effect | CFG.skills 또는 준게이트 어댑터([23] R 계약) | smoke·수동 실증 |
| 2 | source/target 확정 | cue의 sourceActor/targetActor | — |
| 3 | intent 분류 | 공격/보호/차단/수습/흡수/예고([59 §13]) | — |
| 4 | phase 설계 | 즉시(CONTACT)·cast(TELL→CONTACT)·지속(sustained 신호) | [59 §9] 대조 |
| 5 | cue 정의 | cue 데이터 1건(visualKind·priority·cleanup) | — |
| 6 | anchor 지정 | registry 의미 이름만(selector 직서 ⛔) | — |
| 7 | contact/result 표현 | careLanded 등 순간 신호 연결 | 계산과 같은 tick([53 §10]) |
| 8 | cancellation | cast형이면 취소 매트릭스 적용(취소=잔광 0) | pane 실증 |
| 9 | validation | §1-4 공통+버튼 4상태(gLock/dis/noMana/개별cd) 무손상([56][57] 계약) | 체크 |
| 10 | Human Gate | ①손맛(누른 보람이 보이는가) ②수습이 결과로 읽히는가 ③버튼 정보 계약 무손상 | §1-5 |
| 11 | lock | closeout·커밋 | §1-7 |

### 4-3. 규칙 (LOCK)

- **연출 없는 스킬 허용 기준**: 정보가 UI(플로팅·로그·바)로 충분히 전달되는 스킬은 무대 cue 없이 성립한다(현행 6스킬 전부가 그렇게 FINAL PASS — 연출은 추가 가치이지 요건이 아니다).
- **공통 cue로 해결할 범위**: 단일 대상 수습 임펄스·파티 파동·보호층 부여 — 기존 visualKind(healArc/pulse/shieldContact)로 커버되면 신규 kind ⛔.
- **고유 cue가 필요한 기준**: 새 관계 형태(예: 역방향 흡수·다단 연결)가 기존 kind로 왜곡될 때만 — 2실사례 규칙 예외로 승인 필요.
- **새 timer 금지 원칙**: cue 수명은 스킬의 실제 상태(p.cast·hot/seed·cd)에서 파생 MUST — 스킬 전용 setTimeout 신설 MUST NOT([59 §14-3]).

### 4-4. 완료 정의 (LOCK)

[59 §26] DoD 3·5·6·7·8 충족 + 성당 표기([38] 카테고리·비용) 정합 + 절차 재현성.

---

## 5. 필요한 문서·체크·showcase (전 사이클 공통 · LOCK)

| 산출물 | 내용 |
|---|---|
| 카드 문서(docs/NN) | 목적·기준 HEAD·설계·구현·실측·회귀·비범위([56][57] 형식) |
| 신규 체크(dev/*_check.js) | 실코드 교차검증([59 §24]) — profile 등록·게이트·fallback·stale 0·smoke |
| showcase | 헤드리스 컷+실기 시나리오(closeout에 gate 결과와 함께 고정) |
| 포인터 갱신 | docs/98(카드 체인)·99(핸드오프)·102(색인) |
| closeout | Human Gate 결과 고정([58] 형식) |

---
*— 렌 (連·鍊·紅蓮), EP25. 파쇄자가 걸어온 길(재미 → 피규어 → 포즈 → 관계선 → 접촉 → 게이트)을 돌아보면, 그것이 그대로 생산 라인의 도면이었다. 이 계약은 그 길을 포장한 것이다 — 다음 보스는 길을 내며 걷지 않고, 포장된 길 위를 걷는다.*
