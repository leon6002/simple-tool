/* eslint-disable @typescript-eslint/no-explicit-any */
import { LotteryStatistics } from "./types";
import { LotteryType } from "./constants";

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
    let mainNumbers: number[] = [];

    if (selectedType === "ssq") {
      // 双色球：redBalls是字符串数组
      if (draw.redBalls && Array.isArray(draw.redBalls)) {
        mainNumbers = draw.redBalls.map((n: string) => parseInt(n));
      }
    } else if (selectedType === "dlt") {
      // 大乐透：numbers是字符串数组
      if (draw.numbers && Array.isArray(draw.numbers)) {
        mainNumbers = draw.numbers.map((n: string) => parseInt(n));
      }
    } else if (selectedType === "kl8") {
      // 快乐8：numbers是字符串数组
      if (draw.numbers && Array.isArray(draw.numbers)) {
        mainNumbers = draw.numbers.map((n: string) => parseInt(n));
      }
    }

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
    } else if (selectedType === "dlt") {
      // 大乐透有特殊号码
      if (draw.specialNumbers && Array.isArray(draw.specialNumbers)) {
        draw.specialNumbers.forEach((num: string) => {
          const numInt = parseInt(num);
          if (!frequency[numInt]) frequency[numInt] = 0;
          frequency[numInt]++;
          if (omission[numInt] === 0) omission[numInt] = drawIndex;
        });
      }
    }
    // 快乐8 (kl8) 没有特殊号码，跳过特殊号码统计
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

// 根据频次排序号码数组
export const sortNumbersByFrequency = (
  numbers: number[],
  statistics: LotteryStatistics | null,
  ascending: boolean = false
): number[] => {
  if (!statistics || !statistics.frequency) {
    return numbers;
  }

  return numbers.sort((a, b) => {
    const freqA = statistics.frequency[a] || 0;
    const freqB = statistics.frequency[b] || 0;

    if (ascending) {
      return freqA - freqB; // 从低频到高频
    } else {
      return freqB - freqA; // 从高频到低频
    }
  });
};

// 中奖记录类型定义
export interface PrizeRecord {
  issue: string;
  drawDate: string;
  prize: string;
  prizeAmount: number;
  matches: {
    main: number;
    special: number;
  };
  drawNumbers: {
    main: number[];
    special: number[];
  };
  prizeBreakdown?: {
    level: string;
    count: number;
    amount: number;
  }[];
}

// 中奖统计类型定义
export interface PrizeStatistics {
  totalDraws: number; // 总开奖期数
  winningDraws: number; // 中奖期数
  winningRate: number; // 中奖率
  totalPrizeAmount: number; // 总奖金
  maxPrizeAmount: number; // 单期最高奖金
  maxPrizeIssue: string; // 最高奖金期号
  averagePrizeAmount: number; // 平均中奖金额
  records: PrizeRecord[]; // 详细中奖记录
}

// 计算组合数 C(n, k)
export const combination = (n: number, k: number): number => {
  if (k > n || k < 0) return 0;
  if (k === 0 || k === n) return 1;
  if (k > n / 2) k = n - k;

  let result = 1;
  for (let i = 1; i <= k; i++) {
    result = (result * (n - k + i)) / i;
  }
  return Math.floor(result);
};

// 使用数学公式计算KL8复式投注中奖情况
export const calculateKL8ComplexPrizes = (
  userNumbers: number[],
  drawNumbers: number[],
  gameType: number
): { prize: string; prizeAmount: number; betCount: number }[] => {
  const results: { prize: string; prizeAmount: number; betCount: number }[] =
    [];
  const userCount = userNumbers.length;

  // 如果用户选择的号码数量等于玩法数量，就是单式投注
  if (userCount === gameType) {
    const matches = userNumbers.filter((num) =>
      drawNumbers.includes(num)
    ).length;
    const prizeResult = calculateKL8PrizeForDraw(gameType, matches);
    if (prizeResult.prizeAmount > 0) {
      results.push({ ...prizeResult, betCount: 1 });
    }
    return results;
  }

  if (userCount < gameType) {
    return results;
  }

  // 复式投注：使用组合数学计算
  const hitCount = userNumbers.filter((num) =>
    drawNumbers.includes(num)
  ).length; // 命中的号码数
  const missCount = userCount - hitCount; // 未命中的号码数

  // 对于选十玩法，使用正确的组合计算逻辑
  if (gameType === 10) {
    // 单式投注：用户选择的号码数等于玩法数
    if (userCount === gameType) {
      const actualMatches = hitCount;
      const prizeResult = calculateKL8PrizeForDraw(gameType, actualMatches);
      if (prizeResult.prizeAmount > 0) {
        results.push({
          prize: prizeResult.prize,
          prizeAmount: prizeResult.prizeAmount,
          betCount: 1,
        });
      }
    } else {
      // 复式投注：用户选择的号码数大于玩法数，需要计算所有可能的组合

      // 统计各中奖等级的注数
      let hit10 = 0,
        hit9 = 0,
        hit8 = 0,
        hit7 = 0,
        hit6 = 0,
        hit5 = 0,
        hit4 = 0,
        hit0 = 0;

      // 生成所有C(userCount, gameType)个组合并统计命中情况
      const stack: number[] = [];

      function dfs(start: number, depth: number) {
        if (depth === gameType) {
          // 当前组合在userNumbers中的索引为stack[]
          const currentCombination = stack.map((i) => userNumbers[i]);
          const matches = currentCombination.filter((num) =>
            drawNumbers.includes(num)
          ).length;

          // 统计命中情况
          if (matches === 10) hit10++;
          else if (matches === 9) hit9++;
          else if (matches === 8) hit8++;
          else if (matches === 7) hit7++;
          else if (matches === 6) hit6++;
          else if (matches === 5) hit5++;
          else if (matches === 4) hit4++;
          else if (matches === 0) hit0++;
          return;
        }

        for (let i = start; i <= userCount - (gameType - depth); i++) {
          stack.push(i);
          dfs(i + 1, depth + 1);
          stack.pop();
        }
      }

      dfs(0, 0);

      // 添加调试信息
      console.log(
        `复式投注结果: hit10=${hit10}, hit9=${hit9}, hit8=${hit8}, hit7=${hit7}, hit6=${hit6}, hit5=${hit5}, hit4=${hit4}, hit0=${hit0}`
      );

      // 添加中奖结果
      if (hit10 > 0) {
        const prizeResult = calculateKL8PrizeForDraw(gameType, 10);
        results.push({
          prize: prizeResult.prize,
          prizeAmount: prizeResult.prizeAmount,
          betCount: hit10,
        });
      }

      if (hit9 > 0) {
        const prizeResult = calculateKL8PrizeForDraw(gameType, 9);
        results.push({
          prize: prizeResult.prize,
          prizeAmount: prizeResult.prizeAmount,
          betCount: hit9,
        });
      }

      if (hit8 > 0) {
        const prizeResult = calculateKL8PrizeForDraw(gameType, 8);
        results.push({
          prize: prizeResult.prize,
          prizeAmount: prizeResult.prizeAmount,
          betCount: hit8,
        });
      }

      if (hit7 > 0) {
        const prizeResult = calculateKL8PrizeForDraw(gameType, 7);
        results.push({
          prize: prizeResult.prize,
          prizeAmount: prizeResult.prizeAmount,
          betCount: hit7,
        });
      }

      if (hit6 > 0) {
        const prizeResult = calculateKL8PrizeForDraw(gameType, 6);
        results.push({
          prize: prizeResult.prize,
          prizeAmount: prizeResult.prizeAmount,
          betCount: hit6,
        });
      }

      if (hit5 > 0) {
        const prizeResult = calculateKL8PrizeForDraw(gameType, 5);
        results.push({
          prize: prizeResult.prize,
          prizeAmount: prizeResult.prizeAmount,
          betCount: hit5,
        });
      }

      if (hit4 > 0) {
        const prizeResult = calculateKL8PrizeForDraw(gameType, 4);
        results.push({
          prize: prizeResult.prize,
          prizeAmount: prizeResult.prizeAmount,
          betCount: hit4,
        });
      }

      if (hit0 > 0) {
        const prizeResult = calculateKL8PrizeForDraw(gameType, 0);
        results.push({
          prize: prizeResult.prize,
          prizeAmount: prizeResult.prizeAmount,
          betCount: hit0,
        });
      }
    }
  } else {
    // 其他玩法的计算（通用公式）
    for (let k = 0; k <= gameType; k++) {
      for (
        let i = Math.max(0, k - missCount);
        i <= Math.min(k, hitCount);
        i++
      ) {
        const hitCombinations = combination(hitCount, i);
        const missCombinations = combination(missCount, k - i);
        const totalCombinations = hitCombinations * missCombinations;

        if (totalCombinations > 0) {
          const prizeResult = calculateKL8PrizeForDraw(gameType, k);
          if (prizeResult.prizeAmount > 0) {
            results.push({
              prize: prizeResult.prize,
              prizeAmount: prizeResult.prizeAmount,
              betCount: totalCombinations,
            });
          }
        }
      }
    }
  }

  // 过滤掉betCount为0的结果并按奖金金额排序
  const filteredResults = results.filter((r) => r.betCount > 0);
  const sortedResults = filteredResults.sort((a, b) => {
    // 按奖金金额降序排列，奖金相同按命中数降序
    if (b.prizeAmount !== a.prizeAmount) {
      return b.prizeAmount - a.prizeAmount;
    }
    const aMatches = parseInt(a.prize.match(/\d+/)?.[0] || "0");
    const bMatches = parseInt(b.prize.match(/\d+/)?.[0] || "0");
    return bMatches - aMatches;
  });

  return sortedResults;
};

// 计算当前选号在往期开奖中的中奖情况
export const calculateHistoricalPrizes = (
  mainNumbers: number[],
  specialNumbers: number[],
  historyData: any[],
  selectedType: string,
  kl8GameType?: number // KL8玩法类型
): PrizeStatistics => {
  const records: PrizeRecord[] = [];
  let totalPrizeAmount = 0;
  let maxPrizeAmount = 0;
  let maxPrizeIssue = "";

  // 按时间倒序处理历史数据，并限制为最近100条
  const recentHistoryData = historyData
    .slice()
    .reverse() // 倒序，最新的在前
    .slice(0, 100); // 只取最近100条

  recentHistoryData.forEach((draw) => {
    let drawMainNumbers: number[] = [];
    let drawSpecialNumbers: number[] = [];

    if (selectedType === "kl8") {
      // 福彩8：数据结构为 { issue, numbers: string[] }，需要转换为数字
      drawMainNumbers = (draw.numbers || [])
        .map((num: string) => parseInt(num, 10))
        .filter((num: number) => !isNaN(num));
      drawSpecialNumbers = []; // 福彩8没有特殊号码

      // 对于KL8，使用复式计算
      if (kl8GameType && mainNumbers.length > 0) {
        const complexResults = calculateKL8ComplexPrizes(
          mainNumbers,
          drawMainNumbers,
          kl8GameType
        );

        if (complexResults.length > 0) {
          // 计算总奖金
          let totalDrawPrize = 0;
          complexResults.forEach((result) => {
            totalDrawPrize += result.prizeAmount * result.betCount;
          });

          // 创建中奖记录（使用最高奖金奖项）
          const highestPrize = complexResults.reduce((prev, current) =>
            current.prizeAmount > prev.prizeAmount ? current : prev
          );

          // 生成详细中奖情况
          const prizeBreakdown = complexResults.map((result) => ({
            level: result.prize,
            count: result.betCount,
            amount: result.prizeAmount * result.betCount,
          }));

          const record: PrizeRecord = {
            issue: draw.issue || draw.period || "",
            drawDate: draw.date || draw.drawDate || "",
            prize: `${highestPrize.prize} 等${complexResults.length}项`,
            prizeAmount: totalDrawPrize,
            matches: {
              main: mainNumbers.filter((num) => drawMainNumbers.includes(num))
                .length,
              special: 0,
            },
            drawNumbers: {
              main: drawMainNumbers,
              special: [],
            },
            prizeBreakdown,
          };
          records.push(record);
          totalPrizeAmount += totalDrawPrize;

          if (totalDrawPrize > maxPrizeAmount) {
            maxPrizeAmount = totalDrawPrize;
            maxPrizeIssue = record.issue;
          }
        }
      }
    } else {
      // 大乐透和双色球
      drawMainNumbers = draw.numbers || draw.redBalls || draw.mainNumbers || [];
      drawSpecialNumbers = draw.specialNumbers || draw.blueBalls || [];

      // 计算匹配数量（非KL8玩法）
      const mainMatches = mainNumbers.filter((num) =>
        drawMainNumbers.includes(num)
      ).length;
      const specialMatches = specialNumbers.filter((num) =>
        drawSpecialNumbers.includes(num)
      ).length;

      // 计算奖金
      const { prize, prizeAmount } = calculatePrizeForDraw(
        selectedType,
        mainMatches,
        specialMatches,
        kl8GameType
      );

      if (prizeAmount > 0) {
        const record: PrizeRecord = {
          issue: draw.issue || draw.period || "",
          drawDate: draw.date || draw.drawDate || "",
          prize,
          prizeAmount,
          matches: {
            main: mainMatches,
            special: specialMatches,
          },
          drawNumbers: {
            main: drawMainNumbers,
            special: drawSpecialNumbers,
          },
        };
        records.push(record);
        totalPrizeAmount += prizeAmount;

        if (prizeAmount > maxPrizeAmount) {
          maxPrizeAmount = prizeAmount;
          maxPrizeIssue = record.issue;
        }
      }
    }
  });

  const totalDraws = recentHistoryData.length; // 使用分析的数据长度，而不是全部历史数据
  const winningDraws = records.length;
  const winningRate = totalDraws > 0 ? (winningDraws / totalDraws) * 100 : 0;
  const averagePrizeAmount =
    winningDraws > 0 ? totalPrizeAmount / winningDraws : 0;

  return {
    totalDraws,
    winningDraws,
    winningRate,
    totalPrizeAmount,
    maxPrizeAmount,
    maxPrizeIssue,
    averagePrizeAmount,
    records,
  };
};

// 计算单期奖金
export const calculatePrizeForDraw = (
  selectedType: string,
  mainMatches: number,
  specialMatches: number,
  kl8GameType: number = 10 // KL8玩法类型，默认选十
): { prize: string; prizeAmount: number } => {
  if (selectedType === "dlt") {
    // 大乐透奖金计算
    if (mainMatches === 5 && specialMatches === 2) {
      return { prize: "一等奖", prizeAmount: 0 }; // 浮动奖金
    } else if (mainMatches === 5 && specialMatches === 1) {
      return { prize: "二等奖", prizeAmount: 0 }; // 浮动奖金
    } else if (mainMatches === 5 && specialMatches === 0) {
      return { prize: "三等奖", prizeAmount: 10000 };
    } else if (mainMatches === 4 && specialMatches === 2) {
      return { prize: "四等奖", prizeAmount: 3000 };
    } else if (mainMatches === 4 && specialMatches === 1) {
      return { prize: "五等奖", prizeAmount: 300 };
    } else if (mainMatches === 3 && specialMatches === 2) {
      return { prize: "六等奖", prizeAmount: 200 };
    } else if (mainMatches === 2 && specialMatches === 2) {
      return { prize: "七等奖", prizeAmount: 100 };
    } else if (
      (mainMatches === 1 && specialMatches === 2) ||
      (mainMatches === 0 && specialMatches === 2)
    ) {
      return { prize: "八等奖", prizeAmount: 15 };
    }
  } else if (selectedType === "ssq") {
    // 双色球奖金计算
    if (mainMatches === 6 && specialMatches === 1) {
      return { prize: "一等奖", prizeAmount: 0 }; // 浮动奖金
    } else if (mainMatches === 6 && specialMatches === 0) {
      return { prize: "二等奖", prizeAmount: 0 }; // 浮动奖金
    } else if (
      (mainMatches === 5 && specialMatches === 1) ||
      (mainMatches === 5 && specialMatches === 0)
    ) {
      return { prize: "三等奖", prizeAmount: 3000 };
    } else if (
      (mainMatches === 4 && specialMatches === 1) ||
      (mainMatches === 4 && specialMatches === 0)
    ) {
      return { prize: "四等奖", prizeAmount: 200 };
    } else if (
      (mainMatches === 3 && specialMatches === 1) ||
      (mainMatches === 2 && specialMatches === 1)
    ) {
      return { prize: "五等奖", prizeAmount: 10 };
    } else if (mainMatches === 1 && specialMatches === 1) {
      return { prize: "六等奖", prizeAmount: 5 };
    } else if (mainMatches === 0 && specialMatches === 1) {
      return { prize: "六等奖", prizeAmount: 5 };
    }
  } else if (selectedType === "kl8") {
    // 福彩8奖金计算（根据官方规则）
    const result = calculateKL8PrizeForDraw(kl8GameType, mainMatches);
    console.log(
      `KL8奖金计算: 玩法${kl8GameType}，匹配${mainMatches}个，结果:`,
      result
    );
    return result;
  }

  return { prize: "未中奖", prizeAmount: 0 };
};

// 福彩8奖金计算规则
const calculateKL8PrizeForDraw = (
  gameType: number,
  matches: number
): { prize: string; prizeAmount: number } => {
  // 福彩8奖金规则表（单注2元）
  const kl8PrizeRules: {
    [key: string]: { [key: number]: { prize: string; amount: number } };
  } = {
    选1: { 1: { prize: "选1中1", amount: 4.6 } },
    选2: {
      2: { prize: "选2中2", amount: 19 },
    },
    选3: {
      3: { prize: "选3中3", amount: 53 },
      2: { prize: "选3中2", amount: 3 },
    },
    选4: {
      4: { prize: "选4中4", amount: 100 },
      3: { prize: "选4中3", amount: 5 },
      2: { prize: "选4中2", amount: 3 },
    },
    选5: {
      5: { prize: "选5中5", amount: 1000 },
      4: { prize: "选5中4", amount: 21 },
      3: { prize: "选5中3", amount: 3 },
    },
    选6: {
      6: { prize: "选6中6", amount: 3000 },
      5: { prize: "选6中5", amount: 30 },
      4: { prize: "选6中4", amount: 10 },
      3: { prize: "选6中3", amount: 3 },
    },
    选7: {
      7: { prize: "选7中7", amount: 10000 },
      6: { prize: "选7中6", amount: 288 },
      5: { prize: "选7中5", amount: 28 },
      4: { prize: "选7中4", amount: 4 },
      0: { prize: "选7中0", amount: 2 },
    },
    选8: {
      8: { prize: "选8中8", amount: 50000 },
      7: { prize: "选8中7", amount: 800 },
      6: { prize: "选8中6", amount: 88 },
      5: { prize: "选8中5", amount: 10 },
      4: { prize: "选8中4", amount: 3 },
      0: { prize: "选8中0", amount: 2 },
    },
    选9: {
      9: { prize: "选9中9", amount: 30000 },
      8: { prize: "选9中8", amount: 2000 },
      7: { prize: "选9中7", amount: 200 },
      6: { prize: "选9中6", amount: 20 },
      5: { prize: "选9中5", amount: 5 },
      4: { prize: "选9中4", amount: 3 },
      0: { prize: "选9中0", amount: 2 },
    },
    选10: {
      10: { prize: "选10中10", amount: 5000000 },
      9: { prize: "选10中9", amount: 8000 },
      8: { prize: "选10中8", amount: 800 },
      7: { prize: "选10中7", amount: 80 },
      6: { prize: "选10中6", amount: 5 },
      5: { prize: "选10中5", amount: 3 },
      0: { prize: "选10中0", amount: 2 },
    },
  };

  const gameKey = `选${gameType}`;
  const rules = kl8PrizeRules[gameKey];

  if (rules && rules[matches]) {
    return {
      prize: rules[matches].prize,
      prizeAmount: rules[matches].amount,
    };
  }

  return { prize: "未中奖", prizeAmount: 0 };
};

export * from "./utils/AlgorithmUtil";
