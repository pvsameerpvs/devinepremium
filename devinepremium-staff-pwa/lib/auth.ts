import {
  createSessionStore,
  hasTokenExpired,
  type AuthSession,
  type AuthUser,
} from "@devinepremium/shared";

export interface StaffUser extends AuthUser {
  phone?: string | null;
}

export type StaffSession = AuthSession<StaffUser>;

const staffSessionStore = createSessionStore<StaffSession>(
  "devinepremium-staff-session",
);

export function getStoredStaffSession() {
  const session = staffSessionStore.get();

  if (!session) {
    return null;
  }

  if (hasTokenExpired(session.token)) {
    staffSessionStore.clear();
    return null;
  }

  return session;
}

export const saveStaffSession = (session: StaffSession) => {
  staffSessionStore.set(session);
};

export const clearStaffSession = () => {
  staffSessionStore.clear();
};
