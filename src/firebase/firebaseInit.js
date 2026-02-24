import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from './firebaseConfig';

// Prevent duplicate initialization during HMR
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Use modern persistence API (replaces deprecated enableIndexedDbPersistence)
let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch {
  // Already initialized (HMR), get existing instance
  db = getFirestore(app);
}

const storage = getStorage(app);

export { app, auth, db, storage };
