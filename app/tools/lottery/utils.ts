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

export const colorByFreq = (p: number) => {
  if (p > 0.9)
    return {
      bg: "rgba(239, 68, 68, 0.85)",
      border: "rgba(185, 28, 28, 0.9)",
      hover: "rgba(239, 68, 68, 1)",
    }; // red
  if (p > 0.8)
    return {
      bg: "rgba(249, 115, 22, 0.8)",
      border: "rgba(234, 88, 12, 0.8)",
      hover: "rgba(249, 115, 22, 1)",
    }; // orange
  if (p > 0.7)
    return {
      bg: "rgba(251, 146, 60, 0.75)",
      border: "rgba(217, 119, 6, 0.8)",
      hover: "rgba(251, 146, 60, 1)",
    }; // amber
  if (p > 0.6)
    return {
      bg: "rgba(190, 242, 100, 0.55)",
      border: "rgba(132, 204, 22, 0.7)",
      hover: "rgba(190, 242, 100, 0.9)",
    }; // yellow-green
  if (p > 0.5)
    return {
      bg: "rgba(34, 197, 94, 0.45)",
      border: "rgba(21, 128, 61, 0.7)",
      hover: "rgba(34, 197, 94, 0.8)",
    }; // green
  if (p > 0.4)
    return {
      bg: "rgba(45, 212, 191, 0.4)",
      border: "rgba(20, 184, 166, 0.6)",
      hover: "rgba(45, 212, 191, 0.7)",
    }; // teal
  if (p > 0.3)
    return {
      bg: "rgba(59, 130, 246, 0.35)",
      border: "rgba(37, 99, 235, 0.5)",
      hover: "rgba(59, 130, 246, 0.6)",
    }; // blue
  if (p > 0.2)
    return {
      bg: "rgba(79, 70, 229, 0.3)",
      border: "rgba(67, 56, 202, 0.5)",
      hover: "rgba(79, 70, 229, 0.6)",
    }; // indigo
  return {
    bg: "rgba(37, 99, 235, 0.25)",
    border: "rgba(29, 78, 216, 0.5)",
    hover: "rgba(37, 99, 235, 0.5)",
  }; // deep blue
};

export const getFrequencyColor = (num: number, statistics: any) => {
  if (!statistics) {
    return {
      bg: "rgba(107, 114, 128, 0.1)",
      border: "rgba(107, 114, 128, 0.3)",
      hover: "rgba(107, 114, 128, 0.15)",
    };
  }

  const frequency = statistics.frequency[num] || 0;
  const allFrequencies = Object.values(statistics.frequency).filter(
    (f: any) => f > 0
  ) as number[];

  if (allFrequencies.length === 0) {
    return {
      bg: "rgba(107, 114, 128, 0.1)",
      border: "rgba(107, 114, 128, 0.3)",
      hover: "rgba(107, 114, 128, 0.15)",
    };
  }

  const maxFreq = Math.max(...allFrequencies);
  const minFreq = Math.min(...allFrequencies);
  const range = maxFreq - minFreq;

  if (range === 0) {
    return {
      bg: "rgba(161, 98, 7, 0.12)",
      border: "rgba(245, 158, 11, 0.4)",
      hover: "rgba(161, 98, 7, 0.2)",
    };
  }

  const percentage = (frequency - minFreq) / range;

  return colorByFreq(percentage);
};
