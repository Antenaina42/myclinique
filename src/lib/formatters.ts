export function formatCurrency(amount: number | null | undefined, currency: string = 'Ar'): string {
  if (amount === null || amount === undefined || isNaN(amount)) return `0 ${currency}`;
  const formatted = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted} ${currency}`;
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function calculateAge(birthDate: string | Date): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function calculateBMI(weightKg: number, heightCm: number): { bmi: number; category: string; color: string } | null {
  if (!weightKg || !heightCm || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));
  let category = 'Normal';
  let color = 'text-emerald-600 bg-emerald-50';

  if (bmi < 18.5) {
    category = 'Maigreur';
    color = 'text-blue-600 bg-blue-50';
  } else if (bmi >= 25 && bmi < 30) {
    category = 'Surpoids';
    color = 'text-amber-600 bg-amber-50';
  } else if (bmi >= 30) {
    category = 'Obésité';
    color = 'text-red-600 bg-red-50';
  }

  return { bmi, category, color };
}

export function getStatusBadge(status: string): { label: string; className: string } {
  switch (status?.toUpperCase()) {
    case 'CONFIRMED':
    case 'PAID':
    case 'COMPLETED':
    case 'ACTIVE':
      return { label: 'Confirmé / Payé', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    case 'PARTIALLY_PAID':
    case 'IN_PROGRESS':
      return { label: 'Partiel / En cours', className: 'bg-blue-100 text-blue-800 border-blue-200' };
    case 'PENDING':
    case 'UNPAID':
      return { label: 'En attente / Impayé', className: 'bg-amber-100 text-amber-800 border-amber-200' };
    case 'CANCELLED':
    case 'EXPIRED':
    case 'NO_SHOW':
      return { label: 'Annulé / Expiré', className: 'bg-rose-100 text-rose-800 border-rose-200' };
    default:
      return { label: status || 'Inconnu', className: 'bg-gray-100 text-gray-800 border-gray-200' };
  }
}
