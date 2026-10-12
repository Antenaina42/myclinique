'use client';

import React, { useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  FileImage,
  RefreshCw,
  FileText,
  Download,
} from 'lucide-react';

interface MedicalImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  imageUrl?: string | null;
  report?: string | null;
  conclusion?: string | null;
  date?: string | null;
}

export default function MedicalImageViewerModal({
  isOpen,
  onClose,
  title,
  imageUrl,
  report,
  conclusion,
  date,
}: MedicalImageViewerModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isInverted, setIsInverted] = useState(false);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setIsInverted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden text-white shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <FileImage className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">{title}</h3>
              {date && <p className="text-[11px] text-slate-400">Examen du {date}</p>}
            </div>
          </div>

          {/* Viewer Toolbar Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleZoomIn}
              title="Zoom avant"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom arrière"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleRotate}
              title="Pivoter de 90°"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsInverted((prev) => !prev)}
              title="Inverser les contrastes (Mode Négatif radio)"
              className={`p-2 rounded-xl border transition-colors ${
                isInverted
                  ? 'bg-purple-600 border-purple-400 text-white'
                  : 'bg-slate-800 border-transparent hover:bg-slate-700 text-slate-300'
              }`}
            >
              <span className="text-xs font-mono font-bold">INV</span>
            </button>
            <button
              onClick={handleReset}
              title="Réinitialiser l'affichage"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-slate-800 mx-1" />
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-black/60">
          {/* Main Visual Display */}
          <div className="flex-1 relative flex items-center justify-center p-6 overflow-hidden select-none">
            {imageUrl ? (
              <div
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  filter: isInverted ? 'invert(1)' : 'none',
                  transition: 'transform 0.15s ease-out, filter 0.15s ease',
                }}
                className="max-w-full max-h-full flex items-center justify-center"
              >
                <img
                  src={imageUrl}
                  alt={title}
                  className="max-h-[60vh] lg:max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl"
                />
              </div>
            ) : (
              <div className="text-center p-8 text-slate-500 space-y-2">
                <FileImage className="w-16 h-16 mx-auto opacity-30" />
                <p className="text-sm font-semibold">Aucun cliché numérique haute résolution rattaché</p>
                <p className="text-xs text-slate-600">Consultez le compte rendu textuel ci-contre.</p>
              </div>
            )}
          </div>

          {/* Right Panel: Radiology Report & Findings */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/90 p-5 overflow-y-auto space-y-4 shrink-0">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>Compte Rendu d'Imagerie</span>
            </h4>

            {report ? (
              <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                {report}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Aucun rapport détaillé saisi pour cet examen.</p>
            )}

            {conclusion && (
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/50 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block">
                  Conclusion & Diagnostic :
                </span>
                <p className="text-xs text-purple-200 font-medium leading-relaxed">{conclusion}</p>
              </div>
            )}

            {imageUrl && (
              <a
                href={imageUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger le cliché</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
