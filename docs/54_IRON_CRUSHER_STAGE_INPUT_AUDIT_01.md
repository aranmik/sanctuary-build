# 54. 파쇄자 무대 입력 감사 (IRON CRUSHER STAGE INPUT AUDIT 01)

**작성: 렌 · 2026-07-12 · EP24 · 상태: 읽기 전용 감사(구현 0 · index.html 무접촉) · 기준 HEAD `c15b9c5` · 계약: [53](./53_BATTLE_STAGE_LANGUAGE_CONTRACT_01.md)**
**상호 링크**: [53 무대 언어 계약](./53_BATTLE_STAGE_LANGUAGE_CONTRACT_01.md) · [44 Figure Rework 01(sbFigPose)](./44_IRON_CRUSHER_FIGURE_REWORK_01.md) · [51 동료 포즈](./51_COMPANION_FIGURE_POSE_PACK_01.md)

> **핵심 문장 3줄**
> 1. **실제 runtime에 없는 것을 없다고 말하는 것이 이 감사의 성공이다.**
> 2. 다음 구현(Smash Line Rework 02)은 **여기 [A]/[B]로 분류된 입력만** 사용할 수 있다.
> 3. ★핵심 발견: 현행 fxBossLine은 **shell_iron에서 숨겨진 #bossAvatar의 유령 좌표**에서 출발해 화면 모서리 직선으로 퇴화해 있다 — 계약 [53 §29]의 실패 사례가 이미 화면에 있다.

---

## 1. 감사 목적

- Iron Crusher Smash Line Rework 02(파쇄자 망치 → 전사 shield/body의 첫 실전 무대 언어)에 앞서, **현재 코드가 이미 가진** 전투 상태·이벤트·DOM anchor·render 시점을 읽기 전용으로 조사·문서화한다.
- 새 상태·새 타이머·추측 연결 금지. 확인된 입력만 다음 구현에 허용한다.

## 2. 기준 HEAD 및 기준선

- HEAD `c15b9c5 docs: add battle stage language contract` · working tree clean.
- index.html 149,440 B / 2,098줄 / md5 `bb7fc147…` · CORE 466줄/22,521 B/`6cad2ec2…` — **감사 시작=종료 byte-identical**.

## 3. 조사한 실제 파일 목록

- `index.html` 단일 파일(성소판은 단일 HTML). 조사 구획(행번호는 현행 기준):
  - CORE: `fireScript` case 'smash'/'judge'(996~1008) · `tryInterrupt`(1043~1062) · `resolveBossCast`(1063~1080) · `step`(1082~, pendJ 1090·cast resolve 1091) · `dmg`(889~907) · castSkill 'shield' 케이스(947~951) · 보호막 만료(1133) · `meleeTgtId` export(1197)
  - 어댑터/렌더: `fxAnchors`(1848~1855) · `fxLn/fxToggle`(1857~1862) · `fxBeam/fxWave`(1863~1873) · `sbFigPose`(1875~1885) · `renderFx`(1886~1905) · `render`(1906~, fx 호출 1930) · `threatBadge`(1831~) · 차단 대기 배너(1956) · `FX` 디스패처 'smash'(1781) · rAF 루프(2092·2095) · 전선 게이트 `sb-boss-iron`(1273)
  - DOM/CSS: `#fxSvg`(CSS 214~216·마크업 610) · `#fxAoeDecal`(212) · sb 피규어 정적 마크업(607 보스·613 전사) · z-index 층(179 avatar·180 allies·212 decal·214 svg) · 파츠 CSS(298 방패·314 망치)

## 4. 강타 cast 상태 흐름 (조사 A)

| 항목 | 실코드 결과 |
|---|---|
| 시작 상태 | `fireScript` case `'smash'`(998): `S.boss.cast={kind:'smash',name:'탱커 강타',start:S.t,end:S.t+B.smashCast,tg:tg.id,blk:ev.blk||0}` |
| 종료 상태 | `step`(1091): `t>=S.boss.cast.end` → `resolveBossCast()`(1063) 진입 즉시 **`S.boss.cast=null`** 후 피해 적용 |
| cast 중 vs resolve 후 | 구분 가능 — cast 중=non-null && `kind==='smash'` / resolve 후=null. ★단 resolve "순간"의 결과값(피해·흡수)은 같은 tick 함수 지역이라, render는 "있다→없다" **전이**만 관측 가능 |
| 스킬 id | `kind:'smash'` 필드(judge와 구분) |
| 대상 확정 시점 | **cast 시작 시** — `tg=(war alive)?war:meleeTgt()`(999) 후 `tg:tg.id` 잠금 |
| cast 전 target 존재 | 없음 — 시작 시점에 계산·잠금(사전 예고 상태 없음) |
| 중간 변경 | 불가 — tg 문자열 고정. 대상 사망 시 resolve가 `tg.alive` 재확인 → '허공을 갈랐습니다' 미스(1068) |
| cancel/interrupt | **smash엔 없음** — tryInterrupt는 judge 전용(§9) |
| 상태 재사용 | `S.boss.cast` 슬롯은 judge와 공유하나 kind로 구분. ★smash kind는 **모르가스 SCRIPT(766~782)에도 존재** — shell_iron 전용 아님 → 시각층은 CUR_BOSS 게이트 필수(sbFigPose 1876 선례) |
| windup 포즈 연결 | `sbFigPose`(1877~79): `data-pose='windup'` ⇔ `bc.kind==='smash'` — **강타 cast 전용 확인**(judge 중엔 '') |
| cast 진행률(Tell UI) | render(1917): `(t-bc.start)/(bc.end-bc.start)` → `#bossCastFill` — 이미 존재 |

- ★추측 금지 확인: cast 시간의 정본은 상태의 `start/end`(=B.smashCast). CSS 애니 시간과 별개(동일 단정 안 함).

## 5. target id 흐름 (조사 B)

| 항목 | 실코드 결과 |
|---|---|
| 저장 위치 | `S.boss.cast.tg` = `'war'|'rog'|'mage'|'sham'`(ally id 문자열) |
| 데이터↔DOM 대응 | `unit(id)`→S.al 검색 / 무대 슬롯 `#sa-<id>` / sb 피규어 `#sb-war-fig` 등 / 카드 UI는 별도(threatBadge) |
| 전사 판별 | `bc.tg==='war'` 문자열 비교(renderFx 1889·threatBadge 1833 선례) |
| 사망/무효 처리 | resolve에서 `tg.alive` 재확인 → 미스. cast 중 사망해도 tg 문자열 유지(render는 `unit(tg).alive`로 확인 가능) |
| render에서 DOM 접근 | 가능 — renderFx가 매 프레임 `bc.tg`로 좌표(`A[smashTg]`)·링(`fxr-<id>` fr-target) 갱신 중 |
| 무대 anchor 적정 구분 | **카드 중심점 ✗**(무대 아님) / **피규어 루트(#sa-war) 중심점 ✗**(현행 fxAnchors 방식 — [53 §13] "중심점 연결 금지" 위반) / **방패 파츠 `.sb-w-shield` ○**(실제 element) / **바닥 `.sb-shadow` ○**(ground) |
| 현행 ring/flash 참조 | ring `#fxr-<id>`(슬롯 내 z1)·flash `#fxf-<id>`(슬롯 내 z4) — 슬롯 기준. `fr-target`은 `smashTg===id`(1902) |

## 6. shield / block / absorb 흐름 (조사 C)

★ **별개 개념 2개가 실존** — 혼동 금지:

**(1) blk — 스크립트 예정 "방패 막기"**: SCRIPT 이벤트 플래그 `{t,e:'smash',blk:1}`(795~807) → cast에 `blk` 저장(1001) → resolve(1070)에서 `d*B.smashBlocked` 감소 + `'방패 막기'` F 텍스트. **runtime 보호막 값과 무관한 사전 각본**. cast 중 `bc.blk`로 render에서 읽기 가능.

**(2) shield — 사제 '보호막' 스킬의 흡수 풀**:

| 항목 | 실코드 결과 |
|---|---|
| 저장 위치 | `unit.shield={amt,end}` — castSkill 'shield'(949): `tg.shield={amt:sk.absorb,end:S.t+sk.dur}` · 유닛 초기화(846·855) `shield:null` |
| 보유 판정 | `!!(u.shield && u.shield.amt>0)` — sbFigPose(1882)가 guard 조건으로 이미 사용 |
| 적용 직전/직후 값 | `dmg()`(893~898) 내부에서만: `use=Math.min(u.shield.amt,a); u.shield.amt-=use; a-=use` |
| absorbed amount | **지역 변수 `use`** — 흔적: ①F 플로팅 `'('+use+')'`(896) ②누적 `S.st.abs`(895) ③파괴 시 `'보호막 파괴'` F(897). **per-hit 값은 render까지 유지 안 됨** |
| block vs absorb | 별개 확인 — blk(각본 50% 감소) ≠ shield(흡수 풀) |
| 완전/부분/무 구분 | render 직접: shield 존재·amt만. per-hit 완전/부분은 직접 불가 |
| 파손 직접 감지 | `u.shield=null`(897 파괴·1133 만료) — render는 "있다→없다" 전이 관측 가능(파괴 vs 만료 직접 플래그 없음) |
| 정보 위치 | 이벤트✗·반환값✗ — 지역변수+F 플로팅+S.st.abs 누적 |
| render 유지 | `u.shield`(값·만료)·`S.st.abs`(누적)는 상태 — 매 프레임 읽기 가능 |
| visual-only 안전 지점 | **`S.st.abs`의 프레임 간 delta**(render층 지역 기억과 비교)로 "이번에 흡수 발생" 비침습 감지 [B] |

- ★수치 비단정: 강타량·보호막량·흡수량은 보스별 CFG·상태에 실존하나, **시각층은 하드코딩 없이 상태에서 읽어야** 한다([53 §23] 정합). 본 감사도 수치를 기록하지 않는다.

## 7. 전사 pose 입력 (조사 D)

| 항목 | 실코드 결과 |
|---|---|
| sbFigPose 위치 | index.html 1875~1885(어댑터·render 전용·[44]) |
| 결정 함수 | 동일 함수 — `render()`(1930)가 매 프레임 `renderFx(...);sbFigPose(S);` |
| 읽는 상태 | `S.boss.cast.kind`·`war.alive`·`war.shield.amt` |
| guard 실제 조건 | `war.shield && war.shield.amt>0` — **보호막(버프) 보유** |
| brace 실제 조건 | guard 아님 && `smashing`(smash cast 중) |
| 켜지는 시점 | 매 render(rAF ~60fps) idempotent `setAttribute('data-pose',…)` |
| 해제 시점 | 조건 소멸 다음 render에서 `''`(타이머 없음) |
| 강타 target 연동 | ✗ — `bc.tg` 안 봄(전사가 대상 아니어도 smash 중이면 brace) |
| shield 연동 | ○(guard) |
| 피격 결과 연동 | ✗ |
| visual-only class 충돌 | `data-pose` **속성 전체를 매 프레임 교체** → 같은 속성에 다른 값 삽입 시 즉시 덮임. 별도 class/속성 또는 sbFigPose 확장으로만 안전 |

**프리뷰([43]/[51]) ↔ runtime 1:1 대응표** (동일 가정 금지):

| 프리뷰 포즈 | 프리뷰 의미 | runtime 실제 조건 | 일치 |
|---|---|---|---|
| 전사 guard | 방패 앞세움(위험 대응) | 보호막 버프 보유 | **의미 상이**(버프 표시로 전용) |
| 전사 brace | 피격 대비 | smash cast 중+무보호막 | 근사 일치 |
| 전사 resolve | 버티기·결의 | 연결 없음 | runtime 미존재 |
| 파쇄자 windup | 강타 준비 | smash cast 중 | 일치 |
| 파쇄자 advance/stagger/recover | — | 연결 없음 | runtime 미존재 |
| 도적/마법사/주술사 15포즈 | [51] 어휘 | 연결 없음 | **전부 프리뷰 전용** |

## 8. 파쇄자 windup pose 입력 (조사 E)

| 항목 | 실코드 결과 |
|---|---|
| figure DOM | `#sb-boss-fig`(607·정적 마크업) — part: shadow/aura/ic-body/ic-core/ic-pauldrons/ic-head/ic-hammer |
| windup class | `data-pose="windup"`(CSS [44]) |
| 결정 상태 | `bc.kind==='smash'`(sbFigPose 1877~79) |
| 강타 전용? | ○(다른 kind에선 '') |
| 일반 cast 공유? | ✗(kind 체크) |
| 적용/해제 | 매 render idempotent / cast null 다음 render |
| 망치 파츠 | `.sb-ic-hammer` = **실제 element**(span·z4·CSS 314). ★망치 "머리"는 `::before` pseudo — 직접 rect 불가 |
| anchor 부착 가능성 | 이번 감사에선 미추가(금지 준수). 후속: ①자루 element rect 상단 오프셋 근사[B] ②anchor element 추가(마크업 변경 — 카드 범위 명시 필요) |
| transform 중 좌표 | `getBoundingClientRect()`는 translateX·scale(1.04)·windup rotate 반영 후 좌표 — 사용 가능. ★호흡 애니(±1px)·포즈 전환 transition(.3s) 중 이동 — 포즈를 따라 anchor가 움직이는 것은 계약상 바람직 |

## 9. 도적 interrupt 입력 (조사 F)

| 항목 | 실코드 결과 |
|---|---|
| 강타 차단 gameplay | **없음** — `tryInterrupt`(1043)는 `S.pendJ` 경로(1090)로만 호출되고 그 경로가 `S.boss.cast.kind==='judge'`일 때만 발동. **smash에 도달하는 차단 경로 0** |
| interrupt ready 상태 | `S.intReady`(쿨다운 시각) 존재 — judge용. 배너(1956)가 smash 중에도 '도적 차단 준비'를 표시하나 **표시일 뿐 smash에 기능 없음** |
| attempt 이벤트 | judge 한정(pendJ 자동 시도 — 플레이어 입력 아님) |
| success/fail 결과 | `S.st.ints[]`·성공 시 `S.boss.cast=null`(1055) — judge 한정 |
| 도적 id 연결 | `unit('rog')` — judge 경로에서만 |
| smash cast 취소 | **불가**(경로 없음) |
| 문서에만 존재? | smash 차단은 **문서/프리뷰([51] interrupt/dash/strike 포즈)에만 존재** |
| 가짜 상태 금지 목록 | "smash interrupt ready"·"도적 dash 상태"·"파쇄자전 차단 성공 임펄스" — 전부 생성 금지 |

> **결론: 현재 runtime 입력 없음 — Iron Crusher Smash Line Rework 02 범위에서 사용 금지.**

## 10. DOM anchor 후보 표 (조사 G)

| anchor | selector | element/pseudo | rect | transform/scale | 애니 중 안정성 | 클리핑 | 추천 |
|---|---|---|---|---|---|---|---|
| boss body | `#sb-boss-fig .sb-ic-body` | element | ○ | scale1.04 반영 | 호흡 ±1px | stage 내 | ○ |
| hammer(자루) | `#sb-boss-fig .sb-ic-hammer` | element | ○ | windup rotate 반영(추적) | 전환 .3s 중 이동 | stage 내 | **◎ source** |
| hammer(머리) | 위 `::before` | **pseudo** | ✗ | — | — | — | 자루 rect 상단 오프셋 근사 [B] |
| boss cast | 전용 없음 | — | — | — | — | — | 대안 `.sb-ic-core`(element) [B] |
| boss ground | `.sb-iron-crusher .sb-shadow` | element | ○ | — | 안정 | stage 내 | ○ |
| war body | `#sb-war-fig .sb-w-body` | element | ○ | scale.80 반영 | 호흡 ±1.6px | stage 내 | **◎ target(무보호막)** |
| war shield | `#sb-war-fig .sb-w-shield` | element | ○ | guard 이동·확대 반영(추적) | 전환 중 이동 | stage 내 | **◎ target(보호막)** |
| war ground | `.sb-warrior .sb-shadow` | element | ○ | — | 안정 | stage 내 | ○ |
| party | 전용 없음 | — | — | — | — | — | 대안 `#stageAllies` rect [B] |
| stage | `#stage` | element | ○ | 기준 좌표계 | — | **overflow:hidden** | 기준 |

- **SVG 좌표 변환**: `#fxSvg`는 viewBox 없음 + inset:0/100% → 사용자 단위=stage px. 현행 fxAnchors 방식(파츠 rect − stage rect)이 그대로 유효. resize 시 `A=null`(1856) 선례.
- ★**figure root 중심점이 계약 위반인 이유**: [53 §13] "선은 행동이 발생하는 파츠를 연결" — 루트 중심은 망치도 방패도 아닌 몸 한복판이라 보호층 멈춤([53 §23])을 표현할 수 없다.
- ★★**현행 fxAnchors 결함(감사 핵심 발견)**: `A.boss=c('bossAvatar')`(1852)인데 shell_iron에선 `#bossAvatar`가 `display:none`(371) → rect 전부 0 → **boss anchor가 stage 좌상단 밖 음수 좌표로 퇴화** → 현행 fxBossLine이 "화면 모서리→전사 직선"([53 §29] 실패 사례)으로 그려지는 중(나라님 실기 스크린샷의 빨간 선). `A.war=c('sa-war')`도 슬롯 중심점. → **Rework 02의 1순위 수정 지점**.
- 이번 감사에서 anchor element 추가 없음(금지 준수).

## 11. `#fxSvg` / `renderFx` 구조 (조사 H)

| 항목 | 실코드 결과 |
|---|---|
| #fxSvg 위치 | stage 직속(610): 정적 `<line>` 3개 — `#fxBossLine.fxBoss`·`#fxIntLine.fxInt`·`#fxPriLine.fxPri` |
| viewBox/좌표계 | viewBox 없음 → px=stage CSS px. CSS(214): `inset:0;100%;pointer-events:none;z-index:3;overflow:visible`(최종 클리핑은 #stage overflow:hidden) |
| resize 대응 | `window resize → A=null`(1856) 재계산 |
| renderFx 정의/호출 | 1886 정의 · render(1930)에서 **매 rAF 프레임**(루프 2092/2095) |
| line 생성 | 정적 3라인 attr 갱신(fxLn 1857: x1y1x2y2+class 통째 교체) — 동적 생성/삭제 없음 |
| cleanup | class에서 `on` 제거 → CSS transition .2s 페이드(215~216) |
| gameplay 읽기 | `S.boss.cast`(kind·tg)·rog alive/debuffs·`S.sel` — 전부 읽기 전용 |
| target ring | `#fxr-<id>` className 매 프레임 통째 교체(fr-target/fr-aoe/fr-sel·1898~1904) |
| status flash | `#fxf-<id>` — fxBeam(시전선+플래시·**setTimeout 460ms**)·fxWave(560ms) = visual-only setTimeout 선례 |
| damage/heal/block visual | `F()` 플로팅('-n'·'(n)'·'방패 막기'·'보호막 파괴') + `FX('smash')`=SFX+shake(1781) + vign(906) |
| z-index | decal z1 < avatar/allies z2 < **fxSvg z3**(슬롯 내 파츠 z는 자체 문맥) |
| Actor 앞/뒤 | **선이 배우 위(z3>z2)** — 현행 선이 몸 위를 지남 |
| pointer-events | none |
| 390px 클리핑 | stage overflow:hidden — 스테이지 밖 좌표는 조용히 잘림(현행 boss 라인이 그 상태) |

## 12. 계약 레이어 7층 ↔ 현행 DOM 대응표

| 계약 층([53 §14]) | 현행 실체 | 상태 |
|---|---|---|
| 1 Stage Ground | `#fxAoeDecal`(z1)·각 피규어 `.sb-shadow` | 있음 |
| 2 Behind-Actor Field | 슬롯 `.figAura`(z0)·sb `.sb-aura` | 있음 |
| 3 Actor Body | `#bossAvatar`/`#stageAllies`(z2)·sb 피규어 | 있음 |
| 4 Protection Layer | **없음** — 방패 파츠는 몸과 같은 문맥 | **후속 신설 필요** |
| 5 Relation/Action | `#fxSvg`(z3) — 단 배우 위 전면 | 있음(층 위치 재고 필요) |
| 6 Contact/Impact | `.figFlash`(슬롯 z4)+shake+vign | 있음 |
| 7 Result/Readability | 카드 threatBadge('위험')·F 플로팅·bossCastWrap·경고 배너 | 있음 |

## 13. visual-only class 적용·해제 가능 지점 (조사 I)

| 항목 | 실코드 결과 |
|---|---|
| 켤/끌 수 있는 곳 | render 계열(renderFx/sbFigPose) — 매 rAF·상태 읽기 전용·idempotent 교체 |
| DOM 재생성 | 없음 — 피규어·SVG 전부 정적 마크업, attr/class만 갱신 |
| 즉시 덮어써지는 곳 | ①`data-pose`(sbFigPose) ②`#fxr-*` className ③fx 라인 class — **이 3곳에 임의 class 삽입 금지**(매 프레임 통째 교체) |
| setTimeout 없이 유지 | 상태 기반 class는 조건 지속 동안 유지(guard/windup 선례) |
| 기존 gameplay timer 재사용 | `bc.start/end`로 진행률 계산 가능(bossCastFill 선례) — **cast 수명=시각 수명 동기 가능, 새 타이머 불필요** |
| animationend | 현재 미사용 — one-shot visual cleanup에 사용 가능(CSS 애니는 gameplay 상태를 안 만짐 → 분리 보장) |
| visual setTimeout 선례 | fxBeam 460ms·fxWave 560ms·showCallout 1400ms(전부 표현 전용) |
| stale 위험 | S.over 후에도 rAF/render 지속 → cast null → 포즈 자연 해제. 전선 전환은 enterBattle의 `sb-boss-iron` 게이트(1273). ★render가 관리하지 않는 새 class 도입 시 전투 전환 명시 해제 지점 필요 |
| resolve 전이 감지 | "cast 있음→없음" 프레임 전이를 **render층 지역 변수**(이전 프레임 기억)로 감지 — gameplay 상태 아님·[B] 허용 후보 |

## 14. [A] 바로 사용 가능

| 입력 | 근거(파일=index.html) |
|---|---|
| smash cast 중 여부·진행률·이름 | `S.boss.cast{kind,start,end}`(998)·render 선례(1912~18) |
| smash 대상 id·전사 여부 | `bc.tg`·`bc.tg==='war'`(renderFx 1889 선례) |
| blk(각본 방패 막기) 예정 여부 | `bc.blk`(1001) |
| 전사 보호막 보유·잔량·만료 | `unit('war').shield{amt,end}`(sbFigPose 1882 선례) |
| windup/guard/brace 포즈 | `data-pose`(sbFigPose — 이미 구현) |
| 누적 흡수량 | `S.st.abs`(895) |
| 광폭화 | `S.boss.enraged`(1026) |
| 망치 자루·방패·몸통·그림자 rect | `.sb-ic-hammer`/`.sb-w-shield`/`.sb-w-body`/`.sb-shadow` — 전부 실제 element |
| stage 상대 좌표계·resize 무효화 | fxAnchors 방식(1848~56) |

## 15. [B] 조건부 사용 가능

| 입력 | 조건/어댑터 |
|---|---|
| per-hit 흡수 발생 감지 | `S.st.abs` 프레임 간 delta(render층 지역 기억) — 발생 여부만·정밀값 아님 |
| resolve 순간 one-shot 임펄스 | cast "있음→없음" 전이 감지(render층 지역 기억) — FX('smash')/F 플로팅과 같은 tick |
| 망치 "머리" 좌표 | 자루 element rect+오프셋 근사(pseudo) — 또는 후속 카드에서 anchor element 추가 승인 |
| boss cast anchor | 전용 없음 — `.sb-ic-core` rect 대용 |
| party anchor | 전용 없음 — `#stageAllies` rect 대용 |
| 포즈 중 파츠 anchor | 파츠가 포즈로 움직임 — fxAnchors식 1회 캐시 대신 프레임/전환 시 재계산 전략 필요 |
| 파괴 vs 만료 구분 | 직접 플래그 없음 — "resolve 직후 shield 소멸" 조합 추론만 |

## 16. [C] 사용 금지

| 입력 | 근거 |
|---|---|
| 도적의 smash 차단 일체(ready/attempt/success/cancel) | **runtime 경로 없음**(tryInterrupt=judge 전용·1090) — Rework 02 사용 금지 |
| 도적/마법사/주술사 포즈 runtime 상태 | [51] 프리뷰 전용 — 연결 상태 미존재 |
| per-hit 흡수량 정밀값 | dmg() 지역 변수(894) — render 미노출 |
| smash 사전 예고 상태(cast 전) | cast 생성 시점에만 대상 확정 |
| 파쇄자 advance/stagger/recover 포즈 상태 | 연결 상태 미존재(프리뷰 전용) |
| 강타·보호막 수치 하드코딩 | [53 §23] — 상태에서 읽지 않는 수치 표기 금지 |
| 새 gameplay 상태·타이머·판정 | 감사 원칙·[53 §28] |

## 17. 새 상태 없이 가능한 최소 구현안

전부 render층(어댑터)에서 [A]/[B] 입력만으로.

### 17-0. 두 방어 신호는 별개이며 병존 가능 (★판정 기준)

- **실제 계산 순서(코드 확인)**: `resolveBossCast`(1069~71) `d=enraged?enSmash:smash` → `if(c.blk){d=Math.round(d*B.smashBlocked)}`(**피해량 자체를 절반으로 감소**) → `dmg(tg,d,'smash')` → `dmg`(893~898) `if(u.shield&&a>0){use=Math.min(u.shield.amt,a);u.shield.amt-=use;a-=use;S.st.abs+=use;…}`(**남은 피해를 흡수 풀이 흡수**). 즉 **blk 감소가 먼저, shield 흡수가 나중**.
- **병존 여부**: `bc.blk`와 `unit.shield`는 **상호 배타가 아니다** — blk가 피해를 절반으로 깎은 뒤 남은 피해를 shield가 흡수할 수 있어 **둘 다 관여 가능**하다. blk만 / shield만 / 둘 다 / 둘 다 없음 네 경우 모두 발생 가능.
- **cast 중 관계선 종점 ≠ resolve 결과 표현**: cast 중(Tell·관계선)은 "예정 대상"만 안다. 방어 결과(물리 막기·흡수·직격)는 **resolve 순간에만 확정**된다. 둘을 같은 판정으로 묶지 않는다.

세 신호를 **분리해서** 표현한다(합치거나 누락 금지):

- **① 물리적 방패 막기** — 입력 `bc.blk`(SCRIPT 각본이 확정한 물리적 block 결과·1001·1070). 전사 방패 파츠(`.sb-w-shield`)와 연결 가능한 후보. ★`unit.shield` 흡수 또는 보호막량으로 표현하면 안 됨(무관한 신호).
- **② 사제 보호막 흡수** — 입력: cast/resolve **직전의 `unit.shield` 상태를 기억한 visual-only snapshot** + resolve 순간 `S.st.abs` **delta**. 실제 absorb 발생 여부의 조건부 관측. ★resolve 후 현재 shield 값만 보고 판정 금지 — 보호막이 이번에 **전부 소진되어 null이 되어도** 흡수 발생을 놓치면 안 됨. per-hit 정밀 흡수량은 알 수 없으므로 강도 수치화·하드코딩 금지.
- **③ 실제 body contact** — `bc.blk`와 실제 shield absorb가 **모두 확인되지 않은 경우에만** 무방어 직격 후보. ★resolve 후 `shield=null`이라는 이유만으로 직격 단정 금지(직전 snapshot+`S.st.abs` delta로 흡수 발생을 먼저 배제해야 함).

### 17-1. 사건 흐름

1. **Tell**: smash cast 중 — 기존 windup 포즈+bossCastFill(이미 있음)+선택적 낮은 압력 데칼(상태는 bc만 읽음).
2. **관계선 재배선**: 기존 `#fxBossLine`을 ①source=`.sb-ic-hammer` rect(자루 상단 근사) ②target=`bc.tg==='war'`인 **전사 파츠 rect**로 교체 — ★fxAnchors의 bossAvatar 유령 좌표 수정이 핵심. cast 중 종점은 "전사 방향"을 가리킬 뿐 **방어 결과를 확정하지 않는다**. **CUR_BOSS==='shell_iron' 게이트 필수**(모르가스 회귀 방지).
3. **Contact(resolve)**: resolve 전이 감지([B]) 시 one-shot 임펄스 — 위 세 신호로 분기: ①물리 막기(`bc.blk`)면 방패층 점등(figFlash ff-shield 재사용 후보) / ②사제 보호막 흡수(snapshot+`S.st.abs` delta)면 흡수 표현 / ③둘 다 미확인이면 body 무거운 피격(기존 FX('smash') shake와 동기). ★세 신호를 **합치거나 누락하지 않는다**.
4. **Afterglow**: CSS transition/animationend 자체 수명(≤0.5s·fxBeam 선례 범위).
5. **제외**: 도적 차단 표현([C])·per-hit 흡수량 정밀 수치([C])·모르가스/심연 라인(후속 카드).
6. gameplay 계산·타이밍·판정 무변경 — step/dmg/resolve 무접촉.

## 18. Iron Crusher Smash Line Rework 02 허용 입력 계약

- **허용**: §14 [A] 전부 + §15 [B] 중 "resolve 전이 감지"·"망치 자루 rect+오프셋"·"파츠 rect 재계산 전략".
- **카드 범위에 명시 후 승인 필요**: 망치 머리/방패 anchor element 추가(마크업 변경)·압력 데칼 신설(신규 CSS).
- **금지**: §16 [C] 전부 — 특히 도적 차단 일체·수치 하드코딩·새 상태/타이머.
- ★**세 방어 신호 분리 계약**(§17-0을 §18로 승격): cast 중 관계선 종점과 resolve 결과 표현은 같은 판정이 아니다. `bc.blk`는 물리적 방패 막기 신호, `unit.shield` snapshot + `S.st.abs` delta는 사제 보호막 흡수 신호이며 **둘은 병존 가능**하다(계산 순서: blk 감소→shield 흡수). resolve 후 현재 shield 값만으로 과거 흡수 여부를 판정하지 않는다. 물리 block과 보호막 absorb가 **모두 없다고 확인될 때만** body 직격을 표현한다. per-hit 흡수 정밀값은 현재 runtime에서 사용 금지.
- **우선 목표 대조**(발주 §6): 1 windup 읽기 ○[A] / 2 망치 anchor ○[B] / 3 전사 target 확인 ○[A] / 4 **사제 보호막 흡수 표현**=snapshot+`S.st.abs` delta로 발생 확인 시만([A]+[B]·현재 shield 값 단독 판정 금지) / 5 **body 직격**=물리 막기(`bc.blk`)·보호막 흡수 **둘 다 미확인**일 때만([A]+[B]) / 6 resolve 후 contact/afterglow ○[B] / 7 주연 1선 ○(fxBossLine 재배선) / 8 몸 관통 금지 ○(전사 파츠 rect 도착) / 9 UI/무대 분리 ○(수치는 F·카드 유지) / 10 계산 무변경 ○. **도적 차단은 목표에서 제외**(§9). ★물리 방패 막기(`bc.blk`)는 별도 신호로 target 파츠 표현과 분리 취급.

## 19. 위험 요소

- **fxAnchors 캐시**: 현행 `A`는 resize에만 무효화 — 파츠 anchor는 포즈로 움직이므로 캐시 전략 재설계 없이는 선이 파츠를 못 따라감.
- **z 층**: fxSvg(z3)가 배우 위 — 선이 얼굴을 가로지를 위험. 경로 조정/층 재배치는 시각 실측 필요([53 §14]).
- **stage overflow:hidden**: 잘못된 좌표는 조용히 잘림(현행 boss 라인처럼) — 구현 후 육안+rect 검증 필수.
- **호흡 애니 ±1.6px**: 매 프레임 재계산 시 선 끝 미세 진동 — 허용 여부는 실기 감으로.
- **모르가스 회귀**: smash kind는 boss01에도 존재 — 시각 재배선에 CUR_BOSS 게이트 누락 시 모르가스 전투의 기존 라인이 변형됨.

## 20. 비구현 선언

- 이 카드는 **읽기 전용 감사**다. index.html 수정 0 · runtime JS/CSS 수정 0 · 행동선/SVG path/anchor element 추가 0 · pose runtime 연결 0 · 새 전투 상태/타이머 0 · 수치/판정/Save 변경 0 · console 주입 0 · HOLD 산출물(docs/40·iron_crusher_action_line_proto_check·p20.mjs·core_new.js) **미열람·미복구·미승계** · commit/push 0.
- index.html·CORE는 시작=종료 byte-identical(§2).

---
*— 렌 (連·鍊·紅蓮), EP24. 코드를 열어 보니 무대는 생각보다 많은 것을 이미 알고 있었다 — 누가 강타의 표적인지, 방패가 몇 남았는지, 시전이 몇 초 남았는지. 그리고 생각보다 정직하게 부서져 있었다 — 보스의 선은 숨겨진 아바타의 유령 좌표에서 출발해 모서리에서 잘려 들어오고 있었다. 다음 카드가 할 일은 마법이 아니라 재배선이다: 유령이 아니라 망치에서, 몸통이 아니라 방패에서. 없는 것(도적의 차단)은 없다고 적었다. 그 경계가 이 감사의 성과다.*
