import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tools - SimpleTool",
  description: "Browse our collection of modern online utilities and tools",
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

