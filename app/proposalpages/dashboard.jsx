"use client";

import Link from "next/link";
import { FilePlus } from "lucide-react";

export default function DashboardContent() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-white">Event Proposer Dashboard</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <p className="text-white text-lg mb-4">
          Welcome to your Event Proposer Dashboard! Here you can create, edit, 
          and track your event proposals.
        </p>
        
        <div className="flex flex-wrap gap-4 mt-6">
          <Link 
            href="/user?view=add-proposal" 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <FilePlus size={18} />
            <span>Create New Proposal</span>
          </Link>
        </div>
      </div>

      {/* Optional: Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-gray-400 text-sm">Active Proposals</h3>
          <p className="text-white text-2xl font-bold">0</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-gray-400 text-sm">Pending Review</h3>
          <p className="text-white text-2xl font-bold">0</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-gray-400 text-sm">Approved</h3>
          <p className="text-white text-2xl font-bold">0</p>
        </div>
      </div>
    </div>
  );
}