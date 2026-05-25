"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/app/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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
  Users2,
  History,
} from "lucide-react";
import apiRequest from "@/utils/apiRequest";
import { ComboboxReviewer } from "@/components/ui/combo-box-reviewer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ReviewerProposalViewContent({ onBack, proposalId }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewer, setReviewer] = useState(null);
  const [error, setError] = useState(null);
  const [expandedProposal, setExpandedProposal] = useState(null);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState("Reviewed");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [nextReviewers, setNextReviewers] = useState([]);
  const [filteredReviewers, setFilteredReviewers] = useState([]);
  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [loadedVersions, setLoadedVersions] = useState({});
  const [versionsLoading, setVersionsLoading] = useState({});

  const commentInputRef = useRef(null);
  const router = useRouter();

  const loadMoreVersions = async (proposalId) => {
    setVersionsLoading((prev) => ({ ...prev, [proposalId]: true }));

    try {
      setLoadedVersions((prev) => ({
        ...prev,
        [proposalId]: (prev[proposalId] || 1) + 1,
      }));
    } catch (error) {
      console.error("Error loading more versions:", error);
    } finally {
      setVersionsLoading((prev) => ({ ...prev, [proposalId]: false }));
    }
  };

  useEffect(() => {
    if (proposals.length === 1 && proposals[0].id === expandedProposal) {
      const selectedProposalObj = proposals[0];
      const selectedDept = selectedProposalObj?.department;

      if (!selectedDept) {
        setFilteredReviewers([]);
        return;
      }

      const filtered = nextReviewers.filter((reviewer) => {
        const dept = reviewer.department;
        return typeof dept === "string"
          ? dept === selectedDept
          : Array.isArray(dept) && dept.includes(selectedDept);
      });

      setFilteredReviewers(filtered);
    }
  }, [expandedProposal, proposals, nextReviewers]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.error("No user found, redirecting to login");
        router.push("/login");
        return;
      }

      setLoading(true);
      try {
        const fetchProposalData = async (reviewerData) => {
          if (!proposalId) {
            setError("No proposal ID specified.");
            setProposals([]);
            return;
          }

          try {
            const proposal = await apiRequest(
              `/api/proposal/${proposalId}/history`,
              "GET",
            );

            if (proposal) {
              setProposals([proposal]);
              setExpandedProposal(proposal.id);
              setLoadedVersions({ [proposal.id]: 1 });
            } else {
              setError(`Proposal with ID ${proposalId} not found.`);
              setProposals([]);
            }
          } catch (queryErr) {
            console.error("Error fetching proposal:", queryErr);
            setError("Failed to fetch proposal: " + queryErr.message);
          }
        };

        const sessionAuth = sessionStorage.getItem("auth");
        const isUser = sessionStorage.getItem("user");
        const role = sessionStorage.getItem("role");
        const name = sessionStorage.getItem("name");
        const level = sessionStorage.getItem("level");
        let departments = [];

        try {
          const departmentsStr = sessionStorage.getItem("departments");
          if (departmentsStr) {
            departments = JSON.parse(departmentsStr);
          }
        } catch (e) {
          console.error("Error parsing departments:", e);
        }

        if (isUser === "true" && role && role.toLowerCase() === "reviewer") {
          const reviewerData = {
            uid: user.uid,
            email: user.email,
            displayName: name || "Reviewer",
            name: name || "Reviewer",
            departments: departments || [],
            level: level ? parseInt(level, 10) : undefined,
          };
          setReviewer(reviewerData);
          await fetchProposalData(reviewerData);
          setLoading(false);
          return;
        }

        const reviewerRef = doc(db, "Reviewers", user.uid);
        const reviewerDoc = await getDoc(reviewerRef);

        if (!reviewerDoc.exists()) {
          throw new Error(
            "You don't have reviewer privileges. Please contact the administrator.",
          );
        }

        const reviewerData = reviewerDoc.data();

        let userDepartments = reviewerData.department || [];
        if (!Array.isArray(userDepartments)) {
          userDepartments =
            typeof userDepartments === "object"
              ? Object.values(userDepartments)
              : [userDepartments];
        }

        if (!userDepartments || userDepartments.length === 0) {
          throw new Error(
            "No departments are assigned to your reviewer account.",
          );
        }

        const authSession = {
          authenticated: true,
          name: reviewerData.name || "Reviewer",
          role: "Reviewer",
          departments: userDepartments,
          level: reviewerData.level,
        };

        sessionStorage.setItem("auth", JSON.stringify(authSession));
        sessionStorage.setItem("user", "true");
        sessionStorage.setItem("role", "Reviewer");
        sessionStorage.setItem("name", reviewerData.name || "");
        sessionStorage.setItem("departments", JSON.stringify(userDepartments));
        sessionStorage.setItem("level", reviewerData.level);

        const fullReviewerData = {
          uid: user.uid,
          email: user.email,
          displayName: reviewerData.name || "Reviewer",
          name: reviewerData.name || "Reviewer",
          departments: userDepartments,
          level: reviewerData.level,
          ...reviewerData,
        };

        setReviewer(fullReviewerData);
        await fetchProposalData(fullReviewerData);
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
  }, [router, proposalId]);

  useEffect(() => {
    const fetchReviewerData = async () => {
      if (
        !reviewer?.uid ||
        reviewer.level === undefined ||
        reviewer.level === null
      ) {
        return;
      }

      try {
        const nextLevel = parseInt(reviewer.level) + 1;
        const reviewersRes = await apiRequest(
          `/api/reviewer?level=${nextLevel}`,
        );
        setNextReviewers(reviewersRes);
      } catch (err) {
        console.error("Error loading reviewer data:", err);
      }
    };
    if (reviewer) {
      fetchReviewerData();
    }
  }, [reviewer]);

  const CommentItem = ({ comment, reviewer, version }) => {
    const isReviewerComment = Boolean(comment.reviewerName);
    const isUserComment = Boolean(comment.authorName || comment.authorType);

    let displayName = "Unknown";
    let borderColor = "border-gray-500";
    let nameColor = "text-gray-400";

    if (isReviewerComment) {
      displayName = comment.reviewerName;
      borderColor = "border-blue-500";
      nameColor = "text-blue-400";

      if (comment.reviewerName === (reviewer?.displayName || reviewer?.name)) {
        displayName = "You";
      }
    } else if (isUserComment) {
      displayName = comment.authorName || "User";
      borderColor = "border-green-500";
      nameColor = "text-green-400";
    }

    const isCurrentReviewer =
      isReviewerComment &&
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
    if (
      !reviewComment.trim() ||
      (reviewStatus === "Approved" && reviewer.level < 1 && !selectedReviewer)
    ) {
      alert(
        "Please provide a review comment or select next reviewer before submitting.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      if (
        reviewStatus === "Approved" &&
        selectedReviewer != null &&
        selectedReviewer != undefined
      ) {
        const fullReviewer = nextReviewers.find(
          (r) => r.id === selectedReviewer,
        );

        if (!fullReviewer) {
          alert("Reviewer not found in nextReviewers list.");
          return;
        }
        await apiRequest(`/api/proposal/${proposalId}/forward`, {
          method: "POST",
          body: JSON.stringify({
            decision: "approved",
            comments: reviewComment,
            currentReviewer: {
              reviewerId: reviewer.uid,
              name: reviewer.name,
              email: reviewer.email,
              level: reviewer.level,
            },
            nextReviewer: {
              reviewerId: fullReviewer.id,
              name: fullReviewer.name,
              email: fullReviewer.email,
              level: fullReviewer.level,
            },
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        setProposals((prevProposals) =>
          prevProposals.map((proposal) =>
            proposal.id === proposalId
              ? {
                  ...proposal,
                  status: "pending",
                  currentReviewer: selectedReviewer,
                  reviewerHistory: [
                    ...(proposal.reviewerHistory || []),
                    {
                      ...reviewer,
                      level: proposal.level || 1,
                      decision: "approved",
                      comments: reviewComment,
                      reviewedAt: new Date(),
                    },
                  ],
                  comments: [
                    ...(proposal.comments || []),
                    {
                      text: reviewComment,
                      reviewerName:
                        reviewer.displayName || reviewer.name || "Reviewer",
                      timestamp: new Date(),
                      status: "approved",
                    },
                  ],
                }
              : proposal,
          ),
        );
      } else if (reviewStatus === "Approved") {
        const nextLevel = parseInt(reviewer.level) + 1;
        const isFinalApproval = reviewer.level == 3;

        await apiRequest(`/api/proposal/${proposalId}/forward`, {
          method: "POST",
          body: JSON.stringify({
            decision: "approved",
            comments: reviewComment,
            currentReviewer: {
              reviewerId: reviewer.uid,
              name: reviewer.name,
              email: reviewer.email,
              level: reviewer.level,
            },
            nextReviewer: {
              reviewerId: "",
              name: "",
              email: "",
              level: nextLevel,
            },
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const newStatus = isFinalApproval ? "approved" : "pending";

        setProposals((prevProposals) =>
          prevProposals.map((proposal) =>
            proposal.id === proposalId
              ? {
                  ...proposal,
                  status: newStatus,
                  currentReviewer: isFinalApproval ? "" : "",
                  reviewerHistory: [
                    ...(proposal.reviewerHistory || []),
                    {
                      ...reviewer,
                      level: reviewer.level,
                      decision: "approved",
                      comments: reviewComment,
                      reviewedAt: new Date(),
                    },
                  ],
                  comments: [
                    ...(proposal.comments || []),
                    {
                      text: reviewComment,
                      reviewerName:
                        reviewer.displayName || reviewer.name || "Reviewer",
                      timestamp: new Date(),
                      status: "approved",
                    },
                  ],
                }
              : proposal,
          ),
        );
      } else {
        await apiRequest(`/api/proposal/${proposalId}/status`, {
          method: "PUT",
          body: JSON.stringify({
            newStatus: reviewStatus,
            remarks: reviewComment,
            userId: reviewer.uid,
          }),
        });

        setProposals((prevProposals) =>
          prevProposals.map((proposal) =>
            proposal.id === proposalId
              ? {
                  ...proposal,
                  status: reviewStatus,
                  comments: [
                    ...(proposal.comments || []),
                    {
                      text: reviewComment,
                      reviewerName:
                        reviewer.displayName || reviewer.name || "Reviewer",
                      timestamp: new Date(),
                      status: reviewStatus,
                    },
                  ],
                }
              : proposal,
          ),
        );
      }

      setSuccessMessage(
        `Proposal status updated to "${reviewStatus}" successfully!`,
      );
      setReviewComment("");

      setTimeout(() => {
        setExpandedProposal(null);
        setSuccessMessage("");
        onBack();
      }, 3000);
    } catch (err) {
      console.error("Error updating proposal status:", err);
      alert("Failed to update proposal status. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        return (
          <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full whitespace-nowrap">
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full whitespace-nowrap">
            Rejected
          </span>
        );
      case "reviewed":
        return (
          <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full whitespace-nowrap">
            Reviewed
          </span>
        );
      case "pending":
      default:
        return (
          <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full whitespace-nowrap">
            Pending Review
          </span>
        );
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "No date";

    try {
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleString();
      }

      if (typeof timestamp.toDate === "function") {
        return timestamp.toDate().toLocaleString();
      }

      const date = new Date(timestamp);
      return !isNaN(date.getTime()) ? date.toLocaleString() : "Invalid date";
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Invalid date";
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

    const versionsToDisplay = proposal.versionDetails.slice(
      0,
      loadedVersions[proposal.id] || 1,
    );

    return (
      <div className="space-y-8">
        {versionsToDisplay.map((version, index) => (
          <div
            key={index}
            className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2">
              <h3 className="font-medium text-lg text-white flex items-center gap-2">
                <History size={20} />
                Version {version.version}
                {index === 0 && (
                  <span className="text-xs font-normal text-blue-400">
                    (Latest)
                  </span>
                )}
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 gap-1">
                {getStatusBadge(version.status)}
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {formatTimestamp(version.timestamp)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4 min-w-0">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">
                    Update Remarks:
                  </h4>
                  <p className="text-sm text-gray-400 bg-gray-700 p-3 rounded break-words whitespace-pre-wrap">
                    {version.remarks || "No remarks provided"}
                  </p>
                </div>

                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">
                    Proposal Details:
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-xs font-medium text-gray-400">
                        Title:
                      </h5>
                      <p className="text-sm text-gray-300 break-words">
                        {version.title || "No title provided"}
                      </p>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium text-gray-400">
                        Description:
                      </h5>
                      <p className="text-sm text-gray-400 break-words whitespace-pre-wrap">
                        {version.description || "No description provided"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">
                    Key Information:
                  </h4>

                  <div className="space-y-3">
                    {version.objectives && (
                      <div className="break-words">
                        <h5 className="text-xs font-medium text-gray-400">
                          Objectives:
                        </h5>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {version.objectives}
                        </p>
                      </div>
                    )}

                    {version.outcomes && (
                      <div className="break-words">
                        <h5 className="text-xs font-medium text-gray-400">
                          Expected Outcomes:
                        </h5>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {version.outcomes}
                        </p>
                      </div>
                    )}

                    {version.participantEngagement && (
                      <div className="break-words">
                        <h5 className="text-xs font-medium text-gray-400">
                          Participant Engagement:
                        </h5>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {version.participantEngagement}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">
                    Additional Information:
                  </h4>

                  <div className="grid grid-cols-1 gap-3">
                    {version.targetAudience && (
                      <div className="col-span-1 break-words">
                        <h5 className="text-xs font-medium text-gray-400 flex items-center gap-1">
                          <Target size={14} /> Target Audience
                        </h5>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {version.targetAudience}
                        </p>
                      </div>
                    )}

                    {version.duration && (
                      <div className="break-words">
                        <h5 className="text-xs font-medium text-gray-400">
                          Duration:
                        </h5>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {version.duration}
                        </p>
                      </div>
                    )}

                    {version.registrationFee !== undefined && (
                      <div className="break-words">
                        <h5 className="text-xs font-medium text-gray-400">
                          Registration Fee:
                        </h5>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap flex items-center">
                          <IndianRupee size={14} className="mr-1" />
                          {version.registrationFee || "Free"}
                        </p>
                      </div>
                    )}

                    {version.maxSeats && (
                      <div className="break-words">
                        <h5 className="text-xs font-medium text-gray-400">
                          Maximum Seats:
                        </h5>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {version.maxSeats}
                        </p>
                      </div>
                    )}

                    {(version.expectedIncome !== undefined ||
                      version.expectedExpense !== undefined ||
                      version.estimatedBudget !== undefined) &&
                      (() => {
                        const income = version.expectedIncome || 0;
                        const expense =
                          version.expectedExpense ||
                          version.estimatedBudget ||
                          0;
                        return (
                          <div className="break-words">
                            <h5 className="text-xs font-medium text-gray-400">
                              Budget
                            </h5>
                            <p className="text-sm text-green-400 whitespace-pre-wrap flex items-center">
                              Income:
                              <IndianRupee
                                size={14}
                                className="ml-1.5 mr-0.5"
                              />
                              {income}
                            </p>
                            <p className="text-sm text-red-400 whitespace-pre-wrap flex items-center">
                              Expense:
                              <IndianRupee
                                size={14}
                                className="ml-1.5 mr-0.5"
                              />
                              {expense}
                            </p>
                          </div>
                        );
                      })()}

                    {version.potentialFundingSource && (
                      <div className="break-words">
                        <h5 className="text-xs font-medium text-gray-400">
                          Funding Source:
                        </h5>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {version.potentialFundingSource}
                        </p>
                      </div>
                    )}

                    {version.resourcePersonDetails && (
                      <div className="break-words">
                        <h5 className="text-xs font-medium text-gray-400">
                          Resource Person:
                        </h5>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {version.resourcePersonDetails}
                        </p>
                        <div className="text-sm text-gray-300 mt-1">
                          {version.isResourcePersonPaid ? (
                            <span className="flex items-center text-yellow-400">
                              Will be paid:
                              <IndianRupee
                                size={14}
                                className="ml-1.5 mr-0.5"
                              />
                              {version.resourcePersonPayment || 0}
                            </span>
                          ) : (
                            "Will not be paid"
                          )}
                        </div>
                      </div>
                    )}

                    {version.externalResources && (
                      <div className="break-words">
                        <h5 className="text-xs font-medium text-gray-400">
                          External Resources:
                        </h5>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {version.externalResources}
                        </p>
                      </div>
                    )}

                    {version.additionalRequirements && (
                      <div className="col-span-1 break-words">
                        <h5 className="text-xs font-medium text-gray-400">
                          Additional Requirements:
                        </h5>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {version.additionalRequirements}
                        </p>
                      </div>
                    )}

                    {!version.isIndividual && version.groupDetails && (
                      <div className="col-span-1 break-words bg-gray-800 p-3 rounded">
                        <h5 className="text-xs font-medium text-gray-400 flex items-center gap-1">
                          <Users2 size={14} /> Group Registration Details
                        </h5>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <p className="text-xs text-gray-500">
                              Max Members:
                            </p>
                            <p className="text-sm text-gray-300">
                              {version.groupDetails.maxGroupMembers ||
                                "Not specified"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Fee Type:</p>
                            <p className="text-sm text-gray-300 capitalize">
                              {version.groupDetails.feeType === "perhead"
                                ? "Per Head"
                                : "Per Group"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {version.preferredDays && (
                      <div className="col-span-1 break-words bg-gray-800 p-3 rounded">
                        <h5 className="text-xs font-medium text-gray-400 flex items-center gap-1">
                          <Calendar size={14} /> Preferred Schedule
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                          {version.preferredDays.day1 && (
                            <div>
                              <p className="text-xs text-gray-500">Day 1:</p>
                              <p className="text-sm text-gray-300">
                                {version.preferredDays.day1}
                              </p>
                            </div>
                          )}
                          {version.preferredDays.day2 && (
                            <div>
                              <p className="text-xs text-gray-500">Day 2:</p>
                              <p className="text-sm text-gray-300">
                                {version.preferredDays.day2}
                              </p>
                            </div>
                          )}
                          {version.preferredDays.day3 && (
                            <div>
                              <p className="text-xs text-gray-500">Day 3:</p>
                              <p className="text-sm text-gray-300">
                                {version.preferredDays.day3}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="col-span-1 break-words">
                      <h5 className="text-xs font-medium text-gray-400">
                        Event Details:
                      </h5>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {version.isEvent !== undefined && (
                          <span className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded-full whitespace-nowrap">
                            {version.isEvent ? "Event" : "Workshop"}
                          </span>
                        )}
                        {version.isTechnical !== undefined && (
                          <span className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded-full whitespace-nowrap">
                            {version.isTechnical
                              ? "Technical"
                              : "Non-Technical"}
                          </span>
                        )}
                        {version.isIndividual !== undefined && (
                          <span className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded-full whitespace-nowrap">
                            {version.isIndividual ? "Individual" : "Group"}
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
                    <span>
                      {index === 0
                        ? "Discussion"
                        : `Discussion for Version ${version.version}`}
                    </span>
                  </h4>

                  <div className="bg-gray-700 p-4 rounded max-h-96 overflow-y-auto space-y-3">
                    {version.comments && version.comments.length > 0 ? (
                      [...version.comments]
                        .sort((a, b) => {
                          const timeA = a.timestamp?.seconds
                            ? a.timestamp.seconds * 1000
                            : new Date(a.timestamp).getTime();
                          const timeB = b.timestamp?.seconds
                            ? b.timestamp.seconds * 1000
                            : new Date(b.timestamp).getTime();
                          return timeA - timeB;
                        })
                        .map((comment, idx) => (
                          <CommentItem
                            key={`v${version.version}-${idx}`}
                            comment={comment}
                            reviewer={reviewer}
                            version={version.version}
                          />
                        ))
                    ) : (
                      <p className="text-sm text-gray-500 italic break-words">
                        No comments for this version.
                      </p>
                    )}
                  </div>
                </div>

                {index === 0 &&
                  (proposal.currentReviewer?.reviewerId === reviewer?.uid ||
                    reviewer?.level === 2) && (
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
                              <RefreshCw
                                size={14}
                                className="mr-1 flex-shrink-0"
                              />
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
                              <ThumbsUp
                                size={14}
                                className="mr-1 flex-shrink-0"
                              />
                              <span>{"Approve"}</span>
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
                              <ThumbsDown
                                size={14}
                                className="mr-1 flex-shrink-0"
                              />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>

                        {reviewStatus === "Approved" && reviewer.level < 1 && (
                          <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                              Select next reviewer
                            </label>

                            <ComboboxReviewer
                              options={filteredReviewers.map((r) => ({
                                value: r.id,
                                label: `${r.name} - [ ${r.email} ]`,
                              }))}
                              selected={selectedReviewer}
                              setSelected={setSelectedReviewer}
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Review Comment:
                          </label>
                          <Textarea
                            ref={commentInputRef}
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Enter your review comments here..."
                            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white text-sm min-h-24 break-words whitespace-pre-wrap"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1 break-words">
                            Please provide detailed feedback, especially if
                            rejecting or requesting changes.
                          </p>
                        </div>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => handleSubmitReview(proposal.id)}
                            disabled={
                              isSubmitting ||
                              !reviewComment.trim() ||
                              (reviewStatus === "Approved" &&
                                reviewer?.level < 1 &&
                                !selectedReviewer)
                            }
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
                  )}
              </div>
            </div>
          </div>
        ))}

        {proposal.versionDetails.length >
          (loadedVersions[proposal.id] || 1) && (
          <div className="text-center mt-4">
            <button
              onClick={() => loadMoreVersions(proposal.id)}
              disabled={versionsLoading[proposal.id]}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm flex items-center justify-center mx-auto disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <History size={16} className="mr-2" />
              {versionsLoading[proposal.id]
                ? "Loading..."
                : "Load Previous Version"}
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
              Return to Proposals List
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
        <Button onClick={onBack} variant="outline">
          Back to List
        </Button>
      </div>

      {successMessage && (
        <div className="bg-green-900/50 border border-green-700 text-green-200 p-4 rounded-md mb-6 break-words">
          {successMessage}
        </div>
      )}

      {proposals.length === 0 && !loading && (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <File className="h-12 w-12 mx-auto mb-4 text-gray-500" />
          <p className="text-gray-400 break-words">
            No proposal found or you may not have permission to view it.
          </p>
          <p className="text-sm text-gray-500 mt-2 break-words">
            Please check the proposal ID and try again.
          </p>
        </div>
      )}

      {proposals.length > 0 && (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <div
              key={proposal.id}
              className={`bg-gray-800 rounded-lg border ${
                expandedProposal === proposal.id
                  ? "border-blue-500"
                  : "border-gray-700"
              } transition-all`}
            >
              <div className="p-4 cursor-pointer flex justify-between items-center">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0">
                    {getStatusIcon(proposal.status)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-white truncate">
                      {proposal.title || "Untitled Proposal"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mt-1">
                      <span className="flex items-center whitespace-nowrap">
                        <Calendar size={12} className="mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {formatTimestamp(proposal.createdAt)}
                        </span>
                      </span>
                      {proposal.department && (
                        <span className="flex items-center whitespace-nowrap">
                          <Layers size={12} className="mr-1 flex-shrink-0" />
                          <span className="truncate">
                            {proposal.department}
                          </span>
                        </span>
                      )}
                      {proposal.proposerName && (
                        <span className="flex items-center whitespace-nowrap">
                          <User size={12} className="mr-1 flex-shrink-0" />
                          <span className="truncate">
                            {proposal.proposerName}
                          </span>
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
                  {(proposal.currentReviewer?.reviewerId === reviewer?.uid ||
                    reviewer?.level === 2) && (
                    <div className="hidden sm:block text-sm text-white">
                      {getStatusBadge(proposal.status)}
                    </div>
                  )}
                  {expandedProposal === proposal.id ? (
                    <ChevronUp
                      size={18}
                      className="text-gray-400 flex-shrink-0"
                    />
                  ) : (
                    <ChevronDown
                      size={18}
                      className="text-gray-400 flex-shrink-0"
                    />
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
