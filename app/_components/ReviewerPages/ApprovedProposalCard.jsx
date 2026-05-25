import { CheckCircle, MessageSquareText, Timer } from "lucide-react";
import { format } from "date-fns";

export default function ApprovedProposalsCard({ proposals = [] }) {
  if (!proposals.length) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-white mb-4">
        Proposals You Approved
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {proposals.map((proposal) => (
          <div
            key={proposal.id}
            className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-indigo-400">
                {proposal.title}
              </h3>
              <span className="text-sm text-gray-400 bg-gray-700 px-2 py-0.5 rounded-full">
                {proposal.department}
              </span>
            </div>
            <div className="text-sm text-gray-300 flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="font-medium">Status:</span>
              <span className="capitalize">{proposal.proposalStatus}</span>
            </div>
            <div className="text-sm text-gray-300 flex items-center gap-2 mb-2">
              <MessageSquareText className="w-4 h-4 text-blue-300" />
              <span className="font-medium">Comment:</span>
              <span className="italic">"{proposal.comment}"</span>
            </div>
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <Timer className="w-4 h-4 text-yellow-400" />
              <span>
                Reviewed on:{" "}
                {format(
                  new Date(proposal.decisionAt.seconds * 1000),
                  "dd MMM yyyy, hh:mm a",
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
