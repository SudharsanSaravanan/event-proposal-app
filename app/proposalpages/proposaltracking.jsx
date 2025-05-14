"use client";

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
  ChevronRight,
  MessageSquare,
  User,
  Target,
  Layers,
  Settings,
  Send
} from "lucide-react";
import { collection, getDocs, query, where, doc, getDoc, orderBy, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
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
  const [loadedVersions, setLoadedVersions] = useState({});
  const [versionsLoading, setVersionsLoading] = useState({});
  const [newReply, setNewReply] = useState("");
  const [replyingProposalId, setReplyingProposalId] = useState(null);
  
  const auth = getAuth();
  const router = useRouter();

  const toggleExpand = (id) => {
    if (!singleProposalView) {
      setExpandedProposal(expandedProposal === id ? null : id);
    }
  };

  const loadMoreVersions = async (proposalId) => {
    setVersionsLoading(prev => ({ ...prev, [proposalId]: true }));
    
    try {
      setLoadedVersions(prev => ({
        ...prev,
        [proposalId]: (prev[proposalId] || 1) + 1
      }));
    } catch (error) {
      console.error("Error loading more versions:", error);
    } finally {
      setVersionsLoading(prev => ({ ...prev, [proposalId]: false }));
    }
  };

  const submitReply = async (proposalId) => {
    if (!newReply.trim()) return;
    
    try {
      const proposalRef = doc(db, "Proposals", proposalId);
      const replyData = {
        text: newReply,
        timestamp: new Date(),
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || "Proposer",
        authorType: "proposer",
        version: proposals.find(p => p.id === proposalId)?.version || 1
      };
      
      await updateDoc(proposalRef, {
        comments: arrayUnion(replyData),
        updatedAt: serverTimestamp()
      });
      
      // Refresh the proposal data
      const updatedProposal = await getDoc(proposalRef);
      setProposals(prev => prev.map(p => 
        p.id === proposalId ? { 
          ...p, 
          comments: [...(p.comments || []), replyData],
          versionDetails: p.versionDetails?.map((v, i) => 
            i === 0 ? { ...v, comments: [...(v.comments || []), replyData] } : v
          )
        } : p
      ));
      
      setNewReply("");
      setReplyingProposalId(null);
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  useEffect(() => {
    const fetchProposals = async () => {
      if (!auth.currentUser) {
        console.error("User not authenticated!");
        setLoading(false);
        return;
      }
    
      try {
        setLoading(true);
        let fetchedProposals = [];
    
        if (proposalId) {
          setSingleProposalView(true);
          const proposalRef = doc(db, "Proposals", proposalId);
          const proposalSnap = await getDoc(proposalRef);
          
          if (!proposalSnap.exists()) {
            setLoading(false);
            return;
          }
          
          const proposalData = {
            id: proposalSnap.id,
            ...proposalSnap.data(),
            comments: proposalSnap.data().comments || []
          };
    
          // Fetch version history
          const historyQuery = query(
            collection(db, "Proposals", proposalId, "History"),
            orderBy("version", "desc")
          );
          const historySnapshot = await getDocs(historyQuery);
          
          let versionDetails = [];
          
          historySnapshot.forEach(doc => {
            const historyData = doc.data();
            versionDetails.push({
              version: historyData.version || "1",
              timestamp: historyData.updatedAt,
              updatedBy: historyData.updatedBy || "System",
              status: historyData.proposalThread?.status || "Reviewed",
              remarks: historyData.remarks || "Proposal updated",
              comments: historyData.comments || [],
              ...historyData.proposalThread
            });
          });
    
          // Add current version as the first item
          versionDetails.unshift({
            ...proposalData,
            version: proposalData.version || "1",
            timestamp: proposalData.updatedAt || proposalData.createdAt,
            updatedBy: proposalData.updatedBy || "You",
            status: proposalData.status,
            remarks: "Current version",
            comments: proposalData.comments
          });
    
          proposalData.versionDetails = versionDetails;
          fetchedProposals = [proposalData];
          
          setExpandedProposal(proposalId);
          setLoadedVersions({ [proposalId]: 1 });
        } else {
          setSingleProposalView(false);
          const proposalsRef = collection(db, "Proposals");
          const q = query(proposalsRef, where("proposerId", "==", auth.currentUser.uid));
          const querySnapshot = await getDocs(q);
          
          const proposalPromises = querySnapshot.docs.map(async (doc) => {
            const proposalData = {
              id: doc.id,
              ...doc.data(),
              comments: doc.data().comments || []
            };
    
            // Fetch version history for each proposal
            const historyQuery = query(
              collection(db, "Proposals", doc.id, "History"),
              orderBy("version", "desc")
            );
            const historySnapshot = await getDocs(historyQuery);
            
            let versionDetails = [];
            
            historySnapshot.forEach(historyDoc => {
              const historyData = historyDoc.data();
              versionDetails.push({
                version: historyData.version || "1",
                timestamp: historyData.updatedAt,
                updatedBy: historyData.updatedBy || "System",
                status: historyData.proposalThread?.status || "Reviewed",
                remarks: historyData.remarks || "Proposal updated",
                comments: historyData.comments || [],
                ...historyData.proposalThread
              });
            });
    
            // Add current version as the first item
            versionDetails.unshift({
              ...proposalData,
              version: proposalData.version || "1",
              timestamp: proposalData.updatedAt || proposalData.createdAt,
              updatedBy: proposalData.updatedBy || "You",
              status: proposalData.status,
              remarks: "Current version",
              comments: proposalData.comments
            });
    
            proposalData.versionDetails = versionDetails;
            return proposalData;
          });
    
          fetchedProposals = await Promise.all(proposalPromises);
          
          // Initialize loaded versions
          const initialLoadedVersions = {};
          fetchedProposals.forEach(proposal => {
            initialLoadedVersions[proposal.id] = 1;
          });
          setLoadedVersions(initialLoadedVersions);
        }
        
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
        setLoading(false);
      }
    };

    fetchProposals();
  }, [auth.currentUser, proposalId, router]);

  const filteredProposals = filter === "all" 
    ? proposals 
    : proposals.filter(proposal => {
        let filterStatus = filter;
        if (filter === "pending") filterStatus = "Pending";
        if (filter === "approved") filterStatus = "Approved";
        if (filter === "rejected") filterStatus = "Rejected";
        
        return proposal.status === filterStatus;
      });

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
      case "reviewed":
        return <CheckCircle size={18} className="text-blue-400" />;
      case "created":
        return <CheckCircle size={18} className="text-blue-500" />;
      default:
        return <AlertCircle size={18} className="text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return " Iceland";
    
    if (timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return window.innerWidth < 768 
        ? date.toLocaleDateString() 
        : date.toLocaleString();
    }
    
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      return window.innerWidth < 768 
        ? date.toLocaleDateString() 
        : date.toLocaleString();
    }
    
    return "";
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full whitespace-nowrap">Approved</span>;
      case "rejected":
        return <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full whitespace-nowrap">Rejected</span>;
      case "under review":
        return <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full whitespace-nowrap">Under Review</span>;
      case "requested changes":
        return <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded-full whitespace-nowrap">Changes Requested</span>;
      case "reviewed":
        return <span className="px-2 py-1 bg-blue-400 text-white text-xs rounded-full whitespace-nowrap">Reviewed</span>;
      case "created":
        return <span className="px-2 py-1 bg-blue-400 text-white text-xs rounded-full whitespace-nowrap">Created</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full whitespace-nowrap">Pending Review</span>;
    }
  };

  const renderVersionDetails = (proposal) => {
    if (!proposal.versionDetails || proposal.versionDetails.length === 0) {
      return (
        <div className="text-sm text-gray-400 py-4">
          No version history available for this proposal.
        </div>
      );
    }

    // Always show current version first, then loaded historical versions
    const versionsToDisplay = [
      proposal.versionDetails[0], // Current version always first
      ...proposal.versionDetails.slice(1, (loadedVersions[proposal.id] || 1)) // Loaded historical versions
    ];

    return (
      <div className="space-y-8">
        {versionsToDisplay.map((version, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2">
              <h3 className="font-medium text-lg text-white flex items-center gap-2">
                Version {version.version}
                {index === 0 && <span className="text-xs font-normal text-blue-400">(Latest)</span>}
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 gap-1">
                {getStatusBadge(version.status)}
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {formatTimestamp(version.timestamp)}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Update Remarks:</h4>
                  <p className="text-sm text-gray-400 bg-gray-700 p-3 rounded break-words">
                    {version.remarks || "No remarks provided"}
                  </p>
                </div>
                
                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Proposal Details:</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-xs font-medium text-gray-400">Title:</h5>
                      <p className="text-sm text-gray-300 break-words">{version.title || "No title"}</p>
                    </div>
                    
                    <div>
                      <h5 className="text-xs font-medium text-gray-400">Description:</h5>
                      <p className="text-sm text-gray-300 break-words">{version.description || "No description provided"}</p>
                    </div>
                    
                    {version.objectives && (
                      <div>
                        <h5 className="text-xs font-medium text-gray-400">Objectives:</h5>
                        {Array.isArray(version.objectives) ? (
                          <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                            {version.objectives.map((obj, idx) => (
                              <li key={idx} className="break-words">{obj}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-300 break-words">{version.objectives}</p>
                        )}
                      </div>
                    )}
                    
                    {version.outcomes && (
                      <div>
                        <h5 className="text-xs font-medium text-gray-400">Expected Outcomes:</h5>
                        {Array.isArray(version.outcomes) ? (
                          <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                            {version.outcomes.map((outcome, idx) => (
                              <li key={idx} className="break-words">{outcome}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-300 break-words">{version.outcomes}</p>
                        )}
                      </div>
                    )}
                    
                    {version.participantEngagement && (
                      <div>
                        <h5 className="text-xs font-medium text-gray-400">Participant Engagement:</h5>
                        <p className="text-sm text-gray-300 break-words">{version.participantEngagement}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Additional Information:</h4>
                  
                  <div className="text-sm text-gray-300 break-words">
                    {/* Target Audience */}
                    {version.targetAudience && (
                      <div>
                        <h5 className="text-xs font-medium text-gray-400 flex items-center gap-1">
                          <Target size={14} /> Target Audience
                        </h5>
                        <p className="text-sm text-gray-300 break-words">{version.targetAudience}</p>
                      </div>
                    )}
                    
                    {/* Preferred Days */}
                    {version.preferredDays && (
                      <div className="col-span-2">
                        <h5 className="text-xs font-medium text-gray-400 flex items-center gap-1">
                          <Calendar size={14} /> Preferred Days
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                          {version.preferredDays.day1 && (
                            <div className="bg-gray-600 p-2 rounded break-words">
                              <span className="text-xs text-gray-300">Day 1:</span>
                              <p className="text-sm text-white">{version.preferredDays.day1}</p>
                            </div>
                          )}
                          {version.preferredDays.day2 && (
                            <div className="bg-gray-600 p-2 rounded break-words">
                              <span className="text-xs text-gray-300">Day 2:</span>
                              <p className="text-sm text-white">{version.preferredDays.day2}</p>
                            </div>
                          )}
                          {version.preferredDays.day3 && (
                            <div className="bg-gray-600 p-2 rounded break-words">
                              <span className="text-xs text-gray-300">Day 3:</span>
                              <p className="text-sm text-white">{version.preferredDays.day3}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Group Details */}
                    {version.groupDetails && !version.isIndividual && (
                      <div className="col-span-2 bg-gray-600 p-3 rounded">
                        <h5 className="text-xs font-medium text-gray-300 flex items-center gap-1">
                          <Users size={14} /> Group Details
                        </h5>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <span className="text-xs text-gray-400">Max Members:</span>
                            <p className="text-sm text-white break-words">{version.groupDetails.maxGroupMembers}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-400">Fee Type:</span>
                            <p className="text-sm text-white capitalize break-words">{version.groupDetails.feeType}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Additional Requirements */}
                    {version.additionalRequirements && (
                      <div className="col-span-2">
                        <h5 className="text-xs font-medium text-gray-400 flex items-center gap-1">
                          <Layers size={14} /> Additional Requirements
                        </h5>
                        <p className="text-sm text-gray-300 mt-1 break-words">{version.additionalRequirements}</p>
                      </div>
                    )}
                    
                    {/* Duration */}
                    {version.duration && (
                      <div>
                        <h5 className="text-xs font-medium text-gray-400">Duration:</h5>
                        <p className="text-sm text-gray-300 break-words">{version.duration}</p>
                      </div>
                    )}
                    
                    {/* Registration Fee */}
                    {version.registrationFee !== undefined && (
                      <div>
                        <h5 className="text-xs font-medium text-gray-400">Registration Fee:</h5>
                        <p className="text-sm text-gray-300 break-words">₹{version.registrationFee || "Free"}</p>
                      </div>
                    )}
                    
                    {/* Maximum Seats */}
                    {version.maxSeats && (
                      <div>
                        <h5 className="text-xs font-medium text-gray-400">Maximum Seats:</h5>
                        <p className="text-sm text-gray-300 break-words">{version.maxSeats}</p>
                      </div>
                    )}
                    
                    {/* Budget */}
                    {version.estimatedBudget && (
                      <div>
                        <h5 className="text-xs font-medium text-gray-400">Estimated Budget:</h5>
                        <p className="text-sm text-gray-300 break-words">₹{version.estimatedBudget}</p>
                      </div>
                    )}
                    
                    {/* Funding Source */}
                    {version.potentialFundingSource && (
                      <div>
                        <h5 className="text-xs font-medium text-gray-400">Funding Source:</h5>
                        <p className="text-sm text-gray-300 break-words">{version.potentialFundingSource}</p>
                      </div>
                    )}
                    
                    {/* Resource Person */}
                    {version.resourcePersonDetails && (
                      <div>
                        <h5 className="text-xs font-medium text-gray-400">Resource Person:</h5>
                        <p className="text-sm text-gray-300 break-words">{version.resourcePersonDetails}</p>
                      </div>
                    )}
                    
                    {/* External Resources */}
                    {version.externalResources && (
                      <div>
                        <h5 className="text-xs font-medium text-gray-400">External Resources:</h5>
                        <p className="text-sm text-gray-300 break-words">{version.externalResources}</p>
                      </div>
                    )}
                    
                    {/* Type Badges */}
                    <div>
                      <h5 className="text-xs font-medium text-gray-400">Type:</h5>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {version.isEvent && (
                          <span className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded-full whitespace-nowrap">Event</span>
                        )}
                        {version.isTechnical && (
                          <span className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded-full whitespace-nowrap">Technical</span>
                        )}
                        {!version.isEvent && !version.isTechnical && (
                          <span className="text-sm text-gray-300 whitespace-nowrap">Standard</span>
                        )}
                        {version.isIndividual ? (
                          <span className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded-full whitespace-nowrap">Individual</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded-full whitespace-nowrap">Group</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <MessageSquare size={16} className="mr-1" />
                  {index === 0 ? "Discussion" : `Discussion for Version ${version.version}`}
                </h4>
                
                {version.comments?.length > 0 ? (
  <div className="bg-gray-700 p-4 rounded max-h-96 overflow-y-auto space-y-4">
    {version.comments
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map((item, idx) => {
        const isCurrentUser = item.authorId === auth.currentUser?.uid;
        return (
          <div 
            key={idx} 
            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-lg p-3 ${
              isCurrentUser
                ? "bg-green-900/30 border-t-4 border-green-500 rounded-tr-none"
                : "bg-blue-900/30 border-t-4 border-blue-500 rounded-tl-none"
            }`}>
              <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} justify-between items-start mb-1 gap-2`}>
                <span className={`text-xs font-medium ${
                  isCurrentUser ? "text-green-400" : "text-blue-400"
                }`}>
                  {isCurrentUser ? "You" : "Reviewer"}
                </span>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-100 break-words">
                {item.text || "No text provided"}
              </p>
              {item.suggestions && !isCurrentUser && (
                <div className="mt-2 pt-2 border-t border-gray-600/50">
                  <div className="text-xs font-medium text-gray-300 mb-1">Suggestions:</div>
                  <ul className="text-sm text-gray-200 list-disc pl-5 space-y-1">
                    {Array.isArray(item.suggestions) ? (
                      item.suggestions.map((suggestion, sIdx) => (
                        <li key={sIdx} className="break-words">{suggestion}</li>
                      ))
                    ) : (
                      <li className="break-words">{item.suggestions}</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );
      })}
  </div>
) : (
  <div className="bg-gray-700 p-4 rounded">
    <p className="text-sm text-gray-400 italic">
      {index === 0 ? "No discussion yet" : "No discussion available for this version."}
    </p>
  </div>
)}
                
                {/* Reply input for current version only */}
                {index === 0 && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        placeholder="Add your reply..."
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newReply.trim()) {
                            submitReply(proposal.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => submitReply(proposal.id)}
                        disabled={!newReply.trim()}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <History size={16} className="mr-1" />
                    Status:
                  </h4>
                  
                  <div className="bg-gray-700 p-3 rounded">
                    <div className="flex items-center">
                      {getStatusIcon(version.status)}
                      <span className="ml-2 text-sm text-gray-300 font-medium capitalize break-words">
                        {version.status || "Unknown"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1 break-words">
                      Updated by: {version.updatedBy || "Unknown"} on {formatTimestamp(version.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Only show load more if there are more historical versions to load */}
        {proposal.versionDetails.length > (loadedVersions[proposal.id] || 1) && (
          <div className="text-center mt-4">
            <button
              onClick={() => loadMoreVersions(proposal.id)}
              disabled={versionsLoading[proposal.id]}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm flex items-center justify-center mx-auto disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <History size={16} className="mr-2" />
              {versionsLoading[proposal.id] ? "Loading..." : "Load Previous Version"}
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="pb-10 px-4 sm:pr-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-white">
          <br></br>
          {singleProposalView ? "Proposal Tracking Details" : "Proposal Tracking"}
        </h1>
        
        {singleProposalView && (
          <button 
            onClick={() => onBack ? onBack() : router.push("/proposaltracking")}
            className="flex items-center text-blue-400 hover:text-blue-300 transition whitespace-nowrap"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to all proposals
          </button>
        )}
      </div>

      {!singleProposalView && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-400">Total Proposals</p>
                <h3 className="text-xl sm:text-2xl font-bold text-white">{statistics.total}</h3>
              </div>
              <BarChart4 size={20} className="text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-400">Pending</p>
                <h3 className="text-xl sm:text-2xl font-bold text-white">{statistics.pending}</h3>
              </div>
              <Clock size={20} className="text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-400">Approved</p>
                <h3 className="text-xl sm:text-2xl font-bold text-white">{statistics.approved}</h3>
              </div>
              <CheckCircle size={20} className="text-green-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-400">Rejected</p>
                <h3 className="text-xl sm:text-2xl font-bold text-white">{statistics.rejected}</h3>
              </div>
              <XCircle size={20} className="text-red-500" />
            </div>
          </div>
        </div>
      )}

      {!singleProposalView && (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Proposals</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      )}

      {filteredProposals.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400">
            {filter === "all" 
              ? "You haven't submitted any proposals yet."
              : `No ${filter} proposals found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => (
            <div 
              key={proposal.id} 
              className={`bg-gray-800 rounded-lg border ${expandedProposal === proposal.id ? "border-blue-500" : "border-gray-700"} transition-all`}
            >
              <div 
                className="p-4 cursor-pointer flex justify-between items-center"
                onClick={() => toggleExpand(proposal.id)}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {getStatusIcon(proposal.status)}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-white truncate">{proposal.title || "Untitled Proposal"}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mt-1">
                      <span className="flex items-center whitespace-nowrap">
                        <Calendar size={12} className="mr-1" />
                        {formatTimestamp(proposal.createdAt)}
                      </span>
                      {proposal.duration && (
                        <span className="flex items-center whitespace-nowrap">
                          <Clock size={12} className="mr-1" />
                          {proposal.duration}
                        </span>
                      )}
                      {proposal.maxSeats && (
                        <span className="flex items-center whitespace-nowrap">
                          <Users size={12} className="mr-1" />
                          {proposal.maxSeats} seats
                        </span>
                      )}
                      {proposal.registrationFee !== undefined && (
                        <span className="flex items-center whitespace-nowrap">
                          <DollarSign size={12} className="mr-1" />
                          ₹{proposal.registrationFee || "Free"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 ml-2">
                  <div className="hidden sm:block text-sm text-gray-300">
                    {getStatusBadge(proposal.status)}
                  </div>
                  {expandedProposal === proposal.id ? (
                    <ChevronUp size={18} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400" />
                  )}
                </div>
              </div>
              
              {expandedProposal === proposal.id && (
                <div className="border-t border-gray-700 p-4">
                  {renderVersionDetails(proposal)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}