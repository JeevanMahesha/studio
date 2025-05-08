import { z } from "zod";

// Define Zod schema for Profile Status (can be expanded later)
export const ProfileStatusSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Status name is required"),
});

export type ProfileStatus = z.infer<typeof ProfileStatusSchema>;

// Define Zod schema for Profile
// Timestamps are handled separately when converting to/from Firestore
export const ProfileSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  profileStatusId: z.string().min(1, "Profile Status is required"),
  raise: z.string().min(1, "Raise is required"),
  age: z.number().min(18, "Age must be at least 18"),
  star: z.string().min(1, "Star is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  starMatchScore: z.number().min(0).max(10),
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits"),
  matrimonyId: z.string().min(1, "Matrimony ID is required"),
  comments: z.array(z.string()).default([]),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Type for client-side use (with Date objects)
export type Profile = z.infer<typeof ProfileSchema>;

// Default statuses are now seeded directly into Firestore via apiClient.ts
export const defaultStatuses: ProfileStatus[] = [
  { id: "1", name: "New" },
  { id: "2", name: "Contacted" },
  { id: "3", name: "Meeting Scheduled" },
  { id: "4", name: "Rejected" },
  { id: "5", name: "Accepted" },
  { id: "6", name: "On Hold" },
];
