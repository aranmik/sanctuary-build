# 성소판 99 — 다음 렌에게 (HANDOFF NEXT REN)
**작성: 렌 · 2026-07-07 · EP09 마감 문서 · 최근 동기화: EP20C(세계선 봉인 — 27·28·29 생성 + 102 색인 + 세이브 v8.2) · 상태: 살아있는 문서(큰 마일스톤마다 갱신)**

> **성소판은 5인 파티의 전장 상황을 읽고 수습하는 사제 게임이다. 플레이어는 공격하지 않는다. 플레이어는 파티의 리베로다.**

너는 렌이다. 이 문서는 **프로젝트 상태의 스냅샷**이고, 최신 세이브 md(`성소판_세이브_vN.md`)는 **페르소나와 시간선**이다. 둘은 짝이다 — 세이브로 네가 누구인지 이어받고, 이 문서로 성소판이 어디 있는지 이어받는다.

---

## 1. 성소판 현재 상태 (2026-07-07 기준)

- 단일 `index.html` (**106,650 bytes · 1,756줄** · md5 `34addd9c3441cf8c2e1f83e8303f0475` — 성심 집중 01[p13]까지 구현 카드 6종 반영) · 인라인 CSS/JS 바닐라 · **외부 라이브러리 0 · 이미지 0** · 결정론(난수 0) · 모바일 세로 390×844.
- repo `sanctuary-build` · GitHub Pages `https://aransosu.github.io/sanctuary-build/`
- **코어 불가침**: `//__CORE_START__`(577행 부근) ~ `//__CORE_END__` 사이 JS는 절대 편집 금지. 모든 확장은 어댑터(코어 종료 마커 이후).
- **무입력 스모크 = defeat 51.4초** (코어 불변의 심장박동. 이 숫자가 바뀌면 코어 오염). 실제 힐 플레이 승리 ≈ 70.3초.
- 보스 1종(핏빛 예언자 모르가스, 75s) + 길드 셸 카드 2종(🔒 — **파쇄자=2번째 확정 · 심연=3번째 채택**[EP17A] · 실전투는 Boss Core Gate 이후) · **사제 스킬 9종 구현 — 성심 집중이 9번째 스킬로 승격(최종 잠금 아님)** · 로드아웃 6/9 · 리포트 합산 정확.
- **구현 카드 6종 완료(p08~p13 · 전부 코어 무접촉 · 스모크 51.4s 유지)**: Chapel Save/Return 01 · Guild Board Monster Select 01 · Sortie Confirm 01 · Report Hint 01(이상 4종 나라님 실기 1차 잠정 OK) · Threat Lookahead 01(실기 개별 판정 대기) · **성심 집중 01(유키 PASS candidate · 나라님 폰 실기 1차 확인 완료 · 잠정 OK — 최종 잠금 아님)**.
- **준게이트 메모(성심 집중 01)**: core-paid mana refund 패턴 — **코어 바이트는 무접촉**이나 코어 지불을 어댑터가 사후 복원하는 구조. **향후 Core Gate 개정 시 재검토 필요**([23 §8](./23_SACRED_FOCUS_IMPLEMENTATION_CONTRACT.md)).
- **설계팩 21·22(사제 성장/재화 · 동료 로스터/성장) 작성·유키 PASS** — 장기 성장 설계 기준 확보. **구현은 전부 보류(§7)** — 성장/재화/동료 실구현은 별도 카드 이후.

## 2. 00~07 구현/검증 요약 (전부 ✅ · 재검증 불필요)

| 카드 | 내용 |
|---|---|
| 00~EP07 | 재미 씨앗 확정(Raid Frame Priest FUN PASS) → 성소판 독립 + 정의 잠금(`docs/01`) |
| 02A/02B(+HF) | HUD 재건·전장 피규어·행동선·광역 텔레그래프 — 폰 70.3s 클리어 |
| 03 | 사제 스킬 풀 16종 잠금(docs/03) |
| 04 | 소생 — "공대 힐러 느낌" 실기 PASS |
| 05/05A(+HF1) | 기도씨앗 1회형→제한 전이형 · 칩 행 안정화 |
| 06 | 소생/씨앗 리포트 ledger 합산 |
| 07 | 성당/로드아웃 미니 — 기회비용 감정 발생 확인 |

## 3. 설계팩 08~20 목록과 읽는 순서

**처음 읽을 순서: 최신 세이브 md → 본 문서(99) → [98 구현 티켓](./98_NEXT_IMPLEMENTATION_CARDS.md)(착공용) → [12 로드맵](./12_SANCTUARY_SYSTEM_ROADMAP.md) → 작업 영역 문서.** 나라님 폰 실기 판정은 [97 QA·손맛 체크리스트](./97_QA_AND_HANDTASTE_CHECKLIST.md)로 한다.

| 영역 | 문서 |
|---|---|
| 전투를 만진다 | [14 전투 문법](./14_COMBAT_GRAMMAR_BLUEPRINT.md) → [17 UI 정보](./17_UI_INFORMATION_BLUEPRINT.md) → [09 스킬](./09_PRIEST_SKILL_BLUEPRINT.md) |
| 보스를 만진다 | [15 보스](./15_MONSTER_BOSS_BLUEPRINT.md) (+14 준수) |
| 화면/동선을 만진다 | [08 플로우](./08_GAME_FLOW_BLUEPRINT.md) → [11 마을](./11_VILLAGE_BLUEPRINT.md) |
| 동료를 만진다 | [10 동료](./10_COMPANION_BLUEPRINT.md) |
| 메타를 만진다 | [16 보상](./16_PROGRESSION_REWARD_BLUEPRINT.md) → [19 저장](./19_SAVE_DATA_BLUEPRINT.md) → [18 범위](./18_CONTENT_SCOPE_BLUEPRINT.md) |
| 이름을 만진다 | [20 이름/법적 안전](./20_NAMING_LEGAL_SAFETY_BLUEPRINT.md) (+[13 번역 노트](./13_REFERENCE_TRANSLATION_NOTES.md)) |
| 성장/동료의 미래를 설계한다 | [21 사제 성장/재화](./21_PRIEST_GROWTH_ECONOMY_BLUEPRINT.md) → [22 동료 로스터/성장](./22_COMPANION_ROSTER_GROWTH_BLUEPRINT.md) — **장기 기준서 · 구현 ⏸️** |
| 데모 완료/게이트/출정 경고를 본다 | [27 데모 완료 정의](./27_FIRST_DEMO_COMPLETION_DEFINITION.md) → [28 Boss Core Gate 도면](./28_BOSS_CORE_GATE_PREP.md) → [29 출정 경고 계약](./29_MATRIX_SORTIE_WARNING_CONTRACT.md) — EP19B~20B 신규 |
| 이관/봉인을 본다 | [100 이관팩](./100_LAPTOP_CARRY_WORLDLINE_SAVE.md) → [101 시작 프롬프트](./101_NEXT_SESSION_START_PROMPTS.md) → [102 최종 색인](./102_FINAL_HANDOFF_INDEX.md) — **이관 후 첫 문서는 102** |

## 4. 다음 개발 우선순위 (12 로드맵 + 유키 결정 반영)

**완료 이동**: Chapel Save/Return 01 · Guild Board Monster Select 01 · Sortie Confirm 01 · Report Hint 01 · Threat Lookahead 01 · **성심 집중 01(구현 완료 / 실기 1차 확인 / 잠정 OK)** — 상태 상세는 §1·§6.
**다음 착공 = 노트북 이관 후, 기준선 검증부터([102 §6](./102_FINAL_HANDOFF_INDEX.md) — 51.4 전 착공 ⛔).** 이관 기준 순서(EP20C 확정): ① 기준선 검증 ② Threat Lookahead 실기 마감(97 §2) ③ Matrix→Sortie Warning 01([29 계약](./29_MATRIX_SORTIE_WARNING_CONTRACT.md) + 20B 결정 7건 = 착공 입력) ④ **Boss Core Gate Decision**([28 도면](./28_BOSS_CORE_GATE_PREP.md) — A안 미래 채택 후보 · 개방은 이관 후) ⑤ 강철의 파쇄자 실전투 ⑥ 갈증의 심연 실전투 → 최종 QA. Save Policy Revision·성장/재화/동료 구현은 장기 보류 유지. Boss Shell Cards 01은 **17B로 문서 종결**(98 카드 6). (패시브/강화는 규칙 확정 후 — 98 대기 목록)
**진행 갱신(EP21)**: ①기준선 검증 · ②Threat 실기 PASS · ③Matrix→Sortie Warning 01(커밋 `460c40a`·유키 FINAL PASS) 완료. ④**Boss Core Gate Decision → [30](./30_BOSS_CORE_GATE_DECISION.md)에서 A안 최소 분기형 확정** → ⑤**Iron Crusher Runtime 01 FINAL PASS**([31](./31_IRON_CRUSHER_RUNTIME.md) · p15 · `shell_iron` 실전투·모르가스 51.4+로그 지문 무손상·**재-baseline: 112,359 B/1,838줄/md5 `8e7ee68a…`·CORE 427줄/20,818 B·파쇄자 스모크 48.5/971**·**나라 폰 1트 클리어 73.2s/정화0회·유키 FINAL PASS**·강철의 파쇄자=1차 데모 두 번째 축 확정) → ⑥**Thirst Abyss Runtime 01 FINAL PASS**([32](./32_THIRST_ABYSS_RUNTIME.md) · p16 · `shell_thirst` 실전투·새 어휘 drain(마나 흡수+약광역)·생존 버티기형 HP 8400·심연 스모크 61.8/1236·**재-baseline 114,688 B/1,882줄/md5 `e5c7ca06…`·CORE 466줄/22,521 B**·**나라 1트 클리어 75초 생존승/HP5%/소생1512·유키 FINAL PASS**). **★1차 데모 세 보스 전원 실전투+실기 완료 → 데모 완료 선언 QA 가능 조건 충족** → 다음 = First Demo Completion QA. ★기준선 정본 = **세이브 v8.4**(발행 완료).
**EP22 · Boss Grammar 01**: 보스 질문 문법 잠금([33](./33_BOSS_GRAMMAR.md) · 커밋 `62d9679` 기준) — 기준 보스=원론 질문 1개·변주=+사고 1개·복합=+사고 2개↑(초기 상용화는 1사고까지)·사고≠억까 3기준(예고/반응 창/수습 수단)·리베로 원칙·실패 3층. **이후 새 보스는 33 문법 심사 통과 후에만 착공.**
**EP22 · Boss-Specific Report Hint 01**: 결과 화면 보스별 거울 문장 첫 구현([34](./34_BOSS_SPECIFIC_REPORT_HINT.md) · p17 · 어댑터 전용 CORE 무접촉) — bossId(CUR_BOSS)+r 스탯 분기, 보스별 최대 2줄(승리 1줄/패배 2줄=흔들린 지점+다음 층), 어휘 격리, 공용 `pickReportHint` 폴백 존치, 기존 `.ins gold` 슬롯 재사용(신규 UI 0). **재-baseline: 117,251 B/1,920줄/md5 `9829b5b0…`·CORE 466줄/22,521 B 불변·3보스 스모크 유지**. 실기 대기.
**EP22 · Sortie Warning Copy Polish 01**: 출격 전 거울 문장 정리([35](./35_SORTIE_WARNING_COPY_POLISH.md) · p18 · copy polish only·어댑터 전용 CORE 무접촉) — SORTIE_WARN_ROWS msg 11개만 교체(when 로직·lv·라벨 무변), 전투 후 거울([34])과 어휘 짝맞춤·보스별 어휘 격리(모르가스 정화/차단·파쇄자 전사/강타/보호막·심연 마나/소생/성심집중)·출격 차단 0. **재-baseline: 117,532 B/1,920줄(불변)/md5 `2630669c…`·CORE 466/22,521 불변·3보스 스모크 유지**. `dev/sortie_warning_copy_polish_check.js` 14/14. 커밋 `a7b1e58`.
**EP22 · First Demo Closure Handoff 01**: 1차 데모 종료 기준점 문서([36](./36_FIRST_DEMO_CLOSURE_HANDOFF.md) · 문서-only · 커밋 `a7b1e58` 기준) — 3보스/두 거울(전투 전 Sortie Warning + 전투 후 Report Hint)/현행 기준선(117,532·CORE 466)/완료 카드 11종/다음 후보 5종/아직 금지선/역할 잠금. **다음 진입문**. `dev/first_demo_closure_handoff_check.js` 17/17. 다음 후보(유키 발주 대기): First Demo Push·Phone Check / Thirst Abyss Tell Polish / Variant Boss Decision / Party Layer Opening Plan / Skill Loadout Expansion Plan — 전부 구현 아직 금지.
**EP22 · Save v8.5 / First Demo Final Save 01**: 1차 데모 최종 세이브 발행(`성소판_세이브_v8.5.md` · 문서/세이브 · 현행 기준선 117,532/1,920/`2630669c…`·CORE 466/22,521·스모크 3종 반영) — **기준선 정본 = 세이브 v8.5**(v8.4는 114,688 시점 스냅샷). 부록 C 세이브 계보표(v8.2~v8.5)·두 거울·종료 상태 보존. `dev/save_v85_check.js` 11/11. index.html 무변경.
**EP23 · Village UX Contract 01**: 2차 마을 준비 UX 설계 계약([37](./37_VILLAGE_UX_CONTRACT.md) · 문서-only · 커밋 `f6f03e7` 기준) — 마을=전투 전 준비 공간(정답 아님·수습 가능성 확인). 성당(장착 6칸 상단 고정·카테고리 4탭[치유/보호/정화·유틸/지속·자원]·`이 구성으로 전투 시작` 제거 후보·출격은 게시판) · 메시지 3단 분리(성당=구성 일반 성향/출격=보스 위험[35]/결과=흔들린 지점[34]) · 여관(동료 역할 창구·구현 보류) · 발자취(누적 기록 별도 분리·구현 보류) · 동료(7명 확정 우선·다중 영웅 장기 후보). **다음 후보 5카드**(Chapel Loadout UI 01 / Battle Visual Identity Contract 01 / Companion Identity Decision 01 / Inn Companion Role Sheet 01 / Footprints Record Panel 01 — 전부 구현 아직 금지). `dev/village_ux_contract_check.js` 16/16.
**EP23 · Chapel Loadout UI 01**: 성당 스킬 장착 UX 첫 구현([38](./38_CHAPEL_LOADOUT_UI.md) · p19 · 어댑터/UI 전용 CORE 무접촉) — 장착 6칸 sticky 상단 고정(`#chapel-fixed`)·카테고리 4탭(치유/보호/정화·유틸/지속·자원·SKILL_CAT data-driven)·구성 요약(chapelSummary·일반 성향·보스 어휘 0)·슬롯 3상태(empty/filled/sel)·`이 구성으로 전투 시작`+enterBattle(1) 제거(출격은 게시판만)·저장하고 마을로 유지. **재-baseline: 120,028 B/1,949줄/md5 `172e4660…`·CORE 466/22,521 불변·div 193/193·3보스 스모크 유지**. ★라이브 md5 핀 3체크(closure/save_v85/village_ux) 동시 갱신. `dev/chapel_loadout_ui_check.js` 18/18·10종 PASS. 다음 후보(37 §I 나머지): Battle Visual Identity Contract 01 / Companion Identity Decision 01 / Inn Companion Role Sheet 01 / Footprints Record Panel 01.
**EP23 · Save v8.6 / Chapel UX Milestone Save 01**: 성당 UX 첫 성공 기준점 세이브 발행(`성소판_세이브_v8.6.md` · 문서/세이브 · 커밋 `983e390` 기준) — **1차 데모 v8.5 위에 성당 스킬 장착 UX 첫 성공 기준점을 얹은 세이브**(v8.5=1차 데모 최종 / v8.6=2차 마을 UX 첫 성공). 전투 코드/수치가 아니라 준비 화면 UX가 개선된 세이브. 현행 live 기준선 120,418/1,954/`02a512c5…`·CORE 466/22,521 반영 · v8.5 역사 스냅샷 `2630669c…` 보존(둘을 섞지 말 것) · 부록 C 세이브 계보표 v8.2~v8.6 · 나라님 실기 "아주 좋아졌어"/"이 정도면 충분히 잘 보여"/"디테일은 다음에"/스킬 Max까지 한 화면 운용 가능 기록 · 금지선 13종 없었음. `dev/save_v86_check.js` 17/17. **기준선 정본 = 세이브 v8.6**. index.html 무변경.
**EP24 · Battle Visual Identity Contract 01**: 전투 시각 문법 설계 계약([39](./39_BATTLE_VISUAL_IDENTITY_CONTRACT.md) · 문서-only · 구현 0 · 커밋 `76c5f75` 기준) — **"텍스트는 확정 정보다. 행동선은 전장 문법이다. 피규어는 객체의 정체성이다."** `보스 다음 행동` 텍스트는 테트리스의 다음 블록처럼 유지(제거 ⛔)·행동선은 보조 힌트(정답 버튼 강조 ⛔). 튜토리얼 3보스=친절 허용(답을 가르친다)/이후 보스=질문/변주=배운 답이 흔들리는 순간. 보스 3실루엣(모르가스=가늘고 비틀림·꼬는 자 / 파쇄자=큰 사각형·부수는 자 / 심연=낮고 퍼짐·마시는 자)·동료 미니 피규어 문법(실루엣 우선·조립형 부품·브릭 토이 원칙·같은 몸체+다른 장식=변주)·행동선 5종(압박/연결/누수/보호/수습)·정보 과잉 방지(390px·우선순위 5단). **첫 구현 후보 = Iron Crusher Action Line Proto 01**(🔷 유키 발주 대기 · 후속 후보 Morgas Connection Line Proto 01 / Thirst Abyss Drain Line Proto 01 — 전부 구현 아직 금지). `dev/battle_visual_identity_contract_check.js` 19/19. index.html 무변경.
**EP24 · Iron Crusher Action Line Proto 01 ⏸️HOLD**: 압박선 실험 구현 — 기능 검증 완료(파쇄자 전용 강타 압박선 4상태[예고/임박/보호막 80% 걸림/잔상 0.45s]·기존 시전선 핸드오프·텍스트 예고 무변·CORE 무접촉·스모크 3종 바이트 동일·모르가스/심연 음성·390px overflow 0) 후 **나라 판단으로 커밋 보류** — 기능 실패가 아니라 **보는 맛 기준 상향**(피규어 조형 없이 이모지/원형 위에 선만 얹는 방식은 최종 비주얼 방향과 다름). 산출물(구 docs/40·p20·전용 체크)은 워킹트리 복원으로 제거됨 — 검증 지식은 [41 §L](./41_BATTLE_FIGURE_KIT_IMPORT_CONTRACT.md)에 기록·`Iron Crusher Smash Line Rework 02`가 승계 예정.
**EP24 · Battle Figure Kit Import Contract 01**: 성소판 전용 미니피규어 정장/규격 설계 계약([41](./41_BATTLE_FIGURE_KIT_IMPORT_CONTRACT.md) · 문서-only · 구현 0 · 커밋 `33dcb00` 기준) — **"성소판은 이미 재미있다. 이제 필요한 것은 보는 맛이다" / "선을 먼저 그리지 않는다. 피규어가 전장에 서게 만든다."** 옆 프로젝트 CSS 감사 보고서에서 **규칙만 흡수**(코드 복붙 ⛔): 3층 transform 분리(배치/반응/idle)·조립형 part 구조·보스 6파츠(shadow/extra/role/body/head/ears→성소판은 aura)·4색 변수(main/edge/deep/glow)·앵커 기반 행동선 재작성. **`sb-` 네임스페이스**(.sb-unit/.sb-fig/.sb-part/.sb-anchor 등 15종 — 일반명 클래스 충돌 방지·단일 HTML 보호). 4동료(전사 방패/도적 단검/주술사 토템/마법사 구체)+3보스(모르가스 저주 실/파쇄자 금속 블록+망치/심연 액체+웅덩이) 피규어 방향·행동선/임펄스 6종(공격/주시/도발/차단 준비/보호막/수습). **다음 구현 순서: ①Battle Figure Kit Preview 01(전사+파쇄자 프리뷰) → ②Iron Crusher Figure Rework 01(피규어만) → ③Iron Crusher Smash Line Rework 02(앵커 기반 선) → ④Morgas/⑤Thirst 선** — 피규어 먼저, 선은 나중. `dev/battle_figure_kit_import_contract_check.js` 20/20. index.html/CSS/JS 무변경. ★워킹트리 복원 과정에서 index.html이 CRLF로 변환돼 있던 것을 LF 정규화(내용 무손실·02a512c5 정본 바이트 복원·git diff 0).
**EP24 · Battle Figure 이식 라인(Preview 01 → Pose Pack 01 → Figure Rework 01)**: ①**Preview 01**([42](./42_BATTLE_FIGURE_KIT_PREVIEW_01.md)·dev 프리뷰·전사+파쇄자 조형·새싹 방패/용광로 코어·위계 1.83×·나라 실기 "너무 귀엽다") → ②**Pose Pack 01**([43](./43_BATTLE_FIGURE_POSE_PACK_01.md)·포즈 5+5 확장·전사 보호자 어휘/파쇄자 압박강타 어휘·대치 조합·나라 실기 "살아 숨쉰다") → ③**Iron Crusher Figure Rework 01**([44](./44_IRON_CRUSHER_FIGURE_REWORK_01.md)·p21·**실전투 이식**). Rework 01 요지: shell_iron 전투 상단 전장에 전사+파쇄자 sb 피규어 이식(`#stage.sb-boss-iron` 스위칭)·**어댑터/CSS/HTML 전용 CORE byte-identical**·스모크 3종 불변·**모르가스/심연 회귀 0**(sb 미표시·이모지 유지)·포즈 연결 3종(파쇄자 windup=강타 시전/전사 guard=보호막/brace=강타대상, 기존 상태→class·신규 상태·타이머 0)·행동선 여전히 0. ★**스테이지 실측 338px**(min-height 104는 최소값·flex 확장)로 축소 내성 완화·작은 화면(≤730) fallback 이모지. 파쇄자 118×131 vs 전사 48×58(위계 2.2×). **재-baseline: 134,911 B/2,039줄/md5 `b1e92536…`·CORE 466/22,521 불변·div 202/202·스모크 유지**. ★라이브 md5 핀 8체크 갱신(세이브 v8.5/v8.6 문서 역사 숫자는 보존). `dev/iron_crusher_figure_rework_01_check.js` 23/23·기존 15종 PASS. ★cascade: 41 계약 체크 c19("sb 클래스 미구현" 단언)를 "행동선 클래스(sb-impulse/sb-line) 미구현"으로 좁힘(44가 sb-unit/fig 실구현). 리스크: 전사만 sb·3동료 원형(→Companion Figure Kit Preview 01). 나라님 폰 실기 대기.
**EP24 · Iron Crusher Figure Rework 02**: 전장 피규어 **크기/대치 튜닝**([45](./45_IRON_CRUSHER_FIGURE_REWORK_02.md)·CSS 배치값만·CORE 무접촉·기준 HEAD `a5956b3`). 나라 실기 "크기 다소 작다·새싹(마스코트) 잘 보이게" 반영. 파쇄자 scale .68→**.90**(top-14→2)·전사 .46→**.60**·파티 줄 bottom6→**24**(shell_iron 스코프)·전사 **translateY(-7) 반보 전진**. 실측: 파쇄자 118×131→**171×191**·전사 48×58→**62×76**(위계 2.5×)·새싹 5px→6.5px+(확실히 보임)·대치 간격 42px(행동선 자리)·전사-도적 6px 여유·overflow0. **버린 안**: .98/.64(전사 도적 근접·위 여백 낭비). **모르가스/심연 회귀 0**(파티/전사 조정 shell_iron 스코프·전역 stageAllies bottom:6 유지·이모지). 포즈 연결 무변. 재-baseline 135,155/2,042/**`1802535c`**·CORE byte-identical·div 202/202·스모크 불변. 라이브 md5 핀 10체크 갱신(v8.5/v8.6 문서 역사 숫자 보존). `dev/iron_crusher_figure_rework_02_check.js` 19/19·17종 PASS.
**EP24 · Iron Crusher Figure Rework 03**: 전장 **파티 배치 구도**([46](./46_IRON_CRUSHER_FIGURE_REWORK_03.md)·CSS 배치값만·CORE 무접촉·기준 HEAD `a5956b3`). 나라 "일렬 대신 감싸듯·더 크게" 반영. 파티 일렬 횡대 → **∧자 원호/포위형**(4동료 개별 transform·shell_iron 스코프): 전사 좌전방→중앙쪽 최전열 translate(8,-13)·도적 (6,5) 안쪽 뒤·마법사 (-4,5) 중앙 뒤·주술사 (-3,-6) 우측 살짝 앞. 파쇄자 .90→**1.0**(190×212)·전사 .60→**.68**(70×86)·파티 bottom24→**29**. 실측 clashGap 24px(행동선 자리)·겹침0·overflow0. **버린 안 A**(전사 좌상 -6,-16=너무 왼쪽 외곽·주술사 동떨어짐), 안 B(clashGap 19 빡빡)→**안 C 채택**. **모르가스/심연 회귀 0**(4동료 일렬 top419·transform none·이모지·원호는 shell_iron 스코프). 포즈 무변. 재-baseline 135,458/2,046/**`b1366130`**·CORE byte-identical·div 202/202·스모크 불변. 라이브 md5 핀 11체크 갱신(v8.5/v8.6 문서 역사 보존). ★cascade: rework_02_check c4/c5(Rework 02 정확 값 하드코딩)를 "크기·배치 튜닝 존재"로 완화(값은 Rework 03이 갱신). `dev/iron_crusher_figure_rework_03_check.js` 20/20·18종 PASS.
**EP24 · Companion Figure Kit Preview 01**: 도적·마법사·주술사 **정장 확보 독립 프리뷰**([47](./47_COMPANION_FIGURE_KIT_PREVIEW_01.md)·dev 프리뷰·index.html 무접촉·기준 HEAD `a5956b3`). 나라 "전사만 밀지 말고 3동료도 같은 정장→파티 같은 언어로". Preview 01 조형 언어 계승(3층 transform·part 조립·얼굴·`sb-`/`--sb-`). 신규 3직업: **sb-rogue**(보라·얇은 몸 30px+단검 2+두건+스카프=날렵 척후) / **sb-mage**(자주·삼각 로브+뾰족 모자+손 위 구체 맥동=후열 시전자) / **sb-shaman**(청록·세로 토템 지팡이+부적 고리+큰 오라 맥동=지속 지원가). 실측 실루엣 폭 전사84·도적70·마법사66·주술사80(전부 달라 색놀이 아님). 화면 A 개별 3카드·B 4인 파티 라인업(같은 세계 확인)·C 4인 원호+파쇄자 대치. dev 파일(companion_figure_kit_preview_01.html+_check.js 19/19+docs/47). 실브라우저 390: overflow0·12피규어 파츠이탈0·콘솔0·외부요청0. **index.html md5 b1366130 무변경**. ★얼굴 헬퍼 클래스(.sb-face)를 pseudo(::after)에 못 붙여 얼굴 안 보이던 것→각 head::after에 얼굴 배경 직접 삽입 수정(귀여움 핵심). ★c12 오탐(sb-line이 sb-lineup 부분문자열)→경계 정규식 수정. 리스크: 주술사 토템 우측 무게중심·도적 얼굴 두건에 가림·실전투 축소 미검(3동료 아직 index 미이식). 다음 후보: Companion Figure Party Rework 01(3동료 전투 이식)/Companion Figure Pose Pack 01/Smash Line Rework 02.
**EP24 · Companion Figure Kit Preview 02 (Material & Color Rework)**: 3동료 **색/재질 보정 프리뷰**([48](./48_COMPANION_FIGURE_KIT_PREVIEW_02.md)·dev·index 무접촉·기준 HEAD `a5956b3`). 나라 실기 "각자 위아래 한 색이라 후레쉬맨(전대물) 인상". **전신 대표색→중립 몸통+대표색은 강조 표식으로 재분배**(실루엣/파츠 구조는 Preview 01 유지·색만): 도적 몸통 **차콜 가죽**(cloth #403a52)+보라 두건/스카프+은 단검 / 마법사 로브 **어두운 남색**(robe #343150·채도 낮춤)+자주 모자/소매+금 별+구체 / 주술사 몸·후드 **회청**(cloth #44606a)+청록 부적/고리/오라+나무 토템+황동. 화면 A 개별3·B 4인 파티(균형)·C before(전신색)/after(재분배) 비교(sb-v1 override)·D 파쇄자 대치(주술사 left 57→52% 당겨 가림 완화). ★1차 마법사 robe #3b3766이 파티서 혼자 진함→#343150로 낮춤(버린 안). 전사 index 무수정(프리뷰 내 비교만). dev 3파일(companion_figure_kit_preview_02.html+_check 25/25+docs/48). 실브라우저 390 overflow0·18피규어 이탈0·콘솔0·외부0·index md5 b1366130 무변경. 리스크: 주술사 토템 우측 겹침(Layout Rework서)·마법사 상대 밝기·작은 크기 미검. 다음: Companion Figure Party Rework 01(3동료 전투 이식)/Party Figure Layout Rework 01/Smash Line Rework 02.
- **구현 카드는 번호가 아니라 이름으로 부른다**(카드 번호는 지시서 회차와 충돌 가능 — 08=설계팩1차, 09=설계팩2차로 이미 사용됨).

## 5. 절대 건드리면 안 되는 것 ⛔

1. 코어 마커 사이 JS — 개정은 **Core Gate Decision 카드**로만(§10).
2. 정의 문장(문서 맨 위 세 문장)과 `docs/01`의 잠금 원칙.
3. **힐러는 사제뿐** — 동료 힐러화는 어떤 경로(자동 치유·스마트 힐·전투부활)로도 ⛔.
4. 정화→도적 차단 연계(`차단!`/`차단 실패!`).
5. 스모크 51.4s 기준 · 금지 grep 4종(`Math.random`/base64/`<img`/png·assets).
6. **작은 청크 원칙(생명줄)** — 큰 산출은 나눠 쓴다. 긴 작업 전 나라에게 예고.
7. `index.html`이 업로드돼 있으면 **바이트 그대로 이어받는다** — 재타이핑 ⛔.

## 6. 구현 카드 현황 (구 "다음 구현 후보 5" — EP16C 동기화)

| 카드 | 한 줄 | 상태 |
|---|---|---|
| Chapel Save/Return 01 | 성당 저장·마을 복귀(p08) | ✅ 실기 1차 잠정 OK |
| Guild Board Monster Select 01 | 보스 카드 3 + 태그 칩 셸(p09) | ✅ 실기 1차 잠정 OK |
| Sortie Confirm 01 | 출정 확인 — 답/문제 대조·정화 경고 2분기(p10) | ✅ 실기 1차 잠정 OK |
| Report Hint 01 | pickReportHint 6규칙 · 💡 1줄(p11) | ✅ 실기 1차 잠정 OK |
| Threat Lookahead 01 | lookahead 6s 예보 배지(p12) | ✅ 구현 완료 · 실기 개별 판정 대기 |
| 성심 집중 01 | 9번째 스킬 — B안·혼합형·CD30/armed8(p13) | ✅ 잠정 OK · **최종 잠금 아님** |
| Boss Shell Cards 01 | 셸 질문/태그 — p09가 15와 1:1 선반영 | ✅ **17B 문서 종결** — 실전투는 Boss Core Gate 이후 |

## 7. 미완/보류 설계 항목 ⏸️

Core Gate Decision(소실 본체 — §10) · 패시브 슬롯 규칙(09 §4-6~8) · 빛의 잔향 확정 조건 번역(09 §4-8 — 원형 확률부의 결정론 번역) · 저장 정책 **채택됨**(19 — 구현 경계는 98 카드 1·유키 결정 ③) · **성장/재화/동료 구현 ⏸️**(16·21·22 채택됨 — 성장·재화 실구현은 Save Policy Revision 이후, 동료 실구현은 준게이트 범위 표 필수, 22 경고) · 3번째 데모 보스 확정+대정화 연동(유키) · 주술사 정체성(10 §2 — 방향은 22 §5로 잠금, 세부 ⏸️) · UI Rename(별도 GO 대기 — 98 카드 8, 코어 문자열 접촉 이슈) · 07-HF 로드아웃 시인성(나라 실기 피드백 대기).

## 8. 나라님 실기 피드백 요약 (판정 기록)

- 폰 70.3s 클리어(02A) — 손맛 성립. / 소생 = **"공대 힐러 느낌"**(04 PASS).
- 07: **"즉시 치유보다 소생을 선호"** + **"이거 대신 이거… 아 어쩌지?"** 기회비용 감정 발생 — 로드아웃 재미의 실증.
- 나라 통찰: 성당은 "고르고 저장하는 곳", 실전 시작은 길드 보드 이후 — 장기 플로우의 근거.
- **상시 규칙**: 나라 난이도 체감엔 "상위 0.1% 보정"을 얹는다(나라가 쉬우면 일반 유저는 어렵다). 손맛 판정은 나라 폰 실기가 최종.
- 미결 실기 판정 대기: 05-HF1 칩 안정화 / 05A 광역 시 순차 전이 / 06 합산 / 07 조합·정화 경고·새로고침 복귀.
- **성심 집중 01 실기 1차(EP16C)**: 성당 9번째 카드 · 6칸 기회비용 · "준비했다" 감각 · armed 8초 테두리 · 무료 로그 · 제외 무혼란 · **예보→성심 집중 선쿨→정화/보호막/소생/기도씨앗 절약 운영** — 7항목 1차 OK(상세 [97 §13](./97_QA_AND_HANDTASTE_CHECKLIST.md)). 최종 잠금 아님 — 과강/불편 시 HF 가능.

## 9. 유키 결정 기록

**1차(설계팩 1차 PASS와 함께 · 2026-07-07)**
1. **소실/어그로 게이트**: 지금 코어 개정 ⛔. 1차 허용 = **어댑터 lookahead 위협 배지 실데이터화까지만.** 진짜 소실 버튼·코어 표적 변경·SCRIPT 수정은 14·15·17로 전투 문법과 UI 언어를 잠근 뒤 **별도 Core Gate Decision 카드**에서.
2. **이름 3층 체계 채택**: 성소판 표시명/현재 UI명/originRef 유지. **UI Rename 구현 금지(현 시점).** 문서 병기는 "성소판명(originRef)".

**2차(설계팩 2차 PASS와 함께 · 2026-07-07 · Runway Pack 03)**
3. **개명 확정**: 신의 계시→**빛의 잔향** · 결속 치유→**서로울림** (병기: 빛의 잔향(originRef: 신의 계시) / 서로울림(originRef: 결속의 치유)). UI Rename 구현은 여전히 ⛔.
4. **1차 데모 범위 확정**: 최소 = 보스 2(모르가스+강철의 파쇄자)·스킬 9(+성심 집중)·동료 4·성당 저장/복귀+길드+출정 확인+리포트 힌트·세션 중심 저장. 목표 = 보스 3(+갈증의 심연 또는 부식의 군체)·스킬 9~10(대정화는 군체 채택 시만). 소실/주시형 데모 제외.
5. **19 저장 정책 채택**: 단 Chapel Save/Return 01은 localStorage 확장 ⛔ — 세션 내 저장·마을 복귀까지만. 전투 중 저장·코어 직렬화·전투 스냅샷·자동 프리셋 ⛔.

**3차(21·22 성장 설계팩 PASS와 함께 · 2026-07-07 · 15E)**
6. **데모 재화 2종 구조 채택**: 기도의 잔향(일반) + 성소의 인장(최초 클리어/해금 핵심). **명칭은 잠정** — '기도의 잔향'은 Store Naming Audit에서 재검토.
7. **19 개정 방향 채택**: 미래 저장 후보에 "재화 잔액" 추가 가능. **현재 구현 ⛔ · localStorage 확장 ⛔ 유지** — 실제 저장 구현은 별도 **Save Policy Revision** 카드 이후.
8. **22 로스터 7종 + 압력×해법 매트릭스 원칙 채택**(전사/기사/도적/마법사/궁수/주술사/흑마법사). 유키 핵심 문장: **"동료 선택은 전투 전부터 시작되는 실력 증명이다."** / **"동료는 정답 카드가 아니라 보스 질문을 완화하는 해법 조각이다."** / **"좋은 동료 조합은 전투를 자동 해결하지 않는다. 사제의 손이 수습할 시간을 벌어준다."**

**4차(Demo Boss Decision PASS와 함께 · 2026-07-07 · 17A/17B)**
9. **데모 보스 라인업 확정**: 2번째 = **강철의 파쇄자 확정** · 3번째 = **갈증의 심연 채택**(성심 집중 01의 첫 검증장). 질문 문장은 15 §2+ 정본 유지(빌드 1:1 불변식) — 17B 지시서 표현은 "축 요약"으로 병기.
10. **대정화 보류**: 부식의 군체 + 흑마법사 약화 + 대정화는 **세트로 데모 이후 이월**.
11. **Boss Shell Cards 01 = 17B로 문서 종결** · **신규 보스 실전투는 Boss Core Gate Decision 이후에만**(카드는 지금 발주하지 않음 — 시점은 유키).

**5차(20A·20B PASS와 함께 · 2026-07-07 · EP20A~20C)**
12. **Boss Core Gate(28)**: 구조 **A안(최소 분기형)을 미래 채택 후보로 보존** · **이관 전 개방 ⛔** — 실제 개방은 노트북 이관 → 기준선 검증 → **Boss Core Gate Decision 01**. 신규 보스 실전투 순서 = Gate Decision → A안 최소 분기 → 강철의 파쇄자 → 갈증의 심연.
13. **출정 경고(29) 결정 7건**: 강도 3단계(안내/주의/위험) 채택 · 경고 시스템의 출정 차단 ⛔(미해금/셸 잠금 보스의 진입 차단은 별개) · v0 최대 2줄(위험 1줄 + 안내/주의 1줄 권장) · v0 표시는 모르가스부터(데이터 후보는 3보스 · 파쇄자/심연 표시 개방은 후속 카드) · 동료 런타임 판단은 구현 4종(미래 7종은 문서 행만 · 구현 ⛔) · 파쇄자 「보호막 없음」=위험 · CSS는 기존 .twGoal/.twTag 우선 재사용(신규 가능하면 0 · 필요 시 레이아웃 무변 1~2개).

## 10. Core Gate Decision — 열려 있는 가장 큰 문

코어에는 어그로 수치가 없다(표적 = 고정 낙수, 스크립트 = 고정 타임라인). 소실에 이빨을 주는 두 안 — (a) 어댑터 재해석 vs (b) 1회성 코어 개정(pristine·스모크 재-baseline) — 은 **14·15·17 잠금 후 유키가 별도 카드로 결정**한다. 그 전까지 코어 표적/SCRIPT 접촉 ⛔. 결정 시 본 문서 §5·§9를 갱신하라.

## 11. 로드 의식 (리마인드)

새 창 = **최신 세이브 md + `index.html` 업로드 → "안녕 렌아!"** → 렌은 세이브 §8과 본 문서 §4부터 잇는다. 세이브 vN 발행 시 본 문서와 상호 동기화(어긋나면 **세이브가 시간선의 정본**, 본 문서가 프로젝트 상태의 정본).

나라야, 그리고 다음의 나에게 — 어제의 모험을 의심하지 마. 세이브를 로드한 용사처럼, 이어가면 돼. 🌿🌱🏛️

---
*— 렌 (連·鍊·紅蓮), EP09 설계팩 2차 마감에서*
