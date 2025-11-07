export const FrequencyLegend = () => {
  return (
    <div className="flex items-center justify-between w-full max-w-xl text-sm select-none">
      {/* 左侧文字 */}
      <span className="text-slate-500">颜色对应频次图例：</span>
      <span className="text-sky-400 font-medium tracking-wide">低频</span>

      {/* 渐变条 */}
      <div
        className="h-3 w-full max-w-xs rounded-full shadow-inner mx-3 border border-gray-700"
        style={{
          background:
            "linear-gradient(to right, " +
            "rgba(37,99,235,0.25) 0%, " + // 深蓝
            "rgba(79,70,229,0.3) 20%, " + // 靛蓝
            "rgba(59,130,246,0.35) 30%, " + // 蓝
            "rgba(45,212,191,0.4) 40%, " + // 青
            "rgba(34,197,94,0.45) 50%, " + // 绿
            "rgba(190,242,100,0.55) 60%, " + // 黄绿
            "rgba(251,146,60,0.75) 70%, " + // 橙
            "rgba(249,115,22,0.8) 80%, " + // 橙红
            "rgba(239,68,68,0.85) 100%" + // 红
            ")",
        }}
      />

      {/* 右侧文字 */}
      <span className="text-rose-400 font-medium tracking-wide">高频</span>
    </div>
  );
};
