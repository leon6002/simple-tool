import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cheatsheets - SimpleTool",
  description:
    "Browse our collection of modern online utilities and cheatsheets",
};

export default function CheatsheetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
