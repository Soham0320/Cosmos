import React, { useState, useEffect } from 'react';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
  isTemp?: boolean;
}

const API_BASE = 'https://vibewquest-be.onrender.com/api/v1';
const LS_KEY = 'cosmos_notes_studentId';

export const Notes: React.FC = () => {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const activeNote = notes.find(n => n.id === activeNoteId);

  // Initialize: load or fetch student ID and notes
  useEffect(() => {
    const initNotes = async () => {
      setLoading(true);
      try {
        let sid = localStorage.getItem(LS_KEY);
        if (!sid) {
          // Fetch new student ID
          const res = await fetch(`${API_BASE}/init`);
          if (!res.ok) throw new Error('Failed to init studentId');
          const data = await res.json();
          sid = data.studentId;
          if (sid) {
            localStorage.setItem(LS_KEY, sid);
          }
        }

        setStudentId(sid);

        if (sid) {
          // Fetch existing notes
          const res = await fetch(`${API_BASE}/${sid}/notes`);
          if (res.ok) {
            const data = await res.json();
            const docs: Note[] = data.documents || [];
            setNotes(docs);
            if (docs.length > 0) {
              setActiveNoteId(docs[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initNotes();
  }, []);

  // Creation (POST) — Optimistic UI
  const handleCreate = async () => {
    if (!studentId) return;

    const tempId = `temp-${Date.now()}`;
    const newNote: Note = {
      id: tempId,
      title: 'Untitled Note',
      content: '',
      isTemp: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistically update React state
    setNotes(prev => [...prev, newNote]);
    setActiveNoteId(tempId);
    setSaveStatus('idle');

    try {
      const res = await fetch(`${API_BASE}/${studentId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newNote.title,
          content: newNote.content,
        }),
      });

      if (!res.ok) throw new Error('Create request failed');
      const data = await res.json();
      const realId = data.documentId;

      // Update state with the real document ID
      setNotes(prev =>
        prev.map(n =>
          n.id === tempId ? { ...n, id: realId, isTemp: false } : n
        )
      );
      setActiveNoteId(realId);
    } catch (err) {
      console.error('Failed to create note on server:', err);
      // Remove the temp note on failure
      setNotes(prev => prev.filter(n => n.id !== tempId));
      setActiveNoteId(null);
    }
  };

  // Update note content locally in state
  const handleContentChange = (id: string, content: string) => {
    const title = content.split('\n')[0].trim().slice(0, 50) || 'Untitled Note';
    setNotes(prev =>
      prev.map(n =>
        n.id === id
          ? { ...n, content, title, updatedAt: new Date().toISOString() }
          : n
      )
    );
    if (saveStatus === 'saved') {
      setSaveStatus('idle');
    }
  };

  // Save (PUT) — manual save button
  const handleSave = async () => {
    if (!studentId || !activeNote || activeNote.isTemp || saving) return;

    setSaving(true);
    setSaveStatus('saving');

    try {
      const res = await fetch(`${API_BASE}/${studentId}/notes/${activeNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeNote.title,
          content: activeNote.content,
        }),
      });

      if (!res.ok) throw new Error('Save request failed');

      setSaveStatus('saved');
    } catch (err) {
      console.error('Failed to save note:', err);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  // Deletion (DELETE) — Optimistic UI
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!studentId) return;

    const noteToDelete = notes.find(n => n.id === id);

    // Optimistically update UI
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) {
      const remaining = notes.filter(n => n.id !== id);
      setActiveNoteId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
    }

    // Call DELETE asynchronously on the server if not temporary
    if (noteToDelete && !noteToDelete.isTemp) {
      try {
        await fetch(`${API_BASE}/${studentId}/notes/${id}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error('Failed to delete note on server:', err);
        // Rollback state on error
        setNotes(prev => [...prev, noteToDelete]);
      }
    }
  };

  return (
    <div className="w-full h-full flex bg-[#111] text-white overflow-hidden select-none">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 border-r border-white/10 flex flex-col bg-[#0a0a0a]">
        <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
          <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Notes</span>
          <button
            id="notes-new"
            onClick={handleCreate}
            className="w-6 h-6 rounded-md bg-primary/20 hover:bg-primary/30 text-primary flex items-center justify-center text-lg font-light transition-all active:scale-95"
            title="New Note"
          >
            +
          </button>
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex flex-col gap-3 p-4">
              <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
              <div className="h-10 bg-white/5 rounded-xl animate-pulse" style={{ animationDelay: '0.15s' }} />
              <div className="h-10 bg-white/5 rounded-xl animate-pulse" style={{ animationDelay: '0.3s' }} />
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center text-white/20 h-40">
              <span className="text-3xl mb-2">📝</span>
              <span className="text-xs">No notes found</span>
            </div>
          ) : (
            notes.map(note => (
              <div
                key={note.id}
                onClick={() => {
                  setActiveNoteId(note.id);
                  setSaveStatus('idle');
                }}
                className={`group relative p-3.5 cursor-pointer border-b border-white/5 transition-all ${
                  activeNoteId === note.id ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <div className="text-sm font-medium truncate pr-6 flex items-center gap-1.5">
                  {note.isTemp && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-ping" />}
                  <span className={note.isTemp ? 'text-white/60' : 'text-white/80'}>{note.title}</span>
                </div>
                <div className="text-[10px] text-white/30 mt-1 flex items-center justify-between">
                  <span>
                    {note.updatedAt ? new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </span>
                  {note.isTemp && <span className="text-yellow-500/70 font-mono text-[9px]">Uploading...</span>}
                </div>
                <button
                  onClick={e => handleDelete(note.id, e)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded text-white/25 hover:text-red-400 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-xs"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Sync Status Footer */}
        {studentId && (
          <div className="p-3 border-t border-white/15 bg-black/40 flex flex-col gap-1 text-[10px] text-white/30">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e]" />
              <span className="font-semibold text-white/50">Cloud Synced</span>
            </div>
            <div className="font-mono bg-white/5 rounded px-1.5 py-0.5 text-center mt-1 truncate">
              ID: {studentId}
            </div>
          </div>
        )}
      </div>

      {/* Editor */}
      {activeNote ? (
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-5 py-3 border-b border-white/10 text-xs text-white/35 flex justify-between items-center bg-[#0d0d0d]">
            <div className="flex items-center gap-2">
              <span>{activeNote.createdAt ? new Date(activeNote.createdAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) : 'Draft'}</span>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <span>{activeNote.content.length} chars</span>
            </div>

            {/* Manual Save Button */}
            <div className="flex items-center gap-2.5">
              {saveStatus === 'saved' && <span className="text-green-400 text-[10px]">Saved to cloud ✓</span>}
              {saveStatus === 'error' && <span className="text-red-400 text-[10px]">Failed to save ✕</span>}

              <button
                onClick={handleSave}
                disabled={activeNote.isTemp || saving}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeNote.isTemp
                    ? 'bg-white/5 text-white/20 cursor-not-allowed'
                    : saving
                    ? 'bg-primary/20 text-primary cursor-wait opacity-80'
                    : 'bg-primary text-black hover:brightness-110 active:scale-95 shadow-md hover:shadow-primary/20'
                }`}
              >
                {saving ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
          <textarea
            key={activeNote.id}
            className="flex-1 bg-transparent resize-none p-5 outline-none font-sans text-base text-white/90 placeholder-white/20 leading-relaxed"
            placeholder="Start typing..."
            value={activeNote.content}
            onChange={e => handleContentChange(activeNote.id, e.target.value)}
            spellCheck={false}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-white/20 text-sm gap-2">
          <span className="text-4xl">📝</span>
          <span>Select or create a note to begin typing</span>
        </div>
      )}
    </div>
  );
};
