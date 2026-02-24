import { useState, useCallback, useRef, useEffect } from 'react';
import {
  problemKey,
  createLearningEntry,
  updateOnCorrect,
  updateOnWrong,
  shouldForceRepeat,
  createForcedRepeat,
  applyDecay,
} from '../services/adaptiveService';
import { getLearningData, saveLearningData } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';

export default function useAdaptiveLearning() {
  const { user } = useAuth();
  const [learningData, setLearningData] = useState({});
  const [loaded, setLoaded] = useState(false);
  const forcedRepeatQueueRef = useRef([]);
  const saveTimeoutRef = useRef(null);
  const pendingChangesRef = useRef({});

  // Load learning data from Firestore on mount
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    getLearningData(user.uid)
      .then((data) => {
        if (cancelled) return;
        // Apply time-based decay to all entries
        const decayed = {};
        for (const [key, entry] of Object.entries(data)) {
          decayed[key] = applyDecay(entry);
        }
        setLearningData(decayed);
        setLoaded(true);
      })
      .catch((err) => {
        console.warn('Could not load learning data:', err);
        setLoaded(true);
      });

    return () => { cancelled = true; };
  }, [user]);

  // Debounced save: save pending changes after 2 seconds of inactivity
  const scheduleSave = useCallback(() => {
    if (!user) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      const changes = { ...pendingChangesRef.current };
      if (Object.keys(changes).length === 0) return;
      pendingChangesRef.current = {};

      saveLearningData(user.uid, changes).catch((err) => {
        console.warn('Could not save learning data:', err);
        // Put changes back in pending on failure
        Object.assign(pendingChangesRef.current, changes);
      });
    }, 2000);
  }, [user]);

  // Save on unmount (when leaving practice screen)
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      const changes = { ...pendingChangesRef.current };
      if (user && Object.keys(changes).length > 0) {
        pendingChangesRef.current = {};
        saveLearningData(user.uid, changes).catch(() => {});
      }
    };
  }, [user]);

  const getEntry = useCallback(
    (operation, a, b) => {
      const key = problemKey(operation, a, b);
      return learningData[key] || null;
    },
    [learningData]
  );

  const recordAnswer = useCallback(
    (problem, isCorrect, responseTimeMs, config) => {
      const key = problemKey(problem.operation, problem.a, problem.b);

      setLearningData((prev) => {
        const existing = prev[key] || createLearningEntry(problem.operation, problem.a, problem.b);
        const updated = isCorrect
          ? updateOnCorrect(existing, responseTimeMs, config)
          : updateOnWrong(existing, responseTimeMs, config);

        // Check if we should force a repeat
        if (!isCorrect && shouldForceRepeat(updated, config)) {
          forcedRepeatQueueRef.current = [
            ...forcedRepeatQueueRef.current.filter((r) => r.key !== key),
            createForcedRepeat(key, config),
          ];
        }

        // Track changes for debounced save
        pendingChangesRef.current[key] = updated;
        scheduleSave();

        return { ...prev, [key]: updated };
      });
    },
    [scheduleSave]
  );

  const getForcedRepeatQueue = useCallback(() => {
    return forcedRepeatQueueRef.current;
  }, []);

  const setForcedRepeatQueue = useCallback((queue) => {
    forcedRepeatQueueRef.current = queue;
  }, []);

  return {
    learningData,
    loaded,
    getEntry,
    recordAnswer,
    getForcedRepeatQueue,
    setForcedRepeatQueue,
  };
}
