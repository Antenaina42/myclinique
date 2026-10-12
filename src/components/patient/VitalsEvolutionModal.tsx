'use client';

import React from 'react';
import {
  X,
  TrendingUp,
  HeartPulse,
  Activity,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { formatDate } from '@/lib/formatters';
import { calculateBMI } from '@/lib/bmi';

interface VitalsEvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  consultations: any[];
}

export default function VitalsEvolutionModal({
  isOpen,
  onClose,
  patientName,
  consultations,
}: VitalsEvolutionModalProps) {
  if (!isOpen) return null;

  // Filter consultations with vital signs recorded
  const vitalsRecords = consultations
    .filter((c) => c.vitalSigns)
    .sort((a, b) => new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Historique & Évolution des Constantes Vitales</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Patient : <strong className="text-slate-800">{patientName}</strong> ({vitalsRecords.length} relevé(s))
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {vitalsRecords.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Aucune constante vitale enregistrée dans l'historique des consultations.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Date de relevé</th>
                    <th className="py-3 px-4">Tension Artérielle</th>
                    <th className="py-3 px-4">Fréquence Cardiaque</th>
                    <th className="py-3 px-4">Température</th>
                    <th className="py-3 px-4">SpO2</th>
                    <th className="py-3 px-4">Poids (kg)</th>
                    <th className="py-3 px-4">Taille (cm)</th>
                    <th className="py-3 px-4">IMC & Classification HAS</th>
                    <th className="py-3 px-4">Médecin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vitalsRecords.map((c) => {
                    const v = c.vitalSigns;
                    const bmiResult = calculateBMI(v.weight, v.height) || (v.bmi ? { bmi: v.bmi, label: 'Enregistré', colorClass: '', badgeBg: 'bg-blue-100', badgeText: 'text-blue-800' } : null);

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                          {formatDate(c.consultationDate)}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                          {v.systolicBP && v.diastolicBP ? `${v.systolicBP}/${v.diastolicBP} mmHg` : '—'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {v.heartRate ? (
                            <span className="font-semibold text-slate-800">{v.heartRate} bpm</span>
                          ) : '—'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {v.temperature ? (
                            <span className={`font-semibold ${v.temperature >= 38 ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>
                              {v.temperature} °C
                            </span>
                          ) : '—'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {v.oxygenSaturation ? (
                            <span className={`font-semibold ${v.oxygenSaturation < 95 ? 'text-amber-600 font-bold' : 'text-slate-800'}`}>
                              {v.oxygenSaturation} %
                            </span>
                          ) : '—'}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                          {v.weight ? `${v.weight} kg` : '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          {v.height ? `${v.height} cm` : '—'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {bmiResult ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{bmiResult.bmi}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${bmiResult.badgeBg} ${bmiResult.badgeText}`}>
                                {bmiResult.label}
                              </span>
                            </div>
                          ) : '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {c.doctor ? `Dr. ${c.doctor.user.lastName}` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex justify-end bg-slate-50/60">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
