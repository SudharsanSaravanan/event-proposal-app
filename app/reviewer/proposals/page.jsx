"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import apiRequest from "@/utils/apiRequest";
import { Loader2, CheckCircle, XCircle, Clock, HelpCircle } from "lucide-react";
import { auth } from "@/app/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function ReviewProposalsPage() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user) {
      // console.log("user", user);
      const fetchProposals = async () => {
        try {
          setLoading(true);
          // Fetch proposals assigned to the reviewer
          const res = await apiRequest(
            `/api/reviewer/${user.uid}/proposals`,
            "GET",
          );
          const proposals = res.uniqueProposals || [];
          setProposals(proposals);
        } catch (error) {
          console.error("Failed to fetch proposals", error);
        } finally {
          setLoading(false);
        }
      };
      fetchProposals();
    }
  }, [user]);

  const handleProposalClick = (id) => {
    router.push(`/reviewer/proposals/${id}`);
  };

  const getStatusProps = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return {
          label: "Approved",
          color: "bg-green-500/10 text-green-400 border-green-500/20",
          icon: <CheckCircle className="h-4 w-4" />,
        };
      case "rejected":
        return {
          label: "Rejected",
          color: "bg-red-500/10 text-red-400 border-red-500/20",
          icon: <XCircle className="h-4 w-4" />,
        };
      case "pending":
        return {
          label: "Pending",
          color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
          icon: <Clock className="h-4 w-4" />,
        };
      default:
        return {
          label: status || "Unknown",
          color: "bg-gray-500/10 text-gray-400 border-gray-500/20",
          icon: <HelpCircle className="h-4 w-4" />,
        };
    }
  };

  const ProposalCard = ({ proposal }) => {
    const statusProps = getStatusProps(proposal.status);
    return (
      <Card
        key={proposal.id}
        className="bg-slate-800/30 border border-slate-700/50 rounded-xl hover:bg-slate-800/60 hover:ring-2 hover:ring-blue-500/30 cursor-pointer transition-all duration-300 flex flex-col"
        onClick={() => handleProposalClick(proposal.id)}
      >
        <CardHeader>
          <CardTitle className="text-lg text-slate-100 truncate">
            {proposal.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow justify-between">
          <div>
            <p className="text-sm text-slate-400">
              Submitted by:{" "}
              <span className="font-medium text-slate-300">
                {proposal.proposerName || "N/A"}
              </span>
            </p>
          </div>
          <div
            className={`mt-4 inline-flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-full border self-start ${statusProps.color}`}
          >
            {statusProps.icon}
            <span>{statusProps.label}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderProposalsByStatus = (status) => {
    const filteredProposals = proposals.filter(
      (p) => p.status.toLowerCase() === status.toLowerCase(),
    );

    if (filteredProposals.length === 0) {
      return (
        <div className="text-center text-gray-500 py-16">
          No {status} proposals found.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProposals.map((proposal) => (
          <ProposalCard proposal={proposal} key={proposal.id} />
        ))}
      </div>
    );
  };

  const renderReviewedProposals = (status) => {
    const filteredProposals = proposals.filter(
      (p) => p.status.toLowerCase() === status.toLowerCase(),
    );

    if (filteredProposals.length === 0) {
      return (
        <div className="text-center text-gray-500 py-16">
          No reviewed proposals found.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProposals.map((proposal) => (
          <ProposalCard proposal={proposal} key={proposal.id} />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white h-full flex flex-col">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Review Proposals</h1>
      </div>
      <Tabs defaultValue="pending" className="w-full flex-grow flex flex-col">
        <TabsList className="relative inline-flex h-auto items-center justify-start rounded-full bg-slate-900 p-2 text-slate-400 self-start mb-8 border border-slate-800">
          <TabsTrigger
            value="all"
            className="relative inline-flex items-center justify-center whitespace-nowrap rounded-full px-6 py-2 text-sm font-medium text-slate-300 transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="relative inline-flex items-center justify-center whitespace-nowrap rounded-full px-6 py-2 text-sm font-medium text-slate-300 transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Pending
          </TabsTrigger>
          <TabsTrigger
            value="reviewed"
            className="relative inline-flex items-center justify-center whitespace-nowrap rounded-full px-6 py-2 text-sm font-medium text-slate-300 transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Reviewed
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="relative inline-flex items-center justify-center whitespace-nowrap rounded-full px-6 py-2 text-sm font-medium text-slate-300 transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Approved
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="relative inline-flex items-center justify-center whitespace-nowrap rounded-full px-6 py-2 text-sm font-medium text-slate-300 transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Rejected
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4 flex-grow">
          {proposals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {proposals.map((proposal) => (
                <ProposalCard proposal={proposal} key={proposal.id} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-gray-500 py-24 rounded-lg bg-slate-800/20">
              <HelpCircle className="h-16 w-16 mb-4 text-slate-600" />
              <h3 className="text-xl font-semibold text-slate-300">
                No proposals to review
              </h3>
              <p className="mt-2 max-w-xs">
                There are currently no proposals assigned to you for review.
              </p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          {renderProposalsByStatus("pending")}
        </TabsContent>
        <TabsContent value="reviewed" className="mt-4">
          {renderReviewedProposals("reviewed")}
        </TabsContent>
        <TabsContent value="approved" className="mt-4">
          {renderProposalsByStatus("approved")}
        </TabsContent>
        <TabsContent value="rejected" className="mt-4">
          {renderProposalsByStatus("rejected")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
