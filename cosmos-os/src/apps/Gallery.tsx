import React, { useState } from 'react';

const IMAGES = [
  { id: 1, thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop', full: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop', title: 'Abstract' },
  { id: 2, thumb: 'https://images.unsplash.com/photo-1506744032114-7385507925db?q=80&w=400&auto=format&fit=crop', full: 'https://images.unsplash.com/photo-1506744032114-7385507925db?q=80&w=1600&auto=format&fit=crop', title: 'Mountains' },
  { id: 3, thumb: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop', full: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop', title: 'Ocean' },
  { id: 4, thumb: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=400&auto=format&fit=crop', full: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop', title: 'Space' },
  { id: 5, thumb: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=400&auto=format&fit=crop', full: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=1600&auto=format&fit=crop', title: 'Forest' },
  { id: 6, thumb: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=400&auto=format&fit=crop', full: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop', title: 'Snowy Peak' },
];

export const Gallery: React.FC = () => {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const openLightbox = (idx: number) => setLightboxIdx(idx);
  const closeLightbox = () => setLightboxIdx(null);

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIdx(i => i !== null ? (i - 1 + IMAGES.length) % IMAGES.length : null);
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIdx(i => i !== null ? (i + 1) % IMAGES.length : null);
  };

  return (
    <div className="w-full h-full bg-background text-white p-4 overflow-y-auto relative">
      <div className="grid grid-cols-3 gap-3">
        {IMAGES.map((img, idx) => (
          <div
            key={img.id}
            onClick={() => openLightbox(idx)}
            className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
          >
            <img
              src={img.thumb}
              alt={img.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-2">
              <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity drop-shadow">{img.title}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="absolute inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm z-10 transition-colors"
            title="Close"
          >✕</button>
          <button
            onClick={prev}
            className="absolute left-3 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl transition-colors"
            title="Previous"
          >‹</button>
          <img
            src={IMAGES[lightboxIdx].full}
            alt={IMAGES[lightboxIdx].title}
            className="max-w-[90%] max-h-[85%] object-contain rounded-xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={next}
            className="absolute right-3 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl transition-colors"
            title="Next"
          >›</button>
          <div className="absolute bottom-3 text-white/50 text-sm">
            {IMAGES[lightboxIdx].title} — {lightboxIdx + 1} / {IMAGES.length}
          </div>
        </div>
      )}
    </div>
  );
};
