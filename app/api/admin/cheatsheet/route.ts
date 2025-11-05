import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// 生成唯一 ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function POST(request: NextRequest) {
  // Check authentication
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { cheatsheetId, type, data } = body;

    if (!cheatsheetId || !type || !data) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Read the JSON file
    const filePath = path.join(
      process.cwd(),
      "public",
      "data",
      `${cheatsheetId}-commands.json`
    );

    const fileContent = await fs.readFile(filePath, "utf-8");
    const jsonData = JSON.parse(fileContent);

    // Create new item with generated ID
    const newItem = {
      id: generateId(),
      name: data.name,
      description: data.description,
      category: data.category,
      ...(type === "command"
        ? {
            command: data.command,
            example: data.example,
            language: data.language,
          }
        : {
            content: data.content,
            language: data.language,
          }),
    };

    // Add to the beginning of the array
    if (type === "command") {
      jsonData.commands.unshift(newItem);
    } else if (type === "template") {
      jsonData.templates.unshift(newItem);
    }

    // Write back to file
    await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), "utf-8");

    return NextResponse.json({ success: true, id: newItem.id });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  // Check authentication
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { cheatsheetId, itemId, type, data } = body;

    if (!cheatsheetId || !itemId || !type || !data) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Read the JSON file
    const filePath = path.join(
      process.cwd(),
      "public",
      "data",
      `${cheatsheetId}-commands.json`
    );

    const fileContent = await fs.readFile(filePath, "utf-8");
    const jsonData = JSON.parse(fileContent);

    // Update the item based on type
    if (type === "command") {
      const commandIndex = jsonData.commands.findIndex(
        (cmd: any) => cmd.id === itemId
      );
      if (commandIndex !== -1) {
        jsonData.commands[commandIndex] = {
          ...jsonData.commands[commandIndex],
          name: data.name,
          description: data.description,
          category: data.category,
          command: data.command,
          example: data.example,
          language: data.language,
        };
      }
    } else if (type === "template") {
      const templateIndex = jsonData.templates.findIndex(
        (tpl: any) => tpl.id === itemId
      );
      if (templateIndex !== -1) {
        jsonData.templates[templateIndex] = {
          ...jsonData.templates[templateIndex],
          name: data.name,
          description: data.description,
          category: data.category,
          content: data.content,
          language: data.language,
        };
      }
    }

    // Write back to file
    await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), "utf-8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating cheatsheet:", error);
    return NextResponse.json(
      { error: "Failed to update cheatsheet" },
      { status: 500 }
    );
  }
}
