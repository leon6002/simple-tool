import { Button } from "@/components/ui/button";
import { getFrequencyColor, sortNumbersByFrequency } from "../utils";
import { LotteryConfig, LotteryStatistics, LotteryType } from "../types";
import { SortAsc, SortDesc, Shuffle, X, Trash } from "lucide-react";
import { useLotteryStore } from "@/lib/stores/lottery/lottery-store";

interface NumberSelectorProps {
  selectedType: LotteryType;
  mainNumbers: number[];
  specialNumbers: number[];
  statistics: LotteryStatistics | null;
  config: LotteryConfig;
  setMainNumbers: (numbers: number[]) => void;
  setSpecialNumbers: (numbers: number[]) => void;
  kl8NumberCount?: number; // KL8选号数量
}

export const NumberSelector = ({
  selectedType,
  mainNumbers,
  specialNumbers,
  statistics,
  config,
  setMainNumbers,
  setSpecialNumbers,
  kl8NumberCount,
}: NumberSelectorProps) => {
  // 使用store中的排序状态
  const { sortMode, setSortMode } = useLotteryStore();

  // 获取排序后的号码数组
  const getSortedNumbers = (start: number, end: number) => {
    const numbers = Array.from(
      { length: end - start + 1 },
      (_, i) => start + i
    );

    if (sortMode === "natural") {
      return numbers;
    } else if (sortMode === "frequency-desc") {
      return sortNumbersByFrequency(numbers, statistics, false); // 高频到低频
    } else {
      return sortNumbersByFrequency(numbers, statistics, true); // 低频到高频
    }
  };

  return (
    <>
      <div>
        <div className="mb-4 space-y-3">
          {/* 标题行 */}
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {selectedType === "kl8"
                ? "选号"
                : selectedType === "dlt"
                ? "前区号码"
                : "红球"}
            </h4>
            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
              {selectedType === "kl8"
                ? `${mainNumbers.length}/${kl8NumberCount || 10}`
                : Array.isArray(config.mainCount)
                ? `${mainNumbers.length}/${config.mainCount[0]}-${config.mainCount[1]}`
                : `${mainNumbers.length}/${config.mainCount}`}
            </span>
            <span className="hidden sm:inline text-xs text-gray-400">
              红色高频，蓝色低频
            </span>
          </div>

          {/* 按钮组 - 移动端垂直排列，桌面端水平排列 */}
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            {/* 排序控制按钮 */}
            <div className="flex items-center gap-1 flex-wrap">
              <Button
                variant={sortMode === "natural" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortMode("natural")}
                className="text-xs h-7 px-2"
              >
                数字顺序
              </Button>
              <Button
                variant={sortMode === "frequency-desc" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortMode("frequency-desc")}
                className="text-xs h-7 px-2"
              >
                <SortDesc className="w-3 h-3 mr-1" />
                高频优先
              </Button>
              <Button
                variant={sortMode === "frequency-asc" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortMode("frequency-asc")}
                className="text-xs h-7 px-2"
              >
                <SortAsc className="w-3 h-3 mr-1" />
                低频优先
              </Button>
            </div>

            {/* 操作按钮 */}
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

                  if (selectedType === "kl8") {
                    // 福彩8：智能选择到合适的数量（最少1个，最多16个，但不能超过2万元限制）
                    const minCount = Math.max(1, kl8NumberCount || 1);
                    const maxCount = 16;
                    const currentCount = mainNumbers.length;

                    // 如果已经是10个或更多，就不自动补全
                    if (currentCount >= 10) {
                      return;
                    }

                    const targetCount = Math.max(
                      minCount,
                      Math.min(10, currentCount + 1)
                    );
                    const needed = Math.min(
                      targetCount - currentCount,
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
                  } else {
                    // 其他彩票类型：补全到最小数量（单式投注）
                    const targetCount = Array.isArray(config.mainCount)
                      ? config.mainCount[0]
                      : config.mainCount;
                    const needed = Math.min(
                      targetCount - mainNumbers.length,
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
                  }
                }}
                disabled={
                  selectedType === "kl8"
                    ? mainNumbers.length >= 16
                    : Array.isArray(config.mainCount)
                    ? mainNumbers.length >= config.mainCount[1]
                    : mainNumbers.length >= config.mainCount
                }
                className="relative group text-xs h-8 px-3 sm:px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Shuffle className="w-3 h-3 mr-1 sm:mr-1.5" />
                随机补全
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-md transition-opacity duration-200"></div>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMainNumbers([])}
                disabled={mainNumbers.length === 0}
                className="relative group text-xs h-8 px-3 sm:px-4 bg-gradient-to-r from-slate-600 to-slate-600 text-white hover:from-red-600 hover:to-pink-700 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Trash className="w-3 h-3 mr-1 sm:mr-1.5" />
                清除
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-md transition-opacity duration-200"></div>
              </Button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-5 md:grid-cols-12 gap-1.5 gap-y-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
          {getSortedNumbers(config.mainRange[0], config.mainRange[1]).map(
            (num) => {
              const isSelected = mainNumbers.includes(num);

              const color = getFrequencyColor(num, statistics);

              return (
                <button
                  key={num}
                  onClick={() => {
                    const newNumbers = [...mainNumbers];
                    const index = newNumbers.indexOf(num);
                    if (index > -1) {
                      // 如果已选择，则取消选择
                      newNumbers.splice(index, 1);
                    } else {
                      if (selectedType === "kl8") {
                        // 福彩8：最多选择16个号码，但不能超过2万元限制
                        if (newNumbers.length < 16) {
                          newNumbers.push(num);
                          newNumbers.sort((a, b) => a - b);
                        }
                      } else {
                        // 其他彩票类型：支持复式投注，但不能超过最大数量
                        let maxCount: number;
                        if (Array.isArray(config.mainCount)) {
                          maxCount = config.mainCount[1]; // 最大数量
                        } else {
                          maxCount = config.mainCount;
                        }
                        if (newNumbers.length < maxCount) {
                          newNumbers.push(num);
                          newNumbers.sort((a, b) => a - b);
                        }
                      }
                    }
                    setMainNumbers(newNumbers);
                  }}
                  className={`h-9 w-9 p-0 cursor-pointer text-xs font-bold transition-all duration-200 border-2 rounded-full hover:scale-110 ${
                    isSelected
                      ? "ring-3 ring-red-500 dark:ring-blue-50 ring-offset-1 ring-offset-white dark:ring-offset-gray-900 shadow-lg"
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
            }
          )}
        </div>
      </div>
      {/* 后区号码网格 */}
      {config.specialRange && config.specialCount && (
        <div>
          <div className="mb-4 space-y-3">
            {/* 标题行 */}
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-pink-500 rounded-full"></div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {selectedType === "dlt" ? "后区号码" : "蓝球"}
              </h4>
              <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                {config.specialCount
                  ? Array.isArray(config.specialCount)
                    ? `${specialNumbers.length}/${config.specialCount[0]}-${config.specialCount[1]}`
                    : `${specialNumbers.length}/${config.specialCount}`
                  : `${specialNumbers.length}`}
              </span>
            </div>

            {/* 操作按钮 */}
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
                  // 支持复式投注，补全到最小数量
                  const targetCount = Array.isArray(config.specialCount)
                    ? config.specialCount[0]
                    : config.specialCount!;
                  const needed = Math.min(
                    targetCount - specialNumbers.length,
                    available.length
                  );
                  if (needed > 0) {
                    const shuffled = available.sort(() => Math.random() - 0.5);
                    const newNumbers = [
                      ...specialNumbers,
                      ...shuffled.slice(0, needed),
                    ].sort((a, b) => a - b);
                    setSpecialNumbers(newNumbers);
                  }
                }}
                disabled={
                  Array.isArray(config.specialCount)
                    ? specialNumbers.length >= config.specialCount[1]
                    : specialNumbers.length >= config.specialCount
                }
                className="relative group text-xs h-8 px-3 sm:px-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:from-pink-600 hover:to-rose-700 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Shuffle className="w-3 h-3 mr-1 sm:mr-1.5" />
                随机补全
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-md transition-opacity duration-200"></div>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSpecialNumbers([])}
                disabled={specialNumbers.length === 0}
                className="relative group text-xs h-8 px-3 sm:px-4 bg-gradient-to-r from-red-500 to-orange-600 text-white hover:from-red-600 hover:to-orange-700 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Trash className="w-3 h-3 mr-1 sm:mr-1.5" />
                清除
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-md transition-opacity duration-200"></div>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 gap-y-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
            {config.specialRange &&
              getSortedNumbers(
                config.specialRange[0],
                config.specialRange[1]
              ).map((num) => {
                const isSelected = specialNumbers.includes(num);

                const color = getFrequencyColor(num, statistics);

                return (
                  <button
                    key={num}
                    onClick={() => {
                      const newNumbers = [...specialNumbers];
                      const index = newNumbers.indexOf(num);
                      if (index > -1) {
                        newNumbers.splice(index, 1);
                      } else {
                        if (config.specialRange) {
                          // 支持复式投注，但不能超过最大数量
                          let maxCount: number;
                          if (Array.isArray(config.specialCount)) {
                            maxCount = config.specialCount[1]; // 最大数量
                          } else {
                            maxCount = config.specialCount;
                          }
                          if (newNumbers.length < maxCount) {
                            newNumbers.push(num);
                            newNumbers.sort((a, b) => a - b);
                          }
                        }
                      }
                      setSpecialNumbers(newNumbers);
                    }}
                    className={`h-9 w-9 p-0 text-xs cursor-pointer font-bold transition-all duration-200 border-2 rounded-full hover:scale-110 ${
                      isSelected
                        ? "ring-3 ring-blue-500 dark:ring-blue-50 ring-offset-1 ring-offset-white dark:ring-offset-gray-900 shadow-lg"
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
      )}
    </>
  );
};
