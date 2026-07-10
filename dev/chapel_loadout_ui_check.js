'use strict';
// Chapel Loadout UI 01 전용 검증 (docs/37·38)
// 실행: node dev/chapel_loadout_ui_check.js
// 성당 UI 개편 — 카테고리/요약/슬롯/탭 구조 + 전투 시작 버튼 제거 + 출격 흐름 유지 + 3보스 스모크.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const h = require('./harness.js');
const sb = h.sb;
const sh = sb.window.__seedHealer;
const src = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
function setG(g) { sb.__tmpG = g; vm.runInContext('G=__tmpG;', sb); }

let pass = 0, fail = 0;
function chk(name, cond, detail) { cond ? pass++ : fail++; console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`); }
const chapelHtml = () => { sb.renderChapel(); return h._els['chapel-skills'].innerHTML; };

// 1. 카테고리 4종 + 9스킬 전수 배정 (data-driven)
{
  const CAT = sb.SKILL_CAT, CATS = sb.CHAPEL_CATS, pool = sb.LOADOUT_POOL;
  chk('c1 카테고리 4종(치유/보호/정화·유틸/지속·자원)', CATS.length === 4 && CATS.join(',') === '치유,보호,정화·유틸,지속·자원', CATS.join(','));
  const allMapped = pool.every(k => CATS.indexOf(CAT[k]) >= 0);
  chk('c2 현재 9스킬 전수 배정(빈 카테고리 없음)', pool.length === 9 && allMapped && CATS.every(c => pool.some(k => CAT[k] === c)), '');
  // 분류표 고정
  const expect = { heal: '치유', big: '치유', pray: '치유', shield: '보호', save: '보호', dispel: '정화·유틸', renew: '지속·자원', seed: '지속·자원', focus: '지속·자원' };
  chk('c3 9스킬 분류표 고정', Object.keys(expect).every(k => CAT[k] === expect[k]), '');
}

// 2. 장착 슬롯 6칸 구조 유지 + sticky 고정 구조 존재
{
  sb.LOADOUT = ['heal', 'big', 'shield', 'dispel', 'renew', 'seed'];
  const html = chapelHtml();
  const slots = (html.match(/class="ldSlot /g) || []).length; // 공백 뒤 → empty/filled만(컨테이너 ldSlots 제외)
  chk('c4 장착 슬롯 6칸', slots === 6, 'slots=' + slots);
  chk('c5 sticky 고정 구조(#chapel-fixed + CSS position:sticky)',
    html.indexOf('id="chapel-fixed"') >= 0 && /#chapel-fixed\{[^}]*position:sticky/.test(src), '');
}

// 3. 슬롯 상태 3종 클래스 존재 (empty/filled/sel)
{
  sb.LOADOUT = ['heal', 'big', 'shield']; // 3장착 → 3 filled + 3 empty · CHAPEL_CAT=치유 → heal/big=sel
  sb.CHAPEL_CAT = '치유';
  const html = chapelHtml();
  chk('c6 슬롯 상태 3종(비어있음/장착됨/선택중)',
    html.indexOf('ldSlot empty') >= 0 && html.indexOf('ldSlot filled') >= 0 && html.indexOf('ldSlot filled sel') >= 0, '');
  sb.LOADOUT = ['heal', 'big', 'shield', 'dispel', 'renew', 'seed'];
}

// 4. 카테고리 탭 4개 + 탭 선택 구조 (data-cat + ldCatBtn)
{
  const html = chapelHtml();
  const tabs = (html.match(/class="ldCatBtn/g) || []).length;
  chk('c7 카테고리 탭 4개 + data-cat 선택 구조', tabs === 4 && html.indexOf('data-cat=') >= 0 && html.indexOf('ldCatBtn on') >= 0, 'tabs=' + tabs);
}

// 5. 탭별 스킬 필터 — 활성 카테고리 스킬만 표시
{
  const listOf = () => { const html = chapelHtml(); return html.slice(html.indexOf('id="chapel-list"')); }; // 탭 라벨 제외, 스킬 목록만
  sb.CHAPEL_CAT = '지속·자원'; let list = listOf();
  const jisokOnly = list.indexOf('소생') >= 0 && list.indexOf('기도씨앗') >= 0 && list.indexOf('성심 집중') >= 0 && list.indexOf('보호막') < 0 && list.indexOf('정화') < 0;
  chk('c8 탭별 스킬 필터(지속·자원=소생/기도씨앗/성심 집중만)', jisokOnly, '');
  sb.CHAPEL_CAT = '보호'; list = listOf();
  chk('c9 보호 탭=보호막/긴급 구원', list.indexOf('보호막') >= 0 && list.indexOf('긴급 구원') >= 0 && list.indexOf('소생') < 0, '');
  sb.CHAPEL_CAT = '치유';
}

// 6. loadout 구성 요약 — 일반 성향(보스 무관) · 최대 3줄
{
  // 정화·지속·보호 없는 구성 → 경고 성향
  sb.LOADOUT = ['heal', 'big', 'pray', 'save', 'focus', 'renew']; // dispel·shield 없음, renew는 있음
  const sum = sb.chapelSummary();
  chk('c10 구성 요약 최대 3줄', sum.length >= 1 && sum.length <= 3, 'len=' + sum.length);
  const text = sum.map(s => s[1]).join(' ');
  chk('c11 요약=일반 성향(정화 없음 성향·보스 어휘 없음)',
    text.indexOf('정화 없음') >= 0 && text.indexOf('낙인') < 0 && text.indexOf('차단') < 0 && text.indexOf('모르가스') < 0, text);
  sb.LOADOUT = ['heal', 'big', 'shield', 'dispel', 'renew', 'seed'];
}

// 7. 성당 직접 전투 시작 버튼 제거 (chapel-start / enterBattle(1) 부재)
{
  const html = chapelHtml();
  chk('c12 성당 전투 시작 버튼 제거(chapel-start 부재)',
    html.indexOf('chapel-start') < 0 && html.indexOf('이 구성으로 전투 시작') < 0 && src.indexOf('chapel-start') < 0 && src.indexOf('enterBattle(1)') < 0, '');
  // 저장 버튼은 정적 #chapel-foot(twScroll 밖 하단 고정)로 이동 — 렌더 innerHTML엔 없음
  chk('c13 저장하고 마을로 하단 고정(#chapel-foot)',
    html.indexOf('chapel-save') < 0 && /<div id="chapel-foot"><button[^>]*id="chapel-save"[^>]*>🏛️ 저장하고 마을로<\/button><\/div>/.test(src) && /#chapel-foot\{[^}]*\}/.test(src), '');
}

// 8. 토벌 게시판/보스 선택 출격 흐름 유지 (sortie→enterBattle(SELECTED_BOSS))
chk('c14 정식 출격 흐름 유지(sortieGo→enterBattle(SELECTED_BOSS))',
  /function sortieGo\(\)\{enterBattle\(SELECTED_BOSS\);\}/.test(src) && /function enterBattle\(slot\)\{/.test(src), '');

// 9. 3보스 no-input smoke 기준선 유지
chk('c15 3보스 스모크 기준선',
  JSON.stringify(sh.smoke()) === '{"over":true,"result":"defeat","t":51.4,"steps":1029}' &&
  JSON.stringify(sh.smoke('shell_iron')) === '{"over":true,"result":"defeat","t":48.5,"steps":971}' &&
  JSON.stringify(sh.smoke('shell_thirst')) === '{"over":true,"result":"defeat","t":61.8,"steps":1236}', '');

// 10. 금지선 — Save/localStorage 확장 0 · Math.random 0 · 외부 에셋 0 · 새 스킬 0
{
  const keys = (src.match(/const KEY='[^']*'/g) || []);
  chk('c16 Save 확장 없음(SAVE 키 1개)', keys.length === 1 && /seedHealer00/.test(src), '');
  chk('c17 금지 grep 0(Math.random/에셋)', ['Math.random', 'base64', '<img', '.png', 'assets'].every(p => src.indexOf(p) < 0), '');
  chk('c18 스킬 풀 9종 불변(새 스킬 0)', sb.LOADOUT_POOL.length === 9 && sb.LOADOUT_POOL.join(',') === 'heal,big,shield,dispel,pray,save,renew,seed,focus', '');
}

// 11. 실기 피드백 4항목(v2) 반영 검증
{
  // #1 선택 카드 가독성 — .on 배경이 다크(#161027 계열) 아님 + 이름/설명 대비 규칙 존재
  const onDark = /\.twSkill\.ldSel\.on\{[^}]*#0f2417/.test(src) || /\.twSkill\.ldSel\.on\{[^}]*#16351f/.test(src);
  chk('c19 선택 카드 가독성(다크 배경 제거 + 이름/설명 대비)',
    !onDark && /\.twSkill\.ldSel\.on \.twSkillB b\{color:/.test(src) && /\.twSkill\.ldSel\.on \.twSkillD\{color:/.test(src), '');
  // #2 마나/신성력 구분 — rMana/rHoly 클래스 + 렌더에서 자원 분기
  sb.CHAPEL_CAT = '보호'; const bh = (function () { sb.renderChapel(); return h._els['chapel-list'] ? '' : ''; })();
  chk('c20 마나/신성력 색·아이콘 구분(rMana/rHoly)',
    /\.twSkillC\.rMana\{color:/.test(src) && /\.twSkillC\.rHoly\{color:/.test(src) && /신성력'\)>=0\?'rHoly':'rMana'/.test(src) && /'✦ ':'💧 '/.test(src), '');
  sb.CHAPEL_CAT = '치유';
  // #3 저장 버튼 하단 고정 3존 — #chapel-foot(정적) + #chapel-fixed(sticky top)
  chk('c21 3존 레이아웃(상단 fixed/중단 scroll/하단 foot)',
    /id="chapel-foot"/.test(src) && /#chapel-fixed\{[^}]*position:sticky/.test(src) && /#chapel-foot\{[^}]*flex:none/.test(src), '');
  // #4 요약 영역 높이 고정 — .ldSum min-height
  chk('c22 요약 영역 높이 고정(.ldSum min-height)', /\.ldSum\{[^}]*min-height:/.test(src), '');
}

console.log(`\n${fail === 0 ? '★ CHAPEL LOADOUT UI CHECK PASS' : '★ CHAPEL LOADOUT UI CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
