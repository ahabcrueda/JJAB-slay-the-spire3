/* Multidimension Expedition - game data. All combat values are prototype balance values. */
(() => {
  const card = (id, name, cost, type, desc, effect, art, owner = 'colorless') => ({ id, name, cost, type, desc, effect, art: `zassets/zcards/z${art || id}.svg`, owner });
  const characters = {
    warrior:  { id:'warrior', name:'전사', hp:90, gold:150, role:'방어 · 힘 · 반격', image:'zassets/zcharacters/zwarrior.svg', bio:'방패와 힘으로 전열을 지키는 중장갑 전투원.' },
    assassin: { id:'assassin', name:'암살자', hp:65, gold:300, role:'독 · 표식 · 급습', image:'zassets/zcharacters/zassassin.svg', bio:'독과 표식으로 약점을 노리는 신속한 사냥꾼.' },
    mage:     { id:'mage', name:'마법사', hp:70, gold:200, role:'원소 · 진동 · 차원', image:'zassets/zcharacters/zmage.svg', bio:'원소와 차원 마법으로 전장을 통제하는 마도사.' },
    beast:    { id:'beast', name:'야수', hp:99, gold:100, role:'체력 · 힘 · 광폭화', image:'zassets/zcharacters/zbeast.svg', bio:'높은 체력과 본능적인 힘으로 적을 압도하는 야수.' }
  };
  const cards = {};
  const add = c => { cards[c.id] = c; };
  // Basic starter cards. Each hero begins with five attacks and five defenses.
  add(card('strike','공격',1,'공격','적에게 6 피해를 줍니다.',{damage:6},'warrior-04','starter'));
  add(card('defend','수비',1,'스킬','쉴드 5를 얻습니다.',{shield:5},'simple-barrier','starter'));
  // Warrior - 15 cards.
  [
    ['w-shield-block','방패막기',2,'스킬','쉴드 15를 얻습니다.',{shield:15},'warrior-01'],
    ['w-shield-throw','방패던지기',1,'공격','현재 쉴드만큼 피해를 줍니다.',{damageFromShield:true},'warrior-02'],
    ['w-sword-shield','검과 방패',1,'공격','5 피해를 주고 쉴드 5를 얻습니다.',{damage:5,shield:5},'warrior-03'],
    ['w-greatsword','대검',3,'공격','힘 3을 얻고 현재 힘의 3배만큼 피해를 줍니다.',{gainStrength:3,damageFromStrength:3},'warrior-04'],
    ['w-ignite','불 붙이기',2,'공격','10 피해 + 화상 2를 부여합니다.',{damage:10,burn:2},'warrior-05'],
    ['w-flame-sword','화검',1,'공격','3 피해 + 화상 2를 부여합니다.',{damage:3,burn:2},'warrior-06'],
    ['w-iron-block','철괴',3,'스킬','쉴드 30을 얻습니다.',{shield:30},'warrior-07'],
    ['w-bulk-up','벌크업',1,'스킬','힘 2를 얻습니다.',{gainStrength:2},'warrior-08'],
    ['w-moonwalk','문워크',2,'스킬','기민함 2를 얻습니다.',{gainAgility:2},'warrior-09'],
    ['w-steel-cut','강철 절단',2,'공격','10 피해를 줍니다.',{damage:10},'warrior-10'],
    ['w-shield-charge','방패 돌진',2,'공격','7 피해 + 쉴드 8을 얻습니다.',{damage:7,shield:8},'warrior-11'],
    ['w-counter-sword','반격의 검',1,'공격','5 피해. 쉴드가 10 이상이면 추가 5 피해.',{damage:5,bonusShieldThreshold:10,bonusDamage:5},'warrior-12'],
    ['w-iron-stance','철벽 자세',2,'스킬','쉴드 대신 기세 5를 얻습니다.',{gainGrit:5},'warrior-13'],
    ['w-guard-ally','전우 보호',1,'스킬','다른 아군에게 쉴드 10을 부여합니다.',{otherAllyShield:10},'warrior-14'],
    ['w-battle-breath','전투 호흡',1,'스킬','힘 1 + 쉴드 4를 얻습니다.',{gainStrength:1,shield:4},'warrior-15']
  ].forEach(x=>add(card(...x,'warrior')));
  // Assassin - 15 cards.
  [
    ['a-backstab','뒤찌르기',1,'공격','8 피해를 줍니다.',{damage:8},'assassin-01'],
    ['a-poison-dart','독침',1,'공격','4 피해 + 독 3을 부여합니다.',{damage:4,poison:3},'assassin-02'],
    ['a-shadow-cut','그림자 베기',1,'공격','6 피해 + 약화 1턴을 부여합니다.',{damage:6,weak:1},'assassin-03'],
    ['a-vital-stab','급소 찌르기',2,'공격','12 피해 + 표식 2턴을 부여합니다.',{damage:12,mark:2},'assassin-04'],
    ['a-double-cut','연속 베기',2,'공격','5 피해를 2회 입힙니다.',{damage:5,hits:2},'assassin-05'],
    ['a-smoke-bomb','연막탄',1,'스킬','쉴드 8 + 기세 2를 얻습니다.',{shield:8,gainGrit:2},'assassin-06'],
    ['a-toxic-brew','맹독 조제',1,'스킬','적에게 독 5를 부여합니다.',{poison:5},'assassin-07'],
    ['a-opening','기회 포착',1,'스킬','적에게 취약 1턴을 부여합니다.',{vulnerable:1},'assassin-08'],
    ['a-shadow-step','그림자 걸음',1,'스킬','쉴드 5 + 기민함 2를 얻습니다.',{shield:5,gainAgility:2},'assassin-09'],
    ['a-flurry','연속 급습',2,'공격','4 피해를 3회 입힙니다.',{damage:4,hits:3},'assassin-10'],
    ['a-poison-blade','독날 투척',1,'공격','5 피해 + 독 3을 부여합니다.',{damage:5,poison:3},'assassin-11'],
    ['a-blackpoint','흑점 찌르기',2,'공격','9 피해 + 표식 2턴을 부여합니다.',{damage:9,mark:2},'assassin-12'],
    ['a-smoke-screen','연막 전개',1,'스킬','쉴드 8 + 적에게 약화 1턴을 부여합니다.',{shield:8,weak:1},'assassin-13'],
    ['a-venom-refine','독혈 정제',2,'스킬','적에게 독 7을 부여합니다.',{poison:7},'assassin-14'],
    ['a-vital-analysis','급소 계산',1,'스킬','적에게 취약 1턴 + 카드 1장 뽑기.',{vulnerable:1,draw:1},'assassin-15']
  ].forEach(x=>add(card(...x,'assassin')));
  // Mage - 15 cards.
  [
    ['m-fireball','화염구',2,'공격','10 피해 + 화상 3을 부여합니다.',{damage:10,burn:3},'mage-01'],
    ['m-frost-shard','서리 파편',1,'공격','6 피해 + 약화 1턴을 부여합니다.',{damage:6,weak:1},'mage-02'],
    ['m-chain-lightning','번개 폭발',2,'공격','8 피해 + 진동 4를 부여합니다.',{damage:8,vibration:4},'mage-03'],
    ['m-starfall','별의 낙하',3,'공격','18 피해를 줍니다.',{damage:18},'mage-04'],
    ['m-dimensional-cut','차원 절단',2,'공격','7 피해 + 취약 1턴을 부여합니다.',{damage:7,vulnerable:1},'mage-05'],
    ['m-magic-wall','마력 장벽',1,'스킬','쉴드 12를 얻습니다.',{shield:12},'mage-06'],
    ['m-mana-condense','마나 응집',1,'스킬','힘 2를 얻습니다.',{gainStrength:2},'mage-07'],
    ['m-time-distort','시간 왜곡',2,'스킬','적에게 약화 2턴 + 취약 1턴을 부여합니다.',{weak:2,vulnerable:1},'mage-08'],
    ['m-dimensional-step','차원 도약',1,'스킬','카드 2장을 뽑습니다.',{draw:2},'mage-09'],
    ['m-aether-spear','에테르 창',1,'공격','8 피해 + 진동 3을 부여합니다.',{damage:8,vibration:3},'mage-10'],
    ['m-chain-arc','연쇄 번개',2,'공격','모든 적에게 5 피해를 2회 입힙니다.',{damage:5,hits:2,allEnemies:true},'mage-11'],
    ['m-space-collapse','공간 붕괴',3,'공격','15 피해 + 진동 5를 부여합니다.',{damage:15,vibration:5},'mage-12'],
    ['m-arcane-ward','비전 방벽',1,'스킬','쉴드 13을 얻습니다.',{shield:13},'mage-13'],
    ['m-rune-backflow','룬 역류',2,'스킬','적에게 약화 2턴 + 진동 5를 부여합니다.',{weak:2,vibration:5},'mage-14'],
    ['m-dimensional-stabilize','차원 안정화',1,'스킬','카드 1장 뽑기 + 쉴드 5를 얻습니다.',{draw:1,shield:5},'mage-15']
  ].forEach(x=>add(card(...x,'mage')));
  // Beast - 15 cards.
  [
    ['b-claw-swipe','발톱 휘두르기',1,'공격','7 피해를 줍니다.',{damage:7},'beast-01'],
    ['b-fang','야수의 이빨',1,'공격','5 피해 + 진동 5를 부여합니다.',{damage:5,vibration:5},'beast-02'],
    ['b-devour','포식',2,'공격','10 피해 + 체력 3을 회복합니다.',{damage:10,heal:3},'beast-03'],
    ['b-roar','포효',1,'공격','6 피해 + 취약 1턴을 부여합니다.',{damage:6,vulnerable:1},'beast-04'],
    ['b-frenzy-charge','광란의 돌진',3,'공격','17 피해를 줍니다.',{damage:17},'beast-05'],
    ['b-thick-hide','두꺼운 가죽',1,'스킬','쉴드 15를 얻습니다.',{shield:15},'beast-06'],
    ['b-hunt-instinct','사냥 본능',1,'스킬','힘 2를 얻습니다.',{gainStrength:2},'beast-07'],
    ['b-survival-instinct','생존 본능',1,'스킬','쉴드 8 + 기세 2를 얻습니다.',{shield:8,gainGrit:2},'beast-08'],
    ['b-blood-frenzy','피의 흥분',2,'스킬','체력 4 소모 + 힘 3을 얻습니다.',{selfDamage:4,gainStrength:3},'beast-09'],
    ['b-ravage','난폭한 난도질',2,'공격','4 피해를 3회 입힙니다.',{damage:4,hits:3},'beast-10'],
    ['b-bone-break','뼈 부수기',2,'공격','12 피해 + 진동 3을 부여합니다.',{damage:12,vibration:3},'beast-11'],
    ['b-hunters-leap','사냥꾼의 도약',1,'공격','8 피해. 체력이 최대치의 절반 이하면 12 피해.',{damage:8,lowHpDamage:12},'beast-12'],
    ['b-primal-armor','원시의 갑주',2,'스킬','쉴드 24를 얻습니다.',{shield:24},'beast-13'],
    ['b-rage','광폭화',2,'스킬','체력 3 소모 + 힘 4를 얻습니다.',{selfDamage:3,gainStrength:4},'beast-14'],
    ['b-pack-bond','무리의 유대',1,'스킬','다른 아군에게 힘 1 + 쉴드 6을 부여합니다.',{otherAllyStrength:1,otherAllyShield:6},'beast-15']
  ].forEach(x=>add(card(...x,'beast')));
  // Colorless - shared by every class.
  [
    ['c-team-strike','합동 공격',2,'공격','두 아군이 각각 6 피해를 줍니다.',{teamDamage:6},'team-strike'],
    ['c-team-barrier','공동 방벽',1,'스킬','두 아군 모두 쉴드 8을 얻습니다.',{alliesShield:8},'team-barrier'],
    ['c-tactical-resonance','전술 공명',2,'스킬','두 아군 모두 기세 2를 얻고 사용자는 카드 1장을 뽑습니다.',{alliesGrit:2,draw:1},'tactical-resonance'],
    ['c-colorless-strike','무색 타격',0,'공격','4 피해를 줍니다.',{damage:4},'colorless-strike'],
    ['c-precision-strike','정밀 타격',1,'공격','8 피해를 줍니다.',{damage:8},'precision-strike'],
    ['c-simple-barrier','간이 방벽',1,'스킬','쉴드 10을 얻습니다.',{shield:10},'simple-barrier'],
    ['c-training','단련',1,'스킬','힘 2를 얻습니다.',{gainStrength:2},'training'],
    ['c-balance','균형 잡기',1,'스킬','쉴드 5 + 기민함 1을 얻습니다.',{shield:5,gainAgility:1},'balance'],
    ['c-first-aid','응급 처치',1,'스킬','체력 5를 회복합니다.',{heal:5},'first-aid'],
    ['c-tactical-analysis','전술 분석',1,'스킬','카드 2장 뽑기 후 1장 버립니다.',{draw:2,discard:1},'tactical-analysis']
  ].forEach(x=>add(card(...x,'colorless')));

  const A=(name,dmg,hits=1,target='one',extra={})=>({name,dmg,hits,target,...extra});
  const B=(name,extra={})=>({name,...extra});
  const monster=(id,name,kind,act,hp,actions,flavor='')=>({id,name,kind,act,hp,actions,flavor,art:`zassets/zenemies/z${id}.svg`});
  const commonElites = [
    monster('rift-stalker','균열 추적자','elite',0,105,[A('추적자의 검',12),A('차원 도약',18),B('사냥 본능',{strength:2})],'차원을 넘어 원정대를 추적한다.'),
    monster('oath-executor','맹약 집행관','elite',0,125,[B('맹약의 방패',{shield:20}),A('심판의 망치',14),B('절대 명령',{grit:4})],'오래된 맹약을 지키는 집행자.'),
    monster('void-priest','공허 사제','elite',0,92,[A('공허의 주문',10),B('약화 의식',{weak:2,target:'random'}),B('금단의 축복',{strength:3})],'공허의 힘을 숭배하는 사제.'),
    monster('shard-giant','파편 거인','elite',0,145,[A('파편 강타',16),B('공명 진동',{vibration:5,target:'all'}),B('파편 재구성',{shield:15})],'차원 파편으로 이루어진 골렘.'),
    monster('dimension-hunter','차원 사냥꾼','elite',0,110,[B('사냥감 포착',{vulnerable:1,target:'random'}),A('난폭한 발톱',7,2),A('차원의 포효',5,1,'all')],'차원 사이를 떠도는 사냥 괴수.')
  ];

  const acts = [
    {
      id:1,name:'잿빛 변경',subtitle:'무너진 성채와 잿더미가 된 변경',tint:'#9b6b58',
      normal:[
        monster('ash-slime','폐허 점액','normal',1,28,[A('점액 튀기기',5),B('점액 응집',{strength:1})]),
        monster('ash-raven','잿빛 까마귀','normal',1,24,[A('쪼아대기',4,2),B('날개 접기',{agility:1})]),
        monster('border-bandit','변경 도적','normal',1,34,[A('거친 칼질',7),B('비겁한 공격',{weak:1,target:'random'})]),
        monster('rust-spear','녹슨 창병','normal',1,38,[A('창 찌르기',9),B('창끝 방어',{shield:5})]),
        monster('shield-wraith','방패 망령','normal',1,36,[B('망령의 방패',{shield:8}),A('유령 타격',5)]),
        monster('ember-bat','불씨 박쥐','normal',1,25,[A('불씨 물기',6,1,'one',{burn:1})]),
        monster('grave-guard','묘지 경비병','normal',1,42,[B('묘비 방어',{shield:10}),A('묘지의 일격',8)]),
        monster('wandering-priest','떠돌이 사제','normal',1,31,[B('낡은 축복',{strength:1}),B('보호 기도',{shield:5})]),
        monster('broken-golem','무너진 골렘','normal',1,48,[A('돌주먹',12),B('돌 파편',{shield:8})]),
        monster('rift-hound','균열 들개','normal',1,32,[A('찢어 물기',5,2,'random')])
      ],
      elites:[
        monster('ember-sentinel','잿불 파수꾼','elite',1,100,[A('불타는 검',11,1,'one',{burn:2}),B('잿불 갑옷',{shield:12})]),
        monster('twinblade-chaser','쌍검 추격자','elite',1,94,[A('쌍검 난무',8,2),B('빈틈 노리기',{vulnerable:1,target:'random'})]),
        monster('bell-executioner','종탑 집행자','elite',1,115,[B('종의 울림',{vibration:7,target:'all'}),A('종추 강타',14)])
      ],
      bosses:[
        monster('gray-fortress-warden','회색 성채의 수문장','boss',1,190,[B('성채 방어',{shield:25}),A('처단의 검',18),A('무너지는 성벽',12,1,'all')]),
        monster('rift-queen','균열의 여왕','boss',1,175,[B('균열 소환',{summon:'ash-slime',count:1}),A('공허의 손길',10,1,'random',{weak:1}),A('공간 붕괴',16)])
      ]
    },
    {
      id:2,name:'녹슨 심장',subtitle:'용광로와 거대한 자동 기계의 공장',tint:'#ad713b',
      normal:[
        monster('heat-worm','열기벌레','normal',2,34,[A('열기 물기',6,1,'one',{burn:1})]),
        monster('gear-servant','톱니 하인','normal',2,36,[A('톱날 회전',5,2)]),
        monster('ash-technician','재투성이 기술자','normal',2,42,[A('렌치 타격',7),B('급조 방패',{shield:6})]),
        monster('steam-hound','증기 사냥개','normal',2,45,[B('압력 축적',{strength:1}),A('증기 돌진',9)]),
        monster('pressure-drone','압력 드론','normal',2,32,[A('압축탄',5),B('조준 레이저',{vulnerable:1,target:'random'})]),
        monster('ember-thrower','잿불 투척수','normal',2,38,[A('연료 화염병',8,1,'one',{burn:2})]),
        monster('rust-watchtower','녹슨 감시탑','normal',2,55,[A('포탑 사격',11),B('방열판 전개',{shield:12})]),
        monster('fuel-carrier','연료 운반체','normal',2,29,[A('자폭 폭발',13,1,'all',{selfDestruct:1})],'공격 후 자신도 파괴되는 폭발체.'),
        monster('unstable-core','불안정한 코어','normal',2,40,[B('에너지 축적',{strength:1}),A('코어 방출',15)]),
        monster('waste-heat-knight','폐열 기사','normal',2,50,[A('열검 베기',8),B('폐열 방출',{burn:1,target:'all'})])
      ],
      elites:[
        monster('pressure-knight','압력 기사','elite',2,115,[B('압력 장갑',{shield:15}),A('압축 강타',15)]),
        monster('welding-overseer','용접 감독관','elite',2,105,[A('화염 분사',10,1,'all',{burn:3}),B('출력 상승',{strength:2})]),
        monster('combustion-golem','연소 골렘','elite',2,135,[A('용융 타격',12,1,'one',{burn:2}),B('용융 반응',{grit:2})])
      ],
      bosses:[
        monster('iron-king-smith','철왕 대장장이','boss',2,215,[B('용광로 가열',{strength:3}),A('대장장이의 망치',20),B('쇳물 폭발',{burn:3,target:'all'})]),
        monster('engine-heart','기관의 심장','boss',2,230,[B('압력 축적',{strength:2}),A('증기 방출',10,1,'all'),A('과부하',22,1,'all'),B('기계 정지',{selfRest:1})])
      ]
    },
    {
      id:3,name:'침몰한 성역',subtitle:'바닷속 신전과 가라앉은 왕국',tint:'#3f8792',
      normal:[
        monster('coral-seedling','산호 종자','normal',3,34,[A('산호 찌르기',6),B('산호 껍질',{shield:5})]),
        monster('drowned-spearman','익사한 창병','normal',3,42,[A('침수된 창',9)]),
        monster('jelly-scout','해파리 정찰자','normal',3,30,[A('전기 촉수',5,1,'one',{vibration:3})]),
        monster('mist-wraith','물안개 망령','normal',3,36,[A('안개 손길',7),B('숨 막히는 안개',{weak:1,target:'random'})]),
        monster('deep-diver','심해 잠수부','normal',3,44,[A('잠수용 작살',8),B('잠수복 밀폐',{shield:8})]),
        monster('wave-priest','파도 사제','normal',3,38,[B('해류의 기세',{grit:3})]),
        monster('shell-armor','조개 갑주','normal',3,48,[B('조개 닫기',{shield:15}),A('조개 타격',6)]),
        monster('abyss-eel','심연 장어','normal',3,35,[A('연속 감전',4,3)]),
        monster('bubble-bomber','거품 폭탄수','normal',3,33,[A('거품 폭발',11),B('거품 재충전',{shield:6})]),
        monster('wreck-captain','난파선 선장','normal',3,46,[A('선장의 칼',10),B('명령의 손짓',{vulnerable:1,target:'random'})])
      ],
      elites:[
        monster('deep-diver-ghost','심해 잠수귀','elite',3,105,[A('잠수복 강타',14,1,'one',{weak:1}),B('압력 보호막',{shield:15})]),
        monster('coral-royal-guard','산호 왕실 근위병','elite',3,128,[B('산호 장갑',{shield:20}),A('왕실 창격',12)]),
        monster('current-predator','해류 포식자','elite',3,112,[A('물살 발톱',7,2,'one',{vibration:2})])
      ],
      bosses:[
        monster('deep-choirmaster','심해 성가대장','boss',3,200,[B('저주받은 노래',{vibration:5,target:'all'}),A('파도의 합창',12,1,'all'),B('심해의 울림',{vibration:5,target:'all'})]),
        monster('sunken-throne-king','침몰한 왕좌의 왕','boss',3,225,[B('왕의 방패',{shield:30}),A('삼지창의 심판',18),B('침몰의 명령',{weak:2,target:'all'})])
      ]
    },
    {
      id:4,name:'뒤틀린 수림',subtitle:'뿌리와 포자가 뒤엉킨 오래된 숲',tint:'#64865b',
      normal:[
        monster('moss-wolf','이끼 늑대','normal',4,39,[A('이끼 물어뜯기',6,2)]),
        monster('thorn-rabbit','가시 토끼','normal',4,31,[A('가시 박치기',7),B('민첩 도약',{agility:1})]),
        monster('spore-being','버섯 포자체','normal',4,35,[A('포자 분출',5,1,'one',{vibration:3})]),
        monster('sap-spirit','수액 정령','normal',4,40,[A('수액 타격',6),B('점성 보호',{shield:8})]),
        monster('antler-keeper','사슴뿔 파수꾼','normal',4,48,[A('뿔 들이받기',11),B('야생의 힘',{strength:1})]),
        monster('vine-archer','덩굴 궁수','normal',4,38,[A('덩굴 화살',8),B('덩굴 얽기',{weak:1,target:'random'})]),
        monster('root-golem','뿌리 골렘','normal',4,55,[A('뿌리 강타',12),B('뿌리 방패',{shield:10})]),
        monster('pollen-dancer','꽃가루 무희','normal',4,34,[A('꽃가루 폭발',5,1,'all',{burn:2})]),
        monster('rotten-tree','썩은 수목','normal',4,52,[A('썩은 가지',10),B('수목의 기세',{grit:2})]),
        monster('night-owl','밤숲 올빼미','normal',4,33,[A('야간 급습',4,3)])
      ],
      elites:[
        monster('thorn-lord','가시 군주','elite',4,118,[A('가시 채찍',13),B('가시 갑옷',{grit:3})]),
        monster('spore-cleric','포자 성직자','elite',4,108,[B('포자 기도',{weak:2,target:'all'}),A('진균 파동',10,1,'all',{vibration:3})]),
        monster('root-devourer','뿌리 포식자','elite',4,142,[A('뿌리 포식',16),B('지하 잠복',{shield:18})])
      ],
      bosses:[
        monster('mother-oldtree','고목의 어머니','boss',4,240,[A('뿌리의 심판',16),B('포자의 숨결',{vibration:5,target:'all'}),B('새 생명의 탄생',{summon:'sap-spirit',count:2})]),
        monster('white-night-hunt-king','백야 사냥왕','boss',4,220,[A('달빛 발톱',8,2),B('왕의 포효',{strength:3}),B('사냥의 표적',{vulnerable:2,target:'random'})])
      ]
    },
    {
      id:5,name:'창백한 경계',subtitle:'붕괴하는 차원과 끝없는 백색의 공간',tint:'#a9b5c7',
      normal:[
        monster('memory-echo','기억 잔향','normal',5,48,[A('기억의 타격',7),B('잔향 모방',{strength:1})]),
        monster('glass-shardling','유리 파편체','normal',5,42,[A('유리 칼날',5,2),B('날카로운 공명',{strength:1})]),
        monster('weightless-apostle','무중력 사도','normal',5,45,[A('무중력 파동',8,1,'one',{vibration:3})]),
        monster('time-remnant','시간 잔재','normal',5,46,[A('시간 균열',10),B('시간 고정',{grit:2})]),
        monster('dimension-wraith','차원 망령','normal',5,43,[A('차원 손길',9),B('존재 흐림',{weak:1,target:'random'})]),
        monster('inverted-guardian','반전 수호자','normal',5,56,[B('반전 방벽',{shield:15}),A('역방향 타격',13)]),
        monster('void-cluster','공허 군집','normal',5,40,[A('군집 침식',4,3)]),
        monster('mirror-insect','거울 벌레','normal',5,39,[A('반사 돌진',6),B('거울막',{shield:8})]),
        monster('broken-explorer','붕괴된 탐사자','normal',5,52,[A('탐사 도끼',11),B('균열 노출',{vulnerable:1,target:'random'})]),
        monster('white-light-sentinel','흰빛 감시자','normal',5,58,[A('백색 광선',12),B('빛의 축적',{strength:1})])
      ],
      elites:[
        monster('mirror-judge','거울 심판관','elite',5,130,[A('거울의 판결',10,2),B('반사 방패',{shield:12})]),
        monster('time-executioner','시간 단죄자','elite',5,118,[B('시간 단죄',{weak:2,target:'all'}),A('지연된 처형',18)]),
        monster('boundary-cutter','경계 절단자','elite',5,145,[A('차원 절단',17,1,'one',{vibration:5}),B('공간 압축',{strength:2})])
      ],
      bosses:[
        monster('boundary-gatekeeper','경계의 수문장','boss',5,270,[B('차원 방벽',{shield:35}),A('공간 절단',20,1,'one',{vibration:5}),B('시간 역행',{strength:-3,shield:15})]),
        monster('pale-whale','창백한 고래','boss',5,330,[A('백색 파동',12,1,'all'),A('공간 포식',18,1,'one',{vibration:5}),B('차원의 포효',{weak:2,target:'all'})],'차원 사이를 헤엄치며 세계를 삼키는 최종 포식자.')
      ]
    }
  ];
  cards['b-pack-bond'].art = 'zassets/zcards/zbeast-15.svg';

  const allMonsters = [...commonElites, ...acts.flatMap(a=>[...a.normal,...a.elites,...a.bosses])];
  const nodeTypes = [
    {id:'combat',name:'일반 전투',symbol:'⚔',count:16},
    {id:'rest',name:'휴식',symbol:'♨',count:5},
    {id:'shop',name:'상점',symbol:'¤',count:2},
    {id:'event',name:'랜덤 선택지',symbol:'?',count:5},
    {id:'elite',name:'엘리트',symbol:'☠',count:4}
  ];
  window.GAME_DATA = { characters, cards, commonElites, acts, allMonsters, nodeTypes };
})();
