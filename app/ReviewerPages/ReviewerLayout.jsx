"use client";

import { useState } from "react";
import ReviewerDashboardContent from "./ReviewerDashboard";
import ReviewerProposalViewContent from "./ReviewerViewProposal";

export default function ReviewerLayout() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [filterStatus, setFilterStatus] = useState("pending");

  const handleNavigate = (view, status = null) => {
    setCurrentView(view);
    if (status) {
      setFilterStatus(status);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case "view-proposals":
      case "reviewed-proposals":
        return (
          <ReviewerProposalViewContent
            onBack={() => setCurrentView("dashboard")}
            filterStatus={currentView === "reviewed-proposals" ? "all" : "pending"}
          />
        );
      case "dashboard":
      default:
        return (
          <ReviewerDashboardContent
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {renderContent()}
    </div>
  );
}