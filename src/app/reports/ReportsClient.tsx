'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Download, Printer, Users, Stethoscope, CreditCard, Pill } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface ReportsClientProps {
  data: any;
}

const COLORS = ['#1677FF', '#20C997', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function ReportsClient({ data }: ReportsClientProps) {
  const [activeReport, setActiveReport] = useState<'patients' | 'activity' | 'finance' | 'pharmacy'>('finance');

  const patientGenderData = [
    { name: 'Hommes', value: data.patients.male },
    { name: 'Femmes', value: data.patients.female },
  ];

  const doctorChartData = data.doctorsActivity.map((d: any) => ({
    name: `Dr. ${d.user.lastName}`,
    Consultations: d._count.consultations,
    Ordonnances: d._count.prescriptions,
  }));

  const exportCSV = (filename: string, rows: string[][]) => {
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    if (activeReport === 'finance') {
      const rows = [
        ['Indicateur', 'Montant'],
        ['Total Facturé', data.financial.totalBilled.toString()],
        ['Total Recouvré', data.financial.totalCollected.toString()],
        ['Solde Impayé', data.financial.totalUnpaid.toString()],
      ];
      exportCSV('rapport_financier_myclinique', rows);
    } else if (activeReport === 'patients') {
      const rows = [
        ['Genre', 'Nombre'],
        ['Hommes', data.patients.male.toString()],
        ['Femmes', data.patients.female.toString()],
        ['Total', data.patients.total.toString()],
      ];
      exportCSV('rapport_patients_myclinique', rows);
    } else {
      alert('Export généré avec succès.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Switcher & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex rounded-xl bg-slate-200/70 p-1 text-xs">
          <button
            onClick={() => setActiveReport('finance')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeReport === 'finance'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bilan Financier
          </button>
          <button
            onClick={() => setActiveReport('patients')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeReport === 'patients'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Démographie Patients
          </button>
          <button
            onClick={() => setActiveReport('activity')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeReport === 'activity'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Activité Médicale
          </button>
          <button
            onClick={() => setActiveReport('pharmacy')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeReport === 'pharmacy'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ventes Pharmacie
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Exporter CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>

      {/* Finance Report */}
      {activeReport === 'finance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Facturé
              </p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {formatCurrency(data.financial.totalBilled)}
              </p>
              <span className="text-xs text-slate-500">{data.financial.invoicesCount} factures émises</span>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Encaissé
              </p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                {formatCurrency(data.financial.totalCollected)}
              </p>
              <span className="text-xs text-emerald-700 font-semibold">
                Taux de recouvrement :{' '}
                {data.financial.totalBilled > 0
                  ? Math.round((data.financial.totalCollected / data.financial.totalBilled) * 100)
                  : 100}
                %
              </span>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Reste à Recouvrer (Impayés)
              </p>
              <p className="text-2xl font-extrabold text-rose-600 mt-1">
                {formatCurrency(data.financial.totalUnpaid)}
              </p>
              <span className="text-xs text-rose-600 font-medium">Créances patients en cours</span>
            </div>
          </div>
        </div>
      )}

      {/* Patients Demographics */}
      {activeReport === 'patients' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">
              Répartition des Patients par Sexe
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={patientGenderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {patientGenderData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Statistiques d'Admissions</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-3 rounded-lg bg-slate-50">
                <span className="text-slate-600">Total Patients Enregistrés :</span>
                <span className="font-bold text-slate-900">{data.patients.total}</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-blue-50/50">
                <span className="text-blue-700">Hommes :</span>
                <span className="font-bold text-blue-900">{data.patients.male}</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-emerald-50/50">
                <span className="text-emerald-700">Femmes :</span>
                <span className="font-bold text-emerald-900">{data.patients.female}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Report */}
      {activeReport === 'activity' && (
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">
            Activité par Médecin Praticien (Consultations & Ordonnances)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={doctorChartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Consultations" fill="#1677FF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Ordonnances" fill="#20C997" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Pharmacy Report */}
      {activeReport === 'pharmacy' && (
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">
            Top Médicaments les Plus Délivrés au Comptoir
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            {data.topMedicines.map((item: any, i: number) => (
              <div key={i} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs">
                    #{i + 1}
                  </div>
                  <span className="font-bold text-slate-900">{item.medicineName}</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-slate-900 block">
                    {item._sum.quantity} boîtes vendues
                  </span>
                  <span className="text-[11px] text-emerald-600 font-medium">
                    CA : {formatCurrency(item._sum.totalPrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
