import React, { useState, useEffect, useRef } from 'react';

interface Track {
  title: string;
  artist: string;
  url: string;
  color: string;
  emoji: string;
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
];

export const MusicPlayer: React.FC = () => {
  const [trackIdx, setTrackIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const track = TRACKS[trackIdx];

  // Sync volume state to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Sync play/pause state
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

  // Set up Visualizer
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
        console.warn('Web Audio API Visualizer Setup failed (likely CORS or browser policy):', err);
      }
    };

    if (playing) {
      setupWebAudio();
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
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
          // CORS/AudioContext Fallback: Simulate active sound frequency waves
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

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [playing, trackIdx]);

  const togglePlay = () => {
    setPlaying(!playing);
  };

  const handleNext = () => {
    setTrackIdx(prev => (prev + 1) % TRACKS.length);
  };

  const handlePrev = () => {
    setTrackIdx(prev => (prev - 1 + TRACKS.length) % TRACKS.length);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    audioRef.current.currentTime = pct * duration;
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const vol = Math.max(0, Math.min(1, x / rect.width));
    setVolume(vol);
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
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  return (
    <div className="w-full h-full bg-[#0a0a0a] text-white flex flex-col overflow-hidden">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={track.url}
        crossOrigin="anonymous"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleNext}
      />

      {/* Top section with album art and controls */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4 relative">
        {/* Visualizer canvas background */}
        <canvas
          ref={canvasRef}
          width={400}
          height={120}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-40 pointer-events-none"
          style={{ width: '100%', maxWidth: 420 }}
        />

        {/* Album Art - spinning disc */}
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
            {/* Inner ring */}
            <div className="w-20 h-20 rounded-full bg-[#0a0a0a] border-2 border-white/10 flex items-center justify-center relative z-10">
              <div className="w-4 h-4 rounded-full" style={{ background: track.color, boxShadow: `0 0 12px ${track.color}` }} />
            </div>
            {/* Grooves */}
            <div className="absolute inset-4 rounded-full border border-white/5" />
            <div className="absolute inset-8 rounded-full border border-white/5" />
            <div className="absolute inset-12 rounded-full border border-white/5" />
          </div>

          {/* Floating emoji */}
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
          <h2 className="text-lg font-bold" style={{ color: track.color }}>{track.title}</h2>
          <p className="text-white/40 text-xs mt-0.5">{track.artist}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 z-10">
          <button
            id="music-shuffle"
            className="text-white/30 hover:text-white/70 transition-colors text-sm"
            title="Shuffle"
          >🔀</button>
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
          <button
            id="music-repeat"
            className="text-white/30 hover:text-white/70 transition-colors text-sm"
            title="Repeat"
          >🔁</button>
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
          <div
            className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer relative group"
            onClick={handleVolumeChange}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${volume * 100}%`,
                background: `linear-gradient(90deg, ${track.color}66, ${track.color})`,
              }}
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

      {/* Track list */}
      <div className="border-t border-white/5 bg-[#070707] max-h-[200px] overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-semibold text-white/25 uppercase tracking-widest">Queue</div>
        {TRACKS.map((t, i) => (
          <div
            key={t.title}
            onClick={() => {
              setTrackIdx(i);
              setPlaying(true);
            }}
            className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all ${
              i === trackIdx
                ? 'bg-white/5'
                : 'hover:bg-white/[0.03]'
            }`}
          >
            {/* Track number / playing indicator */}
            <div className="w-6 text-center">
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

            <span className="text-lg">{t.emoji}</span>

            <div className="flex-1 min-w-0">
              <div
                className={`text-sm font-medium truncate ${i === trackIdx ? '' : 'text-white/70'}`}
                style={i === trackIdx ? { color: t.color } : {}}
              >
                {t.title}
              </div>
              <div className="text-[11px] text-white/30 truncate">{t.artist}</div>
            </div>

            {/* Duration */}
            <span className="text-[10px] text-white/20 font-mono">3:30</span>
          </div>
        ))}
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
