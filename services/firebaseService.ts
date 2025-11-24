import { 
    collection, 
    onSnapshot, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    orderBy,
    writeBatch,
    getDocs,
    where,
    setDoc,
    getDoc,
    arrayUnion
} from "firebase/firestore";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged
} from "firebase/auth";
import { db, auth } from "../firebase/config";
import { Job, Sector, User, JobHistory, JobStatus, UserRole, Dentist, JobType, BoxColor, Alert } from "../types";
import { MOCK_SECTORS } from "../constants";

// --- Collections ---
const JOBS_COL = 'jobs';
const SECTORS_COL = 'sectors';
const USERS_COL = 'users';
const DENTISTS_COL = 'dentists';
const JOB_TYPES_COL = 'job_types';
const BOX_COLORS_COL = 'box_colors';
const ALERTS_COL = 'alerts';

// --- Subscriptions ---

export const subscribeToJobs = (callback: (jobs: Job[]) => void) => {
    const q = query(collection(db, JOBS_COL), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
        callback(jobs);
    }, (error) => callback([]));
};

export const subscribeToSectors = (callback: (sectors: Sector[]) => void) => {
    const q = query(collection(db, SECTORS_COL));
    return onSnapshot(q, (snapshot) => {
        const sectors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sector));
        callback(sectors);
    }, (error) => callback([]));
};

export const subscribeToUsers = (callback: (users: User[]) => void) => {
    const q = query(collection(db, USERS_COL));
    return onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        callback(users);
    }, (error) => callback([]));
};

export const subscribeToDentists = (callback: (dentists: Dentist[]) => void) => {
    const q = query(collection(db, DENTISTS_COL), orderBy('name'));
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Dentist));
        callback(data);
    }, (error) => callback([]));
};

export const subscribeToJobTypes = (callback: (types: JobType[]) => void) => {
    const q = query(collection(db, JOB_TYPES_COL), orderBy('name'));
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobType));
        callback(data);
    }, (error) => callback([]));
};

export const subscribeToBoxColors = (callback: (colors: BoxColor[]) => void) => {
    const q = query(collection(db, BOX_COLORS_COL));
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BoxColor));
        callback(data);
    }, (error) => callback([]));
};

export const subscribeToAlerts = (callback: (alerts: Alert[]) => void) => {
    // Busca alertas dos últimos 7 dias para não carregar histórico muito antigo
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const q = query(collection(db, ALERTS_COL), where('targetDate', '>=', sevenDaysAgo.toISOString()));
    
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Alert));
        callback(data);
    }, (error) => callback([]));
};

// --- Auth Logic ---

export const monitorAuthState = (onUserChanged: (user: User | null) => void) => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            try {
                const docRef = doc(db, USERS_COL, firebaseUser.uid);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const userData = docSnap.data() as User;
                    onUserChanged({ ...userData, id: firebaseUser.uid, email: firebaseUser.email || '' });
                } else {
                    onUserChanged(null);
                }
            } catch (error) {
                onUserChanged(null);
            }
        } else {
            onUserChanged(null);
        }
    });
};

export const loginUser = async (email: string, password: string): Promise<void> => {
    await signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async (): Promise<void> => {
    await signOut(auth);
};

export const registerNewUser = async (name: string, email: string, password: string): Promise<User> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid } = userCredential.user;

    let role = UserRole.COLLABORATOR;
    let sectorId = '';
    let existingDocId = null;

    try {
        const q = query(collection(db, USERS_COL), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const existingData = querySnapshot.docs[0].data() as User;
            existingDocId = querySnapshot.docs[0].id;
            role = existingData.role;
            sectorId = existingData.sectorId || '';
        } else {
            try {
                const usersSnapshot = await getDocs(collection(db, USERS_COL));
                if (usersSnapshot.empty) {
                    role = UserRole.ADMIN;
                }
            } catch (e) {}
        }
    } catch (error) {}

    const newUser: User = {
        id: uid,
        name,
        email,
        role,
        sectorId
    };

    await setDoc(doc(db, USERS_COL, uid), newUser);

    if (existingDocId && existingDocId !== uid) {
        try {
            await deleteDoc(doc(db, USERS_COL, existingDocId));
        } catch (e) {}
    }
    
    return newUser;
};

// --- Mutations ---

export const addJobToFirestore = async (job: Omit<Job, 'id'>) => {
    await addDoc(collection(db, JOBS_COL), job);
};

export const updateJobInFirestore = async (jobId: string, updates: Partial<Job>) => {
    const ref = doc(db, JOBS_COL, jobId);
    await updateDoc(ref, updates);
};

export const addSectorToFirestore = async (name: string) => {
    await addDoc(collection(db, SECTORS_COL), { name });
};

export const deleteSectorFromFirestore = async (id: string) => {
    await deleteDoc(doc(db, SECTORS_COL, id));
};

export const addUserToFirestore = async (user: Omit<User, 'id'>) => {
    await addDoc(collection(db, USERS_COL), user);
};

export const updateUserSector = async (userId: string, sectorId: string) => {
    const ref = doc(db, USERS_COL, userId);
    await updateDoc(ref, { sectorId });
};

export const updateUserRole = async (userId: string, role: UserRole) => {
    const ref = doc(db, USERS_COL, userId);
    await updateDoc(ref, { role });
};

export const deleteUserFromFirestore = async (id: string) => {
    await deleteDoc(doc(db, USERS_COL, id));
};

export const addDentistToFirestore = async (dentist: Omit<Dentist, 'id'>) => {
    await addDoc(collection(db, DENTISTS_COL), dentist);
};
export const deleteDentistFromFirestore = async (id: string) => {
    await deleteDoc(doc(db, DENTISTS_COL, id));
};

export const addJobTypeToFirestore = async (name: string) => {
    await addDoc(collection(db, JOB_TYPES_COL), { name });
};
export const deleteJobTypeFromFirestore = async (id: string) => {
    await deleteDoc(doc(db, JOB_TYPES_COL, id));
};

export const addBoxColorToFirestore = async (name: string, hex: string) => {
    await addDoc(collection(db, BOX_COLORS_COL), { name, hex });
};
export const deleteBoxColorFromFirestore = async (id: string) => {
    await deleteDoc(doc(db, BOX_COLORS_COL, id));
};

// === FUNÇÕES DE ALERTA ===

export const addAlertToFirestore = async (alert: Omit<Alert, 'id'>) => {
    await addDoc(collection(db, ALERTS_COL), alert);
};

export const markAlertAsReadInFirestore = async (alertId: string, userId: string) => {
    const ref = doc(db, ALERTS_COL, alertId);
    await updateDoc(ref, {
        readBy: arrayUnion(userId)
    });
};

export const seedDatabaseIfEmpty = async () => {
    try {
        const sectorsSnap = await getDocs(collection(db, SECTORS_COL));
        if (sectorsSnap.empty) {
            const batch = writeBatch(db);
            MOCK_SECTORS.forEach(s => {
                const { id, ...data } = s;
                const ref = doc(collection(db, SECTORS_COL));
                batch.set(ref, data);
            });
            await batch.commit();
        }
    } catch (e) {}
};