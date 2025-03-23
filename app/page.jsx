"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarIcon,
  ClipboardCheckIcon,
  UserIcon,
  UsersIcon,
  FileTextIcon,
  CheckCircleIcon,
} from "lucide-react";

const HomePage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="py-6 bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="p-2 mr-2">
              {/*icon*/}
            </div>
            <h1 className="text-2xl font-bold">Anokha 2025</h1>
          </div>
          <div className="space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/signup")}
              className="hover:bg-gray-700"
            >
              Sign Up
            </Button>
            <Button
              variant="default"
              onClick={() => router.push("/login")}
              className="bg-green-600 hover:bg-green-500"
            >
              Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Event Proposal Management System
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            Streamline the process of proposing, reviewing, and managing events
            for Anokha 2025.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              onClick={() => router.push("/signup")}
              className="bg-green-600 hover:bg-green-500 px-8"
            >
              Propose an Event
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/login")}
              className="border-green-500 text-green-500 hover:bg-green-900 px-8"
            >
              Access Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-800 border-0 shadow-lg overflow-hidden">
              <div className="h-2 bg-blue-500"></div>
              <CardContent className="p-6">
                <div className="rounded-full bg-blue-500/10 w-12 h-12 flex items-center justify-center mb-4">
                  <UserIcon className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-3">For Proposers</h3>
                <p className="text-gray-300">
                  Submit event proposals, track approval status, and manage event
                  details all in one place.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-0 shadow-lg overflow-hidden">
              <div className="h-2 bg-amber-500"></div>
              <CardContent className="p-6">
                <div className="rounded-full bg-amber-500/10 w-12 h-12 flex items-center justify-center mb-4">
                  <ClipboardCheckIcon className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-3">For Reviewers</h3>
                <p className="text-gray-300">
                  Efficiently review proposals, provide feedback, and track
                  changes requested from event organizers.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-0 shadow-lg overflow-hidden">
              <div className="h-2 bg-green-500"></div>
              <CardContent className="p-6">
                <div className="rounded-full bg-green-500/10 w-12 h-12 flex items-center justify-center mb-4">
                  <UsersIcon className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-3">For Admins</h3>
                <p className="text-gray-300">
                  Oversee all proposals, manage users, generate reports, and
                  ensure smooth event coordination.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* User Roles Tab Section */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Choose Your Role
          </h2>
          <Tabs defaultValue="proposer" className="max-w-3xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 bg-gray-700">
              <TabsTrigger value="proposer">Proposer</TabsTrigger>
              <TabsTrigger value="reviewer">Reviewer</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
            <TabsContent value="proposer" className="mt-6">
              <Card className="bg-gray-800 border border-gray-700">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <FileTextIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <div>
                        <h4 className="text-white font-medium">Submit Proposals</h4>
                        <p className="text-sm text-gray-400">
                          Create and submit detailed event proposals for review
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CalendarIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <div>
                        <h4 className="text-white font-medium">Manage Events</h4>
                        <p className="text-sm text-gray-400">
                          Track event status, update details, and view feedback
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => router.push("/signup")}
                      className="w-full bg-green-600 hover:bg-green-500 mt-4"
                    >
                      Sign Up as Proposer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviewer" className="mt-6">
              <Card className="bg-gray-800 border border-gray-700">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <ClipboardCheckIcon className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
                      <div>
                        <h4 className="text-white font-medium">Review Proposals</h4>
                        <p className="text-sm text-gray-400">
                          Evaluate event proposals and provide constructive
                          feedback
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
                      <div>
                        <h4 className="text-white font-medium">Approval Workflow</h4>
                        <p className="text-sm text-gray-400">
                          Approve, request changes, or reject proposals with
                          detailed comments
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => router.push("/login")}
                      className="w-full bg-amber-600 hover:bg-amber-500 mt-4"
                    >
                      Login as Reviewer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="admin" className="mt-6">
              <Card className="bg-gray-800 border border-gray-700">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <UsersIcon className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                      <div>
                        <h4 className="text-white font-medium">User Management</h4>
                        <p className="text-sm text-gray-400">
                          Add, edit, and manage all system users and their roles
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FileTextIcon className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                      <div>
                        <h4 className="text-white font-medium">Oversight & Reporting</h4>
                        <p className="text-sm text-gray-400">
                          Access comprehensive dashboards, reports, and system
                          configuration
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => router.push("/login")}
                      className="w-full bg-blue-600 hover:bg-blue-500 mt-4"
                    >
                      Login as Admin
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-800 border-t border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-green-500 rounded-full p-1 mr-2">
                {/*icon*/}
              </div>
              <span className="text-white font-semibold">Anokha 2025</span>
            </div>
            <div className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Anokha 2025. All rights
              reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;