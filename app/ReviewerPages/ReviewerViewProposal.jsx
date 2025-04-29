"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Calendar, 
  Users,  
  Filter, 
  MessageSquare,
  ChevronDown, 
  ChevronUp,
  User,
  Target,
  Layers,
  ArrowLeft,
  History,
  Send,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  File,
  FileText,
  PenTool,
  Bug
} from "lucide-react";
import {
  db,
  getReviewerInfo, 
  getReviewerProposals, 
  updateProposalStatus
} from "../firebase/config";
import { collection, query, getDocs, doc, getDoc } from "firebase/firestore";

export default function ReviewerProposalViewContent({ onBack, filterStatus }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewer, setReviewer] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // Initialize with "all" filter
  const [expandedProposal, setExpandedProposal] = useState(null);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState("Approved");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    changes: 0
  });
  const [showDebug, setShowDebug] = useState(false); // Start with debug hidden
  const [debugInfo, setDebugInfo] = useState({});
  
  const commentInputRef = useRef(null);
  const router = useRouter();
  const auth = getAuth();

  // Direct database query function for debugging
  const directQueryProposals = async (departments) => {
    try {
      console.log("Performing direct query with departments:", departments);
      const proposalsRef = collection(db, "Proposals");
      const snapshot = await getDocs(proposalsRef);
      
      const allProposals = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`Found proposal: ${doc.id}, Department: ${data.department}, Title: ${data.title || 'No title'}`);
        allProposals.push({
          id: doc.id,
          ...data
        });
      });
      
      console.log(`Total proposals found: ${allProposals.length}`);
      
      // Filter based on departments
      const matchingProposals = allProposals.filter(proposal => {
        const deptMatch = departments.includes(proposal.department);
        console.log(`Checking proposal ${proposal.id} - Department: ${proposal.department}, Match: ${deptMatch}`);
        return deptMatch;
      });
      
      console.log(`Matching proposals: ${matchingProposals.length}`);
      return matchingProposals;
    } catch (error) {
      console.error("Error in direct query:", error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          console.log("User authenticated:", user.uid);
          
          // First get reviewer info directly from Firestore
          const reviewerRef = doc(db, "Reviewers", user.uid);
          const reviewerDoc = await getDoc(reviewerRef);
          
          if (!reviewerDoc.exists()) {
            setError("You don't have reviewer privileges. Please contact the administrator.");
            setLoading(false);
            return;
          }
          
          const reviewerData = reviewerDoc.data();
          console.log("Raw reviewer data:", reviewerData);
          
          // Extract departments data - handle various formats
          let departments = [];
          
          if (reviewerData.department) {
            // Handle different department formats
            if (Array.isArray(reviewerData.department)) {
              departments = reviewerData.department;
            } else if (typeof reviewerData.department === 'object') {
              // Convert object with numeric keys to array
              departments = Object.values(reviewerData.department);
            } else if (typeof reviewerData.department === 'string') {
              // Single department as string
              departments = [reviewerData.department];
            }
          }
          
          console.log("Processed departments:", departments);
          
          if (!departments || departments.length === 0) {
            setError("No departments are assigned to your reviewer account.");
            setLoading(false);
            setDebugInfo({
              reviewerId: user.uid,
              rawReviewerData: reviewerData,
              noDepartmentsAssigned: true
            });
            return;
          }
          
          // Store reviewer info in state
          setReviewer({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || reviewerData.name,
            departments: departments,
            ...reviewerData
          });
          
          // Update debug info
          setDebugInfo({
            reviewerId: user.uid,
            reviewerName: reviewerData.name,
            departmentsRaw: reviewerData.department,
            departmentsProcessed: departments
          });
          
          try {
            // First try direct query for more debugging info
            const directResults = await directQueryProposals(departments);
            setDebugInfo(prev => ({
              ...prev,
              directQueryResults: directResults.length,
              directQueryProposalIds: directResults.map(p => p.id)
            }));
            
            // Now use the regular function
            console.log("Fetching proposals with departments:", departments);
            const fetchedProposals = await getReviewerProposals(departments);
            console.log("Fetched proposals:", fetchedProposals);
            
            setProposals(fetchedProposals);
            
            // If direct query found proposals but the regular function didn't,
            // use the direct query results
            if (directResults.length > 0 && fetchedProposals.length === 0) {
              console.log("Using direct query results instead");
              setProposals(directResults);
              setDebugInfo(prev => ({
                ...prev,
                usingDirectResults: true
              }));
            }
            
            // Calculate statistics from whatever proposals we're using
            const finalProposals = fetchedProposals.length > 0 ? fetchedProposals : directResults;
            setStatistics({
              total: finalProposals.length,
              pending: finalProposals.filter(p => p.status?.toLowerCase() === "pending" || !p.status).length,
              approved: finalProposals.filter(p => p.status?.toLowerCase() === "approved").length,
              rejected: finalProposals.filter(p => p.status?.toLowerCase() === "rejected").length,
              changes: finalProposals.filter(p => p.status?.toLowerCase() === "reviewed").length
            });
            
          } catch (queryErr) {
            console.error("Error fetching proposals:", queryErr);
            setError("Failed to fetch proposals: " + queryErr.message);
            setDebugInfo(prev => ({
              ...prev,
              queryError: queryErr.message
            }));
          }
          
        } catch (err) {
          console.error("Error loading reviewer data:", err);
          setError("Failed to load reviewer information: " + err.message);
          setDebugInfo(prev => ({
            ...prev,
            mainError: err.message
          }));
        } finally {
          setLoading(false);
        }
      } else {
        setReviewer(null);
        setError("You must be logged in as a reviewer to view proposals.");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const toggleExpand = (id) => {
    if (expandedProposal === id) {
      setExpandedProposal(null);
      setReviewComment("");
      setReviewStatus("Approved");
    } else {
      setExpandedProposal(id);
      setReviewComment("");
      setReviewStatus("Approved");
      // Focus on comment input after expansion
      setTimeout(() => {
        if (commentInputRef.current) {
          commentInputRef.current.focus();
        }
      }, 100);
    }
  };

  const handleSubmitReview = async (proposalId) => {
    if (!reviewComment.trim()) {
      alert("Please provide a review comment before submitting.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await updateProposalStatus(
        proposalId,
        reviewStatus,
        reviewComment,
        reviewer.displayName || reviewer.name || "Reviewer"
      );
      
      // Update the proposal in the local state
      setProposals(prevProposals => 
        prevProposals.map(proposal => 
          proposal.id === proposalId 
            ? { 
                ...proposal, 
                status: reviewStatus,
                comments: [...(proposal.comments || []), {
                  text: reviewComment,
                  reviewerName: reviewer.displayName || reviewer.name || "Reviewer",
                  timestamp: new Date(),
                  status: reviewStatus
                }]
              } 
            : proposal
        )
      );
      
      // Recalculate statistics after update
      setStatistics(prev => {
        // Decrement the old status count (assuming it was pending)
        const newStats = { ...prev };
        newStats.pending = Math.max(0, newStats.pending - 1);
        
        // Increment the new status count
        const statusKey = reviewStatus.toLowerCase() === "reviewed" 
          ? "changes" 
          : reviewStatus.toLowerCase();
        
        newStats[statusKey] = (newStats[statusKey] || 0) + 1;
        
        return newStats;
      });
      
      setSuccessMessage(`Proposal status updated to "${reviewStatus}" successfully!`);
      setReviewComment("");
      
      // Auto-collapse after a successful review
      setTimeout(() => {
        setExpandedProposal(null);
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error("Error updating proposal status:", err);
      alert("Failed to update proposal status. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProposals = filter === "all" 
    ? proposals 
    : proposals.filter(proposal => {
        if (filter === "pending") {
          return proposal.status?.toLowerCase() === "pending" || !proposal.status;
        } else if (filter === "approved") {
          return proposal.status?.toLowerCase() === "approved";
        } else if (filter === "rejected") {
          return proposal.status?.toLowerCase() === "rejected";
        } else if (filter === "changes") {
          return proposal.status?.toLowerCase() === "reviewed";
        }
        return true;
      });

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <CheckCircle size={18} className="text-green-500" />;
      case "rejected":
        return <XCircle size={18} className="text-red-500" />;
      case "reviewed":
        return <AlertTriangle size={18} className="text-orange-500" />;
      case "pending":
      default:
        return <Clock size={18} className="text-yellow-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full whitespace-nowrap">Approved</span>;
      case "rejected":
        return <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full whitespace-nowrap">Rejected</span>;
      case "reviewed":
        return <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded-full whitespace-nowrap">Reviewed</span>;
      case "pending":
      default:
        return <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full whitespace-nowrap">Pending Review</span>;
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "No date";
    
    if (timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleString();
    }
    
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      return date.toLocaleString();
    }
    
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    }
    
    return "Invalid date";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-full p-6">
        <div className="bg-red-900/50 text-red-200 p-6 rounded-lg flex items-start gap-4 max-w-2xl">
          <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-white mb-2">Error</h3>
            <p>{error}</p>
            <button 
              onClick={onBack}
              className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
        
        {/* Always show debug info on error */}
        <div className="mt-6 bg-gray-800 p-4 rounded-lg border border-gray-600 max-w-2xl w-full">
          <h2 className="text-lg font-semibold text-white mb-2">Debug Information</h2>
          <pre className="text-xs text-gray-300 bg-gray-900 p-3 rounded overflow-auto max-h-60">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10 px-4 sm:pr-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Proposal Review
        </h1>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="flex items-center text-gray-400 hover:text-gray-300 transition"
            title="Toggle debug panel"
          >
            <Bug size={16} className="mr-1" />
            {showDebug ? "Hide Debug" : "Debug"}
          </button>
          
          <button 
            onClick={onBack}
            className="flex items-center text-blue-400 hover:text-blue-300 transition whitespace-nowrap"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to dashboard
          </button>
        </div>
      </div>

      {showDebug && (
        <div className="mb-6 bg-gray-800 p-4 rounded-lg border border-gray-600">
          <h2 className="text-lg font-semibold text-white mb-2">Debug Information</h2>
          <pre className="text-xs text-gray-300 bg-gray-900 p-3 rounded overflow-auto max-h-60">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-900/50 border border-green-700 text-green-200 p-4 rounded-md mb-6">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div 
          className={`bg-gray-800 rounded-lg p-4 border ${filter === "all" ? "border-white" : "border-gray-700"} cursor-pointer hover:bg-gray-700 transition`}
          onClick={() => setFilter("all")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Total</p>
              <h3 className="text-xl sm:text-2xl font-bold text-white">{statistics.total}</h3>
            </div>
            <FileText size={20} className="text-blue-500" />
          </div>
        </div>
        
        <div 
          className={`bg-gray-800 rounded-lg p-4 border ${filter === "pending" ? "border-white" : "border-gray-700"} cursor-pointer hover:bg-gray-700 transition`}
          onClick={() => setFilter("pending")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Pending</p>
              <h3 className="text-xl sm:text-2xl font-bold text-white">{statistics.pending}</h3>
            </div>
            <Clock size={20} className="text-yellow-500" />
          </div>
        </div>
        
        <div 
          className={`bg-gray-800 rounded-lg p-4 border ${filter === "approved" ? "border-white" : "border-gray-700"} cursor-pointer hover:bg-gray-700 transition`}
          onClick={() => setFilter("approved")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Approved</p>
              <h3 className="text-xl sm:text-2xl font-bold text-white">{statistics.approved}</h3>
            </div>
            <CheckCircle size={20} className="text-green-500" />
          </div>
        </div>
        
        <div 
          className={`bg-gray-800 rounded-lg p-4 border ${filter === "rejected" ? "border-white" : "border-gray-700"} cursor-pointer hover:bg-gray-700 transition`}
          onClick={() => setFilter("rejected")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Rejected</p>
              <h3 className="text-xl sm:text-2xl font-bold text-white">{statistics.rejected}</h3>
            </div>
            <XCircle size={20} className="text-red-500" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-1 text-sm"
          >
            <option value="all">All Proposals</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="changes">Reviewed</option>
          </select>
        </div>
        
        <div className="text-sm text-gray-400">
          {reviewer?.departments?.length > 0 ? (
            <span>Departments: {reviewer.departments.join(", ")}</span>
          ) : (
            "No assigned departments"
          )}
        </div>
      </div>

      {filteredProposals.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <File className="h-12 w-12 mx-auto mb-4 text-gray-500" />
          <p className="text-gray-400">
            {filter === "all" 
              ? "No proposals found in your assigned departments."
              : `No ${filter} proposals found.`}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Make sure your departments match proposal departments.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => (
            <div 
              key={proposal.id} 
              className={`bg-gray-800 rounded-lg border ${expandedProposal === proposal.id ? "border-blue-500" : "border-gray-700"} transition-all`}
            >
              {/* Proposal Header - Always visible */}
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
                      {proposal.department && (
                        <span className="flex items-center whitespace-nowrap">
                          <Layers size={12} className="mr-1" />
                          {proposal.department}
                        </span>
                      )}
                      {proposal.proposerName && (
                        <span className="flex items-center whitespace-nowrap">
                          <User size={12} className="mr-1" />
                          {proposal.proposerName}
                        </span>
                      )}
                      {proposal.duration && (
                        <span className="flex items-center whitespace-nowrap">
                          <Clock size={12} className="mr-1" />
                          {proposal.duration}
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
              
              {/* Proposal Details - Shown when expanded */}
              {expandedProposal === proposal.id && (
                <div className="border-t border-gray-700 p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Proposal Details */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Description:</h4>
                        <p className="text-sm text-gray-400 bg-gray-700 p-3 rounded">
                          {proposal.description || "No description provided"}
                        </p>
                      </div>
                      
                      <div className="bg-gray-700 p-4 rounded">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">Key Information:</h4>
                        
                        <div className="space-y-3">
                          {proposal.objectives && (
                            <div>
                              <h5 className="text-xs font-medium text-gray-400">Objectives:</h5>
                              <p className="text-sm text-gray-300">{proposal.objectives}</p>
                            </div>
                          )}
                          
                          {proposal.outcomes && (
                            <div>
                              <h5 className="text-xs font-medium text-gray-400">Expected Outcomes:</h5>
                              <p className="text-sm text-gray-300">{proposal.outcomes}</p>
                            </div>
                          )}
                          
                          {proposal.participantEngagement && (
                            <div>
                              <h5 className="text-xs font-medium text-gray-400">Participant Engagement:</h5>
                              <p className="text-sm text-gray-300">{proposal.participantEngagement}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gray-700 p-4 rounded">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">Additional Information:</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Target Audience */}
                          {proposal.targetAudience && (
                            <div className="col-span-2">
                              <h5 className="text-xs font-medium text-gray-400 flex items-center gap-1">
                                <Target size={14} /> Target Audience
                              </h5>
                              <p className="text-sm text-gray-300">{proposal.targetAudience}</p>
                            </div>
                          )}
                          
                          {/* Duration */}
                          {proposal.duration && (
                            <div>
                              <h5 className="text-xs font-medium text-gray-400">Duration:</h5>
                              <p className="text-sm text-gray-300">{proposal.duration}</p>
                            </div>
                          )}
                          
                          {/* Registration Fee */}
                          {proposal.registrationFee !== undefined && (
                            <div>
                              <h5 className="text-xs font-medium text-gray-400">Registration Fee:</h5>
                              <p className="text-sm text-gray-300">₹{proposal.registrationFee || "Free"}</p>
                            </div>
                          )}
                          
                          {/* Maximum Seats */}
                          {proposal.maxSeats && (
                            <div>
                              <h5 className="text-xs font-medium text-gray-400">Maximum Seats:</h5>
                              <p className="text-sm text-gray-300">{proposal.maxSeats}</p>
                            </div>
                          )}
                          
                          {/* Budget */}
                          {proposal.estimatedBudget && (
                            <div>
                              <h5 className="text-xs font-medium text-gray-400">Estimated Budget:</h5>
                              <p className="text-sm text-gray-300">₹{proposal.estimatedBudget}</p>
                            </div>
                          )}
                          
                          {/* Funding Source */}
                          {proposal.potentialFundingSource && (
                            <div>
                              <h5 className="text-xs font-medium text-gray-400">Funding Source:</h5>
                              <p className="text-sm text-gray-300">{proposal.potentialFundingSource}</p>
                            </div>
                          )}
                          
                          {/* Resource Person */}
                          {proposal.resourcePersonDetails && (
                            <div>
                              <h5 className="text-xs font-medium text-gray-400">Resource Person:</h5>
                              <p className="text-sm text-gray-300">{proposal.resourcePersonDetails}</p>
                            </div>
                          )}
                          
                          {/* External Resources */}
                          {proposal.externalResources && (
                            <div>
                              <h5 className="text-xs font-medium text-gray-400">External Resources:</h5>
                              <p className="text-sm text-gray-300">{proposal.externalResources}</p>
                            </div>
                          )}
                          
                          {/* Type Badges */}
                          <div>
                            <h5 className="text-xs font-medium text-gray-400">Type:</h5>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {proposal.isEvent !== undefined && (
                                <span className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded-full">
                                  {proposal.isEvent ? "Event" : "Workshop"}
                                </span>
                              )}
                              {proposal.isTechnical !== undefined && (
                                <span className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded-full">
                                  {proposal.isTechnical ? "Technical" : "Non-Technical"}
                                </span>
                              )}
                              {proposal.isIndividual !== undefined && (
                                <span className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded-full">
                                  {proposal.isIndividual ? "Individual" : "Group"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Column - Review Section */}
                    <div className="space-y-4">
                      {/* Previous Comments */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                          <MessageSquare size={16} className="mr-1" />
                          Previous Comments:
                        </h4>
                        
                        {proposal.comments && proposal.comments.length > 0 ? (
                          <div className="bg-gray-700 p-4 rounded max-h-60 overflow-y-auto space-y-3">
                            {proposal.comments.map((comment, idx) => (
                              <div key={idx} className="bg-gray-800 p-3 rounded border-l-4 border-blue-500">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1">
                                  <span className="text-xs font-medium text-blue-400">
                                    {comment.reviewerName || "Reviewer"}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatTimestamp(comment.timestamp)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-300">
                                  {comment.text || "No comment text"}
                                </p>
                                {comment.status && (
                                  <div className="mt-2 text-xs">
                                    Status: {getStatusBadge(comment.status)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-gray-700 p-4 rounded">
                            <p className="text-sm text-gray-500 italic">
                              No previous comments found.
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Add Review Form */}
                      <div className="bg-gray-700 p-4 rounded">
                        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                          <PenTool size={16} className="mr-1" />
                          Add Review:
                        </h4>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                              Review Status:
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <button
                                type="button"
                                className={`flex items-center justify-center px-3 py-2 rounded-md text-sm ${
                                  reviewStatus === "Approved" 
                                    ? "bg-green-700 text-white" 
                                    : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                                }`}
                                onClick={() => setReviewStatus("Approved")}
                              >
                                <ThumbsUp size={14} className="mr-1" />
                                Approve
                              </button>
                              
                              <button
                                type="button"
                                className={`flex items-center justify-center px-3 py-2 rounded-md text-sm ${
                                  reviewStatus === "Rejected" 
                                    ? "bg-red-700 text-white" 
                                    : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                                }`}
                                onClick={() => setReviewStatus("Rejected")}
                              >
                                <ThumbsDown size={14} className="mr-1" />
                                Reject
                              </button>
                              
                              <button
                                type="button"
                                className={`flex items-center justify-center px-3 py-2 rounded-md text-sm ${
                                  reviewStatus === "Reviewed" 
                                    ? "bg-orange-700 text-white" 
                                    : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                                }`}
                                onClick={() => setReviewStatus("Reviewed")}
                              >
                                <RefreshCw size={14} className="mr-1" />
                                Request Changes
                              </button>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                              Review Comment:
                            </label>
                            <textarea
                              ref={commentInputRef}
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              placeholder="Enter your review comments here..."
                              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white text-sm min-h-24"
                              required
                            ></textarea>
                            <p className="text-xs text-gray-500 mt-1">
                              Please provide detailed feedback, especially if rejecting or requesting changes.
                            </p>
                          </div>
                          
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => handleSubmitReview(proposal.id)}
                              disabled={isSubmitting || !reviewComment.trim()}
                              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md py-2 flex items-center justify-center gap-2 transition"
                            >
                              {isSubmitting ? (
                                <>
                                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <Send size={16} />
                                  Submit Review
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}