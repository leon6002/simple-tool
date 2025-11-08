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

interface NumberGeneratorProps {
  lotteryHistoryData: any[];
  ssqHistoryData: any[];
}

export default function NumberGenerator({
  lotteryHistoryData,
  ssqHistoryData,
}: NumberGeneratorProps) {
  const {
    selectedType,
    algorithm,
    statistics,
    addHistoryRecord,
    setHistoryRecords,
  } = useLotteryStore();

  const config = LOTTERY_CONFIGS[selectedType];
  const [mainNumbers, setMainNumbers] = useState<number[]>([]);
  const [specialNumbers, setSpecialNumbers] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const isMobile = useIsMobile();

  // 保存选号
  const saveNumbers = useCallback(() => {
    if (mainNumbers.length > 0) {
      addHistoryRecord({
        lotteryType: selectedType,
        algorithm: algorithm,
        mainNumbers: mainNumbers,
        specialNumbers: specialNumbers,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000); // 2秒后恢复状态
      console.log("选号已保存到历史记录");
    }
  }, [mainNumbers, specialNumbers, selectedType, algorithm, addHistoryRecord]);

  // 智能选号算法
  const generateSmartNumbers = useCallback(() => {
    try {
      const { mainNumbers, specialNumbers } = selectNumberByAlgorithm({
        algorithm,
        statistics,
        config,
      });
      setMainNumbers(mainNumbers);
      setSpecialNumbers(specialNumbers);
    } catch (error) {
      console.error("生成号码失败:", error);
    }
  }, [algorithm, config, statistics]);

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
            选择或生成您的{selectedType === "dlt" ? "大乐透" : "双色球"}号码
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
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
