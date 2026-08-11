import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowStore } from '../../store/windowStore';
import GlassPanel from '../GlassPanel';

const DOCK_APPS = [
  { id: 'file-explorer', icon: '📁', name: 'Files' },
  { id: 'browser',       icon: '🌐', name: 'Browser' },
  { id: 'notes',         icon: '📝', name: 'Notes' },
  { id: 'music',         icon: '🎵', name: 'Music' },
  { id: 'gallery',       icon: '🖼️', name: 'Gallery' },
  { id: 'calculator',    icon: '🔢', name: 'Calculator' },
  { id: 'terminal',      icon: '💻', name: 'Terminal' },
  { id: 'settings',      icon: '⚙️', name: 'Settings' },
];

export const Dock: React.FC = () => {
  const { windows, openWindow, toggleMinimize } = useWindowStore();

  const getWindowForApp = (appId: string) => windows.find(w => w.appId === appId);

  const handleClick = (appId: string) => {
    const win = getWindowForApp(appId);
    if (win) {
      toggleMinimize(win.id);
    } else {
      openWindow(appId);
    }
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[100]">
      <GlassPanel className="px-4 py-3 flex gap-3 items-end rounded-2xl">
        {DOCK_APPS.map(app => {
          const win = getWindowForApp(app.id);
          const isOpen = !!win;
          const isMinimized = win?.minimized ?? false;

          return (
            <motion.div
              key={app.id}
              whileHover={{ scale: 1.2, y: -10 }}
              whileTap={{ scale: 0.9 }}
              className="relative group cursor-pointer flex flex-col items-center gap-1"
              onClick={() => handleClick(app.id)}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-3xl shadow-lg border transition-all ${
                isOpen && !isMinimized
                  ? 'bg-white/20 border-white/20'
                  : isMinimized
                  ? 'bg-white/10 border-white/10 opacity-70'
                  : 'bg-white/10 border-white/5'
              }`}>
                {app.icon}
              </div>

              {/* Active dot */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className={`w-1 h-1 rounded-full ${isMinimized ? 'bg-white/40' : 'bg-primary'}`}
                    style={{ boxShadow: isMinimized ? 'none' : '0 0 6px var(--color-primary)' }}
                  />
                )}
              </AnimatePresence>

              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {app.name}
                {isMinimized && <span className="ml-1 text-white/40">(minimized)</span>}
              </div>
            </motion.div>
          );
        })}
      </GlassPanel>
    </div>
  );
};
