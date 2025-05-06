// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, CollectionReference, DocumentData } from 'firebase/firestore';
import { Profile, ProfileStatus } from '@/types/profile'; // Ensure correct types are imported

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Helper function to create typed collection references
const createCollection = <T = DocumentData>(collectionName: string) => {
  return collection(db, collectionName) as CollectionReference<T>;
};

// Create typed collection references
const profilesCollection = createCollection<Omit<Profile, 'id' | 'createdAt' | 'updatedAt'> & { createdAt?: any, updatedAt?: any }>('profiles');
const statusesCollection = createCollection<Omit<ProfileStatus, 'id'>>('statuses');


export { db, profilesCollection, statusesCollection };

// Log project ID on initialization (optional, for debugging)
if (typeof window === 'undefined') { // Only log on server-side
    console.log(`Firebase initialized for project: ${firebaseConfig.projectId}`);
}

