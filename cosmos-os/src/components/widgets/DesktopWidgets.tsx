import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarWidget } from './CalendarWidget';
import { ClockWidget } from './ClockWidget';
import { WeatherWidget } from './WeatherWidget';
import { AIChatWidget } from './AIChatWidget';

export interface WidgetConfig {
  id: string;
  type: 'calendar' | 'clock' | 'weather' | 'aichat';
  label: string;
  icon: string;
  defaultW: number;
  defaultH: number;
}

export const AVAILABLE_WIDGETS: WidgetConfig[] = [
  { id: 'clock',    type: 'clock',    label: 'Clock',    icon: '🕐', defaultW: 200, defaultH: 220 },
  { id: 'calendar', type: 'calendar', label: 'Calendar', icon: '📅', defaultW: 200, defaultH: 250 },
  { id: 'weather',  type: 'weather',  label: 'Weather',  icon: '🌤️', defaultW: 220, defaultH: 240 },
  { id: 'aichat',   type: 'aichat',   label: 'AI Chatbot', icon: '🤖', defaultW: 300, defaultH: 400 },
];

interface WidgetInstance {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const WIDGET_COMPONENTS: Record<string, React.FC> = {
  calendar: CalendarWidget,
  clock: ClockWidget,
  weather: WeatherWidget,
  aichat: AIChatWidget,
};

interface DesktopWidgetsProps {
  widgets: WidgetInstance[];
  onRemoveWidget: (id: string) => void;
  onMoveWidget: (id: string, x: number, y: number) => void;
}

const WidgetFrame: React.FC<{
  widget: WidgetInstance;
  onRemove: () => void;
  onMove: (x: number, y: number) => void;
}> = ({ widget, onRemove, onMove }) => {
  const dragStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);
  const [hovering, setHovering] = useState(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = { mx: e.clientX, my: e.clientY, px: widget.x, py: widget.y };
  }, [widget.x, widget.y]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.mx;
    const dy = e.clientY - dragStart.current.my;
    onMove(dragStart.current.px + dx, dragStart.current.py + dy);
  }, [onMove]);

  const onPointerUp = useCallback(() => {
    dragStart.current = null;
  }, []);

  const Component = WIDGET_COMPONENTS[widget.type];
  if (!Component) return null;

  const config = AVAILABLE_WIDGETS.find(w => w.type === widget.type);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="absolute group"
      style={{
        left: widget.x,
        top: widget.y,
        width: widget.w,
        height: widget.h,
        zIndex: 5,
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Drag handle — top area */}
      <div
        className="absolute top-0 left-0 right-0 h-6 cursor-move z-20"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />

      {/* Remove button */}
      <AnimatePresence>
        {hovering && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500/80 text-white text-[10px] flex items-center justify-center z-30 hover:bg-red-400 shadow-lg backdrop-blur-sm"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            title={`Remove ${config?.label || 'widget'}`}
          >
            ✕
          </motion.button>
        )}
      </AnimatePresence>

      {/* Widget glass frame */}
      <div
        className="w-full h-full rounded-2xl overflow-hidden backdrop-blur-xl border shadow-2xl transition-all duration-300"
        style={{
          background: 'rgba(12, 16, 29, 0.55)',
          borderColor: hovering ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)',
          boxShadow: hovering
            ? '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)'
            : '0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        <Component />
      </div>
    </motion.div>
  );
};

export const DesktopWidgets: React.FC<DesktopWidgetsProps> = ({
  widgets,
  onRemoveWidget,
  onMoveWidget,
}) => {
  return (
    <AnimatePresence>
      {widgets.map(w => (
        <WidgetFrame
          key={w.id}
          widget={w}
          onRemove={() => onRemoveWidget(w.id)}
          onMove={(x, y) => onMoveWidget(w.id, x, y)}
        />
      ))}
    </AnimatePresence>
  );
};
