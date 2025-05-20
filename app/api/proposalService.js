import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    deleteField,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

/**
 * Add a new proposal to Firestore "Proposals" collection
 */
const addProposal = async (proposalData) => {
    try {
        // Create a copy without id
        const { id, ...dataToStore } = proposalData;

        // Initialize comments as empty array
        dataToStore.comments = [];

        // Use the document reference to add the document
        const docRef = await addDoc(collection(db, 'Proposals'), {
            ...dataToStore,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return docRef.id; // Return the Firestore-generated ID
    } catch (error) {
        console.error('Error adding proposal:', error);
        throw error;
    }
};

/**
 * Get a single proposal by proposal ID
 */
const getProposalById = async (proposalId) => {
    try {
        const docSnap = await getDoc(doc(db, 'Proposals', proposalId));
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
        console.error('Error getting proposal:', error);
        return null;
    }
};

/**
 * Get proposals by user ID
 */
const getProposalsByUserId = async (userId) => {
    try {
        const q = query(
            collection(db, 'Proposals'),
            where('proposerId', '==', userId),
            orderBy('updatedAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting proposals by user ID:', error);
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
            console.warn('getUserProposals called without a valid userId');
            return [];
        }

        // Use a simpler query without orderBy
        const q = query(collection(db, 'Proposals'), where('proposerId', '==', userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching user proposals:', error);
        return [];
    }
};

/**
 * Update an existing proposal with new data
 */
const updateProposal = async (proposalId, proposalData) => {
    try {
        // Remove the id field if it exists before updating
        const { id, ...dataToUpdate } = proposalData;

        const proposalRef = doc(db, 'Proposals', proposalId);

        // Get current proposal to check version
        const currentProposal = await getDoc(proposalRef);
        const currentData = currentProposal.exists() ? currentProposal.data() : null;

        if (!currentData) {
            throw new Error('Proposal not found');
        }

        // Always maintain the same version unless status changes to "reviewed"
        const version =
            dataToUpdate.status?.toLowerCase() === 'reviewed' &&
            currentData.status?.toLowerCase() !== 'reviewed'
                ? (currentData.version || 1) + 1
                : currentData.version || 1;

        // Update the proposal document
        await updateDoc(proposalRef, {
            ...dataToUpdate,
            version,
            updatedAt: serverTimestamp(),
        });

        return true;
    } catch (error) {
        console.error('Error updating proposal:', error);
        return false;
    }
};

/**
 * Add reply to a proposal (for proposers)
 */
const addProposalReply = async (proposalId, replyText, proposerName) => {
    try {
        const proposalRef = doc(db, 'Proposals', proposalId);
        const proposalSnap = await getDoc(proposalRef);

        if (!proposalSnap.exists()) {
            throw new Error('Proposal not found');
        }

        const proposalData = proposalSnap.data();
        const currentReplies = proposalData.replies || [];

        const newReply = {
            text: replyText,
            proposerName: proposerName,
            timestamp: new Date(),
        };

        await updateDoc(proposalRef, {
            replies: [...currentReplies, newReply],
            updatedAt: serverTimestamp(),
        });

        return true;
    } catch (error) {
        console.error('Error adding proposal reply:', error);
        throw error;
    }
};

export {
    addProposal,
    getProposalById,
    getProposalsByUserId,
    getUserProposals,
    updateProposal,
    addProposalReply,
    deleteField,
};
