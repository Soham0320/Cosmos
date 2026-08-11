import { create } from 'zustand';

interface WidgetState {
  widgets: any[];
  addWidget: (widget: any) => void;
  removeWidget: (id: string) => void;
}

export const useWidgetStore = create<WidgetState>((set) => ({
  widgets: [],
  addWidget: (widget) => set((state) => ({ widgets: [...state.widgets, widget] })),
  removeWidget: (id) => set((state) => ({ widgets: state.widgets.filter(w => w.id !== id) })),
}));
