
import { Sector, User, UserRole, Job, UrgencyLevel, JobStatus, JobType, BoxColor, Dentist } from './types';

export const MOCK_SECTORS: Sector[] = [
  { id: 's1', name: 'Recepção & CAD' },
  { id: 's2', name: 'Fresagem / Impressão' },
  { id: 's3', name: 'Acabamento & Cerâmica' },
  { id: 's4', name: 'Controle de Qualidade' },
];

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Dr. Gestor', role: UserRole.ADMIN },
  { id: 'u2', name: 'Ana (CAD)', role: UserRole.COLLABORATOR, sectorId: 's1' },
  { id: 'u3', name: 'Carlos (Fresadora)', role: UserRole.COLLABORATOR, sectorId: 's2' },
  { id: 'u4', name: 'Beatriz (Ceramista)', role: UserRole.COLLABORATOR, sectorId: 's3' },
  { id: 'u5', name: 'Roberto (Qualidade)', role: UserRole.COLLABORATOR, sectorId: 's4' },
];

export const MOCK_JOB_TYPES: Omit<JobType, 'id'>[] = [
  { name: 'Coroa em Zircônia' },
  { name: 'Coroa E-max' },
  { name: 'Lente de Contato' },
  { name: 'Protocolo Acrílico' },
  { name: 'Protocolo Zircônia' },
  { name: 'Placa de Bruxismo' },
  { name: 'Prótese Total (PT)' },
  { name: 'Ponte Fixa (3 elementos)' },
];

export const MOCK_BOX_COLORS: Omit<BoxColor, 'id'>[] = [
  { name: 'Azul (Padrão)', hex: '#3b82f6' },
  { name: 'Vermelho (Urgente)', hex: '#ef4444' },
  { name: 'Amarelo (Atenção)', hex: '#eab308' },
  { name: 'Verde (Liberado)', hex: '#22c55e' },
  { name: 'Roxo (Implante)', hex: '#a855f7' },
  { name: 'Cinza (Prova)', hex: '#64748b' },
];

export const MOCK_DENTISTS: Omit<Dentist, 'id'>[] = [
  { name: 'Dra. Ana Souza', clinicName: 'Sorriso Mais', email: 'ana@sorriso.com' },
  { name: 'Dr. Carlos Mendes', clinicName: 'Implante Center', phone: '(11) 99999-8888' },
  { name: 'Clínica OdontoLife', clinicName: 'Rede OdontoLife' },
];

export const MOCK_JOBS: Job[] = [
  {
    id: 'j1',
    code: '8001',
    patientName: 'Maria Silva',
    dentistName: 'Dr. Fernando',
    prosthesisType: 'Coroa Zircônia (21)',
    description: 'Coroa sobre implante, cor A2.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    deliveryDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    urgency: UrgencyLevel.MEDIUM,
    currentSectorId: 's1',
    status: JobStatus.IN_PROGRESS,
    isFinished: false,
    history: [
      {
        id: 'h1',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        action: 'CREATED',
        sectorName: 'Sistema',
        userId: 'u1',
        userName: 'Dr. Gestor'
      },
      {
        id: 'h2',
        timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
        action: 'ENTRY',
        sectorName: 'Recepção & CAD',
        userId: 'u2',
        userName: 'Ana (CAD)'
      }
    ]
  },
  {
    id: 'j2',
    code: '8002',
    patientName: 'João Santos',
    dentistName: 'Dra. Camila',
    prosthesisType: 'Protocolo Superior',
    description: 'Barra clip, dentes Ivoclar.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    deliveryDate: new Date(Date.now() - 86400000 * 1).toISOString(), // Late
    urgency: UrgencyLevel.HIGH,
    currentSectorId: 's2',
    status: JobStatus.LATE,
    isFinished: false,
    isPromised: true,
    reminderNote: "Ligar para Dr. João assim que finalizar a barra.",
    history: []
  },
  {
    id: 'j3',
    code: '8003',
    patientName: 'Fernanda Lima',
    dentistName: 'Clínica Sorriso',
    prosthesisType: 'Lente de Contato (6-11)',
    description: 'E-max, BL3, textura natural.',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    deliveryDate: new Date(Date.now() + 86400000 * 4).toISOString(),
    urgency: UrgencyLevel.HIGH,
    currentSectorId: null, // In transit
    status: JobStatus.PENDING,
    isFinished: false,
    isPromised: true,
    history: []
  }
];
