import { create } from 'zustand';

interface AppState {
  apps: any[];
  registerApp: (app: any) => void;
}

export const useAppStore = create<AppState>((set) => ({
  apps: [],
  registerApp: (app) => set((state) => ({ apps: [...state.apps, app] })),
}));
