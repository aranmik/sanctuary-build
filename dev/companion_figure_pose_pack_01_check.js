'use strict';
// Companion Figure Pose Pack 01 전용 검증 (독립 프리뷰 · index.html 무접촉)
// 실행: node dev/companion_figure_pose_pack_01_check.js
// 도적·마법사·주술사 행위 포즈 어휘 5종+ · 전사 비교 · 4인 Actor Ensemble · 4 프리셋이
// 정적 포즈 문법으로 확보됐고, 행동선/데칼/runtime/외부에셋이 없으며 index/CORE가 무결한지.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const PREV = path.join(ROOT, 'dev', 'companion_figure_pose_pack_01.html');
const DOC = path.join(ROOT, 'docs', '51_COMPANION_FIGURE_POSE_PACK_01.md');

let pass = 0, fail = 0;
function chk(name, cond, detail) {
  cond ? pass++ : fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
}
const html = fs.existsSync(PREV) ? fs.readFileSync(PREV, 'utf8') : '';
const doc = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '';
const has = s => html.indexOf(s) >= 0;
const cnt = s => html.split(s).length - 1;
// data-pose 값 셋(직업별 CSS 규칙에서 추출)
function poseSet(job) {
  const re = new RegExp('\\.sb-' + job + '\\[data-pose="([a-z]+)"\\]', 'g');
  const set = new Set(); let m;
  while ((m = re.exec(html))) set.add(m[1]);
  return set;
}

// 1~2. 파일/문서 존재
chk('c1 프리뷰 파일 존재', fs.existsSync(PREV), '');
chk('c2 docs/51 문서 존재', fs.existsSync(DOC), '');

// 3. 도적 포즈 5종 (기본 + interrupt/dash/strike/recover)
const rp = poseSet('rogue');
chk('c3 도적 포즈 5종(기본+차단준비/진입/차단성공/복귀)',
  rp.has('interrupt') && rp.has('dash') && rp.has('strike') && rp.has('recover') && rp.size >= 4,
  '기본+' + [...rp].join(','));

// 4. 마법사 포즈 5종 (기본 + charge/channel/release/aftercast)
const mp = poseSet('mage');
chk('c4 마법사 포즈 5종(기본+충전/시전집중/발사직전/시전후)',
  mp.has('charge') && mp.has('channel') && mp.has('release') && mp.has('aftercast') && mp.size >= 4,
  '기본+' + [...mp].join(','));

// 5. 주술사 포즈 5종 (기본 + sustain/cleanse/pulse/rescue)
const sp = poseSet('shaman');
chk('c5 주술사 포즈 5종(기본+유지/정화/지원파동/수습)',
  sp.has('sustain') && sp.has('cleanse') && sp.has('pulse') && sp.has('rescue') && sp.size >= 4,
  '기본+' + [...sp].join(','));

// 6. 전사 비교 피규어 + 포즈 (guard/brace/resolve)
const wp = poseSet('warrior');
chk('c6 전사 비교 피규어+포즈(방패/피격대비/버티기)',
  has('sb-warrior') && wp.has('guard') && wp.has('brace') && wp.has('resolve'), '기본+' + [...wp].join(','));

// 7. 4인 Actor Ensemble (전사+3동료 대치)
chk('c7 4인 Actor Ensemble(전사+도적+마법사+주술사+파쇄자)',
  has('id="eWar"') && has('id="eRog"') && has('id="eMage"') && has('id="eSham"') && has('id="eIron"'), '');

// 8. 4개 추천 프리셋
chk('c8 추천 프리셋 4종(기본대치/강타대응/파티행동폭발/수습과회수)',
  has('기본 대치') && has('강타 대응') && has('파티 행동 폭발') && has('수습과 회수') &&
  cnt('sb-preset') >= 4, '');

// 9. 각 직업 개별 포즈 전환 UI
chk('c9 직업별 개별 포즈 전환 UI(ctlWar/Rog/Mage/Sham)',
  has('id="ctlWar"') && has('id="ctlRog"') && has('id="ctlMage"') && has('id="ctlSham"'), '');

// 10. 포즈 이름 + 전투 의미 라벨 (POSE 배열 + 갤러리 이름표)
chk('c10 포즈 이름+의미 라벨(갤러리 sb-gal-nm + 의미 small)',
  has('sb-gal-nm') && has('Interrupt Ready') && has('Charge') && has('Support Pulse') &&
  has('Rescue'), '');

// 11. data-pose 구조
chk('c11 data-pose 포즈 구조', has('data-pose="') && cnt('[data-pose="') >= 12, cnt('[data-pose="') + '개 규칙');

// 12. sb- 네임스페이스 유지
chk('c12 sb- 네임스페이스(다수) 유지', cnt('sb-') >= 40, '');

// 13. 일반명 신규 클래스 없음
chk('c13 일반명 신규 클래스 0',
  !/[^-\w]\.body[\s{]/.test(html) && !/[^-\w]\.orb[\s{]/.test(html) &&
  !/[^-\w]\.head[\s{]/.test(html) && !/[^-\w]\.pose[\s{]/.test(html), '');

// 14. 3층 transform 구조 유지 (.sb-react/.sb-fit/.sb-fig + 포즈는 react/part)
chk('c14 3층 transform(.sb-unit/.sb-react/.sb-fit/.sb-fig)',
  has('.sb-unit{') && has('.sb-react{') && has('.sb-fit{') && has('.sb-fig{') &&
  has('] .sb-react{transform'), '');

// 15. 행동선 미구현
chk('c15 행동선/공격궤적 미구현(sb-line/svg/stroke 0)',
  !has('sb-line') && !has('<svg') && !has('sbSmashLine') && !has('stroke-dash'), '');

// 16. 데칼/예고 미구현
chk('c16 데칼/예고/타깃선 미구현',
  !has('sb-decal') && !has('sb-telegraph') && !has('sb-target'), '');

// 17. 외부 에셋 없음
{
  const forbid = ['<img', '.png', '.jpg', '.webp', 'base64', 'url(http', '@import', 'assets/'];
  const found = forbid.filter(p => html.indexOf(p) >= 0);
  chk('c17 외부 에셋 0', found.length === 0, found.join(','));
}

// 18. 외부 네트워크 의존 없음
chk('c18 외부 네트워크 의존 0(fetch/XHR/ws/cdn 0)',
  !has('fetch(') && !has('XMLHttpRequest') && !has('WebSocket') && !has('//cdn') && !has('http://') && !has('https://'), '');

// 19. index.html md5 기준선 유지 (무변경)
{
  const buf = fs.readFileSync(path.join(ROOT, 'index.html'));
  chk('c19 index.html 무변경(227,650 B · md5 5d645ffc…)',
    buf.length === 227650 &&
    crypto.createHash('md5').update(buf).digest('hex') === '5d645ffcf1592f1430b73647f4c39ccb', '');
}

// 20. CORE 기준선 유지
{
  const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const lines = src.split('\n');
  let f = 0, core = [];
  for (const l of lines) { if (l.includes('//__CORE_START__')) { f = 1; continue; } if (l.includes('//__CORE_END__')) f = 0; if (f) core.push(l); }
  const bytes = Buffer.byteLength(core.join('\n') + '\n', 'utf8');
  const cmd5 = crypto.createHash('md5').update(core.join('\n') + '\n').digest('hex');
  chk('c20 CORE 466줄/22,521 B byte-identical', core.length === 466 && bytes === 22521 &&
    cmd5 === '6cad2ec271a2a79afbee881c2a2e0856', core.length + '줄/' + bytes + 'B/' + cmd5.slice(0, 8));
}

// 21. 기존 Preview/Pose Pack 문서·프리뷰 유지
chk('c21 기존 Preview/Pose Pack 자산 유지',
  ['dev/companion_figure_kit_preview_02.html', 'dev/battle_figure_pose_pack_01.html',
   'docs/48_COMPANION_FIGURE_KIT_PREVIEW_02.md', 'docs/43_BATTLE_FIGURE_POSE_PACK_01.md',
   'docs/50_PARTY_FIGURE_LAYOUT_REWORK_01.md'].every(f => fs.existsSync(path.join(ROOT, f))), '');

// 22. HOLD 산출물 미유입
chk('c22 HOLD 파일 repo 미유입',
  ['docs/40_IRON_CRUSHER_ACTION_LINE_PROTO.md', 'dev/p20.mjs', 'dev/core_new.js']
    .every(f => !fs.existsSync(path.join(ROOT, f))), '');

// 23. 마법사 금빛점 후보(A/B/C) 비교 존재
chk('c23 마법사 금빛점 후보 비교(sb-tipB/sb-tipC)',
  has('sb-tipB') && has('sb-tipC') && has('sb-m-tip'), '');

// 24. docs/51 필수 절
chk('c24 docs/51 필수 절(의도/도적·마법사·주술사 포즈/프리셋/금빛점/runtime후보/리스크)',
  ['나라님 의도', '도적 포즈', '마법사 포즈', '주술사 포즈', '추천 장면 프리셋',
   '금빛', 'runtime 연결 후보', '남은 시각 리스크', 'index.html 무변경'].every(s => doc.indexOf(s) >= 0), '');

console.log(`\n${fail === 0 ? '★ COMPANION FIGURE POSE PACK 01 CHECK PASS' : '★ COMPANION FIGURE POSE PACK 01 CHECK FAIL'} (${pass} pass / ${fail} fail)`);
process.exit(fail === 0 ? 0 : 1);
