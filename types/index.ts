export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  href: string;
  featured?: boolean;
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
