import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Window } from './Window';
import { useWindowStore } from '../../store/windowStore';

import { FileExplorer } from '../../apps/FileExplorer';
import { Settings }     from '../../apps/Settings';
import { Calculator }   from '../../apps/Calculator';
import { Notes }        from '../../apps/Notes';
import { MusicPlayer }  from '../../apps/MusicPlayer';
import { Terminal }     from '../../apps/Terminal';
import { Browser }      from '../../apps/Browser';
import { Gallery }      from '../../apps/Gallery';
import { CalendarApp }  from '../../apps/CalendarApp';
import { AIChatApp }    from '../../apps/AIChatApp';

const APP_COMPONENTS: Record<string, React.FC> = {
  'file-explorer': FileExplorer,
  'settings':      Settings,
  'calculator':    Calculator,
  'notes':         Notes,
  'music':         MusicPlayer,
  'terminal':      Terminal,
  'browser':       Browser,
  'gallery':       Gallery,
  'calendar':      CalendarApp,
  'aichat':        AIChatApp,
};

export const WindowManager: React.FC = () => {
  const { windows, activeWindowId } = useWindowStore();

  return (
    <AnimatePresence>
      {windows.map(win => {
        const AppComponent = APP_COMPONENTS[win.appId];
        if (!AppComponent) return null;
        const isActive = activeWindowId === win.id;

        return (
          <Window
            key={win.id}
            id={win.id}
            appId={win.appId}
            title={win.title}
            isActive={isActive}
            zIndex={win.zIndex}
            minimized={win.minimized}
          >
            <AppComponent />
          </Window>
        );
      })}
    </AnimatePresence>
  );
};
