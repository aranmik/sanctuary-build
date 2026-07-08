'use strict';
// Iron Crusher Runtime 01 전용 검증 (docs/30 A안 · docs/31)
// 실행: node dev/iron_crusher_runtime_check.js
// 박제 기준: 모르가스 defeat/51.4/1029 + 로그지문 88925e4d… · 파쇄자 defeat/48.5/971 · 사망열 war@20.6→rog@29.4→sham@41.7→mage@48.5
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const h = require('./harness.js');
const sb = h.sb;
const sh = sb.window.__seedHealer;
const src = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

let pass = 0, fail = 0;
function chk(name, cond, detail) {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
}
function runNoInput(bossId) {
  const g = sh.createGame(bossId); g.start(); let n = 0;
  while (!g.S.over && n < 4000) { g.step(0.05); n++; }
  return g;
}

// 1~2. 모르가스 폴백 — 무인자/boss01 스모크 51.4 유지
const s0 = sh.smoke();
chk('c1 무인자 스모크 = 모르가스 51.4', s0.result === 'defeat' && s0.t === 51.4 && s0.steps === 1029, JSON.stringify(s0));
const s1 = sh.smoke('boss01');
chk('c2 boss01 스모크 = 모르가스 51.4', s1.result === 'defeat' && s1.t === 51.4 && s1.steps === 1029, JSON.stringify(s1));

// 3. 모르가스 로그 스트림 지문 — 패치 전과 바이트 동일(손맛 무회귀 증거)
{
  const g = runNoInput(undefined);
  const logs = g.S.ev.filter(e => e.y === 'log').map(e => e.m + '|' + (e.c || ''));
  const hash = crypto.createHash('md5').update(logs.join('\n')).digest('hex');
  chk('c3 모르가스 로그 지문 동일', hash === '88925e4d45455f02f824bfc7b3fd350e' && logs.length === 25, hash);
}

// 4. 파쇄자 인스턴스 생성 + 분기 확인
{
  const gi = sh.createGame('shell_iron');
  chk('c4 파쇄자 인스턴스(HP 7800·스크립트 13·모르가스와 구분)',
    gi.S.boss.max === 7800 && gi.script.length === 13 && gi.script !== sh.SCRIPT,
    'hp=' + gi.S.boss.max + ' len=' + gi.script.length);
}

// 5. 파쇄자 무입력 스모크 박제
const si = sh.smoke('shell_iron');
chk('c5 파쇄자 무입력 스모크 defeat/48.5/971', si.over === true && si.result === 'defeat' && si.t === 48.5 && si.steps === 971, JSON.stringify(si));

// 6. 파쇄자 사망열 박제
{
  const gi = runNoInput('shell_iron');
  const dl = gi.S.st.deaths.map(d => d.id + '@' + d.t.toFixed(1)).join(',');
  chk('c6 파쇄자 사망열', dl === 'war@20.6,rog@29.4,sham@41.7,mage@48.5', dl);
}

// 7. 파쇄자 = 강타/버티기 질문 — 정화/차단 어휘 없음
{
  const evs = sh.BOSS_DEFS.shell_iron.script.map(e => e.e);
  const noClean = !evs.includes('brand') && !evs.includes('bomb') && !evs.includes('judge');
  const smashN = evs.filter(e => e === 'smash').length;
  chk('c7 파쇄자 어휘 = smash/valor/enrage만(정화·차단 없음)', noClean && smashN === 10 && evs.includes('valor') && evs.includes('enrage'), evs.join(','));
}

// 8. 양성 증거 — 보호막+힐 운영이면 승리 가능(기존 도구만으로 성립)
{
  const g = sh.createGame('shell_iron'); g.start(); let n = 0;
  while (!g.S.over && n < 4000) {
    const S = g.S;
    const war = S.al.find(a => a.id === 'war');
    let acted = false;
    if (war && war.alive && !war.shield && S.t >= war.shieldLock && S.pri.mana >= 55 && S.t >= S.pri.gcd && !S.pri.cast) {
      g.select('war'); acted = g.useSkill('shield');
    }
    if (!acted) {
      let low = null, lp = 0.72;
      for (const a of S.al.concat([S.pri])) { if (a.alive && a.hp / a.max < lp) { lp = a.hp / a.max; low = a; } }
      if (low && S.pri.mana >= 40 && S.t >= S.pri.gcd && !S.pri.cast) { g.select(low.id); g.useSkill('heal'); }
    }
    g.step(0.05); n++;
  }
  chk('c8 보호막+힐 봇 → 승리(사망 0)', g.S.result.indexOf('victory') === 0 && g.S.st.deaths.length === 0, g.S.result + '@' + g.S.t.toFixed(1));
}

// 9. 길드 게시판 — 파쇄자 선택 가능(잠금 아님)
{
  sb.renderGuild();
  const gl = h._els['guild-list'].innerHTML;
  chk('c9 길드: 파쇄자 개방 카드(출정 준비 버튼·잠금 없음)',
    gl.indexOf('강철의 파쇄자') >= 0 && gl.indexOf('data-boss="shell_iron"') >= 0 && gl.indexOf('data-shell="shell_iron"') < 0, '');
}

// 10. 심연은 여전히 셸 — 길드 잠금 + 출정 렌더 반환 + 코어 폴백
const sortieBody = sb.document.getElementById('sortie-body'); /* lazy 프록시 선생성 */
{
  // ※ Thirst Abyss Runtime 01(docs/32)에서 심연도 개방됨 — 이 검사는 "파쇄자 개방이 모르가스를 안 깼다"만 확인.
  //   심연 개방 자체의 검증은 dev/thirst_abyss_runtime_check.js 소관.
  const gt = sh.createGame('shell_thirst');
  chk('c10 심연 개방 후에도 모르가스 폴백 무손상(무인자=7200·명시=8400)',
    sh.createGame().S.boss.max === 7200 && gt.S.boss.max === 8400, 'noarg=' + sh.createGame().S.boss.max + ' thirst=' + gt.S.boss.max);
}

// 11. 출정 화면 — 파쇄자 이름/질문/경고/출정 버튼(비활성 아님)
{
  sb.SELECTED_BOSS = 'shell_iron';
  sb.renderSortie();
  const sbody = sortieBody.innerHTML;
  chk('c11 출정: 파쇄자 이름+질문+난이도', sbody.indexOf('강철의 파쇄자') >= 0 && sbody.indexOf('네 마나는 나의 파괴보다 오래 버티는가?') >= 0 && sbody.indexOf('난이도 · 숙련') >= 0, '');
  chk('c12 출정 버튼 존재·비활성 아님', sbody.indexOf('id="sortie-go"') >= 0 && !/sortie-go[^>]*disabled/.test(sbody), '');
  chk('c13 출정 경고 표시(기본 로드아웃=안내)', sbody.indexOf('💫 안내') >= 0, '');
  sb.SELECTED_BOSS = 'boss01';
}

// 14. 출정 경고 — 보호막 없음 → 위험 · 최대 2줄
{
  const w = sb.sortieWarnings('shell_iron', ['heal', 'big', 'dispel', 'pray', 'renew', 'seed'], ['war', 'rog', 'mage', 'sham']);
  chk('c14 파쇄자 보호막 없음 → 위험', w.some(r => r.lv === 'danger') && w.length <= 2, JSON.stringify(w.map(r => r.lv)));
  const w2 = sb.sortieWarnings('shell_iron', ['heal', 'big', 'dispel', 'pray', 'renew', 'seed'], ['rog', 'mage', 'sham']);
  chk('c15 전사 없음 → 주의 데이터 유지', w2.some(r => r.lv === 'caution'), JSON.stringify(w2.map(r => r.lv)));
}

// 16. 경고가 출정을 막지 않음(소스 검사)
{
  const eb = src.match(/function enterBattle\(slot\)\{[\s\S]*?\n\}/);
  chk('c16 enterBattle 경고 게이트 없음', eb && !/sortieWarn/.test(eb[0]) && /LOADOUT\.length!==6/.test(eb[0]), '');
}

// 17. 미래 7동료 미구현 — CFG.allies 4종 고정
{
  const allies = sh.CFG.allies;
  chk('c17 동료 4종 고정(기사/궁수/흑마 없음)',
    allies.length === 4 && allies.map(a => a.id).join(',') === 'war,rog,mage,sham' && !allies.some(a => ['기사', '궁수', '흑마법사'].includes(a.name)), allies.map(a => a.id).join(','));
}

// 18. 재도전 보스 유지 배선 — newGame 무인자 재호출이 CUR_BOSS 유지(소스 검사)
{
  chk('c18 재도전 보스 유지(CUR_BOSS)', /var CUR_BOSS='boss01';/.test(src) && /if\(slot!==undefined\)CUR_BOSS=BOSS_DEFS\[slot\]\?slot:'boss01';/.test(src), '');
}

console.log(`\n${fail === 0 ? '★ IRON CRUSHER RUNTIME CHECK PASS' : '★ IRON CRUSHER RUNTIME CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
