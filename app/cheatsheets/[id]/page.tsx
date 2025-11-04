import { CommandCheatsheet } from "@/components/cheatsheet/commands/CommandCheatsheet";

export default async function CheatsheetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <CommandCheatsheet id={id} />;
}
