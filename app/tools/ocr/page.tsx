"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Loader2,
  Copy,
  Download,
  Image as ImageIcon,
  FileText,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { codeToHtml } from "shiki";

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface OCRBlock {
  type: "text" | "title" | "image";
  content: string;
  bbox: BoundingBox;
}

export default function OCRPage() {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [ocrText, setOcrText] = useState<string>("");
  const [cleanedText, setCleanedText] = useState<string>("");
  const [renderedHtml, setRenderedHtml] = useState<string>("");
  const [ocrBlocks, setOcrBlocks] = useState<OCRBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Parse OCR text to extract position information
  const parseOCRText = useCallback((text: string): OCRBlock[] => {
    const blocks: OCRBlock[] = [];
    const regex =
      /<\|ref\|>(\w+)<\|\/ref\|><\|det\|>\[\[([^\]]+)\]\]<\|\/det\|>[\n\r]?([\s\S]*?)(?=<\|ref\|>|$)/g;

    let match;
    while ((match = regex.exec(text)) !== null) {
      const type = match[1] as "text" | "title" | "image";
      const coords = match[2].split(",").map(Number);
      const content = match[3].trim();

      if (coords.length === 4) {
        const [x1, y1, x2, y2] = coords;
        blocks.push({
          type,
          content,
          bbox: {
            x: x1,
            y: y1,
            width: x2 - x1,
            height: y2 - y1,
          },
        });
      }
    }

    return blocks;
  }, []);

  // Clean OCR text by removing position markers
  const cleanOCRText = useCallback((text: string): string => {
    return text
      .replace(/<\|ref\|>.*?<\|\/ref\|><\|det\|>.*?<\|\/det\|>\n?/g, "")
      .trim();
  }, []);

  // Render markdown with shiki
  const renderMarkdown = useCallback(async (markdown: string) => {
    try {
      const html = await codeToHtml(markdown, {
        lang: "markdown",
        theme: "github-dark",
      });
      setRenderedHtml(html);
    } catch (error) {
      console.error("Failed to render markdown:", error);
      // Fallback to plain text if rendering fails
      setRenderedHtml(`<pre>${markdown}</pre>`);
    }
  }, []);

  // Draw bounding boxes on canvas

  // Draw bounding boxes on canvas
  const drawBoundingBoxes = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || ocrBlocks.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. 获取容器 (<img> 元素) 的显示尺寸
    const displayWidth = img.width;
    const displayHeight = img.height;
    console.log("Display size:", displayWidth, displayHeight);

    // 2. 获取图片内容的原始尺寸
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    console.log("Image size:", naturalWidth, naturalHeight);

    canvas.width = displayWidth;
    canvas.height = displayHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 3. 计算 'object-fit: contain' 的真实缩放比例
    // (看哪条边是限制因素)
    const scale = Math.min(
      displayWidth / naturalWidth,
      displayHeight / naturalHeight
    );

    // 4. 计算图片内容在画布上渲染后的实际尺寸
    const renderedImgWidth = naturalWidth * scale;
    const renderedImgHeight = naturalHeight * scale;
    console.log("Rendered image size:", renderedImgWidth, renderedImgHeight);

    // 5. 计算图片内容在画布上的偏移量 (实现居中)
    // ai识别出来的就是向右偏移了10px，所以这里这题往左移10px
    const offsetX = (displayWidth - renderedImgWidth) / 2 - 10;
    // ai识别出来的就是向上便宜了50px，所以这里这题往下移50px
    const offsetY = (displayHeight - renderedImgHeight) / 2 + 10;
    console.log("Offset:", offsetX, offsetY);

    ocrBlocks.forEach((block, index) => {
      const isSelected = selectedBlock === index;
      const hasSelection = selectedBlock !== null;
      const isOther = hasSelection && !isSelected;

      // 6. 关键：应用正确的缩放 (scale) 和偏移量 (offset)
      // 注意：这里不再使用 scaleX 和 scaleY，统一使用 contain 计算出的 scale
      const x = block.bbox.x * scale + offsetX;
      const y = block.bbox.y * scale + offsetY;
      const width = block.bbox.width * scale;
      const height = block.bbox.height * scale;

      // Get base color
      const baseColor =
        block.type === "title"
          ? { r: 59, g: 130, b: 246 } // blue
          : block.type === "image"
          ? { r: 16, g: 185, b: 129 } // green
          : { r: 139, g: 92, b: 246 }; // purple

      // [开始] ... 绘制框体
      // Determine opacity based on selection state
      const strokeOpacity = isSelected ? 1 : isOther ? 0.3 : 1;
      const fillOpacity = isSelected ? 0.2 : isOther ? 0.05 : 0.1;

      // Set stroke style
      if (isSelected) {
        ctx.strokeStyle = "#f59e0b"; // amber for selected
      } else {
        ctx.strokeStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${strokeOpacity})`;
      }

      ctx.lineWidth = isSelected ? 4 : 2;

      // Set fill style
      if (isSelected) {
        ctx.fillStyle = "rgba(245, 158, 11, 0.2)"; // amber for selected
      } else {
        ctx.fillStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${fillOpacity})`;
      }

      ctx.fillRect(x, y, width, height);
      ctx.strokeRect(x, y, width, height);
      // [结束] ... 绘制框体

      // [开始] ... 绘制标签 (注意：所有地方的 scaleX/Y 都要替换成 scale)
      const label = `${block.type} #${index + 1}`;
      const fontSize = Math.max(12, 16 * scale); // 使用统一 scale
      ctx.font = `bold ${fontSize}px sans-serif`;
      const textWidth = ctx.measureText(label).width;
      const padding = 8 * scale; // 使用统一 scale
      const labelHeight = 30 * scale; // 使用统一 scale

      // Label background with opacity
      if (isSelected) {
        ctx.fillStyle = "#f59e0b";
      } else {
        ctx.fillStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${
          isOther ? 0.3 : 1
        })`;
      }
      ctx.fillRect(x, y - labelHeight, textWidth + padding * 2, labelHeight);

      // (可选) 修正文字垂直对齐
      ctx.textBaseline = "middle"; // 设置基线为居中
      ctx.fillStyle = isOther ? "rgba(255, 255, 255, 0.5)" : "#ffffff";
      ctx.fillText(label, x + padding, y - labelHeight / 2); // 计算标签背景的垂直中点
      ctx.textBaseline = "alphabetic"; // 重置回默认值
      // [结束] ... 绘制标签
    });
  }, [ocrBlocks, selectedBlock]);

  useEffect(() => {
    if (imageRef.current && imageRef.current.complete) {
      drawBoundingBoxes();
    }
  }, [drawBoundingBoxes]);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        toast.error("图片大小不能超过 10MB");
        return;
      }

      setImageFile(file);
      setLoading(true);
      setOcrText("");
      setCleanedText("");
      setRenderedHtml("");
      setOcrBlocks([]);
      setSelectedBlock(null);

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64 = event.target?.result as string;
          setImage(base64);

          toast.loading("正在识别图片文字...", { id: "ocr" });
          const response = await fetch("/api/lottery/ocr-text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64 }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || "OCR 识别失败";
            toast.error(errorMessage, { id: "ocr" });
            setLoading(false);
            return;
          }

          const data = await response.json();
          if (!data.success || !data.ocrText) {
            toast.error("未能识别出文字", { id: "ocr" });
            setLoading(false);
            return;
          }

          toast.success("识别成功！", { id: "ocr" });
          setOcrText(data.ocrText);
          setOcrBlocks(parseOCRText(data.ocrText));
          const cleaned = cleanOCRText(data.ocrText);
          setCleanedText(cleaned);

          // Render markdown with shiki
          await renderMarkdown(cleaned);
        } catch (error) {
          console.error("OCR error:", error);
          const errorMessage =
            error instanceof Error ? error.message : "图片识别失败，请重试";
          toast.error(errorMessage, { id: "ocr" });
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        toast.error("图片读取失败", { id: "ocr" });
        setLoading(false);
      };

      reader.readAsDataURL(file);
    },
    [parseOCRText, cleanOCRText, renderMarkdown]
  );

  const copyText = useCallback(() => {
    navigator.clipboard.writeText(cleanedText);
    toast.success("文本已复制到剪贴板");
  }, [cleanedText]);

  const downloadText = useCallback(() => {
    const blob = new Blob([cleanedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ocr-result-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("文本已下载");
  }, [cleanedText]);

  const clearAll = useCallback(() => {
    setImage(null);
    setImageFile(null);
    setOcrText("");
    setCleanedText("");
    setRenderedHtml("");
    setOcrBlocks([]);
    setSelectedBlock(null);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-3 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          OCR 文字识别工具
        </h1>
        <p className="text-muted-foreground text-lg">
          上传图片，自动识别文字并标注位置信息
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">上传图片</Label>
                  {image && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={clearAll}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      清除
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <Label
                    htmlFor="ocr-upload"
                    className="flex-shrink-0 cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    <Upload className="h-4 w-4" />
                    {loading ? "识别中..." : "选择图片"}
                  </Label>
                  <Input
                    id="ocr-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={loading}
                    className="hidden"
                  />
                  {loading && (
                    <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                  )}
                  {imageFile && !loading && (
                    <span className="text-sm text-muted-foreground truncate">
                      {imageFile.name}
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  支持 JPG、PNG、WebP 等格式，最大 10MB
                </p>
              </div>
            </Card>
          </motion.div>

          {image && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">图片预览</Label>
                    <Badge variant="secondary">{ocrBlocks.length} 个区域</Badge>
                  </div>

                  <div className="relative w-full overflow-auto h-full bg-muted rounded-lg">
                    <div className="relative inline-block">
                      <img
                        ref={imageRef}
                        src={image}
                        alt="Uploaded"
                        className="w-full h-auto"
                        onLoad={drawBoundingBoxes}
                      />
                      <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          {cleanedText && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">识别结果</Label>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={copyText}>
                        <Copy className="h-4 w-4 mr-1" />
                        复制
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={downloadText}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        下载
                      </Button>
                    </div>
                  </div>

                  <div
                    className="overflow-auto max-h-[600px] rounded-lg [&_pre]:!m-0 [&_pre]:!rounded-lg [&_code]:!text-sm"
                    dangerouslySetInnerHTML={{ __html: renderedHtml }}
                  />
                </div>
              </Card>
            </motion.div>
          )}

          {ocrBlocks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6">
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">识别区域</Label>

                  <div className="space-y-2 max-h-[400px] overflow-auto">
                    {ocrBlocks.map((block, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedBlock(index)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedBlock === index
                            ? "border-amber-500 bg-amber-500/10"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="shrink-0">
                            {block.type === "title" ? (
                              <FileText className="h-5 w-5 text-blue-500" />
                            ) : block.type === "image" ? (
                              <ImageIcon className="h-5 w-5 text-green-500" />
                            ) : (
                              <FileText className="h-5 w-5 text-purple-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {block.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                #{index + 1}
                              </span>
                            </div>
                            {block.content && (
                              <p className="text-sm line-clamp-2">
                                {block.content}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              位置: ({block.bbox.x}, {block.bbox.y}) 大小:{" "}
                              {block.bbox.width}×{block.bbox.height}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
