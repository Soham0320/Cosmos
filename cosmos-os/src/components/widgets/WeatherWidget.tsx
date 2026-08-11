import React, { useState, useEffect, useCallback } from 'react';

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  city: string;
  forecast: { day: string; high: number; low: number; icon: string }[];
}

// Simulated weather — cycles through conditions
const WEATHER_CONDITIONS = [
  { condition: 'Clear Sky', icon: '☀️', tempBase: 28 },
  { condition: 'Partly Cloudy', icon: '⛅', tempBase: 25 },
  { condition: 'Cloudy', icon: '☁️', tempBase: 22 },
  { condition: 'Light Rain', icon: '🌧️', tempBase: 20 },
  { condition: 'Thunderstorm', icon: '⛈️', tempBase: 18 },
  { condition: 'Sunny', icon: '🌤️', tempBase: 30 },
];

const FORECAST_ICONS = ['☀️', '⛅', '🌧️', '🌤️', '☁️'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];

function getSimulatedWeather(): WeatherData {
  const hour = new Date().getHours();
  const conditionIdx = Math.floor(hour / 4) % WEATHER_CONDITIONS.length;
  const w = WEATHER_CONDITIONS[conditionIdx];
  const tempVariation = Math.sin(hour * Math.PI / 12) * 5;

  return {
    temp: Math.round(w.tempBase + tempVariation),
    condition: w.condition,
    icon: w.icon,
    humidity: 40 + Math.floor(Math.random() * 35),
    windSpeed: 5 + Math.floor(Math.random() * 20),
    feelsLike: Math.round(w.tempBase + tempVariation - 2),
    city: 'Cosmos City',
    forecast: DAY_NAMES.map((day, i) => ({
      day,
      high: Math.round(w.tempBase + 2 + i - Math.random() * 3),
      low: Math.round(w.tempBase - 5 + i - Math.random() * 3),
      icon: FORECAST_ICONS[(conditionIdx + i) % FORECAST_ICONS.length],
    })),
  };
}

export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData>(getSimulatedWeather);

  useEffect(() => {
    // Refresh every 10 minutes
    const timer = setInterval(() => {
      setWeather(getSimulatedWeather());
    }, 600000);
    return () => clearInterval(timer);
  }, []);

  // Determine background gradient based on condition
  const getBgGradient = () => {
    if (weather.condition.includes('Clear') || weather.condition.includes('Sunny')) {
      return 'linear-gradient(135deg, rgba(255,170,50,0.15), rgba(255,100,50,0.05))';
    }
    if (weather.condition.includes('Rain') || weather.condition.includes('Thunder')) {
      return 'linear-gradient(135deg, rgba(100,150,255,0.15), rgba(50,80,150,0.05))';
    }
    return 'linear-gradient(135deg, rgba(150,180,220,0.1), rgba(100,130,180,0.05))';
  };

  return (
    <div
      className="w-full h-full flex flex-col p-3 select-none gap-2"
      style={{ background: getBgGradient() }}
    >
      {/* Main weather */}
      <div className="flex items-center gap-3">
        <div className="text-4xl" style={{ filter: 'drop-shadow(0 2px 8px rgba(255,200,50,0.3))' }}>
          {weather.icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-white leading-none">{weather.temp}°C</div>
          <div className="text-[10px] text-white/40 mt-0.5">{weather.condition}</div>
        </div>
      </div>

      {/* Details row */}
      <div className="flex gap-3 text-[10px] text-white/35">
        <span>💧 {weather.humidity}%</span>
        <span>💨 {weather.windSpeed} km/h</span>
        <span>🌡️ {weather.feelsLike}°</span>
      </div>

      {/* Location */}
      <div className="text-[9px] text-white/20 flex items-center gap-1">
        <span>📍</span>
        <span>{weather.city}</span>
      </div>

      {/* 5-day forecast */}
      <div className="flex gap-1 mt-auto border-t border-white/5 pt-2">
        {weather.forecast.map((f, i) => (
          <div key={i} className="flex-1 text-center">
            <div className="text-[8px] text-white/25">{f.day}</div>
            <div className="text-sm my-0.5">{f.icon}</div>
            <div className="text-[8px] text-white/40">
              <span className="text-white/60">{f.high}°</span>
              <span className="text-white/20 ml-0.5">{f.low}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
