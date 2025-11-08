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
  config: LotteryConfig
) => {
  // 高频算法：优先选择高频号码
  const hotMainNumbers = getHighFrequencyNumbers(
    statistics!,
    config.mainCount * 2,
    false,
    config
  );
  if (hotMainNumbers.length >= config.mainCount) {
    const selected = hotMainNumbers
      .sort(() => Math.random() - 0.5)
      .slice(0, config.mainCount)
      .sort((a, b) => a - b);
    mainNumbers.push(...selected);
  } else {
    mainNumbers.push(...hotMainNumbers);
    while (mainNumbers.length < config.mainCount) {
      const num =
        Math.floor(
          Math.random() * (config.mainRange[1] - config.mainRange[0] + 1)
        ) + config.mainRange[0];
      if (!mainNumbers.includes(num)) {
        mainNumbers.push(num);
      }
    }
    mainNumbers.sort((a, b) => a - b);
  }

  if (config.specialRange && config.specialCount) {
    const hotSpecialNumbers = getHighFrequencyNumbers(
      statistics!,
      config.specialCount * 2,
      true,
      config
    );
    if (hotSpecialNumbers.length >= config.specialCount) {
      const selected = hotSpecialNumbers
        .sort(() => Math.random() - 0.5)
        .slice(0, config.specialCount)
        .sort((a, b) => a - b);
      specialNumbers.push(...selected);
    } else {
      specialNumbers.push(...hotSpecialNumbers);
      while (specialNumbers.length < config.specialCount) {
        const num =
          Math.floor(
            Math.random() *
              (config.specialRange[1] - config.specialRange[0] + 1)
          ) + config.specialRange[0];
        if (!specialNumbers.includes(num)) {
          specialNumbers.push(num);
        }
      }
      specialNumbers.sort((a, b) => a - b);
    }
  }
};

const lowFrequencyAlgorithm = (
  mainNumbers: number[],
  specialNumbers: number[],
  statistics: LotteryStatistics,
  config: LotteryConfig
) => {
  const coldMainNumbers = getColdNumbers(
    statistics!,
    config.mainCount * 2,
    false,
    config
  );
  if (coldMainNumbers.length >= config.mainCount) {
    const selected = coldMainNumbers
      .sort(() => Math.random() - 0.5)
      .slice(0, config.mainCount)
      .sort((a, b) => a - b);
    mainNumbers.push(...selected);
  } else {
    mainNumbers.push(...coldMainNumbers);
    while (mainNumbers.length < config.mainCount) {
      const num =
        Math.floor(
          Math.random() * (config.mainRange[1] - config.mainRange[0] + 1)
        ) + config.mainRange[0];
      if (!mainNumbers.includes(num)) {
        mainNumbers.push(num);
      }
    }
    mainNumbers.sort((a, b) => a - b);
  }

  if (config.specialRange && config.specialCount) {
    const coldSpecialNumbers = getColdNumbers(
      statistics!,
      config.specialCount * 2,
      true,
      config
    );
    if (coldSpecialNumbers.length >= config.specialCount) {
      const selected = coldSpecialNumbers
        .sort(() => Math.random() - 0.5)
        .slice(0, config.specialCount)
        .sort((a, b) => a - b);
      specialNumbers.push(...selected);
    } else {
      specialNumbers.push(...coldSpecialNumbers);
      while (specialNumbers.length < config.specialCount) {
        const num =
          Math.floor(
            Math.random() *
              (config.specialRange[1] - config.specialRange[0] + 1)
          ) + config.specialRange[0];
        if (!specialNumbers.includes(num)) {
          specialNumbers.push(num);
        }
      }
      specialNumbers.sort((a, b) => a - b);
    }
  }
};

const balancedAlgorithm = (
  mainNumbers: number[],
  specialNumbers: number[],
  statistics: LotteryStatistics,
  config: LotteryConfig
) => {
  const hotMain = getHighFrequencyNumbers(
    statistics!,
    Math.ceil(config.mainCount / 2),
    false,
    config
  );
  const coldMain = getColdNumbers(
    statistics!,
    Math.ceil(config.mainCount / 2),
    false,
    config
  );
  const allMain = [...new Set([...hotMain, ...coldMain])];

  if (allMain.length >= config.mainCount) {
    const selected = allMain
      .sort(() => Math.random() - 0.5)
      .slice(0, config.mainCount)
      .sort((a, b) => a - b);
    mainNumbers.push(...selected);
  } else {
    mainNumbers.push(...allMain);
    while (mainNumbers.length < config.mainCount) {
      const num =
        Math.floor(
          Math.random() * (config.mainRange[1] - config.mainRange[0] + 1)
        ) + config.mainRange[0];
      if (!mainNumbers.includes(num)) {
        mainNumbers.push(num);
      }
    }
    mainNumbers.sort((a, b) => a - b);
  }

  if (config.specialRange && config.specialCount) {
    const hotSpecial = getHighFrequencyNumbers(
      statistics!,
      Math.ceil(config.specialCount / 2),
      true,
      config
    );
    const coldSpecial = getColdNumbers(
      statistics!,
      Math.ceil(config.specialCount / 2),
      true,
      config
    );
    const allSpecial = [...new Set([...hotSpecial, ...coldSpecial])];

    if (allSpecial.length >= config.specialCount) {
      const selected = allSpecial
        .sort(() => Math.random() - 0.5)
        .slice(0, config.specialCount)
        .sort((a, b) => a - b);
      specialNumbers.push(...selected);
    } else {
      specialNumbers.push(...allSpecial);
      while (specialNumbers.length < config.specialCount) {
        const num =
          Math.floor(
            Math.random() *
              (config.specialRange[1] - config.specialRange[0] + 1)
          ) + config.specialRange[0];
        if (!specialNumbers.includes(num)) {
          specialNumbers.push(num);
        }
      }
      specialNumbers.sort((a, b) => a - b);
    }
  }
};

const randomAlgorithm = (
  mainNumbers: number[],
  specialNumbers: number[],
  config: LotteryConfig
) => {
  // 完全随机算法
  while (mainNumbers.length < config.mainCount) {
    const num =
      Math.floor(
        Math.random() * (config.mainRange[1] - config.mainRange[0] + 1)
      ) + config.mainRange[0];
    if (!mainNumbers.includes(num)) {
      mainNumbers.push(num);
    }
  }
  mainNumbers.sort((a, b) => a - b);

  if (config.specialRange && config.specialCount) {
    while (specialNumbers.length < config.specialCount) {
      const num =
        Math.floor(
          Math.random() * (config.specialRange[1] - config.specialRange[0] + 1)
        ) + config.specialRange[0];
      if (!specialNumbers.includes(num)) {
        specialNumbers.push(num);
      }
    }
    specialNumbers.sort((a, b) => a - b);
  }
};

export const selectNumberByAlgorithm = ({
  algorithm,
  statistics,
  config,
}: {
  algorithm: AlgorithmType;
  statistics: LotteryStatistics | null;
  config: LotteryConfig;
}): AlgorithmResult => {
  const mainNumbers: number[] = [];
  const specialNumbers: number[] = [];

  if (statistics == null) {
    randomAlgorithm(mainNumbers, specialNumbers, config);
    return {
      mainNumbers,
      specialNumbers,
    };
  }

  switch (algorithm) {
    case "frequency":
      // 高频算法：优先选择近期出现次数多的号码
      highFrequencyAlgorithm(mainNumbers, specialNumbers, statistics, config);
      break;
    case "omission":
      // 冷门算法：优先选择长期未出现的号码
      lowFrequencyAlgorithm(mainNumbers, specialNumbers, statistics, config);
      break;
    case "balanced":
      // 均衡算法：混合高频和低频号码
      balancedAlgorithm(mainNumbers, specialNumbers, statistics, config);
      break;
    case "random":
      // 随机算法：完全随机选择号码
      randomAlgorithm(mainNumbers, specialNumbers, config);
    default:
      balancedAlgorithm(mainNumbers, specialNumbers, statistics, config);
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
