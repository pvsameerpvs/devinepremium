import {
  createSessionStore,
  type AuthSession,
  type AuthUser,
} from "@devinepremium/shared";

export type StoredUser = AuthUser;
export type UserSession = AuthSession<StoredUser>;

const userSessionStore = createSessionStore<UserSession>(
  "devinepremium-user-session",
);

export const getStoredUserSession = userSessionStore.get;
export const saveUserSession = userSessionStore.set;
export const clearUserSession = userSessionStore.clear;
