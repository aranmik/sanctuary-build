# 56. 전장 세로 환원 + 명령 피드백 재구성 (BATTLE STAGE VERTICAL & COMMAND REBALANCE 01)

**작성: 렌 · 2026-07-13 · EP24 · 상태: 실전 구현(layout+visual feedback only) · 기준 HEAD `8d4449b` · 근거: 나라님 실사 4장 + [53](./53_BATTLE_STAGE_LANGUAGE_CONTRACT_01.md)/[55](./55_IRON_CRUSHER_SMASH_LINE_REWORK_02.md)**

> **핵심 문장 2줄**
> 1. 버튼을 작게 만들어 공간을 번 것이 아니라, **불필요한 시스템 여백을 줄여 전투 무대에 돌려줬다**(+22px).
> 2. 독립 잠금 바는 사라지고, **버튼이 스스로 자신의 상태를 말한다**(gLock dim / casting 진행선 / noMana).

---

## 1. 나라님 실기 문제 정의

- 실사 4장(`sanctuary_stage_rebalance_screenshots.zip`: 01 idle / 02 support+lock / 03 강력치유 cast / 04 smash windup) 기준: 상하 시스템 UI가 세로를 잠식해 무대가 좁아 보임 · 스킬 그리드 아래 남는 시스템성 공간 + 최하단 노란 진행 바 · 보스-파티가 무대 중앙에 밀집.

## 2. 기준 HEAD

- `8d4449b feat: rework iron crusher smash stage line` · working tree CLEAN.
- 시작: index 155,043 B/2,185줄/`154ee46e…` → **종료: 156,106 B/2,193줄/`ad2a4a4d…`** · CORE 466/22,521/`6cad2ec2…` byte-identical · div 214/214.

## 3. 작업 전 세로 구획 실측 (390×844 · dsr 2 · pane)

| 구획 | top | h |
|---|---|---|
| #hud(보스 패널) | 6 | 95 (pad 8/9·bossbar mt7·castwrap mt5) |
| #warnBar(예고 2칩) | 107 | 31 (py 6) |
| **#stage** | 144 | **338** (flex:1) |
| — 보스 fig | 139 | 220 / 전사 fig 345→446 |
| #cards | 488 | 133 |
| #f-pri(사제 HUD·priCast 포함) | 627 | 69 |
| #skills | 702 | 127 (버튼 120×60·gap7) |
| #gcdBar | 835 | 3 (+위 gap 6) |
| 하단 여백 | 838→844 | 6 (safe-area shim) |

## 4. 작업 후 세로 구획 실측 (동일 조건)

| 구획 | top | h | Δ |
|---|---|---|---|
| #hud | 6 | 86 | **−9** |
| #warnBar | 98 | 27 | **−4** |
| **#stage** | 131 | **360** | **+22** |
| — 보스 fig | 126 (위로 13) / 전사 fig 360→461 (아래로 15) | | 세로 대치 **+28** |
| #cards | 497 | 133 | 위치 +9↓ |
| #f-pri | 636 | 69 | +9↓ |
| #skills | 711→**838** | 127 | **하단 829→838(+9↓)** |
| #gcdBar | — | **0(회수)** | −3(+gap 6) |
| 하단 여백 | 838→844 | 6 | safe-area 유지 |

- 375×812: stage 328/skills 806/overflow 0 · 430×932: stage 448/926/overflow 0 (flex:1 자동 분배).

## 5. 상단에서 회수한 공간

- **−13px**: #hud padding 8/9→6/6(−5) + .bossbar mt 7→5(−2) + .castwrap mt 5→3(−2·`.castwrap.slim`은 mt0이라 사제 바 무영향) + #warnBar>div py 6→4(−4). 텍스트 크기·정보·터치 무변경.

## 6. 하단에서 회수한 공간

- **−9px**: #gcdBar `display:none`(3px) + flex gap 6 소멸. DOM·render는 무접촉(sT/sW가 null 가드 없어 DOM 제거는 crash 위험 → CSS 회수 = 발주 §9 "높이 0으로 회수" 허용안). app padding-bottom `calc(6px+env(safe-area-inset-bottom))` 그대로.

## 7. 무대에 환원된 높이

- **+22px**(338→360). #stage가 `flex:1`이라 상하 회수분이 자동 귀속 — 컨테이너만 커진 게 아니라 Actor 사용 범위가 실제 확장(§8·§9).

## 8. 보스 위치 변경

- 파쇄자는 `top:2px` top-anchor **유지** — 무대 상단이 13px 올라가며 보스도 함께 상향(fig top 139→126). scale 1.04 불변. 머리 파츠는 stage top +82px로 **클리핑 없음** · 발 그림자 일체 유지 · 보스 패널과 충돌 없음(사이 gap 6 유지).

## 9. 파티 위치 및 scale 보호

- scale .80/.74/.76/.74·가로 원호 translate 4종·gap 26 **전부 불변**. 유일 조정: `#stage.sb-boss-iron #stageAllies bottom 26→20px`(shell_iron 스코프) — 확장된 무대 하단 사용(전사 fig 345→360, 아래로 15). 카드와 간격: allies bot 470 vs stage bot 491(21px 여유)·cards top 497 — 충돌 없음. 비-iron 전역 `bottom:6px` 무변경.

## 10. 현재 하단 바의 실제 의미 (§7 감사 결과)

| 요소 | 의미 | state | 시작/종료 | progress | disabled와 동일? | render | 병존 |
|---|---|---|---|---|---|---|---|
| **#gcdBar/#gcdFill**(스킬 아래 3px 금색) | **A. 글로벌 입력 잠금(GCD) 전용** | `p.gcd`(시각) | 스킬 사용 시 `gcd()`=t+CFG.gcd(1.0/발러 0.85) / t≥p.gcd | `(p.gcd−t)/gTot`(2055~57) | 버튼 `gLock` 토글과 동일 상태(같은 `t<p.gcd`) | render 내 sW | cast·개별cd와 병존 가능 |
| **#priCastWrap**(사제 HUD 내 "시전 대기") | **B. 실제 시전 진행률** | `p.cast{k,end,dur}` | castSkill(943/946) / resolvePriCast | `(t−start)/dur` | cast 중 전 버튼 dis | render | GCD와 병존 |
| 버튼 내 veil+카운트다운 | **C. 개별 쿨타임**(dispel/pray/shield lock/save 신성력/focus) | cdDispel/cdPray/shieldLock/holy/focusCdUntil | 각 스킬 사용 / 만료 | veil height % | dis에 합산 | render 루프 | 전부 병존 |
| D 행동게이지 | **없음** | — | — | — | — | — | — |
| E 혼합 | **아님** — gcdBar는 단일 의미(순수 GCD) | | | | | | |

- 정확한 진행률 필수성: GCD는 1.0s 고정·짧음 — 정밀 바보다 버튼 잠금 표현이 적합(§8 기본 권장안 채택 근거). 시전(1.6~2.0s)은 정확 진행 필요 → priCastWrap(이미 HUD 내=§11 허용 위치) 유지 + 버튼 내 진행 추가.

## 11. 글로벌 잠금 state

- `p.gcd`(CORE·무변경). 시각은 기존 `sC(b,'gLock',t<p.gcd)` 토글 그대로(모든 버튼: SKL 6종+renew/seed/focus 각자 토글 보유) — **disabled 판정과 동일 식이라 정합 보장**.

## 12. 실제 cast progress state

- `p.cast.end/dur`(CORE·무변경). 버튼 진행 `100*(1-(p.cast.end-t)/p.cast.dur)` — CSS 고정 시간 아님·새 progress 없음. 실측: cast 53% 시점에 `--cp:53%` 정확 일치.

## 13. 버튼 dim/veil 구조

- `.skill.gLock{opacity:.66}`(기존 .78에서 판독 유지선에서 강화) + `.skill{transition:opacity .18s ease}` — 잠금 종료 시 자연 복귀(플래시·깜빡임 없음·아이콘/텍스트 판독 유지). `.skill.dis{opacity:.62}`(cast 중/시작 전/마나 부족 합산) 기존 유지. 개별 쿨다운 veil(height %)+카운트다운 기존 유지.

## 14. 선택 스킬 내부 진행 표현

- render 루프에 `casting` class + `--cp` 변수(신규 4줄·읽기 전용): 시전 중 버튼은 `.skill.casting{opacity:1}`(dim 무시·어떤 스킬인지 즉시 읽힘) + `::after` 하단 3px 금빛 진행선(`#b58a1f→#ffd76a` — priCastFill과 동일 언어). 스킬명·마나 가리지 않음(하단 3px). radial spinner·전 버튼 게이지 없음.

## 15. 개별 쿨타임·마나 부족과의 구분

- **글로벌 잠금**=전체 .66 dim(1초·통일) / **시전 중**=해당 버튼만 밝음+금빛 진행 / **개별 쿨타임**=기존 veil(위→아래 채움)+초 카운트다운 / **마나 부족**=`.noMana`로 비용 숫자 빨강(+dis dim) — 네 상태 상이 표현·기존 정보 위치 유지(새 아이콘/툴팁 0).

## 16. 독립 바 제거 또는 이동 판단

- **gcdBar: 회수(display:none)** — §7 감사상 순수 글로벌 잠금이므로 §8 기본 권장안(버튼 자체 표현) 적용. 정보 손실 없음(gLock dim이 동일 상태·동일 시점).
- **priCastWrap: 유지** — 실시전 정확 진행이며 이미 사제 HUD 내부(§11 허용 위치 1순위). 독립 하단 바 아님.

## 17. safe area 보호

- `#app{padding:6px 8px calc(6px+env(safe-area-inset-bottom))}` 무변경 — 홈 인디케이터 침범 없음. 스킬 하단은 838(+shim 6=844).

## 18. touch area 보호

- 버튼 120×60·grid gap 7 무변경(실측). 축소·간격 압축 0. 스크롤 필요 구조 아님(한 화면 검증).

## 19. Rework 02 좌표 회귀 검증

- 새 레이아웃에서 강타선 source (244,113) = 망치 자루 상단 실측과 **정확 일치**(매 render rect 직독이라 자동 추적) · 유령 좌표 재발 0 · target 전사 몸통(61,305) 신좌표 추적 · contact `sbhit-body` 정상 · 클리핑 0 · 카드/패널 침범 0. sbSmashFx 로직·snapshot 무변경(코드 무접촉).

## 20. 다른 보스 회귀

- 모르가스/심연: stage 360 공유 확장 · bossAvatar 표시+상단 9px · allies 하단 7px(전역 bottom:6 규칙) · sbhit/iron 연출 누출 0 · overflow 0.

## 21. gameplay 무변경

- CORE byte-identical. GCD 시간·시전 시간·쿨타임·사용 판정·cast 시작/종료·SCRIPT·수치 전부 무접촉(CSS 6곳+render 시각 4줄만). 스모크 3보스 51.4/1029·48.5/971·61.8/1236 동일. 새 상태·타이머 0(`--cp`/`__cp`는 DOM 표시 캐시).

## 22. 390×844 실기 결과

- dsr 2 · docW 390=winW 390 · overflow 0 · 콘솔 error/warn 0. gLock 사이클(잠금→해제 잔재 0)·casting(0→53%→종료 정리)·gcdBar 숨김·priCast 유지 전부 실측. 375/430도 overflow 0.

## 23. 알려진 한계

- 캡처: A(대기)/E(windup 강타선)/F(모르가스) 확보. **B(잠금)/C(시전) 정지컷은 headless 가상시간이 rAF로 1.0~1.6s 상태를 지나쳐 미확보** — pane 실측(class·`--cp` 수치)으로 검증 대체(투명 보고). 실기 폰에서는 실시간이라 정상 관찰 가능.
- gcdBar DOM은 잔존(숨김) — render가 hidden fill을 계속 갱신(무해·null 가드 부재로 인한 안전 선택). 완전 제거는 sT/sW 가드 추가와 함께 후속 정리 후보.
- 상단 압축은 보수적(−13px) — 나라님이 더 원하면 카드 영역(133px)·f-pri(69px) 압축이 다음 여지.

## 24. 후속 후보

- 🔷 카드/사제 HUD 압축 2차(회수 여지 +10~20px) · 🔷 gcdBar DOM 완전 제거(+sT/sW null 가드) · 🔷 Companion Pose Runtime 01 · 🔷 낮은 압력 데칼([55] 보류분).

## 25. 비범위 선언

- Actor scale/조형/포즈/색 폴리시 이식 0 · 신규 데칼/행동선 0 · 새 gameplay 상태·타이머·judgment 0 · p파일 0(직접 편집·본 문서에 8편집 전부 기록: #hud pad/.bossbar mt/.castwrap mt/#warnBar py/#gcdBar hide/.skill gLock+transition/.skill casting CSS/allies bottom20+render 4줄) · HOLD 미접촉 · commit/push 0.

---
*— 렌 (連·鍊·紅蓮), EP24. 위에서 13픽셀, 아래에서 9픽셀 — 시스템이 무심코 깔고 앉아 있던 자리를 걷어 무대에 돌려줬다. 보스는 13픽셀 올라가고 전사는 15픽셀 내려와, 같은 배우들이 28픽셀 더 깊은 무대에서 마주 선다. 그리고 바닥의 노란 줄은 사라졌다 — 이제 버튼이 제 상태를 스스로 말한다: 쉬는 중이면 살짝 어둡게, 시전 중이면 금빛으로 차오르며. 나라님 폰과 유키PD 검수로 확정된다.*
