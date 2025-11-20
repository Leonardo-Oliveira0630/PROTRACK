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
  changes?: string[];
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
  boxColor?: string;
}