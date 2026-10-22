export type WaitlistSuccess = {
  position: number;
  referralCode: string;
  referralUrl: string;
  alreadyJoined?: boolean;
};

export type SavedWaitlist = WaitlistSuccess & {
  name?: string;
  email?: string;
  joinedAt: string;
};

export const WAITLIST_STORAGE_KEY = 'shelf-waitlist-v1';
export const REFERRAL_STORAGE_KEY = 'shelf-referral';
const REFERRAL_COOKIE = 'shelf_ref';
const REFERRAL_PATTERN = /^[A-Z0-9]{4,16}$/;

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* Storage can be disabled (private mode); the flow still works without it. */
  }
}

function readCookie(name: string): string | null {
  const prefix = `${name}=`;
  const found = document.cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(prefix));
  return found ? decodeURIComponent(found.slice(prefix.length)) : null;
}

function normalizeReferral(value: string | null | undefined): string | null {
  if (!value) return null;
  const code = value.trim().toUpperCase();
  return REFERRAL_PATTERN.test(code) ? code : null;
}

/**
 * Remember the ?ref= code from a referral link for the next signup. Called on
 * page load and again when the form mounts so a client-side navigation keeps it.
 */
export function captureReferralFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  const fromUrl = normalizeReferral(new URL(window.location.href).searchParams.get('ref'));
  if (fromUrl) {
    writeStorage(REFERRAL_STORAGE_KEY, fromUrl);
    try {
      document.cookie = `${REFERRAL_COOKIE}=${encodeURIComponent(fromUrl)}; path=/; max-age=${60 * 60 * 24 * 90}; SameSite=Lax`;
    } catch {
      /* Cookies may be blocked; localStorage is enough. */
    }
    return fromUrl;
  }

  return normalizeReferral(readStorage(REFERRAL_STORAGE_KEY)) ?? normalizeReferral(readCookie(REFERRAL_COOKIE));
}

export function getReferralCode(): string | null {
  if (typeof window === 'undefined') return null;
  return normalizeReferral(readStorage(REFERRAL_STORAGE_KEY)) ?? normalizeReferral(readCookie(REFERRAL_COOKIE));
}

export function readWaitlistState(): SavedWaitlist | null {
  if (typeof window === 'undefined') return null;
  const raw = readStorage(WAITLIST_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<SavedWaitlist>;
    if (
      typeof parsed.position !== 'number' ||
      !Number.isFinite(parsed.position) ||
      typeof parsed.referralCode !== 'string' ||
      typeof parsed.referralUrl !== 'string'
    ) {
      return null;
    }
    return {
      position: parsed.position,
      referralCode: parsed.referralCode,
      referralUrl: parsed.referralUrl,
      alreadyJoined: parsed.alreadyJoined === true,
      name: typeof parsed.name === 'string' ? parsed.name : undefined,
      email: typeof parsed.email === 'string' ? parsed.email : undefined,
      joinedAt: typeof parsed.joinedAt === 'string' ? parsed.joinedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveWaitlistState(state: WaitlistSuccess, name?: string, email?: string): SavedWaitlist {
  const saved: SavedWaitlist = {
    ...state,
    name,
    email,
    joinedAt: new Date().toISOString(),
  };
  writeStorage(WAITLIST_STORAGE_KEY, JSON.stringify(saved));
  return saved;
}

export function clearWaitlistState() {
  try {
    window.localStorage.removeItem(WAITLIST_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
