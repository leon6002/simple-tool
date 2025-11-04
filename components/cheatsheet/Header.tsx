import { LucideIconMap, SimpleIconMap } from "@/lib/utils/IconMap";
import { motion } from "framer-motion";
import { GitBranch } from "lucide-react";

interface HeaderProps {
  title: string;
  description: string;
  iconName: string;
}

function IconWrapper({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const LucideIcon = LucideIconMap[name]; // Get the component from the map
  if (LucideIcon) {
    return <LucideIcon className={className} />;
  }
  const SimpleIcon = SimpleIconMap[name];
  if (SimpleIcon) {
    return (
      <svg
        role="img"
        viewBox="0 0 24 24"
        className={className}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>{SimpleIcon.title}</title>
        <path d={SimpleIcon.path} />
      </svg>
    );
  }
  return <GitBranch />;
}
export function Header({ title, description, iconName }: HeaderProps) {
  return (
    <div className="mb-12 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20"
      >
        <IconWrapper name={iconName} className="h-8 w-8 text-purple-600" />
      </motion.div>
      <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        {description}
      </p>
    </div>
  );
}
