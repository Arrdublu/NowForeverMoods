import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

import { firebaseConfig, firestoreDatabaseId } from './firebase-config';

let app: any = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

function getAppInstance() {
  if (!app) {
    if (getApps().length === 0) {
      if (!firebaseConfig.apiKey) {
        console.warn("Firebase API key is missing. Check your environment variables.");
      }
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
  }
  return app;
}

export function getAuthService(): Auth {
  if (!auth) {
    auth = getAuth(getAppInstance());
  }
  return auth;
}

export function getDb(): Firestore {
  if (!db) {
     const appInstance = getAppInstance();
     const dbId = firestoreDatabaseId || "(default)";
     try {
       // Standard initialization is preferred
       db = getFirestore(appInstance, dbId);
     } catch (e) {
       console.warn("Retrying Firestore initialization with fallback...");
       db = getFirestore(appInstance);
     }
  }
  return db;
}

export function getStorageService(): FirebaseStorage {
  if (!storage) {
    storage = getStorage(getAppInstance());
  }
  return storage;
}

// Test connection and handle offline errors as per integration guide
export async function testConnection() {
  try {
    await getDocFromServer(doc(getDb(), 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or network.");
    }
  }
}

// NOTE: We don't call testConnection immediately on module load anymore.
// It should be called when needed, e.g. in a useEffect, or via a setup hook.

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

// Helper for safe JSON stringification to avoid circular structure errors
function safeStringify(obj: any): string {
  const cache = new WeakSet();
  try {
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          return '[Circular]';
        }
        
        // IDENTIFY FIRESTORE/FIREBASE INTERNAL OBJECTS
        const constructorName = value.constructor?.name;
        
        // These are common minified or internal names that cause circularity
        const isInternal = 
          constructorName === 'Y' || 
          constructorName === 'Ka' || 
          constructorName === 'Firestore' || 
          constructorName === 'Auth' || 
          constructorName === 'FirebaseAppImpl' ||
          constructorName === 'DocumentReference' || 
          constructorName === 'Query' ||
          constructorName === 'CollectionReference' ||
          constructorName === 'DocumentSnapshot' ||
          constructorName === 'FirestoreImpl' ||
          constructorName === 'Transaction' ||
          constructorName === 'FieldValue' ||
          (typeof constructorName === 'string' && (
            constructorName.length <= 2 || 
            constructorName.startsWith('Firebase')
          )) ||
          // Check for common internal property markers if names are obscured
          value._database || 
          value._firestore || 
          value._service ||
          value.INTERNAL;

        if (isInternal) {
          return `[Internal Object: ${constructorName || 'Unknown'}]`;
        }

        cache.add(value);

        // Handle possible DOM nodes
        if (typeof value.nodeType === 'number' && typeof value.nodeName === 'string') {
          return `[DOM Node: ${value.nodeName}]`;
        }
        
        // Handle Promises
        if (typeof value.then === 'function') {
          return '[Promise]';
        }
      }
      return value;
    });
  } catch (err) {
    // Ultimate fallback if JSON.stringify still fails
    try {
      // Try to at least get keys and basic info
      const keys = Object.keys(obj).join(', ');
      return `{"error": "Stringify failure", "keys": "${keys}", "type": "${typeof obj}"}`;
    } catch {
      return `{"error": "Total serialization failure"}`;
    }
  }
}

export function handleFirestoreError(error: any, operation: FirestoreErrorInfo['operationType'], path: string | null = null): never {
  let info: any = {};
  
  try {
    const authUser = getAuthService().currentUser;
    
    let safeErrorMsg = "Unknown error";
    if (error instanceof Error) {
      safeErrorMsg = error.message;
    } else if (typeof error === 'string') {
      safeErrorMsg = error;
    } else if (error && typeof error === 'object') {
      const possibleMsg = error.message || error.code || error.reason;
      safeErrorMsg = typeof possibleMsg === 'string' ? possibleMsg : String(error);
    } else {
      safeErrorMsg = String(error);
    }

    info = {
      error: safeErrorMsg,
      operationType: operation,
      path: path ? String(path) : null,
      authInfo: {
        userId: authUser?.uid || 'anonymous',
        email: authUser?.email || '',
        emailVerified: !!authUser?.emailVerified,
        isAnonymous: !!authUser?.isAnonymous,
        providerInfo: Array.isArray(authUser?.providerData) ? authUser.providerData.map(p => ({
          providerId: String(p.providerId || ''),
          displayName: String(p.displayName || ''),
          email: String(p.email || '')
        })) : []
      }
    };
  } catch (prepareErr) {
    console.error("Critical: Failed to prepare error info", prepareErr);
    info = { error: "Failed to prepare error info", originalError: String(error) };
  }

  const serialized = safeStringify(info);
  console.error('Firestore Error Payload:', serialized);
  throw new Error(serialized);
}
