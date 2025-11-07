"use client";

interface NumberPreviewProps {
  mainNumbers: number[];
  specialNumbers: number[];
}

export const NumberPreview = ({
  mainNumbers,
  specialNumbers,
}: NumberPreviewProps) => {
  return (
    <div className="hidden md:block">
      <div className="flex justify-center items-center gap-2 p-3 bg-muted/30 rounded-lg h-[60px]">
        {mainNumbers.length > 0 || specialNumbers.length > 0 ? (
          <div className="flex flex-wrap gap-2 justify-center items-center">
            {mainNumbers.map((num, idx) => (
              <div
                key={idx}
                className="w-10 h-10 rounded-full bg-linear-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md"
              >
                {`${num < 10 ? "0" : ""}${num}`}
              </div>
            ))}
            {specialNumbers.length > 0 && (
              <>
                <span className="text-lg font-bold mx-2 text-muted-foreground">
                  +
                </span>
                {specialNumbers.map((num, idx) => (
                  <div
                    key={idx}
                    className="w-10 h-10 rounded-full bg-linear-to-br from-pink-600 to-red-600 text-white flex items-center justify-center font-bold text-sm shadow-md"
                  >
                    {`${num < 10 ? "0" : ""}${num}`}
                  </div>
                ))}
              </>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">请在下方选择号码</p>
        )}
      </div>
    </div>
  );
};
