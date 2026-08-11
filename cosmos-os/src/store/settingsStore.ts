import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Wallpaper {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
}

export const defaultWallpapers: Wallpaper[] = [
  {
    id: 'abstract',
    name: 'Abstract',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2560&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=320&auto=format&fit=crop'
  },
  {
    id: 'mountains',
    name: 'Mountains',
    url: 'https://images.unsplash.com/photo-1506744032114-7385507925db?q=80&w=2560&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1506744032114-7385507925db?q=80&w=320&auto=format&fit=crop'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2560&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=320&auto=format&fit=crop'
  },
  {
    id: 'space',
    name: 'Space',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2560&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=320&auto=format&fit=crop'
  },
  {
    id: 'forest',
    name: 'Forest',
    url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=2560&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=320&auto=format&fit=crop'
  },
  {
    id: 'aurora',
    name: 'Aurora',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=2560&auto=format&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=320&auto=format&fit=crop'
  },
];

export const ACCENT_COLORS = [
  { id: 'cyan',   label: 'Cyan',   value: '#00e5ff' },
  { id: 'purple', label: 'Purple', value: '#b388ff' },
  { id: 'green',  label: 'Green',  value: '#69f0ae' },
  { id: 'orange', label: 'Orange', value: '#ffab40' },
  { id: 'pink',   label: 'Pink',   value: '#f48fb1' },
  { id: 'red',    label: 'Red',    value: '#ff5252' },
];

interface SettingsState {
  wallpaper: string;
  theme: 'dark' | 'light';
  accentColor: string;
  username: string;
  setWallpaper: (id: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setAccentColor: (color: string) => void;
  setUsername: (name: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      wallpaper: 'abstract',
      theme: 'dark',
      accentColor: '#00e5ff',
      username: 'user',
      setWallpaper: (wallpaper) => set({ wallpaper }),
      setTheme: (theme) => set({ theme }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setUsername: (username) => set({ username }),
    }),
    { name: 'cosmos-settings' }
  )
);
