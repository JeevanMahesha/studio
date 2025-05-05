// src/lib/apiClient.ts
import {
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  Timestamp,
  QueryConstraint,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  serverTimestamp, // Use server timestamp for consistency
  writeBatch,
} from 'firebase/firestore';
import { db, profilesCollection, statusesCollection } from '@/lib/firebase';
import { Profile, ProfileStatus, ProfileSchema } from '@/types/profile'; // Import the Zod schema

// Helper to convert Firestore Timestamps to Dates in profile data
const profileFromDoc = (doc: DocumentSnapshot<Omit<Profile, 'id' | 'createdAt' | 'updatedAt'> & { createdAt?: Timestamp, updatedAt?: Timestamp }>): Profile => {
  const data = doc.data();
  if (!data) {
    throw new Error("Document data is missing");
  }
  // Validate data against schema before processing timestamps
  const validatedData = ProfileSchema.omit({ id: true }).parse({
    ...data,
    // Convert Timestamps back to Dates for client-side use
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  });

  return {
    ...validatedData,
    id: doc.id, // Add the document ID
  };
};

// Helper to convert Firestore Timestamps to Dates in status data
const statusFromDoc = (doc: QueryDocumentSnapshot<Omit<ProfileStatus, 'id'>>): ProfileStatus => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
  };
};

// Helper to prepare profile data for Firestore (convert Dates to Timestamps)
const prepareProfileForFirestore = (profileData: Partial<Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const data: Partial<Omit<Profile, 'id' | 'createdAt' | 'updatedAt'> & { createdAt?: any, updatedAt?: any }> = { ...profileData };

    // Use serverTimestamp() for creation and updates
    if (!data.createdAt) { // Only set createdAt on creation implicitly
        data.createdAt = serverTimestamp();
    }
    data.updatedAt = serverTimestamp(); // Always set updatedAt

    // Remove undefined fields explicitly, Firestore doesn't store them anyway, but this keeps it clean
    Object.keys(data).forEach(key => data[key as keyof typeof data] === undefined && delete data[key as keyof typeof data]);

    return data;
};

// Simulate API delay (optional, can be removed for production)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


// --- Profile API ---

export const fetchProfiles = async (
    filters: Record<string, any> = {},
    searchTerm: string = '',
    sortBy: string = 'name', // Firestore field path
    page: number = 1,
    limitValue: number = 10,
    // lastVisibleDoc: DocumentSnapshot | null = null // Alternative pagination cursor
): Promise<{ data: Profile[], total: number, lastVisibleDoc?: DocumentSnapshot }> => {
    await delay(500); // Simulate latency

    const constraints: QueryConstraint[] = [];

    // Search Term Filter (Simple prefix search on 'name')
    // Firestore doesn't support case-insensitive 'contains' directly.
    // For robust search, consider dedicated search services (e.g., Algolia, Typesense)
    // or use tricks like storing lowercase versions of fields.
    // This is a basic prefix search:
    if (searchTerm) {
        const endTerm = searchTerm + '\uf8ff'; // High Unicode character for prefix range
        constraints.push(where('name', '>=', searchTerm));
        constraints.push(where('name', '<=', endTerm));
        // Note: Combining prefix search with other filters might require composite indexes.
        // Also, sorting by a different field than the one used in range filter (`name`) requires a specific index.
    }


    // Apply other filters
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
             // Special handling for numeric fields if necessary (e.g., age, score ranges)
             if (key === 'age' || key === 'starMatchScore') {
                 // Example: if filters.age is a number, match exactly
                 if (typeof value === 'number') {
                     constraints.push(where(key, '==', value));
                 }
                 // Add range filtering logic here if needed
             } else {
                 // Assume exact match for other fields (like statusId, city, state, etc.)
                 constraints.push(where(key, '==', value));
             }
        }
    });

    // --- Total Count ---
     // Create a query for counting that includes all filters but no sorting/pagination
     const countQueryConstraints = constraints.filter(c => !c.type.startsWith('orderBy')); // Remove orderBy for count
     const countQuery = query(profilesCollection, ...countQueryConstraints);
     const countSnapshot = await getCountFromServer(countQuery);
     const total = countSnapshot.data().count;


    // --- Fetch Paginated Data ---
    // Sorting
    constraints.push(orderBy(sortBy)); // Add sorting

    // Pagination using page number (requires fetching previous pages' last docs - less efficient)
    // Or using lastVisibleDoc (more efficient cursor-based pagination)
    let paginatedQuery = query(profilesCollection, ...constraints, limit(limitValue));
    let lastVisibleDoc: DocumentSnapshot | null = null;

     // Calculate offset - Inefficient for large datasets in Firestore
     if (page > 1) {
         const offsetLimit = (page - 1) * limitValue;
         const previousDocsQuery = query(profilesCollection, ...constraints, limit(offsetLimit));
         const previousDocsSnapshot = await getDocs(previousDocsQuery);
         if (!previousDocsSnapshot.empty) {
             const lastDocOfPreviousPage = previousDocsSnapshot.docs[previousDocsSnapshot.docs.length - 1];
             paginatedQuery = query(profilesCollection, ...constraints, startAfter(lastDocOfPreviousPage), limit(limitValue));
         } else {
             // Requested page is beyond the total number of documents, return empty
              return { data: [], total, lastVisibleDoc: undefined };
         }
     }


    const querySnapshot = await getDocs(paginatedQuery);
    const profiles: Profile[] = querySnapshot.docs.map(profileFromDoc);

    // Get the last visible document for cursor-based pagination if needed
    if (!querySnapshot.empty) {
        lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    }


    return { data: profiles, total, lastVisibleDoc: lastVisibleDoc ?? undefined };
};

export const fetchProfileById = async (id: string): Promise<Profile | undefined> => {
    await delay(300);
    const docRef = doc(db, 'profiles', id); // Correctly reference the document
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return profileFromDoc(docSnap as DocumentSnapshot<Omit<Profile, 'id' | 'createdAt' | 'updatedAt'> & { createdAt?: Timestamp, updatedAt?: Timestamp }>);
    } else {
        return undefined;
    }
};

export const addProfile = async (profileData: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>): Promise<Profile> => {
    await delay(400);
     // Validate data before sending to Firestore
    const validatedData = ProfileSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(profileData);
    const dataToSave = prepareProfileForFirestore(validatedData);

    const docRef = await addDoc(profilesCollection, dataToSave);
    const newDocSnap = await getDoc(docRef); // Fetch the newly added doc to get server timestamp
    return profileFromDoc(newDocSnap as DocumentSnapshot<Omit<Profile, 'id' | 'createdAt' | 'updatedAt'> & { createdAt?: Timestamp, updatedAt?: Timestamp }>);
};

export const updateProfile = async (id: string, profileData: Partial<Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Profile | undefined> => {
    await delay(400);
    const docRef = doc(db, 'profiles', id);

     // Fetch current doc to ensure it exists before attempting update
     const currentDoc = await getDoc(docRef);
     if (!currentDoc.exists()) {
         console.error(`Profile with id ${id} not found for update.`);
         return undefined;
     }

    // Validate partial data - Zod's .partial() might be useful here if needed
    // For simplicity, we assume incoming data structure is correct, but validation is recommended
    const dataToUpdate = prepareProfileForFirestore(profileData);

    await updateDoc(docRef, dataToUpdate);
    const updatedDocSnap = await getDoc(docRef); // Fetch the updated doc
    return profileFromDoc(updatedDocSnap as DocumentSnapshot<Omit<Profile, 'id' | 'createdAt' | 'updatedAt'> & { createdAt?: Timestamp, updatedAt?: Timestamp }>);
};

export const deleteProfile = async (id: string): Promise<boolean> => {
    await delay(600);
    const docRef = doc(db, 'profiles', id);
    try {
        await deleteDoc(docRef);
        return true;
    } catch (error) {
        console.error("Error deleting profile: ", error);
        return false;
    }
};


// --- Status API ---

export const fetchStatuses = async (): Promise<ProfileStatus[]> => {
    await delay(200);
    const q = query(statusesCollection, orderBy('name')); // Optionally order statuses
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(statusFromDoc);
};

export const addStatus = async (statusData: Omit<ProfileStatus, 'id'>): Promise<ProfileStatus> => {
    await delay(300);
    // Validate data
     const validatedData = ProfileSchema.shape.statusId.safeParse(statusData.name); // Example validation, adapt as needed
     if (!validatedData.success) {
         throw new Error(`Invalid status data: ${validatedData.error.message}`);
     }

    const docRef = await addDoc(statusesCollection, statusData);
    const newDocSnap = await getDoc(docRef);
    return statusFromDoc(newDocSnap as QueryDocumentSnapshot<Omit<ProfileStatus, 'id'>>);
};

export const updateStatus = async (id: string, statusData: Partial<Omit<ProfileStatus, 'id'>>): Promise<ProfileStatus | undefined> => {
    await delay(300);
    const docRef = doc(db, 'statuses', id);

     // Fetch current doc to ensure it exists
     const currentDoc = await getDoc(docRef);
     if (!currentDoc.exists()) {
         console.error(`Status with id ${id} not found for update.`);
         return undefined;
     }

     // Validate partial data if necessary
    await updateDoc(docRef, statusData);
    const updatedDocSnap = await getDoc(docRef);
    return statusFromDoc(updatedDocSnap as QueryDocumentSnapshot<Omit<ProfileStatus, 'id'>>);
};

export const deleteStatus = async (id: string): Promise<boolean> => {
    await delay(400);
    // Check if status is used by any profile before deleting
    const profilesUsingStatusQuery = query(profilesCollection, where('statusId', '==', id), limit(1));
    const usageSnapshot = await getDocs(profilesUsingStatusQuery);

    if (!usageSnapshot.empty) {
        console.warn(`Status ${id} is in use by profile ${usageSnapshot.docs[0].id} and cannot be deleted.`);
        return false; // Indicate deletion failed because it's in use
    }

    const docRef = doc(db, 'statuses', id);
    try {
        await deleteDoc(docRef);
        return true;
    } catch (error) {
        console.error("Error deleting status: ", error);
        return false;
    }
};


// --- Seed Default Statuses (Run once, e.g., in a setup script or check on app start) ---
export const seedDefaultStatuses = async () => {
    const defaultStatuses: Omit<ProfileStatus, 'id'>[] = [
      { name: 'New', description: 'Newly added profile.' },
      { name: 'Contacted', description: 'Initial contact made.' },
      { name: 'Meeting Scheduled', description: 'A meeting has been set up.' },
      { name: 'Rejected', description: 'Profile was rejected.' },
      { name: 'Accepted', description: 'Profile was accepted.' },
      { name: 'On Hold', description: 'Decision pending or temporarily paused.' },
    ];

    const snapshot = await getDocs(query(statusesCollection, limit(1)));
    if (snapshot.empty) {
        console.log('Seeding default statuses...');
        const batch = writeBatch(db);
        defaultStatuses.forEach((statusData) => {
            const docRef = doc(statusesCollection); // Firestore generates the ID
            batch.set(docRef, statusData);
        });
        await batch.commit();
        console.log('Default statuses seeded.');
    } else {
        // console.log('Statuses collection is not empty, skipping seed.');
    }
};

// Optional: Call seeding function on module load (or trigger it elsewhere)
// seedDefaultStatuses(); // Be cautious about calling this directly on module load in Next.js
