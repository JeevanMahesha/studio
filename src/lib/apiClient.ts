// src/lib/apiClient.ts
import { db, profilesCollection } from "@/lib/firebase";
import { Profile, ProfileSchema } from "@/types/profile"; // Import the Zod schema
import {
  addDoc,
  deleteDoc,
  doc,
  DocumentSnapshot,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  QueryConstraint,
  serverTimestamp,
  startAfter,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { z } from "zod"; // Import z

// Helper to convert Firestore Timestamps to Dates in profile data
const profileFromDoc = (
  doc: DocumentSnapshot<
    Omit<Profile, "id" | "createdAt" | "updatedAt"> & {
      createdAt?: Timestamp;
      updatedAt?: Timestamp;
    }
  >
): Profile => {
  const data = doc.data();
  if (!data) {
    throw new Error("Document data is missing");
  }
  // Validate data against schema before processing timestamps
  // Temporarily allow any type for timestamps before validation
  const dataWithPotentiallyAnyTimestamps = {
    ...data,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };

  const validatedData = ProfileSchema.omit({ id: true }).parse({
    ...dataWithPotentiallyAnyTimestamps,
    // Convert Timestamps back to Dates for client-side use AFTER validation if they exist
    createdAt:
      data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined,
    updatedAt:
      data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
  });

  return {
    ...validatedData,
    id: doc.id, // Add the document ID
  };
};

// Helper to prepare profile data for Firestore (convert Dates to Timestamps)
const prepareProfileForFirestore = (
  profileData: Partial<Omit<Profile, "id" | "createdAt" | "updatedAt">>
) => {
  const data: Partial<
    Omit<Profile, "id" | "createdAt" | "updatedAt"> & {
      createdAt?: any;
      updatedAt?: any;
    }
  > = { ...profileData };

  if ("id" in data) {
    delete data.id;
  }

  // Convert Date objects back to Timestamps if they exist (shouldn't usually be needed if using serverTimestamp)
  // if (data.createdAt instanceof Date) {
  //     data.createdAt = Timestamp.fromDate(data.createdAt);
  // }
  // if (data.updatedAt instanceof Date) {
  //     data.updatedAt = Timestamp.fromDate(data.updatedAt);
  // }

  // Use serverTimestamp() for creation and updates
  // For add, serverTimestamp() will set both createdAt and updatedAt
  // For update, it will only set updatedAt
  if (!data.createdAt) {
    // Let Firestore handle createdAt on initial add
    data.createdAt = serverTimestamp();
  }
  data.updatedAt = serverTimestamp(); // Always set/update updatedAt

  // Remove undefined fields explicitly, Firestore doesn't store them anyway, but this keeps it clean
  Object.keys(data).forEach(
    (key) =>
      data[key as keyof typeof data] === undefined &&
      delete data[key as keyof typeof data]
  );

  console.log("Prepared data for Firestore:", data); // Log prepared data
  return data;
};

// Simulate API delay (optional, can be removed for production)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// --- Profile API ---

import { PROFILE_STATUS_IDS } from "./filterUtils";

export const fetchProfiles = async (
  filters: Record<string, any> = {}, // Keep parameter for backward compatibility
  searchTerm: string = "",
  sortBy: string = "name", // Firestore field path
  page: number = 1,
  limitValue: number = 10,
  includeRejected: boolean = false // New parameter to control whether to include rejected profiles
): Promise<{
  data: Profile[];
  total: number;
  lastVisibleDoc?: DocumentSnapshot;
}> => {
  const constraints: QueryConstraint[] = [];
  // Search Term Filter (Simple prefix search on 'name')
  if (searchTerm) {
    const endTerm = searchTerm + "\uf8ff";
    constraints.push(where("name", ">=", searchTerm));
    constraints.push(where("name", "<=", endTerm));
  }

  // Status Filter
  if (filters.profileStatusId) {
    constraints.push(where("profileStatusId", "==", filters.profileStatusId));
  } else if (!includeRejected) {
    // By default, exclude rejected profiles unless explicitly requesting a status or includeRejected is true
    // For inequality filters with ordering, we need to first orderBy the field with inequality
    constraints.push(
      where("profileStatusId", "!=", PROFILE_STATUS_IDS.REJECTED)
    );
    constraints.push(orderBy("profileStatusId")); // Required when using != with another orderBy
  }

  // --- Total Count ---
  const countQuery = query(profilesCollection, ...constraints);
  const countSnapshot = await getCountFromServer(countQuery);
  const total = countSnapshot.data().count;

  // --- Fetch Paginated Data ---
  // Only add sortBy if it's different from profileStatusId or if we're not using the inequality filter
  if (
    filters.profileStatusId ||
    includeRejected ||
    sortBy !== "profileStatusId"
  ) {
    constraints.push(orderBy(sortBy));
  }

  let paginatedQuery = query(
    profilesCollection,
    ...constraints,
    limit(limitValue)
  );
  let lastVisibleDoc: DocumentSnapshot | null = null;

  if (page > 1) {
    const offsetLimit = (page - 1) * limitValue;
    // Fetch only the last document of the previous page efficiently
    const previousDocsQuery = query(
      profilesCollection,
      ...constraints,
      limit(offsetLimit)
    );
    const previousDocsSnapshot = await getDocs(previousDocsQuery);

    if (!previousDocsSnapshot.empty) {
      const lastDocOfPreviousPage =
        previousDocsSnapshot.docs[previousDocsSnapshot.docs.length - 1];
      console.log("Paginating after doc:", lastDocOfPreviousPage.id);
      paginatedQuery = query(
        profilesCollection,
        ...constraints,
        startAfter(lastDocOfPreviousPage),
        limit(limitValue)
      );
    } else if (offsetLimit > 0) {
      // Only return empty if offset > 0 and no docs found
      console.log("Requested page beyond total documents.");
      return { data: [], total, lastVisibleDoc: undefined };
    }
  }

  const querySnapshot = await getDocs(paginatedQuery);
  const profiles: Profile[] = querySnapshot.docs
    .map((doc) => {
      try {
        return profileFromDoc(
          doc as DocumentSnapshot<
            Omit<Profile, "id" | "createdAt" | "updatedAt"> & {
              createdAt?: Timestamp;
              updatedAt?: Timestamp;
            }
          >
        );
      } catch (error) {
        console.error(`Error processing profile doc ${doc.id}:`, error);
        // Return a placeholder or skip the doc
        return null;
      }
    })
    .filter((p): p is Profile => p !== null); // Filter out any nulls from errors

  if (!querySnapshot.empty) {
    lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
  }

  return { data: profiles, total, lastVisibleDoc: lastVisibleDoc ?? undefined };
};

export const fetchProfileById = async (
  id: string
): Promise<Profile | undefined> => {
  // await delay(300);
  const docRef = doc(db, "profiles", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    try {
      return profileFromDoc(
        docSnap as DocumentSnapshot<
          Omit<Profile, "id" | "createdAt" | "updatedAt"> & {
            createdAt?: Timestamp;
            updatedAt?: Timestamp;
          }
        >
      );
    } catch (error) {
      console.error(`Error processing profile doc ${id}:`, error);
      return undefined; // Or re-throw if needed
    }
  } else {
    return undefined;
  }
};

export const addProfile = async (
  profileData: Omit<Profile, "id" | "createdAt" | "updatedAt">
): Promise<Profile> => {
  // await delay(400);
  console.log("Received profile data in addProfile:", profileData); // Log received data

  try {
    // Validate data before sending to Firestore
    const validatedData = ProfileSchema.omit({
      id: true,
      createdAt: true,
      updatedAt: true,
    }).parse(profileData);
    console.log("Validated profile data:", validatedData);

    const dataToSave = prepareProfileForFirestore(validatedData);
    console.log("Data being sent to Firestore:", dataToSave);

    const docRef = await addDoc(profilesCollection, dataToSave);
    console.log("Document written with ID: ", docRef.id);

    const newDocSnap = await getDoc(docRef); // Fetch the newly added doc to get server timestamp
    if (!newDocSnap.exists()) {
      console.error(
        "Failed to fetch newly added document immediately after creation."
      );
      throw new Error("Failed to fetch newly added profile.");
    }
    console.log("Fetched new document snapshot:", newDocSnap.data());

    const newProfile = profileFromDoc(
      newDocSnap as DocumentSnapshot<
        Omit<Profile, "id" | "createdAt" | "updatedAt"> & {
          createdAt?: Timestamp;
          updatedAt?: Timestamp;
        }
      >
    );
    console.log("Processed new profile from snapshot:", newProfile);
    return newProfile;
  } catch (error) {
    console.error("Error in addProfile:", error);
    if (error instanceof z.ZodError) {
      console.error("Zod Validation Errors:", error.errors);
    }
    // Re-throw the error so the mutation's onError handler can catch it
    throw error;
  }
};

export const updateProfile = async (
  id: string,
  profileData: Partial<Omit<Profile, "id" | "createdAt" | "updatedAt">>
): Promise<Profile | undefined> => {
  // await delay(400);
  const docRef = doc(db, "profiles", id);

  const currentDoc = await getDoc(docRef);
  if (!currentDoc.exists()) {
    console.error(`Profile with id ${id} not found for update.`);
    return undefined;
  }

  try {
    // --- Add partial validation if needed ---
    // const validatedPartialData = ProfileSchema.partial().omit({ id: true, createdAt: true, updatedAt:true }).parse(profileData);
    // const dataToUpdate = prepareProfileForFirestore(validatedPartialData);
    const dataToUpdate = prepareProfileForFirestore(profileData); // Using original for now

    await updateDoc(docRef, dataToUpdate);
    const updatedDocSnap = await getDoc(docRef);
    return profileFromDoc(
      updatedDocSnap as DocumentSnapshot<
        Omit<Profile, "id" | "createdAt" | "updatedAt"> & {
          createdAt?: Timestamp;
          updatedAt?: Timestamp;
        }
      >
    );
  } catch (error) {
    console.error(`Error updating profile ${id}:`, error);
    if (error instanceof z.ZodError) {
      console.error("Zod Validation Errors:", error.errors);
    }
    throw error; // Re-throw for mutation handler
  }
};

export const deleteProfile = async (id: string): Promise<boolean> => {
  // await delay(600);
  const docRef = doc(db, "profiles", id);
  try {
    await deleteDoc(docRef);
    console.log(`Profile ${id} deleted successfully.`);
    return true;
  } catch (error) {
    console.error(`Error deleting profile ${id}: `, error);
    return false; // Don't re-throw, allow UI to handle false return
  }
};
