/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { getFrequencyColor } from "../utils";
import { LotteryConfig, LotteryStatistics, LotteryType } from "../types";

interface NumberSelectorProps {
  selectedType: LotteryType;
  mainNumbers: number[];
  specialNumbers: number[];
  statistics: LotteryStatistics | null;
  config: LotteryConfig;
  setMainNumbers: (numbers: number[]) => void;
  setSpecialNumbers: (numbers: number[]) => void;
}

export const NumberSelector = ({
  selectedType,
  mainNumbers,
  specialNumbers,
  statistics,
  config,
  setMainNumbers,
  setSpecialNumbers,
}: NumberSelectorProps) => {
  return (
    <>
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
            <span className="text-xs text-gray-400">红色高频，蓝色低频</span>
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
                  const shuffled = available.sort(() => Math.random() - 0.5);
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
        <div className="grid grid-cols-5 md:grid-cols-12 gap-1.5 gap-y-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
          {Array.from(
            { length: config.mainRange[1] - config.mainRange[0] + 1 },
            (_, i) => config.mainRange[0] + i
          ).map((num) => {
            const isSelected = mainNumbers.includes(num);

            const color = getFrequencyColor(num, statistics);

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
          })}
        </div>
      </div>
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
                    const shuffled = available.sort(() => Math.random() - 0.5);
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
                  length: config.specialRange[1] - config.specialRange[0] + 1,
                },
                (_, i) => config.specialRange![0] + i
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
                        if (
                          config.specialRange &&
                          newNumbers.length <
                            config.specialRange[1] - config.specialRange[0] + 1
                        ) {
                          newNumbers.push(num);
                          newNumbers.sort((a, b) => a - b);
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
