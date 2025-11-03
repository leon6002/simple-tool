import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit") || "12";
  const has_breeds = searchParams.get("has_breeds") || "true";
  const order = searchParams.get("order") || "Desc";
  const breed_ids = searchParams.get("breed_ids") || "";

  // 构建查询参数
  const params = new URLSearchParams({
    limit,
    has_breeds,
    order,
  });

  if (breed_ids) {
    params.append("breed_ids", breed_ids);
  }

  const API_KEY = process.env.THE_CAT_API_KEY;
  const baseUrl = "https://api.thecatapi.com/v1/images/search";
  const url = `${baseUrl}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        "x-api-key": API_KEY || "",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cat images: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching cat images:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch cat images" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}