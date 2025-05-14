"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { 
  auth, 
  addProposal,
  getUserById
} from "../firebase/config";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  objectives: z.string().min(5, "Objectives must be at least 5 characters"),
  outcomes: z.string().min(5, "Outcomes must be at least 5 characters"),
  participantEngagement: z.string().min(10, "Please describe engagement plan"),
  duration: z.string().min(1, "Duration is required"),
  registrationFee: z.number().min(0, "Fee cannot be negative"),
  isIndividual: z.boolean(),
  groupDetails: z.object({
    maxGroupMembers: z.number().min(2, "Minimum 2 members"),
    feeType: z.enum(["perhead", "pergroup"]),
  }).optional(),
  maxSeats: z.number().min(1, "At least 1 seat required"),
  isEvent: z.boolean(),
  isTechnical: z.boolean(),
  preferredDays: z.object({
    day1: z.string().optional(),
    day2: z.string().optional(),
    day3: z.string().optional(),
  }),
  estimatedBudget: z.number().min(0, "Budget cannot be negative"),
  potentialFundingSource: z.string().optional(),
  resourcePersonDetails: z.string().min(5, "Resource person details are required"),
  externalResources: z.string().optional(),
  additionalRequirements: z.string().optional(),
  targetAudience: z.string().optional(),
});

export default function AddProposalContent() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const topRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userData = await getUserById(user.uid);
          if (userData) {
            setUser({
              ...user,
              department: userData.department || ''
            });
          } else {
            setUser(user);
          }
          setIsAuthenticated(true);
        } catch (err) {
          console.error("Error fetching user data:", err);
          setUser(user);
          setIsAuthenticated(true);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setError("You must be logged in to submit a proposal");
      }
    });

    return () => unsubscribe();
  }, []);

  const scrollToTop = () => {
    setTimeout(() => {
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
        feeType: "perhead",
      },
      maxSeats: 1,
      isEvent: false,
      isTechnical: true,
      preferredDays: {
        day1: "",
        day2: "",
        day3: "",
      },
      estimatedBudget: 0,
      potentialFundingSource: "",
      resourcePersonDetails: "",
      externalResources: "",
      additionalRequirements: "",
      targetAudience: "",
    },
  });

  const isIndividual = form.watch("isIndividual");

  async function onSubmit(values) {
    setError("");
    setSuccess("");
    setIsSubmitting(true);
  
    try {
      if (!user) {
        setError("You must be logged in to submit a proposal");
        setIsSubmitting(false);
        return;
      }
  
      const proposalData = {
        ...values,
        proposerId: user.uid,
        proposerEmail: user.email,
        proposerName: user.displayName || user.email,
        department: user.department || '',
        status: "Pending",
        version: 1,
        createdAt: new Date().toISOString()
      };
  
      if (values.isIndividual) {
        delete proposalData.groupDetails;
      }
  
      await addProposal(proposalData);
      
      setSuccess("Proposal submitted successfully!");
      form.reset();
      
    } catch (error) {
      console.error("Error submitting proposal:", error);
      setError("Failed to submit proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
      scrollToTop();
    }
  }

  return (
    <div className="pb-10 pr-6" ref={topRef}>
      <h1 className="text-2xl font-bold mb-6 mt-10  text-white">Add New Proposal</h1>
      
      {error && (
        <Alert variant="destructive" className="bg-red-800 border-red-600 mb-6">
          <AlertDescription className="text-white">
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="bg-green-800 border-green-600 mb-6">
          <AlertDescription className="text-white">
            {success}
          </AlertDescription>
        </Alert>
      )}
      
      {!isAuthenticated ? (
        <div className="p-6 bg-gray-800 rounded-lg shadow-md">
          <p className="text-white text-center">Please log in to submit a proposal.</p>
          <div className="flex justify-center mt-4">
            <Button 
              onClick={() => router.push("/login")} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go to Login
            </Button>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-white">
            {/* Basic Information */}
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Cloud Computing Workshop"
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Duration *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. 3 hours"
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A hands-on workshop on AWS..."
                          rows="3"
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Resource Person Details */}
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">Resource Person Information</h2>
              
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="resourcePersonDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Resource Person Details *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Name, Organization, Email"
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-gray-400 mt-1">Example: John Doe, Google, john.doe@google.com</p>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="externalResources"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">External Resources Required *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Projector, Specific software, etc."
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-gray-400 mt-1">List any equipment, software, or resources needed</p>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Objectives and Outcomes */}
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">Objectives and Outcomes</h2>
              
              <div className="mb-4">
                <FormField
                  control={form.control}
                  name="objectives"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Objectives *</FormLabel>
                      <FormControl>
                        <Textarea
                          rows="3"
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          placeholder="Enter the objectives of your proposal"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-gray-400 mt-1">Separate multiple objectives with commas or line breaks</p>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
              
              <div>
                <FormField
                  control={form.control}
                  name="outcomes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Expected Outcomes *</FormLabel>
                      <FormControl>
                        <Textarea
                          rows="3"
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          placeholder="Enter the expected outcomes of your proposal"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-gray-400 mt-1">Separate multiple outcomes with commas or line breaks</p>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Target Audience</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Computer Science students, AI enthusiasts"
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="participantEngagement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Participant Engagement Plan *</FormLabel>
                      <FormControl>
                        <Textarea
                          rows="2"
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          placeholder="Group activities, Q&A sessions, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Registration and Participation */}
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">Registration and Participation</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="registrationFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Registration Fee (₹) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maxSeats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Maximum Seats *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4">
                  <div>
                    <FormField
                      control={form.control}
                      name="isIndividual"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <div className="flex space-x-4">
                              <label className="inline-flex items-center">
                                <input
                                  type="radio"
                                  checked={field.value}
                                  onChange={() => field.onChange(true)}
                                  className="form-radio"
                                />
                                <span className="ml-2">Individual Registration</span>
                              </label>
                              <label className="inline-flex items-center">
                                <input
                                  type="radio"
                                  checked={!field.value}
                                  onChange={() => field.onChange(false)}
                                  className="form-radio"
                                />
                                <span className="ml-2">Group Registration</span>
                              </label>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              
              {!isIndividual && (
                <div className="mt-4 bg-gray-700 p-4 rounded-md">
                  <h3 className="text-md font-semibold mb-3">Group Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="groupDetails.maxGroupMembers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Max Group Members *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                              min="2"
                              max="10"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value) || 2)}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="groupDetails.feeType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Fee Type *</FormLabel>
                          <FormControl>
                            <select
                              className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                              {...field}
                            >
                              <option value="perhead">Per Head</option>
                              <option value="pergroup">Per Group</option>
                            </select>
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Type of Event */}
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">Type of Event</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormLabel className="text-white block mb-2">Event Type *</FormLabel>
                  <FormField
                    control={form.control}
                    name="isEvent"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-4">
                        <FormControl>
                          <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                              <input
                                type="radio"
                                checked={field.value}
                                onChange={() => field.onChange(true)}
                                className="form-radio"
                              />
                              <span className="ml-2">Event</span>
                            </label>
                            <label className="inline-flex items-center">
                              <input
                                type="radio"
                                checked={!field.value}
                                onChange={() => field.onChange(false)}
                                className="form-radio"
                              />
                              <span className="ml-2">Workshop</span>
                            </label>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div>
                  <FormLabel className="text-white block mb-2">Technical Category *</FormLabel>
                  <FormField
                    control={form.control}
                    name="isTechnical"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-4">
                        <FormControl>
                          <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                              <input
                                type="radio"
                                checked={field.value}
                                onChange={() => field.onChange(true)}
                                className="form-radio"
                              />
                              <span className="ml-2">Technical</span>
                            </label>
                            <label className="inline-flex items-center">
                              <input
                                type="radio"
                                checked={!field.value}
                                onChange={() => field.onChange(false)}
                                className="form-radio"
                              />
                              <span className="ml-2">Non-Technical</span>
                            </label>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            
            {/* Scheduling */}
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">Preferred Schedule</h2>
              <p className="text-sm text-gray-400 mb-4">Please provide your preferred time slots for each day of the event</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="preferredDays.day1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Day 1</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. 10:00 AM - 1:00 PM"
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="preferredDays.day2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Day 2</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. 2:00 PM - 5:00 PM"
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="preferredDays.day3"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Day 3</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. 11:00 AM - 2:00 PM"
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">At least one preferred time slot is required</p>
            </div>
            
            {/* Budget */}
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">Budget and Funding</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="estimatedBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Estimated Budget (₹) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="potentialFundingSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Potential Funding Source *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Tech Sponsors, Department"
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="additionalRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Additional Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Equipment needs, venue preferences, catering requirements..."
                          rows="3"
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end pr-5">
              <Button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Proposal"
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}