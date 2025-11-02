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
  | 'converter'
  | 'image'
  | 'text'
  | '3d'
  | 'developer'
  | 'all';

export interface ToolCardProps {
  tool: Tool;
}

export interface SearchState {
  query: string;
  category: ToolCategory;
  setQuery: (query: string) => void;
  setCategory: (category: ToolCategory) => void;
}

