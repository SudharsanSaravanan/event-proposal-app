// config.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, getDocs, query, where, setDoc } from "firebase/firestore";

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

// Initialize Firebase (only initialize once)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Function to get a user's role by ID (used for role-based redirection)
const getUserRole = async (userId) => {
  try {
    const userRef = doc(db, "Auth", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data().role || "User";
    } else {
      console.log("User document not found");
      return null;
    }
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
};

// Function to get a single user by ID
const getUserById = async (userId) => {
  try {
    const docRef = doc(db, "Auth", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.log("No such user!");
      return null;
    }
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
};

// Function to get users by role (for admin panel)
const getUsersByRole = async (role) => {
  try {
    const q = query(collection(db, "Auth"), where("role", "==", role));
    const querySnapshot = await getDocs(q);
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    console.error("Error getting users by role:", error);
    return [];
  }
};

export {
  app,
  auth,
  db,
  getUserRole,
  getUserById,
  getUsersByRole,
};