import { create } from 'zustand';

export interface AppWindow {
  id: string;
  appId: string;
  title: string;
  zIndex: number;
  minimized: boolean;
}

interface WindowState {
  windows: AppWindow[];
  activeWindowId: string | null;
  nextZIndex: number;
  openWindow: (appId: string, title?: string) => void;
  closeWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  restoreWindow: (windowId: string) => void;
  toggleMinimize: (windowId: string) => void;
}

const APP_TITLES: Record<string, string> = {
  'file-explorer': 'File Explorer',
  'settings':      'Settings',
  'calculator':    'Calculator',
  'notes':         'Notes',
  'music':         'Music Player',
  'terminal':      'Terminal',
  'browser':       'Browser',
  'gallery':       'Gallery',
  'calendar':      'Calendar',
};

export const useWindowStore = create<WindowState>((set, get) => ({
  windows: [],
  activeWindowId: null,
  nextZIndex: 10,

  openWindow: (appId, title) => set((state) => {
    // If already open but minimized → restore & focus
    const existing = state.windows.find(w => w.appId === appId);
    if (existing) {
      const topZ = state.nextZIndex + 1;
      return {
        windows: state.windows.map(w =>
          w.id === existing.id
            ? { ...w, minimized: false, zIndex: topZ }
            : w
        ),
        activeWindowId: existing.id,
        nextZIndex: topZ,
      };
    }
    const newId = `${appId}-${Date.now()}`;
    const topZ = state.nextZIndex + 1;
    const newWindow: AppWindow = {
      id: newId,
      appId,
      title: title ?? APP_TITLES[appId] ?? appId,
      zIndex: topZ,
      minimized: false,
    };
    return {
      windows: [...state.windows, newWindow],
      activeWindowId: newId,
      nextZIndex: topZ,
    };
  }),

  closeWindow: (windowId) => set((state) => {
    const remaining = state.windows.filter(w => w.id !== windowId);
    const newActive = state.activeWindowId === windowId
      ? (remaining.length > 0 ? remaining.reduce((a, b) => a.zIndex > b.zIndex ? a : b).id : null)
      : state.activeWindowId;
    return { windows: remaining, activeWindowId: newActive };
  }),

  focusWindow: (windowId) => set((state) => {
    const topZ = state.nextZIndex + 1;
    return {
      windows: state.windows.map(w =>
        w.id === windowId ? { ...w, zIndex: topZ, minimized: false } : w
      ),
      activeWindowId: windowId,
      nextZIndex: topZ,
    };
  }),

  minimizeWindow: (windowId) => set((state) => {
    const remaining = state.windows.filter(w => !w.minimized && w.id !== windowId);
    const newActive = state.activeWindowId === windowId
      ? (remaining.length > 0 ? remaining.reduce((a, b) => a.zIndex > b.zIndex ? a : b).id : null)
      : state.activeWindowId;
    return {
      windows: state.windows.map(w => w.id === windowId ? { ...w, minimized: true } : w),
      activeWindowId: newActive,
    };
  }),

  restoreWindow: (windowId) => set((state) => {
    const topZ = state.nextZIndex + 1;
    return {
      windows: state.windows.map(w =>
        w.id === windowId ? { ...w, minimized: false, zIndex: topZ } : w
      ),
      activeWindowId: windowId,
      nextZIndex: topZ,
    };
  }),

  toggleMinimize: (windowId) => {
    const { windows, minimizeWindow, restoreWindow } = get();
    const win = windows.find(w => w.id === windowId);
    if (!win) return;
    if (win.minimized) restoreWindow(windowId);
    else minimizeWindow(windowId);
  },
}));
