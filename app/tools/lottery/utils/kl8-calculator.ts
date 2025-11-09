// 福彩快乐8奖金计算工具
// 根据官方规则实现完整的奖金计算功能

export interface KL8PrizeResult {
  prize: string;
  prizeAmount: number;
  matchCount: number;
  selectedCount: number;
  isFloatingPrize?: boolean;
}

export interface KL8CalculationParams {
  selectedCount: number; // 选择的号码数量 (1-10)
  matchCount: number; // 匹配的开奖号码数量 (0-10，但最多匹配selectedCount)
}

// 福彩8各玩法奖金规则（单位：元）
const KL8_PRIZE_RULES = {
  1: { // 选一
    1: 4.6, // 匹配1个: 4.6元
    0: 2,   // 匹配0个: 2元
  },
  2: { // 选二
    2: 19, // 匹配2个: 19元
  },
  3: { // 选三
    3: 53, // 匹配3个: 53元
    2: 3,  // 匹配2个: 3元
  },
  4: { // 选四
    4: 100, // 匹配4个: 100元
    3: 5,   // 匹配3个: 5元
    2: 3,   // 匹配2个: 3元
  },
  5: { // 选五
    5: 1000, // 匹配5个: 1000元
    4: 21,   // 匹配4个: 21元
    3: 3,    // 匹配3个: 3元
  },
  6: { // 选六
    6: 3000, // 匹配6个: 3000元
    5: 30,   // 匹配5个: 30元
    4: 10,   // 匹配4个: 10元
    3: 3,    // 匹配3个: 3元
  },
  7: { // 选七
    7: 10000, // 匹配7个: 10000元
    6: 288,   // 匹配6个: 288元
    5: 28,    // 匹配5个: 28元
    4: 4,     // 匹配4个: 4元
    0: 2,     // 匹配0个: 2元
  },
  8: { // 选八
    8: 50000, // 匹配8个: 50000元
    7: 800,   // 匹配7个: 800元
    6: 88,    // 匹配6个: 88元
    5: 10,    // 匹配5个: 10元
    4: 3,     // 匹配4个: 3元
    0: 2,     // 匹配0个: 2元
  },
  9: { // 选九
    9: 300000, // 匹配9个: 300000元
    8: 2000,   // 匹配8个: 2000元
    7: 200,    // 匹配7个: 200元
    6: 20,     // 匹配6个: 20元
    5: 5,      // 匹配5个: 5元
    4: 3,      // 匹配4个: 3元
    0: 2,      // 匹配0个: 2元
  },
  10: { // 选十
    10: "浮动奖金", // 匹配10个: 浮动奖金
    9: 8000,       // 匹配9个: 8000元
    8: 800,        // 匹配8个: 800元
    7: 80,         // 匹配7个: 80元
    6: 5,          // 匹配6个: 5元
    5: 3,          // 匹配5个: 3元
    0: 2,          // 匹配0个: 2元
  },
};

// 计算福彩8奖金
export const calculateKL8Prize = (params: KL8CalculationParams): KL8PrizeResult => {
  const { selectedCount, matchCount } = params;

  // 参数验证
  if (selectedCount < 1 || selectedCount > 10) {
    return {
      prize: "无效投注",
      prizeAmount: 0,
      matchCount,
      selectedCount,
    };
  }

  if (matchCount < 0 || matchCount > selectedCount) {
    return {
      prize: "无效匹配数",
      prizeAmount: 0,
      matchCount,
      selectedCount,
    };
  }

  // 获取对应玩法的奖金规则
  const prizeRules = KL8_PRIZE_RULES[selectedCount as keyof typeof KL8_PRIZE_RULES];

  if (!prizeRules) {
    return {
      prize: "不支持的玩法",
      prizeAmount: 0,
      matchCount,
      selectedCount,
    };
  }

  // 查找对应的奖金
  const prizeAmount = prizeRules[matchCount as keyof typeof prizeRules];

  // 如果没有找到对应的奖金规则，说明未中奖
  if (prizeAmount === undefined) {
    return {
      prize: "未中奖",
      prizeAmount: 0,
      matchCount,
      selectedCount,
    };
  }

  // 处理浮动奖金
  if (typeof prizeAmount === 'string') {
    return {
      prize: prizeAmount,
      prizeAmount: 0,
      matchCount,
      selectedCount,
      isFloatingPrize: true,
    };
  }

  // 固定奖金
  const prizeName = getPrizeName(selectedCount, matchCount, prizeAmount);

  return {
    prize: prizeName,
    prizeAmount,
    matchCount,
    selectedCount,
  };
};

// 获取奖金名称
const getPrizeName = (selectedCount: number, matchCount: number, prizeAmount: number): string => {
  if (prizeAmount === 0) return "未中奖";

  // 特殊高奖金命名
  if (prizeAmount >= 10000) {
    return `${prizeAmount.toLocaleString()}元`;
  }

  return `${prizeAmount}元`;
};

// 获取所有可能的中奖情况（用于显示）
export const getKL8AllPrizeOptions = (selectedCount: number): Array<{matchCount: number, prize: string | number}> => {
  const prizeRules = KL8_PRIZE_RULES[selectedCount as keyof typeof KL8_PRIZE_RULES];
  if (!prizeRules) return [];

  const options = Object.entries(prizeRules)
    .map(([matchCount, prize]) => ({
      matchCount: parseInt(matchCount),
      prize,
    }))
    .sort((a, b) => b.matchCount - a.matchCount); // 按匹配数降序排列

  return options;
};

// 验证参数有效性
export const validateKL8CalculationParams = (params: KL8CalculationParams): {
  isValid: boolean;
  error?: string;
} => {
  const { selectedCount, matchCount } = params;

  if (selectedCount < 1 || selectedCount > 10) {
    return {
      isValid: false,
      error: "选择号码数量必须在1-10之间",
    };
  }

  if (matchCount < 0 || matchCount > selectedCount) {
    return {
      isValid: false,
      error: `匹配数量必须在0-${selectedCount}之间`,
    };
  }

  return {
    isValid: true,
  };
};