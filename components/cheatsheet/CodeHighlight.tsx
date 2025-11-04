"use client";

import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";
import { useTheme } from "next-themes";

interface CodeHighlightProps {
  code: string;
  language: string;
  className?: string;
}

// 语言映射：将我们的语言名称映射到 Shiki 支持的语言
const languageMap: Record<string, string> = {
  dockerfile: "dockerfile",
  nginx: "nginx",
  bash: "bash",
  shell: "bash",
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  java: "java",
  yaml: "yaml",
  json: "json",
  xml: "xml",
  sql: "sql",
};

export function CodeHighlight({
  code,
  language,
  className = "",
}: CodeHighlightProps) {
  const [html, setHtml] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const highlightCode = async () => {
      try {
        setIsLoading(true);

        // 获取映射后的语言，如果没有映射则使用原语言，失败则使用 text
        const mappedLang =
          languageMap[language.toLowerCase()] || language.toLowerCase();

        // 根据当前主题选择对应的主题
        const theme = resolvedTheme === "dark" ? "github-dark" : "github-light";

        console.log("Highlighting code with:", { language, mappedLang, theme });

        const highlighted = await codeToHtml(code, {
          lang: mappedLang,
          theme: theme,
        });

        console.log("Highlight successful, HTML length:", highlighted.length);
        setHtml(highlighted);
      } catch (error) {
        console.error(
          "Failed to highlight code:",
          error,
          "Language:",
          language
        );
        // Fallback: 尝试使用 plaintext
        try {
          const theme =
            resolvedTheme === "dark" ? "github-dark" : "github-light";
          const fallback = await codeToHtml(code, {
            lang: "text",
            theme: theme,
          });
          setHtml(fallback);
        } catch (e) {
          console.error("Fallback also failed:", e);
          // 最终 fallback：纯文本
          setHtml(`<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    highlightCode();
  }, [code, language, resolvedTheme]);

  // HTML 转义函数
  const escapeHtml = (text: string) => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <pre className="h-full max-h-[400px] overflow-auto p-4 rounded-lg bg-muted">
          <code className="text-xs leading-relaxed font-mono whitespace-pre">
            {code}
          </code>
        </pre>
      </div>
    );
  }

  return (
    <div
      className={`shiki-wrapper ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
