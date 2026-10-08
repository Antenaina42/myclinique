export type RoleType = 
  | 'SUPER_ADMIN'
  | 'CLINIC_ADMIN'
  | 'DOCTOR'
  | 'NURSE'
  | 'PHARMACIST'
  | 'RECEPTIONIST'
  | 'ACCOUNTANT';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: RoleType;
  clinicId: string;
  clinicName?: string;
  doctorId?: string;
  avatar?: string;
}

export interface PatientDTO {
  id: string;
  patientNumber: string;
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  birthDate: string;
  bloodGroup: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRel?: string;
  primaryDoctorId?: string;
  primaryDoctor?: {
    id: string;
    licenseNumber: string;
    specialty: { name: string };
    user: { firstName: string; lastName: string };
  };
  medicalRecord?: {
    allergies?: string;
    chronicDiseases?: string;
    surgicalHistory?: string;
    familyHistory?: string;
    habits?: string;
    generalNotes?: string;
  };
  _count?: {
    consultations: number;
    prescriptions: number;
    invoices: number;
    appointments: number;
  };
}

export interface VitalSignDTO {
  temperature?: number;
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
}

export interface PrescriptionItemDTO {
  id?: string;
  medicineId?: string;
  medicineName: string;
  dosage: string;
  form: string;
  quantity: number;
  frequency: string;
  duration: string;
  route?: string;
  instructions?: string;
}

export interface POSCartItem {
  medicineId: string;
  name: string;
  dosage: string;
  form: string;
  unitPrice: number;
  quantity: number;
  availableStock: number;
  totalPrice: number;
}
