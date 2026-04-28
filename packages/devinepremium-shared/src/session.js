function createSessionStore(storageKey, options = {}) {
  const storageType = options.storage || "localStorage";

  return {
    get() {
      if (typeof window === "undefined") {
        return null;
      }

      let raw = null;
      if (storageType === "cookie") {
        const match = document.cookie.match(new RegExp("(^| )" + storageKey + "=([^;]+)"));
        if (match) {
          raw = decodeURIComponent(match[2]);
        }
      } else {
        raw = window.localStorage.getItem(storageKey);
      }

      if (!raw) {
        return null;
      }

      try {
        return JSON.parse(raw);
      } catch {
        this.clear();
        return null;
      }
    },

    set(session) {
      if (typeof window === "undefined") {
        return;
      }

      const value = JSON.stringify(session);
      if (storageType === "cookie") {
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1); // 1 year
        document.cookie = `${storageKey}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
      } else {
        window.localStorage.setItem(storageKey, value);
      }
    },

    clear() {
      if (typeof window === "undefined") {
        return;
      }

      if (storageType === "cookie") {
        document.cookie = `${storageKey}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      } else {
        window.localStorage.removeItem(storageKey);
      }
    },
  };
}

function decodeBase64Url(value) {
  const normalized = String(value).replace(/-/g, "+").replace(/_/g, "/");
  const paddingLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized.padEnd(normalized.length + paddingLength, "=");

  if (typeof atob === "function") {
    return atob(padded);
  }

  if (typeof Buffer !== "undefined") {
    return Buffer.from(padded, "base64").toString("utf8");
  }

  throw new Error("No base64 decoder available.");
}

function getJwtExpiration(token) {
  if (typeof token !== "string") {
    return null;
  }

  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(payload));
    return typeof parsed.exp === "number" ? parsed.exp : null;
  } catch {
    return null;
  }
}

function hasTokenExpired(token, now = Date.now()) {
  const expiration = getJwtExpiration(token);

  if (typeof expiration !== "number") {
    return false;
  }

  return expiration * 1000 <= now;
}

module.exports = {
  createSessionStore,
  getJwtExpiration,
  hasTokenExpired,
};
