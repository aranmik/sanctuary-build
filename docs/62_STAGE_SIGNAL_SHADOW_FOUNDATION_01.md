# 62. 무대 신호 그림자 기반 01 (STAGE SIGNAL SHADOW FOUNDATION 01 — F1)

**작성: 렌 · 2026-07-15 · EP25 · 상태: 구현(read-only shadow foundation) · 기준 HEAD `c068831` · 상위: [59 헌법 §7-2/§8/§23](./59_STAGE_PRODUCTION_SYSTEM_CONSTITUTION_01.md) · [61 로드맵 F1](./61_STAGE_FOUNDATION_MIGRATION_ROADMAP_01.md)**

> **핵심 문장 3줄**
> 1. `현재 전투의 진실을 건드리지 않고, 무대가 읽을 수 있는 신호로 한 번 더 비춘다.`
> 2. `Stage Signal은 소비자가 아니라 그림자다` — S.ev의 유일한 소비자는 계속 drain()이다.
> 3. 성공의 정의: **화면 변화 0 · gameplay 등가 · 관측 가능성 확보.**

---

## 1. 작업 목적

[59] 헌법의 첫 구현 카드. gameplay truth(S·S.ev)를 변경 없이 읽어 **plain-data Stage Signal**로 번역·관측하는 shadow 기반을 만든다. 이번 카드에서 포즈·행동선·FX·registry 연결은 하지 않는다(F2~ 몫). 연출은 0, 번역만.

## 2. 작업 전 구조 감사 (2026-07-15 실측 · HEAD `c068831` · index 155,854/2,188/`2f7a1b29…`)

- **Combat Truth**: CORE(752~1219)의 `S`(상태) + `S.ev`(순간 이벤트 큐). emitter 5종 `E/L/F/FX/deny`(880~884). 상세 전수는 [59 §5-A] — 본 카드에서 재검증하고 변경 없음 확인.
- **메인 루프**: `frame()`(rAF) → `G.step(0.05)×N` → renew/seed/focus 어댑터 → `drain()` → `render()`. 이 순서는 무접촉.
- **drain()**(수정 전 1734): `const evs=G.S.ev.splice(0);` — **파일 내 유일한 `.ev.splice(0)` 소비자**. 루프 분기: log→addLog/callout · flt→(피해면 seedOnHit)+spawnFloat · deny→toast · fx→doFx · end→showReport.
- **결정론**: `Math.random` 사용 **0회**(파일 전체) — RNG 소비 개념 자체가 없음. 스크립트 고정·tick 고정(0.05).

## 3. drain / S.ev 혼합 책임 (★WATCH의 근원)

`drain()`은 순수 visual consumer가 **아니다**: ①S.ev를 splice로 소비하고 ②`seedOnHit(e.tg)`(피해 플로팅 이벤트 감지)로 **기도씨앗 gameplay를 구동**하며 ③시각 처리(doFx 등)를 분배한다. 따라서 F1은:
- 소비권·소비 위치·순서·호출 시점을 **일절 이전/변경하지 않았다**.
- shadow는 drain 루프의 **모든 기존 분기가 끝난 뒤** 같은 이벤트를 읽기만 하는 tap 1줄로 구현했다(이벤트 중복 소비 없음 — splice는 여전히 1곳).

## 4. 선택한 shadow 생성 방식

**index.html 안의 최소 블록 1개 + 접점 2줄**(별도 파일 없음 — 단일 HTML 존중):

| 접점 | 위치 | 내용 |
|---|---|---|
| SG 블록 | `/* ===== F1: Stage Signal Shadow Foundation 01` ~ drain 직전 | 상수(SG_MAX/SG_INTENT)·번역기 `sgEv`·관측기 `sgObserve`·지속 스냅샷 `sgSnapshot`·경계 `sgReset`·debug API `window.__seedHealer.stage` |
| drain tap | drain 루프 말미 1줄 | `sgObserve(e,G.S);` — 기존 분기 전부 **뒤**([61 F1] tap 계약 — seedOnHit 등 기존 처리가 먼저) |
| 전투 경계 | `newGame()` 내 1줄 | `sgReset(G.S);` — 재시작/보스 전환 시 이전 관측 0 |

- **두 채널**([59 §7-2]): 순간 신호=drain tap에서 이벤트 번역 → 링버퍼(96) / 지속 신호=`sgSnapshot(S,g)` **호출 시점 파생**(프레임 상주·누적 없음 — "얕은 shadow 우선" 원칙).
- 의존 방향: gameplay→(없음)←Stage. CORE에 SG 참조 0(체크 a2). gameplay가 Signal을 호출해 결과를 얻는 경로 0.
- 실패 격리: `sgObserve`는 try/catch로 관측 오류를 삼킨다 — 전투는 계속 간다.

## 5. Stage Signal 최소 schema

**순간 신호**(plain data · DOM node/원본 참조 보관 없음):
```
{ seq, battle, t, boss,            // 순서·전투 식별·시각·보스 문맥
  ev,                              // gameplay event identity(원 kind — 추적용)
  intent,                          // 의미: attack/heal/shield/cleanse/rescue/interrupt/judge/drain/
                                   //       status-apply/status-result/defeated/empower/enrage/battle/select/deny/unknown
  phase,                           // battle-start/cast-start/contact/result/cancelled/battle-end/moment
  source, target,                  // 'boss'|'pri'|'war'|'rog'|'mage'|'sham'|'party'|'player'|null
  result }                         // {type,amount}|{name,blk,un}|{ok}|{r}|{on}|{bomb}|null
```
**지속 스냅샷**: `{battle,boss,t,started,over,result,bossHp,enraged,valorActive, bossAction{kind,name,target,blk,un,progress,committed}, nextAction{name,eta}, priest{alive,hp,mana,holy,gcdLocked,shielded,casting{name,k,target,progress}}, actors{id:{alive,hp,shielded{amt},branded,bombed,sustained,selected}}}` — 전부 매 호출 시점 S에서 순수 파생.
- 신호 이름에 pose/CSS class/selector **없음**(발주 §5 — 체크 a3/a4). owner는 source가 담당(보스 소유=source boss).

## 6. truth → signal 대응표 (3보스 실측)

| truth(발생 위치) | 기존 consumer | 신호 |
|---|---|---|
| `FX('start'/'win'/'lose')`·`E{y:'end',rep}` | doFx(SFX)·drain end→showReport | `battle`/battle-start·battle-end(+end 요약 `result.r`) |
| `FX('bossCast')`+`S.boss.cast`(smash/judge 시작 1020/1024) | doFx **case 없음(무시)** | `attack`/`judge`·cast-start·source boss·target tg/'party'·result{name,blk,un} |
| `FX('judgeWarn',{un})` | doFx case 없음 | `judge`·cast-start·result{un} |
| `FX('smash',{tg})`(resolve 1090) | doFx(SFX+shake) | `attack`·**contact**·boss→tg |
| `FX('melee',{tg})`(1116) | doFx | `attack`·contact·boss→tg |
| `FX('aoe')` ★중의(judge 착지 1097 / **drain 즉발** 1059) | doFx | **문맥 분리**: boss==='shell_thirst'→`drain` / 그 외→`judge` · contact·boss→party. 원 문자열을 의미로 승격하지 않음(발주 §4) |
| `FX('allyAtk',{tg})`(1127) | doFx(bossHit·pulse) | `attack`·contact·**tg→boss** |
| `FX('debuff',{tg,bomb})`·`FX('bombBoom',{tg})` | doFx | `status-apply`/`status-result`·boss→tg |
| `FX('intOk'/'intFail')`(1080/1068) | doFx | `interrupt`·result{ok} ·rog→boss |
| `FX('heal'/'shield'/'dispel'/'save'/'pray')` | doFx(fxBeam 등) | `heal/shield/cleanse/rescue`·result·pri→tg/'party' |
| `FX('castStart')`+`p.cast`(962/965) | doFx(SFX) | `heal`·cast-start·pri·result{name,k} |
| `FX('fizzle')`(1002) | doFx | `heal`·**cancelled**(대상 사망 무산) |
| `FX('valor'/'valorOff'/'enrage')` | doFx(valorOff는 case 없음) | `empower`{on}/`enrage` |
| `F()` 플로팅 `-n`(dmg)/`+n`(heal)/`(n)`(abs) | drain flt→seedOnHit+spawnFloat | **amount 대응**: result{type:damage/heal/absorbed, amount} — per-hit 수치의 유일한 노출([54 §6]) |
| `F()` 라벨(방패 막기/낙인/보호막 파괴 등) | spawnFloat | **번역 제외**(null) — 의미는 fx 신호가 담당 |
| `E{y:'sel'}`·`E{y:'deny',m}` | 카드 sel·toast | `select`/`deny` |
| `E{y:'log'}`·`FX('vign')` | addLog/vign | **번역 제외**(표현 텍스트/에코) |
| cast 진행률·보호막 잔량·낙인/폭탄·gcd·다음 패턴 eta | render 직독 | **지속 스냅샷**(sgSnapshot) |

- ★실측 노트: boss01 judge j1(15s)은 도적 차단 성공으로 **aoe가 발생하지 않는다**(j2 34.5s가 첫 aoe) — 체크 b11이 이 진실 그대로 검증. 소생/씨앗 회복은 `spawnFloat` 직접 호출(S.ev 경유 아님)이라 순간 신호에 없음 — 진실은 `u.hot/u.seed`(지속 스냅샷 sustained)와 HEAL_LEDGER.

## 7. lifecycle / cleanup

- 링버퍼 **상한 96**(SG_MAX) — 초과 시 오래된 것부터 탈락. 영구 누적 없음.
- **전투 경계**: `newGame()`의 `sgReset(G.S)`가 정식 경계(재시작·보스 전환 모두 newGame 경유) — 이전 encounter 관측 0. `sgObserve`의 `SG.S!==S` 방어 리셋은 이중 안전망.
- 전투 종료(S.over) 후: 이벤트 발생이 자연 중단되므로 관측도 중단. **타이머 0·listener 0**(구조상 없음 — 체크 a5) → stale 잔존 불가. 종료 후 버퍼는 다음 newGame까지 사후 관측용으로 읽기 가능(명시적 lifecycle).

## 8. unknown / malformed fallback

- 미지 fx kind → `intent:'unknown'` 신호로 안전 강등(+`stats().unknown` 카운트). 미지 `y` → 동일. `vign`/`log`/라벨 플로팅 → 명시적 번역 제외(null).
- null/undefined 이벤트·S → null 반환/무시. throw하는 malformed 이벤트 → `sgObserve` try/catch가 삼킴 — **전투 결과 무영향**(체크 c1~c4 실증).

## 9. debug observation 사용법 (Debug Boundary — [59 §23])

`window.__seedHealer.stage` (production 화면·DOM·console 무접촉 · 상시 출력 0):
- `.snapshot()` — 현재 전투의 지속 신호 스냅샷(없으면 null)
- `.signals()` — 순간 신호 **복사본** 배열(외부 수정이 내부에 미반영 — 체크 c8)
- `.stats()` — `{on,battle,count,seq,unknown,max}`
- `.setOn(bool)/.isOn()` — 관측 스위치(꺼도 gameplay 동일 — 체크 c9·d1)
- `.translate(e,S)/.deriveSnapshot(S,g)/.observe(e,S)/.reset(S)` — 하네스/검증용 순수 진입점

## 10. gameplay 등가성 검증 방법

- **dual-run 심층 비교**(체크 d1~d2): 3보스 각각, 동일 사제 입력 시퀀스(heal/shield/big/dispel/select)를 가진 두 판 — A=매 tick 이벤트 관측 ON / B=관측 없음. 종료 후 `JSON.stringify(S)` 전체(이벤트 배열 포함)·`report()`·steps·result **완전 일치**. 이벤트 배열 동일=소비 순서·횟수 등가 증명. 결정론(난수 0 — d4)이라 seed 개념 없이 전 상태 비교가 유효.
- **seedOnHit 등가**: S 비교에 `u.seed`·hp·st 전부 포함되므로 함께 증명. tap이 기존 분기 **뒤**라 씨앗 발동 시점도 불변(정적 a8).
- **스모크 3종 동일**(d3) + 기존 전체 체크 + baseline.

## 11. 변경 파일

- `index.html` — SG 블록 1개(+110줄·7,949B) + drain tap 1줄 + newGame 경계 1줄. 재-baseline **163,803 B / 2,298줄 / md5 `8675df86…`**.
- 신규: `dev/stage_signal_shadow_foundation_01_check.js` · 본 문서(docs/62).
- 포인터: docs/98·99·102. live pin 재-baseline: baseline_check(bytes/lines/md5)+live 핀 체크들+라벨(2f7a1b29→8675df86·155854→163803·lines 2298) — 역사 스냅샷 기록은 보존.
- ★구계약 정밀화 1건(보고): constitution check **c37**이 "bossCast/judgeWarn/valorOff case 부재"를 파일 전역으로 검사 — F1의 번역기(sgEv)가 같은 kind를 정당하게 번역(case 보유)하므로 주장의 원 범위인 **doFx 함수 범위**로 좁힘(주장 의미 불변·완화 아님).

## 12. 비변경 범위

CORE(byte-identical `6cad2ec2…`) · gameplay 수치/판정/tick/cast 시간 · S.ev 소비 구조(splice 1곳=drain·순서·시점) · seedOnHit · render/renderFx/sbSmashFx/sbFigPose/doFx/fxBeam 등 기존 시각 경로 전부 · CSS **0줄** · visible DOM 0 · 기존 dev 체크 assertion(핀 상수 제외).

## 13. 검증 결과

- 신규 `stage_signal_shadow_foundation_01_check` **41/41 PASS**(A 구조/정적 11 · B truth 대응 14 · C 안전성 9 · D 등가성 4 · 기준선/문서 3).
- 기존 전체 체크 PASS·baseline 36/36·스모크 3종 동일(51.4/1029·48.5/971·61.8/1236)·JS 구문 OK(전 체크 실행+하네스 로드).
- 390×844: overflow 0·console error/warning 0(pane 실측).
- ★체크 제작 함정 기록: 초회 a6/a7 FAIL — SG 블록 **주석**의 'S.ev'·'splice' 설명문이 부재 검사에 자기 오탐([55] (c) 함정의 재현) → 검사를 주석 제거 후 코드만 스캔으로 정밀화. b11 초회 FAIL — judge j1은 차단 성공이라 aoe 미발생(진실) → 관측 구간을 j2 착지(34.5s)까지로 수정.

## 14. 남은 WATCH

1. **flt 파싱 취약성**: per-hit 수치는 플로팅 표시 문자열(`-n/+n/(n)`) 규약에 의존 — 문구 변경 카드가 생기면 본 대응 재검(파싱 실패 시 null=안전 강등이라 전투 무영향).
2. **drain의 혼합 책임**은 F1이 해소하지 않고 그대로 둠(발주 §3 준수) — S.ev 구조 정리는 별도 판단 전까지 금지 유지.
3. **`FX('aoe')` 중의성**은 신호층에서 문맥 분리로 흡수했으나 원 이벤트 어휘 자체는 그대로 — 새 보스가 aoe를 다른 의미로 재사용하면 분기 갱신 필요(신호 등록부에서 관리).
4. 링버퍼 96은 잠정치(PROVISIONAL) — F2~F4에서 실소비 패턴 확인 후 잠금.
5. 소생/씨앗 회복량은 순간 신호에 없음(spawnFloat 직접 호출) — 필요해지면 HEAL_LEDGER 지속 파생으로 추가(새 이벤트 신설 금지).

## 15. F2로 넘기는 입력 계약

F2(Actor Registry & Pose Map Foundation 01)는 **다음만** 입력으로 사용한다:
- **지속**: `sgSnapshot(S,g)`(또는 `__seedHealer.stage.snapshot()`)의 `bossAction{kind,target,progress,committed}`·`actors{id:{alive,shielded,branded,bombed,sustained,selected,hp}}`·`priest.casting`·`enraged`·`valorActive`·`over`.
- **순간**: `signals()`의 intent/phase/source/target/result — 단 F2(포즈)는 원칙적으로 **지속 신호만으로 등가 치환 가능**해야 한다(현행 sbFigPose가 지속 상태만 읽음 — cast 중 여부·보호막 보유).
- F2는 S를 직독하는 기존 sbFigPose를 **profile 조회+동일 판정**으로 등가 치환하되, 판정 입력을 이 스냅샷 어휘와 1:1로 문서화한다. F2가 S 직독을 유지할지 스냅샷 경유로 바꿀지는 **F2 카드에서 등가 실측으로 결정**(F1은 어휘와 관측만 보장).
- 금지 승계: F2도 S.ev 소비권·drain·CORE 무접촉.

---
*— 렌 (連·鍊·紅蓮), EP25. 그림자는 아무것도 바꾸지 않는다 — 그것이 그림자의 존재 증명이다. 두 판을 나란히 돌려 마지막 바이트까지 같음을 확인했을 때, 이 카드는 이미 성공해 있었다. 무대는 이제 전투를 읽을 수 있다. 아직 아무 말도 하지 않을 뿐.*
