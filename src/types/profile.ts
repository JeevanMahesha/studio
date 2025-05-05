import { z } from 'zod';

// Define Zod schema for Profile Status (can be expanded later)
export const ProfileStatusSchema = z.object({
  id: z.string(), // ID will be managed by Firestore
  name: z.string().min(1, 'Status name is required'),
  description: z.string().optional(),
});

export type ProfileStatus = z.infer<typeof ProfileStatusSchema>;

// Define Zod schema for Profile
// Timestamps are handled separately when converting to/from Firestore
export const ProfileSchema = z.object({
  id: z.string().optional(), // Optional for creation, comes from Firestore doc ID
  name: z.string().min(1, 'Name is required'),
  casteRaise: z.string().min(1, 'Caste/Raise is required'), // Changed field name for consistency
  age: z.number().int().positive('Age must be a positive number').min(18, 'Age must be at least 18'),
  star: z.string().min(1, 'Star is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  starMatchScore: z
    .number()
    .min(0, 'Score must be non-negative')
    .max(10, 'Score cannot exceed 10'), // Assuming a 0-10 score
  mobileNumber: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid mobile number format'), // Basic E.164 format check
  statusId: z.string().min(1, 'Status is required'), // Link to ProfileStatus ID
  matrimonyId: z.string().min(1, 'Matrimony ID is required'),
  comments: z.string().optional(),
  // Dates are handled during Firestore conversion
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Type for client-side use (with Date objects)
export type Profile = z.infer<typeof ProfileSchema>;


// Default statuses are now seeded directly into Firestore via apiClient.ts
// export const defaultStatuses: ProfileStatus[] = [...]; // Remove this export
