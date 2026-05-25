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
  MessageSquare,
  Target,
  Layers,
  Send,
  Info,
} from "lucide-react";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import apiRequest from "@/utils/apiRequest";

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

  if (typeof timestamp === "string") {
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
    case "under review":
      return (
        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full whitespace-nowrap">
          Under Review
        </span>
      );
    case "requested changes":
      return (
        <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded-full whitespace-nowrap">
          Changes Requested
        </span>
      );
    case "reviewed":
      return (
        <span className="px-2 py-1 bg-blue-400 text-white text-xs rounded-full whitespace-nowrap">
          Reviewed
        </span>
      );
    case "created":
      return (
        <span className="px-2 py-1 bg-blue-400 text-white text-xs rounded-full whitespace-nowrap">
          Created
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full whitespace-nowrap">
          Pending Review
        </span>
      );
  }
};

function VersionDetails({ proposal: initialProposal, auth }) {
  const [proposal, setProposal] = useState(initialProposal);
  const [loadedVersionsCount, setLoadedVersionsCount] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [newReply, setNewReply] = useState("");

  const loadMoreVersions = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setLoadedVersionsCount((prev) => prev + 1);
      setIsLoadingMore(false);
    }, 500); // Simulate network delay
  };

  const submitReply = async (proposalId) => {
    if (!newReply.trim()) return;

    try {
      const replyData = {
        text: newReply,
        timestamp: new Date(),
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || "Proposer",
        authorType: "proposer",
        version: proposal.version || 1,
      };

      await apiRequest(`/api/proposal/${proposalId}/reply`, {
        method: "POST",
        body: JSON.stringify(replyData),
      });

      const updatedProposal = await apiRequest(
        `/api/proposal/${proposalId}/history`,
      );
      setProposal(updatedProposal); // Refresh the proposal data
      setNewReply("");
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  if (!proposal.versionDetails || proposal.versionDetails.length === 0) {
    return (
      <div className="text-sm text-gray-400 py-4">
        No version history available for this proposal.
      </div>
    );
  }

  const versionsToDisplay = proposal.versionDetails.slice(
    0,
    loadedVersionsCount,
  );

  return (
    <div className="space-y-8">
      {versionsToDisplay.map((version, index) => (
        <div
          key={index}
          className="bg-gray-800 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2">
            <h3 className="font-medium text-lg text-white flex items-center gap-2">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <div className="lg:col-span-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className="space-y-4">
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
                          {version.title || "No title"}
                        </p>
                      </div>

                      <div>
                        <h5 className="text-xs font-medium text-gray-400">
                          Description:
                        </h5>
                        <p className="text-sm text-gray-300 break-words">
                          {version.description || "No description provided"}
                        </p>
                      </div>

                      {version.objectives && (
                        <div>
                          <h5 className="text-xs font-medium text-gray-400">
                            Objectives:
                          </h5>
                          {Array.isArray(version.objectives) ? (
                            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                              {version.objectives.map((obj, idx) => (
                                <li key={idx} className="break-words">
                                  {obj}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-300 break-words">
                              {version.objectives}
                            </p>
                          )}
                        </div>
                      )}

                      {version.outcomes && (
                        <div>
                          <h5 className="text-xs font-medium text-gray-400">
                            Expected Outcomes:
                          </h5>
                          {Array.isArray(version.outcomes) ? (
                            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                              {version.outcomes.map((outcome, idx) => (
                                <li key={idx} className="break-words">
                                  {outcome}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-300 break-words">
                              {version.outcomes}
                            </p>
                          )}
                        </div>
                      )}

                      {version.participantEngagement && (
                        <div>
                          <h5 className="text-xs font-medium text-gray-400">
                            Participant Engagement:
                          </h5>
                          <p className="text-sm text-gray-300 break-words">
                            {version.participantEngagement}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-700 p-4 rounded">
                      <h4 className="text-sm font-medium text-gray-300 mb-3">
                        Additional Information:
                      </h4>

                      <div className="space-y-4 text-sm text-gray-300 break-words">
                        {/* Target Audience */}
                        {version.targetAudience && (
                          <div>
                            <h5 className="text-xs font-medium text-gray-400 flex items-center gap-1">
                              <Target size={14} /> Target Audience
                            </h5>
                            <p className="text-sm text-gray-300 break-words">
                              {version.targetAudience}
                            </p>
                          </div>
                        )}

                        {/* Preferred Days */}
                        {version.preferredDays && (
                          <div className="col-span-2 mt-2">
                            <h5 className="text-xs font-medium text-gray-400 flex items-center gap-1">
                              <Calendar size={14} /> Preferred Days
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                              {version.preferredDays.day1 && (
                                <div className="bg-gray-600 p-2 rounded break-words">
                                  <span className="text-xs text-gray-300">
                                    Day 1:
                                  </span>
                                  <p className="text-sm text-white">
                                    {version.preferredDays.day1}
                                  </p>
                                </div>
                              )}
                              {version.preferredDays.day2 && (
                                <div className="bg-gray-600 p-2 rounded break-words">
                                  <span className="text-xs text-gray-300">
                                    Day 2:
                                  </span>
                                  <p className="text-sm text-white">
                                    {version.preferredDays.day2}
                                  </p>
                                </div>
                              )}
                              {version.preferredDays.day3 && (
                                <div className="bg-gray-600 p-2 rounded break-words">
                                  <span className="text-xs text-gray-300">
                                    Day 3:
                                  </span>
                                  <p className="text-sm text-white">
                                    {version.preferredDays.day3}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Group Details */}
                        {version.groupDetails && !version.isIndividual && (
                          <div className="col-span-2 bg-gray-600 p-3 rounded mt-2">
                            <h5 className="text-xs font-medium text-gray-300 flex items-center gap-1">
                              <Users size={14} /> Group Details
                            </h5>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div>
                                <span className="text-xs text-gray-400">
                                  Max Members:
                                </span>
                                <p className="text-sm text-white break-words">
                                  {version.groupDetails.maxGroupMembers}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs text-gray-400">
                                  Fee Type:
                                </span>
                                <p className="text-sm text-white capitalize break-words">
                                  {version.groupDetails.feeType}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Additional Requirements */}
                        {version.additionalRequirements && (
                          <div className="col-span-2 mt-2">
                            <h5 className="text-xs font-medium text-gray-400 flex items-center gap-1">
                              <Layers size={14} /> Additional Requirements
                            </h5>
                            <p className="text-sm text-gray-300 mt-1 break-words">
                              {version.additionalRequirements}
                            </p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          {/* Duration */}
                          {version.duration && (
                            <div>
                              <h5 className="text-xs font-medium text-gray-400">
                                Duration:
                              </h5>
                              <p className="text-sm text-gray-300 break-words">
                                {version.duration}
                              </p>
                            </div>
                          )}

                          {/* Registration Fee */}
                          {version.registrationFee !== undefined && (
                            <div>
                              <h5 className="text-xs font-medium text-gray-400">
                                Registration Fee:
                              </h5>
                              <p className="text-sm text-gray-300 break-words">
                                ₹{version.registrationFee || "Free"}
                              </p>
                            </div>
                          )}

                          {/* Maximum Seats */}
                          {version.maxSeats && (
                            <div>
                              <h5 className="text-xs font-medium text-gray-400">
                                Maximum Seats:
                              </h5>
                              <p className="text-sm text-gray-300 break-words">
                                {version.maxSeats}
                              </p>
                            </div>
                          )}

                          {/* Budget */}
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
                                <div>
                                  <h5 className="text-xs font-medium text-gray-400">
                                    Budget (₹)
                                  </h5>
                                  <p className="text-sm text-gray-300 break-words">
                                    Income:{" "}
                                    <span className="font-medium text-green-400">
                                      ₹{income}
                                    </span>
                                  </p>
                                  <p className="text-sm text-gray-300 break-words">
                                    Expense:{" "}
                                    <span className="font-medium text-red-400">
                                      ₹{expense}
                                    </span>
                                  </p>
                                </div>
                              );
                            })()}
                        </div>

                        {/* Funding Source */}
                        {version.potentialFundingSource && (
                          <div>
                            <h5 className="text-xs font-medium text-gray-400">
                              Funding Source:
                            </h5>
                            <p className="text-sm text-gray-300 break-words">
                              {version.potentialFundingSource}
                            </p>
                          </div>
                        )}

                        {/* Resource Person */}
                        {version.resourcePersonDetails && (
                          <div>
                            <h5 className="text-xs font-medium text-gray-400">
                              Resource Person:
                            </h5>
                            <p className="text-sm text-gray-300 break-words">
                              {version.resourcePersonDetails}
                            </p>
                            <p className="text-sm text-gray-300 break-words mt-1">
                              {version.isResourcePersonPaid
                                ? `Paid: ₹${version.resourcePersonPayment || 0}`
                                : "Not Paid"}
                            </p>
                          </div>
                        )}

                        {/* External Resources */}
                        {version.externalResources && (
                          <div>
                            <h5 className="text-xs font-medium text-gray-400">
                              External Resources:
                            </h5>
                            <p className="text-sm text-gray-300 break-words">
                              {version.externalResources}
                            </p>
                          </div>
                        )}

                        {/* Type Badges */}
                        <div>
                          <h5 className="text-xs font-medium text-gray-400">
                            Type:
                          </h5>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {version.isEvent && (
                              <span className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded-full whitespace-nowrap">
                                Event
                              </span>
                            )}
                            {version.isTechnical && (
                              <span className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded-full whitespace-nowrap">
                                Technical
                              </span>
                            )}
                            {!version.isEvent && !version.isTechnical && (
                              <span className="text-sm text-gray-300 whitespace-nowrap">
                                Standard
                              </span>
                            )}
                            {version.isIndividual ? (
                              <span className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded-full whitespace-nowrap">
                                Individual
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded-full whitespace-nowrap">
                                Group
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <MessageSquare size={16} className="mr-1" />
                  {index === 0
                    ? "Discussion"
                    : `Discussion for Version ${version.version}`}
                </h4>

                {version.comments?.length > 0 ? (
                  <div className="bg-gray-700 p-4 rounded max-h-96 overflow-y-auto space-y-4">
                    {version.comments
                      .sort(
                        (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
                      )
                      .map((item, idx) => {
                        const isCurrentUser =
                          item.authorId === auth.currentUser?.uid;
                        return (
                          <div
                            key={idx}
                            className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                isCurrentUser
                                  ? "bg-green-900/30 border-t-4 border-green-500 rounded-tr-none"
                                  : "bg-blue-900/30 border-t-4 border-blue-500 rounded-tl-none"
                              }`}
                            >
                              <div
                                className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} justify-between items-start mb-1 gap-2`}
                              >
                                <span
                                  className={`text-xs font-medium ${
                                    isCurrentUser
                                      ? "text-green-400"
                                      : "text-blue-400"
                                  }`}
                                >
                                  {isCurrentUser
                                    ? "You"
                                    : (item.reviewerName ?? "Reviewer")}
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
                                  <div className="text-xs font-medium text-gray-300 mb-1">
                                    Suggestions:
                                  </div>
                                  <ul className="text-sm text-gray-200 list-disc pl-5 space-y-1">
                                    {Array.isArray(item.suggestions) ? (
                                      item.suggestions.map(
                                        (suggestion, sIdx) => (
                                          <li
                                            key={sIdx}
                                            className="break-words"
                                          >
                                            {suggestion}
                                          </li>
                                        ),
                                      )
                                    ) : (
                                      <li className="break-words">
                                        {item.suggestions}
                                      </li>
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
                      {index === 0
                        ? "No discussion yet"
                        : "No discussion available for this version."}
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
                          if (e.key === "Enter" && newReply.trim()) {
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
              </div>
              <div className="space-y-4">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">
                    Update Remarks:
                  </h4>
                  <p className="text-sm text-gray-400 bg-gray-700 p-3 rounded break-words">
                    {version.remarks || "No remarks provided"}
                  </p>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <Info size={16} className="mr-1" />
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
                      Updated by: {version.updatedBy || "Unknown"} on{" "}
                      {formatTimestamp(version.timestamp)}
                    </div>
                  </div>
                </div>

                {proposal.reviewerHistory &&
                  proposal.reviewerHistory.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                        <History size={16} className="mr-1" />
                        Review History:
                      </h4>

                      <div className="space-y-2">
                        {proposal.reviewerHistory.map((entry, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-700 p-3 rounded shadow-sm border border-gray-600"
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-lg text-gray-300 font-semibold capitalize">
                                {entry.name || "Unknown Reviewer"}
                              </div>
                              <div className="text-xs text-gray-400 italic">
                                Level {entry.level ?? "N/A"}
                              </div>
                            </div>
                            <div className="mt-1 text-sm text-gray-300">
                              Decision:{" "}
                              <span
                                className={`capitalize font-medium ${
                                  entry.decision === "approved"
                                    ? "text-green-400"
                                    : entry.decision === "rejected"
                                      ? "text-red-400"
                                      : "text-gray-300"
                                }`}
                              >
                                {entry.decision}
                              </span>
                            </div>

                            {entry.comments && (
                              <div className="mt-1 text-sm text-gray-400">
                                Comments: {entry.comments}
                              </div>
                            )}
                            <div className="mt-1 text-xs text-gray-400">
                              Reviewed at: {formatTimestamp(entry.reviewedAt)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {proposal.versionDetails.length > loadedVersionsCount && (
        <div className="text-center mt-4">
          <button
            onClick={loadMoreVersions}
            disabled={isLoadingMore}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm flex items-center justify-center mx-auto disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <History size={16} className="mr-2" />
            {isLoadingMore ? "Loading..." : "Load Previous Version"}
          </button>
        </div>
      )}
    </div>
  );
}

function SingleProposalView({ proposalId, onBack, auth, router }) {
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        setLoading(true);
        const fetchedProposal = await apiRequest(
          `/api/proposal/${proposalId}/history`,
        );
        setProposal(fetchedProposal);
      } catch (err) {
        console.error("Failed to fetch proposal:", err);
      } finally {
        setLoading(false);
      }
    };

    if (proposalId) {
      fetchProposal();
    }
  }, [proposalId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-400">Proposal not found.</p>
      </div>
    );
  }

  return (
    <div className="pb-10 px-4 sm:pr-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-white">
          <br />
          Proposal Tracking Details
        </h1>
        <button
          onClick={() => (onBack ? onBack() : router.push("/proposaltracking"))}
          className="flex items-center text-blue-400 hover:text-blue-300 transition whitespace-nowrap"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to all proposals
        </button>
      </div>
      <VersionDetails proposal={proposal} auth={auth} />
    </div>
  );
}

function ProposalListView({ auth }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedProposal, setExpandedProposal] = useState(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    const fetchProposals = async () => {
      if (!auth.currentUser) {
        console.error("User not authenticated!");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchedProposals = await apiRequest(
          `/api/user/${auth.currentUser.uid}/proposals`,
        );
        setProposals(fetchedProposals);

        setStatistics({
          total: fetchedProposals.length,
          pending: fetchedProposals.filter((p) => p.status === "Pending")
            .length,
          approved: fetchedProposals.filter((p) => p.status === "Approved")
            .length,
          rejected: fetchedProposals.filter((p) => p.status === "Rejected")
            .length,
        });
      } catch (err) {
        console.error("Failed to fetch proposals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [auth.currentUser]);

  const filteredProposals =
    filter === "all"
      ? proposals
      : proposals.filter(
          (p) => p.status?.toLowerCase() === filter.toLowerCase(),
        );

  const toggleExpand = (id) => {
    setExpandedProposal(expandedProposal === id ? null : id);
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
          <br />
          Proposal Tracking
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-400">
                Total Proposals
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {statistics.total}
              </h3>
            </div>
            <BarChart4 size={20} className="text-blue-500" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Pending</p>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {statistics.pending}
              </h3>
            </div>
            <Clock size={20} className="text-yellow-500" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Approved</p>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {statistics.approved}
              </h3>
            </div>
            <CheckCircle size={20} className="text-green-500" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Rejected</p>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {statistics.rejected}
              </h3>
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
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

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
              className={`bg-gray-800 rounded-lg border ${
                expandedProposal === proposal.id
                  ? "border-blue-500"
                  : "border-gray-700"
              } transition-all`}
            >
              <div
                className="p-4 cursor-pointer flex justify-between items-center"
                onClick={() => toggleExpand(proposal.id)}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {getStatusIcon(proposal.status)}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-white truncate">
                      {proposal.title || "Untitled Proposal"}
                    </h3>
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
                          <DollarSign size={12} className="mr-1" />₹
                          {proposal.registrationFee || "Free"}
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
                  <VersionDetails proposal={proposal} auth={auth} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProposalTrackingContent({ proposalId, onBack }) {
  const auth = getAuth();
  const router = useRouter();

  if (proposalId) {
    return (
      <SingleProposalView
        proposalId={proposalId}
        onBack={onBack}
        auth={auth}
        router={router}
      />
    );
  }

  return <ProposalListView auth={auth} />;
}
