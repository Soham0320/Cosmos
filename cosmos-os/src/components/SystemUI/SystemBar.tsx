import React, { useState, useEffect, useRef } from 'react';
import { useWindowStore } from '../../store/windowStore';

type MenuId = 'file' | 'edit' | 'view' | 'help' | null;

interface MenuItem {
  label: string;
  shortcut?: string;
  action?: () => void;
  divider?: boolean;
}

interface SystemBarProps {
  onOpenSearch?: () => void;
}

export const SystemBar: React.FC<SystemBarProps> = ({ onOpenSearch }) => {
  const [time, setTime] = useState(new Date());
  const [openMenu, setOpenMenu] = useState<MenuId>(null);
  const [showAbout, setShowAbout] = useState(false);
  const { openWindow } = useWindowStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    if (openMenu) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenu]);

  const toggleMenu = (id: MenuId) => setOpenMenu(prev => prev === id ? null : id);

  const menus: Record<string, MenuItem[]> = {
    file: [
      { label: 'Open File Explorer', action: () => { openWindow('file-explorer'); setOpenMenu(null); } },
      { label: 'Open Terminal',       action: () => { openWindow('terminal');      setOpenMenu(null); } },
      { divider: true, label: '' },
      { label: 'Settings',            action: () => { openWindow('settings');      setOpenMenu(null); } },
    ],
    edit: [
      { label: 'Cut',   shortcut: '⌘X', action: () => { document.execCommand('cut');   setOpenMenu(null); } },
      { label: 'Copy',  shortcut: '⌘C', action: () => { document.execCommand('copy');  setOpenMenu(null); } },
      { label: 'Paste', shortcut: '⌘V', action: async () => {
          try {
            const text = await navigator.clipboard.readText();
            document.execCommand('insertText', false, text);
          } catch { /* clipboard permission denied */ }
          setOpenMenu(null);
        }
      },
    ],
    view: [
      {
        label: 'Toggle Fullscreen',
        shortcut: 'F11',
        action: () => {
          if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
          else document.exitFullscreen().catch(() => {});
          setOpenMenu(null);
        }
      },
    ],
    help: [
      { label: 'About COSMOS OS', action: () => { setShowAbout(true); setOpenMenu(null); } },
      { label: 'Keyboard Shortcuts', action: () => setOpenMenu(null) },
    ],
  };

  return (
    <>
      <div
        ref={menuRef}
        className="absolute top-0 left-0 w-full h-8 z-[100] flex justify-between items-center px-4 bg-black/30 backdrop-blur-md border-b border-white/10 text-white text-sm select-none"
      >
        {/* Left side */}
        <div className="flex gap-1 items-center h-full">
          <div className="font-bold tracking-widest text-primary px-2 h-full flex items-center cursor-default">
            COSMOS
          </div>

          {(['file', 'edit', 'view', 'help'] as const).map(menuId => (
            <div key={menuId} className="relative h-full flex items-center">
              <button
                id={`systembar-${menuId}`}
                onClick={() => toggleMenu(menuId)}
                className={`capitalize px-2 h-full flex items-center rounded transition-colors ${
                  openMenu === menuId ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                {menuId.charAt(0).toUpperCase() + menuId.slice(1)}
              </button>

              {openMenu === menuId && (
                <div className="absolute top-full left-0 mt-0.5 min-w-[200px] bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl py-1 z-[200]">
                  {menus[menuId].map((item, i) =>
                    item.divider ? (
                      <div key={i} className="border-t border-white/10 my-1" />
                    ) : (
                      <button
                        key={item.label}
                        onClick={item.action}
                        className="w-full flex items-center justify-between px-4 py-1.5 hover:bg-white/10 transition-colors text-left text-sm text-white/90"
                      >
                        <span>{item.label}</span>
                        {item.shortcut && <span className="text-white/30 text-xs ml-6">{item.shortcut}</span>}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Search Button */}
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="px-2.5 h-full flex items-center hover:bg-white/10 text-white/70 hover:text-white rounded transition-colors text-xs gap-1"
              title="Search Apps (Ctrl+Space)"
            >
              <span>🔍</span>
              <span className="text-[9px] opacity-40 font-mono bg-white/10 px-1 py-0.5 rounded leading-none">Ctrl+Space</span>
            </button>
          )}
        </div>

        {/* Right side */}
        <div className="flex gap-2 items-center h-full text-white/70">
          <div className="px-2 h-full flex items-center gap-1 text-xs">
            <span>🔋</span><span>100%</span>
          </div>
          <div className="px-2 h-full flex items-center text-xs">
            <span>📶</span>
          </div>
          <div className="px-2 h-full flex items-center font-medium text-white">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* About modal */}
      {showAbout && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 w-80 shadow-2xl text-center text-white">
            <div className="text-5xl mb-4">🌌</div>
            <h2 className="text-2xl font-bold text-primary tracking-wide mb-1">COSMOS OS</h2>
            <p className="text-white/50 text-sm mb-4">Version 1.0.0 — Build 2026.08</p>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              A modern, glassmorphic desktop experience built with React &amp; Framer Motion.
            </p>
            <button
              onClick={() => setShowAbout(false)}
              className="px-6 py-2 rounded-lg bg-primary text-black font-semibold hover:brightness-110 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
