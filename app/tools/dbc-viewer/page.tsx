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
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileText,
  MessageSquare,
  Radio,
  Zap,
  Search,
  Download,
  Loader2,
  X,
} from "lucide-react";
import { useUserPreferencesStore } from "@/lib/stores";

interface DBCMessage {
  id: number;
  name: string;
  dlc: number;
  sender: string;
  signals: DBCSignal[];
  comment?: string;
}

interface DBCSignal {
  name: string;
  startBit: number;
  bitLength: number;
  byteOrder: "little" | "big";
  valueType: "signed" | "unsigned";
  factor: number;
  offset: number;
  min: number;
  max: number;
  unit: string;
  receivers: string[];
  comment?: string;
  valueTable?: { [key: number]: string };
}

interface DBCNode {
  name: string;
  comment?: string;
}

interface DBCData {
  version?: string;
  nodes: DBCNode[];
  messages: DBCMessage[];
  envVars: string[];
}

export default function DBCViewerPage() {
  const [dbcFile, setDbcFile] = useState<File | null>(null);
  const [dbcData, setDbcData] = useState<DBCData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<DBCMessage | null>(
    null
  );

  const { addRecentlyUsedTool } = useUserPreferencesStore();

  useEffect(() => {
    addRecentlyUsedTool("dbc-viewer");
  }, [addRecentlyUsedTool]);

  // 解析 DBC 文件
  const parseDBCFile = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const data = parseDBCContent(text);
      setDbcData(data);
    } catch (err) {
      console.error("DBC 解析失败:", err);
      setError(err instanceof Error ? err.message : "解析失败");
    } finally {
      setLoading(false);
    }
  };

  // 解析 DBC 文件内容
  const parseDBCContent = (content: string): DBCData => {
    const lines = content.split("\n");
    const data: DBCData = {
      nodes: [],
      messages: [],
      envVars: [],
    };

    let currentMessage: DBCMessage | null = null;
    const messageComments: { [id: number]: string } = {};
    const signalComments: { [key: string]: string } = {};
    const valueTables: { [key: string]: { [key: number]: string } } = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 版本信息
      if (line.startsWith("VERSION")) {
        const match = line.match(/VERSION\s+"(.+)"/);
        if (match) data.version = match[1];
      }

      // 节点定义
      else if (line.startsWith("BU_:")) {
        const nodes = line.substring(4).trim().split(/\s+/);
        data.nodes = nodes.map((name) => ({ name }));
      }

      // 值表定义
      else if (line.startsWith("VAL_")) {
        const match = line.match(/VAL_\s+(\d+)\s+(\w+)\s+(.+);/);
        if (match) {
          const [, msgId, signalName, valuesStr] = match;
          const key = `${msgId}_${signalName}`;
          const valueTable: { [key: number]: string } = {};

          const valueMatches = valuesStr.matchAll(/(\d+)\s+"([^"]+)"/g);
          for (const vm of valueMatches) {
            valueTable[parseInt(vm[1])] = vm[2];
          }
          valueTables[key] = valueTable;
        }
      }

      // 消息定义
      else if (line.startsWith("BO_")) {
        const match = line.match(/BO_\s+(\d+)\s+(\w+)\s*:\s*(\d+)\s+(\w+)/);
        if (match) {
          const [, id, name, dlc, sender] = match;
          currentMessage = {
            id: parseInt(id),
            name,
            dlc: parseInt(dlc),
            sender,
            signals: [],
          };
          data.messages.push(currentMessage);
        }
      }

      // 信号定义
      else if (line.startsWith("SG_") && currentMessage) {
        const match = line.match(
          /SG_\s+(\w+)\s*:\s*(\d+)\|(\d+)@([01])([+-])\s*\(([^,]+),([^)]+)\)\s*\[([^|]+)\|([^\]]+)\]\s*"([^"]*)"\s*(.+)/
        );
        if (match) {
          const [
            ,
            name,
            startBit,
            bitLength,
            byteOrder,
            valueType,
            factor,
            offset,
            min,
            max,
            unit,
            receivers,
          ] = match;

          const signal: DBCSignal = {
            name,
            startBit: parseInt(startBit),
            bitLength: parseInt(bitLength),
            byteOrder: byteOrder === "1" ? "little" : "big",
            valueType: valueType === "+" ? "unsigned" : "signed",
            factor: parseFloat(factor),
            offset: parseFloat(offset),
            min: parseFloat(min),
            max: parseFloat(max),
            unit,
            receivers: receivers.split(",").map((r) => r.trim()),
          };

          // 添加值表
          const key = `${currentMessage.id}_${name}`;
          if (valueTables[key]) {
            signal.valueTable = valueTables[key];
          }

          currentMessage.signals.push(signal);
        }
      }

      // 注释
      else if (line.startsWith("CM_")) {
        // 消息注释
        const msgMatch = line.match(/CM_\s+BO_\s+(\d+)\s+"([^"]+)"/);
        if (msgMatch) {
          messageComments[parseInt(msgMatch[1])] = msgMatch[2];
        }

        // 信号注释
        const sigMatch = line.match(/CM_\s+SG_\s+(\d+)\s+(\w+)\s+"([^"]+)"/);
        if (sigMatch) {
          const key = `${sigMatch[1]}_${sigMatch[2]}`;
          signalComments[key] = sigMatch[3];
        }
      }
    }

    // 应用注释
    data.messages.forEach((msg) => {
      if (messageComments[msg.id]) {
        msg.comment = messageComments[msg.id];
      }
      msg.signals.forEach((sig) => {
        const key = `${msg.id}_${sig.name}`;
        if (signalComments[key]) {
          sig.comment = signalComments[key];
        }
      });
    });

    return data;
  };

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".dbc")) {
      setError("请上传 .dbc 文件");
      return;
    }

    setDbcFile(file);
    parseDBCFile(file);
  };

  // 过滤消息
  const filteredMessages = dbcData?.messages.filter(
    (msg) =>
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.id.toString().includes(searchTerm) ||
      msg.signals.some((sig) =>
        sig.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // 导出为 JSON
  const exportToJSON = () => {
    if (!dbcData) return;
    const json = JSON.stringify(dbcData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${dbcFile?.name.replace(".dbc", "")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 标题 */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-block mb-4"
          >
            <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Radio className="h-10 w-10 text-white" />
            </div>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
            DBC Viewer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            在线解析和预览 CAN 数据库（DBC）文件
          </p>
        </div>

        {/* 上传区域 */}
        {!dbcFile && (
          <Card className="border-border/50 shadow-xl shadow-blue-500/5 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-600" />
                上传 DBC 文件
              </CardTitle>
              <CardDescription>
                选择 CAN 数据库文件进行解析和预览
              </CardDescription>
            </CardHeader>
            <CardContent>
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-12 w-12 text-blue-600 mb-4" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">点击上传</span>{" "}
                    或拖拽文件到此处
                  </p>
                  <p className="text-xs text-muted-foreground">
                    支持 .dbc 格式
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".dbc"
                  onChange={handleFileUpload}
                />
              </label>
              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 加载状态 */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-muted-foreground">解析 DBC 文件...</span>
          </div>
        )}

        {/* DBC 数据展示 */}
        {dbcData && !loading && (
          <div className="space-y-6">
            {/* 文件信息和操作栏 */}
            <Card className="border-border/50 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      {dbcFile?.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {dbcData.version && <span>版本: {dbcData.version}</span>}
                      <span>{dbcData.nodes.length} 个节点</span>
                      <span>{dbcData.messages.length} 条消息</span>
                      <span>
                        {dbcData.messages.reduce(
                          (sum, msg) => sum + msg.signals.length,
                          0
                        )}{" "}
                        个信号
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={exportToJSON}>
                      <Download className="h-4 w-4 mr-2" />
                      导出 JSON
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDbcFile(null);
                        setDbcData(null);
                        setError(null);
                      }}
                    >
                      重新上传
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 搜索栏 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索消息或信号..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 消息表格 */}
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  CAN 消息列表
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left p-3 font-semibold text-sm">
                          选择
                        </th>
                        <th className="text-left p-3 font-semibold text-sm">
                          消息名称
                        </th>
                        <th className="text-left p-3 font-semibold text-sm">
                          CAN ID
                        </th>
                        <th className="text-left p-3 font-semibold text-sm">
                          DLC
                        </th>
                        <th className="text-left p-3 font-semibold text-sm">
                          发送者
                        </th>
                        <th className="text-left p-3 font-semibold text-sm">
                          信号数
                        </th>
                        <th className="text-left p-3 font-semibold text-sm">
                          注释
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMessages?.map((message) => (
                        <tr
                          key={message.id}
                          className={`border-b border-border hover:bg-muted/30 cursor-pointer transition-colors ${
                            selectedMessage?.id === message.id
                              ? "bg-blue-500/10"
                              : ""
                          }`}
                          onClick={() => setSelectedMessage(message)}
                        >
                          <td className="p-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                selectedMessage?.id === message.id
                                  ? "border-blue-500 bg-blue-500"
                                  : "border-border"
                              }`}
                            >
                              {selectedMessage?.id === message.id && (
                                <div className="w-2 h-2 bg-white rounded-full" />
                              )}
                            </div>
                          </td>
                          <td className="p-3 font-medium">{message.name}</td>
                          <td className="p-3">
                            <code className="px-2 py-1 bg-blue-500/10 text-blue-600 rounded text-sm font-mono">
                              0x
                              {message.id
                                .toString(16)
                                .toUpperCase()
                                .padStart(3, "0")}
                            </code>
                          </td>
                          <td className="p-3 text-center">{message.dlc}</td>
                          <td className="p-3">{message.sender}</td>
                          <td className="p-3 text-center">
                            {message.signals.length}
                          </td>
                          <td className="p-3 text-sm text-muted-foreground max-w-xs truncate">
                            {message.comment || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredMessages?.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      没有找到匹配的消息
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 信号表格 */}
            {selectedMessage && (
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-blue-600" />
                      CAN 信号列表 ({selectedMessage.name})
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedMessage(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    消息 ID: 0x
                    {selectedMessage.id
                      .toString(16)
                      .toUpperCase()
                      .padStart(3, "0")}{" "}
                    | DLC: {selectedMessage.dlc} | 发送者:{" "}
                    {selectedMessage.sender}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="text-left p-2 font-semibold">
                            信号名称
                          </th>
                          <th className="text-left p-2 font-semibold">
                            起始位
                          </th>
                          <th className="text-left p-2 font-semibold">
                            位长度
                          </th>
                          <th className="text-left p-2 font-semibold">
                            字节序
                          </th>
                          <th className="text-left p-2 font-semibold">
                            值类型
                          </th>
                          <th className="text-left p-2 font-semibold">因子</th>
                          <th className="text-left p-2 font-semibold">偏移</th>
                          <th className="text-left p-2 font-semibold">
                            最小值
                          </th>
                          <th className="text-left p-2 font-semibold">
                            最大值
                          </th>
                          <th className="text-left p-2 font-semibold">单位</th>
                          <th className="text-left p-2 font-semibold">
                            接收者
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedMessage.signals.map((signal, index) => (
                          <tr
                            key={index}
                            className="border-b border-border hover:bg-muted/30"
                          >
                            <td className="p-2">
                              <div>
                                <div className="font-medium">{signal.name}</div>
                                {signal.comment && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {signal.comment}
                                  </div>
                                )}
                                {signal.valueTable &&
                                  Object.keys(signal.valueTable).length > 0 && (
                                    <div className="text-xs text-blue-600 mt-1">
                                      值表:{" "}
                                      {Object.entries(signal.valueTable)
                                        .slice(0, 2)
                                        .map(([k, v]) => `${k}=${v}`)
                                        .join(", ")}
                                      {Object.keys(signal.valueTable).length >
                                        2 && "..."}
                                    </div>
                                  )}
                              </div>
                            </td>
                            <td className="p-2 font-mono text-center">
                              {signal.startBit}
                            </td>
                            <td className="p-2 font-mono text-center">
                              {signal.bitLength}
                            </td>
                            <td className="p-2">
                              {signal.byteOrder === "little" ? "小端" : "大端"}
                            </td>
                            <td className="p-2">
                              {signal.valueType === "signed"
                                ? "有符号"
                                : "无符号"}
                            </td>
                            <td className="p-2 font-mono">{signal.factor}</td>
                            <td className="p-2 font-mono">{signal.offset}</td>
                            <td className="p-2 font-mono">{signal.min}</td>
                            <td className="p-2 font-mono">{signal.max}</td>
                            <td className="p-2">{signal.unit || "-"}</td>
                            <td className="p-2 text-xs">
                              {signal.receivers.join(", ")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
