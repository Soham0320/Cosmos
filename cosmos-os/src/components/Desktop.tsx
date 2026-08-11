import React, { useState, useEffect, useRef } from 'react';
import { useSettingsStore, defaultWallpapers } from '../store/settingsStore';
import { useWindowStore } from '../store/windowStore';
import { WindowManager } from './Window/WindowManager';
import { Dock } from './Dock/Dock';
import { SystemBar } from './SystemUI/SystemBar';
import { DesktopWidgets, AVAILABLE_WIDGETS } from './widgets/DesktopWidgets';

interface DesktopIcon {
  id: string;
  label: string;
  icon: string;
}

const ALL_ICONS: DesktopIcon[] = [
  { id: 'file-explorer', label: 'Files',      icon: '📁' },
  { id: 'settings',      label: 'Settings',   icon: '⚙️' },
  { id: 'terminal',      label: 'Terminal',   icon: '💻' },
  { id: 'browser',       label: 'Browser',    icon: '🌐' },
  { id: 'notes',         label: 'Notes',      icon: '📝' },
  { id: 'music',         label: 'Music',      icon: '🎵' },
  { id: 'gallery',       label: 'Gallery',    icon: '🖼️' },
  { id: 'calculator',    label: 'Calculator', icon: '🔢' },
  { id: 'calendar',      label: 'Calendar',   icon: '📅' },
];

interface ContextMenu {
  x: number;
  y: number;
  iconId: string | null; // null = desktop context menu
}

interface WidgetInstance {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface SearchItem {
  id: string;
  label: string;
  icon: string;
  category: 'Application' | 'Widget Action';
  action: () => void;
}

const Desktop: React.FC = () => {
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [visibleIcons, setVisibleIcons] = useState<string[]>(ALL_ICONS.map(i => i.id));
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  
  // Spotlight Search states
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSearchIdx, setSelectedSearchIdx] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { wallpaper } = useSettingsStore();
  const { openWindow } = useWindowStore();
  const contextRef = useRef<HTMLDivElement>(null);

  // Widget state — initialize with all 3 widgets placed on the right side
  const [widgets, setWidgets] = useState<WidgetInstance[]>([
    { id: 'clock-1',    type: 'clock',    x: window.innerWidth - 240, y: 50,  w: 200, h: 220 },
    { id: 'calendar-1', type: 'calendar', x: window.innerWidth - 240, y: 290, w: 200, h: 250 },
    { id: 'weather-1',  type: 'weather',  x: window.innerWidth - 260, y: 560, w: 220, h: 240 },
  ]);

  const activeWallpaper = defaultWallpapers.find(w => w.id === wallpaper) ?? defaultWallpapers[0];
  const icons = ALL_ICONS.filter(i => visibleIcons.includes(i.id));
  const hiddenIcons = ALL_ICONS.filter(i => !visibleIcons.includes(i.id));

  // Spotlight search items definition
  const searchItems: SearchItem[] = [
    ...ALL_ICONS.map(icon => ({
      id: icon.id,
      label: icon.label,
      icon: icon.icon,
      category: 'Application' as const,
      action: () => {
        openWindow(icon.id);
        setShowSearch(false);
      }
    })),
    {
      id: 'widget-clock',
      label: 'Add Clock Widget',
      icon: '🕐',
      category: 'Widget Action' as const,
      action: () => {
        addWidget('clock');
        setShowSearch(false);
      }
    },
    {
      id: 'widget-calendar',
      label: 'Add Calendar Widget',
      icon: '📅',
      category: 'Widget Action' as const,
      action: () => {
        addWidget('calendar');
        setShowSearch(false);
      }
    },
    {
      id: 'widget-weather',
      label: 'Add Weather Widget',
      icon: '🌤️',
      category: 'Widget Action' as const,
      action: () => {
        addWidget('weather');
        setShowSearch(false);
      }
    }
  ];

  // Filter search items dynamically
  const filteredSearchItems = searchItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu && !showAddMenu && !showWidgetPicker) return;
    const handler = (e: MouseEvent) => {
      if (contextRef.current && !contextRef.current.contains(e.target as Node)) {
        setContextMenu(null);
        setShowAddMenu(false);
        setShowWidgetPicker(false);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [contextMenu, showAddMenu, showWidgetPicker]);

  // Global hotkey for Spotlight search (Ctrl+Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        setShowSearch(prev => !prev);
        setSearchQuery('');
        setSelectedSearchIdx(0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autofocus search input when opened
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, iconId: null });
    setSelectedIcon(null);
  };

  const handleIconContextMenu = (e: React.MouseEvent, iconId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, iconId });
    setSelectedIcon(iconId);
  };

  const removeIcon = (id: string) => {
    setVisibleIcons(prev => prev.filter(i => i !== id));
    setContextMenu(null);
    if (selectedIcon === id) setSelectedIcon(null);
  };

  const openApp = (id: string) => {
    openWindow(id);
    setContextMenu(null);
  };

  const addIcon = (id: string) => {
    setVisibleIcons(prev => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
    setShowAddMenu(false);
    setContextMenu(null);
  };

  // Widget management
  const addWidget = (type: string) => {
    // Prevent duplicate widgets of the same type
    if (widgets.some(w => w.type === type)) {
      setShowWidgetPicker(false);
      setContextMenu(null);
      return;
    }
    const config = AVAILABLE_WIDGETS.find(w => w.type === type);
    if (!config) return;
    const newWidget: WidgetInstance = {
      id: `${type}-${Date.now()}`,
      type,
      x: 200 + Math.random() * 300,
      y: 100 + Math.random() * 200,
      w: config.defaultW,
      h: config.defaultH,
    };
    setWidgets(prev => [...prev, newWidget]);
    setShowWidgetPicker(false);
    setContextMenu(null);
  };

  const removeWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  };

  const moveWidget = (id: string, x: number, y: number) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, x, y } : w));
  };

  // Handle Search Modal Key events (arrows navigation)
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSearchIdx(prev => (prev + 1) % filteredSearchItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSearchIdx(prev => (prev - 1 + filteredSearchItems.length) % filteredSearchItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSearchItems[selectedSearchIdx]) {
        filteredSearchItems[selectedSearchIdx].action();
      }
    } else if (e.key === 'Escape') {
      setShowSearch(false);
    }
  };

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{
        backgroundImage: `url(${activeWallpaper.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={() => {
        setSelectedIcon(null);
        setContextMenu(null);
        setShowAddMenu(false);
        setShowWidgetPicker(false);
      }}
      onContextMenu={handleDesktopContextMenu}
    >
      <SystemBar onOpenSearch={() => { setShowSearch(true); setSearchQuery(''); setSelectedSearchIdx(0); }} />

      {/* Permanent Desktop Search Bar */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-md z-10">
        <div 
          className="flex items-center px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl cursor-text hover:bg-white/15 transition-colors"
          onClick={() => { setShowSearch(true); setSearchQuery(''); setSelectedSearchIdx(0); }}
        >
          <span className="text-lg opacity-60 mr-3">🔍</span>
          <span className="text-white/60 text-sm font-medium">Search apps, widgets, and more...</span>
        </div>
      </div>

      {/* Desktop Icons */}
      <div className="absolute top-12 left-4 flex flex-col gap-2 z-10">
        {icons.map(icon => (
          <div
            key={icon.id}
            className={`w-20 flex flex-col items-center gap-1.5 p-2 rounded-xl cursor-pointer transition-all relative group ${
              selectedIcon === icon.id
                ? 'bg-white/25 border border-white/20 shadow-lg'
                : 'hover:bg-white/12'
            }`}
            onClick={(e) => { e.stopPropagation(); setSelectedIcon(icon.id); }}
            onDoubleClick={(e) => { e.stopPropagation(); openWindow(icon.id); }}
            onContextMenu={(e) => handleIconContextMenu(e, icon.id)}
          >
            {/* Delete badge — shown on hover */}
            <button
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-400 shadow-md hidden group-hover:flex"
              onClick={(e) => { e.stopPropagation(); removeIcon(icon.id); }}
              title={`Remove ${icon.label} from desktop`}
            >
              ✕
            </button>

            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg transition-all ${
              selectedIcon === icon.id ? 'bg-white/25 scale-105' : 'bg-white/10'
            }`}>
              {icon.icon}
            </div>
            <span className="text-white text-xs text-center drop-shadow-lg select-none leading-tight">{icon.label}</span>
          </div>
        ))}
      </div>

      {/* Desktop Widgets */}
      <DesktopWidgets
        widgets={widgets}
        onRemoveWidget={removeWidget}
        onMoveWidget={moveWidget}
      />

      <WindowManager />
      <Dock />

      {/* Spotlight Search Overlay */}
      {showSearch && (
        <div
          className="fixed inset-0 z-[400] bg-black/35 backdrop-blur-[3px] flex items-start justify-center pt-28"
          onClick={() => setShowSearch(false)}
        >
          <div
            className="w-full max-w-[500px] bg-[#1a1a1a]/85 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3 border-b border-white/10 gap-3">
              <span className="text-lg opacity-40">🔍</span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setSelectedSearchIdx(0);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search apps or actions..."
                className="flex-1 bg-transparent border-none outline-none text-white text-base placeholder-white/30"
              />
              <span className="text-[10px] opacity-30 bg-white/10 px-2 py-0.5 rounded font-mono">ESC to close</span>
            </div>

            {/* Search Results */}
            <div className="max-h-[300px] overflow-y-auto p-2">
              {filteredSearchItems.length === 0 ? (
                <div className="text-center py-6 text-white/30 text-sm">
                  No matching apps or actions
                </div>
              ) : (
                filteredSearchItems.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => item.action()}
                    onMouseEnter={() => setSelectedSearchIdx(idx)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                      selectedSearchIdx === idx ? 'bg-primary text-black font-medium' : 'hover:bg-white/5 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl flex-shrink-0">{item.icon}</span>
                      <span className="text-sm truncate">{item.label}</span>
                    </div>
                    <span className={`text-[9px] uppercase tracking-wider font-mono opacity-50 px-2 py-0.5 rounded ${
                      selectedSearchIdx === idx ? 'bg-black/10 text-black' : 'bg-white/5 text-white/40'
                    }`}>
                      {item.category}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextRef}
          className="fixed bg-[#1c1c1c]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-1 z-[400] w-52"
          style={{ left: Math.min(contextMenu.x, window.innerWidth - 220), top: Math.min(contextMenu.y, window.innerHeight - 260) }}
          onMouseDown={e => e.stopPropagation()}
        >
          {contextMenu.iconId ? (
            /* Icon context menu */
            <>
              {(() => {
                const ic = ALL_ICONS.find(i => i.id === contextMenu.iconId)!;
                return (
                  <>
                    <div className="px-4 py-2 text-xs font-semibold text-white/40 border-b border-white/10 flex items-center gap-2">
                      <span>{ic.icon}</span><span>{ic.label}</span>
                    </div>
                    <button className="w-full px-4 py-1.5 text-sm text-left hover:bg-white/10 text-white/80 transition-colors"
                      onClick={() => openApp(contextMenu.iconId!)}>
                      Open
                    </button>
                    <div className="border-t border-white/10 my-1" />
                    <button className="w-full px-4 py-1.5 text-sm text-left hover:bg-white/10 text-red-400 transition-colors"
                      onClick={() => removeIcon(contextMenu.iconId!)}>
                      Remove from Desktop
                    </button>
                  </>
                );
              })()}
            </>
          ) : (
            /* Desktop context menu */
            <>
              <div className="px-4 py-1.5 text-xs font-semibold text-white/30 uppercase tracking-wider">Desktop</div>
              <button className="w-full px-4 py-1.5 text-sm text-left hover:bg-white/10 text-white/80 transition-colors"
                onClick={e => { e.stopPropagation(); setShowAddMenu(true); setContextMenu(null); }}>
                Add App to Desktop…
              </button>
              <button className="w-full px-4 py-1.5 text-sm text-left hover:bg-white/10 text-white/80 transition-colors flex items-center gap-2"
                onClick={e => { e.stopPropagation(); setShowWidgetPicker(true); setContextMenu(null); }}>
                <span>🧩</span> Add Widget…
              </button>
              <div className="border-t border-white/10 my-1" />
              <button className="w-full px-4 py-1.5 text-sm text-left hover:bg-white/10 text-white/80 transition-colors"
                onClick={() => { openWindow('settings'); setContextMenu(null); }}>
                Settings
              </button>
            </>
          )}
        </div>
      )}

      {/* Add Icon picker (shown after "Add App to Desktop") */}
      {showAddMenu && hiddenIcons.length > 0 && (
        <div
          ref={contextRef}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1c1c1c]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 z-[400] w-64"
          onMouseDown={e => e.stopPropagation()}
        >
          <div className="text-sm font-semibold text-white/80 mb-3">Add to Desktop</div>
          <div className="grid grid-cols-3 gap-2">
            {hiddenIcons.map(ic => (
              <button key={ic.id} onClick={() => addIcon(ic.id)}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-white/5 hover:bg-white/15 transition-colors">
                <span className="text-2xl">{ic.icon}</span>
                <span className="text-[10px] text-white/60 text-center leading-tight">{ic.label}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setShowAddMenu(false)} className="w-full mt-3 py-1.5 rounded-xl text-xs text-white/40 hover:text-white/70 transition-colors">Cancel</button>
        </div>
      )}

      {/* Widget picker modal */}
      {showWidgetPicker && (
        <div
          ref={contextRef}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1c1c1c]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-5 z-[400] w-72"
          onMouseDown={e => e.stopPropagation()}
        >
          <div className="text-sm font-semibold text-white/80 mb-1">Add Widget</div>
          <div className="text-[11px] text-white/30 mb-4">Choose a widget to add to your desktop</div>
          <div className="space-y-2">
            {AVAILABLE_WIDGETS.map(wc => (
              <button
                key={wc.id}
                onClick={() => addWidget(wc.type)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  {wc.icon}
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-white/80">{wc.label}</div>
                  <div className="text-[10px] text-white/30">
                    {wc.type === 'clock' && 'Analog & digital clock'}
                    {wc.type === 'calendar' && 'Month view calendar'}
                    {wc.type === 'weather' && 'Current weather & forecast'}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowWidgetPicker(false)}
            className="w-full mt-4 py-1.5 rounded-xl text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default Desktop;
