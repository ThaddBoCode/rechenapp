import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import appConfigDefaults from '../config/appConfig';
import { useAuth } from './AuthContext';

const ConfigContext = createContext(null);

function deepMerge(defaults, overrides) {
  const result = { ...defaults };
  for (const key of Object.keys(overrides)) {
    if (
      overrides[key] &&
      typeof overrides[key] === 'object' &&
      !Array.isArray(overrides[key]) &&
      defaults[key] &&
      typeof defaults[key] === 'object'
    ) {
      result[key] = deepMerge(defaults[key], overrides[key]);
    } else {
      result[key] = overrides[key];
    }
  }
  return result;
}

export function ConfigProvider({ children }) {
  const { userProfile, updateUserProfile } = useAuth();
  const [config, setConfigState] = useState(appConfigDefaults);

  useEffect(() => {
    if (userProfile?.settings) {
      setConfigState(deepMerge(appConfigDefaults, userProfile.settings));
    } else {
      setConfigState(appConfigDefaults);
    }
  }, [userProfile?.settings]);

  const updateConfig = useCallback(
    (path, value) => {
      setConfigState((prev) => {
        const keys = path.split('.');
        const newConfig = { ...prev };
        let current = newConfig;
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...current[keys[i]] };
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return newConfig;
      });

      const settingsUpdate = {};
      settingsUpdate[`settings.${path}`] = value;
      updateUserProfile(settingsUpdate);
    },
    [updateUserProfile]
  );

  const resetConfig = useCallback(() => {
    setConfigState(appConfigDefaults);
    updateUserProfile({ settings: {} });
  }, [updateUserProfile]);

  return (
    <ConfigContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) throw new Error('useConfig must be used within ConfigProvider');
  return context;
}
