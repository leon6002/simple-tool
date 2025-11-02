import { create } from 'zustand';
import { SearchState, ToolCategory } from '@/types';

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  category: 'all',
  setQuery: (query: string) => set({ query }),
  setCategory: (category: ToolCategory) => set({ category }),
}));

