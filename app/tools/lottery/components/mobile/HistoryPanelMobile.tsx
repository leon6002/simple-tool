"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { History, Upload, Copy, ChevronUp } from "lucide-react";
import { HistoryRecord } from "../../types";
import { saveToLocalStorage, clearLocalStorage } from "../../utils";
import toast from "react-hot-toast";

interface HistoryPanelProps {
  historyRecords: HistoryRecord[];
  onHistoryUpdate: (records: HistoryRecord[]) => void;
}

export default function HistoryPanelMobile({
  historyRecords,
  onHistoryUpdate,
}: HistoryPanelProps) {
  const STORAGE_KEY = "lottery_generator_history";

  // 清空选号记录
  const clearHistoryRecords = useCallback(() => {
    onHistoryUpdate([]);
    clearLocalStorage(STORAGE_KEY);
    console.log("选号记录已清空");
  }, [onHistoryUpdate]);

  // 导出选号记录
  const exportHistoryRecords = useCallback(() => {
    try {
      const dataStr = JSON.stringify(historyRecords, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      const exportFileDefaultName = `my-lottery-numbers-${
        new Date().toISOString().split("T")[0]
      }.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      console.log("选号记录已导出");
    } catch (error) {
      console.error("导出失败: ", error);
      toast.error("导出失败: ");
    }
  }, [historyRecords]);

  // 导入选号记录
  const importHistoryRecords = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedRecords = JSON.parse(e.target?.result as string);
          if (Array.isArray(importedRecords)) {
            onHistoryUpdate(importedRecords);
            saveToLocalStorage(importedRecords, STORAGE_KEY);
            console.log(`成功导入 ${importedRecords.length} 条选号记录`);
          } else {
            console.error("文件格式不正确");
          }
        } catch (error) {
          console.error("导入失败，文件格式不正确: ", error);
          toast.error("导入失败，文件格式不正确 ");
        }
      };
      reader.readAsText(file);

      event.target.value = "";
    },
    [onHistoryUpdate]
  );

  // 复制号码到剪贴板
  const copyNumbers = useCallback((record: HistoryRecord) => {
    const text =
      record.specialNumbers.length > 0
        ? `${record.mainNumbers.join(", ")} + ${record.specialNumbers.join(
            ", "
          )}`
        : record.mainNumbers.join(", ");

    navigator.clipboard.writeText(text);
    console.log("号码已复制");
  }, []);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Card className="border border-blue-200/30 dark:border-blue-800/20 bg-linear-to-r from-blue-50/20 to-purple-50/20 dark:from-blue-900/10 dark:to-purple-900/10 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-blue-300/40 dark:hover:border-blue-700/30">
          <CardContent className="px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  我的选号
                </span>
              </div>
              <ChevronUp className="h-3.5 w-3.5 text-blue-500" />
            </div>

            {historyRecords.length === 0 ? (
              <div className="text-center py-1">
                <p className="text-xs text-muted-foreground">
                  暂无记录 • 点击查看
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-blue-600 font-bold">
                    {historyRecords.length}
                  </span>
                  <span className="text-xs text-muted-foreground">条记录</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      exportHistoryRecords();
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-xs px-2 py-1 h-6 hover:bg-blue-50 text-blue-600"
                  >
                    导出
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearHistoryRecords();
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-xs px-2 py-1 h-6 hover:bg-red-50 text-red-600"
                  >
                    清空
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[70vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            我的选号记录
          </SheetTitle>
          <SheetDescription>
            共 {historyRecords.length} 条选号记录，包括标准选号和复式选号
          </SheetDescription>
        </SheetHeader>

        <div className="flex gap-2 mb-4 px-4">
          <Label
            htmlFor="import-history-drawer"
            className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg"
          >
            <Upload className="h-4 w-4" />
            导入选号记录
          </Label>
          <input
            id="import-history-drawer"
            type="file"
            accept=".json"
            onChange={importHistoryRecords}
            className="hidden"
          />
        </div>

        <div
          className="space-y-3 overflow-y-auto pr-2 px-4 pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
          style={{ maxHeight: "calc(80vh - 200px)" }}
        >
          {historyRecords.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-muted-foreground/20 rounded-lg bg-linear-to-br from-gray-50/50 to-blue-50/50 dark:from-gray-900/20 dark:to-blue-900/20">
              <History className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h4 className="text-lg font-semibold mb-2">暂无选号记录</h4>
              <p className="text-sm mb-6">生成号码后点击保存按钮将添加到此处</p>
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
                      onClick={() => copyNumbers(record)}
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
  );
}
