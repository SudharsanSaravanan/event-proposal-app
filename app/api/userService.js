import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    setDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

/**
 * Save a new user to Firestore "Auth" collection
 */
const saveUserToFirestore = async (name, email, userId, role, department = null) => {
    try {
        const userData = {
            name,
            email,
            role, // No default role - must be specified
            createdAt: serverTimestamp(),
        };

        // Set department based on whether it's provided
        if (department !== null) {
            if (role === 'Reviewer') {
                userData.department = Array.isArray(department)
                    ? department
                    : [department].filter(Boolean);
            } else {
                userData.department = typeof department === 'string' ? department : '';
            }
        }

        await setDoc(doc(db, 'Auth', userId), userData);
        return true;
    } catch (error) {
        console.error('Error adding user to Firestore:', error);
        return false;
    }
};

/**
 * Get a single user by user ID
 */
const getUserById = async (userId) => {
    try {
        const docSnap = await getDoc(doc(db, 'Auth', userId));
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
};

/**
 * Get all users from "Auth" collection
 */
const getAllUsers = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'Auth'));
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting users:', error);
        return [];
    }
};

/**
 * Get users filtered by role
 */
const getUsersByRole = async (role) => {
    try {
        const q = query(collection(db, 'Auth'), where('role', '==', role));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting users by role:', error);
        return [];
    }
};

/**
 * Search users by name
 */
const searchUsersByName = async (name) => {
    try {
        const q = query(
            collection(db, 'Auth'),
            where('name', '>=', name),
            where('name', '<=', name + '\uf8ff')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error searching users by name:', error);
        return [];
    }
};

export { saveUserToFirestore, getUserById, getAllUsers, getUsersByRole, searchUsersByName };
