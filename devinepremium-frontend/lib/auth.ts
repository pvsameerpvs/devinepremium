export interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phone?: string | null;
}

export interface UserSession {
  token: string;
  user: StoredUser;
}

const USER_SESSION_KEY = "devinepremium-user-session";

export function getStoredUserSession(): UserSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(USER_SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as UserSession;
  } catch {
    window.localStorage.removeItem(USER_SESSION_KEY);
    return null;
  }
}

export function saveUserSession(session: UserSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
}

export function clearUserSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(USER_SESSION_KEY);
}
