import * as admin from 'firebase-admin';
import { firebaseConfig, firestoreDatabaseId } from './firebase-config';

console.log("DEBUG: Initializing Admin SDK with project:", firebaseConfig.projectId);
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: firebaseConfig.storageBucket,
    projectId: firebaseConfig.projectId
  });
  console.log("DEBUG: Admin SDK initialized.");
} else {
    console.log("DEBUG: Admin SDK already initialized.");
}

export const adminDb = admin.firestore();
console.log("DEBUG: Admin Db created.");

adminDb.settings({ databaseId: firestoreDatabaseId });
console.log("DEBUG: Admin Db settings set.");
export const adminAuth = admin.auth();
console.log("DEBUG: Admin Auth created.");
export const adminStorage = admin.storage();
console.log("DEBUG: Admin Storage created.");
