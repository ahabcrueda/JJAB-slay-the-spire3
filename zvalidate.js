// Run with: node zvalidate.js
const fs = require('fs');
const path = require('path');
global.window = global;
require('./zdata.js');
require('./zrelics-events.js');
const D = global.GAME_DATA;
const fail = message => { console.error('FAIL:', message); process.exitCode = 1; };
const check = (condition,message) => condition ? console.log('PASS:',message) : fail(message);
const cards = Object.values(D.cards);
const collectible = cards.filter(c=>c.owner!=='starter');
check(cards.length===72,'72 card definitions including two starter templates');
check(collectible.length===70,'70 collectible cards');
for (const owner of ['warrior','assassin','mage','beast','colorless']) {
  const expected = owner==='colorless'?10:15;
  check(cards.filter(c=>c.owner===owner).length===expected,`${owner} card count is ${expected}`);
}
check(D.commonElites.length===5,'5 recurring elite monsters');
check(D.acts.length===5,'5 acts');
check(D.acts.reduce((n,a)=>n+a.normal.length,0)===50,'50 normal monsters');
check(D.acts.reduce((n,a)=>n+a.elites.length,0)===15,'15 act-exclusive elite monsters');
check(D.acts.reduce((n,a)=>n+a.bosses.length,0)===10,'10 bosses');
check(D.allMonsters.length===80,'80 monsters in the complete bestiary');
check(D.nodeTypes.reduce((n,t)=>n+t.count,0)===32,'32 nodes per act');
check(JSON.stringify(D.nodeTypes.map(t=>t.count))===JSON.stringify([16,5,2,5,4]),'node distribution 16/5/2/5/4');
check(D.relics.length===38,'38 relics');
check(D.relics.filter(r=>r.rarity==='common').length===12,'12 common relics');
check(D.relics.filter(r=>r.rarity==='uncommon').length===9,'9 uncommon relics');
check(D.relics.filter(r=>r.rarity==='rare').length===6,'6 rare relics');
check(D.relics.filter(r=>r.rarity==='boss').length===11,'11 boss relics');
check(D.events.length===25,'25 random events total');
for(let act=1;act<=5;act++) check(D.events.filter(e=>e.act===act).length===5,`act ${act} has five distinct random events`);
check(D.allMonsters.filter(m=>m.kind==='normal').every(m=>!m.relicDrop),'normal monsters have no relic drop property');
const refs=[...cards.map(c=>c.art),...Object.values(D.characters).map(c=>c.image),...D.allMonsters.map(m=>m.art),...D.relics.map(r=>r.icon),...Array.from({length:5},(_,i)=>`zassets/zbackgrounds/zact-${i+1}.svg`),'zassets/zfavicon.svg'];
const missing=[...new Set(refs.filter(ref=>!fs.existsSync(path.join(__dirname,ref))))];
check(missing.length===0,`all referenced asset files exist (${refs.length} references)`);
for (const m of D.allMonsters) check(Array.isArray(m.actions)&&m.actions.length>0,`${m.name} has at least one action`);
if(!process.exitCode) console.log('\nAll validation checks passed.');
