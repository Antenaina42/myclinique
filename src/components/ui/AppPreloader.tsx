'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function AppPreloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Durée totale cinématographique (environ 2.6s pour atteindre 100%)
    const duration = 2500;
    const intervalTime = 30;
    const step = 100 / (duration / intervalTime);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(interval);
          // Transition de sortie fluide
          setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
              setIsLoading(false);
            }, 800); // 800ms pour l'animation de translation vers le haut
          }, 200);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, []);

  if (!isLoading) return null;

  // Texte d'étape dynamique selon le pourcentage
  const getStatusText = () => {
    if (progress < 25) return 'Initialisation...';
    if (progress < 55) return 'Chargement des modules';
    if (progress < 85) return 'Sécurisation des accès';
    return 'Système prêt';
  };

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-[#F8FAFC] select-none transition-all duration-800 ${
        isExiting
          ? '-translate-y-full opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100'
      }`}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* Halo lumineux médical d'arrière-plan */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-100/60 via-sky-100/40 to-teal-100/40 blur-3xl opacity-70 animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-7 max-w-sm px-6 text-center">
        {/* 1. Logo avec apparition fluide et pulsation douce */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 transition-transform duration-700 ease-out hover:scale-105">
          <Image
            src="/logo/my-clinique-icon.svg"
            alt="MY CLINIQUE"
            fill
            className="object-contain drop-shadow-lg"
            priority
          />
        </div>

        {/* 2. Animation cinématographique SVG médicale (Croix + Tracé ECG Lifeline) */}
        <div className="relative w-64 h-28 flex items-center justify-center">
          <svg viewBox="0 0 220 110" className="w-full h-full overflow-visible">
            {/* Définition des dégradés */}
            <defs>
              <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1677FF" />
                <stop offset="50%" stopColor="#0EA5E9" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
              <linearGradient id="crossGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E2E8F0" />
                <stop offset="100%" stopColor="#CBD5E1" />
              </linearGradient>
            </defs>

            {/* Silhouette Croix Médicale en fond */}
            <g opacity="0.45" className="transition-opacity duration-1000">
              <rect
                x="97"
                y="15"
                width="26"
                height="80"
                rx="6"
                fill="none"
                stroke="url(#crossGrad)"
                strokeWidth="1.5"
                strokeDasharray="220"
                style={{
                  strokeDashoffset: Math.max(0, 220 - progress * 2.2),
                  transition: 'stroke-dashoffset 0.1s linear',
                }}
              />
              <rect
                x="70"
                y="42"
                width="80"
                height="26"
                rx="6"
                fill="none"
                stroke="url(#crossGrad)"
                strokeWidth="1.5"
                strokeDasharray="220"
                style={{
                  strokeDashoffset: Math.max(0, 220 - progress * 2.2),
                  transition: 'stroke-dashoffset 0.1s linear',
                }}
              />
            </g>

            {/* Ligne de base médicale */}
            <line
              x1="10"
              y1="55"
              x2="210"
              y2="55"
              stroke="#E2E8F0"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Onde Électrocardiogramme (ECG) dessinée en direct */}
            <path
              d="M 10 55 L 45 55 L 55 55 L 65 48 L 73 60 L 82 22 L 94 92 L 104 38 L 114 62 L 122 55 L 140 55 L 150 48 L 158 55 L 210 55"
              fill="none"
              stroke="url(#ecgGrad)"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="320"
              style={{
                strokeDashoffset: Math.max(0, 320 - (progress / 100) * 320),
                transition: 'stroke-dashoffset 0.08s linear',
              }}
            />

            {/* Point de pulsation lumineux à la pointe de l'onde */}
            <circle
              cx={Math.min(210, 10 + (progress / 100) * 200)}
              cy={
                progress > 30 && progress < 60
                  ? 55 + Math.sin(progress * 0.4) * 20
                  : 55
              }
              r="3.5"
              fill="#10B981"
              className="drop-shadow-[0_0_8px_#10B981] transition-all duration-75"
            />
          </svg>
        </div>

        {/* 3. Barre de progression & Pourcentage */}
        <div className="w-60 space-y-2.5">
          <div className="w-full h-[4px] bg-slate-200/90 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-400 rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] font-mono">
            <span className="tracking-[0.2em] uppercase font-bold text-blue-600 transition-all duration-300">
              {getStatusText()}
            </span>
            <span className="text-slate-600 font-semibold">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* 4. Nom de marque & Slogan officiel */}
        <div className="space-y-1 pt-1">
          <h2 className="text-base font-extrabold tracking-[0.28em] text-slate-900 uppercase">
            MY CLINIQUE
          </h2>
          <p className="text-xs text-slate-500 font-medium tracking-wide">
            La gestion intelligente de votre clinique
          </p>
        </div>
      </div>
    </div>
  );
}
