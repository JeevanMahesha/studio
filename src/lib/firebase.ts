// src/lib/firebase.ts
import { Profile } from "@/types/profile"; // Ensure correct types are imported
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  collection,
  CollectionReference,
  DocumentData,
  getFirestore,
} from "firebase/firestore";
import { firebaseConfigEnv } from "../../env";

const firebaseConfig = {
  apiKey: firebaseConfigEnv.apiKey,
  authDomain: firebaseConfigEnv.authDomain,
  projectId: firebaseConfigEnv.projectId,
  storageBucket: firebaseConfigEnv.storageBucket,
  messagingSenderId: firebaseConfigEnv.messagingSenderId,
  appId: firebaseConfigEnv.appId,
};

// Initialize Firebase with error handling
let app;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
  throw error;
}

// Initialize Firestore
const db = getFirestore(app);

// Helper function to create typed collection references
const createCollection = <T = DocumentData>(collectionName: string) => {
  return collection(db, collectionName) as CollectionReference<T>;
};

// Create typed collection references
const profilesCollection = createCollection<
  Omit<Profile, "id" | "createdAt" | "updatedAt"> & {
    createdAt?: any;
    updatedAt?: any;
  }
>("profiles");

export { db, profilesCollection };

// Log project ID on initialization (optional, for debugging)
if (typeof window === "undefined") {
  // Only log on server-side
  console.log(`Firebase initialized for project: ${firebaseConfig.projectId}`);
}
