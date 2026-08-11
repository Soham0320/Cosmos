import React, { useState, useRef, useEffect } from 'react';
import { useWindowStore } from '../store/windowStore';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export const AIChatApp: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'ai', text: 'Hello! I am COSMOS AI, your personal system assistant. I can open apps for you, answer questions about COSMOS OS, or just chat. How can I help?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { openWindow } = useWindowStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const processCommand = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    // Knowledge Base about COSMOS OS
    if (lowerInput.includes('what is cosmos') || lowerInput.includes('cosmos os')) {
      return "COSMOS OS is a modern, web-based simulated operating system built with React and Framer Motion. It features a beautiful glassmorphic UI, a window manager, widgets, and various apps like Terminal, File Explorer, Browser, Settings, and more!";
    }
    if (lowerInput.includes('who made') || lowerInput.includes('creator')) {
      return "COSMOS OS is built to showcase advanced web UI capabilities using React and modern CSS techniques.";
    }
    if (lowerInput.includes('features') || lowerInput.includes('what can you do')) {
      return "I can manage your COSMOS OS environment! I know about all the apps (Terminal, Browser, Settings, Music, Gallery, Notes, Calculator, Calendar). Just ask me to 'open [app name]'. I can also answer questions about the OS.";
    }
    
    // App Launching Commands
    const apps = [
      { id: 'file-explorer', names: ['file explorer', 'files', 'folder'] },
      { id: 'settings', names: ['settings', 'config', 'control panel'] },
      { id: 'terminal', names: ['terminal', 'console', 'command prompt'] },
      { id: 'browser', names: ['browser', 'internet', 'web', 'safari', 'chrome'] },
      { id: 'notes', names: ['notes', 'notepad', 'text editor'] },
      { id: 'music', names: ['music', 'player', 'songs', 'audio'] },
      { id: 'gallery', names: ['gallery', 'photos', 'images', 'pictures'] },
      { id: 'calculator', names: ['calculator', 'math'] },
      { id: 'calendar', names: ['calendar', 'date', 'events'] }
    ];

    if (lowerInput.startsWith('open ') || lowerInput.startsWith('launch ') || lowerInput.startsWith('start ')) {
      for (const app of apps) {
        if (app.names.some(name => lowerInput.includes(name))) {
          openWindow(app.id);
          return `I've opened the ${app.id.replace('-', ' ')} app for you.`;
        }
      }
      return "I couldn't find an app by that name. Try asking me to open Settings, Music, Terminal, or Browser.";
    }

    // General Responses
    if (lowerInput.includes('time')) return `The current time is ${new Date().toLocaleTimeString()}.`;
    if (lowerInput.includes('date')) return `Today is ${new Date().toLocaleDateString()}.`;
    if (lowerInput.includes('joke')) return "Why do programmers prefer dark mode? Because light attracts bugs!";
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) return 'Hello there! Need me to open an app or answer a question?';

    return "I'm still learning, but I'm here to help. Try asking me 'What is COSMOS OS?' or 'Open the Terminal'.";
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newUserMsg: Message = { id: Date.now().toString(), sender: 'user', text: inputValue.trim() };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking and responding
    setTimeout(() => {
      const responseText = processCommand(newUserMsg.text);
      const newAIMsg: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: responseText };
      setMessages(prev => [...prev, newAIMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 800);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#11131a] text-white font-sans p-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/10">
        <div className="text-3xl bg-white/5 p-2 rounded-2xl">🤖</div>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-[#3b82f6]">COSMOS AI</span>
          <span className="text-xs text-white/50">Personal OS Assistant</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar flex flex-col gap-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-md ${
                msg.sender === 'user' 
                  ? 'bg-[#3b82f6] rounded-br-sm text-white' 
                  : 'bg-white/10 rounded-bl-sm text-white/90 border border-white/5'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-bl-sm border border-white/5 flex gap-1.5 items-center">
              <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="pt-4 mt-4 border-t border-white/10 flex gap-2">
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="Ask me to open an app or tell a joke..." 
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:bg-white/10 focus:border-white/20 transition-all shadow-inner"
        />
        <button 
          onClick={handleSend}
          disabled={!inputValue.trim()}
          className="w-12 flex flex-shrink-0 items-center justify-center bg-[#3b82f6]/90 hover:bg-[#3b82f6] disabled:opacity-50 disabled:hover:bg-[#3b82f6]/90 rounded-xl transition-colors text-white shadow-lg text-lg"
        >
          ➤
        </button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  );
};
