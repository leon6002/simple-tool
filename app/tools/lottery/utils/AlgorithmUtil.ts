import { AlgorithmType, LotteryConfig, LotteryStatistics } from "../types";
import { getColdNumbers, getHighFrequencyNumbers } from "../utils";

interface AlgorithmResult {
  mainNumbers: number[];
  specialNumbers: number[];
}

const highFrequencyAlgorithm = (
  mainNumbers: number[],
  specialNumbers: number[],
  statistics: LotteryStatistics,
  config: LotteryConfig,
  targetCount?: number,
  specialTargetCount?: number
) => {
  // 高频算法：优先选择高频号码
  const mainCount =
    targetCount ||
    (Array.isArray(config.mainCount) ? config.mainCount[0] : config.mainCount);
  const hotMainNumbers = getHighFrequencyNumbers(
    statistics!,
    mainCount * 2,
    false,
    config
  );
  if (hotMainNumbers.length >= mainCount) {
    const selected = hotMainNumbers
      .sort(() => Math.random() - 0.5)
      .slice(0, mainCount)
      .sort((a, b) => a - b);
    mainNumbers.push(...selected);
  } else {
    mainNumbers.push(...hotMainNumbers);

    // 如果号码不够，使用优化的随机算法补全
    if (mainNumbers.length < mainCount) {
      const remaining = mainCount - mainNumbers.length;
      const availableNumbers = [];
      for (let i = config.mainRange[0]; i <= config.mainRange[1]; i++) {
        if (!mainNumbers.includes(i)) {
          availableNumbers.push(i);
        }
      }

      // Fisher-Yates 洗牌算法
      for (let i = availableNumbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableNumbers[i], availableNumbers[j]] = [
          availableNumbers[j],
          availableNumbers[i],
        ];
      }

      mainNumbers.push(...availableNumbers.slice(0, remaining));
    }
    mainNumbers.sort((a, b) => a - b);
  }

  if (config.specialRange && config.specialCount) {
    const specialCount =
      specialTargetCount ||
      (Array.isArray(config.specialCount)
        ? config.specialCount[0]
        : config.specialCount);
    const hotSpecialNumbers = getHighFrequencyNumbers(
      statistics!,
      specialCount * 2,
      true,
      config
    );
    if (hotSpecialNumbers.length >= specialCount) {
      const selected = hotSpecialNumbers
        .sort(() => Math.random() - 0.5)
        .slice(0, specialCount)
        .sort((a, b) => a - b);
      specialNumbers.push(...selected);
    } else {
      specialNumbers.push(...hotSpecialNumbers);

      // 如果号码不够，使用优化的随机算法补全
      if (specialNumbers.length < specialCount) {
        const remaining = specialCount - specialNumbers.length;
        const availableNumbers = [];
        for (let i = config.specialRange[0]; i <= config.specialRange[1]; i++) {
          if (!specialNumbers.includes(i)) {
            availableNumbers.push(i);
          }
        }

        // Fisher-Yates 洗牌算法
        for (let i = availableNumbers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [availableNumbers[i], availableNumbers[j]] = [
            availableNumbers[j],
            availableNumbers[i],
          ];
        }

        specialNumbers.push(...availableNumbers.slice(0, remaining));
      }
      specialNumbers.sort((a, b) => a - b);
    }
  }
};

const lowFrequencyAlgorithm = (
  mainNumbers: number[],
  specialNumbers: number[],
  statistics: LotteryStatistics,
  config: LotteryConfig,
  targetCount?: number,
  specialTargetCount?: number
) => {
  const mainCount =
    targetCount ||
    (Array.isArray(config.mainCount) ? config.mainCount[0] : config.mainCount);
  const coldMainNumbers = getColdNumbers(
    statistics!,
    mainCount * 2,
    false,
    config
  );
  if (coldMainNumbers.length >= mainCount) {
    const selected = coldMainNumbers
      .sort(() => Math.random() - 0.5)
      .slice(0, mainCount)
      .sort((a, b) => a - b);
    mainNumbers.push(...selected);
  } else {
    mainNumbers.push(...coldMainNumbers);

    // 如果号码不够，使用优化的随机算法补全
    if (mainNumbers.length < mainCount) {
      const remaining = mainCount - mainNumbers.length;
      const availableNumbers = [];
      for (let i = config.mainRange[0]; i <= config.mainRange[1]; i++) {
        if (!mainNumbers.includes(i)) {
          availableNumbers.push(i);
        }
      }

      // Fisher-Yates 洗牌算法
      for (let i = availableNumbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableNumbers[i], availableNumbers[j]] = [
          availableNumbers[j],
          availableNumbers[i],
        ];
      }

      mainNumbers.push(...availableNumbers.slice(0, remaining));
    }
    mainNumbers.sort((a, b) => a - b);
  }

  if (config.specialRange && config.specialCount) {
    const specialCount =
      specialTargetCount ||
      (Array.isArray(config.specialCount)
        ? config.specialCount[0]
        : config.specialCount);
    const coldSpecialNumbers = getColdNumbers(
      statistics!,
      specialCount * 2,
      true,
      config
    );
    if (coldSpecialNumbers.length >= specialCount) {
      const selected = coldSpecialNumbers
        .sort(() => Math.random() - 0.5)
        .slice(0, specialCount)
        .sort((a, b) => a - b);
      specialNumbers.push(...selected);
    } else {
      specialNumbers.push(...coldSpecialNumbers);

      // 如果号码不够，使用优化的随机算法补全
      if (specialNumbers.length < specialCount) {
        const remaining = specialCount - specialNumbers.length;
        const availableNumbers = [];
        for (let i = config.specialRange[0]; i <= config.specialRange[1]; i++) {
          if (!specialNumbers.includes(i)) {
            availableNumbers.push(i);
          }
        }

        // Fisher-Yates 洗牌算法
        for (let i = availableNumbers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [availableNumbers[i], availableNumbers[j]] = [
            availableNumbers[j],
            availableNumbers[i],
          ];
        }

        specialNumbers.push(...availableNumbers.slice(0, remaining));
      }
      specialNumbers.sort((a, b) => a - b);
    }
  }
};

const balancedAlgorithm = (
  mainNumbers: number[],
  specialNumbers: number[],
  statistics: LotteryStatistics,
  config: LotteryConfig,
  targetCount?: number,
  specialTargetCount?: number
) => {
  const mainCount =
    targetCount ||
    (Array.isArray(config.mainCount) ? config.mainCount[0] : config.mainCount);
  const hotMain = getHighFrequencyNumbers(
    statistics!,
    Math.ceil(mainCount / 2),
    false,
    config
  );
  const coldMain = getColdNumbers(
    statistics!,
    Math.ceil(mainCount / 2),
    false,
    config
  );
  const allMain = [...new Set([...hotMain, ...coldMain])];

  if (allMain.length >= mainCount) {
    const selected = allMain
      .sort(() => Math.random() - 0.5)
      .slice(0, mainCount)
      .sort((a, b) => a - b);
    mainNumbers.push(...selected);
  } else {
    mainNumbers.push(...allMain);

    // 如果号码不够，使用优化的随机算法补全
    if (mainNumbers.length < mainCount) {
      const remaining = mainCount - mainNumbers.length;
      const availableNumbers = [];
      for (let i = config.mainRange[0]; i <= config.mainRange[1]; i++) {
        if (!mainNumbers.includes(i)) {
          availableNumbers.push(i);
        }
      }

      // Fisher-Yates 洗牌算法
      for (let i = availableNumbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableNumbers[i], availableNumbers[j]] = [
          availableNumbers[j],
          availableNumbers[i],
        ];
      }

      mainNumbers.push(...availableNumbers.slice(0, remaining));
    }
    mainNumbers.sort((a, b) => a - b);
  }

  if (config.specialRange && config.specialCount) {
    const specialCount =
      specialTargetCount ||
      (Array.isArray(config.specialCount)
        ? config.specialCount[0]
        : config.specialCount);

    const hotSpecial = getHighFrequencyNumbers(
      statistics!,
      Math.ceil(specialCount / 2),
      true,
      config
    );
    const coldSpecial = getColdNumbers(
      statistics!,
      Math.ceil(specialCount / 2),
      true,
      config
    );
    const allSpecial = [...new Set([...hotSpecial, ...coldSpecial])];

    if (allSpecial.length >= specialCount) {
      const selected = allSpecial
        .sort(() => Math.random() - 0.5)
        .slice(0, specialCount)
        .sort((a, b) => a - b);
      specialNumbers.push(...selected);
    } else {
      specialNumbers.push(...allSpecial);

      // 如果号码不够，使用优化的随机算法补全
      if (specialNumbers.length < specialCount) {
        const remaining = specialCount - specialNumbers.length;
        const availableNumbers = [];
        for (let i = config.specialRange[0]; i <= config.specialRange[1]; i++) {
          if (!specialNumbers.includes(i)) {
            availableNumbers.push(i);
          }
        }

        // Fisher-Yates 洗牌算法
        for (let i = availableNumbers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [availableNumbers[i], availableNumbers[j]] = [
            availableNumbers[j],
            availableNumbers[i],
          ];
        }

        specialNumbers.push(...availableNumbers.slice(0, remaining));
      }
      specialNumbers.sort((a, b) => a - b);
    }
  }
};

const randomAlgorithm = (
  mainNumbers: number[],
  specialNumbers: number[],
  config: LotteryConfig,
  targetCount?: number,
  specialTargetCount?: number
) => {
  // 完全随机算法 - 优化版本，避免重复检查的性能问题
  // 对于快乐8，targetCount应该是用户选择的玩法数量（1-10）
  const mainCount =
    targetCount ||
    (Array.isArray(config.mainCount) ? config.mainCount[0] : config.mainCount);

  // 创建号码池并随机选择，避免重复检查
  const availableMainNumbers = [];
  for (let i = config.mainRange[0]; i <= config.mainRange[1]; i++) {
    availableMainNumbers.push(i);
  }

  // Fisher-Yates 洗牌算法
  for (let i = availableMainNumbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableMainNumbers[i], availableMainNumbers[j]] = [
      availableMainNumbers[j],
      availableMainNumbers[i],
    ];
  }

  // 直接从已打乱的数组中取所需数量的号码
  mainNumbers.push(...availableMainNumbers.slice(0, mainCount));
  mainNumbers.sort((a, b) => a - b);

  if (config.specialRange && config.specialCount) {
    const specialCount =
      specialTargetCount ||
      (Array.isArray(config.specialCount)
        ? config.specialCount[0]
        : config.specialCount);
    // 为特殊号码创建号码池
    const availableSpecialNumbers = [];
    for (let i = config.specialRange[0]; i <= config.specialRange[1]; i++) {
      availableSpecialNumbers.push(i);
    }

    // Fisher-Yates 洗牌算法
    for (let i = availableSpecialNumbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableSpecialNumbers[i], availableSpecialNumbers[j]] = [
        availableSpecialNumbers[j],
        availableSpecialNumbers[i],
      ];
    }

    // 直接从已打乱的数组中取所需数量的号码
    specialNumbers.push(...availableSpecialNumbers.slice(0, specialCount));
    specialNumbers.sort((a, b) => a - b);
  }
};

export const selectNumberByAlgorithm = ({
  algorithm,
  statistics,
  config,
  kl8NumberCount,
  mainTargetCount,
  specialTargetCount,
}: {
  algorithm: AlgorithmType;
  statistics: LotteryStatistics | null;
  config: LotteryConfig;
  kl8NumberCount?: number;
  mainTargetCount?: number;
  specialTargetCount?: number;
}): AlgorithmResult => {
  const mainNumbers: number[] = [];
  const specialNumbers: number[] = [];

  if (statistics == null) {
    randomAlgorithm(
      mainNumbers,
      specialNumbers,
      config,
      kl8NumberCount || mainTargetCount,
      specialTargetCount
    );
    return {
      mainNumbers,
      specialNumbers,
    };
  }

  switch (algorithm) {
    case "frequency":
      // 高频算法：优先选择近期出现次数多的号码
      highFrequencyAlgorithm(
        mainNumbers,
        specialNumbers,
        statistics,
        config,
        kl8NumberCount || mainTargetCount,
        specialTargetCount
      );
      break;
    case "omission":
      // 冷门算法：优先选择长期未出现的号码
      lowFrequencyAlgorithm(
        mainNumbers,
        specialNumbers,
        statistics,
        config,
        kl8NumberCount || mainTargetCount,
        specialTargetCount
      );
      break;
    case "balanced":
      // 均衡算法：混合高频和低频号码
      balancedAlgorithm(
        mainNumbers,
        specialNumbers,
        statistics,
        config,
        kl8NumberCount || mainTargetCount,
        specialTargetCount
      );
      break;
    case "random":
      // 随机算法：完全随机选择号码
      randomAlgorithm(
        mainNumbers,
        specialNumbers,
        config,
        kl8NumberCount || mainTargetCount,
        specialTargetCount
      );
      break;
    default:
      balancedAlgorithm(
        mainNumbers,
        specialNumbers,
        statistics,
        config,
        kl8NumberCount || mainTargetCount,
        specialTargetCount
      );
      break;
  }

  return {
    mainNumbers,
    specialNumbers,
  };
};

export const getAlgorithmName = (algorithm: AlgorithmType): string => {
  const names = {
    random: "随机选取",
    frequency: "高频优先",
    omission: "遗漏优先",
    balanced: "均衡选取",
  };
  return names[algorithm];
};
