/* eslint-disable @typescript-eslint/no-explicit-any */
import { LotteryStatistics, AlgorithmType } from "./types";
import { LotteryType } from "./constants";

// 获取算法的中文名称
export const getAlgorithmName = (algorithm: AlgorithmType): string => {
  const names = {
    random: "随机",
    frequency: "高频",
    omission: "冷门",
    balanced: "均衡",
  };
  return names[algorithm];
};

// 分析历史数据统计
export const analyzeStatistics = (
  historyData: any[],
  selectedType: LotteryType,
  config: any
): LotteryStatistics => {
  const frequency: { [key: number]: number } = {};
  const omission: { [key: number]: number } = {};

  // 初始化统计对象
  const maxMain = config.mainRange[1];
  const maxSpecial = config.specialRange?.[1] || 0;

  for (let i = config.mainRange[0]; i <= maxMain; i++) {
    frequency[i] = 0;
    omission[i] = 0;
  }
  for (let i = 1; i <= maxSpecial; i++) {
    frequency[i] = 0;
    omission[i] = 0;
  }

  // 计算频次和遗漏
  const reversedHistory = [...historyData].reverse();

  reversedHistory.forEach((draw, drawIndex) => {
    // 主号码统计
    const mainNumbers =
      selectedType === "ssq"
        ? draw.redBalls.map((n: string) => parseInt(n))
        : draw.numbers.map((n: number) => parseInt(n.toString()));

    mainNumbers.forEach((num: number) => {
      if (!frequency[num]) frequency[num] = 0;
      frequency[num]++;
      if (omission[num] === 0) omission[num] = drawIndex;
    });

    // 特殊号码统计
    if (selectedType === "ssq") {
      const blueBall = parseInt(draw.blueBall);
      if (!frequency[blueBall]) frequency[blueBall] = 0;
      frequency[blueBall]++;
      if (omission[blueBall] === 0) omission[blueBall] = drawIndex;
    } else {
      draw.specialNumbers.forEach((num: number) => {
        const numInt = parseInt(num.toString());
        if (!frequency[numInt]) frequency[numInt] = 0;
        frequency[numInt]++;
        if (omission[numInt] === 0) omission[numInt] = drawIndex;
      });
    }
  });

  // 更新遗漏值（未出现的就是当前遗漏）
  const totalDraws = reversedHistory.length;
  for (let i = config.mainRange[0]; i <= maxMain; i++) {
    if (omission[i] === 0) omission[i] = totalDraws;
  }
  for (let i = 1; i <= maxSpecial; i++) {
    if (omission[i] === 0) omission[i] = totalDraws;
  }

  return { frequency, omission };
};

// 获取高频号码
export const getHighFrequencyNumbers = (
  statistics: LotteryStatistics,
  count: number,
  isSpecial: boolean = false,
  config: any
): number[] => {
  const maxNum = isSpecial
    ? config.specialRange?.[1] || 12
    : config.mainRange[1];

  const minNum = isSpecial ? 1 : config.mainRange[0];

  const numbers = [];
  for (let i = minNum; i <= maxNum; i++) {
    numbers.push({ num: i, freq: statistics.frequency[i] });
  }

  return numbers
    .sort((a, b) => b.freq - a.freq)
    .slice(0, count)
    .map((item) => item.num);
};

// 获取冷门号码（遗漏最多的）
export const getColdNumbers = (
  statistics: LotteryStatistics,
  count: number,
  isSpecial: boolean = false,
  config: any
): number[] => {
  const maxNum = isSpecial
    ? config.specialRange?.[1] || 12
    : config.mainRange[1];

  const minNum = isSpecial ? 1 : config.mainRange[0];

  const numbers = [];
  for (let i = minNum; i <= maxNum; i++) {
    numbers.push({ num: i, omission: statistics.omission[i] });
  }

  return numbers
    .sort((a, b) => b.omission - a.omission)
    .slice(0, count)
    .map((item) => item.num);
};

// 保存到本地存储
export const saveToLocalStorage = (
  records: any[],
  storageKey: string
): void => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(records));
  } catch (error) {
    console.error("保存历史记录失败:", error);
  }
};

// 从本地存储加载
export const loadFromLocalStorage = (storageKey: string): any[] => {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("加载历史记录失败:", error);
  }
  return [];
};

// 清空本地存储
export const clearLocalStorage = (storageKey: string): void => {
  localStorage.removeItem(storageKey);
};

// 验证文件类型
export const validateFile = (file: File): string | null => {
  if (!file.type.startsWith("image/")) {
    return "请上传图片文件";
  }

  if (file.size > 10 * 1024 * 1024) {
    return "图片大小不能超过10MB";
  }

  return null;
};
