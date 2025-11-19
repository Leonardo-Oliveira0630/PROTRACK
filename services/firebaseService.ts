
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
    getDoc
} from "firebase/firestore";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged
} from "firebase/auth";
import { db, auth } from "../firebase/config";
import { Job, Sector, User, JobHistory, JobStatus, UserRole } from "../types";
import { MOCK_SECTORS } from "../constants";

// --- Collections ---
const JOBS_COL = 'jobs';
const SECTORS_COL = 'sectors';
const USERS_COL = 'users';

// --- Subscriptions (Real-time) ---

export const subscribeToJobs = (callback: (jobs: Job[]) => void) => {
    const q = query(collection(db, JOBS_COL), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
        callback(jobs);
    }, (error) => {
        console.warn("Error subscribing to jobs (likely permission issue before login):", error);
        callback([]); // Fallback to empty list if permission denied
    });
};

export const subscribeToSectors = (callback: (sectors: Sector[]) => void) => {
    const q = query(collection(db, SECTORS_COL));
    return onSnapshot(q, (snapshot) => {
        const sectors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sector));
        callback(sectors);
    }, (error) => {
        console.warn("Error subscribing to sectors:", error);
        callback([]);
    });
};

export const subscribeToUsers = (callback: (users: User[]) => void) => {
    const q = query(collection(db, USERS_COL));
    return onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        callback(users);
    }, (error) => {
        console.warn("Error subscribing to users:", error);
        callback([]);
    });
};

// --- Auth Logic ---

export const monitorAuthState = (onUserChanged: (user: User | null) => void) => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            // User is signed in, fetch their profile from Firestore
            try {
                const docRef = doc(db, USERS_COL, firebaseUser.uid);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const userData = docSnap.data() as User;
                    onUserChanged({ ...userData, id: firebaseUser.uid, email: firebaseUser.email || '' });
                } else {
                    // Profile might not exist yet if just registered, handle gracefully
                    console.log("User profile not found in Firestore yet.");
                    onUserChanged(null);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
                onUserChanged(null);
            }
        } else {
            // User is signed out
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
    // 1. Create Auth User
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid } = userCredential.user;

    // 2. Check if this is the FIRST user in the database
    // We use getDocs here. Note: If rules prevent reading users before auth, this works because we are now authenticated as the new user.
    const usersSnapshot = await getDocs(collection(db, USERS_COL));
    const isFirstUser = usersSnapshot.empty;

    const role = isFirstUser ? UserRole.ADMIN : UserRole.COLLABORATOR;

    const newUser: User = {
        id: uid,
        name,
        email,
        role,
        sectorId: '' // Initially no sector
    };

    // 3. Create User Document in Firestore with the same UID as Auth
    await setDoc(doc(db, USERS_COL, uid), newUser);
    
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
    // This is for Admin creating other users manually WITHOUT password (mock placeholder)
    // Real app would likely trigger a Cloud Function to create Auth user
    await addDoc(collection(db, USERS_COL), user);
};

export const deleteUserFromFirestore = async (id: string) => {
    await deleteDoc(doc(db, USERS_COL, id));
};

// --- Seeding (Initial Data) ---
export const seedDatabaseIfEmpty = async () => {
    try {
        const sectorsSnap = await getDocs(collection(db, SECTORS_COL));
        if (sectorsSnap.empty) {
            console.log("Seeding Sectors...");
            const batch = writeBatch(db);
            MOCK_SECTORS.forEach(s => {
                const { id, ...data } = s;
                const ref = doc(collection(db, SECTORS_COL));
                batch.set(ref, data);
            });
            await batch.commit();
        }
    } catch (e) {
        console.warn("Seeding skipped (likely insufficient permissions or already seeded).");
    }
};
