# 44. 강철의 파쇄자 전장 피규어 이식 (IRON CRUSHER FIGURE REWORK 01)

**작성: 렌 · 2026-07-11 · EP24 · 상태: 구현 카드(PASS 후보 — 나라님 폰 실기 대기) · 패치 p21 · 어댑터/CSS/HTML 전용(CORE 무접촉)**
**상호 링크**: [41 정장 계약](./41_BATTLE_FIGURE_KIT_IMPORT_CONTRACT.md) · [42 프리뷰 01](./42_BATTLE_FIGURE_KIT_PREVIEW_01.md) · [43 포즈 팩 01](./43_BATTLE_FIGURE_POSE_PACK_01.md) · [39 시각 정체성 계약](./39_BATTLE_VISUAL_IDENTITY_CONTRACT.md)

> **핵심 문장 3줄**
> 1. Preview 01·Pose Pack 01에서 확정된 전사·파쇄자 sb 미니피규어를 **실제 강철의 파쇄자 전투 화면**에 이식했다.
> 2. **선을 먼저 그리지 않는다. 피규어가 전장에 서게 만든다** — 행동선 0, 피규어만.
> 3. 시각 전용 — CORE byte-identical · 스모크 3종 불변 · 파쇄자 전투에만 적용(모르가스/심연 회귀 0).

---

## 1. 작업 목적

- [42]·[43]의 sb 정장+포즈 어휘를 강철의 파쇄자 전투 화면 상단 전장에 제한 적용.
- 핵심 질문: *"전시장에서 귀여웠던 피규어가 실제 전투 화면의 작은 전장에서도 얼굴·방패·망치·코어·위계가 읽히는가?"*

## 2. 기준 HEAD / 변경 파일

- 기준 HEAD: `a5956b3 docs: add battle figure preview and pose pack`.
- 변경: `index.html`(패치 p21 · 6 edits) · 신규 `docs/44`·`dev/iron_crusher_figure_rework_01_check.js`·`dev/p21.mjs` · 포인터 5종 최소 갱신.

## 3. Preview 01 / Pose Pack 01 계승

- 전사·파쇄자 파츠 CSS(sb-warrior/sb-iron-crusher · 파츠 7 + pseudo), 3층 transform, 색 변수, 새싹 방패·용광로 코어 정체성 계승.
- **프리뷰 HTML 통복붙 아님** — 전장에 필요한 최소 파츠·CSS·상태만 정리해 이식(갤러리/컨트롤/무대 CSS 제외, 연결 포즈만).

## 4. 실전용 축소 정장의 변경점 (simplified ingame variant)

- **★핵심 실측 발견**: 전투 스테이지(`#stage`)는 `min-height:104px`이지만 flex로 실제 **338px**(390×844 기준)로 확장 — 프리뷰(250px)보다 오히려 넓다. 축소 내성 우려가 크게 완화.
- CSS를 전부 `#stage` 스코프로 격리(기존 전투 CSS와 무충돌) + 변수를 `#stage`에 `--sb-` 로 정의.
- 배치 스케일: 파쇄자 `scale(.68)`(fig 190→약 129px), 전사 `scale(.46)`(fig 104→48px, 다른 동료 42px와 위계 조화).
- **작은 화면(`max-height:730px`) fallback**: sb 미표시 → 기존 ☠️ 이모지+원형 fig 유지(62px 스테이지 축소 안전).

## 5. 전사 피규어 DOM/파트 구조

- 기존 `#sa-war`(도적/마법사/주술사와 같은 슬롯) 안에 sb 래퍼를 **추가**(기존 figAura/figBody + fxr-war 링/fxf-war 플래시 span **유지**).
- `#sb-war-fig`(sb-unit.sb-warrior) > sb-react > sb-fit > sb-fig > 파츠 7(shadow/aura/sword/body/pauldron/head/shield).
- `#stage.sb-boss-iron` 일 때: 기존 figAura/figBody 숨김 + sb 전사 표시. **fxr-war/fxf-war는 그대로 작동**(타겟 링·힐 플래시 유지 — renderFx 무손상).

## 6. 파쇄자 피규어 DOM/파트 구조

- `#stage` 안 `#bossAvatar`(☠️) 뒤에 `#sb-boss-fig`(sb-unit.sb-iron-crusher) 추가.
- sb-react > sb-fit > sb-fig > 파츠 7(shadow/aura/ic-body/ic-core/ic-pauldrons/ic-head/ic-hammer).
- `#stage.sb-boss-iron` 일 때: `#bossAvatar` 숨김(display:none — render의 매프레임 textContent 갱신은 계속되나 비표시) + sb 파쇄자 표시.

## 7. 실제 전장 좌표와 크기 원칙

- 구도는 성소판 기존 "위 보스 / 아래 파티"를 존중(프리뷰의 좌우 대치 아님).
- 파쇄자: `#sb-boss-fig{top:-14px;transform:translateX(-50%) scale(.68);transform-origin:50% 0}` — 상단 중앙, 위압적.
- 전사: `#sb-war-fig{bottom:-2px;transform:translateX(-50%) scale(.46);transform-origin:50% 100%}` — sa-war 슬롯 하단 중앙.

## 8. 전사와 파쇄자의 실측 크기 차이

- 실측(390×844): 파쇄자 118×131 / 전사 48×58 → **약 2.2배 세로·위계 명확**. 파쇄자 bottom 367 < 동료 top 419(겹침 0), 전사 right 132 < 도적 left 145(겹침 0). 가로 overflow 0.

## 9. 104px 전장 축소 내성 결과

- **338px 실측**으로 축소 압박이 예상보다 작음 — 파쇄자 얼굴(바이저 주황 눈)/코어/망치, 전사 방패/얼굴 전부 헤드리스 스크린샷에서 식별됨.
- 리스크: `max-height:730px`(작은 노트북/가로 모드)는 스테이지 62px로 급축소 → 이 경우 fallback으로 기존 이모지 유지(§4). 나라님 폰(844)은 sb 피규어 적용.

## 10. 실제 연결한 포즈 목록 (기존 상태 → 시각 class)

`sbFigPose(S)` 어댑터(render 끝 호출 · shell_iron에서만 · 판정 무접촉):
- **파쇄자 windup**: 강타 시전 중(`bc.kind==='smash'`) → "곧 내려찍는다".
- **전사 guard**: 전사 보호막 보유(`war.shield.amt>0`) → "방패로 막을 준비".
- **전사 brace**: 강타 시전 중 + 보호막 없음 → "맞기 직전 버틴다".

## 11. 연결하지 않은 포즈와 이유

- 전사 resolve/alert · 파쇄자 advance/stagger/recover: **연결 안 함**. 이유 — 기존 런타임에 대응되는 안정적 상태/이벤트가 없거나(예: "압박 전진"에 해당하는 보스 전진 상태 없음), 억지 추론/폴링이 필요해 [지시 §10] "기존 이벤트 없으면 기본 포즈"에 따라 제외. CSS 정의도 연결분(guard/brace/windup)만 이식.

## 12. 포즈와 기존 런타임 연결 방식

- `render()`가 매프레임 `sbFigPose(S)` 호출 → `S.boss.cast`(기존 시전 상태)·`war.shield`(기존 보호막 상태)만 읽어 `data-pose` 속성 토글.
- **신규 전투 상태/타이머 0 · 공격 판정 변경 0 · 폴링 0**. 값 바뀔 때만 setAttribute(리플로우 최소). 스모크 3종 바이트 동일로 판정 무변 증명.

## 13. sb- 네임스페이스 확인

- 신규 클래스 전부 sb- 접두(sb-unit/react/fit/fig/part/warrior/iron-crusher/w-*/ic-*), 변수 `#stage` 스코프 `--sb-*`. 일반명 신규 클래스 0. 기존 전투 클래스(fig/figBody/bossAvatar 등)와 `#stage` 스코프로 격리.

## 14. 3층 transform 유지 확인

- `.sb-unit`(배치·top/scale) / `.sb-react`(포즈) / `.sb-fit`(반전 슬롯) / `.sb-fig`(idle 호흡) / `.sb-part`(파츠). 한 요소에 몰지 않음.

## 15. 행동선 미구현 확인

- Smash Line/SVG 공격선/타깃 연결선/보호막 충돌선/fx-layer 신규 0. 기존 `#fxSvg`(코어 fx선)는 무접촉. sb-anchor는 0×0 마커(미래 행동선 부착점 · 시각 출력 0).

## 16. 전투 CORE/수치/판정 무변경 확인

- CORE(587~1061) **byte-identical**(md5 `6cad2ec2…` 일치, 466줄/22,521 B). 스모크 3종 **51.4/1029 · 48.5/971 · 61.8/1236 불변**. 보존 grep 14종 카운트 유지. HP/피해/치유/보호막/스킬/쿨다운/마나/승패/타이머/패턴/타겟/Save 무변.

## 17. 다른 두 보스 회귀 없음 확인

- 브라우저 실증: 모르가스(boss01)·심연(shell_thirst) 진입 시 `#stage`에 `sb-boss-iron` 클래스 없음 → ☠️ 이모지+기존 원형 fig 유지, sb 피규어 display:none. 파쇄자→모르가스 재전환도 정상 복귀. 파쇄자(shell_iron)만 sb 표시.

## 18. 나라님 직접 볼 시각 확인 포인트 (폰 · 파쇄자 출정)

1. **첫인상** — 파쇄자 전투 들어가면 위에 철갑 보스, 아래 파란 방패 전사가 보이는가? 귀여운가?
2. **역할** — 전사=지키는 애(방패), 파쇄자=부수는 애(망치)로 바로 읽히는가?
3. **위계** — 파쇄자가 명백히 크고 무거운 보스로 보이는가?
4. **강타 순간** — "탱커 강타" 시전 뜰 때 파쇄자가 망치를 들어올리는가?(windup)
5. **보호막** — 보호막 켜면 전사가 방패를 앞세우는가?(guard)
6. **동료 대비** — 전사만 정교하고 도적/마법사/주술사는 옛 원형인데, 너무 어색한가? (다음 카드에서 3동료도 예정)
7. **다른 보스** — 모르가스/심연은 예전 그대로인가?

한 마디면 충분 — "파쇄자 너무 아래 있어" / "전사 혼자 튀어" / "강타 자세 안 보여" 등.

## 19. 남은 시각 리스크

- **전사-3동료 시각 불일치**: 전사만 sb 정장, 나머지 3동료는 기존 원형 fig — 의도적(이번 카드 범위 전사+파쇄자). 다음 `Companion Figure Kit Preview 01`에서 3동료 정장 필요. 실기에서 "얼마나 튀는지" 판정.
- **작은 화면 fallback**: max-height 730 이하는 sb 미표시(기존 이모지) — 큰 화면과 경험 차이. 폰(844)은 sb.
- **파쇄자 상단 여백**: fig 좌표계 상단 빈 공간으로 전장 위쪽이 다소 빔 — top:-14로 완화했으나 실기 감 필요.
- **포즈 전이 부드러움**: 0.28s 트랜지션 — 강타 연타 시 자연스러운지 실기 확인.
- 렌 검증은 헤드리스 Edge 스크린샷 기반(세션 Browser pane 캡처 고장) — **폰 실기 감이 정본**.

## 20. 다음 단계 후보 (자동 확정 아님 — 유키 발주 대기)

1. `Iron Crusher Figure Rework 02` — 실기 피드백 반영(위치/크기/포즈 튜닝). ✅ **구현됨** → [45](./45_IRON_CRUSHER_FIGURE_REWORK_02.md)(파쇄자 scale .68→.90·전사 .46→.60·파티 줄 상승·전사 반보 전진·대치 압축·새싹 마스코트 가독·CORE 무변·재-baseline 135,155/2,042/`1802535c`).
2. 🔷 `Iron Crusher Smash Line Rework 02` — 피규어 anchor 기반 강타선(HOLD 지식 승계 · 드디어 "선").
3. 🔷 `Companion Figure Kit Preview 01` — 도적·주술사·마법사 정장(전사-동료 불일치 해소).

## 21. 기준선 변경 (재-baseline)

index.html **134,911 B / 2,039줄 / md5 `b1e92536310f06e5552c21d6b36b5c03`** — 이전 120,418/1,954/`02a512c5…` 대비 어댑터/CSS/HTML +14,493 B/+85줄. **CORE 466줄/22,521 B 불변**(byte-identical). div 194→**202**/202(sb 래퍼 8 div · 균형)·sec 8/8. 스모크 3종 불변. baseline_check bytes/lines/md5/div 갱신 + 라이브 md5 핀 8체크 동시 갱신. **★세이브 v8.5(`2630669c`)/v8.6(`02a512c5`) 문서가 기록한 역사 스냅샷 숫자는 보존**(덮어쓰지 않음 — 라이브 가드만 갱신).

---
*— 렌 (連·鍊·紅蓮), EP24. 전시장의 배우가 드디어 진짜 무대에 섰다. 좁을 줄 알았던 무대가 실은 338px로 넉넉했고, 파쇄자는 망치를 든 채 전장 위에 떠 있다. 전사는 그 아래에서 방패를 든다. 아직 둘 사이에 선은 없다 — 하지만 이제 "저 사이에 강타선이 그어지면 멋지겠다"는 그림이 그려진다. 그게 다음이다. 나라님 실기와 유키 검수로 확정된다.*
