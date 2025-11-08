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
  statistics: LotteryStatistics | null;
  historyRecords: HistoryRecord[];

  // 状态更新函数
  setSelectedType: (type: LotteryType) => void;
  setAlgorithm: (algorithm: AlgorithmType) => void;
  setStatistics: (statistics: LotteryStatistics | null) => void;
  setHistoryRecords: (records: HistoryRecord[]) => void;
  addHistoryRecord: (
    record: Omit<HistoryRecord, "id" | "timestamp" | "formattedTime">
  ) => void;
  clearHistoryRecords: () => void;

  // 重置函数
  reset: () => void;
}

const initialState = {
  selectedType: "dlt" as LotteryType,
  algorithm: "balanced" as AlgorithmType,
  statistics: null as LotteryStatistics | null,
  historyRecords: [] as HistoryRecord[],
};

export const useLotteryStore = create<LotteryState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSelectedType: (type) => set({ selectedType: type }),
      setAlgorithm: (algorithm) => set({ algorithm }),
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
      reset: () => set(initialState),
    }),

    {
      name: "simpletool-lottery-storage",
      partialize: (state) => ({
        historyRecords: state.historyRecords,
        selectedType: state.selectedType,
        algorithm: state.algorithm,
      }),
    }
  )
);
