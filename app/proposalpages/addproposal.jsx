"use client";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

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
    feeType: z.enum(["perhead", "group"]),
  }),
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
});

export default function AddProposalContent() {
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
      maxSeats: 100,
      isEvent: false,
      isTechnical: true,
      preferredDays: {
        day1: "",
        day2: "",
        day3: "",
      },
      estimatedBudget: 0,
      potentialFundingSource: "",
    },
  });

  function onSubmit(values) {
    console.log(values);
    // Submit to your API here
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Add New Proposal</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-6 p-6 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold text-white">Basic Information</h2>
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Cloud Computing Workshop" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A hands-on workshop on AWS..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="objectives"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Objectives</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Learn AWS concepts, Working on Machine Learning models"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="outcomes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Expected Outcomes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Understand AWS fundamentals"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="participantEngagement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Participant Engagement Plan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Group activities, Q&A sessions..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Duration</FormLabel>
                  <FormControl>
                    <Input placeholder="3 hours" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Registration Details */}
          <div className="grid grid-cols-1 gap-6 p-6 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold text-white">Registration Details</h2>
            
            <FormField
              control={form.control}
              name="registrationFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Registration Fee (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isIndividual"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-white">
                      Individual Registration
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {!form.watch("isIndividual") && (
              <div className="space-y-4 pl-6">
                <FormField
                  control={form.control}
                  name="groupDetails.maxGroupMembers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Max Group Members</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="groupDetails.feeType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Fee Type</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="perhead">Per Head</option>
                          <option value="group">Per Group</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="maxSeats"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Maximum Seats</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Event Type */}
          <div className="grid grid-cols-1 gap-6 p-6 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold text-white">Event Type</h2>
            
            <div className="flex gap-8">
              <FormField
                control={form.control}
                name="isEvent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-white">
                        This is an Event (not a Workshop)
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isTechnical"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-white">
                        Technical Activity
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Preferred Days */}
          <div className="grid grid-cols-1 gap-6 p-6 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold text-white">Preferred Days</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="preferredDays.day1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Day 1</FormLabel>
                    <FormControl>
                      <Input placeholder="10:00 AM - 1:00 PM" {...field} />
                    </FormControl>
                    <FormMessage />
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
                      <Input placeholder="2:00 PM - 5:00 PM" {...field} />
                    </FormControl>
                    <FormMessage />
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
                      <Input placeholder="11:00 AM - 2:00 PM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Budget Details */}
          <div className="grid grid-cols-1 gap-6 p-6 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold text-white">Budget Details</h2>
            
            <FormField
              control={form.control}
              name="estimatedBudget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Estimated Budget (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="potentialFundingSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Potential Funding Source</FormLabel>
                  <FormControl>
                    <Input placeholder="Tech Sponsors" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Submit Proposal
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}