import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseInit';
import rewardsConfig from '../config/rewardsConfig';

// ── Demo Mode Detection ──

const isDemoMode = () => {
  const key = import.meta.env.VITE_FIREBASE_API_KEY;
  return !key || key === 'demo-key';
};

const getLocalData = (key) => {
  try {
    return JSON.parse(localStorage.getItem(`rechenapp_${key}`) || 'null');
  } catch { return null; }
};

const setLocalData = (key, data) => {
  localStorage.setItem(`rechenapp_${key}`, JSON.stringify(data));
};

// ── Test Results ──

export async function saveTestResult(userId, testResult) {
  if (isDemoMode()) {
    const history = getLocalData('test_history') || [];
    history.unshift({
      id: `test_${Date.now()}`,
      ...testResult,
      timestamp: new Date().toISOString(),
    });
    setLocalData('test_history', history.slice(0, 50));
    return;
  }
  const testsRef = collection(db, 'users', userId, 'testResults');
  return addDoc(testsRef, {
    ...testResult,
    timestamp: serverTimestamp(),
  });
}

export async function getTestHistory(userId, maxResults = 20) {
  if (isDemoMode()) {
    const history = getLocalData('test_history') || [];
    return history.slice(0, maxResults).map((t) => ({
      ...t,
      timestamp: t.timestamp ? { toDate: () => new Date(t.timestamp) } : null,
    }));
  }
  const testsRef = collection(db, 'users', userId, 'testResults');
  const q = query(testsRef, orderBy('timestamp', 'desc'), limit(maxResults));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// ── Learning Data ──

export async function saveLearningData(userId, learningData) {
  if (isDemoMode()) {
    const existing = getLocalData('learning_data') || {};
    Object.assign(existing, learningData);
    setLocalData('learning_data', existing);
    return;
  }
  const promises = Object.entries(learningData).map(([key, entry]) => {
    const ref = doc(db, 'users', userId, 'learningData', key);
    return setDoc(ref, entry, { merge: true });
  });
  return Promise.all(promises);
}

export async function getLearningData(userId) {
  if (isDemoMode()) {
    return getLocalData('learning_data') || {};
  }
  const ref = collection(db, 'users', userId, 'learningData');
  const snapshot = await getDocs(ref);
  const data = {};
  snapshot.docs.forEach((doc) => {
    data[doc.id] = doc.data();
  });
  return data;
}

// ── Rankings ──

export async function updateRanking(userId, rankingData) {
  if (isDemoMode()) {
    const rankings = getLocalData('rankings') || {};
    const existing = rankings[userId] || {};
    rankings[userId] = {
      ...existing,
      ...rankingData,
      bestScore: Math.max(existing.bestScore || 0, rankingData.bestScore || 0),
      totalTests: (existing.totalTests || 0) + 1,
      lastUpdated: new Date().toISOString(),
    };
    setLocalData('rankings', rankings);
    return;
  }
  const ref = doc(db, 'rankings', userId);
  return setDoc(ref, {
    ...rankingData,
    lastUpdated: serverTimestamp(),
  }, { merge: true });
}

export async function getRankings(topN = 20) {
  if (isDemoMode()) {
    const rankings = getLocalData('rankings') || {};
    return Object.entries(rankings)
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((a, b) => (b.bestScore || 0) - (a.bestScore || 0))
      .slice(0, topN);
  }
  const ref = collection(db, 'rankings');
  const q = query(ref, orderBy('bestScore', 'desc'), limit(topN));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ userId: doc.id, ...doc.data() }));
}

// ── Rewards ──

export async function getRewardsConfig() {
  // Rewards config is local (videos in public/videos/)
  return rewardsConfig;
}

export async function getUserRewards(userId) {
  if (isDemoMode()) {
    return getLocalData('user_rewards') || {};
  }
  const ref = collection(db, 'users', userId, 'unlockedRewards');
  const snapshot = await getDocs(ref);
  const data = {};
  snapshot.docs.forEach((doc) => {
    data[doc.id] = doc.data();
  });
  return data;
}

export async function unlockReward(userId, rewardId) {
  if (isDemoMode()) {
    const rewards = getLocalData('user_rewards') || {};
    rewards[rewardId] = {
      unlockedAt: new Date().toISOString(),
      videoWatched: false,
    };
    setLocalData('user_rewards', rewards);
    return;
  }
  const ref = doc(db, 'users', userId, 'unlockedRewards', rewardId);
  return setDoc(ref, {
    unlockedAt: serverTimestamp(),
    videoWatched: false,
  });
}

export async function markVideoWatched(userId, rewardId) {
  if (isDemoMode()) {
    const rewards = getLocalData('user_rewards') || {};
    if (rewards[rewardId]) {
      rewards[rewardId].videoWatched = true;
      setLocalData('user_rewards', rewards);
    }
    return;
  }
  const ref = doc(db, 'users', userId, 'unlockedRewards', rewardId);
  return setDoc(ref, { videoWatched: true }, { merge: true });
}
