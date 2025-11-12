"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, Calculator, Info, RotateCcw } from "lucide-react";

interface ConversionResult {
  hex: string;
  decimal: string;
  binary: string;
  octal: string;
  int8: string;
  uint8: string;
  int16: string;
  uint16: string;
  int32: string;
  uint32: string;
}

export default function HexConverterPage() {
  const [calcInput, setCalcInput] = useState("0xFF + 0x10 - 0x05");
  const [calcResult, setCalcResult] = useState<ConversionResult | null>(null);
  const [calcError, setCalcError] = useState("");

  // 解析单个数字（自动识别进制）
  const parseNumber = (value: string): number => {
    const trimmed = value.trim();
    if (!trimmed) throw new Error("Empty value");

    // 自动识别进制
    if (trimmed.startsWith("0x") || trimmed.startsWith("0X")) {
      return parseInt(trimmed.slice(2), 16);
    } else if (trimmed.startsWith("0b") || trimmed.startsWith("0B")) {
      return parseInt(trimmed.slice(2), 2);
    } else if (trimmed.startsWith("0o") || trimmed.startsWith("0O")) {
      return parseInt(trimmed.slice(2), 8);
    } else {
      return parseInt(trimmed, 10);
    }
  };

  // 生成结果对象
  const generateResult = (value: number): ConversionResult => {
    const displayValue = value >>> 0; // 转为32位无符号

    // 8-bit
    const value8bit = displayValue & 0xff;
    const int8Value = value8bit >= 0x80 ? value8bit - 0x100 : value8bit;

    // 16-bit
    const value16bit = displayValue & 0xffff;
    const int16Value = value16bit >= 0x8000 ? value16bit - 0x10000 : value16bit;

    // 32-bit
    const int32Value = displayValue | 0;

    return {
      hex: "0x" + displayValue.toString(16).toUpperCase(),
      decimal: displayValue.toString(10),
      binary: "0b" + displayValue.toString(2),
      octal: "0o" + displayValue.toString(8),
      int8: int8Value.toString(10),
      uint8: value8bit.toString(10),
      int16: int16Value.toString(10),
      uint16: value16bit.toString(10),
      int32: int32Value.toString(10),
      uint32: displayValue.toString(10),
    };
  };

  // 解析并计算表达式
  const evaluateExpression = (expr: string): number => {
    // 替换所有数字为十进制
    let processed = expr;

    // 匹配所有数字（包括0x, 0b, 0o前缀）
    const numberPattern = /(0x[0-9a-fA-F]+|0b[01]+|0o[0-7]+|\d+)/g;
    const numbers = expr.match(numberPattern) || [];

    // 替换为十进制
    numbers.forEach((num) => {
      const decimal = parseNumber(num);
      processed = processed.replace(num, decimal.toString());
    });

    // 处理位运算符（需要特殊处理，因为eval不支持某些位运算）
    // 使用Function构造器更安全地执行表达式
    try {
      // 替换位运算符为函数调用
      processed = processed.replace(/~/g, "~");

      // 使用eval计算（在受控环境中）
      const result = eval(processed);

      if (typeof result !== "number" || isNaN(result)) {
        throw new Error("计算结果无效");
      }

      return Math.floor(result);
    } catch (err) {
      throw new Error("表达式语法错误");
    }
  };

  // 执行计算
  const calculate = () => {
    setCalcError("");

    try {
      if (!calcInput.trim()) {
        throw new Error("请输入表达式");
      }

      const result = evaluateExpression(calcInput);
      setCalcResult(generateResult(result));
    } catch (err: any) {
      setCalcError(err.message || "计算错误");
      setCalcResult(null);
    }
  };

  // 插入运算符到输入框
  const insertOperator = (operator: string) => {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = calcInput;

    // 在光标位置插入运算符（前后加空格）
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + " " + operator + " " + after;

    setCalcInput(newText);

    // 设置新的光标位置
    setTimeout(() => {
      textarea.focus();
      const newPos = start + operator.length + 2;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // 运算符按钮配置 - 按功能分组
  const operatorGroups = {
    arithmetic: [
      { label: "+", desc: "加", color: "blue" },
      { label: "-", desc: "减", color: "blue" },
      { label: "*", desc: "乘", color: "blue" },
      { label: "/", desc: "除", color: "blue" },
    ],
    bitwise: [
      { label: "&", desc: "与", color: "purple" },
      { label: "|", desc: "或", color: "purple" },
      { label: "^", desc: "异或", color: "purple" },
      { label: "~", desc: "取反", color: "purple" },
      { label: "<<", desc: "左移", color: "purple" },
      { label: ">>", desc: "右移", color: "purple" },
    ],
    brackets: [
      { label: "(", desc: "左括号", color: "gray" },
      { label: ")", desc: "右括号", color: "gray" },
    ],
  };

  const labelMap: Record<string, string> = {
    hex: "十六进制",
    decimal: "十进制",
    binary: "二进制",
    octal: "八进制",
    int8: "8-bit 有符号",
    uint8: "8-bit 无符号",
    int16: "16-bit 有符号",
    uint16: "16-bit 无符号",
    int32: "32-bit 有符号",
    uint32: "32-bit 无符号",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 border border-purple-500/20"
          >
            <Calculator className="h-8 w-8 text-purple-600" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            进制转换 & 计算器
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            支持多数字运算、进制转换、位运算，一次性处理无限个数字
          </p>
        </motion.div>

        {/* Main Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-purple-600" />
                多数字计算器
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Textarea Input */}
              <div className="space-y-2">
                <Label>输入表达式</Label>
                <Textarea
                  value={calcInput}
                  onChange={(e) => setCalcInput(e.target.value)}
                  placeholder="输入表达式，例如：&#10;0xFF + 0x10 - 0x05&#10;(0xFF & 0xF0) | 0x0F&#10;255 * 2 + 100"
                  className="font-mono text-base min-h-[150px]"
                />
                <p className="text-xs text-muted-foreground">
                  💡
                  支持混合使用多种运算符，自动识别十六进制(0x)、二进制(0b)、八进制(0o)和十进制
                </p>
              </div>

              {/* Operator Buttons */}
              <div className="space-y-3">
                <Label>快捷运算符（点击插入）</Label>

                <div className="grid grid-cols-4 gap-4">
                  {/* 右侧：操作按钮 2x1 */}
                  <div className="grid grid-cols-1 gap-2">
                    <Button onClick={calculate} className="h-16 w-60 gap-2">
                      <Calculator className="h-4 w-4" />
                      计算
                    </Button>
                    <Button
                      onClick={() => {
                        setCalcInput("");
                        setCalcResult(null);
                        setCalcError("");
                      }}
                      variant="outline"
                      className="h-16 w-60 gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      清空
                    </Button>
                  </div>
                  {/* 左侧：算术运算 2x2 */}
                  <div className="grid grid-cols-2 gap-2">
                    {operatorGroups.arithmetic.map((btn) => {
                      const colorClasses = {
                        blue: "bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
                      };

                      return (
                        <Button
                          key={btn.label}
                          onClick={() => insertOperator(btn.label)}
                          variant="outline"
                          className={`h-16 w-28 p-2 ${colorClasses.blue}`}
                        >
                          <div className="flex flex-col items-center justify-center gap-1 w-full">
                            <span className="font-mono font-bold text-xl leading-none">
                              {btn.label}
                            </span>
                            <span className="text-[10px] leading-none opacity-70">
                              {btn.desc}
                            </span>
                          </div>
                        </Button>
                      );
                    })}
                  </div>

                  {/* 中间：位运算 2x3 */}
                  <div className="grid grid-cols-3 gap-2">
                    {operatorGroups.bitwise.map((btn) => {
                      const colorClasses = {
                        purple:
                          "bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30",
                      };

                      return (
                        <Button
                          key={btn.label}
                          onClick={() => insertOperator(btn.label)}
                          variant="outline"
                          className={`h-16 p-2 ${colorClasses.purple}`}
                        >
                          <div className="flex flex-col items-center justify-center gap-1 w-full">
                            <span className="font-mono font-bold text-lg leading-none">
                              {btn.label}
                            </span>
                            <span className="text-[10px] leading-none opacity-70">
                              {btn.desc}
                            </span>
                          </div>
                        </Button>
                      );
                    })}
                  </div>

                  {/* 括号 2x1 */}
                  <div className="grid grid-cols-1 gap-2">
                    {operatorGroups.brackets.map((btn) => {
                      const colorClasses = {
                        gray: "bg-gray-500/10 hover:bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30",
                      };

                      return (
                        <Button
                          key={btn.label}
                          onClick={() => insertOperator(btn.label)}
                          variant="outline"
                          className={`h-16 w-16 p-2 ${colorClasses.gray}`}
                        >
                          <div className="flex flex-col items-center justify-center gap-1 w-full">
                            <span className="font-mono font-bold text-2xl leading-none">
                              {btn.label}
                            </span>
                            <span className="text-[10px] leading-none opacity-70">
                              {btn.desc}
                            </span>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {calcError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400"
                >
                  ⚠️ {calcError}
                </motion.div>
              )}

              {/* Results */}
              {calcResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <span>✨</span> 计算结果
                  </h3>
                  <div className="grid gap-3">
                    {Object.entries(calcResult).map(([key, value], index) => {
                      const isIntType =
                        key.startsWith("int") || key.startsWith("uint");
                      const formatted = isIntType
                        ? { prefix: "", value: value }
                        : key === "hex"
                        ? { prefix: "0x", value: value.replace(/^0x/i, "") }
                        : key === "binary"
                        ? { prefix: "0b", value: value.replace(/^0b/i, "") }
                        : key === "octal"
                        ? { prefix: "0o", value: value.replace(/^0o/i, "") }
                        : { prefix: "", value: value };

                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="group flex items-center justify-between p-4 rounded-xl bg-linear-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5 border border-border/50 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              {labelMap[key] || key}
                            </p>
                            <div className="flex items-center gap-1 font-mono text-sm break-all">
                              {formatted.prefix && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold shrink-0">
                                  {formatted.prefix}
                                </span>
                              )}
                              <span className="font-semibold font-mono tracking-widest">
                                {formatted.value}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(value)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-500/10 hover:text-purple-600 shrink-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="border-border/50 bg-muted/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-5 w-5 text-purple-600" />
                使用说明
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <p className="font-medium text-purple-600">✅ 支持的运算</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    • <strong>算术运算</strong>：加(+)、减(-)、乘(*)、除(/)
                  </li>
                  <li>
                    • <strong>位运算</strong>：与(&)、或(|)、异或(^)、取反(~)
                  </li>
                  <li>
                    • <strong>移位运算</strong>：左移(&lt;&lt;)、右移(&gt;&gt;)
                  </li>
                  <li>
                    • <strong>括号</strong>：支持使用括号改变运算优先级
                  </li>
                  <li>
                    • <strong>混合运算</strong>：可在一个表达式中使用多种运算符
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <p className="font-medium text-purple-600">💡 使用示例</p>
                <ul className="space-y-2 text-muted-foreground font-mono text-xs">
                  <li>
                    • <strong>0xFF + 0x10 - 0x05</strong> → 十六进制混合运算
                  </li>
                  <li>
                    • <strong>(0xFF & 0xF0) | 0x0F</strong> → 位运算组合
                  </li>
                  <li>
                    • <strong>255 * 2 + 100</strong> → 十进制算术运算
                  </li>
                  <li>
                    • <strong>0b1111 &lt;&lt; 4</strong> → 二进制左移
                  </li>
                  <li>
                    • <strong>~0xFF</strong> → 按位取反
                  </li>
                  <li className="text-xs opacity-70 font-sans">
                    💡 点击运算符按钮可快速插入到光标位置
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
