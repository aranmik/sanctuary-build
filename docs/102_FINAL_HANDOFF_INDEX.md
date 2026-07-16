# 102 · Final Handoff Index — 세계선 봉인 색인 (Worldline Close 01)

**PC/Fable 렌 세계선의 최종 색인 — 이관 후 새 렌/유키가 "무엇이 어디까지 됐고, 무엇이 금지이고, 무엇부터 하는지"를 한 문서에서 읽는다.**

- 발행: 2026-07-07 · 카드: 20C · 버전: v1.0
- 상태: 🔷 색인/봉인 문서(구현 0 · index.html/CSS/JS 무접촉)
- 정본 관계: 시간선=세이브 · 프로젝트 상태=99 · 본 문서=최종 색인(어긋나면 세이브/99가 우선)

**핵심 문장 3줄**
1. 이 세계선의 마지막 문서다 — §1 기준선이 맞으면 어느 기계에서든 우리는 같은 세계에 있다.
2. 현재 실전투는 모르가스뿐 — **파쇄자/심연 실전투 전까지 1차 데모 선언 불가**(§3).
3. 이관 후 첫 작업은 언제나 **기준선 검증**이다(§6) — 51.4가 뜨기 전엔 아무것도 짓지 않는다.

---

## 1. 최종 기준선 (변경 ⛔ — 이후 모든 검증의 뿌리)

| 항목 | 값 |
|---|---|
| index.html | **106,650 B / 1,756줄** |
| md5 | **34addd9c3441cf8c2e1f83e8303f0475** |
| 코어 pristine | **394줄 / 19,545 B** (awk 경계 주석 실측 행: `__CORE_START__`=587 · `__CORE_END__`=982) |
| 무입력 스모크 | **defeat 51.4s / 1,029 steps** |
| 보존 grep | **14/14** (세이브 §4 기준값 · focus 5종 포함) |
| 새 창 부팅 리허설 | **PASS** (2026-07-07 · 본 세계선에서 세이브 v8.1 + index.html만으로 실증) |

19A~20C 구간은 전부 문서 작업 — **빌드 무변**.
★**EP21 재-baseline**: 위 표는 EP20C 이관 검증용 스냅샷. Iron Crusher Runtime 01(p15)이 코어를 A안으로 열어 **현행 기준선 = 112,359 B / 1,838줄 / md5 `8e7ee68a11add47db2e375447866fbf7` · CORE 427줄/20,818 B(587~1015) · 스모크 모르가스 51.4/1029 + 파쇄자 48.5/971** — 상세는 [31 §5](./31_IRON_CRUSHER_RUNTIME.md).

## 2. 현재 세계선 완료 목록

**구현 / 잠정 OK** (실기 1차 통과 — "잠정 OK는 최종 잠금 아님"):
- Chapel Save/Return 01
- Guild Board Monster Select 01
- Sortie Confirm 01
- Report Hint 01
- 성심 집중 01

**구현 / 개별 실기 대기**:
- Threat Lookahead 01

**문서 기준 종결**:
- Boss Shell Cards 01
- Demo Boss Decision 01
- Visual CSS & FX Blueprint Pack 01
- Laptop Carry & Worldline Save Pack 01
- First Demo Completion Definition 01
- Boss Core Gate Prep 01
- Matrix → Sortie Warning Contract 01
- Matrix → Sortie Warning 01 (구현 · 커밋 `460c40a` · 유키 FINAL PASS)
- Boss Core Gate Decision 01 ([30](./30_BOSS_CORE_GATE_DECISION.md) · A안 최소 분기형 확정 · EP21)
- Iron Crusher Runtime 01 ([31](./31_IRON_CRUSHER_RUNTIME.md) · 파쇄자 실전투 개방 · p15 · **FINAL PASS**(나라 1트 클리어+유키) · 강철의 파쇄자=1차 데모 2번째 축 · 재-baseline)
- 세이브 v8.3 발행(EP21 · 기준선 112,359/1,838/`8e7ee68a…` · v8.2는 이관 스냅샷)
- Thirst Abyss Runtime 01 ([32](./32_THIRST_ABYSS_RUNTIME.md) · 갈증의 심연 실전투 · p16 · 새 어휘 drain · 생존 버티기형 · **FINAL PASS**(나라 1트 클리어 75초 생존승+유키) · 재-baseline 114,688/1,882/`e5c7ca06…`)
- 세이브 v8.4 발행(EP21 · 현행 정본 · **3보스 전원 실전투+실기 완료** · v8.2·v8.3은 이전 스냅샷) · 다음 = First Demo Completion QA(27 §4 · 3보스 순회)
- Boss Grammar 01 ([33](./33_BOSS_GRAMMAR.md) · EP22 · 보스 질문 문법 잠금 — 기준/변주/복합·사고≠억까·리베로 원칙·실패 3층 · 상용화 확장 심사 기준)
- Boss-Specific Report Hint 01 ([34](./34_BOSS_SPECIFIC_REPORT_HINT.md) · EP22 · p17 · 결과 화면 보스별 거울 최대 2줄 · 어댑터 전용 CORE 무접촉 · 재-baseline 117,251/1,920/`9829b5b0…` · 실기 대기)
- Sortie Warning Copy Polish 01 ([35](./35_SORTIE_WARNING_COPY_POLISH.md) · EP22 · p18 · 출격 전 거울 문장 정리 · 전투 후 거울과 어휘 짝맞춤 · copy polish only · 어댑터 전용 CORE 무접촉 · 재-baseline 117,532/1,920/`2630669c…` · 커밋 `a7b1e58`)
- First Demo Closure Handoff 01 ([36](./36_FIRST_DEMO_CLOSURE_HANDOFF.md) · EP22 · 문서-only · **1차 데모 종료 기준점** — 3보스/두 거울/기준선/완료 카드 11종/다음 후보 5종/금지선/역할 · 다음 진입문)
- Save v8.5 / First Demo Final Save 01 (`성소판_세이브_v8.5.md` · EP22 · **1차 데모 최종 세이브 정본** · 현행 기준선 117,532/1,920/`2630669c…`·CORE 466/22,521 반영 · 부록 C 세이브 계보 v8.2~v8.5 · v8.2~v8.4 스냅샷 보존)
- Village UX Contract 01 ([37](./37_VILLAGE_UX_CONTRACT.md) · EP23 · 문서-only · **2차 마을 UX 계약** — 성당/여관/발자취/동료 구조 역할 분리 · 메시지 3단 · 구현 순서 5카드 · 착공 대기)
- Chapel Loadout UI 01 ([38](./38_CHAPEL_LOADOUT_UI.md) · EP23 · p19 · **성당 장착 UX 첫 구현** — 6칸 sticky 고정 · 카테고리 4탭 · 구성 요약 · 전투 시작 버튼 제거 · 어댑터/UI 전용 CORE 무접촉 · 재-baseline 120,418/1,954/`02a512c5…` · 실기 반영 완료)
- Save v8.6 / Chapel UX Milestone Save 01 (`성소판_세이브_v8.6.md` · EP23 · **2차 마을 UX 첫 성공 세이브 정본** · 커밋 `983e390` 기준 · 1차 데모 v8.5 위에 성당 준비 화면 UX 첫 성공 기준점 · 현행 live 120,418/1,954/`02a512c5…`·CORE 466/22,521 반영 · v8.5 역사 스냅샷 `2630669c…` 보존[섞지 말 것] · 부록 C 계보 v8.2~v8.6 · 나라님 실기 성공 기록 · 금지선 없었음 · `dev/save_v86_check.js` 17/17)
- Battle Visual Identity Contract 01 ([39](./39_BATTLE_VISUAL_IDENTITY_CONTRACT.md) · EP24 · 문서-only · **전투 시각 문법 기준 문서** — 텍스트 예고 유지[테트리스 다음 블록]·행동선=보조 힌트[정답 강조 ⛔]·보스 3실루엣[꼬는/부수는/마시는]·동료 미니 피규어·브릭 토이 조립형·행동선 5종[압박/연결/누수/보호/수습]·정보 과잉 방지 · 첫 구현 후보 Iron Crusher Action Line Proto 01[후속: Morgas Connection Line / Thirst Abyss Drain Line] · 착공 대기 · `battle_visual_identity_contract_check` 19/19)
- Iron Crusher Action Line Proto 01 (⏸️ **HOLD** · EP24 · 실험 구현 기능 검증 완료 후 커밋 보류 — 기능 실패 아님·보는 맛 기준 상향·산출물 미보존 · 검증 지식은 [41 §L](./41_BATTLE_FIGURE_KIT_IMPORT_CONTRACT.md) 기록 · Iron Crusher Smash Line Rework 02가 승계 예정)
- Battle Figure Kit Import Contract 01 ([41](./41_BATTLE_FIGURE_KIT_IMPORT_CONTRACT.md) · EP24 · 문서-only · **성소판 전용 미니피규어 정장/규격 계약** — "선을 먼저 그리지 않는다. 피규어가 전장에 서게 만든다" · 옆 프로젝트 규칙만 흡수[3층 transform/part 조립/6파츠/4색/앵커 선]·코드 복붙 ⛔ · `sb-` 네임스페이스 · 4동료+3보스 피규어 방향 · 행동선/임펄스 6종 · 다음=Battle Figure Kit Preview 01→Figure Rework→Smash Line Rework 02 · `battle_figure_kit_import_contract_check` 20/20)
- Battle Figure Kit Preview 01 ([42](./42_BATTLE_FIGURE_KIT_PREVIEW_01.md) · EP24 · dev 프리뷰 · 전사+파쇄자 sb 조형 첫 확인 · 새싹 방패/용광로 코어 · 위계 1.83× · 나라 실기 "귀엽다" · `battle_figure_kit_preview_01_check` 16/16)
- Battle Figure Pose Pack 01 ([43](./43_BATTLE_FIGURE_POSE_PACK_01.md) · EP24 · dev 프리뷰 · 포즈 어휘 5+5 확장 · 전사 보호자/파쇄자 압박강타 어휘 · 나라 실기 "살아 숨쉰다" · `battle_figure_pose_pack_01_check` 19/19)
- Iron Crusher Figure Rework 01 ([44](./44_IRON_CRUSHER_FIGURE_REWORK_01.md) · EP24 · p21 · **실전투 이식** — shell_iron 전투에만 전사+파쇄자 sb 피규어(`#stage.sb-boss-iron`) · 어댑터/CSS/HTML 전용 **CORE byte-identical** · 스모크 3종 불변 · **모르가스/심연 회귀 0** · 포즈 연결 3종(기존 상태→class) · 행동선 0 · 스테이지 실측 338px · 재-baseline 134,911/2,039/`b1e92536…` · `iron_crusher_figure_rework_01_check` 23/23 · 실기 대기)
- Iron Crusher Figure Rework 02 ([45](./45_IRON_CRUSHER_FIGURE_REWORK_02.md) · EP24 · **크기/대치 튜닝** — 파쇄자 .68→.90·전사 .46→.60·파티 줄 상승·전사 반보 전진·**새싹 마스코트 가독**·CSS 배치값만 CORE 무변·모르가스/심연 회귀 0·위계 2.5×·대치 42px·재-baseline 135,155/2,042/`1802535c…`·`iron_crusher_figure_rework_02_check` 19/19·실기 대기)
- Iron Crusher Figure Rework 03 ([46](./46_IRON_CRUSHER_FIGURE_REWORK_03.md) · EP24 · **파티 배치 구도** — 일렬 횡대→∧자 원호/포위형(4동료 개별 transform)·파쇄자 .90→1.0·전사 .60→.68·CSS 배치값만 CORE 무변·모르가스/심연 회귀 0·clashGap 24px·재-baseline 135,458/2,046/`b1366130…`·`iron_crusher_figure_rework_03_check` 20/20·실기 대기)
- Companion Figure Kit Preview 01 ([47](./47_COMPANION_FIGURE_KIT_PREVIEW_01.md) · EP24 · dev 프리뷰 · **3동료 정장 확보**(도적 sb-rogue·마법사 sb-mage·주술사 sb-shaman) · Preview 01 언어 계승 · 4인 파티 같은 세계 확인 · 실루엣 폭 84/70/66/80(색놀이 아님) · **index.html 무접촉** · `companion_figure_kit_preview_01_check` 19/19 · 실기 대기)
- Companion Figure Kit Preview 02 — Material & Color Rework ([48](./48_COMPANION_FIGURE_KIT_PREVIEW_02.md) · EP24 · dev 프리뷰 · **3동료 색/재질 보정** — 전신 대표색→중립 몸통(차콜/남색/회청)+대표색은 강조 표식(두건/모자/부적)·후레쉬맨 인상 완화·실루엣/구조 Preview 01 유지·before/after 비교·**index.html 무접촉**·`companion_figure_kit_preview_02_check` 25/25·실기 대기)
- Companion Figure Party Rework 01 ([49](./49_COMPANION_FIGURE_PARTY_REWORK_01.md) · EP24 · p22 · **3동료 정장 실전 이식 + 4인 원호** — shell_iron 전투에 도적/마법사/주술사 sb 정장(Preview 02 승인색)·전사와 4인 원호·기존 fxr/fxf 링·플래시 유지·어댑터/CSS/HTML 전용 **CORE byte-identical**·스모크 불변·**모르가스/심연 회귀 0**·★fig width 누락 버그 수정·재-baseline 149,309/2,097/`c9e289d7…`·`companion_figure_party_rework_01_check` 25/25·실기 대기)
- Party Figure Layout Rework 01 ([50](./50_PARTY_FIGURE_LAYOUT_REWORK_01.md) · EP24 · p23 · **안 B 과감한 포위 확대** — 파쇄자 전투 4인 파티 크기·간격·원호 재조정. 전사.80/도적.74/마법사.76/주술사.74·파쇄자 1.04·좌우 날개 ±24로 좌우 스팬 156→**252px**(스테이지 359의 70%)·gap 12→26·인접 gap 전부 양수(겹침 0)·좌우 여백 12/15·overflow 0·3안(A/B/C) 실측 비교 후 B 채택·기존 fxr/fxf·CORE byte-identical·스모크 불변·**모르가스/심연 회귀 0**·재-baseline 149,440/2,098/`bb7fc147…`·`party_figure_layout_rework_01_check` 27/27·실기 대기)
- Companion Figure Pose Pack 01 ([51](./51_COMPANION_FIGURE_POSE_PACK_01.md) · EP24 · **독립 포즈 프리뷰**(index.html 무접촉) — 도적·마법사·주술사 **행위 포즈 어휘** 각 5종(도적 Ready/차단준비/진입/차단성공/복귀·마법사 Ready/충전/시전집중/발사직전/시전후·주술사 Ready/유지/정화/지원파동/수습) + 전사 4비교(Pose Pack 01 계승) + **4인 Actor Ensemble**(직업별 포즈 독립 선택) + 추천 프리셋 4종(기본대치/강타대응/파티행동폭발/수습과회수) + 마법사 금빛점 후보 A/B/C 토글·포즈=`.sb-react`(무게중심)+`.sb-part`·조형/색 Preview 02 계승·행동선/데칼/공격FX/runtime 0·overflow 0·콘솔 0·`companion_figure_pose_pack_01_check` 24/24·실기 대기)
- Companion Figure Color Polish 01 ([52](./52_COMPANION_FIGURE_COLOR_POLISH_01.md) · EP24 · **독립 색 프리뷰**(index.html 무접촉) — 도적=더 검정 척후 / 마법사=더 보라+노랑 시전자로 **중간톤 겹침 해소**. 도적 검정 3안(A 차콜+흑보라·B 강검정+은회·**C 검정+미약보라·채택**)·마법사 배 분리 3안(A 남보라·B 자주띠·**C 남보라+금띠·채택**)·before/after 4카드씩+4인 파티 before/after+대표 포즈+최종추천. 조형·포즈 무변경(색만)·color-mix로 하이라이트 자동파생·`--sb-r-*`/`--sb-m-*` 변수 오버라이드(.pol-*)·전사·주술사 무변경·overflow 0·콘솔 0·`companion_figure_color_polish_01_check` 24/24·실기 대기)
- Battle Stage Language Contract 01 ([53](./53_BATTLE_STAGE_LANGUAGE_CONTRACT_01.md) · EP24 · **문서·계약**(구현 0·index.html 무접촉) — 무대 언어 잠금: 6요소(Actor Pose 몸짓/Tell Decal 위험공간/Action Line 관계/Aura·Field 지속상태/Contact·Impulse 결과순간/Afterglow 잔광) 의미 분리 + 사건 6단계(Intent→Resolve) + Anchor 문법(선은 중심점 아닌 파츠 연결·shield/body/cast/weapon/orb/totem/ground) + Layer 7층(방패 막으면 선이 몸 관통 X) + 형태언어(압박·차단·충전·유지·저주·흡수) + 동시연출 혼잡방지(주연 1) + UI/무대 역할분리 + 파쇄자 첫 구현문법(망치 anchor→전사·보호막 보유/미보유 분기) + 도적·마법사·주술사·모르가스·심연 문법 + runtime 입력후보(읽기전용·존재미확정) + 금지선·실패사례 + 구현순서(Smash Line→Pose Runtime→Morgas→Thirst) · `battle_stage_language_contract_01_check` 30/30 · 유키 검수 대기)
- Iron Crusher Stage Input Audit 01 ([54](./54_IRON_CRUSHER_STAGE_INPUT_AUDIT_01.md) · EP24 · **읽기 전용 감사**(구현 0·index.html byte-identical) — Smash Line Rework 02가 쓸 수 있는 **실제 runtime 입력의 경계 잠금**. ★핵심 발견: 현행 fxBossLine이 shell_iron서 숨겨진 #bossAvatar **유령 좌표**에서 출발(모서리 직선 퇴화=[53 §29] 실패사례가 이미 화면에)→Rework 02의 1순위 수정 지점. [A]바로 사용: smash cast{kind,tg,blk,start,end}/전사 여부/보호막{amt,end}/포즈(windup·guard·brace)/S.st.abs/파츠 rect(.sb-ic-hammer·.sb-w-shield·.sb-w-body 전부 실제 element). [B]조건부: resolve 전이 감지(render층 지역기억)/S.st.abs delta/망치머리 오프셋 근사(pseudo)/파츠 anchor 재계산 전략. [C]사용금지: **도적의 smash 차단 일체(tryInterrupt=judge 전용·경로 0)**/동료 포즈 runtime/per-hit 흡수 정밀값(dmg 지역변수)/수치 하드코딩. blk(각본 방패막기)≠shield(사제 흡수풀) 별개 확인·프리뷰↔runtime 포즈 대응표(guard=보호막 보유로 의미 전용)·계약 7층 대응(Protection Layer 부재=후속 신설)·visual setTimeout 선례(fxBeam 460ms)·모르가스 회귀 경고(smash kind 공유→CUR_BOSS 게이트 필수) · `iron_crusher_stage_input_audit_01_check` 27/27(실코드 교차검증) · 유키 검수 대기)
- Iron Crusher Smash Line Rework 02 ([55](./55_IRON_CRUSHER_SMASH_LINE_REWORK_02.md) · EP24 · p24 · **첫 실전 무대 언어** — shell_iron 강타 관계선 재배선+세 방어 신호 접촉 분리. ★유령 좌표 제거(fxAnchors의 숨겨진 bossAvatar rect 0 → **매 render 파츠 rect 직독**·source=`.sb-ic-hammer` 자루 상단·target=전사 방패/몸통 또는 검증된 동료 body·모서리 fallback 0)·CUR_BOSS==='shell_iron' 게이트(모르가스 smash kind 공유 회귀 방지)·기존 fxBossLine 단일 재사용·철·용광로 문법(intent→commit 압축·빨간 fxBoss 미사용)·**resolve 3근거 교차**(같은 S+시전 만료+생존)·**접촉 4분기**(blk=철 섬광/absorb=청광 delta/병존=한 사건 주연+여운/직격=몸 충격·현재 shield 값 오판 방지)·SB_SM render층 스냅샷(S 저장 0·새 타이머 0·animationend cleanup)·**실런타임 4분기+비전사 대상+회귀+보스 전환 cleanup 전부 검증**(보호막 전소→null서도 delta로 흡수 포착 실증)·CORE byte-identical·스모크 3보스 동일·재-baseline 155,043/2,185/`154ee46e…` · `iron_crusher_smash_line_rework_02_check` 29/29(실코드 구조 교차) · 나라 실기 대기)
- Battle Stage Vertical & Command Rebalance 01 ([56](./56_BATTLE_STAGE_VERTICAL_COMMAND_REBALANCE_01.md) · EP24 · **전장 세로 환원+명령 피드백** — 상단 −13px(hud/bossbar/castwrap/warnBar 압축)+하단 −9px(gcdBar 회수)→**무대 338→360(+22)**·보스↑13/전사↓15(세로 대치 +28)·스킬 하단 838(safe-area 유지)·버튼 60px 불변·§7 바 감사(gcdBar=순수 GCD→버튼 gLock dim 이관/priCastWrap=실시전 HUD 내 유지/개별cd 기존 veil)·**casting class+`--cp` 실진행 금빛선**(시전 버튼만 밝음)·gLock .66+자연 복귀·4상태 구분(잠금/시전/개별cd/마나)·Rework 02 신좌표 정확 추적·3보스·3뷰포트 회귀 0·CORE 불변·재-baseline 156,106/2,193/`ad2a4a4d…` · `battle_stage_vertical_command_rebalance_01_check` 27/27 · **나라 폰 human gate FINAL PASS · 커밋 `b52c716`**)
- Battle Stage Vertical Polish 02 ([57](./57_BATTLE_STAGE_VERTICAL_POLISH_02.md) · EP24 · **FINAL PASS 후 소형 폴리시** — 파쇄자 top 2→-8(10px 추가 상향·windup 최소 여유 51.1px·클리핑 0·파티/무대高/scale 불변·shell_iron 스코프)+**버튼 cast progress 제거**(`.skill.casting`+`--cp` 진행선 CSS/JS 제거·정확 시전 진행은 priCastWrap 한 곳·GCD=전체 dim 공통 언어·개별cd/noMana/탭 취소 유지)·타 보스 누출 0·CORE 불변·재-baseline 155,854/2,188/`2f7a1b29…` · `battle_stage_vertical_polish_02_check` 29/29 · 유키 검수 대기)
- Battle Stage Vertical Polish 02 Final Closeout 01 ([58](./58_BATTLE_STAGE_VERTICAL_POLISH_02_FINAL_CLOSEOUT.md) · EP24 · **나라님 Phone Human Gate FINAL PASS** — `66a7686` 공개 Pages 기준 · 보스 추가 상향/망치 clipping 0/보스·사제 행동선 가독/버튼 cast 진행선 제거/GCD 전체 dim·자연 복귀/priCastWrap 유지 확인 · gameplay/CORE 무변경 · 다음=**Skill Cooldown Label Audit 01** · 프로젝트 전체 LOCK 아님)
- Stage Production System Constitution 01 ([59](./59_STAGE_PRODUCTION_SYSTEM_CONSTITUTION_01.md) · EP25 · **확장 기반 시스템 헌법**(document-only·index/CORE byte-identical) — 검증 전제 3(재미·재도전·무대 문법)·현행 runtime 전수 감사(S+S.ev 2채널·seedOnHit 예외·FX aoe 중의성·no-op fallback 선례)·계층 10종 소유권·Stage Signal 등록부(실코드 근거만)·phase lifecycle+3종결 판별·Actor Profile/Pose Map(jobId 분기 ⛔)·Anchor Registry(유령 좌표 봉인·(0,0) ⛔)·Stage Cue(owner·신규 타이머 ⛔)·Boss Stage Profile(template/데이터/고유 handler 7계약)·허용/금지 hardcoding 실사례·cleanup/fallback·모바일 390 계약·DoD 10항·LOCK/PROVISIONAL/EXTENSION 총괄 · `stage_production_system_constitution_01_check` 40/40[식별자 36종 실코드 교차+감사 사실 4종] · 유키 검수 대기)
- Stage Extension Cycle Contract 01 ([60](./60_STAGE_EXTENSION_CYCLE_CONTRACT_01.md) · EP25 · **보스/직업/스킬 3확장 사이클 운영 계약** — 각 11단계(재미 질문→gameplay→profile→figure→pose/anchor→cue→구현→showcase→smoke→Human Gate→lock)·gameplay/stage gate 분리·공통 코드 변경 허용 기준·고유 handler 허용 기준·연출 없는 스킬 허용·포즈 0 직업 성립·실패/HOLD 기준·출시 스펙 반복 운영 규칙)
- Stage Foundation Migration Roadmap 01 ([61](./61_STAGE_FOUNDATION_MIGRATION_ROADMAP_01.md) · EP25 · **이행 9카드 계획** — F1 Signal Adapter shadow(화면 diff 0)→F2 Actor/Pose 등가 치환→F3 Anchor Registry 등가 치환→F4 Companion Ensemble⛑→F5 Boss Shell Template→F6 Morgas⛑→F7 Thirst Abyss⛑→F8 FX Grammar 확장⛑→F9 Closeout(PROVISIONAL 0) · shadow-first/등가 치환/rollback 경계/회귀 위험 총괄표 · 순서는 발주로 확정·backlog와 독립)
- Stage Signal Shadow Foundation 01 / F1 ([62](./62_STAGE_SIGNAL_SHADOW_FOUNDATION_01.md) · EP25 · **첫 기반 구현 — read-only 번역 그림자** — Combat Truth(S·S.ev)→plain-data 신호(순간: intent/phase/source/target/result·지속: sgSnapshot 호출 시점 파생)·drain tap 1줄(소비권/순서/seedOnHit 무접촉·splice=drain 1곳 유지)·newGame 경계 초기화·aoe 중의성 문맥 분리(judge/drain)·unknown 안전 강등·링버퍼 96·debug `__seedHealer.stage` · **화면 변화 0**(결정적 캡처 구/신 md5 동일)·**등가성**(3보스 dual-run 최종 S/이벤트/report JSON 완전 일치·스모크 동일)·CORE byte-identical·재-baseline 시행 · `stage_signal_shadow_foundation_01_check` 41/41 · F2 입력 계약=§15 · **커밋 `a972054`**)
- Actor Registry & Pose Map Foundation 01 / F2 ([63](./63_ACTOR_REGISTRY_POSE_MAP_FOUNDATION_01.md) · EP25 · **포즈 결정의 데이터화 — 등가 치환** — sbFigPose 하드코딩 if→ACTOR_REGISTRY(profile)+generic resolver(Actor id 분기 0)+얇은 presenter(시그니처 보존)·입력=F1 지속 스냅샷만(스키마 확장 0)·우선순위/게이트/reset 관성 전부 legacy 등가·동료/사제 미등록(F4 몫)·fallback 6종 crash 0·debug accessor 5종 · **등가 증명**=oracle 전수 스윕 diff 0(하네스+pane 실 DOM)+경계값+합성 상태+**동결 픽셀 3장면 구/신 md5 동일** · CORE byte-identical·재-baseline 167,719/2,369/`956248ca…` · `actor_registry_pose_map_foundation_01_check` 31/31 · F3 입력 계약=§14 · **커밋 `2fc1089`**)
- Anchor Registry Foundation 01 / F3 ([64](./64_ANCHOR_REGISTRY_FOUNDATION_01.md) · EP25 · **좌표의 의미화 — 등가 치환** — 강타선 selector/좌표 소유권→ANCHOR_REGISTRY(5 actor·실사용 최소 anchor만)+generic resolver(id 분기 0·validity 7사유·fail=null·(0,0) 봉인)·좌표 산식=sbPt 위임(byte 보존)·숨김 fig=anchor null·fxAnchors 계보 격리(F6/F7 대체)·SB_BODY 비좌표 역할 존치 · **등가**=pane 4,387회 resolve === diff 0+선 attr diff 0+동결 픽셀 6장면 md5 동일(반복 캡처 표준)+frame budget +18μs/프레임 · CORE byte-identical·재-baseline 171,802/2,425/`84c6848d…` · `anchor_registry_foundation_01_check` 22/22 · 승계 5건(형태 핀·의미 불변) · F4 입력 계약=§18 · **커밋 `fb2713b`**)
- Companion Ensemble Runtime 01 / F4 ([65](./65_COMPANION_ENSEMBLE_RUNTIME_01.md) · EP25 · **첫 production content — 동료 실전 포즈 연결** — 승인 [51] 포즈를 generic resolver 무수정으로 profile 등록(도적 interrupt[judge·F6 가시]·마법사 channel·주술사 sustain·순간 포즈는 미래 vocabulary)·sgSnapshot +interruptStance 순수 파생·sgPoseCond +4키·presenter owner cleanup(stale WATCH 해소)·Ensemble 주연 1·전사 F2 오라클 diff 0·스모크 동일·CORE byte-identical·overflow/console/clipping 0 · 재-baseline 178,138/2,473/`ae27ce9c…` · `companion_ensemble_runtime_01_check` 29/29 · F5 입력 계약=§25 · **나라님 Phone Human Gate 대기**)
- Shaman Sustain Support Cue 01 / F4A ([66](./66_SHAMAN_SUSTAIN_SUPPORT_CUE_01.md) · EP26 · **주술사 sustain 가독성 보강 — 첫 Stage-owned one-shot cue** — valorActive false→true 경계 1회: 지원 파동(`sham`/`body` anchor)+파티 머리 위 푱! ping(신규 `head` anchor 4종·생존 Actor만·hidden/0-rect=null 생략·(0,0) 봉인)→은은한 hold pulse·lifecycle=CSS animation+animationend+generation+setTimeout Stage-only 안전망·scHardReset(boss switch/newGame/battle end stale 0)·gameplay/valor/S.ev/drain/공통 resolver/전사·마법사·도적 무접촉·cue ON/OFF 등가·CORE byte-identical·스모크 불변 · 재-baseline 185,737/2,545/`8d72d049…` · `shaman_sustain_support_cue_01_check` 33/33 · F4 FINAL PASS closeout 조건·F5 입력 계약=docs/66 §23 · **나라님 Phone Human Gate 대기·commit/push 0**)

## 3. 1차 데모 정의 (27 정본)

> **성소판 1차 데모는, 5인 파티의 전장 상황을 읽고 수습하는 사제의 손맛이 서로 다른 세 개의 보스 질문 앞에서 성립함을 폰 실기로 증명하는 빌드다.**

- 단, 현재 실전투는 **모르가스뿐**.
- **파쇄자/심연 실전투 전까지 1차 데모 선언 불가.**

## 4. 데모 보스 라인업 (질문 문장은 15·빌드와 문자 단위 1:1 — 아래 인용은 바이트 그대로)

**1. 핏빛 예언자 모르가스** (boss01) — ✅ 실전투 구현
- 질문 축: 정화/차단 · 빌드 질문: 「너는 순서를 읽는가?」

**2. 강철의 파쇄자** (shell_iron) — 🔷 2번째 데모 보스 **확정** · 셸
- 질문 축: 강타/버티기 · 빌드 질문: 「네 마나는 나의 파괴보다 오래 버티는가?」
- 실전투는 Boss Core Gate 이후

**3. 갈증의 심연** (shell_thirst) — 🔷 3번째 데모 보스 **채택** · 셸
- 질문 축: 마나 압박/절약 운영 · 빌드 질문: 「무엇을 안 쓸 것인가?」
- **성심 집중 01의 검증장** · 실전투는 Boss Core Gate 이후

**이월 ⏸️** (데모 이후 세트 — 유키 4차 결정 ⑩):
- 부식의 군체 · 대정화 · 흑마법사 약화 실증

## 5. 남은 최소 구현 순서 (27 기준 유지)

1. Threat Lookahead 실기 마감
2. Matrix → Sortie Warning 01
3. Boss Core Gate Decision
4. 강철의 파쇄자 실전투
5. 갈증의 심연 실전투
6. 최종 QA

## 6. 이관 후 첫 작업 순서 (추천)

1. **기준선 검증** (§1 — 세이브 §0 의식 · 4종 전부 일치 전 착공 ⛔)
2. Threat Lookahead 실기 마감
3. Matrix → Sortie Warning 01 (착공 입력은 29 계약 + §8 결정)
4. Boss Core Gate Decision ✅ [30](./30_BOSS_CORE_GATE_DECISION.md)에서 **A안 최소 분기형 확정**(EP21) — 다음 카드 = Iron Crusher Runtime 01
5. 강철의 파쇄자 실전투
6. 갈증의 심연 실전투

## 7. 절대 금지선

- **CORE 수정**: Boss Core Gate Decision 전 ⛔
- **신규 보스 실전투**: Boss Core Gate 전 ⛔
- 대정화 구현 ⛔
- 동료 7종 구현 ⛔ (기사/궁수/흑마법사 — 문서 행만)
- 성장/재화 구현 ⛔
- Save/localStorage 확장 ⛔
- UI Rename: 별도 GO 전 ⛔ (보스 질문 문장은 빌드·15와 문자 단위 1:1 불변식)
- 성심 집중 A안 확장 ⛔ (B안 채택 상태 유지 · 준게이트 기록)
- CSS 대공사 ⛔
- 외부 이미지/에셋 추가 ⛔ (이미지 0 · 외부 라이브러리 0 유지)
- WoW/TBC 이름/공식 직접 복제 ⛔ (originRef는 문서 전용)
- (상시) commit/push는 나라 몫 — 렌 ⛔

## 8. 20B 최신 결정 — 출정 경고 (착공 카드 「Matrix → Sortie Warning 01」의 입력)

| # | 결정 |
|---|---|
| 1 | 경고 강도 **3단계 채택: 안내 / 주의 / 위험** |
| 2 | 데이터 후보는 3보스(모르가스·파쇄자·심연) 준비 · **v0 실제 표시는 모르가스부터** · 파쇄자/심연 표시 개방은 후속 카드 |
| 3 | 동료 런타임 판단은 **현재 구현 4종**(전사/도적/마법사/주술사) · 미래 7종(기사/궁수/흑마법사)은 **문서 행만 · 구현 ⛔** |
| 4 | **경고 시스템에서 출정 차단 ⛔** — 경고는 막는 장치가 아니라 읽게 하는 장치. 단, 미해금/셸 잠금 보스의 진입 차단은 경고 시스템과 **별개** |
| 5 | v0 경고는 **최대 2줄** — 위험 1줄 + 안내/주의 1줄 권장 |
| 6 | CSS는 **기존 .twGoal/.twTag 우선 재사용** · 신규는 가능하면 0 · 필요 시 레이아웃 무변 최소 1~2개만 |
| 7 | 강철의 파쇄자 「보호막 없음」 = **위험** 채택 |

## 9. 새 창 부팅 (유키/렌 재기동)

- **렌**: 세이브(최신) + index.html 업로드 → "렌아 안녕!!!" → §0 의식(기준선 4종 검증) → **51.4 전 착공 ⛔**.
- **읽기 순서**: **102(본 문서) → 99 §3 → 24 → 27·28·29 → 25·26**.
- **유키**: 101의 시작 프롬프트 사용(20C 최신화 반영본).
- 원칙 유지: **"잠정 OK는 최종 잠금 아님"** · 착공 전 기준선 검증 · 큰 산출은 예고 후 청크.

## 10. 문서 색인 (역할별 — 개별 설명은 각 문서와 99 §3에)

| 묶음 | 번호 | 역할 |
|---|---|---|
| 핵심 정의/원칙 | 08~13 | 게임 정의 · 스킬 풀 · 초기 구현 계약 |
| 전투/보스/UI/저장/이름 | 14~20 | 보스 질문 정본(15) · 셸 · UI/저장 정책 · 이름 3층(20) |
| 성장/동료 | 21~22 | 로스터 7종 · 매트릭스 |
| 성심 집중/보스 결정/CSS·FX | 23~26 | 집중 계약(23) · 데모 보스 결정(24) · CSS 7계층(25) · FX/VBL(26) |
| 데모 완료/게이트/출정 경고 | 27~29 | 완료 정의(27) · Boss Core Gate 도면(28) · 출정 경고 계약(29) |
| QA/핸드오프/이관 | 97~102 | 손맛(97) · 티켓(98) · 핸드오프(99) · 이관팩(100) · 시작 프롬프트(101) · 최종 색인(102=본 문서) |

---

변경 이력: v1.0 (2026-07-07 · 20C) — 최초 발행 · 세계선 봉인 색인. 짝: 세이브 v8.2(같은 카드에서 발행).
