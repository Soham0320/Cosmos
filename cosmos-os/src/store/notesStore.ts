import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string; // ISO string for serialization
  createdAt: string;
}

const makeNote = (title = 'Untitled Note', content = ''): Note => ({
  id: `note-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  title,
  content,
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
});

interface NotesState {
  notes: Note[];
  activeNoteId: string | null;
  addNote: () => void;
  deleteNote: (id: string) => void;
  updateNote: (id: string, content: string) => void;
  setActiveNote: (id: string) => void;
}

const initialNote = makeNote('Welcome', 'Welcome to Cosmos OS Notes!\n\nStart typing your thoughts here...');

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [initialNote],
      activeNoteId: initialNote.id,

      addNote: () => set((state) => {
        const n = makeNote();
        return { notes: [...state.notes, n], activeNoteId: n.id };
      }),

      deleteNote: (id) => set((state) => {
        const remaining = state.notes.filter(n => n.id !== id);
        if (remaining.length === 0) {
          const fresh = makeNote();
          return { notes: [fresh], activeNoteId: fresh.id };
        }
        const newActive = state.activeNoteId === id
          ? remaining[remaining.length - 1].id
          : state.activeNoteId;
        return { notes: remaining, activeNoteId: newActive };
      }),

      updateNote: (id, content) => set((state) => ({
        notes: state.notes.map(n =>
          n.id === id
            ? {
                ...n,
                content,
                title: content.split('\n')[0].trim().slice(0, 50) || 'Untitled Note',
                updatedAt: new Date().toISOString(),
              }
            : n
        ),
      })),

      setActiveNote: (id) => set({ activeNoteId: id }),
    }),
    { name: 'cosmos-notes' }
  )
);
