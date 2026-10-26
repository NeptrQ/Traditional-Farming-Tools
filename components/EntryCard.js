'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function EntryCard({ entry, index, onSelect, currentUser, onDelete, onEdit, showStatus = false }) {
  const [imgError, setImgError] = useState(false);
  const photoUrl = entry.photo_url || entry.image_url || entry.photo;

  const handleClick = (e) => {
    if (onSelect) {
      e.preventDefault();
      onSelect(entry);
    }
  };

  const isOwner = currentUser && entry.owner === currentUser.id;

  return (
    <div onClick={handleClick} className="group block h-full cursor-pointer">
      <div className="h-full rounded-2xl p-5 flex flex-col bg-gradient-to-b from-[#181411] to-[#120F0D] border border-[#503428]/60 hover:border-[#EA580C]/85 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_-12px_rgba(234,88,12,0.28)] relative">
        
        {/* IMAGE FRAME WITH DEFENSIVE FALLBACK */}
        <div className="w-full h-48 rounded-xl bg-[#0F0D0B] border border-[#2B1F19] flex items-center justify-center relative overflow-hidden mb-4">
          {photoUrl && !imgError ? (
            <img
              src={photoUrl}
              alt={entry.title || 'Khmer Tool'}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
            />
          ) : (
            // Clean fallback SVG silhouette when photo is missing or broken
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <svg className="w-20 h-20 text-[#EA580C]/70 stroke-current group-hover:scale-110 transition duration-500" viewBox="0 0 100 80" fill="none" strokeWidth="2">
                <path d="M 15,65 Q 40,65 60,35 L 85,15" strokeLinecap="round" />
                <path d="M 50,45 L 35,70 L 65,70 Z" fill="rgba(234, 88, 12, 0.22)" />
              </svg>
              <span className="text-[10px] font-mono text-stone-500 mt-2">ARCHIVAL ARTIFACT</span>
            </div>
          )}
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 text-[10px] text-[#F59E0B] font-mono tracking-wider">
            CATALOG #{String(index + 1).padStart(2, '0')}
          </span>

          {/* Owner quick controls if applicable */}
          {isOwner && (
            <div
              className="absolute top-3 right-3 flex items-center gap-1.5 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(entry)}
                  className="px-2 py-0.5 rounded bg-black/80 text-[10px] text-stone-300 hover:text-white border border-stone-700"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Delete this tool entry?")) {
                      onDelete(entry.id);
                    }
                  }}
                  className="px-2 py-0.5 rounded bg-black/80 text-[10px] text-[#EA580C] hover:text-red-400 border border-stone-700"
                >
                  Del
                </button>
              )}
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div className="flex-grow flex flex-col">
          <div className="text-[10px] font-mono text-[#EA580C] uppercase tracking-wider mb-1">
            {entry.category || entry.categoryLabel || 'FARMING HERITAGE'}
          </div>
          <h3 className="font-serif text-lg text-white font-medium group-hover:text-[#F59E0B] transition-colors leading-relaxed">
            {entry.title}
          </h3>
          <p className="text-stone-400 text-xs leading-relaxed mt-2 line-clamp-3">
            {entry.description || 'Traditional hand-forged agricultural tool recorded from Kampong Cham elders.'}
          </p>
        </div>

        {/* FOOTER (NO EMOJIS) */}
        <div className="border-t border-[#2A1E18] pt-3 mt-4 flex items-center justify-between text-xs text-stone-400">
          <span>{entry.place || 'Kampong Cham'}</span>
          <span className="text-[#F59E0B] font-medium group-hover:translate-x-1 transition-transform">
            Inspect &rarr;
          </span>
        </div>
      </div>
    </div>
  );
}
