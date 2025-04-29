"use client";

import { useState, useEffect } from "react";
import { auth, isUserReviewer, getReviewerInfo } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { 
  ClipboardList, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Settings
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReviewerDashboardContent({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [reviewer, setReviewer] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check if user is a reviewer
          const reviewerCheck = await isUserReviewer(user.uid);
          
          if (reviewerCheck) {
            // Get reviewer info
            const reviewerData = await getReviewerInfo(user.uid);
            setReviewer({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || reviewerData.name,
              ...reviewerData
            });
            setError(null);
          } else {
            setError("You do not have reviewer privileges. Please contact administrator.");
            setReviewer(null);
          }
        } catch (err) {
          console.error("Error setting up reviewer:", err);
          setError("An error occurred while loading reviewer information.");
        }
        
        setLoading(false);
      } else {
        setReviewer(null);
        setError("Please log in to access the reviewer dashboard.");
        setLoading(false);
        
        // Redirect to login
        // router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="h-screen overflow-y-auto bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-white text-center">
          Proposal Review Dashboard
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/50 text-red-200 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p>{error}</p>
            {!reviewer && (
              <button 
                className="mt-4 bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                onClick={() => router.push("/login")}
              >
                Go to Login
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Welcome Message */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
              <h2 className="text-xl font-semibold text-white mb-2">Welcome, {reviewer?.displayName || "Reviewer"}!</h2>
              <p className="text-gray-300 mb-4">
                You can review proposals for the following departments:
              </p>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {reviewer?.departments?.map((dept, index) => (
                  <span key={index} className="bg-blue-900/60 text-blue-200 px-3 py-1 rounded-full text-sm">
                    {dept}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div 
                className="bg-blue-900/30 p-6 rounded-lg border border-blue-700 relative cursor-pointer hover:bg-blue-800 transition-all duration-300"
                onClick={() => onNavigate && onNavigate("view-proposals")}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-blue-300 text-lg font-medium mb-2">Review Pending Proposals</h3>
                  <div className="bg-blue-700 rounded-full w-8 h-8 flex items-center justify-center">
                    <ClipboardList size={18} className="text-white" />
                  </div>
                </div>
                <p className="text-gray-300 text-sm">
                  Review pending proposals from your assigned departments.
                </p>
              </div>
              
              <div 
                className="bg-purple-900/30 p-6 rounded-lg border border-purple-700 relative cursor-pointer hover:bg-purple-800 transition-all duration-300"
                onClick={() => onNavigate && onNavigate("reviewed-proposals")}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-purple-300 text-lg font-medium mb-2">View Reviewed Proposals</h3>
                  <div className="bg-purple-700 rounded-full w-8 h-8 flex items-center justify-center">
                    <FileText size={18} className="text-white" />
                  </div>
                </div>
                <p className="text-gray-300 text-sm">
                  Access all proposals you've previously reviewed.
                </p>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Review Status Overview</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Clock size={20} className="text-yellow-400 mr-2" />
                    <h3 className="text-gray-200 font-medium">Pending Review</h3>
                  </div>
                  <p className="text-2xl font-bold text-yellow-400">-</p>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CheckCircle size={20} className="text-green-400 mr-2" />
                    <h3 className="text-gray-200 font-medium">Approved</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-400">-</p>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <XCircle size={20} className="text-red-400 mr-2" />
                    <h3 className="text-gray-200 font-medium">Rejected</h3>
                  </div>
                  <p className="text-2xl font-bold text-red-400">-</p>
                </div>
              </div>
            </div>

            {/* Review Guidelines */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-white mb-4">Review Guidelines</h2>
              <ul className="text-gray-300 space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  Carefully evaluate objectives and expected outcomes
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  Check resource requirements for feasibility
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  Verify alignment with department priorities
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  Provide constructive feedback for rejected or revision requests
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  Review budget details and funding requirements
                </li>
              </ul>
            </div>
          </>
        )}
        <div className="h-16"></div> {/* Adds some space at the bottom for better scrolling */}
      </div>
    </div>
  );
}