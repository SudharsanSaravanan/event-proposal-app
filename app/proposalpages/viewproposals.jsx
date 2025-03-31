"use client";

import { useEffect, useState, useRef } from "react";
import { getUserProposals } from "../firebase/config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Edit2, BarChart2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ViewProposalsContent({ onEditProposal, onTrackProposal }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const router = useRouter();
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setError(null);
      } else {
        setUserId(null);
        setError("You must be logged in to view proposals.");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      const fetchProposals = async () => {
        try {
          setLoading(true);
          const data = await getUserProposals(userId);
          setProposals(data);
          setError(null);
          setTimeout(() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 100);
        } catch (error) {
          console.error("Error fetching proposals:", error);
          setError("Failed to load proposals. Please try again.");
          setProposals([]); // Clear proposals on error
        } finally {
          setLoading(false);
        }
      };
      fetchProposals();
    }
  }, [userId]);

  const handleEdit = (proposalId) => onEditProposal?.(proposalId);
  const handleTrack = (proposalId) => onTrackProposal?.(proposalId);

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-6 pb-4">
        <h1 className="text-3xl font-bold text-center">Proposal Drafts</h1>
      </div>

      {error && (
        <div className="px-6 pb-4">
          <div className="text-center p-4 bg-red-700 text-white rounded-lg">
            {error}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-20 scroll-container" ref={scrollContainerRef}>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-400"></div>
          </div>
        ) : proposals.length === 0 ? (
          <div className="text-center p-8 bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
            <p className="text-gray-400">No proposals found.</p>
            <p className="text-sm mt-2 text-gray-500">Create a new proposal to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {proposals.map((proposal) => (
              <div 
                key={proposal.id} 
                className="bg-gray-800 text-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-700 transition hover:border-gray-600 hover:shadow-xl flex flex-col mb-2"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                  <h2 className="text-xl font-semibold break-words max-w-full mb-2 sm:mb-0 sm:pr-10">
                    {proposal.title}
                    <span className="ml-2 text-xs font-normal text-gray-400">v{proposal.version || 1}</span>
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => handleEdit(proposal.id)}
                      className="bg-blue-600 text-white px-4 py-1 rounded-md text-sm hover:bg-blue-700 transition w-full sm:w-auto flex items-center justify-center gap-2 group"
                      aria-label={`Edit proposal ${proposal.title}`}
                    >
                      <Edit2 size={16} className="group-hover:animate-pulse" />
                      <span>Edit</span>
                    </button>
                    <button 
                      onClick={() => handleTrack(proposal.id)}
                      className="bg-purple-600 text-white px-4 py-1 rounded-md text-sm hover:bg-purple-700 transition w-full sm:w-auto flex items-center justify-center gap-2 group"
                      aria-label={`Track proposal ${proposal.title}`}
                    >
                      <BarChart2 size={16} className="group-hover:animate-pulse" />
                      <span>Track</span>
                    </button>
                  </div>
                </div>

                <div className="bg-gray-700 py-1 px-3 rounded-full text-sm inline-block mb-4 w-fit">
                  Status: <span className={`font-medium ${getStatusColor(proposal.status)}`}>{proposal.status || "Pending"}</span>
                </div>

                <p className="text-gray-300 mb-4 line-clamp-2 break-words overflow-hidden">
                  {proposal.description || "No description provided."}
                </p>

                <div className="mt-auto pt-4 text-sm text-gray-400 border-t border-gray-700">
                  Last updated: {formatDate(proposal.updatedAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Function to format date
function formatDate(timestamp) {
  return timestamp?.toDate?.()?.toLocaleString() || new Date(timestamp).toLocaleString() || "N/A";
}

// Function to get status color
function getStatusColor(status) {
  return {
    approved: "text-green-400",
    rejected: "text-red-400",
    pending: "text-yellow-400",
    reviewed: "text-blue-400",
  }[status?.toLowerCase()] || "text-gray-400";
}