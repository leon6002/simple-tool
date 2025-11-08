import { LotteryConfig, LotteryType } from "./types";

export type { LotteryType };
export const LOTTERY_CONFIGS: Record<LotteryType, LotteryConfig> = {
  dlt: {
    name: "大乐透",
    mainRange: [1, 35],
    mainCount: 5,
    specialRange: [1, 12],
    specialCount: 2,
    description: "前区5个号码(1-35) + 后区2个号码(1-12)",
  },
  ssq: {
    name: "双色球",
    mainRange: [1, 33],
    mainCount: 6,
    specialRange: [1, 16],
    specialCount: 1,
    description: "红球6个号码(1-33) + 蓝球1个号码(1-16)",
  },
  fc8: {
    name: "福彩8",
    mainRange: [1, 80],
    mainCount: 8,
    description: "选择8个号码(1-80)",
  },
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const STORAGE_KEY = "lottery_generator_history";
