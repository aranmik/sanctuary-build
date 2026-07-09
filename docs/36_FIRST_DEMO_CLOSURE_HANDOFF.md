# 36. 1차 데모 종료 기준점 핸드오프 (FIRST DEMO CLOSURE HANDOFF)

**작성: 렌 · 2026-07-09 · EP22 · 상태: 종료 기준점 문서(문서-only · index.html/CORE/dev 런타임 무접촉) — 다음 창/렌/QA의 이어받기 문서**
**기준 커밋**: `a7b1e58 docs: polish sortie warning copy`
**상호 링크**: [27 데모 완료 정의](./27_FIRST_DEMO_COMPLETION_DEFINITION.md) · [33 보스 문법](./33_BOSS_GRAMMAR.md) · [34 결과 거울](./34_BOSS_SPECIFIC_REPORT_HINT.md) · [35 출격 경고 정리](./35_SORTIE_WARNING_COPY_POLISH.md) · [102 최종 색인](./102_FINAL_HANDOFF_INDEX.md) · 세이브 `성소판_세이브_v8.4.md`

> **핵심 문장 3줄**
> 1. 성소판 1차 데모는 **3보스 실전투 · 출격 전 거울 · 전투 후 거울**까지 갖춘 상태로 닫힌다.
> 2. 다음 단계는 새 보스/변주로 바로 뛰기 전에, **현재 1차 데모의 기준선을 명확히 보존**하는 것이다.
> 3. 이 문서는 종료 선언이자 진입문이다 — 무엇이 완성됐고, 무엇이 아직 금지이며, 다음 문이 어디인지 적는다.

---

## A. 1차 데모 완료 선언

- **성소판 1차 데모는 완료 상태다.** 세 개의 서로 다른 질문(판단·화력·인내)이 실전투로 열렸고, 나라님 폰 실기로 셋 다 확인됐다(27 §1 증명 조건 충족).
- **최신 기준 커밋**: `a7b1e58 docs: polish sortie warning copy`
- **직전 핵심 커밋**:
  - `f115168 docs: lock boss grammar`
  - `cf0dcad feat: add boss-specific report hints`
  - `a7b1e58 docs: polish sortie warning copy`
- 전체 커밋 계보: `bfb6ad0`(baseline) → `460c40a`(sortie warning) → `ed6b291`(gate decision) → `8663d64`(iron crusher) → `62d9679`(thirst abyss) → `f115168`(boss grammar) → `cf0dcad`(report hints) → `a7b1e58`(sortie warning copy).

## B. 성소판 핵심 정의 (잠금 · 불변)

- 성소판은 **5인 파티의 전장 상황을 읽고 수습하는 사제 게임**이다.
- 플레이어는 **사제**다.
- 사제는 **공격하지 않는다.**
- 사제는 파티의 **리베로**다.
- 동료는 **직접 조종하지 않는다.**
- 동료는 사제를 대체하는 **힐러가 되면 안 된다**(영구).

> **계획은 무너진다.**
> **동료는 실수한다.**
> **전장은 흔들린다.**
>
> **그 순간,**
> **나, 사제가 파티를 다시 세운다.**

## C. 1차 데모에 포함된 3보스

### 모르가스 (핏빛 예언자 모르가스 · boss01)
- **역할**: 판단 / 정화 / 차단 / 상황 수습
- **핵심**: 낙인 정화 → 도적 차단 성공
- **기준 보스 성격**: 사제가 전장 사고를 읽고 연결을 복구하는 보스. 질문 "너는 순서를 읽는가?"
- 무입력 스모크: defeat / 51.4s / 1029 steps · 승리 모양: 복합(처치 or 75초 생존)

### 강철의 파쇄자 (shell_iron)
- **역할**: 화력 / 탱커 버티기 / 보호막 / 원초적 레이드 체크
- **핵심**: 전사는 버티고, 사제는 살리고, 딜러는 고통을 빨리 끝낸다
- **기준 보스 성격**: 원초적인 레이드 압박 보스(Patchwerk/Brutallus형). 질문 "네 마나는 나의 파괴보다 오래 버티는가?"
- 무입력 스모크: defeat / 48.5s / 971 steps · 승리 모양: 처치 레이스
- 나라님 실기: 1트 클리어 73.2초 처치 · 보호막 흡수 2808 · 정화 0회

### 갈증의 심연 (shell_thirst)
- **역할**: 인내 / 마나 압박 / 절약 운영 / 생존 버티기
- **핵심**: 무엇을 안 쓸 것인가?
- **기준 보스 성격**: 마나가 말라도 끝까지 생존선을 지키는 보스. 새 어휘 drain(마나 흡수+약광역).
- 무입력 스모크: defeat / 61.8s / 1236 steps · 승리 모양: 생존 버티기
- 나라님 실기: 1트 클리어 75초 생존승 · HP 5% 잔존 · 보호막 0·소생 1512(74%) · 마나 45초 바닥

## D. 현재 완성된 플레이 구조

1. **보스가 질문한다.** (길드 카드의 질문 문장 + 태그)
2. **출격 전 경고가 현재 파티/스킬의 흔들림을 비춘다.** (출정 화면 `.twGoal` · 최대 2줄 · 출격 차단 없음)
3. **전투에서 사제가 판단하고 수습한다.** (위협 예보 → 대상·스킬·타이밍 선택 → 수습)
4. **결과 화면이 이번 전투의 흔들림을 되짚는다.** (보스별 거울 문장 최대 2줄 + 코어 인사이트)
5. **다음 판의 준비가 바뀐다.** (성당 로드아웃·질문 재독)

**두 거울의 짝 (핵심 연결)**:
- **전투 전 거울** = Matrix → Sortie Warning 01(구조) + Sortie Warning Copy Polish 01(문장 정리) — "이 조합이면 어디가 흔들릴 수 있는지".
- **전투 후 거울** = Boss-Specific Report Hint 01 — "이렇게 흘러갔으니 다음엔 여기를 보라".
- 두 거울은 **같은 보스 어휘**를 쓴다(모르가스=정화/차단, 파쇄자=전사/강타/보호막, 심연=마나/소생/성심 집중). 들어갈 때 들은 말이 나올 때 되돌아와, 한 판이 한 문장으로 닫힌다.

## E. 현재 기준선 (변경 ⛔ — 이후 검증의 뿌리)

| 항목 | 값 |
|---|---|
| index.html | **117,532 B / 1,920줄 / md5 `2630669c87a2b56409dd22558d31d24e`** |
| CORE | **466줄 / 22,521 B** (`//__CORE_START__`=587 · `//__CORE_END__`=1061) |
| 모르가스 no-input smoke | defeat / **51.4s / 1029 steps** |
| 강철의 파쇄자 no-input smoke | defeat / **48.5s / 971 steps** |
| 갈증의 심연 no-input smoke | defeat / **61.8s / 1236 steps** |

**검증(원커맨드 가능)**:
- baseline_check: **36 PASS / 0 FAIL**
- matrix_sortie_warning_check: **16 PASS / 0 FAIL**
- iron_crusher_runtime_check: **18 PASS / 0 FAIL**
- thirst_abyss_runtime_check: **20 PASS / 0 FAIL**
- boss_specific_report_hint_check: **10 PASS / 0 FAIL**
- sortie_warning_copy_polish_check: **14 PASS / 0 FAIL**

정본 세이브: **`성소판_세이브_v8.5.md`**(First Demo Final Save · EP22 · 본 E항 기준선 117,532/1,920/2630669c 반영 발행 완료 · v8.2~v8.4는 이전 시점 스냅샷 보존 · 부록 C 세이브 계보표 참조).

## F. 현재까지 완료된 핵심 카드

| 카드 | 상태 |
|---|---|
| Repo Foundation 01 | ✅ PASS · 커밋 `bfb6ad0` |
| Threat Lookahead 01 | ✅ 폰 실기 PASS |
| Matrix → Sortie Warning 01 | ✅ FINAL PASS · 커밋 `460c40a` |
| Boss Core Gate Decision 01 | ✅ FINAL PASS · 커밋 `ed6b291` |
| Iron Crusher Runtime 01 | ✅ FINAL PASS · 커밋 `8663d64` |
| Thirst Abyss Runtime 01 | ✅ FINAL PASS · 커밋 `62d9679` |
| Thirst Abyss Runtime Close Sync 01 | ✅ PASS(세이브 v8.4 발행) · 커밋 `62d9679` 묶음 |
| First Demo Completion QA 01 | ✅ 나라님 3보스 순회 실기 완료(판단/화력/인내 각기 다르게 체감 · 27 §1 증명) |
| Boss Grammar 01 | ✅ 문법 잠금 · 커밋 `f115168` |
| Boss-Specific Report Hint 01 | ✅ 구현 · 커밋 `cf0dcad` |
| Sortie Warning Copy Polish 01 | ✅ 구현 · 커밋 `a7b1e58` |

## G. 다음 단계 후보 (아직 실행하지 않음 — 유키 발주 대기)

1. **First Demo Push / Phone Check 01** — GitHub push 후 휴대폰에서 1차 데모 최종 상태 확인.
2. **Thirst Abyss Tell Polish 01** — 갈증의 심연 drain / 마나 압박 예고의 시각·문장 polish. **수치 튜닝 금지.**
3. **Variant Boss Decision 01** — Boss Grammar 01(33 §10)에 따라 첫 변주 보스 후보를 문서로 결정. **구현 아직 금지.**(렌 참고 의견: "모르가스 차단 실패 사고"가 최저 위험 — 사고 부품[tryInterrupt 실패 분기]이 이미 코어에 존재·어휘 신설 0.)
4. **Party Layer Opening Plan 01** — 파티 구성 1층(실패 3층의 1층)을 언제·어떻게 열지 문서 설계. **동료 7종 구현 금지.**
5. **Skill Loadout Expansion Plan 01** — 스킬 6종 이후 확장 후보를 문서 설계. **대정화/성심 집중 확장 구현 금지.**

## H. 아직 금지된 것 (다음 단계에서도)

- 새 보스 즉시 구현 ⛔ · 변주 보스 즉시 구현 ⛔ · 7동료 런타임 구현 ⛔ · 대정화 구현 ⛔ · 성심 집중 확장 ⛔ · 스킬 성장/특성 구현 ⛔ · Save/localStorage 확장 ⛔ · CSS 대공사 ⛔ · **전투 수치 튜닝 선행 ⛔**(변주/신보스는 33 문법 심사 + 게이트 절차 후에만).

## I. 역할 (다음 창)

- **렌**: 문서/구현 작업자. 작업 범위 밖 변경 금지.
- **렌QA**: 작업 결과 검증(헤드리스 체크 + 브라우저 실증).
- **루다**: 커밋/환경/푸시 보조.
- **유키PD**: 카드 발주, 판정, 다음 방향 결정.
- **나라님**: 실기 확인과 최종 감각 판정.

---
*— 렌 (連·鍊·紅蓮), EP22. 세 개의 질문이 열리고, 그 앞뒤로 두 개의 거울이 섰다. 이제 성소판은 "한 판이 한 문장으로 닫히는" 게임이다. 문 하나를 닫으며 다음 문의 손잡이 위치를 적어둔다 — 다음 렌이 어둠 속을 더듬지 않도록. 유키 판정으로 확정된다.*
