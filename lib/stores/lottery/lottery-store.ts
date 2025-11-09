/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  LotteryType,
  AlgorithmType,
  HistoryRecord,
  LotteryStatistics,
} from "@/app/tools/lottery/types";

interface LotteryState {
  // 核心状态
  selectedType: LotteryType;
  algorithm: AlgorithmType;
  sortMode: 'natural' | 'frequency-desc' | 'frequency-asc';
  statistics: LotteryStatistics | null;
  historyRecords: HistoryRecord[];
  lotteryHistoryData: any[];
  ssqHistoryData: any[];
  kl8HistoryData: any[];

  // 状态更新函数
  setSelectedType: (type: LotteryType) => void;
  setAlgorithm: (algorithm: AlgorithmType) => void;
  setSortMode: (sortMode: 'natural' | 'frequency-desc' | 'frequency-asc') => void;
  setStatistics: (statistics: LotteryStatistics | null) => void;
  setHistoryRecords: (records: HistoryRecord[]) => void;
  addHistoryRecord: (
    record: Omit<HistoryRecord, "id" | "timestamp" | "formattedTime">
  ) => void;
  clearHistoryRecords: () => void;
  setLotteryHistoryData: (data: any[]) => void;
  setSsqHistoryData: (data: any[]) => void;
  setKL8HistoryData: (data: any[]) => void;

  // 重置函数
  reset: () => void;
}

const initialState = {
  selectedType: "dlt" as LotteryType,
  algorithm: "balanced" as AlgorithmType,
  sortMode: "natural" as const,
  statistics: null as LotteryStatistics | null,
  historyRecords: [] as HistoryRecord[],
  lotteryHistoryData: [] as any,
  ssqHistoryData: [] as any,
  kl8HistoryData: [] as any,
};

// 迁移函数：将旧的数据格式转换为新的
const migrateState = (state: any): any => {
  if (!state) return state;

  // 迁移旧的彩票类型
  if ((state.selectedType as any) === "fc8") {
    console.log("Migrating stored selectedType from 'fc8' to 'kl8'");
    return { ...state, selectedType: "kl8" as LotteryType };
  }

  // 如果没有sortMode字段，添加默认值
  if (!state.sortMode) {
    return { ...state, sortMode: "natural" };
  }

  return state;
};

export const useLotteryStore = create<LotteryState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSelectedType: (type) => {
        // 迁移旧的类型名称
        let migratedType = type;
        if ((type as any) === "fc8") {
          migratedType = "kl8";
          console.log("Migrating old type 'fc8' to 'kl8'");
        }
        set({ selectedType: migratedType });
      },
      setAlgorithm: (algorithm) => set({ algorithm }),
      setSortMode: (sortMode) => set({ sortMode }),
      setStatistics: (statistics) => set({ statistics }),
      setHistoryRecords: (historyRecords) => set({ historyRecords }),
      addHistoryRecord: (record) => {
        const newRecord: HistoryRecord = {
          ...record,
          id: Date.now().toString(),
          timestamp: Date.now(),
          formattedTime: new Date().toLocaleString("zh-CN"),
        };

        set({ historyRecords: [newRecord, ...get().historyRecords] });
      },
      clearHistoryRecords: () => set({ historyRecords: [] }),
      setLotteryHistoryData: (data) => set({ lotteryHistoryData: data }),
      setSsqHistoryData: (data) => set({ ssqHistoryData: data }),
      setKL8HistoryData: (data) => set({ kl8HistoryData: data }),
      reset: () => set(initialState),
    }),

    {
      name: "simpletool-lottery-storage",
      partialize: (state) => ({
        historyRecords: state.historyRecords,
        selectedType: state.selectedType,
        algorithm: state.algorithm,
        sortMode: state.sortMode,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const migratedState = migrateState(state);
          Object.assign(state, migratedState);
        }
      },
    }
  )
);
