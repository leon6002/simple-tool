import { useDebouncedCallback } from "use-debounce";
import { useCallback } from "react";

export function useDebouncedSearch(
  setQuery: (query: string) => void,
  addToSearchHistory: (query: string) => void,
  delay: number = 100
) {
  const debouncedSearch = useDebouncedCallback((searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.trim()) {
      addToSearchHistory(searchQuery.trim());
    }
  }, delay);

  const handleImmediateSearch = useCallback(
    (query: string) => {
      debouncedSearch.cancel(); // 取消未执行的防抖
      setQuery(query);
      if (query.trim()) {
        addToSearchHistory(query.trim());
      }
    },
    [setQuery, addToSearchHistory, debouncedSearch]
  );

  return {
    debouncedSearch,
    handleImmediateSearch,
  };
}
