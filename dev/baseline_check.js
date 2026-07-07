'use strict';
// Sanctuary Build EP20C baseline check — run: node dev/baseline_check.js
// 기준선: 106,650 B / 1,756줄 / md5 34addd9c3441cf8c2e1f83e8303f0475
// CORE 394줄/19,545 B · 스모크 defeat/51.4/1029 · 보존 grep 14 · 금지 grep 0 · div 188/188 · section 8/8
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
chk('bytes',buf.length,106650);
chk('lines',src.split('\n').length-(src.endsWith('\n')?1:0),1756);
chk('md5',crypto.createHash('md5').update(buf).digest('hex'),'34addd9c3441cf8c2e1f83e8303f0475');

// 2. CORE 추출 (awk 동등: START 다음 줄 ~ END 직전 줄)
{let f=0,core=[];for(const l of lines){if(l.includes('//__CORE_START__')){f=1;continue;}if(l.includes('//__CORE_END__'))f=0;if(f)core.push(l);}
 const coreTxt=core.join('\n')+'\n';
 chk('core lines',core.length,394);
 chk('core bytes',Buffer.byteLength(coreTxt,'utf8'),19545);}

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

// 7. 무입력 스모크 (하네스 경유)
{const h=require('./harness.js');const r=h.sb.window.__seedHealer.smoke();
 chk('smoke result',r.result,'defeat');
 chk('smoke t',r.t,51.4);
 chk('smoke steps',r.steps,1029);}

console.log(`\n${fail===0?'★ BASELINE PASS':'★ BASELINE FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail===0?0:1);
