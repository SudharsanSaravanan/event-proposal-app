import { z } from 'zod';

// Base user schema
export const UserSchema = z.object({
    uid: z.string().min(1, 'UID is required'),
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    email: z
        .string()
        .email('Invalid email format')
        .regex(/^[a-zA-Z0-9._%+-]+@cb\.students\.amrita\.edu$/, {
            message: 'Email must end with @cb.students.amrita.edu',
        }),
    role: z.enum(['Admin', 'Reviewer', 'Proposer'], {
        errorMap: () => ({ message: 'Role must be Admin, Reviewer, or Proposer' }),
    }),
    department: z
        .union([
            z.string().min(1, 'Department cannot be empty'),
            z.array(z.string().min(1, 'Department cannot be empty')),
            z.null(),
        ])
        .optional(),
    createdAt: z.any().optional(), // serverTimestamp
});

// Schema for POST /api/user/[id] (create user)
export const CreateUserSchema = UserSchema;

// Schema for PUT /api/user/[id] (update user)
export const UpdateUserSchema = z
    .object({
        name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
        email: z
            .string()
            .email('Invalid email format')
            .regex(/^[a-zA-Z0-9._%+-]+@cb\.students\.amrita\.edu$/, {
                message: 'Email must end with @cb.students.amrita.edu',
            })
            .optional(),
        role: z
            .enum(['Admin', 'Reviewer', 'Proposer'], {
                errorMap: () => ({ message: 'Role must be Admin, Reviewer, or Proposer' }),
            })
            .optional(),
        department: z
            .union([
                z.string().min(1, 'Department cannot be empty'),
                z.array(z.string().min(1, 'Department cannot be empty')),
                z.null(),
            ])
            .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided for update',
    });

// Schema for GET /api/user/role (query params)
export const RoleQuerySchema = z.object({
    role: z.enum(['Admin', 'Reviewer', 'Proposer'], {
        errorMap: () => ({ message: 'Role must be Admin, Reviewer, or Proposer' }),
    }),
});

// Schema for GET /api/user/search (query params)
export const SearchQuerySchema = z.object({
    name: z.string().min(1, 'Name is required for search').max(100, 'Search term too long'),
});

// Schema for URL params with ID
export const UserParamsSchema = z.object({
    id: z.string().min(1, 'User ID is required'),
});
