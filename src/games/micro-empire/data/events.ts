export interface EventChoice {
  label: string;
  labelEn: string;
  effects: EventEffect[];
}

export interface EventEffect {
  type: 'resource' | 'population' | 'happiness' | 'building_damage';
  target?: string;
  value: number;
}

export interface GameEventDef {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  category: 'disaster' | 'opportunity' | 'choice';
  probability: number;
  minDay: number;
  choices: EventChoice[];
  condition?: (ctx: { season: number; population: number; year: number }) => boolean;
}

export const EVENT_DEFS: GameEventDef[] = [
  {
    id: 'storm',
    title: '暴风雨',
    titleEn: 'Storm',
    description: '一场猛烈的暴风雨袭来，农田受损！',
    descriptionEn: 'A violent storm damages your farmlands!',
    icon: '🌧️',
    category: 'disaster',
    probability: 0.03,
    minDay: 30,
    choices: [
      { label: '修复农田 (-20木材)', labelEn: 'Repair farms (-20 wood)', effects: [{ type: 'resource', target: 'wood', value: -20 }] },
      { label: '忍受损失 (-30食物)', labelEn: 'Bear the loss (-30 food)', effects: [{ type: 'resource', target: 'food', value: -30 }] },
    ],
  },
  {
    id: 'plague',
    title: '瘟疫',
    titleEn: 'Plague',
    description: '疫病在城镇中蔓延！',
    descriptionEn: 'Disease spreads through your town!',
    icon: '🦠',
    category: 'disaster',
    probability: 0.015,
    minDay: 100,
    choices: [
      { label: '隔离治疗 (-30金币)', labelEn: 'Quarantine (-30 gold)', effects: [{ type: 'resource', target: 'gold', value: -30 }, { type: 'population', value: -1 }] },
      { label: '听天由命', labelEn: 'Do nothing', effects: [{ type: 'population', value: -3 }, { type: 'happiness', value: -10 }] },
    ],
  },
  {
    id: 'earthquake',
    title: '地震',
    titleEn: 'Earthquake',
    description: '大地震动，部分建筑受损！',
    descriptionEn: 'An earthquake damages some buildings!',
    icon: '🌋',
    category: 'disaster',
    probability: 0.01,
    minDay: 200,
    choices: [
      { label: '紧急修复 (-40石材, -20金币)', labelEn: 'Emergency repair (-40 stone, -20 gold)', effects: [{ type: 'resource', target: 'stone', value: -40 }, { type: 'resource', target: 'gold', value: -20 }] },
      { label: '缓慢恢复', labelEn: 'Slow recovery', effects: [{ type: 'building_damage', value: 2 }, { type: 'happiness', value: -8 }] },
    ],
  },
  {
    id: 'fire',
    title: '火灾',
    titleEn: 'Fire',
    description: '城镇发生大火！',
    descriptionEn: 'A great fire breaks out in town!',
    icon: '🔥',
    category: 'disaster',
    probability: 0.02,
    minDay: 60,
    choices: [
      { label: '全力扑救 (-15木材)', labelEn: 'Fight the fire (-15 wood)', effects: [{ type: 'resource', target: 'wood', value: -15 }] },
      { label: '疏散人员', labelEn: 'Evacuate', effects: [{ type: 'building_damage', value: 1 }, { type: 'happiness', value: -5 }] },
    ],
  },
  {
    id: 'locust',
    title: '蝗灾',
    titleEn: 'Locust Swarm',
    description: '蝗虫席卷农田！',
    descriptionEn: 'Locusts devastate your crops!',
    icon: '🦗',
    category: 'disaster',
    probability: 0.02,
    minDay: 80,
    condition: (ctx) => ctx.season === 1,
    choices: [
      { label: '抢救粮食 (-10金币)', labelEn: 'Save crops (-10 gold)', effects: [{ type: 'resource', target: 'gold', value: -10 }, { type: 'resource', target: 'food', value: -20 }] },
      { label: '无可奈何', labelEn: 'Nothing to do', effects: [{ type: 'resource', target: 'food', value: -50 }] },
    ],
  },
  {
    id: 'blizzard',
    title: '暴风雪',
    titleEn: 'Blizzard',
    description: '凛冬中的暴风雪来袭！',
    descriptionEn: 'A blizzard strikes in winter!',
    icon: '❄️',
    category: 'disaster',
    probability: 0.04,
    minDay: 50,
    condition: (ctx) => ctx.season === 3,
    choices: [
      { label: '加强取暖 (-25木材)', labelEn: 'Extra heating (-25 wood)', effects: [{ type: 'resource', target: 'wood', value: -25 }] },
      { label: '硬扛过去', labelEn: 'Endure it', effects: [{ type: 'population', value: -1 }, { type: 'happiness', value: -10 }] },
    ],
  },
  {
    id: 'harvest',
    title: '丰收',
    titleEn: 'Bountiful Harvest',
    description: '今年迎来了大丰收！',
    descriptionEn: 'An exceptional harvest this season!',
    icon: '🌾',
    category: 'opportunity',
    probability: 0.04,
    minDay: 20,
    condition: (ctx) => ctx.season === 2,
    choices: [
      { label: '太好了！', labelEn: 'Wonderful!', effects: [{ type: 'resource', target: 'food', value: 60 }, { type: 'happiness', value: 5 }] },
    ],
  },
  {
    id: 'gold_vein',
    title: '发现金矿',
    titleEn: 'Gold Vein Discovery',
    description: '矿工发现了一条金矿脉！',
    descriptionEn: 'Miners discovered a gold vein!',
    icon: '💎',
    category: 'opportunity',
    probability: 0.02,
    minDay: 100,
    choices: [
      { label: '开采金矿', labelEn: 'Mine it!', effects: [{ type: 'resource', target: 'gold', value: 80 }] },
    ],
  },
  {
    id: 'refugees',
    title: '难民来投',
    titleEn: 'Refugees Arrive',
    description: '一群难民寻求庇护。',
    descriptionEn: 'A group of refugees seeks shelter.',
    icon: '🧑‍🤝‍🧑',
    category: 'choice',
    probability: 0.025,
    minDay: 60,
    choices: [
      { label: '接纳 (+5人口, -20食物)', labelEn: 'Accept (+5 pop, -20 food)', effects: [{ type: 'population', value: 5 }, { type: 'resource', target: 'food', value: -20 }] },
      { label: '拒绝', labelEn: 'Refuse', effects: [{ type: 'happiness', value: -3 }] },
    ],
  },
  {
    id: 'tech_breakthrough',
    title: '科技突破',
    titleEn: 'Tech Breakthrough',
    description: '学者们取得了重大发现！',
    descriptionEn: 'Scholars made a major discovery!',
    icon: '💡',
    category: 'opportunity',
    probability: 0.02,
    minDay: 120,
    choices: [
      { label: '太棒了！', labelEn: 'Excellent!', effects: [{ type: 'resource', target: 'knowledge', value: 30 }] },
    ],
  },
  {
    id: 'wandering_scholar',
    title: '流浪学者',
    titleEn: 'Wandering Scholar',
    description: '一位博学的旅人经过你的城镇。',
    descriptionEn: 'A learned traveler passes through.',
    icon: '🧙',
    category: 'choice',
    probability: 0.03,
    minDay: 80,
    choices: [
      { label: '收留 (-10金币, +15知识)', labelEn: 'Shelter (-10 gold, +15 knowledge)', effects: [{ type: 'resource', target: 'gold', value: -10 }, { type: 'resource', target: 'knowledge', value: 15 }] },
      { label: '礼送离开', labelEn: 'Send away politely', effects: [] },
    ],
  },
  {
    id: 'festival',
    title: '庆典',
    titleEn: 'Festival',
    description: '人民要求举办庆典！',
    descriptionEn: 'The people demand a festival!',
    icon: '🎉',
    category: 'choice',
    probability: 0.03,
    minDay: 50,
    choices: [
      { label: '举办庆典 (-15金币, -10食物)', labelEn: 'Celebrate (-15 gold, -10 food)', effects: [{ type: 'resource', target: 'gold', value: -15 }, { type: 'resource', target: 'food', value: -10 }, { type: 'happiness', value: 15 }] },
      { label: '拒绝', labelEn: 'Refuse', effects: [{ type: 'happiness', value: -5 }] },
    ],
  },
  {
    id: 'envoy',
    title: '邻国使者',
    titleEn: 'Foreign Envoy',
    description: '邻国派来了使者，提议结盟。',
    descriptionEn: 'A foreign envoy proposes an alliance.',
    icon: '🏳️',
    category: 'choice',
    probability: 0.02,
    minDay: 200,
    choices: [
      { label: '接受结盟 (-20金币)', labelEn: 'Accept alliance (-20 gold)', effects: [{ type: 'resource', target: 'gold', value: -20 }, { type: 'happiness', value: 8 }] },
      { label: '拒绝', labelEn: 'Decline', effects: [] },
    ],
  },
  {
    id: 'bandit_raid_small',
    title: '小规模盗匪',
    titleEn: 'Bandit Raid',
    description: '一伙盗匪试图抢劫你的仓库。',
    descriptionEn: 'Bandits attempt to raid your stores.',
    icon: '🏴‍☠️',
    category: 'disaster',
    probability: 0.03,
    minDay: 40,
    choices: [
      { label: '战斗 (-5金币)', labelEn: 'Fight (-5 gold)', effects: [{ type: 'resource', target: 'gold', value: -5 }] },
      { label: '交赎金 (-20金币)', labelEn: 'Pay ransom (-20 gold)', effects: [{ type: 'resource', target: 'gold', value: -20 }] },
    ],
  },
  {
    id: 'traveling_merchant_rare',
    title: '稀有商人',
    titleEn: 'Rare Merchant',
    description: '一位稀有商人带来了珍贵物资。',
    descriptionEn: 'A rare merchant brings precious goods.',
    icon: '🎪',
    category: 'choice',
    probability: 0.02,
    minDay: 100,
    choices: [
      { label: '购买食物 (-30金币, +50食物)', labelEn: 'Buy food (-30g, +50f)', effects: [{ type: 'resource', target: 'gold', value: -30 }, { type: 'resource', target: 'food', value: 50 }] },
      { label: '购买材料 (-30金币, +30木材, +20石材)', labelEn: 'Buy materials (-30g)', effects: [{ type: 'resource', target: 'gold', value: -30 }, { type: 'resource', target: 'wood', value: 30 }, { type: 'resource', target: 'stone', value: 20 }] },
      { label: '不买了', labelEn: 'Pass', effects: [] },
    ],
  },
  {
    id: 'spring_rain',
    title: '春雨',
    titleEn: 'Spring Rain',
    description: '温暖的春雨滋润了大地。',
    descriptionEn: 'Warm spring rain nourishes the land.',
    icon: '🌦️',
    category: 'opportunity',
    probability: 0.05,
    minDay: 10,
    condition: (ctx) => ctx.season === 0,
    choices: [
      { label: '好兆头！', labelEn: 'Good omen!', effects: [{ type: 'resource', target: 'food', value: 20 }, { type: 'happiness', value: 3 }] },
    ],
  },
  {
    id: 'summer_drought',
    title: '夏季干旱',
    titleEn: 'Summer Drought',
    description: '持续的高温导致干旱。',
    descriptionEn: 'Persistent heat causes a drought.',
    icon: '☀️',
    category: 'disaster',
    probability: 0.03,
    minDay: 40,
    condition: (ctx) => ctx.season === 1,
    choices: [
      { label: '挖掘水渠 (-15石材)', labelEn: 'Dig channels (-15 stone)', effects: [{ type: 'resource', target: 'stone', value: -15 }] },
      { label: '忍受', labelEn: 'Endure', effects: [{ type: 'resource', target: 'food', value: -25 }, { type: 'happiness', value: -5 }] },
    ],
  },
  {
    id: 'autumn_fair',
    title: '秋季集市',
    titleEn: 'Autumn Fair',
    description: '商人们聚集在你的城镇举办集市。',
    descriptionEn: 'Merchants gather for an autumn fair.',
    icon: '🍂',
    category: 'opportunity',
    probability: 0.04,
    minDay: 30,
    condition: (ctx) => ctx.season === 2,
    choices: [
      { label: '参加集市', labelEn: 'Attend the fair', effects: [{ type: 'resource', target: 'gold', value: 25 }, { type: 'happiness', value: 5 }] },
    ],
  },
  {
    id: 'mine_collapse',
    title: '矿洞坍塌',
    titleEn: 'Mine Collapse',
    description: '一处矿洞发生了坍塌事故！',
    descriptionEn: 'A mine shaft has collapsed!',
    icon: '⚠️',
    category: 'disaster',
    probability: 0.015,
    minDay: 150,
    choices: [
      { label: '救援 (-15铁矿, -10金币)', labelEn: 'Rescue (-15 iron, -10 gold)', effects: [{ type: 'resource', target: 'iron', value: -15 }, { type: 'resource', target: 'gold', value: -10 }] },
      { label: '封闭矿洞', labelEn: 'Seal the mine', effects: [{ type: 'population', value: -2 }, { type: 'happiness', value: -8 }] },
    ],
  },
  {
    id: 'population_boom',
    title: '人口爆发',
    titleEn: 'Population Boom',
    description: '良好的生活条件引来了大量移民！',
    descriptionEn: 'Good conditions attract many settlers!',
    icon: '👨‍👩‍👧‍👦',
    category: 'opportunity',
    probability: 0.015,
    minDay: 150,
    condition: (ctx) => ctx.population >= 20,
    choices: [
      { label: '欢迎！', labelEn: 'Welcome!', effects: [{ type: 'population', value: 8 }] },
    ],
  },
];
