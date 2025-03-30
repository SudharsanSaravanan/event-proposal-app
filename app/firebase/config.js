import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  setDoc,
  orderBy,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Save a new user to Firestore "Auth" collection
 */
const saveUserToFirestore = async (name, email, userId) => {
  try {
    await setDoc(doc(db, "Auth", userId), {
      name,
      email,
      role: "User",
      createdAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error adding user to Firestore:", error);
    return false;
  }
};

/**
 * Get a single user by user ID
 */
const getUserById = async (userId) => {
  try {
    const docSnap = await getDoc(doc(db, "Auth", userId));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
};

/**
 * Get all users from "Auth" collection
 */
const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "Auth"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
};

/**
 * Add a new proposal to Firestore "Proposals" collection
 */
const addProposal = async (proposalData) => {
  try {
    const docRef = await addDoc(collection(db, "Proposals"), {
      ...proposalData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding proposal:", error);
    throw error;
  }
};

/**
 * Get users filtered by role
 */
const getUsersByRole = async (role) => {
  try {
    const q = query(collection(db, "Auth"), where("role", "==", role));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting users by role:", error);
    return [];
  }
};

/**
 * Search users by name
 */
const searchUsersByName = async (name) => {
  try {
    const q = query(collection(db, "Auth"), where("name", ">=", name), where("name", "<=", name + "\uf8ff"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error searching users by name:", error);
    return [];
  }
};

/**
 * Get proposals by user ID
 */
const getProposalsByUserId = async (userId) => {
  try {
    const q = query(
      collection(db, "Proposals"),
      where("proposerId", "==", userId),
      orderBy("updatedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting proposals by user ID:", error);
    return [];
  }
};

/**
 * Get proposals submitted by a specific user
 */
const getUserProposals = async (userId) => {
  try {
    // Add check to prevent query with undefined userId
    if (!userId) {
      console.warn("getUserProposals called without a valid userId");
      return [];
    }
    
    const q = query(collection(db, "Proposals"), where("proposerId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching user proposals:", error);
    return [];
  }
};

/**
 * Get a single proposal by proposal ID
 */
const getProposalById = async (proposalId) => {
  try {
    const docSnap = await getDoc(doc(db, "Proposals", proposalId));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error("Error getting proposal:", error);
    return null;
  }
};

/**
 * Get proposal history
 */
const getProposalHistory = async (proposalId) => {
  try {
    const q = query(collection(db, "Proposals", proposalId, "history"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting proposal history:", error);
    return [];
  }
};

/**
 * Update proposal status and store in history
 */
const updateProposalStatus = async (proposalId, status, remarks, userId) => {
  try {
    const proposalRef = doc(db, "Proposals", proposalId);
    await updateDoc(proposalRef, { status, updatedAt: serverTimestamp() });
    
    await addDoc(collection(db, "Proposals", proposalId, "history"), {
      status,
      timestamp: serverTimestamp(),
      remarks: remarks || "",
      updatedBy: userId
    });
    
    return true;
  } catch (error) {
    console.error("Error updating proposal status:", error);
    return false;
  }
};

export {
  app,
  auth,
  db,
  saveUserToFirestore,
  getUserById,
  getAllUsers,
  searchUsersByName,
  getUsersByRole,
  getProposalById,
  getProposalHistory,
  getProposalsByUserId, 
  addProposal,
  getUserProposals,
  updateProposalStatus
};