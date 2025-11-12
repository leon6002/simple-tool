"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "./pdf-tools.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Upload,
  Download,
  Image as ImageIcon,
  Sparkles,
  CheckCircle,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  FileImage,
} from "lucide-react";
import { useUserPreferencesStore } from "@/lib/stores";
import dynamic from "next/dynamic";

// 动态导入 react-pdf 以避免 SSR 问题
const Document = dynamic(
  () => import("react-pdf").then((mod) => mod.Document),
  { ssr: false }
);
const Page = dynamic(() => import("react-pdf").then((mod) => mod.Page), {
  ssr: false,
});

export default function PDFToolsPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>("1");
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [imageFormat, setImageFormat] = useState<"png" | "jpeg">("png");
  const [imageQuality, setImageQuality] = useState(90);
  const [scale, setScale] = useState(2);
  const [previewScale, setPreviewScale] = useState(1.5);
  const [convertedImages, setConvertedImages] = useState<
    { pageNumber: number; dataUrl: string; blob: Blob }[]
  >([]);
  const [workerReady, setWorkerReady] = useState(false);
  const pageRefs = useRef<{ [key: number]: HTMLCanvasElement | null }>({});
  const previewRef = useRef<HTMLDivElement>(null);

  const { addRecentlyUsedTool } = useUserPreferencesStore();

  useEffect(() => {
    addRecentlyUsedTool("pdf-tools");
  }, [addRecentlyUsedTool]);

  // 配置 PDF.js worker（仅在客户端）
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("react-pdf")
        .then((mod) => {
          // 使用本地 worker 文件
          mod.pdfjs.GlobalWorkerOptions.workerSrc = "/js/pdf.worker.min.js";
          console.log("PDF.js worker 配置完成，版本:", mod.pdfjs.version);
          setWorkerReady(true);
        })
        .catch((error) => {
          console.error("PDF.js worker 配置失败:", error);
        });
    }
  }, []);

  // 清理 URL
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      alert("请上传 PDF 文件");
      return;
    }

    setPdfFile(file);
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    setSelectedPages(new Set());
    setConvertedImages([]);
    setLoading(true);
  };

  // PDF 加载成功
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log("PDF 加载成功，共", numPages, "页");
    setNumPages(numPages);
    // 默认选中所有页面
    const allPages = new Set<number>();
    for (let i = 1; i <= numPages; i++) {
      allPages.add(i);
    }
    setSelectedPages(allPages);
    setLoading(false);
  };

  // PDF 加载错误
  const onDocumentLoadError = (error: Error) => {
    console.error("PDF 加载失败:", error);
    alert(
      `PDF 加载失败: ${error.message}\n请检查文件是否损坏或尝试其他 PDF 文件`
    );
    setLoading(false);
    setPdfUrl(null);
    setPdfFile(null);
  };

  // 切换页面选择
  const togglePageSelection = (pageNumber: number) => {
    setSelectedPages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pageNumber)) {
        newSet.delete(pageNumber);
      } else {
        newSet.add(pageNumber);
      }
      return newSet;
    });
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedPages.size === numPages) {
      setSelectedPages(new Set());
    } else {
      const allPages = new Set<number>();
      for (let i = 1; i <= numPages; i++) {
        allPages.add(i);
      }
      setSelectedPages(allPages);
    }
  };

  // 跳转到指定页面
  const goToPage = (page: number) => {
    if (page >= 1 && page <= numPages) {
      setCurrentPage(page);
      setPageInput(page.toString());
      // 滚动到预览区域顶部
      previewRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // 处理页码输入
  const handlePageInputChange = (value: string) => {
    setPageInput(value);
    const pageNum = parseInt(value);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= numPages) {
      setCurrentPage(pageNum);
    }
  };

  // 上一页
  const previousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  // 下一页
  const nextPage = () => {
    if (currentPage < numPages) {
      goToPage(currentPage + 1);
    }
  };

  // 转换为图片
  const convertToImages = async () => {
    if (selectedPages.size === 0) {
      alert("请至少选择一页");
      return;
    }

    setConverting(true);
    const images: { pageNumber: number; dataUrl: string; blob: Blob }[] = [];

    try {
      // 使用 canvas 从 DOM 中的 Page 组件获取图片
      for (const pageNum of Array.from(selectedPages).sort((a, b) => a - b)) {
        const canvas = pageRefs.current[pageNum];
        if (!canvas) continue;

        // 转换为指定格式
        const mimeType = imageFormat === "png" ? "image/png" : "image/jpeg";
        const quality = imageFormat === "jpeg" ? imageQuality / 100 : undefined;

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), mimeType, quality);
        });

        const dataUrl = canvas.toDataURL(mimeType, quality);

        images.push({
          pageNumber: pageNum,
          dataUrl,
          blob,
        });
      }

      setConvertedImages(images);
    } catch (error) {
      console.error("转换失败:", error);
      alert("转换失败，请重试");
    } finally {
      setConverting(false);
    }
  };

  // 下载单张图片
  const downloadImage = (image: {
    pageNumber: number;
    dataUrl: string;
    blob: Blob;
  }) => {
    const link = document.createElement("a");
    link.href = image.dataUrl;
    link.download = `page-${image.pageNumber}.${imageFormat}`;
    link.click();
  };

  // 下载所有图片（打包为 ZIP）
  const downloadAllImages = async () => {
    if (convertedImages.length === 0) return;

    // 简单实现：逐个下载
    // 如果需要打包为 ZIP，可以使用 JSZip 库
    for (const image of convertedImages) {
      downloadImage(image);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  };

  // 重置
  const reset = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfFile(null);
    setPdfUrl(null);
    setNumPages(0);
    setSelectedPages(new Set());
    setConvertedImages([]);
    pageRefs.current = {};
  };

  return (
    <div className="container mx-auto max-w-7xl py-12 md:py-16 lg:py-20 px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 头部 */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-red-500/10 via-orange-500/10 to-yellow-500/10 border border-orange-500/20"
          >
            <FileText className="h-8 w-8 text-orange-600" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
            PDF Tools
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            将 PDF 页面转换为高质量图片
          </p>
        </div>

        {/* 上传区域 */}
        {!pdfFile && (
          <Card className="border-border/50 shadow-xl shadow-orange-500/5 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-orange-600" />
                上传 PDF 文件
              </CardTitle>
              <CardDescription>
                选择要转换的 PDF 文件，支持多页选择
                {!workerReady && (
                  <span className="ml-2 text-orange-600">
                    (正在加载 PDF 引擎...)
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <label
                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-2xl transition-all ${
                  workerReady
                    ? "cursor-pointer hover:border-orange-500/50 hover:bg-orange-500/5"
                    : "cursor-not-allowed opacity-50"
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {workerReady ? (
                    <>
                      <Upload className="h-12 w-12 text-orange-600 mb-4" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">点击上传</span>{" "}
                        或拖拽文件到此处
                      </p>
                      <p className="text-xs text-muted-foreground">
                        支持 PDF 格式
                      </p>
                    </>
                  ) : (
                    <>
                      <Loader2 className="h-12 w-12 text-orange-600 mb-4 animate-spin" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        正在加载 PDF 引擎...
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,application/pdf"
                  onChange={handleFileUpload}
                  disabled={!workerReady}
                />
              </label>
            </CardContent>
          </Card>
        )}

        {/* PDF 已加载 */}
        {pdfFile && (
          <div className="space-y-6">
            {/* 文件信息和操作 */}
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-orange-600" />
                      {pdfFile.name}
                    </CardTitle>
                    <CardDescription>
                      共 {numPages} 页 · 已选择 {selectedPages.size} 页
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={reset}>
                    <X className="h-4 w-4 mr-2" />
                    重新上传
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* 转换设置 */}
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-orange-600" />
                  转换设置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 图片格式 */}
                  <div className="space-y-2">
                    <Label>图片格式</Label>
                    <Select
                      value={imageFormat}
                      onValueChange={(value: "png" | "jpeg") =>
                        setImageFormat(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG（无损）</SelectItem>
                        <SelectItem value="jpeg">JPEG（压缩）</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 图片质量（仅 JPEG） */}
                  {imageFormat === "jpeg" && (
                    <div className="space-y-2">
                      <Label>图片质量: {imageQuality}%</Label>
                      <Slider
                        value={[imageQuality]}
                        onValueChange={(value) => setImageQuality(value[0])}
                        min={50}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                  )}

                  {/* 分辨率 */}
                  <div className="space-y-2">
                    <Label>分辨率倍数: {scale}x</Label>
                    <Slider
                      value={[scale]}
                      onValueChange={(value) => setScale(value[0])}
                      min={1}
                      max={4}
                      step={0.5}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {scale === 1 && "标准（72 DPI）"}
                      {scale === 1.5 && "中等（108 DPI）"}
                      {scale === 2 && "高清（144 DPI）"}
                      {scale === 2.5 && "超清（180 DPI）"}
                      {scale === 3 && "极清（216 DPI）"}
                      {scale === 3.5 && "4K（252 DPI）"}
                      {scale === 4 && "8K（288 DPI）"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PDF 阅读器布局 */}
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-orange-600" />
                    PDF 预览与选择
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      已选择 {selectedPages.size} / {numPages} 页
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleSelectAll}
                    >
                      {selectedPages.size === numPages ? "取消全选" : "全选"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* 隐藏的 PDF 文档用于高质量渲染 */}
                <div className="hidden">
                  {pdfUrl && (
                    <Document
                      file={pdfUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                    >
                      {numPages > 0 && (
                        <Page
                          pageNumber={currentPage}
                          scale={scale}
                          canvasRef={(ref) => {
                            if (ref) pageRefs.current[currentPage] = ref;
                          }}
                        />
                      )}
                    </Document>
                  )}
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                    <span className="ml-3 text-muted-foreground">
                      加载 PDF 页面...
                    </span>
                  </div>
                ) : (
                  <div className="flex gap-4 h-[600px]">
                    {/* 左侧：缩略图导航 */}
                    <div className="w-48 shrink-0 border-r border-border pr-4">
                      <div className="h-full overflow-y-auto space-y-2 custom-scrollbar">
                        {Array.from({ length: numPages }, (_, i) => i + 1).map(
                          (pageNum) => (
                            <div
                              key={pageNum}
                              className={`relative cursor-pointer rounded-lg border-2 transition-all hover:shadow-md ${
                                currentPage === pageNum
                                  ? "border-orange-500 ring-2 ring-orange-500/20"
                                  : selectedPages.has(pageNum)
                                  ? "border-orange-300"
                                  : "border-border hover:border-orange-200"
                              }`}
                              onClick={() => {
                                goToPage(pageNum);
                                togglePageSelection(pageNum);
                              }}
                            >
                              <div className="aspect-3/4 relative overflow-hidden rounded-t-lg bg-gray-100 dark:bg-gray-800">
                                {pdfUrl && (
                                  <Document file={pdfUrl}>
                                    <Page
                                      pageNumber={pageNum}
                                      width={150}
                                      renderTextLayer={false}
                                      renderAnnotationLayer={false}
                                    />
                                  </Document>
                                )}
                              </div>
                              <div className="p-1.5 text-center bg-background">
                                <span className="text-xs font-medium">
                                  {pageNum}
                                </span>
                              </div>
                              {selectedPages.has(pageNum) && (
                                <div className="absolute top-1 right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                                  <CheckCircle className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* 右侧：大图预览 */}
                    <div className="flex-1 flex flex-col">
                      {/* 页面导航控制栏 */}
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={previousPage}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              max={numPages}
                              value={pageInput}
                              onChange={(e) =>
                                handlePageInputChange(e.target.value)
                              }
                              className="w-16 px-2 py-1 text-center text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            <span className="text-sm text-muted-foreground">
                              / {numPages}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={nextPage}
                            disabled={currentPage === numPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          <Label className="text-sm">预览缩放:</Label>
                          <Slider
                            value={[previewScale]}
                            onValueChange={(value) => setPreviewScale(value[0])}
                            min={0.5}
                            max={3}
                            step={0.25}
                            className="w-32"
                          />
                          <span className="text-sm text-muted-foreground w-12">
                            {Math.round(previewScale * 100)}%
                          </span>
                        </div>
                      </div>

                      {/* 预览区域 */}
                      <div
                        ref={previewRef}
                        className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center custom-scrollbar"
                      >
                        {pdfUrl && (
                          <div className="p-4">
                            <Document file={pdfUrl}>
                              <Page
                                pageNumber={currentPage}
                                scale={previewScale}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                className="shadow-2xl"
                              />
                            </Document>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 转换按钮 */}
            {!converting && convertedImages.length === 0 && (
              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={convertToImages}
                  disabled={selectedPages.size === 0}
                  className="bg-linear-to-r from-red-600 via-orange-600 to-yellow-600 hover:from-red-700 hover:via-orange-700 hover:to-yellow-700 text-white px-8"
                >
                  <ImageIcon className="h-5 w-5 mr-2" />
                  转换为图片
                </Button>
              </div>
            )}

            {/* 转换中 */}
            {converting && (
              <Card className="border-border/50 shadow-lg">
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-orange-600 mb-4" />
                    <p className="text-lg font-medium mb-2">正在转换...</p>
                    <p className="text-sm text-muted-foreground">
                      请稍候，正在生成高质量图片
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 转换结果 */}
            {convertedImages.length > 0 && (
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileImage className="h-5 w-5 text-orange-600" />
                        转换完成
                      </CardTitle>
                      <CardDescription>
                        已生成 {convertedImages.length} 张图片
                      </CardDescription>
                    </div>
                    <Button onClick={downloadAllImages}>
                      <Download className="h-4 w-4 mr-2" />
                      下载全部
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {convertedImages.map((image) => (
                      <div
                        key={image.pageNumber}
                        className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="aspect-3/4 relative bg-gray-100 dark:bg-gray-800">
                          <img
                            src={image.dataUrl}
                            alt={`Page ${image.pageNumber}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="p-3 flex items-center justify-between">
                          <span className="text-sm font-medium">
                            第 {image.pageNumber} 页
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadImage(image)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            下载
                          </Button>
                        </div>
                      </div>
                    ))}
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
