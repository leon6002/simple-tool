import Image from "next/image";

export default function UiLibPage() {
  return (
    <div className="h-[500px] w-[500px] mx-auto my-auto flex items-center justify-center">
      <div
        className="relative w-full max-w-lg h-96 overflow-hidden rounded-lg shadow-xl 
                      bg-gray-900"
      >
        {/* 1. 您的图片 */}
        <Image
          src="https://images.unsplash.com/photo-1518770660439-4636190af475"
          alt="AI Technology"
          layout="fill"
          objectFit="cover"
          className="w-full h-full"
        />

        {/* 2. 覆盖层：许多白色小点，呈现波动的效果 */}
        <div className="absolute inset-0 z-20 bg-blue-500/30 animate-dot-wave bg-[radial-gradient(circle_at_center,var(--color-white)_1px,transparent_1px),radial-gradient(circle_at_center,var(--color-white)_1px,transparent_1px)] bg-[length:20px_20px] mix-blend-overlay"></div>
      </div>
    </div>
  );
}
