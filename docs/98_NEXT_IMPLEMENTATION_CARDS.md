# 성소판 98 — 다음 구현 카드 (NEXT IMPLEMENTATION CARDS)
**작성: 렌 · 2026-07-07 · EP10 활주로 팩 · 상태: 실행 티켓(유키 PASS된 설계팩 기반)**

> **성소판은 5인 파티의 전장 상황을 읽고 수습하는 사제 게임이다. 플레이어는 공격하지 않는다. 플레이어는 파티의 리베로다.**
> 이 문서는 다음 렌이 **읽자마자 착공**할 수 있는 티켓 모음이다. 설계 근거는 각 카드의 참조 문서에 있다 — 티켓은 근거를 요약하지 않고 경계만 자른다.

- 읽는 순서: [99 핸드오프](./99_HANDOFF_NEXT_REN.md) → 본 문서 → 착공 카드의 참조 문서.
- 태그: ✅확정 / 🔷후보 / ⏸️보류 / ⛔금지

## 유키 결정 반영 (2026-07-07 · 본 티켓의 상위 게이트)

1. **개명 확정**: 신의 계시 → **빛의 잔향**(originRef: 신의 계시) · 결속 치유 → **서로울림**(originRef: 결속의 치유). **UI Rename 구현은 여전히 ⛔**(별도 GO).
2. **1차 데모 범위 확정** — 최소 합격선: 보스 2(모르가스+강철의 파쇄자) · 스킬 9(현행 8+성심 집중) · 동료 4 고정 · 성당 저장/복귀+길드 보드+출정 확인+리포트 힌트 · 저장은 세션 중심. 목표선: 보스 3(+갈증의 심연 **또는** 부식의 군체) · 스킬 9~10(대정화는 부식의 군체 채택 시에만 후보). **소실/주시형 보스는 1차 데모 제외.**
3. **19 저장 정책 채택** — 단, Chapel Save/Return 01은 **localStorage 확장 ⛔**, 세션 내 저장·마을 복귀까지만. 전투 중 저장·코어 직렬화·전투 스냅샷·자동 프리셋 저장 ⛔.

## 공통 규칙 (전 카드)

- **절대 수정 금지(공통)**: 코어 마커(`//__CORE_START__`~`//__CORE_END__`) 사이 전부(문자열 포함) · `CFG` 수치 · `SCRIPT` · `meleeTgt` · `Math.random`/이미지/외부 라이브러리 · localStorage 확장.
- **표준 검증 루틴(공통)**: 코어 byte-identical diff · `node --check` · 무입력 스모크 **defeat 51.4s** · 금지 grep 0 · div/section 균형 · `차단!`/`차단 실패!` 보존 · 소생/씨앗 로직 보존 · 신규 로직 헤드리스 유닛테스트(출하 경로 미잔류).
- **작업 관례**: 청크(heredoc) + `pNN.py`(`one()`/count==1) 패치 → outputs 복사 → present_files. 큰 산출 전 나라에게 예고.
- **완료 보고 공통 형식**: `[렌 → 유키] <카드명> 완료 보고` — ①변경 파일 ②구현/비구현 확인표 ③표준 루틴 결과(스모크 수치 포함) ④카드별 검증 결과 ⑤폰 실기 요청 항목 ⑥자체 PASS/HOLD. 각 카드의 "완료 보고" 행은 ④⑤의 카드 고유 항목만 명시한다.
- **권장 실행 순서**: ① Chapel → ② Guild → ③ Sortie → ④ Report Hint → ⑤ Threat Lookahead(①~④와 병행 가능) → ⑥ Boss Shell Cards(✅ 17B 문서 종결) → ⑦ 성심 집중(✅ 16B 완료) → ⑧ UI Rename(별도 GO 대기).

---

## 카드 1 — Chapel Save/Return 01 ✅ **구현 완료 · 나라님 폰 실기 대기** (2026-07-07 · p08.py · 유키 PASS candidate)

> 상태: 아래 스펙대로 구현·표준 루틴 전부 통과(스모크 51.4s 유지). 최종 판정은 폰 실기(97 §9). 이하 원문은 착공 당시 티켓 그대로 보존.

| 필드 | 내용 |
|---|---|
| 목적 | 성당을 "고르고 **저장하고 마을로**"로 전환 — 장기 플로우 1보. [11 §1](./11_VILLAGE_BLUEPRINT.md) · [19 §4](./19_SAVE_DATA_BLUEPRINT.md) |
| 수정 파일 | `index.html`(chapel 마크업 버튼 1 + 어댑터 리스너) · `p08.py` |
| 절대 수정 금지 | 공통 + **localStorage/SAVE 셸 확장 ⛔**(유키) · `LOADOUT` 자료구조 · `enterBattle` 6개 검증 로직 |
| 구현 범위 | 성당에 [🏛️ 저장하고 마을로] 버튼 → 토스트("로드아웃 저장됨 — 이번 세션 동안 유지") + `village` 복귀. 6칸 미만이면 "저장됨 · 아직 N/6 — 전투 전까지 채워주세요" 안내 후 **복귀는 허용**(뒤로가기가 이미 무검증 복귀라 일관성 유지, 전투 차단은 기존 enterBattle이 담당) |
| 비구현 범위 | localStorage/프리셋 · 전투 시작 버튼 제거(Sortie 후 별도 HF) · 강화/패시브 UI · "저장됨/변경됨" 상태 칩(CSS 늪 방지 — 토스트로 충분) |
| 검증 방법 | 표준 루틴 + 시나리오: 성당 편집→저장→마을→성당 재진입 시 로드아웃 유지 / 저장→길드→전투 진입 시 `renderSkillSlots` 반영 / 6칸 미만 저장 시 안내 토스트 |
| 폰 실기 체크 | 버튼 터치 영역 · 토스트 문구 읽힘 · 성당→마을→길드→전투 동선이 "준비"로 느껴지는가([97 §9](./97_QA_AND_HANDTASTE_CHECKLIST.md)) |
| PASS 조건 | 표준 루틴 전부 통과 + 위 시나리오 3종 + 나라 실기 OK |
| HOLD 조건 | 스모크 ≠51.4 · 코어 diff 발생 · 세션 유지 실패 · 실기 동선 혼란 |
| 완료 보고 | 공통 형식 + ④시나리오 3종 결과 ⑤동선 체감·터치 영역 |

## 카드 2 — Guild Board Monster Select 01 ✅ **구현 완료(p09) · 실기 1차 잠정 OK**

| 필드 | 내용 |
|---|---|
| 목적 | 길드 보드를 다종 선택 **구조**로 — 보스 카드 복수 노출·선택 동선. [08 §4·§6](./08_GAME_FLOW_BLUEPRINT.md) |
| 수정 파일 | `index.html`(어댑터 `BOSSES` 확장 + guild 렌더/마크업) · `p09.py` |
| 절대 수정 금지 | 공통 + 신규 보스 `SCRIPT`/전투 로직 ⛔ · 보상 표시 ⛔(16 종속) · 해금 로직 ⛔(19 구현 전) |
| 구현 범위 | 보스 카드 2~3(모르가스 활성 + 셸 1~2 "🔒 준비 중" 표시) · 카드에 위험 태그 칩(08 §4 어휘) · 셸 탭 시 토스트("아직 열리지 않은 토벌") · 모르가스만 `enterBattle` |
| 비구현 범위 | 셸 보스 전투 · 해금 · 보상 · 추천 준비 상세(Sortie/데모 이후) |
| 검증 방법 | 표준 루틴 + 셸 카드 전투 미진입 확인 + 모르가스 정상 진입 + 태그 문구가 15 문서와 일치(grep 대조) |
| 폰 실기 체크 | 카드 가독성 · 태그 칩 읽힘 · 오탭 없음 · "문제를 고르는 곳" 체감 |
| PASS 조건 | 표준 + 미진입/진입 분기 정확 + 실기 OK |
| HOLD 조건 | 셸이 전투 진입되는 사고 · 태그 문구 불일치 · 실기 가독 불량 |
| 완료 보고 | 공통 + ④분기 검증·태그 대조 ⑤카드 가독성 |

## 카드 3 — Sortie Confirm 01 ✅ **구현 완료(p10) · 실기 1차 잠정 OK**

| 필드 | 내용 |
|---|---|
| 목적 | 출정 확인 화면 — 답(로드아웃)과 문제(태그)의 대조. **경고만, 잠금 아님.** [08 §3·§6](./08_GAME_FLOW_BLUEPRINT.md) |
| 수정 파일 | `index.html`(신규 화면 `sortie` — 어댑터 `TOWN_SCREENS`/마크업/렌더) · `p10.py` |
| 절대 수정 금지 | 공통 + 경고의 잠금화 ⛔ · `enterBattle` 검증 로직 변경 ⛔ |
| 구현 범위 | guild 선택 → sortie(로드아웃 6아이콘·동료 4·보스 태그·경고 문구[최소: 정화 경고 재사용]) → [⚔️ 출정] → 전투. 뒤로가기 → guild |
| 비구현 범위 | 성당 시작 버튼 제거(완료 후 별도 미니 HF로 나라 컨펌) · 추천 준비 자동 생성 · 동료 상세 |
| 검증 방법 | 표준 루틴 + 동선 guild→sortie→battle/back + sortie 경유·미경유(성당 임시 버튼) 양쪽에서 전투 정상 |
| 폰 실기 체크 | "답과 문제를 맞대보는" 체감 · 경고가 잔소리가 아니라 정보로 느껴지는가 · 화면 추가로 동선이 무거워지지 않았는가 |
| PASS 조건 | 표준 + 동선 무결 + 실기에서 확인 화면의 가치 체감 |
| HOLD 조건 | 동선 루프 꼬임 · 경고가 잠금처럼 오독 · 실기 "번거로움" 판정 |
| 완료 보고 | 공통 + ④동선 매트릭스 ⑤확인 화면 가치 체감 |

## 카드 4 — Report Hint 01 (08C) ✅ **구현 완료(p11) · 실기 1차 잠정 OK**

| 필드 | 내용 |
|---|---|
| 목적 | 거울 확장 — **코어가 이미 집계 중인** 값 노출 + "다음 판 한 줄". [08 §5](./08_GAME_FLOW_BLUEPRINT.md) · [17 §1-④](./17_UI_INFORMATION_BLUEPRINT.md) |
| 수정 파일 | `index.html`(`showReport` 어댑터부 + 힌트 선택 함수) · `p11.py` |
| 절대 수정 금지 | 공통 + 코어 `report()`/`st` 구조 ⛔ · 신규 집계의 코어 삽입 ⛔ |
| 구현 범위 | 리포트 소항목 2~3(예: 마나 바닥 `oomT`>0일 때 "마나 바닥: N초" · 최저 마나) + 규칙 기반 힌트 1줄(결정론 — 우선순위 표로 1개 선택, 15 §5 문장 스타일) |
| 비구현 범위 | 기록실/아카이브(19 이후) · 스킬별 코어 승격 · 힌트 다변화(1줄 고정) |
| 검증 방법 | 표준 루틴 + 힌트 선택 함수 헤드리스 유닛(입력 rep 모킹→기대 힌트) + 값 부재 시 소항목 미표시 |
| 폰 실기 체크 | 리포트가 길어져 "거울"이 흐려지지 않았는가 · 힌트 한 줄이 다음 판 행동을 실제로 바꾸는가([97 §8](./97_QA_AND_HANDTASTE_CHECKLIST.md)) |
| PASS 조건 | 표준 + 유닛 통과 + 실기 "다음 판이 바뀐다" 체감 |
| HOLD 조건 | 리포트 과밀 판정 · 힌트가 잔소리 판정 |
| 완료 보고 | 공통 + ④유닛 결과·표시 분기 ⑤거울 체감 |

## 카드 5 — Threat Lookahead 01 ✅ **구현 완료(p12) · 실기 개별 판정 대기**

| 필드 | 내용 |
|---|---|
| 목적 | 위협 배지 실데이터화 — **유키 승인 1단계.** [14 §4](./14_COMBAT_GRAMMAR_BLUEPRINT.md) · [17 §7](./17_UI_INFORMATION_BLUEPRINT.md) |
| 수정 파일 | `index.html`(어댑터 `threatBadge()` 교체 + lookahead 헬퍼 — `SCRIPT`/`S.si` **읽기 전용**) · `p12.py` |
| 절대 수정 금지 | 공통 + **소실 본체 ⛔ · 코어 표적/`SCRIPT` 수정 ⛔(읽기만) · 주시 이벤트 추가 ⛔** — Core Gate Decision 전 일체 금지(유키) · 배지 5번째 상태 추가 ⛔ |
| 구현 범위 | 규칙(14 §4): 표적=`mt` / 위험=강타 시전 대상 or 위험 디버프 보유 / 상승=향후 ~6s 내 스크립트 위협 예정(lookahead 상수 어댑터 보관) / 안정=기타. 문구·색·CSS 기존 유지 |
| 비구현 범위 | 소실 버튼 · 사제 주시선 · 배지 신규 연출 · lookahead 창 UI 노출 |
| 검증 방법 | 표준 루틴 + **결정론 유닛테스트**: 고정 스크립트 대비 기대표(예: t≈4~10 mage=상승[10s 낙인 예고]→위험[보유] · t≈8 강타 중 war=위험 · 평시 war=표적) 전 구간 대조 |
| 폰 실기 체크 | 배지가 "예보"로 읽히는가 · 깜빡임/소음 없는가 · 위험/상승 구분이 행동을 바꾸는가 |
| PASS 조건 | 표준 + 기대표 전 구간 일치 + 실기 예보 체감 |
| HOLD 조건 | 배지 플리커 · 기대표 불일치 · 실기 "소음" 판정 |
| 완료 보고 | 공통 + ④기대표 대조 로그 ⑤예보 체감 |

## 카드 6 — Boss Shell Cards 01 ✅ **종결(EP17A/17B — 문서 기준)** · 파쇄자 2번째 확정 · 심연 3번째 채택 · 군체/대정화 이월

> 종결 근거: 셸 노출(이름·질문·태그)은 p09 기구현(15와 문자 단위 1:1) · 라인업 확정은 [24](./24_DEMO_BOSS_DECISION.md) + 15 §2+. **실전투 구현은 Boss Core Gate Decision 이후에만.** 3번째 카드 문구/확정 배지 등 빌드 반영이 필요해지면 별도 미니 카드(코드)로 발주.

| 필드 | 내용 |
|---|---|
| 목적 | 셸 보스들의 **내용물** — 15 문서의 질문/태그/소개를 길드 카드 데이터로. [15 §3](./15_MONSTER_BOSS_BLUEPRINT.md) |
| 수정 파일 | `index.html`(어댑터 `BOSSES` 데이터: 강철의 파쇄자 + 갈증의 심연 **또는** 부식의 군체[데모 목표선 선택과 동기]) · `p13.py` |
| 절대 수정 금지 | 공통 + **신규 보스 전투 구현 ⛔(SCRIPT 없음 — 카드/태그 셸만, 유키)** · 해금 로직 ⛔ |
| 구현 범위 | 셸 2종의 이름·한 줄 질문·태그 칩·"🔒 준비 중" — 15 문서 문구와 **문자 단위 일치** |
| 비구현 범위 | 전투·스크립트·밸런스 · 3번째 보스 확정(대정화 연동 판단은 유키 몫) |
| 검증 방법 | 표준 루틴 + 15 문서 대조 grep + 셸 미진입 재확인 |
| 폰 실기 체크 | 질문 문장이 "싸우고 싶게" 만드는가 · 잠금 표시가 답답함이 아니라 기대감인가 |
| PASS 조건 | 표준 + 문구 일치 + 실기 기대감 체감 |
| HOLD 조건 | 문구 불일치 · 실기 "미완성 티" 판정 |
| 완료 보고 | 공통 + ④문구 대조 ⑤기대감 체감 |

## 카드 7 — Priest Skill: Sacred Focus / 성심 집중 01 ✅ **구현 완료 · 유키 PASS candidate · 나라님 폰 실기 1차 확인 · 잠정 OK(최종 잠금 아님)** (2026-07-07 · p13.py)

> **16B 결과(원문 티켓은 아래 그대로 보존 — 착공 당시 계획과 달라진 점 주의)**: 채택 = **B안 안전형·혼합형**([23 §8](./23_SACRED_FOCUS_IMPLEMENTATION_CONTRACT.md)). 수치 확정 = **쿨다운 30s · armed 8s · GCD 사용 · 전투 시작 즉시 가용 · 실패/무산 유지 · 적용 성공 시 소모**(원문 "제안 25s"와 다름). 적용 = 빠른 치유·보호막·정화(환급형) + 소생·기도씨앗(진짜 무료) / 제외 = 깊은 치유·공명의 기도·긴급 구원 · 향후 스킬 기본 제외. 패치 = **p13.py**(원문 표기 p14 — 카드 6 스킵으로 번호 승계). **리포트 ledger 항목은 유키 결정(16B-6)으로 미구현**(원문 구현 범위와 다름). 검증 = 표준 루틴 전부 + 전용 유닛 23/23 PASS. **준게이트 기록**: core-paid mana refund — Core Gate 개정 시 재검토.

| 필드 | 내용 |
|---|---|
| 목적 | 무게이트 신규 스킬 — "다음 마나 스킬 1회 마나 0" 쿨기. 데모 9번째 스킬. [09 §4-3](./09_PRIEST_SKILL_BLUEPRINT.md) |
| 수정 파일 | `index.html`(어댑터 스킬 — 소생/씨앗 패턴: 정의+버튼 로직+`LOADOUT_POOL` 9번째+`SK_ICON`/`SK_DESC`+성당 풀) · `p14.py` |
| 절대 수정 금지 | 공통 + **코어 `CFG.skills` 접촉 ⛔**(어댑터 스킬로만) · 확률 요소 ⛔ · 타 스킬 수치 ⛔ |
| 구현 범위 | 즉시 시전 · 쿨(제안 25s — **착공 시 유키 확정**) · 활성 중 다음 마나 소모 스킬 1회 마나 0(신성력 스킬 제외) · 사제 칩 표시 · 리포트 ledger 항목(절약 마나) |
| 비구현 범위 | 극대화류 부가효과(원형의 확률부 — ⛔) · 패시브화 · UI Rename 동시 처리 |
| 검증 방법 | 표준 루틴 + 헤드리스 유닛(활성→`big` 사용 시 마나 불변·1회 소진·신성력 스킬에 미적용) + 로드아웃 9풀 렌더·6칸 검증 무영향 |
| 폰 실기 체크 | "아껴 쓰는 손맛" — 깊은 치유/기도 직전 콤보 체감 · 9풀에서 기회비용 고민이 깊어졌는가 |
| PASS 조건 | 표준 + 유닛 + 실기 콤보 손맛 OK |
| HOLD 조건 | 마나 이중 차감/미차감 버그 · 실기 "존재감 없음" 판정 |
| 완료 보고 | 공통 + ④유닛 결과 ⑤콤보 손맛 |

## 카드 8 — UI Rename 01 ⏸️ (**별도 GO 대기 유지** — 유키 · EP16C 재확인)

| 필드 | 내용 |
|---|---|
| 목적 | 표시명 일괄 개명 — 단일→빠른 치유 · 강력→깊은 치유 · 치유의 기도→공명의 기도 (+미래 스킬은 확정명 사용: 빛의 잔향·서로울림). [20 §1·§3](./20_NAMING_LEGAL_SAFETY_BLUEPRINT.md) |
| 수정 파일 | (GO 시) `index.html` 문자열 — **주의: 렌 사전 조사 결과 스킬명이 코어 내부 로그 문자열에도 존재**(예: 코어 L('✨ 단일 치유 → …')). 완전 개명 = 코어 문자열 접촉 = **byte-identity 파기 → pristine 재-baseline 의식 필요** |
| 절대 수정 금지 | **GO 전 일체 구현 ⛔(유키: 오늘 금지).** GO 후에도 로직/수치 ⛔ — 문자열만 |
| 구현 범위 | (GO 시) 어댑터 표시층(버튼/성당/SK_DESC) + 코어 로그 문자열(유키가 코어 문자열 수정까지 승인한 경우에 한함 — 승인 없으면 표시층만+불일치 목록 보고) |
| 비구현 범위 | 아이콘 변경 · 스킬 키(`heal`/`big`…) 변경 ⛔(내부 식별자 유지) |
| 검증 방법 | (GO 시) 구명칭 grep=0(승인 범위 내) · 표준 루틴 · 코어 접촉 시 재-baseline 후 스모크 51.4 재확인 |
| 폰 실기 체크 | 새 이름이 스킬 정체성과 붙는가 · 학습 혼란 없는가 |
| PASS 조건 | GO 범위 내 grep 무결 + 표준 + 실기 OK |
| HOLD 조건 | GO 없음(현 상태 = HOLD가 기본값) · 코어 접촉 범위 미승인 상태의 불일치 발생 |
| 완료 보고 | 공통 + ④grep 무결표·(해당 시) 재-baseline 기록 ⑤이름 체감 |

---

## 카드 밖 대기 목록 (착공 금지 — 참조용)

**Core Gate Decision**(소실 본체 — 유키 별도 카드) ⏸️ · **Boss Core Gate Decision** ✅ **[30](./30_BOSS_CORE_GATE_DECISION.md)에서 A안 최소 분기형 확정**(EP21 · 구현 0) → **Iron Crusher Runtime 01** ✅ **FINAL PASS**([31](./31_IRON_CRUSHER_RUNTIME.md) · p15 · 파쇄자 실전투 개방·나라 폰 1트 클리어 73.2s/정화0회·유키 FINAL PASS·재-baseline 112,359B/1,838줄/8e7ee68a…·**세이브 v8.3 발행**·파쇄자=1차 데모 두 번째 축 확정) · **Thirst Abyss Runtime 01** ✅ **FINAL PASS**([32](./32_THIRST_ABYSS_RUNTIME.md) · p16 · 갈증의 심연 실전투 · 나라 1트 클리어 75초 생존승/HP5%잔존/소생1512(74%)/마나45초바닥 · 유키 FINAL PASS · **세이브 v8.4 발행** · **3보스 전원 실전투+실기 완료 → 데모 완료 선언 QA 가능**) → 다음 = First Demo Completion QA · **Boss Grammar 01** ✅ **문법 잠금**([33](./33_BOSS_GRAMMAR.md) · EP22 · 기준/변주/복합 보스 정의·사고≠억까 3기준·리베로 원칙·실패 3층 — 이후 모든 보스 확장의 심사 기준) · **Boss-Specific Report Hint 01** ✅ **구현 완료**([34](./34_BOSS_SPECIFIC_REPORT_HINT.md) · p17 · 결과 화면 보스별 거울 최대 2줄·어댑터 전용 CORE 무접촉·공용 힌트 폴백 존치·재-baseline 117,251/1,920/9829b5b0·실기 대기) · **Sortie Warning Copy Polish 01** ✅ **구현 완료**([35](./35_SORTIE_WARNING_COPY_POLISH.md) · p18 · 출정 경고 문장 11개 정리·전투 후 거울과 어휘 짝맞춤·copy polish only(로직/레벨/구조 무변)·어댑터 전용 CORE 무접촉·재-baseline 117,532/1,920/2630669c·커밋 `a7b1e58`) · **First Demo Closure Handoff 01** ✅ **문서-only**([36](./36_FIRST_DEMO_CLOSURE_HANDOFF.md) · EP22 · 1차 데모 종료 기준점·3보스/두 거울/기준선/완료카드/다음후보 잠금 · 다음 진입문) · **Save v8.5 / First Demo Final Save 01** ✅ **세이브 발행**(`성소판_세이브_v8.5.md` · EP22 · 1차 데모 최종 정본 · 현행 기준선 117,532/1,920/2630669c·CORE 466/22,521 반영 · v8.2~v8.4 스냅샷 보존 · 커밋 `f6f03e7`) · **Village UX Contract 01** ✅ **문서-only**([37](./37_VILLAGE_UX_CONTRACT.md) · EP23 · 2차 마을 UX 계약 · 커밋 `093ab4c`) · **Chapel Loadout UI 01** ✅ **구현 완료**([38](./38_CHAPEL_LOADOUT_UI.md) · p19 · 성당 장착 6칸 sticky 상단고정+카테고리 4탭[치유/보호/정화·유틸/지속·자원]+구성 요약 일반성향+슬롯 3상태+전투 시작 버튼 제거·출격은 게시판·어댑터/UI 전용 CORE 무접촉·재-baseline 120,418/1,954/02a512c5·chapel_loadout_ui_check 18/18·실기 대기) · **Save v8.6 / Chapel UX Milestone Save 01** ✅ **세이브 발행**(`성소판_세이브_v8.6.md` · EP23 · **2차 마을 UX 첫 성공 정본** — 1차 데모 v8.5 위에 성당 준비 화면 UX 첫 성공 기준점 · 현행 live 120,418/1,954/02a512c5·CORE 466/22,521 반영 · v8.5 역사 스냅샷 2630669c 보존[섞지 말 것] · 나라님 실기 "아주 좋아졌어"·스킬 Max까지 한 화면 운용 가능 · 금지선 없었음 · `save_v86_check` 17/17 · 커밋 `983e390`) · **Battle Visual Identity Contract 01** ✅ **문서-only 계약**([39](./39_BATTLE_VISUAL_IDENTITY_CONTRACT.md) · EP24 · **전투 시각 문법 기준 문서** — 텍스트 예고 유지[테트리스 다음 블록]·행동선=보조 힌트[정답 버튼 강조 ⛔]·튜토리얼 3보스 친절 허용·보스 3실루엣[모르가스 꼬는/파쇄자 부수는/심연 마시는]·동료 미니 피규어 문법·브릭 토이 조립형·행동선 5종[압박/연결/누수/보호/수습]·정보 과잉 방지 390px · `battle_visual_identity_contract_check` 19/19 · 이후 모든 전투 시각 구현은 39 심사 후 착공) · **Iron Crusher Action Line Proto 01** ⏸️ **HOLD**(실험 구현으로 기능 검증 완료[압박선 4상태·시전 핸드오프·방패층 걸림·스모크 무영향] 후 커밋 보류 — 기능 실패 아님·보는 맛 기준 상향·산출물 미보존·검증 지식은 [41 §L](./41_BATTLE_FIGURE_KIT_IMPORT_CONTRACT.md)·Smash Line Rework 02가 승계) · **Battle Figure Kit Import Contract 01** ✅ **문서-only 계약**([41](./41_BATTLE_FIGURE_KIT_IMPORT_CONTRACT.md) · EP24 · **성소판 전용 미니피규어 정장/규격** — "선을 먼저 그리지 않는다. 피규어가 전장에 서게 만든다"·옆 프로젝트 규칙만 흡수[3층 transform·part 조립·6파츠·4색 변수·앵커 기반 선]·코드 복붙 ⛔·`sb-` 네임스페이스 15종·4동료+3보스 피규어 방향·행동선/임펄스 6종·`battle_figure_kit_import_contract_check` 20/20) · **Battle Figure Kit Preview 01** ✅ **구현 완료**([42](./42_BATTLE_FIGURE_KIT_PREVIEW_01.md) · EP24 · dev 프리뷰 · 전사+파쇄자 sb 조형 · 나라 실기 "귀엽다" · 16/16) · **Battle Figure Pose Pack 01** ✅ **구현 완료**([43](./43_BATTLE_FIGURE_POSE_PACK_01.md) · EP24 · 포즈 5+5 · 나라 실기 "살아 숨쉰다" · 19/19) · **Iron Crusher Figure Rework 01** ✅ **구현 완료**([44](./44_IRON_CRUSHER_FIGURE_REWORK_01.md) · p21 · **실전투 이식** — shell_iron 전투에만 sb 피규어·CORE byte-identical·스모크 불변·모르가스/심연 회귀 0·포즈 연결 3종·행동선 0·스테이지 실측 338px·재-baseline 134,911/2,039/b1e92536·`iron_crusher_figure_rework_01_check` 23/23·실기 대기) · **Iron Crusher Figure Rework 02** ✅ **구현 완료**([45](./45_IRON_CRUSHER_FIGURE_REWORK_02.md) · **크기/대치 튜닝** — 파쇄자 .68→.90·전사 .46→.60·파티 상승·전사 반보 전진·**새싹 마스코트 가독**·CSS 배치값만 CORE 무변·모르가스/심연 회귀 0·위계 2.5×·재-baseline 135,155/2,042/1802535c·`iron_crusher_figure_rework_02_check` 19/19·실기 대기) · **Iron Crusher Figure Rework 03** ✅ **구현 완료**([46](./46_IRON_CRUSHER_FIGURE_REWORK_03.md) · **파티 배치 구도** — 일렬→∧자 원호/포위형(4동료 개별 transform)·파쇄자 1.0·전사 .68·CSS 배치값만 CORE 무변·회귀 0·clashGap 24px·재-baseline 135,458/2,046/b1366130·`iron_crusher_figure_rework_03_check` 20/20·실기 대기) · **Companion Figure Kit Preview 01** ✅ **구현 완료**([47](./47_COMPANION_FIGURE_KIT_PREVIEW_01.md) · EP24 · dev 프리뷰 · **3동료 정장 확보**(sb-rogue/sb-mage/sb-shaman)·Preview 01 언어 계승·4인 파티 같은 세계 확인·실루엣 폭 84/70/66/80(색놀이 아님)·**index.html 무접촉**·`companion_figure_kit_preview_01_check` 19/19·실기 대기) · **Companion Figure Kit Preview 02 (Material & Color Rework)** ✅ **구현 완료**([48](./48_COMPANION_FIGURE_KIT_PREVIEW_02.md) · EP24 · dev 프리뷰 · **3동료 색/재질 보정** — 전신 대표색→중립 몸통+강조 표식·후레쉬맨 인상 완화·실루엣/구조 Preview 01 유지·before/after 비교·**index.html 무접촉**·`companion_figure_kit_preview_02_check` 25/25·실기 대기) → 다음 구현 후보(발주 대기): **Companion Figure Party Rework 01** ✅ **구현 완료**([49](./49_COMPANION_FIGURE_PARTY_REWORK_01.md) · p22 · **3동료 정장 실전 이식 + 4인 원호** — shell_iron 전투에 도적/마법사/주술사 sb(Preview 02 승인색)·기존 fxr/fxf 유지·CORE byte-identical·스모크 불변·회귀 0·★fig width 버그 수정·재-baseline 149,309/2,097/c9e289d7·`companion_figure_party_rework_01_check` 25/25·실기 대기) → 다음 후보: Party Figure Layout Rework 01 🔷 / Companion Figure Pose Pack 01 🔷 / Iron Crusher Smash Line Rework 02 🔷. (구 후보표현: 3동료 실전투 이식·파티 전체 sb화·색 보정본) · **Party Figure Layout Rework 01** ✅ **구현 완료**([50](./50_PARTY_FIGURE_LAYOUT_REWORK_01.md) · p23 · **안 B 과감한 포위 확대** — 4인 크기 상향(전사.80/도적.74/마법사.76/주술사.74)+파쇄자 1.04·좌우 날개 ±24로 스팬 156→252·gap 12→26·인접 gap 전부 양수·overflow 0·CORE byte-identical·스모크 불변·회귀 0·재-baseline 149,440/2,098/bb7fc147·`party_figure_layout_rework_01_check` 27/27·실기 대기) → 다음 후보: Iron Crusher Smash Line Rework 02 🔷 / Companion Figure Pose Pack 01 ✅ **구현됨**(→[51](./51_COMPANION_FIGURE_POSE_PACK_01.md)·독립 포즈 프리뷰·도적/마법사/주술사 각 5포즈+전사 4비교+4인 Actor Ensemble+프리셋 4종+마법사 금빛점 A/B/C·index.html 무접촉·`companion_figure_pose_pack_01_check` 24/24·23종 PASS·실기 대기) / Party Figure Layout Rework 02 🔷 / Companion Figure Pose Runtime 01 🔷. **Companion Figure Color Polish 01** ✅ **구현됨**(→[52](./52_COMPANION_FIGURE_COLOR_POLISH_01.md)·독립 색 프리뷰·도적 검정 3안/마법사 배 분리 3안·도적 C+마법사 C 채택·before/after+4인 파티+포즈+최종추천·color-mix 변수 오버라이드·조형/포즈 무변경·index.html 무접촉·`companion_figure_color_polish_01_check` 24/24·24종 PASS·실기 대기) → 다음 후보: **Battle Stage Language Contract 01** ✅ **구현됨**(→[53](./53_BATTLE_STAGE_LANGUAGE_CONTRACT_01.md)·문서·계약·무대 언어 6요소/사건 6단계/anchor/layer/형태언어/파쇄자 첫 구현문법/보스별 후속/runtime 입력후보/금지선/구현순서 잠금·index 무접촉·`battle_stage_language_contract_01_check` 30/30·유키 검수 대기) / Companion Figure Pose Runtime 01 🔷 / Iron Crusher Smash Line Rework 02 🔷. **Iron Crusher Stage Input Audit 01** ✅ **완료**(→[54](./54_IRON_CRUSHER_STAGE_INPUT_AUDIT_01.md)·읽기 전용 감사·[A]/[B]/[C] 입력 경계 잠금·★fxBossLine 유령 좌표 발견·도적 smash 차단=runtime 부재 확정·`iron_crusher_stage_input_audit_01_check` 27/27·index byte-identical·유키 검수 대기) → 다음 유력: **Iron Crusher Smash Line Rework 02** ✅ **구현됨**(→[55](./55_IRON_CRUSHER_SMASH_LINE_REWORK_02.md)·p24·유령 좌표 제거+망치→실대상 관계선+접촉 4분기(blk/absorb/병존/직격)·CORE byte-identical·스모크 동일·재-baseline 155,043/2,185/154ee46e·`iron_crusher_smash_line_rework_02_check` 29/29·나라 실기 대기) → 다음 후보: Companion Figure Pose Runtime 01 🔷 / 색 폴리시 채택안 이식 🔷 / 낮은 압력 데칼 🔷 / Morgas Connection Line Proto 01 🔷. (구 후보표현: 4인 전장 배치 확정) · **Iron Crusher Smash Line Rework 02** 🔷(앵커 기반 강타선·드디어 선·clashGap 24px 자리) · Companion Figure Pose Pack 01 🔷 · Morgas Connection Line Proto 01 🔷 · Thirst Abyss Drain Line Proto 01 🔷(39 §I·41 §J) · **Matrix→Sortie Warning 01** ✅ **구현 완료**(커밋 `460c40a` · 유키 FINAL PASS · 폰 실기 OK) · **Threat Lookahead 실기 마감** ✅ 폰 실기 PASS · 패시브 규칙(09 §4-6~8) ⏸️ · 3번째 보스 확정+대정화(데모 목표선 — 유키) ⏸️ · Preset Save/Unlock Shell(19 채택됨, 구현은 데모 이후) ⏸️ · 07-HF 시인성(나라 실기 피드백 대기) 🔷 · **성장/재화/동료 실구현(16·21·22 채택 — 장기 보류 유지 · 동료는 준게이트 범위 표 필수[22]) ⏸️** · Core Gate 재검토 목록에 성심 집중 refund 패턴 포함([23 §8](./23_SACRED_FOCUS_IMPLEMENTATION_CONTRACT.md)) ⏸️.

---
*— 렌, EP10 활주로 팩. 티켓 경계는 유키 결정(상단 3건)이 상위 게이트다.*
