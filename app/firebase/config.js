import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, doc, getDoc, getDocs, query, where, setDoc } from "firebase/firestore";

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

// Function to store user in Firestore "Auth" collection
const saveUserToFirestore = async (name, email, userId) => {
  try {
    const userRef = doc(db, "Auth", userId);
    await setDoc(userRef, {
      name,
      email,
      role: "User", // Default role for all new users
      createdAt: new Date().toISOString()
    });
    console.log("User added to Firestore successfully!");
    return true;
  } catch (error) {
    console.error("Error adding user to Firestore:", error);
    return false;
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

// Function to get all users
const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "Auth"));
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
};

// Function to search users by name
const searchUsersByName = async (name) => {
  try {
    const q = query(collection(db, "Auth"), where("name", ">=", name), where("name", "<=", name + "\uf8ff"));
    const querySnapshot = await getDocs(q);
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
};

// Function to get users by role
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
  saveUserToFirestore, 
  getUserById, 
  getAllUsers, 
  searchUsersByName,
  getUsersByRole
};