import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, Bell, Maximize, Battery, Wifi, Sparkles } from 'lucide-react';

interface SystemBarProps {
  onOpenSearch?: () => void;
}

export const SystemBar: React.FC<SystemBarProps> = ({ onOpenSearch: _onOpenSearch }) => {
  const [time, setTime] = useState(new Date());
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [helpTab, setHelpTab] = useState<'shortcuts' | 'tips' | 'about'>('shortcuts');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, icon: '🚀', title: 'System Update Installed', desc: 'COSMOS OS has been updated to Build 2026.08. New AI features added.', time: 'Just now' },
    { id: 2, icon: '🤖', title: 'AI Assistant Ready', desc: 'Your personal COSMOS AI is now configured and ready to assist you.', time: '2 mins ago' }
  ]);
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
          <button
            className="hover:text-white transition-colors"
            title="Help & Keyboard Shortcuts"
            onClick={() => { setShowAbout(true); setHelpTab('shortcuts'); setShowNotifications(false); setOpenMenu(null); }}
          >
            <HelpCircle size={14} strokeWidth={2} />
          </button>
          
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


      {/* ── Help Center modal ── */}
      {showAbout && (
        <div
          className="absolute inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowAbout(false)}
        >
          <div
            className="bg-[#12131f] border border-white/10 rounded-2xl shadow-2xl text-white flex overflow-hidden"
            style={{ width: 600, maxHeight: '82vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Sidebar tabs */}
            <div className="w-40 flex-shrink-0 bg-white/[0.03] border-r border-white/5 flex flex-col py-4 gap-1">
              <div className="px-4 pb-3 flex items-center gap-2 border-b border-white/5 mb-1">
                <div className="w-6 h-6 bg-[#3b82f6] rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.4)]">
                  <Sparkles size={12} className="text-white" fill="white" />
                </div>
                <span className="text-xs font-bold tracking-widest text-white/80">HELP</span>
              </div>
              {([
                { id: 'shortcuts', label: 'Shortcuts', icon: '⌨️' },
                { id: 'tips',      label: 'Tips',      icon: '💡' },
                { id: 'about',     label: 'About',     icon: '🌌' },
              ] as const).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setHelpTab(tab.id)}
                  className={`flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg text-sm transition-all text-left ${
                    helpTab === tab.id
                      ? 'bg-[#3b82f6]/20 text-[#60a5fa] font-semibold'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
                <div>
                  <h2 className="text-sm font-bold text-white">
                    {helpTab === 'shortcuts' && 'Keyboard Shortcuts'}
                    {helpTab === 'tips'      && 'Tips & Tricks'}
                    {helpTab === 'about'     && 'About COSMOS OS'}
                  </h2>
                  <p className="text-[10px] text-white/30 mt-0.5">
                    {helpTab === 'shortcuts' && 'Global hotkeys available anywhere on the desktop'}
                    {helpTab === 'tips'      && 'Power-user features to get the most out of COSMOS'}
                    {helpTab === 'about'     && 'System information and version details'}
                  </p>
                </div>
                <button
                  onClick={() => setShowAbout(false)}
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-white/40 hover:text-red-400 transition-all text-xs"
                >✕</button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto p-5">

                {/* ── Shortcuts ── */}
                {helpTab === 'shortcuts' && (
                  <div className="space-y-4">
                    {[
                      {
                        section: 'System',
                        items: [
                          { action: 'Spotlight Search',  keys: ['Ctrl', 'Space'], icon: '🔍' },
                          { action: 'Toggle Fullscreen', keys: ['F11'],           icon: '⛶'  },
                        ],
                      },
                      {
                        section: 'Open Apps',
                        items: [
                          { action: 'Terminal',       keys: ['Alt', 'T'], icon: '💻' },
                          { action: 'Settings',       keys: ['Alt', 'S'], icon: '⚙️' },
                          { action: 'File Explorer',  keys: ['Alt', 'F'], icon: '📁' },
                          { action: 'Music Player',   keys: ['Alt', 'M'], icon: '🎵' },
                        ],
                      },
                      {
                        section: 'Window Management',
                        items: [
                          { action: 'Minimize Window',     keys: ['Yellow ●'], icon: '🟡' },
                          { action: 'Maximize / Restore',  keys: ['Green ●'],  icon: '🟢' },
                          { action: 'Close Window',        keys: ['Red ●'],    icon: '🔴' },
                          { action: 'Snap Left / Right',   keys: ['Drag → edge'], icon: '↔️' },
                          { action: 'Maximize by Drag',    keys: ['Drag → top'],  icon: '⬆️' },
                          { action: 'Resize Window',       keys: ['Drag edge handle'], icon: '⤡' },
                        ],
                      },
                    ].map(group => (
                      <div key={group.section}>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-2 px-1">{group.section}</div>
                        <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
                          {group.items.map((item, idx) => (
                            <div
                              key={item.action}
                              className={`flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.04] transition-colors ${
                                idx < group.items.length - 1 ? 'border-b border-white/5' : ''
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-base w-6 text-center">{item.icon}</span>
                                <span className="text-sm text-white/70">{item.action}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {item.keys.map((k, ki) => (
                                  <React.Fragment key={k}>
                                    {ki > 0 && <span className="text-white/20 text-[10px] mx-0.5">+</span>}
                                    <kbd className="px-2 py-0.5 bg-white/8 border border-white/10 rounded text-[11px] font-mono text-white/50">{k}</kbd>
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Tips ── */}
                {helpTab === 'tips' && (
                  <div className="space-y-2.5">
                    {[
                      { icon: '🖱️', title: 'Double-click to open',      desc: 'Double-click any desktop icon or file in the Explorer to open the app or enter a folder.' },
                      { icon: '📌', title: 'Right-click context menus',  desc: 'Right-click the desktop or any file/folder for quick actions: Open, Rename, Delete, New Folder, Add Widget.' },
                      { icon: '🔍', title: 'Spotlight Search',           desc: 'Press Ctrl + Space anywhere to instantly search apps and widgets. Arrow keys navigate, Enter opens.' },
                      { icon: '🪟', title: 'Window edge snapping',       desc: 'Drag a window to the left or right screen edge to snap it to half the screen. Drag to the top bar to maximize.' },
                      { icon: '🧩', title: 'Desktop widgets',            desc: 'Right-click the desktop → "Add Widget…" to place a Clock, Calendar, or Weather widget. Drag to reposition anytime.' },
                      { icon: '🎵', title: 'Drop music files',           desc: 'Drag any MP3, WAV, FLAC, or OGG file directly onto the Music Player window to add it to the queue and play instantly.' },
                      { icon: '⚙️', title: 'Personalise COSMOS',        desc: 'Open Settings (Alt + S) to change wallpaper, accent colour, and system theme to match your style.' },
                      { icon: '🤖', title: 'COSMOS AI assistant',        desc: 'The AI Chat widget on your desktop is always ready. Open the full AI Chat app from the Dock for a larger experience.' },
                      { icon: '📂', title: 'File Explorer tips',         desc: 'Switch between Grid and List views using the toggle buttons in the toolbar. Right-click files for Rename and Delete.' },
                      { icon: '📋', title: 'Notes app',                  desc: 'The Notes app supports multiple notes with Markdown-style formatting. Your notes are saved automatically.' },
                    ].map(tip => (
                      <div key={tip.title} className="flex gap-3 p-3.5 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-colors">
                        <span className="text-2xl flex-shrink-0 mt-0.5">{tip.icon}</span>
                        <div>
                          <div className="text-sm font-semibold text-white/80 mb-0.5">{tip.title}</div>
                          <div className="text-xs text-white/40 leading-relaxed">{tip.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── About ── */}
                {helpTab === 'about' && (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center py-4 gap-3">
                      <div className="w-16 h-16 bg-[#3b82f6] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                        <Sparkles size={32} className="text-white" fill="white" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-xl font-extrabold tracking-widest text-white">COSMOS OS</h3>
                        <p className="text-xs text-[#38bdf8] tracking-widest uppercase mt-0.5">Operating System</p>
                      </div>
                    </div>

                    <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
                      {[
                        { label: 'Version',    value: '1.0.0' },
                        { label: 'Build',      value: '2026.08' },
                        { label: 'Platform',   value: 'Web · React + Vite' },
                        { label: 'UI Engine',  value: 'Tailwind CSS + Framer Motion' },
                        { label: 'Released',   value: 'August 2026' },
                      ].map((row, i, arr) => (
                        <div key={row.label} className={`flex justify-between px-4 py-2.5 text-sm ${i < arr.length - 1 ? 'border-b border-white/5' : ''}`}>
                          <span className="text-white/40">{row.label}</span>
                          <span className="text-white/70 font-medium">{row.value}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-center text-[11px] text-white/20 leading-relaxed pb-2">
                      Built with ❤️ — COSMOS OS is a browser-based desktop environment<br />running entirely in your browser with no installation required.
                    </p>
                  </div>
                )}

              </div>
            </div>
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
