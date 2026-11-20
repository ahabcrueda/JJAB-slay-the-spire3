/* Relic and event catalogue for Multidimension Expedition. */
(() => {
  const relic = (id, name, rarity, desc, effect, icon = id) => ({
    id, name, rarity, desc, effect, icon: `zassets/zrelics/z${icon}.svg`
  });

  const relics = [
    // Common (12)
    relic('first-flint','초행의 부싯돌','common','전투 시작 시 첫 번째 아군이 쉴드 4를 얻는다.',{startShieldFirst:4}),
    relic('worn-bracer','낡은 손목보호대','common','각 아군 턴마다 처음 얻는 쉴드가 2 증가한다.',{firstShieldPerTurn:2}),
    relic('poison-vial','독 유리병','common','전투 중 처음 부여하는 독이 2 증가한다.',{firstPoison:2}),
    relic('ember-charm','잿불 부적','common','전투 중 처음 부여하는 화상이 2 증가한다.',{firstBurn:2}),
    relic('ripple-pendulum','파문 추','common','매 라운드 처음 부여하는 진동이 1 증가한다.',{firstVibrationPerRound:1}),
    relic('grit-knot','기세 매듭','common','전투 시작 시 두 아군이 기세 1을 얻는다.',{startGrit:1}),
    relic('weakpoint-lens','약점 렌즈','common','취약한 적을 공격하는 라운드 첫 공격에 피해 3을 추가한다.',{firstAttackVsVulnerable:3}),
    relic('whetstone-chip','숫돌 조각','common','전투 중 처음 사용하는 공격 카드의 피해가 4 증가한다.',{firstAttackCard:4}),
    relic('collector-coin','수집가의 동전','common','일반 전투 승리 시 각 아군이 골드 8을 추가 획득한다.',{normalBattleGold:8}),
    relic('rest-teacup','휴식용 찻잔','common','휴식 노드의 회복량이 각 아군마다 5 증가한다.',{restHeal:5}),
    relic('outpost-feather','초소의 깃털','common','라운드 동안 두 아군 모두 체력 피해를 받지 않으면 종료 시 각각 쉴드 4를 얻는다.',{cleanRoundShield:4}),
    relic('guide-note','길잡이 쪽지','common','랜덤 선택지에서 작은 보급품 선택지가 추가된다.',{eventBonusChoice:true}),

    // Uncommon (9)
    relic('linked-shield','연동 방패','uncommon','한 번에 쉴드 10 이상을 얻으면 다른 아군이 쉴드 5를 얻는다. 라운드당 1회.',{linkedShield:5}),
    relic('paired-rhythm','짝의 박자','uncommon','두 아군이 같은 라운드에 공격 카드를 사용하면 전투 중 처음 한 번 두 아군이 힘 2를 얻는다.',{pairedAttackStrength:2}),
    relic('corrosion-catalyst','부식 촉매','uncommon','독에 걸린 적을 공격하는 라운드 첫 공격 카드에 피해 2를 추가한다.',{firstAttackVsPoison:2}),
    relic('furnace-heart','화로 심장','uncommon','매 라운드 처음 부여하는 화상이 1 증가한다.',{firstBurnPerRound:1}),
    relic('vital-seal','급소 인장','uncommon','전투 중 처음 부여하는 취약의 지속시간이 1턴 증가한다.',{firstVulnerable:1}),
    relic('triple-spring','삼중 태엽','uncommon','매 3번째 라운드에 두 아군이 다음 턴 에너지 1을 추가로 얻는다.',{thirdRoundEnergy:1}),
    relic('resonator','공명기','uncommon','진동 피해가 발동하면 해당 적에게 약화 1턴을 부여한다. 라운드당 1회.',{vibrationWeak:1}),
    relic('retreat-guard','후퇴 방패','uncommon','아군이 체력 피해를 받으면 다른 아군이 기세 3을 얻는다. 라운드당 1회.',{allyGritOnHpDamage:3}),
    relic('tactical-lens','전술 렌즈','uncommon','전투 후 카드 보상 선택지가 1장 증가한다.',{extraRewardCard:1}),

    // Rare (6)
    relic('twin-heart','쌍둥이 심장','rare','전투 중 처음 아군 한 명의 체력이 최대 체력의 30% 이하가 되면 다른 아군이 쉴드 10과 힘 2를 얻는다.',{lowHpAllyShield:10,lowHpAllyStrength:2}),
    relic('endless-hourglass','무한 모래시계','rare','매 3번째 라운드에 각 아군이 턴 시작 시 카드 2장을 추가로 뽑는다.',{thirdRoundDraw:2}),
    relic('echo-mirror','거울의 잔향','rare','표식이 끝날 때 누적 체력 피해의 60%를 추가로 받는다.',{markRatio:0.6}),
    relic('poison-king-seal','독왕의 밀랍봉','rare','독 피해가 발생할 때마다 추가 피해 2를 준다.',{poisonBonusDamage:2}),
    relic('still-fortress','정지된 요새','rare','엘리트 및 보스 전투 시작 시 두 아군이 쉴드 12를 얻는다.',{eliteBossStartShield:12}),
    relic('dimensional-stitch','차원 재봉틀','rare','각 라운드에 처음 코스트 2 이상 카드를 사용하면 카드 1장을 뽑고 쉴드 4를 얻는다.',{firstCostlyCardDraw:1,firstCostlyCardShield:4}),

    // Boss (11)
    relic('rift-generator','균열 발전기','boss','두 아군의 기본 에너지가 4가 된다. 모든 적은 전투 시작 시 힘 2를 얻는다.',{energyBonus:1,enemyStartStrength:2}),
    relic('unclosed-library','닫히지 않는 서고','boss','두 번째 아군 턴 종료 시 손패를 버리지 않고 다음 라운드로 가져간다. 전투 시작 시 손패를 2장 적게 뽑는다.',{retainSecondHeroHand:true,startDrawPenalty:2}),
    relic('pale-crown','창백한 왕관','boss','전투 시작 시 두 아군이 힘 2를 얻는다. 모든 체력 회복량이 50% 감소한다.',{startStrength:2,healingMultiplier:0.5}),
    relic('stopped-king-heart','멈춰버린 왕의 심장','boss','전투 시작 시 두 아군이 기세 8을 얻는다. 쉴드 획득량이 25% 감소한다.',{startGrit:8,shieldMultiplier:0.75}),
    relic('endless-hunger','무한한 굶주림','boss','적을 처치한 공격자는 체력 8을 회복한다. 두 아군의 최대 체력이 10 감소한다.',{healOnKill:8,maxHpPenalty:10}),
    relic('dimension-scepter','차원 지배자의 홀','boss','전투 시작 시 두 아군이 힘 3을 얻는다. 각 아군의 턴 시작 카드 드로우가 2장 감소한다.',{startStrength:3,startDrawPenalty:2}),
    relic('broken-timework','붕괴한 시간의 태엽','boss','각 아군 턴에 처음 사용하는 카드의 코스트가 1 감소한다. 손패의 마지막 카드 코스트는 1 증가한다.',{firstCardCostReduction:1,lastCardCostIncrease:1}),
    relic('blood-contract','피로 맺은 계약서','boss','체력 피해를 받을 때마다 힘 1을 얻는다. 전투 중 체력을 회복할 수 없다.',{strengthOnHpDamage:1,noHealing:true}),
    relic('mirror-legion','거울 너머의 군단','boss','각 아군 턴의 첫 공격 카드 피해가 50% 증가한다. 스킬 카드의 쉴드 획득량이 50% 감소한다.',{firstAttackCardMultiplier:1.5,skillShieldMultiplier:0.5}),
    relic('abyss-throne','심연의 왕좌','boss','전투마다 처음 체력이 0이 되는 상황을 막고 체력 1로 생존한다. 전투 시작 시 두 아군이 취약 1턴을 얻는다.',{preventDeathOnce:true,startVulnerable:1}),
    relic('pale-star-shard','창백한 별의 파편','boss','각 아군 턴의 첫 카드 코스트가 0이 된다. 각 아군은 턴 시작 시 체력 4를 잃는다.',{firstCardFree:true,turnStartHpLoss:4})
  ];

  const option = (label, desc, effect) => ({ label, desc, effect });
  const event = (id, act, title, text, options) => ({ id, act, title, text, options });
  const events = [
    // Act 1
    event('act1-abandoned-altar',1,'버려진 제단','폐허 한가운데 오래된 제단이 놓여 있다. 희미한 빛이 제단을 감싸고 있다.',[
      option('제물을 바친다','체력 8을 잃고 일반 유물 1개 획득',{type:'relic',rarity:'common',hpLoss:8}),
      option('제단을 조사한다','50% 확률로 일반 유물 획득. 실패하면 체력 12 감소',{type:'chanceRelic',rarity:'common',chance:0.5,failHp:12}),
      option('떠난다','아무것도 얻지 않는다',{type:'nothing'})
    ]),
    event('act1-supply-store',1,'무너진 보급 창고','버려진 창고에서 과거 탐험대가 남긴 물자를 발견했다.',[
      option('식량을 챙긴다','두 아군 모두 체력 8 회복',{type:'heal',value:8}),
      option('돈을 챙긴다','각 아군 골드 65 획득',{type:'gold',value:65}),
      option('상자를 부순다','무작위 무색 카드 1장 획득',{type:'colorlessCard',cardType:'any'})
    ]),
    event('act1-strange-merchant',1,'정체불명의 상인','한 노인이 낡은 천막 아래에서 기묘한 물건을 판매하고 있다.',[
      option('물건을 구매한다','골드 100을 지불하고 고급 유물 획득',{type:'relicPurchase',rarity:'uncommon',cost:100}),
      option('정보를 구매한다','골드 40을 지불하고 다음 엘리트의 체력을 10% 낮춘다',{type:'eliteWeakening',cost:40,value:0.1}),
      option('떠난다','아무것도 하지 않는다',{type:'nothing'})
    ]),

    // Act 2
    event('act2-unstable-lab',2,'불안정한 실험실','오래된 실험실 안에 아직 작동하는 장치가 남아 있다.',[
      option('실험에 참여한다','무작위 아군이 공격 피해 +2를 얻는다. 체력 10 감소',{type:'attackBonus',value:2,hpLoss:10}),
      option('장치를 훔친다','일반 유물 1개 획득. 체력 15 감소',{type:'relic',rarity:'common',hpLoss:15}),
      option('실험실을 조사한다','각 아군 골드 45 획득',{type:'gold',value:45})
    ]),
    event('act2-forgotten-forge',2,'잊힌 대장간','꺼지지 않은 거대한 용광로가 발견되었다.',[
      option('무기를 단련한다','두 아군 모두 공격 피해 +2',{type:'partyAttackBonus',value:2}),
      option('갑옷을 단련한다','두 아군 모두 다음 전투 시작 시 쉴드 8 획득',{type:'nextBattleShield',value:8}),
      option('용광로를 해체한다','각 아군 골드 80 획득',{type:'gold',value:80})
    ]),
    event('act2-red-core',2,'붉은 핵','공장 깊숙한 곳에서 아직 작동하는 에너지 핵을 발견했다.',[
      option('핵을 흡수한다','고급 유물 획득. 두 아군 체력 10 감소',{type:'relic',rarity:'uncommon',hpLoss:10}),
      option('핵을 안정화한다','두 아군 힘 1, 다음 전투 시작 쉴드 5 획득',{type:'partyStrengthAndShield',strength:1,shield:5}),
      option('핵을 파괴한다','각 아군 골드 100 획득',{type:'gold',value:100})
    ]),

    // Act 3
    event('act3-sunken-treasure',3,'침몰한 보물실','물속에 잠긴 왕실의 보물실을 발견했다.',[
      option('보물 하나를 가져간다','고급 유물 1개 획득',{type:'relic',rarity:'uncommon'}),
      option('금화를 가져간다','각 아군 골드 150 획득',{type:'gold',value:150}),
      option('왕실의 저주를 감수한다','희귀 유물 획득. 다음 전투 시작 시 두 아군 취약 2턴',{type:'relic',rarity:'rare',nextBattleVulnerable:2})
    ]),
    event('act3-dead-king',3,'죽은 왕의 속삭임','옥좌에 앉은 망령이 원정대에게 거래를 제안한다.',[
      option('왕의 힘을 빌린다','두 아군 힘 2 획득. 최대 체력 5 감소',{type:'partyStrengthAndMaxHpLoss',strength:2,maxHpLoss:5}),
      option('왕의 지식을 얻는다','무작위 무색 카드 1장 획득',{type:'colorlessCard',cardType:'any'}),
      option('왕을 무시한다','아무것도 하지 않는다',{type:'nothing'})
    ]),
    event('act3-deep-pearl',3,'심해의 진주','바닷속에서 푸른빛을 내는 진주를 발견했다.',[
      option('진주를 삼킨다','두 아군 체력 12 회복',{type:'heal',value:12}),
      option('진주를 판매한다','각 아군 골드 90 획득',{type:'gold',value:90}),
      option('진주를 연구한다','무작위 아군의 덱에서 카드 1장 제거',{type:'removeRandomCard'})
    ]),

    // Act 4
    event('act4-life-tree',4,'생명의 나무','거대한 나무의 중심에서 생명의 기운이 흘러나온다.',[
      option('뿌리를 먹는다','두 아군 체력 15 회복',{type:'heal',value:15}),
      option('생명의 힘을 흡수한다','두 아군 기세 4 획득',{type:'partyGrit',value:4}),
      option('나무의 열매를 채집한다','각 아군 골드 100 획득',{type:'gold',value:100})
    ]),
    event('act4-poison-mushroom',4,'독버섯 군락','독성이 강한 버섯들이 군락을 이루고 있다.',[
      option('독을 연구한다','고급 유물 1개 획득',{type:'relic',rarity:'uncommon'}),
      option('버섯을 먹는다','체력 10 감소, 두 아군의 공격 피해 +1',{type:'partyAttackBonus',value:1,hpLoss:10}),
      option('버섯을 판매한다','각 아군 골드 70 획득',{type:'gold',value:70})
    ]),
    event('act4-hunter-cabin',4,'사라진 사냥꾼의 집','오래전에 사라진 사냥꾼의 오두막을 발견했다.',[
      option('무기를 가져간다','무작위 무색 공격 카드 1장 획득',{type:'colorlessCard',cardType:'공격'}),
      option('사냥 도구를 가져간다','무작위 무색 스킬 카드 1장 획득',{type:'colorlessCard',cardType:'스킬'}),
      option('오두막을 조사한다','각 아군 골드 50 및 체력 5 회복',{type:'healAndGold',heal:5,gold:50})
    ]),

    // Act 5
    event('act5-pale-shard',5,'창백한 파편','차원을 찢고 나온 정체불명의 파편이 공중에 떠 있다.',[
      option('파편을 받아들인다','희귀 유물 1개 획득. 체력 15 감소',{type:'relic',rarity:'rare',hpLoss:15}),
      option('파편을 분석한다','두 아군의 공격 피해 +2',{type:'partyAttackBonus',value:2}),
      option('파편을 봉인한다','두 아군 기세 5 획득',{type:'partyGrit',value:5})
    ]),
    event('act5-stopped-time',5,'멈춘 시간','시간이 흐르지 않는 공간에서 모래시계 하나가 발견되었다.',[
      option('시간을 되돌린다','두 아군 체력 20 회복',{type:'heal',value:20}),
      option('시간을 훔친다','다음 전투에서 두 아군 첫 턴 에너지 +1',{type:'nextBattleEnergy',value:1}),
      option('시간을 판매한다','각 아군 골드 130 획득',{type:'gold',value:130})
    ]),
    event('act5-whale-eye',5,'고래의 눈','창백한 공간에서 거대한 눈 하나가 원정대를 바라보고 있다.',[
      option('눈을 마주한다','희귀 유물 1개 획득. 다음 전투 시작 시 취약 1턴',{type:'relic',rarity:'rare',nextBattleVulnerable:1}),
      option('눈을 피한다','각 아군 골드 120 획득',{type:'gold',value:120}),
      option('눈을 공격한다','다음 엘리트 전투 적 체력 20% 감소',{type:'eliteWeakening',value:0.2})
    ])
  ];

  events.push(
    event('act1-bell-tower',1,'금 간 종탑','폐허의 종탑 꼭대기에서 작은 종소리가 울린다.',[
      option('종을 울린다','각 아군 기세 2 획득',{type:'partyGrit',value:2}),
      option('종탑의 상자를 연다','일반 유물 1개 획득',{type:'relic',rarity:'common'}),
      option('종탑 아래를 살핀다','각 아군 골드 40 획득',{type:'gold',value:40})
    ]),
    event('act1-cartographer',1,'길 잃은 지도 제작자','부서진 지도 위에 길을 표시하는 여행자를 만났다.',[
      option('지도를 산다','골드 35 지불, 다음 엘리트 체력 10% 감소',{type:'eliteWeakening',cost:35,value:0.1}),
      option('지도를 베낀다','각 아군 골드 25 획득',{type:'gold',value:25}),
      option('지나친다','아무것도 하지 않는다',{type:'nothing'})
    ]),
    event('act2-assembly-line',2,'멈추지 않는 조립선','꺼지지 않은 조립선이 낡은 기계 부품을 계속 찍어내고 있다.',[
      option('부품을 회수한다','각 아군 골드 75 획득',{type:'gold',value:75}),
      option('전투 장치를 분해한다','고급 유물 1개 획득',{type:'relic',rarity:'uncommon',hpLoss:8}),
      option('전원을 내린다','다음 전투 시작 시 두 아군 쉴드 8',{type:'nextBattleShield',value:8})
    ]),
    event('act2-automaton',2,'고장 난 자동인형','부서진 자동인형이 마지막 명령을 반복하고 있다.',[
      option('수리해 준다','두 아군 체력 8 회복',{type:'heal',value:8}),
      option('핵심 부품을 가져간다','일반 유물 1개 획득',{type:'relic',rarity:'common'}),
      option('기억을 추출한다','무작위 무색 카드 1장 획득',{type:'colorlessCard',cardType:'any'})
    ]),
    event('act3-siren-mirror',3,'인어의 거울','거울 표면에 원정대의 모습이 아닌 낯선 인물이 비친다.',[
      option('거울을 만진다','희귀 유물 1개 획득. 체력 12 감소',{type:'relic',rarity:'rare',hpLoss:12}),
      option('거울 조각을 판다','각 아군 골드 85 획득',{type:'gold',value:85}),
      option('거울을 덮는다','두 아군 기세 3 획득',{type:'partyGrit',value:3})
    ]),
    event('act3-pressure-vault',3,'수압 금고','깊은 바다의 수압을 견디는 금고가 발견되었다.',[
      option('금고를 연다','각 아군 골드 110 획득',{type:'gold',value:110}),
      option('압력 장치를 가져간다','고급 유물 1개 획득',{type:'relic',rarity:'uncommon'}),
      option('안전하게 빠져나온다','두 아군 체력 10 회복',{type:'heal',value:10})
    ]),
    event('act4-root-network',4,'뿌리의 기억','땅속 뿌리들이 오래된 기억을 속삭인다.',[
      option('기억을 받아들인다','두 아군 힘 1 획득',{type:'partyStrengthAndMaxHpLoss',strength:1,maxHpLoss:0}),
      option('뿌리의 열매를 딴다','각 아군 골드 90 획득',{type:'gold',value:90}),
      option('뿌리를 잘라낸다','무작위 무색 카드 1장 획득',{type:'colorlessCard',cardType:'any'})
    ]),
    event('act4-sleeping-guardian',4,'잠든 숲의 수호자','거대한 짐승이 나무 아래 잠들어 있다. 그 곁에 작은 유물이 놓여 있다.',[
      option('조용히 유물을 가져간다','고급 유물 1개 획득. 실패 없이 안전하게 획득',{type:'relic',rarity:'uncommon'}),
      option('수호자를 깨운다','다음 엘리트 체력 15% 감소, 대신 두 아군 체력 8 감소',{type:'eliteWeakening',value:0.15,hpLoss:8}),
      option('열매만 가져간다','두 아군 체력 8 회복',{type:'heal',value:8})
    ]),
    event('act5-duplicate-dimension',5,'중복된 차원','원정대와 똑같은 두 사람이 균열 너머에서 손짓한다.',[
      option('그들과 교환한다','희귀 유물 1개 획득',{type:'relic',rarity:'rare'}),
      option('그들의 덱을 훔친다','무색 카드 1장 획득',{type:'colorlessCard',cardType:'any'}),
      option('균열을 닫는다','두 아군 기세 6 획득',{type:'partyGrit',value:6})
    ]),
    event('act5-pale-echo',5,'창백한 메아리','고래의 울음과 닮은 소리가 차원 틈새에서 반복된다.',[
      option('메아리를 담는다','희귀 유물 1개 획득. 체력 10 감소',{type:'relic',rarity:'rare',hpLoss:10}),
      option('소리를 따라간다','다음 보스 전투 시작 시 두 아군 쉴드 15',{type:'nextBattleShield',value:15}),
      option('귀를 막는다','각 아군 골드 140 획득',{type:'gold',value:140})
    ])
  );

  window.GAME_DATA.relics = relics;
  window.GAME_DATA.events = events;
})();
