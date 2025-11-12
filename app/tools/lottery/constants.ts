import { LotteryConfig, LotteryType } from "./types";

export type { LotteryType };
export const LOTTERY_CONFIGS: Record<LotteryType, LotteryConfig> = {
  dlt: {
    name: "大乐透",
    mainRange: [1, 35],
    mainCount: [5, 35], // 支持5-35个号码选择（复式）
    mainName: "前区",
    specialName: "后区",
    specialRange: [1, 12],
    specialCount: [2, 12], // 支持2-12个号码选择（复式）
    description: "前区5个号码(1-35) + 后区2个号码(1-12)，支持复式投注",
  },
  ssq: {
    name: "双色球",
    mainRange: [1, 33],
    mainCount: [6, 33], // 支持6-33个号码选择（复式）
    mainName: "红球",
    specialName: "篮球",
    specialRange: [1, 16],
    specialCount: [1, 16], // 支持1-16个号码选择（复式）
    description: "红球6个号码(1-33) + 蓝球1个号码(1-16)，支持复式投注",
  },
  kl8: {
    name: "快乐8",
    mainRange: [1, 80],
    mainCount: [1, 10], // 支持1-10个号码选择
    mainName: "选号",
    defaultCount: 10, // 默认选10个号码
    description: "选择1-10个号码(1-80)",
    // 快乐8投注规则：每注2元
    // 单式投注：选择n个号码，每2元可以投注1注
    // 复式投注：选择超过10个号码时，按组合数计算注数
    betAmounts: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2], // 1-10选都是每注2元
    maxSingleBet: 20000, // 单注最高投注2万元限制
  },
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const STORAGE_KEY = "lottery_generator_history";

// 计算快乐8投注金额
export const calculateKL8BetAmount = (
  selectedCount: number,
  gameType: number = 10
): number => {
  if (selectedCount < 1 || selectedCount > 16) return 0;
  if (gameType < 1 || gameType > 10) return 0;

  // 福彩8投注规则：
  // gameType: 玩法类型（选一、选二...选十）
  // selectedCount: 实际选择的号码数量

  // 如果选择的号码数量等于玩法数量，就是单式投注
  if (selectedCount === gameType) {
    return 2; // 单式投注，每注2元
  }

  // 如果选择的号码数量大于玩法数量，就是复式投注
  if (selectedCount > gameType) {
    // 复式投注：从selectedCount个号码中选gameType个的组合数 C(selectedCount, gameType)
    let betCount = 1;
    for (let i = 0; i < gameType; i++) {
      betCount = (betCount * (selectedCount - i)) / (i + 1);
    }
    return Math.floor(betCount) * 2;
  }

  // 如果选择的号码数量小于玩法数量，不能完成投注
  return 0;
};

// 计算快乐8注数（复式玩法）
export const calculateKL8BetCount = (
  selectedCount: number,
  gameType: number = 10
): number => {
  if (selectedCount < 1 || selectedCount > 80) return 0;
  if (gameType < 1 || gameType > 10) return 0;

  // 如果选择的号码数量等于玩法数量，就是单式投注，1注
  if (selectedCount === gameType) {
    return 1;
  }

  // 如果选择的号码数量小于玩法数量，无法完成投注，0注
  if (selectedCount < gameType) {
    return 0;
  }

  // 如果选择的号码数量大于玩法数量，就是复式投注
  // 从selectedCount个号码中选gameType个的组合数 C(selectedCount, gameType)
  let result = 1;
  for (let i = 0; i < gameType; i++) {
    result = (result * (selectedCount - i)) / (i + 1);
  }

  return Math.floor(result);
};

// 格式化金额显示
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("zh-CN", {
    style: "currency",
    currency: "CNY",
  });
};

// 计算大乐透投注金额
export const calculateDLTBetAmount = (
  mainCount: number,
  specialCount: number
): number => {
  // 大乐透投注规则：
  // 前区选择5个，后区选择2个 = 单式投注，每注2元
  // 复式投注：从前区选m个号码中选5个的组合 × 从后区选n个号码中选2个的组合

  if (mainCount < 5 || specialCount < 2) return 0;

  // 计算前区组合数 C(mainCount, 5)
  let mainCombinations = 1;
  for (let i = 0; i < 5; i++) {
    mainCombinations = (mainCombinations * (mainCount - i)) / (i + 1);
  }

  // 计算后区组合数 C(specialCount, 2)
  let specialCombinations = 1;
  for (let i = 0; i < 2; i++) {
    specialCombinations = (specialCombinations * (specialCount - i)) / (i + 1);
  }

  const totalCombinations = Math.floor(mainCombinations * specialCombinations);
  return totalCombinations * 2; // 每注2元
};

// 计算双色球投注金额
export const calculateSSQBetAmount = (
  mainCount: number,
  specialCount: number
): number => {
  // 双色球投注规则：
  // 红球选择6个，蓝球选择1个 = 单式投注，每注2元
  // 复式投注：从红球选m个号码中选6个的组合 × 蓝球数量

  if (mainCount < 6 || specialCount < 1) return 0;

  // 计算红球组合数 C(mainCount, 6)
  let mainCombinations = 1;
  for (let i = 0; i < 6; i++) {
    mainCombinations = (mainCombinations * (mainCount - i)) / (i + 1);
  }

  const totalCombinations = Math.floor(mainCombinations * specialCount);
  return totalCombinations * 2; // 每注2元
};

// 计算投注注数
export const calculateBetCount = (
  selectedType: LotteryType,
  mainCount: number,
  specialCount: number
): number => {
  switch (selectedType) {
    case "dlt":
      if (mainCount < 5 || specialCount < 2) return 0;
      // 大乐透：C(mainCount, 5) × C(specialCount, 2)
      let mainComb = 1;
      for (let i = 0; i < 5; i++) {
        mainComb = (mainComb * (mainCount - i)) / (i + 1);
      }
      let specialComb = 1;
      for (let i = 0; i < 2; i++) {
        specialComb = (specialComb * (specialCount - i)) / (i + 1);
      }
      return Math.floor(mainComb * specialComb);

    case "ssq":
      if (mainCount < 6 || specialCount < 1) return 0;
      // 双色球：C(mainCount, 6) × specialCount
      let mainCombinations = 1;
      for (let i = 0; i < 6; i++) {
        mainCombinations = (mainCombinations * (mainCount - i)) / (i + 1);
      }
      return Math.floor(mainCombinations * specialCount);

    case "kl8":
      // 快乐8的逻辑保持不变
      return calculateKL8BetCount(mainCount, 10); // 默认选10玩法

    default:
      return 0;
  }
};

// 验证KL8投注金额是否超过限制
export const validateKL8BetLimit = (
  selectedCount: number,
  gameType: number = 10
): {
  isValid: boolean;
  betAmount: number;
  errorMessage?: string;
} => {
  const betAmount = calculateKL8BetAmount(selectedCount, gameType);
  const maxBet = LOTTERY_CONFIGS.kl8.maxSingleBet || 20000;

  if (betAmount > maxBet) {
    return {
      isValid: false,
      betAmount,
      errorMessage: `投注金额 ¥${betAmount} 超过单注限额 ¥${maxBet}`,
    };
  }

  return {
    isValid: true,
    betAmount,
  };
};
