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
  action: 'ENTRY' | 'EXIT' | 'CREATED' | 'EDIT' | 'FINISHED' | 'REOPENED';
  sectorName: string;
  userId: string;
  userName: string;
  changes?: string[];
}

// NOVA INTERFACE PARA ITENS
export interface JobItem {
  type: string;
  quantity: number;
}

export interface Job {
  id: string;
  code: string; // Barcode
  patientName: string; 
  dentistName: string; 
  
  // Alterado: Agora é opcional/resumo
  prosthesisType: string; 
  
  // Novo: Lista de itens
  items?: JobItem[];

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

export interface Alert {
  id: string;
  title: string;
  message: string;
  targetDate: string; 
  jobId?: string; 
  targetSectorId?: string; 
  targetUserId?: string; 
  createdBy: string;
  createdAt: string;
  readBy: string[]; 
}