import { useState } from "react";

export default function AddProposalContent() {
  const [proposal, setProposal] = useState({
    title: "",
    description: "",
    objectives: "",
    outcomes: "",
    participantEngagement: "",
    duration: "",
    registrationFee: 0,
    isIndividual: true,
    groupDetails: {
      maxGroupMembers: 4,
      feeType: "perhead"
    },
    maxSeats: 100,
    isEvent: false,
    isTechnical: true,
    preferredDays: {
      day1: "",
      day2: "",
      day3: ""
    },
    estimatedBudget: 0,
    potentialFundingSource: "",
    resourcePersonDetails: "",
    externalResources: ""
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setProposal((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value
        }
      }));
    } else {
      setProposal((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generate a unique ID for the proposal
    const newProposal = {
      ...proposal,
      id: `proposal_${Date.now()}` // Simple unique ID generation
    };
    
    console.log("Submitting proposal:", newProposal);
    // Here you would typically send the data to your backend API
    // For now we'll just show an alert
    alert("Proposal submitted successfully!");
  };

  return (
    <div className="pb-10">
      <h1 className="text-2xl font-bold mb-6 text-white">Add New Proposal</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 text-white">
        {/* Basic Information */}
        <div className="p-6 bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                name="title"
                value={proposal.title}
                onChange={handleChange}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Duration *</label>
              <input
                type="text"
                name="duration"
                value={proposal.duration}
                onChange={handleChange}
                placeholder="e.g. 3 hours"
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                required
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              name="description"
              value={proposal.description}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            ></textarea>
          </div>
        </div>
        
        {/* Resource Person Details */}
        <div className="p-6 bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Resource Person Information</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Resource Person Details *</label>
              <input
                type="text"
                name="resourcePersonDetails"
                value={proposal.resourcePersonDetails}
                onChange={handleChange}
                placeholder="Name, Organization, Email"
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Example: John Doe, Google, john.doe@google.com</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">External Resources Required *</label>
              <input
                type="text"
                name="externalResources"
                value={proposal.externalResources}
                onChange={handleChange}
                placeholder="Projector, Specific software, etc."
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                required
              />
              <p className="text-xs text-gray-400 mt-1">List any equipment, software, or resources needed</p>
            </div>
          </div>
        </div>
        
        {/* Objectives and Outcomes */}
        <div className="p-6 bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Objectives and Outcomes</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Objectives *</label>
            <textarea
              name="objectives"
              value={proposal.objectives}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              placeholder="Enter the objectives of your proposal"
              required
            ></textarea>
            <p className="text-xs text-gray-400 mt-1">Separate multiple objectives with commas or line breaks</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Expected Outcomes *</label>
            <textarea
              name="outcomes"
              value={proposal.outcomes}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              placeholder="Enter the expected outcomes of your proposal"
              required
            ></textarea>
            <p className="text-xs text-gray-400 mt-1">Separate multiple outcomes with commas or line breaks</p>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Participant Engagement Plan *</label>
            <textarea
              name="participantEngagement"
              value={proposal.participantEngagement}
              onChange={handleChange}
              rows="2"
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              placeholder="Group activities, Q&A sessions, etc."
              required
            ></textarea>
          </div>
        </div>
        
        {/* Registration and Participation */}
        <div className="p-6 bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Registration and Participation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Registration Fee (₹) *</label>
              <input
                type="number"
                name="registrationFee"
                value={proposal.registrationFee}
                onChange={handleChange}
                min="0"
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Maximum Seats *</label>
              <input
                type="number"
                name="maxSeats"
                value={proposal.maxSeats}
                onChange={handleChange}
                min="1"
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                required
              />
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4">
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="isIndividual"
                    checked={proposal.isIndividual}
                    onChange={() => setProposal(prev => ({...prev, isIndividual: true}))}
                    className="form-radio"
                  />
                  <span className="ml-2">Individual Registration</span>
                </label>
              </div>
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="isIndividual"
                    checked={!proposal.isIndividual}
                    onChange={() => setProposal(prev => ({...prev, isIndividual: false}))}
                    className="form-radio"
                  />
                  <span className="ml-2">Group Registration</span>
                </label>
              </div>
            </div>
          </div>
          
          {!proposal.isIndividual && (
            <div className="mt-4 bg-gray-700 p-4 rounded-md">
              <h3 className="text-md font-semibold mb-3">Group Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Max Group Members *</label>
                  <input
                    type="number"
                    name="groupDetails.maxGroupMembers"
                    value={proposal.groupDetails.maxGroupMembers}
                    onChange={handleChange}
                    min="2"
                    max="10"
                    className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                    required={!proposal.isIndividual}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fee Type *</label>
                  <select
                    name="groupDetails.feeType"
                    value={proposal.groupDetails.feeType}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                    required={!proposal.isIndividual}
                  >
                    <option value="perhead">Per Head</option>
                    <option value="group">Per Group</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Type of Event */}
        <div className="p-6 bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Type of Event</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Event Type *</label>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="isEvent"
                    checked={proposal.isEvent}
                    onChange={() => setProposal(prev => ({...prev, isEvent: true}))}
                    className="form-radio"
                  />
                  <span className="ml-2">Event</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="isEvent"
                    checked={!proposal.isEvent}
                    onChange={() => setProposal(prev => ({...prev, isEvent: false}))}
                    className="form-radio"
                  />
                  <span className="ml-2">Workshop</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Technical Category *</label>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="isTechnical"
                    checked={proposal.isTechnical}
                    onChange={() => setProposal(prev => ({...prev, isTechnical: true}))}
                    className="form-radio"
                  />
                  <span className="ml-2">Technical</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="isTechnical"
                    checked={!proposal.isTechnical}
                    onChange={() => setProposal(prev => ({...prev, isTechnical: false}))}
                    className="form-radio"
                  />
                  <span className="ml-2">Non-Technical</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scheduling */}
        <div className="p-6 bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Preferred Schedule</h2>
          <p className="text-sm text-gray-400 mb-4">Please provide your preferred time slots for each day of the event</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Day 1</label>
              <input
                type="text"
                name="preferredDays.day1"
                value={proposal.preferredDays.day1}
                onChange={handleChange}
                placeholder="e.g. 10:00 AM - 1:00 PM"
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Day 2</label>
              <input
                type="text"
                name="preferredDays.day2"
                value={proposal.preferredDays.day2}
                onChange={handleChange}
                placeholder="e.g. 2:00 PM - 5:00 PM"
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Day 3</label>
              <input
                type="text"
                name="preferredDays.day3"
                value={proposal.preferredDays.day3}
                onChange={handleChange}
                placeholder="e.g. 11:00 AM - 2:00 PM"
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-2">At least one preferred time slot is required</p>
        </div>
        
        {/* Budget */}
        <div className="p-6 bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Budget and Funding</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Estimated Budget (₹) *</label>
              <input
                type="number"
                name="estimatedBudget"
                value={proposal.estimatedBudget}
                onChange={handleChange}
                min="0"
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Potential Funding Source *</label>
              <input
                type="text"
                name="potentialFundingSource"
                value={proposal.potentialFundingSource}
                onChange={handleChange}
                placeholder="e.g. Tech Sponsors, Department"
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                required
              />
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end pr-5">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors"
          >
            Submit Proposal
          </button>
        </div>
      </form>
    </div>
  );
}