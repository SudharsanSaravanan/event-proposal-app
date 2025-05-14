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
  serverTimestamp,
  deleteField
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

//Save a new user to Firestore "Auth" collection
const saveUserToFirestore = async (name, email, userId, role, department = null) => {
  try {
    const userData = {
      name,
      email,
      role, // No default role - must be specified
      createdAt: serverTimestamp()
    };

    // Set department based on whether it's provided
    if (department !== null) {
      if (role === "Reviewer") {
        userData.department = Array.isArray(department) ? department : [department].filter(Boolean);
      } else {
        userData.department = typeof department === 'string' ? department : "";
      }
    }

    await setDoc(doc(db, "Auth", userId), userData);
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


 //Add a new proposal to Firestore "Proposals" collection


const addProposal = async (proposalData) => {
  try {
    // Create a copy without id
    const { id, ...dataToStore } = proposalData;
    
    // Initialize comments as empty array
    dataToStore.comments = [];
    
    // Use the document reference to add the document
    const docRef = await addDoc(collection(db, "Proposals"), {
      ...dataToStore,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return docRef.id; // Return the Firestore-generated ID
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
    
    // Use a simpler query without orderBy
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
    const q = query(collection(db, "Proposals", proposalId, "History"), orderBy("version", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      version: doc.data().version,
      comments: doc.data().comments || [],
      replies: doc.data().replies || [],
      updatedAt: doc.data().updatedAt,
      updatedBy: doc.data().updatedBy
    }));
  } catch (error) {
    console.error("Error getting proposal history:", error);
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
    
    await addDoc(collection(db, "Proposals", proposalId, "History"), {
      ...historyData,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
      timestamp: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error adding proposal history:", error);
    return false;
  }
};

/**
 * Update proposal status and manage history entries
 */
const updateProposalStatus = async (proposalId, newStatus, remarks, userId) => {
  try {
    const proposalRef = doc(db, "Proposals", proposalId);
    const proposalSnap = await getDoc(proposalRef);
    
    if (!proposalSnap.exists()) {
      throw new Error("Proposal not found");
    }
    
    const proposalData = proposalSnap.data();
    let newVersion = proposalData.version || 1;
    
    // Only increment version if new status is "reviewed" and current status isn't "reviewed"
    if (newStatus.toLowerCase() === "reviewed" && 
        proposalData.status?.toLowerCase() !== "reviewed") {
      newVersion = newVersion + 1;
      
      // When version increments, move current comments and replies to history
      const currentComments = proposalData.comments || [];
      const currentReplies = proposalData.replies || [];
      
      if (currentComments.length > 0 || currentReplies.length > 0) {
        await addDoc(collection(db, "Proposals", proposalId, "History"), {
          version: proposalData.version || 1,
          comments: currentComments,
          replies: currentReplies,
          updatedAt: serverTimestamp(),
          updatedBy: userId
        });
      }
      
      // Clear current comments and replies for the new version
      await updateDoc(proposalRef, {
        comments: [],
        replies: []
      });
    }

    
    // Update the proposal with new status and version if needed
    await updateDoc(proposalRef, { 
      status: newStatus, 
      updatedAt: serverTimestamp(),
      version: newVersion
    });
    
    // Only create history entry if not changing to "reviewed"
    if (newStatus.toLowerCase() !== "reviewed") {
      // Create a copy for history without status and version
      const proposalForHistory = { ...proposalData };
      delete proposalForHistory.status;
      delete proposalForHistory.version;
      
      // Check if there's already a history entry for this version
      const historyQuery = query(
        collection(db, "Proposals", proposalId, "History"),
        where("version", "==", newVersion)
      );
      const historySnapshot = await getDocs(historyQuery);
      
      if (!historySnapshot.empty) {
        // Update existing history entry
        const historyDoc = historySnapshot.docs[0];
        await updateDoc(doc(db, "Proposals", proposalId, "History", historyDoc.id), {
          proposalThread: proposalForHistory,
          updatedAt: serverTimestamp(),
          remarks: remarks || `Status updated to ${newStatus}`
        });
      } else {
        // Create new history entry
        await addDoc(collection(db, "Proposals", proposalId, "History"), {
          proposalThread: proposalForHistory,
          updatedAt: serverTimestamp(),
          remarks: remarks || `Status updated to ${newStatus}`,
          version: newVersion,
          updatedBy: userId
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error updating proposal status:", error);
    return false;
  }
};

/**
 * Update an existing proposal with new data
 */
const updateProposal = async (proposalId, proposalData) => {
  try {
    // Remove the id field if it exists before updating
    const { id, ...dataToUpdate } = proposalData;
    
    const proposalRef = doc(db, "Proposals", proposalId);
    
    // Get current proposal to check version
    const currentProposal = await getDoc(proposalRef);
    const currentData = currentProposal.exists() ? currentProposal.data() : null;
    
    if (!currentData) {
      throw new Error("Proposal not found");
    }
    
    // Always maintain the same version unless status changes to "reviewed"
    const version = dataToUpdate.status?.toLowerCase() === "reviewed" && 
                  currentData.status?.toLowerCase() !== "reviewed" 
                ? (currentData.version || 1) + 1 
                : currentData.version || 1;
    
    // Update the proposal document
    await updateDoc(proposalRef, {
      ...dataToUpdate,
      version,
      updatedAt: serverTimestamp()
    });
    
    // Create a copy for history without status and version
    const proposalForHistory = { ...dataToUpdate };
    delete proposalForHistory.status;
    delete proposalForHistory.version;
    
    // Check if there's already a history entry for this version
    const historyQuery = query(
      collection(db, "Proposals", proposalId, "History"),
      where("version", "==", version)
    );
    
    const historySnapshot = await getDocs(historyQuery);
    
    if (!historySnapshot.empty) {
      // Update existing history entry
      const historyDoc = historySnapshot.docs[0];
      await updateDoc(doc(db, "Proposals", proposalId, "History", historyDoc.id), {
        proposalThread: proposalForHistory,
        updatedAt: serverTimestamp(),
        remarks: "Proposal updated"
      });
    } else {
      // Create new history entry if one doesn't exist for this version
      await addDoc(collection(db, "Proposals", proposalId, "History"), {
        proposalThread: proposalForHistory,
        updatedAt: serverTimestamp(),
        remarks: "Proposal updated",
        version: version
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error updating proposal:", error);
    return false;
  }
};

// Check if user is a reviewer
async function isUserReviewer(uid) {
  try {
    const userDoc = await getDoc(doc(db, "Auth", uid));
    if (!userDoc.exists()) return false;
    
    const userData = userDoc.data();
    return userData.role === "Reviewer";
  } catch (error) {
    console.error("Error checking reviewer status:", error);
    return false;
  }
}
// Get reviewer info
async function getReviewerInfo(uid) {
  try {
    const userRef = doc(db, "Auth", uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return {
        ...userData,
        // Ensure department is always an array for reviewers
        department: userData.role === "Reviewer" 
          ? (Array.isArray(userData.department) 
              ? userData.department 
              : [userData.department].filter(Boolean))
          : userData.department || "" // Single string for non-reviewers
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting reviewer info:", error);
    return null;
  }
}

// Get proposals for a reviewer based on their departments
async function getReviewerProposals(departments) {
  try {
    
    if (!departments || departments.length === 0) {
      console.error("No departments specified for reviewer");
      return [];
    }
    
    // Check if departments is an array
    if (!Array.isArray(departments)) {
      console.error("Departments is not an array:", departments);
      // Try to convert to array if it's an object with numeric keys
      if (typeof departments === 'object') {
        departments = Object.values(departments);
      } else {
        // If it's a string, put it in an array
        departments = [departments];
      }
    }

    // Get all proposals first
    const proposalsRef = collection(db, "Proposals");
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
          ...proposalData
        });
      }
    });
    
    return proposals;
  } catch (error) {
    console.error("Error fetching reviewer proposals:", error);
    throw error;
  }
}

// Update proposal status (for reviewers)
async function updateProposalStatusReviewer(proposalId, status, comment) {
  try {
    const proposalRef = doc(db, "Proposals", proposalId);
    const proposalSnap = await getDoc(proposalRef);
    
    if (!proposalSnap.exists()) {
      throw new Error("Proposal not found");
    }
    
    const proposalData = proposalSnap.data();
    const currentComments = proposalData.comments || [];
    
    // Get reviewer info from Auth collection
    const reviewerInfo = await getReviewerInfo(auth.currentUser.uid);
    
    const newComment = {
      text: comment,
      reviewerName: reviewerInfo?.name || 'Unknown',
      timestamp: new Date(),
      status: status
    };
    
    await updateDoc(proposalRef, {
      status: status,
      updatedAt: serverTimestamp(),
      reviewedBy: auth.currentUser.uid,
      reviewedAt: serverTimestamp(),
      comments: [...currentComments, newComment]
    });
    
    return true;
  } catch (error) {
    console.error("Error updating proposal status:", error);
    throw error;
  }
}

// Add reply to a proposal (for proposers)
async function addProposalReply(proposalId, replyText, proposerName) {
  try {
    const proposalRef = doc(db, "Proposals", proposalId);
    const proposalSnap = await getDoc(proposalRef);
    
    if (!proposalSnap.exists()) {
      throw new Error("Proposal not found");
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
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error adding proposal reply:", error);
    throw error;
  }
}

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
  updateProposalStatus,
  addProposalHistory,
  updateProposal,
  deleteField,
  isUserReviewer,
  getReviewerInfo,
  getReviewerProposals,
  updateProposalStatusReviewer,
  addProposalReply
};