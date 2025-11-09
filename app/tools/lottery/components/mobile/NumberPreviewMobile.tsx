interface NumberPreviewProps {
  mainNumbers: number[];
  specialNumbers: number[];
}

export const NumberPreviewMobile = ({
  mainNumbers,
  specialNumbers,
}: NumberPreviewProps) => {
  return (
    <div className="md:hidden">
      <div className="shadow-md flex flex-col justify-center items-center gap-4 p-4 bg-muted/80 dark:bg-muted/30 rounded-lg h-[180px]">
        {/* 号码显示区域 */}
        <div className="flex flex-col gap-3 justify-center items-center w-full">
          <div className="flex flex-wrap gap-2 justify-center">
            {mainNumbers.map((num, idx) => (
              <div
                key={idx}
                className="flex flex-wrap shrink-0 w-10 h-10 rounded-full bg-linear-to-br from-blue-600 to-purple-600 text-white items-center justify-center font-bold text-sm shadow-md"
              >
                {`${num < 10 ? "0" : ""}${num}`}
              </div>
            ))}
          </div>

          {specialNumbers.length > 0 && (
            <>
              <div className="text-lg font-bold mx-2 text-muted-foreground">
                +
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {specialNumbers.map((num, idx) => (
                  <div
                    key={idx}
                    className="shrink-0 w-10 h-10 rounded-full bg-linear-to-br from-pink-600 to-red-600 text-white flex items-center justify-center font-bold text-sm shadow-md"
                  >
                    {`${num < 10 ? "0" : ""}${num}`}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 始终显示的提示文案 */}
        <p className="text-muted-foreground text-sm text-center">
          {mainNumbers.length == 0 &&
            specialNumbers.length == 0 &&
            "请选择彩票类型并生成号码"}
        </p>
      </div>
    </div>
  );
};
