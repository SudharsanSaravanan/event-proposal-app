import { z } from "zod";

export const createProposalSchema = z
  .object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z
      .string()
      .min(20, "Description must be at least 20 characters"),
    objectives: z.string().min(5, "Objectives must be at least 5 characters"),
    outcomes: z.string().min(5, "Outcomes must be at least 5 characters"),
    participantEngagement: z
      .string()
      .min(10, "Please describe engagement plan"),
    duration: z.string().min(1, "Duration is required"),
    registrationFee: z.number().min(0, "Fee cannot be negative"),
    isIndividual: z.boolean(),
    groupDetails: z
      .object({
        maxGroupMembers: z.number().min(2, "Minimum 2 members required"),
        feeType: z.enum(["perhead", "pergroup"]),
      })
      .optional(),
    maxSeats: z.number().min(1, "At least 1 seat is required"),
    isEvent: z.boolean(),
    isTechnical: z.boolean(),
    preferredDays: z.object({
      day1: z.string().optional(),
      day2: z.string().optional(),
      day3: z.string().optional(),
    }),
    expectedIncome: z.number().min(0, "Income cannot be negative"),
    expectedExpense: z.number().min(0, "Expense cannot be negative"),
    potentialFundingSource: z.string().optional(),
    resourcePersonDetails: z
      .string()
      .min(5, "Resource person details required"),
    isResourcePersonPaid: z.boolean(),
    resourcePersonPayment: z
      .number()
      .min(0, "Payment cannot be negative")
      .optional(),
    externalResources: z.string().optional(),
    additionalRequirements: z.string().optional(),
    targetAudience: z.string().optional(),

    proposerId: z.string(),
    proposerEmail: z.string().email(),
    proposerName: z.string(),
    department: z.string(),

    currentReviewer: z.object({
      reviewerId: z.string(),
      name: z.string(),
      email: z.string().email(),
      level: z.number(),
    }),

    status: z.literal("Pending"),
    version: z.number().int().min(1),
    createdAt: z.string().or(z.date()),
  })
  .superRefine((data, ctx) => {
    if (!data.isIndividual && !data.groupDetails) {
      ctx.addIssue({
        path: ["groupDetails"],
        code: z.ZodIssueCode.custom,
        message: "Group details are required when not an individual event",
      });
    }
    if (
      data.isResourcePersonPaid &&
      (data.resourcePersonPayment === undefined ||
        data.resourcePersonPayment === null)
    ) {
      ctx.addIssue({
        path: ["resourcePersonPayment"],
        code: z.ZodIssueCode.custom,
        message: "Payment amount is required if the resource person is paid.",
      });
    }
  });

export const forwardProposalSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  comments: z.string(),
  nextReviewer: z.object({
    reviewerId: z.string(),
    name: z.string(),
    email: z.string().email().or(z.literal("")),
    level: z.number(),
  }),
  currentReviewer: z.object({
    reviewerId: z.string(),
    name: z.string(),
    email: z.string().email(),
    level: z.number(),
  }),
});
