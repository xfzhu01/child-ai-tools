import { firstSyllable, lastSyllable } from "./pinyin";

export type ChainIdiom = {
  hanzi: string;
  pinyin: string;
};

export type ChainLevel = {
  level: number;
  idioms: ChainIdiom[];
};

/** 10 levels × 5 idioms — ordered easy → hard; 上一成语末字读音 = 下一成语首字读音。 */
const CHAIN_LEVEL_DATA: Omit<ChainLevel, "level">[] = [
  {
    idioms: [
      { hanzi: "一举两得", pinyin: "ju yi de li" },
      { hanzi: "立竿见影", pinyin: "li gan jian ying" },
      { hanzi: "英明果断", pinyin: "ying ming guo duan" },
      { hanzi: "断章取义", pinyin: "duan zhang qu yi" },
      { hanzi: "义愤填膺", pinyin: "yi fen tian ying" },
    ],
  },
  {
    idioms: [
      { hanzi: "名列前茅", pinyin: "ming lie qian mao" },
      { hanzi: "毛遂自荐", pinyin: "mao sui zi jian" },
      { hanzi: "见义勇为", pinyin: "jian yi yong wei" },
      { hanzi: "蔚然成风", pinyin: "wei ran cheng feng" },
      { hanzi: "风平浪静", pinyin: "feng ping lang jing" },
    ],
  },
  {
    idioms: [
      { hanzi: "精打细算", pinyin: "jing da xi suan" },
      { hanzi: "算无遗策", pinyin: "suan wu yi ce" },
      { hanzi: "策马奔腾", pinyin: "ce ma ben teng" },
      { hanzi: "腾云驾雾", pinyin: "teng yun jia wu" },
      { hanzi: "雾里看花", pinyin: "wu li kan hua" },
    ],
  },
  {
    idioms: [
      { hanzi: "画蛇添足", pinyin: "hua she tian zu" },
      { hanzi: "足智多谋", pinyin: "zu zhi duo mou" },
      { hanzi: "谋事在人", pinyin: "mou shi zai ren" },
      { hanzi: "人声鼎沸", pinyin: "ren sheng ding fei" },
      { hanzi: "沸反盈天", pinyin: "fei fan ying tian" },
    ],
  },
  {
    idioms: [
      { hanzi: "天长地久", pinyin: "tian chang di jiu" },
      { hanzi: "久负盛名", pinyin: "jiu fu sheng ming" },
      { hanzi: "名不虚传", pinyin: "ming bu xu chuan" },
      { hanzi: "传为佳话", pinyin: "chuan wei jia hua" },
      { hanzi: "话里有话", pinyin: "hua li you hua" },
    ],
  },
  {
    idioms: [
      { hanzi: "心直口快", pinyin: "xin zhi kou kuai" },
      { hanzi: "快马加鞭", pinyin: "kuai ma jia bian" },
      { hanzi: "鞭长莫及", pinyin: "bian chang mo ji" },
      { hanzi: "及锋而试", pinyin: "ji feng er shi" },
      { hanzi: "拭目以待", pinyin: "shi mu yi dai" },
    ],
  },
  {
    idioms: [
      { hanzi: "待价而沽", pinyin: "dai jia er gu" },
      { hanzi: "孤芳自赏", pinyin: "gu fang zi shang" },
      { hanzi: "赏心悦目", pinyin: "shang xin yue mu" },
      { hanzi: "目不暇接", pinyin: "mu bu xia jie" },
      { hanzi: "洁身自好", pinyin: "jie shen zi hao" },
    ],
  },
  {
    idioms: [
      { hanzi: "好高骛远", pinyin: "hao gao wu yuan" },
      { hanzi: "源远流长", pinyin: "yuan yuan bu jue" },
      { hanzi: "绝处逢生", pinyin: "jue chu feng sheng" },
      { hanzi: "生龙活虎", pinyin: "sheng long huo hu" },
      { hanzi: "虎头蛇尾", pinyin: "hu tou she wei" },
    ],
  },
  {
    idioms: [
      { hanzi: "尾大不掉", pinyin: "wei da bu diao" },
      { hanzi: "掉以轻心", pinyin: "diao yi qing xin" },
      { hanzi: "心花怒放", pinyin: "xin hua nu fang" },
      { hanzi: "放荡不羁", pinyin: "fang dang bu ji" },
      { hanzi: "积少成多", pinyin: "ji shao cheng duo" },
    ],
  },
  {
    idioms: [
      { hanzi: "多才多艺", pinyin: "duo cai duo yi" },
      { hanzi: "意气风发", pinyin: "yi qi feng fa" },
      { hanzi: "发号施令", pinyin: "fa hao shi ling" },
      { hanzi: "令人发指", pinyin: "ling ren fa zhi" },
      { hanzi: "指鹿为马", pinyin: "zhi lu wei ma" },
    ],
  },
];

function chainDifficultyScore(level: Omit<ChainLevel, "level">): number {
  return level.idioms.reduce((sum, idiom) => sum + idiom.pinyin.replace(/ /g, "").length, 0);
}

export const CHAIN_LEVELS: ChainLevel[] = [...CHAIN_LEVEL_DATA]
  .sort((a, b) => chainDifficultyScore(a) - chainDifficultyScore(b))
  .map((data, index) => ({ level: index + 1, idioms: data.idioms }));

export const CHAIN_LEVEL_COUNT = CHAIN_LEVELS.length;
export const CHAIN_IDIOMS_PER_LEVEL = 5;

export function validateChainLevel(level: ChainLevel): boolean {
  for (let i = 1; i < level.idioms.length; i++) {
    const prev = level.idioms[i - 1]!;
    const curr = level.idioms[i]!;
    if (lastSyllable(prev.pinyin) !== firstSyllable(curr.pinyin)) {
      return false;
    }
  }
  return true;
}

export function getAllChainHanzi(): string[] {
  return CHAIN_LEVELS.flatMap((l) => l.idioms.map((i) => i.hanzi));
}

/** @deprecated Use CHAIN_LEVELS */
export const CHAIN_WORDS = CHAIN_LEVELS.map((l) => l.idioms.map((i) => i.pinyin));
