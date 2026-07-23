export const PREFERENCES_KEY = "repflow-preferences";

export const DEFAULT_PREFERENCES = {
  theme: "dark",
  waterUnit: "cl",
  distanceUnit: "steps",
  remindersEnabled: false,
  reminderTime: "09:00",
};

export function getPreferences() {
  if (typeof window === "undefined") {
    return { ...DEFAULT_PREFERENCES };
  }

  try {
    const raw = window.localStorage.getItem(PREFERENCES_KEY);
    if (!raw) {
      return { ...DEFAULT_PREFERENCES };
    }

    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(next) {
  const merged = { ...DEFAULT_PREFERENCES, ...next };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent("repflow:preferences", { detail: merged }));
  }
  return merged;
}

/** Convert stored cl → display number (no unit suffix). */
export function convertClToDisplay(cl, unit = "cl") {
  const value = Number(cl) || 0;

  if (unit === "ml") {
    return Math.round(value * 10);
  }

  if (unit === "oz") {
    return Number((value * (10 / 29.5735295625)).toFixed(1));
  }

  return value;
}

/** Convert stored water cl value for display only (does not change stored data). */
export function formatWater(cl, unit = "cl") {
  const amount = convertClToDisplay(cl, unit);

  if (unit === "oz") {
    return `${amount} oz`;
  }

  if (unit === "ml") {
    return `${Number(amount).toLocaleString()} ml`;
  }

  return `${Number(amount).toLocaleString()} cl`;
}

export function formatWaterAmount(cl, unit = "cl") {
  const amount = convertClToDisplay(cl, unit);
  if (unit === "oz") return String(amount);
  return Number(amount).toLocaleString();
}

export function waterUnitLabel(unit = "cl") {
  if (unit === "ml") return "ml";
  if (unit === "oz") return "oz";
  return "cl";
}
