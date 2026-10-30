export interface AchievementDef {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  // Early game
  { id: 'first_building', title: '拓荒者', titleEn: 'Pioneer', description: '建造第一座建筑', descriptionEn: 'Build your first building', icon: '🏗️' },
  { id: 'survive_year', title: '四季更迭', titleEn: 'Through the Seasons', description: '存活1年', descriptionEn: 'Survive 1 year', icon: '🗓️' },
  { id: 'first_trade', title: '商路开辟', titleEn: 'First Trade', description: '完成首次贸易', descriptionEn: 'Complete first trade', icon: '🤝' },
  { id: 'first_victory', title: '保卫家园', titleEn: 'Home Defender', description: '首次击退入侵', descriptionEn: 'Repel your first invasion', icon: '🛡️' },
  // Mid game
  { id: 'pop_10', title: '小村庄', titleEn: 'Small Village', description: '人口达到10', descriptionEn: 'Reach 10 population', icon: '🏘️' },
  { id: 'pop_50', title: '城镇', titleEn: 'Town', description: '人口达到50', descriptionEn: 'Reach 50 population', icon: '🏙️' },
  { id: 'buildings_10', title: '建设者', titleEn: 'Builder', description: '建造10座建筑', descriptionEn: 'Build 10 buildings', icon: '🔨' },
  { id: 'gold_500', title: '富甲一方', titleEn: 'Wealthy', description: '金币达到500', descriptionEn: 'Accumulate 500 gold', icon: '💰' },
  { id: 'tech_5', title: '学识渊博', titleEn: 'Learned', description: '研究5项科技', descriptionEn: 'Research 5 technologies', icon: '📖' },
  { id: 'survive_5years', title: '历史长河', titleEn: 'Through the Ages', description: '存活5年', descriptionEn: 'Survive 5 years', icon: '⏳' },
  // Late game
  { id: 'pop_100', title: '大都市', titleEn: 'Metropolis', description: '人口达到100', descriptionEn: 'Reach 100 population', icon: '🌆' },
  { id: 'buildings_25', title: '城市规划师', titleEn: 'City Planner', description: '建造25座建筑', descriptionEn: 'Build 25 buildings', icon: '📐' },
  { id: 'happiness_90', title: '人间乐土', titleEn: 'Paradise', description: '幸福度达到90', descriptionEn: 'Reach 90 happiness', icon: '😄' },
  { id: 'tech_all', title: '全知全能', titleEn: 'Omniscient', description: '研究所有科技', descriptionEn: 'Research all technologies', icon: '🧠' },
  { id: 'survive_10years', title: '千秋万代', titleEn: 'Eternal Empire', description: '存活10年', descriptionEn: 'Survive 10 years', icon: '👑' },
  { id: 'survive_20years', title: '不朽传奇', titleEn: 'Immortal Legend', description: '存活20年', descriptionEn: 'Survive 20 years', icon: '🏛️' },
  { id: 'pop_200', title: '帝国之都', titleEn: 'Imperial Capital', description: '人口达到200', descriptionEn: 'Reach 200 population', icon: '🏰' },
  { id: 'gold_2000', title: '黄金帝国', titleEn: 'Golden Empire', description: '金币达到2000', descriptionEn: 'Accumulate 2000 gold', icon: '👑' },
  { id: 'buildings_50', title: '奇迹城市', titleEn: 'Wonder City', description: '建造50座建筑', descriptionEn: 'Build 50 buildings', icon: '🌟' },
  { id: 'victory_5', title: '常胜将军', titleEn: 'Undefeated', description: '击退5次入侵', descriptionEn: 'Repel 5 invasions', icon: '⚔️' },
  // Victory
  { id: 'monument', title: '帝国荣光', titleEn: 'Imperial Glory', description: '建造帝国纪念碑，赢得胜利！', descriptionEn: 'Build the Monument and win!', icon: '🗿' },
];
