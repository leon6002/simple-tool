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
      <div className="flex justify-center items-center gap-2 p-3 bg-muted/30 rounded-lg min-h-[180px]">
        {mainNumbers.length > 0 || specialNumbers.length > 0 ? (
          <div className="flex flex-col gap-2 justify-center items-center">
            <div className="flex flex-wrap gap-2">
              {mainNumbers.map((num, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap shrink-0 w-12 h-12 rounded-full bg-linear-to-br from-blue-600 to-purple-600 text-white items-center justify-center font-bold text-sm shadow-md"
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
                <div className="flex flex-wrap gap-2">
                  {specialNumbers.map((num, idx) => (
                    <div
                      key={idx}
                      className="shrink-0 w-12 h-12 rounded-full bg-linear-to-br from-pink-600 to-red-600 text-white flex items-center justify-center font-bold text-sm shadow-md"
                    >
                      {`${num < 10 ? "0" : ""}${num}`}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            请选择彩票类型并生成号码
          </p>
        )}
      </div>
    </div>
  );
};
