import {
  createSessionStore,
  type AuthSession,
  type AuthUser,
} from "@devinepremium/shared";

export type AdminUser = AuthUser;
export type AdminSession = AuthSession<AdminUser>;

const adminSessionStore = createSessionStore<AdminSession>(
  "devinepremium-admin-session",
);

export const getStoredAdminSession = adminSessionStore.get;
export const saveAdminSession = adminSessionStore.set;
export const clearAdminSession = adminSessionStore.clear;
