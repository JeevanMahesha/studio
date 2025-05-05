import { z } from 'zod';

// Define Zod schema for Profile Status (can be expanded later)
export const ProfileStatusSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Status name is required'),
  description: z.string().optional(),
});

export type ProfileStatus = z.infer<typeof ProfileStatusSchema>;

// Define Zod schema for Profile
export const ProfileSchema = z.object({
  id: z.string().optional(), // Optional for creation, required for update/display
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
  createdAt: z.date().optional(), // Add timestamps
  updatedAt: z.date().optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;

// Example default status list (in a real app, this would come from the backend)
export const defaultStatuses: ProfileStatus[] = [
  { id: '1', name: 'New' },
  { id: '2', name: 'Contacted' },
  { id: '3', name: 'Meeting Scheduled' },
  { id: '4', name: 'Rejected' },
  { id: '5', name: 'Accepted' },
  { id: '6', name: 'On Hold' },
];
