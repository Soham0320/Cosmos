import React, { useState } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

interface CalEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  color: string;
}

const EVENT_COLORS = ['#00e5ff', '#b388ff', '#69f0ae', '#ffab40', '#f48fb1'];

const DEFAULT_EVENTS: CalEvent[] = [
  { id: '1', date: `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}`, title: 'Today\'s Standup', color: '#00e5ff' },
  { id: '2', date: `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(Math.min(new Date().getDate()+2, 28)).padStart(2,'0')}`, title: 'Project Review', color: '#b388ff' },
];

export const CalendarApp: React.FC = () => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState<CalEvent[]>(DEFAULT_EVENTS);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventColor, setNewEventColor] = useState(EVENT_COLORS[0]);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const toKey = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());
  const eventsForDate = (key: string) => events.filter(e => e.date === key);

  const addEvent = () => {
    if (!selectedDate || !newEventTitle.trim()) return;
    setEvents(prev => [...prev, { id: Date.now().toString(), date: selectedDate, title: newEventTitle.trim(), color: newEventColor }]);
    setNewEventTitle('');
  };

  const deleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));

  // Build calendar grid: 6 rows × 7 cols
  const cells: { day: number; key: string; current: boolean }[] = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: prevMonthDays - firstDay + 1 + i, key: '', current: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, key: toKey(viewYear, viewMonth, d), current: true });
  while (cells.length < 42) { const d = cells.length - firstDay - daysInMonth + 1; cells.push({ day: d, key: '', current: false }); }

  const selectedEvents = selectedDate ? eventsForDate(selectedDate) : [];

  return (
    <div className="w-full h-full flex bg-background text-white overflow-hidden">
      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col p-4 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{MONTHS[viewMonth]} {viewYear}</h2>
          <div className="flex gap-2">
            <button onClick={() => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); }}
              className="px-3 py-1 text-xs rounded-lg bg-white/10 hover:bg-white/20 transition-colors">Today</button>
            <button onClick={prevMonth} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">‹</button>
            <button onClick={nextMonth} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">›</button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-white/30 py-1">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 flex-1 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/5">
          {cells.map((cell, i) => {
            const dayEvents = cell.key ? eventsForDate(cell.key) : [];
            const isToday = cell.key === todayKey;
            const isSelected = cell.key === selectedDate;
            return (
              <div
                key={i}
                onClick={() => cell.current && setSelectedDate(isSelected ? null : cell.key)}
                className={`bg-background p-1.5 flex flex-col gap-0.5 transition-colors min-h-[60px] ${
                  cell.current ? 'cursor-pointer hover:bg-white/5' : 'opacity-25'
                } ${isSelected ? 'bg-primary/10 ring-1 ring-inset ring-primary/40' : ''}`}
              >
                <div className={`text-xs w-6 h-6 rounded-full flex items-center justify-center font-medium ${
                  isToday ? 'bg-primary text-black font-bold' : 'text-white/70'
                }`}>
                  {cell.day}
                </div>
                {dayEvents.slice(0, 2).map(ev => (
                  <div key={ev.id} className="text-[10px] px-1 rounded truncate leading-4 text-black font-medium"
                    style={{ background: ev.color }}>
                    {ev.title}
                  </div>
                ))}
                {dayEvents.length > 2 && <div className="text-[10px] text-white/30">+{dayEvents.length - 2}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar — Event detail / add */}
      <div className="w-56 flex-shrink-0 border-l border-white/10 bg-panel flex flex-col p-4 gap-4">
        {selectedDate ? (
          <>
            <div>
              <div className="text-xs text-white/40 mb-0.5">Selected</div>
              <div className="text-sm font-semibold">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString([], { weekday: 'short', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {/* Events for day */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {selectedEvents.length === 0 ? (
                <div className="text-xs text-white/30">No events</div>
              ) : selectedEvents.map(ev => (
                <div key={ev.id} className="flex items-start gap-2 p-2 rounded-lg bg-white/5 group">
                  <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: ev.color }} />
                  <span className="text-xs text-white/80 flex-1">{ev.title}</span>
                  <button onClick={() => deleteEvent(ev.id)} className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all text-xs">✕</button>
                </div>
              ))}
            </div>

            {/* Add event */}
            <div className="space-y-2 border-t border-white/10 pt-3">
              <div className="text-xs font-semibold text-white/50">Add Event</div>
              <input
                type="text" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addEvent()}
                placeholder="Event title…"
                className="w-full bg-white/8 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/25 outline-none focus:border-primary/50"
              />
              <div className="flex gap-1.5">
                {EVENT_COLORS.map(c => (
                  <button key={c} onClick={() => setNewEventColor(c)}
                    className={`w-5 h-5 rounded-full transition-transform ${newEventColor === c ? 'scale-125 ring-2 ring-white/40' : 'hover:scale-110'}`}
                    style={{ background: c }} />
                ))}
              </div>
              <button onClick={addEvent}
                className="w-full py-1.5 rounded-lg bg-primary text-black text-xs font-semibold hover:brightness-110 transition-all">
                Add Event
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white/20 text-center gap-2">
            <span className="text-4xl">📅</span>
            <span className="text-xs">Click a day to view or add events</span>
          </div>
        )}
      </div>
    </div>
  );
};
