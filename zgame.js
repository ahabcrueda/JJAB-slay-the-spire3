'use strict';

(() => {
  const DATA = window.GAME_DATA;
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  const app = $('#app');
  const topStatus = $('#top-status');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const shuffle = list => {
    const a = [...list];
    for (let i=a.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
    return a;
  };
  const pick = list => list[Math.floor(Math.random()*list.length)];
  const cardById = id => DATA.cards[id];
  const hasRelic = id => !!state?.relics?.includes(id);
  const relicById = id => DATA.relics?.find(r => r.id === id);
  const fieldRelics = () => (DATA.relics || []).filter(r => r.rarity !== 'boss');
  const availableRelics = rarity => fieldRelics().filter(r => (!rarity || r.rarity === rarity) && !hasRelic(r.id));
  function grantRelic(id) {
    if (hasRelic(id)) return false;
    const relic = relicById(id);
    if (!relic) return false;
    state.relics.push(id);
    if(id==='endless-hunger') state.heroes.forEach(h=>{h.maxHp=Math.max(1,h.maxHp-10);h.hp=Math.min(h.hp,h.maxHp);});
    addLog(`유물 획득: ${relic.name}.`);
    return true;
  }
  function rollRelicChoices(rarityGroup, count=3) {
    if(rarityGroup==='boss') return shuffle((DATA.relics||[]).filter(r=>r.rarity==='boss'&&!hasRelic(r.id))).slice(0,count);
    const pool=availableRelics();
    const selected=[];
    while(selected.length<count && pool.length) {
      const roll=Math.random();
      let rarity=roll<0.60?'common':roll<0.90?'uncommon':'rare';
      let candidates=pool.filter(r=>r.rarity===rarity);
      if(!candidates.length)candidates=pool;
      const chosen=pick(candidates);
      selected.push(chosen);
      pool.splice(pool.findIndex(r=>r.id===chosen.id),1);
    }
    return selected;
  }
  function addRelicReward(mode) {
    state.relicChoiceMode = mode;
    state.relicChoices = rollRelicChoices(mode === 'boss' ? 'boss' : 'field', 3);
    if (!state.relicChoices.length) {
      state.heroes.forEach(h => h.gold += mode === 'boss' ? 100 : 50);
      state.relicChoiceMode=null;
      continueAfterRelic();
      return;
    }
    state.screen = 'relic-reward';
    render();
  }
  let state = null;
  let pendingVisualEvents = [];
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  function queueVisualEvent(target, result) {
    if (!result || (!result.hpDamage && !result.shieldDamage)) return;
    const heroIndex = state?.heroes?.indexOf(target) ?? -1;
    if (heroIndex >= 0) {
      pendingVisualEvents.push({ side: 'hero', index: heroIndex, ...result });
      return;
    }
    const enemyIndex = state?.battle?.enemies?.indexOf(target) ?? -1;
    if (enemyIndex >= 0) pendingVisualEvents.push({ side: 'enemy', index: enemyIndex, ...result });
  }

  function actorSelector(side, index) {
    return side === 'hero'
      ? `.combatant[data-hero-index="${index}"]`
      : `.enemy-unit[data-enemy-index="${index}"]`;
  }

  async function animateStrike(attackerSide, attackerIndex, targetSide, targetIndex) {
    const attacker = $(actorSelector(attackerSide, attackerIndex));
    const target = $(actorSelector(targetSide, targetIndex));
    const scene = $('.battle-scene');
    if (!attacker || !scene) { await wait(250); return; }
    attacker.classList.remove('is-attacking', 'is-casting');
    void attacker.offsetWidth;
    attacker.classList.add(attackerSide === 'enemy' ? 'is-enemy-attacking' : 'is-attacking');
    if (target) target.classList.add('is-threatened');

    if (target) {
      const from = attacker.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      const root = scene.getBoundingClientRect();
      const projectile = document.createElement('span');
      projectile.className = `attack-projectile ${attackerSide === 'enemy' ? 'projectile-enemy' : 'projectile-hero'}`;
      projectile.style.left = `${from.left + from.width * .58 - root.left}px`;
      projectile.style.top = `${from.top + from.height * .42 - root.top}px`;
      projectile.style.setProperty('--move-x', `${to.left + to.width * .5 - from.left - from.width * .58}px`);
      projectile.style.setProperty('--move-y', `${to.top + to.height * .42 - from.top - from.height * .42}px`);
      scene.appendChild(projectile);
      setTimeout(() => projectile.remove(), 520);
    }
    await wait(380);
    attacker.classList.remove('is-attacking', 'is-enemy-attacking', 'is-casting');
    target?.classList.remove('is-threatened');
  }

  function flushVisualEvents() {
    if (!pendingVisualEvents.length) return;
    const events = pendingVisualEvents.splice(0);
    requestAnimationFrame(() => {
      events.forEach((event, order) => {
        const actor = $(actorSelector(event.side, event.index));
        if (!actor) return;
        actor.classList.remove('is-hit');
        void actor.offsetWidth;
        actor.classList.add('is-hit');
        setTimeout(() => actor.classList.remove('is-hit'), 620);
        const addFloat = (label, type, offset = 0) => {
          const node = document.createElement('span');
          node.className = `battle-float ${type}`;
          node.textContent = label;
          node.style.setProperty('--float-offset', `${offset}px`);
          actor.appendChild(node);
          setTimeout(() => node.remove(), 1050);
        };
        if (event.hpDamage) addFloat(`−${event.hpDamage}`, 'float-hp', order * 15);
        if (event.shieldDamage) addFloat(`▣ −${event.shieldDamage}`, 'float-shield', -order * 12);
      });
    });
  }

  function freshStatus() {
    return { shield:0, strength:0, grit:0, agility:0, weakTurns:0, vulnerableTurns:0, poison:0, burn:0, markTurns:0, markDamage:0, vibration:0, vibrationMilestone:0 };
  }
  function makeHero(id) {
    const ch=DATA.characters[id];
    return {
      ...ch, maxHp:ch.hp, hp:ch.hp, gold:ch.gold, ...freshStatus(), energy:0,
      deck:[...Array(5).fill('strike'),...Array(5).fill('defend')],
      drawPile:[], discardPile:[], hand:[], nextStrength:0, nextGrit:0,
      nextBattleShield:0, nextBattleEnergy:0, nextBattleVulnerable:0,
      runAttackBonus:0, runShieldBonus:0, retainHandNextTurn:false, cardsPlayedThisTurn:0
    };
  }
  function startNewGame() {
    pendingVisualEvents = [];
    state={screen:'select',selected:[],heroes:[],actIndex:0,nodes:[],currentRow:-1,bossReady:false,
      battle:null,logs:[],rewardCards:[],afterReward:'map',shopOffers:[],relicOffer:null,
      relics:[],relicChoices:[],relicChoiceMode:null,seenEvents:[],currentEvent:null,
      nextEliteHpPenalty:0,selectedEnemy:0,runId:Date.now()};
    render();
  }
  function updateTop() {
    if (!topStatus || !state) return;
    if (!state.heroes.length) {
      topStatus.innerHTML='<span class="top-chip">차원 균열 감지</span><span class="top-chip">원정 준비</span>';
      return;
    }
    topStatus.innerHTML=`<span class="top-chip">${state.actIndex+1}장 · ${esc(DATA.acts[state.actIndex].name)}</span>`+
      state.heroes.map(h=>`<span class="top-chip">${esc(h.name)} ♥ ${h.hp}/${h.maxHp} · ¤ ${h.gold}</span>`).join('')+
      `<span class="top-chip relic-count-chip">유물 ${state.relics.length}</span>`;
  }
  function render() {
    updateTop();
    if (!state) return;
    const screens={select:renderSelect,map:renderMap,battle:renderBattle,reward:renderReward,'relic-reward':renderRelicReward,rest:renderRest,shop:renderShop,event:renderEvent,victory:()=>renderEnd(true),defeat:()=>renderEnd(false)};
    (screens[state.screen]||renderSelect)();
  }
  function renderSelect() {
    const chars=Object.values(DATA.characters);
    app.innerHTML=`<section class="screen">
      <div class="eyebrow">MULTIDIMENSION EXPEDITION</div>
      <h1>도망치는 차원을 추적하라.</h1>
      <p class="subtitle">네 명의 전투원 중 두 명을 편성한다. 다섯 장, 160개의 경로 노드, 80종의 적을 지나 창백한 고래를 추적하라.</p>
      <div class="select-layout">
        <section class="panel panel-pad">
          <div class="section-heading"><div><h2>전투원 편성</h2><p>서로 다른 전투원 두 명을 선택한다.</p></div><span class="selection-count">${state.selected.length}/2 선택</span></div>
          <div class="character-grid">${chars.map(ch=>`<button class="character-card ${state.selected.includes(ch.id)?'selected':''}" data-action="character" data-id="${ch.id}" aria-pressed="${state.selected.includes(ch.id)}">
            <img src="${ch.image}" alt="${esc(ch.name)} 초상화"><span class="character-copy"><strong>${esc(ch.name)}</strong><span>체력 ${ch.hp}</span><span>보유금 ${ch.gold}</span><span class="role-line">${esc(ch.role)}</span></span></button>`).join('')}</div>
        </section>
        <aside class="panel panel-pad selection-panel"><div class="eyebrow">FORMATION</div><h2>편성 확인</h2><p class="subtitle">한 번의 원정에는 두 명의 전투원이 함께 참여한다.</p>
          <div class="party-preview">${[0,1].map(i=>{const ch=state.selected[i]?DATA.characters[state.selected[i]]:null;return `<div class="party-slot ${ch?'filled':''}">${ch?`<span>${i+1}번 자리 · <b>${esc(ch.name)}</b></span><span>♥ ${ch.hp} / ¤ ${ch.gold}</span>`:`${i+1}번 아군을 선택하십시오.`}</div>`}).join('')}</div>
          <ul class="rule-list"><li>각 전투원은 공격 5장과 수비 5장으로 시작한다.</li><li>자신의 턴마다 에너지 3을 얻는다.</li><li>전투 순서는 적 → 아군 1 → 아군 2 → 적이다.</li><li>직업 카드 60장과 무색 카드 10장을 보상으로 획득할 수 있다.</li><li>각 장의 맵은 32노드, 8번의 경로 선택으로 구성된다.</li></ul>
          <button class="btn primary full" data-action="start-run" ${state.selected.length!==2?'disabled':''}>원정 시작</button>
        </aside>
      </div>
      <div class="small-note">초기 체력과 재화는 캐릭터 설정값을 사용한다. 카드 보상과 적 능력치는 현재 프로토타입 밸런스 수치다.</div>
    </section>`;
  }
  function buildMap() {
    const pool=shuffle(DATA.nodeTypes.flatMap(t=>Array(t.count).fill(t.id)));
    state.nodes=pool.map((type,i)=>({id:`${state.actIndex}-${Math.floor(i/4)}-${i%4}`,row:Math.floor(i/4),col:i%4,type,visited:false,available:Math.floor(i/4)===0,parents:[],children:[]}));
    for (let row=0;row<7;row++) for(let col=0;col<4;col++) {
      const from=state.nodes[row*4+col];
      for(let nextCol=Math.max(0,col-1);nextCol<=Math.min(3,col+1);nextCol++) {
        const to=state.nodes[(row+1)*4+nextCol];
        from.children.push(to.id); to.parents.push(from.id);
      }
    }
    state.currentRow=-1; state.bossReady=false;
  }
  function relicTray(compact=false) {
    const owned=(state.relics||[]).map(id=>relicById(id)).filter(Boolean);
    if(!owned.length) return `<div class="relic-tray empty"><span>보유 유물 없음</span></div>`;
    return `<div class="relic-tray ${compact?'compact':''}">${owned.map(r=>`<span class="relic-chip rarity-${r.rarity}" title="${esc(r.desc)}"><img src="${r.icon}" alt=""><b>${esc(r.name)}</b></span>`).join('')}</div>`;
  }

  function renderMap() {
    const act=DATA.acts[state.actIndex];
    const pct=state.currentRow<0?0:Math.round((state.currentRow+1)/8*100);
    const coords=n=>({x:50+n.col*100,y:40+n.row*100});
    const lines=state.nodes.flatMap(n=>n.children.map(id=>{
      const to=state.nodes.find(x=>x.id===id); const a=coords(n),b=coords(to);
      const lit=n.visited || to.visited || (n.available&&to.available);
      return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="${lit?'path-lit':''}"/>`;
    })).join('');
    const nodeButtons=state.nodes.map(n=>{
      const def=DATA.nodeTypes.find(t=>t.id===n.type);
      return `<button class="map-node type-${n.type} ${n.available?'available':''} ${n.visited?'visited':''} ${!n.available&&!n.visited?'locked':''}" style="left:${12.5+n.col*25}%;top:${5+n.row*12.5}%" data-action="node" data-id="${n.id}" ${!n.available?'disabled':''} title="${def.name}">${n.visited?'✓':def.symbol}</button>`;
    }).join('');
    app.innerHTML=`<section class="screen">
      <div class="section-heading"><div><div class="eyebrow">ACT ${state.actIndex+1} / 5</div><h1>${esc(act.name)}</h1><p class="subtitle">${esc(act.subtitle)} · 경로 ${Math.max(0,state.currentRow+1)}/8</p></div><div class="progress-chip">진행도 ${pct}%</div></div>
      <div class="map-layout"><section class="panel panel-pad map-wrap"><div class="map-board" style="--act-tint:${act.tint};background-image:linear-gradient(#131c25aa,#0b111ad9),url('zassets/zbackgrounds/zact-${state.actIndex+1}.svg')"><svg class="map-lines" viewBox="0 0 400 800" preserveAspectRatio="none">${lines}</svg>${nodeButtons}</div>
        <div class="map-legend">${DATA.nodeTypes.map(t=>`<div class="legend-item"><span class="legend-symbol">${t.symbol}</span><span>${t.name} <b>(${t.count})</b></span></div>`).join('')}</div>
        ${state.bossReady?`<div class="boss-gate"><div><b>장 보스의 영역</b><span>8개의 경로 선택을 완료했다. 이 장의 보스 후보 두 마리 중 한 마리가 기다린다.</span></div><button class="btn danger" data-action="boss">보스와 대결</button></div>`:''}
      </section><aside class="panel panel-pad"><div class="eyebrow">PARTY STATUS</div><h2>원정대</h2><div class="party-mini">${state.heroes.map(h=>`<div class="hero-mini"><img src="${h.image}" alt=""><div class="grow"><strong>${esc(h.name)}</strong><small>체력 ${h.hp}/${h.maxHp} · 재화 ${h.gold}</small><div class="hp-track"><div class="hp-fill" style="width:${Math.max(0,h.hp/h.maxHp*100)}%"></div></div></div></div>`).join('')}</div><div class="divider"></div><h3>보유 유물 · ${state.relics.length}</h3>${relicTray()}<div class="divider"></div><h3>이번 장의 규칙</h3><p class="small-note">노드를 선택하면 연결된 다음 층만 열린다. 맵의 노드 구성은 일반 전투 16, 휴식 5, 상점 2, 랜덤 선택지 5, 엘리트 4개다.</p><button class="btn secondary full" data-action="restart">원정 처음부터</button></aside></div>
    </section>`;
  }
  function addLog(text) {
    state.logs.unshift(text);
    if(state.logs.length>18) state.logs.length=18;
  }
  function makeHeroStatusClean(hero) {
    Object.assign(hero,freshStatus()); hero.energy=0; hero.hand=[]; hero.drawPile=[]; hero.discardPile=[];
  }
  function cloneEnemy(template,act) {
    const hpScale=1+0.24*(act-1);
    let maxHp=Math.round(template.hp*hpScale);
    if(template.kind==='elite' && state.nextEliteHpPenalty>0){maxHp=Math.max(1,Math.round(maxHp*(1-state.nextEliteHpPenalty)));state.nextEliteHpPenalty=0;}
    return {...template,maxHp,hp:maxHp,damageScale:1+0.14*(act-1),...freshStatus(),actionIndex:0,stunned:0,alive:true,act};
  }
  function chooseEncounter(type) {
    const act=DATA.acts[state.actIndex];
    let templates=[];
    if(type==='combat') templates=shuffle(act.normal).slice(0,Math.random()<.45?1:2);
    else if(type==='elite') templates=[pick([...DATA.commonElites,...act.elites])];
    else if(type==='boss') templates=[pick(act.bosses)];
    return templates.map(t=>cloneEnemy(t,state.actIndex+1));
  }
  function startBattle(type) {
    state.battle={type,enemies:chooseEncounter(type),round:1,heroIndex:0,turn:'enemy',boss:type==='boss',animating:false,
      relicOnce:{}, heroAttackPlayed:[false,false], roundHpDamage:false, roundAttackBonus:[false,false], roundCostlyCard:[false,false]};
    state.selectedEnemy=0; state.logs=[];
    state.heroes.forEach((h,i)=>{
      makeHeroStatusClean(h);h.strength=h.nextStrength||0;h.grit=h.nextGrit||0;h.nextStrength=0;h.nextGrit=0;
      h.shield=0;h.cardsPlayedThisTurn=0;h.retainHandNextTurn=false;
      h.vulnerableTurns=h.nextBattleVulnerable||0;h.nextBattleVulnerable=0;
      h.energyBonusNext=h.nextBattleEnergy||0;h.nextBattleEnergy=0;
      h.startShieldPending=h.nextBattleShield||0;h.nextBattleShield=0;
      if(hasRelic('grit-knot'))h.grit+=1;
      if(hasRelic('pale-crown'))h.strength+=2;
      if(hasRelic('stopped-king-heart'))h.grit+=8;
      if(hasRelic('dimension-scepter'))h.strength+=3;
      if(hasRelic('abyss-throne'))h.vulnerableTurns=Math.max(h.vulnerableTurns,1);
      if(hasRelic('rift-generator'))h.strength+=0;
    });
    state.heroes.forEach(h=>{if(h.startShieldPending){gainShield(h,h.startShieldPending,{fromRelic:true});h.startShieldPending=0;}});
    if(hasRelic('rift-generator')) state.battle.enemies.forEach(e=>e.strength+=2);
    if(hasRelic('first-flint') && state.heroes[0]) gainShield(state.heroes[0],4,{fromRelic:true});
    if((type==='elite'||type==='boss')&&hasRelic('still-fortress')) state.heroes.forEach(h=>gainShield(h,12,{fromRelic:true}));
    state.heroes.forEach(h=>{h.drawPile=shuffle([...h.deck]);});
    addLog('적의 선공! 적의 행동을 확인하라.');
    state.screen='battle';
    renderBattle();
    enemyTurn(true);
  }
  function livingEnemies(){return state.battle.enemies.filter(e=>e.hp>0);}
  function livingHeroes(){return state.heroes.filter(h=>h.hp>0);}
  function drawCards(hero,count) {
    for(let i=0;i<count;i++) {
      if(!hero.drawPile.length) {
        if(!hero.discardPile.length) break;
        hero.drawPile=shuffle(hero.discardPile); hero.discardPile=[];
      }
      hero.hand.push(hero.drawPile.pop());
    }
  }
  function startHeroTurn(index) {
    if(!state || state.screen!=='battle') return;
    if(index>=state.heroes.length) {
      livingEnemies().forEach(enemy=>{
        if(enemy.poison>0) { const amount=enemy.poison; const result=pureDamage(enemy,amount); if(hasRelic('poison-king-seal')) pureDamage(enemy,2); addLog(`${enemy.name}: 독 ${amount}${hasRelic('poison-king-seal')?' + 추가 2':''} 피해. 독이 ${amount-1}로 감소.`); enemy.poison=Math.max(0,enemy.poison-1); }
      });
      if(checkBattleWin())return; enemyTurn(false); return;
    }
    const hero=state.heroes[index];
    if(hero.hp<=0) { startHeroTurn(index+1); return; }
    state.battle.turn='hero'; state.battle.heroIndex=index;
    hero.cardsPlayedThisTurn=0;
    state.battle.relicOnce[`bracer-${index}`]=false;
    const roundEnergy=(hasRelic('triple-spring') && state.battle.round%3===0)?1:0;
    hero.energy=3+(hasRelic('rift-generator')?1:0)+(hero.energyBonusNext||0)+roundEnergy;
    hero.energyBonusNext=0;
    if(hasRelic('pale-star-shard')) {
      loseHpDirect(hero,4,'창백한 별의 파편');
    }
    if(!hero.retainHandNextTurn) hero.hand=[];
    hero.retainHandNextTurn=false;
    const baseDraw=Math.max(0,5-(hasRelic('dimension-scepter')?2:0)-(hasRelic('unclosed-library')?2:0));
    const bonusDraw=(hasRelic('endless-hourglass')&&state.battle.round%3===0)?2:0;
    drawCards(hero,baseDraw+bonusDraw);
    if(hero.nextBattleShield) {gainShield(hero,hero.nextBattleShield,{fromRelic:true});hero.nextBattleShield=0;}
    addLog(`${hero.name}의 턴. 에너지 ${hero.energy}를 회복했다.`);
    if(hero.hp<=1 && hasRelic('pale-star-shard')) addLog('창백한 별의 파편이 생명력을 위협한다.');
    renderBattle();
  }
  function normalizeDamage(amount) { return Math.max(0,Math.floor(amount)); }
  function receiveDamage(target,amount,options={}) {
    let value=normalizeDamage(amount);
    if(value<=0) return {hpDamage:0,shieldDamage:0};
    const shieldDamage=Math.min(target.shield||0,value);
    target.shield=Math.max(0,(target.shield||0)-shieldDamage);
    value-=shieldDamage;
    if(options.useGrit!==false && value>0 && target.grit>0) value=Math.max(0,value-target.grit);
    const hpDamage=Math.min(target.hp,value);
    target.hp=Math.max(0,target.hp-hpDamage);
    if(hpDamage>0 && options.decayGritOnHp!==false && target.grit>0) target.grit=Math.max(0,target.grit-1);
    if(hpDamage>0 && target.markTurns>0 && options.countMark!==false) target.markDamage+=hpDamage;
    if(hpDamage>0 && state?.heroes?.includes(target)) onHeroHpDamage(target);
    if(target.hp<=0 && state?.heroes?.includes(target) && hasRelic('abyss-throne') && !state.battle?.relicOnce?.deathSave) {
      target.hp=1; state.battle.relicOnce.deathSave=true; addLog(`${target.name}: 심연의 왕좌가 죽음을 한 번 막았다!`);
    }
    const result={hpDamage,shieldDamage};
    queueVisualEvent(target,result);
    return result;
  }
  function pureDamage(target,amount,options={}) {
    // 독·진동·표식의 독립 피해는 공격력 증폭을 받지 않는다. 쉴드는 관통하지 않는다.
    return receiveDamage(target,amount,{useGrit:false,countMark:options.countMark??false,decayGritOnHp:true});
  }
  function attackDamage(attacker,target,base,options={}) {
    const wasAlive=target.hp>0;
    const burnBonus=options.triggerBurn===false?0:(target.burn||0);
    let amount=base+(options.useStrength===false?0:(attacker.strength||0))+burnBonus;
    if(state?.heroes?.includes(attacker)) {
      amount += attacker.runAttackBonus||0;
      const battle=state.battle, i=state.heroes.indexOf(attacker);
      if(attacker.currentCard?.type==='공격') {
        amount += attacker.currentCardRelicBonus||0;
        amount *= attacker.currentCardRelicMultiplier||1;
        if(target.vulnerableTurns>0 && hasRelic('weakpoint-lens') && !battle.relicOnce.weakpointRound) {amount+=3;battle.relicOnce.weakpointRound=true;}
        if(target.poison>0 && hasRelic('corrosion-catalyst') && !battle.relicOnce.corrosionRound) {amount+=2;battle.relicOnce.corrosionRound=true;}
      }
    }
    if(options.useWeak!==false && attacker.weakTurns>0) amount*=0.5;
    if(options.useVulnerable!==false && target.vulnerableTurns>0) amount*=2;
    amount=normalizeDamage(amount);
    const result=receiveDamage(target,amount,{countMark:true});
    if(result.hpDamage>0) addLog(`${target.name}: 체력 ${result.hpDamage} 피해${result.shieldDamage?` (쉴드 ${result.shieldDamage} 흡수)`:''}.`);
    else if(result.shieldDamage>0) addLog(`${target.name}: 쉴드가 ${result.shieldDamage} 감소했다.`);
    if(wasAlive && target.hp<=0) {
      addLog(`${target.name} 격파!`);
      if(state?.heroes?.includes(attacker) && hasRelic('endless-hunger')) heal(attacker,8);
    }
    return result;
  }
  function gainShield(target,base,options={}) {
    let amount=Math.max(0,base);
    if(state?.heroes?.includes(target)) {
      const recipientIndex=state.heroes.indexOf(target);
      if(hasRelic('worn-bracer') && !options.fromRelic && !state.battle?.relicOnce?.[`bracer-${recipientIndex}`]) {
        amount+=2; state.battle.relicOnce[`bracer-${recipientIndex}`]=true;
      }
      amount += target.agility||0;
      amount += target.runShieldBonus||0;
      const sourceCard=options.fromCard||target.currentCard;
      if(!options.fromRelic && sourceCard?.type==='스킬' && hasRelic('mirror-legion')) amount=Math.floor(amount*0.5);
      if(hasRelic('stopped-king-heart')) amount=Math.floor(amount*0.75);
    } else amount += target.agility||0;
    target.shield+=amount;
    addLog(`${target.name}: 쉴드 ${amount} 획득${target.agility?` (기민함 +${target.agility})`:''}.`);
    if(!options.fromRelic && state?.heroes?.includes(target) && amount>=10 && hasRelic('linked-shield') && !state.battle.relicOnce.linkedShield) {
      const ally=state.heroes.find(h=>h!==target&&h.hp>0);
      if(ally){state.battle.relicOnce.linkedShield=true;gainShield(ally,5,{fromRelic:true});}
    }
  }
  function onHeroHpDamage(hero) {
    const battle=state.battle;
    if(!battle)return;
    battle.roundHpDamage=true;
    if(hasRelic('blood-contract')) {hero.strength+=1;addLog(`${hero.name}: 피의 계약으로 힘 1 획득.`);}
    if(hasRelic('retreat-guard') && !battle.relicOnce.retreatGuard) {
      const ally=state.heroes.find(h=>h!==hero&&h.hp>0);
      if(ally){ally.grit+=3;battle.relicOnce.retreatGuard=true;addLog(`${ally.name}: 후퇴 방패로 기세 3 획득.`);}
    }
    if(hasRelic('twin-heart') && !battle.relicOnce.twinHeart && hero.hp<=hero.maxHp*0.3) {
      const ally=state.heroes.find(h=>h!==hero&&h.hp>0);
      if(ally){gainShield(ally,10,{fromRelic:true});ally.strength+=2;battle.relicOnce.twinHeart=true;addLog(`${ally.name}: 쌍둥이 심장 발동! 힘 2 획득.`);}
    }
  }
  function addVibration(target,amount) {
    target.vibration+=amount;
    addLog(`${target.name}: 진동 ${amount} 부여 (누적 ${target.vibration}).`);
    while(target.vibration>=target.vibrationMilestone+10) {
      target.vibrationMilestone+=10;
      const dmg=target.vibrationMilestone;
      const res=pureDamage(target,dmg);
      addLog(`${target.name}: 진동 ${target.vibrationMilestone} 돌파! ${dmg} 피해${res.shieldDamage?` · 쉴드 ${res.shieldDamage} 흡수`:''}.`);
      if(state.battle.enemies.includes(target) && hasRelic('resonator') && !state.battle.relicOnce.resonator) {target.weakTurns=Math.max(target.weakTurns,1);state.battle.relicOnce.resonator=true;addLog(`${target.name}: 공명기로 약화 1턴 부여.`);}
      if(target.hp<=0) addLog(`${target.name} 격파!`);
    }
  }
  function addStatus(target,key,amount) {
    if(!amount) return;
    const heroIsApplying = state?.battle?.turn==='hero' && !!state.heroes?.[state.battle.heroIndex]?.currentCard;
    if(heroIsApplying && key==='poison' && hasRelic('poison-vial') && !state.battle.relicOnce.firstPoison) {amount+=2;state.battle.relicOnce.firstPoison=true;}
    if(heroIsApplying && key==='burn') {
      if(hasRelic('ember-charm')&&!state.battle.relicOnce.firstBurn){amount+=2;state.battle.relicOnce.firstBurn=true;}
      if(hasRelic('furnace-heart')&&!state.battle.relicOnce.burnRound){amount+=1;state.battle.relicOnce.burnRound=true;}
    }
    if(heroIsApplying && key==='vibration' && hasRelic('ripple-pendulum') && !state.battle.relicOnce.vibrationRound){amount+=1;state.battle.relicOnce.vibrationRound=true;}
    if(heroIsApplying && key==='vulnerable' && hasRelic('vital-seal') && !state.battle.relicOnce.vulnerableOnce){amount+=1;state.battle.relicOnce.vulnerableOnce=true;}
    if(key==='weak') target.weakTurns=Math.max(target.weakTurns,amount);
    else if(key==='vulnerable') target.vulnerableTurns=Math.max(target.vulnerableTurns,amount);
    else if(key==='poison') target.poison+=amount;
    else if(key==='burn') target.burn+=amount;
    else if(key==='mark') {target.markTurns=Math.max(target.markTurns,amount);target.markDamage=0;}
    else if(key==='vibration') addVibration(target,amount);
    addLog(`${target.name}: ${({weak:'약화',vulnerable:'취약',poison:'독',burn:'화상',mark:'표식',vibration:'진동'})[key]} ${amount}${key==='weak'||key==='vulnerable'||key==='mark'?'턴':''}.`);
  }
  function loseHpDirect(hero,amount,source='효과') {
    const loss=Math.min(Math.max(0,amount),Math.max(0,hero.hp-1));
    if(loss>0){hero.hp-=loss;if(hero.grit>0)hero.grit=Math.max(0,hero.grit-1);onHeroHpDamage(hero);addLog(`${hero.name}: ${source}로 체력 ${loss} 감소.`);}
    return loss;
  }
  function heal(hero,amount) {
    if(hasRelic('blood-contract')) {addLog(`${hero.name}: 피로 맺은 계약서로 회복이 차단되었다.`);return;}
    if(hasRelic('pale-crown')) amount=Math.floor(amount*0.5);
    const gained=Math.min(amount,hero.maxHp-hero.hp); hero.hp+=gained;
    addLog(`${hero.name}: 체력 ${gained} 회복.`);
  }
  function drawExtra(hero,count) {drawCards(hero,count);addLog(`${hero.name}: 카드 ${count}장 뽑기.`);}
  function applyCard(hero,card) {
    const e=card.effect||{};
    const enemies=livingEnemies();
    const target=enemies.find(x=>x===state.battle.enemies[state.selectedEnemy])||enemies[0];
    if(e.selfDamage) loseHpDirect(hero,e.selfDamage,'카드 비용');
    if(e.gainStrength) {hero.strength+=e.gainStrength;addLog(`${hero.name}: 힘 ${e.gainStrength>0?'+':''}${e.gainStrength}.`);}
    if(e.gainGrit) {hero.grit+=e.gainGrit;addLog(`${hero.name}: 기세 ${e.gainGrit} 획득.`);}
    if(e.gainAgility) {hero.agility+=e.gainAgility;addLog(`${hero.name}: 기민함 ${e.gainAgility} 획득.`);}
    if(e.shield) gainShield(hero,e.shield,{fromCard:card});
    if(e.otherAllyShield||e.otherAllyStrength) {
      const other=state.heroes.find(h=>h!==hero && h.hp>0);
      if(other) {if(e.otherAllyShield)gainShield(other,e.otherAllyShield,{fromCard:card});if(e.otherAllyStrength){other.strength+=e.otherAllyStrength;addLog(`${other.name}: 힘 ${e.otherAllyStrength} 획득.`);}}
    }
    if(e.alliesShield||e.alliesGrit) state.heroes.filter(h=>h.hp>0).forEach(h=>{if(e.alliesShield)gainShield(h,e.alliesShield,{fromCard:card});if(e.alliesGrit){h.grit+=e.alliesGrit;addLog(`${h.name}: 기세 ${e.alliesGrit} 획득.`);}});
    if(e.teamDamage && target) state.heroes.filter(h=>h.hp>0).forEach(h=>attackDamage(h,target,e.teamDamage));
    if(e.damageFromShield && target) attackDamage(hero,target,hero.shield,{useStrength:false});
    if(e.damageFromStrength && target) attackDamage(hero,target,hero.strength*e.damageFromStrength,{useStrength:false});
    if(e.damage!==undefined) {
      const amount=(hero.id==='beast' && e.lowHpDamage && hero.hp<=hero.maxHp/2)?e.lowHpDamage:e.damage;
      const targets=e.allEnemies?enemies:(target?[target]:[]);
      targets.forEach(t=>{for(let i=0;i<(e.hits||1);i++)attackDamage(hero,t,amount);});
    }
    if(e.bonusShieldThreshold && target && hero.shield>=e.bonusShieldThreshold) attackDamage(hero,target,e.bonusDamage||0);
    if(e.burn||e.poison||e.mark||e.weak||e.vulnerable||e.vibration) {
      const targets=e.allEnemies?enemies:(target?[target]:[]);
      targets.forEach(t=>{
        if(e.burn)addStatus(t,'burn',e.burn); if(e.poison)addStatus(t,'poison',e.poison); if(e.mark)addStatus(t,'mark',e.mark);
        if(e.weak)addStatus(t,'weak',e.weak); if(e.vulnerable)addStatus(t,'vulnerable',e.vulnerable); if(e.vibration)addStatus(t,'vibration',e.vibration);
      });
    }
    if(e.heal)heal(hero,e.heal);
    if(e.draw)drawExtra(hero,e.draw);
    if(e.discard)hero.pendingDiscard=e.discard;
  }
  function effectiveCardCost(hero,card,index) {
    let cost=card.cost;
    if(hasRelic('pale-star-shard') && hero.cardsPlayedThisTurn===0) cost=0;
    else if(hasRelic('broken-timework') && hero.cardsPlayedThisTurn===0) cost-=1;
    if(hasRelic('broken-timework') && hero.cardsPlayedThisTurn>0 && index===hero.hand.length-1) cost+=1;
    return Math.max(0,cost);
  }

  async function playCard(index) {
    if(state.screen!=='battle'||state.battle.turn!=='hero'||state.battle.animating)return;
    const runState=state;
    const battle=state.battle;
    const hero=state.heroes[battle.heroIndex];
    const cardId=hero.hand[index], card=cardById(cardId);
    if(!card)return;
    const playCost=effectiveCardCost(hero,card,index);
    if(hero.energy<playCost)return;
    const enemies=livingEnemies();
    const targetIndex=Math.max(0,enemies.indexOf(state.battle.enemies[state.selectedEnemy]));
    const target=enemies[targetIndex]||enemies[0];
    battle.animating=true;
    const cardButton=$(`.card[data-action="play-card"][data-index="${index}"]`);
    cardButton?.classList.add('card-launch');
    if(card.type==='공격' && target) {
      await animateStrike('hero',battle.heroIndex,'enemy',state.battle.enemies.indexOf(target));
      if(state!==runState||state.battle!==battle||state.screen!=='battle')return;
    } else if(target && (card.effect?.weak||card.effect?.vulnerable||card.effect?.poison||card.effect?.mark||card.effect?.vibration)) {
      const actor=$(actorSelector('hero',battle.heroIndex));
      const targetActor=$(actorSelector('enemy',state.battle.enemies.indexOf(target)));
      actor?.classList.add('is-casting');
      targetActor?.classList.add('is-threatened');
      await wait(300);
      if(state!==runState||state.battle!==battle||state.screen!=='battle')return;
      actor?.classList.remove('is-casting');
      targetActor?.classList.remove('is-threatened');
    } else {
      await wait(180);
      if(state!==runState||state.battle!==battle||state.screen!=='battle')return;
    }
    hero.energy-=playCost;
    hero.hand.splice(index,1);
    hero.cardsPlayedThisTurn++;
    hero.discardPile.push(cardId);
    addLog(`${hero.name}: ${card.name} 사용. (코스트 ${playCost})`);
    hero.currentCard=card;
    hero.currentCardRelicBonus=0; hero.currentCardRelicMultiplier=1;
    if(card.type==='공격' && hasRelic('whetstone-chip') && !battle.relicOnce.firstAttackCard){hero.currentCardRelicBonus=4;battle.relicOnce.firstAttackCard=true;}
    if(card.type==='공격' && hasRelic('mirror-legion') && !battle.roundAttackBonus[battle.heroIndex]){hero.currentCardRelicMultiplier=1.5;battle.roundAttackBonus[battle.heroIndex]=true;}
    applyCard(hero,card);
    hero.currentCard=null;hero.currentCardRelicBonus=0;hero.currentCardRelicMultiplier=1;
    if(card.type==='공격') {
      battle.heroAttackPlayed[battle.heroIndex]=true;
      if(hasRelic('paired-rhythm') && battle.heroAttackPlayed.every(Boolean) && !battle.relicOnce.pairedRhythm) {state.heroes.forEach(h=>h.strength+=2);battle.relicOnce.pairedRhythm=true;addLog('짝의 박자 발동: 두 아군이 힘 2를 얻었다.');}
    }
    if(card.cost>=2 && hasRelic('dimensional-stitch') && !battle.roundCostlyCard[battle.heroIndex]) {battle.roundCostlyCard[battle.heroIndex]=true;drawExtra(hero,1);gainShield(hero,4,{fromRelic:true});}
    if(hero.pendingDiscard) {
      const count=Math.min(hero.pendingDiscard,hero.hand.length);
      if(count>0) {
        const removed=hero.hand.splice(hero.hand.length-count,count); hero.discardPile.push(...removed);
        addLog(`${hero.name}: 손패 ${count}장 버림.`);
      }
      hero.pendingDiscard=0;
    }
    renderBattle();
    await wait(560);
    if(state.screen!=='battle')return;
    battle.animating=false;
    if(checkBattleWin())return;
    renderBattle();
  }

  async function enemyTurn(initial=false) {
    if(state.screen!=='battle'||state.battle.animating)return;
    const runState=state;
    const battle=state.battle;
    battle.turn='enemy';
    battle.animating=true;
    renderBattle();
    await wait(initial ? 360 : 280);
    if(state!==runState||state.battle!==battle||state.screen!=='battle')return;
    if(!livingHeroes().length){battle.animating=false;state.screen='defeat';render();return;}

    for(let enemyIndex=0;enemyIndex<battle.enemies.length;enemyIndex++) {
      const enemy=battle.enemies[enemyIndex];
      if(!enemy || enemy.hp<=0)continue;
      if(enemy.stunned>0){enemy.stunned--;addLog(`${enemy.name}: 행동을 건너뛰었다.`);continue;}
      const action=enemy.actions[enemy.actionIndex%enemy.actions.length];
      enemy.actionIndex++;
      if(enemy.kind==='boss' && enemy.hp<=enemy.maxHp/2) addLog(`${enemy.name}: 2단계 돌입!`);
      addLog(`${enemy.name}: ${action.name}.`);
      if(action.shield)gainShield(enemy,action.shield);
      if(action.grit){enemy.grit+=action.grit;addLog(`${enemy.name}: 기세 ${action.grit} 획득.`);}
      if(action.strength){enemy.strength+=action.strength;addLog(`${enemy.name}: 힘 ${action.strength>0?'+':''}${action.strength}.`);}
      if(action.agility){enemy.agility+=action.agility;addLog(`${enemy.name}: 기민함 ${action.agility}.`);}
      if(action.selfRest)enemy.stunned=1;

      let targets=[];
      if(action.target==='all') targets=livingHeroes();
      else if(action.target==='random') targets=[pick(livingHeroes())].filter(Boolean);
      else targets=[pick(livingHeroes())].filter(Boolean);

      if(action.dmg!==undefined) {
        const actScale=enemy.damageScale||1;
        const phaseScale=(enemy.kind==='boss'&&enemy.hp<=enemy.maxHp/2)?1.2:1;
        const scaledDamage=Math.floor(action.dmg*actScale*phaseScale);
        for(const target of targets) {
          const heroIndex=state.heroes.indexOf(target);
          await animateStrike('enemy',enemyIndex,'hero',heroIndex);
          if(state!==runState||state.battle!==battle||state.screen!=='battle')return;
          for(let hit=0;hit<(action.hits||1);hit++)attackDamage(enemy,target,scaledDamage);
          renderBattle();
          await wait(430);
          if(state!==runState||state.battle!==battle||state.screen!=='battle')return;
          if(checkDefeat()){battle.animating=false;return;}
        }
      }
      ['weak','vulnerable','burn','vibration'].forEach(key=>{
        if(action[key]) targets.forEach(t=>addStatus(t,key,action[key]));
      });
      if(action.selfDestruct) { enemy.hp=0; addLog(`${enemy.name}: 폭발 후 파괴되었다.`); }
      if(action.summon) {
        const template=DATA.allMonsters.find(m=>m.id===action.summon);
        if(template) for(let i=0;i<(action.count||1);i++) {
          const summoned=cloneEnemy(template,state.actIndex+1); summoned.maxHp=Math.round(summoned.maxHp*.65);summoned.hp=summoned.maxHp;
          battle.enemies.push(summoned);addLog(`${enemy.name}: ${summoned.name} 소환!`);
        }
      }
      renderBattle();
      await wait(180);
      if(state!==runState||state.battle!==battle||state.screen!=='battle')return;
      if(checkDefeat()){battle.animating=false;return;}
      if(checkBattleWin()){battle.animating=false;return;}
    }

    livingEnemies().forEach(enemy=>{
      if(enemy.weakTurns>0)enemy.weakTurns--;
      if(enemy.vulnerableTurns>0)enemy.vulnerableTurns--;
      if(enemy.markTurns>0) {
        enemy.markTurns--;
        if(enemy.markTurns===0 && enemy.markDamage>0) {
          const delayed=Math.floor(enemy.markDamage*(hasRelic('echo-mirror')?0.6:0.5)); enemy.markDamage=0;
          const result=pureDamage(enemy,delayed); addLog(`${enemy.name}: 표식 종료, 누적 피해의 ${hasRelic('echo-mirror')?'60%':'50%'} ${delayed} 적용.`);
          if(enemy.hp<=0)addLog(`${enemy.name} 격파!`);
        }
      }
    });
    renderBattle();
    await wait(460);
    if(state!==runState||state.battle!==battle||state.screen!=='battle')return;
    if(checkBattleWin()){battle.animating=false;return;}
    if(!initial) battle.round++;
    battle.animating=false;
    startHeroTurn(0);
  }

  async function endHeroTurn() {
    if(state.screen!=='battle'||state.battle.turn!=='hero'||state.battle.animating)return;
    const runState=state;
    const battle=state.battle;
    battle.animating=true;
    const index=battle.heroIndex, hero=state.heroes[index];
    const keepHand=(index===1 && hasRelic('unclosed-library'));
    if(keepHand) hero.retainHandNextTurn=true;
    else {hero.discardPile.push(...hero.hand);hero.hand=[];hero.retainHandNextTurn=false;}
    hero.energy=0;
    if(hero.weakTurns>0)hero.weakTurns--;
    if(hero.vulnerableTurns>0)hero.vulnerableTurns--;
    addLog(`${hero.name}: 턴 종료.`);
    if(index===0) {
      battle.animating=false;
      startHeroTurn(1);
      return;
    }
    if(hasRelic('outpost-feather') && !battle.roundHpDamage) state.heroes.filter(h=>h.hp>0).forEach(h=>gainShield(h,4,{fromRelic:true}));
    battle.roundHpDamage=false;
    battle.relicOnce.weakpointRound=false;
    battle.relicOnce.corrosionRound=false;
    battle.relicOnce.vibrationRound=false;
    battle.relicOnce.burnRound=false;
    battle.relicOnce.linkedShield=false;
    battle.relicOnce.retreatGuard=false;
    battle.relicOnce.resonator=false;
    battle.heroAttackPlayed=[false,false];
    battle.roundAttackBonus=[false,false];
    battle.roundCostlyCard=[false,false];
    // 독은 두 아군의 턴이 모두 끝났을 때 현재 수치만큼 피해를 주고 1 감소한다.
    battle.turn='enemy';
    livingEnemies().forEach(enemy=>{
      if(enemy.poison>0) {
        const amount=enemy.poison;
        pureDamage(enemy,amount);
        if(hasRelic('poison-king-seal')) pureDamage(enemy,2);
        addLog(`${enemy.name}: 독 ${amount}${hasRelic('poison-king-seal')?' + 추가 2':''} 피해. 독이 ${amount-1}로 감소.`);
        enemy.poison=Math.max(0,enemy.poison-1);
      }
    });
    renderBattle();
    await wait(520);
    if(state!==runState||state.battle!==battle||state.screen!=='battle')return;
    if(checkBattleWin()){battle.animating=false;return;}
    battle.animating=false;
    await enemyTurn(false);
  }

  function checkDefeat() {
    if(livingHeroes().length===0){state.screen='defeat';render();return true;}
    return false;
  }
  function checkBattleWin() {
    if(livingEnemies().length===0){finishBattle();return true;}
    return false;
  }
  function finishBattle() {
    if(state.battle.rewardQueued)return;
    state.battle.rewardQueued=true;
    const boss=state.battle.boss;
    const elite=state.battle.type==='elite';
    const gold=boss?120:elite?65:30;
    state.heroes.forEach(h=>h.gold+=gold+(state.battle.type==='combat'&&hasRelic('collector-coin')?8:0));
    state.afterReward=boss?(state.actIndex===4?'victory':'nextAct'):'map';
    addLog(`전투 승리. 각 아군이 ${gold} 골드를 획득했다.`);
    if(boss) { addRelicReward('boss'); return; }
    if(elite) { addRelicReward('elite'); return; }
    continueAfterRelic();
  }
  function continueAfterRelic() {
    state.rewardCards=makeRewardChoices();
    state.screen='reward';render();
  }
  function chooseRelic(index) {
    const relic=state.relicChoices[index];if(!relic)return;
    grantRelic(relic.id);
    const mode=state.relicChoiceMode;state.relicChoices=[];state.relicChoiceMode=null;
    if(mode==='boss' && hasRelic(relic.id)) addLog(`${relic.name}: 보스 유물 획득 완료.`);
    continueAfterRelic();
  }
  function makeRewardChoices() {
    const allowed=Object.values(DATA.cards).filter(c=>state.heroes.some(h=>c.owner===h.id)||c.owner==='colorless');
    const count=3+(hasRelic('tactical-lens')?1:0);
    return shuffle(allowed).slice(0,count);
  }
  function giveCard(card) {
    let owner=state.heroes.find(h=>h.id===card.owner);
    if(!owner) owner=[...state.heroes].sort((a,b)=>a.deck.length-b.deck.length)[0];
    owner.deck.push(card.id);
    addLog(`${owner.name}의 덱에 ${card.name} 추가.`);
    const after=state.afterReward;
    if(after==='victory'){state.screen='victory';render();return;}
    if(after==='nextAct'){state.actIndex++;buildMap();state.screen='map';render();return;}
    state.screen='map';render();
  }
  function skipReward() {
    const after=state.afterReward;
    if(after==='victory'){state.screen='victory';render();return;}
    if(after==='nextAct'){state.actIndex++;buildMap();state.screen='map';render();return;}
    state.screen='map';render();
  }
  function selectNode(id) {
    const node=state.nodes.find(n=>n.id===id);
    if(!node||!node.available)return;
    node.available=false;node.visited=true;state.currentRow=node.row;
    state.nodes.filter(n=>n.row===node.row&&!n.visited).forEach(n=>n.available=false);
    if(node.row<7) {
      node.children.forEach(childId=>{const next=state.nodes.find(n=>n.id===childId);if(!next.visited)next.available=true;});
    } else {state.bossReady=true;}
    if(node.type==='combat'||node.type==='elite') {startBattle(node.type);return;}
    if(node.type==='rest'){state.screen='rest';render();return;}
    if(node.type==='shop'){makeShop();state.screen='shop';render();return;}
    if(node.type==='event'){makeEvent();state.screen='event';render();return;}
  }
  function enterBoss() {state.bossReady=false;startBattle('boss');}
  function renderBattle() {
    const battle=state.battle,act=DATA.acts[state.actIndex],hero=state.heroes[battle.heroIndex??0];
    const heroTurn=battle.turn==='hero';
    const statusHtml=(unit)=>[
      unit.shield?`<span class="status good">▣ 쉴드 ${unit.shield}</span>`:'',unit.grit?`<span class="status good">기세 ${unit.grit}</span>`:'',unit.agility?`<span class="status good">기민함 ${unit.agility}</span>`:'',unit.strength?`<span class="status good">힘 ${unit.strength}</span>`:'',unit.weakTurns?`<span class="status bad">약화 ${unit.weakTurns}</span>`:'',unit.vulnerableTurns?`<span class="status bad">취약 ${unit.vulnerableTurns}</span>`:'',unit.poison?`<span class="status bad">독 ${unit.poison}</span>`:'',unit.burn?`<span class="status bad">화상 ${unit.burn}</span>`:'',unit.markTurns?`<span class="status bad">표식 ${unit.markTurns}</span>`:'',unit.vibration?`<span class="status bad">진동 ${unit.vibration}</span>`:''
    ].filter(Boolean).join('');
    const heroPanels=state.heroes.map((h,i)=>`<div class="combatant hero-combatant ${heroTurn&&battle.heroIndex===i?'active':''} ${h.hp<=0?'fallen':''}" data-actor="hero" data-hero-index="${i}">
      <div class="hero-art-wrap"><span class="stage-shadow"></span><img src="${h.image}" alt="${esc(h.name)}"></div>
      <div class="unit-plaque"><div class="unit-title"><span class="unit-slot">${i+1}</span><strong>${esc(h.name)}</strong><span class="hp-label">♥ ${h.hp}/${h.maxHp}</span></div>
      <div class="hp-track"><div class="hp-fill" style="width:${Math.max(0,h.hp/h.maxHp*100)}%"></div></div>
      <div class="status-row">${statusHtml(h)}</div><div class="hero-meta">덱 ${h.deck.length} · 버림 ${h.discardPile.length}</div></div></div>`).join('');
    const enemyPanels=battle.enemies.map((e,i)=>{
      const action=e.actions[e.actionIndex%e.actions.length];
      const intent=e.hp>0?(action.dmg!==undefined?`${action.name} · ${action.dmg}${action.hits>1?` × ${action.hits}`:''} 피해`:action.name):'격파';
      const intentType=action.dmg!==undefined?'intent-attack':'intent-skill';
      return `<button class="enemy-unit ${state.selectedEnemy===i?'targeted':''} ${e.hp<=0?'dead':''}" data-action="target-enemy" data-actor="enemy" data-enemy-index="${i}" data-index="${i}" ${e.hp<=0?'disabled':''} aria-label="${esc(e.name)} 선택">
        <span class="intent-bubble ${intentType}"><b>${action.dmg!==undefined?'⚔':'✦'}</b><span>${esc(intent)}</span></span>
        <span class="enemy-art-wrap"><span class="stage-shadow"></span><img src="${e.art}" alt="${esc(e.name)}"></span>
        <span class="unit-plaque"><span class="enemy-name"><b>${esc(e.name)}</b><strong>♥ ${e.hp}/${e.maxHp}</strong></span><span class="hp-track"><span class="hp-fill" style="width:${Math.max(0,e.hp/e.maxHp*100)}%"></span></span><span class="enemy-shield">▣ 쉴드 ${e.shield}</span><span class="status-row">${statusHtml(e)}</span></span>
      </button>`;
    }).join('');
    const hand=hero?hero.hand.map((id,i)=>{
      const c=cardById(id),cost=effectiveCardCost(hero,c,i);return `<button class="card ${c.type==='공격'?'attack-card':'skill-card'}" data-action="play-card" data-index="${i}" ${(!heroTurn||battle.animating||hero.energy<cost)?'disabled':''} title="${esc(c.desc)}" aria-label="${esc(c.name)} ${cost} 에너지">
        <span class="cost">${cost}</span><img class="card-art" src="${c.art}" alt=""><strong>${esc(c.name)}</strong><span class="card-desc">${esc(c.desc)}</span><span class="card-type">${esc(c.type)}</span></button>`;
    }).join(''):'';
    app.innerHTML=`<section class="screen battle-screen">
      <div class="battle-heading"><div><div class="eyebrow">ACT ${state.actIndex+1} / 5 · ROUND ${battle.round}</div><h1>${esc(act.name)}</h1></div>
        <div class="turn-banner ${heroTurn?'hero-turn':'enemy-turn'}"><span class="turn-symbol">${heroTurn?'✦':'⚔'}</span><span><b>${heroTurn?`${esc(hero.name)}의 차례`:'적의 차례'}</b><small>${heroTurn?'카드를 사용하고 전투를 지휘하라.':'적의 의도를 확인하라.'}</small></span></div></div>
      <div class="battle-relics">${relicTray(true)}</div>
      <section class="battle-scene" style="--act-tint:${act.tint};background-image:linear-gradient(180deg,#07101a40 0%,#070b1160 55%,#070b11d9 100%),url('zassets/zbackgrounds/zact-${state.actIndex+1}.svg')">
        <div class="battle-topline"><span class="phase-label">${battle.type==='boss'?'BOSS ENCOUNTER':battle.type==='elite'?'ELITE ENCOUNTER':'STANDARD ENCOUNTER'}</span><span class="round-label">적 처치 ${battle.enemies.filter(e=>e.hp<=0).length}/${battle.enemies.length}</span></div>
        <div class="arena-glow"></div><div class="combatants"><div class="party-combatants">${heroPanels}</div><div class="enemy-grid">${enemyPanels}</div></div>
        <div class="arena-caption"><span>다차원 전장</span><span>적의 의도를 읽고 대응하라</span></div>
      </section>
      <section class="battle-bottom"><section class="hand-panel"><div class="hand-head"><span><b>${esc(hero.name)}</b> · 전투 손패</span><span class="hand-count">${hero.hand.length}장</span><span class="energy-mobile">에너지 ${hero.energy}/${3+(hasRelic('rift-generator')?1:0)}</span></div><div class="hand">${hand||'<div class="empty-hand">손패가 비었습니다. 턴을 종료하십시오.</div>'}</div></section>
        <aside class="battle-actions"><div class="energy-orb"><b>${hero.energy}</b><small>ENERGY</small></div><div class="deck-piles"><span>뽑기 <b>${hero.drawPile.length}</b></span><span>버림 <b>${hero.discardPile.length}</b></span></div><button class="end-turn-button" data-action="end-turn" ${(!heroTurn||battle.animating)?'disabled':''}>턴 종료 <span>↵</span></button><button class="rules-link" data-action="show-rules">키워드 규칙</button></aside></section>
      <section class="log-panel"><b>전투 기록</b><div class="log-box">${state.logs.slice(0,8).map(x=>`<p>› ${esc(x)}</p>`).join('')}</div></section>
    </section>`;
    flushVisualEvents();
  }
  function renderRelicReward() {
    const boss=state.relicChoiceMode==='boss';
    app.innerHTML=`<section class="screen"><div class="center-panel panel panel-pad"><div class="eyebrow">${boss?'BOSS RELIC':'ELITE RELIC'}</div><h1>${boss?'보스 유물을 선택한다':'엘리트 보상'}</h1><p class="subtitle">${boss?'강력한 힘에는 대가가 따른다. 세 유물 중 하나를 선택한다.':'엘리트를 격파했다. 세 유물 중 하나를 선택한다.'}</p><div class="relic-choice-grid">${state.relicChoices.map((r,i)=>`<button class="relic-choice rarity-${r.rarity}" data-action="choose-relic" data-index="${i}"><img src="${r.icon}" alt=""><span class="relic-rarity">${({common:'일반',uncommon:'고급',rare:'희귀',boss:'보스'})[r.rarity]}</span><strong>${esc(r.name)}</strong><span>${esc(r.desc)}</span><em>유물 선택</em></button>`).join('')}</div><p class="small-note">이미 보유한 유물은 다시 등장하지 않는다.</p></div></section>`;
  }

  function renderReward() {
    app.innerHTML=`<section class="screen"><div class="center-panel panel panel-pad"><div class="eyebrow">REWARD</div><h1>전투 보상</h1><p class="subtitle">제시된 카드 중 하나를 선택한다. 직업 카드는 해당 직업의 덱에, 무색 카드는 현재 덱이 더 작은 아군에게 들어간다.</p><div class="reward-grid">${state.rewardCards.map((c,i)=>`<button class="card reward-card" data-action="reward-card" data-index="${i}"><span class="cost">${c.cost}</span><img class="card-art" src="${c.art}" alt=""><strong>${esc(c.name)}</strong><span class="card-desc">${esc(c.desc)}</span><span class="card-type">${esc(c.owner==='colorless'?'무색':DATA.characters[c.owner].name)} · ${esc(c.type)}</span></button>`).join('')}</div><button class="btn secondary" data-action="skip-reward">보상 건너뛰기</button></div></section>`;
  }
  function renderRest() {
    app.innerHTML=`<section class="screen"><div class="center-panel panel panel-pad"><div class="eyebrow">REST SITE</div><h1>잠시 숨을 고른다.</h1><p class="subtitle">무너진 차원 틈새에 안전한 휴식처가 있다. 두 전투원 모두 최대 체력의 25%를 회복한다.</p><div class="rest-art">♨</div><button class="btn primary full" data-action="rest-heal">휴식하고 체력 회복</button></div></section>`;
  }
  function makeShop() {
    const pool=Object.values(DATA.cards).filter(c=>state.heroes.some(h=>c.owner===h.id)||c.owner==='colorless');
    state.shopOffers=shuffle(pool).slice(0,3).map(c=>({card:c,price:45+c.cost*12}));
    const relicPool=shuffle(availableRelics());
    state.relicOffer=relicPool[0]||null;
  }
  function buyRelic() {
    const r=state.relicOffer;if(!r)return;
    const price={common:70,uncommon:110,rare:160}[r.rarity]||100;
    if(!payGold(price)){window.alert('골드가 부족합니다.');return;}
    grantRelic(r.id);state.relicOffer=null;render();
  }
  function renderShop() {
    app.innerHTML=`<section class="screen"><div class="center-panel panel panel-pad"><div class="eyebrow">DIMENSIONAL MERCHANT</div><h1>차원 상점</h1><p class="subtitle">카드와 유물을 구매한다. 보유금은 캐릭터별로 관리한다.</p><div class="shop-wallet">${state.heroes.map(h=>`<span>${esc(h.name)} · ¤ ${h.gold}</span>`).join('')}</div><div class="reward-grid">${state.shopOffers.map((o,i)=>`<div class="shop-card"><div class="card"><span class="cost">${o.card.cost}</span><img class="card-art" src="${o.card.art}" alt=""><strong>${esc(o.card.name)}</strong><span class="card-desc">${esc(o.card.desc)}</span><span class="card-type">${esc(o.card.owner==='colorless'?'무색':DATA.characters[o.card.owner].name)}</span></div><button class="btn secondary full" data-action="buy-card" data-index="${i}">¤ ${o.price} 구매</button></div>`).join('')}</div>${state.relicOffer?`<div class="shop-relic-offer"><img src="${state.relicOffer.icon}" alt=""><div class="grow"><b>${esc(state.relicOffer.name)}</b><small>${esc(state.relicOffer.desc)}</small></div><button class="btn secondary" data-action="buy-relic">¤ ${{common:70,uncommon:110,rare:160}[state.relicOffer.rarity]} 구매</button></div>`:'<p class="small-note">판매할 유물이 남아 있지 않다.</p>'}<button class="btn primary full" data-action="shop-heal">양쪽 체력 12 회복 · ¤ 70</button><button class="btn secondary full" data-action="leave-node">상점 나가기</button></div></section>`;
  }
  function makeEvent() {
    const pool=(DATA.events||[]).filter(e=>e.act===state.actIndex+1);
    let remaining=pool.filter(e=>!state.seenEvents.includes(e.id));
    if(!remaining.length){state.seenEvents=state.seenEvents.filter(id=>!pool.some(e=>e.id===id));remaining=pool;}
    const selected=pick(remaining);
    state.seenEvents.push(selected.id);
    state.currentEvent=JSON.parse(JSON.stringify(selected));
  }
  function renderEvent() {
    const ev=state.currentEvent;
    const opts=[...ev.options];
    if(hasRelic('guide-note')) opts.push({label:'작은 보급품을 챙긴다',desc:'각 아군 골드 25 획득',effect:{type:'gold',value:25}});
    app.innerHTML=`<section class="screen"><div class="center-panel panel panel-pad event-panel"><div class="eyebrow">UNKNOWN EVENT · ACT ${state.actIndex+1}</div><h1>${esc(ev.title)}</h1><p class="subtitle">${esc(ev.text)}</p><div class="choice-list">${opts.map((o,i)=>`<button class="choice-button" data-action="event-choice" data-index="${i}"><span><b>${esc(o.label)}</b><small>${esc(o.desc)}</small></span><span>→</span></button>`).join('')}</div></div></section>`;
  }
  function renderEnd(victory) {
    app.innerHTML=`<section class="screen"><div class="center-panel panel panel-pad end-panel"><div class="eyebrow">${victory?'EXPEDITION COMPLETE':'EXPEDITION FAILED'}</div><h1>${victory?'창백한 고래를 포획했다.':'원정대가 쓰러졌다.'}</h1><p class="subtitle">${victory?'다섯 차원의 균열이 잠잠해졌다. 원정 기록이 완성되었다.':'이번 원정은 여기서 끝났다. 편성을 바꾸고 다시 추적할 수 있다.'}</p><div class="end-emblem">${victory?'✦':'☠'}</div><button class="btn primary full" data-action="restart">새 원정 시작</button></div></section>`;
  }
  function restHeal() {state.heroes.forEach(h=>heal(h,Math.ceil(h.maxHp*.25)+(hasRelic('rest-teacup')?5:0)));state.screen='map';render();}
  function buyCard(index) {
    const offer=state.shopOffers[index];if(!offer)return;
    let owner=state.heroes.find(h=>h.id===offer.card.owner);
    if(!owner)owner=[...state.heroes].sort((a,b)=>a.deck.length-b.deck.length)[0];
    if(owner.gold<offer.price){addLog(`${owner.name}: 골드가 부족하다.`);return;}
    owner.gold-=offer.price;owner.deck.push(offer.card.id);state.shopOffers.splice(index,1);render();
  }
  function payGold(amount) {
    const payer=[...state.heroes].sort((a,b)=>b.gold-a.gold)[0];
    if(!payer || payer.gold<amount)return false;
    payer.gold-=amount;return true;
  }
  function giveRandomRelic(rarity) {
    const options=availableRelics(rarity);
    const selected=pick(options);
    if(selected) return grantRelic(selected.id);
    state.heroes.forEach(h=>h.gold+=40);
    addLog('획득 가능한 해당 등급 유물이 없어 골드 40을 대신 받았다.');
    return false;
  }
  function addColorlessCard(type='any') {
    const pool=Object.values(DATA.cards).filter(c=>c.owner==='colorless'&&(type==='any'||c.type===type));
    if(!pool.length)return;
    const c=pick(pool),h=[...state.heroes].sort((a,b)=>a.deck.length-b.deck.length)[0];
    h.deck.push(c.id);addLog(`${h.name}의 덱에 무색 카드 ${c.name} 추가.`);
  }
  function applyEventEffect(effect) {
    if(!effect)return;
    const heroes=state.heroes;
    if(effect.hpLoss) heroes.forEach(h=>{h.hp=Math.max(1,h.hp-effect.hpLoss);});
    switch(effect.type) {
      case 'nothing': break;
      case 'heal': heroes.forEach(h=>heal(h,effect.value)); break;
      case 'gold': heroes.forEach(h=>h.gold+=effect.value); break;
      case 'strength': {const h=pick(heroes);if(h)h.nextStrength+=effect.value;break;}
      case 'grit': heroes.forEach(h=>h.nextGrit+=effect.value); break;
      case 'colorlessCard': addColorlessCard(effect.cardType||'any'); break;
      case 'relic': giveRandomRelic(effect.rarity); if(effect.nextBattleVulnerable)heroes.forEach(h=>h.nextBattleVulnerable=Math.max(h.nextBattleVulnerable,effect.nextBattleVulnerable)); break;
      case 'chanceRelic': if(Math.random()<effect.chance)giveRandomRelic(effect.rarity);else heroes.forEach(h=>h.hp=Math.max(1,h.hp-(effect.failHp||0))); break;
      case 'relicPurchase': if(payGold(effect.cost))giveRandomRelic(effect.rarity);else window.alert('골드가 부족합니다.'); break;
      case 'eliteWeakening': if(effect.cost&&!payGold(effect.cost)){window.alert('골드가 부족합니다.');break;} state.nextEliteHpPenalty=Math.max(state.nextEliteHpPenalty||0,effect.value||0); break;
      case 'attackBonus': {const h=pick(heroes);if(h)h.runAttackBonus+=effect.value;break;}
      case 'partyAttackBonus': heroes.forEach(h=>h.runAttackBonus+=effect.value); break;
      case 'nextBattleShield': heroes.forEach(h=>h.nextBattleShield+=effect.value); break;
      case 'partyStrengthAndShield': heroes.forEach(h=>{h.nextStrength+=effect.strength;h.nextBattleShield+=effect.shield;}); break;
      case 'partyStrengthAndMaxHpLoss': heroes.forEach(h=>{h.nextStrength+=effect.strength;h.maxHp=Math.max(1,h.maxHp-effect.maxHpLoss);h.hp=Math.min(h.hp,h.maxHp);}); break;
      case 'partyGrit': heroes.forEach(h=>h.nextGrit+=effect.value); break;
      case 'removeRandomCard': {const candidates=heroes.flatMap(h=>h.deck.map((id,i)=>({h,i,id})));if(candidates.length>10){const chosen=pick(candidates);chosen.h.deck.splice(chosen.i,1);addLog(`${chosen.h.name}의 덱에서 ${cardById(chosen.id)?.name||chosen.id} 제거.`);}break;}
      case 'healAndGold': heroes.forEach(h=>{heal(h,effect.heal);h.gold+=effect.gold;}); break;
      case 'nextBattleEnergy': heroes.forEach(h=>h.nextBattleEnergy+=effect.value); break;
    }
  }
  function chooseEvent(index) {
    const options=[...state.currentEvent.options];
    if(hasRelic('guide-note'))options.push({label:'작은 보급품을 챙긴다',effect:{type:'gold',value:25}});
    const selected=options[index];if(!selected)return;
    applyEventEffect(selected.effect);
    state.screen='map';render();
  }
  function showRules() {
    const text='독: 아군 두 명의 턴이 모두 끝날 때 현재 수치만큼 피해를 주고 1 감소합니다.\n기세: 쉴드가 피해를 흡수한 뒤 남은 피해를 감소시킵니다. 체력이 실제로 감소한 공격마다 기세 1이 감소합니다.\n취약: 받는 일반 공격 피해 2배. 약화: 가하는 일반 공격 피해 0.5배.\n힘: 일반 공격 피해에 수치만큼 추가. 화상: 직접 공격을 받을 때 화상 수치만큼 피해가 추가됩니다.\n표식: 지속시간 동안 체력에 입은 피해의 절반을 종료 시 받습니다.\n진동: 누적 수치가 10, 20, 30...의 새 십 단위 문턱을 넘을 때 해당 문턱만큼 피해를 받습니다.\n기민함: 쉴드 획득 시 기민함 수치만큼 추가 쉴드를 얻습니다. 독·진동·표식 피해는 일반 공격력 증폭을 받지 않으며 쉴드를 관통하지 않습니다.';
    window.alert(text);
  }
  app.addEventListener('click',event=>{
    const btn=event.target.closest('[data-action]');if(!btn)return;
    const action=btn.dataset.action;
    if(action==='character') {
      const id=btn.dataset.id;
      if(state.selected.includes(id))state.selected=state.selected.filter(x=>x!==id);
      else if(state.selected.length<2)state.selected.push(id);
      renderSelect();return;
    }
    if(action==='start-run') {
      if(state.selected.length!==2)return;
      state.heroes=state.selected.map(makeHero);state.actIndex=0;buildMap();state.screen='map';render();return;
    }
    if(action==='restart'){startNewGame();return;}
    if(action==='node'){selectNode(btn.dataset.id);return;}
    if(action==='boss'){enterBoss();return;}
    if(action==='play-card'){playCard(Number(btn.dataset.index));return;}
    if(action==='end-turn'){endHeroTurn();return;}
    if(action==='target-enemy'){if(state.battle?.animating||state.battle?.turn!=='hero')return;const i=Number(btn.dataset.index);if(state.battle.enemies[i]?.hp>0){state.selectedEnemy=i;renderBattle();}return;}
    if(action==='reward-card'){const c=state.rewardCards[Number(btn.dataset.index)];if(c)giveCard(c);return;}
    if(action==='choose-relic'){chooseRelic(Number(btn.dataset.index));return;}
    if(action==='skip-reward'){skipReward();return;}
    if(action==='rest-heal'){restHeal();return;}
    if(action==='buy-card'){buyCard(Number(btn.dataset.index));return;}
    if(action==='buy-relic'){buyRelic();return;}
    if(action==='shop-heal'){
      const cost=70;const owner=[...state.heroes].sort((a,b)=>b.gold-a.gold)[0];
      if(owner.gold>=cost){owner.gold-=cost;state.heroes.forEach(h=>heal(h,12));}else window.alert('골드가 부족합니다.');render();return;
    }
    if(action==='leave-node'){state.screen='map';render();return;}
    if(action==='event-choice'){chooseEvent(Number(btn.dataset.index));return;}
    if(action==='show-rules'){showRules();return;}
  });

  $('#restart-button')?.addEventListener('click',startNewGame);
  startNewGame();
})();
