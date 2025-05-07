"use client";

import { useState } from "react";
import { FileText, FilePlus, Menu, Edit, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import DashboardContent from "../proposalpages/dashboard";
import ViewProposalsContent from "../proposalpages/viewproposals";
import AddProposalContent from "../proposalpages/addproposal";
import ProposalTrackingContent from "../proposalpages/proposaltracking";
import EditProposalContent from "../proposalpages/editproposal";

export default function UserPage() {
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedProposalId, setSelectedProposalId] = useState(null);
  const router = useRouter();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Function to handle switching to edit mode with a specific proposal
  const handleEditProposal = (proposalId) => {
    setSelectedProposalId(proposalId);
    setActiveView("edit-proposal");
  };

  // Function to handle switching to tracking mode with a specific proposal
  const handleTrackProposal = (proposalId) => {
    setSelectedProposalId(proposalId);
    setActiveView("track-proposal");
  };

  const handleLogout = () => {
    router.push("/");
  };

  const handleNavigate = (view) => {
    setActiveView(view);
  };

  const renderContent = () => {
    switch (activeView) {
      case "view-proposals":
        return <ViewProposalsContent 
          onEditProposal={handleEditProposal} 
          onTrackProposal={handleTrackProposal}
        />;
      case "add-proposal":
        return (
          <div className="h-full max-h-full overflow-y-auto">
            <AddProposalContent />
          </div>
        );
      case "track-proposal":
        return (
          <div className="h-full max-h-full overflow-y-auto">
            <ProposalTrackingContent 
              proposalId={selectedProposalId} 
              onBack={() => setActiveView("view-proposals")}
            />
          </div>
        );
      case "edit-proposal":
        return (
          <div className="h-full max-h-full overflow-y-auto">
            <EditProposalContent 
              proposalId={selectedProposalId} 
              onBack={() => setActiveView("view-proposals")}
            />
          </div>
        );
      default:
        return <DashboardContent onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`bg-gray-800 shadow-md transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        } flex-shrink-0 h-full flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          {sidebarOpen && (
            <h2 className="text-lg font-semibold text-white">
              User Dashboard
            </h2>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md text-white hover:bg-gray-600"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveView("view-proposals")}
              className={`flex items-center w-full p-2 rounded-md ${
                activeView === "view-proposals"
                  ? "bg-gray-600 text-white"
                  : "hover:bg-gray-600 text-gray-300"
              } transition-colors`}
            >
              <FileText size={18} className="flex-shrink-0" />
              {sidebarOpen && <span className="ml-3">View Proposals</span>}
            </button>

            <button
              onClick={() => setActiveView("add-proposal")}
              className={`flex items-center w-full p-2 rounded-md ${
                activeView === "add-proposal"
                  ? "bg-gray-600 text-white"
                  : "hover:bg-gray-600 text-gray-300"
              } transition-colors`}
            >
              <FilePlus size={18} className="flex-shrink-0" />
              {sidebarOpen && <span className="ml-3">Add Proposal</span>}
            </button>
          </nav>
          
          {/* Logout button at the bottom */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-2 rounded-md hover:bg-gray-600 text-red-500 transition-colors"
            >
              <LogOut size={18} className="flex-shrink-0 text-red-500" />
              {sidebarOpen && <span className="ml-3">Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content (No Scrollbar Here) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 p-6 h-full overflow-hidden">{renderContent()}</div>
      </div>
    </div>
  );
}