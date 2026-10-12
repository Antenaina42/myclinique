export interface HospitalizationItem {
  id: string;
  hospitalName: string;
  service?: string | null;
  admissionDate: string;
  dischargeDate?: string | null;
  reason: string;
  summary?: string | null;
  outcome?: string | null;
  doctorInCharge?: string | null;
  notes?: string | null;
  files?: string[] | null;
}

export type ClinicalStatus =
  | 'SOIGNE'
  | 'EN_TRAITEMENT'
  | 'STABLE'
  | 'RECHUTE'
  | 'COMPLICATION'
  | 'DECEDE';

export interface ClinicalMetadata {
  notes: string;
  clinicalStatus: ClinicalStatus;
  clinicalStatusDate: string | null;
  deathDate: string | null;
  deathCause: string | null;
  treatmentResultNotes: string | null;
  hospitalizations: HospitalizationItem[];
}

export function parseClinicalMetadata(rawText?: string | null): ClinicalMetadata {
  const defaults: ClinicalMetadata = {
    notes: rawText || '',
    clinicalStatus: 'EN_TRAITEMENT',
    clinicalStatusDate: null,
    deathDate: null,
    deathCause: null,
    treatmentResultNotes: null,
    hospitalizations: [],
  };

  if (!rawText) return defaults;

  const trimmed = rawText.trim();
  if (!trimmed.startsWith('{')) {
    return defaults;
  }

  try {
    const parsed = JSON.parse(trimmed);
    return {
      notes:
        typeof parsed.notes === 'string'
          ? parsed.notes
          : typeof parsed.generalNotes === 'string'
          ? parsed.generalNotes
          : '',
      clinicalStatus: parsed.clinicalStatus || 'EN_TRAITEMENT',
      clinicalStatusDate: parsed.clinicalStatusDate || null,
      deathDate: parsed.deathDate || null,
      deathCause: parsed.deathCause || null,
      treatmentResultNotes: parsed.treatmentResultNotes || null,
      hospitalizations: Array.isArray(parsed.hospitalizations) ? parsed.hospitalizations : [],
    };
  } catch {
    return defaults;
  }
}

export function serializeClinicalMetadata(
  data: Partial<ClinicalMetadata>,
  existingRaw?: string | null
): string {
  const existing = parseClinicalMetadata(existingRaw);
  const merged: ClinicalMetadata = {
    ...existing,
    ...data,
  };
  return JSON.stringify(merged);
}
