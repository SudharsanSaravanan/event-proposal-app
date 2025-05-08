"use client";
import { query, orderBy } from "firebase/firestore";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/app/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs } from "firebase/firestore"; 
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Calendar,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  User,
  Target,
  Layers,
  Send,
  ThumbsUp,
  ThumbsDown,
  File,
  FileText,
  PenTool,
  IndianRupee,
  Users2
} from "lucide-react";
import {
  getReviewerProposals,
  updateProposalStatusReviewer
} from "../firebase/config";

export default function ReviewerProposalViewContent({ onBack, filterStatus = "all" }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewer, setReviewer] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(filterStatus);
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
  
  const commentInputRef = useRef(null);
  const router = useRouter();

  const handleLogout = () => {
    router.push("/");
  };

  // Set filter when filterStatus prop changes
  useEffect(() => {
    if (filterStatus) {
      setFilter(filterStatus);
    }
  }, [filterStatus]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      window.location.reload(); // Refresh the page
    }, 1000); // Optional: 1 second delay for UX
  };

  const [refreshing, setRefreshing] = useState(false);

  const directQueryProposals = async (departments) => {
    try {
      const proposalsRef = collection(db, "Proposals");
      const snapshot = await getDocs(proposalsRef);
      
      const allProposals = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        allProposals.push({
          id: doc.id,
          ...data
        });
      });

  
      const matchingProposals = allProposals.filter(proposal => {
        return departments.includes(proposal.department);
      });
      
      return matchingProposals;
    } catch (error) {
      console.error("Error in direct query:", error);
      throw error;
    }
  };


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.error("No user found, redirecting to login");
        router.push("/login");
        return;
      }

      try {
        // First check session storage for values from the login page
        const sessionAuth = sessionStorage.getItem("auth");
        const isUser = sessionStorage.getItem("user");
        const role = sessionStorage.getItem("role");
        const name = sessionStorage.getItem("name");
        let departments = [];
        
        try {
          const departmentsStr = sessionStorage.getItem("departments");
          if (departmentsStr) {
            departments = JSON.parse(departmentsStr);
          }
        } catch (e) {
          console.error("Error parsing departments:", e);
        }
        
        // Check if user is already authenticated via session storage
        if (isUser === "true" && role && role.toLowerCase() === "reviewer") {
          
          // Create reviewer data from session storage
          const reviewerData = {
            uid: user.uid,
            email: user.email,
            displayName: name || "Reviewer",
            name: name || "Reviewer",
            departments: departments || []
          };
          
          setReviewer(reviewerData);
          
          try {
            const directResults = await directQueryProposals(departments);
            const fetchedProposals = await getReviewerProposals(departments);
            
            setProposals(fetchedProposals);
            
            if (directResults.length > 0 && fetchedProposals.length === 0) {
              setProposals(directResults);
            }
            
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
          }
          
          setLoading(false);
          return;
        }
        
        // Fallback to Firestore check if session storage doesn't have valid data
        const reviewerRef = doc(db, "Reviewers", user.uid);
        const reviewerDoc = await getDoc(reviewerRef);
        
        if (!reviewerDoc.exists()) {
          throw new Error("You don't have reviewer privileges. Please contact the administrator.");
        }
        
        const reviewerData = reviewerDoc.data();
        
        // Process departments properly
        let userDepartments = reviewerData.department || [];
        if (!Array.isArray(userDepartments)) {
          userDepartments = typeof userDepartments === 'object' 
            ? Object.values(userDepartments) 
            : [userDepartments];
        }
        
        if (!userDepartments || userDepartments.length === 0) {
          throw new Error("No departments are assigned to your reviewer account.");
        }
        
        // Prepare session data with standardized role
        const authSession = {
          authenticated: true,
          name: reviewerData.name || "Reviewer",
          role: "Reviewer", // Standardized to capital R
          departments: userDepartments
        };

        // Set both auth formats in session storage for compatibility
        sessionStorage.setItem("auth", JSON.stringify(authSession));
        sessionStorage.setItem("user", "true");
        sessionStorage.setItem("role", "Reviewer");
        sessionStorage.setItem("name", reviewerData.name || "");
        sessionStorage.setItem("departments", JSON.stringify(userDepartments));
        
        // Set reviewer data
        setReviewer({
          uid: user.uid,
          email: user.email,
          displayName: reviewerData.name || "Reviewer",
          name: reviewerData.name || "Reviewer",
          departments: userDepartments,
          ...reviewerData
        });
        
        try {
          const directResults = await directQueryProposals(userDepartments);
          const fetchedProposals = await getReviewerProposals(userDepartments);
          
          setProposals(fetchedProposals);
          
          if (directResults.length > 0 && fetchedProposals.length === 0) {
            setProposals(directResults);
          }
          
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
        }
        
      } catch (err) {
        console.error("Authentication error:", err);
        sessionStorage.removeItem("auth");
        setError(err.message);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);
  
  const fetchProposalHistory = async (proposalId) => {
    try {
      const historyRef = collection(db, "Proposals", proposalId, "history");
      const historyQuery = query(historyRef, orderBy("version", "desc"));
  
      const snapshot = await getDocs(historyQuery);
      return snapshot.docs.map((doc) => doc.data());
    } catch (error) {
      console.error("Error fetching proposal history:", error);
      return [];
    }
  };
  const toggleExpand = async (id) => {
    //////remove
    const history = await fetchProposalHistory(id);

    if (expandedProposal === id) {
      setExpandedProposal(null);
      setReviewComment("");
      setReviewStatus("Reviewed");
    } else {
      setExpandedProposal(id);
      setReviewComment("");
      setReviewStatus("Reviewed");
      
      // Fetch history when expanding
      try {
        const history = await fetchProposalHistory(id);
        setProposals(prev => prev.map(p => 
          p.id === id ? { ...p, history } : p
        ));
      } catch (error) {
        console.error("Failed to fetch proposal history:", error);
      }
  
      setTimeout(() => {
        if (commentInputRef.current) {
          commentInputRef.current.focus();
        }
      }, 100);
    }
  };
  const CommentItem = ({ comment, reviewer, version }) => {
    // Explicitly determine if this is a reviewer comment or user comment
    const isReviewerComment = Boolean(comment.reviewerName);
    const isUserComment = Boolean(comment.authorName || comment.authorType);
    
    // Get appropriate name and set proper styling based on comment type
    let displayName = "Unknown";
    let borderColor = "border-gray-500";
    let nameColor = "text-gray-400";
    
    if (isReviewerComment) {
      // This is a reviewer comment
      displayName = comment.reviewerName;
      borderColor = "border-blue-500";
      nameColor = "text-blue-400";
      
      // Check if this is from the current reviewer
      if (comment.reviewerName === (reviewer?.displayName || reviewer?.name)) {
        displayName = "You";
      }
    } else if (isUserComment) {
      // This is a user/proposer comment
      displayName = comment.authorName || "User";
      borderColor = "border-green-500";
      nameColor = "text-green-400";
    }
    
    const isCurrentReviewer = isReviewerComment && 
      comment.reviewerName === (reviewer?.displayName || reviewer?.name);
    
    return (
      <div 
        className={`bg-gray-800 p-3 rounded border-l-4 ${borderColor} ${
          isCurrentReviewer ? "ml-auto" : "mr-auto"
        } max-w-[90%] break-words`}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${nameColor} truncate`}>
              {displayName}
            </span>
            <span className="text-xs text-gray-500">
              {version ? `(v${version})` : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {formatTimestamp(comment.timestamp)}
            </span>
            {comment.status && (
              <span className="text-xs text-white">
                {getStatusBadge(comment.status)}
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-300 whitespace-pre-wrap">
          {comment.text || "No comment text"}
        </p>
      </div>
    );
  };


  const handleSubmitReview = async (proposalId) => {
    if (!reviewComment.trim()) {
      alert("Please provide a review comment before submitting.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await updateProposalStatusReviewer(
        proposalId,
        reviewStatus,
        reviewComment,
        reviewer.displayName || reviewer.name || "Reviewer"
      );
      
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
      
      setStatistics(prev => {
        const newStats = { ...prev };
        newStats.pending = Math.max(0, newStats.pending - 1);
        
        const statusKey = reviewStatus.toLowerCase() === "reviewed" 
          ? "changes" 
          : reviewStatus.toLowerCase();
        
        newStats[statusKey] = (newStats[statusKey] || 0) + 1;
        
        return newStats;
      });
      
      setSuccessMessage(`Proposal status updated to "${reviewStatus}" successfully!`);
      setReviewComment("");
      
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
        return <CheckCircle size={18} className="text-blue-500" />;
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
        return <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full whitespace-nowrap">Reviewed</span>;
      case "pending":
      default:
        return <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full whitespace-nowrap">Pending Review</span>;
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "No date";
    
    try {
      // For Firestore timestamps with seconds property
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleString();
      }
      
      // For Firestore timestamps with toDate method
      if (typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleString();
      }
      
      // For ISO strings or other date formats
      const date = new Date(timestamp);
      return !isNaN(date.getTime()) ? date.toLocaleString() : "Invalid date";
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Invalid date";
    }
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
            <p className="break-words">{error}</p>
            <button 
              onClick={onBack}
              className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10 px-4 sm:px-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4 pt-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="h-6 w-6 flex-shrink-0" />
          <span className="truncate">Proposal Review</span>
        </h1>
        
        <div className="flex items-center gap-3">
          <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md text-sm text-white disabled:opacity-50"
                >
                  <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                  {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-700 hover:bg-red-600 px-3 py-2 rounded-md text-sm text-white disabled:opacity-50"
          >
            <span className="truncate">Logout</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-900/50 border border-green-700 text-green-200 p-4 rounded-md mb-6 break-words">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div 
          className={`bg-gray-800 rounded-lg p-4 border ${filter === "all" ? "border-white" : "border-gray-700"} cursor-pointer hover:bg-gray-700 transition min-w-0`}
          onClick={() => setFilter("all")}
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-400 truncate">View All Proposals</p>
              <h3 className="text-xl sm:text-2xl font-bold text-white truncate">{statistics.total}</h3>
            </div>
            <FileText size={20} className="text-blue-500 flex-shrink-0" />
          </div>
        </div>
        
        <div 
          className={`bg-gray-800 rounded-lg p-4 border ${filter === "pending" ? "border-white" : "border-gray-700"} cursor-pointer hover:bg-gray-700 transition min-w-0`}
          onClick={() => setFilter("pending")}
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-400 truncate">View Pending Proposals</p>
              <h3 className="text-xl sm:text-2xl font-bold text-white truncate">{statistics.pending}</h3>
            </div>
            <Clock size={20} className="text-yellow-500 flex-shrink-0" />
          </div>
        </div>
        
        <div 
          className={`bg-gray-800 rounded-lg p-4 border ${filter === "approved" ? "border-white" : "border-gray-700"} cursor-pointer hover:bg-gray-700 transition min-w-0`}
          onClick={() => setFilter("approved")}
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-400 truncate">View Approved Proposals</p>
              <h3 className="text-xl sm:text-2xl font-bold text-white truncate">{statistics.approved}</h3>
            </div>
            <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
          </div>
        </div>
        
        <div 
          className={`bg-gray-800 rounded-lg p-4 border ${filter === "rejected" ? "border-white" : "border-gray-700"} cursor-pointer hover:bg-gray-700 transition min-w-0`}
          onClick={() => setFilter("rejected")}
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-400 truncate">View Rejected Proposals</p>
              <h3 className="text-xl sm:text-2xl font-bold text-white truncate">{statistics.rejected}</h3>
            </div>
            <XCircle size={20} className="text-red-500 flex-shrink-0" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
        <div className="min-w-0">
          {reviewer?.departments?.length > 0 ? (
            <span className="text-sm text-gray-400 truncate">Departments: {reviewer.departments.join(", ")}</span>
          ) : (
            <span className="text-sm text-gray-400 truncate">No assigned departments</span>
          )}
        </div>
      </div>

      {filteredProposals.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <File className="h-12 w-12 mx-auto mb-4 text-gray-500" />
          <p className="text-gray-400 break-words">
            {filter === "all" 
              ? "No proposals found in your assigned departments."
              : `No ${filter} proposals found.`}
          </p>
          <p className="text-sm text-gray-500 mt-2 break-words">
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
              <div 
                className="p-4 cursor-pointer flex justify-between items-center"
                onClick={() => toggleExpand(proposal.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0">
                    {getStatusIcon(proposal.status)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-white truncate">{proposal.title || "Untitled Proposal"}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mt-1">
                      <span className="flex items-center whitespace-nowrap">
                        <Calendar size={12} className="mr-1 flex-shrink-0" />
                        <span className="truncate">{formatTimestamp(proposal.createdAt)}</span>
                      </span>
                      {proposal.department && (
                        <span className="flex items-center whitespace-nowrap">
                          <Layers size={12} className="mr-1 flex-shrink-0" />
                          <span className="truncate">{proposal.department}</span>
                        </span>
                      )}
                      {proposal.proposerName && (
                        <span className="flex items-center whitespace-nowrap">
                          <User size={12} className="mr-1 flex-shrink-0" />
                          <span className="truncate">{proposal.proposerName}</span>
                        </span>
                      )}
                      {proposal.duration && (
                        <span className="flex items-center whitespace-nowrap">
                          <Clock size={12} className="mr-1 flex-shrink-0" />
                          <span className="truncate">{proposal.duration}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 ml-2">
                  <div className="hidden sm:block text-sm text-white">
                    {getStatusBadge(proposal.status)}
                  </div>
                  {expandedProposal === proposal.id ? (
                    <ChevronUp size={18} className="text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
                  )}
                </div>
              </div>
              
              {expandedProposal === proposal.id && (
                <div className="border-t border-gray-700 p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4 min-w-0">
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Description:</h4>
                        <p className="text-sm text-gray-400 bg-gray-700 p-3 rounded break-words whitespace-pre-wrap">
                          {proposal.description || "No description provided"}
                        </p>
                      </div>
                      
                      <div className="bg-gray-700 p-4 rounded">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">Key Information:</h4>
                        
                        <div className="space-y-3">
                          {proposal.objectives && (
                            <div className="break-words">
                              <h5 className="text-xs font-medium text-gray-400">Objectives:</h5>
                              <p className="text-sm text-gray-300 whitespace-pre-wrap">{proposal.objectives}</p>
                            </div>
                          )}
                          
                          {proposal.outcomes && (
                            <div className="break-words">
                              <h5 className="text-xs font-medium text-gray-400">Expected Outcomes:</h5>
                              <p className="text-sm text-gray-300 whitespace-pre-wrap">{proposal.outcomes}</p>
                            </div>
                          )}
                          
                          {proposal.participantEngagement && (
                            <div className="break-words">
                              <h5 className="text-xs font-medium text-gray-400">Participant Engagement:</h5>
                              <p className="text-sm text-gray-300 whitespace-pre-wrap">{proposal.participantEngagement}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gray-700 p-4 rounded">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">Additional Information:</h4>
                        
                        <div className="grid grid-cols-1 gap-3">
                          {proposal.targetAudience && (
                            <div className="col-span-1 break-words">
                              <h5 className="text-xs font-medium text-gray-400 flex items-center gap-1">
                                <Target size={14} /> Target Audience
                              </h5>
                              <p className="text-sm text-gray-300 whitespace-pre-wrap">{proposal.targetAudience}</p>
                            </div>
                          )}
                          
                          {proposal.duration && (
                            <div className="break-words">
                              <h5 className="text-xs font-medium text-gray-400">Duration:</h5>
                              <p className="text-sm text-gray-300 whitespace-pre-wrap">{proposal.duration}</p>
                            </div>
                          )}
                          
                          {proposal.registrationFee !== undefined && (
                            <div className="break-words">
                              <h5 className="text-xs font-medium text-gray-400">Registration Fee:</h5>
                              <p className="text-sm text-gray-300 whitespace-pre-wrap flex items-center">
                                <IndianRupee size={14} className="mr-1" />
                                {proposal.registrationFee || "Free"}
                              </p>
                            </div>
                          )}
                          
                          {proposal.maxSeats && (
                            <div className="break-words">
                              <h5 className="text-xs font-medium text-gray-400">Maximum Seats:</h5>
                              <p className="text-sm text-gray-300 whitespace-pre-wrap">{proposal.maxSeats}</p>
                            </div>
                          )}
                          
                          {proposal.estimatedBudget && (
                            <div className="break-words">
                              <h5 className="text-xs font-medium text-gray-400">Estimated Budget:</h5>
                              <p className="text-sm text-gray-300 whitespace-pre-wrap flex items-center">
                                <IndianRupee size={14} className="mr-1" />
                                {proposal.estimatedBudget}
                              </p>
                            </div>
                          )}
                          
                          {proposal.potentialFundingSource && (
                            <div className="break-words">
                              <h5 className="text-xs font-medium text-gray-400">Funding Source:</h5>
                              <p className="text-sm text-gray-300 whitespace-pre-wrap">{proposal.potentialFundingSource}</p>
                            </div>
                          )}
                          
                          {proposal.resourcePersonDetails && (
                            <div className="break-words">
                              <h5 className="text-xs font-medium text-gray-400">Resource Person:</h5>
                              <p className="text-sm text-gray-300 whitespace-pre-wrap">{proposal.resourcePersonDetails}</p>
                            </div>
                          )}
                          
                          {proposal.externalResources && (
                            <div className="break-words">
                              <h5 className="text-xs font-medium text-gray-400">External Resources:</h5>
                              <p className="text-sm text-gray-300 whitespace-pre-wrap">{proposal.externalResources}</p>
                            </div>
                          )}

                          {proposal.additionalRequirements && (
                            <div className="col-span-1 break-words">
                              <h5 className="text-xs font-medium text-gray-400">Additional Requirements:</h5>
                              <p className="text-sm text-gray-300 whitespace-pre-wrap">{proposal.additionalRequirements}</p>
                            </div>
                          )}

                          {/* Group Details Section */}
                          {!proposal.isIndividual && proposal.groupDetails && (
                            <div className="col-span-1 break-words bg-gray-800 p-3 rounded">
                              <h5 className="text-xs font-medium text-gray-400 flex items-center gap-1">
                                <Users2 size={14} /> Group Registration Details
                              </h5>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <div>
                                  <p className="text-xs text-gray-500">Max Members:</p>
                                  <p className="text-sm text-gray-300">{proposal.groupDetails.maxGroupMembers || 'Not specified'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Fee Type:</p>
                                  <p className="text-sm text-gray-300 capitalize">
                                    {proposal.groupDetails.feeType === 'perhead' ? 'Per Head' : 'Per Group'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Preferred Days Section */}
                          {proposal.preferredDays && (
                            <div className="col-span-1 break-words bg-gray-800 p-3 rounded">
                              <h5 className="text-xs font-medium text-gray-400 flex items-center gap-1">
                                <Calendar size={14} /> Preferred Schedule
                              </h5>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                                {proposal.preferredDays.day1 && (
                                  <div>
                                    <p className="text-xs text-gray-500">Day 1:</p>
                                    <p className="text-sm text-gray-300">{proposal.preferredDays.day1}</p>
                                  </div>
                                )}
                                {proposal.preferredDays.day2 && (
                                  <div>
                                    <p className="text-xs text-gray-500">Day 2:</p>
                                    <p className="text-sm text-gray-300">{proposal.preferredDays.day2}</p>
                                  </div>
                                )}
                                {proposal.preferredDays.day3 && (
                                  <div>
                                    <p className="text-xs text-gray-500">Day 3:</p>
                                    <p className="text-sm text-gray-300">{proposal.preferredDays.day3}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Event Type Badges */}
                          <div className="col-span-1 break-words">
                            <h5 className="text-xs font-medium text-gray-400">Event Details:</h5>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {proposal.isEvent !== undefined && (
                                <span className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded-full whitespace-nowrap">
                                  {proposal.isEvent ? "Event" : "Workshop"}
                                </span>
                              )}
                              {proposal.isTechnical !== undefined && (
                                <span className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded-full whitespace-nowrap">
                                  {proposal.isTechnical ? "Technical" : "Non-Technical"}
                                </span>
                              )}
                              {proposal.isIndividual !== undefined && (
                                <span className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded-full whitespace-nowrap">
                                  {proposal.isIndividual ? "Individual" : "Group"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 min-w-0">
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                            <MessageSquare size={16} className="mr-1 flex-shrink-0" />
                            <span>All Comments:</span>
                          </h4>
                          
                          <div className="bg-gray-700 p-4 rounded max-h-60 overflow-y-auto space-y-3">
                            {/* Current version comments */}
                            {proposal.comments && proposal.comments.length > 0 ? (
                              <>
                                <div className="text-xs text-gray-500 mb-2 px-2 py-1 bg-gray-800 rounded-full w-fit">
                                  Current Version
                                </div>
                                {proposal.comments.map((comment, idx) => (
                                  <CommentItem 
                                    key={`current-${idx}`}
                                    comment={comment}
                                    reviewer={reviewer}
                                  />
                                ))}
                              </>
                            ) : null}
                            
                            {/* Historical version comments */}
                            {proposal.history && proposal.history
                              .filter(version => version.comments && version.comments.length > 0)
                              .sort((a, b) => {
                                // Sort by version number (newest first)
                                if (a.version && b.version) {
                                  return b.version - a.version;
                                }
                                // Fallback to timestamp if version is not available
                                const timeA = a.timestamp?.seconds ? a.timestamp.seconds * 1000 : 
                                            a.timestamp ? new Date(a.timestamp).getTime() : 0;
                                const timeB = b.timestamp?.seconds ? b.timestamp.seconds * 1000 : 
                                            b.timestamp ? new Date(b.timestamp).getTime() : 0;
                                return timeB - timeA;
                              })
                              .map((version) => (
                                <div key={`version-${version.version}`}>
                                  <div className="text-xs text-gray-500 mt-4 mb-2 px-2 py-1 bg-gray-800 rounded-full w-fit">
                                    Version {version.version} ({formatTimestamp(version.timestamp)})
                                  </div>
                                  {version.comments.map((comment, idx) => (
                                    <CommentItem
                                      key={`v${version.version}-${idx}`}
                                      comment={comment}
                                      reviewer={reviewer}
                                      version={version.version}
                                    />
                                  ))}
                                </div>
                              ))}
                            
                            {/* No comments message */}
                            {(!proposal.comments || proposal.comments.length === 0) && 
                            (!proposal.history || !proposal.history.some(v => v.comments && v.comments.length > 0)) && (
                              <p className="text-sm text-gray-500 italic break-words">
                                No comments found in the current version.
                              </p>
                            )}
                          </div>
                        </div>

                      <div className="bg-gray-700 p-4 rounded">
                        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                          <PenTool size={16} className="mr-1 flex-shrink-0" />
                          <span>Add Review:</span>
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
                                  reviewStatus === "Reviewed" 
                                    ? "bg-blue-700 text-white" 
                                    : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                                } whitespace-nowrap`}
                                onClick={() => setReviewStatus("Reviewed")}
                              >
                                <RefreshCw size={14} className="mr-1 flex-shrink-0" />
                                <span>Request Changes</span>
                              </button>
                              
                              <button
                                type="button"
                                className={`flex items-center justify-center px-3 py-2 rounded-md text-sm ${
                                  reviewStatus === "Approved" 
                                    ? "bg-green-700 text-white" 
                                    : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                                } whitespace-nowrap`}
                                onClick={() => setReviewStatus("Approved")}
                              >
                                <ThumbsUp size={14} className="mr-1 flex-shrink-0" />
                                <span>Approve</span>
                              </button>
                              
                              <button
                                type="button"
                                className={`flex items-center justify-center px-3 py-2 rounded-md text-sm ${
                                  reviewStatus === "Rejected" 
                                    ? "bg-red-700 text-white" 
                                    : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                                } whitespace-nowrap`}
                                onClick={() => setReviewStatus("Rejected")}
                              >
                                <ThumbsDown size={14} className="mr-1 flex-shrink-0" />
                                <span>Reject</span>
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
                              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white text-sm min-h-24 break-words whitespace-pre-wrap"
                              required
                            ></textarea>
                            <p className="text-xs text-gray-500 mt-1 break-words">
                              Please provide detailed feedback, especially if rejecting or requesting changes.
                            </p>
                          </div>
                          
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => handleSubmitReview(proposal.id)}
                              disabled={isSubmitting || !reviewComment.trim()}
                              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md py-2 flex items-center justify-center gap-2 transition whitespace-nowrap"
                            >
                              {isSubmitting ? (
                                <>
                                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full flex-shrink-0"></div>
                                  <span>Submitting...</span>
                                </>
                              ) : (
                                <>
                                  <Send size={16} className="flex-shrink-0" />
                                  <span>Submit Review</span>
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