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
  Filter
} from "lucide-react";

export default function ProposalTrackingContent() {
  // Sample data for demonstration
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // Fetch data when component mounts
  useEffect(() => {
    // Simulate API fetch
    const fetchProposals = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data
        const fetchedProposals = [
          {
            id: "proposal_123456789",
            title: "Advanced Machine Learning Workshop",
            submittedDate: "2025-03-15",
            status: "pending",
            timeline: [
              { date: "2025-03-15", status: "Submitted", comment: "Proposal submitted for review" },
              { date: "2025-03-18", status: "Under Review", comment: "Assigned to technical committee" }
            ],
            isEvent: false,
            isTechnical: true,
            registrationFee: 500,
            maxSeats: 50,
            expectedCompletionDate: "2025-04-10"
          },
          {
            id: "proposal_987654321",
            title: "Leadership Development Seminar",
            submittedDate: "2025-03-20",
            status: "approved",
            timeline: [
              { date: "2025-03-20", status: "Submitted", comment: "Proposal submitted for review" },
              { date: "2025-03-22", status: "Under Review", comment: "Assigned to non-technical committee" },
              { date: "2025-03-26", status: "Approved", comment: "Approved with minor changes to budget" }
            ],
            isEvent: true,
            isTechnical: false,
            registrationFee: 300,
            maxSeats: 100,
            expectedCompletionDate: "2025-04-15"
          },
          {
            id: "proposal_456789123",
            title: "Web Development Bootcamp",
            submittedDate: "2025-03-10",
            status: "rejected",
            timeline: [
              { date: "2025-03-10", status: "Submitted", comment: "Proposal submitted for review" },
              { date: "2025-03-14", status: "Under Review", comment: "Assigned to technical committee" },
              { date: "2025-03-19", status: "Rejected", comment: "Rejected due to similar workshop already scheduled" }
            ],
            isEvent: false,
            isTechnical: true,
            registrationFee: 1200,
            maxSeats: 30,
            expectedCompletionDate: null
          },
          {
            id: "proposal_321654987",
            title: "Creative Writing Workshop",
            submittedDate: "2025-03-25",
            status: "pending",
            timeline: [
              { date: "2025-03-25", status: "Submitted", comment: "Proposal submitted for review" }
            ],
            isEvent: false,
            isTechnical: false,
            registrationFee: 200,
            maxSeats: 25,
            expectedCompletionDate: "2025-04-25"
          }
        ];
        
        setProposals(fetchedProposals);
        
        // Calculate statistics
        setStatistics({
          total: fetchedProposals.length,
          pending: fetchedProposals.filter(p => p.status === "pending").length,
          approved: fetchedProposals.filter(p => p.status === "approved").length,
          rejected: fetchedProposals.filter(p => p.status === "rejected").length
        });
        
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch proposals:", err);
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  // Filter proposals based on selected filter
  const filteredProposals = filter === "all" 
    ? proposals 
    : proposals.filter(proposal => proposal.status === filter);

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle size={18} className="text-green-500" />;
      case "rejected":
        return <XCircle size={18} className="text-red-500" />;
      case "pending":
        return <Clock size={18} className="text-yellow-500" />;
      default:
        return <AlertCircle size={18} className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">Approved</span>;
      case "rejected":
        return <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">Pending Review</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-white">Loading proposal tracking data...</div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <h1 className="text-2xl font-bold mb-6 text-white">Proposal Tracking</h1>
      
      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow-md text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Proposals</p>
              <p className="text-2xl font-bold">{statistics.total}</p>
            </div>
            <BarChart4 size={24} className="text-blue-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg shadow-md text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pending Review</p>
              <p className="text-2xl font-bold">{statistics.pending}</p>
            </div>
            <Clock size={24} className="text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg shadow-md text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Approved</p>
              <p className="text-2xl font-bold">{statistics.approved}</p>
            </div>
            <CheckCircle size={24} className="text-green-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg shadow-md text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Rejected</p>
              <p className="text-2xl font-bold">{statistics.rejected}</p>
            </div>
            <XCircle size={24} className="text-red-400" />
          </div>
        </div>
      </div>
      
      {/* Filter Controls */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-6 text-white">
        <div className="flex items-center space-x-2 mb-2">
          <Filter size={16} />
          <span className="font-medium">Filter Proposals</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setFilter("all")} 
            className={`px-3 py-1 rounded-md text-sm ${filter === "all" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
          >
            All Proposals
          </button>
          <button 
            onClick={() => setFilter("pending")} 
            className={`px-3 py-1 rounded-md text-sm ${filter === "pending" ? "bg-yellow-600" : "bg-gray-700 hover:bg-gray-600"}`}
          >
            Pending
          </button>
          <button 
            onClick={() => setFilter("approved")} 
            className={`px-3 py-1 rounded-md text-sm ${filter === "approved" ? "bg-green-600" : "bg-gray-700 hover:bg-gray-600"}`}
          >
            Approved
          </button>
          <button 
            onClick={() => setFilter("rejected")} 
            className={`px-3 py-1 rounded-md text-sm ${filter === "rejected" ? "bg-red-600" : "bg-gray-700 hover:bg-gray-600"}`}
          >
            Rejected
          </button>
        </div>
      </div>
      
      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <div className="bg-gray-800 p-6 rounded-lg text-center text-gray-400">
          <p>No proposals matching the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredProposals.map(proposal => (
            <div key={proposal.id} className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {/* Proposal Header */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{proposal.title}</h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                        {proposal.isEvent ? "Event" : "Workshop"}
                      </span>
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                        {proposal.isTechnical ? "Technical" : "Non-Technical"}
                      </span>
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full flex items-center">
                        <Users size={12} className="mr-1" />
                        {proposal.maxSeats} seats
                      </span>
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full flex items-center">
                        <DollarSign size={12} className="mr-1" />
                        ₹{proposal.registrationFee}
                      </span>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(proposal.status)}
                  </div>
                </div>
              </div>
              
              {/* Timeline Section */}
              <div className="p-4 bg-gray-800 text-white">
                <h3 className="font-medium mb-3 flex items-center">
                  <Calendar size={16} className="mr-2" />
                  Proposal Timeline
                </h3>
                
                <div className="relative pl-8 border-l-2 border-gray-600 space-y-6">
                  {proposal.timeline.map((event, index) => (
                    <div key={index} className="relative">
                      <div className="absolute top-0 -left-10 bg-gray-800 p-1 rounded-full border-2 border-gray-600">
                        {getStatusIcon(proposal.status)}
                      </div>
                      <div>
                        <div className="flex items-baseline">
                          <h4 className="font-medium text-blue-400">{event.status}</h4>
                          <span className="ml-2 text-xs text-gray-400">
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mt-1">{event.comment}</p>
                      </div>
                    </div>
                  ))}
                  
                  {proposal.status === "pending" && (
                    <div className="relative opacity-60">
                      <div className="absolute top-0 -left-10 bg-gray-800 p-1 rounded-full border-2 border-gray-600">
                        <Clock size={18} className="text-gray-400" />
                      </div>
                      <div>
                        <div className="flex items-baseline">
                          <h4 className="font-medium text-gray-400">Awaiting Decision</h4>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Expected by {new Date(proposal.expectedCompletionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Expected Outcome Section (for approved proposals) */}
              {proposal.status === "approved" && (
                <div className="p-4 bg-gray-700 text-white">
                  <h3 className="font-medium mb-2">Next Steps</h3>
                  <p className="text-sm text-gray-300">
                    Your proposal has been approved. The event coordinator will contact you shortly to discuss implementation details and schedule.
                  </p>
                  <div className="mt-3 flex items-center">
                    <Calendar size={14} className="mr-2 text-blue-400" />
                    <span className="text-sm">
                      Expected to be held on: {new Date(proposal.expectedCompletionDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Rejection Feedback (for rejected proposals) */}
              {proposal.status === "rejected" && (
                <div className="p-4 bg-gray-700 text-white">
                  <h3 className="font-medium mb-2 text-red-400">Feedback</h3>
                  <p className="text-sm text-gray-300">
                    {proposal.timeline[proposal.timeline.length - 1].comment}
                  </p>
                  <button className="mt-3 text-sm text-blue-400 hover:underline">
                    Request Detailed Feedback
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}