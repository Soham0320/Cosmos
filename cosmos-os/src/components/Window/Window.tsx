import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowStore } from '../../store/windowStore';
import GlassPanel from '../GlassPanel';

interface WindowProps {
  id: string;
  appId: string;
  title: string;
  children: React.ReactNode;
  isActive: boolean;
  zIndex: number;
  minimized: boolean;
}

const MIN_W = 400;
const MIN_H = 300;
const SNAP_THRESHOLD = 20;

export const Window: React.FC<WindowProps> = ({ id, title, children, isActive, zIndex, minimized }) => {
  const { closeWindow, focusWindow, minimizeWindow, restoreWindow } = useWindowStore();
  const [maximized, setMaximized] = useState(false);
  const [size, setSize] = useState({ w: 800, h: 500 });
  const [pos, setPos] = useState({ x: 60 + Math.random() * 80, y: 40 + Math.random() * 60 });
  const resizing = useRef<{ dir: string; startX: number; startY: number; startW: number; startH: number; startPX: number; startPY: number } | null>(null);

  // ---------- Drag (title bar) ----------
  const dragStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);

  const onTitlePointerDown = useCallback((e: React.PointerEvent) => {
    if (maximized) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
    focusWindow(id);
  }, [maximized, pos, id, focusWindow]);

  const onTitlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.mx;
    const dy = e.clientY - dragStart.current.my;
    setPos({ x: dragStart.current.px + dx, y: dragStart.current.py + dy });
  }, []);

  const onTitlePointerUp = useCallback(() => {
    if (!dragStart.current) return;
    dragStart.current = null;
    // Edge snapping
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setPos(prev => {
      let { x, y } = prev;
      if (x < SNAP_THRESHOLD) {
        setSize({ w: Math.floor(vw / 2), h: vh - 32 });
        return { x: 0, y: 32 };
      }
      if (x + size.w > vw - SNAP_THRESHOLD) {
        setSize({ w: Math.floor(vw / 2), h: vh - 32 });
        return { x: Math.floor(vw / 2), y: 32 };
      }
      if (y < 32 + SNAP_THRESHOLD) {
        setMaximized(true);
        return { x: 0, y: 32 };
      }
      return { x, y };
    });
  }, [size.w]);

  // ---------- Resize handles ----------
  const onResizePointerDown = useCallback((e: React.PointerEvent, dir: string) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    resizing.current = { dir, startX: e.clientX, startY: e.clientY, startW: size.w, startH: size.h, startPX: pos.x, startPY: pos.y };
  }, [size, pos]);

  const onResizePointerMove = useCallback((e: React.PointerEvent) => {
    if (!resizing.current) return;
    const { dir, startX, startY, startW, startH, startPX, startPY } = resizing.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    let newW = startW, newH = startH, newX = startPX, newY = startPY;
    if (dir.includes('e')) newW = Math.max(MIN_W, startW + dx);
    if (dir.includes('s')) newH = Math.max(MIN_H, startH + dy);
    if (dir.includes('w')) { newW = Math.max(MIN_W, startW - dx); newX = startPX + (startW - newW); }
    if (dir.includes('n')) { newH = Math.max(MIN_H, startH - dy); newY = startPY + (startH - newH); }
    setSize({ w: newW, h: newH });
    setPos({ x: newX, y: newY });
  }, []);

  const onResizePointerUp = useCallback(() => { resizing.current = null; }, []);

  const handleMaximize = () => {
    setMaximized(m => !m);
    if (minimized) restoreWindow(id);
  };

  const handleMinimize = () => minimizeWindow(id);

  const resizeHandles = [
    { dir: 'n', cursor: 'cursor-n-resize', className: 'absolute top-0 left-2 right-2 h-1.5' },
    { dir: 's', cursor: 'cursor-s-resize', className: 'absolute bottom-0 left-2 right-2 h-1.5' },
    { dir: 'e', cursor: 'cursor-e-resize', className: 'absolute right-0 top-2 bottom-2 w-1.5' },
    { dir: 'w', cursor: 'cursor-w-resize', className: 'absolute left-0 top-2 bottom-2 w-1.5' },
    { dir: 'nw', cursor: 'cursor-nw-resize', className: 'absolute top-0 left-0 w-3 h-3' },
    { dir: 'ne', cursor: 'cursor-ne-resize', className: 'absolute top-0 right-0 w-3 h-3' },
    { dir: 'sw', cursor: 'cursor-sw-resize', className: 'absolute bottom-0 left-0 w-3 h-3' },
    { dir: 'se', cursor: 'cursor-se-resize', className: 'absolute bottom-0 right-0 w-3 h-3' },
  ];

  return (
    <AnimatePresence>
      {!minimized && (
        <motion.div
          key={id}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          onPointerDown={() => focusWindow(id)}
          onPointerMove={(e) => { onTitlePointerMove(e); onResizePointerMove(e); }}
          onPointerUp={() => { onTitlePointerUp(); onResizePointerUp(); }}
          className={`absolute flex flex-col`}
          style={
            maximized
              ? { top: 32, left: 0, right: 0, bottom: 0, zIndex, width: '100%', height: 'calc(100vh - 32px)' }
              : { top: pos.y, left: pos.x, width: size.w, height: size.h, zIndex }
          }
        >
          <GlassPanel className={`w-full h-full flex flex-col overflow-hidden ${isActive ? 'border-primary/40' : 'border-white/5'} ${maximized ? 'rounded-none' : ''}`}>
            {/* Title Bar */}
            <div
              className="flex-shrink-0 h-10 bg-black/40 border-b border-white/10 flex items-center justify-between px-4 select-none"
              style={{ cursor: maximized ? 'default' : 'move' }}
              onPointerDown={onTitlePointerDown}
              onDoubleClick={handleMaximize}
            >
              <div className="text-sm text-white/80 font-medium truncate">{title}</div>
              <div className="flex gap-2 flex-shrink-0" onPointerDown={e => e.stopPropagation()}>
                <button
                  className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-300 transition-colors"
                  title="Minimize" onClick={handleMinimize}
                />
                <button
                  className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-300 transition-colors"
                  title={maximized ? 'Restore' : 'Maximize'} onClick={handleMaximize}
                />
                <button
                  className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-300 transition-colors"
                  title="Close" onClick={() => closeWindow(id)}
                />
              </div>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-hidden relative bg-[#0a0a0a]">
              {children}
            </div>
          </GlassPanel>

          {/* Resize handles — only when not maximized */}
          {!maximized && resizeHandles.map(h => (
            <div
              key={h.dir}
              className={`${h.className} ${h.cursor} z-10`}
              onPointerDown={e => onResizePointerDown(e, h.dir)}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
