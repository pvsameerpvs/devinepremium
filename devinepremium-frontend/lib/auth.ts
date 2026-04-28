import {
  createSessionStore,
  hasTokenExpired,
  type AuthSession,
  type AuthUser,
} from "@devinepremium/shared";

export type StoredUser = AuthUser;
export type UserSession = AuthSession<StoredUser>;

const userSessionStore = createSessionStore<UserSession>(
  "devinepremium-user-session",
);

function isSessionAuthErrorMessage(message: string) {
  const normalized = message.trim().toLowerCase();

  return (
    normalized.includes("session expired") ||
    normalized.includes("jwt expired") ||
    normalized.includes("session is no longer valid") ||
    normalized.includes("authentication required") ||
    normalized.includes("invalid session token")
  );
}

export function getStoredUserSession() {
  const session = userSessionStore.get();

  if (!session) {
    return null;
  }

  if (hasTokenExpired(session.token)) {
    userSessionStore.clear();
    return null;
  }

  return session;
}

export const saveUserSession = userSessionStore.set;
export const clearUserSession = userSessionStore.clear;

export function isUserSessionError(error: unknown) {
  return error instanceof Error && isSessionAuthErrorMessage(error.message);
}
