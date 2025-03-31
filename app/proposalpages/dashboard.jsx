"use client";

export default function DashboardContent({ onNavigate }) {
  return (
    <div className="h-screen overflow-y-auto bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-white text-center">
          Workshop & Event Proposal Dashboard
        </h1>

        {/* Welcome Message */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Welcome, Proposer!</h2>
          <p className="text-gray-300">
            This platform enables you to submit and manage proposals for workshops and events. 
            Create compelling proposals, track their review progress, and collaborate with reviewers.
          </p>
        </div>

        {/* Quick Actions - Enhanced UI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div 
            className="bg-blue-900/30 p-6 rounded-lg border border-blue-700 relative cursor-pointer hover:bg-blue-800 transition-all duration-300"
            onClick={() => onNavigate && onNavigate("add-proposal")}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-blue-300 text-lg font-medium mb-2">New Workshop Proposal</h3>
              <div className="bg-blue-700 rounded-full w-6 h-6 flex items-center justify-center">
                <span className="text-white text-lg font-bold pl-0.2 pb-0.5">+</span>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Submit a detailed proposal for technical workshops, training sessions, or hands-on learning experiences.
            </p>
          </div>
          <div 
            className="bg-purple-900/30 p-6 rounded-lg border border-purple-700 relative cursor-pointer hover:bg-purple-800 transition-all duration-300"
            onClick={() => onNavigate && onNavigate("add-proposal")}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-purple-300 text-lg font-medium mb-2">New Event Proposal</h3>
              <div className="bg-purple-700 rounded-full w-6 h-6 flex items-center justify-center">
                <span className="text-white text-lg font-bold pl-0.2 pb-0.5">+</span>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Propose conferences, seminars, or networking events with clear objectives and engagement plans.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-gray-400 text-sm uppercase mb-2">Proposals in Pending Status</h3>
            <p className="text-yellow-400 text-3xl font-bold">0</p>
            <p className="text-gray-500 text-xs mt-2">Awaiting review by the committee</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-gray-400 text-sm uppercase mb-2">Proposals in Reviewed Status</h3>
            <p className="text-green-400 text-3xl font-bold">0</p>
            <p className="text-gray-500 text-xs mt-2">Evaluation completed</p>
          </div>
        </div>

        {/* Proposal Guidelines */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Proposal Guidelines</h2>
          <ul className="text-gray-300 space-y-3">
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              Clearly define learning objectives and expected outcomes
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              Include detailed participant engagement plans
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              Specify technical requirements (for workshops)
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              Provide realistic budget estimates
            </li>
            <li className="flex items-start">
              <span className="text-green-400 mr-2">✓</span>
              Suggest preferred dates and durations
            </li>
          </ul>
        </div>
        <div className="h-16"></div> {/* Adds some space at the bottom for better scrolling */}
      </div>
    </div>
  );
}
