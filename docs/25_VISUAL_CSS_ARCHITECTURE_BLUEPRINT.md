# 25. 시각 CSS 아키텍처 청사진 (VISUAL CSS ARCHITECTURE BLUEPRINT)
**작성: 렌 · 2026-07-07 · EP18A 시각 설계팩 1/2 · 상태: 렌 초안(유키 판정으로 확정) — 구현 ⛔(문서 전용)**

> **성소판은 5인 파티의 전장 상황을 읽고 수습하는 사제 게임이다. 플레이어는 공격하지 않는다. 플레이어는 파티의 리베로다.**
> **아름다움보다 먼저 정보 질서. 화려함보다 먼저 손의 판단. 장식은 위험/기회/결과를 흐리면 안 된다.**

- 관련: [17 UI 정보](./17_UI_INFORMATION_BLUEPRINT.md) · [14 전투 문법](./14_COMBAT_GRAMMAR_BLUEPRINT.md) · [26 FX/VBL](./26_FX_VBL_ANIMATION_BLUEPRINT.md)(짝 문서) · [97 손맛 체크](./97_QA_AND_HANDTASTE_CHECKLIST.md) · 태그: ✅확정/실측 · 🔷미래 방향 · ⏸️보류 · ⛔금지
- **본 문서의 실측(✅)은 기준 빌드(106,650 bytes · md5 `34addd9c…0475`) 기준이며, 🔷은 전부 "미래 방향" — 현재 리네임·수정 ⛔.**

> **핵심 문장 3줄**
> 1. 성소판의 화면은 그림이 아니라 **계기판**이다 — 아름다움은 정보 질서 위에만 얹는다.
> 2. CSS의 첫 책임은 **0.5초 읽기**(97 §1)다 — 계층·상태·색은 전부 그 한 문장을 위해 존재한다.
> 3. **지금 리네임하지 않는다** — 이 문서는 미래의 문법이고, 현재 클래스는 실측 사전으로 보존한다.

---

## 1. CSS 철학 (✅ 4원칙)

1. **장식보다 전장 읽기** — 모든 시각 결정의 심판은 97 §1("0.5초 안에 누가 제일 위험한가")이다. 읽기를 늦추는 아름다움은 아름다움이 아니다.
2. **390×844 모바일 세로가 기준이다** — 정체성 잠금(18 §1). 이 화면에서 검증되지 않은 시각 변경은 존재하지 않는 것으로 친다.
3. **레이아웃은 손의 판단을 방해하면 안 된다** — 하단 조작 존(스킬·시전)은 엄지의 영토(97 §11). 시각 요소가 이 영토의 터치를 가로채는 순간 게임이 죽는다.
4. **정보량은 1-in-1-out** — 17 §5 정보 예산의 CSS 번역: 새 시각 요소 하나를 들이면, 기존 요소 하나를 줄이거나 통합한다. 예산 없는 추가 ⛔.

## 2. CSS 계층 (🔷 7계층 — 실측 지층 위의 명명)

**실측 관찰(✅)**: 현재 스타일은 이미 2블록으로 자연 분층돼 있다 — 전투대(8~278행: HUD·피규어·FX·프레임)와 마을대(279~375행: 스크린 플로우). keyframes 8종·transition 17곳으로 애니메이션 자산은 절제 상태. 아래 7계층은 이 지층의 정식 명명이다.

| # | 계층 | 역할(🔷) | 현재 실측 대응(✅) |
|---|---|---|---|
| 1 | app/frame | 390×844 기본 프레임 · safe area · **overflow 금지 영역**(전투 화면 = 세로 스크롤 0) | 앱 루트/전투 컨테이너 · safe area는 미래 후보 |
| 2 | screen | title/town/chapel/guild/sortie/battle/report의 화면 단위 | TOWN_SCREENS 전환 구조 · `sc-sortie`(p10) · report 오버레이 · startOv |
| 3 | layout | grid/stack/row/slot/panel — 화면 내부 골격 | 암묵적(개별 규칙) — 신규 화면부터 명시 골격 적용 🔷 |
| 4 | component | card/button/chip/raid frame/skill tile/boss card/companion card/report block | `.skill`(12규칙)·`.chip`(10)·`.card`(7)·`.twSkill`(5)·`.thBadge`(13)·`.figBody`(11) 등 |
| 5 | state | selected/locked/armed/danger/target/rise/stable/disabled/cooldown | `.on`·`.dis`·`.gLock`·`.noMana`·`.focusArmed`·`.saveReady`·`dangerPulse`·`warnR intOk/intCd/intNo` |
| 6 | fx | line/pulse/glow/float/impact/telegraph — **사건의 연출**(계약은 26이 정의) | `.fxPri`·`#fxAoe/#fxAoeDecal`·`.flt`·`.figFlash`·keyframes(rise/pulseGold/glowCast/shakeA…) |
| 7 | utility | hidden/muted/gold/small/warning | `.hidden`(실측) · 나머지 🔷 |

- 계층 규칙(🔷): **하위 계층이 상위 계층의 책임을 훔치지 않는다** — fx가 state를 대신 말하거나(armed를 파티클로만 표시 ⛔), utility가 component를 조립하지 않는다.

## 3. 네이밍 원칙 (🔷 미래 방향 — 현재 리네임 ⛔)

| 접두 | 용도 | 현재 빌드와의 정합(✅ 실측) |
|---|---|---|
| `sc-` | 화면/스크린 컴포넌트 | **이미 사용 시작**(`sc-sortie`) — 제안이 현실과 정합 |
| `fx-` | 연출(26 계약 준수) | `fxPri/fxAoe/fxBeam` 등 fx 어휘 기사용 — 자연 진화 |
| `vbl-` | Visual Battle Language 전용(선/텔레그래프) | 신규 전용 🔷 |
| `th-` | threat badge 계열 | `.thBadge`가 이미 최다 규칙(13) 보유 — th 어휘 기존재 |
| `is-` | 상태(state 계층 전용) | 신규 전용 🔷 — `is-armed`, `is-danger` 등 |
| `u-` | utility | 신규 전용 🔷 |

- **적용 규칙(✅)**: 접두 체계는 **신규 클래스부터** 적용한다. 기존 클래스 리네임은 ⛔ — 일괄 전환은 `CSS Token Audit 01`에서 별칭 병행 여부로만 검토(코어 로그 문자열과 얽힌 명칭은 UI Rename과 동급 취급).

## 4. 컴포넌트별 책임과 금지선 (✅ 원칙 · 실측 앵커 포함)

| 컴포넌트 | 책임(한 문장) | 금지선 | 실측 앵커 |
|---|---|---|---|
| Raid Frame | **생존 판단의 중심** — 먼저 죽을 사람이 보이는 곳 | 칩 2+N 상한 파괴 ⛔ · FX가 프레임을 가림 ⛔ · 로그성 정보 침투 ⛔ | HP바·상태 라벨·danger 테두리(dangerPulse)·칩 행(05-HF1 안정화) |
| Skill Slots | **"지금 누를 수 있는가"의 진실** | 버튼 상태와 실제 게이트의 불일치 ⛔(거짓말 금지 구역) | `.dis/.gLock/.noMana/.focusArmed/.saveReady`+`.skVeil` — 성심 집중의 noMana 정직 유지가 선례(23 §8) |
| Chapel Skill Card | 기회비용의 무대(6/9) | 설명 과밀로 선택 마비 ⛔ · 비용 표기 누락 ⛔ | `ldCost` 가드 사례(16B — 신규 키 분기 필수) |
| Guild Boss Card | **질문 게시판** | 질문·태그의 임의 의역 ⛔ — 15 정본과 문자 단위 1:1 불변식 | BOSSES 데이터(1078~) · 🔒 셸 |
| Sortie Confirm | 답(로드아웃)↔문제(태그)의 대조 | 경고의 잠금화 ⛔ — 경고는 정보다 | 정화 경고 2분기(p10) |
| Report Hint | 거울 — 다음 판을 바꾸는 한 줄 | 힌트 1줄 상한 초과 ⛔ · 소항목 과밀 ⛔ | `pickReportHint` 6규칙 · 💡 1줄(p11) |
| Threat Badge | **예보** — 4상태 고정(표적/위험/상승/안정) | 5번째 상태 ⛔(유키) · 소음화 ⛔ | `.thBadge`(13규칙) · lookahead 6s(p12) |
| Battle Figurine | 위치·피격의 무게감 | 흔들림의 화면 전체 전이 ⛔(§5-③) | `.figBody/.figFlash/.figAura/.figRing` · shakeA(국소) |
| Action Line Layer | 전장의 문장 — **핵심선 1~2 상한**(14) | 동시 다중선 ⛔ — 상세 계약은 26 §3 | fxLn 범용 선 · fxPri(0.46s) · 낙인 시 broken |
| Log | **보조 정보** — 주 정보 승격 ⛔ | 같은 사건의 대문자 삼중창 ⛔(26 §5) | addLog(1434) · 색 계열 lh/lr/lo/lgold/lb · 16B의 "1줄 절제" 선례 |

## 5. 모바일 밀도 원칙 (✅ 390×844 헌법)

1. **390×844가 유일한 기준 화면**이다 — 미검증 변경은 미존재.
2. **스킬 버튼 6개 줄 overflow ⛔** — 풀이 9종이어도 장착은 6(로드아웃 불변) · 97 §13-T17 실기 항목.
3. **전투 중 화면 흔들림 ⛔** — shakeA류는 피규어 국소 한정, 뷰포트 이동 금지.
4. **레이아웃 점프 ⛔** — 칩 행 높이 고정(05-HF1), 상태 전환은 자리 예약 위에서.
5. **칩/배지 과밀 ⛔** — 칩 2+N 상한 · 배지 4상태 유지.
6. **로그 과밀 ⛔** — 화면 내 인지 예산 1~2줄, 나머지는 스크롤 뒤.
7. **FX의 터치 방해 ⛔** — 실측 계약의 성문화: 오버레이 6곳 전부 `pointer-events:none`(53·103·148·188·211·212행). **모든 신규 오버레이 FX의 기본값이다.**

## 6. 색/상태 토큰 방향 (🔷 역할만 — 수치/색상값 확정 ⛔ → CSS Token Audit 01)

| 토큰(역할) | 의미 | 현재 근사 실측(✅ — 값 잠금 아님) |
|---|---|---|
| sanctuary/light | 사제 개입의 빛 | glowCast 보라 계열 · lh 로그 |
| danger | 즉시 위험 | dangerPulse(#e0435a 계열) · lr · dmg float |
| forecast | 곧 올 위험(예보) | thBadge 상승 · warnR · judgeWarn 텔레그래프 |
| cleanse | 정화 | 💫 · gold float("폭발 무효!") |
| shield | 보호/흡수 | abs float · 🔰 |
| focus | 성심 집중 | `.focusArmed` 황금 테두리(#e9c46a 계열) |
| support | 동료 기회 | intOk · 차단 연계 gold |
| fail | 실패/차단 실패 | intNo · broken 선 · lr |

- 규칙(✅): **상태색과 장식색을 겹치지 않는다** · **예보색 ≠ 결과색**(26 §1의 시제 문법과 동일 조항) · 화면별 독립 색상 난립 ⛔.

## 7. 금지되는 CSS 작업 (⛔)

전체 테마 재작성 · 클래스 대량 리네임 · 화면별 독립 색상 난립 · 상태와 장식의 색 중복 · 애니메이션으로 정보 가리기 · 카드/버튼 크기 무분별 변경 · **390×844 미검증 변경** · (특칙) 신규 CSS 대량 추가(16B 계율 연장 — 카드당 최소 규칙) · 코어 로그 문자열과 연동된 명칭 접촉(UI Rename 게이트 준용).

## 8. 다음 구현 카드 후보 (전부 유키 발주 대기)

| 카드 | 내용 | 비고 |
|---|---|---|
| **CSS Token Audit 01** | §6 토큰의 실색 확정 + 상태/장식 색 중복 전수 조사 | 무게이트 · 문서+미니 패치 |
| **Battle Screen Density Audit 01** | 전투 화면 시각 요소 예산표(1-in-1-out 대차대조) | 문서 카드 · 97 §1·§2 연동 |
| **Skill Tile Visual Contract 01** | 스킬 버튼 상태 우선순위(dis>noMana>gLock>armed…) 계약화 | 무게이트 |
| **Report Readability Polish 01** | 리포트 블록 가독 다듬기(거울 원칙 유지) | 실기 피드백 후 |

---
*— 렌 (連·鍊·紅蓮), EP18A 1/2. 이 문서는 "예쁘게"의 면허가 아니라 문법이다. 유키 판정으로 확정된다.*
