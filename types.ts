export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'GESTOR',
  COLLABORATOR = 'COLLABORATOR'
}

export enum UrgencyLevel {
  LOW = 'Baixa',
  MEDIUM = 'Média',
  HIGH = 'Alta'
}

export enum JobStatus {
  PENDING = 'Pendente',
  IN_PROGRESS = 'Em Produção',
  COMPLETED = 'Finalizado',
  LATE = 'Atrasado'
}

export interface Sector {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  sectorId?: string; 
}

export interface Dentist {
  id: string;
  name: string;
  clinicName?: string;
  email?: string;
  phone?: string;
}

export interface JobType {
  id: string;
  name: string;
}

export interface BoxColor {
  id: string;
  name: string;
  hex: string;
}

export interface JobHistory {
  id: string;
  timestamp: string; // ISO Date
  action: 'ENTRY' | 'EXIT' | 'CREATED' | 'EDIT' | 'FINISHED';
  sectorName: string;
  userId: string;
  userName: string;
  changes?: string[]; // Array describing what changed (e.g. "Changed Urgency from Low to High")
}

export interface Job {
  id: string;
  code: string; // Barcode
  patientName: string; 
  dentistName: string; 
  prosthesisType: string; 
  description: string;
  createdAt: string;
  deliveryDate: string;
  urgency: UrgencyLevel;
  currentSectorId: string | null;
  status: JobStatus;
  history: JobHistory[];
  isFinished: boolean;
  isPromised?: boolean; 
  reminderNote?: string;
  boxNumber?: string;
  boxColor?: string; // Hex code
}

// INTERFACE QUE ESTAVA FALTANDO
export interface Alert {
  id: string;
  title: string;
  message: string;
  targetDate: string; // ISO Date string
  jobId?: string; // Optional link to a job
  targetSectorId?: string; // 'ALL', specific ID, or null
  targetUserId?: string; // Specific user ID or null
  createdBy: string;
  createdAt: string;
  readBy: string[]; // Array of user IDs who have acknowledged this alert
}