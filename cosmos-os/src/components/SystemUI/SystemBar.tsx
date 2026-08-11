import React, { useState, useEffect, useRef } from 'react';
import { useWindowStore } from '../../store/windowStore';
import { HelpCircle, Bell, Search, Maximize, Battery, Wifi, Sparkles } from 'lucide-react';

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, icon: '🚀', title: 'System Update Installed', desc: 'COSMOS OS has been updated to Build 2026.08. New AI features added.', time: 'Just now' },
    { id: 2, icon: '🤖', title: 'AI Assistant Ready', desc: 'Your personal COSMOS AI is now configured and ready to assist you.', time: '2 mins ago' }
  ]);
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
        setShowNotifications(false);
      }
    };
    if (openMenu || showNotifications) document.addEventListener('mousedown', handler);
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
        className="absolute top-0 left-0 w-full h-8 z-[100] flex justify-between items-center px-4 bg-[#141521] border-b border-white/5 text-white text-sm select-none"
      >
        {/* Left side */}
        <div className="flex items-center h-full">
          {/* Logo */}
          <div className="w-5 h-5 bg-[#3b82f6] rounded flex items-center justify-center mr-3 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
            <Sparkles size={12} className="text-white" fill="white" />
          </div>
          <div className="font-extrabold tracking-widest text-white h-full flex items-center cursor-default text-[13px]">
            COSMOS
          </div>
          <div className="ml-2 text-[9px] font-bold text-[#38bdf8] tracking-widest h-full flex items-center cursor-default uppercase">
            OPERATING SYSTEM
          </div>
          <div className="mx-4 text-white/20 text-xs">|</div>
          <div className="text-[11px] text-white/70 font-medium">
            {time.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/,/g, '')}
          </div>
        </div>

        {/* Right side */}
        <div className="flex gap-5 items-center h-full text-white/60 px-2 relative">
          <button className="hover:text-white transition-colors" onClick={() => setShowAbout(true)}><HelpCircle size={14} strokeWidth={2} /></button>
          
          <button 
            className="hover:text-white transition-colors relative"
            onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); setOpenMenu(null); setShowAbout(false); }}
          >
            <Bell size={14} strokeWidth={2} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full border border-[#141521]"></span>
            )}
          </button>
          <button className="hover:text-white transition-colors" onClick={() => {
            if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
            else document.exitFullscreen().catch(() => {});
          }}><Maximize size={14} strokeWidth={2} /></button>
          
          <div className="flex items-center gap-1.5 ml-1 text-[11px] font-medium text-white/80">
            <Battery size={15} strokeWidth={2} className="text-[#4ade80]" />
            <span>100%</span>
          </div>
          <div className="flex items-center ml-1">
            <Wifi size={14} strokeWidth={2} />
          </div>
          <div className="ml-2 font-bold text-white text-[12px]">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* About / Help modal */}
      {showAbout && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 w-80 shadow-2xl text-center text-white flex flex-col items-center">
            <div className="text-5xl mb-4">🌌</div>
            <h2 className="text-2xl font-bold text-[#3b82f6] tracking-wide mb-1">COSMOS OS</h2>
            <p className="text-white/50 text-xs mb-4">Version 1.0.0 — Build 2026.08</p>
            
            <div className="w-full bg-white/5 rounded-xl p-4 mb-6 text-left border border-white/10">
              <h3 className="text-white/80 font-semibold mb-3 text-sm">Keyboard Shortcuts</h3>
              <ul className="space-y-2 text-xs text-white/60">
                <li className="flex justify-between"><span>🔍 Spotlight Search</span> <span className="text-white/40 font-mono bg-white/10 px-1.5 py-0.5 rounded">Ctrl + Space</span></li>
                <li className="flex justify-between"><span>💻 Terminal</span> <span className="text-white/40 font-mono bg-white/10 px-1.5 py-0.5 rounded">Alt + T</span></li>
                <li className="flex justify-between"><span>⚙️ Settings</span> <span className="text-white/40 font-mono bg-white/10 px-1.5 py-0.5 rounded">Alt + S</span></li>
                <li className="flex justify-between"><span>📁 Files</span> <span className="text-white/40 font-mono bg-white/10 px-1.5 py-0.5 rounded">Alt + F</span></li>
                <li className="flex justify-between"><span>🎵 Music</span> <span className="text-white/40 font-mono bg-white/10 px-1.5 py-0.5 rounded">Alt + M</span></li>
              </ul>
            </div>

            <button
              onClick={() => setShowAbout(false)}
              className="px-8 py-2 rounded-lg bg-[#3b82f6] text-white font-semibold hover:bg-blue-400 transition-all shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <div 
          className="absolute top-10 right-4 w-80 bg-[#1c1c28]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-[400] overflow-hidden flex flex-col"
          onMouseDown={e => e.stopPropagation()}
        >
          <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-white/5">
            <span className="text-white/80 font-semibold text-sm">Notifications</span>
            {notifications.length > 0 && (
              <button className="text-xs text-[#3b82f6] hover:text-blue-400" onClick={() => setNotifications([])}>Clear All</button>
            )}
          </div>
          <div className="p-2 flex flex-col gap-2 max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-white/40 text-sm flex flex-col items-center gap-2">
                <span className="text-3xl opacity-50">📭</span>
                No new notifications
              </div>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-default">
                  <div className="flex gap-3">
                    <div className="text-xl">{notif.icon}</div>
                    <div className="flex flex-col">
                      <span className="text-sm text-white/90 font-medium">{notif.title}</span>
                      <span className="text-xs text-white/50 leading-relaxed mt-0.5">{notif.desc}</span>
                      <span className="text-[10px] text-white/30 mt-2">{notif.time}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};
