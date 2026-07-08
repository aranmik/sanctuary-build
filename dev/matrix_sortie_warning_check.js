'use strict';
// Matrix -> Sortie Warning 01 전용 검증 (docs/29 계약)
// 실행: node dev/matrix_sortie_warning_check.js
// 하네스로 index.html inline JS를 sandbox에 eval → sortieWarnings/sortieWarnHtml + 소스 문자열 검사.
const fs = require('fs');
const path = require('path');
const h = require('./harness.js');
const sb = h.sb;
const src = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

let pass = 0, fail = 0;
function chk(name, cond, detail) {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
}
const FULL = ['war', 'rog', 'mage', 'sham'];
const wf = sb.sortieWarnHtml, wg = sb.sortieWarnings;

// 0. 심볼 존재
chk('sortieWarnings/Html 함수 존재', typeof wg === 'function' && typeof wf === 'function');

// 1. 모르가스 경고 최대 2줄 (최악 조합: 정화·성심집중 없음 + 도적 없음)
const worst = wg('boss01', ['heal', 'big', 'shield', 'renew', 'seed', 'pray'], ['war', 'mage', 'sham']);
chk('모르가스 최대 2줄', worst.length <= 2, 'len=' + worst.length);
const worstHtml = wf('boss01', ['heal', 'big', 'shield', 'renew', 'seed', 'pray'], ['war', 'mage', 'sham']);
chk('2줄 표시는 <br> 1개 이하', (worstHtml.match(/<br>/g) || []).length <= 1, JSON.stringify(worstHtml));

// 2. 강도 하나 이상 존재 (안내/주의/위험)
const defHtml = wf('boss01', ['heal', 'big', 'shield', 'dispel', 'renew', 'seed'], FULL); // 기본 로드아웃
chk('모르가스 경고에 강도 라벨 존재', /안내|주의|위험/.test(defHtml), JSON.stringify(defHtml));

// 3. 정화 없음 → 위험(danger)
const noDispel = wg('boss01', ['heal', 'big', 'shield', 'pray', 'renew', 'seed'], FULL);
chk('정화 없음 → 위험', noDispel.some(r => r.lv === 'danger'), JSON.stringify(noDispel.map(r => r.lv)));

// 4. 도적 없음 → 주의(caution). 정화는 넣어 danger를 배제해도 주의가 살아있어야 함
const noRog = wg('boss01', ['heal', 'big', 'shield', 'dispel', 'renew', 'seed'], ['war', 'mage', 'sham']);
chk('도적 없음 → 주의', noRog.some(r => r.lv === 'caution'), JSON.stringify(noRog.map(r => r.lv)));

// 5. 정화+도적 → 안내(info)로 흐른다(위험/주의 없이)
const good = wg('boss01', ['heal', 'big', 'shield', 'dispel', 'renew', 'seed'], FULL);
chk('정화+도적 → 위험/주의 아님', !good.some(r => r.lv === 'danger' || r.lv === 'caution'), JSON.stringify(good.map(r => r.lv)));

// 6. 경고가 출정 차단 로직을 만들지 않는다
//    - enterBattle 가드는 LOADOUT 6칸 체크뿐(경고 참조 없음)
//    - sortieWarnHtml 호출은 정확히 1곳(표시용, warn= 대입)
const eb = src.match(/function enterBattle\(slot\)\{[\s\S]*?\n\}/);
chk('enterBattle에 경고 게이트 없음', eb && !/sortieWarn/.test(eb[0]) && /LOADOUT\.length!==6/.test(eb[0]));
chk('sortieWarnHtml 호출 1곳(표시용)', (src.match(/sortieWarnHtml\(/g) || []).length === 2 && /var warn=sortieWarnHtml\(SELECTED_BOSS,LOADOUT,allyIds\)/.test(src)); // 정의1 + 호출1
chk('출정 버튼 disabled 미도입', !/sortie-go[\s\S]{0,120}disabled/.test(src));

// 7. 셸은 데이터 후보만 · 실전투/진입 미개방
chk('파쇄자·심연 데이터 후보 존재', (sb.SORTIE_WARN_ROWS.shell_iron || []).length > 0 && (sb.SORTIE_WARN_ROWS.shell_thirst || []).length > 0);
chk('renderSortie 셸 즉시반환 유지', /if\(!b\|\|b\.shell\)\{showScreen\('guild'\);return;\}/.test(src));
// Thirst Abyss Runtime 01 이후: 세 보스 전부 개방(shell:1 잔여 0) — 경고는 셋 다 런타임 표시
chk('세 보스 전부 개방(shell:1 잔여 0)', !/shell:1/.test(src) && /slot:'shell_iron',\n tier:/.test(src) && /slot:'shell_thirst',\n tier:/.test(src));

// 8. 미래 7종 동료 런타임 미구현 — CFG.allies는 4종 고정
const allies = sb.window.__seedHealer.CFG.allies;
chk('CFG.allies 4종 고정', allies.length === 4 && allies.map(a => a.id).join(',') === 'war,rog,mage,sham', allies.map(a => a.id).join(','));
chk('미래 동료(기사/궁수/흑마) 런타임 미등장', !allies.some(a => ['기사', '궁수', '흑마법사'].includes(a.name)));

// 9. §5 금지 문구 0 (경고 모듈 범위)
const banned = ['잘못된 조합', '필수입니다', '없으면 불가능', '바꾸세요', '반드시 넣'];
chk('§5 금지 문구 0', banned.every(b => src.indexOf(b) < 0));

console.log(`\n${fail === 0 ? '★ SORTIE WARNING CHECK PASS' : '★ SORTIE WARNING CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
