import React, { useState } from 'react';
import { useSettingsStore, defaultWallpapers, ACCENT_COLORS } from '../store/settingsStore';

type Tab = 'wallpaper' | 'appearance' | 'account';

export const Settings: React.FC = () => {
  const {
    wallpaper, setWallpaper,
    theme, setTheme,
    accentColor, setAccentColor,
    username, setUsername,
  } = useSettingsStore();

  const [tab, setTab] = useState<Tab>('wallpaper');
  const [nameInput, setNameInput] = useState(username);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'wallpaper',   label: 'Wallpaper',   icon: '🖼️' },
    { id: 'appearance',  label: 'Appearance',   icon: '🎨' },
    { id: 'account',     label: 'Account',      icon: '👤' },
  ];

  return (
    <div className="w-full h-full flex bg-background text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-48 flex-shrink-0 border-r border-panel-border bg-panel flex flex-col py-4 gap-1 px-2">
        <div className="text-xs font-semibold text-white/30 uppercase tracking-wider px-3 mb-2">Settings</div>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
              tab === t.id ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/8 hover:text-white'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* ── Wallpaper ── */}
        {tab === 'wallpaper' && (
          <div>
            <h2 className="text-xl font-semibold mb-1">Wallpaper</h2>
            <p className="text-sm text-white/40 mb-5">Choose a background for your desktop.</p>
            <div className="grid grid-cols-3 gap-3">
              {defaultWallpapers.map(wp => (
                <div
                  key={wp.id}
                  onClick={() => setWallpaper(wp.id)}
                  className={`relative rounded-xl cursor-pointer border-2 overflow-hidden group transition-all ${
                    wallpaper === wp.id
                      ? 'border-primary shadow-[0_0_16px_rgba(0,229,255,0.4)]'
                      : 'border-transparent hover:border-white/30'
                  }`}
                >
                  <img src={wp.thumbnail} alt={wp.name} className="w-full h-24 object-cover block transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-1.5 left-2.5 text-xs font-medium text-white drop-shadow">{wp.name}</span>
                  {wallpaper === wp.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-black text-xs font-bold">✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Appearance ── */}
        {tab === 'appearance' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-1">Appearance</h2>
              <p className="text-sm text-white/40 mb-5">Customize how Cosmos OS looks.</p>
            </div>

            {/* Theme */}
            <div>
              <h3 className="text-sm font-semibold text-white/70 mb-3">Theme</h3>
              <div className="flex gap-3">
                {(['dark', 'light'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`flex-1 py-4 rounded-xl border-2 text-sm font-medium transition-all flex flex-col items-center gap-2 ${
                      theme === t ? 'border-primary bg-primary/10 text-white' : 'border-white/10 text-white/50 hover:border-white/20'
                    }`}
                  >
                    <span className="text-2xl">{t === 'dark' ? '🌙' : '☀️'}</span>
                    <span className="capitalize">{t}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color */}
            <div>
              <h3 className="text-sm font-semibold text-white/70 mb-3">Accent Color</h3>
              <div className="flex gap-3 flex-wrap">
                {ACCENT_COLORS.map(ac => (
                  <button
                    key={ac.id}
                    onClick={() => setAccentColor(ac.value)}
                    title={ac.label}
                    className={`w-10 h-10 rounded-full transition-all border-2 ${
                      accentColor === ac.value ? 'scale-110 border-white' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ background: ac.value, boxShadow: accentColor === ac.value ? `0 0 12px ${ac.value}88` : 'none' }}
                  />
                ))}
              </div>
              <p className="text-xs text-white/30 mt-2">Selected: {ACCENT_COLORS.find(a => a.value === accentColor)?.label ?? 'Custom'}</p>
            </div>
          </div>
        )}

        {/* ── Account ── */}
        {tab === 'account' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Account</h2>
              <p className="text-sm text-white/40 mb-5">Your user preferences.</p>
            </div>

            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-4xl">
                👤
              </div>
              <div>
                <div className="text-lg font-semibold">{username || 'User'}</div>
                <div className="text-sm text-white/40">Local Account</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Display Name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary/50 transition-colors"
                  placeholder="Enter your name"
                  maxLength={32}
                />
                <button
                  onClick={() => setUsername(nameInput.trim() || 'user')}
                  className="px-4 py-2.5 rounded-xl bg-primary text-black text-sm font-semibold hover:brightness-110 transition-all"
                >
                  Save
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <div className="text-sm font-medium text-white/70 mb-2">System Info</div>
              <div className="space-y-1.5 text-sm text-white/40">
                <div className="flex justify-between"><span>OS</span><span>Cosmos OS v1.0.0</span></div>
                <div className="flex justify-between"><span>Build</span><span>2026.08</span></div>
                <div className="flex justify-between"><span>Engine</span><span>Vite + React 18</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
