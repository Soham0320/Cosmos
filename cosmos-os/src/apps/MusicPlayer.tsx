import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Track {
  title: string;
  artist: string;
  url: string;
  color: string;
  emoji: string;
  isUserFile?: boolean;
  blobUrl?: string;
}

const TRACKS: Track[] = [
  {
    title: 'Starlight Sonata',
    artist: 'SoundHelix Orchestra',
    url: '/music/song1.mp3',
    color: '#00e5ff',
    emoji: '🎵',
  },
  {
    title: 'Nebula Dreams',
    artist: 'Astral Beats',
    url: '/music/song2.mp3',
    color: '#b388ff',
    emoji: '🌌',
  },
  {
    title: 'Aurora Waves',
    artist: 'Polar Sounds',
    url: '/music/song3.mp3',
    color: '#69f0ae',
    emoji: '🌠',
  },
  {
    title: 'EYE OF THE TIGER',
    artist: 'SURVIVOR',
    url: '/music/song4.mp3',
    color: '#ff9800',
    emoji: '🐅',
  },
];

const USER_COLORS = ['#f472b6', '#34d399', '#60a5fa', '#fbbf24', '#a78bfa', '#fb923c', '#38bdf8'];
const USER_EMOJIS = ['🎶', '🎸', '🥁', '🎹', '🎺', '🎻', '🪗'];

function parseAudioFileName(filename: string): { title: string; artist: string } {
  const base = filename.replace(/\.[^/.]+$/, '');
  const dashIdx = base.indexOf(' - ');
  if (dashIdx !== -1) {
    return { artist: base.slice(0, dashIdx).trim(), title: base.slice(dashIdx + 3).trim() };
  }
  return { title: base, artist: 'Unknown Artist' };
}

export const MusicPlayer: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>(TRACKS);
  const [trackIdx, setTrackIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const dragCounterRef = useRef(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobUrlsRef = useRef<string[]>([]);

  const track = tracks[trackIdx];

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Sync play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.play().catch(err => {
        console.warn('Autoplay prevented or audio error:', err);
        setPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [playing, trackIdx]);

  // Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    const setupWebAudio = () => {
      if (!audioRef.current || audioCtxRef.current) return;
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;
        const source = ctx.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(ctx.destination);
        sourceRef.current = source;
      } catch (err) {
        console.warn('Web Audio API setup failed:', err);
      }
    };

    if (playing) {
      setupWebAudio();
      if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
    }

    const bufferLength = analyserRef.current ? analyserRef.current.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);
    let simulatedWave = Array.from({ length: bufferLength }, () => 0);

    const draw = () => {
      if (!canvas) return;
      animFrameRef.current = requestAnimationFrame(draw);
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      if (playing) {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
        } else {
          for (let i = 0; i < bufferLength; i++) {
            simulatedWave[i] += (Math.random() - 0.5) * 20;
            simulatedWave[i] = Math.max(10, Math.min(220, simulatedWave[i] + (i % 2 === 0 ? 3 : -3)));
            dataArray[i] = simulatedWave[i];
          }
        }
      } else {
        dataArray.fill(0);
      }
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i] / 255;
        const barHeight = value * canvas.height * 0.95;
        const alpha = 0.2 + value * 0.8;
        ctx2d.fillStyle = track.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx2d.fillRect(x, canvas.height - barHeight, barWidth - 1.5, barHeight);
        x += barWidth;
      }
    };
    draw();
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [playing, trackIdx, track.color]);

  // ─── File loading logic ────────────────────────────────────────────────────

  const loadAudioFiles = useCallback((files: FileList | File[]) => {
    const audioFiles = Array.from(files).filter(f => f.type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|aac|m4a|opus)$/i.test(f.name));
    if (audioFiles.length === 0) return;

    const newTracks: Track[] = audioFiles.map((file, idx) => {
      const blobUrl = URL.createObjectURL(file);
      blobUrlsRef.current.push(blobUrl);
      const { title, artist } = parseAudioFileName(file.name);
      const colorIdx = (tracks.length + idx) % USER_COLORS.length;
      return {
        title,
        artist,
        url: blobUrl,
        blobUrl,
        color: USER_COLORS[colorIdx],
        emoji: USER_EMOJIS[colorIdx % USER_EMOJIS.length],
        isUserFile: true,
      };
    });

    setTracks(prev => {
      const combined = [...prev, ...newTracks];
      // Switch to first new track and start playing
      setTimeout(() => {
        setTrackIdx(prev.length);
        setPlaying(true);
      }, 50);
      return combined;
    });
  }, [tracks.length]);

  // ─── Drag and Drop handlers ────────────────────────────────────────────────

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDraggingOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    dragCounterRef.current = 0;
    loadAudioFiles(e.dataTransfer.files);
  }, [loadAudioFiles]);

  // ─── File input handler ────────────────────────────────────────────────────

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      loadAudioFiles(e.target.files);
      e.target.value = ''; // allow re-selecting same file
    }
  }, [loadAudioFiles]);

  // ─── Playback helpers ──────────────────────────────────────────────────────

  const togglePlay = () => setPlaying(p => !p);
  const handleNext = () => setTrackIdx(prev => (prev + 1) % tracks.length);
  const handlePrev = () => setTrackIdx(prev => (prev - 1 + tracks.length) % tracks.length);

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
    if (audioRef.current.duration) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const removeUserTrack = (idx: number) => {
    setTracks(prev => {
      const t = prev[idx];
      if (t.blobUrl) URL.revokeObjectURL(t.blobUrl);
      const next = prev.filter((_, i) => i !== idx);
      if (trackIdx >= next.length) setTrackIdx(Math.max(0, next.length - 1));
      else if (trackIdx === idx) setTrackIdx(Math.max(0, idx - 1));
      return next;
    });
  };

  return (
    <div
      className="w-full h-full bg-[#0a0a0a] text-white flex flex-col overflow-hidden relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={track.url}
        crossOrigin="anonymous"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleNext}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.ogg,.flac,.aac,.m4a,.opus"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* ── Drag-over overlay ── */}
      {isDraggingOver && (
        <div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 pointer-events-none"
          style={{
            background: `${track.color}18`,
            border: `2px dashed ${track.color}`,
            borderRadius: '0px',
          }}
        >
          <div
            className="text-6xl"
            style={{ filter: `drop-shadow(0 0 20px ${track.color})`, animation: 'bounce 1s ease-in-out infinite' }}
          >
            🎵
          </div>
          <div className="text-lg font-bold" style={{ color: track.color }}>
            Drop audio files to play
          </div>
          <div className="text-xs text-white/40">Supports MP3, WAV, OGG, FLAC, AAC, M4A</div>
        </div>
      )}

      {/* Top section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4 relative min-h-0">
        {/* Visualizer canvas */}
        <canvas
          ref={canvasRef}
          width={400}
          height={120}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-40 pointer-events-none"
          style={{ width: '100%', maxWidth: 420 }}
        />

        {/* Open File button — top right */}
        <button
          id="music-open-file"
          onClick={() => fileInputRef.current?.click()}
          title="Open audio file(s)"
          className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 active:scale-95"
          style={{
            background: `${track.color}22`,
            border: `1px solid ${track.color}44`,
            color: track.color,
          }}
        >
          <span>📂</span>
          <span>Open File</span>
        </button>

        {/* Drag hint — shown when no user tracks loaded */}
        {!tracks.some(t => t.isUserFile) && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1 text-[10px] text-white/20 pointer-events-none">
            <span>⬆</span>
            <span>Drag MP3 here</span>
          </div>
        )}

        {/* Album Art */}
        <div className="relative">
          <div
            className="w-40 h-40 rounded-full flex items-center justify-center border-4 border-white/5 transition-all duration-500 relative"
            style={{
              background: `conic-gradient(from 0deg, ${track.color}22, ${track.color}44, ${track.color}11, ${track.color}33, ${track.color}22)`,
              animation: playing ? 'spin 6s linear infinite' : 'none',
              boxShadow: playing
                ? `0 0 60px ${track.color}40, inset 0 0 30px ${track.color}20`
                : `0 0 20px ${track.color}15`,
            }}
          >
            <div className="w-20 h-20 rounded-full bg-[#0a0a0a] border-2 border-white/10 flex items-center justify-center relative z-10">
              <div className="w-4 h-4 rounded-full" style={{ background: track.color, boxShadow: `0 0 12px ${track.color}` }} />
            </div>
            <div className="absolute inset-4 rounded-full border border-white/5" />
            <div className="absolute inset-8 rounded-full border border-white/5" />
            <div className="absolute inset-12 rounded-full border border-white/5" />
          </div>
          <span
            className="absolute -top-2 -right-2 text-3xl"
            style={{
              animation: playing ? 'bounce 2s ease-in-out infinite' : 'none',
              filter: `drop-shadow(0 0 8px ${track.color})`,
            }}
          >
            {track.emoji}
          </span>
        </div>

        {/* Track info */}
        <div className="text-center z-10">
          <h2 className="text-lg font-bold truncate max-w-[260px]" style={{ color: track.color }}>{track.title}</h2>
          <p className="text-white/40 text-xs mt-0.5">{track.artist}</p>
          {track.isUserFile && (
            <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold"
              style={{ background: `${track.color}22`, color: track.color }}>
              Local File
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 z-10">
          <button id="music-shuffle" className="text-white/30 hover:text-white/70 transition-colors text-sm" title="Shuffle">🔀</button>
          <button
            id="music-prev"
            onClick={handlePrev}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-lg transition-all active:scale-90"
            title="Previous"
          >⏮</button>
          <button
            id="music-play-pause"
            onClick={togglePlay}
            className="w-14 h-14 rounded-full text-black text-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${track.color}, ${track.color}cc)`,
              boxShadow: `0 4px 24px ${track.color}50`,
            }}
            title={playing ? 'Pause' : 'Play'}
          >
            {playing ? '⏸' : '▶'}
          </button>
          <button
            id="music-next"
            onClick={handleNext}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-lg transition-all active:scale-90"
            title="Next"
          >⏭</button>
          <button id="music-repeat" className="text-white/30 hover:text-white/70 transition-colors text-sm" title="Repeat">🔁</button>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-sm z-10">
          <div
            className="w-full h-1 bg-white/10 rounded-full cursor-pointer relative group"
            onClick={seek}
            title="Seek"
          >
            <div
              className="h-full rounded-full transition-all duration-700 relative"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${track.color}88, ${track.color})`,
                boxShadow: `0 0 8px ${track.color}40`,
              }}
            >
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: track.color, boxShadow: `0 0 6px ${track.color}` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-white/25 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume control */}
        <div className="flex items-center gap-2 z-10 w-full max-w-[180px]">
          <span className="text-xs text-white/30">🔈</span>
          <div className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer relative group" onClick={handleVolumeChange}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${volume * 100}%`, background: `linear-gradient(90deg, ${track.color}66, ${track.color})` }}
            >
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: track.color }}
              />
            </div>
          </div>
          <span className="text-xs text-white/30">🔊</span>
        </div>
      </div>

      {/* Track list / Queue */}
      <div className="border-t border-white/5 bg-[#070707] max-h-[200px] overflow-y-auto flex-shrink-0">
        <div className="px-3 py-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-white/25 uppercase tracking-widest">Queue ({tracks.length})</span>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-[10px] text-white/30 hover:text-white/70 transition-colors flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/5"
            title="Add audio files"
          >
            <span>＋</span> Add files
          </button>
        </div>
        {tracks.map((t, i) => (
          <div
            key={`${t.url}-${i}`}
            onClick={() => { setTrackIdx(i); setPlaying(true); }}
            className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all group/item ${
              i === trackIdx ? 'bg-white/5' : 'hover:bg-white/[0.03]'
            }`}
          >
            {/* Playing indicator */}
            <div className="w-6 text-center flex-shrink-0">
              {i === trackIdx && playing ? (
                <div className="flex gap-[2px] items-end justify-center h-4">
                  {[1, 2, 3].map(b => (
                    <div
                      key={b}
                      className="w-[3px] rounded-full"
                      style={{
                        background: t.color,
                        animation: `equalizer ${0.4 + b * 0.15}s ease infinite alternate`,
                        height: `${30 + b * 20}%`,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <span className="text-[11px] text-white/20 font-mono">{i + 1}</span>
              )}
            </div>

            <span className="text-lg flex-shrink-0">{t.emoji}</span>

            <div className="flex-1 min-w-0">
              <div
                className={`text-sm font-medium truncate ${i === trackIdx ? '' : 'text-white/70'}`}
                style={i === trackIdx ? { color: t.color } : {}}
              >
                {t.title}
              </div>
              <div className="text-[11px] text-white/30 truncate flex items-center gap-1">
                {t.artist}
                {t.isUserFile && <span className="text-[9px] px-1 py-0 rounded" style={{ background: `${t.color}22`, color: t.color }}>local</span>}
              </div>
            </div>

            {/* Remove user track button */}
            {t.isUserFile && (
              <button
                onClick={e => { e.stopPropagation(); removeUserTrack(i); }}
                className="opacity-0 group-hover/item:opacity-100 transition-opacity text-white/30 hover:text-red-400 text-xs w-5 h-5 flex items-center justify-center rounded flex-shrink-0"
                title="Remove from queue"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        {/* Empty state drop hint in queue */}
        <div
          className="flex items-center justify-center gap-2 px-4 py-3 mx-3 mb-2 rounded-lg border border-dashed border-white/10 cursor-pointer hover:border-white/20 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="text-white/20 text-sm">🎵</span>
          <span className="text-[10px] text-white/20">Drop files here or click to add more songs…</span>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes equalizer {
          0% { height: 20%; }
          100% { height: 100%; }
        }
      `}</style>
    </div>
  );
};
