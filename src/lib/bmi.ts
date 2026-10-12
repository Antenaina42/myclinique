export interface BMIResult {
  bmi: number;
  label: string;
  colorClass: string;
  badgeBg: string;
  badgeText: string;
}

/**
 * Calculates BMI (Body Mass Index / Indice de Masse Corporelle - IMC) according to HAS standards
 * @param weightKg Weight in kilograms
 * @param heightCm Height in centimeters
 */
export function calculateBMI(
  weightKg: number | null | undefined,
  heightCm: number | null | undefined
): BMIResult | null {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) {
    return null;
  }

  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

  let label = '';
  let colorClass = '';
  let badgeBg = '';
  let badgeText = '';

  if (bmi < 18.5) {
    label = 'Insuffisance pondérale';
    colorClass = 'text-amber-700 bg-amber-50 border-amber-200';
    badgeBg = 'bg-amber-100';
    badgeText = 'text-amber-800';
  } else if (bmi < 25.0) {
    label = 'Corpulence normale';
    colorClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    badgeBg = 'bg-emerald-100';
    badgeText = 'text-emerald-800';
  } else if (bmi < 30.0) {
    label = 'Surpoids';
    colorClass = 'text-orange-700 bg-orange-50 border-orange-200';
    badgeBg = 'bg-orange-100';
    badgeText = 'text-orange-800';
  } else if (bmi < 35.0) {
    label = 'Obésité modérée (Classe I)';
    colorClass = 'text-rose-700 bg-rose-50 border-rose-200';
    badgeBg = 'bg-rose-100';
    badgeText = 'text-rose-800';
  } else if (bmi < 40.0) {
    label = 'Obésité sévère (Classe II)';
    colorClass = 'text-red-700 bg-red-50 border-red-200';
    badgeBg = 'bg-red-100';
    badgeText = 'text-red-800';
  } else {
    label = 'Obésité morbide (Classe III)';
    colorClass = 'text-purple-700 bg-purple-50 border-purple-200';
    badgeBg = 'bg-purple-100';
    badgeText = 'text-purple-800';
  }

  return { bmi, label, colorClass, badgeBg, badgeText };
}
