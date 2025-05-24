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
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

/**
 * Get proposal history
 */
const getProposalHistory = async (proposalId) => {
    try {
        const q = query(
            collection(db, 'Proposals', proposalId, 'History'),
            orderBy('version', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            version: doc.data().version,
            comments: doc.data().comments || [],
            replies: doc.data().replies || [],
            updatedAt: doc.data().updatedAt,
            updatedBy: doc.data().updatedBy,
        }));
    } catch (error) {
        console.error('Error getting proposal history:', error);
        return [];
    }
};

/**
 * Add an entry to the proposal history
 */
const addProposalHistory = async (proposalId, historyData, userId) => {
    try {
        // Remove status and version from history data
        if (historyData.proposalThread) {
            delete historyData.proposalThread.status;
            delete historyData.proposalThread.version;
        }

        await addDoc(collection(db, 'Proposals', proposalId, 'History'), {
            ...historyData,
            updatedAt: serverTimestamp(),
            updatedBy: userId,
            timestamp: serverTimestamp(),
        });
        return true;
    } catch (error) {
        console.error('Error adding proposal history:', error);
        return false;
    }
};

/**
 * Update proposal status and manage history entries
 */
const updateProposalStatus = async (proposalId, newStatus, remarks, userId) => {
    try {
        const proposalRef = doc(db, 'Proposals', proposalId);
        const proposalSnap = await getDoc(proposalRef);

        if (!proposalSnap.exists()) {
            throw new Error('Proposal not found');
        }

        const proposalData = proposalSnap.data();
        let newVersion = proposalData.version || 1;

        // Only increment version if new status is "reviewed" and current status isn't "reviewed"
        if (
            newStatus.toLowerCase() === 'reviewed' &&
            proposalData.status?.toLowerCase() !== 'reviewed'
        ) {
            newVersion = newVersion + 1;

            // When version increments, move current comments and replies to history
            const currentComments = proposalData.comments || [];
            const currentReplies = proposalData.replies || [];

            if (currentComments.length > 0 || currentReplies.length > 0) {
                await addDoc(collection(db, 'Proposals', proposalId, 'History'), {
                    version: proposalData.version || 1,
                    comments: currentComments,
                    replies: currentReplies,
                    updatedAt: serverTimestamp(),
                    updatedBy: userId,
                });
            }

            // Clear current comments and replies for the new version
            await updateDoc(proposalRef, {
                comments: [],
                replies: [],
            });
        }

        // Update the proposal with new status and version if needed
        await updateDoc(proposalRef, {
            status: newStatus,
            updatedAt: serverTimestamp(),
            version: newVersion,
        });

        // Only create history entry if not changing to "reviewed"
        if (newStatus.toLowerCase() !== 'reviewed') {
            // Create a copy for history without status and version
            const proposalForHistory = { ...proposalData };
            delete proposalForHistory.status;
            delete proposalForHistory.version;

            // Check if there's already a history entry for this version
            const historyQuery = query(
                collection(db, 'Proposals', proposalId, 'History'),
                where('version', '==', newVersion)
            );
            const historySnapshot = await getDocs(historyQuery);

            if (!historySnapshot.empty) {
                // Update existing history entry
                const historyDoc = historySnapshot.docs[0];
                await updateDoc(doc(db, 'Proposals', proposalId, 'History', historyDoc.id), {
                    proposalThread: proposalForHistory,
                    updatedAt: serverTimestamp(),
                    remarks: remarks || `Status updated to ${newStatus}`,
                });
            } else {
                // Create new history entry
                await addDoc(collection(db, 'Proposals', proposalId, 'History'), {
                    proposalThread: proposalForHistory,
                    updatedAt: serverTimestamp(),
                    remarks: remarks || `Status updated to ${newStatus}`,
                    version: newVersion,
                    updatedBy: userId,
                });
            }
        }

        return true;
    } catch (error) {
        console.error('Error updating proposal status:', error);
        return false;
    }
};

/**
 * Create or update a history entry when updating a proposal
 */
const manageProposalHistoryOnUpdate = async (proposalId, proposalData, version) => {
    try {
        // Create a copy for history without status and version
        const proposalForHistory = { ...proposalData };
        delete proposalForHistory.status;
        delete proposalForHistory.version;

        // Check if there's already a history entry for this version
        const historyQuery = query(
            collection(db, 'Proposals', proposalId, 'History'),
            where('version', '==', version)
        );

        const historySnapshot = await getDocs(historyQuery);

        if (!historySnapshot.empty) {
            // Update existing history entry
            const historyDoc = historySnapshot.docs[0];
            await updateDoc(doc(db, 'Proposals', proposalId, 'History', historyDoc.id), {
                proposalThread: proposalForHistory,
                updatedAt: serverTimestamp(),
                remarks: 'Proposal updated',
            });
        } else {
            // Create new history entry if one doesn't exist for this version
            await addDoc(collection(db, 'Proposals', proposalId, 'History'), {
                proposalThread: proposalForHistory,
                updatedAt: serverTimestamp(),
                remarks: 'Proposal updated',
                version: version,
            });
        }

        return true;
    } catch (error) {
        console.error('Error managing proposal history on update:', error);
        return false;
    }
};

export {
    getProposalHistory,
    addProposalHistory,
    updateProposalStatus,
    manageProposalHistoryOnUpdate,
};
