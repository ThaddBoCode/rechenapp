import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseInit';

// One-time migration: fix corrupted dot-notation keys stored as literal top-level fields
function migrateProfile(data) {
  const dotKeys = Object.keys(data).filter((k) => k.includes('.') && k.startsWith('settings.'));
  if (dotKeys.length === 0) return null;

  const nested = { ...data };
  const firestoreUpdates = {};

  for (const key of dotKeys) {
    const value = nested[key];
    delete nested[key];
    // Build nested structure
    const parts = key.split('.');
    let current = nested;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    // Mark for Firestore: set nested value and delete literal key
    firestoreUpdates[key] = deleteField();
  }
  // Also set the nested settings
  firestoreUpdates.settings = nested.settings;

  return { migratedData: nested, firestoreUpdates };
}

const AuthContext = createContext(null);

const isDemoMode = () => {
  const key = import.meta.env.VITE_FIREBASE_API_KEY;
  return !key || key === 'demo-key';
};

const DEMO_USER = {
  uid: 'demo-user-001',
  email: 'demo@rechenapp.de',
  displayName: 'Demo Spieler',
};

const DEMO_PROFILE = {
  displayName: 'Demo Spieler',
  avatarEmoji: '🦊',
  createdAt: new Date().toISOString(),
  theme: 'colorful',
  settings: {},
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const demo = isDemoMode();

  useEffect(() => {
    if (demo) {
      // In demo mode, check localStorage for demo session
      const demoSession = localStorage.getItem('rechenapp_demo');
      if (demoSession) {
        const profile = JSON.parse(localStorage.getItem('rechenapp_demo_profile') || 'null') || DEMO_PROFILE;
        setUser(DEMO_USER);
        setUserProfile(profile);
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (profileDoc.exists()) {
            let profileData = profileDoc.data();
            // Migrate corrupted dot-notation keys if present
            const migration = migrateProfile(profileData);
            if (migration) {
              profileData = migration.migratedData;
              try {
                await updateDoc(doc(db, 'users', firebaseUser.uid), migration.firestoreUpdates);
              } catch (err) {
                console.warn('Migration failed:', err);
              }
            }
            setUserProfile(profileData);
          }
        } catch (err) {
          console.warn('Could not load profile:', err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [demo]);

  const login = async (email, password) => {
    if (demo) {
      localStorage.setItem('rechenapp_demo', 'true');
      localStorage.setItem('rechenapp_demo_profile', JSON.stringify(DEMO_PROFILE));
      setUser(DEMO_USER);
      setUserProfile(DEMO_PROFILE);
      return DEMO_USER;
    }
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  const register = async (email, password, displayName, avatarEmoji) => {
    if (demo) {
      const profile = {
        displayName: displayName || 'Demo Spieler',
        avatarEmoji: avatarEmoji || '🦊',
        createdAt: new Date().toISOString(),
        theme: 'colorful',
        settings: {},
      };
      localStorage.setItem('rechenapp_demo', 'true');
      localStorage.setItem('rechenapp_demo_profile', JSON.stringify(profile));
      setUser({ ...DEMO_USER, displayName: profile.displayName });
      setUserProfile(profile);
      return DEMO_USER;
    }
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    const profile = {
      displayName,
      avatarEmoji: avatarEmoji || '🦊',
      createdAt: new Date().toISOString(),
      theme: 'colorful',
      settings: {},
    };
    await setDoc(doc(db, 'users', result.user.uid), profile);
    setUserProfile(profile);
    return result.user;
  };

  const logout = useCallback(async () => {
    if (demo) {
      localStorage.removeItem('rechenapp_demo');
      localStorage.removeItem('rechenapp_demo_profile');
      setUser(null);
      setUserProfile(null);
      return;
    }
    await signOut(auth);
  }, [demo]);

  const updateUserProfile = useCallback(async (updates) => {
    // Apply dot-notation keys as nested updates (e.g. 'settings.excludedNumbers.addition' → nested object)
    const applyDotNotation = (target, updates) => {
      const result = { ...target };
      for (const [key, value] of Object.entries(updates)) {
        const keys = key.split('.');
        if (keys.length === 1) {
          result[key] = value;
        } else {
          let current = result;
          for (let i = 0; i < keys.length - 1; i++) {
            current[keys[i]] = { ...(current[keys[i]] || {}) };
            current = current[keys[i]];
          }
          current[keys[keys.length - 1]] = value;
        }
      }
      return result;
    };

    if (demo) {
      setUserProfile((prev) => {
        const updated = applyDotNotation(prev, updates);
        localStorage.setItem('rechenapp_demo_profile', JSON.stringify(updated));
        return updated;
      });
      return;
    }
    if (!user) return;
    try {
      // updateDoc interprets dot-notation keys as nested field paths
      // (unlike setDoc which creates literal keys)
      await updateDoc(doc(db, 'users', user.uid), updates);
    } catch (err) {
      console.warn('Could not save profile:', err);
    }
    setUserProfile((prev) => applyDotNotation(prev, updates));
  }, [demo, user]);

  const value = {
    user,
    userProfile,
    loading,
    login,
    register,
    logout,
    updateUserProfile,
    isDemo: demo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
