import React, { useState, useEffect, useRef } from 'react';

export const ClockWidget: React.FC = () => {
  const [now, setNow] = useState(new Date());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Draw analog clock
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 8;

    ctx.clearRect(0, 0, size, size);

    // Clock face
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Hour markers
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6 - Math.PI / 2;
      const isMainHour = i % 3 === 0;
      const len = isMainHour ? 8 : 4;
      const outerR = radius - 2;
      const innerR = outerR - len;

      ctx.beginPath();
      ctx.moveTo(center + Math.cos(angle) * outerR, center + Math.sin(angle) * outerR);
      ctx.lineTo(center + Math.cos(angle) * innerR, center + Math.sin(angle) * innerR);
      ctx.strokeStyle = isMainHour ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)';
      ctx.lineWidth = isMainHour ? 2 : 1;
      ctx.stroke();
    }

    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Hour hand
    const hourAngle = ((hours + minutes / 60) * Math.PI) / 6 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(center + Math.cos(hourAngle) * (radius * 0.5), center + Math.sin(hourAngle) * (radius * 0.5));
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Minute hand
    const minAngle = ((minutes + seconds / 60) * Math.PI) / 30 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(center + Math.cos(minAngle) * (radius * 0.7), center + Math.sin(minAngle) * (radius * 0.7));
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Second hand
    const secAngle = (seconds * Math.PI) / 30 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(center + Math.cos(secAngle) * (radius * 0.75), center + Math.sin(secAngle) * (radius * 0.75));
    ctx.strokeStyle = 'var(--color-primary, #00e5ff)';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(center, center, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'var(--color-primary, #00e5ff)';
    ctx.fill();

  }, [now]);

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-3 select-none gap-2">
      <canvas
        ref={canvasRef}
        width={120}
        height={120}
        style={{ width: 120, height: 120 }}
      />
      <div className="text-center">
        <div className="text-lg font-bold text-white tracking-wide font-mono">{formatTime(now)}</div>
        <div className="text-[10px] text-white/30 mt-0.5">{formatDate(now)}</div>
      </div>
    </div>
  );
};
