import { useState, useEffect } from "react";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  BarChart4, 
  Calendar, 
  Users, 
  DollarSign,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  History,
  ChevronRight
} from "lucide-react";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase/config";
import { useRouter } from "next/navigation";

export default function ProposalTrackingContent({ proposalId, onBack }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedProposal, setExpandedProposal] = useState(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [singleProposalView, setSingleProposalView] = useState(false);
  // State variables for version history
  const [showFullHistory, setShowFullHistory] = useState({});
  const [maxDisplayedVersions, setMaxDisplayedVersions] = useState(2);
  
  const auth = getAuth();
  const router = useRouter();

  // Toggle expansion of proposal details
  const toggleExpand = (id) => {
    if (!singleProposalView) {
      setExpandedProposal(expandedProposal === id ? null : id);
    }
  };

  // Toggle showing full version history for a specific proposal
  const toggleFullHistory = (id) => {
    setShowFullHistory(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Handle back to all proposals
  const handleBackToAll = () => {
    if (onBack) {
      onBack();
    } else {
      router.push("/proposaltracking");
    }
  };

  // Fetch data from Firebase when component mounts
  useEffect(() => {
    const fetchProposals = async () => {
      if (!auth.currentUser) {
        console.error("User not authenticated!");
        setLoading(false);
        return;
      }

      try {
        let fetchedProposals = [];

        // If a specific proposalId is provided, fetch only that proposal
        if (proposalId) {
          setSingleProposalView(true);
          const proposalDoc = await getDoc(doc(db, "Proposals", proposalId));
          
          // Check if document exists and belongs to the current user
          if (proposalDoc.exists() && proposalDoc.data().proposerId === auth.currentUser.uid) {
            // Get the main proposal data
            const proposalData = {
              id: proposalDoc.id,
              ...proposalDoc.data()
            };
            
            // Fetch history collection for this proposal
            const historyCollectionRef = collection(db, "Proposals", proposalId, "History");
            const historySnapshot = await getDocs(historyCollectionRef);
            
            // Get history entries and add them to proposal thread
            let historyEntries = [];
            historySnapshot.forEach(doc => {
              historyEntries.push({
                id: doc.id,
                ...doc.data()
              });
            });
            
            // Sort history entries by version
            historyEntries.sort((a, b) => {
              const versionA = a.version ? parseInt(a.version) : 0;
              const versionB = b.version ? parseInt(b.version) : 0;
              return versionB - versionA; // Descending order
            });
            
            // Extract thread data from history entries
            let proposalThread = [];
            historyEntries.forEach(entry => {
              // Check if this entry has a thread and it's well-formed
              if (entry.proposalThread) {
                // If it's an object, convert to array format we expect
                if (typeof entry.proposalThread === 'object' && !Array.isArray(entry.proposalThread)) {
                  const threadItem = {
                    status: entry.proposalThread.status || proposalData.status,
                    timestamp: entry.updatedAt,
                    updatedBy: entry.proposalThread.updatedBy || "User",
                    remarks: entry.remarks || "Proposal updated",
                    version: entry.version
                  };
                  proposalThread.push(threadItem);
                } else if (Array.isArray(entry.proposalThread)) {
                  // If it's already an array, use it directly
                  proposalThread = [...proposalThread, ...entry.proposalThread];
                }
              } else {
                // Create a simple thread item from the history entry itself
                proposalThread.push({
                  status: proposalData.status,
                  timestamp: entry.updatedAt,
                  updatedBy: "User",
                  remarks: entry.remarks || "Proposal updated",
                  version: entry.version
                });
              }
            });
            
            // If no history entries, add initial creation entry
            if (proposalThread.length === 0 && proposalData.createdAt) {
              proposalThread.push({
                status: "Created",
                timestamp: proposalData.createdAt,
                updatedBy: "User",
                remarks: "Proposal created",
                version: "1"
              });
            }
            
            // Add the thread to the proposal data
            proposalData.proposalThread = proposalThread;
            fetchedProposals = [proposalData];
            
            // Auto-expand the single proposal
            setExpandedProposal(proposalId);
          }
        } else {
          // Otherwise fetch all proposals for the user
          setSingleProposalView(false);
          const proposalsRef = collection(db, "Proposals");
          const q = query(proposalsRef, where("proposerId", "==", auth.currentUser.uid));
          const querySnapshot = await getDocs(q);
          
          // Process each proposal and fetch its history
          const proposalPromises = [];
          querySnapshot.forEach((doc) => {
            const proposalData = {
              id: doc.id,
              ...doc.data()
            };
            
            // Create a promise to fetch history for this proposal
            const historyPromise = getDocs(collection(db, "Proposals", doc.id, "History"))
              .then(historySnapshot => {
                let historyEntries = [];
                historySnapshot.forEach(historyDoc => {
                  historyEntries.push({
                    id: historyDoc.id,
                    ...historyDoc.data()
                  });
                });
                
                // Sort and process history entries
                historyEntries.sort((a, b) => {
                  const versionA = a.version ? parseInt(a.version) : 0;
                  const versionB = b.version ? parseInt(b.version) : 0;
                  return versionB - versionA;
                });
                
                // Create thread array from history entries
                let proposalThread = [];
                historyEntries.forEach(entry => {
                  if (entry.proposalThread) {
                    if (typeof entry.proposalThread === 'object' && !Array.isArray(entry.proposalThread)) {
                      const threadItem = {
                        status: entry.proposalThread.status || proposalData.status,
                        timestamp: entry.updatedAt,
                        updatedBy: entry.proposalThread.updatedBy || "User",
                        remarks: entry.remarks || "Proposal updated",
                        version: entry.version
                      };
                      proposalThread.push(threadItem);
                    } else if (Array.isArray(entry.proposalThread)) {
                      proposalThread = [...proposalThread, ...entry.proposalThread];
                    }
                  } else {
                    proposalThread.push({
                      status: proposalData.status,
                      timestamp: entry.updatedAt,
                      updatedBy: "User",
                      remarks: entry.remarks || "Proposal updated",
                      version: entry.version
                    });
                  }
                });
                
                // Add initial creation entry if no history exists
                if (proposalThread.length === 0 && proposalData.createdAt) {
                  proposalThread.push({
                    status: "Created",
                    timestamp: proposalData.createdAt,
                    updatedBy: "User",
                    remarks: "Proposal created",
                    version: "1"
                  });
                }
                
                proposalData.proposalThread = proposalThread;
                return proposalData;
              });
            
            proposalPromises.push(historyPromise);
          });
          
          // Wait for all history fetches to complete
          fetchedProposals = await Promise.all(proposalPromises);
        }
        
        // Initialize showFullHistory state for each proposal
        let initialFullHistoryState = {};
        fetchedProposals.forEach(proposal => {
          initialFullHistoryState[proposal.id] = false;
        });
        setShowFullHistory(initialFullHistoryState);
        
        setProposals(fetchedProposals);
        
        // Calculate statistics
        setStatistics({
          total: fetchedProposals.length,
          pending: fetchedProposals.filter(p => p.status === "Pending").length,
          approved: fetchedProposals.filter(p => p.status === "Approved").length,
          rejected: fetchedProposals.filter(p => p.status === "Rejected").length
        });
        
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch proposals:", err);
        console.log("Error details:", err.code, err.message);
        console.log("Current user:", auth.currentUser?.uid);
        setLoading(false);
      }
    };

    fetchProposals();
  }, [auth.currentUser, proposalId, router]);

  // Filter proposals based on selected filter
  const filteredProposals = filter === "all" 
    ? proposals 
    : proposals.filter(proposal => {
        // Transform filter to match the case in your data
        let filterStatus = filter;
        if (filter === "pending") filterStatus = "Pending";
        if (filter === "approved") filterStatus = "Approved";
        if (filter === "rejected") filterStatus = "Rejected";
        
        return proposal.status === filterStatus;
      });

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <CheckCircle size={18} className="text-green-500" />;
      case "rejected":
        return <XCircle size={18} className="text-red-500" />;
      case "pending":
      case "pending review":
        return <Clock size={18} className="text-yellow-500" />;
      case "under review":
        return <Clock size={18} className="text-blue-500" />;
      case "requested changes":
        return <AlertCircle size={18} className="text-orange-500" />;
      case "created":
        return <CheckCircle size={18} className="text-blue-500" />;
      default:
        return <AlertCircle size={18} className="text-gray-500" />;
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "No date";
    
    // Handle Firestore timestamps
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }
    
    // Handle string timestamps
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleString();
    }
    
    return "Invalid date";
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">Approved</span>;
      case "rejected":
        return <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">Rejected</span>;
      case "under review":
        return <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">Under Review</span>;
      case "requested changes":
        return <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded-full">Changes Requested</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">Pending Review</span>;
    }
  };

  // Sort proposal threads by version number (descending)
  const sortThreadsByVersion = (threads) => {
    if (!Array.isArray(threads)) return [];
    
    return [...threads].sort((a, b) => {
      const versionA = a.version ? parseInt(a.version) : 0;
      const versionB = b.version ? parseInt(b.version) : 0;
      return versionB - versionA; // Descending order
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-white">Loading proposal tracking data...</div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">
          {singleProposalView ? "Proposal Tracking Details" : "Proposal Tracking"}
        </h1>
        
        {singleProposalView && (
          <button 
            onClick={handleBackToAll}
            className="flex items-center text-blue-400 hover:text-blue-300 transition"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to all proposals
          </button>
        )}
      </div>
      
      {/* Statistics Dashboard - Only show when not viewing a specific proposal */}
      {!singleProposalView && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg shadow-md text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Proposals</p>
                <p className="text-2xl font-bold">{statistics.total}</p>
              </div>
              <BarChart4 size={24} className="text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg shadow-md text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending Review</p>
                <p className="text-2xl font-bold">{statistics.pending}</p>
              </div>
              <Clock size={24} className="text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg shadow-md text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Approved</p>
                <p className="text-2xl font-bold">{statistics.approved}</p>
              </div>
              <CheckCircle size={24} className="text-green-400" />
            </div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg shadow-md text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Rejected</p>
                <p className="text-2xl font-bold">{statistics.rejected}</p>
              </div>
              <XCircle size={24} className="text-red-400" />
            </div>
          </div>
        </div>
      )}
      
      {/* Filter Controls - Only show when not viewing a specific proposal */}
      {!singleProposalView && (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-6 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <Filter size={16} />
            <span className="font-medium">Filter Proposals</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setFilter("all")} 
              className={`px-3 py-1 rounded-md text-sm ${filter === "all" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
            >
              All Proposals
            </button>
            <button 
              onClick={() => setFilter("pending")} 
              className={`px-3 py-1 rounded-md text-sm ${filter === "pending" ? "bg-yellow-600" : "bg-gray-700 hover:bg-gray-600"}`}
            >
              Pending
            </button>
            <button 
              onClick={() => setFilter("approved")} 
              className={`px-3 py-1 rounded-md text-sm ${filter === "approved" ? "bg-green-600" : "bg-gray-700 hover:bg-gray-600"}`}
            >
              Approved
            </button>
            <button 
              onClick={() => setFilter("rejected")} 
              className={`px-3 py-1 rounded-md text-sm ${filter === "rejected" ? "bg-red-600" : "bg-gray-700 hover:bg-gray-600"}`}
            >
              Rejected
            </button>
          </div>
        </div>
      )}
      
      {/* Proposals List */}
      {singleProposalView && proposals.length === 0 ? (
        <div className="bg-gray-800 p-6 rounded-lg text-center text-gray-400">
          <p>Proposal not found or you don't have permission to view it.</p>
        </div>
      ) : !singleProposalView && filteredProposals.length === 0 ? (
        <div className="bg-gray-800 p-6 rounded-lg text-center text-gray-400">
          <p>No proposals matching the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {(singleProposalView ? proposals : filteredProposals).map(proposal => (
            <div key={proposal.id} className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {/* Proposal Header - Clickable to expand/collapse only in multiple proposals view */}
              <div 
                className={`p-4 border-b border-gray-700 ${!singleProposalView ? "cursor-pointer hover:bg-gray-700" : ""} transition-colors`}
                onClick={() => toggleExpand(proposal.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h2 className="text-xl font-semibold text-white">{proposal.title}</h2>
                      {!singleProposalView && (
                        expandedProposal === proposal.id ? 
                          <ChevronUp size={20} className="ml-2 text-gray-400" /> : 
                          <ChevronDown size={20} className="ml-2 text-gray-400" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {proposal.isEvent && (
                        <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                          Event
                        </span>
                      )}
                      {proposal.isTechnical && (
                        <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                          Technical
                        </span>
                      )}
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full flex items-center">
                        <Users size={12} className="mr-1" />
                        {proposal.maxSeats || "N/A"} seats
                      </span>
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full flex items-center">
                        <DollarSign size={12} className="mr-1" />
                        ₹{proposal.registrationFee || "0"}
                      </span>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(proposal.status)}
                  </div>
                </div>
              </div>
              
              {/* Collapsible Proposal Details Section - Always expanded in single proposal view */}
              {(expandedProposal === proposal.id || singleProposalView) && (
                <div className="bg-gray-700">
                  {/* Scrollable Details Section */}
                  <div className="p-4 max-h-96 overflow-y-auto text-white">
                    <h3 className="font-medium mb-3">Proposal Details</h3>
                    
                    <div className="space-y-4 text-gray-300">
                      <div>
                        <h4 className="text-sm font-medium text-gray-200">Description:</h4>
                        <p className="text-sm mt-1">{proposal.description || "No description provided."}</p>
                      </div>
                      
                      {proposal.objectives && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-200">Objectives:</h4>
                          <p className="text-sm mt-1">
                            {Array.isArray(proposal.objectives) ? (
                              <ul className="list-disc pl-5 space-y-1">
                                {proposal.objectives.map((obj, idx) => (
                                  <li key={idx}>{obj}</li>
                                ))}
                              </ul>
                            ) : proposal.objectives}
                          </p>
                        </div>
                      )}
                      
                      {proposal.outcomes && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-200">Expected Outcomes:</h4>
                          <p className="text-sm mt-1">
                            {Array.isArray(proposal.outcomes) ? (
                              <ul className="list-disc pl-5 space-y-1">
                                {proposal.outcomes.map((outcome, idx) => (
                                  <li key={idx}>{outcome}</li>
                                ))}
                              </ul>
                            ) : proposal.outcomes}
                          </p>
                        </div>
                      )}
                      
                      {proposal.participantEngagement && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-200">Participant Engagement:</h4>
                          <p className="text-sm mt-1">{proposal.participantEngagement}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {proposal.duration && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-200">Duration:</h4>
                            <p className="text-sm mt-1">{proposal.duration}</p>
                          </div>
                        )}
                        
                        {proposal.registrationFee !== undefined && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-200">Registration Fee:</h4>
                            <p className="text-sm mt-1">₹{proposal.registrationFee || "Free"}</p>
                          </div>
                        )}
                        
                        {proposal.maxSeats && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-200">Maximum Seats:</h4>
                            <p className="text-sm mt-1">{proposal.maxSeats}</p>
                          </div>
                        )}
                        
                        {proposal.estimatedBudget && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-200">Estimated Budget:</h4>
                            <p className="text-sm mt-1">₹{proposal.estimatedBudget}</p>
                          </div>
                        )}
                        
                        {proposal.potentialFundingSource && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-200">Funding Source:</h4>
                            <p className="text-sm mt-1">{proposal.potentialFundingSource}</p>
                          </div>
                        )}
                        
                        {proposal.resourcePersonDetails && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-200">Resource Person:</h4>
                            <p className="text-sm mt-1">{proposal.resourcePersonDetails}</p>
                          </div>
                        )}
                        
                        {proposal.externalResources && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-200">External Resources:</h4>
                            <p className="text-sm mt-1">{proposal.externalResources}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Proposal Thread/Timeline Section */}
                  <div className="p-4 border-t border-gray-600 text-white">
                    <h3 className="font-medium mb-3 flex items-center">
                      <History size={16} className="mr-2" />
                      Proposal History & Timeline
                    </h3>
                    
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-300">
                        <span className="font-medium">Created:</span> {formatTimestamp(proposal.createdAt)}
                      </p>
                      <p className="text-xs text-gray-300">
                        <span className="font-medium">Last Updated:</span> {formatTimestamp(proposal.updatedAt)}
                      </p>
                    </div>
                    
                    <div className="relative pl-8 border-l-2 border-gray-600 max-h-64 overflow-y-auto pr-2 pb-2">
                      {Array.isArray(proposal.proposalThread) && proposal.proposalThread.length > 0 ? (
                        <>
                          {/* Display sorted thread items based on showFullHistory state */}
                          {sortThreadsByVersion(proposal.proposalThread)
                            .slice(0, showFullHistory[proposal.id] ? proposal.proposalThread.length : maxDisplayedVersions)
                            .map((thread, index) => (
                              <div key={index} className="relative mb-4">
                                <div className="absolute top-0 -left-10 bg-gray-700 p-1 rounded-full border-2 border-gray-600">
                                  {getStatusIcon(thread.status)}
                                </div>
                                <div className="bg-gray-800 p-3 rounded-md border border-gray-600">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-medium text-blue-400 capitalize">{thread.status || "Update"}</h4>
                                    <span className="text-xs text-gray-400">
                                      {formatTimestamp(thread.timestamp || thread.updatedAt)}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-xs text-gray-400 mb-2">
                                    <span>By: {thread.updatedBy || "User"}</span>
                                    {(thread.version || thread.Version) && (
                                      <span className="ml-3 px-2 py-0.5 bg-gray-700 rounded-full">Version {thread.version || thread.Version}</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-300">{thread.remarks || "No remarks provided"}</p>
                                  
                                  {/* If this thread entry contains change details */}
                                  {typeof thread === 'object' && Object.keys(thread).some(key => 
                                    !['status', 'timestamp', 'updatedAt', 'updatedBy', 'remarks', 'version', 'Version', 'id'].includes(key)
                                  ) && (
                                    <div className="mt-3 pt-3 border-t border-gray-700">
                                      <h5 className="text-xs font-medium text-gray-400 mb-2">Changes in this version:</h5>
                                      <div className="text-xs text-gray-300">
                                        {Object.entries(thread).map(([key, value]) => {
                                          // Skip metadata fields
                                          if (['status', 'timestamp', 'updatedAt', 'updatedBy', 'remarks', 'version', 'Version', 'id'].includes(key)) {
                                            return null;
                                          }
                                          
                                          // Handle different value types
                                          let displayValue = value;
                                          if (typeof value === 'object' && value !== null) {
                                            if (Array.isArray(value)) {
                                              displayValue = value.join(', ');
                                            } else {
                                              try {
                                                displayValue = JSON.stringify(value);
                                              } catch (e) {
                                                displayValue = '[Complex Object]';
                                              }
                                            }
                                          }
                                          
                                          return (
                                            <div key={key} className="flex mb-1">
                                              <span className="font-medium w-24">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                                              <span className="flex-1">{displayValue?.toString() || 'N/A'}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                            
                          {/* View More Button */}
                          {proposal.proposalThread.length > maxDisplayedVersions && (
                            <div className="text-center mt-2">
                              <button 
                                onClick={() => toggleFullHistory(proposal.id)}
                                className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm transition"
                              >
                                {showFullHistory[proposal.id] ? (
                                  <>Show Less<ChevronUp size={14} className="ml-1" /></>
                                ) : (
                                  <>View More History<ChevronDown size={14} className="ml-1" /></>
                                )}
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-sm text-gray-400 py-2">No status updates available.</div>
                      )}
                      
                      {proposal.status?.toLowerCase() === "pending" && (
                        <div className="relative mb-4">
                          <div className="absolute top-0 -left-10 bg-gray-700 p-1 rounded-full border-2 border-gray-600">
                            <Clock size={18} className="text-yellow-400" />
                          </div>
                          <div className="bg-gray-800 p-3 rounded-md border border-gray-600">
                            <div className="flex items-baseline">
                              <h4 className="font-medium text-yellow-400">Awaiting Decision</h4>
                            </div>
                            <p className="text-sm text-gray-300 mt-1">
                              Expected by {proposal.expectedCompletionDate ? new Date(proposal.expectedCompletionDate).toLocaleDateString() : "N/A"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Conditional Sections based on Status */}
                  {proposal.status?.toLowerCase() === "approved" && (
                    <div className="p-4 bg-gray-600 text-white border-t border-gray-500">
                      <h3 className="font-medium mb-2">Next Steps</h3>
                      <p className="text-sm text-gray-200">
                        Your proposal has been approved. The event coordinator will contact you shortly to discuss implementation details and schedule.
                      </p>
                      <div className="mt-3 flex items-center">
                        <Calendar size={14} className="mr-2 text-blue-400" />
                        <span className="text-sm">
                          Expected to be held on: {proposal.expectedCompletionDate ? new Date(proposal.expectedCompletionDate).toLocaleDateString() : "To be determined"}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {proposal.status?.toLowerCase() === "rejected" && (
                    <div className="p-4 bg-gray-600 text-white border-t border-gray-500">
                      <h3 className="font-medium mb-2">Feedback</h3>
                      <p className="text-sm text-gray-200">
                        {proposal.rejectionReason || "Your proposal has been rejected. Please review the comments in the proposal timeline for specific feedback."}
                      </p>
                      <div className="mt-3">
                        <button className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-md text-sm">
                          Submit Revised Proposal
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {proposal.status?.toLowerCase() === "requested changes" && (
                    <div className="p-4 bg-gray-600 text-white border-t border-gray-500">
                      <h3 className="font-medium mb-2">Requested Changes</h3>
                      <p className="text-sm text-gray-200">
                        Please review the comments and make the requested changes to your proposal.
                      </p>
                      <div className="mt-3">
                        <button className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-md text-sm">
                          Update Proposal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Empty State - When no proposals exist */}
      {proposals.length === 0 && !loading && !singleProposalView && (
        <div className="mt-6 bg-gray-800 p-8 rounded-lg shadow-md text-center">
          <div className="text-gray-300 mb-4">
            <BarChart4 size={48} className="mx-auto mb-4 text-gray-500" />
            <h2 className="text-xl font-semibold mb-2">No Proposals Yet</h2>
            <p className="text-gray-400">You haven't submitted any proposals yet. Create your first proposal to get started.</p>
          </div>
          <button 
            onClick={() => router.push("/createproposal")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors"
          >
            Create New Proposal
          </button>
        </div>
      )}
    </div>
  );}