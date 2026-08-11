import React, { useState, useRef, useEffect } from 'react';

// ─── Virtual File System ────────────────────────────────────────────────────

type FileType = 'folder' | 'txt' | 'md' | 'image' | 'audio' | 'video' | 'code';

interface FSEntry {
  name: string;
  type: FileType;
  children?: FSEntry[];
  size?: string;
  modified?: string;
}

const FS: Record<string, FSEntry[]> = {
  '/': [
    { name: 'Desktop',   type: 'folder' },
    { name: 'Documents', type: 'folder' },
    { name: 'Downloads', type: 'folder' },
    { name: 'Pictures',  type: 'folder' },
    { name: 'Music',     type: 'folder' },
  ],
  '/Desktop': [
    { name: 'README.txt', type: 'txt', size: '2 KB', modified: 'Today' },
  ],
  '/Documents': [
    { name: 'Projects',   type: 'folder' },
    { name: 'notes.md',   type: 'md',  size: '4 KB', modified: 'Yesterday' },
    { name: 'resume.txt', type: 'txt', size: '8 KB', modified: 'Last week' },
  ],
  '/Documents/Projects': [
    { name: 'cosmos-os', type: 'folder' },
    { name: 'ideas.txt', type: 'txt', size: '1 KB', modified: 'Today' },
  ],
  '/Documents/Projects/cosmos-os': [
    { name: 'src',         type: 'folder' },
    { name: 'package.json', type: 'code', size: '625 B', modified: 'Today' },
    { name: 'README.md',   type: 'md',  size: '3 KB', modified: 'Today' },
  ],
  '/Documents/Projects/cosmos-os/src': [
    { name: 'App.tsx',        type: 'code', size: '213 B', modified: 'Today' },
    { name: 'index.css',      type: 'code', size: '491 B', modified: 'Today' },
  ],
  '/Downloads': [
    { name: 'setup.exe',     type: 'code', size: '12 MB', modified: 'Last month' },
    { name: 'wallpaper.jpg', type: 'image', size: '3 MB', modified: 'Last week' },
  ],
  '/Pictures': [
    { name: 'Screenshots', type: 'folder' },
    { name: 'wallpaper1.jpg', type: 'image', size: '2 MB', modified: 'Yesterday' },
    { name: 'wallpaper2.jpg', type: 'image', size: '3 MB', modified: 'Last week' },
  ],
  '/Pictures/Screenshots': [],
  '/Music': [
    { name: 'Starlight Sonata.mp3', type: 'audio', size: '8 MB', modified: 'Last month' },
    { name: 'Nebula Dreams.mp3',    type: 'audio', size: '7 MB', modified: 'Last month' },
  ],
};

const FILE_ICONS: Record<FileType, string> = {
  folder: '📁',
  txt:    '📄',
  md:     '📝',
  image:  '🖼️',
  audio:  '🎵',
  video:  '🎬',
  code:   '💻',
};

const SIDEBAR_LOCS = [
  { path: '/',          label: 'Home',      icon: '🏠' },
  { path: '/Desktop',   label: 'Desktop',   icon: '🖥️' },
  { path: '/Documents', label: 'Documents', icon: '📄' },
  { path: '/Downloads', label: 'Downloads', icon: '⬇️' },
  { path: '/Pictures',  label: 'Pictures',  icon: '🖼️' },
  { path: '/Music',     label: 'Music',     icon: '🎵' },
];

// ─── Context Menu ────────────────────────────────────────────────────────────

interface ContextMenuState {
  x: number; y: number;
  target: FSEntry | null;
  inFolder: boolean;
}

export const FileExplorer: React.FC = () => {
  const [cwd, setCwd] = useState('/');
  const [history, setHistory] = useState<string[]>(['/']);
  const [histIdx, setHistIdx] = useState(0);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [renamed, setRenamed] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');
  const [entries, setEntries] = useState<Record<string, FSEntry[]>>({ ...FS });
  const containerRef = useRef<HTMLDivElement>(null);

  const navigate = (path: string) => {
    const newHist = [...history.slice(0, histIdx + 1), path];
    setHistory(newHist);
    setHistIdx(newHist.length - 1);
    setCwd(path);
    setSearch('');
  };

  const goBack = () => {
    if (histIdx > 0) { const idx = histIdx - 1; setHistIdx(idx); setCwd(history[idx]); }
  };

  const goForward = () => {
    if (histIdx < history.length - 1) { const idx = histIdx + 1; setHistIdx(idx); setCwd(history[idx]); }
  };

  const breadcrumbs = cwd === '/' ? ['/'] : ['/', ...cwd.slice(1).split('/')];
  const buildPath = (idx: number) => idx === 0 ? '/' : '/' + breadcrumbs.slice(1, idx + 1).join('/');

  const currentEntries = (entries[cwd] ?? []).filter(e =>
    search ? e.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  const handleDoubleClick = (entry: FSEntry) => {
    if (entry.type === 'folder') navigate(`${cwd === '/' ? '' : cwd}/${entry.name}`);
  };

  const handleContextMenu = (e: React.MouseEvent, entry: FSEntry | null) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, target: entry, inFolder: !entry });
  };

  const startRename = (name: string) => {
    setRenamed(name);
    setRenameVal(name);
    setContextMenu(null);
  };

  const commitRename = () => {
    if (!renamed || !renameVal.trim() || renameVal === renamed) { setRenamed(null); return; }
    setEntries(prev => ({
      ...prev,
      [cwd]: (prev[cwd] ?? []).map(e => e.name === renamed ? { ...e, name: renameVal.trim() } : e),
    }));
    setRenamed(null);
  };

  const deleteEntry = (name: string) => {
    setEntries(prev => ({ ...prev, [cwd]: (prev[cwd] ?? []).filter(e => e.name !== name) }));
    setContextMenu(null);
  };

  const newFolder = () => {
    const base = 'New Folder';
    let name = base;
    let i = 1;
    while ((entries[cwd] ?? []).some(e => e.name === name)) name = `${base} ${i++}`;
    setEntries(prev => ({ ...prev, [cwd]: [...(prev[cwd] ?? []), { name, type: 'folder' }] }));
    setContextMenu(null);
    setTimeout(() => startRename(name), 50);
  };

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return;
    const handler = () => setContextMenu(null);
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [contextMenu]);

  return (
    <div
      className="w-full h-full flex bg-background text-white overflow-hidden select-none"
      onContextMenu={e => handleContextMenu(e, null)}
    >
      {/* Sidebar */}
      <div className="w-44 flex-shrink-0 border-r border-panel-border bg-panel flex flex-col py-2">
        <div className="px-3 py-1 text-xs text-white/30 font-semibold uppercase tracking-wider mb-1">Locations</div>
        {SIDEBAR_LOCS.map(loc => (
          <button
            key={loc.path}
            onClick={() => navigate(loc.path)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg mx-2 transition-colors ${
              cwd === loc.path || cwd.startsWith(loc.path === '/' ? '\0' : loc.path)
                ? 'bg-white/15 text-white'
                : 'text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span>{loc.icon}</span>
            <span>{loc.label}</span>
          </button>
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border-b border-panel-border bg-black/20">
          <button onClick={goBack} disabled={histIdx === 0}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            ←
          </button>
          <button onClick={goForward} disabled={histIdx >= history.length - 1}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            →
          </button>

          {/* Breadcrumb */}
          <div className="flex-1 flex items-center gap-0.5 text-sm px-2 text-white/60">
            {breadcrumbs.map((seg, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-white/20 mx-0.5">/</span>}
                <button
                  onClick={() => navigate(buildPath(i))}
                  className={`hover:text-white transition-colors ${i === breadcrumbs.length - 1 ? 'text-white font-medium' : ''}`}
                >
                  {seg === '/' ? 'Home' : seg}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Search */}
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            className="bg-white/10 border border-white/10 rounded-lg px-3 py-1 text-sm text-white placeholder-white/30 outline-none w-36"
          />

          {/* View toggle */}
          <div className="flex border border-white/10 rounded-lg overflow-hidden">
            {(['grid', 'list'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-2 py-1 text-xs transition-colors ${view === v ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white hover:bg-white/10'}`}>
                {v === 'grid' ? '⊞' : '≡'}
              </button>
            ))}
          </div>
        </div>

        {/* Files */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto p-4"
          onContextMenu={e => { e.stopPropagation(); handleContextMenu(e, null); }}
        >
          {currentEntries.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/20">
              <span className="text-5xl mb-3">📂</span>
              <span className="text-sm">{search ? 'No results' : 'This folder is empty'}</span>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-5 gap-3 content-start">
              {currentEntries.map(entry => (
                <div
                  key={entry.name}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl cursor-pointer hover:bg-white/8 transition-colors group"
                  onDoubleClick={() => handleDoubleClick(entry)}
                  onContextMenu={e => { e.stopPropagation(); handleContextMenu(e, entry); }}
                >
                  <span className="text-3xl">{FILE_ICONS[entry.type]}</span>
                  {renamed === entry.name ? (
                    <input
                      autoFocus value={renameVal}
                      onChange={e => setRenameVal(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamed(null); }}
                      className="w-full bg-primary/20 border border-primary/40 rounded px-1 text-xs text-center outline-none text-white"
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <span className="text-xs text-center text-white/70 group-hover:text-white leading-tight break-all line-clamp-2">{entry.name}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/30 border-b border-white/10 text-left">
                  <th className="pb-2 font-medium pl-2">Name</th>
                  <th className="pb-2 font-medium">Size</th>
                  <th className="pb-2 font-medium">Modified</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.map(entry => (
                  <tr
                    key={entry.name}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                    onDoubleClick={() => handleDoubleClick(entry)}
                    onContextMenu={e => { e.stopPropagation(); handleContextMenu(e, entry); }}
                  >
                    <td className="py-1.5 pl-2 flex items-center gap-2">
                      <span>{FILE_ICONS[entry.type]}</span>
                      {renamed === entry.name ? (
                        <input
                          autoFocus value={renameVal}
                          onChange={e => setRenameVal(e.target.value)}
                          onBlur={commitRename}
                          onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamed(null); }}
                          className="bg-primary/20 border border-primary/40 rounded px-1 text-xs outline-none text-white"
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        <span className="text-white/80">{entry.name}</span>
                      )}
                    </td>
                    <td className="py-1.5 text-white/40">{entry.size ?? '—'}</td>
                    <td className="py-1.5 text-white/40">{entry.modified ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-[#1c1c1c]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-1 z-[300] w-48"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseDown={e => e.stopPropagation()}
        >
          {contextMenu.target ? (
            <>
              <button className="w-full px-4 py-1.5 text-sm text-left hover:bg-white/10 text-white/80" onClick={() => startRename(contextMenu.target!.name)}>Rename</button>
              <div className="border-t border-white/10 my-1" />
              <button className="w-full px-4 py-1.5 text-sm text-left hover:bg-white/10 text-red-400" onClick={() => deleteEntry(contextMenu.target!.name)}>Delete</button>
            </>
          ) : (
            <>
              <button className="w-full px-4 py-1.5 text-sm text-left hover:bg-white/10 text-white/80" onClick={newFolder}>New Folder</button>
              <button className="w-full px-4 py-1.5 text-sm text-left hover:bg-white/10 text-white/80" onClick={() => { setEntries(prev => ({ ...prev, [cwd]: [...(prev[cwd] ?? []), { name: `New File ${Date.now()}.txt`, type: 'txt' }] })); setContextMenu(null); }}>New File</button>
              <div className="border-t border-white/10 my-1" />
              <button className="w-full px-4 py-1.5 text-sm text-left hover:bg-white/10 text-white/50" onClick={() => setContextMenu(null)}>Refresh</button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
