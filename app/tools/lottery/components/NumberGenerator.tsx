/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from "react";
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

import { LOTTERY_CONFIGS } from "../constants";
import { FrequencyLegend } from "./FrequencyLegend";
import { NumberSelector } from "./NumberSelector";
import { selectNumberByAlgorithm } from "../utils/AlgorithmUtil";
import { NumberPreview } from "./pc/NumberPreview";
import { NumberPreviewMobile } from "./mobile/NumberPreviewMobile";
import NumberOperationsMobile from "./mobile/NumberOperationsMobile";
import { NumberOperations } from "./pc/NumberOperations";
import { NumberSlotStatistics } from "./pc/NumberSlotStatistics";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useLotteryStore } from "@/lib/stores/lottery/lottery-store";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { calculateDLTBetAmount, calculateSSQBetAmount, calculateKL8BetAmount, calculateKL8BetCount, calculateBetCount, formatCurrency, validateKL8BetLimit } from "../constants";

interface NumberGeneratorProps {
  lotteryHistoryData: any[];
  ssqHistoryData: any[];
  kl8HistoryData: any[];
}

export default function NumberGenerator({
  lotteryHistoryData,
  ssqHistoryData,
  kl8HistoryData,
}: NumberGeneratorProps) {
  const {
    selectedType,
    algorithm,
    statistics,
    addHistoryRecord,
    setHistoryRecords,
  } = useLotteryStore();

  const [mainNumbers, setMainNumbers] = useState<number[]>([]);
  const [specialNumbers, setSpecialNumbers] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [kl8NumberCount, setKL8NumberCount] = useState(10); // KL8选号数量，默认10个

  const isMobile = useIsMobile();

  // 将数字转换为中文玩法名称
  const getKL8GameName = (count: number): string => {
    const chineseNumbers = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四', '十五', '十六'];
    return chineseNumbers[count] || count.toString();
  };

  // 验证KL8投注限制
  const kl8Validation = selectedType === 'kl8' ? validateKL8BetLimit(mainNumbers.length, kl8NumberCount) : null;

  // 获取配置
  const config = LOTTERY_CONFIGS[selectedType];

  // 配置不存在时的保护措施
  if (!config) {
    console.error('Config not found for selectedType:', selectedType);
    console.error('Available types:', Object.keys(LOTTERY_CONFIGS));
    // 返回一个默认配置防止崩溃
    return null;
  }

  // 保存选号
  const saveNumbers = useCallback(() => {
    if (mainNumbers.length > 0) {
      // 对于KL8，验证是否完成选号
      if (selectedType === 'kl8' && mainNumbers.length < kl8NumberCount) {
        console.log("KL8选号未完成，无法保存");
        return;
      }

      const recordData: any = {
        lotteryType: selectedType,
        algorithm: algorithm,
        mainNumbers: mainNumbers,
        specialNumbers: specialNumbers,
      };

      // 为KL8添加额外信息
      if (selectedType === 'kl8') {
        recordData.kl8NumberCount = kl8NumberCount; // 使用玩法数量
        recordData.betAmount = calculateKL8BetAmount(mainNumbers.length, kl8NumberCount); // 根据玩法和选择数量计算金额
      }

      addHistoryRecord(recordData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000); // 2秒后恢复状态
      console.log("选号已保存到历史记录");
    }
  }, [mainNumbers, specialNumbers, selectedType, algorithm, kl8NumberCount, addHistoryRecord]);

  // 智能选号算法
  const generateSmartNumbers = useCallback(() => {
    try {
      const { mainNumbers, specialNumbers } = selectNumberByAlgorithm({
        algorithm,
        statistics,
        config,
        kl8NumberCount: selectedType === 'kl8' ? kl8NumberCount : undefined,
        mainTargetCount: selectedType !== 'kl8' ? (Array.isArray(config.mainCount) ? config.mainCount[0] : config.mainCount) : undefined,
        specialTargetCount: config.specialCount ? (Array.isArray(config.specialCount) ? config.specialCount[0] : config.specialCount) : undefined,
      });
      setMainNumbers(mainNumbers);
      setSpecialNumbers(specialNumbers);
    } catch (error) {
      console.error("生成号码失败:", error);
    }
  }, [algorithm, config, statistics, selectedType, kl8NumberCount]);

  const { copyToClipboard } = useCopyToClipboard();

  const copyNumbers = async () => {
    const text =
      specialNumbers.length > 0
        ? `${mainNumbers.join(", ")} + ${specialNumbers.join(", ")}`
        : mainNumbers.join(", ");
    const success = await copyToClipboard(text, {
      successMessage: "Copied to clipboard! 📋",
    });
    setCopied(true);
    if (success) {
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <Card className="md:mb-0 mb-24">
        <CardHeader>
          <CardTitle>号码选择器</CardTitle>
          <CardDescription>
            选择或生成您的{selectedType === "dlt" ? "大乐透" : selectedType === "ssq" ? "双色球" : "快乐8"}号码
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* KL8选号数量选择器 */}
            {selectedType === 'kl8' && (
              <div className="bg-linear-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200/30 dark:border-orange-800/30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      玩法:
                    </label>
                    <Select
                      value={kl8NumberCount.toString()}
                      onValueChange={(value) => {
                        const count = parseInt(value);
                        setKL8NumberCount(count);
                        // 清空当前号码以重新选择
                        setMainNumbers([]);
                        setSpecialNumbers([]);
                      }}
                    >
                      <SelectTrigger className="w-20 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                          <SelectItem key={num} value={num.toString()} className="text-sm">
                            选{getKL8GameName(num)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      当前投注金额:
                    </div>
                    <div className={`text-lg font-bold ${kl8Validation && !kl8Validation.isValid ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>
                      {formatCurrency(calculateKL8BetAmount(mainNumbers.length, kl8NumberCount))}
                    </div>
                    {mainNumbers.length > 0 && (
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                        玩法：选{getKL8GameName(mainNumbers.length)}
                      </div>
                    )}
                  </div>
                </div>

                {/* 投注限制提示 */}
                {kl8Validation && !kl8Validation.isValid && (
                  <div className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800">
                    <span className="font-medium">⚠️ 警告:</span> {kl8Validation.errorMessage}
                  </div>
                )}

                {/* 始终显示投注说明 */}
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
                  <span className="font-medium">
                    {mainNumbers.length > 0
                      ? (mainNumbers.length === kl8NumberCount ? "单式投注:" : "复式投注:")
                      : "请选择号码"
                    }
                  </span>
                  {mainNumbers.length > 0
                    ? (mainNumbers.length === kl8NumberCount
                        ? ` 选择${mainNumbers.length}个号码，投注金额为 ${formatCurrency(calculateKL8BetAmount(mainNumbers.length, kl8NumberCount))}（每注2元）`
                        : ` 选择${mainNumbers.length}个号码投注"选${kl8NumberCount}"玩法，共${calculateKL8BetCount(mainNumbers.length, kl8NumberCount)}注，投注金额为 ${formatCurrency(calculateKL8BetAmount(mainNumbers.length, kl8NumberCount))}`)
                    : ": 当前未选择任何号码"
                  }
                </div>

                {/* 单注限额提醒 */}
                {mainNumbers.length > 0 && calculateKL8BetAmount(mainNumbers.length, kl8NumberCount) >= 15000 && (
                  <div className="mt-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded-lg border border-orange-200 dark:border-orange-800">
                    <span className="font-medium">提醒:</span> 当前投注金额接近单注限额 ¥20,000
                  </div>
                )}
              </div>
            )}

            {/* 大乐透和双色球投注金额计算 */}
            {(selectedType === 'dlt' || selectedType === 'ssq') && (
              <div className="bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-blue-200/30 dark:border-blue-800/30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      当前投注金额:
                    </div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {(() => {
                        if (selectedType === 'dlt') {
                          return formatCurrency(calculateDLTBetAmount(mainNumbers.length, specialNumbers.length));
                        } else if (selectedType === 'ssq') {
                          return formatCurrency(calculateSSQBetAmount(mainNumbers.length, specialNumbers.length));
                        }
                        return '¥0';
                      })()}
                    </div>
                    {mainNumbers.length > 0 && (
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                        {(() => {
                          const betCount = calculateBetCount(selectedType, mainNumbers.length, specialNumbers.length);
                          if (selectedType === 'dlt') {
                            return `前区${mainNumbers.length}个 + 后区${specialNumbers.length}个 = ${betCount}注`;
                          } else if (selectedType === 'ssq') {
                            return `红球${mainNumbers.length}个 + 蓝球${specialNumbers.length}个 = ${betCount}注`;
                          }
                          return '';
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                {/* 投注说明 */}
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
                  <span className="font-medium">
                    {(() => {
                      if (mainNumbers.length === 0) {
                        return "请选择号码";
                      }
                      if (selectedType === 'dlt') {
                        if (mainNumbers.length === 5 && specialNumbers.length === 2) {
                          return "单式投注: 前5后2，标准投注";
                        } else {
                          const betCount = calculateBetCount(selectedType, mainNumbers.length, specialNumbers.length);
                          return `复式投注: 前${mainNumbers.length}后${specialNumbers.length}，共${betCount}注，${formatCurrency(calculateDLTBetAmount(mainNumbers.length, specialNumbers.length))}`;
                        }
                      } else if (selectedType === 'ssq') {
                        if (mainNumbers.length === 6 && specialNumbers.length === 1) {
                          return "单式投注: 红6蓝1，标准投注";
                        } else {
                          const betCount = calculateBetCount(selectedType, mainNumbers.length, specialNumbers.length);
                          return `复式投注: 红${mainNumbers.length}蓝${specialNumbers.length}，共${betCount}注，${formatCurrency(calculateSSQBetAmount(mainNumbers.length, specialNumbers.length))}`;
                        }
                      }
                      return "";
                    })()}
                  </span>
                </div>

                {/* 单注限额提醒 */}
                {(() => {
                  let betAmount = 0;
                  if (selectedType === 'dlt') {
                    betAmount = calculateDLTBetAmount(mainNumbers.length, specialNumbers.length);
                  } else if (selectedType === 'ssq') {
                    betAmount = calculateSSQBetAmount(mainNumbers.length, specialNumbers.length);
                  }

                  if (betAmount >= 15000) {
                    return (
                      <div className="mt-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded-lg border border-orange-200 dark:border-orange-800">
                        <span className="font-medium">提醒:</span> 当前投注金额较高，请理性投注
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}

            {isMobile && (
              <>
                {/* 移动端预览区域 */}
                <NumberPreviewMobile
                  mainNumbers={mainNumbers}
                  specialNumbers={specialNumbers}
                />

                {/* 移动端操作区域*/}
                <NumberOperationsMobile
                  copied={copied}
                  saved={saved}
                  saveNumbers={saveNumbers}
                  copyNumbers={copyNumbers}
                  onHistoryUpdate={setHistoryRecords}
                  generateSmartNumbers={generateSmartNumbers}
                />
              </>
            )}

            {/* 桌面端预览区域 - 移动端隐藏 */}
            {!isMobile && (
              <>
                <NumberPreview
                  mainNumbers={mainNumbers}
                  specialNumbers={specialNumbers}
                />

                {/* 桌面端操作区域 - 移动端隐藏 */}
                <NumberOperations
                  generateSmartNumbers={generateSmartNumbers}
                  mainNumbers={mainNumbers}
                  config={config}
                  specialNumbers={specialNumbers}
                  setMainNumbers={setMainNumbers}
                  setSpecialNumbers={setSpecialNumbers}
                  saveNumbers={saveNumbers}
                  copyNumbers={copyNumbers}
                  copied={copied}
                  saved={saved}
                  kl8NumberCount={selectedType === 'kl8' ? kl8NumberCount : undefined}
                  setKL8NumberCount={setKL8NumberCount}
                  lotteryHistoryData={lotteryHistoryData}
                  ssqHistoryData={ssqHistoryData}
                  kl8HistoryData={kl8HistoryData}
                />
              </>
            )}

            {/* 号码选择区域 */}
            <NumberSelector
              selectedType={selectedType}
              mainNumbers={mainNumbers}
              specialNumbers={specialNumbers}
              statistics={statistics}
              config={config}
              setMainNumbers={setMainNumbers}
              setSpecialNumbers={setSpecialNumbers}
              kl8NumberCount={selectedType === 'kl8' ? (kl8NumberCount || 10) : undefined}
            />
            <FrequencyLegend />
          </div>
        </CardContent>
      </Card>

      {/* 号位频次统计模块 */}
      {statistics && (
        <>
          <NumberSlotStatistics
            selectedType={selectedType}
            config={config}
            lotteryHistoryData={lotteryHistoryData}
            ssqHistoryData={ssqHistoryData}
            statistics={statistics}
          />
        </>
      )}
    </>
  );
}
