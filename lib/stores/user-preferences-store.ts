import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserPreferences } from '@/types';

export const useUserPreferencesStore = create<UserPreferences>()(
  persist(
    (set) => ({
      theme: 'system',
      animations: true,
      searchHistory: [],
      favoriteTools: [],
      recentlyUsedTools: [],
      
      setTheme: (theme) => set({ theme }),
      setAnimations: (animations) => set({ animations }),
      addToSearchHistory: (query) => set((state) => {
        const updatedHistory = [
          query,
          ...state.searchHistory.filter(item => item !== query)
        ].slice(0, 10); // Keep only the last 10 items
        
        return { searchHistory: updatedHistory };
      }),
      removeFromSearchHistory: (query) => set((state) => ({
        searchHistory: state.searchHistory.filter(item => item !== query)
      })),
      clearSearchHistory: () => set({ searchHistory: [] }),
      addFavoriteTool: (toolId) => set((state) => ({
        favoriteTools: [...state.favoriteTools, toolId]
      })),
      removeFavoriteTool: (toolId) => set((state) => ({
        favoriteTools: state.favoriteTools.filter(id => id !== toolId)
      })),
      addRecentlyUsedTool: (toolId) => set((state) => {
        const updatedList = [
          toolId,
          ...state.recentlyUsedTools.filter(id => id !== toolId)
        ].slice(0, 10); // Keep only the last 10 items
        
        return { recentlyUsedTools: updatedList };
      }),
      removeRecentlyUsedTool: (toolId) => set((state) => ({
        recentlyUsedTools: state.recentlyUsedTools.filter(id => id !== toolId)
      })),
      clearRecentlyUsedTools: () => set({ recentlyUsedTools: [] }),
    }),
    {
      name: 'simpletool-user-preferences',
      partialize: (state) => ({
        theme: state.theme,
        animations: state.animations,
        searchHistory: state.searchHistory,
        favoriteTools: state.favoriteTools,
        recentlyUsedTools: state.recentlyUsedTools,
      }),
    }
  )
);