"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_PREFERENCES, getPreferences, savePreferences } from "@/lib/preferences";

const PreferencesContext = createContext({
  preferences: DEFAULT_PREFERENCES,
  updatePreferences: () => {},
});

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPreferences(getPreferences());
    setReady(true);

    function onStorage(event) {
      if (event.key === "repflow-preferences") {
        setPreferences(getPreferences());
      }
    }

    function onCustom(event) {
      if (event.detail) {
        setPreferences(event.detail);
      }
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("repflow:preferences", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("repflow:preferences", onCustom);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.dataset.theme = preferences.theme;
    if (preferences.theme === "light") {
      root.classList.add("theme-light");
      root.classList.remove("theme-dark");
    } else {
      root.classList.add("theme-dark");
      root.classList.remove("theme-light");
    }
  }, [preferences.theme, ready]);

  const value = useMemo(
    () => ({
      preferences,
      updatePreferences(partial) {
        setPreferences((prev) => {
          const next = savePreferences({ ...prev, ...partial });
          return next;
        });
      },
    }),
    [preferences],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  return useContext(PreferencesContext);
}
