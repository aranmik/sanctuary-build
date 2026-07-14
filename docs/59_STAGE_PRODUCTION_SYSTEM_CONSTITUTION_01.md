# 59. 무대 제작 시스템 헌법 (STAGE PRODUCTION SYSTEM CONSTITUTION 01)

**작성: 렌 · 2026-07-15 · EP25 · 상태: 설계 헌법(document-only · 구현 0 · index.html/CORE byte-identical) · 기준 HEAD `2f547ad`**
**상호 링크**: [39 시각 정체성](./39_BATTLE_VISUAL_IDENTITY_CONTRACT.md) · [41 피규어 정장](./41_BATTLE_FIGURE_KIT_IMPORT_CONTRACT.md) · [53 무대 언어](./53_BATTLE_STAGE_LANGUAGE_CONTRACT_01.md) · [54 입력 감사](./54_IRON_CRUSHER_STAGE_INPUT_AUDIT_01.md) · [55 강타선](./55_IRON_CRUSHER_SMASH_LINE_REWORK_02.md) · [33 보스 문법](./33_BOSS_GRAMMAR.md) · [60 확장 사이클](./60_STAGE_EXTENSION_CYCLE_CONTRACT_01.md) · [61 이행 로드맵](./61_STAGE_FOUNDATION_MIGRATION_ROADMAP_01.md)

> **태그**: **LOCK**(검증 근거 있는 헌법) / **PROVISIONAL**(첫 구현 슬라이스에서 검증 후 잠금) / **EXTENSION**(후속 콘텐츠에서 추가될 확장점) / ⛔금지
> 규범어: **MUST**(반드시) / **MUST NOT**(금지) / **SHOULD**(강한 권장·예외는 근거 문서화) / **MAY**(허용)

> **핵심 문장 4줄**
> 1. `포즈는 행위, 데칼은 위험 공간, 행동선은 관계, 임펄스는 결과를 말한다.` ([53] 계승)
> 2. **gameplay는 포즈의 이름을 모른다. 무대는 gameplay의 결과를 바꾸지 못한다.**
> 3. **무대는 새 진실을 만들지 않는다 — 이미 있는 진실(S·S.ev)을 번역한다.**
> 4. **새 보스·직업·스킬은 공통 코드가 아니라 profile 데이터와 등록된 handler로 무대에 선다.**

---

## 1. 목적

성소판은 전투의 재미(1차 데모 3보스), 재도전의 재미(성당 로드아웃×보스 조합), 무대 문법의 시각 검증(파쇄자 Actor·강타 관계선·나라님 Phone FINAL PASS ×3회)을 이미 실기로 확인했다. 이제 필요한 것은 개별 Actor에 연출을 하나씩 하드코딩하는 손이 아니라, **보스·직업·스킬을 반복 추가해도 무대가 꼬이지 않는 생산 시스템**이다. 본 문서는 그 시스템의 계층·신호·수명·등록·정리·금지선을 **헌법으로 잠근다**. 구현은 0이며, 실제 이행은 [61] 로드맵의 카드들이 수행한다.

## 2. 검증된 전제 세 가지 (LOCK)

1. **전투 자체의 재미** — 3보스(모르가스/파쇄자/심연) 전부 나라님 실기 1트 클리어와 FINAL PASS([31][32][36]). 고정 스크립트·결정론(난수 0)·"변수는 오직 사제의 손"이 재미의 뼈대다.
2. **재도전의 재미** — 성당 로드아웃 6칸([38])×보스 선택([29] 게시판)으로 다른 구성·다른 보스 재도전이 실기 검증됨.
3. **무대 문법의 시각 검증** — 파쇄자 무대(Actor 4+1·windup/guard/brace 포즈·망치→방패 관계선·접촉 4분기·세로 대치)가 나라님 폰에서 "드디어 무대가 완성되었어!"·"강력하게 패스"([56][57][58]). **무대 언어가 성소판 전투 문법과 맞는다는 것이 증명됐다.**

## 3. 시스템 비전

```
Combat Truth (CORE: S + S.ev)
   → Stage Signal Adapter   (진실 → 무대 어휘 번역 · 읽기 전용)
   → Stage Director          (신호 → 누가 무엇을 보여줄지 결정 · 우선순위/주연 1)
   → Actor/Boss Presentation  (profile: 포즈·anchor·cue 데이터 + 등록된 고유 handler)
   → Pose / Anchor / Line / FX / Afterglow  (표현 어휘)
   → DOM Visual Output        (idempotent presenter)
```

- 이 흐름의 **각 화살표는 단방향**이다. 오른쪽 계층은 왼쪽을 읽을 수 있으나 **왼쪽을 변경할 수 없다**(MUST NOT · §7).
- 이것은 새 엔진이 아니다 — **현행 단일 HTML의 rAF 루프(frame 2169: step→어댑터→drain→render)가 이미 이 순서로 돌고 있다.** 헌법은 이미 있는 흐름에 이름과 경계를 부여하고, 하드코딩된 부분을 데이터/등록으로 바꿀 지점을 지정한다.

## 4. 비목표 (LOCK · 과잉 설계 방지)

다음은 이 기반의 목표가 **아니다**: 범용 게임 엔진 · ECS · 프레임워크/애니메이션 라이브러리 도입 · 파일 구조 전면 재작성(단일 index.html 유지) · CORE 재설계 · 대형 이벤트 버스(기존 `S.ev` 큐를 넘어서는 pub/sub 신설) · 모든 보스를 같은 데이터만으로 표현(고유 handler는 정당한 시민이다 · §15) · 미래 전부의 선반영 · 출시 전 에디터 제작.

**공통화 승격 기준(LOCK)**: 어떤 구조를 공통 계층으로 올리려면 ①**현재 2개 이상의 실사례**에서 반복되었거나 ②이미 승인된 확장 요구([60] 사이클의 필수 단계)가 있어야 한다. 새 abstraction마다 §해당 절에 "실사례 근거/해결하는 것/해결하지 않는 것/유지 비용/과잉 위험"을 기록했다.

## 5. 현행 runtime 감사 (2026-07-15 · index.html 155,854 B/2,188줄/`2f7a1b29…` 실측)

### 5-A. Combat Truth — 전투 진실의 원천

**유일한 source of truth는 CORE(`//__CORE_START__` 752 ~ `//__CORE_END__` 1219)의 `S` 객체와 `S.ev` 큐다.** `createGame(bossId)`(862)가 생성하고 `step(dt)`(1101)가 전진시킨다.

| 진실 | 변수 | 생성 | 변경 | 소비(현행) | 무대 입력 가능 |
|---|---|---|---|---|---|
| 시각/진행 | `S.t`·`S.si` | createGame | step(1103)·스크립트 소비(1104) | render clock·nextPattern | ○ [A] |
| 전투 시작/종료 | `S.started`·`S.over`·`S.result`·`S.endT` | createGame | `start()`(1214)·`end()`(891) | render·drain(`y:'end'`→showReport) | ○ [A] |
| 보스 행동(cast) | `S.boss.cast{kind,name,start,end,tg,blk\|j,un}` | `fireScript` smash(1020)/judge(1024) | `resolveBossCast` 진입 즉시 null(1083)·차단 시 null(1074) | render bossCastWrap(2001~08)·renderFx·sbSmashFx·sbFigPose | ○ [A] — **kind는 보스 간 공유**(smash가 모르가스에도) → 시각층 보스 게이트 필수 |
| 보스 평타 | `S.boss.nextMelee` | createGame | step(1111~19) | `FX('melee')` 순간 이벤트만 | 순간만 [A] |
| 광폭화/전투의지 | `S.boss.enraged`·`S.valorUntil` | fireScript | — | render enrageTag·valorBanner | ○ [A] |
| 대상/피해/치유 | `dmg()`(908)·`heal()`(927) | — | 즉시 계산 | `F()` 플로팅·`FX()` 이벤트 | 순간만 — per-hit 값은 지역 변수([54 §6]) |
| 보호막 | `unit.shield{amt,end}`·`shieldLock` | useSkill 'shield'(966~) | dmg 흡수(912~17)·만료(1152) | render sh-바·sbFigPose guard | ○ [A] · 파괴/만료 구분 플래그 없음 [54 §15] |
| 흡수 누적 | `S.st.abs` | dmg(914) | — | sbSmashFx delta 판정(1939) | ○ [B] delta 패턴 |
| 디버프 | `unit.debuffs[{k:'brand'\|'bomb',t0,end,tick}]` | fireScript brand/bomb | step 만료/폭발(1130~50) | chipsHTML·renderFx branded | ○ [A] |
| 차단 | `S.pendJ`·`S.intReady`·`S.rogFail`·`tryInterrupt`(1062) | fireScript judge | step(1109) | intBar 배너(2045)·intOk/intFail 이벤트 | ○ [A] — **judge 전용. smash 차단 경로 없음**([54 §9] LOCK) |
| 사제 시전 | `p.cast{k,tg,name,end,dur}`·`resolvePriCast`(997) | useSkill big/pray | 만료 resolve(1108)·`cancelCast`(938) | priCastWrap·gLock | ○ [A] |
| 사제 자원 | `p.mana`·`p.holy`·`p.gcd`·`cdDispel/cdPray` | useSkill·step regen | — | 버튼 veil/noMana/gLock | ○ [A] |
| 지속 치유(어댑터 소유) | `u.hot`(소생)·`u.seed`(기도씨앗)·`p.focusArmedUntil` | renewUse(1684)/seedUse(1644)/focusUse(1615) — **CORE 밖 준게이트 어댑터** | renewTicks·seedOnHit·seedExpire | chipsHTML | ○ [A] — 진실이 CORE 밖에도 있음을 명시 |
| 심연 drain | **상태 없음** — fireScript 'drain'(1048)이 **즉시 실행**(마나 소실+광역) | — | — | 로그·`FX('aoe')` | **cast 창 없음 — Tell은 nextPattern eta뿐**(§15-C) |
| 다음 행동 예고 | `nextPattern()`(1209) | — | — | warnBar(2010) | ○ [A] — 스크립트 lookahead |
| 보스 전환 | `CUR_BOSS`(1272)·`newGame(slot)`(1280) | enterBattle | — | `sb-boss-iron` 클래스 토글(1290) | ○ [A] — 전환=정리 경계(§19) |

**이벤트 큐(순간 진실)**: CORE는 `S.ev`에 push하는 5개 emitter를 갖는다 — `E`(원시)·`L`(로그)·`F`(플로팅)·`FX`(연출 디스패치)·`deny`(거부 토스트)(880~884). UI의 `drain()`(1734)이 매 프레임 `splice(0)`로 **유일하게 소비**한다. FX 어휘(CORE 발신 전수): start/win/lose/death/bossCast/judgeWarn/debuff/valor/valorOff/enrage/aoe/smash/melee/allyAtk/bombBoom/intOk/intFail/save/vign/castStart/fizzle/heal/shield/dispel/pray + `y:'sel'/'end'/'deny'/'log'/'flt'`.

- ★**정직한 예외 1**: `drain()`은 순수 시각 소비자가 아니다 — `seedOnHit`(1658)가 피해 플로팅 이벤트(`y:'flt'`, '-' 접두)를 받아 **기도씨앗 발동(gameplay)** 을 구동한다(1738). 즉 `S.ev`는 "CORE→바깥 통신로"이며 소비자에 gameplay 어댑터와 시각층이 공존한다. → 무대층은 이 큐를 **drain 안에서 tap**해 읽되(§7-2), 큐를 별도로 splice하는 제2 소비자를 만들면 **MUST NOT**(이벤트 유실).
- ★**정직한 예외 2**: FX 어휘에 **충돌**이 있다 — 심연 drain과 모르가스 judge resolve가 같은 `FX('aoe')`를 쓴다(1059·1097). 순간 신호만으로 둘을 구분할 수 없고 보스 문맥(CUR_BOSS)이 필요하다. → 신호 등록부(§8)가 이 중의성을 명시 관리한다.
- **미처리 이벤트의 현행 fallback**: `doFx`(1792) switch에 case가 없는 kind(bossCast/judgeWarn/valorOff)는 **조용히 무시**된다 — 알 수 없는 순간 신호=무해한 no-op이 이미 선례다(§20 fallback 근거).

### 5-B. 현행 visual state 전수

| 기법 | 실체(전수) | 소유 |
|---|---|---|
| class 토글(상태 파생·idempotent) | `sC()` 계열: 카드 sel/dead/danger·`bossAvatar` casting/enr·bossCastWrap idle/noInt/smash·priCastWrap idle·스킬 gLock/dis/noMana/saveReady·`sa-*` dead·`sb-boss-iron`(1290) | render 계열 |
| class 토글(순간·자기 정리) | `sbhit-blk/abs/blkabs/body`(**animationend** 정리·1955~62)·`figFlash on`(setTimeout)·`hitF`(120ms)·`shake`(380ms)·`vignette on`(450ms)·toast/callout | sbSmashFx·doFx 계열 |
| inline style | `sW()` width%·fxLn 좌표 attr·fxToggle opacity·flashFrame boxShadow·pulseStage filter·spawnFloat top | presenter |
| CSS 변수 | `--sb-*` 4색 계열(피규어 정체성·정적) — 동적 변수는 현재 0(--cp는 [57]에서 제거) | CSS |
| pseudo-element | 파츠 디테일(망치 머리 `::before` 등) — **rect 불가**([54 §10]) | CSS |
| setTimeout(전부 시각 전용) | fxBeam 460·fxWave 560·flashFrame 180·shake 380·vign 450·bossHit 120·pulseStage 110·spawnFloat 1000·toast 1300·callout 1400·showReport 지연 650 — 최장 1.4s·전투 상태 무접촉 | doFx 계열 |
| rAF | `frame()`(2169) 단일 루프: `step×N → renew/seed/focus 어댑터 → drain() → render()` | 메인 루프 |
| engine tick | 고정 0.05s·guard 40(최대 2s/frame) — 결정론([31]) | CORE 호출부 |
| render층 지역 기억(transient) | `SB_SM`(강타 시각 스냅샷·1896)·`SB_DIRTY`(1897)·`lastHitFx`·`box.__n` | sbSmashFx 등 |
| DOM 캐시 | `el.__t/__h/__w/__c/__hc/__vh`(idempotent setter `sT/sH/sW/sC` 1222~25) | presenter |
| dataset | `data-pose`(sbFigPose가 **속성 전체를 매 프레임 교체** — 제3자 삽입 불가 [54 §13])·data-k/boss/ld/cat(입력용) | sbFigPose·입력 |
| 직접 selector | `$()` id 직조회 산재·`SB_BODY` 맵(1898)·`sbPt(figId,part)`(1899)·`fxAnchors`(1867) | 혼재 — **registry로 모을 대상**(§12) |

### 5-C. 현행 Actor 포즈 구조 (6 Actor)

| Actor | 확보 포즈(프리뷰 [43][51]) | runtime CSS | runtime 연결 | 입력 신호(실코드) | 선택 코드 | anchor 파츠(실 element) |
|---|---|---|---|---|---|---|
| 전사 | guard/brace/resolve | **guard/brace**(405~412) | ○ | `war.shield&&amt>0`→guard / smash cast 중→brace(sbFigPose 1969~73) | sbFigPose | `.sb-w-shield`·`.sb-w-body`·`.sb-w-sword`·`.sb-shadow` |
| 도적 | interrupt/dash/strike/recover 등 5 | 없음 | ✗(프리뷰 전용) | — | — | `.sb-r-dagger`·`.sb-r-body`·`.sb-shadow` |
| 마법사 | charge/channel/release/aftercast 등 5 | 없음 | ✗ | — | — | `.sb-m-orb`·`.sb-m-body`·`.sb-shadow` |
| 주술사 | sustain/cleanse/pulse/rescue 등 5 | 없음 | ✗ | — | — | `.sb-s-totem`·`.sb-s-charm`·`.sb-s-body`·`.sb-shadow` |
| 사제 | 전장 피규어 없음([41 §G] 현행 유지) — 카드 패널 주체 | — | — | — | — | 가상 anchor `A.pri`(stage 하단 중앙·1872) |
| 파쇄자 | windup/advance/stagger/recover 등 5 | **windup**(413~415) | ○ | `bc.kind==='smash'`(sbFigPose 1966~68) | sbFigPose | `.sb-ic-hammer`·`.sb-ic-core`·`.sb-ic-body`·`.sb-shadow` |

- stale 방지 현행: 포즈는 **상태 파생·매 프레임 idempotent 재계산**이라 stale 불가(조건 소멸=다음 프레임 해제). fallback: 조건 불일치=`''`(기본 자세). ≤730px 높이에선 sb 피규어 자체가 꺼지고 이모지 폴백(416~421).
- **병목**: sbFigPose는 전사+파쇄자 하드코딩 함수다. 동료 3인·후속 보스가 이 함수에 if로 계속 들어가면 [원칙 D] 위반 — §10 Pose Map으로 대체한다.

### 5-D. 현행 행동선·FX

| 항목 | 실코드 |
|---|---|
| 좌표 원천(신형·iron) | `sbPt(figId,part,topBias)`(1899): **매 render 파츠 rect 직독**(스냅샷 아님) → transform/포즈/이동 자동 추적([55]·[57] 실증) |
| 좌표 원천(구형·legacy) | `fxAnchors()`(1867): 슬롯/아바타 **중심점** 1회 캐시(resize만 무효화·1875) — [53 §13] "중심점 금지" 위반 상태로 모르가스/심연 선이 아직 사용 · **iron에서는 `#bossAvatar` display:none→rect 0→유령 좌표**였던 것이 [55]가 우회(§20 회귀 사례) |
| 선 생성/제거 | 정적 `<line>` 3개(629: fxBossLine/fxIntLine/fxPriLine) attr 갱신 — 동적 DOM 생성 0. class에서 `on` 제거→CSS transition 페이드(217~218) |
| 강타 관계선(iron) | `sbSmashFx`(1909): 게이트 `CUR_BOSS==='shell_iron'`(1910) → source=`sb-ic-hammer` 상단 12%(1922) / target=`bc.tg` 전사면 `(blk‖sh0)?쉴드:몸통`(1924)·비전사는 `SB_BODY` 맵(1925) / **`on=!!(src&&dst)` — anchor 부재 시 선 숨김·모서리 fallback 0**(1927) / 진행률 0.6↑ `commit` 승급(1929~30) |
| resolve 판정 | 시각 스냅샷 `SB_SM{S,start,end,tg,blk,sh0,absL,aliveL}`(1918) — resolve 3근거 `sm.S===S && t>=sm.end-0.05 && sm.aliveL`(1938)로 **만료 resolve와 차단/전환을 구분** |
| 접촉 분기 | blk×absorb(S.st.abs delta) 4분기 → `sbhit-*` class(1943)·**animationend 자기 정리**(1955) |
| 누출 방지/cleanup | 비-iron 프레임에서 `SB_SM=null·SB_DIRTY→sbHitClear()`(1912) — 보스 전환 격리 실증([55] 검증) |
| 사제 케어선 | `fxBeam(tg,kind)`(1883): 순간 이벤트 구동·A 좌표·460ms 자기 소거 + `figFlash ff-*` / `fxWave`(1890) 파티 플래시 |
| 차단 준비선 | `fxIntLine` rog→boss(1985)·judge cast 중만·낙인 시 `broken` class |
| 광역 데칼 | `#fxAoeDecal`(628·CSS 214) judge cast 중 opacity 토글 — 유일한 Tell 데칼 |
| impact/afterglow | figFlash(460~560ms)·sbhit(애니 수명)·shake/vign — 전부 ≤1.4s 자기 소거 |
| 전투 종료 cleanup | 상태 파생 표현=cast null로 자연 소거·타이머성=만료 자연 소거·접촉 class=animationend·**명시 정리 지점은 newGame(1291~94: 로그/플로팅/endOv)과 sbSmashFx 비-iron 분기** |

### 5-E. 현행 보스 shell 3종

| 항목 | 모르가스(boss01) | 파쇄자(shell_iron) | 심연(shell_thirst) |
|---|---|---|---|
| DOM | `#bossAvatar` 이모지 ☠️(625) | `#sb-boss-fig` 7파츠 피규어(626)·아바타 숨김(373) | `#bossAvatar` 이모지 ☠️ |
| 얼굴/몸 | 이모지 1글자·casting/enr/hitF class | `sb-ic-head/core/body/…`·`--sb-ic-*` 4색·breath 애니 | 이모지 |
| 공통부 | HP바·castWrap·warnBar·enrageTag(전 보스 공유 HUD) | 동일 | 동일 |
| 고유부 | SCRIPT(smash/judge/brand/bomb)·judge 데칼+차단선 | IRON_SCRIPT(smash/blk)·windup 포즈·강타선·접촉 4분기 | ABYSS_SCRIPT(drain)·**고유 시각 0(이모지+로그+shake뿐)** |
| cast/tell | smash/judge cast — castFill+warnBar+(judge)데칼 | smash cast — windup+castFill+강타선 | **cast 없음** — warnBar eta만 |
| source anchor | 없음(아바타 중심점=legacy) | `.sb-ic-hammer`(topBias) | 없음 |
| target rule | smash: war 우선→meleeTgt·judge: 전원 | smash 동일 | drain: 사제 마나+전원 |
| action line | fxBossLine(legacy A.boss)·fxIntLine | fxBossLine 재배선(sbSmashFx) | 없음(fxBossLine은 smash 전용 조건이라 꺼져 있음) |
| result feedback | F 플로팅·FX aoe/smash·shake/vign | + sbhit 4분기 | F·FX('aoe')·shake |
| 전환 cleanup | `sb-boss-iron` 클래스 제거·legacy 경로 복귀 | SB_SM/SB_DIRTY/sbHitClear | 동일(iron 잔재 0 실증 [55][57]) |

**가장 위험한 확장 병목(감사 결론)**: ①sbFigPose가 Actor별 if 하드코딩(직업 추가마다 공통 함수 수정) ②anchor 접근이 3계보(fxAnchors 중심점 캐시 / sbPt 파츠 직독 / SB_BODY 맵)로 분산 ③보스 고유 연출이 `sbSmashFx` 1개뿐이라 등록·수명·게이트가 관례일 뿐 계약이 아님 ④FX 어휘 중의성(aoe)·미처리 이벤트의 암묵 무시 — 이 넷을 §7~§15가 계약으로 전환한다.

## 6. Source of Truth (LOCK)

1. 전투 진실은 **CORE의 `S`(상태)와 `S.ev`(순간)뿐**이다. 무대층은 이 둘 외의 진실을 **MUST NOT** 생성한다(시각 스냅샷·프레임 기억은 진실이 아니라 관측 보조 — `SB_SM` 선례·S에 저장 금지).
2. 준게이트 어댑터 상태(`u.hot`·`u.seed`·`focusArmedUntil` — docs/16B·23)는 **gameplay 진실**이며 무대 입력으로 읽을 수 있으나, 무대층이 변경하면 **MUST NOT**.
3. 수치(피해량·흡수량·시전 시간)는 상태에서 읽는다 — 시각층 하드코딩 **MUST NOT**([53 §23][54 §16]).
4. CORE는 byte-identical 보호(`6cad2ec2…`)를 유지한다. 무대 시스템 어떤 카드도 CORE 개정을 **MUST NOT**(개정은 Boss Core Gate 절차 [30] 별도).

## 7. 계층과 소유권 (10계층)

> 표기: **책임 / 입력 / 출력 / 소유 금지 / 콘텐츠 추가 시 수정 여부**

### 7-1. Combat Truth Layer — LOCK
- 책임: 전투 계산·판정·결과·이벤트 발신. 입력: 플레이어 입력(useSkill/select/cancelCast)·시간. 출력: `S`·`S.ev`.
- 소유 금지: **어떤 시각 개념도 모른다** — 포즈명·class명·selector·anchor명 인지 **MUST NOT**(현행 CORE에 DOM 참조 0 실증).
- 콘텐츠 추가: 새 보스=BOSS_DEFS+SCRIPT 데이터(A안 최소 분기 [30] 선례)·새 스킬=CFG.skills/어댑터. **무대 때문에 수정되는 일은 없다.**

### 7-2. Stage Signal Adapter — PROVISIONAL(구조)·LOCK(원칙)
- 책임: 진실→무대 어휘 번역. **두 채널**: ①**지속 신호** — 매 프레임 S에서 파생(순수 파생·부작용 0) ②**순간 신호** — `drain()` 안에서 이벤트를 tap(기존 소비 로직 무접촉·전달 후 파생).
- 입력: `S`·`S.ev`(tap)·직전 프레임 관측 기억(어댑터 지역 — `SB_SM`/`S.st.abs` delta 패턴 [54 §15]). 출력: 신호 객체(§8).
- 소유 금지: DOM **MUST NOT** 접근(좌표·class 불인지) · gameplay 쓰기 **MUST NOT** · 새 타이머 **MUST NOT**(수명은 상태·진행률에서 파생).
- 콘텐츠 추가: 새 보스/스킬이 **기존 어휘로 표현되면 수정 0** · 새 어휘가 필요하면 **신호 등록부에 항목 추가**(공통 파생 함수의 분기 증식 아님).
- 근거: render/renderFx/sbSmashFx/sbFigPose가 각자 S를 직독 중(실사례 4+) — 번역의 중복·불일치가 이미 존재. 해결하는 것: 읽기 규약 단일화. 해결하지 않는 것: 표현 결정(Director 몫). 유지 비용: 파생 함수 1개+등록부. 과잉 위험: 신호를 이벤트 버스로 키우는 것(⛔ §4).

### 7-3. Stage Director / Resolver — PROVISIONAL
- 책임: 신호를 받아 **누가 무엇을 보여줄지 결정** — Actor별 포즈 결정(§10 Pose Map 조회)·cue 발행/갱신/종료(§13)·우선순위(주연 1 [53 §16])·충돌 중재.
- 입력: 신호(§8)·profile(§10·§15). 출력: 포즈 지시·cue 목록.
- 소유 금지: 계산 결과 변경 **MUST NOT** · DOM 직접 쓰기 **MUST NOT**(Presenter 경유) · **jobId/bossId별 if 연쇄 MUST NOT** — 결정은 profile 데이터 조회 + 등록된 handler 위임으로만.
- 콘텐츠 추가: **수정 0이 목표** — profile 등록으로 해결. 공통 결정 규칙(우선순위 등) 변경만 이 계층 수정.

### 7-4. Actor Registry — PROVISIONAL(구조)·LOCK(방향)
- 책임: actorId→profile 색인. `SB_BODY`(1898)가 원형(실사례) — 이를 §10 Actor Profile로 확장.
- 입력: 정적 데이터. 출력: profile 조회.
- 소유 금지: 로직 **MUST NOT**(순수 데이터+resolver 함수 참조만).
- 콘텐츠 추가: **새 직업/보스 = 등록 1건 추가**. 기존 항목 무수정.

### 7-5. Pose Vocabulary / Pose Map — §10에서 상세.
### 7-6. Anchor Registry — §12에서 상세.
### 7-7. Stage Cue / Effect Grammar — §13·§14에서 상세.

### 7-8. DOM Presenter — LOCK(현행 패턴 유지)
- 책임: 결정된 표현을 DOM에 반영. **idempotent 쓰기만**(`sT/sH/sW/sC` 캐시 패턴·attr 비교 후 교체 — 전부 현행 실증).
- 입력: 포즈 지시·cue·좌표. 출력: class/attr/style.
- 소유 금지: 상태 판단 **MUST NOT**(받은 것을 그대로 반영) · gameplay 읽기 SHOULD NOT(경계 위반의 시작).
- 콘텐츠 추가: 새 visualKind(§14)가 생길 때만 presenter 함수 추가.

### 7-9. Cleanup / Reset Boundary — §19에서 상세.
### 7-10. Debug / Observation Boundary — §23에서 상세.

**gameplay↔stage 경계 총칙(LOCK)**: (A) gameplay는 visual pose 이름을 **MUST NOT** 안다(현행 CORE 실증). (B) Stage는 gameplay를 읽되 결과 변경 **MUST NOT**. (C) visual 때문에 가짜 gameplay state/timer 추가 **MUST NOT**(`SB_SM`을 S 밖에 둔 [55] 선례가 헌법). (D) 공통 renderer/resolver에 id별 if 증식 **MUST NOT**(§16). (E) DOM selector는 registry/adapter 경계 안으로(§12). (F) 실존 상태만 번역(F=[54] 감사 원칙). (G) 미지 신호·부재 anchor=안전 fallback+cleanup(§20). (H) 보스 고유 연출은 공통 lifecycle·정리 계약 하에 허용(§15). (I·J) 과잉 일반화 금지·2실사례 규칙(§4).

## 8. Stage Signal 계약

**정의(LOCK)**: Stage Signal은 **새 gameplay 이벤트가 아니라, 기존 진실의 시각층 번역이다.** 모든 신호는 ①근거 상태/이벤트(실코드) ②종류(지속/순간) ③source/target ④수명 종결 조건 ⑤fallback을 등록부에 갖는다. **근거 없는 신호 등록 MUST NOT**([54] "없는 것은 없다").

### 8-1. 신호 등록부 v1 — 전부 현행 실코드 근거 (LOCK=근거·PROVISIONAL=명칭)

**지속 신호** (매 프레임 S 파생 · 수명=조건 지속 · fallback=조건 소멸 시 자동 해제):

| 신호 | 의미 | 근거(실코드) | source/target | 종결 |
|---|---|---|---|---|
| `bossActionTelling` | 보스 행동 예고 중(진행률·이름·차단가능·대상·blk) | `S.boss.cast{kind,start,end,tg,blk,un}` | boss → tg(있으면) | cast null |
| `bossActionCommitted` | 예고 후반 확정 국면 | 진행률 ≥0.6 — sbSmashFx `pr>=0.6`(1930) 선례 | 동일 | cast null |
| `nextActionEta` | 다음 스크립트 행동·남은 초 | `nextPattern()`(1209) | boss | 스크립트 소진 |
| `enraged` / `valorActive` | 광폭화 / 전투의지 창 | `S.boss.enraged`·`t<S.valorUntil` | boss / party | 전투 종료 / 만료 |
| `shielded(u)` | 보호막 보유(잔량·만료) | `u.shield{amt,end}` | 사제→u (귀속) | null(파괴·만료) |
| `branded(u)`·`bombed(u)` | 낙인/폭탄 보유(남은 초) | `u.debuffs[]` k별 | boss→u | 만료·정화 |
| `sustained(u)` | 소생/씨앗 지속 케어 | `u.hot`·`u.seed`(어댑터 진실) | 사제→u | 만료·소진 |
| `interruptStance` | 차단 준비/재정비/불능 | `S.intReady`·rog alive·enraged·un(현행 intBar 로직 2045) | rog→boss | 상태 변화 |
| `priestCasting` | 사제 시전(이름·진행률) | `p.cast{name,end,dur}` | pri→tg | null(완료·취소) |
| `gcdLocked`·`cooldown(k)`·`insufficient(k)` | 명령 잠금/개별 CD/자원 부족 | `t<p.gcd`·cdDispel/cdPray/shieldLock·mana/holy | pri | 조건 소멸 |
| `selected(u)`·`aliveState(u)`·`hpDanger(u)` | 선택/생존/위험(≦35%·15%) | `S.sel`·`u.alive`·hp 비율(현행 render 2024~26) | u | 조건 소멸 |
| `battleOver` | 종료(결과 종류) | `S.over`·`S.result` | — | newGame |

**순간 신호** (S.ev tap 또는 프레임 전이 파생 · 수명=one-shot·표현 자기 소거 · fallback=미지 kind는 no-op):

| 신호 | 의미 | 근거 |
|---|---|---|
| `actionResolved` | 보스 행동이 **만료로** 착지 | cast 있음→없음 전이 + `t>=end-0.05`(sbSmashFx 1938 — 3근거 판별) |
| `actionInterrupted` | 차단으로 끊김 | 동일 전이 + `t<end` + `FX('intOk')` 동반 — judge만 |
| `castCancelled` | 사제 자발 취소 | p.cast 전이 + `cancelCast` 로그 — resolve 아님 |
| `contact(kind,tg)` | 실제 타격 순간 | `FX('smash'/'melee'/'aoe'/'bombBoom')` — ★`aoe`는 judge/drain 중의(보스 문맥 필수 §5-A) |
| `absorbOccurred(tg)` | 이번 tick 흡수 발생 | `S.st.abs` 프레임 delta(1939 선례) — 정밀값 아님 |
| `blocked(tg)` | 각본 방패 막기 | resolve 시 `sm.blk`([54 §17-0] — shield와 별개 신호·병존 가능) |
| `careLanded(kind,tg)` | 치유/보호막/정화/기도 착지 | `FX('heal'/'shield'/'dispel'/'pray')` |
| `rescued(tg)`·`died(tg)` | 구원 발동/사망 | `FX('save')`·`FX('death')` |
| `interruptResolved(ok)` | 차단 성공/실패 | `FX('intOk'/'intFail')` |
| `statusApplied(tg)` | 디버프 부여 | `FX('debuff')` |
| `battleStarted/Won/Lost` | 시작/승패 | `FX('start'/'win'/'lose')`·`y:'end'` |

### 8-2. 발주 후보 어휘와의 대조 (LOCK)

ready→`interruptStance`/잠금 해제 계열로 흡수 · prepare/tell→`bossActionTelling` · commit→`bossActionCommitted` · contact/hit→`contact` · protected→`shielded`+`blocked`(**둘은 병존 가능한 별개** [54 §17-0]) · interrupted→`actionInterrupted`(judge만) · cleansed→`careLanded(dispel)` · rescue→`rescued` · sustain→`sustained` · recover→포즈 기본 복귀(신호 아님 — §9 Recover) · defeated→`died`/`battleOver`. **channel·approach는 근거 상태가 없어 미등록(EXTENSION** — 채널/이동 기전이 CORE에 생기면 그때 등록).

### 8-3. 충돌·우선순위·동시성 (LOCK)

- 보스 cue 슬롯은 진실상 **1개**(`S.boss.cast` 단일) — 보스 연출 동시 2개를 가정하는 설계 MUST NOT.
- Actor별 지속 신호는 **병존**한다(shielded+branded 동시 가능 — chips가 이미 다중 표시). 포즈는 §10 우선순위로 1개 선출.
- 화면 우선순위는 [53 §16] 계승: ①보스 핵심 예고 ②플레이어의 방어/차단 관계 ③충돌 결과 ④지속 지원 ⑤잔광.
- 미지 신호 fallback: **조용한 no-op**(doFx 미처리 kind 선례) + dev 관측 경고(§23)로만 노출.

## 9. Stage Phase — 무대 호흡 헌법 (LOCK)

표현 문법 6단계는 [53 §12](Intent→Tell→Commit→Travel→Contact→Resolve)를 **계승**한다. 본 헌법은 그것을 **runtime cue 수명**으로 번역한다:

```
IDLE → TELL → COMMIT → CONTACT → AFTERGLOW → IDLE
```

| phase | 근거 | 생략 |
|---|---|---|
| TELL | cast 존재(진행률<0.6) — windup 포즈+castFill+관계선 on | cast 없는 행동(멜레·drain)은 TELL 생략 가능 |
| COMMIT | 진행률≥0.6(1930 선례) — 선 굵기/명도 승급 | 짧은 행동은 TELL=COMMIT 통합 MAY |
| CONTACT | resolve 순간 신호 — 가장 짧고 명확([53 §10]) | 미스(대상 사망)면 생략 |
| AFTERGLOW | CONTACT 직후 자기 소거 표현(≤0.6s — figFlash 460/sbhit 애니 수명 선례) | 결과 없는 행동은 생략 |
| Intent | 포즈 변화로 흡수(별도 phase 아님 — sbFigPose가 TELL과 동시) | — |
| Travel | **현재 이동 기전 0 — EXTENSION**(투사체 도입 시) | — |
| Recover | CONTACT/취소 후 포즈·표현의 기본 복귀 — **상태 파생이므로 자동**(다음 프레임 조건 소멸) | — |

**최소 유효 lifecycle(LOCK)**: `CONTACT 단독`(즉발 사건 — melee/drain/폭발) 또는 `TELL→(CONTACT|중단)`. TELL만 있고 어떤 종결도 없는 cue는 **MUST NOT**(stale의 정의).

**사건별 진행(현행 실사례·후속 포함)**:
- 짧은 행동(멜레·즉시 힐): CONTACT(+AFTERGLOW). 긴 cast(강타·심판·강력 치유): TELL→COMMIT→CONTACT→AFTERGLOW.
- channel: EXTENSION(기전 없음). interrupt: TELL(차단 준비선)→`interruptResolved` 순간 CONTACT(절단)→보스 cue는 **중단 정리**(아래).
- shield block/absorb: CONTACT의 분기 표현([54 §17-0] 세 신호 분리 — blk/absorb/직격을 합치거나 누락 MUST NOT).
- cleanse/heal: careLanded 순간 CONTACT(수습 임펄스 [41 §I-6]). drain: **TELL 없음이 현행 진실** — warnBar eta가 유일 예고. 무대 Tell을 추가하려면 `nextActionEta` 기반 low-key 예고만 MAY(§15-C·패턴 시간 변경 ⛔).
- boss heavy attack: 강타 문법([53 §22]) 그대로. actor death: `died` 순간 → 해당 Actor의 모든 cue 즉시 정리+dead 표현(현행 sa-* dead·ring 소등 1991).
- battle end: `battleOver` → **신규 cue 발행 정지 + 진행 중 cue는 AFTERGLOW 없이 종결 + 자기 소거 타이머는 만료 방치 허용(≤1.4s 실증)**.

**취소·정리 매트릭스(LOCK)**:

| 상황 | 진실 근거 | 규칙 |
|---|---|---|
| 사제 cast 취소 | `cancelCast`(938) — p.cast null·resolve 아님 | cue는 CONTACT 없이 IDLE. 잔광 MUST NOT |
| 차단 성공 | `tryInterrupt`(1074) — boss.cast null·`t<end` | TELL cue 즉시 정리. CONTACT는 intOk 절단 임펄스가 담당. **만료 resolve로 오인 MUST NOT**(3근거 판별 1938) |
| target 사망 | resolve의 `tg.alive` 재확인(1087 미스) | CONTACT 억제('허공' — 현행 로그 선례). TELL 중 사망 시 관계선은 대상 소실로 숨김(`on=!!(src&&dst)`) |
| 보스 전환 | `newGame`(1280)·`CUR_BOSS`·`sb-boss-iron` 토글(1290) | **전환 프레임에 모든 무대 잔재 0** — SB_SM/SB_DIRTY/sbHitClear(1912) 선례를 모든 cue로 일반화 |
| battle end | `S.over` | 위 battle end 규칙 |
| 새 cue가 이전 cue를 덮음 | `S.boss.cast` 단일 슬롯·`SB_SM.start!==bc.start` 재초기화(1916) | 같은 소유 슬롯의 새 cue=이전 cue 교체(정리 후 시작). 교체 시 이전 잔광 강제 소거 SHOULD |
| 두 Actor 동시 행동 | allyAtk 다발+보스 cast 병존이 일상 | 병존 허용·주연 1 원칙으로 강도 차등([53 §16]) — 서로의 cue를 지우면 MUST NOT |

## 10. Actor Pose System 헌법

### 10-1. Actor Profile (PROVISIONAL — 구조는 첫 foundation 카드에서 검증)

```js
/* 개념 스키마 — 본 카드 구현 ⛔ */
ACTOR_PROFILES = {
 war: {
  actorId:'war', jobId:'war', figureType:'sb-warrior', figId:'sb-war-fig',
  availablePoses:['guard','brace'],            // runtime CSS 실존만 — 프리뷰 확보분은 후보 명단으로 별도 표기
  candidatePoses:['resolve'],                   // [43] 확보·CSS 미이식
  defaultPose:'',                               // 빈 값 = 기본 자세(현행 규약)
  signalToPose:[                                // 위→아래 = 우선순위(첫 일치 선출)
   {signal:'shielded',      pose:'guard'},      // 현행 sbFigPose 1971 로직의 데이터화
   {signal:'bossActionTelling', filter:{kind:'smash'}, pose:'brace'}
  ],
  anchors:{ body:'sb-w-body', shield:'sb-w-shield', weapon:'sb-w-sword', ground:'sb-shadow' },
  fallbackPose:''                               // 미지 신호·조건 불일치 → 기본 자세
 },
 rog:{ …, availablePoses:[], candidatePoses:['interrupt','dash','strike','recover'] /*[51]*/ },
 mage:{…}, sham:{…}
}
```

- 예시 데이터는 **현행 확보 포즈([43][51]·§5-C)** 를 사용한다. runtime 연결은 본 카드에서 하지 않는다(⛔).

### 10-2. Pose 정의 (LOCK=원칙 · PROVISIONAL=필드 상세)

pose 항목: id / 의미(행위 1개 [53 §6]) / 대응 phase / duration policy(**상태 파생=조건 지속** — one-shot 포즈는 animationend 수명만 MAY·타이머 MUST NOT) / interruptibility(더 높은 우선순위 신호에 즉시 양보) / compatible signals / required DOM parts(부재 시 이 포즈 사용 불가→fallback) / fallback.

### 10-3. 규칙 (LOCK)

1. **공통 어휘 vs 고유 포즈**: 공통 pose 어휘(guard/brace/windup 등 의미 축)는 이름을 공유하되, **구현(CSS)은 Actor별**이다. 새 직업이 공통 어휘 중 일부만 구현해도 된다 — 없는 포즈는 fallback.
2. **없는 pose fallback**: signalToPose가 선출한 pose가 availablePoses에 없으면 `defaultPose('')`. **에러·빈 class 잔존 MUST NOT**(현행 `''` 규약).
3. **다중 신호 우선순위**: signalToPose 배열 순서=우선순위. 첫 일치 1개만 선출(전사 guard>brace 현행 순서가 선례 — 보호막 중 강타가 와도 guard 유지).
4. **stale 방지**: 포즈는 **매 프레임 상태에서 재계산·idempotent 속성 교체**(sbFigPose 방식) — 신호가 사라지면 다음 프레임 자동 복귀. one-shot 계열만 animationend(§19).
5. **reset**: battle 시작/종료/보스 전환 시 `data-pose=''` 보장 — 상태 파생이므로 자동이나, 전환 프레임의 명시 초기화 SHOULD(§19).
6. **역영향 차단**: 포즈·class를 gameplay가 읽으면 **MUST NOT**(현행 실증: CORE에 DOM 참조 0). 포즈 transform이 판정에 쓰이는 좌표를 만들면 MUST NOT(판정은 CORE에 좌표 개념 자체가 없음 — 유지).
7. **새 직업 최소 데이터**: profile 1건(figId·파츠·anchors·availablePoses·signalToPose)+피규어 CSS. **공통 resolver/렌더러 수정 0**([60 §B]의 DoD).
8. **`data-pose` 속성은 Pose 시스템 단독 소유** — 제3 코드가 같은 속성에 값을 넣으면 매 프레임 덮인다([54 §13]) — 다른 표현은 별도 class/attr 사용 MUST.

## 11. (예약) — 본 헌법의 Anchor 조항은 §12로 통합

*(발주 ■7의 계층 번호와 ■11 Anchor Registry 요구를 §12 하나로 합쳤다 — 계층표 §7-6 참조.)*

## 12. Anchor Registry 헌법

### 12-1. 원칙 (LOCK)

1. **의미 이름으로 조회한다**: `anchor(actorId,'weapon')` — 호출부에 selector 직서 MUST NOT. 의미 어휘(현행 실존+[53 §13] 후보): body/head/core/weapon/shield/hand/orb/totem/intake/ground/protectionFront/centerMass/party(가상)/pri(가상).
2. **DOM resolver는 registry 데이터**: `{figId, partClass, bias}` → 좌표 계산은 공통 함수 1개(현행 `sbPt` 1899가 그 원형 — viewport rect→stage 상대 변환 `r.left-sr.left…` 규약 유지).
3. **매 사용 시점 rect 직독이 기본**(스냅샷 금지) — 포즈/transform/scale/flip을 자동 추적([55]·[57] 실증). 캐시는 성능 실측 후에만 PROVISIONAL(§22).
4. **부재·무효 fallback(LOCK — 회귀 사례 봉인)**: 요소 없음·`display:none`·zero rect → **null 반환 → 사용측은 표현을 숨긴다**(`on=!!(src&&dst)` 1927). **(0,0)·모서리 좌표로 퇴화 MUST NOT.** 근거 회귀 사례: 구 `fxAnchors`가 shell_iron에서 숨겨진 `#bossAvatar`의 0-rect를 그대로 써 **화면 좌상단 유령 행동선**이 실기 화면에 그려졌던 결함([54 §10 ★★] → [55]가 수정). 이 사례는 **모든 후속 anchor 구현의 필수 회귀 체크 항목**이다.
5. **pseudo-element는 anchor가 될 수 없다**(rect 불가 — 망치 머리 `::before` [54 §10]). 근사(자루 rect+bias — 현행 topBias 0.12)를 registry 데이터로 명시하거나, anchor용 실제 element 추가를 **카드 범위에 명시 후** 승인받는다.
6. **좌표계**: stage 상대 px(#fxSvg viewBox 없음=stage px [54 §11]). viewport→stage 변환은 resolver 단독 책임 — 호출부가 좌표 보정 MUST NOT("배치 transform과 anchor 계산 책임을 섞지 않는다" [53 §13-⑧]).
7. **보스 전환 cleanup**: 전환 프레임에 이전 보스 anchor 참조로 그린 표현이 남으면 MUST NOT(§19). legacy `fxAnchors` 캐시(resize만 무효화 — 모르가스 스테일 위험 [54 §19])는 **격리 상태로 유지하다 [61] Anchor 카드에서 대체**한다 — 그 전까지 iron 외 보스에서만 사용 MAY.
8. **가상 anchor 허용**: DOM이 없는 의미점(사제=stage 하단 중앙 `A.pri` 1872 실존·party=#stageAllies rect [54 §15])은 registry에 **가상 resolver로 등록** — 호출부는 실/가상을 구분하지 않는다.

### 12-2. 목표 구조 (PROVISIONAL)

새 보스/직업 추가 시 **generic line renderer에 selector를 추가하지 않고 profile의 anchors 등록만으로 해결**된다. `SB_BODY`(4직업 body 맵)와 sbSmashFx 내 인라인 selector('sb-ic-hammer'·'sb-w-shield')는 registry로 수렴할 1차 대상(실사례 2+ 충족).

## 13. Stage Cue 계약 (PROVISIONAL — 필드 상세는 첫 FX 카드에서 검증)

Cue = "무대에서 지금 보여줄 관계/사건 1건"의 선언 데이터.

```
cue { cueId, intent(공격/보호/차단/수습/흡수/예고), phase(§9),
      sourceActor, sourceAnchor, targetActor, targetAnchor,
      visualKind(§14), timing(근거 상태의 start/end 또는 순간),
      priority([53 §16] 5순위), interruptPolicy(§9 매트릭스),
      cleanupPolicy(상태소멸|animationend|자기소거≤0.6s),
      fallback(anchor null→숨김·미지 kind→no-op), owner(boss|job|skill id) }
```

- **timing은 진실에서 파생 MUST**(cast start/end·순간 이벤트) — cue 자체 타이머 신설 MUST NOT(현행: 강타선 수명=cast 수명 실증).
- **owner 필수**: 정리·회귀 추적의 단위(보스 전환 시 owner=boss cue 전부 정리).
- 현행 실사례 대응: 강타 관계선=`{intent:공격, TELL~CONTACT, boss.weapon→war.shield|body, line, cast 수명}` · 케어 비임=`{intent:수습, CONTACT, pri→tg, healArc(현 fxPri), 자기소거 460ms}` · 차단 준비선=`{intent:차단, TELL, rog.weapon→boss.core, line}` · judge 데칼=`{intent:예고, TELL, ground(중앙), decal}`.

## 14. FX / 행동선 경계 — 표현 어휘와 하드코딩 규칙

### 14-1. visualKind 어휘 (LOCK=분류 · EXTENSION=미구현 kind)

`line`(관계·실존) / `impact`(결과 순간·실존: figFlash·sbhit) / `decal`(위험 공간·실존: fxAoeDecal) / `pulse`(파동·실존: fxWave) / `healArc`(수습·실존: fxPri) / `shieldContact`(보호층 접촉·실존: sbhit-blk/abs) / `afterglow`(잔광·실존: 페이드) / `ribbon`·`drain`(EXTENSION — 심연 카드 [53 §25]).

**핵심 문장의 구현 경계 번역(LOCK)**: `포즈는 행위`=Actor 자신의 data-pose(관계 정보 없음 — target을 가리키지 않는다) / `데칼은 위험 공간`=ground 계열 anchor의 영역 표시(source→target 방향성 없음) / `행동선은 관계`=source anchor→target anchor 2점 연결(**2점이 없으면 선도 없다** — anchor null=숨김) / `임펄스는 결과`=CONTACT 순간의 자기 소거 표현(계산 결과와 같은 tick — 시각이 결과를 선행 MUST NOT [53 §12]). **한 표현이 두 역할을 겸하면(포즈가 관계를 그리거나 선이 결과를 확정하면) 문법 위반이다.**

### 14-2. 허용되는 하드코딩 (LOCK · 현행 실사례 연결)

| 허용 | 현행 실사례 |
|---|---|
| 콘텐츠별 pose map **데이터** | signalToPose 배열(§10) — sbFigPose 로직의 데이터화 |
| 보스별 얼굴/파츠 **CSS** | `sb-ic-*` 7파츠·`--sb-ic-*` 4색(현행) |
| 직업별 강조색 **CSS 변수** | `--sb-w/r/m/s-*`([52] 채택색) |
| 스킬별 Stage Cue **정의(데이터)** | doFx의 kind별 케이스·fxBeam kind(heal/shield/dispel/save) — 등록부로 이관될 데이터 |
| **등록된** 고유 보스 FX handler | `sbSmashFx` — 게이트+수명+정리를 갖춘 함수(§15-D 계약 준수 시 정당) |
| 고유 타이밍·시각 표현 상수(CSS) | commit 0.6·잔광 ≤0.6s·breath 주기 — 표현층 상수는 CSS/표현 데이터에 MAY |

### 14-3. 금지되는 하드코딩 (LOCK · ⛔ · 현행 사례 연결)

| 금지 | 근거·현행 대조 |
|---|---|
| generic renderer 내부 bossId 연쇄 분기 | 현행 위반 0(유일 분기 `sbSmashFx` 게이트는 **handler 진입 게이트**라 정당) — renderFx에 `if(CUR_BOSS==='x')…else if…`가 자라기 시작하면 위반. 보스 추가=profile/handler 등록으로 |
| generic pose resolver 내부 jobId 연쇄 분기 | **현행 sbFigPose가 잠재 위반 형태**(war 하드코딩) — 동료 확장 전에 §10 데이터화가 선행 조건([61] F2) |
| gameplay가 CSS class를 읽음 | 현행 위반 0 — 유지 MUST |
| gameplay 상태에 visual-only flag | 현행 위반 0(`SB_SM`을 S 밖에 둔 선례) — 유지 MUST |
| 스킬마다 임의 setTimeout 산포 | 현행 fxBeam(460)/fxWave(560)는 **한계 내 선례**(≤0.6s·자기소거·상태 무접촉)로 봉인 — **신규는 상태 수명 또는 animationend 우선**(sbhit 선례) SHOULD·1s 초과·정리 없는 타이머 MUST NOT |
| anchor selector를 여러 함수에 중복 직서 | **현행 부채**: fxAnchors/sbPt 호출부/SB_BODY 3계보 — [61] F3이 registry로 수렴 |
| 전투 종료 후 잔존 visual timer/class | sbHitClear+animationend+비-iron 정리(1912) 선례를 계약으로: **모든 순간 표현은 소유자와 정리 경로 명시 MUST** |
| 없는 DOM을 (0,0)으로 쓰는 fallback | ⛔⛔ — §12-1-4 유령 좌표 회귀 사례 |

## 15. Boss Stage Profile 헌법

### 15-A. 구조 (PROVISIONAL)

```
BOSS_STAGE_PROFILES[bossId] = {
 bossId, figureShell(sb-클래스|'avatar'),      // 현행: iron='sb-iron-crusher'·모르가스/심연='avatar'(이모지)
 face/core 파츠 목록, poses+signalToPose,
 anchors{weapon/core/body/ground/intake…},
 abilityStageMaps: { smash:{cue…}, judge:{cue…}, drain:{cue…} },   // SCRIPT 어휘(e:)와 1:1
 tellRules(무엇으로 예고하나), targetRules(진실의 tg 규칙 그대로 표기 — 재정의 금지),
 contactRules(결과 분기 — iron 3신호 등), resolveRules(만료/차단/미스 구분),
 uniqueEffects(등록된 고유 handler 참조), fallback(shell 부재→avatar·anchor 부재→숨김),
 cleanup(전환 시 정리 목록)
}
```

### 15-B. 3보스 대조 — 공통 template / 보스 데이터 / 고유 handler (LOCK)

| 구분 | 내용 |
|---|---|
| **공통 template**(전 보스 동일 코드) | HUD(HP·castFill·warnBar·enrageTag)·cue lifecycle(§9)·resolve 3근거 판별·anchor resolver·정리 경계(§19)·게이트 규약·이모지 avatar fallback(≤730 실증) |
| **보스 데이터**(profile) | shell 클래스·파츠·4색·포즈맵·anchor맵·ability→cue 맵·tell/target/contact 규칙 표기 |
| **고유 handler**(등록 함수) | iron: 접촉 3신호 분기(blk×absorb — 상태 조합 판정이 데이터로 안 됨) · 모르가스(후속): 꼬인 실 렌더러([53 §24]) · 심연(후속): drain ribbon(target→intake 역방향 [53 §25]) |

- **파쇄자**: weapon(hammer)·heavy attack(smash)·target=war 우선(진실 1018)·contact=blk/absorb/body 3신호([54 §17-0]) — **template+데이터+handler 전 구성의 실증 원형**.
- **모르가스**: cast source=avatar 중심(legacy)→후속 figure 카드에서 cast/mask anchor로 · Actor↔Actor 꼬임 관계(brand)=EXTENSION 문법 · mark/cleanse/cut 해소=careLanded(dispel)+interruptResolved 순간 신호 실존.
- **심연**: intake/core anchor=figure 카드에서 신설 · **drain은 cast 없는 즉발**(§5-A) — target→boss 역방향 ribbon은 CONTACT+AFTERGLOW로 표현(TELL은 nextActionEta 기반 low-key만 MAY) · absorb/consumption 해소=마나 소실 로그+aoe 순간 신호 실존.

### 15-C. 고유 연출 계약 (LOCK)

보스 고유 연출 코드는 금지 대상이 아니다. 다만 **MUST**: ①profile에 등록(uniqueEffects 참조) ②공통 lifecycle(§9 phase·취소 매트릭스) 준수 ③anchor는 registry 경유 ④cleanup 목록 명시(전환 격리 — sbSmashFx 비-iron 정리 선례) ⑤fallback(§20) ⑥보스 게이트(kind 공유 함정 — smash는 모르가스에도 [54 §4]) ⑦gameplay 무접촉. 이 7계약을 지키면 내부 표현은 자유(MAY).

## 16. 공통 코드 수정 경계 (LOCK)

- 새 보스/직업/스킬 추가 시 **수정 가능**: profile/등록부/CSS(콘텐츠 소유분)·해당 콘텐츠의 고유 handler.
- **수정 금지(콘텐츠 추가를 이유로)**: CORE·Signal Adapter 파생 함수·Director 결정 규칙·anchor resolver·presenter·정리 경계. 이들의 수정은 "공통 규칙 자체의 개정"으로만 별도 카드에서(2실사례 규칙 §4).

## 17. Priority (LOCK)

[53 §16] 5순위를 cue.priority의 정본으로 채용: ①즉시 위험/보스 핵심 예고 ②플레이어가 방금 만든 방어·차단 관계 ③실제 충돌 결과 ④지속 지원 상태 ⑤장식성 잔광. 동순위 충돌은 **나중 발생 우선**(새 사건이 주연). 낮은 순위는 제거가 아니라 **강도 후퇴**(현행: aoe 중 ring이 fr-aoe로 낮게 유지되는 선례).

## 18. Cancellation (LOCK)

§9 취소·정리 매트릭스가 정본. 핵심 3판별을 재확인: **만료 resolve**(`t>=end-0.05`)·**차단**(전이+`t<end`+intOk)·**자발 취소**(p.cast 전이+로그) — 세 종결은 서로 다른 표현을 갖거나 표현을 갖지 않을 수 있으나, **서로 오인하면 MUST NOT**(sbSmashFx 3근거 판별이 선례이자 최소 기준).

## 19. Cleanup / Reset Boundary (LOCK)

1. **정리 트리거 4종**: 전투 종료(S.over)·보스 전환(newGame/CUR_BOSS)·화면 이탈(showScreen≠battle)·Actor 사망.
2. **소유자 없는 잔재 금지**: 모든 순간성 class/타이머/선은 ①상태 파생(조건 소멸=자동 해제 — 기본) ②animationend(sbhit 선례) ③자기 소거 타이머(≤1.4s 현행 최장·신규는 ≤0.6s SHOULD) 중 하나의 **명시된 정리 경로**를 가진다.
3. **보스 전환 격리**: 전환 프레임에 이전 보스의 cue·class·선·snapshot 전부 0 — `SB_SM=null; SB_DIRTY→sbHitClear()`(1912) 패턴을 owner별 cleanup 목록으로 일반화(§15-C-④).
4. **rAF는 계속 돈다**(전투 밖에서도 frame 루프 유지·acc=0) — 정리를 "루프 정지"에 의존 MUST NOT.
5. 검증 기준: 전투 종료/전환 후 **1.5s 시점에 stale class·활성 타이머·on 선·잔광 0**([55] 검증 방식 계승 — [60] 사이클 필수 체크).

## 20. Fallback (LOCK)

| 상황 | 규칙 | 근거 선례 |
|---|---|---|
| 미지 신호/이벤트 kind | 조용한 no-op(+dev 관측 로그) | doFx 미처리 kind 무시(§5-A) |
| 부재 anchor·zero rect | null→표현 숨김. (0,0) 퇴화 ⛔ | `on=!!(src&&dst)`·유령 좌표 회귀 사례(§12-1-4) |
| 없는 pose | defaultPose('') | sbFigPose `''` 규약 |
| 없는 shell | 이모지 avatar 폴백 | ≤730px 폴백 실증(416~421) |
| profile 미등록 actor/boss | 무대 연출 생략(HUD·카드·로그는 항상 동작 — 정보는 UI가 담보 [53 §17]) | 심연이 현재 그 상태로 FINAL PASS(연출 없는 보스도 성립) |
| DOM 부재(id 미존재) | presenter null 가드 후 무시 | `if(!e)return` 관례(fxLn 1877 등) |

## 21. 허용/금지 Hardcoding — §14-2·§14-3이 정본 (요약 색인)

허용: 콘텐츠 데이터(포즈맵·파츠 CSS·4색·cue 정의)·등록된 고유 handler·CSS 표현 상수. 금지: 공통 코드의 id 연쇄 분기·gameplay↔visual 역참조·visual-only gameplay state·무소유 타이머/class·selector 산포·(0,0) fallback.

## 22. 모바일·성능 제약 (LOCK=원칙·PROVISIONAL=수치)

- 기준 뷰포트 **390×844**(+375/430 보조) — overflow 0·console 0은 모든 카드의 게이트(현행 전 카드 실증).
- 단일 rAF 루프 유지 — 무대층 별도 루프/interval MUST NOT.
- DOM 쓰기는 idempotent 캐시 경유(sT/sC/sW/sH·attr 비교) MUST — 매 프레임 무조건 쓰기 금지(현행 규약).
- rect 직독은 파츠 2~3개 수준에서 60fps 실증([55]·[57]) — anchor 수가 늘 때 프레임당 rect 조회 상한/공유(같은 프레임 내 중복 조회 1회화)는 **첫 registry 카드에서 실측 후 잠금**(PROVISIONAL).
- 폰 실기(나라님 기기)가 최종 게이트 — pane/헤드리스는 보조([58] 원칙).
- ≤730px 높이 폴백(sb 피규어→이모지) 유지 — 새 연출도 이 폴백에서 안전(연출 대상 부재=숨김)해야 MUST.

## 23. Debug / Observation Boundary

- 현행: `window.__seedHealer`(1549 — CFG/SCRIPT/createGame/SAVE/go/smoke)·`smoke(bossId)` 결정론 재현·frozen-tab에서 `G.step(0.05)` 수동 구동+render() 강제 호출로 실엔진 검증([55]~[57] 확립 기법)·헤드리스 캡처 래퍼(rAF freeze+상태 고정 [57 §7]).
- PROVISIONAL: Signal Adapter 도입 시 **관측 전용 tap**(`__seedHealer.stage` 네임스페이스 아래 신호 스냅샷 조회·미지 신호 경고 카운트) — 읽기 전용 MUST·production 동작 무영향 MUST·smoke 결과 무영향 MUST.
- 관측이 gameplay/presenter에 side effect를 가지면 MUST NOT.

## 24. 검증 전략 (LOCK)

1. **모든 무대 카드 공통**: 신규 체크(문서 문자열이 아니라 **실코드 selector/함수 교차검증** — 기존 체크 관례)·기존 전체 체크·baseline·**3보스 smoke 동일**(무대층이 smoke 결과를 바꾸면 그 자체가 경계 위반의 증거)·390×844 overflow 0·console 0·CORE byte-identical.
2. **document-only 카드**: index.html 시작=종료 byte-identical.
3. **구현 카드**: 재-baseline+live pin 갱신(관례)·pane 실엔진 검증(G.step)·전환 격리 검증(모르가스/심연 왕복)·stale 0 검증(§19-5)·유령 좌표 회귀 체크(§12-1-4)·Human Gate([60]).
4. **기존 assertion 삭제·완화 ⛔** — 직접 충돌하는 정확값만 승계 절차([57 §8] 관례)로.

## 25. LOCK / PROVISIONAL / EXTENSION 총괄표

| 등급 | 항목 |
|---|---|
| **LOCK** | 검증된 전제 3(§2) · 비목표·2실사례 규칙(§4) · source of truth(§6) · 계층 소유권 총칙(§7 A~J) · 신호=번역 정의·근거 없는 신호 금지·미지 신호 no-op(§8) · phase 최소 lifecycle·취소 매트릭스·3종결 판별(§9·§18) · 포즈 8규칙(§10-3) · anchor 8원칙·유령 좌표 봉인(§12-1) · visualKind 4역할 경계(§14-1) · 허용/금지 hardcoding(§14-2/3) · 보스 공통/데이터/handler 3분(§15-B)·고유 handler 7계약(§15-C) · 공통 코드 수정 경계(§16) · priority(§17) · cleanup 5규칙(§19) · fallback 표(§20) · 모바일 원칙(§22) · 검증 전략(§24) · DoD(§26) |
| **PROVISIONAL** | Signal Adapter 구체 구조·신호 명칭(§7-2·§8-1) · Director/Registry 구현 형태(§7-3/4) · Actor Profile/Pose 필드 상세(§10-1/2) · Anchor Registry 데이터 구조·rect 조회 상한(§12-2·§22) · Cue 필드(§13) · debug tap(§23) — **각각 [61]의 지정 카드에서 검증 후 잠금** |
| **EXTENSION** | channel/approach/Travel(기전 없음 §8-2·§9) · ribbon/drain kind(§14-1) · 모르가스 꼬임 실·심연 intake(§15-B) · 7동료 확장([41 §G]) · 데칼 확장·party field anchor · 신규 보스 어휘(SCRIPT e: 추가 시 신호 등록) |

## 26. Definition of Done (LOCK — 발주 §16 후보를 실코드 기준으로 정련)

이 기반이 성공했다고 말할 수 있는 조건:

1. 새 보스 추가 시 **공통(generic) stage renderer·director·adapter에 bossId 분기를 추가하지 않는다** — profile 등록+(필요 시) §15-C 계약을 지킨 고유 handler 등록으로만. *(게이트를 가진 handler 진입 분기 1개는 등록의 형식으로 허용 — sbSmashFx 선례.)*
2. 새 직업 추가 시 **공통 pose resolver에 jobId 분기를 추가하지 않는다** — Actor Profile 등록으로만.
3. 새 스킬 추가 시 **gameplay에 visual-only state·timer를 추가하지 않는다** — cue 정의 데이터+기존 신호로만.
4. 새 Actor는 **profile과 registry를 통해** pose와 anchor를 등록한다(공통 코드 무수정 등록 경로 실존).
5. 없는 pose/anchor/signal/shell은 **§20 공식 fallback**으로 안전 처리된다(에러 0·유령 좌표 0·잔존 0).
6. battle end·boss switch 후 **stale class, cue, timer, line, FX가 0**이다(§19-5 검증 기준으로 실측).
7. Stage layer는 **gameplay state를 변경하지 않는다** — smoke 3종 결과 불변이 그 기계 증명이다.
8. **390×844 overflow 0·console error/warning 0**.
9. **CORE byte-identical·전투 결과(스모크 t/steps) 동일**.
10. 보스·직업·스킬 **세 확장 사이클의 제작 절차가 [60] 문서로 재현 가능**하다 — 다음 콘텐츠 카드가 [60]의 단계표만 따라 발주·구현·검증될 수 있다.

---
*— 렌 (連·鍊·紅蓮), EP25. 코드를 다시 읽으니 시스템은 이미 절반쯤 태어나 있었다 — 진실은 S와 S.ev 두 갈래로 흐르고, 무대는 매 프레임 그것을 번역하고 있었고, SB_BODY라는 이름의 작은 명부와 sbPt라는 이름의 작은 측량사가 벌써 일하고 있었다. 헌법이 할 일은 발명이 아니라 인정이었다: 잘 자란 관례에 이름을 주고, 위험한 지름길(유령 좌표·if의 증식·주인 없는 타이머)에 금줄을 치는 것. 이제 새 배우는 명부에 이름을 올리는 것으로 무대에 선다. 무대는 넓어지되, 진실은 한 곳에 머문다.*
