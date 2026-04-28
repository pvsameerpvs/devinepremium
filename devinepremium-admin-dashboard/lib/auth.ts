import {
  createSessionStore,
  hasTokenExpired,
  type AuthSession,
  type AuthUser,
} from "@devinepremium/shared";

export type AdminUser = AuthUser;
export type AdminSession = AuthSession<AdminUser>;

// We use "cookie" as the storage type so Next.js Middleware can read it
const adminSessionStore = createSessionStore<AdminSession>(
  "devinepremium-admin-session",
  { storage: "cookie" } 
);

export function getStoredAdminSession() {
  const session = adminSessionStore.get();

  if (!session) {
    return null;
  }

  // Double check expiration
  if (hasTokenExpired(session.token)) {
    adminSessionStore.clear();
    return null;
  }

  return session;
}

export const saveAdminSession = (session: AdminSession) => {
  adminSessionStore.set(session);
};

export const clearAdminSession = () => {
  adminSessionStore.clear();
};
