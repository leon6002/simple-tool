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
  AlgorithmType,
  HistoryRecord,
  LotteryConfig,
  LotteryType,
} from "../../types";
import { LOTTERY_CONFIGS } from "../../constants";
import {
  Check,
  Copy,
  Save,
  Scale,
  Shuffle,
  Sparkles,
  Trash,
  TrendingDown,
  TrendingUp,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NumberOperationsProps {
  selectedType: LotteryType;
  algorithm: AlgorithmType;
  config: LotteryConfig;
  mainNumbers: number[];
  specialNumbers: number[];
  historyRecords: HistoryRecord[];
  copied: boolean;
  saved: boolean;
  setMainNumbers: (numbers: number[]) => void;
  setSpecialNumbers: (numbers: number[]) => void;
  saveNumbers: () => void;
  copyNumbers: () => void;
  onTypeChange: (type: LotteryType) => void;
  onAlgorithmChange: (algorithm: AlgorithmType) => void;
  generateSmartNumbers: () => void;
}

export const NumberOperations = ({
  selectedType,
  algorithm,
  config,
  mainNumbers,
  specialNumbers,
  historyRecords,
  copied,
  saved,
  setMainNumbers,
  setSpecialNumbers,
  saveNumbers,
  copyNumbers,
  onTypeChange,
  onAlgorithmChange,
  generateSmartNumbers,
}: NumberOperationsProps) => {
  return (
    <div className="hidden md:block bg-linear-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-blue-200/30 dark:border-blue-800/30">
      <div className="flex flex-col gap-3">
        {/* 第一行：设置和主按钮 */}
        <div className="flex items-center gap-3">
          {/* 左侧：选择器组 */}
          <div className="flex items-center gap-2 flex-1">
            <Select
              value={selectedType}
              onValueChange={(value: LotteryType) => onTypeChange(value)}
            >
              <SelectTrigger className="h-8 w-32 text-xs cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(LOTTERY_CONFIGS) as LotteryType[]).map((type) => (
                  <SelectItem key={type} value={type} className="text-xs">
                    {LOTTERY_CONFIGS[type].name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={algorithm}
              onValueChange={(value: AlgorithmType) => onAlgorithmChange(value)}
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
              {selectedType === "dlt" ? "前区" : "红球"}: {mainNumbers.length}/
              {config.mainCount}
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
                <Button variant="secondary" size="lg" className="    h-7 px-3">
                  <History className="h-3 w-3 mr-1" />
                  查看我的选号({historyRecords.length}条)
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
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
                                      )} + ${record.specialNumbers.join(", ")}`
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
  );
};
