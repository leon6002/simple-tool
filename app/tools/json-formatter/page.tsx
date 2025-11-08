"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Copy,
  FileJson,
  Check,
  ArrowRightLeft,
  FileDiff,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserPreferencesStore } from "@/lib/stores";

interface JsonError {
  message: string;
  line?: number;
  column?: number;
}

export default function JsonFormatterPage() {
  const [inputJson, setInputJson] = useState("");
  const [formattedJson, setFormattedJson] = useState("");
  const [minifiedJson, setMinifiedJson] = useState("");
  const [jsonError, setJsonError] = useState<JsonError | null>(null);
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});
  const [originalText, setOriginalText] = useState("");
  const [compareText, setCompareText] = useState("");
  const [differences, setDifferences] = useState<string[]>([]);
  const { addRecentlyUsedTool } = useUserPreferencesStore();

  // 记录最近使用的工具
  useEffect(() => {
    addRecentlyUsedTool("json-formatter");
  }, [addRecentlyUsedTool]);

  const formatJson = () => {
    if (!inputJson.trim()) {
      setFormattedJson("");
      setMinifiedJson("");
      setJsonError(null);
      return;
    }

    try {
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, 2);
      const minified = JSON.stringify(parsed);

      setFormattedJson(formatted);
      setMinifiedJson(minified);
      setJsonError(null);
    } catch (error: any) {
      setFormattedJson("");
      setMinifiedJson("");

      // 解析错误信息
      const errorMessage = error.message || "Invalid JSON";
      const errorMatch = errorMessage.match(/position (\d+)/);
      let errorPosition = 0;

      if (errorMatch) {
        errorPosition = parseInt(errorMatch[1]);
      }

      // 计算行号和列号
      const lines = inputJson.substring(0, errorPosition).split("\n");
      const line = lines.length;
      const column = lines[lines.length - 1].length + 1;

      setJsonError({
        message: errorMessage,
        line,
        column,
      });
    }
  };

  const minifyJson = () => {
    if (!inputJson.trim()) {
      setFormattedJson("");
      setMinifiedJson("");
      setJsonError(null);
      return;
    }

    try {
      const parsed = JSON.parse(inputJson);
      const minified = JSON.stringify(parsed);

      setMinifiedJson(minified);
      setFormattedJson(inputJson); // 保持原输入作为格式化版本
      setJsonError(null);
    } catch (error: any) {
      setMinifiedJson("");
      setFormattedJson("");

      const errorMessage = error.message || "Invalid JSON";
      const errorMatch = errorMessage.match(/position (\d+)/);
      let errorPosition = 0;

      if (errorMatch) {
        errorPosition = parseInt(errorMatch[1]);
      }

      const lines = inputJson.substring(0, errorPosition).split("\n");
      const line = lines.length;
      const column = lines[lines.length - 1].length + 1;

      setJsonError({
        message: errorMessage,
        line,
        column,
      });
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [key]: true });
    setTimeout(() => {
      setCopied({ ...copied, [key]: false });
    }, 2000);
  };

  const validateJson = () => {
    if (!inputJson.trim()) {
      setJsonError(null);
      return { valid: true };
    }

    try {
      JSON.parse(inputJson);
      setJsonError(null);
      return { valid: true };
    } catch (error: any) {
      const errorMessage = error.message || "Invalid JSON";
      const errorMatch = errorMessage.match(/position (\d+)/);
      let errorPosition = 0;

      if (errorMatch) {
        errorPosition = parseInt(errorMatch[1]);
      }

      const lines = inputJson.substring(0, errorPosition).split("\n");
      const line = lines.length;
      const column = lines[lines.length - 1].length + 1;

      setJsonError({
        message: errorMessage,
        line,
        column,
      });

      return { valid: false, error: errorMessage };
    }
  };

  const findDifferences = () => {
    const origLines = originalText.split("\n");
    const compLines = compareText.split("\n");
    const maxLines = Math.max(origLines.length, compLines.length);
    const diffs: string[] = [];

    for (let i = 0; i < maxLines; i++) {
      const origLine = origLines[i] || "";
      const compLine = compLines[i] || "";

      if (origLine !== compLine) {
        diffs.push(`Line ${i + 1}: "${origLine}" → "${compLine}"`);
      }
    }

    setDifferences(diffs);
  };

  const sampleJson = `{
  "name": "John Doe",
  "age": 30,
  "isStudent": false,
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipcode": "10001"
  },
  "hobbies": [
    "reading",
    "swimming",
    "coding"
  ]
}`;

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
            <FileJson className="h-8 w-8 text-purple-600" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            JSON Formatter & Validator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Format, validate, minify JSON data and compare text differences
          </p>
        </div>

        <Tabs defaultValue="formatter" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="formatter" className="flex items-center gap-2">
              <FileJson className="h-4 w-4" />
              JSON Formatter
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex items-center gap-2">
              <FileDiff className="h-4 w-4" />
              Text Compare
            </TabsTrigger>
          </TabsList>

          <TabsContent value="formatter">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <Card className="border-border/50 shadow-xl shadow-purple-500/5">
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <CardTitle>Input JSON</CardTitle>
                      <CardDescription>
                        Enter your JSON data to format or validate
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInputJson(sampleJson)}
                      >
                        Load Sample
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInputJson("")}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter your JSON here..."
                    value={inputJson}
                    onChange={(e) => setInputJson(e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                  />

                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={formatJson}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white"
                    >
                      <Check className="h-4 w-4" />
                      Format JSON
                    </Button>
                    <Button
                      variant="outline"
                      onClick={minifyJson}
                      className="flex items-center gap-2"
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                      Minify JSON
                    </Button>
                    <Button
                      variant="outline"
                      onClick={validateJson}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Validate JSON
                    </Button>
                  </div>

                  {/* JSON Validation Status */}
                  <div className="pt-4">
                    {jsonError ? (
                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-red-500">
                              Invalid JSON
                            </h4>
                            <p className="text-sm text-red-500 mt-1">
                              {jsonError.message}
                            </p>
                            {jsonError.line && jsonError.column && (
                              <p className="text-xs text-red-500 mt-1">
                                Error at line {jsonError.line}, column{" "}
                                {jsonError.column}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : inputJson.trim() ? (
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-green-500">
                              Valid JSON
                            </h4>
                            <p className="text-sm text-green-500 mt-1">
                              Your JSON is properly formatted
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>

              {/* Output Section */}
              <div className="space-y-8">
                {/* Formatted JSON */}
                <Card className="border-border/50 shadow-xl shadow-purple-500/5">
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <CardTitle>Formatted JSON</CardTitle>
                        <CardDescription>
                          Pretty-printed JSON output
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(formattedJson, "formatted")
                        }
                        disabled={!formattedJson}
                        className="flex items-center gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        {copied["formatted"] ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {formattedJson ? (
                      <pre className="p-4 rounded-lg bg-muted/50 font-mono text-sm max-h-[300px] overflow-y-auto whitespace-pre-wrap break-all">
                        {formattedJson}
                      </pre>
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        <FileJson className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Formatted JSON will appear here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Minified JSON */}
                <Card className="border-border/50 shadow-xl shadow-purple-500/5">
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <CardTitle>Minified JSON</CardTitle>
                        <CardDescription>Compacted JSON output</CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(minifiedJson, "minified")
                        }
                        disabled={!minifiedJson}
                        className="flex items-center gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        {copied["minified"] ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {minifiedJson ? (
                      <pre className="p-4 rounded-lg bg-muted/50 font-mono text-sm max-h-[150px] overflow-y-auto whitespace-pre-wrap break-all">
                        {minifiedJson}
                      </pre>
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Minified JSON will appear here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="compare">
            <Card className="border-border/50 shadow-xl shadow-purple-500/5 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileDiff className="h-5 w-5" />
                  Text Comparison
                </CardTitle>
                <CardDescription>
                  Compare two texts and see the differences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-sm font-medium">Original Text</label>
                    <Textarea
                      placeholder="Enter original text..."
                      value={originalText}
                      onChange={(e) => setOriginalText(e.target.value)}
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-sm font-medium">Compare Text</label>
                    <Textarea
                      placeholder="Enter text to compare..."
                      value={compareText}
                      onChange={(e) => setCompareText(e.target.value)}
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={findDifferences}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white"
                  >
                    <FileDiff className="h-4 w-4" />
                    Find Differences
                  </Button>
                </div>

                {differences.length > 0 && (
                  <Card className="border-border/50 bg-card/50">
                    <CardHeader>
                      <CardTitle>Differences Found</CardTitle>
                      <CardDescription>
                        {differences.length} difference
                        {differences.length !== 1 ? "s" : ""} detected
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {differences.map((diff, index) => (
                          <li
                            key={index}
                            className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 font-mono text-sm"
                          >
                            {diff}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {differences.length === 0 && originalText && compareText && (
                  <div className="p-6 text-center rounded-lg bg-green-500/10 border border-green-500/20">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-green-500">
                      No Differences Found
                    </h3>
                    <p className="text-green-500">The texts are identical</p>
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
