const CFG={
 dur:75, gcd:1.0, gcdValor:0.85,
 mana:{max:520,start:520,regen:3.2,valorBonus:5},
 holy:{regen:1.6,perCast:3,max:100},
 priest:{hp:780},
 allies:[
  {id:'war', name:'전사',   emoji:'🛡️', role:'탱커',     hp:1050, atk:32, per:2.0},
  {id:'rog', name:'도적',   emoji:'🗡️', role:'차단·근딜', hp:640,  atk:46, per:1.5},
  {id:'mage',name:'마법사', emoji:'🔮', role:'주딜러',   hp:580,  atk:92, per:2.2},
  {id:'sham',name:'주술사', emoji:'🌀', role:'지원',     hp:700,  atk:22, per:2.0}
 ],
 boss:{
  name:'핏빛 예언자 모르가스', hp:7200,
  melee:55, meleePer:2.0, enMelee:78, enMeleePer:1.7, offTankMul:1.5,
  smash:250, enSmash:300, smashBlocked:0.5, smashCast:1.4,
  judge:180, enJudge:225, judgeCast:2.5,
  brandTick:20, brandDur:8, brandAmp:1.15,
  bomb:240, bombFuse:3
 },
 intCd:20,
 valor:{dur:12,atkMul:1.3,castMul:0.85},
 skills:{
  heal:  {name:'단일 치유',  mana:40,  heal:200, cast:0},
  big:   {name:'강력 치유',  mana:75,  heal:520, cast:1.6},
  shield:{name:'보호막',     mana:55,  absorb:320, dur:5, lock:6},
  dispel:{name:'정화',       mana:45,  cd:3},
  pray:  {name:'치유의 기도', mana:100, heal:240, cast:2.0, cd:8},
  save:  {name:'긴급 구원',  holy:100, floor:0.35, immune:2}
 }
};
/* 고정 스크립트 — 난수 0. 매판 동일. 변수는 오직 사제의 손. */
const SCRIPT=[
 {t:8, e:'smash'},
 {t:10,e:'brand',tg:'mage'},
 {t:15,e:'judge',j:1},
 {t:20,e:'bomb', tg:'mage'},
 {t:23,e:'smash',blk:1},
 {t:25,e:'valor'},
 {t:28,e:'brand',tg:'war'},
 {t:32,e:'judge',j:2},
 {t:38,e:'smash'},
 {t:43,e:'brand',tg:'rog'},
 {t:48,e:'judge',j:3},
 {t:52,e:'smash',blk:1},
 {t:55,e:'bomb', tg:'sham'},
 {t:60,e:'enrage'},
 {t:63,e:'brand',tg:'mage'},
 {t:66,e:'judge',j:4},
 {t:70,e:'smash'}
];
function createGame(){
 const B=CFG.boss, K=CFG.skills;
 const al=CFG.allies.map(a=>({id:a.id,name:a.name,emoji:a.emoji,role:a.role,max:a.hp,hp:a.hp,atk:a.atk,per:a.per,alive:true,debuffs:[],shield:null,shieldLock:0,undying:0,nextAtk:0}));
 al[0].nextAtk=1.0; al[1].nextAtk=1.2; al[2].nextAtk=1.5; al[3].nextAtk=1.7;
 const S={
  t:0,started:false,over:false,result:'',endT:0,sel:'war',si:0,
  pendJ:null,intReady:0,valorUntil:0,valorOff:false,rogFail:0,
  boss:{hp:B.hp,max:B.hp,cast:null,enraged:false,nextMelee:2.2},
  al,
  pri:{id:'pri',name:'사제',emoji:'✨',role:'플레이어',max:CFG.priest.hp,hp:CFG.priest.hp,
       mana:CFG.mana.start,manaMax:CFG.mana.max,holy:0,gcd:0,cast:null,cdDispel:0,cdPray:0,
       shield:null,shieldLock:0,undying:0,debuffs:[],alive:true},
  st:{heal:0,oh:0,abs:0,disp:0,bombDef:0,bombTot:0,brandTot:0,pray:0,saves:[],deaths:[],
      oomT:0,ints:[],rogAssist:false,holyPeak:0,valorCasts:0,aoes:[],care:0,
      tankLowMax:0,_tls:-1,brandMax:0,manaMin:CFG.mana.start},
  ev:[]
 };
 const E=o=>S.ev.push(o);
 const L=(m,c)=>E({y:'log',m,c:c||'lg'});
 const F=(tg,txt,c)=>E({y:'flt',tg,txt,c});
 const FX=(k,d)=>E({y:'fx',k,d:d||{}});
 const deny=m=>E({y:'deny',m});
 const unit=id=>id==='pri'?S.pri:S.al.find(a=>a.id===id);
 const aliveAll=()=>S.al.filter(a=>a.alive);
 const meleeTgt=()=>{for(const id of ['war','rog','sham','mage']){const a=unit(id);if(a.alive)return a}return null};
 const inValor=()=>S.t<S.valorUntil;
 const hasDeb=(u,k)=>u.debuffs.some(d=>d.k===k);

 function end(kind,msg){
  if(S.over)return;
  S.over=true;S.result=kind;S.endT=S.t;
  if(kind==='victory_kill'){L('🏆 핏빛 예언자 모르가스 처치! 파티가 살아서 이겼습니다!','lgold');FX('win');}
  else if(kind==='victory_survive'){L('🏆 75초 생존! 모르가스가 어둠 속으로 물러갑니다!','lgold');FX('win');}
  else{L('☠️ '+(msg||'패배...'),'lr');FX('lose');}
  E({y:'end',rep:report()});
 }
 function die(u){
  u.alive=false;u.hp=0;u.debuffs=[];u.shield=null;
  S.st.deaths.push({id:u.id,name:u.name,t:S.t});
  L('💀 '+u.name+'이(가) 쓰러졌습니다!','lr');FX('death',{tg:u.id});
  if(u.id==='pri'){end('defeat','사제가 쓰러졌습니다 — 파티를 살릴 손이 사라졌습니다.');return}
  if(S.sel===u.id){const n=meleeTgt();S.sel=n?n.id:'pri';E({y:'sel'});}
  if(aliveAll().length===0){end('defeat','파티가 전멸했습니다.');return}
  if(u.id==='war'){const n=meleeTgt();if(n)L('⚠️ 전사가 무너졌다! 보스가 '+n.name+'에게 달려듭니다!','lo');}
 }
 function dmg(u,amt,tag){
  if(S.over||!u.alive)return;
  let a=amt;
  if(tag!=='dot'&&hasDeb(u,'brand'))a=Math.round(a*B.brandAmp);
  if(u.shield&&a>0){
   const use=Math.min(u.shield.amt,a);
   u.shield.amt-=use;a-=use;S.st.abs+=use;
   if(use>0)F(u.id,'('+Math.round(use)+')','abs');
   if(u.shield.amt<=0.5){u.shield=null;F(u.id,'보호막 파괴','abs');}
  }
  if(a<=0)return;
  u.hp-=a;
  F(u.id,'-'+a,'dmg');
  if(u.hp<=0){
   if(u.undying>S.t){u.hp=1;F(u.id,'불굴!','gold');L('⚜️ '+u.name+' — 구원의 가호가 죽음을 막았습니다!','lgold');FX('save',{tg:u.id,echo:1});}
   else{die(u);return}
  }
  if((tag==='aoe'||tag==='smash'||tag==='bomb')&&u.alive&&u.hp/u.max<0.3)FX('vign');
 }
 function heal(u,amt){
  if(!u.alive)return 0;
  const eff=Math.min(amt,u.max-u.hp);
  u.hp+=eff;
  S.st.heal+=eff;S.st.oh+=(amt-eff);
  if(eff>0)F(u.id,'+'+eff,'heal');
  return eff;
 }
 function payMana(c){S.pri.mana-=c;if(S.pri.mana<S.st.manaMin)S.st.manaMin=S.pri.mana;if(!S.st.oomT&&S.pri.mana<40)S.st.oomT=S.t;}
 function addHoly(n){S.pri.holy=Math.min(CFG.holy.max,S.pri.holy+n);if(S.pri.holy>S.st.holyPeak)S.st.holyPeak=S.pri.holy;}
 function select(id){const u=unit(id);if(!u)return;if(!u.alive){deny('이미 쓰러진 대상입니다');return}S.sel=id;E({y:'sel'});}
 function cancelCast(){if(S.pri.cast){S.pri.cast=null;L('시전을 취소했습니다.','lg');}}

 function useSkill(k){
  if(!S.started||S.over)return false;
  const p=S.pri, sk=K[k], tg=unit(S.sel);
  if(p.cast){deny('시전 중 — 시전 바를 탭하면 취소');return false}
  if(S.t<p.gcd)return false;
  if(k==='save'){
   if(p.holy<CFG.holy.max){deny('신성력 부족 ('+Math.floor(p.holy)+'/100)');return false}
  }else if(p.mana<sk.mana){deny('마나가 부족합니다');L('❕ 마나가 부족합니다!','lo');return false}
  if(k==='dispel'&&S.t<p.cdDispel){deny('정화 대기 '+(p.cdDispel-S.t).toFixed(1)+'초');return false}
  if(k==='pray'&&S.t<p.cdPray){deny('기도 대기 '+(p.cdPray-S.t).toFixed(1)+'초');return false}
  if(!tg||!tg.alive){deny('대상이 없습니다');return false}
  if(k==='shield'&&S.t<tg.shieldLock){deny(tg.name+' 보호막 재적용 대기 '+(tg.shieldLock-S.t).toFixed(1)+'초');return false}
  if(k==='dispel'&&tg.debuffs.length===0){deny('제거할 해로운 효과가 없습니다');return false}
  if(inValor())S.st.valorCasts++;
  const gcd=()=>{p.gcd=S.t+(inValor()?CFG.gcdValor:CFG.gcd);};
  switch(k){
   case 'heal':
    payMana(sk.mana);gcd();
    heal(tg,sk.heal);addHoly(CFG.holy.perCast);
    L('✨ 단일 치유 → '+tg.name,'lh');FX('heal',{tg:tg.id});break;
   case 'big':{
    const ct=sk.cast*(inValor()?CFG.valor.castMul:1);
    p.cast={k:'big',tg:tg.id,name:'강력 치유',end:S.t+ct,dur:ct};gcd();FX('castStart');break}
   case 'pray':{
    const ct=sk.cast*(inValor()?CFG.valor.castMul:1);
    p.cast={k:'pray',name:'치유의 기도',end:S.t+ct,dur:ct};gcd();FX('castStart');break}
   case 'shield':
    payMana(sk.mana);gcd();
    tg.shield={amt:sk.absorb,end:S.t+sk.dur};tg.shieldLock=S.t+sk.lock;
    addHoly(CFG.holy.perCast);
    L('🔰 보호막 → '+tg.name+' ('+sk.absorb+' 흡수 / '+sk.dur+'초)','lh');F(tg.id,'보호막','abs');FX('shield',{tg:tg.id});break;
   case 'dispel':{
    payMana(sk.mana);gcd();p.cdDispel=S.t+sk.cd;S.st.disp++;
    const d=tg.debuffs.find(x=>x.k==='bomb')||tg.debuffs[0];
    tg.debuffs=tg.debuffs.filter(x=>x!==d);
    if(d.k==='bomb'){
     S.st.bombDef++;
     L('💫 정화! '+tg.name+'의 불안정한 마력 무효화 — 폭발하지 않습니다!','lgold');
     F(tg.id,'폭발 무효!','gold');FX('dispel',{tg:tg.id,big:1});
    }else{
     const held=S.t-d.t0;if(held>S.st.brandMax)S.st.brandMax=held;
     if(tg.id==='rog'&&S.t>=43&&S.t<48.8)S.st.rogAssist=true;
     L('💫 '+tg.name+'의 피의 낙인을 정화했습니다.','lh');
     F(tg.id,'정화','gold');FX('dispel',{tg:tg.id});
    }
    addHoly(CFG.holy.perCast);break}
   case 'save':{
    p.holy-=CFG.holy.max;gcd();
    const before=tg.hp/tg.max;
    tg.hp=Math.max(tg.hp,Math.round(tg.max*sk.floor));
    tg.undying=S.t+sk.immune;
    S.st.saves.push({t:S.t,tg:tg.id,name:tg.name,before});
    L('⚜️ 긴급 구원! '+tg.name+'이(가) 황금빛에 감싸입니다. (2초 사망 방지)','lgold');
    F(tg.id,'구 원','gold');FX('save',{tg:tg.id});break}
  }
  return true;
 }
 function resolvePriCast(){
  const c=S.pri.cast;S.pri.cast=null;
  const sk=K[c.k];
  if(c.k==='big'){
   const tg=unit(c.tg);
   if(!tg.alive){L('🌟 강력 치유 무산 — 대상이 이미 쓰러졌습니다.','lo');FX('fizzle');return}
   payMana(sk.mana);
   heal(tg,sk.heal);addHoly(CFG.holy.perCast);
   L('🌟 강력 치유 → '+tg.name,'lh');FX('heal',{tg:tg.id,big:1});
  }else{
   payMana(sk.mana);S.pri.cdPray=S.t+sk.cd;S.st.pray++;
   aliveAll().slice().forEach(a=>heal(a,sk.heal));
   heal(S.pri,sk.heal);
   addHoly(CFG.holy.perCast+1);
   L('🙏 치유의 기도 — 파티 전체 +'+sk.heal,'lh');FX('pray');
  }
 }

 function fireScript(ev){
  switch(ev.e){
   case 'smash':{
    const w=unit('war');const tg=(w&&w.alive)?w:meleeTgt();
    if(!tg)break;
    S.boss.cast={kind:'smash',name:'탱커 강타',start:S.t,end:S.t+B.smashCast,tg:tg.id,blk:ev.blk||0};
    L('🔨 모르가스가 강타를 준비합니다 → '+tg.name,'lb');FX('bossCast');break}
   case 'judge':{
    const un=ev.j===4;
    S.boss.cast={kind:'judge',name:'어둠의 심판',start:S.t,end:S.t+B.judgeCast,j:ev.j,un};
    if(un){L('⚡ 광폭화한 모르가스의 어둠의 심판 — 차단 불가!','lr');S.st.ints.push({j:ev.j,ok:-1,r:'광폭화 — 차단 불가'});FX('judgeWarn',{un:1});}
    else{L('⚡ 모르가스가 어둠의 심판을 시전합니다! (차단 가능)','lb');S.pendJ={t:S.t+0.8,j:ev.j};FX('judgeWarn');}
    break}
   case 'brand':{
    const tg=unit(ev.tg);if(!tg||!tg.alive)break;
    S.st.brandTot++;
    tg.debuffs.push({k:'brand',t0:S.t,end:S.t+B.brandDur,tick:S.t+1});
    L('🩸 '+tg.name+'에게 피의 낙인! (8초 출혈·받는 피해 +15% — 정화 가능)','lo');
    F(tg.id,'낙인','dmg');FX('debuff',{tg:tg.id});break}
   case 'bomb':{
    const tg=unit(ev.tg);if(!tg||!tg.alive)break;
    S.st.bombTot++;
    tg.debuffs.push({k:'bomb',t0:S.t,end:S.t+B.bombFuse});
    L('💥 '+tg.name+'에게 불안정한 마력! 3초 뒤 폭발 — 정화로 무효화!','lr');
    F(tg.id,'폭탄!','dmg');FX('debuff',{tg:tg.id,bomb:1});break}
   case 'valor':
    S.valorUntil=S.t+CFG.valor.dur;
    L('🌀 주술사가 전투 의지를 외칩니다! 12초간 파티 공격·사제 시전 가속, 마나 회복 증가!','lgold');
    FX('valor');break;
   case 'enrage':
    S.boss.enraged=true;
    L('🔥 모르가스가 광폭화합니다! 모든 피해가 증가합니다!','lr');
    FX('enrage');break;
  }
 }
 function tryInterrupt(j){
  const rog=unit('rog');
  const fail=r=>{
   S.rogFail=S.t+2.5;
   L('❌ 차단 실패 — '+r,'lr');
   if(rog&&rog.alive)F('rog','차단 실패!','dmg');
   S.st.ints.push({j,ok:0,r});FX('intFail');
  };
  if(!rog||!rog.alive){fail('차단할 도적이 전장에 없습니다');return}
  if(S.t<S.intReady){fail('도적의 차단 재사용 대기 '+(S.intReady-S.t).toFixed(1)+'초');return}
  const d=rog.debuffs[0];
  if(d){fail((d.k==='brand'?'도적이 피의 낙인에 걸려':'도적이 불안정한 마력에 휘말려')+' 반응이 늦었습니다');return}
  S.boss.cast=null;
  S.intReady=S.t+CFG.intCd;
  S.boss.nextMelee=Math.max(S.boss.nextMelee,S.t+1.4);
  const asst=(j===3&&S.st.rogAssist);
  L('✅ 도적이 어둠의 심판을 차단했습니다!'+(asst?' (사제의 정화 지원!)':''),'lh');
  F('rog','차단!','gold');
  S.st.ints.push({j,ok:1,asst});FX('intOk');
 }
 function resolveBossCast(){
  const c=S.boss.cast;S.boss.cast=null;
  S.boss.nextMelee=Math.max(S.boss.nextMelee,S.t+0.8);
  if(c.kind==='smash'){
   const tg=unit(c.tg);
   if(!tg.alive){L('강타가 허공을 갈랐습니다.','lg');return}
   let d=S.boss.enraged?B.enSmash:B.smash;
   if(c.blk){d=Math.round(d*B.smashBlocked);L('🛡️ 전사가 방패로 강타를 막았습니다! (피해 절반)','lh');F(tg.id,'방패 막기','abs');}
   dmg(tg,d,'smash');FX('smash',{tg:tg.id});
  }else{
   const d=S.boss.enraged?B.enJudge:B.judge;
   const h0=S.st.heal;
   aliveAll().slice().forEach(a=>dmg(a,d,'aoe'));
   dmg(S.pri,d,'aoe');
   S.st.aoes.push({t:S.t,tot:d*5,h0,done:false});
   L('💥 어둠의 심판이 파티를 덮칩니다! (전원 '+d+' 피해)','lr');FX('aoe');
  }
 }

 function step(dt){
  if(!S.started||S.over)return;
  S.t+=dt;const t=S.t,p=S.pri;
  while(S.si<SCRIPT.length&&SCRIPT[S.si].t<=t){fireScript(SCRIPT[S.si]);S.si++;if(S.over)return}
  if(S.valorUntil&&!S.valorOff&&t>=S.valorUntil){S.valorOff=true;L('전투 의지가 잦아듭니다.','lg');FX('valorOff');}
  p.mana=Math.min(p.manaMax,p.mana+(CFG.mana.regen+(inValor()?CFG.mana.valorBonus:0))*dt);
  addHoly(CFG.holy.regen*dt);
  if(p.cast&&t>=p.cast.end){resolvePriCast();if(S.over)return}
  if(S.pendJ&&t>=S.pendJ.t){const j=S.pendJ.j;S.pendJ=null;if(S.boss.cast&&S.boss.cast.kind==='judge')tryInterrupt(j);}
  if(S.boss.cast&&t>=S.boss.cast.end){resolveBossCast();if(S.over)return}
  if(!S.boss.cast&&t>=S.boss.nextMelee){
   const tg=meleeTgt();
   if(tg){
    let d=S.boss.enraged?B.enMelee:B.melee;
    if(tg.id!=='war')d=Math.round(d*B.offTankMul);
    dmg(tg,d,'melee');FX('melee',{tg:tg.id});
    if(S.over)return;
   }
   S.boss.nextMelee=t+(S.boss.enraged?B.enMeleePer:B.meleePer);
  }
  const am=inValor()?CFG.valor.atkMul:1;
  for(const a of S.al){
   if(!a.alive)continue;
   if(t>=a.nextAtk){
    S.boss.hp=Math.max(0,S.boss.hp-a.atk);
    a.nextAtk=t+a.per/am;
    FX('allyAtk',{tg:a.id});
   }
  }
  for(const a of S.al){
   if(!a.alive)continue;
   const kept=[];
   for(const d of a.debuffs){
    if(d.k==='brand'){
     while(a.alive&&d.tick<=t&&d.tick<=d.end+0.001){dmg(a,B.brandTick,'dot');d.tick+=1;}
     if(S.over)return;
     if(!a.alive)break;
     if(t>=d.end){const held=d.end-d.t0;if(held>S.st.brandMax)S.st.brandMax=held;continue}
     kept.push(d);
    }else{
     if(t>=d.end){
      L('💥 불안정한 마력이 폭발합니다! → '+a.name,'lr');
      dmg(a,B.bomb,'bomb');FX('bombBoom',{tg:a.id});
      if(S.over)return;
      if(!a.alive)break;
     }else kept.push(d);
    }
   }
   a.debuffs=a.alive?kept:[];
  }
  for(const u of S.al.concat([p])){
   if(u.shield&&t>=u.shield.end){u.shield=null;if(u.alive)F(u.id,'보호막 소멸','abs');}
  }
  const w=unit('war');
  if(w.alive&&w.hp/w.max<0.4){
   if(S.st._tls<0)S.st._tls=t;
   const dlow=t-S.st._tls;
   if(dlow>S.st.tankLowMax)S.st.tankLowMax=dlow;
  }else S.st._tls=-1;
  for(const a2 of S.st.aoes){
   if(!a2.done&&t>=a2.t+6){a2.done=true;a2.healed=S.st.heal-a2.h0;if(a2.healed>=a2.tot*0.45)S.st.care++;}
  }
  if(S.boss.hp<=0){end('victory_kill');return}
  if(t>=CFG.dur){end('victory_survive');return}
 }

 function report(){
  const st=S.st;
  const surA=aliveAll().length;
  const surv=surA+(S.pri.alive?1:0);
  const bossPct=Math.round(100*S.boss.hp/S.boss.max);
  const win=S.result.indexOf('victory')===0;
  const ins=[];
  const push=(c,m)=>ins.push({c,m});
  if(S.result==='victory_kill')push('gold','보스 처치 성공. 아군의 생존이 곧 화력이었다 — 힐이 딜을 만들었다.');
  if(S.result==='victory_survive')push('gold','생존 승리. 처치까지 가려면 아군을 더 온전히 살려 공격 시간을 지켜줘야 한다. (남은 보스 HP '+bossPct+'%)');
  if(!win&&st.deaths.length){
   const f=st.deaths[0];
   if(f.id==='war')push('warn','전사가 '+f.t.toFixed(0)+'초에 먼저 무너졌다. 탱커가 쓰러지면 보스는 후열을 문다 — 붕괴의 시작.');
   else if(f.id==='pri')push('warn','사제가 쓰러지면 그걸로 끝이다. 광역 패턴 뒤에는 내 HP도 프레임이다.');
   else push('warn',f.name+'이(가) '+f.t.toFixed(0)+'초에 먼저 쓰러졌다. 죽음의 원인(출혈? 폭발? 광역?)을 로그에서 되짚어 보자.');
  }
  const j3=st.ints.find(i=>i.j===3);
  if(j3&&j3.ok&&j3.asst)push('gold','43초의 낙인을 정화해 도적의 세 번째 차단을 성공시켰다 — 이번 판의 결정적 케어.');
  if(j3&&!j3.ok&&j3.r&&j3.r.indexOf('낙인')>=0)push('warn','48초 차단 실패 — 도적의 피의 낙인을 먼저 정화했다면 차단이 성공했다. 정화는 힐이 아니라 차단 지원이기도 하다.');
  if(st.bombTot>0){
   if(st.bombDef>=st.bombTot)push('gold','불안정한 마력 '+st.bombTot+'회 전부 무효화 — 완벽한 정화 감각.');
   else push('warn','불안정한 마력 '+(st.bombTot-st.bombDef)+'회가 폭발했다. 3초 안의 정화는 피해 자체를 지운다.');
  }
  if(st.saves.length===0&&st.deaths.filter(d=>d.id!=='pri').length>0&&st.holyPeak>=100)push('warn','신성력 100이 잠들어 있는 동안 동료가 쓰러졌다. 긴급 구원은 아끼라고만 있는 버튼이 아니다.');
  const early=st.saves.find(s=>s.before>0.5);
  if(early)push('warn','긴급 구원이 다소 일찍 나갔다 ('+early.name+' HP '+Math.round(early.before*100)+'%). 죽음의 문턱까지 아낄수록 가치가 커진다.');
  if(st.oomT)push('warn','마나가 '+st.oomT.toFixed(0)+'초에 바닥났다. 광역 패턴 직전에는 기도 비용(100)을 남겨두자.');
  if(st.tankLowMax>6)push('warn','전사가 HP 40% 미만으로 최장 '+st.tankLowMax.toFixed(1)+'초 방치됐다. 탱커의 바닥은 전멸의 카운트다운이다.');
  if(st.brandMax>5.5)push('warn','피의 낙인이 최장 '+st.brandMax.toFixed(1)+'초 유지됐다. 정화가 빠를수록 피가 덜 샌다.');
  if(st.valorCasts>=3)push('gold','전투 의지 12초 동안 '+st.valorCasts+'회 시전 — 가속 창을 제대로 썼다.');
  if(st.care>=1)push('gold','광역 피격 후 '+st.care+'회, 파티를 제때 복구했다. 실패를 사건으로 바꾸는 손.');
  if(win&&st.deaths.length===0)push('gold','사망자 0 — 무결점 진형. 다음 판엔 더 공격적인 마나 운용도 가능하다.');
  const ohPct=(st.heal+st.oh)>0?Math.round(100*st.oh/(st.heal+st.oh)):0;
  return {
   r:S.result,t:S.endT,bossPct,bossDead:S.boss.hp<=0,surv,surA,
   heal:Math.round(st.heal),oh:Math.round(st.oh),ohPct,abs:Math.round(st.abs),
   disp:st.disp,bombDef:st.bombDef,bombTot:st.bombTot,pray:st.pray,
   saves:st.saves.length,deaths:st.deaths.slice(),oomT:st.oomT,
   ints:st.ints.slice(),care:st.care,manaMin:Math.round(st.manaMin),
   ins:ins.slice(0,5)
  };
 }
 function nextPattern(){
  const NM={smash:'🔨 탱커 강타',judge:'⚡ 어둠의 심판',brand:'🩸 피의 낙인',bomb:'💥 불안정한 마력',valor:'🌀 전투 의지',enrage:'🔥 광폭화'};
  if(S.si<SCRIPT.length){const e=SCRIPT[S.si];return{nm:NM[e.e],eta:e.t-S.t}}
  return null;
 }
 function start(){S.started=true;L('전투 개시 — 파티가 핏빛 예언자에게 달려듭니다!','lb');FX('start');}
 return {S,step,useSkill,select,cancelCast,start,nextPattern,report,
  meleeTgtId:()=>{const m=meleeTgt();return m?m.id:null}};
}
if(typeof module!=='undefined'&&module.exports)module.exports={CFG,SCRIPT,createGame};
