import Image from "next/image";

// 用于测试效果的demo page
export default function UiLibPage() {
  return (
    <div className="h-[500px] w-[500px] mx-auto my-auto">
      <div className="relative w-full max-w-lg overflow-hidden rounded-lg shadow-xl">
        <Image
          src="https://images.unsplash.com/photo-1518770660439-4636190af475"
          alt="AI Technology"
          width={500}
          height={500}
          className="w-full h-full object-cover"
        />

        <div className="absolute top-0 left-0 z-10 w-full h-1/3 animate-scanner-glow bg-linear-to-b from-cyan-400/60 to-transparent opacity-80 backdrop-blur-sm"></div>
      </div>
    </div>
  );
}
