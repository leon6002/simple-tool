"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Copy,
  ArrowLeftRight,
  Calculator,
  Info,
  Lightbulb,
  Zap,
  Plus,
  Minus,
  X,
  Divide,
} from "lucide-react";

type NumberSystem = "hex" | "decimal" | "binary" | "octal";

interface ConversionResult {
  hex: string;
  decimal: string;
  binary: string;
  octal: string;
}

export default function HexConverterPage() {
  // State for Number System Converter
  const [inputValue, setInputValue] = useState("");
  const [inputType, setInputType] = useState<NumberSystem>("hex");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState("");

  // State for Bitwise Operations
  const [bitwiseFirstValue, setBitwiseFirstValue] = useState("");
  const [bitwiseFirstType, setBitwiseFirstType] =
    useState<NumberSystem>("decimal");
  const [bitwiseSecondValue, setBitwiseSecondValue] = useState("");
  const [bitwiseOperation, setBitwiseOperation] = useState("&");
  const [bitwiseResult, setBitwiseResult] = useState<ConversionResult | null>(
    null
  );
  const [bitwiseError, setBitwiseError] = useState("");

  const convert = () => {
    setError("");

    if (!inputValue.trim()) {
      setError("Please enter a value");
      return;
    }

    try {
      let decimalValue: number;

      // Convert input to decimal first
      switch (inputType) {
        case "hex":
          decimalValue = parseInt(inputValue.replace(/^0x/i, ""), 16);
          break;
        case "decimal":
          decimalValue = parseInt(inputValue, 10);
          break;
        case "binary":
          decimalValue = parseInt(inputValue.replace(/^0b/i, ""), 2);
          break;
        case "octal":
          decimalValue = parseInt(inputValue.replace(/^0o/i, ""), 8);
          break;
        default:
          throw new Error("Invalid input type");
      }

      if (isNaN(decimalValue)) {
        throw new Error("Invalid input value");
      }

      // Convert to all formats
      setResult({
        hex: "0x" + decimalValue.toString(16).toUpperCase(),
        decimal: decimalValue.toString(10),
        binary: "0b" + decimalValue.toString(2),
        octal: "0o" + decimalValue.toString(8),
      });
    } catch (err) {
      setError("Invalid input. Please check your value and try again.");
      setResult(null);
    }
  };

  const performBitwiseOperation = () => {
    setBitwiseError("");

    if (
      !bitwiseFirstValue.trim() ||
      (!bitwiseSecondValue.trim() && bitwiseOperation !== "~")
    ) {
      setBitwiseError("Please enter both values");
      return;
    }

    try {
      let firstDecimal: number;
      let secondDecimal: number;

      // Convert first input to decimal
      switch (bitwiseFirstType) {
        case "hex":
          firstDecimal = parseInt(bitwiseFirstValue.replace(/^0x/i, ""), 16);
          break;
        case "decimal":
          firstDecimal = parseInt(bitwiseFirstValue, 10);
          break;
        case "binary":
          firstDecimal = parseInt(bitwiseFirstValue.replace(/^0b/i, ""), 2);
          break;
        case "octal":
          firstDecimal = parseInt(bitwiseFirstValue.replace(/^0o/i, ""), 8);
          break;
        default:
          throw new Error("Invalid input type");
      }

      // Convert second input to decimal (for unary operations, use 0)
      if (bitwiseOperation === "~") {
        secondDecimal = 0; // Not used for NOT operation
      } else {
        secondDecimal = parseInt(bitwiseSecondValue, 10);
      }

      if (
        isNaN(firstDecimal) ||
        (bitwiseOperation !== "~" && isNaN(secondDecimal))
      ) {
        throw new Error("Invalid input values");
      }

      // Perform bitwise operation
      let operationResult: number;
      switch (bitwiseOperation) {
        case "&":
          operationResult = firstDecimal & secondDecimal;
          break;
        case "|":
          operationResult = firstDecimal | secondDecimal;
          break;
        case "^":
          operationResult = firstDecimal ^ secondDecimal;
          break;
        case "<<":
          operationResult = firstDecimal << secondDecimal;
          break;
        case ">>":
          operationResult = firstDecimal >> secondDecimal;
          break;
        case ">>>":
          operationResult = firstDecimal >>> secondDecimal;
          break;
        case "~":
          operationResult = ~firstDecimal;
          break;
        default:
          throw new Error("Invalid operation");
      }

      // Convert result to all formats
      setBitwiseResult({
        hex: "0x" + operationResult.toString(16).toUpperCase(),
        decimal: operationResult.toString(10),
        binary: "0b" + operationResult.toString(2),
        octal: "0o" + operationResult.toString(8),
      });
    } catch (err) {
      setBitwiseError(
        "Invalid input or operation. Please check your values and try again."
      );
      setBitwiseResult(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const systemButtons: {
    type: NumberSystem;
    label: string;
    placeholder: string;
  }[] = [
    { type: "hex", label: "Hexadecimal", placeholder: "e.g., FF or 0xFF" },
    { type: "decimal", label: "Decimal", placeholder: "e.g., 255" },
    {
      type: "binary",
      label: "Binary",
      placeholder: "e.g., 11111111 or 0b11111111",
    },
    { type: "octal", label: "Octal", placeholder: "e.g., 377 or 0o377" },
  ];

  const bitwiseOperations = [
    { op: "&", name: "AND" },
    { op: "|", name: "OR" },
    { op: "^", name: "XOR" },
    { op: "<<", name: "Left Shift" },
    { op: ">>", name: "Right Shift" },
    { op: ">>>", name: "Unsigned Right Shift" },
    { op: "~", name: "NOT (Unary)" },
  ];

  return (
    <div className="container mx-auto max-w-6xl py-12 md:py-16 lg:py-20 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20"
          >
            <Calculator className="h-8 w-8 text-purple-600" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Hex Calculator & Converter
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Convert between hexadecimal, decimal, binary, and octal number
            systems with ease
          </p>
        </div>

        {/* Main Converter Card */}
        <Card className="mb-8 border-border/50 shadow-xl shadow-purple-500/5">
          <CardHeader>
            <CardTitle>Number System Converter</CardTitle>
            <CardDescription>
              Select the input format and enter your value
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Input Type Selection */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                Input Format
              </label>
              <div className="flex flex-wrap gap-3">
                {systemButtons.map((system) => (
                  <Badge
                    key={system.type}
                    variant={inputType === system.type ? "default" : "outline"}
                    className={`cursor-pointer px-5 py-2.5 text-sm font-medium transition-all hover:scale-105 ${
                      inputType === system.type
                        ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white border-0 shadow-lg shadow-purple-500/30"
                        : "hover:border-purple-500/50 hover:bg-purple-500/5"
                    }`}
                    onClick={() => setInputType(system.type)}
                  >
                    {system.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Input Field */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                Input Value
              </label>
              <div className="flex gap-3">
                <Input
                  type="text"
                  placeholder={
                    systemButtons.find((s) => s.type === inputType)?.placeholder
                  }
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && convert()}
                  className="flex-1 h-11 border-border/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                />
                <Button
                  onClick={convert}
                  className="h-11 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/30"
                >
                  <ArrowLeftRight className="h-4 w-4 mr-2" />
                  Convert
                </Button>
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500 mt-3 flex items-center gap-2"
                >
                  <span>⚠️</span> {error}
                </motion.p>
              )}
            </div>

            {/* Results */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 pt-6 border-t border-border/50"
              >
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <span>✨</span> Results
                </h3>
                <div className="grid gap-3">
                  {Object.entries(result).map(([key, value], index) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 border border-border/50 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium capitalize text-muted-foreground mb-1">
                          {key}
                        </p>
                        <p className="text-lg font-mono font-semibold">
                          {value}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(value)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-500/10 hover:text-purple-600"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Bitwise Operations Card */}
        <Card className="mb-8 border-border/50 shadow-xl shadow-purple-500/5">
          <CardHeader>
            <CardTitle>Bitwise Operations</CardTitle>
            <CardDescription>
              Perform bitwise operations on numbers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First operand */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  First Operand Format
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {systemButtons.map((system) => (
                    <Badge
                      key={system.type}
                      variant={
                        bitwiseFirstType === system.type ? "default" : "outline"
                      }
                      className={`cursor-pointer px-3 py-1.5 text-xs font-medium transition-all hover:scale-105 ${
                        bitwiseFirstType === system.type
                          ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white border-0 shadow-lg shadow-purple-500/30"
                          : "hover:border-purple-500/50 hover:bg-purple-500/5"
                      }`}
                      onClick={() => setBitwiseFirstType(system.type)}
                    >
                      {system.label}
                    </Badge>
                  ))}
                </div>
                <Input
                  type="text"
                  placeholder={
                    systemButtons.find((s) => s.type === bitwiseFirstType)
                      ?.placeholder
                  }
                  value={bitwiseFirstValue}
                  onChange={(e) => setBitwiseFirstValue(e.target.value)}
                  className="h-11 border-border/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              {/* Operation selection */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Operation
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {bitwiseOperations.map((op) => (
                    <Button
                      key={op.op}
                      variant={
                        bitwiseOperation === op.op ? "default" : "outline"
                      }
                      className={`h-11 ${
                        bitwiseOperation === op.op
                          ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white border-0 shadow-lg shadow-purple-500/30"
                          : ""
                      }`}
                      onClick={() => setBitwiseOperation(op.op)}
                    >
                      {op.op}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Second operand - hidden for unary operations */}
              {bitwiseOperation !== "~" && (
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Second Operand (decimal)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., 5"
                    value={bitwiseSecondValue}
                    onChange={(e) => setBitwiseSecondValue(e.target.value)}
                    className="h-11 border-border/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              )}

              {/* Calculate button */}
              <div className="flex items-end">
                <Button
                  onClick={performBitwiseOperation}
                  className="h-11 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/30"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate
                </Button>
              </div>
            </div>

            {/* Bitwise Errors */}
            {bitwiseError && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500 mt-3 flex items-center gap-2"
              >
                <span>⚠️</span> {bitwiseError}
              </motion.p>
            )}

            {/* Bitwise Results */}
            {bitwiseResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 pt-6 border-t border-border/50"
              >
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <span>⚡</span> Bitwise Operation Result
                </h3>
                <div className="grid gap-3">
                  {Object.entries(bitwiseResult).map(([key, value], index) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 border border-border/50 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium capitalize text-muted-foreground mb-1">
                          {key}
                        </p>
                        <p className="text-lg font-mono font-semibold">
                          {value}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(value)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-500/10 hover:text-purple-600"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-purple-500/30 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-purple-600" /> About Number
                Systems
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed">
              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <strong className="text-blue-600 dark:text-blue-400">
                  Hexadecimal (Base 16):
                </strong>{" "}
                Uses digits 0-9 and letters A-F
              </div>
              <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                <strong className="text-purple-600 dark:text-purple-400">
                  Decimal (Base 10):
                </strong>{" "}
                Standard number system with digits 0-9
              </div>
              <div className="p-3 rounded-lg bg-pink-500/5 border border-pink-500/20">
                <strong className="text-pink-600 dark:text-pink-400">
                  Binary (Base 2):
                </strong>{" "}
                Uses only 0 and 1
              </div>
              <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                <strong className="text-orange-600 dark:text-orange-400">
                  Octal (Base 8):
                </strong>{" "}
                Uses digits 0-7
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-purple-500/30 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-purple-600" /> Common Use
                Cases
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Zap className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <p>Color codes in web development (e.g., #FF5733)</p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Zap className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <p>Memory addresses in programming</p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Zap className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <p>Binary operations and bit manipulation</p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Zap className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <p>File permissions in Unix/Linux systems</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
