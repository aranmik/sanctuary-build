'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const docPath = path.join(ROOT, 'docs', '58_BATTLE_STAGE_VERTICAL_POLISH_02_FINAL_CLOSEOUT.md');
const indexPath = path.join(ROOT, 'index.html');
const corePath = path.join(ROOT, 'dev', 'core_pristine.js');
const pointers = [
  'docs/98_NEXT_IMPLEMENTATION_CARDS.md',
  'docs/99_HANDOFF_NEXT_REN.md',
  'docs/102_FINAL_HANDOFF_INDEX.md'
].map(file => path.join(ROOT, file));

let pass = 0;
let fail = 0;
function chk(name, condition) {
  condition ? pass++ : fail++;
  console.log(`${condition ? 'PASS' : 'FAIL'} ${name}`);
}
const md5 = file => crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex');
const doc = fs.existsSync(docPath) ? fs.readFileSync(docPath, 'utf8') : '';
const has = (...terms) => terms.every(term => doc.includes(term));

chk('c1 docs/58 exists', fs.existsSync(docPath));
chk('c2 card and implementation commit', has('Battle Stage Vertical Polish 02', '66a7686'));
chk('c3 official Pages URL', has('https://aranmik.github.io/sanctuary-build/'));
chk('c4 Phone Human Gate FINAL PASS', has('Phone Human Gate', 'FINAL PASS'));
chk('c5 Nara feedback preserved', has('강력하게 패스'));
chk('c6 Iron Crusher raise and no windup clipping', has('추가 상향', 'windup 망치', 'clipping은 없다'));
chk('c7 boss and priest action-line readability', has('보스 행동선', '사제 행동선'));
chk('c8 button cast line removed and GCD dim', has('금빛 cast 진행선', '글로벌 GCD', 'dim'));
chk('c9 GCD recovery and priest HUD cast bar', has('자연스럽게 복귀', 'priCastWrap'));
chk('c10 gameplay and CORE unchanged statement', has('gameplay', 'CORE는 이번 카드에서 변경되지 않았다'));
chk('c11 live index baseline', md5(indexPath) === '8d72d049b3090904abfd26488c7d4270');
chk('c12 CORE byte-identical baseline', fs.statSync(corePath).size === 22521 && md5(corePath) === '6cad2ec271a2a79afbee881c2a2e0856');
chk('c13 nonblocking backlog A/B/C', has('쿨타임 글씨', '행동선', '추가 상향'));
chk('c14 next priority is Skill Cooldown Label Audit 01', has('Skill Cooldown Label Audit 01'));
chk('c15 one problem principle', has('디테일 귀신에게 붙들리지 않고 한 번에 한 문제만 해결한다.'));
chk('c16 card closeout, not project-wide lock', has('프로젝트 전체', 'LOCK하지 않는다'));
chk('c17 all pointer docs reference closeout', pointers.every(file => fs.existsSync(file) && fs.readFileSync(file, 'utf8').includes('Battle Stage Vertical Polish 02 Final Closeout 01')));

console.log(`\\nFINAL CLOSEOUT CHECK (${pass} pass / ${fail} fail)`);
process.exitCode = fail ? 1 : 0;
