export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  href: string;
  featured?: boolean;
  keywords?: string[]; // 搜索关键词
}

export type ToolCategory = string;

export interface ToolCardProps {
  tool: Tool;
}

export interface SearchState {
  query: string;
  category: string;
  setQuery: (query: string) => void;
  setCategory: (category: string) => void;
}

export interface CommandCategory {
  id: string;
  name: string;
  type: "command" | "template";
  description: string;
}

export interface Command {
  id: string;
  name: string;
  language?: string;
  description: string;
  command: string;
  example: string;
  category: string;
}

export interface Template {
  id: string;
  name: string;
  language: string;
  description: string;
  content: string;
  category: string;
}

export interface CommandsResponse {
  id: string;
  icon: string;
  title: string;
  description: string;
  commands: Command[];
  templates: Template[];
  categories: CommandCategory[];
}

export interface UserPreferences {
  // Theme settings
  theme: "light" | "dark" | "system";
  animations: boolean;

  // Search history
  searchHistory: string[];

  // Tool preferences
  favoriteTools: string[];
  recentlyUsedTools: string[];

  // Actions
  setTheme: (theme: "light" | "dark" | "system") => void;
  setAnimations: (animations: boolean) => void;
  addToSearchHistory: (query: string) => void;
  removeFromSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  addFavoriteTool: (toolId: string) => void;
  removeFavoriteTool: (toolId: string) => void;
  addRecentlyUsedTool: (toolId: string) => void;
}

// 网址导航相关类型
export interface SiteCategory {
  id: string;
  name: string;
  icon?: string;
  order: number;
}

export interface Site {
  id: string;
  name: string;
  url: string;
  description?: string;
  icon?: string; // 网站图标 URL
  categoryId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface SiteNavigatorData {
  categories: SiteCategory[];
  sites: Site[];
  version: string;
  lastUpdated: string;
}
