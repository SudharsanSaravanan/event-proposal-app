"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/app/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Added the missing imports
import ReviewerLayout from "@/app/ReviewerPages/ReviewerLayout";
import { Loader2, AlertCircle } from "lucide-react";

export default function ReviewerPage() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get reviewer info directly from Firestore
          const reviewerRef = doc(db, "Reviewers", user.uid);
          const reviewerSnap = await getDoc(reviewerRef);
          
          if (reviewerSnap.exists()) {
            const reviewerData = reviewerSnap.data();
            console.log("Reviewer data:", reviewerData);
            
            // Store in session storage
            sessionStorage.setItem("user", true);
            sessionStorage.setItem("name", reviewerData.name || "Reviewer");
            sessionStorage.setItem("role", "Reviewer");
            sessionStorage.setItem("departments", JSON.stringify(reviewerData.department || []));
            
            setIsAuthenticated(true);
          } else {
            console.log("No reviewer document found for this user");
            router.push("/login");
          }
        } catch (err) {
          console.error("Error checking reviewer status:", err);
          router.push("/login");
        } finally {
          setLoading(false);
        }
      } else {
        // Not logged in, redirect to login
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="bg-red-900/50 text-red-200 p-6 rounded-lg max-w-md flex items-start gap-4">
          <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold text-xl mb-2">Access Denied</h2>
            <p>You don't have permission to access the reviewer dashboard.</p>
            <button 
              onClick={() => router.push("/login")}
              className="mt-4 bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <ReviewerLayout />;
}