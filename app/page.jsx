"use client";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

export default function Home() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const userSession = typeof window !== "undefined" ? sessionStorage.getItem("user") : null;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && (!user || !userSession)) {
      router.push("/login");
    }
  }, [user, loading, userSession, router]);

  // Handle Logout with confirmation
  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      await signOut(auth);
      sessionStorage.removeItem("user");
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white p-6">
      {/* Header Section */}
      <header className="w-full max-w-4xl flex justify-between items-center px-6 py-4 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-indigo-400">Event Proposal Review</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-2 rounded-md hover:bg-red-600 transition"
        >
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="mt-10 text-center max-w-lg">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-indigo-300">Welcome, {user?.displayName || "User"}!</h2>
          <p className="text-gray-400">Submit your event proposals and get them reviewed by our team.</p>

          {/* Call to Action */}
          <div className="mt-6">
            <button 
              onClick={() => router.push("/submit-proposal")}
              className="bg-indigo-500 px-6 py-3 rounded-md text-white font-medium hover:bg-indigo-600 transition"
            >
              Submit a Proposal
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}