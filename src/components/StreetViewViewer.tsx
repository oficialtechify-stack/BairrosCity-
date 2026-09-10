import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, MoreVertical, Share2, Compass, X, MapPin, Navigation, ShoppingBag, Utensils, Store } from 'lucide-react';
import { StreetViewNode, STREET_VIEW_NODES } from '../data/streetViewData';

interface StreetViewViewerProps {
  currentNode: StreetViewNode;
  mode: 'split' | 'fullscreen';
  onToggleMode: (newMode: 'split' | 'fullscreen') => void;
  onClose: () => void;
  onNodeChange: (node: StreetViewNode, heading: number) => void;
  onShare?: () => void;
}

export const StreetViewViewer: React.FC<StreetViewViewerProps> = ({
  currentNode,
  mode,
  onToggleMode,
  onClose,
  onNodeChange,
  onShare,
}) => {
  // Panoramic Camera State
  const [panOffset, setPanOffset] = useState<number>(0); // Horizontal degrees (-180 to +180)
  const [pitchOffset, setPitchOffset] = useState<number>(0); // Vertical degrees (-25 to +25)
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [selectedPoi, setSelectedPoi] = useState<{ name: string; category?: string } | null>(null);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [roadCursorPos, setRoadCursorPos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Compute absolute compass heading
  const currentHeading = Math.round((currentNode.initialHeading + panOffset + 360) % 360);

  // Report heading changes to parent for synchronized map indicator
  useEffect(() => {
    onNodeChange(currentNode, currentHeading);
  }, [currentNode.id, currentHeading]);

  // Touch and Mouse Drag handlers for 360° Panoramic looking
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // Track cursor on the lower half of screen for Google Maps road cursor
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      if (relativeY > rect.height * 0.55) {
        setRoadCursorPos({ x: e.clientX - rect.left, y: relativeY });
      } else {
        setRoadCursorPos(null);
      }
    }

    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    // Smooth panning sensitivity matching Google Maps
    const speed = 0.22;
    setPanOffset((prev) => {
      let next = prev - deltaX * speed;
      while (next > 180) next -= 360;
      while (next < -180) next += 360;
      return next;
    });

    setPitchOffset((prev) => {
      const next = prev + deltaY * (speed * 0.45);
      return Math.max(-18, Math.min(18, next));
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Step to a connected street node (forward, backward, or intersection)
  const handleStepToNode = (targetNodeId: string) => {
    const target = STREET_VIEW_NODES[targetNodeId];
    if (!target) return;

    setIsTransitioning(true);
    // Smooth forward motion glide matching Google Maps
    setTimeout(() => {
      onNodeChange(target, target.initialHeading);
      setPanOffset(0);
      setPitchOffset(0);
      setIsTransitioning(false);
    }, 250);
  };

  // Double click / tap on road steps forward
  const handleRoadDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const forwardConn = currentNode.connections.find((c) => c.direction === 'forward');
    if (forwardConn) {
      handleStepToNode(forwardConn.targetNodeId);
    }
  };

  // Reset compass to North (0°)
  const handleResetNorth = () => {
    const targetOffset = -currentNode.initialHeading;
    setPanOffset(targetOffset);
    setPitchOffset(0);
  };

  // Share handler
  const handleShareClick = () => {
    if (onShare) {
      onShare();
      return;
    }
    const shareText = `Google Street View: ${currentNode.address}, ${currentNode.neighborhood}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setShareToast('Link do Street View copiado!');
      setTimeout(() => setShareToast(null), 2500);
    }
  };

  const forwardConnection = currentNode.connections.find((c) => c.direction === 'forward');
  const sideConnections = currentNode.connections.filter((c) => c.direction === 'left' || c.direction === 'right');

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        handlePointerUp();
        setRoadCursorPos(null);
      }}
      onDoubleClick={handleRoadDoubleClick}
      className="relative w-full h-full overflow-hidden select-none bg-black touch-none transition-all duration-300 cursor-grab active:cursor-grabbing"
    >
      {/* 360 Panoramic Background Street View Image with Smooth Zoom-on-Step */}
      <div
        className={`absolute inset-0 w-full h-full transform-gpu transition-all ${
          isTransitioning
            ? 'scale-125 opacity-80 filter blur-[1px] duration-250 ease-out'
            : 'scale-105 duration-75 ease-linear'
        }`}
        style={{
          transform: `scale(1.12) translate3d(${panOffset * 2.6}px, ${pitchOffset * 2.0}px, 0)`,
        }}
      >
        <img
          src={currentNode.imageUrl}
          alt={currentNode.address}
          className="w-full h-full object-cover pointer-events-none brightness-[0.98] contrast-[1.03]"
          draggable={false}
        />
        {/* Authentic subtle vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/40 pointer-events-none" />
      </div>

      {/* ========================================================================= */}
      {/* AUTHENTIC GOOGLE MAPS TOP HEADER (Back Arrow + Address + Compass + Menu) */}
      {/* ========================================================================= */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 sm:px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent text-white pointer-events-auto">
        {/* Left: Back Button (Arrow) + Street Address */}
        <div className="flex items-center gap-2.5 max-w-[70%] sm:max-w-[80%]">
          {/* Authentic Google Maps Back Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/10 shadow-lg active:scale-95 cursor-pointer shrink-0"
            title="Voltar ao mapa"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          {/* Address and Capture Info */}
          <div className="flex flex-col min-w-0">
            <h1 className="font-semibold text-sm sm:text-base text-white tracking-tight truncate drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              {currentNode.address}
            </h1>
            <p className="text-[11px] sm:text-xs text-white/80 truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] flex items-center gap-1.5">
              <span>{currentNode.neighborhood}</span>
              <span className="text-white/40">•</span>
              <span>{currentNode.date}</span>
            </p>
          </div>
        </div>

        {/* Right: Authentic Google Maps Compass + Overflow Menu */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Authentic Google Maps Compass Dial */}
          <button
            type="button"
            onClick={handleResetNorth}
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/10 shadow-lg active:scale-95 cursor-pointer group"
            title={`Orientação: ${currentHeading}° (Toque para apontar ao Norte)`}
          >
            {/* Rotating Compass Needle (Red needle points North, Silver points South) */}
            <div
              className="w-6 h-6 relative flex items-center justify-center transition-transform duration-100 ease-out"
              style={{ transform: `rotate(${360 - currentHeading}deg)` }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                {/* Outer Ring */}
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                {/* North Pointer (Red) */}
                <polygon points="12,3 15,12 12,10 9,12" fill="#ea4335" />
                {/* South Pointer (White) */}
                <polygon points="12,21 15,12 12,10 9,12" fill="#ffffff" />
                {/* Center Pivot */}
                <circle cx="12" cy="11" r="1.5" fill="#ffffff" />
              </svg>
            </div>
          </button>

          {/* 3 Dots Menu */}
          <button
            type="button"
            onClick={handleShareClick}
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/10 shadow-lg active:scale-95 cursor-pointer"
            title="Compartilhar ou Opções"
          >
            <MoreVertical className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* FLOATING BUILDING POIs (Place Pins on Buildings in Authentic Google Style) */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {currentNode.nearbyPoints.map((poi) => {
          const relativeYaw = poi.yaw - panOffset;
          // Only show if inside field of view
          if (relativeYaw < -55 || relativeYaw > 55) return null;

          const screenPercentX = 50 + (relativeYaw / 55) * 44;
          const screenPercentY = 47 - poi.pitch * 1.4;

          return (
            <div
              key={poi.id}
              style={{
                left: `${screenPercentX}%`,
                top: `${screenPercentY}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute pointer-events-auto transition-transform duration-75 cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPoi({ name: poi.name, category: poi.category });
              }}
            >
              {/* Google Maps Authentic Building Pin */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-blue-600 text-white border border-white/20 shadow-xl backdrop-blur-md group-hover:scale-105 transition-all">
                <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0 shadow-sm" />
                <span className="text-xs font-semibold tracking-tight whitespace-nowrap drop-shadow-xs">
                  {poi.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3D STREET NAME ON ASPHALT (Exact Google Maps Style)                       */}
      {/* ========================================================================= */}
      <div
        className="absolute bottom-28 sm:bottom-24 left-1/2 -translate-x-1/2 pointer-events-none z-10 flex flex-col items-center select-none"
        style={{
          transform: `translateX(-50%) perspective(360px) rotateX(65deg) translateY(${pitchOffset * 1.5}px)`,
        }}
      >
        <span className="text-white/80 text-xl sm:text-2xl font-bold uppercase tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] select-none">
          {currentNode.streetName}
        </span>
      </div>

      {/* ========================================================================= */}
      {/* AUTHENTIC ROAD GROUND CHEVRON (Projected Flat on the Asphalt)             */}
      {/* NO floating circular buttons, NO 'Voltar' text - Pure Google Maps Style   */}
      {/* ========================================================================= */}
      {forwardConnection && (
        <div
          className="absolute bottom-16 sm:bottom-14 left-1/2 -translate-x-1/2 z-25 pointer-events-auto cursor-pointer group"
          onClick={(e) => {
            e.stopPropagation();
            handleStepToNode(forwardConnection.targetNodeId);
          }}
          title="Avançar na via"
          style={{
            transform: `translateX(-50%) perspective(320px) rotateX(62deg)`,
          }}
        >
          {/* Authentic Google Maps Ground Chevron Overlay */}
          <div className="relative flex flex-col items-center justify-center p-2 group-hover:scale-110 active:scale-95 transition-transform duration-200">
            {/* Ground Disc / Glow */}
            <div className="w-24 h-16 sm:w-28 sm:h-20 rounded-full bg-white/15 group-hover:bg-white/30 border border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.4)] backdrop-blur-xs flex items-center justify-center transition-colors">
              {/* White Ground Arrow Chevrons */}
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] opacity-95 group-hover:translate-y-[-2px] transition-transform"
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Side Turn Chevrons on Ground (If intersection exists) */}
      {sideConnections.map((conn) => (
        <div
          key={conn.targetNodeId}
          onClick={(e) => {
            e.stopPropagation();
            handleStepToNode(conn.targetNodeId);
          }}
          style={{
            transform: `perspective(320px) rotateX(62deg) rotateY(${conn.direction === 'left' ? '-35deg' : '35deg'})`,
          }}
          className={`absolute bottom-20 z-25 pointer-events-auto cursor-pointer group ${
            conn.direction === 'left' ? 'left-8 sm:left-24' : 'right-8 sm:right-24'
          }`}
          title={`Virar para ${conn.label}`}
        >
          <div className="w-16 h-12 rounded-full bg-white/15 group-hover:bg-white/30 border border-white/40 flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-all">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {conn.direction === 'left' ? (
                <polyline points="15 18 9 12 15 6" />
              ) : (
                <polyline points="9 18 15 12 9 6" />
              )}
            </svg>
          </div>
        </div>
      ))}

      {/* Dynamic Road Target Indicator on Mouse Hover (Google Maps road cursor) */}
      {roadCursorPos && !isDragging && (
        <div
          style={{
            left: `${roadCursorPos.x}px`,
            top: `${roadCursorPos.y}px`,
            transform: 'translate(-50%, -50%) perspective(300px) rotateX(65deg)',
          }}
          className="absolute pointer-events-none z-20 w-12 h-8 rounded-full border-2 border-white/60 bg-white/10 transition-transform duration-75 shadow-[0_0_10px_rgba(255,255,255,0.4)] flex items-center justify-center"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
        </div>
      )}

      {/* ========================================================================= */}
      {/* FLOATING BOTTOM RIGHT ACTION: EXPAND / SPLIT-SCREEN TOGGLE                */}
      {/* ========================================================================= */}
      <div className="absolute bottom-4 right-4 z-35 pointer-events-auto">
        {mode === 'split' ? (
          // EXPAND BUTTON (Two opposing diagonal arrows pointing outward - Image 3)
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMode('fullscreen');
            }}
            className="w-12 h-12 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white shadow-2xl border border-white/20 flex items-center justify-center backdrop-blur-md cursor-pointer active:scale-90 transition-all group"
            title="Expandir para Tela Cheia"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:scale-110 transition-transform"
            >
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>
        ) : (
          // RESTORE SPLIT-SCREEN BUTTON (Two inward opposing arrows >< - Image 4)
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMode('split');
            }}
            className="w-12 h-12 rounded-full bg-slate-900/95 hover:bg-slate-800 text-white shadow-2xl border border-white/30 flex items-center justify-center backdrop-blur-md cursor-pointer active:scale-90 transition-all group"
            title="Restaurar Modo Dividido (Ver Mapa e Rua juntos)"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:scale-110 transition-transform"
            >
              <polyline points="4 14 10 14 10 20" />
              <polyline points="20 10 14 10 14 4" />
              <line x1="14" y1="10" x2="21" y2="3" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* AUTHENTIC GOOGLE MAPS BOTTOM WATERMARK & COPYRIGHT                        */}
      {/* ========================================================================= */}
      <div className="absolute bottom-2 left-3 z-30 pointer-events-none flex items-center gap-2 text-[11px] text-white/70 select-none">
        <span className="font-bold tracking-tight text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          Google
        </span>
        <span className="hidden sm:inline text-white/50">•</span>
        <span className="hidden sm:inline text-white/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          Imagens capturadas em abr. de 2026
        </span>
      </div>

      {/* ========================================================================= */}
      {/* PLACE DETAILS BOTTOM CARD (When a POI is clicked)                        */}
      {/* ========================================================================= */}
      {selectedPoi && (
        <div className="absolute bottom-16 left-3 right-3 sm:left-6 sm:right-auto sm:w-80 z-40 bg-slate-900/95 text-white p-3.5 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 pointer-events-auto">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <Store className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">{selectedPoi.name}</h3>
                <p className="text-xs text-white/70">{selectedPoi.category || 'Estabelecimento Comercial'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPoi(null)}
              className="text-white/60 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-medium">Aberto agora</span>
            <button
              type="button"
              onClick={() => {
                window.open(`https://www.google.com/maps/search/${encodeURIComponent(selectedPoi.name + ' Curado IV')}`, '_blank');
              }}
              className="text-blue-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <Navigation className="w-3 h-3" />
              Ver no Maps
            </button>
          </div>
        </div>
      )}

      {/* Share notification toast */}
      {shareToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 text-white px-4 py-1.5 rounded-full shadow-2xl text-xs font-semibold border border-white/20 animate-in fade-in slide-in-from-top-2">
          {shareToast}
        </div>
      )}
    </div>
  );
};
