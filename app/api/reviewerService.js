import {
    doc,
    getDoc,
    getDocs,
    collection,
    query,
    updateDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';

/**
 * Check if user is a reviewer
 */
const isUserReviewer = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, 'Auth', uid));
        if (!userDoc.exists()) return false;

        const userData = userDoc.data();
        return userData.role === 'Reviewer';
    } catch (error) {
        console.error('Error checking reviewer status:', error);
        return false;
    }
};

/**
 * Get reviewer info
 */
const getReviewerInfo = async (uid) => {
    try {
        const userRef = doc(db, 'Auth', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            return {
                ...userData,
                // Ensure department is always an array for reviewers
                department:
                    userData.role === 'Reviewer'
                        ? Array.isArray(userData.department)
                            ? userData.department
                            : [userData.department].filter(Boolean)
                        : userData.department || '', // Single string for non-reviewers
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting reviewer info:', error);
        return null;
    }
};

/**
 * Get proposals for a reviewer based on their departments
 */
const getReviewerProposals = async (departments) => {
    try {
        if (!departments || departments.length === 0) {
            console.error('No departments specified for reviewer');
            return [];
        }

        // Check if departments is an array
        if (!Array.isArray(departments)) {
            console.error('Departments is not an array:', departments);
            // Try to convert to array if it's an object with numeric keys
            if (typeof departments === 'object') {
                departments = Object.values(departments);
            } else {
                // If it's a string, put it in an array
                departments = [departments];
            }
        }

        // Get all proposals first
        const proposalsRef = collection(db, 'Proposals');
        const proposalsSnapshot = await getDocs(proposalsRef);

        // Filter proposals that match any of the reviewer's departments
        const proposals = [];

        proposalsSnapshot.forEach((doc) => {
            const proposalData = doc.data();
            const proposalDept = proposalData.department;

            // Check if this proposal's department is in the reviewer's departments
            if (proposalDept && departments.includes(proposalDept)) {
                proposals.push({
                    id: doc.id,
                    ...proposalData,
                });
            }
        });

        return proposals;
    } catch (error) {
        console.error('Error fetching reviewer proposals:', error);
        throw error;
    }
};

/**
 * Update proposal status (for reviewers)
 */
const updateProposalStatusReviewer = async (proposalId, status, comment) => {
    try {
        const proposalRef = doc(db, 'Proposals', proposalId);
        const proposalSnap = await getDoc(proposalRef);

        if (!proposalSnap.exists()) {
            throw new Error('Proposal not found');
        }

        const proposalData = proposalSnap.data();
        const currentComments = proposalData.comments || [];

        // Get reviewer info from Auth collection
        const reviewerInfo = await getReviewerInfo(auth.currentUser.uid);

        const newComment = {
            text: comment,
            reviewerName: reviewerInfo?.name || 'Unknown',
            timestamp: new Date(),
            status: status,
        };

        await updateDoc(proposalRef, {
            status: status,
            updatedAt: serverTimestamp(),
            reviewedBy: auth.currentUser.uid,
            reviewedAt: serverTimestamp(),
            comments: [...currentComments, newComment],
        });

        return true;
    } catch (error) {
        console.error('Error updating proposal status:', error);
        throw error;
    }
};

export { isUserReviewer, getReviewerInfo, getReviewerProposals, updateProposalStatusReviewer };
