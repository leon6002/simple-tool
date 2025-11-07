/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, px } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Ticket,
  Calculator,
  Sparkles,
  Upload,
  Shuffle,
  Copy,
  Check,
  Loader2,
  History,
} from "lucide-react";
import { useUserPreferencesStore } from "@/lib/stores/user-preferences-store";
import toast from "react-hot-toast";
import { ParseResult, LotteryResult, SSQResult } from "@/lib/utils/lottery";
import Image from "next/image";

// 大乐透AI解析数据
interface DLTAIParsedData {
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
interface SSQAIParsedData {
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

type AIParsedLotteryData = DLTAIParsedData | SSQAIParsedData;

type LotteryType = "dlt" | "ssq" | "fc8";

interface LotteryConfig {
  name: string;
  mainRange: [number, number];
  mainCount: number;
  specialRange?: [number, number];
  specialCount?: number;
  description: string;
}

const LOTTERY_CONFIGS: Record<LotteryType, LotteryConfig> = {
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

export default function LotteryPage() {
  const { addRecentlyUsedTool } = useUserPreferencesStore();
  const [selectedType, setSelectedType] = useState<LotteryType>("dlt");
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);
  const [generatedSpecialNumbers, setGeneratedSpecialNumbers] = useState<
    number[]
  >([]);
  const [copied, setCopied] = useState(false);
  const [algorithm, setAlgorithm] = useState<string>("random");
  const [statistics, setStatistics] = useState<{
    frequency: { [key: number]: number };
    omission: { [key: number]: number };
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<Array<{
    id: string;
    lotteryType: string;
    algorithm: string;
    mainNumbers: number[];
    specialNumbers: number[];
    timestamp: number;
    formattedTime: string;
  }>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showDetailedStats, setShowDetailedStats] = useState(false);

  // OCR states
  const [ocrImage, setOcrImage] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<ParseResult | null>(null);
  const [aiParsedData, setAiParsedData] = useState<AIParsedLotteryData | null>(
    null
  );
  const [scanningStage, setScanningStage] = useState<
    "idle" | "ocr" | "parsing"
  >("idle");

  // Prize calculator states
  const [matchedMain, setMatchedMain] = useState<number>(0);
  const [matchedSpecial, setMatchedSpecial] = useState<number>(0);
  const [calculatedPrize, setCalculatedPrize] = useState<string>("");

  // Auto-calculated prize results for OCR
  const [autoPrizeResults, setAutoPrizeResults] = useState<
    Array<{
      betIndex: number;
      matchedMain: number;
      matchedSpecial: number;
      prize: string;
      matchedMainNumbers: number[]; // 命中的前区号码
      matchedSpecialNumbers: number[]; // 命中的后区号码
    }>
  >([]);

  // History states - 大乐透
  const [dltHistoryData, setDltHistoryData] = useState<LotteryResult[]>([]);
  // History states - 双色球
  const [ssqHistoryData, setSsqHistoryData] = useState<SSQResult[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    addRecentlyUsedTool("lottery");
  }, [addRecentlyUsedTool]);

  // 本地存储相关函数
  const STORAGE_KEY = 'lottery_generator_history';

  // 保存到本地存储
  const saveToLocalStorage = useCallback((records: typeof historyRecords) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  }, []);

  // 从本地存储加载
  const loadFromLocalStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const records = JSON.parse(stored);
        setHistoryRecords(records);
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
    }
  }, []);

  // 添加历史记录
  const addHistoryRecord = useCallback((
    lotteryType: string,
    algorithmUsed: string,
    mainNumbers: number[],
    specialNumbers: number[]
  ) => {
    const newRecord = {
      id: Date.now().toString(),
      lotteryType,
      algorithm: algorithmUsed,
      mainNumbers,
      specialNumbers,
      timestamp: Date.now(),
      formattedTime: new Date().toLocaleString('zh-CN')
    };

    const updatedRecords = [newRecord, ...historyRecords];
    setHistoryRecords(updatedRecords);
    saveToLocalStorage(updatedRecords);
  }, [historyRecords, saveToLocalStorage]);

  // 清空历史记录
  const clearHistoryRecords = useCallback(() => {
    setHistoryRecords([]);
    localStorage.removeItem(STORAGE_KEY);
    toast.success('历史记录已清空');
  }, []);

  // 导出历史记录
  const exportHistoryRecords = useCallback(() => {
    try {
      const dataStr = JSON.stringify(historyRecords, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

      const exportFileDefaultName = `lottery-history-${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      toast.success('历史记录已导出');
    } catch (error) {
      toast.error('导出失败');
    }
  }, [historyRecords]);

  // 导入历史记录
  const importHistoryRecords = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedRecords = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedRecords)) {
          setHistoryRecords(importedRecords);
          saveToLocalStorage(importedRecords);
          toast.success(`成功导入 ${importedRecords.length} 条历史记录`);
        } else {
          toast.error('文件格式不正确');
        }
      } catch (error) {
        toast.error('导入失败，文件格式不正确');
      }
    };
    reader.readAsText(file);

    // 清空input值，允许重复导入同一文件
    event.target.value = '';
  }, [saveToLocalStorage]);

  // Fetch lottery history on mount
  useEffect(() => {
    fetchLotteryHistory();
    loadFromLocalStorage(); // 加载本地历史记录
  }, [loadFromLocalStorage]);

  // Auto analyze statistics when history data is loaded
  useEffect(() => {
    if (dltHistoryData.length > 0 || ssqHistoryData.length > 0) {
      analyzeStatistics();
    }
  }, [dltHistoryData.length, ssqHistoryData.length]);

  const fetchLotteryHistory = async () => {
    setHistoryLoading(true);
    try {
      // 并行加载大乐透和双色球历史数据
      const [dltResponse, ssqResponse] = await Promise.all([
        fetch("/api/lottery/history"),
        fetch("/api/lottery/ssq-history"),
      ]);

      const dltData = await dltResponse.json();
      const ssqData = await ssqResponse.json();

      console.log("DLT history API response:", dltData);
      console.log("SSQ history API response:", ssqData);

      if (dltData.success && dltData.data) {
        setDltHistoryData(dltData.data);
        console.log("DLT history data loaded:", dltData.data.length, "records");
      }

      // 双色球数据直接是数组
      if (Array.isArray(ssqData) && ssqData.length > 0) {
        setSsqHistoryData(ssqData);
        console.log("SSQ history data loaded:", ssqData.length, "records");
      }

      if (
        (!dltData.success || !dltData.data) &&
        (!Array.isArray(ssqData) || ssqData.length === 0)
      ) {
        toast.error("获取开奖数据失败");
      }
    } catch (error) {
      console.error("获取开奖数据失败:", error);
      toast.error("获取开奖数据失败");
    } finally {
      setHistoryLoading(false);
    }
  };

  const config = LOTTERY_CONFIGS[selectedType];

  // 分析历史数据统计
  const analyzeStatistics = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const historyData = selectedType === "ssq" ? ssqHistoryData : dltHistoryData;
      if (historyData.length === 0) {
        toast.error("暂无历史数据进行分析");
        return;
      }

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
        const mainNumbers = selectedType === "ssq"
          ? draw.redBalls.map(n => parseInt(n))
          : draw.numbers.map(n => parseInt(n));

        mainNumbers.forEach(num => {
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
          draw.specialNumbers.forEach(num => {
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

      setStatistics({ frequency, omission });
      toast.success("统计分析完成！");
    } catch (error) {
      console.error("统计分析失败:", error);
      toast.error("统计分析失败");
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedType, config, dltHistoryData, ssqHistoryData]);

  // 获取高频号码
  const getHighFrequencyNumbers = useCallback((count: number, isSpecial: boolean = false) => {
    if (!statistics) return [];

    const maxNum = isSpecial
      ? (config.specialRange?.[1] || 12)
      : config.mainRange[1];

    const minNum = isSpecial ? 1 : config.mainRange[0];

    const numbers = [];
    for (let i = minNum; i <= maxNum; i++) {
      numbers.push({ num: i, freq: statistics.frequency[i] });
    }

    return numbers
      .sort((a, b) => b.freq - a.freq)
      .slice(0, count)
      .map(item => item.num);
  }, [statistics, config]);

  // 获取冷门号码（遗漏最多的）
  const getColdNumbers = useCallback((count: number, isSpecial: boolean = false) => {
    if (!statistics) return [];

    const maxNum = isSpecial
      ? (config.specialRange?.[1] || 12)
      : config.mainRange[1];

    const minNum = isSpecial ? 1 : config.mainRange[0];

    const numbers = [];
    for (let i = minNum; i <= maxNum; i++) {
      numbers.push({ num: i, omission: statistics.omission[i] });
    }

    return numbers
      .sort((a, b) => b.omission - a.omission)
      .slice(0, count)
      .map(item => item.num);
  }, [statistics, config]);

  // 智能选号算法
  const generateSmartNumbers = useCallback(() => {
    const mainNumbers: number[] = [];
    const specialNumbers: number[] = [];

    try {
      switch (algorithm) {
        case "frequency":
          // 高频算法：优先选择高频号码
          const hotMainNumbers = getHighFrequencyNumbers(config.mainCount * 2, false);
          if (hotMainNumbers.length >= config.mainCount) {
            const selected = hotMainNumbers
              .sort(() => Math.random() - 0.5)
              .slice(0, config.mainCount)
              .sort((a, b) => a - b);
            mainNumbers.push(...selected);
          } else {
            // 不足时补充随机号码
            mainNumbers.push(...hotMainNumbers);
            while (mainNumbers.length < config.mainCount) {
              const num = Math.floor(Math.random() * (config.mainRange[1] - config.mainRange[0] + 1)) + config.mainRange[0];
              if (!mainNumbers.includes(num)) {
                mainNumbers.push(num);
              }
            }
            mainNumbers.sort((a, b) => a - b);
          }

          if (config.specialRange && config.specialCount) {
            const hotSpecialNumbers = getHighFrequencyNumbers(config.specialCount * 2, true);
            if (hotSpecialNumbers.length >= config.specialCount) {
              const selected = hotSpecialNumbers
                .sort(() => Math.random() - 0.5)
                .slice(0, config.specialCount)
                .sort((a, b) => a - b);
              specialNumbers.push(...selected);
            } else {
              specialNumbers.push(...hotSpecialNumbers);
              while (specialNumbers.length < config.specialCount) {
                const num = Math.floor(Math.random() * (config.specialRange[1] - config.specialRange[0] + 1)) + config.specialRange[0];
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
          const coldMainNumbers = getColdNumbers(config.mainCount * 2, false);
          if (coldMainNumbers.length >= config.mainCount) {
            const selected = coldMainNumbers
              .sort(() => Math.random() - 0.5)
              .slice(0, config.mainCount)
              .sort((a, b) => a - b);
            mainNumbers.push(...selected);
          } else {
            mainNumbers.push(...coldMainNumbers);
            while (mainNumbers.length < config.mainCount) {
              const num = Math.floor(Math.random() * (config.mainRange[1] - config.mainRange[0] + 1)) + config.mainRange[0];
              if (!mainNumbers.includes(num)) {
                mainNumbers.push(num);
              }
            }
            mainNumbers.sort((a, b) => a - b);
          }

          if (config.specialRange && config.specialCount) {
            const coldSpecialNumbers = getColdNumbers(config.specialCount * 2, true);
            if (coldSpecialNumbers.length >= config.specialCount) {
              const selected = coldSpecialNumbers
                .sort(() => Math.random() - 0.5)
                .slice(0, config.specialCount)
                .sort((a, b) => a - b);
              specialNumbers.push(...selected);
            } else {
              specialNumbers.push(...coldSpecialNumbers);
              while (specialNumbers.length < config.specialCount) {
                const num = Math.floor(Math.random() * (config.specialRange[1] - config.specialRange[0] + 1)) + config.specialRange[0];
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
          const hotMain = getHighFrequencyNumbers(Math.ceil(config.mainCount / 2), false);
          const coldMain = getColdNumbers(Math.ceil(config.mainCount / 2), false);
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
              const num = Math.floor(Math.random() * (config.mainRange[1] - config.mainRange[0] + 1)) + config.mainRange[0];
              if (!mainNumbers.includes(num)) {
                mainNumbers.push(num);
              }
            }
            mainNumbers.sort((a, b) => a - b);
          }

          if (config.specialRange && config.specialCount) {
            const hotSpecial = getHighFrequencyNumbers(Math.ceil(config.specialCount / 2), true);
            const coldSpecial = getColdNumbers(Math.ceil(config.specialCount / 2), true);
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
                const num = Math.floor(Math.random() * (config.specialRange[1] - config.specialRange[0] + 1)) + config.specialRange[0];
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
            const num = Math.floor(Math.random() * (config.mainRange[1] - config.mainRange[0] + 1)) + config.mainRange[0];
            if (!mainNumbers.includes(num)) {
              mainNumbers.push(num);
            }
          }
          mainNumbers.sort((a, b) => a - b);

          if (config.specialRange && config.specialCount) {
            while (specialNumbers.length < config.specialCount) {
              const num = Math.floor(Math.random() * (config.specialRange[1] - config.specialRange[0] + 1)) + config.specialRange[0];
              if (!specialNumbers.includes(num)) {
                specialNumbers.push(num);
              }
            }
            specialNumbers.sort((a, b) => a - b);
          }
          break;
      }

      setGeneratedNumbers(mainNumbers);
      setGeneratedSpecialNumbers(specialNumbers);

      const algorithmName = {
        random: "随机",
        frequency: "高频",
        omission: "冷门",
        balanced: "均衡"
      }[algorithm];

      // 保存历史记录
      addHistoryRecord(
        LOTTERY_CONFIGS[selectedType].name,
        algorithmName,
        mainNumbers,
        specialNumbers
      );

      toast.success(`${algorithmName}算法生成成功！`);
    } catch (error) {
      console.error("生成号码失败:", error);
      toast.error("生成号码失败，请重试");
    }
  }, [algorithm, config, getHighFrequencyNumbers, getColdNumbers, addHistoryRecord, selectedType]);

  // Generate random lottery numbers (兼容原来的函数名)
  const generateNumbers = useCallback(() => {
    if (algorithm === "random") {
      generateSmartNumbers();
    } else {
      if (!statistics) {
        toast.error("请先进行统计分析");
        return;
      }
      generateSmartNumbers();
    }
  }, [algorithm, statistics, generateSmartNumbers]);

  // Copy numbers to clipboard
  const copyNumbers = useCallback(() => {
    const text =
      generatedSpecialNumbers.length > 0
        ? `${generatedNumbers.join(", ")} + ${generatedSpecialNumbers.join(
            ", "
          )}`
        : generatedNumbers.join(", ");

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("已复制到剪贴板");
    setTimeout(() => setCopied(false), 2000);
  }, [generatedNumbers, generatedSpecialNumbers]);

  // Auto calculate prizes for OCR results
  const autoCalculatePrizes = useCallback(
    (
      ocrEntries: Array<{ numbers: number[]; specialNumbers: number[] }>,
      issueNumber: string | null,
      lotteryType: string = "dlt"
    ) => {
      console.log("autoCalculatePrizes called with:", {
        issueNumber,
        lotteryType,
        dltHistoryDataLength: dltHistoryData.length,
        ssqHistoryDataLength: ssqHistoryData.length,
        ocrEntriesLength: ocrEntries.length,
      });

      // 根据彩票类型选择对应的历史数据
      const historyData =
        lotteryType === "ssq" ? ssqHistoryData : dltHistoryData;

      if (!issueNumber || historyData.length === 0) {
        console.log("Missing issueNumber or historyData");
        toast.error("无法自动计算：缺少期号或开奖数据");
        return;
      }

      // Find the winning numbers for the issue
      console.log("Searching for issue:", issueNumber);
      console.log(
        "Available issues:",
        historyData.map((d) => d.issue)
      );

      // 根据彩票类型查找开奖数据
      let winningMainNumbers: number[] = [];
      let winningSpecialNumbers: number[] = [];

      if (lotteryType === "ssq") {
        // 双色球：从 SSQResult 中查找
        const ssqDraw = (historyData as SSQResult[]).find(
          (draw) =>
            draw.issue === issueNumber || draw.issue.endsWith(issueNumber)
        );

        if (!ssqDraw) {
          console.log("SSQ winning draw not found for issue:", issueNumber);
          toast.error(`未找到第 ${issueNumber} 期的双色球开奖数据`);
          return;
        }

        console.log("Found SSQ winning draw:", ssqDraw);
        winningMainNumbers = ssqDraw.redBalls.map((n) => parseInt(n));
        winningSpecialNumbers = [parseInt(ssqDraw.blueBall)];
      } else {
        // 大乐透：从 LotteryResult 中查找
        let dltDraw = (historyData as LotteryResult[]).find(
          (draw) => draw.issue === issueNumber
        );

        // If not found, try matching the last 5 digits (e.g., "25092" matches "2025092")
        if (!dltDraw && issueNumber.length === 5) {
          dltDraw = (historyData as LotteryResult[]).find((draw) =>
            draw.issue.endsWith(issueNumber)
          );
          console.log("Trying partial match, found:", dltDraw);
        }

        // If still not found, try matching without year prefix
        if (!dltDraw) {
          const shortIssue = issueNumber.slice(-5); // Get last 5 digits
          dltDraw = (historyData as LotteryResult[]).find((draw) =>
            draw.issue.endsWith(shortIssue)
          );
          console.log("Trying short issue match, found:", dltDraw);
        }

        if (!dltDraw) {
          console.log("DLT winning draw not found for issue:", issueNumber);
          toast.error(`未找到第 ${issueNumber} 期的大乐透开奖数据`);
          return;
        }

        console.log("Found DLT winning draw:", dltDraw);
        winningMainNumbers = dltDraw.numbers.map((n) => parseInt(n));
        winningSpecialNumbers = dltDraw.specialNumbers.map((n) => parseInt(n));
      }

      const results = ocrEntries.map((entry, index) => {
        // Find which numbers matched
        const matchedMainNumbers = entry.numbers.filter((num) =>
          winningMainNumbers.includes(num)
        );
        const matchedSpecialNumbers = entry.specialNumbers.filter((num) =>
          winningSpecialNumbers.includes(num)
        );

        const matchedMain = matchedMainNumbers.length;
        const matchedSpecial = matchedSpecialNumbers.length;

        // Calculate prize based on lottery type
        let prize = "";

        if (lotteryType === "dlt") {
          if (matchedMain === 5 && matchedSpecial === 2) {
            prize = "一等奖（浮动奖金）";
          } else if (matchedMain === 5 && matchedSpecial === 1) {
            prize = "二等奖（浮动奖金）";
          } else if (matchedMain === 5 && matchedSpecial === 0) {
            prize = "三等奖（10,000元）";
          } else if (matchedMain === 4 && matchedSpecial === 2) {
            prize = "四等奖（3,000元）";
          } else if (matchedMain === 4 && matchedSpecial === 1) {
            prize = "五等奖（300元）";
          } else if (
            (matchedMain === 3 && matchedSpecial === 2) ||
            (matchedMain === 4 && matchedSpecial === 0)
          ) {
            prize = "六等奖（200元）";
          } else if (
            (matchedMain === 3 && matchedSpecial === 1) ||
            (matchedMain === 2 && matchedSpecial === 2)
          ) {
            prize = "七等奖（100元）";
          } else if (
            (matchedMain === 3 && matchedSpecial === 0) ||
            (matchedMain === 1 && matchedSpecial === 2) ||
            (matchedMain === 2 && matchedSpecial === 1) ||
            (matchedMain === 0 && matchedSpecial === 2)
          ) {
            prize = "八等奖（15元）";
          } else {
            prize = "未中奖";
          }
        } else if (lotteryType === "ssq") {
          if (matchedMain === 6 && matchedSpecial === 1) {
            prize = "一等奖（浮动奖金）";
          } else if (matchedMain === 6 && matchedSpecial === 0) {
            prize = "二等奖（浮动奖金）";
          } else if (matchedMain === 5 && matchedSpecial === 1) {
            prize = "三等奖（3,000元）";
          } else if (
            (matchedMain === 5 && matchedSpecial === 0) ||
            (matchedMain === 4 && matchedSpecial === 1)
          ) {
            prize = "四等奖（200元）";
          } else if (
            (matchedMain === 4 && matchedSpecial === 0) ||
            (matchedMain === 3 && matchedSpecial === 1)
          ) {
            prize = "五等奖（10元）";
          } else if (
            (matchedMain === 2 && matchedSpecial === 1) ||
            (matchedMain === 1 && matchedSpecial === 1) ||
            (matchedMain === 0 && matchedSpecial === 1)
          ) {
            prize = "六等奖（5元）";
          } else {
            prize = "未中奖";
          }
        }

        return {
          betIndex: index,
          matchedMain,
          matchedSpecial,
          prize,
          matchedMainNumbers,
          matchedSpecialNumbers,
        };
      });

      setAutoPrizeResults(results);

      // Show summary toast
      const winningBets = results.filter((r) => r.prize !== "未中奖");
      if (winningBets.length > 0) {
        toast.success(`恭喜！有 ${winningBets.length} 注中奖！`);
      } else {
        toast("很遗憾，本次未中奖");
      }
    },
    [dltHistoryData, ssqHistoryData]
  );

  // Handle image upload for OCR - 两步识别
  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error("请上传图片文件");
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("图片大小不能超过10MB");
        return;
      }

      setOcrLoading(true);
      setOcrResult(null);
      setAiParsedData(null);
      setAutoPrizeResults([]);
      setScanningStage("idle");

      try {
        // Convert to base64
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64 = event.target?.result as string;
          setOcrImage(base64);

          // 第一步：OCR文字识别
          setScanningStage("ocr");
          toast.loading("正在识别图片文字...", { id: "ocr-step1" });
          const ocrResponse = await fetch("/api/lottery/ocr-text", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              image: base64,
            }),
          });

          if (!ocrResponse.ok) {
            throw new Error("OCR识别失败");
          }

          const ocrData = await ocrResponse.json();
          console.log("OCR text response:", ocrData);

          if (!ocrData.success || !ocrData.ocrText) {
            toast.error("未能识别出文字", { id: "ocr-step1" });
            return;
          }

          toast.success(
            `识别成功！检测到${
              ocrData.lotteryType === "dlt"
                ? "大乐透"
                : ocrData.lotteryType === "ssq"
                ? "双色球"
                : "未知类型"
            }彩票`,
            { id: "ocr-step1" }
          );

          // 第二步：AI解析
          setScanningStage("parsing");
          toast.loading("正在AI解析识别结果...", { id: "ocr-step2" });
          const parseResponse = await fetch("/api/lottery/parse-ai", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ocrText: ocrData.ocrText,
              lotteryType: ocrData.lotteryType,
            }),
          });

          if (!parseResponse.ok) {
            throw new Error("AI解析失败");
          }

          const parseData = await parseResponse.json();
          console.log("AI parse response:", parseData);

          if (!parseData.success || !parseData.parsedData) {
            toast.error("AI解析失败", { id: "ocr-step2" });
            return;
          }

          toast.success("解析成功！", { id: "ocr-step2" });
          setScanningStage("idle");

          // 设置解析结果
          const aiData = parseData.parsedData;
          setAiParsedData(aiData);

          // 转换为统一格式供后续使用
          const lotteryType = parseData.lotteryType;
          let entries: Array<{ numbers: number[]; specialNumbers: number[] }> =
            [];

          if (lotteryType === "dlt") {
            // 大乐透格式
            const dltData = aiData as DLTAIParsedData;
            entries = dltData.bets.map((bet) => ({
              numbers: bet.front_numbers,
              specialNumbers: bet.back_numbers,
            }));
          } else if (lotteryType === "ssq") {
            // 双色球格式：red_balls -> numbers, blue_ball -> specialNumbers
            const ssqData = aiData as SSQAIParsedData;
            entries = ssqData.bets.map((bet) => ({
              numbers: bet.red_balls.map((n) => parseInt(n)),
              specialNumbers: [parseInt(bet.blue_ball)],
            }));
          }

          const parsedResult: ParseResult = {
            type: lotteryType,
            issueNumber: aiData.issue_number || null,
            drawDate: aiData.draw_date || null,
            totalCost: aiData.total_amount || null,
            entries,
          };

          setOcrResult(parsedResult);

          // Auto calculate prizes
          if (entries.length > 0 && aiData.issue_number) {
            console.log("Calling autoCalculatePrizes with:", {
              entries,
              issueNumber: aiData.issue_number,
              lotteryType,
            });
            autoCalculatePrizes(entries, aiData.issue_number, lotteryType);
          }
        };

        reader.readAsDataURL(file);
      } catch (error) {
        console.error("OCR error:", error);
        toast.error("图片识别失败，请重试");
        setScanningStage("idle");
      } finally {
        setOcrLoading(false);
      }
    },
    [autoCalculatePrizes]
  );

  // Calculate prize based on matched numbers
  const calculatePrize = useCallback(() => {
    let prize = "";

    if (selectedType === "dlt") {
      if (matchedMain === 5 && matchedSpecial === 2) {
        prize = "一等奖（浮动奖金）";
      } else if (matchedMain === 5 && matchedSpecial === 1) {
        prize = "二等奖（浮动奖金）";
      } else if (matchedMain === 5 && matchedSpecial === 0) {
        prize = "三等奖（10,000元）";
      } else if (matchedMain === 4 && matchedSpecial === 2) {
        prize = "四等奖（3,000元）";
      } else if (matchedMain === 4 && matchedSpecial === 1) {
        prize = "五等奖（300元）";
      } else if (
        (matchedMain === 3 && matchedSpecial === 2) ||
        (matchedMain === 4 && matchedSpecial === 0)
      ) {
        prize = "六等奖（200元）";
      } else if (
        (matchedMain === 3 && matchedSpecial === 1) ||
        (matchedMain === 2 && matchedSpecial === 2)
      ) {
        prize = "七等奖（100元）";
      } else if (
        (matchedMain === 3 && matchedSpecial === 0) ||
        (matchedMain === 1 && matchedSpecial === 2) ||
        (matchedMain === 2 && matchedSpecial === 1) ||
        (matchedMain === 0 && matchedSpecial === 2)
      ) {
        prize = "八等奖（15元）";
      } else {
        prize = "未中奖";
      }
    } else if (selectedType === "ssq") {
      if (matchedMain === 6 && matchedSpecial === 1) {
        prize = "一等奖（浮动奖金）";
      } else if (matchedMain === 6 && matchedSpecial === 0) {
        prize = "二等奖（浮动奖金）";
      } else if (matchedMain === 5 && matchedSpecial === 1) {
        prize = "三等奖（3,000元）";
      } else if (
        (matchedMain === 5 && matchedSpecial === 0) ||
        (matchedMain === 4 && matchedSpecial === 1)
      ) {
        prize = "四等奖（200元）";
      } else if (
        (matchedMain === 4 && matchedSpecial === 0) ||
        (matchedMain === 3 && matchedSpecial === 1)
      ) {
        prize = "五等奖（10元）";
      } else if (
        (matchedMain === 2 && matchedSpecial === 1) ||
        (matchedMain === 1 && matchedSpecial === 1) ||
        (matchedMain === 0 && matchedSpecial === 1)
      ) {
        prize = "六等奖（5元）";
      } else {
        prize = "未中奖";
      }
    }

    setCalculatedPrize(prize);
    if (prize !== "未中奖") {
      toast.success(`恭喜中奖：${prize}`);
    } else {
      toast("未中奖，再接再厉！");
    }
  }, [selectedType, matchedMain, matchedSpecial]);

  return (
    <div className="container mx-auto max-w-6xl py-12 md:py-16 lg:py-20 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-12 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20"
          >
            <Ticket className="h-8 w-8 text-purple-600" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            彩票工具
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            提供彩票奖金计算和号码生成功能
          </p>
        </div>

        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              奖金计算
            </TabsTrigger>
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              号码生成器
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              开奖历史
            </TabsTrigger>
          </TabsList>

          {/* Prize Calculator Tab */}
          <TabsContent value="calculator">
            <div className="space-y-6">
              {/* 整合式布局：彩票类型选择和奖金计算合并 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 左侧：照片识别 */}
                <Card className="border-border/50 shadow-xl shadow-purple-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      彩票照片识别
                    </CardTitle>
                    <CardDescription>上传彩票照片，自动识别号码并计算奖金</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Label
                        htmlFor="lottery-upload"
                        className="flex-shrink-0 cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-medium hover:opacity-90 transition-opacity"
                      >
                        <Upload className="h-4 w-4" />
                        {ocrLoading ? "识别中..." : "选择图片"}
                      </Label>
                      <Input
                        id="lottery-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={ocrLoading}
                        className="hidden"
                      />
                      {ocrLoading && (
                        <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                      )}
                      {ocrImage && !ocrLoading && (
                        <span className="text-sm text-muted-foreground">
                          图片已上传
                        </span>
                      )}
                    </div>

                    {/* 图片预览 */}
                    {ocrImage && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          预览图片：
                        </p>
                        <div className="relative w-full max-w-[320px] mx-auto overflow-hidden rounded-lg">
                          <img
                            src={ocrImage}
                            alt="Uploaded lottery ticket"
                            className="w-full h-auto rounded-lg border border-border shadow-md"
                          />

                          {/* 扫描动画覆盖层 */}
                          {scanningStage !== "idle" && (
                            <>
                              {/* 玻璃质感扫描线 */}
                              <motion.div
                                className="absolute inset-0 pointer-events-none"
                                style={{ overflow: "hidden" }}
                              >
                                <motion.div
                                  className="absolute left-0 right-0 h-80 bg-linear-to-b from-transparent via-white/10 to-transparent"
                                  style={{
                                    boxShadow:
                                      "0 0px 30px rgba(255, 255, 255, 0.5)",
                                  }}
                                  initial={{ y: "-100%" }}
                                  animate={{ y: "150%" }}
                                  transition={{
                                    duration: 8,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                  }}
                                />
                              </motion.div>

                              {/* 扫描状态文字覆盖层 */}
                              <motion.div
                                className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/50 rounded-lg "
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                <div className="text-center">
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{
                                      duration: 1,
                                      repeat: Infinity,
                                      ease: "linear",
                                    }}
                                    className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full mx-auto mb-3"
                                  />
                                  <p className="text-gray-800 dark:text-gray-200 font-semibold text-lg">
                                    {scanningStage === "ocr"
                                      ? "AI识别中..."
                                      : "已识别，AI解析中..."}
                                  </p>
                                </div>
                              </motion.div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 识别结果 */}
                    {ocrResult && (
                      <div className="space-y-4">
                        <p className="text-sm font-medium text-muted-foreground">
                          识别结果：
                        </p>

                        {/* 彩票信息卡片 */}
                        <div className="p-3 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">期数</p>
                              <p className="font-semibold text-xs">{ocrResult.issueNumber || "未识别"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">开奖日期</p>
                              <p className="font-semibold text-xs">{ocrResult.drawDate || "未识别"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">成本</p>
                              <p className="font-semibold text-xs">
                                {ocrResult.totalCost !== null ? `${ocrResult.totalCost}元` : "未识别"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 开奖号码显示 */}
                        {ocrResult.issueNumber &&
                          (() => {
                            const lotteryType = ocrResult.type || "dlt";

                            if (lotteryType === "ssq") {
                              const ssqDraw = ssqHistoryData.find(
                                (draw) =>
                                  draw.issue === ocrResult.issueNumber ||
                                  draw.issue.endsWith(ocrResult.issueNumber!)
                              );

                              if (ssqDraw) {
                                return (
                                  <div className="p-3 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-lg border-2 border-amber-300 dark:border-amber-700">
                                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2 text-center">
                                      第 {ssqDraw.issue} 期开奖号码（双色球）
                                    </p>
                                    <div className="flex flex-wrap items-center justify-center gap-1">
                                      {ssqDraw.redBalls.map((num, idx) => (
                                        <div
                                          key={idx}
                                          className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-red-600 border-2 border-red-700 text-white flex items-center justify-center font-bold text-xs shadow-md"
                                        >
                                          {num}
                                        </div>
                                      ))}
                                      <span className="text-sm font-bold text-amber-700 dark:text-amber-400 mx-1">
                                        +
                                      </span>
                                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 border-2 border-blue-800 text-white flex items-center justify-center font-bold text-xs shadow-md">
                                        {ssqDraw.blueBall}
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                            } else {
                              let dltDraw = dltHistoryData.find(
                                (draw) => draw.issue === ocrResult.issueNumber
                              );

                              if (!dltDraw && ocrResult.issueNumber && ocrResult.issueNumber.length === 5) {
                                dltDraw = dltHistoryData.find((draw) =>
                                  draw.issue.endsWith(ocrResult.issueNumber!)
                                );
                              }

                              if (!dltDraw && ocrResult.issueNumber) {
                                const shortIssue = ocrResult.issueNumber.slice(-5);
                                dltDraw = dltHistoryData.find((draw) =>
                                  draw.issue.endsWith(shortIssue)
                                );
                              }

                              if (dltDraw) {
                                return (
                                  <div className="p-3 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-lg border-2 border-amber-300 dark:border-amber-700">
                                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2 text-center">
                                      第 {dltDraw.issue} 期开奖号码（大乐透）
                                    </p>
                                    <div className="flex flex-wrap items-center justify-center gap-1">
                                      {dltDraw.numbers.map((num, idx) => (
                                        <div
                                          key={idx}
                                          className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-red-600 border-2 border-red-700 text-white flex items-center justify-center font-bold text-xs shadow-md"
                                        >
                                          {num}
                                        </div>
                                      ))}
                                      <span className="text-sm font-bold text-amber-700 dark:text-amber-400 mx-1">
                                        +
                                      </span>
                                      {dltDraw.specialNumbers.map((num, idx) => (
                                        <div
                                          key={idx}
                                          className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 border-2 border-blue-800 text-white flex items-center justify-center font-bold text-xs shadow-md"
                                        >
                                          {num}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              }
                            }
                            return null;
                          })()}

                        {/* 号码列表 - 紧凑版 */}
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {ocrResult.entries.map((entry, entryIdx) => {
                            const prizeResult = autoPrizeResults.find(
                              (r) => r.betIndex === entryIdx
                            );

                            return (
                              <div
                                key={entry.numbers.join("-") + "-" + entry.specialNumbers.join("-")}
                                className={`p-2 rounded-lg border ${
                                  prizeResult && prizeResult.prize !== "未中奖"
                                    ? "bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border-green-500/30"
                                    : "bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-purple-500/20"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="text-xs font-semibold text-muted-foreground">
                                    第 {entryIdx + 1} 注
                                  </span>
                                  {prizeResult && (
                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                      prizeResult.prize !== "未中奖"
                                        ? "bg-green-500/20 text-green-700 dark:text-green-400"
                                        : "bg-gray-500/20 text-gray-600 dark:text-gray-400"
                                    }`}>
                                      {prizeResult.prize}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-1">
                                  {entry.numbers.map((num, idx) => {
                                    const isMatched = prizeResult?.matchedMainNumbers.includes(num);
                                    return (
                                      <div
                                        key={idx}
                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                                          isMatched
                                            ? "bg-gradient-to-br from-red-500 to-red-600 border-red-500 text-white"
                                            : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                                        }`}
                                      >
                                        {num}
                                      </div>
                                    );
                                  })}
                                  {entry.specialNumbers.length > 0 && (
                                    <>
                                      <span className="text-xs font-bold text-muted-foreground mx-0.5">+</span>
                                      {entry.specialNumbers.map((num, idx) => {
                                        const isMatched = prizeResult?.matchedSpecialNumbers.includes(num);
                                        return (
                                          <div
                                            key={idx}
                                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                                              isMatched
                                                ? "bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-blue-500 text-white"
                                                : "border-2 border-blue-500 text-white"
                                            }`}
                                          >
                                            {num}
                                          </div>
                                        );
                                      })}
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 右侧：手动计算和彩票类型选择 */}
                <div className="space-y-6">
                  {/* 彩票类型选择和手动计算 */}
                  <Card className="border-border/50 shadow-xl shadow-purple-500/5">
                    <CardHeader>
                      <CardTitle>手动奖金计算</CardTitle>
                      <CardDescription>选择彩票类型并输入中奖号码数量</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* 彩票类型选择 */}
                      <div className="space-y-3">
                        <Label>选择彩票类型</Label>
                        <div className="flex flex-wrap gap-2">
                          {(Object.keys(LOTTERY_CONFIGS) as LotteryType[]).map((type) => (
                            <Button
                              key={type}
                              variant={selectedType === type ? "default" : "outline"}
                              onClick={() => setSelectedType(type)}
                              size="sm"
                              className={
                                selectedType === type
                                  ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white"
                                  : ""
                              }
                            >
                              {LOTTERY_CONFIGS[type].name}
                            </Button>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {config.description}
                        </p>
                      </div>

                      {selectedType !== "fc8" && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm">
                                {selectedType === "dlt" ? "前区" : "红球"}中奖个数
                              </Label>
                              <Input
                                type="number"
                                min="0"
                                max={config.mainCount}
                                value={matchedMain}
                                onChange={(e) => setMatchedMain(parseInt(e.target.value) || 0)}
                                className="text-center"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">
                                {selectedType === "dlt" ? "后区" : "蓝球"}中奖个数
                              </Label>
                              <Input
                                type="number"
                                min="0"
                                max={config.specialCount}
                                value={matchedSpecial}
                                onChange={(e) => setMatchedSpecial(parseInt(e.target.value) || 0)}
                                className="text-center"
                              />
                            </div>
                          </div>

                          <Button
                            onClick={calculatePrize}
                            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white"
                          >
                            <Calculator className="h-4 w-4 mr-2" />
                            计算奖金
                          </Button>

                          {calculatedPrize && (
                            <div className="p-4 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                              <p className="text-center text-lg font-bold">
                                {calculatedPrize}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* AI解析额外信息 - 如果有OCR结果的话 */}
                  {aiParsedData && (
                    <Card className="border-border/50 shadow-xl shadow-purple-500/5">
                      <CardHeader>
                        <CardTitle>详细信息</CardTitle>
                        <CardDescription>AI解析的额外彩票信息</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">彩票类型：</span>
                              <span className="font-medium ml-1">{aiParsedData.lottery_type}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">票据类型：</span>
                              <span className="font-medium ml-1">{aiParsedData.ticket_type}</span>
                            </div>
                            {"multiple" in aiParsedData && (
                              <div>
                                <span className="text-muted-foreground">倍数：</span>
                                <span className="font-medium ml-1">
                                  {(aiParsedData as DLTAIParsedData).multiple}倍
                                </span>
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground">公益金：</span>
                              <span className="font-medium ml-1">{aiParsedData.contribution_to_charity}元</span>
                            </div>
                          </div>
                        </div>

                        {"store_info" in aiParsedData && (aiParsedData as any).store_info?.address && (
                          <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <div className="text-xs space-y-1">
                              <div>
                                <span className="text-muted-foreground">销售点：</span>
                                <span className="font-medium ml-1">{(aiParsedData as any).store_info.address}</span>
                              </div>
                              {"print_time" in aiParsedData && (
                                <div>
                                  <span className="text-muted-foreground">打印时间：</span>
                                  <span className="font-medium ml-1">{aiParsedData.print_time}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Number Generator Tab */}
          <TabsContent value="generator">
            <div className="space-y-6">
              {/* 主要功能区 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 左侧：彩票类型和算法选择 */}
                <Card className="border-border/50 shadow-xl shadow-purple-500/5 lg:col-span-1">
                  <CardHeader>
                    <CardTitle>智能选号设置</CardTitle>
                    <CardDescription>选择彩票类型和生成算法</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 彩票类型选择 */}
                    <div className="space-y-3">
                      <Label>彩票类型</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {(Object.keys(LOTTERY_CONFIGS) as LotteryType[]).map((type) => (
                          <Button
                            key={type}
                            variant={selectedType === type ? "default" : "outline"}
                            onClick={() => setSelectedType(type)}
                            size="sm"
                            className={`justify-start ${selectedType === type
                              ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white"
                              : ""}`}
                          >
                            {LOTTERY_CONFIGS[type].name}
                          </Button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {config.description}
                      </p>
                    </div>

                    {/* 算法选择 */}
                    <div className="space-y-3">
                      <Label>选号算法</Label>
                      <div className="space-y-2">
                        <Button
                          variant={algorithm === "random" ? "default" : "outline"}
                          onClick={() => setAlgorithm("random")}
                          size="sm"
                          className={`w-full justify-start ${algorithm === "random"
                            ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                            : ""}`}
                        >
                          🎲 完全随机
                        </Button>
                        <Button
                          variant={algorithm === "frequency" ? "default" : "outline"}
                          onClick={() => setAlgorithm("frequency")}
                          size="sm"
                          className={`w-full justify-start ${algorithm === "frequency"
                            ? "bg-gradient-to-r from-orange-600 to-red-600 text-white"
                            : ""}`}
                          disabled={!statistics}
                        >
                          🔥 高频优先
                        </Button>
                        <Button
                          variant={algorithm === "omission" ? "default" : "outline"}
                          onClick={() => setAlgorithm("omission")}
                          size="sm"
                          className={`w-full justify-start ${algorithm === "omission"
                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                            : ""}`}
                          disabled={!statistics}
                        >
                          ❄️ 冷门追号
                        </Button>
                        <Button
                          variant={algorithm === "balanced" ? "default" : "outline"}
                          onClick={() => setAlgorithm("balanced")}
                          size="sm"
                          className={`w-full justify-start ${algorithm === "balanced"
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            : ""}`}
                          disabled={!statistics}
                        >
                          ⚖️ 均衡选号
                        </Button>
                      </div>
                      {!statistics && algorithm !== "random" && (
                        <p className="text-xs text-orange-600">
                          请先进行统计分析
                        </p>
                      )}
                    </div>

                    {/* 统计分析按钮 */}
                    <div className="space-y-3">
                      <Button
                        onClick={analyzeStatistics}
                        variant="outline"
                        className="w-full"
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            分析中...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            统计分析
                          </>
                        )}
                      </Button>
                      {statistics && (
                        <p className="text-xs text-green-600 text-center">
                          ✓ 统计数据已更新
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* 右侧：生成结果 */}
                <Card className="border-border/50 shadow-xl shadow-purple-500/5 lg:col-span-2">
                  <CardHeader>
                    <CardTitle>生成结果</CardTitle>
                    <CardDescription>
                      {algorithm === "random" ? "随机生成" : `${algorithm === "frequency" ? "高频" : algorithm === "omission" ? "冷门" : "均衡"}算法生成`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button
                        onClick={generateNumbers}
                        className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white"
                        size="lg"
                      >
                        <Shuffle className="h-5 w-5 mr-2" />
                        生成号码
                      </Button>
                      <Button
                        onClick={() => setShowHistory(!showHistory)}
                        variant="outline"
                        size="lg"
                      >
                        <History className="h-5 w-5 mr-2" />
                        历史记录 ({historyRecords.length})
                      </Button>
                    </div>

                    {/* 历史记录展示 */}
                    {showHistory && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">历史记录</h3>
                          {historyRecords.length > 0 && (
                            <div className="flex gap-2">
                              <Button
                                onClick={exportHistoryRecords}
                                variant="outline"
                                size="sm"
                              >
                                导出
                              </Button>
                              <Button
                                onClick={clearHistoryRecords}
                                variant="destructive"
                                size="sm"
                              >
                                清空记录
                              </Button>
                            </div>
                          )}
                        </div>

                        {historyRecords.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-muted-foreground/20 rounded-lg">
                            <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>暂无历史记录</p>
                            <p className="text-sm mt-1">生成号码后将自动保存</p>
                            <div className="mt-4">
                              <Label
                                htmlFor="import-history"
                                className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-sm font-medium hover:opacity-90 transition-opacity"
                              >
                                <Upload className="h-4 w-4" />
                                导入历史记录
                              </Label>
                              <input
                                id="import-history"
                                type="file"
                                accept=".json"
                                onChange={importHistoryRecords}
                                className="hidden"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                            {historyRecords.map((record) => (
                              <div
                                key={record.id}
                                className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/50 dark:to-slate-900/50 rounded-lg border border-border hover:border-purple-500/30 transition-all duration-200"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                      {record.lotteryType}
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full text-purple-700 dark:text-purple-400">
                                      {record.algorithm}
                                    </span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {record.formattedTime}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  {record.mainNumbers.map((num, idx) => (
                                    <div
                                      key={idx}
                                      className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs flex items-center justify-center font-bold shadow-md"
                                    >
                                      {num}
                                    </div>
                                  ))}
                                  {record.specialNumbers.length > 0 && (
                                    <>
                                      <span className="text-sm font-bold text-muted-foreground mx-1">+</span>
                                      {record.specialNumbers.map((num, idx) => (
                                        <div
                                          key={idx}
                                          className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-red-600 text-white text-xs flex items-center justify-center font-bold shadow-md"
                                        >
                                          {num}
                                        </div>
                                      ))}
                                    </>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="ml-auto h-6 px-2 text-xs"
                                    onClick={() => {
                                      const text = record.specialNumbers.length > 0
                                        ? `${record.mainNumbers.join(", ")} + ${record.specialNumbers.join(", ")}`
                                        : record.mainNumbers.join(", ");
                                      navigator.clipboard.writeText(text);
                                      toast.success("号码已复制");
                                    }}
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    复制
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 号码显示 */}
                    {generatedNumbers.length > 0 && (
                      <div className="space-y-4">
                        <div className="p-6 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                          <div className="flex flex-wrap gap-3 justify-center items-center">
                            {generatedNumbers.map((num, idx) => (
                              <div
                                key={idx}
                                className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-lg transform hover:scale-105 transition-transform"
                              >
                                {num}
                              </div>
                            ))}
                            {generatedSpecialNumbers.length > 0 && (
                              <>
                                <span className="text-2xl font-bold mx-2">+</span>
                                {generatedSpecialNumbers.map((num, idx) => (
                                  <div
                                    key={idx}
                                    className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-600 to-red-600 text-white flex items-center justify-center font-bold text-lg shadow-lg transform hover:scale-105 transition-transform"
                                  >
                                    {num}
                                  </div>
                                ))}
                              </>
                            )}
                          </div>
                        </div>

                        <Button
                          onClick={copyNumbers}
                          variant="outline"
                          className="w-full"
                        >
                          {copied ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              已复制到剪贴板
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              复制号码
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* 统计信息展示 */}
                    {statistics && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">统计分析结果</h3>
                          <Button
                            onClick={() => setShowDetailedStats(!showDetailedStats)}
                            variant="outline"
                            size="sm"
                          >
                            📊 {showDetailedStats ? '隐藏' : '查看'}详细数据
                          </Button>
                        </div>

                        {/* 简要统计卡片 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* 高频号码 */}
                          <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                            <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-400 mb-3">
                              🔥 热门号码 (高频)
                            </h4>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {getHighFrequencyNumbers(10, false).map((num) => (
                                <div
                                  key={num}
                                  className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold shadow-sm"
                                >
                                  {num}
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              基于最近{selectedType === "ssq" ? ssqHistoryData.length : dltHistoryData.length}期数据
                            </p>
                          </div>

                          {/* 冷门号码 */}
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-3">
                              ❄️ 冷门号码 (高遗漏)
                            </h4>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {getColdNumbers(10, false).map((num) => (
                                <div
                                  key={num}
                                  className="w-7 h-7 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold shadow-sm"
                                >
                                  {num}
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              遗漏期数最多的号码
                            </p>
                          </div>
                        </div>

                        {/* 详细数据表格 */}
                        {showDetailedStats && (
                          <div className="space-y-4">
                          {/* 主号码频次分析 */}
                          <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                            <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-3">
                              📈 主号码频次分析
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* 频次排名 */}
                              <div>
                                <h5 className="text-xs font-medium mb-2 text-muted-foreground">频次排名 (前15名)</h5>
                                <div className="space-y-1">
                                  {Array.from({ length: Math.min(15, config.mainRange[1]) })
                                    .map((_, index) => {
                                      const num = getHighFrequencyNumbers(config.mainRange[1], false)[index];
                                      if (!num) return null;
                                      return (
                                        <div key={num} className="flex items-center justify-between text-xs">
                                          <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold">
                                              {num}
                                            </div>
                                            <span className="text-muted-foreground">#{index + 1}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-semibold">{statistics.frequency[num] || 0}</span>
                                            <span className="text-muted-foreground">次</span>
                                            <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 ml-1">
                                              <div
                                                className="bg-purple-500 h-1.5 rounded-full"
                                                style={{
                                                  width: `${((statistics.frequency[num] || 0) / Math.max(...Object.values(statistics.frequency))) * 100}%`
                                                }}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>

                              {/* 遗漏排名 */}
                              <div>
                                <h5 className="text-xs font-medium mb-2 text-muted-foreground">遗漏排名 (前15名)</h5>
                                <div className="space-y-1">
                                  {Array.from({ length: Math.min(15, config.mainRange[1]) })
                                    .map((_, index) => {
                                      const num = getColdNumbers(config.mainRange[1], false)[index];
                                      if (!num) return null;
                                      return (
                                        <div key={num} className="flex items-center justify-between text-xs">
                                          <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">
                                              {num}
                                            </div>
                                            <span className="text-muted-foreground">#{index + 1}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-semibold">{statistics.omission[num] || 0}</span>
                                            <span className="text-muted-foreground">期</span>
                                            <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 ml-1">
                                              <div
                                                className="bg-blue-500 h-1.5 rounded-full"
                                                style={{
                                                  width: `${((statistics.omission[num] || 0) / Math.max(...Object.values(statistics.omission))) * 100}%`
                                                }}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 特殊号码统计 (如果有的话) */}
                          {config.specialRange && config.specialCount && (
                            <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 rounded-lg border border-pink-200 dark:border-pink-800">
                              <h4 className="text-sm font-semibold text-pink-700 dark:text-pink-400 mb-3">
                                ⭐ {selectedType === "dlt" ? "后区" : "蓝球"} 频次分析
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h5 className="text-xs font-medium mb-2 text-muted-foreground">高频号码</h5>
                                  <div className="space-y-1">
                                    {getHighFrequencyNumbers(config.specialRange[1], true).slice(0, 8).map((num) => (
                                      <div key={num} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                          <div className="w-5 h-5 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center font-bold">
                                            {num}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <span className="font-semibold">{statistics.frequency[num] || 0}</span>
                                          <span className="text-muted-foreground">次</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <h5 className="text-xs font-medium mb-2 text-muted-foreground">高遗漏号码</h5>
                                  <div className="space-y-1">
                                    {getColdNumbers(config.specialRange[1], true).slice(0, 8).map((num) => (
                                      <div key={num} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                          <div className="w-5 h-5 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center font-bold">
                                            {num}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <span className="font-semibold">{statistics.omission[num] || 0}</span>
                                          <span className="text-muted-foreground">期</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 统计摘要 */}
                          <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/50 dark:to-slate-900/50 rounded-lg border border-border">
                            <h4 className="text-sm font-semibold mb-3">📊 数据摘要</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                              <div>
                                <span className="text-muted-foreground">统计期数：</span>
                                <span className="font-semibold ml-1">
                                  {selectedType === "ssq" ? ssqHistoryData.length : dltHistoryData.length}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">主号码范围：</span>
                                <span className="font-semibold ml-1">
                                  {config.mainRange[0]}-{config.mainRange[1]}
                                </span>
                              </div>
                              {config.specialRange && (
                                <div>
                                  <span className="text-muted-foreground">特殊号码范围：</span>
                                  <span className="font-semibold ml-1">
                                    {config.specialRange[0]}-{config.specialRange[1]}
                                  </span>
                                </div>
                              )}
                              <div>
                                <span className="text-muted-foreground">分析时间：</span>
                                <span className="font-semibold ml-1">实时</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* 底部说明 */}
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <div className="text-center text-sm text-muted-foreground space-y-1">
                    <p>💡 智能选号基于历史数据统计分析，仅供参考</p>
                    <p>📊 统计数据来源于最近50期开奖记录</p>
                    <p>🎯 彩票有风险，投注需理性</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Lottery History Tab */}
          <TabsContent value="history">
            <Card className="border-border/50 shadow-xl shadow-purple-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  开奖历史
                </CardTitle>
                <CardDescription>
                  大乐透和双色球最近50期开奖记录（数据来源：新浪彩票）
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    <span className="ml-3 text-muted-foreground">
                      加载中...
                    </span>
                  </div>
                ) : dltHistoryData.length === 0 &&
                  ssqHistoryData.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    暂无数据
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* 两列布局：大乐透和双色球并排显示 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* 大乐透历史 */}
                      {dltHistoryData.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-purple-600 dark:text-purple-400 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                            大乐透开奖历史 ({dltHistoryData.length}期)
                          </h3>
                          <div className="space-y-2 h-[calc(100vh-300px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                            {dltHistoryData
                              .slice()
                              .reverse()
                              .map((item) => (
                                <div
                                  key={item.issue}
                                  className="p-2.5 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-lg border border-border hover:border-purple-500/30 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 min-w-[80px]">
                                      <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                        第 {item.issue} 期
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1">
                                      {item.numbers.map((num, idx) => (
                                        <div
                                          key={idx}
                                          className="w-7 h-7 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 flex items-center justify-center font-bold text-xs shadow-sm"
                                        >
                                          {num}
                                        </div>
                                      ))}
                                      <span className="text-sm font-bold text-muted-foreground mx-1">
                                        +
                                      </span>
                                      {item.specialNumbers.map((num, idx) => (
                                        <div
                                          key={idx}
                                          className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md"
                                        >
                                          {num}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* 双色球历史 */}
                      {ssqHistoryData.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-red-600 dark:text-red-400 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            双色球开奖历史 ({ssqHistoryData.length}期)
                          </h3>
                          <div className="space-y-2 h-[calc(100vh-300px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                            {ssqHistoryData
                              .slice()
                              .reverse()
                              .map((item) => (
                                <div
                                  key={item.issue}
                                  className="p-2.5 bg-gradient-to-r from-red-500/5 via-pink-500/5 to-rose-500/5 rounded-lg border border-border hover:border-red-500/30 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 min-w-[80px]">
                                      <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                                        第 {item.issue} 期
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1">
                                      {item.redBalls.map((num, idx) => (
                                        <div
                                          key={idx}
                                          className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-red-600 border border-red-700 text-white flex items-center justify-center font-bold text-xs shadow-md"
                                        >
                                          {num}
                                        </div>
                                      ))}
                                      <span className="text-sm font-bold text-muted-foreground mx-1">
                                        +
                                      </span>
                                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                                        {item.blueBall}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 数据统计信息 */}
                    <div className="text-center text-sm text-muted-foreground border-t pt-4">
                      <p>显示全部 {dltHistoryData.length + ssqHistoryData.length} 期历史数据 • 数据来源：新浪彩票</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
