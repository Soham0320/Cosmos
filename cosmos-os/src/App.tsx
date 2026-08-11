import { useEffect } from 'react';
import { useSettingsStore } from './store/settingsStore';
import Desktop from './components/Desktop';

function App() {
  const { theme, accentColor } = useSettingsStore();

  // Apply theme class and accent CSS variable to root
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.setProperty('--color-primary', accentColor);
    if (theme === 'light') {
      root.classList.add('theme-light');
    } else {
      root.classList.remove('theme-light');
    }
  }, [theme, accentColor]);

  return (
    <div className="w-screen h-screen overflow-hidden">
      <Desktop />
    </div>
  );
}

export default App;
