export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  href: string;
  featured?: boolean;
}

export type ToolCategory =
  | "converter"
  | "image"
  | "text"
  | "3d"
  | "developer"
  | "all"
  | "security"
  | "design"
  | "productivity";

export interface ToolCardProps {
  tool: Tool;
}

export interface SearchState {
  query: string;
  category: ToolCategory;
  setQuery: (query: string) => void;
  setCategory: (category: ToolCategory) => void;
}

export interface UserPreferences {
  // Theme settings
  theme: 'light' | 'dark' | 'system';
  animations: boolean;
  
  // Search history
  searchHistory: string[];
  
  // Tool preferences
  favoriteTools: string[];
  recentlyUsedTools: string[];
  
  // Methods
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setAnimations: (animations: boolean) => void;
  addToSearchHistory: (query: string) => void;
  removeFromSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  addFavoriteTool: (toolId: string) => void;
  removeFavoriteTool: (toolId: string) => void;
  addRecentlyUsedTool: (toolId: string) => void;
  removeRecentlyUsedTool: (toolId: string) => void;
  clearRecentlyUsedTools: () => void;
}