import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface HistoryEntry {
  type: 'input' | 'output' | 'error';
  text: string;
}

const HELP_TEXT = `Available commands:
  help       — show this list
  clear      — clear terminal
  echo [msg] — print message
  date       — current date and time
  ls         — list files
  whoami     — current user
  version    — OS version
  calc [exp] — evaluate math (e.g. calc 2+2)
  pwd        — print working directory`;

const FS: Record<string, string[]> = {
  '/': ['Documents', 'Downloads', 'Pictures', 'Desktop'],
  '/Documents': ['readme.txt', 'notes.md'],
  '/Downloads': ['setup.exe'],
  '/Pictures': ['wallpaper.jpg'],
  '/Desktop': ['trash'],
};

export const Terminal: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { type: 'output', text: 'Cosmos OS Terminal v1.0.0' },
    { type: 'output', text: 'Type "help" for a list of commands.' },
  ]);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState('/');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const pushOutput = (text: string, type: HistoryEntry['type'] = 'output') => {
    setHistory(h => [...h, { type, text }]);
  };

  const runCommand = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    setHistory(h => [...h, { type: 'input', text: `${cwd === '/' ? '~' : cwd}$ ${trimmed}` }]);
    setCmdHistory(h => [trimmed, ...h]);
    setHistIdx(-1);

    const [cmd, ...args] = trimmed.split(' ');

    switch (cmd.toLowerCase()) {
      case 'help':
        pushOutput(HELP_TEXT);
        break;
      case 'clear':
        setHistory([]);
        break;
      case 'echo':
        pushOutput(args.join(' ') || '');
        break;
      case 'date':
        pushOutput(new Date().toString());
        break;
      case 'whoami':
        pushOutput('user');
        break;
      case 'pwd':
        pushOutput(cwd);
        break;
      case 'version':
        pushOutput('Cosmos OS v1.0.0 (build 2026.08)');
        break;
      case 'ls': {
        const dir = args[0] ? (args[0].startsWith('/') ? args[0] : `${cwd === '/' ? '' : cwd}/${args[0]}`) : cwd;
        const entries = FS[dir];
        if (entries) pushOutput(entries.join('  '));
        else pushOutput(`ls: ${args[0] || cwd}: No such directory`, 'error');
        break;
      }
      case 'cd': {
        if (!args[0] || args[0] === '~') { setCwd('/'); break; }
        const target = args[0].startsWith('/') ? args[0] : `${cwd === '/' ? '' : cwd}/${args[0]}`;
        if (FS[target] !== undefined) setCwd(target);
        else pushOutput(`cd: ${args[0]}: No such directory`, 'error');
        break;
      }
      case 'calc': {
        try {
          // safe eval for simple math
          const expr = args.join('').replace(/[^0-9+\-*/.()%]/g, '');
          // eslint-disable-next-line no-new-func
          const result = new Function(`return ${expr}`)();
          pushOutput(String(result));
        } catch {
          pushOutput('calc: invalid expression', 'error');
        }
        break;
      }
      default:
        pushOutput(`${cmd}: command not found. Type "help" for available commands.`, 'error');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      runCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(next);
      setInput(cmdHistory[next] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setInput(next === -1 ? '' : cmdHistory[next] ?? '');
    }
  };

  return (
    <div
      className="w-full h-full bg-black text-[#00e5ff] font-mono text-sm p-4 overflow-y-auto flex flex-col"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex-1">
        {history.map((entry, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap mb-0.5 leading-5 ${
              entry.type === 'input' ? 'text-white' :
              entry.type === 'error' ? 'text-red-400' :
              'text-[#00e5ff]'
            }`}
          >
            {entry.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-1">
        <span className="text-white select-none">{cwd === '/' ? '~' : cwd}$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none caret-[#00e5ff]"
          autoFocus
          spellCheck={false}
        />
      </div>
      <div ref={bottomRef} />
    </div>
  );
};
