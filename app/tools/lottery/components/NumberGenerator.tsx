"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Shuffle,
  Check,
  Copy,
  Save,
  Scale,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Trash,
  History,
} from "lucide-react";
import {
  LotteryType,
  AlgorithmType,
  LotteryStatistics,
  HistoryRecord,
} from "../types";
import { LOTTERY_CONFIGS } from "../constants";
import {
  getAlgorithmName,
  getHighFrequencyNumbers,
  getColdNumbers,
} from "../utils";
import { FrequencyLegend } from "./FrequencyLegend";

interface NumberGeneratorProps {
  selectedType: LotteryType;
  algorithm: AlgorithmType;
  statistics: LotteryStatistics | null;
  onAlgorithmChange: (algorithm: AlgorithmType) => void;
  onTypeChange: (type: LotteryType) => void;
  onStatisticsUpdate: (statistics: LotteryStatistics) => void;
  onAddHistoryRecord: (
    record: Omit<HistoryRecord, "id" | "timestamp" | "formattedTime">
  ) => void;
  lotteryHistoryData: any[];
  ssqHistoryData: any[];
  historyRecords: HistoryRecord[];
  onHistoryUpdate: (records: HistoryRecord[]) => void;
}

export default function NumberGenerator({
  selectedType,
  algorithm,
  statistics,
  onAlgorithmChange,
  onTypeChange,
  onAddHistoryRecord,
  lotteryHistoryData,
  ssqHistoryData,
  historyRecords,
  onHistoryUpdate,
}: NumberGeneratorProps) {
  const config = LOTTERY_CONFIGS[selectedType];
  const [mainNumbers, setMainNumbers] = useState<number[]>([]);
  const [specialNumbers, setSpecialNumbers] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // 保存选号
  const saveNumbers = useCallback(() => {
    if (mainNumbers.length > 0) {
      onAddHistoryRecord({
        lotteryType: selectedType,
        algorithm: algorithm,
        mainNumbers: mainNumbers,
        specialNumbers: specialNumbers,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000); // 2秒后恢复状态
      console.log("选号已保存到历史记录");
    }
  }, [
    mainNumbers,
    specialNumbers,
    selectedType,
    algorithm,
    onAddHistoryRecord,
  ]);

  // 智能选号算法
  const generateSmartNumbers = useCallback(() => {
    const mainNumbers: number[] = [];
    const specialNumbers: number[] = [];

    try {
      switch (algorithm) {
        case "frequency":
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
                  Math.random() *
                    (config.mainRange[1] - config.mainRange[0] + 1)
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
          break;

        case "omission":
          // 冷门算法：优先选择长期未出现的号码
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
                  Math.random() *
                    (config.mainRange[1] - config.mainRange[0] + 1)
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
          break;

        case "balanced":
          // 均衡算法：混合高频和低频号码
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
                  Math.random() *
                    (config.mainRange[1] - config.mainRange[0] + 1)
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
          break;

        case "random":
        default:
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
                  Math.random() *
                    (config.specialRange[1] - config.specialRange[0] + 1)
                ) + config.specialRange[0];
              if (!specialNumbers.includes(num)) {
                specialNumbers.push(num);
              }
            }
            specialNumbers.sort((a, b) => a - b);
          }
          break;
      }

      setMainNumbers(mainNumbers);
      setSpecialNumbers(specialNumbers);

      console.log(`${getAlgorithmName(algorithm)}算法生成成功！`);
      console.log("请点击保存选号按钮将号码添加到历史记录");
    } catch (error) {
      console.error("生成号码失败:", error);
    }
  }, [algorithm, config, statistics, onAddHistoryRecord, selectedType]);

  // 复制号码到剪贴板
  const copyNumbers = useCallback(() => {
    const text =
      specialNumbers.length > 0
        ? `${mainNumbers.join(", ")} + ${specialNumbers.join(", ")}`
        : mainNumbers.join(", ");

    navigator.clipboard.writeText(text);
    setCopied(true);
    console.log("已复制到剪贴板");
    setTimeout(() => setCopied(false), 2000);
  }, [mainNumbers, specialNumbers]);

  const getFrequencyColor = (num: number) => {
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

  const colorByFreq = (p: number) => {
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>号码选择器</CardTitle>
          <CardDescription>
            选择或生成您的{selectedType === "dlt" ? "大乐透" : "双色球"}号码
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* 已选号码展示 */}
            <div className="flex justify-center items-center gap-2 p-3 bg-muted/30 rounded-lg h-[60px]">
              {mainNumbers.length > 0 || specialNumbers.length > 0 ? (
                <div className="flex flex-wrap gap-2 justify-center items-center">
                  {mainNumbers.map((num, idx) => (
                    <div
                      key={idx}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md"
                    >
                      {`${num < 10 ? "0" : ""}${num}`}
                    </div>
                  ))}
                  {specialNumbers.length > 0 && (
                    <>
                      <span className="text-lg font-bold mx-2 text-muted-foreground">
                        +
                      </span>
                      {specialNumbers.map((num, idx) => (
                        <div
                          key={idx}
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-600 to-red-600 text-white flex items-center justify-center font-bold text-sm shadow-md"
                        >
                          {`${num < 10 ? "0" : ""}${num}`}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  请在下方选择号码
                </p>
              )}
            </div>

            {/* 统一操作区域 */}
            <div className="bg-linear-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-blue-200/30 dark:border-blue-800/30">
              <div className="flex flex-col gap-3">
                {/* 第一行：设置和主按钮 */}
                <div className="flex items-center gap-3">
                  {/* 左侧：选择器组 */}
                  <div className="flex items-center gap-2 flex-1">
                    <Select
                      value={selectedType}
                      onValueChange={(value: LotteryType) =>
                        onTypeChange(value)
                      }
                    >
                      <SelectTrigger className="h-8 w-32 text-xs cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(LOTTERY_CONFIGS) as LotteryType[]).map(
                          (type) => (
                            <SelectItem
                              key={type}
                              value={type}
                              className="text-xs"
                            >
                              {LOTTERY_CONFIGS[type].name}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>

                    <Select
                      value={algorithm}
                      onValueChange={(value: AlgorithmType) =>
                        onAlgorithmChange(value)
                      }
                    >
                      <SelectTrigger className="h-8 w-32 text-xs cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="random" className="text-xs">
                          <Shuffle className="w-3 h-3 inline mr-1" />
                          随机
                        </SelectItem>
                        <SelectItem value="frequency" className="text-xs">
                          <TrendingUp className="w-3 h-3 inline mr-1" />
                          高频
                        </SelectItem>
                        <SelectItem value="omission" className="text-xs">
                          <TrendingDown className="w-3 h-3 inline mr-1" />
                          冷门
                        </SelectItem>
                        <SelectItem value="balanced" className="text-xs">
                          <Scale className="w-3 h-3 inline mr-1" />
                          均衡
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      onClick={() => generateSmartNumbers()}
                      className="bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      智能生成
                    </Button>
                  </div>

                  {/* 右侧：状态显示 */}
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">选号状态</p>
                    <p className="text-sm font-medium">
                      {selectedType === "dlt" ? "前区" : "红球"}:{" "}
                      {mainNumbers.length}/{config.mainCount}
                      {config.specialCount && (
                        <span className="ml-2">
                          {selectedType === "dlt" ? "后区" : "蓝球"}:{" "}
                          {specialNumbers.length}/{config.specialCount}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* 第二行：辅助操作按钮 */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setMainNumbers([]);
                        setSpecialNumbers([]);
                      }}
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-slate-500 hover:bg-red-50 hover:border-red-300 h-7 px-3"
                    >
                      <Trash />
                      清空号码
                    </Button>
                    <Button
                      onClick={copyNumbers}
                      variant="outline"
                      size="sm"
                      className="border-green-200 text-slate-500 hover:bg-green-50 hover:border-green-300 h-7 px-3"
                    >
                      {copied ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : (
                        <Copy className="h-3 w-3 mr-1" />
                      )}
                      {copied ? "已复制" : "复制"}
                    </Button>
                    <Button
                      onClick={saveNumbers}
                      variant="outline"
                      size="sm"
                      className="border-blue-200 text-slate-500 hover:bg-blue-50 hover:border-blue-300 h-7 px-3"
                      disabled={mainNumbers.length === 0 || saved}
                    >
                      {saved ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : (
                        <Save className="h-3 w-3 mr-1" />
                      )}
                      {saved ? "已保存" : "保存选号"}
                    </Button>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button
                          variant="secondary"
                          size="lg"
                          className="    h-7 px-3"
                        >
                          <History className="h-3 w-3 mr-1" />
                          查看我的选号({historyRecords.length}条)
                        </Button>
                      </SheetTrigger>
                      <SheetContent
                        side="bottom"
                        className="h-[80vh] overflow-y-auto"
                      >
                        <SheetHeader>
                          <SheetTitle className="flex items-center gap-2">
                            <History className="h-5 w-5 text-blue-600" />
                            我的选号记录
                          </SheetTitle>
                          <SheetDescription>
                            共 {historyRecords.length}{" "}
                            条选号记录，包括标准选号和复式选号
                          </SheetDescription>
                        </SheetHeader>

                        <div
                          className="space-y-3 overflow-y-auto pr-2 px-4 pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
                          style={{ maxHeight: "calc(80vh - 200px)" }}
                        >
                          {historyRecords.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-muted-foreground/20 rounded-lg bg-linear-to-br from-gray-50/50 to-blue-50/50 dark:from-gray-900/20 dark:to-blue-900/20">
                              <History className="h-16 w-16 mx-auto mb-4 opacity-30" />
                              <h4 className="text-lg font-semibold mb-2">
                                暂无选号记录
                              </h4>
                              <p className="text-sm mb-6">
                                生成号码后点击保存按钮将添加到此处
                              </p>
                            </div>
                          ) : (
                            historyRecords.map((record) => (
                              <div
                                key={record.id}
                                className="p-4 bg-linear-to-r from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-pink-900/10 rounded-xl border border-blue-200/50 dark:border-blue-800/30 hover:border-blue-400/50 hover:shadow-md transition-all duration-200"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                      {record.lotteryType}
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-linear-to-r from-blue-600/20 to-purple-600/20 rounded-full text-blue-700 dark:text-blue-300 font-medium">
                                      {record.algorithm}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground font-medium">
                                      {record.formattedTime}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 px-2 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                      onClick={() => {
                                        const text =
                                          record.specialNumbers.length > 0
                                            ? `${record.mainNumbers.join(
                                                ", "
                                              )} + ${record.specialNumbers.join(
                                                ", "
                                              )}`
                                            : record.mainNumbers.join(", ");
                                        navigator.clipboard.writeText(text);
                                      }}
                                    >
                                      <Copy className="h-3 w-3 mr-1" />
                                      复制
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  {record.mainNumbers.map((num, idx) => (
                                    <div
                                      key={idx}
                                      className="w-8 h-8 rounded-full bg-linear-to-br from-blue-600 to-purple-600 text-white text-sm flex items-center justify-center font-bold shadow-sm"
                                    >
                                      {num}
                                    </div>
                                  ))}
                                  {record.specialNumbers.length > 0 && (
                                    <>
                                      <span className="text-sm font-bold text-muted-foreground mx-2">
                                        +
                                      </span>
                                      {record.specialNumbers.map((num, idx) => (
                                        <div
                                          key={idx}
                                          className="w-8 h-8 rounded-full bg-linear-to-br from-pink-600 to-red-600 text-white text-sm flex items-center justify-center font-bold shadow-sm"
                                        >
                                          {num}
                                        </div>
                                      ))}
                                    </>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              </div>
            </div>

            {/* 号码选择区域 */}
            <div className="space-y-6">
              {/* 前区号码网格 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {selectedType === "dlt" ? "前区号码" : "红球"}
                    </h4>
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                      {mainNumbers.length}/{config.mainCount}
                    </span>
                    <span className="text-xs text-gray-400">
                      红色高频，蓝色低频
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const available = [];
                        for (
                          let i = config.mainRange[0];
                          i <= config.mainRange[1];
                          i++
                        ) {
                          if (!mainNumbers.includes(i)) {
                            available.push(i);
                          }
                        }
                        const needed = Math.min(
                          config.mainCount - mainNumbers.length,
                          available.length
                        );
                        if (needed > 0) {
                          const shuffled = available.sort(
                            () => Math.random() - 0.5
                          );
                          const newNumbers = [
                            ...mainNumbers,
                            ...shuffled.slice(0, needed),
                          ].sort((a, b) => a - b);
                          setMainNumbers(newNumbers);
                        }
                      }}
                      disabled={mainNumbers.length >= config.mainCount}
                      className="text-xs h-7 px-3 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    >
                      随机补全
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMainNumbers([])}
                      disabled={mainNumbers.length === 0}
                      className="text-xs h-7 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      清除
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-10 sm:grid-cols-12 gap-1.5 gap-y-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                  {Array.from(
                    { length: config.mainRange[1] - config.mainRange[0] + 1 },
                    (_, i) => config.mainRange[0] + i
                  ).map((num) => {
                    const isSelected = mainNumbers.includes(num);

                    const color = getFrequencyColor(num);

                    return (
                      <button
                        key={num}
                        onClick={() => {
                          const newNumbers = [...mainNumbers];
                          const index = newNumbers.indexOf(num);
                          if (index > -1) {
                            newNumbers.splice(index, 1);
                          } else {
                            if (
                              newNumbers.length <
                              config.mainRange[1] - config.mainRange[0] + 1
                            ) {
                              newNumbers.push(num);
                              newNumbers.sort((a, b) => a - b);
                            }
                          }
                          setMainNumbers(newNumbers);
                        }}
                        className={`h-9 w-9 p-0 cursor-pointer text-xs font-bold transition-all duration-200 border-2 rounded-lg hover:scale-110 ${
                          isSelected
                            ? "ring-3 ring-blue-100 ring-offset-1 ring-offset-white dark:ring-offset-gray-900 shadow-lg"
                            : "hover:shadow-md"
                        }`}
                        style={{
                          backgroundColor: color.bg,
                          borderColor: color.border,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = color.hover;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = color.bg;
                        }}
                      >
                        {`${num < 10 ? "0" : ""}${num}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <FrequencyLegend />

              {/* 后区号码网格 */}
              {config.specialRange && config.specialCount && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-pink-500 rounded-full"></div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {selectedType === "dlt" ? "后区号码" : "蓝球"}
                      </h4>
                      <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                        {specialNumbers.length}/{config.specialCount}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (!config.specialRange) return;
                          const available = [];
                          for (
                            let i = config.specialRange[0];
                            i <= config.specialRange[1];
                            i++
                          ) {
                            if (!specialNumbers.includes(i)) {
                              available.push(i);
                            }
                          }
                          const needed = Math.min(
                            config.specialCount! - specialNumbers.length,
                            available.length
                          );
                          if (needed > 0) {
                            const shuffled = available.sort(
                              () => Math.random() - 0.5
                            );
                            const newNumbers = [
                              ...specialNumbers,
                              ...shuffled.slice(0, needed),
                            ].sort((a, b) => a - b);
                            setSpecialNumbers(newNumbers);
                          }
                        }}
                        disabled={specialNumbers.length >= config.specialCount}
                        className="text-xs h-7 px-3 text-pink-600 hover:bg-pink-50 hover:text-pink-700"
                      >
                        随机补全
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSpecialNumbers([])}
                        disabled={specialNumbers.length === 0}
                        className="text-xs h-7 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        清除
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 gap-y-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                    {config.specialRange &&
                      Array.from(
                        {
                          length:
                            config.specialRange[1] - config.specialRange[0] + 1,
                        },
                        (_, i) => config.specialRange![0] + i
                      ).map((num) => {
                        const isSelected = specialNumbers.includes(num);
                        const getFrequencyColor = (num: number) => {
                          if (!statistics) {
                            return {
                              bg: "rgba(107, 114, 128, 0.1)",
                              border: "rgba(107, 114, 128, 0.3)",
                              hover: "rgba(107, 114, 128, 0.15)",
                            };
                          }

                          const frequency = statistics.frequency[num] || 0;
                          const allFrequencies = Object.values(
                            statistics.frequency
                          ).filter((f: any) => f > 0) as number[];

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

                        const color = getFrequencyColor(num);

                        return (
                          <button
                            key={num}
                            onClick={() => {
                              const newNumbers = [...specialNumbers];
                              const index = newNumbers.indexOf(num);
                              if (index > -1) {
                                newNumbers.splice(index, 1);
                              } else {
                                if (
                                  config.specialRange &&
                                  newNumbers.length <
                                    config.specialRange[1] -
                                      config.specialRange[0] +
                                      1
                                ) {
                                  newNumbers.push(num);
                                  newNumbers.sort((a, b) => a - b);
                                }
                              }
                              setSpecialNumbers(newNumbers);
                            }}
                            className={`h-9 w-9 p-0 text-xs  cursor-pointer font-bold transition-all duration-200 border-2 rounded-lg hover:scale-110 ${
                              isSelected
                                ? "ring-3 ring-blue-100 ring-offset-1 ring-offset-white dark:ring-offset-gray-900 shadow-lg"
                                : "hover:shadow-md"
                            }`}
                            style={{
                              backgroundColor: color.bg,
                              borderColor: color.border,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                color.hover;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = color.bg;
                            }}
                          >
                            {`${num < 10 ? "0" : ""}${num}`}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 号位频次统计模块 */}
      {statistics && (
        <Card className="border-amber-200/50 dark:border-amber-800/30 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500"></div>
              号位频次统计
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div
              className={`${config.specialCount ? "flex gap-6" : "space-y-3"}`}
            >
              {/* 前区/红球号位频次 */}
              <div className="flex-1">
                <h5 className="text-xs font-medium text-amber-600 mb-2">
                  {selectedType === "dlt" ? "前区" : "红球"}号位
                </h5>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from(
                    { length: config.mainCount },
                    (_, positionIdx) => {
                      // 获取该号位频次最高的10个号码（使用统计范围内的数据）
                      const positionFrequencies: { [key: number]: number } = {};
                      const historyData =
                        selectedType === "dlt"
                          ? lotteryHistoryData
                          : ssqHistoryData;

                      // 根据统计范围筛选数据
                      const limitedHistoryData =
                        statistics.rangeData || historyData;

                      limitedHistoryData.forEach((record) => {
                        const numbers =
                          record.numbers ||
                          record.redBalls ||
                          record.mainNumbers ||
                          [];
                        if (numbers[positionIdx] !== undefined) {
                          const num = numbers[positionIdx];
                          positionFrequencies[num] =
                            (positionFrequencies[num] || 0) + 1;
                        }
                      });

                      // 按频次排序，取前10个
                      const topNumbers = Object.entries(positionFrequencies)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 10)
                        .map(([num, freq]) => ({ num: parseInt(num), freq }));

                      const maxFreq =
                        topNumbers.length > 0 ? topNumbers[0].freq : 0;

                      return (
                        <div key={positionIdx} className="text-center">
                          {/* 号位标题 */}
                          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                            第{positionIdx + 1}位
                          </div>

                          {/* 该号位高频号码 */}
                          <div className="space-y-1">
                            {topNumbers.slice(0, 10).map(({ num, freq }) => {
                              const percentage =
                                maxFreq > 0 ? (freq / maxFreq) * 100 : 0;
                              return (
                                <div
                                  key={num}
                                  className="flex items-center gap-1"
                                >
                                  <span className="text-xs text-gray-600 dark:text-gray-400 w-6 text-right">
                                    {num}
                                  </span>
                                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-300"
                                      style={{
                                        width: `${Math.max(percentage, 5)}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-500 w-8 text-left">
                                    {freq}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* 后区/蓝球号位频次 */}
              {config.specialCount && (
                <div className="w-48">
                  <h5 className="text-xs font-medium text-amber-600 mb-2">
                    {selectedType === "dlt" ? "后区" : "蓝球"}号位
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from(
                      { length: config.specialCount },
                      (_, positionIdx) => {
                        // 获取该号位频次最高的10个号码（使用统计范围内的数据）
                        const positionFrequencies: { [key: number]: number } =
                          {};
                        const historyData =
                          selectedType === "dlt"
                            ? lotteryHistoryData
                            : ssqHistoryData;

                        // 根据统计范围筛选数据
                        const limitedHistoryData =
                          statistics.rangeData || historyData;

                        limitedHistoryData.forEach((record) => {
                          const numbers =
                            record.specialNumbers || record.blueBalls || [];
                          if (numbers[positionIdx] !== undefined) {
                            const num = numbers[positionIdx];
                            positionFrequencies[num] =
                              (positionFrequencies[num] || 0) + 1;
                          }
                        });

                        // 按频次排序，取前10个
                        const topNumbers = Object.entries(positionFrequencies)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 10)
                          .map(([num, freq]) => ({ num: parseInt(num), freq }));

                        const maxFreq =
                          topNumbers.length > 0 ? topNumbers[0].freq : 0;

                        return (
                          <div key={positionIdx} className="text-center">
                            {/* 号位标题 */}
                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                              第{positionIdx + 1}位
                            </div>

                            {/* 该号位高频号码 */}
                            <div className="space-y-1">
                              {topNumbers.slice(0, 10).map(({ num, freq }) => {
                                const percentage =
                                  maxFreq > 0 ? (freq / maxFreq) * 100 : 0;
                                return (
                                  <div
                                    key={num}
                                    className="flex items-center gap-1"
                                  >
                                    <span className="text-xs text-gray-600 dark:text-gray-400 w-6 text-right">
                                      {num}
                                    </span>
                                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-300"
                                        style={{
                                          width: `${Math.max(percentage, 5)}%`,
                                        }}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-500 w-8 text-left">
                                      {freq}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
