// src/lib/apiClient.ts
import { Profile, ProfileStatus, defaultStatuses } from '@/types/profile';

// In-memory store for demonstration purposes
let profiles: Profile[] = [
    {
        id: 'prof_1',
        name: 'Aisha Sharma',
        casteRaise: 'Brahmin',
        age: 28,
        star: 'Rohini',
        city: 'Bangalore',
        state: 'Karnataka',
        starMatchScore: 8,
        mobileNumber: '+919876543210',
        statusId: '1',
        matrimonyId: 'MAT12345',
        comments: 'Initial profile.',
        createdAt: new Date(2023, 10, 15),
        updatedAt: new Date(2023, 10, 15),
    },
    {
        id: 'prof_2',
        name: 'Rohan Verma',
        casteRaise: 'Kshatriya',
        age: 31,
        star: 'Ashwini',
        city: 'Mumbai',
        state: 'Maharashtra',
        starMatchScore: 7,
        mobileNumber: '+919123456789',
        statusId: '2',
        matrimonyId: 'MAT67890',
        comments: 'Contacted via phone.',
        createdAt: new Date(2023, 11, 1),
        updatedAt: new Date(2023, 11, 5),
    },
    {
        id: 'prof_3',
        name: 'Priya Singh',
        casteRaise: 'Vaishya',
        age: 26,
        star: 'Bharani',
        city: 'Delhi',
        state: 'Delhi',
        starMatchScore: 9,
        mobileNumber: '+918765432109',
        statusId: '1',
        matrimonyId: 'MAT11223',
        createdAt: new Date(2024, 0, 10),
        updatedAt: new Date(2024, 0, 10),
    },
];

let statuses: ProfileStatus[] = [...defaultStatuses];
let nextProfileId = 4;
let nextStatusId = defaultStatuses.length + 1;

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Profile API ---

export const fetchProfiles = async (
    filters: any = {},
    searchTerm: string = '',
    sortBy: string = 'name',
    page: number = 1,
    limit: number = 10
): Promise<{ data: Profile[], total: number }> => {
    await delay(500); // Simulate network latency

    let filteredProfiles = profiles.filter(p => {
        // Search term filter (name)
        if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }
        // Other filters
        for (const key in filters) {
            if (filters[key] && p[key as keyof Profile] !== filters[key]) {
                // Special handling for age and score ranges if needed (not implemented here)
                return false;
            }
        }
        return true;
    });

    // Sorting
    filteredProfiles.sort((a, b) => {
        const valA = a[sortBy as keyof Profile];
        const valB = b[sortBy as keyof Profile];
        if (typeof valA === 'string' && typeof valB === 'string') {
            return valA.localeCompare(valB);
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
            return valA - valB;
        }
        return 0; // Default no sort if types mismatch or not handled
    });

    // Pagination
    const total = filteredProfiles.length;
    const paginatedProfiles = filteredProfiles.slice((page - 1) * limit, page * limit);

    return { data: paginatedProfiles, total };
};

export const fetchProfileById = async (id: string): Promise<Profile | undefined> => {
    await delay(300);
    return profiles.find(p => p.id === id);
};

export const addProfile = async (profileData: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>): Promise<Profile> => {
    await delay(400);
    const newProfile: Profile = {
        ...profileData,
        id: `prof_${nextProfileId++}`,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    profiles.push(newProfile);
    return newProfile;
};

export const updateProfile = async (id: string, profileData: Partial<Profile>): Promise<Profile | undefined> => {
    await delay(400);
    const index = profiles.findIndex(p => p.id === id);
    if (index === -1) return undefined;

    profiles[index] = {
        ...profiles[index],
        ...profileData,
        updatedAt: new Date(),
    };
    return profiles[index];
};

export const deleteProfile = async (id: string): Promise<boolean> => {
    await delay(600);
    const initialLength = profiles.length;
    profiles = profiles.filter(p => p.id !== id);
    return profiles.length < initialLength;
};

// --- Status API ---

export const fetchStatuses = async (): Promise<ProfileStatus[]> => {
    await delay(200);
    return [...statuses]; // Return a copy
};

export const addStatus = async (statusData: Omit<ProfileStatus, 'id'>): Promise<ProfileStatus> => {
    await delay(300);
    const newStatus: ProfileStatus = {
        ...statusData,
        id: `status_${nextStatusId++}`,
    };
    statuses.push(newStatus);
    return newStatus;
};

export const updateStatus = async (id: string, statusData: Partial<ProfileStatus>): Promise<ProfileStatus | undefined> => {
    await delay(300);
    const index = statuses.findIndex(s => s.id === id);
    if (index === -1) return undefined;

    statuses[index] = { ...statuses[index], ...statusData };
    return statuses[index];
};

export const deleteStatus = async (id: string): Promise<boolean> => {
    await delay(400);
     // Check if status is used by any profile before deleting (important!)
    const isUsed = profiles.some(profile => profile.statusId === id);
    if (isUsed) {
        console.warn(`Status ${id} is in use and cannot be deleted.`);
        // Optionally throw an error or return a specific response
        return false; // Indicate deletion failed
    }
    const initialLength = statuses.length;
    statuses = statuses.filter(s => s.id !== id);
    return statuses.length < initialLength;
};
