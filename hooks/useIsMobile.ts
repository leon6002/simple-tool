import { useEffect, useState } from "react";

/**
 * 自定义Hook，用于检测当前设备是否为移动设备
 * @param breakpoint 移动设备断点，默认为768px
 * @returns boolean，true表示是移动设备，false表示是桌面设备
 */
export function useIsMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkIsMobile = () => {
      // 检查屏幕宽度
      const isMobileWidth = window.innerWidth < breakpoint;

      // 检查用户代理
      const userAgent =
        typeof navigator === "undefined" ? "" : navigator.userAgent;
      const isMobileUserAgent =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          userAgent
        );

      setIsMobile(isMobileWidth || isMobileUserAgent);
    };

    // 初始化检查
    checkIsMobile();

    // 添加窗口大小变化监听器
    window.addEventListener("resize", checkIsMobile);

    // 清理函数
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, [breakpoint]);

  return isMobile;
}
