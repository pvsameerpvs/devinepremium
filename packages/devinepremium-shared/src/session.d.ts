export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phone?: string | null;
}

export interface AuthSession<TUser extends AuthUser = AuthUser> {
  token: string;
  user: TUser;
}

export interface SessionStore<TSession> {
  get(): TSession | null;
  set(session: TSession): void;
  clear(): void;
}

export declare function createSessionStore<TSession>(
  storageKey: string,
  options?: { storage?: "localStorage" | "cookie" },
): SessionStore<TSession>;

export declare function getJwtExpiration(token: string): number | null;

export declare function hasTokenExpired(
  token: string,
  now?: number,
): boolean;
