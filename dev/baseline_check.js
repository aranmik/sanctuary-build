'use strict';
// Sanctuary Build baseline check — run: node dev/baseline_check.js
// 기준선(EP21 · Iron Crusher Runtime 01 재-baseline): 112,359 B / 1,838줄 / md5 8e7ee68a11add47db2e375447866fbf7
// CORE 427줄/20,818 B · 모르가스 스모크 defeat/51.4/1029(무인자 폴백) · 파쇄자 스모크 defeat/48.5/971
// 보존 grep 14 · 금지 grep 0 · div 188/188 · section 8/8
// (이전 기준선 EP20C: 106,650 B/1,756줄/34addd9c… · CORE 394줄/19,545 B — docs/31 재-baseline 기록 참조)
const fs=require('fs');const path=require('path');const crypto=require('crypto');const vm=require('vm');
const ROOT=path.join(__dirname,'..');
const buf=fs.readFileSync(path.join(ROOT,'index.html'));
const src=buf.toString('utf8');
const lines=src.split('\n');
let pass=0,fail=0;
function chk(name,got,want){const ok=String(got)===String(want);ok?pass++:fail++;console.log(`${ok?'PASS':'FAIL'} ${name}: ${got}${ok?'':' (expected '+want+')'}`);}
const lineCount=p=>lines.filter(l=>l.includes(p)).length;      // grep -c 동등(패턴 포함 줄 수)
const occCount=p=>src.split(p).length-1;                        // grep -o 동등(발생 횟수)

// 1. 원본 바이트/줄/md5
chk('bytes',buf.length,112359);
chk('lines',src.split('\n').length-(src.endsWith('\n')?1:0),1838);
chk('md5',crypto.createHash('md5').update(buf).digest('hex'),'8e7ee68a11add47db2e375447866fbf7');

// 2. CORE 추출 (awk 동등: START 다음 줄 ~ END 직전 줄)
{let f=0,core=[];for(const l of lines){if(l.includes('//__CORE_START__')){f=1;continue;}if(l.includes('//__CORE_END__'))f=0;if(f)core.push(l);}
 const coreTxt=core.join('\n')+'\n';
 chk('core lines',core.length,427);
 chk('core bytes',Buffer.byteLength(coreTxt,'utf8'),20818);}

// 3. 금지 grep (전부 0)
for(const p of ['Math.random','base64','<img','.png','assets'])chk(`forbidden "${p}"`,lineCount(p),0);

// 4. 태그 균형
chk('div open/close',`${occCount('<div')}/${occCount('</div>')}`,'188/188');
chk('section open/close',`${occCount('<section')}/${occCount('</section>')}`,'8/8');

// 5. 보존 grep 14종
const KEEP={'차단!':1,'차단 실패!':1,'renewUse':2,'seedOnHit':2,'chapelSaveReturn':2,'data-shell':2,'renderSortie':2,'pickReportHint':2,'nextThreatFor':2,'focusIsArmed':7,'focusUse':2,'focusWrapUse':2,'focusBtnUpdate':2,'FOCUS_REFUND':2};
for(const[p,n]of Object.entries(KEEP))chk(`keep "${p}"`,lineCount(p),n);

// 6. 스크립트 구문 검사 (node --check 동등)
{const js=src.match(/<script>([\s\S]*)<\/script>/)[1];
 try{new vm.Script(js,{filename:'inline.js'});chk('syntax','OK','OK');}catch(e){chk('syntax',e.message,'OK');}}

// 7. 무입력 스모크 — 보스별 사망열 박제(docs/28 §5 · 무인자=모르가스 폴백)
{const h=require('./harness.js');const sh=h.sb.window.__seedHealer;
 const r=sh.smoke();
 chk('smoke(모르가스) result',r.result,'defeat');
 chk('smoke(모르가스) t',r.t,51.4);
 chk('smoke(모르가스) steps',r.steps,1029);
 const ri=sh.smoke('shell_iron');
 chk('smoke(파쇄자) result',ri.result,'defeat');
 chk('smoke(파쇄자) t',ri.t,48.5);
 chk('smoke(파쇄자) steps',ri.steps,971);}

console.log(`\n${fail===0?'★ BASELINE PASS':'★ BASELINE FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail===0?0:1);
