/* eslint-disable @typescript-eslint/no-explicit-any */
// 大乐透AI解析数据
export interface DLTAIParsedData {
  lottery_type: string;
  issue_number: string;
  draw_date: string;
  ticket_type: string;
  multiple: number;
  total_amount: number;
  contribution_to_charity: number;
  serial_numbers: string[];
  bets: Array<{
    sequence: number;
    front_numbers: number[];
    back_numbers: number[];
  }>;
  prize_pool?: number;
  previous_jackpot?: number;
  store_info?: {
    name: string;
    address: string;
  };
  ticket_id?: string;
  print_time?: string;
}

// 双色球AI解析数据
export interface SSQAIParsedData {
  lottery_type: string;
  issue_number: string;
  draw_date: string;
  ticket_type: string;
  total_amount: number;
  contribution_to_charity: number;
  serial_numbers: string[];
  bets: Array<{
    sequence: number;
    red_balls: string[];
    blue_ball: string;
    multiplier: number;
  }>;
  store_info?: {
    station_id?: string;
    transaction_id?: string;
    address?: string;
  };
  ticket_id?: string;
  print_time?: string;
  issuer?: string;
  center?: string;
}

export type AIParsedLotteryData = DLTAIParsedData | SSQAIParsedData;

export type LotteryType = "dlt" | "ssq" | "kl8";

export interface LotteryConfig {
  name: string;
  mainRange: [number, number];
  mainCount: number | [number, number]; // 支持单个数字或范围[最小, 最大]
  specialRange?: [number, number];
  specialCount?: number | [number, number]; // 支持单个数字或范围[最小, 最大]
  description: string;
  // KL8专用字段
  defaultCount?: number; // 默认选号数量
  betAmounts?: number[]; // 投注金额数组
  maxSingleBet?: number; // 单注最高投注限制
}

export interface CroppedAreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AutoPrizeResult {
  betIndex: number;
  matchedMain: number;
  matchedSpecial: number;
  prize: string;
  matchedMainNumbers: number[];
  matchedSpecialNumbers: number[];
}

export interface HistoryRecord {
  id: string;
  lotteryType: string;
  algorithm: string;
  mainNumbers: number[];
  specialNumbers: number[];
  timestamp: number;
  formattedTime: string;
  // KL8专用字段
  kl8NumberCount?: number; // KL8选号数量
  betAmount?: number; // 投注金额
}

export interface LotteryStatistics {
  frequency: { [key: number]: number };
  omission: { [key: number]: number };
  rangeData?: any[]; // 统计范围内的原始数据
}

export type AlgorithmType = "random" | "frequency" | "omission" | "balanced";
