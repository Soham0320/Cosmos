import React, { useState, useRef, KeyboardEvent } from 'react';

// ─── Built-in "Sites" ────────────────────────────────────────────────────────


const CosmosHome: React.FC = () => {
  const [q, setQ] = useState('');
  const doSearch = () => {
    if (q.trim()) window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank');
  };
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-8 bg-[#0a0a0a] text-white px-8">
      <div className="text-center">
        <div className="text-6xl mb-3">🌌</div>
        <h1 className="text-3xl font-bold text-primary tracking-wide">Cosmos Browser</h1>
        <p className="text-white/40 text-sm mt-1">Your gateway to the web</p>
      </div>
      <div className="w-full max-w-lg flex gap-2">
        <input
          autoFocus type="text" value={q} onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doSearch()}
          placeholder="Search Google or enter URL…"
          className="flex-1 bg-white/8 border border-white/15 rounded-2xl px-5 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-primary/50 transition-colors"
        />
        <button onClick={doSearch} className="px-5 py-3 rounded-2xl bg-primary text-black font-semibold text-sm hover:brightness-110 transition-all">
          Search
        </button>
      </div>
      <div className="grid grid-cols-4 gap-4 w-full max-w-lg">
        {[
          { icon: '🌍', label: 'Google',    url: 'https://google.com' },
          { icon: '📰', label: 'Wikipedia', url: 'https://en.wikipedia.org' },
          { icon: '🐙', label: 'GitHub',    url: 'https://github.com' },
          { icon: '🎥', label: 'YouTube',   url: 'https://youtube.com' },
        ].map(s => (
          <a key={s.label} href={s.url} target="_blank" rel="noreferrer"
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-white/70 hover:text-white">
            <span className="text-3xl">{s.icon}</span>
            <span className="text-xs">{s.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

// Blocked-site fallback
const BlockedPage: React.FC<{ url: string; onRetry: () => void }> = ({ url, onRetry }) => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-[#0a0a0a] text-white/50">
    <span className="text-5xl">🔒</span>
    <div className="text-center max-w-sm">
      <p className="font-semibold text-white/70 mb-1">This page can't be displayed</p>
      <p className="text-sm text-white/40 break-all">{url}</p>
      <p className="text-xs text-white/30 mt-2">The site refused to connect (X-Frame-Options). You can open it in a new tab instead.</p>
    </div>
    <div className="flex gap-3">
      <button onClick={onRetry} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm text-white/80 transition-colors">Try again</button>
      <a href={url} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-primary text-black text-sm font-semibold hover:brightness-110 transition-all">
        Open in new tab
      </a>
    </div>
  </div>
);

// ─── Browser Component ────────────────────────────────────────────────────────

interface Tab {
  id: string;
  title: string;
  url: string;
}

const makeTab = (url = 'cosmos://home'): Tab => ({
  id: `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  title: url === 'cosmos://home' ? 'New Tab' : url,
  url,
});

export const Browser: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([makeTab()]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [urlInputs, setUrlInputs] = useState<Record<string, string>>({ [tabs[0].id]: '' });
  const [blocked, setBlocked] = useState<Record<string, boolean>>({});
  const [loadKey, setLoadKey] = useState<Record<string, number>>({});
  const iframeRefs = useRef<Record<string, HTMLIFrameElement | null>>({});

  const activeTab = tabs.find(t => t.id === activeTabId) ?? tabs[0];
  const activeUrl = activeTab.url;
  const isHome = activeUrl === 'cosmos://home';
  const isBlocked = blocked[activeTabId];

  const navigate = (rawUrl: string, tabId = activeTabId) => {
    let url = rawUrl.trim();
    if (!url || url === 'cosmos://home') { setTabUrl(tabId, 'cosmos://home'); return; }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = url.includes('.') ? `https://${url}` : `https://www.google.com/search?q=${encodeURIComponent(url)}`;
    }
    setTabUrl(tabId, url);
  };

  const setTabUrl = (tabId: string, url: string) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, url, title: url === 'cosmos://home' ? 'New Tab' : new URL(url.startsWith('http') ? url : `https://${url}`).hostname } : t));
    setUrlInputs(prev => ({ ...prev, [tabId]: url === 'cosmos://home' ? '' : url }));
    setBlocked(prev => ({ ...prev, [tabId]: false }));
    setLoadKey(prev => ({ ...prev, [tabId]: (prev[tabId] ?? 0) + 1 }));
  };

  const addTab = () => {
    const t = makeTab();
    setTabs(prev => [...prev, t]);
    setActiveTabId(t.id);
    setUrlInputs(prev => ({ ...prev, [t.id]: '' }));
  };

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTabs(prev => {
      const remaining = prev.filter(t => t.id !== tabId);
      if (remaining.length === 0) { const fresh = makeTab(); return [fresh]; }
      if (activeTabId === tabId) setActiveTabId(remaining[remaining.length - 1].id);
      return remaining;
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') navigate(urlInputs[activeTabId] ?? '');
    if (e.key === 'Escape') setUrlInputs(prev => ({ ...prev, [activeTabId]: activeUrl === 'cosmos://home' ? '' : activeUrl }));
  };

  const refresh = () => {
    setBlocked(prev => ({ ...prev, [activeTabId]: false }));
    setLoadKey(prev => ({ ...prev, [activeTabId]: (prev[activeTabId] ?? 0) + 1 }));
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0e0e0e]">
      {/* Tab bar */}
      <div className="flex items-end gap-0.5 px-2 pt-1.5 bg-[#141414] border-b border-white/8 flex-shrink-0 overflow-x-auto">
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs min-w-[100px] max-w-[160px] cursor-pointer flex-shrink-0 transition-colors ${
              tab.id === activeTabId ? 'bg-[#0e0e0e] text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            }`}
          >
            <span className="truncate flex-1">{tab.title}</span>
            <button
              onClick={e => closeTab(tab.id, e)}
              className="w-4 h-4 rounded flex items-center justify-center hover:bg-white/20 text-white/40 hover:text-white flex-shrink-0"
            >✕</button>
          </div>
        ))}
        <button onClick={addTab} className="px-2 py-1.5 text-white/40 hover:text-white transition-colors text-sm flex-shrink-0" title="New Tab">+</button>
      </div>

      {/* Toolbar */}
      <div className="flex gap-2 items-center px-3 py-2 bg-[#0e0e0e] border-b border-white/8 flex-shrink-0">
        <button
          onClick={() => setTabUrl(activeTabId, 'cosmos://home')}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          title="Home"
        >🏠</button>
        <button
          onClick={refresh}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          title="Refresh"
        >↻</button>
        <div className="flex-1 flex items-center gap-2 bg-white/8 px-3 py-1.5 rounded-full border border-white/10 focus-within:border-primary/50 transition-colors">
          <span className="text-white/30 text-xs flex-shrink-0">🔒</span>
          <input
            type="text"
            value={urlInputs[activeTabId] ?? (isHome ? '' : activeUrl)}
            onChange={e => setUrlInputs(prev => ({ ...prev, [activeTabId]: e.target.value }))}
            onKeyDown={handleKeyDown}
            placeholder="Search or enter address"
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/25"
            spellCheck={false}
          />
          <button
            onClick={() => navigate(urlInputs[activeTabId] ?? '')}
            className="text-white/30 hover:text-primary text-xs flex-shrink-0 transition-colors"
          >Go</button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {isHome ? (
          <CosmosHome />
        ) : isBlocked ? (
          <BlockedPage url={activeUrl} onRetry={refresh} />
        ) : (
          <iframe
            key={`${activeTabId}-${loadKey[activeTabId] ?? 0}`}
            ref={el => { iframeRefs.current[activeTabId] = el; }}
            src={activeUrl}
            className="w-full h-full border-0"
            title="browser-content"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onError={() => setBlocked(prev => ({ ...prev, [activeTabId]: true }))}
          />
        )}
      </div>
    </div>
  );
};
