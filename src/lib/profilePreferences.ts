export type ProfilePreferences = {
  name: string;
  phone: string;
  address: string;
  alternateEmail: string;
};

const DEFAULT_PROFILE: ProfilePreferences = {
  name: '',
  phone: '',
  address: '',
  alternateEmail: '',
};

const keyForUser = (userKey: string) => `gem-profile:${userKey}`;

export function readProfilePreferences(
  userKey: string,
  fallback?: Partial<ProfilePreferences>
): ProfilePreferences {
  try {
    const raw = sessionStorage.getItem(keyForUser(userKey));
    const parsed = raw ? (JSON.parse(raw) as Partial<ProfilePreferences>) : {};
    return {
      ...DEFAULT_PROFILE,
      ...(fallback ?? {}),
      ...parsed,
    };
  } catch {
    return {
      ...DEFAULT_PROFILE,
      ...(fallback ?? {}),
    };
  }
}

export function patchProfilePreferences(
  userKey: string,
  patch: Partial<ProfilePreferences>
): ProfilePreferences {
  const next = { ...readProfilePreferences(userKey), ...patch };
  sessionStorage.setItem(keyForUser(userKey), JSON.stringify(next));
  return next;
}

