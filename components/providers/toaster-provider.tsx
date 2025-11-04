"use client";

import { Toaster } from "react-hot-toast";
import { useTheme } from "next-themes";

export function ToasterProvider() {
  const { theme } = useTheme();

  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // 默认配置
        duration: 2000,
        style: {
          background: theme === "dark" ? "#1e293b" : "#ffffff",
          color: theme === "dark" ? "#f1f5f9" : "#0f172a",
          border: theme === "dark" ? "1px solid #334155" : "1px solid #e2e8f0",
          padding: "12px 16px",
          borderRadius: "12px",
          fontSize: "14px",
          fontWeight: "500",
          boxShadow:
            theme === "dark"
              ? "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)"
              : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        },
        // 成功提示样式
        success: {
          duration: 2000,
          iconTheme: {
            primary: "#8b5cf6",
            secondary: "#ffffff",
          },
          style: {
            background:
              theme === "dark"
                ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
                : "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
            border:
              theme === "dark"
                ? "1px solid rgba(139, 92, 246, 0.3)"
                : "1px solid rgba(139, 92, 246, 0.2)",
          },
        },
        // 错误提示样式
        error: {
          duration: 3000,
          iconTheme: {
            primary: "#ef4444",
            secondary: "#ffffff",
          },
        },
        // 加载提示样式
        loading: {
          iconTheme: {
            primary: "#8b5cf6",
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
}

