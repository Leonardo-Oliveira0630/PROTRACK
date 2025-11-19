
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { Job, User, Sector, UserRole, JobHistory, JobStatus } from '../types';
import { 
    subscribeToJobs, 
    subscribeToSectors, 
    subscribeToUsers, 
    addJobToFirestore, 
    updateJobInFirestore,
    addSectorToFirestore,
    deleteSectorFromFirestore,
    addUserToFirestore,
    deleteUserFromFirestore,
    seedDatabaseIfEmpty,
    loginUser,
    registerNewUser,
    logoutUser,
    monitorAuthState
} from '../services/firebaseService';

interface ScanResult {
  success: boolean; 
  message: string; 
  type: 'ENTRY' | 'EXIT' | 'ERROR' | 'INFO';
  jobDetails?: Job;
}

interface ScanAnalysis {
  action: 'ENTRY' | 'EXIT' | 'ERROR' | 'INFO';
  message: string;
  job?: Job;
  sectorName?: string;
}

interface ScanModalState {
  isOpen: boolean;
  code: string;
  analysis: ScanAnalysis | null;
}

interface AppState {
  currentUser: User | null;
  users: User[];
  sectors: Sector[];
  jobs: Job[];
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  
  addJob: (job: Job) => Promise<void>;
  updateJob: (jobId: string, updates: Partial<Job>) => Promise<void>;
  finishJob: (jobId: string) => Promise<void>;
  updateJobReminder: (jobId: string, note: string) => Promise<void>;
  
  scanJob: (code: string) => Promise<ScanResult>;
  analyzeScan: (code: string) => ScanAnalysis; 
  getJobByCode: (code: string) => Job | undefined;
  getJobById: (id: string) => Job | undefined;
  
  addSector: (name: string) => Promise<void>;
  deleteSector: (id: string) => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  scanModalState: ScanModalState;
  closeScanModal: () => void;
  confirmScanModal: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [users, setUsers] = useState<User[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [scanModalState, setScanModalState] = useState<ScanModalState>({
    isOpen: false,
    code: '',
    analysis: null
  });

  const bufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribeAuth = monitorAuthState((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  // Monitor Data (Only when logged in)
  useEffect(() => {
    let unsubJobs: () => void;
    let unsubSectors: () => void;
    let unsubUsers: () => void;

    if (currentUser) {
        setIsLoading(true);
        
        if (currentUser.role === UserRole.ADMIN) {
            seedDatabaseIfEmpty().catch(console.error);
        }

        unsubJobs = subscribeToJobs((fetchedJobs) => {
            setJobs(fetchedJobs);
        });
        
        unsubSectors = subscribeToSectors((fetchedSectors) => {
            setSectors(fetchedSectors);
        });
        
        unsubUsers = subscribeToUsers((fetchedUsers) => {
            setUsers(fetchedUsers);
            setIsLoading(false);
        });
    } else {
        setJobs([]);
        setSectors([]);
        setUsers([]);
        setIsLoading(false);
    }

    return () => {
        if(unsubJobs) unsubJobs();
        if(unsubSectors) unsubSectors();
        if(unsubUsers) unsubUsers();
    };
  }, [currentUser?.id]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
        await loginUser(email, password);
        return true;
    } catch (error) {
        console.error(error);
        throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
      await registerNewUser(name, email, password);
  };

  const logout = async () => {
      await logoutUser();
      setCurrentUser(null);
  };

  // --- Actions Wrappers ---

  const addJob = async (newJob: Job) => {
    const { id, ...jobData } = newJob;
    await addJobToFirestore(jobData as any);
  };

  // Smart Update with History Tracking
  const updateJob = async (jobId: string, updates: Partial<Job>) => {
    if (!currentUser) return;

    const oldJob = jobs.find(j => j.id === jobId);
    if (!oldJob) return;

    const changes: string[] = [];

    // Detect changes for history
    if (updates.patientName && updates.patientName !== oldJob.patientName) changes.push(`Paciente alterado para: ${updates.patientName}`);
    if (updates.dentistName && updates.dentistName !== oldJob.dentistName) changes.push(`Dentista alterado para: ${updates.dentistName}`);
    if (updates.urgency && updates.urgency !== oldJob.urgency) changes.push(`Urgência alterada: ${oldJob.urgency} -> ${updates.urgency}`);
    if (updates.deliveryDate && updates.deliveryDate !== oldJob.deliveryDate) changes.push(`Entrega alterada para: ${new Date(updates.deliveryDate).toLocaleDateString()}`);
    if (updates.description && updates.description !== oldJob.description) changes.push(`Descrição técnica atualizada`);
    if (updates.isPromised !== undefined && updates.isPromised !== oldJob.isPromised) changes.push(updates.isPromised ? "Marcado como PROMETIDO (VIP)" : "Removido de PROMETIDO");

    // Only add history if there are meaningful changes or status changes
    let newHistory = [...oldJob.history];
    
    if (changes.length > 0) {
        const historyEntry: JobHistory = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            action: 'EDIT',
            sectorName: 'Gestão / Edição',
            userId: currentUser.id,
            userName: currentUser.name,
            changes: changes
        };
        newHistory.push(historyEntry);
    }

    await updateJobInFirestore(jobId, { ...updates, history: newHistory });
  };

  const finishJob = async (jobId: string) => {
      if (!currentUser) return;
      
      const oldJob = jobs.find(j => j.id === jobId);
      if (!oldJob) return;

      const historyEntry: JobHistory = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action: 'FINISHED',
        sectorName: 'Expedição',
        userId: currentUser.id,
        userName: currentUser.name,
        changes: ['Trabalho marcado como FINALIZADO']
    };

      await updateJobInFirestore(jobId, {
          status: JobStatus.COMPLETED,
          isFinished: true,
          history: [...oldJob.history, historyEntry]
      });
  };

  const updateJobReminder = async (jobId: string, note: string) => {
    await updateJobInFirestore(jobId, { reminderNote: note });
  };

  const getJobByCode = (code: string) => jobs.find(j => j.code === code);
  const getJobById = (id: string) => jobs.find(j => j.id === id);

  const addSector = async (name: string) => {
    await addSectorToFirestore(name);
  };

  const deleteSector = async (id: string) => {
    await deleteSectorFromFirestore(id);
  };

  const addUser = async (newUser: Omit<User, 'id'>) => {
    await addUserToFirestore(newUser);
  };

  const deleteUser = async (id: string) => {
    if (currentUser?.id === id) {
      alert("Não é possível deletar o usuário logado atualmente.");
      return;
    }
    await deleteUserFromFirestore(id);
  };

  // --- Core Logic ---

  const analyzeScan = (code: string): ScanAnalysis => {
    if (!currentUser) return { action: 'ERROR', message: "Usuário não logado" };
    
    const job = jobs.find(j => j.code === code);
    if (!job) return { action: 'ERROR', message: "Trabalho não encontrado" };

    if (job.isFinished) {
        return { action: 'INFO', message: "Trabalho já finalizado!", job };
    }

    if (currentUser.role === UserRole.ADMIN) {
       return { action: 'INFO', message: "Visualização de Admin", job };
    }

    const mySector = sectors.find(s => s.id === currentUser.sectorId);
    if (!mySector && !currentUser.sectorId) return { action: 'ERROR', message: "Usuário sem setor configurado" };
    
    const sectorName = mySector?.name || "Setor do Usuário";
    const isCurrentlyInMySector = job.currentSectorId === currentUser.sectorId;
    
    if (isCurrentlyInMySector) {
        return { action: 'EXIT', message: `Confirmar SAÍDA de ${sectorName}?`, job, sectorName };
    } else {
        return { action: 'ENTRY', message: `Confirmar ENTRADA em ${sectorName}?`, job, sectorName };
    }
  };

  const scanJob = async (code: string): Promise<ScanResult> => {
    if (!currentUser) return { success: false, message: "Usuário não logado", type: 'ERROR' };
    
    const job = jobs.find(j => j.code === code);
    if (!job) return { success: false, message: "Trabalho não encontrado no sistema", type: 'ERROR' };

    if (job.isFinished) return { success: false, message: "Trabalho já finalizado", type: 'INFO' };

    if (currentUser.role === UserRole.ADMIN) {
       return { success: true, message: "Visualização de Admin", type: 'INFO', jobDetails: job };
    }

    const mySector = sectors.find(s => s.id === currentUser.sectorId);
    if (!mySector && currentUser.sectorId) {
         return { success: false, message: "Setor do usuário inválido", type: 'ERROR' };
    }
    const sectorName = mySector?.name || "Setor Desconhecido";

    const isCurrentlyInMySector = job.currentSectorId === currentUser.sectorId;
    
    const historyEntry: JobHistory = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action: isCurrentlyInMySector ? 'EXIT' : 'ENTRY',
        sectorName: sectorName,
        userId: currentUser.id,
        userName: currentUser.name
    };

    let updates: Partial<Job> = {};
    
    if (isCurrentlyInMySector) {
        updates.history = [...job.history, historyEntry];
        updates.currentSectorId = null; 
        updates.status = JobStatus.IN_PROGRESS;
        await updateJobInFirestore(job.id, updates);
        
        return { success: true, message: `Saída registrada: ${sectorName}`, type: 'EXIT', jobDetails: { ...job, ...updates } as Job };
    } else {
        updates.history = [...job.history, historyEntry];
        updates.currentSectorId = currentUser.sectorId || null;
        updates.status = JobStatus.IN_PROGRESS;
        await updateJobInFirestore(job.id, updates);

        return { success: true, message: `Entrada registrada: ${sectorName}`, type: 'ENTRY', jobDetails: { ...job, ...updates } as Job };
    }
  };

  // --- Global Listener ---

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentUser) return;

      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      const now = Date.now();
      if (now - lastKeyTimeRef.current > 100) {
        bufferRef.current = '';
      }
      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        if (bufferRef.current.length > 2) {
          const code = bufferRef.current;
          const analysis = analyzeScan(code);
          setScanModalState({
            isOpen: true,
            code,
            analysis
          });
        }
        bufferRef.current = '';
      } else if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jobs, users, sectors, currentUser]);

  const closeScanModal = () => {
    setScanModalState(prev => ({ ...prev, isOpen: false }));
  };

  const confirmScanModal = () => {
    if (scanModalState.code) {
      scanJob(scanModalState.code);
      closeScanModal();
    }
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, users, sectors, jobs, isLoading,
      login, register, logout, addJob, updateJob, finishJob, updateJobReminder, scanJob, analyzeScan, getJobByCode, getJobById,
      addSector, deleteSector, addUser, deleteUser,
      scanModalState, closeScanModal, confirmScanModal
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
