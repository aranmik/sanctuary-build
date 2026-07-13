# 55. 파쇄자 강타선 재배선 (IRON CRUSHER SMASH LINE REWORK 02)

**작성: 렌 · 2026-07-12 · EP24 · 상태: 실전 구현(첫 무대 언어) · 기준 HEAD `a59d85e` · 패치 p24 · 근거 계약: [53](./53_BATTLE_STAGE_LANGUAGE_CONTRACT_01.md)·[54](./54_IRON_CRUSHER_STAGE_INPUT_AUDIT_01.md)**

> **핵심 문장 3줄**
> 1. 선은 이제 **유령(숨겨진 아바타의 rect 0)이 아니라 망치에서** 출발하고, **몸통이 아니라 실제 방어 전면에서** 끝난다.
> 2. cast 중 관계선과 resolve 결과는 **다른 판정** — 물리 방패 막기(blk)/사제 보호막 흡수(abs delta)/몸통 직격을 합치지 않는다.
> 3. gameplay는 단 한 줄도 바뀌지 않았다 — CORE byte-identical·스모크 3보스 동일.

---

## 1. 구현 목적

- [54] 감사가 특정한 결함 — shell_iron에서 `fxBossLine`이 숨겨진 `#bossAvatar`의 rect(전부 0)를 읽어 **화면 좌상단 모서리에서 출발하는 유령 좌표선**([53 §29] 실패 사례) — 을 제거하고, 파쇄자 전장의 첫 실전 무대 언어(망치→실대상 관계선 + 세 방어 신호 접촉 분리)를 구현한다.

## 2. 기준 HEAD

- `a59d85e docs: add iron crusher stage input audit` · working tree clean에서 시작.
- 시작: index 149,440 B/2,098줄/`bb7fc147…` → **종료: 155,043 B/2,185줄/`154ee46e…`** · CORE 466/22,521/`6cad2ec2…` **byte-identical**.

## 3. 실제 변경 파일

- `index.html`(p24: CSS 1블록+JS 1블록+renderFx 1줄 재배선 · **DOM 요소 추가 0** · div 214/214·sec 8/8 불변) · `dev/p24.mjs`(재현 패치 — HEAD 원본 재적용 md5 IDENTICAL 증명) · `docs/55`(본 문서) · `dev/iron_crusher_smash_line_rework_02_check.js`(신규 체크) · docs/98·99·102 포인터.
- ★재-baseline 의식: `dev/baseline_check.js`(155,043/2,185/154ee46e) + 라이브 md5 핀 19파일(bb7fc147→154ee46e·149440→155043) — 값 갱신만, 단언 약화 없음.
- ★구계약 정정 2건(§20 보고).

## 4. 유령 좌표 원인 (제거된 결함)

- `fxAnchors()`(구 1848)가 `A.boss=c('bossAvatar')`로 이모지 아바타 중심을 캐시하는데, shell_iron에선 `#stage.sb-boss-iron #bossAvatar{display:none}` → rect 전부 0 → stage 상대 **음수 좌표** → 선이 좌상단 밖에서 출발(overflow:hidden에 잘려 들어옴 — 나라님 스크린샷의 그 빨간 선).
- **수정 방식**: shell_iron에서는 `fxAnchors`/캐시 `A`를 아예 사용하지 않고 **매 render마다 파츠 rect를 직접 읽는다**(sbSmashFx) — 캐시 스테일 문제 자체를 회피. 비-iron 보스는 기존 경로 그대로.

## 5. shell_iron 보스 게이트

- `sbSmashFx` 첫 판정: `iron=(typeof CUR_BOSS!=='undefined'&&CUR_BOSS==='shell_iron')` — **kind==='smash' 단독 게이트 아님**(모르가스 SCRIPT에도 smash kind 존재[54 §4]).
- 비-iron이면 시각 기억(SB_SM)·접촉 class(SB_DIRTY→sbHitClear) 정리 후 `false` 반환 → renderFx가 기존 `fxLn('fxBossLine',A.boss,…,'fxBoss')`를 호출(모르가스/심연 경로 byte 의미 동일).

## 6. 망치 source anchor 계산

- `sbPt('sb-boss-fig','sb-ic-hammer',1)` — **실제 element**인 망치 자루의 `getBoundingClientRect()`를 매 render 재계산(windup transform 반영·1회 캐시 없음), stage rect 기준 좌표로 변환.
- topBias=자루 상단 12% 지점 — 망치 머리는 pseudo라 **자루 상단 접촉점으로 근사**([54 §15] 허용 방식·정밀 머리 DOM으로 가장하지 않음·고정 화면 좌표 없음). 실측 (236,113)=자루 상단, 유령 좌표(음수) 완전 소멸.

## 7. actual target anchor 계산

- `bc.tg`(cast에 잠긴 실대상 id) 기준:
  - **전사**: cast 관측 시점에 `bc.blk`이 참이거나 사제 보호막(`shield.amt>0`) 존재 시 `.sb-w-shield`(방어 전면), 아니면 `.sb-w-body`. ★이 선택은 **cast 중 관계 방향 표현일 뿐, block·absorb·직격 결과를 단정하지 않는다**(§8·발주 §3A 준수).
  - **비전사**(전사 사망 시 meleeTgt): `SB_BODY` 맵의 검증된 실제 body element(`.sb-r-body`/`.sb-m-body`/`.sb-s-body`)만 사용. 카드/피규어 루트 중심 대체 없음.
  - **대상 무효·사망·anchor 부재**: `on=!!(src&&dst)` → 선 숨김 + class 정리. **(0,0)/모서리 fallback 없음.**

## 8. cast 관계선과 resolve 결과의 분리

- **관계선**: `bc.kind==='smash'` cast 중에만. 진행률 `pr=(t-bc.start)/(bc.end-bc.start)`(기존 cast 수명 재사용·새 시간 0)로 **intent**(pr<0.6·얇게 stroke 2·opacity .5) → **commit**(pr≥0.6·stroke 3.2·opacity .82) 압축. 철·용광로 색(#7d5a34→#a97b3f + ember drop-shadow) — 기존 빨간 `.fxBoss` 미사용, 네온/화살표/수치 없음. Tell은 기존 windup 포즈+bossCastFill 유지, 신규 바닥 데칼 없음(발주 §4 보류 준수).
- **접촉**: resolve 전이에서만(§9). 관계선은 resolve에서 `on` 제거 → 기존 transition .2s 페이드(짧은 잔광).

## 9. 실제 resolve 확인 방식

- 단순 "cast 있음→없음" 전이만으로 접촉하지 않는다. **세 근거 교차**:
  - ① `sm.S===S` — 같은 전투 객체(재시작·보스 전환 배제. smash cast를 중도 소거하는 in-battle 경로는 없음[54 §4] — tryInterrupt는 judge 전용)
  - ② `t>=sm.end-0.05` — 시전 만료 도달(resolveBossCast의 실제 발화 조건과 동일 기준)
  - ③ `sm.aliveL` — 마지막 cast 프레임의 대상 생존('허공' 미스 배제. 강타 자체로 죽는 치명타는 aliveL=true → 접촉 표시, 올바름)
- 세 조건 미충족(전투 종료/전환/미스 등) 시 접촉 없음·선만 정리.

## 10. blk / absorb / body contact 분류

- 스냅샷 `sm.blk`(각본 물리 막기)와 resolve 프레임 `S.st.abs - sm.absL`(**직전 cast 프레임 대비 같은 tick 흡수 발생 delta**)로 분기:

| blk | abs | class | 표현 |
|---|---|---|---|
| ○ | ✕ | `sbhit-blk` | 방패 철 섬광(brightness 1.7) |
| ✕ | ○ | `sbhit-abs` | 방패 청광 펄스(#8fdcff 계열 — 기존 보호막 언어와 동일 색) |
| ○ | ○ | `sbhit-blkabs` | **철 섬광 주연 + 청광 여운 보조**(한 접촉 사건) |
| ✕ | ✕ | `sbhit-body` | 몸 충격(fig 좌우 jolt + 몸통 brightness) |

- ★resolve 후 **현재 shield 값은 판정에 사용하지 않는다** — 전소로 null이 된 흡수도 delta가 포착([54 §17-0]·실검증 §17-C). per-hit 정밀 수치 미사용·강도 하드코딩 없음.
- 비전사 대상: 해당 피규어 `sbhit-body`로 단순화(§18 한계).

## 11. 병존 시 주연 우선순위

- blk+abs 병존은 **하나의 접촉 사건**: 방패 파츠 하나에 단일 keyframe(`sbHitShieldAbs`: 철 brightness 주연 28% → 청광 drop-shadow 여운 68%)으로 표현. **독립 폭발 FX 2개 동시 발화 없음.** 관계선은 이미 꺼진 뒤라 한 순간 주연=접촉 하나.

## 12. visual-only snapshot 구조

- `SB_SM`(render층 모듈 변수 · **S에 저장 안 함**): `{S(전투 참조),start,end,tg,blk,sh0(관측 시작 시 보호막 보유),absL(직전 프레임 S.st.abs),aliveL}` — [54 §18] 허용 스냅샷 후보 그대로. cast를 처음 관측한 render 프레임(≈시작+1프레임)에 생성, cast 프레임마다 absL/aliveL 갱신 → 마지막 cast 프레임 값이 "resolve 직전" 근사.
- `SB_DIRTY`(접촉 class 잔존 표시) — 보스 전환/전투 이탈 확실 정리용. 새 gameplay timer 0.

## 13. class 수명과 cleanup

- 접촉 class는 CSS animation(0.32~0.46s·권장 0.5s 이하 준수) 1회 → **animationend 리스너 제거**(새 setTimeout 0). ★방패 keyframe은 **filter만 애니**(guard 포즈의 transform과 충돌 없음 — 변형 속성 무접촉). body jolt는 `.sb-fig` transform(호흡 애니 0.32s 대체 후 복귀).
- cleanup: ①새 smash 스냅샷 생성 시 `sbHitClear()` ②비-iron 진입 시 `SB_SM||SB_DIRTY` 정리(**보스 전환 실검증 완료**) ③animationend ④전투 재시작은 ①②가 커버 ⑤anchor 부재 시 선 숨김.
- render가 통째로 덮는 3영역(data-pose·fxr-* className·fx line class)에 외부 삽입 없음 — 선 class는 iron에선 sbSmashFx가 단독 관리(비-iron은 기존 renderFx 관리·경합 없음).

## 14. 다른 보스 보호

- 게이트(§5) + 기존 호출 원문 보존: `if(!sbSmashFx(S,t))fxLn('fxBossLine',A.boss,smashTg?A[smashTg]:null,!!smashTg,'fxBoss');` — 모르가스/심연은 코드 경로·class(`fxBoss`)·색 전부 기존과 동일. sbhit-* CSS는 `#stage.sb-boss-iron` 스코프라 누출 불가.
- **실검증**: 모르가스 smash cast에서 `fxBoss on` 유지 ✓ · 심연 잔재 0 ✓ · iron 접촉 후 보스 전환 시 sbhit class 정리 ✓.

## 15. gameplay 무변경 선언

- CORE byte-identical(466/22,521/`6cad2ec2…`). step/dmg/resolveBossCast/fireScript/tryInterrupt/스킬/SCRIPT/수치(`smashBlocked` 포함)/target 선정/cast 시간/enraged/guard·brace 조건/승패 **전부 무접촉**(신규 코드는 CSS+어댑터 render층만). 스모크 3보스 51.4/1029·48.5/971·61.8/1236 동일. 새 전투 상태·combat event·gameplay timer 0.

## 16. HOLD 코드 미사용 선언

- docs/40·p20.mjs·core_new.js·proto check·repo 밖 HOLD 폴더(`nara-workshop_hold/iron_crusher_action_line_proto_01`) **미열람·미복구·미복사**. 본 구현은 [53]/[54]에서 신규 작성.

## 17. 모바일 시각 검증 (375 실런타임 · 관측 결과)

- ★pane 탭 hidden으로 rAF 정지(frozen-tab) → **실엔진 `G.step` 구동**으로 검증(스모크 하네스와 동일 방식·**가짜 상태/판정/target 주입 0** — 모든 수치는 엔진이 계산). 보호막은 **실제 스킬 버튼 클릭**(정상 플레이 입력)으로만 마련. production 상태 조작 없음.
- **A 무blk 직격**(강타1 t6~7.6): 선 (236,113)→(54,245) 망치 자루 상단→전사 몸통 · intent→commit 전환 확인 · resolve 후 선 소멸+`sbhit-body`. ✓
- **B blk+abs 병존**(보호막 시전 후 t13 blk 강타): cast 중 선이 **방패(74,246)**로(몸통 54와 다른 지점) · resolve `sbhit-blkabs` · 엔진 수치 정합(shield 258→98 = blk 절반 160을 흡수·abs delta +160). ✓
- **C abs 단독**(t19 무blk+보호막): resolve `sbhit-abs` · ★**보호막이 전소되어 null이 됐는데 delta +320으로 흡수 포착** — "현재 shield 값만 보고 직격 오판" 방지 실증. ✓
- **D blk 단독**(새 전투 t13·보호막 없음): `sbhit-blk` · delta 0. ✓
- **E 비전사 대상**(전사 사망 후 t34 → 도적): 선이 도적 몸통(138,266) · 도적 피규어 `sbhit-body`. ✓
- **F 회귀/위생**: 모르가스 `fxBoss on` 유지 · 심연 잔재 0 · 보스 전환 cleanup ✓ · overflow 0(docW=winW=375) · 콘솔 error/warn 0 ✓.
- **캡처**(headless Edge·스크래치패드 보관·커밋 비대상): ①강타 windup+몸통 방향 관계선(무blk) ②blk cast 방패 방향 관계선. 접촉 순간 정지컷은 0.3~0.5s 애니 특성상 자연 정지 포착이 어려워 **pane 실측(class·좌표·엔진 수치)으로 검증 대체 — 투명 보고**.

## 18. 알려진 한계

- **같은 tick 흡수 delta의 이론적 오염**: resolve tick에 다른 피해가 다른 보호막에 동시 흡수되면 delta 오탐 가능 — shell_iron엔 cast 중 melee 없음+dot 어휘 없음 → 실질 0(미래 보스 이식 시 재검토).
- **blk+비전사**: 전사 사망 후 blk 강타는 각본 메시지가 전사 기준 — 시각은 대상 몸통 접촉으로 단순화.
- **모르가스 `A` 캐시 스테일**(iron→모르가스 전환 시 기존 fxBoss 선이 이전 캐시 좌표 사용)은 **선재 결함**([54 §19]·기존 경로 byte 무변경이라 이번 범위 밖·resize 시 자연 회복) — 후속 카드 후보.
- 망치 머리=pseudo → 자루 상단 근사(정밀 머리 anchor element는 [54 §18] 승인 필요 항목).
- frozen-tab에선 animationend 미발화(실기 브라우저는 정상) — SB_DIRTY 정리가 방어.

## 19. 다음 카드로 미룬 항목

- 낮은 압력 바닥 데칼(발주 §4 명시 보류) · 망치 머리/방패 anchor element 추가 · Protection Layer 신설([54 §12]) · 모르가스 연결선 문법+`A` 캐시 스테일 해소 · 심연 drain ribbon · Companion Pose Runtime 01.

## 20. 비범위 선언 (+구계약 정정 2건 보고)

- 도적 smash 차단 표현 0([54 §9] runtime 입력 부재 — 어떤 형태로도 미구현) · 동료 포즈/색 폴리시 runtime 이식 0 · 금빛점 수정 0 · 파티 배치/scale/무대 크기 변경 0 · 신규 데칼 0 · 새 SVG 시스템/다중 path 0(기존 fxBossLine 단일 재사용) · console 주입을 production 근거로 사용 0 · commit/push 0.
- ★**구계약 정정(보고 의무 이행)**: docs/53·54 체크의 `dev/p24.mjs 부재` 단언은 그 문서-only 카드들이 **미래 카드의 패치 파일명까지 과잉 고정**한 시대 고정 오류 — p24는 본 승인 카드의 정당한 산출물. 해당 단언만 근거 주석과 함께 정정(각 카드 자신의 문서-only 성격은 "전용 프리뷰 html 부재" 단언으로 계속 검증). 약화·삭제가 아닌 범위 오류 수정.

---
*— 렌 (連·鍊·紅蓮), EP24. 유령을 지웠다. 이제 선은 망치에서 태어나 방어 전면에서 죽는다. 막았으면 철이 울고, 흡수했으면 푸른 빛이 스미고, 둘 다였으면 철이 먼저 울고 푸른 여운이 남고, 아무것도 없었으면 몸이 흔들린다 — 넷은 서로를 흉내내지 않는다. 그리고 이 모든 것은 보는 이야기일 뿐, 계산은 한 글자도 건드리지 않았다. 나라님 실기와 유키PD 검수로 확정된다.*
