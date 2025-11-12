"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Copy,
  Download,
  RotateCcw,
  Eye,
  Code,
  Info,
} from "lucide-react";
import "highlight.js/styles/github-dark.css";

const DEFAULT_MARKDOWN = `# Markdown Editor

Welcome to the **Markdown Editor**! This is a powerful online tool for writing and previewing Markdown.

## Features

- ✅ Real-time preview
- ✅ GitHub Flavored Markdown (GFM)
- ✅ Syntax highlighting for code blocks
- ✅ Tables, task lists, and more
- ✅ Export to Markdown file

## Text Formatting

You can make text **bold**, *italic*, or ***bold and italic***.

You can also use ~~strikethrough~~ text.

## Lists

### Unordered List
- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
- Item 3

### Ordered List
1. First item
2. Second item
3. Third item

### Task List
- [x] Completed task
- [ ] Incomplete task
- [ ] Another task

## Code

Inline code: \`const greeting = "Hello, World!";\`

### Code Block with Syntax Highlighting

\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // Output: 55
\`\`\`

\`\`\`python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

print(quicksort([3, 6, 8, 10, 1, 2, 1]))
\`\`\`

## Tables

| Feature | Supported | Notes |
|---------|-----------|-------|
| Headers | ✅ | H1-H6 |
| Lists | ✅ | Ordered & Unordered |
| Code | ✅ | Inline & Blocks |
| Tables | ✅ | GFM Tables |
| Links | ✅ | [Example](https://example.com) |

## Links and Images

[Visit GitHub](https://github.com)

![Placeholder Image](https://via.placeholder.com/400x200?text=Markdown+Image)

## Blockquotes

> This is a blockquote.
> 
> It can span multiple lines.
> 
> > Nested blockquotes are also supported.

## Horizontal Rule

---

## HTML Support

<div style="color: #4CAF50; font-weight: bold;">
  You can also use HTML in Markdown!
</div>

---

**Happy writing!** 🚀
`;

export default function MarkdownEditorPage() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [showPreview, setShowPreview] = useState(true);

  const copyMarkdown = () => {
    navigator.clipboard.writeText(markdown);
  };

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `markdown-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setMarkdown(DEFAULT_MARKDOWN);
  };

  const clear = () => {
    setMarkdown("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-[1800px]">
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
            className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20"
          >
            <FileText className="h-8 w-8 text-blue-600" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Markdown Editor
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            在线 Markdown 编辑器，支持实时预览、代码高亮、GFM 语法
          </p>
        </motion.div>

        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex flex-wrap gap-3 justify-center"
        >
          <Button
            onClick={() => setShowPreview(!showPreview)}
            variant="outline"
            className="gap-2"
          >
            {showPreview ? (
              <>
                <Code className="h-4 w-4" />
                编辑模式
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                预览模式
              </>
            )}
          </Button>
          <Button onClick={copyMarkdown} variant="outline" className="gap-2">
            <Copy className="h-4 w-4" />
            复制 Markdown
          </Button>
          <Button
            onClick={downloadMarkdown}
            variant="outline"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            下载 .md 文件
          </Button>
          <Button onClick={reset} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            重置示例
          </Button>
          <Button onClick={clear} variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            清空
          </Button>
        </motion.div>

        {/* Editor and Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={showPreview ? "" : "lg:col-span-2"}
          >
            <Card className="border-border/50 shadow-lg h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-blue-600" />
                  Markdown 输入
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  placeholder="在这里输入 Markdown..."
                  className="font-mono text-sm min-h-[600px] resize-none"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Preview */}
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-border/50 shadow-lg h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-indigo-600" />
                    预览
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-slate dark:prose-invert max-w-none min-h-[600px] overflow-auto prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl prose-h5:text-lg prose-h6:text-base prose-p:my-4 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:font-bold prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-transparent prose-pre:p-0 prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-img:rounded-lg prose-hr:my-8 prose-table:border-collapse prose-th:border prose-th:border-gray-300 prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-th:px-4 prose-th:py-2 prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2 prose-ul:list-disc prose-ol:list-decimal">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight, rehypeRaw]}
                      components={{
                        // 自定义组件以确保正确渲染
                        h1: ({ node, ...props }) => (
                          <h1
                            className="text-4xl font-bold mt-8 mb-4"
                            {...props}
                          />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2
                            className="text-3xl font-bold mt-6 mb-3"
                            {...props}
                          />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3
                            className="text-2xl font-bold mt-5 mb-2"
                            {...props}
                          />
                        ),
                        h4: ({ node, ...props }) => (
                          <h4
                            className="text-xl font-bold mt-4 mb-2"
                            {...props}
                          />
                        ),
                        h5: ({ node, ...props }) => (
                          <h5
                            className="text-lg font-bold mt-3 mb-2"
                            {...props}
                          />
                        ),
                        h6: ({ node, ...props }) => (
                          <h6
                            className="text-base font-bold mt-2 mb-1"
                            {...props}
                          />
                        ),
                        p: ({ node, ...props }) => (
                          <p className="my-4 leading-7" {...props} />
                        ),
                        a: ({ node, ...props }) => (
                          <a
                            className="text-blue-600 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                          />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul
                            className="list-disc list-inside my-4 space-y-2"
                            {...props}
                          />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol
                            className="list-decimal list-inside my-4 space-y-2"
                            {...props}
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="ml-4" {...props} />
                        ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote
                            className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-600 dark:text-gray-400"
                            {...props}
                          />
                        ),
                        code: ({ node, inline, ...props }: any) =>
                          inline ? (
                            <code
                              className="bg-gray-200 dark:bg-gray-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded text-sm font-mono"
                              {...props}
                            />
                          ) : (
                            <code {...props} />
                          ),
                        pre: ({ node, ...props }) => (
                          <pre className="my-4 overflow-x-auto" {...props} />
                        ),
                        table: ({ node, ...props }) => (
                          <div className="overflow-x-auto my-6">
                            <table
                              className="min-w-full border-collapse border border-gray-300 dark:border-gray-700"
                              {...props}
                            />
                          </div>
                        ),
                        thead: ({ node, ...props }) => (
                          <thead
                            className="bg-gray-100 dark:bg-gray-800"
                            {...props}
                          />
                        ),
                        th: ({ node, ...props }) => (
                          <th
                            className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left font-semibold"
                            {...props}
                          />
                        ),
                        td: ({ node, ...props }) => (
                          <td
                            className="border border-gray-300 dark:border-gray-700 px-4 py-2"
                            {...props}
                          />
                        ),
                        hr: ({ node, ...props }) => (
                          <hr
                            className="my-8 border-t border-gray-300 dark:border-gray-700"
                            {...props}
                          />
                        ),
                        img: ({ node, ...props }) => (
                          <img
                            className="rounded-lg my-4 max-w-full h-auto"
                            {...props}
                          />
                        ),
                      }}
                    >
                      {markdown}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="border-border/50 bg-muted/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-5 w-5 text-blue-600" />
                支持的功能
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="font-medium">✅ 基础语法</p>
                <ul className="text-muted-foreground space-y-1 ml-4">
                  <li>• 标题 (H1-H6)</li>
                  <li>• 粗体、斜体、删除线</li>
                  <li>• 列表（有序、无序）</li>
                  <li>• 链接和图片</li>
                  <li>• 引用块</li>
                  <li>• 水平分割线</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-medium">✅ 高级功能</p>
                <ul className="text-muted-foreground space-y-1 ml-4">
                  <li>• GitHub Flavored Markdown (GFM)</li>
                  <li>• 表格</li>
                  <li>• 任务列表</li>
                  <li>• 代码块语法高亮</li>
                  <li>• HTML 支持</li>
                  <li>• 自动链接</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
