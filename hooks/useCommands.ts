import { useState, useEffect } from "react";
import { CommandsResponse } from "@/types";

export function useCommands(type: string) {
  const [data, setData] = useState<CommandsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/commands?type=${encodeURIComponent(type)}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch commands");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [type]);

  return { data, loading, error };
}
