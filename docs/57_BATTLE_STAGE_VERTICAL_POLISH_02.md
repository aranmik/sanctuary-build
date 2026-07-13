# 57. 전장 세로 폴리시 02 (BATTLE STAGE VERTICAL POLISH 02)

**작성: 렌 · 2026-07-13 · EP24 · 상태: 소형 CSS/visual polish 구현 · 기준 HEAD `b52c716` · 근거: 나라님 폰 실기 피드백 2건(`sanctuary_latest_phone_screenshots.zip`) + [56](./56_BATTLE_STAGE_VERTICAL_COMMAND_REBALANCE_01.md) FINAL PASS 후속**

> **핵심 문장 2줄**
> 1. `정확한 시전 진행은 사제 HUD 한 곳에서만 말한다.`
> 2. `스킬 버튼은 글로벌 잠금 동안 잠시 사용할 수 없음을 전체 dim으로만 말한다.`

---

## 1. 발주 요약 (나라님 최신 실기 2건)

- **A. 보스 추가 상향**: 현재도 좋지만 무대 상단 공간을 조금 더 적극적으로 사용 — 보스·파티가 전투 공간을 더 꽉 채우도록 파쇄자를 몇 px 위로.
- **B. 버튼 cast progress 제거**: 사제 HUD cast bar와 스킬 버튼 금빛 진행선이 동일 정보를 중복으로 말함 → 버튼 쪽 제거. GCD는 전체 버튼 dim/복귀만.
- **C. 유지**: `.gLock` 전체 dim · priCastWrap · 개별 cooldown veil/카운트 · noMana · disabled 판정.

이 카드는 Rebalance 01의 실패 수정이 아니라 **FINAL PASS 후 발견된 소형 폴리시**다. gameplay/CORE/수치/판정/전투 시간 무변경.

## 2. 기준 HEAD / 기준선

- `b52c716 feat: rebalance battle stage and command feedback` · branch main = origin/main(0/0) · working tree CLEAN.
- 시작: index 156,106 B/2,193줄/`ad2a4a4d…` → **종료: 155,854 B/2,188줄/`2f7a1b29…`** · CORE 466/22,521/`6cad2ec2…` byte-identical · div 214/214.

## 3. 편집 3곳 (index.html · 전부 직접 편집 · p파일 0 · DOM 변경 0)

1. **CSS `#sb-boss-fig`**: `top:2px` → **`top:-8px`** (10px 추가 상향 · scale 1.04/transform-origin/z-index 무변). `#sb-boss-fig`는 `#stage.sb-boss-iron`에서만 `display:block`이므로 **shell_iron 전용 스코프** — 공통 boss 위치 아님(모르가스/심연은 `#bossAvatar` 이모지 경로).
2. **CSS 제거**: `.skill.casting{opacity:1}` + `.skill.casting::after{…width:var(--cp,0%)…}` (Rebalance 01의 버튼 하단 3px 금빛 진행선 + global dim 예외) → 계약 주석 1줄로 대체.
3. **JS 제거(render 내)**: `const isCasting=…; sC(b,'casting',isCasting); if(isCasting){…--cp…}` 4줄 → 계약 주석 1줄로 대체.

## 4. 제거 안전성 감사 (발주 §10 "무조건 삭제 금지 → 사용처 감사")

- skill 버튼 `.casting`/`--cp` 사용처 전수: **CSS 171~172(제거분) + render JS 2082~2084(제거분)뿐**. 다른 JS/체크/문서 코드 경로 없음.
- **별개 시스템 보존 확인**: `#bossAvatar.casting`(CSS 50행) + `sC(ba,'casting',!!bc)`(보스 아바타 글로우) · fx 코드의 지역변수 `casting`(smash 분기 `if(casting){`) — **둘 다 무접촉**.
- **gameplay 무관 증명**: 제거된 JS는 DOM class/CSS 변수 쓰기 전용(읽기: p.cast/t · 쓰기: b.classList/b.style/`b.__cp` DOM 캐시). p./S. 대입 0 · timer 0. 스모크 3종 동일(51.4/1029 · 48.5/971 · 61.8/1236)로 실행 증명.
- 새 상태/새 timer/새 독립 바 추가 0. `#gcdBar` 재노출 없음(display:none 유지).

## 5. 보스 위치 실측 (390×844 · dsf 2 · pane 실브라우저)

측정 기준: 시각 최상단 = 머리 crown ::before(top:-7) / windup 최상단 = 망치 머리 ::before(left:-24,top:-12,58×40) — pseudo와 동일 geometry의 실제 child probe를 임시 삽입해 rect 실측.

| 항목 | 변경 전 | 변경 후 | Δ |
|---|---|---|---|
| 보스 crown viewport top (대기) | 205.6 | **193.9** | −11.7 |
| stage top 대비 crown 여유 | 74.6 | **64.3** | **−10.3 (실이동 10px+서브픽셀)** |
| windup 망치 머리 viewport top | 192.4 | **180.8** | −11.6 |
| **windup 시 상단 최소 여유(=클리핑 한계)** | 61.4 | **51.1** | −10.3 |

- ★ stage top 실측이 세션 간 131→129.7로 1.3px 흔들림(폰트 로드/서브픽셀) → **이동량 판정은 stage-relative(10.3px)가 정본**.
- 호흡 애니 `sbBreatheHeavy`(translateY −0.9 + scaleY 1.005·origin 하단) 최대 ~2px 상승 감안해도 windup 최소 여유 **≈49px** — 클리핑 0 · 상단 border 압박 없음.
- 그림자: fig 내부 bottom:0 파츠라 몸과 함께 이동 — 분리 0 (shadow top 305.6 / body bottom 316.2 겹침 유지).
- 보스 정보 HUD/warnBar는 stage 밖 상단 구획 — 시각 충돌 0 (stage `overflow:hidden` 내부에서만 이동).
- 파티: `#stage.sb-boss-iron #stageAllies{bottom:20px;gap:26px}` + 원호 translate 4종 + scale .80/.74/.76/.74 **전부 무변** — allies bottom 실측 20px 유지. 보스만 10px 위로 = **세로 대치 폭 +10px 추가**.
- 무대 높이: 상하 시스템 구획 무접촉 → stage 360(flex:1) 불변 · 375×812(329)/430×932(449)도 flex 분배 그대로 · 3뷰포트 crown 여유 64.3 동일(top-anchor).

## 6. 실엔진 검증 (pane G.step · 스크립트 아님)

- **B. windup**: t=6.05 강타 시전 → `data-pose="windup"`(보스)+`brace`(전사) · windup 망치 머리 stage 여유 **51.1px**(강제 스타일 측정과 일치) · 클리핑 0.
- **관계선(Rework 02)**: `line.fxSmash on` x1=222.2 = 실측 망치 rect 중심 222 ✓ (좌상단 0,0 유령 좌표 재발 0) · 종점 y=306.5 = 전사 방패 rect y 307 ✓ · 매 render `sbPt('sb-boss-fig','sb-ic-hammer',1)` rect 직독이라 새 좌표 자동 추적. snapshot/resolve/blk·absorb 분기 무접촉.
- **C. GCD 실제 차단 (실 버튼 `.click()` 탭 · console state 조작 0 · 엔진 tick만)**: HTML `disabled` 속성은 **미사용** — 전 스킬 버튼 `hasAttribute('disabled')`/`.disabled` = false, `.gLock`/`.dis`는 순수 CSS 시각 dim class. 따라서 **DOM disabled 속성과는 별개 계층이며, gameplay 사용 경로가 동일한 `p.gcd`(=`S.t<p.gcd`) predicate로 마나·cast·cooldown·효과 발생 전에 차단된다**. 차단 위치(코드 정독):
  - `useSkill(k)` **line 944** `if(S.t<p.gcd)return false;` — heal/big/shield/dispel/pray/save 공통. `payMana`(957)·`p.cast=` 생성(962)·`p.cdDispel/cdPray`(972)·효과 전부 이 뒤 → GCD 중이면 부작용 0. (클릭 경로: 리스너 → `focusWrapUse(k)` → `G.useSkill(k)`.)
  - `renewUse`(1686)·`seedUse`(1646)·`focusUse`(1617) 각 `if(!S.started||S.over||!p.alive||p.cast||t<p.gcd)return;` — 마나 차감·씨앗·armed 설정 전 거부.
  - **실클릭 결과**: 단일 치유 탭(마나 520→480 · p.gcd=t+1) 직후 GCD 중 보호막/씨앗 탭 → **cast 생성 0 · 마나 추가 차감 0 · 보호막/씨앗 생성 0 · 효과 0**, 버튼 gLock dim(클릭 이벤트는 받되 함수 predicate가 거부). GCD 종료 후 재탭 → 정상(보호막 마나 −55/흡수 320 생성, 씨앗 마나 −60/생성) · dim 자연 해제 · stale gLock 0.
  - 시각: 6버튼 전원 gLock=true · casting class 0 · `::after` content none · 시전 버튼 단독 밝음 없음 → 소진 후 전원 해제(`.skill{transition:opacity .18s}`). renew/seed(성당 로드아웃 슬롯·별도 핸들러 `renewBtnUpdate`/`seedBtnUpdate`)도 GCD 중 gLock true/종료 false(★시각 갱신은 rAF 경로라 frozen-tab에선 지연될 수 있으나 **gameplay 차단은 위 함수 predicate로 독립 작동**).
- **D. 강력 치유 cast 중**: 버튼 진행선/casting 0 · 전 버튼 dis+gLock 공통 dim · priCastWrap "강력 치유 1.6초 (탭: 취소)" + fill 3.1% 실진행 · 탭 취소 리스너 유지.
- **E. 개별/자원**: shield lock veil 81.7%+카운트 "4.9"(GCD 소진 후에도 잔존=개별 표현 구분) · 마나 부족 시 noMana 전 버튼 정상 · save 신성력/holy 경로 무접촉. (★정화는 정화 대상 부재 시 CORE가 사용 거부 — gameplay 판정·이번 카드 무관.)
- **F. 타 보스**: boss01/shell_thirst — `sb-boss-iron` 없음 · iron 피규어 display none · `line.fxSmash` 엘리먼트 자체 없음 · 이모지 아바타+전역 allies bottom:6 · 재전환 시 iron 복귀 정상. **레이아웃/iron FX 누출 0**.
- **콘솔 0** (error/warning) · overflow 0 (scrollW=390/375/430 = 뷰포트).

## 7. 캡처 (scratchpad · commit 비대상)

- headless Edge(x86 · --headless --screenshot --window-size=390,880 --force-device-scale-factor=2 · ★meta viewport 무시 → `html,body{width:390px;margin:0}` wrapper 주입 · rAF freeze+G.step 상태 고정 래퍼) 7컷: **A 대기 / B windup+관계선 / C GCD 전체 dim / D 강력치유 cast(버튼 진행선 無+priCast 정상) / E 개별 lock+마나 부족 / F 모르가스 / F 심연**. pane 스크린샷은 세션 내내 timeout(기지 이슈) → 수치 검증은 pane, 컷은 headless.

## 8. 구계약 승계 (발주 §14 "직접 충돌하는 정확값 계약 승계" · 상수/단언-only)

1. `battle_stage_vertical_command_rebalance_01_check` **c6**: `top:2px` 정확값 → **`top:-8px`** 승계(top-anchor·scale 불변 취지 유지).
2. 동 **c12**: "버튼 casting 진행 존재" → **"버튼 cast progress 제거 + 정확 진행은 priCastWrap p.cast만"**으로 계약 대체.
3. 동 **c13/c14**: 검사 앵커였던 `/* Rebalance 01` 주석이 casting 코드와 함께 제거됨 → gLock 앵커 구간 동일 단언(타이머 0·state 대입 0) 유지.
4. 동 **c15**: `.skill.casting{opacity:1}` 존재 단언 → **부재 단언**(gLock/noMana 구분은 그대로).
5. `iron_crusher_figure_rework_02/03_check` **c4**: `top:2px` 문자열 → `top:-8px` 상수 승계(주석 근거).
6. **라이브 핀 재-baseline**: baseline_check(bytes/lines/md5) + live md5 핀 21체크 + 라벨 6건(`155,854 B · md5 2f7a1b29…`). 역사 스냅샷(docs/56·99·102의 156,106/ad2a4a4d 기록)은 **보존**.

과거 assertion 삭제/완화/범위 축소 0 · 무관 체크 변경 0.

## 9. 비범위 선언

- 파티 위치/scale/가로 원호 · 무대 높이 · 버튼 크기(120×60)/gap 7/배치 · 독립 프리뷰 승인 동료 포즈·색 폴리시 runtime 이식 · gcdBar DOM 제거 · CORE/스킬 수치/판정/boss SCRIPT/타이밍 — 전부 이번 카드 밖.

## 10. 검증 요약

- 신규 `dev/battle_stage_vertical_polish_02_check.js` **29/29 PASS**.
- 기존 28종 전체 PASS(승계 반영 후 0 FAIL) · baseline 36/36 · 스모크 3종 동일 · JS 구문 OK(harness 로드).
- 알려진 시각 한계: (1) hidden pane에서 opacity transition 중간값이 동결돼 computed 수치로는 .62/.66 구분 실측 불가 — class/CSS 규칙 검증으로 대체, 실기기에서 자연 표시. (2) 보호막 개별 lock veil의 카운트 숫자가 버튼명과 겹치는 표시는 기존 설계(이번 카드 무접촉).
