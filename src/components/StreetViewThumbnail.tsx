import React from 'react';
import { RotateCw, Compass } from 'lucide-react';
import { StreetViewNode } from '../data/streetViewData';

interface StreetViewThumbnailProps {
  currentNode: StreetViewNode;
  onOpenStreetView: () => void;
  className?: string;
}

export const StreetViewThumbnail: React.FC<StreetViewThumbnailProps> = ({
  currentNode,
  onOpenStreetView,
  className = '',
}) => {
  return (
    <div
      id="streetview-floating-thumbnail"
      onClick={onOpenStreetView}
      className={`group relative w-28 h-20 sm:w-36 sm:h-24 rounded-2xl overflow-hidden cursor-pointer shadow-2xl border-2 border-slate-900 bg-slate-950 ring-2 ring-white/20 hover:ring-blue-400 hover:scale-105 active:scale-95 transition-all duration-200 select-none z-[460] ${className}`}
      title="Abrir Street View (Visão da Rua em 360°)"
    >
      {/* Street View Preview Image */}
      <img
        src={currentNode.imageUrl}
        alt={currentNode.address}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 brightness-90 contrast-105"
        loading="eager"
      />

      {/* Dark Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

      {/* 360° Rotating Circular Icon in Bottom Left Corner (exactly like Image 2) */}
      <div className="absolute bottom-1.5 left-1.5 w-7 h-7 rounded-full bg-slate-900/90 text-white flex items-center justify-center shadow-lg border border-white/30 backdrop-blur-xs group-hover:bg-blue-600 transition-colors">
        <div className="relative flex items-center justify-center">
          <RotateCw className="w-4 h-4 text-white animate-[spin_6s_linear_infinite]" />
          <span className="absolute text-[7px] font-black tracking-tighter">360</span>
        </div>
      </div>

      {/* Street Name Badge */}
      <div className="absolute top-1.5 left-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs flex items-center justify-between">
        <span className="text-[10px] font-bold text-white truncate drop-shadow-xs">
          {currentNode.streetName || currentNode.address}
        </span>
        <Compass className="w-3 h-3 text-blue-400 shrink-0" />
      </div>

      {/* Hover prompt */}
      <div className="absolute inset-0 bg-blue-600/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
        <span className="text-[11px] font-bold text-white bg-black/70 px-2 py-1 rounded-full shadow-md">
          Explorar Rua
        </span>
      </div>
    </div>
  );
};
