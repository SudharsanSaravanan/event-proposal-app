"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getPendingProposalsByUser,
  getReviewedProposalsByUser,
} from "../../api/proposalService";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, Plus } from "lucide-react";

export default function DashboardContent({ onNavigate }) {
  const [pendingCount, setPendingCount] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setError("You must be logged in to view proposals");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchProposalCounts = async () => {
      try {
        setLoading(true);

        const [pending, reviewed] = await Promise.all([
          getPendingProposalsByUser(userId),
          getReviewedProposalsByUser(userId),
        ]);

        setPendingCount(pending.length);
        setReviewedCount(reviewed.length);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching proposal counts:", err);
        setError("Failed to load proposal counts");
        setLoading(false);
      }
    };

    fetchProposalCounts();
  }, [userId]);

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-white text-center">
          Workshop & Event Proposal Dashboard
        </h1>

        {error && <p className="text-red-400 text-center mb-6">{error}</p>}

        {/* Welcome Message */}
        <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-slate-100 mb-2">
            Welcome, Proposer!
          </h2>
          <p className="text-slate-300">
            This platform enables you to submit and manage proposals for
            workshops and events. Create compelling proposals, track their
            review progress, and collaborate with reviewers.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div
            className="bg-blue-600/90 p-6 rounded-2xl relative cursor-pointer hover:bg-blue-600 transition-all duration-300 group shadow-lg hover:shadow-blue-500/30"
            onClick={() => onNavigate && onNavigate("add-proposal")}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-white text-lg font-semibold mb-2">
                New Workshop Proposal
              </h3>
              <div className="bg-white/20 rounded-full w-7 h-7 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
                <Plus className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-blue-100 text-sm">
              Submit a detailed proposal for technical workshops, training
              sessions, or hands-on learning experiences.
            </p>
          </div>
          <div
            className="bg-purple-600/90 p-6 rounded-2xl relative cursor-pointer hover:bg-purple-600 transition-all duration-300 group shadow-lg hover:shadow-purple-500/30"
            onClick={() => onNavigate && onNavigate("add-proposal")}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-white text-lg font-semibold mb-2">
                New Event Proposal
              </h3>
              <div className="bg-white/20 rounded-full w-7 h-7 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
                <Plus className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-purple-100 text-sm">
              Propose conferences, seminars, or networking events with clear
              objectives and engagement plans.
            </p>
          </div>
        </div>

        {/* View Proposals Button */}
        <div className="my-10 text-center">
          <Button
            onClick={() => onNavigate && onNavigate("view-proposals")}
            className="inline-flex items-center justify-center w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-16 px-8 rounded-2xl text-lg shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 transform hover:-translate-y-1"
          >
            <FileText className="mr-3 h-6 w-6" />
            View My Proposals
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
            <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">
              Proposals in Pending Status
            </h3>
            <p className="text-yellow-400 text-4xl font-bold">
              {loading ? "..." : pendingCount}
            </p>
            <p className="text-slate-500 text-xs mt-2">
              Awaiting review by the committee
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
            <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">
              Proposals in Reviewed Status
            </h3>
            <p className="text-green-400 text-4xl font-bold">
              {loading ? "..." : reviewedCount}
            </p>
            <p className="text-slate-500 text-xs mt-2">Evaluation completed</p>
          </div>
        </div>

        {/* Proposal Guidelines */}
        <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold text-slate-100 mb-4">
            Proposal Guidelines
          </h2>
          <ul className="text-slate-300 space-y-3">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span>
                Clearly define learning objectives and expected outcomes
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span>Include detailed participant engagement plans</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span>Specify technical requirements (for workshops)</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span>Provide realistic budget estimates</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span>Suggest preferred dates and durations</span>
            </li>
          </ul>
        </div>
        <br />
      </div>
    </div>
  );
}
