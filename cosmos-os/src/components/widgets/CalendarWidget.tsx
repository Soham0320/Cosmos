import React, { useState, useEffect } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const CalendarWidget: React.FC = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Update every minute for date changes at midnight
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();
  const dayOfWeek = now.getDay();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length < 42) cells.push(null);

  return (
    <div className="w-full h-full flex flex-col p-3 select-none">
      {/* Header */}
      <div className="text-center mb-2">
        <div className="text-[10px] text-white/30 uppercase tracking-widest">{DAYS[dayOfWeek]}</div>
        <div className="text-2xl font-bold text-primary leading-none mt-0.5">{date}</div>
        <div className="text-xs text-white/50 mt-0.5">{MONTHS[month]} {year}</div>
      </div>

      {/* Mini calendar */}
      <div className="grid grid-cols-7 gap-0 flex-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[8px] text-white/20 font-medium py-0.5">
            {d[0]}
          </div>
        ))}
        {cells.map((day, i) => (
          <div
            key={i}
            className={`text-center text-[9px] py-[2px] rounded-sm transition-colors ${
              day === date
                ? 'bg-primary text-black font-bold'
                : day
                ? 'text-white/50 hover:bg-white/5'
                : ''
            }`}
          >
            {day || ''}
          </div>
        ))}
      </div>
    </div>
  );
};
