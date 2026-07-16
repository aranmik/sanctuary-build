'use strict';
// Anchor Registry Foundation 01 (F3) 전용 검증
// 실행: node dev/anchor_registry_foundation_01_check.js
// A 구조/책임 분리 · B 등록 내용/디버그 · C rect 안전성(fail-closed) · D 등가성 · E lifecycle/기준선.
// 원칙: Actor Registry는 누구인지 알고, Anchor Registry는 어디인지 안다. (0,0)은 fallback이 아니라 버그다.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const DOC = path.join(ROOT, 'docs', '64_ANCHOR_REGISTRY_FOUNDATION_01.md');
const doc = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '';

let pass = 0, fail = 0;
function chk(name, cond, detail) {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
}
const inSrc = s => src.indexOf(s) >= 0;

// F3 블록/함수 슬라이스 (주석 제거본으로 토큰 검사 — docs/62 §13 요령)
const f3A = src.indexOf('/* ===== F3: Anchor Registry Foundation 01');
const f3B = src.indexOf('/* ===== F2: Actor Registry & Pose Map Foundation 01');
const f3 = (f3A >= 0 && f3B > f3A) ? src.slice(f3A, f3B) : '';
const f3Code = f3.replace(/\/\*[\s\S]*?\*\//g, '');
function fnBody(name) {
  const i = src.indexOf('function ' + name + '(');
  if (i < 0) return '';
  const j = src.indexOf('\n}', i);
  return (j > i) ? src.slice(i, j) : '';
}
const raB = fnBody('resolveAnchor').replace(/\/\*[\s\S]*?\*\//g, '');
const poseB = fnBody('resolveActorPose').replace(/\/\*[\s\S]*?\*\//g, '');
const faB = fnBody('fxAnchors').replace(/\/\*[\s\S]*?\*\//g, '');   // F3 closeout: facade 본문
const fbB = fnBody('fxBeam').replace(/\/\*[\s\S]*?\*\//g, '');      // 사제 케어선 소비자
const rfB = fnBody('renderFx').replace(/\/\*[\s\S]*?\*\//g, '');    // fxBossLine/fxIntLine 소비자
// sbSmashFx 본문(소비자)
const fnStart = src.indexOf('function sbSmashFx(S,t){');
const fnEnd = src.indexOf('(function(){ /* 접촉 class 수명', fnStart);
const FN = (fnStart >= 0 && fnEnd > fnStart) ? src.slice(fnStart, fnEnd) : '';
// CORE
const coreLines = [];
{ let f = 0; for (const l of src.split('\n')) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) coreLines.push(l); } }
const core = coreLines.join('\n') + '\n';

/* ===== A. 구조 / 책임 분리 ===== */

chk('a1 Anchor Registry 존재(5 actor·weapon/shield/body 정의·topBias 이관)',
  f3.length > 1500 && inSrc('var ANCHOR_REGISTRY=') &&
  inSrc("weapon:{part:'sb-ic-hammer',topBias:1") && inSrc("shield:{part:'sb-w-shield'") &&
  inSrc("body:{part:'sb-w-body'") && inSrc("body:{part:'sb-r-body'") &&
  inSrc("body:{part:'sb-m-body'") && inSrc("body:{part:'sb-s-body'"), f3.length + 'B');

chk('a2 generic resolver에 Actor/직업/보스 id 분기 0(함수 본문 기준)',
  raB.length > 300 &&
  ['war', 'boss_iron', 'shell_iron', 'rog', 'mage', 'sham', 'boss01', 'shell_thirst', 'smash']
    .every(id => raB.indexOf("'" + id + "'") < 0) && raB.indexOf('switch(') < 0, '');

chk('a3 소비자 selector 직접 참조 제거(sbSmashFx: sbPt 직호출 0·인라인 selector 0·의미 요청 3개소)',
  FN.indexOf('sbPt(') < 0 && FN.indexOf("'sb-ic-hammer'") < 0 && FN.indexOf("'sb-w-shield'") < 0 &&
  FN.indexOf("'sb-w-body'") < 0 && FN.indexOf('SB_BODY[bc.tg]') < 0 &&
  (FN.match(/resolveAnchor\(/g) || []).length === 3 &&
  FN.indexOf("resolveAnchor('boss_iron','weapon')") >= 0 && FN.indexOf("resolveAnchor(bc.tg,'body')") >= 0, '');

chk('a4 책임 분리(pose resolver에 rect/좌표 0 · anchor resolver에 pose/data-pose/FX class 0)',
  poseB.indexOf('getBoundingClientRect') < 0 && poseB.indexOf('resolveAnchor') < 0 &&
  raB.indexOf('data-pose') < 0 && raB.indexOf('pose') < 0 && raB.indexOf('fxSmash') < 0 &&
  raB.indexOf('setAttribute') < 0 && raB.indexOf('classList') < 0, '');

chk('a5 F3 블록 gameplay 쓰기 0·타이머 0·S.ev 접근 0',
  !/\bS\.\w+\s*=[^=]/.test(f3Code) && !/\bG\.\w+\s*=[^=]/.test(f3Code) &&
  f3Code.indexOf('setTimeout') < 0 && f3Code.indexOf('setInterval') < 0 &&
  f3Code.indexOf('.ev') < 0 && f3Code.indexOf('splice') < 0 && f3Code.indexOf('Math.random') < 0, '');

chk('a6 좌표 산식 단일 소유(resolver→sbPt 위임=같은 코드 경로·legacy 산식 원문 보존)',
  raB.indexOf('sbPt(prof.figId,def.part,def.topBias?1:0)') >= 0 &&
  inSrc('return {x:r.left-sr.left+r.width/2,y:r.top-sr.top+(topBias?r.height*0.12:r.height/2)};'), '');

chk('a7 rect validity 계약(연결/유한/사유 7종+context-inactive) · both-0만 거부(legacy sbPt 정본)',
  raB.indexOf('el.isConnected===false') >= 0 && raB.indexOf('isFinite') >= 0 &&
  raB.indexOf('r.width>0||r.height>0') >= 0 && raB.indexOf('r.width>0&&r.height>0') < 0 &&  // 슬롯(w0·h56) 정상 사용 — both-0(display:none)만 null
  ['actor-unregistered', 'anchor-unregistered', 'element-missing', 'element-disconnected', 'rect-zero', 'rect-invalid', 'stage-missing', 'context-inactive']
    .every(t => f3.indexOf("'" + t + "'") >= 0), '');

chk('a8 (0,0) 유령 좌표 금지(fail=null·on=!!(src&&dst) 보존·고정 좌표 setAttribute 0)',
  (raB.match(/return sgAnchorFail\(/g) || []).length >= 7 &&
  FN.indexOf('var on=!!(src&&dst);') >= 0 &&
  !/setAttribute\('x1',\s*0\)/.test(FN) && f3Code.indexOf('||{x:0,y:0}') < 0 && f3Code.indexOf('x:0,y:0') < 0, '');

chk('a9 미래 anchor 선등록 없음(orb/totem/intake/core/ground 미등록 — 실사용 최소 범위)',
  f3.indexOf('orb:') < 0 && f3.indexOf('totem:') < 0 && f3.indexOf('intake:') < 0 &&
  f3.indexOf('core:') < 0 && f3.indexOf('ground:') < 0, '');

/* ===== A′. fxAnchors 계보 closeout (F3 보완 — 남은 활성 anchor 소비자 봉인) ===== */

chk('a10 fxAnchors 계보 anchor 등록(슬롯 4종 elId·보스 아바타 elId·사제 origin virtual·context override)',
  inSrc("slot:{elId:'sa-war',stageContext:null") && inSrc("slot:{elId:'sa-rog',stageContext:null") &&
  inSrc("slot:{elId:'sa-mage',stageContext:null") && inSrc("slot:{elId:'sa-sham',stageContext:null") &&
  inSrc("boss:{figId:null,stageContext:null,anchors:{avatar:{elId:'bossAvatar'") &&
  inSrc("pri:{figId:null,stageContext:null,anchors:{origin:{virtual:'stage-bottom-center'"), '');

chk('a11 fxAnchors=얇은 facade(자체 selector/rect/장기 cache 0·resolveAnchor 6회만)',
  faB.length > 50 && (faB.match(/resolveAnchor\(/g) || []).length === 6 &&
  faB.indexOf('getBoundingClientRect') < 0 && faB.indexOf('getElementById') < 0 &&
  faB.indexOf("'bossAvatar'") < 0 && faB.indexOf("'sa-war'") < 0 && faB.indexOf('function c(') < 0, '');

chk('a12 소비자 selector 직접 접근 0(renderFx/fxBeam: bossAvatar/sa-* 직서 0·facade A만 사용)',
  rfB.indexOf("'bossAvatar'") < 0 && rfB.indexOf("'sa-war'") < 0 && rfB.indexOf('getBoundingClientRect') < 0 &&
  fbB.indexOf("'bossAvatar'") < 0 && fbB.indexOf('sa-') < 0 && fbB.indexOf('getBoundingClientRect') < 0 &&
  rfB.indexOf('A=fxAnchors()') >= 0 && fbB.indexOf('A=fxAnchors()') >= 0, '');

chk('a13 장기 좌표 cache 폐기(resize-only cache 리스너 제거·if(!A)A= 조건부 재사용 0)',
  src.indexOf("window.addEventListener('resize',function(){A=null;})") < 0 &&
  src.indexOf('if(!A)A=fxAnchors()') < 0, '');

chk('a14 context-inactive 계약(현재 무대 문맥 밖 Actor → null·def.stageContext override)',
  raB.indexOf('context-inactive') >= 0 && raB.indexOf('sgBossId()') >= 0 &&
  raB.indexOf('def.stageContext!==undefined') >= 0, '');

/* ===== B. 등록 내용 / 디버그 ===== */

chk('b1 등록 항목에 owner/binding/라벨 존재(stageContext·figId·part·label)',
  (f3.match(/stageContext:'shell_iron'/g) || []).length === 5 &&
  (f3.match(/figId:'sb-/g) || []).length === 5 && (f3.match(/label:'/g) || []).length >= 6, '');

let h = null, s = null, stage = null;
try { h = require('./harness.js'); s = h.sb.window.__seedHealer; stage = s.stage; } catch (e) { console.log('HARNESS FAIL ' + e.message); }
chk('b2 debug accessor(anchors/actorAnchors/anchor/anchorStats)+F1/F2 API 공존',
  !!(stage && stage.anchors && stage.actorAnchors && stage.anchor && stage.anchorStats &&
     stage.resolvePose && stage.deriveSnapshot && stage.signals) &&
  JSON.stringify(stage.anchors()) === JSON.stringify(['boss_iron', 'war', 'rog', 'mage', 'sham', 'boss', 'pri']), '');

/* ===== C. rect 안전성(fail-closed·하네스=전 DOM 스텁 0-rect 환경) ===== */
try {
  chk('c1 unknown actor/anchor → null+사유 기록',
    stage.anchor('ghost', 'weapon') === null && stage.anchor('war', 'nope') === null &&
    (function () { const l = stage.anchorStats().lastFailures;
      return l.some(x => x.reason === 'actor-unregistered') && l.some(x => x.reason === 'anchor-unregistered'); })(), '');
  chk('c2 0-rect(스텁/숨김 등가) → null(rect-zero) — (0,0) 반환 0',
    (function () {
      h.sb.CUR_BOSS = 'shell_iron'; // context 통과시켜 element 0-rect(rect-zero)를 실제로 도달
      var a = stage.anchor('boss_iron', 'weapon'), b = stage.anchor('war', 'shield');
      var hit = stage.anchorStats().lastFailures.some(function (x) { return x.reason === 'rect-zero'; });
      h.sb.CUR_BOSS = 'boss01';
      return a === null && b === null && hit;
    })(), '');
  chk('c2b context-inactive(무대 문맥 밖 iron-scoped anchor → null·context-inactive)',
    (function () {
      h.sb.CUR_BOSS = 'boss01'; // 비-iron에서 iron 전용 anchor 요청
      var a = stage.anchor('boss_iron', 'weapon');
      var hit = stage.anchorStats().lastFailures.some(function (x) { return x.reason === 'context-inactive'; });
      return a === null && hit;
    })(), '');
  chk('c3 stats 복사본+실패 기록 상한 8',
    (function () { for (let i = 0; i < 20; i++) stage.anchor('ghost' + i, 'x');
      const st1 = stage.anchorStats(); st1.fail = -1; st1.lastFailures.push({ fake: 1 });
      const st2 = stage.anchorStats();
      return st2.lastFailures.length === 8 && st2.fail > 0; })(), '');
  chk('c4 malformed 인자 무해(null/undefined → null·throw 0)',
    (function () { try { return stage.anchor(null, null) === null && stage.anchor(undefined, undefined) === null; }
      catch (e) { return false; } })(), '');
} catch (e) { chk('c* 안전성(예외)', false, e.message); }

/* ===== D. 등가성 ===== */

chk('d1 소비자 의미 로직 보존(shield/body 선택=handler gameplay 의미·casting/resolve 분기 무변)',
  FN.indexOf("(SB_SM.blk||SB_SM.sh0)?'shield':'body'") >= 0 &&
  FN.indexOf('if(casting){') >= 0 && FN.indexOf('sm.S===S&&t>=sm.end-0.05&&sm.aliveL') >= 0 &&
  FN.indexOf("var nc='fxSmash'+(pr>=0.6?' commit':'')+(on?' on':'');") >= 0, '');

try {
  const m = s.smoke(), i = s.smoke('shell_iron'), t = s.smoke('shell_thirst');
  chk('d2 스모크 3종 불변(51.4/1029·48.5/971·61.8/1236)',
    m.t === 51.4 && m.steps === 1029 && i.t === 48.5 && i.steps === 971 && t.t === 61.8 && t.steps === 1236,
    m.t + '/' + m.steps + ' · ' + i.t + '/' + i.steps + ' · ' + t.t + '/' + t.steps);
} catch (e) { chk('d2 스모크(예외)', false, e.message); }

chk('d3 좌표·선 등가 실측 기록(docs/64 — 장면별 legacy=new·선 geometry·픽셀 md5)',
  doc.indexOf('좌표 등가') >= 0 && doc.indexOf('diff 0') >= 0 && doc.indexOf('md5 동일') >= 0, '');

/* d4: fxAnchors 계보 소비자 등가 — 하네스(전 DOM 0-rect 스텁)에서 facade는 stage-missing으로 전부 null,
   실좌표 등가는 pane 실측(docs/64 §closeout). 여기선 facade가 null-safe object(throw 0)+debug 등가만 확인. */
chk('d4 fxAnchors facade null-safe(harness에서 crash 0·anchor()는 실 resolver 동일 결과)',
  (function () {
    try {
      var a = h.sb.fxAnchors(); // 하네스 전역
      var keys = ['boss', 'war', 'rog', 'mage', 'sham', 'pri'];
      var okShape = a && keys.every(function (k) { return (k in a); });
      // harness 0-rect → 전부 null (유령 좌표 0)
      var allNull = keys.every(function (k) { return a[k] === null; });
      // debug anchor()가 facade와 같은 resolver 사용
      var slotNull = stage.anchor('war', 'slot') === null;
      return okShape && allNull && slotNull;
    } catch (e) { return false; }
  })(), '');

chk('d5 fxAnchors 계보 등가 실측 기록(docs/64 — 유령 봉인·슬롯 w0 정상·모르가스 선 diff 0)',
  doc.indexOf('fxAnchors') >= 0 && doc.indexOf('유령') >= 0 &&
  doc.indexOf('슬롯') >= 0 && (doc.indexOf('both-0') >= 0 || doc.indexOf('두 축') >= 0), '');

/* ===== E. lifecycle / 기준선 ===== */

chk('e1 rect 장기 캐시 없음(resolver 매 호출 실측·프레임 경계 캐시 변수 0·facade 매 호출 재조립)',
  raB.indexOf('getBoundingClientRect') >= 0 &&
  f3Code.indexOf('cache') < 0 && f3Code.indexOf('memo') < 0 && f3Code.indexOf('lastRect') < 0 &&
  faB.indexOf('resolveAnchor') >= 0, '');

{
  const buf = fs.readFileSync(path.join(ROOT, 'index.html'));
  const cmd5 = crypto.createHash('md5').update(core).digest('hex');
  chk('e2 CORE byte-identical(466/22,521/6cad2ec2)',
    coreLines.length === 466 && Buffer.byteLength(core, 'utf8') === 22521 &&
    cmd5 === '6cad2ec271a2a79afbee881c2a2e0856', coreLines.length + '/' + cmd5.slice(0, 8));
  chk('e3 index.html 현행 기준선(185,737 B · md5 8d72d049…)',
    buf.length === 185737 &&
    crypto.createHash('md5').update(buf).digest('hex') === '8d72d049b3090904abfd26488c7d4270', '');
}

chk('e4 docs/64 필수 절(계보 감사·치환/비치환 범위·schema·validity·산식·fail-closed·유령 좌표·대응표·lifecycle·frame budget·debug·closeout·WATCH·F4 계약)',
  doc.length > 4000 &&
  ['계보', 'fxAnchors', 'sbPt', 'SB_BODY', '치환 범위', '비치환', 'schema', 'validity', '계산식',
   'fail-closed', '유령 좌표', '대응표', 'lifecycle', 'frame budget', 'debug', 'closeout', 'facade', 'WATCH', 'F4'].every(t => doc.indexOf(t) >= 0), '');

console.log(`\n${fail === 0 ? '★ ANCHOR REGISTRY FOUNDATION 01 CHECK PASS' : '★ ANCHOR REGISTRY FOUNDATION 01 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
