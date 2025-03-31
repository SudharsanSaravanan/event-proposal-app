"use client";

import { useEffect, useState } from "react";
import { getUserProposals } from "../firebase/config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Edit2 } from "lucide-react";

export default function ViewProposalsContent({ onEditProposal }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setError(null);
      } else {
        setUserId(null);
        setError("You must be logged in to view proposals");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      const fetchProposals = async () => {
        try {
          const data = await getUserProposals(userId);
          setProposals(data);
          setError(null);

          // Scroll to top when proposals load
          setTimeout(() => {
            document.querySelector(".scroll-container")?.scrollTo({ top: 0, behavior: "smooth" });
          }, 100);
        } catch (error) {
          console.error("Error fetching proposals:", error);
          setError("Failed to load proposals: " + error.message);
        } finally {
          setLoading(false);
        }
      };
      fetchProposals();
    }
  }, [userId]);

  const handleEdit = (proposalId) => {
    if (onEditProposal) {
      onEditProposal(proposalId);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4">
        <h1 className="text-3xl font-bold text-center">Proposal Drafts</h1>
      </div>

      {/* Error Notification */}
      {error && (
        <div className="px-6 pb-4">
          <div className="text-center p-4 bg-red-700 text-white rounded-lg">
            {error}
          </div>
        </div>
      )}

      {/* Scrollable Proposals List */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-20 scroll-container">
        {proposals.length === 0 ? (
          <div className="text-center p-8 bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
            <p className="text-gray-400">No proposals found.</p>
            <p className="text-sm mt-2 text-gray-500">Create a new proposal to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {proposals.map((proposal) => (
              <div 
                key={proposal.id} 
                className="bg-gray-800 text-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-700 transition hover:border-gray-600 hover:shadow-xl relative flex flex-col mb-2"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                  <h2 className="text-xl font-semibold break-words max-w-full mb-2 sm:mb-0 sm:pr-10">
                    {proposal.title}
                    <span className="ml-2 text-xs font-normal text-gray-400">v{proposal.version || 1}</span>
                  </h2>
                  <button 
                    onClick={() => handleEdit(proposal.id)}
                    className="bg-blue-600 text-white px-4 py-1 rounded-md text-sm hover:bg-blue-700 transition w-full sm:w-auto sm:ml-2 flex items-center justify-center gap-2 group"
                  >
                    <Edit2 size={16} className="group-hover:animate-pulse" />
                    <span>Edit</span>
                  </button>
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

function formatDate(timestamp) {
  if (!timestamp) return "N/A";
  try {
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
  } catch (error) {
    return "N/A";
  }
}

function getStatusColor(status) {
  if (!status) return "text-gray-400";
  switch (status.toLowerCase()) {
    case "approved": return "text-green-400";
    case "rejected": return "text-red-400";
    case "pending": return "text-yellow-400";
    case "reviewed": return "text-blue-400";
    default: return "text-gray-400";
  }
}