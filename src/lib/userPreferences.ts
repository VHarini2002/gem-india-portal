export type FontSizePref = "small" | "medium" | "large";
export type PortalViewPref = "default" | "compact" | "expanded";

export type UserPreferences = {
  fontSize: FontSizePref;
  portalView: PortalViewPref;
  isDarkTheme: boolean;
};

const DEFAULT_PREFS: UserPreferences = {
  fontSize: "medium",
  portalView: "default",
  isDarkTheme: false,
};

const keyForUser = (userKey: string) => `gem-prefs:${userKey}`;

export function readUserPreferences(userKey: string): UserPreferences {
  try {
    const raw = sessionStorage.getItem(keyForUser(userKey));
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return {
      fontSize: (parsed.fontSize ?? DEFAULT_PREFS.fontSize) as UserPreferences["fontSize"],
      portalView: (parsed.portalView ?? DEFAULT_PREFS.portalView) as UserPreferences["portalView"],
      isDarkTheme: typeof parsed.isDarkTheme === "boolean" ? parsed.isDarkTheme : DEFAULT_PREFS.isDarkTheme,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function writeUserPreferences(userKey: string, prefs: UserPreferences) {
  sessionStorage.setItem(keyForUser(userKey), JSON.stringify(prefs));
}

export function patchUserPreferences(userKey: string, patch: Partial<UserPreferences>) {
  const next = { ...readUserPreferences(userKey), ...patch };
  writeUserPreferences(userKey, next);
  return next;
}

